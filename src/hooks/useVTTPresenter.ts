import { useEffect, useRef, useCallback } from "react";
import type { VTTState, VTTMap, ParticleConfig, Clock, InitiativeEntry } from "@/types/vtt";

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
  | { type: "show-handout"; imageDataUrl: string; name: string }
  | { type: "hide-handout" }
  | { type: "dice-roll"; label: string; dice: number[]; total: number; modifier: number }
  | { type: "gm-ping"; x: number; y: number; label?: string; color?: string }
  | { type: "ping" }
  | { type: "pong" };

const CHANNEL_NAME = "shard-vtt-presenter";

/**
 * Hook for the controller side. Sends state to presenter window(s).
 */
export function usePresenterController(state: VTTState, activeMap: VTTMap | null) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);

    // Respond to pings from presenter
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
        }
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
export function usePresenterReceiver(
  onMapSync: (map: VTTMap | null) => void,
  onParticlesSync: (particles: ParticleConfig) => void,
  onShowHandout: (imageDataUrl: string, name: string) => void,
  onHideHandout: () => void,
  onDiceRoll?: (label: string, dice: number[], total: number, modifier: number) => void,
  onClocksSync?: (clocks: Clock[]) => void,
  onInitiativeSync?: (initiative: InitiativeEntry[], showOnPresenter: boolean) => void,
  onGmPing?: (x: number, y: number, label?: string, color?: string) => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);

    channelRef.current.onmessage = (e: MessageEvent<PresenterMessage>) => {
      switch (e.data.type) {
        case "sync-map":
          onMapSync(e.data.map);
          break;
        case "sync-particles":
          onParticlesSync(e.data.particles);
          break;
        case "show-handout":
          onShowHandout(e.data.imageDataUrl, e.data.name);
          break;
        case "hide-handout":
          onHideHandout();
          break;
        case "dice-roll":
          onDiceRoll?.(e.data.label, e.data.dice, e.data.total, e.data.modifier);
          break;
        case "sync-clocks":
          onClocksSync?.(e.data.clocks);
          break;
        case "sync-initiative":
          onInitiativeSync?.(e.data.initiative, e.data.showOnPresenter);
          break;
        case "gm-ping":
          onGmPing?.(e.data.x, e.data.y, e.data.label, e.data.color);
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
  }, [onMapSync, onParticlesSync, onShowHandout, onHideHandout, onDiceRoll, onClocksSync, onInitiativeSync, onGmPing]);
}
