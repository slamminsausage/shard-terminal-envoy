import React, { useEffect, useState } from "react";
import { Session } from "@/types/session";
import { SessionCreator } from "@/components/sessions/SessionCreator";
import { useCampaign } from "@/contexts/CampaignContext";
import { useSession } from "@/contexts/SessionContext";

interface UpcomingSessionCardProps {
  sessions: Session[];
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useCountdown(targetDate: string | undefined) {
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setCountdown({ d, h, m, s });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return countdown;
}

export default function UpcomingSessionCard({ sessions }: UpcomingSessionCardProps) {
  const { isGM } = useCampaign();
  const { deleteSession, updateSession } = useSession();
  const [showCreator, setShowCreator] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Complete flow
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionSummary, setCompletionSummary] = useState("");
  const [completing, setCompleting] = useState(false);

  // Start flow
  const [startingId, setStartingId] = useState<string | null>(null);

  const inProgressSessions = sessions
    .filter(s => s.status === "in_progress")
    .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

  const plannedSessions = sessions
    .filter(s => s.status === "planned")
    .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

  const nextPlanned = plannedSessions[0] ?? null;

  const { d, h, m, s } = useCountdown(nextPlanned?.session_date);
  const completedCount = sessions.filter(s => s.status === "completed").length;
  const totalCount = sessions.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleDelete = async (id: string) => {
    setDeleting(true);
    await deleteSession(id);
    setConfirmDeleteId(null);
    setDeleting(false);
  };

  const handleStart = async (id: string) => {
    setStartingId(id);
    await updateSession(id, { status: "in_progress", start_time: new Date().toISOString() });
    setStartingId(null);
  };

  const handleComplete = async () => {
    if (!completingId) return;
    setCompleting(true);
    await updateSession(completingId, {
      status: "completed",
      end_time: new Date().toISOString(),
      ...(completionSummary.trim() ? { summary: completionSummary.trim() } : {}),
    });
    setCompletingId(null);
    setCompletionSummary("");
    setCompleting(false);
  };

  const hasAnySessions = inProgressSessions.length > 0 || plannedSessions.length > 0;

  if (showCreator) {
    return (
      <div className="dash-card md:col-span-2 xl:col-span-1">
        <SessionCreator onClose={() => setShowCreator(false)} />
      </div>
    );
  }

