import React, { Suspense, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Users, Radar, Navigation, BookOpen, Swords, Skull, Layout } from "lucide-react";
import AppHeader from "./layout/AppHeader";
import AppFooter from "./layout/AppFooter";
import TerminalLoadingSkeleton from "./TerminalLoadingSkeleton";
import { KeyboardShortcutOverlay } from "./KeyboardShortcutOverlay";
import { lazyWithRetry, lazyNamedWithRetry } from "@/lib/lazyWithRetry";
import ErrorBoundary from "./ErrorBoundary";

// Lazy-loaded tab interfaces with automatic retry on stale chunk errors
const TerminalInterface = lazyWithRetry(() => import("./interfaces/TerminalInterface"));
const CrewInterface = lazyWithRetry(() => import("./interfaces/CrewInterface"));
const VehicleInterface = lazyWithRetry(() => import("./interfaces/VehicleInterface"));
const CombatInterface = lazyWithRetry(() => import("./interfaces/CombatInterface"));
const CampaignInterface = lazyNamedWithRetry(() => import("./interfaces/CampaignInterface"), "CampaignInterface");
const PiracyInterface = lazyNamedWithRetry(() => import("./interfaces/PiracyInterface"), "PiracyInterface");
const BridgeConsole = lazyNamedWithRetry(() => import("./bridge/BridgeConsole"), "BridgeConsole");
const JumpPlannerInterface = lazyNamedWithRetry(() => import("./navigation/JumpPlannerInterface"), "JumpPlannerInterface");
const VTTInterface = lazyWithRetry(() => import("./interfaces/VTTInterface"));

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

  const tabs = useMemo(() => [
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "crew", label: "Crew", icon: Users },
    { id: "vehicles", label: "Hangar", emoji: "🛦" },
    { id: "bridge", label: "Bridge", icon: Radar },
    { id: "navigation", label: "Star Map", icon: Navigation },
    { id: "campaign", label: "Campaign", icon: BookOpen },
    { id: "piracy", label: "Piracy", icon: Skull },
    { id: "combat", label: "Combat", icon: Swords },
    { id: "vtt", label: "VTT", icon: Layout }
  ], []);

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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <AppHeader
        title="Traveller Terminal"
        subtitle="Eclipse Shard Saga Interface"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <main
        className={`flex-1 min-h-0 overflow-hidden ${
          activeTab === "vtt"
            ? "w-full max-w-none px-0"
            : "w-full max-w-[2400px] mx-auto px-2 sm:px-3 lg:px-4 2xl:px-6 overflow-y-auto"
        }`}
      >
        <Suspense fallback={<TerminalLoadingSkeleton />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className={activeTab === "vtt" ? "h-full overflow-hidden" : ""}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {activeTab === "terminal" && <ErrorBoundary inline fallbackMessage="Terminal system failure"><TerminalInterface /></ErrorBoundary>}
              {activeTab === "crew" && <ErrorBoundary inline fallbackMessage="Crew interface failure"><CrewInterface /></ErrorBoundary>}
              {activeTab === "vehicles" && <ErrorBoundary inline fallbackMessage="Hangar interface failure"><VehicleInterface /></ErrorBoundary>}
              {activeTab === "bridge" && <ErrorBoundary inline fallbackMessage="Bridge console failure"><BridgeConsole /></ErrorBoundary>}
              {activeTab === "navigation" && <ErrorBoundary inline fallbackMessage="Navigation failure"><JumpPlannerInterface /></ErrorBoundary>}
              {activeTab === "campaign" && <ErrorBoundary inline fallbackMessage="Campaign interface failure"><CampaignInterface /></ErrorBoundary>}
              {activeTab === "piracy" && <ErrorBoundary inline fallbackMessage="Piracy interface failure"><PiracyInterface /></ErrorBoundary>}
              {activeTab === "combat" && <ErrorBoundary inline fallbackMessage="Combat interface failure"><CombatInterface /></ErrorBoundary>}
              {activeTab === "vtt" && <ErrorBoundary inline fallbackMessage="VTT failure"><VTTInterface /></ErrorBoundary>}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <AppFooter />

      {/* Keyboard shortcut overlay */}
      {showShortcuts && (
        <KeyboardShortcutOverlay
          onClose={() => setShowShortcuts(false)}
        />
      )}
    </div>
  );
}
