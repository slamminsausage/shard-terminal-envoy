import { Plus, Minus } from "lucide-react";
import { useVTT } from "@/contexts/VTTContext";
import { clamp } from "@/lib/vtt/geometry";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

export default function VTTZoomControl() {
  const { state, dispatch, activeMap } = useVTT();

  if (!activeMap) return null;

  const zoom = activeMap.zoom;
  const pct = Math.round(zoom * 100);

  const setZoomCentered = (newZoom: number) => {
    const clamped = clamp(newZoom, MIN_ZOOM, MAX_ZOOM);
    if (clamped === zoom) return;

    // Zoom from the center of the viewport
    const canvas = document.querySelector<HTMLCanvasElement>(".vtt-main-canvas");
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const viewCenterX = rect.width / 2;
      const viewCenterY = rect.height / 2;

      // World position at the center of the viewport
      const worldCenterX = viewCenterX / zoom + activeMap.scrollX;
      const worldCenterY = viewCenterY / zoom + activeMap.scrollY;

      // New scroll so that worldCenter stays at viewport center
      const newScrollX = worldCenterX - viewCenterX / clamped;
      const newScrollY = worldCenterY - viewCenterY / clamped;

      dispatch({
        type: "SET_VIEWPORT",
        payload: {
          mapId: activeMap.id,
          scrollX: newScrollX,
          scrollY: newScrollY,
          zoom: clamped,
        },
      });
    } else {
      dispatch({
        type: "SET_VIEWPORT",
        payload: {
          mapId: activeMap.id,
          scrollX: activeMap.scrollX,
          scrollY: activeMap.scrollY,
          zoom: clamped,
        },
      });
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value) / 100;
    setZoomCentered(newZoom);
  };

  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1">
      {/* Zoom In button */}
      <button
        onClick={() => setZoomCentered(zoom + ZOOM_STEP)}
        className="vtt-btn-icon border border-[rgba(0,255,0,0.2)] bg-black/70"
        title="Zoom In"
      >
        <Plus size={14} />
      </button>

      {/* Vertical slider */}
      <div className="relative h-32 flex items-center">
        <input
          type="range"
          min={MIN_ZOOM * 100}
          max={MAX_ZOOM * 100}
          step={1}
          value={pct}
          onChange={handleSliderChange}
          className="vtt-zoom-slider"
          title={`${pct}%`}
          style={{
            writingMode: "vertical-lr",
            direction: "rtl",
            width: "32px",
            height: "128px",
            appearance: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Zoom Out button */}
      <button
        onClick={() => setZoomCentered(zoom - ZOOM_STEP)}
        className="vtt-btn-icon border border-[rgba(0,255,0,0.2)] bg-black/70"
        title="Zoom Out"
      >
        <Minus size={14} />
      </button>

      {/* Percentage display */}
      <div className="text-[10px] text-[rgba(0,255,0,0.5)] font-mono mt-0.5">
        {pct}%
      </div>
    </div>
  );
}
