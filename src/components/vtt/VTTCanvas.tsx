import React, { useRef, useEffect, useCallback, useState } from "react";
import { useVTT } from "@/contexts/VTTContext";
import { screenToWorld } from "@/lib/vtt/geometry";
import { clamp } from "@/lib/vtt/geometry";
import { renderDynamicLighting } from "@/lib/vtt/raycasting";
import { useVTTFogBrush } from "@/hooks/useVTTFogBrush";
import type { Point, Stroke, Token, MapNote, VTTMap, AoETemplate, TextOverlay, Wall } from "@/types/vtt";
import VTTContextMenu from "./VTTContextMenu";
import VTTTokenEditModal from "./VTTTokenEditModal";
import VTTNoteModal from "./VTTNoteModal";
import VTTZoomControl from "./VTTZoomControl";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

// ─── Token image cache ────────────────────────────────────────────────
const tokenImageCache = new Map<string, HTMLImageElement>();

function getTokenImage(dataUrl: string): HTMLImageElement | null {
  const cached = tokenImageCache.get(dataUrl);
  if (cached && cached.complete) return cached;
  if (!cached) {
    const img = new Image();
    img.src = dataUrl;
    tokenImageCache.set(dataUrl, img);
  }
  return null;
}

interface VTTCanvasProps {
  className?: string;
  broadcastPing?: (x: number, y: number) => void;
}

