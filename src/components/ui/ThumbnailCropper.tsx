import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';

interface ThumbnailCropperProps {
  /** Whether the cropper dialog is open */
  open: boolean;
  /** Callback when the dialog is closed */
  onOpenChange: (open: boolean) => void;
  /** The image file to crop */
  imageFile: File | null;
  /** Callback with the cropped image data URL */
  onCropComplete: (croppedDataUrl: string) => void;
  /** Output size in pixels (default: 300) */
  outputSize?: number;
  /** Crop shape - 'square' or 'circle' (default: 'square') */
  cropShape?: 'square' | 'circle';
  /** Dialog title */
  title?: string;
}

export const ThumbnailCropper: React.FC<ThumbnailCropperProps> = ({
  open,
  onOpenChange,
  imageFile,
  onCropComplete,
  outputSize = 300,
  cropShape = 'square',
  title = 'Crop Image',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 300, height: 300 });

  // Crop area size (fixed square in the center)
  const cropSize = Math.min(containerSize.width, containerSize.height) * 0.8;

  // Load image when file changes
  useEffect(() => {
    if (!imageFile) {
      setImageSrc(null);
      setImageElement(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        // Reset zoom and position
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      img.src = src;
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [open]);

  // Draw the preview
  useEffect(() => {
    if (!canvasRef.current || !imageElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to container size
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate image dimensions with zoom
    const imgAspect = imageElement.width / imageElement.height;
    let drawWidth, drawHeight;

    if (imgAspect > 1) {
      // Landscape - fit to height first
      drawHeight = cropSize * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      // Portrait - fit to width first
      drawWidth = cropSize * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    // Center point
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw image centered with offset
    const drawX = centerX - drawWidth / 2 + position.x;
    const drawY = centerY - drawHeight / 2 + position.y;

    ctx.drawImage(imageElement, drawX, drawY, drawWidth, drawHeight);

    // Draw crop overlay (darken outside)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';

    const cropX = (canvas.width - cropSize) / 2;
    const cropY = (canvas.height - cropSize) / 2;

    // Draw four rectangles around the crop area
    // Top
    ctx.fillRect(0, 0, canvas.width, cropY);
    // Bottom
    ctx.fillRect(0, cropY + cropSize, canvas.width, canvas.height - cropY - cropSize);
    // Left
    ctx.fillRect(0, cropY, cropX, cropSize);
    // Right
    ctx.fillRect(cropX + cropSize, cropY, canvas.width - cropX - cropSize, cropSize);

    // Draw crop border
    ctx.strokeStyle = 'var(--primary)';
    ctx.lineWidth = 2;

    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(centerX, centerY, cropSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Add circular mask overlay
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(centerX, centerY, cropSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Redraw the darker corners for circle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.rect(cropX, cropY, cropSize, cropSize);
      ctx.arc(centerX, centerY, cropSize / 2, 0, Math.PI * 2, true);
      ctx.fill();
    } else {
      ctx.strokeRect(cropX, cropY, cropSize, cropSize);
    }

    // Draw grid lines for positioning help
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
    ctx.lineWidth = 1;

    // Vertical thirds
    ctx.beginPath();
    ctx.moveTo(cropX + cropSize / 3, cropY);
    ctx.lineTo(cropX + cropSize / 3, cropY + cropSize);
    ctx.moveTo(cropX + (cropSize * 2) / 3, cropY);
    ctx.lineTo(cropX + (cropSize * 2) / 3, cropY + cropSize);
    // Horizontal thirds
    ctx.moveTo(cropX, cropY + cropSize / 3);
    ctx.lineTo(cropX + cropSize, cropY + cropSize / 3);
    ctx.moveTo(cropX, cropY + (cropSize * 2) / 3);
    ctx.lineTo(cropX + cropSize, cropY + (cropSize * 2) / 3);
    ctx.stroke();

  }, [imageElement, zoom, position, containerSize, cropSize, cropShape]);

  // Mouse handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handlers
  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0]);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Crop and save
  const handleCrop = useCallback(() => {
    if (!imageElement) return;

    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    // Calculate source coordinates
    const imgAspect = imageElement.width / imageElement.height;
    let scaledWidth, scaledHeight;

    if (imgAspect > 1) {
      scaledHeight = cropSize * zoom;
      scaledWidth = scaledHeight * imgAspect;
    } else {
      scaledWidth = cropSize * zoom;
      scaledHeight = scaledWidth / imgAspect;
    }

    // Center of the visible area
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;

    // Where the image is drawn
    const imgDrawX = centerX - scaledWidth / 2 + position.x;
    const imgDrawY = centerY - scaledHeight / 2 + position.y;

    // Crop area in canvas coordinates
    const cropX = (containerSize.width - cropSize) / 2;
    const cropY = (containerSize.height - cropSize) / 2;

    // Source coordinates in the original image
    const srcX = ((cropX - imgDrawX) / scaledWidth) * imageElement.width;
    const srcY = ((cropY - imgDrawY) / scaledHeight) * imageElement.height;
    const srcWidth = (cropSize / scaledWidth) * imageElement.width;
    const srcHeight = (cropSize / scaledHeight) * imageElement.height;

    // Apply circle mask if needed
    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Draw cropped image
    ctx.drawImage(
      imageElement,
      srcX, srcY, srcWidth, srcHeight,
      0, 0, outputSize, outputSize
    );

    // Get data URL
    const dataUrl = outputCanvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(dataUrl);
    onOpenChange(false);
  }, [imageElement, zoom, position, containerSize, cropSize, outputSize, cropShape, onCropComplete, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-terminal-bg-dark border-terminal-primary/50 p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-terminal-primary">{title}</DialogTitle>
        </DialogHeader>

        <div className="px-4">
          {/* Preview Area */}
          <div
            ref={containerRef}
            className="relative w-full aspect-square bg-terminal-bg-dark rounded border border-terminal-primary/30 overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />
            {!imageElement && (
              <div className="absolute inset-0 flex items-center justify-center text-terminal-primary/50">
                Loading...
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleZoomOut}
                size="sm"
                variant="outline"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 h-8 w-8 p-0"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <Slider
                  value={[zoom]}
                  onValueChange={handleZoomChange}
                  min={0.5}
                  max={3}
                  step={0.01}
                  className="[&_[data-state]]:bg-terminal-primary [&_.bg-primary]:bg-terminal-primary [&_.border-primary]:border-terminal-primary"
                />
              </div>

              <Button
                onClick={handleZoomIn}
                size="sm"
                variant="outline"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 h-8 w-8 p-0"
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleReset}
                size="sm"
                variant="outline"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 h-8 px-2"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            <p className="text-xs text-terminal-primary/60 text-center">
              Drag to pan, scroll to zoom. Position the image within the frame.
            </p>
          </div>
        </div>

        <DialogFooter className="p-4 pt-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleCrop}
            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
            disabled={!imageElement}
          >
            <Check className="h-4 w-4 mr-2" />
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ThumbnailCropper;
