import type { BoundingBox, Token, Stroke, TextOverlay, MapNote } from "@/types/vtt";

/** Compute bounding box for a token */
export function getTokenBoundingBox(token: Token, gridSize: number): BoundingBox {
  const pixelSize = token.size * gridSize;
  return {
    cx: token.x,
    cy: token.y,
    width: pixelSize,
    height: pixelSize,
    rotation: token.rotation,
  };
}

/** Compute bounding box for a stroke (before rotation/scale transforms) */
export function getStrokeBoundingBox(stroke: Stroke): BoundingBox {
  if (stroke.points.length === 0) {
    return { cx: 0, cy: 0, width: 0, height: 0, rotation: 0 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of stroke.points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  // For circles, expand to include the full radius
  if (stroke.tool === "circle" && stroke.points.length >= 2) {
    const [center, edge] = stroke.points;
    const dx = edge.x - center.x;
    const dy = edge.y - center.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    minX = center.x - r;
    maxX = center.x + r;
    minY = center.y - r;
    maxY = center.y + r;
  }

  const w = maxX - minX;
  const h = maxY - minY;

  return {
    cx: minX + w / 2,
    cy: minY + h / 2,
    width: Math.max(w, stroke.width),
    height: Math.max(h, stroke.width),
    rotation: stroke.rotation ?? 0,
  };
}

/** Compute bounding box for a text overlay (approximate width) */
export function getTextBoundingBox(text: TextOverlay): BoundingBox {
  const approxWidth = text.text.length * text.fontSize * 0.6;
  const scaleX = text.scaleX ?? 1;
  const scaleY = text.scaleY ?? 1;
  const w = approxWidth * scaleX;
  const h = text.fontSize * scaleY;

  return {
    cx: text.x + w / 2,
    cy: text.y + h / 2,
    width: w,
    height: h,
    rotation: text.rotation ?? 0,
  };
}

/** Compute bounding box for a map note */
export function getNoteBoundingBox(note: MapNote): BoundingBox {
  const scale = note.scale ?? 1;
  const size = 16 * scale;
  return {
    cx: note.x,
    cy: note.y,
    width: size,
    height: size,
    rotation: note.rotation ?? 0,
  };
}

/** Compute union bounding box from multiple boxes (ignores rotation) */
export function getUnionBoundingBox(boxes: BoundingBox[]): BoundingBox {
  if (boxes.length === 0) return { cx: 0, cy: 0, width: 0, height: 0, rotation: 0 };
  if (boxes.length === 1) return boxes[0];

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const b of boxes) {
    const hw = b.width / 2;
    const hh = b.height / 2;
    minX = Math.min(minX, b.cx - hw);
    maxX = Math.max(maxX, b.cx + hw);
    minY = Math.min(minY, b.cy - hh);
    maxY = Math.max(maxY, b.cy + hh);
  }

  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY,
    rotation: 0,
  };
}
