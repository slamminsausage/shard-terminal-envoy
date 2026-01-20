// ============================================================================
// LIFE EVENTS TABLE (2D6)
// ============================================================================
// Used when career events specify "Roll on Life Events table"

import type { GameEvent } from '../careers/types';

export const LIFE_EVENTS: GameEvent[] = [
  // Result 2
  {
    id: 'life-event-2',
    description: 'Sickness or Injury: You are injured or become sick. Roll on the Injury table.',
    resolution: {
      type: 'table_redirect',
      table: 'injury',
      displayText: 'Roll on the Injury table to determine your fate.',
    },
  },

  // Result 3
  {
    id: 'life-event-3',
    description: 'Birth or Death: Someone close to you dies, like a friend or family member. Alternatively, someone close to you gives birth (or is born!). You are involved in some fashion (father or mother, relative, godparent and so forth).',
    resolution: {
      type: 'choice',
      displayText: 'What happened?',
      options: [
        {
          id: 'death',
          label: 'Death of someone close',
          description: 'A friend or family member has passed away',
          effects: {
            message: 'You mourn the loss of someone close to you.',
          },
        },
        {
          id: 'birth',
          label: 'Birth in your life',
          description: 'Someone close to you gives birth, or you become a parent/godparent',
          effects: {
            message: 'A new life has entered your world.',
          },
        },
      ],
    },
  },

  // Result 4
  {
    id: 'life-event-4',
    description: 'Ending of Relationship: A romantic relationship involving you ends. Badly.',
    resolution: {
      type: 'choice',
      displayText: 'How badly did it end?',
      options: [
        {
          id: 'rival',
          label: 'Gain a Rival',
          description: 'The relationship ended with hard feelings',
          effects: {
            rivals: 1,
            message: 'Your ex has become a Rival.',
          },
        },
        {
          id: 'enemy',
          label: 'Gain an Enemy',
          description: 'The breakup was catastrophic',
          effects: {
            enemies: 1,
            message: 'Your ex has become an Enemy.',
          },
        },
      ],
    },
  },

  // Result 5
  {
    id: 'life-event-5',
    description: 'Improved Relationship: A romantic relationship involving you deepens, possibly leading to marriage or some other emotional commitment.',
    resolution: {
      type: 'automatic',
      effects: {
        allies: 1,
        message: 'Your relationship has deepened. Gain an Ally.',
      },
    },
  },

  // Result 6
  {
    id: 'life-event-6',
    description: 'New Relationship: You become involved in a romantic relationship.',
    resolution: {
      type: 'automatic',
      effects: {
        allies: 1,
        message: 'You have found love. Gain an Ally.',
      },
    },
  },

  // Result 7
  {
    id: 'life-event-7',
    description: 'New Contact: You gain a new Contact.',
    resolution: {
      type: 'automatic',
      effects: {
        contacts: 1,
        message: 'You have made a useful acquaintance. Gain a Contact.',
      },
    },
  },

  // Result 8
  {
    id: 'life-event-8',
    description: 'Betrayal: You are betrayed in some fashion by a friend. If you have any Contacts or Allies, convert one into a Rival or Enemy. Otherwise, gain a Rival or an Enemy.',
    resolution: {
      type: 'choice',
      displayText: 'How do you respond to the betrayal?',
      options: [
        {
          id: 'rival',
          label: 'They become a Rival',
          description: 'The betrayal creates rivalry but not outright hatred',
          effects: {
            rivals: 1,
            message: 'The betrayer has become your Rival.',
          },
        },
        {
          id: 'enemy',
          label: 'They become an Enemy',
          description: 'You will never forgive this betrayal',
          effects: {
            enemies: 1,
            message: 'The betrayer has become your Enemy.',
          },
        },
      ],
    },
  },

  // Result 9
  {
    id: 'life-event-9',
    description: 'Travel: You move to another world. You gain DM+2 to your next qualification roll.',
    resolution: {
      type: 'automatic',
      effects: {
        message: 'You have relocated to a new world. Gain DM+2 to your next qualification roll.',
        // Note: qualificationDM would need to be tracked in character state
      },
    },
  },

  // Result 10
  {
    id: 'life-event-10',
    description: 'Good Fortune: Something good happens to you; you come into money unexpectedly, have a lifelong dream come true, get a book published or have some other stroke of good fortune.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 2,
        message: 'Good fortune smiles upon you! Gain DM+2 to any one Benefit roll.',
      },
    },
  },

  // Result 11
  {
    id: 'life-event-11',
    description: 'Crime: You commit or are the victim (or are accused) of a crime.',
    resolution: {
      type: 'choice',
      displayText: 'How do you deal with the situation?',
      options: [
        {
          id: 'lose-benefit',
          label: 'Lose one Benefit roll',
          description: 'Pay legal fees, restitution, or suffer from the crime',
          effects: {
            benefitDM: -99, // Marker for "lose one benefit roll"
            message: 'The crime has cost you. Lose one Benefit roll.',
          },
        },
        {
          id: 'prisoner',
          label: 'Take the Prisoner career',
          description: 'You end up incarcerated',
          effects: {
            forceCareer: 'Prisoner',
            message: 'You are sent to prison. You must take the Prisoner career in your next term.',
          },
        },
      ],
    },
  },

  // Result 12
  {
    id: 'life-event-12',
    description: 'Unusual Event: Something weird happens.',
    resolution: {
      type: 'table_redirect',
      table: 'unusual_events',
      displayText: 'Roll 1D6 on the Unusual Events table.',
    },
  },
];

// Helper to get life event by 2D6 roll result
export function getLifeEvent(roll: number): GameEvent {
  const index = Math.max(0, Math.min(roll - 2, LIFE_EVENTS.length - 1));
  return LIFE_EVENTS[index];
}
