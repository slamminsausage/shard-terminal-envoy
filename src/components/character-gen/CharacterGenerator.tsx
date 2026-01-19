import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dices, User, Briefcase, Award, Save, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCampaign } from '@/contexts/CampaignContext';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CharacteristicValue {
  total: number;
  current: number;
}

interface Characteristics {
  strength: CharacteristicValue;
  dexterity: CharacteristicValue;
  endurance: CharacteristicValue;
  intellect: CharacteristicValue;
  education: CharacteristicValue;
  social: CharacteristicValue;
  psionics: CharacteristicValue;
}

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
}

interface Assignment {
  name: string;
  description: string;
  survivalStat: keyof Omit<Characteristics, 'psionics'>;
  survivalTarget: number;
  advancementStat: keyof Omit<Characteristics, 'psionics'>;
  advancementTarget: number;
}

interface CareerDefinition {
  name: string;
  description: string;
  qualification: string;
  qualificationTarget: number;
  qualificationStat: keyof Omit<Characteristics, 'psionics'>;
  assignments: Assignment[];
  skillTables: {
    personalDevelopment: string[];
    serviceSkills: string[];
    advancedEducation?: string[];
    specialist: { [assignmentName: string]: string[] };
  };
  ranks: {
    title: string;
    skillBonus?: string;
    bonusStat?: keyof Omit<Characteristics, 'psionics'>;
  }[];
  mishapTable: string[];
  eventTable: string[];
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
}

// ============================================================================
// CONSTANTS AND CAREER DATA
// ============================================================================

const CAREER_AGENT: CareerDefinition = {
  name: 'Agent',
  description: 'Law enforcement agencies, corporate operatives, spies and others who work in the shadows.',
  qualification: 'INT 6+',
  qualificationTarget: 6,
  qualificationStat: 'intellect',
  assignments: [
    {
      name: 'Law Enforcement',
      description: 'You are a police officer or detective.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 6,
    },
    {
      name: 'Intelligence',
      description: 'You work as a spy or saboteur.',
      survivalStat: 'intellect',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 5,
    },
    {
      name: 'Corporate',
      description: 'You work for a corporation, spying on rival organisations.',
      survivalStat: 'intellect',
      survivalTarget: 5,
      advancementStat: 'intellect',
      advancementTarget: 7,
    },
  ],
  skillTables: {
    personalDevelopment: ['Gun Combat', 'Dexterity +1', 'Endurance +1', 'Melee', 'Intellect +1', 'Athletics'],
    serviceSkills: ['Streetwise', 'Drive', 'Investigate', 'Flyer', 'Recon', 'Gun Combat'],
    advancedEducation: ['Advocate', 'Language', 'Explosives', 'Medic', 'Vacc Suit', 'Electronics'],
    specialist: {
      'Law Enforcement': ['Investigate', 'Recon', 'Streetwise', 'Stealth', 'Melee', 'Advocate'],
      'Intelligence': ['Investigate', 'Recon', 'Deception', 'Stealth', 'Persuade', 'Carouse'],
      'Corporate': ['Investigate', 'Electronics', 'Stealth', 'Carouse', 'Deception', 'Streetwise'],
    },
  },
  ranks: [
    { title: 'Rookie' },
    { title: 'Corporal', skillBonus: 'Streetwise' },
    { title: 'Sergeant' },
    { title: 'Detective' },
    { title: 'Lieutenant', skillBonus: 'Investigate' },
    { title: 'Chief', skillBonus: 'Admin' },
    { title: 'Commissioner', bonusStat: 'social' },
  ],
  mishapTable: [
    'Severely injured. Roll twice on the Injury table and take the lower result.',
    'A criminal or other figure under investigation offers you a deal. Accept and you leave this career with a +4 DM to your next Qualification roll but gain a Rival. Refuse and you must roll twice on the Injury table and take the lower result.',
    'An investigation goes critically wrong or leads to the bottom of a conspiracy. Roll Advocate 8+. If you succeed, you may continue in this career. If you fail, you must leave this career.',
    'You learn something you should not know. Gain an Enemy and then roll twice on the Injury table (take both results).',
    'Your work ends up coming home with you and someone gets hurt. Gain an Enemy.',
    'Injured. Roll on the Injury table.',
  ],
  eventTable: [
    'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    'You are given advanced training in a specialist field. Roll Education 8+ to gain any one skill of your choice at level 1.',
    'You go undercover to investigate an enemy. Roll Deception 8+. If you succeed, roll immediately on any Specialist skill table for this career and gain one level in any skill you roll. If you fail, roll immediately on the Mishap table.',
    'You complete a mission for your superiors and are suitably rewarded. Gain DM+1 to any one Benefit roll from this career.',
    'You establish a network of contacts. Gain D3 Contacts.',
    'You are given specialist training in vehicles. Gain one of Drive 1, Flyer 1, Pilot 1 or Gunner 1.',
    'You are betrayed by a peer or colleague. Gain a Rival.',
    'You complete a mission that goes extremely well. You gain an extra Benefit roll from this career.',
    'You spend much of your time dealing with stakeholders and superiors. Gain one of Advocate 1, Admin 1, Persuade 1 or Diplomat 1.',
    'You go above and beyond the call of duty. Gain an Ally and DM+2 to your next Advancement check.',
  ],
};

