/**
 * Shared type definitions for the Traveller item catalog system.
 *
 * These types define the structure for pre-built items that players
 * can select from dropdowns when equipping characters. Each category
 * (armor, weapons, equipment, augments) extends the base CatalogItem.
 */

// ─── Base Types ──────────────────────────────────────────────────────

export type ItemCategory = 'weapon' | 'armor' | 'equipment' | 'augment' | 'ammo';

export interface CatalogItem {
  id: string;
  name: string;
  category: ItemCategory;
  tl: number;
  mass_kg: number;
  cost: number;
  description?: string;
}

// ─── Armor Types ─────────────────────────────────────────────────────

export interface ArmorCatalogItem extends CatalogItem {
  category: 'armor';
  protection: number;
  rad: number;
  requiredSkill?: string;
  requiredSkillLevel?: number;
  laserProtection?: number;   // Special protection vs lasers (Reflec, Ablat)
  energyProtection?: number;  // Special protection vs fire/lasers/energy weapons (CSC)
  plasmaProtection?: number;  // Special protection vs plasma weapons (CSC)
  psionicProtection?: number; // Special protection vs psionic attacks (CSC)
  strBonus?: number;          // STR bonus when powered/active (positive = bonus)
  dexBonus?: number;          // DEX modifier when powered/active (positive = bonus, negative = penalty)
  equipmentSlots?: number;    // Battle dress equipment slots for modifications
  isBattleDress?: boolean;    // Distinguishes battle dress from other powered suits
  isFullBodySuit: boolean;    // Determines compatibility with chameleon options
  hasLifeSupport: boolean;    // Vacc suit, HEV, combat armour, battle dress
  isPowered: boolean;         // Mass doesn't count when worn (battle dress / powered plate)
}

/** An option/upgrade that can be added to armor */
export interface ArmorOption {
  id: string;
  name: string;
  description: string;
  variants: ArmorOptionVariant[];
}

/** A specific TL variant of an armor option */
export interface ArmorOptionVariant {
  tl: number;
  cost: number;
  effect: string;
  /** Equipment slots consumed on battle dress (undefined = not a BD modification) */
  slotsRequired?: number;
  /** Which armor types this can be added to. If empty/undefined, compatible with all. */
  compatibleWith?: string[];
  /** Which armor types this CANNOT be added to */
  incompatibleWith?: string[];
}

// ─── Weapon Types ────────────────────────────────────────────────────

/** Weapon subcategory for UI dropdown grouping */
export type WeaponType =
  | 'melee'
  | 'slug_pistol'
  | 'slug_rifle'
  | 'energy_pistol'
  | 'energy_rifle'
  | 'grenade'
  | 'heavy'
  | 'explosive'
  | 'archaic';   // Bows, crossbows, slings, and primitive throwing weapons

/** Human-readable labels for weapon type groups */
export const WEAPON_TYPE_LABELS: Record<WeaponType, string> = {
  melee: 'Melee Weapons',
  slug_pistol: 'Slug Pistols',
  slug_rifle: 'Slug Rifles',
  energy_pistol: 'Energy Pistols',
  energy_rifle: 'Energy Rifles',
  grenade: 'Grenades',
  heavy: 'Heavy Weapons',
  explosive: 'Explosives',
  archaic: 'Archaic Weapons',
};

export interface WeaponCatalogItem extends CatalogItem {
  category: 'weapon';
  weaponType: WeaponType;
  damage: string;           // Dice expression e.g. "2D", "3D-3", "1DD", "As grenade"
  range: string;            // "Melee" or distance in metres e.g. "200m"
  magazine?: number;        // Rounds per magazine. undefined = no magazine, -1 = unlimited
  magazineCost?: number;    // Cost per magazine/power pack reload
  traits: string[];         // e.g. ["Auto 3", "AP 5", "Bulky", "Stun"]
  requiredSkill?: string;   // e.g. "Gun Combat (slug)", "Melee", "Heavy Weapons (portable)"
}

/** An option/upgrade that can be added to weapons */
export interface WeaponOption {
  id: string;
  name: string;
  description: string;
  variants: WeaponOptionVariant[];
}

