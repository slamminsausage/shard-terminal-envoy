/**
 * Traveller Trade Goods Data
 * Based on the Traveller RPG trade and speculation rules
 */

export interface TradeGoodType {
  id: string;
  name: string;
  basePrice: number; // Credits per ton
  purchaseDMs: Record<string, number>; // Trade code -> DM for purchasing
  saleDMs: Record<string, number>; // Trade code -> DM for selling
  availability: number; // 2d6 roll needed for availability
  illegal?: boolean;
  description?: string;
}

// Trade Code descriptions for reference
export const TRADE_CODES: Record<string, string> = {
  Ag: 'Agricultural',
  As: 'Asteroid',
  Ba: 'Barren',
  De: 'Desert',
  Fl: 'Fluid Oceans',
  Ga: 'Garden',
  Hi: 'High Population',
  Ht: 'High Tech',
  IC: 'Ice-Capped',
  In: 'Industrial',
  Lo: 'Low Population',
  Lt: 'Low Tech',
  Na: 'Non-Agricultural',
  NI: 'Non-Industrial',
  Po: 'Poor',
  Ri: 'Rich',
  Va: 'Vacuum',
  Wa: 'Water World',
  A: 'Amber Zone',
  R: 'Red Zone',
};

// Standard Traveller trade goods
export const TRADE_GOODS: TradeGoodType[] = [
  // Common Electronics
  {
    id: 'common-electronics',
    name: 'Common Electronics',
    basePrice: 20000,
    availability: 2,
    purchaseDMs: { In: 2, Ht: 3, Ri: 1 },
    saleDMs: { NI: 2, Lt: 1, Po: 1 },
    description: 'Consumer electronics, communicators, basic computers',
  },
  // Common Industrial Goods
  {
    id: 'common-industrial',
    name: 'Common Industrial Goods',
    basePrice: 10000,
    availability: 2,
    purchaseDMs: { In: 2, Na: 1 },
    saleDMs: { NI: 2, Ag: 1 },
    description: 'Machinery parts, tools, industrial equipment',
  },
  // Common Manufactured Goods
  {
    id: 'common-manufactured',
    name: 'Common Manufactured Goods',
    basePrice: 20000,
    availability: 2,
    purchaseDMs: { In: 2, Na: 1 },
    saleDMs: { NI: 3, Hi: 2 },
    description: 'Household goods, appliances, furniture',
  },
  // Common Raw Materials
  {
    id: 'common-raw',
    name: 'Common Raw Materials',
    basePrice: 5000,
    availability: 2,
    purchaseDMs: { Ag: 3, Ga: 2 },
    saleDMs: { In: 2, Po: 2 },
    description: 'Bulk minerals, unprocessed ore, raw lumber',
  },
  // Common Consumables
  {
    id: 'common-consumables',
    name: 'Common Consumables',
    basePrice: 10000,
    availability: 2,
    purchaseDMs: { Ag: 3, Wa: 2, Ga: 1 },
    saleDMs: { As: 1, De: 1, Va: 1, Hi: 1 },
    description: 'Food, beverages, basic supplies',
  },
  // Common Ore
  {
    id: 'common-ore',
    name: 'Common Ore',
    basePrice: 1000,
    availability: 2,
    purchaseDMs: { As: 4, IC: 0 },
    saleDMs: { In: 3, NI: 1 },
    description: 'Iron, copper, nickel ores',
  },
  // Advanced Electronics
  {
    id: 'advanced-electronics',
    name: 'Advanced Electronics',
    basePrice: 100000,
    availability: 6,
    purchaseDMs: { In: 2, Ht: 3 },
    saleDMs: { NI: 1, Lt: 2, Po: 1 },
    description: 'Advanced computers, sensors, military-grade electronics',
  },
  // Advanced Machine Parts
  {
    id: 'advanced-machine-parts',
    name: 'Advanced Machine Parts',
    basePrice: 75000,
    availability: 6,
    purchaseDMs: { In: 2, Ht: 1 },
    saleDMs: { As: 2, NI: 1 },
    description: 'Precision components, high-tech machinery',
  },
  // Advanced Manufactured Goods
  {
    id: 'advanced-manufactured',
    name: 'Advanced Manufactured Goods',
    basePrice: 100000,
    availability: 6,
    purchaseDMs: { In: 1, Ht: 0 },
    saleDMs: { Hi: 1, Ri: 2 },
    description: 'Luxury items, specialized equipment',
  },
  // Advanced Weapons
  {
    id: 'advanced-weapons',
    name: 'Advanced Weapons',
    basePrice: 150000,
    availability: 8,
    purchaseDMs: { Ht: 2, In: 0 },
    saleDMs: { Po: 1, A: 2, R: 3 },
    description: 'Military-grade arms and ammunition',
    illegal: true,
  },
  // Advanced Vehicles
  {
    id: 'advanced-vehicles',
    name: 'Advanced Vehicles',
    basePrice: 180000,
    availability: 8,
    purchaseDMs: { Ht: 2, In: 1 },
    saleDMs: { As: 2, Ri: 0 },
    description: 'Specialized vehicles, aircraft parts',
  },
  // Biochemicals
  {
    id: 'biochemicals',
    name: 'Biochemicals',
    basePrice: 50000,
    availability: 6,
    purchaseDMs: { Ag: 1, Wa: 2 },
    saleDMs: { In: 2 },
    description: 'Industrial chemicals, fertilizers, pharmaceuticals',
  },
  // Crystals & Gems
  {
    id: 'crystals-gems',
    name: 'Crystals & Gems',
    basePrice: 20000,
    availability: 8,
    purchaseDMs: { As: 2, De: 1, IC: 1 },
    saleDMs: { In: 2, Ri: 3 },
    description: 'Precious and industrial crystals, gemstones',
  },
  // Cybernetics
  {
    id: 'cybernetics',
    name: 'Cybernetics',
    basePrice: 250000,
    availability: 10,
    purchaseDMs: { Ht: 1 },
    saleDMs: { As: 1, IC: 1, Ri: 2 },
    description: 'Cybernetic implants and prosthetics',
  },
  // Live Animals
  {
    id: 'live-animals',
    name: 'Live Animals',
    basePrice: 10000,
    availability: 6,
    purchaseDMs: { Ag: 2 },
    saleDMs: { Lo: 3 },
    description: 'Livestock, exotic animals, lab specimens',
  },
  // Luxury Consumables
  {
    id: 'luxury-consumables',
    name: 'Luxury Consumables',
    basePrice: 20000,
    availability: 6,
    purchaseDMs: { Ag: 2, Wa: 1 },
    saleDMs: { Ri: 2, Hi: 2 },
    description: 'Fine foods, wines, exotic delicacies',
  },
  // Luxury Goods
  {
    id: 'luxury-goods',
    name: 'Luxury Goods',
    basePrice: 200000,
    availability: 10,
    purchaseDMs: { Hi: 0, Ri: 0 },
    saleDMs: { Ri: 4 },
    description: 'Art, antiques, jewelry, haute couture',
  },
  // Medical Supplies
  {
    id: 'medical-supplies',
    name: 'Medical Supplies',
    basePrice: 50000,
    availability: 6,
    purchaseDMs: { Ht: 2 },
    saleDMs: { In: 2, Po: 2, Ri: 1 },
    description: 'Pharmaceuticals, medical equipment, biotech',
  },
  // Petrochemicals
  {
    id: 'petrochemicals',
    name: 'Petrochemicals',
    basePrice: 10000,
    availability: 4,
    purchaseDMs: { De: 2, Fl: 0, IC: 2, Wa: 0 },
    saleDMs: { In: 2, Ag: 1, Lo: 2 },
    description: 'Plastics, fuels, synthetic materials',
  },
  // Pharmaceuticals
  {
    id: 'pharmaceuticals',
    name: 'Pharmaceuticals',
    basePrice: 100000,
    availability: 8,
    purchaseDMs: { As: 2, Hi: 1, Wa: 0 },
    saleDMs: { Ri: 2, Lo: 1 },
    description: 'Advanced drugs, anagathics, combat drugs',
  },
  // Polymers
  {
    id: 'polymers',
    name: 'Polymers',
    basePrice: 7000,
    availability: 4,
    purchaseDMs: { In: 2 },
    saleDMs: { Ri: 2, NI: 1 },
    description: 'Plastics, synthetic fabrics, composites',
  },
  // Precious Metals
  {
    id: 'precious-metals',
    name: 'Precious Metals',
    basePrice: 50000,
    availability: 8,
    purchaseDMs: { As: 3, De: 1, IC: 2 },
    saleDMs: { Ri: 3, In: 2, Ht: 1 },
    description: 'Gold, platinum, rare earth elements',
  },
  // Radioactives
  {
    id: 'radioactives',
    name: 'Radioactives',
    basePrice: 1000000,
    availability: 12,
    purchaseDMs: { As: 2, Lo: -4 },
    saleDMs: { In: 3, Ht: 1, NI: -4 },
    description: 'Uranium, plutonium, refined radioactive materials',
    illegal: true,
  },
  // Robots
  {
    id: 'robots',
    name: 'Robots',
    basePrice: 400000,
    availability: 10,
    purchaseDMs: { In: 0 },
    saleDMs: { Ag: 2, NI: 1 },
    description: 'Industrial robots, androids, drones',
  },
  // Spices
  {
    id: 'spices',
    name: 'Spices',
    basePrice: 6000,
    availability: 4,
    purchaseDMs: { De: 2, Ga: 0 },
    saleDMs: { Hi: 2, Ri: 3, Po: 3 },
    description: 'Exotic spices, flavorings, preservatives',
  },
  // Textiles
  {
    id: 'textiles',
    name: 'Textiles',
    basePrice: 3000,
    availability: 2,
    purchaseDMs: { Ag: 7, NI: 0 },
    saleDMs: { Hi: 3, Na: 2 },
    description: 'Fabrics, clothing materials, fibers',
  },
  // Uncommon Ore
  {
    id: 'uncommon-ore',
    name: 'Uncommon Ore',
    basePrice: 5000,
    availability: 6,
    purchaseDMs: { As: 4, IC: 0 },
    saleDMs: { In: 3, NI: 1 },
    description: 'Rare minerals, titanium, tungsten',
  },
  // Uncommon Raw Materials
  {
    id: 'uncommon-raw',
    name: 'Uncommon Raw Materials',
    basePrice: 20000,
    availability: 6,
    purchaseDMs: { Ag: 2, Wa: 1 },
    saleDMs: { In: 2, Ht: 1 },
    description: 'Exotic woods, rare organic compounds',
  },
  // Wood
  {
    id: 'wood',
    name: 'Wood',
    basePrice: 1000,
    availability: 2,
    purchaseDMs: { Ag: 6, Ga: 0 },
    saleDMs: { As: 2, Na: 1 },
    description: 'Lumber, timber, processed wood products',
  },
  // Illegal Goods
  {
    id: 'illegal-drugs',
    name: 'Illegal Drugs',
    basePrice: 100000,
    availability: 10,
    purchaseDMs: { Wa: 0, As: 1, De: 1 },
    saleDMs: { Ri: 3, Hi: 2 },
    description: 'Controlled substances, recreational drugs',
    illegal: true,
  },
  {
    id: 'illegal-luxuries',
    name: 'Illegal Luxuries',
    basePrice: 50000,
    availability: 8,
    purchaseDMs: { Ag: 2, Ga: 1, Wa: 1 },
    saleDMs: { Ri: 4, Hi: 2 },
    description: 'Banned items, black market luxury goods',
    illegal: true,
  },
  {
    id: 'illegal-weapons',
    name: 'Illegal Weapons',
    basePrice: 150000,
    availability: 10,
    purchaseDMs: { Ht: 2, In: 1 },
    saleDMs: { Po: 3, A: 3, R: 4 },
    description: 'Banned weapons, explosives, WMD components',
    illegal: true,
  },
];

