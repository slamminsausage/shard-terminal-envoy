import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import TerminalInterface from "./interfaces/TerminalInterface";
import CrewInterface from "./interfaces/CrewInterface";
import VehicleInterface from "./interfaces/VehicleInterface";

export default function MainframeShell() {
  const [activeTab, setActiveTab] = useState("terminal");

  const tabs = [
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "crew", label: "Crew & Sheets", icon: Users },
    { id: "vehicles", label: "Vehicles & Spaceships", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30 bg-background p-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h1 className="text-primary font-mono text-sm mb-1">TRAVELLER TERMINAL SYSTEM</h1>
            <div className="text-primary/60 font-mono text-xs">
              2025-09-19 08:01:14
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-primary/30 bg-background">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="terminal"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-none border-r border-primary/30 px-4 py-2 font-mono text-xs h-8",
                  activeTab === tab.id && "bg-primary text-background"
                )}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </nav>

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
      </main>
    </div>
  );
}