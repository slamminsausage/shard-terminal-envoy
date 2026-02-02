import { StarMapPanel } from "./StarMapPanel";
import { ControlPanel } from "./ControlPanel";
import { WorldInfoPanel } from "./WorldInfoPanel";
import { CustomMarkersPanel } from "./CustomMarkersPanel";
import { CampaignNotesPanel } from "./CampaignNotesPanel";

export function JumpPlannerInterface() {
  return (
    <div className="interface-container overflow-auto">
      {/* Header */}
      <header className="interface-header">
        <div>
          <h1 className="interface-title">NAVIGATION COMPUTER</h1>
          <p className="interface-subtitle">Jump Calculator & Star Map</p>
        </div>
        <div className="text-xs text-terminal-text-dimmer">
          TravellerMap Integration v1.0
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] gap-3 p-3 min-h-0 max-h-[calc(100vh-140px)] overflow-auto">
        {/* Left: Star Map */}
        <div className="flex flex-col gap-3 min-h-0 min-w-0">
          <StarMapPanel />
        </div>

        {/* Right: Controls & Info - Reorganized Order */}
        <div className="flex flex-col gap-3 min-h-0 min-w-0 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
          {/* 1-3: Jump Calculator, Jump Worlds, Route Planner (in ControlPanel with accordions) */}
          <ControlPanel />

          {/* 4: World Information (non-collapsible, hidden when no world) */}
          <WorldInfoPanel />

          {/* 5: Custom Markers (accordion) */}
          <CustomMarkersPanel />

          {/* 6: Campaign Notes (accordion) */}
          <CampaignNotesPanel />
        </div>
      </div>
    </div>
  );
}

export default JumpPlannerInterface;
