
// terminal/particles.jsx — Canvas-based visual effects
// Exports: MatrixRain, MatrixScreensaver, DataStreamBg

// ── Matrix Rain Canvas ────────────────────────────────────────────────────────
function MatrixRain({ accentColor = '#00ff00', opacity = 0.85, speed = 1.2, fontSize = 14 }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let rafId, cols, drops, w, h;

    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      cols = Math.floor(w / (fontSize + 2));
      drops = Array.from({ length: cols }, () => Math.random() * (h / fontSize) * -1);
    };

    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    init();

    let last = 0;
    const draw = (ts) => {
      rafId = requestAnimationFrame(draw);
      if (ts - last < 45) return;
      last = ts;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = `rgba(0,0,0,${0.12 + (1 - opacity) * 0.2})`;
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * fontSize;
        const isBright = drops[i] % 7 < 1;
        ctx.fillStyle = isBright
          ? accentColor + 'ff'
          : accentColor + Math.floor(opacity * 180).toString(16).padStart(2, '0');
        ctx.fillText(matrixChar(), i * (fontSize + 2), y);

        drops[i] += speed * 0.9;
        if (drops[i] * fontSize > h && Math.random() > 0.975) {
          drops[i] = Math.random() * -20;
        }
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, [accentColor, opacity, speed, fontSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

// ── Subtle data-stream background (very dim rain for use behind UI) ──────────
function DataStreamBg({ accentColor = '#00ff00' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <MatrixRain accentColor={accentColor} opacity={0.18} speed={0.55} fontSize={12} />
      {/* Radial vignette to fade the edges */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)',
      }} />
    </div>
  );
}

// ── Alien / Builder Architecture Screensaver ──────────────────────────────────

// Builder glyph paths — angular alien script strokes (relative to a 0,0 origin, scaled)
const BUILDER_GLYPHS = [
  // Glyph A: triangular with inner point
  [[0,0],[1,0],[0.5,1],[0,0],[0.5,0.4],[1,0],[0.5,0.4],[0.5,1]],
  // Glyph B: stepped rune
  [[0,0],[0.6,0],[0.6,0.35],[1,0.35],[1,1],[0.4,1],[0.4,0.65],[0,0.65],[0,0]],
  // Glyph C: diamond with cross
  [[0.5,0],[1,0.5],[0.5,1],[0,0.5],[0.5,0],[0.5,0.5],[1,0.5],[0.5,0.5],[0,0.5],[0.5,0.5],[0.5,1]],
  // Glyph D: angular spiral stub
  [[0,0.2],[0.4,0],[1,0.2],[1,0.8],[0.6,1],[0,0.8],[0,0.2],[0.4,0.4],[0.8,0.2],[0.8,0.7],[0.3,0.9]],
  // Glyph E: chevron stack
  [[0,0],[0.5,0.4],[1,0],[1,0.3],[0.5,0.7],[0,0.3],[0,0.6],[0.5,1],[1,0.6]],
  // Glyph F: hexagonal cell
  [[0.25,0],[0.75,0],[1,0.5],[0.75,1],[0.25,1],[0,0.5],[0.25,0],[0.5,0.5],[0.75,0],[0.5,0.5],[1,0.5],[0.5,0.5],[0.25,1]],
  // Glyph G: lattice cross
  [[0.5,0],[0.5,1],[0.5,0.5],[0,0.5],[1,0.5],[0.5,0.5],[0.15,0.15],[0.85,0.85],[0.5,0.5],[0.85,0.15],[0.15,0.85]],
  // Glyph H: arc-like alien bracket
  [[0.1,0],[0.5,0.1],[0.9,0],[0.9,0.3],[0.7,0.5],[0.9,0.7],[0.9,1],[0.5,0.9],[0.1,1],[0.1,0.7],[0.3,0.5],[0.1,0.3],[0.1,0]],
];

