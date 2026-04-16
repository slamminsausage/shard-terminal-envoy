import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Quest, QuestObjective, QuestStatus } from '@/types/quest';
import { dbHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useCampaign } from './CampaignContext';
import { isItemVisibleToViewer } from '@/lib/crewVisibility';

interface QuestContextType {
  // State
  quests: Quest[];
  questObjectives: Record<string, QuestObjective[]>;
  isLoading: boolean;

  // Quest CRUD
  getAllQuests: () => Promise<void>;
  getQuest: (questId: string) => Promise<Quest | null>;
  createQuest: (questData: Partial<Quest>) => Promise<Quest | null>;
  updateQuest: (questId: string, updates: Partial<Quest>) => Promise<Quest | null>;
  deleteQuest: (questId: string) => Promise<boolean>;

  // Quest status helpers
  completeQuest: (questId: string) => Promise<Quest | null>;
  failQuest: (questId: string) => Promise<Quest | null>;

  // Objectives
  getQuestObjectives: (questId: string) => Promise<QuestObjective[]>;
  addObjective: (questId: string, objective: Omit<QuestObjective, 'id' | 'quest_id' | 'created_at' | 'updated_at'>) => Promise<QuestObjective | null>;
  updateObjective: (objectiveId: string, updates: Partial<QuestObjective>) => Promise<QuestObjective | null>;
  deleteObjective: (objectiveId: string) => Promise<boolean>;
  completeObjective: (objectiveId: string) => Promise<QuestObjective | null>;
  reorderObjective: (questId: string, objectiveId: string, direction: 'up' | 'down') => Promise<void>;

