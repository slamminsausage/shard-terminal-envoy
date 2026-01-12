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
      const handoutsJSON = JSON.stringify(handouts);
      console.log(`Saving ${handouts.length} handouts to localStorage (${(handoutsJSON.length / 1024).toFixed(2)} KB)`);
      localStorage.setItem('traveller_handouts', handoutsJSON);
      console.log('Handouts saved successfully');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded! Cannot save handouts.');
        alert('Storage limit exceeded! Your handouts are too large. Try using smaller images or removing old handouts.');
      } else {
        console.error('Error saving handouts to localStorage:', error);
      }
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
      // Ensure isVisible is explicitly set (defaults to false if not provided)
      isVisible: handout.isVisible ?? false,
    };
    console.log('Adding handout:', newHandout.title, 'isVisible:', newHandout.isVisible, 'type:', newHandout.type);
    setHandouts(prev => {
      const updated = [...prev, newHandout];
      console.log('Total handouts after add:', updated.length);
      return updated;
    });
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
    setHandouts(prev => {
      const handout = prev.find(h => h.id === id);
      if (handout) {
        console.log('Toggling visibility for:', handout.title, 'from', handout.isVisible, 'to', !handout.isVisible);
      }
      const updated = prev.map(h =>
        h.id === id
          ? { ...h, isVisible: !h.isVisible, updatedAt: new Date().toISOString() }
          : h
      );
      console.log('Handouts after toggle:', updated.map(h => ({ title: h.title, visible: h.isVisible })));
      return updated;
    });
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
