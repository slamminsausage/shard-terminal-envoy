import { useState } from "react";
import { useVTT } from "@/contexts/VTTContext";
import type { InitiativeEntry } from "@/types/vtt";
import { Plus, Trash2, ArrowUpDown, ChevronUp, ChevronDown, Dices } from "lucide-react";

export default function VTTInitiativePanel() {
  const { state, dispatch } = useVTT();
  const [newName, setNewName] = useState("");
  const [newInit, setNewInit] = useState("");
  const [isNPC, setIsNPC] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const entry: InitiativeEntry = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      initiative: parseInt(newInit) || 0,
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

  // Roll 2d6 for Traveller initiative
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

  return (
    <div className="flex flex-col h-full">
      {/* Add entry */}
      <div className="p-3 border-b border-terminal-border/30 space-y-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Name..."
            className="flex-1 bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono placeholder:text-terminal-primary/30 focus:border-terminal-primary/50 focus:outline-none"
          />
          <div className="flex items-center gap-0.5">
            <input
              type="number"
              value={newInit}
              onChange={(e) => setNewInit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Init"
              className="w-12 bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-1 py-1 rounded font-mono placeholder:text-terminal-primary/30 focus:border-terminal-primary/50 focus:outline-none text-center"
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
          <label className="flex items-center gap-1.5 text-[10px] text-terminal-primary/50 font-mono cursor-pointer">
            <input
              type="checkbox"
              checked={isNPC}
              onChange={(e) => setIsNPC(e.target.checked)}
              className="accent-green-500"
            />
            NPC
          </label>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-terminal-primary/10 text-terminal-primary border border-terminal-primary/30 rounded hover:bg-terminal-primary/20 transition-colors"
          >
            <Plus size={10} /> Add
          </button>
        </div>
      </div>

      {/* Controls */}
      {state.initiative.length > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-terminal-border/20">
          <button
            onClick={handleSort}
            className="flex items-center gap-1 text-[10px] font-mono text-terminal-primary/50 hover:text-terminal-primary transition-colors"
          >
            <ArrowUpDown size={10} /> Sort
          </button>
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
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {state.initiative.length === 0 ? (
          <div className="text-terminal-primary/30 text-xs font-mono text-center py-8">
            No initiative entries.
            <br />
            Add combatants above.
          </div>
        ) : (
          state.initiative.map((entry, index) => (
            <div
              key={entry.id}
              className={`group flex items-center gap-2 p-2 rounded border transition-colors ${
                index === 0
                  ? "bg-terminal-primary/10 border-terminal-primary/40"
                  : "bg-terminal-bg-dark/50 border-terminal-border/20"
              } ${entry.isNPC ? "border-l-2 border-l-red-500/50" : ""}`}
            >
              {/* Initiative score */}
              <div className="w-8 text-center text-terminal-primary font-mono text-sm font-bold flex-shrink-0">
                {entry.initiative}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="text-terminal-primary text-xs font-mono truncate">
                  {entry.name}
                </div>
                {entry.isNPC && (
                  <span className="text-[9px] text-red-400/50 font-mono">
                    NPC
                  </span>
                )}
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
