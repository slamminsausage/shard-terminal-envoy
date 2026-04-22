import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { LogEntryType } from "@/types/session";

const CHANNEL_NAME = "shard-session-log";

const LOG_TYPE_LABELS: Record<LogEntryType, string> = {
  note: "Note",
  combat: "Combat",
  skill_check: "Skill Check",
  npc_interaction: "NPC Interaction",
  location_change: "Location Change",
};

/**
 * Standalone pop-out window for writing session log entries.
 * Communicates back to the parent tab via BroadcastChannel.
 * Opened via: window.open('/session-log-popout?sessionId=X')
 */
export default function SessionLogPopout() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "";
  const editId = searchParams.get("editId") || "";
  const editTitle = searchParams.get("editTitle") || "";
  const editContent = searchParams.get("editContent") || "";
  const editType = (searchParams.get("editType") as LogEntryType) || "note";

  const [title, setTitle] = useState(editTitle);
  const [content, setContent] = useState(editContent);
  const [logType, setLogType] = useState<LogEntryType>(editType);
  const [saved, setSaved] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const isEditing = !!editId;

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  useEffect(() => {
    document.title = isEditing ? "Edit Log Entry" : "New Session Log Entry";
  }, [isEditing]);

  const handleSave = () => {
    if (!content.trim()) return;

    if (isEditing) {
      channelRef.current?.postMessage({
        type: "update-log-entry",
        entryId: editId,
        updates: {
          title: title || undefined,
          content,
          entry_type: logType,
        },
      });
    } else {
      channelRef.current?.postMessage({
        type: "add-log-entry",
        sessionId,
        entry: {
          entry_type: logType,
          title: title || undefined,
          content,
          created_by: "player",
        },
      });
    }

    setSaved(true);
    if (!isEditing) {
      setTitle("");
      setContent("");
      setLogType("note");
    }
    setTimeout(() => setSaved(false), 2000);
  };

  // Ctrl/Cmd + Enter to save
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [content, title, logType]);

  if (!sessionId && !editId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400 font-mono text-sm">Missing session ID.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#3ae2b3] p-4 font-mono">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="border border-[#3ae2b330] rounded px-4 py-3 bg-[#0a0f0a]">
          <h1 className="text-sm uppercase tracking-wider text-[#3ae2b3aa] mb-3">
            {isEditing ? "Edit Log Entry" : "New Session Log Entry"}
          </h1>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black border border-[#3ae2b350] text-[#3ae2b3] rounded px-3 py-2 text-sm focus:border-[#3ae2b3] focus:outline-none placeholder-[#3ae2b330]"
            />
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value as LogEntryType)}
              className="bg-black border border-[#3ae2b350] text-[#3ae2b3] rounded px-3 py-2 text-sm focus:border-[#3ae2b3] focus:outline-none"
            >
              {Object.entries(LOG_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="What happened..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-black border border-[#3ae2b350] text-[#3ae2b3] rounded px-3 py-2 text-sm focus:border-[#3ae2b3] focus:outline-none placeholder-[#3ae2b330] resize-y min-h-[200px]"
            autoFocus
          />

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-4 py-2 rounded border border-[#3ae2b350] bg-[#3ae2b315] text-[#3ae2b3] text-sm hover:bg-[#3ae2b325] hover:border-[#3ae2b3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {isEditing ? "Save Changes" : "Add Entry"}
            </button>
            <span className="text-[10px] text-[#3ae2b340]">
              Ctrl+Enter to save
            </span>
            {saved && (
              <span className="text-[10px] text-green-400 animate-pulse">
                Saved!
              </span>
            )}
          </div>
        </div>

        <p className="text-[9px] text-[#3ae2b330] text-center">
          This window stays open while you browse other tabs. Close when done.
        </p>
      </div>
    </div>
  );
}
