import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dices, User, Briefcase, Award, Save, ArrowRight, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCampaign } from '@/contexts/CampaignContext';
import { ALL_CAREERS, BACKGROUND_SKILLS, getPreCareerEvent, CAREER_PRISONER, rollInitialParoleThreshold, CAREER_PSION, performPsiTesting, PSIONIC_TALENTS, type PsiTestResult } from './careers';
import type { CareerDefinition, Characteristics, StructuredEvent, EventOutcome, GameEvent, EventEffects } from './careers';
import { isGameEvent } from './careers';
import { rollDraft, type DraftResult, getLifeEvent, getInjury, getUnusualEvent, rollAging, applyAgingEffects, type AgingRollResult } from './tables';
import { EventHandler } from './EventHandler';
import { rollDiceExpression, rollDice as rollDiceUtil } from './eventProcessor';
import { SpecialtySelector, needsSpecialtySelection, getBaseSkillName } from './SpecialtySelector';
import { MusteringOut } from './MusteringOut';

// ============================================================================
// TYPE DEFINITIONS (Component-specific)
// ============================================================================

interface SkillState {
  proficient: boolean;
  value: string;
  customLabel?: string;
}

interface TermRecord {
  termNumber: number;
  career: string;
  assignment: string;
  age: number;
  survivalRoll: string;
  survived: boolean;
  advancementRoll?: string;
  advanced: boolean;
  rank: number;
  rankTitle: string;
  event: string;
  skillsGained: string[];
  mishap?: string;
  isCommissioned?: boolean;
}

// Track each career served for mustering out benefits
interface CareerRecord {
  careerName: string;
  assignment: string;
  termsServed: number;
  highestRank: number;
  isCommissioned: boolean;
  benefitDM: number;         // Accumulated benefit DM from events in this career
  extraBenefitRolls: number; // Extra benefit rolls from events
  isPreCareer: boolean;      // Pre-careers don't get benefits
}

interface CharacteristicValue {
  total: number;
  current: number;
}

interface CharacterData {
  // Header info
  name: string;
  species: string;
  homeworld: string;
  age: number;

  // Characteristics
  characteristics: Characteristics;

  // Career info
  career: string;
  rank: number;
  terms_served: number;

  // Skills
  skills: Record<string, SkillState>;

  // Equipment
  weapons: any[];
  armor: any[];
  equipment: any[];
  augments: any[];

  // Finances
  cash_on_hand: number;
  credits: number;
  pension: number;
  debt: number;

  // Other
  notes: string;
  lifepath_log: TermRecord[];

  // Pre-career tracking
  hasCompletedPreCareer?: boolean;
  totalCareerTerms?: number; // Track total terms across all careers

  // Pre-career graduation bonuses for qualification rolls
  preCareerQualificationDM?: number; // DM bonus (+1 graduate, +2 honours)
  preCareerType?: 'university' | 'military_academy'; // Type of pre-career completed

  // Career history for benefit rolls
  careerHistory: CareerRecord[];

  // Benefit tracking
  shipShares: number;
  tasMembership: boolean;
  ships: string[];           // Ships owned (e.g., "Free Trader", "Scout Ship")
  cashBenefitRollsUsed: number;  // Track against max 3 cash rolls total

  // Connections (structured)
  allies: number;
  contacts: number;
  rivals: number;
  enemies: number;

  // Prisoner career tracking
  paroleThreshold?: number;       // Current parole threshold (starts at 1D+2)
  forcedCareer?: string;          // Career that must be taken next term
  prisonerSurvivalDM?: number;    // DM to survival rolls from gang membership, etc.

  // Psionic tracking
  psiTested?: boolean;            // Whether PSI has been tested
  psiTalents?: string[];          // Acquired psionic talents
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const rollDice = (dice: number = 2, sides: number = 6): number => {
  let total = 0;
  for (let i = 0; i < dice; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

const getDM = (value: number): number => {
  if (value >= 15) return 3;
  if (value >= 12) return 2;
  if (value >= 9) return 1;
  if (value >= 6) return 0;
  if (value >= 3) return -1;
  if (value >= 1) return -2;
  return -3;
};

const getDMDisplay = (value: number): string => {
  const dm = getDM(value);
  return dm >= 0 ? `+${dm}` : dm.toString();
};

/**
 * Calculate the number of benefit rolls for a career based on terms and rank.
 * Rules:
 * - 1 benefit roll per term served in that career
 * - Rank bonus: Rank 1-2: +1 roll, Rank 3-4: +2 rolls, Rank 5-6: +3 rolls
 * - Rank 5-6 also grants DM+1 to ALL benefit rolls
 */
const calculateBenefitRolls = (termsServed: number, highestRank: number, extraRolls: number = 0): { rolls: number; rankDM: number } => {
  let rolls = termsServed;
  let rankDM = 0;

  // Rank bonus for benefit rolls
  if (highestRank >= 5) {
    rolls += 3;
    rankDM = 1; // Rank 5-6 grants DM+1 to all benefit rolls
  } else if (highestRank >= 3) {
    rolls += 2;
  } else if (highestRank >= 1) {
    rolls += 1;
  }

  // Add extra benefit rolls from events
  rolls += extraRolls;

  return { rolls, rankDM };
};

const createEmptyCharacteristics = (): Characteristics => ({
  strength: { total: 7, current: 7 },
  dexterity: { total: 7, current: 7 },
  endurance: { total: 7, current: 7 },
  intellect: { total: 7, current: 7 },
  education: { total: 7, current: 7 },
  social: { total: 7, current: 7 },
  psionics: { total: 0, current: 0 },
});

const createBaseSkills = (): Record<string, SkillState> => {
  const skills: Record<string, SkillState> = {};

  // Initialize all background skills as not proficient
  BACKGROUND_SKILLS.forEach(skill => {
    const key = skill.toLowerCase().replace(/ /g, '_');
    skills[key] = { proficient: false, value: '0' };
  });

  return skills;
};

const normalizeSkillName = (skillName: string): string => {
  return skillName.toLowerCase().replace(/ /g, '_');
};

const parseSkillGain = (skillText: string): { skill: string; isStat: boolean; stat?: keyof Omit<Characteristics, 'psionics'> } => {
  // Check if it's a stat increase (e.g., "Dexterity +1")
  const statMatch = skillText.match(/(Strength|Dexterity|Endurance|Intellect|Education|Social)\s*\+1/i);
  if (statMatch) {
    const statName = statMatch[1].toLowerCase() as keyof Omit<Characteristics, 'psionics'>;
    return { skill: skillText, isStat: true, stat: statName };
  }

  return { skill: skillText, isStat: false };
};

// Helper to get event description text (handles string, StructuredEvent, and GameEvent)
const getEventDescription = (event: string | StructuredEvent | GameEvent): string => {
  if (typeof event === 'string') {
    return event;
  }
  return event.description;
};

// Helper to get mishap description text (handles both string and GameEvent)
const getMishapDescription = (mishap: string | GameEvent): string => {
  if (typeof mishap === 'string') {
    return mishap;
  }
  return mishap.description;
};

// Helper to get the appropriate rank array for a career
const getRanksForCareer = (
  career: CareerDefinition | null,
  isCommissioned: boolean,
  assignmentName?: string
): import('./careers/types').Rank[] => {
  if (!career) return [];

  // Check for assignment-specific ranks (e.g., Drifter)
  if (career.ranks.byAssignment && assignmentName && career.ranks.byAssignment[assignmentName]) {
    return career.ranks.byAssignment[assignmentName];
  }

  // Fall back to officer ranks if commissioned, or enlisted ranks
  if (isCommissioned && career.ranks.officer) {
    return career.ranks.officer;
  }

  return career.ranks.enlisted;
};

// Helper to get rank title for a career
const getRankTitle = (
  career: CareerDefinition | null,
  rank: number,
  isCommissioned: boolean,
  assignmentName?: string
): string => {
  if (!career) return `Rank ${rank}`;

  // For pre-careers, always use enlisted ranks (Student/Cadet)
  if (career.isPreCareer) {
    return career.ranks.enlisted[0]?.title || 'Student';
  }

  const ranks = getRanksForCareer(career, isCommissioned, assignmentName);
  return ranks[rank]?.title || `Rank ${rank}`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CharacterGenerator: React.FC = () => {
  const { saveCharacter } = useCampaign();
  const [step, setStep] = useState(1);
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    species: 'Human',
    homeworld: '',
    age: 18,
    characteristics: createEmptyCharacteristics(),
    career: '',
    rank: 0,
    terms_served: 0,
    skills: createBaseSkills(),
    weapons: [],
    armor: [],
    equipment: [],
    augments: [],
    cash_on_hand: 0,
    credits: 0,
    pension: 0,
    debt: 0,
    notes: '',
    lifepath_log: [],
    hasCompletedPreCareer: false,
    totalCareerTerms: 0,
    preCareerQualificationDM: 0,
    preCareerType: undefined,
    // Career history for benefits
    careerHistory: [],
    // Benefit tracking
    shipShares: 0,
    tasMembership: false,
    ships: [],
    cashBenefitRollsUsed: 0,
    // Connections
    allies: 0,
    contacts: 0,
    rivals: 0,
    enemies: 0,
    // Prisoner tracking
    paroleThreshold: undefined,
    forcedCareer: undefined,
    prisonerSurvivalDM: 0,
    // Psionic tracking
    psiTested: false,
    psiTalents: [],
  });

  // Psionic testing state
  const [psiTestResult, setPsiTestResult] = useState<PsiTestResult | null>(null);
  const [showPsiTesting, setShowPsiTesting] = useState(false);

  const [characteristicRolls, setCharacteristicRolls] = useState<number[]>([]);
  const [hasRolled, setHasRolled] = useState(false);
  const [selectedRollIndex, setSelectedRollIndex] = useState<number | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual'>('auto');
  const [backgroundSkillsRemaining, setBackgroundSkillsRemaining] = useState(0);
  const [selectedCareer, setSelectedCareer] = useState<CareerDefinition | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<number>(0);
  const [qualificationPassed, setQualificationPassed] = useState<boolean | null>(null);
  const [qualificationRollLog, setQualificationRollLog] = useState<string>('');
  const [currentTerm, setCurrentTerm] = useState(0);
  const [isInTerm, setIsInTerm] = useState(false);
  const [termSurvived, setTermSurvived] = useState<boolean | null>(null);
  const [termAdvanced, setTermAdvanced] = useState<boolean | null>(null);
  const [termEventRoll, setTermEventRoll] = useState<number | null>(null);
  const [termSkillsGained, setTermSkillsGained] = useState<string[]>([]);
  const [isCommissioned, setIsCommissioned] = useState(false);
  const [preCareerGraduated, setPreCareerGraduated] = useState<boolean>(false);
  const [preCareerFailedService, setPreCareerFailedService] = useState<string | null>(null); // For Military Academy auto-entry
  const [universitySkillLevel0, setUniversitySkillLevel0] = useState<string | null>(null);
  const [universitySkillLevel1, setUniversitySkillLevel1] = useState<string | null>(null);
  // Pending specialty selection for university skills (0 = level 0 skill, 1 = level 1 skill)
  const [universityPendingSpecialty, setUniversityPendingSpecialty] = useState<0 | 1 | null>(null);
  const [universityBaseSkillSelected, setUniversityBaseSkillSelected] = useState<string | null>(null);
  const [militaryAcademyService, setMilitaryAcademyService] = useState<string | null>(null); // 'Army', 'Navy', or 'Marines'
  // Military Academy graduation skill selection (select 3 service skills to increase to level 1)
  const [academyGradSkillsSelected, setAcademyGradSkillsSelected] = useState<string[]>([]);
  const [academyGradPendingSpecialty, setAcademyGradPendingSpecialty] = useState<string | null>(null);
  const [showMishapTable, setShowMishapTable] = useState(false);
  const [showEventTable, setShowEventTable] = useState(false);
  const [graduatedWithHonours, setGraduatedWithHonours] = useState(false);
  const [needsCommissionRoll, setNeedsCommissionRoll] = useState(false);
  const [commissionRollDM, setCommissionRollDM] = useState(0);
  const [graduationRollLog, setGraduationRollLog] = useState<string>('');
  const [survivalRollLog, setSurvivalRollLog] = useState<string>('');
  const [advancementRollLog, setAdvancementRollLog] = useState<string>('');

  // Event handling state (legacy - for StructuredEvent)
  const [currentEvent, setCurrentEvent] = useState<StructuredEvent | null>(null);
  const [eventRollResult, setEventRollResult] = useState<{roll: number, dm: number, total: number} | null>(null);
  const [eventResolved, setEventResolved] = useState<boolean>(false);
  const [eventOutcomeApplied, setEventOutcomeApplied] = useState<boolean>(false);

  // New GameEvent system state
  const [currentGameEvent, setCurrentGameEvent] = useState<GameEvent | null>(null);
  const [gameEventCompleted, setGameEventCompleted] = useState<boolean>(false);

  // Table redirect state - for handling nested table rolls (Life Events -> Injury, etc.)
  const [redirectedEvent, setRedirectedEvent] = useState<GameEvent | null>(null);
  const [redirectTableRoll, setRedirectTableRoll] = useState<number | null>(null);
  const [redirectTableName, setRedirectTableName] = useState<string | null>(null);

  // Draft system state
  const [hasUsedDraft, setHasUsedDraft] = useState(false);
  const [draftRolled, setDraftRolled] = useState(false);

  // Basic Training state
  const [basicTrainingApplied, setBasicTrainingApplied] = useState(false);
  const [basicTrainingSkillSelected, setBasicTrainingSkillSelected] = useState<string | null>(null);

  // Specialty selection state - for skills with specialties that need user choice
  const [pendingSpecialtySkill, setPendingSpecialtySkill] = useState<string | null>(null);
  const [pendingSpecialtySource, setPendingSpecialtySource] = useState<string>(''); // For logging purposes

  // End-of-term skill selection state
  const [termSkillSelected, setTermSkillSelected] = useState<boolean>(false);
  const [expandedSkillTable, setExpandedSkillTable] = useState<string | null>(null);
  const [skillTableRollResult, setSkillTableRollResult] = useState<number | null>(null);

  // Event DM bonuses state - track bonuses granted by events for next roll
  const [eventAdvancementDM, setEventAdvancementDM] = useState<number>(0);
  const [eventBenefitDM, setEventBenefitDM] = useState<number>(0);
  const [extraBenefitRolls, setExtraBenefitRolls] = useState<number>(0);

  // Mustering out state
  const [isMusteringOut, setIsMusteringOut] = useState(false);

  // Aging state
  const [agingResult, setAgingResult] = useState<AgingRollResult | null>(null);
  const [agingPending, setAgingPending] = useState(false);

  // Assignment switching state
  const [isSwitchingAssignment, setIsSwitchingAssignment] = useState(false);
  const [switchAssignmentTarget, setSwitchAssignmentTarget] = useState<number | null>(null);
  const [switchAssignmentRollLog, setSwitchAssignmentRollLog] = useState<string>('');
  const [switchAssignmentResult, setSwitchAssignmentResult] = useState<'success' | 'failure' | null>(null);

  // Get available careers based on current term number
  const getAvailableCareers = (): CareerDefinition[] => {
    const totalTerms = characterData.totalCareerTerms || 0;

    // If character has a forced career (e.g., arrested -> Prisoner), only that career is available
    if (characterData.forcedCareer) {
      if (characterData.forcedCareer === 'Prisoner') {
        return [CAREER_PRISONER];
      }
      // For other forced careers, find in ALL_CAREERS
      const forcedCareer = ALL_CAREERS.find(c => c.name === characterData.forcedCareer);
      if (forcedCareer) {
        return [forcedCareer];
      }
    }

    return ALL_CAREERS.filter(career => {
      // Pre-careers are only available for first 3 terms
      if (career.isPreCareer) {
        // Can't take pre-career if already completed one
        if (characterData.hasCompletedPreCareer) return false;
        // Only available for terms 1-3
        return totalTerms < 3;
      }
      // Psion career requires PSI testing and PSI > 0
      if (career.requiresPsiTesting) {
        if (!characterData.psiTested) return false;
        if ((characterData.characteristics.psionics?.total || 0) === 0) return false;
      }
      // Regular careers always available
      return true;
    });
  };

  // Get qualification DM for pre-careers based on term number
  const getPreCareerDM = (career: CareerDefinition): number => {
    if (!career.isPreCareer) return 0;

    const totalTerms = characterData.totalCareerTerms || 0;

    if (career.preCareerType === 'university') {
      // University: Term 1: +0, Term 2: -1, Term 3: -2
      if (totalTerms === 0) return 0;
      if (totalTerms === 1) return -1;
      if (totalTerms === 2) return -2;
    } else if (career.preCareerType === 'military_academy') {
      // Military Academy: Term 1: +0, Term 2: -2, Term 3: -4
      if (totalTerms === 0) return 0;
      if (totalTerms === 1) return -2;
      if (totalTerms === 2) return -4;
    }

    return 0;
  };

  // ============================================================================
  // STEP 1: BASIC INFO
  // ============================================================================

  const handleNameChange = (name: string) => {
    setCharacterData(prev => ({ ...prev, name }));
  };

  const handleSpeciesChange = (species: string) => {
    setCharacterData(prev => ({ ...prev, species }));
  };

  const handleHomeworldChange = (homeworld: string) => {
    setCharacterData(prev => ({ ...prev, homeworld }));
  };

  // ============================================================================
  // STEP 2: CHARACTERISTICS
  // ============================================================================

  const rollAllCharacteristics = () => {
    const rolls: number[] = [];
    for (let i = 0; i < 6; i++) {
      rolls.push(rollDice(2, 6));
    }
    setCharacteristicRolls(rolls);
    setHasRolled(true);
    setAssignmentMode('auto');
  };

  const rollForManualAssignment = () => {
    const rolls: number[] = [];
    for (let i = 0; i < 6; i++) {
      rolls.push(rollDice(2, 6));
    }
    setCharacteristicRolls(rolls);
    setHasRolled(true);
    setAssignmentMode('manual');
  };

  const rollSingleCharacteristic = (key: keyof Omit<Characteristics, 'psionics'>) => {
    const roll = rollDice(2, 6);
    setCharacterData(prev => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [key]: { total: roll, current: roll },
      },
    }));

