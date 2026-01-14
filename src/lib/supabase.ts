// Use the integrated Supabase client instead of environment variables
import { supabase } from "@/integrations/supabase/client";
import type { WorldNote, HexMarker } from "@/types/navigation";
import type { Character, Vehicle } from "@/types/database";
import type { PlayerNote } from "@/types/notes";
import type { Json } from "@/integrations/supabase/types";

// Re-export for convenience
export { supabase };

// Database error interface for better type safety
interface DatabaseError extends Error {
  code?: string;
  status?: number;
}

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

  async saveCharacter(characterData: Partial<Character>) {
    // Explicitly map only valid database columns to avoid 400 errors
    const dbPayload: Record<string, unknown> = {};

    // Map valid character fields to database columns
    if (characterData.name !== undefined) dbPayload.name = characterData.name;
    if (characterData.species !== undefined) dbPayload.species = characterData.species;
    if (characterData.gender !== undefined) dbPayload.gender = characterData.gender;
    if (characterData.age !== undefined) dbPayload.age = characterData.age;
    if (characterData.career !== undefined) dbPayload.career = characterData.career;
    if (characterData.rank !== undefined) dbPayload.rank = characterData.rank;
    if (characterData.homeworld !== undefined) dbPayload.homeworld = characterData.homeworld;
    if (characterData.rads !== undefined) dbPayload.rads = characterData.rads;
    if (characterData.species_traits !== undefined) dbPayload.species_traits = characterData.species_traits;
    if (characterData.notes !== undefined) dbPayload.notes = characterData.notes;

    // Characteristics
    if (characterData.strength !== undefined) dbPayload.strength = characterData.strength;
    if (characterData.dexterity !== undefined) dbPayload.dexterity = characterData.dexterity;
    if (characterData.endurance !== undefined) dbPayload.endurance = characterData.endurance;
    if (characterData.intellect !== undefined) dbPayload.intellect = characterData.intellect;
    if (characterData.education !== undefined) dbPayload.education = characterData.education;
    if (characterData.social_standing !== undefined) dbPayload.social_standing = characterData.social_standing;
    if (characterData.psionics !== undefined) dbPayload.psionics = characterData.psionics;
    if (characterData.initiative !== undefined) dbPayload.initiative = characterData.initiative;

    // Derived characteristics
    if (characterData.melee_dmg !== undefined) dbPayload.melee_dmg = characterData.melee_dmg;
    if (characterData.ranged_dmg !== undefined) dbPayload.ranged_dmg = characterData.ranged_dmg;
    if (characterData.lifeblood !== undefined) dbPayload.lifeblood = characterData.lifeblood;
    if (characterData.stamina !== undefined) dbPayload.stamina = characterData.stamina;
    if (characterData.terms_served !== undefined) dbPayload.terms_served = characterData.terms_served;

    // JSONB fields
    if (characterData.skills !== undefined) dbPayload.skills = characterData.skills;
    if (characterData.equipment !== undefined) dbPayload.equipment = characterData.equipment;
    if (characterData.weapons !== undefined) dbPayload.weapons = characterData.weapons;
    if (characterData.armor !== undefined) dbPayload.armor = characterData.armor;
    if (characterData.augments !== undefined) dbPayload.augments = characterData.augments;

    // Finances
    if (characterData.credits !== undefined) dbPayload.credits = characterData.credits;
    if (characterData.debt !== undefined) dbPayload.debt = characterData.debt;
    if (characterData.pension !== undefined) dbPayload.pension = characterData.pension;
    if (characterData.ship_payments !== undefined) dbPayload.ship_payments = characterData.ship_payments;
    if (characterData.living_cost !== undefined) dbPayload.living_cost = characterData.living_cost;
    if (characterData.cash_on_hand !== undefined) dbPayload.cash_on_hand = characterData.cash_on_hand;

    // Personal details
    if (characterData.allies !== undefined) dbPayload.allies = characterData.allies;
    if (characterData.contacts !== undefined) dbPayload.contacts = characterData.contacts;
    if (characterData.rivals !== undefined) dbPayload.rivals = characterData.rivals;
    if (characterData.enemies !== undefined) dbPayload.enemies = characterData.enemies;

    // Study tracking
    if (characterData.study_skill !== undefined) dbPayload.study_skill = characterData.study_skill;
    if (characterData.study_weeks !== undefined) dbPayload.study_weeks = characterData.study_weeks;
    if (characterData.study_complete !== undefined) dbPayload.study_complete = characterData.study_complete;

    // Thumbnail
    if (characterData.thumbnail_url !== undefined) dbPayload.thumbnail_url = characterData.thumbnail_url;

    try {
      if (characterData.id) {
        // Update existing character
        const { data, error } = await supabase
          .from('characters')
          .update(dbPayload)
          .eq('id', characterData.id)
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          throw error
        }
        return data
      } else {
        // Create new character - add player_id for new records
        dbPayload.player_id = 'campaign';

        const { data, error } = await supabase
          .from('characters')
          .insert([dbPayload])
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

  async saveVehicle(vehicleData: Partial<Vehicle>) {
    // Explicitly map only valid database columns to avoid 400 errors
    const dbPayload: Record<string, unknown> = {};

    // Basic information
    if (vehicleData.name !== undefined) dbPayload.name = vehicleData.name;
    if (vehicleData.vehicle_type !== undefined) dbPayload.vehicle_type = vehicleData.vehicle_type;
    if (vehicleData.class_type !== undefined) dbPayload.class_type = vehicleData.class_type;

    // Technical specifications
    if (vehicleData.tech_level !== undefined) dbPayload.tech_level = vehicleData.tech_level;
    if (vehicleData.tonnage !== undefined) dbPayload.tonnage = vehicleData.tonnage;
    if (vehicleData.cost !== undefined) dbPayload.cost = vehicleData.cost;

    // Hull and structure
    if (vehicleData.hull !== undefined) dbPayload.hull = vehicleData.hull;
    if (vehicleData.hull_current !== undefined) dbPayload.hull_current = vehicleData.hull_current;
    if (vehicleData.structure !== undefined) dbPayload.structure = vehicleData.structure;
    if (vehicleData.armor !== undefined) dbPayload.armor = vehicleData.armor;

    // Core systems
    if (vehicleData.maneuver_drive !== undefined) dbPayload.maneuver_drive = vehicleData.maneuver_drive;
    if (vehicleData.jump_drive !== undefined) dbPayload.jump_drive = vehicleData.jump_drive;
    if (vehicleData.power_plant !== undefined) dbPayload.power_plant = vehicleData.power_plant;

    // Performance
    if (vehicleData.acceleration !== undefined) dbPayload.acceleration = vehicleData.acceleration;
    if (vehicleData.top_speed !== undefined) dbPayload.top_speed = vehicleData.top_speed;
    if (vehicleData.jump_rating !== undefined) dbPayload.jump_rating = vehicleData.jump_rating;

    // Fuel and cargo
    if (vehicleData.fuel_capacity !== undefined) dbPayload.fuel_capacity = vehicleData.fuel_capacity;
    if (vehicleData.cargo_capacity !== undefined) dbPayload.cargo_capacity = vehicleData.cargo_capacity;
    if (vehicleData.passenger_capacity !== undefined) dbPayload.passenger_capacity = vehicleData.passenger_capacity;

    // JSONB fields
    if (vehicleData.weapons !== undefined) dbPayload.weapons = vehicleData.weapons;
    if (vehicleData.screens !== undefined) dbPayload.screens = vehicleData.screens;
    if (vehicleData.crew_requirements !== undefined) dbPayload.crew_requirements = vehicleData.crew_requirements;
    if (vehicleData.specifications !== undefined) dbPayload.specifications = vehicleData.specifications;

    // Systems and equipment
    if (vehicleData.computer_rating !== undefined) dbPayload.computer_rating = vehicleData.computer_rating;
    if (vehicleData.sensors !== undefined) dbPayload.sensors = vehicleData.sensors;
    if (vehicleData.communications !== undefined) dbPayload.communications = vehicleData.communications;

    // Maintenance and operations
    if (vehicleData.maintenance_cost !== undefined) dbPayload.maintenance_cost = vehicleData.maintenance_cost;
    if (vehicleData.life_support !== undefined) dbPayload.life_support = vehicleData.life_support;
    if (vehicleData.salaries !== undefined) dbPayload.salaries = vehicleData.salaries;

    try {
      if (vehicleData.id) {
        // Update existing vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .update(dbPayload)
          .eq('id', vehicleData.id)
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          throw error
        }
        return data
      } else {
        // Create new vehicle - add player_id for new records
        dbPayload.player_id = 'campaign';

        const { data, error } = await supabase
          .from('vehicles')
          .insert([dbPayload])
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          throw error
        }
        return data
      }
    } catch (error) {
      console.error('Failed to save vehicle:', error)
      throw error
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
      if (error && error.code !== '23505' && (error as DatabaseError).status !== 409) {
        console.error('Database error:', error)
        throw error
      }
      return true
    } catch (error) {
      const dbError = error as DatabaseError;
      // Also catch and ignore duplicate key errors that bubble up as exceptions
      if (dbError?.code === '23505' || dbError?.status === 409 || dbError?.message?.includes('duplicate')) {
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
          setting_value: value as Json,
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
  },

  // Player Notes Functions
  async getAllPlayerNotes() {
    if (supabaseDisabled) {
      try {
        const raw = localStorage.getItem('traveller_player_notes');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase
        .from('player_notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch player notes:', error);
      return [];
    }
  },

  async savePlayerNote(note: PlayerNote): Promise<PlayerNote> {
    if (supabaseDisabled) {
      try {
        const raw = localStorage.getItem('traveller_player_notes');
        const notes: PlayerNote[] = raw ? JSON.parse(raw) : [];
        const existingIndex = notes.findIndex((n) => n.id === note.id);

        if (existingIndex >= 0) {
          notes[existingIndex] = note;
        } else {
          notes.push(note);
        }

        localStorage.setItem('traveller_player_notes', JSON.stringify(notes));
        return note;
      } catch (error) {
        console.error('Failed to save note to localStorage:', error);
        throw error;
      }
    }

    try {
      const now = new Date().toISOString();
      const noteData = {
        id: note.id,
        title: note.title,
        content: note.content,
        created_at: note.createdAt || now,
        updated_at: now,
        created_by: note.createdBy || 'player',
        folder: note.folder || 'general',
        tags: note.tags || [],
        thumbnail_url: note.thumbnailUrl || null,
      };

      // Check if note exists
      const { data: existing } = await supabase
        .from('player_notes')
        .select('id')
        .eq('id', note.id)
        .maybeSingle();

      if (existing) {
        // Update existing note
        const { data, error } = await supabase
          .from('player_notes')
          .update(noteData)
          .eq('id', note.id)
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        return data;
      } else {
        // Insert new note
        const { data, error } = await supabase
          .from('player_notes')
          .insert([noteData])
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        return data;
      }
    } catch (error) {
      console.error('Failed to save player note:', error);
      throw error;
    }
  },

  async deletePlayerNote(noteId: string): Promise<boolean> {
    if (supabaseDisabled) {
      try {
        const raw = localStorage.getItem('traveller_player_notes');
        const notes: PlayerNote[] = raw ? JSON.parse(raw) : [];
        const filtered = notes.filter((n) => n.id !== noteId);
        localStorage.setItem('traveller_player_notes', JSON.stringify(filtered));
        return true;
      } catch (error) {
        console.error('Failed to delete note from localStorage:', error);
        throw error;
      }
    }

    try {
      const { error } = await supabase
        .from('player_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete player note:', error);
      throw error;
    }
  },

  // Player Note Thumbnail Functions
  async uploadPlayerNoteThumbnail(file: File | Blob, noteId: string): Promise<string | null> {
    try {
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `note_${noteId}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log(`Uploading player note thumbnail: ${filePath} (${(file.size / 1024).toFixed(2)} KB)`);

      const { data, error } = await supabase.storage
        .from('player_note_thumbnails')
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
        .from('player_note_thumbnails')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Failed to upload player note thumbnail:', error);
      return null;
    }
  },

  async uploadPlayerNoteThumbnailFromDataURL(dataUrl: string, noteId: string, mimeType: string): Promise<string | null> {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Determine file extension from mime type
      const fileExt = mimeType.split('/')[1] || 'jpg';
      const fileName = `note_${noteId}.${fileExt}`;

      console.log(`Uploading player note thumbnail from data URL: ${fileName} (${(blob.size / 1024).toFixed(2)} KB)`);

      const { data, error } = await supabase.storage
        .from('player_note_thumbnails')
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
        .from('player_note_thumbnails')
        .getPublicUrl(fileName);

      console.log('Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Failed to upload player note thumbnail from data URL:', error);
      return null;
    }
  },

  async deletePlayerNoteThumbnail(noteId: string): Promise<boolean> {
    try {
      // Try to delete files with common extensions
      const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

      for (const ext of extensions) {
        const filePath = `note_${noteId}.${ext}`;
        const { error } = await supabase.storage
          .from('player_note_thumbnails')
          .remove([filePath]);

        // If no error, file was deleted
        if (!error) {
          console.log(`Deleted player note thumbnail: ${filePath}`);
          return true;
        }
      }

      console.log('No player note thumbnail found to delete for:', noteId);
      return true;
    } catch (error) {
      console.error('Failed to delete player note thumbnail:', error);
      return false;
    }
  },

  // Character Thumbnail Functions
  async uploadCharacterThumbnail(file: File | Blob, characterId: string): Promise<string | null> {
    try {
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `character_${characterId}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log(`Uploading character thumbnail: ${filePath} (${(file.size / 1024).toFixed(2)} KB)`);

      const { data, error } = await supabase.storage
        .from('character_thumbnails')
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
        .from('character_thumbnails')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Failed to upload character thumbnail:', error);
      return null;
    }
  },

  async uploadCharacterThumbnailFromDataURL(dataUrl: string, characterId: string, mimeType: string): Promise<string | null> {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Determine file extension from mime type
      const fileExt = mimeType.split('/')[1] || 'jpg';
      const fileName = `character_${characterId}.${fileExt}`;

      console.log(`Uploading character thumbnail from data URL: ${fileName} (${(blob.size / 1024).toFixed(2)} KB)`);

      const { data, error } = await supabase.storage
        .from('character_thumbnails')
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
        .from('character_thumbnails')
        .getPublicUrl(fileName);

      console.log('Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Failed to upload character thumbnail from data URL:', error);
      return null;
    }
  },

  async deleteCharacterThumbnail(characterId: string): Promise<boolean> {
    try {
      // Try to delete files with common extensions
      const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

      for (const ext of extensions) {
        const filePath = `character_${characterId}.${ext}`;
        const { error } = await supabase.storage
          .from('character_thumbnails')
          .remove([filePath]);

        // If no error, file was deleted
        if (!error) {
          console.log(`Deleted character thumbnail: ${filePath}`);
          return true;
        }
      }

      console.log('No character thumbnail found to delete for:', characterId);
      return true;
    } catch (error) {
      console.error('Failed to delete character thumbnail:', error);
      return false;
    }
  }
}
