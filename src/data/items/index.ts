/**
 * Item Catalog - Central export for all Traveller equipment data.
 *
 * Usage:
 *   import { ARMOR_CATALOG, WEAPON_CATALOG, AUGMENT_CATALOG } from '@/data/items';
 */

// Types
export type {
  ItemCategory,
  CatalogItem,
  ArmorCatalogItem,
  ArmorOption,
  ArmorOptionVariant,
  WeaponCatalogItem,
  WeaponType,
  WeaponOption,
  WeaponOptionVariant,
  EquipmentCatalogItem,
  EquipmentCategory,
  AugmentCatalogItem,
  AugmentType,
  EquippedArmor,
  EquippedWeapon,
  EquippedAugment,
  EquippedItem,
  AnyCatalogItem,
} from './types';

export { WEAPON_TYPE_LABELS, AUGMENT_TYPE_LABELS } from './types';

// Armor data + utilities
export {
  ARMOR_CATALOG,
  ARMOR_OPTIONS,
  getArmorById,
  getArmorOptionById,
  isOptionCompatible,
  getCompatibleOptions,
  calculateArmorCost,
  getEffectiveMass,
  formatProtection,
  formatRequiredSkill,
} from './armor';

// Weapon data + utilities
export {
  MELEE_WEAPONS,
  SLUG_PISTOLS,
  SLUG_RIFLES,
  ENERGY_PISTOLS,
  ENERGY_RIFLES,
  GRENADES,
  HEAVY_WEAPONS,
  EXPLOSIVES,
  WEAPON_CATALOG,
  WEAPON_OPTIONS,
  getWeaponById,
  getWeaponOptionById,
  getWeaponsByType,
  isWeaponOptionCompatible,
  getCompatibleWeaponOptions,
  calculateWeaponCost,
  formatDamage,
  formatMagazine,
  formatMagazineCost,
} from './weapons';

// Augment data + utilities
export {
  PHYSICAL_AUGMENTS,
  COGNITIVE_AUGMENTS,
  NEURAL_AUGMENTS,
  SENSORY_AUGMENTS,
  SKILL_AUGMENTS,
  PROTECTIVE_AUGMENTS,
  AUGMENT_CATALOG,
  getAugmentById,
  getAugmentsByType,
  calculateAugmentMedicalPenalty,
  getAugmentConflicts,
  formatAugmentCost,
} from './augments';

// Equipment data + utilities
export {
  COMMS_EQUIPMENT,
  COMPUTERS_EQUIPMENT,
  SOFTWARE_EQUIPMENT,
  MEDICAL_EQUIPMENT,
  SENSORS_EQUIPMENT,
  SURVIVAL_EQUIPMENT,
  TOOLS_EQUIPMENT,
  EQUIPMENT_CATALOG,
  getEquipmentById,
  getEquipmentByType,
} from './equipment';
