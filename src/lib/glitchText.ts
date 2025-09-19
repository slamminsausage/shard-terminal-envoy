export type GlitchLevel = 'standard' | 'severe' | 'eclipse';

interface CorruptionParams {
  level: number;
  isEclipseShard: boolean;
}

interface ApplyGlitchOptions {
  mutate?: boolean;
  intensityMultiplier?: number;
}

export interface GlitchResult {
  text: string;
  level: GlitchLevel | null;
  intensity: number;
  isEclipseShard: boolean;
}

const CORRUPT_TERMINALS = new Set([
  'blacksite-es1',
  'vennik-personal',
  'sayelle-logs',
  'blacktalon'
]);

const GLITCH_CHARACTERS = ['#', '@', '*', '%', '&', '!', '?', '/', '\\', '|'];

export const resolveGlitchLevel = (
  level: number,
  isEclipseShard = false
): GlitchLevel => {
  if (isEclipseShard) return 'eclipse';
  if (level >= 0.025) return 'severe';
  return 'standard';
};

export const shouldCorruptContent = (content: string, terminalId?: string) => {
  if (!content || !terminalId) return false;

  const terminalName = normaliseTerminal(terminalId);

  return (
    CORRUPT_TERMINALS.has(terminalName) ||
    content.includes('Eclipse Shard') ||
    content.includes('ES1') ||
    content.includes('Trevar')
  );
};

export const getCorruptionParams = (
  content: string,
  terminalId?: string
): CorruptionParams => {
  if (!content || !terminalId) {
    return { level: 0, isEclipseShard: false };
  }

  const terminalName = normaliseTerminal(terminalId);
  const eclipseContent =
    content.includes('Eclipse Shard') ||
    content.includes('ES1') ||
    terminalName === 'blacksite-es1';

  if (eclipseContent) {
    return { level: 0.03, isEclipseShard: true };
  }

  if (terminalName.includes('blacksite')) {
    return { level: 0.02, isEclipseShard: false };
  }

  if (terminalName.includes('sayelle')) {
    return { level: 0.015, isEclipseShard: false };
  }

  return { level: 0.01, isEclipseShard: false };
};

export const corruptText = (input: string, intensity = 0.01) => {
  if (intensity <= 0) return input;

  const chars = input.split('');
  const maxIntensity = Math.min(intensity, 0.2);

  return chars
    .map(char => {
      if (!char.trim()) return char;
      if (Math.random() > maxIntensity) return char;
      return GLITCH_CHARACTERS[Math.floor(Math.random() * GLITCH_CHARACTERS.length)];
    })
    .join('');
};

export const applyGlitch = (
  content: string,
  terminalId?: string,
  options: ApplyGlitchOptions = {}
): GlitchResult => {
  if (!shouldCorruptContent(content, terminalId)) {
    return {
      text: content,
      level: null,
      intensity: 0,
      isEclipseShard: false
    };
  }

  const params = getCorruptionParams(content, terminalId);
  const intensity = params.level * (options.intensityMultiplier ?? 1);
  const level = resolveGlitchLevel(params.level, params.isEclipseShard);

  return {
    text: options.mutate === false ? content : corruptText(content, intensity),
    level,
    intensity,
    isEclipseShard: params.isEclipseShard
  };
};

const normaliseTerminal = (terminalId: string) =>
  terminalId.includes('/')
    ? terminalId.replace('/logs/', '').replace('.json', '')
    : terminalId;
