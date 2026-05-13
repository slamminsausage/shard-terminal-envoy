import { useRef, useEffect, useCallback } from "react";
import { useVTT } from "@/contexts/VTTContext";
import type { AmbientSlot } from "@/types/vtt";
import { toast } from "sonner";
import { dbHelpers } from "@/lib/supabase";

const SLOTS: AmbientSlot[] = ["A", "B", "C", "D"];

/**
 * Web Audio API hook for VTT audio system.
 * Supports 4 ambient channels with independent volume/pan, SFX soundboard,
 * and built-in library track loading.
 */
export function useVTTAudio() {
  const { state, dispatch } = useVTT();
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Per-channel refs (keyed by slot letter)
  const ambientSourceRefs = useRef<Record<AmbientSlot, MediaElementAudioSourceNode | null>>({
    A: null, B: null, C: null, D: null,
  });
  const ambientGainRefs = useRef<Record<AmbientSlot, GainNode | null>>({
    A: null, B: null, C: null, D: null,
  });
  const ambientPanRefs = useRef<Record<AmbientSlot, StereoPannerNode | null>>({
    A: null, B: null, C: null, D: null,
  });
  const ambientElRefs = useRef<Record<AmbientSlot, HTMLAudioElement | null>>({
    A: null, B: null, C: null, D: null,
  });

  // SFX audio elements
  const sfxElementsRef = useRef<(HTMLAudioElement | null)[]>(
    Array(18).fill(null)
  );

  // Analyzer for visualization
  const analyzerRef = useRef<AnalyserNode | null>(null);

  // Ref to track current master volume without causing callback identity changes
  const masterVolumeRef = useRef(state.audio.masterVolume);
  masterVolumeRef.current = state.audio.masterVolume;

  // Suppresses the volume-sync effect while a crossfade ramp is running
  // (assigning gain.value cancels any scheduled Web Audio automations)
  const crossfadeActiveRef = useRef(false);

  // Track whether we've already shown the autoplay toast
  const autoplayWarningShown = useRef(false);

  // ─── Initialize AudioContext ──────────────────────────────────────

  const ensureContext = useCallback(() => {
    if (ctxRef.current) {
      // Resume if browser suspended it (autoplay policy)
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {});
      }
      return ctxRef.current;
    }
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Resume immediately — will succeed if called from a user gesture
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const master = ctx.createGain();
    master.gain.value = masterVolumeRef.current;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const analyzer = ctx.createAnalyser();
    analyzer.fftSize = 256;
    master.connect(analyzer);
    analyzerRef.current = analyzer;

    // Create gain + pan chains for all 4 channels
    for (const slot of SLOTS) {
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      gain.connect(pan).connect(master);
      ambientGainRefs.current[slot] = gain;
      ambientPanRefs.current[slot] = pan;
    }

    return ctx;
  }, []);

  /** Attempt to play an audio element; show a one-time toast if blocked by autoplay policy */
  const tryPlay = useCallback((el: HTMLAudioElement) => {
    el.play().catch((e: DOMException) => {
      if (e.name === "NotAllowedError") {
        if (!autoplayWarningShown.current) {
          autoplayWarningShown.current = true;
          toast.info("Click anywhere on the page to enable audio playback");
        }
      } else {
        console.warn("Audio play failed:", e);
      }
    });
  }, []);

  // ─── Master volume sync ───────────────────────────────────────────

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = state.audio.muted
        ? 0
        : state.audio.masterVolume;
    }
  }, [state.audio.masterVolume, state.audio.muted]);

  // ─── Per-channel volume sync ──────────────────────────────────────

  const getTrack = useCallback((slot: AmbientSlot) => {
    return state.audio[`ambient${slot}` as keyof typeof state.audio] as (typeof state.audio.ambientA);
  }, [state.audio]);

  useEffect(() => {
    // Skip during crossfade — assigning gain.value would cancel the ramp automation
    if (crossfadeActiveRef.current) return;
    for (const slot of SLOTS) {
      const gain = ambientGainRefs.current[slot];
      const track = state.audio[`ambient${slot}` as keyof typeof state.audio] as (typeof state.audio.ambientA);
      if (gain) {
        gain.gain.value = track?.volume ?? 0;
      }
    }
  }, [
    state.audio.ambientA?.volume,
    state.audio.ambientB?.volume,
    state.audio.ambientC?.volume,
    state.audio.ambientD?.volume,
  ]);

  // ─── Per-channel pan sync ─────────────────────────────────────────

  useEffect(() => {
    for (const slot of SLOTS) {
      const pan = ambientPanRefs.current[slot];
      const track = state.audio[`ambient${slot}` as keyof typeof state.audio] as (typeof state.audio.ambientA);
      if (pan && track) {
        pan.pan.value = track.pan;
      }
    }
  }, [
    state.audio.ambientA?.pan,
    state.audio.ambientB?.pan,
    state.audio.ambientC?.pan,
    state.audio.ambientD?.pan,
  ]);

  // ─── Crossfade helper ────────────────────────────────────────────

  const CROSSFADE_MS = 1500;

  /** Fade out the old track on a slot, then clean up its audio nodes */
  const fadeOutOldTrack = useCallback((slot: AmbientSlot) => {
    const oldEl = ambientElRefs.current[slot];
    const oldSource = ambientSourceRefs.current[slot];
    const oldGain = ambientGainRefs.current[slot];

    if (!oldEl || !oldGain) return;

    // Create a temporary gain node for the fade-out so the channel gain stays intact
    const ctx = ctxRef.current;
    if (!ctx) { oldEl.pause(); oldSource?.disconnect(); return; }

    const fadeGain = ctx.createGain();
    fadeGain.gain.setValueAtTime(oldGain.gain.value, ctx.currentTime);
    fadeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + CROSSFADE_MS / 1000);

    // Re-route old source through fade gain
    oldSource?.disconnect();
    oldSource?.connect(fadeGain);
    fadeGain.connect(oldGain);
    oldGain.connect(ambientPanRefs.current[slot]!);

    // Clean up after fade completes
    setTimeout(() => {
      oldEl.pause();
      oldSource?.disconnect();
      fadeGain.disconnect();
    }, CROSSFADE_MS);
  }, []);

  // ─── Load ambient track ───────────────────────────────────────────

  const loadAmbient = useCallback(
    async (slot: AmbientSlot, file: File) => {
      const ctx = ensureContext();
      const trackId = crypto.randomUUID();

      // Upload to Supabase Storage so the track survives a reload and is
      // reachable from other devices.
      let url: string | null = null;
      try {
        url = await dbHelpers.uploadVTTAudioFile(file, trackId);
      } catch (e) {
        console.warn("Failed to upload ambient track to Supabase:", e);
      }

      if (!url) {
        toast.error("Failed to upload audio track. Check your connection and try again.");
        return;
      }

      // Crossfade out old track if one is playing
      if (ambientElRefs.current[slot] && !ambientElRefs.current[slot]!.paused) {
        fadeOutOldTrack(slot);
      } else {
        ambientElRefs.current[slot]?.pause();
        ambientSourceRefs.current[slot]?.disconnect();
      }

      const el = new Audio();
      el.crossOrigin = "anonymous";
      el.loop = true;
      el.src = url;

      const source = ctx.createMediaElementSource(el);
      source.connect(ambientGainRefs.current[slot]!);
      ambientSourceRefs.current[slot] = source;
      ambientElRefs.current[slot] = el;

      dispatch({
        type: "SET_AMBIENT_TRACK",
        payload: {
          slot,
          track: {
            id: trackId,
            name: file.name,
            url,
            volume: 0.7,
            pan: 0,
            loop: true,
            isLibrary: false,
          },
        },
      });

      tryPlay(el);
    },
    [ensureContext, dispatch, fadeOutOldTrack, tryPlay]
  );

  /** Load a built-in library track (from public/audio/) into a channel */
  const loadLibraryTrack = useCallback(
    (slot: AmbientSlot, path: string, name: string) => {
      const ctx = ensureContext();

      // Crossfade out old track if one is playing
      if (ambientElRefs.current[slot] && !ambientElRefs.current[slot]!.paused) {
        fadeOutOldTrack(slot);
      } else {
        ambientElRefs.current[slot]?.pause();
        ambientSourceRefs.current[slot]?.disconnect();
      }

      const el = new Audio();
      el.crossOrigin = "anonymous";
      el.loop = true;
      el.src = path;

      const source = ctx.createMediaElementSource(el);
      source.connect(ambientGainRefs.current[slot]!);
      ambientSourceRefs.current[slot] = source;
      ambientElRefs.current[slot] = el;

      dispatch({
        type: "SET_AMBIENT_TRACK",
        payload: {
          slot,
          track: {
            id: crypto.randomUUID(),
            name,
            url: path,
            volume: 0.7,
            pan: 0,
            loop: true,
            isLibrary: true,
          },
        },
      });

      tryPlay(el);
    },
    [ensureContext, dispatch, fadeOutOldTrack, tryPlay]
  );

  /** Load a library track into an SFX slot */
  const loadLibrarySFX = useCallback(
    (slotIndex: number, path: string, name: string) => {
      const el = new Audio(path);
      sfxElementsRef.current[slotIndex]?.pause();
      sfxElementsRef.current[slotIndex] = el;

      dispatch({
        type: "SET_SFX_SLOT",
        payload: {
          index: slotIndex,
          slot: {
            name,
            url: path,
            isLibrary: true,
          },
        },
      });
    },
    [dispatch]
  );

  const stopAmbient = useCallback((slot: AmbientSlot) => {
    ambientElRefs.current[slot]?.pause();
    if (ambientElRefs.current[slot]) ambientElRefs.current[slot]!.currentTime = 0;
    // Don't clear the track from state — just stop playback so it stays in the slot
  }, []);

  const removeAmbient = useCallback((slot: AmbientSlot) => {
    ambientElRefs.current[slot]?.pause();
    ambientSourceRefs.current[slot]?.disconnect();
    ambientSourceRefs.current[slot] = null;
    ambientElRefs.current[slot] = null;
    dispatch({ type: "SET_AMBIENT_TRACK", payload: { slot, track: null } });
  }, [dispatch]);

  const playAmbient = useCallback((slot: AmbientSlot) => {
    const el = ambientElRefs.current[slot];
    if (el) {
      ensureContext();
      tryPlay(el);
    } else {
      // If no element but there's a track with a persistent URL in state
      // (library or uploaded-to-Supabase), reload it.
      const track = getTrack(slot);
      if (track?.url && !track.url.startsWith("blob:")) {
        loadLibraryTrack(slot, track.url, track.name);
      }
    }
  }, [ensureContext, tryPlay, getTrack, loadLibraryTrack]);

  const pauseAmbient = useCallback((slot: AmbientSlot) => {
    const el = ambientElRefs.current[slot];
    if (el) el.pause();
  }, []);

  /** Activate a playlist — load all its channels and start playing */
  const activatePlaylist = useCallback((playlistId: string) => {
    const playlist = (state.audio.playlists || []).find((p) => p.id === playlistId);
    if (!playlist) return;

    // Stop all current channels
    for (const slot of SLOTS) {
      ambientElRefs.current[slot]?.pause();
      ambientSourceRefs.current[slot]?.disconnect();
      ambientSourceRefs.current[slot] = null;
      ambientElRefs.current[slot] = null;
    }

    // Dispatch state update (sets all channels at once)
    dispatch({ type: "ACTIVATE_PLAYLIST", payload: playlistId });

    // Re-initialize audio elements for tracks with URLs
    const ctx = ensureContext();
    for (const slot of SLOTS) {
      const track = playlist.channels[slot];
      if (track?.url) {
        const el = new Audio();
        el.crossOrigin = "anonymous";
        el.loop = track.loop;
        el.src = track.url;
        const source = ctx.createMediaElementSource(el);
        source.connect(ambientGainRefs.current[slot]!);
        ambientSourceRefs.current[slot] = source;
        ambientElRefs.current[slot] = el;
        tryPlay(el);
      }
    }
  }, [state.audio.playlists, dispatch, ensureContext, tryPlay]);

  /** Save current channel configuration as a new playlist */
  const saveAsPlaylist = useCallback((name: string) => {
    const playlist = {
      id: crypto.randomUUID(),
      name,
      channels: {
        A: state.audio.ambientA ? { ...state.audio.ambientA } : null,
        B: state.audio.ambientB ? { ...state.audio.ambientB } : null,
        C: state.audio.ambientC ? { ...state.audio.ambientC } : null,
        D: state.audio.ambientD ? { ...state.audio.ambientD } : null,
      },
    };
    dispatch({ type: "ADD_PLAYLIST", payload: playlist });
    return playlist;
  }, [state.audio, dispatch]);

  // ─── SFX ──────────────────────────────────────────────────────────

  const loadSFX = useCallback(
    async (slotIndex: number, file: File) => {
      // Each upload gets a unique trackId so two campaigns/devices using the
      // same slot index don't overwrite each other in Supabase Storage. (Old
      // sfx-slot-N keying meant Campaign B replacing slot 3 silently clobbered
      // Campaign A's audio at the same URL.) Old per-slot files are now
      // orphaned in Storage; rely on a periodic janitor or Supabase TTL.
      const trackId = `sfx-${crypto.randomUUID()}`;
      let url: string | null = null;
      try {
        url = await dbHelpers.uploadVTTAudioFile(file, trackId);
      } catch (e) {
        console.warn("Failed to upload SFX to Supabase:", e);
      }

      if (!url) {
        toast.error("Failed to upload SFX. Check your connection and try again.");
        return;
      }

      const el = new Audio(url);
      el.crossOrigin = "anonymous";
      sfxElementsRef.current[slotIndex]?.pause();
      sfxElementsRef.current[slotIndex] = el;

      dispatch({
        type: "SET_SFX_SLOT",
        payload: {
          index: slotIndex,
          slot: {
            name: file.name,
            url,
            isLibrary: false,
          },
        },
      });
    },
    [dispatch]
  );

  const playSFX = useCallback(
    (slotIndex: number) => {
      ensureContext();
      const slot = state.audio.sfxSlots[slotIndex];
      if (!slot?.url && !slot?.name) return;

      let el = sfxElementsRef.current[slotIndex];
      if (!el && slot.url) {
        el = new Audio(slot.url);
        sfxElementsRef.current[slotIndex] = el;
      }

      if (el) {
        el.volume = (slot.volume ?? 0.7) * state.audio.masterVolume;
        el.loop = slot.loop;
        el.currentTime = 0;
        tryPlay(el);
      }
    },
    [ensureContext, tryPlay, state.audio.sfxSlots, state.audio.masterVolume]
  );

  const stopSFX = useCallback((slotIndex: number) => {
    const el = sfxElementsRef.current[slotIndex];
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, []);

  const stopAllSFX = useCallback(() => {
    sfxElementsRef.current.forEach((el) => {
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    });
  }, []);

  // ─── Channel crossfade ────────────────────────────────────────────

  /**
   * Smoothly fade channel `fromSlot` out and channel `toSlot` in over
   * `durationMs` milliseconds using Web Audio gain automation.
   *
   * Both channels must have a track loaded. The TO channel is auto-started
   * (from volume 0) if it is currently paused.
   */
  const crossfadeChannels = useCallback(
    (fromSlot: AmbientSlot, toSlot: AmbientSlot, durationMs: number) => {
      const ctx = ctxRef.current || ensureContext();
      const fromGain = ambientGainRefs.current[fromSlot];
      const toGain = ambientGainRefs.current[toSlot];
      if (!fromGain || !toGain) return;

      const fromTrack = state.audio[`ambient${fromSlot}` as keyof typeof state.audio] as (typeof state.audio.ambientA);
      const toTrack = state.audio[`ambient${toSlot}` as keyof typeof state.audio] as (typeof state.audio.ambientA);
      if (!fromTrack || !toTrack) return;

      const durationSec = durationMs / 1000;
      const now = ctx.currentTime;
      const fromCurrentVol = fromGain.gain.value;
      const toTargetVol = toTrack.volume > 0 ? toTrack.volume : 0.7;

      // Ensure TO channel element exists and is playing
      const toEl = ambientElRefs.current[toSlot];
      if (toEl) {
        if (toEl.paused) {
          // Start at 0 so the ramp controls the fade-in
          toGain.gain.setValueAtTime(0, now);
          tryPlay(toEl);
        }
      } else if (toTrack.url && !toTrack.url.startsWith("blob:")) {
        // Silently reload and start at 0
        const el = new Audio();
        el.crossOrigin = "anonymous";
        el.loop = toTrack.loop;
        el.src = toTrack.url;
        const source = ctx.createMediaElementSource(el);
        source.connect(toGain);
        ambientSourceRefs.current[toSlot] = source;
        ambientElRefs.current[toSlot] = el;
        toGain.gain.setValueAtTime(0, now);
        tryPlay(el);
      }

      // Suppress React volume-sync effect for the duration
      crossfadeActiveRef.current = true;

      // Schedule gain ramps
      fromGain.gain.cancelScheduledValues(now);
      fromGain.gain.setValueAtTime(fromCurrentVol, now);
      fromGain.gain.linearRampToValueAtTime(0, now + durationSec);

      toGain.gain.cancelScheduledValues(now);
      toGain.gain.setValueAtTime(toGain.gain.value, now);
      toGain.gain.linearRampToValueAtTime(toTargetVol, now + durationSec);

      // After the ramp completes: sync state volumes and pause the FROM channel
      setTimeout(() => {
        crossfadeActiveRef.current = false;

        // Pause the channel that was faded out
        ambientElRefs.current[fromSlot]?.pause();

        // Sync state so sliders reflect the new volumes
        dispatch({
          type: "SET_AMBIENT_TRACK",
          payload: { slot: fromSlot, track: { ...fromTrack, volume: 0 } },
        });
        dispatch({
          type: "SET_AMBIENT_TRACK",
          payload: { slot: toSlot, track: { ...toTrack, volume: toTargetVol } },
        });
      }, durationMs + 100);
    },
    [state.audio, dispatch, ensureContext, tryPlay]
  );

  // ─── Audio ducking (lower music when handouts/videos play) ───────

  const duckingRef = useRef(false);

  const duckAudio = useCallback(() => {
    if (duckingRef.current) return;
    duckingRef.current = true;
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (ctx && master) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(
        master.gain.value * 0.15,
        ctx.currentTime + 0.5
      );
    }
  }, []);

  const unduckAudio = useCallback(() => {
    if (!duckingRef.current) return;
    duckingRef.current = false;
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (ctx && master) {
      const target = state.audio.muted ? 0 : masterVolumeRef.current;
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.5);
    }
  }, [state.audio.muted]);

  // ─── Analyzer data ────────────────────────────────────────────────

  const getFrequencyData = useCallback(() => {
    if (!analyzerRef.current) return new Uint8Array(0);
    const data = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(data);
    return data;
  }, []);

  // ─── Reconnect persisted library tracks on mount ─────────────────
  // After a page refresh, the track metadata (name, url, isLibrary) persists
  // in state but the HTMLAudioElement refs are null. Recreate them so tracks
  // are immediately playable without the user having to remove and re-add.

  const reconnectedRef = useRef(false);
  useEffect(() => {
    if (reconnectedRef.current) return;
    reconnectedRef.current = true;

    for (const slot of SLOTS) {
      if (ambientElRefs.current[slot]) continue; // already has an element
      const track = state.audio[`ambient${slot}` as keyof typeof state.audio] as (typeof state.audio.ambientA);
      if (track?.url && !track.url.startsWith('blob:')) {
        // Silently recreate the Audio element + Web Audio nodes.
        // Don't auto-play — the user will click play when ready.
        const ctx = ensureContext();
        const el = new Audio();
        el.crossOrigin = "anonymous";
        el.loop = track.loop;
        el.src = track.url;

        const source = ctx.createMediaElementSource(el);
        source.connect(ambientGainRefs.current[slot]!);
        ambientSourceRefs.current[slot] = source;
        ambientElRefs.current[slot] = el;

        // Apply persisted volume / pan
        if (ambientGainRefs.current[slot]) {
          ambientGainRefs.current[slot]!.gain.value = track.volume ?? 0.7;
        }
        if (ambientPanRefs.current[slot]) {
          ambientPanRefs.current[slot]!.pan.value = track.pan ?? 0;
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Cleanup ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      for (const slot of SLOTS) {
        ambientElRefs.current[slot]?.pause();
      }
      sfxElementsRef.current.forEach((el) => el?.pause());
      ctxRef.current?.close();
    };
  }, []);

  return {
    loadAmbient,
    loadLibraryTrack,
    loadLibrarySFX,
    stopAmbient,
    removeAmbient,
    playAmbient,
    pauseAmbient,
    crossfadeChannels,
    activatePlaylist,
    saveAsPlaylist,
    loadSFX,
    playSFX,
    stopSFX,
    stopAllSFX,
    getFrequencyData,
    ensureContext,
    duckAudio,
    unduckAudio,
  };
}

export type VTTAudioApi = ReturnType<typeof useVTTAudio>;
