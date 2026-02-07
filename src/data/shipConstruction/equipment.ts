/**
 * Traveller Core Rulebook - Spacecraft Equipment
 *
 * Step 9 of spacecraft construction: optional systems, components & accessories.
 *
 * Each entry includes tonnage, cost, power and TL requirements as specified
 * in the core rulebook. Where tonnage/cost depends on hull size, formulas
 * are expressed via the tonnageMode/costMode fields.
 */

import type { SpacecraftEquipment } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  SPACECRAFT EQUIPMENT CATALOG
// ═══════════════════════════════════════════════════════════════════════

export const SPACECRAFT_EQUIPMENT: SpacecraftEquipment[] = [
  // ── Cargo & Operations ─────────────────────────────────────────────
  {
    id: 'aerofins',
    name: 'Aerofins',
    category: 'operations',
    tl: 8,
    description:
      'Extendible aerofins for atmospheric manoeuvrability. Grants DM+2 to Pilot checks in atmosphere.',
    tonnageMode: 'percent',
    tonnagePercent: 5,
    costMode: 'per_ton',
    costPerTon: 0.1, // MCr per ton consumed
    notes: 'DM+2 to all Pilot checks in atmosphere.',
  },
  {
    id: 'cargo_crane',
    name: 'Cargo Crane',
    category: 'cargo',
    tl: 7,
    description:
      'Overhead gantry crane for shifting cargo containers. Mechanism is 2.5 tons plus 0.5 tons per 150 tons of cargo space.',
    tonnageMode: 'variable',
    fixedTons: 2.5, // base, plus 0.5 per 150t cargo
    costMode: 'per_ton',
    costPerTon: 1, // MCr per ton
    notes: 'Base 2.5 tons + 0.5 tons per 150 tons of cargo space.',
  },
  {
    id: 'cargo_scoop',
    name: 'Cargo Scoop',
    category: 'cargo',
    tl: 8,
    description:
      'Allows picking up cargo or objects floating in space. Pilot check required; scoops 1 ton per round.',
    tonnageMode: 'fixed',
    fixedTons: 2,
    costMode: 'fixed',
    fixedCost: 0.5, // MCr
  },
  {
    id: 'collapsible_fuel_tank',
    name: 'Collapsible Fuel Tank',
    category: 'fuel',
    tl: 7,
    description:
      'Flexible bladders that expand when filled with hydrogen fuel. Takes cargo space. When empty, 1% of full tonnage. Fuel cannot be pumped directly to jump drive.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.0005, // MCr per ton (Cr500 per ton)
    notes: 'When empty, occupies 1% of full tonnage. Cannot fuel jump drives directly.',
  },
  {
    id: 'concealed_compartment',
    name: 'Concealed Compartment',
    category: 'stealth',
    tl: 8,
    description:
      'Hidden compartment shielded against sensors. DM-2 to Electronics (sensors) and DM-4 to Investigate checks to find.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.02, // MCr per ton (Cr20,000 per ton)
    maxPercent: 5,
    notes: 'Up to 5% of hull tonnage. DM-2 sensors, DM-4 Investigate to detect.',
  },
  {
    id: 'docking_space',
    name: 'Docking Space',
    category: 'operations',
    tl: 8,
    description:
      'Internal bay for docking a smaller ship or vehicle. Tonnage = largest ship + 10% (round up). 1D minutes to dock/undock.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.25, // MCr per ton
    notes: 'Tonnage consumed = tonnage of docked vessel + 10%.',
  },

  // ── Drones ─────────────────────────────────────────────────────────
  {
    id: 'mining_drones',
    name: 'Mining Drones',
    category: 'drones',
    tl: 10,
    description:
      'Unmanned craft for asteroid mining. Every 10 tons contains 5 drones, processes 1D×10 tons of asteroid per day.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.1, // MCr per ton (MCr1 per 10 tons)
    notes: '5 drones per 10 tons. Processes 1D×10 tons of asteroid per day.',
  },
  {
    id: 'probe_drones',
    name: 'Probe Drones',
    category: 'drones',
    tl: 8,
    description:
      'Planetary survey and communication relay drones. Each ton contains 5 drones.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.5, // MCr per ton
    notes: '5 drones per ton. Can survey surfaces, satellites, derelicts.',
  },
  {
    id: 'repair_drones',
    name: 'Repair Drones',
    category: 'drones',
    tl: 10,
    description:
      'Allow exterior repairs during combat using Electronics (remote ops). Engineer skill 1 or remote ops level, whichever is lower.',
    tonnageMode: 'percent',
    tonnagePercent: 1,
    costMode: 'per_ton',
    costPerTon: 0.2, // MCr per ton
    notes: 'Minimum 1 ton. Repair drones have Engineer skill 1.',
    minQuantity: 1,
  },

  // ── Fuel Systems ───────────────────────────────────────────────────
  {
    id: 'fuel_processor',
    name: 'Fuel Processor',
    category: 'fuel',
    tl: 8,
    description:
      'Converts unrefined fuel to refined fuel. Each ton converts 20 tons per day.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.05, // MCr per ton (Cr50,000 per ton)
    power: 0,
    powerPerTon: 1, // 1 Power per ton
    notes: 'Each ton processes 20 tons of fuel per day. Requires 1 Power per ton.',
  },
  {
    id: 'fuel_scoop',
    name: 'Fuel Scoop',
    category: 'fuel',
    tl: 8,
    description:
      'Allows unstreamlined ships to gather unrefined fuel from gas giants. Streamlined ships get this free.',
    tonnageMode: 'fixed',
    fixedTons: 0,
    costMode: 'fixed',
    fixedCost: 1, // MCr
    notes: 'No tonnage consumed. Streamlined hulls include this automatically.',
  },

  // ── Science & Medical ──────────────────────────────────────────────
  {
    id: 'laboratory',
    name: 'Laboratory',
    category: 'science',
    tl: 8,
    description:
      'Research and experimentation space. Every 4 tons allows one scientist to work.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.25, // MCr per ton (MCr1 per 4 tons)
    notes: '4 tons per scientist. Cost varies by research type.',
  },
  {
    id: 'library',
    name: 'Library',
    category: 'science',
    tl: 8,
    description:
      'Computer files, lecterns, displays, holotanks. DM+1 on EDU checks for skill training in jump space.',
    tonnageMode: 'fixed',
    fixedTons: 4,
    costMode: 'fixed',
    fixedCost: 4, // MCr
    notes: 'DM+1 on EDU checks for training during extended inactivity.',
  },
  {
    id: 'medical_bay',
    name: 'Medical Bay',
    category: 'science',
    tl: 8,
    description:
      'Grants DM+1 to Medic checks. Supports 5 patients per bay with 1 medic or autodoc.',
    tonnageMode: 'per_unit',
    fixedTons: 4,
    costMode: 'per_unit',
    fixedCost: 2, // MCr per bay
    power: 1,
    notes: 'Each bay: 4 tons, MCr2, 1 Power. Supports 5 patients.',
  },
  {
    id: 'multi_environment',
    name: 'Multi-Environment Space',
    category: 'accommodation',
    tl: 9,
    description:
      'Adjustable environment for aliens, animals, or exotic plants. 1 ton of equipment per 20 tons of space.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.5, // MCr per ton of equipment
    powerPerTon: 1, // 1 Power per ton of environmental equipment
    notes: '1 ton of environmental equipment per 20 tons of designated space.',
  },

  // ── Bridge & Control Upgrades ──────────────────────────────────────
  {
    id: 'sensor_station',
    name: 'Sensor Station',
    category: 'operations',
    tl: 9,
    description:
      'Additional station for a sensor operator to perform actions.',
    tonnageMode: 'per_unit',
    fixedTons: 1,
    costMode: 'per_unit',
    fixedCost: 0.5, // MCr per station
  },

  // ── Hull Upgrades ──────────────────────────────────────────────────
  {
    id: 'holographic_hull',
    name: 'Holographic Hull',
    category: 'stealth',
    tl: 10,
    description:
      'Embedded holographic projectors allow changing hull colours, graphics and appearance.',
    tonnageMode: 'fixed',
    fixedTons: 0,
    costMode: 'per_hull_ton',
    costPerHullTon: 100_000, // Cr100,000 per ton of hull
    powerPerTon: 0.5, // 1 Power per 2 tons of hull
    notes: 'No tonnage consumed. 1 Power per 2 tons of hull.',
  },

  // ── Workshop ───────────────────────────────────────────────────────
  {
    id: 'workshop',
    name: 'Workshop',
    category: 'operations',
    tl: 8,
    description:
      'Repair and fabrication facility. Every 6 tons allows 2 Travellers to use Mechanic with DM+2.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.15, // MCr per ton
    notes: 'Every 6 tons: 2 Travellers with Mechanic DM+2.',
  },

  // ── Hull Reinforcement (High Guard) ────────────────────────────────
  {
    id: 'reinforced_hull',
    name: 'Reinforced Hull',
    category: 'defense',
    tl: 8,
    description:
      'Strengthened structural members and additional bracing throughout the hull, increasing hull points by 10%.',
    tonnageMode: 'fixed',
    fixedTons: 0,
    costMode: 'per_hull_ton',
    costPerHullTon: 25_000, // Cr25,000 per ton of hull
    notes: 'Adds +10% hull points. Cannot be retrofitted.',
  },

  // ── Armoured Bulkheads (High Guard) ────────────────────────────────
  {
    id: 'armoured_bulkheads',
    name: 'Armoured Bulkheads',
    category: 'defense',
    tl: 8,
    description:
      'Heavy internal partitions protecting a specific system. Tonnage = 10% of the protected system. Prevents critical hits on that system.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.2, // MCr per ton of bulkhead
    notes: 'Tonnage = 10% of the system being protected. MCr0.2 per ton.',
  },

  // ── Armoury ───────────────────────────────────────────────────────
  {
    id: 'armoury',
    name: 'Armoury',
    category: 'operations',
    tl: 8,
    description:
      'Secure weapons storage and maintenance facility for military and mercenary vessels.',
    tonnageMode: 'per_unit',
    fixedTons: 1,
    costMode: 'per_unit',
    fixedCost: 0.25, // MCr per armoury
    notes: '1 ton, MCr0.25 per armoury.',
  },

  // ── Drop Tank Mount ──────────────────────────────────────────────
  {
    id: 'drop_tank_mount',
    name: 'Drop Tank Mount',
    category: 'fuel',
    tl: 9,
    description:
      'External fuel tank mounting points. Drop tanks can be jettisoned after use. Mount tonnage = 0.4% of drop tank capacity.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.5, // MCr per ton of mount
    notes: 'Mount tonnage = 0.4% of external tank capacity. Tanks jettisoned after jump.',
  },

  // ── Advanced Probe Drones ────────────────────────────────────────
  {
    id: 'advanced_probe_drones',
    name: 'Advanced Probe Drones',
    category: 'drones',
    tl: 12,
    description:
      'Enhanced probe drones with improved sensors and extended endurance for deep survey work.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.8, // MCr per ton
    notes: 'Superior sensors compared to standard probes. Used by survey scouts.',
  },

  // ── Full Hangar ──────────────────────────────────────────────────
  {
    id: 'full_hangar',
    name: 'Full Hangar',
    category: 'operations',
    tl: 8,
    description:
      'Internal hangar with full maintenance and repair facilities. Tonnage = 2x the tonnage of the largest craft housed.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.2, // MCr per ton of hangar
    notes: 'Hangar tonnage = 2x tonnage of craft. Allows full maintenance and repairs.',
  },

  // ── Cabin Space (Small Craft) ──────────────────────────────────────
  {
    id: 'cabin_space',
    name: 'Cabin Space',
    category: 'accommodation',
    tl: 7,
    description:
      'Basic accommodation for small craft. Each cabin provides sleeping area and basic facilities for one person.',
    tonnageMode: 'per_unit',
    fixedTons: 1.5,
    costMode: 'per_unit',
    fixedCost: 0.075, // MCr per cabin
    notes: '1.5 tons, MCr0.075 per cabin. Standard small craft accommodation.',
  },

  // ── Modular Hull (Modular Cutter) ────────────────────────────────
  {
    id: 'modular_hull',
    name: 'Modular Hull',
    category: 'operations',
    tl: 8,
    description:
      'Detachable module bay allowing rapid role changes without starport refits. Common modules include ATV, fuel, and open cargo.',
    tonnageMode: 'variable',
    costMode: 'per_ton',
    costPerTon: 0.06, // MCr per ton
    notes: 'Allows swapping modules for different missions. ATV module MCr1.8, Fuel module MCr1, Open module MCr2.',
  },

  // ── Acceleration Bench ───────────────────────────────────────────
  {
    id: 'acceleration_bench',
    name: 'Acceleration Bench',
    category: 'accommodation',
    tl: 7,
    description:
      'Basic acceleration seating for mass passenger transport on short trips. Each bench seats 4 passengers.',
    tonnageMode: 'per_unit',
    fixedTons: 1,
    costMode: 'per_unit',
    fixedCost: 0.01, // MCr per bench
    notes: '1 ton, MCr0.01 per bench. Seats 4 passengers.',
  },

  // ── Ammunition Storage ─────────────────────────────────────────────
  {
    id: 'ammunition_storage',
    name: 'Ammunition Storage',
    category: 'operations',
    tl: 7,
    description:
      'Dedicated storage for missile ammunition. Stores 12 missiles per ton.',
    tonnageMode: 'variable',
    costMode: 'fixed',
    fixedCost: 0,
    notes: 'No cost (just dedicated tonnage). 12 missiles per ton.',
  },

  // ── Countermeasures Suite (High Guard) ─────────────────────────────
  {
    id: 'countermeasures',
    name: 'Countermeasures Suite',
    category: 'defense',
    tl: 13,
    description:
      'Electronic countermeasures suite that can be added to an existing sensor package. Grants DM-2 to enemy attempts to lock on.',
    tonnageMode: 'fixed',
    fixedTons: 2,
    costMode: 'fixed',
    fixedCost: 8, // MCr
    power: 1,
    notes: 'Added to sensor suite. DM-2 to enemy sensor locks.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Get equipment definition by ID */
export function getEquipment(id: string): SpacecraftEquipment | undefined {
  return SPACECRAFT_EQUIPMENT.find((e) => e.id === id);
}

/** Calculate tonnage for an equipment installation */
export function calculateEquipmentTons(
  equip: SpacecraftEquipment,
  hullTonnage: number,
  allocatedTons?: number,
  quantity?: number
): number {
  switch (equip.tonnageMode) {
    case 'fixed':
      return equip.fixedTons ?? 0;
    case 'percent':
      return Math.max(
        equip.minQuantity ?? 0,
        Math.ceil((hullTonnage * (equip.tonnagePercent ?? 0)) / 100)
      );
    case 'per_unit':
      return (equip.fixedTons ?? 0) * (quantity ?? 1);
    case 'variable':
      return allocatedTons ?? 0;
  }
}

/** Calculate cost for an equipment installation in Credits */
export function calculateEquipmentCost(
  equip: SpacecraftEquipment,
  hullTonnage: number,
  allocatedTons?: number,
  quantity?: number
): number {
  switch (equip.costMode) {
    case 'fixed':
      return (equip.fixedCost ?? 0) * 1_000_000;
    case 'per_ton': {
      const tons = calculateEquipmentTons(equip, hullTonnage, allocatedTons, quantity);
      return tons * (equip.costPerTon ?? 0) * 1_000_000;
    }
    case 'per_hull_ton':
      return hullTonnage * (equip.costPerHullTon ?? 0);
    case 'per_unit':
      return (equip.fixedCost ?? 0) * (quantity ?? 1) * 1_000_000;
  }
}

/** Calculate power for an equipment installation */
export function calculateEquipmentPower(
  equip: SpacecraftEquipment,
  hullTonnage: number,
  allocatedTons?: number,
  quantity?: number
): number {
  if (equip.power !== undefined) {
    return equip.power * (quantity ?? 1);
  }
  if (equip.powerPerTon !== undefined) {
    if (equip.costMode === 'per_hull_ton') {
      // Holographic hull: power based on hull tonnage
      return Math.ceil(hullTonnage * equip.powerPerTon);
    }
    const tons = calculateEquipmentTons(equip, hullTonnage, allocatedTons, quantity);
    return Math.ceil(tons * equip.powerPerTon);
  }
  return 0;
}
