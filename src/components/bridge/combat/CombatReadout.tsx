import { useEffect, useState, useCallback } from 'react';
import type { CombatReadoutEvent } from '@/types/shipCombatBridge';
import {
  Crosshair, ShieldAlert, Wrench, Radar, Swords,
  Rocket, Zap, AlertTriangle, Navigation
} from 'lucide-react';

const BASE_READOUT_DURATION = 7000; // ms before auto-dismiss
const STAGGER_DELAY = 2000; // extra ms per queued position so they cascade out

const ACCENT_COLORS: Record<CombatReadoutEvent['accent'], { border: string; glow: string; text: string; bg: string }> = {
  green:  { border: '#00ff88', glow: 'rgba(0,255,136,0.4)',  text: '#00ff88', bg: 'rgba(0,255,136,0.06)' },
  red:    { border: '#ff4455', glow: 'rgba(255,68,85,0.4)',   text: '#ff4455', bg: 'rgba(255,68,85,0.06)' },
  cyan:   { border: '#00ccff', glow: 'rgba(0,204,255,0.4)',   text: '#00ccff', bg: 'rgba(0,204,255,0.06)' },
  orange: { border: '#ffaa00', glow: 'rgba(255,170,0,0.4)',   text: '#ffaa00', bg: 'rgba(255,170,0,0.06)' },
  yellow: { border: '#ffdd44', glow: 'rgba(255,221,68,0.35)', text: '#ffdd44', bg: 'rgba(255,221,68,0.06)' },
};

const CATEGORY_ICONS: Record<string, typeof Crosshair> = {
  attack_hit: Crosshair,
  attack_miss: Crosshair,
  damage: ShieldAlert,
  critical: AlertTriangle,
  repair: Wrench,
  sensor: Radar,
  dogfight: Swords,
  initiative: Navigation,
  maneuver: Navigation,
  missile: Rocket,
  missile_launch: Rocket,
  jump: Zap,
  destroyed: AlertTriangle,
  boarding: Swords,
  general: Zap,
};

interface CombatReadoutProps {
  events: CombatReadoutEvent[];
  onDismiss: (id: string) => void;
}

function ReadoutCard({ event, onDismiss, index }: { event: CombatReadoutEvent; onDismiss: (id: string) => void; index: number }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // Cards further down the stack get extra time so the player can read them all
  const duration = BASE_READOUT_DURATION + index * STAGGER_DELAY;

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(event.id), 300);
  }, [event.id, onDismiss]);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        handleDismiss();
      }
    }, 50);
    return () => clearInterval(timer);
  }, [handleDismiss, duration]);

  const colors = ACCENT_COLORS[event.accent];
  const Icon = CATEGORY_ICONS[event.category] ?? Zap;

  return (
    <div
      className={`combat-readout-card ${exiting ? 'combat-readout-exit' : 'combat-readout-enter'}`}
      style={{
        borderColor: colors.border,
        boxShadow: `0 0 20px ${colors.glow}, inset 0 0 30px ${colors.bg}`,
        background: `linear-gradient(135deg, rgba(0,0,0,0.92) 0%, ${colors.bg} 100%)`,
      }}
      onClick={handleDismiss}
    >
      {/* Scanline overlay */}
      <div className="combat-readout-scanlines" />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)` }}
      />

      {/* Header row */}
      <div className="flex items-center gap-2 mb-1.5">
        <Icon
          className="h-4 w-4 shrink-0"
          style={{ color: colors.text, filter: `drop-shadow(0 0 4px ${colors.glow})` }}
        />
        <span
          className="font-['Orbitron'] text-[0.65rem] md:text-xs tracking-[2px] font-bold uppercase truncate"
          style={{ color: colors.text, textShadow: `0 0 8px ${colors.glow}` }}
        >
          {event.title}
        </span>
      </div>

      {/* Detail lines */}
      <div className="space-y-0.5 pl-6">
        {event.details.map((line, i) => (
          <div
            key={i}
            className="font-['Share_Tech_Mono'] text-[0.6rem] md:text-[0.65rem] leading-tight"
            style={{
              color: i === 0 ? colors.text : 'var(--text-muted)',
              opacity: i === 0 ? 1 : 0.85,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-[2px] bg-white/5 rounded overflow-hidden">
        <div
          className="h-full transition-none rounded"
          style={{
            width: `${progress}%`,
            background: colors.border,
            opacity: 0.6,
          }}
        />
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.border}40, transparent)` }}
      />
    </div>
  );
}

export function CombatReadout({ events, onDismiss }: CombatReadoutProps) {
  // Show up to 5 readouts so burst events (hit + multiple crits) are all visible
  const visible = events.slice(0, 5);

  if (visible.length === 0) return null;

  return (
    <div className="combat-readout-container" role="status" aria-live="assertive" aria-label="Combat alerts">
      {visible.map((event, i) => (
        <ReadoutCard key={event.id} event={event} onDismiss={onDismiss} index={i} />
      ))}
    </div>
  );
}
