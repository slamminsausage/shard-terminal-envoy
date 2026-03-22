import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dice5,
  Swords,
  Music,
  Sparkles,
  Pencil,
  Minus,
  Square,
  Circle,
  Type,
  ChevronUp,
  ChevronDown,
  Plus,
  Volume2,
  VolumeX,
  Eraser,
  Undo2,
} from "lucide-react";
import type { InitiativeEntry, Point } from "@/types/vtt";

const CHANNEL_NAME = "shard-vtt-presenter";

// ─── Dice Roller ───────────────────────────────────────────────────────────

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

// ─── Player Toolbar Component ──────────────────────────────────────────────

interface VTTPlayerToolbarProps {
  initiative: InitiativeEntry[];
  onDrawingChange?: (strokes: PlayerStroke[]) => void;
}

export interface PlayerStroke {
  id: string;
  tool: "freehand" | "line" | "rect" | "circle";
  points: Point[];
  color: string;
  width: number;
}

type PlayerTool = "none" | "draw-freehand" | "draw-line" | "draw-rect" | "draw-circle" | "draw-text";
type PanelId = "dice" | "initiative" | "audio" | "fx" | "draw" | null;

const DRAW_COLORS = ["#00ff00", "#00ccff", "#ff6600", "#ff3344", "#ffcc00", "#ffffff"];
const DRAW_WIDTHS = [2, 3, 5, 8];

