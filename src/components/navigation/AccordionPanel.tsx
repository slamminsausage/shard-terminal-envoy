import { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface AccordionPanelProps {
  title: string;
  statusLabel?: string | number;
  defaultExpanded?: boolean;
  children: ReactNode;
  headerAction?: ReactNode;
}

export function AccordionPanel({
  title,
  statusLabel,
  defaultExpanded = true,
  children,
  headerAction,
}: AccordionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="panel accordion-panel overflow-hidden">
      <div
        className="panel-header cursor-pointer select-none hover:bg-[#1a2420] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="panel-title">{title}</span>
          {statusLabel !== undefined && (
            <span className="panel-status">{statusLabel}</span>
          )}
        </div>
        {headerAction && (
          <div onClick={(e) => e.stopPropagation()}>{headerAction}</div>
        )}
      </div>

      {isExpanded && (
        <div className="panel-content">
          {children}
        </div>
      )}
    </div>
  );
}
