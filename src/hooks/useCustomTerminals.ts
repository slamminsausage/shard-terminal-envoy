/**
 * useCustomTerminals — fetches GM-created terminals from Supabase and merges
 * them with the static TERMINALS array so the rest of the terminal system
 * treats them identically.
 *
 * Also exposes CRUD helpers used by GMTerminalBuilder.
 */

import { useState, useEffect, useCallback } from 'react';
import { dbHelpers } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import type { TerminalDefinition } from '@/lib/terminals';

export interface CustomTerminal {
  id: string;
  code: string;
  name: string;
  category: string;
  requires_roll: number | null;
  description: string | null;
  archived: boolean;
  created_at: string;
}

export interface CustomTerminalLog {
  id: string;
  terminal_code: string;
  title: string;
  content: string;
  author: string | null;
  date: string | null;
  location: string | null;
  security_level: string;
  requires_password: boolean;
  password: string | null;
  audio_file: string | null;
  video_file: string | null;
  sort_order: number;
}

export function useCustomTerminals() {
  const [customTerminals, setCustomTerminals] = useState<CustomTerminal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await dbHelpers.getCustomTerminals();
      setCustomTerminals(data as CustomTerminal[]);
    } catch (err) {
      console.error('useCustomTerminals: failed to load', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Realtime: refresh when custom_terminals changes
    const channel = supabase
      .channel('custom_terminals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_terminals',
      }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  /** Convert custom terminal rows to TerminalDefinition shape for compatibility */
  const asTerminalDefinitions = useCallback((): TerminalDefinition[] => {
    return customTerminals.map(ct => ({
      code: ct.code,
      name: ct.name,
      // Custom terminals fetch logs from Supabase; logPath is a sentinel value
      logPath: `__custom__:${ct.code}`,
      requiresRoll: ct.requires_roll ?? undefined,
    }));
  }, [customTerminals]);

  const createTerminal = useCallback(async (payload: {
    code: string;
    name: string;
    category?: string;
    requires_roll?: number | null;
    description?: string;
  }) => {
    const row = await dbHelpers.createCustomTerminal(payload);
    setCustomTerminals(prev => [...prev, row as CustomTerminal]);
    return row as CustomTerminal;
  }, []);

  const archiveTerminal = useCallback(async (id: string) => {
    await dbHelpers.updateCustomTerminal(id, { archived: true });
    setCustomTerminals(prev => prev.filter(t => t.id !== id));
  }, []);

  const getLogs = useCallback(async (terminalCode: string): Promise<CustomTerminalLog[]> => {
    const data = await dbHelpers.getCustomTerminalLogs(terminalCode);
    return data as CustomTerminalLog[];
  }, []);

  const createLog = useCallback(async (payload: Parameters<typeof dbHelpers.createCustomTerminalLog>[0]) => {
    return await dbHelpers.createCustomTerminalLog(payload) as CustomTerminalLog;
  }, []);

  const updateLog = useCallback(async (id: string, updates: Parameters<typeof dbHelpers.updateCustomTerminalLog>[1]) => {
    return await dbHelpers.updateCustomTerminalLog(id, updates) as CustomTerminalLog;
  }, []);

  const deleteLog = useCallback(async (id: string) => {
    await dbHelpers.deleteCustomTerminalLog(id);
  }, []);

  return {
    customTerminals,
    loading,
    asTerminalDefinitions,
    createTerminal,
    archiveTerminal,
    getLogs,
    createLog,
    updateLog,
    deleteLog,
    refresh: load,
  };
}
