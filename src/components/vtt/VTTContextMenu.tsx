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
  Clipboard,
  ClipboardPaste,
  ShieldAlert,
  ShieldCheck,
  RotateCw,
  RotateCcw,
  ArrowUpToLine,
  ArrowDownToLine,
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

  const hasClipboard = !!state.clipboard;

  // Check if any selected item is currently visible/non-gmOnly
  const selectionVisibleToPlayers = activeMap ? (
    (state.selectedTokenIds || []).some((id) => activeMap.tokens.find((t) => t.id === id)?.visible) ||
    (state.selectedStrokeIds || []).some((id) => !activeMap.strokes.find((s) => s.id === id)?.gmOnly) ||
    (state.selectedTextIds || []).some((id) => !activeMap.texts.find((t) => t.id === id)?.gmOnly) ||
    (state.selectedNoteIds || []).some((id) => activeMap.notes.find((n) => n.id === id)?.visible)
  ) : false;

  const toggleGmOnlySelection = () => {
    if (!activeMap) return;
    const shouldHide = selectionVisibleToPlayers;
    for (const tokenId of state.selectedTokenIds || []) {
      dispatch({
        type: "UPDATE_TOKEN",
        payload: { mapId, tokenId, updates: { visible: !shouldHide } },
      });
    }
    for (const strokeId of state.selectedStrokeIds || []) {
      dispatch({
        type: "UPDATE_STROKE",
        payload: { mapId, strokeId, updates: { gmOnly: shouldHide } },
      });
    }
    for (const textId of state.selectedTextIds || []) {
      dispatch({
        type: "UPDATE_TEXT",
        payload: { mapId, textId, updates: { gmOnly: shouldHide } },
      });
    }
    for (const noteId of state.selectedNoteIds || []) {
      dispatch({
        type: "UPDATE_NOTE",
        payload: { mapId, noteId, updates: { visible: !shouldHide } },
      });
    }
  };

  const MenuItem = ({
    icon: Icon,
    label,
    onClick,
    danger,
    shortcut,
  }: {
    icon?: any;
    label: string;
    onClick: () => void;
    danger?: boolean;
    shortcut?: string;
  }) => (
    <button
      onClick={() => {
        onClick();
        onClose();
      }}
      className={`vtt-context-menu-item ${danger ? "danger" : ""}`}
    >
      {Icon && <Icon size={12} />}
      <span className="flex-1">{label}</span>
      {shortcut && <span className="vtt-kbd ml-2">{shortcut}</span>}
    </button>
  );

  const Separator = () => <div className="vtt-context-menu-separator" />;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        className="fixed z-50 vtt-context-menu py-1"
        style={{
          left: Math.min(x, window.innerWidth - 200),
          top: Math.min(y, window.innerHeight - 400),
        }}
      >
        {token && (
          <>
            <div className="px-3 py-1 vtt-section-label" style={{ marginBottom: 0 }}>
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
                  payload: { mapId, tokenId: token.id, updates: { visible: !token.visible } },
                })
              }
            />
            <MenuItem
              icon={token.locked ? Unlock : Lock}
              label={token.locked ? "Unlock" : "Lock Position"}
              onClick={() =>
                dispatch({
                  type: "UPDATE_TOKEN",
                  payload: { mapId, tokenId: token.id, updates: { locked: !token.locked } },
                })
              }
            />
            <Separator />
            <MenuItem
              icon={RotateCw}
              label="Rotate 45° CW"
              onClick={() =>
                dispatch({
                  type: "UPDATE_TOKEN",
                  payload: { mapId, tokenId: token.id, updates: { rotation: (token.rotation + 45) % 360 } },
                })
              }
            />
            <MenuItem
              icon={RotateCcw}
              label="Rotate 45° CCW"
              onClick={() =>
                dispatch({
                  type: "UPDATE_TOKEN",
                  payload: { mapId, tokenId: token.id, updates: { rotation: (token.rotation - 45 + 360) % 360 } },
                })
              }
            />
            <Separator />
            <MenuItem
              icon={ArrowUpToLine}
              label="Bring to Front"
              onClick={() =>
                dispatch({
                  type: "REORDER_TOKEN",
                  payload: { mapId, tokenId: token.id, direction: "front" },
                })
              }
            />
            <MenuItem
              icon={ArrowDownToLine}
              label="Send to Back"
              onClick={() =>
                dispatch({
                  type: "REORDER_TOKEN",
                  payload: { mapId, tokenId: token.id, direction: "back" },
                })
              }
            />
            <Separator />
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
            <div className="px-3 py-1 vtt-section-label" style={{ marginBottom: 0 }}>
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
                  payload: { mapId, noteId: note.id, updates: { visible: !note.visible } },
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

        {/* Selection actions */}
        {hasSelection && (
          <>
            <div className="px-3 py-1 vtt-section-label" style={{ marginBottom: 0 }}>
              Selection ({(state.selectedTokenIds?.length || 0) + (state.selectedStrokeIds?.length || 0) + (state.selectedTextIds?.length || 0) + (state.selectedNoteIds?.length || 0)} items)
            </div>
            <MenuItem
              icon={selectionVisibleToPlayers ? ShieldAlert : ShieldCheck}
              label={selectionVisibleToPlayers ? "Hide from Players" : "Show to Players"}
              onClick={toggleGmOnlySelection}
            />
            <MenuItem
              icon={Clipboard}
              label="Copy"
              onClick={() => dispatch({ type: "COPY_SELECTION" })}
              shortcut="Ctrl+C"
            />
            <MenuItem
              icon={Trash2}
              label="Delete Selection"
              onClick={() => {
                if (!activeMap) return;
                for (const tokenId of state.selectedTokenIds || []) {
                  dispatch({ type: "REMOVE_TOKEN", payload: { mapId, tokenId } });
                }
                for (const strokeId of state.selectedStrokeIds || []) {
                  dispatch({ type: "REMOVE_STROKE", payload: { mapId, strokeId } });
                }
                for (const textId of state.selectedTextIds || []) {
                  dispatch({ type: "REMOVE_TEXT", payload: { mapId, textId } });
                }
                for (const noteId of state.selectedNoteIds || []) {
                  dispatch({ type: "REMOVE_NOTE", payload: { mapId, noteId } });
                }
                dispatch({ type: "CLEAR_SELECTION" });
              }}
              danger
            />
            <Separator />
          </>
        )}

        {/* Clipboard paste */}
        {hasClipboard && (
          <MenuItem
            icon={ClipboardPaste}
            label="Paste"
            onClick={() => dispatch({ type: "PASTE_CLIPBOARD", payload: { mapId } })}
            shortcut="Ctrl+V"
          />
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
