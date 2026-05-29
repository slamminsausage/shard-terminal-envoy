import React, { useMemo, useState } from "react";
import { useCampaign } from "@/contexts/CampaignContext";
import { useQuest } from "@/contexts/QuestContext";
import { useFinance } from "@/contexts/FinanceContext";
import { useSession } from "@/contexts/SessionContext";
import { useCalendar } from "@/contexts/CalendarContext";
import { useBridge } from "@/contexts/BridgeContext";
import AlertTicker, { AlertEntry } from "@/components/dashboard/AlertTicker";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SectionSeparator from "@/components/dashboard/SectionSeparator";
import CrewReadinessCard from "@/components/dashboard/CrewReadinessCard";
import ShipStatusCard from "@/components/dashboard/ShipStatusCard";
import ActiveQuestsCard from "@/components/dashboard/ActiveQuestsCard";
import FinancesCard from "@/components/dashboard/FinancesCard";
import RecentTerminalsCard from "@/components/dashboard/RecentTerminalsCard";
import UpcomingSessionCard from "@/components/dashboard/UpcomingSessionCard";
import QuickLaunch from "@/components/dashboard/QuickLaunch";
import SystemStatusFooter from "@/components/dashboard/SystemStatusFooter";
import { Character } from "@/types/database";

interface DashboardInterfaceProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function buildAlerts(characters: Character[], vehicle: any, quests: any[]): AlertEntry[] {
  const alerts: AlertEntry[] = [];

  if (vehicle) {
    const hullPct = ((vehicle.hull_current ?? vehicle.hull) / Math.max(vehicle.hull, 1)) * 100;
    if (hullPct < 30) {
      alerts.push({ id: "hull", text: `${vehicle.name}: HULL CRITICAL — ${Math.round(hullPct)}%`, severity: "crit" });
    } else if (hullPct < 60) {
      alerts.push({ id: "hull-warn", text: `${vehicle.name}: HULL DAMAGED — ${Math.round(hullPct)}%`, severity: "warn" });
    }
  }

  characters.forEach(c => {
    const curEnd = c.current_endurance ?? c.endurance;
    if (curEnd <= 0) {
      alerts.push({ id: c.id, text: `${c.name}: INCAPACITATED`, severity: "crit" });
    } else if (curEnd / Math.max(c.endurance, 1) < 0.3) {
      alerts.push({ id: c.id + "-w", text: `${c.name}: INJURED`, severity: "warn" });
    }
  });

  quests
    .filter((q: any) => q.priority === "urgent")
    .forEach((q: any) => alerts.push({ id: q.id, text: `URGENT: ${q.title.toUpperCase()}`, severity: "crit" }));

  quests
    .filter((q: any) => q.priority === "high")
    .forEach((q: any) => alerts.push({ id: q.id + "-h", text: `HIGH PRIORITY: ${q.title.toUpperCase()}`, severity: "warn" }));

  if (alerts.length === 0) {
    alerts.push({ id: "ok", text: "ALL SYSTEMS NOMINAL — ECLIPSE SHARD CAMPAIGN ACTIVE", severity: "ok" });
  }

  return alerts;
}

