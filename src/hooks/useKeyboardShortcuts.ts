import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
  action: (e: KeyboardEvent) => void;
}

/**
 * Custom hook for registering keyboard shortcuts
 * @param shortcuts Array of keyboard shortcut configurations
 * @param enabled Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key === shortcut.key || e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          if (shortcut.preventDefault) {
            e.preventDefault();
          }
          shortcut.action(e);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Hook for tab navigation shortcuts (1-7 for switching tabs)
 * @param onTabChange Callback when tab changes
 * @param tabIds Array of tab IDs in order
 * @param enabled Whether shortcuts are enabled (default: true)
 */
export function useTabNavigationShortcuts(
  onTabChange: (tabId: string) => void,
  tabIds: string[],
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check for number keys 1-7
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= tabIds.length) {
        e.preventDefault();
        const tabId = tabIds[num - 1];
        onTabChange(tabId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onTabChange, tabIds, enabled]);
}
