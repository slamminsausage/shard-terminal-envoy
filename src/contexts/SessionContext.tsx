import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Session, SessionLogEntry, SessionReward } from '@/types/session';
import { dbHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load all sessions on mount
  const getAllSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dbHelpers.getAllSessions();
      setSessions(data as Session[]);
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
      return data as Session | null;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
  }, []);

  const createSession = useCallback(async (sessionData: Partial<Session>): Promise<Session | null> => {
    try {
      const newSession = {
        player_id: 'campaign',
        session_number: sessions.length + 1,
        session_date: new Date().toISOString(),
        title: sessionData.title || `Session ${sessions.length + 1}`,
        status: sessionData.status || 'planned',
        ...sessionData,
      };

      const saved = await dbHelpers.saveSession(newSession);
      const savedSession = saved as Session;

      setSessions(prev => [savedSession, ...prev]);

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
  }, [sessions.length, toast]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<Session>): Promise<Session | null> => {
    try {
      const updated = await dbHelpers.saveSession({ id: sessionId, ...updates });
      const updatedSession = updated as Session;

      setSessions(prev =>
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

      setSessions(prev => prev.filter(s => s.id !== sessionId));

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
    getSessionRewards,
    addReward,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
