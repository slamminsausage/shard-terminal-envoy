import React, { useEffect, useState } from "react";
import { Session } from "@/types/session";

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
  const nextSession = sessions
    .filter(s => s.status === "planned")
    .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())[0] ?? null;

  const { d, h, m, s } = useCountdown(nextSession?.session_date);
  const completedCount = sessions.filter(s => s.status === "completed").length;
  const totalCount = sessions.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="dash-card" style={{ background: "linear-gradient(135deg, var(--bg-panel) 70%, color-mix(in srgb, var(--primary) 4%, transparent) 100%)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary/40 text-base">◷</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Upcoming Session</span>
        </div>
        {nextSession ? (
          <span className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm text-terminal-primary border-terminal-primary/30 bg-terminal-primary/10">SCHEDULED</span>
        ) : (
          <span className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm text-terminal-primary/30 border-terminal-primary/10">NO SESSION</span>
        )}
      </div>

      {!nextSession ? (
        <p className="text-[9px] font-mono text-terminal-primary/30 italic py-4">No sessions scheduled</p>
      ) : (
        <>
          {/* Countdown */}
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

          <div className="dash-card-divider" />

          <div className="space-y-0.5 mb-2 text-[9px] font-mono">
            <div className="flex justify-between">
              <span className="text-terminal-primary/40">Session</span>
              <span className="text-terminal-primary/80">#{nextSession.session_number} — {nextSession.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-primary/40">Date</span>
              <span className="text-terminal-primary/60">{new Date(nextSession.session_date).toLocaleDateString()}</span>
            </div>
            {nextSession.in_game_date && (
              <div className="flex justify-between">
                <span className="text-terminal-primary/40">Imperial</span>
                <span className="text-terminal-primary/60">{nextSession.in_game_date}</span>
              </div>
            )}
          </div>

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
