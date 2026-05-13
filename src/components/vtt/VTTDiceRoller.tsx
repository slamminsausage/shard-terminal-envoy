import { useState, useRef, useEffect } from "react";
import { useVTT } from "@/contexts/VTTContext";
import { Dice5, Plus, Minus } from "lucide-react";
import type { PresenterMessage } from "@/hooks/useVTTPresenter";

function rollDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
}

interface RollResult {
  label: string;
  dice: number[];
  droppedIndices?: number[];
  modifier: number;
  total: number;
  timestamp: number;
  isCustom?: boolean;
}

const CHANNEL_NAME = "shard-vtt-presenter";

export default function VTTDiceRoller() {
  const [results, setResults] = useState<RollResult[]>([]);
  const [modifier, setModifier] = useState(0);
  const [diceCount, setDiceCount] = useState(2);
  const [diceSides, setDiceSides] = useState(6);
  const [customLabel, setCustomLabel] = useState("");
  const [broadcastEnabled, setBroadcastEnabled] = useState(true);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  const broadcastRoll = (result: RollResult) => {
    if (!broadcastEnabled) return;
    // Only send the kept dice to the presenter
    const keptDice = result.droppedIndices
      ? result.dice.filter((_, i) => !result.droppedIndices!.includes(i))
      : result.dice;
    channelRef.current?.postMessage({
      type: "dice-roll",
      label: result.label,
      dice: keptDice,
      total: result.total,
      modifier: result.modifier,
    } satisfies PresenterMessage);
  };

  const doRoll = (label?: string) => {
    const dice = rollDice(diceCount, diceSides);
    const sum = dice.reduce((a, b) => a + b, 0);
    const result: RollResult = {
      label: label || customLabel || `${diceCount}d${diceSides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
      dice,
      modifier,
      total: sum + modifier,
      timestamp: Date.now(),
      isCustom: true,
    };
    setResults((prev) => [result, ...prev].slice(0, 20));
    broadcastRoll(result);
  };

  const doQuick2d6 = () => {
    const dice = rollDice(2, 6);
    const sum = dice.reduce((a, b) => a + b, 0);
    const result: RollResult = {
      label: `2d6${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
      dice,
      modifier,
      total: sum + modifier,
      timestamp: Date.now(),
    };
    setResults((prev) => [result, ...prev].slice(0, 20));
    broadcastRoll(result);
  };

  const doBoon = () => {
    const dice = rollDice(3, 6);
    const sorted = [...dice].map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
    const droppedIndices = [sorted[2].i];
    const keptSum = sorted[0].v + sorted[1].v;
    const result: RollResult = {
      label: `Boon (3d6 keep 2 best)${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
      dice,
      droppedIndices,
      modifier,
      total: keptSum + modifier,
      timestamp: Date.now(),
    };
    setResults((prev) => [result, ...prev].slice(0, 20));
    broadcastRoll(result);
  };

  const doBane = () => {
    const dice = rollDice(3, 6);
    const sorted = [...dice].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const droppedIndices = [sorted[2].i];
    const keptSum = sorted[0].v + sorted[1].v;
    const result: RollResult = {
      label: `Bane (3d6 keep 2 worst)${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
      dice,
      droppedIndices,
      modifier,
      total: keptSum + modifier,
      timestamp: Date.now(),
    };
    setResults((prev) => [result, ...prev].slice(0, 20));
    broadcastRoll(result);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="vtt-panel-section space-y-3">
        {/* Quick Traveller rolls */}
        <div>
          <label className="vtt-section-label block mb-1">
            Traveller Rolls
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={doQuick2d6}
              className="vtt-btn"
            >
              2d6
            </button>
            <button
              onClick={doBoon}
              className="vtt-btn text-green-400 border-green-500/30 hover:bg-green-500/10"
            >
              Boon
            </button>
            <button
              onClick={doBane}
              className="vtt-btn danger"
            >
              Bane
            </button>
          </div>
        </div>

        {/* DM modifier */}
        <div>
          <label className="vtt-section-label block mb-1">
            DM (modifier)
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setModifier((m) => m - 1)}
              className="vtt-btn w-7 h-7 justify-center px-0"
            >
              <Minus size={12} />
            </button>
            <span className="flex-1 text-center text-sm font-mono text-terminal-primary">
              {modifier >= 0 ? `+${modifier}` : modifier}
            </span>
            <button
              onClick={() => setModifier((m) => m + 1)}
              className="vtt-btn w-7 h-7 justify-center px-0"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Custom dice */}
        <div>
          <label className="vtt-section-label block mb-1">
            Custom Roll
          </label>
          <div className="flex items-center gap-1 mb-1">
            <input
              type="number"
              min={1}
              max={20}
              value={diceCount}
              onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="vtt-input w-12 text-center px-1.5"
            />
            <span className="text-terminal-primary/40 text-xs font-mono">d</span>
            <input
              type="number"
              min={2}
              max={100}
              value={diceSides}
              onChange={(e) => setDiceSides(Math.max(2, parseInt(e.target.value, 10) || 6))}
              className="vtt-input w-12 text-center px-1.5"
            />
            <button
              onClick={() => doRoll()}
              className="vtt-btn flex-1 justify-center"
            >
              <Dice5 size={12} /> Roll
            </button>
          </div>
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Label (optional)..."
            className="vtt-input w-full"
          />
        </div>
      </div>

      {/* Results log */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {results.length === 0 ? (
          <div className="vtt-empty py-6">
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
                    r.isCustom
                      ? "text-terminal-primary"
                      : r.total >= 8
                      ? "text-green-400"
                      : r.total >= 6
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {r.total}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap mt-0.5">
                {r.dice.map((d, di) => {
                  const dropped = r.droppedIndices?.includes(di);
                  return (
                    <span
                      key={di}
                      className={`text-[10px] font-mono px-1 rounded ${
                        dropped
                          ? "text-terminal-primary/20 line-through"
                          : "text-terminal-primary/60"
                      }`}
                    >
                      {d}
                    </span>
                  );
                })}
                {r.modifier !== 0 && (
                  <span className="text-[10px] text-terminal-primary/40 font-mono">
                    {r.modifier > 0 ? "+" : ""}
                    {r.modifier}
                  </span>
                )}
                {!r.isCustom && (
                  <span className="ml-auto text-terminal-primary/20 text-[10px] font-mono">
                    {r.total >= 8 ? "✓ 8+" : "✗ 8+"}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-terminal-border/20 space-y-1">
        <label className="vtt-checkbox">
          <input
            type="checkbox"
            checked={broadcastEnabled}
            onChange={(e) => setBroadcastEnabled(e.target.checked)}
          />
          Show rolls on presenter
        </label>
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
