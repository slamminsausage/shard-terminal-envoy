import { useState, useEffect, useRef, useCallback } from "react";
import { useVTT } from "@/contexts/VTTContext";
import type { InitiativeEntry } from "@/types/vtt";
import type { Combatant } from "@/types/database";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Trash2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Dices,
  RefreshCw,
  Upload,
  Download,
  Monitor,
  MonitorOff,
  SkipForward,
  Crosshair,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";

const PLAYER_ID = "campaign";

export default function VTTInitiativePanel() {
  const { state, dispatch } = useVTT();
  const [newName, setNewName] = useState("");
  const [newInit, setNewInit] = useState("");
  const [isNPC, setIsNPC] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const autoSyncRef = useRef(autoSync);
  autoSyncRef.current = autoSync;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const entry: InitiativeEntry = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      initiative: parseInt(newInit, 10) || 0,
      hp: 0,
      maxHp: 0,
      isNPC,
      notes: "",
    };
    dispatch({ type: "ADD_INITIATIVE", payload: entry });
    setNewName("");
    setNewInit("");
  };

  const handleSort = () => {
    const sorted = [...state.initiative].sort(
      (a, b) => b.initiative - a.initiative
    );
    dispatch({ type: "SET_INITIATIVE", payload: sorted });
  };

  const handleRoll2d6 = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setNewInit(String(d1 + d2));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...state.initiative];
    [list[index - 1], list[index]] = [list[index], list[index - 1]];
    dispatch({ type: "SET_INITIATIVE", payload: list });
  };

  const handleMoveDown = (index: number) => {
    if (index >= state.initiative.length - 1) return;
    const list = [...state.initiative];
    [list[index], list[index + 1]] = [list[index + 1], list[index]];
    dispatch({ type: "SET_INITIATIVE", payload: list });
  };

  const handleClearAll = () => {
    dispatch({ type: "SET_INITIATIVE", payload: [] });
  };

  const handleNextTurn = () => {
    if (state.initiative.length < 2) return;
    const [first, ...rest] = state.initiative;
    const newList = [...rest, first];
    dispatch({ type: "SET_INITIATIVE", payload: newList });
  };

  const handlePanToToken = (tokenId?: string) => {
    if (!tokenId) return;
    const activeMap = state.maps.find((m) => m.id === state.activeMapId);
    if (!activeMap) return;
    const token = activeMap.tokens.find((t) => t.id === tokenId);
    if (!token) return;
    // Pan the viewport to center on the token
    dispatch({
      type: "SET_VIEWPORT",
      payload: {
        mapId: activeMap.id,
        scrollX: token.x - 400 / activeMap.zoom,
        scrollY: token.y - 300 / activeMap.zoom,
        zoom: activeMap.zoom,
      },
    });
  };

  const handleDragDrop = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const list = [...state.initiative];
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, moved);
    dispatch({ type: "SET_INITIATIVE", payload: list });
  };

  // ─── Combat Tracker Sync ─────────────────────────────────────────────────

  const combatantToEntry = (c: Combatant): InitiativeEntry => {
    let hp = 0;
    let maxHp = 0;
    if (c.healthType === "hits") {
      hp = c.hits ?? 0;
      maxHp = c.hitsMax ?? 0;
    } else {
      hp = (c.currentStr ?? 0) + (c.currentDex ?? 0) + (c.currentEnd ?? 0);
      maxHp = (c.maxStr ?? 0) + (c.maxDex ?? 0) + (c.maxEnd ?? 0);
    }

    return {
      id: crypto.randomUUID(),
      name: c.name,
      initiative: c.initiative,
      hp,
      maxHp,
      isNPC: c.type === "npc",
      combatantId: c.id,
      notes: c.notes || "",
    };
  };

  const entryToCombatant = (entry: InitiativeEntry, existingCombatant?: Combatant): Combatant => {
    const base: Combatant = existingCombatant || {
      id: entry.combatantId || crypto.randomUUID(),
      name: entry.name,
      type: entry.isNPC ? "npc" : "character",
      initiative: entry.initiative,
      turnOrder: entry.initiative,
      healthType: "hits",
      hits: entry.hp,
      hitsMax: entry.maxHp,
      armor: 0,
      cover: "none",
      range: "medium",
      actionsRemaining: 2,
      reactionsRemaining: 1,
      hasMovedThisRound: false,
      isActive: true,
      isDowned: false,
      notes: entry.notes || "",
    };

    return {
      ...base,
      name: entry.name,
      initiative: entry.initiative,
      turnOrder: entry.initiative,
      notes: entry.notes || base.notes,
    };
  };

  const pullFromCombatTracker = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from("combat_encounters")
        .select("*")
        .eq("player_id", PLAYER_ID)
        .maybeSingle();

      if (error) {
        toast.error("Failed to load combat tracker");
        return;
      }

      if (!data || !data.combatants || data.combatants.length === 0) {
        toast.info("No combatants in combat tracker");
        return;
      }

      const entries: InitiativeEntry[] = data.combatants
        .sort((a: Combatant, b: Combatant) => a.turnOrder - b.turnOrder)
        .map(combatantToEntry);

      dispatch({ type: "SET_INITIATIVE", payload: entries });
      toast.success(`Pulled ${entries.length} combatants from combat tracker`);
    } catch {
      toast.error("Failed to connect to combat tracker");
    } finally {
      setSyncing(false);
    }
  };

  const pushToCombatTracker = async () => {
    if (state.initiative.length === 0) {
      toast.info("No initiative entries to push");
      return;
    }

    setSyncing(true);
    try {
      // Load existing combat data to preserve fields we don't track
      const { data: existing } = await supabase
        .from("combat_encounters")
        .select("*")
        .eq("player_id", PLAYER_ID)
        .maybeSingle();

      const existingCombatants: Combatant[] = existing?.combatants || [];

      const combatants: Combatant[] = state.initiative.map((entry, index) => {
        // Try to find matching existing combatant by combatantId or name
        const match = existingCombatants.find(
          (c) => (entry.combatantId && c.id === entry.combatantId) || c.name === entry.name
        );
        const combatant = entryToCombatant(entry, match);
        combatant.turnOrder = index;
        return combatant;
      });

      const { error } = await supabase
        .from("combat_encounters")
        .upsert(
          {
            player_id: PLAYER_ID,
            current_round: existing?.current_round || 1,
            current_turn_index: existing?.current_turn_index || 0,
            combatants,
          },
          { onConflict: "player_id" }
        );

      if (error) {
        toast.error("Failed to push to combat tracker");
        return;
      }

      toast.success(`Pushed ${combatants.length} entries to combat tracker`);
    } catch {
      toast.error("Failed to connect to combat tracker");
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync: poll combat tracker every 5 seconds
  useEffect(() => {
    if (!autoSync) return;

    const poll = async () => {
      if (!autoSyncRef.current) return;
      try {
        const { data } = await supabase
          .from("combat_encounters")
          .select("*")
          .eq("player_id", PLAYER_ID)
          .maybeSingle();

        if (data?.combatants) {
          const entries: InitiativeEntry[] = data.combatants
            .sort((a: Combatant, b: Combatant) => a.turnOrder - b.turnOrder)
            .map(combatantToEntry);

          dispatch({ type: "SET_INITIATIVE", payload: entries });
        }
      } catch {
        // silently fail during auto-sync
      }
    };

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [autoSync, dispatch]);

  const showOnPresenter = state.showInitiativeOnPresenter ?? false;

  return (
    <div className="flex flex-col h-full">
      {/* Add entry */}
      <div className="vtt-panel-section space-y-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Name..."
            className="vtt-input flex-1"
          />
          <div className="flex items-center gap-0.5">
            <input
              type="number"
              value={newInit}
              onChange={(e) => setNewInit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Init"
              className="vtt-input w-12 text-center"
            />
            <button
              onClick={handleRoll2d6}
              className="p-1 text-terminal-primary/40 hover:text-terminal-primary transition-colors"
              title="Roll 2d6"
            >
              <Dices size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="vtt-checkbox">
            <input
              type="checkbox"
              checked={isNPC}
              onChange={(e) => setIsNPC(e.target.checked)}
            />
            NPC
          </label>
          <button
            onClick={handleAdd}
            className="vtt-btn"
          >
            <Plus size={10} /> Add
          </button>
        </div>
      </div>

      {/* Combat Tracker Sync */}
      <div className="vtt-panel-section space-y-1.5">
        <div className="vtt-section-label">
          Combat Tracker Sync
        </div>
        <div className="flex gap-1">
          <button
            onClick={pullFromCombatTracker}
            disabled={syncing}
            className="vtt-btn secondary flex-1 justify-center"
            title="Pull combatants from Combat Tracker"
          >
            <Download size={10} /> Pull
          </button>
          <button
            onClick={pushToCombatTracker}
            disabled={syncing}
            className="vtt-btn secondary flex-1 justify-center"
            title="Push initiative to Combat Tracker"
          >
            <Upload size={10} /> Push
          </button>
        </div>
        <div className="flex items-center justify-between">
          <label className="vtt-checkbox">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
            />
            Auto-sync (5s)
          </label>
          <button
            onClick={() => dispatch({ type: "TOGGLE_INITIATIVE_PRESENTER" })}
            className={`vtt-btn ${
              showOnPresenter
                ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
                : "secondary"
            }`}
            title={showOnPresenter ? "Hide from presenter" : "Show on presenter"}
          >
            {showOnPresenter ? <Monitor size={10} /> : <MonitorOff size={10} />}
            {showOnPresenter ? "On" : "Off"}
          </button>
        </div>
      </div>

      {/* Controls */}
      {state.initiative.length > 0 && (
        <div className="vtt-panel-section space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleSort}
                className="vtt-btn secondary"
              >
                <ArrowUpDown size={10} /> Sort
              </button>
              <button
                onClick={handleNextTurn}
                className="vtt-btn warning"
                title="Advance to next combatant"
              >
                <SkipForward size={10} /> Next
              </button>
            </div>
            <span className="text-[10px] font-mono text-terminal-primary/30">
              {state.initiative.length} entries
            </span>
            <button
              onClick={handleClearAll}
              className="text-[10px] font-mono text-red-400/50 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          </div>
          <label className="vtt-checkbox">
            <input
              type="checkbox"
              checked={state.followActiveTurn ?? false}
              onChange={() => dispatch({ type: "TOGGLE_FOLLOW_ACTIVE_TURN" })}
            />
            <Navigation size={9} /> Follow active turn
          </label>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {state.initiative.length === 0 ? (
          <div className="vtt-empty">
            No initiative entries.
            <br />
            Add combatants above or pull from combat tracker.
          </div>
        ) : (
          state.initiative.map((entry, index) => (
            <div
              key={entry.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setDropIndex(index);
              }}
              onDragLeave={() => setDropIndex(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) handleDragDrop(dragIndex, index);
                setDragIndex(null);
                setDropIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDropIndex(null);
              }}
              className={`vtt-list-item cursor-grab active:cursor-grabbing ${
                index === 0 ? "vtt-list-item--active" : ""
              } ${entry.isNPC ? "border-l-2 border-l-red-500/50" : ""} ${
                dropIndex === index && dragIndex !== null ? "border-t-2 border-t-green-400" : ""
              } ${dragIndex === index ? "opacity-40" : ""}`}
            >
              {/* Initiative score */}
              <div className="w-8 text-center text-terminal-primary font-mono text-sm font-bold flex-shrink-0">
                {entry.initiative}
              </div>

              {/* Name (click to pan to token) */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-terminal-primary text-xs font-mono truncate ${
                    entry.tokenId ? "cursor-pointer hover:text-yellow-400 transition-colors" : ""
                  }`}
                  onClick={() => entry.tokenId && handlePanToToken(entry.tokenId)}
                  title={entry.tokenId ? "Click to pan to token" : undefined}
                >
                  {entry.name}
                  {entry.tokenId && (
                    <Crosshair size={8} className="inline ml-1 opacity-30" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {entry.isNPC && (
                    <span className="text-[9px] text-red-400/50 font-mono">
                      NPC
                    </span>
                  )}
                  {entry.maxHp > 0 && (
                    <span className="text-[9px] text-terminal-primary/30 font-mono">
                      HP: {entry.hp}/{entry.maxHp}
                    </span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMoveUp(index)}
                  className="p-0.5 text-terminal-primary/40 hover:text-terminal-primary"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  className="p-0.5 text-terminal-primary/40 hover:text-terminal-primary"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={() =>
                    dispatch({
                      type: "REMOVE_INITIATIVE",
                      payload: entry.id,
                    })
                  }
                  className="p-0.5 text-terminal-primary/40 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
