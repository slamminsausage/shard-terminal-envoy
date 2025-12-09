import type { Contact } from "@/lib/bridge/bridgeTypes";

interface ContactsListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onContactClick: (contact: Contact) => void;
  onAddClick: () => void;
  onRemoveContact: (contactId: string) => void;
  onUpdateStatus: (contactId: string, status: "friendly" | "unknown" | "enemy" | "derelict") => void;
  showHidden?: boolean;
}

export function ContactsList({
  contacts,
  selectedContact,
  onContactClick,
  onAddClick,
  onRemoveContact,
  onUpdateStatus,
  showHidden = false
}: ContactsListProps) {
  const calculateBearing = (q: number, r: number): string => {
    if (q === 0 && r === 0) return "--";
    const angle = Math.atan2(r, q) * (180 / Math.PI);
    const bearing = (90 - angle + 360) % 360;
    return `${Math.round(bearing)}deg`;
  };

  const calculateRange = (q: number, r: number): string => {
    if (q === 0 && r === 0) return "--";
    const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
    return `${distance * 10}km`;
  };

  return (
    <div className="contacts-panel bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden">
      <div className="panel-header flex justify-between items-center px-4 py-2 bg-[#00ff8808] border-b border-[#1a2420]">
        <span className="font-['Orbitron'] text-xs tracking-[3px] text-[#446655]">CONTACTS</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#00ff88]">{contacts.length} DETECTED</span>
          <button
            onClick={onAddClick}
            className="text-xs text-[#00ff88] hover:text-white transition-colors"
          >
            + ADD
          </button>
        </div>
      </div>

      <div className="max-h-[180px] overflow-y-auto">
        {contacts
          .filter(contact => showHidden || !contact.isHidden)
          .map(contact => {
          const isSelected = selectedContact?.id === contact.id;
          const statusColor = contact.status === "friendly"
            ? "#00ff88"
            : contact.status === "enemy"
              ? "#ff4455"
              : contact.status === "derelict"
                ? "#aaaaaa"
                : "#00ccff";

          return (
            <div
              key={contact.id}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-all text-xs hover:bg-[#00ff8808] ${isSelected ? "bg-[#00ff8810]" : ""}`}
              onClick={() => onContactClick(contact)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
              />
              <span className="flex-1 truncate" style={{ color: statusColor }}>
                {contact.name} {contact.isHidden ? "(hidden)" : ""}
              </span>
              <span className="text-[#446655] w-12 text-right">
                {calculateRange(contact.hexQ, contact.hexR)}
              </span>
              <span className="text-[#446655] w-10 text-right">
                {calculateBearing(contact.hexQ, contact.hexR)}
              </span>
              <div className="flex gap-2 text-[10px] text-[#446655]">
                <button
                  className="hover:text-[#00ff88]"
                  onClick={e => {
                    e.stopPropagation();
                    onUpdateStatus(contact.id, "friendly");
                  }}
                >
                  F
                </button>
                <button
                  className="hover:text-[#00ccff]"
                  onClick={e => {
                    e.stopPropagation();
                    onUpdateStatus(contact.id, "unknown");
                  }}
                >
                  U
                </button>
                <button
                  className="hover:text-[#ff4455]"
                  onClick={e => {
                    e.stopPropagation();
                    onUpdateStatus(contact.id, "enemy");
                  }}
                >
                  E
                </button>
                <button
                  className="hover:text-[#cccccc]"
                  onClick={e => {
                    e.stopPropagation();
                    onUpdateStatus(contact.id, "derelict");
                  }}
                >
                  D
                </button>
                <button
                  className="hover:text-[#ff4455]"
                  onClick={e => {
                    e.stopPropagation();
                    onRemoveContact(contact.id);
                  }}
                >
                  x
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
