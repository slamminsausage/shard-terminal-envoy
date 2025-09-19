import type { Dispatch, SetStateAction } from 'react';
import audioManager from '@/lib/audioManager';

type Setter = Dispatch<SetStateAction<string>>;

export type CancelTyping = () => void;

type OnCharHandler = (char: string, index: number) => void;

interface TypingOptions {
  delay?: number;
  startIndex?: number;
  onChar?: OnCharHandler;
}

const defaultDelay = 30;
const whitespacePattern = /\s/;

const beginTyping = (
  text: string,
  setState: Setter,
  onComplete?: () => void,
  options: TypingOptions = {}
): CancelTyping => {
  const delay = options.delay ?? defaultDelay;
  let index = options.startIndex ?? 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let cancelled = false;

  const step = () => {
    if (cancelled || index >= text.length) {
      onComplete?.();
      return;
    }

    const nextChar = text[index];
    options.onChar?.(nextChar, index);
    setState(prev => prev + nextChar);
    index += 1;

    if (index < text.length) {
      timeoutId = setTimeout(step, delay);
    } else {
      onComplete?.();
    }
  };

  step();

  return () => {
    cancelled = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};

export const typeText = (
  text: string,
  setState: Setter,
  onComplete?: () => void,
  options: Omit<TypingOptions, 'onChar'> = {}
): CancelTyping => beginTyping(text, setState, onComplete, options);

interface TypeWithSoundOptions extends Omit<TypingOptions, 'onChar'> {
  volume?: number;
  soundId?: 'typing' | 'glitch' | 'corruption';
  soundEvery?: number;
  includeWhitespace?: boolean;
}

export const typeTextWithSound = (
  text: string,
  setState: Setter,
  onComplete?: () => void,
  options: TypeWithSoundOptions = {}
): CancelTyping => {
  const {
    volume = 0.25,
    soundId = 'typing',
    soundEvery = 4,
    includeWhitespace = false,
    ...rest
  } = options;

  const playSound = (char: string, index: number) => {
    if (soundEvery <= 0) return;
    if (!includeWhitespace && whitespacePattern.test(char)) return;
    if (index % soundEvery !== 0) return;
    audioManager.playEffect(soundId, volume);
  };

  return beginTyping(text, setState, onComplete, {
    ...rest,
    onChar: playSound
  });
};

export const stopTyping = (cancel?: CancelTyping) => {
  cancel?.();
};
