
// terminal/os-desktop.jsx — Terminal OS desktop: file icons, gauges, command bar, history
// Exports: TerminalOS

// ── Animated Gauges ───────────────────────────────────────────────────────────

function MiniBar({ label, color, seed, fastFlicker }) {
  const rng = React.useMemo(() => seededRng(seed + label), [seed, label]);
  const base = React.useMemo(() => Math.round(rng() * 55 + 25), []);
  const [val, setVal] = React.useState(base);

  React.useEffect(() => {
    const interval = fastFlicker ? 180 + Math.random() * 120 : 1800 + Math.random() * 1400;
    const id = setInterval(() => {
      setVal(prev => {
        const spike = fastFlicker && Math.random() < 0.12;
        const drift = spike ? 30 + Math.random() * 50 : (Math.random() - 0.5) * (fastFlicker ? 20 : 8);
        return Math.max(4, Math.min(99, Math.round(prev + drift)));
      });
    }, interval);
    return () => clearInterval(id);
  }, [fastFlicker]);

  const barColor = val > 88 ? '#ff4444' : val > 72 ? '#ffaa00' : color;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'5px', minWidth:0 }}>
      <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'7px', color:`${color}88`, letterSpacing:'0.1em', flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:'4px', background:`${color}18`, borderRadius:'2px', minWidth:'28px', overflow:'hidden' }}>
        <div style={{
          height:'100%', width:`${val}%`, borderRadius:'2px',
          background: barColor,
          boxShadow: `0 0 4px ${barColor}66`,
          transition: fastFlicker ? 'width 0.15s ease' : 'width 1.2s ease',
        }} />
      </div>
      <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'7px', color:`${color}77`, minWidth:'18px', textAlign:'right', flexShrink:0 }}>{val}%</span>
    </div>
  );
}

function Oscilloscope({ color, width = 14 }) {
  const [bars, setBars] = React.useState(() => Array.from({ length: width }, () => Math.random()));
  React.useEffect(() => {
    const id = setInterval(() => {
      setBars(prev => prev.map(v => Math.max(0.05, Math.min(1, v + (Math.random() - 0.5) * 0.45))));
    }, 280);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'1px', height:'12px' }}>
      {bars.map((v, i) => (
        <div key={i} style={{
          width:'2px', height:`${Math.round(v * 100)}%`,
          background: color, opacity: 0.5 + v * 0.5,
          boxShadow: `0 0 2px ${color}55`,
          transition: 'height 0.22s ease',
        }} />
      ))}
    </div>
  );
}

function BlinkDot({ color, rate }) {
  const [on, setOn] = React.useState(true);
  React.useEffect(() => {
    if (!rate) return;
    const id = setInterval(() => setOn(p => !p), rate);
    return () => clearInterval(id);
  }, [rate]);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'3px' }}>
      <div style={{
        width:'5px', height:'5px', borderRadius:'50%',
        background: on ? color : `${color}22`,
        boxShadow: on ? `0 0 5px ${color}88` : 'none',
        transition: 'all 0.1s ease',
      }} />
    </div>
  );
}

function NumericDrift({ color, seed, min, max, unit, decimals = 1 }) {
  const rng = React.useMemo(() => seededRng(seed), [seed]);
  const base = React.useMemo(() => rng() * (max - min) + min, []);
  const [val, setVal] = React.useState(base);
  React.useEffect(() => {
    const id = setInterval(() => {
      setVal(prev => {
        const d = (Math.random() - 0.5) * (max - min) * 0.05;
        return Math.max(min, Math.min(max, prev + d));
      });
    }, 2200 + Math.random() * 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'8px', color, fontVariantNumeric:'tabular-nums' }}>
      {val.toFixed(decimals)}<span style={{ fontSize:'6px', color:`${color}77`, marginLeft:'2px' }}>{unit}</span>
    </span>
  );
}

// ── File Icon ─────────────────────────────────────────────────────────────────

