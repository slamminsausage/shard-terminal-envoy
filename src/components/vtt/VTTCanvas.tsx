import React, { useRef, useEffect, useCallback, useState } from "react";
import { useVTT } from "@/contexts/VTTContext";
import { screenToWorld } from "@/lib/vtt/geometry";
import { clamp } from "@/lib/vtt/geometry";
import type { Point, Stroke, Token, VTTMap } from "@/types/vtt";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

interface VTTCanvasProps {
  className?: string;
}

export default function VTTCanvas({ className }: VTTCanvasProps) {
  const { state, dispatch, activeMap } = useVTT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const scrollStartRef = useRef<Point>({ x: 0, y: 0 });
  const currentStrokeRef = useRef<Point[]>([]);
  const [dragToken, setDragToken] = useState<string | null>(null);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });

  // Load map background image
  useEffect(() => {
    if (!activeMap?.imageDataUrl) {
      mapImageRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      mapImageRef.current = img;
    };
    img.src = activeMap.imageDataUrl;
  }, [activeMap?.imageDataUrl]);

  // Resize canvas to fill container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ─── Coordinate helpers ─────────────────────────────────────────────

  const getWorldPos = useCallback(
    (e: React.MouseEvent | MouseEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas || !activeMap) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return screenToWorld(
        e.clientX,
        e.clientY,
        activeMap.scrollX,
        activeMap.scrollY,
        activeMap.zoom,
        rect
      );
    },
    [activeMap]
  );

  const findTokenAt = useCallback(
    (pos: Point): Token | null => {
      if (!activeMap) return null;
      // Check tokens in reverse order (topmost first)
      for (let i = activeMap.tokens.length - 1; i >= 0; i--) {
        const t = activeMap.tokens[i];
        const halfSize = (t.size * (activeMap.grid.size || 50)) / 2;
        if (
          pos.x >= t.x - halfSize &&
          pos.x <= t.x + halfSize &&
          pos.y >= t.y - halfSize &&
          pos.y <= t.y + halfSize
        ) {
          return t;
        }
      }
      return null;
    },
    [activeMap]
  );

  // ─── Mouse handlers ─────────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!activeMap) return;
      const worldPos = getWorldPos(e);

      // Middle-click or pan tool → pan
      if (e.button === 1 || state.activeTool === "pan") {
        setIsPanning(true);
        panStartRef.current = { x: e.clientX, y: e.clientY };
        scrollStartRef.current = {
          x: activeMap.scrollX,
          y: activeMap.scrollY,
        };
        e.preventDefault();
        return;
      }

      // Left click
      if (e.button === 0) {
        if (state.activeTool === "cursor") {
          const token = findTokenAt(worldPos);
          if (token && !token.locked) {
            setDragToken(token.id);
            dragOffsetRef.current = {
              x: worldPos.x - token.x,
              y: worldPos.y - token.y,
            };
          }
          return;
        }

        // Drawing tools
        if (state.activeTool.startsWith("draw-")) {
          setIsDrawing(true);
          currentStrokeRef.current = [worldPos];
          return;
        }
      }
    },
    [activeMap, state.activeTool, getWorldPos, findTokenAt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!activeMap) return;

      // Panning
      if (isPanning) {
        const dx = (e.clientX - panStartRef.current.x) / activeMap.zoom;
        const dy = (e.clientY - panStartRef.current.y) / activeMap.zoom;
        dispatch({
          type: "SET_VIEWPORT",
          payload: {
            mapId: activeMap.id,
            scrollX: scrollStartRef.current.x - dx,
            scrollY: scrollStartRef.current.y - dy,
            zoom: activeMap.zoom,
          },
        });
        return;
      }

      // Token drag
      if (dragToken) {
        const worldPos = getWorldPos(e);
        let targetX = worldPos.x - dragOffsetRef.current.x;
        let targetY = worldPos.y - dragOffsetRef.current.y;
        if (activeMap.grid.snap) {
          const gs = activeMap.grid.size;
          targetX = Math.round(targetX / gs) * gs;
          targetY = Math.round(targetY / gs) * gs;
        }
        dispatch({
          type: "UPDATE_TOKEN",
          payload: {
            mapId: activeMap.id,
            tokenId: dragToken,
            updates: { x: targetX, y: targetY },
          },
        });
        return;
      }

      // Drawing
      if (isDrawing) {
        const worldPos = getWorldPos(e);
        currentStrokeRef.current.push(worldPos);
        return;
      }
    },
    [activeMap, isPanning, dragToken, isDrawing, dispatch, getWorldPos]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setIsPanning(false);
        return;
      }

      if (dragToken) {
        setDragToken(null);
        return;
      }

      if (isDrawing && activeMap) {
        setIsDrawing(false);
        const points = currentStrokeRef.current;
        if (points.length < 2) return;

        let tool: Stroke["tool"] = "freehand";
        if (state.activeTool === "draw-line") tool = "line";
        else if (state.activeTool === "draw-rect") tool = "rect";
        else if (state.activeTool === "draw-circle") tool = "circle";

        const stroke: Stroke = {
          id: crypto.randomUUID(),
          tool,
          points:
            tool === "freehand"
              ? points
              : [points[0], points[points.length - 1]],
          color: state.drawColor,
          width: state.drawWidth,
          layer: state.activeLayer,
        };

        dispatch({
          type: "ADD_STROKE",
          payload: { mapId: activeMap.id, stroke },
        });
        currentStrokeRef.current = [];
        return;
      }
    },
    [isPanning, dragToken, isDrawing, activeMap, state, dispatch]
  );

  // Zoom with scroll wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!activeMap) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = clamp(activeMap.zoom * delta, MIN_ZOOM, MAX_ZOOM);

      dispatch({
        type: "SET_VIEWPORT",
        payload: {
          mapId: activeMap.id,
          scrollX: activeMap.scrollX,
          scrollY: activeMap.scrollY,
          zoom: newZoom,
        },
      });
    },
    [activeMap, dispatch]
  );

  // ─── Render loop ────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!activeMap) {
      // No map loaded - show placeholder
      ctx.fillStyle = "#00ff0066";
      ctx.font = `${16 * dpr}px "Share Tech Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(
        "No map loaded. Open Maps panel to add one.",
        canvas.width / 2,
        canvas.height / 2
      );
      animFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const { scrollX, scrollY, zoom } = activeMap;

    // Apply camera transform
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, -scrollX * dpr * zoom, -scrollY * dpr * zoom);

    // Map background image
    if (mapImageRef.current) {
      ctx.drawImage(mapImageRef.current, 0, 0, activeMap.width, activeMap.height);
    }

    // Grid
    if (state.showGrid && activeMap.grid.enabled) {
      drawGrid(ctx, activeMap);
    }

    // Strokes
    drawStrokes(ctx, activeMap.strokes);

    // In-progress stroke
    if (isDrawing && currentStrokeRef.current.length > 1) {
      drawStrokePreview(ctx, currentStrokeRef.current, state.drawColor, state.drawWidth, state.activeTool);
    }

    // Tokens
    drawTokens(ctx, activeMap, state.showTokenNames);

    // Walls (GM overlay)
    if (state.showWalls) {
      drawWalls(ctx, activeMap.walls);
    }

    // Lights (GM overlay)
    if (state.showLights && activeMap.lights.length > 0) {
      drawLightIndicators(ctx, activeMap.lights);
    }

    // Notes
    drawNotes(ctx, activeMap.notes);

    animFrameRef.current = requestAnimationFrame(render);
  }, [activeMap, state, isDrawing]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-terminal-bg-dark ${className || ""}`}
      style={{ cursor: getCursor(state.activeTool, isPanning, !!dragToken) }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="block w-full h-full"
      />
      {/* Map name overlay */}
      {activeMap && (
        <div className="absolute top-2 left-2 text-terminal-primary/60 text-xs font-mono pointer-events-none select-none">
          {activeMap.name} | {Math.round(activeMap.zoom * 100)}%
        </div>
      )}
    </div>
  );
}

