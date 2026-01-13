import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  mediaUrl: string;
  type: 'image' | 'video';
}

export const MediaDialog: React.FC<MediaDialogProps> = ({
  open,
  onOpenChange,
  title,
  mediaUrl,
  type,
}) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setZoom(1); // Reset zoom when closing
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] bg-black border-[#00ff41]/50 p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#00ff41]">{title}</DialogTitle>
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
            {type === 'image' ? (
              <img
                src={mediaUrl}
                alt={title}
                className="max-w-full max-h-[calc(95vh-120px)] object-contain rounded transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />
            ) : (
              <video
                src={mediaUrl}
                controls
                autoPlay
                className="max-w-full max-h-[calc(95vh-120px)] object-contain rounded transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaDialog;
