import { useEffect, useRef } from "react";
import VTTCanvas from "@/components/vtt/VTTCanvas";
import VTTToolbar from "@/components/vtt/VTTToolbar";
import VTTSidebar from "@/components/vtt/VTTSidebar";
import { useVTT } from "@/contexts/VTTContext";
import { useVTTParticles } from "@/hooks/useVTTParticles";
import { useVTTKeyboard } from "@/hooks/useVTTKeyboard";
import { usePresenterController } from "@/hooks/useVTTPresenter";
import { useVTTAudio } from "@/hooks/useVTTAudio";
import { VTTAudioProvider } from "@/contexts/VTTAudioContext";

export default function VTTInterface() {
  const { state, activeMap } = useVTT();
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas } = useVTTParticles(state.particles);

  // Keyboard shortcuts
  useVTTKeyboard();

  // Presenter mode broadcast
  const { broadcastPing } = usePresenterController(state, activeMap);

  // Audio - hoisted here so it persists across sidebar panel changes
  const audioApi = useVTTAudio();

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

  return (
    <VTTAudioProvider value={audioApi}>
      <div className="flex h-full w-full overflow-hidden bg-terminal-bg-dark">
        {/* Left toolbar */}
        <VTTToolbar />

        {/* Main canvas area */}
        <div ref={containerRef} className="flex-1 relative min-w-0">
          <VTTCanvas broadcastPing={broadcastPing} />

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

        {/* Right sidebar */}
        <VTTSidebar />
      </div>
    </VTTAudioProvider>
  );
}
