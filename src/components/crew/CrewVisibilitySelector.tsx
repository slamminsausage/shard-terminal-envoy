/**
 * GM-only multi-select for restricting a piece of content to specific crews.
 *
 * Shown in every GM-authored content create/edit form (quest, handout, note,
 * hex marker, session, calendar event). When no crews are selected (or the
 * "All crews" toggle is on), the item is visible to everybody — the
 * backward-compatible default.
 */

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye } from 'lucide-react';
import { useCampaign } from '@/contexts/CampaignContext';

interface CrewVisibilitySelectorProps {
  /** Currently selected crew IDs. `null`/`undefined`/`[]` all mean "all crews". */
  value: string[] | null | undefined;
  onChange: (next: string[] | null) => void;
  /** Optional override of the label text shown above the list. */
  label?: string;
  className?: string;
}

export const CrewVisibilitySelector: React.FC<CrewVisibilitySelectorProps> = ({
  value,
  onChange,
  label = 'Visible to crews',
  className = '',
}) => {
  const { crewGroups } = useCampaign();
  const selected = value || [];
  const allCrews = selected.length === 0;

  const toggleAllCrews = (checked: boolean) => {
    onChange(checked ? null : crewGroups.map(g => g.id));
  };

  const toggleCrew = (crewId: string) => {
    const next = selected.includes(crewId)
      ? selected.filter(id => id !== crewId)
      : [...selected, crewId];
    // If the GM manually selects every crew we'd rather persist as "all"
    // (null) so future new crews auto-inherit visibility.
    if (next.length === 0 || next.length === crewGroups.length) {
      onChange(null);
    } else {
      onChange(next);
    }
  };

  if (crewGroups.length === 0) {
    return (
      <div className={`rounded border border-terminal-primary/30 bg-terminal-primary/5 p-3 text-xs text-terminal-primary/70 ${className}`}>
        <div className="flex items-center gap-2 mb-1">
          <Eye className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wide">{label}</span>
        </div>
        No crew groups defined yet. Create crews under Crew → Groups to scope
        content to individual crews.
      </div>
    );
  }

  return (
    <div className={`rounded border border-terminal-primary/40 bg-terminal-primary/5 p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Eye className="h-3.5 w-3.5 text-terminal-primary" />
        <span className="text-xs text-terminal-primary uppercase tracking-wide">
          {label}
        </span>
      </div>

      <label className="flex items-center gap-2 mb-2 cursor-pointer">
        <Checkbox
          checked={allCrews}
          onCheckedChange={(c) => toggleAllCrews(!!c)}
        />
        <span className="text-sm text-terminal-primary">All crews (default)</span>
      </label>

      <div className="pl-6 space-y-1">
        {crewGroups.map(group => (
          <label key={group.id} className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={!allCrews && selected.includes(group.id)}
              disabled={allCrews}
              onCheckedChange={() => toggleCrew(group.id)}
            />
            <span
              className="inline-block h-2.5 w-2.5 rounded-full border border-black/40"
              style={{ backgroundColor: group.color }}
            />
            <span className="text-sm text-terminal-primary">{group.name}</span>
          </label>
        ))}
      </div>

      <p className="text-[11px] text-terminal-primary/60 mt-2">
        Leave as "All crews" for campaign-wide content. Pick specific crews to
        hide this from anyone whose active character belongs to a different
        crew. GMs always see everything.
      </p>
    </div>
  );
};
