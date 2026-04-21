
// terminal/app.jsx — Main app state machine, init screen, tweaks panel
// Mounts the full prototype

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "termType": "shipboard",
  "crtEnabled": true,
  "glitchEnabled": true,
  "particleEnabled": true,
  "idleTimeout": 12000
}/*EDITMODE-END*/;

// ── Init Screen with command-line interface ───────────────────────────────────

function InitScreen({ onConnect, onAccessDenied, defaultType }) {
  const [input, setInput] = React.useState('');
  const [lines, setLines] = React.useState([
    { text: 'TRAVELLER TERMINAL MAINFRAME v5.0', color: '#00ff00' },
    { text: 'Eclipse Shard Saga — Operational Interface', color: '#00aa0099' },
    { text: '────────────────────────────────────────────', color: '#00ff0033' },
    { text: 'Type HELP for available commands.', color: '#00aa0088' },
    { text: '', color: '' },
  ]);
  const [cmdHistory, setCmdHistory] = React.useState([]);
  const [histIdx, setHistIdx] = React.useState(-1);
  const [shaking, setShaking] = React.useState(false);
  const inputRef = React.useRef(null);
  const outputRef = React.useRef(null);

  const push = (text, color = '#00aa00') => {
    setLines(prev => [...prev, { text, color }].slice(-80));
    setTimeout(() => {
      if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, 20);
  };

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
    onAccessDenied();
  };

  const run = (raw) => {
    const cmd = raw.trim().toUpperCase();
    if (!cmd) return;

    const theme = TT[defaultType] || TT.shipboard;
    push(`SHARD://$ ${raw}`, `${theme.accent}88`);
    setCmdHistory(h => [raw, ...h.slice(0, 24)]);
    setHistIdx(-1);

    const parts = cmd.split(/\s+/);
    const verb = parts[0];

    if (verb === 'HELP') {
      push('');
      push('AVAILABLE COMMANDS:', '#00ccff');
      [
        '  connect <code>   — connect to a terminal by access code',
        '  ls               — list all known terminal codes',
        '  history          — show recently used codes',
        '  clear            — clear the screen',
        '  help             — show this message',
        '',
        'KNOWN ACCESS CODES:',
        '  VANAGANDR001     — Vanagandr Shipboard Systems',
        '  FUWNET           — Fuwnet Corporate Mainframe',
        '  ES1-GAMMA        — Imperial Intelligence Network',
        '  BLACKTALON       — Blacktalon Criminal Relay',
      ].forEach(l => push(l, l.startsWith(' ') ? '#00aa0099' : '#00ccff'));
      return;
    }

    if (verb === 'CLEAR') { setLines([]); return; }

    if (verb === 'LS' || verb === 'DIR') {
      push('');
      push('KNOWN TERMINAL NODES:', '#00ccff');
      Object.entries(TERMINAL_CODES).forEach(([code, type]) => {
        const t = TT[type];
        push(`  [${code.padEnd(14)}]  ${t?.label || type}`, '#00aa0099');
      });
      return;
    }

    if (verb === 'HISTORY') {
      if (cmdHistory.length === 0) { push('No history.', '#00aa0066'); return; }
      push('RECENT COMMANDS:', '#00ccff');
      cmdHistory.slice(0, 10).forEach(c => push(`  ${c}`, '#00aa0088'));
      return;
    }

    if (verb === 'CONNECT') {
      const code = parts[1] || '';
      if (!code) { push('Usage: connect <code>', '#ff4444'); return; }
      const type = TERMINAL_CODES[code];
      if (!type) {
        push(`>> ACCESS DENIED — UNKNOWN CODE: ${code}`, '#ff4444');
        push('>> CONNECTION REFUSED', '#ff444488');
        shake();
        return;
      }
      push(`>> AUTHENTICATING ${code}...`, TT[type]?.accent || '#00ff00');
      setTimeout(() => onConnect(type, code), 400);
      return;
    }

    // Try as direct code
    const type = TERMINAL_CODES[cmd];
    if (type) {
      push(`>> AUTHENTICATING ${cmd}...`, TT[type]?.accent || '#00ff00');
      setTimeout(() => onConnect(type, cmd), 400);
      return;
    }

    push(`>> UNKNOWN COMMAND: "${raw.toLowerCase()}". Type HELP.`, '#ff4444');
    shake();
  };

  const onKey = (e) => {
    if (e.key === 'Enter') { run(input); setInput(''); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(i); setInput(cmdHistory[i] || '');
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = Math.max(histIdx - 1, -1);
      setHistIdx(i); setInput(i < 0 ? '' : cmdHistory[i] || '');
    }
  };

  const theme = TT[defaultType] || TT.shipboard;

  // Quick-connect buttons for each terminal type
  const quickCodes = [
    { code: 'VANAGANDR001', type: 'shipboard' },
    { code: 'FUWNET', type: 'corporate' },
    { code: 'ES1-GAMMA', type: 'government' },
    { code: 'BLACKTALON', type: 'criminal' },
  ];

  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(0,255,0,0.04) 0%, #000 70%)',
        padding: '24px',
        animation: shaking ? 'screenShake 0.35s ease-in-out' : 'none',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.4em', color: '#00ff00', textShadow: '0 0 20px rgba(0,255,0,0.4)', textTransform: 'uppercase' }}>
            TRAVELLER TERMINAL
          </div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#00aa0077', letterSpacing: '0.2em', marginTop: '4px' }}>
            ECLIPSE SHARD SAGA — MAINFRAME INTERFACE v5.0
          </div>
        </div>

        {/* Terminal window */}
        <div style={{
          border: '1px solid rgba(0,255,0,0.25)', background: 'rgba(0,0,0,0.85)',
          boxShadow: '0 0 24px rgba(0,255,0,0.08), inset 0 0 40px rgba(0,0,0,0.4)',
        }}>
          {/* Title bar */}
          <div style={{
            display: 'flex', alignItems: 'center', padding: '6px 12px',
            borderBottom: '1px solid rgba(0,255,0,0.15)',
            background: 'linear-gradient(180deg, rgba(0,255,0,0.08) 0%, transparent 100%)',
          }}>
            <div style={{ display: 'flex', gap: '6px', marginRight: '10px' }}>
              {[1, 0.5, 0.25].map((o, i) => (
                <div key={i} style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#00ff00', opacity: o }} />
              ))}
            </div>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'rgba(0,255,0,0.5)', flex: 1, textAlign: 'center', letterSpacing: '0.15em' }}>
              SHARD://MAINFRAME/ACCESS
            </span>
          </div>

          {/* Output area */}
          <div
            ref={outputRef}
            style={{
              height: '260px', overflowY: 'auto', padding: '12px 14px',
              fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', lineHeight: 1.8,
            }}
          >
            {lines.map((l, i) => (
              <div key={i} style={{ color: l.color || 'rgba(0,255,0,0.7)', whiteSpace: 'pre-wrap' }}>{l.text}</div>
            ))}
          </div>

          {/* Input row */}
          <div style={{
            display: 'flex', alignItems: 'center', padding: '8px 14px',
            borderTop: '1px solid rgba(0,255,0,0.12)', gap: '8px',
            background: 'rgba(0,255,0,0.03)',
          }}>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', color: 'rgba(0,255,0,0.6)', flexShrink: 0 }}>
              SHARD://$ 
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={onKey}
              autoFocus
              autoComplete="off" spellCheck={false}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem',
                color: '#00ff00', caretColor: '#00ff00', letterSpacing: '0.08em',
              }}
              placeholder="TYPE COMMAND OR ACCESS CODE..."
            />
          </div>
        </div>

        {/* Quick-connect buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {quickCodes.map(({ code, type }) => {
            const t = TT[type];
            return (
              <button
                key={code}
                onClick={() => { push(`SHARD://$ CONNECT ${code}`, `${t.accent}88`); setTimeout(() => onConnect(type, code), 300); }}
                style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem',
                  padding: '8px 6px', letterSpacing: '0.08em', cursor: 'pointer',
                  border: `1px solid ${t.accent}44`, background: `${t.accent}0a`,
                  color: t.accent, textTransform: 'uppercase',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${t.accent}18`; e.currentTarget.style.boxShadow = `0 0 12px ${t.accent}22`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${t.accent}0a`; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '0.55rem', color: `${t.accent}88`, marginBottom: '2px' }}>{t.name}</div>
                {code}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tweaks Panel ──────────────────────────────────────────────────────────────

function TweaksPanel({ tweaks, onChange }) {
  return (
    <div style={{
      position: 'fixed', bottom: '16px', right: '16px', zIndex: 9000,
      width: '220px', background: 'rgba(0,0,0,0.95)',
      border: '1px solid rgba(0,255,0,0.3)', padding: '14px',
      fontFamily: 'Share Tech Mono, monospace', fontSize: '11px',
      boxShadow: '0 0 24px rgba(0,255,0,0.1)',
      animation: 'tweakIn 0.15s ease-out',
    }}>
      <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: '#00ff00', letterSpacing: '0.2em', marginBottom: '12px' }}>
        TWEAKS
      </div>

      {/* Terminal type */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: 'rgba(0,255,0,0.5)', fontSize: '9px', letterSpacing: '0.1em', marginBottom: '6px' }}>TERMINAL TYPE</div>
        {Object.values(TT).map(t => (
          <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '3px 0', cursor: 'pointer' }}>
            <input type="radio" name="termType" value={t.id} checked={tweaks.termType === t.id}
              onChange={() => onChange({ ...tweaks, termType: t.id })}
              style={{ accentColor: t.accent }} />
            <span style={{ color: tweaks.termType === t.id ? t.accent : 'rgba(0,255,0,0.5)', fontSize: '10px', transition: 'color 0.15s' }}>
              {t.name}
            </span>
            <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: t.accent, opacity: tweaks.termType === t.id ? 1 : 0.2 }} />
          </label>
        ))}
      </div>

      {/* Toggles */}
      {[
        { key: 'crtEnabled', label: 'CRT SCANLINES' },
        { key: 'glitchEnabled', label: 'GLITCH FX' },
        { key: 'particleEnabled', label: 'DATA STREAM BG' },
      ].map(({ key, label }) => (
        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0', cursor: 'pointer' }}>
          <input type="checkbox" checked={tweaks[key]} onChange={() => onChange({ ...tweaks, [key]: !tweaks[key] })}
            style={{ accentColor: '#00ff00' }} />
          <span style={{ color: tweaks[key] ? '#00ff00' : 'rgba(0,255,0,0.4)', fontSize: '10px', transition: 'color 0.15s' }}>
            {label}
          </span>
        </label>
      ))}

      {/* Idle timer */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ color: 'rgba(0,255,0,0.5)', fontSize: '9px', letterSpacing: '0.1em', marginBottom: '4px' }}>
          SCREENSAVER: {tweaks.idleTimeout / 1000}s
        </div>
        <input
          type="range" min="5000" max="30000" step="1000" value={tweaks.idleTimeout}
          onChange={e => onChange({ ...tweaks, idleTimeout: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#00ff00' }}
        />
      </div>

      <style>{`@keyframes tweakIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }`}</style>
    </div>
  );
}

// ── CRT Overlay ───────────────────────────────────────────────────────────────

function CRTOverlay({ enabled, accentColor }) {
  if (!enabled) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9500,
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, ${accentColor}06 2px, ${accentColor}06 4px)`,
        animation: 'crtScroll 8s linear infinite',
      }} />
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.28) 100%)',
      }} />
      <style>{`@keyframes crtScroll { from{background-position-y:0} to{background-position-y:4px} }`}</style>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

function App() {
  const [tweaks, setTweaks] = React.useState({ ...TWEAK_DEFAULTS });
  const [tweaksVisible, setTweaksVisible] = React.useState(false);
  const [view, setView] = React.useState('init');         // init | connecting | terminal | log
  const [connectedType, setConnectedType] = React.useState('shipboard');
  const [selectedLog, setSelectedLog] = React.useState(null);
  const [showScreensaver, setShowScreensaver] = React.useState(false);
  const [showDenied, setShowDenied] = React.useState(false);
  const [sessionHistory, setSessionHistory] = React.useState([]);
  const idleRef = React.useRef(null);

  const theme = TT[tweaks.termType] || TT.shipboard;

  // Idle screensaver — only on init view
  React.useEffect(() => {
    if (view !== 'init') { clearTimeout(idleRef.current); return; }
    const reset = () => {
      clearTimeout(idleRef.current);
      if (showScreensaver) return;
      idleRef.current = setTimeout(() => setShowScreensaver(true), tweaks.idleTimeout);
    };
    const events = ['keydown', 'mousemove', 'click', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset));
    reset();
    return () => { events.forEach(e => window.removeEventListener(e, reset)); clearTimeout(idleRef.current); };
  }, [view, tweaks.idleTimeout, showScreensaver]);

  // Tweaks toggle listener
  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksVisible(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleTweakChange = (newTweaks) => {
    setTweaks(newTweaks);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: newTweaks }, '*');
  };

  const handleConnect = (type, code) => {
    setConnectedType(type);
    setView('connecting');
    // Record in session history
    const t = TT[type];
    const entry = { code, name: t?.label || type, time: new Date().toLocaleTimeString() };
    setSessionHistory(prev => [entry, ...prev.slice(0, 19)]);
    // Auto-advance to terminal after boot animation
    setTimeout(() => setView('terminal'), 4200);
  };

  const handleLogSelect = (log) => {
    setSelectedLog(log);
    setView('log');
  };

  const handleBackToTerminal = () => {
    setSelectedLog(null);
    setView('terminal');
  };

  const handleDisconnect = () => {
    setSelectedLog(null);
    setConnectedType('shipboard');
    setView('init');
  };

  const handleAccessDenied = () => {
    setShowDenied(true);
  };

  const activeTheme = TT[connectedType] || TT.shipboard;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: view === 'init' ? '#000' : activeTheme.bg,
      overflow: 'hidden',
    }}>
      {/* Particle background */}
      {tweaks.particleEnabled && view === 'init' && (
        <DataStreamBg accentColor="#00ff00" />
      )}
      {tweaks.particleEnabled && view !== 'init' && view !== 'connecting' && (
        <DataStreamBg accentColor={activeTheme.accent} />
      )}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {view === 'init' && (
          <InitScreen
            onConnect={handleConnect}
            onAccessDenied={handleAccessDenied}
            defaultType={tweaks.termType}
          />
        )}

        {view === 'connecting' && (
          <ConnectingScreen
            termType={connectedType}
            onSkip={() => setView('terminal')}
          />
        )}

        {view === 'terminal' && (
          <div style={{ width: '100%', height: '100%', padding: '12px' }}>
            <TerminalOS
              termType={connectedType}
              logs={LOGS[connectedType] || []}
              onLogSelect={handleLogSelect}
              onBack={handleDisconnect}
              sessionHistory={sessionHistory}
            />
          </div>
        )}

        {view === 'log' && selectedLog && (
          <div style={{ width: '100%', height: '100%', padding: '12px' }}>
            <LogViewer
              log={selectedLog}
              termType={connectedType}
              onBack={handleBackToTerminal}
            />
          </div>
        )}
      </div>

      {/* CRT overlay */}
      <CRTOverlay enabled={tweaks.crtEnabled} accentColor={view === 'init' ? '#00ff00' : activeTheme.accent} />

      {/* Matrix screensaver */}
      {showScreensaver && (
        <BuilderScreensaver
          onDismiss={() => setShowScreensaver(false)}
        />
      )}

      {/* Access denied flash */}
      {showDenied && (
        <AccessDeniedFlash onComplete={() => setShowDenied(false)} />
      )}

      {/* Tweaks panel */}
      {tweaksVisible && (
        <TweaksPanel tweaks={tweaks} onChange={handleTweakChange} />
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(0,255,0,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,0,0.25); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,255,0,0.45); }
      `}</style>
    </div>
  );
}

// Mount
const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}
