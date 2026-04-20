/**
 * RollCheckPrompt Component
 *
 * Implements Traveller RPG skill check system for terminal logs.
 *
 * Features:
 * - Actual 2d6 dice rolling
 * - Manual roll entry for table play
 * - Displays skill and characteristic modifiers
 * - Shows roll breakdown and result
 * - Terminal-styled UI
 */

import { useState } from 'react';
import { performSkillCheck, type DiceRoll } from '@/lib/dice';

interface RollCheckPromptProps {
  difficulty: number;
  skill: string;
  subject: string;
  skillDM?: number;          // Optional: calculated from character
  charDM?: number;           // Optional: calculated from character
  onRollResult: (result: DiceRoll) => void;  // Callback with roll result
  onBack: () => void;        // Back/cancel button
}

export default function RollCheckPrompt({
  difficulty,
  skill,
  subject,
  skillDM = 0,   // Default to no modifier
  charDM = 0,    // Default to no modifier
  onRollResult,
  onBack,
}: RollCheckPromptProps) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualRoll, setManualRoll] = useState('');
  const [rollResult, setRollResult] = useState<DiceRoll | null>(null);
  const [error, setError] = useState('');

  // Local state for manual modifier entry (until character sheet integration)
  const [localSkillDM, setLocalSkillDM] = useState(skillDM.toString());
  const [localCharDM, setLocalCharDM] = useState(charDM.toString());

  const handleRollDice = () => {
    setError('');
    const parsedSkill = Number(localSkillDM);
    const parsedChar = Number(localCharDM);
    const finalSkillDM = Number.isFinite(parsedSkill) ? parsedSkill : 0;
    const finalCharDM = Number.isFinite(parsedChar) ? parsedChar : 0;
    const result = performSkillCheck(difficulty, finalSkillDM, finalCharDM);
    setRollResult(result);
  };

  const handleManualRoll = () => {
    setError('');
    const roll = parseInt(manualRoll, 10);

    // Validate manual roll (must be 2-12)
    if (isNaN(roll) || roll < 2 || roll > 12) {
      setError('Invalid roll. Must be between 2 and 12.');
      return;
    }

    const parsedSkill = Number(localSkillDM);
    const parsedChar = Number(localCharDM);
    const finalSkillDM = Number.isFinite(parsedSkill) ? parsedSkill : 0;
    const finalCharDM = Number.isFinite(parsedChar) ? parsedChar : 0;
    const result = performSkillCheck(difficulty, finalSkillDM, finalCharDM, roll);
    setRollResult(result);
    setManualRoll('');
  };

  const handleContinue = () => {
    if (rollResult) {
      onRollResult(rollResult);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">SKILL CHECK REQUIRED</span>
        </div>
        <div className="modal-body">
          <div className="space-y-4">
            {/* Subject */}
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-dim)' }}>
                Subject:
              </p>
              <p style={{ color: 'var(--primary)' }}>
                {subject}
              </p>
            </div>

            {/* Skill and Difficulty Info */}
            <div className="p-4 border rounded" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: 'var(--text-dim)' }}>
                  Required Skill:
                </span>
                <span className="font-bold" style={{ color: 'var(--secondary)' }}>
                  {skill}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm" style={{ color: 'var(--text-dim)' }}>
                  Difficulty:
                </span>
                <span className="font-bold" style={{ color: difficulty >= 10 ? 'var(--danger)' : 'var(--warning)' }}>
                  {difficulty}+
                </span>
              </div>

              {/* Modifiers - Editable */}
              <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs block mb-1" style={{ color: 'var(--text-dim)' }}>
                      Skill DM:
                    </label>
                    <input
                      type="number"
                      value={localSkillDM}
                      onChange={(e) => setLocalSkillDM(e.target.value)}
                      className="terminal-input w-full text-center font-mono font-bold"
                      disabled={!!rollResult}
                      placeholder="-3"
                    />
                  </div>
                  <div>
                    <label className="text-xs block mb-1" style={{ color: 'var(--text-dim)' }}>
                      Characteristic DM:
                    </label>
                    <input
                      type="number"
                      value={localCharDM}
                      onChange={(e) => setLocalCharDM(e.target.value)}
                      className="terminal-input w-full text-center font-mono font-bold"
                      disabled={!!rollResult}
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-dim)' }}>
                  Enter your skill and characteristic modifiers
                </p>
              </div>
            </div>

            {/* Roll Instruction */}
            {!rollResult && (
              <div className="p-3 border rounded" style={{ borderColor: 'var(--primary-dim)', backgroundColor: 'rgba(0, 255, 136, 0.05)' }}>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--primary)' }}>
                  Roll 2d6 and add your modifiers
                </p>
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  Target: {difficulty}+
                </p>
              </div>
            )}

            {/* Roll Result */}
            {rollResult && (
              <div className={`p-4 border-2 rounded ${rollResult.success ? 'border-green-500' : 'border-red-500'}`} style={{ backgroundColor: rollResult.success ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 51, 68, 0.1)' }}>
                <div className="text-center mb-2">
                  <p className="text-sm mb-1" style={{ color: 'var(--text-dim)' }}>
                    Rolled:
                  </p>
                  <p className="text-3xl font-bold font-mono" style={{ color: 'var(--primary)' }}>
                    {rollResult.dice}
                  </p>
                </div>
                <div className="text-center mb-2">
                  <p className="text-sm font-mono" style={{ color: 'var(--text-dim)' }}>
                    {rollResult.dice} + {rollResult.skillDM >= 0 ? `+${rollResult.skillDM}` : rollResult.skillDM} + {rollResult.charDM >= 0 ? `+${rollResult.charDM}` : rollResult.charDM} = {rollResult.total}
                  </p>
                </div>
                <div className="text-center pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  {rollResult.success ? (
                    <p className="text-lg font-bold" style={{ color: '#00ff88' }}>
                      ✓ ACCESS GRANTED
                    </p>
                  ) : (
                    <p className="text-lg font-bold" style={{ color: '#ff3344' }}>
                      ✗ ACCESS DENIED
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Manual Entry */}
            {!rollResult && showManualEntry && (
              <div className="p-3 border rounded" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}>
                <p className="text-sm mb-2" style={{ color: 'var(--text-dim)' }}>
                  Enter dice roll (2-12):
                </p>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={manualRoll}
                  onChange={(e) => setManualRoll(e.target.value)}
                  className="terminal-input w-full mb-2"
                  placeholder="e.g., 7"
                  autoFocus
                />
                {error && (
                  <p className="text-xs mb-2" style={{ color: 'var(--danger)' }}>
                    {error}
                  </p>
                )}
                <button
                  onClick={handleManualRoll}
                  className="terminal-btn primary w-full"
                >
                  SUBMIT ROLL
                </button>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              {!rollResult ? (
                <>
                  <button
                    onClick={onBack}
                    className="terminal-btn secondary"
                  >
                    BACK
                  </button>
                  <button
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="terminal-btn secondary"
                  >
                    {showManualEntry ? 'HIDE MANUAL' : 'MANUAL ENTRY'}
                  </button>
                  <button
                    onClick={handleRollDice}
                    className="terminal-btn primary"
                  >
                    ROLL DICE
                  </button>
                </>
              ) : (
                <button
                  onClick={handleContinue}
                  className="terminal-btn primary"
                >
                  CONTINUE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
