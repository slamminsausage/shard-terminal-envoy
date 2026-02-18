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

export type CriticalLocationKey =
  | 'sensors'
  | 'power_plant'
  | 'fuel'
  | 'weapon'
  | 'armor'
  | 'hull'
  | 'm_drive'
  | 'cargo'
  | 'jump_drive'
  | 'crew'
  | 'bridge';

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

  // === Combat fields (populated when contact enters combat) ===
  isInCombat?: boolean;
  preMadeShipId?: string;
  thrust?: number;
  armor?: number;
  pilotSkill?: number;
  gunnerSkill?: number;
  engineerSkill?: number;
  sensorSkill?: number;
  captainSkill?: number;
  tacticsEffect?: number;
  initiative?: number;
  initiativeDetail?: string;
  surprised?: boolean;
  movementAllocation?: number;
  evasiveAllocation?: number;
  maneuverIntent?: 'hold' | 'close' | 'open';
  criticals?: Partial<Record<CriticalLocationKey, number>>;
  sustainedDamageCounter?: number;
  repairProgress?: Partial<Record<CriticalLocationKey, number>>;
  pendingThrustBoost?: number;
  activeThrustBoost?: number;
  pendingPowerBypass?: boolean;
  activePowerBypass?: boolean;
  overloadDrivePenalty?: number;
  overloadPlantPenalty?: number;
  missileAmmo?: number;
  sandAmmo?: number;
  sandReloadRounds?: number;
  sandScreen?: number;
  jumpChargeRounds?: number;
  jumpCommitted?: boolean;
  weapons?: Array<{ id: string; name: string; damage: string; maxRange: string; attackModifier: number }>;
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
  // Combat fields for ship addition
  thrust?: number;
  armor?: number;
  pilotSkill?: number;
  gunnerSkill?: number;
  engineerSkill?: number;
  sensorSkill?: number;
  captainSkill?: number;
  preMadeShipId?: string;
  missileAmmo?: number;
  sandAmmo?: number;
  weapons?: Array<{ id: string; name: string; damage: string; maxRange: string; attackModifier: number }>;
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
