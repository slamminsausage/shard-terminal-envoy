import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { roll2d6, roll1d6, getCharacteristicDM } from '@/lib/dice';
import { ALL_CAREERS, type CareerDefinition } from '@/components/character-gen/careers';
import { normalizeSkillName } from '@/components/character-gen/careers/skills';
import { useCampaign } from '@/contexts/CampaignContext';
import { NPC_ROLE_STYLES, type NpcRole } from '@/types/database';
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


interface GeneratedAssets {
  weapon?: { weapon: string; damage: string; range: string; traits: string };
  armor?: { type: string; protection: string };
  credits: number;
}

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
  skills: Record<string, { proficient: boolean; value: string }>;
  npc_role: NpcRole;
  assets: GeneratedAssets;
}

const CAREER_WEAPONS: Record<string, { weapon: string; damage: string; range: string; traits: string }> = {
  Navy:      { weapon: 'Laser Pistol', damage: '3D', range: 'Medium', traits: 'Zero-G' },
  Marine:    { weapon: 'Assault Rifle', damage: '3D', range: 'Long', traits: 'Auto 2' },
  Army:      { weapon: 'Rifle', damage: '3D-3', range: 'Long', traits: '' },
  Scout:     { weapon: 'Laser Carbine', damage: '4D', range: 'Long', traits: 'Zero-G' },
  Agent:     { weapon: 'Snub Pistol', damage: '3D-3', range: 'Short', traits: 'Zero-G' },
  Rogue:     { weapon: 'Autopistol', damage: '3D-3', range: 'Short', traits: 'Semi-Auto 3' },
  Merchant:  { weapon: 'Revolver', damage: '3D-3', range: 'Short', traits: '' },
  Noble:     { weapon: 'Blade', damage: '2D', range: 'Melee', traits: '' },
};
const CAREER_ARMOR: Record<string, { type: string; protection: string }> = {
  Marine: { type: 'Combat Armor', protection: '13' },
  Army:   { type: 'Flak Jacket', protection: '5' },
  Scout:  { type: 'Vacc Suit', protection: '8' },
  Agent:  { type: 'Cloth Armor', protection: '5' },
  Navy:   { type: 'Vacc Suit', protection: '8' },
};

function generateAssets(careerName: string, terms: number, role: NpcRole): GeneratedAssets {
  const baseCredits = roll1d6() * 1000 * terms;
  const roleBonus = role === 'patron' ? roll1d6() * 5000 : 0;
  const credits = baseCredits + roleBonus;
  const weapon = CAREER_WEAPONS[careerName];
  const armor = CAREER_ARMOR[careerName];
  return { weapon, armor, credits };
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

  // Determine rank: 1 term = rank 0 (entry level), 6 terms = rank 5 (senior)
  const rankNum = Math.min(terms - 1, 5);
  const rankTitle = getRankTitle(career, rankNum);

  // Generate skills from career skill tables
  const skills: Record<string, { proficient: boolean; value: string }> = {};

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

  // Pick skills without replacement, deduplicating by normalized key
  const usedKeys = new Set<string>();
  const pool = [...actualSkills];
  let attempts = 0;
  while (Object.keys(skills).length < numSkills && pool.length > 0 && attempts < numSkills * 4) {
    attempts++;
    const idx = Math.floor(Math.random() * pool.length);
    const skillName = pool[idx];
    const key = normalizeSkillName(skillName);
    if (!usedKeys.has(key)) {
      usedKeys.add(key);
      pool.splice(idx, 1);
      const level = terms >= 3 && Math.random() < 0.3 ? 2 : 1;
      skills[key] = { proficient: true, value: String(level) };
    } else {
      pool.splice(idx, 1);
    }
  }

  const assets = generateAssets(career.name, terms, role);

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
    assets,
  };
}


interface NPCGeneratorProps {
  onNPCSaved?: () => void;
  defaultCrewId?: string;
}

export function NPCGenerator({ onNPCSaved, defaultCrewId }: NPCGeneratorProps) {
  const { saveCharacter, crewGroups } = useCampaign();
  const [selectedCareer, setSelectedCareer] = useState<string>('random');
  const [selectedTerms, setSelectedTerms] = useState<number>(2);
  const [selectedRole, setSelectedRole] = useState<NpcRole>('crew');
  const [customName, setCustomName] = useState('');
  const [generated, setGenerated] = useState<GeneratedNPC | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveCrewId, setSaveCrewId] = useState<string>(defaultCrewId || 'none');

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
      credits: generated.assets.credits,
      cash_on_hand: generated.assets.credits,
      debt: 0,
      allies: '',
      contacts: '',
      rivals: '',
      enemies: '',
      weapons: generated.assets.weapon
        ? [{ weapon: generated.assets.weapon.weapon, accuracy: '', range: generated.assets.weapon.range, damage: generated.assets.weapon.damage, kg: '', magazine: '', traits: generated.assets.weapon.traits }]
        : [],
      armor: generated.assets.armor
        ? [{ type: generated.assets.armor.type, rad: '', protection: generated.assets.armor.protection, kg: '', options: '', total: '' }]
        : [],
      augments: {},
      character_type: 'npc' as const,
      npc_role: generated.npc_role,
      crew_id: saveCrewId !== 'none' ? saveCrewId : undefined,
    };

    await saveCharacter(characterData);
    setIsSaving(false);
    setGenerated(null);
    setCustomName('');
    onNPCSaved?.();
  }, [generated, saveCharacter, onNPCSaved, saveCrewId]);

  const roleStyle = generated ? NPC_ROLE_STYLES[generated.npc_role] : null;

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
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${roleStyle.color}`}
              style={{ borderColor: roleStyle.borderColor, backgroundColor: roleStyle.bgColor }}>
              {roleStyle.label.replace('NPC ', '')}
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

            {/* Assets */}
            <div>
              <div className="text-xs text-[var(--text-dimmer)] uppercase tracking-wider mb-2">Starting Assets</div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2 py-1 border rounded border-[var(--primary-dim)] text-[var(--primary)] bg-[rgba(58,226,179,0.05)]">
                  Cr {generated.assets.credits.toLocaleString()}
                </span>
                {generated.assets.weapon && (
                  <span className="px-2 py-1 border rounded border-[var(--primary-dim)] text-[var(--primary)] bg-[rgba(58,226,179,0.05)]">
                    {generated.assets.weapon.weapon} ({generated.assets.weapon.damage})
                  </span>
                )}
                {generated.assets.armor && (
                  <span className="px-2 py-1 border rounded border-[var(--primary-dim)] text-[var(--primary)] bg-[rgba(58,226,179,0.05)]">
                    {generated.assets.armor.type} [{generated.assets.armor.protection}]
                  </span>
                )}
              </div>
            </div>

            {/* Crew assignment for save */}
            {crewGroups.length > 0 && (
              <div>
                <label className="block text-xs text-[var(--text-dimmer)] uppercase tracking-wider mb-1">
                  Assign to Crew (optional)
                </label>
                <select
                  value={saveCrewId}
                  onChange={e => setSaveCrewId(e.target.value)}
                  className="terminal-input text-sm"
                >
                  <option value="none">No Crew</option>
                  {crewGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            )}

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
