import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dices, User, Briefcase, Award, Save, ArrowRight, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Star, Ship, Users, Rocket, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCampaign } from '@/contexts/CampaignContext';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/localStorage';
import { ALL_CAREERS, BACKGROUND_SKILLS, getPreCareerEvent, CAREER_PRISONER, rollInitialParoleThreshold, CAREER_PSION, performPsiTesting, PSIONIC_TALENTS, type PsiTestResult } from './careers';
import type { CareerDefinition, Characteristics, StructuredEvent, EventOutcome, GameEvent, EventEffects, CharacteristicName } from './careers';
import { isGameEvent } from './careers';
import {
  rollDraft, type DraftResult,
  getLifeEvent, getInjury, getUnusualEvent,
  rollAging, applyAgingEffects, checkAgingCrisis, getAgingThreshold,
  type AgingRollResult, type AgingCrisisResult,
  rollAnagathicsObtain, rollAnagathicsCost,
  type AnagathicsObtainResult,
  calculateMedicalCoverage, calculateInjuryCost,
  type MedicalCoverageResult,
  LIFE_EVENTS, INJURY_TABLE, UNUSUAL_EVENTS,
} from './tables';
import { EventHandler } from './EventHandler';
import { rollDiceExpression, rollDice as rollDiceUtil } from './eventProcessor';
import { SpecialtySelector, needsSpecialtySelection, getBaseSkillName } from './SpecialtySelector';
import { MusteringOut } from './MusteringOut';
import { RACES, getRaceById, applyRaceModifiers, type Race, type RaceTrait } from './races';
import { getCareerTheme, getCareerCardStyle, getCareerTextStyle, type CareerTheme } from './careerThemes';
import { CREW_POSITION_PRESETS, type TermRecord } from '@/types/database';
import { AnimatedDiceValue } from './AnimatedDiceValue';
import { CareerTableDisplay } from './CareerTableDisplay';

// ============================================================================
// TYPE DEFINITIONS (Component-specific)
// ============================================================================

interface SkillState {
  proficient: boolean;
  value: string;
  customLabel?: string;
}

// Track each career served for mustering out benefits
interface CareerRecord {
  careerName: string;
  assignment: string;
  termsServed: number;
  highestRank: number;
  isCommissioned: boolean;
  benefitDMs: number[];      // Individual benefit DM bonuses (each used once during mustering out)
  extraBenefitRolls: number; // Extra benefit rolls from events
  isPreCareer: boolean;      // Pre-careers don't get benefits
  /** True if benefit rolls for this career have already been processed — set
   *  when the player voluntarily leaves a career mid-chargen and takes their
   *  between-career mustering-out. Final mustering-out skips these so the
   *  same career can't be benefit-rolled twice. */
  benefitsTaken?: boolean;
}

interface CharacteristicValue {
  total: number;
  current: number;
}

interface CharacterData {
  // Header info
  name: string;
  character_type: 'pc' | 'npc';
  species: string;       // Race name (Human, Aslan, Vargr, Bwap)
  raceId: string;        // Race ID for lookups
  raceTraits: RaceTrait[]; // Stored race traits
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
  lostBenefitCareers?: string[];  // Careers that lost benefits from events

  // Psionic tracking
  psiTested?: boolean;            // Whether PSI has been tested
  psiTalents?: string[];          // Acquired psionic talents
  canTestPsi?: boolean;           // Whether character has been granted PSI testing (event-gated)

  // Event-granted career effects
  eventQualificationDM?: number;  // DM bonus to next qualification roll from events
  allowedCareers?: string[];      // Careers unlocked by events (bypass qualification)

  // Medical debt and anagathics tracking
  medicalDebt?: number;
  agingCrisisFailQualification?: boolean;
  isUsingAnagathics?: boolean;
  anagathicsStartTerm?: number;
  anagathicsTotalCost?: number;

  // Anagathics tracking: once taken, every subsequent term requires two Survival rolls.
  hasAnagathics?: boolean;
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

const parseSkillGain = (skillText: string): { skill: string; isStat: boolean; stat?: keyof Characteristics } => {
  // Check if it's a stat increase (e.g., "Dexterity +1")
  const statMatch = skillText.match(/(Strength|Dexterity|Endurance|Intellect|Education|Social|Psionics|PSI)\s*\+1/i);
  if (statMatch) {
    const matched = statMatch[1].toLowerCase();
    const statName = (matched === 'psi' ? 'psionics' : matched) as keyof Characteristics;
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
  const { saveCharacter, crewGroups, vehicles, currentPlayer } = useCampaign();
  const [step, setStep] = useState(1);

  // Draft persistence state
  const DRAFT_KEY = `traveller_chargen_draft${currentPlayer?.id ? `_${currentPlayer.id}` : ''}`;
  const [showResumeDraft, setShowResumeDraft] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Crew selection state for the final save step
  const [selectedCrewId, setSelectedCrewId] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    character_type: 'pc',
    species: 'Human',
    raceId: 'human',
    raceTraits: [],
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
    lostBenefitCareers: [],
    // Psionic tracking
    psiTested: false,
    psiTalents: [],
    canTestPsi: false,
    // Event-granted career effects
    eventQualificationDM: 0,
    allowedCareers: [],
    // Anagathics
    hasAnagathics: false,
  });

  // Psionic testing state
  const [psiTestResult, setPsiTestResult] = useState<PsiTestResult | null>(null);
  const [showPsiTesting, setShowPsiTesting] = useState(false);
  const [psiTalentOrder, setPsiTalentOrder] = useState<typeof PSIONIC_TALENTS[number][]>([...PSIONIC_TALENTS]);
  const [manualPsiRoll, setManualPsiRoll] = useState('');
  const [manualTalentRolls, setManualTalentRolls] = useState<Partial<Record<typeof PSIONIC_TALENTS[number], string>>>({});

  const [characteristicRolls, setCharacteristicRolls] = useState<number[]>([]);
  const [hasRolled, setHasRolled] = useState(false);
  const [glowingStats, setGlowingStats] = useState<Set<string>>(new Set());
  const prevCharRef = useRef<Record<string, number>>({});
  const [rollingStats, setRollingStats] = useState<Set<string>>(new Set());

  // Detect characteristic increases and flash the stat box green
  useEffect(() => {
    const stats = ['strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'] as const;
    const changed: string[] = [];
    for (const stat of stats) {
      const newVal = characterData.characteristics[stat].total;
      const oldVal = prevCharRef.current[stat];
      if (oldVal !== undefined && newVal > oldVal) {
        changed.push(stat);
      }
      prevCharRef.current[stat] = newVal;
    }
    if (changed.length === 0) return;
    setGlowingStats(new Set(changed));
    const t = setTimeout(() => setGlowingStats(new Set()), 850);
    return () => clearTimeout(t);
  }, [characterData.characteristics]);
  const [selectedRollIndex, setSelectedRollIndex] = useState<number | null>(null);
  const [selectedRace, setSelectedRace] = useState<Race>(RACES[0]); // Default to Human
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
  const [showLifepathLog, setShowLifepathLog] = useState(true);
  const [graduatedWithHonours, setGraduatedWithHonours] = useState(false);
  const [needsCommissionRoll, setNeedsCommissionRoll] = useState(false);
  const [commissionRollDM, setCommissionRollDM] = useState(0);
  const [commissionAttempted, setCommissionAttempted] = useState(false);
  const [commissionRollLog, setCommissionRollLog] = useState<string>('');
  const [forcedContinueInCareer, setForcedContinueInCareer] = useState(false);
  const [forcedLeaveAfterTerm, setForcedLeaveAfterTerm] = useState(false);
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

  // Pending table redirect state - shows table & manual roller before auto-rolling
  const [pendingTableRedirect, setPendingTableRedirect] = useState<'life_events' | 'injury' | 'unusual_events' | null>(null);
  const [pendingTableIsMishap, setPendingTableIsMishap] = useState(false);

  // Draft system state
  const [hasUsedDraft, setHasUsedDraft] = useState(false);
  const [draftRolled, setDraftRolled] = useState(false);
  const [awaitingDraftManualRoll, setAwaitingDraftManualRoll] = useState(false);
  const [draftManualInput, setDraftManualInput] = useState('');

  // Basic Training state
  const [basicTrainingApplied, setBasicTrainingApplied] = useState(false);
  const [basicTrainingSkillSelected, setBasicTrainingSkillSelected] = useState<string | null>(null);

  // Specialty selection state - for skills with specialties that need user choice
  const [pendingSpecialtySkill, setPendingSpecialtySkill] = useState<string | null>(null);
  const [pendingSpecialtySource, setPendingSpecialtySource] = useState<string>(''); // For logging purposes
  const [pendingAnyTalentSource, setPendingAnyTalentSource] = useState<string>('');

  // Training-roll phase state (happens at the START of a term, per Traveller 2e).
  // Counter-based so advancement success (from the previous term) can grant a
  // second roll this term via `carriedAdvancementBonus`.
  const [termSkillRollsUsed, setTermSkillRollsUsed] = useState<number>(0);
  const [termSkillRollsAllowed, setTermSkillRollsAllowed] = useState<number>(1);
  const termSkillSelected = termSkillRollsUsed >= termSkillRollsAllowed;
  const [expandedSkillTable, setExpandedSkillTable] = useState<string | null>(null);
  const [skillTableRollResult, setSkillTableRollResult] = useState<number | null>(null);
  // Set when advancement succeeds in a term; consumed by the NEXT term's
  // startNewTerm to grant an extra training roll. Cleared on career switch so
  // the bonus can't bleed into a fresh career.
  const [carriedAdvancementBonus, setCarriedAdvancementBonus] = useState<boolean>(false);

  // Event DM bonuses state - track bonuses granted by events for next roll
  const [eventAdvancementDM, setEventAdvancementDM] = useState<number>(0);
  const [eventBenefitDMs, setEventBenefitDMs] = useState<number[]>([]);  // Individual DM bonuses, each used once
  const [extraBenefitRolls, setExtraBenefitRolls] = useState<number>(0);

  // Mustering out state
  const [isMusteringOut, setIsMusteringOut] = useState(false);
  const [forceLeaveCareer, setForceLeaveCareer] = useState(false);
  const [pendingInjurySeverity, setPendingInjurySeverity] = useState<'severe' | null>(null);
  // Between-career muster state — the CareerRecord of the career the player is
  // leaving, plus a deferred "what to do after the muster completes" callback.
  // The 3-cash-rolls-lifetime cap is enforced by passing `lifetimeCashRollsUsed`
  // into <MusteringOut /> and updating it from the onComplete result.
  const [midCareerMusterRecord, setMidCareerMusterRecord] = useState<CareerRecord | null>(null);
  const [lifetimeCashRollsUsed, setLifetimeCashRollsUsed] = useState<number>(0);

  // Mishap GameEvent state - for mishaps that require player interaction (rolls, choices)
  const [pendingMishapGameEvent, setPendingMishapGameEvent] = useState<GameEvent | null>(null);
  const [mishapRollNumber, setMishapRollNumber] = useState<number | null>(null);
  const [needsMishapRoll, setNeedsMishapRoll] = useState(false); // True when survival failed and waiting for manual mishap roll

  // Aging state (interactive)
  const [agingResult, setAgingResult] = useState<AgingRollResult | null>(null);
  const [agingPending, setAgingPending] = useState(false);
  const [agingPhysicalChosen, setAgingPhysicalChosen] = useState(false);
  const [agingMentalChosen, setAgingMentalChosen] = useState(false);
  const [agingCrisis, setAgingCrisis] = useState<AgingCrisisResult | null>(null);
  const [agingCrisisAcknowledged, setAgingCrisisAcknowledged] = useState(false);
  const [agingChosenEffects, setAgingChosenEffects] = useState<{ stat: string; modifier: number }[]>([]);

  // Anagathics state
  const [showAnagathicsPrompt, setShowAnagathicsPrompt] = useState(false);
  const [anagathicsRollResult, setAnagathicsRollResult] = useState<AnagathicsObtainResult | null>(null);

  // Medical bills state
  const [pendingMedicalBill, setPendingMedicalBill] = useState<MedicalCoverageResult | null>(null);

  // Assignment switching state
  const [isSwitchingAssignment, setIsSwitchingAssignment] = useState(false);
  const [switchAssignmentTarget, setSwitchAssignmentTarget] = useState<number | null>(null);
  const [switchAssignmentRollLog, setSwitchAssignmentRollLog] = useState<string>('');
  const [switchAssignmentResult, setSwitchAssignmentResult] = useState<'success' | 'failure' | null>(null);

  // Manual dice mode state - for users who prefer rolling physical dice
  const [useManualDice, setUseManualDice] = useState(false);
  const [manualDiceValue, setManualDiceValue] = useState<string>('');

  // Always return all careers - locked state is handled by isCareerAvailable()
  const getAvailableCareers = (): CareerDefinition[] => {
    return ALL_CAREERS;
  };

