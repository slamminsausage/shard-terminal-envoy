import React, { useState, useMemo } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit2, Trash2, Save, X, Image as ImageIcon, Video, FileText, Folder, Maximize2, Upload, Crop } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayerNote, Handout, NoteFolder } from '@/types/notes';
import { compressImage } from '@/lib/mediaCompression';
import { dbHelpers } from '@/lib/supabase';
import { ThumbnailCropper } from '@/components/ui/ThumbnailCropper';
import { MediaDialog } from '@/components/ui/MediaDialog';

const FOLDERS: { value: NoteFolder; label: string; emoji: string }[] = [
  { value: 'general', label: 'General', emoji: '📝' },
  { value: 'planets', label: 'Planets', emoji: '🌍' },
  { value: 'locations', label: 'Locations', emoji: '📍' },
  { value: 'npcs', label: 'NPCs', emoji: '👤' },
  { value: 'quests', label: 'Quests', emoji: '⚔️' },
  { value: 'items', label: 'Items', emoji: '🎒' },
  { value: 'other', label: 'Other', emoji: '📦' },
];

export const NotesInterface: React.FC = () => {
  const {
    playerNotes,
    addPlayerNote,
    updatePlayerNote,
    deletePlayerNote,
    handouts,
    isGMMode,
  } = useNotes();

  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteFolder, setNewNoteFolder] = useState<NoteFolder>('general');
  const [newNoteThumbnailUrl, setNewNoteThumbnailUrl] = useState('');
  const [isUploadingNewNoteThumbnail, setIsUploadingNewNoteThumbnail] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<NoteFolder | 'all'>('all');
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNoteCropperOpen, setNewNoteCropperOpen] = useState(false);
  const [newNoteSelectedFile, setNewNoteSelectedFile] = useState<File | null>(null);

  // Only show visible handouts (admin page controls visibility)
  const visibleHandouts = handouts.filter(h => h.isVisible);


  // Filter notes by folder
  const filteredNotes = useMemo(() => {
    if (selectedFolder === 'all') return playerNotes;
    return playerNotes.filter(note => (note.folder || 'general') === selectedFolder);
  }, [playerNotes, selectedFolder]);

  // Count notes per folder
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    playerNotes.forEach(note => {
      const folder = note.folder || 'general';
      counts[folder] = (counts[folder] || 0) + 1;
    });
    return counts;
  }, [playerNotes]);

  const handleAddPlayerNote = async () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      try {
        await addPlayerNote({
          title: newNoteTitle,
          content: newNoteContent,
          folder: newNoteFolder,
          createdBy: isGMMode ? 'gm' : 'player',
          tags: [],
          thumbnailUrl: newNoteThumbnailUrl || undefined,
        });
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteFolder('general');
        setNewNoteThumbnailUrl('');
        setShowNewNoteForm(false);
      } catch (error) {
        console.error('Failed to add player note:', error);
        alert('Failed to save note. Please try again.');
      }
    }
  };

  const handleNewNoteThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Open cropper with the selected file
    setNewNoteSelectedFile(file);
    setNewNoteCropperOpen(true);

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleNewNoteCropComplete = (croppedDataUrl: string) => {
    // For new notes, we'll store the data URL temporarily
    // It will be uploaded to storage when the note is saved
    setNewNoteThumbnailUrl(croppedDataUrl);
    setNewNoteSelectedFile(null);
  };

  const handleEditNewNoteThumbnail = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setNewNoteSelectedFile(file);
        setNewNoteCropperOpen(true);
      }
    };
    input.click();
  };

  const handleRemoveNewNoteThumbnail = () => {
    setNewNoteThumbnailUrl('');
  };

  return (
    <div className="h-full flex flex-col bg-black text-terminal-primary font-mono">
      <div className="border-b border-terminal-primary/30 p-4">
        <h1 className="text-2xl font-bold text-terminal-primary">
          NOTES & HANDOUTS
        </h1>
        <p className="text-terminal-primary/70 text-sm mt-1">
          Track campaign notes and view shared handouts
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black border border-terminal-primary/30">
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary"
            >
              Player Notes ({playerNotes.length})
            </TabsTrigger>
            <TabsTrigger
              value="handouts"
              className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary"
            >
              Handouts ({visibleHandouts.length})
            </TabsTrigger>
          </TabsList>

          {/* Player Notes Tab */}
          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Button
                  onClick={() => setSelectedFolder('all')}
                  size="sm"
                  variant={selectedFolder === 'all' ? 'default' : 'outline'}
                  className={selectedFolder === 'all'
                    ? 'bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50'
                    : 'border-terminal-primary/30 text-terminal-primary/70 hover:bg-terminal-primary/10'}
                >
                  All ({playerNotes.length})
                </Button>
                {FOLDERS.map((folder) => (
                  <Button
                    key={folder.value}
                    onClick={() => setSelectedFolder(folder.value)}
                    size="sm"
                    variant={selectedFolder === folder.value ? 'default' : 'outline'}
                    className={selectedFolder === folder.value
                      ? 'bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50'
                      : 'border-terminal-primary/30 text-terminal-primary/70 hover:bg-terminal-primary/10'}
                  >
                    <span className="mr-1">{folder.emoji}</span>
                    {folder.label}
                    {folderCounts[folder.value] ? ` (${folderCounts[folder.value]})` : ''}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setShowNewNoteForm(!showNewNoteForm)}
                variant="outline"
                size="sm"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 whitespace-nowrap"
              >
                + New Note
              </Button>
            </div>

            {showNewNoteForm && (
              <Card className="bg-black border-terminal-primary/50">
                <CardHeader>
                  <CardTitle className="text-terminal-primary">Create New Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Note Title"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        className="bg-black border-terminal-primary/50 text-terminal-primary"
                      />
                    </div>
                    <div>
                      <Select value={newNoteFolder} onValueChange={(v) => setNewNoteFolder(v as NoteFolder)}>
                        <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-terminal-primary/50">
                          {FOLDERS.map((folder) => (
                            <SelectItem
                              key={folder.value}
                              value={folder.value}
                              className="text-terminal-primary focus:bg-terminal-primary/20 focus:text-terminal-primary"
                            >
                              {folder.emoji} {folder.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Note Content"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={6}
                    className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
                  />

                  {/* Thumbnail Upload Section for NPCs */}
                  {newNoteFolder === 'npcs' && (
                    <div className="space-y-2">
                      <label className="text-xs text-terminal-primary/70 uppercase">NPC Portrait</label>
                      <div className="flex items-center gap-2">
                        {newNoteThumbnailUrl && (
                          <div className="relative group">
                            <img
                              src={newNoteThumbnailUrl}
                              alt="NPC Thumbnail"
                              className="w-20 h-20 object-cover rounded border border-terminal-primary/30"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded">
                              <Button
                                onClick={handleEditNewNoteThumbnail}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0 border-terminal-primary/50 hover:bg-terminal-primary/20"
                                title="Crop/Edit"
                              >
                                <Crop className="h-3 w-3 text-terminal-primary" />
                              </Button>
                              <Button
                                onClick={handleRemoveNewNoteThumbnail}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0 bg-red-500/80 border-red-500 hover:bg-red-600"
                                title="Remove"
                              >
                                <X className="h-3 w-3 text-white" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleNewNoteThumbnailUpload}
                              className="hidden"
                              disabled={isUploadingNewNoteThumbnail}
                            />
                            <div className="border border-terminal-primary/50 rounded p-2 text-center hover:bg-terminal-primary/10 transition-colors">
                              <Upload className="h-4 w-4 mx-auto mb-1 text-terminal-primary" />
                              <span className="text-xs text-terminal-primary">
                                {isUploadingNewNoteThumbnail ? 'Processing...' : newNoteThumbnailUrl ? 'Change Portrait' : 'Upload Portrait'}
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Thumbnail Cropper Dialog for new notes */}
                      <ThumbnailCropper
                        open={newNoteCropperOpen}
                        onOpenChange={setNewNoteCropperOpen}
                        imageFile={newNoteSelectedFile}
                        onCropComplete={handleNewNoteCropComplete}
                        outputSize={400}
                        title="Crop NPC Portrait"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddPlayerNote}
                      className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Note
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNewNoteForm(false);
                        setNewNoteTitle('');
                        setNewNoteContent('');
                        setNewNoteFolder('general');
                        setNewNoteThumbnailUrl('');
                      }}
                      variant="outline"
                      className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredNotes.length === 0 ? (
              <Card className="bg-black border-terminal-primary/30">
                <CardContent className="p-8 text-center text-terminal-primary/70">
                  {selectedFolder === 'all'
                    ? 'No notes yet. Create your first note to get started.'
                    : `No notes in ${FOLDERS.find(f => f.value === selectedFolder)?.label} folder.`}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isEditing={editingNote === note.id}
                    onEdit={() => setEditingNote(note.id)}
                    onSave={async (updates) => {
                      try {
                        await updatePlayerNote(note.id, updates);
                        setEditingNote(null);
                      } catch (error) {
                        console.error('Failed to update note:', error);
                        alert('Failed to update note. Please try again.');
                      }
                    }}
                    onCancel={() => setEditingNote(null)}
                    onDelete={async () => {
                      try {
                        await deletePlayerNote(note.id);
                      } catch (error) {
                        console.error('Failed to delete note:', error);
                        alert('Failed to delete note. Please try again.');
                      }
                    }}
                    showCreator={isGMMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Handouts Tab */}
          <TabsContent value="handouts" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Shared Handouts</h2>
            </div>

            {visibleHandouts.length === 0 ? (
              <Card className="bg-black border-terminal-primary/30">
                <CardContent className="p-8 text-center text-terminal-primary/70">
                  No handouts available yet. Handouts will appear here when revealed.
                </CardContent>
              </Card>
            ) : (
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {visibleHandouts.map((handout) => (
                    <HandoutCard key={handout.id} handout={handout} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

// Sub-components for different note types
interface NoteCardProps {
  note: PlayerNote;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<PlayerNote>) => Promise<void>;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  showCreator?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  showCreator,
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [folder, setFolder] = useState<NoteFolder>((note.folder as NoteFolder) || 'general');
  const [thumbnailUrl, setThumbnailUrl] = useState(note.thumbnailUrl || '');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const folderInfo = FOLDERS.find(f => f.value === (note.folder || 'general'));

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Open cropper with the selected file
    setSelectedFile(file);
    setCropperOpen(true);

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    try {
      setIsUploadingThumbnail(true);

      // Extract mime type from data URL
      const mimeType = croppedDataUrl.split(';')[0].split(':')[1];

      // Upload to Supabase Storage
      const uploadedUrl = await dbHelpers.uploadPlayerNoteThumbnailFromDataURL(
        croppedDataUrl,
        note.id,
        mimeType
      );

      if (uploadedUrl) {
        setThumbnailUrl(uploadedUrl);
      } else {
        alert('Failed to upload thumbnail. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Failed to upload thumbnail. Please try again.');
    } finally {
      setIsUploadingThumbnail(false);
      setSelectedFile(null);
    }
  };

  const handleEditThumbnail = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        setCropperOpen(true);
      }
    };
    input.click();
  };

  const handleRemoveThumbnail = async () => {
    try {
      await dbHelpers.deletePlayerNoteThumbnail(note.id);
      setThumbnailUrl('');
    } catch (error) {
      console.error('Error removing thumbnail:', error);
    }
  };

  if (isEditing) {
    return (
      <Card className="bg-black border-terminal-primary/50">
        <CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary font-semibold sm:col-span-2"
            />
            <Select value={folder} onValueChange={(v) => setFolder(v as NoteFolder)}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                {FOLDERS.map((f) => (
                  <SelectItem
                    key={f.value}
                    value={f.value}
                    className="text-terminal-primary focus:bg-terminal-primary/20 focus:text-terminal-primary"
                  >
                    {f.emoji} {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
          />

          {/* Thumbnail Upload Section */}
          {folder === 'npcs' && (
            <div className="space-y-2">
              <label className="text-xs text-terminal-primary/70 uppercase">NPC Portrait</label>
              <div className="flex items-center gap-2">
                {thumbnailUrl && (
                  <div className="relative group">
                    <img
                      src={thumbnailUrl}
                      alt="NPC Thumbnail"
                      className="w-20 h-20 object-cover rounded border border-terminal-primary/30"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded">
                      <Button
                        onClick={handleEditThumbnail}
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 border-terminal-primary/50 hover:bg-terminal-primary/20"
                        title="Crop/Edit"
                      >
                        <Crop className="h-3 w-3 text-terminal-primary" />
                      </Button>
                      <Button
                        onClick={handleRemoveThumbnail}
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 bg-red-500/80 border-red-500 hover:bg-red-600"
                        title="Remove"
                      >
                        <X className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      disabled={isUploadingThumbnail}
                    />
                    <div className="border border-terminal-primary/50 rounded p-2 text-center hover:bg-terminal-primary/10 transition-colors">
                      <Upload className="h-4 w-4 mx-auto mb-1 text-terminal-primary" />
                      <span className="text-xs text-terminal-primary">
                        {isUploadingThumbnail ? 'Uploading...' : thumbnailUrl ? 'Change Portrait' : 'Upload Portrait'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Thumbnail Cropper Dialog */}
              <ThumbnailCropper
                open={cropperOpen}
                onOpenChange={setCropperOpen}
                imageFile={selectedFile}
                onCropComplete={handleCropComplete}
                outputSize={400}
                title="Crop NPC Portrait"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => onSave({ title, content, folder, thumbnailUrl })}
              size="sm"
              className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
              className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-terminal-primary/30 hover:border-terminal-primary/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {folderInfo && <span className="text-lg">{folderInfo.emoji}</span>}
              <CardTitle className="text-terminal-primary">{note.title}</CardTitle>
            </div>
            <CardDescription className="text-terminal-primary/70 text-xs">
              {new Date(note.updatedAt).toLocaleString()}
              {folderInfo && (
                <Badge className="ml-2 bg-terminal-primary/10 text-terminal-primary/70 border-terminal-primary/30 text-xs">
                  {folderInfo.label}
                </Badge>
              )}
              {showCreator && (
                <Badge className="ml-2 bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50 text-xs">
                  {note.createdBy === 'gm' ? 'GM' : 'Player'}
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onEdit}
              size="sm"
              variant="ghost"
              className="text-terminal-primary hover:bg-terminal-primary/20"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={onDelete}
              size="sm"
              variant="ghost"
              className="text-red-500 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-terminal-primary/30" />
      <CardContent className="pt-4">
        {note.thumbnailUrl && (
          <div className="mb-3">
            <img
              src={note.thumbnailUrl}
              alt={note.title}
              className="w-24 h-24 object-cover rounded border border-terminal-primary/30"
            />
          </div>
        )}
        <p className="text-terminal-primary/90 whitespace-pre-wrap">{note.content}</p>
      </CardContent>
    </Card>
  );
};

interface HandoutCardProps {
  handout: Handout;
}

const HandoutCard: React.FC<HandoutCardProps> = ({ handout }) => {
  const [showFullSize, setShowFullSize] = useState(false);

  return (
    <Card className="bg-black border-terminal-primary/30 hover:border-terminal-primary/50 transition-colors">
      <CardHeader className="p-3">
        <div className="flex items-start gap-2">
          {handout.type === 'image' && <ImageIcon className="h-4 w-4 text-terminal-primary/70 mt-1 flex-shrink-0" />}
          {handout.type === 'video' && <Video className="h-4 w-4 text-terminal-primary/70 mt-1 flex-shrink-0" />}
          {handout.type === 'text' && <FileText className="h-4 w-4 text-terminal-primary/70 mt-1 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-terminal-primary text-sm truncate">{handout.title}</CardTitle>
            {handout.description && (
              <CardDescription className="text-terminal-primary/70 text-xs mt-1 line-clamp-2">
                {handout.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-terminal-primary/30" />
      <CardContent className="p-3">
        {handout.type === 'text' && handout.content && (
          <p className="text-terminal-primary/90 text-xs whitespace-pre-wrap line-clamp-4">{handout.content}</p>
        )}
        {handout.type === 'image' && handout.mediaUrl && (
          <>
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowFullSize(true)}
            >
              <img
                src={handout.mediaUrl}
                alt={handout.title}
                className="w-full h-24 object-cover rounded border border-terminal-primary/30"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <Maximize2 className="h-6 w-6 text-terminal-primary" />
              </div>
            </div>
            <MediaDialog
              open={showFullSize}
              onOpenChange={setShowFullSize}
              title={handout.title}
              mediaUrl={handout.mediaUrl}
              type="image"
            />
          </>
        )}
        {handout.type === 'video' && handout.mediaUrl && (
          <>
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowFullSize(true)}
            >
              <video
                src={handout.mediaUrl}
                className="w-full h-24 object-cover rounded border border-terminal-primary/30"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <Maximize2 className="h-6 w-6 text-terminal-primary" />
              </div>
            </div>
            <MediaDialog
              open={showFullSize}
              onOpenChange={setShowFullSize}
              title={handout.title}
              mediaUrl={handout.mediaUrl}
              type="video"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
