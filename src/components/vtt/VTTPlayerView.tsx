/**
 * VTTPlayerView: An embedded presenter-style view for non-GM players.
 * Receives map state via BroadcastChannel and renders read-only.
 * Players can pan and zoom their own viewport independently.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { usePresenterReceiver } from "@/hooks/useVTTPresenter";
import { useVTTParticles } from "@/hooks/useVTTParticles";
import { renderDynamicLighting } from "@/lib/vtt/raycasting";
import { clamp } from "@/lib/vtt/geometry";
import type {
  VTTMap,
  ParticleConfig,
  Point,
  Clock,
  InitiativeEntry,
  AoETemplate,
} from "@/types/vtt";
import { createDefaultParticles } from "@/types/vtt";

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

export default function VTTPlayerView() {
  const [map, setMap] = useState<VTTMap | null>(null);
  const [particles, setParticles] = useState<ParticleConfig>(
    createDefaultParticles()
  );
  const [handout, setHandout] = useState<{
    imageDataUrl: string;
    name: string;
  } | null>(null);
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
  const [pings, setPings] = useState<
    { x: number; y: number; timestamp: number }[]
  >([]);

  // Local viewport (fully independent)
  const [localScroll, setLocalScroll] = useState<Point | null>(null);
  const [localZoom, setLocalZoom] = useState<number | null>(null);
  const initializedMapIdRef = useRef<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapImageRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const fogImageRef = useRef<HTMLImageElement | null>(null);
  const lastFogUrlRef = useRef<string | null>(null);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const scrollStartRef = useRef<Point>({ x: 0, y: 0 });

  const { setCanvas: setParticleCanvas } = useVTTParticles(particles);

  const onMapSync = useCallback((m: VTTMap | null) => {
    if (m && m.id !== initializedMapIdRef.current) {
      initializedMapIdRef.current = m.id;
      setLocalScroll({ x: m.scrollX, y: m.scrollY });
      setLocalZoom(m.zoom);
    }
    setMap(m);
    setConnected(true);
  }, []);

  const onParticlesSync = useCallback((p: ParticleConfig) => {
    setParticles(p);
  }, []);

  const onShowHandout = useCallback(
    (imageDataUrl: string, name: string) => {
      setHandout({ imageDataUrl, name });
    },
    []
  );

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

  const onInitiativeSync = useCallback(
    (entries: InitiativeEntry[], show: boolean) => {
      setInitiative(entries);
      setShowInitiative(show);
    },
    []
  );

  const onGmPing = useCallback((x: number, y: number) => {
    const ping = { x, y, timestamp: Date.now() };
    setPings((prev) => [...prev, ping]);
    setTimeout(() => {
      setPings((prev) => prev.filter((p) => p !== ping));
    }, 2000);
  }, []);

  usePresenterReceiver(
    onMapSync,
    onParticlesSync,
    onShowHandout,
    onHideHandout,
    onDiceRoll,
    onClocksSync,
    onInitiativeSync,
    onGmPing
  );

  useEffect(() => {
    setParticleCanvas(particleCanvasRef.current);
  }, [setParticleCanvas, particles.enabled]);

  // Load map image
  useEffect(() => {
    if (!map?.imageDataUrl) {
      mapImageRef.current = null;
      return;
    }
    if (map.isVideo) {
      const video = document.createElement("video");
      video.src = map.imageDataUrl;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.play().catch(() => {});
      mapImageRef.current = video;
      return () => {
        video.pause();
      };
    }
    const img = new Image();
    img.onload = () => {
      mapImageRef.current = img;
    };
    img.src = map.imageDataUrl;
  }, [map?.imageDataUrl, map?.isVideo]);

  // Load fog image
  useEffect(() => {
    if (!map?.fog?.dataUrl) {
      fogImageRef.current = null;
      lastFogUrlRef.current = null;
      return;
    }
    if (map.fog.dataUrl === lastFogUrlRef.current) return;
    lastFogUrlRef.current = map.fog.dataUrl;
    const img = new Image();
    img.onload = () => {
      fogImageRef.current = img;
    };
    img.src = map.fog.dataUrl;
  }, [map?.fog?.dataUrl]);

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

  // Zoom with scroll wheel (centered)
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
      const currentScroll = localScrollRef.current ?? {
        x: m.scrollX,
        y: m.scrollY,
      };
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = clamp(currentZoom * delta, MIN_ZOOM, MAX_ZOOM);

      const rect = canvas.getBoundingClientRect();
      const viewCenterX = rect.width / 2;
      const viewCenterY = rect.height / 2;
      const worldCenterX = viewCenterX / currentZoom + currentScroll.x;
      const worldCenterY = viewCenterY / currentZoom + currentScroll.y;
      const newScrollX = worldCenterX - viewCenterX / newZoom;
      const newScrollY = worldCenterY - viewCenterY / newZoom;

      setLocalZoom(newZoom);
      setLocalScroll({ x: newScrollX, y: newScrollY });
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
      scrollStartRef.current = localScroll ?? {
        x: map.scrollX,
        y: map.scrollY,
      };
    },
    [map, localScroll]
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
      ctx.font = `${16 * dpr}px "Share Tech Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(
        connected
          ? "Waiting for GM to load a map..."
          : "Connecting to GM...",
        canvas.width / 2,
        canvas.height / 2
      );
      animRef.current = requestAnimationFrame(render);
      return;
    }

    const scrollX = localScroll?.x ?? map.scrollX;
    const scrollY = localScroll?.y ?? map.scrollY;
    const zoom = localZoom ?? map.zoom;
    ctx.setTransform(
      dpr * zoom,
      0,
      0,
      dpr * zoom,
      -scrollX * dpr * zoom,
      -scrollY * dpr * zoom
    );

    // Map image
    const mapImg = mapImageRef.current;
    if (mapImg) {
      const imgScale = (map as any).imageScale || 1;
      const imgOX = (map as any).imageOffsetX || 0;
      const imgOY = (map as any).imageOffsetY || 0;
      const natW =
        (map as any).imageNaturalWidth ||
        (mapImg instanceof HTMLVideoElement
          ? mapImg.videoWidth
          : (mapImg as HTMLImageElement).naturalWidth);
      const natH =
        (map as any).imageNaturalHeight ||
        (mapImg instanceof HTMLVideoElement
          ? mapImg.videoHeight
          : (mapImg as HTMLImageElement).naturalHeight);

      ctx.save();
      ctx.translate(imgOX, imgOY);
      ctx.drawImage(mapImg, 0, 0, natW * imgScale, natH * imgScale);
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

    // Strokes (skip GM layer and gmOnly items)
    for (const s of map.strokes) {
      if (s.layer === 2 || s.gmOnly) continue;
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

    // Text overlays (skip GM layer and gmOnly items)
    for (const t of map.texts) {
      if (t.layer === 2 || t.gmOnly) continue;
      ctx.fillStyle = t.color;
      ctx.font = `${t.fontSize}px "${t.fontFamily || "Share Tech Mono"}", monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(t.text, t.x, t.y);
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
      ctx.closePath();

      if (t.imageDataUrl) {
        const img = getPresenterTokenImage(t.imageDataUrl);
        if (img) {
          ctx.save();
          ctx.clip();
          ctx.drawImage(img, -halfSize, -halfSize, pixelSize, pixelSize);
          ctx.restore();
        } else {
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
        ctx.fillStyle =
          hpRatio > 0.5
            ? "#00ff00"
            : hpRatio > 0.25
            ? "#ff6600"
            : "#ff3344";
        ctx.fillRect(
          t.x - halfSize,
          t.y + halfSize + 4,
          barWidth * hpRatio,
          4
        );
      }

      if (t.showName) {
        ctx.fillStyle = "#00ff00cc";
        ctx.font = `11px "Share Tech Mono", monospace`;
        ctx.textAlign = "center";
        ctx.fillText(t.name, t.x, t.y - halfSize - 6);
      }

      if (t.conditions.length > 0) {
        const condY =
          t.y + halfSize + (t.showHpBar && t.maxHp > 0 ? 14 : 6);
        t.conditions.forEach((c, i) => {
          ctx.fillStyle = c.color;
          ctx.beginPath();
          ctx.arc(
            t.x - ((t.conditions.length - 1) * 6) + i * 12,
            condY,
            4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
      }

      // Elevation badge
      if (t.elevation && t.elevation !== 0) {
        const elevLabel = (t.elevation > 0 ? "+" : "") + t.elevation;
        const badgeColor = t.elevation > 0 ? "#00ccff" : "#ff8800";
        const badgeX = t.x + halfSize - 2;
        const badgeY = t.y - halfSize - 2;
        ctx.save();
        ctx.font = `bold 9px "Share Tech Mono", monospace`;
        const bm = ctx.measureText(elevLabel);
        const bw = bm.width + 6;
        const bh = 12;
        ctx.fillStyle = "#000000";
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.roundRect(badgeX - bw / 2, badgeY - bh / 2, bw, bh, 3);
        ctx.fill();
        ctx.strokeStyle = badgeColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.roundRect(badgeX - bw / 2, badgeY - bh / 2, bw, bh, 3);
        ctx.stroke();
        ctx.fillStyle = badgeColor;
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(elevLabel, badgeX, badgeY);
        ctx.restore();
      }

      // Active turn indicator
      if (initiative.length > 0 && initiative[0].tokenId === t.id) {
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 400));
        ctx.save();
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 3;
        ctx.globalAlpha = pulse;
        ctx.shadowColor = "#ffcc00";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(t.x, t.y, halfSize + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // AoE templates
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
          ctx.arc(
            aoe.x,
            aoe.y,
            aoe.radius,
            angle - spread,
            angle + spread
          );
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

    // Dynamic lighting (combine map lights + token-emitted lights)
    if (map.walls.length > 0) {
      const tokenLights = map.tokens
        .filter((t) => t.visible && (t.lightBrightRadius ?? 0) > 0)
        .map((t) => ({
          id: t.id + "-light",
          x: t.x,
          y: t.y,
          radius: (t.lightBrightRadius ?? 0) * (map.grid.size || 50),
          color: t.lightColor || "#ffaa44",
          intensity: 1.0,
          flickering: false,
        }));
      const allLights = [...map.lights, ...tokenLights];
      if (allLights.length > 0) {
        renderDynamicLighting(ctx, allLights, map.walls, map.width, map.height);
      }
    }

    // GM pings
    for (const ping of pings) {
      const age = Date.now() - ping.timestamp;
      const progress = Math.min(1, age / 2000);
      const radius = 10 + progress * 60;
      const alpha = 1 - progress;
      ctx.save();
      ctx.strokeStyle = "#ffcc00";
      ctx.lineWidth = 3;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ping.x, ping.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      if (progress < 0.5) {
        ctx.fillStyle = "#ffcc00";
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(ping.x, ping.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Fog of war
    if (map.fog.enabled) {
      ctx.save();
      ctx.globalAlpha = map.fog.opacity;
      if (fogImageRef.current) {
        ctx.drawImage(fogImageRef.current, 0, 0);
      } else {
        ctx.fillStyle = map.fog.color || "#000000";
        ctx.fillRect(0, 0, map.width, map.height);
      }
      ctx.restore();
    }

    animRef.current = requestAnimationFrame(render);
  }, [map, localScroll, localZoom, pings, initiative, connected]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black"
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

      {/* Particle overlay */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ display: particles.enabled ? "block" : "none" }}
      />

      {/* Zoom indicator + reset button */}
      {map && localZoom != null && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          <span className="text-[rgba(0,255,0,0.3)] text-xs font-mono">
            {Math.round(localZoom * 100)}%
          </span>
          <button
            onClick={() => {
              if (map) {
                setLocalScroll({ x: map.scrollX, y: map.scrollY });
                setLocalZoom(map.zoom);
              }
            }}
            className="vtt-btn"
          >
            Reset View
          </button>
        </div>
      )}

      {/* Initiative tracker */}
      {showInitiative && initiative.length > 0 && (
        <div className="absolute top-2 left-2 z-10 vtt-hud overflow-hidden min-w-[160px]">
          <div className="vtt-sidebar-header py-1">
            <span className="vtt-sidebar-title text-[9px]">
              Initiative
            </span>
          </div>
          <div className="max-h-[50vh] overflow-y-auto">
            {initiative.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-2 px-2 py-1 border-b border-[rgba(0,255,0,0.06)] ${
                  index === 0
                    ? "bg-[rgba(0,255,0,0.08)]"
                    : ""
                }`}
              >
                <span className="w-5 text-center text-[var(--primary)] font-mono text-xs font-bold flex-shrink-0">
                  {entry.initiative}
                </span>
                <span
                  className={`text-[10px] font-mono flex-1 truncate ${
                    index === 0
                      ? "text-[var(--primary)]"
                      : "text-[rgba(0,255,0,0.6)]"
                  }`}
                >
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clocks */}
      {clocks.length > 0 && (
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          {clocks.map((clock) => (
            <div
              key={clock.id}
              className="vtt-hud px-2 py-1 text-[rgba(0,255,0,0.6)] text-[10px] font-mono"
            >
              {clock.name}: {clock.filled}/{clock.segments}
            </div>
          ))}
        </div>
      )}

      {/* Handout overlay */}
      {handout && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <img
            src={handout.imageDataUrl}
            alt={handout.name}
            className="max-w-[90%] max-h-[90%] object-contain"
          />
          <div className="absolute bottom-4 text-center text-[rgba(0,255,0,0.6)] text-xs font-mono">
            {handout.name}
          </div>
        </div>
      )}

      {/* Dice roll overlay */}
      {diceRoll && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="vtt-hud px-6 py-3 text-center">
            <div className="vtt-section-label text-center mb-1">
              {diceRoll.label}
            </div>
            <div className="flex items-center justify-center gap-1 mb-1">
              {diceRoll.dice.map((d, i) => (
                <span
                  key={i}
                  className="w-8 h-8 flex items-center justify-center bg-[rgba(0,255,0,0.08)] border border-[rgba(0,255,0,0.25)] rounded text-[var(--primary)] text-sm font-mono font-bold"
                >
                  {d}
                </span>
              ))}
              {diceRoll.modifier !== 0 && (
                <span className="text-[rgba(0,255,0,0.5)] text-xs font-mono">
                  {diceRoll.modifier > 0 ? "+" : ""}
                  {diceRoll.modifier}
                </span>
              )}
            </div>
            <div
              className={`text-2xl font-mono font-bold ${
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[rgba(0,255,0,0.4)] text-sm font-mono animate-pulse">
            Connecting to GM session...
          </div>
        </div>
      )}
    </div>
  );
}
