// Use the integrated Supabase client instead of environment variables
import { supabase } from "@/integrations/supabase/client";

// Re-export for convenience
export { supabase };

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
  }
}