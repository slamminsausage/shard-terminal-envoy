// ============================================================================
// CAREER THEMES - Visual styling configuration for each career
// ============================================================================

import {
  Anchor,
  Shield,
  Rocket,
  Ship,
  Sword,
  Eye,
  Crown,
  BookOpen,
  Music,
  Users,
  Compass,
  Skull,
  Lock,
  Brain,
  GraduationCap,
  Medal,
  type LucideIcon
} from 'lucide-react';

export interface CareerTheme {
  // Primary color for the career (used for borders, text highlights)
  primaryColor: string;
  // Background color with opacity (for cards, panels)
  bgColor: string;
  // Hover background color
  hoverBgColor: string;
  // Border color
  borderColor: string;
  // Text color for highlights
  textColor: string;
  // Glow color for effects
  glowColor: string;
  // Icon component
  icon: LucideIcon;
  // Short tagline for the career
  tagline: string;
}

// Career theme definitions
export const CAREER_THEMES: Record<string, CareerTheme> = {
  // MILITARY CAREERS
  'Navy': {
    primaryColor: '#3b82f6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    hoverBgColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    textColor: '#60a5fa',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    icon: Anchor,
    tagline: 'Serve the Imperium among the stars',
  },
  'Marines': {
    primaryColor: '#dc2626', // Red
    bgColor: 'rgba(220, 38, 38, 0.1)',
    hoverBgColor: 'rgba(220, 38, 38, 0.2)',
    borderColor: 'rgba(220, 38, 38, 0.5)',
    textColor: '#f87171',
    glowColor: 'rgba(220, 38, 38, 0.4)',
    icon: Shield,
    tagline: 'First in, last out',
  },
  'Army': {
    primaryColor: '#84cc16', // Lime/olive green
    bgColor: 'rgba(132, 204, 22, 0.1)',
    hoverBgColor: 'rgba(132, 204, 22, 0.2)',
    borderColor: 'rgba(132, 204, 22, 0.5)',
    textColor: '#a3e635',
    glowColor: 'rgba(132, 204, 22, 0.4)',
    icon: Sword,
    tagline: 'Planetary defense and ground warfare',
  },

  // EXPLORATION CAREERS
  'Scout': {
    primaryColor: '#06b6d4', // Cyan
    bgColor: 'rgba(6, 182, 212, 0.1)',
    hoverBgColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: 'rgba(6, 182, 212, 0.5)',
    textColor: '#22d3ee',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    icon: Rocket,
    tagline: 'Explore the unknown reaches',
  },
  'Merchant': {
    primaryColor: '#f59e0b', // Amber
    bgColor: 'rgba(245, 158, 11, 0.1)',
    hoverBgColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
    textColor: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: Ship,
    tagline: 'Trade routes and profit margins',
  },

  // PROFESSIONAL CAREERS
  'Agent': {
    primaryColor: '#8b5cf6', // Violet
    bgColor: 'rgba(139, 92, 246, 0.1)',
    hoverBgColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    textColor: '#a78bfa',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    icon: Eye,
    tagline: 'Intelligence and covert operations',
  },
  'Scholar': {
    primaryColor: '#14b8a6', // Teal
    bgColor: 'rgba(20, 184, 166, 0.1)',
    hoverBgColor: 'rgba(20, 184, 166, 0.2)',
    borderColor: 'rgba(20, 184, 166, 0.5)',
    textColor: '#2dd4bf',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    icon: BookOpen,
    tagline: 'Knowledge is power',
  },
  'Noble': {
    primaryColor: '#eab308', // Yellow/Gold
    bgColor: 'rgba(234, 179, 8, 0.1)',
    hoverBgColor: 'rgba(234, 179, 8, 0.2)',
    borderColor: 'rgba(234, 179, 8, 0.5)',
    textColor: '#facc15',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    icon: Crown,
    tagline: 'Born to lead and rule',
  },

  // CIVILIAN CAREERS
  'Entertainer': {
    primaryColor: '#ec4899', // Pink
    bgColor: 'rgba(236, 72, 153, 0.1)',
    hoverBgColor: 'rgba(236, 72, 153, 0.2)',
    borderColor: 'rgba(236, 72, 153, 0.5)',
    textColor: '#f472b6',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    icon: Music,
    tagline: 'Fame and fortune await',
  },
  'Citizen': {
    primaryColor: '#64748b', // Slate
    bgColor: 'rgba(100, 116, 139, 0.1)',
    hoverBgColor: 'rgba(100, 116, 139, 0.2)',
    borderColor: 'rgba(100, 116, 139, 0.5)',
    textColor: '#94a3b8',
    glowColor: 'rgba(100, 116, 139, 0.4)',
    icon: Users,
    tagline: 'The backbone of civilization',
  },

  // OUTCAST CAREERS
  'Drifter': {
    primaryColor: '#78716c', // Stone/brown
    bgColor: 'rgba(120, 113, 108, 0.1)',
    hoverBgColor: 'rgba(120, 113, 108, 0.2)',
    borderColor: 'rgba(120, 113, 108, 0.5)',
    textColor: '#a8a29e',
    glowColor: 'rgba(120, 113, 108, 0.4)',
    icon: Compass,
    tagline: 'No home, no master',
  },
  'Rogue': {
    primaryColor: '#f97316', // Orange
    bgColor: 'rgba(249, 115, 22, 0.1)',
    hoverBgColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
    textColor: '#fb923c',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    icon: Skull,
    tagline: 'Work outside the law',
  },
  'Prisoner': {
    primaryColor: '#991b1b', // Dark red
    bgColor: 'rgba(153, 27, 27, 0.1)',
    hoverBgColor: 'rgba(153, 27, 27, 0.2)',
    borderColor: 'rgba(153, 27, 27, 0.5)',
    textColor: '#dc2626',
    glowColor: 'rgba(153, 27, 27, 0.4)',
    icon: Lock,
    tagline: 'Incarcerated by the system',
  },

  // SPECIAL CAREERS
  'Psion': {
    primaryColor: '#c026d3', // Fuchsia
    bgColor: 'rgba(192, 38, 211, 0.1)',
    hoverBgColor: 'rgba(192, 38, 211, 0.2)',
    borderColor: 'rgba(192, 38, 211, 0.5)',
    textColor: '#d946ef',
    glowColor: 'rgba(192, 38, 211, 0.4)',
    icon: Brain,
    tagline: 'Unlock the mind\'s potential',
  },

  // PRE-CAREERS
  'University': {
    primaryColor: '#0ea5e9', // Sky blue
    bgColor: 'rgba(14, 165, 233, 0.1)',
    hoverBgColor: 'rgba(14, 165, 233, 0.2)',
    borderColor: 'rgba(14, 165, 233, 0.5)',
    textColor: '#38bdf8',
    glowColor: 'rgba(14, 165, 233, 0.4)',
    icon: GraduationCap,
    tagline: 'Higher education and research',
  },
  'Military Academy': {
    primaryColor: '#0369a1', // Darker blue
    bgColor: 'rgba(3, 105, 161, 0.1)',
    hoverBgColor: 'rgba(3, 105, 161, 0.2)',
    borderColor: 'rgba(3, 105, 161, 0.5)',
    textColor: '#0284c7',
    glowColor: 'rgba(3, 105, 161, 0.4)',
    icon: Medal,
    tagline: 'Officer training and discipline',
  },
};

