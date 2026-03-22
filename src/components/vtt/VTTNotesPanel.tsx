import { useState } from "react";
import { FileText, BookOpen, Scroll, Target, ChevronDown, ChevronRight, Monitor } from "lucide-react";

// Safely import contexts - they may not be available in standalone VTT mode
let useNotesHook: any = null;
let useSessionHook: any = null;
let useQuestsHook: any = null;

try {
  const notesModule = require("@/contexts/NotesContext");
  useNotesHook = notesModule.useNotes;
} catch {}
try {
  const sessionModule = require("@/contexts/SessionContext");
  useSessionHook = sessionModule.useSession;
} catch {}
try {
  const questModule = require("@/contexts/QuestContext");
  useQuestsHook = questModule.useQuests;
} catch {}

const CHANNEL_NAME = "shard-vtt-presenter";

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

// ─── Notes Tab ─────────────────────────────────────────────────────────────

function NotesTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  let notes: any[] = [];
  try {
    if (useNotesHook) {
      const ctx = useNotesHook();
      notes = ctx.playerNotes || [];
    }
  } catch {
    return <div className="vtt-empty py-6">Notes unavailable</div>;
  }

  if (notes.length === 0) {
    return <div className="vtt-empty py-6">No campaign notes yet.</div>;
  }

  return (
    <div className="space-y-1">
      {notes.map((note: any) => (
        <div key={note.id} className="vtt-list-item flex-col !items-start cursor-pointer" onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}>
          <div className="flex items-center gap-1.5 w-full">
            {expandedId === note.id ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            <span className="text-xs font-mono text-terminal-primary/80 flex-1 truncate">{note.title}</span>
            {note.folder && (
              <span className="vtt-badge secondary">{note.folder}</span>
            )}
          </div>
          {expandedId === note.id && (
            <div className="text-[10px] text-terminal-primary/50 font-mono mt-1 pl-4 whitespace-pre-wrap max-h-[200px] overflow-y-auto w-full">
              {note.content || "No content"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Sessions Tab ──────────────────────────────────────────────────────────

function SessionsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  let sessions: any[] = [];
  try {
    if (useSessionHook) {
      const ctx = useSessionHook();
      sessions = ctx.sessions || [];
    }
  } catch {
    return <div className="vtt-empty py-6">Sessions unavailable</div>;
  }

  if (sessions.length === 0) {
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

// ─── Handouts Tab ──────────────────────────────────────────────────────────

function HandoutsTab() {
  let handouts: any[] = [];
  try {
    if (useNotesHook) {
      const ctx = useNotesHook();
      handouts = ctx.handouts || [];
    }
  } catch {
    return <div className="vtt-empty py-6">Handouts unavailable</div>;
  }

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

  if (handouts.length === 0) {
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

// ─── Quests Tab ────────────────────────────────────────────────────────────

function QuestsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  let quests: any[] = [];
  try {
    if (useQuestsHook) {
      const ctx = useQuestsHook();
      quests = ctx.quests || [];
    }
  } catch {
    return <div className="vtt-empty py-6">Quests unavailable</div>;
  }

  if (quests.length === 0) {
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
