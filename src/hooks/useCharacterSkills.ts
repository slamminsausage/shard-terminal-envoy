/**
 * useCharacterSkills Hook
 *
 * Looks up character skill data from the campaign context
 * and calculates skill/characteristic modifiers for roll checks.
 */

import { useCampaign } from '@/contexts/CampaignContext';
import { getSkillDM, getCharacteristicDM } from '@/lib/dice';

export interface CharacterSkillInfo {
  proficient: boolean;
  level: number;
  skillDM: number;
  charDM: number;
  jackLevel?: number;
  characterName?: string;
}

/**
 * Skill-to-characteristic mapping for common Traveller skills
 * Maps skill names to their primary characteristic
 */
const SKILL_CHARACTERISTICS: Record<string, string> = {
  'Electronics (Computers)': 'intellect',
  'Electronics (Comms)': 'intellect',
  'Electronics (Remote Ops)': 'intellect',
  'Electronics (Sensors)': 'intellect',
  'Pilot (Small Craft)': 'dexterity',
  'Pilot (Spacecraft)': 'dexterity',
  'Pilot (Capital Ships)': 'intellect',
  'Gun Combat (Archaic)': 'dexterity',
  'Gun Combat (Energy)': 'dexterity',
  'Gun Combat (Slug)': 'dexterity',
  'Tactics (Military)': 'intellect',
  'Tactics (Naval)': 'intellect',
  'Melee (Unarmed)': 'dexterity',
  'Melee (Blade)': 'dexterity',
  'Melee (Bludgeon)': 'dexterity',
  'Science': 'education',
  'Admin': 'education',
  'Advocate': 'education',
  'Diplomat': 'social_standing',
  'Persuade': 'social_standing',
  'Deception': 'intellect',
  'Stealth': 'dexterity',
  'Recon': 'intellect',
  'Investigate': 'intellect',
  'Medic': 'education',
  'Engineer': 'education',
  'Mechanic': 'education',
};

export function useCharacterSkills() {
  const { characters } = useCampaign();

  /**
   * Get skill info for the active character
   * Falls back to unproficient (-3) if no character or skill not found
   *
   * @param skillName Name of the skill (e.g., "Electronics (Computers)")
   * @param characteristicName Optional override for characteristic (defaults to skill mapping)
   * @returns Skill info including modifiers
   */
  const getSkillInfo = (
    skillName: string,
    characteristicName?: string
  ): CharacterSkillInfo => {
    // If no active character, return zero defaults
    if (!characters || characters.length === 0) {
      return {
        proficient: false,
        level: 0,
        skillDM: 0,
        charDM: 0,
      };
    }

    // Use first character (in future, could allow character selection)
    const character = characters[0];

    // Get skill data
    const skills = character.skills || {};
    const skillData = skills[skillName];
    const proficient = skillData?.proficient || false;
    const level = Number(skillData?.value || 0);

    // Get Jack-of-All-Trades level (reduces unproficient penalty)
    const jackData = skills['Jack-of-All-Trades'];
    const jackLevel = jackData?.proficient ? Number(jackData.value || 0) : undefined;

    // Calculate skill DM
    const skillDM = getSkillDM(proficient, level, jackLevel);

    // Determine which characteristic to use
    const charName =
      characteristicName ||
      SKILL_CHARACTERISTICS[skillName] ||
      'intellect'; // Default to intellect

    // Get characteristic value and calculate DM
    const charValue = Number(character[charName.toLowerCase()] || 0);
    const charDM = getCharacteristicDM(charValue);

    return {
      proficient,
      level,
      skillDM,
      charDM,
      jackLevel,
      characterName: character.name,
    };
  };

  return { getSkillInfo };
}
