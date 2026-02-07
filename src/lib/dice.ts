/**
 * Dice rolling utilities for Traveller RPG mechanics
 *
 * Implements the standard Traveller skill check system:
 * 2d6 + Skill DM + Characteristic DM >= Target Difficulty
 */

export interface DiceRoll {
  dice: number;        // Raw dice result (2-12)
  skillDM: number;     // Skill modifier
  charDM: number;      // Characteristic modifier
  total: number;       // Final total
  difficulty: number;  // Target number
  success: boolean;    // Did it succeed?
}

/**
 * Roll a single d6 (returns 1-6)
 */
export function roll1d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Roll 2d6 (returns 2-12)
 */
export function roll2d6(): number {
  const die1 = roll1d6();
  const die2 = roll1d6();
  return die1 + die2;
}

export interface BoonBaneRoll {
  rolls: number[];      // All three dice rolled
  kept: number[];       // The two dice kept
  dropped: number;      // The die that was dropped
  total: number;        // Sum of kept dice
  type: 'boon' | 'bane' | 'normal';
}

/**
 * Roll with Boon (advantage): Roll 3d6, keep best 2
 */
export function rollWithBoon(): BoonBaneRoll {
  const rolls = [roll1d6(), roll1d6(), roll1d6()].sort((a, b) => b - a);
  const kept = [rolls[0], rolls[1]];
  const dropped = rolls[2];

  return {
    rolls,
    kept,
    dropped,
    total: kept[0] + kept[1],
    type: 'boon'
  };
}

/**
 * Roll with Bane (disadvantage): Roll 3d6, keep worst 2
 */
export function rollWithBane(): BoonBaneRoll {
  const rolls = [roll1d6(), roll1d6(), roll1d6()].sort((a, b) => a - b);
  const kept = [rolls[0], rolls[1]];
  const dropped = rolls[2];

  return {
    rolls: rolls.sort((a, b) => b - a), // Sort descending for display
    kept,
    dropped,
    total: kept[0] + kept[1],
    type: 'bane'
  };
}

/**
 * Normal 2d6 roll in BoonBane format for consistency
 */
export function rollNormal(): BoonBaneRoll {
  const die1 = roll1d6();
  const die2 = roll1d6();

  return {
    rolls: [die1, die2],
    kept: [die1, die2],
    dropped: 0,
    total: die1 + die2,
    type: 'normal'
  };
}

/**
 * Calculate characteristic DM based on value
 *
 * Traveller characteristic DM table:
 * 0-2: -2
 * 3-5: -1
 * 6-8: 0
 * 9-11: +1
 * 12-14: +2
 * 15+: +3
 */
export function getCharacteristicDM(value: number): number {
  if (value <= 2) return -2;
  if (value <= 5) return -1;
  if (value <= 8) return 0;
  if (value <= 11) return 1;
  if (value <= 14) return 2;
  return 3;
}

/**
 * Calculate skill DM based on proficiency and level
 *
 * - Proficient: Use skill level directly (+0 to +6)
 * - Unproficient: -3 penalty (reduced by Jack-of-All-Trades)
 */
export function getSkillDM(proficient: boolean, level: number, jackLevel?: number): number {
  if (proficient) {
    return Math.max(level, 0);
  }

  // Unproficient penalty: -3 (reduced by Jack-of-All-Trades)
  let penalty = -3;
  if (jackLevel !== undefined && jackLevel > 0) {
    const reduction = Math.min(jackLevel + 1, 2);
    penalty = Math.min(penalty + reduction, -1);
  }
  return penalty;
}

/**
 * Perform a complete Traveller skill check
 *
 * @param difficulty Target number to beat
 * @param skillDM Skill modifier (calculated from character)
 * @param charDM Characteristic modifier (calculated from character)
 * @param manualRoll Optional manual dice roll (for table play)
 * @returns Complete roll result with success/failure
 */
export function performSkillCheck(
  difficulty: number,
  skillDM: number,
  charDM: number,
  manualRoll?: number
): DiceRoll {
  const dice = manualRoll ?? roll2d6();
  const total = dice + skillDM + charDM;
  const success = total >= difficulty;

  return {
    dice,
    skillDM,
    charDM,
    total,
    difficulty,
    success
  };
}

export interface DamageRoll {
  expression: string;
  diceResults: number[];
  modifier: number;
  charMod: number;
  total: number;
}

/**
 * Roll a simple damage expression like "2d6+2" and add an optional characteristic modifier.
 * Supports NdM with optional +/− integer modifier.
 */
export function rollDamageExpression(expression: string, charMod: number = 0): DamageRoll {
  const trimmed = expression.replace(/\s+/g, '');
  const match = trimmed.match(/(\d*)d(\d+)([+-]\d+)?/i);

  if (!match) {
    const flat = Number(trimmed) || 0;
    return {
      expression,
      diceResults: [],
      modifier: flat,
      charMod,
      total: flat + charMod
    };
  }

  const count = Number(match[1] || "1");
  const faces = Number(match[2]);
  const modifier = Number(match[3] || "0");

  const diceResults: number[] = Array.from({ length: count }, () => Math.floor(Math.random() * faces) + 1);
  const diceTotal = diceResults.reduce((sum, val) => sum + val, 0);
  const total = diceTotal + modifier + charMod;

  return {
    expression,
    diceResults,
    modifier,
    charMod,
    total
  };
}
