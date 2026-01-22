// ============================================================================
// CAREER: ENTERTAINER
// Individuals involved with the media, whether as reporters, artists, or celebrities.
// ============================================================================

import type { CareerDefinition, GameEvent } from './types';

// ============================================================================
// ENTERTAINER MISHAPS (1D6)
// ============================================================================

const ENTERTAINER_MISHAPS: GameEvent[] = [
  {
    id: 'entertainer-mishap-1',
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
    id: 'entertainer-mishap-2',
    description: 'You expose or are involved in a scandal of some sort.',
    resolution: {
      type: 'automatic',
      effects: {
        rivals: 1,
        message: 'A scandal destroys your reputation. You gain a Rival from the fallout.',
      },
    },
  },
  {
    id: 'entertainer-mishap-3',
    description: 'Public opinion turns on you. Reduce your SOC by 1.',
    resolution: {
      type: 'automatic',
      effects: {
        characteristics: [{ stat: 'social', modifier: -1 }],
        message: 'Public opinion turns against you. Your social standing decreases.',
      },
    },
  },
  {
    id: 'entertainer-mishap-4',
    description: 'You are betrayed by a peer. One of your Contacts or Allies betrays you, ending your career. That Contact or Ally becomes a Rival or Enemy. If you have no Contacts or Allies, then you are betrayed by someone you never saw coming and still gain a Rival or Enemy.',
    resolution: {
      type: 'automatic',
      effects: {
        enemies: 1,
        message: 'A peer betrays you, ending your career. They become an Enemy.',
      },
    },
  },
  {
    id: 'entertainer-mishap-5',
    description: 'An investigation, tour, project or expedition goes wrong, stranding you far from home. Gain one of Survival 1, Pilot 1, Persuade 1 or Streetwise 1.',
    resolution: {
      type: 'choice',
      displayText: 'Stranded far from home. What skills did you pick up?',
      options: [
        {
          id: 'survival',
          label: 'Survival 1',
          effects: { skills: { choices: ['Survival'], level: 1 }, message: 'You learn to survive in the wilderness.' },
        },
        {
          id: 'pilot',
          label: 'Pilot 1',
          effects: { skills: { choices: ['Pilot'], level: 1 }, message: 'You learn to pilot your way home.' },
        },
        {
          id: 'persuade',
          label: 'Persuade 1',
          effects: { skills: { choices: ['Persuade'], level: 1 }, message: 'You learn to convince locals to help you.' },
        },
        {
          id: 'streetwise',
          label: 'Streetwise 1',
          effects: { skills: { choices: ['Streetwise'], level: 1 }, message: 'You learn street smarts to get home.' },
        },
      ],
    },
  },
  {
    id: 'entertainer-mishap-6',
    description: 'You are forced out because of censorship or controversy. What truth did you get too close to? You gain DM+2 to the qualification roll for your next career.',
    resolution: {
      type: 'automatic',
      effects: {
        qualificationDM: 2,
        message: 'Censorship forces you out. Your notoriety helps with your next career (DM+2 to qualification).',
      },
    },
  },
];

// ============================================================================
// ENTERTAINER EVENTS (2D6)
// ============================================================================

