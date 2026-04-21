
// terminal/log-viewer.jsx — Log detail with corrupted text, typewriter, redacted blocks
// Exports: LogViewer

// ── Corrupted character that resolves to real char over time ──────────────────
function GlitchChar({ final, delay, glitchDuration = 900, color, dimColor }) {
  const [display, setDisplay] = React.useState(() => glitchChar());
  const [resolved, setResolved] = React.useState(false);

  React.useEffect(() => {
    if (final === '\n' || final === ' ') { setDisplay(final); setResolved(true); return; }

    const startT = setTimeout(() => {
      // Rapid glitch phase
      let count = 0;
      const maxFlickers = 6 + Math.floor(Math.random() * 6);
      const flickerInterval = setInterval(() => {
        setDisplay(glitchChar());
        count++;
        if (count >= maxFlickers) {
          clearInterval(flickerInterval);
          setDisplay(final);
          setResolved(true);
        }
      }, glitchDuration / maxFlickers);
      return () => clearInterval(flickerInterval);
    }, delay);

    return () => clearTimeout(startT);
  }, [final, delay, glitchDuration]);

  return (
    <span style={{
      color: resolved ? color : dimColor,
      textShadow: resolved ? 'none' : `0 0 6px ${dimColor}88`,
      transition: resolved ? 'color 0.2s ease' : 'none',
      fontFamily: 'inherit',
    }}>
      {display}
    </span>
  );
}

