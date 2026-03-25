import { useState } from "react";
import { useVTT } from "@/contexts/VTTContext";
import type { Token } from "@/types/vtt";
import { X, Trash2, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { dbHelpers } from "@/lib/supabase";

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
  const [moveSpeed, setMoveSpeed] = useState(token.moveSpeed ?? 6);
  const [elevation, setElevation] = useState(token.elevation ?? 0);
  const [lightBrightRadius, setLightBrightRadius] = useState(token.lightBrightRadius ?? 0);
  const [lightDimRadius, setLightDimRadius] = useState(token.lightDimRadius ?? 0);
  const [lightColor, setLightColor] = useState(token.lightColor || "#ffaa44");
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
      moveSpeed,
      elevation,
      lightBrightRadius,
      lightDimRadius,
      lightColor,
    });
    onClose();
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Try uploading to Supabase Storage first
      const publicUrl = await dbHelpers.uploadVTTTokenImage(file, token.id);
      if (publicUrl) {
        update({ imageDataUrl: publicUrl });
        return;
      }

      // Fallback: store as data URL
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
    <div className="vtt-modal-overlay">
      <div className="vtt-modal w-80 flex flex-col">
        {/* Header */}
        <div className="vtt-modal-header">
          <h3 className="vtt-modal-title">Edit Token</h3>
          <button onClick={onClose} className="vtt-btn-icon">
            <X size={16} />
          </button>
        </div>

        <div className="vtt-modal-body space-y-3">
          {/* Token image preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full border-2 border-[rgba(0,255,0,0.3)] bg-[var(--bg-dark)] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[rgba(0,255,0,0.6)] transition-colors"
              onClick={handleImageUpload}
              title="Click to upload image"
            >
              {token.imageDataUrl ? (
                <img src={token.imageDataUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[rgba(0,255,0,0.3)] text-lg font-mono">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="vtt-input"
                placeholder="Token name"
              />
              <button
                onClick={handleImageUpload}
                className="text-[10px] text-[rgba(0,255,0,0.4)] font-mono mt-1 hover:text-[rgba(0,255,0,0.6)]"
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* HP */}
          <div>
            <label className="vtt-section-label">Hit Points</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={hp}
                onChange={(e) => setHp(parseInt(e.target.value, 10) || 0)}
                className="vtt-input w-16 text-center"
              />
              <span className="text-[rgba(0,255,0,0.3)] text-xs">/</span>
              <input
                type="number"
                value={maxHp}
                onChange={(e) => setMaxHp(parseInt(e.target.value, 10) || 0)}
                className="vtt-input w-16 text-center"
              />
            </div>
          </div>

          {/* Size & Rotation */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="vtt-section-label">Size (cells)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={size}
                onChange={(e) => setSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="vtt-input text-center"
              />
            </div>
            <div>
              <label className="vtt-section-label">Rotation</label>
              <input
                type="number"
                min={0}
                max={359}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value, 10) || 0)}
                className="vtt-input text-center"
              />
            </div>
          </div>

          {/* Move Speed & Elevation */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="vtt-section-label">Move Speed</label>
              <input
                type="number"
                min={0}
                max={30}
                value={moveSpeed}
                onChange={(e) => setMoveSpeed(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="vtt-input text-center"
              />
            </div>
            <div>
              <label className="vtt-section-label">Elevation</label>
              <input
                type="number"
                value={elevation}
                onChange={(e) => setElevation(parseInt(e.target.value, 10) || 0)}
                className="vtt-input text-center"
              />
            </div>
          </div>

          {/* Light Emission */}
          <div>
            <label className="vtt-section-label">Light Emission</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <span className="text-[9px] text-[rgba(0,255,0,0.3)] font-mono">Bright</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={lightBrightRadius}
                  onChange={(e) => setLightBrightRadius(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="vtt-input text-center"
                />
              </div>
              <div className="flex-1">
                <span className="text-[9px] text-[rgba(0,255,0,0.3)] font-mono">Dim</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={lightDimRadius}
                  onChange={(e) => setLightDimRadius(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="vtt-input text-center"
                />
              </div>
              <input
                type="color"
                value={lightColor}
                onChange={(e) => setLightColor(e.target.value)}
                className="w-8 h-6 rounded border border-[rgba(0,255,0,0.2)] bg-transparent cursor-pointer mt-3"
              />
            </div>
          </div>

          {/* Aura */}
          <div>
            <label className="vtt-section-label">Aura Radius (grid units)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                value={auraRadius}
                onChange={(e) => setAuraRadius(Math.max(0, parseFloat(e.target.value) || 0))}
                className="vtt-input w-16 text-center"
              />
              <input
                type="color"
                value={auraColor || "#00ff0033"}
                onChange={(e) => setAuraColor(e.target.value)}
                className="w-8 h-6 rounded border border-[rgba(0,255,0,0.2)] bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Display toggles */}
          <div className="flex items-center gap-4">
            <label className="vtt-checkbox">
              <input
                type="checkbox"
                checked={showName}
                onChange={(e) => setShowName(e.target.checked)}
              />
              Show Name
            </label>
            <label className="vtt-checkbox">
              <input
                type="checkbox"
                checked={showHpBar}
                onChange={(e) => setShowHpBar(e.target.checked)}
              />
              HP Bar
            </label>
          </div>

          {/* Quick actions */}
          <div className="flex gap-1">
            <button
              onClick={() => update({ visible: !token.visible })}
              className={`vtt-btn ${!token.visible ? "danger" : ""}`}
            >
              {token.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              {token.visible ? "Visible" : "Hidden"}
            </button>
            <button
              onClick={() => update({ locked: !token.locked })}
              className={`vtt-btn ${token.locked ? "warning" : ""}`}
            >
              {token.locked ? <Lock size={12} /> : <Unlock size={12} />}
              {token.locked ? "Locked" : "Unlocked"}
            </button>
          </div>

          {/* Conditions */}
          <div>
            <label className="vtt-section-label">Conditions</label>
            <div className="flex gap-1 mb-1.5">
              <input
                type="text"
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCondition()}
                placeholder="Add condition..."
                className="vtt-input flex-1"
              />
              <button onClick={addCondition} className="vtt-btn">+</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {token.conditions.map((c, i) => (
                <span
                  key={i}
                  className="vtt-badge"
                  style={{ color: c.color, borderColor: c.color + '40' }}
                >
                  {c.name}
                  <button
                    onClick={() => removeCondition(i)}
                    className="hover:text-red-400 ml-0.5"
                  >
                    <X size={8} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 py-3 border-t border-[rgba(0,255,0,0.15)]">
          <button onClick={handleDelete} className="vtt-btn danger">
            <Trash2 size={12} /> Delete
          </button>
          <div className="flex-1" />
          <button onClick={onClose} className="vtt-btn" style={{ background: 'transparent', boxShadow: 'none' }}>
            Cancel
          </button>
          <button onClick={handleSave} className="vtt-btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