  // Check if a career can be selected (returns availability + reason if locked)
  const isCareerAvailable = (career: CareerDefinition): { available: boolean; reason?: string } => {
    const totalTerms = characterData.totalCareerTerms || 0;

    // Forced career: only that career is available
    if (characterData.forcedCareer) {
      if (career.isPrisonerCareer && characterData.forcedCareer === 'Prisoner') {
        return { available: true };
      }
      if (career.name === characterData.forcedCareer) {
        return { available: true };
      }
      return { available: false, reason: `You must enter the ${characterData.forcedCareer} career` };
    }

    // Pre-careers: limited by terms and one-time use
    if (career.isPreCareer) {
      if (characterData.hasCompletedPreCareer) return { available: false, reason: 'Already completed a pre-career' };
      if (totalTerms >= 3) return { available: false, reason: 'Pre-careers unavailable after 3 terms' };
    }

    // Prisoner: only via forced entry
    if (career.isPrisonerCareer) {
      return { available: false, reason: 'Can only enter through sentencing' };
    }

    // Psion: requires PSI testing with PSI > 0
    if (career.requiresPsiTesting) {
      if (!characterData.psiTested) {
        return { available: false, reason: 'Requires psionic testing' };
      }
      if ((characterData.characteristics.psionics?.total || 0) === 0) {
        return { available: false, reason: 'No psionic potential detected' };
      }
    }

    return { available: true };
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

  const handleCharacterTypeChange = (characterType: 'pc' | 'npc') => {
    setCharacterData(prev => ({ ...prev, character_type: characterType }));
  };

  const handleSpeciesChange = (species: string) => {
    setCharacterData(prev => ({ ...prev, species }));
  };

  // Handle race selection from dropdown - updates both selectedRace and characterData
  const handleRaceSelection = (raceId: string) => {
    const race = RACES.find(r => r.id === raceId);
    if (race) {
      setSelectedRace(race);
      setCharacterData(prev => ({
        ...prev,
        species: race.name,
        raceId: race.id,
        raceTraits: race.traits,
      }));
    }
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

  const rollSingleCharacteristic = (key: keyof Omit<Characteristics, 'psionics'>, manualRoll?: number) => {
    const roll = manualRoll ?? rollDice(2, 6);

    // Trigger dice spin animation for ~420ms before revealing result
    setRollingStats(prev => new Set([...prev, key]));
    setTimeout(() => {
      setCharacterData(prev => ({
        ...prev,
        characteristics: {
          ...prev.characteristics,
          [key]: { total: roll, current: roll },
        },
      }));
      setRollingStats(prev => { const next = new Set(prev); next.delete(key); return next; });

      // Recalculate background skills if education changed
      if (key === 'education') {
        const eduDM = getDM(roll);
        setBackgroundSkillsRemaining(Math.max(0, eduDM + 3));
      }
    }, 420);
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

    // Check if this is the last roll being assigned
    const isLastRoll = characteristicRolls.length === 1;

    setCharacterData(prev => {
      // Build new characteristics with this roll
      let newChars = {
        ...prev.characteristics,
        [key]: { total: rollValue, current: rollValue },
      };

      // If this is the last roll, apply race modifiers
      if (isLastRoll) {
        newChars = applyRaceModifiers(newChars, selectedRace);
      }

      return {
        ...prev,
        characteristics: newChars,
        // Update race info if this is the last roll
        ...(isLastRoll ? {
          species: selectedRace.name,
          raceId: selectedRace.id,
          raceTraits: selectedRace.traits,
        } : {}),
      };
    });

    // Remove the used roll
    setCharacteristicRolls(prev => prev.filter((_, idx) => idx !== selectedRollIndex));
    setSelectedRollIndex(null);

    // Check if all rolls are assigned
    if (isLastRoll) {
      // Last roll assigned, calculate background skills (accounting for race modifier)
      const raceModifier = selectedRace.characteristicModifiers.find(m => m.stat === 'education')?.modifier || 0;
      const finalEduValue = key === 'education'
        ? Math.max(1, rollValue + raceModifier)
        : Math.max(1, characterData.characteristics.education.total + raceModifier);
      const eduDM = getDM(finalEduValue);
      setBackgroundSkillsRemaining(Math.max(0, eduDM + 3));
    }
  };

  const assignRolls = () => {
    if (characteristicRolls.length !== 6) return;

    let newChars = createEmptyCharacteristics();
    const charKeys: Array<keyof Omit<Characteristics, 'psionics'>> = [
      'strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'
    ];

    characteristicRolls.forEach((roll, index) => {
      const key = charKeys[index];
      newChars[key] = { total: roll, current: roll };
    });

    // Apply race modifiers (cannot go below 1)
    newChars = applyRaceModifiers(newChars, selectedRace);

    setCharacterData(prev => ({
      ...prev,
      characteristics: newChars,
      species: selectedRace.name,
      raceId: selectedRace.id,
      raceTraits: selectedRace.traits,
    }));

    // Calculate background skills (EDU DM + 3) - use post-modifier education
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

  // Finalize characteristics with race modifiers (for individual/manual roll modes)
  const finalizeCharacteristicsWithRace = () => {
    // Check if race modifiers already applied (species already set to non-human)
    if (characterData.raceId === selectedRace.id && characterData.species === selectedRace.name) {
      // Already finalized — still recalculate background skills to be safe
      const eduDM = getDM(characterData.characteristics.education.total);
      setBackgroundSkillsRemaining(Math.max(0, eduDM + 3));
      setStep(3);
      return;
    }

    // Apply race modifiers to current characteristics
    const newChars = applyRaceModifiers(characterData.characteristics, selectedRace);

    setCharacterData(prev => ({
      ...prev,
      characteristics: newChars,
      species: selectedRace.name,
      raceId: selectedRace.id,
      raceTraits: selectedRace.traits,
    }));

    // Recalculate background skills with race-modified education
    const eduDM = getDM(newChars.education.total);
    setBackgroundSkillsRemaining(Math.max(0, eduDM + 3));

    setStep(3);
  };

  // ============================================================================
  // STEP 3: BACKGROUND SKILLS
  // ============================================================================

  const selectBackgroundSkill = (skillKey: string) => {
    const isCurrentlySelected = characterData.skills[skillKey]?.proficient;

    if (isCurrentlySelected) {
      // Deselect the skill
      setCharacterData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [skillKey]: { proficient: false, value: '0' },
        },
      }));
      setBackgroundSkillsRemaining(prev => prev + 1);
    } else {
      // Select the skill (only if we have remaining slots)
      if (backgroundSkillsRemaining <= 0) return;

      setCharacterData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [skillKey]: { proficient: true, value: '0' },
        },
      }));
      setBackgroundSkillsRemaining(prev => prev - 1);
    }
  };

  // ============================================================================
  // STEP 4: CAREER SELECTION
  // ============================================================================

  const attemptQualification = (manualRoll?: number) => {
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

    // Check for event-granted career unlock (bypass qualification)
    if (characterData.allowedCareers?.includes(selectedCareer.name)) {
      setQualificationPassed(true);
      setQualificationRollLog('Career unlocked by event - automatic qualification.');
      setCharacterData(prev => ({
        ...prev,
        career: selectedCareer.name,
        notes: prev.notes + `\nEntered ${selectedCareer.name} (unlocked by event)`,
        // Remove the career from allowed list (one-time use)
        allowedCareers: prev.allowedCareers?.filter(c => c !== selectedCareer.name) || [],
      }));
      return;
    }

    // Auto-fail qualification after aging crisis
    if (characterData.agingCrisisFailQualification) {
      setQualificationPassed(false);
      setQualificationRollLog('Automatic failure - still recovering from aging crisis.');
      setCharacterData(prev => ({
        ...prev,
        agingCrisisFailQualification: false, // Reset after use (one-time penalty)
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

    // Apply event-granted qualification DM
    if (characterData.eventQualificationDM && characterData.eventQualificationDM > 0) {
      dm += characterData.eventQualificationDM;
      dmDetails.push(`Event DM +${characterData.eventQualificationDM}`);
    }

    const roll = manualRoll ?? rollDice(2, 6);
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
        eventQualificationDM: 0, // Reset after using
        preCareerQualificationDM: 0, // Reset after first use - one-time bonus
        // Note: totalCareerTerms is incremented in completeTerm(), not here
      }));
    } else {
      // Reset eventQualificationDM and preCareerQualificationDM even on failure (one-time bonuses)
      setCharacterData(prev => ({
        ...prev,
        eventQualificationDM: 0,
        preCareerQualificationDM: 0, // Reset after first use - one-time bonus
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
    if (useManualDice) {
      // Defer to runDraftRoll once the player enters their 1D6 result.
      setAwaitingDraftManualRoll(true);
      setDraftManualInput('');
      return;
    }
    resolveDraft(rollDraft());
  };

  const runDraftRoll = (manualRoll: number) => {
    if (hasUsedDraft) return;
    const clamped = Math.min(6, Math.max(1, Math.trunc(manualRoll)));
    resolveDraft(rollDraft(clamped));
  };

  const resolveDraft = (draftResult: DraftResult) => {
    setHasUsedDraft(true);
    setDraftRolled(true);
    setAwaitingDraftManualRoll(false);
    setDraftManualInput('');

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
    const termsServed = characterData.totalCareerTerms || 0;
    const parsedPsiRoll = manualPsiRoll.trim() === '' ? undefined : Number(manualPsiRoll);
    const parsedTalentRolls: Partial<Record<typeof PSIONIC_TALENTS[number], number>> = {};
    psiTalentOrder.forEach((talent) => {
      const rawValue = manualTalentRolls[talent];
      if (rawValue != null && rawValue.trim() !== '') {
        const parsedValue = Number(rawValue);
        if (Number.isFinite(parsedValue)) {
          parsedTalentRolls[talent] = parsedValue;
        }
      }
    });

    const manualPsiValue = Number.isFinite(parsedPsiRoll) ? parsedPsiRoll : undefined;

    const result = performPsiTesting(termsServed, psiTalentOrder, {
      manualPsiRoll: manualPsiValue,
      manualTalentRolls: parsedTalentRolls,
    });
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

  const movePsiTalent = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= psiTalentOrder.length) return;
    setPsiTalentOrder(prev => {
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
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
        const currentValue = parseInt(prev.skills[skillKey]?.value || '0', 10);
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
    setCommissionRollLog('');
    setAdvancementRollLog('');
    setCurrentEvent(null);
    setEventRollResult(null);
    setEventResolved(false);
    setEventOutcomeApplied(false);
    setPendingSpecialtySkill(null);
    setPendingSpecialtySource('');
    // Training-roll phase happens at the START of the term (per Traveller 2e
    // Core Rulebook pp. 20, 46). Base count:
    //   - Very first term of very first career: 0 rolls (basic training package
    //     of 6 service skills is applied instead).
    //   - Any other term: 1 roll.
    // Plus: if the character advanced in the previous term AND stayed in the
    // same career, they get a second roll this term (carried bonus). The bonus
    // is cleared on career switch so it can't bleed across careers.
    const isVeryFirstTerm = newTermNumber === 1 && (characterData.totalCareerTerms || 0) === 0;
    const baseRolls = isVeryFirstTerm ? 0 : 1;
    const bonusRolls = carriedAdvancementBonus ? 1 : 0;
    setTermSkillRollsUsed(0);
    setTermSkillRollsAllowed(baseRolls + bonusRolls);
    setCarriedAdvancementBonus(false);
    setExpandedSkillTable(null);
    setSkillTableRollResult(null);
    // Reset commission state
    setCommissionAttempted(false);
    setCommissionRollLog('');
    // Reset advancement edge-case flags — they only apply between terms.
    setForcedContinueInCareer(false);
    setForcedLeaveAfterTerm(false);
    // Reset academy graduation skill selection state
    setAcademyGradSkillsSelected([]);
    setAcademyGradPendingSpecialty(null);
    // Reset assignment switching state
    setIsSwitchingAssignment(false);
    setSwitchAssignmentTarget(null);
    setSwitchAssignmentRollLog('');
    setSwitchAssignmentResult(null);
    // Reset mishap GameEvent state
    setPendingMishapGameEvent(null);
    setMishapRollNumber(null);
    setNeedsMishapRoll(false);
    // Reset forced leave state
    setForceLeaveCareer(false);
    // NOTE: commission state (commissionAttempted, commissionRollLog) is reset
    // above. runCommissionCheck handles all paths — including military academy
    // honours auto-pass via commissionRollDM === -999 — so the commission UI
    // simply appears after events resolve for eligible characters.

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

  // Process a mishap roll result (extracted for manual dice support)
  const applyMishapRoll = (mishapRoll: number) => {
    if (!selectedCareer) return;
    const assignment = selectedCareer.assignments[selectedAssignment];
    const mishapEntry = selectedCareer.mishapTable[mishapRoll - 1];
    setMishapRollNumber(mishapRoll);
    setNeedsMishapRoll(false);

    // Check if this mishap is a GameEvent (has rolls/choices)
    if (mishapEntry && typeof mishapEntry === 'object' && 'resolution' in mishapEntry) {
      // GameEvent mishap - needs player interaction through EventHandler
      setPendingMishapGameEvent(mishapEntry as GameEvent);
      // Don't log the term yet - wait for GameEvent resolution
    } else {
      // Simple string mishap - log immediately
      const mishap = mishapEntry ? getMishapDescription(mishapEntry) : 'Injured. Roll on the Injury table.';
      const ranks = getRanksForCareer(selectedCareer, isCommissioned, assignment.name);

      const termRecord: TermRecord = {
        termNumber: currentTerm,
        career: selectedCareer.name,
        assignment: assignment.name,
        age: characterData.age,
        survivalRoll: survivalRollLog || '',
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
  };

  const runSurvivalCheck = (manualRoll?: number) => {
    if (!selectedCareer || termSurvived !== null) return;

    const assignment = selectedCareer.assignments[selectedAssignment];
    const charValue = characterData.characteristics[assignment.survivalStat].total;
    let dm = getDM(charValue);

    // Apply prisoner survival DM (e.g., from gang membership)
    dm += characterData.prisonerSurvivalDM || 0;

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

    const roll = manualRoll ?? rollDice(2, 6);
    const total = roll + dm;
    const firstSurvived = total >= assignment.survivalTarget;

    // Anagathics: RAW requires two Survival rolls per term after the character
    // has taken anagathics. The second roll is always auto-generated so that
    // manual-dice users aren't prompted twice per term.
    const anagathicsActive =
      !isPreCareer &&
      characterData.hasAnagathics === true &&
      !selectedCareer.noAnagathics;
    const secondRoll = anagathicsActive ? rollDice(2, 6) : null;
    const secondTotal = secondRoll !== null ? secondRoll + dm : null;
    const secondSurvived =
      secondTotal !== null ? secondTotal >= assignment.survivalTarget : true;

    const survived = firstSurvived && secondSurvived;

    // Combined roll description reused in logs and lifepath records so the
    // second roll shows up alongside the first when anagathics is active.
    const rollDesc = `${roll} + ${dm} = ${total} (need ${assignment.survivalTarget}+)`;
    const rollDescWithAnagathics =
      anagathicsActive && secondRoll !== null && secondTotal !== null
        ? `${rollDesc}; 2nd (anagathics, auto): ${secondRoll} + ${dm} = ${secondTotal}`
        : rollDesc;

    setTermSurvived(survived);

    // Set survival/graduation roll log for regular careers
    if (!isPreCareer) {
      const firstLine = `Survival Roll: ${roll} + ${dm} = ${total} (need ${assignment.survivalTarget}+)`;
      const secondLine =
        anagathicsActive && secondRoll !== null && secondTotal !== null
          ? `\nAnagathics 2nd Survival Roll (auto): ${secondRoll} + ${dm} = ${secondTotal} (need ${assignment.survivalTarget}+)`
          : '';
      setSurvivalRollLog(`${firstLine}${secondLine}`);
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
        // Regular career mishap - if manual dice is on, wait for player to roll
        if (useManualDice) {
          setNeedsMishapRoll(true);
          return; // Wait for manual mishap roll
        }
        const mishapRoll = rollDice(1, 6);
        applyMishapRoll(mishapRoll);
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
              const currentSkill0 = parseInt(prev.skills[skill0Key]?.value || '0', 10);
              const currentSkill1 = parseInt(prev.skills[skill1Key]?.value || '0', 10);

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

  const runAdvancementCheck = (manualRoll?: number) => {
    if (!selectedCareer || !termSurvived || termAdvanced !== null) return;

    const assignment = selectedCareer.assignments[selectedAssignment];
    const charValue = characterData.characteristics[assignment.advancementStat].total;
    const charDM = getDM(charValue);
    const roll = manualRoll ?? rollDice(2, 6);

    // Include event advancement DM bonus if any
    const totalDM = charDM + eventAdvancementDM;
    const total = roll + totalDM;
    const advanced = total >= assignment.advancementTarget;

    setTermAdvanced(advanced);

    // Edge case: natural 12 means the character cannot leave this career next term.
    if (roll === 12) {
      setForcedContinueInCareer(true);
    }
    // Edge case: total <= terms-in-career means the character must leave after this term.
    const termsInThisCareer = characterData.lifepath_log.filter(
      t => t.career === selectedCareer.name
    ).length;
    if (total <= termsInThisCareer) {
      setForcedLeaveAfterTerm(true);
    }

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
        applyRankStatBonus(rankData.bonusStat, rankData.bonusStatFloor);
      }
    }

    // Successful advancement grants an extra training roll NEXT term (not this
    // one, per Traveller 2e Core Rulebook p. 20/46). The flag is consumed by
    // the next startNewTerm call and cleared on any career-reset path so it
    // can't carry across a career switch.
    if (advanced) {
      setCarriedAdvancementBonus(true);
    }
  };

  // Determine whether the character can attempt a commission this term.
  const isEligibleForCommission = (): boolean => {
    if (!selectedCareer) return false;
    if (!['Army', 'Navy', 'Marines'].includes(selectedCareer.name)) return false;
    if (isCommissioned) return false;
    const termsInThisCareer = characterData.lifepath_log.filter(
      t => t.career === selectedCareer.name
    ).length;
    const isFirstTermInCareer = termsInThisCareer === 0;
    const socValue = characterData.characteristics.social.total;
    return isFirstTermInCareer || socValue >= 9;
  };

  // Compose a short DM breakdown string for the commission UI.
  const getCommissionDMBreakdown = (): string => {
    if (!selectedCareer) return '';
    const termsInThisCareer = characterData.lifepath_log.filter(
      t => t.career === selectedCareer.name
    ).length;
    const isFirstTermInCareer = termsInThisCareer === 0;
    const termPenalty = isFirstTermInCareer ? 0 : -termsInThisCareer;
    const socDM = getDM(characterData.characteristics.social.total);
    const academyDM = commissionRollDM === -999 ? 0 : commissionRollDM;
    const parts: string[] = [];
    if (socDM !== 0) parts.push(`SOC DM ${socDM >= 0 ? '+' : ''}${socDM}`);
    if (termPenalty !== 0) parts.push(`${termPenalty} (terms in career)`);
    if (academyDM !== 0) parts.push(`+${academyDM} (academy)`);
    if (eventAdvancementDM !== 0) parts.push(`+${eventAdvancementDM} (event bonus)`);
    if (commissionRollDM === -999) return ' (Auto-pass: Military Academy honours)';
    return parts.length > 0 ? ` DM: ${parts.join(', ')}.` : '';
  };

  const runCommissionCheck = (manualRoll?: number) => {
    if (!selectedCareer || commissionAttempted) return;
    if (!isEligibleForCommission()) return;
    const target = selectedCareer.commissionTarget ?? 8;

    const termsInThisCareer = characterData.lifepath_log.filter(
      t => t.career === selectedCareer.name
    ).length;
    const isFirstTermInCareer = termsInThisCareer === 0;
    const termPenalty = isFirstTermInCareer ? 0 : -termsInThisCareer;

    const socValue = characterData.characteristics.social.total;
    const socDM = getDM(socValue);
    const autoPass = commissionRollDM === -999;
    const academyDM = autoPass ? 0 : commissionRollDM;
    const totalDM = socDM + termPenalty + academyDM + eventAdvancementDM;

    const roll = autoPass ? 12 : (manualRoll ?? rollDice(2, 6));
    const total = roll + totalDM;
    const success = autoPass || total >= target;

    setCommissionRollLog(
      autoPass
        ? 'Commission: Auto-pass (Military Academy honours graduate)'
        : `Commission Roll: ${roll} + ${totalDM} = ${total} (need ${target}+) ${success ? '✓ COMMISSIONED' : '✗ Failed'}`
    );
    setCommissionAttempted(true);

    if (success) {
      setIsCommissioned(true);
      const officerRanks = selectedCareer.ranks.officer ?? [];
      // On first commission, character jumps to officer rank 1 (index 0 in officer array).
      setCharacterData(prev => ({ ...prev, rank: 0 }));
      const rank1 = officerRanks[0];
      if (rank1?.skillBonus) {
        applySkillGain(rank1.skillBonus, 'Commission');
        setTermSkillsGained(prev => [...prev, `${rank1.skillBonus} (Commission)`]);
      }
      if (rank1?.bonusStat) {
        applyRankStatBonus(rank1.bonusStat, rank1.bonusStatFloor);
      }

      // Commission success: skip advancement this term.
      // Per the rules (and confirmed in stress-test), a successful commission
      // does NOT grant an extra training roll — only the rank 1 skill bonus.
      setTermAdvanced(false);
      setNeedsCommissionRoll(false);
      setCommissionRollDM(0);
      setEventAdvancementDM(0); // consumed
    }
    // On failure: leave termAdvanced === null so the advancement phase runs next.
  };

  /**
   * Applies a rank's stat bonus, honouring an optional floor.
   * Floor example: "SOC 10 or SOC +1, whichever is higher" -> bonusStatFloor: 10
   */
  const applyRankStatBonus = (statName: CharacteristicName, floor?: number) => {
    setCharacterData(prev => {
      const current = prev.characteristics[statName].total;
      const target = floor !== undefined ? Math.max(floor, current + 1) : current + 1;
      const delta = target - current;
      if (delta <= 0) return prev;
      return {
        ...prev,
        characteristics: {
          ...prev.characteristics,
          [statName]: {
            ...prev.characteristics[statName],
            total: target,
            current: prev.characteristics[statName].current + delta,
          },
        },
      };
    });
    // Use the latest-known total to compute the log delta; since state updates are async,
    // recompute from the ref-like fresh state by reading `characterData` below.
    const currentForLog = characterData.characteristics[statName].total;
    const targetForLog = floor !== undefined ? Math.max(floor, currentForLog + 1) : currentForLog + 1;
    const deltaForLog = targetForLog - currentForLog;
    if (deltaForLog > 0) {
      setTermSkillsGained(prev => [...prev, `${statName.toUpperCase()} +${deltaForLog} (rank bonus)`]);
    }
  };

  const rollEvent = (manualRoll?: number) => {
    if (!selectedCareer || !termSurvived || termEventRoll !== null) return;

    const roll = manualRoll ?? rollDice(2, 6);
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

  const rollEventCheck = (characteristic: keyof Omit<Characteristics, 'psionics'>, target: number, manualRoll?: number) => {
    const stat = characterData.characteristics[characteristic];
    const dm = getDM(stat.total);
    const roll = manualRoll ?? rollDice(2, 6);
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
          const currentValue = currentSkill ? parseInt(currentSkill.value, 10) || 0 : 0;

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
      // Apply skills (RAW: "if you already have the skill at that level or
      // higher, increase it by one instead"; requireExisting events always
      // increment by the granted level on the skill the player owns).
      if (effects.skills?.choices) {
        const grantedLevel = effects.skills.level ?? 1;
        const requireExisting = effects.skills.requireExisting === true;
        effects.skills.choices.forEach(skillName => {
          const skillKey = normalizeSkillName(skillName);
          setCharacterData(prev => {
            const currentSkill = prev.skills[skillKey];
            const currentValue = currentSkill ? parseInt(currentSkill.value, 10) || 0 : 0;
            let newValue: number;
            if (requireExisting) {
              newValue = currentValue + Math.max(grantedLevel, 1);
            } else if (grantedLevel > 0 && currentValue >= grantedLevel) {
              // RAW: "if you already have the skill at that level or higher,
              // increase it by one instead". Only applies for granted level ≥ 1;
              // a level-0 grant just confers basic proficiency.
              newValue = currentValue + 1;
            } else {
              newValue = Math.max(currentValue, grantedLevel);
            }
            setTermSkillsGained(log => [...log, `${skillName} → ${newValue} (event)`]);
            return {
              ...prev,
              skills: {
                ...prev.skills,
                [skillKey]: { proficient: true, value: newValue.toString() },
              },
            };
          });
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

        // Calculate medical bills for characteristic damage (injuries)
        const totalDamage = effects.characteristics.reduce((sum, c) => sum + Math.max(0, -c.modifier), 0);
        if (totalDamage > 0 && selectedCareer) {
          const injuryCost = calculateInjuryCost(totalDamage);
          const coverage = calculateMedicalCoverage(selectedCareer.name, characterData.rank, injuryCost);
          setPendingMedicalBill(coverage);
          if (coverage.outOfPocket > 0) {
            setCharacterData(prev => ({
              ...prev,
              medicalDebt: (prev.medicalDebt || 0) + coverage.outOfPocket,
            }));
          }
          setTermSkillsGained(prev => [
            ...prev,
            `Medical: Cr${injuryCost.toLocaleString()} (${coverage.coveragePercent}% covered by ${selectedCareer.name}). Out of pocket: Cr${coverage.outOfPocket.toLocaleString()}`,
          ]);
        }
      }

      // Apply social connections (resolve dice expressions) and update characterData
      if (effects.allies) {
        const count = rollDiceExpression(effects.allies);
        if (count > 0) {
          setCharacterData(prev => ({ ...prev, allies: prev.allies + count }));
          setTermSkillsGained(prev => [...prev, `${count} Allies (event)`]);
        }
      }
      if (effects.enemies) {
        const count = rollDiceExpression(effects.enemies);
        if (count > 0) {
          setCharacterData(prev => ({ ...prev, enemies: prev.enemies + count }));
          setTermSkillsGained(prev => [...prev, `${count} Enemies (event)`]);
        }
      }
      if (effects.rivals) {
        const count = rollDiceExpression(effects.rivals);
        if (count > 0) {
          setCharacterData(prev => ({ ...prev, rivals: prev.rivals + count }));
          setTermSkillsGained(prev => [...prev, `${count} Rivals (event)`]);
        }
      }
      if (effects.contacts) {
        const count = rollDiceExpression(effects.contacts);
        if (count > 0) {
          setCharacterData(prev => ({ ...prev, contacts: prev.contacts + count }));
          setTermSkillsGained(prev => [...prev, `${count} Contacts (event)`]);
        }
      }

      // Handle career effects
      if (effects.forceCareer) {
        setCharacterData(prev => ({ ...prev, forcedCareer: effects.forceCareer }));
        setTermSkillsGained(prev => [...prev, `Must enter ${effects.forceCareer} next term`]);
      }
      if (effects.failGraduation) {
        setPreCareerGraduated(false);
        setTermSurvived(false);
        setTermSkillsGained(prev => [...prev, 'Failed to graduate']);
      }
      if (effects.canTestPsi) {
        setCharacterData(prev => ({ ...prev, canTestPsi: true }));
        setTermSkillsGained(prev => [...prev, 'May test PSI in future']);
      }
      if (effects.allowCareer) {
        setCharacterData(prev => ({
          ...prev,
          allowedCareers: [...(prev.allowedCareers || []), effects.allowCareer!],
        }));
        setTermSkillsGained(prev => [...prev, `${effects.allowCareer} career unlocked`]);
      }
      if (effects.qualificationDM) {
        setCharacterData(prev => ({
          ...prev,
          eventQualificationDM: (prev.eventQualificationDM || 0) + effects.qualificationDM!,
        }));
        setTermSkillsGained(prev => [...prev, `DM+${effects.qualificationDM} to next qualification roll`]);
      }

      // Handle DM bonuses for future rolls
      if (effects.advancementDM) {
        setEventAdvancementDM(prev => prev + effects.advancementDM!);
        setTermSkillsGained(prev => [...prev, `DM+${effects.advancementDM} to next advancement roll`]);
      }
      if (effects.autoPromotion) {
        // Immediately promote rank by 1 (separate from advancement roll).
        // The advancement roll still runs normally afterwards and can grant
        // a second rank increase in the same term.
        if (selectedCareer) {
          const assignmentName = selectedCareer.assignments[selectedAssignment]?.name;
          const ranks = getRanksForCareer(selectedCareer, isCommissioned, assignmentName);
          setCharacterData(prev => {
            if (prev.rank < ranks.length - 1) {
              const newRank = prev.rank + 1;
              const rankData = ranks[newRank];
              const logEntry = `Auto-promoted to ${rankData.title}`;
              // Apply rank skill bonus inline
              if (rankData.skillBonus) {
                applySkillGain(rankData.skillBonus, 'Auto-Promotion');
                setTermSkillsGained(p => [...p, `${rankData.skillBonus} (Auto-Promotion: ${rankData.title})`]);
              }
              if (rankData.bonusStat) {
                applyRankStatBonus(rankData.bonusStat, rankData.bonusStatFloor);
              }
              setTermSkillsGained(p => [...p, logEntry]);
              return { ...prev, rank: newRank };
            }
            return prev;
          });
        }
      }
      if (effects.benefitDM && effects.benefitDM > 0) {
        // Add each benefit DM as a separate entry (each can only be used once)
        setEventBenefitDMs(prev => [...prev, effects.benefitDM!]);
        setTermSkillsGained(prev => [...prev, `DM+${effects.benefitDM} to one Benefit roll`]);
      }
      if (effects.extraBenefit) {
        setExtraBenefitRolls(prev => prev + 1);
        setTermSkillsGained(prev => [...prev, 'Extra Benefit roll']);
      }

      // Prisoner career effects
      if (effects.paroleThresholdChange) {
        setCharacterData(prev => ({
          ...prev,
          paroleThreshold: (prev.paroleThreshold || 0) + effects.paroleThresholdChange!,
        }));
        const sign = effects.paroleThresholdChange > 0 ? '+' : '';
        setTermSkillsGained(prev => [...prev, `Parole threshold ${sign}${effects.paroleThresholdChange}`]);
      }
      if (effects.survivalDM) {
        setCharacterData(prev => ({
          ...prev,
          prisonerSurvivalDM: (prev.prisonerSurvivalDM || 0) + effects.survivalDM!,
        }));
        setTermSkillsGained(prev => [...prev, `DM+${effects.survivalDM} to survival rolls`]);
      }
      if (effects.rerollParoleThreshold) {
        const newThreshold = rollDice(1, 6) + 2;
        setCharacterData(prev => ({
          ...prev,
          paroleThreshold: newThreshold,
        }));
        setTermSkillsGained(prev => [...prev, `Parole threshold rerolled to ${newThreshold}`]);
      }
      if (effects.leaveCareer) {
        setForceLeaveCareer(true);
        setTermSkillsGained(prev => [...prev, 'You leave this career.']);
      }
      if (effects.loseBenefits) {
        setCharacterData(prev => ({
          ...prev,
          lostBenefitCareers: [...(prev.lostBenefitCareers || []), selectedCareer?.name || ''],
        }));
        setTermSkillsGained(prev => [...prev, 'Lost all Benefit rolls from this career']);
      }
      if (effects.paroleReduction) {
        const reduction = typeof effects.paroleReduction === 'number'
          ? effects.paroleReduction
          : rollDiceExpression(effects.paroleReduction);
        setCharacterData(prev => ({
          ...prev,
          paroleThreshold: Math.max(0, (prev.paroleThreshold || 0) - reduction),
        }));
        setTermSkillsGained(prev => [...prev, `Parole threshold reduced by ${reduction}`]);
      }
      if (effects.mustLeaveCareer) {
        setForceLeaveCareer(true);
        setTermSkillsGained(prev => [...prev, 'You must leave this career.']);
      }

      // Handle table redirects (e.g., rollOnTable: 'injury')
      if (effects.rollOnTable) {
        // Add any messages first
        messages.forEach(msg => {
          if (msg && !termSkillsGained.includes(msg)) {
            setTermSkillsGained(prev => [...prev, msg]);
          }
        });

        // Track injury severity for severe injuries (roll twice, take lower)
        if (effects.injurySeverity === 'severe') {
          setPendingInjurySeverity('severe');
        }

        // Trigger the table redirect
        handleTableRedirect(effects.rollOnTable as 'life_events' | 'injury' | 'aging' | 'draft' | 'unusual_events' | 'mishap' | 'prison_event');
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

  // Handler for mishap GameEvent completion
  const handleMishapGameEventComplete = (effects: EventEffects | undefined, messages: string[]) => {
    if (!selectedCareer) return;

    const assignment = selectedCareer.assignments[selectedAssignment];
    const ranks = getRanksForCareer(selectedCareer, isCommissioned, assignment.name);
    const mishapDescription = pendingMishapGameEvent?.description || 'Mishap';

    // Check if the mishap outcome allows continuing in career
    const canContinue = effects?.continueInCareer === true;

    // Apply effects from the mishap (same logic as handleGameEventComplete)
    if (effects) {
      if (effects.skills?.choices) {
        const level = effects.skills.level ?? 1;
        effects.skills.choices.forEach(skillName => {
          const skillKey = normalizeSkillName(skillName);
          setCharacterData(prev => {
            const currentSkill = prev.skills[skillKey];
            const currentValue = currentSkill ? parseInt(currentSkill.value, 10) || 0 : 0;
            const newValue = level === 0 ? Math.max(currentValue, 0) : Math.max(currentValue, level);
            return {
              ...prev,
              skills: {
                ...prev.skills,
                [skillKey]: { proficient: true, value: newValue.toString() },
              },
            };
          });
        });
      }

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
        });

        // Calculate medical bills for mishap injuries
        const totalDamage = effects.characteristics.reduce((sum, c) => sum + Math.max(0, -c.modifier), 0);
        if (totalDamage > 0 && selectedCareer) {
          const injuryCost = calculateInjuryCost(totalDamage);
          const coverage = calculateMedicalCoverage(selectedCareer.name, characterData.rank, injuryCost);
          setPendingMedicalBill(coverage);
          if (coverage.outOfPocket > 0) {
            setCharacterData(prev => ({
              ...prev,
              medicalDebt: (prev.medicalDebt || 0) + coverage.outOfPocket,
            }));
          }
        }
      }

      if (effects.allies) {
        const count = rollDiceExpression(effects.allies);
        if (count > 0) {
          setCharacterData(prev => ({ ...prev, allies: prev.allies + count }));
        }
      }
      if (effects.enemies) {
        const count = rollDiceExpression(effects.enemies);
        if (count > 0) {
          setCharacterData(prev => ({ ...prev, enemies: prev.enemies + count }));
        }
      }
      if (effects.rivals) {
        const count = rollDiceExpression(effects.rivals);
        if (count > 0) {
          setCharacterData(prev => ({ ...prev, rivals: prev.rivals + count }));
        }
      }
      if (effects.contacts) {
        const count = rollDiceExpression(effects.contacts);
        if (count > 0) {
          setCharacterData(prev => ({ ...prev, contacts: prev.contacts + count }));
        }
      }

      if (effects.extraBenefit) {
        setExtraBenefitRolls(prev => prev + 1);
      }
      if (effects.benefitDM && effects.benefitDM > 0) {
        setEventBenefitDMs(prev => [...prev, effects.benefitDM!]);
      }

      // Prisoner career effects
      if (effects.paroleThresholdChange) {
        setCharacterData(prev => ({
          ...prev,
          paroleThreshold: (prev.paroleThreshold || 0) + effects.paroleThresholdChange!,
        }));
      }
      if (effects.survivalDM) {
        setCharacterData(prev => ({
          ...prev,
          prisonerSurvivalDM: (prev.prisonerSurvivalDM || 0) + effects.survivalDM!,
        }));
      }
      if (effects.rerollParoleThreshold) {
        const newThreshold = rollDice(1, 6) + 2;
        setCharacterData(prev => ({
          ...prev,
          paroleThreshold: newThreshold,
        }));
      }
      if (effects.leaveCareer) {
        setForceLeaveCareer(true);
      }
      if (effects.loseBenefits) {
        setCharacterData(prev => ({
          ...prev,
          lostBenefitCareers: [...(prev.lostBenefitCareers || []), selectedCareer?.name || ''],
        }));
      }
      if (effects.paroleReduction) {
        const reduction = typeof effects.paroleReduction === 'number'
          ? effects.paroleReduction
          : rollDiceExpression(effects.paroleReduction);
        setCharacterData(prev => ({
          ...prev,
          paroleThreshold: Math.max(0, (prev.paroleThreshold || 0) - reduction),
        }));
      }
      if (effects.mustLeaveCareer) {
        setForceLeaveCareer(true);
      }

      // Effects that also exist in regular event handler — needed for mishap outcomes
      if (effects.forceCareer) {
        setCharacterData(prev => ({ ...prev, forcedCareer: effects.forceCareer }));
      }
      if (effects.allowCareer) {
        setCharacterData(prev => ({
          ...prev,
          allowedCareers: [...(prev.allowedCareers || []), effects.allowCareer!],
        }));
      }
      if (effects.failGraduation) {
        setPreCareerGraduated(false);
        setTermSurvived(false);
      }
      if (effects.canTestPsi) {
        setCharacterData(prev => ({ ...prev, canTestPsi: true }));
      }
      if (effects.advancementDM) {
        setEventAdvancementDM(prev => prev + effects.advancementDM!);
      }
      if (effects.autoPromotion) {
        // Immediately promote rank by 1 (same logic as the GameEvent path above)
        if (selectedCareer) {
          const assignmentName = selectedCareer.assignments[selectedAssignment]?.name;
          const ranks = getRanksForCareer(selectedCareer, isCommissioned, assignmentName);
          setCharacterData(prev => {
            if (prev.rank < ranks.length - 1) {
              const newRank = prev.rank + 1;
              const rankData = ranks[newRank];
              if (rankData.skillBonus) {
                applySkillGain(rankData.skillBonus, 'Auto-Promotion');
                setTermSkillsGained(p => [...p, `${rankData.skillBonus} (Auto-Promotion: ${rankData.title})`]);
              }
              if (rankData.bonusStat) {
                applyRankStatBonus(rankData.bonusStat, rankData.bonusStatFloor);
              }
              setTermSkillsGained(p => [...p, `Auto-promoted to ${rankData.title}`]);
              return { ...prev, rank: newRank };
            }
            return prev;
          });
        }
      }
      if (effects.qualificationDM) {
        setCharacterData(prev => ({
          ...prev,
          eventQualificationDM: (prev.eventQualificationDM || 0) + effects.qualificationDM!,
        }));
      }

      // Handle table redirects from mishap (e.g., roll on injury)
      if (effects.rollOnTable) {
        if (effects.injurySeverity === 'severe') {
          setPendingInjurySeverity('severe');
        }
        handleTableRedirect(effects.rollOnTable as 'life_events' | 'injury' | 'aging' | 'draft' | 'unusual_events' | 'mishap' | 'prison_event', true);
        return; // Don't complete mishap yet - wait for redirected table to complete
      }
    }

    if (canContinue) {
      // Character may continue in career - override the survival failure
      setTermSurvived(true);
      setPendingMishapGameEvent(null);
      setMishapRollNumber(null);
    setNeedsMishapRoll(false);
      // Note: the term will still need to go through the normal event/skill flow
      // Re-set to allow event roll
      setTermEventRoll(null);
    } else {
      // Normal mishap - character must leave career
      // Build the skills/effects summary from messages
      const skillsGained = messages.filter(m => m && m.length > 0);

      const termRecord: TermRecord = {
        termNumber: currentTerm,
        career: selectedCareer.name,
        assignment: assignment.name,
        age: characterData.age,
        survivalRoll: survivalRollLog,
        survived: false,
        advanced: false,
        rank: characterData.rank,
        rankTitle: ranks[characterData.rank]?.title || 'Rank 0',
        event: `MISHAP: ${mishapDescription}`,
        skillsGained,
        mishap: mishapDescription,
      };

      setCharacterData(prev => ({
        ...prev,
        lifepath_log: [...prev.lifepath_log, termRecord],
        terms_served: currentTerm,
      }));

      setPendingMishapGameEvent(null);
      setMishapRollNumber(null);
    setNeedsMishapRoll(false);
    }
  };

  // Handler for table redirects (Life Events, Injury, etc.)
  // Instead of auto-rolling, shows the table and lets the user roll manually
  const handleTableRedirect = (table: 'life_events' | 'injury' | 'aging' | 'draft' | 'unusual_events' | 'mishap' | 'prison_event', isMishap = false) => {
    switch (table) {
      case 'life_events':
      case 'injury':
      case 'unusual_events':
        setPendingTableRedirect(table);
        setPendingTableIsMishap(isMishap);
        return;
      case 'mishap': {
        // Roll on the current career's Mishap table without ejecting the
        // character (used by events like Noble #2 "Disaster"). The mishap
        // entries are GameEvents, so they render through the standard
        // redirected-event UI and apply effects via handleGameEventComplete,
        // which does NOT terminate the career.
        if (!selectedCareer || !selectedCareer.mishapTable) {
          setGameEventCompleted(true);
          setEventResolved(true);
          return;
        }
        const roll = rollDiceUtil(1, 6);
        const mishapEntry = selectedCareer.mishapTable[roll - 1];
        if (mishapEntry && typeof mishapEntry === 'object' && 'resolution' in mishapEntry) {
          setRedirectedEvent(mishapEntry as GameEvent);
          setRedirectTableRoll(roll);
          setRedirectTableName(`${selectedCareer.name} Mishap (no ejection)`);
        } else {
          setGameEventCompleted(true);
          setEventResolved(true);
        }
        return;
      }
      case 'aging':
        setTermSkillsGained(prev => [...prev, 'Roll on Aging table (not yet implemented)']);
        setGameEventCompleted(true);
        setEventResolved(true);
        return;
      case 'draft':
        setTermSkillsGained(prev => [...prev, 'Roll on Draft table (use draft system)']);
        setGameEventCompleted(true);
        setEventResolved(true);
        return;
      default:
        setGameEventCompleted(true);
        setEventResolved(true);
        return;
    }
  };

  // Execute the actual table roll after user clicks the roll button
  const executeTableRedirectRoll = (manualRoll?: number) => {
    if (!pendingTableRedirect) return;

    let roll: number;
    let event: GameEvent | null = null;
    let tableName = '';

    switch (pendingTableRedirect) {
      case 'life_events':
        roll = manualRoll ?? rollDiceUtil(2, 6);
        event = getLifeEvent(roll);
        tableName = 'Life Events';
        break;
      case 'injury':
        roll = manualRoll ?? rollDiceUtil(1, 6);
        event = getInjury(roll);
        tableName = 'Injury';
        break;
      case 'unusual_events':
        roll = manualRoll ?? rollDiceUtil(1, 6);
        event = getUnusualEvent(roll);
        tableName = 'Unusual Events';
        break;
      default:
        return;
    }

    if (event) {
      setRedirectedEvent(event);
      setRedirectTableRoll(roll);
      setRedirectTableName(tableName);
      setPendingTableRedirect(null);
    } else {
      setPendingTableRedirect(null);
      setGameEventCompleted(true);
      setEventResolved(true);
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
    setPendingTableIsMishap(false);
  };

  // Handler for nested table redirects (e.g., Life Events -> Injury -> ...)
  const handleNestedTableRedirect = (table: 'life_events' | 'injury' | 'aging' | 'draft' | 'unusual_events' | 'mishap' | 'prison_event') => {
    // Complete the current redirected event first
    setRedirectedEvent(null);
    setRedirectTableRoll(null);
    setRedirectTableName(null);

    // Then handle the new redirect
    handleTableRedirect(table);
  };

  // Handler for when a redirected event from a MISHAP completes (e.g., injury from mishap)
  const handleMishapRedirectedEventComplete = (effects: EventEffects | undefined, messages: string[]) => {
    if (!selectedCareer) return;

    // Apply effects from the redirected event (injury, etc.)
    handleGameEventComplete(effects, messages);

    // Clear the redirect state
    setRedirectedEvent(null);
    setRedirectTableRoll(null);
    setRedirectTableName(null);
    setPendingTableIsMishap(false);

    // Now finalize the mishap
    const assignment = selectedCareer.assignments[selectedAssignment];
    const ranks = getRanksForCareer(selectedCareer, isCommissioned, assignment.name);
    const mishapDescription = pendingMishapGameEvent?.description || 'Mishap';

    // Build the skills/effects summary from messages
    const skillsGained = messages.filter(m => m && m.length > 0);

    const termRecord: TermRecord = {
      termNumber: currentTerm,
      career: selectedCareer.name,
      assignment: assignment.name,
      age: characterData.age,
      survivalRoll: survivalRollLog,
      survived: false,
      advanced: false,
      rank: characterData.rank,
      rankTitle: ranks[characterData.rank]?.title || 'Rank 0',
      event: `MISHAP: ${mishapDescription}`,
      skillsGained,
      mishap: mishapDescription,
    };

    setCharacterData(prev => ({
      ...prev,
      lifepath_log: [...prev.lifepath_log, termRecord],
      terms_served: currentTerm,
    }));

    setPendingMishapGameEvent(null);
    setMishapRollNumber(null);
    setNeedsMishapRoll(false);
  };

  // ============================================================================
  // SKILL LIMITS ENFORCEMENT
  // ============================================================================

  const getTotalSkillLevels = (skills: Record<string, SkillState>): number => {
    return Object.values(skills).reduce((total, skill) => {
      return total + (parseInt(skill.value, 10) || 0);
    }, 0);
  };

  const getMaxSkillLevels = (): number => {
    const int = characterData.characteristics.intellect.total;
    const edu = characterData.characteristics.education.total;
    return 3 * (int + edu);
  };

  const canIncreaseSkill = (skillKey: string, currentSkills: Record<string, SkillState>): { allowed: boolean; reason?: string } => {
    const currentSkill = currentSkills[skillKey];
    const currentValue = currentSkill ? parseInt(currentSkill.value, 10) || 0 : 0;

    // Jack-of-All-Trades is capped at level 3 (reduces untrained penalty to 0 at max).
    const normalized = skillKey.toLowerCase().replace(/[\s_]+/g, '-');
    if (normalized === 'jack-of-all-trades') {
      if (currentValue >= 3) {
        return { allowed: false, reason: 'Jack-of-All-Trades is already at maximum level 3' };
      }
    } else if (currentValue >= 4) {
      // Check individual skill limit (max level 4)
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
      if (parsed.skill.toLowerCase() === 'any talent') {
        setPendingAnyTalentSource(source);
        return;
      }

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
        const currentValue = currentSkill ? parseInt(currentSkill.value, 10) || 0 : 0;

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
      const currentValue = currentSkill ? parseInt(currentSkill.value, 10) || 0 : 0;

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

  const handleAnyTalentSelected = (talent: string) => {
    const source = pendingAnyTalentSource;
    setPendingAnyTalentSource('');
    applySkillGain(talent, source || 'Any Talent');

    if (source) {
      setTermSkillsGained(prev => [...prev, `${talent} (${source})`]);
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
  const rollSkillFromExpandedTable = (manualRoll?: number) => {
    if (!selectedCareer || !expandedSkillTable || termSkillSelected) return;

    const { table, displayName } = getSkillTableInfo(expandedSkillTable);
    if (table.length === 0) return;

    const roll = manualRoll ?? rollDice(1, 6);
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

    // Mark one skill roll used.
    const usedAfterThisRoll = termSkillRollsUsed + 1;
    setTermSkillRollsUsed(usedAfterThisRoll);

    // If more rolls remain, reset the table UI so the skill tables re-appear
    // fresh for the next pick. The skill already rolled is logged in
    // "Skills Gained This Term" so the player can still see it.
    if (usedAfterThisRoll < termSkillRollsAllowed) {
      setExpandedSkillTable(null);
      setSkillTableRollResult(null);
    }
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
      // Calculate anagathics DM: +1 per term using anagathics
      let agingDM = 0;
      if (characterData.isUsingAnagathics && characterData.anagathicsStartTerm) {
        agingDM = totalTermsAfterThis - characterData.anagathicsStartTerm + 1;
      }

      const agingRollResult = rollAging(totalTermsAfterThis, agingDM);
      if (agingRollResult) {
        setAgingResult(agingRollResult);
        setAgingPending(true);
        // Reset aging choice state
        setAgingPhysicalChosen(false);
        setAgingMentalChosen(false);
        setAgingCrisis(null);
        setAgingCrisisAcknowledged(false);
        setAgingChosenEffects([]);
        // Effects are NOT auto-applied — player makes choices in the UI
      }
    }

    // Accrue anagathics cost if using. Per the rules this is paid out of the
    // Traveller's eventual mustering-out cash benefits, so it is not taken from
    // cash_on_hand during character generation — it accumulates and is settled
    // at mustering out (any shortfall becomes debt).
    if (characterData.isUsingAnagathics) {
      const { roll, cost } = rollAnagathicsCost();
      setCharacterData(prev => ({
        ...prev,
        anagathicsTotalCost: (prev.anagathicsTotalCost || 0) + cost,
      }));
      setTermSkillsGained(prev => [
        ...prev,
        `Anagathics cost: Cr${cost.toLocaleString()} (${roll} × Cr25,000) — deducted from mustering-out benefits`,
      ]);
    }

    setIsInTerm(false);
  };

  // Handle aging physical characteristic choice
  const handleAgingPhysicalChoice = (choiceIndex: number) => {
    if (!agingResult?.effectLevel) return;
    const choice = agingResult.effectLevel.physicalChoices[choiceIndex];
    if (!choice) return;

    const allEffects = [...choice.effects];
    setAgingChosenEffects(allEffects);
    setAgingPhysicalChosen(true);

    // If no mental choices needed, apply effects now
    if (!agingResult.effectLevel.mentalChoices || agingResult.effectLevel.mentalChoices.length === 0) {
      applyAgingChosenEffects(allEffects);
    }
  };

  // Handle aging mental characteristic choice
  const handleAgingMentalChoice = (choiceIndex: number) => {
    if (!agingResult?.effectLevel?.mentalChoices) return;
    const choice = agingResult.effectLevel.mentalChoices[choiceIndex];
    if (!choice) return;

    const allEffects = [...agingChosenEffects, ...choice.effects];
    setAgingChosenEffects(allEffects);
    setAgingMentalChosen(true);
    applyAgingChosenEffects(allEffects);
  };

  // Apply the chosen aging effects to characteristics
  const applyAgingChosenEffects = (effects: { stat: string; modifier: number }[]) => {
    const typedEffects = effects as { stat: CharacteristicName; modifier: number }[];

    // Check for aging crisis before applying
    const crisis = checkAgingCrisis(
      characterData.characteristics as Record<CharacteristicName, { total: number; current: number }>,
      typedEffects
    );

    // Get list of crisis stats so we can set them to 1 instead of 0
    const crisisStats = crisis.isCrisis ? crisis.characteristics : undefined;

    const newCharacteristics = applyAgingEffects(
      characterData.characteristics as Record<CharacteristicName, { total: number; current: number }>,
      typedEffects,
      crisisStats
    );

    setCharacterData(prev => ({
      ...prev,
      characteristics: newCharacteristics,
      // Add medical debt from aging crisis
      medicalDebt: crisis.isCrisis
        ? (prev.medicalDebt || 0) + crisis.medicalCost
        : prev.medicalDebt,
      // Auto-fail next qualification after aging crisis
      agingCrisisFailQualification: crisis.isCrisis ? true : prev.agingCrisisFailQualification,
    }));

    if (crisis.isCrisis) {
      setAgingCrisis(crisis);
    }

    // Log the effects
    const effectStr = typedEffects.map(e => `${e.stat.toUpperCase()} ${e.modifier}`).join(', ');
    setTermSkillsGained(prev => [...prev, `Aging: ${effectStr}`]);
    if (crisis.isCrisis) {
      setTermSkillsGained(prev => [...prev, `Aging crisis! Medical cost: Cr${crisis.medicalCost.toLocaleString()}`]);
    }
  };

  // Acknowledge aging (dismiss the aging UI)
  const acknowledgeAging = () => {
    setAgingPending(false);
    setAgingResult(null);
    setAgingPhysicalChosen(false);
    setAgingMentalChosen(false);
    setAgingCrisis(null);
    setAgingCrisisAcknowledged(false);
    setAgingChosenEffects([]);
  };

  // Handle anagathics attempt
  const handleAnagathicsAttempt = () => {
    const socValue = characterData.characteristics.social.total;
    const socDM = getDM(socValue);
    const result = rollAnagathicsObtain(socDM);
    setAnagathicsRollResult(result);

    if (result.arrested) {
      // Forced to Prisoner career
      setCharacterData(prev => ({
        ...prev,
        forcedCareer: 'Prisoner',
      }));
    } else if (result.success) {
      const totalTerms = characterData.lifepath_log.length;
      setCharacterData(prev => ({
        ...prev,
        isUsingAnagathics: true,
        anagathicsStartTerm: totalTerms + 1,
      }));
    }
  };

  // Handle stopping anagathics (triggers immediate aging roll with no DM)
  const handleStopAnagathics = () => {
    setCharacterData(prev => ({
      ...prev,
      isUsingAnagathics: false,
      anagathicsStartTerm: undefined,
    }));

    // Immediate aging roll with no DM
    const totalTerms = characterData.lifepath_log.length;
    if (totalTerms >= 5) {
      const agingRollResult = rollAging(totalTerms, 0);
      if (agingRollResult) {
        setAgingResult(agingRollResult);
        setAgingPending(true);
        setAgingPhysicalChosen(false);
        setAgingMentalChosen(false);
        setAgingCrisis(null);
        setAgingCrisisAcknowledged(false);
        setAgingChosenEffects([]);
      }
    }

    setShowAnagathicsPrompt(false);
    setAnagathicsRollResult(null);
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
      benefitDMs: eventBenefitDMs,
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
    gainedSkills: string[];
    cashRollsUsed: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Deduct accumulated debts from the final cash benefits. Any shortfall
    // becomes starting debt (tracked in medicalDebt for now — the Traveller
    // starts play owing that amount).
    const anagathicsOwed = characterData.anagathicsTotalCost || 0;
    const priorMedicalDebt = characterData.medicalDebt || 0;
    const totalOwed = anagathicsOwed + priorMedicalDebt;
    const cashAfterDebt = Math.max(0, results.cash - totalOwed);
    const remainingDebt = Math.max(0, totalOwed - results.cash);

    setCharacterData(prev => ({
      ...prev,
      cash_on_hand: cashAfterDebt,
      credits: cashAfterDebt,
      pension: totalPension,
      shipShares: results.shipShares,
      tasMembership: results.tasMembership,
      ships: results.ships,
      characteristics: results.characteristics,
      allies: prev.allies + results.allies,
      contacts: prev.contacts + results.contacts,
      equipment: [...prev.equipment, ...results.equipment],
      // Accumulated anagathics debt is rolled into medicalDebt; reset
      // anagathicsTotalCost since it has now been settled/consolidated.
      anagathicsTotalCost: 0,
      medicalDebt: remainingDebt,
      // Mark every remaining career as benefit-rolled so a resumed draft
      // can't double-dip in final mustering-out.
      careerHistory: prev.careerHistory.map(c =>
        c.benefitsTaken ? c : { ...c, benefitsTaken: true }
      ),
    }));

    // Update lifetime cash-roll counter from final session.
    setLifetimeCashRollsUsed(results.cashRollsUsed);

    // Apply Prisoner-style skill benefits through the standard skill pipeline.
    results.gainedSkills.forEach(skill => {
      applySkillGain(skill, 'Mustering-out benefit');
    });

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

  const rollSwitchAssignment = (newAssignmentIndex: number, manualRoll?: number) => {
    if (!selectedCareer) return;

    setSwitchAssignmentTarget(newAssignmentIndex);

    // Make a qualification roll for the new assignment
    const charValue = characterData.characteristics[selectedCareer.qualificationStat].total;
    const dm = getDM(charValue);
    const roll = manualRoll ?? rollDice(2, 6);
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
        setCommissionAttempted(false);
        setCommissionRollLog('');
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
    // Reset mishap GameEvent state
    setPendingMishapGameEvent(null);
    setMishapRollNumber(null);
    setNeedsMishapRoll(false);

    // Reset career state for new career
    setCurrentTerm(0);
    setIsInTerm(false);
    setTermSurvived(null);
    setTermAdvanced(null);
    setTermEventRoll(null);
    setTermSkillsGained([]);
    setIsCommissioned(false);
    setCommissionAttempted(false);
    setCommissionRollLog('');
    setBasicTrainingApplied(false);
    setBasicTrainingSkillSelected(null);
    setForceLeaveCareer(false);
    // Forced career change (draft/drifter) — advancement bonus does not carry.
    setCarriedAdvancementBonus(false);

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
      benefitDMs: eventBenefitDMs,
      extraBenefitRolls: extraBenefitRolls,
      isPreCareer: selectedCareer.isPreCareer || false,
    };

    setCharacterData(prev => ({
      ...prev,
      careerHistory: [...prev.careerHistory, careerRecord],
    }));

    // Reset benefit tracking for new career
    setEventBenefitDMs([]);
    setExtraBenefitRolls(0);
  };

  // Shared helper for resetting chargen state when the player returns to
  // career selection. Called either directly by switchToNewCareer (when no
  // between-career benefit rolls apply) or after a mid-career muster completes.
  const resetForNewCareerSelection = () => {
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
    setCommissionAttempted(false);
    setCommissionRollLog('');
    setPreCareerGraduated(false);
    setGraduatedWithHonours(false);
    setGraduationRollLog('');
    setSurvivalRollLog('');
    setCommissionRollLog('');
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
    setTermSkillRollsUsed(0);
    setTermSkillRollsAllowed(1);
    // Advancement bonus does not carry across a career switch.
    setCarriedAdvancementBonus(false);
    setForcedContinueInCareer(false);
    setForcedLeaveAfterTerm(false);
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
    // Reset event advancement DM and commission DM for new career
    setEventAdvancementDM(0);
    setCommissionRollDM(0);
    // Reset assignment switching state
    setIsSwitchingAssignment(false);
    setSwitchAssignmentTarget(null);
    setSwitchAssignmentRollLog('');
    setSwitchAssignmentResult(null);
    // Reset mishap GameEvent state
    setPendingMishapGameEvent(null);
    setMishapRollNumber(null);
    setNeedsMishapRoll(false);

    // Go back to career selection
    setStep(4);
  };

  // Switch to a new career after leaving current one. Per Traveller 2e
  // (Core Rulebook p. 20/46) "Benefits are gained when a Traveller leaves a
  // career" and can happen between careers, not only at the end of chargen —
  // so we save history, then pause into a single-career MusteringOut session
  // before resetting for career selection. Pre-careers and zero-term exits
  // skip the benefit step.
  const switchToNewCareer = () => {
    const leavingCareer = selectedCareer;
    const terms = currentTerm;

    // Record the career in history first.
    saveCurrentCareerToHistory();

    if (leavingCareer && !leavingCareer.isPreCareer && terms > 0) {
      // Eligible for between-career benefit rolls — pause transition.
      const assignmentName = leavingCareer.assignments[selectedAssignment]?.name || '';
      const record: CareerRecord = {
        careerName: leavingCareer.name,
        assignment: assignmentName,
        termsServed: terms,
        highestRank: characterData.rank,
        isCommissioned,
        benefitDMs: eventBenefitDMs,
        extraBenefitRolls,
        isPreCareer: false,
      };
      setMidCareerMusterRecord(record);
      return;
    }

    // No benefits to roll (pre-career or zero terms) — reset immediately.
    resetForNewCareerSelection();
  };

  // Called when the player finishes the between-career mustering-out session.
  // Applies all accumulated gains, marks the leaving career as benefit-rolled
  // so the final muster-out skips it, then proceeds with the career reset.
  const handleMidCareerMusterComplete = (results: {
    cash: number;
    shipShares: number;
    tasMembership: boolean;
    ships: string[];
    characteristics: typeof characterData.characteristics;
    allies: number;
    contacts: number;
    equipment: string[];
    gainedSkills: string[];
    cashRollsUsed: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    benefitLog: any[];
  }) => {
    const leavingRecord = midCareerMusterRecord;
    if (!leavingRecord) return;

    // Settle accumulated debts against this mid-career payout so a player can't
    // dodge anagathics/medical bills by leaving the career early.
    const anagathicsOwed = characterData.anagathicsTotalCost || 0;
    const priorMedicalDebt = characterData.medicalDebt || 0;
    const totalOwed = anagathicsOwed + priorMedicalDebt;
    const cashAfterDebt = Math.max(0, results.cash - totalOwed);
    const remainingDebt = Math.max(0, totalOwed - results.cash);

    setCharacterData(prev => ({
      ...prev,
      cash_on_hand: cashAfterDebt,
      credits: cashAfterDebt,
      shipShares: results.shipShares,
      tasMembership: results.tasMembership,
      ships: results.ships,
      characteristics: results.characteristics,
      allies: prev.allies + results.allies,
      contacts: prev.contacts + results.contacts,
      equipment: [...prev.equipment, ...results.equipment],
      // Accumulated anagathics debt is rolled into medicalDebt; reset
      // anagathicsTotalCost since it has now been settled/consolidated.
      anagathicsTotalCost: 0,
      medicalDebt: remainingDebt,
      // Mark the leaving career's most-recent history entry as benefit-rolled.
      careerHistory: (() => {
        const history = [...prev.careerHistory];
        for (let i = history.length - 1; i >= 0; i--) {
          const c = history[i];
          if (c.careerName === leavingRecord.careerName && !c.benefitsTaken) {
            history[i] = { ...c, benefitsTaken: true };
            break;
          }
        }
        return history;
      })(),
    }));

    // Persist the lifetime cash-roll counter (3 max across all careers).
    setLifetimeCashRollsUsed(results.cashRollsUsed);

    // Apply any Prisoner-style skill benefits through the standard skill-gain
    // pipeline so specialty selection, limits, and normalization all work.
    results.gainedSkills.forEach(skill => {
      applySkillGain(skill, `${leavingRecord.careerName} benefit`);
    });

    setMidCareerMusterRecord(null);
    resetForNewCareerSelection();
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
    setCommissionAttempted(false);
    setCommissionRollLog('');
    setPreCareerGraduated(false);
    setGraduatedWithHonours(false);
    setGraduationRollLog('');
    setSurvivalRollLog('');
    setCommissionRollLog('');
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
    // Reset training-roll phase state for the new career
    setTermSkillRollsUsed(0);
    setTermSkillRollsAllowed(1);
    // Pre-career cannot advance, so there's no bonus to carry — but reset
    // defensively to keep this path symmetric with resetForNewCareerSelection.
    setCarriedAdvancementBonus(false);
    setForcedContinueInCareer(false);
    setForcedLeaveAfterTerm(false);
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
        allies: characterData.allies > 0 ? `Allies: ${characterData.allies}` : '',
        contacts: characterData.contacts > 0 ? `Contacts: ${characterData.contacts}` : '',
        rivals: characterData.rivals > 0 ? `Rivals: ${characterData.rivals}` : '',
        enemies: characterData.enemies > 0 ? `Enemies: ${characterData.enemies}` : '',
        weapons: characterData.weapons,
        armor: characterData.armor,
        augments: characterData.augments,
        thumbnail_url: null,
        character_type: characterData.character_type,
        npc_role: characterData.character_type === 'npc' ? 'crew' : undefined,
        // Crew assignment
        crew_id: selectedCrewId || undefined,
        crew_position: selectedPosition || undefined,
        // Lifepath history (term-by-term)
        lifepath_log: characterData.lifepath_log,
      };

      await saveCharacter(finalCharacterData);
      removeLocalStorage(DRAFT_KEY);
      alert('Character created successfully!');
    } catch (error) {
      console.error('Failed to save character:', error);
      alert('Failed to save character. Please try again.');
    }
  };

  // ============================================================================
  // DRAFT PERSISTENCE
  // ============================================================================

  // Check for existing draft on mount
  useEffect(() => {
    if (draftChecked) return;
    const draft = getLocalStorage<any>(DRAFT_KEY, null);
    if (draft && draft.version === 1) {
      setShowResumeDraft(true);
    }
    setDraftChecked(true);
  }, [DRAFT_KEY, draftChecked]);

  // Resume a saved draft
  const resumeDraft = () => {
    const draft = getLocalStorage<any>(DRAFT_KEY, null);
    if (!draft) { setShowResumeDraft(false); return; }

    setStep(draft.step || 1);
    if (draft.characterData) setCharacterData(draft.characterData);
    setSelectedAssignment(draft.selectedAssignment ?? 0);
    setCurrentTerm(draft.currentTerm ?? 0);
    // Resume at start of term, not mid-term
    setIsInTerm(false);
    setQualificationPassed(draft.qualificationPassed ?? null);
    setHasUsedDraft(draft.hasUsedDraft ?? false);
    setHasRolled(draft.hasRolled ?? false);
    setCharacteristicRolls(draft.characteristicRolls ?? []);
    setBackgroundSkillsRemaining(draft.backgroundSkillsRemaining ?? 0);
    setIsCommissioned(draft.isCommissioned ?? false);
    setNeedsCommissionRoll(draft.needsCommissionRoll ?? false);
    setCommissionRollDM(draft.commissionRollDM ?? 0);
    setCommissionAttempted(draft.commissionAttempted ?? false);
    setCommissionRollLog(draft.commissionRollLog ?? '');
    setBasicTrainingApplied(draft.basicTrainingApplied ?? false);
    setAssignmentMode(draft.assignmentMode ?? 'auto');
    setUseManualDice(draft.useManualDice ?? false);
    setIsMusteringOut(draft.isMusteringOut ?? false);
    setMidCareerMusterRecord(draft.midCareerMusterRecord ?? null);
    setLifetimeCashRollsUsed(draft.lifetimeCashRollsUsed ?? 0);
    setCarriedAdvancementBonus(draft.carriedAdvancementBonus ?? false);
    setEventBenefitDMs(draft.eventBenefitDMs ?? []);
    setExtraBenefitRolls(draft.extraBenefitRolls ?? 0);
    setPreCareerGraduated(draft.preCareerGraduated ?? false);
    setPreCareerFailedService(draft.preCareerFailedService ?? null);
    setGraduatedWithHonours(draft.graduatedWithHonours ?? false);
    setUniversitySkillLevel0(draft.universitySkillLevel0 ?? null);
    setUniversitySkillLevel1(draft.universitySkillLevel1 ?? null);
    setMilitaryAcademyService(draft.militaryAcademyService ?? null);
    setPsiTestResult(draft.psiTestResult ?? null);
    setShowPsiTesting(draft.showPsiTesting ?? false);
    // Training-roll counters (per-term, cleared each startNewTerm — but must
    // survive a refresh that lands mid-term-boundary).
    setTermSkillRollsUsed(draft.termSkillRollsUsed ?? 0);
    setTermSkillRollsAllowed(draft.termSkillRollsAllowed ?? 1);
    // Specialty-picker state
    setPendingSpecialtySkill(draft.pendingSpecialtySkill ?? null);
    setPendingSpecialtySource(draft.pendingSpecialtySource ?? '');
    // Advancement edge-case flags
    setForcedContinueInCareer(draft.forcedContinueInCareer ?? false);
    setForcedLeaveAfterTerm(draft.forcedLeaveAfterTerm ?? false);
    // Aging state — crucial because aging is triggered AFTER completeTerm sets
    // isInTerm=false, and the whole flow lives in the "between terms" UI. If we
    // don't persist these, a mid-aging refresh silently skips aging entirely.
    setAgingResult(draft.agingResult ?? null);
    setAgingPending(draft.agingPending ?? false);
    setAgingPhysicalChosen(draft.agingPhysicalChosen ?? false);
    setAgingMentalChosen(draft.agingMentalChosen ?? false);
    setAgingCrisis(draft.agingCrisis ?? null);
    setAgingCrisisAcknowledged(draft.agingCrisisAcknowledged ?? false);
    setAgingChosenEffects(draft.agingChosenEffects ?? []);
    // Anagathics + medical UI state (same between-term window as aging)
    setShowAnagathicsPrompt(draft.showAnagathicsPrompt ?? false);
    setAnagathicsRollResult(draft.anagathicsRollResult ?? null);
    setPendingMedicalBill(draft.pendingMedicalBill ?? null);

    // Restore selectedCareer from name
    if (draft.selectedCareerName) {
      const career = ALL_CAREERS.find(c => c.name === draft.selectedCareerName);
      if (career) setSelectedCareer(career);
    }

    // Restore selectedRace from raceId
    if (draft.raceId) {
      const race = RACES.find(r => r.id === draft.raceId);
      if (race) setSelectedRace(race);
    }

    setShowResumeDraft(false);
  };

  // Auto-save draft on meaningful state changes (debounced)
  useEffect(() => {
    if (!draftChecked || showResumeDraft) return;
    // Only save if there's meaningful progress
    if (step <= 1 && !hasRolled && !characterData.name) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const draft = {
        version: 1,
        savedAt: new Date().toISOString(),
        step,
        characterData,
        selectedCareerName: selectedCareer?.name ?? null,
        selectedAssignment,
        currentTerm,
        isInTerm,
        qualificationPassed,
        hasUsedDraft,
        hasRolled,
        characteristicRolls,
        backgroundSkillsRemaining,
        isCommissioned,
        needsCommissionRoll,
        commissionRollDM,
        commissionAttempted,
        commissionRollLog,
        basicTrainingApplied,
        assignmentMode,
        useManualDice,
        isMusteringOut,
        midCareerMusterRecord,
        lifetimeCashRollsUsed,
        carriedAdvancementBonus,
        eventBenefitDMs,
        extraBenefitRolls,
        preCareerGraduated,
        preCareerFailedService,
        graduatedWithHonours,
        universitySkillLevel0,
        universitySkillLevel1,
        militaryAcademyService,
        psiTestResult,
        showPsiTesting,
        raceId: selectedRace?.id ?? 'human',
        // Training-roll counters (per-term, cleared each startNewTerm)
        termSkillRollsUsed,
        termSkillRollsAllowed,
        // Specialty-picker state
        pendingSpecialtySkill,
        pendingSpecialtySource,
        // Advancement edge-case flags
        forcedContinueInCareer,
        forcedLeaveAfterTerm,
        // Aging state
        agingResult,
        agingPending,
        agingPhysicalChosen,
        agingMentalChosen,
        agingCrisis,
        agingCrisisAcknowledged,
        agingChosenEffects,
        // Anagathics + medical UI state
        showAnagathicsPrompt,
        anagathicsRollResult,
        pendingMedicalBill,
      };
      setLocalStorage(DRAFT_KEY, draft);
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [step, characterData, selectedCareer, selectedAssignment, currentTerm, isInTerm,
      qualificationPassed, hasUsedDraft, hasRolled, characteristicRolls, backgroundSkillsRemaining,
      isCommissioned, needsCommissionRoll, commissionRollDM, commissionAttempted, commissionRollLog,
      basicTrainingApplied, isMusteringOut, draftChecked, showResumeDraft,
      DRAFT_KEY, assignmentMode, useManualDice, eventBenefitDMs, extraBenefitRolls,
      midCareerMusterRecord, lifetimeCashRollsUsed, carriedAdvancementBonus,
      preCareerGraduated, preCareerFailedService, graduatedWithHonours,
      universitySkillLevel0, universitySkillLevel1, militaryAcademyService,
      psiTestResult, showPsiTesting, selectedRace,
      termSkillRollsUsed, termSkillRollsAllowed,
      pendingSpecialtySkill, pendingSpecialtySource,
      forcedContinueInCareer, forcedLeaveAfterTerm,
      agingResult, agingPending, agingPhysicalChosen, agingMentalChosen,
      agingCrisis, agingCrisisAcknowledged, agingChosenEffects,
      showAnagathicsPrompt, anagathicsRollResult, pendingMedicalBill]);

  // Warn before closing/refreshing when there's progress
  useEffect(() => {
    const hasProgress = step > 1 || hasRolled || characterData.name.length > 0;
    if (!hasProgress) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [step, hasRolled, characterData.name]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  // Renders the pending table redirect UI (table display + roll button)
  const renderPendingTableRedirect = () => {
    if (!pendingTableRedirect) return null;

    const tableConfig = {
      life_events: { title: 'Life Events Table (2D6)', dice: 2, sides: 6, entries: LIFE_EVENTS, offset: 2 },
      injury: { title: 'Injury Table (1D6)', dice: 1, sides: 6, entries: INJURY_TABLE, offset: 1 },
      unusual_events: { title: 'Unusual Events Table (1D6)', dice: 1, sides: 6, entries: UNUSUAL_EVENTS, offset: 1 },
    }[pendingTableRedirect];

    if (!tableConfig) return null;

    const minRoll = tableConfig.dice * 1;
    const maxRoll = tableConfig.dice * tableConfig.sides;
    const diceLabel = `${tableConfig.dice}D6`;

    return (
      <div className="space-y-3">
        <Alert className="bg-blue-500/10 border-blue-500/50">
          <AlertDescription className="text-blue-400">
            <strong>Roll on the {tableConfig.title}</strong>
          </AlertDescription>
        </Alert>

        {/* Display the full table */}
        <div className="bg-black border border-terminal-primary/30 rounded p-3">
          <h4 className="text-xs font-bold text-terminal-primary mb-2 uppercase tracking-wider">{tableConfig.title}</h4>
          <div className="space-y-1 text-xs text-terminal-primary/70">
            {tableConfig.entries.map((entry, idx) => (
              <div key={entry.id} className="flex gap-2 py-0.5">
                <span className="text-terminal-primary/50 w-6 text-right font-mono shrink-0">{idx + tableConfig.offset}.</span>
                <span>{entry.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roll button or manual entry */}
        {useManualDice ? (
          <div className="space-y-2">
            <p className="text-xs text-blue-400">Enter your {diceLabel} roll result:</p>
            <div className="flex gap-2">
              <Input
                type="number"
                min={minRoll}
                max={maxRoll}
                value={manualDiceValue}
                onChange={(e) => setManualDiceValue(e.target.value)}
                placeholder={`Enter ${diceLabel} result (${minRoll}-${maxRoll})`}
                className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
              />
              <Button
                onClick={() => {
                  const val = parseInt(manualDiceValue);
                  if (!isNaN(val) && val >= minRoll && val <= maxRoll) {
                    executeTableRedirectRoll(val);
                    setManualDiceValue('');
                  }
                }}
                disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue)) || parseInt(manualDiceValue) < minRoll || parseInt(manualDiceValue) > maxRoll}
                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              >
                Submit Roll
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => executeTableRedirectRoll()}
            className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
          >
            <Dices className="h-4 w-4 mr-2" />
            Roll {tableConfig.title.replace(' Table ', ' ')}
          </Button>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-black text-terminal-primary font-mono">
      {/* Resume Draft Dialog */}
      {showResumeDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="bg-black border-2 border-terminal-primary/50 max-w-md w-full">
            <CardHeader className="border-b border-terminal-primary/30">
              <CardTitle className="text-terminal-primary font-['Orbitron'] tracking-wider flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Resume Character?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <p className="text-terminal-primary/70 text-sm">
                You have a character in progress. Would you like to resume where you left off or start fresh?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={resumeDraft}
                  className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 border border-terminal-primary/50"
                >
                  Resume
                </Button>
                <Button
                  onClick={() => {
                    removeLocalStorage(DRAFT_KEY);
                    setShowResumeDraft(false);
                  }}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Start Fresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="border-b border-terminal-primary/30 p-3 sm:p-4 bg-gradient-to-r from-terminal-primary/5 via-transparent to-terminal-primary/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-terminal-primary/10 border border-terminal-primary/30">
              <User className="h-6 w-6 text-terminal-primary" />
            </div>
            <div>
              <h1 className="text-[clamp(1rem,2.5vw,1.35rem)] font-bold text-terminal-primary font-['Orbitron'] tracking-wider">
                CHARACTER GENERATOR
              </h1>
              <p className="text-terminal-primary/50 text-xs font-mono">
                Traveller 2nd Edition
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <button
              onClick={() => {
                setUseManualDice(!useManualDice);
                setManualDiceValue('');
              }}
              className={`px-3 py-1.5 rounded border text-xs font-bold font-['Orbitron'] tracking-wide transition-all duration-200 ${
                useManualDice
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-terminal-primary/10 border-terminal-primary/30 text-terminal-primary/60 hover:border-terminal-primary/60 hover:text-terminal-primary'
              }`}
            >
              {useManualDice ? 'MANUAL DICE: ON' : 'MANUAL DICE: OFF'}
            </button>
            <div className="text-right min-w-0">
              <div className="text-terminal-primary font-bold">
                {characterData.name || 'Unnamed Character'}
              </div>
              <div className="text-terminal-primary/50 text-xs">
                Age {characterData.age} • Step {step} of 6
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Tabs value={`step${step}`} className="w-full">
          {/* Enhanced Step Navigation */}
          <TabsList className="flex w-full overflow-x-auto bg-black/50 border border-terminal-primary/30 mb-4 p-1 gap-1">
            {['Basics', 'Characteristics', 'Background', 'Career', 'Terms', 'Review'].map((label, idx) => {
              const targetStep = idx + 1;
              const isActive = step === targetStep;
              const isCompleted = step > targetStep;
              // Lock steps 1-4 once career terms have started to prevent state corruption
              const isLocked = targetStep <= 4 && (isInTerm || currentTerm > 0);
              return (
                <TabsTrigger
                  key={label}
                  value={`step${targetStep}`}
                  onClick={() => {
                    if (isLocked) return;
                    setStep(targetStep);
                  }}
                  className={`
                    text-xs font-bold transition-all duration-200 rounded whitespace-nowrap px-2.5
                    ${isLocked
                      ? 'text-terminal-primary/20 cursor-not-allowed opacity-40'
                      : isActive
                      ? 'bg-terminal-primary/20 text-terminal-primary border border-terminal-primary/50 shadow-[0_0_10px_rgba(58, 226, 179,0.3)]'
                      : isCompleted
                      ? 'bg-terminal-primary/10 text-terminal-primary/70 hover:bg-terminal-primary/15'
                      : 'text-terminal-primary/40 hover:text-terminal-primary/60 hover:bg-terminal-primary/5'
                    }
                  `}
                  title={isLocked ? 'Career in progress — cannot go back' : undefined}
                >
                  <span className={`mr-1 ${isLocked ? 'text-terminal-primary/20' : isCompleted ? 'text-green-400' : ''}`}>
                    {isLocked ? <Lock className="inline h-3 w-3" /> : isCompleted ? '✓' : targetStep}.
                  </span>
                  {label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* STEP 1: BASIC INFO */}
          <TabsContent value="step1">
            <Card className="bg-black border-2 border-terminal-primary/50">
              <CardHeader className="border-b border-terminal-primary/30 bg-gradient-to-r from-terminal-primary/10 via-transparent to-terminal-primary/10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-terminal-primary/10 border border-terminal-primary/30">
                    <User className="h-5 w-5 text-terminal-primary" />
                  </div>
                  <div>
                    <div className="text-terminal-primary font-['Orbitron'] tracking-wider">Character Basics</div>
                    <div className="text-terminal-primary/50 text-xs font-normal font-mono">Define your identity</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Welcome Panel */}
                <div className="relative rounded-lg border border-terminal-primary/30 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-terminal-primary to-transparent" />
                  <div className="p-4 bg-terminal-primary/5">
                    <p className="text-sm text-terminal-primary/80 mb-2">
                      Welcome to the Traveller 2E character generator! This wizard will guide you through creating your character using the official rules.
                    </p>
                    <p className="text-xs text-terminal-primary/50">
                      You'll roll characteristics, select background skills, choose a career, and live through terms of service.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Character Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-terminal-primary/60 uppercase tracking-wider font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-terminal-primary" />
                      Character Name
                    </label>
                    <Input
                      placeholder="Enter character name..."
                      value={characterData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="bg-black/50 border-terminal-primary/50 text-terminal-primary focus:border-terminal-primary focus:ring-1 focus:ring-terminal-primary/50"
                    />
                  </div>

                  {/* Homeworld */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-terminal-primary/60 uppercase tracking-wider font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-terminal-primary" />
                      Homeworld
                    </label>
                    <Input
                      placeholder="Enter homeworld..."
                      value={characterData.homeworld}
                      onChange={(e) => handleHomeworldChange(e.target.value)}
                      className="bg-black/50 border-terminal-primary/50 text-terminal-primary focus:border-terminal-primary focus:ring-1 focus:ring-terminal-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-terminal-primary/60 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terminal-primary" />
                    Character Type
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={characterData.character_type === 'pc' ? 'default' : 'outline'}
                      className={characterData.character_type === 'pc' ? "bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50" : "border-terminal-primary/40 text-terminal-primary/70"}
                      onClick={() => handleCharacterTypeChange('pc')}
                    >
                      PC
                    </Button>
                    <Button
                      type="button"
                      variant={characterData.character_type === 'npc' ? 'default' : 'outline'}
                      className={characterData.character_type === 'npc' ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" : "border-terminal-primary/40 text-terminal-primary/70"}
                      onClick={() => handleCharacterTypeChange('npc')}
                    >
                      NPC
                    </Button>
                  </div>
                </div>

                {/* Race Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] text-terminal-primary/60 uppercase tracking-wider font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Race
                  </label>
                  <Select value={selectedRace.id} onValueChange={handleRaceSelection}>
                    <SelectTrigger className="bg-black/50 border-terminal-primary/50 text-terminal-primary focus:border-terminal-primary">
                      <SelectValue placeholder="Select a race" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-terminal-primary/50">
                      {RACES.map(race => (
                        <SelectItem
                          key={race.id}
                          value={race.id}
                          className="text-terminal-primary hover:bg-terminal-primary/20 focus:bg-terminal-primary/20 focus:text-terminal-primary"
                        >
                          {race.name}
                          {race.characteristicModifiers.length > 0 && (
                            <span className="ml-2 text-terminal-primary/60">
                              ({race.characteristicModifiers.map((m, i) =>
                                `${m.stat.slice(0, 3).toUpperCase()} ${m.modifier >= 0 ? '+' : ''}${m.modifier}`
                              ).join(', ')})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Race Details Display */}
                  {selectedRace.id !== 'human' && (
                    <div className="mt-3 bg-cyan-500/5 border border-cyan-500/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold font-['Orbitron'] tracking-wide">{selectedRace.name}</span>
                      </div>
                      <p className="text-sm text-terminal-primary/70">{selectedRace.description}</p>
                      {selectedRace.characteristicModifiers.length > 0 && (
                        <div className="flex gap-3 flex-wrap items-center">
                          <span className="text-[10px] text-terminal-primary/50 uppercase tracking-wider">Stat Modifiers:</span>
                          {selectedRace.characteristicModifiers.map((mod, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-0.5 rounded ${mod.modifier >= 0 ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}
                            >
                              {mod.stat.toUpperCase().slice(0, 3)} {mod.modifier >= 0 ? '+' : ''}{mod.modifier}
                            </span>
                          ))}
                        </div>
                      )}
                      {selectedRace.traits.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-cyan-500/20">
                          <span className="text-[10px] text-terminal-primary/50 uppercase tracking-wider">Racial Traits:</span>
                          {selectedRace.traits.map((trait, idx) => (
                            <div key={idx} className="bg-cyan-500/5 border border-cyan-500/20 rounded p-2">
                              <span className="text-cyan-400 font-bold text-sm">{trait.name}</span>
                              <p className="text-terminal-primary/60 text-xs mt-0.5">{trait.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Continue Button */}
                <Button
                  onClick={() => setStep(2)}
                  disabled={!characterData.name}
                  className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 border border-terminal-primary/50 transition-all duration-200 hover:shadow-[0_0_15px_rgba(58, 226, 179,0.3)]"
                >
                  Continue to Characteristics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 2: CHARACTERISTICS */}
          <TabsContent value="step2">
            <Card className="bg-black border-2 border-yellow-500/50">
              <CardHeader className="border-b border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <Dices className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-yellow-400 font-['Orbitron'] tracking-wider">Characteristics</div>
                      <div className="text-terminal-primary/50 text-xs font-normal font-mono">Roll your core attributes</div>
                    </div>
                  </CardTitle>
                  <div className="flex gap-2">
                    {hasRolled && (
                      <Button
                        onClick={rerollCharacteristics}
                        className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/50"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {!hasRolled ? (
                  <>
                    {/* Selected Race Display (read-only) */}
                    {selectedRace.id !== 'human' && (
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Race:</span>
                          <span className="text-terminal-primary font-bold">{selectedRace.name}</span>
                        </div>
                        {selectedRace.characteristicModifiers.length > 0 && (
                          <div className="flex gap-2 flex-wrap text-xs items-center">
                            <span className="text-terminal-primary/60">Modifiers applied after rolling:</span>
                            {selectedRace.characteristicModifiers.map((mod, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded ${mod.modifier >= 0 ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}
                              >
                                {mod.stat.toUpperCase().slice(0, 3)} {mod.modifier >= 0 ? '+' : ''}{mod.modifier}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="relative rounded-lg border border-yellow-500/30 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                      <div className="p-4 bg-yellow-500/5">
                        <p className="text-sm text-terminal-primary/80">
                          Choose how to generate your characteristics: Auto-assign (traditional), Manual (pick where each roll goes), or roll individually.
                        </p>
                        {selectedRace.characteristicModifiers.length > 0 && (
                          <p className="mt-2 text-xs text-cyan-400">
                            Race modifiers will be applied after rolling.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`grid grid-cols-1 ${useManualDice ? '' : 'md:grid-cols-3'} gap-3`}>
                      {!useManualDice && (
                        <>
                          <button
                            onClick={rollAllCharacteristics}
                            className="group bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/50 rounded-lg p-4 transition-all duration-200 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                          >
                            <Dices className="h-6 w-6 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-yellow-400 font-['Orbitron'] tracking-wide text-sm">Auto-Assign</div>
                            <div className="text-xs text-terminal-primary/50 mt-1">Roll 6, assign in order</div>
                          </button>

                          <button
                            onClick={rollForManualAssignment}
                            className="group bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/50 rounded-lg p-4 transition-all duration-200 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                          >
                            <Dices className="h-6 w-6 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-yellow-400 font-['Orbitron'] tracking-wide text-sm">Manual Assign</div>
                            <div className="text-xs text-terminal-primary/50 mt-1">Roll 6, pick placement</div>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setHasRolled(true)}
                        className="group bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/50 rounded-lg p-4 transition-all duration-200 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      >
                        <Dices className="h-6 w-6 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <div className="font-bold text-yellow-400 font-['Orbitron'] tracking-wide text-sm">{useManualDice ? 'Enter Values Individually' : 'Roll Individually'}</div>
                        <div className="text-xs text-terminal-primary/50 mt-1">{useManualDice ? 'Type each stat value' : 'Roll each stat separately'}</div>
                      </button>
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
                      <>
                        {/* Show preview of stats with race modifiers */}
                        {selectedRace.characteristicModifiers.length > 0 && (
                          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
                            <h4 className="text-xs font-bold text-cyan-400 uppercase mb-2">
                              With {selectedRace.name} Modifiers:
                            </h4>
                            <div className="grid grid-cols-6 gap-2 text-center text-sm">
                              {(['strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'] as const).map((stat, idx) => {
                                const baseRoll = characteristicRolls[idx];
                                const modifier = selectedRace.characteristicModifiers.find(m => m.stat === stat)?.modifier || 0;
                                const finalValue = Math.max(1, baseRoll + modifier);
                                return (
                                  <div key={stat}>
                                    <div className="text-terminal-primary/60 text-xs uppercase">{stat.slice(0, 3)}</div>
                                    <div className="text-terminal-primary">
                                      {baseRoll}
                                      {modifier !== 0 && (
                                        <span className={modifier > 0 ? 'text-green-400' : 'text-red-400'}>
                                          {modifier > 0 ? '+' : ''}{modifier}
                                        </span>
                                      )}
                                      {modifier !== 0 && <span className="text-cyan-400"> = {finalValue}</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <Button
                          onClick={assignRolls}
                          className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                        >
                          Assign Rolls in Order (STR, DEX, END, INT, EDU, SOC)
                        </Button>
                      </>
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
                            {!useManualDice && (
                              <Button
                                onClick={() => rollSingleCharacteristic(key)}
                                size="sm"
                                variant="outline"
                                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 h-7"
                              >
                                <Dices className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {rollingStats.has(key) ? (
                              <div className="bg-black border border-terminal-primary/50 text-terminal-primary text-2xl font-bold h-12 w-20 flex items-center justify-center rounded">
                                <AnimatedDiceValue
                                  value={characterData.characteristics[key].total}
                                  isRolling={true}
                                  className="font-mono text-terminal-primary"
                                />
                              </div>
                            ) : (
                              <Input
                                type="number"
                                min="1"
                                max="18"
                                value={characterData.characteristics[key].total || ''}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  if (val >= 0 && val <= 18) {
                                    manuallySetCharacteristic(key, val);
                                  }
                                }}
                                className="bg-black border-terminal-primary/50 text-terminal-primary text-2xl font-bold h-12 w-20 text-center"
                                placeholder="0"
                              />
                            )}
                            <div className="text-xs text-terminal-primary/60">
                              DM: {getDMDisplay(characterData.characteristics[key].total)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={finalizeCharacteristicsWithRace}
                    disabled={
                      assignmentMode === 'manual'
                        ? characteristicRolls.length > 0
                        : !(['strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'] as const).every(
                            stat => characterData.characteristics[stat].total > 0
                          )
                    }
                    className="flex-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/50 transition-all duration-200 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
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
            <Card className="bg-black border-2 border-purple-500/50">
              <CardHeader className="border-b border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-transparent to-purple-500/10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <Award className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-purple-400 font-['Orbitron'] tracking-wider">Background Skills</div>
                    <div className="text-terminal-primary/50 text-xs font-normal font-mono">
                      {backgroundSkillsRemaining} of {getDM(characterData.characteristics.education.total) + 3} remaining
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Info Panel */}
                <div className="relative rounded-lg border border-purple-500/30 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                  <div className="p-4 bg-purple-500/5">
                    <p className="text-sm text-terminal-primary/80">
                      You receive <span className="text-purple-400 font-bold">{getDM(characterData.characteristics.education.total) + 3}</span> background skills at level 0, based on your EDU DM + 3.
                    </p>
                    <p className="text-xs text-terminal-primary/50 mt-1">
                      Select skills that reflect your character's upbringing before entering a career.
                    </p>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {BACKGROUND_SKILLS.map(skill => {
                    const key = normalizeSkillName(skill);
                    const selected = characterData.skills[key]?.proficient;
                    const isDisabled = !selected && backgroundSkillsRemaining === 0;
                    return (
                      <button
                        key={skill}
                        onClick={() => selectBackgroundSkill(key)}
                        disabled={isDisabled}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                          ${selected
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:bg-purple-500/30 hover:border-purple-400 cursor-pointer'
                            : isDisabled
                            ? 'bg-black/30 text-terminal-primary/30 border-terminal-primary/10 cursor-not-allowed'
                            : 'bg-black/50 text-terminal-primary/70 border-terminal-primary/30 hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/10'
                          }
                        `}
                      >
                        {selected && <span className="mr-1">✓</span>}
                        {skill}
                      </button>
                    );
                  })}
                </div>

                {/* Progress Indicator */}
                {backgroundSkillsRemaining === 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-green-400 text-sm">All background skills selected!</span>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-2 pt-2">
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
                    className="flex-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/50 transition-all duration-200 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
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

                {/* PSI Testing Section - only shown if character has been granted PSI testing via event */}
                {!characterData.forcedCareer && characterData.canTestPsi && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-purple-400 font-bold">Psionic Testing</h4>
                        <p className="text-xs text-purple-300/70">
                          {characterData.psiTested
                            ? `PSI: ${characterData.characteristics.psionics?.total || 0}${(characterData.psiTalents?.length || 0) > 0 ? ` | Talents: ${characterData.psiTalents?.join(', ')}` : ' | No talents acquired'}`
                            : 'You have been granted psionic testing. Test for psionic potential to unlock the Psion career.'}
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
                    {!characterData.psiTested && (
                      <div className="mt-3 border-t border-purple-500/30 pt-2">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs text-purple-300/80">Manual PSI 2D6 roll (optional):</span>
                          <Input
                            type="number"
                            min={2}
                            max={12}
                            value={manualPsiRoll}
                            onChange={(e) => setManualPsiRoll(e.target.value)}
                            placeholder="auto"
                            className="h-7 w-20 bg-black/40 border-purple-500/30 text-xs text-purple-200"
                          />
                        </div>
                        <div className="text-xs text-purple-300/80 mb-2">
                          Choose talent test order (DM-1 per previous check attempted):
                        </div>
                        <div className="space-y-1.5">
                          {psiTalentOrder.map((talent, index) => (
                            <div key={talent} className="flex items-center justify-between rounded border border-purple-500/20 px-2 py-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-purple-200">
                                  {index + 1}. {talent}
                                </span>
                                <Input
                                  type="number"
                                  min={2}
                                  max={12}
                                  value={manualTalentRolls[talent] ?? ''}
                                  onChange={(e) => setManualTalentRolls(prev => ({ ...prev, [talent]: e.target.value }))}
                                  placeholder="auto 2D6"
                                  className="h-7 w-24 bg-black/40 border-purple-500/30 text-xs text-purple-200"
                                  disabled={index === 0 && talent === 'Telepathy'}
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0 border-purple-500/30 text-purple-300"
                                  disabled={index === 0}
                                  onClick={() => movePsiTalent(index, -1)}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0 border-purple-500/30 text-purple-300"
                                  disabled={index === psiTalentOrder.length - 1}
                                  onClick={() => movePsiTalent(index, 1)}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {psiTestResult && (
                      <div className="mt-3 text-xs text-purple-300/80 border-t border-purple-500/30 pt-2">
                        <div className="font-bold mb-1">Test Results:</div>
                        {psiTestResult.talentsTested.map((t) => (
                          <div key={t.talent} className={t.acquired ? 'text-green-400' : 'text-red-400/70'}>
                            {t.talent}: {t.automatic
                              ? `Auto-acquired (first talent Telepathy)`
                              : `2D6 ${t.rawRoll} ${t.psiDM >= 0 ? '+' : '-'} ${Math.abs(t.psiDM)} ${t.learningDM >= 0 ? '+' : '-'} ${Math.abs(t.learningDM)} ${t.attemptDM >= 0 ? '+' : '-'} ${Math.abs(t.attemptDM)} = ${t.total} vs ${t.targetNumber}`} - {t.acquired ? 'ACQUIRED' : 'Failed'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Career Cards */}
                {getAvailableCareers().map(career => {
                  const theme = getCareerTheme(career.name);
                  const CareerIcon = theme.icon;
                  const isSelected = selectedCareer?.name === career.name;
                  const availability = isCareerAvailable(career);
                  const isLocked = !availability.available;

                  return (
                    <Card
                      key={career.name}
                      className={`transition-all duration-200 border-2 bg-black ${
                        isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      style={{
                        ...getCareerCardStyle(career.name, isSelected && !isLocked),
                        borderWidth: isSelected && !isLocked ? '2px' : '1px',
                      }}
                      onClick={() => {
                        if (isLocked) return;

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
                        <div className="flex items-start gap-3">
                          <div
                            className="p-2 rounded-lg shrink-0"
                            style={{ backgroundColor: theme.bgColor }}
                          >
                            <CareerIcon
                              className="h-5 w-5"
                              style={{ color: theme.textColor }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className="font-bold font-['Orbitron'] tracking-wide"
                                style={{ color: theme.textColor }}
                              >
                                {career.name}
                              </h3>
                              {career.isPreCareer && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase font-bold">
                                  Pre-Career
                                </span>
                              )}
                              {isLocked && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-primary/10 text-terminal-primary/40 uppercase font-bold flex items-center gap-1">
                                  <Lock className="h-2.5 w-2.5" /> Locked
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-terminal-primary/60 italic mb-2">{theme.tagline}</p>
                            <p className="text-sm text-terminal-primary/80 mb-2">{career.description}</p>
                            <div
                              className="text-xs font-mono"
                              style={{ color: theme.textColor, opacity: 0.7 }}
                            >
                              Qualification: {career.qualification}
                            </div>
                            {isLocked && availability.reason && (
                              <div className="text-xs text-terminal-primary/40 italic mt-1">
                                {availability.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {selectedCareer && (() => {
                  const selectedTheme = getCareerTheme(selectedCareer.name);
                  const SelectedCareerIcon = selectedTheme.icon;

                  return (
                  <>
                    <div
                      className="space-y-2 p-4 rounded-lg border"
                      style={{
                        backgroundColor: selectedTheme.bgColor,
                        borderColor: selectedTheme.borderColor,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <SelectedCareerIcon className="h-4 w-4" style={{ color: selectedTheme.textColor }} />
                        <h3
                          className="text-sm font-bold uppercase font-['Orbitron'] tracking-wider"
                          style={{ color: selectedTheme.textColor }}
                        >
                          Select Assignment
                        </h3>
                      </div>
                      {selectedCareer.assignments.map((assignment, idx) => (
                        <Card
                          key={idx}
                          className="cursor-pointer transition-all duration-200 bg-black/50"
                          style={{
                            borderColor: selectedAssignment === idx ? selectedTheme.primaryColor : selectedTheme.borderColor,
                            borderWidth: selectedAssignment === idx ? '2px' : '1px',
                            boxShadow: selectedAssignment === idx ? `0 0 15px ${selectedTheme.glowColor}` : 'none',
                          }}
                          onClick={() => {
                            setSelectedAssignment(idx);
                            // Auto-set military academy service from assignment name
                            if (selectedCareer?.preCareerType === 'military_academy') {
                              const aName = selectedCareer.assignments[idx].name;
                              if (aName.includes('Army')) setMilitaryAcademyService('Army');
                              else if (aName.includes('Marine')) setMilitaryAcademyService('Marines');
                              else if (aName.includes('Navy')) setMilitaryAcademyService('Navy');
                            }
                          }}
                        >
                          <CardContent className="p-3">
                            <h4
                              className="font-bold text-sm"
                              style={{ color: selectedTheme.textColor }}
                            >
                              {assignment.name}
                            </h4>
                            <p className="text-xs text-terminal-primary/70 mb-1">{assignment.description}</p>
                            <div
                              className="text-xs font-mono"
                              style={{ color: selectedTheme.textColor, opacity: 0.7 }}
                            >
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
                      useManualDice ? (
                        <div className="space-y-2">
                          <p className="text-xs text-blue-400">Enter your 2D6 roll result for qualification (DM will be applied automatically):</p>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min={2}
                              max={12}
                              value={manualDiceValue}
                              onChange={(e) => setManualDiceValue(e.target.value)}
                              placeholder="Enter 2D6 result (2-12)"
                              className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
                            />
                            <Button
                              onClick={() => {
                                const val = parseInt(manualDiceValue);
                                if (!isNaN(val) && val >= 2 && val <= 12) {
                                  attemptQualification(val);
                                  setManualDiceValue('');
                                }
                              }}
                              disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue)) || parseInt(manualDiceValue) < 2 || parseInt(manualDiceValue) > 12}
                              className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                            >
                              Submit Qualification Roll
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => attemptQualification()}
                          className="w-full transition-all duration-200"
                          style={{
                            backgroundColor: selectedTheme.bgColor,
                            color: selectedTheme.textColor,
                            borderColor: selectedTheme.borderColor,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                          }}
                        >
                          <Dices className="h-4 w-4 mr-2" />
                          Attempt Qualification for {selectedCareer.name}
                        </Button>
                      )
                    )}

                    {qualificationRollLog && (
                      <div
                        className="rounded p-3 border"
                        style={{
                          backgroundColor: selectedTheme.bgColor,
                          borderColor: selectedTheme.borderColor,
                        }}
                      >
                        <p className="text-xs font-mono" style={{ color: selectedTheme.textColor, opacity: 0.8 }}>{qualificationRollLog}</p>
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
                        {selectedCareer?.preCareerType === 'military_academy' && !militaryAcademyService && (
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

                        {awaitingDraftManualRoll ? (
                          <div className="space-y-2 bg-yellow-600/5 border border-yellow-600/40 rounded p-2">
                            <p className="text-xs text-yellow-300">
                              Enter your 1D6 draft roll: 1=Navy, 2=Army, 3=Marines, 4=Merchant (Merchant Marine), 5=Scout, 6=Agent (Law Enforcement).
                            </p>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min={1}
                                max={6}
                                value={draftManualInput}
                                onChange={(e) => setDraftManualInput(e.target.value)}
                                placeholder="1-6"
                                className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
                              />
                              <Button
                                onClick={() => {
                                  const val = parseInt(draftManualInput);
                                  if (!isNaN(val) && val >= 1 && val <= 6) {
                                    runDraftRoll(val);
                                  }
                                }}
                                disabled={!draftManualInput || isNaN(parseInt(draftManualInput)) || parseInt(draftManualInput) < 1 || parseInt(draftManualInput) > 6}
                                className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30"
                              >
                                Submit Draft Roll
                              </Button>
                            </div>
                            <Button
                              onClick={() => { setAwaitingDraftManualRoll(false); setDraftManualInput(''); }}
                              variant="outline"
                              size="sm"
                              className="text-xs border-yellow-600/40 text-yellow-300"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
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
                        )}

                        {hasUsedDraft && (
                          <Alert className="bg-yellow-500/10 border-yellow-500/50">
                            <AlertDescription className="text-yellow-400 text-xs">
                              You have already used your draft. You must become a Drifter if you fail qualification again.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
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
                        className="flex-1"
                        style={{
                          backgroundColor: selectedTheme.bgColor,
                          color: selectedTheme.textColor,
                          borderColor: selectedTheme.borderColor,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                        }}
                      >
                        Begin Career
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 5: TERMS */}
          <TabsContent value="step5">
            {(() => {
              const termTheme = selectedCareer ? getCareerTheme(selectedCareer.name) : getCareerTheme('');
              const TermCareerIcon = termTheme.icon;

              return (
            <Card
              className="bg-black border-2"
              style={{ borderColor: termTheme.borderColor }}
            >
              <CardHeader
                className="border-b"
                style={{
                  borderColor: termTheme.borderColor,
                  background: `linear-gradient(135deg, ${termTheme.bgColor} 0%, rgba(0,0,0,0.95) 100%)`,
                }}
              >
                <CardTitle className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: termTheme.bgColor, boxShadow: `0 0 15px ${termTheme.glowColor}` }}
                  >
                    <TermCareerIcon className="h-5 w-5" style={{ color: termTheme.textColor }} />
                  </div>
                  <div>
                    <div
                      className="font-['Orbitron'] tracking-wider"
                      style={{ color: termTheme.textColor }}
                    >
                      {isInTerm ? `Term ${currentTerm} in Progress` : currentTerm > 0 ? `Completed ${currentTerm} ${currentTerm === 1 ? 'Term' : 'Terms'}` : 'Ready to Begin'}
                    </div>
                    <div className="text-terminal-primary/50 text-sm font-normal font-mono">
                      {characterData.career} • {characterData.lifepath_log.length} total terms served
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {midCareerMusterRecord ? (
                  <MusteringOut
                    careerHistory={[midCareerMusterRecord]}
                    lostBenefitCareers={characterData.lostBenefitCareers || []}
                    currentCash={characterData.cash_on_hand}
                    currentShipShares={characterData.shipShares}
                    hasTasMembership={characterData.tasMembership}
                    ships={characterData.ships}
                    gamblerSkillLevel={parseInt(characterData.skills['Gambler']?.value || '0', 10) || 0}
                    characteristics={characterData.characteristics}
                    onComplete={handleMidCareerMusterComplete}
                    useManualDice={useManualDice}
                    initialCashRollsUsed={lifetimeCashRollsUsed}
                    title={`Leaving ${midCareerMusterRecord.careerName} — Benefit Rolls`}
                    completeLabel="Continue to Next Career"
                  />
                ) : isMusteringOut ? (
                  <MusteringOut
                    // Final mustering-out: skip careers that already had their
                    // between-career benefit rolls so they can't double-dip.
                    careerHistory={characterData.careerHistory.filter(c => !c.benefitsTaken)}
                    lostBenefitCareers={characterData.lostBenefitCareers || []}
                    currentCash={characterData.cash_on_hand}
                    currentShipShares={characterData.shipShares}
                    hasTasMembership={characterData.tasMembership}
                    ships={characterData.ships}
                    gamblerSkillLevel={parseInt(characterData.skills['Gambler']?.value || '0', 10) || 0}
                    characteristics={characterData.characteristics}
                    onComplete={handleMusteringOutComplete}
                    useManualDice={useManualDice}
                    initialCashRollsUsed={lifetimeCashRollsUsed}
                  />
                ) : (
                <>
                {/* Manual Dice Toggle + Anagathics Toggle */}
                <div className="flex items-center justify-end gap-4 mb-2">
                  <label className="text-xs text-terminal-primary/60 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={characterData.hasAnagathics === true}
                      onChange={(e) => {
                        setCharacterData(prev => ({ ...prev, hasAnagathics: e.target.checked }));
                      }}
                      className="accent-terminal-primary"
                    />
                    <span>Anagathics active (2 Survival rolls / term)</span>
                  </label>
                  <label className="text-xs text-terminal-primary/60 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useManualDice}
                      onChange={(e) => {
                        setUseManualDice(e.target.checked);
                        setManualDiceValue('');
                      }}
                      className="accent-terminal-primary"
                    />
                    <span>Manual Dice Entry (use physical dice)</span>
                  </label>
                </div>

                {/* Career Status Panel */}
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: termTheme.bgColor,
                    borderColor: termTheme.borderColor,
                  }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-terminal-primary/50">Career</div>
                      <div className="font-bold" style={{ color: termTheme.textColor }}>{characterData.career}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-terminal-primary/50">Assignment</div>
                      <div className="font-bold" style={{ color: termTheme.textColor }}>{selectedCareer?.assignments[selectedAssignment].name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-terminal-primary/50">Rank</div>
                      <div className="font-bold" style={{ color: termTheme.textColor }}>
                        {getRankTitle(
                          selectedCareer,
                          characterData.rank,
                          isCommissioned,
                          selectedCareer?.assignments[selectedAssignment]?.name
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-terminal-primary/50">Age</div>
                      <div className="font-bold text-terminal-primary">{characterData.age}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-terminal-primary/50">Terms in Career</div>
                      <div className="font-bold text-terminal-primary">{currentTerm}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-terminal-primary/50">Total Terms</div>
                      <div className="font-bold text-terminal-primary">{characterData.lifepath_log.length}</div>
                    </div>
                  </div>
                  {/* Show Parole Threshold for Prisoner career */}
                  {selectedCareer?.isPrisonerCareer && characterData.paroleThreshold !== undefined && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
                      <span className="text-red-400 font-bold">Parole Threshold:</span>{' '}
                      <span className="text-red-300">{characterData.paroleThreshold}</span>
                      <span className="text-red-400/70 text-xs ml-2">(advancement roll must exceed this to be released)</span>
                    </div>
                  )}
                </div>

                {/* CURRENT CHARACTERISTICS */}
                <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                  <h3 className="text-sm font-bold text-terminal-primary mb-2">Current Characteristics</h3>
                  <div className="grid grid-cols-6 gap-2 text-center">
                    {(['strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'] as const).map((stat) => {
                      const value = characterData.characteristics[stat].total;
                      const dm = getDM(value);
                      const isLow = value <= 2;
                      const isCritical = value <= 0;
                      return (
                        <div
                          key={stat}
                          className={`p-2 rounded border ${
                            isCritical
                              ? 'bg-red-500/20 border-red-500/50'
                              : isLow
                              ? 'bg-yellow-500/10 border-yellow-500/50'
                              : 'bg-terminal-primary/10 border-terminal-primary/30'
                          } ${glowingStats.has(stat) ? 'stat-glow' : ''}`}
                        >
                          <div className={`text-xs font-bold uppercase ${isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-terminal-primary/60'}`}>
                            {stat.slice(0, 3)}
                          </div>
                          <div className={`text-lg font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-terminal-primary'}`}>
                            {value}
                          </div>
                          <div className={`text-xs ${isCritical ? 'text-red-400/70' : isLow ? 'text-yellow-400/70' : 'text-terminal-primary/50'}`}>
                            DM {dm >= 0 ? '+' : ''}{dm}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {characterData.characteristics.psionics && characterData.characteristics.psionics.total > 0 && (
                    <div className="mt-2 p-2 rounded border bg-purple-500/10 border-purple-500/50 text-center">
                      <span className="text-xs font-bold text-purple-400 uppercase">PSI</span>
                      <span className="text-lg font-bold text-purple-400 ml-2">{characterData.characteristics.psionics.total}</span>
                      <span className="text-xs text-purple-400/70 ml-2">
                        (DM {getDM(characterData.characteristics.psionics.total) >= 0 ? '+' : ''}{getDM(characterData.characteristics.psionics.total)})
                      </span>
                    </div>
                  )}
                </div>

                {/* SKILLS SUMMARY */}
                <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                  <h3 className="text-sm font-bold text-terminal-primary mb-2">Acquired Skills</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-terminal-primary/80">
                    {Object.entries(characterData.skills)
                      .filter(([_, skill]) => skill.proficient || parseInt(skill.value, 10) > 0)
                      .sort((a, b) => parseInt(b[1].value, 10) - parseInt(a[1].value, 10))
                      .map(([skillName, skill]) => (
                        <div key={skillName} className="flex justify-between">
                          <span className="capitalize">{skillName.replace(/_/g, ' ')}</span>
                          <span className="text-terminal-primary">{skill.value}</span>
                        </div>
                      ))}
                    {Object.entries(characterData.skills).filter(([_, skill]) => skill.proficient || parseInt(skill.value, 10) > 0).length === 0 && (
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

                {/* COMMISSION ROLL (pre-career graduates entering a service career) */}
                {isInTerm && termSurvived === null && basicTrainingApplied &&
                  needsCommissionRoll && !isCommissioned &&
                  typeof selectedCareer?.commissionTarget === 'number' && (
                  <div className="space-y-2">
                    <Alert className="bg-purple-500/10 border-purple-500/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-purple-300">
                        <strong>Commission Roll:</strong>{' '}
                        {commissionRollDM === -999
                          ? 'Military Academy honours grant automatic commission.'
                          : `Roll 2D6 + SOC DM${commissionRollDM ? ` + ${commissionRollDM} (pre-career)` : ''} vs ${selectedCareer.commissionTarget}+. The pre-career DM is consumed after this attempt.`}
                      </AlertDescription>
                    </Alert>
                    {commissionRollDM === -999 ? (
                      <Button
                        onClick={() => runCommissionCheck()}
                        className="w-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                      >
                        Accept Automatic Commission
                      </Button>
                    ) : useManualDice ? (
                      <div className="space-y-2">
                        <p className="text-xs text-blue-400">Enter your 2D6 commission roll (DM applied automatically):</p>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={2}
                            max={12}
                            value={manualDiceValue}
                            onChange={(e) => setManualDiceValue(e.target.value)}
                            placeholder="Enter 2D6 result (2-12)"
                            className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
                          />
                          <Button
                            onClick={() => {
                              const val = parseInt(manualDiceValue);
                              if (!isNaN(val) && val >= 2 && val <= 12) {
                                runCommissionCheck(val);
                                setManualDiceValue('');
                              }
                            }}
                            disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue)) || parseInt(manualDiceValue) < 2 || parseInt(manualDiceValue) > 12}
                            className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          >
                            Submit Commission Roll
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => runCommissionCheck()}
                        className="w-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                      >
                        <Dices className="h-4 w-4 mr-2" />
                        Roll Commission Check
                      </Button>
                    )}
                  </div>
                )}

                {/* Commission roll log (persists after resolution, before survival) */}
                {commissionRollLog && (
                  <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-2">
                    <p className="text-xs text-terminal-primary/70 font-mono">{commissionRollLog}</p>
                  </div>
                )}

                {isInTerm && termSurvived === null && basicTrainingApplied &&
                  !(needsCommissionRoll && typeof selectedCareer?.commissionTarget === 'number' && !isCommissioned) && (
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
                    {selectedCareer && selectedCareer.mishapTable && (
                      <CareerTableDisplay
                        title="Potential Mishaps (1D6)"
                        titleColor="text-red-400"
                        entries={(selectedCareer.mishapTable || []).map((mishap, idx) => ({
                          index: idx + 1,
                          label: `${idx + 1}.`,
                          description: getMishapDescription(mishap),
                        }))}
                      />
                    )}

                    {useManualDice ? (
                      <div className="space-y-2">
                        <p className="text-xs text-blue-400">Enter your 2D6 roll result (DM will be applied automatically):</p>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={2}
                            max={12}
                            value={manualDiceValue}
                            onChange={(e) => setManualDiceValue(e.target.value)}
                            placeholder="Enter 2D6 result (2-12)"
                            className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
                          />
                          <Button
                            onClick={() => {
                              const val = parseInt(manualDiceValue, 10);
                              if (!isNaN(val) && val >= 2 && val <= 12) {
                                runSurvivalCheck(val);
                                setManualDiceValue('');
                              }
                            }}
                            disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue, 10)) || parseInt(manualDiceValue, 10) < 2 || parseInt(manualDiceValue, 10) > 12}
                            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                          >
                            Submit {selectedCareer?.isPreCareer ? 'Graduation' : 'Survival'} Roll
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => runSurvivalCheck()}
                        className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        <Dices className="h-4 w-4 mr-2" />
                        {selectedCareer?.isPreCareer ? 'Roll Graduation Check' : 'Roll Survival Check'}
                      </Button>
                    )}
                  </div>
                )}

                {isInTerm && termSurvived === false && (
                  <div className="space-y-2">
                    <Alert className="bg-red-500/10 border-red-500/50">
                      <AlertDescription className="text-red-400">
                        {selectedCareer?.isPreCareer
                          ? '✗ Failed to graduate. You may attempt to qualify for any career (except another pre-career this term).'
                          : '✗ Survival check failed! You suffer a mishap.'}
                      </AlertDescription>
                    </Alert>
                    {survivalRollLog && (
                      <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-2">
                        <p className="text-xs text-terminal-primary/60 font-mono">{survivalRollLog}</p>
                      </div>
                    )}

                    {/* Manual dice: waiting for player to roll mishap */}
                    {needsMishapRoll && useManualDice && (
                      <div className="space-y-2">
                        <p className="text-xs text-blue-400">Enter your 1D6 roll result for the mishap table:</p>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={6}
                            value={manualDiceValue}
                            onChange={(e) => setManualDiceValue(e.target.value)}
                            placeholder="Enter 1D6 result (1-6)"
                            className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
                          />
                          <Button
                            onClick={() => {
                              const val = parseInt(manualDiceValue);
                              if (!isNaN(val) && val >= 1 && val <= 6) {
                                applyMishapRoll(val);
                                setManualDiceValue('');
                              }
                            }}
                            disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue)) || parseInt(manualDiceValue) < 1 || parseInt(manualDiceValue) > 6}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            Submit Mishap Roll
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Pending Mishap GameEvent - requires player interaction */}
                    {pendingMishapGameEvent && !redirectedEvent && !pendingTableRedirect && (
                      <div className="space-y-2">
                        <Alert className="bg-yellow-500/10 border-yellow-500/50">
                          <AlertDescription className="text-yellow-400">
                            <strong>Mishap {mishapRollNumber}:</strong> {pendingMishapGameEvent.description}
                          </AlertDescription>
                        </Alert>
                        <EventHandler
                          event={pendingMishapGameEvent}
                          characteristics={characterData.characteristics}
                          skills={characterData.skills}
                          onComplete={handleMishapGameEventComplete}
                          onTableRedirect={(table) => handleTableRedirect(table, true)}
                          useManualDice={useManualDice}
                        />
                      </div>
                    )}

                    {/* Pending Table Redirect from Mishap - show table and roller */}
                    {pendingMishapGameEvent && pendingTableRedirect && pendingTableIsMishap && (
                      <div className="space-y-2">
                        <Alert className="bg-yellow-500/10 border-yellow-500/50">
                          <AlertDescription className="text-yellow-400">
                            <strong>Mishap {mishapRollNumber}:</strong> {pendingMishapGameEvent.description}
                          </AlertDescription>
                        </Alert>
                        {renderPendingTableRedirect()}
                      </div>
                    )}

                    {/* Redirected Event from Mishap (e.g., roll on injury table) */}
                    {pendingMishapGameEvent && redirectedEvent && (
                      <div className="space-y-2">
                        <Alert className="bg-yellow-500/10 border-yellow-500/50">
                          <AlertDescription className="text-yellow-400">
                            <strong>Mishap {mishapRollNumber}:</strong> {pendingMishapGameEvent.description}
                          </AlertDescription>
                        </Alert>
                        <Alert className="bg-blue-500/10 border-blue-500/50">
                          <AlertDescription className="text-blue-400">
                            <strong>{redirectTableName} (rolled {redirectTableRoll}):</strong>
                          </AlertDescription>
                        </Alert>
                        <EventHandler
                          event={redirectedEvent}
                          characteristics={characterData.characteristics}
                          skills={characterData.skills}
                          onComplete={handleMishapRedirectedEventComplete}
                          onTableRedirect={handleNestedTableRedirect}
                          useManualDice={useManualDice}
                        />
                      </div>
                    )}

                    {/* Simple string mishap or already-resolved mishap - show exit options */}
                    {!pendingMishapGameEvent && (
                      <>
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
                      </>
                    )}
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

                        {useManualDice ? (
                          <div className="space-y-2">
                            <p className="text-xs text-blue-400">Enter your 2D6 roll result for the event table:</p>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min={2}
                                max={12}
                                value={manualDiceValue}
                                onChange={(e) => setManualDiceValue(e.target.value)}
                                placeholder="Enter 2D6 result (2-12)"
                                className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
                              />
                              <Button
                                onClick={() => {
                                  const val = parseInt(manualDiceValue, 10);
                                  if (!isNaN(val) && val >= 2 && val <= 12) {
                                    rollEvent(val);
                                    setManualDiceValue('');
                                  }
                                }}
                                disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue, 10)) || parseInt(manualDiceValue, 10) < 2 || parseInt(manualDiceValue, 10) > 12}
                                className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                              >
                                Submit Event Roll
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => rollEvent()}
                            className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                          >
                            <Dices className="h-4 w-4 mr-2" />
                            Roll Event (2D6)
                          </Button>
                        )}
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
                            ✓ Survival check passed! Now roll for an event.
                          </AlertDescription>
                        </Alert>

                        {/* EVENT TABLE */}
                        {selectedCareer && selectedCareer.eventTable && (
                          <div className="bg-black border border-terminal-primary/30 rounded p-3">
                            <h4 className="text-xs font-bold text-blue-400 mb-2">Possible Events (2D6):</h4>
                            <div className="space-y-1 text-xs text-terminal-primary/70">
                              {(selectedCareer.eventTable || []).map((event, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <span className="text-terminal-primary/50">{idx + 2}.</span>
                                  <span>{getEventDescription(event)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {useManualDice ? (
                          <div className="space-y-2">
                            <p className="text-xs text-blue-400">Enter your 2D6 roll result for the event table:</p>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min={2}
                                max={12}
                                value={manualDiceValue}
                                onChange={(e) => setManualDiceValue(e.target.value)}
                                placeholder="Enter 2D6 result (2-12)"
                                className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
                              />
                              <Button
                                onClick={() => {
                                  const val = parseInt(manualDiceValue, 10);
                                  if (!isNaN(val) && val >= 2 && val <= 12) {
                                    rollEvent(val);
                                    setManualDiceValue('');
                                  }
                                }}
                                disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue, 10)) || parseInt(manualDiceValue, 10) < 2 || parseInt(manualDiceValue, 10) > 12}
                                className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                              >
                                Submit Event Roll
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => rollEvent()}
                            className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                          >
                            <Dices className="h-4 w-4 mr-2" />
                            Roll Event (2D6)
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* COMMISSION ROLL - after event is resolved, before advancement */}
                {isInTerm && termSurvived === true && termEventRoll !== null && gameEventCompleted
                  && !selectedCareer?.isPreCareer
                  && isEligibleForCommission()
                  && !commissionAttempted && (
                  <div className="space-y-2">
                    <Alert className="bg-blue-500/10 border-blue-500/50">
                      <AlertDescription className="text-blue-400">
                        <strong>Commission Opportunity</strong>
                        <p className="mt-1 text-xs">
                          You may attempt to earn a commission this term. Target: {selectedCareer?.commissionTarget ?? 8}+
                          {getCommissionDMBreakdown()}
                        </p>
                      </AlertDescription>
                    </Alert>
                    {useManualDice ? (
                      <div className="space-y-2">
                        <p className="text-xs text-blue-400">Enter your 2D6 roll result for the commission roll:</p>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={2}
                            max={12}
                            value={manualDiceValue}
                            onChange={(e) => setManualDiceValue(e.target.value)}
                            placeholder="Enter 2D6 result (2-12)"
                            className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
                          />
                          <Button
                            onClick={() => {
                              const val = parseInt(manualDiceValue);
                              if (!isNaN(val) && val >= 2 && val <= 12) {
                                runCommissionCheck(val);
                                setManualDiceValue('');
                              }
                            }}
                            disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue)) || parseInt(manualDiceValue) < 2 || parseInt(manualDiceValue) > 12}
                            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                          >
                            Submit Commission Roll
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => runCommissionCheck()}
                          className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                        >
                          <Dices className="h-4 w-4 mr-2" />
                          Roll for Commission
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCommissionAttempted(true)}
                          className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/10"
                        >
                          Skip
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Commission roll result display */}
                {isInTerm && commissionRollLog && (
                  <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                    <p className="text-xs text-terminal-primary/80 font-mono">{commissionRollLog}</p>
                  </div>
                )}

                {/* ADVANCEMENT ROLL - after event resolved + commission resolved (or n/a) */}
                {isInTerm && termSurvived === true && termEventRoll !== null && gameEventCompleted
                  && !selectedCareer?.isPreCareer
                  && termAdvanced === null
                  && (!isEligibleForCommission() || commissionAttempted) && (
                  <div className="space-y-2">
                    <Alert className="bg-green-500/10 border-green-500/50">
                      <AlertDescription className="text-green-400">
                        Now roll for advancement.
                      </AlertDescription>
                    </Alert>
                    {useManualDice ? (
                      <div className="space-y-2">
                        <p className="text-xs text-blue-400">Enter your 2D6 roll result (DM will be applied automatically):</p>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={2}
                            max={12}
                            value={manualDiceValue}
                            onChange={(e) => setManualDiceValue(e.target.value)}
                            placeholder="Enter 2D6 result (2-12)"
                            className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
                          />
                          <Button
                            onClick={() => {
                              const val = parseInt(manualDiceValue, 10);
                              if (!isNaN(val) && val >= 2 && val <= 12) {
                                runAdvancementCheck(val);
                                setManualDiceValue('');
                              }
                            }}
                            disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue, 10)) || parseInt(manualDiceValue, 10) < 2 || parseInt(manualDiceValue, 10) > 12}
                            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                          >
                            Submit Advancement Roll
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => runAdvancementCheck()}
                        className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        <Dices className="h-4 w-4 mr-2" />
                        Roll Advancement Check
                      </Button>
                    )}
                  </div>
                )}

                {/* ADVANCEMENT RESULT */}
                {isInTerm && termAdvanced !== null && !selectedCareer?.isPreCareer && (
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
                  </div>
                )}

                {isInTerm && termEventRoll !== null && (
                  <div className="space-y-2">
                    {/* Pending Table Redirect - show table and roller before rolling */}
                    {pendingTableRedirect && !pendingTableIsMishap && (
                      <div className="space-y-2">
                        {renderPendingTableRedirect()}
                      </div>
                    )}

                    {/* Redirected Event (from table redirect like Life Events -> Injury) */}
                    {redirectedEvent && !pendingTableIsMishap && (
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
                          useManualDice={useManualDice}
                        />
                      </div>
                    )}

                    {/* New GameEvent System */}
                    {currentGameEvent && !gameEventCompleted && !redirectedEvent && !pendingTableRedirect && (
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
                          useManualDice={useManualDice}
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
                                {useManualDice ? (
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      min={2}
                                      max={12}
                                      value={manualDiceValue}
                                      onChange={(e) => setManualDiceValue(e.target.value)}
                                      placeholder="2D6 (2-12)"
                                      className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40 w-28"
                                    />
                                    <Button
                                      onClick={() => {
                                        const val = parseInt(manualDiceValue);
                                        if (!isNaN(val) && val >= 2 && val <= 12) {
                                          const success = rollEventCheck(currentEvent.requiresRoll!.characteristic, currentEvent.requiresRoll!.target, val);
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
                                          setManualDiceValue('');
                                        }
                                      }}
                                      disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue)) || parseInt(manualDiceValue) < 2 || parseInt(manualDiceValue) > 12}
                                      className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                                    >
                                      Submit {currentEvent.requiresRoll.characteristic.toUpperCase()} {currentEvent.requiresRoll.target}+ Roll
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      const success = rollEventCheck(currentEvent.requiresRoll!.characteristic, currentEvent.requiresRoll!.target);
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
                                )}
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

                    {/* Skill Gain Tables moved to the start of the term (they fire BEFORE
                        survival/events/commission/advancement per Traveller 2e pp. 20/46).
                        The "Skills Gained This Term" summary below stays here so the player
                        can review rank-bonus and event-granted skills alongside training rolls
                        when they reach the end of the term. */}
                    {!selectedCareer?.isPreCareer && !pendingSpecialtySkill && termSkillsGained.length > 0 && (
                      <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                        <h5 className="text-xs font-bold text-terminal-primary uppercase mb-2">Skills Gained This Term:</h5>
                        <ul className="text-xs text-terminal-primary/80 space-y-1">
                          {termSkillsGained.map((skill, idx) => (
                            <li key={idx}>• {skill}</li>
                          ))}
                        </ul>
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
                        {selectedCareer?.preCareerType === 'military_academy' && termSurvived && !pendingSpecialtySkill && !pendingAnyTalentSource && (
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

                    {((!currentGameEvent || gameEventCompleted) && (!currentEvent || eventResolved) && !pendingSpecialtySkill && !pendingAnyTalentSource &&
                      !(selectedCareer?.preCareerType === 'military_academy' && termSurvived && academyGradSkillsSelected.length < 3) &&
                      (selectedCareer?.isPreCareer || termAdvanced !== null)) && (
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
                      {forceLeaveCareer && !agingPending && (
                        <p className="text-xs text-yellow-400">You must leave this career.</p>
                      )}
                      {agingPending && (
                        <p className="text-xs text-terminal-primary/50">Resolve aging effects before continuing.</p>
                      )}
                      {forcedContinueInCareer && !agingPending && (
                        <Alert className="bg-yellow-500/10 border-yellow-500/50">
                          <AlertDescription className="text-yellow-400 text-xs">
                            Natural 12 on advancement — you must continue in {selectedCareer?.name} next term. You cannot leave or muster out this term.
                          </AlertDescription>
                        </Alert>
                      )}
                      {forcedLeaveAfterTerm && !forcedContinueInCareer && !agingPending && (
                        <Alert className="bg-red-500/10 border-red-500/50">
                          <AlertDescription className="text-red-400 text-xs">
                            Your advancement roll did not exceed your terms in this career — you must leave {selectedCareer?.name} after this term.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Anagathics offer at the start of any term (SOC 10+, not using noAnagathics career). */}
                      {!agingPending && !showAnagathicsPrompt && characterData.characteristics.social.total >= 10 &&
                        !(selectedCareer?.noAnagathics) && (
                        <Button
                          onClick={() => setShowAnagathicsPrompt(true)}
                          variant="outline"
                          size="sm"
                          className="w-full border-blue-500/30 text-blue-400/70 hover:bg-blue-500/10"
                        >
                          {characterData.isUsingAnagathics ? 'Manage Anagathics' : 'Seek Anagathics'}
                        </Button>
                      )}

                      <div className="flex gap-2">
                        {!forceLeaveCareer && !agingPending && (
                          <Button
                            onClick={startNewTerm}
                            disabled={forcedLeaveAfterTerm && !forcedContinueInCareer}
                            className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 border border-terminal-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Start Term {currentTerm + 1}
                          </Button>
                        )}
                        {!agingPending && (
                          <Button
                            onClick={musterOut}
                            disabled={forcedContinueInCareer}
                            className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Muster Out
                          </Button>
                        )}
                      </div>
                      {!agingPending && (
                        <div className="flex gap-2">
                          <Button
                            onClick={switchToNewCareer}
                            disabled={forcedContinueInCareer}
                            variant="outline"
                            className="flex-1 border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Switch Career
                          </Button>
                          {canSwitchAssignment() && (
                            <Button
                              onClick={startSwitchAssignment}
                              disabled={forcedContinueInCareer}
                              variant="outline"
                              className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Switch Assignment
                            </Button>
                          )}
                        </div>
                      )}
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
                              useManualDice ? (
                                <div key={idx} className="space-y-1">
                                  <div className={`text-sm text-terminal-primary ${idx === selectedAssignment ? 'opacity-40' : ''}`}>
                                    {assignment.name}
                                    {idx === selectedAssignment ? ' (current)' : ''}
                                    <span className="ml-2 text-xs text-terminal-primary/50">
                                      Survival: {assignment.survivalStat.toUpperCase()} {assignment.survivalTarget}+ | Advancement: {assignment.advancementStat.toUpperCase()} {assignment.advancementTarget}+
                                    </span>
                                  </div>
                                  {idx !== selectedAssignment && (
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        min={2}
                                        max={12}
                                        value={manualDiceValue}
                                        onChange={(e) => setManualDiceValue(e.target.value)}
                                        placeholder="2D6 (2-12)"
                                        className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40 w-28"
                                      />
                                      <Button
                                        onClick={() => {
                                          const val = parseInt(manualDiceValue);
                                          if (!isNaN(val) && val >= 2 && val <= 12) {
                                            rollSwitchAssignment(idx, val);
                                            setManualDiceValue('');
                                          }
                                        }}
                                        disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue)) || parseInt(manualDiceValue) < 2 || parseInt(manualDiceValue) > 12}
                                        size="sm"
                                        variant="outline"
                                        className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                                      >
                                        Switch to {assignment.name}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
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
                              )
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

                {/* Interactive Aging System */}
                {agingPending && agingResult && (
                  <div className="space-y-3">
                    {/* Aging Roll Result */}
                    <Alert className={agingResult.passed ? "bg-green-500/10 border-green-500/50" : "bg-yellow-500/10 border-yellow-500/50"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className={agingResult.passed ? "text-green-400" : "text-yellow-400"}>
                        <div className="font-bold mb-1">Aging Roll (Term {agingResult.termNumber})</div>
                        <div className="text-sm mb-2">{agingResult.message}</div>
                        {characterData.isUsingAnagathics && (
                          <div className="text-xs text-blue-400 mb-1">Anagathics DM: +{agingResult.dm}</div>
                        )}
                      </AlertDescription>
                    </Alert>

                    {/* Passed - simple acknowledge */}
                    {agingResult.passed && (
                      <Button
                        onClick={acknowledgeAging}
                        size="sm"
                        className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        Acknowledge - No Aging Effects
                      </Button>
                    )}

                    {/* Failed - physical characteristic choices */}
                    {!agingResult.passed && agingResult.effectLevel && !agingPhysicalChosen && (
                      <div className="border border-yellow-500/30 rounded p-3 space-y-2">
                        <p className="text-sm text-yellow-400 font-bold">{agingResult.effectLevel.description}</p>
                        {agingResult.effectLevel.physicalChoices.length === 1 ? (
                          // Automatic (no choice needed)
                          <Button
                            onClick={() => handleAgingPhysicalChoice(0)}
                            className="w-full bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/50"
                          >
                            Apply: {agingResult.effectLevel.physicalChoices[0].label}
                          </Button>
                        ) : (
                          // Player chooses
                          <div className="space-y-1">
                            <p className="text-xs text-terminal-primary/60">Choose which characteristics are affected:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {agingResult.effectLevel.physicalChoices.map((choice, idx) => (
                                <Button
                                  key={idx}
                                  onClick={() => handleAgingPhysicalChoice(idx)}
                                  variant="outline"
                                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                                >
                                  {choice.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mental characteristic choices (only for extreme aging, Effect -6 or less) */}
                    {!agingResult.passed && agingPhysicalChosen && agingResult.effectLevel?.mentalChoices && !agingMentalChosen && (
                      <div className="border border-red-500/30 rounded p-3 space-y-2">
                        <p className="text-sm text-red-400 font-bold">Additionally, reduce one mental characteristic by 1.</p>
                        <div className="grid grid-cols-2 gap-2">
                          {agingResult.effectLevel.mentalChoices.map((choice, idx) => (
                            <Button
                              key={idx}
                              onClick={() => handleAgingMentalChoice(idx)}
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >
                              {choice.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Aging effects applied - show summary */}
                    {!agingResult.passed && (agingPhysicalChosen && (!agingResult.effectLevel?.mentalChoices || agingMentalChosen)) && (
                      <div className="space-y-2">
                        <div className="text-xs text-terminal-primary/70">
                          Applied: {agingChosenEffects.map(e => `${e.stat.toUpperCase()} ${e.modifier}`).join(', ')}
                        </div>

                        {/* Aging Crisis Alert */}
                        {agingCrisis?.isCrisis && (
                          <Alert className="bg-red-500/10 border-red-500/50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-red-400">
                              <div className="font-bold mb-1">AGING CRISIS</div>
                              <div className="text-sm">{agingCrisis.message}</div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Medical Bill from aging (if any) */}
                        {pendingMedicalBill && (
                          <Alert className="bg-blue-500/10 border-blue-500/50">
                            <AlertDescription className="text-blue-400 text-xs">
                              {pendingMedicalBill.message}
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button
                          onClick={acknowledgeAging}
                          size="sm"
                          className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                        >
                          Acknowledge Aging Effects
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Anagathics Prompt (shown between terms when eligible) */}
                {!agingPending && !isInTerm && currentTerm > 0 && termSurvived !== false &&
                  !selectedCareer?.isPreCareer && showAnagathicsPrompt && (
                  <div className="border border-blue-500/30 rounded p-3 space-y-2">
                    <p className="text-sm text-blue-400 font-bold">Anagathics</p>
                    {characterData.isUsingAnagathics ? (
                      <div className="space-y-2">
                        <p className="text-xs text-terminal-primary/70">
                          You are currently using anagathics (started term {characterData.anagathicsStartTerm}).
                          Cost: 1D × Cr25,000 per term (deducted from your eventual mustering-out benefits).
                          Aging DM: +{(characterData.lifepath_log.length - (characterData.anagathicsStartTerm || 0) + 2)}.
                          You must make two survival checks per term — failing either one causes a mishap.
                        </p>
                        <p className="text-xs text-yellow-400/80">
                          Accrued anagathics cost so far: Cr{(characterData.anagathicsTotalCost || 0).toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowAnagathicsPrompt(false)}
                            className="flex-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          >
                            Continue Using
                          </Button>
                          <Button
                            onClick={handleStopAnagathics}
                            variant="outline"
                            className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                          >
                            Stop (Immediate Aging Roll)
                          </Button>
                        </div>
                      </div>
                    ) : anagathicsRollResult ? (
                      <div className="space-y-2">
                        <p className={`text-xs ${anagathicsRollResult.success ? 'text-green-400' : anagathicsRollResult.arrested ? 'text-red-400' : 'text-yellow-400'}`}>
                          {anagathicsRollResult.message}
                        </p>
                        <Button
                          onClick={() => { setShowAnagathicsPrompt(false); setAnagathicsRollResult(null); }}
                          size="sm"
                          className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                        >
                          Continue
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-terminal-primary/70">
                          Your Social Standing of {characterData.characteristics.social.total} qualifies you to seek anagathic drugs.
                          Cost: 1D × Cr25,000/term. Grants DM to aging rolls. Requires two survival checks per term.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAnagathicsAttempt}
                            className="flex-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          >
                            Attempt to Obtain
                          </Button>
                          <Button
                            onClick={() => setShowAnagathicsPrompt(false)}
                            variant="outline"
                            className="flex-1 border-terminal-primary/30 text-terminal-primary/60 hover:bg-terminal-primary/10"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical Debt Summary (if any) */}
                {(characterData.medicalDebt || 0) > 0 && !agingPending && (
                  <div className="text-xs text-red-400/80 bg-red-500/5 border border-red-500/20 rounded p-2">
                    Outstanding medical debt: Cr{(characterData.medicalDebt || 0).toLocaleString()}
                  </div>
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
              );
            })()}
          </TabsContent>

          {/* STEP 6: REVIEW - Enhanced Character Summary */}
          <TabsContent value="step6">
            {(() => {
              // Get the primary career theme for styling the summary
              const primaryCareer = characterData.careerHistory?.filter(c => !c.isPreCareer).slice(-1)[0];
              const summaryTheme = primaryCareer ? getCareerTheme(primaryCareer.careerName) : getCareerTheme('');
              const SummaryIcon = summaryTheme.icon;

              return (
                <div className="space-y-4">
                  {/* Hero Header */}
                  <div
                    className="relative rounded-lg border-2 overflow-hidden"
                    style={{
                      borderColor: summaryTheme.borderColor,
                      background: `linear-gradient(135deg, ${summaryTheme.bgColor} 0%, rgba(0,0,0,0.95) 100%)`,
                    }}
                  >
                    {/* Decorative top border glow */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ background: `linear-gradient(90deg, transparent, ${summaryTheme.primaryColor}, transparent)` }}
                    />

                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Character Icon */}
                        <div
                          className="p-4 rounded-lg shrink-0"
                          style={{
                            backgroundColor: summaryTheme.bgColor,
                            boxShadow: `0 0 20px ${summaryTheme.glowColor}`,
                          }}
                        >
                          <SummaryIcon className="h-10 w-10" style={{ color: summaryTheme.textColor }} />
                        </div>

                        {/* Character Info */}
                        <div className="flex-1">
                          <h1
                            className="text-3xl font-bold font-['Orbitron'] tracking-wider mb-1"
                            style={{ color: summaryTheme.textColor, textShadow: `0 0 15px ${summaryTheme.glowColor}` }}
                          >
                            {characterData.name || 'Unnamed Character'}
                          </h1>
                          <p className="text-terminal-primary/60 text-sm font-mono mb-3">
                            {characterData.species || 'Human'} • Age {characterData.age} • {characterData.lifepath_log.length} Terms Served
                          </p>

                          {/* Quick Stats Row */}
                          <div className="flex flex-wrap gap-3">
                            {primaryCareer && (
                              <div
                                className="px-3 py-1 rounded text-sm font-bold"
                                style={{ backgroundColor: summaryTheme.bgColor, color: summaryTheme.textColor }}
                              >
                                {primaryCareer.careerName}
                                {primaryCareer.assignment && ` (${primaryCareer.assignment})`}
                                {primaryCareer.highestRank > 0 && ` • Rank ${primaryCareer.highestRank}`}
                              </div>
                            )}
                            {characterData.homeworld && (
                              <div className="px-3 py-1 rounded text-sm bg-terminal-primary/10 text-terminal-primary/80 border border-terminal-primary/30">
                                Homeworld: {characterData.homeworld}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Characteristics Panel */}
                      <Card className="bg-black border-terminal-primary/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-terminal-primary text-sm font-['Orbitron'] tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-terminal-primary animate-pulse" />
                            Characteristics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-3">
                            {(['strength', 'dexterity', 'endurance', 'intellect', 'education', 'social'] as const).map((key) => {
                              const value = characterData.characteristics[key].total;
                              const barWidth = Math.min((value / 15) * 100, 100);
                              return (
                                <div key={key} className="relative">
                                  <div className="bg-black/50 border border-terminal-primary/30 rounded p-2">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] text-terminal-primary/60 uppercase font-bold tracking-wider">
                                        {key.slice(0, 3)}
                                      </span>
                                      <span className="text-[10px] text-terminal-primary/50">
                                        {getDMDisplay(value)}
                                      </span>
                                    </div>
                                    <div className="text-2xl font-bold text-terminal-primary text-center">
                                      {value}
                                    </div>
                                    {/* Visual bar */}
                                    <div className="h-1 bg-terminal-primary/10 rounded-full mt-1 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                          width: `${barWidth}%`,
                                          backgroundColor: value >= 10 ? '#22c55e' : value >= 7 ? '#3ae2b3' : value >= 5 ? '#eab308' : '#ef4444',
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {characterData.characteristics.psionics && characterData.characteristics.psionics.total > 0 && (
                            <div className="mt-3 bg-purple-500/10 border border-purple-500/30 rounded p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-purple-400 uppercase font-bold">PSI</span>
                                  <span className="text-xl font-bold text-purple-400">{characterData.characteristics.psionics.total}</span>
                                </div>
                                <span className="text-xs text-purple-400/60">DM: {getDMDisplay(characterData.characteristics.psionics.total)}</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Skills Panel */}
                      <Card className="bg-black border-terminal-primary/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-terminal-primary text-sm font-['Orbitron'] tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            Skills ({Object.entries(characterData.skills).filter(([_, s]) => s.proficient && parseInt(s.value, 10) >= 0).length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(characterData.skills)
                              .filter(([_, state]) => state.proficient && parseInt(state.value, 10) >= 0)
                              .sort((a, b) => parseInt(b[1].value, 10) - parseInt(a[1].value, 10))
                              .map(([skill, state]) => {
                                const level = parseInt(state.value, 10);
                                const isHighLevel = level >= 2;
                                return (
                                  <div
                                    key={skill}
                                    className={`px-2 py-1 rounded text-xs border transition-all ${
                                      isHighLevel
                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                        : level >= 1
                                        ? 'bg-terminal-primary/10 border-terminal-primary/30 text-terminal-primary'
                                        : 'bg-terminal-primary/5 border-terminal-primary/20 text-terminal-primary/70'
                                    }`}
                                  >
                                    {skill.replace(/_/g, ' ')} <span className="font-bold">{state.value}</span>
                                  </div>
                                );
                              })}
                            {Object.entries(characterData.skills).filter(([_, s]) => s.proficient && parseInt(s.value, 10) >= 0).length === 0 && (
                              <span className="text-terminal-primary/50 text-sm">No skills acquired</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Race Traits */}
                      {(characterData.raceTraits?.length || 0) > 0 && (
                        <Card className="bg-black border-cyan-500/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-cyan-400 text-sm font-['Orbitron'] tracking-wider uppercase">
                              Racial Traits
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {(characterData.raceTraits || []).map((trait, idx) => (
                              <div key={idx} className="bg-cyan-500/5 border border-cyan-500/20 rounded p-2">
                                <span className="text-cyan-400 font-bold text-sm">{trait.name}</span>
                                <p className="text-terminal-primary/70 text-xs mt-1">{trait.description}</p>
                                {trait.weapon && (
                                  <div className="text-[10px] text-cyan-400/60 mt-1 font-mono">
                                    Natural Weapon: {trait.weapon.name} ({trait.weapon.damage})
                                  </div>
                                )}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Psionic Talents */}
                      {(characterData.psiTalents?.length || 0) > 0 && (
                        <Card className="bg-black border-purple-500/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-purple-400 text-sm font-['Orbitron'] tracking-wider uppercase">
                              Psionic Talents
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {(characterData.psiTalents || []).map((talent, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-1.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm"
                                >
                                  {talent}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Career History */}
                      <Card className="bg-black border-terminal-primary/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-terminal-primary text-sm font-['Orbitron'] tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                            Career History
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {(!characterData.careerHistory || characterData.careerHistory.length === 0) ? (
                            <span className="text-terminal-primary/50 text-sm">No career history</span>
                          ) : (
                            characterData.careerHistory.map((career, idx) => {
                              const careerTheme = getCareerTheme(career.careerName);
                              const CareerIcon = careerTheme.icon;
                              return (
                                <div
                                  key={idx}
                                  className="border rounded p-3 transition-all"
                                  style={{
                                    backgroundColor: careerTheme.bgColor,
                                    borderColor: careerTheme.borderColor,
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <CareerIcon className="h-4 w-4 shrink-0" style={{ color: careerTheme.textColor }} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-sm" style={{ color: careerTheme.textColor }}>
                                          {career.careerName}
                                        </span>
                                        {career.assignment && (
                                          <span className="text-terminal-primary/50 text-xs">({career.assignment})</span>
                                        )}
                                        {career.isPreCareer && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase font-bold">
                                            Pre-Career
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-terminal-primary/60 mt-0.5">
                                        {career.termsServed} term{career.termsServed !== 1 ? 's' : ''}
                                        {career.highestRank > 0 && ` • Rank ${career.highestRank}`}
                                        {career.isCommissioned && ' • Officer'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>

                      {/* Finances */}
                      <Card className="bg-black border-terminal-primary/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-terminal-primary text-sm font-['Orbitron'] tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Finances
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                              <div className="text-[10px] text-green-400/60 uppercase tracking-wider">Cash on Hand</div>
                              <div className="text-xl font-bold text-green-400 font-mono">
                                {characterData.cash_on_hand.toLocaleString()} <span className="text-sm">Cr</span>
                              </div>
                            </div>
                            {characterData.pension > 0 && (
                              <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                                <div className="text-[10px] text-terminal-primary/60 uppercase tracking-wider">Annual Pension</div>
                                <div className="text-xl font-bold text-terminal-primary font-mono">
                                  {characterData.pension.toLocaleString()} <span className="text-sm">Cr</span>
                                </div>
                              </div>
                            )}
                            {characterData.debt > 0 && (
                              <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                                <div className="text-[10px] text-red-400/60 uppercase tracking-wider">Debt</div>
                                <div className="text-xl font-bold text-red-400 font-mono">
                                  {characterData.debt.toLocaleString()} <span className="text-sm">Cr</span>
                                </div>
                              </div>
                            )}
                            {characterData.shipShares > 0 && (
                              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                                <div className="text-[10px] text-yellow-400/60 uppercase tracking-wider">Ship Shares</div>
                                <div className="text-xl font-bold text-yellow-400">{characterData.shipShares}</div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Connections */}
                      {(characterData.allies > 0 || characterData.contacts > 0 || characterData.rivals > 0 || characterData.enemies > 0) && (
                        <Card className="bg-black border-terminal-primary/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-terminal-primary text-sm font-['Orbitron'] tracking-wider uppercase">
                              Connections
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-4 gap-2">
                              <div className={`rounded p-2 text-center ${characterData.allies > 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-black/30 border border-terminal-primary/10'}`}>
                                <div className={`text-[10px] uppercase ${characterData.allies > 0 ? 'text-green-400/60' : 'text-terminal-primary/30'}`}>Allies</div>
                                <div className={`text-xl font-bold ${characterData.allies > 0 ? 'text-green-400' : 'text-terminal-primary/30'}`}>{characterData.allies}</div>
                              </div>
                              <div className={`rounded p-2 text-center ${characterData.contacts > 0 ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-black/30 border border-terminal-primary/10'}`}>
                                <div className={`text-[10px] uppercase ${characterData.contacts > 0 ? 'text-blue-400/60' : 'text-terminal-primary/30'}`}>Contacts</div>
                                <div className={`text-xl font-bold ${characterData.contacts > 0 ? 'text-blue-400' : 'text-terminal-primary/30'}`}>{characterData.contacts}</div>
                              </div>
                              <div className={`rounded p-2 text-center ${characterData.rivals > 0 ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-black/30 border border-terminal-primary/10'}`}>
                                <div className={`text-[10px] uppercase ${characterData.rivals > 0 ? 'text-orange-400/60' : 'text-terminal-primary/30'}`}>Rivals</div>
                                <div className={`text-xl font-bold ${characterData.rivals > 0 ? 'text-orange-400' : 'text-terminal-primary/30'}`}>{characterData.rivals}</div>
                              </div>
                              <div className={`rounded p-2 text-center ${characterData.enemies > 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-black/30 border border-terminal-primary/10'}`}>
                                <div className={`text-[10px] uppercase ${characterData.enemies > 0 ? 'text-red-400/60' : 'text-terminal-primary/30'}`}>Enemies</div>
                                <div className={`text-xl font-bold ${characterData.enemies > 0 ? 'text-red-400' : 'text-terminal-primary/30'}`}>{characterData.enemies}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Ships & Memberships */}
                      {((characterData.ships?.length || 0) > 0 || characterData.tasMembership) && (
                        <Card className="bg-black border-yellow-500/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-yellow-400 text-sm font-['Orbitron'] tracking-wider uppercase">
                              Ships & Memberships
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {(characterData.ships || []).map((ship, idx) => (
                              <div key={idx} className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 flex items-center gap-2">
                                <Rocket className="h-4 w-4 text-yellow-400" />
                                <span className="text-yellow-400 font-bold text-sm">{ship}</span>
                              </div>
                            ))}
                            {characterData.tasMembership && (
                              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 flex items-center gap-2">
                                <Award className="h-4 w-4 text-blue-400" />
                                <div>
                                  <span className="text-blue-400 font-bold text-sm">TAS Membership</span>
                                  <span className="text-blue-400/60 text-xs ml-2">Travellers' Aid Society</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>

                  {/* Equipment Section - Full Width */}
                  {((characterData.weapons?.length || 0) > 0 || (characterData.armor?.length || 0) > 0 || (characterData.equipment?.length || 0) > 0 || (characterData.augments?.length || 0) > 0) && (
                    <Card className="bg-black border-terminal-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-terminal-primary text-sm font-['Orbitron'] tracking-wider uppercase flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                          Equipment & Possessions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {(characterData.weapons?.length || 0) > 0 && (
                            <div className="bg-red-500/5 border border-red-500/30 rounded p-3">
                              <div className="text-red-400 text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                                <Sword className="h-3 w-3" /> Weapons
                              </div>
                              <div className="space-y-1">
                                {(characterData.weapons || []).map((weapon, idx) => (
                                  <div key={idx} className="text-red-400 text-sm">
                                    {typeof weapon === 'string' ? weapon : weapon.name || 'Unknown'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {(characterData.armor?.length || 0) > 0 && (
                            <div className="bg-blue-500/5 border border-blue-500/30 rounded p-3">
                              <div className="text-blue-400 text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                                <Shield className="h-3 w-3" /> Armor
                              </div>
                              <div className="space-y-1">
                                {(characterData.armor || []).map((armor, idx) => (
                                  <div key={idx} className="text-blue-400 text-sm">
                                    {typeof armor === 'string' ? armor : armor.name || 'Unknown'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {(characterData.equipment?.length || 0) > 0 && (
                            <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                              <div className="text-terminal-primary text-[10px] uppercase font-bold tracking-wider mb-2">
                                Equipment
                              </div>
                              <div className="space-y-1">
                                {(characterData.equipment || []).map((item, idx) => (
                                  <div key={idx} className="text-terminal-primary/80 text-sm">
                                    {typeof item === 'string' ? item : item.name || 'Unknown'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {(characterData.augments?.length || 0) > 0 && (
                            <div className="bg-purple-500/5 border border-purple-500/30 rounded p-3">
                              <div className="text-purple-400 text-[10px] uppercase font-bold tracking-wider mb-2">
                                Augments
                              </div>
                              <div className="space-y-1">
                                {(characterData.augments || []).map((aug, idx) => (
                                  <div key={idx} className="text-purple-400 text-sm">
                                    {typeof aug === 'string' ? aug : aug.name || 'Unknown'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lifepath Log - Collapsible */}
                  {(characterData.lifepath_log?.length || 0) > 0 && (
                    <Card className="bg-black border-terminal-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-terminal-primary text-sm font-['Orbitron'] tracking-wider uppercase flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-terminal-primary animate-pulse" />
                            Lifepath Log ({characterData.lifepath_log?.length || 0} Terms)
                          </div>
                          <button
                            onClick={() => setShowLifepathLog(!showLifepathLog)}
                            className="text-terminal-primary/60 hover:text-terminal-primary transition-colors"
                          >
                            {showLifepathLog ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </CardTitle>
                      </CardHeader>
                      {showLifepathLog && (
                        <CardContent className="pt-0">
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {(characterData.lifepath_log || []).map((term, idx) => {
                              const termTheme = getCareerTheme(term.career);
                              return (
                                <div
                                  key={idx}
                                  className="border rounded p-3 text-sm"
                                  style={{
                                    backgroundColor: termTheme.bgColor,
                                    borderColor: termTheme.borderColor,
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold" style={{ color: termTheme.textColor }}>
                                      Term {term.termNumber}: {term.career}
                                      {term.assignment && ` (${term.assignment})`}
                                    </span>
                                    <span className="text-terminal-primary/50 text-xs font-mono">Age {term.age}</span>
                                  </div>
                                  <div className="text-xs space-y-1">
                                    {term.rankTitle && term.rank > 0 && (
                                      <div className="text-terminal-primary/70">
                                        Rank: {term.rankTitle} ({term.rank}){term.isCommissioned ? ' - Officer' : ''}
                                      </div>
                                    )}
                                    <div className={`flex items-center gap-1 ${term.survived ? 'text-green-400' : 'text-red-400'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${term.survived ? 'bg-green-400' : 'bg-red-400'}`} />
                                      Survival: {term.survivalRoll} - {term.survived ? 'Survived' : 'Mishap!'}
                                    </div>
                                    {term.advancementRoll && (
                                      <div className={`flex items-center gap-1 ${term.advanced ? 'text-cyan-400' : 'text-terminal-primary/50'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${term.advanced ? 'bg-cyan-400' : 'bg-terminal-primary/30'}`} />
                                        Advancement: {term.advancementRoll} - {term.advanced ? 'Advanced!' : 'No advancement'}
                                      </div>
                                    )}
                                    {term.event && (
                                      <div className="text-yellow-400/80 mt-1 pl-2 border-l border-yellow-400/30">
                                        {term.event.length > 120 ? term.event.substring(0, 120) + '...' : term.event}
                                      </div>
                                    )}
                                    {term.mishap && (
                                      <div className="text-red-400/80 mt-1 pl-2 border-l border-red-400/30">
                                        Mishap: {term.mishap}
                                      </div>
                                    )}
                                    {term.skillsGained && term.skillsGained.length > 0 && (
                                      <div className="text-green-400/80 flex items-start gap-1">
                                        <span className="shrink-0">+</span>
                                        <span>{term.skillsGained.join(', ')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Crew Assignment */}
                  {crewGroups.length > 0 && (
                    <Card className="border-terminal-primary/30 bg-black/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-terminal-primary text-sm flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          CREW ASSIGNMENT
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-terminal-primary/60 text-xs">
                          Assign this character to a crew group (optional — can be changed later).
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {/* Crew selector */}
                          <Select value={selectedCrewId || 'none'} onValueChange={v => { setSelectedCrewId(v === 'none' ? '' : v); if (v === 'none') setSelectedPosition(''); }}>
                            <SelectTrigger className="h-8 text-xs font-mono w-48 border-terminal-primary/30">
                              <SelectValue placeholder="No crew" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Skip — assign later</SelectItem>
                              {crewGroups.map(g => {
                                const ship = vehicles.find(v => v.id === g.ship_id);
                                return (
                                  <SelectItem key={g.id} value={g.id}>
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: g.color }} />
                                      {g.name}
                                      {ship && <span className="opacity-50 text-[0.6rem]">({ship.name})</span>}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>

                          {/* Position selector (only if crew chosen) */}
                          {selectedCrewId && (
                            <Select value={selectedPosition || 'none'} onValueChange={v => setSelectedPosition(v === 'none' ? '' : v)}>
                              <SelectTrigger className="h-8 text-xs font-mono w-40 border-terminal-primary/30">
                                <SelectValue placeholder="Position" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-- Position --</SelectItem>
                                {CREW_POSITION_PRESETS.map(pos => (
                                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        {/* Show selected crew color badge */}
                        {selectedCrewId && (() => {
                          const crew = crewGroups.find(g => g.id === selectedCrewId);
                          if (!crew) return null;
                          return (
                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: crew.color, boxShadow: `0 0 6px ${crew.color}` }} />
                              <span style={{ color: crew.color }}>{crew.name}</span>
                              {selectedPosition && (
                                <span className="text-terminal-primary/50">— {selectedPosition}</span>
                              )}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
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
                      className="flex-1 transition-all duration-200"
                      style={{
                        backgroundColor: summaryTheme.bgColor,
                        color: summaryTheme.textColor,
                        borderColor: summaryTheme.borderColor,
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        boxShadow: `0 0 20px ${summaryTheme.glowColor}`,
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Create Character
                    </Button>
                  </div>
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
