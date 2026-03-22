import { useVTT } from "@/contexts/VTTContext";
import {
  AlignStartVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignCenterVertical,
  AlignCenterHorizontal,
  Columns3,
  Rows3,
} from "lucide-react";

type Alignment = "left" | "right" | "top" | "bottom" | "center-h" | "center-v" | "distribute-h" | "distribute-v";

const buttons: { alignment: Alignment; icon: React.ReactNode; label: string }[] = [
  { alignment: "left", icon: <AlignStartVertical size={14} />, label: "Align Left" },
  { alignment: "center-h", icon: <AlignCenterVertical size={14} />, label: "Center Horizontal" },
  { alignment: "right", icon: <AlignEndVertical size={14} />, label: "Align Right" },
  { alignment: "top", icon: <AlignStartHorizontal size={14} />, label: "Align Top" },
  { alignment: "center-v", icon: <AlignCenterHorizontal size={14} />, label: "Center Vertical" },
  { alignment: "bottom", icon: <AlignEndHorizontal size={14} />, label: "Align Bottom" },
  { alignment: "distribute-h", icon: <Columns3 size={14} />, label: "Distribute Horizontal" },
  { alignment: "distribute-v", icon: <Rows3 size={14} />, label: "Distribute Vertical" },
];

export default function VTTAlignmentBar() {
  const { state, dispatch, activeMap } = useVTT();

  const totalSelected =
    (state.selectedTokenIds?.length || 0) +
    (state.selectedStrokeIds?.length || 0) +
    (state.selectedTextIds?.length || 0) +
    (state.selectedNoteIds?.length || 0);

  if (totalSelected < 2 || !activeMap) return null;

  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 flex gap-0.5 vtt-hud px-1.5 py-1">
      {buttons.map(({ alignment, icon, label }) => (
        <button
          key={alignment}
          onClick={() =>
            dispatch({
              type: "ALIGN_SELECTION",
              payload: { mapId: activeMap.id, alignment },
            })
          }
          className="vtt-btn-icon"
          title={label}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
