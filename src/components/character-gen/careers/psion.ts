// ============================================================================
// CAREER: PSION
// ============================================================================
// A career for Travellers who choose to focus on their psionic potential
// instead of more conventional lifestyles.
// Requires PSI testing before entry.

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Psion Benefits Table (1D, results 1-7)
const PSION_BENEFITS: BenefitTableRow[] = [
  // Roll 1
  { cash: 1000, benefit: { options: [{ type: 'item', itemType: 'gun' }] } },
  // Roll 2
  { cash: 2000, benefit: { options: [{ type: 'ship_shares', shares: 2 }] } },
  // Roll 3
  { cash: 4000, benefit: { options: [{ type: 'contact' }] } },
  // Roll 4
  { cash: 4000, benefit: { options: [{ type: 'tas_membership' }] } },
  // Roll 5
  { cash: 8000, benefit: { options: [{ type: 'contact' }] } },
  // Roll 6
  { cash: 8000, benefit: { options: [{ type: 'item', itemType: 'combat_implant' }] } },
  // Roll 7
  { cash: 16000, benefit: { options: [{ type: 'ship_shares', shares: 10 }] } },
];

// ============================================================================
// PSION MISHAPS (1D6)
// ============================================================================

const PSION_MISHAPS: GameEvent[] = [
  // Mishap 1 - Severely injured
  {
    id: 'psion-mishap-1',
    description: 'Severely injured (same as a result of 2 on the Injury table). Alternatively, roll twice on the Injury table and take the lower result.',
    resolution: {
      type: 'automatic',
      effects: {
        rollOnTable: 'injury',
        injurySeverity: 'severe',
        message: 'You are severely injured. Roll on the Injury table with severe penalties.',
      },
    },
  },
  // Mishap 2 - Telepathic contact with something dangerous
  {
    id: 'psion-mishap-2',
    description: 'You telepathically contact something dangerous. Lose one PSI. You also suffer from persistent and terrifying nightmares.',
    resolution: {
      type: 'automatic',
      effects: {
        characteristics: [{ stat: 'psionics', modifier: -1 }],
        message: 'You telepathically contact something dangerous. Lose 1 PSI. You suffer from persistent nightmares.',
      },
    },
  },
  // Mishap 3 - Anti-psi cult attack
  {
    id: 'psion-mishap-3',
    description: 'An anti-psi cult or gang attempts to expose or attack you. Roll 1D: 1-2 = injured, 3-4 = lose SOC, 5-6 = escape unharmed.',
    resolution: {
      type: 'sub_roll',
      displayText: 'Roll 1D to see what happens when the anti-psi cult attacks you.',
      subRoll: {
        dice: 1,
        outcomes: [
          {
            min: 1,
            max: 2,
            label: 'Injured',
            effects: {
              rollOnTable: 'injury',
              message: 'An anti-psi cult attacks you. You are injured in the attack.',
            },
          },
          {
            min: 3,
            max: 4,
            label: 'Lose SOC',
            effects: {
              characteristics: [{ stat: 'social', modifier: -1 }],
              message: 'An anti-psi cult attacks you. Your reputation is damaged. SOC -1.',
            },
          },
          {
            min: 5,
            max: 6,
            label: 'Escape unharmed',
            effects: {
              message: 'An anti-psi cult attacks you, but you escape unharmed.',
            },
          },
        ],
      },
    },
  },
  // Mishap 4 - Unethical use request
  {
    id: 'psion-mishap-4',
    description: 'You are asked to use your psionic powers in an unethical fashion.',
    resolution: {
      type: 'choice',
      displayText: 'You are asked to use your powers unethically. What do you do?',
      options: [
        {
          id: 'accept',
          label: 'Accept',
          description: 'Continue in career but gain an Enemy',
          effects: {
            enemies: 1,
            message: 'You accept and gain an Enemy, but may continue in this career.',
          },
        },
        {
          id: 'refuse',
          label: 'Refuse',
          description: 'Must leave the career',
          effects: {
            mustLeaveCareer: true,
            message: 'You refuse and must leave this career.',
          },
        },
      ],
    },
  },
  // Mishap 5 - Experimented on
  {
    id: 'psion-mishap-5',
    description: 'You are experimented on by a corporation, government or other organisation. You escape but are forced to leave this career.',
    resolution: {
      type: 'automatic',
      effects: {
        mustLeaveCareer: true,
        message: 'You are experimented on and must escape, leaving this career.',
      },
    },
  },
  // Mishap 6 - Betrayed
  {
    id: 'psion-mishap-6',
    description: 'Your gift causes a former friend to turn on you and betray you. One Ally or Contact becomes an Enemy.',
    resolution: {
      type: 'automatic',
      effects: {
        enemies: 1,
        message: 'A former friend betrays you due to your powers. One Ally or Contact becomes an Enemy.',
      },
    },
  },
];

