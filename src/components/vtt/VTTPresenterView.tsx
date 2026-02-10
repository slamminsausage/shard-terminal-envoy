import { useState, useEffect, useCallback, useRef } from "react";
import { usePresenterReceiver } from "@/hooks/useVTTPresenter";
import { useVTTParticles } from "@/hooks/useVTTParticles";
import { renderDynamicLighting } from "@/lib/vtt/raycasting";
import type { VTTMap, ParticleConfig, Point, Stroke, Token, Clock, InitiativeEntry, AoETemplate } from "@/types/vtt";
import { createDefaultParticles } from "@/types/vtt";

// ─── Token image cache (mirrors VTTCanvas pattern) ──────────────────────────
const presenterTokenImageCache = new Map<string, HTMLImageElement>();

function getPresenterTokenImage(dataUrl: string): HTMLImageElement | null {
  const cached = presenterTokenImageCache.get(dataUrl);
  if (cached && cached.complete) return cached;
  if (!cached) {
    const img = new Image();
    img.src = dataUrl;
    presenterTokenImageCache.set(dataUrl, img);
  }
  return null;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

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
  const [diceRoll, setDiceRoll] = useState<{
    label: string;
    dice: number[];
    total: number;
    modifier: number;
    timestamp: number;
  } | null>(null);
  const [clocks, setClocks] = useState<Clock[]>([]);
  const [initiative, setInitiative] = useState<InitiativeEntry[]>([]);
  const [showInitiative, setShowInitiative] = useState(false);

  // Local presenter viewport (independent pan/zoom)
  const [localScroll, setLocalScroll] = useState<Point | null>(null);
  const [localZoom, setLocalZoom] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const scrollStartRef = useRef<Point>({ x: 0, y: 0 });

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

  const onDiceRoll = useCallback(
    (label: string, dice: number[], total: number, modifier: number) => {
      setDiceRoll({ label, dice, total, modifier, timestamp: Date.now() });
      setTimeout(() => setDiceRoll(null), 6000);
    },
    []
  );

  const onClocksSync = useCallback((c: Clock[]) => {
    setClocks(c);
  }, []);

  const onInitiativeSync = useCallback((entries: InitiativeEntry[], show: boolean) => {
    setInitiative(entries);
    setShowInitiative(show);
  }, []);

  usePresenterReceiver(
    onMapSync,
    onParticlesSync,
    onShowHandout,
    onHideHandout,
    onDiceRoll,
    onClocksSync,
    onInitiativeSync
  );

  // Connect particle canvas - always mounted now
  useEffect(() => {
    setParticleCanvas(particleCanvasRef.current);
  }, [setParticleCanvas, particles.enabled]);

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

  // Zoom with scroll wheel
  const mapRef = useRef(map);
  mapRef.current = map;
  const localScrollRef = useRef(localScroll);
  localScrollRef.current = localScroll;
  const localZoomRef = useRef(localZoom);
  localZoomRef.current = localZoom;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      const m = mapRef.current;
      if (!m) return;
      e.preventDefault();
      e.stopPropagation();

      const currentZoom = localZoomRef.current ?? m.zoom;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom * delta));
      setLocalZoom(newZoom);

      // Also initialize local scroll if not set
      if (!localScrollRef.current) {
        setLocalScroll({ x: m.scrollX, y: m.scrollY });
      }
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!map) return;
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      const currentZoom = localZoom ?? map.zoom;
      scrollStartRef.current = localScroll ?? { x: map.scrollX, y: map.scrollY };
    },
    [map, localScroll, localZoom]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning || !map) return;
      const currentZoom = localZoom ?? map.zoom;
      const dx = (e.clientX - panStartRef.current.x) / currentZoom;
      const dy = (e.clientY - panStartRef.current.y) / currentZoom;
      setLocalScroll({
        x: scrollStartRef.current.x - dx,
        y: scrollStartRef.current.y - dy,
      });
    },
    [isPanning, map, localZoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetView = useCallback(() => {
    setLocalScroll(null);
    setLocalZoom(null);
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

    // Use local viewport if set, otherwise use GM viewport
    const scrollX = localScroll?.x ?? map.scrollX;
    const scrollY = localScroll?.y ?? map.scrollY;
    const zoom = localZoom ?? map.zoom;
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, -scrollX * dpr * zoom, -scrollY * dpr * zoom);

    // Map image (with scale/offset support)
    if (mapImageRef.current) {
      const imgScale = (map as any).imageScale || 1;
      const imgOX = (map as any).imageOffsetX || 0;
      const imgOY = (map as any).imageOffsetY || 0;
      const natW = (map as any).imageNaturalWidth || mapImageRef.current.naturalWidth;
      const natH = (map as any).imageNaturalHeight || mapImageRef.current.naturalHeight;

      ctx.save();
      ctx.translate(imgOX, imgOY);
      ctx.drawImage(mapImageRef.current, 0, 0, natW * imgScale, natH * imgScale);
      ctx.restore();
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
      if (s.layer === 2) continue;
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

    // Visible tokens only (with image rendering)
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

      // Clip to circle and draw image or fallback
      ctx.beginPath();
      ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
      ctx.closePath();

      if (t.imageDataUrl) {
        const img = getPresenterTokenImage(t.imageDataUrl);
        if (img) {
          ctx.save();
          ctx.clip();
          ctx.drawImage(img, -halfSize, -halfSize, pixelSize, pixelSize);
          ctx.restore();
        } else {
          // Image still loading
          ctx.fillStyle = "#1a1a2e";
          ctx.fill();
        }
      } else {
        ctx.fillStyle = "#1a1a2e";
        ctx.fill();
        ctx.fillStyle = "#00ff00";
        ctx.font = `${Math.max(12, halfSize)}px "Share Tech Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(t.name.charAt(0).toUpperCase(), 0, 0);
      }

      // Border ring
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

    // AoE templates (per-map)
    const aoeTemplates: AoETemplate[] = (map as any).aoeTemplates || [];
    if (aoeTemplates.length > 0) {
      for (const aoe of aoeTemplates) {
        ctx.save();
        ctx.globalAlpha = aoe.opacity;

        if (aoe.shape === "circle") {
          ctx.fillStyle = aoe.color;
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = aoe.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = Math.min(1, aoe.opacity + 0.3);
          ctx.stroke();
        } else if (aoe.shape === "cone") {
          const angle = aoe.angle ?? 0;
          const spread = (aoe.coneAngle ?? Math.PI / 3) / 2;
          ctx.fillStyle = aoe.color;
          ctx.beginPath();
          ctx.moveTo(aoe.x, aoe.y);
          ctx.arc(aoe.x, aoe.y, aoe.radius, angle - spread, angle + spread);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = aoe.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = Math.min(1, aoe.opacity + 0.3);
          ctx.stroke();
        } else if (aoe.shape === "line") {
          const angle = aoe.angle ?? 0;
          const lineWidth = 20;
          const endX = aoe.x + Math.cos(angle) * aoe.radius;
          const endY = aoe.y + Math.sin(angle) * aoe.radius;
          const perpX = Math.cos(angle + Math.PI / 2) * lineWidth;
          const perpY = Math.sin(angle + Math.PI / 2) * lineWidth;
          ctx.fillStyle = aoe.color;
          ctx.beginPath();
          ctx.moveTo(aoe.x + perpX, aoe.y + perpY);
          ctx.lineTo(endX + perpX, endY + perpY);
          ctx.lineTo(endX - perpX, endY - perpY);
          ctx.lineTo(aoe.x - perpX, aoe.y - perpY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = aoe.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = Math.min(1, aoe.opacity + 0.3);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // Dynamic lighting
    if (map.lights.length > 0 && map.walls.length > 0) {
      renderDynamicLighting(ctx, map.lights, map.walls, map.width, map.height);
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
  }, [map, localScroll, localZoom]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black"
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Particle overlay - always mounted */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ display: particles.enabled ? "block" : "none" }}
      />

      {/* Reset view button (shows when local viewport is active) */}
      {(localScroll || localZoom) && (
        <button
          onClick={resetView}
          className="absolute top-4 left-4 z-10 bg-black/80 border border-terminal-primary/30 text-terminal-primary/60 text-xs font-mono px-3 py-1.5 rounded hover:text-terminal-primary hover:border-terminal-primary/50 transition-colors"
        >
          Reset View
        </button>
      )}

      {/* Zoom indicator */}
      {map && (localZoom != null) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-terminal-primary/30 text-xs font-mono">
          {Math.round((localZoom ?? map.zoom) * 100)}%
        </div>
      )}

      {/* Clocks overlay */}
      {clocks.length > 0 && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {clocks.map((clock) => (
            <div
              key={clock.id}
              className="bg-black/80 border border-terminal-primary/20 rounded-lg px-3 py-2 flex items-center gap-3"
            >
              <PresenterClockSVG clock={clock} />
              <div>
                <div className="text-terminal-primary/80 text-xs font-mono">
                  {clock.name}
                </div>
                <div className="text-terminal-primary/40 text-[10px] font-mono">
                  {clock.filled}/{clock.segments}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Initiative tracker overlay */}
      {showInitiative && initiative.length > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-black/85 border border-terminal-primary/30 rounded-lg overflow-hidden min-w-[180px]">
          <div className="px-3 py-1.5 border-b border-terminal-primary/20">
            <span className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
              Initiative
            </span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {initiative.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-2 px-3 py-1.5 border-b border-terminal-border/10 ${
                  index === 0
                    ? "bg-terminal-primary/10 shadow-[inset_0_0_20px_rgba(0,255,0,0.05)]"
                    : ""
                }`}
              >
                <span className="w-6 text-center text-terminal-primary font-mono text-sm font-bold flex-shrink-0">
                  {entry.initiative}
                </span>
                <span
                  className={`text-xs font-mono flex-1 truncate ${
                    index === 0 ? "text-terminal-primary" : "text-terminal-primary/60"
                  }`}
                >
                  {entry.name}
                </span>
                {entry.isNPC && (
                  <span className="text-[8px] text-red-400/50 font-mono">NPC</span>
                )}
              </div>
            ))}
          </div>
        </div>
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

      {/* Dice roll overlay */}
      {diceRoll && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-black/90 border border-terminal-primary/50 rounded-lg px-8 py-4 text-center shadow-[0_0_30px_rgba(0,255,0,0.2)]">
            <div className="text-terminal-primary/60 text-xs font-mono uppercase tracking-wider mb-1">
              {diceRoll.label}
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              {diceRoll.dice.map((d, i) => (
                <span
                  key={i}
                  className="w-10 h-10 flex items-center justify-center bg-terminal-primary/10 border border-terminal-primary/30 rounded text-terminal-primary text-lg font-mono font-bold"
                >
                  {d}
                </span>
              ))}
              {diceRoll.modifier !== 0 && (
                <span className="text-terminal-primary/50 text-sm font-mono">
                  {diceRoll.modifier > 0 ? "+" : ""}
                  {diceRoll.modifier}
                </span>
              )}
            </div>
            <div
              className={`text-3xl font-mono font-bold ${
                diceRoll.total >= 8
                  ? "text-green-400"
                  : diceRoll.total >= 6
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {diceRoll.total}
            </div>
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

// ─── Clock SVG for presenter (compact) ──────────────────────────────────────

function PresenterClockSVG({ clock }: { clock: Clock }) {
  const size = 40;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  const segments = [];
  for (let i = 0; i < clock.segments; i++) {
    const startAngle = (i / clock.segments) * Math.PI * 2 - Math.PI / 2;
    const endAngle = ((i + 1) / clock.segments) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const filled = i < clock.filled;

    segments.push(
      <path
        key={i}
        d={d}
        fill={filled ? clock.color : "transparent"}
        stroke={clock.color}
        strokeWidth={1}
        opacity={filled ? 0.8 : 0.2}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="transparent" stroke={clock.color} strokeWidth={1.5} opacity={0.3} />
      {segments}
    </svg>
  );
}
