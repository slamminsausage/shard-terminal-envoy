import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { useVTT } from "@/contexts/VTTContext";
import { LAYER_TOKEN } from "@/types/vtt";
import type { Token } from "@/types/vtt";
import { toast } from "sonner";

export default function VTTTokenPanel() {
  const { state, dispatch, activeMap } = useVTT();
  const [newTokenName, setNewTokenName] = useState("");

  const handleAddToken = () => {
    if (!activeMap) {
      toast.error("Select a map first");
      return;
    }
    const name = newTokenName.trim() || `Token ${(activeMap.tokens.length + 1)}`;
    const gridSize = activeMap.grid.size || 50;

    const token: Token = {
      id: crypto.randomUUID(),
      name,
      imageDataUrl: null,
      x: activeMap.scrollX + 200,
      y: activeMap.scrollY + 200,
      size: 1,
      layer: LAYER_TOKEN,
      rotation: 0,
      hp: 0,
      maxHp: 0,
      conditions: [],
      auraRadius: 0,
      auraColor: "rgba(0, 255, 0, 0.1)",
      showName: true,
      showHpBar: false,
      locked: false,
      visible: true,
    };

    dispatch({ type: "ADD_TOKEN", payload: { mapId: activeMap.id, token } });
    setNewTokenName("");
    toast.success(`Token "${name}" added`);
  };

  const handleLoadTokenImage = (tokenId: string) => {
    if (!activeMap) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        dispatch({
          type: "UPDATE_TOKEN",
          payload: {
            mapId: activeMap.id,
            tokenId,
            updates: { imageDataUrl: ev.target?.result as string },
          },
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (!activeMap) {
    return (
      <div className="vtt-empty h-full flex items-center justify-center p-4">
        Select a map first
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="vtt-panel-section">
        <div className="flex gap-1">
          <input
            type="text"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddToken()}
            placeholder="Token name..."
            className="vtt-input flex-1"
          />
          <button
            onClick={handleAddToken}
            className="vtt-btn justify-center w-7 h-7 !px-0"
            title="Add Token"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {activeMap.tokens.length === 0 ? (
          <div className="vtt-empty">
            No tokens on this map.
          </div>
        ) : (
          activeMap.tokens.map((token) => (
            <div
              key={token.id}
              className="vtt-list-item group"
            >
              {/* Token avatar */}
              <div
                className="vtt-avatar flex-shrink-0"
                onClick={() => handleLoadTokenImage(token.id)}
                title="Click to set image"
              >
                {token.imageDataUrl ? (
                  <img src={token.imageDataUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  token.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Name & HP */}
              <div className="flex-1 min-w-0">
                <div className="text-terminal-primary text-xs font-mono truncate">
                  {token.name}
                </div>
                {token.maxHp > 0 && (
                  <div className="text-[10px] text-terminal-primary/40 font-mono">
                    HP: {token.hp}/{token.maxHp}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_TOKEN",
                      payload: {
                        mapId: activeMap.id,
                        tokenId: token.id,
                        updates: { visible: !token.visible },
                      },
                    })
                  }
                  className="p-1 text-terminal-primary/40 hover:text-terminal-primary transition-colors"
                  title={token.visible ? "Hide" : "Show"}
                >
                  {token.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_TOKEN",
                      payload: {
                        mapId: activeMap.id,
                        tokenId: token.id,
                        updates: { locked: !token.locked },
                      },
                    })
                  }
                  className="p-1 text-terminal-primary/40 hover:text-terminal-primary transition-colors"
                  title={token.locked ? "Unlock" : "Lock"}
                >
                  {token.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
                <button
                  onClick={() =>
                    dispatch({
                      type: "REMOVE_TOKEN",
                      payload: { mapId: activeMap.id, tokenId: token.id },
                    })
                  }
                  className="p-1 text-terminal-primary/40 hover:text-red-400 transition-colors"
                  title="Delete"
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
