import { useEffect, useRef } from 'react';
import { matrixChar } from '@/lib/textEffects';

interface MatrixRainProps {
  accentColor?: string;
  opacity?: number;
  speed?: number;
  fontSize?: number;
  className?: string;
}

/**
 * Canvas "digital rain" effect. Lives behind content; pointer-events: none.
 * All params are runtime-tweakable to support both the full-brightness
 * screensaver and the subtle DataStreamBg variant.
 */
export default function MatrixRain({
  accentColor = '#00ff00',
  opacity = 0.85,
  speed = 1.2,
  fontSize = 14,
  className,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let cols = 0;
    let drops: number[] = [];
    let w = 0;
    let h = 0;

    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      cols = Math.max(1, Math.floor(w / (fontSize + 2)));
      drops = Array.from({ length: cols }, () => Math.random() * (h / fontSize) * -1);
    };

    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    init();

    let last = 0;
    const draw = (ts: number) => {
      rafId = requestAnimationFrame(draw);
      if (ts - last < 45) return;
      last = ts;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

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
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [accentColor, opacity, speed, fontSize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
