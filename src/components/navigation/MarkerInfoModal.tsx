import { X } from "lucide-react";
import type { HexMarker } from "@/types/navigation";
import { getMarkerTypeConfig } from "@/config/markerTypes";

interface MarkerInfoModalProps {
  marker: HexMarker;
  isOpen: boolean;
  onClose: () => void;
}

export function MarkerInfoModal({ marker, isOpen, onClose }: MarkerInfoModalProps) {
  const config = getMarkerTypeConfig(marker.marker_type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="terminal-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#1a2420]">
          <div className="flex items-center gap-3">
            <span
              className="text-4xl"
              style={{ color: marker.marker_color || config.defaultColor }}
            >
              {marker.marker_icon || config.icon}
            </span>
            <div>
              <h2 className="text-xl font-bold text-primary">
                {marker.marker_label}
              </h2>
              <div className="text-sm text-[#446655]">{config.label}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a2420] text-[#00ccff] hover:text-primary transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location */}
        <div className="mb-4">
          <div className="text-xs text-[#446655] uppercase mb-1">Location</div>
          <div className="text-lg text-[#00ccff] font-mono">
            {marker.sector} {marker.hex}
          </div>
        </div>

        {/* Description */}
        {marker.description && (
          <div className="mb-4">
            <div className="text-xs text-[#446655] uppercase mb-1">Description</div>
            <div className="text-sm text-[#00aa00] whitespace-pre-wrap">
              {marker.description}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div>
            <div className="text-[#446655] uppercase mb-1">Type</div>
            <div className="text-primary">{config.label}</div>
          </div>
          <div>
            <div className="text-[#446655] uppercase mb-1">Status</div>
            <div className="text-primary">
              {marker.is_active !== false ? "Active" : "Inactive"}
            </div>
          </div>
        </div>

        {/* GM Notes (if any) */}
        {marker.gm_notes && (
          <div className="mb-4">
            <div className="text-xs text-[#446655] uppercase mb-1">GM Notes</div>
            <div className="text-sm text-[#00ccff] whitespace-pre-wrap opacity-60">
              {marker.gm_notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#1a2420] flex justify-end">
          <button
            onClick={onClose}
            className="terminal-btn secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
