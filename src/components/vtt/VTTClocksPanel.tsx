import { useState } from "react";
import { useVTT } from "@/contexts/VTTContext";
import type { Clock } from "@/types/vtt";
import { Plus, Trash2 } from "lucide-react";

const CLOCK_COLORS = ["#3ae2b3", "#00ccff", "#ff6600", "#ff3344", "#ffcc00", "#aa44ff"];

export default function VTTClocksPanel() {
  const { state, dispatch } = useVTT();
  const [newName, setNewName] = useState("");
  const [newSegments, setNewSegments] = useState("4");

  const handleAdd = () => {
    const clock: Clock = {
      id: crypto.randomUUID(),
      name: newName.trim() || `Clock ${state.clocks.length + 1}`,
      segments: Math.max(2, Math.min(12, parseInt(newSegments, 10) || 4)),
      filled: 0,
      color: CLOCK_COLORS[state.clocks.length % CLOCK_COLORS.length],
    };
    dispatch({ type: "ADD_CLOCK", payload: clock });
    setNewName("");
  };

  const handleClick = (clock: Clock) => {
    const next = clock.filled >= clock.segments ? 0 : clock.filled + 1;
    dispatch({
      type: "UPDATE_CLOCK",
      payload: { id: clock.id, updates: { filled: next } },
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="vtt-panel-section space-y-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Clock name..."
            className="vtt-input flex-1"
          />
          <input
            type="number"
            value={newSegments}
            onChange={(e) => setNewSegments(e.target.value)}
            min={2}
            max={12}
            className="vtt-input w-10 text-center"
          />
          <button
            onClick={handleAdd}
            className="vtt-btn justify-center w-7 h-7"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {state.clocks.length === 0 ? (
          <div className="vtt-empty">
            No clocks yet.
            <br />
            Create one above.
          </div>
        ) : (
          state.clocks.map((clock) => (
            <div key={clock.id} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-terminal-primary text-xs font-mono">
                  {clock.name}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-terminal-primary/40 font-mono">
                    {clock.filled}/{clock.segments}
                  </span>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_CLOCK", payload: clock.id })
                    }
                    className="p-0.5 text-terminal-primary/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
              <ClockSVG clock={clock} onClick={() => handleClick(clock)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ClockSVG({ clock, onClick }: { clock: Clock; onClick: () => void }) {
  const size = 80;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

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
        strokeWidth={1.5}
        opacity={filled ? 0.8 : 0.2}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto cursor-pointer hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <circle cx={cx} cy={cy} r={r} fill="transparent" stroke={clock.color} strokeWidth={2} opacity={0.3} />
      {segments}
    </svg>
  );
}
