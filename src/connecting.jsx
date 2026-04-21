
// terminal/connecting.jsx — Packet visualization connecting screen (4 styles)
// Exports: PacketVizCanvas, ConnectingScreen

// ── Node/edge layout builders ─────────────────────────────────────────────────

function buildOrbital(w, h) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.31;
  const nodes = [{ x: cx, y: cy, label: 'CORE', main: true }];
  ['NAV','SEN','ENG','COM','WPN','LSS'].forEach((l, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    nodes.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), label: l });
  });
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,2],[3,4],[5,6]];
  return { nodes, edges };
}

function buildGrid(w, h) {
  const nodes = [], edges = [];
  const cols = 4, rows = 3;
  const xStep = w * 0.65 / (cols - 1), yStep = h * 0.6 / (rows - 1);
  const ox = (w - xStep * (cols - 1)) / 2, oy = (h - yStep * (rows - 1)) / 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    nodes.push({ x: ox + c * xStep, y: oy + r * yStep, label: `S${String(r * cols + c + 1).padStart(2,'0')}` });
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols - 1; c++) edges.push([r * cols + c, r * cols + c + 1]);
  for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols; c++) edges.push([r * cols + c, (r + 1) * cols + c]);
  return { nodes, edges };
}

function buildSecure(w, h) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.31;
  const nodes = [{ x: cx, y: cy, label: 'AUTH', main: true }];
  [0, 1, 2, 3, 4].forEach((i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    nodes.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), label: `N${i + 1}` });
  });
  return { nodes, edges: [[0,1],[0,2],[0,3],[0,4],[0,5]] };
}

function buildChaos(w, h) {
  const positions = [[.15,.2],[.78,.12],[.88,.6],[.62,.88],[.22,.82],[.06,.55],[.42,.42],[.72,.38]];
  const nodes = positions.map(([rx, ry], i) => ({ x: rx * w, y: ry * h, label: `R${i+1}`, alive: true }));
  const edges = [[0,2],[0,6],[1,2],[1,7],[2,3],[2,7],[3,4],[4,5],[5,0],[6,7],[6,3],[7,1]];
  return { nodes, edges };
}

// ── Draw helpers ──────────────────────────────────────────────────────────────

function drawHexGrid(ctx, w, h, color) {
  const size = 28, row = size * Math.sqrt(3), col = size * 1.5;
  ctx.strokeStyle = color + '1a'; ctx.lineWidth = 0.5;
  for (let c = -1; c < w / col + 1; c++) {
    for (let r = -1; r < h / row + 1; r++) {
      const xo = (r % 2 === 0) ? 0 : col / 2;
      const cx = c * col + xo, cy = r * row;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + size * Math.cos(a), py = cy + size * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
    }
  }
}

function drawDotGrid(ctx, w, h, color) {
  const step = 22;
  ctx.fillStyle = color + '33';
  for (let x = step; x < w; x += step) for (let y = step; y < h; y += step) {
    ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
  }
}

function drawEdge(ctx, n1, n2, color, alpha = 0.25) {
  ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); ctx.stroke();
}

