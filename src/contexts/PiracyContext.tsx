import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import {
  PiratePort,
  PirateCrew,
  MoraleState,
  MoraleEvent,
  StandingState,
  StandingEvent,
  SpoilsDivision,
  PreyEncounterResult,
  PortAttitude,
  CrewPosition,
  CrewSkillLevel,
  ImperialPower,
  PiracyState,
} from '@/types/piracy';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
import { rollInitialMorale } from '@/lib/piracy/generators';

const STORAGE_KEY = 'piracy_state';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getDefaultMorale(): MoraleState {
  const initialMor = rollInitialMorale();
  return {
    id: generateId(),
    player_id: 'campaign',
    current_mor: initialMor,
    max_mor: initialMor,
    months_without_spoils: 0,
    updated_at: new Date().toISOString(),
  };
}

function getDefaultStanding(): StandingState {
  return {
    id: generateId(),
    player_id: 'campaign',
    imperium_standing: 0,
    aslan_standing: -5,
    updated_at: new Date().toISOString(),
  };
}

function getDefaultState(): PiracyState {
  return {
    ports: [
      {
        id: generateId(),
        player_id: 'campaign',
        name: 'Drinax',
        attitude: 'haven',
        notes: 'The floating palace. Home port under King Oleb.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: generateId(),
        player_id: 'campaign',
        name: 'Theev',
        attitude: 'friendly',
        notes: 'Pirate haven. Shipyards and fences available.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: generateId(),
        player_id: 'campaign',
        name: 'Torpol',
        attitude: 'neutral',
        notes: 'Visited by the crew.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    crew: [],
    morale: getDefaultMorale(),
    standing: getDefaultStanding(),
    moraleEvents: [],
    standingEvents: [],
    spoilsDivisions: [],
    preyEncounters: [],
  };
}

interface PiracyContextType {
  // State
  ports: PiratePort[];
  crew: PirateCrew[];
  morale: MoraleState;
  standing: StandingState;
  moraleEvents: MoraleEvent[];
  standingEvents: StandingEvent[];
  spoilsDivisions: SpoilsDivision[];
  preyEncounters: PreyEncounterResult[];

  // Port operations
  addPort: (port: Partial<PiratePort>) => void;
  updatePort: (portId: string, updates: Partial<PiratePort>) => void;
  deletePort: (portId: string) => void;
  setPortAttitude: (portId: string, attitude: PortAttitude) => void;

  // Crew operations
  addCrew: (crew: Partial<PirateCrew>) => void;
  updateCrew: (crewId: string, updates: Partial<PirateCrew>) => void;
  deleteCrew: (crewId: string) => void;

  // Morale operations
  setMorale: (value: number) => void;
  adjustMorale: (change: number, eventType: MoraleEvent['event_type'], description: string, rollResult?: number, rollTarget?: number) => void;
  resetMorale: () => void;

  // Standing operations
  adjustStanding: (power: ImperialPower, change: number, eventType: StandingEvent['event_type'], description: string, rollResult?: number) => void;
  resetStanding: () => void;

  // Spoils operations
  addSpoilsDivision: (division: Partial<SpoilsDivision>) => void;

  // Prey encounter operations
  addPreyEncounter: (encounter: Partial<PreyEncounterResult>) => void;

  // Utilities
  getActiveCrew: () => PirateCrew[];
  getTotalShares: () => number;
  getTotalMonthlySalary: () => number;
}

const PiracyContext = createContext<PiracyContextType | undefined>(undefined);

export const usePiracy = () => {
  const context = useContext(PiracyContext);
  if (context === undefined) {
    throw new Error('usePiracy must be used within a PiracyProvider');
  }
  return context;
};

interface PiracyProviderProps {
  children: ReactNode;
}

export const PiracyProvider: React.FC<PiracyProviderProps> = ({ children }) => {
  const [state, setState] = useState<PiracyState>(() => {
    const saved = getLocalStorage<PiracyState | null>(STORAGE_KEY, null);
    return saved || getDefaultState();
  });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const { toast } = useToast();

  // Persist to localStorage whenever state changes
  useEffect(() => {
    setLocalStorage(STORAGE_KEY, state);
  }, [state]);

  // === Port Operations ===

  const addPort = useCallback((port: Partial<PiratePort>) => {
    const newPort: PiratePort = {
      id: generateId(),
      player_id: 'campaign',
      name: port.name || 'Unknown Port',
      attitude: port.attitude || 'neutral',
      world_uwp: port.world_uwp,
      subsector: port.subsector,
      law_level: port.law_level,
      starport_class: port.starport_class,
      notes: port.notes,
      last_visited: port.last_visited,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, ports: [...prev.ports, newPort] }));
    toast({ title: 'Port Added', description: `${newPort.name} registered in port database.` });
  }, [toast]);

  const updatePort = useCallback((portId: string, updates: Partial<PiratePort>) => {
    setState(prev => ({
      ...prev,
      ports: prev.ports.map(p =>
        p.id === portId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ),
    }));
  }, []);

  const deletePort = useCallback((portId: string) => {
    setState(prev => ({
      ...prev,
      ports: prev.ports.filter(p => p.id !== portId),
    }));
    toast({ title: 'Port Removed', description: 'Port removed from database.' });
  }, [toast]);

  const setPortAttitude = useCallback((portId: string, attitude: PortAttitude) => {
    setState(prev => ({
      ...prev,
      ports: prev.ports.map(p =>
        p.id === portId ? { ...p, attitude, updated_at: new Date().toISOString() } : p
      ),
    }));
  }, []);

  // === Crew Operations ===

  const addCrew = useCallback((crew: Partial<PirateCrew>) => {
    const newCrew: PirateCrew = {
      id: generateId(),
      player_id: 'campaign',
      name: crew.name || 'Unknown',
      position: crew.position || 'marine',
      skill_level: crew.skill_level || 'green',
      base_salary: crew.base_salary || 2000,
      shares: crew.shares || 1,
      quirk: crew.quirk,
      is_pc: crew.is_pc || false,
      is_active: true,
      notes: crew.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, crew: [...prev.crew, newCrew] }));
    toast({ title: 'Crew Added', description: `${newCrew.name} has joined the crew.` });
  }, [toast]);

  const updateCrew = useCallback((crewId: string, updates: Partial<PirateCrew>) => {
    setState(prev => ({
      ...prev,
      crew: prev.crew.map(c =>
        c.id === crewId ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      ),
    }));
  }, []);

  const deleteCrew = useCallback((crewId: string) => {
    const member = stateRef.current.crew.find(c => c.id === crewId);
    setState(prev => ({
      ...prev,
      crew: prev.crew.filter(c => c.id !== crewId),
    }));
    toast({ title: 'Crew Removed', description: `${member?.name || 'Crewman'} has left the ship.` });
  }, [toast]);

  // === Morale Operations ===

  const setMorale = useCallback((value: number) => {
    setState(prev => ({
      ...prev,
      morale: { ...prev.morale, current_mor: Math.max(0, value), updated_at: new Date().toISOString() },
    }));
  }, []);

  const adjustMorale = useCallback((
    change: number,
    eventType: MoraleEvent['event_type'],
    description: string,
    rollResult?: number,
    rollTarget?: number
  ) => {
    const event: MoraleEvent = {
      id: generateId(),
      player_id: 'campaign',
      event_date: new Date().toISOString(),
      event_type: eventType,
      description,
      mor_change: change,
      roll_result: rollResult,
      roll_target: rollTarget,
      created_at: new Date().toISOString(),
    };

    setState(prev => {
      const newMor = Math.max(0, prev.morale.current_mor + change);
      const updatedMorale = {
        ...prev.morale,
        current_mor: newMor,
        months_without_spoils: eventType === 'spoils_division' ? 0 : prev.morale.months_without_spoils,
        updated_at: new Date().toISOString(),
      };

      if (newMor === 0) {
        toast({ title: 'MUTINY!', description: 'Crew morale has hit 0! The crew attempts to overthrow leadership!', variant: 'destructive' });
      }

      return {
        ...prev,
        morale: updatedMorale,
        moraleEvents: [event, ...prev.moraleEvents],
      };
    });
  }, [toast]);

  const resetMorale = useCallback(() => {
    setState(prev => ({
      ...prev,
      morale: getDefaultMorale(),
      moraleEvents: [],
    }));
  }, []);

  // === Standing Operations ===

  const adjustStanding = useCallback((
    power: ImperialPower,
    change: number,
    eventType: StandingEvent['event_type'],
    description: string,
    rollResult?: number
  ) => {
    const event: StandingEvent = {
      id: generateId(),
      player_id: 'campaign',
      event_date: new Date().toISOString(),
      power,
      event_type: eventType,
      description,
      standing_change: change,
      roll_result: rollResult,
      created_at: new Date().toISOString(),
    };

    setState(prev => {
      const key = power === 'imperium' ? 'imperium_standing' : 'aslan_standing';
      return {
        ...prev,
        standing: {
          ...prev.standing,
          [key]: prev.standing[key] + change,
          updated_at: new Date().toISOString(),
        },
        standingEvents: [event, ...prev.standingEvents],
      };
    });
  }, []);

  const resetStanding = useCallback(() => {
    setState(prev => ({
      ...prev,
      standing: getDefaultStanding(),
      standingEvents: [],
    }));
  }, []);

  // === Spoils Operations ===

  const addSpoilsDivision = useCallback((division: Partial<SpoilsDivision>) => {
    const newDivision: SpoilsDivision = {
      id: generateId(),
      player_id: 'campaign',
      division_date: new Date().toISOString(),
      total_cargo_value: division.total_cargo_value || 0,
      fence_percent: division.fence_percent || 0,
      fenced_value: division.fenced_value || 0,
      oleb_tithe: division.oleb_tithe || 0,
      distributable: division.distributable || 0,
      total_shares: division.total_shares || 0,
      value_per_share: division.value_per_share || 0,
      crew_retention_results: division.crew_retention_results,
      imperial_date: division.imperial_date,
      notes: division.notes,
      created_at: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      spoilsDivisions: [newDivision, ...prev.spoilsDivisions],
      morale: {
        ...prev.morale,
        months_without_spoils: 0,
        last_spoils_date: newDivision.imperial_date || newDivision.division_date,
        updated_at: new Date().toISOString(),
      },
    }));

    toast({ title: 'Spoils Divided', description: `Cr${newDivision.value_per_share.toLocaleString()} per share distributed.` });
  }, [toast]);

  // === Prey Encounter Operations ===

  const addPreyEncounter = useCallback((encounter: Partial<PreyEncounterResult>) => {
    const newEncounter: PreyEncounterResult = {
      id: generateId(),
      player_id: 'campaign',
      encounter_date: new Date().toISOString(),
      system_classification: encounter.system_classification || 'standard',
      system_security: encounter.system_security || 'standard',
      raw_roll: encounter.raw_roll || [0, 0],
      modified_roll: encounter.modified_roll || [0, 0],
      result: encounter.result || 'no_encounter',
      system_name: encounter.system_name,
      imperial_date: encounter.imperial_date,
      notes: encounter.notes,
      created_at: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      preyEncounters: [newEncounter, ...prev.preyEncounters],
    }));
  }, []);

  // === Utility Functions ===

  const getActiveCrew = useCallback(() => {
    return stateRef.current.crew.filter(c => c.is_active);
  }, []);

  const getTotalShares = useCallback(() => {
    return stateRef.current.crew.filter(c => c.is_active).reduce((sum, c) => sum + c.shares, 0);
  }, []);

  const getTotalMonthlySalary = useCallback(() => {
    return stateRef.current.crew.filter(c => c.is_active).reduce((sum, c) => sum + c.base_salary, 0);
  }, []);

  const value: PiracyContextType = {
    ports: state.ports,
    crew: state.crew,
    morale: state.morale,
    standing: state.standing,
    moraleEvents: state.moraleEvents,
    standingEvents: state.standingEvents,
    spoilsDivisions: state.spoilsDivisions,
    preyEncounters: state.preyEncounters,
    addPort,
    updatePort,
    deletePort,
    setPortAttitude,
    addCrew,
    updateCrew,
    deleteCrew,
    setMorale,
    adjustMorale,
    resetMorale,
    adjustStanding,
    resetStanding,
    addSpoilsDivision,
    addPreyEncounter,
    getActiveCrew,
    getTotalShares,
    getTotalMonthlySalary,
  };

  return (
    <PiracyContext.Provider value={value}>
      {children}
    </PiracyContext.Provider>
  );
};
