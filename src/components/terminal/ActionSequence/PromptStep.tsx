import React, { useState, useRef, useEffect } from 'react';
import audioManager from '@/lib/audioManager';
import type { PromptStep as PromptStepType } from '@/types/terminalAction';

interface PromptStepProps {
  step: PromptStepType;
  onComplete: () => void;
  onFail: () => void;
}

export default function PromptStep({ step, onComplete, onFail }: PromptStepProps) {
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
    const trimmed = input.trim().toUpperCase();

    if (!trimmed) return;

    const isAccepted = step.accept.some(a => a.toUpperCase() === trimmed);

    if (isAccepted) {
      setAccepted(true);
      setErrorMsg('');
      audioManager.playEffect((step.sound_on_accept || 'access_granted'));
      setTimeout(onComplete, 600);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setInput('');
      audioManager.playEffect((step.sound_on_reject || 'access_denied'));

      if (newAttempts >= maxAttempts) {
        setErrorMsg('MAX ATTEMPTS EXCEEDED. SECURITY LOCKOUT.');
        setTimeout(onFail, 1200);
      } else {
        setErrorMsg(step.reject_message || 'INVALID INPUT. TRY AGAIN.');
      }
    }
  };

  return (
    <div className="font-mono text-sm space-y-3">
      <div className="text-terminal-primary font-bold">{step.prompt_text}</div>

      {errorMsg && (
        <div className="text-red-400 text-xs animate-pulse">{errorMsg}</div>
      )}

      {accepted ? (
        <div className="text-green-400 font-bold">
          {'>> INPUT ACCEPTED'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-terminal-primary">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            className="flex-1 bg-transparent border-b border-terminal-primary/40 text-terminal-primary
                       font-mono text-sm outline-none focus:border-terminal-primary/80 py-1
                       caret-terminal-primary"
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
