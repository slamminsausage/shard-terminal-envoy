import React, { useState } from 'react';
import { Send, Radio, X, ChevronDown } from 'lucide-react';
import { TERMINALS } from '@/lib/terminals';
import { dbHelpers } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const SECURITY_LEVELS = ['unlocked', 'low', 'medium', 'high', 'critical'] as const;

interface GMTransmitPanelProps {
  /** Pre-select a terminal when the panel opens */
  defaultTerminalCode?: string;
  onClose: () => void;
}

export default function GMTransmitPanel({ defaultTerminalCode, onClose }: GMTransmitPanelProps) {
  const { toast } = useToast();
  const [terminalCode, setTerminalCode] = useState(defaultTerminalCode ?? TERMINALS[0].code);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [securityLevel, setSecurityLevel] = useState<typeof SECURITY_LEVELS[number]>('unlocked');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Missing fields', description: 'Title and content are required.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      await dbHelpers.injectTerminalTransmission({
        terminal_code: terminalCode,
        title: title.trim(),
        content: content.trim(),
        author: author.trim() || undefined,
        date: date.trim() || undefined,
        location: location.trim() || undefined,
        security_level: securityLevel,
      });
      toast({ title: 'Transmission sent', description: `Injected into ${terminalCode}` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Failed to send', description: err?.message ?? 'Unknown error', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const inputCls = cn(
    'w-full bg-black border border-terminal-primary/30 rounded px-2 py-1.5',
    'text-terminal-primary text-xs font-mono placeholder:text-terminal-primary/30',
    'focus:border-terminal-primary/70 focus:outline-none',
  );

  const labelCls = 'text-terminal-primary/60 text-[10px] font-mono tracking-widest uppercase mb-1 block';

  return (
    <div className="fixed inset-0 z-[9800] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded border border-terminal-primary/40 bg-black/95 shadow-2xl font-mono overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-terminal-primary/20 bg-terminal-primary/5">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-terminal-primary animate-pulse" />
            <span className="text-terminal-primary text-xs tracking-widest uppercase">GM — Inject Transmission</span>
          </div>
          <button onClick={onClose} className="text-terminal-primary/40 hover:text-terminal-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-4 py-3 flex flex-col gap-3">

          {/* Target terminal */}
          <div>
            <label className={labelCls}>Target Terminal</label>
            <div className="relative">
              <select
                value={terminalCode}
                onChange={e => setTerminalCode(e.target.value)}
                className={cn(inputCls, 'appearance-none pr-7 cursor-pointer')}
              >
                {TERMINALS.map(t => (
                  <option key={t.code} value={t.code} className="bg-black">
                    {t.code} — {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-terminal-primary/40 pointer-events-none" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={labelCls}>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="INCOMING TRANSMISSION"
              className={inputCls}
            />
          </div>

          {/* Content */}
          <div>
            <label className={labelCls}>Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Message body…"
              rows={5}
              className={cn(inputCls, 'resize-y min-h-[80px]')}
            />
          </div>

          {/* Metadata row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Author</label>
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="UNKNOWN"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>In-Game Date</label>
              <input
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="1105-04-12"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Location</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Unknown"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Security Level</label>
              <div className="relative">
                <select
                  value={securityLevel}
                  onChange={e => setSecurityLevel(e.target.value as any)}
                  className={cn(inputCls, 'appearance-none pr-7 cursor-pointer capitalize')}
                >
                  {SECURITY_LEVELS.map(l => (
                    <option key={l} value={l} className="bg-black capitalize">{l}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-terminal-primary/40 pointer-events-none" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-terminal-primary/20 bg-terminal-primary/5">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs border border-terminal-primary/30 text-terminal-primary/60 rounded hover:text-terminal-primary hover:border-terminal-primary/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-1.5 text-xs bg-terminal-primary/15 border border-terminal-primary/50 text-terminal-primary rounded hover:bg-terminal-primary/25 transition-colors disabled:opacity-40"
          >
            <Send className="w-3 h-3" />
            {sending ? 'Sending…' : 'Transmit'}
          </button>
        </div>
      </div>
    </div>
  );
}
