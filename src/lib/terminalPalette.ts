/**
 * terminalPalette — shared accent colors for the terminal UI.
 *
 * Pulls the whole terminal look away from a harsh pure-green toward a
 * mint/teal that still reads as "retro CRT terminal" but is easier on
 * the eye and matches the PacketVizCanvas / ConnectingScreen family.
 *
 * Used by LoadingScreen, PromptInitScreen, DataStreamBg, DiceRoller,
 * RedactedBlock and anywhere else that previously hard-coded #00ff00
 * or #00ff88.
 */

export const TERMINAL_ACCENT = '#3ae2b3';      // soft mint/teal (main)
export const TERMINAL_ACCENT_BRIGHT = '#5af0c4'; // hover / highlight
export const TERMINAL_DIM = '#1b6c57';         // dim text / borders
export const TERMINAL_DIM_SOFT = '#124739';    // very subtle hints
export const TERMINAL_WARN = '#ffaa00';
export const TERMINAL_ERROR = '#ff4a5c';
export const TERMINAL_SUCCESS = '#00ff9c';

/** Helpers for alpha-suffix strings (e.g. `withAlpha(ACCENT, 0.33)` → "#3ae2b354") */
export const withAlpha = (hex: string, a: number): string => {
  const clamped = Math.max(0, Math.min(1, a));
  return (
    hex +
    Math.round(clamped * 255)
      .toString(16)
      .padStart(2, '0')
  );
};