// ─── Drawing helpers ──────────────────────────────────────────────────────

function getCursor(tool: string, isPanning: boolean, isDragging: boolean): string {
  if (isPanning) return "grabbing";
  if (isDragging) return "move";
  if (tool === "pan") return "grab";
  if (tool === "cursor") return "default";
  if (tool.startsWith("draw-")) return "crosshair";
  if (tool.startsWith("fog-")) return "crosshair";
  if (tool === "measure") return "crosshair";
  return "default";
}

function drawGrid(ctx: CanvasRenderingContext2D, map: VTTMap) {
  const { grid, width, height } = map;
  ctx.strokeStyle = grid.color;
  ctx.globalAlpha = grid.opacity;
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = 0; x <= width; x += grid.size) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += grid.size) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[]) {
  for (const s of strokes) {
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
}

function drawStrokePreview(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  width: number,
  tool: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([5, 5]);

  if (tool === "draw-freehand") {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  } else if (tool === "draw-line") {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
  } else if (tool === "draw-rect") {
    const p1 = points[0];
    const p2 = points[points.length - 1];
    ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
  } else if (tool === "draw-circle") {
    const center = points[0];
    const edge = points[points.length - 1];
    const dx = edge.x - center.x;
    const dy = edge.y - center.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.setLineDash([]);
}

function drawTokens(
  ctx: CanvasRenderingContext2D,
  map: VTTMap,
  showNames: boolean
) {
  const gridSize = map.grid.size || 50;

  for (const t of map.tokens) {
    if (!t.visible) continue;
    const pixelSize = t.size * gridSize;
    const halfSize = pixelSize / 2;

    // Aura
    if (t.auraRadius > 0) {
      ctx.fillStyle = t.auraColor || "rgba(0, 255, 0, 0.1)";
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.auraRadius * gridSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Token body
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate((t.rotation * Math.PI) / 180);

    // Background circle
    ctx.fillStyle = "#1a1a2e";
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // First letter as fallback if no image
    if (!t.imageDataUrl) {
      ctx.fillStyle = "#00ff00";
      ctx.font = `${Math.max(12, halfSize)}px "Share Tech Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t.name.charAt(0).toUpperCase(), 0, 0);
    }

    ctx.restore();

    // HP bar
    if (t.showHpBar && t.maxHp > 0) {
      const barWidth = pixelSize;
      const barHeight = 4;
      const barY = t.y + halfSize + 4;
      const barX = t.x - halfSize;
      const hpRatio = Math.max(0, t.hp / t.maxHp);

      ctx.fillStyle = "#333";
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle =
        hpRatio > 0.5 ? "#00ff00" : hpRatio > 0.25 ? "#ff6600" : "#ff3344";
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    }

    // Name label
    if (showNames && t.showName) {
      ctx.fillStyle = "#00ff00cc";
      ctx.font = `11px "Share Tech Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(t.name, t.x, t.y - halfSize - 6);
    }

    // Conditions
    if (t.conditions.length > 0) {
      const condY = t.y + halfSize + (t.showHpBar && t.maxHp > 0 ? 14 : 6);
      t.conditions.forEach((c, i) => {
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(t.x - ((t.conditions.length - 1) * 6) + i * 12, condY, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }
}

function drawWalls(ctx: CanvasRenderingContext2D, walls: VTTMap["walls"]) {
  for (const w of walls) {
    ctx.lineWidth = 3;
    if (w.type === "door") {
      ctx.strokeStyle = w.doorOpen ? "#00ccff44" : "#00ccff";
      ctx.setLineDash(w.doorOpen ? [4, 4] : []);
    } else {
      ctx.strokeStyle = w.color || "#ff6600";
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawLightIndicators(ctx: CanvasRenderingContext2D, lights: VTTMap["lights"]) {
  for (const l of lights) {
    // Radius indicator
    ctx.strokeStyle = l.color + "44";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center dot
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawNotes(ctx: CanvasRenderingContext2D, notes: VTTMap["notes"]) {
  for (const n of notes) {
    if (!n.visible) continue;
    // Pin marker
    ctx.fillStyle = n.color || "#00ccff";
    ctx.beginPath();
    ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Pin icon (simple "i")
    ctx.fillStyle = "#000";
    ctx.font = `bold 10px "Share Tech Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("i", n.x, n.y);

    // Title
    if (n.title) {
      ctx.fillStyle = "#00ccff";
      ctx.font = `10px "Share Tech Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(n.title, n.x, n.y - 14);
    }
  }
}
