/**
 * textEffects — Character sets, seeded RNG, and terminal-flavoured helpers
 * shared by the canvas effect components (MatrixRain, DataStreamBg,
 * BuilderScreensaver, PacketVizCanvas) and the FileIcon / TerminalOS widgets.
 */

export const GLITCH_CHARS =
  '░▒▓█▄▀■□▪◘◙ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*/\\<>?;:|~`';

export const MATRIX_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%!?/\\';

export const glitchChar = (): string =>
  GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];

export const matrixChar = (): string =>
  MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];

export const hashStr = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const seededRng = (seed: string | number): (() => number) => {
  let s = hashStr(String(seed)) || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

export const fakeFileSize = (seed: string | number): string => {
  const rng = seededRng(seed);
  const kb = Math.floor(rng() * 900 + 12);
  return kb >= 1000 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`;
};
