import { JumpPlannerProvider } from "@/contexts/JumpPlannerContext";
import { StarMapPanel } from "./StarMapPanel";
import { ControlPanel } from "./ControlPanel";
import { WorldInfoPanel } from "./WorldInfoPanel";

export function JumpPlannerInterface() {
  return (
    <JumpPlannerProvider>
      <div className="jump-planner h-full flex flex-col bg-[#0a0e0c] text-[#00ff88] font-mono border border-primary/30 rounded shadow-[0_0_32px_rgba(0,255,0,0.12)]">
        {/* Header */}
        <header className="jump-planner-header flex justify-between items-center px-6 py-3 border-b border-[#1a2420] bg-gradient-to-b from-[#00ff8808] to-transparent">
          <div className="flex items-center gap-4">
            <span className="font-['Orbitron'] font-black text-xl tracking-[4px] drop-shadow-[0_0_20px_#00ff88]">
              NAVIGATION COMPUTER
            </span>
            <span className="text-[#446655] text-sm">
              Jump Calculator & Star Map
            </span>
          </div>
          <div className="text-sm text-[#446655]">
            TravellerMap Integration v1.0
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-[1fr_400px] gap-3 p-3 min-h-0 overflow-hidden">
          {/* Left: Star Map */}
          <div className="flex flex-col gap-3 min-h-0">
            <StarMapPanel />
          </div>

          {/* Right: Controls & Info */}
          <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
            <ControlPanel />
            <WorldInfoPanel />
          </div>
        </div>
      </div>
    </JumpPlannerProvider>
  );
}

export default JumpPlannerInterface;
