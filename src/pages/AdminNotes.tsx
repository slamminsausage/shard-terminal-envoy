import React, { useState, useRef } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, Edit2, Trash2, Save, X, Upload, Image, Video, FileText, ArrowLeft, Maximize2 } from 'lucide-react';
import { Handout } from '@/types/notes';
import { useNavigate } from 'react-router-dom';
import { compressImage, compressVideo, formatFileSize } from '@/lib/mediaCompression';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminNotes() {
  const navigate = useNavigate();
  const {
    handouts,
    addHandout,
    updateHandout,
    deleteHandout,
    toggleHandoutVisibility,
  } = useNotes();

  const [editingHandout, setEditingHandout] = useState<string | null>(null);
  const [showNewHandoutForm, setShowNewHandoutForm] = useState(false);
  const [newHandoutTitle, setNewHandoutTitle] = useState('');
  const [newHandoutDescription, setNewHandoutDescription] = useState('');
  const [newHandoutType, setNewHandoutType] = useState<'text' | 'image' | 'video'>('text');
  const [newHandoutContent, setNewHandoutContent] = useState('');
  const [newHandoutMediaUrl, setNewHandoutMediaUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Original file size: ${formatFileSize(file.size)}`);

      // Detect file type and compress accordingly
      if (file.type.startsWith('image/')) {
        setNewHandoutType('image');
        // Compress image to max 1920px and 80% quality
        compressImage(file, 1920, 1920, 0.8).then(compressed => {
          setNewHandoutMediaUrl(compressed);
          const compressedSize = compressed.length * 0.75; // Approximate base64 size
          console.log(`Image compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressedSize)}`);
        }).catch(err => {
          console.error('Error compressing image:', err);
          // Fallback to uncompressed
          const reader = new FileReader();
          reader.onloadend = () => setNewHandoutMediaUrl(reader.result as string);
          reader.readAsDataURL(file);
        });
      } else if (file.type.startsWith('video/')) {
        setNewHandoutType('video');
        const originalSize = formatFileSize(file.size);
        console.log(`Loading video file: ${file.name} (${originalSize})`);

        compressVideo(file).then(dataUrl => {
          setNewHandoutMediaUrl(dataUrl);
        }).catch(error => {
          console.error('Error processing video:', error);
          alert('Failed to process video file. Please try a smaller file.');
        });
      }
    }
  };

  const handleAddHandout = async () => {
    if (newHandoutTitle.trim() && (newHandoutDescription.trim() || newHandoutContent.trim() || newHandoutMediaUrl)) {
      await addHandout({
        title: newHandoutTitle,
        description: newHandoutDescription,
        type: newHandoutType,
        content: newHandoutType === 'text' ? newHandoutContent : undefined,
        mediaUrl: newHandoutType !== 'text' ? newHandoutMediaUrl : undefined,
        isVisible: false,
        tags: [],
      });

      // Reset form
      setNewHandoutTitle('');
      setNewHandoutDescription('');
      setNewHandoutContent('');
      setNewHandoutMediaUrl('');
      setNewHandoutType('text');
      setShowNewHandoutForm(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg-dark text-terminal-primary font-mono">
      <div className="border-b border-terminal-primary/30 p-4">
        <div className="flex items-center gap-4 mb-2">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="text-terminal-primary hover:bg-terminal-primary/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-terminal-primary">GM HANDOUT MANAGER</h1>
        <p className="text-terminal-primary/70 text-sm mt-1">
          Create and manage handouts for your players. Control when they become visible.
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)] p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">All Handouts ({handouts.length})</h2>
            <Button
              onClick={() => setShowNewHandoutForm(!showNewHandoutForm)}
              variant="outline"
              size="sm"
              className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
            >
              <Upload className="h-4 w-4 mr-2" />
              Create Handout
            </Button>
          </div>

          {showNewHandoutForm && (
            <Card className="bg-terminal-bg-dark border-terminal-primary/50">
              <CardHeader>
                <CardTitle className="text-terminal-primary">Create New Handout</CardTitle>
                <CardDescription className="text-terminal-primary/70">
                  Handouts are hidden from players by default. Reveal them when ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-terminal-primary/70 mb-2 block">Handout Type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setNewHandoutType('text')}
                      variant={newHandoutType === 'text' ? 'default' : 'outline'}
                      className={newHandoutType === 'text'
                        ? 'bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50'
                        : 'border-terminal-primary/30 text-terminal-primary/70 hover:bg-terminal-primary/10'}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Text
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setNewHandoutType('image')}
                      variant={newHandoutType === 'image' ? 'default' : 'outline'}
                      className={newHandoutType === 'image'
                        ? 'bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50'
                        : 'border-terminal-primary/30 text-terminal-primary/70 hover:bg-terminal-primary/10'}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Image
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setNewHandoutType('video')}
                      variant={newHandoutType === 'video' ? 'default' : 'outline'}
                      className={newHandoutType === 'video'
                        ? 'bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50'
                        : 'border-terminal-primary/30 text-terminal-primary/70 hover:bg-terminal-primary/10'}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                  </div>
                </div>

                <Input
                  placeholder="Handout Title"
                  value={newHandoutTitle}
                  onChange={(e) => setNewHandoutTitle(e.target.value)}
                  className="bg-terminal-bg-dark border-terminal-primary/50 text-terminal-primary"
                />

                <Textarea
                  placeholder="Description (visible to players)"
                  value={newHandoutDescription}
                  onChange={(e) => setNewHandoutDescription(e.target.value)}
                  rows={2}
                  className="bg-terminal-bg-dark border-terminal-primary/50 text-terminal-primary resize-none"
                />

                {newHandoutType === 'text' ? (
                  <Textarea
                    placeholder="Handout Content"
                    value={newHandoutContent}
                    onChange={(e) => setNewHandoutContent(e.target.value)}
                    rows={8}
                    className="bg-terminal-bg-dark border-terminal-primary/50 text-terminal-primary resize-none"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={newHandoutType === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {newHandoutType === 'image' ? 'Image' : 'Video'}
                    </Button>
                    {newHandoutMediaUrl && (
                      <div className="border border-terminal-primary/30 p-2 rounded">
                        {newHandoutType === 'image' ? (
                          <img
                            src={newHandoutMediaUrl}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded"
                          />
                        ) : (
                          <video
                            src={newHandoutMediaUrl}
                            controls
                            className="max-h-64 mx-auto rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddHandout}
                    className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Handout
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNewHandoutForm(false);
                      setNewHandoutTitle('');
                      setNewHandoutDescription('');
                      setNewHandoutContent('');
                      setNewHandoutMediaUrl('');
                      setNewHandoutType('text');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
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

          {handouts.length === 0 ? (
            <Card className="bg-terminal-bg-dark border-terminal-primary/30">
              <CardContent className="p-8 text-center text-terminal-primary/70">
                No handouts yet. Create your first handout to share with players.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {handouts.map((handout) => (
                <HandoutAdminCard
                  key={handout.id}
                  handout={handout}
                  isEditing={editingHandout === handout.id}
                  onEdit={() => setEditingHandout(handout.id)}
                  onSave={(updates) => {
                    updateHandout(handout.id, updates);
                    setEditingHandout(null);
                  }}
                  onCancel={() => setEditingHandout(null)}
                  onDelete={async () => await deleteHandout(handout.id)}
                  onToggleVisibility={() => toggleHandoutVisibility(handout.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface HandoutAdminCardProps {
  handout: Handout;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Handout>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

const HandoutAdminCard: React.FC<HandoutAdminCardProps> = ({
  handout,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleVisibility,
}) => {
  const [title, setTitle] = useState(handout.title);
  const [description, setDescription] = useState(handout.description);
  const [content, setContent] = useState(handout.content || '');
  const [showFullSize, setShowFullSize] = useState(false);

  if (isEditing && handout.type === 'text') {
    return (
      <Card className="bg-terminal-bg-dark border-terminal-primary/50">
        <CardHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-terminal-bg-dark border-terminal-primary/50 text-terminal-primary font-semibold mb-2"
            placeholder="Title"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-terminal-bg-dark border-terminal-primary/50 text-terminal-primary text-sm resize-none"
            rows={2}
            placeholder="Description"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="bg-terminal-bg-dark border-terminal-primary/50 text-terminal-primary resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => onSave({ title, description, content })}
              size="sm"
              className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
              className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-terminal-bg-dark border-terminal-primary/30 hover:border-terminal-primary/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {handout.type === 'image' && <Image className="h-4 w-4 text-terminal-primary/70" />}
              {handout.type === 'video' && <Video className="h-4 w-4 text-terminal-primary/70" />}
              {handout.type === 'text' && <FileText className="h-4 w-4 text-terminal-primary/70" />}
              <CardTitle className="text-terminal-primary text-base truncate">{handout.title}</CardTitle>
            </div>
            <Badge
              className={
                handout.isVisible
                  ? 'bg-green-500/20 text-green-500 border-green-500/50'
                  : 'bg-red-500/20 text-red-500 border-red-500/50'
              }
            >
              {handout.isVisible ? 'Visible to Players' : 'Hidden'}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              onClick={onToggleVisibility}
              size="sm"
              variant="ghost"
              className="text-terminal-primary hover:bg-terminal-primary/20 h-8 w-8 p-0"
              title={handout.isVisible ? 'Hide from players' : 'Show to players'}
            >
              {handout.isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            {handout.type === 'text' && (
              <Button
                onClick={onEdit}
                size="sm"
                variant="ghost"
                className="text-terminal-primary hover:bg-terminal-primary/20 h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={onDelete}
              size="sm"
              variant="ghost"
              className="text-red-500 hover:bg-red-500/20 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-terminal-primary/70 text-xs">
          {handout.description}
        </CardDescription>
      </CardHeader>
      <Separator className="bg-terminal-primary/30" />
      <CardContent className="pt-4">
        {handout.type === 'text' && (
          <p className="text-terminal-primary/90 text-sm line-clamp-3 whitespace-pre-wrap">
            {handout.content}
          </p>
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
                className="w-full max-w-[288px] max-h-[192px] object-cover rounded border border-terminal-primary/30 mx-auto"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <Maximize2 className="h-8 w-8 text-terminal-primary" />
              </div>
            </div>
            <Dialog open={showFullSize} onOpenChange={setShowFullSize}>
              <DialogContent className="max-w-[90vw] max-h-[90vh] bg-terminal-bg-dark border-terminal-primary/50">
                <DialogHeader>
                  <DialogTitle className="text-terminal-primary">{handout.title}</DialogTitle>
                </DialogHeader>
                <div className="overflow-auto max-h-[75vh]">
                  <img
                    src={handout.mediaUrl}
                    alt={handout.title}
                    className="w-full h-auto rounded"
                  />
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
                className="w-full max-w-[288px] max-h-[192px] object-cover rounded border border-terminal-primary/30 mx-auto"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <Maximize2 className="h-8 w-8 text-terminal-primary" />
              </div>
            </div>
            <Dialog open={showFullSize} onOpenChange={setShowFullSize}>
              <DialogContent className="max-w-[90vw] max-h-[90vh] bg-terminal-bg-dark border-terminal-primary/50">
                <DialogHeader>
                  <DialogTitle className="text-terminal-primary">{handout.title}</DialogTitle>
                </DialogHeader>
                <div className="overflow-auto max-h-[75vh]">
                  <video
                    src={handout.mediaUrl}
                    controls
                    className="w-full h-auto rounded"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};
