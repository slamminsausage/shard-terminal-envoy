// ============================================================================
// ALIEN RACES - Character race definitions for Traveller 2E
// ============================================================================
// Races have characteristic modifiers applied after rolling.
// Modifiers cannot take a characteristic below 1.

import type { CharacteristicName } from './careers/types';

export interface RaceTrait {
  name: string;
  description: string;
  // Mechanical effects (for future implementation)
  skillDM?: { skill: string; modifier: number }[];
  weapon?: { name: string; skill: string; damage: string };
  special?: string;
}

export interface CharacteristicModifier {
  stat: CharacteristicName;
  modifier: number;
}

export interface Race {
  id: string;
  name: string;
  description: string;
  characteristicModifiers: CharacteristicModifier[];
  traits: RaceTrait[];
}

export const RACES: Race[] = [
  {
    id: 'human',
    name: 'Human',
    description: 'Humans are the most widespread species in the Third Imperium, adaptable and diverse.',
    characteristicModifiers: [],
    traits: [],
  },
  {
    id: 'aslan',
    name: 'Aslan',
    description: 'The Aslan are the youngest of the great powers, an expansionist species of feuding clans and predatory warriors. They are descended from four-limbed carnivorous pouncer stock and are often compared to lions, though they bear only a passing resemblance.',
    characteristicModifiers: [
      { stat: 'strength', modifier: 2 },
      { stat: 'dexterity', modifier: -2 },
    ],
    traits: [
      {
        name: 'Dewclaw',
        description: 'All Aslan have a dewclaw, which can be extended to make for a vicious close combat weapon.',
        weapon: { name: 'Dewclaw', skill: 'Melee (natural)', damage: '1D+2' },
      },
      {
        name: 'Heightened Senses',
        description: 'Aslan have better night vision, hearing and sense of smell than humans.',
        skillDM: [
          { skill: 'Recon', modifier: 1 },
          { skill: 'Survival', modifier: 1 },
        ],
      },
    ],
  },
  {
    id: 'vargr',
    name: 'Vargr',
    description: 'The Vargr are the only Major Race to have been uplifted by the Ancients. They are descended from carnivore/chaser stock genetically engineered from the genus Canis. Vargr have a diverse culture deeply rooted in their pack mentality and the desire for companionship, charisma, and loyalty.',
    characteristicModifiers: [
      { stat: 'strength', modifier: -2 },
      { stat: 'dexterity', modifier: 1 },
      { stat: 'endurance', modifier: -1 },
    ],
    traits: [
      {
        name: 'Bite',
        description: 'All Vargr possess pronounced canines, which make for a nasty close combat weapon.',
        weapon: { name: 'Bite', skill: 'Melee (natural)', damage: '1D+1' },
      },
      {
        name: 'Heightened Senses',
        description: 'Vargr have better hearing and sense of smell than humans, but worse eyesight in darkness.',
        skillDM: [
          { skill: 'Recon', modifier: 1 },
          { skill: 'Survival', modifier: 1 },
        ],
        special: 'DM-1 to skill checks requiring sight in dark conditions.',
      },
    ],
  },
  {
    id: 'bwap',
    name: 'Bwap',
    description: 'Bwaps can be found throughout the Imperium, also known as Wabs or Newts. They are uncomfortable in less than 98% humidity and are driven by the desire to put everything in its proper place, making them excellent bureaucrats, mathematicians, scientists, and historians.',
    characteristicModifiers: [
      { stat: 'strength', modifier: -4 },
      { stat: 'endurance', modifier: -4 },
    ],
    traits: [
      {
        name: 'Structured Mind',
        description: 'Bwaps have a very logical way of thinking and make for excellent administrators.',
        skillDM: [
          { skill: 'Admin', modifier: 2 }, // Boon = +2 effective
          { skill: 'Science', modifier: 2 },
        ],
        special: 'Receive a permanent Boon on all Admin and Science checks. However, if testing for psionic potential, do so with a Bane.',
      },
    ],
  },
];

// Helper to get a race by ID
export function getRaceById(id: string): Race | undefined {
  return RACES.find(r => r.id === id);
}

// Helper to get a race by name
export function getRaceByName(name: string): Race | undefined {
  return RACES.find(r => r.name.toLowerCase() === name.toLowerCase());
}

// Apply race modifiers to characteristics
// Modifiers cannot take a characteristic below 1
export function applyRaceModifiers(
  characteristics: Record<CharacteristicName, { total: number; current: number }>,
  race: Race
): Record<CharacteristicName, { total: number; current: number }> {
  const result = { ...characteristics };

  for (const modifier of race.characteristicModifiers) {
    const currentValue = result[modifier.stat].total;
    // Apply modifier but don't go below 1
    const newValue = Math.max(1, currentValue + modifier.modifier);
    result[modifier.stat] = {
      total: newValue,
      current: newValue,
    };
  }

  return result;
}
