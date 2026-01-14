import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Character, Vehicle } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { dbHelpers } from '@/lib/supabase';
import { defaultCharacters, defaultVehicles } from "@/data/campaignDefaults";

// Session validation helper
interface Session {
  token: string;
  createdAt: number;
  expiresAt: number;
}

const isValidSession = (): boolean => {
  try {
    const sessionStr = localStorage.getItem('traveller_session');
    if (!sessionStr) {
      // Fallback for backward compatibility
      return localStorage.getItem('traveller_authenticated') === 'true';
    }

    const session: Session = JSON.parse(sessionStr);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      // Clear expired session
      localStorage.removeItem('traveller_session');
      localStorage.removeItem('traveller_authenticated');
      return false;
    }

    return true;
  } catch {
    return localStorage.getItem('traveller_authenticated') === 'true';
  }
};

interface CampaignContextType {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Campaign data
  characters: Character[];
  vehicles: Vehicle[];
  
  // Authentication methods
  checkAuthentication: () => boolean;
  logout: () => void;
  
  // Data management
  refreshData: () => Promise<void>;
  saveCharacter: (characterData: Partial<Character>) => Promise<Character | null>;
  saveVehicle: (vehicleData: Partial<Vehicle>) => Promise<Vehicle | null>;
  createNewCharacter: () => Promise<Character | null>;
  createNewVehicle: (vehicleType?: string) => Promise<Vehicle | null>;
  deleteCharacter: (characterId: string) => Promise<boolean>;
  deleteVehicle: (vehicleId: string) => Promise<boolean>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};

