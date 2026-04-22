import { useEffect, useState } from 'react';
import PacketVizCanvas, { PacketVizStyle } from './PacketVizCanvas';

const BOOT_MESSAGES: Record<PacketVizStyle, string[]> = {
  orbital: [
    '>> INITIALIZING SHIPBOARD NETWORK STACK...',
    '>> LINKING SUBSYSTEM: NAVIGATION [NAV].............. OK',
    '>> LINKING SUBSYSTEM: SENSORS [SEN]................. OK',
    '>> LINKING SUBSYSTEM: ENGINEERING [ENG]............. OK',
    '>> LINKING SUBSYSTEM: COMMUNICATIONS [COM].......... OK',
    '>> LINKING SUBSYSTEM: WEAPONS [WPN]................. OK',
    '>> LINKING SUBSYSTEM: LIFE SUPPORT [LSS]............ OK',
    '>> CORE AUTHENTICATION COMPLETE.',
    '>> ESTABLISHING ENCRYPTED CHANNEL...',
    '>> CONNECTION ESTABLISHED. STANDBY.',
  ],
  grid: [
    '>> FUWNET CORPORATE MAINFRAME — SECTOR 7',
    '>> AUTHENTICATING CREDENTIALS...',
    '>> QUERYING SERVER ARRAY: NODE 01-04................ OK',
    '>> QUERYING SERVER ARRAY: NODE 05-08................ OK',
    '>> QUERYING SERVER ARRAY: NODE 09-12................ OK',
    '>> VERIFYING CLEARANCE LEVEL...',
    '>> ACCESS GRANTED — SESSION INITIATED.',
    '>> LOADING FINANCIAL SUBSYSTEMS...',
    '>> SYNCHRONIZING DATABASE INDEX...',
    '>> TERMINAL READY.',
  ],
  secure: [
    '>> IMPERIAL INTELLIGENCE NETWORK — CLASSIFIED',
    '>> INITIATING MULTI-LAYER AUTHENTICATION...',
    '>> AUTH LAYER 1: IDENTITY VERIFICATION......... PASS',
    '>> AUTH LAYER 2: BIOMETRIC CONFIRMATION........ PASS',
    '>> AUTH LAYER 3: CLEARANCE VALIDATION.......... PASS',
    '>> SCANNING FOR INTRUSION SIGNATURES...',
    '>> [WARNING] ELEVATED THREAT LEVEL ACTIVE',
    '>> ENCRYPTED TUNNEL ESTABLISHED.',
    '>> ACCESS LOG ENTRY RECORDED.',
    '>> PROCEED WITH CAUTION. ALL ACTIONS MONITORED.',
  ],
  chaos: [
    '>> C0NNECTING TO R3LAY N0DE...',
    '>> [ERROR] PACKET LOSS 23%... REROUTING...',
    '>> ATTEMPTING NODE 4... TIMEOUT.',
    '>> ATTEMPTING NODE 7... OK',
    '>> [WARNING] UNVERIFIED CERTIFICATE',
    '>> BYPASSING SECURITY LAYER... INJECTING PAYLOAD...',
    '>> [ERROR] DETECTION RISK: ELEVATED',
    '>> ▓▒░ TUNNELING THROUGH PROXY CHAIN ░▒▓',
    '>> ACCESS GRANTED — STAY FAST, STAY QUIET.',
    '>> W3LC0ME T0 TH3 BLACKT4L0N N3TW0RK.',
  ],
};

interface ConnectingScreenProps {
  style?: PacketVizStyle;
  accentColor?: string;
  dimColor?: string;
  bgColor?: string;
  label?: string;
  headerLabel?: string;
  onSkip?: () => void;
  onComplete?: () => void;
}

/**
 * Full-screen packet-visualisation boot animation. Designed to sit between
 * the init / auth step and the terminal desktop view.
 *
 * Press ESC — or call the supplied onSkip — to fast-forward.
 */
export default function ConnectingScreen({
  style = 'orbital',
  accentColor = '#00ccff',
  dimColor = '#004466',
  bgColor = '#000810',
  label = 'TRAVELLER TERMINAL',
  headerLabel = 'SYS // MAINFRAME // OPERATIONS',
  onSkip,
  onComplete,
}: ConnectingScreenProps) {
  const messages = BOOT_MESSAGES[style];
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setVisibleLines(0);
    setProgress(0);
    let line = 0;
    const iv = window.setInterval(() => {
      line++;
      setVisibleLines(line);
      setProgress(Math.round((line / messages.length) * 100));
      if (line >= messages.length) {
        window.clearInterval(iv);
        if (onComplete) window.setTimeout(onComplete, 400);
      }
    }, 320);
    return () => window.clearInterval(iv);
  }, [style, messages.length, onComplete]);

  useEffect(() => {
    if (!onSkip) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onSkip]);

  const lineColor = (msg: string) => {
    if (msg.includes('[ERROR]') || msg.includes('ERROR')) return '#ff4444';
    if (msg.includes('[WARNING]') || msg.includes('WARN')) return '#ffaa00';
    if (msg.includes('OK') || msg.includes('PASS') || msg.includes('GRANTED')) return '#3ae2b3';
    return accentColor;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: bgColor,
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', borderRight: `1px solid ${accentColor}22` }}>
        <PacketVizCanvas style={style} accentColor={accentColor} />
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            color: `${accentColor}66`,
          }}
        >
          {style.toUpperCase()} CONNECTION VISUALIZATION
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 1.5rem',
          background: 'rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.7rem',
              color: accentColor,
              letterSpacing: '0.2em',
              marginBottom: '0.4rem',
              textShadow: `0 0 10px ${accentColor}55`,
            }}
          >
            {headerLabel}
          </div>
          <div
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.65rem',
              color: dimColor,
            }}
          >
            {label}
          </div>
        </div>

        <div
          style={{
            height: '4px',
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}22`,
            borderRadius: '2px',
            marginBottom: '1.5rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})`,
              boxShadow: `0 0 8px ${accentColor}66`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.72rem',
            lineHeight: '1.9',
            overflow: 'hidden',
          }}
        >
          {messages.slice(0, visibleLines).map((msg, i) => (
            <div
              key={i}
              style={{
                color: lineColor(msg),
                opacity: i === visibleLines - 1 ? 1 : 0.65,
                animation: i === visibleLines - 1 ? 'lineIn 0.12s ease-out' : undefined,
                whiteSpace: 'pre',
              }}
            >
              {msg}
            </div>
          ))}
          {visibleLines < messages.length && (
            <span style={{ color: accentColor, animation: 'curBlink 0.8s step-end infinite' }}>█</span>
          )}
        </div>

        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.65rem',
          }}
        >
          <span style={{ color: dimColor }}>{progress}% LOADED</span>
          {onSkip && <span style={{ color: `${dimColor}88` }}>ESC TO SKIP</span>}
        </div>
      </div>

      <style>{`
        @keyframes lineIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:none; } }
        @keyframes curBlink { 0%,49%{ opacity:1; } 50%,100%{ opacity:0; } }
      `}</style>
    </div>
  );
}
