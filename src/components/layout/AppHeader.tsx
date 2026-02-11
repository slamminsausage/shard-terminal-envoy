import React from "react";
import { LucideIcon, Calendar, LogOut, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/contexts/CalendarContext";
import { useCampaign } from "@/contexts/CampaignContext";
import { CrtThemePicker } from "@/components/CrtThemePicker";

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
  const { currentDate } = useCalendar();
  const { currentPlayer, isGM, logout } = useCampaign();

  return (
    <header className="app-shell-header">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 3xl:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          <div className="flex items-center justify-between sm:block">
            <div>
              <h1 className="app-shell-title">{title}</h1>
              <div className="flex items-center gap-3">
                <p className="app-shell-subtitle">{subtitle}</p>
                {currentDate && (
                  <div className="flex items-center gap-1 text-terminal-primary/70 text-xs border border-terminal-primary/30 px-2 py-0.5 rounded">
                    <Calendar size={12} />
                    <span>{currentDate.formatted}</span>
                  </div>
                )}
                <CrtThemePicker />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Player info + logout */}
            {currentPlayer && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-terminal-primary/80 border border-terminal-primary/30 px-2 py-1 rounded">
                  {isGM ? <Shield size={12} className="text-yellow-400" /> : <User size={12} />}
                  <span className={isGM ? "text-yellow-400" : ""}>{currentPlayer.name}</span>
                  {isGM && <span className="text-yellow-400/60 text-[10px]">GM</span>}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-terminal-primary/50 hover:text-red-400 transition-colors px-1.5 py-1 rounded border border-transparent hover:border-red-400/30"
                  title="Log out"
                >
                  <LogOut size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="app-shell-tabs mt-2" role="tablist" aria-label="Mainframe views">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const shortcutNumber = index + 1;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={cn("tab-button", isActive && "tab-button--active")}
                onClick={() => onTabChange(tab.id)}
                title={`${tab.label} (Press ${shortcutNumber})`}
              >
                {tab.emoji ? (
                  <span className="opacity-70 text-sm leading-none" style={{ fontSize: '14px' }} aria-hidden>{tab.emoji}</span>
                ) : Icon ? (
                  <Icon size={14} aria-hidden className="opacity-70" />
                ) : null}
                <span className="tab-label">{tab.label.toUpperCase()}</span>
                <span className="text-[10px] opacity-50 ml-1 hidden sm:inline" aria-label={`Shortcut: ${shortcutNumber}`}>
                  {shortcutNumber}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
