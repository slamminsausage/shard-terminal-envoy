import React, { useEffect, useState } from "react";
import { Terminal, FileText, Users, Radar, Navigation, Bot, BookOpen } from "lucide-react";
import TerminalInterface from "./interfaces/TerminalInterface";
import CrewInterface from "./interfaces/CrewInterface";
import VehicleInterface from "./interfaces/VehicleInterface";
import NexaInterface from "./interfaces/NexaInterface";
import { NotesInterface } from "./interfaces/NotesInterface";
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
    { id: "vehicles", label: "Hangar", emoji: "🛦" },
    { id: "bridge", label: "Bridge", icon: Radar },
    { id: "navigation", label: "Star Map", icon: Navigation },
    { id: "notes", label: "Notes", icon: BookOpen },
    { id: "nexa", label: "NEXA", icon: Bot }
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
        {activeTab === "notes" && (
          <NotesInterface />
        )}
        {activeTab === "nexa" && (
          <NexaInterface />
        )}
      </main>
    </div>
  );
}
