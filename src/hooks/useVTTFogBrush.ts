import { useRef, useCallback, useEffect } from "react";
import type { VTTMap } from "@/types/vtt";

/**
 * Fog of war brush system.
 * Maintains an offscreen canvas representing the fog mask.
 * Drawing with "destination-out" reveals (erases fog),
 * drawing with "source-over" conceals (adds fog).
 */
export function useVTTFogBrush(map: VTTMap | null) {
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fogCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize fog canvas when map changes
  useEffect(() => {
    if (!map) {
      fogCanvasRef.current = null;
      fogCtxRef.current = null;
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = map.width;
    canvas.height = map.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load existing fog data or fill with fog
    if (map.fog.dataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = map.fog.dataUrl;
    } else if (map.fog.enabled) {
      // Full fog
      ctx.fillStyle = map.fog.color || "#000000";
      ctx.fillRect(0, 0, map.width, map.height);
    }

    fogCanvasRef.current = canvas;
    fogCtxRef.current = ctx;
  }, [map?.id, map?.width, map?.height]);

  /**
   * Paint fog at a position (reveal or conceal).
   */
  const paintFog = useCallback(
    (
      x: number,
      y: number,
      radius: number,
      mode: "reveal" | "conceal",
      shape: "circle" | "rect" = "circle"
    ) => {
      const ctx = fogCtxRef.current;
      if (!ctx || !map) return;

      if (mode === "reveal") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = map.fog.color || "#000000";
      }

      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }

      ctx.globalCompositeOperation = "source-over";
    },
    [map]
  );

  /**
   * Reset fog to fully concealed or fully revealed.
   */
  const resetFog = useCallback(
    (mode: "full" | "clear") => {
      const ctx = fogCtxRef.current;
      if (!ctx || !map) return;

      ctx.clearRect(0, 0, map.width, map.height);

      if (mode === "full") {
        ctx.fillStyle = map.fog.color || "#000000";
        ctx.fillRect(0, 0, map.width, map.height);
      }
    },
    [map]
  );

  /**
   * Export the fog canvas as a data URL for persistence.
   */
  const exportFogData = useCallback((): string | null => {
    return fogCanvasRef.current?.toDataURL("image/png") ?? null;
  }, []);

  /**
   * Get the fog canvas for rendering in the main canvas.
   */
  const getFogCanvas = useCallback((): HTMLCanvasElement | null => {
    return fogCanvasRef.current;
  }, []);

  return {
    paintFog,
    resetFog,
    exportFogData,
    getFogCanvas,
  };
}
