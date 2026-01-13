import { useState, useEffect } from "react";
import { useBridge } from "@/contexts/BridgeContext";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { useCampaign } from "@/contexts/CampaignContext";
import { TacticalDisplay } from "./TacticalDisplay";
import { CommunicationsPanel } from "./CommunicationsPanel";
import { ContactsList } from "./ContactsList";
import { ShipStatusMini } from "./ShipStatusMini";
import { ActionBar } from "./ActionBar";
import { MessageComposer } from "./MessageComposer";
import { AddContactModal } from "./AddContactModal";
import { ScanModal } from "./ScanModal";
import { DamageCalculator } from "./DamageCalculator";
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
    updateContactFields,
    sendMessage,
    markMessageRead,
    updateAlertLevel,
    runScan,
    setPlayerShip,
    isOnline
  } = useBridge();

  // Navigation data from Jump Planner
  const { playerLocation, route, selectedWorld } = useJumpPlanner();

  // Vehicle data from Campaign context
  const { vehicles } = useCampaign();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<BridgeMessage | null>(null);
  const [showScan, setShowScan] = useState(false);
  const [showDamageCalc, setShowDamageCalc] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const playerShip = contacts.find(c => c.isPlayerShip);

  // Get linked vehicle data for the player ship
  const linkedVehicle = playerShip?.vehicleId
    ? vehicles.find(v => v.id === playerShip.vehicleId)
    : null;

  // Sync selected vehicle ID with current player ship
  useEffect(() => {
    if (playerShip?.vehicleId) {
      setSelectedVehicleId(playerShip.vehicleId);
    }
  }, [playerShip?.vehicleId]);

  // Derive navigation display values from Jump Planner
  const currentPosition = playerLocation?.worldName || playerLocation?.hex || "UNKNOWN";

  // Get destination from route (last leg in the route array)
  const destination = route.length > 0
    ? route[route.length - 1]?.name || route[route.length - 1]?.hex || "---"
    : undefined;

  // Calculate ETA as number of jumps × 7 days
  // Route includes start world, so jumps = route.length - 1
  const jumpCount = route.length > 1 ? route.length - 1 : 0;
  const eta = jumpCount > 0
    ? `${jumpCount * 7} DAYS`
    : undefined;

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

  const handleShipChange = async (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    if (!vehicleId) return;

    // Find existing contact for this vehicle or create one
    const existing = contacts.find(c => c.vehicleId === vehicleId);
    let contactId = existing?.id;

    if (!existing) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      // Create new contact for this vehicle, positioned at center (0,0)
      const created = await addContact({
        name: vehicle.name,
        shipClass: vehicle.class_type ?? vehicle.vehicle_type ?? "Ship",
        tonnage: vehicle.tonnage ?? undefined,
        status: "friendly",
        hexQ: 0,
        hexR: 0,
        facing: 0,
        hullCurrent: vehicle.hull_current ?? vehicle.hull ?? undefined,
        hullMax: vehicle.hull ?? undefined,
        isPlayerShip: true,
        vehicleId
      });
      contactId = created?.id;
    } else {
      // Update existing contact to be player ship
      await updateContactFields(existing.id, { isPlayerShip: true, status: "friendly", vehicleId });
    }

    if (contactId) {
      await setPlayerShip(contactId, vehicleId);
    }
  };

  return (
    <div className="bridge-console min-h-screen md:h-screen md:max-h-screen flex flex-col bg-[#0a0e0c] text-[#00ff88] font-mono crt-container border border-primary/30 rounded shadow-[0_0_32px_rgba(0,255,0,0.12)] overflow-hidden">
      {/* Header */}
      <header className="bridge-header flex flex-col md:flex-row justify-between md:items-center gap-2 px-4 md:px-6 py-3 border-b border-[#1a2420] bg-gradient-to-b from-[#00ff8808] to-transparent">
        <div className="ship-identity">
          <span className="font-['Orbitron'] font-black text-base md:text-xl tracking-[2px] md:tracking-[4px] drop-shadow-[0_0_20px_#00ff88]">
            {linkedVehicle?.name || playerShip?.name || "NO SHIP SELECTED"}
          </span>
          {(linkedVehicle?.class_type || playerShip?.shipClass) && (
            <span className="text-[#446655] text-xs md:text-sm ml-2 md:ml-4">
              {linkedVehicle?.class_type || playerShip?.shipClass} - {linkedVehicle?.tonnage || playerShip?.tonnage || "?"}t
            </span>
          )}
        </div>

        <div className="header-status flex gap-4 md:gap-8 text-xs md:text-sm">
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
      <div className="px-3 md:px-6 pb-2 flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-start md:items-center">
        {/* Ship Selector */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <span className="text-[0.6rem] md:text-xs text-[#446655] tracking-[2px] whitespace-nowrap">ACTIVE SHIP:</span>
          <select
            className="bg-[#0d1210] border border-[#1a2420] px-2 md:px-3 py-1 text-[0.65rem] md:text-xs font-mono text-[#00ff88] rounded focus:outline-none focus:border-[#00ff88] transition-colors flex-1 md:flex-none"
            value={playerShip?.vehicleId || selectedVehicleId}
            onChange={(e) => handleShipChange(e.target.value)}
          >
            <option value="">Select ship...</option>
            {vehicles
              .filter(v => v.vehicle_type === "Ship" || v.vehicle_type === "Ship " || v.vehicle_type === "Spaceship")
              .map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.class_type || "Ship"})
                </option>
              ))}
          </select>
        </div>
        <span className={`text-[0.65rem] md:text-xs font-mono px-2 md:px-3 py-1 rounded border ${isOnline ? "border-[#00aa55] text-[#00ff88]" : "border-[#ff4455] text-[#ff8899]"}`}>
          {isOnline ? "LIVE (Supabase)" : "OFFLINE (local fallback)"}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-3 p-2 md:p-3 min-h-0 overflow-y-auto md:overflow-hidden">
        {/* Left: Tactical Display */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden order-1">
          <TacticalDisplay
            contacts={contacts}
            selectedContact={selectedContact}
            onShipSelect={handleShipSelect}
            onShipMove={handleShipMove}
            showHidden={false}
          />

          {/* Navigation Info Bar */}
          <div className="nav-info grid grid-cols-1 md:grid-cols-3 bg-[#0d1210] border border-[#1a2420] rounded">
            <div className="p-2 md:p-3 text-center border-b md:border-b-0 md:border-r border-[#1a2420]">
              <div className="text-[0.6rem] text-[#446655] tracking-[2px] mb-1">CURRENT POSITION</div>
              <div className="font-['Orbitron'] font-bold text-sm md:text-base text-[#00ccff] drop-shadow-[0_0_10px_#00ccff] uppercase">
                {currentPosition}
              </div>
            </div>
            <div className="p-2 md:p-3 text-center border-b md:border-b-0 md:border-r border-[#1a2420]">
              <div className="text-[0.6rem] text-[#446655] tracking-[2px] mb-1">DESTINATION</div>
              <div className="font-['Orbitron'] font-bold text-sm md:text-base text-[#00ccff] drop-shadow-[0_0_10px_#00ccff] uppercase">
                {destination || "---"}
              </div>
            </div>
            <div className="p-2 md:p-3 text-center">
              <div className="text-[0.6rem] text-[#446655] tracking-[2px] mb-1">ETA</div>
              <div className="font-['Orbitron'] font-bold text-sm md:text-base text-[#00ccff] drop-shadow-[0_0_10px_#00ccff]">
                {eta || "---"}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden order-2">
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

          {playerShip && (
            <ShipStatusMini
              ship={playerShip}
              linkedVehicle={linkedVehicle}
              alertLevel={bridgeState.alertLevel}
            />
          )}
        </div>
      </div>

      <ActionBar
        alertLevel={bridgeState.alertLevel}
        onAlertChange={handleAlertChange}
        onScanClick={() => setShowScan(true)}
        onHailClick={() => setShowMessageComposer(true)}
        onDamageCalcClick={() => setShowDamageCalc(true)}
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

      {showDamageCalc && (
        <DamageCalculator
          isOpen={showDamageCalc}
          onClose={() => setShowDamageCalc(false)}
          onApplyDamage={(damage, location) => {
            console.log(`Apply ${damage} damage to ${location || 'hull'}`);
            // TODO: Apply damage to selected contact
          }}
        />
      )}
    </div>
  );
}