export default function DashboardInterface({ activeTab, onTabChange }: DashboardInterfaceProps) {
  const { characters, vehicles, crewGroups } = useCampaign();
  const { quests } = useQuest();
  const { partyFunds, recurringExpenses, transactions } = useFinance();
  const { sessions } = useSession();
  const { currentDate } = useCalendar();
  const { bridgeState } = useBridge();

  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);

  // Active ship: prefer bridge's designated player ship, then crew's ship, then first "Ship" vehicle
  const activeShip = useMemo(() => {
    const allVehicles = vehicles ?? [];
    if (bridgeState.playerShipId) {
      const found = allVehicles.find(v => v.id === bridgeState.playerShipId);
      if (found) return found;
    }
    if (selectedCrewId) {
      const crew = (crewGroups ?? []).find(g => g.id === selectedCrewId);
      if (crew?.ship_id) {
        const found = allVehicles.find(v => v.id === crew.ship_id);
        if (found) return found;
      }
    }
    return allVehicles.find(v => v.vehicle_type?.toLowerCase() === "ship") ?? null;
  }, [vehicles, bridgeState.playerShipId, selectedCrewId, crewGroups]);

  // Characters filtered by selected crew (null = all), excluding non-crew NPCs,
  // with PCs sorted before crew NPCs
  const filteredCharacters = useMemo(() => {
    const all = characters ?? [];
    const crewOnly = all.filter(c =>
      c.character_type !== 'npc' || c.npc_role === 'crew'
    );
    const byCrewId = selectedCrewId
      ? crewOnly.filter(c => c.crew_id === selectedCrewId)
      : crewOnly;
    return [...byCrewId].sort((a, b) => {
      const aIsNpc = a.character_type === 'npc' ? 1 : 0;
      const bIsNpc = b.character_type === 'npc' ? 1 : 0;
      return aIsNpc - bIsNpc;
    });
  }, [characters, selectedCrewId]);

  // IDs of characters in the selected crew (for finance filtering)
  const crewCharacterIds = useMemo(
    () => new Set(filteredCharacters.map(c => c.id)),
    [filteredCharacters]
  );

  // Filter transactions and recurring expenses to the selected crew's members + ship
  const filteredTransactions = useMemo(() => {
    const all = transactions ?? [];
    if (!selectedCrewId) return all;
    const shipId = activeShip?.id;
    return all.filter(t =>
      !t.character_id ||
      crewCharacterIds.has(t.character_id) ||
      (shipId && t.vehicle_id === shipId)
    );
  }, [transactions, selectedCrewId, crewCharacterIds, activeShip]);

  const filteredExpenses = useMemo(() => {
    const all = recurringExpenses ?? [];
    if (!selectedCrewId) return all;
    const shipId = activeShip?.id;
    return all.filter(e =>
      !e.vehicle_id ||
      (shipId && e.vehicle_id === shipId)
    );
  }, [recurringExpenses, selectedCrewId, activeShip]);

  const activeQuests = useMemo(
    () => (quests ?? []).filter(q => q.status === "active" && !q.is_hidden),
    [quests]
  );

  const alerts = useMemo(
    () => buildAlerts(filteredCharacters, activeShip, activeQuests),
    [filteredCharacters, activeShip, activeQuests]
  );

  return (
    <div className="interface-container">
      <AlertTicker alerts={alerts} />

      <DashboardHeader imperialDate={currentDate?.formatted} />

      {/* Crew selector strip */}
      {(crewGroups ?? []).length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-1.5 border-b border-terminal-border/10">
          <span className="text-[8px] font-mono text-terminal-primary/30 uppercase tracking-widest mr-1">Crew:</span>
          <button
            className={`text-[9px] font-mono px-2 py-0.5 rounded-sm border transition-colors ${
              selectedCrewId === null
                ? "border-terminal-primary/50 text-terminal-primary bg-terminal-primary/10"
                : "border-terminal-primary/15 text-terminal-primary/40 hover:text-terminal-primary/70 hover:border-terminal-primary/30"
            }`}
            onClick={() => setSelectedCrewId(null)}
          >
            All Crews
          </button>
          {(crewGroups ?? []).map(g => (
            <button
              key={g.id}
              className={`text-[9px] font-mono px-2 py-0.5 rounded-sm border transition-colors flex items-center gap-1 ${
                selectedCrewId === g.id
                  ? "border-terminal-primary/50 text-terminal-primary bg-terminal-primary/10"
                  : "border-terminal-primary/15 text-terminal-primary/40 hover:text-terminal-primary/70 hover:border-terminal-primary/30"
              }`}
              onClick={() => setSelectedCrewId(g.id)}
            >
              {g.color && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: g.color }}
                />
              )}
              {g.name}
            </button>
          ))}
        </div>
      )}

      <SectionSeparator label="OPERATIONS STATUS" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 px-4 pb-2">
        <CrewReadinessCard characters={filteredCharacters} />
        <ShipStatusCard vehicle={activeShip} />
        <ActiveQuestsCard quests={activeQuests} />
        <FinancesCard
          partyFunds={partyFunds}
          recurringExpenses={filteredExpenses}
          transactions={filteredTransactions}
        />
        <RecentTerminalsCard />
        <UpcomingSessionCard sessions={sessions ?? []} />
      </div>

      <SectionSeparator label="QUICK LAUNCH" />

      <QuickLaunch activeTab={activeTab} onTabChange={onTabChange} />

      <SystemStatusFooter
        characters={filteredCharacters}
        vehicle={activeShip}
        activeQuestCount={activeQuests.length}
        balance={partyFunds?.balance ?? null}
      />
    </div>
  );
}
