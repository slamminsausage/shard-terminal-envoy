import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { Session, SessionLogEntry, SessionReward } from '@/types/session';
import { dbHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useCampaign } from '@/contexts/CampaignContext';
import { isItemVisibleToViewer } from '@/lib/crewVisibility';

interface SessionContextType {
  // State
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;

  // Session CRUD
  getAllSessions: () => Promise<void>;
  getSession: (sessionId: string) => Promise<Session | null>;
  createSession: (sessionData: Partial<Session>) => Promise<Session | null>;
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<Session | null>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  setCurrentSession: (session: Session | null) => void;

  // Log Entries
  getSessionLogs: (sessionId: string) => Promise<SessionLogEntry[]>;
  addLogEntry: (sessionId: string, entry: Omit<SessionLogEntry, 'id' | 'created_at'>) => Promise<SessionLogEntry | null>;
  updateLogEntry: (entryId: string, updates: Partial<SessionLogEntry>) => Promise<SessionLogEntry | null>;
  deleteLogEntry: (entryId: string) => Promise<boolean>;

  // Rewards
  getSessionRewards: (sessionId: string) => Promise<SessionReward[]>;
  addReward: (sessionId: string, reward: Omit<SessionReward, 'id' | 'created_at'>) => Promise<SessionReward | null>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isGM, activeCrewId } = useCampaign();

  // Mirror allSessions in a ref so createSession can compute session_number
  // from the latest length even when two creates fire faster than React renders.
  const allSessionsRef = useRef<Session[]>([]);
  useEffect(() => { allSessionsRef.current = allSessions; }, [allSessions]);

  const sessions = useMemo(() => {
    if (isGM) return allSessions;
    return allSessions.filter((s) => isItemVisibleToViewer(s, activeCrewId, isGM));
  }, [allSessions, isGM, activeCrewId]);

  // Load all sessions on mount
  const getAllSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dbHelpers.getAllSessions();
      setAllSessions(data as Session[]);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    getAllSessions();
  }, [getAllSessions]);

  const getSession = useCallback(async (sessionId: string): Promise<Session | null> => {
    try {
      const data = await dbHelpers.getSession(sessionId);
      const session = data as Session | null;
      if (!session) return null;
      // Enforce crew scoping on per-ID reads so a non-GM cannot view a
      // crew-scoped session (or its logs) by deep-linking or remaining on
      // the detail page after switching active character.
      if (!isItemVisibleToViewer(session, activeCrewId, isGM)) return null;
      return session;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
  }, [activeCrewId, isGM]);

  const createSession = useCallback(async (sessionData: Partial<Session>): Promise<Session | null> => {
    try {
      // Compute session_number from the highest existing number, not array
      // length, to avoid duplicate numbers if two creates fire faster than
      // React renders (length captured stale) or if a session was deleted.
      const existing = allSessionsRef.current;
      const maxNumber = existing.reduce(
        (m, s) => (typeof s.session_number === 'number' && s.session_number > m ? s.session_number : m),
        0
      );
      const nextNumber = maxNumber + 1;

      const newSession = {
        player_id: 'campaign',
        session_number: nextNumber,
        session_date: new Date().toISOString(),
        title: sessionData.title || `Session ${nextNumber}`,
        status: sessionData.status || 'planned',
        ...sessionData,
      };

      const saved = await dbHelpers.saveSession(newSession);
      const savedSession = saved as Session;

      setAllSessions(prev => {
        const next = [savedSession, ...prev];
        allSessionsRef.current = next; // keep ref in sync immediately for back-to-back creates
        return next;
      });

      toast({
        title: "Session Created",
        description: `${savedSession.title} has been created.`,
      });

      return savedSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<Session>): Promise<Session | null> => {
    try {
      const updated = await dbHelpers.saveSession({ id: sessionId, ...updates });
      const updatedSession = updated as Session;

      setAllSessions(prev =>
        prev.map(s => s.id === sessionId ? updatedSession : s)
      );

      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }

      toast({
        title: "Session Updated",
        description: "Session has been updated successfully.",
      });

      return updatedSession;
    } catch (error) {
      console.error('Failed to update session:', error);
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
      return null;
    }
  }, [currentSession, toast]);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteSession(sessionId);

      setAllSessions(prev => prev.filter(s => s.id !== sessionId));

      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }

      toast({
        title: "Session Deleted",
        description: "Session has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
      return false;
    }
  }, [currentSession, toast]);

  const getSessionLogs = useCallback(async (sessionId: string): Promise<SessionLogEntry[]> => {
    try {
      const data = await dbHelpers.getSessionLogEntries(sessionId);
      return data as SessionLogEntry[];
    } catch (error) {
      console.error('Failed to fetch session logs:', error);
      return [];
    }
  }, []);

  const addLogEntry = useCallback(async (
    sessionId: string,
    entry: Omit<SessionLogEntry, 'id' | 'created_at'>
  ): Promise<SessionLogEntry | null> => {
    try {
      const logEntry = {
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        ...entry,
      };

      const saved = await dbHelpers.saveSessionLogEntry(logEntry);

      toast({
        title: "Log Entry Added",
        description: "Session log entry has been recorded.",
      });

      return saved as SessionLogEntry;
    } catch (error) {
      console.error('Failed to add log entry:', error);
      toast({
        title: "Error",
        description: "Failed to add log entry",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const updateLogEntry = useCallback(async (
    entryId: string,
    updates: Partial<SessionLogEntry>
  ): Promise<SessionLogEntry | null> => {
    try {
      const saved = await dbHelpers.updateSessionLogEntry(entryId, updates);
      toast({
        title: "Log Entry Updated",
        description: "Session log entry has been saved.",
      });
      return saved as SessionLogEntry;
    } catch (error) {
      console.error('Failed to update log entry:', error);
      toast({
        title: "Error",
        description: "Failed to update log entry",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const deleteLogEntry = useCallback(async (entryId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteSessionLogEntry(entryId);
      toast({
        title: "Log Entry Deleted",
        description: "Session log entry has been removed.",
      });
      return true;
    } catch (error) {
      console.error('Failed to delete log entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete log entry",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const getSessionRewards = useCallback(async (sessionId: string): Promise<SessionReward[]> => {
    try {
      const data = await dbHelpers.getSessionRewards(sessionId);
      return data as SessionReward[];
    } catch (error) {
      console.error('Failed to fetch session rewards:', error);
      return [];
    }
  }, []);

  const addReward = useCallback(async (
    sessionId: string,
    reward: Omit<SessionReward, 'id' | 'created_at'>
  ): Promise<SessionReward | null> => {
    try {
      const rewardData = {
        session_id: sessionId,
        ...reward,
      };

      const saved = await dbHelpers.saveSessionReward(rewardData);

      toast({
        title: "Reward Added",
        description: "Session reward has been recorded.",
      });

      return saved as SessionReward;
    } catch (error) {
      console.error('Failed to add reward:', error);
      toast({
        title: "Error",
        description: "Failed to add reward",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const value: SessionContextType = {
    sessions,
    currentSession,
    isLoading,
    getAllSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    setCurrentSession,
    getSessionLogs,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
    getSessionRewards,
    addReward,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