const BACKGROUND_SKILLS = [
  'Admin', 'Animals', 'Art', 'Athletics', 'Carouse', 'Drive', 'Electronics',
  'Flyer', 'Language', 'Mechanic', 'Medic', 'Profession', 'Science', 'Seafarer',
  'Streetwise', 'Survival', 'Vacc Suit'
];

// Available careers (for now just Agent, will add more later)
const CAREERS: CareerDefinition[] = [CAREER_AGENT];

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
  });

  const [characteristicRolls, setCharacteristicRolls] = useState<number[]>([]);
  const [hasRolled, setHasRolled] = useState(false);
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

    const charValue = characterData.characteristics[selectedCareer.qualificationStat].total;
    const dm = getDM(charValue);
    const roll = rollDice(2, 6);
    const total = roll + dm;
    const passed = total >= selectedCareer.qualificationTarget;

    setQualificationPassed(passed);
    setQualificationRollLog(`Roll: ${roll} + DM ${dm} = ${total} (need ${selectedCareer.qualificationTarget}+)`);

    if (passed) {
      setCharacterData(prev => ({
        ...prev,
        career: selectedCareer.name,
        notes: prev.notes + `\nQualified for ${selectedCareer.name}: ${roll} + ${dm} = ${total}`,
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
    const dm = getDM(charValue);
    const roll = rollDice(2, 6);
    const total = roll + dm;
    const survived = total >= assignment.survivalTarget;

    setTermSurvived(survived);

    if (!survived) {
      // Mishap - roll on mishap table
      const mishapRoll = rollDice(1, 6);
      const mishap = selectedCareer.mishapTable[mishapRoll - 1] || 'Injured. Roll on the Injury table.';

      const termRecord: TermRecord = {
        termNumber: currentTerm,
        career: selectedCareer.name,
        assignment: assignment.name,
        age: characterData.age,
        survivalRoll: `${roll} + ${dm} = ${total} (need ${assignment.survivalTarget}+)`,
        survived: false,
        advanced: false,
        rank: characterData.rank,
        rankTitle: selectedCareer.ranks[characterData.rank]?.title || 'Rank 0',
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

  const runAdvancementCheck = () => {
    if (!selectedCareer || !termSurvived || termAdvanced !== null) return;

    const assignment = selectedCareer.assignments[selectedAssignment];
    const charValue = characterData.characteristics[assignment.advancementStat].total;
    const dm = getDM(charValue);
    const roll = rollDice(2, 6);
    const total = roll + dm;
    const advanced = total >= assignment.advancementTarget;

    setTermAdvanced(advanced);

    if (advanced && characterData.rank < selectedCareer.ranks.length - 1) {
      const newRank = characterData.rank + 1;
      const rankData = selectedCareer.ranks[newRank];

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

    const termRecord: TermRecord = {
      termNumber: currentTerm,
      career: selectedCareer.name,
      assignment: assignment.name,
      age: characterData.age,
      survivalRoll: 'Passed',
      survived: true,
      advancementRoll: termAdvanced ? 'Advanced' : 'Did not advance',
      advanced: termAdvanced || false,
      rank: characterData.rank,
      rankTitle: selectedCareer.ranks[characterData.rank]?.title || `Rank ${characterData.rank}`,
      event,
      skillsGained: termSkillsGained,
    };

    setCharacterData(prev => ({
      ...prev,
      lifepath_log: [...prev.lifepath_log, termRecord],
      terms_served: currentTerm,
    }));

    // Apply basic training on first term
    if (currentTerm === 1) {
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
        rank: selectedCareer?.ranks[characterData.rank]?.title || '',
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
                  <CardTitle className="text-terminal-primary">Roll Characteristics</CardTitle>
                  <div className="flex gap-2">
                    {hasRolled && (
                      <Button
                        onClick={rerollCharacteristics}
                        className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reroll All
                      </Button>
                    )}
                    {!hasRolled && (
                      <Button
                        onClick={rollAllCharacteristics}
                        className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        <Dices className="h-4 w-4 mr-2" />
                        Roll 2D6 (x6)
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasRolled ? (
                  <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-terminal-primary/80">
                      Click "Roll 2D6" to generate your six characteristic scores. In Traveller 2E, you roll 2D6 six times and assign them in order to STR, DEX, END, INT, EDU, and SOC.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                      <h3 className="text-sm font-bold text-terminal-primary uppercase mb-3">Your Rolls</h3>
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
                    disabled={backgroundSkillsRemaining === 0 && !hasRolled}
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
                {CAREERS.map(career => (
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
                              Survival: {assignment.survivalStat.toUpperCase()} {assignment.survivalTarget}+ |
                              Advancement: {assignment.advancementStat.toUpperCase()} {assignment.advancementTarget}+
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
                        Roll for survival. If you fail, you suffer a mishap and must leave the career.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={runSurvivalCheck}
                      className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                    >
                      <Dices className="h-4 w-4 mr-2" />
                      Roll Survival Check
                    </Button>
                  </div>
                )}

                {isInTerm && termSurvived === false && (
                  <div className="space-y-2">
                    <Alert className="bg-red-500/10 border-red-500/50">
                      <AlertDescription className="text-red-400">
                        ✗ Survival check failed! You must muster out of this career.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={musterOut}
                      className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                    >
                      Muster Out
                    </Button>
                  </div>
                )}

                {isInTerm && termSurvived === true && termAdvanced === null && (
                  <div className="space-y-2">
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
