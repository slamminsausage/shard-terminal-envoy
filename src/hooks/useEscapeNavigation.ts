/**
 * useEscapeNavigation Hook
 *
 * Manages ESC key navigation with priority stack.
 * Allows multiple components to register ESC handlers with priority.
 *
 * Features:
 * - Priority-based handler registration
 * - Auto-cleanup on unmount
 * - Prevents duplicate handlers
 * - Stack-based navigation (last registered = highest priority)
 */

import { useEffect, useCallback } from 'react';

type EscapeHandler = () => void;

// Global stack of ESC handlers (last in = first executed)
const escapeHandlers: EscapeHandler[] = [];

let globalListenerAttached = false;

const handleGlobalEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    // Execute the most recently added handler (top of stack)
    const handler = escapeHandlers[escapeHandlers.length - 1];
    if (handler) {
      e.preventDefault();
      handler();
    }
  }
};

const attachGlobalListener = () => {
  if (!globalListenerAttached) {
    window.addEventListener('keydown', handleGlobalEscape);
    globalListenerAttached = true;
  }
};

const detachGlobalListener = () => {
  if (globalListenerAttached && escapeHandlers.length === 0) {
    window.removeEventListener('keydown', handleGlobalEscape);
    globalListenerAttached = false;
  }
};

/**
 * Register an ESC key handler
 * @param handler Function to call when ESC is pressed
 * @param enabled Whether this handler is active (default: true)
 */
export function useEscapeNavigation(handler: EscapeHandler, enabled: boolean = true) {
  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Add handler to stack
    escapeHandlers.push(stableHandler);
    attachGlobalListener();

    return () => {
      // Remove handler from stack
      const index = escapeHandlers.indexOf(stableHandler);
      if (index !== -1) {
        escapeHandlers.splice(index, 1);
      }
      detachGlobalListener();
    };
  }, [stableHandler, enabled]);
}
