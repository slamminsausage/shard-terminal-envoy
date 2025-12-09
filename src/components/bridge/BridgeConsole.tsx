import { useState } from "react";
import { useBridge } from "@/contexts/BridgeContext";
import { TacticalDisplay } from "./TacticalDisplay";
import { CommunicationsPanel } from "./CommunicationsPanel";
import { ContactsList } from "./ContactsList";
import { ShipStatusMini } from "./ShipStatusMini";
import { ActionBar } from "./ActionBar";
import { MessageComposer } from "./MessageComposer";
import { AddContactModal } from "./AddContactModal";
import { ScanModal } from "./ScanModal";
import type { BridgeMessage, Contact, NewContact } from "@/lib/bridge/bridgeTypes";

export function BridgeConsole() {
  const {
    bridgeState,
    contacts,
    messages,
    unreadCount,
    moveShip,
    addContact,
    removeContact,
    updateContactStatus,
    sendMessage,
    markMessageRead,
    updateAlertLevel,
    runScan,
    isOnline
  } = useBridge();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<BridgeMessage | null>(null);
  const [showScan, setShowScan] = useState(false);

  const playerShip = contacts.find(c => c.isPlayerShip);

  const handleShipSelect = (contact: Contact) => setSelectedContact(contact);

  const handleShipMove = async (contactId: string, hexQ: number, hexR: number) => {
    await moveShip(contactId, hexQ, hexR);
  };

  const handleMessageClick = async (message: BridgeMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      await markMessageRead(message.id);
    }
  };

  const handleSendMessage = async (sender: string, content: string, priority: string) => {
    await sendMessage(sender, content, priority as BridgeMessage["priority"]);
    setShowMessageComposer(false);
  };

  const handleAddContact = async (contact: NewContact) => {
    await addContact(contact);
    setShowAddContact(false);
  };

  const handleAlertChange = async (level: "normal" | "elevated" | "combat" | "emergency") => {
    await updateAlertLevel(level);
  };

  return (
    <div className="bridge-console h-full flex flex-col bg-[#0a0e0c] text-[#00ff88] font-mono crt-container border border-primary/30 rounded shadow-[0_0_32px_rgba(0,255,0,0.12)]">
      {/* Header */}
      <header className="bridge-header flex justify-between items-center px-6 py-3 border-b border-[#1a2420] bg-gradient-to-b from-[#00ff8808] to-transparent">
        <div className="ship-identity">
          <span className="font-['Orbitron'] font-black text-xl tracking-[4px] drop-shadow-[0_0_20px_#00ff88]">
            {playerShip?.name || "NO SHIP SELECTED"}
          </span>
          {playerShip?.shipClass && (
            <span className="text-[#446655] text-sm ml-4">
              {playerShip.shipClass} - {playerShip.tonnage ?? "?"}t
            </span>
          )}
        </div>

        <div className="header-status flex gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                bridgeState.alertLevel === "emergency"
                  ? "bg-[#ff4455] shadow-[0_0_8px_#ff4455]"
                  : bridgeState.alertLevel === "combat"
                    ? "bg-[#ffaa00] shadow-[0_0_8px_#ffaa00]"
                    : "bg-[#00ff88] shadow-[0_0_8px_#00ff88]"
              }`}
            />
            <span className="uppercase">{bridgeState.alertLevel}</span>
          </div>
          <div className="font-['Orbitron'] text-[#00ff88]">
            {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </div>
        </div>
      </header>
      <div className="px-6 pb-2 flex justify-end">
        <span className={`text-xs font-mono px-3 py-1 rounded border ${isOnline ? "border-[#00aa55] text-[#00ff88]" : "border-[#ff4455] text-[#ff8899]"}`}>
          {isOnline ? "LIVE (Supabase)" : "OFFLINE (local fallback)"}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[1fr_340px] gap-3 p-3 min-h-0">
        {/* Left: Tactical Display */}
        <div className="flex flex-col gap-3">
          <TacticalDisplay
            contacts={contacts}
            selectedContact={selectedContact}
            onShipSelect={handleShipSelect}
            onShipMove={handleShipMove}
            showHidden={false}
          />

          {/* Navigation Info Bar */}
          <div className="nav-info grid grid-cols-3 bg-[#0d1210] border border-[#1a2420] rounded">
            <div className="p-3 text-center border-r border-[#1a2420]">
              <div className="text-[0.6rem] text-[#446655] tracking-[2px] mb-1">CURRENT POSITION</div>
              <div className="font-['Orbitron'] font-bold text-[#00ccff] drop-shadow-[0_0_10px_#00ccff]">
                {bridgeState.currentSystem || "UNKNOWN"}
              </div>
            </div>
            <div className="p-3 text-center border-r border-[#1a2420]">
              <div className="text-[0.6rem] text-[#446655] tracking-[2px] mb-1">DESTINATION</div>
              <div className="font-['Orbitron'] font-bold text-[#00ccff] drop-shadow-[0_0_10px_#00ccff]">
                {bridgeState.destination || "---"}
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="text-[0.6rem] text-[#446655] tracking-[2px] mb-1">ETA</div>
              <div className="font-['Orbitron'] font-bold text-[#00ccff] drop-shadow-[0_0_10px_#00ccff]">
                {bridgeState.eta || "---"}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="flex flex-col gap-3 min-h-0">
          <CommunicationsPanel
            messages={messages}
            unreadCount={unreadCount}
            selectedMessage={selectedMessage}
            onMessageClick={handleMessageClick}
            onComposeClick={() => setShowMessageComposer(true)}
            onCloseMessage={() => setSelectedMessage(null)}
          />

          <ContactsList
            contacts={contacts}
            selectedContact={selectedContact}
            onContactClick={handleShipSelect}
            onAddClick={() => setShowAddContact(true)}
            onRemoveContact={removeContact}
            onUpdateStatus={updateContactStatus}
            showHidden={false}
          />

          {playerShip && <ShipStatusMini ship={playerShip} />}
        </div>
      </div>

      <ActionBar
        alertLevel={bridgeState.alertLevel}
        onAlertChange={handleAlertChange}
        onScanClick={() => setShowScan(true)}
        onHailClick={() => setShowMessageComposer(true)}
      />

      {showMessageComposer && (
        <MessageComposer
          onSend={handleSendMessage}
          onClose={() => setShowMessageComposer(false)}
        />
      )}

      {showScan && (
        <ScanModal
          onRun={async (roll, difficulty, notes) => {
            await runScan(roll, difficulty, notes);
            setShowScan(false);
          }}
          onClose={() => setShowScan(false)}
        />
      )}

      {showAddContact && (
        <AddContactModal
          onAdd={handleAddContact}
          onClose={() => setShowAddContact(false)}
        />
      )}
    </div>
  );
}
