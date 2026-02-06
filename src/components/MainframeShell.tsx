import React, { useEffect, useState } from "react";
import { Terminal, FileText, Users, Radar, Navigation, BookOpen, Swords, Skull } from "lucide-react";
import TerminalInterface from "./interfaces/TerminalInterface";
import CrewInterface from "./interfaces/CrewInterface";
import VehicleInterface from "./interfaces/VehicleInterface";
import CombatInterface from "./interfaces/CombatInterface";
import { CampaignInterface } from "./interfaces/CampaignInterface";
import { PiracyInterface } from "./interfaces/PiracyInterface";
import AppHeader from "./layout/AppHeader";
import AppFooter from "./layout/AppFooter";
import { BridgeConsole } from "./bridge/BridgeConsole";
import { JumpPlannerInterface } from "./navigation/JumpPlannerInterface";
import { useTabNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function MainframeShell() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "terminal";
    return localStorage.getItem("mainframe_active_tab") || "terminal";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mainframe_active_tab", activeTab);
    }
  }, [activeTab]);

  const tabs = [
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "crew", label: "Crew", icon: Users },
    { id: "vehicles", label: "Hangar", emoji: "🛦" },
    { id: "bridge", label: "Bridge", icon: Radar },
    { id: "navigation", label: "Star Map", icon: Navigation },
    { id: "campaign", label: "Campaign", icon: BookOpen },
    { id: "piracy", label: "Piracy", icon: Skull },
    { id: "combat", label: "Combat", icon: Swords }
  ];

  // Enable keyboard shortcuts for tab navigation (1-7)
  const tabIds = tabs.map(tab => tab.id);
  useTabNavigationShortcuts(setActiveTab, tabIds);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="Traveller Terminal"
        subtitle="Eclipse Shard Saga Interface"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <main className="flex-1">
        {activeTab === "terminal" && (
          <TerminalInterface />
        )}
        {activeTab === "crew" && (
          <CrewInterface />
        )}
        {activeTab === "vehicles" && (
          <VehicleInterface />
        )}
        {activeTab === "bridge" && (
          <BridgeConsole />
        )}
        {activeTab === "navigation" && (
          <JumpPlannerInterface />
        )}
        {activeTab === "campaign" && (
          <CampaignInterface />
        )}
        {activeTab === "piracy" && (
          <PiracyInterface />
        )}
        {activeTab === "combat" && (
          <CombatInterface />
        )}
      </main>

      <AppFooter />
    </div>
  );
}
