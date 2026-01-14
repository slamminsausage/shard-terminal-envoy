import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type {
  AlertLevel,
  BridgeMessage,
  BridgeMode,
  BridgeScan,
  BridgeState,
  Contact,
  ContactStatus,
  NewContact
} from "@/lib/bridge/bridgeTypes";

// Database row types for type-safe mapping
interface DbBridgeStateRow {
  id: string;
  mode?: string;
  current_system?: string;
  destination?: string;
  eta?: string;
  alert_level?: string;
  player_ship_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface DbContactRow {
  id: string;
  bridge_state_id: string;
  name: string;
  ship_class?: string;
  tonnage?: number;
  status?: string;
  hex_q?: number;
  hex_r?: number;
  facing?: number;
  hull_current?: number;
  hull_max?: number;
  is_player_ship?: boolean;
  vehicle_id?: string | null;
  is_hidden?: boolean;
  scan_dc?: number | null;
  created_at?: string;
}

interface DbMessageRow {
  id: string;
  bridge_state_id: string;
  sender: string;
  content: string;
  priority?: string;
  encrypted?: boolean;
  encryption_difficulty?: number | null;
  is_read?: boolean;
  sent_at?: string;
}

interface DbScanRow {
  id: string;
  bridge_state_id: string;
  initiated_by?: string;
  skill_check_roll?: number;
  difficulty?: number;
  result?: string;
  revealed_contact_ids?: string[];
  notes?: string;
  created_at: string;
}

// Local dev seed data so the Bridge Console renders even without Supabase
const devContacts: Contact[] = [
  { id: "player", name: "Vanagandr", shipClass: "Type-S Scout/Courier", tonnage: 100, status: "friendly", hexQ: 0, hexR: 0, facing: 2, hullCurrent: 12, hullMax: 12, isPlayerShip: true },
  { id: "fuw", name: "FUW Patrol", shipClass: "Escort", tonnage: 400, status: "unknown", hexQ: -1, hexR: 2, facing: 4, hullCurrent: 20, hullMax: 20 },
  { id: "vennik", name: "Vennik Interdictor", shipClass: "Destroyer", tonnage: 1000, status: "enemy", hexQ: 3, hexR: -2, facing: 1, hullCurrent: 35, hullMax: 35 }
];

const devMessages: BridgeMessage[] = [
  { id: "m1", sender: "FUW Patrol", content: "Unknown transponder. Identify immediately.", priority: "priority", sentAt: new Date().toISOString() },
  { id: "m2", sender: "Vanagandr CIC", content: "Sensors show long-range launch signatures. Advise evasive pattern delta.", priority: "normal", sentAt: new Date().toISOString() },
  { id: "m3", sender: "Vennik Interdictor", content: "Power down drives and prepare to be boarded.", priority: "emergency", sentAt: new Date().toISOString() }
];

const mapDbStateToUi = (row: DbBridgeStateRow): BridgeState => ({
  id: row.id,
  mode: (row.mode as BridgeMode) ?? "tactical",
  currentSystem: row.current_system ?? "UNKNOWN",
  destination: row.destination ?? undefined,
  eta: row.eta ?? undefined,
  alertLevel: (row.alert_level as AlertLevel) ?? "normal",
  playerShipId: row.player_ship_id ?? null
});

const mapDbContactToUi = (row: DbContactRow): Contact => ({
  id: row.id,
  name: row.name,
  shipClass: row.ship_class ?? undefined,
  tonnage: row.tonnage ?? undefined,
  status: (row.status as ContactStatus) ?? "unknown",
  hexQ: row.hex_q ?? 0,
  hexR: row.hex_r ?? 0,
  facing: row.facing ?? 0,
  hullCurrent: row.hull_current ?? undefined,
  hullMax: row.hull_max ?? undefined,
  isPlayerShip: row.is_player_ship ?? false,
  vehicleId: row.vehicle_id ?? null,
  isHidden: row.is_hidden ?? false,
  scanDc: row.scan_dc ?? null
});

const mapDbMessageToUi = (row: DbMessageRow): BridgeMessage => ({
  id: row.id,
  sender: row.sender,
  content: row.content,
  priority: (row.priority as BridgeMessage["priority"]) ?? "normal",
  encrypted: row.encrypted ?? false,
  encryptionDifficulty: row.encryption_difficulty ?? null,
  isRead: row.is_read ?? false,
  sentAt: row.sent_at ?? new Date().toISOString()
});

const mapDbScanToUi = (row: DbScanRow): BridgeScan => ({
  id: row.id,
  bridgeStateId: row.bridge_state_id,
  initiatedBy: row.initiated_by,
  skillCheckRoll: row.skill_check_roll,
  difficulty: row.difficulty,
  result: row.result,
  revealedContactIds: row.revealed_contact_ids,
  notes: row.notes,
  createdAt: row.created_at
});

export function useBridgeState() {
  const supabaseEnabled = !(
    import.meta.env?.VITE_DISABLE_SUPABASE === "true" ||
    ((import.meta.env?.DEV ?? false) && import.meta.env?.VITE_ENABLE_SUPABASE !== "true")
  );
  const [bridgeState, setBridgeState] = useState<BridgeState>({
    id: "local-dev",
    mode: "tactical",
    currentSystem: "Drinax Main",
    destination: "Cordan",
    eta: "12h 34m",
    alertLevel: "elevated",
    playerShip: devContacts[0]
  });
  const [contacts, setContacts] = useState<Contact[]>(devContacts);
  const [messages, setMessages] = useState<BridgeMessage[]>(devMessages);
  const [scans, setScans] = useState<BridgeScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track mount status to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Type assertion for Supabase client to work with dynamic table names
  const sb = supabase;

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  const loadBridgeState = useCallback(async () => {
    try {
      const { data, error: dbError } = await sb
        .from("bridge_state")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (dbError && dbError.code !== "PGRST116") {
        console.error("Error loading bridge state:", dbError);
        setError(dbError.message);
        return null;
      }

      if (data) {
        const mapped = mapDbStateToUi(data);
        setBridgeState(mapped);
        return data;
      }

      // Create initial state if none exists
      const { data: newState, error: insertError } = await sb
        .from("bridge_state")
        .insert({
          mode: "tactical",
          current_system: "DRINAX",
          alert_level: "normal"
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating bridge state:", insertError);
        setError(insertError.message);
        return null;
      }

      setBridgeState(mapDbStateToUi(newState));
      return newState;
    } catch (e: any) {
      console.error("Bridge state load failed:", e);
      setError(e?.message ?? "Unknown error");
      return null;
    }
  }, [sb]);

  const loadContacts = useCallback(async (bridgeStateId: string) => {
    const { data, error: dbError } = await sb
      .from("bridge_contacts")
      .select("*")
      .eq("bridge_state_id", bridgeStateId)
      .order("created_at", { ascending: true });

    if (dbError) {
      console.error("Error loading contacts:", dbError);
      setError(dbError.message);
      return;
    }

    setContacts((data ?? []).map(mapDbContactToUi));
  }, [sb]);

  const loadMessages = useCallback(async (bridgeStateId: string) => {
    const { data, error: dbError } = await sb
      .from("bridge_messages")
      .select("*")
      .eq("bridge_state_id", bridgeStateId)
      .order("sent_at", { ascending: false });

    if (dbError) {
      console.error("Error loading messages:", dbError);
      setError(dbError.message);
      return;
    }

    setMessages((data ?? []).map(mapDbMessageToUi));
  }, [sb]);

  const loadScans = useCallback(async (bridgeStateId: string) => {
    const { data, error: dbError } = await sb
      .from("bridge_scans")
      .select("*")
      .eq("bridge_state_id", bridgeStateId)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Error loading scans:", dbError);
      setError(dbError.message);
      return;
    }

    setScans((data ?? []).map(mapDbScanToUi));
  }, [sb]);

  useEffect(() => {
    isMountedRef.current = true;

    const init = async () => {
      if (!isMountedRef.current) return;
      setLoading(true);
      const stateRow = await loadBridgeState();
      if (!isMountedRef.current) return;
      if (stateRow?.id) {
        await Promise.all([loadContacts(stateRow.id), loadMessages(stateRow.id), loadScans(stateRow.id)]);
      }
      if (!isMountedRef.current) return;
      setLoading(false);
    };
    void init();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadBridgeState, loadContacts, loadMessages, loadScans]);

  // Fallback polling every 5s to keep state fresh when realtime is unavailable
  // Uses visibility check to pause polling when tab is hidden (performance optimization)
  useEffect(() => {
    if (!bridgeState.id || bridgeState.id === "local-dev") return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (interval) return; // Already polling
      interval = setInterval(() => {
        void loadContacts(bridgeState.id);
        void loadMessages(bridgeState.id);
        void loadScans(bridgeState.id);
      }, 5000);
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible - refresh immediately then resume polling
        void loadContacts(bridgeState.id);
        void loadMessages(bridgeState.id);
        void loadScans(bridgeState.id);
        startPolling();
      } else {
        // Tab hidden - stop polling to save resources
        stopPolling();
      }
    };

    // Start polling if tab is currently visible
    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [bridgeState.id, loadContacts, loadMessages, loadScans]);

