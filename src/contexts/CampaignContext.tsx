import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character, Vehicle } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { dbHelpers } from '@/lib/supabase';

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

  // Check authentication on mount and whenever it changes
  useEffect(() => {
    const isAuth = checkAuthentication();
    setIsAuthenticated(isAuth);
    if (isAuth) {
      refreshData();
    }
  }, []);

  const checkAuthentication = (): boolean => {
    const authStatus = localStorage.getItem('traveller_authenticated');
    const isAuth = authStatus === 'true';
    setIsAuthenticated(isAuth);
    return isAuth;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCharacters([]);
    setVehicles([]);
    localStorage.removeItem('traveller_authenticated');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const refreshData = async () => {
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
      console.warn('Database not available, using local storage fallback');
      
      // Fallback to localStorage for development
      const savedCharacters = localStorage.getItem('traveller_characters');
      const savedVehicles = localStorage.getItem('traveller_vehicles');
      
      if (savedCharacters) {
        try {
          setCharacters(JSON.parse(savedCharacters));
        } catch (e) {
          console.error('Failed to parse saved characters:', e);
        }
      }
      
      if (savedVehicles) {
        try {
          setVehicles(JSON.parse(savedVehicles));
        } catch (e) {
          console.error('Failed to parse saved vehicles:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

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

      // Also save to localStorage as backup
      const updatedCharacters = characterData.id 
        ? characters.map(char => char.id === savedCharacter.id ? savedCharacter as Character : char)
        : [...characters, savedCharacter as Character];
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

      toast({
        title: "Vehicle Saved",
        description: `${savedVehicle.name} has been saved successfully.`,
      });

      return savedVehicle as Vehicle;
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      toast({
        title: "Save Error",
        description: "Failed to save vehicle. Please try again.",
        variant: "destructive",
      });
      return null;
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
      // Remove character from any vehicle crew assignments
      const updatedVehicles = vehicles.map(vehicle => {
        if (vehicle.crew_requirements && typeof vehicle.crew_requirements === 'object') {
          const updatedCrewRequirements = { ...vehicle.crew_requirements };
          // Remove character from all crew positions
          Object.keys(updatedCrewRequirements).forEach(position => {
            if (updatedCrewRequirements[position] === characterId) {
              delete updatedCrewRequirements[position];
            }
          });
          return { ...vehicle, crew_requirements: updatedCrewRequirements };
        }
        return vehicle;
      });

      // Update vehicles in database that had this character assigned
      for (const vehicle of updatedVehicles) {
        if (vehicle.crew_requirements !== vehicles.find(v => v.id === vehicle.id)?.crew_requirements) {
          await dbHelpers.saveVehicle(vehicle);
        }
      }

      // Delete the character
      await dbHelpers.deleteCharacter(characterId);
      
      // Update local state
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      setVehicles(updatedVehicles);
      
      toast({
        title: "Character Deleted",
        description: "Character and all crew assignments have been removed successfully.",
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
      const vehicleToDelete = vehicles.find(v => v.id === vehicleId);
      
      // Get list of characters assigned to this vehicle
      const assignedCharacterIds: string[] = [];
      if (vehicleToDelete?.crew_requirements && typeof vehicleToDelete.crew_requirements === 'object') {
        Object.values(vehicleToDelete.crew_requirements).forEach(charId => {
          if (typeof charId === 'string' && charId) {
            assignedCharacterIds.push(charId);
          }
        });
      }

      // Delete the vehicle
      await dbHelpers.deleteVehicle(vehicleId);
      
      // Update local state
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
      
      const crewCount = assignedCharacterIds.length;
      toast({
        title: "Vehicle Deleted",
        description: `Vehicle has been deleted successfully.${crewCount > 0 ? ` ${crewCount} crew member(s) are now unassigned.` : ''}`,
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