/**
 * terminalThemes — Prototype-inspired theme lookups on top of
 * getTerminalBootProfile / getTerminalCategory.
 *
 * Maps the 10 fine-grained categories down to the 4 broad "types"
 * used by the PacketVizCanvas connecting animation:
 *   shipboard | corporate | government | criminal
 * Each type also has a PacketVizStyle that drives the boot viz.
 */

import {
  getTerminalCategory,
  getTerminalBootProfile,
  type TerminalCategory,
  type TerminalBootProfile,
} from '@/lib/terminalBootProfiles';
import type { PacketVizStyle } from '@/components/effects/PacketVizCanvas';

export type TerminalType = 'shipboard' | 'corporate' | 'government' | 'criminal';

export interface TerminalTheme {
  type: TerminalType;
  vizStyle: PacketVizStyle;
  bgColor: string;
  accentColor: string;
  dimColor: string;
  headerLabel: string;
  profile: TerminalBootProfile;
}

const CATEGORY_TO_TYPE: Record<TerminalCategory, TerminalType> = {
  'ship-systems':   'shipboard',
  corporate:        'corporate',
  'high-security':  'government',
  government:       'government',
  research:         'corporate',
  maintenance:      'corporate',
  'public-kiosk':   'government',
  personal:         'shipboard',
  criminal:         'criminal',
  corrupted:        'criminal',
  default:          'shipboard',
};

const TYPE_TO_VIZ: Record<TerminalType, PacketVizStyle> = {
  shipboard:  'orbital',
  corporate:  'grid',
  government: 'secure',
  criminal:   'chaos',
};

const TYPE_BG: Record<TerminalType, string> = {
  shipboard:  '#000810',
  corporate:  '#050810',
  government: '#000a08',
  criminal:   '#0a0400',
};

export const getTerminalType = (code: string): TerminalType =>
  CATEGORY_TO_TYPE[getTerminalCategory(code)];

export const getTerminalTheme = (code: string): TerminalTheme => {
  const profile = getTerminalBootProfile(code);
  const type = getTerminalType(code);
  return {
    type,
    vizStyle: TYPE_TO_VIZ[type],
    bgColor: TYPE_BG[type],
    accentColor: profile.accentColor,
    dimColor: profile.dimColor,
    headerLabel: profile.headerLabel,
    profile,
  };
};

/**
 * Prototype quick-connect buttons shown on the init screen.
 * Each code must exist in src/lib/terminals.ts.
 */
export const QUICK_CONNECT_CODES: Array<{ code: string; label: string; type: TerminalType }> = [
  { code: 'VANAGANDR001', label: 'VANAGANDR001',  type: 'shipboard'  },
  { code: 'FUWNET',       label: 'FUWNET',        type: 'criminal'   },
  { code: 'ES1-GAMMA',    label: 'ES1-GAMMA',     type: 'government' },
  { code: 'BLACKTALON',   label: 'BLACKTALON',    type: 'criminal'   },
];
