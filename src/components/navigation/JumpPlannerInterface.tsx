import React, { useState } from "react";
import { StarMapPanel } from "./StarMapPanel";
import { ControlPanel } from "./ControlPanel";
import { WorldInfoPanel } from "./WorldInfoPanel";
import { CustomMarkersPanel } from "./CustomMarkersPanel";
import { CampaignNotesPanel } from "./CampaignNotesPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calculator, Globe, MapPin, FileText } from "lucide-react";

type NavPanelTab = "jump" | "world" | "markers" | "notes";

const NAV_TABS: { id: NavPanelTab; label: string; shortLabel: string; icon: typeof Calculator }[] = [
  { id: "jump", label: "JUMP CALC", shortLabel: "JUMP", icon: Calculator },
  { id: "world", label: "WORLD INFO", shortLabel: "WORLD", icon: Globe },
  { id: "markers", label: "MARKERS", shortLabel: "MARK", icon: MapPin },
  { id: "notes", label: "NOTES", shortLabel: "NOTE", icon: FileText },
];

function JumpPlannerInterfaceInner() {
  const isMobile = useIsMobile();
  const [activePanel, setActivePanel] = useState<NavPanelTab>("jump");

  return (
    <div className="interface-container overflow-auto">
      {/* Header - Compact */}
      <header className="interface-header py-2">
        <div className="flex items-center gap-3">
          <h1 className="interface-title text-base 3xl:text-xl">NAVIGATION COMPUTER</h1>
          <p className="interface-subtitle text-xs 3xl:text-sm m-0">Jump Calculator & Star Map</p>
        </div>
        <div className="text-xs 3xl:text-sm text-terminal-text-dimmer">
          TravellerMap Integration v1.0
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] 3xl:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] gap-3 p-3 min-h-0 max-h-[calc(100vh-120px)] overflow-auto">
        {/* Left: Star Map */}
        <div className="flex flex-col gap-3 min-h-0 min-w-0">
          <StarMapPanel />
        </div>

        {/* Right: Controls & Info */}
        {isMobile ? (
          /* Mobile: Tabbed interface - one panel at a time */
          <div className="flex flex-col min-h-0 min-w-0">
            {/* Tab bar */}
            <div className="grid grid-cols-4 border border-primary/30 rounded-t overflow-hidden flex-shrink-0">
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activePanel === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 text-[0.6rem] font-mono uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-primary/15 text-primary border-b-2 border-primary shadow-[0_0_8px_rgba(58, 226, 179,0.2)]"
                        : "bg-terminal-bg-panel text-terminal-text-dimmer hover:text-primary/70 hover:bg-primary/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Active panel content */}
            <div className="overflow-y-auto max-h-[50vh] border border-t-0 border-primary/20 rounded-b bg-terminal-bg-panel/50">
              {activePanel === "jump" && <ControlPanel />}
              {activePanel === "world" && <WorldInfoPanel />}
              {activePanel === "markers" && <CustomMarkersPanel />}
              {activePanel === "notes" && <CampaignNotesPanel />}
            </div>
          </div>
        ) : (
          /* Desktop/Tablet: Scrollable sidebar with all panels */
          <div className="flex flex-col gap-2 min-h-0 min-w-0 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
            <ControlPanel />
            <WorldInfoPanel />
            <CustomMarkersPanel />
            <CampaignNotesPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export const JumpPlannerInterface = React.memo(JumpPlannerInterfaceInner);
export default JumpPlannerInterface;
