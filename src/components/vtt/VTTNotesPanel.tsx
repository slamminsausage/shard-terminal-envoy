import { useState } from "react";
import { FileText, BookOpen, Scroll, Target, ChevronDown, ChevronRight, Monitor, Plus, Save, X, Edit2, Trash2, Crop, Upload } from "lucide-react";
import { useNotes } from "@/contexts/NotesContext";
import { useSession } from "@/contexts/SessionContext";
import { useQuest } from "@/contexts/QuestContext";
import { ThumbnailCropper } from "@/components/ui/ThumbnailCropper";
import type { NoteFolder } from "@/types/notes";

const CHANNEL_NAME = "shard-vtt-presenter";

const FOLDERS: { value: NoteFolder; label: string; emoji: string }[] = [
  { value: "general", label: "General", emoji: "📝" },
  { value: "planets", label: "Planets", emoji: "🌍" },
  { value: "locations", label: "Locations", emoji: "📍" },
  { value: "npcs", label: "NPCs", emoji: "👤" },
  { value: "quests", label: "Quests", emoji: "⚔️" },
  { value: "items", label: "Items", emoji: "🎒" },
  { value: "other", label: "Other", emoji: "📦" },
];

function getFolderInfo(folder?: string) {
  return FOLDERS.find((f) => f.value === folder) || FOLDERS[0];
}

type Tab = "notes" | "sessions" | "handouts" | "quests";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "notes", label: "Notes", icon: <FileText size={10} /> },
  { id: "sessions", label: "Sessions", icon: <BookOpen size={10} /> },
  { id: "handouts", label: "Handouts", icon: <Scroll size={10} /> },
  { id: "quests", label: "Quests", icon: <Target size={10} /> },
];

export default function VTTNotesPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("notes");

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-terminal-border/20">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`vtt-option flex-1 rounded-none border-0 border-b-2 py-1.5 text-[9px] ${
              activeTab === tab.id
                ? "vtt-option--active border-b-green-400"
                : "border-b-transparent"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === "notes" && <NotesTab />}
        {activeTab === "sessions" && <SessionsTab />}
        {activeTab === "handouts" && <HandoutsTab />}
        {activeTab === "quests" && <QuestsTab />}
      </div>
    </div>
  );
}

// ─── Notes Tab ──────────────────────────────────────────────────────────────