// Price modifier table based on 2d6 roll
export const PRICE_MODIFIERS: { roll: number; purchaseMod: number; saleMod: number }[] = [
  { roll: 2, purchaseMod: -40, saleMod: -40 }, // Exceptional deal / terrible market
  { roll: 3, purchaseMod: -30, saleMod: -30 },
  { roll: 4, purchaseMod: -20, saleMod: -20 },
  { roll: 5, purchaseMod: -15, saleMod: -15 },
  { roll: 6, purchaseMod: -10, saleMod: -10 },
  { roll: 7, purchaseMod: 0, saleMod: 0 },    // Base price
  { roll: 8, purchaseMod: 10, saleMod: 10 },
  { roll: 9, purchaseMod: 15, saleMod: 15 },
  { roll: 10, purchaseMod: 20, saleMod: 20 },
  { roll: 11, purchaseMod: 30, saleMod: 30 },
  { roll: 12, purchaseMod: 40, saleMod: 40 },
  { roll: 13, purchaseMod: 55, saleMod: 55 }, // With high DMs
  { roll: 14, purchaseMod: 70, saleMod: 70 },
  { roll: 15, purchaseMod: 100, saleMod: 100 },
  { roll: 16, purchaseMod: 150, saleMod: 150 },
  { roll: 17, purchaseMod: 200, saleMod: 200 },
  { roll: 18, purchaseMod: 300, saleMod: 300 },
  { roll: 19, purchaseMod: 400, saleMod: 400 },
];

