import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { AddShipToCombatModal } from "./AddShipToCombatModal";
import { CombatSidebar } from "./combat/CombatSidebar";
import type { BridgeMessage, Contact, NewContact } from "@/lib/bridge/bridgeTypes";
import { getEffectiveThrust } from "@/hooks/useShipCombat";
import { toast } from "sonner";

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
    isOnline,
    combat,
  } = useBridge();

  // Navigation data from Jump Planner
  const { playerLocation, route, selectedWorld } = useJumpPlanner();

  // Vehicle data and role from Campaign context
  const { vehicles, isGM } = useCampaign();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<BridgeMessage | null>(null);
  const [showScan, setShowScan] = useState(false);
  const [showDamageCalc, setShowDamageCalc] = useState(false);
  const [combatMode, setCombatMode] = useState(false);
  const [showAddShipToCombat, setShowAddShipToCombat] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const playerShip = contacts.find(c => c.isPlayerShip);

  // Sync combat mode with combat engine active state
  useEffect(() => {
    if (combat.isActive && !combatMode) {
      setCombatMode(true);
    }
  }, [combat.isActive, combatMode]);

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
  const destination = route.length > 0
    ? route[route.length - 1]?.name || route[route.length - 1]?.hex || "---"
    : undefined;
  const jumpCount = route.length > 1 ? route.length - 1 : 0;
  const eta = jumpCount > 0 ? `${jumpCount * 7} DAYS` : undefined;

  const handleShipSelect = (contact: Contact) => setSelectedContact(contact);

  // Debounce ship movement to prevent rapid DB writes on fast clicks
  const moveTimeoutRef = useRef<number | null>(null);
  const handleShipMove = useCallback((contactId: string, hexQ: number, hexR: number) => {
    if (moveTimeoutRef.current !== null) {
      clearTimeout(moveTimeoutRef.current);
    }
    moveTimeoutRef.current = window.setTimeout(() => {
      moveShip(contactId, hexQ, hexR);
      moveTimeoutRef.current = null;
    }, 150);
  }, [moveShip]);

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

  const handleAddCombatShip = async (contact: NewContact) => {
    const created = await addContact(contact);
    if (created?.id && combat.isActive) {
      await combat.addToCombat(created.id);
    }
    setShowAddShipToCombat(false);
  };

  const handleAlertChange = async (level: "normal" | "elevated" | "combat" | "emergency") => {
    await updateAlertLevel(level);
  };

  const handleCombatToggle = () => {
    if (combatMode) {
      // Don't exit combat mode if combat is active - user must end combat first
      if (combat.isActive) {
        toast.info("End combat first before leaving combat mode.");
        return;
      }
      setCombatMode(false);
    } else {
      setCombatMode(true);
    }
  };

  const damageTarget = useMemo(() => {
    if (selectedContact) return selectedContact;
    if (playerShip) return playerShip;
    return null;
  }, [playerShip, selectedContact]);

  const handleShipChange = async (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    if (!vehicleId) return;

    const existing = contacts.find(c => c.vehicleId === vehicleId);
    let contactId = existing?.id;

    if (!existing) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

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
      await updateContactFields(existing.id, { isPlayerShip: true, status: "friendly", vehicleId });
    }

    if (contactId) {
      await setPlayerShip(contactId, vehicleId);
    }
  };

  // Compute movement range for selected contact
  const movementRange = combatMode && combat.isActive && selectedContact?.isInCombat
    ? getEffectiveThrust(selectedContact)
    : undefined;

  return (
    <div className="interface-container min-h-screen md:h-screen md:max-h-screen crt-container overflow-hidden bridge-console">
      {/* Header */}
      <header className="interface-header">
        <div className="ship-identity">
          <span className="interface-title text-base md:text-xl 3xl:text-2xl tracking-[2px] md:tracking-[4px]">
            {linkedVehicle?.name || playerShip?.name || "NO SHIP SELECTED"}
          </span>
          {(linkedVehicle?.class_type || playerShip?.shipClass) && (
            <span className="interface-subtitle ml-2 md:ml-4">
              {linkedVehicle?.class_type || playerShip?.shipClass} - {linkedVehicle?.tonnage || playerShip?.tonnage || "?"}t
            </span>
          )}
        </div>

        <div className="header-status flex gap-4 md:gap-8 text-xs md:text-sm 3xl:text-base">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                bridgeState.alertLevel === "emergency"
                  ? "bg-terminal-danger-alt shadow-[0_0_8px_var(--danger-alt)]"
                  : bridgeState.alertLevel === "combat"
                    ? "bg-terminal-warning-alt shadow-[0_0_8px_var(--warning-alt)]"
                    : "bg-terminal-primary-light shadow-[0_0_8px_var(--primary-light)]"
              }`}
            />
            <span className="uppercase text-terminal-primary-light">{bridgeState.alertLevel}</span>
          </div>
          {combatMode && combat.isActive && (
            <span className="text-terminal-warning-alt font-['Orbitron'] text-xs tracking-wider animate-pulse">
              COMBAT ACTIVE
            </span>
          )}
          <div className="font-['Orbitron'] text-terminal-primary-light">
            {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </div>
        </div>
      </header>

      <div className="px-3 md:px-6 3xl:px-8 pb-2 flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-start md:items-center">
        {/* Ship Selector */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <span className="text-[0.6rem] md:text-xs 3xl:text-sm text-terminal-text-dimmer tracking-[2px] whitespace-nowrap">ACTIVE SHIP:</span>
          <select
            className="bg-terminal-bg-panel-alt border border-terminal-bg-border px-2 md:px-3 py-1 text-[0.65rem] md:text-xs 3xl:text-sm font-mono text-terminal-primary-light rounded focus:outline-none focus:border-terminal-primary-light transition-colors flex-1 md:flex-none"
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
        <span className={`text-[0.65rem] md:text-xs font-mono px-2 md:px-3 py-1 rounded border ${isOnline ? "border-terminal-primary-mid text-terminal-primary-light" : "border-terminal-danger-alt text-terminal-danger-light"}`}>
          {isOnline ? "LIVE (Supabase)" : "OFFLINE (local fallback)"}
        </span>
      </div>

      {/* Main Content */}
      <div className={`flex-1 grid grid-cols-1 ${combatMode ? 'md:grid-cols-[1fr_400px] 3xl:grid-cols-[1fr_480px]' : 'md:grid-cols-[1fr_340px] 3xl:grid-cols-[1fr_480px]'} gap-3 p-2 md:p-3 3xl:p-4 min-h-0 overflow-y-auto md:overflow-hidden`}>
        {/* Left: Tactical Display */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden order-1">
          <TacticalDisplay
            contacts={contacts}
            selectedContact={selectedContact}
            onShipSelect={handleShipSelect}
            onShipMove={handleShipMove}
            showHidden={false}
            combatActive={combatMode && combat.isActive}
            combatPhase={combat.phase}
            gridRadius={combatMode ? 12 : undefined}
            movementRange={movementRange}
          />

          {/* Navigation Info Bar - hide during active combat to give grid more space */}
          {!combat.isActive && (
            <div className="nav-info grid grid-cols-1 md:grid-cols-3 bg-terminal-bg-panel-alt border border-terminal-bg-border rounded">
              <div className="p-2 md:p-3 text-center border-b md:border-b-0 md:border-r border-terminal-bg-border">
                <div className="text-[0.6rem] text-terminal-text-dimmer tracking-[2px] mb-1">CURRENT POSITION</div>
                <div className="font-['Orbitron'] font-bold text-sm md:text-base 3xl:text-lg text-terminal-secondary drop-shadow-[0_0_10px_var(--secondary)] uppercase">
                  {currentPosition}
                </div>
              </div>
              <div className="p-2 md:p-3 3xl:p-4 text-center border-b md:border-b-0 md:border-r border-terminal-bg-border">
                <div className="text-[0.6rem] 3xl:text-xs text-terminal-text-dimmer tracking-[2px] mb-1">DESTINATION</div>
                <div className="font-['Orbitron'] font-bold text-sm md:text-base 3xl:text-lg text-terminal-secondary drop-shadow-[0_0_10px_var(--secondary)] uppercase">
                  {destination || "---"}
                </div>
              </div>
              <div className="p-2 md:p-3 3xl:p-4 text-center">
                <div className="text-[0.6rem] 3xl:text-xs text-terminal-text-dimmer tracking-[2px] mb-1">ETA</div>
                <div className="font-['Orbitron'] font-bold text-sm md:text-base 3xl:text-lg text-terminal-secondary drop-shadow-[0_0_10px_var(--secondary)]">
                  {eta || "---"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar - switches between normal and combat mode */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden order-2">
          {combatMode ? (
            <div className="flex-1 flex flex-col bg-terminal-bg-panel-alt border border-terminal-bg-border rounded overflow-hidden">
              <CombatSidebar
                selectedContact={selectedContact}
                onSelectContact={handleShipSelect}
                onAddShipClick={() => setShowAddShipToCombat(true)}
              />
            </div>
          ) : (
            <>
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
                isGM={isGM}
              />

              {playerShip && (
                <ShipStatusMini
                  ship={playerShip}
                  linkedVehicle={linkedVehicle}
                  alertLevel={bridgeState.alertLevel}
                />
              )}
            </>
          )}
        </div>
      </div>

      <ActionBar
        alertLevel={bridgeState.alertLevel}
        onAlertChange={handleAlertChange}
        onScanClick={() => setShowScan(true)}
        onHailClick={() => setShowMessageComposer(true)}
        onDamageCalcClick={() => setShowDamageCalc(true)}
        onShipCombatClick={handleCombatToggle}
        combatActive={combatMode}
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
          onApplyDamage={async (damage, location) => {
            if (!damageTarget) {
              toast.error('Select a ship contact before applying damage.');
              return;
            }

            const currentHull = damageTarget.hullCurrent ?? damageTarget.hullMax ?? 0;
            const nextHull = Math.max(0, currentHull - damage);
            const nextStatus = nextHull <= 0
              ? 'derelict'
              : damageTarget.status;

            await updateContactFields(damageTarget.id, {
              hullCurrent: nextHull,
              status: nextStatus,
            });

            toast.success(`Applied ${damage} damage to ${damageTarget.name}${location ? ` (${location})` : ''}. Hull now ${nextHull}.`);
          }}
        />
      )}

      <AddShipToCombatModal
        isOpen={showAddShipToCombat}
        onClose={() => setShowAddShipToCombat(false)}
        onAdd={handleAddCombatShip}
        vehicles={vehicles}
      />
    </div>
  );
}
