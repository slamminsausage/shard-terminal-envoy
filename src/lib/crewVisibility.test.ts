/**
 * Tests for per-crew visibility helpers.
 */

import { describe, it, expect } from 'vitest';
import { isItemVisibleToViewer, describeCrewVisibility } from './crewVisibility';

describe('isItemVisibleToViewer', () => {
  it('GM always sees everything regardless of scoping', () => {
    expect(isItemVisibleToViewer({ visible_crew_ids: null }, null, true)).toBe(true);
    expect(isItemVisibleToViewer({ visible_crew_ids: ['crew-a'] }, null, true)).toBe(true);
    expect(isItemVisibleToViewer({ visible_crew_ids: ['crew-a'] }, 'crew-b', true)).toBe(true);
  });

  it('unscoped items (null) are visible to everyone', () => {
    expect(isItemVisibleToViewer({ visible_crew_ids: null }, null, false)).toBe(true);
    expect(isItemVisibleToViewer({ visible_crew_ids: null }, 'crew-a', false)).toBe(true);
  });

  it('unscoped items (empty array) are visible to everyone', () => {
    expect(isItemVisibleToViewer({ visible_crew_ids: [] }, null, false)).toBe(true);
    expect(isItemVisibleToViewer({ visible_crew_ids: [] }, 'crew-a', false)).toBe(true);
  });

  it('unscoped items (undefined) are visible to everyone', () => {
    expect(isItemVisibleToViewer({}, null, false)).toBe(true);
    expect(isItemVisibleToViewer({}, 'crew-a', false)).toBe(true);
  });

  it('scoped item visible to a member of the listed crew', () => {
    expect(isItemVisibleToViewer({ visible_crew_ids: ['crew-a'] }, 'crew-a', false)).toBe(true);
  });

  it('scoped item hidden from a player in a non-listed crew', () => {
    expect(isItemVisibleToViewer({ visible_crew_ids: ['crew-a'] }, 'crew-b', false)).toBe(false);
  });

  it('scoped item hidden from a player with no active crew', () => {
    expect(isItemVisibleToViewer({ visible_crew_ids: ['crew-a'] }, null, false)).toBe(false);
  });

  it('multi-crew scoped item visible to any listed crew', () => {
    const item = { visible_crew_ids: ['crew-a', 'crew-b'] };
    expect(isItemVisibleToViewer(item, 'crew-a', false)).toBe(true);
    expect(isItemVisibleToViewer(item, 'crew-b', false)).toBe(true);
    expect(isItemVisibleToViewer(item, 'crew-c', false)).toBe(false);
  });

  it('accepts camelCase visibleCrewIds as well as snake_case', () => {
    expect(isItemVisibleToViewer({ visibleCrewIds: ['crew-a'] }, 'crew-a', false)).toBe(true);
    expect(isItemVisibleToViewer({ visibleCrewIds: ['crew-a'] }, 'crew-b', false)).toBe(false);
  });
});

describe('describeCrewVisibility', () => {
  const crews = [
    { id: 'crew-a', name: 'Alpha' },
    { id: 'crew-b', name: 'Bravo' },
  ];

  it('returns "All Crews" for null/undefined/empty', () => {
    expect(describeCrewVisibility(null, crews)).toBe('All Crews');
    expect(describeCrewVisibility(undefined, crews)).toBe('All Crews');
    expect(describeCrewVisibility([], crews)).toBe('All Crews');
  });

  it('returns "<Name> only" for single crew', () => {
    expect(describeCrewVisibility(['crew-a'], crews)).toBe('Alpha only');
  });

  it('joins multiple crew names with "+"', () => {
    expect(describeCrewVisibility(['crew-a', 'crew-b'], crews)).toBe('Alpha + Bravo');
  });

  it('silently ignores stale ids that no longer match any crew', () => {
    expect(describeCrewVisibility(['deleted-crew'], crews)).toBe('All Crews');
    expect(describeCrewVisibility(['crew-a', 'deleted-crew'], crews)).toBe('Alpha only');
  });
});
