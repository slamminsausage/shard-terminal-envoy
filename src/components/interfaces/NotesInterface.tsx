import React, { useState, useMemo } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit2, Trash2, Save, X, Image as ImageIcon, Video, FileText, Folder, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayerNote, Handout, NoteFolder } from '@/types/notes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [selectedFolder, setSelectedFolder] = useState<NoteFolder | 'all'>('all');
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);

  // Only show visible handouts (admin page controls visibility)
  const visibleHandouts = handouts.filter(h => h.isVisible);

  // Debug logging
  React.useEffect(() => {
    console.log('NotesInterface - Total handouts:', handouts.length);
    console.log('NotesInterface - Visible handouts:', visibleHandouts.length);
    if (handouts.length > 0) {
      console.log('All handouts:', handouts.map(h => ({ title: h.title, isVisible: h.isVisible, type: h.type })));
    }
  }, [handouts, visibleHandouts]);

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
        });
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteFolder('general');
        setShowNewNoteForm(false);
      } catch (error) {
        console.error('Failed to add player note:', error);
        alert('Failed to save note. Please try again.');
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-[#00ff41] font-mono">
      <div className="border-b border-[#00ff41]/30 p-4">
        <h1 className="text-2xl font-bold text-[#00ff41]">
          NOTES & HANDOUTS
        </h1>
        <p className="text-[#00ff41]/70 text-sm mt-1">
          Track campaign notes and view shared handouts
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black border border-[#00ff41]/30">
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-[#00ff41]/20 data-[state=active]:text-[#00ff41]"
            >
              Player Notes ({playerNotes.length})
            </TabsTrigger>
            <TabsTrigger
              value="handouts"
              className="data-[state=active]:bg-[#00ff41]/20 data-[state=active]:text-[#00ff41]"
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
                    ? 'bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]/50'
                    : 'border-[#00ff41]/30 text-[#00ff41]/70 hover:bg-[#00ff41]/10'}
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
                      ? 'bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]/50'
                      : 'border-[#00ff41]/30 text-[#00ff41]/70 hover:bg-[#00ff41]/10'}
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
                className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 whitespace-nowrap"
              >
                + New Note
              </Button>
            </div>

            {showNewNoteForm && (
              <Card className="bg-black border-[#00ff41]/50">
                <CardHeader>
                  <CardTitle className="text-[#00ff41]">Create New Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Note Title"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        className="bg-black border-[#00ff41]/50 text-[#00ff41]"
                      />
                    </div>
                    <div>
                      <Select value={newNoteFolder} onValueChange={(v) => setNewNoteFolder(v as NoteFolder)}>
                        <SelectTrigger className="bg-black border-[#00ff41]/50 text-[#00ff41]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-[#00ff41]/50">
                          {FOLDERS.map((folder) => (
                            <SelectItem
                              key={folder.value}
                              value={folder.value}
                              className="text-[#00ff41] focus:bg-[#00ff41]/20 focus:text-[#00ff41]"
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
                    className="bg-black border-[#00ff41]/50 text-[#00ff41] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddPlayerNote}
                      className="bg-[#00ff41]/20 text-[#00ff41] hover:bg-[#00ff41]/30"
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
                      }}
                      variant="outline"
                      className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredNotes.length === 0 ? (
              <Card className="bg-black border-[#00ff41]/30">
                <CardContent className="p-8 text-center text-[#00ff41]/70">
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
              <Card className="bg-black border-[#00ff41]/30">
                <CardContent className="p-8 text-center text-[#00ff41]/70">
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

  const folderInfo = FOLDERS.find(f => f.value === (note.folder || 'general'));

  if (isEditing) {
    return (
      <Card className="bg-black border-[#00ff41]/50">
        <CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black border-[#00ff41]/50 text-[#00ff41] font-semibold sm:col-span-2"
            />
            <Select value={folder} onValueChange={(v) => setFolder(v as NoteFolder)}>
              <SelectTrigger className="bg-black border-[#00ff41]/50 text-[#00ff41]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#00ff41]/50">
                {FOLDERS.map((f) => (
                  <SelectItem
                    key={f.value}
                    value={f.value}
                    className="text-[#00ff41] focus:bg-[#00ff41]/20 focus:text-[#00ff41]"
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
            className="bg-black border-[#00ff41]/50 text-[#00ff41] resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => onSave({ title, content, folder })}
              size="sm"
              className="bg-[#00ff41]/20 text-[#00ff41] hover:bg-[#00ff41]/30"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
              className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20"
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
    <Card className="bg-black border-[#00ff41]/30 hover:border-[#00ff41]/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {folderInfo && <span className="text-lg">{folderInfo.emoji}</span>}
              <CardTitle className="text-[#00ff41]">{note.title}</CardTitle>
            </div>
            <CardDescription className="text-[#00ff41]/70 text-xs">
              {new Date(note.updatedAt).toLocaleString()}
              {folderInfo && (
                <Badge className="ml-2 bg-[#00ff41]/10 text-[#00ff41]/70 border-[#00ff41]/30 text-xs">
                  {folderInfo.label}
                </Badge>
              )}
              {showCreator && (
                <Badge className="ml-2 bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]/50 text-xs">
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
              className="text-[#00ff41] hover:bg-[#00ff41]/20"
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
      <Separator className="bg-[#00ff41]/30" />
      <CardContent className="pt-4">
        <p className="text-[#00ff41]/90 whitespace-pre-wrap">{note.content}</p>
      </CardContent>
    </Card>
  );
};

interface HandoutCardProps {
  handout: Handout;
}

const HandoutCard: React.FC<HandoutCardProps> = ({ handout }) => {
  const [showFullSize, setShowFullSize] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  const handleDialogClose = (open: boolean) => {
    setShowFullSize(open);
    if (!open) {
      setZoom(1); // Reset zoom when closing
    }
  };

  return (
    <Card className="bg-black border-[#00ff41]/30 hover:border-[#00ff41]/50 transition-colors">
      <CardHeader className="p-3">
        <div className="flex items-start gap-2">
          {handout.type === 'image' && <ImageIcon className="h-4 w-4 text-[#00ff41]/70 mt-1 flex-shrink-0" />}
          {handout.type === 'video' && <Video className="h-4 w-4 text-[#00ff41]/70 mt-1 flex-shrink-0" />}
          {handout.type === 'text' && <FileText className="h-4 w-4 text-[#00ff41]/70 mt-1 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-[#00ff41] text-sm truncate">{handout.title}</CardTitle>
            {handout.description && (
              <CardDescription className="text-[#00ff41]/70 text-xs mt-1 line-clamp-2">
                {handout.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-[#00ff41]/30" />
      <CardContent className="p-3">
        {handout.type === 'text' && handout.content && (
          <p className="text-[#00ff41]/90 text-xs whitespace-pre-wrap line-clamp-4">{handout.content}</p>
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
                className="w-full h-24 object-cover rounded border border-[#00ff41]/30"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <Maximize2 className="h-6 w-6 text-[#00ff41]" />
              </div>
            </div>
            <Dialog open={showFullSize} onOpenChange={handleDialogClose}>
              <DialogContent className="max-w-[95vw] max-h-[95vh] bg-black border-[#00ff41]/50 p-0">
                <DialogHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-[#00ff41]">{handout.title}</DialogTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleZoomOut}
                        size="sm"
                        variant="outline"
                        className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 h-8 w-8 p-0"
                        disabled={zoom <= 0.5}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleZoomReset}
                        size="sm"
                        variant="outline"
                        className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 h-8 px-2"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {Math.round(zoom * 100)}%
                      </Button>
                      <Button
                        onClick={handleZoomIn}
                        size="sm"
                        variant="outline"
                        className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 h-8 w-8 p-0"
                        disabled={zoom >= 3}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                <div className="overflow-auto max-h-[calc(95vh-80px)] p-4 pt-2">
                  <div className="flex items-center justify-center min-h-[200px]">
                    <img
                      src={handout.mediaUrl}
                      alt={handout.title}
                      className="max-w-full max-h-[calc(95vh-120px)] object-contain rounded transition-transform duration-200"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                className="w-full h-24 object-cover rounded border border-[#00ff41]/30"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <Maximize2 className="h-6 w-6 text-[#00ff41]" />
              </div>
            </div>
            <Dialog open={showFullSize} onOpenChange={handleDialogClose}>
              <DialogContent className="max-w-[95vw] max-h-[95vh] bg-black border-[#00ff41]/50 p-0">
                <DialogHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-[#00ff41]">{handout.title}</DialogTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleZoomOut}
                        size="sm"
                        variant="outline"
                        className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 h-8 w-8 p-0"
                        disabled={zoom <= 0.5}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleZoomReset}
                        size="sm"
                        variant="outline"
                        className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 h-8 px-2"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {Math.round(zoom * 100)}%
                      </Button>
                      <Button
                        onClick={handleZoomIn}
                        size="sm"
                        variant="outline"
                        className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20 h-8 w-8 p-0"
                        disabled={zoom >= 3}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                <div className="overflow-auto max-h-[calc(95vh-80px)] p-4 pt-2">
                  <div className="flex items-center justify-center min-h-[200px]">
                    <video
                      src={handout.mediaUrl}
                      controls
                      autoPlay
                      className="max-w-full max-h-[calc(95vh-120px)] object-contain rounded transition-transform duration-200"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};
