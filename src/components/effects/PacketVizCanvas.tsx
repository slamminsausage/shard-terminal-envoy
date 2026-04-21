import { useEffect, useRef } from 'react';

export type PacketVizStyle = 'orbital' | 'grid' | 'secure' | 'chaos';

interface Node {
  x: number;
  y: number;
  label?: string;
  main?: boolean;
  alive?: boolean;
}

interface Layout {
  nodes: Node[];
  edges: Array<[number, number]>;
}

interface Packet {
  src: number;
  dst: number;
  t: number;
  speed: number;
  type: 'linear' | 'bezier';
  failed: boolean;
  cp?: { x: number; y: number };
  layer?: number;
}

interface SpecialState {
  ringAngles: [number, number, number];
  nodeFlicker: Array<{ alive: boolean; flickerTimer: number }>;
  noiseTime: number;
}

function buildOrbital(w: number, h: number): Layout {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.31;
  const nodes: Node[] = [{ x: cx, y: cy, label: 'CORE', main: true }];
  ['NAV', 'SEN', 'ENG', 'COM', 'WPN', 'LSS'].forEach((l, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    nodes.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), label: l });
  });
  const edges: Array<[number, number]> = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
    [1, 2], [3, 4], [5, 6],
  ];
  return { nodes, edges };
}

function buildGrid(w: number, h: number): Layout {
  const nodes: Node[] = [];
  const edges: Array<[number, number]> = [];
  const cols = 4;
  const rows = 3;
  const xStep = (w * 0.65) / (cols - 1);
  const yStep = (h * 0.6) / (rows - 1);
  const ox = (w - xStep * (cols - 1)) / 2;
  const oy = (h - yStep * (rows - 1)) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({
        x: ox + c * xStep,
        y: oy + r * yStep,
        label: `S${String(r * cols + c + 1).padStart(2, '0')}`,
      });
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) edges.push([r * cols + c, r * cols + c + 1]);
  }
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) edges.push([r * cols + c, (r + 1) * cols + c]);
  }
  return { nodes, edges };
}

function buildSecure(w: number, h: number): Layout {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.31;
  const nodes: Node[] = [{ x: cx, y: cy, label: 'AUTH', main: true }];
  [0, 1, 2, 3, 4].forEach((i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    nodes.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), label: `N${i + 1}` });
  });
  return { nodes, edges: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]] };
}

function buildChaos(w: number, h: number): Layout {
  const positions: Array<[number, number]> = [
    [0.15, 0.2], [0.78, 0.12], [0.88, 0.6], [0.62, 0.88],
    [0.22, 0.82], [0.06, 0.55], [0.42, 0.42], [0.72, 0.38],
  ];
  const nodes: Node[] = positions.map(([rx, ry], i) => ({
    x: rx * w,
    y: ry * h,
    label: `R${i + 1}`,
    alive: true,
  }));
  const edges: Array<[number, number]> = [
    [0, 2], [0, 6], [1, 2], [1, 7], [2, 3], [2, 7],
    [3, 4], [4, 5], [5, 0], [6, 7], [6, 3], [7, 1],
  ];
  return { nodes, edges };
}