// Concentric geometry shapes: rings, polygons, interlocking lines
function drawBuilderGeometry(ctx, cx, cy, radius, color, phase, depth) {
  ctx.save();
  ctx.translate(cx, cy);

  const alpha = (a) => color + Math.floor(a * 255).toString(16).padStart(2, '0');
  const pulse = 0.5 + 0.5 * Math.sin(phase);
  const pulseB = 0.5 + 0.5 * Math.sin(phase * 1.3 + 1.1);

  // Outer ring — slowly rotating dashed circle
  ctx.strokeStyle = alpha(0.18 + pulse * 0.1);
  ctx.lineWidth = 0.8;
  ctx.setLineDash([6, 10]);
  ctx.lineDashOffset = -phase * 30;
  ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  // Inner polygon — n-sided, counter-rotating
  const sides = 5 + (depth % 3);
  ctx.strokeStyle = alpha(0.28 + pulseB * 0.15);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2 - phase * 0.4;
    const r = radius * 0.62;
    i === 0 ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a))
             : ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  ctx.stroke();

  // Inner star / connecting lines
  const starSides = 6;
  ctx.strokeStyle = alpha(0.15 + pulse * 0.08);
  ctx.lineWidth = 0.6;
  const starR = radius * 0.38;
  for (let i = 0; i < starSides; i++) {
    const a1 = (i / starSides) * Math.PI * 2 + phase * 0.2;
    const a2 = ((i + 2) / starSides) * Math.PI * 2 + phase * 0.2;
    ctx.beginPath();
    ctx.moveTo(starR * Math.cos(a1), starR * Math.sin(a1));
    ctx.lineTo(starR * Math.cos(a2), starR * Math.sin(a2));
    ctx.stroke();
  }

  // Center dot with glow
  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.18);
  grd.addColorStop(0, alpha(0.5 + pulse * 0.3));
  grd.addColorStop(1, alpha(0));
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// Draw a single Builder glyph at (cx, cy), scaled to `size`
function drawBuilderGlyph(ctx, cx, cy, size, color, alpha, glyphIdx) {
  const pts = BUILDER_GLYPHS[glyphIdx % BUILDER_GLYPHS.length];
  if (!pts || pts.length < 2) return;
  const a = Math.floor(alpha * 255).toString(16).padStart(2, '0');
  ctx.strokeStyle = color + a;
  ctx.lineWidth = 1.2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    const x = cx + (px - 0.5) * size;
    const y = cy + (py - 0.5) * size;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function BuilderCanvas() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let rafId, w, h, phase = 0;

    // Stable set of geometry nodes seeded on init
    let nodes = [];

    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      // Scatter 12–18 geometry nodes
      const count = 14;
      nodes = Array.from({ length: count }, (_, i) => ({
        x: (0.08 + (i % 5) * 0.21 + (Math.floor(i / 5) % 2) * 0.1) * w,
        y: (0.1 + Math.floor(i / 5) * 0.28 + (i % 3) * 0.08) * h,
        radius: 28 + (i % 4) * 18,
        glyphIdx: i % BUILDER_GLYPHS.length,
        glyphSize: 22 + (i % 3) * 14,
        phaseOffset: (i / count) * Math.PI * 2,
        depth: i,
        // glyph floats slightly above geometry center
        gx: (0.08 + (i % 5) * 0.21 + (Math.floor(i / 5) % 2) * 0.1) * w + (Math.random() - 0.5) * 60,
        gy: (0.1 + Math.floor(i / 5) * 0.28 + (i % 3) * 0.08) * h + (Math.random() - 0.5) * 60,
      }));
    };

    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    init();

    const color = '#00ccff'; // Builder cyan-teal

    let last = 0;
    const draw = (ts) => {
      rafId = requestAnimationFrame(draw);
      const dt = Math.min(ts - last, 50); last = ts;
      phase += dt * 0.00028;

      const ctx = canvas.getContext('2d');
      // Slow fade trail
      ctx.fillStyle = 'rgba(0,0,0,0.035)';
      ctx.fillRect(0, 0, w, h);

      // Draw connection lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 260) {
            const a = (1 - dist / 260) * 0.07;
            ctx.strokeStyle = color + Math.floor(a * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }

      // Draw each node
      nodes.forEach((n, i) => {
        const p = phase + n.phaseOffset;
        // Slowly drift
        n.x += Math.sin(p * 0.7 + i) * 0.18;
        n.y += Math.cos(p * 0.5 + i * 1.3) * 0.12;
        // Clamp to canvas
        n.x = Math.max(n.radius + 10, Math.min(w - n.radius - 10, n.x));
        n.y = Math.max(n.radius + 10, Math.min(h - n.radius - 10, n.y));
        n.gx = n.x + Math.sin(p * 1.1) * 8;
        n.gy = n.y + Math.cos(p * 0.9) * 8;

        drawBuilderGeometry(ctx, n.x, n.y, n.radius, color, p, n.depth);
        const glyphAlpha = 0.25 + 0.15 * Math.sin(p * 1.4 + i);
        drawBuilderGlyph(ctx, n.gx, n.gy, n.glyphSize, color, glyphAlpha, n.glyphIdx);
      });

      // Large central sacred geometry — full-canvas scale
      const cx = w * 0.5, cy = h * 0.5;
      const bigR = Math.min(w, h) * 0.38;
      drawBuilderGeometry(ctx, cx, cy, bigR, color, phase * 0.3, 7);
      // Second overlapping ring, counter-phase
      drawBuilderGeometry(ctx, cx, cy, bigR * 0.72, color, -phase * 0.2 + Math.PI / 5, 4);
    };

    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
  );
}