// ============================================================================
// PSION EVENTS (2D6)
// ============================================================================

const PSION_EVENTS: GameEvent[] = [
  // Event 2 - Disaster
  {
    id: 'psion-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'mishap',
      displayText: 'Roll on the Mishap table (you remain in the career).',
    },
  },
  // Event 3 - Uncomfortable to be around
  {
    id: 'psion-event-3',
    description: 'Your psionic abilities make you uncomfortable to be around. One Contact or Ally becomes a Rival.',
    resolution: {
      type: 'automatic',
      effects: {
        rivals: 1,
        message: 'Your psionic powers make others uncomfortable. One Contact or Ally becomes a Rival.',
      },
    },
  },
  // Event 4 - Mind and body mastery
  {
    id: 'psion-event-4',
    description: 'Choose one skill, reflecting your time spent mastering mind and body.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill from mastering mind and body:',
      options: [
        {
          id: 'athletics',
          label: 'Athletics 1',
          effects: {
            skills: { choices: ['Athletics'], level: 1 },
            message: 'Physical discipline improves your athleticism.',
          },
        },
        {
          id: 'stealth',
          label: 'Stealth 1',
          effects: {
            skills: { choices: ['Stealth'], level: 1 },
            message: 'Mental focus aids your stealth abilities.',
          },
        },
        {
          id: 'survival',
          label: 'Survival 1',
          effects: {
            skills: { choices: ['Survival'], level: 1 },
            message: 'You learn to survive through mental fortitude.',
          },
        },
        {
          id: 'art',
          label: 'Art 1',
          effects: {
            skills: { choices: ['Art'], level: 1 },
            message: 'You express your inner visions through art.',
          },
        },
      ],
    },
  },
  // Event 5 - Unethical opportunity
  {
    id: 'psion-event-5',
    description: 'You have a chance to use your powers unethically to better your standing.',
    resolution: {
      type: 'choice',
      displayText: 'You can use your powers unethically for personal gain:',
      options: [
        {
          id: 'refuse',
          label: 'Refuse',
          description: 'Maintain your ethics',
          effects: {
            message: 'You maintain your ethical standards.',
          },
        },
        {
          id: 'accept',
          label: 'Accept (Roll PSI 8+)',
          description: 'Success: extra Benefit or +1 SOC. Failure: -1 SOC',
          effects: {
            message: 'You attempt unethical use. (Roll PSI 8+: success = extra Benefit or +1 SOC, failure = -1 SOC)',
          },
        },
      ],
    },
  },
  // Event 6 - Unexpected connection
  {
    id: 'psion-event-6',
    description: 'You make an unexpected connection outside your normal circles. Gain a Contact.',
    resolution: {
      type: 'automatic',
      effects: {
        contacts: 1,
        message: 'You make an unexpected connection. Gain a Contact.',
      },
    },
  },
  // Event 7 - Life Event
  {
    id: 'psion-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Roll on the Life Events table.',
    },
  },
  // Event 8 - Psionic strength increase
  {
    id: 'psion-event-8',
    description: 'You achieve a new level of psionic strength. Increase your PSI by +1.',
    resolution: {
      type: 'automatic',
      effects: {
        characteristics: [{ stat: 'psionics', modifier: 1 }],
        message: 'You achieve a new level of psionic strength. PSI +1.',
      },
    },
  },
  // Event 9 - Advanced training
  {
    id: 'psion-event-9',
    description: 'You are given advanced training in a specialist field. Roll EDU 8+ to gain any one skill except Jack-of-all-Trades.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 8,
      displayText: 'Roll EDU 8+ to complete advanced training.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { anySkill: true, level: 1 },
            message: 'Training complete! Gain any one skill (except Jack-of-all-Trades).',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            message: 'The training proves too difficult for you to master.',
          },
        },
      ],
    },
  },
  // Event 10 - Psychic information
  {
    id: 'psion-event-10',
    description: 'You pick up potentially useful information using your psychic powers. Gain DM+1 to any one Benefit roll.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'Your psychic powers reveal useful information. Gain DM+1 to a Benefit roll.',
      },
    },
  },
  // Event 11 - Mentor
  {
    id: 'psion-event-11',
    description: 'You gain a mentor. Gain an Ally and DM+4 to your next advancement roll (in any career) thanks to their aid.',
    resolution: {
      type: 'automatic',
      effects: {
        allies: 1,
        advancementDM: 4,
        message: 'You gain a powerful mentor. Gain an Ally and DM+4 to next advancement roll.',
      },
    },
  },
  // Event 12 - New discipline
  {
    id: 'psion-event-12',
    description: 'You achieve a new level of discipline in your powers. You are automatically promoted.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'You achieve a new level of discipline. You are automatically promoted!',
      },
    },
  },
];

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export const CAREER_PSION: CareerDefinition = {
  name: 'Psion',
  description: 'A career for Travellers who choose to focus on their psionic potential instead of more conventional lifestyles.',
  qualification: 'PSI 6+',
  qualificationTarget: 6,
  qualificationStat: 'psionics',
  requiresPsiTesting: true,  // Must have PSI characteristic to attempt qualification
  assignments: [
    {
      name: 'Wild Talent',
      description: 'You developed your powers without formal training.',
      survivalStat: 'social',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 8,
    },
    {
      name: 'Adept',
      description: 'You are a scholar of the psionic disciplines.',
      survivalStat: 'education',
      survivalTarget: 4,
      advancementStat: 'education',
      advancementTarget: 8,
    },
    {
      name: 'Psi-Warrior',
      description: 'You combine combat training with psionic warfare.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'endurance',
      advancementTarget: 6,
    },
  ],
  skillTables: {
    personalDevelopment: ['Education +1', 'Intellect +1', 'Strength +1', 'Dexterity +1', 'Endurance +1', 'Psionics +1'],
    serviceSkills: ['Telepathy', 'Clairvoyance', 'Telekinesis', 'Awareness', 'Teleportation', 'Any Talent'],
    advancedEducation: ['Language', 'Art', 'Electronics', 'Medic', 'Science', 'Mechanic'],
    advancedEducationMin: 8,
    specialist: {
      'Wild Talent': ['Telepathy', 'Telekinesis', 'Deception', 'Stealth', 'Streetwise', 'Melee'],
      'Adept': ['Telepathy', 'Clairvoyance', 'Awareness', 'Medic', 'Persuade', 'Science'],
      'Psi-Warrior': ['Telepathy', 'Awareness', 'Teleportation', 'Gun Combat', 'Vacc Suit', 'Recon'],
    },
  },
  ranks: {
    enlisted: [], // Psion uses assignment-specific ranks
    byAssignment: {
      'Wild Talent': [
        { title: '' },
        { title: 'Survivor', skillBonus: 'Survival' },
        { title: '' },
        { title: 'Witch', skillBonus: 'Deception' },
        { title: '' },
        { title: '' },
        { title: '' },
      ],
      'Adept': [
        { title: '' },
        { title: 'Initiate', skillBonus: 'Science (psionicology)' },
        { title: '' },
        { title: 'Acolyte' }, // Any Talent skill - handled separately
        { title: '' },
        { title: '' },
        { title: 'Master' }, // Any Talent skill - handled separately
      ],
      'Psi-Warrior': [
        { title: 'Psi-Soldier' },
        { title: '', skillBonus: 'Gun Combat' },
        { title: 'Knight', skillBonus: 'Leadership' },
        { title: '' },
        { title: '' },
        { title: 'Master of Wills', skillBonus: 'Tactics' },
        { title: '' },
      ],
    },
  },
  mishapTable: PSION_MISHAPS,
  eventTable: PSION_EVENTS,
  benefitsTable: PSION_BENEFITS,
};

