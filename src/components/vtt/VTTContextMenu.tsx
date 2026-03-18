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
  ShieldAlert,
  ShieldCheck,
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
  const { dispatch, state, activeMap } = useVTT();

  const hasSelection =
    (state.selectedTokenIds?.length || 0) > 0 ||
    (state.selectedStrokeIds?.length || 0) > 0 ||
    (state.selectedTextIds?.length || 0) > 0 ||
    (state.selectedNoteIds?.length || 0) > 0;

  // Check if any selected item is currently visible/non-gmOnly
  const selectionVisibleToPlayers = activeMap ? (
    (state.selectedTokenIds || []).some((id) => activeMap.tokens.find((t) => t.id === id)?.visible) ||
    (state.selectedStrokeIds || []).some((id) => !activeMap.strokes.find((s) => s.id === id)?.gmOnly) ||
    (state.selectedTextIds || []).some((id) => !activeMap.texts.find((t) => t.id === id)?.gmOnly) ||
    (state.selectedNoteIds || []).some((id) => activeMap.notes.find((n) => n.id === id)?.visible)
  ) : false;

  const toggleGmOnlySelection = () => {
    if (!activeMap) return;
    // Toggle gmOnly for all selected items
    for (const tokenId of state.selectedTokenIds || []) {
      const t = activeMap.tokens.find((tk) => tk.id === tokenId);
      if (t) {
        dispatch({
          type: "UPDATE_TOKEN",
          payload: { mapId, tokenId, updates: { visible: !t.visible } },
        });
      }
    }
    for (const strokeId of state.selectedStrokeIds || []) {
      const s = activeMap.strokes.find((sk) => sk.id === strokeId);
      if (s) {
        dispatch({
          type: "UPDATE_STROKE",
          payload: { mapId, strokeId, updates: { gmOnly: !s.gmOnly } },
        });
      }
    }
    for (const textId of state.selectedTextIds || []) {
      const t = activeMap.texts.find((tk) => tk.id === textId);
      if (t) {
        dispatch({
          type: "UPDATE_TEXT",
          payload: { mapId, textId, updates: { gmOnly: !t.gmOnly } },
        });
      }
    }
    for (const noteId of state.selectedNoteIds || []) {
      const n = activeMap.notes.find((nk) => nk.id === noteId);
      if (n) {
        dispatch({
          type: "UPDATE_NOTE",
          payload: { mapId, noteId, updates: { visible: !n.visible } },
        });
      }
    }
  };

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
              label={token.visible ? "Hide from Players" : "Show to Players"}
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
              icon={note.visible ? EyeOff : Eye}
              label={note.visible ? "Hide from Players" : "Show to Players"}
              onClick={() =>
                dispatch({
                  type: "UPDATE_NOTE",
                  payload: {
                    mapId,
                    noteId: note.id,
                    updates: { visible: !note.visible },
                  },
                })
              }
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

        {/* GM Layer toggle for selection */}
        {hasSelection && (
          <>
            <div className="px-3 py-1 text-[10px] text-terminal-primary/40 font-mono uppercase tracking-wider">
              Selection ({(state.selectedTokenIds?.length || 0) + (state.selectedStrokeIds?.length || 0) + (state.selectedTextIds?.length || 0) + (state.selectedNoteIds?.length || 0)} items)
            </div>
            <MenuItem
              icon={selectionVisibleToPlayers ? ShieldAlert : ShieldCheck}
              label={selectionVisibleToPlayers ? "Hide from Players" : "Show to Players"}
              onClick={toggleGmOnlySelection}
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
