import { useMemo, useState } from "react";
import { useBridge } from "@/contexts/BridgeContext";
import type { Contact } from "@/lib/bridge/bridgeTypes";
import { AddContactModal } from "@/components/bridge/AddContactModal";
import { TacticalDisplay } from "@/components/bridge/TacticalDisplay";
import { useCampaign } from "@/contexts/CampaignContext";
import { useEffect } from "react";

export default function AdminBridge() {
  const {
    bridgeState,
    contacts,
    scans,
    moveShip,
    addContact,
    updateContactFields,
    sendMessage,
    runScan,
    setPlayerShip,
    removeContact,
    isOnline
  } = useBridge();
  const { vehicles } = useCampaign();

  const [showAddContact, setShowAddContact] = useState(false);
  const [sender, setSender] = useState("GM");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "priority" | "emergency">("normal");
  const [scanRoll, setScanRoll] = useState(8);
  const [scanDifficulty, setScanDifficulty] = useState(8);
  const [scanNotes, setScanNotes] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const handleSaveContact = async (contact: Contact, field: keyof Contact, value: string) => {
    const numericFields: Array<keyof Contact> = ["hexQ", "hexR", "facing", "hullCurrent", "hullMax", "scanDc"];
    const booleanFields: Array<keyof Contact> = ["isHidden", "isPlayerShip"];
    let parsedValue: any = value;
    if (numericFields.includes(field)) parsedValue = Number(value);
    if (booleanFields.includes(field)) parsedValue = value === "true";
    await updateContactFields(contact.id, { [field]: parsedValue } as Partial<Contact>);
  };

  const handleSendMessage = async () => {
    if (!content.trim()) return;
    await sendMessage(sender || "GM", content, priority);
    setContent("");
  };

  const handleScan = async () => {
    await runScan(scanRoll, scanDifficulty, scanNotes || undefined, sender || "GM");
  };

  const playerShip = useMemo(() => contacts.find(c => c.isPlayerShip), [contacts]);

  useEffect(() => {
    if (playerShip?.vehicleId) {
      setSelectedVehicleId(playerShip.vehicleId);
    }
  }, [playerShip?.vehicleId]);

  const ensurePlayerShipFromVehicle = async (vehicleId: string) => {
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
        hullCurrent: vehicle.hull ?? undefined,
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

  return (
    <div className="min-h-screen bg-background text-primary p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs tracking-[0.2em] text-primary/70">BRIDGE ADMIN</div>
          <div className="text-lg font-mono">{bridgeState.currentSystem} / Alert {bridgeState.alertLevel.toUpperCase()}</div>
        </div>
        <button
          className="terminal-btn secondary"
          onClick={() => setShowAddContact(true)}
        >
          + Add Contact
        </button>
      </div>
      <div className="flex justify-end">
        <span className={`text-xs font-mono px-3 py-1 rounded border ${isOnline ? "border-terminal-primary-mid text-terminal-primary-light" : "border-terminal-danger-alt text-terminal-danger-light"}`}>
          {isOnline ? "LIVE (Supabase)" : "OFFLINE (local fallback)"}
        </span>
      </div>

      <section className="grid md:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="border border-primary/30 rounded p-3 bg-black/60 space-y-3">
          <div className="text-xs tracking-[0.18em] text-primary/70">TRANSMIT</div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <label className="col-span-1 text-primary/70 text-xs">Sender
              <input className="w-full bg-black/40 border border-primary/30 px-2 py-1" value={sender} onChange={e => setSender(e.target.value)} />
            </label>
            <label className="col-span-1 text-primary/70 text-xs">Priority
              <select className="w-full bg-black/40 border border-primary/30 px-2 py-1" value={priority} onChange={e => setPriority(e.target.value as any)}>
                <option value="normal">normal</option>
                <option value="priority">priority</option>
                <option value="emergency">emergency</option>
              </select>
            </label>
          </div>
          <textarea
            className="w-full bg-black/40 border border-primary/30 px-2 py-2 text-sm h-24"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Message body..."
          />
          <button className="terminal-btn primary w-full" onClick={handleSendMessage}>Send Message</button>
        </div>

        <div className="border border-primary/30 rounded p-3 bg-black/60 space-y-3">
          <div className="text-xs tracking-[0.18em] text-primary/70">SCAN TOOL</div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <label className="text-primary/70 text-xs">Roll
              <input className="w-full bg-black/40 border border-primary/30 px-2 py-1" type="number" value={scanRoll} onChange={e => setScanRoll(Number(e.target.value))} />
            </label>
            <label className="text-primary/70 text-xs">Difficulty
              <input className="w-full bg-black/40 border border-primary/30 px-2 py-1" type="number" value={scanDifficulty} onChange={e => setScanDifficulty(Number(e.target.value))} />
            </label>
            <label className="text-primary/70 text-xs">Notes
              <input className="w-full bg-black/40 border border-primary/30 px-2 py-1" value={scanNotes} onChange={e => setScanNotes(e.target.value)} />
            </label>
          </div>
          <button className="terminal-btn secondary w-full" onClick={handleScan}>Run Scan</button>
          <div className="text-xs text-primary/60">Hidden contacts use their scan DC; revealed contacts are flipped visible and logged.</div>
        </div>

        <div className="border border-primary/30 rounded p-3 bg-black/60 space-y-3">
          <div className="text-xs tracking-[0.18em] text-primary/70">PLAYER SHIP</div>
          <select
            className="w-full bg-black/40 border border-primary/30 px-2 py-2 text-sm"
            value={selectedVehicleId}
            onChange={e => {
              const val = e.target.value;
              setSelectedVehicleId(val);
              void ensurePlayerShipFromVehicle(val);
            }}
          >
            <option value="">Select vehicle...</option>
            {vehicles.filter(v => v.vehicle_type === "Ship" || v.vehicle_type === "Ship " || v.vehicle_type === "Spaceship" || v.vehicle_type === "Vehicle").map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.class_type || v.vehicle_type || "Ship"})
              </option>
            ))}
          </select>
          <div className="text-xs text-primary/60">
            Active: {playerShip ? playerShip.name : "none"} {playerShip?.vehicleId ? `(linked)` : ""}
          </div>
        </div>
      </section>

      <section className="border border-primary/30 rounded p-3 bg-black/60 space-y-3">
        <div className="text-xs tracking-[0.18em] text-primary/70">MINI MAP (GM VIEW)</div>
        <div className="h-[420px] border border-primary/20 rounded bg-black/40">
          <TacticalDisplay
            contacts={contacts}
            selectedContact={selectedContact}
            onShipSelect={setSelectedContact}
            onShipMove={moveShip}
            showHidden
          />
        </div>
        <div className="text-xs text-primary/60">Click a ship, then click a hex to move. Hidden contacts show only here.</div>
      </section>

      <section className="border border-primary/30 rounded p-3 bg-black/60 space-y-2">
        <div className="text-xs tracking-[0.18em] text-primary/70">CONTACTS</div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-primary/70">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Hex</th>
                <th className="text-left p-2">Facing</th>
                <th className="text-left p-2">Hull</th>
                <th className="text-left p-2">Scan DC</th>
                <th className="text-left p-2">Hidden</th>
                <th className="text-left p-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id} className="border-t border-primary/20">
                  <td className="p-2">
                    <div className="font-mono text-primary">{contact.name}</div>
                    <div className="text-primary/60">{contact.shipClass || "?"}</div>
                  </td>
                  <td className="p-2">
                    <select
                      className="bg-black/40 border border-primary/30 px-2 py-1"
                      value={contact.status}
                      onChange={e => handleSaveContact(contact, "status", e.target.value)}
                    >
                      <option value="friendly">friendly</option>
                      <option value="unknown">unknown</option>
                      <option value="enemy">enemy</option>
                      <option value="derelict">derelict</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <input
                        className="w-16 bg-black/40 border border-primary/30 px-2 py-1"
                        type="number"
                        defaultValue={contact.hexQ}
                        onBlur={e => handleSaveContact(contact, "hexQ", e.target.value)}
                      />
                      <input
                        className="w-16 bg-black/40 border border-primary/30 px-2 py-1"
                        type="number"
                        defaultValue={contact.hexR}
                        onBlur={e => handleSaveContact(contact, "hexR", e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <input
                      className="w-16 bg-black/40 border border-primary/30 px-2 py-1"
                      type="number"
                      defaultValue={contact.facing}
                      onBlur={e => handleSaveContact(contact, "facing", e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <input
                        className="w-16 bg-black/40 border border-primary/30 px-2 py-1"
                        type="number"
                        defaultValue={contact.hullCurrent ?? 0}
                        onBlur={e => handleSaveContact(contact, "hullCurrent", e.target.value)}
                      />
                      <input
                        className="w-16 bg-black/40 border border-primary/30 px-2 py-1"
                        type="number"
                        defaultValue={contact.hullMax ?? 0}
                        onBlur={e => handleSaveContact(contact, "hullMax", e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <input
                      className="w-16 bg-black/40 border border-primary/30 px-2 py-1"
                      type="number"
                      defaultValue={contact.scanDc ?? 8}
                      onBlur={e => handleSaveContact(contact, "scanDc", e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <button
                      className="terminal-btn secondary w-full"
                      onClick={() => handleSaveContact(contact, "isHidden", contact.isHidden ? "false" : "true")}
                    >
                      {contact.isHidden ? "Reveal" : "Hide"}
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      className="terminal-btn warning w-full"
                      onClick={() => removeContact(contact.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-primary/30 rounded p-3 bg-black/60 space-y-2">
        <div className="text-xs tracking-[0.18em] text-primary/70">SCAN LOG</div>
        <div className="space-y-2 text-xs text-primary/80">
          {scans.length === 0 && <div>No scans logged yet.</div>}
          {scans.map(scan => (
            <div key={scan.id} className="border border-primary/20 p-2 rounded">
              <div className="flex justify-between">
                <span>{scan.createdAt}</span>
                <span>{scan.result?.toUpperCase()}</span>
              </div>
              <div>Roll {scan.skillCheckRoll} vs {scan.difficulty}</div>
              <div>Revealed: {scan.revealedContactIds?.length ? scan.revealedContactIds.join(", ") : "none"}</div>
              {scan.notes && <div>Notes: {scan.notes}</div>}
            </div>
          ))}
        </div>
      </section>

      {showAddContact && (
        <AddContactModal
          onAdd={async (c) => {
            await addContact(c);
            setShowAddContact(false);
          }}
          onClose={() => setShowAddContact(false)}
        />
      )}
    </div>
  );
}
