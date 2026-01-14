/**
 * Tests for Traveller RPG dice rolling mechanics
 */

import { describe, it, expect, vi } from 'vitest';
import {
  roll1d6,
  roll2d6,
  rollWithBoon,
  rollWithBane,
  rollNormal,
  getCharacteristicDM,
  getSkillDM,
  performSkillCheck,
  rollDamageExpression,
} from './dice';

describe('Basic Dice Rolling', () => {
  describe('roll1d6', () => {
    it('should return a number between 1 and 6', () => {
      for (let i = 0; i < 100; i++) {
        const result = roll1d6();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should eventually produce all values from 1 to 6', () => {
      const results = new Set<number>();
      for (let i = 0; i < 1000; i++) {
        results.add(roll1d6());
      }
      expect(results.size).toBe(6);
      expect(results.has(1)).toBe(true);
      expect(results.has(6)).toBe(true);
    });
  });

  describe('roll2d6', () => {
    it('should return a number between 2 and 12', () => {
      for (let i = 0; i < 100; i++) {
        const result = roll2d6();
        expect(result).toBeGreaterThanOrEqual(2);
        expect(result).toBeLessThanOrEqual(12);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should have an average close to 7', () => {
      const rolls = Array.from({ length: 10000 }, () => roll2d6());
      const average = rolls.reduce((sum, val) => sum + val, 0) / rolls.length;
      // Average should be close to 7 (expected value of 2d6)
      expect(average).toBeGreaterThan(6.5);
      expect(average).toBeLessThan(7.5);
    });
  });
});

describe('Boon/Bane System', () => {
  describe('rollWithBoon', () => {
    it('should roll 3 dice and keep the best 2', () => {
      const result = rollWithBoon();

      expect(result.rolls).toHaveLength(3);
      expect(result.kept).toHaveLength(2);
      expect(result.type).toBe('boon');

      // Kept dice should be the two highest
      const sortedRolls = [...result.rolls].sort((a, b) => b - a);
      expect(result.kept[0]).toBe(sortedRolls[0]);
      expect(result.kept[1]).toBe(sortedRolls[1]);

      // Dropped should be the lowest
      expect(result.dropped).toBe(sortedRolls[2]);

      // Total should be sum of kept dice
      expect(result.total).toBe(result.kept[0] + result.kept[1]);
    });

    it('should have a higher average than normal 2d6', () => {
      const boonRolls = Array.from({ length: 1000 }, () => rollWithBoon().total);
      const normalRolls = Array.from({ length: 1000 }, () => roll2d6());

      const boonAvg = boonRolls.reduce((sum, val) => sum + val, 0) / boonRolls.length;
      const normalAvg = normalRolls.reduce((sum, val) => sum + val, 0) / normalRolls.length;

      expect(boonAvg).toBeGreaterThan(normalAvg);
    });
  });

  describe('rollWithBane', () => {
    it('should roll 3 dice and keep the worst 2', () => {
      const result = rollWithBane();

      expect(result.rolls).toHaveLength(3);
      expect(result.kept).toHaveLength(2);
      expect(result.type).toBe('bane');

      // Kept dice should be the two lowest
      const sortedRolls = [...result.rolls].sort((a, b) => a - b);
      expect(result.kept[0]).toBe(sortedRolls[0]);
      expect(result.kept[1]).toBe(sortedRolls[1]);

      // Dropped should be the highest
      expect(result.dropped).toBe(sortedRolls[2]);

      // Total should be sum of kept dice
      expect(result.total).toBe(result.kept[0] + result.kept[1]);
    });

    it('should have a lower average than normal 2d6', () => {
      const baneRolls = Array.from({ length: 1000 }, () => rollWithBane().total);
      const normalRolls = Array.from({ length: 1000 }, () => roll2d6());

      const baneAvg = baneRolls.reduce((sum, val) => sum + val, 0) / baneRolls.length;
      const normalAvg = normalRolls.reduce((sum, val) => sum + val, 0) / normalRolls.length;

      expect(baneAvg).toBeLessThan(normalAvg);
    });
  });

  describe('rollNormal', () => {
    it('should roll 2 dice normally', () => {
      const result = rollNormal();

      expect(result.rolls).toHaveLength(2);
      expect(result.kept).toHaveLength(2);
      expect(result.dropped).toBe(0);
      expect(result.type).toBe('normal');
      expect(result.total).toBe(result.rolls[0] + result.rolls[1]);
    });
  });
});

describe('Characteristic DM Calculation', () => {
  it('should return correct DM for very low values (0-2)', () => {
    expect(getCharacteristicDM(0)).toBe(-2);
    expect(getCharacteristicDM(1)).toBe(-2);
    expect(getCharacteristicDM(2)).toBe(-2);
  });

  it('should return correct DM for low values (3-5)', () => {
    expect(getCharacteristicDM(3)).toBe(-1);
    expect(getCharacteristicDM(4)).toBe(-1);
    expect(getCharacteristicDM(5)).toBe(-1);
  });

  it('should return correct DM for average values (6-8)', () => {
    expect(getCharacteristicDM(6)).toBe(0);
    expect(getCharacteristicDM(7)).toBe(0);
    expect(getCharacteristicDM(8)).toBe(0);
  });

  it('should return correct DM for above average values (9-11)', () => {
    expect(getCharacteristicDM(9)).toBe(1);
    expect(getCharacteristicDM(10)).toBe(1);
    expect(getCharacteristicDM(11)).toBe(1);
  });

  it('should return correct DM for high values (12-14)', () => {
    expect(getCharacteristicDM(12)).toBe(2);
    expect(getCharacteristicDM(13)).toBe(2);
    expect(getCharacteristicDM(14)).toBe(2);
  });

  it('should return correct DM for exceptional values (15+)', () => {
    expect(getCharacteristicDM(15)).toBe(3);
    expect(getCharacteristicDM(18)).toBe(3);
    expect(getCharacteristicDM(20)).toBe(3);
  });
});

describe('Skill DM Calculation', () => {
  describe('Proficient skills', () => {
    it('should return the skill level directly', () => {
      expect(getSkillDM(true, 0)).toBe(0);
      expect(getSkillDM(true, 1)).toBe(1);
      expect(getSkillDM(true, 2)).toBe(2);
      expect(getSkillDM(true, 3)).toBe(3);
      expect(getSkillDM(true, 6)).toBe(6);
    });

    it('should not return negative values for proficient skills', () => {
      expect(getSkillDM(true, -1)).toBe(0);
      expect(getSkillDM(true, -5)).toBe(0);
    });
  });

  describe('Unproficient skills', () => {
    it('should return -3 penalty without Jack-of-All-Trades', () => {
      expect(getSkillDM(false, 0)).toBe(-3);
      expect(getSkillDM(false, 0, 0)).toBe(-3);
    });

    it('should reduce penalty with Jack-of-All-Trades level 1', () => {
      // Jack-1 reduces penalty by 2 (min -1)
      expect(getSkillDM(false, 0, 1)).toBe(-1);
    });

    it('should reduce penalty with Jack-of-All-Trades level 2+', () => {
      // Jack-2+ reduces penalty by 2 (min -1)
      expect(getSkillDM(false, 0, 2)).toBe(-1);
      expect(getSkillDM(false, 0, 3)).toBe(-1);
    });
  });
});

describe('Skill Check', () => {
  it('should calculate total correctly', () => {
    const result = performSkillCheck(8, 2, 1, 7);

    expect(result.dice).toBe(7);
    expect(result.skillDM).toBe(2);
    expect(result.charDM).toBe(1);
    expect(result.total).toBe(10); // 7 + 2 + 1
    expect(result.difficulty).toBe(8);
    expect(result.success).toBe(true); // 10 >= 8
  });

  it('should succeed when total meets or exceeds difficulty', () => {
    expect(performSkillCheck(8, 1, 1, 6).success).toBe(false); // 6+1+1=8 meets
    expect(performSkillCheck(8, 1, 1, 7).success).toBe(true); // 7+1+1=9 exceeds
    expect(performSkillCheck(10, 2, 1, 7).success).toBe(true); // 7+2+1=10 meets exactly
  });

  it('should fail when total is below difficulty', () => {
    expect(performSkillCheck(10, 1, 1, 5).success).toBe(false); // 5+1+1=7 < 10
    expect(performSkillCheck(12, 0, 0, 8).success).toBe(false); // 8+0+0=8 < 12
  });

  it('should use random dice roll when not specified', () => {
    const result = performSkillCheck(8, 1, 1);

    expect(result.dice).toBeGreaterThanOrEqual(2);
    expect(result.dice).toBeLessThanOrEqual(12);
    expect(result.total).toBe(result.dice + 1 + 1);
  });
});

describe('Damage Rolling', () => {
  describe('Standard dice expressions', () => {
    it('should roll 1d6 correctly', () => {
      const result = rollDamageExpression('1d6');

      expect(result.expression).toBe('1d6');
      expect(result.diceResults).toHaveLength(1);
      expect(result.diceResults[0]).toBeGreaterThanOrEqual(1);
      expect(result.diceResults[0]).toBeLessThanOrEqual(6);
      expect(result.modifier).toBe(0);
      expect(result.charMod).toBe(0);
      expect(result.total).toBe(result.diceResults[0]);
    });

    it('should roll 2d6 correctly', () => {
      const result = rollDamageExpression('2d6');

      expect(result.diceResults).toHaveLength(2);
      expect(result.total).toBe(result.diceResults[0] + result.diceResults[1]);
    });

    it('should roll d6 (implicit 1) correctly', () => {
      const result = rollDamageExpression('d6');

      expect(result.diceResults).toHaveLength(1);
    });
  });

  describe('Expressions with modifiers', () => {
    it('should handle positive modifiers', () => {
      const result = rollDamageExpression('2d6+3');

      expect(result.modifier).toBe(3);
      const diceTotal = result.diceResults.reduce((sum, val) => sum + val, 0);
      expect(result.total).toBe(diceTotal + 3);
    });

    it('should handle negative modifiers', () => {
      const result = rollDamageExpression('2d6-2');

      expect(result.modifier).toBe(-2);
      const diceTotal = result.diceResults.reduce((sum, val) => sum + val, 0);
      expect(result.total).toBe(diceTotal - 2);
    });
  });

  describe('Characteristic modifiers', () => {
    it('should add characteristic modifier to total', () => {
      const result = rollDamageExpression('2d6+2', 1);

      expect(result.charMod).toBe(1);
      const diceTotal = result.diceResults.reduce((sum, val) => sum + val, 0);
      expect(result.total).toBe(diceTotal + 2 + 1);
    });

    it('should handle negative characteristic modifier', () => {
      const result = rollDamageExpression('2d6', -1);

      expect(result.charMod).toBe(-1);
      const diceTotal = result.diceResults.reduce((sum, val) => sum + val, 0);
      expect(result.total).toBe(diceTotal - 1);
    });
  });

  describe('Flat damage values', () => {
    it('should handle flat number damage', () => {
      const result = rollDamageExpression('5');

      expect(result.diceResults).toHaveLength(0);
      expect(result.modifier).toBe(5);
      expect(result.total).toBe(5);
    });

    it('should handle flat damage with char mod', () => {
      const result = rollDamageExpression('3', 2);

      expect(result.total).toBe(5); // 3 + 2
    });
  });

  describe('Edge cases', () => {
    it('should handle different die types', () => {
      const d4 = rollDamageExpression('1d4');
      expect(d4.diceResults[0]).toBeGreaterThanOrEqual(1);
      expect(d4.diceResults[0]).toBeLessThanOrEqual(4);

      const d8 = rollDamageExpression('1d8');
      expect(d8.diceResults[0]).toBeGreaterThanOrEqual(1);
      expect(d8.diceResults[0]).toBeLessThanOrEqual(8);

      const d10 = rollDamageExpression('1d10');
      expect(d10.diceResults[0]).toBeGreaterThanOrEqual(1);
      expect(d10.diceResults[0]).toBeLessThanOrEqual(10);
    });

    it('should handle whitespace in expression', () => {
      const result = rollDamageExpression('  2d6 + 3  ', 1);

      expect(result.diceResults).toHaveLength(2);
      expect(result.modifier).toBe(3);
      expect(result.charMod).toBe(1);
    });

    it('should handle invalid expressions as flat 0', () => {
      const result = rollDamageExpression('invalid');

      expect(result.diceResults).toHaveLength(0);
      expect(result.modifier).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});
