// Use the integrated Supabase client instead of environment variables
import { supabase } from "@/integrations/supabase/client";
import type { WorldNote } from "@/types/navigation";

// Re-export for convenience
export { supabase };

const isDev = import.meta.env?.DEV ?? false;
const supabaseDisabled =
  import.meta.env?.VITE_DISABLE_SUPABASE === 'true' ||
  (isDev && import.meta.env?.VITE_ENABLE_SUPABASE !== 'true');

const LOCAL_UNLOCKED_KEY = 'dev_unlocked_terminals';
const LOCAL_WORLD_NOTES_KEY = 'dev_world_notes';
const fallbackUnlocked = [
  'lysani01',
  's.elara01',
  'slocombe875',
  'waferterm01',
  'labpc81',
  'vanagandr001',
  'blackcircuit01',
  'fuw01',
  'azura01',
  'vennik01',
  'caldonis_public',
  'es1-delta',
  'es1-gamma',
  'blacktalon',
  'vennik-personal'
];

const getLocalUnlockedTerminals = () => {
  try {
    const raw = localStorage.getItem(LOCAL_UNLOCKED_KEY);
    if (!raw) return fallbackUnlocked;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallbackUnlocked;
  } catch {
    return fallbackUnlocked;
  }
};

const addLocalUnlockedTerminal = (terminalCode: string) => {
  const existing = getLocalUnlockedTerminals();
  if (existing.includes(terminalCode)) return existing;
  const updated = [...existing, terminalCode];
  localStorage.setItem(LOCAL_UNLOCKED_KEY, JSON.stringify(updated));
  return updated;
};

