import { useVTT } from "@/contexts/VTTContext";
import type { Token } from "@/types/vtt";
import { Minus, Plus, Flame } from "lucide-react";

const COMMON_CONDITIONS = [
  { name: "Stunned", color: "#ffcc00" },
  { name: "Prone", color: "#ff6600" },
  { name: "Wounded", color: "#ff3344" },
  { name: "Unconscious", color: "#aa44ff" },
  { name: "Poisoned", color: "#3ae2b3" },
  { name: "Blinded", color: "#666666" },
];

interface VTTTokenHUDProps {
  token: Token;
  mapId: string;
  screenX: number;
  screenY: number;
}

export default function VTTTokenHUD({ token, mapId, screenX, screenY }: VTTTokenHUDProps) {
  const { dispatch } = useVTT();

  const update = (updates: Partial<Token>) => {
    dispatch({
      type: "UPDATE_TOKEN",
      payload: { mapId, tokenId: token.id, updates },
    });
  };

  const adjustHp = (delta: number) => {
    update({ hp: Math.max(0, token.maxHp > 0 ? Math.min(token.maxHp, token.hp + delta) : token.hp + delta) });
  };

  const toggleCondition = (condName: string, condColor: string) => {
    const has = token.conditions.some((c) => c.name === condName);
    if (has) {
      update({ conditions: token.conditions.filter((c) => c.name !== condName) });
    } else {
      update({ conditions: [...token.conditions, { name: condName, color: condColor }] });
    }
  };

  const toggleTorch = () => {
    if ((token.lightBrightRadius ?? 0) > 0) {
      update({ lightBrightRadius: 0, lightDimRadius: 0 });
    } else {
      update({ lightBrightRadius: 4, lightDimRadius: 8, lightColor: "#ffaa44" });
    }
  };

  return (
    <div
      className="absolute pointer-events-auto z-30"
      style={{
        left: screenX,
        top: screenY,
        transform: "translate(-50%, -100%)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="vtt-hud px-2 py-1.5 flex flex-col gap-1.5 min-w-[180px]">
        {/* HP row */}
        <div className="flex items-center gap-1.5 justify-center">
          <button
            onClick={() => adjustHp(-1)}
            className="w-5 h-5 flex items-center justify-center rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold"
          >
            <Minus size={10} />
          </button>
          <span className="text-[var(--primary)] font-mono text-xs font-bold min-w-[50px] text-center">
            {token.hp} / {token.maxHp}
          </span>
          <button
            onClick={() => adjustHp(1)}
            className="w-5 h-5 flex items-center justify-center rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-bold"
          >
            <Plus size={10} />
          </button>
          <div className="w-px h-4 bg-[rgba(58,226,179,0.15)] mx-0.5" />
          {/* Elevation */}
          <span className="text-[9px] text-[rgba(58,226,179,0.4)] font-mono">ELV</span>
          <input
            type="number"
            value={token.elevation ?? 0}
            onChange={(e) => update({ elevation: parseInt(e.target.value, 10) || 0 })}
            className="vtt-input w-10 text-center !text-[10px] !py-0 !px-1"
          />
          {/* Torch toggle */}
          <button
            onClick={toggleTorch}
            className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
              (token.lightBrightRadius ?? 0) > 0
                ? "bg-orange-500/30 text-orange-400"
                : "bg-[var(--bg-dark)] text-[rgba(58,226,179,0.3)] hover:text-[rgba(58,226,179,0.5)]"
            }`}
            title="Toggle torch (bright 4 / dim 8)"
          >
            <Flame size={10} />
          </button>
        </div>

        {/* Quick conditions */}
        <div className="flex flex-wrap gap-0.5 justify-center">
          {COMMON_CONDITIONS.map((cond) => {
            const active = token.conditions.some((c) => c.name === cond.name);
            return (
              <button
                key={cond.name}
                onClick={() => toggleCondition(cond.name, cond.color)}
                className={`px-1.5 py-0 text-[9px] font-mono rounded border transition-colors ${
                  active
                    ? "border-current bg-current/10"
                    : "border-[rgba(58,226,179,0.1)] text-[rgba(58,226,179,0.3)] hover:text-[rgba(58,226,179,0.5)]"
                }`}
                style={active ? { color: cond.color, borderColor: cond.color + "66" } : undefined}
              >
                {cond.name.slice(0, 4)}
              </button>
            );
          })}
        </div>
      </div>
      {/* Arrow pointing down to token */}
      <div className="flex justify-center">
        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[rgba(58,226,179,0.35)]" />
      </div>
    </div>
  );
}