  // =========================================================
  // REAL-TIME SUBSCRIPTIONS
  // =========================================================
  useEffect(() => {
    if (!bridgeState.id || bridgeState.id === "local-dev") return;

    const channel = sb
      .channel("bridge-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bridge_state", filter: `id=eq.${bridgeState.id}` }, (payload: any) => {
        if (payload.eventType === "UPDATE") {
          setBridgeState(mapDbStateToUi(payload.new));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bridge_contacts", filter: `bridge_state_id=eq.${bridgeState.id}` }, (payload: any) => {
        if (payload.eventType === "INSERT") {
          setContacts(prev => [...prev, mapDbContactToUi(payload.new)]);
        } else if (payload.eventType === "UPDATE") {
          setContacts(prev => prev.map(c => c.id === payload.new.id ? mapDbContactToUi(payload.new) : c));
        } else if (payload.eventType === "DELETE") {
          setContacts(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bridge_messages", filter: `bridge_state_id=eq.${bridgeState.id}` }, (payload: any) => {
        setMessages(prev => [mapDbMessageToUi(payload.new), ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bridge_messages", filter: `bridge_state_id=eq.${bridgeState.id}` }, (payload: any) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? mapDbMessageToUi(payload.new) : m));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bridge_scans", filter: `bridge_state_id=eq.${bridgeState.id}` }, (payload: any) => {
        setScans(prev => [mapDbScanToUi(payload.new), ...prev]);
      })
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [bridgeState.id, sb]);

  // =========================================================
  // ACTIONS (optimistic local update, then Supabase)
  // =========================================================
  const moveShip = useCallback(async (contactId: string, hexQ: number, hexR: number) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, hexQ, hexR } : c));
    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_contacts")
      .update({ hex_q: hexQ, hex_r: hexR })
      .eq("id", contactId);
    if (dbError) console.error("Error moving ship:", dbError);
  }, [sb, bridgeState.id]);

  const addContact = useCallback(async (contact: NewContact): Promise<Contact | null> => {
    if (bridgeState.id === "local-dev") {
      const temp: Contact = {
        id: `local-${Date.now()}`,
        name: contact.name,
        shipClass: contact.shipClass,
        tonnage: contact.tonnage,
        status: contact.status,
        hexQ: contact.hexQ ?? 0,
        hexR: contact.hexR ?? 0,
        facing: contact.facing ?? 0,
        hullCurrent: contact.hullCurrent,
        hullMax: contact.hullMax,
        isPlayerShip: contact.isPlayerShip ?? false,
        vehicleId: contact.vehicleId,
        isHidden: contact.isHidden ?? false,
        scanDc: contact.scanDc ?? null
      };
      setContacts(prev => [...prev, temp]);
      return temp;
    }

    const { data, error: dbError } = await sb
      .from("bridge_contacts")
      .insert({
        bridge_state_id: bridgeState.id,
        name: contact.name,
        ship_class: contact.shipClass,
        tonnage: contact.tonnage,
        status: contact.status,
        hex_q: contact.hexQ ?? 0,
        hex_r: contact.hexR ?? 0,
        facing: contact.facing ?? 0,
        hull_current: contact.hullCurrent,
        hull_max: contact.hullMax,
        is_player_ship: contact.isPlayerShip ?? false,
        vehicle_id: contact.vehicleId,
        is_hidden: contact.isHidden ?? false,
        scan_dc: contact.scanDc ?? null
      })
      .select()
      .single();

    if (dbError || !data) {
      if (dbError) console.error("Error adding contact:", dbError);
      return null;
    }

    const mapped = mapDbContactToUi(data);
    setContacts(prev => [...prev, mapped]);
    return mapped;
  }, [sb, bridgeState.id]);

  const removeContact = useCallback(async (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_contacts")
      .delete()
      .eq("id", contactId);
    if (dbError) console.error("Error removing contact:", dbError);
  }, [sb, bridgeState.id]);

  const updateContactStatus = useCallback(async (contactId: string, status: ContactStatus) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, status } : c));
    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_contacts")
      .update({ status })
      .eq("id", contactId);
    if (dbError) console.error("Error updating contact status:", dbError);
  }, [sb, bridgeState.id]);

  const updateContactFacing = useCallback(async (contactId: string, facing: number) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, facing } : c));
    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_contacts")
      .update({ facing })
      .eq("id", contactId);
    if (dbError) console.error("Error updating facing:", dbError);
  }, [sb, bridgeState.id]);

  const updateContactHull = useCallback(async (contactId: string, hullCurrent: number) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, hullCurrent } : c));
    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_contacts")
      .update({ hull_current: hullCurrent })
      .eq("id", contactId);
    if (dbError) console.error("Error updating hull:", dbError);
  }, [sb, bridgeState.id]);

  const updateContactFields = useCallback(async (contactId: string, fields: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...fields } : c));
    if (bridgeState.id === "local-dev") return;
    const payload: Record<string, string | number | boolean | null | undefined> = {};
    if (fields.status !== undefined) payload.status = fields.status;
    if (fields.hexQ !== undefined) payload.hex_q = fields.hexQ;
    if (fields.hexR !== undefined) payload.hex_r = fields.hexR;
    if (fields.facing !== undefined) payload.facing = fields.facing;
    if (fields.hullCurrent !== undefined) payload.hull_current = fields.hullCurrent;
    if (fields.hullMax !== undefined) payload.hull_max = fields.hullMax;
    if (fields.isPlayerShip !== undefined) payload.is_player_ship = fields.isPlayerShip;
    if (fields.vehicleId !== undefined) payload.vehicle_id = fields.vehicleId;
    if (fields.isHidden !== undefined) payload.is_hidden = fields.isHidden;
    if (fields.scanDc !== undefined) payload.scan_dc = fields.scanDc;

    const { error: dbError } = await sb
      .from("bridge_contacts")
      .update(payload)
      .eq("id", contactId);

    if (dbError) console.error("Error updating contact fields:", dbError);
  }, [sb, bridgeState.id]);

  const sendMessage = useCallback(async (sender: string, content: string, priority: BridgeMessage["priority"] = "normal", encrypted = false, encryptionDifficulty?: number) => {
    const localMessage: BridgeMessage = {
      id: `local-${Date.now()}`,
      sender,
      content,
      priority,
      encrypted,
      encryptionDifficulty,
      sentAt: new Date().toISOString()
    };
    setMessages(prev => [localMessage, ...prev]);

    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_messages")
      .insert({
        bridge_state_id: bridgeState.id,
        sender,
        content,
        priority,
        encrypted,
        encryption_difficulty: encryptionDifficulty
      });
    if (dbError) console.error("Error sending message:", dbError);
  }, [sb, bridgeState.id]);

  const markMessageRead = useCallback(async (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_messages")
      .update({ is_read: true })
      .eq("id", messageId);
    if (dbError) console.error("Error marking message read:", dbError);
  }, [sb, bridgeState.id]);

  const runScan = useCallback(async (roll: number, difficulty: number, notes?: string, initiatedBy = "Sensors") => {
    const hidden = contacts.filter(c => c.isHidden);
    const revealed = hidden.filter(c => (c.scanDc ?? difficulty) <= roll);
    if (revealed.length > 0) {
      const revealIds = revealed.map(c => c.id);
      setContacts(prev => prev.map(c => revealIds.includes(c.id) ? { ...c, isHidden: false } : c));
      if (bridgeState.id !== "local-dev") {
        const { error: revealError } = await sb
          .from("bridge_contacts")
          .update({ is_hidden: false })
          .in("id", revealIds);
        if (revealError) console.error("Error revealing contacts:", revealError);
      }
    }

    if (bridgeState.id !== "local-dev") {
      const { error: scanError } = await sb
        .from("bridge_scans")
        .insert({
          bridge_state_id: bridgeState.id,
          initiated_by: initiatedBy,
          skill_check_roll: roll,
          difficulty,
          result: roll >= difficulty ? "success" : "fail",
          revealed_contact_ids: revealed.map(r => r.id),
          notes
        });
      if (scanError) console.error("Error logging scan:", scanError);
    }

    const summary = revealed.length > 0
      ? `Scan detects ${revealed.length} contact(s): ${revealed.map(r => r.name).join(", ")}.`
      : "Scan returns no new contacts.";
    await sendMessage("Sensors", summary, "normal");
  }, [contacts, bridgeState.id, sb, sendMessage]);

  const setPlayerShip = useCallback(async (contactId: string, vehicleId?: string | null) => {
    setContacts(prev => prev.map(c => ({
      ...c,
      isPlayerShip: c.id === contactId
    })));
    setBridgeState(prev => ({ ...prev, playerShipId: vehicleId ?? null }));

    if (bridgeState.id === "local-dev") return;
    const reset = sb
      .from("bridge_contacts")
      .update({ is_player_ship: false })
      .eq("bridge_state_id", bridgeState.id);
    const setPrimary = sb
      .from("bridge_contacts")
      .update({ is_player_ship: true })
      .eq("id", contactId);
    const updateState = sb
      .from("bridge_state")
      .update({ player_ship_id: vehicleId ?? null })
      .eq("id", bridgeState.id);

    const [resetRes, setRes, stateRes] = await Promise.all([reset, setPrimary, updateState]);
    [resetRes.error, setRes.error, stateRes.error].forEach(err => {
      if (err) console.error("Error setting player ship:", err);
    });
  }, [bridgeState.id, sb]);

  const updateAlertLevel = useCallback(async (level: AlertLevel) => {
    setBridgeState(prev => ({ ...prev, alertLevel: level }));
    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_state")
      .update({ alert_level: level, updated_at: new Date().toISOString() })
      .eq("id", bridgeState.id);
    if (dbError) console.error("Error updating alert level:", dbError);
  }, [sb, bridgeState.id]);

  const updateNavigation = useCallback(async (currentSystem: string, destination?: string, eta?: string) => {
    setBridgeState(prev => ({ ...prev, currentSystem, destination, eta }));
    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_state")
      .update({
        current_system: currentSystem,
        destination,
        eta,
        updated_at: new Date().toISOString()
      })
      .eq("id", bridgeState.id);
    if (dbError) console.error("Error updating navigation:", dbError);
  }, [sb, bridgeState.id]);

  const setMode = useCallback(async (mode: BridgeMode) => {
    setBridgeState(prev => ({ ...prev, mode }));
    if (bridgeState.id === "local-dev") return;
    const { error: dbError } = await sb
      .from("bridge_state")
      .update({ mode, updated_at: new Date().toISOString() })
      .eq("id", bridgeState.id);
    if (dbError) console.error("Error setting mode:", dbError);
  }, [sb, bridgeState.id]);

  const unreadCount = useMemo(() => messages.filter(m => !m.isRead).length, [messages]);
  const isOnline = supabaseEnabled && bridgeState.id !== "local-dev" && !error;

  return {
    bridgeState,
    contacts,
    messages,
    scans,
    unreadCount,
    loading,
    error,
    isOnline,
    // Ship/Contact actions
    moveShip,
    addContact,
    removeContact,
    updateContactStatus,
    updateContactFacing,
    updateContactHull,
    updateContactFields,
    // Message actions
    sendMessage,
    markMessageRead,
    runScan,
    setPlayerShip,
    // Bridge state actions
    updateAlertLevel,
    updateNavigation,
    setMode
  };
}
