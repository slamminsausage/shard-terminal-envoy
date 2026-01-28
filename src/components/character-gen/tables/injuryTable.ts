// ============================================================================
// INJURY TABLE (1D6)
// ============================================================================
// Used when events specify injury or mishaps that cause physical harm

import type { GameEvent, CharacteristicName } from '../careers/types';

// Physical characteristics that can be affected by injuries
export const PHYSICAL_CHARACTERISTICS: CharacteristicName[] = ['strength', 'dexterity', 'endurance'];

export const INJURY_TABLE: GameEvent[] = [
  // Result 1
  {
    id: 'injury-1',
    description: 'Nearly killed – reduce one physical characteristic by 1D, reduce two other physical characteristics by 2.',
    resolution: {
      type: 'choice',
      displayText: 'Choose which physical characteristic takes the major damage (1D6 reduction):',
      options: [
        {
          id: 'str-major',
          label: 'Strength (major)',
          description: 'STR reduced by 1D6, DEX and END reduced by 2 each',
          effects: {
            characteristics: [
              // Only the two minor stats - STR reduction comes from sub-roll
              { stat: 'dexterity', modifier: -2 },
              { stat: 'endurance', modifier: -2 },
            ],
            message: 'You were nearly killed. Your body bears the scars.',
          },
          subRoll: {
            dice: 1,
            outcomes: [
              { min: 1, max: 1, label: 'STR -1', effects: { characteristics: [{ stat: 'strength', modifier: -1 }] } },
              { min: 2, max: 2, label: 'STR -2', effects: { characteristics: [{ stat: 'strength', modifier: -2 }] } },
              { min: 3, max: 3, label: 'STR -3', effects: { characteristics: [{ stat: 'strength', modifier: -3 }] } },
              { min: 4, max: 4, label: 'STR -4', effects: { characteristics: [{ stat: 'strength', modifier: -4 }] } },
              { min: 5, max: 5, label: 'STR -5', effects: { characteristics: [{ stat: 'strength', modifier: -5 }] } },
              { min: 6, max: 6, label: 'STR -6', effects: { characteristics: [{ stat: 'strength', modifier: -6 }] } },
            ],
          },
        },
        {
          id: 'dex-major',
          label: 'Dexterity (major)',
          description: 'DEX reduced by 1D6, STR and END reduced by 2 each',
          effects: {
            characteristics: [
              // Only the two minor stats - DEX reduction comes from sub-roll
              { stat: 'strength', modifier: -2 },
              { stat: 'endurance', modifier: -2 },
            ],
            message: 'You were nearly killed. Your body bears the scars.',
          },
          subRoll: {
            dice: 1,
            outcomes: [
              { min: 1, max: 1, label: 'DEX -1', effects: { characteristics: [{ stat: 'dexterity', modifier: -1 }] } },
              { min: 2, max: 2, label: 'DEX -2', effects: { characteristics: [{ stat: 'dexterity', modifier: -2 }] } },
              { min: 3, max: 3, label: 'DEX -3', effects: { characteristics: [{ stat: 'dexterity', modifier: -3 }] } },
              { min: 4, max: 4, label: 'DEX -4', effects: { characteristics: [{ stat: 'dexterity', modifier: -4 }] } },
              { min: 5, max: 5, label: 'DEX -5', effects: { characteristics: [{ stat: 'dexterity', modifier: -5 }] } },
              { min: 6, max: 6, label: 'DEX -6', effects: { characteristics: [{ stat: 'dexterity', modifier: -6 }] } },
            ],
          },
        },
        {
          id: 'end-major',
          label: 'Endurance (major)',
          description: 'END reduced by 1D6, STR and DEX reduced by 2 each',
          effects: {
            characteristics: [
              // Only the two minor stats - END reduction comes from sub-roll
              { stat: 'strength', modifier: -2 },
              { stat: 'dexterity', modifier: -2 },
            ],
            message: 'You were nearly killed. Your body bears the scars.',
          },
          subRoll: {
            dice: 1,
            outcomes: [
              { min: 1, max: 1, label: 'END -1', effects: { characteristics: [{ stat: 'endurance', modifier: -1 }] } },
              { min: 2, max: 2, label: 'END -2', effects: { characteristics: [{ stat: 'endurance', modifier: -2 }] } },
              { min: 3, max: 3, label: 'END -3', effects: { characteristics: [{ stat: 'endurance', modifier: -3 }] } },
              { min: 4, max: 4, label: 'END -4', effects: { characteristics: [{ stat: 'endurance', modifier: -4 }] } },
              { min: 5, max: 5, label: 'END -5', effects: { characteristics: [{ stat: 'endurance', modifier: -5 }] } },
              { min: 6, max: 6, label: 'END -6', effects: { characteristics: [{ stat: 'endurance', modifier: -6 }] } },
            ],
          },
        },
      ],
    },
  },

  // Result 2
  {
    id: 'injury-2',
    description: 'Severely injured – reduce one physical characteristic by 1D.',
    resolution: {
      type: 'choice',
      displayText: 'Choose which physical characteristic is affected:',
      options: [
        {
          id: 'str',
          label: 'Strength',
          description: 'STR reduced by 1D6',
          effects: {
            message: 'You are severely injured.',
          },
          subRoll: {
            dice: 1,
            outcomes: [
              { min: 1, max: 1, label: 'STR -1', effects: { characteristics: [{ stat: 'strength', modifier: -1 }] } },
              { min: 2, max: 2, label: 'STR -2', effects: { characteristics: [{ stat: 'strength', modifier: -2 }] } },
              { min: 3, max: 3, label: 'STR -3', effects: { characteristics: [{ stat: 'strength', modifier: -3 }] } },
              { min: 4, max: 4, label: 'STR -4', effects: { characteristics: [{ stat: 'strength', modifier: -4 }] } },
              { min: 5, max: 5, label: 'STR -5', effects: { characteristics: [{ stat: 'strength', modifier: -5 }] } },
              { min: 6, max: 6, label: 'STR -6', effects: { characteristics: [{ stat: 'strength', modifier: -6 }] } },
            ],
          },
        },
        {
          id: 'dex',
          label: 'Dexterity',
          description: 'DEX reduced by 1D6',
          effects: {
            message: 'You are severely injured.',
          },
          subRoll: {
            dice: 1,
            outcomes: [
              { min: 1, max: 1, label: 'DEX -1', effects: { characteristics: [{ stat: 'dexterity', modifier: -1 }] } },
              { min: 2, max: 2, label: 'DEX -2', effects: { characteristics: [{ stat: 'dexterity', modifier: -2 }] } },
              { min: 3, max: 3, label: 'DEX -3', effects: { characteristics: [{ stat: 'dexterity', modifier: -3 }] } },
              { min: 4, max: 4, label: 'DEX -4', effects: { characteristics: [{ stat: 'dexterity', modifier: -4 }] } },
              { min: 5, max: 5, label: 'DEX -5', effects: { characteristics: [{ stat: 'dexterity', modifier: -5 }] } },
              { min: 6, max: 6, label: 'DEX -6', effects: { characteristics: [{ stat: 'dexterity', modifier: -6 }] } },
            ],
          },
        },
        {
          id: 'end',
          label: 'Endurance',
          description: 'END reduced by 1D6',
          effects: {
            message: 'You are severely injured.',
          },
          subRoll: {
            dice: 1,
            outcomes: [
              { min: 1, max: 1, label: 'END -1', effects: { characteristics: [{ stat: 'endurance', modifier: -1 }] } },
              { min: 2, max: 2, label: 'END -2', effects: { characteristics: [{ stat: 'endurance', modifier: -2 }] } },
              { min: 3, max: 3, label: 'END -3', effects: { characteristics: [{ stat: 'endurance', modifier: -3 }] } },
              { min: 4, max: 4, label: 'END -4', effects: { characteristics: [{ stat: 'endurance', modifier: -4 }] } },
              { min: 5, max: 5, label: 'END -5', effects: { characteristics: [{ stat: 'endurance', modifier: -5 }] } },
              { min: 6, max: 6, label: 'END -6', effects: { characteristics: [{ stat: 'endurance', modifier: -6 }] } },
            ],
          },
        },
      ],
    },
  },

  // Result 3
  {
    id: 'injury-3',
    description: 'Missing Eye or Limb – reduce STR or DEX by 2.',
    resolution: {
      type: 'choice',
      displayText: 'You have lost an eye or limb. Which characteristic is affected?',
      options: [
        {
          id: 'str',
          label: 'Missing Limb (STR -2)',
          description: 'A lost arm or leg reduces your strength',
          effects: {
            characteristics: [{ stat: 'strength', modifier: -2 }],
            message: 'You have lost a limb. STR reduced by 2.',
          },
        },
        {
          id: 'dex',
          label: 'Missing Eye or Limb (DEX -2)',
          description: 'A lost eye or limb affects your coordination',
          effects: {
            characteristics: [{ stat: 'dexterity', modifier: -2 }],
            message: 'You have lost an eye or limb. DEX reduced by 2.',
          },
        },
      ],
    },
  },

  // Result 4
  {
    id: 'injury-4',
    description: 'Scarred – you are scarred and injured. Reduce any physical characteristic by 2.',
    resolution: {
      type: 'choice',
      displayText: 'You are scarred. Which characteristic is affected?',
      options: [
        {
          id: 'str',
          label: 'Strength -2',
          description: 'Muscle damage from your injuries',
          effects: {
            characteristics: [{ stat: 'strength', modifier: -2 }],
            message: 'You bear permanent scars. STR reduced by 2.',
          },
        },
        {
          id: 'dex',
          label: 'Dexterity -2',
          description: 'Nerve damage affects your coordination',
          effects: {
            characteristics: [{ stat: 'dexterity', modifier: -2 }],
            message: 'You bear permanent scars. DEX reduced by 2.',
          },
        },
        {
          id: 'end',
          label: 'Endurance -2',
          description: 'Internal injuries affect your stamina',
          effects: {
            characteristics: [{ stat: 'endurance', modifier: -2 }],
            message: 'You bear permanent scars. END reduced by 2.',
          },
        },
      ],
    },
  },

  // Result 5
  {
    id: 'injury-5',
    description: 'Injured – reduce any physical characteristic by 1.',
    resolution: {
      type: 'choice',
      displayText: 'You are injured. Which characteristic is affected?',
      options: [
        {
          id: 'str',
          label: 'Strength -1',
          effects: {
            characteristics: [{ stat: 'strength', modifier: -1 }],
            message: 'You have been injured. STR reduced by 1.',
          },
        },
        {
          id: 'dex',
          label: 'Dexterity -1',
          effects: {
            characteristics: [{ stat: 'dexterity', modifier: -1 }],
            message: 'You have been injured. DEX reduced by 1.',
          },
        },
        {
          id: 'end',
          label: 'Endurance -1',
          effects: {
            characteristics: [{ stat: 'endurance', modifier: -1 }],
            message: 'You have been injured. END reduced by 1.',
          },
        },
      ],
    },
  },

  // Result 6
  {
    id: 'injury-6',
    description: 'Lightly Injured – no permanent effect.',
    resolution: {
      type: 'automatic',
      effects: {
        message: 'You were lightly injured but have fully recovered. No permanent effect.',
      },
    },
  },
];

// Helper to get injury by 1D6 roll result
export function getInjury(roll: number): GameEvent {
  const index = Math.max(0, Math.min(roll - 1, INJURY_TABLE.length - 1));
  return INJURY_TABLE[index];
}
