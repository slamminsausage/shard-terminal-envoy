import type { ShipRangeBand } from './shipCombatRules';

/**
 * Cube distance between two hexes in axial coordinates.
 */
export function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
  const s1 = -q1 - r1;
  const s2 = -q2 - r2;
  return Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs(s1 - s2));
}

/**
 * Map hex distance to Traveller range bands.
 * Each hex represents a unit of space; these thresholds
 * produce a playable spread on a radius-12 to 15 grid.
 */
export function hexDistanceToRangeBand(dist: number): ShipRangeBand {
  if (dist <= 1) return 'adjacent';
  if (dist <= 2) return 'close';
  if (dist <= 4) return 'short';
  if (dist <= 7) return 'medium';
  if (dist <= 10) return 'long';
  if (dist <= 14) return 'very_long';
  return 'distant';
}

/**
 * Inverse mapping: returns the min/max hex distance for a range band.
 */
export function rangeBandToHexRange(band: ShipRangeBand): { min: number; max: number } {
  switch (band) {
    case 'adjacent': return { min: 0, max: 1 };
    case 'close': return { min: 2, max: 2 };
    case 'short': return { min: 3, max: 4 };
    case 'medium': return { min: 5, max: 7 };
    case 'long': return { min: 8, max: 10 };
    case 'very_long': return { min: 11, max: 14 };
    case 'distant': return { min: 15, max: Infinity };
  }
}

/**
 * Returns all hex coordinates within a given radius of a center hex.
 */
export function getHexesInRange(
  centerQ: number,
  centerR: number,
  maxDist: number
): Array<{ q: number; r: number }> {
  const results: Array<{ q: number; r: number }> = [];
  for (let q = centerQ - maxDist; q <= centerQ + maxDist; q++) {
    for (let r = centerR - maxDist; r <= centerR + maxDist; r++) {
      if (hexDistance(centerQ, centerR, q, r) <= maxDist) {
        results.push({ q, r });
      }
    }
  }
  return results;
}

/**
 * Compute the range band between two contacts by their hex positions.
 */
export function getRangeBandBetween(
  q1: number, r1: number,
  q2: number, r2: number
): ShipRangeBand {
  return hexDistanceToRangeBand(hexDistance(q1, r1, q2, r2));
}

/**
 * Range band colors for grid overlays (matching the terminal theme).
 */
export const RANGE_BAND_HEX_COLORS: Record<ShipRangeBand, string> = {
  adjacent: 'rgba(239, 68, 68, 0.15)',
  close: 'rgba(249, 115, 22, 0.12)',
  short: 'rgba(234, 179, 8, 0.10)',
  medium: 'rgba(59, 130, 246, 0.08)',
  long: 'rgba(168, 85, 247, 0.06)',
  very_long: 'rgba(99, 102, 241, 0.04)',
  distant: 'rgba(148, 163, 184, 0.03)',
};

/**
 * Get the shortest hex path direction from (q1,r1) toward (q2,r2).
 * Returns the next hex step along the path.
 */
export function hexStepToward(
  q1: number, r1: number,
  q2: number, r2: number
): { q: number; r: number } {
  if (q1 === q2 && r1 === r2) return { q: q1, r: r1 };

  // Use cube coordinates for interpolation
  const dq = q2 - q1;
  const dr = r2 - r1;
  const ds = (-q2 - r2) - (-q1 - r1);

  // Find the dominant axis and step along it
  const adq = Math.abs(dq);
  const adr = Math.abs(dr);
  const ads = Math.abs(ds);

  if (adq >= adr && adq >= ads) {
    // Step in q direction
    const stepQ = dq > 0 ? 1 : -1;
    // Choose r step that keeps us on the hex grid closest to target
    if (dr !== 0 && adr >= ads) {
      // Diagonal step: move q and adjust r toward target
      return { q: q1 + stepQ, r: r1 - stepQ };
    }
    // Pure q step: change s, keep r
    return { q: q1 + stepQ, r: r1 };
  }
  if (adr >= adq && adr >= ads) {
    const stepR = dr > 0 ? 1 : -1;
    return { q: q1, r: r1 + stepR };
  }
  // Step in s direction (change both q and r)
  if (ds > 0) {
    return { q: q1 - 1, r: r1 + 1 };
  }
  return { q: q1 + 1, r: r1 - 1 };
}

/**
 * Get all hexes along a straight line between two hex positions.
 */
export function hexLineTo(
  q1: number, r1: number,
  q2: number, r2: number
): Array<{ q: number; r: number }> {
  const dist = hexDistance(q1, r1, q2, r2);
  if (dist === 0) return [{ q: q1, r: r1 }];

  const results: Array<{ q: number; r: number }> = [];
  for (let i = 0; i <= dist; i++) {
    const t = i / dist;
    // Interpolate in cube coordinates
    const fq = q1 + (q2 - q1) * t;
    const fr = r1 + (r2 - r1) * t;
    const fs = (-q1 - r1) + ((-q2 - r2) - (-q1 - r1)) * t;
    // Round to nearest hex
    let rq = Math.round(fq);
    let rr = Math.round(fr);
    let rs = Math.round(fs);
    const dq = Math.abs(rq - fq);
    const dr = Math.abs(rr - fr);
    const ds = Math.abs(rs - fs);
    if (dq > dr && dq > ds) {
      rq = -rr - rs;
    } else if (dr > ds) {
      rr = -rq - rs;
    }
    results.push({ q: rq, r: rr });
  }
  return results;
}
