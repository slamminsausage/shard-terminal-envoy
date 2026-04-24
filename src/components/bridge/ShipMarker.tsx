import { Contact } from "@/lib/bridge/bridgeTypes";

interface ShipMarkerProps {
  contact: Contact;
  x?: number;
  y?: number;
  onClick?: () => void;
}

const statusColor: Record<Contact["status"], string> = {
  friendly: "#3ae2b3",
  unknown: "#00ccff",
  enemy: "#ff4455",
  derelict: "#9ca3af" // gray
};

export function ShipMarker({ contact, x = 250, y = 250, onClick }: ShipMarkerProps) {
  const color = statusColor[contact.status] ?? "#00ccff";
  return (
    <g onClick={onClick} className="ship-marker" style={{ cursor: "pointer", color }}>
      <g filter="drop-shadow(0px 0px 6px currentColor)">
        <polygon
          points={`${x},${y - 12} ${x + 10},${y + 12} ${x - 10},${y + 12}`}
          transform={`rotate(${contact.facing * 60}, ${x}, ${y})`}
          fill="currentColor"
          opacity={contact.isPlayerShip ? 0.95 : 0.7}
        />
      </g>
      <text x={x + 12} y={y + 4} fill="currentColor" fontSize="10" fontFamily="monospace">
        {contact.name}
      </text>
    </g>
  );
}