function drawNode(ctx, node, color, isMain) {
  const r = isMain ? 10 : 6;
  // Outer ring
  ctx.strokeStyle = color + (isMain ? 'cc' : '88');
  ctx.lineWidth = isMain ? 2 : 1.5;
  ctx.beginPath(); ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2); ctx.stroke();
  // Fill
  ctx.fillStyle = isMain ? color + '44' : color + '22';
  ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2); ctx.fill();
  // Glow
  const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r + 8);
  g.addColorStop(0, color + '33'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2); ctx.fill();
  // Label
  if (node.label) {
    ctx.fillStyle = color + 'cc';
    ctx.font = `bold 8px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y + (r + 10));
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }
function bezierPt(p0, p1, p2, t) {
  return {
    x: (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x,
    y: (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y,
  };
}

// ── Main PacketVizCanvas ──────────────────────────────────────────────────────

function PacketVizCanvas({ style, accentColor }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId;
    let layout = null;
    let packets = [];
    let spawnTimer = 0;
    let specialState = { ringAngles: [0, 0, 0], nodeFlicker: [], noiseTime: 0 };

    const init = () => {
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      if (style === 'orbital') layout = buildOrbital(w, h);
      else if (style === 'grid') layout = buildGrid(w, h);
      else if (style === 'secure') layout = buildSecure(w, h);
      else layout = buildChaos(w, h);

      if (style === 'chaos') {
        specialState.nodeFlicker = layout.nodes.map(() => ({ alive: true, flickerTimer: Math.random() * 3000 }));
      }
    };

    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    init();

    const spawnPacket = () => {
      if (!layout) return;
      const { nodes, edges } = layout;
      if (style === 'orbital') {
        const src = Math.floor(Math.random() * 6) + 1;
        const dice = Math.random();
        const dst = dice < 0.6 ? 0 : (Math.floor(Math.random() * 2) === 0 ? (src % 6) + 1 : (src === 1 ? 6 : src - 1));
        packets.push({ src, dst, t: 0, speed: 0.35 + Math.random() * 0.35, type: 'linear', failed: false });
      } else if (style === 'grid') {
        const edge = edges[Math.floor(Math.random() * edges.length)];
        packets.push({ src: edge[0], dst: edge[1], t: 0, speed: 0.4 + Math.random() * 0.3, type: 'linear', failed: false });
      } else if (style === 'secure') {
        const src = Math.floor(Math.random() * 5) + 1;
        packets.push({ src, dst: 0, t: 0, speed: 0.25 + Math.random() * 0.2, type: 'linear', failed: false, layer: 0 });
      } else {
        const aliveNodes = specialState.nodeFlicker.map((f, i) => f.alive ? i : -1).filter(i => i >= 0);
        if (aliveNodes.length < 2) return;
        const src = aliveNodes[Math.floor(Math.random() * aliveNodes.length)];
        let dst = src;
        while (dst === src) dst = aliveNodes[Math.floor(Math.random() * aliveNodes.length)];
        const sn = layout.nodes[src], dn = layout.nodes[dst];
        const mx = (sn.x + dn.x) / 2 + (Math.random() - 0.5) * 80;
        const my = (sn.y + dn.y) / 2 + (Math.random() - 0.5) * 80;
        packets.push({ src, dst, t: 0, speed: 0.3 + Math.random() * 0.35, type: 'bezier', cp: { x: mx, y: my }, failed: Math.random() < 0.22 });
      }
    };

    const drawPacket = (ctx, p) => {
      if (!layout) return;
      const sn = layout.nodes[p.src], dn = layout.nodes[p.dst];
      if (!sn || !dn) return;

      let pos;
      if (p.type === 'bezier' && p.cp) {
        pos = bezierPt(sn, p.cp, dn, p.t);
      } else {
        pos = { x: lerp(sn.x, dn.x, p.t), y: lerp(sn.y, dn.y, p.t) };
      }

      const color = p.failed ? '#ff4422' : accentColor;
      const size = 3.5;

      // Trail
      for (let trail = 1; trail <= 5; trail++) {
        const tt = Math.max(0, p.t - trail * 0.04);
        let tp;
        if (p.type === 'bezier' && p.cp) tp = bezierPt(sn, p.cp, dn, tt);
        else tp = { x: lerp(sn.x, dn.x, tt), y: lerp(sn.y, dn.y, tt) };
        const trailAlpha = Math.floor((1 - trail / 6) * 80).toString(16).padStart(2,'0');
        ctx.fillStyle = color + trailAlpha;
        ctx.beginPath(); ctx.arc(tp.x, tp.y, size * (1 - trail * 0.12), 0, Math.PI * 2); ctx.fill();
      }

      // Head glow
      const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 3);
      grd.addColorStop(0, color + 'cc'); grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(pos.x, pos.y, size * 3, 0, Math.PI * 2); ctx.fill();
      // Head dot
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(pos.x, pos.y, size * 0.6, 0, Math.PI * 2); ctx.fill();
    };

    let last = 0;
    const draw = (ts) => {
      rafId = requestAnimationFrame(draw);
      const dt = ts - last; last = ts;
      if (!layout) return;

      const ctx = canvas.getContext('2d');
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      // Style-specific background
      if (style === 'orbital') drawHexGrid(ctx, w, h, accentColor);
      else if (style === 'grid') drawDotGrid(ctx, w, h, accentColor);
      else if (style === 'secure') {
        // Spinning auth rings
        specialState.ringAngles[0] += dt * 0.00015;
        specialState.ringAngles[1] -= dt * 0.0001;
        specialState.ringAngles[2] += dt * 0.00007;
        const cx = w / 2, cy = h / 2;
        [0.15, 0.245, 0.33].forEach((fraction, i) => {
          const r = Math.min(w, h) * fraction;
          ctx.strokeStyle = accentColor + '2a';
          ctx.lineWidth = 1;
          ctx.setLineDash([8, 14]);
          ctx.lineDashOffset = -specialState.ringAngles[i] * 200;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
          // Tick marks
          for (let t = 0; t < 12; t++) {
            const a = (t / 12) * Math.PI * 2 + specialState.ringAngles[i];
            const x1 = cx + (r - 4) * Math.cos(a), y1 = cy + (r - 4) * Math.sin(a);
            const x2 = cx + (r + 4) * Math.cos(a), y2 = cy + (r + 4) * Math.sin(a);
            ctx.strokeStyle = accentColor + '44'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          }
        });
      } else if (style === 'chaos') {
        // Update node flicker
        specialState.nodeFlicker.forEach((nf, i) => {
          nf.flickerTimer -= dt;
          if (nf.flickerTimer <= 0) {
            nf.alive = !nf.alive;
            nf.flickerTimer = nf.alive ? 2000 + Math.random() * 5000 : 300 + Math.random() * 800;
            layout.nodes[i].alive = nf.alive;
          }
        });
        // Static noise overlay
        const noise = ctx.createImageData(w, h);
        for (let i = 0; i < noise.data.length; i += 4) {
          if (Math.random() < 0.008) {
            const v = Math.floor(Math.random() * 60);
            noise.data[i] = 255; noise.data[i+1] = v; noise.data[i+2] = v; noise.data[i+3] = 18;
          }
        }
        ctx.putImageData(noise, 0, 0);
      }

      // Draw edges
      layout.edges.forEach(([a, b]) => {
        const na = layout.nodes[a], nb = layout.nodes[b];
        if (style === 'chaos' && (!na.alive || !nb.alive)) return;
        drawEdge(ctx, na, nb, accentColor, style === 'chaos' ? 0.15 : 0.22);
      });

      // Draw nodes
      layout.nodes.forEach((n, i) => {
        if (style === 'chaos' && !n.alive) return;
        drawNode(ctx, n, accentColor, !!n.main);
      });

      // Update & draw packets
      spawnTimer += dt;
      const interval = style === 'chaos' ? 600 : style === 'secure' ? 900 : 700;
      if (spawnTimer > interval && packets.length < 12) { spawnTimer = 0; spawnPacket(); }

      packets = packets.filter(p => p.t < 1.05);
      packets.forEach(p => {
        p.t += (dt / 1000) * p.speed;
        drawPacket(ctx, p);
      });
    };

    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, [style, accentColor]);

  return (
    <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
  );
}

// ── Boot messages per style ───────────────────────────────────────────────────
const BOOT_MESSAGES = {
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

// ── ConnectingScreen ──────────────────────────────────────────────────────────
function ConnectingScreen({ termType, onSkip }) {
  const theme = TT[termType] || TT.shipboard;
  const style = theme.connectStyle;
  const messages = BOOT_MESSAGES[style];
  const [visibleLines, setVisibleLines] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setVisibleLines(0); setProgress(0);
    let line = 0;
    const iv = setInterval(() => {
      line++;
      setVisibleLines(line);
      setProgress(Math.round((line / messages.length) * 100));
      if (line >= messages.length) clearInterval(iv);
    }, 320);
    return () => clearInterval(iv);
  }, [termType]);

  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onSkip?.(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onSkip]);

  const { accent: ac, dim: dc, bg } = theme;

  const lineColor = (msg) => {
    if (msg.includes('[ERROR]') || msg.includes('ERROR')) return '#ff4444';
    if (msg.includes('[WARNING]') || msg.includes('WARN')) return '#ffaa00';
    if (msg.includes('OK') || msg.includes('PASS') || msg.includes('GRANTED')) return '#00ff88';
    return ac;
  };

  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      display: 'grid', gridTemplateColumns: '1fr 420px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Left: packet viz */}
      <div style={{ position: 'relative', borderRight: `1px solid ${ac}22` }}>
        <PacketVizCanvas style={style} accentColor={ac} />
        {/* Center label */}
        <div style={{
          position: 'absolute', bottom: '1.5rem', left: 0, right: 0,
          textAlign: 'center', fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.65rem', letterSpacing: '0.25em', color: `${ac}66`,
        }}>
          {style.toUpperCase()} CONNECTION VISUALIZATION
        </div>
      </div>

      {/* Right: boot messages */}
      <div style={{
        display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem',
        background: 'rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem',
            color: ac, letterSpacing: '0.2em', marginBottom: '0.4rem',
            textShadow: `0 0 10px ${ac}55`,
          }}>
            {theme.headerLabel}
          </div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: `${dc}` }}>
            {theme.label}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '4px', background: `${ac}18`, border: `1px solid ${ac}22`,
          borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: `linear-gradient(90deg, ${ac}88, ${ac})`,
            boxShadow: `0 0 8px ${ac}66`,
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Messages */}
        <div style={{ flex: 1, fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', lineHeight: '1.9', overflow: 'hidden' }}>
          {messages.slice(0, visibleLines).map((msg, i) => (
            <div key={i} style={{
              color: lineColor(msg),
              opacity: i === visibleLines - 1 ? 1 : 0.65,
              animation: i === visibleLines - 1 ? 'lineIn 0.12s ease-out' : undefined,
              whiteSpace: 'pre',
            }}>
              {msg}
            </div>
          ))}
          {visibleLines < messages.length && (
            <span style={{ color: ac, animation: 'curBlink 0.8s step-end infinite' }}>█</span>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem',
        }}>
          <span style={{ color: `${dc}` }}>{progress}% LOADED</span>
          <span style={{ color: `${dc}88` }}>ESC TO SKIP</span>
        </div>
      </div>

      <style>{`
        @keyframes lineIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:none; } }
        @keyframes curBlink { 0%,49%{ opacity:1; } 50%,100%{ opacity:0; } }
      `}</style>
    </div>
  );
}

Object.assign(window, { PacketVizCanvas, ConnectingScreen });