export default function VTTCanvas({ className, broadcastPing }: VTTCanvasProps) {
  const { state, dispatch, activeMap } = useVTT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapImageRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Fog brush hook
  const { paintFog, resetFog, getFogCanvas, exportFogData } = useVTTFogBrush(activeMap);

  // Interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const scrollStartRef = useRef<Point>({ x: 0, y: 0 });
  const currentStrokeRef = useRef<Point[]>([]);
  const [dragToken, setDragToken] = useState<string | null>(null);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });
  // Group drag: tracks whether we're dragging a multi-selection
  const [isGroupDrag, setIsGroupDrag] = useState(false);
  const groupDragLastWorldRef = useRef<Point>({ x: 0, y: 0 });

  // Fog brush painting state
  const [isFogPainting, setIsFogPainting] = useState(false);

  // AoE placement state
  const [placingAoE, setPlacingAoE] = useState(false);
  const aoeStartRef = useRef<Point>({ x: 0, y: 0 });
  const aoeEndRef = useRef<Point>({ x: 0, y: 0 });

  // Text input state
  const [textInput, setTextInput] = useState<{
    x: number;
    y: number;
    screenX: number;
    screenY: number;
  } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Measurement state
  const [measuring, setMeasuring] = useState(false);
  const measureStartRef = useRef<Point>({ x: 0, y: 0 });
  const measureEndRef = useRef<Point>({ x: 0, y: 0 });

  // Wall drawing state
  const [drawingWall, setDrawingWall] = useState(false);
  const wallStartRef = useRef<Point>({ x: 0, y: 0 });
  const wallEndRef = useRef<Point>({ x: 0, y: 0 });

  // Context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    worldPos: Point;
    token: Token | null;
    note: MapNote | null;
  } | null>(null);

  // Selection box state
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null);
  const selectionBoxStartRef = useRef<Point>({ x: 0, y: 0 });

  // Ping state (visual on GM canvas)
  const [pings, setPings] = useState<{ x: number; y: number; timestamp: number }[]>([]);

  // Drag start position for undo history
  const dragStartPosRef = useRef<Point>({ x: 0, y: 0 });

  // Mouse world position for cursor previews (fog brush, etc.)
  const cursorWorldRef = useRef<Point>({ x: 0, y: 0 });

  // Modals
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [editingNote, setEditingNote] = useState<{
    note: MapNote | null;
    worldPos: Point;
  } | null>(null);

  // Load map background image (supports video)
  useEffect(() => {
    if (!activeMap?.imageDataUrl) {
      mapImageRef.current = null;
      return;
    }

    if (activeMap.isVideo) {
      const video = document.createElement("video");
      video.src = activeMap.imageDataUrl;
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
    img.src = activeMap.imageDataUrl;
  }, [activeMap?.imageDataUrl, activeMap?.isVideo]);

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

  const findNoteAt = useCallback(
    (pos: Point): MapNote | null => {
      if (!activeMap) return null;
      for (let i = activeMap.notes.length - 1; i >= 0; i--) {
        const n = activeMap.notes[i];
        if (!n.visible) continue;
        const dx = pos.x - n.x;
        const dy = pos.y - n.y;
        if (dx * dx + dy * dy <= 12 * 12) return n;
      }
      return null;
    },
    [activeMap]
  );

  // ─── Mouse handlers ─────────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!activeMap) return;
      if (contextMenu) {
        setContextMenu(null);
        return;
      }
      const worldPos = getWorldPos(e);

      // Middle-click → pan
      if (e.button === 1 || state.activeTool === "pan") {
        setIsPanning(true);
        panStartRef.current = { x: e.clientX, y: e.clientY };
        scrollStartRef.current = { x: activeMap.scrollX, y: activeMap.scrollY };
        e.preventDefault();
        return;
      }

      // Left click
      if (e.button === 0) {
        // Cursor tool
        if (state.activeTool === "cursor") {
          // Ctrl+Click → GM ping
          if (e.ctrlKey || e.metaKey) {
            const ping = { x: worldPos.x, y: worldPos.y, timestamp: Date.now() };
            setPings((prev) => [...prev, ping]);
            setTimeout(() => setPings((prev) => prev.filter((p) => p !== ping)), 2000);
            broadcastPing?.(worldPos.x, worldPos.y);
            return;
          }

          // Double-click to edit
          if (e.detail === 2) {
            const token = findTokenAt(worldPos);
            if (token) {
              setEditingToken(token);
              return;
            }
            const note = findNoteAt(worldPos);
            if (note) {
              setEditingNote({ note, worldPos });
              return;
            }
          }

          const token = findTokenAt(worldPos);
          if (token && !token.locked) {
            // Shift+Click toggles token in/out of selection
            if (e.shiftKey) {
              const ids = state.selectedTokenIds || [];
              const isSelected = ids.includes(token.id);
              dispatch({
                type: "SET_SELECTION",
                payload: isSelected
                  ? ids.filter((id) => id !== token.id)
                  : [...ids, token.id],
              });
              return;
            }
            const ids = state.selectedTokenIds || [];
            const hasMultiSelection =
              ids.length > 1 ||
              (state.selectedStrokeIds || []).length > 0 ||
              (state.selectedTextIds || []).length > 0 ||
              (state.selectedNoteIds || []).length > 0;

            if (ids.includes(token.id) && hasMultiSelection) {
              // Start group drag for all selected items
              setIsGroupDrag(true);
              groupDragLastWorldRef.current = worldPos;
              dragStartPosRef.current = { x: token.x, y: token.y };
            } else {
              // Single token selection + drag
              if (!ids.includes(token.id)) {
                dispatch({ type: "SET_SELECTION", payload: [token.id] });
              }
              setDragToken(token.id);
              dragStartPosRef.current = { x: token.x, y: token.y };
              dragOffsetRef.current = {
                x: worldPos.x - token.x,
                y: worldPos.y - token.y,
              };
            }
          } else if (!token) {
            // Click empty space: start selection box or deselect
            if (!e.shiftKey) {
              dispatch({ type: "CLEAR_SELECTION" });
            }
            // Start selection box drag
            selectionBoxStartRef.current = worldPos;
            setSelectionBox({ start: worldPos, end: worldPos });
          }
          return;
        }

        // Text tool (must be checked before generic draw- tools)
        if (state.activeTool === "draw-text") {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          setTextInput({
            x: worldPos.x,
            y: worldPos.y,
            screenX: e.clientX - rect.left,
            screenY: e.clientY - rect.top,
          });
          setTimeout(() => textInputRef.current?.focus(), 0);
          return;
        }

        // Drawing tools
        if (state.activeTool.startsWith("draw-")) {
          setIsDrawing(true);
          currentStrokeRef.current = [worldPos];
          return;
        }

        // Measurement tool
        if (state.activeTool === "measure") {
          setMeasuring(true);
          measureStartRef.current = worldPos;
          measureEndRef.current = worldPos;
          return;
        }

        // Wall/Door tool
        if (state.activeTool === "wall" || state.activeTool === "door") {
          setDrawingWall(true);
          const snapped = activeMap.grid.snap
            ? { x: Math.round(worldPos.x / activeMap.grid.size) * activeMap.grid.size, y: Math.round(worldPos.y / activeMap.grid.size) * activeMap.grid.size }
            : worldPos;
          wallStartRef.current = snapped;
          wallEndRef.current = snapped;
          return;
        }

        // Light placement
        if (state.activeTool === "light") {
          dispatch({
            type: "ADD_LIGHT",
            payload: {
              mapId: activeMap.id,
              light: {
                id: crypto.randomUUID(),
                x: worldPos.x,
                y: worldPos.y,
                radius: 200,
                color: "#ffcc44",
                intensity: 0.8,
              },
            },
          });
          return;
        }

        // Note placement
        if (state.activeTool === "note") {
          setEditingNote({ note: null, worldPos });
          return;
        }

        // Fog brush tools
        if (state.activeTool.startsWith("fog-")) {
          setIsFogPainting(true);
          const shape = state.activeTool === "fog-rect" ? "rect" : "circle";
          paintFog(worldPos.x, worldPos.y, state.fogBrushSize, state.fogBrushMode, shape);
          return;
        }

        // AoE placement tools
        if (state.activeTool.startsWith("aoe-")) {
          setPlacingAoE(true);
          aoeStartRef.current = worldPos;
          aoeEndRef.current = worldPos;
          return;
        }

      }
    },
    [activeMap, state.activeTool, state.fogBrushSize, state.fogBrushMode, getWorldPos, findTokenAt, findNoteAt, contextMenu, dispatch, paintFog]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!activeMap) return;

      // Always track world position for cursor previews
      cursorWorldRef.current = getWorldPos(e);

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

      if (dragToken) {
        const worldPos = getWorldPos(e);
        let targetX = worldPos.x - dragOffsetRef.current.x;
        let targetY = worldPos.y - dragOffsetRef.current.y;
        if (activeMap.grid.snap) {
          const gs = activeMap.grid.size;
          // Snap to grid cell centers (half-cell offset)
          targetX = Math.floor(targetX / gs) * gs + gs / 2;
          targetY = Math.floor(targetY / gs) * gs + gs / 2;
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

      // Group drag: move all selected items by delta
      if (isGroupDrag && activeMap) {
        const worldPos = getWorldPos(e);
        const dx = worldPos.x - groupDragLastWorldRef.current.x;
        const dy = worldPos.y - groupDragLastWorldRef.current.y;
        groupDragLastWorldRef.current = worldPos;

        // Move selected tokens
        for (const tokenId of (state.selectedTokenIds || [])) {
          const token = activeMap.tokens.find((t) => t.id === tokenId);
          if (token && !token.locked) {
            dispatch({
              type: "UPDATE_TOKEN",
              payload: {
                mapId: activeMap.id,
                tokenId,
                updates: { x: token.x + dx, y: token.y + dy },
              },
            });
          }
        }

        // Move selected strokes
        for (const strokeId of (state.selectedStrokeIds || [])) {
          const stroke = activeMap.strokes.find((s) => s.id === strokeId);
          if (stroke) {
            const movedPoints = stroke.points.map((p) => ({
              x: p.x + dx,
              y: p.y + dy,
            }));
            dispatch({
              type: "REMOVE_STROKE",
              payload: { mapId: activeMap.id, strokeId },
            });
            dispatch({
              type: "ADD_STROKE",
              payload: {
                mapId: activeMap.id,
                stroke: { ...stroke, points: movedPoints },
              },
            });
          }
        }

        // Move selected texts
        for (const textId of (state.selectedTextIds || [])) {
          const text = activeMap.texts.find((t) => t.id === textId);
          if (text) {
            dispatch({
              type: "REMOVE_TEXT",
              payload: { mapId: activeMap.id, textId },
            });
            dispatch({
              type: "ADD_TEXT",
              payload: {
                mapId: activeMap.id,
                text: { ...text, x: text.x + dx, y: text.y + dy },
              },
            });
          }
        }

        // Move selected notes
        for (const noteId of (state.selectedNoteIds || [])) {
          const note = activeMap.notes.find((n) => n.id === noteId);
          if (note) {
            dispatch({
              type: "UPDATE_NOTE",
              payload: {
                mapId: activeMap.id,
                noteId,
                updates: { x: note.x + dx, y: note.y + dy },
              },
            });
          }
        }
        return;
      }

      if (isDrawing) {
        const worldPos = getWorldPos(e);
        currentStrokeRef.current.push(worldPos);
        return;
      }

      if (measuring) {
        measureEndRef.current = getWorldPos(e);
        return;
      }

      if (drawingWall) {
        const worldPos = getWorldPos(e);
        wallEndRef.current = activeMap.grid.snap
          ? { x: Math.round(worldPos.x / activeMap.grid.size) * activeMap.grid.size, y: Math.round(worldPos.y / activeMap.grid.size) * activeMap.grid.size }
          : worldPos;
        return;
      }

      if (isFogPainting) {
        const worldPos = getWorldPos(e);
        const shape = state.activeTool === "fog-rect" ? "rect" : "circle";
        paintFog(worldPos.x, worldPos.y, state.fogBrushSize, state.fogBrushMode, shape);
        return;
      }

      if (placingAoE) {
        aoeEndRef.current = getWorldPos(e);
        return;
      }

      // Selection box drag
      if (selectionBox) {
        setSelectionBox({ start: selectionBoxStartRef.current, end: getWorldPos(e) });
        return;
      }
    },
    [activeMap, isPanning, dragToken, isGroupDrag, isDrawing, measuring, drawingWall, isFogPainting, placingAoE, selectionBox, state, dispatch, getWorldPos, paintFog]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setIsPanning(false);
        return;
      }

      if (isGroupDrag) {
        setIsGroupDrag(false);
        return;
      }

      if (dragToken && activeMap) {
        // Record undo history for token move
        const token = activeMap.tokens.find((t) => t.id === dragToken);
        if (token && (token.x !== dragStartPosRef.current.x || token.y !== dragStartPosRef.current.y)) {
          dispatch({
            type: "PUSH_HISTORY",
            payload: {
              type: "token-move",
              mapId: activeMap.id,
              before: { tokenId: dragToken, x: dragStartPosRef.current.x, y: dragStartPosRef.current.y },
              after: { tokenId: dragToken, x: token.x, y: token.y },
              timestamp: Date.now(),
            },
          });
        }
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
          gmOnly: state.activeLayer === 2,
        };

        dispatch({
          type: "ADD_STROKE",
          payload: { mapId: activeMap.id, stroke },
        });
        dispatch({
          type: "PUSH_HISTORY",
          payload: {
            type: "stroke-add",
            mapId: activeMap.id,
            before: null,
            after: stroke,
            timestamp: Date.now(),
          },
        });
        currentStrokeRef.current = [];
        return;
      }

      if (measuring) {
        setMeasuring(false);
        return;
      }

      if (drawingWall && activeMap) {
        setDrawingWall(false);
        const s = wallStartRef.current;
        const en = wallEndRef.current;
        const dx = en.x - s.x;
        const dy = en.y - s.y;
        if (Math.sqrt(dx * dx + dy * dy) < 5) return;

        const wall: Wall = {
          id: crypto.randomUUID(),
          x1: s.x,
          y1: s.y,
          x2: en.x,
          y2: en.y,
          type: state.activeTool === "door" ? "door" : "wall",
          doorOpen: false,
        };
        dispatch({
          type: "ADD_WALL",
          payload: { mapId: activeMap.id, wall },
        });
        dispatch({
          type: "PUSH_HISTORY",
          payload: {
            type: "wall-add",
            mapId: activeMap.id,
            before: null,
            after: wall,
            timestamp: Date.now(),
          },
        });
        return;
      }

      if (isFogPainting && activeMap) {
        setIsFogPainting(false);
        // Persist fog canvas data
        const fogDataUrl = exportFogData();
        if (fogDataUrl) {
          dispatch({
            type: "UPDATE_FOG",
            payload: {
              mapId: activeMap.id,
              fog: { dataUrl: fogDataUrl },
            },
          });
        }
        return;
      }

      if (placingAoE && activeMap) {
        setPlacingAoE(false);
        const s = aoeStartRef.current;
        const en = aoeEndRef.current;
        const dx = en.x - s.x;
        const dy = en.y - s.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        if (radius < 5) return;

        const angle = Math.atan2(dy, dx);
        let shape: "cone" | "circle" | "line" = "circle";
        if (state.activeTool === "aoe-cone") shape = "cone";
        else if (state.activeTool === "aoe-line") shape = "line";

        dispatch({
          type: "ADD_AOE",
          payload: {
            id: crypto.randomUUID(),
            shape,
            x: s.x,
            y: s.y,
            radius,
            angle,
            coneAngle: Math.PI / 3,
            color: shape === "cone" ? "#ff440088" : shape === "line" ? "#4488ff88" : "#ffcc0088",
            opacity: 0.35,
          },
        });
        return;
      }

      // Selection box complete - select all non-map layer items within box
      if (selectionBox && activeMap) {
        const box = selectionBox;
        setSelectionBox(null);
        const minX = Math.min(box.start.x, box.end.x);
        const maxX = Math.max(box.start.x, box.end.x);
        const minY = Math.min(box.start.y, box.end.y);
        const maxY = Math.max(box.start.y, box.end.y);
        // Only select if the box has some size
        if (maxX - minX > 5 || maxY - minY > 5) {
          const gridSize = activeMap.grid.size || 50;

          // Select tokens (not on map layer, not locked)
          const tokenIds = activeMap.tokens
            .filter((t) => {
              const halfSize = (t.size * gridSize) / 2;
              return (
                t.x + halfSize >= minX &&
                t.x - halfSize <= maxX &&
                t.y + halfSize >= minY &&
                t.y - halfSize <= maxY &&
                !t.locked
              );
            })
            .map((t) => t.id);

          // Select strokes (non-map layer) by checking if any point is within box
          const strokeIds = activeMap.strokes
            .filter((s) => {
              if (s.layer === 0) return false; // skip map layer
              return s.points.some(
                (p) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY
              );
            })
            .map((s) => s.id);

          // Select text overlays (non-map layer)
          const textIds = activeMap.texts
            .filter((t) => {
              if (t.layer === 0) return false;
              return t.x >= minX && t.x <= maxX && t.y >= minY && t.y <= maxY;
            })
            .map((t) => t.id);

          // Select notes
          const noteIds = activeMap.notes
            .filter((n) => {
              return n.x >= minX && n.x <= maxX && n.y >= minY && n.y <= maxY;
            })
            .map((n) => n.id);

          dispatch({
            type: "SET_FULL_SELECTION",
            payload: { tokenIds, strokeIds, textIds, noteIds },
          });
        }
        return;
      }
    },
    [isPanning, isGroupDrag, dragToken, isDrawing, measuring, drawingWall, isFogPainting, placingAoE, selectionBox, activeMap, state, dispatch, exportFogData]
  );

  // Right-click context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!activeMap) return;
      const worldPos = getWorldPos(e);
      const token = findTokenAt(worldPos);
      const note = findNoteAt(worldPos);
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        worldPos,
        token,
        note,
      });
    },
    [activeMap, getWorldPos, findTokenAt, findNoteAt]
  );

  // Prevent scroll wheel from scrolling the page on the canvas (no zoom)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  // ─── Render loop ────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!activeMap) {
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

    // Map background image (with scale/offset and rotation/flip)
    if (mapImageRef.current) {
      const { rotation, flipH, flipV } = activeMap;
      const imgScale = activeMap.imageScale || 1;
      const imgOX = activeMap.imageOffsetX || 0;
      const imgOY = activeMap.imageOffsetY || 0;
      const mapEl = mapImageRef.current;
      const elW = mapEl instanceof HTMLVideoElement ? mapEl.videoWidth : (mapEl as HTMLImageElement).naturalWidth;
      const elH = mapEl instanceof HTMLVideoElement ? mapEl.videoHeight : (mapEl as HTMLImageElement).naturalHeight;
      const natW = activeMap.imageNaturalWidth || elW;
      const natH = activeMap.imageNaturalHeight || elH;

      ctx.save();
      ctx.translate(imgOX, imgOY);

      if (rotation !== 0 || flipH || flipV) {
        const scaledW = natW * imgScale;
        const scaledH = natH * imgScale;
        ctx.translate(scaledW / 2, scaledH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(mapImageRef.current, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
      } else {
        ctx.drawImage(mapImageRef.current, 0, 0, natW * imgScale, natH * imgScale);
      }
      ctx.restore();
    }

    // Grid
    if (state.showGrid && activeMap.grid.enabled) {
      drawGrid(ctx, activeMap);
    }

    // Strokes
    drawStrokes(ctx, activeMap.strokes);

    // Text overlays
    if (activeMap.texts.length > 0) {
      drawTextOverlays(ctx, activeMap.texts);
    }

    // In-progress stroke preview
    if (isDrawing && currentStrokeRef.current.length > 1) {
      drawStrokePreview(ctx, currentStrokeRef.current, state.drawColor, state.drawWidth, state.activeTool);
    }

    // Tokens (with image support)
    drawTokens(ctx, activeMap, state.showTokenNames);

    // AoE templates (per-map)
    if ((activeMap.aoeTemplates || []).length > 0) {
      drawAoETemplates(ctx, activeMap.aoeTemplates || []);
    }

    // AoE placement preview
    if (placingAoE) {
      drawAoEPreview(ctx, aoeStartRef.current, aoeEndRef.current, state.activeTool);
    }

    // Dynamic lighting
    if (state.showLights && activeMap.lights.length > 0 && activeMap.walls.length > 0) {
      renderDynamicLighting(ctx, activeMap.lights, activeMap.walls, activeMap.width, activeMap.height);
    }

    // Fog of War overlay (use brush canvas if available, otherwise basic fill)
    if (state.showFog && activeMap.fog.enabled) {
      const fogCanvas = getFogCanvas();
      if (fogCanvas) {
        ctx.save();
        ctx.globalAlpha = activeMap.fog.opacity;
        ctx.drawImage(fogCanvas, 0, 0);
        ctx.globalAlpha = 1;
        ctx.restore();
      } else {
        drawFogOfWar(ctx, activeMap);
      }
    }

    // Fog brush cursor preview
    if (state.activeTool.startsWith("fog-") && !isFogPainting) {
      const cx = cursorWorldRef.current.x;
      const cy = cursorWorldRef.current.y;
      const r = state.fogBrushSize;
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = state.fogBrushMode === "reveal" ? "#00ff00" : "#ff3344";
      if (state.activeTool === "fog-rect") {
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Outline
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = state.fogBrushMode === "reveal" ? "#00ff00" : "#ff3344";
      ctx.lineWidth = 2 / activeMap.zoom;
      if (state.activeTool === "fog-rect") {
        ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Walls (GM overlay)
    if (state.showWalls) {
      drawWalls(ctx, activeMap.walls);
    }

    // Light indicators (GM overlay)
    if (state.showLights && activeMap.lights.length > 0) {
      drawLightIndicators(ctx, activeMap.lights);
    }

    // Wall drawing preview
    if (drawingWall) {
      ctx.strokeStyle = state.activeTool === "door" ? "#00ccff" : "#ff6600";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(wallStartRef.current.x, wallStartRef.current.y);
      ctx.lineTo(wallEndRef.current.x, wallEndRef.current.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Notes
    drawNotes(ctx, activeMap.notes);

    // Measurement overlay
    if (measuring) {
      drawMeasurement(ctx, measureStartRef.current, measureEndRef.current, activeMap.grid.size);
    }

    // Selected token highlights
    const selectedIds = state.selectedTokenIds || [];
    if (selectedIds.length > 0) {
      const gridSize = activeMap.grid.size || 50;
      for (const tokenId of selectedIds) {
        const token = activeMap.tokens.find((t) => t.id === tokenId);
        if (!token || !token.visible) continue;
        const halfSize = (token.size * gridSize) / 2;
        ctx.save();
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00ff00";
        ctx.shadowBlur = 12;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(token.x, token.y, halfSize + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Selected stroke highlights
    const selectedStrokeIds = state.selectedStrokeIds || [];
    if (selectedStrokeIds.length > 0) {
      for (const strokeId of selectedStrokeIds) {
        const stroke = activeMap.strokes.find((s) => s.id === strokeId);
        if (!stroke || stroke.points.length === 0) continue;
        ctx.save();
        ctx.strokeStyle = "#00ccff";
        ctx.lineWidth = stroke.width + 4;
        ctx.globalAlpha = 0.4;
        ctx.setLineDash([6, 4]);
        if (stroke.tool === "freehand" && stroke.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        } else if (stroke.tool === "line" && stroke.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
          ctx.stroke();
        } else if (stroke.tool === "rect" && stroke.points.length >= 2) {
          const [p1, p2] = stroke.points;
          ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        } else if (stroke.tool === "circle" && stroke.points.length >= 2) {
          const [center, edge] = stroke.points;
          const dx = edge.x - center.x;
          const dy = edge.y - center.y;
          const r = Math.sqrt(dx * dx + dy * dy);
          ctx.beginPath();
          ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Selected text highlights
    const selectedTextIds = state.selectedTextIds || [];
    if (selectedTextIds.length > 0) {
      for (const textId of selectedTextIds) {
        const text = activeMap.texts.find((t) => t.id === textId);
        if (!text) continue;
        ctx.save();
        ctx.strokeStyle = "#00ccff";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.globalAlpha = 0.6;
        ctx.font = `${text.fontSize}px "${text.fontFamily || "Share Tech Mono"}", monospace`;
        const metrics = ctx.measureText(text.text);
        ctx.strokeRect(text.x - 2, text.y - 2, metrics.width + 4, text.fontSize + 4);
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Selected note highlights
    const selectedNoteIds = state.selectedNoteIds || [];
    if (selectedNoteIds.length > 0) {
      for (const noteId of selectedNoteIds) {
        const note = activeMap.notes.find((n) => n.id === noteId);
        if (!note) continue;
        ctx.save();
        ctx.strokeStyle = "#00ccff";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = "#00ccff";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(note.x, note.y, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Active turn indicator (pulsing yellow glow)
    if (state.initiative?.length > 0) {
      const activeTokenId = state.initiative[0]?.tokenId;
      if (activeTokenId) {
        const token = activeMap.tokens.find((t) => t.id === activeTokenId);
        if (token && token.visible) {
          const gridSize = activeMap.grid.size || 50;
          const halfSize = (token.size * gridSize) / 2;
          const pulse = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 400));
          ctx.save();
          ctx.strokeStyle = "#ffcc00";
          ctx.lineWidth = 3;
          ctx.globalAlpha = pulse;
          ctx.shadowColor = "#ffcc00";
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(token.x, token.y, halfSize + 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Selection box (drag rectangle)
    if (selectionBox) {
      ctx.save();
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.globalAlpha = 0.8;
      const bx = Math.min(selectionBox.start.x, selectionBox.end.x);
      const by = Math.min(selectionBox.start.y, selectionBox.end.y);
      const bw = Math.abs(selectionBox.end.x - selectionBox.start.x);
      const bh = Math.abs(selectionBox.end.y - selectionBox.start.y);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = "#00ff0011";
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillRect(bx, by, bw, bh);
      ctx.restore();
    }

    // GM Pings (animated expanding rings)
    if (pings.length > 0) {
      const now = Date.now();
      for (const ping of pings) {
        const age = now - ping.timestamp;
        const progress = age / 2000;
        const alpha = 1 - progress;
        const radius = 10 + progress * 60;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ping.x, ping.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#ffcc00";
        ctx.globalAlpha = Math.max(0, alpha * 0.8);
        ctx.beginPath();
        ctx.arc(ping.x, ping.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    animFrameRef.current = requestAnimationFrame(render);
  }, [activeMap, state, isDrawing, measuring, drawingWall, placingAoE, isFogPainting, selectionBox, pings, getFogCanvas]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-terminal-bg-dark ${className || ""}`}
      style={{ cursor: getCursor(state.activeTool, isPanning, !!dragToken || isGroupDrag) }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        className="block w-full h-full vtt-main-canvas"
      />

      {/* Zoom control */}
      <VTTZoomControl />

      {/* Map name overlay */}
      {activeMap && (
        <div className="absolute top-2 left-2 text-terminal-primary/60 text-xs font-mono pointer-events-none select-none">
          {activeMap.name} | {Math.round(activeMap.zoom * 100)}%
          {state.activeTool !== "cursor" && state.activeTool !== "pan" && (
            <span className="ml-2 text-terminal-primary/40">
              [{state.activeTool}]
            </span>
          )}
        </div>
      )}

      {/* Text input overlay */}
      {textInput && activeMap && (
        <input
          ref={textInputRef}
          className="absolute bg-black/80 border border-terminal-primary/50 text-terminal-primary font-mono text-sm px-2 py-1 rounded outline-none"
          style={{
            left: textInput.screenX,
            top: textInput.screenY,
            zIndex: 20,
            minWidth: 120,
          }}
          placeholder="Type text..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value.trim();
              if (value && activeMap) {
                dispatch({
                  type: "ADD_TEXT",
                  payload: {
                    mapId: activeMap.id,
                    text: {
                      id: crypto.randomUUID(),
                      text: value,
                      x: textInput.x,
                      y: textInput.y,
                      fontSize: state.drawWidth * 6 + 10,
                      color: state.drawColor,
                      layer: state.activeLayer,
                      gmOnly: state.activeLayer === 2,
                    },
                  },
                });
              }
              setTextInput(null);
            }
            if (e.key === "Escape") {
              setTextInput(null);
            }
          }}
          onBlur={() => setTextInput(null)}
        />
      )}

      {/* Context Menu */}
      {contextMenu && activeMap && (
        <VTTContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          worldPos={contextMenu.worldPos}
          token={contextMenu.token}
          note={contextMenu.note}
          mapId={activeMap.id}
          onClose={() => setContextMenu(null)}
          onEditToken={(t) => {
            setContextMenu(null);
            setEditingToken(t);
          }}
          onEditNote={(n, wp) => {
            setContextMenu(null);
            setEditingNote({ note: n, worldPos: wp });
          }}
        />
      )}

      {/* Token Edit Modal */}
      {editingToken && activeMap && (
        <VTTTokenEditModal
          token={editingToken}
          mapId={activeMap.id}
          onClose={() => setEditingToken(null)}
        />
      )}

      {/* Note Edit Modal */}
      {editingNote && activeMap && (
        <VTTNoteModal
          note={editingNote.note}
          mapId={activeMap.id}
          defaultX={editingNote.worldPos.x}
          defaultY={editingNote.worldPos.y}
          onClose={() => setEditingNote(null)}
        />
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
  if (tool.startsWith("aoe-")) return "crosshair";
  if (tool === "measure") return "crosshair";
  if (tool === "wall" || tool === "door") return "crosshair";
  if (tool === "light" || tool === "note") return "crosshair";
  return "default";
}

function drawGrid(ctx: CanvasRenderingContext2D, map: VTTMap) {
  const { grid, width, height } = map;
  ctx.strokeStyle = grid.color;
  ctx.globalAlpha = grid.opacity;
  ctx.lineWidth = 1;

  if (grid.style === "hex") {
    drawHexGrid(ctx, width, height, grid.size);
  } else {
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
  }

  ctx.globalAlpha = 1;
}

function drawHexGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number
) {
  // Flat-top hexagon geometry
  const hexW = size;
  const hexH = (Math.sqrt(3) / 2) * hexW;
  const colWidth = hexW * 0.75;

  ctx.beginPath();

  const cols = Math.ceil(width / colWidth) + 2;
  const rows = Math.ceil(height / hexH) + 2;

  for (let col = -1; col < cols; col++) {
    for (let row = -1; row < rows; row++) {
      const cx = col * colWidth;
      const cy = row * hexH + (col % 2 === 1 ? hexH / 2 : 0);

      // Draw hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = cx + (hexW / 2) * Math.cos(angle);
        const hy = cy + (hexW / 2) * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    }
  }

  ctx.stroke();
}

function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[]) {
  for (const s of strokes) {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // GM-only items rendered dimmed with dashed lines
    const isGmOnly = s.gmOnly;
    ctx.globalAlpha = isGmOnly ? (s.opacity ?? 1) * 0.35 : (s.opacity ?? 1);
    if (isGmOnly) ctx.setLineDash([8, 4]);

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

    if (isGmOnly) ctx.setLineDash([]);
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

    // Clip to circle
    ctx.beginPath();
    ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
    ctx.closePath();

    // Draw image or fallback
    if (t.imageDataUrl) {
      const img = getTokenImage(t.imageDataUrl);
      if (img) {
        ctx.save();
        ctx.clip();
        ctx.drawImage(img, -halfSize, -halfSize, pixelSize, pixelSize);
        ctx.restore();
      } else {
        // Image still loading - draw placeholder
        ctx.fillStyle = "#1a1a2e";
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();
      // First letter fallback
      ctx.fillStyle = "#00ff00";
      ctx.font = `${Math.max(12, halfSize)}px "Share Tech Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t.name.charAt(0).toUpperCase(), 0, 0);
    }

    // Border ring
    ctx.strokeStyle = t.locked ? "#ffcc00" : "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
    ctx.stroke();

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
  }
}

function drawFogOfWar(ctx: CanvasRenderingContext2D, map: VTTMap) {
  ctx.save();
  ctx.globalAlpha = map.fog.opacity;
  ctx.fillStyle = map.fog.color || "#000000";
  ctx.fillRect(0, 0, map.width, map.height);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawWalls(ctx: CanvasRenderingContext2D, walls: VTTMap["walls"]) {
  for (const w of walls) {
    if (w.type === "door") {
      ctx.strokeStyle = w.doorOpen ? "#00ccff66" : "#00ccff";
      ctx.lineWidth = 3;
      ctx.setLineDash(w.doorOpen ? [6, 4] : []);
    } else {
      ctx.strokeStyle = w.color || "#ff6600";
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();

    // Door marker at midpoint
    if (w.type === "door") {
      const mx = (w.x1 + w.x2) / 2;
      const my = (w.y1 + w.y2) / 2;
      const angle = Math.atan2(w.y2 - w.y1, w.x2 - w.x1);
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.setLineDash([]);
      if (w.doorOpen) {
        // Open door: small arc indicator
        ctx.strokeStyle = "#00ccff88";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 8, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      } else {
        // Closed door: small filled rectangle
        ctx.fillStyle = "#00ccff";
        ctx.fillRect(-6, -3, 12, 6);
      }
      ctx.restore();
    }
  }
  ctx.setLineDash([]);
}

function drawLightIndicators(ctx: CanvasRenderingContext2D, lights: VTTMap["lights"]) {
  for (const l of lights) {
    ctx.strokeStyle = l.color + "44";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawNotes(ctx: CanvasRenderingContext2D, notes: VTTMap["notes"]) {
  for (const n of notes) {
    if (!n.visible) continue;
    ctx.fillStyle = n.color || "#00ccff";
    ctx.beginPath();
    ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = `bold 10px "Share Tech Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("i", n.x, n.y);

    if (n.title) {
      ctx.fillStyle = "#00ccff";
      ctx.font = `10px "Share Tech Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(n.title, n.x, n.y - 14);
    }
  }
}

function drawMeasurement(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  gridSize: number
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const pixelDist = Math.sqrt(dx * dx + dy * dy);
  const gridDist = pixelDist / gridSize;

  // Line
  ctx.strokeStyle = "#ffcc00";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Endpoints
  ctx.fillStyle = "#ffcc00";
  ctx.beginPath();
  ctx.arc(start.x, start.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
  ctx.fill();

  // Distance label
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const label = `${gridDist.toFixed(1)} sq`;

  ctx.font = `bold 13px "Share Tech Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  // Background
  const metrics = ctx.measureText(label);
  ctx.fillStyle = "#000000cc";
  ctx.fillRect(
    midX - metrics.width / 2 - 4,
    midY - 18,
    metrics.width + 8,
    18
  );

  ctx.fillStyle = "#ffcc00";
  ctx.fillText(label, midX, midY - 2);
}

function drawTextOverlays(ctx: CanvasRenderingContext2D, texts: TextOverlay[]) {
  for (const t of texts) {
    const isGmOnly = t.gmOnly;
    ctx.globalAlpha = isGmOnly ? 0.35 : 1;
    ctx.fillStyle = t.color;
    ctx.font = `${t.fontSize}px "${t.fontFamily || "Share Tech Mono"}", monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
  }
}

function drawAoETemplates(ctx: CanvasRenderingContext2D, templates: AoETemplate[]) {
  for (const aoe of templates) {
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

function drawAoEPreview(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  tool: string
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const radius = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;

  if (tool === "aoe-circle") {
    ctx.strokeStyle = "#ffcc00";
    ctx.fillStyle = "#ffcc0033";
    ctx.beginPath();
    ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (tool === "aoe-cone") {
    const spread = Math.PI / 6;
    ctx.strokeStyle = "#ff4400";
    ctx.fillStyle = "#ff440033";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.arc(start.x, start.y, radius, angle - spread, angle + spread);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (tool === "aoe-line") {
    const lineWidth = 20;
    const endX = start.x + Math.cos(angle) * radius;
    const endY = start.y + Math.sin(angle) * radius;
    const perpX = Math.cos(angle + Math.PI / 2) * lineWidth;
    const perpY = Math.sin(angle + Math.PI / 2) * lineWidth;

    ctx.strokeStyle = "#4488ff";
    ctx.fillStyle = "#4488ff33";
    ctx.beginPath();
    ctx.moveTo(start.x + perpX, start.y + perpY);
    ctx.lineTo(endX + perpX, endY + perpY);
    ctx.lineTo(endX - perpX, endY - perpY);
    ctx.lineTo(start.x - perpX, start.y - perpY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
