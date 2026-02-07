import React, { lazy, Suspense, useEffect, useState } from "react";
import { Terminal, Users, Radar, Navigation, BookOpen, Swords, Skull } from "lucide-react";
import AppHeader from "./layout/AppHeader";
import AppFooter from "./layout/AppFooter";
import TerminalLoadingSkeleton from "./TerminalLoadingSkeleton";
import { useTabNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutOverlay } from "./KeyboardShortcutOverlay";

// Lazy-loaded tab interfaces for code-splitting
const TerminalInterface = lazy(() => import("./interfaces/TerminalInterface"));
const CrewInterface = lazy(() => import("./interfaces/CrewInterface"));
const VehicleInterface = lazy(() => import("./interfaces/VehicleInterface"));
const CombatInterface = lazy(() => import("./interfaces/CombatInterface"));
const CampaignInterface = lazy(() => import("./interfaces/CampaignInterface").then(m => ({ default: m.CampaignInterface })));
const PiracyInterface = lazy(() => import("./interfaces/PiracyInterface").then(m => ({ default: m.PiracyInterface })));
const BridgeConsole = lazy(() => import("./bridge/BridgeConsole").then(m => ({ default: m.BridgeConsole })));
const JumpPlannerInterface = lazy(() => import("./navigation/JumpPlannerInterface").then(m => ({ default: m.JumpPlannerInterface })));

export default function MainframeShell() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "terminal";
    return localStorage.getItem("mainframe_active_tab") || "terminal";
  });

  const [showShortcuts, setShowShortcuts] = useState(false);

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

  // Enable keyboard shortcuts for tab navigation (1-8)
  const tabIds = tabs.map(tab => tab.id);
  useTabNavigationShortcuts(setActiveTab, tabIds);

  // ? key to show shortcut overlay
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showShortcuts]);

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
        <Suspense fallback={<TerminalLoadingSkeleton />}>
          {activeTab === "terminal" && <TerminalInterface />}
          {activeTab === "crew" && <CrewInterface />}
          {activeTab === "vehicles" && <VehicleInterface />}
          {activeTab === "bridge" && <BridgeConsole />}
          {activeTab === "navigation" && <JumpPlannerInterface />}
          {activeTab === "campaign" && <CampaignInterface />}
          {activeTab === "piracy" && <PiracyInterface />}
          {activeTab === "combat" && <CombatInterface />}
        </Suspense>
      </main>

      <AppFooter />

      {/* Keyboard shortcut overlay */}
      {showShortcuts && (
        <KeyboardShortcutOverlay
          tabs={tabs}
          onClose={() => setShowShortcuts(false)}
        />
      )}
    </div>
  );
}
