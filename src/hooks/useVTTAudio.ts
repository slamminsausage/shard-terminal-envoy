import { useRef, useEffect, useCallback } from "react";
import { useVTT } from "@/contexts/VTTContext";
import { dbHelpers, supabaseDisabled } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Web Audio API hook for VTT ambient crossfade and SFX playback.
 *
 * Uploaded audio is pushed to Supabase Storage (bucket `vtt-assets`) and
 * the returned public URL is stored in the VTT state. This is what makes
 * audio persist device-to-device — storing blob: URLs or base64 data URLs
 * in localStorage is device-local and does not sync.
 *
 * When Supabase is disabled (offline dev mode) the hook falls back to
 * blob URLs for the current session only (audio will not survive a reload).
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

  // Attach a new HTMLAudioElement for an ambient slot from a persisted URL.
  // Called lazily on user gesture (play) so the AudioContext is resumable
  // on Safari/iOS. Without this, a VTT session loaded from another device
  // would have state.audio.ambientA set but no audio element to play.
  const attachAmbientElement = useCallback(
    (slot: "A" | "B", url: string) => {
      const ctx = ensureContext();
      const el = new Audio();
      el.crossOrigin = "anonymous";
      el.loop = true;
      el.src = url;

      try {
        const source = ctx.createMediaElementSource(el);
        if (slot === "A") {
          ambientAElRef.current?.pause();
          ambientASourceRef.current?.disconnect();
          source.connect(ambientAGainRef.current!);
          ambientASourceRef.current = source;
          ambientAElRef.current = el;
        } else {
          ambientBElRef.current?.pause();
          ambientBSourceRef.current?.disconnect();
          source.connect(ambientBGainRef.current!);
          ambientBSourceRef.current = source;
          ambientBElRef.current = el;
        }
      } catch (err) {
        console.warn(`Failed to attach ambient ${slot}:`, err);
      }
      return el;
    },
    [ensureContext]
  );

  // ─── Load ambient track ───────────────────────────────────────────

  const loadAmbient = useCallback(
    async (slot: "A" | "B", file: File) => {
      const ctx = ensureContext();
      const trackId = crypto.randomUUID();

      // Start playback immediately from a local blob URL while we upload.
      const localUrl = URL.createObjectURL(file);
      const el = new Audio();
      el.crossOrigin = "anonymous";
      el.loop = true;
      el.src = localUrl;

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

      if (slot === "A") {
        ambientAElRef.current?.pause();
        ambientASourceRef.current?.disconnect();

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

      el.play().catch(() => {});

      // Upload to Supabase Storage so the URL persists across devices.
      let persistentUrl: string | null = null;
      if (!supabaseDisabled) {
        try {
          persistentUrl = await dbHelpers.uploadVTTAsset(file, "audio", trackId);
        } catch (err) {
          console.error("Ambient upload failed:", err);
        }
      }

      if (!persistentUrl) {
        // Fallback: session-only blob URL. Warn the user their track won't sync.
        persistentUrl = localUrl;
        if (!supabaseDisabled) {
          toast.error(
            `Uploaded "${file.name}" will not sync across devices (upload failed).`
          );
        }
      }
      // Note: we intentionally do not revoke localUrl — the HTMLAudioElement is
      // still playing from it this session. State stores the persistent URL so
      // other devices / reloads use the Supabase URL instead.

      dispatch({
        type: "SET_AMBIENT_TRACK",
        payload: {
          slot,
          track: {
            id: trackId,
            name: file.name,
            url: persistentUrl,
            volume: 0.7,
            pan: 0,
            loop: true,
          },
        },
      });
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

  const playAmbient = useCallback((slot: "A" | "B") => {
    let el = slot === "A" ? ambientAElRef.current : ambientBElRef.current;
    if (!el) {
      // Lazy-attach from persisted state (e.g. session loaded from another device).
      const track = slot === "A" ? state.audio.ambientA : state.audio.ambientB;
      if (!track?.url) return;
      el = attachAmbientElement(slot, track.url);
    }
    ensureContext();
    el.play().catch(() => {});
  }, [ensureContext, state.audio.ambientA, state.audio.ambientB, attachAmbientElement]);

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
      const slotAssetId = `sfx-${slotIndex}`;
      const localUrl = URL.createObjectURL(file);
      const el = new Audio(localUrl);

      sfxElementsRef.current[slotIndex]?.pause();
      sfxElementsRef.current[slotIndex] = el;

      let persistentUrl: string | null = null;
      if (!supabaseDisabled) {
        try {
          persistentUrl = await dbHelpers.uploadVTTAsset(file, "audio", slotAssetId);
        } catch (err) {
          console.error("SFX upload failed:", err);
        }
      }

      if (!persistentUrl) {
        persistentUrl = localUrl;
        if (!supabaseDisabled) {
          toast.error(
            `Uploaded "${file.name}" will not sync across devices (upload failed).`
          );
        }
      }
      // See note in loadAmbient — don't revoke localUrl; the Audio element
      // is still playing from it. State stores the persistent URL.

      dispatch({
        type: "SET_SFX_SLOT",
        payload: {
          index: slotIndex,
          slot: {
            name: file.name,
            url: persistentUrl,
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
      if (track?.isLibrary && track.url) {
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
