import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { roll2d6, roll1d6, getCharacteristicDM } from '@/lib/dice';
import { ALL_CAREERS, type CareerDefinition } from '@/components/character-gen/careers';
import { normalizeSkillName } from '@/components/character-gen/careers/skills';
import { useCampaign } from '@/contexts/CampaignContext';
import { Dices, Save, RefreshCw, User } from 'lucide-react';

// Name generation data
const FIRST_NAMES_MALE = [
  'Arkady', 'Bren', 'Cassius', 'Drav', 'Elias', 'Fenn', 'Gideon', 'Holt',
  'Jace', 'Kael', 'Loric', 'Maddox', 'Niko', 'Orin', 'Pavel', 'Quinn',
  'Rafe', 'Soren', 'Thane', 'Viktor', 'Wren', 'Xander', 'Yuri', 'Zane',
  'Aldric', 'Bannon', 'Cormac', 'Declan', 'Ezra', 'Garrick',
];
const FIRST_NAMES_FEMALE = [
  'Aria', 'Brynn', 'Calla', 'Dara', 'Elara', 'Freya', 'Gwen', 'Hana',
  'Ivy', 'Juno', 'Kira', 'Luna', 'Mara', 'Nova', 'Orla', 'Petra',
  'Raine', 'Sable', 'Talia', 'Uma', 'Vex', 'Wynn', 'Xena', 'Yael',
  'Zara', 'Astrid', 'Brigid', 'Cleo', 'Dahlia', 'Ember',
];
const SURNAMES = [
  'Voss', 'Thorne', 'Kade', 'Draven', 'Ashford', 'Mercer', 'Holt', 'Cross',
  'Rennick', 'Duval', 'Korbin', 'Stenn', 'Blackwell', 'Graves', 'Marsh',
  'Vane', 'Rook', 'Slade', 'Carver', 'Locke', 'Moreau', 'Vega', 'Thorn',
  'Crane', 'Blaine', 'Morrow', 'Calloway', 'Tyrell', 'Frost', 'Burke',
];

type NpcRole = 'crew' | 'enemy' | 'contact' | 'patron';

