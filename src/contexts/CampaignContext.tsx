import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Character, Vehicle, Player } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { dbHelpers, supabaseDisabled } from '@/lib/supabase';
import { defaultCharacters, defaultVehicles } from "@/data/campaignDefaults";

const EMAIL_DOMAIN = 'eclipse-shard.local';

// ─── Legacy session helpers (used when Supabase Auth is disabled) ───

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

// ─── Types ──────────────────────────────────────────────────────────

interface RegisterResult {
  success: boolean;
  error?: string;
  role?: 'gm' | 'player';
}

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
  register: (campaignCode: string, username: string, password: string, displayName: string) => Promise<RegisterResult>;
  loginWithCode: (code: string) => Promise<{ success: boolean; error?: string }>;
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
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(getStoredPlayer);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(supabaseDisabled);
  const { toast } = useToast();

  const isGM = currentPlayer?.role === 'gm';

  // Refs to track latest state for localStorage backup (avoids stale closure)
  const charactersRef = useRef<Character[]>([]);
  const vehiclesRef = useRef<Vehicle[]>([]);
  const currentPlayerRef = useRef<Player | null>(currentPlayer);

  // Flag to skip the next auth listener event (set by login/register which handle player state directly)
  const skipNextAuthEvent = useRef(false);

  useEffect(() => { charactersRef.current = characters; }, [characters]);
  useEffect(() => { vehiclesRef.current = vehicles; }, [vehicles]);
  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);

  // ─── Supabase Auth state listener ──────────────────────────────

  useEffect(() => {
    if (supabaseDisabled) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // If login/register already handled the player state, skip this event
        if (skipNextAuthEvent.current) {
          skipNextAuthEvent.current = false;
          setAuthInitialized(true);
          return;
        }
        if (session?.user) {
          const player = await dbHelpers.getPlayerByAuthUserId(session.user.id);
          if (player) {
            setCurrentPlayer(player);
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
            setIsAuthenticated(true);
          } else if (!currentPlayerRef.current) {
            // Only sign out if we don't already have a valid player
            // (login/register may have set one directly before this listener ran)
            console.warn('Auth listener: no player record found for auth user', session.user.id);
            await supabase.auth.signOut();
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentPlayer(null);
        setIsAuthenticated(false);
        setCharacters([]);
        setVehicles([]);
        localStorage.removeItem(PLAYER_STORAGE_KEY);
        localStorage.removeItem('traveller_authenticated');
        localStorage.removeItem('traveller_session');
      }
      setAuthInitialized(true);
    });

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const player = await dbHelpers.getPlayerByAuthUserId(session.user.id);
        if (player) {
          setCurrentPlayer(player);
          localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
          setIsAuthenticated(true);
        } else {
          console.warn('Initial session check: no player record for auth user', session.user.id);
          await supabase.auth.signOut();
        }
      }
      setAuthInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ─── Legacy auth check (for supabaseDisabled mode) ──────────────

  const checkAuthentication = (): boolean => {
    if (!supabaseDisabled) {
      // In Supabase Auth mode, auth state is managed by the listener
      return isAuthenticated;
    }
    const isAuth = isValidSession();
    setIsAuthenticated(isAuth);
    if (!isAuth) {
      setCurrentPlayer(null);
    }
    return isAuth;
  };

  // ─── Login (Supabase Auth) ────────────────────────────────────

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const trimmedUsername = username.trim().toLowerCase();
    const email = `${trimmedUsername}@${EMAIL_DOMAIN}`;

    // Helper: establish session + player state from edge function response
    // Returns an error string if setSession fails, null on success
    const finishLogin = async (accessToken: string, refreshToken: string, player: any): Promise<string | null> => {
      skipNextAuthEvent.current = true;

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error('Session setup error:', sessionError);
        skipNextAuthEvent.current = false;
        return 'Failed to establish session. Please try again.';
      }

      if (player) {
        setCurrentPlayer(player);
        currentPlayerRef.current = player;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
        setIsAuthenticated(true);
      }

      return null;
    };

    // Helper: race a promise against a timeout
    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), ms)
        ),
      ]);

    try {
      // ── Attempt 1: Login Edge Function (server-side auth, avoids CAPTCHA/browser issues)
      try {
        const { data, error } = await withTimeout(
          supabase.functions.invoke('login', {
            body: { username: trimmedUsername, password },
          }),
          12000, // 12 second timeout
        );

        if (!error && data && !data.error && data.access_token && data.refresh_token) {
          if (!data.player) {
            return { success: false, error: 'Account error: player profile not found. Please contact the GM.' };
          }
          const sessionErr = await finishLogin(data.access_token, data.refresh_token, data.player);
          if (sessionErr) {
            return { success: false, error: sessionErr };
          }
          return { success: true };
        }

        // Edge function returned an error — extract message
        if (data?.error) {
          return { success: false, error: data.error };
        }

        if (error) {
          let errorMessage = '';
          try {
            if (error.context && typeof error.context.json === 'function') {
              const body = await error.context.json();
              if (body?.error) errorMessage = body.error;
            }
          } catch (_) { /* ignore */ }

          // If it's a real auth error (not a network/deployment issue), return it
          if (errorMessage && !errorMessage.includes('not found') && !errorMessage.includes('Function not found')) {
            return { success: false, error: errorMessage };
          }
          // Otherwise fall through to direct auth
          console.warn('Login edge function failed, trying direct auth:', error);
        }
      } catch (edgeFnError: any) {
        // Timeout or network error — fall through to direct auth
        console.warn('Login edge function unavailable:', edgeFnError?.message || edgeFnError);
      }

      // ── Attempt 2: Direct signInWithPassword (with timeout to prevent infinite hang)
      console.log('Attempting direct signInWithPassword...');
      try {
        const { data: authData, error: authError } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          10000, // 10 second timeout
        );

        if (authError) {
          return { success: false, error: authError.message || 'Invalid username or password.' };
        }

        if (!authData.session) {
          return { success: false, error: 'Authentication failed — no session returned.' };
        }

        // Fetch player record
        const player = await dbHelpers.getPlayerByAuthUserId(authData.user.id);
        if (player) {
          setCurrentPlayer(player);
          currentPlayerRef.current = player;
          localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
          setIsAuthenticated(true);
        } else {
          // Try by access_code as fallback
          const playerByCode = await dbHelpers.getPlayerByAccessCode(trimmedUsername);
          if (playerByCode) {
            setCurrentPlayer(playerByCode);
            currentPlayerRef.current = playerByCode;
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(playerByCode));
            setIsAuthenticated(true);
          } else {
            await supabase.auth.signOut();
            return { success: false, error: 'Account error: player profile not found. Please contact the GM.' };
          }
        }

        return { success: true };
      } catch (directAuthError: any) {
        if (directAuthError?.message === 'TIMEOUT') {
          return { success: false, error: 'Login timed out. The server may be unreachable. Please try again.' };
        }
        throw directAuthError;
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication error. Please try again.' };
    }
  }, []);

  // ─── Register (Supabase Auth) ─────────────────────────────────

  const register = useCallback(async (
    campaignCode: string,
    username: string,
    password: string,
    displayName: string
  ): Promise<RegisterResult> => {
    try {
      // Call the register edge function
      const { data, error } = await supabase.functions.invoke('register', {
        body: {
          campaign_code: campaignCode,
          username: username.trim().toLowerCase(),
          password,
          display_name: displayName.trim() || username.trim(),
        },
      });

      if (error) {
        console.error('Registration error:', error);
        // Extract the actual error message from the edge function response
        let errorMessage = 'Registration failed. Please try again.';
        try {
          if (error.context && typeof error.context.json === 'function') {
            const body = await error.context.json();
            if (body?.error) errorMessage = body.error;
          }
        } catch (_) {
          // Fall through to generic message
        }
        return { success: false, error: errorMessage };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      // Auto-login after successful registration (reuses the login function with timeouts/fallbacks)
      const loginResult = await login(username, password);

      if (!loginResult.success) {
        // Registration succeeded even if auto-login failed
        return {
          success: true,
          role: data?.role,
          error: 'Account created! Please log in with your username and password.',
        };
      }

      return { success: true, role: data?.role };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration.' };
    }
  }, [login]);

  // ─── Legacy login with access code (backward compat) ───────────

  const loginWithCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try player-based login first (new system)
      const player = await dbHelpers.getPlayerByAccessCode(code);

      if (player) {
        // Player found - set up session
        const session = {
          token: generateSessionToken(),
          createdAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        };
        localStorage.setItem('traveller_session', JSON.stringify(session));
        localStorage.setItem('traveller_authenticated', 'true');
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));

        setCurrentPlayer(player);
        setIsAuthenticated(true);
        return { success: true };
      }

      // Fallback: check legacy campaign password for backward compatibility
      const storedPassword = await dbHelpers.getGameSetting<string>('campaign_password');
      const expectedPassword = storedPassword || 'TRAVELLER2024';

      if (code.toUpperCase() === expectedPassword.toUpperCase()) {
        // Legacy password match - create a session as GM (backward compat)
        const legacyGM: Player = {
          id: 'legacy-gm',
          name: 'Game Master',
          role: 'gm',
          access_code: 'LEGACY',
          is_active: true,
          last_accessed: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        const session = {
          token: generateSessionToken(),
          createdAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        };
        localStorage.setItem('traveller_session', JSON.stringify(session));
        localStorage.setItem('traveller_authenticated', 'true');
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(legacyGM));

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

  // ─── Logout ───────────────────────────────────────────────────

  const logout = useCallback(async () => {
    if (!supabaseDisabled) {
      await supabase.auth.signOut();
    }

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
        // Fetch all and filter client-side (simpler than multiple queries)
        const allChars = await dbHelpers.getAllCharacters();
        charactersData = allChars.filter((c: any) =>
          c.player_id === player.id ||
          c.player_id === 'campaign' ||
          c.character_type === 'npc'
        );
      }
      setCharacters(charactersData as Character[]);

      // All players see all vehicles (shared crew ship)
      const vehiclesData = await dbHelpers.getAllVehicles();
      setVehicles(vehiclesData as Vehicle[]);
    } catch (error) {
      console.error('Failed to refresh data:', error);

      // Fallback to localStorage
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

  // Check authentication on mount
  useEffect(() => {
    if (supabaseDisabled) {
      const isAuth = checkAuthentication();
      setIsAuthenticated(isAuth);
    }
    // Always try to refresh data
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
      // Use current player's ID for new characters
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
    // Players can only delete their own characters
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

  const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
    // Only GM can delete vehicles
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
    deleteCharacter,
    deleteVehicle,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};
