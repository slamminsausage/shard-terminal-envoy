import { useEffect, useRef, useCallback } from "react";
import type { VTTState, VTTMap, ParticleConfig, Clock, InitiativeEntry, AmbientTrack, AmbientSlot, SFXSlot } from "@/types/vtt";

/**
 * Lightweight audio state sent to presenter (only serializable fields).
 */
export interface PresenterAudioState {
  masterVolume: number;
  muted: boolean;
  ambientA: AmbientTrack | null;
  ambientB: AmbientTrack | null;
  ambientC: AmbientTrack | null;
  ambientD: AmbientTrack | null;
  sfxSlots: SFXSlot[];
}

/**
 * Campaign data sent to presenter for the player sidebar.
 */
export interface PresenterCampaignData {
  notes: { id: string; title: string; content: string; folder?: string; thumbnailUrl?: string; createdAt?: string }[];
  sessions: { id: string; title: string; summary?: string; date?: string; number?: number }[];
  handouts: { id: string; title: string; imageUrl?: string; content?: string; visible?: boolean }[];
  quests: { id: string; title: string; description?: string; status?: string; objectives?: any[] }[];
}

/**
 * Messages sent over BroadcastChannel between controller and presenter.
 * The controller sends state updates; the presenter receives and renders.
 */
export type PresenterMessage =
  | { type: "sync-map"; map: VTTMap | null }
  | { type: "sync-particles"; particles: ParticleConfig }
  | { type: "sync-fog"; mapId: string; fog: VTTMap["fog"] }
  | { type: "sync-tokens"; mapId: string; tokens: VTTMap["tokens"] }
  | { type: "sync-viewport"; mapId: string; scrollX: number; scrollY: number; zoom: number }
  | { type: "sync-clocks"; clocks: Clock[] }
  | { type: "sync-initiative"; initiative: InitiativeEntry[]; showOnPresenter: boolean }
  | { type: "sync-audio"; audio: PresenterAudioState }
  | { type: "sync-campaign"; campaign: PresenterCampaignData }
  | { type: "show-handout"; imageDataUrl: string; name: string }
  | { type: "hide-handout" }
  | { type: "dice-roll"; label: string; dice: number[]; total: number; modifier: number }
  | { type: "gm-ping"; x: number; y: number; label?: string; color?: string }
  | { type: "player-audio-command"; command: "play" | "pause" | "stop"; slot: AmbientSlot }
  | { type: "player-sfx-trigger"; index: number }
  | { type: "ping" }
  | { type: "pong" };

const CHANNEL_NAME = "shard-vtt-presenter";

/**
 * Hook for the controller side. Sends state to presenter window(s).
 */
export function usePresenterController(
  state: VTTState,
  activeMap: VTTMap | null,
  options?: {
    campaignData?: PresenterCampaignData;
    onPlayerAudioCommand?: (command: "play" | "pause" | "stop", slot: AmbientSlot) => void;
    onPlayerSfxTrigger?: (index: number) => void;
  }
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);

    // Respond to pings from presenter and handle player commands
    channelRef.current.onmessage = (e: MessageEvent<PresenterMessage>) => {
      if (e.data.type === "ping") {
        channelRef.current?.postMessage({ type: "pong" } satisfies PresenterMessage);
        // Also send full state on ping (presenter just connected)
        if (activeMap) {
          channelRef.current?.postMessage({
            type: "sync-map",
            map: activeMap,
          } satisfies PresenterMessage);
          channelRef.current?.postMessage({
            type: "sync-particles",
            particles: state.particles,
          } satisfies PresenterMessage);
          channelRef.current?.postMessage({
            type: "sync-clocks",
            clocks: state.clocks,
          } satisfies PresenterMessage);
          channelRef.current?.postMessage({
            type: "sync-initiative",
            initiative: state.initiative,
            showOnPresenter: state.showInitiativeOnPresenter ?? false,
          } satisfies PresenterMessage);
          // Send audio state on connect
          channelRef.current?.postMessage({
            type: "sync-audio",
            audio: {
              masterVolume: state.audio.masterVolume,
              muted: state.audio.muted,
              ambientA: state.audio.ambientA,
              ambientB: state.audio.ambientB,
              ambientC: state.audio.ambientC,
              ambientD: state.audio.ambientD,
              sfxSlots: state.audio.sfxSlots,
            },
          } satisfies PresenterMessage);
          // Send campaign data on connect
          if (optionsRef.current?.campaignData) {
            channelRef.current?.postMessage({
              type: "sync-campaign",
              campaign: optionsRef.current.campaignData,
            } satisfies PresenterMessage);
          }
        }
      } else if (e.data.type === "player-audio-command") {
        optionsRef.current?.onPlayerAudioCommand?.(e.data.command, e.data.slot);
      } else if (e.data.type === "player-sfx-trigger") {
        optionsRef.current?.onPlayerSfxTrigger?.(e.data.index);
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, []);

  // Send map updates when active map changes
  useEffect(() => {
    if (!channelRef.current) return;

    channelRef.current.postMessage({
      type: "sync-map",
      map: activeMap,
    } satisfies PresenterMessage);
  }, [activeMap]);

  // Send particle config changes
  useEffect(() => {
    channelRef.current?.postMessage({
      type: "sync-particles",
      particles: state.particles,
    } satisfies PresenterMessage);
  }, [state.particles]);

  // Send clock updates
  useEffect(() => {
    channelRef.current?.postMessage({
      type: "sync-clocks",
      clocks: state.clocks,
    } satisfies PresenterMessage);
  }, [state.clocks]);

  // Send initiative updates
  useEffect(() => {
    channelRef.current?.postMessage({
      type: "sync-initiative",
      initiative: state.initiative,
      showOnPresenter: state.showInitiativeOnPresenter ?? false,
    } satisfies PresenterMessage);
  }, [state.initiative, state.showInitiativeOnPresenter]);

  // Send audio state updates
  useEffect(() => {
    channelRef.current?.postMessage({
      type: "sync-audio",
      audio: {
        masterVolume: state.audio.masterVolume,
        muted: state.audio.muted,
        ambientA: state.audio.ambientA,
        ambientB: state.audio.ambientB,
        ambientC: state.audio.ambientC,
        ambientD: state.audio.ambientD,
        sfxSlots: state.audio.sfxSlots,
      },
    } satisfies PresenterMessage);
  }, [state.audio.masterVolume, state.audio.muted, state.audio.ambientA, state.audio.ambientB, state.audio.ambientC, state.audio.ambientD, state.audio.sfxSlots]);

  // Send campaign data updates
  useEffect(() => {
    if (options?.campaignData) {
      channelRef.current?.postMessage({
        type: "sync-campaign",
        campaign: options.campaignData,
      } satisfies PresenterMessage);
    }
  }, [options?.campaignData]);

  const showHandout = useCallback((imageDataUrl: string, name: string) => {
    channelRef.current?.postMessage({
      type: "show-handout",
      imageDataUrl,
      name,
    } satisfies PresenterMessage);
  }, []);

  const hideHandout = useCallback(() => {
    channelRef.current?.postMessage({
      type: "hide-handout",
    } satisfies PresenterMessage);
  }, []);

  const broadcastDiceRoll = useCallback(
    (label: string, dice: number[], total: number, modifier: number) => {
      channelRef.current?.postMessage({
        type: "dice-roll",
        label,
        dice,
        total,
        modifier,
      } satisfies PresenterMessage);
    },
    []
  );

  const broadcastPing = useCallback((x: number, y: number, label?: string, color?: string) => {
    channelRef.current?.postMessage({
      type: "gm-ping",
      x,
      y,
      label,
      color,
    } satisfies PresenterMessage);
  }, []);

  return { showHandout, hideHandout, broadcastDiceRoll, broadcastPing };
}

