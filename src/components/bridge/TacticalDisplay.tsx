import { useState, useMemo } from "react";
import type { Contact } from "@/lib/bridge/bridgeTypes";
import type { CombatPhase } from "@/lib/bridge/shipCombatRules";
import { hexDistance, hexDistanceToRangeBand, RANGE_BAND_HEX_COLORS, getHexesInRange } from "@/lib/bridge/hexCombatUtils";
import { RANGE_BAND_LABELS } from "@/lib/bridge/shipCombatRules";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface TacticalDisplayProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onShipSelect: (contact: Contact) => void;
  onShipMove: (contactId: string, hexQ: number, hexR: number) => void;
  showHidden?: boolean;
  // Combat mode props
  combatActive?: boolean;
  combatPhase?: CombatPhase;
  gridRadius?: number;
  movementRange?: number; // max hexes the selected ship can move this phase
}

export function TacticalDisplay({
  contacts,
  selectedContact,
  onShipSelect,
  onShipMove,
  showHidden = false,
  combatActive = false,
  combatPhase,
  gridRadius: gridRadiusProp,
  movementRange,
}: TacticalDisplayProps) {
  const [hoveredHex, setHoveredHex] = useState<{ q: number; r: number } | null>(null);
  const { ref, style: zoomStyle, transform, zoomIn, zoomOut, resetZoom } = usePinchZoom<HTMLDivElement>({
    minScale: 0.3,
    maxScale: 4,
  });

  const radius = gridRadiusProp ?? (combatActive ? 12 : 6);
  // Scale hex size based on grid radius
  const hexSize = radius <= 6 ? 30 : radius <= 10 ? 24 : radius <= 12 ? 20 : 16;
  const hexDrawSize = hexSize - 2; // slightly smaller for gaps
  const viewBoxSize = Math.ceil(2 * radius * hexSize * 1.8 + 80);
  const center = viewBoxSize / 2;

  const hexToPixel = (q: number, r: number) => {
    const x = hexSize * (1.5 * q);
    const y = hexSize * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    return { x: x + center, y: y + center };
  };

  const hexGrid = useMemo(() => {
    const grid: Array<{ q: number; r: number }> = [];
    for (let q = -radius; q <= radius; q += 1) {
      for (let r = -radius; r <= radius; r += 1) {
        if (Math.abs(q + r) <= radius) {
          grid.push({ q, r });
        }
      }
    }
    return grid;
  }, [radius]);

  const getHexPoints = (cx: number, cy: number, size = hexDrawSize) => {
    const points = [];
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
    }
    return points.join(" ");
  };

  const handleHexClick = (q: number, r: number) => {
    if (!selectedContact) return;
    if (combatActive && combatPhase === 'maneuver') {
      // Only allow clicks within the movement-allocated range
      if (!validMoveHexes || !validMoveHexes.has(`${q},${r}`)) return;
    } else if (combatActive && combatPhase && combatPhase !== 'setup') {
      // No repositioning during attack / actions / end phases
      return;
    }
    onShipMove(selectedContact.id, q, r);
  };

  // Find the player ship for range band calculations
  const playerShip = contacts.find(c => c.isPlayerShip);

  // Precompute range band colors for all hexes (memoized on ref ship position)
  const rangeBandFills = useMemo(() => {
    if (!combatActive) return null;
    const ref = selectedContact || playerShip;
    if (!ref) return null;
    const fills = new Map<string, string>();
    for (const { q, r } of hexGrid) {
      const dist = hexDistance(ref.hexQ, ref.hexR, q, r);
      if (dist === 0) continue;
      const band = hexDistanceToRangeBand(dist);
      const color = RANGE_BAND_HEX_COLORS[band];
      if (color) fills.set(`${q},${r}`, color);
    }
    return fills;
  }, [combatActive, selectedContact, playerShip, hexGrid]);

  // Movement range highlighting
  const validMoveHexes = useMemo(() => {
    if (!combatActive || combatPhase !== 'maneuver' || !selectedContact || !movementRange) return null;
    const hexes = getHexesInRange(selectedContact.hexQ, selectedContact.hexR, movementRange);
    return new Set(hexes.map(h => `${h.q},${h.r}`));
  }, [combatActive, combatPhase, selectedContact, movementRange]);

  // Range band labels for concentric rings
  const rangeBandRings = useMemo(() => {
    if (!combatActive) return [];
    const refShip = selectedContact || playerShip;
    if (!refShip) return [];

    const bands = [
      { label: 'ADJ', dist: 1 },
      { label: 'CLOSE', dist: 2 },
      { label: 'SHORT', dist: 4 },
      { label: 'MEDIUM', dist: 7 },
      { label: 'LONG', dist: 10 },
      { label: 'V.LONG', dist: 14 },
    ].filter(b => b.dist <= radius);

    return bands.map(b => {
      const pixelDist = hexSize * Math.sqrt(3) * b.dist;
      return { ...b, pixelDist };
    });
  }, [combatActive, selectedContact, playerShip, hexSize, radius]);

  const shipIcon = (contact: Contact, cx: number, cy: number) => {
    const colorVar = contact.status === "friendly"
      ? "var(--primary-light)"
      : contact.status === "enemy"
        ? "var(--danger-alt)"
        : contact.status === "derelict"
          ? "var(--neutral)"
          : "var(--secondary)";
    const rotation = contact.facing * 60;

    if (contact.isPlayerShip) {
      return (
        <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
          <polygon points="0,-14 10,10 0,5 -10,10" fill={colorVar} style={{ filter: `drop-shadow(0 0 8px ${colorVar})` }} />
        </g>
      );
    }
    if (contact.status === "unknown") {
      return <circle cx={cx} cy={cy} r={8} fill={colorVar} style={{ filter: `drop-shadow(0 0 6px ${colorVar})` }} />;
    }
    return (
      <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
        <polygon points="0,-10 7,7 0,3 -7,7" fill={colorVar} style={{ filter: `drop-shadow(0 0 6px ${colorVar})` }} />
      </g>
    );
  };

  // Mini hull bar underneath ship markers during combat
  const hullBar = (contact: Contact, cx: number, cy: number) => {
    if (!combatActive || !contact.isInCombat) return null;
    const hullMax = contact.hullMax ?? 1;
    const hullCurrent = contact.hullCurrent ?? hullMax;
    const pct = Math.max(0, Math.min(1, hullCurrent / hullMax));
    const barWidth = 20;
    const barHeight = 3;
    const barX = cx - barWidth / 2;
    const barY = cy + 16;
    const color = pct > 0.5 ? 'var(--primary-light)' : pct > 0.25 ? 'var(--warning-alt)' : 'var(--danger-alt)';

    return (
      <g>
        <rect x={barX} y={barY} width={barWidth} height={barHeight} fill="rgba(255,255,255,0.1)" rx={1} />
        <rect x={barX} y={barY} width={barWidth * pct} height={barHeight} fill={color} rx={1} />
      </g>
    );
  };

  // Range band label from hovered hex
  const hoveredRangeBandLabel = useMemo(() => {
    if (!combatActive || !hoveredHex) return null;
    const refShip = selectedContact || playerShip;
    if (!refShip) return null;
    const dist = hexDistance(refShip.hexQ, refShip.hexR, hoveredHex.q, hoveredHex.r);
    const band = hexDistanceToRangeBand(dist);
    return `${RANGE_BAND_LABELS[band]} (${dist} hex)`;
  }, [combatActive, hoveredHex, selectedContact, playerShip]);

  const refShip = selectedContact || playerShip;
  const refShipPos = refShip
    ? hexToPixel(refShip.hexQ, refShip.hexR)
    : null;

  return (
    <div className={`tactical-display flex-1 flex flex-col bg-terminal-bg-panel-alt border border-terminal-bg-border rounded overflow-hidden ${combatActive ? '' : 'max-h-[350px] md:max-h-[600px]'}`}>
      <div className="panel-header flex justify-between items-center px-3 md:px-4 py-2 bg-terminal-primary-light/5 border-b border-terminal-bg-border">
        <span className="font-['Orbitron'] text-[0.6rem] md:text-xs tracking-[2px] md:tracking-[3px] text-terminal-text-dimmer">
          {combatActive ? 'COMBAT' : 'NAVIGATION'}
        </span>
        <span className="font-['Orbitron'] text-[0.6rem] md:text-xs tracking-[2px] text-terminal-primary-light">TACTICAL VIEW</span>
        {combatActive && hoveredRangeBandLabel && (
          <span className="font-['Share_Tech_Mono'] text-[0.6rem] text-terminal-secondary">{hoveredRangeBandLabel}</span>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Zoom controls */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          <button
            onClick={zoomIn}
            className="p-1.5 bg-terminal-bg-dark/80 border border-terminal-bg-border rounded hover:bg-terminal-primary/10 hover:border-terminal-primary/40 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4 text-terminal-text-dimmer" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 bg-terminal-bg-dark/80 border border-terminal-bg-border rounded hover:bg-terminal-primary/10 hover:border-terminal-primary/40 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4 text-terminal-text-dimmer" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 bg-terminal-bg-dark/80 border border-terminal-bg-border rounded hover:bg-terminal-primary/10 hover:border-terminal-primary/40 transition-colors"
            title="Reset zoom"
          >
            <Maximize2 className="h-4 w-4 text-terminal-text-dimmer" />
          </button>
          {transform.scale !== 1 && (
            <span className="text-[0.55rem] text-terminal-text-dimmer text-center font-mono">{Math.round(transform.scale * 100)}%</span>
          )}
        </div>
      <div
        ref={ref}
        className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-hidden touch-none h-full"
        style={{ background: "radial-gradient(ellipse at center, rgba(0, 255, 136, 0.02) 0%, transparent 70%)" }}
      >
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full" style={zoomStyle}>
          {/* Range band rings */}
          {combatActive && refShipPos ? (
            rangeBandRings.map(ring => (
              <g key={ring.label}>
                <circle
                  cx={refShipPos.x}
                  cy={refShipPos.y}
                  r={ring.pixelDist}
                  fill="none"
                  stroke="var(--bg-border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={refShipPos.x + 5}
                  y={refShipPos.y - ring.pixelDist + 12}
                  fill="var(--text-dimmer)"
                  fontSize="8"
                  fontFamily="Share Tech Mono"
                >
                  {ring.label}
                </text>
              </g>
            ))
          ) : (
            <>
              <circle cx={center} cy={center} r={60} fill="none" stroke="var(--bg-border)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={center} cy={center} r={120} fill="none" stroke="var(--bg-border)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={center} cy={center} r={180} fill="none" stroke="var(--bg-border)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={center + 5} y={center - 55} fill="var(--text-dimmer)" fontSize="9" fontFamily="Share Tech Mono">CLOSE</text>
              <text x={center + 5} y={center - 115} fill="var(--text-dimmer)" fontSize="9" fontFamily="Share Tech Mono">SHORT</text>
              <text x={center + 5} y={center - 175} fill="var(--text-dimmer)" fontSize="9" fontFamily="Share Tech Mono">MEDIUM</text>
            </>
          )}

          {/* Crosshair lines */}
          <line x1={center} y1={50} x2={center} y2={viewBoxSize - 50} stroke="var(--primary-mid)" strokeWidth="1" opacity="0.3" />
          <line x1={50} y1={center} x2={viewBoxSize - 50} y2={center} stroke="var(--primary-mid)" strokeWidth="1" opacity="0.3" />

          {/* Hex grid */}
          <g className="hex-grid" opacity={combatActive ? 0.6 : 0.4}>
            {hexGrid.map(({ q, r }) => {
              const { x, y } = hexToPixel(q, r);
              const isHovered = hoveredHex?.q === q && hoveredHex?.r === r;
              const hasShip = contacts.some(c => c.hexQ === q && c.hexR === r);
              const rangeFill = rangeBandFills?.get(`${q},${r}`) ?? null;
              const isValidMove = validMoveHexes?.has(`${q},${r}`);

              // During maneuver phase with movement range defined, mark out-of-range hexes
              const isOutOfMoveRange = combatActive && combatPhase === 'maneuver'
                && movementRange !== undefined && !isValidMove;

              let fill = "transparent";
              if (isHovered && (isValidMove || !combatActive || combatPhase === 'setup')) {
                fill = "rgba(0, 255, 136, 0.15)";
              } else if (isValidMove) {
                fill = "rgba(0, 255, 136, 0.08)";
              } else if (isOutOfMoveRange) {
                fill = "rgba(255, 0, 0, 0.03)"; // subtle red tint on unreachable hexes
              } else if (rangeFill) {
                fill = rangeFill;
              }

              let stroke = hasShip ? "var(--primary-mid)" : "var(--bg-border)";
              if (isValidMove && !isHovered) stroke = "var(--primary-mid)";
              if (isOutOfMoveRange) stroke = "rgba(255,80,80,0.15)";

              // Determine click affordance
              const isClickable = !combatActive
                || combatPhase === 'setup'
                || (combatPhase === 'maneuver' && isValidMove);

              return (
                <polygon
                  key={`${q},${r}`}
                  points={getHexPoints(x, y)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1"
                  className={`${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} transition-all duration-150`}
                  onMouseEnter={() => setHoveredHex({ q, r })}
                  onMouseLeave={() => setHoveredHex(null)}
                  onClick={() => handleHexClick(q, r)}
                />
              );
            })}
          </g>

          {/* Movement path preview */}
          {combatActive && combatPhase === 'maneuver' && selectedContact && hoveredHex && (() => {
            const from = hexToPixel(selectedContact.hexQ, selectedContact.hexR);
            const to = hexToPixel(hoveredHex.q, hoveredHex.r);
            return (
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="var(--primary-light)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
            );
          })()}

          {/* Ship markers */}
          {contacts
            .filter(contact => showHidden || !contact.isHidden)
            .map(contact => {
              const { x, y } = hexToPixel(contact.hexQ, contact.hexR);
              const isSelected = selectedContact?.id === contact.id;
              const colorVar = contact.status === "friendly"
                ? "var(--primary-light)"
                : contact.status === "enemy"
                  ? "var(--danger-alt)"
                  : contact.status === "derelict"
                    ? "var(--neutral)"
                    : "var(--secondary)";

              return (
                <g
                  key={contact.id}
                  className="ship-marker cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    onShipSelect(contact);
                  }}
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={20}
                      fill="none"
                      stroke={colorVar}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      opacity="0.6"
                    >
                      <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="10s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Hidden ship indicator */}
                  {contact.isHidden && showHidden && (
                    <circle
                      cx={x}
                      cy={y}
                      r={16}
                      fill="none"
                      stroke="var(--text-dimmer)"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                      opacity="0.4"
                    />
                  )}

                  {shipIcon(contact, x, y)}
                  {hullBar(contact, x, y)}

                  <text x={x} y={y + (contact.isInCombat ? 28 : 24)} fill={colorVar} fontSize="8" fontFamily="Share Tech Mono" textAnchor="middle">
                    {contact.name}
                  </text>

                  {/* Range band badge during combat */}
                  {combatActive && contact.isInCombat && playerShip && !contact.isPlayerShip && (
                    <text
                      x={x}
                      y={y - 18}
                      fill="var(--text-dimmer)"
                      fontSize="7"
                      fontFamily="Share Tech Mono"
                      textAnchor="middle"
                    >
                      {RANGE_BAND_LABELS[hexDistanceToRangeBand(hexDistance(playerShip.hexQ, playerShip.hexR, contact.hexQ, contact.hexR))]}
                    </text>
                  )}
                </g>
              );
            })}

          {/* Hover target indicator */}
          {selectedContact && hoveredHex && (() => {
            const { x, y } = hexToPixel(hoveredHex.q, hoveredHex.r);
            return (
              <circle
                cx={x}
                cy={y}
                r={12}
                fill="none"
                stroke="var(--primary-light)"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.8"
              >
                <animate attributeName="r" values="12;16;12" dur="1s" repeatCount="indefinite" />
              </circle>
            );
          })()}
        </svg>
      </div>
      </div>

      <div className="flex justify-center gap-4 md:gap-8 py-2 border-t border-terminal-bg-border text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-terminal-primary-light shadow-[0_0_4px_var(--primary-light)]" />
          <span className="text-terminal-text-dimmer">FRIENDLY</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-terminal-secondary shadow-[0_0_4px_var(--secondary)]" />
          <span className="text-terminal-text-dimmer">UNKNOWN</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-terminal-danger-alt shadow-[0_0_4px_var(--danger-alt)]" />
          <span className="text-terminal-text-dimmer">HOSTILE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-terminal-neutral shadow-[0_0_4px_var(--neutral)]" />
          <span className="text-terminal-text-dimmer">DERELICT</span>
        </div>
      </div>

      {selectedContact && (
        <div className="px-4 py-2 border-t border-terminal-bg-border bg-terminal-primary-light/5 text-xs">
          <span className="text-terminal-text-dimmer">SELECTED: </span>
          <span
            className={`font-bold ${
              selectedContact.status === "friendly"
                ? "text-terminal-primary-light"
                : selectedContact.status === "enemy"
                  ? "text-terminal-danger-alt"
                  : "text-terminal-secondary"
            }`}
          >
            {selectedContact.name}
          </span>
          {selectedContact.shipClass && <span className="text-terminal-text-dimmer ml-2">({selectedContact.shipClass})</span>}
          {combatActive && selectedContact.isInCombat && (
            <>
              {selectedContact.hullCurrent != null && selectedContact.hullMax != null && (
                <span className="text-terminal-text-dimmer ml-3">Hull: {selectedContact.hullCurrent}/{selectedContact.hullMax}</span>
              )}
              {selectedContact.thrust != null && (
                <span className="text-terminal-text-dimmer ml-3">Thrust: {selectedContact.thrust}</span>
              )}
            </>
          )}
          <span className="text-terminal-text-dimmer ml-4">
            {combatActive && combatPhase === 'maneuver'
              ? movementRange
                ? `Click highlighted hex to move (${movementRange} hex range)`
                : 'Allocate movement thrust in sidebar to move'
              : combatActive && combatPhase && combatPhase !== 'setup'
                ? 'No movement outside maneuver phase'
                : 'Click hex to reposition'}
          </span>
        </div>
      )}
    </div>
  );
}
