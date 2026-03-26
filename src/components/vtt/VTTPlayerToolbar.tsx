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
  ChevronRight,
  ChevronLeft,
  Plus,
  Volume2,
  VolumeX,
  Eraser,
  Undo2,
  Play,
  Pause,
  Zap,
  Clock as ClockIcon,
} from "lucide-react";
import type { InitiativeEntry, Point, AmbientTrack, AmbientSlot, SFXSlot, Clock } from "@/types/vtt";
import type { PresenterAudioState, PresenterMessage } from "@/hooks/useVTTPresenter";

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

export type PlayerTool = "none" | "draw-freehand" | "draw-line" | "draw-rect" | "draw-circle" | "draw-text";

interface VTTPlayerToolbarProps {
  initiative: InitiativeEntry[];
  showInitiative?: boolean;
  clocks?: Clock[];
  onDrawingChange?: (strokes: PlayerStroke[]) => void;
  onPlayerToolChange?: (tool: PlayerTool) => void;
  onDrawSettingsChange?: (color: string, width: number) => void;
  audioState?: PresenterAudioState | null;
  sendToController?: (msg: PresenterMessage) => void;
}

export interface PlayerStroke {
  id: string;
  tool: "freehand" | "line" | "rect" | "circle";
  points: Point[];
  color: string;
  width: number;
}

type PanelId = "dice" | "initiative" | "audio" | "clocks" | "draw" | null;

const DRAW_COLORS = ["#00ff00", "#00ccff", "#ff6600", "#ff3344", "#ffcc00", "#ffffff"];
const DRAW_WIDTHS = [2, 3, 5, 8];

const AMBIENT_SLOTS: AmbientSlot[] = ["A", "B", "C", "D"];
const SLOT_LABEL_COLORS: Record<AmbientSlot, string> = {
  A: "text-green-400",
  B: "text-cyan-400",
  C: "text-amber-400",
  D: "text-purple-400",
};

