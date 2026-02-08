import { useState, useEffect, useCallback, useRef } from "react";
import { usePresenterReceiver } from "@/hooks/useVTTPresenter";
import { useVTTParticles } from "@/hooks/useVTTParticles";
import type { VTTMap, ParticleConfig, Point, Stroke, Token } from "@/types/vtt";
import { createDefaultParticles } from "@/types/vtt";

/**
 * Presenter View: a standalone fullscreen display meant to be shown on
 * a second monitor/projector. Receives state from the controller via
 * BroadcastChannel and renders the map, tokens, fog, and effects
 * without any GM controls.
 *
 * Open via: window.open('/presenter', '_blank')
 * or from the VTT toolbar presenter button.
 */
export default function VTTPresenterView() {
  const [map, setMap] = useState<VTTMap | null>(null);
  const [particles, setParticles] = useState<ParticleConfig>(createDefaultParticles());
  const [handout, setHandout] = useState<{ imageDataUrl: string; name: string } | null>(null);
  const [connected, setConnected] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { setCanvas: setParticleCanvas } = useVTTParticles(particles);

  const onMapSync = useCallback((m: VTTMap | null) => {
    setMap(m);
    setConnected(true);
  }, []);

  const onParticlesSync = useCallback((p: ParticleConfig) => {
    setParticles(p);
  }, []);

  const onShowHandout = useCallback((imageDataUrl: string, name: string) => {
    setHandout({ imageDataUrl, name });
  }, []);

  const onHideHandout = useCallback(() => {
    setHandout(null);
  }, []);

  usePresenterReceiver(onMapSync, onParticlesSync, onShowHandout, onHideHandout);

  // Connect particle canvas
  useEffect(() => {
    setParticleCanvas(particleCanvasRef.current);
  }, [setParticleCanvas]);

  // Load map image
  useEffect(() => {
    if (!map?.imageDataUrl) {
      mapImageRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      mapImageRef.current = img;
    };
    img.src = map.imageDataUrl;
  }, [map?.imageDataUrl]);

  // Resize canvases
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const pCanvas = particleCanvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (pCanvas) {
        pCanvas.width = rect.width;
        pCanvas.height = rect.height;
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!map) {
      ctx.fillStyle = "#00ff0044";
      ctx.font = `${20 * dpr}px "Share Tech Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText("Waiting for controller...", canvas.width / 2, canvas.height / 2);
      animRef.current = requestAnimationFrame(render);
      return;
    }

    const { scrollX, scrollY, zoom } = map;
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, -scrollX * dpr * zoom, -scrollY * dpr * zoom);

    // Map image
    if (mapImageRef.current) {
      ctx.drawImage(mapImageRef.current, 0, 0, map.width, map.height);
    }

    // Grid
    if (map.grid.enabled) {
      ctx.strokeStyle = map.grid.color;
      ctx.globalAlpha = map.grid.opacity;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= map.width; x += map.grid.size) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, map.height);
      }
      for (let y = 0; y <= map.height; y += map.grid.size) {
        ctx.moveTo(0, y);
        ctx.lineTo(map.width, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Strokes (only map and token layers, not GM layer)
    for (const s of map.strokes) {
      if (s.layer === 2) continue; // Skip GM layer
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = s.opacity ?? 1;

      if (s.tool === "freehand" && s.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (let i = 1; i < s.points.length; i++) {
          ctx.lineTo(s.points[i].x, s.points[i].y);
        }
        ctx.stroke();
      } else if (s.tool === "line" && s.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        ctx.lineTo(s.points[1].x, s.points[1].y);
        ctx.stroke();
      } else if (s.tool === "rect" && s.points.length >= 2) {
        const [p1, p2] = s.points;
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (s.tool === "circle" && s.points.length >= 2) {
        const [center, edge] = s.points;
        const dx = edge.x - center.x;
        const dy = edge.y - center.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Visible tokens only
    const gridSize = map.grid.size || 50;
    for (const t of map.tokens) {
      if (!t.visible) continue;
      const pixelSize = t.size * gridSize;
      const halfSize = pixelSize / 2;

      if (t.auraRadius > 0) {
        ctx.fillStyle = t.auraColor || "rgba(0,255,0,0.1)";
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.auraRadius * gridSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate((t.rotation * Math.PI) / 180);

      ctx.beginPath();
      ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();

      if (!t.imageDataUrl) {
        ctx.fillStyle = "#00ff00";
        ctx.font = `${Math.max(12, halfSize)}px "Share Tech Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(t.name.charAt(0).toUpperCase(), 0, 0);
      }

      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (t.showHpBar && t.maxHp > 0) {
        const barWidth = pixelSize;
        const hpRatio = Math.max(0, t.hp / t.maxHp);
        ctx.fillStyle = "#333";
        ctx.fillRect(t.x - halfSize, t.y + halfSize + 4, barWidth, 4);
        ctx.fillStyle = hpRatio > 0.5 ? "#00ff00" : hpRatio > 0.25 ? "#ff6600" : "#ff3344";
        ctx.fillRect(t.x - halfSize, t.y + halfSize + 4, barWidth * hpRatio, 4);
      }

      if (t.showName) {
        ctx.fillStyle = "#00ff00cc";
        ctx.font = `11px "Share Tech Mono", monospace`;
        ctx.textAlign = "center";
        ctx.fillText(t.name, t.x, t.y - halfSize - 6);
      }
    }

    // Fog of war
    if (map.fog.enabled) {
      ctx.save();
      ctx.globalAlpha = map.fog.opacity;
      ctx.fillStyle = map.fog.color || "#000000";
      ctx.fillRect(0, 0, map.width, map.height);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    animRef.current = requestAnimationFrame(render);
  }, [map]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black"
      style={{ cursor: "none" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Particle overlay */}
      {particles.enabled && (
        <canvas
          ref={particleCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* Handout overlay */}
      {handout && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <img
            src={handout.imageDataUrl}
            alt={handout.name}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          <div className="absolute bottom-6 text-center text-terminal-primary/60 text-sm font-mono">
            {handout.name}
          </div>
        </div>
      )}

      {/* Connection status */}
      {!connected && (
        <div className="absolute top-4 right-4 text-terminal-primary/40 text-xs font-mono animate-pulse">
          Connecting...
        </div>
      )}
    </div>
  );
}
