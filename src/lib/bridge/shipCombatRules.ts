export type ShipRangeBand = 'adjacent' | 'close' | 'short' | 'medium' | 'long' | 'very_long' | 'distant';

export interface RangeBandRule {
  key: ShipRangeBand;
  label: string;
  distance: string;
  thrustRequired: number;
}

export const RANGE_BAND_RULES: RangeBandRule[] = [
  { key: 'adjacent', label: 'Adjacent', distance: '1 km or less', thrustRequired: 1 },
  { key: 'close', label: 'Close', distance: '1–10 km', thrustRequired: 1 },
  { key: 'short', label: 'Short', distance: '11–1,250 km', thrustRequired: 2 },
  { key: 'medium', label: 'Medium', distance: '1,251–10,000 km', thrustRequired: 5 },
  { key: 'long', label: 'Long', distance: '10,001–25,000 km', thrustRequired: 10 },
  { key: 'very_long', label: 'Very Long', distance: '25,001–50,000 km', thrustRequired: 25 },
  { key: 'distant', label: 'Distant', distance: 'More than 50,000 km', thrustRequired: 50 },
];

export const RANGE_BAND_LABELS: Record<ShipRangeBand, string> = RANGE_BAND_RULES.reduce((acc, band) => {
  acc[band.key] = band.label;
  return acc;
}, {} as Record<ShipRangeBand, string>);

export const RANGE_BAND_ORDER: ShipRangeBand[] = ['adjacent', 'close', 'short', 'medium', 'long', 'very_long', 'distant'];

export const RANGE_ATTACK_MODIFIERS: Record<ShipRangeBand, number> = {
  adjacent: 0,
  close: 0,
  short: 1,
  medium: 0,
  long: -2,
  very_long: -4,
  distant: -6,
};

export type CombatPhase = 'setup' | 'maneuver' | 'attack' | 'actions' | 'end';

export const COMBAT_PHASES: CombatPhase[] = ['setup', 'maneuver', 'attack', 'actions', 'end'];

export const COMBAT_PHASE_LABELS: Record<CombatPhase, string> = {
  setup: 'Setup',
  maneuver: 'Maneuver Step',
  attack: 'Attack Step',
  actions: 'Actions Step',
  end: 'Round End',
};

export interface ShipWeaponPreset {
  id: string;
  name: string;
  damage: string;
  maxRange: ShipRangeBand;
  attackModifier: number;
}

export const SHIP_WEAPON_PRESETS: ShipWeaponPreset[] = [
  { id: 'pulse_laser', name: 'Pulse Laser', damage: '2d6', maxRange: 'long', attackModifier: 2 },
  { id: 'beam_laser', name: 'Beam Laser', damage: '1d6', maxRange: 'medium', attackModifier: 4 },
  { id: 'missile_rack', name: 'Missile Rack', damage: '4d6', maxRange: 'distant', attackModifier: 0 },
  { id: 'particle_barbette', name: 'Particle Barbette', damage: '4d6', maxRange: 'very_long', attackModifier: 0 },
  { id: 'sandcaster', name: 'Sandcaster', damage: '0', maxRange: 'close', attackModifier: 0 },
];

export type CriticalLocation =
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

export const CRITICAL_LOCATIONS: CriticalLocation[] = [
  'sensors',
  'power_plant',
  'fuel',
  'weapon',
  'armor',
  'hull',
  'm_drive',
  'cargo',
  'jump_drive',
  'crew',
  'bridge',
];

export const CRITICAL_LOCATION_LABELS: Record<CriticalLocation, string> = {
  sensors: 'Sensors',
  power_plant: 'Power Plant',
  fuel: 'Fuel',
  weapon: 'Weapon',
  armor: 'Armor',
  hull: 'Hull',
  m_drive: 'M-Drive',
  cargo: 'Cargo',
  jump_drive: 'Jump Drive',
  crew: 'Crew',
  bridge: 'Bridge',
};

export function getRangeBandShift(current: ShipRangeBand, direction: 'close' | 'open'): ShipRangeBand {
  const idx = RANGE_BAND_ORDER.indexOf(current);
  if (idx < 0) return current;
  if (direction === 'close') return RANGE_BAND_ORDER[Math.max(0, idx - 1)];
  return RANGE_BAND_ORDER[Math.min(RANGE_BAND_ORDER.length - 1, idx + 1)];
}

export function isWeaponInRange(weaponMaxRange: ShipRangeBand, targetRange: ShipRangeBand): boolean {
  return RANGE_BAND_ORDER.indexOf(targetRange) <= RANGE_BAND_ORDER.indexOf(weaponMaxRange);
}
