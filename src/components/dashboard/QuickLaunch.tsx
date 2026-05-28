import React from "react";

interface QuickLaunchProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BUTTONS = [
  { id: "terminal",   label: "Terminal", glyph: ">_" },
  { id: "crew",       label: "Crew",     glyph: "◉"  },
  { id: "vehicles",   label: "Hangar",   glyph: "△"  },
  { id: "bridge",     label: "Bridge",   glyph: "◈"  },
  { id: "navigation", label: "Star Map", glyph: "✦"  },
  { id: "campaign",   label: "Campaign", glyph: "◈"  },
  { id: "piracy",     label: "Piracy",   glyph: "⚑"  },
  { id: "combat",     label: "Combat",   glyph: "†"  },
  { id: "vtt",        label: "VTT",      glyph: "⬡"  },
];

export default function QuickLaunch({ activeTab, onTabChange }: QuickLaunchProps) {
  return (
    <div className="px-4 pb-3">
      {/* 3 cols mobile → 5 cols sm → 9 cols md+ */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {BUTTONS.map(btn => (
          <button
            key={btn.id}
            className={`quick-launch-btn${activeTab === btn.id ? " quick-launch-btn--active" : ""}`}
            onClick={() => onTabChange(btn.id)}
            aria-pressed={activeTab === btn.id}
          >
            <span className="text-base leading-none" style={{ fontFamily: "var(--font-mono)" }}>{btn.glyph}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
