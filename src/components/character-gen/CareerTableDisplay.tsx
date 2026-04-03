import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TableEntry {
  index: number;
  label: string;
  description: string;
}

interface CareerTableDisplayProps {
  title: string;
  entries: TableEntry[];
  /** Color for the title text */
  titleColor?: string;
  /** Whether the table starts collapsed (default: true) */
  defaultCollapsed?: boolean;
  /** Index to highlight (e.g., the rolled result) */
  highlightIndex?: number;
}

export const CareerTableDisplay: React.FC<CareerTableDisplayProps> = ({
  title,
  entries,
  titleColor = 'text-terminal-primary',
  defaultCollapsed = true,
  highlightIndex,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="bg-black border border-terminal-primary/30 rounded">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-terminal-primary/5 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-terminal-primary/50 shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 text-terminal-primary/50 shrink-0" />
        )}
        <h4 className={`text-xs font-bold ${titleColor}`}>{title}</h4>
      </button>
      {!collapsed && (
        <div className="px-3 pb-3 space-y-1 text-xs text-terminal-primary/70">
          {entries.map((entry) => (
            <div
              key={entry.index}
              className={`flex gap-2 ${
                highlightIndex === entry.index
                  ? 'bg-green-500/20 border border-green-500/50 rounded p-1 text-green-400'
                  : ''
              }`}
            >
              <span className="text-terminal-primary/50 shrink-0">{entry.label}</span>
              <span>{entry.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
