/**
 * GMTerminalBuilder — GM-only panel for creating and managing custom terminals.
 *
 * Left pane: list of custom terminals with create / archive controls.
 * Right pane: log editor for the selected terminal (create / edit / delete logs).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCustomTerminals, type CustomTerminal, type CustomTerminalLog } from '@/hooks/useCustomTerminals';
import type { TerminalCategory } from '@/lib/terminalBootProfiles';

const ACCENT = '#3ae2b3';
const DIM = '#006633';

const CATEGORIES: TerminalCategory[] = [
  'default', 'personal', 'corporate', 'high-security', 'ship-systems',
  'public-kiosk', 'research', 'criminal', 'maintenance', 'government', 'corrupted',
];

const SECURITY_LEVELS = ['unlocked', 'low', 'medium', 'high', 'restricted', 'critical'];

const SECURITY_COLORS: Record<string, string> = {
  unlocked:   '#88ffaa',
  low:        '#3ae2b3',
  medium:     '#00ccff',
  high:       '#ffaa00',
  restricted: '#ff6600',
  critical:   '#ff3344',
};

// ── Blank form shapes ────────────────────────────────────────────────────────

const blankTerminal = () => ({
  code: '',
  name: '',
  category: 'default' as TerminalCategory,
  requires_roll: '' as string | number,
  description: '',
});

const blankLog = () => ({
  title: '',
  content: '',
  author: '',
  date: '',
  location: '',
  security_level: 'unlocked',
  requires_password: false,
  password: '',
});

// ── Sub-component: new-terminal form ────────────────────────────────────────

interface NewTerminalFormProps {
  onSave: (payload: { code: string; name: string; category: string; requires_roll: number | null; description: string }) => Promise<void>;
  onCancel: () => void;
}

function NewTerminalForm({ onSave, onCancel }: NewTerminalFormProps) {
  const [form, setForm] = useState(blankTerminal());
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        code: form.code.trim().toLowerCase().replace(/\s+/g, '_'),
        name: form.name.trim(),
        category: form.category,
        requires_roll: form.requires_roll === '' ? null : Number(form.requires_roll),
        description: form.description.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-3 rounded" style={{ border: `1px solid ${ACCENT}33`, background: `${ACCENT}08` }}>
      <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: `${DIM}cc` }}>
        New Terminal
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Code *</label>
          <input
            className="w-full mt-0.5 bg-transparent border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
            placeholder="my_terminal_01"
            value={form.code}
            onChange={e => set('code', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Name *</label>
          <input
            className="w-full mt-0.5 bg-transparent border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
            placeholder="My Terminal"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Category</label>
          <select
            className="w-full mt-0.5 bg-black border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT }}
            value={form.category}
            onChange={e => set('category', e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Requires Roll (DC)</label>
          <input
            type="number"
            min={0}
            max={20}
            className="w-full mt-0.5 bg-transparent border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
            placeholder="None"
            value={form.requires_roll}
            onChange={e => set('requires_roll', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Description (internal note)</label>
        <input
          className="w-full mt-0.5 bg-transparent border px-2 py-1 font-mono text-xs rounded"
          style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
          placeholder="Optional GM note"
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={saving} className="font-mono text-xs h-7" style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}55`, color: ACCENT }}>
          {saving ? 'Creating…' : '+ Create'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="font-mono text-xs h-7" style={{ color: `${DIM}cc` }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Sub-component: log editor form ──────────────────────────────────────────

interface LogFormProps {
  initialValues?: Partial<CustomTerminalLog>;
  terminalCode: string;
  onSave: (payload: any) => Promise<void>;
  onCancel: () => void;
}

function LogForm({ initialValues, terminalCode, onSave, onCancel }: LogFormProps) {
  const [form, setForm] = useState({
    ...blankLog(),
    ...initialValues,
    security_level: initialValues?.security_level || 'unlocked',
    requires_password: initialValues?.requires_password || false,
    password: initialValues?.password || '',
    sort_order: initialValues?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        terminal_code: terminalCode,
        title: form.title.trim(),
        content: form.content,
        author: form.author || null,
        date: form.date || null,
        location: form.location || null,
        security_level: form.security_level,
        requires_password: form.requires_password,
        password: form.requires_password ? (form.password || null) : null,
        sort_order: Number(form.sort_order) || 0,
      });
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!initialValues?.id;

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-3 rounded flex flex-col" style={{ border: `1px solid ${ACCENT}33`, background: `${ACCENT}05` }}>
      <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: `${DIM}cc` }}>
        {isEdit ? 'Edit Log Entry' : 'New Log Entry'}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Title *</label>
          <input
            className="w-full mt-0.5 bg-transparent border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
            placeholder="Log entry title"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Author</label>
          <input
            className="w-full mt-0.5 bg-transparent border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
            placeholder="Dr. Karev"
            value={form.author}
            onChange={e => set('author', e.target.value)}
          />
        </div>
        <div>
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>In-game Date</label>
          <input
            className="w-full mt-0.5 bg-transparent border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
            placeholder="001-1105"
            value={form.date}
            onChange={e => set('date', e.target.value)}
          />
        </div>
        <div>
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Location</label>
          <input
            className="w-full mt-0.5 bg-transparent border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
            placeholder="Lysani Station"
            value={form.location}
            onChange={e => set('location', e.target.value)}
          />
        </div>
        <div>
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Security Level</label>
          <select
            className="w-full mt-0.5 bg-black border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: SECURITY_COLORS[form.security_level] || ACCENT }}
            value={form.security_level}
            onChange={e => set('security_level', e.target.value)}
          >
            {SECURITY_LEVELS.map(s => <option key={s} value={s} style={{ color: SECURITY_COLORS[s] }}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Content</label>
        <textarea
          rows={8}
          className="w-full mt-0.5 bg-transparent border px-2 py-1.5 font-mono text-xs rounded resize-y"
          style={{ borderColor: `${ACCENT}44`, color: 'var(--primary)', outline: 'none' }}
          placeholder="Log body text. Supports [[redacted diff=10]] … [[/redacted]] and [[log: title]] links."
          value={form.content}
          onChange={e => set('content', e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.requires_password}
            onChange={e => set('requires_password', e.target.checked)}
            className="rounded"
          />
          <span className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Password protected</span>
        </label>
        {form.requires_password && (
          <input
            className="flex-1 bg-transparent border px-2 py-1 font-mono text-xs rounded"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
            placeholder="Password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
          />
        )}
        <div className="ml-auto flex items-center gap-1">
          <label className="font-mono text-xs" style={{ color: `${DIM}cc` }}>Order</label>
          <input
            type="number"
            min={0}
            className="w-16 bg-transparent border px-2 py-1 font-mono text-xs rounded text-center"
            style={{ borderColor: `${ACCENT}44`, color: ACCENT, outline: 'none' }}
            value={form.sort_order}
            onChange={e => set('sort_order', e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={saving} className="font-mono text-xs h-7" style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}55`, color: ACCENT }}>
          {saving ? 'Saving…' : isEdit ? '✓ Update' : '+ Add Log'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="font-mono text-xs h-7" style={{ color: `${DIM}cc` }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Main GMTerminalBuilder ───────────────────────────────────────────────────

interface GMTerminalBuilderProps {
  onClose: () => void;
}

export default function GMTerminalBuilder({ onClose }: GMTerminalBuilderProps) {
  const { toast } = useToast();
  const {
    customTerminals, loading,
    createTerminal, archiveTerminal,
    getLogs, createLog, updateLog, deleteLog,
  } = useCustomTerminals();

  const [selectedTerminal, setSelectedTerminal] = useState<CustomTerminal | null>(null);
  const [logs, setLogs] = useState<CustomTerminalLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [showNewTerminalForm, setShowNewTerminalForm] = useState(false);
  const [showNewLogForm, setShowNewLogForm] = useState(false);
  const [editingLog, setEditingLog] = useState<CustomTerminalLog | null>(null);

  // Load logs when terminal selected
  useEffect(() => {
    if (!selectedTerminal) { setLogs([]); return; }
    setLogsLoading(true);
    getLogs(selectedTerminal.code)
      .then(setLogs)
      .catch(e => console.error(e))
      .finally(() => setLogsLoading(false));
  }, [selectedTerminal, getLogs]);

  const handleCreateTerminal = useCallback(async (payload: any) => {
    try {
      const t = await createTerminal(payload);
      setShowNewTerminalForm(false);
      setSelectedTerminal(t);
      toast({ title: '✓ Terminal created', description: `Code: ${t.code}` });
    } catch (e: any) {
      toast({ title: 'Error creating terminal', description: e?.message, variant: 'destructive' });
    }
  }, [createTerminal, toast]);

  const handleArchive = useCallback(async (terminal: CustomTerminal) => {
    if (!confirm(`Archive "${terminal.name}"? Players won't see it but logs are preserved.`)) return;
    try {
      await archiveTerminal(terminal.id);
      if (selectedTerminal?.id === terminal.id) setSelectedTerminal(null);
      toast({ title: 'Terminal archived', description: terminal.name });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message, variant: 'destructive' });
    }
  }, [archiveTerminal, selectedTerminal, toast]);

  const handleCreateLog = useCallback(async (payload: any) => {
    try {
      const log = await createLog(payload);
      setLogs(prev => [...prev, log].sort((a, b) => a.sort_order - b.sort_order));
      setShowNewLogForm(false);
      toast({ title: '✓ Log entry added', description: log.title });
    } catch (e: any) {
      toast({ title: 'Error creating log', description: e?.message, variant: 'destructive' });
    }
  }, [createLog, toast]);

  const handleUpdateLog = useCallback(async (payload: any) => {
    if (!editingLog) return;
    try {
      const updated = await updateLog(editingLog.id, payload);
      setLogs(prev => prev.map(l => l.id === updated.id ? updated : l).sort((a, b) => a.sort_order - b.sort_order));
      setEditingLog(null);
      toast({ title: '✓ Log updated', description: updated.title });
    } catch (e: any) {
      toast({ title: 'Error updating log', description: e?.message, variant: 'destructive' });
    }
  }, [editingLog, updateLog, toast]);

  const handleDeleteLog = useCallback(async (log: CustomTerminalLog) => {
    if (!confirm(`Delete log entry "${log.title}"?`)) return;
    try {
      await deleteLog(log.id);
      setLogs(prev => prev.filter(l => l.id !== log.id));
      toast({ title: 'Log entry deleted', description: log.title });
    } catch (e: any) {
      toast({ title: 'Error deleting log', description: e?.message, variant: 'destructive' });
    }
  }, [deleteLog, toast]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div
        className="w-full max-w-5xl h-[90vh] flex flex-col rounded font-mono"
        style={{ background: '#050a05', border: `1px solid ${ACCENT}44`, boxShadow: `0 0 40px ${ACCENT}22` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2 shrink-0"
          style={{ borderBottom: `1px solid ${ACCENT}33` }}
        >
          <div>
            <span className="text-sm font-bold" style={{ color: ACCENT }}>TERMINAL BUILDER</span>
            <span className="ml-3 text-xs" style={{ color: `${DIM}cc` }}>GM TOOL — CREATE CUSTOM TERMINALS</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="font-mono text-xs h-7" style={{ color: `${DIM}cc` }}>
            ✕ Close
          </Button>
        </div>

        {/* Body — two panes */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: terminal list */}
          <div className="w-72 shrink-0 flex flex-col overflow-hidden" style={{ borderRight: `1px solid ${ACCENT}22` }}>
            <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${ACCENT}1a` }}>
              <span className="text-xs uppercase tracking-widest" style={{ color: `${DIM}cc` }}>Custom Terminals</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setShowNewTerminalForm(v => !v); }}
                className="font-mono text-xs h-6 px-2"
                style={{ color: ACCENT }}
              >
                {showNewTerminalForm ? '✕' : '+ New'}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {showNewTerminalForm && (
                <NewTerminalForm
                  onSave={handleCreateTerminal}
                  onCancel={() => setShowNewTerminalForm(false)}
                />
              )}

              {loading && (
                <div className="text-xs py-4 text-center animate-pulse" style={{ color: `${DIM}cc` }}>Loading…</div>
              )}

              {!loading && customTerminals.length === 0 && !showNewTerminalForm && (
                <div className="text-xs py-8 text-center" style={{ color: `${DIM}88` }}>
                  No custom terminals yet.<br />Click + New to create one.
                </div>
              )}

              {customTerminals.map(t => (
                <div
                  key={t.id}
                  className="rounded px-3 py-2 cursor-pointer transition-colors"
                  style={{
                    background: selectedTerminal?.id === t.id ? `${ACCENT}18` : 'transparent',
                    border: `1px solid ${selectedTerminal?.id === t.id ? `${ACCENT}44` : `${ACCENT}18`}`,
                  }}
                  onClick={() => { setSelectedTerminal(t); setShowNewLogForm(false); setEditingLog(null); }}
                >
                  <div className="text-xs font-bold" style={{ color: ACCENT }}>{t.name}</div>
                  <div className="text-xs mt-0.5 flex items-center justify-between gap-2">
                    <span style={{ color: `${DIM}cc` }}>{t.code}</span>
                    <div className="flex items-center gap-1">
                      {t.requires_roll && (
                        <span className="px-1 rounded" style={{ background: '#ffaa0022', color: '#ffaa00', fontSize: '9px' }}>
                          DC {t.requires_roll}
                        </span>
                      )}
                      <span className="px-1 rounded" style={{ background: `${ACCENT}15`, color: `${DIM}cc`, fontSize: '9px' }}>
                        {t.category}
                      </span>
                    </div>
                  </div>
                  {selectedTerminal?.id === t.id && (
                    <div className="mt-2 flex gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); handleArchive(t); }}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ color: '#ff6644', border: '1px solid #ff664433' }}
                      >
                        Archive
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: log editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedTerminal ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-sm text-center" style={{ color: `${DIM}88` }}>
                  Select a terminal on the left<br />to manage its log entries.
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ borderBottom: `1px solid ${ACCENT}1a` }}>
                  <div>
                    <span className="text-xs font-bold" style={{ color: ACCENT }}>{selectedTerminal.name}</span>
                    <span className="ml-2 text-xs" style={{ color: `${DIM}88` }}>/{selectedTerminal.code}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowNewLogForm(v => !v); setEditingLog(null); }}
                    className="font-mono text-xs h-6 px-2"
                    style={{ color: ACCENT }}
                  >
                    {showNewLogForm ? '✕ Cancel' : '+ Add Log Entry'}
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {showNewLogForm && (
                    <LogForm
                      terminalCode={selectedTerminal.code}
                      onSave={handleCreateLog}
                      onCancel={() => setShowNewLogForm(false)}
                    />
                  )}

                  {logsLoading && (
                    <div className="text-xs py-4 text-center animate-pulse" style={{ color: `${DIM}cc` }}>Loading logs…</div>
                  )}

                  {!logsLoading && logs.length === 0 && !showNewLogForm && (
                    <div className="text-xs py-8 text-center" style={{ color: `${DIM}88` }}>
                      No log entries yet.<br />Click + Add Log Entry above.
                    </div>
                  )}

                  {logs.map(log => (
                    <div key={log.id}>
                      {editingLog?.id === log.id ? (
                        <LogForm
                          terminalCode={selectedTerminal.code}
                          initialValues={log}
                          onSave={handleUpdateLog}
                          onCancel={() => setEditingLog(null)}
                        />
                      ) : (
                        <div
                          className="rounded px-3 py-2"
                          style={{ border: `1px solid ${ACCENT}22`, background: `${ACCENT}06` }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold truncate" style={{ color: ACCENT }}>{log.title}</div>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5" style={{ fontSize: '10px', color: `${DIM}cc` }}>
                                {log.author && <span>AUTHOR {log.author}</span>}
                                {log.date && <span>DATE {log.date}</span>}
                                {log.location && <span>LOC {log.location}</span>}
                                <span style={{ color: SECURITY_COLORS[log.security_level] || ACCENT }}>{log.security_level.toUpperCase()}</span>
                                {log.requires_password && <span style={{ color: '#ffaa00' }}>🔒 PASSWORD</span>}
                                <span style={{ color: `${DIM}88` }}>order:{log.sort_order}</span>
                              </div>
                              {log.content && (
                                <div
                                  className="mt-1 text-xs line-clamp-2"
                                  style={{ color: `${DIM}cc`, whiteSpace: 'pre-wrap' }}
                                >
                                  {log.content.slice(0, 200)}{log.content.length > 200 ? '…' : ''}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => { setEditingLog(log); setShowNewLogForm(false); }}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ color: ACCENT, border: `1px solid ${ACCENT}33` }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteLog(log)}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ color: '#ff6644', border: '1px solid #ff664433' }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
