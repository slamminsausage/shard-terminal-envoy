import { useState } from "react";
import type { Contact } from "@/lib/bridge/bridgeTypes";

interface TacticalDisplayProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onShipSelect: (contact: Contact) => void;
  onShipMove: (contactId: string, hexQ: number, hexR: number) => void;
  showHidden?: boolean;
}

export function TacticalDisplay({
  contacts,
  selectedContact,
  onShipSelect,
  onShipMove,
  showHidden = false
}: TacticalDisplayProps) {
  const [hoveredHex, setHoveredHex] = useState<{ q: number; r: number } | null>(null);

  const hexToPixel = (q: number, r: number, size = 30) => {
    const x = size * (1.5 * q);
    const y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    return { x: x + 250, y: y + 250 };
  };

  const hexGrid: Array<{ q: number; r: number }> = [];
  const radius = 6;
  for (let q = -radius; q <= radius; q += 1) {
    for (let r = -radius; r <= radius; r += 1) {
      if (Math.abs(q + r) <= radius) {
        hexGrid.push({ q, r });
      }
    }
  }

  const getHexPoints = (cx: number, cy: number, size = 28) => {
    const points = [];
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
    }
    return points.join(" ");
  };

  const handleHexClick = (q: number, r: number) => {
    if (selectedContact) {
      onShipMove(selectedContact.id, q, r);
    }
  };

  const shipIcon = (contact: Contact, cx: number, cy: number) => {
    const color = contact.status === "friendly"
      ? "#00ff88"
      : contact.status === "enemy"
        ? "#ff4455"
        : contact.status === "derelict"
          ? "#aaaaaa"
          : "#00ccff";
    const rotation = contact.facing * 60;

    if (contact.isPlayerShip) {
      return (
        <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
          <polygon points="0,-14 10,10 0,5 -10,10" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        </g>
      );
    }
    if (contact.status === "unknown") {
      return <circle cx={cx} cy={cy} r={8} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />;
    }
    return (
      <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
        <polygon points="0,-10 7,7 0,3 -7,7" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </g>
    );
  };

  return (
    <div className="tactical-display flex-1 flex flex-col bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden max-h-[350px] md:max-h-[600px]">
      <div className="panel-header flex justify-between items-center px-3 md:px-4 py-2 bg-[#00ff8808] border-b border-[#1a2420]">
        <span className="font-['Orbitron'] text-[0.6rem] md:text-xs tracking-[2px] md:tracking-[3px] text-[#446655]">NAVIGATION</span>
        <span className="font-['Orbitron'] text-[0.6rem] md:text-xs tracking-[2px] text-[#00ff88]">TACTICAL VIEW</span>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-hidden"
        style={{ background: "radial-gradient(ellipse at center, rgba(0, 255, 136, 0.02) 0%, transparent 70%)" }}
      >
        <svg viewBox="0 0 500 500" className="w-full h-full max-w-full md:max-w-[500px] max-h-full md:max-h-[500px]">
          <circle cx="250" cy="250" r="60" fill="none" stroke="#1a2420" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="120" fill="none" stroke="#1a2420" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="180" fill="none" stroke="#1a2420" strokeWidth="1" strokeDasharray="4 4" />

          <text x="255" y="195" fill="#446655" fontSize="9" fontFamily="Share Tech Mono">
            CLOSE
          </text>
          <text x="255" y="135" fill="#446655" fontSize="9" fontFamily="Share Tech Mono">
            SHORT
          </text>
          <text x="255" y="75" fill="#446655" fontSize="9" fontFamily="Share Tech Mono">
            MEDIUM
          </text>

          <line x1="250" y1="50" x2="250" y2="450" stroke="#00aa55" strokeWidth="1" opacity="0.3" />
          <line x1="50" y1="250" x2="450" y2="250" stroke="#00aa55" strokeWidth="1" opacity="0.3" />

          <g className="hex-grid" opacity="0.4">
            {hexGrid.map(({ q, r }) => {
              const { x, y } = hexToPixel(q, r);
              const isHovered = hoveredHex?.q === q && hoveredHex?.r === r;
              const hasShip = contacts.some(c => c.hexQ === q && c.hexR === r);

              return (
                <polygon
                  key={`${q},${r}`}
                  points={getHexPoints(x, y)}
                  fill={isHovered ? "rgba(0, 255, 136, 0.1)" : "transparent"}
                  stroke={hasShip ? "#00aa55" : "#1a2420"}
                  strokeWidth="1"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredHex({ q, r })}
                  onMouseLeave={() => setHoveredHex(null)}
                  onClick={() => handleHexClick(q, r)}
                />
              );
            })}
          </g>

          {contacts
            .filter(contact => showHidden || !contact.isHidden)
            .map(contact => {
            const { x, y } = hexToPixel(contact.hexQ, contact.hexR);
            const isSelected = selectedContact?.id === contact.id;
            const color = contact.status === "friendly" ? "#00ff88" : contact.status === "enemy" ? "#ff4455" : "#00ccff";

            return (
              <g
                key={contact.id}
                className="ship-marker cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  onShipSelect(contact);
                }}
              >
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={20}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  >
                    <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="10s" repeatCount="indefinite" />
                  </circle>
                )}

                {shipIcon(contact, x, y)}

                <text x={x} y={y + 24} fill={color} fontSize="8" fontFamily="Share Tech Mono" textAnchor="middle">
                  {contact.name}
                </text>
              </g>
            );
          })}

          {selectedContact && hoveredHex && (() => {
            const { x, y } = hexToPixel(hoveredHex.q, hoveredHex.r);
            return (
              <circle
                cx={x}
                cy={y}
                r={12}
                fill="none"
                stroke="#00ff88"
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

      <div className="flex justify-center gap-8 py-2 border-t border-[#1a2420] text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_4px_#00ff88]" />
          <span className="text-[#446655]">FRIENDLY</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ccff] shadow-[0_0_4px_#00ccff]" />
          <span className="text-[#446655]">UNKNOWN</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff4455] shadow-[0_0_4px_#ff4455]" />
          <span className="text-[#446655]">HOSTILE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#aaaaaa] shadow-[0_0_4px_#aaaaaa]" />
          <span className="text-[#446655]">DERELICT</span>
        </div>
      </div>

      {selectedContact && (
        <div className="px-4 py-2 border-t border-[#1a2420] bg-[#00ff8805] text-xs">
          <span className="text-[#446655]">SELECTED: </span>
          <span
            className={`font-bold ${
              selectedContact.status === "friendly"
                ? "text-[#00ff88]"
                : selectedContact.status === "enemy"
                  ? "text-[#ff4455]"
                  : "text-[#00ccff]"
            }`}
          >
            {selectedContact.name}
          </span>
          {selectedContact.shipClass && <span className="text-[#446655] ml-2">({selectedContact.shipClass})</span>}
          <span className="text-[#446655] ml-4">Click a hex to move</span>
        </div>
      )}
    </div>
  );
}
