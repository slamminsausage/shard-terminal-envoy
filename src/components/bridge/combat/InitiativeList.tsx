import type { Contact } from '@/lib/bridge/bridgeTypes';
import { getEffectiveThrust, getSystemFlags } from '@/hooks/useShipCombat';
import { hexDistance, hexDistanceToRangeBand } from '@/lib/bridge/hexCombatUtils';
import { RANGE_BAND_LABELS } from '@/lib/bridge/shipCombatRules';

interface InitiativeListProps {
  combatants: Contact[];
  playerShip: Contact | undefined;
  selectedContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  sensorLocks: Record<string, string>;
  boardingPressure: Record<string, number>;
}

const rangeBandColors: Record<string, string> = {
  adjacent: 'text-red-300',
  close: 'text-orange-300',
  short: 'text-yellow-300',
  medium: 'text-blue-300',
  long: 'text-purple-300',
  very_long: 'text-indigo-300',
  distant: 'text-slate-300',
};

export function InitiativeList({ combatants, playerShip, selectedContactId, onSelectContact, sensorLocks, boardingPressure }: InitiativeListProps) {
  const sorted = [...combatants].sort((a, b) => (b.initiative ?? -999) - (a.initiative ?? -999));

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {sorted.map((ship, idx) => {
        const hullPct = ship.hullMax ? Math.max(0, (ship.hullCurrent ?? 0) / ship.hullMax) : 1;
        const rangeBand = playerShip && ship.id !== playerShip.id
          ? hexDistanceToRangeBand(hexDistance(playerShip.hexQ, playerShip.hexR, ship.hexQ, ship.hexR))
          : null;
        const flags = getSystemFlags(ship);
        const isSelected = selectedContactId === ship.id;
        const hasLock = Object.values(sensorLocks).includes(ship.id);
        const pressure = boardingPressure[ship.id] ?? 0;

        return (
          <button
            key={ship.id}
            onClick={() => onSelectContact(ship)}
            className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-all ${
              isSelected
                ? 'bg-terminal-primary/15 border border-terminal-primary/40'
                : 'hover:bg-terminal-primary/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-terminal-text-dimmer w-4">{idx + 1}.</span>
              <span className={`flex-1 font-bold ${
                ship.isPlayerShip ? 'text-terminal-primary-light' :
                ship.status === 'enemy' ? 'text-terminal-danger-alt' :
                'text-terminal-secondary'
              }`}>
                {ship.name}
              </span>
              <span className="text-terminal-primary/50">[{ship.initiative ?? '—'}]</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 pl-6">
              {/* Hull bar */}
              <div className="flex-1 h-1.5 bg-terminal-bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    hullPct > 0.5 ? 'bg-terminal-primary' :
                    hullPct > 0.25 ? 'bg-terminal-warning-alt' :
                    'bg-terminal-danger-alt'
                  }`}
                  style={{ width: `${hullPct * 100}%` }}
                />
              </div>
              <span className="text-terminal-text-dimmer text-[0.6rem] w-12 text-right">
                {ship.hullCurrent ?? 0}/{ship.hullMax ?? 0}
              </span>
              {/* Range badge */}
              {rangeBand && (
                <span className={`text-[0.55rem] ${rangeBandColors[rangeBand] ?? 'text-terminal-text-dimmer'}`}>
                  {RANGE_BAND_LABELS[rangeBand]?.slice(0, 3)}
                </span>
              )}
            </div>
            {/* Status indicators */}
            {(flags.length > 0 || hasLock || pressure > 0) && (
              <div className="flex gap-1 mt-0.5 pl-6 flex-wrap">
                {flags.map(f => (
                  <span key={f} className="text-[0.5rem] text-terminal-danger-alt bg-terminal-danger-alt/10 px-1 rounded">
                    {f}
                  </span>
                ))}
                {hasLock && (
                  <span className="text-[0.5rem] text-yellow-300 bg-yellow-500/10 px-1 rounded">LOCKED</span>
                )}
                {pressure > 0 && (
                  <span className="text-[0.5rem] text-red-300 bg-red-500/10 px-1 rounded">BOARDED:{pressure}</span>
                )}
              </div>
            )}
          </button>
        );
      })}
      {sorted.length === 0 && (
        <p className="text-terminal-text-dimmer text-xs text-center py-3">No ships in combat. Add ships to begin.</p>
      )}
    </div>
  );
}
