import { useState } from "react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { HexMarkerPanel } from "./HexMarkerPanel";
import { MarkerEditorModal } from "./MarkerEditorModal";
import type { HexMarker } from "@/types/navigation";

export function CustomMarkersPanel() {
  const { currentLocation } = useJumpPlanner();
  const [isMarkerModalOpen, setIsMarkerModalOpen] = useState(false);
  const [editingMarker, setEditingMarker] = useState<HexMarker | null>(null);

  const handleCreateMarker = () => {
    setEditingMarker(null);
    setIsMarkerModalOpen(true);
  };

  const handleEditMarker = (marker: HexMarker) => {
    setEditingMarker(marker);
    setIsMarkerModalOpen(true);
  };

  const handleCloseMarkerModal = () => {
    setIsMarkerModalOpen(false);
    setEditingMarker(null);
  };

  if (!currentLocation) {
    return null;
  }

  return (
    <>
      <HexMarkerPanel
        onEditMarker={handleEditMarker}
        onCreateMarker={handleCreateMarker}
      />

      <MarkerEditorModal
        isOpen={isMarkerModalOpen}
        onClose={handleCloseMarkerModal}
        marker={editingMarker}
        sector={currentLocation.sector}
        hex={currentLocation.hex}
      />
    </>
  );
}
