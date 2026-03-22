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
      <div className="flex items-center gap-3 px-4 h-10 min-w-0">

        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="app-shell-title text-sm tracking-widest whitespace-nowrap">
            {title.toUpperCase()}
          </span>
          {currentDate && (
            <div className="hidden sm:flex items-center gap-1 text-terminal-primary/60 text-[10px] font-mono border border-terminal-primary/20 px-1.5 py-0.5 rounded">
              <Calendar size={9} />
              <span>{currentDate.formatted}</span>
            </div>
          )}
          <CrtThemePicker />
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-terminal-primary/20 flex-shrink-0" />

        {/* Tabs — scrollable single row */}
        <nav
          className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-none min-w-0"
          role="tablist"
          aria-label="Mainframe views"
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={cn("tab-button phosphor-hover flex-shrink-0", isActive && "tab-button--active")}
                onClick={() => onTabChange(tab.id)}
                title={`${tab.label} (Press ${index + 1})`}
              >
                {tab.emoji ? (
                  <span className="opacity-70 leading-none" style={{ fontSize: "11px" }} aria-hidden>{tab.emoji}</span>
                ) : Icon ? (
                  <Icon size={11} aria-hidden className="opacity-70" />
                ) : null}
                <span className="tab-label">{tab.label.toUpperCase()}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="w-px h-5 bg-terminal-primary/20 flex-shrink-0" />

        {/* Player info + logout */}
        {currentPlayer && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 text-[11px] font-mono text-terminal-primary/80 border border-terminal-primary/25 px-2 py-0.5 rounded whitespace-nowrap">
              {isGM ? <Shield size={10} className="text-yellow-400" /> : <User size={10} />}
              <span className={isGM ? "text-yellow-400" : ""}>{currentPlayer.name}</span>
              {isGM && <span className="text-yellow-400/60 text-[9px]">GM</span>}
            </div>
            <button
              onClick={logout}
              className="flex items-center text-terminal-primary/40 hover:text-red-400 transition-colors p-1 rounded border border-transparent hover:border-red-400/30"
              title="Log out"
            >
              <LogOut size={11} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
