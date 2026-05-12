import { useState, useEffect, useCallback } from 'react';
import { supabase, dbHelpers, supabaseDisabled } from '@/lib/supabase';

const SETTING_KEY = 'locked_terminals';

/**
 * Tracks GM-locked terminals in real-time.
 *
 * - Reads the `locked_terminals` array from game_settings on mount.
 * - Subscribes to Supabase Realtime changes on that row so all clients
 *   see lock/unlock instantly without a page reload.
 * - Lock/unlock helpers write to Supabase and update local state optimistically.
 */
export function useLockedTerminals() {
  const [lockedCodes, setLockedCodes] = useState<string[]>([]);

  // Initial load
  useEffect(() => {
    if (supabaseDisabled) return;
    dbHelpers.getGameSetting<string[]>(SETTING_KEY)
      .then(val => { if (Array.isArray(val)) setLockedCodes(val); })
      .catch(() => { /* non-fatal */ });
  }, []);

  // Realtime subscription — watch for changes to the locked_terminals row
  useEffect(() => {
    if (supabaseDisabled) return;

    const channel = supabase
      .channel('locked-terminals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_settings',
          filter: `setting_key=eq.${SETTING_KEY}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as { setting_value?: unknown } | null;
          if (!row) return;
          const val = row.setting_value;
          if (Array.isArray(val)) setLockedCodes(val as string[]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const lock = useCallback(async (code: string) => {
    setLockedCodes(prev => prev.includes(code) ? prev : [...prev, code]);
    try {
      const current = await dbHelpers.getGameSetting<string[]>(SETTING_KEY) ?? [];
      const next = current.includes(code) ? current : [...current, code];
      await dbHelpers.setGameSetting(SETTING_KEY, next);
    } catch (err) {
      console.error('Failed to lock terminal:', err);
    }
  }, []);

  const unlock = useCallback(async (code: string) => {
    setLockedCodes(prev => prev.filter(c => c !== code));
    try {
      const current = await dbHelpers.getGameSetting<string[]>(SETTING_KEY) ?? [];
      await dbHelpers.setGameSetting(SETTING_KEY, current.filter(c => c !== code));
    } catch (err) {
      console.error('Failed to unlock terminal:', err);
    }
  }, []);

  const isLocked = useCallback((code: string) => lockedCodes.includes(code), [lockedCodes]);

  return { lockedCodes, lock, unlock, isLocked };
}