function FileIcon({ log, accentColor, dimColor, termCode, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const [clicked, setClicked] = React.useState(false);

  const secColors = {
    standard: accentColor, high: '#ffaa00', restricted: '#ff6600',
    critical: '#ff3344', unlocked: '#88ffaa',
  };
  const secColor = secColors[log.security_level] || accentColor;
  const isCritical = log.security_level === 'critical' || log.security_level === 'restricted';
  const isEncrypted = log.requires_password;
  const needsRoll = log.requires_roll && !isEncrypted;

  const fileType = log.requires_password ? 'ENC' : log.requires_roll ? 'SEC' : 'DOC';
  const fileIcon = log.requires_password ? '⊞' : log.requires_roll ? '⊡' : '▤';
  const fileSize = fakeFileSize(termCode + log.title);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => { setClicked(false); onClick(log); }, 160);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '128px', minHeight: '148px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '10px 8px 8px',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        border: `1px solid ${hovered ? secColor + 'aa' : 'transparent'}`,
        borderRadius: '2px',
        background: hovered ? `${secColor}0e` : 'transparent',
        boxShadow: hovered ? `0 0 18px ${secColor}22, inset 0 0 12px ${secColor}08` : 'none',
        transform: hovered ? 'translateY(-4px) scale(1.03)' : clicked ? 'scale(0.96)' : 'none',
        transition: 'transform 0.12s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease',
      }}
    >
      {/* Scan sweep on hover */}
      {hovered && (
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:1,
        }}>
          <div style={{
            position:'absolute', top:0, bottom:0, width:'40%',
            background: `linear-gradient(90deg, transparent, ${secColor}18, ${secColor}28, ${secColor}18, transparent)`,
            animation: 'scanSweep 0.7s ease-out forwards',
          }} />
        </div>
      )}

      {/* File folder shape */}
      <div style={{ position:'relative', width:'60px', height:'48px', marginBottom:'6px', zIndex:2 }}>
        {/* Tab */}
        <div style={{
          position:'absolute', top:0, left:0, width:'24px', height:'10px',
          borderTop: `2px solid ${secColor}${hovered ? 'ff' : 'bb'}`,
          borderLeft: `2px solid ${secColor}${hovered ? 'ff' : 'bb'}`,
          borderRight: `2px solid ${secColor}${hovered ? 'ff' : 'bb'}`,
          borderTopLeftRadius:'2px', borderTopRightRadius:'2px',
          boxShadow: hovered ? `0 0 8px ${secColor}44` : 'none',
          transition: 'box-shadow 0.15s ease',
        }} />
        {/* Body */}
        <div style={{
          position:'absolute', top:'10px', left:0, width:'60px', height:'38px',
          border: `2px solid ${secColor}${hovered ? 'ff' : 'bb'}`,
          borderRadius:'0 2px 2px 2px',
          background: `${secColor}${hovered ? '18' : '0c'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: hovered ? `0 0 10px ${secColor}33` : isCritical ? `0 0 6px ${secColor}22` : 'none',
          transition: 'all 0.15s ease',
          animation: isCritical ? 'critPulse 2s ease-in-out infinite' : 'none',
        }}>
          <span style={{
            fontSize:'20px', lineHeight:1, color: secColor,
            textShadow: hovered ? `0 0 8px ${secColor}88` : 'none',
          }}>{fileIcon}</span>
        </div>
        {/* Type badge */}
        <div style={{
          position:'absolute', top:'8px', right:'-2px',
          fontFamily:'Share Tech Mono,monospace', fontSize:'8px', color: dimColor,
          opacity: hovered ? 1 : 0.5, transition:'opacity 0.15s',
        }}>{fileType}</div>
        {/* Lock indicator */}
        {isEncrypted && (
          <div style={{
            position:'absolute', bottom:'0px', right:'-4px',
            fontSize:'10px', color:'#ffaa00',
            textShadow: '0 0 6px #ffaa0088',
            animation: 'none',
          }}>🔒</div>
        )}
        {needsRoll && (
          <div style={{
            position:'absolute', bottom:'0px', right:'-4px',
            fontFamily:'Share Tech Mono,monospace', fontSize:'8px', color:'#ffaa00',
            background:'rgba(0,0,0,0.8)', padding:'1px 2px', borderRadius:'1px',
          }}>⚡{log.roll_check?.difficulty}+</div>
        )}
      </div>

      {/* Title */}
      <div style={{
        fontFamily:'Share Tech Mono,monospace', fontSize:'10px', lineHeight:1.3,
        color: hovered ? secColor : 'var(--primary)', textAlign:'center',
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
        overflow:'hidden', wordBreak:'break-word', zIndex:2,
        textShadow: hovered ? `0 0 8px ${secColor}66` : 'none',
        transition:'color 0.15s, text-shadow 0.15s',
        maxWidth:'108px',
      }}>
        {log.title}
      </div>

      {/* Author & Date */}
      {log.author && (
        <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'8px', color: dimColor, marginTop:'3px', textAlign:'center' }}>
          {log.author.length > 18 ? log.author.slice(0,16)+'..' : log.author}
        </div>
      )}
      {log.date && (
        <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'7px', color:`${dimColor}99`, textAlign:'center' }}>
          {log.date}
        </div>
      )}

      {/* Security badge */}
      <div style={{ marginTop:'4px', display:'flex', alignItems:'center', gap:'4px', flexWrap:'wrap', justifyContent:'center' }}>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'7px', color: secColor, letterSpacing:'0.06em', textTransform:'uppercase' }}>
          {log.security_level || 'std'}
        </span>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'7px', color:`${dimColor}77` }}>.{fileType}</span>
      </div>

      {/* File size */}
      <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'7px', color:`${dimColor}66`, marginTop:'2px' }}>
        {fileSize}
      </div>

      <style>{`
        @keyframes critPulse { 0%,100%{opacity:1;filter:brightness(1)} 50%{opacity:0.55;filter:brightness(1.7)} }
        @keyframes scanSweep { 0%{left:-40%} 100%{left:140%} }
      `}</style>
    </div>
  );
}

// ── Command Bar ───────────────────────────────────────────────────────────────

const CMD_HELP = `AVAILABLE COMMANDS:
  ls                — list files in current terminal
  cat <title>       — open a file by partial title match
  help              — show this message
  history           — show recently accessed terminals
  clear             — clear command output
  disconnect        — return to access code screen`;

function CommandBar({ logs, accentColor, dimColor, termCode, onOpenLog, onDisconnect, onHistory }) {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState([]);
  const [history, setCmdHistory] = React.useState([]);
  const [histIdx, setHistIdx] = React.useState(-1);
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef(null);
  const outputRef = React.useRef(null);

  const push = (lines, color) => {
    const arr = (typeof lines === 'string' ? lines.split('\n') : lines).map(l => ({ text: l, color }));
    setOutput(prev => [...prev, ...arr].slice(-40));
    setTimeout(() => { if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight; }, 20);
  };

  const run = (cmd) => {
    const raw = cmd.trim();
    if (!raw) return;
    push(`${termCode}:~$ ${raw}`, `${accentColor}88`);
    setCmdHistory(h => [raw, ...h.slice(0,19)]);
    setHistIdx(-1);

    const parts = raw.toUpperCase().split(/\s+/);
    const verb = parts[0];
    if (verb === 'CLEAR') { setOutput([]); return; }
    if (verb === 'HELP') { push(CMD_HELP, accentColor); return; }
    if (verb === 'DISCONNECT' || verb === 'EXIT') { onDisconnect?.(); return; }
    if (verb === 'HISTORY') { onHistory?.(); push('>> Opening history panel...', accentColor); return; }
    if (verb === 'LS' || verb === 'DIR') {
      if (!logs?.length) { push('>> No files found.', dimColor); return; }
      push(`>> ${logs.length} file(s) in ${termCode}:`, accentColor);
      logs.forEach((l, i) => push(`  [${String(i+1).padStart(2,'0')}] ${l.title} — ${l.security_level || 'std'}`, accentColor));
      return;
    }
    if (verb === 'CAT') {
      const query = parts.slice(1).join(' ');
      if (!query) { push('Usage: cat <partial title>', '#ff4444'); return; }
      const found = logs?.find(l => l.title.toUpperCase().includes(query));
      if (!found) { push(`>> No file matching "${query.toLowerCase()}"`, '#ff4444'); return; }
      push(`>> Opening: ${found.title}`, '#00ff88');
      setTimeout(() => onOpenLog?.(found), 300);
      return;
    }
    push(`>> Unknown command: "${raw.toLowerCase()}". Type HELP for commands.`, '#ff4444');
  };

  const onKey = (e) => {
    if (e.key === 'Enter') { run(input); setInput(''); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const i = Math.min(histIdx+1, history.length-1); setHistIdx(i); setInput(history[i] || ''); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const i = Math.max(histIdx-1, -1); setHistIdx(i); setInput(i < 0 ? '' : history[i] || ''); }
  };

  return (
    <div style={{ borderTop: `1px solid ${accentColor}22`, background:`${accentColor}05` }}>
      {/* Toggle button */}
      <div
        style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'4px 12px', cursor:'pointer',
          borderBottom: open ? `1px solid ${accentColor}18` : 'none',
        }}
        onClick={() => { setOpen(p => !p); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'8px', color:`${accentColor}77`, letterSpacing:'0.12em' }}>
          {termCode}:~$  {!open && input ? input : ''}
        </span>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'7px', color:`${accentColor}44` }}>
          {open ? '▲ CMD' : '▼ CMD'}
        </span>
      </div>

      {open && (
        <div>
          {/* Output */}
          <div ref={outputRef} style={{
            maxHeight:'120px', overflowY:'auto', padding:'6px 12px',
            fontFamily:'Share Tech Mono,monospace', fontSize:'10px', lineHeight:1.7,
          }}>
            {output.length === 0 && (
              <span style={{ color:`${accentColor}44` }}>Type HELP to see available commands.</span>
            )}
            {output.map((l, i) => (
              <div key={i} style={{ color: l.color || accentColor, whiteSpace:'pre-wrap' }}>{l.text}</div>
            ))}
          </div>
          {/* Input row */}
          <div style={{ display:'flex', alignItems:'center', padding:'4px 12px 8px', gap:'6px' }}>
            <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'10px', color:`${accentColor}88`, flexShrink:0 }}>
              {termCode}:~$
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={onKey}
              style={{
                flex:1, background:'transparent', border:'none', outline:'none',
                fontFamily:'Share Tech Mono,monospace', fontSize:'10px',
                color: accentColor, caretColor: accentColor,
              }}
              placeholder="TYPE COMMAND..."
              autoComplete="off" spellCheck={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── History Sidebar ───────────────────────────────────────────────────────────

function HistorySidebar({ history, accentColor, dimColor, onClose, onSelect }) {
  return (
    <div style={{
      position:'absolute', top:0, right:0, bottom:0, width:'280px',
      background:'rgba(0,0,0,0.95)', borderLeft:`1px solid ${accentColor}33`,
      zIndex:100, display:'flex', flexDirection:'column',
      boxShadow:`-8px 0 24px ${accentColor}12`,
      animation:'sidebarIn 0.18s ease-out',
    }}>
      <div style={{
        padding:'12px 14px', borderBottom:`1px solid ${accentColor}22`,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        background:`${accentColor}08`,
      }}>
        <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.65rem', color:accentColor, letterSpacing:'0.2em' }}>
          SESSION HISTORY
        </span>
        <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', color:`${accentColor}88`, fontFamily:'Share Tech Mono,monospace', fontSize:'11px' }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
        {history.length === 0 ? (
          <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'10px', color:`${accentColor}44`, padding:'12px', textAlign:'center' }}>
            No history yet
          </div>
        ) : history.map((entry, i) => (
          <div
            key={i}
            onClick={() => onSelect?.(entry)}
            style={{
              padding:'8px 10px', cursor:'pointer', borderRadius:'2px',
              border:`1px solid transparent`,
              fontFamily:'Share Tech Mono,monospace',
              transition:'all 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background=`${accentColor}10`; e.currentTarget.style.borderColor=`${accentColor}33`; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; }}
          >
            <div style={{ fontSize:'10px', color:accentColor, marginBottom:'2px' }}>{entry.code}</div>
            <div style={{ fontSize:'8px', color:dimColor }}>{entry.name}</div>
            <div style={{ fontSize:'7px', color:`${dimColor}77`, marginTop:'2px' }}>{entry.time}</div>
          </div>
        ))}
      </div>
      <style>{`@keyframes sidebarIn { from{transform:translateX(20px);opacity:0} to{transform:none;opacity:1} }`}</style>
    </div>
  );
}

// ── Terminal OS Desktop ───────────────────────────────────────────────────────

function TerminalOS({ termType, logs, onLogSelect, onBack, sessionHistory }) {
  const theme = TT[termType] || TT.shipboard;
  const { accent: ac, dim: dc } = theme;
  const [clock, setClock] = React.useState(() => new Date().toLocaleTimeString('en-GB'));
  const [showHistory, setShowHistory] = React.useState(false);

  React.useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB')), 1000);
    return () => clearInterval(id);
  }, []);

  const securedCount = logs.filter(l => l.requires_roll || l.requires_password || ['critical','restricted'].includes(l.security_level)).length;

  return (
    <div style={{
      width:'100%', height:'100%', display:'flex', flexDirection:'column',
      border:`1px solid ${ac}44`, boxShadow:`0 0 24px ${ac}18, inset 0 0 40px rgba(0,0,0,0.4)`,
      background:'rgba(0,0,0,0.85)', position:'relative', overflow:'hidden',
    }}>
      {/* ── Title Bar ── */}
      <div style={{
        display:'flex', alignItems:'center', padding:'6px 12px',
        borderBottom:`1px solid ${ac}2a`,
        background:`linear-gradient(180deg, ${ac}12 0%, rgba(0,0,0,0.5) 100%)`,
        flexShrink:0,
      }}>
        {/* Window dots */}
        <div style={{ display:'flex', gap:'6px', marginRight:'12px' }}>
          {[1, 0.5, 0.25].map((o, i) => (
            <div key={i} style={{ width:'10px', height:'10px', borderRadius:'50%', background:ac, opacity:o }} />
          ))}
        </div>
        <div style={{ flex:1, textAlign:'center', fontFamily:'Orbitron,sans-serif', fontSize:'0.65rem', letterSpacing:'0.2em', color:ac, textShadow:`0 0 10px ${ac}44` }}>
          {theme.headerLabel}
        </div>
        <button
          onClick={onBack}
          style={{
            fontFamily:'Share Tech Mono,monospace', fontSize:'0.65rem', letterSpacing:'0.1em',
            padding:'3px 10px', border:`1px solid ${dc}44`, background:'transparent',
            color:dc, cursor:'pointer', transition:'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color=ac; e.currentTarget.style.borderColor=`${ac}88`; e.currentTarget.style.boxShadow=`0 0 8px ${ac}33`; }}
          onMouseLeave={e => { e.currentTarget.style.color=dc; e.currentTarget.style.borderColor=`${dc}44`; e.currentTarget.style.boxShadow='none'; }}
        >
          ✕ DISCONNECT
        </button>
      </div>

      {/* ── Menu Bar ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'4px 12px', borderBottom:`1px solid ${ac}18`, background:`${ac}05`, flexShrink:0,
      }}>
        <div style={{ display:'flex', gap:'16px' }}>
          {['FILE','VIEW','SECURITY','HELP'].map(l => (
            <span key={l} style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'10px', color:dc, letterSpacing:'0.1em', cursor:'default', userSelect:'none' }}>{l}</span>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <NumericDrift color={ac} seed={termType+'freq'} min={1.2} max={4.8} unit="GHz" />
          <Oscilloscope color={ac} width={10} />
          <div style={{ display:'flex', alignItems:'center', gap:'3px' }}>
            <BlinkDot color='#00ff88' rate={900} />
            <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:'7px', color:dc, letterSpacing:'0.08em' }}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ── File Grid ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', position:'relative' }}>
        {logs.length === 0 ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontFamily:'Share Tech Mono,monospace', fontSize:'12px', color:`${dc}88` }}>
            NO FILES FOUND IN DIRECTORY
          </div>
        ) : (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
            {logs.map((log, i) => (
              <div key={log.id} style={{ animation:`fileIn 0.25s ease-out ${i * 0.06}s both` }}>
                <FileIcon log={log} accentColor={ac} dimColor={dc} termCode={termType} onClick={onLogSelect} />
              </div>
            ))}
          </div>
        )}
        {showHistory && (
          <HistorySidebar
            history={sessionHistory || []}
            accentColor={ac}
            dimColor={dc}
            onClose={() => setShowHistory(false)}
            onSelect={() => setShowHistory(false)}
          />
        )}
      </div>

      {/* ── Command Bar ── */}
      <CommandBar
        logs={logs} accentColor={ac} dimColor={dc} termCode={termType.toUpperCase()}
        onOpenLog={onLogSelect} onDisconnect={onBack}
        onHistory={() => setShowHistory(p => !p)}
      />

      {/* ── Taskbar ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'5px 12px', borderTop:`1px solid ${ac}2a`,
        background:`${ac}06`, flexShrink:0, fontFamily:'Share Tech Mono,monospace', fontSize:'10px',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', color:dc }}>
          <span style={{ color:ac }}>{termType.toUpperCase()}</span>
          <span style={{ color:`${dc}66` }}>│</span>
          <span>{logs.length} FILE{logs.length !== 1 ? 'S' : ''}</span>
          {securedCount > 0 && <>
            <span style={{ color:`${dc}66` }}>│</span>
            <span style={{ color:'#ffaa00' }}>🔒 {securedCount}</span>
          </>}
          <span style={{ color:`${dc}66` }}>│</span>
          <span>UPTIME {theme.uptime}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <MiniBar label="CPU" color={ac} seed={termType+'cpu'} fastFlicker={true} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <MiniBar label="MEM" color={ac} seed={termType+'mem'} fastFlicker={false} />
          </div>
          <BlinkDot color={ac} rate={800} />
          <BlinkDot color='#00ff88' rate={1300} />
          <span style={{ color:ac, fontVariantNumeric:'tabular-nums', fontSize:'9px', textShadow:`0 0 6px ${ac}44` }}>{clock}</span>
        </div>
      </div>

      <style>{`
        @keyframes fileIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}

Object.assign(window, { TerminalOS, FileIcon });
