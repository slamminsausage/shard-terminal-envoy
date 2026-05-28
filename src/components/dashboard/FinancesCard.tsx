import React, { useMemo } from "react";
import { PartyFunds, RecurringExpense, Transaction } from "@/types/finance";

interface FinancesCardProps {
  partyFunds: PartyFunds | null;
  recurringExpenses: RecurringExpense[];
  transactions: Transaction[];
}

function formatCr(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export default function FinancesCard({ partyFunds, recurringExpenses, transactions }: FinancesCardProps) {
  const balance = partyFunds?.balance ?? null;

  const monthlyOverhead = useMemo(() =>
    recurringExpenses.reduce((s, e) => s + (e.amount ?? 0), 0),
  [recurringExpenses]);

  // Recent income (last 30 days)
  const pendingIncome = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return transactions
      .filter(t => t.transaction_type === "income" && new Date(t.created_at).getTime() > cutoff)
      .reduce((s, t) => s + (t.amount ?? 0), 0);
  }, [transactions]);

  const totalDebt = useMemo(() =>
    transactions
      .filter(t => t.transaction_type === "loan_taken")
      .reduce((s, t) => s + (t.amount ?? 0), 0),
  [transactions]);

  // Last 12 party transactions as running balance sparkline
  const sparkData = useMemo(() => {
    const sorted = [...transactions]
      .filter(t => t.is_party_transaction)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-12);
    if (sorted.length === 0) return [];
    let running = balance ?? 0;
    const values: number[] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const t = sorted[i];
      values.unshift(running);
      const delta = t.transaction_type === "income" ? (t.amount ?? 0) : -(t.amount ?? 0);
      running -= delta;
    }
    return values;
  }, [transactions, balance]);

  const isLow = balance !== null && balance < 10_000;

  const badge = isLow
    ? { text: "LOW RESERVE", cls: "text-terminal-warning border-terminal-warning/40 bg-terminal-warning/10 animate-pulse" }
    : { text: "FUNDED", cls: "text-terminal-primary border-terminal-primary/30 bg-terminal-primary/10" };

  const maxVal = sparkData.length > 0 ? Math.max(...sparkData.map(Math.abs), 1) : 1;

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary/40 text-sm font-mono">Cr</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Finances</span>
        </div>
        <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded-sm ${badge.cls}`}>{badge.text}</span>
      </div>

      <div className="mb-1">
        <span
          className="text-terminal-primary font-display tabular-nums"
          style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900, lineHeight: 1, textShadow: "0 0 16px color-mix(in srgb, var(--primary) 40%, transparent)" }}
        >
          {balance !== null ? balance.toLocaleString() : "—"}
        </span>
        <p className="text-[9px] font-mono text-terminal-primary/30 uppercase tracking-wider mt-0.5">Credits</p>
      </div>

      <div className="dash-card-divider" />

      <div className="space-y-1 mb-2">
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-terminal-primary/40">Monthly Overhead</span>
          <span className="text-terminal-warning">{monthlyOverhead > 0 ? `-${formatCr(monthlyOverhead)}` : "—"}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-terminal-primary/40">Pending Income</span>
          <span className="text-terminal-primary/70">{pendingIncome > 0 ? `+${formatCr(pendingIncome)}` : "—"}</span>
        </div>
        {totalDebt > 0 && (
          <div className="flex justify-between text-[9px] font-mono">
            <span className="text-terminal-primary/40">Debts</span>
            <span className="text-terminal-danger animate-pulse">-{formatCr(totalDebt)}</span>
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparkData.length > 1 && (
        <div className="flex items-end gap-[2px] h-8">
          {sparkData.map((v, i) => {
            const h = Math.max(2, Math.round((Math.abs(v) / maxVal) * 28));
            const isLast = i === sparkData.length - 1;
            return (
              <div
                key={i}
                className="flex-1 rounded-[1px]"
                style={{
                  height: `${h}px`,
                  background: isLast
                    ? "var(--primary)"
                    : "color-mix(in srgb, var(--primary) 30%, transparent)",
                  boxShadow: isLast ? "0 0 4px var(--primary)" : "none",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
