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
    mass_kg: 1,
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
    mass_kg: 2,
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
    mass_kg: 10,
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
    mass_kg: 5,
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
    mass_kg: 10,
    cost: 11000,
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
    mass_kg: 22,
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
    mass_kg: 13,
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
    mass_kg: 10,
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
    mass_kg: 9,
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

  // ═══════════════════════════════════════════════════════════════════
  // ── CENTRAL SUPPLY CATALOGUE ADDITIONS ───────────────────────────
  // ═══════════════════════════════════════════════════════════════════

  // ── Light / Civilian (CSC) ───────────────────────────────────────
  {
    id: 'ballistic-vest',
    name: 'Ballistic Vest',
    category: 'armor',
    tl: 8,
    protection: 4,
    rad: 0,
    mass_kg: 1,
    cost: 500,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A flexible and relatively light flak jacket intended to be worn semi-discreetly. Still fairly obviously armour but can be concealed under a light jacket, whereas a flak jacket is much more blatant.',
  },
  {
    id: 'cloth-tl12',
    name: 'Cloth (TL12)',
    category: 'armor',
    tl: 12,
    protection: 4,
    rad: 0,
    mass_kg: 2,
    cost: 750,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A thin type of cloth armour available at TL12, light enough to be worn under other types of armour, adding its protection value to that of the outer armour.',
  },
  {
    id: 'diplo-vest',
    name: 'Diplo Vest',
    category: 'armor',
    tl: 10,
    protection: 3,
    rad: 0,
    mass_kg: 0,
    cost: 250,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A shirt-only version of the protec suit that can be worn under a normal shirt and is completely concealed. Ideal for sensitive diplomatic occasions where obvious armour is not appropriate.',
  },
  {
    id: 'flak-shell',
    name: 'Flak Shell',
    category: 'armor',
    tl: 9,
    protection: 8,
    rad: 0,
    mass_kg: 8,
    cost: 1000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A heavy back-and-breastplate formed from metal or ceramic composites. Essentially a stronger and more advanced flak jacket, but extremely heavy and imposes DM-1 on all skill checks that involve physical action.',
  },
  {
    id: 'post-apocalyptic',
    name: 'Post-Apocalyptic',
    category: 'armor',
    tl: 6,
    protection: 4,
    rad: 0,
    mass_kg: 3,
    cost: 150,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'Scavenged armour cobbled together from plate pieces, salvaged rubber and other toughened materials that can be riveted, welded or glued together. Covers the torso and upper legs, and maybe an arm.',
  },
  {
    id: 'protec-suit',
    name: 'Protec Suit',
    category: 'armor',
    tl: 9,
    protection: 4,
    rad: 0,
    mass_kg: 1,
    cost: 500,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A slim-fitting business suit woven from protective fibres. Obviously armour but confers a degree of respectability without making the Traveller appear like a thug. Capable of turning melee weapons while softening the blow of small arms fire.',
  },
  {
    id: 'tactical-riot-armour',
    name: 'Tactical Riot Armour',
    category: 'armor',
    tl: 7,
    protection: 4,
    rad: 0,
    mass_kg: 6,
    cost: 600,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'Developed for law enforcement, this armour protects the torso, arms and head primarily from improvised weapons. The design emphasises intimidation while rendering the Traveller anonymous among others so equipped. Grants a Boon to Persuade checks made to intimidate.',
  },

  // ── Carapace Armour (CSC) ────────────────────────────────────────
  {
    id: 'ceramic-carapace',
    name: 'Ceramic Carapace',
    category: 'armor',
    tl: 12,
    protection: 10,
    rad: 0,
    mass_kg: 4,
    cost: 12000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    energyProtection: 6,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'Contoured plates of advanced ceramic/metal alloys positioned over vital organs. Ceramic alloys are designed to slough off heat and flame, giving the armour an additional +6 Protection against lasers, flamethrowers and other heat/fire-based attacks.',
  },
  {
    id: 'poly-carapace-tl10',
    name: 'Poly Carapace (TL10)',
    category: 'armor',
    tl: 10,
    protection: 10,
    rad: 0,
    mass_kg: 2,
    cost: 10000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A bodysuit of fibrous material with attached polymer plastic plates shielding major arteries and organs, complete with armoured facemask and half-helmet. Good protection against all weapons but restrictive to limb movement — imposes DM-1 on all skill checks requiring physical action.',
  },
  {
    id: 'poly-carapace-tl11',
    name: 'Lightweight Poly Carapace (TL11)',
    category: 'armor',
    tl: 11,
    protection: 12,
    rad: 0,
    mass_kg: 2,
    cost: 15000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'An advanced lightweight poly carapace that is less bulky, does not restrict movement, yet provides better protection than the standard model.',
  },
  {
    id: 'poly-carapace-tl13',
    name: 'Advanced Poly Carapace (TL13)',
    category: 'armor',
    tl: 13,
    protection: 16,
    rad: 0,
    mass_kg: 2,
    cost: 35000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'Cutting-edge poly carapace offering exceptional protection without movement restriction. The most advanced non-powered personal body armour available on the open market.',
  },

  // ── Archaic Armour (CSC) ─────────────────────────────────────────
  // Against ranged weapons of a higher Tech Level, all archaic armour halves its Protection (rounding up).
  {
    id: 'breastplate',
    name: 'Breastplate',
    category: 'armor',
    tl: 1,
    protection: 3,
    rad: 0,
    mass_kg: 5,
    cost: 200,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A metal breastplate covering the front and back of the torso. Decent protection against hand weapons and archaic projectiles; less useful against firearms. Against ranged weapons of a higher Tech Level, Protection is halved (rounding up).',
  },
  {
    id: 'full-plate',
    name: 'Full Plate',
    category: 'armor',
    tl: 2,
    protection: 6,
    rad: 0,
    mass_kg: 20,
    cost: 1000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A complete suit of shaped and fitted metal plates covering the entire body, including gauntlets, heavy leather boots, and a helmet. Imposes DM-2 on all physical activity checks (no penalty to close combat attacks). Against ranged weapons of a higher Tech Level, Protection is halved (rounding up).',
  },
  {
    id: 'half-plate',
    name: 'Half-Plate',
    category: 'armor',
    tl: 2,
    protection: 5,
    rad: 0,
    mass_kg: 12,
    cost: 800,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'Favoured by heavy cavalry, half-plate consists of articulated plates backed by light mail and padding. Against ranged weapons of a higher Tech Level, Protection is halved (rounding up).',
  },
  {
    id: 'mail-hauberk',
    name: 'Mail Hauberk',
    category: 'armor',
    tl: 2,
    protection: 4,
    rad: 0,
    mass_kg: 8,
    cost: 500,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: false,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A knee-length coat of interlocking metal rings set on a leather backing. Excellent protection against hand weapons, used mainly by heavy infantry and cavalry. Scale mail (small plates rather than rings) is a variation offering similar protection. Against ranged weapons of a higher Tech Level, Protection is halved (rounding up).',
  },

  // ── Anti-Energy Armour (CSC) ─────────────────────────────────────
  // Unless otherwise stated, can be worn over other armour (only one additional type at a time).
  {
    id: 'conduit-bleed',
    name: 'Conduit-Bleed',
    category: 'armor',
    tl: 14,
    protection: 4,
    rad: 0,
    mass_kg: 8,
    cost: 3500,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    plasmaProtection: 15,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A dense suit of polymer-alloy mixtures designed to supercool plasma energy. Provides solid physical protection and dramatically reduces damage from directed plasma energy. Can be worn over other types of armour (only one additional type at a time).',
  },
  {
    id: 'dispersion',
    name: 'Dispersion',
    category: 'armor',
    tl: 12,
    protection: 2,
    rad: 0,
    mass_kg: 3,
    cost: 2000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    energyProtection: 10,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A semi-metallic polymer wrapping the Traveller in advanced energy-dispersion materials. Not as physically protective as anti-ballistic cloth, but built to absorb and eliminate most wavelengths of energy that strikes it. Can be worn over other armour (only one additional type at a time).',
  },
  {
    id: 'fireproof-suit',
    name: 'Fireproof Suit',
    category: 'armor',
    tl: 7,
    protection: 0,
    rad: 0,
    mass_kg: 1,
    cost: 50,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    energyProtection: 4,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A complete body suit of light flexible material designed to resist heat and shed burning chemicals, similar to suits worn by racing drivers. No value against any weapons other than lasers, energy weapons and fire. Can be worn over other armour (only one additional type at a time).',
  },
  {
    id: 'neural-sheath',
    name: 'Neural Sheath',
    category: 'armor',
    tl: 17,
    protection: 0,
    rad: 0,
    mass_kg: 2,
    cost: 80000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    psionicProtection: 20,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'Cloth weaved with thin-spun chains of advanced neural crystals. Worthless against physical damage but immensely useful against blocking energies created and manipulated by psions. Extremely thin and lightweight; can be worn beneath any other armour or clothing. Protects against all damage originating from neural or psionic powers, weaponry or attacks.',
  },

  // ── Non-Powered Suits (CSC) ──────────────────────────────────────
  {
    id: 'boarding-vacc-suit-tl11',
    name: 'Boarding Vacc Suit (TL11)',
    category: 'armor',
    tl: 11,
    protection: 11,
    rad: 50,
    mass_kg: 25,
    cost: 18000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'An armoured suit hardened to the dangers of vacuum or hostile environments, originally used to battle pirates when life support failed during an attack. Sometimes has a melee weapon/pistol combination grafted to the cuffs.',
  },
  {
    id: 'boarding-vacc-suit-tl12',
    name: 'Boarding Vacc Suit (TL12)',
    category: 'armor',
    tl: 12,
    protection: 13,
    rad: 75,
    mass_kg: 12,
    cost: 24000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'An improved boarding vacc suit using advanced materials that are thinner and sturdier. As technology improves these suits are revolutionising their use in ship-to-ship combat. Sometimes has a melee weapon/pistol combination grafted to the cuffs.',
  },
  {
    id: 'ceramic-combat-armour',
    name: 'Ceramic Combat Armour',
    category: 'armor',
    tl: 13,
    protection: 12,
    rad: 150,
    mass_kg: 15,
    cost: 300000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    energyProtection: 18,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'A heavy suit of advanced materials with overlapping ceramic alloy plates and integrated helmet granting extreme durability. Provides six hours of complete environmental sealing. The ceramic alloy grants dramatically higher protection (+18) against lasers, flamethrowers and other energy-based attacks.',
  },
  {
    id: 'combat-environment-suit',
    name: 'Combat Environment Suit',
    category: 'armor',
    tl: 10,
    protection: 8,
    rad: 20,
    mass_kg: 2,
    cost: 1000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A neck-to-toe airtight suit of ballistic cloth. Can be sealed by donning gauntlets and a clear flexible plastic hood, giving complete protection against chemical agents, tainted atmospheres and biological agents. Supports the user in very thin atmospheres; will fail in Trace atmosphere (D3 hours) or vacuum (D3×10 minutes). Electronics suite not included.',
  },
  {
    id: 'emergency-hev-suit',
    name: 'Emergency Hostile Environment Suit',
    category: 'armor',
    tl: 10,
    protection: 4,
    rad: 0,
    mass_kg: 20,
    cost: 9000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'A disposable emergency vacc suit for corrosive, insidious and hazardous atmospheres (and vacuum). Good for 6–8 hours, after which there is a 1-in-6 (non-cumulative) chance of failure each hour. Can be refurbished for Cr6000, but each refurbishment worsens the failure chance and reduces safe duration. Electronics suite not included.',
  },
  {
    id: 'emergency-softsuit',
    name: 'Emergency Softsuit',
    category: 'armor',
    tl: 10,
    protection: 0,
    rad: 0,
    mass_kg: 10,
    cost: 2000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'A disposable emergency vacc suit with gloves and a soft collapsible bubble helmet. Offers no protection against hostile environments or attack — only against vacuum and non-corrosive atmospheres. Includes a 4-hour air bottle that can be plugged into shipboard life support. Provides no radiation protection; a poor choice for EVA or repair work. Electronics suite not included.',
  },
  {
    id: 'eod-suit',
    name: 'Explosive Ordnance Disposal Suit',
    category: 'armor',
    tl: 8,
    protection: 12,
    rad: 0,
    mass_kg: 35,
    cost: 8000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'Very heavily armoured suit designed to mitigate the worst effects of an explosion at extremely close ranges. Fine dexterity is retained (hands have freedom of action) but other movements are difficult. The Traveller\'s speed is halved and all physical actions not requiring manual dexterity alone suffer a Bane.',
  },
  {
    id: 'hev-suit-tl11',
    name: 'HEV Suit (TL11)',
    category: 'armor',
    tl: 11,
    protection: 12,
    rad: 140,
    mass_kg: 13,
    cost: 22000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'An improved hostile environment suit with significantly better radiation protection and reduced weight. Designed for deep underwater, toxic atmospheres, extreme radiation or temperature. Provides life support for six hours.',
  },
  {
    id: 'psi-enhanced-combat-armour',
    name: 'Psi-Enhanced Combat Armour',
    category: 'armor',
    tl: 16,
    protection: 15,
    rad: 250,
    mass_kg: 10,
    cost: 500000,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'Advanced combat armour rigged with a latticework of neural crystals that draws from the Traveller\'s natural psionic strength to create invisible reinforcement. Has an 8-hour air supply when sealed. The Traveller adds half their PSI characteristic (round down) to the Protection score of the armour while worn.',
  },
  {
    id: 'pressure-sleeve',
    name: 'Pressure Sleeve',
    category: 'armor',
    tl: 10,
    protection: 0,
    rad: 0,
    mass_kg: 0,
    cost: 600,
    requiredSkill: undefined,
    requiredSkillLevel: undefined,
    isFullBodySuit: true,
    hasLifeSupport: false,
    isPowered: false,
    description: 'A form-fitting under-garment similar to a wetsuit. Allows normal function in Very Thin and Trace atmospheres, and gives survival margin against vacuum (~15 min Trace, ~5 min hard vacuum). Requires a life-support mask (not included). Can be worn under a vacc suit. Electronics suite not included.',
  },
  {
    id: 'rescue-suit',
    name: 'Rescue Suit',
    category: 'armor',
    tl: 12,
    protection: 12,
    rad: 120,
    mass_kg: 22,
    cost: 25000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: false,
    description: 'A heavy vacc suit designed for emergency situations such as damage control or entering a damaged spacecraft. Very tough; some models are sold as boarding suits. Carries oxygen tanks with a six-hour capacity and a variety of emergency tools. Mainly designed to protect against physical hazards like torn wreckage and debris, plus radiation.',
  },

  // ── Powered Armour (CSC) ─────────────────────────────────────────
  // While powered and active, the suit's mass does not count against encumbrance.
  // When unpowered: mass counts normally, STR bonus is lost, and any DEX penalty is doubled.
  // All powered armour comes equipped with the electronics suite appropriate to its Tech Level.
  {
    id: 'mechanical-carapace-tl9',
    name: 'Mechanical Carapace (TL9)',
    category: 'armor',
    tl: 9,
    protection: 8,
    rad: 30,
    mass_kg: 30,
    cost: 15000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 2,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: true,
    description: 'A suit of sealed carapace plates on a simple framework of mechanical ratchets and pneumatics. Fuelled for up to 10 hours (Cr25 to refuel). While active: STR +1, DEX -1. When unpowered: STR bonus lost, DEX -2.',
  },
  {
    id: 'mechanical-carapace-tl12',
    name: 'Mechanical Carapace (TL12)',
    category: 'armor',
    tl: 12,
    protection: 10,
    rad: 60,
    mass_kg: 25,
    cost: 30000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: true,
    description: 'An improved mechanical carapace using advanced materials for better protection at reduced weight. Fuelled for up to 10 hours (Cr25 to refuel). While active: STR +1, DEX -1. When unpowered: STR bonus lost, DEX -2.',
  },
  {
    id: 'powered-plate-tl10',
    name: 'Powered Plate (TL10)',
    category: 'armor',
    tl: 10,
    protection: 14,
    rad: 120,
    mass_kg: 40,
    cost: 50000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: true,
    description: 'A large and bulky suit of insulated powered armour made up of metallic plates forming a complete body shell. 100-hour power cell (Cr250 to replace). While active: STR +2, DEX -2. When unpowered: STR bonus lost, DEX -4.',
  },
  {
    id: 'powered-plate-tl14',
    name: 'Powered Plate (TL14)',
    category: 'armor',
    tl: 14,
    protection: 18,
    rad: 200,
    mass_kg: 30,
    cost: 85000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: true,
    description: 'A refined powered plate suit with a 200-hour power cell (Cr250 to replace). While active: STR +3, DEX -1. When unpowered: STR bonus lost, DEX -2.',
  },
  {
    id: 'ceramic-powered-plate',
    name: 'Ceramic Powered Plate',
    category: 'armor',
    tl: 13,
    protection: 16,
    rad: 175,
    mass_kg: 35,
    cost: 90000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 1,
    energyProtection: 20,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: true,
    description: 'An advanced powered plate of ceramic-metal hybrid alloys giving higher protection against lasers, flamethrowers and heat/fire-based attacks (+20 vs fire, lasers & energy). 85-hour power cell (Cr250 to replace). While active: STR +2, DEX -2. When unpowered: STR bonus lost, DEX -4.',
  },
  {
    id: 'grav-enhanced-powered-plate',
    name: 'Grav-Enhanced Powered Plate',
    category: 'armor',
    tl: 15,
    protection: 20,
    rad: 220,
    mass_kg: 32,
    cost: 120000,
    requiredSkill: 'Vacc Suit',
    requiredSkillLevel: 0,
    isFullBodySuit: true,
    hasLifeSupport: true,
    isPowered: true,
    description: 'Powered plate with gravitic gyros in its limbs and torso. 500-hour power cell (Cr750 to replace). While active: STR +3, no DEX penalty, +50% movement speed. When unpowered: STR bonus lost, DEX -1.',
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

  // ── CSC Modifications ─────────────────────────────────────────────
  {
    id: 'additional-padding',
    name: 'Additional Padding',
    description: 'Layers of furs, cotton and hides added onto existing armour. Somewhat hinders movement but improves protection from physical attacks. Imposes DM-1 to all checks involving DEX, but adds +1 to the armour\'s Protection.',
    variants: [
      {
        tl: 1,
        cost: 50,
        effect: 'Protection +1; DM-1 to all DEX checks',
      },
    ],
  },
  {
    id: 'camouflage',
    name: 'Camouflage',
    description: 'Natural or artificial material that breaks up distinctive outlines of the Traveller or equipment. Grants DM+2 to Stealth checks made against visual searches. Defeated by infrared and other sensors operating beyond the visual spectrum.',
    variants: [
      {
        tl: 3,
        cost: 25,
        effect: 'DM+2 to Stealth vs visual searches (defeated by IR/sensors)',
      },
    ],
  },
  {
    id: 'coolant-rig',
    name: 'Coolant Rig',
    description: 'A web of tubing filled with chemical coolant that makes wearing heavy armour in hot environments comfortable and tolerable. Allows the Traveller to comfortably endure temperatures up to 50°C without suffering damage.',
    variants: [
      {
        tl: 8,
        cost: 100,
        effect: 'No damage from temperatures up to 50°C',
      },
    ],
  },
  {
    id: 'environment-reader',
    name: 'Environment Reader',
    description: 'An external colour-changing sensor adhered where the Traveller can see it. Displays atmospheric status in hues: green (oxygen), blue (methane), red (radiation), black (airborne toxins).',
    variants: [
      {
        tl: 8,
        cost: 100,
        effect: 'Real-time atmospheric status display (O₂, methane, radiation, toxins)',
      },
    ],
  },
  {
    id: 'friend-or-foe-hud',
    name: 'Friend or Foe HUD',
    description: 'Scanners and cameras implanted in the armour track registered friendly transponders and mark targets without transponders as potential enemies on a visor-based HUD. Shows exact locations of allies and enemies within line of sight or up to 1km. Grants DM+1 to Tactics (military) checks. Extra transponders cost Cr100 for 20 units.',
    variants: [
      {
        tl: 11,
        cost: 4000,
        effect: 'Tracks allies/enemies via HUD; DM+1 to Tactics (military)',
      },
    ],
  },
  {
    id: 'gyro-stabilizer-rig',
    name: 'Gyro-Stabilizer Rig',
    description: 'A localised motion-pivot at the waist that counters the effects of weapon recoil. Requires an Average (8+) Mechanics check (1D minutes, EDU) to attach to a heavy weapon or rifle. Removes all penalties for Bulky weapons. The TL14 version also removes penalties for Very Bulky weapons.',
    variants: [
      {
        tl: 12,
        cost: 10000,
        effect: 'Removes Bulky weapon penalties',
      },
      {
        tl: 14,
        cost: 50000,
        effect: 'Removes Bulky and Very Bulky weapon penalties',
      },
    ],
  },
  {
    id: 'minefield-boots',
    name: 'Minefield Boots',
    description: 'Used by troops in regions with risk from anti-personnel mines and booby traps. Gives complete protection against routine hazards such as snakes, and grants +4 Protection against sharpened stakes and anti-personnel mines. No additional protection against combat hazards unless shot deliberately in the foot.',
    variants: [
      {
        tl: 8,
        cost: 250,
        effect: '+4 Protection vs mines and sharpened stakes; immune to snakes',
      },
    ],
  },
  {
    id: 'null-shield',
    name: 'Null Shield',
    description: 'An expensive and rare modification that coats the armour with substances similar to those found in anti-psion ammunition and psi-sedatives. Grants the Traveller complete immunity to any psionic power targeting them.',
    variants: [
      {
        tl: 17,
        cost: 150000,
        effect: 'Complete immunity to psionic powers targeting the Traveller',
      },
    ],
  },
  {
    id: 'personalised-image',
    name: 'Personalised Image',
    description: 'Using hardened enamels and pigments, any armour can be artistically altered to reflect the individuality of the Traveller, a military affiliation, or other associations.',
    variants: [
      {
        tl: 2,
        cost: 10,
        effect: 'Custom artistic livery (cosmetic only)',
      },
    ],
  },
  {
    id: 'psionic-shield-helmet',
    name: 'Psionic Shield Helmet',
    description: 'Can be built into existing armour or worn as a separate unit. Acts as a shield against psionic influences, automatically blocking all telepathy powers.',
    variants: [
      {
        tl: 12,
        cost: 4000,
        effect: 'Automatically blocks all telepathy powers',
      },
    ],
  },
  {
    id: 'submarine-functionality',
    name: 'Submarine Functionality',
    description: 'Only available on sealed armours (vacc suits, combat armour, powered armour). Adds oxygenators, pressure valves, flow venting fins and small turbines. Allows the suit to completely ignore penalties for being submerged for as long as it has life support. Cost is Cr200 × the armour\'s Protection value.',
    variants: [
      {
        tl: 9,
        cost: 0, // Variable: Cr200 × armour Protection value
        effect: 'Ignore all submersion penalties while life support active (cost = Cr200 × Protection)',
        compatibleWith: undefined, // Sealed armours only — enforced by hasLifeSupport check
      },
    ],
  },
  {
    id: 'tactical-video-suite',
    name: 'Tactical Video Suite',
    description: 'Small cameras and microphones attached to high-visibility areas of armour or clothing. Monitors and records everything for later viewing on a 10-hour hard drive. Can be rigged to transmit in real-time to a command hub, granting DM+1 to Tactics (military) checks made by viewers. Real-time transmission version costs Cr25 extra.',
    variants: [
      {
        tl: 7,
        cost: 75,
        effect: '10-hour recording; optional real-time broadcast (+Cr25) grants DM+1 to Tactics (military)',
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

  // Extended life support and submarine functionality require sealed life support
  if (option.id === 'extended-life-support' || option.id === 'submarine-functionality') {
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
 * Handles special cases like Reflec/Ablat (laser), Dispersion (energy),
 * Conduit-Bleed (plasma), Neural Sheath (psionics), and Ceramic armour (fire/energy).
 */
export function formatProtection(armor: ArmorCatalogItem): string {
  const specials: string[] = [];

  if (armor.laserProtection) {
    specials.push(`+${armor.laserProtection} vs lasers`);
  }
  if (armor.energyProtection) {
    specials.push(`+${armor.energyProtection} vs fire, lasers & energy`);
  }
  if (armor.plasmaProtection) {
    specials.push(`+${armor.plasmaProtection} vs plasma`);
  }
  if (armor.psionicProtection) {
    specials.push(`+${armor.psionicProtection} vs psionics`);
  }

  if (specials.length === 0) {
    return `+${armor.protection}`;
  }
  if (armor.protection === 0) {
    return `+0 (${specials.join(', ')})`;
  }
  return `+${armor.protection} (${specials.join(', ')})`;
}

/**
 * Format required skill for display.
 */
export function formatRequiredSkill(armor: ArmorCatalogItem): string {
  if (!armor.requiredSkill) return 'None';
  return `${armor.requiredSkill} ${armor.requiredSkillLevel}`;
}
