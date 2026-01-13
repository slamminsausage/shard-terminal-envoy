import React, { useState } from "react";
import { LucideIcon, Dices, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DiceRoller } from "@/components/dice/DiceRoller";
import { ExportImportDialog } from "@/components/campaign/ExportImportDialog";

type HeaderTab = {
  id: string;
  label: string;
  icon?: LucideIcon;
  emoji?: string;
};

interface AppHeaderProps {
  title: string;
  subtitle: string;
  tabs: HeaderTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function AppHeader({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange
}: AppHeaderProps) {
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  return (
    <>
      <header className="app-shell-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="app-shell-title">{title}</h1>
              <p className="app-shell-subtitle">{subtitle}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Dice Roller Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDiceRollerOpen(true)}
                className="gap-2"
              >
                <Dices className="w-4 h-4" />
                <span className="hidden sm:inline">Roll Dice</span>
              </Button>

              {/* Export/Import Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportImportOpen(true)}
                className="gap-2"
              >
                <FileJson className="w-4 h-4" />
                <span className="hidden sm:inline">Export/Import</span>
              </Button>

              <nav className="app-shell-tabs" role="tablist" aria-label="Mainframe views">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      className={cn("tab-button", isActive && "tab-button--active")}
                      onClick={() => onTabChange(tab.id)}
                    >
                      {tab.emoji ? (
                        <span className="opacity-70 text-sm leading-none" style={{ fontSize: '14px' }} aria-hidden>{tab.emoji}</span>
                      ) : Icon ? (
                        <Icon size={14} aria-hidden className="opacity-70" />
                      ) : null}
                      <span>{tab.label.toUpperCase()}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <DiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
      />

      <ExportImportDialog
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
      />
    </>
  );
}