export default function VTTPlayerToolbar({ initiative, onDrawingChange }: VTTPlayerToolbarProps) {
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Dice state
  const [modifier, setModifier] = useState(0);
  const [diceResults, setDiceResults] = useState<RollResult[]>([]);

  // Drawing state
  const [playerTool, setPlayerTool] = useState<PlayerTool>("none");
  const [drawColor, setDrawColor] = useState("#00ff00");
  const [drawWidth, setDrawWidth] = useState(3);
  const [playerStrokes, setPlayerStrokes] = useState<PlayerStroke[]>([]);

  // Audio mute
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  const togglePanel = (panel: PanelId) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
      setExpanded(true);
    }
  };

  // ─── Dice functions ─────────────────────────────────────────────────

  const broadcastRoll = useCallback((result: RollResult) => {
    channelRef.current?.postMessage({
      type: "dice-roll",
      label: result.label,
      dice: result.dice,
      total: result.total,
      modifier: result.modifier,
    });
  }, []);

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
    setDiceResults((prev) => [result, ...prev].slice(0, 10));
    broadcastRoll(result);
  };

  const doBoon = () => {
    const dice = rollDice(3, 6);
    dice.sort((a, b) => b - a);
    const sum = dice[0] + dice[1];
    const result: RollResult = {
      label: "Boon",
      dice,
      modifier,
      total: sum + modifier,
      timestamp: Date.now(),
    };
    setDiceResults((prev) => [result, ...prev].slice(0, 10));
    broadcastRoll(result);
  };

  const doBane = () => {
    const dice = rollDice(3, 6);
    dice.sort((a, b) => a - b);
    const sum = dice[0] + dice[1];
    const result: RollResult = {
      label: "Bane",
      dice,
      modifier,
      total: sum + modifier,
      timestamp: Date.now(),
    };
    setDiceResults((prev) => [result, ...prev].slice(0, 10));
    broadcastRoll(result);
  };

  // ─── Drawing ────────────────────────────────────────────────────────

  const undoLastStroke = () => {
    setPlayerStrokes((prev) => {
      const next = prev.slice(0, -1);
      onDrawingChange?.(next);
      return next;
    });
  };

  const clearDrawings = () => {
    setPlayerStrokes([]);
    onDrawingChange?.([]);
  };

  // ─── Audio mute ─────────────────────────────────────────────────────

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    // Mute/unmute all audio elements on the page
    document.querySelectorAll("audio").forEach((el) => {
      (el as HTMLAudioElement).muted = newMuted;
    });
  };

  const toolbarBtnClass = (active: boolean) =>
    `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded transition-all ${
      active
        ? "text-[var(--primary)] bg-[rgba(0,255,0,0.1)]"
        : "text-[rgba(0,255,0,0.4)] hover:text-[var(--primary)] hover:bg-[rgba(0,255,0,0.05)]"
    }`;

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
      {/* Expanded panel content */}
      {expanded && activePanel && (
        <div className="mb-1 bg-[#0a0f0a]/95 border border-terminal-border/30 rounded-t-lg shadow-lg shadow-black/50 backdrop-blur-sm min-w-[280px] max-w-[400px] max-h-[300px] overflow-y-auto">
          {activePanel === "dice" && (
            <div className="p-3 space-y-2">
              <div className="text-[10px] text-terminal-primary/50 font-mono uppercase tracking-wider mb-1">Dice Roller</div>
              <div className="flex gap-1">
                <button onClick={doQuick2d6} className="vtt-btn flex-1 justify-center">2d6</button>
                <button onClick={doBoon} className="vtt-btn flex-1 justify-center text-green-400 border-green-500/30">Boon</button>
                <button onClick={doBane} className="vtt-btn flex-1 justify-center text-red-400 border-red-500/30">Bane</button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-terminal-primary/40 font-mono">DM:</span>
                <button onClick={() => setModifier((m) => m - 1)} className="vtt-btn w-6 h-6 justify-center px-0"><Minus size={10} /></button>
                <span className="w-8 text-center text-xs font-mono text-terminal-primary">{modifier >= 0 ? `+${modifier}` : modifier}</span>
                <button onClick={() => setModifier((m) => m + 1)} className="vtt-btn w-6 h-6 justify-center px-0"><Plus size={10} /></button>
              </div>
              {diceResults.length > 0 && (
                <div className="space-y-1 max-h-[120px] overflow-y-auto">
                  {diceResults.map((r, i) => (
                    <div key={r.timestamp + i} className={`flex items-center justify-between px-2 py-1 rounded ${i === 0 ? "bg-terminal-primary/5 border border-terminal-primary/20" : "opacity-60"}`}>
                      <span className="text-[9px] text-terminal-primary/50 font-mono">{r.label} [{r.dice.join(",")}]</span>
                      <span className={`text-xs font-mono font-bold ${r.total >= 8 ? "text-green-400" : r.total >= 6 ? "text-yellow-400" : "text-red-400"}`}>{r.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activePanel === "initiative" && (
            <div className="p-3 space-y-1">
              <div className="text-[10px] text-terminal-primary/50 font-mono uppercase tracking-wider mb-1">Initiative Tracker</div>
              {initiative.length === 0 ? (
                <div className="text-[10px] text-terminal-primary/30 font-mono text-center py-4">No initiative set</div>
              ) : (
                initiative.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                      index === 0 ? "bg-[rgba(0,255,0,0.08)] border border-[rgba(0,255,0,0.2)]" : "border border-transparent"
                    }`}
                  >
                    <span className="w-6 text-center text-[var(--primary)] font-mono text-sm font-bold">{entry.initiative}</span>
                    <span className={`text-xs font-mono flex-1 truncate ${index === 0 ? "text-[var(--primary)]" : "text-[rgba(0,255,0,0.6)]"}`}>
                      {entry.name}
                    </span>
                    {entry.isNPC && <span className="vtt-badge danger">NPC</span>}
                    {index === 0 && <span className="text-[8px] text-yellow-400 font-mono">ACTIVE</span>}
                  </div>
                ))
              )}
            </div>
          )}

          {activePanel === "audio" && (
            <div className="p-3 space-y-2">
              <div className="text-[10px] text-terminal-primary/50 font-mono uppercase tracking-wider mb-1">Audio</div>
              <button onClick={toggleMute} className={`vtt-btn w-full justify-center ${muted ? "danger" : ""}`}>
                {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                {muted ? "Unmute Audio" : "Mute Audio"}
              </button>
              <div className="text-[9px] text-terminal-primary/30 font-mono text-center">
                Audio is controlled by the GM
              </div>
            </div>
          )}

          {activePanel === "fx" && (
            <div className="p-3 space-y-2">
              <div className="text-[10px] text-terminal-primary/50 font-mono uppercase tracking-wider mb-1">Effects</div>
              <div className="text-[9px] text-terminal-primary/30 font-mono text-center py-4">
                Weather and particle effects are controlled by the GM and displayed automatically.
              </div>
            </div>
          )}

          {activePanel === "draw" && (
            <div className="p-3 space-y-2">
              <div className="text-[10px] text-terminal-primary/50 font-mono uppercase tracking-wider mb-1">Drawing Tools</div>
              <div className="flex gap-1">
                {[
                  { tool: "draw-freehand" as PlayerTool, icon: <Pencil size={12} />, label: "Free" },
                  { tool: "draw-line" as PlayerTool, icon: <Minus size={12} />, label: "Line" },
                  { tool: "draw-rect" as PlayerTool, icon: <Square size={12} />, label: "Rect" },
                  { tool: "draw-circle" as PlayerTool, icon: <Circle size={12} />, label: "Circle" },
                ].map(({ tool, icon, label }) => (
                  <button
                    key={tool}
                    onClick={() => setPlayerTool(playerTool === tool ? "none" : tool)}
                    className={`vtt-btn flex-1 justify-center ${playerTool === tool ? "vtt-option--active" : ""}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-terminal-primary/40 font-mono">Color:</span>
                <div className="flex gap-1">
                  {DRAW_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDrawColor(c)}
                      className={`w-4 h-4 rounded border ${drawColor === c ? "border-terminal-primary scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-terminal-primary/40 font-mono">Width:</span>
                <div className="flex gap-1">
                  {DRAW_WIDTHS.map((w) => (
                    <button
                      key={w}
                      onClick={() => setDrawWidth(w)}
                      className={`w-5 h-5 flex items-center justify-center rounded ${drawWidth === w ? "bg-[rgba(0,255,0,0.15)] border border-[var(--primary)]" : ""}`}
                    >
                      <div className="rounded-full bg-terminal-primary" style={{ width: Math.min(w * 1.5, 10), height: Math.min(w * 1.5, 10) }} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={undoLastStroke} disabled={playerStrokes.length === 0} className="vtt-btn flex-1 justify-center"><Undo2 size={10} /> Undo</button>
                <button onClick={clearDrawings} disabled={playerStrokes.length === 0} className="vtt-btn danger flex-1 justify-center"><Eraser size={10} /> Clear</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed toolbar bar */}
      <div className="bg-[#0a0f0a]/90 border border-terminal-border/30 rounded-t-lg shadow-lg shadow-black/50 backdrop-blur-sm flex items-center gap-0.5 px-1.5 py-0.5">
        {/* Toggle expand */}
        <button
          onClick={() => {
            setExpanded(!expanded);
            if (expanded) setActivePanel(null);
          }}
          className="text-[rgba(0,255,0,0.3)] hover:text-[var(--primary)] p-1 transition-colors"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>

        <div className="w-px h-5 bg-terminal-border/20 mx-0.5" />

        {/* Tool buttons */}
        <button onClick={() => togglePanel("dice")} className={toolbarBtnClass(activePanel === "dice")}>
          <Dice5 size={14} />
          <span className="text-[7px] font-mono">DICE</span>
        </button>

        <button onClick={() => togglePanel("initiative")} className={toolbarBtnClass(activePanel === "initiative")}>
          <Swords size={14} />
          <span className="text-[7px] font-mono">INIT</span>
        </button>

        <button onClick={() => togglePanel("audio")} className={toolbarBtnClass(activePanel === "audio")}>
          {muted ? <VolumeX size={14} /> : <Music size={14} />}
          <span className="text-[7px] font-mono">AUDIO</span>
        </button>

        <button onClick={() => togglePanel("fx")} className={toolbarBtnClass(activePanel === "fx")}>
          <Sparkles size={14} />
          <span className="text-[7px] font-mono">FX</span>
        </button>

        <button onClick={() => togglePanel("draw")} className={toolbarBtnClass(activePanel === "draw")}>
          <Pencil size={14} />
          <span className="text-[7px] font-mono">DRAW</span>
        </button>
      </div>
    </div>
  );
}
