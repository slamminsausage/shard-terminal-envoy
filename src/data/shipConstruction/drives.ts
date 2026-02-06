/**
 * Traveller Core Rulebook - Drive Systems
 *
 * Step 2 of spacecraft construction: manoeuvre drives and jump drives.
 *
 * Manoeuvre drives: MCr2 per ton (reaction drives: MCr0.2 per ton)
 * Jump drives: MCr1.5 per ton, minimum 10 tons, +5 tons base
 */

import type { DriveRatingEntry } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

/** Cost per ton of manoeuvre drive in MCr */
export const MANOEUVRE_DRIVE_COST_PER_TON_MCR = 2;

/** Cost per ton of reaction drive in MCr */
export const REACTION_DRIVE_COST_PER_TON_MCR = 0.2;

/** Cost per ton of jump drive in MCr */
export const JUMP_DRIVE_COST_PER_TON_MCR = 1.5;

/** Additional flat tonnage added to jump drive */
export const JUMP_DRIVE_BASE_TONS = 5;

/** Minimum tonnage for a jump drive */
export const JUMP_DRIVE_MIN_TONS = 10;

// ═══════════════════════════════════════════════════════════════════════
//  THRUST POTENTIAL TABLE
// ═══════════════════════════════════════════════════════════════════════

export const MANOEUVRE_DRIVE_TABLE: DriveRatingEntry[] = [
  { rating: 1, hullPercent: 1, minTL: 9 },
  { rating: 2, hullPercent: 2, minTL: 10 },
  { rating: 3, hullPercent: 3, minTL: 10 },
  { rating: 4, hullPercent: 4, minTL: 11 },
  { rating: 5, hullPercent: 5, minTL: 11 },
  { rating: 6, hullPercent: 6, minTL: 12 },
  { rating: 7, hullPercent: 7, minTL: 12 },
  { rating: 8, hullPercent: 8, minTL: 13 },
  { rating: 9, hullPercent: 9, minTL: 13 },
];

// ═══════════════════════════════════════════════════════════════════════
//  JUMP POTENTIAL TABLE
// ═══════════════════════════════════════════════════════════════════════

export const JUMP_DRIVE_TABLE: DriveRatingEntry[] = [
  { rating: 1, hullPercent: 2.5, minTL: 9 },
  { rating: 2, hullPercent: 5, minTL: 11 },
  { rating: 3, hullPercent: 7.5, minTL: 12 },
  { rating: 4, hullPercent: 10, minTL: 13 },
  { rating: 5, hullPercent: 12.5, minTL: 14 },
  { rating: 6, hullPercent: 15, minTL: 15 },
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Calculate manoeuvre drive tonnage */
export function calculateManoeuvreDriveTons(
  hullTonnage: number,
  thrustRating: number
): number {
  const entry = MANOEUVRE_DRIVE_TABLE.find((e) => e.rating === thrustRating);
  if (!entry) return 0;
  return Math.ceil((hullTonnage * entry.hullPercent) / 100);
}

/** Calculate manoeuvre drive cost in Credits */
export function calculateManoeuvreDriveCost(
  hullTonnage: number,
  thrustRating: number,
  isReaction: boolean
): number {
  const tons = calculateManoeuvreDriveTons(hullTonnage, thrustRating);
  const costPerTon = isReaction
    ? REACTION_DRIVE_COST_PER_TON_MCR
    : MANOEUVRE_DRIVE_COST_PER_TON_MCR;
  return tons * costPerTon * 1_000_000;
}

/** Calculate jump drive tonnage */
export function calculateJumpDriveTons(
  hullTonnage: number,
  jumpRating: number
): number {
  if (jumpRating <= 0) return 0;
  const entry = JUMP_DRIVE_TABLE.find((e) => e.rating === jumpRating);
  if (!entry) return 0;
  const tons = Math.ceil((hullTonnage * entry.hullPercent) / 100) + JUMP_DRIVE_BASE_TONS;
  return Math.max(tons, JUMP_DRIVE_MIN_TONS);
}

/** Calculate jump drive cost in Credits */
export function calculateJumpDriveCost(
  hullTonnage: number,
  jumpRating: number
): number {
  const tons = calculateJumpDriveTons(hullTonnage, jumpRating);
  return tons * JUMP_DRIVE_COST_PER_TON_MCR * 1_000_000;
}

/** Get minimum TL required for a given manoeuvre drive rating */
export function getManoeuvreMinTL(thrustRating: number): number {
  const entry = MANOEUVRE_DRIVE_TABLE.find((e) => e.rating === thrustRating);
  return entry?.minTL ?? 99;
}

/** Get minimum TL required for a given jump drive rating */
export function getJumpMinTL(jumpRating: number): number {
  if (jumpRating <= 0) return 0;
  const entry = JUMP_DRIVE_TABLE.find((e) => e.rating === jumpRating);
  return entry?.minTL ?? 99;
}
