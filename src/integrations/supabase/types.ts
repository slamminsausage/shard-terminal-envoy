export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      game_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          age: number | null
          allies: string | null
          armor: Json | null
          augments: Json | null
          career: string | null
          contacts: string | null
          created_at: string
          credits: number | null
          debt: number | null
          dexterity: number | null
          education: number | null
          endurance: number | null
          enemies: string | null
          equipment: Json | null
          gender: string | null
          homeworld: string | null
          id: string
          intellect: number | null
          lifeblood: number | null
          melee_dmg: number | null
          name: string
          player_id: string
          ranged_dmg: number | null
          rank: string | null
          rivals: string | null
          skills: Json | null
          social_standing: number | null
          species: string | null
          stamina: number | null
          strength: number | null
          terms_served: number | null
          updated_at: string
          weapons: Json | null
        }
        Insert: {
          age?: number | null
          allies?: string | null
          armor?: Json | null
          augments?: Json | null
          career?: string | null
          contacts?: string | null
          created_at?: string
          credits?: number | null
          debt?: number | null
          dexterity?: number | null
          education?: number | null
          endurance?: number | null
          enemies?: string | null
          equipment?: Json | null
          gender?: string | null
          homeworld?: string | null
          id?: string
          intellect?: number | null
          lifeblood?: number | null
          melee_dmg?: number | null
          name?: string
          player_id?: string
          ranged_dmg?: number | null
          rank?: string | null
          rivals?: string | null
          skills?: Json | null
          social_standing?: number | null
          species?: string | null
          stamina?: number | null
          strength?: number | null
          terms_served?: number | null
          updated_at?: string
          weapons?: Json | null
        }
        Update: {
          age?: number | null
          allies?: string | null
          armor?: Json | null
          augments?: Json | null
          career?: string | null
          contacts?: string | null
          created_at?: string
          credits?: number | null
          debt?: number | null
          dexterity?: number | null
          education?: number | null
          endurance?: number | null
          enemies?: string | null
          equipment?: Json | null
          gender?: string | null
          homeworld?: string | null
          id?: string
          intellect?: number | null
          lifeblood?: number | null
          melee_dmg?: number | null
          name?: string
          player_id?: string
          ranged_dmg?: number | null
          rank?: string | null
          rivals?: string | null
          skills?: Json | null
          social_standing?: number | null
          species?: string | null
          stamina?: number | null
          strength?: number | null
          terms_served?: number | null
          updated_at?: string
          weapons?: Json | null
        }
        Relationships: []
      }
      unlocked_terminals: {
        Row: {
          created_at: string
          id: string
          terminal_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          terminal_code: string
        }
        Update: {
          created_at?: string
          id?: string
          terminal_code?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          acceleration: number | null
          armor: number | null
          cargo_capacity: number | null
          class_type: string | null
          communications: number | null
          computer_rating: number | null
          cost: number | null
          created_at: string
          crew_requirements: Json | null
          fuel_capacity: number | null
          hull: number | null
          id: string
          jump_drive: number | null
          jump_rating: number | null
          maintenance_cost: number | null
          maneuver_drive: number | null
          name: string
          passenger_capacity: number | null
          player_id: string
          power_plant: number | null
          screens: Json | null
          sensors: number | null
          specifications: Json | null
          structure: number | null
          tech_level: number | null
          tonnage: number | null
          top_speed: number | null
          updated_at: string
          vehicle_type: string | null
          weapons: Json | null
        }
        Insert: {
          acceleration?: number | null
          armor?: number | null
          cargo_capacity?: number | null
          class_type?: string | null
          communications?: number | null
          computer_rating?: number | null
          cost?: number | null
          created_at?: string
          crew_requirements?: Json | null
          fuel_capacity?: number | null
          hull?: number | null
          id?: string
          jump_drive?: number | null
          jump_rating?: number | null
          maintenance_cost?: number | null
          maneuver_drive?: number | null
          name?: string
          passenger_capacity?: number | null
          player_id?: string
          power_plant?: number | null
          screens?: Json | null
          sensors?: number | null
          specifications?: Json | null
          structure?: number | null
          tech_level?: number | null
          tonnage?: number | null
          top_speed?: number | null
          updated_at?: string
          vehicle_type?: string | null
          weapons?: Json | null
        }
        Update: {
          acceleration?: number | null
          armor?: number | null
          cargo_capacity?: number | null
          class_type?: string | null
          communications?: number | null
          computer_rating?: number | null
          cost?: number | null
          created_at?: string
          crew_requirements?: Json | null
          fuel_capacity?: number | null
          hull?: number | null
          id?: string
          jump_drive?: number | null
          jump_rating?: number | null
          maintenance_cost?: number | null
          maneuver_drive?: number | null
          name?: string
          passenger_capacity?: number | null
          player_id?: string
          power_plant?: number | null
          screens?: Json | null
          sensors?: number | null
          specifications?: Json | null
          structure?: number | null
          tech_level?: number | null
          tonnage?: number | null
          top_speed?: number | null
          updated_at?: string
          vehicle_type?: string | null
          weapons?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