function drawHexGrid(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const size = 28;
  const row = size * Math.sqrt(3);
  const col = size * 1.5;
  ctx.strokeStyle = color + '1a';
  ctx.lineWidth = 0.5;
  for (let c = -1; c < w / col + 1; c++) {
    for (let r = -1; r < h / row + 1; r++) {
      const xo = r % 2 === 0 ? 0 : col / 2;
      const cx = c * col + xo;
      const cy = r * row;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + size * Math.cos(a);
        const py = cy + size * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function drawDotGrid(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const step = 22;
  ctx.fillStyle = color + '33';
  for (let x = step; x < w; x += step) {
    for (let y = step; y < h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawEdge(
  ctx: CanvasRenderingContext2D,
  n1: Node,
  n2: Node,
  color: string,
  alpha = 0.25
) {
  ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(n1.x, n1.y);
  ctx.lineTo(n2.x, n2.y);
  ctx.stroke();
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: Node,
  color: string,
  isMain: boolean
) {
  const r = isMain ? 10 : 6;
  ctx.strokeStyle = color + (isMain ? 'cc' : '88');
  ctx.lineWidth = isMain ? 2 : 1.5;
  ctx.beginPath();
  ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = isMain ? color + '44' : color + '22';
  ctx.beginPath();
  ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
  ctx.fill();

  const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r + 8);
  g.addColorStop(0, color + '33');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
  ctx.fill();

  if (node.label) {
    ctx.fillStyle = color + 'cc';
    ctx.font = 'bold 8px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y + (r + 10));
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const bezierPt = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
) => ({
  x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
  y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
});

interface PacketVizCanvasProps {
  style: PacketVizStyle;
  accentColor: string;
}

export default function PacketVizCanvas({ style, accentColor }: PacketVizCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let layout: Layout | null = null;
    let packets: Packet[] = [];
    let spawnTimer = 0;
    const specialState: SpecialState = {
      ringAngles: [0, 0, 0],
      nodeFlicker: [],
      noiseTime: 0,
    };

    const init = () => {
      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);
      if (style === 'orbital') layout = buildOrbital(w, h);
      else if (style === 'grid') layout = buildGrid(w, h);
      else if (style === 'secure') layout = buildSecure(w, h);
      else layout = buildChaos(w, h);

      if (style === 'chaos' && layout) {
        specialState.nodeFlicker = layout.nodes.map(() => ({
          alive: true,
          flickerTimer: Math.random() * 3000,
        }));
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
        const dst =
          dice < 0.6
            ? 0
            : Math.floor(Math.random() * 2) === 0
              ? (src % 6) + 1
              : src === 1
                ? 6
                : src - 1;
        packets.push({ src, dst, t: 0, speed: 0.35 + Math.random() * 0.35, type: 'linear', failed: false });
      } else if (style === 'grid') {
        const edge = edges[Math.floor(Math.random() * edges.length)];
        packets.push({ src: edge[0], dst: edge[1], t: 0, speed: 0.4 + Math.random() * 0.3, type: 'linear', failed: false });
      } else if (style === 'secure') {
        const src = Math.floor(Math.random() * 5) + 1;
        packets.push({ src, dst: 0, t: 0, speed: 0.25 + Math.random() * 0.2, type: 'linear', failed: false, layer: 0 });
      } else {
        const aliveIdx = specialState.nodeFlicker
          .map((f, i) => (f.alive ? i : -1))
          .filter((i) => i >= 0);
        if (aliveIdx.length < 2) return;
        const src = aliveIdx[Math.floor(Math.random() * aliveIdx.length)];
        let dst = src;
        while (dst === src) dst = aliveIdx[Math.floor(Math.random() * aliveIdx.length)];
        const sn = nodes[src];
        const dn = nodes[dst];
        const mx = (sn.x + dn.x) / 2 + (Math.random() - 0.5) * 80;
        const my = (sn.y + dn.y) / 2 + (Math.random() - 0.5) * 80;
        packets.push({
          src,
          dst,
          t: 0,
          speed: 0.3 + Math.random() * 0.35,
          type: 'bezier',
          cp: { x: mx, y: my },
          failed: Math.random() < 0.22,
        });
      }
    };

    const drawPacket = (ctx: CanvasRenderingContext2D, p: Packet) => {
      if (!layout) return;
      const sn = layout.nodes[p.src];
      const dn = layout.nodes[p.dst];
      if (!sn || !dn) return;

      let pos: { x: number; y: number };
      if (p.type === 'bezier' && p.cp) {
        pos = bezierPt(sn, p.cp, dn, p.t);
      } else {
        pos = { x: lerp(sn.x, dn.x, p.t), y: lerp(sn.y, dn.y, p.t) };
      }

      const color = p.failed ? '#ff4422' : accentColor;
      const size = 3.5;

      for (let trail = 1; trail <= 5; trail++) {
        const tt = Math.max(0, p.t - trail * 0.04);
        const tp =
          p.type === 'bezier' && p.cp
            ? bezierPt(sn, p.cp, dn, tt)
            : { x: lerp(sn.x, dn.x, tt), y: lerp(sn.y, dn.y, tt) };
        const trailAlpha = Math.floor((1 - trail / 6) * 80).toString(16).padStart(2, '0');
        ctx.fillStyle = color + trailAlpha;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, size * (1 - trail * 0.12), 0, Math.PI * 2);
        ctx.fill();
      }

      const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 3);
      grd.addColorStop(0, color + 'cc');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    };

    let last = 0;
    const draw = (ts: number) => {
      rafId = requestAnimationFrame(draw);
      const dt = ts - last;
      last = ts;
      if (!layout) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      if (style === 'orbital') drawHexGrid(ctx, w, h, accentColor);
      else if (style === 'grid') drawDotGrid(ctx, w, h, accentColor);
      else if (style === 'secure') {
        specialState.ringAngles[0] += dt * 0.00015;
        specialState.ringAngles[1] -= dt * 0.0001;
        specialState.ringAngles[2] += dt * 0.00007;
        const cx = w / 2;
        const cy = h / 2;
        [0.15, 0.245, 0.33].forEach((fraction, i) => {
          const r = Math.min(w, h) * fraction;
          ctx.strokeStyle = accentColor + '2a';
          ctx.lineWidth = 1;
          ctx.setLineDash([8, 14]);
          ctx.lineDashOffset = -specialState.ringAngles[i] * 200;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          for (let t = 0; t < 12; t++) {
            const a = (t / 12) * Math.PI * 2 + specialState.ringAngles[i];
            const x1 = cx + (r - 4) * Math.cos(a);
            const y1 = cy + (r - 4) * Math.sin(a);
            const x2 = cx + (r + 4) * Math.cos(a);
            const y2 = cy + (r + 4) * Math.sin(a);
            ctx.strokeStyle = accentColor + '44';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        });
      } else if (style === 'chaos') {
        specialState.nodeFlicker.forEach((nf, i) => {
          nf.flickerTimer -= dt;
          if (nf.flickerTimer <= 0) {
            nf.alive = !nf.alive;
            nf.flickerTimer = nf.alive ? 2000 + Math.random() * 5000 : 300 + Math.random() * 800;
            if (layout) layout.nodes[i].alive = nf.alive;
          }
        });
        const noise = ctx.createImageData(w, h);
        for (let i = 0; i < noise.data.length; i += 4) {
          if (Math.random() < 0.008) {
            const v = Math.floor(Math.random() * 60);
            noise.data[i] = 255;
            noise.data[i + 1] = v;
            noise.data[i + 2] = v;
            noise.data[i + 3] = 18;
          }
        }
        ctx.putImageData(noise, 0, 0);
      }

      layout.edges.forEach(([a, b]) => {
        const na = layout!.nodes[a];
        const nb = layout!.nodes[b];
        if (style === 'chaos' && (!na.alive || !nb.alive)) return;
        drawEdge(ctx, na, nb, accentColor, style === 'chaos' ? 0.15 : 0.22);
      });

      layout.nodes.forEach((n) => {
        if (style === 'chaos' && !n.alive) return;
        drawNode(ctx, n, accentColor, !!n.main);
      });

      spawnTimer += dt;
      const interval = style === 'chaos' ? 600 : style === 'secure' ? 900 : 700;
      if (spawnTimer > interval && packets.length < 12) {
        spawnTimer = 0;
        spawnPacket();
      }

      packets = packets.filter((p) => p.t < 1.05);
      packets.forEach((p) => {
        p.t += (dt / 1000) * p.speed;
        drawPacket(ctx, p);
      });
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [style, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
