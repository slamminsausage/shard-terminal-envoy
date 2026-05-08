import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import VTTCanvas from "@/components/vtt/VTTCanvas";
import VTTToolbar from "@/components/vtt/VTTToolbar";
import VTTRightToolbar from "@/components/vtt/VTTRightToolbar";
import VTTSidebar from "@/components/vtt/VTTSidebar";
import VTTPlayerView from "@/components/vtt/VTTPlayerView";
import VTTAlignmentBar from "@/components/vtt/VTTAlignmentBar";
import VTTShortcutOverlay from "@/components/vtt/VTTShortcutOverlay";
import { useVTT } from "@/contexts/VTTContext";
import { useVTTParticles } from "@/hooks/useVTTParticles";
import { useVTTKeyboard } from "@/hooks/useVTTKeyboard";
import { usePresenterController } from "@/hooks/useVTTPresenter";
import type { PresenterCampaignData } from "@/hooks/useVTTPresenter";
import { useVTTAudioApi } from "@/contexts/VTTAudioContext";
import { useCampaign } from "@/contexts/CampaignContext";
import { useNotes } from "@/contexts/NotesContext";
import { useSession } from "@/contexts/SessionContext";
import { useQuest } from "@/contexts/QuestContext";

function VTTInterface() {
  const { isGM } = useCampaign();
  const { state, activeMap } = useVTT();
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas } = useVTTParticles(state.particles);

  // Shortcut overlay
  const [showShortcuts, setShowShortcuts] = useState(false);
  const toggleShortcuts = useCallback(() => setShowShortcuts((v) => !v), []);

  // Keyboard shortcuts (GM only)
  useVTTKeyboard(toggleShortcuts);

  // Audio engine lives in App.tsx (VTTAudioEngine) so it persists across tab switches
  const audioApi = useVTTAudioApi();

  // Gather campaign data for presenter sync
  const notesCtx = useNotes();
  const sessionCtx = useSession();
  const questsCtx = useQuest();

  // Fetch objectives for active quests so they appear in the presenter
  useEffect(() => {
    const quests = questsCtx?.quests || [];
    quests.forEach((q: any) => {
      if (!questsCtx.questObjectives[q.id]) {
        questsCtx.getQuestObjectives(q.id);
      }
    });
  }, [questsCtx?.quests]);

  const campaignData = useMemo<PresenterCampaignData>(() => ({
    notes: (notesCtx?.playerNotes || []).map((n: any) => ({
      id: n.id, title: n.title, content: n.content || "", folder: n.folder, thumbnailUrl: n.thumbnailUrl, createdAt: n.createdAt,
    })),
    sessions: (sessionCtx?.sessions || []).map((s: any) => ({
      id: s.id, title: s.title, summary: s.summary, date: s.session_date, number: s.session_number,
    })),
    handouts: (notesCtx?.handouts || []).map((h: any) => ({
      id: h.id, title: h.title, imageUrl: h.mediaUrl, content: h.content, visible: h.isVisible !== false,
    })),
    quests: (questsCtx?.quests || []).map((q: any) => ({
      id: q.id, title: q.title, description: q.description, status: q.status,
      objectives: (questsCtx.questObjectives[q.id] || []).map((obj: any) => ({
        id: obj.id, title: obj.title, description: obj.description,
        status: obj.status, order_index: obj.order_index,
        is_optional: obj.is_optional,
        progress_current: obj.progress_current,
        progress_required: obj.progress_required,
      })),
    })),
  }), [notesCtx?.playerNotes, notesCtx?.handouts, sessionCtx?.sessions, questsCtx?.quests, questsCtx?.questObjectives]);

  // Player audio command handlers
  const onPlayerAudioCommand = useCallback((command: "play" | "pause" | "stop", slot: any) => {
    if (command === "play") audioApi.playAmbient(slot);
    else if (command === "pause") audioApi.pauseAmbient(slot);
    else if (command === "stop") audioApi.stopAmbient(slot);
  }, [audioApi]);

  const onPlayerSfxTrigger = useCallback((index: number) => {
    audioApi.playSFX(index);
  }, [audioApi]);

  // Presenter mode broadcast (GM only)
  const { broadcastPing } = usePresenterController(state, activeMap, {
    campaignData,
    onPlayerAudioCommand,
    onPlayerSfxTrigger,
  });

  // Duck audio when handouts are shown on the presenter
  useEffect(() => {
    const channel = new BroadcastChannel("shard-vtt-presenter");
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "show-handout") {
        audioApi.duckAudio();
      } else if (e.data?.type === "hide-handout") {
        audioApi.unduckAudio();
      }
    };
    channel.addEventListener("message", handler);
    return () => {
      channel.removeEventListener("message", handler);
      channel.close();
    };
  }, [audioApi]);

  // Resize particle canvas to match container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = particleCanvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Connect particle canvas - re-run when particles toggle on/off
  useEffect(() => {
    setCanvas(particleCanvasRef.current);
  }, [setCanvas, state.particles.enabled]);

  // Players see the presenter view (read-only map display)
  if (!isGM) {
    return (
      <div className="flex h-full min-h-0 w-full overflow-hidden bg-black">
        <VTTPlayerView />
      </div>
    );
  }

  return (
      <div className="flex h-full min-h-0 w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(58, 226, 179,0.02) 0%, var(--bg-panel) 40%, var(--bg-dark) 100%)' }}>
        {/* Left toolbar — tools only */}
        <VTTToolbar />

        {/* Main canvas area */}
        <div ref={containerRef} className="flex-1 relative min-w-0">
          <VTTCanvas broadcastPing={broadcastPing} />
          <VTTAlignmentBar />

          {/* Particle overlay - always mounted, visibility controlled via CSS */}
          <canvas
            ref={particleCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              zIndex: 10,
              display: state.particles.enabled ? "block" : "none",
            }}
          />
        </div>

        {/* Right sidebar panel (opens when a panel is selected) */}
        <VTTSidebar />

        {/* Right toolbar — panel buttons with labels */}
        <VTTRightToolbar />

        {/* Shortcut overlay */}
        {showShortcuts && <VTTShortcutOverlay onClose={toggleShortcuts} />}
      </div>
  );
}

export default React.memo(VTTInterface);
