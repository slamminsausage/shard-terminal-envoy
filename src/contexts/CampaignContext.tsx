import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Character, Vehicle, Player } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { dbHelpers, supabaseDisabled } from '@/lib/supabase';
import { defaultCharacters, defaultVehicles } from "@/data/campaignDefaults";

// ─── Session helpers (localStorage-based, no GoTrue) ───────────────

interface Session {
  token: string;
  createdAt: number;
  expiresAt: number;
}

const PLAYER_STORAGE_KEY = 'traveller_current_player';

const isValidSession = (): boolean => {
  try {
    const sessionStr = localStorage.getItem('traveller_session');
    if (!sessionStr) {
      return localStorage.getItem('traveller_authenticated') === 'true';
    }

    const session: Session = JSON.parse(sessionStr);

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('traveller_session');
      localStorage.removeItem('traveller_authenticated');
      localStorage.removeItem(PLAYER_STORAGE_KEY);
      return false;
    }

    return true;
  } catch {
    return localStorage.getItem('traveller_authenticated') === 'true';
  }
};

const getStoredPlayer = (): Player | null => {
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Player;
  } catch {
    return null;
  }
};

const generateSessionToken = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const additionalRandom = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${additionalRandom}`;
};

const createLocalSession = (player: Player) => {
  const session: Session = {
    token: generateSessionToken(),
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  localStorage.setItem('traveller_session', JSON.stringify(session));
  localStorage.setItem('traveller_authenticated', 'true');
  localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
};

// ─── Types ──────────────────────────────────────────────────────────

interface RegisterResult {
  success: boolean;
  error?: string;
  role?: 'gm' | 'player';
}

type RegistrationRole = 'gm' | 'player';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface CampaignContextType {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  currentPlayer: Player | null;
  isGM: boolean;

  // Campaign data
  characters: Character[];
  vehicles: Vehicle[];

  // Authentication methods
  checkAuthentication: () => boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  register: (
    campaignCode: string,
    username: string,
    password: string,
    displayName: string,
    requestedRole: RegistrationRole,
  ) => Promise<RegisterResult>;
  loginWithCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Data management
  refreshData: () => Promise<void>;
  saveCharacter: (characterData: Partial<Character>) => Promise<Character | null>;
  saveVehicle: (vehicleData: Partial<Vehicle>) => Promise<Vehicle | null>;
  createNewCharacter: () => Promise<Character | null>;
  createNewVehicle: (vehicleType?: string) => Promise<Vehicle | null>;
  claimCharacter: (characterId: string) => Promise<boolean>;
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
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(getStoredPlayer);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isGM = currentPlayer?.role === 'gm';

  // Refs to track latest state (avoids stale closures in callbacks)
  const charactersRef = useRef<Character[]>([]);
  const vehiclesRef = useRef<Vehicle[]>([]);
  const currentPlayerRef = useRef<Player | null>(currentPlayer);

  useEffect(() => { charactersRef.current = characters; }, [characters]);
  useEffect(() => { vehiclesRef.current = vehicles; }, [vehicles]);
  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);

  // ─── Timeout helper ─────────────────────────────────────────────

  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), ms)
      ),
    ]);

  // ─── Session check ──────────────────────────────────────────────

  const checkAuthentication = (): boolean => {
    const isAuth = isValidSession();
    setIsAuthenticated(isAuth);
    if (!isAuth) {
      setCurrentPlayer(null);
    }
    return isAuth;
  };

  // ─── Login (DB-only via RPC — no GoTrue) ────────────────────────

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const trimmedUsername = username.trim().toLowerCase();

    if (!supabaseDisabled) {
      // Primary path: call authenticate_player RPC (PostgREST, not GoTrue)
      try {
        const { data, error } = await withTimeout(
          supabase.rpc('authenticate_player', {
            p_username: trimmedUsername,
            p_password: password,
          }),
          10000, // 10 second timeout
        );

        if (error) {
          console.warn('RPC authenticate_player error:', error.message);
          // Fall through to access-code fallback
        } else if (data?.error) {
          // If "no password set", fall through to access-code fallback
          // Otherwise, return the error to the user (e.g. wrong password)
          if (!String(data.error).toLowerCase().includes('no password set')) {
            return { success: false, error: data.error };
          }
          console.log('Account has no password, falling through to access-code login...');
        } else if (data?.success && data?.player) {
          const player = data.player as Player;
          createLocalSession(player);
          setCurrentPlayer(player);
          currentPlayerRef.current = player;
          setIsAuthenticated(true);
          return { success: true };
        }
      } catch (rpcError: any) {
        if (rpcError?.message === 'TIMEOUT') {
          console.warn('authenticate_player RPC timed out, trying access-code fallback...');
        } else {
          console.warn('RPC call failed:', rpcError?.message || rpcError);
        }
      }
    }

    // Fallback: access-code lookup (works offline / when RPC not deployed yet)
    try {
      const player = await dbHelpers.getPlayerByAccessCode(trimmedUsername);
      if (player) {
        createLocalSession(player);
        setCurrentPlayer(player);
        currentPlayerRef.current = player;
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (fallbackErr) {
      console.warn('Access-code fallback failed:', fallbackErr);
    }

    return {
      success: false,
      error: 'Invalid username or password.',
    };
  }, []);

  // ─── Register (DB-only via RPC — no GoTrue) ────────────────────

  const register = useCallback(async (
    campaignCode: string,
    username: string,
    password: string,
    displayName: string,
    requestedRole: RegistrationRole,
  ): Promise<RegisterResult> => {
    try {
      const { data, error } = await withTimeout(
        supabase.rpc('register_player', {
          p_campaign_code: campaignCode,
          p_username: username.trim().toLowerCase(),
          p_password: password,
          p_display_name: displayName.trim() || username.trim(),
          p_requested_role: requestedRole,
        }),
        10000,
      );

      if (error) {
        console.error('Registration RPC error:', error);
        return { success: false, error: 'Registration failed. The database may be unavailable.' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      if (data?.success && data?.player) {
        const player = data.player as Player;
        createLocalSession(player);
        setCurrentPlayer(player);
        currentPlayerRef.current = player;
        setIsAuthenticated(true);
        return { success: true, role: (data.role || player.role) as 'gm' | 'player' };
      }

      return { success: false, error: 'Registration failed — unexpected response.' };
    } catch (error: any) {
      if (error?.message === 'TIMEOUT') {
        return { success: false, error: 'Registration timed out. Please try again.' };
      }
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration.' };
    }
  }, []);

  // ─── Legacy login with access code ──────────────────────────────

  const loginWithCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try player-based login first
      const player = await dbHelpers.getPlayerByAccessCode(code);

      if (player) {
        createLocalSession(player);
        setCurrentPlayer(player);
        setIsAuthenticated(true);
        return { success: true };
      }

      // Fallback: check legacy campaign password
      const storedPassword = await dbHelpers.getGameSetting<string>('campaign_password');
      const expectedPassword = storedPassword || 'TRAVELLER2024';

      if (code.toUpperCase() === expectedPassword.toUpperCase()) {
        const legacyGM: Player = {
          id: 'legacy-gm',
          name: 'Game Master',
          role: 'gm',
          access_code: 'LEGACY',
          is_active: true,
          last_accessed: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        createLocalSession(legacyGM);
        setCurrentPlayer(legacyGM);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Invalid access code.' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication error. Please try again.' };
    }
  }, []);

  // ─── Logout (no GoTrue signOut needed) ──────────────────────────

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setCurrentPlayer(null);
    setCharacters([]);
    setVehicles([]);
    localStorage.removeItem('traveller_authenticated');
    localStorage.removeItem('traveller_session');
    localStorage.removeItem(PLAYER_STORAGE_KEY);

    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  }, []);

  // ─── Data loading ─────────────────────────────────────────────

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const player = currentPlayerRef.current;

      // GM sees all characters; players see their own + NPCs
      let charactersData: any[];
      if (!player || player.role === 'gm') {
        charactersData = await dbHelpers.getAllCharacters();
      } else {
        const allChars = await dbHelpers.getAllCharacters();
        charactersData = allChars.filter((c: any) =>
          c.player_id === player.id ||
          c.player_id === 'campaign' ||
          c.character_type === 'npc'
        );
      }
      setCharacters(charactersData as Character[]);

      const vehiclesData = await dbHelpers.getAllVehicles();
      setVehicles(vehiclesData as Vehicle[]);
    } catch (error) {
      console.error('Failed to refresh data:', error);

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

  // Restore session from localStorage on mount
  useEffect(() => {
    const isAuth = isValidSession();
    const storedPlayer = getStoredPlayer();

    if (isAuth && storedPlayer) {
      setCurrentPlayer(storedPlayer);
      setIsAuthenticated(true);
    }

    refreshData();
  }, [refreshData]);

  // Re-fetch data when player changes
  useEffect(() => {
    if (currentPlayer) {
      refreshData();
    }
  }, [currentPlayer?.id]);

  // ─── CRUD operations ──────────────────────────────────────────

  const saveCharacter = async (characterData: Partial<Character>): Promise<Character | null> => {
    try {
      const player = currentPlayerRef.current;
      if (!characterData.id && player && player.id !== 'legacy-gm') {
        characterData.player_id = player.id;
      }

      const savedCharacter = await dbHelpers.saveCharacter(characterData);

      if (characterData.id) {
        setCharacters(prev =>
          prev.map(char => char.id === savedCharacter.id ? savedCharacter as Character : char)
        );
      } else {
        setCharacters(prev => [...prev, savedCharacter as Character]);
      }

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

      const player = currentPlayerRef.current;
      const characterWithId = {
        ...characterData,
        id: characterData.id || `char_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        player_id: characterData.player_id || (player && player.id !== 'legacy-gm' ? player.id : 'campaign')
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

      if (vehicleData.id) {
        setVehicles(prev =>
          prev.map(vehicle => vehicle.id === savedVehicle.id ? savedVehicle as Vehicle : vehicle)
        );
      } else {
        setVehicles(prev => [...prev, savedVehicle as Vehicle]);
      }

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
      character_type: 'pc',
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
    const player = currentPlayerRef.current;
    if (player && player.role !== 'gm') {
      const char = charactersRef.current.find(c => c.id === characterId);
      if (char && char.player_id !== player.id) {
        toast({
          title: "Permission Denied",
          description: "You can only delete your own characters.",
          variant: "destructive",
        });
        return false;
      }
    }

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

  const claimCharacter = async (characterId: string): Promise<boolean> => {
    const player = currentPlayerRef.current;
    if (!player) {
      return false;
    }

    if (player.role === 'gm') {
      toast({
        title: "Not Needed",
        description: "GM accounts can already manage all character sheets.",
      });
      return false;
    }

    const char = charactersRef.current.find(c => c.id === characterId);
    if (!char) {
      toast({
        title: "Character Not Found",
        description: "Could not find that character in the roster.",
        variant: "destructive",
      });
      return false;
    }

    if ((char.character_type || 'pc') !== 'pc') {
      toast({
        title: "Cannot Claim NPC",
        description: "Only player character sheets can be claimed.",
        variant: "destructive",
      });
      return false;
    }

    if (char.player_id !== 'campaign') {
      toast({
        title: "Already Claimed",
        description: "This character is already assigned to a player.",
        variant: "destructive",
      });
      return false;
    }

    const ok = await dbHelpers.reassignCharacter(characterId, player.id);
    if (!ok) {
      toast({
        title: "Claim Failed",
        description: "Could not claim this character right now.",
        variant: "destructive",
      });
      return false;
    }

    setCharacters(prev => prev.map(c => c.id === characterId ? { ...c, player_id: player.id } : c));
    toast({
      title: "Character Claimed",
      description: `${char.name} is now assigned to your account.`,
    });
    return true;
  };

  const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
    const player = currentPlayerRef.current;
    if (player && player.role !== 'gm') {
      toast({
        title: "Permission Denied",
        description: "Only the Game Master can delete vehicles.",
        variant: "destructive",
      });
      return false;
    }

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
    currentPlayer,
    isGM,
    characters,
    vehicles,
    checkAuthentication,
    login,
    register,
    loginWithCode,
    logout,
    refreshData,
    saveCharacter,
    saveVehicle,
    createNewCharacter,
    createNewVehicle,
    claimCharacter,
    deleteCharacter,
    deleteVehicle,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};
