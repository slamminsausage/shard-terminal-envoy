/**
 * Compact badge that tells a GM which crews can see a given piece of content.
 * Shown next to quest cards, handouts, etc. Not rendered for unscoped items
 * (to reduce visual noise) unless `showAllCrews` is true.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useCampaign } from '@/contexts/CampaignContext';
import { describeCrewVisibility } from '@/lib/crewVisibility';

interface CrewVisibilityBadgeProps {
  ids: string[] | null | undefined;
  /** Render "All Crews" even when the item is unscoped. Default: hide. */
  showAllCrews?: boolean;
  className?: string;
}

export const CrewVisibilityBadge: React.FC<CrewVisibilityBadgeProps> = ({
  ids,
  showAllCrews = false,
  className = '',
}) => {
  const { crewGroups } = useCampaign();

  const isScoped = !!ids && ids.length > 0;
  if (!isScoped && !showAllCrews) return null;

  const label = describeCrewVisibility(ids, crewGroups);

  // For scoped items, pick the first matching crew's color as a visual tell.
  const primaryColor = isScoped
    ? crewGroups.find(g => g.id === ids![0])?.color
    : undefined;

  return (
    <Badge
      variant="outline"
      className={`gap-1 border-terminal-primary/40 bg-terminal-primary/10 text-terminal-primary ${className}`}
      title={isScoped ? `Only these crews can see this: ${label}` : 'Visible to all crews'}
    >
      <Eye className="h-3 w-3" />
      {primaryColor && (
        <span
          className="inline-block h-2 w-2 rounded-full border border-black/40"
          style={{ backgroundColor: primaryColor }}
        />
      )}
      <span className="text-[10px] uppercase tracking-wide">{label}</span>
    </Badge>
  );
};
