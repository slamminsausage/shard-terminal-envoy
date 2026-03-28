import { useRef } from "react";
import { Upload, Trash2, ImageIcon, X } from "lucide-react";
import type { AssetLibraryItem } from "@/lib/bridge/bridgeTypes";

interface AssetLibraryProps {
  library: AssetLibraryItem[];
  uploading: boolean;
  pendingAsset: AssetLibraryItem | null;
  onUpload: (file: File) => void;
  onSelect: (item: AssetLibraryItem) => void;
  onDeleteLibraryItem: (storagePath: string) => void;
  onClose: () => void;
}

const ACCEPTED = "image/jpeg,image/png,image/gif,image/webp";

export function AssetLibrary({
  library,
  uploading,
  pendingAsset,
  onUpload,
  onSelect,
  onDeleteLibraryItem,
  onClose,
}: AssetLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    onUpload(file);
  };

  return (
    <div className="flex flex-col bg-terminal-bg-panel-alt border border-terminal-bg-border rounded overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-terminal-bg-border bg-terminal-primary-light/5">
        <span className="font-['Orbitron'] text-xs tracking-[3px] text-terminal-text-dimmer">
          ASSET LIBRARY
        </span>
        <div className="flex items-center gap-2">
          {pendingAsset && (
            <span className="text-[0.6rem] text-terminal-secondary animate-pulse font-mono">
              ARMED: {pendingAsset.name.slice(0, 18)}
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-terminal-primary/10 rounded transition-colors"
            title="Close asset library"
          >
            <X className="h-3.5 w-3.5 text-terminal-text-dimmer" />
          </button>
        </div>
      </div>

      {/* Upload drop zone */}
      <div
        className="mx-3 my-2 border border-dashed border-terminal-bg-border rounded flex items-center justify-center gap-2 py-2 cursor-pointer hover:border-terminal-primary/40 hover:bg-terminal-primary/5 transition-colors text-xs text-terminal-text-dimmer"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {uploading ? (
          <span className="font-mono text-terminal-secondary animate-pulse">UPLOADING...</span>
        ) : (
          <>
            <Upload className="h-3.5 w-3.5" />
            <span className="font-mono">Drop image or click to upload</span>
            <span className="text-[0.55rem] text-terminal-text-dimmer/60">JPG · PNG · GIF</span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Asset grid */}
      {library.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-terminal-text-dimmer/50 gap-2">
          <ImageIcon className="h-8 w-8 opacity-30" />
          <span className="text-[0.65rem] font-mono">No assets uploaded yet</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 p-3 overflow-y-auto max-h-[260px]">
          {library.map(item => {
            const isArmed = pendingAsset?.storagePath === item.storagePath;
            return (
              <div
                key={item.storagePath}
                className={`relative group rounded overflow-hidden border cursor-pointer transition-all ${
                  isArmed
                    ? "border-terminal-secondary shadow-[0_0_8px_var(--secondary)]"
                    : "border-terminal-bg-border hover:border-terminal-primary/40"
                }`}
                onClick={() => onSelect(item)}
                title={isArmed ? `Armed: click map to place` : `Click to arm: ${item.name}`}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-16 object-cover"
                  loading="lazy"
                />
                {/* Armed indicator */}
                {isArmed && (
                  <div className="absolute inset-0 border-2 border-terminal-secondary animate-pulse pointer-events-none rounded" />
                )}
                {/* Name overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5">
                  <span className="text-[0.55rem] font-mono text-terminal-text-dimmer block truncate">
                    {item.name}
                  </span>
                </div>
                {/* Delete button */}
                <button
                  className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:text-terminal-danger-alt text-terminal-text-dimmer z-10"
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteLibraryItem(item.storagePath);
                  }}
                  title="Delete from library"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {pendingAsset && (
        <div className="px-3 pb-2 text-[0.6rem] font-mono text-terminal-secondary/80 text-center">
          Click on the tactical map to place · Click again to cancel
        </div>
      )}
    </div>
  );
}
