// ============================================================================
// PRE-CAREER EVENTS TABLE (2D6)
// ============================================================================

import type { StructuredEvent } from '../types';

export const PRE_CAREER_EVENTS: StructuredEvent[] = [
  // Result 2
  {
    description: "You are approached by an underground psionic group who sense potential in you. You may test your PSI and attempt to enter the Psion career in any subsequent term, but whether you accept or refuse their approaches, you gain them as an Enemy.",
    automaticOutcome: {
      enemies: 1,
      allowCareer: 'Psion',
      message: 'You may test your PSI and attempt to enter the Psion career in any subsequent term.'
    }
  },

  // Result 3
  {
    description: "A deep tragedy occurs. You fail to graduate and gain no benefits from this Pre-Career. You must leave this term and may not attempt another Pre-Career.",
    requiresChoice: {
      options: ['Gain a Contact', 'No Contact'],
      displayText: 'You may choose to gain a Contact.'
    },
    automaticOutcome: {
      message: 'You fail to graduate and gain no benefits from this Pre-Career. You must leave this term and may not attempt another Pre-Career.'
    }
  },

  // Result 4
  {
    description: "A supposedly harmless prank goes horribly wrong.",
    requiresRoll: {
      characteristic: 'social',
      target: 8,
      displayText: 'Roll SOC 8+ to avoid arrest'
    },
    successOutcome: {
      skills: ['Deception', 'Persuade', 'Contact'],
      chooseSkillCount: 1,
      skillLevel: 1,
      message: 'You talk your way out of trouble.'
    },
    failureOutcome: {
      forceCareer: 'Prisoner',
      message: 'You are arrested and imprisoned. You must enter the Prisoner career in your next term.'
    }
  },

  // Result 5
  {
    description: "Taking advantage of youth, you party as much as you study.",
    automaticOutcome: {
      skills: ['Carouse'],
      skillLevel: 1
    }
  },

  // Result 6
  {
    description: "You join a tightly knit group of fellow students who become lifelong friends.",
    automaticOutcome: {
      allies: 3, // Will need to roll D3 in implementation
      message: 'Gain D3 Allies on graduation.'
    }
  },

  // Result 7
  {
    description: "Life Event. Roll on the Life Events table (see page 50).",
    automaticOutcome: {
      message: 'Roll on the Life Events table.'
    }
  },

  // Result 8
  {
    description: "You become involved in a political movement.",
    requiresRoll: {
      characteristic: 'social',
      target: 8,
      displayText: 'Roll SOC 8+ to become a leader'
    },
    successOutcome: {
      allies: 1,
      skills: ['Admin', 'Advocate', 'Diplomat', 'Persuade'],
      chooseSkillCount: 1,
      skillLevel: 1,
      message: 'You become one of its leaders and gain an Ally within the movement.'
    },
    failureOutcome: {
      rivals: 1,
      skills: ['Admin', 'Advocate', 'Diplomat', 'Persuade'],
      chooseSkillCount: 1,
      skillLevel: 1,
      message: 'You are duped by the movement and gain a Rival instead.'
    }
  },

  // Result 9
  {
    description: "You develop a life-long interest in a hobby or other area of study.",
    automaticOutcome: {
      message: 'Gain any skill of your choice, but not one you already have, at level 0.'
    }
  },

  // Result 10
  {
    description: "Your time in education allows you to make a breakthrough in an established field of knowledge or study.",
    requiresSkillCheck: {
      minSkillLevel: 1,
      target: 9,
      displayText: 'Choose a non-combat skill you have at level 1+ and roll 9+ to increase it'
    },
    successOutcome: {
      message: 'You successfully make a breakthrough! The chosen skill increases by one level.'
    },
    failureOutcome: {
      message: 'Your research does not yield the breakthrough you hoped for.'
    }
  },

  // Result 11
  {
    description: "You are caught up in a widely unpopular and desperate draft to fight in an off-world war.",
    conditionalAvoidance: {
      characteristic: 'social',
      target: 9,
      displayText: 'If your SOC is 9+, you can avoid this entirely'
    },
    requiresChoice: {
      options: ['Flee to Drifter (gain Enemy)', 'Accept Draft (+2 DM, military only)'],
      displayText: 'Choose your response to the draft'
    },
    automaticOutcome: {
      message: 'You may flee to become a Drifter but gain an Enemy, or be drafted with +2 DM (military careers only).'
    }
  },

  // Result 12
  {
    description: "You gain wide recognition for your efforts, promoting your organisation or being particularly helpful within society.",
    automaticOutcome: {
      characteristic: { stat: 'social', modifier: 1 },
      message: 'Gain +1 DM to SOC (to a maximum of 12).'
    }
  },
];
