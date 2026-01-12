# Handouts Storage Setup

## Overview

This update migrates handout media storage from localStorage to Supabase Storage to solve the QuotaExceededError issue. Media files (images and videos) are now stored in Supabase Storage, while handout metadata remains in localStorage.

## What Changed

### Before
- All handout data (including base64-encoded images/videos) was stored in localStorage
- localStorage has a ~5-10MB limit, causing QuotaExceededError with large media files

### After
- Media files are uploaded to Supabase Storage bucket
- Only handout metadata and media URLs are stored in localStorage
- Automatic migration of existing handouts on app load

## Setup Instructions

### Step 1: Create the Storage Bucket

You need to run the SQL migration to create the `handouts` bucket in your Supabase database.

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/uyzzwiakehkoztprcikx
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20260112_create_handouts_bucket.sql`
4. Run the query

**Option B: Using Supabase CLI** (if installed)
```bash
supabase db push
```

### Step 2: Verify the Bucket

1. Go to Storage in your Supabase dashboard
2. You should see a new bucket called `handouts`
3. The bucket should be configured as public (read access for all users)

### Step 3: Test the Implementation

1. Build and deploy the application
2. Log in as GM and create a new handout with an image or video
3. Check the browser console - you should see:
   - "Uploading media to Supabase Storage..."
   - "Upload successful, public URL: ..."
   - The saved size should be much smaller than before

## Migration

The application automatically migrates existing handouts with base64 data to Supabase Storage on load:

1. When the app loads, it checks for handouts with base64 `data:` URLs
2. Each base64 media file is uploaded to Supabase Storage
3. The handout is updated with the new public URL
4. The migration progress is logged to the console

## Benefits

- ✅ **No more storage quota errors** - Media files are stored in Supabase, not localStorage
- ✅ **Better performance** - URLs are much smaller than base64 data
- ✅ **Automatic migration** - Existing handouts are automatically migrated
- ✅ **Improved reliability** - Cloud storage is more reliable than browser storage
- ✅ **No data loss** - All existing handouts are preserved

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
- `src/contexts/NotesContext.tsx` - Added Supabase Storage integration and migration
- `src/lib/supabase.ts` - Added storage helper functions
- `src/pages/AdminNotes.tsx` - Updated to handle async operations
- `supabase/migrations/20260112_create_handouts_bucket.sql` - SQL migration

### Storage Functions
- `dbHelpers.uploadHandoutMedia(file, handoutId)` - Upload a File/Blob
- `dbHelpers.uploadHandoutMediaFromDataURL(dataUrl, handoutId, mimeType)` - Upload from base64
- `dbHelpers.deleteHandoutMedia(handoutId)` - Delete media file

### Bucket Structure
- Bucket name: `handouts`
- File naming: `{handoutId}.{ext}` (e.g., `handout-123456.jpg`)
- Public read access enabled
- Authenticated users can upload/update/delete
