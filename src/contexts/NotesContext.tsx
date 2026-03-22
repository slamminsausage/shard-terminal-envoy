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
          if (import.meta.env.DEV) console.log(`Migrating handout "${handout.title}" to Supabase Storage...`);

          const mimeType = handout.mediaUrl.split(';')[0].split(':')[1];
          const uploadedUrl = await dbHelpers.uploadHandoutMediaFromDataURL(
            handout.mediaUrl,
            handout.id,
            mimeType
          );

          if (uploadedUrl) {
            migratedHandouts.push({ ...handout, mediaUrl: uploadedUrl });
            anyMigrated = true;
            if (import.meta.env.DEV) console.log(`Successfully migrated "${handout.title}" to Supabase Storage`);
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
      if (import.meta.env.DEV) console.log(`Migrating ${localNotes.length} player notes to database...`);
      let migratedCount = 0;

      for (const note of localNotes) {
        try {
          await dbHelpers.savePlayerNote(note);
          migratedCount++;
        } catch (error) {
          console.error(`Failed to migrate note "${note.title}":`, error);
        }
      }

      if (import.meta.env.DEV) console.log(`Successfully migrated ${migratedCount}/${localNotes.length} player notes to database`);
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
              if (import.meta.env.DEV) console.log('Found player notes in localStorage, migrating to database...');
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
                if (import.meta.env.DEV) console.log('Player notes migration complete!');
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

        // Load handouts from Supabase DB
        const dbHandouts = await dbHelpers.getAllHandouts();

        if (dbHandouts.length === 0) {
          // Check localStorage for existing handouts to migrate
          const savedHandouts = localStorage.getItem('traveller_handouts');
          if (savedHandouts) {
            const localHandouts: Handout[] = JSON.parse(savedHandouts);
            if (localHandouts.length > 0) {
              if (import.meta.env.DEV) console.log(`Migrating ${localHandouts.length} handouts to Supabase DB...`);

              // Migrate any remaining base64 media URLs to Storage first
              const { handouts: migratedHandouts } = await migrateHandoutsToStorage(localHandouts);

              // Save each to DB
              let migratedCount = 0;
              for (const handout of migratedHandouts) {
                try {
                  await dbHelpers.saveHandout(handout);
                  migratedCount++;
                } catch (err) {
                  console.error(`Failed to migrate handout "${handout.title}":`, err);
                }
              }

              if (import.meta.env.DEV) console.log(`Migrated ${migratedCount}/${migratedHandouts.length} handouts to DB`);
              setHandouts(migratedHandouts);
              localStorage.removeItem('traveller_handouts');
            }
          }
        } else {
          // Map DB row format → Handout interface
          const mapped: Handout[] = dbHandouts.map((row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description || '',
            type: row.type,
            content: row.content || undefined,
            mediaUrl: row.media_url || undefined,
            thumbnailUrl: row.thumbnail_url || undefined,
            isVisible: row.is_visible ?? false,
            tags: row.tags || [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          setHandouts(mapped);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Player notes and handouts are now saved to Supabase DB — no localStorage sync needed

  // Player notes functions
  const addPlayerNote = useCallback(async (note: Omit<PlayerNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let thumbnailUrl = note.thumbnailUrl;

    // If there's a thumbnail URL and it's a data URL (base64), upload it to Supabase Storage
    if (thumbnailUrl && thumbnailUrl.startsWith('data:image/')) {
      if (import.meta.env.DEV) console.log('Uploading player note thumbnail to Supabase Storage...');
      const mimeType = thumbnailUrl.split(';')[0].split(':')[1];
      const uploadedUrl = await dbHelpers.uploadPlayerNoteThumbnailFromDataURL(thumbnailUrl, noteId, mimeType);

      if (uploadedUrl) {
        thumbnailUrl = uploadedUrl;
        if (import.meta.env.DEV) console.log('Player note thumbnail uploaded successfully to Supabase Storage');
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
      if (import.meta.env.DEV) console.log('Uploading updated player note thumbnail to Supabase Storage...');
      const mimeType = thumbnailUrl.split(';')[0].split(':')[1];
      const uploadedUrl = await dbHelpers.uploadPlayerNoteThumbnailFromDataURL(thumbnailUrl, id, mimeType);

      if (uploadedUrl) {
        thumbnailUrl = uploadedUrl;
        if (import.meta.env.DEV) console.log('Player note thumbnail updated successfully in Supabase Storage');
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
      if (import.meta.env.DEV) console.log('Uploading media to Supabase Storage...');
      const mimeType = mediaUrl.split(';')[0].split(':')[1];
      const uploadedUrl = await dbHelpers.uploadHandoutMediaFromDataURL(mediaUrl, handoutId, mimeType);

      if (uploadedUrl) {
        mediaUrl = uploadedUrl;
        if (import.meta.env.DEV) console.log('Media uploaded successfully to Supabase Storage');
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
      isVisible: handout.isVisible ?? false,
    };

    try {
      await dbHelpers.saveHandout(newHandout);
    } catch (error) {
      console.error('Failed to save handout to DB:', error);
    }
    setHandouts(prev => [...prev, newHandout]);
  }, []);

  const updateHandout = useCallback((id: string, updates: Partial<Handout>) => {
    setHandouts(prev => {
      const updated = prev.map(handout =>
        handout.id === id
          ? { ...handout, ...updates, updatedAt: new Date().toISOString() }
          : handout
      );
      const changed = updated.find(h => h.id === id);
      if (changed) {
        dbHelpers.saveHandout(changed).catch(err => console.error('Failed to save handout update:', err));
      }
      return updated;
    });
  }, []);

  const deleteHandout = useCallback(async (id: string) => {
    // Delete media from Supabase Storage and metadata from DB
    await Promise.all([
      dbHelpers.deleteHandoutMedia(id),
      dbHelpers.deleteHandout(id),
    ]);
    setHandouts(prev => prev.filter(handout => handout.id !== id));
  }, []);

  const toggleHandoutVisibility = useCallback((id: string) => {
    setHandouts(prev => {
      const updated = prev.map(h =>
        h.id === id
          ? { ...h, isVisible: !h.isVisible, updatedAt: new Date().toISOString() }
          : h
      );
      const changed = updated.find(h => h.id === id);
      if (changed) {
        dbHelpers.saveHandout(changed).catch(err => console.error('Failed to save handout visibility:', err));
      }
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
