import { useState, useEffect, useCallback } from 'react';
import { dbHelpers } from '@/lib/supabase';

export interface TerminalHistoryEntry {
  terminalCode: string;
  terminalName: string;
  lastAccessed: string;
  accessCount: number;
  logEntriesViewed?: string[]; // Track which log entries have been viewed
}

const HISTORY_STORAGE_KEY = 'terminal_access_history';
const MAX_HISTORY_ENTRIES = 50;

/**
 * Hook for tracking terminal access history
 */
export function useTerminalHistory() {
  const [history, setHistory] = useState<TerminalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to load from Supabase game_settings
      const savedHistory = await dbHelpers.getGameSetting<TerminalHistoryEntry[]>('terminal_history');

      if (savedHistory && Array.isArray(savedHistory)) {
        setHistory(savedHistory);
      } else {
        // Fallback to localStorage
        const localHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (localHistory) {
          const parsed = JSON.parse(localHistory);
          setHistory(Array.isArray(parsed) ? parsed : []);
        }
      }
    } catch (error) {
      console.error('Failed to load terminal history:', error);
      // Try localStorage fallback
      try {
        const localHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (localHistory) {
          const parsed = JSON.parse(localHistory);
          setHistory(Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveHistory = useCallback(async (newHistory: TerminalHistoryEntry[]) => {
    // Save to both localStorage and Supabase
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      await dbHelpers.setGameSetting('terminal_history', newHistory);
    } catch (error) {
      console.error('Failed to save terminal history:', error);
    }
  }, []);

  /**
   * Record a terminal access
   */
  const recordAccess = useCallback((terminalCode: string, terminalName: string) => {
    setHistory(prevHistory => {
      const existingIndex = prevHistory.findIndex(
        entry => entry.terminalCode === terminalCode
      );

      let newHistory: TerminalHistoryEntry[];

      if (existingIndex >= 0) {
        // Update existing entry
        const updated = [...prevHistory];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastAccessed: new Date().toISOString(),
          accessCount: updated[existingIndex].accessCount + 1,
        };
        newHistory = updated;
      } else {
        // Add new entry
        const newEntry: TerminalHistoryEntry = {
          terminalCode,
          terminalName,
          lastAccessed: new Date().toISOString(),
          accessCount: 1,
          logEntriesViewed: [],
        };
        newHistory = [newEntry, ...prevHistory].slice(0, MAX_HISTORY_ENTRIES);
      }

      // Save asynchronously
      saveHistory(newHistory);

      return newHistory;
    });
  }, [saveHistory]);

  /**
   * Record that a log entry was viewed
   */
  const recordLogViewed = useCallback((terminalCode: string, logTitle: string) => {
    setHistory(prevHistory => {
      const existingIndex = prevHistory.findIndex(
        entry => entry.terminalCode === terminalCode
      );

      if (existingIndex < 0) return prevHistory;

      const updated = [...prevHistory];
      const entry = updated[existingIndex];
      const viewedLogs = entry.logEntriesViewed || [];

      if (!viewedLogs.includes(logTitle)) {
        updated[existingIndex] = {
          ...entry,
          logEntriesViewed: [...viewedLogs, logTitle],
        };

        // Save asynchronously
        saveHistory(updated);

        return updated;
      }

      return prevHistory;
    });
  }, [saveHistory]);

  /**
   * Get recent terminal accesses (sorted by last accessed)
   */
  const getRecentAccesses = useCallback((limit: number = 10) => {
    return [...history]
      .sort((a, b) =>
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      )
      .slice(0, limit);
  }, [history]);

  /**
   * Get most accessed terminals
   */
  const getMostAccessed = useCallback((limit: number = 10) => {
    return [...history]
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }, [history]);

  /**
   * Check if a log entry has been viewed
   */
  const hasViewedLog = useCallback((terminalCode: string, logTitle: string) => {
    const entry = history.find(e => e.terminalCode === terminalCode);
    return entry?.logEntriesViewed?.includes(logTitle) || false;
  }, [history]);

  /**
   * Get unviewed log count for a terminal
   */
  const getUnviewedCount = useCallback((terminalCode: string, totalLogs: number) => {
    const entry = history.find(e => e.terminalCode === terminalCode);
    const viewedCount = entry?.logEntriesViewed?.length || 0;
    return Math.max(0, totalLogs - viewedCount);
  }, [history]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(async () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      await dbHelpers.deleteGameSetting('terminal_history');
    } catch (error) {
      console.error('Failed to clear terminal history:', error);
    }
  }, []);

  /**
   * Remove a specific terminal from history
   */
  const removeFromHistory = useCallback((terminalCode: string) => {
    setHistory(prevHistory => {
      const filtered = prevHistory.filter(entry => entry.terminalCode !== terminalCode);
      saveHistory(filtered);
      return filtered;
    });
  }, [saveHistory]);

  return {
    history,
    isLoading,
    recordAccess,
    recordLogViewed,
    getRecentAccesses,
    getMostAccessed,
    hasViewedLog,
    getUnviewedCount,
    clearHistory,
    removeFromHistory,
  };
}
