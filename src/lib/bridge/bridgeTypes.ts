export type AlertLevel = "normal" | "elevated" | "combat" | "emergency";

export type BridgeMode = "tactical" | "navigation" | "stellar";

export interface BridgeState {
  id: string;
  mode: BridgeMode;
  currentSystem: string;
  destination?: string;
  eta?: string;
  alertLevel: AlertLevel;
  playerShip?: Contact;
  playerShipId?: string | null;
}

export type ContactStatus = "friendly" | "unknown" | "enemy" | "derelict";

export interface Contact {
  id: string;
  name: string;
  shipClass?: string;
  tonnage?: number;
  status: ContactStatus;
  hexQ: number;
  hexR: number;
  facing: number;
  hullCurrent?: number;
  hullMax?: number;
  isPlayerShip?: boolean;
  vehicleId?: string | null;
  isHidden?: boolean;
  scanDc?: number | null;
}

export type MessagePriority = "normal" | "priority" | "emergency";

export interface BridgeMessage {
  id: string;
  sender: string;
  content: string;
  priority: MessagePriority;
  encrypted?: boolean;
  encryptionDifficulty?: number | null;
  sentAt: string;
  isRead?: boolean;
}

// Creation helpers used by modals/forms
export interface NewContact {
  name: string;
  shipClass?: string;
  tonnage?: number;
  status: ContactStatus;
  hexQ?: number;
  hexR?: number;
  facing?: number;
  hullCurrent?: number;
  hullMax?: number;
  isPlayerShip?: boolean;
  vehicleId?: string;
  isHidden?: boolean;
  scanDc?: number;
}

export interface NewMessage {
  sender: string;
  content: string;
  priority?: MessagePriority;
  encrypted?: boolean;
  encryptionDifficulty?: number;
}

export interface BridgeScan {
  id: string;
  bridgeStateId: string;
  initiatedBy?: string | null;
  skillCheckRoll?: number | null;
  difficulty?: number | null;
  result?: string | null;
  revealedContactIds?: string[] | null;
  notes?: string | null;
  createdAt: string;
}
