/**
 * Traveller Core Rulebook - Armor Catalog
 *
 * Each armor type at a given TL is a separate entry so it can be
 * selected directly from a dropdown. Multi-TL items (e.g. Cloth at
 * TL7 and TL10) appear as distinct selectable options.
 */

import { ArmorCatalogItem, ArmorOption } from './types';

// ─── Armor Types ─────────────────────────────────────────────────────

export const ARMOR_CATALOG: ArmorCatalogItem[] = [
  // ── Light / Civilian Armor ───────────────────────────────────────
  {
    id: 'jack',
    name: 'Jack',
    category: 'armor',
    tl: 1,
    protection: 1,
    rad: 0,
    mass_kg: 2,
    cost: 50,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    laserProtection: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A natural or synthetic leather jacket or body suit covering the torso and upper arms and legs. Jack is better than ordinary clothing or bare skin when defending against blades but is useless against guns.',
  },
  {
    id: 'mesh',
    name: 'Mesh',
    category: 'armor',
    tl: 6,
    protection: 2,
    rad: 0,
    mass_kg: 3,
    cost: 150,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    laserProtection: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A jacket or body suit lined with a flexible metal or plastic mesh that gives it added protection against bullets.',
  },
  {
    id: 'cloth-tl7',
    name: 'Cloth (TL7)',
    category: 'armor',
    tl: 7,
    protection: 5,
    rad: 0,
    mass_kg: 7,
    cost: 250,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A heavy duty body suit tailored from ballistic cloth. The fabric absorbs impact energy and spreads it over the body, which can result in bruising. However, cloth armour is highly useful and versatile.',
  },
  {
    id: 'cloth-tl10',
    name: 'Cloth (TL10)',
    category: 'armor',
    tl: 10,
    protection: 8,
    rad: 0,
    mass_kg: 3,
    cost: 500,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'Advanced ballistic cloth that is lighter and more flexible than its TL7 counterpart. Can be indistinguishable from ordinary clothing under normal circumstances.',
  },

  // ── Flak ─────────────────────────────────────────────────────────
  {
    id: 'flak-jacket-tl7',
    name: 'Flak Jacket (TL7)',
    category: 'armor',
    tl: 7,
    protection: 3,
    rad: 0,
    mass_kg: 8,
    cost: 100,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    laserProtection: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A less expensive version of ballistic cloth, the bulky flak jacket is an unmistakably military garment.',
  },
  {
    id: 'flak-jacket-tl8',
    name: 'Flak Jacket (TL8)',
    category: 'armor',
    tl: 8,
    protection: 5,
    rad: 0,
    mass_kg: 6,
    cost: 300,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    laserProtection: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'An improved flak jacket using advanced ballistic materials for better protection at reduced weight. Still unmistakably military in appearance.',
  },

  // ── Specialised Armor ────────────────────────────────────────────
  {
    id: 'reflec',
    name: 'Reflec',
    category: 'armor',
    tl: 10,
    protection: 0,
    rad: 0,
    mass_kg: 1,
    cost: 1500,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    laserProtection: 10,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A flexible plastic suit with layers of reflective material and heat-dispersing gel. Highly effective against lasers but provides no protection against other attacks. Reflec can be worn with other armour but is hard to obtain, quite expensive and imposes DM-2 on any Stealth checks.',
  },
  {
    id: 'ablat',
    name: 'Ablat',
    category: 'armor',
    tl: 9,
    protection: 1,
    rad: 0,
    mass_kg: 2,
    cost: 75,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    laserProtection: 6,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A cheap alternative to Reflec, ablat armour is made from a material that ablates (vaporises) when hit by laser fire. Each laser hit reduces its Protection value against lasers by one, but the armour is cheap and easily replaceable.',
  },

  // ── Combat Armour ────────────────────────────────────────────────
  {
    id: 'combat-armour-tl10',
    name: 'Combat Armour (TL10)',
    category: 'armor',
    tl: 10,
    protection: 13,
    rad: 85,
    mass_kg: 20,
    cost: 96000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'A full-body suit used by the military and not generally available on the open market, although those with military or criminal contacts can obtain suits. Functions as a vacc suit with six hours of life support. All weapons used while wearing combat armour count as having the Scope trait.',
  },
  {
    id: 'combat-armour-tl12',
    name: 'Combat Armour (TL12)',
    category: 'armor',
    tl: 12,
    protection: 17,
    rad: 145,
    mass_kg: 16,
    cost: 88000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'Considerably lighter combat armour, substituting carbon-tube weave for the smart plastic of the previous generation. Functions as a vacc suit with six hours of life support. All weapons count as having the Scope trait.',
  },
  {
    id: 'combat-armour-tl14',
    name: 'Combat Armour (TL14)',
    category: 'armor',
    tl: 14,
    protection: 19,
    rad: 180,
    mass_kg: 12,
    cost: 160000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'Cutting-edge combat armour offering vastly improved protection over earlier generations. Functions as a vacc suit with six hours of life support. All weapons count as having the Scope trait.',
  },

  // ── Vacc Suits ───────────────────────────────────────────────────
  {
    id: 'vacc-suit-tl8',
    name: 'Vacc Suit (TL8)',
    category: 'armor',
    tl: 8,
    protection: 4,
    rad: 15,
    mass_kg: 28,
    cost: 12000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'The spacer\'s best friend, providing life support and protection when in space. Early vacc suits are unwieldy and uncomfortable. Provides life support for six hours.',
  },
  {
    id: 'vacc-suit-tl10',
    name: 'Vacc Suit (TL10)',
    category: 'armor',
    tl: 10,
    protection: 8,
    rad: 60,
    mass_kg: 12,
    cost: 10000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'An improved vacc suit that masses considerably less than the TL8 model. Provides life support for six hours.',
  },
  {
    id: 'vacc-suit-tl12',
    name: 'Vacc Suit (TL12)',
    category: 'armor',
    tl: 12,
    protection: 10,
    rad: 90,
    mass_kg: 8,
    cost: 20000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'At this Tech Level, "tailored" vacc suits feel like ordinary clothing with a flexible hood and face mask. Provides life support for six hours.',
  },

  // ── Hostile Environment Vacc Suits ───────────────────────────────
  {
    id: 'hev-suit-tl9',
    name: 'HEV Suit (TL9)',
    category: 'armor',
    tl: 9,
    protection: 8,
    rad: 75,
    mass_kg: 40,
    cost: 24000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'Hostile environment suits are designed for conditions where a normal vacc suit would be insufficient, such as deep underwater, worlds with toxic atmosphere, extremes of radiation or temperature. Provides life support for six hours.',
  },
  {
    id: 'hev-suit-tl10',
    name: 'HEV Suit (TL10)',
    category: 'armor',
    tl: 10,
    protection: 9,
    rad: 90,
    mass_kg: 30,
    cost: 20000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'An improved hostile environment suit with better materials and reduced weight. Designed for deep underwater, toxic atmospheres, extreme radiation or temperature. Provides life support for six hours.',
  },
  {
    id: 'hev-suit-tl13',
    name: 'HEV Suit (TL13)',
    category: 'armor',
    tl: 13,
    protection: 14,
    rad: 170,
    mass_kg: 20,
    cost: 40000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'Advanced hostile environment suit with outstanding radiation protection at manageable weight. Handles deep underwater, toxic atmospheres, and extreme conditions. Provides life support for six hours.',
  },
  {
    id: 'hev-suit-tl14',
    name: 'HEV Suit (TL14)',
    category: 'armor',
    tl: 14,
    protection: 15,
    rad: 185,
    mass_kg: 10,
    cost: 60000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'Top-of-the-line hostile environment suit. Remarkably light for its exceptional protection and radiation shielding. Handles the most extreme environments. Provides life support for six hours.',
  },

  // ── Battle Dress ─────────────────────────────────────────────────
  {
    id: 'battle-dress-tl13',
    name: 'Battle Dress (TL13)',
    category: 'armor',
    tl: 13,
    protection: 22,
    rad: 245,
    mass_kg: 100,
    cost: 200000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 2,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: true,
    description: 'The premier personal armour, battle dress is a powered form of combat armour. Servomotors increase STR and DEX by +4 while worn. An on-board Computer/2 gives tactical advice and updates. Fully enclosed with a six-hour air supply and substantial NBC protection. All weapons count as having the Scope trait. The 100kg mass is supported by the suit\'s power systems, effectively weighing nothing when worn.',
  },
  {
    id: 'battle-dress-tl14',
    name: 'Battle Dress (TL14)',
    category: 'armor',
    tl: 14,
    protection: 25,
    rad: 290,
    mass_kg: 100,
    cost: 220000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    laserProtection: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: true,
    description: 'More advanced battle dress that is considerably stronger, granting STR +6 and DEX +4 while worn. Upgrades internal systems to Computer/3. Fully enclosed with a six-hour air supply and substantial NBC protection. All weapons count as having the Scope trait. The 100kg mass is supported by the suit\'s power systems.',
  },
];

