import React, { useState, useRef, useEffect } from 'react';
import audioManager from '@/lib/audioManager';
import type { ChoiceStep as ChoiceStepType } from '@/types/terminalAction';

interface ChoiceStepProps {
  step: ChoiceStepType;
  onComplete: (chosenIndex: number) => void;
  onFail: () => void;
}

export default function ChoiceStep({ step, onComplete, onFail }: ChoiceStepProps) {
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [accepted, setAccepted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxAttempts = step.max_attempts ?? 3;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    const num = parseInt(trimmed, 10);

    if (isNaN(num) || num < 1 || num > step.options.length) {
      setErrorMsg(`ENTER A NUMBER BETWEEN 1 AND ${step.options.length}`);
      setInput('');
      return;
    }

    const chosenIndex = num - 1; // convert to 0-based

    // If correct indices specified, validate
    if (step.correct && step.correct.length > 0) {
      if (!step.correct.includes(chosenIndex)) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setInput('');
        audioManager.playEffect((step.sound_on_reject || 'access_denied'));

        if (newAttempts >= maxAttempts) {
          setErrorMsg('MAX ATTEMPTS EXCEEDED. SECURITY LOCKOUT.');
          setTimeout(onFail, 1200);
        } else {
          setErrorMsg(step.reject_message || 'INVALID SELECTION. TRY AGAIN.');
        }
        return;
      }
    }

    // Accepted
    setAccepted(true);
    setErrorMsg('');
    audioManager.playEffect((step.sound_on_accept || 'access_granted'));
    setTimeout(() => onComplete(chosenIndex), 600);
  };

  return (
    <div className="font-mono text-sm space-y-3">
      <div className="text-terminal-primary font-bold">{step.prompt_text}</div>

      <div className="space-y-1 pl-2">
        {step.options.map((opt, i) => (
          <div
            key={i}
            className="text-terminal-primary/80 hover:text-terminal-primary cursor-default"
          >
            <span className="text-terminal-primary/50">[{i + 1}]</span> {opt}
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="text-red-400 text-xs animate-pulse">{errorMsg}</div>
      )}

      {accepted ? (
        <div className="text-green-400 font-bold">
          {'>> SELECTION CONFIRMED'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-terminal-primary">SELECT &gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-12 bg-transparent border-b border-terminal-primary/40 text-terminal-primary
                       font-mono text-sm outline-none focus:border-terminal-primary/80 py-1
                       caret-terminal-primary text-center"
            autoComplete="off"
            spellCheck={false}
            disabled={accepted}
          />
          <span className="text-terminal-primary/40 text-xs">
            [{attempts}/{maxAttempts}]
          </span>
        </form>
      )}
    </div>
  );
}