interface GeneratedNPC {
  name: string;
  gender: string;
  age: number;
  career: string;
  rank: string;
  terms: number;
  strength: number;
  dexterity: number;
  endurance: number;
  intellect: number;
  education: number;
  social_standing: number;
  skills: Record<string, any>;
  npc_role: NpcRole;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomName(gender: string): string {
  const first = gender === 'Female'
    ? pickRandom(FIRST_NAMES_FEMALE)
    : pickRandom(FIRST_NAMES_MALE);
  return `${first} ${pickRandom(SURNAMES)}`;
}

function getRankTitle(career: CareerDefinition, rankNum: number): string {
  if (career.ranks.enlisted && career.ranks.enlisted[rankNum]) {
    return career.ranks.enlisted[rankNum].title || `Rank ${rankNum}`;
  }
  return rankNum > 0 ? `Rank ${rankNum}` : '';
}

// Get selectable careers (exclude pre-careers and prisoner)
function getSelectableCareers(): CareerDefinition[] {
  return ALL_CAREERS.filter(c =>
    !c.isPreCareer && !c.isPrisonerCareer && !c.requiresPsiTesting
  );
}

function generateNPC(
  careerName: string | 'random',
  terms: number,
  role: NpcRole,
  customName?: string,
): GeneratedNPC {
  const selectableCareers = getSelectableCareers();
  const career = careerName === 'random'
    ? pickRandom(selectableCareers)
    : selectableCareers.find(c => c.name === careerName) || pickRandom(selectableCareers);

  // Roll characteristics (2d6 each)
  const strength = roll2d6();
  const dexterity = roll2d6();
  const endurance = roll2d6();
  const intellect = roll2d6();
  const education = roll2d6();
  const social_standing = roll2d6();

  // Gender and name
  const gender = Math.random() < 0.5 ? 'Male' : 'Female';
  const name = customName?.trim() || generateRandomName(gender);

  // Age: 18 + 4 years per term
  const age = 18 + (terms * 4);

  // Determine rank (roughly based on terms)
  const maxRank = Math.min(terms, 5);
  const rankNum = Math.min(Math.max(0, maxRank - 1), 5);
  const rankTitle = getRankTitle(career, rankNum);

  // Generate skills from career skill tables
  const skills: Record<string, any> = {};

  const allSkillSources: string[] = [
    ...career.skillTables.serviceSkills,
    ...career.skillTables.personalDevelopment,
  ];

  // Add specialist skills from a random assignment
  const assignmentNames = Object.keys(career.skillTables.specialist);
  if (assignmentNames.length > 0) {
    const assignment = pickRandom(assignmentNames);
    allSkillSources.push(...(career.skillTables.specialist[assignment] || []));
  }

  // Add advanced education skills if EDU is high enough
  if (education >= 8 && career.skillTables.advancedEducation) {
    allSkillSources.push(...career.skillTables.advancedEducation);
  }

  // Filter out characteristic boosts (like "+1 STR", "+1 END") from skill sources
  const actualSkills = allSkillSources.filter(s =>
    !s.startsWith('+1') && !s.startsWith('+2') && !s.startsWith('-1') &&
    s !== 'STR' && s !== 'DEX' && s !== 'END' && s !== 'INT' && s !== 'EDU' && s !== 'SOC'
  );

  // Number of skills: roughly 2 per term + 1 background
  const numSkills = Math.min(terms * 2 + 1, actualSkills.length);

  // Pick skills and assign levels
  const chosenSkills = new Set<string>();
  for (let i = 0; i < numSkills && actualSkills.length > 0; i++) {
    const skill = pickRandom(actualSkills);
    chosenSkills.add(skill);
  }

  chosenSkills.forEach(skillName => {
    const key = normalizeSkillName(skillName);
    // Random level: mostly 1, sometimes 2 for experienced NPCs
    const level = terms >= 3 && Math.random() < 0.3 ? 2 : 1;
    if (skills[key]) {
      // If already set, possibly increase
      const currentLevel = parseInt(skills[key].value, 10) || 0;
      skills[key] = { proficient: true, value: String(Math.max(currentLevel + 1, level)) };
    } else {
      skills[key] = { proficient: true, value: String(level) };
    }
  });

  return {
    name,
    gender,
    age,
    career: career.name,
    rank: rankTitle,
    terms,
    strength,
    dexterity,
    endurance,
    intellect,
    education,
    social_standing,
    skills,
    npc_role: role,
  };
}

const ROLE_COLORS: Record<NpcRole, { label: string; color: string; border: string; bg: string }> = {
  crew: { label: 'CREW', color: 'text-cyan-400', border: 'border-cyan-400/50', bg: 'bg-cyan-400/10' },
  enemy: { label: 'ENEMY', color: 'text-red-400', border: 'border-red-400/50', bg: 'bg-red-400/10' },
  contact: { label: 'CONTACT', color: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-400/10' },
  patron: { label: 'PATRON', color: 'text-purple-400', border: 'border-purple-400/50', bg: 'bg-purple-400/10' },
};

interface NPCGeneratorProps {
  onNPCSaved?: () => void;
}

export function NPCGenerator({ onNPCSaved }: NPCGeneratorProps) {
  const { saveCharacter } = useCampaign();
  const [selectedCareer, setSelectedCareer] = useState<string>('random');
  const [selectedTerms, setSelectedTerms] = useState<number>(2);
  const [selectedRole, setSelectedRole] = useState<NpcRole>('crew');
  const [customName, setCustomName] = useState('');
  const [generated, setGenerated] = useState<GeneratedNPC | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectableCareers = getSelectableCareers();

  const handleGenerate = useCallback(() => {
    const npc = generateNPC(selectedCareer, selectedTerms, selectedRole, customName);
    setGenerated(npc);
  }, [selectedCareer, selectedTerms, selectedRole, customName]);

  const handleSave = useCallback(async () => {
    if (!generated) return;
    setIsSaving(true);

    const characterData = {
      name: generated.name,
      species: 'Human',
      gender: generated.gender,
      age: generated.age,
      career: generated.career,
      rank: generated.rank,
      homeworld: '',
      strength: generated.strength,
      dexterity: generated.dexterity,
      endurance: generated.endurance,
      intellect: generated.intellect,
      education: generated.education,
      social_standing: generated.social_standing,
      current_strength: generated.strength,
      current_dexterity: generated.dexterity,
      current_endurance: generated.endurance,
      melee_dmg: getCharacteristicDM(generated.strength),
      ranged_dmg: getCharacteristicDM(generated.dexterity),
      lifeblood: generated.strength + generated.endurance,
      stamina: generated.endurance + 2,
      terms_served: generated.terms,
      skills: generated.skills,
      equipment: {},
      credits: roll1d6() * 1000 * generated.terms,
      debt: 0,
      allies: '',
      contacts: '',
      rivals: '',
      enemies: '',
      weapons: {},
      armor: {},
      augments: {},
      character_type: 'npc' as const,
      npc_role: generated.npc_role,
    };

    await saveCharacter(characterData);
    setIsSaving(false);
    setGenerated(null);
    setCustomName('');
    onNPCSaved?.();
  }, [generated, saveCharacter, onNPCSaved]);

  const roleStyle = generated ? ROLE_COLORS[generated.npc_role] : null;

  return (
    <div className="space-y-4">
      {/* Generator Controls */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">QUICK NPC GENERATOR</span>
          <span className="panel-status">TRAVELLER 2E</span>
        </div>
        <div className="panel-content space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-xs text-[var(--text-dimmer)] uppercase tracking-wider mb-1">
              Name (leave blank for random)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Random name..."
              className="terminal-input text-sm"
            />
          </div>

          {/* Career Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-dimmer)] uppercase tracking-wider mb-1">
                Career
              </label>
              <select
                value={selectedCareer}
                onChange={(e) => setSelectedCareer(e.target.value)}
                className="terminal-input text-sm"
              >
                <option value="random">Random</option>
                {selectableCareers.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Terms */}
            <div>
              <label className="block text-xs text-[var(--text-dimmer)] uppercase tracking-wider mb-1">
                Terms Served
              </label>
              <select
                value={selectedTerms}
                onChange={(e) => setSelectedTerms(Number(e.target.value))}
                className="terminal-input text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map(t => (
                  <option key={t} value={t}>{t} term{t > 1 ? 's' : ''} ({18 + t * 4} yrs)</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs text-[var(--text-dimmer)] uppercase tracking-wider mb-1">
                NPC Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as NpcRole)}
                className="terminal-input text-sm"
              >
                <option value="crew">Crew Member</option>
                <option value="enemy">Enemy / Hostile</option>
                <option value="contact">Contact / Ally</option>
                <option value="patron">Patron / Quest Giver</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            className="w-full terminal-btn primary"
          >
            <Dices className="h-4 w-4 mr-2" />
            GENERATE NPC
          </Button>
        </div>
      </div>

      {/* Generated NPC Display */}
      {generated && roleStyle && (
        <div className={`panel`}>
          <div className="panel-header">
            <span className="panel-title flex items-center gap-2">
              <User className="h-4 w-4" />
              {generated.name}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${roleStyle.color} ${roleStyle.border} ${roleStyle.bg} border`}>
              {roleStyle.label}
            </span>
          </div>
          <div className="panel-content space-y-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div>
                <span className="text-[var(--text-dimmer)]">CAREER: </span>
                <span className="text-[var(--primary)]">{generated.career}</span>
              </div>
              <div>
                <span className="text-[var(--text-dimmer)]">RANK: </span>
                <span className="text-[var(--primary)]">{generated.rank || 'None'}</span>
              </div>
              <div>
                <span className="text-[var(--text-dimmer)]">AGE: </span>
                <span className="text-[var(--primary)]">{generated.age}</span>
              </div>
              <div>
                <span className="text-[var(--text-dimmer)]">TERMS: </span>
                <span className="text-[var(--primary)]">{generated.terms}</span>
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <div className="text-xs text-[var(--text-dimmer)] uppercase tracking-wider mb-2">Characteristics</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: 'STR', value: generated.strength },
                  { label: 'DEX', value: generated.dexterity },
                  { label: 'END', value: generated.endurance },
                  { label: 'INT', value: generated.intellect },
                  { label: 'EDU', value: generated.education },
                  { label: 'SOC', value: generated.social_standing },
                ].map(stat => (
                  <div key={stat.label} className="terminal-stat">
                    <span className="terminal-stat-label">{stat.label}</span>
                    <span className="terminal-stat-value text-lg">{stat.value}</span>
                    <span className="text-[var(--text-dimmer)] text-[0.6rem]">
                      DM {getCharacteristicDM(stat.value) >= 0 ? '+' : ''}{getCharacteristicDM(stat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="text-xs text-[var(--text-dimmer)] uppercase tracking-wider mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(generated.skills).length > 0 ? (
                  Object.entries(generated.skills).map(([key, val]) => (
                    <span
                      key={key}
                      className="px-2 py-1 text-xs font-mono border rounded border-[var(--primary-dim)] text-[var(--primary)] bg-[rgba(58, 226, 179,0.05)]"
                    >
                      {key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} {val.value}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--text-dimmer)]">No skills assigned</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 terminal-btn primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'SAVING...' : 'SAVE TO CREW ROSTER'}
              </Button>
              <Button
                onClick={handleGenerate}
                className="terminal-btn secondary"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                REROLL
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
