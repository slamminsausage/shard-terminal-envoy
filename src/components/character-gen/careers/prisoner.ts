// ============================================================================
// CAREER: PRISONER
// ============================================================================
// A special career that Travellers cannot enter voluntarily.
// They may be forced to spend time here through events in other careers.
// Uses a Parole Threshold system to determine when they can leave.

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Prisoner Benefits Table (1D, results 1-7)
// Note: Prisoners have very limited benefit options
const PRISONER_BENEFITS: BenefitTableRow[] = [
  // Roll 1 - No cash
  { cash: null, benefit: { options: [{ type: 'contact' }] } },
  // Roll 2 - No cash
  { cash: null, benefit: { options: [{ type: 'item', itemType: 'blade' }] } },
  // Roll 3 - Choice of skill
  { cash: 100, benefit: { options: [{ type: 'skill', skill: 'Deception' }, { type: 'skill', skill: 'Persuade' }, { type: 'skill', skill: 'Stealth' }], isChoice: true } },
  // Roll 4
  { cash: 200, benefit: { options: [{ type: 'ally' }] } },
  // Roll 5 - Choice of skill
  { cash: 500, benefit: { options: [{ type: 'skill', skill: 'Melee' }, { type: 'skill', skill: 'Recon' }, { type: 'skill', skill: 'Streetwise' }], isChoice: true } },
  // Roll 6 - STR +1 or END +1
  { cash: 1000, benefit: { options: [{ type: 'characteristic', stat: 'strength', amount: 1 }, { type: 'characteristic', stat: 'endurance', amount: 1 }], isChoice: true } },
  // Roll 7 - Multiple skills
  { cash: 2500, benefit: { options: [{ type: 'skill', skill: 'Deception' }, { type: 'skill', skill: 'Persuade' }, { type: 'skill', skill: 'Stealth' }] } },
];

// ============================================================================
// PRISONER MISHAPS (1D6)
// ============================================================================
// Note: Mishaps in prison do NOT eject you from the career

const PRISONER_MISHAPS: GameEvent[] = [
  // Mishap 1 - Severely injured
  {
    id: 'prisoner-mishap-1',
    description: 'Severely injured (same as a result of 2 on the Injury table). Alternatively, roll twice on the Injury table and take the lower result.',
    resolution: {
      type: 'automatic',
      effects: {
        rollOnTable: 'injury',
        injurySeverity: 'severe',
        message: 'You are severely injured in prison. Roll on the Injury table with severe penalties.',
      },
    },
  },
  // Mishap 2 - Accused of assaulting guard
  {
    id: 'prisoner-mishap-2',
    description: 'You are accused of assaulting a prison guard. Parole Threshold +2.',
    resolution: {
      type: 'automatic',
      effects: {
        paroleThresholdChange: 2,
        message: 'You are accused of assaulting a prison guard. Your Parole Threshold increases by 2.',
      },
    },
  },
  // Mishap 3 - Gang persecution
  {
    id: 'prisoner-mishap-3',
    description: 'A prison gang persecutes you. You may choose to fight back.',
    resolution: {
      type: 'choice',
      displayText: 'A prison gang is persecuting you. Do you fight back?',
      options: [
        {
          id: 'submit',
          label: 'Submit',
          description: 'Lose all Benefit rolls from this career',
          effects: {
            loseBenefits: true,
            message: 'You submit to the gang. You lose all Benefit rolls from this career.',
          },
        },
        {
          id: 'fight',
          label: 'Fight Back',
          description: 'Roll Melee (unarmed) 8+. Fail: severe injury. Succeed: gain Enemy, Parole +1.',
          effects: {
            message: 'You fight back against the gang. (Roll Melee 8+ - failure means severe injury, success means Enemy and Parole +1)',
          },
        },
      ],
    },
  },
  // Mishap 4 - Guard dislikes you
  {
    id: 'prisoner-mishap-4',
    description: 'A guard takes a dislike to you. Gain an Enemy and raise your Parole Threshold by +1.',
    resolution: {
      type: 'automatic',
      effects: {
        enemies: 1,
        paroleThresholdChange: 1,
        message: 'A guard takes a dislike to you. Gain an Enemy and your Parole Threshold increases by 1.',
      },
    },
  },
  // Mishap 5 - Disgraced
  {
    id: 'prisoner-mishap-5',
    description: 'Disgraced. Word of your criminal past reaches your homeworld. Lose 1 SOC.',
    resolution: {
      type: 'automatic',
      effects: {
        characteristics: [{ stat: 'social', modifier: -1 }],
        message: 'Word of your criminal past reaches your homeworld. You are disgraced. Lose 1 SOC.',
      },
    },
  },
  // Mishap 6 - Injured
  {
    id: 'prisoner-mishap-6',
    description: 'Injured. Roll on the Injury table.',
    resolution: {
      type: 'automatic',
      effects: {
        rollOnTable: 'injury',
        message: 'You are injured in prison. Roll on the Injury table.',
      },
    },
  },
];