// ─── Armor Options / Upgrades ────────────────────────────────────────

export const ARMOR_OPTIONS: ArmorOption[] = [
  {
    id: 'chameleon-ir',
    name: 'Chameleon, IR',
    description: 'Selectively bleeds heat to match background IR levels, rendering the wearer invisible to infrared detection (DM-4 to detect with sensors).',
    variants: [
      {
        tl: 12,
        cost: 5000,
        effect: 'DM-4 to detect with IR/sensors',
        compatibleWith: undefined, // Any full-body suit - checked via isFullBodySuit
      },
    ],
  },
  {
    id: 'chameleon-vislight',
    name: 'Chameleon, Vislight',
    description: 'Light-bending technology making the wearer nearly invisible to the naked eye (DM-4 to spot).',
    variants: [
      {
        tl: 13,
        cost: 50000,
        effect: 'DM-4 to spot visually',
        compatibleWith: undefined, // Any full-body suit
      },
    ],
  },
  {
    id: 'computer-weave',
    name: 'Computer Weave',
    description: 'Adds an integrated computer system to armour that does not already have one.',
    variants: [
      {
        tl: 10,
        cost: 500,
        effect: 'Computer/0',
      },
      {
        tl: 11,
        cost: 1000,
        effect: 'Computer/1',
      },
      {
        tl: 13,
        cost: 5000,
        effect: 'Computer/2',
      },
    ],
  },
  {
    id: 'extended-life-support',
    name: 'Extended Life Support',
    description: 'High-pressure oxygen tanks and recycling systems provide 18 hours of oxygen.',
    variants: [
      {
        tl: 10,
        cost: 10000,
        effect: '18 hours oxygen supply',
        // Only suits with life support
      },
    ],
  },
  {
    id: 'eye-protection',
    name: 'Eye Protection',
    description: 'Visors or goggles to guard against flying debris and laser blinding effects. Automatically included in TL9+ armour.',
    variants: [
      {
        tl: 6,
        cost: 50,
        effect: 'Protection against blinding (auto-included TL9+)',
      },
    ],
  },
  {
    id: 'grav-assist',
    name: 'Grav Assist',
    description: 'Adds grav belt functionality to the armour, allowing personal flight.',
    variants: [
      {
        tl: 12,
        cost: 110000,
        effect: 'Grav belt functionality',
        compatibleWith: [
          'combat-armour-tl10', 'combat-armour-tl12', 'combat-armour-tl14',
          'battle-dress-tl13', 'battle-dress-tl14',
        ],
      },
      {
        tl: 15,
        cost: 120000,
        effect: 'Grav belt functionality (extended duration)',
        compatibleWith: [
          'combat-armour-tl10', 'combat-armour-tl12', 'combat-armour-tl14',
          'battle-dress-tl13', 'battle-dress-tl14',
        ],
      },
    ],
  },
  {
    id: 'magnetic-grapples',
    name: 'Magnetic Grapples',
    description: 'Magnetic plates in boots allow normal walking on spacecraft without artificial gravity.',
    variants: [
      {
        tl: 8,
        cost: 100,
        effect: 'Walk normally in zero-g on metal surfaces',
      },
    ],
  },
  {
    id: 'medikit',
    name: 'Medikit',
    description: 'Internal medical scanner and drug injector. Automatically applies first aid if reduced to END 0 (Medic 3). Can administer Fast Drug.',
    variants: [
      {
        tl: 10,
        cost: 5000,
        effect: 'Auto first aid at END 0 (Medic 3), Fast Drug',
        compatibleWith: [
          'combat-armour-tl10', 'combat-armour-tl12', 'combat-armour-tl14',
          'battle-dress-tl13', 'battle-dress-tl14',
          'vacc-suit-tl8', 'vacc-suit-tl10', 'vacc-suit-tl12',
          'hev-suit-tl9', 'hev-suit-tl10', 'hev-suit-tl13', 'hev-suit-tl14',
        ],
      },
      {
        tl: 11,
        cost: 10000,
        effect: 'Auto first aid (Medic 3), Fast Drug, combat drugs, metabolic accelerators',
        compatibleWith: [
          'combat-armour-tl10', 'combat-armour-tl12', 'combat-armour-tl14',
          'battle-dress-tl13', 'battle-dress-tl14',
          'vacc-suit-tl8', 'vacc-suit-tl10', 'vacc-suit-tl12',
          'hev-suit-tl9', 'hev-suit-tl10', 'hev-suit-tl13', 'hev-suit-tl14',
        ],
      },
    ],
  },
  {
    id: 'self-sealing',
    name: 'Self-Sealing',
    description: 'Seals breaches and repairs minor damage automatically. Can handle damage up to bullet/stab wounds.',
    variants: [
      {
        tl: 11,
        cost: 2000,
        effect: 'Auto-repairs minor breaches and damage',
        incompatibleWith: ['ablat'],
      },
    ],
  },
  {
    id: 'smart-fabric',
    name: 'Smart Fabric',
    description: 'Resists stains and dirt, cleaning itself automatically. Can be suspended for camouflage purposes.',
    variants: [
      {
        tl: 10,
        cost: 1000,
        effect: 'Self-cleaning (can suspend for camo)',
      },
    ],
  },
  {
    id: 'thruster-pack',
    name: 'Thruster Pack',
    description: 'Provides manoeuvring capability in zero-gravity environments.',
    variants: [
      {
        tl: 9,
        cost: 2000,
        effect: 'Zero-g manoeuvring (Athletics (dexterity) check required)',
      },
      {
        tl: 12,
        cost: 14000,
        effect: '0.1g acceleration for 48 hours (standard fuel)',
      },
      {
        tl: 14,
        cost: 20000,
        effect: '0.1g acceleration for 48 hours (compact grav-thruster)',
      },
    ],
  },
];

