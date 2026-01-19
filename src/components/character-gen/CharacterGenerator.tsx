import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dices, User, Briefcase, Award, Save, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCampaign } from '@/contexts/CampaignContext';
import { ALL_CAREERS, BACKGROUND_SKILLS } from './careersData';
import type { CareerDefinition, Characteristics } from './careersData';

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
  });

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

  // Get available careers based on current term number
  const getAvailableCareers = (): CareerDefinition[] => {
    const totalTerms = characterData.totalCareerTerms || 0;

    return ALL_CAREERS.filter(career => {
      // Pre-careers are only available for first 3 terms
      if (career.isPreCareer) {
        // Can't take pre-career if already completed one
        if (characterData.hasCompletedPreCareer) return false;
        // Only available for terms 1-3
        return totalTerms < 3;
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

    const charValue = characterData.characteristics[selectedCareer.qualificationStat].total;
    let dm = getDM(charValue);

    // Apply pre-career DM based on term number
    const preCareerDM = getPreCareerDM(selectedCareer);
    dm += preCareerDM;

    // Apply SOC bonus for University
    if (selectedCareer.preCareerType === 'university' && characterData.characteristics.social.total >= 9) {
      dm += 1;
    }

    const roll = rollDice(2, 6);
    const total = roll + dm;
    const passed = total >= selectedCareer.qualificationTarget;

    setQualificationPassed(passed);
    const dmBreakdown = preCareerDM !== 0
      ? `Roll: ${roll} + Char DM ${getDM(charValue)} + Term DM ${preCareerDM} = ${total} (need ${selectedCareer.qualificationTarget}+)`
      : `Roll: ${roll} + DM ${dm} = ${total} (need ${selectedCareer.qualificationTarget}+)`;
    setQualificationRollLog(dmBreakdown);

    if (passed) {
      setCharacterData(prev => ({
        ...prev,
        career: selectedCareer.name,
        notes: prev.notes + `\nQualified for ${selectedCareer.name}: ${roll} + ${dm} = ${total}`,
        totalCareerTerms: (prev.totalCareerTerms || 0) + (selectedCareer.isPreCareer ? 0 : 0), // Pre-careers don't increment yet
      }));
    }
  };

  const resetQualification = () => {
    setQualificationPassed(null);
    setQualificationRollLog('');
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

    const newAge = 18 + newTermNumber * 4;
    setCharacterData(prev => ({
      ...prev,
      age: newAge,
    }));
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

    if (!survived) {
      // For pre-careers, handle graduation failure differently
      if (isPreCareer) {
        const ranks = selectedCareer.ranks.enlisted;
        let mishap = selectedCareer.mishapTable[0] || 'Failed to graduate.';
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
        const mishap = selectedCareer.mishapTable[mishapRoll - 1] || 'Injured. Roll on the Injury table.';

        const ranks = isCommissioned && selectedCareer.ranks.officer
          ? selectedCareer.ranks.officer
          : selectedCareer.ranks.enlisted;

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

        if (selectedCareer.preCareerType === 'university') {
          // University graduation: EDU +1
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
          benefitNotes.push('EDU +1 (University Graduation)');

          // Check for honours (roll >= 10)
          if (total >= 10) {
            benefitNotes.push('Graduated with Honours!');
            // Honours gives additional benefits for qualification rolls
          }
        } else if (selectedCareer.preCareerType === 'military_academy') {
          // Military Academy graduation: EDU +1
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
          benefitNotes.push('EDU +1 (Military Academy Graduation)');

          // Check for honours (roll >= 11)
          if (total >= 11) {
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
          }
        }

        setTermSkillsGained(benefitNotes);

        // For pre-careers, set termAdvanced to true so the flow continues correctly
        // (graduation IS advancement for pre-careers)
        setTermAdvanced(true);
      }
    }
  };

  const runAdvancementCheck = () => {
    if (!selectedCareer || !termSurvived || termAdvanced !== null) return;

    const assignment = selectedCareer.assignments[selectedAssignment];
    const charValue = characterData.characteristics[assignment.advancementStat].total;
    const dm = getDM(charValue);
    const roll = rollDice(2, 6);
    const total = roll + dm;
    const advanced = total >= assignment.advancementTarget;

    setTermAdvanced(advanced);

    const ranks = isCommissioned && selectedCareer.ranks.officer
      ? selectedCareer.ranks.officer
      : selectedCareer.ranks.enlisted;

    if (advanced && characterData.rank < ranks.length - 1) {
      const newRank = characterData.rank + 1;
      const rankData = ranks[newRank];

      setCharacterData(prev => ({
        ...prev,
        rank: newRank,
      }));

      // Apply rank bonus if any
      if (rankData.skillBonus) {
        const skillKey = normalizeSkillName(rankData.skillBonus);
        applySkillGain(rankData.skillBonus);
        setTermSkillsGained(prev => [...prev, `${rankData.skillBonus} (rank bonus)`]);
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
  };

  const applySkillGain = (skillName: string) => {
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
      // Add or increase skill
      const skillKey = normalizeSkillName(parsed.skill);
      setCharacterData(prev => {
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

  const gainSkillFromTable = (tableName: string) => {
    if (!selectedCareer) return;

    let table: string[] = [];

    if (tableName === 'personal') {
      table = selectedCareer.skillTables.personalDevelopment;
    } else if (tableName === 'service') {
      table = selectedCareer.skillTables.serviceSkills;
    } else if (tableName === 'advanced' && selectedCareer.skillTables.advancedEducation) {
      table = selectedCareer.skillTables.advancedEducation;
    } else if (tableName === 'specialist') {
      const assignmentName = selectedCareer.assignments[selectedAssignment].name;
      table = selectedCareer.skillTables.specialist[assignmentName] || [];
    }

    if (table.length === 0) return;

    const roll = rollDice(1, 6);
    const skillName = table[roll - 1];

    applySkillGain(skillName);
    setTermSkillsGained(prev => [...prev, `${skillName} (${tableName})`]);
  };

  const completeTerm = () => {
    if (!selectedCareer || !termSurvived) return;

    const assignment = selectedCareer.assignments[selectedAssignment];
    const event = termEventRoll !== null
      ? selectedCareer.eventTable[Math.min(termEventRoll - 2, selectedCareer.eventTable.length - 1)]
      : 'No event this term';

    const ranks = isCommissioned && selectedCareer.ranks.officer
      ? selectedCareer.ranks.officer
      : selectedCareer.ranks.enlisted;

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
      totalCareerTerms: (prev.totalCareerTerms || 0) + 1,
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

    setIsInTerm(false);
  };

  const musterOut = () => {
    if (!selectedCareer) return;

    // Calculate mustering out benefits
    const benefitRolls = Math.min(characterData.terms_served, 7);
    let totalCash = 0;

    // Simplified cash table
    const cashValues = [1000, 5000, 10000, 10000, 50000, 100000];

    for (let i = 0; i < benefitRolls; i++) {
      const roll = rollDice(1, 6);
      totalCash += cashValues[Math.min(roll - 1, 5)];
    }

    // Add pension if 5+ terms
    const pension = characterData.terms_served >= 5
      ? (characterData.terms_served - 4) * 2000
      : 0;

    setCharacterData(prev => ({
      ...prev,
      cash_on_hand: totalCash,
      credits: totalCash,
      pension,
    }));

    setStep(6); // Go to review
  };

  const continueCareer = () => {
    startNewTerm();
  };

  // ============================================================================
  // STEP 6: SAVE CHARACTER
  // ============================================================================

  const handleSaveCharacter = async () => {
    try {
      const ranks = selectedCareer && isCommissioned && selectedCareer.ranks.officer
        ? selectedCareer.ranks.officer
        : selectedCareer?.ranks.enlisted;

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
        rank: ranks?.[characterData.rank]?.title || '',
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
                      setSelectedCareer(career);
                      resetQualification();
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
                      <Alert className="bg-green-500/10 border-green-500/50">
                        <AlertDescription className="text-green-400">
                          ✓ Qualification successful! You may enter this career.
                        </AlertDescription>
                      </Alert>
                    )}

                    {qualificationPassed === false && (
                      <Alert className="bg-red-500/10 border-red-500/50">
                        <AlertDescription className="text-red-400">
                          ✗ Qualification failed. You must enter the Draft or become a Drifter.
                          <br />
                          <span className="text-xs">(For now, you can reroll by clicking the career again)</span>
                        </AlertDescription>
                      </Alert>
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
                    onClick={() => setStep(5)}
                    disabled={!qualificationPassed}
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
                <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-terminal-primary/80">
                    <div>
                      <span className="text-terminal-primary/60">Career:</span> {characterData.career}
                    </div>
                    <div>
                      <span className="text-terminal-primary/60">Assignment:</span> {selectedCareer?.assignments[selectedAssignment].name}
                    </div>
                    <div>
                      <span className="text-terminal-primary/60">Rank:</span> {selectedCareer?.ranks[characterData.rank]?.title || 'Rank 0'}
                    </div>
                    <div>
                      <span className="text-terminal-primary/60">Age:</span> {characterData.age}
                    </div>
                    <div>
                      <span className="text-terminal-primary/60">Terms Served:</span> {characterData.terms_served}
                    </div>
                  </div>
                </div>

                {!isInTerm && termSurvived !== false && (
                  <Button
                    onClick={startNewTerm}
                    className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    Start Term {currentTerm + 1}
                  </Button>
                )}

                {isInTerm && termSurvived === null && (
                  <div className="space-y-2">
                    <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-terminal-primary/80">
                        {selectedCareer?.isPreCareer
                          ? 'Roll for graduation. If you fail, you do not receive graduation benefits but may continue to another career.'
                          : 'Roll for survival. If you fail, you suffer a mishap and must leave the career.'}
                      </AlertDescription>
                    </Alert>
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
                          ? '✗ Failed to graduate. You may continue to another career or muster out.'
                          : '✗ Survival check failed! You suffer a mishap and must leave this career.'}
                      </AlertDescription>
                    </Alert>
                    {preCareerFailedService && (
                      <Alert className="bg-blue-500/10 border-blue-500/50">
                        <AlertDescription className="text-blue-400">
                          ℹ You have automatic entry to {preCareerFailedService}!
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setIsInTerm(false);
                          setTermSurvived(null);
                          setSelectedCareer(null);
                          setQualificationPassed(null);
                          setPreCareerGraduated(false);
                        }}
                        className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        Choose New Career
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
                        <Alert className="bg-green-500/10 border-green-500/50">
                          <AlertDescription className="text-green-400">
                            ✓ Graduated successfully! {termSkillsGained.length > 0 && termSkillsGained.join(', ')}
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={rollEvent}
                          className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                        >
                          <Dices className="h-4 w-4 mr-2" />
                          Continue (Select Skills)
                        </Button>
                      </>
                    ) : (
                      <>
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
                    {termAdvanced ? (
                      <Alert className="bg-green-500/10 border-green-500/50">
                        <AlertDescription className="text-green-400">
                          ✓ Advanced to {selectedCareer?.ranks[characterData.rank]?.title || `Rank ${characterData.rank}`}!
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-yellow-500/10 border-yellow-500/50">
                        <AlertDescription className="text-yellow-400">
                          Did not advance this term.
                        </AlertDescription>
                      </Alert>
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
                    <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
                      <AlertDescription className="text-terminal-primary/80">
                        <strong>Event (rolled {termEventRoll}):</strong><br />
                        {selectedCareer?.eventTable[Math.min(termEventRoll - 2, selectedCareer.eventTable.length - 1)] || 'No special event'}
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-terminal-primary uppercase">Gain Skills This Term</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => gainSkillFromTable('personal')}
                          variant="outline"
                          className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                        >
                          Personal Development
                        </Button>
                        <Button
                          onClick={() => gainSkillFromTable('service')}
                          variant="outline"
                          className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                        >
                          Service Skills
                        </Button>
                        {selectedCareer?.skillTables.advancedEducation && characterData.characteristics.education.total >= 8 && (
                          <Button
                            onClick={() => gainSkillFromTable('advanced')}
                            variant="outline"
                            className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                          >
                            Advanced Education
                          </Button>
                        )}
                        <Button
                          onClick={() => gainSkillFromTable('specialist')}
                          variant="outline"
                          className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                        >
                          Specialist ({selectedCareer?.assignments[selectedAssignment].name})
                        </Button>
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

                    <Button
                      onClick={completeTerm}
                      className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
                    >
                      Complete Term {currentTerm}
                    </Button>
                  </div>
                )}

                {!isInTerm && currentTerm > 0 && termSurvived !== false && (
                  <div className="flex gap-2">
                    <Button
                      onClick={continueCareer}
                      variant="outline"
                      className="flex-1 border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                    >
                      Continue Career (Another Term)
                    </Button>
                    <Button
                      onClick={musterOut}
                      className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                    >
                      Muster Out & Finish
                    </Button>
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
                    {characterData.career} • {selectedCareer?.ranks[characterData.rank]?.title || 'Rank 0'} • Age {characterData.age} • {characterData.terms_served} Terms
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