/**
 * Hook for the presenter side. Receives state from controller.
 */
export interface PresenterReceiverCallbacks {
  onMapSync: (map: VTTMap | null) => void;
  onParticlesSync: (particles: ParticleConfig) => void;
  onShowHandout: (imageDataUrl: string, name: string) => void;
  onHideHandout: () => void;
  onDiceRoll?: (label: string, dice: number[], total: number, modifier: number) => void;
  onClocksSync?: (clocks: Clock[]) => void;
  onInitiativeSync?: (initiative: InitiativeEntry[], showOnPresenter: boolean) => void;
  onGmPing?: (x: number, y: number, label?: string, color?: string) => void;
  onAudioSync?: (audio: PresenterAudioState) => void;
  onCampaignSync?: (campaign: PresenterCampaignData) => void;
}

export function usePresenterReceiver(
  onMapSync: (map: VTTMap | null) => void,
  onParticlesSync: (particles: ParticleConfig) => void,
  onShowHandout: (imageDataUrl: string, name: string) => void,
  onHideHandout: () => void,
  onDiceRoll?: (label: string, dice: number[], total: number, modifier: number) => void,
  onClocksSync?: (clocks: Clock[]) => void,
  onInitiativeSync?: (initiative: InitiativeEntry[], showOnPresenter: boolean) => void,
  onGmPing?: (x: number, y: number, label?: string, color?: string) => void,
  onAudioSync?: (audio: PresenterAudioState) => void,
  onCampaignSync?: (campaign: PresenterCampaignData) => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Use refs for callbacks to avoid re-creating the channel on every render
  const callbacksRef = useRef({ onMapSync, onParticlesSync, onShowHandout, onHideHandout, onDiceRoll, onClocksSync, onInitiativeSync, onGmPing, onAudioSync, onCampaignSync });
  callbacksRef.current = { onMapSync, onParticlesSync, onShowHandout, onHideHandout, onDiceRoll, onClocksSync, onInitiativeSync, onGmPing, onAudioSync, onCampaignSync };

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);

    channelRef.current.onmessage = (e: MessageEvent<PresenterMessage>) => {
      const cb = callbacksRef.current;
      switch (e.data.type) {
        case "sync-map":
          cb.onMapSync(e.data.map);
          break;
        case "sync-particles":
          cb.onParticlesSync(e.data.particles);
          break;
        case "show-handout":
          cb.onShowHandout(e.data.imageDataUrl, e.data.name);
          break;
        case "hide-handout":
          cb.onHideHandout();
          break;
        case "dice-roll":
          cb.onDiceRoll?.(e.data.label, e.data.dice, e.data.total, e.data.modifier);
          break;
        case "sync-clocks":
          cb.onClocksSync?.(e.data.clocks);
          break;
        case "sync-initiative":
          cb.onInitiativeSync?.(e.data.initiative, e.data.showOnPresenter);
          break;
        case "gm-ping":
          cb.onGmPing?.(e.data.x, e.data.y, e.data.label, e.data.color);
          break;
        case "sync-audio":
          cb.onAudioSync?.(e.data.audio);
          break;
        case "sync-campaign":
          cb.onCampaignSync?.(e.data.campaign);
          break;
        case "pong":
          // Controller is alive
          break;
      }
    };

    // Ping controller on mount
    channelRef.current.postMessage({ type: "ping" } satisfies PresenterMessage);

    return () => {
      channelRef.current?.close();
    };
  }, []);

  /**
   * Send a message back to the controller (player→GM direction).
   */
  const sendToController = useCallback((msg: PresenterMessage) => {
    channelRef.current?.postMessage(msg);
  }, []);

  return { sendToController };
}