// ============================================================================
// PSIONIC TALENTS
// ============================================================================
// The five main psionic disciplines/talents

export const PSIONIC_TALENTS = [
  'Telepathy',
  'Clairvoyance',
  'Telekinesis',
  'Awareness',
  'Teleportation',
] as const;

export type PsionicTalent = typeof PSIONIC_TALENTS[number];

// ============================================================================
// PSI TESTING
// ============================================================================
// Determine PSI characteristic and initial talent(s)

export interface PsiTestResult {
  psiValue: number;        // The PSI characteristic (2D6, modified by age)
  hasPsi: boolean;         // Whether they have usable psi (PSI > 0)
  talentsTested: {
    talent: PsionicTalent;
    targetNumber: number;
    roll: number;
    acquired: boolean;
  }[];
  message: string;
}

// PSI testing costs credits based on where/how it's done
// This is a simplified version - actual costs vary by setting
export const PSI_TESTING_COST = 5000;

// Age modifier for PSI testing (older = lower PSI)
export function getPsiAgePenalty(age: number): number {
  if (age <= 18) return 0;
  // Lose 1 PSI potential for every 4 years over 18
  return Math.floor((age - 18) / 4);
}

// Roll for PSI characteristic
export function rollPsiCharacteristic(age: number): number {
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  const penalty = getPsiAgePenalty(age);
  return Math.max(0, roll - penalty);
}

