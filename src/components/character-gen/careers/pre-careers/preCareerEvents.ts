// ============================================================================
// PRE-CAREER EVENTS TABLE (2D6) - Using New GameEvent Format
// ============================================================================

import type { GameEvent } from '../types';

export const PRE_CAREER_EVENTS: GameEvent[] = [
  // Result 2
  {
    id: 'precareer-2',
    description: 'You are approached by an underground (and highly illegal) psionic group who sense potential in you. You may test your PSI and attempt to enter the Psion career in any subsequent term.',
    resolution: {
      type: 'automatic',
      effects: {
        canTestPsi: true,
        allowCareer: 'Psion',
        enemies: 1,
        message: 'Whether you accept or refuse their approaches, you gain them as an Enemy.',
      },
    },
  },

  // Result 3
  {
    id: 'precareer-3',
    description: 'Your time in education is not a happy one and you suffer a deep tragedy; perhaps you become hopelessly addicted to drink or drugs, a failed romance leaves you in tatters or a fatal accident involving a close friend shakes your confidence. You crash and fail to graduate.',
    resolution: {
      type: 'automatic',
      effects: {
        failGraduation: true,
        message: 'You fail to graduate and gain no benefits from this Pre-Career.',
      },
    },
  },

  // Result 4
  {
    id: 'precareer-4',
    description: 'A supposedly harmless prank goes wrong and someone gets hurt, physically or emotionally.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'social',
      target: 8,
      displayText: 'Roll SOC 8+ to limit the damage.',
      outcomes: [
        {
          condition: { type: 'natural', value: 2 },
          effects: {
            failGraduation: true,
            forceCareer: 'Prisoner',
            message: 'Disaster! You fail to graduate and must take the Prisoner career in your next term.',
          },
        },
        {
          condition: { type: 'success' },
          effects: {
            rivals: 1,
            message: 'You manage to smooth things over, but gain a Rival.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            enemies: 1,
            message: 'Things go badly. You gain an Enemy.',
          },
        },
      ],
    },
  },

  // Result 5
  {
    id: 'precareer-5',
    description: 'Taking advantage of youth, you party as much as you study.',
    resolution: {
      type: 'automatic',
      effects: {
        skills: {
          choices: ['Carouse'],
          level: 1,
        },
        message: 'Gain Carouse 1.',
      },
    },
  },

  // Result 6
  {
    id: 'precareer-6',
    description: 'You become involved in a tightly knit clique or group and make a pact to remain friends forever, wherever in the galaxy you may end.',
    resolution: {
      type: 'automatic',
      effects: {
        allies: 'D3',
        message: 'Gain D3 Allies.',
      },
    },
  },

  // Result 7
  {
    id: 'precareer-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Roll on the Life Events table.',
    },
  },

  // Result 8
  {
    id: 'precareer-8',
    description: 'You join a political movement.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'social',
      target: 8,
      displayText: 'Roll SOC 8+ to become a leading figure.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            allies: 1,
            enemies: 1,
            message: 'You become a leading figure. Gain one Ally within the movement but gain one Enemy in wider society.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            message: 'You remain a minor figure in the movement.',
          },
        },
      ],
    },
  },

  // Result 9
  {
    id: 'precareer-9',
    description: 'You develop a healthy interest in a hobby or other area of study.',
    resolution: {
      type: 'automatic',
      effects: {
        skills: {
          anySkill: true,
          exclude: ['Jack-of-all-Trades'],
          level: 0,
        },
        message: 'Gain any skill of your choice (except Jack-of-all-Trades) at level 0.',
      },
    },
  },

  // Result 10
  {
    id: 'precareer-10',
    description: 'A newly arrived tutor rubs you up the wrong way and you work hard to overturn their conclusions.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 1,
        category: 'any',
      },
      target: 9,
      displayText: 'Roll 9+ on any skill you have learned during this term (level 1+).',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            // The skill they rolled on increases by 1 - this needs special handling
            // as we need to track which skill was used
            rivals: 1,
            message: 'You provide a truly elegant proof that becomes the standard approach. Gain a level in the skill you rolled on and the tutor as a Rival.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            message: 'Your efforts to disprove the tutor come to nothing.',
          },
        },
      ],
    },
  },

  // Result 11
  {
    id: 'precareer-11',
    description: 'War comes and a wide-ranging draft is instigated.',
    avoidance: {
      stat: 'social',
      target: 9,
      displayText: 'If your SOC is 9+, you can get enough strings pulled to avoid the draft.',
      skipsEvent: true,
      avoidEffects: {
        message: 'Your connections allow you to avoid the draft entirely. You may attempt graduation normally.',
      },
    },
    resolution: {
      type: 'choice',
      displayText: 'You must choose how to respond to the draft.',
      options: [
        {
          id: 'flee',
          label: 'Flee to become a Drifter',
          description: 'Escape the draft but become an outcast',
          effects: {
            failGraduation: true,
            forceCareer: 'Drifter',
            enemies: 1,
            message: 'You flee the draft and become a Drifter, but gain an Enemy.',
          },
        },
        {
          id: 'drafted',
          label: 'Accept the Draft',
          description: 'Be drafted into military service',
          effects: {
            failGraduation: true,
            message: 'You are drafted into military service.',
          },
          subRoll: {
            dice: 1,
            outcomes: [
              { min: 1, max: 3, label: 'Army', effects: { forceCareer: 'Army' } },
              { min: 4, max: 5, label: 'Marines', effects: { forceCareer: 'Marines' } },
              { min: 6, max: 6, label: 'Navy', effects: { forceCareer: 'Navy' } },
            ],
          },
        },
      ],
    },
  },

  // Result 12
  {
    id: 'precareer-12',
    description: 'You gain wide-ranging recognition of your initiative and innovative approach to study.',
    resolution: {
      type: 'automatic',
      effects: {
        characteristics: [
          { stat: 'social', modifier: 1, max: 15 },
        ],
        message: 'Increase your SOC by +1.',
      },
    },
  },
];

// Helper to get event by 2D6 roll result
export function getPreCareerEvent(roll: number): GameEvent {
  const index = Math.max(0, Math.min(roll - 2, PRE_CAREER_EVENTS.length - 1));
  return PRE_CAREER_EVENTS[index];
}