function BuilderScreensaver({ onDismiss }) {
  const color = '#00ccff';

  React.useEffect(() => {
    const handler = () => onDismiss?.();
    window.addEventListener('keydown', handler);
    window.addEventListener('mousedown', handler);
    window.addEventListener('touchstart', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [onDismiss]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9800, background: '#000', cursor: 'none' }}>
      <MatrixRain accentColor={color} opacity={0.9} speed={1.4} fontSize={14} />

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: '1.2rem',
      }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: '2rem', fontWeight: 900,
          color: color, letterSpacing: '0.4em', textTransform: 'uppercase',
          textShadow: `0 0 30px ${color}, 0 0 60px ${color}44`,
          animation: 'ssGlow 2.5s ease-in-out infinite',
        }}>
          TRAVELLER
        </div>
        <div style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem',
          color: `${color}99`, letterSpacing: '0.6em',
          textShadow: `0 0 10px ${color}55`,
        }}>
          TERMINAL v5.0
        </div>
        <div style={{
          marginTop: '1.5rem', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem',
          color: `${color}77`, letterSpacing: '0.2em',
          animation: 'ssBlink 1.4s step-end infinite',
        }}>
          — PRESS ANY KEY TO RESUME —
        </div>
      </div>

      <style>{`
        @keyframes ssGlow {
          0%,100% { opacity:0.8; text-shadow: 0 0 20px ${color}, 0 0 40px ${color}44; }
          50%      { opacity:1;   text-shadow: 0 0 40px ${color}, 0 0 80px ${color}66; }
        }
        @keyframes ssBlink { 0%,49%{ opacity:1; } 50%,100%{ opacity:0; } }
      `}</style>
    </div>
  );
}

// ── Access Denied Flash (screen shake + red vignette) ────────────────────────
function AccessDeniedFlash({ onComplete }) {
  React.useEffect(() => {
    const t = setTimeout(onComplete, 700);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9900, pointerEvents: 'none',
      animation: 'adFlash 0.7s ease-out forwards',
      background: 'radial-gradient(ellipse at center, transparent 20%, rgba(255,30,30,0.5) 100%)',
    }}>
      <style>{`
        @keyframes adFlash {
          0%   { opacity:0; }
          10%  { opacity:1; }
          30%  { opacity:0.6; }
          55%  { opacity:0.85; }
          100% { opacity:0; }
        }
        @keyframes screenShake {
          0%   { transform:translate(0,0) rotate(0deg); }
          15%  { transform:translate(-4px,2px) rotate(-0.4deg); }
          30%  { transform:translate(3px,-3px) rotate(0.3deg); }
          45%  { transform:translate(-3px,3px) rotate(-0.3deg); }
          60%  { transform:translate(4px,-2px) rotate(0.4deg); }
          75%  { transform:translate(-2px,2px) rotate(-0.1deg); }
          90%  { transform:translate(2px,-2px) rotate(0.1deg); }
          100% { transform:translate(0,0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { MatrixRain, DataStreamBg, BuilderScreensaver, BuilderCanvas, AccessDeniedFlash });
