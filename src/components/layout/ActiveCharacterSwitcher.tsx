/**
 * Header dropdown: "Playing as: [character] · [crew]".
 *
 * Visible to players who own more than one character (or one character with a
 * crew assigned — the picker is the primary way to confirm the viewer's
 * current crew). Hidden entirely for GMs (they bypass per-crew filtering) and
 * for players who own zero or one character with no crew.
 */

import React, { useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { useCampaign } from '@/contexts/CampaignContext';
import { cn } from '@/lib/utils';

export const ActiveCharacterSwitcher: React.FC = () => {
  const {
    currentPlayer,
    characters,
    crewGroups,
    activeCharacter,
    setActiveCharacter,
    isGM,
  } = useCampaign();
  const [open, setOpen] = useState(false);

  if (!currentPlayer || isGM) return null;

  const owned = characters.filter(c =>
    c.player_id === currentPlayer.id && (c.character_type || 'pc') === 'pc'
  );

  // Hide for players with no characters. Show a passive "Playing as" chip
  // when they only have one (useful feedback, not a menu).
  if (owned.length === 0) return null;

  const activeCrew = activeCharacter?.crew_id
    ? crewGroups.find(g => g.id === activeCharacter.crew_id)
    : null;

  const displayName = activeCharacter?.name || 'No active character';
  const hasMultiple = owned.length > 1;

  const choose = async (characterId: string) => {
    setOpen(false);
    await setActiveCharacter(characterId);
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => hasMultiple && setOpen(o => !o)}
        disabled={!hasMultiple}
        className={cn(
          'flex items-center gap-1 text-[11px] font-mono text-terminal-primary/80 border border-terminal-primary/25 px-2 py-0.5 rounded whitespace-nowrap transition-colors',
          hasMultiple && 'hover:border-terminal-primary/60 cursor-pointer',
        )}
        title={hasMultiple ? 'Switch active character' : 'Active character'}
      >
        <Users size={10} />
        <span className="hidden sm:inline text-terminal-primary/50">As:</span>
        <span>{displayName}</span>
        {activeCrew && (
          <>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full border border-black/40"
              style={{ backgroundColor: activeCrew.color }}
            />
            <span className="text-terminal-primary/60">{activeCrew.name}</span>
          </>
        )}
        {hasMultiple && (
          <ChevronDown
            size={10}
            className={cn('opacity-60 transition-transform', open && 'rotate-180')}
          />
        )}
      </button>

      {open && hasMultiple && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 z-50 border border-terminal-primary/30 rounded bg-terminal-bg-dark/95 backdrop-blur-sm shadow-lg shadow-black/50 min-w-[220px] overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-terminal-primary/60 border-b border-terminal-primary/20">
              Playing as
            </div>
            {owned.map(c => {
              const crew = c.crew_id ? crewGroups.find(g => g.id === c.crew_id) : null;
              const isActive = c.id === activeCharacter?.id;
              return (
                <button
                  key={c.id}
                  onClick={() => choose(c.id)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-left transition-colors border-l-2',
                    isActive
                      ? 'text-terminal-primary bg-terminal-primary/10 border-terminal-primary'
                      : 'text-terminal-primary/70 hover:text-terminal-primary hover:bg-terminal-primary/5 border-transparent',
                  )}
                >
                  <span className="flex-1 truncate">{c.name}</span>
                  {crew && (
                    <>
                      <span
                        className="inline-block h-2 w-2 rounded-full border border-black/40"
                        style={{ backgroundColor: crew.color }}
                      />
                      <span className="text-[10px] text-terminal-primary/60">{crew.name}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