// ── Corrupted paragraph that resolves character by character ─────────────────
function CorruptedText({ text, accentColor, dimColor, glitchLevel = 0.1, onComplete }) {
  const lines = text.split('\n');
  const chars = text.split('');
  const totalChars = chars.length;

  // Stagger delay per char: 0..totalChars * charDelay ms
  const charDelay = Math.max(6, Math.min(20, 2000 / totalChars));
  const totalDuration = totalChars * charDelay + 1000;

  React.useEffect(() => {
    const t = setTimeout(() => onComplete?.(), totalDuration);
    return () => clearTimeout(t);
  }, [totalDuration]);

  let charIdx = 0;
  return (
    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.82rem', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
      {lines.map((line, li) => (
        <React.Fragment key={li}>
          {line.split('').map((ch, ci) => {
            const idx = charIdx++;
            const delay = idx * charDelay;
            const shouldGlitch = glitchLevel > 0 && Math.random() < glitchLevel && ch !== ' ' && ch !== '\n';
            if (shouldGlitch) {
              return <GlitchChar key={ci} final={ch} delay={delay} glitchDuration={500 + Math.random() * 400} color={accentColor} dimColor={dimColor} />;
            }
            return (
              <span key={ci} style={{
                color: accentColor,
                animation: `charReveal 0.06s ease-out ${delay}ms both`,
              }}>{ch}</span>
            );
          })}
          {li < lines.length - 1 && '\n'}
        </React.Fragment>
      ))}
      <style>{`
        @keyframes charReveal { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  );
}

// ── Shared DiceRoller widget — used by both RedactedBlock and LogViewer ───────
// mode: 'auto' (computer rolls) | 'manual' (player types physical dice result)
function DiceRoller({ difficulty, skill, accentColor, dimColor, onResult, onCancel, compact = false }) {
  const [mode, setMode] = React.useState('choose'); // choose | auto-rolling | auto-done | manual-input | manual-done
  const [rollVal, setRollVal] = React.useState(null);
  const [manualInput, setManualInput] = React.useState('');
  const [manualError, setManualError] = React.useState('');
  const [success, setSuccess] = React.useState(null);
  const inputRef = React.useRef(null);

  const settle = (val) => {
    const ok = val >= difficulty;
    setRollVal(val);
    setSuccess(ok);
    setTimeout(() => onResult?.({ value: val, success: ok }), ok ? 700 : 900);
  };

  const runAuto = () => {
    setMode('auto-rolling');
    setRollVal(null);
    let count = 0;
    const iv = setInterval(() => {
      setRollVal(Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 14) {
        clearInterval(iv);
        const final = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
        setMode('auto-done');
        settle(final);
      }
    }, 80);
  };

  const submitManual = () => {
    const n = parseInt(manualInput, 10);
    if (isNaN(n) || n < 2 || n > 12) {
      setManualError('Enter a value between 2 and 12');
      return;
    }
    setManualError('');
    setMode('manual-done');
    settle(n);
  };

  // ── Choose mode ──
  if (mode === 'choose') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!compact && (
          <div style={{
            border: `1px solid ${accentColor}28`, padding: '12px 14px',
            background: `${accentColor}06`, fontFamily: 'Share Tech Mono, monospace',
          }}>
            <div style={{ color: dimColor, fontSize: '0.65rem', marginBottom: '3px', letterSpacing: '0.1em' }}>SKILL CHECK REQUIRED</div>
            <div style={{ color: accentColor, fontSize: '0.85rem', marginBottom: '6px' }}>{skill || 'Electronics (Computers)'}</div>
            <div style={{ color: '#ffaa00', fontSize: '0.7rem' }}>TARGET: {difficulty}+ on 2D6</div>
          </div>
        )}
        {compact && (
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', color: '#ffaa00' }}>
            ⚡ {skill || 'Electronics (Computers)'} — {difficulty}+ on 2D6
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={runAuto} style={btnStyle(accentColor)}>
            ⚡ ROLL AUTO (2D6)
          </button>
          <button onClick={() => { setMode('manual-input'); setTimeout(() => inputRef.current?.focus(), 50); }}
            style={btnStyle(accentColor, true)}>
            ✎ ENTER MANUAL ROLL
          </button>
          {onCancel && (
            <button onClick={onCancel} style={btnStyleCancel(dimColor)}>BACK</button>
          )}
        </div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: `${dimColor}66`, letterSpacing: '0.06em' }}>
          Manual roll: use physical dice at the table and enter your result
        </div>
      </div>
    );
  }

  // ── Manual input mode ──
  if (mode === 'manual-input') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '340px' }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', color: '#ffaa00' }}>
          ✎ ENTER YOUR 2D6 ROLL RESULT
        </div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: `${dimColor}99` }}>
          Target: <span style={{ color: '#ffaa00' }}>{difficulty}+</span> &nbsp;·&nbsp; Range: 2–12
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Stepper buttons */}
          <button
            onClick={() => setManualInput(v => String(Math.max(2, (parseInt(v) || 2) - 1)))}
            style={{ ...btnStyleSmall(accentColor), minWidth: '32px', fontSize: '1rem', padding: '4px 10px' }}
          >−</button>
          <input
            ref={inputRef}
            type="number" min="2" max="12"
            value={manualInput}
            onChange={e => { setManualInput(e.target.value); setManualError(''); }}
            onKeyDown={e => e.key === 'Enter' && submitManual()}
            placeholder="—"
            style={{
              width: '72px', textAlign: 'center',
              background: 'rgba(0,0,0,0.7)', border: `1px solid ${accentColor}55`,
              color: accentColor, fontFamily: 'Orbitron, sans-serif', fontSize: '1.4rem',
              padding: '6px 8px', outline: 'none', fontWeight: 900,
              textShadow: manualInput ? `0 0 12px ${accentColor}88` : 'none',
              MozAppearance: 'textfield',
            }}
          />
          <button
            onClick={() => setManualInput(v => String(Math.min(12, (parseInt(v) || 1) + 1)))}
            style={{ ...btnStyleSmall(accentColor), minWidth: '32px', fontSize: '1rem', padding: '4px 10px' }}
          >+</button>
          <button onClick={submitManual} style={{ ...btnStyle(accentColor), marginLeft: '4px' }}>
            CONFIRM
          </button>
        </div>
        {manualError && (
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: '#ff4444' }}>
            {manualError}
          </div>
        )}
        <button onClick={() => setMode('choose')} style={{ ...btnStyleCancel(dimColor), alignSelf: 'flex-start' }}>← BACK</button>
      </div>
    );
  }

  // ── Rolling / done ──
  const isRolling = mode === 'auto-rolling';
  const isDone = mode === 'auto-done' || mode === 'manual-done';
  const isManualDone = mode === 'manual-done';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: compact ? 'flex-start' : 'center', gap: '8px' }}>
      {/* Big dice value */}
      <div style={{
        fontFamily: 'Orbitron, sans-serif', fontSize: compact ? '1.8rem' : '2.8rem', fontWeight: 900,
        color: isRolling ? '#ffaa00' : success ? '#00ff88' : '#ff4444',
        textShadow: `0 0 20px currentColor`,
        animation: isRolling ? 'diceRollAnim 0.09s ease-in-out infinite' : 'diceSettleAnim 0.35s ease-out',
        minWidth: '48px', textAlign: 'center',
      }}>
        {rollVal ?? '?'}
      </div>
      {isDone && (
        <div style={{
          fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem',
          color: success ? '#00ff88' : '#ff4444',
          animation: 'resultSlideIn 0.25s ease-out',
          display: 'flex', flexDirection: 'column', alignItems: compact ? 'flex-start' : 'center', gap: '3px',
        }}>
          <span>{success ? '✓ SUCCESS — ACCESS GRANTED' : '✗ FAILED — ACCESS DENIED'}</span>
          <span style={{ fontSize: '0.6rem', color: `${success ? '#00ff88' : '#ff4444'}88` }}>
            {isManualDone ? `Manual roll: ${rollVal}` : `Rolled: ${rollVal}`} vs target {difficulty}+
          </span>
        </div>
      )}
      <style>{`
        @keyframes diceRollAnim  { 0%{transform:rotate(-9deg)scale(1.06)} 100%{transform:rotate(9deg)scale(0.94)} }
        @keyframes diceSettleAnim{ from{transform:scale(1.35);opacity:0.4} to{transform:scale(1);opacity:1} }
        @keyframes resultSlideIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}

// Tiny style helpers to keep JSX clean
const btnStyle = (color, ghost = false) => ({
  fontFamily: 'Share Tech Mono, monospace', fontSize: '0.68rem', padding: '8px 14px',
  border: `1px solid ${color}${ghost ? '44' : '66'}`,
  background: ghost ? 'transparent' : `${color}14`,
  color, cursor: 'pointer', letterSpacing: '0.08em', transition: 'all 0.15s',
  whiteSpace: 'nowrap',
});
const btnStyleSmall = (color) => ({
  fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', padding: '6px 8px',
  border: `1px solid ${color}44`, background: 'transparent',
  color, cursor: 'pointer', transition: 'all 0.15s',
});
const btnStyleCancel = (color) => ({
  fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', padding: '6px 12px',
  border: `1px solid ${color}33`, background: 'transparent',
  color: `${color}bb`, cursor: 'pointer', transition: 'all 0.15s',
});

// ── Redacted block ████ with decrypt attempt ──────────────────────────────────
function RedactedBlock({ text, difficulty, accentColor, dimColor }) {
  const [phase, setPhase] = React.useState('locked'); // locked | rolling | unlocked | failed
  const [showRoller, setShowRoller] = React.useState(false);

  if (phase === 'unlocked') {
    return (
      <span style={{
        color: '#00ff88', background: 'rgba(0,255,136,0.08)',
        border: '1px solid rgba(0,255,136,0.3)', padding: '0 4px', borderRadius: '2px',
        fontFamily: 'Share Tech Mono, monospace', fontSize: '0.82rem',
        textShadow: '0 0 8px rgba(0,255,136,0.5)',
        animation: 'decryptReveal 0.4s ease-out',
      }}>
        {text}
        <style>{`@keyframes decryptReveal { from{opacity:0;filter:brightness(3)} to{opacity:1;filter:brightness(1)} }`}</style>
      </span>
    );
  }

  if (phase === 'failed') {
    return (
      <span style={{ color: '#ff4444', fontFamily: 'Share Tech Mono, monospace' }}>
        {'█'.repeat(Math.max(4, text.length))}
        <span style={{ fontSize: '0.6rem', color: '#ff444466', marginLeft: '4px' }}>[DECRYPT FAILED]</span>
      </span>
    );
  }

  // Inline roller — shown as a small floating panel below the redacted span
  if (showRoller) {
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px', verticalAlign: 'top' }}>
        <span style={{ color: '#ff6600', fontFamily: 'Share Tech Mono, monospace', animation: 'redactFlicker 0.9s ease-in-out infinite' }}>
          {'█'.repeat(Math.max(4, text.length))}
        </span>
        <span style={{
          display: 'inline-flex', flexDirection: 'column', padding: '8px 10px', gap: '6px',
          border: '1px solid #ffaa0033', background: 'rgba(0,0,0,0.92)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        }}>
          <DiceRoller
            difficulty={difficulty}
            skill="Electronics (Computers)"
            accentColor={accentColor}
            dimColor={dimColor}
            compact={true}
            onResult={({ success }) => {
              setShowRoller(false);
              setPhase(success ? 'unlocked' : 'failed');
            }}
            onCancel={() => setShowRoller(false)}
          />
        </span>
        <style>{`@keyframes redactFlicker { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
      </span>
    );
  }

  return (
    <span
      onClick={() => setShowRoller(true)}
      title={`Click to attempt decrypt — Electronics (Computers) ${difficulty}+`}
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', userSelect: 'none' }}
    >
      <span style={{
        color: '#ff6600', fontFamily: 'Share Tech Mono, monospace',
        textShadow: '0 0 8px #ff660066',
        transition: 'color 0.15s, text-shadow 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ffaa00'; e.currentTarget.style.textShadow = '0 0 10px #ffaa0077'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#ff6600'; e.currentTarget.style.textShadow = '0 0 8px #ff660066'; }}
      >
        {'█'.repeat(Math.max(4, text.length))}
      </span>
      <span style={{
        fontSize: '0.58rem', color: '#ffaa0077', fontFamily: 'Share Tech Mono, monospace',
        border: '1px solid #ffaa0022', padding: '1px 4px', borderRadius: '2px', whiteSpace: 'nowrap',
      }}>
        ⚡{difficulty}+ DECRYPT
      </span>
    </span>
  );
}

// ── Parse content into segments (text / redacted blocks) ─────────────────────
function parseContent(content, difficulty, accentColor, dimColor) {
  // Find ████ blocks and REDACTED patterns
  const parts = [];
  const re = /█+|\[REDACTED[^\]]*\]/g;
  let last = 0;
  let match;
  while ((match = re.exec(content)) !== null) {
    if (match.index > last) parts.push({ type: 'text', value: content.slice(last, match.index) });
    parts.push({ type: 'redacted', value: match[0].replace(/\[REDACTED[^\]]*\]/g, '[CLASSIFIED DATA]') });
    last = match.index + match[0].length;
  }
  if (last < content.length) parts.push({ type: 'text', value: content.slice(last) });
  return parts;
}

// ── Full Log Viewer ───────────────────────────────────────────────────────────
function LogViewer({ log, termType, onBack }) {
  const theme = TT[termType] || TT.shipboard;
  const { accent: ac, dim: dc } = theme;
  const [showContent, setShowContent] = React.useState(false);
  const [needsAuth, setNeedsAuth] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [needsRoll, setNeedsRoll] = React.useState(false);
  const [rollResult, setRollResult] = React.useState(null); // null | { value, success }

  React.useEffect(() => {
    setShowContent(false); setNeedsAuth(false);
    setPasswordInput(''); setPasswordError('');
    setNeedsRoll(false); setRollResult(null);

    if (log.requires_password) { setNeedsAuth(true); return; }
    if (log.requires_roll && !log.requires_password) { setNeedsRoll(true); return; }

    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, [log.id]);

  const tryPassword = (pw) => {
    if (pw.trim().length >= 1) {
      setNeedsAuth(false);
      // After password, check if roll is also needed
      if (log.requires_roll) { setNeedsRoll(true); } else { setShowContent(true); }
    } else {
      setPasswordError('>> ACCESS DENIED — INCORRECT PASSWORD');
    }
  };

  const handleRollResult = ({ success, value }) => {
    setRollResult({ value, success });
    setNeedsRoll(false);
    if (success) setTimeout(() => setShowContent(true), 700);
  };

  const secColors = { standard: ac, high: '#ffaa00', restricted: '#ff6600', critical: '#ff3344' };
  const secColor = secColors[log.security_level] || ac;
  const difficulty = log.roll_check?.difficulty || 8;
  const contentParts = React.useMemo(() => parseContent(log.content || '', difficulty, ac, dc), [log.content, difficulty]);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      border: `1px solid ${ac}33`, background: 'rgba(0,0,0,0.9)',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px', borderBottom: `1px solid ${ac}22`,
        background: `linear-gradient(180deg, ${ac}0c 0%, transparent 100%)`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '0.75rem', fontWeight: 700,
              color: secColor, letterSpacing: '0.12em', textTransform: 'uppercase',
              textShadow: `0 0 12px ${secColor}44`, marginBottom: '4px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{log.title}</div>
            <div style={{ display: 'flex', gap: '12px', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: dc }}>
              {log.author && <span>{log.author}</span>}
              {log.date && <span>{log.date}</span>}
              <span style={{ color: secColor }}>[ {log.security_level?.toUpperCase() || 'STANDARD'} ]</span>
            </div>
          </div>
          <button
            onClick={onBack}
            style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem',
              padding: '4px 10px', border: `1px solid ${dc}44`,
              background: 'transparent', color: dc, cursor: 'pointer', flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = ac; e.currentTarget.style.borderColor = `${ac}66`; }}
            onMouseLeave={e => { e.currentTarget.style.color = dc; e.currentTarget.style.borderColor = `${dc}44`; }}
          >
            ← BACK
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* PASSWORD AUTH */}
        {needsAuth && (
          <div style={{ maxWidth: '420px' }}>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', color: '#ffaa00', marginBottom: '16px' }}>
              🔒 THIS FILE REQUIRES PASSWORD AUTHENTICATION
            </div>
            <input
              type="password"
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
              onKeyDown={e => e.key === 'Enter' && tryPassword(passwordInput)}
              placeholder="ENTER PASSWORD..."
              autoFocus
              style={{
                width: '100%', background: 'rgba(0,0,0,0.7)', border: `1px solid ${ac}55`,
                color: ac, fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem',
                padding: '10px 14px', outline: 'none', letterSpacing: '0.1em',
                boxSizing: 'border-box',
              }}
            />
            {passwordError && (
              <div style={{ color: '#ff4444', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', marginTop: '8px' }}>
                {passwordError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => tryPassword(passwordInput)}
                style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', padding: '8px 16px',
                  border: `1px solid ${ac}66`, background: `${ac}14`, color: ac, cursor: 'pointer',
                }}
              >AUTHENTICATE</button>
              <button
                onClick={onBack}
                style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', padding: '8px 16px',
                  border: `1px solid ${dc}44`, background: 'transparent', color: dc, cursor: 'pointer',
                }}
              >CANCEL</button>
            </div>
            <div style={{ marginTop: '10px', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: `${dc}77` }}>
              DEMO: type anything and press Enter / AUTHENTICATE
            </div>
          </div>
        )}

        {/* ROLL CHECK */}
        {needsRoll && !showContent && (
          <div style={{ maxWidth: '480px' }}>
            <DiceRoller
              difficulty={difficulty}
              skill={log.roll_check?.skill || 'Electronics (Computers)'}
              accentColor={ac}
              dimColor={dc}
              onResult={handleRollResult}
              onCancel={onBack}
            />
          </div>
        )}

        {/* ROLL FAILED — show result + retry or back */}
        {rollResult && !rollResult.success && !showContent && !needsRoll && (
          <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: '2.8rem', fontWeight: 900,
                color: '#ff4444', textShadow: '0 0 20px #ff4444',
                animation: 'diceSettleAnim 0.35s ease-out',
              }}>{rollResult.value}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', color: '#ff4444', marginTop: '6px' }}>
                ✗ FAILED — ACCESS DENIED
              </div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: '#ff444477', marginTop: '3px' }}>
                Rolled {rollResult.value} vs target {difficulty}+
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setRollResult(null); setNeedsRoll(true); }}
                style={btnStyle(ac)}
              >⚡ RETRY ROLL</button>
              <button onClick={onBack} style={btnStyleCancel(dc)}>← BACK TO TERMINAL</button>
            </div>
            <style>{`@keyframes diceSettleAnim{ from{transform:scale(1.35);opacity:0.4} to{transform:scale(1);opacity:1} }`}</style>
          </div>
        )}

        {/* CONTENT */}
        {showContent && (
          <div style={{ animation: 'contentIn 0.2s ease-out' }}>
            {/* Render content parts with redacted blocks */}
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.82rem', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
              {contentParts.map((part, i) => {
                if (part.type === 'redacted') {
                  return (
                    <RedactedBlock
                      key={i}
                      text={part.value}
                      difficulty={difficulty}
                      accentColor={ac}
                      dimColor={dc}
                    />
                  );
                }
                return (
                  <CorruptedText
                    key={i}
                    text={part.value}
                    accentColor={ac}
                    dimColor={dc}
                    glitchLevel={theme.glitchLevel}
                  />
                );
              })}
            </div>

            {/* Metadata footer */}
            <div style={{
              marginTop: '24px', paddingTop: '12px', borderTop: `1px solid ${ac}18`,
              fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem',
              color: `${dc}88`, display: 'flex', flexWrap: 'wrap', gap: '16px',
            }}>
              {log.author && <span>AUTHOR: {log.author}</span>}
              {log.date && <span>DATE: {log.date}</span>}
              <span>TERMINAL: {termType.toUpperCase()}</span>
              <span>FILE SIZE: {fakeFileSize(termType + log.title)}</span>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes contentIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}

Object.assign(window, { LogViewer, CorruptedText, RedactedBlock });
