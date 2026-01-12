import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PlayerNote, Handout } from '@/types/notes';
import { dbHelpers } from '@/lib/supabase';

interface NotesContextType {
  // Player notes
  playerNotes: PlayerNote[];
  addPlayerNote: (note: Omit<PlayerNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlayerNote: (id: string, updates: Partial<PlayerNote>) => void;
  deletePlayerNote: (id: string) => void;

  // Handouts
  handouts: Handout[];
  addHandout: (handout: Omit<Handout, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHandout: (id: string, updates: Partial<Handout>) => void;
  deleteHandout: (id: string) => Promise<void>;
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
    const migrateHandoutsToStorage = async (loadedHandouts: Handout[]) => {
      const migratedHandouts = [];
      let anyMigrated = false;

      for (const handout of loadedHandouts) {
        // Check if this handout has a base64 media URL that needs migration
        if (handout.mediaUrl &&
            (handout.mediaUrl.startsWith('data:image/') || handout.mediaUrl.startsWith('data:video/'))) {
          console.log(`Migrating handout "${handout.title}" to Supabase Storage...`);

          const mimeType = handout.mediaUrl.split(';')[0].split(':')[1];
          const uploadedUrl = await dbHelpers.uploadHandoutMediaFromDataURL(
            handout.mediaUrl,
            handout.id,
            mimeType
          );

          if (uploadedUrl) {
            migratedHandouts.push({ ...handout, mediaUrl: uploadedUrl });
            anyMigrated = true;
            console.log(`Successfully migrated "${handout.title}" to Supabase Storage`);
          } else {
            console.warn(`Failed to migrate "${handout.title}", keeping original`);
            migratedHandouts.push(handout);
          }
        } else {
          migratedHandouts.push(handout);
        }
      }

      return { handouts: migratedHandouts, migrated: anyMigrated };
    };

    const loadData = async () => {
      try {
        const savedPlayerNotes = localStorage.getItem('traveller_player_notes');
        const savedHandouts = localStorage.getItem('traveller_handouts');
        const savedGMMode = localStorage.getItem('traveller_authenticated');

        if (savedPlayerNotes) {
          setPlayerNotes(JSON.parse(savedPlayerNotes));
        }

        if (savedHandouts) {
          const loadedHandouts = JSON.parse(savedHandouts);

          // Check if migration is needed
          const hasMigrationNeeded = loadedHandouts.some(
            (h: Handout) => h.mediaUrl &&
              (h.mediaUrl.startsWith('data:image/') || h.mediaUrl.startsWith('data:video/'))
          );

          if (hasMigrationNeeded) {
            console.log('Found handouts with base64 data, migrating to Supabase Storage...');
            const { handouts: migratedHandouts, migrated } = await migrateHandoutsToStorage(loadedHandouts);
            setHandouts(migratedHandouts);

            if (migrated) {
              console.log('Migration complete! Handouts now use Supabase Storage.');
            }
          } else {
            setHandouts(loadedHandouts);
          }
        }

        if (savedGMMode) {
          setIsGMMode(savedGMMode === 'true');
        }
      } catch (error) {
        console.error('Error loading notes from localStorage:', error);
      }
    };

    loadData();
  }, []);

  // Save player notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('traveller_player_notes', JSON.stringify(playerNotes));
    } catch (error) {
      console.error('Error saving player notes to localStorage:', error);
    }
  }, [playerNotes]);

  // Save handouts to localStorage (only metadata, media is in Supabase Storage)
  useEffect(() => {
    try {
      const handoutsJSON = JSON.stringify(handouts);
      const sizeKB = (handoutsJSON.length / 1024).toFixed(2);
      console.log(`Saving ${handouts.length} handouts to localStorage (${sizeKB} KB)`);

      // Check for any remaining base64 data URLs (shouldn't happen, but just in case)
      const hasBase64 = handouts.some(
        h => h.mediaUrl && (h.mediaUrl.startsWith('data:image/') || h.mediaUrl.startsWith('data:video/'))
      );

      if (hasBase64) {
        console.warn('Warning: Some handouts still contain base64 data. This may cause storage issues.');
      }

      localStorage.setItem('traveller_handouts', handoutsJSON);
      console.log('Handouts saved successfully to localStorage');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded! This should not happen with Supabase Storage.');
        alert('Storage limit exceeded! Please contact support - media should be stored in cloud storage.');
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
  const addHandout = useCallback(async (handout: Omit<Handout, 'id' | 'createdAt' | 'updatedAt'>) => {
    const handoutId = `handout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let mediaUrl = handout.mediaUrl;

    // If there's a media URL and it's a data URL (base64), upload it to Supabase Storage
    if (mediaUrl && (mediaUrl.startsWith('data:image/') || mediaUrl.startsWith('data:video/'))) {
      console.log('Uploading media to Supabase Storage...');
      const mimeType = mediaUrl.split(';')[0].split(':')[1];
      const uploadedUrl = await dbHelpers.uploadHandoutMediaFromDataURL(mediaUrl, handoutId, mimeType);

      if (uploadedUrl) {
        mediaUrl = uploadedUrl;
        console.log('Media uploaded successfully to Supabase Storage');
      } else {
        console.warn('Failed to upload media to Supabase Storage, keeping data URL');
      }
    }

    const newHandout: Handout = {
      ...handout,
      id: handoutId,
      mediaUrl,
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

  const deleteHandout = useCallback(async (id: string) => {
    // Delete media from Supabase Storage first
    await dbHelpers.deleteHandoutMedia(id);

    // Then remove from state
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
