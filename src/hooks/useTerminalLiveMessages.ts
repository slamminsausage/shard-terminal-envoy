import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, dbHelpers, supabaseDisabled } from '@/lib/supabase';

export interface TerminalTransmission {
  id: string;
  terminal_code: string;
  title: string;
  content: string;
  author?: string | null;
  date?: string | null;
  location?: string | null;
  security_level: string;
  expires_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  /** UI-only: marks messages that arrived while player was on a different terminal */
  isUnread?: boolean;
}

interface UseTerminalLiveMessagesOptions {
  /** Currently active terminal code, or null if not connected */
  activeTerminalCode: string | null;
  /** Called whenever a new message arrives (regardless of active terminal) */
  onNewMessage?: (msg: TerminalTransmission) => void;
}

/**
 * Subscribes to GM-injected live transmissions via Supabase Realtime.
 *
 * - Fetches existing transmissions for the active terminal on connect.
 * - Listens for new INSERTs across all terminals so the player can be
 *   notified even when browsing a different terminal.
 * - Returns `messages` (for the active terminal) and `pendingCodes`
 *   (terminal codes with unread messages not currently being viewed).
 */
export function useTerminalLiveMessages({
  activeTerminalCode,
  onNewMessage,
}: UseTerminalLiveMessagesOptions) {
  const [messages, setMessages] = useState<TerminalTransmission[]>([]);
  const [pendingCodes, setPendingCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const activeCodeRef = useRef(activeTerminalCode);
  useEffect(() => { activeCodeRef.current = activeTerminalCode; }, [activeTerminalCode]);

  const onNewMessageRef = useRef(onNewMessage);
  useEffect(() => { onNewMessageRef.current = onNewMessage; }, [onNewMessage]);

  // Fetch existing transmissions for the current terminal
  const fetchForTerminal = useCallback(async (code: string) => {
    if (supabaseDisabled) return;
    setLoading(true);
    try {
      const rows = await dbHelpers.getTerminalTransmissions(code);
      setMessages(rows as TerminalTransmission[]);
    } catch {
      // Non-fatal — transmissions are additive
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever the active terminal changes
  useEffect(() => {
    if (!activeTerminalCode) {
      setMessages([]);
      return;
    }
    fetchForTerminal(activeTerminalCode);
    // Clear pending badge for this terminal now that we're viewing it
    setPendingCodes(prev => {
      if (!prev.has(activeTerminalCode)) return prev;
      const next = new Set(prev);
      next.delete(activeTerminalCode);
      return next;
    });
  }, [activeTerminalCode, fetchForTerminal]);

  // Supabase Realtime subscription — listens for all new transmissions
  useEffect(() => {
    if (supabaseDisabled) return;

    const channel = supabase
      .channel('terminal-transmissions-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'terminal_transmissions' },
        (payload) => {
          const row = payload.new as TerminalTransmission;
          if (!row || row.deleted_at) return;

          // Check expiry client-side
          if (row.expires_at && new Date(row.expires_at) < new Date()) return;

          const currentCode = activeCodeRef.current;

          if (row.terminal_code === currentCode) {
            // Player is on this terminal — inject into the list immediately
            setMessages(prev => [row, ...prev]);
          } else {
            // Player is elsewhere — add to pending badge set
            setPendingCodes(prev => new Set([...prev, row.terminal_code]));
          }

          onNewMessageRef.current?.(row);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'terminal_transmissions' },
        (payload) => {
          const row = payload.new as TerminalTransmission;
          // Handle soft-deletes
          if (row.deleted_at) {
            setMessages(prev => prev.filter(m => m.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // intentionally stable — uses refs for dynamic values

  const clearPending = useCallback((code: string) => {
    setPendingCodes(prev => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  }, []);

  return { messages, pendingCodes, loading, clearPending };
}