export default function VTTPlayerToolbar({
  initiative,
  showInitiative,
  clocks,
  onDrawingChange,
  onPlayerToolChange,
  onDrawSettingsChange,
  audioState,
  sendToController,
}: VTTPlayerToolbarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Notify parent when tool changes
  useEffect(() => {
    onPlayerToolChange?.(playerTool);
  }, [playerTool, onPlayerToolChange]);

  useEffect(() => {
    onDrawSettingsChange?.(drawColor, drawWidth);
  }, [drawColor, drawWidth, onDrawSettingsChange]);

  const togglePanel = (panel: PanelId) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
      setSidebarOpen(true);
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

  const selectPlayerTool = (tool: PlayerTool) => {
    setPlayerTool(playerTool === tool ? "none" : tool);
  };

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

  // ─── Audio controls ───────────────────────────────────────────────

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    document.querySelectorAll("audio").forEach((el) => {
      (el as HTMLAudioElement).muted = newMuted;
    });
  };

  const getTrack = (slot: AmbientSlot): AmbientTrack | null => {
    if (!audioState) return null;
    return audioState[`ambient${slot}` as keyof PresenterAudioState] as AmbientTrack | null;
  };

  const sendAudioCommand = (command: "play" | "pause" | "stop", slot: AmbientSlot) => {
    sendToController?.({ type: "player-audio-command", command, slot });
  };

  const triggerSfx = (index: number) => {
    sendToController?.({ type: "player-sfx-trigger", index });
  };

  const toolBtnClass = (active: boolean) =>
    `flex items-center justify-center w-9 h-9 rounded transition-all ${
      active
        ? "text-[var(--primary)] bg-[rgba(0,255,0,0.12)]"
        : "text-[rgba(0,255,0,0.4)] hover:text-[var(--primary)] hover:bg-[rgba(0,255,0,0.05)]"
    }`;

  const hasClocks = clocks && clocks.length > 0;
  const hasInitiative = showInitiative && initiative.length > 0;

  return (
    <>
      {/* Left-side vertical toolbar */}
      <div className="absolute top-0 left-0 bottom-0 z-20 flex">
        {/* Icon strip */}
        <div className="bg-[#0a0f0a]/90 border-r border-terminal-border/30 backdrop-blur-sm flex flex-col items-center py-3 px-1 gap-1">
          {/* Toggle sidebar */}
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              if (sidebarOpen) setActivePanel(null);
            }}
            className="text-[rgba(0,255,0,0.3)] hover:text-[var(--primary)] p-1 transition-colors mb-1"
            title="Toggle Tools"
          >
            {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          <div className="w-6 h-px bg-terminal-border/20 mb-1" />

          <button onClick={() => togglePanel("dice")} className={toolBtnClass(activePanel === "dice")} title="Dice Roller">
            <Dice5 size={16} />
          </button>

          {hasInitiative && (
            <button onClick={() => togglePanel("initiative")} className={toolBtnClass(activePanel === "initiative")} title="Initiative">
              <Swords size={16} />
            </button>
          )}

          {hasClocks && (
            <button onClick={() => togglePanel("clocks")} className={toolBtnClass(activePanel === "clocks")} title="Clocks">
              <ClockIcon size={16} />
            </button>
          )}

          <button onClick={() => togglePanel("audio")} className={toolBtnClass(activePanel === "audio")} title="Audio">
            {muted ? <VolumeX size={16} /> : <Music size={16} />}
          </button>

          <button onClick={() => togglePanel("draw")} className={toolBtnClass(activePanel === "draw")} title="Draw">
            <Pencil size={16} />
          </button>

          {/* Active draw tool indicator */}
          {playerTool !== "none" && (
            <>
              <div className="w-6 h-px bg-terminal-border/20 my-0.5" />
              <button
                onClick={() => setPlayerTool("none")}
                className="text-[8px] font-mono text-yellow-400/70 hover:text-yellow-400 px-1 py-1"
                title="Click to deselect draw tool"
              >
                {playerTool.replace("draw-", "").toUpperCase()}
              </button>
            </>
          )}

          {/* Status indicators at bottom */}
          <div className="flex-1" />
          {hasInitiative && activePanel !== "initiative" && (
            <div className="w-6 h-6 flex items-center justify-center rounded bg-[rgba(0,255,0,0.06)]" title={`Active: ${initiative[0]?.name}`}>
              <Swords size={10} className="text-yellow-400/60" />
            </div>
          )}
          {hasClocks && activePanel !== "clocks" && (
            <div className="w-6 h-6 flex items-center justify-center rounded bg-[rgba(0,255,0,0.06)]" title={`${clocks!.length} clock(s)`}>
              <ClockIcon size={10} className="text-terminal-primary/40" />
            </div>
          )}
        </div>

        {/* Expanded panel */}
        {sidebarOpen && activePanel && (
          <div className="bg-[#0a0f0a]/95 border-r border-terminal-border/30 backdrop-blur-sm w-[280px] max-h-full overflow-y-auto shadow-lg shadow-black/50">
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
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
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

            {activePanel === "clocks" && (
              <div className="p-3 space-y-2">
                <div className="text-[10px] text-terminal-primary/50 font-mono uppercase tracking-wider mb-1">Clocks</div>
                {(!clocks || clocks.length === 0) ? (
                  <div className="text-[10px] text-terminal-primary/30 font-mono text-center py-4">No clocks active</div>
                ) : (
                  clocks.map((clock) => (
                    <div key={clock.id} className="flex items-center gap-3 px-2 py-2 rounded border border-terminal-border/15 bg-terminal-primary/[0.02]">
                      <ToolbarClockSVG clock={clock} />
                      <div>
                        <div className="text-[rgba(0,255,0,0.8)] text-xs font-mono">{clock.name}</div>
                        <div className="text-[rgba(0,255,0,0.4)] text-[10px] font-mono">{clock.filled}/{clock.segments}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activePanel === "audio" && (
              <div className="p-3 space-y-2">
                <div className="text-[10px] text-terminal-primary/50 font-mono uppercase tracking-wider mb-1">Audio Controls</div>

                <button onClick={toggleMute} className={`vtt-btn w-full justify-center ${muted ? "danger" : ""}`}>
                  {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  {muted ? "Unmute Audio" : "Mute Audio"}
                </button>

                <div className="text-[9px] text-terminal-primary/40 font-mono uppercase tracking-wider mt-2">Ambient Channels</div>
                {AMBIENT_SLOTS.map((slot) => {
                  const track = getTrack(slot);
                  return (
                    <div key={slot} className="flex items-center gap-1.5 px-1 py-1 rounded border border-terminal-border/10">
                      <span className={`text-[10px] font-mono font-bold w-4 ${SLOT_LABEL_COLORS[slot]}`}>{slot}</span>
                      {track ? (
                        <>
                          <span className="text-[9px] text-terminal-primary/60 font-mono truncate flex-1 min-w-0">
                            {track.name}
                          </span>
                          <button
                            onClick={() => sendAudioCommand("play", slot)}
                            className="p-0.5 text-terminal-primary/40 hover:text-green-400 transition-colors"
                            title="Play"
                          >
                            <Play size={10} />
                          </button>
                          <button
                            onClick={() => sendAudioCommand("pause", slot)}
                            className="p-0.5 text-terminal-primary/40 hover:text-yellow-400 transition-colors"
                            title="Pause"
                          >
                            <Pause size={10} />
                          </button>
                          <button
                            onClick={() => sendAudioCommand("stop", slot)}
                            className="p-0.5 text-terminal-primary/40 hover:text-red-400 transition-colors"
                            title="Stop"
                          >
                            <Square size={8} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[9px] text-terminal-primary/20 font-mono flex-1">Empty</span>
                      )}
                    </div>
                  );
                })}

                {audioState && audioState.sfxSlots.some((s) => s.url || s.name) && (
                  <>
                    <div className="text-[9px] text-terminal-primary/40 font-mono uppercase tracking-wider mt-2">SFX Soundboard</div>
                    <div className="grid grid-cols-2 gap-1">
                      {audioState.sfxSlots.filter((s) => s.url || s.name).map((slot, i) => {
                        const realIndex = audioState.sfxSlots.indexOf(slot);
                        return (
                          <button
                            key={realIndex}
                            onClick={() => triggerSfx(realIndex)}
                            className="rounded border border-terminal-primary/30 bg-terminal-primary/5 hover:bg-terminal-primary/15 px-1 py-1.5 text-[9px] font-mono text-terminal-primary/60 truncate transition-all active:scale-95"
                          >
                            <Zap size={8} className="inline mr-0.5 text-yellow-400/60" />
                            {slot.name || `SFX ${realIndex + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
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
                      onClick={() => selectPlayerTool(tool)}
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
                {playerTool !== "none" && (
                  <div className="text-[8px] text-terminal-primary/30 font-mono text-center">
                    Click and drag on the map to draw. Right-click or press Escape to deselect.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Compact Clock SVG for toolbar ──────────────────────────────────────────

function ToolbarClockSVG({ clock }: { clock: Clock }) {
  const size = 36;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

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
        strokeWidth={1}
        opacity={filled ? 0.8 : 0.2}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="transparent" stroke={clock.color} strokeWidth={1.5} opacity={0.3} />
      {segments}
    </svg>
  );
}
