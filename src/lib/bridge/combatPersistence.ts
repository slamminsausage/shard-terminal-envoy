import type { ShipCombatEngineState } from '@/types/shipCombatBridge';

const COMBAT_STATE_KEY = 'bridge-combat-state';
const DEBOUNCE_MS = 1000;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function saveCombatState(state: ShipCombatEngineState): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      localStorage.setItem(COMBAT_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save combat state:', e);
    }
  }, DEBOUNCE_MS);
}

export function loadCombatState(): ShipCombatEngineState | null {
  try {
    const raw = localStorage.getItem(COMBAT_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShipCombatEngineState;
  } catch {
    return null;
  }
}

export function clearCombatState(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  localStorage.removeItem(COMBAT_STATE_KEY);
}
