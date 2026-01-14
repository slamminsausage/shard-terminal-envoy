/**
 * Keyboard Shortcuts Help Dialog
 * Shows all available keyboard shortcuts in the application
 * Opens with "?" key
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['1'], description: 'Terminal tab' },
      { keys: ['2'], description: 'Crew tab' },
      { keys: ['3'], description: 'Hangar tab' },
      { keys: ['4'], description: 'Bridge tab' },
      { keys: ['5'], description: 'Star Map tab' },
      { keys: ['6'], description: 'Notes tab' },
      { keys: ['7'], description: 'Combat tab' },
    ],
  },
  {
    title: 'Search',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Open global search' },
      { keys: ['Ctrl', 'F'], description: 'Open global search' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close dialog/go back' },
    ],
  },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open shortcuts dialog with "?" (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if user is typing in an input/textarea
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-terminal-bg-panel border-terminal-primary-mid">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-terminal-primary font-['Orbitron']">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-terminal-text-dimmer">
            Quick reference for all available keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-terminal-primary-light mb-3 font-['Orbitron'] tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded bg-terminal-bg-darker border border-terminal-bg-border hover:border-terminal-primary-dim/30 transition-colors"
                  >
                    <span className="text-terminal-text-muted text-sm">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-terminal-text-dimmer mx-1">+</span>
                          )}
                          <kbd className="px-2 py-1 text-xs font-mono bg-terminal-bg-panel border border-terminal-primary-dim/40 rounded text-terminal-primary-light shadow-sm">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-terminal-bg-border">
          <p className="text-xs text-terminal-text-dimmer text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-terminal-bg-darker border border-terminal-primary-dim/40 rounded text-terminal-primary-light">Esc</kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
