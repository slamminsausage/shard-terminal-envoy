import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PlayerNote, Handout } from '@/types/notes';
import { dbHelpers } from '@/lib/supabase';

// GM mode is determined by a separate flag, not just authentication
const GM_MODE_KEY = 'traveller_gm_mode';

interface NotesContextType {
  // Player notes
  playerNotes: PlayerNote[];
  addPlayerNote: (note: Omit<PlayerNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePlayerNote: (id: string, updates: Partial<PlayerNote>) => Promise<void>;
  deletePlayerNote: (id: string) => Promise<void>;

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

  // Load data from database on mount
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

    const migratePlayerNotesToDatabase = async (localNotes: PlayerNote[]) => {
      console.log(`Migrating ${localNotes.length} player notes to database...`);
      let migratedCount = 0;

      for (const note of localNotes) {
        try {
          await dbHelpers.savePlayerNote(note);
          migratedCount++;
        } catch (error) {
          console.error(`Failed to migrate note "${note.title}":`, error);
        }
      }

      console.log(`Successfully migrated ${migratedCount}/${localNotes.length} player notes to database`);
      return migratedCount > 0;
    };

    const loadData = async () => {
      try {
        // GM mode is a separate setting from authentication
        // It should be explicitly set by the GM, not assumed from auth status
        const savedGMMode = localStorage.getItem(GM_MODE_KEY);
        if (savedGMMode !== null) {
          setIsGMMode(savedGMMode === 'true');
        }

        // Load player notes from database
        const dbNotes = await dbHelpers.getAllPlayerNotes();

        // Check if we need to migrate from localStorage
        if (dbNotes.length === 0) {
          const savedPlayerNotes = localStorage.getItem('traveller_player_notes');
          if (savedPlayerNotes) {
            const localNotes = JSON.parse(savedPlayerNotes);
            if (localNotes.length > 0) {
              console.log('Found player notes in localStorage, migrating to database...');
              const migrated = await migratePlayerNotesToDatabase(localNotes);

              if (migrated) {
                // Reload from database after migration
                const migratedNotes = await dbHelpers.getAllPlayerNotes();
                setPlayerNotes(migratedNotes.map((n: any) => ({
                  id: n.id,
                  title: n.title,
                  content: n.content,
                  createdAt: n.created_at,
                  updatedAt: n.updated_at,
                  createdBy: n.created_by,
                  folder: n.folder,
                  tags: n.tags || [],
                  thumbnailUrl: n.thumbnail_url || undefined,
                })));

                // Clear localStorage after successful migration
                localStorage.removeItem('traveller_player_notes');
                console.log('Player notes migration complete!');
              }
            }
          }
        } else {
          // Load notes from database
          setPlayerNotes(dbNotes.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
            createdBy: n.created_by,
            folder: n.folder,
            tags: n.tags || [],
            thumbnailUrl: n.thumbnail_url || undefined,
          })));
        }

        // Load handouts from localStorage (with migration support)
        const savedHandouts = localStorage.getItem('traveller_handouts');
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
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Player notes are now saved to database, no need for localStorage sync

  // Save handouts to localStorage (only metadata, media is in Supabase Storage)
  useEffect(() => {
    try {
      const handoutsJSON = JSON.stringify(handouts);

      // Check for any remaining base64 data URLs (shouldn't happen, but just in case)
      const hasBase64 = handouts.some(
        h => h.mediaUrl && (h.mediaUrl.startsWith('data:image/') || h.mediaUrl.startsWith('data:video/'))
      );

      if (hasBase64 && import.meta.env?.DEV) {
        console.warn('Warning: Some handouts still contain base64 data. This may cause storage issues.');
      }

      localStorage.setItem('traveller_handouts', handoutsJSON);
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
  const addPlayerNote = useCallback(async (note: Omit<PlayerNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let thumbnailUrl = note.thumbnailUrl;

    // If there's a thumbnail URL and it's a data URL (base64), upload it to Supabase Storage
    if (thumbnailUrl && thumbnailUrl.startsWith('data:image/')) {
      console.log('Uploading player note thumbnail to Supabase Storage...');
      const mimeType = thumbnailUrl.split(';')[0].split(':')[1];
      const uploadedUrl = await dbHelpers.uploadPlayerNoteThumbnailFromDataURL(thumbnailUrl, noteId, mimeType);

      if (uploadedUrl) {
        thumbnailUrl = uploadedUrl;
        console.log('Player note thumbnail uploaded successfully to Supabase Storage');
      } else {
        console.warn('Failed to upload player note thumbnail to Supabase Storage, keeping data URL');
      }
    }

    const newNote: PlayerNote = {
      ...note,
      id: noteId,
      thumbnailUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await dbHelpers.savePlayerNote(newNote);
      setPlayerNotes(prev => [...prev, newNote]);
    } catch (error) {
      console.error('Failed to add player note:', error);
      throw error;
    }
  }, []);

  const updatePlayerNote = useCallback(async (id: string, updates: Partial<PlayerNote>) => {
    const existingNote = playerNotes.find(n => n.id === id);
    if (!existingNote) return;

    let thumbnailUrl = updates.thumbnailUrl;

    // If there's a new thumbnail URL and it's a data URL (base64), upload it to Supabase Storage
    if (thumbnailUrl && thumbnailUrl.startsWith('data:image/')) {
      console.log('Uploading updated player note thumbnail to Supabase Storage...');
      const mimeType = thumbnailUrl.split(';')[0].split(':')[1];
      const uploadedUrl = await dbHelpers.uploadPlayerNoteThumbnailFromDataURL(thumbnailUrl, id, mimeType);

      if (uploadedUrl) {
        thumbnailUrl = uploadedUrl;
        console.log('Player note thumbnail updated successfully in Supabase Storage');
      } else {
        console.warn('Failed to upload player note thumbnail to Supabase Storage, keeping data URL');
      }
    }

    const updatedNote = {
      ...existingNote,
      ...updates,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existingNote.thumbnailUrl,
      updatedAt: new Date().toISOString(),
    };

    try {
      await dbHelpers.savePlayerNote(updatedNote);
      setPlayerNotes(prev =>
        prev.map(note => note.id === id ? updatedNote : note)
      );
    } catch (error) {
      console.error('Failed to update player note:', error);
      throw error;
    }
  }, [playerNotes]);

  const deletePlayerNote = useCallback(async (id: string) => {
    try {
      // Delete the thumbnail first if it exists
      const note = playerNotes.find(n => n.id === id);
      if (note?.thumbnailUrl) {
        await dbHelpers.deletePlayerNoteThumbnail(id);
      }

      await dbHelpers.deletePlayerNote(id);
      setPlayerNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Failed to delete player note:', error);
      throw error;
    }
  }, [playerNotes]);

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

  const deleteHandout = useCallback(async (id: string) => {
    // Delete media from Supabase Storage first
    await dbHelpers.deleteHandoutMedia(id);

    // Then remove from state
    setHandouts(prev => prev.filter(handout => handout.id !== id));
  }, []);

  const toggleHandoutVisibility = useCallback((id: string) => {
    setHandouts(prev =>
      prev.map(h =>
        h.id === id
          ? { ...h, isVisible: !h.isVisible, updatedAt: new Date().toISOString() }
          : h
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
