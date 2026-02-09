import { useRef, useCallback, useEffect } from "react";
import type { Particle, ParticleConfig } from "@/types/vtt";

/**
 * Particle system hook for weather effects.
 * Manages a pool of particles and renders them to a provided canvas.
 */
export function useVTTParticles(config: ParticleConfig) {
  const particlesRef = useRef<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const configRef = useRef(config);
  configRef.current = config;

  const spawnParticle = useCallback(
    (width: number, height: number): Particle => {
      const c = configRef.current;
      return {
        x: Math.random() * width,
        y: -10,
        vx: c.wind * (0.5 + Math.random()),
        vy: c.speed * (0.5 + Math.random() * 0.5) + c.gravity,
        size: c.size * (0.5 + Math.random()),
        opacity: c.opacity * (0.5 + Math.random() * 0.5),
        life: 0,
        maxLife: 200 + Math.random() * 300,
        color: c.color,
      };
    },
    []
  );

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    const c = configRef.current;

    if (!canvas || !c.enabled) {
      animRef.current = requestAnimationFrame(tick);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Spawn missing particles
    while (particlesRef.current.length < c.count) {
      const p = spawnParticle(w, h);
      // Scatter initial Y to avoid all spawning at top
      p.y = Math.random() * h;
      particlesRef.current.push(p);
    }

    // Remove excess
    if (particlesRef.current.length > c.count) {
      particlesRef.current.length = c.count;
    }

    // Update & draw
    const alive: Particle[] = [];
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      // Respawn if off screen or expired
      if (p.y > h + 20 || p.x > w + 20 || p.x < -20 || p.life > p.maxLife) {
        const np = spawnParticle(w, h);
        alive.push(np);
        continue;
      }

      // Fade near end of life
      const fadeRatio =
        p.life > p.maxLife * 0.8
          ? 1 - (p.life - p.maxLife * 0.8) / (p.maxLife * 0.2)
          : 1;

      ctx.globalAlpha = p.opacity * fadeRatio;
      ctx.fillStyle = p.color;

      if (c.preset === "rain") {
        // Elongated raindrop
        ctx.fillRect(p.x, p.y, 1, p.size * 3);
      } else if (c.preset === "fog") {
        // Soft blob
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size
        );
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else {
        // Circular particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      alive.push(p);
    }

    particlesRef.current = alive;
    ctx.globalAlpha = 1;

    animRef.current = requestAnimationFrame(tick);
  }, [spawnParticle]);

  useEffect(() => {
    if (config.enabled) {
      animRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [config.enabled, tick]);

  const setCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  const reset = useCallback(() => {
    particlesRef.current = [];
  }, []);

  return { setCanvas, reset };
}