/**
 * Get the price modifier percentage for a given modified roll
 */
export function getPriceModifier(roll: number, isSale: boolean): number {
  // Clamp roll to valid range
  const clampedRoll = Math.max(2, Math.min(roll, 19));
  const entry = PRICE_MODIFIERS.find(m => m.roll === clampedRoll) || { purchaseMod: 0, saleMod: 0 };
  return isSale ? entry.saleMod : entry.purchaseMod;
}

/**
 * Calculate actual price based on base price and modifier
 */
export function calculateActualPrice(basePrice: number, modifierPercent: number): number {
  // For purchases, lower is better (negative modifier reduces price)
  // For sales, higher is better (positive modifier increases price)
  return Math.round(basePrice * (100 + modifierPercent) / 100);
}

/**
 * Get total DM for a good based on world trade codes
 */
export function getTradeCodeDM(good: TradeGoodType, worldTradeCodes: string[], isSale: boolean): number {
  const dms = isSale ? good.saleDMs : good.purchaseDMs;
  let totalDM = 0;

  for (const code of worldTradeCodes) {
    if (dms[code] !== undefined) {
      totalDM += dms[code];
    }
  }

  return totalDM;
}

/**
 * Calculate tons available based on population modifier
 * Uses 1d6 * multiplier based on population
 */
export function calculateTonsAvailable(populationCode: number): number {
  const roll = Math.floor(Math.random() * 6) + 1;

  // Multiplier based on population
  const multipliers: Record<number, number> = {
    0: 0,      // Unpopulated
    1: 1,
    2: 1,
    3: 5,
    4: 5,
    5: 10,
    6: 20,
    7: 50,
    8: 100,
    9: 500,
    10: 1000, // High population
  };

  const multiplier = multipliers[Math.min(populationCode, 10)] || 10;
  return roll * multiplier;
}

// Export trade codes for UI display
export function getTradeCodeName(code: string): string {
  return TRADE_CODES[code] || code;
}