// ─── Utility Functions ───────────────────────────────────────────────

/** Look up an armor item by its catalog ID */
export function getArmorById(id: string): ArmorCatalogItem | undefined {
  return ARMOR_CATALOG.find(a => a.id === id);
}

/** Look up an armor option by its ID */
export function getArmorOptionById(id: string): ArmorOption | undefined {
  return ARMOR_OPTIONS.find(o => o.id === id);
}

/**
 * Check if an armor option variant is compatible with a given armor item.
 * Rules:
 * - Chameleon options require isFullBodySuit
 * - Extended Life Support requires hasLifeSupport
 * - If variant has compatibleWith, armor must be in that list
 * - If variant has incompatibleWith, armor must NOT be in that list
 */
export function isOptionCompatible(
  armor: ArmorCatalogItem,
  option: ArmorOption,
  variant: number = 0,
): boolean {
  const v = option.variants[variant];
  if (!v) return false;

  // TL check: option TL must not exceed what the armor TL can support
  // (actually, options can be added regardless of armor TL as long as
  // the option's own TL is available - it's a separate purchase)

  // Chameleon options require full-body suit
  if (option.id === 'chameleon-ir' || option.id === 'chameleon-vislight') {
    if (!armor.isFullBodySuit) return false;
  }

  // Extended life support requires life support
  if (option.id === 'extended-life-support') {
    if (!armor.hasLifeSupport) return false;
  }

  // Check explicit compatibility lists
  if (v.compatibleWith && v.compatibleWith.length > 0) {
    if (!v.compatibleWith.includes(armor.id)) return false;
  }

  if (v.incompatibleWith && v.incompatibleWith.length > 0) {
    if (v.incompatibleWith.includes(armor.id)) return false;
  }

  return true;
}

