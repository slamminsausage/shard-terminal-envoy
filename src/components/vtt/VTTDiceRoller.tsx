import { useState } from "react";
import { useVTT } from "@/contexts/VTTContext";
import { Dice5, Plus, Minus } from "lucide-react";

function roll2d6(): number {
  return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}

function rollDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
}

interface RollResult {
  label: string;
  dice: number[];
  modifier: number;
  total: number;
  timestamp: number;
}

export default function VTTDiceRoller() {
  const [results, setResults] = useState<RollResult[]>([]);
  const [modifier, setModifier] = useState(0);
  const [diceCount, setDiceCount] = useState(2);
  const [diceSides, setDiceSides] = useState(6);
  const [customLabel, setCustomLabel] = useState("");

  const doRoll = (label?: string) => {
    const dice = rollDice(diceCount, diceSides);
    const sum = dice.reduce((a, b) => a + b, 0);
    const result: RollResult = {
      label: label || customLabel || `${diceCount}d${diceSides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
      dice,
      modifier,
      total: sum + modifier,
      timestamp: Date.now(),
    };
    setResults((prev) => [result, ...prev].slice(0, 20));
  };

  const doQuick2d6 = () => {
    const dice = rollDice(2, 6);
    const sum = dice.reduce((a, b) => a + b, 0);
    setResults((prev) =>
      [
        {
          label: `2d6${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
          dice,
          modifier,
          total: sum + modifier,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 20)
    );
  };

  const doBoon = () => {
    const dice = rollDice(3, 6);
    dice.sort((a, b) => b - a);
    const kept = [dice[0], dice[1]];
    const sum = kept[0] + kept[1];
    setResults((prev) =>
      [
        {
          label: `Boon (3d6 keep 2 best)${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
          dice,
          modifier,
          total: sum + modifier,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 20)
    );
  };

  const doBane = () => {
    const dice = rollDice(3, 6);
    dice.sort((a, b) => a - b);
    const kept = [dice[0], dice[1]];
    const sum = kept[0] + kept[1];
    setResults((prev) =>
      [
        {
          label: `Bane (3d6 keep 2 worst)${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
          dice,
          modifier,
          total: sum + modifier,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 20)
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 space-y-3 border-b border-terminal-border/20">
        {/* Quick Traveller rolls */}
        <div>
          <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
            Traveller Rolls
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={doQuick2d6}
              className="px-2 py-1.5 text-xs font-mono rounded border border-terminal-primary/30 text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
            >
              2d6
            </button>
            <button
              onClick={doBoon}
              className="px-2 py-1.5 text-xs font-mono rounded border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
            >
              Boon
            </button>
            <button
              onClick={doBane}
              className="px-2 py-1.5 text-xs font-mono rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Bane
            </button>
          </div>
        </div>

        {/* DM modifier */}
        <div>
          <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
            DM (modifier)
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setModifier((m) => m - 1)}
              className="w-7 h-7 flex items-center justify-center rounded border border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="flex-1 text-center text-sm font-mono text-terminal-primary">
              {modifier >= 0 ? `+${modifier}` : modifier}
            </span>
            <button
              onClick={() => setModifier((m) => m + 1)}
              className="w-7 h-7 flex items-center justify-center rounded border border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Custom dice */}
        <div>
          <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
            Custom Roll
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={20}
              value={diceCount}
              onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-1.5 py-1 rounded font-mono text-center focus:border-terminal-primary/50 focus:outline-none"
            />
            <span className="text-terminal-primary/40 text-xs font-mono">d</span>
            <input
              type="number"
              min={2}
              max={100}
              value={diceSides}
              onChange={(e) => setDiceSides(Math.max(2, parseInt(e.target.value) || 6))}
              className="w-12 bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-1.5 py-1 rounded font-mono text-center focus:border-terminal-primary/50 focus:outline-none"
            />
            <button
              onClick={() => doRoll()}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs font-mono rounded border border-terminal-primary/30 text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
            >
              <Dice5 size={12} /> Roll
            </button>
          </div>
        </div>
      </div>

      {/* Results log */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {results.length === 0 ? (
          <div className="text-terminal-primary/20 text-xs font-mono text-center py-6">
            No rolls yet
          </div>
        ) : (
          results.map((r, i) => (
            <div
              key={r.timestamp + i}
              className={`p-2 rounded border ${
                i === 0
                  ? "bg-terminal-primary/5 border-terminal-primary/30"
                  : "border-terminal-border/15 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-terminal-primary/50 font-mono">
                  {r.label}
                </span>
                <span
                  className={`text-sm font-mono font-bold ${
                    r.total >= 8
                      ? "text-green-400"
                      : r.total >= 6
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {r.total}
                </span>
              </div>
              <div className="text-[10px] text-terminal-primary/40 font-mono mt-0.5">
                [{r.dice.join(", ")}]
                {r.modifier !== 0 && (
                  <span>
                    {" "}
                    {r.modifier > 0 ? "+" : ""}
                    {r.modifier}
                  </span>
                )}
                <span className="ml-2 text-terminal-primary/20">
                  {r.total >= 8 ? "Success" : "Fail"} (8+)
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {results.length > 0 && (
        <div className="p-2 border-t border-terminal-border/20">
          <button
            onClick={() => setResults([])}
            className="w-full text-[10px] font-mono text-terminal-primary/30 hover:text-terminal-primary/50 transition-colors"
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}
