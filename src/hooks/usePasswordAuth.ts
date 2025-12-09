/**
 * usePasswordAuth Hook
 *
 * Manages password authentication state and logic.
 * Replaces duplicated password handling in TerminalInterface.
 *
 * Features:
 * - Attempt tracking with max attempts
 * - Success/failure callbacks
 * - Lock state when attempts exhausted
 * - Reset functionality
 */

import { useState, useCallback } from 'react';

interface UsePasswordAuthOptions {
  correctPassword: string;
  maxAttempts: number;
  onSuccess: () => void;
  onFailure: () => void;
}

interface UsePasswordAuthReturn {
  attempt: (password: string) => boolean;
  reset: () => void;
  attemptsRemaining: number;
  currentAttempts: number;
  isLocked: boolean;
  errorMessage: string;
}

export function usePasswordAuth({
  correctPassword,
  maxAttempts,
  onSuccess,
  onFailure,
}: UsePasswordAuthOptions): UsePasswordAuthReturn {
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const attempt = useCallback(
    (password: string): boolean => {
      if (isLocked) {
        return false;
      }

      const normalizedInput = password.trim().toUpperCase();
      const normalizedCorrect = correctPassword.trim().toUpperCase();

      if (normalizedInput === normalizedCorrect) {
        setErrorMessage('');
        onSuccess();
        return true;
      } else {
        const newAttempts = currentAttempts + 1;
        setCurrentAttempts(newAttempts);

        if (newAttempts >= maxAttempts) {
          setIsLocked(true);
          setErrorMessage('Maximum attempts exceeded. Access denied.');
          onFailure();
        } else {
          const remaining = maxAttempts - newAttempts;
          setErrorMessage(
            `Incorrect password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          );
        }
        return false;
      }
    },
    [correctPassword, maxAttempts, currentAttempts, isLocked, onSuccess, onFailure]
  );

  const reset = useCallback(() => {
    setCurrentAttempts(0);
    setErrorMessage('');
    setIsLocked(false);
  }, []);

  return {
    attempt,
    reset,
    attemptsRemaining: maxAttempts - currentAttempts,
    currentAttempts,
    isLocked,
    errorMessage,
  };
}
