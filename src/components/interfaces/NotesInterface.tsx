import React, { useState } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Eye, EyeOff, Edit2, Trash2, Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlayerNote, Handout, GMNote } from '@/types/notes';

export const NotesInterface: React.FC = () => {
  const {
    playerNotes,
    addPlayerNote,
    updatePlayerNote,
    deletePlayerNote,
    gmNotes,
    addGMNote,
    updateGMNote,
    deleteGMNote,
    handouts,
    addHandout,
    updateHandout,
    deleteHandout,
    toggleHandoutVisibility,
    isGMMode,
  } = useNotes();

  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingGMNote, setEditingGMNote] = useState<string | null>(null);
  const [editingHandout, setEditingHandout] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newGMNoteTitle, setNewGMNoteTitle] = useState('');
  const [newGMNoteContent, setNewGMNoteContent] = useState('');
  const [newHandoutTitle, setNewHandoutTitle] = useState('');
  const [newHandoutContent, setNewHandoutContent] = useState('');
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [showNewGMNoteForm, setShowNewGMNoteForm] = useState(false);
  const [showNewHandoutForm, setShowNewHandoutForm] = useState(false);

  // Visible handouts for players (all handouts for GM)
  const visibleHandouts = isGMMode ? handouts : handouts.filter(h => h.isVisible);

  const handleAddPlayerNote = () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      addPlayerNote({
        title: newNoteTitle,
        content: newNoteContent,
        createdBy: isGMMode ? 'gm' : 'player',
        tags: [],
      });
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowNewNoteForm(false);
    }
  };

  const handleAddGMNote = () => {
    if (newGMNoteTitle.trim() && newGMNoteContent.trim()) {
      addGMNote({
        title: newGMNoteTitle,
        content: newGMNoteContent,
        tags: [],
      });
      setNewGMNoteTitle('');
      setNewGMNoteContent('');
      setShowNewGMNoteForm(false);
    }
  };

  const handleAddHandout = () => {
    if (newHandoutTitle.trim() && newHandoutContent.trim()) {
      addHandout({
        title: newHandoutTitle,
        content: newHandoutContent,
        isVisible: false,
        tags: [],
      });
      setNewHandoutTitle('');
      setNewHandoutContent('');
      setShowNewHandoutForm(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-[#00ff41] font-mono">
      <div className="border-b border-[#00ff41]/30 p-4">
        <h1 className="text-2xl font-bold text-[#00ff41]">
          {isGMMode ? 'GM NOTES & HANDOUTS' : 'PLAYER NOTES & HANDOUTS'}
        </h1>
        <p className="text-[#00ff41]/70 text-sm mt-1">
          {isGMMode
            ? 'Manage campaign notes and control handout visibility'
            : 'Track your campaign notes and view shared handouts'}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black border border-[#00ff41]/30">
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-[#00ff41]/20 data-[state=active]:text-[#00ff41]"
            >
              Player Notes
            </TabsTrigger>
            <TabsTrigger
              value="handouts"
              className="data-[state=active]:bg-[#00ff41]/20 data-[state=active]:text-[#00ff41]"
            >
              Handouts
            </TabsTrigger>
            {isGMMode && (
              <TabsTrigger
                value="gm-notes"
                className="data-[state=active]:bg-[#00ff41]/20 data-[state=active]:text-[#00ff41]"
              >
                GM Notes
              </TabsTrigger>
            )}
          </TabsList>

          {/* Player Notes Tab */}
          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Player Notes</h2>
              <Button
                onClick={() => setShowNewNoteForm(!showNewNoteForm)}
                variant="outline"
                size="sm"
                className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>

            {showNewNoteForm && (
              <Card className="bg-black border-[#00ff41]/50">
                <CardHeader>
                  <CardTitle className="text-[#00ff41]">Create New Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Note Title"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="bg-black border-[#00ff41]/50 text-[#00ff41]"
                  />
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

            {playerNotes.length === 0 ? (
              <Card className="bg-black border-[#00ff41]/30">
                <CardContent className="p-8 text-center text-[#00ff41]/70">
                  No notes yet. Create your first note to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {playerNotes.map((note) => (
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
              <h2 className="text-lg font-semibold">Handouts</h2>
              {isGMMode && (
                <Button
                  onClick={() => setShowNewHandoutForm(!showNewHandoutForm)}
                  variant="outline"
                  size="sm"
                  className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Handout
                </Button>
              )}
            </div>

            {isGMMode && showNewHandoutForm && (
              <Card className="bg-black border-[#00ff41]/50">
                <CardHeader>
                  <CardTitle className="text-[#00ff41]">Create New Handout</CardTitle>
                  <CardDescription className="text-[#00ff41]/70">
                    Handouts are hidden from players by default until you reveal them
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Handout Title"
                    value={newHandoutTitle}
                    onChange={(e) => setNewHandoutTitle(e.target.value)}
                    className="bg-black border-[#00ff41]/50 text-[#00ff41]"
                  />
                  <Textarea
                    placeholder="Handout Content"
                    value={newHandoutContent}
                    onChange={(e) => setNewHandoutContent(e.target.value)}
                    rows={6}
                    className="bg-black border-[#00ff41]/50 text-[#00ff41] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddHandout}
                      className="bg-[#00ff41]/20 text-[#00ff41] hover:bg-[#00ff41]/30"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Create Handout
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNewHandoutForm(false);
                        setNewHandoutTitle('');
                        setNewHandoutContent('');
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

            {visibleHandouts.length === 0 ? (
              <Card className="bg-black border-[#00ff41]/30">
                <CardContent className="p-8 text-center text-[#00ff41]/70">
                  {isGMMode
                    ? 'No handouts yet. Create your first handout to share with players.'
                    : 'No handouts available yet. Check back later!'}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {visibleHandouts.map((handout) => (
                  <HandoutCard
                    key={handout.id}
                    handout={handout}
                    isGMMode={isGMMode}
                    isEditing={editingHandout === handout.id}
                    onEdit={() => setEditingHandout(handout.id)}
                    onSave={(updates) => {
                      updateHandout(handout.id, updates);
                      setEditingHandout(null);
                    }}
                    onCancel={() => setEditingHandout(null)}
                    onDelete={() => deleteHandout(handout.id)}
                    onToggleVisibility={() => toggleHandoutVisibility(handout.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* GM Notes Tab */}
          {isGMMode && (
            <TabsContent value="gm-notes" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">GM Notes (Private)</h2>
                <Button
                  onClick={() => setShowNewGMNoteForm(!showNewGMNoteForm)}
                  variant="outline"
                  size="sm"
                  className="border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/20"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New GM Note
                </Button>
              </div>

              {showNewGMNoteForm && (
                <Card className="bg-black border-[#00ff41]/50">
                  <CardHeader>
                    <CardTitle className="text-[#00ff41]">Create New GM Note</CardTitle>
                    <CardDescription className="text-[#00ff41]/70">
                      GM notes are always private and never visible to players
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Note Title"
                      value={newGMNoteTitle}
                      onChange={(e) => setNewGMNoteTitle(e.target.value)}
                      className="bg-black border-[#00ff41]/50 text-[#00ff41]"
                    />
                    <Textarea
                      placeholder="Note Content"
                      value={newGMNoteContent}
                      onChange={(e) => setNewGMNoteContent(e.target.value)}
                      rows={6}
                      className="bg-black border-[#00ff41]/50 text-[#00ff41] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddGMNote}
                        className="bg-[#00ff41]/20 text-[#00ff41] hover:bg-[#00ff41]/30"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Note
                      </Button>
                      <Button
                        onClick={() => {
                          setShowNewGMNoteForm(false);
                          setNewGMNoteTitle('');
                          setNewGMNoteContent('');
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

              {gmNotes.length === 0 ? (
                <Card className="bg-black border-[#00ff41]/30">
                  <CardContent className="p-8 text-center text-[#00ff41]/70">
                    No GM notes yet. Create your first note to track campaign secrets.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {gmNotes.map((note) => (
                    <GMNoteCard
                      key={note.id}
                      note={note}
                      isEditing={editingGMNote === note.id}
                      onEdit={() => setEditingGMNote(note.id)}
                      onSave={(updates) => {
                        updateGMNote(note.id, updates);
                        setEditingGMNote(null);
                      }}
                      onCancel={() => setEditingGMNote(null)}
                      onDelete={() => deleteGMNote(note.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
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

  if (isEditing) {
    return (
      <Card className="bg-black border-[#00ff41]/50">
        <CardHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-black border-[#00ff41]/50 text-[#00ff41] text-lg font-semibold"
          />
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
              onClick={() => onSave({ title, content })}
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
            <CardTitle className="text-[#00ff41]">{note.title}</CardTitle>
            <CardDescription className="text-[#00ff41]/70 text-xs mt-1">
              {new Date(note.updatedAt).toLocaleString()}
              {showCreator && (
                <Badge className="ml-2 bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]/50">
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
  isGMMode: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Handout>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

const HandoutCard: React.FC<HandoutCardProps> = ({
  handout,
  isGMMode,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleVisibility,
}) => {
  const [title, setTitle] = useState(handout.title);
  const [content, setContent] = useState(handout.content);

  if (isEditing && isGMMode) {
    return (
      <Card className="bg-black border-[#00ff41]/50">
        <CardHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-black border-[#00ff41]/50 text-[#00ff41] text-lg font-semibold"
          />
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
              onClick={() => onSave({ title, content })}
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
            <CardTitle className="text-[#00ff41] flex items-center gap-2">
              {handout.title}
              {isGMMode && (
                <Badge
                  className={
                    handout.isVisible
                      ? 'bg-green-500/20 text-green-500 border-green-500/50'
                      : 'bg-red-500/20 text-red-500 border-red-500/50'
                  }
                >
                  {handout.isVisible ? 'Visible' : 'Hidden'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-[#00ff41]/70 text-xs mt-1">
              {new Date(handout.updatedAt).toLocaleString()}
            </CardDescription>
          </div>
          {isGMMode && (
            <div className="flex gap-2">
              <Button
                onClick={onToggleVisibility}
                size="sm"
                variant="ghost"
                className="text-[#00ff41] hover:bg-[#00ff41]/20"
                title={handout.isVisible ? 'Hide from players' : 'Show to players'}
              >
                {handout.isVisible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
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
          )}
        </div>
      </CardHeader>
      <Separator className="bg-[#00ff41]/30" />
      <CardContent className="pt-4">
        <p className="text-[#00ff41]/90 whitespace-pre-wrap">{handout.content}</p>
      </CardContent>
    </Card>
  );
};

interface GMNoteCardProps {
  note: GMNote;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<GMNote>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const GMNoteCard: React.FC<GMNoteCardProps> = ({
  note,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  if (isEditing) {
    return (
      <Card className="bg-black border-yellow-500/50">
        <CardHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-black border-yellow-500/50 text-[#00ff41] text-lg font-semibold"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="bg-black border-yellow-500/50 text-[#00ff41] resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => onSave({ title, content })}
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
    <Card className="bg-black border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-[#00ff41] flex items-center gap-2">
              {note.title}
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                GM Only
              </Badge>
            </CardTitle>
            <CardDescription className="text-[#00ff41]/70 text-xs mt-1">
              {new Date(note.updatedAt).toLocaleString()}
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
      <Separator className="bg-yellow-500/30" />
      <CardContent className="pt-4">
        <p className="text-[#00ff41]/90 whitespace-pre-wrap">{note.content}</p>
      </CardContent>
    </Card>
  );
};
