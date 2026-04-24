import type { Point, Rect, Stroke, TextOverlay } from "@/types/vtt";

/** Euclidean distance between two points */
export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Check if a point is inside a rectangle */
export function pointInRect(p: Point, r: Rect): boolean {
  return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
}

/** Check if a point is inside a circle */
export function pointInCircle(p: Point, center: Point, radius: number): boolean {
  return distance(p, center) <= radius;
}

/** Snap a point to the nearest grid intersection */
export function snapToGrid(p: Point, gridSize: number): Point {
  return {
    x: Math.round(p.x / gridSize) * gridSize,
    y: Math.round(p.y / gridSize) * gridSize,
  };
}

/** Convert screen coordinates to canvas/world coordinates */
export function screenToWorld(
  screenX: number,
  screenY: number,
  scrollX: number,
  scrollY: number,
  zoom: number,
  canvasRect: DOMRect
): Point {
  return {
    x: (screenX - canvasRect.left) / zoom + scrollX,
    y: (screenY - canvasRect.top) / zoom + scrollY,
  };
}

/** Convert world coordinates to screen coordinates */
export function worldToScreen(
  worldX: number,
  worldY: number,
  scrollX: number,
  scrollY: number,
  zoom: number,
  canvasRect: DOMRect
): Point {
  return {
    x: (worldX - scrollX) * zoom + canvasRect.left,
    y: (worldY - scrollY) * zoom + canvasRect.top,
  };
}

/** Line-line intersection test (for raycasting). Returns intersection point or null. */
export function lineIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point | null {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (Math.abs(denom) < 1e-10) return null;

  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;

  return {
    x: p1.x + ua * (p2.x - p1.x),
    y: p1.y + ua * (p2.y - p1.y),
  };
}

/** Angle from one point to another in radians */
export function angleBetween(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// --- Freehand smoothing ---

/** Decimate points by removing those closer than minDist to the previous kept point */
export function decimatePoints(points: Point[], minDist = 2): Point[] {
  if (points.length <= 2) return points;
  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (distance(points[i], result[result.length - 1]) >= minDist) {
      result.push(points[i]);
    }
  }
  result.push(points[points.length - 1]); // always keep last
  return result;
}

/** Catmull-Rom spline smoothing for freehand strokes */
export function smoothPoints(rawPoints: Point[], tension = 0.5, segments = 4): Point[] {
  const points = decimatePoints(rawPoints);
  if (points.length <= 3) return points;

  const result: Point[] = [points[0]];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    for (let t = 1; t <= segments; t++) {
      const s = t / segments;
      const s2 = s * s;
      const s3 = s2 * s;

      const x =
        0.5 *
        ((2 * p1.x) +
          (-p0.x + p2.x) * s * tension * 2 +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 * tension * 2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3 * tension * 2);
      const y =
        0.5 *
        ((2 * p1.y) +
          (-p0.y + p2.y) * s * tension * 2 +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 * tension * 2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3 * tension * 2);

      result.push({ x, y });
    }
  }

  return result;
}

// --- Hit-testing for strokes and texts ---

/** Shortest distance from point p to the line segment a→b */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distance(p, a);
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq, 0, 1);
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}

/**
 * Find the topmost stroke at a world position.
 * Iterates in reverse (last drawn = top) and uses per-stroke hit tolerance.
 */
export function findStrokeAt(pos: Point, strokes: Stroke[], defaultTolerance = 8): Stroke | null {
  for (let i = strokes.length - 1; i >= 0; i--) {
    const s = strokes[i];
    const tol = Math.max(s.width / 2 + 4, defaultTolerance);

    // Quick bounding-box reject
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pt of s.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
    if (pos.x < minX - tol || pos.x > maxX + tol || pos.y < minY - tol || pos.y > maxY + tol) {
      continue;
    }

    if (s.tool === "freehand" && s.points.length > 1) {
      for (let j = 0; j < s.points.length - 1; j++) {
        if (distanceToSegment(pos, s.points[j], s.points[j + 1]) <= tol) return s;
      }
    } else if (s.tool === "line" && s.points.length >= 2) {
      if (distanceToSegment(pos, s.points[0], s.points[1]) <= tol) return s;
    } else if (s.tool === "rect" && s.points.length >= 2) {
      const [p1, p2] = s.points;
      const corners: Point[] = [
        p1, { x: p2.x, y: p1.y }, p2, { x: p1.x, y: p2.y },
      ];
      for (let j = 0; j < 4; j++) {
        if (distanceToSegment(pos, corners[j], corners[(j + 1) % 4]) <= tol) return s;
      }
    } else if (s.tool === "circle" && s.points.length >= 2) {
      const [center, edge] = s.points;
      const r = distance(center, edge);
      const d = distance(pos, center);
      if (Math.abs(d - r) <= tol) return s;
    }
  }
  return null;
}

/**
 * Find the topmost text overlay at a world position.
 * Uses monospace character width approximation.
 */
export function findTextAt(pos: Point, texts: TextOverlay[]): TextOverlay | null {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    const approxWidth = t.text.length * t.fontSize * 0.6;
    if (
      pos.x >= t.x &&
      pos.x <= t.x + approxWidth &&
      pos.y >= t.y &&
      pos.y <= t.y + t.fontSize
    ) {
      return t;
    }
  }
  return null;
}
