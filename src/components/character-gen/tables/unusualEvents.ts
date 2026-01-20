// ============================================================================
// UNUSUAL EVENTS TABLE (1D6)
// ============================================================================
// Sub-table for Life Event 12 "Unusual Event"

import type { GameEvent } from '../careers/types';

export const UNUSUAL_EVENTS: GameEvent[] = [
  // Result 1
  {
    id: 'unusual-1',
    description: 'Psionics: You encounter a Psionic institute. You may immediately test your Psionic Strength and, if you qualify, take the Psion career in your next term.',
    resolution: {
      type: 'automatic',
      effects: {
        canTestPsi: true,
        allowCareer: 'Psion',
        message: 'You have encountered a Psionic institute. You may test your PSI and attempt the Psion career.',
      },
    },
  },

  // Result 2
  {
    id: 'unusual-2',
    description: 'Aliens: You spend time among an alien species. Gain Science 1 and a Contact among an alien species.',
    resolution: {
      type: 'automatic',
      effects: {
        skills: {
          choices: ['Science'],
          level: 1,
        },
        contacts: 1,
        message: 'Your time among aliens has been educational. Gain Science 1 and an alien Contact.',
      },
    },
  },

  // Result 3
  {
    id: 'unusual-3',
    description: 'Alien Artefact: You have a strange and unusual device from an alien culture that is not normally available to humans.',
    resolution: {
      type: 'automatic',
      effects: {
        message: 'You possess a mysterious alien artefact. Note this in your equipment.',
      },
    },
  },

  // Result 4
  {
    id: 'unusual-4',
    description: 'Amnesia: Something happened to you but you do not know what it was.',
    resolution: {
      type: 'automatic',
      effects: {
        message: 'You have a gap in your memory. Something significant happened, but you cannot remember what.',
      },
    },
  },

  // Result 5
  {
    id: 'unusual-5',
    description: 'Contact with Government: You briefly came into contact with the highest echelons of the Imperium – an Archduke or the Emperor, perhaps, or Imperial intelligence.',
    resolution: {
      type: 'automatic',
      effects: {
        contacts: 1,
        message: 'You have brushed with the highest levels of Imperial power. Gain a Contact in high places.',
      },
    },
  },

  // Result 6
  {
    id: 'unusual-6',
    description: 'Ancient Technology: You have something older than the Imperium or even something older than humanity.',
    resolution: {
      type: 'automatic',
      effects: {
        message: 'You possess an ancient technological artifact of immense age and unknown origin. Note this in your equipment.',
      },
    },
  },
];

// Helper to get unusual event by 1D6 roll result
export function getUnusualEvent(roll: number): GameEvent {
  const index = Math.max(0, Math.min(roll - 1, UNUSUAL_EVENTS.length - 1));
  return UNUSUAL_EVENTS[index];
}
