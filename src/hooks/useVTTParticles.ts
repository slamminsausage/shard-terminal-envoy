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
      // Scale maxLife so slow particles live long enough to cross the screen
      const baseLife = Math.max(400, 600 / Math.max(c.speed, 0.2));
      // Embers rise — spawn at bottom; everything else falls from top
      const spawnY = c.gravity < 0 ? height + 10 : -10;
      return {
        x: Math.random() * width,
        y: spawnY,
        vx: c.wind * (0.5 + Math.random()),
        vy: (c.gravity < 0 ? -1 : 1) * c.speed * (0.5 + Math.random() * 0.5),
        size: c.size * (0.5 + Math.random()),
        opacity: c.opacity * (0.5 + Math.random() * 0.5),
        life: 0,
        maxLife: baseLife + Math.random() * baseLife * 0.5,
        color: c.color,
        rotation: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
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
      // Apply gravity as continuous acceleration each frame
      p.vy += c.gravity * 0.02;
      p.vx += c.wind * 0.005;
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      // Respawn if off screen or expired
      if (p.y > h + 20 || p.y < -30 || p.x > w + 20 || p.x < -20 || p.life > p.maxLife) {
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
        // Elongated raindrop with slight angle from wind
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx) - Math.PI / 2);
        ctx.fillRect(-0.5, 0, 1, p.size * 3);
        ctx.restore();
      } else if (c.preset === "fog") {
        // Soft blob with radial gradient
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size
        );
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else if (c.preset === "snow") {
        // Snowflake: 6-armed star with slow rotation and horizontal wobble
        p.rotation += 0.008;
        const wobble = Math.sin(p.life * 0.02 + p.phase) * 0.3;
        p.x += wobble;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, p.size * 0.25);
        ctx.lineCap = "round";
        ctx.beginPath();
        const armLen = p.size * 1.2;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const ax = Math.cos(angle) * armLen;
          const ay = Math.sin(angle) * armLen;
          ctx.moveTo(0, 0);
          ctx.lineTo(ax, ay);
          // Small branch on each arm
          const branchLen = armLen * 0.4;
          const bx = Math.cos(angle) * armLen * 0.55;
          const by = Math.sin(angle) * armLen * 0.55;
          ctx.moveTo(bx, by);
          ctx.lineTo(
            bx + Math.cos(angle + 0.6) * branchLen,
            by + Math.sin(angle + 0.6) * branchLen
          );
          ctx.moveTo(bx, by);
          ctx.lineTo(
            bx + Math.cos(angle - 0.6) * branchLen,
            by + Math.sin(angle - 0.6) * branchLen
          );
        }
        ctx.stroke();
        ctx.restore();
      } else if (c.preset === "embers") {
        // Glowing ember: radial gradient with flicker
        const flicker = 0.7 + 0.3 * Math.sin(p.life * 0.15 + p.phase);
        ctx.globalAlpha = p.opacity * fadeRatio * flicker;

        const glowSize = p.size * 2.5;
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, glowSize
        );
        gradient.addColorStop(0, "#ffdd44");
        gradient.addColorStop(0.3, p.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(
          p.x - glowSize,
          p.y - glowSize,
          glowSize * 2,
          glowSize * 2
        );

        // Bright core
        ctx.globalAlpha = p.opacity * fadeRatio * flicker * 1.2;
        ctx.fillStyle = "#ffee88";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.preset === "ash") {
        // Tumbling ash flake: rotated ellipse
        p.rotation += 0.04 + Math.sin(p.phase) * 0.02;
        const sway = Math.sin(p.life * 0.015 + p.phase) * 0.5;
        p.x += sway;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.2, p.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Slightly lighter edge for depth
        ctx.globalAlpha = p.opacity * fadeRatio * 0.3;
        ctx.strokeStyle = "#bbbbbb";
        ctx.lineWidth = 0.3;
        ctx.stroke();
        ctx.restore();
      } else if (c.preset === "dust") {
        // Dust motes with motion trail
        const drift = Math.sin(p.life * 0.01 + p.phase) * 0.6;
        p.x += drift;

        // Draw faded trail copies
        for (let trail = 2; trail >= 0; trail--) {
          const tx = p.x - p.vx * trail * 1.5;
          const ty = p.y - p.vy * trail * 1.5;
          ctx.globalAlpha = p.opacity * fadeRatio * (1 - trail * 0.35);
          ctx.beginPath();
          ctx.arc(tx, ty, p.size * (1 - trail * 0.15), 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Default: circular particle
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
