# Database Migration Setup

## Overview

This update migrates both handout media storage and player notes to Supabase for persistence and reliability:

1. **Handouts**: Media files (images/videos) moved from localStorage to Supabase Storage
2. **Player Notes**: All notes moved from localStorage to Supabase database

This solves the QuotaExceededError issue and provides cross-device persistence for campaign notes.

## What Changed

### Handouts (Before)
- All handout data (including base64-encoded images/videos) was stored in localStorage
- localStorage has a ~5-10MB limit, causing QuotaExceededError with large media files

### Handouts (After)
- Media files are uploaded to Supabase Storage bucket
- Only handout metadata and media URLs are stored in localStorage
- Automatic migration of existing handouts on app load

### Player Notes (Before)
- All player notes stored in localStorage
- Notes not accessible across devices or browsers
- Risk of data loss if localStorage is cleared

### Player Notes (After)
- All player notes stored in Supabase database
- Notes persist across devices and browsers
- Automatic migration of existing localStorage notes on first load

## Setup Instructions

### Step 1: Run Database Migrations

You need to run TWO SQL migrations to set up both the storage bucket and the player notes table.

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/uyzzwiakehkoztprcikx
2. Navigate to the SQL Editor
3. Run the following migrations in order:
   - Copy and paste `supabase/migrations/20260112_create_handouts_bucket.sql` and run it
   - Copy and paste `supabase/migrations/20260112_create_player_notes_table.sql` and run it

**Option B: Using Supabase CLI** (if installed)
```bash
supabase db push
```

### Step 2: Verify the Setup

**Storage Bucket:**
1. Go to Storage in your Supabase dashboard
2. You should see a new bucket called `handouts`
3. The bucket should be configured as public (read access for all users)

**Database Table:**
1. Go to Table Editor in your Supabase dashboard
2. You should see a new table called `player_notes`
3. The table should have columns: id, title, content, created_at, updated_at, created_by, folder, tags

### Step 3: Test the Implementation

1. Build and deploy the application
2. Log in as GM and create a new handout with an image or video
3. Check the browser console - you should see:
   - "Uploading media to Supabase Storage..."
   - "Upload successful, public URL: ..."
   - The saved size should be much smaller than before

## Migration

The application automatically migrates existing data from localStorage to Supabase on load:

### Handouts Migration
1. When the app loads, it checks for handouts with base64 `data:` URLs
2. Each base64 media file is uploaded to Supabase Storage
3. The handout is updated with the new public URL
4. The migration progress is logged to the console

### Player Notes Migration
1. On first load, the app checks if the database has any notes
2. If the database is empty but localStorage has notes, automatic migration begins
3. Each note is saved to the database
4. After successful migration, localStorage notes are removed
5. The migration progress is logged to the console

## Benefits

- ✅ **No more storage quota errors** - Media files stored in Supabase Storage, not localStorage
- ✅ **Cross-device persistence** - Player notes accessible from any device/browser
- ✅ **Better performance** - URLs are much smaller than base64 data
- ✅ **Automatic migration** - Existing handouts and notes are automatically migrated
- ✅ **Improved reliability** - Cloud storage/database is more reliable than browser storage
- ✅ **No data loss** - All existing handouts and notes are preserved
- ✅ **Campaign continuity** - Notes persist even if browser data is cleared

## Troubleshooting

### "Failed to upload handout media"
- Check that the storage bucket was created correctly
- Verify the bucket is public and has the correct policies
- Check the browser console for detailed error messages

### "Storage limit exceeded" (after migration)
- This shouldn't happen anymore, but if it does:
  - Check the browser console for warnings about base64 data
  - Try clearing old handouts from localStorage manually
  - Contact support if the issue persists

### Migration doesn't run
- Clear your browser cache and reload the app
- Check the browser console for migration logs
- Verify that handouts exist in localStorage before migration

## Technical Details

### Files Modified
- `src/contexts/NotesContext.tsx` - Added Supabase database and storage integration with migration
- `src/lib/supabase.ts` - Added storage and database helper functions
- `src/pages/AdminNotes.tsx` - Updated to handle async operations
- `src/components/interfaces/NotesInterface.tsx` - Updated to handle async note operations
- `supabase/migrations/20260112_create_handouts_bucket.sql` - Storage bucket SQL migration
- `supabase/migrations/20260112_create_player_notes_table.sql` - Player notes table SQL migration

### Storage Functions
- `dbHelpers.uploadHandoutMedia(file, handoutId)` - Upload a File/Blob
- `dbHelpers.uploadHandoutMediaFromDataURL(dataUrl, handoutId, mimeType)` - Upload from base64
- `dbHelpers.deleteHandoutMedia(handoutId)` - Delete media file

### Database Functions
- `dbHelpers.getAllPlayerNotes()` - Fetch all player notes
- `dbHelpers.savePlayerNote(note)` - Create or update a note
- `dbHelpers.deletePlayerNote(noteId)` - Delete a note

### Storage Bucket Structure
- Bucket name: `handouts`
- File naming: `{handoutId}.{ext}` (e.g., `handout-123456.jpg`)
- Public read access enabled
- Authenticated users can upload/update/delete

### Database Table Structure
- Table name: `player_notes`
- Primary key: `id` (text)
- Columns: title, content, created_at, updated_at, created_by, folder, tags
- Indexes on: folder, created_by, updated_at
- RLS policies enabled for both authenticated and anonymous users
