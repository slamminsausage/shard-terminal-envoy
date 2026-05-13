import { useRef, useEffect } from 'react';
import type { CombatLogEntry } from '@/types/shipCombatBridge';

interface CombatLogProps {
  log: CombatLogEntry[];
  maxEntries?: number;
}

export function CombatLog({ log, maxEntries = 50 }: CombatLogProps) {
  const entries = log.slice(0, maxEntries);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div className="space-y-0.5 max-h-32 overflow-y-auto font-['Share_Tech_Mono'] text-[0.6rem]" role="log" aria-live="polite" aria-label="Combat log">
      {entries.length === 0 && (
        <p className="text-terminal-text-dimmer text-center py-2">No combat log entries yet.</p>
      )}
      {entries.map(entry => (
        <div key={entry.id} className="flex gap-1.5 text-terminal-text-dimmer leading-tight">
          <span className="text-terminal-primary/40 whitespace-nowrap shrink-0">R{entry.round}</span>
          <span className="text-terminal-primary/80">{entry.message}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