    // Recalculate background skills if education changed
    if (key === 'education') {
      const eduDM = getDM(roll);
      setBackgroundSkillsRemaining(Math.max(0, eduDM + 3));
    }
  };

  const manuallySetCharacteristic = (key: keyof Omit<Characteristics, 'psionics'>, value: number) => {
    setCharacterData(prev => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [key]: { total: value, current: value },
      },
    }));

    // Recalculate background skills if education changed
    if (key === 'education') {
      const eduDM = getDM(value);
      setBackgroundSkillsRemaining(Math.max(0, eduDM + 3));
    }
  };

  const assignRollToCharacteristic = (key: keyof Omit<Characteristics, 'psionics'>) => {
    if (selectedRollIndex === null || !characteristicRolls[selectedRollIndex]) return;

    const rollValue = characteristicRolls[selectedRollIndex];

    setCharacterData(prev => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [key]: { total: rollValue, current: rollValue },
      },
    }));

    // Remove the used roll
    setCharacteristicRolls(prev => prev.filter((_, idx) => idx !== selectedRollIndex));
    setSelectedRollIndex(null);

    // Check if all rolls are assigned
    if (characteristicRolls.length === 1) {
      // Last roll assigned, calculate background skills
      const eduValue = key === 'education' ? rollValue : characterData.characteristics.education.total;
      const eduDM = getDM(eduValue);
      setBackgroundSkillsRemaining(Math.max(0, eduDM + 3));
    }
  };

  const assignRolls = () => {
    if (characteristicRolls.length !== 6) return;

    const newChars = createEmptyCharacteristics();
    const charKeys: Array<keyof Omit<Characteristics, 'psionics'>> = [
      'strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'
    ];

    characteristicRolls.forEach((roll, index) => {
      const key = charKeys[index];
      newChars[key] = { total: roll, current: roll };
    });

    setCharacterData(prev => ({
      ...prev,
      characteristics: newChars,
    }));

    // Calculate background skills (EDU DM + 3)
    const eduDM = getDM(newChars.education.total);
    setBackgroundSkillsRemaining(Math.max(0, eduDM + 3));
  };

  const rerollCharacteristics = () => {
    setCharacteristicRolls([]);
    setHasRolled(false);
    setSelectedRollIndex(null);
    setAssignmentMode('auto');
    setCharacterData(prev => ({
      ...prev,
      characteristics: createEmptyCharacteristics(),
    }));
    setBackgroundSkillsRemaining(0);
  };

  // ============================================================================
  // STEP 3: BACKGROUND SKILLS
  // ============================================================================

  const selectBackgroundSkill = (skillKey: string) => {
    if (backgroundSkillsRemaining <= 0) return;

    setCharacterData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillKey]: { proficient: true, value: '0' },
      },
    }));

    setBackgroundSkillsRemaining(prev => prev - 1);
  };

  // ============================================================================
  // STEP 4: CAREER SELECTION
  // ============================================================================

  const attemptQualification = () => {
    if (!selectedCareer) return;

    // Check for automatic entry from failed Military Academy
    if (preCareerFailedService && selectedCareer.name === preCareerFailedService) {
      setQualificationPassed(true);
      setQualificationRollLog(`Automatic entry from Military Academy graduation failure.`);
      setCharacterData(prev => ({
        ...prev,
        career: selectedCareer.name,
        notes: prev.notes + `\nAutomatic entry to ${selectedCareer.name} (Military Academy)`,
      }));
      setPreCareerFailedService(null); // Clear the automatic entry flag
      return;
    }

    // Check for automatic qualification (e.g., Drifter)
    if (selectedCareer.automaticQualification) {
      setQualificationPassed(true);
      setQualificationRollLog('Automatic qualification - no roll required.');
      setCharacterData(prev => ({
        ...prev,
        career: selectedCareer.name,
        notes: prev.notes + `\nEntered ${selectedCareer.name} (automatic qualification)`,
      }));
      return;
    }

    const charValue = characterData.characteristics[selectedCareer.qualificationStat].total;
    let dm = getDM(charValue);
    let dmDetails: string[] = [`Char DM ${getDM(charValue)}`];

    // Apply pre-career DM based on term number (for pre-career re-entry)
    const preCareerDM = getPreCareerDM(selectedCareer);
    if (preCareerDM !== 0) {
      dm += preCareerDM;
      dmDetails.push(`Term DM ${preCareerDM}`);
    }

    // Apply SOC bonus for University entry
    if (selectedCareer.preCareerType === 'university' && characterData.characteristics.social.total >= 9) {
      dm += 1;
      dmDetails.push('SOC 9+ DM +1');
    }

    // Apply pre-career graduation DM for eligible careers
    // University graduates: +1 (or +2 for honours) to Agent, Army, Citizen, Entertainer, Marines, Navy, Scholar, Scout
    const universityEligibleCareers = ['Agent', 'Army', 'Citizen', 'Entertainer', 'Marines', 'Navy', 'Scholar', 'Scout'];
    if (characterData.preCareerQualificationDM && characterData.preCareerQualificationDM > 0 &&
        characterData.preCareerType === 'university' &&
        universityEligibleCareers.includes(selectedCareer.name)) {
      dm += characterData.preCareerQualificationDM;
      const honoursText = characterData.preCareerQualificationDM >= 2 ? 'Honours ' : '';
      dmDetails.push(`University ${honoursText}Graduate DM +${characterData.preCareerQualificationDM}`);
    }

    const roll = rollDice(2, 6);
    const total = roll + dm;
    const passed = total >= selectedCareer.qualificationTarget;

    setQualificationPassed(passed);
    const dmBreakdown = `Roll: ${roll} + ${dmDetails.join(' + ')} = ${total} (need ${selectedCareer.qualificationTarget}+)`;
    setQualificationRollLog(dmBreakdown);

    if (passed) {
      setCharacterData(prev => ({
        ...prev,
        career: selectedCareer.name,
        notes: prev.notes + `\nQualified for ${selectedCareer.name}: ${roll} + ${dm} = ${total}`,
        // Note: totalCareerTerms is incremented in completeTerm(), not here
      }));
    }
  };

  const resetQualification = () => {
    setQualificationPassed(null);
    setQualificationRollLog('');
    setDraftRolled(false);
    setBasicTrainingApplied(false);
    setBasicTrainingSkillSelected(null);
  };

  // ============================================================================
  // DRAFT SYSTEM
  // ============================================================================

  const enterDraft = () => {
    if (hasUsedDraft) {
      alert('You have already used your draft. You must become a Drifter.');
      return;
    }

    const draftResult: DraftResult = rollDraft();
    setHasUsedDraft(true);
    setDraftRolled(true);

    // Find the career
    const career = ALL_CAREERS.find(c => c.name === draftResult.careerName);
    if (!career) {
      console.error(`Draft career not found: ${draftResult.careerName}`);
      return;
    }

    // Set the career
    setSelectedCareer(career);

    // Set the assignment (specific or first one if "any")
    if (draftResult.assignmentName) {
      const assignmentIndex = career.assignments.findIndex(a => a.name === draftResult.assignmentName);
      setSelectedAssignment(assignmentIndex >= 0 ? assignmentIndex : 0);
      setQualificationRollLog(`Drafted into ${career.name} (${draftResult.assignmentName}). Automatically qualified.`);
    } else {
      setSelectedAssignment(0);
      setQualificationRollLog(`Drafted into ${career.name}. Automatically qualified. Choose your assignment.`);
    }

    // Automatically pass qualification
    setQualificationPassed(true);

    setCharacterData(prev => ({
      ...prev,
      career: career.name,
      notes: prev.notes + `\nDrafted into ${career.name}`,
    }));
  };

  const becomeDrifter = () => {
    // Find the Drifter career
    const drifterCareer = ALL_CAREERS.find(c => c.name === 'Drifter');
    if (!drifterCareer) {
      console.error('Drifter career not found');
      return;
    }

    // Set the career
    setSelectedCareer(drifterCareer);

    // Default to first assignment, user can change it
    setSelectedAssignment(0);
    setQualificationRollLog('Became a Drifter. Automatic qualification - no roll required. Choose your assignment.');

    // Automatically pass qualification (Drifter has automatic qualification)
    setQualificationPassed(true);

    setCharacterData(prev => ({
      ...prev,
      career: drifterCareer.name,
      notes: prev.notes + '\nBecame a Drifter (failed career qualification)',
    }));
  };

  // Enter prisoner career (forced entry only)
  const becomePrisoner = () => {
    // Set the career
    setSelectedCareer(CAREER_PRISONER);

    // Default to first assignment (Inmate)
    setSelectedAssignment(0);

    // Roll initial parole threshold (1D+2, max 12)
    const parole = rollInitialParoleThreshold();

    setQualificationRollLog(`Sentenced to prison. Initial Parole Threshold: ${parole}. Choose your assignment.`);

    // Automatically pass qualification (Prisoner has automatic entry when forced)
    setQualificationPassed(true);

    setCharacterData(prev => ({
      ...prev,
      career: 'Prisoner',
      paroleThreshold: parole,
      forcedCareer: undefined, // Clear the forced career flag
      notes: prev.notes + `\nSentenced to prison (Parole Threshold: ${parole})`,
    }));
  };

  // Perform PSI testing
  const performPsiTest = () => {
    // Test for all five talents
    const result = performPsiTesting(characterData.age, [...PSIONIC_TALENTS]);
    setPsiTestResult(result);

    // Update character with PSI value and acquired talents
    const acquiredTalents = result.talentsTested
      .filter(t => t.acquired)
      .map(t => t.talent);

    setCharacterData(prev => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        psionics: { total: result.psiValue, current: result.psiValue },
      },
      psiTested: true,
      psiTalents: acquiredTalents,
      notes: prev.notes + `\n${result.message}`,
    }));

    setShowPsiTesting(false);
  };

  // ============================================================================
  // BASIC TRAINING SYSTEM
  // ============================================================================

  const applyBasicTraining = () => {
    if (!selectedCareer || basicTrainingApplied) return;

    const totalTerms = characterData.totalCareerTerms || 0;
    const isFirstCareer = totalTerms === 0;

    // Determine which skills to use (Service Skills for most, Assignment Skills for Citizen/Drifter)
    const useAssignmentSkills = selectedCareer.name === 'Citizen' || selectedCareer.name === 'Drifter';
    let skillList: string[];

    if (useAssignmentSkills) {
      // Use assignment skills
      const assignmentName = selectedCareer.assignments[selectedAssignment].name;
      skillList = selectedCareer.skillTables.specialist[assignmentName] || [];
    } else {
      // Use service skills
      skillList = selectedCareer.skillTables.serviceSkills;
    }

    if (isFirstCareer) {
      // First career: gain all service/assignment skills at level 0
      skillList.forEach(skill => {
        const skillKey = normalizeSkillName(skill);
        setCharacterData(prev => ({
          ...prev,
          skills: {
            ...prev.skills,
            [skillKey]: { proficient: true, value: '0' },
          },
        }));
      });

      setCharacterData(prev => ({
        ...prev,
        notes: prev.notes + `\nBasic Training (${selectedCareer.name}): All ${useAssignmentSkills ? 'assignment' : 'service'} skills at level 0`,
      }));

      setBasicTrainingApplied(true);
    }
    // For subsequent careers, we'll show a UI to pick one skill (handled in render)
  };

  const selectBasicTrainingSkill = (skillName: string) => {
    if (!selectedCareer || basicTrainingApplied) return;

    const skillKey = normalizeSkillName(skillName);
    setCharacterData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillKey]: { proficient: true, value: '0' },
      },
      notes: prev.notes + `\nBasic Training (${selectedCareer.name}): ${skillName} at level 0`,
    }));

    setBasicTrainingSkillSelected(skillName);
    setBasicTrainingApplied(true);
  };

  // ============================================================================
  // PRE-CAREER ENTRY BENEFITS
  // ============================================================================

  const applyPreCareerEntryBenefits = () => {
    if (!selectedCareer) return;

    if (selectedCareer.preCareerType === 'university' && universitySkillLevel0 && universitySkillLevel1) {
      // Apply University entry benefits
      const skill0Key = normalizeSkillName(universitySkillLevel0);
      const skill1Key = normalizeSkillName(universitySkillLevel1);

      setCharacterData(prev => ({
        ...prev,
        // Apply EDU +1
        characteristics: {
          ...prev.characteristics,
          education: {
            total: prev.characteristics.education.total + 1,
            current: prev.characteristics.education.current + 1,
          },
        },
        // Apply skills
        skills: {
          ...prev.skills,
          [skill0Key]: { proficient: true, value: '0' },
          [skill1Key]: { proficient: true, value: '1' },
        },
        notes: prev.notes + `\nUniversity Entry: ${universitySkillLevel0} 0, ${universitySkillLevel1} 1, EDU +1`,
      }));
    } else if (selectedCareer.preCareerType === 'military_academy' && militaryAcademyService) {
      // Apply Military Academy entry benefits - get all Service Skills at Level 0
      const serviceCareer = ALL_CAREERS.find(c => c.name === militaryAcademyService);
      if (serviceCareer) {
        const newSkills: Record<string, SkillState> = {};
        serviceCareer.skillTables.serviceSkills.forEach(skillName => {
          const skillKey = normalizeSkillName(skillName);
          newSkills[skillKey] = { proficient: true, value: '0' };
        });

        setCharacterData(prev => ({
          ...prev,
          skills: {
            ...prev.skills,
            ...newSkills,
          },
          notes: prev.notes + `\nMilitary Academy Entry (${militaryAcademyService}): All Service Skills at Level 0`,
        }));
      }
    }
  };

  // ============================================================================
  // UNIVERSITY SKILL SELECTION HANDLERS
  // ============================================================================

  // Handle when a base skill is selected from the University dropdown
  const handleUniversitySkillSelect = (skillName: string, level: 0 | 1) => {
    if (!skillName) {
      // Clear the selection
      if (level === 0) {
        setUniversitySkillLevel0(null);
      } else {
        setUniversitySkillLevel1(null);
      }
      return;
    }

    // Level 0 skills don't require specialty selection - just get the base skill
    // Only level 1+ skills require choosing a specialty
    if (level >= 1 && needsSpecialtySelection(skillName)) {
      // Store the base skill and show specialty selector
      setUniversityBaseSkillSelected(skillName);
      setUniversityPendingSpecialty(level);
    } else {
      // Skill doesn't need specialty (or is level 0), set directly
      if (level === 0) {
        setUniversitySkillLevel0(skillName);
      } else {
        setUniversitySkillLevel1(skillName);
      }
    }
  };

  // Handle when a specialty is selected for a University skill
  const handleUniversitySpecialtySelected = (fullSkillName: string) => {
    if (universityPendingSpecialty === 0) {
      setUniversitySkillLevel0(fullSkillName);
    } else if (universityPendingSpecialty === 1) {
      setUniversitySkillLevel1(fullSkillName);
    }
    // Clear pending state
    setUniversityPendingSpecialty(null);
    setUniversityBaseSkillSelected(null);
  };

  // Cancel specialty selection and clear the base skill
  const cancelUniversitySpecialtySelection = () => {
    setUniversityPendingSpecialty(null);
    setUniversityBaseSkillSelected(null);
  };

  // ============================================================================
  // MILITARY ACADEMY GRADUATION SKILL HANDLERS
  // ============================================================================

  // Get the service skills for the selected military academy branch
  const getAcademyServiceSkills = (): string[] => {
    if (!militaryAcademyService) return [];
    const serviceCareer = ALL_CAREERS.find(c => c.name === militaryAcademyService);
    return serviceCareer?.skillTables.serviceSkills || [];
  };

  // Handle selecting a skill for Military Academy graduation (level 1 increase)
  const handleAcademyGradSkillSelect = (skillName: string) => {
    // Check if already selected 3 skills
    if (academyGradSkillsSelected.length >= 3) return;
    // Check if this skill is already selected
    if (academyGradSkillsSelected.some(s => s === skillName || s.startsWith(skillName + ' ('))) return;

    // Check if skill needs specialty selection
    if (needsSpecialtySelection(skillName)) {
      setAcademyGradPendingSpecialty(skillName);
    } else {
      // Add directly
      setAcademyGradSkillsSelected(prev => [...prev, skillName]);
    }
  };

  // Handle specialty selection for academy graduation skill
  const handleAcademyGradSpecialtySelected = (fullSkillName: string) => {
    setAcademyGradSkillsSelected(prev => [...prev, fullSkillName]);
    setAcademyGradPendingSpecialty(null);
  };

  // Cancel academy graduation specialty selection
  const cancelAcademyGradSpecialtySelection = () => {
    setAcademyGradPendingSpecialty(null);
  };

  // Remove a selected academy graduation skill
  const removeAcademyGradSkill = (skillName: string) => {
    setAcademyGradSkillsSelected(prev => prev.filter(s => s !== skillName));
  };

  // Apply the selected academy graduation skills (increase to level 1)
  const applyAcademyGradSkills = () => {
    if (academyGradSkillsSelected.length !== 3) return;

    academyGradSkillsSelected.forEach(skillName => {
      const skillKey = normalizeSkillName(skillName);
      setCharacterData(prev => {
        const currentValue = parseInt(prev.skills[skillKey]?.value || '0');
        return {
          ...prev,
          skills: {
            ...prev.skills,
            [skillKey]: { proficient: true, value: String(Math.max(currentValue, 1)) },
          },
        };
      });
    });

    setTermSkillsGained(prev => [
      ...prev.filter(s => s !== 'Select 3 Service Skills to increase to Level 1'),
      ...academyGradSkillsSelected.map(s => `${s} 1 (Academy Graduation)`)
    ]);
  };

  // ============================================================================
  // STEP 5: TERM MANAGEMENT
  // ============================================================================

  const startNewTerm = () => {
    const newTermNumber = currentTerm + 1;
    setCurrentTerm(newTermNumber);
    setIsInTerm(true);
    setTermSurvived(null);
    setTermAdvanced(null);
    setTermEventRoll(null);
    setTermSkillsGained([]);
    setGraduationRollLog('');
    setSurvivalRollLog('');
    setAdvancementRollLog('');
    setCurrentEvent(null);
    setEventRollResult(null);
    setEventResolved(false);
    setEventOutcomeApplied(false);
    setPendingSpecialtySkill(null);
    setPendingSpecialtySource('');
    // Reset end-of-term skill selection state
    setTermSkillSelected(false);
    setExpandedSkillTable(null);
    setSkillTableRollResult(null);
    // Reset academy graduation skill selection state
    setAcademyGradSkillsSelected([]);
    setAcademyGradPendingSpecialty(null);
    // Reset assignment switching state
    setIsSwitchingAssignment(false);
    setSwitchAssignmentTarget(null);
    setSwitchAssignmentRollLog('');
    setSwitchAssignmentResult(null);

    // Calculate age based on TOTAL terms completed across all careers
    // lifepath_log contains one entry per completed term
    const totalTermsCompleted = characterData.lifepath_log.length;
    const newAge = 18 + (totalTermsCompleted + 1) * 4;
    setCharacterData(prev => ({
      ...prev,
      age: newAge,
    }));

    // Apply basic training (first career: all skills, later: need to choose one)
    const totalTerms = characterData.totalCareerTerms || 0;
    const isFirstCareer = totalTerms === 0;

    if (isFirstCareer && !basicTrainingApplied) {
      // Automatically apply all skills for first career
      applyBasicTraining();
    }
    // For subsequent careers, UI will show skill selection (handled in render)
  };

  const runSurvivalCheck = () => {
    if (!selectedCareer || termSurvived !== null) return;

    const assignment = selectedCareer.assignments[selectedAssignment];
    const charValue = characterData.characteristics[assignment.survivalStat].total;
    let dm = getDM(charValue);

    // For pre-careers, this is actually a GRADUATION check
    const isPreCareer = selectedCareer.isPreCareer || false;

    // Add special DMs for Military Academy graduation
    if (isPreCareer && selectedCareer.preCareerType === 'military_academy') {
      // DM+1 if END 8+
      if (characterData.characteristics.endurance.total >= 8) {
        dm += 1;
      }
      // DM+1 if SOC 8+
      if (characterData.characteristics.social.total >= 8) {
        dm += 1;
      }
    }

    const roll = rollDice(2, 6);
    const total = roll + dm;
    const survived = total >= assignment.survivalTarget;

    setTermSurvived(survived);

    // Set survival/graduation roll log for regular careers
    if (!isPreCareer) {
      setSurvivalRollLog(`Survival Roll: ${roll} + ${dm} = ${total} (need ${assignment.survivalTarget}+)`);
    }

    if (!survived) {
      // For pre-careers, handle graduation failure differently
      if (isPreCareer) {
        const ranks = selectedCareer.ranks.enlisted;
        const mishapEntry = selectedCareer.mishapTable[0];
        const mishap = mishapEntry ? getMishapDescription(mishapEntry) : 'Failed to graduate.';
        let event = `FAILED GRADUATION: ${mishap}`;

        // Military Academy: if roll wasn't 2 or less, gain automatic entry to tied service
        if (selectedCareer.preCareerType === 'military_academy' && roll > 2) {
          // Extract service type from assignment name
          const assignmentName = assignment.name.toLowerCase();
          if (assignmentName.includes('army')) {
            setPreCareerFailedService('Army');
            event += ' (Gained automatic entry to Army)';
          } else if (assignmentName.includes('marine')) {
            setPreCareerFailedService('Marines');
            event += ' (Gained automatic entry to Marines)';
          } else if (assignmentName.includes('navy')) {
            setPreCareerFailedService('Navy');
            event += ' (Gained automatic entry to Navy)';
          }
        }

        const termRecord: TermRecord = {
          termNumber: currentTerm,
          career: selectedCareer.name,
          assignment: assignment.name,
          age: characterData.age,
          survivalRoll: `${roll} + ${dm} = ${total} (need ${assignment.survivalTarget}+) - Graduation Roll`,
          survived: false,
          advanced: false,
          rank: characterData.rank,
          rankTitle: ranks[characterData.rank]?.title || 'Student',
          event,
          skillsGained: [],
          mishap,
        };

        setCharacterData(prev => ({
          ...prev,
          lifepath_log: [...prev.lifepath_log, termRecord],
          terms_served: currentTerm,
        }));
      } else {
        // Regular career mishap
        const mishapRoll = rollDice(1, 6);
        const mishapEntry = selectedCareer.mishapTable[mishapRoll - 1];
        const mishap = mishapEntry ? getMishapDescription(mishapEntry) : 'Injured. Roll on the Injury table.';

        const ranks = getRanksForCareer(selectedCareer, isCommissioned, assignment.name);

        const termRecord: TermRecord = {
          termNumber: currentTerm,
          career: selectedCareer.name,
          assignment: assignment.name,
          age: characterData.age,
          survivalRoll: `${roll} + ${dm} = ${total} (need ${assignment.survivalTarget}+)`,
          survived: false,
          advanced: false,
          rank: characterData.rank,
          rankTitle: ranks[characterData.rank]?.title || 'Rank 0',
          event: `MISHAP: ${mishap}`,
          skillsGained: [],
          mishap,
        };

        setCharacterData(prev => ({
          ...prev,
          lifepath_log: [...prev.lifepath_log, termRecord],
          terms_served: currentTerm,
        }));
      }
    } else {
      // Graduation/survival success
      if (isPreCareer) {
        setPreCareerGraduated(true);

        // Apply graduation benefits immediately
        let benefitNotes: string[] = [];
        const honoursAchieved = selectedCareer.preCareerType === 'university' ? total >= 10 : total >= 11;
        setGraduatedWithHonours(honoursAchieved);

        // Set graduation roll log for display
        const honoursTarget = selectedCareer.preCareerType === 'university' ? 10 : 11;
        setGraduationRollLog(`Graduation Roll: ${roll} + ${dm} = ${total} (need ${assignment.survivalTarget}+, honours on ${honoursTarget}+) ${honoursAchieved ? '✓ WITH HONOURS' : ''}`);

        if (selectedCareer.preCareerType === 'university') {
          // University graduation: Both chosen skills +1, EDU +1 (additional)
          if (universitySkillLevel0 && universitySkillLevel1) {
            const skill0Key = normalizeSkillName(universitySkillLevel0);
            const skill1Key = normalizeSkillName(universitySkillLevel1);

            setCharacterData(prev => {
              const currentSkill0 = parseInt(prev.skills[skill0Key]?.value || '0');
              const currentSkill1 = parseInt(prev.skills[skill1Key]?.value || '0');

              return {
                ...prev,
                characteristics: {
                  ...prev.characteristics,
                  education: {
                    total: prev.characteristics.education.total + 1,
                    current: prev.characteristics.education.current + 1,
                  },
                },
                skills: {
                  ...prev.skills,
                  [skill0Key]: { proficient: true, value: String(currentSkill0 + 1) },
                  [skill1Key]: { proficient: true, value: String(currentSkill1 + 1) },
                },
              };
            });

            benefitNotes.push(`${universitySkillLevel0} +1`);
            benefitNotes.push(`${universitySkillLevel1} +1`);
            benefitNotes.push('EDU +1 (additional)');
          }

          // Check for honours
          if (honoursAchieved) {
            benefitNotes.push('Graduated with Honours!');
            setCommissionRollDM(2); // DM+2 for commission rolls
          } else {
            setCommissionRollDM(0); // DM+0 for commission rolls
          }

          setNeedsCommissionRoll(true);
        } else if (selectedCareer.preCareerType === 'military_academy') {
          // Military Academy graduation: EDU +1, select 3 Service Skills to increase to Level 1
          setCharacterData(prev => ({
            ...prev,
            characteristics: {
              ...prev.characteristics,
              education: {
                total: prev.characteristics.education.total + 1,
                current: prev.characteristics.education.current + 1,
              },
            },
          }));
          benefitNotes.push('EDU +1');

          // Check for honours (roll >= 11)
          if (honoursAchieved) {
            setCharacterData(prev => ({
              ...prev,
              characteristics: {
                ...prev.characteristics,
                social: {
                  total: prev.characteristics.social.total + 1,
                  current: prev.characteristics.social.current + 1,
                },
              },
            }));
            benefitNotes.push('Graduated with Honours! SOC +1');
            setCommissionRollDM(-999); // Automatic pass
          } else {
            setCommissionRollDM(2); // DM+2 for commission rolls
          }

          benefitNotes.push('Select 3 Service Skills to increase to Level 1');
          setNeedsCommissionRoll(true);
        }

        // Store the pre-career qualification DM bonus for future career qualification rolls
        const qualificationDM = honoursAchieved ? 2 : 1;
        setCharacterData(prev => ({
          ...prev,
          preCareerQualificationDM: qualificationDM,
          preCareerType: selectedCareer.preCareerType as 'university' | 'military_academy',
        }));

        setTermSkillsGained(benefitNotes);

        // For pre-careers, DON'T set termAdvanced - use a different flow
        // Pre-careers skip advancement and go straight to events after graduation
      }
    }
  };

  const runAdvancementCheck = () => {
    if (!selectedCareer || !termSurvived || termAdvanced !== null) return;

    const assignment = selectedCareer.assignments[selectedAssignment];
    const charValue = characterData.characteristics[assignment.advancementStat].total;
    const charDM = getDM(charValue);
    const roll = rollDice(2, 6);

    // Include event advancement DM bonus if any
    const totalDM = charDM + eventAdvancementDM;
    const total = roll + totalDM;
    const advanced = total >= assignment.advancementTarget;

    setTermAdvanced(advanced);

    // Build the roll log with details
    let dmBreakdown = `${charDM}`;
    if (eventAdvancementDM > 0) {
      dmBreakdown = `${charDM} + ${eventAdvancementDM} (event bonus)`;
    }

    // Prisoner career: check for parole
    if (selectedCareer.isPrisonerCareer && characterData.paroleThreshold !== undefined) {
      const paroleReleased = total > characterData.paroleThreshold;
      setAdvancementRollLog(`Advancement/Parole Roll: ${roll} + ${dmBreakdown} = ${total} vs Parole Threshold ${characterData.paroleThreshold}. ${paroleReleased ? 'RELEASED FROM PRISON!' : 'Still incarcerated.'}`);

      if (paroleReleased) {
        // Released from prison - force career switch after this term
        setCharacterData(prev => ({
          ...prev,
          paroleThreshold: undefined, // Clear parole threshold
          notes: prev.notes + '\nReleased from prison on parole.',
        }));
      }
    } else {
      setAdvancementRollLog(`Advancement Roll: ${roll} + ${dmBreakdown} = ${total} (need ${assignment.advancementTarget}+)`);
    }

    // Reset the event advancement DM after using it
    setEventAdvancementDM(0);

    const assignmentName = selectedCareer.assignments[selectedAssignment]?.name;
    const ranks = getRanksForCareer(selectedCareer, isCommissioned, assignmentName);

    if (advanced && characterData.rank < ranks.length - 1) {
      const newRank = characterData.rank + 1;
      const rankData = ranks[newRank];

      setCharacterData(prev => ({
        ...prev,
        rank: newRank,
      }));

      // Apply rank bonus if any
      if (rankData.skillBonus) {
        if (needsSpecialtySelection(rankData.skillBonus)) {
          // Queue for specialty selection
          applySkillGain(rankData.skillBonus, 'Rank Bonus');
        } else {
          // Apply directly
          applySkillGain(rankData.skillBonus, 'Rank Bonus');
          setTermSkillsGained(prev => [...prev, `${rankData.skillBonus} (Rank Bonus)`]);
        }
      }

      if (rankData.bonusStat) {
        setCharacterData(prev => ({
          ...prev,
          characteristics: {
            ...prev.characteristics,
            [rankData.bonusStat]: {
              ...prev.characteristics[rankData.bonusStat],
              total: prev.characteristics[rankData.bonusStat].total + 1,
              current: prev.characteristics[rankData.bonusStat].current + 1,
            },
          },
        }));
        setTermSkillsGained(prev => [...prev, `${rankData.bonusStat.toUpperCase()} +1 (rank bonus)`]);
      }
    }
  };

  const rollEvent = () => {
    if (!selectedCareer || !termSurvived || termEventRoll !== null) return;

    const roll = rollDice(2, 6);
    setTermEventRoll(roll);

    // Check if this is a pre-career (use new GameEvent system)
    if (selectedCareer.isPreCareer) {
      const gameEvent = getPreCareerEvent(roll);
      setCurrentGameEvent(gameEvent);
      setGameEventCompleted(false);
      setCurrentEvent(null);
      setEventResolved(false);
      return;
    }

    // Check if this is a structured event
    const eventIndex = Math.min(roll - 2, selectedCareer.eventTable.length - 1);
    const event = selectedCareer.eventTable[eventIndex];

    // Check for new GameEvent format first
    if (isGameEvent(event)) {
      setCurrentGameEvent(event);
      setGameEventCompleted(false);
      setCurrentEvent(null);
      setEventResolved(false);
      return;
    }

    if (typeof event === 'object' && 'description' in event) {
      // It's a legacy structured event
      setCurrentEvent(event as StructuredEvent);
      setEventResolved(false);
      setEventOutcomeApplied(false);
      setEventRollResult(null);
      setCurrentGameEvent(null);
    } else {
      // Old style string event - auto-resolve
      setCurrentEvent(null);
      setCurrentGameEvent(null);
      setEventResolved(true);
      setEventOutcomeApplied(true);
    }
  };

  const rollEventCheck = (characteristic: keyof Omit<Characteristics, 'psionics'>, target: number) => {
    const stat = characterData.characteristics[characteristic];
    const dm = getDM(stat.total);
    const roll = rollDice(2, 6);
    const total = roll + dm;

    setEventRollResult({ roll, dm, total });

    return total >= target;
  };

  const applyEventOutcome = (outcome: EventOutcome | undefined, skillChoice?: string) => {
    if (!outcome) return;

    // Apply skills
    if (outcome.skills && skillChoice) {
      const skillLevel = outcome.skillLevel || 1;

      if (skillChoice === 'Contact') {
        // Handle contact as a special case - we'll just add it to the log for now
        setTermSkillsGained(prev => [...prev, 'Contact (event)']);
      } else {
        const skillKey = normalizeSkillName(skillChoice);
        setCharacterData(prev => {
          const currentSkill = prev.skills[skillKey];
          const currentValue = currentSkill ? parseInt(currentSkill.value) || 0 : 0;

          return {
            ...prev,
            skills: {
              ...prev.skills,
              [skillKey]: {
                proficient: true,
                value: Math.max(currentValue, skillLevel).toString(),
              },
            },
          };
        });
        setTermSkillsGained(prev => [...prev, `${skillChoice} ${skillLevel} (event)`]);
      }
    }

    // Apply characteristic changes
    if (outcome.characteristic) {
      const { stat, modifier } = outcome.characteristic;
      setCharacterData(prev => {
        const currentValue = prev.characteristics[stat].total;
        const newValue = Math.min(currentValue + modifier, stat === 'social' ? 12 : 15);

        return {
          ...prev,
          characteristics: {
            ...prev.characteristics,
            [stat]: {
              ...prev.characteristics[stat],
              total: newValue,
              current: newValue,
            },
          },
        };
      });
      setTermSkillsGained(prev => [...prev, `${stat.toUpperCase()} +${modifier} (event)`]);
    }

    // Log allies, enemies, rivals, contacts
    if (outcome.allies) {
      setTermSkillsGained(prev => [...prev, `${outcome.allies} Allies (event)`]);
    }
    if (outcome.enemies) {
      setTermSkillsGained(prev => [...prev, `${outcome.enemies} Enemies (event)`]);
    }
    if (outcome.rivals) {
      setTermSkillsGained(prev => [...prev, `${outcome.rivals} Rivals (event)`]);
    }
    if (outcome.contacts) {
      setTermSkillsGained(prev => [...prev, `${outcome.contacts} Contacts (event)`]);
    }

    setEventOutcomeApplied(true);
  };

  // Handler for new GameEvent system completion
  const handleGameEventComplete = (effects: EventEffects | undefined, messages: string[]) => {
    if (effects) {
      // Apply skills
      if (effects.skills?.choices) {
        const level = effects.skills.level ?? 1;
        effects.skills.choices.forEach(skillName => {
          const skillKey = normalizeSkillName(skillName);
          setCharacterData(prev => {
            const currentSkill = prev.skills[skillKey];
            const currentValue = currentSkill ? parseInt(currentSkill.value) || 0 : 0;
            // For level 0, just ensure proficiency; for higher, set to max of current or target
            const newValue = level === 0 ? Math.max(currentValue, 0) : Math.max(currentValue, level);
            return {
              ...prev,
              skills: {
                ...prev.skills,
                [skillKey]: { proficient: true, value: newValue.toString() },
              },
            };
          });
          setTermSkillsGained(prev => [...prev, `${skillName} ${level} (event)`]);
        });
      }

      // Apply characteristic changes
      if (effects.characteristics) {
        effects.characteristics.forEach(change => {
          setCharacterData(prev => {
            const currentValue = prev.characteristics[change.stat].total;
            const newValue = change.max
              ? Math.min(currentValue + change.modifier, change.max)
              : currentValue + change.modifier;
            return {
              ...prev,
              characteristics: {
                ...prev.characteristics,
                [change.stat]: {
                  ...prev.characteristics[change.stat],
                  total: newValue,
                  current: newValue,
                },
              },
            };
          });
          setTermSkillsGained(prev => [
            ...prev,
            `${change.stat.toUpperCase()} ${change.modifier >= 0 ? '+' : ''}${change.modifier} (event)`,
          ]);
        });
      }

      // Apply social connections (resolve dice expressions)
      if (effects.allies) {
        const count = rollDiceExpression(effects.allies);
        if (count > 0) {
          setTermSkillsGained(prev => [...prev, `${count} Allies (event)`]);
        }
      }
      if (effects.enemies) {
        const count = rollDiceExpression(effects.enemies);
        if (count > 0) {
          setTermSkillsGained(prev => [...prev, `${count} Enemies (event)`]);
        }
      }
      if (effects.rivals) {
        const count = rollDiceExpression(effects.rivals);
        if (count > 0) {
          setTermSkillsGained(prev => [...prev, `${count} Rivals (event)`]);
        }
      }
      if (effects.contacts) {
        const count = rollDiceExpression(effects.contacts);
        if (count > 0) {
          setTermSkillsGained(prev => [...prev, `${count} Contacts (event)`]);
        }
      }

      // Handle career effects
      if (effects.forceCareer) {
        setTermSkillsGained(prev => [...prev, `Must enter ${effects.forceCareer} next term`]);
        // TODO: Store this for enforcement in career selection
      }
      if (effects.failGraduation) {
        setPreCareerGraduated(false);
        setTermSurvived(false);
        setTermSkillsGained(prev => [...prev, 'Failed to graduate']);
      }
      if (effects.canTestPsi) {
        setTermSkillsGained(prev => [...prev, 'May test PSI in future']);
      }
      if (effects.allowCareer) {
        setTermSkillsGained(prev => [...prev, `${effects.allowCareer} career unlocked`]);
      }

      // Handle DM bonuses for future rolls
      if (effects.advancementDM) {
        setEventAdvancementDM(prev => prev + effects.advancementDM!);
        setTermSkillsGained(prev => [...prev, `DM+${effects.advancementDM} to next advancement roll`]);
      }
      if (effects.benefitDM) {
        setEventBenefitDM(prev => prev + effects.benefitDM!);
        setTermSkillsGained(prev => [...prev, `DM+${effects.benefitDM} to a Benefit roll`]);
      }
      if (effects.extraBenefit) {
        setExtraBenefitRolls(prev => prev + 1);
        setTermSkillsGained(prev => [...prev, 'Extra Benefit roll']);
      }

      // Handle table redirects (e.g., rollOnTable: 'injury')
      if (effects.rollOnTable) {
        // Add any messages first
        messages.forEach(msg => {
          if (msg && !termSkillsGained.includes(msg)) {
            setTermSkillsGained(prev => [...prev, msg]);
          }
        });

        // Trigger the table redirect
        handleTableRedirect(effects.rollOnTable as 'life_events' | 'injury' | 'aging' | 'draft' | 'unusual_events');
        return; // Don't mark event as completed yet - wait for redirected table
      }
    }

    // Mark event as completed
    setGameEventCompleted(true);
    setEventResolved(true);

    // Add any messages to the log
    messages.forEach(msg => {
      if (msg && !termSkillsGained.includes(msg)) {
        setTermSkillsGained(prev => [...prev, msg]);
      }
    });
  };

  // Handler for table redirects (Life Events, Injury, etc.)
  const handleTableRedirect = (table: 'life_events' | 'injury' | 'aging' | 'draft' | 'unusual_events') => {
    let roll: number;
    let event: GameEvent | null = null;
    let tableName = '';

    switch (table) {
      case 'life_events':
        roll = rollDiceUtil(2, 6); // 2D6
        event = getLifeEvent(roll);
        tableName = 'Life Events';
        break;
      case 'injury':
        roll = rollDiceUtil(1, 6); // 1D6
        event = getInjury(roll);
        tableName = 'Injury';
        break;
      case 'unusual_events':
        roll = rollDiceUtil(1, 6); // 1D6
        event = getUnusualEvent(roll);
        tableName = 'Unusual Events';
        break;
      case 'aging':
        // Aging table not yet implemented
        setTermSkillsGained(prev => [...prev, 'Roll on Aging table (not yet implemented)']);
        setGameEventCompleted(true);
        setEventResolved(true);
        return;
      case 'draft':
        // Draft is handled separately
        setTermSkillsGained(prev => [...prev, 'Roll on Draft table (use draft system)']);
        setGameEventCompleted(true);
        setEventResolved(true);
        return;
      default:
        setGameEventCompleted(true);
        setEventResolved(true);
        return;
    }

    if (event) {
      setRedirectedEvent(event);
      setRedirectTableRoll(roll);
      setRedirectTableName(tableName);
      // Don't mark as completed yet - the redirected event needs to be processed
    }
  };

  // Handler for when a redirected event completes
  const handleRedirectedEventComplete = (effects: EventEffects | undefined, messages: string[]) => {
    // Apply effects from the redirected event
    handleGameEventComplete(effects, messages);

    // Clear the redirect state
    setRedirectedEvent(null);
    setRedirectTableRoll(null);
    setRedirectTableName(null);
  };

  // Handler for nested table redirects (e.g., Life Events -> Injury -> ...)
  const handleNestedTableRedirect = (table: 'life_events' | 'injury' | 'aging' | 'draft' | 'unusual_events') => {
    // Complete the current redirected event first
    setRedirectedEvent(null);
    setRedirectTableRoll(null);
    setRedirectTableName(null);

    // Then handle the new redirect
    handleTableRedirect(table);
  };

  // ============================================================================
  // SKILL LIMITS ENFORCEMENT
  // ============================================================================

  const getTotalSkillLevels = (skills: Record<string, SkillState>): number => {
    return Object.values(skills).reduce((total, skill) => {
      return total + (parseInt(skill.value) || 0);
    }, 0);
  };

  const getMaxSkillLevels = (): number => {
    const int = characterData.characteristics.intellect.total;
    const edu = characterData.characteristics.education.total;
    return 3 * (int + edu);
  };

  const canIncreaseSkill = (skillKey: string, currentSkills: Record<string, SkillState>): { allowed: boolean; reason?: string } => {
    const currentSkill = currentSkills[skillKey];
    const currentValue = currentSkill ? parseInt(currentSkill.value) || 0 : 0;

    // Check individual skill limit (max level 4)
    if (currentValue >= 4) {
      return { allowed: false, reason: 'Skill is already at maximum level 4' };
    }

    // Check total skill levels limit (3× INT+EDU)
    const totalSkillLevels = getTotalSkillLevels(currentSkills);
    const maxSkillLevels = getMaxSkillLevels();

    if (totalSkillLevels >= maxSkillLevels) {
      return { allowed: false, reason: `Total skill levels (${totalSkillLevels}) would exceed maximum (${maxSkillLevels} = 3×(INT+EDU))` };
    }

    return { allowed: true };
  };

  const applySkillGain = (skillName: string, source: string = '') => {
    const parsed = parseSkillGain(skillName);

    if (parsed.isStat && parsed.stat) {
      // Increase characteristic
      setCharacterData(prev => ({
        ...prev,
        characteristics: {
          ...prev.characteristics,
          [parsed.stat!]: {
            ...prev.characteristics[parsed.stat!],
            total: prev.characteristics[parsed.stat!].total + 1,
            current: prev.characteristics[parsed.stat!].current + 1,
          },
        },
      }));
    } else {
      // Check if this skill needs specialty selection
      if (needsSpecialtySelection(parsed.skill)) {
        // Queue this skill for specialty selection
        setPendingSpecialtySkill(getBaseSkillName(parsed.skill));
        setPendingSpecialtySource(source);
        return; // Don't apply yet - wait for specialty selection
      }

      // Add or increase skill - check limits first
      const skillKey = normalizeSkillName(parsed.skill);

      setCharacterData(prev => {
        const limitCheck = canIncreaseSkill(skillKey, prev.skills);

        if (!limitCheck.allowed) {
          console.warn(`Cannot increase ${parsed.skill}: ${limitCheck.reason}`);
          // Still return prev without changes, but we could show a warning to the user
          return prev;
        }

        const currentSkill = prev.skills[skillKey];
        const currentValue = currentSkill ? parseInt(currentSkill.value) || 0 : 0;

        return {
          ...prev,
          skills: {
            ...prev.skills,
            [skillKey]: {
              proficient: true,
              value: (currentValue + 1).toString(),
            },
          },
        };
      });
    }
  };

  // Handler for when a specialty is selected from the SpecialtySelector
  const handleSpecialtySelected = (fullSkillName: string) => {
    const source = pendingSpecialtySource;
    setPendingSpecialtySkill(null);
    setPendingSpecialtySource('');

    // Now apply the skill with the specific specialty
    const skillKey = normalizeSkillName(fullSkillName);

    setCharacterData(prev => {
      const limitCheck = canIncreaseSkill(skillKey, prev.skills);

      if (!limitCheck.allowed) {
        console.warn(`Cannot increase ${fullSkillName}: ${limitCheck.reason}`);
        return prev;
      }

      const currentSkill = prev.skills[skillKey];
      const currentValue = currentSkill ? parseInt(currentSkill.value) || 0 : 0;

      return {
        ...prev,
        skills: {
          ...prev.skills,
          [skillKey]: {
            proficient: true,
            value: (currentValue + 1).toString(),
          },
        },
      };
    });

    // Add to term skills gained log
    if (source) {
      setTermSkillsGained(prev => [...prev, `${fullSkillName} (${source})`]);
    }
  };

  // Helper function to get skill table and display name
  const getSkillTableInfo = (tableName: string): { table: string[]; displayName: string } => {
    if (!selectedCareer) return { table: [], displayName: '' };

    let table: string[] = [];
    let displayName = tableName;

    if (tableName === 'personal') {
      table = selectedCareer.skillTables.personalDevelopment;
      displayName = 'Personal Development';
    } else if (tableName === 'service') {
      table = selectedCareer.skillTables.serviceSkills;
      displayName = 'Service Skills';
    } else if (tableName === 'advanced' && selectedCareer.skillTables.advancedEducation) {
      table = selectedCareer.skillTables.advancedEducation;
      displayName = 'Advanced Education';
    } else if (tableName === 'specialist') {
      const assignmentName = selectedCareer.assignments[selectedAssignment].name;
      table = selectedCareer.skillTables.specialist[assignmentName] || [];
      displayName = `Specialist (${assignmentName})`;
    }

    return { table, displayName };
  };

  // Toggle skill table expansion (for new dropdown UI)
  const toggleSkillTable = (tableName: string) => {
    if (termSkillSelected) return; // Already selected a skill this term

    if (expandedSkillTable === tableName) {
      // Collapse if already expanded
      setExpandedSkillTable(null);
      setSkillTableRollResult(null);
    } else {
      // Expand the selected table
      setExpandedSkillTable(tableName);
      setSkillTableRollResult(null);
    }
  };

  // Roll skill from the currently expanded table
  const rollSkillFromExpandedTable = () => {
    if (!selectedCareer || !expandedSkillTable || termSkillSelected) return;

    const { table, displayName } = getSkillTableInfo(expandedSkillTable);
    if (table.length === 0) return;

    const roll = rollDice(1, 6);
    setSkillTableRollResult(roll);

    const skillName = table[roll - 1];

    // Check if skill needs specialty selection
    if (needsSpecialtySelection(skillName)) {
      // Queue for specialty selection - source will be used when specialty is selected
      applySkillGain(skillName, displayName);
    } else {
      // Apply directly and log immediately
      applySkillGain(skillName, displayName);
      setTermSkillsGained(prev => [...prev, `${skillName} (${displayName})`]);
    }

    // Mark that the skill has been selected for this term
    setTermSkillSelected(true);
  };

  // Legacy function - kept for compatibility but now just toggles the table
  const gainSkillFromTable = (tableName: string) => {
    toggleSkillTable(tableName);
  };

  const completeTerm = () => {
    if (!selectedCareer || !termSurvived) return;

    const assignment = selectedCareer.assignments[selectedAssignment];
    const eventData = termEventRoll !== null
      ? selectedCareer.eventTable[Math.min(termEventRoll - 2, selectedCareer.eventTable.length - 1)]
      : null;
    const event = eventData ? getEventDescription(eventData) : 'No event this term';

    const ranks = getRanksForCareer(selectedCareer, isCommissioned, assignment.name);

    const isPreCareer = selectedCareer.isPreCareer || false;

    const termRecord: TermRecord = {
      termNumber: currentTerm,
      career: selectedCareer.name,
      assignment: assignment.name,
      age: characterData.age,
      survivalRoll: isPreCareer ? 'Graduated' : 'Passed',
      survived: true,
      advancementRoll: isPreCareer ? 'Graduated' : (termAdvanced ? 'Advanced' : 'Did not advance'),
      advanced: termAdvanced || false,
      rank: characterData.rank,
      rankTitle: ranks[characterData.rank]?.title || `Rank ${characterData.rank}`,
      event,
      skillsGained: termSkillsGained,
      isCommissioned,
    };

    setCharacterData(prev => ({
      ...prev,
      lifepath_log: [...prev.lifepath_log, termRecord],
      terms_served: currentTerm,
      // Pre-career terms don't count toward totalCareerTerms - this counter is used
      // to determine first career (all basic training skills) vs subsequent careers (pick one skill)
      totalCareerTerms: (prev.totalCareerTerms || 0) + (isPreCareer ? 0 : 1),
      hasCompletedPreCareer: (isPreCareer && termSurvived) ? true : prev.hasCompletedPreCareer,
    }));

    // Apply basic training on first term (not for pre-careers)
    if (currentTerm === 1 && !isPreCareer) {
      selectedCareer.skillTables.serviceSkills.forEach(skillName => {
        const skillKey = normalizeSkillName(skillName);
        setCharacterData(prev => ({
          ...prev,
          skills: {
            ...prev.skills,
            [skillKey]: { proficient: true, value: '0' },
          },
        }));
      });
    }

    // For Military Academy, apply all Service Skills at Level 0 at entry (first term)
    if (isPreCareer && selectedCareer.preCareerType === 'military_academy' && currentTerm === 1) {
      selectedCareer.skillTables.serviceSkills.forEach(skillName => {
        const skillKey = normalizeSkillName(skillName);
        setCharacterData(prev => ({
          ...prev,
          skills: {
            ...prev.skills,
            [skillKey]: { proficient: true, value: '0' },
          },
        }));
      });
    }

    // Check for aging (starting at term 5 / age 38)
    // Total terms is based on lifepath_log length which now includes the current term
    const totalTermsAfterThis = characterData.lifepath_log.length + 1;
    if (totalTermsAfterThis >= 5) {
      const agingRollResult = rollAging(totalTermsAfterThis, characterData.characteristics);
      if (agingRollResult) {
        setAgingResult(agingRollResult);
        setAgingPending(true);

        // If aging roll failed, apply the effects immediately to characteristics
        if (!agingRollResult.passed) {
          const newCharacteristics = applyAgingEffects(
            characterData.characteristics,
            agingRollResult.effects.effects
          );
          setCharacterData(prev => ({
            ...prev,
            characteristics: newCharacteristics,
          }));
        }
      }
    }

    setIsInTerm(false);
  };

  const musterOut = () => {
    if (!selectedCareer) return;

    // Save current career to history first
    const assignmentName = selectedCareer.assignments[selectedAssignment]?.name || '';
    const currentCareerRecord: CareerRecord = {
      careerName: selectedCareer.name,
      assignment: assignmentName,
      termsServed: currentTerm,
      highestRank: characterData.rank,
      isCommissioned: isCommissioned,
      benefitDM: eventBenefitDM,
      extraBenefitRolls: extraBenefitRolls,
      isPreCareer: selectedCareer.isPreCareer || false,
    };

    // Add current career to history
    setCharacterData(prev => ({
      ...prev,
      careerHistory: [...prev.careerHistory, currentCareerRecord],
    }));

    // Show mustering out UI
    setIsMusteringOut(true);
  };

  // Handle completion of mustering out process
  const handleMusteringOutComplete = (results: {
    cash: number;
    shipShares: number;
    tasMembership: boolean;
    ships: string[];
    characteristics: typeof characterData.characteristics;
    allies: number;
    contacts: number;
    equipment: string[];
    benefitLog: any[];
  }) => {
    // Calculate pension for qualifying careers
    let totalPension = 0;
    const pensionCareers = ['Army', 'Marines', 'Navy', 'Agent'];

    characterData.careerHistory.forEach(career => {
      if (!career.isPreCareer && pensionCareers.includes(career.careerName) && career.termsServed >= 5) {
        totalPension += career.termsServed * 2000;
      }
    });

    setCharacterData(prev => ({
      ...prev,
      cash_on_hand: results.cash,
      credits: results.cash,
      pension: totalPension,
      shipShares: results.shipShares,
      tasMembership: results.tasMembership,
      ships: results.ships,
      characteristics: results.characteristics,
      allies: prev.allies + results.allies,
      contacts: prev.contacts + results.contacts,
      equipment: [...prev.equipment, ...results.equipment],
    }));

    setIsMusteringOut(false);
    setStep(6); // Go to review
  };

  // Careers where assignment changes are treated as staying in the same career
  // (just need a qualification roll, keep rank on success)
  const SIMPLE_ASSIGNMENT_CHANGE_CAREERS = ['Army', 'Marines', 'Navy', 'Noble', 'Rogue', 'Scholar', 'Scout'];

  // Careers where assignment changes are treated as entirely new careers
  // (must leave current career, benefit rolls, qualification roll, rank 0 on success)
  const NEW_CAREER_ASSIGNMENT_CHANGE_CAREERS = ['Agent', 'Citizen', 'Entertainer', 'Merchant'];

  const canSwitchAssignment = (): boolean => {
    if (!selectedCareer) return false;
    if (selectedCareer.isPreCareer) return false;
    if (selectedCareer.assignments.length <= 1) return false;
    const careerName = selectedCareer.name;
    return SIMPLE_ASSIGNMENT_CHANGE_CAREERS.includes(careerName) ||
           NEW_CAREER_ASSIGNMENT_CHANGE_CAREERS.includes(careerName);
  };

  const isSimpleAssignmentChange = (): boolean => {
    if (!selectedCareer) return false;
    return SIMPLE_ASSIGNMENT_CHANGE_CAREERS.includes(selectedCareer.name);
  };

  const startSwitchAssignment = () => {
    setIsSwitchingAssignment(true);
    setSwitchAssignmentTarget(null);
    setSwitchAssignmentRollLog('');
    setSwitchAssignmentResult(null);
  };

  const rollSwitchAssignment = (newAssignmentIndex: number) => {
    if (!selectedCareer) return;

    setSwitchAssignmentTarget(newAssignmentIndex);

    // Make a qualification roll for the new assignment
    const charValue = characterData.characteristics[selectedCareer.qualificationStat].total;
    const dm = getDM(charValue);
    const roll = rollDice(2, 6);
    const total = roll + dm;
    const passed = total >= selectedCareer.qualificationTarget;
    const newAssignment = selectedCareer.assignments[newAssignmentIndex];

    setSwitchAssignmentRollLog(
      `Qualification Roll for ${newAssignment.name}: ${roll} + ${dm} (${selectedCareer.qualificationStat.toUpperCase()} DM) = ${total} (need ${selectedCareer.qualificationTarget}+)`
    );

    if (passed) {
      setSwitchAssignmentResult('success');

      if (isSimpleAssignmentChange()) {
        // Simple change: keep rank, just switch assignment
        setSelectedAssignment(newAssignmentIndex);
        setCharacterData(prev => ({
          ...prev,
          career: `${selectedCareer.name} (${newAssignment.name})`,
        }));
      } else {
        // New career style: save current career history, reset rank to 0
        saveCurrentCareerToHistory();
        setSelectedAssignment(newAssignmentIndex);
        setCharacterData(prev => ({
          ...prev,
          rank: 0,
          terms_served: 0,
          career: `${selectedCareer.name} (${newAssignment.name})`,
        }));
        setCurrentTerm(0);
        setIsCommissioned(false);
      }
    } else {
      setSwitchAssignmentResult('failure');

      if (isSimpleAssignmentChange()) {
        // Simple change failure: continue with same assignment, no penalty
        // Nothing to change
      } else {
        // New career style failure: must enter draft or become Drifter
        // We'll let the user choose after acknowledging the failure
      }
    }
  };

  const confirmSwitchAssignment = () => {
    setIsSwitchingAssignment(false);
    setSwitchAssignmentTarget(null);
    setSwitchAssignmentRollLog('');
    setSwitchAssignmentResult(null);
    // Player continues in their career (same or new assignment depending on result)
  };

  const handleFailedNewCareerAssignmentSwitch = (choice: 'draft' | 'drifter') => {
    // Save current career to history first
    saveCurrentCareerToHistory();

    // Reset assignment switching state
    setIsSwitchingAssignment(false);
    setSwitchAssignmentTarget(null);
    setSwitchAssignmentRollLog('');
    setSwitchAssignmentResult(null);

    // Reset career state for new career
    setCurrentTerm(0);
    setIsInTerm(false);
    setTermSurvived(null);
    setTermAdvanced(null);
    setTermEventRoll(null);
    setTermSkillsGained([]);
    setIsCommissioned(false);
    setBasicTrainingApplied(false);
    setBasicTrainingSkillSelected(null);

    if (choice === 'drifter') {
      // Enter Drifter career
      const drifterCareer = ALL_CAREERS.find(c => c.name === 'Drifter');
      if (drifterCareer) {
        setSelectedCareer(drifterCareer);
        setSelectedAssignment(0);
        setCharacterData(prev => ({
          ...prev,
          rank: 0,
          terms_served: 0,
          career: `Drifter (${drifterCareer.assignments[0].name})`,
        }));
        setQualificationPassed(true);
        setQualificationRollLog('Entered Drifter (no qualification needed)');
      }
    } else {
      // Enter the draft
      const draftResult = rollDraft();
      const draftCareer = ALL_CAREERS.find(c => c.name === draftResult.careerName);
      if (draftCareer) {
        setSelectedCareer(draftCareer);
        // Find the assignment index
        const assignmentIdx = draftResult.assignmentName
          ? draftCareer.assignments.findIndex(a => a.name === draftResult.assignmentName)
          : 0;
        setSelectedAssignment(assignmentIdx >= 0 ? assignmentIdx : 0);
        const assignmentLabel = draftResult.assignmentName || draftCareer.assignments[0]?.name || '';
        setCharacterData(prev => ({
          ...prev,
          rank: 0,
          terms_served: 0,
          career: `${draftResult.careerName} (${assignmentLabel})`,
        }));
        setQualificationPassed(true);
        setQualificationRollLog(`Drafted into ${draftResult.careerName}${assignmentLabel ? ` (${assignmentLabel})` : ''}. Automatically qualified.`);
        setHasUsedDraft(true);
      }
    }
  };

  // Save current career to history when switching careers (not mustering out)
  const saveCurrentCareerToHistory = () => {
    if (!selectedCareer || currentTerm === 0) return;

    const assignmentName = selectedCareer.assignments[selectedAssignment]?.name || '';

    const careerRecord: CareerRecord = {
      careerName: selectedCareer.name,
      assignment: assignmentName,
      termsServed: currentTerm,
      highestRank: characterData.rank,
      isCommissioned: isCommissioned,
      benefitDM: eventBenefitDM,
      extraBenefitRolls: extraBenefitRolls,
      isPreCareer: selectedCareer.isPreCareer || false,
    };

    setCharacterData(prev => ({
      ...prev,
      careerHistory: [...prev.careerHistory, careerRecord],
    }));

    // Reset benefit tracking for new career
    setEventBenefitDM(0);
    setExtraBenefitRolls(0);
  };

  // Switch to a new career after leaving current one (after mishap, etc.)
  const switchToNewCareer = () => {
    // Save current career to history (unless it's a pre-career, which don't get benefits)
    saveCurrentCareerToHistory();

    // Reset rank and terms_served for the new career (but keep age and other stats)
    setCharacterData(prev => ({
      ...prev,
      rank: 0,
      terms_served: 0,
      career: '', // Clear current career name
    }));

    // Reset career selection state
    setSelectedCareer(null);
    setSelectedAssignment(0);
    setQualificationRollLog('');
    setQualificationPassed(null);
    setIsInTerm(false);
    setCurrentTerm(0);
    setTermSurvived(null);
    setTermAdvanced(null);
    setTermEventRoll(null);
    setTermSkillsGained([]);
    setIsCommissioned(false);
    setPreCareerGraduated(false);
    setGraduatedWithHonours(false);
    setGraduationRollLog('');
    setSurvivalRollLog('');
    setAdvancementRollLog('');
    setCurrentEvent(null);
    setEventRollResult(null);
    setEventResolved(false);
    setEventOutcomeApplied(false);
    setCurrentGameEvent(null);
    setGameEventCompleted(false);
    setRedirectedEvent(null);
    setRedirectTableRoll(null);
    setRedirectTableName(null);
    setPendingSpecialtySkill(null);
    setPendingSpecialtySource('');
    setTermSkillSelected(false);
    setExpandedSkillTable(null);
    setSkillTableRollResult(null);
    setBasicTrainingApplied(false);
    setBasicTrainingSkillSelected(null);
    setUniversitySkillLevel0(null);
    setUniversitySkillLevel1(null);
    setUniversityPendingSpecialty(null);
    setUniversityBaseSkillSelected(null);
    setMilitaryAcademyService(null);
    setAcademyGradSkillsSelected([]);
    setAcademyGradPendingSpecialty(null);
    // Reset event advancement DM for new career
    setEventAdvancementDM(0);
    // Reset assignment switching state
    setIsSwitchingAssignment(false);
    setSwitchAssignmentTarget(null);
    setSwitchAssignmentRollLog('');
    setSwitchAssignmentResult(null);

    // Go back to career selection
    setStep(4);
  };

  const selectNextCareerFromPreCareer = () => {
    // Store pre-career info before resetting
    const completedPreCareer = selectedCareer;
    const wasHonours = graduatedWithHonours;

    // Save pre-career to history (they don't get benefits but track for completeness)
    saveCurrentCareerToHistory();

    // Reset rank and terms_served for the new career
    setCharacterData(prev => ({
      ...prev,
      rank: 0,
      terms_served: 0,
      career: '',
    }));

    // Reset career selection state but keep character data
    setSelectedCareer(null);
    setSelectedAssignment(0);
    setQualificationRollLog('');
    setQualificationPassed(null);
    setIsInTerm(false);
    setCurrentTerm(0);
    setTermSurvived(null);
    setTermAdvanced(null);
    setTermEventRoll(null);
    setTermSkillsGained([]);
    setIsCommissioned(false);
    setPreCareerGraduated(false);
    setGraduatedWithHonours(false);
    setGraduationRollLog('');
    setSurvivalRollLog('');
    setAdvancementRollLog('');
    setCurrentEvent(null);
    setEventRollResult(null);
    setEventResolved(false);
    setEventOutcomeApplied(false);
    setCurrentGameEvent(null);
    setGameEventCompleted(false);
    setRedirectedEvent(null);
    setRedirectTableRoll(null);
    setRedirectTableName(null);
    setPendingSpecialtySkill(null);
    setPendingSpecialtySource('');
    // Reset end-of-term skill selection state
    setTermSkillSelected(false);
    setExpandedSkillTable(null);
    setSkillTableRollResult(null);
    // Reset basic training state for new career
    setBasicTrainingApplied(false);
    setBasicTrainingSkillSelected(null);
    // Reset university skill selection state
    setUniversitySkillLevel0(null);
    setUniversitySkillLevel1(null);
    setUniversityPendingSpecialty(null);
    setUniversityBaseSkillSelected(null);
    // Reset military academy state
    setMilitaryAcademyService(null);
    setAcademyGradSkillsSelected([]);
    setAcademyGradPendingSpecialty(null);

    // Store bonuses in character notes for reference
    if (completedPreCareer?.preCareerType === 'university') {
      const dmBonus = wasHonours ? 2 : 1;
      setCharacterData(prev => ({
        ...prev,
        notes: prev.notes + `\nUniversity Graduate${wasHonours ? ' (Honours)' : ''}: DM+${dmBonus} to qualify for Agent, Army, Citizen (Corporate), Entertainer (Journalist), Marines, Navy, Scholar, Scouts`,
      }));
    } else if (completedPreCareer?.preCareerType === 'military_academy') {
      const academyBranch = completedPreCareer.name.replace('Military Academy ', '').replace('(', '').replace(')', '');
      if (wasHonours) {
        setCharacterData(prev => ({
          ...prev,
          notes: prev.notes + `\nMilitary Academy Graduate (Honours): Automatic entry to ${academyBranch} at Rank O1, automatic commission`,
        }));
      } else {
        setCharacterData(prev => ({
          ...prev,
          notes: prev.notes + `\nMilitary Academy Graduate: Automatic entry to ${academyBranch}, DM+2 on commission roll`,
        }));
      }
    }

    // Go back to career selection
    setStep(4);
  };

  // ============================================================================
  // STEP 6: SAVE CHARACTER
  // ============================================================================

  const handleSaveCharacter = async () => {
    try {
      const assignmentName = selectedCareer?.assignments[selectedAssignment]?.name;
      const rankTitle = getRankTitle(selectedCareer, characterData.rank, isCommissioned, assignmentName);

      const finalCharacterData = {
        name: characterData.name,
        species: characterData.species,
        gender: '',
        age: characterData.age,
        homeworld: characterData.homeworld,
        rads: '',
        species_traits: '',
        notes: characterData.notes,
        career: characterData.career,
        rank: rankTitle,
        strength: characterData.characteristics.strength.total,
        dexterity: characterData.characteristics.dexterity.total,
        endurance: characterData.characteristics.endurance.total,
        current_strength: characterData.characteristics.strength.current,
        current_dexterity: characterData.characteristics.dexterity.current,
        current_endurance: characterData.characteristics.endurance.current,
        intellect: characterData.characteristics.intellect.total,
        education: characterData.characteristics.education.total,
        social_standing: characterData.characteristics.social.total,
        psionics: characterData.characteristics.psionics.total,
        melee_dmg: 0,
        ranged_dmg: 0,
        lifeblood: 0,
        stamina: 0,
        terms_served: characterData.terms_served,
        skills: characterData.skills,
        equipment: characterData.equipment,
        credits: characterData.credits,
        debt: characterData.debt,
        pension: characterData.pension,
        ship_payments: 0,
        living_cost: 0,
        cash_on_hand: characterData.cash_on_hand,
        study_skill: '',
        study_weeks: '',
        study_complete: '',
        allies: '',
        contacts: '',
        rivals: '',
        enemies: '',
        weapons: characterData.weapons,
        armor: characterData.armor,
        augments: characterData.augments,
        thumbnail_url: null,
      };

      await saveCharacter(finalCharacterData);
      alert('Character created successfully!');
    } catch (error) {
      console.error('Failed to save character:', error);
      alert('Failed to save character. Please try again.');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-black text-terminal-primary font-mono">
      <div className="border-b border-terminal-primary/30 p-4">
        <h1 className="text-2xl font-bold text-terminal-primary flex items-center gap-2">
          <User className="h-6 w-6" />
          TRAVELLER 2E CHARACTER GENERATOR
        </h1>
        <p className="text-terminal-primary/70 text-sm mt-1">
          Step {step} of 6 - {characterData.name || 'Unnamed Character'} - Age {characterData.age}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Tabs value={`step${step}`} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-black border border-terminal-primary/30 mb-4">
            {['Basics', 'Characteristics', 'Background', 'Career', 'Terms', 'Review'].map((label, idx) => (
              <TabsTrigger
                key={label}
                value={`step${idx + 1}`}
                onClick={() => setStep(idx + 1)}
                className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary text-xs"
              >
                {idx + 1}. {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* STEP 1: BASIC INFO */}
          <TabsContent value="step1">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <CardTitle className="text-terminal-primary">Character Basics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                    Character Name
                  </label>
                  <Input
                    placeholder="Enter character name..."
                    value={characterData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                    Species
                  </label>
                  <Input
                    placeholder="Human"
                    value={characterData.species}
                    onChange={(e) => handleSpeciesChange(e.target.value)}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                    Homeworld
                  </label>
                  <Input
                    placeholder="Enter homeworld..."
                    value={characterData.homeworld}
                    onChange={(e) => handleHomeworldChange(e.target.value)}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                </div>

                <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                  <p className="text-sm text-terminal-primary/80 mb-2">
                    Welcome to the Traveller 2E character generator! This wizard will guide you through creating your character using the official rules.
                  </p>
                  <p className="text-xs text-terminal-primary/60">
                    You'll roll characteristics, select background skills, choose a career, and live through terms of service.
                  </p>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!characterData.name}
                  className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                >
                  Continue to Characteristics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 2: CHARACTERISTICS */}
          <TabsContent value="step2">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-terminal-primary">Characteristics</CardTitle>
                  <div className="flex gap-2">
                    {hasRolled && (
                      <Button
                        onClick={rerollCharacteristics}
                        className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasRolled ? (
                  <>
                    <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-terminal-primary/80">
                        Choose how to generate your characteristics: Auto-assign (traditional), Manual (pick where each roll goes), or roll individually.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button
                        onClick={rollAllCharacteristics}
                        className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 h-20 flex-col"
                      >
                        <Dices className="h-5 w-5 mb-1" />
                        <span className="font-bold">Auto-Assign</span>
                        <span className="text-xs">Roll 6, assign in order</span>
                      </Button>

                      <Button
                        onClick={rollForManualAssignment}
                        className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 h-20 flex-col"
                      >
                        <Dices className="h-5 w-5 mb-1" />
                        <span className="font-bold">Manual Assign</span>
                        <span className="text-xs">Roll 6, pick placement</span>
                      </Button>

                      <Button
                        onClick={() => setHasRolled(true)}
                        className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 h-20 flex-col"
                      >
                        <Dices className="h-5 w-5 mb-1" />
                        <span className="font-bold">Roll Individually</span>
                        <span className="text-xs">Roll each stat separately</span>
                      </Button>
                    </div>
                  </>
                ) : assignmentMode === 'auto' && characteristicRolls.length > 0 ? (
                  <>
                    <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                      <h3 className="text-sm font-bold text-terminal-primary uppercase mb-3">Your Rolls (Auto-Assign)</h3>
                      <div className="grid grid-cols-6 gap-2">
                        {characteristicRolls.map((roll, idx) => (
                          <div key={idx} className="text-center p-2 border border-terminal-primary/30 rounded">
                            <div className="text-2xl font-bold text-terminal-primary">{roll}</div>
                            <div className="text-xs text-terminal-primary/60">DM: {getDMDisplay(roll)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {backgroundSkillsRemaining === 0 && (
                      <Button
                        onClick={assignRolls}
                        className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        Assign Rolls in Order (STR, DEX, END, INT, EDU, SOC)
                      </Button>
                    )}

                    {backgroundSkillsRemaining > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(['strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'] as const).map((key) => (
                          <div key={key} className="border border-terminal-primary/30 bg-card/40 rounded p-3">
                            <div className="text-xs font-semibold uppercase tracking-wide text-terminal-primary">
                              {key}
                            </div>
                            <div className="text-2xl font-bold text-terminal-primary mt-1">
                              {characterData.characteristics[key].total}
                            </div>
                            <div className="text-xs text-terminal-primary/60">
                              DM: {getDMDisplay(characterData.characteristics[key].total)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : assignmentMode === 'manual' && characteristicRolls.length > 0 ? (
                  <>
                    <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                      <h3 className="text-sm font-bold text-terminal-primary uppercase mb-3">
                        Your Rolls - Click a roll, then click a characteristic
                      </h3>
                      <div className="grid grid-cols-6 gap-2">
                        {characteristicRolls.map((roll, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedRollIndex(idx)}
                            className={`text-center p-2 border rounded transition-colors ${
                              selectedRollIndex === idx
                                ? 'border-terminal-primary bg-terminal-primary/20'
                                : 'border-terminal-primary/30 hover:border-terminal-primary/50'
                            }`}
                          >
                            <div className="text-2xl font-bold text-terminal-primary">{roll}</div>
                            <div className="text-xs text-terminal-primary/60">DM: {getDMDisplay(roll)}</div>
                          </button>
                        ))}
                      </div>
                      {selectedRollIndex !== null && (
                        <p className="text-xs text-terminal-primary/70 mt-2">
                          Selected roll: {characteristicRolls[selectedRollIndex]} - Click a characteristic below to assign
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(['strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'] as const).map((key) => {
                        const hasValue = characterData.characteristics[key].total > 0;
                        return (
                          <button
                            key={key}
                            onClick={() => assignRollToCharacteristic(key)}
                            disabled={!selectedRollIndex && selectedRollIndex !== 0}
                            className={`border rounded p-3 text-left transition-colors ${
                              hasValue
                                ? 'border-terminal-primary bg-terminal-primary/10'
                                : selectedRollIndex !== null
                                ? 'border-terminal-primary/50 hover:border-terminal-primary bg-card/40'
                                : 'border-terminal-primary/30 bg-card/20 opacity-50'
                            }`}
                          >
                            <div className="text-xs font-semibold uppercase tracking-wide text-terminal-primary">
                              {key}
                            </div>
                            <div className="text-2xl font-bold text-terminal-primary mt-1">
                              {hasValue ? characterData.characteristics[key].total : '?'}
                            </div>
                            {hasValue && (
                              <div className="text-xs text-terminal-primary/60">
                                DM: {getDMDisplay(characterData.characteristics[key].total)}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {characteristicRolls.length === 0 && (
                      <Alert className="bg-green-500/10 border-green-500/50">
                        <AlertDescription className="text-green-400">
                          ✓ All characteristics assigned!
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <>
                    <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-terminal-primary/80">
                        Roll each characteristic individually, or manually type values. Click the dice icon to roll 2D6.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(['strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'] as const).map((key) => (
                        <div key={key} className="border border-terminal-primary/30 bg-card/40 rounded p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold uppercase tracking-wide text-terminal-primary">
                              {key}
                            </div>
                            <Button
                              onClick={() => rollSingleCharacteristic(key)}
                              size="sm"
                              variant="outline"
                              className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 h-7"
                            >
                              <Dices className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              min="1"
                              max="18"
                              value={characterData.characteristics[key].total || ''}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (val >= 0 && val <= 18) {
                                  manuallySetCharacteristic(key, val);
                                }
                              }}
                              className="bg-black border-terminal-primary/50 text-terminal-primary text-2xl font-bold h-12 w-20 text-center"
                              placeholder="0"
                            />
                            <div className="text-xs text-terminal-primary/60">
                              DM: {getDMDisplay(characterData.characteristics[key].total)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={
                      assignmentMode === 'manual'
                        ? characteristicRolls.length > 0
                        : (backgroundSkillsRemaining === 0 && characterData.characteristics.education.total === 0)
                    }
                    className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    Continue to Background Skills
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 3: BACKGROUND SKILLS */}
          <TabsContent value="step3">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <CardTitle className="text-terminal-primary">
                  Background Skills ({backgroundSkillsRemaining} remaining)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-terminal-primary/80">
                    You receive {getDM(characterData.characteristics.education.total) + 3} background skills at level 0, based on your EDU DM + 3.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {BACKGROUND_SKILLS.map(skill => {
                    const key = normalizeSkillName(skill);
                    const selected = characterData.skills[key]?.proficient;
                    return (
                      <Button
                        key={skill}
                        onClick={() => selectBackgroundSkill(key)}
                        disabled={selected || backgroundSkillsRemaining === 0}
                        variant={selected ? 'default' : 'outline'}
                        className={selected
                          ? 'bg-terminal-primary/30 text-terminal-primary border-terminal-primary'
                          : 'border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20'
                        }
                      >
                        {skill}
                      </Button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={backgroundSkillsRemaining > 0}
                    className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    Continue to Career
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 4: CAREER SELECTION */}
          <TabsContent value="step4">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <CardTitle className="text-terminal-primary">Choose Your Career</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Forced Career Alert */}
                {characterData.forcedCareer && (
                  <Alert className="bg-red-500/10 border-red-500/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-400">
                      <strong>FORCED ENTRY:</strong> You must enter the {characterData.forcedCareer} career.
                      {characterData.forcedCareer === 'Prisoner' && ' You have been sentenced to prison.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* PSI Testing Section */}
                {!characterData.forcedCareer && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-purple-400 font-bold">Psionic Testing</h4>
                        <p className="text-xs text-purple-300/70">
                          {characterData.psiTested
                            ? `PSI: ${characterData.characteristics.psionics?.total || 0}${(characterData.psiTalents?.length || 0) > 0 ? ` | Talents: ${characterData.psiTalents?.join(', ')}` : ' | No talents acquired'}`
                            : 'Test for psionic potential to unlock the Psion career.'}
                        </p>
                      </div>
                      {!characterData.psiTested && (
                        <Button
                          onClick={performPsiTest}
                          className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/50"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Test PSI
                        </Button>
                      )}
                    </div>
                    {psiTestResult && (
                      <div className="mt-3 text-xs text-purple-300/80 border-t border-purple-500/30 pt-2">
                        <div className="font-bold mb-1">Test Results:</div>
                        {psiTestResult.talentsTested.map((t, i) => (
                          <div key={t.talent} className={t.acquired ? 'text-green-400' : 'text-red-400/70'}>
                            {t.talent}: Roll {t.roll} vs {t.targetNumber} - {t.acquired ? 'ACQUIRED' : 'Failed'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Career Cards */}
                {getAvailableCareers().map(career => (
                  <Card
                    key={career.name}
                    className={`cursor-pointer transition-colors ${
                      selectedCareer?.name === career.name
                        ? 'bg-terminal-primary/20 border-terminal-primary'
                        : 'bg-black border-terminal-primary/30 hover:border-terminal-primary/50'
                    }`}
                    onClick={() => {
                      // Handle Prisoner career specially (forced entry, automatic qualification)
                      if (career.isPrisonerCareer) {
                        becomePrisoner();
                        return;
                      }

                      setSelectedCareer(career);
                      // Don't reset if they have automatic entry to this career
                      if (preCareerFailedService !== career.name) {
                        resetQualification();
                      } else {
                        // Automatically qualify them since they have automatic entry
                        setTimeout(() => attemptQualification(), 0);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-terminal-primary" />
                        <h3 className="font-bold text-terminal-primary">{career.name}</h3>
                      </div>
                      <p className="text-sm text-terminal-primary/80 mb-2">{career.description}</p>
                      <div className="text-xs text-terminal-primary/60">
                        Qualification: {career.qualification}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {selectedCareer && (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-terminal-primary uppercase">Select Assignment</h3>
                      {selectedCareer.assignments.map((assignment, idx) => (
                        <Card
                          key={idx}
                          className={`cursor-pointer transition-colors ${
                            selectedAssignment === idx
                              ? 'bg-terminal-primary/20 border-terminal-primary'
                              : 'bg-black border-terminal-primary/30 hover:border-terminal-primary/50'
                          }`}
                          onClick={() => setSelectedAssignment(idx)}
                        >
                          <CardContent className="p-3">
                            <h4 className="font-bold text-terminal-primary text-sm">{assignment.name}</h4>
                            <p className="text-xs text-terminal-primary/70 mb-1">{assignment.description}</p>
                            <div className="text-xs text-terminal-primary/60">
                              {selectedCareer?.isPreCareer ? (
                                `Graduation: ${assignment.survivalStat.toUpperCase()} ${assignment.survivalTarget}+`
                              ) : (
                                `Survival: ${assignment.survivalStat.toUpperCase()} ${assignment.survivalTarget}+ | Advancement: ${assignment.advancementStat.toUpperCase()} ${assignment.advancementTarget}+`
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {qualificationPassed === null && (
                      <Button
                        onClick={attemptQualification}
                        className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        <Dices className="h-4 w-4 mr-2" />
                        Attempt Qualification
                      </Button>
                    )}

                    {qualificationRollLog && (
                      <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                        <p className="text-xs text-terminal-primary/80 font-mono">{qualificationRollLog}</p>
                      </div>
                    )}

                    {qualificationPassed === true && (
                      <>
                        <Alert className="bg-green-500/10 border-green-500/50">
                          <AlertDescription className="text-green-400">
                            ✓ Qualification successful! You may enter this career.
                          </AlertDescription>
                        </Alert>

                        {/* UNIVERSITY SKILL SELECTION */}
                        {selectedCareer?.preCareerType === 'university' && (
                          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4 space-y-3">
                            <h4 className="text-sm font-bold text-terminal-primary">Select Your University Skills</h4>
                            <p className="text-xs text-terminal-primary/70">
                              Choose one skill at Level 0 and one skill at Level 1. You will also gain EDU +1 immediately upon entry.
                            </p>

                            {/* Level 0 Skill Selection */}
                            <div className="space-y-2">
                              <label className="text-xs text-terminal-primary/70">Level 0 Skill:</label>
                              {universityPendingSpecialty === 0 && universityBaseSkillSelected ? (
                                // Show specialty selector for Level 0 skill
                                <SpecialtySelector
                                  baseSkill={universityBaseSkillSelected}
                                  currentSkills={characterData.skills}
                                  onSelect={handleUniversitySpecialtySelected}
                                  onCancel={cancelUniversitySpecialtySelection}
                                  title={`Choose ${universityBaseSkillSelected} Specialization (Level 0)`}
                                />
                              ) : universitySkillLevel0 ? (
                                // Show selected skill with option to change
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-green-500/10 border border-green-500/50 text-green-400 p-2 rounded text-sm">
                                    {universitySkillLevel0}
                                  </div>
                                  <Button
                                    onClick={() => setUniversitySkillLevel0(null)}
                                    variant="outline"
                                    size="sm"
                                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                                  >
                                    Change
                                  </Button>
                                </div>
                              ) : (
                                // Show dropdown for base skill selection
                                <select
                                  value=""
                                  onChange={(e) => handleUniversitySkillSelect(e.target.value, 0)}
                                  className="w-full bg-black border border-terminal-primary/50 text-terminal-primary p-2 rounded text-sm"
                                >
                                  <option value="">-- Select Level 0 Skill --</option>
                                  {selectedCareer.skillTables.advancedEducation?.map(skill => (
                                    <option key={skill} value={skill}>
                                      {skill}{needsSpecialtySelection(skill) ? ' *' : ''}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            {/* Level 1 Skill Selection */}
                            <div className="space-y-2">
                              <label className="text-xs text-terminal-primary/70">Level 1 Skill:</label>
                              {universityPendingSpecialty === 1 && universityBaseSkillSelected ? (
                                // Show specialty selector for Level 1 skill
                                <SpecialtySelector
                                  baseSkill={universityBaseSkillSelected}
                                  currentSkills={characterData.skills}
                                  onSelect={handleUniversitySpecialtySelected}
                                  onCancel={cancelUniversitySpecialtySelection}
                                  title={`Choose ${universityBaseSkillSelected} Specialization (Level 1)`}
                                />
                              ) : universitySkillLevel1 ? (
                                // Show selected skill with option to change
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-green-500/10 border border-green-500/50 text-green-400 p-2 rounded text-sm">
                                    {universitySkillLevel1}
                                  </div>
                                  <Button
                                    onClick={() => setUniversitySkillLevel1(null)}
                                    variant="outline"
                                    size="sm"
                                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                                  >
                                    Change
                                  </Button>
                                </div>
                              ) : (
                                // Show dropdown for base skill selection
                                <select
                                  value=""
                                  onChange={(e) => handleUniversitySkillSelect(e.target.value, 1)}
                                  className="w-full bg-black border border-terminal-primary/50 text-terminal-primary p-2 rounded text-sm"
                                >
                                  <option value="">-- Select Level 1 Skill --</option>
                                  {selectedCareer.skillTables.advancedEducation?.map(skill => (
                                    <option key={skill} value={skill}>
                                      {skill}{needsSpecialtySelection(skill) ? ' *' : ''}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            <p className="text-xs text-terminal-primary/50">* Skills marked with asterisk have specializations</p>

                            {universitySkillLevel0 && universitySkillLevel1 && (
                              <Alert className="bg-blue-500/10 border-blue-500/50">
                                <AlertDescription className="text-blue-400 text-xs">
                                  Upon entry: {universitySkillLevel0} 0, {universitySkillLevel1} 1, EDU +1
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}

                        {/* MILITARY ACADEMY SERVICE SELECTION */}
                        {selectedCareer?.preCareerType === 'military_academy' && (
                          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4 space-y-3">
                            <h4 className="text-sm font-bold text-terminal-primary">Select Your Military Service</h4>
                            <p className="text-xs text-terminal-primary/70">
                              Choose which military branch you are training for. You will gain all their Service Skills at Level 0 immediately upon entry.
                            </p>

                            <div className="space-y-2">
                              {[
                                { name: 'Army', req: 'END 7+', stat: 'endurance', target: 7 },
                                { name: 'Marines', req: 'END 8+', stat: 'endurance', target: 8 },
                                { name: 'Navy', req: 'INT 8+', stat: 'intellect', target: 8 }
                              ].map(service => (
                                <Card
                                  key={service.name}
                                  className={`cursor-pointer ${
                                    militaryAcademyService === service.name
                                      ? 'bg-terminal-primary/20 border-terminal-primary'
                                      : 'bg-black border-terminal-primary/30 hover:border-terminal-primary/50'
                                  }`}
                                  onClick={() => setMilitaryAcademyService(service.name)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h5 className="font-bold text-terminal-primary text-sm">{service.name} Cadet</h5>
                                        <p className="text-xs text-terminal-primary/60">Required: {service.req}</p>
                                      </div>
                                      {militaryAcademyService === service.name && (
                                        <span className="text-terminal-primary">✓</span>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>

                            {militaryAcademyService && (
                              <Alert className="bg-blue-500/10 border-blue-500/50">
                                <AlertDescription className="text-blue-400 text-xs">
                                  Upon entry: All {militaryAcademyService} Service Skills at Level 0
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {qualificationPassed === false && !draftRolled && (
                      <div className="space-y-3">
                        <Alert className="bg-red-500/10 border-red-500/50">
                          <AlertDescription className="text-red-400">
                            ✗ Qualification failed. You must enter the Draft or become a Drifter.
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={enterDraft}
                            disabled={hasUsedDraft}
                            className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 border border-yellow-600/50"
                          >
                            <Dices className="h-4 w-4 mr-2" />
                            Enter Draft
                          </Button>
                          <Button
                            onClick={becomeDrifter}
                            className="bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-600/50"
                          >
                            Become Drifter
                          </Button>
                        </div>

                        {hasUsedDraft && (
                          <Alert className="bg-yellow-500/10 border-yellow-500/50">
                            <AlertDescription className="text-yellow-400 text-xs">
                              You have already used your draft. You must become a Drifter if you fail qualification again.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      applyPreCareerEntryBenefits();
                      setStep(5);
                    }}
                    disabled={
                      !qualificationPassed ||
                      (selectedCareer?.preCareerType === 'university' && (!universitySkillLevel0 || !universitySkillLevel1)) ||
                      (selectedCareer?.preCareerType === 'military_academy' && !militaryAcademyService)
                    }
                    className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    Begin Career
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 5: TERMS */}
          <TabsContent value="step5">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <CardTitle className="text-terminal-primary">
                  Career Terms - {isInTerm ? `Term ${currentTerm} in Progress` : `Completed ${currentTerm} Terms`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isMusteringOut ? (
                  <MusteringOut
                    careerHistory={characterData.careerHistory}
                    currentCash={characterData.cash_on_hand}
                    currentShipShares={characterData.shipShares}
                    hasTasMembership={characterData.tasMembership}
                    ships={characterData.ships}
                    gamblerSkillLevel={parseInt(characterData.skills['Gambler']?.value || '0') || 0}
                    characteristics={characterData.characteristics}
                    onComplete={handleMusteringOutComplete}
                  />
                ) : (
                <>
                <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-terminal-primary/80">
                    <div>
                      <span className="text-terminal-primary/60">Career:</span> {characterData.career}
                    </div>
                    <div>
                      <span className="text-terminal-primary/60">Assignment:</span> {selectedCareer?.assignments[selectedAssignment].name}
                    </div>
                    <div>
                      <span className="text-terminal-primary/60">Rank:</span> {getRankTitle(
                        selectedCareer,
                        characterData.rank,
                        isCommissioned,
                        selectedCareer?.assignments[selectedAssignment]?.name
                      )}
                    </div>
                    <div>
                      <span className="text-terminal-primary/60">Age:</span> {characterData.age}
                    </div>
                    <div>
                      <span className="text-terminal-primary/60">Terms Served:</span> {characterData.terms_served}
                    </div>
                    {/* Show Parole Threshold for Prisoner career */}
                    {selectedCareer?.isPrisonerCareer && characterData.paroleThreshold !== undefined && (
                      <div className="col-span-2 mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                        <span className="text-red-400 font-bold">Parole Threshold:</span>{' '}
                        <span className="text-red-300">{characterData.paroleThreshold}</span>
                        <span className="text-red-400/70 text-xs ml-2">(advancement roll must exceed this to be released)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SKILLS SUMMARY */}
                <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                  <h3 className="text-sm font-bold text-terminal-primary mb-2">Acquired Skills</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-terminal-primary/80">
                    {Object.entries(characterData.skills)
                      .filter(([_, skill]) => skill.proficient || parseInt(skill.value) > 0)
                      .sort((a, b) => parseInt(b[1].value) - parseInt(a[1].value))
                      .map(([skillName, skill]) => (
                        <div key={skillName} className="flex justify-between">
                          <span className="capitalize">{skillName.replace(/_/g, ' ')}</span>
                          <span className="text-terminal-primary">{skill.value}</span>
                        </div>
                      ))}
                    {Object.entries(characterData.skills).filter(([_, skill]) => skill.proficient || parseInt(skill.value) > 0).length === 0 && (
                      <div className="text-terminal-primary/50 col-span-2">No skills acquired yet</div>
                    )}
                  </div>
                </div>

                {/* Start Term button - only for the first term of any career (term 0) */}
                {!isInTerm && currentTerm === 0 && termSurvived !== false && (
                  <Button
                    onClick={startNewTerm}
                    className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    Start Term 1
                  </Button>
                )}

                {/* BASIC TRAINING SKILL SELECTION (for subsequent careers) */}
                {isInTerm && termSurvived === null && !basicTrainingApplied && (characterData.totalCareerTerms || 0) > 0 && (
                  <div className="space-y-2">
                    <Alert className="bg-blue-500/10 border-blue-500/50">
                      <AlertDescription className="text-blue-400">
                        <strong>Basic Training:</strong> Choose one {selectedCareer?.name === 'Citizen' || selectedCareer?.name === 'Drifter' ? 'assignment' : 'service'} skill to gain at level 0.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-2">
                      {(selectedCareer?.name === 'Citizen' || selectedCareer?.name === 'Drifter'
                        ? selectedCareer.skillTables.specialist[selectedCareer.assignments[selectedAssignment].name] || []
                        : selectedCareer?.skillTables.serviceSkills || []
                      ).map((skill) => (
                        <Button
                          key={skill}
                          onClick={() => selectBasicTrainingSkill(skill)}
                          variant="outline"
                          className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {isInTerm && termSurvived === null && basicTrainingApplied && (
                  <div className="space-y-2">
                    <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-terminal-primary/80">
                        {selectedCareer?.isPreCareer
                          ? 'Roll for graduation. If you fail, you do not receive graduation benefits but may continue to another career.'
                          : 'Roll for survival. If you fail, you suffer a mishap and must leave the career.'}
                      </AlertDescription>
                    </Alert>

                    {/* MISHAP TABLE */}
                    {selectedCareer && (
                      <div className="bg-black border border-terminal-primary/30 rounded p-3">
                        <h4 className="text-xs font-bold text-red-400 mb-2">Potential Mishaps (1D6):</h4>
                        <div className="space-y-1 text-xs text-terminal-primary/70">
                          {selectedCareer.mishapTable.map((mishap, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-terminal-primary/50">{idx + 1}.</span>
                              <span>{getMishapDescription(mishap)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={runSurvivalCheck}
                      className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                    >
                      <Dices className="h-4 w-4 mr-2" />
                      {selectedCareer?.isPreCareer ? 'Roll Graduation Check' : 'Roll Survival Check'}
                    </Button>
                  </div>
                )}

                {isInTerm && termSurvived === false && (
                  <div className="space-y-2">
                    <Alert className="bg-red-500/10 border-red-500/50">
                      <AlertDescription className="text-red-400">
                        {selectedCareer?.isPreCareer
                          ? '✗ Failed to graduate. You may attempt to qualify for any career (except another pre-career this term).'
                          : '✗ Survival check failed! You suffer a mishap and must leave this career.'}
                      </AlertDescription>
                    </Alert>
                    {preCareerFailedService && (
                      <Alert className="bg-blue-500/10 border-blue-500/50">
                        <AlertDescription className="text-blue-400">
                          ℹ You have automatic entry to {preCareerFailedService} (no qualification roll needed)!
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={switchToNewCareer}
                        className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        Back to Career Selection
                      </Button>
                      <Button
                        onClick={musterOut}
                        className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                      >
                        Muster Out
                      </Button>
                    </div>
                  </div>
                )}

                {isInTerm && termSurvived === true && termAdvanced === null && (
                  <div className="space-y-2">
                    {selectedCareer?.isPreCareer ? (
                      <>
                        {/* Graduation Roll Result */}
                        {graduationRollLog && (
                          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                            <p className="text-xs text-terminal-primary/80 font-mono">{graduationRollLog}</p>
                          </div>
                        )}

                        {/* Graduation Success Message */}
                        <Alert className={graduatedWithHonours ? "bg-yellow-500/10 border-yellow-500/50" : "bg-green-500/10 border-green-500/50"}>
                          <AlertDescription className={graduatedWithHonours ? "text-yellow-400" : "text-green-400"}>
                            {graduatedWithHonours ? (
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🎓</span>
                                <span className="font-bold">Graduated with Honours!</span>
                              </div>
                            ) : (
                              <span>✓ Graduated successfully!</span>
                            )}
                          </AlertDescription>
                        </Alert>

                        {/* Graduation Benefits */}
                        {termSkillsGained.length > 0 && (
                          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                            <h4 className="text-xs font-bold text-terminal-primary uppercase mb-2">Graduation Benefits:</h4>
                            <div className="space-y-1">
                              {termSkillsGained.map((benefit, idx) => (
                                <div key={idx} className="text-sm text-terminal-primary/80">• {benefit}</div>
                              ))}
                            </div>
                            {selectedCareer.preCareerType === 'university' && (
                              <div className="mt-2 pt-2 border-t border-terminal-primary/20 text-xs text-terminal-primary/60">
                                DM+{graduatedWithHonours ? '2' : '1'} to qualify for: Agent, Army, Citizen (corporate), Entertainer (journalist), Marines, Navy, Scholar, Scouts
                              </div>
                            )}
                            {selectedCareer.preCareerType === 'military_academy' && (
                              <div className="mt-2 pt-2 border-t border-terminal-primary/20 text-xs text-terminal-primary/60">
                                Automatic entry to {militaryAcademyService || 'military career'} • DM+2 on first commission roll{graduatedWithHonours ? ' (auto-pass with honours)' : ''}
                              </div>
                            )}
                          </div>
                        )}

                        <Button
                          onClick={rollEvent}
                          className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                        >
                          <Dices className="h-4 w-4 mr-2" />
                          Roll Event (2D6)
                        </Button>
                      </>
                    ) : (
                      <>
                        {survivalRollLog && (
                          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                            <p className="text-xs text-terminal-primary/80 font-mono">{survivalRollLog}</p>
                          </div>
                        )}
                        <Alert className="bg-green-500/10 border-green-500/50">
                          <AlertDescription className="text-green-400">
                            ✓ Survival check passed! Now roll for advancement.
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={runAdvancementCheck}
                          className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                        >
                          <Dices className="h-4 w-4 mr-2" />
                          Roll Advancement Check
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {isInTerm && termSurvived === true && termAdvanced !== null && termEventRoll === null && (
                  <div className="space-y-2">
                    {advancementRollLog && (
                      <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                        <p className="text-xs text-terminal-primary/80 font-mono">{advancementRollLog}</p>
                      </div>
                    )}
                    {termAdvanced ? (
                      <Alert className="bg-green-500/10 border-green-500/50">
                        <AlertDescription className="text-green-400">
                          ✓ Advanced to {getRankTitle(selectedCareer, characterData.rank, isCommissioned, selectedCareer?.assignments[selectedAssignment]?.name)}!
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-yellow-500/10 border-yellow-500/50">
                        <AlertDescription className="text-yellow-400">
                          Did not advance this term.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* EVENT TABLE */}
                    {selectedCareer && (
                      <div className="bg-black border border-terminal-primary/30 rounded p-3">
                        <h4 className="text-xs font-bold text-blue-400 mb-2">Possible Events (2D6):</h4>
                        <div className="space-y-1 text-xs text-terminal-primary/70">
                          {selectedCareer.eventTable.map((event, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-terminal-primary/50">{idx + 2}.</span>
                              <span>{getEventDescription(event)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={rollEvent}
                      className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                    >
                      <Dices className="h-4 w-4 mr-2" />
                      Roll Event (2D6)
                    </Button>
                  </div>
                )}

                {isInTerm && termEventRoll !== null && (
                  <div className="space-y-2">
                    {/* Redirected Event (from table redirect like Life Events -> Injury) */}
                    {redirectedEvent && (
                      <div className="space-y-2">
                        <Alert className="bg-blue-500/10 border-blue-500/50">
                          <AlertDescription className="text-blue-400">
                            <strong>{redirectTableName} (rolled {redirectTableRoll}):</strong>
                          </AlertDescription>
                        </Alert>
                        <EventHandler
                          event={redirectedEvent}
                          characteristics={characterData.characteristics}
                          skills={characterData.skills}
                          onComplete={handleRedirectedEventComplete}
                          onTableRedirect={handleNestedTableRedirect}
                        />
                      </div>
                    )}

                    {/* New GameEvent System */}
                    {currentGameEvent && !gameEventCompleted && !redirectedEvent && (
                      <div className="space-y-2">
                        <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-2 mb-2">
                          <p className="text-xs text-terminal-primary/60">Event Roll: {termEventRoll}</p>
                        </div>
                        <EventHandler
                          event={currentGameEvent}
                          characteristics={characterData.characteristics}
                          skills={characterData.skills}
                          onComplete={handleGameEventComplete}
                          onTableRedirect={handleTableRedirect}
                        />
                      </div>
                    )}

                    {/* Legacy StructuredEvent Handling (for non-pre-career events) */}
                    {!currentGameEvent && (
                      <>
                        <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
                          <AlertDescription className="text-terminal-primary/80">
                            <strong>Event (rolled {termEventRoll}):</strong><br />
                            {currentEvent ? currentEvent.description : (selectedCareer ? getEventDescription(selectedCareer.eventTable[Math.min(termEventRoll - 2, selectedCareer.eventTable.length - 1)]) : 'No special event')}
                          </AlertDescription>
                        </Alert>

                        {/* Legacy Structured Event Handling */}
                        {currentEvent && !eventResolved && (
                          <div className="space-y-2">
                            {/* Check if event has conditional avoidance (like SOC 9+ to ignore) */}
                            {currentEvent.conditionalAvoidance && characterData.characteristics[currentEvent.conditionalAvoidance.characteristic].total >= currentEvent.conditionalAvoidance.target && (
                              <Alert className="bg-green-500/10 border-green-500/50">
                                <AlertDescription className="text-green-400">
                                  ✓ {currentEvent.conditionalAvoidance.displayText} - You can avoid this event!
                                </AlertDescription>
                              </Alert>
                            )}

                            {/* Characteristic Roll Required */}
                            {currentEvent.requiresRoll && !eventRollResult && (
                              <div className="space-y-2">
                                <p className="text-sm text-terminal-primary/80">{currentEvent.requiresRoll.displayText}</p>
                                <Button
                                  onClick={() => {
                                    const success = rollEventCheck(currentEvent.requiresRoll!.characteristic, currentEvent.requiresRoll!.target);
                                    // Auto-apply if no skill choice needed
                                    if (success && currentEvent.successOutcome && !currentEvent.successOutcome.skills) {
                                      applyEventOutcome(currentEvent.successOutcome);
                                      setEventResolved(true);
                                    } else if (!success && currentEvent.failureOutcome && !currentEvent.failureOutcome.skills) {
                                      applyEventOutcome(currentEvent.failureOutcome);
                                      setEventResolved(true);
                                    } else if (success && !currentEvent.successOutcome?.skills) {
                                      setEventResolved(true);
                                    } else if (!success && !currentEvent.failureOutcome?.skills) {
                                      setEventResolved(true);
                                    }
                                  }}
                                  className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                                >
                                  <Dices className="h-4 w-4 mr-2" />
                                  Roll {currentEvent.requiresRoll.characteristic.toUpperCase()} {currentEvent.requiresRoll.target}+
                                </Button>
                              </div>
                            )}

                            {/* Show Roll Result */}
                            {eventRollResult && currentEvent.requiresRoll && (
                              <div className="space-y-2">
                                <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                                  <p className="text-xs text-terminal-primary/80 font-mono">
                                    Roll: {eventRollResult.roll} + {eventRollResult.dm} = {eventRollResult.total}
                                    (need {currentEvent.requiresRoll.target}+)
                                    {eventRollResult.total >= currentEvent.requiresRoll.target ? ' ✓ SUCCESS' : ' ✗ FAILED'}
                                  </p>
                                </div>

                                {/* Show skill choice if needed */}
                                {!eventOutcomeApplied && eventRollResult.total >= currentEvent.requiresRoll.target && currentEvent.successOutcome?.skills && (
                                  <div className="space-y-2">
                                    <p className="text-sm text-terminal-primary">
                                      {currentEvent.successOutcome.message || 'Choose a skill:'}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {currentEvent.successOutcome.skills.map((skill) => (
                                        <Button
                                          key={skill}
                                          onClick={() => {
                                            applyEventOutcome(currentEvent.successOutcome, skill);
                                            setEventResolved(true);
                                          }}
                                          variant="outline"
                                          className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                                        >
                                          {skill}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {!eventOutcomeApplied && eventRollResult.total < currentEvent.requiresRoll.target && currentEvent.failureOutcome?.skills && (
                                  <div className="space-y-2">
                                    <p className="text-sm text-terminal-primary">
                                      {currentEvent.failureOutcome.message || 'Choose a skill:'}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {currentEvent.failureOutcome.skills.map((skill) => (
                                        <Button
                                          key={skill}
                                          onClick={() => {
                                            applyEventOutcome(currentEvent.failureOutcome, skill);
                                            setEventResolved(true);
                                          }}
                                          variant="outline"
                                          className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                                        >
                                          {skill}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {!eventOutcomeApplied && eventRollResult.total < currentEvent.requiresRoll.target && currentEvent.failureOutcome?.message && !currentEvent.failureOutcome.skills && (
                                  <Alert className="bg-red-500/10 border-red-500/50">
                                    <AlertDescription className="text-red-400">
                                      {currentEvent.failureOutcome.message}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {eventOutcomeApplied && !eventResolved && (
                                  <Button
                                    onClick={() => setEventResolved(true)}
                                    className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                                  >
                                    Continue
                                  </Button>
                                )}
                              </div>
                            )}

                            {/* Automatic outcome (no roll required) */}
                            {!currentEvent.requiresRoll && !currentEvent.requiresSkillCheck && !currentEvent.requiresChoice && !eventOutcomeApplied && (
                              <Button
                                onClick={() => {
                                  applyEventOutcome(currentEvent.automaticOutcome);
                                  setEventResolved(true);
                                }}
                                className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                              >
                                Apply Event Outcome
                              </Button>
                            )}

                            {/* Choice required */}
                            {currentEvent.requiresChoice && !eventOutcomeApplied && (
                              <div className="space-y-2">
                                <p className="text-sm text-terminal-primary/80">{currentEvent.requiresChoice.displayText}</p>
                                <div className="grid grid-cols-1 gap-2">
                                  {currentEvent.requiresChoice.options.map((option) => (
                                    <Button
                                      key={option}
                                      onClick={() => {
                                        // Handle specific choices
                                        if (option === 'Gain a Contact') {
                                          applyEventOutcome({ contacts: 1 });
                                        }
                                        setEventResolved(true);
                                      }}
                                      variant="outline"
                                      className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                                    >
                                      {option}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Specialty Selection (shown when a skill with specialties was rolled) */}
                    {pendingSpecialtySkill && (
                      <SpecialtySelector
                        baseSkill={pendingSpecialtySkill}
                        currentSkills={characterData.skills}
                        onSelect={handleSpecialtySelected}
                        title={`Choose ${pendingSpecialtySkill} Specialization${pendingSpecialtySource ? ` (${pendingSpecialtySource})` : ''}`}
                      />
                    )}

                    {/* Skill Gain Tables (only show for regular careers when event is resolved and no pending specialty) */}
                    {!selectedCareer?.isPreCareer && !pendingSpecialtySkill && ((!currentGameEvent || gameEventCompleted) && (!currentEvent || eventResolved)) && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-terminal-primary uppercase">
                          {termSkillSelected ? 'Skill Selected This Term' : 'Select One Skill Table'}
                        </h4>

                        {/* Skill Table Selection */}
                        <div className="space-y-2">
                          {/* Personal Development */}
                          <div className="border border-terminal-primary/30 rounded overflow-hidden">
                            <Button
                              onClick={() => toggleSkillTable('personal')}
                              disabled={termSkillSelected}
                              variant="ghost"
                              className={`w-full justify-between border-0 ${
                                expandedSkillTable === 'personal'
                                  ? 'bg-terminal-primary/20 text-terminal-primary'
                                  : 'text-terminal-primary hover:bg-terminal-primary/10'
                              } ${termSkillSelected ? 'opacity-50' : ''}`}
                            >
                              <span>Personal Development</span>
                              {expandedSkillTable === 'personal' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                            {expandedSkillTable === 'personal' && (
                              <div className="p-3 bg-terminal-primary/5 border-t border-terminal-primary/30">
                                <div className="grid grid-cols-2 gap-1 mb-3">
                                  {selectedCareer?.skillTables.personalDevelopment.map((skill, idx) => (
                                    <div
                                      key={idx}
                                      className={`text-xs p-2 rounded ${
                                        skillTableRollResult === idx + 1
                                          ? 'bg-green-500/30 border border-green-500 text-green-400 font-bold'
                                          : 'bg-terminal-primary/10 text-terminal-primary/80'
                                      }`}
                                    >
                                      <span className="font-mono">{idx + 1}.</span> {skill}
                                    </div>
                                  ))}
                                </div>
                                {!skillTableRollResult && (
                                  <Button
                                    onClick={rollSkillFromExpandedTable}
                                    className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 border border-terminal-primary/50"
                                  >
                                    <Dices className="h-4 w-4 mr-2" />
                                    Roll 1D6
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Service Skills */}
                          <div className="border border-terminal-primary/30 rounded overflow-hidden">
                            <Button
                              onClick={() => toggleSkillTable('service')}
                              disabled={termSkillSelected}
                              variant="ghost"
                              className={`w-full justify-between border-0 ${
                                expandedSkillTable === 'service'
                                  ? 'bg-terminal-primary/20 text-terminal-primary'
                                  : 'text-terminal-primary hover:bg-terminal-primary/10'
                              } ${termSkillSelected ? 'opacity-50' : ''}`}
                            >
                              <span>Service Skills</span>
                              {expandedSkillTable === 'service' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                            {expandedSkillTable === 'service' && (
                              <div className="p-3 bg-terminal-primary/5 border-t border-terminal-primary/30">
                                <div className="grid grid-cols-2 gap-1 mb-3">
                                  {selectedCareer?.skillTables.serviceSkills.map((skill, idx) => (
                                    <div
                                      key={idx}
                                      className={`text-xs p-2 rounded ${
                                        skillTableRollResult === idx + 1
                                          ? 'bg-green-500/30 border border-green-500 text-green-400 font-bold'
                                          : 'bg-terminal-primary/10 text-terminal-primary/80'
                                      }`}
                                    >
                                      <span className="font-mono">{idx + 1}.</span> {skill}
                                    </div>
                                  ))}
                                </div>
                                {!skillTableRollResult && (
                                  <Button
                                    onClick={rollSkillFromExpandedTable}
                                    className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 border border-terminal-primary/50"
                                  >
                                    <Dices className="h-4 w-4 mr-2" />
                                    Roll 1D6
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Advanced Education (EDU 8+) */}
                          {selectedCareer?.skillTables.advancedEducation && characterData.characteristics.education.total >= 8 && (
                            <div className="border border-terminal-primary/30 rounded overflow-hidden">
                              <Button
                                onClick={() => toggleSkillTable('advanced')}
                                disabled={termSkillSelected}
                                variant="ghost"
                                className={`w-full justify-between border-0 ${
                                  expandedSkillTable === 'advanced'
                                    ? 'bg-terminal-primary/20 text-terminal-primary'
                                    : 'text-terminal-primary hover:bg-terminal-primary/10'
                                } ${termSkillSelected ? 'opacity-50' : ''}`}
                              >
                                <span>Advanced Education (EDU 8+)</span>
                                {expandedSkillTable === 'advanced' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              {expandedSkillTable === 'advanced' && (
                                <div className="p-3 bg-terminal-primary/5 border-t border-terminal-primary/30">
                                  <div className="grid grid-cols-2 gap-1 mb-3">
                                    {selectedCareer?.skillTables.advancedEducation?.map((skill, idx) => (
                                      <div
                                        key={idx}
                                        className={`text-xs p-2 rounded ${
                                          skillTableRollResult === idx + 1
                                            ? 'bg-green-500/30 border border-green-500 text-green-400 font-bold'
                                            : 'bg-terminal-primary/10 text-terminal-primary/80'
                                        }`}
                                      >
                                        <span className="font-mono">{idx + 1}.</span> {skill}
                                      </div>
                                    ))}
                                  </div>
                                  {!skillTableRollResult && (
                                    <Button
                                      onClick={rollSkillFromExpandedTable}
                                      className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 border border-terminal-primary/50"
                                    >
                                      <Dices className="h-4 w-4 mr-2" />
                                      Roll 1D6
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Specialist Skills */}
                          <div className="border border-terminal-primary/30 rounded overflow-hidden">
                            <Button
                              onClick={() => toggleSkillTable('specialist')}
                              disabled={termSkillSelected}
                              variant="ghost"
                              className={`w-full justify-between border-0 ${
                                expandedSkillTable === 'specialist'
                                  ? 'bg-terminal-primary/20 text-terminal-primary'
                                  : 'text-terminal-primary hover:bg-terminal-primary/10'
                              } ${termSkillSelected ? 'opacity-50' : ''}`}
                            >
                              <span>Specialist ({selectedCareer?.assignments[selectedAssignment].name})</span>
                              {expandedSkillTable === 'specialist' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                            {expandedSkillTable === 'specialist' && (
                              <div className="p-3 bg-terminal-primary/5 border-t border-terminal-primary/30">
                                <div className="grid grid-cols-2 gap-1 mb-3">
                                  {(() => {
                                    const assignmentName = selectedCareer?.assignments[selectedAssignment]?.name || '';
                                    const specialistSkills = selectedCareer?.skillTables.specialist[assignmentName] || [];
                                    return specialistSkills.map((skill, idx) => (
                                      <div
                                        key={idx}
                                        className={`text-xs p-2 rounded ${
                                          skillTableRollResult === idx + 1
                                            ? 'bg-green-500/30 border border-green-500 text-green-400 font-bold'
                                            : 'bg-terminal-primary/10 text-terminal-primary/80'
                                        }`}
                                      >
                                        <span className="font-mono">{idx + 1}.</span> {skill}
                                      </div>
                                    ));
                                  })()}
                                </div>
                                {!skillTableRollResult && (
                                  <Button
                                    onClick={rollSkillFromExpandedTable}
                                    className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 border border-terminal-primary/50"
                                  >
                                    <Dices className="h-4 w-4 mr-2" />
                                    Roll 1D6
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {termSkillsGained.length > 0 && (
                          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                            <h5 className="text-xs font-bold text-terminal-primary uppercase mb-2">Skills Gained This Term:</h5>
                            <ul className="text-xs text-terminal-primary/80 space-y-1">
                              {termSkillsGained.map((skill, idx) => (
                                <li key={idx}>• {skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pre-career: Show skills gained summary and complete button */}
                    {selectedCareer?.isPreCareer && ((!currentGameEvent || gameEventCompleted) && (!currentEvent || eventResolved)) && (
                      <div className="space-y-2">
                        {termSkillsGained.length > 0 && (
                          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                            <h5 className="text-xs font-bold text-terminal-primary uppercase mb-2">Summary:</h5>
                            <ul className="text-xs text-terminal-primary/80 space-y-1">
                              {termSkillsGained.map((skill, idx) => (
                                <li key={idx}>• {skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Military Academy Graduation: Select 3 Service Skills */}
                        {selectedCareer?.preCareerType === 'military_academy' && termSurvived && !pendingSpecialtySkill && (
                          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4 space-y-3">
                            <h4 className="text-sm font-bold text-terminal-primary">
                              Select 3 Service Skills to Increase to Level 1
                            </h4>
                            <p className="text-xs text-terminal-primary/70">
                              Choose 3 skills from the {militaryAcademyService} service skills to increase to level 1.
                              ({academyGradSkillsSelected.length}/3 selected)
                            </p>

                            {/* Pending Specialty Selection */}
                            {academyGradPendingSpecialty && (
                              <SpecialtySelector
                                baseSkill={academyGradPendingSpecialty}
                                currentSkills={characterData.skills}
                                onSelect={handleAcademyGradSpecialtySelected}
                                onCancel={cancelAcademyGradSpecialtySelection}
                                title={`Choose ${academyGradPendingSpecialty} Specialization`}
                              />
                            )}

                            {/* Selected Skills */}
                            {academyGradSkillsSelected.length > 0 && !academyGradPendingSpecialty && (
                              <div className="space-y-1">
                                <p className="text-xs text-terminal-primary/60 uppercase font-semibold">Selected:</p>
                                {academyGradSkillsSelected.map((skill, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <div className="flex-1 bg-green-500/10 border border-green-500/50 text-green-400 p-2 rounded text-sm">
                                      {skill} → Level 1
                                    </div>
                                    <Button
                                      onClick={() => removeAcademyGradSkill(skill)}
                                      variant="outline"
                                      size="sm"
                                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Available Skills to Select */}
                            {academyGradSkillsSelected.length < 3 && !academyGradPendingSpecialty && (
                              <div className="space-y-2">
                                <p className="text-xs text-terminal-primary/60 uppercase font-semibold">
                                  Available Skills:
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {getAcademyServiceSkills().map((skill) => {
                                    const isSelected = academyGradSkillsSelected.some(
                                      s => s === skill || s.startsWith(skill + ' (')
                                    );
                                    return (
                                      <Button
                                        key={skill}
                                        onClick={() => handleAcademyGradSkillSelect(skill)}
                                        disabled={isSelected}
                                        variant="outline"
                                        className={`border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 ${
                                          isSelected ? 'opacity-50' : ''
                                        }`}
                                      >
                                        {skill}{needsSpecialtySelection(skill) ? ' *' : ''}
                                      </Button>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-terminal-primary/50">* Skills marked with asterisk have specializations</p>
                              </div>
                            )}

                            {/* Apply Skills Button */}
                            {academyGradSkillsSelected.length === 3 && !academyGradPendingSpecialty && (
                              <Button
                                onClick={applyAcademyGradSkills}
                                className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
                              >
                                Apply Selected Skills
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {((!currentGameEvent || gameEventCompleted) && (!currentEvent || eventResolved) && !pendingSpecialtySkill &&
                      !(selectedCareer?.preCareerType === 'military_academy' && termSurvived && academyGradSkillsSelected.length < 3) &&
                      (selectedCareer?.isPreCareer || termSkillSelected)) && (
                      <Button
                        onClick={completeTerm}
                        className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
                      >
                        Complete Term {currentTerm}
                      </Button>
                    )}
                  </div>
                )}

                {!isInTerm && currentTerm > 0 && termSurvived !== false && (
                  selectedCareer?.isPreCareer ? (
                    // Pre-career term completed: show options based on whether they can continue
                    <div className="space-y-3">
                      <Alert className={preCareerGraduated ? "bg-green-500/10 border-green-500/50" : "bg-blue-500/10 border-blue-500/50"}>
                        <AlertDescription className={preCareerGraduated ? "text-green-400" : "text-blue-400"}>
                          <strong>Term {currentTerm} Complete!</strong>
                          <p className="mt-1 text-sm">
                            {preCareerGraduated ? (
                              // Graduated - must select a career
                              selectedCareer.preCareerType === 'university' ? (
                                <>
                                  You have graduated from University{graduatedWithHonours ? ' with Honours' : ''}!
                                  You receive DM+{graduatedWithHonours ? '2' : '1'} to qualify for: Agent, Army, Citizen (Corporate), Entertainer (Journalist), Marines, Navy, Scholar, or Scouts.
                                </>
                              ) : (
                                <>
                                  You have graduated from Military Academy{graduatedWithHonours ? ' with Honours' : ''}!
                                  {graduatedWithHonours
                                    ? ` You automatically enter your designated branch at Rank O1 with a commission.`
                                    : ` You automatically enter your designated branch with DM+2 on your first commission roll.`
                                  }
                                </>
                              )
                            ) : (
                              // Did not graduate this term
                              selectedCareer.preCareerType === 'university' ? (
                                <>
                                  You have completed Term {currentTerm} at University but did not graduate yet.
                                </>
                              ) : (
                                <>
                                  You have completed Term {currentTerm} at Military Academy but did not graduate yet.
                                </>
                              )
                            )}
                          </p>
                          {preCareerGraduated ? (
                            <p className="mt-2 text-xs text-yellow-400">
                              You have graduated and must now select a career.
                            </p>
                          ) : currentTerm < (selectedCareer.maxTerms || 3) ? (
                            <p className="mt-2 text-xs text-blue-400/80">
                              You may continue for another term (max {selectedCareer.maxTerms || 3} terms) or proceed to career selection.
                            </p>
                          ) : (
                            <p className="mt-2 text-xs text-yellow-400">
                              You have reached the maximum number of terms ({selectedCareer.maxTerms || 3}). You must now select a career.
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-2">
                        {/* Continue button: only if NOT graduated AND under max terms */}
                        {!preCareerGraduated && currentTerm < (selectedCareer.maxTerms || 3) ? (
                          <Button
                            onClick={startNewTerm}
                            variant="outline"
                            className="flex-1 border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                          >
                            Continue Another Term
                          </Button>
                        ) : !preCareerGraduated ? null : (
                          // Grayed out button to show they can't continue
                          <Button
                            disabled
                            variant="outline"
                            className="flex-1 border-terminal-primary/20 text-terminal-primary/30 cursor-not-allowed"
                          >
                            Continue Another Term
                          </Button>
                        )}
                        <Button
                          onClick={selectNextCareerFromPreCareer}
                          className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 border border-terminal-primary/50"
                        >
                          Select Your Career
                        </Button>
                      </div>
                    </div>
                  ) : !isSwitchingAssignment ? (
                    // Regular career: show start next term, switch career, switch assignment, or muster out
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={startNewTerm}
                          className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 border border-terminal-primary/50"
                        >
                          Start Term {currentTerm + 1}
                        </Button>
                        <Button
                          onClick={musterOut}
                          className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                        >
                          Muster Out
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={switchToNewCareer}
                          variant="outline"
                          className="flex-1 border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                        >
                          Switch Career
                        </Button>
                        {canSwitchAssignment() && (
                          <Button
                            onClick={startSwitchAssignment}
                            variant="outline"
                            className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                          >
                            Switch Assignment
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Assignment switching UI
                    <div className="space-y-3">
                      <Alert className="bg-blue-500/10 border-blue-500/50">
                        <AlertDescription className="text-blue-400">
                          <strong>Switch Assignment</strong>
                          {isSimpleAssignmentChange() ? (
                            <p className="mt-1 text-xs">
                              Select a new assignment. A qualification roll is required. If unsuccessful, you continue with your current assignment without penalty. If successful, you adopt the new assignment and retain your rank.
                            </p>
                          ) : (
                            <p className="mt-1 text-xs">
                              Changing assignments in {selectedCareer?.name} is treated as entering a new career. You will leave your current career (benefit rolls as normal), and must pass a qualification roll. If you fail, you must enter the Draft or become a Drifter. If successful, you start at Rank 0.
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>

                      {switchAssignmentResult === null && (
                        <div className="space-y-2">
                          <p className="text-xs text-terminal-primary/70">Select new assignment:</p>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedCareer?.assignments.map((assignment, idx) => (
                              <Button
                                key={idx}
                                onClick={() => rollSwitchAssignment(idx)}
                                disabled={idx === selectedAssignment}
                                variant="outline"
                                className={`border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 ${
                                  idx === selectedAssignment ? 'opacity-40 cursor-not-allowed' : ''
                                }`}
                              >
                                {assignment.name}
                                {idx === selectedAssignment ? ' (current)' : ''}
                                <span className="ml-2 text-xs text-terminal-primary/50">
                                  Survival: {assignment.survivalStat.toUpperCase()} {assignment.survivalTarget}+ | Advancement: {assignment.advancementStat.toUpperCase()} {assignment.advancementTarget}+
                                </span>
                              </Button>
                            ))}
                          </div>
                          <Button
                            onClick={() => {
                              setIsSwitchingAssignment(false);
                              setSwitchAssignmentTarget(null);
                              setSwitchAssignmentRollLog('');
                              setSwitchAssignmentResult(null);
                            }}
                            variant="outline"
                            className="w-full border-terminal-primary/30 text-terminal-primary/60 hover:bg-terminal-primary/10"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {switchAssignmentResult !== null && (
                        <div className="space-y-2">
                          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                            <p className="text-xs text-terminal-primary/80 font-mono">{switchAssignmentRollLog}</p>
                          </div>

                          {switchAssignmentResult === 'success' ? (
                            <Alert className="bg-green-500/10 border-green-500/50">
                              <AlertDescription className="text-green-400">
                                Assignment change successful! You are now assigned to{' '}
                                {selectedCareer?.assignments[switchAssignmentTarget!]?.name}.
                                {isSimpleAssignmentChange()
                                  ? ' You retain your current rank.'
                                  : ' You start at Rank 0 in your new assignment.'}
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <Alert className={isSimpleAssignmentChange() ? "bg-yellow-500/10 border-yellow-500/50" : "bg-red-500/10 border-red-500/50"}>
                              <AlertDescription className={isSimpleAssignmentChange() ? "text-yellow-400" : "text-red-400"}>
                                {isSimpleAssignmentChange()
                                  ? 'Qualification roll failed. You continue with your current assignment without penalty.'
                                  : 'Qualification roll failed! You must enter the Draft or become a Drifter.'}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Action buttons after roll result */}
                          {switchAssignmentResult === 'success' || isSimpleAssignmentChange() ? (
                            <Button
                              onClick={confirmSwitchAssignment}
                              className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                            >
                              Continue
                            </Button>
                          ) : (
                            // Failed new-career-style assignment change: draft or drifter
                            <div className="flex gap-2">
                              {!hasUsedDraft && (
                                <Button
                                  onClick={() => handleFailedNewCareerAssignmentSwitch('draft')}
                                  className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                                >
                                  Enter the Draft
                                </Button>
                              )}
                              <Button
                                onClick={() => handleFailedNewCareerAssignmentSwitch('drifter')}
                                variant="outline"
                                className="flex-1 border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                              >
                                Become a Drifter
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* Aging Result Alert */}
                {agingPending && agingResult && (
                  <Alert className={agingResult.passed ? "bg-green-500/10 border-green-500/50" : agingResult.crisisCheck?.isCrisis ? "bg-red-500/10 border-red-500/50" : "bg-yellow-500/10 border-yellow-500/50"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className={agingResult.passed ? "text-green-400" : agingResult.crisisCheck?.isCrisis ? "text-red-400" : "text-yellow-400"}>
                      <div className="font-bold mb-1">Aging Roll (Term {agingResult.termNumber})</div>
                      <div className="text-sm mb-2">{agingResult.message}</div>
                      {!agingResult.passed && agingResult.effects.effects.length > 0 && (
                        <div className="text-xs text-terminal-primary/70">
                          Effects: {agingResult.effects.effects.map((e, i) => `${e.stat.toUpperCase()} ${e.modifier}`).join(', ')}
                        </div>
                      )}
                      {agingResult.crisisCheck?.isCrisis && (
                        <div className="mt-2 text-xs text-red-400 font-bold">
                          {agingResult.crisisCheck.message}
                        </div>
                      )}
                      <Button
                        onClick={() => setAgingPending(false)}
                        size="sm"
                        className="mt-2 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        Acknowledge
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {characterData.lifepath_log.length > 0 && (
                  <div className="border border-terminal-primary/30 rounded p-4 max-h-80 overflow-y-auto">
                    <h3 className="text-sm font-bold text-terminal-primary uppercase mb-2">Lifepath Log</h3>
                    <div className="space-y-3">
                      {characterData.lifepath_log.map((term, idx) => (
                        <div key={idx} className="text-xs text-terminal-primary/70 pb-3 border-b border-terminal-primary/20 last:border-0">
                          <div className="font-bold text-terminal-primary">Term {term.termNumber} - Age {term.age}</div>
                          <div>{term.assignment} • {term.rankTitle}</div>
                          {term.survived ? (
                            <>
                              <div className="text-green-400">✓ Survived</div>
                              {term.advanced && <div className="text-green-400">✓ Advanced</div>}
                              <div className="mt-1">{term.event}</div>
                              {term.skillsGained.length > 0 && (
                                <div className="mt-1">
                                  <span className="text-terminal-primary/60">Skills: </span>
                                  {term.skillsGained.join(', ')}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="text-red-400">✗ Mishap: {term.mishap}</div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(4)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                    disabled={isInTerm}
                  >
                    Back
                  </Button>
                </div>
                </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 6: REVIEW */}
          <TabsContent value="step6">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <CardTitle className="text-terminal-primary">Character Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-terminal-primary mb-1">
                    {characterData.name || 'Unnamed Character'}
                  </h2>
                  <p className="text-terminal-primary/70">
                    {characterData.career} • {getRankTitle(selectedCareer, characterData.rank, isCommissioned, selectedCareer?.assignments[selectedAssignment]?.name)} • Age {characterData.age} • {characterData.terms_served} Terms
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-terminal-primary uppercase mb-2">Characteristics</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(['strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'] as const).map((key) => (
                      <div key={key} className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-2">
                        <div className="text-xs text-terminal-primary/60 uppercase">{key.slice(0, 3)}</div>
                        <div className="text-lg font-bold text-terminal-primary">{characterData.characteristics[key].total}</div>
                        <div className="text-xs text-terminal-primary/60">DM: {getDMDisplay(characterData.characteristics[key].total)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-terminal-primary uppercase mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(characterData.skills)
                      .filter(([_, state]) => state.proficient && parseInt(state.value) > 0)
                      .sort((a, b) => parseInt(b[1].value) - parseInt(a[1].value))
                      .map(([skill, state]) => (
                        <div key={skill} className="bg-terminal-primary/10 border border-terminal-primary/30 rounded px-3 py-1">
                          <span className="text-terminal-primary">{skill.replace(/_/g, ' ')}</span>
                          <span className="text-terminal-primary/70 ml-1">-{state.value}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                    <div className="text-sm text-terminal-primary/70">Cash on Hand</div>
                    <div className="text-xl font-bold text-terminal-primary">{characterData.cash_on_hand.toLocaleString()} Cr</div>
                  </div>
                  {characterData.pension > 0 && (
                    <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                      <div className="text-sm text-terminal-primary/70">Annual Pension</div>
                      <div className="text-xl font-bold text-terminal-primary">{characterData.pension.toLocaleString()} Cr/year</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(5)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSaveCharacter}
                    disabled={!characterData.name}
                    className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Character
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