// Calculate target number to acquire a talent
// Each talent tested increases the difficulty by 1
export function getTalentTargetNumber(talentIndex: number, psiValue: number): number {
  // Base target is 8+, increases by 1 for each previous talent tested
  const base = 8 + talentIndex;
  return base;
}

// Test for a single talent
export function testForTalent(
  talent: PsionicTalent,
  talentIndex: number,
  psiValue: number
): { targetNumber: number; roll: number; acquired: boolean } {
  const targetNumber = getTalentTargetNumber(talentIndex, psiValue);
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  const total = roll + Math.floor((psiValue - 7) / 3); // PSI DM
  const acquired = total >= targetNumber;

  return {
    targetNumber,
    roll: total,
    acquired,
  };
}

// Perform full PSI testing
export function performPsiTesting(age: number, talentsToTest: PsionicTalent[]): PsiTestResult {
  const psiValue = rollPsiCharacteristic(age);

  if (psiValue === 0) {
    return {
      psiValue: 0,
      hasPsi: false,
      talentsTested: [],
      message: 'PSI Testing Result: No psionic potential detected (PSI 0).',
    };
  }

  const talentsTested = talentsToTest.map((talent, index) => {
    const result = testForTalent(talent, index, psiValue);
    return {
      talent,
      ...result,
    };
  });

  const acquiredTalents = talentsTested.filter(t => t.acquired);

  return {
    psiValue,
    hasPsi: true,
    talentsTested,
    message: `PSI Testing Result: PSI ${psiValue}. Acquired talents: ${acquiredTalents.length > 0 ? acquiredTalents.map(t => t.talent).join(', ') : 'None'}.`,
  };
}
