// ============================================================================
// SPECIALTY SELECTOR COMPONENT
// Allows players to choose a specialization when gaining a skill with specialties
// ============================================================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SKILLS_WITH_SPECIALTIES, normalizeSkillName, formatSkillName } from './careers/skills';

interface SkillState {
  proficient: boolean;
  value: string;
  customLabel?: string;
}

interface SpecialtySelectorProps {
  /** The base skill name (e.g., "Electronics", "Gun Combat") */
  baseSkill: string;
  /** Current skills the character has */
  currentSkills: Record<string, SkillState>;
  /** Maximum skill level allowed (default 4) */
  maxLevel?: number;
  /** Callback when a specialty is selected */
  onSelect: (fullSkillName: string) => void;
  /** Optional callback to cancel selection */
  onCancel?: () => void;
  /** Optional title override */
  title?: string;
}

export const SpecialtySelector: React.FC<SpecialtySelectorProps> = ({
  baseSkill,
  currentSkills,
  maxLevel = 4,
  onSelect,
  onCancel,
  title,
}) => {
  // Get available specialties for this skill
  const specialties = SKILLS_WITH_SPECIALTIES[baseSkill] || [];

  if (specialties.length === 0) {
    // Not a skill with specialties - shouldn't happen, but handle gracefully
    return (
      <Alert className="bg-red-500/10 border-red-500/50">
        <AlertDescription className="text-red-400">
          Error: {baseSkill} does not have specialties.
        </AlertDescription>
      </Alert>
    );
  }

  // Build list of specialty options with current levels
  const specialtyOptions = specialties.map(specialty => {
    const fullSkillName = `${baseSkill} (${specialty})`;
    const normalizedKey = normalizeSkillName(fullSkillName);
    const currentSkill = currentSkills[normalizedKey];
    const currentLevel = currentSkill ? parseInt(currentSkill.value) || 0 : 0;
    const canIncrease = currentLevel < maxLevel;

    return {
      specialty,
      fullSkillName,
      normalizedKey,
      currentLevel,
      canIncrease,
      newLevel: currentLevel + 1,
    };
  });

  // Separate into existing (can increase) and new specialties
  const existingSpecialties = specialtyOptions.filter(opt => opt.currentLevel > 0 && opt.canIncrease);
  const newSpecialties = specialtyOptions.filter(opt => opt.currentLevel === 0);
  const maxedOutSpecialties = specialtyOptions.filter(opt => opt.currentLevel >= maxLevel);

  // Check if all specialties are maxed out
  const allMaxed = specialtyOptions.every(opt => !opt.canIncrease);

  return (
    <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4 space-y-4">
      <div>
        <h4 className="text-sm font-bold text-terminal-primary uppercase">
          {title || `Choose ${baseSkill} Specialization`}
        </h4>
        <p className="text-xs text-terminal-primary/70 mt-1">
          Select a specialization to gain or increase.
        </p>
      </div>

      {allMaxed ? (
        <Alert className="bg-yellow-500/10 border-yellow-500/50">
          <AlertDescription className="text-yellow-400">
            All {baseSkill} specializations are at maximum level ({maxLevel}).
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {/* Existing specializations that can be increased */}
          {existingSpecialties.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-terminal-primary/60 uppercase font-semibold">
                Increase Existing Specialization:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {existingSpecialties.map(opt => (
                  <Button
                    key={opt.normalizedKey}
                    onClick={() => onSelect(opt.fullSkillName)}
                    variant="outline"
                    className="w-full justify-between border-green-500/50 text-green-400 hover:bg-green-500/20"
                  >
                    <span>{opt.specialty}</span>
                    <span className="text-xs opacity-70">
                      Level {opt.currentLevel} → {opt.newLevel}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* New specializations */}
          {newSpecialties.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-terminal-primary/60 uppercase font-semibold">
                {existingSpecialties.length > 0 ? 'Or Start New Specialization:' : 'Choose Specialization:'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {newSpecialties.map(opt => (
                  <Button
                    key={opt.normalizedKey}
                    onClick={() => onSelect(opt.fullSkillName)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  >
                    <span>{opt.specialty}</span>
                    <span className="text-xs opacity-70 ml-2">→ Level 1</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Show maxed out specializations (disabled) */}
          {maxedOutSpecialties.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-terminal-primary/40 uppercase font-semibold">
                At Maximum Level:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {maxedOutSpecialties.map(opt => (
                  <Button
                    key={opt.normalizedKey}
                    disabled
                    variant="outline"
                    className="border-terminal-primary/20 text-terminal-primary/40 cursor-not-allowed"
                  >
                    <span>{opt.specialty}</span>
                    <span className="text-xs opacity-50 ml-2">Level {opt.currentLevel}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {onCancel && (
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-terminal-primary/30 text-terminal-primary/60 hover:bg-terminal-primary/10"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a skill name requires specialty selection
 * Returns true if the skill has specialties and no specific specialty is provided
 */
export function needsSpecialtySelection(skillName: string): boolean {
  // Check if the skill name includes a specialty (has parentheses)
  const hasSpecificSpecialty = /\(.+\)/.test(skillName);
  if (hasSpecificSpecialty) return false;

  // Check if this is a skill with specialties
  const normalized = skillName.trim();
  return Object.keys(SKILLS_WITH_SPECIALTIES).some(
    skill => skill.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get the base skill name from a skill string
 * "Electronics (Computers)" -> "Electronics"
 * "Electronics" -> "Electronics"
 */
export function getBaseSkillName(skillName: string): string {
  const match = skillName.match(/^(.+?)\s*(?:\(|$)/);
  return match ? match[1].trim() : skillName.trim();
}

/**
 * Find existing specializations for a base skill
 */
export function getExistingSpecializations(
  baseSkill: string,
  currentSkills: Record<string, SkillState>
): { specialty: string; level: number; key: string }[] {
  const specialties = SKILLS_WITH_SPECIALTIES[baseSkill] || [];
  const existing: { specialty: string; level: number; key: string }[] = [];

  for (const specialty of specialties) {
    const fullSkillName = `${baseSkill} (${specialty})`;
    const key = normalizeSkillName(fullSkillName);
    const skill = currentSkills[key];

    if (skill && skill.proficient) {
      existing.push({
        specialty,
        level: parseInt(skill.value) || 0,
        key,
      });
    }
  }

  return existing;
}

export default SpecialtySelector;
