/**
 * RollCheckPrompt — skill-check gate shown before entering a terminal
 * or opening a locked log.
 *
 * Styled to match the rest of the terminal UI (LoadingScreen /
 * PromptInitScreen / DiceRoller aesthetic):
 *   - Orbitron banner with "SKILL CHECK REQUIRED" + DC pill
 *   - Bordered accent panel over a translucent backdrop
 *   - Share Tech Mono for dice readout
 *   - Accent-tinted roll + result state (success / fail)
 *
 * Uses the shared TERMINAL_ACCENT palette so color stays consistent
 * with DiceRoller and RedactedBlock.
 */

import { useState } from 'react';
import { performSkillCheck, type DiceRoll } from '@/lib/dice';
import {
  TERMINAL_ACCENT,
  TERMINAL_DIM,
  TERMINAL_SUCCESS,
  TERMINAL_ERROR,
  TERMINAL_WARN,
  withAlpha,
} from '@/lib/terminalPalette';

interface RollCheckPromptProps {
  difficulty: number;
  skill: string;
  subject: string;
  skillDM?: number;
  charDM?: number;
  onRollResult: (result: DiceRoll) => void;
  onBack: () => void;
}

const labelFont = { fontFamily: 'Orbitron, sans-serif' } as const;
const monoFont = { fontFamily: '"Share Tech Mono", monospace' } as const;

