import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character, Vehicle } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
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
      setCharacters(charactersData);

      // Fetch all vehicles  
      const vehiclesData = await dbHelpers.getAllVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: "Data Error",
        description: "Failed to load campaign data. Please try again.",
        variant: "destructive",
      });
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
          prev.map(char => char.id === savedCharacter.id ? savedCharacter : char)
        );
      } else {
        setCharacters(prev => [...prev, savedCharacter]);
      }

      toast({
        title: "Character Saved",
        description: `${savedCharacter.name} has been saved successfully.`,
      });

      return savedCharacter;
    } catch (error) {
      console.error('Failed to save character:', error);
      toast({
        title: "Save Error",
        description: "Failed to save character. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveVehicle = async (vehicleData: Partial<Vehicle>): Promise<Vehicle | null> => {
    try {
      const savedVehicle = await dbHelpers.saveVehicle(vehicleData);
      
      // Update local state
      if (vehicleData.id) {
        setVehicles(prev => 
          prev.map(vehicle => vehicle.id === savedVehicle.id ? savedVehicle : vehicle)
        );
      } else {
        setVehicles(prev => [...prev, savedVehicle]);
      }

      toast({
        title: "Vehicle Saved",
        description: `${savedVehicle.name} has been saved successfully.`,
      });

      return savedVehicle;
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
      age: '',
      career: '',
      rank: '',
      homeworld: '',
      characteristics: {},
      skills: {},
      equipment: [],
      credits: '0',
      debt: '0',
      ship_shares: '0',
      weapons: [],
      armor: [],
      augments: [],
      notes: '',
    };

    return await saveCharacter(newCharacterData);
  };

  const createNewVehicle = async (vehicleType: string = 'ship'): Promise<Vehicle | null> => {
    const newVehicleData = {
      name: vehicleType === 'ship' ? 'New Spaceship' : 'New Vehicle',
      class_name: '',
      configuration: '',
      tech_level: '',
      hull_points: '',
      armor: '',
      jump_drive: '',
      maneuver_drive: '',
      power_plant: '',
      computer: '',
      software: {},
      sensors: {},
      power_requirements: [],
      weapons: [],
      cargo: [],
      critical_hits: {},
      cost: '',
      maintenance: '',
      crew: '',
      passengers: '',
      vehicle_type: vehicleType as 'ship' | 'ground_vehicle' | 'other',
    };

    return await saveVehicle(newVehicleData);
  };

  const deleteCharacter = async (characterId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteCharacter(characterId);
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      
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
      await dbHelpers.deleteVehicle(vehicleId);
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