interface CampaignProviderProps {
  children: ReactNode;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Refs to track latest state for localStorage backup (avoids stale closure)
  const charactersRef = useRef<Character[]>([]);
  const vehiclesRef = useRef<Vehicle[]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    charactersRef.current = characters;
  }, [characters]);

  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  const checkAuthentication = (): boolean => {
    const isAuth = isValidSession();
    setIsAuthenticated(isAuth);
    return isAuth;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCharacters([]);
    setVehicles([]);
    localStorage.removeItem('traveller_authenticated');
    localStorage.removeItem('traveller_session');

    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all characters
      const charactersData = await dbHelpers.getAllCharacters();
      setCharacters(charactersData as Character[]);

      // Fetch all vehicles
      const vehiclesData = await dbHelpers.getAllVehicles();
      setVehicles(vehiclesData as Vehicle[]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      // Don't show error toast immediately, might just be env vars not set up yet

      // Fallback to localStorage for development
      const savedCharacters = localStorage.getItem('traveller_characters');
      const savedVehicles = localStorage.getItem('traveller_vehicles');
      let usedLocalCharacters = false;
      let usedLocalVehicles = false;

      if (savedCharacters) {
        try {
          const parsedCharacters = JSON.parse(savedCharacters);
          setCharacters(parsedCharacters);
          usedLocalCharacters = true;
        } catch (e) {
          console.error('Failed to parse saved characters:', e);
          toast({
            title: "Data Error",
            description: "Failed to load saved characters. Using defaults instead.",
            variant: "destructive",
          });
        }
      }

      if (savedVehicles) {
        try {
          const parsedVehicles = JSON.parse(savedVehicles);
          setVehicles(parsedVehicles);
          usedLocalVehicles = true;
        } catch (e) {
          console.error('Failed to parse saved vehicles:', e);
          toast({
            title: "Data Error",
            description: "Failed to load saved vehicles. Using defaults instead.",
            variant: "destructive",
          });
        }
      }

      // Fallback to typed defaults so UI still has content in offline mode
      if (!usedLocalCharacters) {
        setCharacters(defaultCharacters);
      }
      if (!usedLocalVehicles) {
        setVehicles(defaultVehicles);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication on mount and whenever it changes
  useEffect(() => {
    const isAuth = checkAuthentication();
    setIsAuthenticated(isAuth);

    // Always try to refresh data for view components, regardless of auth state
    // This allows character/vehicle view tabs to work even without shared localStorage
    refreshData();
  }, [refreshData]);

  const saveCharacter = async (characterData: Partial<Character>): Promise<Character | null> => {
    try {
      const savedCharacter = await dbHelpers.saveCharacter(characterData);
      
      // Update local state
      if (characterData.id) {
        setCharacters(prev => 
          prev.map(char => char.id === savedCharacter.id ? savedCharacter as Character : char)
        );
      } else {
        setCharacters(prev => [...prev, savedCharacter as Character]);
      }

      // Also save to localStorage as backup (using ref to get latest state)
      const currentCharacters = charactersRef.current;
      const updatedCharacters = characterData.id
        ? currentCharacters.map(char => char.id === savedCharacter.id ? savedCharacter as Character : char)
        : [...currentCharacters, savedCharacter as Character];
      localStorage.setItem('traveller_characters', JSON.stringify(updatedCharacters));

      toast({
        title: "Character Saved",
        description: `${savedCharacter.name} has been saved successfully.`,
      });

      return savedCharacter as Character;
    } catch (error) {
      console.error('Failed to save character:', error);
      
      // Fallback to localStorage
      const characterWithId = {
        ...characterData,
        id: characterData.id || `char_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        player_id: 'campaign'
      };
      
      let updatedCharacters;
      if (characterData.id) {
        updatedCharacters = characters.map(char => 
          char.id === characterData.id ? characterWithId as Character : char
        );
        setCharacters(updatedCharacters);
      } else {
        updatedCharacters = [...characters, characterWithId as Character];
        setCharacters(updatedCharacters);
      }
      
      localStorage.setItem('traveller_characters', JSON.stringify(updatedCharacters));
      
      toast({
        title: "Character Saved Locally",
        description: `${characterWithId.name} saved to local storage (database unavailable).`,
      });

      return characterWithId as Character;
    }
  };

  const saveVehicle = async (vehicleData: Partial<Vehicle>): Promise<Vehicle | null> => {
    try {
      const savedVehicle = await dbHelpers.saveVehicle(vehicleData);

      // Update local state
      if (vehicleData.id) {
        setVehicles(prev =>
          prev.map(vehicle => vehicle.id === savedVehicle.id ? savedVehicle as Vehicle : vehicle)
        );
      } else {
        setVehicles(prev => [...prev, savedVehicle as Vehicle]);
      }

      // Also save to localStorage as backup (using ref to get latest state)
      const currentVehicles = vehiclesRef.current;
      const updatedVehicles = vehicleData.id
        ? currentVehicles.map(vehicle => vehicle.id === savedVehicle.id ? savedVehicle as Vehicle : vehicle)
        : [...currentVehicles, savedVehicle as Vehicle];
      localStorage.setItem('traveller_vehicles', JSON.stringify(updatedVehicles));

      toast({
        title: "Vehicle Saved",
        description: `${savedVehicle.name} has been saved successfully.`,
      });

      return savedVehicle as Vehicle;
    } catch (error) {
      console.error('Failed to save vehicle:', error);

      // Fallback to localStorage
      const vehicleWithId = {
        ...vehicleData,
        id: vehicleData.id || `vehicle_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        player_id: 'campaign'
      };

      let updatedVehicles;
      if (vehicleData.id) {
        updatedVehicles = vehicles.map(vehicle =>
          vehicle.id === vehicleData.id ? vehicleWithId as Vehicle : vehicle
        );
        setVehicles(updatedVehicles);
      } else {
        updatedVehicles = [...vehicles, vehicleWithId as Vehicle];
        setVehicles(updatedVehicles);
      }

      localStorage.setItem('traveller_vehicles', JSON.stringify(updatedVehicles));

      toast({
        title: "Vehicle Saved Locally",
        description: `${vehicleWithId.name} saved to local storage (database unavailable).`,
      });

      return vehicleWithId as Vehicle;
    }
  };

  const createNewCharacter = async (): Promise<Character | null> => {
    const newCharacterData = {
      name: 'New Character',
      species: '',
      gender: '',
      age: 0,
      career: '',
      rank: '',
      homeworld: '',
      strength: 7,
      dexterity: 7,
      endurance: 7,
      intellect: 7,
      education: 7,
      social_standing: 7,
      melee_dmg: 0,
      ranged_dmg: 0,
      lifeblood: 0,
      stamina: 0,
      terms_served: 0,
      skills: {},
      equipment: {},
      credits: 0,
      debt: 0,
      allies: '',
      contacts: '',
      rivals: '',
      enemies: '',
      weapons: {},
      armor: {},
      augments: {},
    };

    return await saveCharacter(newCharacterData);
  };

  const createNewVehicle = async (vehicleType: string = 'Ship'): Promise<Vehicle | null> => {
    const newVehicleData = {
      name: vehicleType === 'Ship' ? 'New Spaceship' : 'New Vehicle',
      vehicle_type: vehicleType,
      class_type: '',
      tech_level: 10,
      tonnage: 100,
      cost: 0,
      hull: 1,
      structure: 1,
      armor: 0,
      maneuver_drive: 1,
      jump_drive: 1,
      power_plant: 1,
      acceleration: 1,
      top_speed: 0,
      jump_rating: 1,
      fuel_capacity: 10,
      cargo_capacity: 10,
      passenger_capacity: 0,
      weapons: {},
      screens: {},
      computer_rating: 5,
      sensors: 1,
      communications: 1,
      maintenance_cost: 0,
      crew_requirements: {},
      specifications: {},
    };

    return await saveVehicle(newVehicleData);
  };

  const deleteCharacter = async (characterId: string): Promise<boolean> => {
    try {
      // Delete the character first
      await dbHelpers.deleteCharacter(characterId);
      
      // Update local state - remove character
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      
      // Note: For now, we're not implementing complex crew assignment tracking
      // In a future enhancement, we could track and update vehicle crew assignments
      
      toast({
        title: "Character Deleted",
        description: "Character has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Failed to delete character:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete character. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
    try {
      // Delete the vehicle from database
      await dbHelpers.deleteVehicle(vehicleId);
      
      // Update local state - remove vehicle
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
      
      toast({
        title: "Vehicle Deleted",
        description: "Vehicle has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete vehicle. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const value: CampaignContextType = {
    isAuthenticated,
    isLoading,
    characters,
    vehicles,
    checkAuthentication,
    logout,
    refreshData,
    saveCharacter,
    saveVehicle,
    createNewCharacter,
    createNewVehicle,
    deleteCharacter,
    deleteVehicle,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};
