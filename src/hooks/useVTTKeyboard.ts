import { useEffect } from "react";
import { useVTT } from "@/contexts/VTTContext";
import type { VTTTool } from "@/types/vtt";

/**
 * VTT keyboard shortcuts. Only active when the VTT tab is focused.
 */
export function useVTTKeyboard(onToggleShortcuts?: () => void) {
  const { state, dispatch, activeMap, saveSession } = useVTT();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const key = e.key.toLowerCase();

      // Tool shortcuts
      const toolMap: Record<string, VTTTool> = {
        v: "cursor",
        h: "pan",
        b: "draw-freehand",
        l: "draw-line",
        r: "draw-rect",
        o: "draw-circle",
        t: "draw-text",
        m: "measure",
        w: "wall",
        d: "door",
        f: "fog-circle",
        n: "note",
        c: "aoe-circle",
        j: "aoe-cone",
        k: "aoe-line",
        p: "light",
      };

      if (!e.ctrlKey && !e.metaKey && !e.altKey && toolMap[key]) {
        e.preventDefault();
        dispatch({ type: "SET_TOOL", payload: toolMap[key] });
        return;
      }

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (key === "z" && !e.shiftKey) {
          e.preventDefault();
          dispatch({ type: "UNDO" });
          return;
        }
        if ((key === "z" && e.shiftKey) || key === "y") {
          e.preventDefault();
          dispatch({ type: "REDO" });
          return;
        }
        if (key === "s") {
          e.preventDefault();
          saveSession();
          return;
        }
        if (key === "g") {
          e.preventDefault();
          dispatch({ type: "TOGGLE_GRID" });
          return;
        }
        if (key === "c") {
          e.preventDefault();
          dispatch({ type: "COPY_SELECTION" });
          return;
        }
        if (key === "v") {
          e.preventDefault();
          if (activeMap) {
            dispatch({ type: "PASTE_CLIPBOARD", payload: { mapId: activeMap.id } });
          }
          return;
        }
        if (key === "d") {
          e.preventDefault();
          if (activeMap) {
            dispatch({ type: "COPY_SELECTION" });
            dispatch({ type: "PASTE_CLIPBOARD", payload: { mapId: activeMap.id } });
          }
          return;
        }
        return;
      }

      // Shortcut overlay toggle
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onToggleShortcuts?.();
        return;
      }

      // Grid snap toggle
      if (key === "g" && !e.ctrlKey && !e.metaKey) {
        if (activeMap) {
          dispatch({
            type: "UPDATE_MAP",
            payload: {
              id: activeMap.id,
              updates: {
                grid: { ...activeMap.grid, snap: !activeMap.grid.snap },
              },
            },
          });
        }
        return;
      }

      // Escape to deselect / close sidebar
      if (key === "escape") {
        if (state.sidebarPanel) {
          dispatch({ type: "SET_SIDEBAR", payload: null });
        } else {
          dispatch({ type: "SET_TOOL", payload: "cursor" });
        }
        return;
      }

      // Delete key - remove all selected items
      if (key === "delete" || key === "backspace") {
        const tokenIds = state.selectedTokenIds || [];
        const strokeIds = state.selectedStrokeIds || [];
        const textIds = state.selectedTextIds || [];
        const noteIds = state.selectedNoteIds || [];
        const aoeIds = state.selectedAoEIds || [];
        const lightIds = state.selectedLightIds || [];
        if ((tokenIds.length + strokeIds.length + textIds.length + noteIds.length + aoeIds.length + lightIds.length) > 0 && activeMap) {
          for (const tokenId of tokenIds) {
            const token = activeMap.tokens.find((t) => t.id === tokenId);
            if (token) {
              dispatch({
                type: "PUSH_HISTORY",
                payload: {
                  type: "token-remove",
                  mapId: activeMap.id,
                  before: token,
                  after: null,
                  timestamp: Date.now(),
                },
              });
            }
            dispatch({
              type: "REMOVE_TOKEN",
              payload: { mapId: activeMap.id, tokenId },
            });
          }
          for (const strokeId of strokeIds) {
            dispatch({
              type: "REMOVE_STROKE",
              payload: { mapId: activeMap.id, strokeId },
            });
          }
          for (const textId of textIds) {
            dispatch({
              type: "REMOVE_TEXT",
              payload: { mapId: activeMap.id, textId },
            });
          }
          for (const noteId of noteIds) {
            dispatch({
              type: "REMOVE_NOTE",
              payload: { mapId: activeMap.id, noteId },
            });
          }
          for (const aoeId of aoeIds) {
            const aoe = (activeMap.aoeTemplates || []).find((a) => a.id === aoeId);
            if (aoe) {
              dispatch({
                type: "PUSH_HISTORY",
                payload: {
                  type: "aoe-remove",
                  mapId: activeMap.id,
                  before: aoe,
                  after: null,
                  timestamp: Date.now(),
                },
              });
            }
            dispatch({ type: "REMOVE_AOE", payload: aoeId });
          }
          for (const lightId of lightIds) {
            const light = activeMap.lights.find((l) => l.id === lightId);
            if (light) {
              dispatch({
                type: "PUSH_HISTORY",
                payload: {
                  type: "light-remove",
                  mapId: activeMap.id,
                  before: light,
                  after: null,
                  timestamp: Date.now(),
                },
              });
            }
            dispatch({
              type: "REMOVE_LIGHT",
              payload: { mapId: activeMap.id, lightId },
            });
          }
          dispatch({ type: "CLEAR_SELECTION" });
        }
        return;
      }

      // Arrow key movement — nudge selected tokens one grid cell
      if (
        (key === "arrowup" || key === "arrowdown" || key === "arrowleft" || key === "arrowright") &&
        !e.ctrlKey && !e.metaKey
      ) {
        const tokenIds = state.selectedTokenIds || [];
        if (tokenIds.length > 0 && activeMap) {
          e.preventDefault();
          const step = activeMap.grid.size || 50;
          const dx = key === "arrowleft" ? -step : key === "arrowright" ? step : 0;
          const dy = key === "arrowup" ? -step : key === "arrowdown" ? step : 0;
          for (const tokenId of tokenIds) {
            const token = activeMap.tokens.find((t) => t.id === tokenId);
            if (token) {
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
        }
        return;
      }

      // Zoom controls
      if (key === "=" || key === "+") {
        if (activeMap) {
          const newZoom = Math.min(5, activeMap.zoom * 1.2);
          dispatch({
            type: "SET_VIEWPORT",
            payload: {
              mapId: activeMap.id,
              scrollX: activeMap.scrollX,
              scrollY: activeMap.scrollY,
              zoom: newZoom,
            },
          });
        }
        return;
      }
      if (key === "-") {
        if (activeMap) {
          const newZoom = Math.max(0.1, activeMap.zoom / 1.2);
          dispatch({
            type: "SET_VIEWPORT",
            payload: {
              mapId: activeMap.id,
              scrollX: activeMap.scrollX,
              scrollY: activeMap.scrollY,
              zoom: newZoom,
            },
          });
        }
        return;
      }
      if (key === "0") {
        if (activeMap) {
          dispatch({
            type: "SET_VIEWPORT",
            payload: {
              mapId: activeMap.id,
              scrollX: 0,
              scrollY: 0,
              zoom: 1,
            },
          });
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, dispatch, activeMap, saveSession, onToggleShortcuts]);
}