/**
 * Get all compatible options for a given armor item.
 * Returns options with only their compatible variants included.
 */
export function getCompatibleOptions(armor: ArmorCatalogItem): Array<{
  option: ArmorOption;
  compatibleVariants: Array<{ index: number; variant: ArmorOption['variants'][0] }>;
}> {
  const results: Array<{
    option: ArmorOption;
    compatibleVariants: Array<{ index: number; variant: ArmorOption['variants'][0] }>;
  }> = [];

  for (const option of ARMOR_OPTIONS) {
    const compatibleVariants: Array<{ index: number; variant: ArmorOption['variants'][0] }> = [];

    for (let i = 0; i < option.variants.length; i++) {
      if (isOptionCompatible(armor, option, i)) {
        compatibleVariants.push({ index: i, variant: option.variants[i] });
      }
    }

    if (compatibleVariants.length > 0) {
      results.push({ option, compatibleVariants });
    }
  }

  return results;
}

/**
 * Calculate the total cost of armor with selected options.
 */
export function calculateArmorCost(
  armor: ArmorCatalogItem,
  selectedOptions: Array<{ optionId: string; variantIndex: number }>,
): number {
  let total = armor.cost;

  for (const sel of selectedOptions) {
    const option = getArmorOptionById(sel.optionId);
    if (option && option.variants[sel.variantIndex]) {
      total += option.variants[sel.variantIndex].cost;
    }
  }

  return total;
}

/**
 * Get the effective mass of armor (accounting for powered armor).
 * Battle dress mass is 0 when worn because the suit supports itself.
 */
export function getEffectiveMass(armor: ArmorCatalogItem, location: 'worn' | 'carried' | 'stowed'): number {
  if (armor.isPowered && location === 'worn') {
    return 0;
  }
  return armor.mass_kg;
}

/**
 * Format armor protection for display.
 * Handles special cases like Reflec (lasers only) and Ablat (split protection).
 */
export function formatProtection(armor: ArmorCatalogItem): string {
  if (armor.laserProtection && armor.protection === 0) {
    // Reflec: laser-only protection
    return `+${armor.laserProtection} (lasers only)`;
  }
  if (armor.laserProtection && armor.protection > 0) {
    // Ablat: base + laser bonus
    return `+${armor.protection} (+${armor.laserProtection} vs lasers)`;
  }
  return `+${armor.protection}`;
}

/**
 * Format required skill for display.
 */
export function formatRequiredSkill(armor: ArmorCatalogItem): string {
  if (!armor.requiredSkill) return 'None';
  return `${armor.requiredSkill} ${armor.requiredSkillLevel}`;
}