function NotesTab() {
  const { playerNotes, addPlayerNote, updatePlayerNote, deletePlayerNote } = useNotes();

  const [selectedFolder, setSelectedFolder] = useState<NoteFolder | "all">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newFolder, setNewFolder] = useState<NoteFolder>("general");
  const [newThumbnail, setNewThumbnail] = useState("");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const filteredNotes =
    selectedFolder === "all"
      ? playerNotes
      : playerNotes.filter((n) => (n.folder || "general") === selectedFolder);

  const handleSaveNew = async () => {
    if (!newTitle.trim()) return;
    await addPlayerNote({
      title: newTitle.trim(),
      content: newContent,
      folder: newFolder,
      createdBy: "gm",
      tags: [],
      thumbnailUrl: newThumbnail || undefined,
    });
    setNewTitle("");
    setNewContent("");
    setNewFolder("general");
    setNewThumbnail("");
    setShowCreateForm(false);
  };

  const handleThumbnailFile = (file: File) => {
    setCropFile(file);
    setCropperOpen(true);
  };

  const handleCropDone = (dataUrl: string) => {
    setNewThumbnail(dataUrl);
    setCropFile(null);
  };

  return (
    <div className="space-y-2">
      {/* Folder filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setSelectedFolder("all")}
          className={`vtt-option text-[8px] py-0.5 px-1.5 ${selectedFolder === "all" ? "vtt-option--active" : ""}`}
        >
          All
        </button>
        {FOLDERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setSelectedFolder(f.value)}
            className={`vtt-option text-[8px] py-0.5 px-1.5 ${selectedFolder === f.value ? "vtt-option--active" : ""}`}
          >
            {f.emoji}
          </button>
        ))}
      </div>

      {/* New note button */}
      <button
        onClick={() => setShowCreateForm((v) => !v)}
        className="vtt-btn w-full text-[9px] py-1"
      >
        <Plus size={10} /> New Note
      </button>

      {/* Create form */}
      {showCreateForm && (
        <div className="border border-terminal-primary/30 rounded bg-black/60 p-2 space-y-2">
          <div className="text-[9px] text-terminal-primary/60 font-mono uppercase tracking-wider">New Note</div>

          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title..."
            className="vtt-input text-xs w-full"
            autoFocus
          />

          {/* Folder select */}
          <select
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value as NoteFolder)}
            className="vtt-input text-[10px] w-full"
          >
            {FOLDERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.emoji} {f.label}
              </option>
            ))}
          </select>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Content..."
            rows={5}
            className="vtt-input text-xs w-full resize-none"
          />

          {/* NPC portrait upload */}
          {newFolder === "npcs" && (
            <div className="space-y-1">
              <div className="text-[8px] text-terminal-primary/50 uppercase tracking-wider">NPC Portrait</div>
              <div className="flex items-center gap-2">
                {newThumbnail && (
                  <div className="relative group flex-shrink-0">
                    <img
                      src={newThumbnail}
                      alt=""
                      className="w-14 h-14 object-cover rounded border border-terminal-primary/30"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-0.5 rounded">
                      <button
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const f = (e.target as HTMLInputElement).files?.[0];
                            if (f) handleThumbnailFile(f);
                          };
                          input.click();
                        }}
                        className="p-0.5 border border-terminal-primary/50 rounded hover:bg-terminal-primary/20"
                        title="Change"
                      >
                        <Crop size={9} className="text-terminal-primary" />
                      </button>
                      <button
                        onClick={() => setNewThumbnail("")}
                        className="p-0.5 bg-red-500/80 border border-red-500 rounded hover:bg-red-600"
                        title="Remove"
                      >
                        <X size={9} className="text-white" />
                      </button>
                    </div>
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleThumbnailFile(f);
                      e.target.value = "";
                    }}
                  />
                  <div className="border border-terminal-primary/40 rounded p-1.5 text-center hover:bg-terminal-primary/10 transition-colors">
                    <Upload size={10} className="mx-auto mb-0.5 text-terminal-primary" />
                    <span className="text-[9px] text-terminal-primary/70">
                      {newThumbnail ? "Change" : "Upload"}
                    </span>
                  </div>
                </label>
              </div>
              <ThumbnailCropper
                open={cropperOpen}
                onOpenChange={setCropperOpen}
                imageFile={cropFile}
                onCropComplete={handleCropDone}
                outputSize={400}
                title="Crop NPC Portrait"
              />
            </div>
          )}

          <div className="flex gap-1">
            <button onClick={handleSaveNew} className="vtt-btn flex-1 text-[9px] py-1">
              <Save size={10} /> Save
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewTitle("");
                setNewContent("");
                setNewFolder("general");
                setNewThumbnail("");
              }}
              className="vtt-btn text-[9px] py-1"
              style={{ background: "transparent", boxShadow: "none" }}
            >
              <X size={10} />
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {filteredNotes.length === 0 ? (
        <div className="vtt-empty py-4">No notes{selectedFolder !== "all" ? ` in ${getFolderInfo(selectedFolder).label}` : ""}.</div>
      ) : (
        <div className="space-y-1.5">
          {filteredNotes.map((note) =>
            editingId === note.id ? (
              <NoteEditCard
                key={note.id}
                note={note}
                onSave={async (updates) => {
                  await updatePlayerNote(note.id, updates);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => setEditingId(note.id)}
                onDelete={() => deletePlayerNote(note.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Note display card ───────────────────────────────────────────────────────

function NoteCard({ note, onEdit, onDelete }: { note: any; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const folderInfo = getFolderInfo(note.folder);

  return (
    <div className="border border-terminal-primary/20 rounded bg-black/40 hover:border-terminal-primary/40 transition-colors">
      {/* Header row */}
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-sm flex-shrink-0">{folderInfo.emoji}</span>
        <span className="text-xs font-mono text-terminal-primary/80 flex-1 truncate">{note.title}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-0.5 text-terminal-primary/30 hover:text-terminal-primary/70 transition-colors flex-shrink-0"
          title="Edit"
        >
          <Edit2 size={9} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-0.5 text-red-500/40 hover:text-red-500 transition-colors flex-shrink-0"
          title="Delete"
        >
          <Trash2 size={9} />
        </button>
        {expanded ? <ChevronDown size={9} className="text-terminal-primary/40 flex-shrink-0" /> : <ChevronRight size={9} className="text-terminal-primary/40 flex-shrink-0" />}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-1.5 px-2 pb-1">
        <span className="text-[8px] font-mono text-terminal-primary/30 bg-terminal-primary/5 px-1 rounded">{folderInfo.label}</span>
        {note.createdAt && (
          <span className="text-[8px] font-mono text-terminal-primary/20">
            {new Date(note.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-terminal-primary/10 px-2 py-2 space-y-2">
          {note.thumbnailUrl && (
            <img
              src={note.thumbnailUrl}
              alt={note.title}
              className="w-20 h-20 object-cover rounded border border-terminal-primary/30"
            />
          )}
          <p className="text-[10px] font-mono text-terminal-primary/60 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {note.content || <span className="italic text-terminal-primary/30">No content</span>}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Note edit card ──────────────────────────────────────────────────────────

function NoteEditCard({ note, onSave, onCancel }: { note: any; onSave: (u: any) => Promise<void>; onCancel: () => void }) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [folder, setFolder] = useState<NoteFolder>(note.folder || "general");
  const [thumbnailUrl, setThumbnailUrl] = useState(note.thumbnailUrl || "");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  return (
    <div className="border border-terminal-primary/40 rounded bg-black/60 p-2 space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="vtt-input text-xs w-full"
        autoFocus
      />
      <select
        value={folder}
        onChange={(e) => setFolder(e.target.value as NoteFolder)}
        className="vtt-input text-[10px] w-full"
      >
        {FOLDERS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.emoji} {f.label}
          </option>
        ))}
      </select>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="vtt-input text-xs w-full resize-none"
      />

      {folder === "npcs" && (
        <div className="space-y-1">
          <div className="text-[8px] text-terminal-primary/50 uppercase tracking-wider">NPC Portrait</div>
          <div className="flex items-center gap-2">
            {thumbnailUrl && (
              <div className="relative group flex-shrink-0">
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="w-14 h-14 object-cover rounded border border-terminal-primary/30"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-0.5 rounded">
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const f = (e.target as HTMLInputElement).files?.[0];
                        if (f) { setCropFile(f); setCropperOpen(true); }
                      };
                      input.click();
                    }}
                    className="p-0.5 border border-terminal-primary/50 rounded hover:bg-terminal-primary/20"
                  >
                    <Crop size={9} className="text-terminal-primary" />
                  </button>
                  <button
                    onClick={() => setThumbnailUrl("")}
                    className="p-0.5 bg-red-500/80 border border-red-500 rounded hover:bg-red-600"
                  >
                    <X size={9} className="text-white" />
                  </button>
                </div>
              </div>
            )}
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setCropFile(f); setCropperOpen(true); }
                  e.target.value = "";
                }}
              />
              <div className="border border-terminal-primary/40 rounded p-1.5 text-center hover:bg-terminal-primary/10 transition-colors">
                <Upload size={10} className="mx-auto mb-0.5 text-terminal-primary" />
                <span className="text-[9px] text-terminal-primary/70">{thumbnailUrl ? "Change" : "Upload"}</span>
              </div>
            </label>
          </div>
          <ThumbnailCropper
            open={cropperOpen}
            onOpenChange={setCropperOpen}
            imageFile={cropFile}
            onCropComplete={(dataUrl) => { setThumbnailUrl(dataUrl); setCropFile(null); }}
            outputSize={400}
            title="Crop NPC Portrait"
          />
        </div>
      )}

      <div className="flex gap-1">
        <button onClick={() => onSave({ title, content, folder, thumbnailUrl: thumbnailUrl || undefined })} className="vtt-btn flex-1 text-[9px] py-1">
          <Save size={10} /> Save
        </button>
        <button onClick={onCancel} className="vtt-btn text-[9px] py-1" style={{ background: "transparent", boxShadow: "none" }}>
          <X size={10} />
        </button>
      </div>
    </div>
  );
}

// ─── Sessions Tab ─────────────────────────────────────────────────────────────

function SessionsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { sessions } = useSession();

  if (!sessions || sessions.length === 0) {
    return <div className="vtt-empty py-6">No sessions recorded.</div>;
  }

  return (
    <div className="space-y-1">
      {sessions.map((session: any) => (
        <div key={session.id} className="vtt-list-item flex-col !items-start cursor-pointer" onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}>
          <div className="flex items-center gap-1.5 w-full">
            {expandedId === session.id ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            <span className="text-xs font-mono text-terminal-primary/80 flex-1 truncate">
              #{session.session_number} {session.title}
            </span>
            <span className={`vtt-badge ${session.status === "completed" ? "secondary" : session.status === "in_progress" ? "warning" : ""}`}>
              {session.status}
            </span>
          </div>
          {expandedId === session.id && (
            <div className="text-[10px] text-terminal-primary/50 font-mono mt-1 pl-4 w-full space-y-1">
              {session.session_date && <div>Date: {session.session_date}</div>}
              {session.in_game_date && <div>In-Game: {session.in_game_date}</div>}
              {session.summary && (
                <div className="whitespace-pre-wrap max-h-[150px] overflow-y-auto">{session.summary}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Handouts Tab ─────────────────────────────────────────────────────────────

function HandoutsTab() {
  const { handouts } = useNotes();

  const sendToPresenter = (handout: any) => {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      const imageUrl = handout.mediaUrl || handout.content || "";
      channel.postMessage({
        type: "show-handout",
        imageDataUrl: imageUrl,
        name: handout.title,
      });
      channel.close();
    } catch {}
  };

  if (!handouts || handouts.length === 0) {
    return <div className="vtt-empty py-6">No handouts available.</div>;
  }

  return (
    <div className="space-y-1">
      {handouts.map((handout: any) => (
        <div key={handout.id} className="vtt-list-item group">
          {handout.type === "image" && handout.mediaUrl && (
            <img src={handout.mediaUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-terminal-primary/80 truncate">{handout.title}</div>
            <div className="text-[9px] text-terminal-primary/30 font-mono">{handout.type}</div>
          </div>
          {handout.mediaUrl && (
            <button
              onClick={(e) => { e.stopPropagation(); sendToPresenter(handout); }}
              className="p-1 text-terminal-primary/30 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Send to Presenter"
            >
              <Monitor size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Quests Tab ───────────────────────────────────────────────────────────────

function QuestsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { quests } = useQuest();

  if (!quests || quests.length === 0) {
    return <div className="vtt-empty py-6">No quests tracked.</div>;
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "";
      case "completed": return "secondary";
      case "failed": return "danger";
      case "on_hold": return "warning";
      default: return "";
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-400";
      case "high": return "text-orange-400";
      case "medium": return "text-yellow-400";
      default: return "text-terminal-primary/40";
    }
  };

  return (
    <div className="space-y-1">
      {quests.map((quest: any) => (
        <div key={quest.id} className="vtt-list-item flex-col !items-start cursor-pointer" onClick={() => setExpandedId(expandedId === quest.id ? null : quest.id)}>
          <div className="flex items-center gap-1.5 w-full">
            {expandedId === quest.id ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            <span className={`text-[8px] font-mono ${priorityColor(quest.priority)}`}>{quest.priority?.toUpperCase()}</span>
            <span className="text-xs font-mono text-terminal-primary/80 flex-1 truncate">{quest.title}</span>
            <span className={`vtt-badge ${statusColor(quest.status)}`}>{quest.status}</span>
          </div>
          {expandedId === quest.id && (
            <div className="text-[10px] text-terminal-primary/50 font-mono mt-1 pl-4 w-full space-y-1">
              {quest.quest_giver && <div>From: {quest.quest_giver}</div>}
              {quest.location && <div>Location: {quest.location}</div>}
              {quest.description && (
                <div className="whitespace-pre-wrap max-h-[150px] overflow-y-auto">{quest.description}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