export default function RollCheckPrompt({
  difficulty,
  skill,
  subject,
  skillDM = 0,
  charDM = 0,
  onRollResult,
  onBack,
}: RollCheckPromptProps) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualRoll, setManualRoll] = useState('');
  const [rollResult, setRollResult] = useState<DiceRoll | null>(null);
  const [error, setError] = useState('');
  const [rolling, setRolling] = useState(false);
  const [tumblingDice, setTumblingDice] = useState<[number, number] | null>(null);

  const [localSkillDM, setLocalSkillDM] = useState(skillDM.toString());
  const [localCharDM, setLocalCharDM] = useState(charDM.toString());

  const parseMods = () => {
    const parsedSkill = Number(localSkillDM);
    const parsedChar = Number(localCharDM);
    return {
      finalSkillDM: Number.isFinite(parsedSkill) ? parsedSkill : 0,
      finalCharDM: Number.isFinite(parsedChar) ? parsedChar : 0,
    };
  };

  const handleRollDice = () => {
    if (rolling || rollResult) return;
    setError('');
    setRolling(true);

    let tumbles = 0;
    const iv = window.setInterval(() => {
      setTumblingDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      tumbles++;
      if (tumbles > 8) {
        window.clearInterval(iv);
        const { finalSkillDM, finalCharDM } = parseMods();
        const result = performSkillCheck(difficulty, finalSkillDM, finalCharDM);
        setTumblingDice(null);
        setRolling(false);
        setRollResult(result);
      }
    }, 55);
  };

  const handleManualRoll = () => {
    setError('');
    const roll = parseInt(manualRoll, 10);
    if (isNaN(roll) || roll < 2 || roll > 12) {
      setError('Invalid roll. Must be between 2 and 12.');
      return;
    }
    const { finalSkillDM, finalCharDM } = parseMods();
    const result = performSkillCheck(difficulty, finalSkillDM, finalCharDM, roll);
    setRollResult(result);
    setManualRoll('');
  };

  const handleContinue = () => {
    if (rollResult) onRollResult(rollResult);
  };

  const stateColor = rollResult
    ? rollResult.success
      ? TERMINAL_SUCCESS
      : TERMINAL_ERROR
    : TERMINAL_ACCENT;

  const difficultyColor = difficulty >= 10 ? TERMINAL_ERROR : TERMINAL_WARN;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(2px)',
        zIndex: 60,
      }}
    >
      {/* Scanline overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'repeating-linear-gradient(180deg, rgba(58,226,179,0.04) 0px, rgba(58,226,179,0.04) 1px, transparent 1px, transparent 3px)',
          mixBlendMode: 'overlay',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          margin: '0 1rem',
          border: `1px solid ${withAlpha(stateColor, 0.35)}`,
          background: 'rgba(0,0,0,0.78)',
          boxShadow: `0 0 24px ${withAlpha(stateColor, 0.18)}, inset 0 0 32px rgba(0,0,0,0.45)`,
          borderRadius: 4,
          color: TERMINAL_ACCENT,
        }}
      >
        {/* Panel header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 1rem',
            borderBottom: `1px solid ${withAlpha(stateColor, 0.22)}`,
            background: `linear-gradient(180deg, ${withAlpha(stateColor, 0.1)} 0%, transparent 100%)`,
          }}
        >
          <span
            style={{
              ...labelFont,
              fontSize: '0.7rem',
              letterSpacing: '0.3em',
              color: stateColor,
              textShadow: `0 0 8px ${withAlpha(stateColor, 0.45)}`,
            }}
          >
            ▌ SKILL CHECK REQUIRED
          </span>
          <span
            style={{
              ...labelFont,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.6rem',
              fontSize: '0.6rem',
              letterSpacing: '0.22em',
              border: `1px solid ${withAlpha(difficultyColor, 0.45)}`,
              background: withAlpha(difficultyColor, 0.1),
              color: difficultyColor,
              textShadow: `0 0 6px ${withAlpha(difficultyColor, 0.45)}`,
              borderRadius: 2,
            }}
          >
            <span>DC</span>
            <strong style={{ fontWeight: 700 }}>{difficulty}+</strong>
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '1.1rem 1.1rem 1rem' }}>
          {/* Subject */}
          <div style={{ marginBottom: '0.9rem' }}>
            <div
              style={{
                ...labelFont,
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                color: TERMINAL_DIM,
                marginBottom: '0.3rem',
              }}
            >
              SUBJECT
            </div>
            <div
              style={{
                ...monoFont,
                fontSize: '0.95rem',
                color: TERMINAL_ACCENT,
                textShadow: `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.35)}`,
                padding: '0.4rem 0.6rem',
                border: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.2)}`,
                background: withAlpha(TERMINAL_ACCENT, 0.04),
                borderRadius: 2,
              }}
            >
              {subject}
            </div>
          </div>

          {/* Skill + modifiers panel */}
          <div
            style={{
              border: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.22)}`,
              background: withAlpha(TERMINAL_ACCENT, 0.03),
              borderRadius: 3,
              padding: '0.75rem 0.85rem',
              marginBottom: '0.9rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.55rem',
              }}
            >
              <span
                style={{
                  ...labelFont,
                  fontSize: '0.58rem',
                  letterSpacing: '0.28em',
                  color: TERMINAL_DIM,
                }}
              >
                REQUIRED SKILL
              </span>
              <span
                style={{
                  ...monoFont,
                  fontSize: '0.82rem',
                  color: TERMINAL_ACCENT,
                  textShadow: `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.4)}`,
                }}
              >
                {skill}
              </span>
            </div>

            <div
              style={{
                borderTop: `1px dashed ${withAlpha(TERMINAL_ACCENT, 0.2)}`,
                paddingTop: '0.65rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.6rem',
              }}
            >
              <ModifierInput
                label="SKILL DM"
                value={localSkillDM}
                onChange={setLocalSkillDM}
                disabled={!!rollResult || rolling}
              />
              <ModifierInput
                label="CHAR DM"
                value={localCharDM}
                onChange={setLocalCharDM}
                disabled={!!rollResult || rolling}
              />
            </div>
            <div
              style={{
                ...labelFont,
                textAlign: 'center',
                fontSize: '0.55rem',
                letterSpacing: '0.25em',
                color: TERMINAL_DIM,
                marginTop: '0.55rem',
              }}
            >
              ENTER YOUR SKILL & CHARACTERISTIC MODIFIERS
            </div>
          </div>

          {/* Dice readout */}
          <div
            style={{
              border: `1px solid ${withAlpha(stateColor, 0.35)}`,
              background: withAlpha(stateColor, rollResult ? 0.08 : 0.04),
              borderRadius: 3,
              padding: '0.85rem 0.85rem 0.95rem',
              marginBottom: '0.9rem',
              textAlign: 'center',
              transition: 'all 0.25s',
            }}
          >
            <div
              style={{
                ...labelFont,
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                color: withAlpha(stateColor, 0.8),
                marginBottom: '0.35rem',
              }}
            >
              {rollResult ? 'ROLL RESULT' : rolling ? '· ROLLING ·' : 'ROLL 2D6 + MODIFIERS'}
            </div>

            <div
              style={{
                ...monoFont,
                fontSize: '1.8rem',
                letterSpacing: '0.05em',
                color: stateColor,
                textShadow: `0 0 10px ${withAlpha(stateColor, 0.55)}`,
                lineHeight: 1.1,
              }}
            >
              {rollResult ? (
                <>
                  <span>{rollResult.dice}</span>
                  <span style={{ opacity: 0.5, margin: '0 0.4rem', fontSize: '1.2rem' }}>+</span>
                  <span style={{ fontSize: '1.2rem' }}>
                    {rollResult.skillDM >= 0 ? `+${rollResult.skillDM}` : rollResult.skillDM}
                  </span>
                  <span style={{ opacity: 0.5, margin: '0 0.4rem', fontSize: '1.2rem' }}>+</span>
                  <span style={{ fontSize: '1.2rem' }}>
                    {rollResult.charDM >= 0 ? `+${rollResult.charDM}` : rollResult.charDM}
                  </span>
                  <span style={{ opacity: 0.5, margin: '0 0.5rem' }}>=</span>
                  <strong style={{ fontWeight: 700 }}>{rollResult.total}</strong>
                </>
              ) : tumblingDice ? (
                <>
                  <span>{tumblingDice[0]}</span>
                  <span style={{ opacity: 0.5, margin: '0 0.4rem' }}>·</span>
                  <span>{tumblingDice[1]}</span>
                </>
              ) : (
                <span style={{ letterSpacing: '0.3em', opacity: 0.7 }}>— · —</span>
              )}
            </div>

            {rollResult && (
              <div
                style={{
                  ...labelFont,
                  marginTop: '0.6rem',
                  paddingTop: '0.55rem',
                  borderTop: `1px dashed ${withAlpha(stateColor, 0.3)}`,
                  fontSize: '0.75rem',
                  letterSpacing: '0.28em',
                  color: stateColor,
                  textShadow: `0 0 8px ${withAlpha(stateColor, 0.5)}`,
                }}
              >
                {rollResult.success ? '✓ ACCESS GRANTED' : '✕ ACCESS DENIED'}
              </div>
            )}

            {!rollResult && (
              <div
                style={{
                  ...labelFont,
                  marginTop: '0.45rem',
                  fontSize: '0.55rem',
                  letterSpacing: '0.25em',
                  color: TERMINAL_DIM,
                }}
              >
                TARGET · {difficulty}+
              </div>
            )}
          </div>

          {/* Manual entry */}
          {!rollResult && showManualEntry && (
            <div
              style={{
                border: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.22)}`,
                background: withAlpha(TERMINAL_ACCENT, 0.04),
                borderRadius: 3,
                padding: '0.7rem 0.8rem',
                marginBottom: '0.9rem',
              }}
            >
              <div
                style={{
                  ...labelFont,
                  fontSize: '0.58rem',
                  letterSpacing: '0.28em',
                  color: TERMINAL_DIM,
                  marginBottom: '0.4rem',
                }}
              >
                MANUAL ENTRY · 2d6 ROLL (2–12)
              </div>
              <input
                type="number"
                min={2}
                max={12}
                value={manualRoll}
                onChange={(e) => setManualRoll(e.target.value)}
                placeholder="e.g., 7"
                autoFocus
                style={{
                  ...monoFont,
                  width: '100%',
                  background: 'rgba(0,0,0,0.55)',
                  border: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.35)}`,
                  color: TERMINAL_ACCENT,
                  fontSize: '0.9rem',
                  padding: '0.45rem 0.6rem',
                  textAlign: 'center',
                  borderRadius: 2,
                  outline: 'none',
                  marginBottom: '0.5rem',
                }}
              />
              {error && (
                <div
                  style={{
                    ...monoFont,
                    fontSize: '0.7rem',
                    color: TERMINAL_ERROR,
                    marginBottom: '0.45rem',
                  }}
                >
                  {error}
                </div>
              )}
              <PanelButton variant="primary" onClick={handleManualRoll} full>
                ▶ SUBMIT ROLL
              </PanelButton>
            </div>
          )}

          {/* Action row */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            {!rollResult ? (
              <>
                <PanelButton variant="ghost" onClick={onBack}>
                  ← BACK
                </PanelButton>
                <PanelButton
                  variant="ghost"
                  onClick={() => setShowManualEntry((v) => !v)}
                  disabled={rolling}
                >
                  {showManualEntry ? 'HIDE MANUAL' : '✎ MANUAL'}
                </PanelButton>
                <PanelButton variant="primary" onClick={handleRollDice} disabled={rolling}>
                  {rolling ? '· ROLLING ·' : '▶ ROLL DICE'}
                </PanelButton>
              </>
            ) : (
              <PanelButton variant="primary" onClick={handleContinue}>
                CONTINUE →
              </PanelButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Small internal presentational helpers

interface ModifierInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

function ModifierInput({ label, value, onChange, disabled }: ModifierInputProps) {
  return (
    <div>
      <div
        style={{
          ...labelFont,
          fontSize: '0.55rem',
          letterSpacing: '0.25em',
          color: TERMINAL_DIM,
          marginBottom: '0.25rem',
          textAlign: 'center',
        }}
      >
        {label}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="0"
        style={{
          ...monoFont,
          width: '100%',
          background: 'rgba(0,0,0,0.55)',
          border: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.3)}`,
          color: TERMINAL_ACCENT,
          fontSize: '0.95rem',
          fontWeight: 700,
          padding: '0.4rem 0.5rem',
          textAlign: 'center',
          borderRadius: 2,
          outline: 'none',
          opacity: disabled ? 0.55 : 1,
        }}
      />
    </div>
  );
}

interface PanelButtonProps {
  variant: 'primary' | 'ghost';
  onClick: () => void;
  disabled?: boolean;
  full?: boolean;
  children: React.ReactNode;
}

function PanelButton({ variant, onClick, disabled, full, children }: PanelButtonProps) {
  const isPrimary = variant === 'primary';
  const color = isPrimary ? TERMINAL_ACCENT : TERMINAL_DIM;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...labelFont,
        flex: full ? 1 : undefined,
        width: full ? '100%' : undefined,
        fontSize: '0.62rem',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        padding: '0.45rem 0.85rem',
        background: isPrimary ? withAlpha(TERMINAL_ACCENT, 0.1) : 'transparent',
        border: `1px solid ${withAlpha(color, isPrimary ? 0.5 : 0.3)}`,
        color,
        textShadow: isPrimary ? `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.4)}` : 'none',
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
