/**
 * Per-crew content visibility helpers for the West Marches scoping feature.
 *
 * Every scoped content row carries a `visible_crew_ids` (or `visibleCrewIds`)
 * column. Semantics:
 *   - undefined / null / empty → visible to ALL crews (campaign-wide default)
 *   - non-empty array          → visible only to viewers whose active
 *                                 character's crew_id is in the array
 *
 * GMs always see everything; the filter should be short-circuited by callers
 * when `isGM` is true.
 */

import type { CrewGroup } from '@/types/database';

export type VisibleCrewField =
  | { visible_crew_ids?: string[] | null }
  | { visibleCrewIds?: string[] | null };

/** Normalise either snake_case (DB) or camelCase (in-memory) shape. */
export function getVisibleCrewIds(item: VisibleCrewField): string[] | null | undefined {
  const snake = (item as { visible_crew_ids?: string[] | null }).visible_crew_ids;
  if (snake !== undefined) return snake;
  return (item as { visibleCrewIds?: string[] | null }).visibleCrewIds;
}

/**
 * Returns whether a given item should be visible to a viewer.
 *
 * @param item          Row from any scoped table.
 * @param activeCrewId  Viewer's currently-active character's crew_id.
 *                      `null` means "no crew" (new player, character unassigned).
 * @param isGM          GMs bypass the filter entirely.
 */
export function isItemVisibleToViewer(
  item: VisibleCrewField,
  activeCrewId: string | null,
  isGM: boolean,
): boolean {
  if (isGM) return true;
  const ids = getVisibleCrewIds(item);
  // NULL / undefined / empty → visible to everyone.
  if (!ids || ids.length === 0) return true;
  // Scoped → viewer must have an active crew and it must match.
  return activeCrewId !== null && ids.includes(activeCrewId);
}

/**
 * Human-readable description of a visibility list, for GM-facing badges.
 * Returns e.g. "All Crews", "Alpha only", "Alpha + Bravo".
 */
export function describeCrewVisibility(
  ids: string[] | null | undefined,
  crewGroups: Pick<CrewGroup, 'id' | 'name'>[],
): string {
  if (!ids || ids.length === 0) return 'All Crews';
  const names = ids
    .map(id => crewGroups.find(g => g.id === id)?.name)
    .filter((n): n is string => !!n);
  if (names.length === 0) return 'All Crews';
  if (names.length === 1) return `${names[0]} only`;
  return names.join(' + ');
}
