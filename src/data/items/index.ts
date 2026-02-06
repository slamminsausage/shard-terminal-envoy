/**
 * Item Catalog - Central export for all Traveller equipment data.
 *
 * Usage:
 *   import { ARMOR_CATALOG, ARMOR_OPTIONS, getArmorById } from '@/data/items';
 */

// Types
export type {
  ItemCategory,
  CatalogItem,
  ArmorCatalogItem,
  ArmorOption,
  ArmorOptionVariant,
  WeaponCatalogItem,
  WeaponCategory,
  EquipmentCatalogItem,
  EquipmentCategory,
  AugmentCatalogItem,
  EquippedArmor,
  EquippedWeapon,
  EquippedItem,
  AnyCatalogItem,
} from './types';

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
