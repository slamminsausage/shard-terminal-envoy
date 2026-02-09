import type { Point, Rect } from "@/types/vtt";

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
