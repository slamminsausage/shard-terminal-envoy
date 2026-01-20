// ============================================================================
// TRAVELLER 2E SKILLS REFERENCE
// ============================================================================

export interface SkillDefinition {
  name: string;
  hasSpecialties: boolean;
  specialties?: string[];
  description?: string;
}

// Skills that have specialties
export const SKILLS_WITH_SPECIALTIES: Record<string, string[]> = {
  'Animals': ['Riding', 'Training', 'Veterinary'],
  'Art': ['Acting', 'Dance', 'Holography', 'Instrument', 'Sculpting', 'Writing'],
  'Athletics': ['Dexterity', 'Endurance', 'Strength'],
  'Drive': ['Mole', 'Tracked', 'Wheeled'],
  'Electronics': ['Comms', 'Computers', 'Remote Ops', 'Sensors'],
  'Engineer': ['Life Support', 'M-Drive', 'J-Drive', 'Power', 'Electronics'],
  'Flyer': ['Grav', 'Rotor', 'Wing'],
  'Gunner': ['Turret', 'Ortillery', 'Screen', 'Capital Weapons'],
  'Gun Combat': ['Archaic', 'Energy', 'Slug'],
  'Heavy Weapons': ['Artillery', 'Man Portable', 'Vehicle'],
  'Language': ['Anglic', 'Vilani', 'Zdetl', 'Oynprith', 'Other'],
  'Melee': ['Unarmed', 'Blade', 'Bludgeon', 'Natural Weapons'],
  'Pilot': ['Small Craft', 'Spacecraft', 'Capital Ships'],
  'Profession': ['Biologics', 'Civil Engineering', 'Construction', 'Hydroponics', 'Polymers'],
  'Science': ['Archaeology', 'Astronomy', 'Biology', 'Chemistry', 'Cosmology', 'Cybernetics', 'Economics', 'Genetics', 'History', 'Linguistics', 'Philosophy', 'Physics', 'Planetology', 'Psionicology', 'Psychology', 'Robotics', 'Sophontology', 'Xenology'],
  'Seafarer': ['Ocean Ships', 'Personal', 'Sail', 'Submarine'],
};

// Skills without specialties
export const SKILLS_WITHOUT_SPECIALTIES = [
  'Admin',
  'Advocate',
  'Astrogation',
  'Broker',
  'Carouse',
  'Deception',
  'Diplomat',
  'Discipline',
  'Explosives',
  'Gambler',
  'Investigate',
  'Jack-of-all-Trades',
  'Leadership',
  'Mechanic',
  'Medic',
  'Navigation',
  'Persuade',
  'Recon',
  'Stealth',
  'Streetwise',
  'Survival',
  'Tactics',
  'Vacc Suit',
];

// All skills combined
export const ALL_SKILLS: SkillDefinition[] = [
  // Skills with specialties
  ...Object.keys(SKILLS_WITH_SPECIALTIES).map(skill => ({
    name: skill,
    hasSpecialties: true,
    specialties: SKILLS_WITH_SPECIALTIES[skill],
  })),
  // Skills without specialties
  ...SKILLS_WITHOUT_SPECIALTIES.map(skill => ({
    name: skill,
    hasSpecialties: false,
  })),
];

/**
 * Check if a skill has specialties
 */
export function hasSpecialties(skillName: string): boolean {
  const normalized = skillName.trim();
  return Object.keys(SKILLS_WITH_SPECIALTIES).some(
    skill => skill.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get specialties for a skill
 */
export function getSpecialties(skillName: string): string[] {
  const normalized = skillName.trim();
  const matchingKey = Object.keys(SKILLS_WITH_SPECIALTIES).find(
    skill => skill.toLowerCase() === normalized.toLowerCase()
  );
  return matchingKey ? SKILLS_WITH_SPECIALTIES[matchingKey] : [];
}

/**
 * Parse a skill string to extract base skill and specialty
 * Examples:
 *   "Electronics (computers)" -> { skill: "Electronics", specialty: "computers" }
 *   "Gun Combat" -> { skill: "Gun Combat", specialty: null }
 *   "Melee (blade)" -> { skill: "Melee", specialty: "blade" }
 */
export function parseSkillString(skillString: string): { skill: string; specialty: string | null } {
  const match = skillString.match(/^(.+?)\s*(?:\((.+)\))?$/);
  if (match) {
    return {
      skill: match[1].trim(),
      specialty: match[2] ? match[2].trim() : null,
    };
  }
  return { skill: skillString.trim(), specialty: null };
}

/**
 * Normalize a skill name for storage
 * Examples:
 *   "Electronics (computers)" -> "electronics-computers"
 *   "Gun Combat (slug)" -> "gun-combat-slug"
 *   "Admin" -> "admin"
 */
export function normalizeSkillName(skillName: string): string {
  const { skill, specialty } = parseSkillString(skillName);
  const baseName = skill.toLowerCase().replace(/\s+/g, '-');
  if (specialty) {
    const specialtyName = specialty.toLowerCase().replace(/\s+/g, '-');
    return `${baseName}-${specialtyName}`;
  }
  return baseName;
}

/**
 * Format a skill for display
 * Examples:
 *   "electronics-computers" -> "Electronics (Computers)"
 *   "gun-combat-slug" -> "Gun Combat (Slug)"
 *   "admin" -> "Admin"
 */
export function formatSkillName(normalizedName: string): string {
  const parts = normalizedName.split('-');

  // Find matching skill name (case-insensitive)
  const skillMatch = ALL_SKILLS.find(s =>
    s.name.toLowerCase().replace(/\s+/g, '-') === parts.slice(0, parts.length - (parts.length > 2 ? 1 : 0)).join('-')
  );

  if (skillMatch && parts.length > 1 && skillMatch.hasSpecialties) {
    const specialty = parts[parts.length - 1];
    const formattedSpecialty = specialty.charAt(0).toUpperCase() + specialty.slice(1).replace(/-/g, ' ');
    return `${skillMatch.name} (${formattedSpecialty})`;
  }

  if (skillMatch) {
    return skillMatch.name;
  }

  // Fallback: capitalize each part
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}
