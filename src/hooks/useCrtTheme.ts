import { useState, useEffect, useCallback } from 'react';

export type CrtTheme = 'green' | 'amber' | 'blue';

const THEME_STORAGE_KEY = 'crt_color_theme';

const themeColors: Record<CrtTheme, Record<string, string>> = {
  green: {
    '--primary': '#00ff00',
    '--primary-dim': '#00aa00',
    '--primary-dark': '#004400',
    '--primary-light': '#00ff88',
    '--primary-mid': '#00aa55',
    '--border': '#00ff00',
    '--text-dim': '#00aa00',
    '--text-dimmer': '#446655',
    '--text-muted': '#88bbaa',
    '--bg-panel-alt': '#0d1210',
    '--bg-border': '#1a2420',
    '--focus-outline': '#99ff99',
    '--header-gradient': 'linear-gradient(180deg, rgba(0, 255, 0, 0.12) 0%, rgba(0, 0, 0, 0.65) 100%)',
    '--header-shadow': '0 2px 18px rgba(0, 255, 0, 0.2)',
    '--tab-bg': 'rgba(0, 255, 0, 0.08)',
    '--tab-border': 'rgba(0, 255, 0, 0.5)',
    '--tab-active-bg': 'rgba(0, 255, 0, 0.14)',
    '--tab-active-shadow': '0 0 16px rgba(0, 255, 0, 0.3)',
  },
  amber: {
    '--primary': '#FFB000',
    '--primary-dim': '#CC8800',
    '--primary-dark': '#443300',
    '--primary-light': '#FFCC44',
    '--primary-mid': '#CC9922',
    '--border': '#FFB000',
    '--text-dim': '#CC8800',
    '--text-dimmer': '#665533',
    '--text-muted': '#BBAA77',
    '--bg-panel-alt': '#12100a',
    '--bg-border': '#24201a',
    '--focus-outline': '#FFDD88',
    '--header-gradient': 'linear-gradient(180deg, rgba(255, 176, 0, 0.12) 0%, rgba(0, 0, 0, 0.65) 100%)',
    '--header-shadow': '0 2px 18px rgba(255, 176, 0, 0.2)',
    '--tab-bg': 'rgba(255, 176, 0, 0.08)',
    '--tab-border': 'rgba(255, 176, 0, 0.5)',
    '--tab-active-bg': 'rgba(255, 176, 0, 0.14)',
    '--tab-active-shadow': '0 0 16px rgba(255, 176, 0, 0.3)',
  },
  blue: {
    '--primary': '#00BFFF',
    '--primary-dim': '#0088BB',
    '--primary-dark': '#003355',
    '--primary-light': '#44DDFF',
    '--primary-mid': '#0099CC',
    '--border': '#00BFFF',
    '--text-dim': '#0088BB',
    '--text-dimmer': '#335566',
    '--text-muted': '#77AABB',
    '--bg-panel-alt': '#0a0d12',
    '--bg-border': '#1a2028',
    '--focus-outline': '#88DDFF',
    '--header-gradient': 'linear-gradient(180deg, rgba(0, 191, 255, 0.12) 0%, rgba(0, 0, 0, 0.65) 100%)',
    '--header-shadow': '0 2px 18px rgba(0, 191, 255, 0.2)',
    '--tab-bg': 'rgba(0, 191, 255, 0.08)',
    '--tab-border': 'rgba(0, 191, 255, 0.5)',
    '--tab-active-bg': 'rgba(0, 191, 255, 0.14)',
    '--tab-active-shadow': '0 0 16px rgba(0, 191, 255, 0.3)',
  },
};

// Also need to update the Tailwind HSL vars for shadcn components
const tailwindHsl: Record<CrtTheme, Record<string, string>> = {
  green: {
    '--terminal-green': '120 100% 50%',
    '--terminal-green-bright': '120 100% 60%',
    '--terminal-green-dim': '120 100% 33%',
    '--terminal-green-glow': '120 100% 50%',
  },
  amber: {
    '--terminal-green': '41 100% 50%',
    '--terminal-green-bright': '41 100% 60%',
    '--terminal-green-dim': '41 100% 40%',
    '--terminal-green-glow': '41 100% 50%',
  },
  blue: {
    '--terminal-green': '195 100% 50%',
    '--terminal-green-bright': '195 100% 60%',
    '--terminal-green-dim': '195 100% 37%',
    '--terminal-green-glow': '195 100% 50%',
  },
};

function applyTheme(theme: CrtTheme) {
  const root = document.documentElement;
  const colors = themeColors[theme];
  const hsl = tailwindHsl[theme];

  for (const [prop, value] of Object.entries(colors)) {
    root.style.setProperty(prop, value);
  }
  for (const [prop, value] of Object.entries(hsl)) {
    root.style.setProperty(prop, value);
  }
}

export function useCrtTheme() {
  const [theme, setThemeState] = useState<CrtTheme>(() => {
    if (typeof window === 'undefined') return 'green';
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored === 'amber' || stored === 'blue') ? stored : 'green';
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: CrtTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'green' ? 'amber' : prev === 'amber' ? 'blue' : 'green';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, setTheme, cycleTheme };
}
