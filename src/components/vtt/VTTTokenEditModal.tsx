import { useState } from "react";
import { useVTT } from "@/contexts/VTTContext";
import type { Token } from "@/types/vtt";
import { X, Trash2, Lock, Unlock, Eye, EyeOff } from "lucide-react";

interface VTTTokenEditModalProps {
  token: Token;
  mapId: string;
  onClose: () => void;
}

export default function VTTTokenEditModal({
  token,
  mapId,
  onClose,
}: VTTTokenEditModalProps) {
  const { dispatch } = useVTT();
  const [name, setName] = useState(token.name);
  const [hp, setHp] = useState(token.hp);
  const [maxHp, setMaxHp] = useState(token.maxHp);
  const [size, setSize] = useState(token.size);
  const [rotation, setRotation] = useState(token.rotation);
  const [auraRadius, setAuraRadius] = useState(token.auraRadius);
  const [auraColor, setAuraColor] = useState(token.auraColor);
  const [showName, setShowName] = useState(token.showName);
  const [showHpBar, setShowHpBar] = useState(token.showHpBar);
  const [conditionInput, setConditionInput] = useState("");

  const update = (updates: Partial<Token>) => {
    dispatch({
      type: "UPDATE_TOKEN",
      payload: { mapId, tokenId: token.id, updates },
    });
  };

  const handleSave = () => {
    update({
      name,
      hp,
      maxHp,
      size,
      rotation,
      auraRadius,
      auraColor,
      showName,
      showHpBar,
    });
    onClose();
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        update({ imageDataUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const addCondition = () => {
    const trimmed = conditionInput.trim();
    if (!trimmed) return;
    const colors = ["#ff3344", "#ff6600", "#ffcc00", "#00ccff", "#aa44ff", "#00ff00"];
    const color = colors[token.conditions.length % colors.length];
    update({
      conditions: [...token.conditions, { name: trimmed, color }],
    });
    setConditionInput("");
  };

  const removeCondition = (index: number) => {
    update({
      conditions: token.conditions.filter((_, i) => i !== index),
    });
  };

  const handleDelete = () => {
    dispatch({ type: "REMOVE_TOKEN", payload: { mapId, tokenId: token.id } });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-terminal-bg-dark border border-terminal-border/40 rounded-lg shadow-xl w-80 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border/30">
          <h3 className="text-terminal-primary text-sm font-mono uppercase tracking-wider">
            Edit Token
          </h3>
          <button onClick={onClose} className="text-terminal-primary/50 hover:text-terminal-primary">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Token image preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full border-2 border-terminal-primary/30 bg-terminal-bg-dark flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={handleImageUpload}
              title="Click to upload image"
            >
              {token.imageDataUrl ? (
                <img src={token.imageDataUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-terminal-primary/30 text-lg font-mono">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono focus:border-terminal-primary/50 focus:outline-none"
                placeholder="Token name"
              />
              <button
                onClick={handleImageUpload}
                className="text-[10px] text-terminal-primary/40 font-mono mt-1 hover:text-terminal-primary/60"
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* HP */}
          <div>
            <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
              Hit Points
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={hp}
                onChange={(e) => setHp(parseInt(e.target.value) || 0)}
                className="w-16 bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono text-center focus:border-terminal-primary/50 focus:outline-none"
              />
              <span className="text-terminal-primary/30 text-xs">/</span>
              <input
                type="number"
                value={maxHp}
                onChange={(e) => setMaxHp(parseInt(e.target.value) || 0)}
                className="w-16 bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono text-center focus:border-terminal-primary/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Size & Rotation */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
                Size (cells)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={size}
                onChange={(e) => setSize(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono text-center focus:border-terminal-primary/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
                Rotation
              </label>
              <input
                type="number"
                min={0}
                max={359}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value) || 0)}
                className="w-full bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono text-center focus:border-terminal-primary/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Aura */}
          <div>
            <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
              Aura Radius (grid units)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                value={auraRadius}
                onChange={(e) => setAuraRadius(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-16 bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono text-center focus:border-terminal-primary/50 focus:outline-none"
              />
              <input
                type="color"
                value={auraColor || "#00ff0033"}
                onChange={(e) => setAuraColor(e.target.value)}
                className="w-8 h-6 rounded border border-terminal-border/30 bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Display toggles */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs text-terminal-primary/60 font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={showName}
                onChange={(e) => setShowName(e.target.checked)}
                className="accent-green-500"
              />
              Show Name
            </label>
            <label className="flex items-center gap-1.5 text-xs text-terminal-primary/60 font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={showHpBar}
                onChange={(e) => setShowHpBar(e.target.checked)}
                className="accent-green-500"
              />
              HP Bar
            </label>
          </div>

          {/* Quick actions */}
          <div className="flex gap-1">
            <button
              onClick={() => update({ visible: !token.visible })}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded border transition-colors ${
                token.visible
                  ? "border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary"
                  : "border-red-500/30 text-red-400"
              }`}
            >
              {token.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              {token.visible ? "Visible" : "Hidden"}
            </button>
            <button
              onClick={() => update({ locked: !token.locked })}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded border transition-colors ${
                token.locked
                  ? "border-yellow-500/30 text-yellow-400"
                  : "border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary"
              }`}
            >
              {token.locked ? <Lock size={12} /> : <Unlock size={12} />}
              {token.locked ? "Locked" : "Unlocked"}
            </button>
          </div>

          {/* Conditions */}
          <div>
            <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
              Conditions
            </label>
            <div className="flex gap-1 mb-1.5">
              <input
                type="text"
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCondition()}
                placeholder="Add condition..."
                className="flex-1 bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono placeholder:text-terminal-primary/20 focus:border-terminal-primary/50 focus:outline-none"
              />
              <button
                onClick={addCondition}
                className="px-2 py-1 text-xs font-mono rounded border border-terminal-primary/30 text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {token.conditions.map((c, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded border border-terminal-border/20"
                  style={{ color: c.color }}
                >
                  {c.name}
                  <button
                    onClick={() => removeCondition(i)}
                    className="hover:text-red-400"
                  >
                    <X size={8} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 py-3 border-t border-terminal-border/30">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-mono rounded border border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-mono rounded border border-terminal-primary/50 text-terminal-primary bg-terminal-primary/10 hover:bg-terminal-primary/20 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
