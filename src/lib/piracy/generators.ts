import { roll1d6, roll2d6 } from '@/lib/dice';
import {
  PreyType,
  SystemClassification,
  SystemSecurity,
  CrewPosition,
  CrewSkillLevel,
} from '@/types/piracy';
import {
  CREWMAN_NAMES,
  CREWMAN_QUIRKS,
  PREY_ENCOUNTER_TABLE,
  CREW_POSITION_CONFIG,
} from './tables';

// === Random Name & Quirk Generators ===

export function generateCrewName(): string {
  const index = Math.floor(Math.random() * CREWMAN_NAMES.length);
  return CREWMAN_NAMES[index];
}

export function generateCrewQuirk(): string {
  const index = Math.floor(Math.random() * CREWMAN_QUIRKS.length);
  return CREWMAN_QUIRKS[index];
}

export function generateRandomPosition(): CrewPosition {
  const positions: CrewPosition[] = ['pilot', 'navigator', 'engineer', 'medic', 'gunner', 'marine'];
  return positions[Math.floor(Math.random() * positions.length)];
}

export function generateRandomSkillLevel(): CrewSkillLevel {
  // Weighted: most recruits are green or average
  const roll = roll1d6();
  if (roll <= 2) return 'green';
  if (roll <= 4) return 'average';
  if (roll === 5) return 'good';
  return 'excellent'; // 6 = excellent, legendary is extremely rare
}

export function getBaseSalary(position: CrewPosition): number {
  return CREW_POSITION_CONFIG[position].baseSalary;
}

// === Morale Generators ===

export function rollInitialMorale(): number {
  return roll1d6() + 6;
}

export function rollMoraleDamage(): number {
  return roll1d6();
}

// === Prey Encounter Generator ===

export interface PreyEncounterRoll {
  rawDice: [number, number];
  modifiedDice: [number, number];
  result: PreyType;
  tableKey: string;
}

export function rollPreyEncounter(
  classification: SystemClassification,
  security: SystemSecurity
): PreyEncounterRoll {
  const die1 = roll1d6();
  const die2 = roll1d6();

  // Apply modifiers to first die (system traffic)
  let mod1 = 0;
  if (classification === 'backwater') mod1 = -1;
  if (classification === 'high_traffic') mod1 = 1;
  if (classification === 'capital') mod1 = 2;

  // Apply modifiers to second die (system security)
  let mod2 = 0;
  if (security === 'dangerous') mod2 = -1;
  if (security === 'secure') mod2 = 1;
  if (security === 'naval_base') mod2 = 2;

  const modDie1 = Math.max(0, Math.min(7, (die1 - 1) + mod1));
  const modDie2 = Math.max(0, Math.min(8, (die2 - 1) + mod2));

  const tableKey = `${modDie1}${modDie2}`;
  const result = PREY_ENCOUNTER_TABLE[tableKey] || 'no_encounter';

  return {
    rawDice: [die1, die2],
    modifiedDice: [modDie1, modDie2],
    result,
    tableKey,
  };
}

// === Standing Generators ===

export function rollStandingChange(diceCount: number): number {
  let total = 0;
  for (let i = 0; i < Math.abs(diceCount); i++) {
    total += roll1d6();
  }
  return diceCount < 0 ? -total : total;
}

// === Crew Retention ===

export function rollCrewRetention(morDM: number): { roll: number; total: number; stays: boolean } {
  const roll = roll2d6();
  const total = roll + morDM;
  return { roll, total, stays: total >= 6 };
}

// === Bounty Calculator ===

export function calculateBounty(standing: number): number {
  if (standing >= -5) return 0;
  const absStanding = Math.abs(standing);
  return 1000 * roll1d6() * absStanding;
}