const ENTERTAINER_EVENTS: GameEvent[] = [
  // Event 2: Disaster
  {
    id: 'entertainer-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'injury',
      displayText: 'Roll on the Mishap table (not ejected from career).',
    },
  },

  // Event 3: Controversial event
  {
    id: 'entertainer-event-3',
    description: 'You are invited to take part in a controversial event or exhibition. Roll Art or Investigate 8+. If you succeed, gain one SOC. If you fail, lose one SOC.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 0,
        specificSkills: ['Art', 'Art (performer)', 'Art (holography)', 'Art (instrument)', 'Art (visual media)', 'Art (write)', 'Investigate'],
      },
      target: 8,
      displayText: 'Roll Art or Investigate 8+ to handle the controversy well.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            characteristics: [{ stat: 'social', modifier: 1 }],
            message: 'Your handling of the controversy impresses everyone. SOC +1.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            characteristics: [{ stat: 'social', modifier: -1 }],
            message: 'The controversy damages your reputation. SOC -1.',
          },
        },
      ],
    },
  },

  // Event 4: Celebrity circles
  {
    id: 'entertainer-event-4',
    description: 'You are a part of your homeworld\'s celebrity circles. Gain one of Carouse 1, Persuade 1, Steward 1 or a Contact.',
    resolution: {
      type: 'choice',
      displayText: 'You move in celebrity circles. Choose your benefit:',
      options: [
        {
          id: 'carouse',
          label: 'Carouse 1',
          effects: { skills: { choices: ['Carouse'], level: 1 }, message: 'You learn to party with the elite.' },
        },
        {
          id: 'persuade',
          label: 'Persuade 1',
          effects: { skills: { choices: ['Persuade'], level: 1 }, message: 'You learn the art of persuasion.' },
        },
        {
          id: 'steward',
          label: 'Steward 1',
          effects: { skills: { choices: ['Steward'], level: 1 }, message: 'You learn to manage social situations.' },
        },
        {
          id: 'contact',
          label: 'Gain a Contact',
          effects: { contacts: 1, message: 'You make a useful contact in celebrity circles.' },
        },
      ],
    },
  },

  // Event 5: Popular work
  {
    id: 'entertainer-event-5',
    description: 'One of your works is especially well received and popular, making you a minor celebrity. Gain DM+1 to any one Benefit roll.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'Your work becomes popular! Gain DM+1 to any one Benefit roll.',
      },
    },
  },

  // Event 6: Patron in the arts
  {
    id: 'entertainer-event-6',
    description: 'You gain a patron in the arts. Gain DM+2 to your next advancement roll and an Ally.',
    resolution: {
      type: 'automatic',
      effects: {
        allies: 1,
        advancementDM: 2,
        message: 'You gain a patron who becomes an Ally. DM+2 to your next advancement roll.',
      },
    },
  },

  // Event 7: Life Event
  {
    id: 'entertainer-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Roll on the Life Events table.',
    },
  },

  // Event 8: Criticize political leader
  {
    id: 'entertainer-event-8',
    description: 'You have the opportunity to criticise or even bring down a questionable political leader on your homeworld. If you refuse and support the leader, you gain nothing. If you accept, gain an Enemy and roll Art or Persuade 8+. If you succeed, gain one level in any skill you already have. If you fail, increase a skill anyway and roll on the Mishap table.',
    resolution: {
      type: 'choice',
      displayText: 'Will you criticize the questionable political leader?',
      options: [
        {
          id: 'criticize',
          label: 'Criticize the leader',
          description: 'Gain an Enemy. Roll Art/Persuade 8+ for skill gain. Failure means Mishap.',
          effects: {
            enemies: 1,
            skills: { anySkill: true, requireExisting: true, level: 1 },
            message: 'You speak out against the leader. Gain an Enemy and increase a skill. (If roll failed, also roll on Mishap table)',
          },
        },
        {
          id: 'support',
          label: 'Support the leader',
          description: 'Play it safe and gain nothing.',
          effects: {
            message: 'You choose to support the leader. You gain nothing.',
          },
        },
      ],
    },
  },

  // Event 9: Tour of sector
  {
    id: 'entertainer-event-9',
    description: 'You go on a tour of the sector, visiting several worlds. Gain D3 Contacts.',
    resolution: {
      type: 'automatic',
      effects: {
        contacts: 'D3',
        message: 'Your tour introduces you to many people. Gain D3 Contacts.',
      },
    },
  },

  // Event 10: Art stolen
  {
    id: 'entertainer-event-10',
    description: 'One of your pieces of art is stolen and the investigation brings you into the criminal underworld. Gain one of Streetwise 1, Investigate 1, Recon 1 or Stealth 1.',
    resolution: {
      type: 'choice',
      displayText: 'Investigating your stolen art teaches you new skills:',
      options: [
        {
          id: 'streetwise',
          label: 'Streetwise 1',
          effects: { skills: { choices: ['Streetwise'], level: 1 }, message: 'You learn to navigate the criminal underworld.' },
        },
        {
          id: 'investigate',
          label: 'Investigate 1',
          effects: { skills: { choices: ['Investigate'], level: 1 }, message: 'You learn investigation techniques.' },
        },
        {
          id: 'recon',
          label: 'Recon 1',
          effects: { skills: { choices: ['Recon'], level: 1 }, message: 'You learn reconnaissance skills.' },
        },
        {
          id: 'stealth',
          label: 'Stealth 1',
          effects: { skills: { choices: ['Stealth'], level: 1 }, message: 'You learn to move unseen.' },
        },
      ],
    },
  },

  // Event 11: Unusual Event
  {
    id: 'entertainer-event-11',
    description: 'As an artist, you lead a strange and charmed life. Go to the Life Events Table and have an Unusual Event.',
    resolution: {
      type: 'table_redirect',
      table: 'unusual_events',
      displayText: 'Roll on the Unusual Events table.',
    },
  },

  // Event 12: Win prestigious prize
  {
    id: 'entertainer-event-12',
    description: 'You win a prestigious prize. You are automatically promoted.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'You win a prestigious prize! You are automatically promoted.',
      },
    },
  },
];

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export const CAREER_ENTERTAINER: CareerDefinition = {
  name: 'Entertainer',
  description: 'Individuals involved with the media, whether as reporters, artists, or celebrities.',
  qualification: 'DEX or INT 5+',
  qualificationTarget: 5,
  qualificationStat: 'dexterity', // Or intellect - whichever is higher
  usesAssignmentSkillsForBasicTraining: false,
  assignments: [
    {
      name: 'Artist',
      description: 'You create visual or written works of art.',
      survivalStat: 'social',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 6,
    },
    {
      name: 'Journalist',
      description: 'You report on news and investigate stories.',
      survivalStat: 'education',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 5,
    },
    {
      name: 'Performer',
      description: 'You are a musician, actor, or other live performer.',
      survivalStat: 'intellect',
      survivalTarget: 5,
      advancementStat: 'dexterity',
      advancementTarget: 7,
    },
  ],
  skillTables: {
    personalDevelopment: ['Dexterity +1', 'Intellect +1', 'Social +1', 'Language', 'Carouse', 'Jack-of-all-Trades'],
    serviceSkills: ['Art', 'Carouse', 'Deception', 'Drive', 'Persuade', 'Steward'],
    advancedEducation: ['Advocate', 'Broker', 'Deception', 'Science', 'Streetwise', 'Diplomat'],
    advancedEducationMin: 10,
    specialist: {
      'Artist': ['Art', 'Carouse', 'Electronics (computers)', 'Gambler', 'Persuade', 'Profession'],
      'Journalist': ['Art (holography)', 'Electronics', 'Drive', 'Investigate', 'Recon', 'Streetwise'],
      'Performer': ['Art (performer)', 'Athletics', 'Carouse', 'Deception', 'Stealth', 'Streetwise'],
    },
  },
  ranks: {
    enlisted: [
      { title: '' },
      { title: '', skillBonus: 'Art' },
      { title: '' },
      { title: '', skillBonus: 'Investigate' },
      { title: '' },
      { title: 'Famous Artist', skillBonus: 'Social +1' },
      { title: '' },
    ],
    byAssignment: {
      'Artist': [
        { title: '' },
        { title: '', skillBonus: 'Art' },
        { title: '' },
        { title: '', skillBonus: 'Investigate' },
        { title: '' },
        { title: 'Famous Artist', skillBonus: 'Social +1' },
        { title: '' },
      ],
      'Journalist': [
        { title: '' },
        { title: 'Freelancer', skillBonus: 'Electronics (comms)' },
        { title: 'Staff Writer', skillBonus: 'Investigate' },
        { title: '' },
        { title: 'Correspondent', skillBonus: 'Persuade' },
        { title: '' },
        { title: 'Senior Correspondent', skillBonus: 'Social +1' },
      ],
      'Performer': [
        { title: '' },
        { title: '', skillBonus: 'Dexterity +1' },
        { title: '' },
        { title: '', skillBonus: 'Strength +1' },
        { title: '' },
        { title: 'Famous Performer', skillBonus: 'Social +1' },
        { title: '' },
      ],
    },
  },
  mishapTable: ENTERTAINER_MISHAPS,
  eventTable: ENTERTAINER_EVENTS,
};