// Default theme for careers not in the list (fallback to terminal green)
export const DEFAULT_CAREER_THEME: CareerTheme = {
  primaryColor: '#3ae2b3',
  bgColor: 'rgba(58, 226, 179, 0.1)',
  hoverBgColor: 'rgba(58, 226, 179, 0.2)',
  borderColor: 'rgba(58, 226, 179, 0.5)',
  textColor: '#3ae2b3',
  glowColor: 'rgba(58, 226, 179, 0.4)',
  icon: Users,
  tagline: 'Begin your journey',
};

/**
 * Get the theme for a career by name
 */
export function getCareerTheme(careerName: string): CareerTheme {
  return CAREER_THEMES[careerName] || DEFAULT_CAREER_THEME;
}

/**
 * Generate Tailwind-compatible class strings for a career theme
 */
export function getCareerThemeClasses(careerName: string, isSelected: boolean = false): {
  card: string;
  text: string;
  border: string;
  icon: string;
} {
  const theme = getCareerTheme(careerName);

  return {
    card: isSelected
      ? `border-2 shadow-lg`
      : `border hover:border-opacity-70`,
    text: 'font-bold',
    border: '',
    icon: '',
  };
}

/**
 * Get inline styles for a career card
 */
export function getCareerCardStyle(careerName: string, isSelected: boolean = false): React.CSSProperties {
  const theme = getCareerTheme(careerName);

  return {
    backgroundColor: isSelected ? theme.hoverBgColor : theme.bgColor,
    borderColor: theme.borderColor,
    boxShadow: isSelected ? `0 0 20px ${theme.glowColor}` : 'none',
    transition: 'all 0.2s ease-in-out',
  };
}

/**
 * Get inline styles for career text
 */
export function getCareerTextStyle(careerName: string): React.CSSProperties {
  const theme = getCareerTheme(careerName);

  return {
    color: theme.textColor,
  };
}
