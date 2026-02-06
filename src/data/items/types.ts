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
  laserProtection?: number;  // Special protection vs lasers (Reflec, Ablat)
  isFullBodySuit: boolean;   // Determines compatibility with chameleon options
  hasLifeSupport: boolean;   // Vacc suit, HEV, combat armour, battle dress
  isPowered: boolean;        // Battle dress - mass doesn't count when worn
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
  /** Which armor types this can be added to. If empty/undefined, compatible with all. */
  compatibleWith?: string[];
  /** Which armor types this CANNOT be added to */
  incompatibleWith?: string[];
}

// ─── Weapon Types (for future use) ──────────────────────────────────

export type WeaponCategory = 'melee' | 'pistol' | 'rifle' | 'shotgun' | 'heavy' | 'launcher' | 'energy';

export interface WeaponCatalogItem extends CatalogItem {
  category: 'weapon';
  weaponType: WeaponCategory;
  damage: string;           // Dice expression e.g. "2d6", "3d6+2"
  range: string;            // Range band or meters
  magazine?: number;
  magazineCost?: number;
  traits: string[];         // e.g. ["Auto 3", "AP 5", "Bulky"]
  requiredSkill?: string;   // e.g. "Gun Combat (slug)" or "Melee (blade)"
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

// ─── Augment Types (for future use) ──────────────────────────────────

export interface AugmentCatalogItem extends CatalogItem {
  category: 'augment';
  improvement: string;      // What it does, e.g. "STR+2"
  slot?: string;            // Body location, e.g. "arm", "eye", "neural"
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
  currentAmmo?: number;
  condition: 'excellent' | 'good' | 'worn' | 'damaged' | 'broken';
  location: 'worn' | 'carried' | 'stowed';
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
