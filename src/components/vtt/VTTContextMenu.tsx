import type { Point } from "@/types/vtt";
import { useVTT } from "@/contexts/VTTContext";
import type { Token, MapNote } from "@/types/vtt";
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  StickyNote,
  Copy,
} from "lucide-react";

interface VTTContextMenuProps {
  x: number;
  y: number;
  worldPos: Point;
  token: Token | null;
  note: MapNote | null;
  mapId: string;
  onClose: () => void;
  onEditToken: (token: Token) => void;
  onEditNote: (note: MapNote | null, worldPos: Point) => void;
}

export default function VTTContextMenu({
  x,
  y,
  worldPos,
  token,
  note,
  mapId,
  onClose,
  onEditToken,
  onEditNote,
}: VTTContextMenuProps) {
  const { dispatch } = useVTT();

  const MenuItem = ({
    icon: Icon,
    label,
    onClick,
    danger,
  }: {
    icon?: any;
    label: string;
    onClick: () => void;
    danger?: boolean;
  }) => (
    <button
      onClick={() => {
        onClick();
        onClose();
      }}
      className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
        danger
          ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
          : "text-terminal-primary/70 hover:text-terminal-primary hover:bg-terminal-primary/10"
      }`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );

  const Separator = () => <div className="border-t border-terminal-border/20 my-0.5" />;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        className="fixed z-50 bg-terminal-bg-dark border border-terminal-border/40 rounded shadow-xl py-1 min-w-[160px]"
        style={{
          left: Math.min(x, window.innerWidth - 180),
          top: Math.min(y, window.innerHeight - 300),
        }}
      >
        {token && (
          <>
            <div className="px-3 py-1 text-[10px] text-terminal-primary/40 font-mono uppercase tracking-wider">
              Token: {token.name}
            </div>
            <MenuItem
              icon={Pencil}
              label="Edit Token"
              onClick={() => onEditToken(token)}
            />
            <MenuItem
              icon={token.visible ? EyeOff : Eye}
              label={token.visible ? "Hide Token" : "Show Token"}
              onClick={() =>
                dispatch({
                  type: "UPDATE_TOKEN",
                  payload: {
                    mapId,
                    tokenId: token.id,
                    updates: { visible: !token.visible },
                  },
                })
              }
            />
            <MenuItem
              icon={token.locked ? Unlock : Lock}
              label={token.locked ? "Unlock" : "Lock Position"}
              onClick={() =>
                dispatch({
                  type: "UPDATE_TOKEN",
                  payload: {
                    mapId,
                    tokenId: token.id,
                    updates: { locked: !token.locked },
                  },
                })
              }
            />
            <MenuItem
              icon={Copy}
              label="Duplicate"
              onClick={() =>
                dispatch({
                  type: "ADD_TOKEN",
                  payload: {
                    mapId,
                    token: {
                      ...token,
                      id: crypto.randomUUID(),
                      name: `${token.name} (copy)`,
                      x: token.x + 50,
                      y: token.y + 50,
                    },
                  },
                })
              }
            />
            <MenuItem
              icon={Trash2}
              label="Delete Token"
              onClick={() =>
                dispatch({
                  type: "REMOVE_TOKEN",
                  payload: { mapId, tokenId: token.id },
                })
              }
              danger
            />
            <Separator />
          </>
        )}

        {note && (
          <>
            <div className="px-3 py-1 text-[10px] text-terminal-primary/40 font-mono uppercase tracking-wider">
              Note: {note.title}
            </div>
            <MenuItem
              icon={Pencil}
              label="Edit Note"
              onClick={() => onEditNote(note, worldPos)}
            />
            <MenuItem
              icon={Trash2}
              label="Delete Note"
              onClick={() =>
                dispatch({
                  type: "REMOVE_NOTE",
                  payload: { mapId, noteId: note.id },
                })
              }
              danger
            />
            <Separator />
          </>
        )}

        {/* General actions */}
        <MenuItem
          icon={StickyNote}
          label="Add Note Here"
          onClick={() => onEditNote(null, worldPos)}
        />
      </div>
    </>
  );
}