// ============================================================================
// PRISONER EVENTS (2D6)
// ============================================================================

const PRISONER_EVENTS: GameEvent[] = [
  // Event 2 - Disaster
  {
    id: 'prisoner-event-2',
    description: 'Disaster! Roll on the Mishap table, but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'mishap',
      displayText: 'Roll on the Mishap table (you remain in prison).',
    },
  },
  // Event 3 - Escape opportunity
  {
    id: 'prisoner-event-3',
    description: 'You have the opportunity to escape the prison. Roll Stealth 10+ or Deception 10+.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 0,
        specificSkills: ['Stealth', 'Deception'],
      },
      target: 10,
      displayText: 'Roll Stealth or Deception 10+ to escape.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            leaveCareer: true,
            message: 'You successfully escape from prison! You leave this career.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            paroleThresholdChange: 2,
            message: 'Your escape attempt fails. Your Parole Threshold increases by 2.',
          },
        },
      ],
    },
  },
  // Event 4 - Difficult labour
  {
    id: 'prisoner-event-4',
    description: 'You are assigned to difficult or backbreaking labour.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'endurance',
      target: 8,
      displayText: 'Roll END 8+ to handle the labour.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            paroleThresholdChange: -1,
            message: 'You handle the labour well. Your Parole Threshold decreases by 1. Choose a skill to gain.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            paroleThresholdChange: 1,
            message: 'The labour breaks you down. Your Parole Threshold increases by 1.',
          },
        },
      ],
    },
  },
  // Event 5 - Join gang
  {
    id: 'prisoner-event-5',
    description: 'You have the opportunity to join a gang.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 0,
        specificSkills: ['Persuade', 'Melee', 'Melee (unarmed)'],
      },
      target: 8,
      displayText: 'Roll Persuade or Melee 8+ to join the gang.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            paroleThresholdChange: 1,
            survivalDM: 1,
            message: 'You join the gang. Parole Threshold +1, but DM+1 to all survival rolls. Choose a skill.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            enemies: 1,
            message: 'The gang rejects you violently. Gain an Enemy.',
          },
        },
      ],
    },
  },
  // Event 6 - Vocational training
  {
    id: 'prisoner-event-6',
    description: 'Vocational Training. Roll EDU 8+ to gain any one skill except Jack-of-all-Trades.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 8,
      displayText: 'Roll EDU 8+ to complete vocational training.',
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
            message: 'You fail to complete the training program.',
          },
        },
      ],
    },
  },
  // Event 7 - Prison event (sub-table 1D6)
  {
    id: 'prisoner-event-7',
    description: 'Prison Event. Roll 1D for a random prison event.',
    resolution: {
      type: 'table_redirect',
      table: 'prison_event',
      displayText: 'Roll 1D for a random prison event.',
    },
  },
  // Event 8 - Parole hearing
  {
    id: 'prisoner-event-8',
    description: 'Parole hearing. Reduce your Parole Threshold by -1.',
    resolution: {
      type: 'automatic',
      effects: {
        paroleThresholdChange: -1,
        message: 'You attend a parole hearing. Your Parole Threshold decreases by 1.',
      },
    },
  },
  // Event 9 - Hire lawyer
  {
    id: 'prisoner-event-9',
    description: 'You have the opportunity to hire a new lawyer.',
    resolution: {
      type: 'choice',
      displayText: 'You can hire a lawyer to help with your case. Higher skill costs more but has better chances.',
      options: [
        {
          id: 'no-lawyer',
          label: 'Decline',
          description: 'Do not hire a lawyer',
          effects: {
            message: 'You decline to hire a lawyer.',
          },
        },
        {
          id: 'lawyer-1',
          label: 'Advocate-1 (Cr1,000)',
          description: 'Roll 2D+1, need 8+ to reduce Parole',
          effects: {
            message: 'You hire an Advocate-1 lawyer for Cr1,000.',
          },
          subRoll: {
            dice: 2,
            dm: 1,
            outcomes: [
              { min: 8, max: 13, label: 'Success! Parole reduced.', effects: { paroleReduction: '1D', message: 'Your lawyer succeeds! Parole Threshold reduced.' } },
              { min: 2, max: 7, label: 'Lawyer fails.', effects: { message: 'Your lawyer fails to make progress on your case.' } },
            ],
          },
        },
        {
          id: 'lawyer-2',
          label: 'Advocate-2 (Cr4,000)',
          description: 'Roll 2D+2, need 8+ to reduce Parole',
          effects: {
            message: 'You hire an Advocate-2 lawyer for Cr4,000.',
          },
          subRoll: {
            dice: 2,
            dm: 2,
            outcomes: [
              { min: 8, max: 14, label: 'Success! Parole reduced.', effects: { paroleReduction: '1D', message: 'Your lawyer succeeds! Parole Threshold reduced.' } },
              { min: 2, max: 7, label: 'Lawyer fails.', effects: { message: 'Your lawyer fails to make progress on your case.' } },
            ],
          },
        },
        {
          id: 'lawyer-3',
          label: 'Advocate-3 (Cr9,000)',
          description: 'Roll 2D+3, need 8+ to reduce Parole',
          effects: {
            message: 'You hire an Advocate-3 lawyer for Cr9,000.',
          },
          subRoll: {
            dice: 2,
            dm: 3,
            outcomes: [
              { min: 8, max: 15, label: 'Success! Parole reduced.', effects: { paroleReduction: '1D', message: 'Your lawyer succeeds! Parole Threshold reduced.' } },
              { min: 2, max: 7, label: 'Lawyer fails.', effects: { message: 'Your lawyer fails to make progress on your case.' } },
            ],
          },
        },
      ],
    },
  },
  // Event 10 - Special duty
  {
    id: 'prisoner-event-10',
    description: 'Special Duty. You are given a special responsibility in the prison.',
    resolution: {
      type: 'choice',
      displayText: 'You are given special duty. Choose a skill to gain:',
      options: [
        {
          id: 'admin',
          label: 'Admin 1',
          effects: {
            skills: { choices: ['Admin'], level: 1 },
            message: 'Your administrative duties teach you valuable skills.',
          },
        },
        {
          id: 'advocate',
          label: 'Advocate 1',
          effects: {
            skills: { choices: ['Advocate'], level: 1 },
            message: 'You help other prisoners with their cases, learning legal skills.',
          },
        },
        {
          id: 'electronics',
          label: 'Electronics (computers) 1',
          effects: {
            skills: { choices: ['Electronics (computers)'], level: 1 },
            message: 'You learn to operate the prison computer systems.',
          },
        },
        {
          id: 'steward',
          label: 'Steward 1',
          effects: {
            skills: { choices: ['Steward'], level: 1 },
            message: 'Kitchen duty teaches you valuable service skills.',
          },
        },
      ],
    },
  },
  // Event 11 - Warden interest
  {
    id: 'prisoner-event-11',
    description: 'The warden takes an interest in your case. Reduce your Parole Threshold by -2.',
    resolution: {
      type: 'automatic',
      effects: {
        paroleThresholdChange: -2,
        message: 'The warden takes a personal interest in your rehabilitation. Your Parole Threshold decreases by 2.',
      },
    },
  },
  // Event 12 - Heroism
  {
    id: 'prisoner-event-12',
    description: 'Heroism. You have the opportunity to save a guard or prison officer.',
    resolution: {
      type: 'choice',
      displayText: 'You can save a guard from danger. Do you take the risk?',
      options: [
        {
          id: 'ignore',
          label: 'Stay out of it',
          description: 'Do nothing',
          effects: {
            message: 'You decide not to get involved.',
          },
        },
        {
          id: 'help',
          label: 'Save the guard',
          description: 'Roll 2D: 7 or less = Injury, 8+ = Ally and Parole -2',
          effects: {
            message: 'You rush to help the guard!',
          },
          subRoll: {
            dice: 2,
            outcomes: [
              {
                min: 2,
                max: 7,
                label: 'Injured!',
                effects: {
                  rollOnTable: 'injury',
                  message: 'You save the guard but are injured in the process.',
                },
              },
              {
                min: 8,
                max: 12,
                label: 'Success! Ally gained.',
                effects: {
                  allies: 1,
                  paroleReduction: 2,
                  message: 'You save the guard! You gain an Ally and your Parole Threshold is reduced by 2.',
                },
              },
            ],
          },
        },
      ],
    },
  },
];

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export const CAREER_PRISONER: CareerDefinition = {
  name: 'Prisoner',
  description: 'Every society has its bad apples. You ended up in a faceless institution where criminals can be conveniently forgotten.',
  qualification: 'Special', // Cannot qualify - forced entry only
  qualificationTarget: 0,   // Irrelevant - auto-entry when forced
  qualificationStat: 'endurance', // Placeholder
  isPrisonerCareer: true,   // Special flag for prisoner-specific handling
  usesParoleThreshold: true, // Uses parole system instead of normal leaving
  noAnagathics: true,        // Cannot use anagathics in prison
  assignments: [
    {
      name: 'Inmate',
      description: 'You just try to get through your time in prison without getting into trouble.',
      survivalStat: 'endurance',
      survivalTarget: 7,
      advancementStat: 'strength',
      advancementTarget: 7,
    },
    {
      name: 'Thug',
      description: 'You are part of a gang in prison, terrorizing the other inmates.',
      survivalStat: 'strength',
      survivalTarget: 8,
      advancementStat: 'endurance',
      advancementTarget: 6,
    },
    {
      name: 'Fixer',
      description: 'You can arrange anything – for the right price.',
      survivalStat: 'intellect',
      survivalTarget: 9,
      advancementStat: 'endurance',
      advancementTarget: 5,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Melee (unarmed)', 'Endurance +1', 'Jack-of-all-Trades', 'Education +1', 'Gambler'],
    serviceSkills: ['Athletics', 'Deception', 'Profession', 'Streetwise', 'Melee (unarmed)', 'Persuade'],
    advancedEducation: [], // No advanced education in prison
    specialist: {
      'Inmate': ['Stealth', 'Melee (unarmed)', 'Streetwise', 'Survival', 'Athletics (strength)', 'Mechanic'],
      'Thug': ['Persuade', 'Melee (unarmed)', 'Melee (unarmed)', 'Melee (blade)', 'Athletics (strength)', 'Athletics (strength)'],
      'Fixer': ['Investigate', 'Broker', 'Deception', 'Streetwise', 'Stealth', 'Admin'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Inmate', skillBonus: 'Melee (unarmed)' },
      { title: 'Inmate' },
      { title: 'Inmate', skillBonus: 'Athletics' },
      { title: 'Inmate' },
      { title: 'Inmate', skillBonus: 'Advocate' },
      { title: 'Inmate' },
      { title: 'Inmate', bonusStat: 'endurance' },
    ],
  },
  mishapTable: PRISONER_MISHAPS,
  eventTable: PRISONER_EVENTS,
  benefitsTable: PRISONER_BENEFITS,
};

// ============================================================================
// PRISON EVENT SUB-TABLE (1D6)
// ============================================================================
// Used by Event 7

export const PRISON_EVENTS_SUBTABLE: GameEvent[] = [
  // 1 - Riot
  {
    id: 'prison-sub-1',
    description: 'Riot! Roll 1D: 1-2 = injured, 5-6 = loot something useful (extra Benefit roll).',
    resolution: {
      type: 'sub_roll',
      displayText: 'A riot breaks out! Roll 1D to see what happens.',
      subRoll: {
        dice: 1,
        outcomes: [
          {
            min: 1,
            max: 2,
            label: 'Injured!',
            effects: {
              rollOnTable: 'injury',
              message: 'You are injured during the riot.',
            },
          },
          {
            min: 3,
            max: 4,
            label: 'Caught in the chaos',
            effects: {
              message: 'You survive the riot without incident.',
            },
          },
          {
            min: 5,
            max: 6,
            label: 'Looted!',
            effects: {
              extraBenefit: true,
              message: 'You loot something useful during the chaos. Gain an extra Benefit roll.',
            },
          },
        ],
      },
    },
  },
  // 2 - New Contact
  {
    id: 'prison-sub-2',
    description: 'New Contact. You make friends with another inmate; gain them as a Contact.',
    resolution: {
      type: 'automatic',
      effects: {
        contacts: 1,
        message: 'You make friends with another inmate. Gain a Contact.',
      },
    },
  },
  // 3 - New Rival
  {
    id: 'prison-sub-3',
    description: 'New Rival. You gain a new Rival among the inmates or guards.',
    resolution: {
      type: 'automatic',
      effects: {
        rivals: 1,
        message: 'You make an enemy. Gain a Rival among the inmates or guards.',
      },
    },
  },
  // 4 - Transferred
  {
    id: 'prison-sub-4',
    description: 'Transferred. You are moved to a different prison. Re-roll your Parole Threshold.',
    resolution: {
      type: 'automatic',
      effects: {
        rerollParoleThreshold: true,
        message: 'You are transferred to a different prison. Re-roll your Parole Threshold (1D+2).',
      },
    },
  },
  // 5 - Good Behaviour
  {
    id: 'prison-sub-5',
    description: 'Good Behaviour. Reduce your Parole Threshold by -2.',
    resolution: {
      type: 'automatic',
      effects: {
        paroleThresholdChange: -2,
        message: 'Your good behaviour is noted. Your Parole Threshold decreases by 2.',
      },
    },
  },
  // 6 - Attacked
  {
    id: 'prison-sub-6',
    description: 'You are attacked by another prisoner. Roll Melee (unarmed) 8+. If you fail, roll on the Injury table.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 0,
        specificSkills: ['Melee (unarmed)', 'Melee'],
      },
      target: 8,
      displayText: 'Roll Melee (unarmed) 8+ to defend yourself.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            message: 'You successfully defend yourself against the attacker.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            rollOnTable: 'injury',
            message: 'You fail to defend yourself. Roll on the Injury table.',
          },
        },
      ],
    },
  },
];

// Helper function to get prison sub-event by 1D roll
export function getPrisonSubEvent(roll: number): GameEvent {
  const index = Math.max(0, Math.min(roll - 1, PRISON_EVENTS_SUBTABLE.length - 1));
  return PRISON_EVENTS_SUBTABLE[index];
}

// Helper to roll initial parole threshold (1D+2)
export function rollInitialParoleThreshold(): number {
  const roll = Math.floor(Math.random() * 6) + 1;
  return Math.min(roll + 2, 12); // Max parole threshold is 12
}
