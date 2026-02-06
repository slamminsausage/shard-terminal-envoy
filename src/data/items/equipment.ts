/**
 * Traveller Core Rulebook - Equipment Catalog
 *
 * General equipment organised by category. Each section will grow
 * as more data is provided (survival, medical, tools, etc.).
 */

import { EquipmentCatalogItem } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  COMMUNICATIONS
// ═══════════════════════════════════════════════════════════════════════

// ── Radio Transceivers ─────────────────────────────────────────────

export const COMMS_EQUIPMENT: EquipmentCatalogItem[] = [
  // TL5 Radio Transceivers — bulky, low-tech
  {
    id: 'radio-tl5-5km',
    name: 'Radio Transceiver (TL5, 5km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 5,
    mass_kg: 20,
    cost: 225,
    effect: 'Range: 5km',
    description: 'A portable two-way radio. Bulky but functional for short-range field communications. Sends and receives directly under its own power without needing a comm network.',
  },
  {
    id: 'radio-tl5-50km',
    name: 'Radio Transceiver (TL5, 50km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 5,
    mass_kg: 70,
    cost: 750,
    effect: 'Range: 50km',
    description: 'A vehicle-mounted or base-camp radio with regional range. Heavy enough to require mounting on a vehicle or setting up at a fixed position.',
  },
  {
    id: 'radio-tl5-500km',
    name: 'Radio Transceiver (TL5, 500km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 5,
    mass_kg: 150,
    cost: 1500,
    effect: 'Range: 500km',
    description: 'A base station radio capable of reaching orbital ranges. Requires dedicated installation space and a significant power supply.',
  },
  {
    id: 'radio-tl5-5000km',
    name: 'Radio Transceiver (TL5, 5,000km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 5,
    mass_kg: 300,
    cost: 15000,
    effect: 'Range: 5,000km',
    description: 'A major communications installation capable of continent-spanning range. Requires a dedicated building or large vehicle to house and power.',
  },

  // TL8+ Radio Transceivers — miniaturised
  {
    id: 'radio-tl8-50km',
    name: 'Radio Transceiver (TL8, 50km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 8,
    mass_kg: 0,
    cost: 75,
    effect: 'Range: 50km',
    description: 'A pocket-sized radio transceiver. Miniaturisation has reduced the TL5 vehicle radio to something that fits in a hand. No comm network required.',
  },
  {
    id: 'radio-tl9-500km',
    name: 'Radio Transceiver (TL9, 500km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 9,
    mass_kg: 0,
    cost: 500,
    effect: 'Range: 500km (orbital range)',
    description: 'A handheld radio capable of reaching orbit. At 500km range this can reliably contact ships and stations in low orbit without a comm network.',
  },
  {
    id: 'radio-tl9-2500km',
    name: 'Radio Transceiver (TL9, 2,500km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 9,
    mass_kg: 0,
    cost: 5000,
    effect: 'Range: 2,500km, Computer/0',
    description: 'A high-powered personal transceiver with integrated Computer/0. Capable of reaching high orbit and relaying complex data.',
  },
  {
    id: 'radio-tl10-500km',
    name: 'Radio Transceiver (TL10, 500km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 10,
    mass_kg: 0,
    cost: 250,
    effect: 'Range: 500km, Computer/0',
    description: 'A compact orbital-range radio with integrated Computer/0. The affordable standard comm for spacers who need to reach orbit reliably.',
  },
  {
    id: 'radio-tl12-10000km',
    name: 'Radio Transceiver (TL12, 10,000km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 12,
    mass_kg: 1,
    cost: 1000,
    effect: 'Range: 10,000km, Computer/0',
    description: 'A powerful personal transceiver capable of planet-wide range. Slightly bulkier than most personal comms at this TL due to its exceptional range. Integrated Computer/0.',
  },
  {
    id: 'radio-tl13-1000km',
    name: 'Radio Transceiver (TL13, 1,000km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 13,
    mass_kg: 0,
    cost: 250,
    effect: 'Range: 1,000km, Computer/1',
    description: 'A compact transceiver with integrated Computer/1. Good orbital range with improved processing capability for data handling and encryption.',
  },
  {
    id: 'radio-tl14-3000km',
    name: 'Radio Transceiver (TL14, 3,000km)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 14,
    mass_kg: 0,
    cost: 500,
    effect: 'Range: 3,000km, Computer/1',
    description: 'A high-end personal transceiver with extensive range and Computer/1. Reliably reaches high orbit and beyond from a device that fits on a wrist.',
  },

  // ── Laser Transceivers ───────────────────────────────────────────
  {
    id: 'laser-transceiver-tl9',
    name: 'Laser Transceiver (TL9)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 9,
    mass_kg: 1.5,
    cost: 2500,
    effect: 'Range: 500km (orbital), Computer/0, line-of-sight, tap-proof',
    description: 'A laser-based communicator that transmits tight-beam signals. Requires line of sight but is virtually impossible to intercept or jam. Reaches orbital range. Integrated Computer/0.',
  },
  {
    id: 'laser-transceiver-tl11',
    name: 'Laser Transceiver (TL11)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 11,
    mass_kg: 0.5,
    cost: 1500,
    effect: 'Range: 500km (orbital), Computer/0, line-of-sight, tap-proof',
    description: 'A miniaturised laser transceiver. Same orbital range as the TL9 model but one-third the weight. Line-of-sight, tap-proof communications with Computer/0.',
  },
  {
    id: 'laser-transceiver-tl13',
    name: 'Laser Transceiver (TL13)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 13,
    mass_kg: 0,
    cost: 500,
    effect: 'Range: 500km (orbital), Computer/1, line-of-sight, tap-proof',
    description: 'An advanced laser transceiver small enough to be negligible weight. Tap-proof line-of-sight communication at orbital range with integrated Computer/1.',
  },

  // ── Bugs (Surveillance) ──────────────────────────────────────────
  {
    id: 'bug-tl5',
    name: 'Bug (TL5)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 5,
    mass_kg: 0,
    cost: 50,
    effect: 'Audio recording/transmission',
    description: 'A hidden microphone for covert audio surveillance. Can be active (transmitting) or passive (recording until collected). Early bugs are relatively large and easier to detect.',
  },
  {
    id: 'bug-tl7',
    name: 'Bug (TL7)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 7,
    mass_kg: 0,
    cost: 100,
    effect: 'Audio OR Visual recording/transmission',
    description: 'A miniaturised surveillance device capable of either audio or visual recording. Smaller and harder to detect than TL5 bugs. Active or passive modes.',
  },
  {
    id: 'bug-tl9',
    name: 'Bug (TL9)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 9,
    mass_kg: 0,
    cost: 200,
    effect: 'Audio OR Visual OR Data capture',
    description: 'A surveillance device that can record audio, visual, or computer data. If attached to a computer, it can search and copy data when a user accesses the system in its presence (cannot breach security on its own).',
  },
  {
    id: 'bug-tl11',
    name: 'Bug (TL11)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 11,
    mass_kg: 0,
    cost: 300,
    effect: 'Audio + Visual + Data capture (simultaneous)',
    description: 'An advanced bug that simultaneously captures audio, visual, and computer data. Very small and difficult to detect. Active or passive modes.',
  },
  {
    id: 'bug-tl13',
    name: 'Bug (TL13)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 13,
    mass_kg: 0,
    cost: 400,
    effect: 'Audio + Visual + Data + Bioscan (simultaneous)',
    description: 'A near-microscopic surveillance device with full audio/visual/data capture plus a biological scanner. Can sample DNA traces, chemical taints, and biological signatures. Nearly impossible to detect without specialised equipment.',
  },
  {
    id: 'bug-tl15',
    name: 'Bug (TL15)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 15,
    mass_kg: 0,
    cost: 500,
    effect: 'Audio + Visual + Data + Bioscan + Computer/1',
    description: 'The ultimate surveillance device \u2013 no bigger than a dust mote. Full audio/visual/data/bioscan capture with an onboard Computer/1 for autonomous data processing and intelligent filtering.',
  },

  // ── Commdot ──────────────────────────────────────────────────────
  {
    id: 'commdot',
    name: 'Commdot',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 10,
    mass_kg: 0,
    cost: 10,
    effect: 'Hands-free comm relay, range: few metres',
    description: 'A tiny microphone/speaker and transmitter, a few millimetres across. Interfaces with another comm device to relay messages hands-free. Range of only a few metres \u2013 typically used as a hands-free communicator, improvised bug, or throat mic.',
  },

  // ── Mobile Comms ─────────────────────────────────────────────────
  {
    id: 'mobile-comm-tl6',
    name: 'Mobile Comm (TL6)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 6,
    mass_kg: 0,
    cost: 50,
    effect: 'Audio only, requires comm network',
    description: 'A portable telecommunications device \u2013 a basic mobile phone. Audio only at this TL. Requires a planetary comm network for anything beyond short range. Bulky handset form factor.',
  },
  {
    id: 'mobile-comm-tl8',
    name: 'Mobile Comm (TL8)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 8,
    mass_kg: 0,
    cost: 150,
    effect: 'Audio + Visual, Computer/0, requires comm network',
    description: 'A smartphone-equivalent with audio, visual, and data capabilities plus Computer/0. Connects to planetary comm networks for messaging, data access, and video calls. Ranges from bulky handset to slim wrist device.',
  },
  {
    id: 'mobile-comm-tl10',
    name: 'Mobile Comm (TL10)',
    category: 'equipment',
    equipmentType: 'communications',
    tl: 10,
    mass_kg: 0,
    cost: 500,
    effect: 'Multiple data forms, Computer/1, requires comm network',
    description: 'An advanced personal comm handling multiple data formats with Computer/1. May project displays onto surfaces, use fold-out screens, or connect to cybernetics. On any tech-advanced world, provides access to data and communications anywhere via the planetary comm grid.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  COMBINED CATALOG & UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** All equipment in a single array for searching/filtering */
export const EQUIPMENT_CATALOG: EquipmentCatalogItem[] = [
  ...COMMS_EQUIPMENT,
  // Future categories will be added here:
  // ...SURVIVAL_EQUIPMENT,
  // ...ELECTRONICS_EQUIPMENT,
  // ...MEDICAL_EQUIPMENT,
  // ...TOOLS_EQUIPMENT,
  // ...SENSORS_EQUIPMENT,
  // ...SOFTWARE_EQUIPMENT,
  // ...MISC_EQUIPMENT,
];

/** Look up an equipment item by its catalog ID */
export function getEquipmentById(id: string): EquipmentCatalogItem | undefined {
  return EQUIPMENT_CATALOG.find(e => e.id === id);
}

/** Get all equipment of a specific type (for dropdown grouping) */
export function getEquipmentByType(equipmentType: EquipmentCatalogItem['equipmentType']): EquipmentCatalogItem[] {
  return EQUIPMENT_CATALOG.filter(e => e.equipmentType === equipmentType);
}
