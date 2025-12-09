// src/components/bridge/BridgeConsole.tsx
// Main Bridge Console component - add as 4th tab in MainframeShell

import { useState } from 'react';
import { useBridgeState } from './hooks/useBridgeState';
import { TacticalDisplay } from './TacticalDisplay';
import { CommunicationsPanel } from './CommunicationsPanel';
import { ContactsList } from './ContactsList';
import { ShipStatusMini } from './ShipStatusMini';
import { ActionBar } from './ActionBar';
import { MessageComposer } from './MessageComposer';
import { AddContactModal } from './AddContactModal';
import type { Contact, BridgeMessage } from '@/lib/bridge/bridgeTypes';

export function BridgeConsole() {
  const {
    bridgeState,
    contacts,
    messages,
    moveShip,
    addContact,
    removeContact,
    updateContactStatus,
    sendMessage,
    markMessageRead,
    updateAlertLevel,
    updateNavigation,
  } = useBridgeState();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<BridgeMessage | null>(null);

  const playerShip = contacts.find(c => c.is_player_ship);
  const unreadCount = messages.filter(m => !m.is_read).length;

  const handleShipSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleShipMove = async (contactId: string, hexQ: number, hexR: number) => {
    await moveShip(contactId, hexQ, hexR);
  };

  const handleMessageClick = async (message: BridgeMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await markMessageRead(message.id);
    }
  };

  const handleSendMessage = async (sender: string, content: string, priority: string) => {
    await sendMessage(sender, content, priority);
    setShowMessageComposer(false);
  };

  const handleAddContact = async (contact: any) => {
    await addContact(contact);
    setShowAddContact(false);
  };

  const handleAlertChange = async (level: 'normal' | 'elevated' | 'combat' | 'emergency') => {
    await updateAlertLevel(level);
  };

  return (
    <div className="bridge-console h-full flex flex-col bg-[#0a0e0c] text-[#00ff88] font-mono">
      {/* Header */}
      <header className="bridge-header flex justify-between items-center px-6 py-3 border-b border-[#1a2420] bg-gradient-to-b from-[#00ff8808] to-transparent">
        <div className="ship-identity">
          <span className="font-['Orbitron'] font-black text-xl tracking-[4px] drop-shadow-[0_0_20px_#00ff88]">
            {playerShip?.name || 'NO SHIP SELECTED'}
          </span>
          {playerShip?.ship_class && (
            <span className="text-[#446655] text-sm ml-4">
              {playerShip.ship_class} • {playerShip.tonnage}t
            </span>
          )}
        </div>
        
        <div className="header-status flex gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              bridgeState?.alert_level === 'emergency' ? 'bg-[#ff4455] shadow-[0_0_8px_#ff4455]' :
              bridgeState?.alert_level === 'combat' ? 'bg-[#ffaa00] shadow-[0_0_8px_#ffaa00]' :
              'bg-[#00ff88] shadow-[0_0_8px_#00ff88]'
            }`} />
            <span className="uppercase">{bridgeState?.alert_level || 'NORMAL'}</span>
          </div>
          <div className="font-['Orbitron'] text-[#00ff88]">
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[1fr_340px] gap-3 p-3 min-h-0">
        {/* Left: Tactical Display */}
        <div className="flex flex-col gap-3">
          <TacticalDisplay
            contacts={contacts}
            selectedContact={selectedContact}
            onShipSelect={handleShipSelect}
            onShipMove={handleShipMove}
          />
          
          {/* Navigation Info Bar */}
          <div className="nav-info grid grid-cols-3 bg-[#0d1210] border border-[#1a2420] rounded">
            <div className="p-3 text-center border-r border-[#1a2420]">
              <div className="text-[0.6rem] text-[#446655] tracking-[2px] mb-1">CURRENT POSITION</div>
              <div className="font-['Orbitron'] font-bold text-[#00ccff] drop-shadow-[0_0_10px_#00ccff]">
                {bridgeState?.current_system || 'UNKNOWN'}
              </div>
            </div>
            <div className="p-3 text-center border-r border-[#1a2420]">
              <div className="text-[0.6rem] text-[#446655] tracking-[2px] mb-1">DESTINATION</div>
              <div className="font-['Orbitron'] font-bold text-[#00ccff] drop-shadow-[0_0_10px_#00ccff]">
                {bridgeState?.destination || '---'}
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="text-[0.6rem] text-[#446655] tracking-[2px] mb-1">ETA</div>
              <div className="font-['Orbitron'] font-bold text-[#00ccff] drop-shadow-[0_0_10px_#00ccff]">
                {bridgeState?.eta || '---'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Communications Panel */}
          <CommunicationsPanel
            messages={messages}
            unreadCount={unreadCount}
            selectedMessage={selectedMessage}
            onMessageClick={handleMessageClick}
            onComposeClick={() => setShowMessageComposer(true)}
            onCloseMessage={() => setSelectedMessage(null)}
          />

          {/* Contacts List */}
          <ContactsList
            contacts={contacts}
            selectedContact={selectedContact}
            onContactClick={handleShipSelect}
            onAddClick={() => setShowAddContact(true)}
            onRemoveContact={removeContact}
            onUpdateStatus={updateContactStatus}
          />

          {/* Ship Status Mini */}
          {playerShip && (
            <ShipStatusMini ship={playerShip} />
          )}
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        alertLevel={bridgeState?.alert_level || 'normal'}
        onAlertChange={handleAlertChange}
        onScanClick={() => {/* Could trigger a scan animation */}}
        onHailClick={() => setShowMessageComposer(true)}
      />

      {/* Message Composer Modal */}
      {showMessageComposer && (
        <MessageComposer
          onSend={handleSendMessage}
          onClose={() => setShowMessageComposer(false)}
        />
      )}

      {/* Add Contact Modal */}
      {showAddContact && (
        <AddContactModal
          onAdd={handleAddContact}
          onClose={() => setShowAddContact(false)}
        />
      )}
    </div>
  );
}
