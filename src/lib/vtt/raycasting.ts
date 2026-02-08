import type { Point, Wall, LightSource } from "@/types/vtt";

/**
 * Cast a ray from origin in a given direction and find the closest
 * intersection with any wall segment.
 */
function castRay(
  origin: Point,
  angle: number,
  walls: Wall[],
  maxDist: number
): Point {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const far: Point = {
    x: origin.x + dx * maxDist,
    y: origin.y + dy * maxDist,
  };

  let closest = far;
  let closestDist = maxDist * maxDist;

  for (const w of walls) {
    // Skip open doors
    if (w.type === "door" && w.doorOpen) continue;

    const hit = segmentIntersection(
      origin.x, origin.y, far.x, far.y,
      w.x1, w.y1, w.x2, w.y2
    );
    if (hit) {
      const d = (hit.x - origin.x) ** 2 + (hit.y - origin.y) ** 2;
      if (d < closestDist) {
        closestDist = d;
        closest = hit;
      }
    }
  }

  return closest;
}

/**
 * Segment-segment intersection.
 * Returns the intersection point or null if segments don't intersect.
 */
function segmentIntersection(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): Point | null {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (Math.abs(denom) < 1e-10) return null;

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;

  return {
    x: x1 + ua * (x2 - x1),
    y: y1 + ua * (y2 - y1),
  };
}

/**
 * Compute a visibility polygon for a light source by casting rays
 * toward each wall endpoint (with slight angular offsets) and sorting
 * the results by angle to form a closed polygon.
 */
export function computeVisibilityPolygon(
  origin: Point,
  walls: Wall[],
  radius: number
): Point[] {
  if (walls.length === 0) {
    // No walls: full circle
    const steps = 32;
    return Array.from({ length: steps }, (_, i) => {
      const a = (i / steps) * Math.PI * 2;
      return {
        x: origin.x + Math.cos(a) * radius,
        y: origin.y + Math.sin(a) * radius,
      };
    });
  }

  // Collect unique angles toward every wall endpoint
  const angles = new Set<number>();

  for (const w of walls) {
    if (w.type === "door" && w.doorOpen) continue;

    for (const pt of [
      { x: w.x1, y: w.y1 },
      { x: w.x2, y: w.y2 },
    ]) {
      const a = Math.atan2(pt.y - origin.y, pt.x - origin.x);
      // Cast 3 rays: direct, and tiny offsets to catch edges
      angles.add(a - 0.0001);
      angles.add(a);
      angles.add(a + 0.0001);
    }
  }

  // Also add boundary angles for the light radius circle
  const boundarySteps = 16;
  for (let i = 0; i < boundarySteps; i++) {
    angles.add((i / boundarySteps) * Math.PI * 2);
  }

  // Cast rays and collect intersection points
  const points: { angle: number; point: Point }[] = [];

  for (const angle of angles) {
    const hit = castRay(origin, angle, walls, radius);

    // Clamp to radius
    const dx = hit.x - origin.x;
    const dy = hit.y - origin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped =
      dist > radius
        ? {
            x: origin.x + (dx / dist) * radius,
            y: origin.y + (dy / dist) * radius,
          }
        : hit;

    points.push({ angle, point: clamped });
  }

  // Sort by angle
  points.sort((a, b) => a.angle - b.angle);

  return points.map((p) => p.point);
}

/**
 * Render dynamic lighting on a canvas context.
 * Draws light cones for each source, masked by walls via raycasting.
 */
export function renderDynamicLighting(
  ctx: CanvasRenderingContext2D,
  lights: LightSource[],
  walls: Wall[],
  canvasWidth: number,
  canvasHeight: number
) {
  if (lights.length === 0) return;

  ctx.save();

  for (const light of lights) {
    const polygon = computeVisibilityPolygon(
      { x: light.x, y: light.y },
      walls,
      light.radius
    );

    if (polygon.length < 3) continue;

    // Create radial gradient for the light
    const gradient = ctx.createRadialGradient(
      light.x, light.y, 0,
      light.x, light.y, light.radius
    );
    const baseColor = light.color || "#ffcc44";
    gradient.addColorStop(0, baseColor + alphaHex(light.intensity * 0.6));
    gradient.addColorStop(0.5, baseColor + alphaHex(light.intensity * 0.3));
    gradient.addColorStop(1, baseColor + "00");

    // Draw the visibility polygon filled with the gradient
    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i].x, polygon[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  ctx.restore();
}

/** Convert a 0-1 intensity to a 2-char hex alpha value */
function alphaHex(intensity: number): string {
  const clamped = Math.max(0, Math.min(1, intensity));
  const hex = Math.round(clamped * 255).toString(16);
  return hex.padStart(2, "0");
}
