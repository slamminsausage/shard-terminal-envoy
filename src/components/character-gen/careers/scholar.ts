// ============================================================================
// CAREER: SCHOLAR
// Individuals trained in technological or research sciences who conduct
// scientific investigations into materials, situations and phenomena,
// or who practise medicine.
// ============================================================================

import type { CareerDefinition, GameEvent } from './types';

// ============================================================================
// SCHOLAR MISHAPS (1D6)
// ============================================================================

const SCHOLAR_MISHAPS: GameEvent[] = [
  {
    id: 'scholar-mishap-1',
    description: 'Severely injured (same as result of 2 on the Injury table). Alternatively, roll twice on the Injury table and take the lower result.',
    resolution: {
      type: 'automatic',
      effects: {
        rollOnTable: 'injury',
        injurySeverity: 'severe',
        message: 'You are severely injured. Roll on the Injury table with severe penalties.',
      },
    },
  },
  {
    id: 'scholar-mishap-2',
    description: 'A disaster leaves several injured and others blame you, forcing you to leave your career. Roll on the Injury table twice, taking the higher result and gain a Rival.',
    resolution: {
      type: 'automatic',
      effects: {
        rollOnTable: 'injury',
        rivals: 1,
        message: 'A disaster occurs and you are blamed. Roll on the Injury table and gain a Rival.',
      },
    },
  },
  {
    id: 'scholar-mishap-3',
    description: 'The planetary government interferes with your research for political or religious reasons. If you continue with your work openly, increase Science by one level and gain an Enemy. If you continue with your work secretly, increase Science by one level and reduce your SOC by 2. This mishap does not cause you to leave this career.',
    resolution: {
      type: 'choice',
      displayText: 'The government interferes with your research. How do you respond?',
      options: [
        {
          id: 'openly',
          label: 'Continue openly',
          description: 'Gain Science 1 and an Enemy',
          effects: {
            skills: { choices: ['Science'], level: 1 },
            enemies: 1,
            message: 'You publicly defy the government. Gain Science 1 and an Enemy.',
          },
        },
        {
          id: 'secretly',
          label: 'Continue secretly',
          description: 'Gain Science 1 but lose 2 SOC',
          effects: {
            skills: { choices: ['Science'], level: 1 },
            characteristics: [{ stat: 'social', modifier: -2 }],
            message: 'You work in secret. Gain Science 1 but SOC -2.',
          },
        },
      ],
    },
  },
  {
    id: 'scholar-mishap-4',
    description: 'An expedition or voyage goes wrong, leaving you stranded in the wilderness. Gain Survival 1 or Athletics (dexterity or endurance) 1. By the time you find your way home, your job is gone.',
    resolution: {
      type: 'choice',
      displayText: 'Stranded in the wilderness. What skills did you develop?',
      options: [
        {
          id: 'survival',
          label: 'Survival 1',
          effects: { skills: { choices: ['Survival'], level: 1 }, message: 'You learn wilderness survival.' },
        },
        {
          id: 'athletics-dex',
          label: 'Athletics (dexterity) 1',
          effects: { skills: { choices: ['Athletics (dexterity)'], level: 1 }, message: 'You develop agility surviving in the wild.' },
        },
        {
          id: 'athletics-end',
          label: 'Athletics (endurance) 1',
          effects: { skills: { choices: ['Athletics (endurance)'], level: 1 }, message: 'You develop stamina surviving in the wild.' },
        },
      ],
    },
  },
  {
    id: 'scholar-mishap-5',
    description: 'Your work is sabotaged by unknown parties. You may salvage what you can and give up (leave the career but retain this term\'s Benefit roll) or start again from scratch (lose all Benefit rolls from this career but you do not have to leave).',
    resolution: {
      type: 'choice',
      displayText: 'Your work is sabotaged. What do you do?',
      options: [
        {
          id: 'salvage',
          label: 'Salvage and leave',
          description: 'Leave career but keep this term\'s Benefit roll',
          effects: {
            extraBenefit: true,
            message: 'You salvage what you can and leave the career with an extra Benefit roll.',
          },
        },
        {
          id: 'restart',
          label: 'Start from scratch',
          description: 'Lose all Benefits but stay in career',
          effects: {
            loseBenefits: true,
            message: 'You start over from scratch. Lose all Benefits but remain in the career.',
          },
        },
      ],
    },
  },
  {
    id: 'scholar-mishap-6',
    description: 'A rival researcher blackens your name or steals your research. Gain a Rival but you do not have to leave this career.',
    resolution: {
      type: 'automatic',
      effects: {
        rivals: 1,
        message: 'A rival steals your research or ruins your reputation. Gain a Rival.',
      },
    },
  },
];

// ============================================================================
// SCHOLAR EVENTS (2D6)
// ============================================================================

