/**
 * Traveller Core Rulebook - Bridge, Computers & Sensors
 *
 * Steps 5-7 of spacecraft construction.
 *
 * Bridge cost: MCr0.5 per 100 tons (or part of) of the ship
 * Cockpit: 1.5 tons / Cr10,000 (single) or 2.5 tons / Cr15,000 (dual)
 * Holographic controls: +25% bridge cost, DM+2 Initiative (TL9+)
 * Computers consume 0 tonnage (distributed throughout ship)
 * Sensor station: 1 ton, MCr0.5 each
 */

import type {
  BridgeSizeEntry,
  CockpitOption,
  ComputerModel,
  SensorSuite,
} from './types';

// ═══════════════════════════════════════════════════════════════════════
//  BRIDGE SIZES
// ═══════════════════════════════════════════════════════════════════════

export const BRIDGE_SIZE_TABLE: BridgeSizeEntry[] = [
  { minTonnage: 1, maxTonnage: 50, bridgeTons: 3 },
  { minTonnage: 51, maxTonnage: 99, bridgeTons: 6 },
  { minTonnage: 100, maxTonnage: 200, bridgeTons: 10 },
  { minTonnage: 201, maxTonnage: 1000, bridgeTons: 20 },
  { minTonnage: 1001, maxTonnage: 2000, bridgeTons: 40 },
  { minTonnage: 2001, maxTonnage: Infinity, bridgeTons: 60 },
];

/** Cost per 100 tons (or part of) of ship in MCr */
export const BRIDGE_COST_PER_100_TONS_MCR = 0.5;

/** Holographic controls cost multiplier (TL9+) */
export const HOLOGRAPHIC_CONTROLS_COST_MULTIPLIER = 1.25;

// ═══════════════════════════════════════════════════════════════════════
//  COCKPITS (ships 50 tons or less)
// ═══════════════════════════════════════════════════════════════════════

export const COCKPIT_OPTIONS: CockpitOption[] = [
  {
    id: 'cockpit',
    name: 'Cockpit',
    tons: 1.5,
    cost: 10_000,
    seats: 1,
    lifeSupport: '24 hours',
    description:
      'A self-contained, sealed single-seat area with all controls for ship operation. Not designed for long-term use.',
  },
  {
    id: 'dual_cockpit',
    name: 'Dual Cockpit',
    tons: 2.5,
    cost: 15_000,
    seats: 2,
    lifeSupport: '24 hours',
    description:
      'Provides space for a second crew member such as a sensor operator or dedicated gunner.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  COMPUTERS
// ═══════════════════════════════════════════════════════════════════════

/** /bis upgrade: +50% cost, +5 Processing for Jump Control only */
export const BIS_COST_MULTIPLIER = 1.5;
export const BIS_PROCESSING_BONUS = 5;

export const COMPUTER_MODELS: ComputerModel[] = [
  {
    id: 'computer_5',
    name: 'Computer/5',
    processing: 5,
    tl: 7,
    cost: 30_000,
    description: 'Basic ship computer. Sufficient for simple operations.',
  },
  {
    id: 'computer_10',
    name: 'Computer/10',
    processing: 10,
    tl: 9,
    cost: 160_000,
    description: 'Standard ship computer. Can run Jump Control/1.',
  },
  {
    id: 'computer_15',
    name: 'Computer/15',
    processing: 15,
    tl: 11,
    cost: 2_000_000,
    description: 'Advanced ship computer. Can run Jump Control/2.',
  },
  {
    id: 'computer_20',
    name: 'Computer/20',
    processing: 20,
    tl: 12,
    cost: 5_000_000,
    description: 'High-performance computer. Can run Jump Control/3.',
  },
  {
    id: 'computer_25',
    name: 'Computer/25',
    processing: 25,
    tl: 13,
    cost: 10_000_000,
    description: 'Military-grade computer. Can run Jump Control/4.',
  },
  {
    id: 'computer_30',
    name: 'Computer/30',
    processing: 30,
    tl: 14,
    cost: 20_000_000,
    description: 'Top-of-the-line computer. Can run Jump Control/5.',
  },
  {
    id: 'computer_35',
    name: 'Computer/35',
    processing: 35,
    tl: 15,
    cost: 30_000_000,
    description: 'Cutting-edge computer. Can run Jump Control/6.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SENSORS
// ═══════════════════════════════════════════════════════════════════════

/** Cost per additional sensor station */
export const SENSOR_STATION_COST = 500_000; // MCr0.5
export const SENSOR_STATION_TONS = 1;

export const SENSOR_SUITES: SensorSuite[] = [
  {
    id: 'basic',
    name: 'Basic',
    tl: 8,
    dm: -4,
    power: 0,
    tons: 0,
    cost: 0,
    components: ['Lidar', 'Radar'],
  },
  {
    id: 'civilian',
    name: 'Civilian Grade',
    tl: 9,
    dm: -2,
    power: 1,
    tons: 1,
    cost: 3_000_000,
    components: ['Lidar', 'Radar'],
  },
  {
    id: 'military',
    name: 'Military Grade',
    tl: 10,
    dm: 0,
    power: 2,
    tons: 2,
    cost: 4_100_000,
    components: ['Jammers', 'Lidar', 'Radar'],
  },
  {
    id: 'improved',
    name: 'Improved',
    tl: 12,
    dm: 1,
    power: 4,
    tons: 3,
    cost: 4_300_000,
    components: ['Densitometer', 'Jammers', 'Lidar', 'Radar'],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    tl: 15,
    dm: 2,
    power: 6,
    tons: 5,
    cost: 5_300_000,
    components: ['Densitometer', 'Jammers', 'Lidar', 'Neural Activity Sensor', 'Radar'],
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Get bridge tonnage for a given hull size */
export function getBridgeTons(hullTonnage: number): number {
  const entry = BRIDGE_SIZE_TABLE.find(
    (e) => hullTonnage >= e.minTonnage && hullTonnage <= e.maxTonnage
  );
  return entry?.bridgeTons ?? 10;
}

/** Calculate bridge cost in Credits */
export function calculateBridgeCost(
  hullTonnage: number,
  holographic: boolean
): number {
  const per100 = Math.ceil(hullTonnage / 100);
  const baseCost = per100 * BRIDGE_COST_PER_100_TONS_MCR * 1_000_000;
  return holographic ? baseCost * HOLOGRAPHIC_CONTROLS_COST_MULTIPLIER : baseCost;
}

/** Calculate computer cost including optional /bis */
export function calculateComputerCost(
  computer: ComputerModel,
  useBis: boolean
): number {
  return useBis ? computer.cost * BIS_COST_MULTIPLIER : computer.cost;
}

/** Get effective processing (with /bis bonus for Jump Control) */
export function getEffectiveProcessing(
  computer: ComputerModel,
  useBis: boolean
): { standard: number; jumpControl: number } {
  return {
    standard: computer.processing,
    jumpControl: useBis
      ? computer.processing + BIS_PROCESSING_BONUS
      : computer.processing,
  };
}
