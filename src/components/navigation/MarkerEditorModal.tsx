import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { useCampaign } from "@/contexts/CampaignContext";
import { getAllMarkerTypes, MARKER_ICONS } from "@/config/markerTypes";
import type { HexMarker, MarkerType } from "@/types/navigation";
import { CrewVisibilitySelector } from "@/components/crew/CrewVisibilitySelector";

interface MarkerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  marker?: HexMarker | null;
  sector: string;
  hex: string;
}

export function MarkerEditorModal({
  isOpen,
  onClose,
  marker,
  sector,
  hex,
}: MarkerEditorModalProps) {
  const { saveMarker, isSavingMarker } = useJumpPlanner();
  const { isGM } = useCampaign();
  const markerTypes = getAllMarkerTypes();

  const [formData, setFormData] = useState<Partial<HexMarker>>({
    marker_type: "CUSTOM",
    marker_label: "",
    marker_icon: "",
    marker_color: "#3ae2b3",
    description: "",
    gm_notes: "",
    is_active: true,
    is_visible_to_players: true,
    display_order: 0,
    visible_crew_ids: null,
  });

  const [showIconPicker, setShowIconPicker] = useState(false);

  // Initialize form with marker data or defaults
  useEffect(() => {
    if (marker) {
      setFormData({
        id: marker.id,
        sector: marker.sector,
        hex: marker.hex,
        marker_type: marker.marker_type,
        marker_label: marker.marker_label,
        marker_icon: marker.marker_icon || "",
        marker_color: marker.marker_color || "#3ae2b3",
        description: marker.description || "",
        gm_notes: marker.gm_notes || "",
        is_active: marker.is_active !== false,
        is_visible_to_players: marker.is_visible_to_players !== false,
        display_order: marker.display_order || 0,
        visible_crew_ids: marker.visible_crew_ids ?? null,
      });
    } else {
      setFormData({
        marker_type: "CUSTOM",
        marker_label: "",
        marker_icon: "",
        marker_color: "#3ae2b3",
        description: "",
        gm_notes: "",
        is_active: true,
        is_visible_to_players: true,
        display_order: 0,
        visible_crew_ids: null,
      });
    }
  }, [marker, isOpen]);

  const handleTypeChange = (type: MarkerType) => {
    const typeConfig = markerTypes.find((t) => t.type === type);
    if (typeConfig) {
      setFormData((prev) => ({
        ...prev,
        marker_type: type,
        // Only update icon/color if they haven't been customized
        marker_icon: prev.marker_icon || typeConfig.icon,
        marker_color: prev.marker_color === "#3ae2b3" ? typeConfig.defaultColor : prev.marker_color,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.marker_label?.trim()) {
      alert("Please enter a marker label");
      return;
    }

    const markerToSave: HexMarker = {
      ...formData,
      sector,
      hex,
      marker_type: formData.marker_type as MarkerType,
      marker_label: formData.marker_label.trim(),
    } as HexMarker;

    try {
      await saveMarker(markerToSave);
      onClose();
    } catch (error) {
      console.error("Failed to save marker:", error);
      alert("Failed to save marker. Please try again.");
    }
  };

  if (!isOpen) return null;

  const selectedTypeConfig = markerTypes.find((t) => t.type === formData.marker_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="panel w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        <div className="panel-header">
          <span className="panel-title">
            {marker ? "EDIT MARKER" : "CREATE MARKER"}
          </span>
          <button
            className="text-terminal-text-dimmer hover:text-primary transition-colors"
            onClick={onClose}
            disabled={isSavingMarker}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="panel-content flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Marker Type */}
            <div>
              <label className="block text-sm text-terminal-text-dimmer mb-2">
                MARKER TYPE *
              </label>
              <select
                className="terminal-input w-full"
                value={formData.marker_type}
                onChange={(e) => handleTypeChange(e.target.value as MarkerType)}
                required
              >
                {markerTypes.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.icon} {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Marker Label */}
            <div>
              <label className="block text-sm text-terminal-text-dimmer mb-2">
                LABEL *
              </label>
              <input
                type="text"
                className="terminal-input w-full"
                value={formData.marker_label}
                onChange={(e) => setFormData({ ...formData, marker_label: e.target.value })}
                placeholder="e.g., SS Maelstrom, Research Outpost Alpha"
                required
                maxLength={100}
              />
            </div>

            {/* Icon and Color Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Icon Picker */}
              <div>
                <label className="block text-sm text-terminal-text-dimmer mb-2">
                  ICON
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="terminal-input w-full text-left flex items-center gap-2"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                  >
                    <span className="text-2xl marker-icon-display">
                      {formData.marker_icon || selectedTypeConfig?.icon || "⭐"}
                    </span>
                    <span className="text-xs text-terminal-text-dimmer">
                      {formData.marker_icon ? "Custom" : "Default"}
                    </span>
                  </button>
                  {showIconPicker && (
                    <div className="absolute top-full left-0 mt-1 w-full max-w-xs bg-black border border-primary p-2 rounded z-10 max-h-48 overflow-y-auto grid grid-cols-8 gap-1">
                      {MARKER_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className="text-2xl hover:bg-terminal-bg-border p-1 rounded transition-colors icon-picker-button"
                          onClick={() => {
                            setFormData({ ...formData, marker_icon: icon });
                            setShowIconPicker(false);
                          }}
                          title={icon}
                        >
                          <span className="marker-icon-display">{icon}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm text-terminal-text-dimmer mb-2">
                  COLOR
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-16 h-10 bg-black border border-primary rounded cursor-pointer"
                    value={formData.marker_color || "#3ae2b3"}
                    onChange={(e) => setFormData({ ...formData, marker_color: e.target.value })}
                  />
                  <input
                    type="text"
                    className="terminal-input flex-1"
                    value={formData.marker_color || "#3ae2b3"}
                    onChange={(e) => setFormData({ ...formData, marker_color: e.target.value })}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#3ae2b3"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-terminal-text-dimmer mb-2">
                DESCRIPTION
              </label>
              <textarea
                className="terminal-input w-full min-h-[80px] resize-y font-mono text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What players see about this marker..."
                maxLength={500}
              />
              <div className="text-xs text-terminal-text-dimmer mt-1">
                {formData.description?.length || 0} / 500
              </div>
            </div>

            {/* GM Notes */}
            {isGM && (
              <div>
                <label className="block text-sm text-terminal-text-dimmer mb-2">
                  GM NOTES
                </label>
                <textarea
                  className="terminal-input w-full min-h-[80px] resize-y font-mono text-sm border-terminal-warning"
                  value={formData.gm_notes}
                  onChange={(e) => setFormData({ ...formData, gm_notes: e.target.value })}
                  placeholder="GM-only information (for future GM mode)..."
                  maxLength={500}
                />
                <div className="text-xs text-terminal-warning mt-1">
                  For future GM mode • {formData.gm_notes?.length || 0} / 500
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-2 border-t border-terminal-bg-border pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-black border border-primary rounded accent-primary"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span className="text-sm text-terminal-primary-mid">Active (visible on map)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-black border border-primary rounded accent-primary"
                  checked={formData.is_visible_to_players !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, is_visible_to_players: e.target.checked })
                  }
                />
                <span className="text-sm text-terminal-primary-mid">
                  Visible to players (for future GM mode)
                </span>
              </label>
            </div>

            {/* Per-crew visibility (GM only) */}
            {isGM && (
              <div className="border-t border-terminal-bg-border pt-4">
                <label className="block text-sm text-terminal-text-dimmer mb-2">
                  CREW SCOPE
                </label>
                <CrewVisibilitySelector
                  value={formData.visible_crew_ids ?? null}
                  onChange={(ids) => setFormData({ ...formData, visible_crew_ids: ids })}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-terminal-bg-border">
            <button
              type="button"
              className="terminal-btn secondary"
              onClick={onClose}
              disabled={isSavingMarker}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="terminal-btn"
              disabled={isSavingMarker || !formData.marker_label?.trim()}
            >
              {isSavingMarker ? "SAVING..." : marker ? "UPDATE MARKER" : "CREATE MARKER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
