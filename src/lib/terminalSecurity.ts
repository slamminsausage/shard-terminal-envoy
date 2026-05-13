/**
 * terminalSecurity — persistent security state for the terminal system.
 *
 * Tracks:
 *  - Individual log locks (redacted blocks exhausted, passwords exhausted)
 *  - Per-terminal failure counts
 *  - Terminal-level security lockouts (triggered when failures exceed threshold)
 *
 * Lockouts are GM-reset only: cleared by SUDO UNLOCK from the prompt screen.
 */

const LOCKED_LOGS_KEY      = 'term_sec_locked_logs';
const TERMINAL_FAILURES_KEY = 'term_sec_failures';
const LOCKED_TERMINALS_KEY  = 'term_sec_lockouts';

// ── helpers ──────────────────────────────────────────────────────────────────

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  localStorage.setItem(key, JSON.stringify([...set]));
}

function readRecord(key: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeRecord(key: string, rec: Record<string, number>): void {
  localStorage.setItem(key, JSON.stringify(rec));
}

// ── log-level lockout ─────────────────────────────────────────────────────────

/** Returns true if a specific log/block is permanently locked. */
export function isLogLocked(persistKey: string): boolean {
  return readSet(LOCKED_LOGS_KEY).has(persistKey);
}

/** Permanently locks a specific log/block. */
export function lockLog(persistKey: string): void {
  const set = readSet(LOCKED_LOGS_KEY);
  set.add(persistKey);
  writeSet(LOCKED_LOGS_KEY, set);
}

/** Clears ALL individual log locks (called by SUDO UNLOCK). */
export function unlockAllLogs(): void {
  localStorage.removeItem(LOCKED_LOGS_KEY);
}

/** Clears log locks for a specific terminal (all keys starting with prefix). */
export function unlockLogsForTerminal(terminalCode: string): void {
  const set = readSet(LOCKED_LOGS_KEY);
  for (const key of [...set]) {
    if (key.startsWith(`${terminalCode}:`)) set.delete(key);
  }
  writeSet(LOCKED_LOGS_KEY, set);
}

// ── terminal failure counting ─────────────────────────────────────────────────

/** Returns the current failure count for a terminal. */
export function getFailureCount(terminalCode: string): number {
  return readRecord(TERMINAL_FAILURES_KEY)[terminalCode] ?? 0;
}

/**
 * Increments the failure count and, if it reaches the threshold,
 * locks the terminal and returns true. Otherwise returns false.
 */
export function recordFailure(terminalCode: string, threshold: number): boolean {
  const rec = readRecord(TERMINAL_FAILURES_KEY);
  const next = (rec[terminalCode] ?? 0) + 1;
  rec[terminalCode] = next;
  writeRecord(TERMINAL_FAILURES_KEY, rec);

  if (next >= threshold) {
    lockTerminal(terminalCode);
    return true; // just triggered lockout
  }
  return false;
}

/** Resets the failure counter for a terminal. */
export function resetFailureCount(terminalCode: string): void {
  const rec = readRecord(TERMINAL_FAILURES_KEY);
  delete rec[terminalCode];
  writeRecord(TERMINAL_FAILURES_KEY, rec);
}

// ── terminal-level lockout ────────────────────────────────────────────────────

/** Returns true if the terminal is in security lockout. */
export function isTerminalLockedOut(terminalCode: string): boolean {
  return readSet(LOCKED_TERMINALS_KEY).has(terminalCode);
}

/** Puts the terminal into security lockout. */
export function lockTerminal(terminalCode: string): void {
  const set = readSet(LOCKED_TERMINALS_KEY);
  set.add(terminalCode);
  writeSet(LOCKED_TERMINALS_KEY, set);
}

/**
 * Clears the terminal's security lockout AND resets its failure counter.
 * Called by SUDO UNLOCK.
 */
export function unlockTerminal(terminalCode: string): void {
  const set = readSet(LOCKED_TERMINALS_KEY);
  set.delete(terminalCode);
  writeSet(LOCKED_TERMINALS_KEY, set);
  resetFailureCount(terminalCode);
  unlockLogsForTerminal(terminalCode);
}

/** Clears ALL terminal lockouts (nuclear reset). */
export function unlockAllTerminals(): void {
  localStorage.removeItem(LOCKED_TERMINALS_KEY);
  localStorage.removeItem(TERMINAL_FAILURES_KEY);
  localStorage.removeItem(LOCKED_LOGS_KEY);
}