// World notes localStorage helpers
const getLocalWorldNotes = (): WorldNote[] => {
  try {
    const raw = localStorage.getItem(LOCAL_WORLD_NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocalWorldNotes = (notes: WorldNote[]): void => {
  localStorage.setItem(LOCAL_WORLD_NOTES_KEY, JSON.stringify(notes));
};

const getLocalWorldNote = (sector: string, hex: string): WorldNote | null => {
  const notes = getLocalWorldNotes();
  return notes.find(
    (n) => n.sector.toLowerCase() === sector.toLowerCase() && n.hex === hex
  ) || null;
};

const saveLocalWorldNote = (note: WorldNote): WorldNote => {
  const notes = getLocalWorldNotes();
  const existingIndex = notes.findIndex(
    (n) => n.sector.toLowerCase() === note.sector.toLowerCase() && n.hex === note.hex
  );

  const now = new Date().toISOString();
  const updatedNote: WorldNote = {
    ...note,
    id: note.id || `local-${Date.now()}`,
    updated_at: now,
    created_at: note.created_at || now,
  };

  if (existingIndex >= 0) {
    notes[existingIndex] = updatedNote;
  } else {
    notes.push(updatedNote);
  }

  saveLocalWorldNotes(notes);
  return updatedNote;
};

const deleteLocalWorldNote = (sector: string, hex: string): boolean => {
  const notes = getLocalWorldNotes();
  const filtered = notes.filter(
    (n) => !(n.sector.toLowerCase() === sector.toLowerCase() && n.hex === hex)
  );
  saveLocalWorldNotes(filtered);
  return filtered.length < notes.length;
};

// Database helper functions
export const dbHelpers = {
  // Characters
  async getAllCharacters() {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Database error:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Failed to fetch characters:', error)
      return []
    }
  },

  async saveCharacter(characterData: any) {
    try {
      if (characterData.id) {
        // Update existing character
        const { data, error } = await supabase
          .from('characters')
          .update({
            ...characterData,
            updated_at: new Date().toISOString()
          })
          .eq('id', characterData.id)
          .select()
          .single()
        
        if (error) {
          console.error('Database error:', error)
          throw error
        }
        return data
      } else {
        // Create new character
        const { data, error } = await supabase
          .from('characters')
          .insert([{
            ...characterData,
            player_id: 'campaign', // Use a fixed player_id for campaign mode
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()
        
        if (error) {
          console.error('Database error:', error)
          throw error
        }
        return data
      }
    } catch (error) {
      console.error('Failed to save character:', error)
      throw error
    }
  },

  async deleteCharacter(characterId: string) {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId)
    
    if (error) throw error
    return true
  },

  // Vehicles
  async getAllVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async saveVehicle(vehicleData: any) {
    if (vehicleData.id) {
      // Update existing vehicle
      const { data, error } = await supabase
        .from('vehicles')
        .update({
          ...vehicleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleData.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      // Create new vehicle
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          ...vehicleData,
          player_id: 'campaign', // Use a fixed player_id for campaign mode
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  async deleteVehicle(vehicleId: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
    
    if (error) throw error
    return true
  },

  // Unlocked Terminals
  async getUnlockedTerminals() {
    if (supabaseDisabled) return getLocalUnlockedTerminals();

    try {
      const { data, error } = await supabase
        .from('unlocked_terminals')
        .select('terminal_code')
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Database error:', error)
        return []
      }
      return (data || []).map(item => item.terminal_code)
    } catch (error) {
      console.error('Failed to fetch unlocked terminals:', error)
      return []
    }
  },

  async addUnlockedTerminal(terminalCode: string) {
    if (supabaseDisabled) {
      addLocalUnlockedTerminal(terminalCode);
      return true;
    }

    try {
      const { error } = await supabase
        .from('unlocked_terminals')
        .insert([{ terminal_code: terminalCode }])

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        console.error('Database error:', error)
        throw error
      }
      return true
    } catch (error) {
      console.error('Failed to add unlocked terminal:', error)
      throw error
    }
  },

  // World Notes
  async getWorldNote(sector: string, hex: string): Promise<WorldNote | null> {
    if (supabaseDisabled) {
      return getLocalWorldNote(sector, hex);
    }

    try {
      const { data, error } = await supabase
        .from('world_notes')
        .select('*')
        .ilike('sector', sector)
        .eq('hex', hex)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Database error:', error);
        return null;
      }

      return data as WorldNote;
    } catch (error) {
      console.error('Failed to fetch world note:', error);
      return null;
    }
  },

  async getAllWorldNotes(): Promise<WorldNote[]> {
    if (supabaseDisabled) {
      return getLocalWorldNotes();
    }

    try {
      const { data, error } = await supabase
        .from('world_notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      return (data || []) as WorldNote[];
    } catch (error) {
      console.error('Failed to fetch world notes:', error);
      return [];
    }
  },

  async saveWorldNote(note: WorldNote): Promise<WorldNote | null> {
    if (supabaseDisabled) {
      return saveLocalWorldNote(note);
    }

    try {
      const now = new Date().toISOString();

      if (note.id && !note.id.startsWith('local-')) {
        // Update existing note
        const { data, error } = await supabase
          .from('world_notes')
          .update({
            ...note,
            updated_at: now,
          })
          .eq('id', note.id)
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        return data as WorldNote;
      } else {
        // Check if note already exists for this location
        const existing = await this.getWorldNote(note.sector, note.hex);

        if (existing?.id) {
          // Update existing
          const { data, error } = await supabase
            .from('world_notes')
            .update({
              ...note,
              id: existing.id,
              updated_at: now,
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (error) {
            console.error('Database error:', error);
            throw error;
          }

          return data as WorldNote;
        } else {
          // Insert new
          const { id: _id, ...noteWithoutId } = note;
          const { data, error } = await supabase
            .from('world_notes')
            .insert([{
              ...noteWithoutId,
              created_at: now,
              updated_at: now,
            }])
            .select()
            .single();

          if (error) {
            console.error('Database error:', error);
            throw error;
          }

          return data as WorldNote;
        }
      }
    } catch (error) {
      console.error('Failed to save world note:', error);
      throw error;
    }
  },

  async deleteWorldNote(sector: string, hex: string): Promise<boolean> {
    if (supabaseDisabled) {
      return deleteLocalWorldNote(sector, hex);
    }

    try {
      const { error } = await supabase
        .from('world_notes')
        .delete()
        .ilike('sector', sector)
        .eq('hex', hex);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete world note:', error);
      throw error;
    }
  },

  async getWorldNotesForSector(sector: string): Promise<WorldNote[]> {
    if (supabaseDisabled) {
      const notes = getLocalWorldNotes();
      return notes.filter(
        (n) => n.sector.toLowerCase() === sector.toLowerCase()
      );
    }

    try {
      const { data, error } = await supabase
        .from('world_notes')
        .select('*')
        .ilike('sector', sector)
        .order('hex', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      return (data || []) as WorldNote[];
    } catch (error) {
      console.error('Failed to fetch sector world notes:', error);
      return [];
    }
  }
}
