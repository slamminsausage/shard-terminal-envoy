import React, { useRef, useState, useEffect, useCallback } from "react";
import { LucideIcon, Calendar, LogOut, Shield, User, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/contexts/CalendarContext";
import { useCampaign } from "@/contexts/CampaignContext";
import { CrtThemePicker } from "@/components/CrtThemePicker";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const threshold = 2;
    setCanScrollLeft(nav.scrollLeft > threshold);
    setCanScrollRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - threshold);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    updateScrollState();

    nav.addEventListener("scroll", updateScrollState, { passive: true });

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(nav);

    return () => {
      nav.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  // Auto-scroll active tab into view
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const activeBtn = nav.querySelector('[aria-selected="true"]') as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeTab]);

  const scrollNav = (dir: number) => {
    navRef.current?.scrollBy({ left: dir * 150, behavior: "smooth" });
  };

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

        {/* Tabs — dropdown on mobile, scrollable row on desktop */}
        {isMobile ? (
          <div className="flex-1 relative min-w-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded border border-terminal-primary/30 bg-terminal-bg-dark/80 text-terminal-primary text-xs font-mono tracking-wider hover:border-terminal-primary/60 transition-colors w-full justify-between"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                {(() => {
                  const active = tabs.find(t => t.id === activeTab);
                  if (!active) return null;
                  const Icon = active.icon;
                  return (
                    <>
                      {active.emoji ? (
                        <span className="leading-none" style={{ fontSize: "11px" }}>{active.emoji}</span>
                      ) : Icon ? (
                        <Icon size={11} className="flex-shrink-0" />
                      ) : null}
                      <span className="truncate">{active.label.toUpperCase()}</span>
                    </>
                  );
                })()}
              </span>
              <ChevronDown size={12} className={cn("flex-shrink-0 opacity-60 transition-transform", dropdownOpen && "rotate-180")} />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 z-50 border border-terminal-primary/30 rounded bg-terminal-bg-dark/95 backdrop-blur-sm shadow-lg shadow-black/50 max-h-[70vh] overflow-y-auto">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2.5 text-xs font-mono tracking-wider text-left transition-colors",
                          isActive
                            ? "text-terminal-primary bg-terminal-primary/10 border-l-2 border-terminal-primary"
                            : "text-terminal-primary/70 hover:text-terminal-primary hover:bg-terminal-primary/5 border-l-2 border-transparent"
                        )}
                        onClick={() => {
                          onTabChange(tab.id);
                          setDropdownOpen(false);
                        }}
                      >
                        {tab.emoji ? (
                          <span className="leading-none w-4 text-center" style={{ fontSize: "11px" }}>{tab.emoji}</span>
                        ) : Icon ? (
                          <Icon size={12} className="w-4 flex-shrink-0" />
                        ) : <span className="w-4" />}
                        <span>{tab.label.toUpperCase()}</span>
                        <span className="ml-auto text-terminal-primary/30 text-[10px]">{index + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 relative flex items-center min-w-0">
            {/* Left scroll arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scrollNav(-1)}
                className="absolute left-0 z-10 h-full px-1 flex items-center bg-gradient-to-r from-[var(--header-bg,#000)] via-[var(--header-bg,#000)] to-transparent"
                aria-label="Scroll tabs left"
              >
                <ChevronLeft size={12} className="text-terminal-primary/70" />
              </button>
            )}

            <nav
              ref={navRef}
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

            {/* Right scroll arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollNav(1)}
                className="absolute right-0 z-10 h-full px-1 flex items-center bg-gradient-to-l from-[var(--header-bg,#000)] via-[var(--header-bg,#000)] to-transparent"
                aria-label="Scroll tabs right"
              >
                <ChevronRight size={12} className="text-terminal-primary/70" />
              </button>
            )}
          </div>
        )}

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
