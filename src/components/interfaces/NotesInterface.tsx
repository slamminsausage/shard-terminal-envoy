import React, { useState, useMemo } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit2, Trash2, Save, X, Image as ImageIcon, Video, FileText, Folder } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayerNote, Handout, NoteFolder } from '@/types/notes';

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

  // Visible handouts for players (all handouts for GM)
  const visibleHandouts = isGMMode ? handouts : handouts.filter(h => h.isVisible);

  // Debug logging
  React.useEffect(() => {
    console.log('NotesInterface - GM Mode:', isGMMode);
    console.log('NotesInterface - Total handouts:', handouts.length);
    console.log('NotesInterface - Visible handouts:', visibleHandouts.length);
    handouts.forEach(h => console.log(`  - ${h.title}: isVisible=${h.isVisible}`));
  }, [handouts, visibleHandouts, isGMMode]);

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

  const handleAddPlayerNote = () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      addPlayerNote({
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
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-[#00ff41] font-mono">
      <div className="border-b border-[#00ff41]/30 p-4">
        <h1 className="text-2xl font-bold text-[#00ff41]">
          {isGMMode ? 'NOTES & HANDOUTS MANAGER' : 'PLAYER NOTES & HANDOUTS'}
        </h1>
        <p className="text-[#00ff41]/70 text-sm mt-1">
          {isGMMode
            ? 'Track campaign notes and manage shared handouts'
            : 'Track your campaign notes and view shared handouts'}
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
                    onSave={(updates) => {
                      updatePlayerNote(note.id, updates);
                      setEditingNote(null);
                    }}
                    onCancel={() => setEditingNote(null)}
                    onDelete={() => deletePlayerNote(note.id)}
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
                  {isGMMode
                    ? 'No handouts yet. Go to the Handout Manager to create handouts.'
                    : 'No handouts available yet. Check back later!'}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {visibleHandouts.map((handout) => (
                  <HandoutCard key={handout.id} handout={handout} />
                ))}
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
  onSave: (updates: Partial<PlayerNote>) => void;
  onCancel: () => void;
  onDelete: () => void;
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
  return (
    <Card className="bg-black border-[#00ff41]/30 hover:border-[#00ff41]/50 transition-colors">
      <CardHeader>
        <div className="flex items-start gap-2">
          {handout.type === 'image' && <ImageIcon className="h-5 w-5 text-[#00ff41]/70 mt-1" />}
          {handout.type === 'video' && <Video className="h-5 w-5 text-[#00ff41]/70 mt-1" />}
          {handout.type === 'text' && <FileText className="h-5 w-5 text-[#00ff41]/70 mt-1" />}
          <div className="flex-1">
            <CardTitle className="text-[#00ff41]">{handout.title}</CardTitle>
            {handout.description && (
              <CardDescription className="text-[#00ff41]/70 text-sm mt-1">
                {handout.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-[#00ff41]/30" />
      <CardContent className="pt-4">
        {handout.type === 'text' && handout.content && (
          <p className="text-[#00ff41]/90 whitespace-pre-wrap">{handout.content}</p>
        )}
        {handout.type === 'image' && handout.mediaUrl && (
          <img
            src={handout.mediaUrl}
            alt={handout.title}
            className="w-full rounded border border-[#00ff41]/30"
          />
        )}
        {handout.type === 'video' && handout.mediaUrl && (
          <video
            src={handout.mediaUrl}
            controls
            className="w-full rounded border border-[#00ff41]/30"
          />
        )}
      </CardContent>
    </Card>
  );
};
