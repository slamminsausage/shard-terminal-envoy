import { createContext, useContext, ReactNode } from "react";
import { useBridgeState } from "@/hooks/useBridgeState";
import type { BridgeState, Contact, BridgeMessage, BridgeScan } from "@/lib/bridge/bridgeTypes";

interface BridgeContextValue {
  bridgeState: BridgeState;
  contacts: Contact[];
  messages: BridgeMessage[];
  scans: BridgeScan[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  moveShip: ReturnType<typeof useBridgeState>["moveShip"];
  addContact: ReturnType<typeof useBridgeState>["addContact"];
  removeContact: ReturnType<typeof useBridgeState>["removeContact"];
  updateContactStatus: ReturnType<typeof useBridgeState>["updateContactStatus"];
  updateContactFacing: ReturnType<typeof useBridgeState>["updateContactFacing"];
  updateContactHull: ReturnType<typeof useBridgeState>["updateContactHull"];
  updateContactFields: ReturnType<typeof useBridgeState>["updateContactFields"];
  sendMessage: ReturnType<typeof useBridgeState>["sendMessage"];
  markMessageRead: ReturnType<typeof useBridgeState>["markMessageRead"];
  runScan: ReturnType<typeof useBridgeState>["runScan"];
  setPlayerShip: ReturnType<typeof useBridgeState>["setPlayerShip"];
  updateAlertLevel: ReturnType<typeof useBridgeState>["updateAlertLevel"];
  updateNavigation: ReturnType<typeof useBridgeState>["updateNavigation"];
  setMode: ReturnType<typeof useBridgeState>["setMode"];
}

const BridgeContext = createContext<BridgeContextValue | undefined>(undefined);

export function BridgeProvider({ children }: { children: ReactNode }) {
  const bridge = useBridgeState();
  return <BridgeContext.Provider value={bridge}>{children}</BridgeContext.Provider>;
}

export function useBridge() {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error("useBridge must be used within a BridgeProvider");
  return ctx;
}
