import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <header className="app-shell-header">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="app-shell-title">{title}</h1>
            <p className="app-shell-subtitle">{subtitle}</p>
          </div>

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
                    <span className="opacity-70" aria-hidden>{tab.emoji}</span>
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
    </header>
  );
}