  // Inline completion form
  if (completingId) {
    const session = sessions.find(s => s.id === completingId);
    return (
      <div className="dash-card" style={{ background: "linear-gradient(135deg, var(--bg-panel) 70%, color-mix(in srgb, var(--primary) 4%, transparent) 100%)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-terminal-primary/40 text-base">◷</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Complete Session</span>
        </div>
        <p className="text-[9px] font-mono text-terminal-primary/70 mb-0.5">
          #{session?.session_number} — {session?.title}
        </p>
        <p className="text-[8px] font-mono text-terminal-primary/40 mb-2">Add a brief summary before closing.</p>
        <textarea
          className="w-full bg-black border border-terminal-primary/30 text-terminal-primary text-[9px] font-mono p-2 rounded-sm resize-none focus:outline-none focus:border-terminal-primary/60 mb-2"
          rows={4}
          placeholder="Session summary (optional)..."
          value={completionSummary}
          onChange={e => setCompletionSummary(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            disabled={completing}
            className="text-[9px] font-mono border px-3 py-1 rounded-sm text-terminal-primary border-terminal-primary/40 hover:bg-terminal-primary/10 transition-colors disabled:opacity-50"
            onClick={handleComplete}
          >
            {completing ? "SAVING..." : "✓ MARK COMPLETE"}
          </button>
          <button
            className="text-[9px] font-mono border px-3 py-1 rounded-sm text-terminal-primary/40 border-terminal-primary/20 hover:text-terminal-primary/70 transition-colors"
            onClick={() => { setCompletingId(null); setCompletionSummary(""); }}
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-card" style={{ background: "linear-gradient(135deg, var(--bg-panel) 70%, color-mix(in srgb, var(--primary) 4%, transparent) 100%)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary/40 text-base">◷</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Upcoming Session</span>
        </div>
        <div className="flex items-center gap-1.5">
          {inProgressSessions.length > 0 ? (
            <span className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm text-terminal-warning border-terminal-warning/40 bg-terminal-warning/10 animate-pulse">IN PROGRESS</span>
          ) : nextPlanned ? (
            <span className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm text-terminal-primary border-terminal-primary/30 bg-terminal-primary/10">SCHEDULED</span>
          ) : (
            <span className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm text-terminal-primary/30 border-terminal-primary/10">NO SESSION</span>
          )}
          {isGM && (
            <button
              className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm text-terminal-primary/50 border-terminal-primary/20 hover:text-terminal-primary hover:border-terminal-primary/40 transition-colors"
              onClick={() => setShowCreator(true)}
              title="Schedule a new session"
            >
              + SCHEDULE
            </button>
          )}
        </div>
      </div>

      {!hasAnySessions ? (
        <div className="py-4 text-center">
          <p className="text-[9px] font-mono text-terminal-primary/30 italic mb-2">No sessions scheduled</p>
          {isGM && (
            <button
              className="text-[9px] font-mono border px-3 py-1.5 rounded-sm text-terminal-primary/60 border-terminal-primary/30 hover:text-terminal-primary hover:border-terminal-primary/50 transition-colors"
              onClick={() => setShowCreator(true)}
            >
              + Schedule First Session
            </button>
          )}
        </div>
      ) : (
        <>
          {/* In-progress sessions — highlighted at top */}
          {inProgressSessions.length > 0 && (
            <div className="mb-2 p-2 rounded-sm border border-terminal-warning/30 bg-terminal-warning/5">
              {inProgressSessions.map(session => (
                <div key={session.id} className="flex items-start gap-1.5">
                  <span className="text-terminal-warning/50 flex-shrink-0 text-[8px] tabular-nums w-4 mt-0.5">#{session.session_number}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono text-terminal-warning truncate block">{session.title}</span>
                    <span className="text-[8px] font-mono text-terminal-warning/40">SESSION IN PROGRESS</span>
                  </div>
                  {isGM && (
                    <button
                      className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm text-terminal-primary/60 border-terminal-primary/30 hover:text-terminal-primary hover:border-terminal-primary/50 transition-colors flex-shrink-0"
                      onClick={() => { setCompletingId(session.id); setCompletionSummary(session.summary ?? ""); }}
                    >
                      ✓ COMPLETE
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Countdown to next planned session */}
          {nextPlanned && (
            <div className="flex items-end gap-3 mb-2">
              {[{ v: d, l: "Days" }, { v: h, l: "Hrs" }, { v: m, l: "Min" }, { v: s, l: "Sec" }].map(({ v, l }) => (
                <div key={l} className="text-center">
                  <div
                    className="font-display text-terminal-primary tabular-nums"
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 900, lineHeight: 1, textShadow: "0 0 12px color-mix(in srgb, var(--primary) 40%, transparent)" }}
                  >
                    {pad(v)}
                  </div>
                  <div className="text-[7px] font-mono text-terminal-primary/30 uppercase tracking-widest">{l}</div>
                </div>
              ))}
            </div>
          )}

          {hasAnySessions && <div className="dash-card-divider" />}

          {/* Planned sessions list */}
          {plannedSessions.length > 0 && (
            <div className="space-y-1 mb-2">
              {plannedSessions.map((session, i) => (
                <div key={session.id} className={`flex items-start gap-1.5 text-[9px] font-mono ${i === 0 ? "" : "opacity-60"}`}>
                  <span className="text-terminal-primary/40 flex-shrink-0 tabular-nums w-4">#{session.session_number}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-terminal-primary/80 truncate">{session.title}</span>
                      <span className="text-terminal-primary/30 flex-shrink-0 text-[8px]">
                        {new Date(session.session_date).toLocaleDateString()}
                      </span>
                    </div>
                    {i === 0 && session.summary && (
                      <p className="text-terminal-primary/40 text-[8px] leading-relaxed line-clamp-2 mt-0.5">{session.summary}</p>
                    )}
                  </div>
                  {isGM && (
                    <div className="flex gap-1 flex-shrink-0">
                      {i === 0 && confirmDeleteId !== session.id && (
                        <button
                          disabled={startingId === session.id}
                          className="text-[8px] font-mono border px-1 py-0.5 rounded-sm text-terminal-primary/40 border-terminal-primary/20 hover:text-terminal-primary hover:border-terminal-primary/40 transition-colors disabled:opacity-50"
                          onClick={() => handleStart(session.id)}
                          title="Mark session as in progress"
                        >
                          {startingId === session.id ? "..." : "▶ START"}
                        </button>
                      )}
                      {confirmDeleteId === session.id ? (
                        <>
                          <button
                            disabled={deleting}
                            className="text-[8px] font-mono border px-1 py-0.5 rounded-sm text-terminal-danger border-terminal-danger/40 hover:bg-terminal-danger/10 transition-colors disabled:opacity-50"
                            onClick={() => handleDelete(session.id)}
                          >
                            {deleting ? "..." : "CONFIRM"}
                          </button>
                          <button
                            className="text-[8px] font-mono border px-1 py-0.5 rounded-sm text-terminal-primary/40 border-terminal-primary/20 hover:text-terminal-primary/70 transition-colors"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            CANCEL
                          </button>
                        </>
                      ) : (
                        <button
                          className="text-[8px] font-mono text-terminal-primary/20 hover:text-terminal-danger transition-colors flex-shrink-0 px-0.5"
                          onClick={() => setConfirmDeleteId(session.id)}
                          title="Delete session"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="dash-card-divider" />

          {/* Campaign progress */}
          <div>
            <div className="flex justify-between text-[8px] font-mono text-terminal-primary/30 mb-0.5">
              <span>Campaign Progress</span>
              <span>{completedCount}/{totalCount} sessions</span>
            </div>
            <div className="power-bar">
              <div className="power-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