  // Filters
  getQuestsByStatus: (status: QuestStatus) => Quest[];
  getActiveQuests: () => Quest[];
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const useQuest = () => {
  const context = useContext(QuestContext);
  if (context === undefined) {
    throw new Error('useQuest must be used within a QuestProvider');
  }
  return context;
};

interface QuestProviderProps {
  children: ReactNode;
}

export const QuestProvider: React.FC<QuestProviderProps> = ({ children }) => {
  // `allQuests` is the raw unfiltered list from the database. `quests`
  // (exposed on context below) is the per-viewer filtered view: GMs see
  // everything, players see only quests matching their active crew.
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [questObjectives, setQuestObjectives] = useState<Record<string, QuestObjective[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isGM, activeCrewId } = useCampaign();

  const quests = useMemo(() => {
    if (isGM) return allQuests;
    return allQuests.filter(q => isItemVisibleToViewer(q, activeCrewId, isGM));
  }, [allQuests, isGM, activeCrewId]);

  // Load all quests on mount
  const getAllQuests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dbHelpers.getAllQuests();
      setAllQuests(data as Quest[]);
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      toast({
        title: "Error",
        description: "Failed to load quests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    getAllQuests();
  }, [getAllQuests]);

  const getQuest = useCallback(async (questId: string): Promise<Quest | null> => {
    try {
      const data = await dbHelpers.getQuest(questId);
      return data as Quest | null;
    } catch (error) {
      console.error('Failed to fetch quest:', error);
      return null;
    }
  }, []);

  const createQuest = useCallback(async (questData: Partial<Quest>): Promise<Quest | null> => {
    try {
      const newQuest = {
        player_id: 'campaign',
        title: questData.title || 'New Quest',
        status: questData.status || 'active',
        priority: questData.priority || 'medium',
        category: questData.category || 'main',
        reward_credits: questData.reward_credits || 0,
        reward_xp: questData.reward_xp || 0,
        date_accepted: questData.date_accepted || new Date().toISOString(),
        ...questData,
      };

      const saved = await dbHelpers.saveQuest(newQuest);
      const savedQuest = saved as Quest;

      setAllQuests(prev => [savedQuest, ...prev]);

      toast({
        title: "Quest Created",
        description: `${savedQuest.title} has been added to your quest log.`,
      });

      return savedQuest;
    } catch (error) {
      console.error('Failed to create quest:', error);
      toast({
        title: "Error",
        description: "Failed to create quest",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const updateQuest = useCallback(async (questId: string, updates: Partial<Quest>): Promise<Quest | null> => {
    try {
      const updated = await dbHelpers.saveQuest({ id: questId, ...updates });
      const updatedQuest = updated as Quest;

      setAllQuests(prev =>
        prev.map(q => q.id === questId ? updatedQuest : q)
      );

      toast({
        title: "Quest Updated",
        description: "Quest has been updated successfully.",
      });

      return updatedQuest;
    } catch (error) {
      console.error('Failed to update quest:', error);
      toast({
        title: "Error",
        description: "Failed to update quest",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const deleteQuest = useCallback(async (questId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteQuest(questId);

      setAllQuests(prev => prev.filter(q => q.id !== questId));
      setQuestObjectives(prev => {
        const next = { ...prev };
        delete next[questId];
        return next;
      });

      toast({
        title: "Quest Deleted",
        description: "Quest has been removed from your quest log.",
      });

      return true;
    } catch (error) {
      console.error('Failed to delete quest:', error);
      toast({
        title: "Error",
        description: "Failed to delete quest",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const completeQuest = useCallback(async (questId: string): Promise<Quest | null> => {
    return updateQuest(questId, {
      status: 'completed',
      date_completed: new Date().toISOString(),
    });
  }, [updateQuest]);

  const failQuest = useCallback(async (questId: string): Promise<Quest | null> => {
    return updateQuest(questId, {
      status: 'failed',
      date_failed: new Date().toISOString(),
    });
  }, [updateQuest]);

  const getQuestObjectives = useCallback(async (questId: string): Promise<QuestObjective[]> => {
    try {
      const data = await dbHelpers.getQuestObjectives(questId);
      const objectives = data as QuestObjective[];
      setQuestObjectives(prev => ({ ...prev, [questId]: objectives }));
      return objectives;
    } catch (error) {
      console.error('Failed to fetch quest objectives:', error);
      return [];
    }
  }, []);

  const addObjective = useCallback(async (
    questId: string,
    objective: Omit<QuestObjective, 'id' | 'quest_id' | 'created_at' | 'updated_at'>
  ): Promise<QuestObjective | null> => {
    try {
      const objectiveData = {
        quest_id: questId,
        status: 'pending',
        progress_current: 0,
        progress_required: 1,
        is_optional: false,
        order_index: 0,
        ...objective,
      };

      const saved = await dbHelpers.saveQuestObjective(objectiveData);

      // Refresh cache
      const refreshed = await dbHelpers.getQuestObjectives(questId);
      setQuestObjectives(prev => ({ ...prev, [questId]: refreshed as QuestObjective[] }));

      toast({
        title: "Objective Added",
        description: "Quest objective has been added.",
      });

      return saved as QuestObjective;
    } catch (error) {
      console.error('Failed to add objective:', error);
      toast({
        title: "Error",
        description: "Failed to add objective",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const updateObjective = useCallback(async (
    objectiveId: string,
    updates: Partial<QuestObjective>
  ): Promise<QuestObjective | null> => {
    try {
      const updated = await dbHelpers.saveQuestObjective({ id: objectiveId, ...updates });

      // Refresh cache if we know the quest_id
      const questId = updates.quest_id || (updated as any)?.quest_id;
      if (questId) {
        const refreshed = await dbHelpers.getQuestObjectives(questId);
        setQuestObjectives(prev => ({ ...prev, [questId]: refreshed as QuestObjective[] }));
      }

      toast({
        title: "Objective Updated",
        description: "Quest objective has been updated.",
      });

      return updated as QuestObjective;
    } catch (error) {
      console.error('Failed to update objective:', error);
      toast({
        title: "Error",
        description: "Failed to update objective",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const deleteObjective = useCallback(async (objectiveId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteQuestObjective(objectiveId);

      toast({
        title: "Objective Deleted",
        description: "Quest objective has been removed.",
      });

      return true;
    } catch (error) {
      console.error('Failed to delete objective:', error);
      toast({
        title: "Error",
        description: "Failed to delete objective",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const completeObjective = useCallback(async (objectiveId: string): Promise<QuestObjective | null> => {
    return updateObjective(objectiveId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }, [updateObjective]);

  const reorderObjective = useCallback(async (questId: string, objectiveId: string, direction: 'up' | 'down'): Promise<void> => {
    try {
      const cached = questObjectives[questId];
      const objectives = cached || await getQuestObjectives(questId);
      const sorted = [...objectives].sort((a, b) => a.order_index - b.order_index);
      const idx = sorted.findIndex(o => o.id === objectiveId);

      if (idx < 0) return;
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === sorted.length - 1) return;

      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      const objA = sorted[idx];
      const objB = sorted[swapIdx];

      // Swap order_index values
      const tempIndex = objA.order_index;
      const newIndexA = objB.order_index;
      const newIndexB = tempIndex;

      await Promise.all([
        dbHelpers.saveQuestObjective({ id: objA.id, order_index: newIndexA }),
        dbHelpers.saveQuestObjective({ id: objB.id, order_index: newIndexB }),
      ]);

      // Refresh cache
      const refreshed = await dbHelpers.getQuestObjectives(questId);
      setQuestObjectives(prev => ({ ...prev, [questId]: refreshed as QuestObjective[] }));
    } catch (error) {
      console.error('Failed to reorder objective:', error);
      toast({
        title: "Error",
        description: "Failed to reorder objective",
        variant: "destructive",
      });
    }
  }, [questObjectives, getQuestObjectives, toast]);

  // Filter helpers
  const getQuestsByStatus = useCallback((status: QuestStatus): Quest[] => {
    return quests.filter(q => q.status === status);
  }, [quests]);

  const getActiveQuests = useCallback((): Quest[] => {
    return quests.filter(q => q.status === 'active');
  }, [quests]);

  const value: QuestContextType = {
    quests,
    questObjectives,
    isLoading,
    getAllQuests,
    getQuest,
    createQuest,
    updateQuest,
    deleteQuest,
    completeQuest,
    failQuest,
    getQuestObjectives,
    addObjective,
    updateObjective,
    deleteObjective,
    completeObjective,
    reorderObjective,
    getQuestsByStatus,
    getActiveQuests,
  };

  return (
    <QuestContext.Provider value={value}>
      {children}
    </QuestContext.Provider>
  );
};
