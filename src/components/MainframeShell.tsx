import React, { useEffect, useState } from "react";
import { Terminal, FileText, Users, Radar, Navigation } from "lucide-react";
import TerminalInterface from "./interfaces/TerminalInterface";
import CrewInterface from "./interfaces/CrewInterface";
import VehicleInterface from "./interfaces/VehicleInterface";
import AppHeader from "./layout/AppHeader";
import { BridgeConsole } from "./bridge/BridgeConsole";
import { JumpPlannerInterface } from "./navigation/JumpPlannerInterface";

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
    { id: "vehicles", label: "Vehicles & Spaceships", icon: FileText },
    { id: "bridge", label: "Bridge Console", icon: Radar },
    { id: "navigation", label: "Star Map", icon: Navigation }
  ];

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
      </main>
    </div>
  );
}