const SCHOLAR_EVENTS: GameEvent[] = [
  // Event 2: Disaster
  {
    id: 'scholar-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'injury',
      displayText: 'Roll on the Mishap table (not ejected from career).',
    },
  },

  // Event 3: Unethical research
  {
    id: 'scholar-event-3',
    description: 'You are called upon to perform research that goes against your conscience. Accept and you gain an extra Benefit roll, a level in each of any two Science skill specialties and D3 Enemies.',
    resolution: {
      type: 'choice',
      displayText: 'You are asked to perform unethical research:',
      options: [
        {
          id: 'accept',
          label: 'Accept the work',
          description: 'Extra Benefit, 2 Science skills, but D3 Enemies',
          effects: {
            extraBenefit: true,
            skills: { choices: ['Science'], level: 1 },
            enemies: 'D3',
            message: 'You perform the unethical research. Gain extra Benefit, Science skills, but D3 Enemies.',
          },
        },
        {
          id: 'refuse',
          label: 'Refuse',
          description: 'Maintain your ethics',
          effects: {
            message: 'You refuse to compromise your ethics.',
          },
        },
      ],
    },
  },

  // Event 4: Secret project
  {
    id: 'scholar-event-4',
    description: 'You are assigned to work on a secret project for a patron or organisation. Gain one of Medic 1, Science 1, Engineer 1, Electronics 1 or Investigate 1.',
    resolution: {
      type: 'choice',
      displayText: 'Working on a secret project teaches you:',
      options: [
        {
          id: 'medic',
          label: 'Medic 1',
          effects: { skills: { choices: ['Medic'], level: 1 }, message: 'You learn medical techniques.' },
        },
        {
          id: 'science',
          label: 'Science 1',
          effects: { skills: { choices: ['Science'], level: 1 }, message: 'You advance your scientific knowledge.' },
        },
        {
          id: 'engineer',
          label: 'Engineer 1',
          effects: { skills: { choices: ['Engineer'], level: 1 }, message: 'You learn engineering skills.' },
        },
        {
          id: 'electronics',
          label: 'Electronics 1',
          effects: { skills: { choices: ['Electronics'], level: 1 }, message: 'You learn electronics.' },
        },
      ],
    },
  },

  // Event 5: Prestigious prize
  {
    id: 'scholar-event-5',
    description: 'You win a prestigious prize for your work, garnering both the praise and envy of your peers. Gain DM+1 to any one Benefit roll.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'You win a prestigious prize! Gain DM+1 to any one Benefit roll.',
      },
    },
  },

  // Event 6: Advanced training
  {
    id: 'scholar-event-6',
    description: 'You are given advanced training in a specialist field. Roll EDU 8+ to gain any one skill of your choice at level 1.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 8,
      displayText: 'Roll EDU 8+ for advanced training.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { anySkill: true, level: 1 },
            message: 'Your advanced training succeeds. Choose any skill at level 1.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            message: 'The training proves too difficult.',
          },
        },
      ],
    },
  },

  // Event 7: Life Event
  {
    id: 'scholar-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Roll on the Life Events table.',
    },
  },

  // Event 8: Opportunity to cheat
  {
    id: 'scholar-event-8',
    description: 'You have the opportunity to cheat in some fashion, advancing your career and research by stealing another\'s work, using an alien device, taking a shortcut and so forth. If you refuse, you gain nothing. If you accept, roll Deception 8+ or Admin 8+. If you succeed, you gain DM+2 to any one Benefit roll and may increase any skill by one level but also gain an Enemy. If you fail, gain an Enemy and lose one Benefit roll from this career.',
    resolution: {
      type: 'choice',
      displayText: 'You can cheat to advance your career:',
      options: [
        {
          id: 'cheat',
          label: 'Cheat',
          description: 'Roll Deception/Admin 8+. Success: Benefits + Skill + Enemy. Fail: Enemy + lose Benefit.',
          effects: {
            skills: { anySkill: true, level: 1 },
            benefitDM: 2,
            enemies: 1,
            message: 'You attempt to cheat. (If roll succeeded: gain skill and DM+2 to Benefit. Either way: gain Enemy)',
          },
        },
        {
          id: 'refuse',
          label: 'Refuse',
          description: 'Maintain your integrity',
          effects: {
            message: 'You refuse to compromise your integrity.',
          },
        },
      ],
    },
  },

  // Event 9: Breakthrough
  {
    id: 'scholar-event-9',
    description: 'You make a breakthrough in your field. Gain DM+2 to your next advancement roll.',
    resolution: {
      type: 'automatic',
      effects: {
        advancementDM: 2,
        message: 'You make a major breakthrough! Gain DM+2 to your next advancement roll.',
      },
    },
  },

  // Event 10: Bureaucratic morass
  {
    id: 'scholar-event-10',
    description: 'You become entangled in a bureaucratic or legal morass that distracts you from your work. Gain one of Admin 1, Advocate 1, Persuade 1 or Diplomat 1.',
    resolution: {
      type: 'choice',
      displayText: 'Bureaucratic troubles teach you new skills:',
      options: [
        {
          id: 'admin',
          label: 'Admin 1',
          effects: { skills: { choices: ['Admin'], level: 1 }, message: 'You learn to navigate bureaucracy.' },
        },
        {
          id: 'advocate',
          label: 'Advocate 1',
          effects: { skills: { choices: ['Advocate'], level: 1 }, message: 'You learn legal skills.' },
        },
        {
          id: 'persuade',
          label: 'Persuade 1',
          effects: { skills: { choices: ['Persuade'], level: 1 }, message: 'You learn to persuade officials.' },
        },
        {
          id: 'diplomat',
          label: 'Diplomat 1',
          effects: { skills: { choices: ['Diplomat'], level: 1 }, message: 'You learn diplomatic skills.' },
        },
      ],
    },
  },

  // Event 11: Eccentric mentor
  {
    id: 'scholar-event-11',
    description: 'You work for an eccentric but brilliant mentor, who becomes an Ally. Either increase Science by one level or DM+4 to your next advancement roll thanks to their aid.',
    resolution: {
      type: 'choice',
      displayText: 'Your eccentric mentor becomes an Ally:',
      options: [
        {
          id: 'science',
          label: 'Gain Science',
          description: 'Learn from your mentor',
          effects: {
            allies: 1,
            skills: { choices: ['Science'], level: 1 },
            message: 'You gain an Ally and learn Science from your mentor.',
          },
        },
        {
          id: 'advancement',
          label: 'DM+4 to advancement',
          description: 'Your mentor helps your career',
          effects: {
            allies: 1,
            advancementDM: 4,
            message: 'You gain an Ally and DM+4 to your next advancement roll.',
          },
        },
      ],
    },
  },

  // Event 12: Considerable breakthrough
  {
    id: 'scholar-event-12',
    description: 'Your work leads to a considerable breakthrough. You are automatically promoted.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'Your research leads to a major breakthrough! You are automatically promoted.',
      },
    },
  },
];

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export const CAREER_SCHOLAR: CareerDefinition = {
  name: 'Scholar',
  description: 'Individuals trained in technological or research sciences who conduct scientific investigations, or who practise medicine.',
  qualification: 'INT 6+',
  qualificationTarget: 6,
  qualificationStat: 'intellect',
  usesAssignmentSkillsForBasicTraining: false,
  assignments: [
    {
      name: 'Field Researcher',
      description: 'You conduct research in the field, exploring and investigating.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 6,
    },
    {
      name: 'Scientist',
      description: 'You work in a laboratory or research facility.',
      survivalStat: 'education',
      survivalTarget: 4,
      advancementStat: 'intellect',
      advancementTarget: 8,
    },
    {
      name: 'Physician',
      description: 'You practise medicine, treating patients.',
      survivalStat: 'education',
      survivalTarget: 4,
      advancementStat: 'education',
      advancementTarget: 8,
    },
  ],
  skillTables: {
    personalDevelopment: ['Intellect +1', 'Education +1', 'Social +1', 'Dexterity +1', 'Endurance +1', 'Language'],
    serviceSkills: ['Drive', 'Electronics', 'Diplomat', 'Medic', 'Investigate', 'Science'],
    advancedEducation: ['Art', 'Advocate', 'Electronics', 'Language', 'Engineer', 'Science'],
    advancedEducationMin: 10,
    specialist: {
      'Field Researcher': ['Electronics', 'Vacc Suit', 'Navigation', 'Survival', 'Investigate', 'Science'],
      'Scientist': ['Admin', 'Engineer', 'Science', 'Science', 'Electronics', 'Science'],
      'Physician': ['Medic', 'Electronics', 'Investigate', 'Medic', 'Persuade', 'Science'],
    },
  },
  ranks: {
    enlisted: [
      { title: '' },
      { title: '', skillBonus: 'Science' },
      { title: '', skillBonus: 'Electronics (computers)' },
      { title: '', skillBonus: 'Investigate' },
      { title: '' },
      { title: '', skillBonus: 'Science' },
      { title: '' },
    ],
    byAssignment: {
      'Field Researcher': [
        { title: '' },
        { title: '', skillBonus: 'Science' },
        { title: '', skillBonus: 'Electronics (computers)' },
        { title: '', skillBonus: 'Investigate' },
        { title: '' },
        { title: '', skillBonus: 'Science' },
        { title: '' },
      ],
      'Scientist': [
        { title: '' },
        { title: '', skillBonus: 'Science' },
        { title: '', skillBonus: 'Electronics (computers)' },
        { title: '', skillBonus: 'Investigate' },
        { title: '' },
        { title: '', skillBonus: 'Science' },
        { title: '' },
      ],
      'Physician': [
        { title: '' },
        { title: '', skillBonus: 'Medic' },
        { title: '' },
        { title: '', skillBonus: 'Science' },
        { title: '' },
        { title: '', skillBonus: 'Science' },
        { title: '' },
      ],
    },
  },
  mishapTable: SCHOLAR_MISHAPS,
  eventTable: SCHOLAR_EVENTS,
};
