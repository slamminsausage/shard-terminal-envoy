import React, { Suspense, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Users, Radar, Navigation, BookOpen, Swords, Skull, Layout, LayoutDashboard } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "./layout/AppHeader";
import AppFooter from "./layout/AppFooter";
import TerminalLoadingSkeleton from "./TerminalLoadingSkeleton";
import { KeyboardShortcutOverlay } from "./KeyboardShortcutOverlay";
import { lazyWithRetry, lazyNamedWithRetry } from "@/lib/lazyWithRetry";

// Lazy-loaded tab interfaces with automatic retry on stale chunk errors
const MissionControlInterface = lazyNamedWithRetry(() => import("./interfaces/MissionControlInterface"), "MissionControlInterface");
const TerminalInterface = lazyWithRetry(() => import("./interfaces/TerminalInterface"));
const CrewInterface = lazyWithRetry(() => import("./interfaces/CrewInterface"));
const VehicleInterface = lazyWithRetry(() => import("./interfaces/VehicleInterface"));
const CombatInterface = lazyWithRetry(() => import("./interfaces/CombatInterface"));
const CampaignInterface = lazyNamedWithRetry(() => import("./interfaces/CampaignInterface"), "CampaignInterface");
const PiracyInterface = lazyNamedWithRetry(() => import("./interfaces/PiracyInterface"), "PiracyInterface");
const BridgeConsole = lazyNamedWithRetry(() => import("./bridge/BridgeConsole"), "BridgeConsole");
const JumpPlannerInterface = lazyNamedWithRetry(() => import("./navigation/JumpPlannerInterface"), "JumpPlannerInterface");
const VTTInterface = lazyWithRetry(() => import("./interfaces/VTTInterface"));

const TAB_IDS = ["mission", "terminal", "crew", "vehicles", "bridge", "navigation", "campaign", "piracy", "combat", "vtt"] as const;
type MainframeTabId = typeof TAB_IDS[number];

const normalizeTabId = (tabId?: string | null): MainframeTabId => {
  if (tabId === "hangar") return "vehicles";
  if (tabId === "starmap" || tabId === "star-map") return "navigation";
  return TAB_IDS.includes(tabId as MainframeTabId) ? (tabId as MainframeTabId) : "mission";
};

export default function MainframeShell() {
  const navigate = useNavigate();
  const { tabId } = useParams<{ tabId?: string }>();
  const routeTab = normalizeTabId(tabId);

  const [activeTab, setActiveTab] = useState<MainframeTabId>(() => {
    if (typeof window === "undefined") return routeTab;
    return normalizeTabId(tabId || localStorage.getItem("mainframe_active_tab") || "mission");
  });

  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    setActiveTab(routeTab);
  }, [routeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mainframe_active_tab", activeTab);
    }
  }, [activeTab]);

  const handleTabChange = (nextTab: string) => {
    const normalized = normalizeTabId(nextTab);
    setActiveTab(normalized);
    navigate(`/app/${normalized}`);
  };

  const tabs = useMemo(() => [
    { id: "mission", label: "Mission", icon: LayoutDashboard },
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
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        title="Traveller Terminal"
        subtitle="Eclipse Shard Saga Interface"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <main
        className={`flex-1 min-h-0 ${
          activeTab === "vtt"
            ? "w-full max-w-none px-0"
            : "w-full max-w-[2400px] mx-auto px-1 sm:px-3 lg:px-4 2xl:px-6"
        }`}
      >
        <Suspense fallback={<TerminalLoadingSkeleton />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className={activeTab === "vtt" ? "h-full" : ""}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {activeTab === "mission" && <MissionControlInterface />}
              {activeTab === "terminal" && <TerminalInterface />}
              {activeTab === "crew" && <CrewInterface />}
              {activeTab === "vehicles" && <VehicleInterface />}
              {activeTab === "bridge" && <BridgeConsole />}
              {activeTab === "navigation" && <JumpPlannerInterface />}
              {activeTab === "campaign" && <CampaignInterface />}
              {activeTab === "piracy" && <PiracyInterface />}
              {activeTab === "combat" && <CombatInterface />}
              {activeTab === "vtt" && <VTTInterface />}
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
