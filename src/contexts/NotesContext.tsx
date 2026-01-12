import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PlayerNote, Handout } from '@/types/notes';

interface NotesContextType {
  // Player notes
  playerNotes: PlayerNote[];
  addPlayerNote: (note: Omit<PlayerNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlayerNote: (id: string, updates: Partial<PlayerNote>) => void;
  deletePlayerNote: (id: string) => void;

  // Handouts
  handouts: Handout[];
  addHandout: (handout: Omit<Handout, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHandout: (id: string, updates: Partial<Handout>) => void;
  deleteHandout: (id: string) => void;
  toggleHandoutVisibility: (id: string) => void;

  // GM mode
  isGMMode: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playerNotes, setPlayerNotes] = useState<PlayerNote[]>([]);
  const [handouts, setHandouts] = useState<Handout[]>([]);
  const [isGMMode, setIsGMMode] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedPlayerNotes = localStorage.getItem('traveller_player_notes');
      const savedHandouts = localStorage.getItem('traveller_handouts');
      const savedGMMode = localStorage.getItem('traveller_authenticated');

      if (savedPlayerNotes) {
        setPlayerNotes(JSON.parse(savedPlayerNotes));
      }
      if (savedHandouts) {
        setHandouts(JSON.parse(savedHandouts));
      }
      if (savedGMMode) {
        setIsGMMode(savedGMMode === 'true');
      }
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
    }
  }, []);

  // Save player notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('traveller_player_notes', JSON.stringify(playerNotes));
    } catch (error) {
      console.error('Error saving player notes to localStorage:', error);
    }
  }, [playerNotes]);

  // Save handouts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('traveller_handouts', JSON.stringify(handouts));
    } catch (error) {
      console.error('Error saving handouts to localStorage:', error);
    }
  }, [handouts]);

  // Player notes functions
  const addPlayerNote = useCallback((note: Omit<PlayerNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: PlayerNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlayerNotes(prev => [...prev, newNote]);
  }, []);

  const updatePlayerNote = useCallback((id: string, updates: Partial<PlayerNote>) => {
    setPlayerNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }, []);

  const deletePlayerNote = useCallback((id: string) => {
    setPlayerNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  // Handouts functions
  const addHandout = useCallback((handout: Omit<Handout, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHandout: Handout = {
      ...handout,
      id: `handout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHandouts(prev => [...prev, newHandout]);
  }, []);

  const updateHandout = useCallback((id: string, updates: Partial<Handout>) => {
    setHandouts(prev =>
      prev.map(handout =>
        handout.id === id
          ? { ...handout, ...updates, updatedAt: new Date().toISOString() }
          : handout
      )
    );
  }, []);

  const deleteHandout = useCallback((id: string) => {
    setHandouts(prev => prev.filter(handout => handout.id !== id));
  }, []);

  const toggleHandoutVisibility = useCallback((id: string) => {
    setHandouts(prev =>
      prev.map(handout =>
        handout.id === id
          ? { ...handout, isVisible: !handout.isVisible, updatedAt: new Date().toISOString() }
          : handout
      )
    );
  }, []);

  return (
    <NotesContext.Provider
      value={{
        playerNotes,
        addPlayerNote,
        updatePlayerNote,
        deletePlayerNote,
        handouts,
        addHandout,
        updateHandout,
        deleteHandout,
        toggleHandoutVisibility,
        isGMMode,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
