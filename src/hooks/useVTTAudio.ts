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

  // Ambient nodes
  const ambientASourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const ambientAGainRef = useRef<GainNode | null>(null);
  const ambientAPanRef = useRef<StereoPannerNode | null>(null);
  const ambientAElRef = useRef<HTMLAudioElement | null>(null);

  const ambientBSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const ambientBGainRef = useRef<GainNode | null>(null);
  const ambientBPanRef = useRef<StereoPannerNode | null>(null);
  const ambientBElRef = useRef<HTMLAudioElement | null>(null);

  // SFX audio elements (one per slot)
  const sfxElementsRef = useRef<(HTMLAudioElement | null)[]>(
    Array(18).fill(null)
  );

  // Analyzer for visualization
  const analyzerRef = useRef<AnalyserNode | null>(null);

  // ─── Initialize AudioContext ──────────────────────────────────────

  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = state.audio.masterVolume;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const analyzer = ctx.createAnalyser();
    analyzer.fftSize = 256;
    master.connect(analyzer);
    analyzerRef.current = analyzer;

    // Ambient A chain
    const gainA = ctx.createGain();
    const panA = ctx.createStereoPanner();
    gainA.connect(panA).connect(master);
    ambientAGainRef.current = gainA;
    ambientAPanRef.current = panA;

    // Ambient B chain
    const gainB = ctx.createGain();
    const panB = ctx.createStereoPanner();
    gainB.connect(panB).connect(master);
    ambientBGainRef.current = gainB;
    ambientBPanRef.current = panB;

    return ctx;
  }, [state.audio.masterVolume]);

  // ─── Master volume sync ───────────────────────────────────────────

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = state.audio.muted
        ? 0
        : state.audio.masterVolume;
    }
  }, [state.audio.masterVolume, state.audio.muted]);

  // ─── Crossfade sync ───────────────────────────────────────────────

  useEffect(() => {
    const cf = state.audio.crossfade; // 0 = full A, 0.5 = both, 1 = full B
    if (ambientAGainRef.current) {
      const aVol = state.audio.ambientA?.volume ?? 1;
      // DJ-style crossfade: A at full until cf > 0.5, then fades
      ambientAGainRef.current.gain.value = aVol * Math.min(1, 2 * (1 - cf));
    }
    if (ambientBGainRef.current) {
      const bVol = state.audio.ambientB?.volume ?? 1;
      // B at full until cf < 0.5, then fades
      ambientBGainRef.current.gain.value = bVol * Math.min(1, 2 * cf);
    }
  }, [state.audio.crossfade, state.audio.ambientA?.volume, state.audio.ambientB?.volume]);

  // ─── Pan sync ─────────────────────────────────────────────────────

  useEffect(() => {
    if (ambientAPanRef.current && state.audio.ambientA) {
      ambientAPanRef.current.pan.value = state.audio.ambientA.pan;
    }
  }, [state.audio.ambientA?.pan]);

  useEffect(() => {
    if (ambientBPanRef.current && state.audio.ambientB) {
      ambientBPanRef.current.pan.value = state.audio.ambientB.pan;
    }
  }, [state.audio.ambientB?.pan]);

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
    [ensureContext, dispatch]
  );

  const stopAmbient = useCallback((slot: "A" | "B") => {
    if (slot === "A") {
      ambientAElRef.current?.pause();
      if (ambientAElRef.current) ambientAElRef.current.currentTime = 0;
    } else {
      ambientBElRef.current?.pause();
      if (ambientBElRef.current) ambientBElRef.current.currentTime = 0;
    }
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

  const pauseAmbient = useCallback((slot: "A" | "B") => {
    const el = slot === "A" ? ambientAElRef.current : ambientBElRef.current;
    if (el) el.pause();
  }, []);

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
      if (!slot?.url) return;

      let el = sfxElementsRef.current[slotIndex];
      if (!el) {
        el = new Audio(slot.url);
        sfxElementsRef.current[slotIndex] = el;
      }

      el.volume = slot.volume * state.audio.masterVolume;
      el.loop = slot.loop;
      el.currentTime = 0;
      el.play().catch(() => {});
    },
    [ensureContext, state.audio.sfxSlots, state.audio.masterVolume]
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

  // ─── Analyzer data ────────────────────────────────────────────────

  const getFrequencyData = useCallback(() => {
    if (!analyzerRef.current) return new Uint8Array(0);
    const data = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(data);
    return data;
  }, []);

  // ─── Cleanup ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      ambientAElRef.current?.pause();
      ambientBElRef.current?.pause();
      sfxElementsRef.current.forEach((el) => el?.pause());
      ctxRef.current?.close();
    };
  }, []);

  return {
    loadAmbient,
    stopAmbient,
    playAmbient,
    pauseAmbient,
    loadSFX,
    playSFX,
    stopSFX,
    stopAllSFX,
    getFrequencyData,
    ensureContext,
  };
}

export type VTTAudioApi = ReturnType<typeof useVTTAudio>;
