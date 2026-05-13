import { useCampaign } from "@/contexts/CampaignContext";
import { useVTT } from "@/contexts/VTTContext";
import { LAYER_TOKEN } from "@/types/vtt";
import type { Token } from "@/types/vtt";
import type { Character } from "@/types/database";
import { Users, Plus, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function VTTCharacterImport() {
  const { characters } = useCampaign();
  const { state, dispatch, activeMap } = useVTT();

  if (!activeMap) {
    return (
      <div className="vtt-empty h-full flex items-center justify-center p-4">
        Select a map first
      </div>
    );
  }

  const existingTokenNames = new Set(activeMap.tokens.map((t) => t.name));

  const importCharacter = (char: Character) => {
    const gridSize = activeMap.grid.size || 50;

    // Calculate HP from Traveller stats: endurance + strength as a rough total
    const hp = (char.current_endurance ?? char.endurance) + (char.current_strength ?? char.strength);
    const maxHp = char.endurance + char.strength;

    const token: Token = {
      id: crypto.randomUUID(),
      name: char.name,
      imageDataUrl: char.thumbnail_url || null,
      x: activeMap.scrollX + 200 + Math.random() * 200,
      y: activeMap.scrollY + 200 + Math.random() * 200,
      size: 1,
      layer: LAYER_TOKEN,
      rotation: 0,
      hp,
      maxHp,
      conditions: [],
      auraRadius: 0,
      auraColor: "rgba(58,226,179,0.1)",
      showName: true,
      showHpBar: true,
      locked: false,
      visible: true,
    };

    dispatch({ type: "ADD_TOKEN", payload: { mapId: activeMap.id, token } });
    toast.success(`Imported "${char.name}" as token`);
  };

  const importAll = () => {
    const toImport = characters.filter((c) => !existingTokenNames.has(c.name));
    if (toImport.length === 0) {
      toast.info("All characters already on map");
      return;
    }
    toImport.forEach((c) => importCharacter(c));
    toast.success(`Imported ${toImport.length} character(s)`);
  };

  if (characters.length === 0) {
    return (
      <div className="vtt-empty h-full flex flex-col items-center justify-center p-4 gap-2">
        <Users size={24} />
        No campaign characters found.
        <span className="text-[10px]">
          Add characters in the Crew tab first.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="vtt-panel-section">
        <div className="flex items-center justify-between mb-2">
          <span className="vtt-section-label">
            Campaign Characters
          </span>
          <button
            onClick={importAll}
            className="vtt-btn"
          >
            <Plus size={10} /> Import All
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {characters.map((char) => {
          const alreadyOnMap = existingTokenNames.has(char.name);
          return (
            <div
              key={char.id}
              className="vtt-list-item"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-terminal-bg-dark border border-terminal-primary/30 flex items-center justify-center text-terminal-primary text-xs font-mono overflow-hidden flex-shrink-0">
                {char.thumbnail_url ? (
                  <img
                    src={char.thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  char.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-terminal-primary text-xs font-mono truncate">
                  {char.name}
                </div>
                <div className="text-[10px] text-terminal-primary/40 font-mono">
                  {char.career}
                  {char.rank ? ` (${char.rank})` : ""}
                  {char.character_type === "npc" ? " [NPC]" : ""}
                </div>
              </div>

              {/* Import button */}
              {alreadyOnMap ? (
                <span className="text-terminal-primary/30 flex items-center gap-1 text-[10px] font-mono">
                  <UserCheck size={12} /> On map
                </span>
              ) : (
                <button
                  onClick={() => importCharacter(char)}
                  className="vtt-btn"
                >
                  <Plus size={10} /> Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