/** A specific TL variant of a weapon option */
export interface WeaponOptionVariant {
  tl: number;
  cost: number;
  effect: string;
  /** Which weapon types this can be added to. If empty/undefined, compatible with all. */
  compatibleWeaponTypes?: WeaponType[];
  /** Which specific weapon IDs this CANNOT be added to */
  incompatibleWith?: string[];
}

// ─── Equipment Types (for future use) ────────────────────────────────

export type EquipmentCategory =
  | 'survival'
  | 'electronics'
  | 'medical'
  | 'tools'
  | 'communications'
  | 'sensors'
  | 'software'
  | 'misc';

export interface EquipmentCatalogItem extends CatalogItem {
  category: 'equipment';
  equipmentType: EquipmentCategory;
  effect?: string;
}

// ─── Augment Types ───────────────────────────────────────────────────

/** Augment subcategory for UI dropdown grouping */
export type AugmentType =
  | 'physical'      // STR, DEX, END augmentations
  | 'cognitive'     // INT augmentation
  | 'neural'        // Neural Comm, Wafer Jack
  | 'sensory'       // Enhanced Vision, Ballistic Tracking Lenses
  | 'skill'         // Skill Augmentation
  | 'protective'    // Subdermal Armour
  | 'cyberlimb'     // Prosthetics, Combat Arms, Weapon Implants, Mobility systems
  | 'biotech'       // Biological augmentations: organ packages, symbiotes, muscular bridging
  | 'implant';      // Internal implants: power ports, auto-injectors, smuggling containers

/** Human-readable labels for augment type groups */
export const AUGMENT_TYPE_LABELS: Record<AugmentType, string> = {
  physical: 'Physical Augmentation',
  cognitive: 'Cognitive Augmentation',
  neural: 'Neural Implants',
  sensory: 'Sensory Augmentation',
  skill: 'Skill Augmentation',
  protective: 'Protective Augmentation',
  cyberlimb: 'Cyberlimbs & Prosthetics',
  biotech: 'Biotech Augmentation',
  implant: 'Internal Implants',
};

export interface AugmentCatalogItem extends CatalogItem {
  category: 'augment';
  augmentType: AugmentType;
  improvement: string;      // What it does, e.g. "STR +1", "Protection +3"
  slot?: string;            // Body location, e.g. "musculature", "eyes", "neural", "skeletal"
  stackable: boolean;       // Can multiple of this type be installed?
  installationTime: string; // Typical installation time, e.g. "1D weeks"
}

// ─── Equipped Item (what a character actually has) ────────────────────

/**
 * Represents an item equipped/owned by a character. This bridges
 * the catalog data with character-specific state (condition, options, etc.)
 */
export interface EquippedArmor {
  catalogId: string;         // References ArmorCatalogItem.id
  customName?: string;       // Override name (e.g. "Grandpa's Combat Armour")
  options: string[];         // IDs of ArmorOptionVariant applied
  condition: 'excellent' | 'good' | 'worn' | 'damaged' | 'broken';
  location: 'worn' | 'carried' | 'stowed';
  notes?: string;
}

export interface EquippedWeapon {
  catalogId: string;
  customName?: string;
  options: string[];          // IDs of WeaponOptionVariant applied
  currentAmmo?: number;
  condition: 'excellent' | 'good' | 'worn' | 'damaged' | 'broken';
  location: 'worn' | 'carried' | 'stowed';
  notes?: string;
}

export interface EquippedAugment {
  catalogId: string;
  customName?: string;
  skillName?: string;        // For Skill Augmentation: which skill it boosts
  condition: 'excellent' | 'good' | 'worn' | 'damaged' | 'broken';
  notes?: string;
}

export interface EquippedItem {
  catalogId: string;
  customName?: string;
  quantity: number;
  condition: 'excellent' | 'good' | 'worn' | 'damaged' | 'broken';
  location: 'worn' | 'carried' | 'stowed';
  notes?: string;
}

// ─── Utility Types ───────────────────────────────────────────────────

/** Union of all catalog item types for generic handling */
export type AnyCatalogItem =
  | ArmorCatalogItem
  | WeaponCatalogItem
  | EquipmentCatalogItem
  | AugmentCatalogItem;
