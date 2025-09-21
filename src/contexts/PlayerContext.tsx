import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, Character, Vehicle } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface PlayerContextType {
  // Current player state
  currentPlayer: Player | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Player data
  characters: Character[];
  vehicles: Vehicle[];
  
  // Authentication methods
  validateAccessCode: (code: string) => Promise<boolean>;
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

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isAuthenticated = currentPlayer !== null;

  // Load player data from localStorage on mount
  useEffect(() => {
    const savedPlayerData = localStorage.getItem('traveller_player');
    if (savedPlayerData) {
      try {
        const playerData = JSON.parse(savedPlayerData);
        setCurrentPlayer(playerData);
      } catch (error) {
        console.error('Failed to parse saved player data:', error);
        localStorage.removeItem('traveller_player');
      }
    }
  }, []);

  // Load player's characters and vehicles when player changes
  useEffect(() => {
    if (currentPlayer) {
      refreshData();
    } else {
      setCharacters([]);
      setVehicles([]);
    }
  }, [currentPlayer]);

  const validateAccessCode = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const result = await response.json();

      if (result.is_valid) {
        const playerData: Player = {
          id: result.player_id,
          name: result.player_name,
          access_code: code.toUpperCase(),
          created_at: '',
          last_accessed: new Date().toISOString(),
          is_active: true,
        };

        setCurrentPlayer(playerData);
        localStorage.setItem('traveller_player', JSON.stringify(playerData));
        
        toast({
          title: "Access Granted",
          description: `Welcome back, ${result.player_name}!`,
        });

        return true;
      } else {
        toast({
          title: "Access Denied",
          description: result.error_message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Code validation error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to validate access code. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentPlayer(null);
    setCharacters([]);
    setVehicles([]);
    localStorage.removeItem('traveller_player');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const refreshData = async () => {
    if (!currentPlayer) return;

    setIsLoading(true);
    try {
      // Fetch characters
      const charactersResponse = await fetch(`/api/characters?player_id=${currentPlayer.id}`);
      if (charactersResponse.ok) {
        const charactersData = await charactersResponse.json();
        setCharacters(charactersData);
      }

      // Fetch vehicles
      const vehiclesResponse = await fetch(`/api/vehicles?player_id=${currentPlayer.id}`);
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        setVehicles(vehiclesData);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: "Data Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCharacter = async (characterData: Partial<Character>): Promise<Character | null> => {
    if (!currentPlayer) return null;

    try {
      const method = characterData.id ? 'PUT' : 'POST';
      const url = characterData.id ? `/api/characters/${characterData.id}` : '/api/characters';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...characterData,
          player_id: currentPlayer.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save character');
      }

      const savedCharacter = await response.json();
      
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
    if (!currentPlayer) return null;

    try {
      const method = vehicleData.id ? 'PUT' : 'POST';
      const url = vehicleData.id ? `/api/vehicles/${vehicleData.id}` : '/api/vehicles';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...vehicleData,
          player_id: currentPlayer.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save vehicle');
      }

      const savedVehicle = await response.json();
      
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
    if (!currentPlayer) return null;

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
    if (!currentPlayer) return null;

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
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

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
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

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

  const value: PlayerContextType = {
    currentPlayer,
    isAuthenticated,
    isLoading,
    characters,
    vehicles,
    validateAccessCode,
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
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};