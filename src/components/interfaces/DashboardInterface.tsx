import React, { useMemo } from "react";
import { useCampaign } from "@/contexts/CampaignContext";
import { useQuest } from "@/contexts/QuestContext";
import { useFinance } from "@/contexts/FinanceContext";
import { useSession } from "@/contexts/SessionContext";
import { useCalendar } from "@/contexts/CalendarContext";
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
  const { characters, vehicles } = useCampaign();
  const { quests } = useQuest();
  const { partyFunds, recurringExpenses, transactions } = useFinance();
  const { sessions } = useSession();
  const { currentDate } = useCalendar();

  const ship = useMemo(
    () => (vehicles ?? []).find(v => v.vehicle_type?.toLowerCase() === "ship") ?? null,
    [vehicles]
  );

  const activeQuests = useMemo(
    () => (quests ?? []).filter(q => q.status === "active" && !q.is_hidden),
    [quests]
  );

  const alerts = useMemo(
    () => buildAlerts(characters ?? [], ship, activeQuests),
    [characters, ship, activeQuests]
  );

  return (
    <div className="interface-container">
      <AlertTicker alerts={alerts} />

      <DashboardHeader imperialDate={currentDate?.formatted ?? currentDate?.day ? `${currentDate.day}-${currentDate.year}` : undefined} />

      <SectionSeparator label="OPERATIONS STATUS" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 px-4 pb-2">
        <CrewReadinessCard characters={characters ?? []} />
        <ShipStatusCard vehicle={ship} />
        <ActiveQuestsCard quests={activeQuests} />
        <FinancesCard
          partyFunds={partyFunds}
          recurringExpenses={recurringExpenses ?? []}
          transactions={transactions ?? []}
        />
        <RecentTerminalsCard />
        <UpcomingSessionCard sessions={sessions ?? []} />
      </div>

      <SectionSeparator label="QUICK LAUNCH" />

      <QuickLaunch activeTab={activeTab} onTabChange={onTabChange} />

      <SystemStatusFooter
        characters={characters ?? []}
        vehicle={ship}
        activeQuestCount={activeQuests.length}
        balance={partyFunds?.balance ?? null}
      />
    </div>
  );
}
