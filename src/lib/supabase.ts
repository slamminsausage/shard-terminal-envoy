// Use the integrated Supabase client instead of environment variables
import { supabase } from "@/integrations/supabase/client";

// Re-export for convenience
export { supabase };

const isDev = import.meta.env?.DEV ?? false;
const supabaseDisabled =
  import.meta.env?.VITE_DISABLE_SUPABASE === 'true' ||
  (isDev && import.meta.env?.VITE_ENABLE_SUPABASE !== 'true');

const LOCAL_UNLOCKED_KEY = 'dev_unlocked_terminals';
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
  }
}
