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
//  YACHT — TYPE Y (200 tons)
// ═══════════════════════════════════════════════════════════════════════

export const YACHT: PreMadeShip = {
  id: 'yacht',
  name: 'Yacht',
  designation: 'Type Y',
  category: 'passenger',
  tl: 12,
  tonnage: 200,
  description:
    'The yacht is a noble\'s plaything, used to entertain friends and undertake political or commercial missions. The staterooms are all well-appointed but even they fail to make the grade in comparison to the luxury stateroom intended for the yacht\'s owner. The yacht carries an air/raft and a ship\'s boat within docking compartments; an ATV is also carried, with the ship\'s boat being used to ferry it from orbit to surface and back again.',

  hullPoints: 80,
  purchaseCostMCr: 67.007,
  maintenanceCostCrPerMonth: 5584,

  crew: ['Pilot', 'Astrogator', 'Engineer', 'Medic', 'Steward'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 40 },
    { system: 'Manoeuvre Drive', power: 20 },
    { system: 'Jump Drive', power: 20 },
    { system: 'Sensors', power: 1 },
  ],

  components: [
    { category: 'Hull', name: '200 tons, Standard', tons: null, costMCr: 10 },
    { category: 'M-Drive', name: 'Thrust 1', tons: 2, costMCr: 4 },
    { category: 'J-Drive', name: 'Jump-1', tons: 10, costMCr: 15 },
    { category: 'Power Plant', name: 'Fusion, Power 90', tons: 6, costMCr: 6 },
    { category: 'Fuel Tanks', name: 'J-1, 8 weeks operation', tons: 22, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 10, costMCr: 1 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Civilian Grade', tons: 1, costMCr: 3 },
    { category: 'Systems', name: 'Docking Space (4 tons)', tons: 5, costMCr: 1.25 },
    { category: 'Systems', name: 'Air/Raft', tons: null, costMCr: 0.25 },
    { category: 'Systems', name: 'Docking Space (30 tons)', tons: 33, costMCr: 8.25 },
    { category: 'Systems', name: "Ship's Boat", tons: null, costMCr: 7.272 },
    { category: 'Systems', name: "ATV (on ship's boat)", tons: null, costMCr: 0.155 },
    { category: 'Software', name: 'Jump Control/1', tons: null, costMCr: 0.1 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x12', tons: 48, costMCr: 6 },
    { category: 'Staterooms', name: 'Luxury x1', tons: 10, costMCr: 1.5 },
    { category: 'Common Areas', name: 'Common Areas', tons: 32, costMCr: 3.2 },
    { category: 'Cargo', name: 'Cargo', tons: 21, costMCr: null },
  ],

  softwareIds: ['jump_control_1', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Yacht',
    designation: 'Type Y',
    techLevel: 12,
    tonnage: 200,
    hullConfiguration: 'standard',
    armorProtection: 0,
    manoeuvreRating: 1,
    jumpRating: 1,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 6,
    additionalFuelWeeks: 4, // 8 weeks total - 4 base
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [
      { equipmentId: 'docking_space', tons: 5, quantity: 1 },  // Air/Raft
      { equipmentId: 'docking_space', tons: 33, quantity: 1 }, // Ship's Boat
    ],
    standardStaterooms: 12,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 1,
    lowBerths: 0,
    commonAreaTons: 32,
    cargoTons: 21,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  CLOSE ESCORT — CLASS GAZELLE (400 tons)
// ═══════════════════════════════════════════════════════════════════════

export const CLOSE_ESCORT_GAZELLE: PreMadeShip = {
  id: 'close_escort_gazelle',
  name: 'Close Escort',
  designation: 'Class: Gazelle',
  category: 'military',
  tl: 15,
  tonnage: 400,
  description:
    'Hundreds of Gazelle-class escorts have been built and many remain in service in the Imperial Navy, despite the fact that in a combat situation, they are nearly worthless. The close escort, even when new, was not intended to stand up to close combat vessels; rather it was envisioned as an anti-piracy and revenue patrol ship. In that role, it has performed well but when pressed into combat duties it has invariably suffered disproportionate losses. With the internal tankage Jump-3 can be achieved, with drop tanks Jump-5, with the drop tanks retained Jump-4.',

  hullPoints: 176,
  purchaseCostMCr: 249.0003,
  maintenanceCostCrPerMonth: 20750,

  crew: [
    'Captain',
    'Pilot', 'Pilot', 'Pilot',
    'Astrogator',
    'Engineer', 'Engineer', 'Engineer', 'Engineer',
    'Medic',
    'Gunner', 'Gunner', 'Gunner', 'Gunner',
    'Gunner', 'Gunner', 'Gunner', 'Gunner',
    'Administrator',
    'Maintenance',
    'Officer',
  ],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 80 },
    { system: 'Manoeuvre Drive', power: 240 },
    { system: 'Jump Drive', power: 200 },
    { system: 'Sensors', power: 2 },
  ],

  components: [
    { category: 'Hull', name: '400 tons, Standard', tons: null, costMCr: 20 },
    { category: 'Hull', name: 'Reinforced', tons: null, costMCr: 10 },
    { category: 'Armour', name: 'Crystaliron, Armour: 3', tons: 15, costMCr: 4.5 },
    { category: 'M-Drive', name: 'Thrust 6', tons: 24, costMCr: 48 },
    { category: 'J-Drive', name: 'Jump-5', tons: 55, costMCr: 82.5 },
    { category: 'Power Plant', name: 'Fusion, Power 540', tons: 36, costMCr: 36 },
    { category: 'Fuel Tanks', name: 'J-3, 8 weeks operation', tons: 128, costMCr: null },
    { category: 'Bridge', name: 'Small', tons: 10, costMCr: 1 },
    { category: 'Computer', name: 'Computer/30', tons: null, costMCr: 20 },
    { category: 'Sensors', name: 'Military Grade', tons: 2, costMCr: 4.1 },
    { category: 'Weapons', name: 'Particle Barbettes x2', tons: 10, costMCr: 16 },
    { category: 'Weapons', name: 'Triple Turrets (beam lasers) x2', tons: 2, costMCr: 5 },
    { category: 'Systems', name: 'Drop Tank Mount (80 tons)', tons: 0.32, costMCr: 0.16 },
    { category: 'Systems', name: 'Fuel Processor (120 tons/day)', tons: 6, costMCr: 0.3 },
    { category: 'Systems', name: 'Armoury', tons: 1, costMCr: 0.25 },
    { category: 'Systems', name: 'Fuel Scoops', tons: null, costMCr: 1 },
    { category: 'Craft', name: 'Docking Space (20 tons)', tons: 22, costMCr: 5.5 },
    { category: 'Craft', name: 'Gig', tons: null, costMCr: 6.257 },
    { category: 'Software', name: 'Evade/1', tons: null, costMCr: 1 },
    { category: 'Software', name: 'Fire Control/4', tons: null, costMCr: 8 },
    { category: 'Software', name: 'Jump Control/5', tons: null, costMCr: 0.5 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x11', tons: 44, costMCr: 5.5 },
    { category: 'Common Areas', name: 'Common Areas', tons: 11, costMCr: 1.1 },
    { category: 'Cargo', name: 'Cargo', tons: 33.68, costMCr: null },
  ],

  softwareIds: [
    'evade_1',
    'fire_control_4',
    'jump_control_5',
    'library',
    'manoeuvre_0',
    'intellect_0',
  ],

  design: {
    name: 'Close Escort',
    designation: 'Class: Gazelle',
    techLevel: 15,
    tonnage: 400,
    hullConfiguration: 'standard',
    armorMaterial: 'crystaliron',
    armorProtection: 3,
    manoeuvreRating: 6,
    jumpRating: 5,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 36,
    additionalFuelWeeks: 4, // 8 weeks total - 4 base
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_30',
    computerBis: false,
    sensorSuiteId: 'military',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'triple_turret', weapons: ['particle_barbette', 'particle_barbette'] },
      { mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'beam_laser'] },
      { mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'beam_laser'] },
    ],
    equipment: [
      { equipmentId: 'reinforced_hull', tons: 0, quantity: 1 },
      { equipmentId: 'drop_tank_mount', tons: 0.32, quantity: 1 },
      { equipmentId: 'fuel_processor', tons: 6, quantity: 1 },
      { equipmentId: 'armoury', tons: 1, quantity: 1 },
      { equipmentId: 'fuel_scoop', tons: 0, quantity: 1 },
      { equipmentId: 'docking_space', tons: 22, quantity: 1 },
    ],
    standardStaterooms: 11,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 11,
    cargoTons: 33.68,
    notes: 'Small bridge (10 tons instead of standard 20). With internal tankage Jump-3, with drop tanks Jump-5, with drop tanks retained Jump-4.',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  LABORATORY SHIP — TYPE L (400 tons)
