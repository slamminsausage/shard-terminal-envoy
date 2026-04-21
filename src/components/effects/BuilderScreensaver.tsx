import { useEffect, useRef } from 'react';
import MatrixRain from './MatrixRain';

// Angular Builder glyph strokes; coords normalised to 0..1.
const BUILDER_GLYPHS: Array<Array<[number, number]>> = [
  [[0,0],[1,0],[0.5,1],[0,0],[0.5,0.4],[1,0],[0.5,0.4],[0.5,1]],
  [[0,0],[0.6,0],[0.6,0.35],[1,0.35],[1,1],[0.4,1],[0.4,0.65],[0,0.65],[0,0]],
  [[0.5,0],[1,0.5],[0.5,1],[0,0.5],[0.5,0],[0.5,0.5],[1,0.5],[0.5,0.5],[0,0.5],[0.5,0.5],[0.5,1]],
  [[0,0.2],[0.4,0],[1,0.2],[1,0.8],[0.6,1],[0,0.8],[0,0.2],[0.4,0.4],[0.8,0.2],[0.8,0.7],[0.3,0.9]],
  [[0,0],[0.5,0.4],[1,0],[1,0.3],[0.5,0.7],[0,0.3],[0,0.6],[0.5,1],[1,0.6]],
  [[0.25,0],[0.75,0],[1,0.5],[0.75,1],[0.25,1],[0,0.5],[0.25,0],[0.5,0.5],[0.75,0],[0.5,0.5],[1,0.5],[0.5,0.5],[0.25,1]],
  [[0.5,0],[0.5,1],[0.5,0.5],[0,0.5],[1,0.5],[0.5,0.5],[0.15,0.15],[0.85,0.85],[0.5,0.5],[0.85,0.15],[0.15,0.85]],
  [[0.1,0],[0.5,0.1],[0.9,0],[0.9,0.3],[0.7,0.5],[0.9,0.7],[0.9,1],[0.5,0.9],[0.1,1],[0.1,0.7],[0.3,0.5],[0.1,0.3],[0.1,0]],
];

function drawBuilderGeometry(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  phase: number,
  depth: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  const alpha = (a: number) =>
    color + Math.floor(a * 255).toString(16).padStart(2, '0');
  const pulse = 0.5 + 0.5 * Math.sin(phase);
  const pulseB = 0.5 + 0.5 * Math.sin(phase * 1.3 + 1.1);

  ctx.strokeStyle = alpha(0.18 + pulse * 0.1);
  ctx.lineWidth = 0.8;
  ctx.setLineDash([6, 10]);
  ctx.lineDashOffset = -phase * 30;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const sides = 5 + (depth % 3);
  ctx.strokeStyle = alpha(0.28 + pulseB * 0.15);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2 - phase * 0.4;
    const r = radius * 0.62;
    if (i === 0) ctx.moveTo(r * Math.cos(a), r * Math.sin(a));
    else ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  ctx.stroke();

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

  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.18);
  grd.addColorStop(0, alpha(0.5 + pulse * 0.3));
  grd.addColorStop(1, alpha(0));
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBuilderGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  alpha: number,
  glyphIdx: number
) {
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
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;
}

interface BuilderNode {
  x: number;
  y: number;
  gx: number;
  gy: number;
  radius: number;
  glyphIdx: number;
  glyphSize: number;
  phaseOffset: number;
  depth: number;
}

function BuilderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let rafId = 0;
    let w = 0;
    let h = 0;
    let phase = 0;
    let nodes: BuilderNode[] = [];

    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      const count = 14;
      nodes = Array.from({ length: count }, (_, i) => {
        const baseX = (0.08 + (i % 5) * 0.21 + (Math.floor(i / 5) % 2) * 0.1) * w;
        const baseY = (0.1 + Math.floor(i / 5) * 0.28 + (i % 3) * 0.08) * h;
        return {
          x: baseX,
          y: baseY,
          gx: baseX + (Math.random() - 0.5) * 60,
          gy: baseY + (Math.random() - 0.5) * 60,
          radius: 28 + (i % 4) * 18,
          glyphIdx: i % BUILDER_GLYPHS.length,
          glyphSize: 22 + (i % 3) * 14,
          phaseOffset: (i / count) * Math.PI * 2,
          depth: i,
        };
      });
    };

    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    init();

    const color = '#00ccff';
    let last = 0;

    const draw = (ts: number) => {
      rafId = requestAnimationFrame(draw);
      const dt = Math.min(ts - last, 50);
      last = ts;
      phase += dt * 0.00028;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = 'rgba(0,0,0,0.035)';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 260) {
            const a = (1 - dist / 260) * 0.07;
            ctx.strokeStyle = color + Math.floor(a * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n, i) => {
        const p = phase + n.phaseOffset;
        n.x += Math.sin(p * 0.7 + i) * 0.18;
        n.y += Math.cos(p * 0.5 + i * 1.3) * 0.12;
        n.x = Math.max(n.radius + 10, Math.min(w - n.radius - 10, n.x));
        n.y = Math.max(n.radius + 10, Math.min(h - n.radius - 10, n.y));
        n.gx = n.x + Math.sin(p * 1.1) * 8;
        n.gy = n.y + Math.cos(p * 0.9) * 8;

        drawBuilderGeometry(ctx, n.x, n.y, n.radius, color, p, n.depth);
        const glyphAlpha = 0.25 + 0.15 * Math.sin(p * 1.4 + i);
        drawBuilderGlyph(ctx, n.gx, n.gy, n.glyphSize, color, glyphAlpha, n.glyphIdx);
      });

      const cx = w * 0.5;
      const cy = h * 0.5;
      const bigR = Math.min(w, h) * 0.38;
      drawBuilderGeometry(ctx, cx, cy, bigR, color, phase * 0.3, 7);
      drawBuilderGeometry(ctx, cx, cy, bigR * 0.72, color, -phase * 0.2 + Math.PI / 5, 4);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

interface BuilderScreensaverProps {
  onDismiss?: () => void;
}

export default function BuilderScreensaver({ onDismiss }: BuilderScreensaverProps) {
  const color = '#00ccff';

  useEffect(() => {
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9800,
        background: '#000',
        cursor: 'none',
      }}
    >
      <MatrixRain accentColor={color} opacity={0.9} speed={1.4} fontSize={14} />
      <BuilderCanvas />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          gap: '1.2rem',
        }}
      >
        <div
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '2rem',
            fontWeight: 900,
            color,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            textShadow: `0 0 30px ${color}, 0 0 60px ${color}44`,
            animation: 'builderSsGlow 2.5s ease-in-out infinite',
          }}
        >
          TRAVELLER
        </div>
        <div
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.9rem',
            color: `${color}99`,
            letterSpacing: '0.6em',
            textShadow: `0 0 10px ${color}55`,
          }}
        >
          TERMINAL v5.0
        </div>
        <div
          style={{
            marginTop: '1.5rem',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.75rem',
            color: `${color}77`,
            letterSpacing: '0.2em',
            animation: 'builderSsBlink 1.4s step-end infinite',
          }}
        >
          — PRESS ANY KEY TO RESUME —
        </div>
      </div>

      <style>{`
        @keyframes builderSsGlow {
          0%,100% { opacity:0.8; text-shadow: 0 0 20px ${color}, 0 0 40px ${color}44; }
          50%      { opacity:1;   text-shadow: 0 0 40px ${color}, 0 0 80px ${color}66; }
        }
        @keyframes builderSsBlink { 0%,49%{ opacity:1; } 50%,100%{ opacity:0; } }
      `}</style>
    </div>
  );
}
