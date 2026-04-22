import type { BoundingBox, Point } from "@/types/vtt";

export type HandleType =
  | "resize-tl" | "resize-tr" | "resize-bl" | "resize-br"
  | "rotate-tl" | "rotate-tr" | "rotate-bl" | "rotate-br"
  | null;

const HANDLE_SIZE = 6; // px in screen space
const ROTATE_OFFSET = 20; // px in screen space

/** Render bounding box with resize and rotate handles */
export function renderBoundingBoxHandles(
  ctx: CanvasRenderingContext2D,
  bbox: BoundingBox,
  zoom: number
): void {
  const hs = HANDLE_SIZE / zoom;
  const hw = bbox.width / 2;
  const hh = bbox.height / 2;
  const rotOff = ROTATE_OFFSET / zoom;

  ctx.save();
  ctx.translate(bbox.cx, bbox.cy);
  ctx.rotate((bbox.rotation * Math.PI) / 180);

  // Dashed bounding rectangle
  ctx.strokeStyle = "#3ae2b3";
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([4 / zoom, 3 / zoom]);
  ctx.strokeRect(-hw, -hh, bbox.width, bbox.height);
  ctx.setLineDash([]);

  // Corner resize handles (green squares)
  const corners: Point[] = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: -hw, y: hh },
    { x: hw, y: hh },
  ];

  ctx.fillStyle = "#3ae2b3";
  ctx.strokeStyle = "#003300";
  ctx.lineWidth = 1 / zoom;
  for (const c of corners) {
    ctx.fillRect(c.x - hs, c.y - hs, hs * 2, hs * 2);
    ctx.strokeRect(c.x - hs, c.y - hs, hs * 2, hs * 2);
  }

  // Rotation handles (cyan circles at corners, offset outward)
  const rotCorners: Point[] = [
    { x: -hw - rotOff, y: -hh - rotOff },
    { x: hw + rotOff, y: -hh - rotOff },
    { x: -hw - rotOff, y: hh + rotOff },
    { x: hw + rotOff, y: hh + rotOff },
  ];

  ctx.fillStyle = "#00ccff";
  ctx.strokeStyle = "#003344";
  for (const rc of rotCorners) {
    // Dashed line from corner to rotation handle
    ctx.setLineDash([2 / zoom, 2 / zoom]);
    ctx.strokeStyle = "#00ccff44";
    ctx.lineWidth = 1 / zoom;
    const nearCorner = {
      x: rc.x < 0 ? -hw : hw,
      y: rc.y < 0 ? -hh : hh,
    };
    ctx.beginPath();
    ctx.moveTo(nearCorner.x, nearCorner.y);
    ctx.lineTo(rc.x, rc.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotation dot
    ctx.fillStyle = "#00ccff";
    ctx.strokeStyle = "#003344";
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.arc(rc.x, rc.y, hs * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Dimension label
  ctx.fillStyle = "#3ae2b3cc";
  ctx.font = `${Math.max(10, 10 / zoom)}px "Share Tech Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(
    `${Math.round(bbox.width)}×${Math.round(bbox.height)}`,
    0,
    hh + 8 / zoom
  );

  ctx.restore();
}

/** Hit-test handles — returns which handle (if any) a world point is touching */
export function hitTestHandles(
  worldPos: Point,
  bbox: BoundingBox,
  zoom: number
): HandleType {
  const hs = (HANDLE_SIZE + 2) / zoom; // slightly larger hit area
  const rotOff = ROTATE_OFFSET / zoom;
  const hw = bbox.width / 2;
  const hh = bbox.height / 2;

  // Transform world pos into bbox-local space
  const rad = -(bbox.rotation * Math.PI) / 180;
  const dx = worldPos.x - bbox.cx;
  const dy = worldPos.y - bbox.cy;
  const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ly = dx * Math.sin(rad) + dy * Math.cos(rad);

  // Check rotation handles first (they're outside, so prioritize)
  const rotCorners: { type: HandleType; x: number; y: number }[] = [
    { type: "rotate-tl", x: -hw - rotOff, y: -hh - rotOff },
    { type: "rotate-tr", x: hw + rotOff, y: -hh - rotOff },
    { type: "rotate-bl", x: -hw - rotOff, y: hh + rotOff },
    { type: "rotate-br", x: hw + rotOff, y: hh + rotOff },
  ];
  for (const rc of rotCorners) {
    if (Math.abs(lx - rc.x) <= hs && Math.abs(ly - rc.y) <= hs) {
      return rc.type;
    }
  }

  // Check resize handles
  const resizeCorners: { type: HandleType; x: number; y: number }[] = [
    { type: "resize-tl", x: -hw, y: -hh },
    { type: "resize-tr", x: hw, y: -hh },
    { type: "resize-bl", x: -hw, y: hh },
    { type: "resize-br", x: hw, y: hh },
  ];
  for (const c of resizeCorners) {
    if (Math.abs(lx - c.x) <= hs && Math.abs(ly - c.y) <= hs) {
      return c.type;
    }
  }

  return null;
}

/** Compute new scale based on resize handle drag */
export function computeResizeFromHandle(
  handle: HandleType,
  dragStart: Point,
  dragCurrent: Point,
  originalBBox: BoundingBox
): { scaleX: number; scaleY: number } {
  if (!handle?.startsWith("resize-")) return { scaleX: 1, scaleY: 1 };

  const dx = dragCurrent.x - dragStart.x;
  const dy = dragCurrent.y - dragStart.y;
  const hw = originalBBox.width / 2;
  const hh = originalBBox.height / 2;

  let scaleX = 1;
  let scaleY = 1;

  if (handle.includes("r")) scaleX = (hw + dx) / hw;
  if (handle.includes("l")) scaleX = (hw - dx) / hw;
  if (handle.includes("b")) scaleY = (hh + dy) / hh;
  if (handle.includes("t")) scaleY = (hh - dy) / hh;

  return {
    scaleX: Math.max(0.1, scaleX),
    scaleY: Math.max(0.1, scaleY),
  };
}

/** Compute new rotation from rotate handle drag */
export function computeRotationFromHandle(
  center: Point,
  dragCurrent: Point
): number {
  const angle = Math.atan2(dragCurrent.y - center.y, dragCurrent.x - center.x);
  return ((angle * 180) / Math.PI + 90 + 360) % 360;
}