// ═══════════════════════════════════════════════════════════════════════

export const LABORATORY_SHIP: PreMadeShip = {
  id: 'laboratory_ship',
  name: 'Laboratory Ship',
  designation: 'Type L',
  category: 'exploration',
  tl: 12,
  tonnage: 400,
  description:
    'A highly specialised vessel, the laboratory ship is built to transport scientists and their equipment across the stars in order to conduct research, usually in remote locations. The ship itself is fitted with highly advanced sensors, while a pinnace can carry an ATV down to a planet\'s surface in order to conduct field expeditions. A special feature of this ship is that it is built so internal gravity can be created by spinning the hull. This is done to permit experiments to be carried out that might otherwise be affected by the gravetic plates installed as standard on all ships.',

  hullPoints: 160,
  purchaseCostMCr: 136.3743,
  maintenanceCostCrPerMonth: 11365,

  crew: ['Pilot', 'Astrogator', 'Engineer', 'Medic'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 80 },
    { system: 'Manoeuvre Drive', power: 80 },
    { system: 'Jump Drive', power: 80 },
    { system: 'Sensors', power: 4 },
  ],

  components: [
    { category: 'Hull', name: '400 tons, Standard', tons: null, costMCr: 20 },
    { category: 'M-Drive', name: 'Thrust 2', tons: 8, costMCr: 16 },
    { category: 'J-Drive', name: 'Jump-2', tons: 25, costMCr: 37.5 },
    { category: 'Power Plant', name: 'Fusion, Power 180', tons: 12, costMCr: 12 },
    { category: 'Fuel Tanks', name: 'J-2, 4 weeks operation', tons: 82, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 20, costMCr: 2 },
    { category: 'Computer', name: 'Computer/10', tons: null, costMCr: 0.16 },
    { category: 'Sensors', name: 'Improved', tons: 3, costMCr: 4.3 },
    { category: 'Systems', name: 'Probe Drones x15', tons: 3, costMCr: 1.5 },
    { category: 'Systems', name: 'Docking Space (40 tons)', tons: 44, costMCr: 11 },
    { category: 'Systems', name: 'Pinnace', tons: null, costMCr: 8.712 },
    { category: 'Systems', name: 'Laboratories', tons: 100, costMCr: 25 },
    { category: 'Systems', name: 'Docking Space (4 tons)', tons: 5, costMCr: 1.25 },
    { category: 'Systems', name: 'Air/Raft', tons: null, costMCr: 0.25 },
    { category: 'Systems', name: 'ATV (stored in pinnace)', tons: null, costMCr: 0.155 },
    { category: 'Software', name: 'Jump Control/2', tons: null, costMCr: 0.2 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x20', tons: 80, costMCr: 10 },
    { category: 'Common Areas', name: 'Common Areas', tons: 15, costMCr: 1.5 },
    { category: 'Cargo', name: 'Cargo', tons: 3, costMCr: null },
  ],

  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Laboratory Ship',
    designation: 'Type L',
    techLevel: 12,
    tonnage: 400,
    hullConfiguration: 'standard',
    armorProtection: 0,
    manoeuvreRating: 2,
    jumpRating: 2,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 12,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_10',
    computerBis: false,
    sensorSuiteId: 'improved',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [
      { equipmentId: 'probe_drones', tons: 3, quantity: 1 },
      { equipmentId: 'docking_space', tons: 44, quantity: 1 }, // Pinnace
      { equipmentId: 'laboratory', tons: 100, quantity: 1 },
      { equipmentId: 'docking_space', tons: 5, quantity: 1 },  // Air/Raft
    ],
    standardStaterooms: 20,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 15,
    cargoTons: 3,
    notes: 'Hull can spin for gravity (permits experiments unaffected by gravetic plates). Pinnace carries ATV for surface expeditions.',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  PATROL CORVETTE — TYPE T (400 tons)
// ═══════════════════════════════════════════════════════════════════════

export const PATROL_CORVETTE: PreMadeShip = {
  id: 'patrol_corvette',
  name: 'Patrol Corvette',
  designation: 'Type T',
  category: 'military',
  tl: 12,
  tonnage: 400,
  description:
    'The patrol corvette is used by military organisations as a cheap but effective vessel for customs patrols, anti-piracy work and system defence. Despite being only a 400 ton hull, this corvette remains more than a match for typical pirate vessels of a similar size. The auxiliary ship\'s boat and G/carrier on board, combined with a streamlined hull, allow the patrol corvette to pursue targets through atmospheres and down onto planetary surfaces, ensuring there is no escape.',

  hullPoints: 160,
  purchaseCostMCr: 184.4568,
  maintenanceCostCrPerMonth: 15371,

  crew: [
    'Pilot',
    'Astrogator',
    'Engineer', 'Engineer',
    'Medic',
    'Gunner', 'Gunner', 'Gunner', 'Gunner',
    'Marine', 'Marine', 'Marine', 'Marine',
    'Marine', 'Marine', 'Marine', 'Marine',
  ],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 80 },
    { system: 'Manoeuvre Drive', power: 160 },
    { system: 'Jump Drive', power: 120 },
    { system: 'Sensors', power: 2 },
    { system: 'Weapons', power: 28 },
  ],

  components: [
    { category: 'Hull', name: '400 tons, Streamlined', tons: null, costMCr: 24 },
    { category: 'Armour', name: 'Crystaliron, Armour: 4', tons: 20, costMCr: 4.8 },
    { category: 'M-Drive', name: 'Thrust 4', tons: 16, costMCr: 32 },
    { category: 'J-Drive', name: 'Jump-3', tons: 35, costMCr: 52.5 },
    { category: 'Power Plant', name: 'Fusion, Power 405', tons: 27, costMCr: 27 },
    { category: 'Fuel Tanks', name: "J-3, 4 weeks operation, plus Ship's Boat", tons: 124, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 20, costMCr: 2 },
    { category: 'Computer', name: 'Computer/15', tons: null, costMCr: 2 },
    { category: 'Sensors', name: 'Military Grade', tons: 2, costMCr: 4.1 },
    { category: 'Weapons', name: 'Triple Turrets (pulse lasers) x2', tons: 2, costMCr: 5 },
    { category: 'Weapons', name: 'Triple Turrets (missile racks) x2', tons: 2, costMCr: 6.5 },
    { category: 'Systems', name: 'Docking Space (30 tons)', tons: 33, costMCr: 8.25 },
    { category: 'Systems', name: "Ship's Boat", tons: null, costMCr: 7.272 },
    { category: 'Systems', name: 'Docking Space (15 tons)', tons: 17, costMCr: 4.25 },
    { category: 'Systems', name: 'G/Carrier', tons: null, costMCr: 11.58 },
    { category: 'Systems', name: 'Fuel Scoop', tons: null, costMCr: null },
    { category: 'Systems', name: 'Fuel Processors (80 tons a day)', tons: 4, costMCr: 0.2 },
    { category: 'Software', name: 'Evade/1', tons: null, costMCr: 1 },
    { category: 'Software', name: 'Fire Control/1', tons: null, costMCr: 2 },
    { category: 'Software', name: 'Jump Control/3', tons: null, costMCr: 0.3 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x12', tons: 48, costMCr: 6 },
    { category: 'Low Berths', name: 'Low Berths x4', tons: 2, costMCr: 0.2 },
    { category: 'Common Areas', name: 'Common Areas', tons: 10, costMCr: 1 },
    { category: 'Cargo', name: 'Cargo', tons: 38, costMCr: null },
  ],

  softwareIds: [
    'evade_1',
    'fire_control_1',
    'jump_control_3',
    'library',
    'manoeuvre_0',
    'intellect_0',
  ],

  design: {
    name: 'Patrol Corvette',
    designation: 'Type T',
    techLevel: 12,
    tonnage: 400,
    hullConfiguration: 'streamlined',
    armorMaterial: 'crystaliron',
    armorProtection: 4,
    manoeuvreRating: 4,
    jumpRating: 3,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 27,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_15',
    computerBis: false,
    sensorSuiteId: 'military',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'triple_turret', weapons: ['pulse_laser', 'pulse_laser', 'pulse_laser'] },
      { mountType: 'triple_turret', weapons: ['pulse_laser', 'pulse_laser', 'pulse_laser'] },
      { mountType: 'triple_turret', weapons: ['missile_rack', 'missile_rack', 'missile_rack'] },
      { mountType: 'triple_turret', weapons: ['missile_rack', 'missile_rack', 'missile_rack'] },
    ],
    equipment: [
      { equipmentId: 'docking_space', tons: 33, quantity: 1 },  // Ship's Boat
      { equipmentId: 'docking_space', tons: 17, quantity: 1 },  // G/Carrier
      { equipmentId: 'fuel_processor', tons: 4, quantity: 1 },
    ],
    standardStaterooms: 12,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 4,
    commonAreaTons: 10,
    cargoTons: 38,
    notes: 'Streamlined hull allows atmospheric pursuit. Carries 8 marines for boarding actions.',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SUBSIDISED MERCHANT — TYPE R (400 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SUBSIDISED_MERCHANT: PreMadeShip = {
  id: 'subsidised_merchant',
  name: 'Subsidised Merchant',
  designation: 'Type R',
  category: 'trader',
  tl: 12,
  tonnage: 400,
  description:
    'The subsidised merchant (also called the fat trader) is a trading vessel intended to meet the commercial needs of clusters of worlds. It is twice the size of a free trader but carries cargo far more efficiently with a cavernous cargo bay more than twice the size of that within its little cousin. In fact, if its cargo bay doors were larger, the subsidised merchant could theoretically swallow a free trader whole. This ship normally requires a crew of five, although the pilot also operates the launch, a steward is only necessary if carrying commercial passengers and gunners may be added to the list if weapons are installed.',

  hullPoints: 160,
  purchaseCostMCr: 78.3423,
  maintenanceCostCrPerMonth: 6529,

  crew: ['Pilot', 'Astrogator', 'Engineer', 'Medic', 'Steward'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 80 },
    { system: 'Manoeuvre Drive', power: 40 },
    { system: 'Jump Drive', power: 40 },
    { system: 'Sensors', power: 1 },
  ],

  components: [
    { category: 'Hull', name: '400 tons, Streamlined', tons: null, costMCr: 24 },
    { category: 'M-Drive', name: 'Thrust 1', tons: 4, costMCr: 8 },
    { category: 'J-Drive', name: 'Jump-1', tons: 15, costMCr: 22.5 },
    { category: 'Power Plant', name: 'Fusion, Power 135', tons: 9, costMCr: 9 },
    { category: 'Fuel Tanks', name: 'J-1, 4 weeks operation', tons: 41, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 20, costMCr: 2 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Civilian Grade', tons: 1, costMCr: 3 },
    { category: 'Systems', name: 'Fuel Scoop', tons: null, costMCr: null },
    { category: 'Systems', name: 'Fuel Processors (20 tons/day)', tons: 1, costMCr: 0.05 },
    { category: 'Systems', name: 'Docking Space (20 tons)', tons: 22, costMCr: 5.5 },
    { category: 'Systems', name: 'Launch', tons: null, costMCr: 2.367 },
    { category: 'Software', name: 'Jump Control/1', tons: null, costMCr: 0.1 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x19', tons: 76, costMCr: 9.5 },
    { category: 'Low Berths', name: 'Low Berths x9', tons: 4.5, costMCr: 0.45 },
    { category: 'Common Areas', name: 'Common Areas', tons: 5.5, costMCr: 0.55 },
    { category: 'Cargo', name: 'Cargo', tons: 201, costMCr: null },
  ],

  softwareIds: ['jump_control_1', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Subsidised Merchant',
    designation: 'Type R',
    techLevel: 12,
    tonnage: 400,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 1,
    jumpRating: 1,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 9,
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
      { equipmentId: 'docking_space', tons: 22, quantity: 1 }, // Launch
    ],
    standardStaterooms: 19,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 9,
    commonAreaTons: 5.5,
    cargoTons: 201,
    notes: 'Also called the "fat trader". Cavernous cargo bay. Fuel scoop included with streamlined hull.',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SURVEY SCOUT — CLASS DONOSEV (400 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SURVEY_SCOUT_DONOSEV: PreMadeShip = {
  id: 'survey_scout_donosev',
  name: 'Survey Scout',
  designation: 'Class: Donosev',
  category: 'scout',
  tl: 14,
  tonnage: 400,
  description:
    'The survey scout is a typical ship in service with the Imperial Interstellar Scout Service. Its function is to continually re-survey the interior regions of the Imperium, updating maps and charts, and maintaining beacons and markers for astrogation hazards. The survey scout is a peaceful vessel, typically unarmed and inoffensive. It does, however, mount four hardpoints and can be armed with a variety of turrets and weaponry if necessary. The Donosev-class survey scout is named for famous scouts in the Imperial service.',

  hullPoints: 160,
  purchaseCostMCr: 152.3583,
  maintenanceCostCrPerMonth: 12697,

  crew: ['Pilot', 'Astrogator', 'Engineer', 'Engineer', 'Maintenance'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 80 },
    { system: 'Manoeuvre Drive', power: 80 },
    { system: 'Jump Drive', power: 120 },
    { system: 'Sensors', power: 4 },
  ],

  components: [
    { category: 'Hull', name: '400 tons, Standard', tons: null, costMCr: 20 },
    { category: 'M-Drive', name: 'Thrust 2', tons: 8, costMCr: 16 },
    { category: 'J-Drive', name: 'Jump-3 (reduced size x2)', tons: 28, costMCr: 52.5 },
    { category: 'Power Plant', name: 'Fusion, Power 210', tons: 14, costMCr: 14 },
    { category: 'Fuel Tanks', name: 'J-3, 8 weeks operation', tons: 124, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 20, costMCr: 2 },
    { category: 'Computer', name: 'Computer/25', tons: null, costMCr: 10 },
    { category: 'Sensors', name: 'Improved', tons: 3, costMCr: 4.3 },
    { category: 'Systems', name: 'Workshop', tons: 6, costMCr: 0.9 },
    { category: 'Systems', name: 'Advanced Probe Drones', tons: 4, costMCr: 3.2 },
    { category: 'Systems', name: 'Fuel Processor (120 tons/day)', tons: 6, costMCr: 0.3 },
    { category: 'Systems', name: 'Sensor Station', tons: 1, costMCr: 0.5 },
    { category: 'Systems', name: 'Laboratories x2', tons: 8, costMCr: 2 },
    { category: 'Craft', name: 'Full Hangar (50 tons)', tons: 100, costMCr: 20 },
    { category: 'Craft', name: 'Modular Cutter', tons: null, costMCr: 10.287 },
    { category: 'Craft', name: 'Docking Space (extra module)', tons: 33, costMCr: 8.25 },
    { category: 'Craft', name: 'Docking Space (12 tons)', tons: 14, costMCr: 3.5 },
    { category: 'Craft', name: 'Air/Raft x3', tons: null, costMCr: 0.75 },
    { category: 'Software', name: 'Jump Control/3', tons: null, costMCr: 0.3 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x10', tons: 40, costMCr: 5 },
    { category: 'Common Areas', name: 'Common Areas', tons: 10, costMCr: 1 },
    { category: 'Cargo', name: 'Cargo', tons: 26, costMCr: null },
  ],

  softwareIds: ['jump_control_3', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Survey Scout',
    designation: 'Class: Donosev',
    techLevel: 14,
    tonnage: 400,
    hullConfiguration: 'standard',
    armorProtection: 0,
    manoeuvreRating: 2,
    jumpRating: 3,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 14,
    additionalFuelWeeks: 4, // 8 weeks total - 4 base
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_25',
    computerBis: false,
    sensorSuiteId: 'improved',
    additionalSensorStations: 1,
    weapons: [],
    equipment: [
      { equipmentId: 'workshop', tons: 6, quantity: 1 },
      { equipmentId: 'advanced_probe_drones', tons: 4, quantity: 1 },
      { equipmentId: 'fuel_processor', tons: 6, quantity: 1 },
      { equipmentId: 'laboratory', tons: 8, quantity: 1 },
      { equipmentId: 'full_hangar', tons: 100, quantity: 1 },
      { equipmentId: 'docking_space', tons: 33, quantity: 1 }, // Extra module
      { equipmentId: 'docking_space', tons: 14, quantity: 1 }, // Air/Rafts
    ],
    standardStaterooms: 10,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 10,
    cargoTons: 26,
    notes: 'J-Drive is reduced size x2. Mounts 4 hardpoints (unarmed as standard). Full hangar for modular cutter with maintenance facilities.',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SUBSIDISED LINER — TYPE M (600 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SUBSIDISED_LINER: PreMadeShip = {
  id: 'subsidised_liner',
  name: 'Subsidised Liner',
  designation: 'Type M',
  category: 'passenger',
  tl: 14,
  tonnage: 600,
  description:
    'The subsidised liner is built for carrying passengers and cargo on long haul routes, in a modicum of comfort; while a steward is present, passengers should expect cheap interstellar rather than luxury. Overall the ship is capable of carrying 24 passengers in addition to its crew, with a further 20 in low berths. With a three parsec jump capability, a lot of destinations are possible. Although the hull of the ship itself is understreamlined, a launch allows passengers to be ferried to the surface of a world or act as a life boat in emergencies.',

  hullPoints: 240,
  purchaseCostMCr: 158.3163,
  maintenanceCostCrPerMonth: 13193,

  crew: ['Pilot', 'Astrogator', 'Engineer', 'Engineer', 'Medic', 'Steward'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 120 },
    { system: 'Manoeuvre Drive', power: 60 },
    { system: 'Jump Drive', power: 180 },
    { system: 'Sensors', power: 1 },
  ],

  components: [
    { category: 'Hull', name: '600 tons, Standard', tons: null, costMCr: 30 },
    { category: 'M-Drive', name: 'Thrust 1', tons: 6, costMCr: 12 },
    { category: 'J-Drive', name: 'Jump-3', tons: 50, costMCr: 75 },
    { category: 'Power Plant', name: 'Fusion, Power 360', tons: 24, costMCr: 24 },
    { category: 'Fuel Tanks', name: 'J-3, 4 weeks operation', tons: 183, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 20, costMCr: 3 },
    { category: 'Computer', name: 'Computer/10bis', tons: null, costMCr: 0.24 },
    { category: 'Sensors', name: 'Civilian Grade', tons: 1, costMCr: 3 },
    { category: 'Systems', name: 'Docking Space (20 tons)', tons: 22, costMCr: 5.5 },
    { category: 'Systems', name: 'Launch', tons: null, costMCr: 2.367 },
    { category: 'Software', name: 'Jump Control/3', tons: null, costMCr: 0.3 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x30', tons: 120, costMCr: 15 },
    { category: 'Low Berths', name: 'Low Berths x20', tons: 10, costMCr: 1 },
    { category: 'Common Areas', name: 'Common Areas', tons: 45, costMCr: 4.5 },
    { category: 'Cargo', name: 'Cargo', tons: 119, costMCr: null },
  ],

  softwareIds: ['jump_control_3', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Subsidised Liner',
    designation: 'Type M',
    techLevel: 14,
    tonnage: 600,
    hullConfiguration: 'standard',
    armorProtection: 0,
    manoeuvreRating: 1,
    jumpRating: 3,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 24,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_10',
    computerBis: true,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [
      { equipmentId: 'docking_space', tons: 22, quantity: 1 }, // Launch
    ],
    standardStaterooms: 30,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 20,
    commonAreaTons: 45,
    cargoTons: 119,
    notes: 'Understreamlined hull. Launch serves as passenger ferry and emergency lifeboat. Carries 24 passengers plus 20 in low berths.',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  MERCENARY CRUISER — TYPE C (800 tons)
// ═══════════════════════════════════════════════════════════════════════

export const MERCENARY_CRUISER: PreMadeShip = {
  id: 'mercenary_cruiser',
  name: 'Mercenary Cruiser',
  designation: 'Type C',
  category: 'military',
  tl: 12,
  tonnage: 800,
  description:
    'The mercenary cruiser is built to carry small troop units for corporate, governmental or, more commonly, mercenary operations. It has enough space to carry a combat platoon, plus crew and support personnel, along with their equipment, albeit in fairly cramped confines. The platoon can be deployed to a planet\'s surface within the two modular cutters housed inside the ship and can then disembark using the ATVs the two cutters carry. Turrets are fitted as standard but while shipyards do not generally include weapons, it is a rare mercenary cruiser that is not armed to the teeth.',

  hullPoints: 320,
  purchaseCostMCr: 292.4646,
  maintenanceCostCrPerMonth: 24372,

  crew: [
    'Pilot',
    'Astrogator',
    'Engineer', 'Engineer', 'Engineer',
    'Medic',
  ],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 160 },
    { system: 'Manoeuvre Drive', power: 240 },
    { system: 'Jump Drive', power: 240 },
    { system: 'Sensors', power: 2 },
    { system: 'Turrets', power: 8 },
  ],

  components: [
    { category: 'Hull', name: '800 tons, Sphere', tons: null, costMCr: 32 },
    { category: 'Armour', name: 'Crystaliron, Armour: 4', tons: 40, costMCr: 6.4 },
    { category: 'M-Drive', name: 'Thrust 3', tons: 24, costMCr: 48 },
    { category: 'J-Drive', name: 'Jump-3', tons: 65, costMCr: 97.5 },
    { category: 'Power Plant', name: 'Fusion, Power 750', tons: 50, costMCr: 50 },
    { category: 'Fuel Tanks', name: 'J-3, 4 weeks operation, fuel for Cutters', tons: 252, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 20, costMCr: 4 },
    { category: 'Computer', name: 'Computer/20fib', tons: null, costMCr: 7.5 },
    { category: 'Sensors', name: 'Military Grade', tons: 2, costMCr: 4.1 },
    { category: 'Weapons', name: 'Triple Turrets x8', tons: 8, costMCr: 8 },
    { category: 'Systems', name: 'Docking Space (4 tons)', tons: 5, costMCr: 1.25 },
    { category: 'Systems', name: 'Air/Raft', tons: null, costMCr: 0.25 },
    { category: 'Systems', name: 'Docking Space (50 tons)', tons: 55, costMCr: 13.75 },
    { category: 'Systems', name: 'Modular Cutter', tons: null, costMCr: 10.287 },
    { category: 'Systems', name: 'Docking Space (50 tons)', tons: 55, costMCr: 13.75 },
    { category: 'Systems', name: 'Modular Cutter', tons: null, costMCr: 10.287 },
    { category: 'Systems', name: 'Repair Drones', tons: 8, costMCr: 1.6 },
    { category: 'Systems', name: 'ATV x2 (on cutters)', tons: null, costMCr: 0.31 },
    { category: 'Software', name: 'Auto-Repair/2', tons: null, costMCr: 10 },
    { category: 'Software', name: 'Evade/1', tons: null, costMCr: 1 },
    { category: 'Software', name: 'Fire Control/1', tons: null, costMCr: 2 },
    { category: 'Software', name: 'Jump Control/3', tons: null, costMCr: 0.3 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x25', tons: 100, costMCr: 12.5 },
    { category: 'Common Areas', name: 'Common Areas', tons: 44, costMCr: 4.4 },
    { category: 'Cargo', name: 'Cargo', tons: 72, costMCr: null },
  ],

  softwareIds: [
    'auto_repair_2',
    'evade_1',
    'fire_control_1',
    'jump_control_3',
    'library',
    'manoeuvre_0',
    'intellect_0',
  ],

  design: {
    name: 'Mercenary Cruiser',
    designation: 'Type C',
    techLevel: 12,
    tonnage: 800,
    hullConfiguration: 'standard', // Sphere configuration (not in standard hull types)
    armorMaterial: 'crystaliron',
    armorProtection: 4,
    manoeuvreRating: 3,
    jumpRating: 3,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 50,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_20',
    computerBis: false, // Uses /fib variant (not standard /bis)
    sensorSuiteId: 'military',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'triple_turret', weapons: [] },
      { mountType: 'triple_turret', weapons: [] },
      { mountType: 'triple_turret', weapons: [] },
      { mountType: 'triple_turret', weapons: [] },
      { mountType: 'triple_turret', weapons: [] },
      { mountType: 'triple_turret', weapons: [] },
      { mountType: 'triple_turret', weapons: [] },
      { mountType: 'triple_turret', weapons: [] },
    ],
    equipment: [
      { equipmentId: 'docking_space', tons: 5, quantity: 1 },   // Air/Raft
      { equipmentId: 'docking_space', tons: 55, quantity: 1 },  // Modular Cutter 1
      { equipmentId: 'docking_space', tons: 55, quantity: 1 },  // Modular Cutter 2
      { equipmentId: 'repair_drones', tons: 8, quantity: 1 },
    ],
    standardStaterooms: 25,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 44,
    cargoTons: 72,
    notes: 'Sphere hull configuration. Computer/20fib variant. 8 empty triple turrets fitted as standard (weapons not included). Carries a combat platoon. Two modular cutters with ATVs for planetary deployment.',
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
  YACHT,
  CLOSE_ESCORT_GAZELLE,
  LABORATORY_SHIP,
  PATROL_CORVETTE,
  SUBSIDISED_MERCHANT,
  SURVEY_SCOUT_DONOSEV,
  SUBSIDISED_LINER,
  MERCENARY_CRUISER,
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
