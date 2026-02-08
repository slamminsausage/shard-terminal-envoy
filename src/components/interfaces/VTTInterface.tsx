import { useEffect, useRef } from "react";
import VTTCanvas from "@/components/vtt/VTTCanvas";
import VTTToolbar from "@/components/vtt/VTTToolbar";
import VTTSidebar from "@/components/vtt/VTTSidebar";
import { useVTT } from "@/contexts/VTTContext";
import { useVTTParticles } from "@/hooks/useVTTParticles";
import { useVTTKeyboard } from "@/hooks/useVTTKeyboard";
import { usePresenterController } from "@/hooks/useVTTPresenter";

export default function VTTInterface() {
  const { state, activeMap } = useVTT();
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas } = useVTTParticles(state.particles);

  // Keyboard shortcuts
  useVTTKeyboard();

  // Presenter mode broadcast
  usePresenterController(state, activeMap);

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

  // Connect particle canvas
  useEffect(() => {
    setCanvas(particleCanvasRef.current);
  }, [setCanvas]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-terminal-bg-dark">
      {/* Left toolbar */}
      <VTTToolbar />

      {/* Main canvas area */}
      <div ref={containerRef} className="flex-1 relative min-w-0">
        <VTTCanvas />

        {/* Particle overlay */}
        {state.particles.enabled && (
          <canvas
            ref={particleCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
          />
        )}
      </div>

      {/* Right sidebar */}
      <VTTSidebar />
    </div>
  );
}
