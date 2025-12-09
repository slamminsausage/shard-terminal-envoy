// src/components/bridge/ContactsList.tsx
// List of detected ships/contacts

import type { Contact } from '@/lib/bridge/bridgeTypes';

interface ContactsListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onContactClick: (contact: Contact) => void;
  onAddClick: () => void;
  onRemoveContact: (contactId: string) => void;
  onUpdateStatus: (contactId: string, status: 'friendly' | 'unknown' | 'enemy') => void;
}

export function ContactsList({
  contacts,
  selectedContact,
  onContactClick,
  onAddClick,
  onRemoveContact,
  onUpdateStatus,
}: ContactsListProps) {
  // Calculate bearing from center (player ship assumed at 0,0)
  const calculateBearing = (q: number, r: number): string => {
    if (q === 0 && r === 0) return '--';
    const angle = Math.atan2(r, q) * (180 / Math.PI);
    const bearing = (90 - angle + 360) % 360;
    return `${Math.round(bearing)}°`;
  };

  // Calculate distance (hex distance)
  const calculateRange = (q: number, r: number): string => {
    if (q === 0 && r === 0) return '--';
    const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
    return `${distance * 10}km`;
  };

  return (
    <div className="contacts-panel bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden">
      {/* Header */}
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

      {/* Contact List */}
      <div className="max-h-[180px] overflow-y-auto">
        {contacts.map(contact => {
          const isSelected = selectedContact?.id === contact.id;
          const statusColor = contact.status === 'friendly' ? '#00ff88' :
                             contact.status === 'enemy' ? '#ff4455' : '#00ccff';
          
          return (
            <div
              key={contact.id}
              onClick={() => onContactClick(contact)}
              className={`
                flex items-center gap-3 px-3 py-2 cursor-pointer transition-all text-xs
                hover:bg-[#00ff8808]
                ${isSelected ? 'bg-[#00ff8810]' : ''}
              `}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: statusColor,
                  boxShadow: `0 0 6px ${statusColor}`
                }}
              />
              <span className="flex-1 truncate" style={{ color: statusColor }}>
                {contact.name}
              </span>
              <span className="text-[#446655] w-12 text-right">
                {calculateRange(contact.hex_q, contact.hex_r)}
              </span>
              <span className="text-[#446655] w-10 text-right">
                {calculateBearing(contact.hex_q, contact.hex_r)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// src/components/bridge/ShipStatusMini.tsx
// Compact ship status display

import type { Contact } from '@/lib/bridge/bridgeTypes';

interface ShipStatusMiniProps {
  ship: Contact;
}

export function ShipStatusMini({ ship }: ShipStatusMiniProps) {
  const hullPercent = ship.hull_max ? Math.round((ship.hull_current || 0) / ship.hull_max * 100) : 100;
  
  const getStatusColor = (value: number) => {
    if (value >= 75) return 'text-[#00ff88]';
    if (value >= 50) return 'text-[#ffaa00]';
    return 'text-[#ff4455]';
  };

  return (
    <div className="status-panel bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden">
      {/* Header */}
      <div className="panel-header flex justify-between items-center px-4 py-2 bg-[#00ff8808] border-b border-[#1a2420]">
        <span className="font-['Orbitron'] text-xs tracking-[3px] text-[#446655]">SHIP STATUS</span>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 text-xs">
        <div className="flex justify-between">
          <span className="text-[#446655]">HULL</span>
          <span className={`font-['Orbitron'] font-bold ${getStatusColor(hullPercent)}`}>
            {hullPercent}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">SHIELDS</span>
          <span className="font-['Orbitron'] font-bold text-[#00ff88]">100%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">M-DRIVE</span>
          <span className="font-['Orbitron'] font-bold text-[#00ff88]">ONLINE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">J-DRIVE</span>
          <span className="font-['Orbitron'] font-bold text-[#ffaa00]">CHARGING</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">WEAPONS</span>
          <span className="font-['Orbitron'] font-bold text-[#ff4455]">ARMED</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">SENSORS</span>
          <span className="font-['Orbitron'] font-bold text-[#00ff88]">ACTIVE</span>
        </div>
      </div>
    </div>
  );
}


// src/components/bridge/ActionBar.tsx
// Bottom action buttons

interface ActionBarProps {
  alertLevel: 'normal' | 'elevated' | 'combat' | 'emergency';
  onAlertChange: (level: 'normal' | 'elevated' | 'combat' | 'emergency') => void;
  onScanClick: () => void;
  onHailClick: () => void;
}

export function ActionBar({ alertLevel, onAlertChange, onScanClick, onHailClick }: ActionBarProps) {
  const cycleAlert = () => {
    const levels: ('normal' | 'elevated' | 'combat' | 'emergency')[] = ['normal', 'elevated', 'combat', 'emergency'];
    const currentIndex = levels.indexOf(alertLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    onAlertChange(levels[nextIndex]);
  };

  return (
    <div className="action-bar flex gap-2 p-3 bg-[#0d1210] border-t border-[#1a2420]">
      <button
        onClick={cycleAlert}
        className={`
          flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all
          border bg-[#00ff8808] hover:bg-[#00ff8815]
          ${alertLevel === 'emergency' ? 'border-[#ff4455] text-[#ff4455]' :
            alertLevel === 'combat' ? 'border-[#ffaa00] text-[#ffaa00]' :
            alertLevel === 'elevated' ? 'border-[#ffaa00] text-[#ffaa00]' :
            'border-[#1a2420] text-[#446655] hover:text-[#00ff88] hover:border-[#00aa55]'}
        `}
      >
        ⚠ ALERT: {alertLevel.toUpperCase()}
      </button>
      
      <button
        onClick={onScanClick}
        className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all
          border border-[#1a2420] text-[#446655] bg-[#00ff8808]
          hover:bg-[#00ff8815] hover:text-[#00ff88] hover:border-[#00aa55]"
      >
        ◎ SCAN
      </button>
      
      <button
        onClick={onHailClick}
        className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all
          border border-[#1a2420] text-[#446655] bg-[#00ff8808]
          hover:bg-[#00ff8815] hover:text-[#00ff88] hover:border-[#00aa55]"
      >
        ◇ HAIL
      </button>
      
      <button
        onClick={() => onAlertChange('emergency')}
        className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all
          border border-[#ff445580] text-[#ff4455] bg-[#ff445510]
          hover:bg-[#ff445520] hover:border-[#ff4455]"
      >
        ⬡ EMERGENCY
      </button>
    </div>
  );
}


// src/components/bridge/MessageComposer.tsx
// Modal for composing new messages

import { useState } from 'react';

interface MessageComposerProps {
  onSend: (sender: string, content: string, priority: string) => void;
  onClose: () => void;
}

export function MessageComposer({ onSend, onClose }: MessageComposerProps) {
  const [sender, setSender] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'priority' | 'emergency'>('normal');

  const handleSend = () => {
    if (!sender.trim() || !content.trim()) return;
    onSend(sender, content, priority);
  };

  // Preset senders for quick selection
  const presetSenders = [
    'KING OLEB XVI',
    'STARPORT AUTHORITY',
    'IMPERIAL NAVY',
    '[ENCRYPTED]',
    '[UNKNOWN VESSEL]',
    'MERCHANT GUILD',
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1210] border border-[#00aa55] rounded-lg w-full max-w-lg shadow-[0_0_40px_rgba(0,255,136,0.2)]">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-[#00ff8810] border-b border-[#1a2420]">
          <span className="font-['Orbitron'] text-sm tracking-[2px]">COMPOSE TRANSMISSION</span>
          <button
            onClick={onClose}
            className="text-[#446655] hover:text-[#ff4455] transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Sender */}
          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">FROM:</label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Enter sender name..."
              className="w-full bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#00ff88] font-mono text-sm
                focus:outline-none focus:border-[#00aa55] focus:shadow-[0_0_8px_rgba(0,255,136,0.2)]"
            />
            {/* Quick select */}
            <div className="flex flex-wrap gap-2 mt-2">
              {presetSenders.map(preset => (
                <button
                  key={preset}
                  onClick={() => setSender(preset)}
                  className="text-[0.65rem] px-2 py-1 bg-[#00ff8808] border border-[#1a2420] rounded
                    text-[#446655] hover:text-[#00ff88] hover:border-[#00aa55] transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">PRIORITY:</label>
            <div className="flex gap-2">
              {(['normal', 'priority', 'emergency'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`
                    flex-1 py-2 rounded text-xs font-mono transition-all border
                    ${priority === p
                      ? p === 'emergency' ? 'bg-[#ff445520] border-[#ff4455] text-[#ff4455]'
                        : p === 'priority' ? 'bg-[#ffaa0020] border-[#ffaa00] text-[#ffaa00]'
                        : 'bg-[#00ff8820] border-[#00ff88] text-[#00ff88]'
                      : 'bg-[#00ff8808] border-[#1a2420] text-[#446655] hover:border-[#00aa55]'}
                  `}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">MESSAGE:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter message content..."
              rows={6}
              className="w-full bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#88bbaa] font-mono text-sm
                focus:outline-none focus:border-[#00aa55] focus:shadow-[0_0_8px_rgba(0,255,136,0.2)]
                resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-[#1a2420]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all
              border border-[#1a2420] text-[#446655] bg-[#00ff8808]
              hover:bg-[#00ff8815] hover:text-[#00ff88]"
          >
            CANCEL
          </button>
          <button
            onClick={handleSend}
            disabled={!sender.trim() || !content.trim()}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all
              border border-[#00aa55] text-[#00ff88] bg-[#00ff8820]
              hover:bg-[#00ff8830] hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SEND TRANSMISSION
          </button>
        </div>
      </div>
    </div>
  );
}


// src/components/bridge/AddContactModal.tsx
// Modal for adding new ships/contacts

import { useState } from 'react';
import type { NewContact } from '@/lib/bridge/bridgeTypes';

interface AddContactModalProps {
  onAdd: (contact: NewContact) => void;
  onClose: () => void;
}

export function AddContactModal({ onAdd, onClose }: AddContactModalProps) {
  const [name, setName] = useState('');
  const [shipClass, setShipClass] = useState('');
  const [status, setStatus] = useState<'friendly' | 'unknown' | 'enemy'>('unknown');
  const [isPlayerShip, setIsPlayerShip] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      name,
      ship_class: shipClass || undefined,
      status,
      is_player_ship: isPlayerShip,
      hex_q: 0,
      hex_r: 0,
      facing: 0,
    });
  };

  // Preset ship classes
  const shipClasses = [
    'Free Trader',
    'Far Trader',
    'Scout/Courier',
    'Corsair',
    'Patrol Cruiser',
    'Mercenary Cruiser',
    'System Defense Boat',
    'Subsidized Liner',
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1210] border border-[#00aa55] rounded-lg w-full max-w-md shadow-[0_0_40px_rgba(0,255,136,0.2)]">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-[#00ff8810] border-b border-[#1a2420]">
          <span className="font-['Orbitron'] text-sm tracking-[2px]">ADD CONTACT</span>
          <button
            onClick={onClose}
            className="text-[#446655] hover:text-[#ff4455] transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">DESIGNATION:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ship name or contact ID..."
              className="w-full bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#00ff88] font-mono text-sm
                focus:outline-none focus:border-[#00aa55]"
            />
          </div>

          {/* Ship Class */}
          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">SHIP CLASS:</label>
            <input
              type="text"
              value={shipClass}
              onChange={(e) => setShipClass(e.target.value)}
              placeholder="Optional..."
              className="w-full bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#00ff88] font-mono text-sm
                focus:outline-none focus:border-[#00aa55]"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {shipClasses.map(cls => (
                <button
                  key={cls}
                  onClick={() => setShipClass(cls)}
                  className="text-[0.65rem] px-2 py-1 bg-[#00ff8808] border border-[#1a2420] rounded
                    text-[#446655] hover:text-[#00ff88] hover:border-[#00aa55] transition-all"
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">STATUS:</label>
            <div className="flex gap-2">
              {(['friendly', 'unknown', 'enemy'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`
                    flex-1 py-2 rounded text-xs font-mono transition-all border
                    ${status === s
                      ? s === 'enemy' ? 'bg-[#ff445520] border-[#ff4455] text-[#ff4455]'
                        : s === 'unknown' ? 'bg-[#00ccff20] border-[#00ccff] text-[#00ccff]'
                        : 'bg-[#00ff8820] border-[#00ff88] text-[#00ff88]'
                      : 'bg-[#00ff8808] border-[#1a2420] text-[#446655] hover:border-[#00aa55]'}
                  `}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Player Ship Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPlayerShip"
              checked={isPlayerShip}
              onChange={(e) => setIsPlayerShip(e.target.checked)}
              className="w-4 h-4 accent-[#00ff88]"
            />
            <label htmlFor="isPlayerShip" className="text-xs text-[#446655]">
              This is the player ship (centers tactical view)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-[#1a2420]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all
              border border-[#1a2420] text-[#446655] bg-[#00ff8808]
              hover:bg-[#00ff8815] hover:text-[#00ff88]"
          >
            CANCEL
          </button>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all
              border border-[#00aa55] text-[#00ff88] bg-[#00ff8820]
              hover:bg-[#00ff8830] hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ADD CONTACT
          </button>
        </div>
      </div>
    </div>
  );
}
