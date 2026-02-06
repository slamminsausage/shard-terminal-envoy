/**
 * Traveller Core Rulebook - Pre-Made Ship Catalog
 *
 * Published ship designs from the core rulebook, encoded with exact
 * stat block data. Each ship includes:
 *   - Component breakdown as printed (tons + MCr per line)
 *   - Published totals (hull points, purchase cost, maintenance)
 *   - Power requirements
 *   - A ShipDesign object for the calculator engine
 *
 * Purchase costs include the standard 10% discount for production ships.
 * Full cost = purchaseCostMCr / 0.9
 */

import type { PreMadeShip } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  SCOUT / COURIER — TYPE S (100 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SCOUT_COURIER: PreMadeShip = {
  id: 'scout_courier',
  name: 'Scout/Courier',
  designation: 'Type S',
  category: 'scout',
  tl: 12,
  tonnage: 100,
  description:
    'The scout ship is built for exploration, survey and courier duties, with many thousands in service throughout Charted Space. Despite the small 100-ton hull, the scout is faster than most merchant ships and can jump further too. While multiple crew positions are technically required, it is standard practice for a scout to be crewed by just one or two highly skilled individuals who understand the requirements needed for self-sufficiency.',

  hullPoints: 40,
  purchaseCostMCr: 36.9405,
  maintenanceCostCrPerMonth: 3078,

  crew: ['Pilot', 'Astrogator', 'Engineer'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 20 },
    { system: 'Manoeuvre Drive', power: 20 },
    { system: 'Jump Drive', power: 20 },
    { system: 'Sensors', power: 2 },
  ],

  components: [
    { category: 'Hull', name: '100 tons, Streamlined', tons: null, costMCr: 6 },
    { category: 'Armour', name: 'Crystaliron, Armour: 4', tons: 5, costMCr: 1.2 },
    { category: 'M-Drive', name: 'Thrust 2', tons: 2, costMCr: 4 },
    { category: 'J-Drive', name: 'Jump-2', tons: 10, costMCr: 15 },
    { category: 'Power Plant', name: 'Fusion, Power 60', tons: 4, costMCr: 4 },
    { category: 'Fuel Tanks', name: 'J-2, 12 weeks operation', tons: 23, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 10, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5bis', tons: null, costMCr: 0.045 },
    { category: 'Sensors', name: 'Military Grade', tons: 2, costMCr: 4.1 },
    { category: 'Weapons', name: 'Double Turret', tons: 1, costMCr: 0.5 },
    { category: 'Systems', name: 'Fuel Scoop', tons: null, costMCr: null },
    { category: 'Systems', name: 'Fuel Processor (40 tons/day)', tons: 2, costMCr: 0.1 },
    { category: 'Systems', name: 'Probe Drones x10', tons: 2, costMCr: 1 },
    { category: 'Systems', name: 'Docking Space (4 tons)', tons: 5, costMCr: 1.25 },
    { category: 'Systems', name: 'Air/Raft', tons: null, costMCr: 0.25 },
    { category: 'Systems', name: 'Workshop', tons: 6, costMCr: 0.9 },
    { category: 'Software', name: 'Jump Control/2', tons: null, costMCr: 0.2 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x4', tons: 16, costMCr: 2 },
    { category: 'Cargo', name: 'Cargo', tons: 12, costMCr: null },
  ],

  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Scout/Courier',
    designation: 'Type S',
    techLevel: 12,
    tonnage: 100,
    hullConfiguration: 'streamlined',
    armorMaterial: 'crystaliron',
    armorProtection: 4,
    manoeuvreRating: 2,
    jumpRating: 2,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 4,
    additionalFuelWeeks: 8, // 12 weeks total - 4 base = 8 extra
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: true,
    sensorSuiteId: 'military',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'double_turret', weapons: [] },
    ],
    equipment: [
      { equipmentId: 'fuel_processor', tons: 2, quantity: 1 },
      { equipmentId: 'probe_drones', tons: 2, quantity: 1 },
      { equipmentId: 'docking_space', tons: 5, quantity: 1 },
      { equipmentId: 'workshop', tons: 6, quantity: 1 },
    ],
    standardStaterooms: 4,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 12,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SEEKER MINING SHIP — TYPE J (100 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SEEKER_MINING_SHIP: PreMadeShip = {
  id: 'seeker_mining_ship',
  name: 'Seeker Mining Ship',
  designation: 'Type J',
  category: 'mining',
  tl: 12,
  tonnage: 100,
  description:
    'A variation on the traditional scout/courier, the seeker is occasionally produced in this configuration by shipyards but it is far more common for it to be created by re-fitting an old Scout retired from active service. A seeker has fewer staterooms and a smaller fuel tank but its larger cargo bay and mining drones allow a single well-skilled prospector to scavenge asteroids and make a living looking for deposits of valuable minerals.',

  hullPoints: 40,
  purchaseCostMCr: 33.8355,
  maintenanceCostCrPerMonth: 2804,

  crew: ['Pilot', 'Astrogator', 'Engineer'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 20 },
    { system: 'Manoeuvre Drive', power: 20 },
    { system: 'Jump Drive', power: 20 },
    { system: 'Sensors', power: 2 },
  ],

  components: [
    { category: 'Hull', name: '100 tons, Streamlined', tons: null, costMCr: 6 },
    { category: 'Armour', name: 'Crystaliron, Armour: 4', tons: 5, costMCr: 1.2 },
    { category: 'M-Drive', name: 'Thrust 2', tons: 2, costMCr: 4 },
    { category: 'J-Drive', name: 'Jump-2', tons: 10, costMCr: 15 },
    { category: 'Power Plant', name: 'Fusion, Power 60', tons: 4, costMCr: 4 },
    { category: 'Fuel Tanks', name: 'J-2, 4 weeks operation', tons: 21, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 10, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5bis', tons: null, costMCr: 0.045 },
    { category: 'Sensors', name: 'Military Grade', tons: 2, costMCr: 4.1 },
    { category: 'Weapons', name: 'Double Turret', tons: 1, costMCr: 0.5 },
    { category: 'Systems', name: 'Fuel Scoop', tons: null, costMCr: null },
    { category: 'Systems', name: 'Fuel Processor (20 tons/day)', tons: 1, costMCr: 0.05 },
    { category: 'Systems', name: 'Mining Drones x5', tons: 10, costMCr: 1 },
    { category: 'Software', name: 'Jump Control/2', tons: null, costMCr: 0.2 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x2', tons: 8, costMCr: 1 },
    { category: 'Cargo', name: 'Cargo', tons: 26, costMCr: null },
  ],

  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Seeker Mining Ship',
    designation: 'Type J',
    techLevel: 12,
    tonnage: 100,
    hullConfiguration: 'streamlined',
    armorMaterial: 'crystaliron',
    armorProtection: 4,
    manoeuvreRating: 2,
    jumpRating: 2,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 4,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: true,
    sensorSuiteId: 'military',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'double_turret', weapons: [] },
    ],
    equipment: [
      { equipmentId: 'fuel_processor', tons: 1, quantity: 1 },
      { equipmentId: 'mining_drones', tons: 10, quantity: 1 },
    ],
    standardStaterooms: 2,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 26,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  FREE TRADER — TYPE A (200 tons)
// ═══════════════════════════════════════════════════════════════════════

export const FREE_TRADER: PreMadeShip = {
  id: 'free_trader',
  name: 'Free Trader',
  designation: 'Type A',
  category: 'trader',
  tl: 12,
  tonnage: 200,
  description:
    'Using a 200-ton hull, the free trader is an elementary interstellar merchant ship designed to ply the space lanes while carrying a mixture of cargo and passengers. It is the archetypal tramp freighter and common among adventuring groups and mercenary bands, often retrofitted with turrets, weapons and other \'special\' modifications. As such, actual specifications can vary wildly, often being proportional to the age of the ship but the free trader presented here is typical of a vessel fresh out of a shipyard.',

  hullPoints: 80,
  purchaseCostMCr: 46.332,
  maintenanceCostCrPerMonth: 3861,

  crew: ['Pilot', 'Astrogator', 'Engineer', 'Medic', 'Steward'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 40 },
    { system: 'Manoeuvre Drive', power: 20 },
    { system: 'Jump Drive', power: 20 },
    { system: 'Sensors', power: 1 },
  ],

  components: [
    { category: 'Hull', name: '200 tons, Streamlined', tons: null, costMCr: 12 },
    { category: 'Armour', name: 'Crystaliron, Armour: 2', tons: 5, costMCr: 1.2 },
    { category: 'M-Drive', name: 'Thrust 1', tons: 2, costMCr: 4 },
    { category: 'J-Drive', name: 'Jump-1', tons: 10, costMCr: 15 },
    { category: 'Power Plant', name: 'Fusion, Power 75', tons: 5, costMCr: 5 },
    { category: 'Fuel Tanks', name: 'J-1, 4 weeks operation', tons: 21, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 10, costMCr: 1 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Civilian Grade', tons: 1, costMCr: 3 },
    { category: 'Systems', name: 'Fuel Scoop', tons: null, costMCr: null },
    { category: 'Systems', name: 'Fuel Processor (20 tons/day)', tons: 1, costMCr: 0.05 },
    { category: 'Systems', name: 'Cargo Crane', tons: 3, costMCr: 3 },
    { category: 'Software', name: 'Jump Control/1', tons: null, costMCr: 0.1 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x10', tons: 40, costMCr: 5 },
    { category: 'Low Berths', name: 'Low Berths x20', tons: 10, costMCr: 1 },
    { category: 'Common Areas', name: 'Common Areas', tons: 11, costMCr: 1.1 },
    { category: 'Cargo', name: 'Cargo', tons: 81, costMCr: null },
  ],

  softwareIds: ['jump_control_1', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Free Trader',
    designation: 'Type A',
    techLevel: 12,
    tonnage: 200,
    hullConfiguration: 'streamlined',
    armorMaterial: 'crystaliron',
    armorProtection: 2,
    manoeuvreRating: 1,
    jumpRating: 1,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 5,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [
      { equipmentId: 'fuel_processor', tons: 1, quantity: 1 },
      { equipmentId: 'cargo_crane', tons: 3, quantity: 1 },
    ],
    standardStaterooms: 10,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 20,
    commonAreaTons: 11,
    cargoTons: 81,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  FAR TRADER (200 tons)
// ═══════════════════════════════════════════════════════════════════════

export const FAR_TRADER: PreMadeShip = {
  id: 'far_trader',
  name: 'Far Trader',
  designation: 'Type A2',
  category: 'trader',
  tl: 12,
  tonnage: 200,
  description:
    'While normally a modified free trader, the far trader has a series of modifications that have become accepted as standard and many free traders are either modified to this specification or are built this way from new. The far trader swaps cargo space and low berths for a larger jump drive and fuel tank, allowing it to reach systems a basic free trader cannot travel to. While less cargo can mean less profits, the ability to reach further systems or to travel between stars at a faster rate can more than make up for this in the hands of a clever captain.',

  hullPoints: 80,
  purchaseCostMCr: 53.3205,
  maintenanceCostCrPerMonth: 4443,

  crew: ['Pilot', 'Astrogator', 'Engineer', 'Medic', 'Steward'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 40 },
    { system: 'Manoeuvre Drive', power: 20 },
    { system: 'Jump Drive', power: 40 },
    { system: 'Sensors', power: 1 },
  ],

  components: [
    { category: 'Hull', name: '200 tons, Streamlined', tons: null, costMCr: 12 },
    { category: 'Armour', name: 'Crystaliron, Armour: 2', tons: 5, costMCr: 1.2 },
    { category: 'M-Drive', name: 'Thrust 1', tons: 2, costMCr: 4 },
    { category: 'J-Drive', name: 'Jump-2', tons: 15, costMCr: 22.5 },
    { category: 'Power Plant', name: 'Fusion, Power 90', tons: 6, costMCr: 6 },
    { category: 'Fuel Tanks', name: 'J-2, 4 weeks operation', tons: 41, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 10, costMCr: 1 },
    { category: 'Computer', name: 'Computer/5bis', tons: null, costMCr: 0.045 },
    { category: 'Sensors', name: 'Civilian Grade', tons: 1, costMCr: 3 },
    { category: 'Systems', name: 'Fuel Scoop', tons: null, costMCr: null },
    { category: 'Systems', name: 'Fuel Processor (40 tons/day)', tons: 2, costMCr: 0.1 },
    { category: 'Systems', name: 'Cargo Crane', tons: 3, costMCr: 3 },
    { category: 'Software', name: 'Jump Control/2', tons: null, costMCr: 0.2 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x10', tons: 40, costMCr: 5 },
    { category: 'Low Berths', name: 'Low Berths x6', tons: 3, costMCr: 0.3 },
    { category: 'Common Areas', name: 'Common Areas', tons: 9, costMCr: 0.9 },
    { category: 'Cargo', name: 'Cargo', tons: 63, costMCr: null },
  ],

  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Far Trader',
    designation: 'Type A2',
    techLevel: 12,
    tonnage: 200,
    hullConfiguration: 'streamlined',
    armorMaterial: 'crystaliron',
    armorProtection: 2,
    manoeuvreRating: 1,
    jumpRating: 2,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 6,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: true,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [
      { equipmentId: 'fuel_processor', tons: 2, quantity: 1 },
      { equipmentId: 'cargo_crane', tons: 3, quantity: 1 },
    ],
    standardStaterooms: 10,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 6,
    commonAreaTons: 9,
    cargoTons: 63,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SAFARI SHIP — TYPE K (200 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SAFARI_SHIP: PreMadeShip = {
  id: 'safari_ship',
  name: 'Safari Ship',
  designation: 'Type K',
  category: 'exploration',
  tl: 12,
  tonnage: 200,
  description:
    'Although at first appearance uniquely specialised, the safari ship is relatively common throughout the galaxy. It is primarily designed as an excursion vessel, capable of conducting trophy-taking expeditions (photographic or real) to distant worlds, all in a high degree of comfort. Indeed, some owners will outfit their safari ship to higher standards of luxury than many yachts. Included within the hull are two holding tanks with variable environments for live specimens and a trophy lounge that makes for a very comfortable mess area for passengers and crew. While the ship is streamlined and can land planetside, a launch and ATV permit expeditions across a planet\'s surface without requiring the whole vessel to leave orbit.',

  hullPoints: 80,
  purchaseCostMCr: 61.5303,
  maintenanceCostCrPerMonth: 5128,

  crew: ['Pilot', 'Astrogator', 'Engineer', 'Medic', 'Steward'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 40 },
    { system: 'Manoeuvre Drive', power: 20 },
    { system: 'Jump Drive', power: 40 },
    { system: 'Sensors', power: 1 },
  ],

  components: [
    { category: 'Hull', name: '200 tons, Streamlined', tons: null, costMCr: 12 },
    { category: 'M-Drive', name: 'Thrust 1', tons: 2, costMCr: 4 },
    { category: 'J-Drive', name: 'Jump-2', tons: 15, costMCr: 22.5 },
    { category: 'Power Plant', name: 'Fusion, Power 105', tons: 7, costMCr: 7 },
    { category: 'Fuel Tanks', name: 'J-2, 4 weeks operation', tons: 41, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 10, costMCr: 1 },
    { category: 'Computer', name: 'Computer/5bis', tons: null, costMCr: 0.045 },
    { category: 'Sensors', name: 'Civilian Grade', tons: 1, costMCr: 3 },
    { category: 'Weapons', name: 'Double Turret', tons: 1, costMCr: 0.5 },
    { category: 'Systems', name: 'Docking Space (20 tons)', tons: 22, costMCr: 5.5 },
    { category: 'Systems', name: 'Launch', tons: null, costMCr: 2.367 },
    { category: 'Systems', name: 'Docking Space (4 tons)', tons: 5, costMCr: 1.25 },
    { category: 'Systems', name: 'Air/Raft', tons: null, costMCr: 0.25 },
    { category: 'Systems', name: 'Fuel Scoop', tons: null, costMCr: null },
    { category: 'Systems', name: 'Fuel Processor (40 tons/day)', tons: 2, costMCr: 0.1 },
    { category: 'Systems', name: 'Multi-Environment Space', tons: 8, costMCr: 0.5 },
    { category: 'Systems', name: 'Multi-Environment Space', tons: 8, costMCr: 0.5 },
    { category: 'Systems', name: 'ATV (on Launch)', tons: null, costMCr: 0.155 },
    { category: 'Software', name: 'Jump Control/2', tons: null, costMCr: 0.2 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x11', tons: 44, costMCr: 5.5 },
    { category: 'Common Areas', name: 'Common Areas', tons: 13, costMCr: 1.3 },
    { category: 'Common Areas', name: 'Trophy Lounge', tons: 7, costMCr: 0.7 },
    { category: 'Cargo', name: 'Cargo', tons: 14, costMCr: null },
  ],

  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Safari Ship',
    designation: 'Type K',
    techLevel: 12,
    tonnage: 200,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 1,
    jumpRating: 2,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 7,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: true,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'double_turret', weapons: [] },
    ],
    equipment: [
      { equipmentId: 'docking_space', tons: 22, quantity: 1 },
      { equipmentId: 'docking_space', tons: 5, quantity: 1 },
      { equipmentId: 'fuel_processor', tons: 2, quantity: 1 },
      { equipmentId: 'multi_environment', tons: 8, quantity: 1 },
      { equipmentId: 'multi_environment', tons: 8, quantity: 1 },
    ],
    standardStaterooms: 11,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 20, // 13 + 7 (Trophy Lounge)
    cargoTons: 14,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SYSTEM DEFENCE BOAT (200 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SYSTEM_DEFENCE_BOAT: PreMadeShip = {
  id: 'system_defence_boat',
  name: 'System Defence Boat',
  designation: 'SDB',
  category: 'military',
  tl: 15,
  tonnage: 200,
  description:
    'The range of possible system defence boat (SDB) configurations is huge, if not actually infinite. This example is typical for Tech Level 15 systems; heavily armoured and equipped with both missile and laser weaponry. Its function is to operate within a star system and defend it from invading forces. SDBs can be used in space combat against starships or they may be pressed into service as air and orbital superiority craft in operations against ground forces. Because SDBs have no jump drives, shifting them from system-to-system can be a problem. Some have jump shuttles that attach themselves to the boat and provide jump capability. Another method is simple transport in large bulk cargo carriers.',

  hullPoints: 88,
  purchaseCostMCr: 134.217,
  maintenanceCostCrPerMonth: 11184,

  crew: [
    'Captain',
    'Pilot', 'Pilot', 'Pilot',
    'Engineer',
    'Maintenance',
    'Medic',
    'Gunner', 'Gunner', 'Gunner', 'Gunner',
    'Administrator',
    'Officer',
  ],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 40 },
    { system: 'Manoeuvre Drive', power: 180 },
    { system: 'Fuel Processor', power: 1 },
    { system: 'Sensors', power: 5 },
  ],

  components: [
    { category: 'Hull', name: '200 tons, Standard', tons: null, costMCr: 10 },
    { category: 'Hull', name: 'Reinforced', tons: null, costMCr: 5 },
    { category: 'Armour', name: 'Crystaliron, Armour: 13', tons: 33, costMCr: 9.75 },
    { category: 'M-Drive', name: 'Thrust 9', tons: 18, costMCr: 36 },
    { category: 'Power Plant', name: 'Fusion, Power 240', tons: 16, costMCr: 16 },
    { category: 'Fuel Tanks', name: '12 weeks operation', tons: 6, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 10, costMCr: 1 },
    { category: 'Computer', name: 'Computer/35', tons: null, costMCr: 30 },
    { category: 'Sensors', name: 'Improved, Countermeasures', tons: 5, costMCr: 12.3 },
    { category: 'Weapons', name: 'Triple Turret (beam lasers)', tons: 1, costMCr: 2.5 },
    { category: 'Weapons', name: 'Triple Turret (missile rack)', tons: 1, costMCr: 3.25 },
    { category: 'Ammunition', name: 'Missile Storage (144 missiles)', tons: 12, costMCr: null },
    { category: 'Armoured Bulkheads', name: 'Bridge', tons: 1, costMCr: 0.2 },
    { category: 'Armoured Bulkheads', name: 'Manoeuvre Drive', tons: 1.8, costMCr: 0.36 },
    { category: 'Armoured Bulkheads', name: 'Power Plant', tons: 1.6, costMCr: 0.32 },
    { category: 'Armoured Bulkheads', name: 'Sensors', tons: 0.5, costMCr: 0.1 },
    { category: 'Systems', name: 'Repair Drones', tons: 2, costMCr: 0.4 },
    { category: 'Systems', name: 'Fuel Scoop', tons: null, costMCr: 1 },
    { category: 'Systems', name: 'Fuel Processor (20 tons/day)', tons: 1, costMCr: 0.05 },
    { category: 'Systems', name: 'Medical Bay', tons: 4, costMCr: 2 },
    { category: 'Software', name: 'Auto-Repair/1', tons: null, costMCr: 5 },
    { category: 'Software', name: 'Evade/2', tons: null, costMCr: 2 },
    { category: 'Software', name: 'Fire Control/2', tons: null, costMCr: 4 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x15', tons: 60, costMCr: 7.5 },
    { category: 'Common Areas', name: 'Common Areas', tons: 4, costMCr: 0.4 },
    { category: 'Cargo', name: 'Cargo', tons: 22.85, costMCr: null },
  ],

  softwareIds: [
    'auto_repair_1',
    'evade_2',
    'fire_control_2',
    'library',
    'manoeuvre_0',
    'intellect_0',
  ],

  design: {
    name: 'System Defence Boat',
    designation: 'SDB',
    techLevel: 15,
    tonnage: 200,
    hullConfiguration: 'standard',
    armorMaterial: 'crystaliron',
    armorProtection: 13,
    manoeuvreRating: 9,
    jumpRating: 0,
    isReactionDrive: false,
    // Uses TL12 Fusion (15 power/ton) for 240 Power at 16 tons
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 16,
    additionalFuelWeeks: 8, // 12 weeks total - 4 base = 8 extra
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_35',
    computerBis: false,
    sensorSuiteId: 'improved',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'beam_laser'] },
      { mountType: 'triple_turret', weapons: ['missile_rack', 'missile_rack', 'missile_rack'] },
    ],
    equipment: [
      { equipmentId: 'reinforced_hull', tons: 0, quantity: 1 },
      { equipmentId: 'countermeasures', tons: 2, quantity: 1 },
      { equipmentId: 'ammunition_storage', tons: 12, quantity: 1 },
      { equipmentId: 'armoured_bulkheads', tons: 1, quantity: 1 },   // Bridge
      { equipmentId: 'armoured_bulkheads', tons: 1.8, quantity: 1 }, // M-Drive
      { equipmentId: 'armoured_bulkheads', tons: 1.6, quantity: 1 }, // Power Plant
      { equipmentId: 'armoured_bulkheads', tons: 0.5, quantity: 1 }, // Sensors
      { equipmentId: 'repair_drones', tons: 2, quantity: 1 },
      { equipmentId: 'fuel_scoop', tons: 0, quantity: 1 },
      { equipmentId: 'fuel_processor', tons: 1, quantity: 1 },
      { equipmentId: 'medical_bay', tons: 4, quantity: 1 },
    ],
    standardStaterooms: 15,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 4,
    cargoTons: 22.85,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  ALL PRE-MADE SHIPS
// ═══════════════════════════════════════════════════════════════════════

export const PRE_MADE_SHIPS: PreMadeShip[] = [
  SCOUT_COURIER,
  SEEKER_MINING_SHIP,
  FREE_TRADER,
  FAR_TRADER,
  SAFARI_SHIP,
  SYSTEM_DEFENCE_BOAT,
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Get a pre-made ship by ID */
export function getPreMadeShip(id: string): PreMadeShip | undefined {
  return PRE_MADE_SHIPS.find((s) => s.id === id);
}

/** Get all pre-made ships in a category */
export function getShipsByCategory(category: PreMadeShip['category']): PreMadeShip[] {
  return PRE_MADE_SHIPS.filter((s) => s.category === category);
}

/** Get the full (undiscounted) cost of a pre-made ship */
export function getFullCostMCr(ship: PreMadeShip): number {
  return ship.purchaseCostMCr / 0.9;
}
