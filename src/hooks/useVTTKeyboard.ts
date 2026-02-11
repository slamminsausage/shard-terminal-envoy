import { useEffect } from "react";
import { useVTT } from "@/contexts/VTTContext";
import type { VTTTool } from "@/types/vtt";

/**
 * VTT keyboard shortcuts. Only active when the VTT tab is focused.
 */
export function useVTTKeyboard() {
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

      // Delete key - remove selected tokens
      if (key === "delete" || key === "backspace") {
        const ids = state.selectedTokenIds || [];
        if (ids.length > 0 && activeMap) {
          for (const tokenId of ids) {
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
          dispatch({ type: "CLEAR_SELECTION" });
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
  }, [state, dispatch, activeMap, saveSession]);
}
