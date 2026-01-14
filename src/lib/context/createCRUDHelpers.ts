/**
 * Factory for creating reusable CRUD helpers for Supabase tables
 * Reduces code duplication across contexts
 */

import { supabase } from "@/integrations/supabase/client";
import { getLocalStorage, setLocalStorage } from "@/lib/localStorage";

export interface CRUDConfig<T> {
  tableName: string;
  localStorageKey: string;
  playerIdField?: string; // Field name for player_id (e.g., 'player_id')
  defaultPlayerId?: string; // Default player ID (e.g., 'campaign')
}

export interface CRUDHelpers<T> {
  getAll: (playerId?: string) => Promise<T[]>;
  getById: (id: string, playerId?: string) => Promise<T | null>;
  save: (item: Partial<T>, playerId?: string) => Promise<T>;
  deleteById: (id: string, playerId?: string) => Promise<boolean>;
  saveToLocalStorage: (items: T[]) => boolean;
  loadFromLocalStorage: () => T[];
}

/**
 * Create CRUD helpers for a Supabase table with localStorage fallback
 * @param config - Configuration for the CRUD helpers
 * @returns Object with CRUD operation functions
 */
export function createCRUDHelpers<T extends { id: string }>(
  config: CRUDConfig<T>
): CRUDHelpers<T> {
  const {
    tableName,
    localStorageKey,
    playerIdField = 'player_id',
    defaultPlayerId = 'campaign'
  } = config;

  const supabaseDisabled =
    import.meta.env?.VITE_DISABLE_SUPABASE === 'true' ||
    ((import.meta.env?.DEV ?? false) && import.meta.env?.VITE_ENABLE_SUPABASE !== 'true');

  /**
   * Get all items from database or localStorage
   */
  const getAll = async (playerId: string = defaultPlayerId): Promise<T[]> => {
    if (supabaseDisabled) {
      return loadFromLocalStorage();
    }

    try {
      const query = supabase
        .from(tableName)
        .select('*')
        .eq(playerIdField, playerId)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return (data as T[]) || [];
    } catch (error) {
      console.error(`Failed to fetch ${tableName}:`, error);
      // Fallback to localStorage
      return loadFromLocalStorage();
    }
  };

  /**
   * Get single item by ID
   */
  const getById = async (id: string, playerId: string = defaultPlayerId): Promise<T | null> => {
    if (supabaseDisabled) {
      const items = loadFromLocalStorage();
      return items.find(item => item.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .eq(playerIdField, playerId)
        .single();

      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`Failed to fetch ${tableName} by id:`, error);
      const items = loadFromLocalStorage();
      return items.find(item => item.id === id) || null;
    }
  };

  /**
   * Save (create or update) an item
   */
  const save = async (item: Partial<T>, playerId: string = defaultPlayerId): Promise<T> => {
    if (supabaseDisabled) {
      const items = loadFromLocalStorage();
      const existingIndex = items.findIndex(i => i.id === item.id);

      let savedItem: T;
      if (existingIndex >= 0) {
        savedItem = { ...items[existingIndex], ...item } as T;
        items[existingIndex] = savedItem;
      } else {
        savedItem = {
          id: item.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          [playerIdField]: playerId,
          ...item
        } as T;
        items.push(savedItem);
      }

      saveToLocalStorage(items);
      return savedItem;
    }

    try {
      const now = new Date().toISOString();
      const dataToSave = {
        ...item,
        [playerIdField]: playerId,
        updated_at: now,
        ...(item.id ? {} : { id: crypto.randomUUID(), created_at: now })
      };

      const { data, error } = await supabase
        .from(tableName)
        .upsert(dataToSave)
        .select()
        .single();

      if (error) throw error;

      // Also save to localStorage as backup
      const allItems = await getAll(playerId);
      saveToLocalStorage(allItems);

      return data as T;
    } catch (error) {
      console.error(`Failed to save ${tableName}:`, error);
      // Fallback to localStorage
      const items = loadFromLocalStorage();
      const savedItem = {
        ...item,
        id: item.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        [playerIdField]: playerId
      } as T;
      const existingIndex = items.findIndex(i => i.id === savedItem.id);
      if (existingIndex >= 0) {
        items[existingIndex] = savedItem;
      } else {
        items.push(savedItem);
      }
      saveToLocalStorage(items);
      return savedItem;
    }
  };

  /**
   * Delete item by ID
   */
  const deleteById = async (id: string, playerId: string = defaultPlayerId): Promise<boolean> => {
    if (supabaseDisabled) {
      const items = loadFromLocalStorage();
      const filtered = items.filter(item => item.id !== id);
      saveToLocalStorage(filtered);
      return true;
    }

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .eq(playerIdField, playerId);

      if (error) throw error;

      // Also remove from localStorage
      const items = loadFromLocalStorage();
      const filtered = items.filter(item => item.id !== id);
      saveToLocalStorage(filtered);

      return true;
    } catch (error) {
      console.error(`Failed to delete ${tableName}:`, error);
      // Fallback to localStorage
      const items = loadFromLocalStorage();
      const filtered = items.filter(item => item.id !== id);
      saveToLocalStorage(filtered);
      return true;
    }
  };

  /**
   * Save items to localStorage
   */
  const saveToLocalStorage = (items: T[]): boolean => {
    return setLocalStorage(localStorageKey, items);
  };

  /**
   * Load items from localStorage
   */
  const loadFromLocalStorage = (): T[] => {
    return getLocalStorage<T[]>(localStorageKey, []);
  };

  return {
    getAll,
    getById,
    save,
    deleteById,
    saveToLocalStorage,
    loadFromLocalStorage
  };
}
