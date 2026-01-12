// Use the integrated Supabase client instead of environment variables
import { supabase } from "@/integrations/supabase/client";
import type { WorldNote, HexMarker } from "@/types/navigation";

// Re-export for convenience
export { supabase };

const isDev = import.meta.env?.DEV ?? false;
const supabaseDisabled =
  import.meta.env?.VITE_DISABLE_SUPABASE === 'true' ||
  (isDev && import.meta.env?.VITE_ENABLE_SUPABASE !== 'true');

const LOCAL_UNLOCKED_KEY = 'dev_unlocked_terminals';
const LOCAL_WORLD_NOTES_KEY = 'dev_world_notes';
const LOCAL_HEX_MARKERS_KEY = 'dev_hex_markers';
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
  'es1-omegalab',
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

// Hex markers localStorage helpers
const getLocalHexMarkers = (): HexMarker[] => {
  try {
    const raw = localStorage.getItem(LOCAL_HEX_MARKERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocalHexMarkers = (markers: HexMarker[]): void => {
  localStorage.setItem(LOCAL_HEX_MARKERS_KEY, JSON.stringify(markers));
};

const getLocalHexMarkersForHex = (sector: string, hex: string): HexMarker[] => {
  const markers = getLocalHexMarkers();
  return markers.filter(
    (m) => m.sector.toLowerCase() === sector.toLowerCase() && m.hex === hex
  );
};

const saveLocalHexMarker = (marker: HexMarker): HexMarker => {
  const markers = getLocalHexMarkers();

  const now = new Date().toISOString();
  const updatedMarker: HexMarker = {
    ...marker,
    id: marker.id || `local-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    updated_at: now,
    created_at: marker.created_at || now,
  };

  if (marker.id) {
    const existingIndex = markers.findIndex((m) => m.id === marker.id);
    if (existingIndex >= 0) {
      markers[existingIndex] = updatedMarker;
    } else {
      markers.push(updatedMarker);
    }
  } else {
    markers.push(updatedMarker);
  }

  saveLocalHexMarkers(markers);
  return updatedMarker;
};

const deleteLocalHexMarker = (id: string): boolean => {
  const markers = getLocalHexMarkers();
  const filtered = markers.filter((m) => m.id !== id);
  saveLocalHexMarkers(filtered);
  return filtered.length < markers.length;
};

// Game settings localStorage helpers
const LOCAL_GAME_SETTINGS_PREFIX = 'game_setting_';

const getLocalGameSetting = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(`${LOCAL_GAME_SETTINGS_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const saveLocalGameSetting = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`${LOCAL_GAME_SETTINGS_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save game setting to localStorage:', error);
  }
};

const removeLocalGameSetting = (key: string): void => {
  try {
    localStorage.removeItem(`${LOCAL_GAME_SETTINGS_PREFIX}${key}`);
  } catch (error) {
    console.error('Failed to remove game setting from localStorage:', error);
  }
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

      // Ignore unique constraint violations (23505 is PostgreSQL code, 409 is HTTP status for conflicts)
      if (error && error.code !== '23505' && (error as any).status !== 409) {
        console.error('Database error:', error)
        throw error
      }
      return true
    } catch (error: any) {
      // Also catch and ignore duplicate key errors that bubble up as exceptions
      if (error?.code === '23505' || error?.status === 409 || error?.message?.includes('duplicate')) {
        return true; // Terminal already unlocked, this is fine
      }
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
        .eq('sector', sector)
        .eq('hex', hex)
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        return null;
      }

      return data as WorldNote | null;
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
        .eq('sector', sector)
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
        .eq('sector', sector)
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
  },

  // Game Settings - key-value store for persistent campaign state
  async getGameSetting<T>(key: string): Promise<T | null> {
    if (supabaseDisabled) {
      return getLocalGameSetting<T>(key);
    }

    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        // Fall back to localStorage on error
        return getLocalGameSetting<T>(key);
      }

      return data?.setting_value as T | null;
    } catch (error) {
      console.error('Failed to fetch game setting:', error);
      // Fall back to localStorage on error
      return getLocalGameSetting<T>(key);
    }
  },

  async setGameSetting<T>(key: string, value: T): Promise<boolean> {
    // Always save to localStorage as backup
    saveLocalGameSetting(key, value);

    if (supabaseDisabled) {
      return true;
    }

    try {
      const now = new Date().toISOString();

      // Use upsert to insert or update
      const { error } = await supabase
        .from('game_settings')
        .upsert({
          setting_key: key,
          setting_value: value as any,
          updated_at: now,
        }, {
          onConflict: 'setting_key',
        });

      if (error) {
        console.error('Database error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to save game setting:', error);
      return false;
    }
  },

  async deleteGameSetting(key: string): Promise<boolean> {
    // Remove from localStorage
    removeLocalGameSetting(key);

    if (supabaseDisabled) {
      return true;
    }

    try {
      const { error } = await supabase
        .from('game_settings')
        .delete()
        .eq('setting_key', key);

      if (error) {
        console.error('Database error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete game setting:', error);
      return false;
    }
  },

  // Hex Markers
  async getHexMarkers(sector: string, hex: string): Promise<HexMarker[]> {
    if (supabaseDisabled) {
      return getLocalHexMarkersForHex(sector, hex);
    }

    try {
      const { data, error } = await supabase
        .from('hex_markers')
        .select('*')
        .eq('sector', sector)
        .eq('hex', hex)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      return (data || []) as HexMarker[];
    } catch (error) {
      console.error('Failed to fetch hex markers:', error);
      return [];
    }
  },

  async getAllHexMarkers(): Promise<HexMarker[]> {
    if (supabaseDisabled) {
      return getLocalHexMarkers();
    }

    try {
      const { data, error } = await supabase
        .from('hex_markers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      return (data || []) as HexMarker[];
    } catch (error) {
      console.error('Failed to fetch all hex markers:', error);
      return [];
    }
  },

  async getHexMarkersForSector(sector: string): Promise<HexMarker[]> {
    if (supabaseDisabled) {
      const markers = getLocalHexMarkers();
      return markers.filter(
        (m) => m.sector.toLowerCase() === sector.toLowerCase()
      );
    }

    try {
      const { data, error } = await supabase
        .from('hex_markers')
        .select('*')
        .eq('sector', sector)
        .order('hex', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      return (data || []) as HexMarker[];
    } catch (error) {
      console.error('Failed to fetch sector hex markers:', error);
      return [];
    }
  },

  async getActiveMarkers(sector?: string): Promise<HexMarker[]> {
    if (supabaseDisabled) {
      const markers = getLocalHexMarkers();
      const activeMarkers = markers.filter((m) => m.is_active !== false);
      if (sector) {
        return activeMarkers.filter(
          (m) => m.sector.toLowerCase() === sector.toLowerCase()
        );
      }
      return activeMarkers;
    }

    try {
      let query = supabase
        .from('hex_markers')
        .select('*')
        .eq('is_active', true);

      if (sector) {
        query = query.eq('sector', sector);
      }

      const { data, error } = await query
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      return (data || []) as HexMarker[];
    } catch (error) {
      console.error('Failed to fetch active markers:', error);
      return [];
    }
  },

  async saveHexMarker(marker: HexMarker): Promise<HexMarker | null> {
    if (supabaseDisabled) {
      return saveLocalHexMarker(marker);
    }

    try {
      const now = new Date().toISOString();

      if (marker.id && !marker.id.startsWith('local-')) {
        // Update existing marker
        const { data, error } = await supabase
          .from('hex_markers')
          .update({
            ...marker,
            updated_at: now,
          })
          .eq('id', marker.id)
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        return data as HexMarker;
      } else {
        // Insert new marker
        const { id: _id, ...markerWithoutId } = marker;
        const { data, error } = await supabase
          .from('hex_markers')
          .insert([{
            ...markerWithoutId,
            created_at: now,
            updated_at: now,
          }])
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        return data as HexMarker;
      }
    } catch (error) {
      console.error('Failed to save hex marker:', error);
      throw error;
    }
  },

  async deleteHexMarker(id: string): Promise<boolean> {
    if (supabaseDisabled) {
      return deleteLocalHexMarker(id);
    }

    try {
      const { error } = await supabase
        .from('hex_markers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete hex marker:', error);
      throw error;
    }
  },

  async toggleMarkerActive(id: string, isActive: boolean): Promise<void> {
    if (supabaseDisabled) {
      const markers = getLocalHexMarkers();
      const markerIndex = markers.findIndex((m) => m.id === id);
      if (markerIndex >= 0) {
        markers[markerIndex].is_active = isActive;
        markers[markerIndex].updated_at = new Date().toISOString();
        saveLocalHexMarkers(markers);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('hex_markers')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to toggle marker active:', error);
      throw error;
    }
  },

  async toggleMarkerVisibility(id: string, isVisible: boolean): Promise<void> {
    if (supabaseDisabled) {
      const markers = getLocalHexMarkers();
      const markerIndex = markers.findIndex((m) => m.id === id);
      if (markerIndex >= 0) {
        markers[markerIndex].is_visible_to_players = isVisible;
        markers[markerIndex].updated_at = new Date().toISOString();
        saveLocalHexMarkers(markers);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('hex_markers')
        .update({
          is_visible_to_players: isVisible,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to toggle marker visibility:', error);
      throw error;
    }
  },

  // Handout Storage Functions
  async uploadHandoutMedia(file: File | Blob, handoutId: string): Promise<string | null> {
    try {
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `${handoutId}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log(`Uploading handout media: ${filePath} (${(file.size / 1024).toFixed(2)} KB)`);

      const { data, error } = await supabase.storage
        .from('handouts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Allow overwriting existing files
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('handouts')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Failed to upload handout media:', error);
      return null;
    }
  },

  async deleteHandoutMedia(handoutId: string): Promise<boolean> {
    try {
      // Try to delete files with common extensions
      const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'];

      for (const ext of extensions) {
        const filePath = `${handoutId}.${ext}`;
        const { error } = await supabase.storage
          .from('handouts')
          .remove([filePath]);

        // If no error, file was deleted
        if (!error) {
          console.log(`Deleted handout media: ${filePath}`);
          return true;
        }
      }

      console.log('No handout media found to delete for:', handoutId);
      return true;
    } catch (error) {
      console.error('Failed to delete handout media:', error);
      return false;
    }
  },

  async uploadHandoutMediaFromDataURL(dataUrl: string, handoutId: string, mimeType: string): Promise<string | null> {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Determine file extension from mime type
      const fileExt = mimeType.split('/')[1] || 'jpg';
      const fileName = `${handoutId}.${fileExt}`;

      console.log(`Uploading handout from data URL: ${fileName} (${(blob.size / 1024).toFixed(2)} KB)`);

      const { data, error } = await supabase.storage
        .from('handouts')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: mimeType,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('handouts')
        .getPublicUrl(fileName);

      console.log('Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Failed to upload handout from data URL:', error);
      return null;
    }
  }
}
