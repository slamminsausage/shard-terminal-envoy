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

import type { NormalizedPreMadeShip, PreMadeShip, PreMadeShipDesign, ShipDesign } from './types';


const normalizeShipDesign = (design: PreMadeShipDesign): ShipDesign => ({
  specialisedHull: 'none',
  hullOptions: [],
  barbettes: [],
  bays: [],
  pointDefence: [],
  screens: [],
  ...design,
});

const normalizePreMadeShip = (ship: PreMadeShip): NormalizedPreMadeShip => ({
  ...ship,
  design: normalizeShipDesign(ship.design),
});

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
//  LIGHT FIGHTER (10 tons)
// ═══════════════════════════════════════════════════════════════════════

export const LIGHT_FIGHTER: PreMadeShip = {
  id: 'light_fighter',
  name: 'Light Fighter',
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 10,
  description:
    'Consisting of little more than a power plant and pulse laser with a pilot strapped to the top, the light fighter is a small, fast and highly manoeuvrable craft designed to make high-speed runs on enemy ships and destroy other small craft. Designed to adhere to a strict budget, the Light Fighter allows even the poorest worlds a chance at self-defence.',

  hullPoints: 4,
  purchaseCostMCr: 9.09,
  maintenanceCostCrPerMonth: 758,

  crew: ['Pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 2 },
    { system: 'Manoeuvre Drive', power: 6 },
    { system: 'Sensors', power: 2 },
    { system: 'Weapons', power: 3 },
  ],

  components: [
    { category: 'Hull', name: '10 tons, Streamlined', tons: null, costMCr: 0.6 },
    { category: 'Armour', name: 'Crystaliron, Armour: 2', tons: 0.25, costMCr: 0.06 },
    { category: 'M-Drive', name: 'Thrust 6', tons: 0.6, costMCr: 1.2 },
    { category: 'Power Plant', name: 'Fusion, Power 15', tons: 1, costMCr: 1 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Cockpit', tons: 1.5, costMCr: 0.01 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Military Grade', tons: 2, costMCr: 4.1 },
    { category: 'Weapons', name: 'Fixed Mount (pulse laser)', tons: null, costMCr: 1.1 },
    { category: 'Software', name: 'Fire Control/1', tons: null, costMCr: 2 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Cargo', name: 'Cargo', tons: 3.65, costMCr: null },
  ],

  softwareIds: ['fire_control_1', 'library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Light Fighter',
    techLevel: 12,
    tonnage: 10,
    hullConfiguration: 'streamlined',
    armorMaterial: 'crystaliron',
    armorProtection: 2,
    manoeuvreRating: 6,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 1,
    additionalFuelWeeks: 0,
    useCockpit: true,
    cockpitType: 'cockpit',
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'military',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'fixed_mount', weapons: ['pulse_laser'], isFirmpoint: true },
    ],
    equipment: [],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 3.65,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  GIG (20 tons)
// ═══════════════════════════════════════════════════════════════════════

export const GIG: PreMadeShip = {
  id: 'gig',
  name: 'Gig',
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 20,
  description:
    'This Tech Level 12 Gig is an often encountered institution at starports throughout the Imperium. Technically a vessel of the Imperial Navy, it is crewed by local starport personnel and used to perform orbital inspections and other light duties.',

  hullPoints: 8,
  purchaseCostMCr: 7.272,
  maintenanceCostCrPerMonth: 606,

  crew: ['Pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 4 },
    { system: 'Manoeuvre Drive', power: 14 },
    { system: 'Turret', power: 1 },
  ],

  components: [
    { category: 'Hull', name: '20 tons, Streamlined', tons: null, costMCr: 1.2 },
    { category: 'M-Drive', name: 'Thrust 7', tons: 1.4, costMCr: 2.8 },
    { category: 'Power Plant', name: 'Fusion, Power 30', tons: 2, costMCr: 2 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 3, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Basic', tons: null, costMCr: null },
    { category: 'Weapons', name: 'Single Turret, Empty', tons: 1, costMCr: 0.2 },
    { category: 'Systems', name: 'Cabin Space x2', tons: 3, costMCr: 0.15 },
    { category: 'Systems', name: 'Fuel Scoops', tons: null, costMCr: null },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Cargo', name: 'Cargo', tons: 8.6, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Gig',
    techLevel: 12,
    tonnage: 20,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 7,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 2,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'basic',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'single_turret', weapons: [], isFirmpoint: true },
    ],
    equipment: [
      { equipmentId: 'cabin_space', tons: 3, quantity: 2 },
    ],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 8.6,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  LAUNCH (20 tons)
// ═══════════════════════════════════════════════════════════════════════

export const LAUNCH: PreMadeShip = {
  id: 'launch',
  name: 'Launch',
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 20,
  description:
    'Also called a life boat, due to one of its expected roles, this craft uses a 20-ton hull and can easily be flown by a single skilled individual. A launch can be configured to engage in a wide variety of roles but ambitious schemes will find themselves limited by the small hull and weak power plant. However, for the price, the launch provides a means to very cheap space travel.',

  hullPoints: 8,
  purchaseCostMCr: 2.367,
  maintenanceCostCrPerMonth: 197,

  crew: ['Pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 4 },
    { system: 'Manoeuvre Drive', power: 2 },
  ],

  components: [
    { category: 'Hull', name: '20 tons, Streamlined', tons: null, costMCr: 1.2 },
    { category: 'M-Drive', name: 'Thrust 1', tons: 0.2, costMCr: 0.4 },
    { category: 'Power Plant', name: 'Fusion (TL8), Power 10', tons: 1, costMCr: 0.5 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 3, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Basic', tons: null, costMCr: null },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Cargo', name: 'Cargo', tons: 14.8, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Launch',
    techLevel: 12,
    tonnage: 20,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 1,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl8',
    powerPlantTons: 1,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'basic',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 14.8,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SHIP'S BOAT (30 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SHIPS_BOAT: PreMadeShip = {
  id: 'ships_boat',
  name: "Ship's Boat",
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 30,
  description:
    "The ship's boat is both fast and versatile, making it a popular choice for auxiliary craft. While most commonly seen hauling small cargo and passenger loads between ships and worlds, in smaller militaries the ship's boat is also used as a boarding craft by marine assault teams.",

  hullPoints: 12,
  purchaseCostMCr: 7.092,
  maintenanceCostCrPerMonth: 591,

  crew: ['Pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 6 },
    { system: 'Manoeuvre Drive', power: 15 },
  ],

  components: [
    { category: 'Hull', name: '30 tons, Streamlined', tons: null, costMCr: 1.8 },
    { category: 'M-Drive', name: 'Thrust 5', tons: 1.5, costMCr: 3 },
    { category: 'Power Plant', name: 'Fusion, Power 30', tons: 2, costMCr: 2 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 3, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Basic', tons: null, costMCr: null },
    { category: 'Weapons', name: 'Fixed Mount', tons: null, costMCr: 0.1 },
    { category: 'Systems', name: 'Cabin Space x6', tons: 9, costMCr: 0.45 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Cargo', name: 'Cargo', tons: 13.5, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: "Ship's Boat",
    techLevel: 12,
    tonnage: 30,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 5,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 2,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'basic',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'fixed_mount', weapons: [], isFirmpoint: true },
    ],
    equipment: [
      { equipmentId: 'cabin_space', tons: 9, quantity: 6 },
    ],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 13.5,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SLOW BOAT (30 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SLOW_BOAT: PreMadeShip = {
  id: 'slow_boat',
  name: 'Slow Boat',
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 30,
  description:
    "The slow boat appears either as an early design of the ship's boat, before power cells and manoeuvre drives become more efficient, or as an intentional throttling back of the ship's boat performance. Either way, the slow boat is comparable to the ship's boat but it trades speed for increased cargo space.",

  hullPoints: 12,
  purchaseCostMCr: 4.842,
  maintenanceCostCrPerMonth: 404,

  crew: ['Pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 6 },
    { system: 'Manoeuvre Drive', power: 9 },
  ],

  components: [
    { category: 'Hull', name: '30 tons, Streamlined', tons: null, costMCr: 1.8 },
    { category: 'M-Drive', name: 'Thrust 3', tons: 0.9, costMCr: 1.8 },
    { category: 'Power Plant', name: 'Fusion, Power 15', tons: 1, costMCr: 1 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 3, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Basic', tons: null, costMCr: null },
    { category: 'Weapons', name: 'Fixed Mount', tons: null, costMCr: 0.1 },
    { category: 'Systems', name: 'Cabin Space x2', tons: 3, costMCr: 0.15 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Cargo', name: 'Cargo', tons: 21.1, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Slow Boat',
    techLevel: 12,
    tonnage: 30,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 3,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 1,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'basic',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'fixed_mount', weapons: [], isFirmpoint: true },
    ],
    equipment: [
      { equipmentId: 'cabin_space', tons: 3, quantity: 2 },
    ],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 21.1,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  PINNACE (40 tons)
// ═══════════════════════════════════════════════════════════════════════

export const PINNACE: PreMadeShip = {
  id: 'pinnace',
  name: 'Pinnace',
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 40,
  description:
    'The pinnace is a popular choice as an auxiliary vessel for adventuring or exploratory ships, as it has the speed, range and cargo capacity to support extended missions. It combines a generous cargo hold with a speed that leaves most star ships trailing far behind and can be configured for light combat operations with the addition of weaponry to its fixed mount.',

  hullPoints: 16,
  purchaseCostMCr: 8.712,
  maintenanceCostCrPerMonth: 726,

  crew: ['Pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 8 },
    { system: 'Manoeuvre Drive', power: 20 },
  ],

  components: [
    { category: 'Hull', name: '40 tons, Streamlined', tons: null, costMCr: 2.4 },
    { category: 'M-Drive', name: 'Thrust 5', tons: 2, costMCr: 4 },
    { category: 'Power Plant', name: 'Fusion, Power 30', tons: 2, costMCr: 2 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 3, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Basic', tons: null, costMCr: null },
    { category: 'Weapons', name: 'Fixed Mount', tons: null, costMCr: 0.1 },
    { category: 'Systems', name: 'Cabin Space x6', tons: 9, costMCr: 0.45 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Cargo', name: 'Cargo', tons: 23, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Pinnace',
    techLevel: 12,
    tonnage: 40,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 5,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 2,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'basic',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'fixed_mount', weapons: [], isFirmpoint: true },
    ],
    equipment: [
      { equipmentId: 'cabin_space', tons: 9, quantity: 6 },
    ],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 23,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SLOW PINNACE (40 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SLOW_PINNACE: PreMadeShip = {
  id: 'slow_pinnace',
  name: 'Slow Pinnace',
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 40,
  description:
    'Like the slow boat, the slow pinnace trades speed and raw performance for increased cargo space, although this craft is based on the traditional pinnace. As a larger hull, it provides even more cargo carrying capacity than a slow boat and many are customised to become troop or vehicle transports, or to serve as fuel skimmers for larger ships.',

  hullPoints: 16,
  purchaseCostMCr: 5.787,
  maintenanceCostCrPerMonth: 482,

  crew: ['Pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 8 },
    { system: 'Manoeuvre Drive', power: 12 },
  ],

  components: [
    { category: 'Hull', name: '40 tons, Streamlined', tons: null, costMCr: 2.4 },
    { category: 'M-Drive', name: 'Thrust 3', tons: 1.2, costMCr: 2.4 },
    { category: 'Power Plant', name: 'Fusion (TL8), Power 20', tons: 2, costMCr: 1 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 3, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Basic', tons: null, costMCr: null },
    { category: 'Weapons', name: 'Fixed Mount', tons: null, costMCr: 0.1 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Cargo', name: 'Cargo', tons: 32.8, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Slow Pinnace',
    techLevel: 12,
    tonnage: 40,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 3,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl8',
    powerPlantTons: 2,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'basic',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'fixed_mount', weapons: [], isFirmpoint: true },
    ],
    equipment: [],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 32.8,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  MODULAR CUTTER (50 tons)
// ═══════════════════════════════════════════════════════════════════════

export const MODULAR_CUTTER: PreMadeShip = {
  id: 'modular_cutter',
  name: 'Modular Cutter',
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 50,
  description:
    'The modular cutter is notable for having 30 tons dedicated to a detachable module; this allows the cutter to quickly and efficiently change roles during a voyage without needing extensive refits at a starport. While there are a great many customised modules available for the cutter, the three most common and routinely available are: ATV module (MCr1.8), Fuel module (MCr1), and Open module (MCr2).',

  hullPoints: 20,
  purchaseCostMCr: 10.107,
  maintenanceCostCrPerMonth: 842,

  crew: ['Pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 10 },
    { system: 'Manoeuvre Drive', power: 20 },
  ],

  components: [
    { category: 'Hull', name: '50 tons, Streamlined', tons: null, costMCr: 3 },
    { category: 'M-Drive', name: 'Thrust 4', tons: 2, costMCr: 4 },
    { category: 'Power Plant', name: 'Fusion (TL8), Power 30', tons: 3, costMCr: 1.5 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 3, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Basic', tons: null, costMCr: null },
    { category: 'Weapons', name: 'Fixed Mount', tons: null, costMCr: 0.1 },
    { category: 'Systems', name: 'Modular Hull', tons: 30, costMCr: 1.8 },
    { category: 'Systems', name: 'Cabin Space x4', tons: 6, costMCr: 0.3 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Cargo', name: 'Cargo', tons: 3, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Modular Cutter',
    techLevel: 12,
    tonnage: 50,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 4,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl8',
    powerPlantTons: 3,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'basic',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'fixed_mount', weapons: [], isFirmpoint: true },
    ],
    equipment: [
      { equipmentId: 'modular_hull', tons: 30, quantity: 1 },
      { equipmentId: 'cabin_space', tons: 6, quantity: 4 },
    ],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 3,
    notes: 'Module not included. Available modules: ATV (MCr1.8), Fuel (MCr1), Open (MCr2).',
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  SHUTTLE (95 tons)
// ═══════════════════════════════════════════════════════════════════════

export const SHUTTLE: PreMadeShip = {
  id: 'shuttle',
  name: 'Shuttle',
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 95,
  description:
    'One of the most common small craft seen in space, the shuttle is present throughout the galaxy and becomes a standard vessel for orbital operations as soon as a civilisation makes its first firm steps into space. It is designed to carry passengers and cargo from orbit to surface and back again, as well as act as an interplanetary transport.',

  hullPoints: 38,
  purchaseCostMCr: 15.147,
  maintenanceCostCrPerMonth: 1262,

  crew: ['Pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 19 },
    { system: 'Manoeuvre Drive', power: 29 },
  ],

  components: [
    { category: 'Hull', name: '95 tons, Streamlined', tons: null, costMCr: 5.7 },
    { category: 'M-Drive', name: 'Thrust 3', tons: 2.85, costMCr: 5.7 },
    { category: 'Power Plant', name: 'Fusion, Power 60', tons: 4, costMCr: 4 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 6, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Basic', tons: null, costMCr: null },
    { category: 'Weapons', name: 'Fixed Mount', tons: null, costMCr: 0.1 },
    { category: 'Systems', name: 'Cabin Space x8', tons: 12, costMCr: 0.6 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Cargo', name: 'Cargo', tons: 67.15, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Shuttle',
    techLevel: 12,
    tonnage: 95,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 3,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 4,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'basic',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'fixed_mount', weapons: [], isFirmpoint: true },
    ],
    equipment: [
      { equipmentId: 'cabin_space', tons: 12, quantity: 8 },
    ],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 0,
    cargoTons: 67.15,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  PASSENGER SHUTTLE (95 tons)
// ═══════════════════════════════════════════════════════════════════════

export const PASSENGER_SHUTTLE: PreMadeShip = {
  id: 'passenger_shuttle',
  name: 'Passenger Shuttle',
  designation: undefined,
  category: 'small_craft',
  tl: 12,
  tonnage: 95,
  description:
    'Intended for routine passenger transport this shuttle fills the need at a reasonable price point. Capable of carrying up to 240 passengers. The shuttle has a small cargo bay, passenger area and crew section separated by internal bulkheads. Normally only the passenger area is accessible to non-crew and operations are sufficiently routine that no stewards are carried.',

  hullPoints: 38,
  purchaseCostMCr: 9.927,
  maintenanceCostCrPerMonth: 827,

  crew: ['Pilot', 'Co-pilot'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 19 },
    { system: 'Manoeuvre Drive', power: 10 },
    { system: 'Sensors', power: 1 },
  ],

  components: [
    { category: 'Hull', name: '95 tons, Streamlined', tons: null, costMCr: 5.7 },
    { category: 'M-Drive', name: 'Thrust 1', tons: 0.95, costMCr: 1.9 },
    { category: 'Power Plant', name: 'Fusion (TL8), Power 30', tons: 3, costMCr: 1.5 },
    { category: 'Fuel Tanks', name: '4 weeks operation', tons: 1, costMCr: null },
    { category: 'Bridge', name: 'Bridge', tons: 6, costMCr: 0.5 },
    { category: 'Computer', name: 'Computer/5', tons: null, costMCr: 0.03 },
    { category: 'Sensors', name: 'Basic', tons: null, costMCr: null },
    { category: 'Systems', name: 'Acceleration Bench x60 (240 passengers)', tons: 60, costMCr: 0.6 },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre', tons: null, costMCr: null },
    { category: 'Software', name: 'Intellect', tons: null, costMCr: null },
    { category: 'Common Areas', name: 'Common Areas', tons: 8, costMCr: 0.8 },
    { category: 'Cargo', name: 'Cargo', tons: 16.05, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'intellect_0'],

  design: {
    name: 'Passenger Shuttle',
    techLevel: 12,
    tonnage: 95,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 1,
    jumpRating: 0,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl8',
    powerPlantTons: 3,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: false,
    sensorSuiteId: 'basic',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [
      { equipmentId: 'acceleration_bench', tons: 60, quantity: 60 },
    ],
    standardStaterooms: 0,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 8,
    cargoTons: 16.05,
    notes: '60 acceleration benches seat up to 240 passengers (4 per bench). No stewards carried.',
  },
};


// ═══════════════════════════════════════════════════════════════════════
//  SHIPS OF THE REACH (ADDITIONAL PRE-MADE SHIPS)
// ═══════════════════════════════════════════════════════════════════════

const SOTR_COMMON_SOFTWARE = ['library', 'manoeuvre_0'];

export const FAST_TRADER_A3: PreMadeShip = {
  id: 'fast_trader_a3', source: 'ships_of_the_reach', name: 'Fast Trader', designation: 'Type A3', category: 'trader', tl: 12, tonnage: 200,
  description: 'A stripped-down Type-A variant that trades cargo volume for better speed and agility, popular in dangerous trade lanes and among pirates.',
  hullPoints: 80, purchaseCostMCr: 76.5, maintenanceCostCrPerMonth: 6375,
  crew: ['Pilot', 'Astrogator', 'Engineer', 'Medic', 'Steward'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 40 }, { system: 'Manoeuvre Drive', power: 80 }, { system: 'Jump Drive', power: 40 }, { system: 'Sensors', power: 1 }],
  components: [{ category: 'Hull', name: '200 tons, Streamlined', tons: null, costMCr: 12 }, { category: 'M-Drive', name: 'Thrust 4', tons: 8, costMCr: 16 }, { category: 'J-Drive', name: 'Jump-2', tons: 15, costMCr: 22.5 }, { category: 'Cargo', name: 'Cargo', tons: 36, costMCr: null }],
  softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_2'],
  design: { name: 'Fast Trader', designation: 'Type A3', techLevel: 12, tonnage: 200, hullConfiguration: 'streamlined', armorMaterial: 'crystaliron', armorProtection: 2, manoeuvreRating: 4, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 9, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_5', computerBis: true, sensorSuiteId: 'civilian', additionalSensorStations: 0, weapons: [], equipment: [{ equipmentId: 'fuel_processor', tons: 1, quantity: 1 }, { equipmentId: 'cargo_crane', tons: 3, quantity: 1 }], standardStaterooms: 10, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 20, commonAreaTons: 11, cargoTons: 36 },
};

export const STAR_RAY_INTERCEPTOR: PreMadeShip = { id: 'star_ray_interceptor', source: 'ships_of_the_reach', name: 'Star Ray-class Interceptor', category: 'military', tl: 12, tonnage: 200, description: 'A low-cost pirate interceptor from Theev with grappling gear and integral light fighter docking.', hullPoints: 80, purchaseCostMCr: 87.75, maintenanceCostCrPerMonth: 7312, crew: ['Pilot', 'Astrogator', 'Engineer', 'Gunners x2'], powerRequirements: [{ system: 'Basic Ship Systems', power: 40 }, { system: 'Manoeuvre Drive', power: 60 }, { system: 'Jump Drive', power: 20 }, { system: 'Sensors', power: 3 }], components: [{ category: 'Hull', name: '200 tons, Streamlined', tons: null, costMCr: 12 }, { category: 'Weapons', name: 'Double Turrets (beam lasers) x2', tons: 2, costMCr: 3 }, { category: 'Cargo', name: 'Cargo', tons: 44, costMCr: null }], softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_1'], design: { name: 'Star Ray-class Interceptor', techLevel: 12, tonnage: 200, hullConfiguration: 'streamlined', armorMaterial: 'crystaliron', armorProtection: 4, manoeuvreRating: 3, jumpRating: 1, isReactionDrive: false, powerPlantTier: 'fusion_tl15', powerPlantTons: 7, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_10', computerBis: false, sensorSuiteId: 'improved', additionalSensorStations: 0, weapons: [{ mountType: 'double_turret', weapons: ['beam_laser', 'beam_laser'] }, { mountType: 'double_turret', weapons: ['beam_laser', 'beam_laser'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 1, quantity: 1 }, { equipmentId: 'docking_space', tons: 11, quantity: 1 }], standardStaterooms: 8, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 6, commonAreaTons: 6, cargoTons: 44 } };

export const HERALD_FAST_MESSENGER: PreMadeShip = { id: 'herald_fast_messenger', source: 'ships_of_the_reach', name: 'Herald-class Fast Messenger', category: 'passenger', tl: 15, tonnage: 300, description: 'Elegant jump-4 courier for wealthy clients, emphasizing speed and comfort over combat power.', hullPoints: 120, purchaseCostMCr: 140.127, maintenanceCostCrPerMonth: 11677, crew: ['Pilot', 'Astrogator', 'Engineer', 'Steward'], powerRequirements: [{ system: 'Basic Ship Systems', power: 60 }, { system: 'Manoeuvre Drive', power: 120 }, { system: 'Jump Drive', power: 120 }, { system: 'Sensors', power: 1 }], components: [{ category: 'Hull', name: '300 tons, Streamlined', tons: null, costMCr: 18 }, { category: 'Cargo', name: 'Cargo', tons: 14.4, costMCr: null }], softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_4', 'evade_2', 'intellect_0'], design: { name: 'Herald-class Fast Messenger', techLevel: 15, tonnage: 300, hullConfiguration: 'streamlined', armorMaterial: 'bonded_superdense', armorProtection: 4, manoeuvreRating: 2, jumpRating: 4, isReactionDrive: false, powerPlantTier: 'fusion_tl15', powerPlantTons: 10, additionalFuelWeeks: 2, useCockpit: false, holographicControls: false, computerId: 'computer_15', computerBis: true, sensorSuiteId: 'civilian', additionalSensorStations: 0, weapons: [{ mountType: 'double_turret', weapons: ['missile_rack', 'sandcaster'] }], equipment: [{ equipmentId: 'docking_space', tons: 22, quantity: 1 }], standardStaterooms: 4, doubleOccupancyStaterooms: 0, highStaterooms: 2, luxuryStaterooms: 2, lowBerths: 0, commonAreaTons: 10, cargoTons: 14.4 } };

export const INDIGO_PIRATE_CARRIER: PreMadeShip = { id: 'indigo_pirate_carrier', source: 'ships_of_the_reach', name: 'Indigo-class Pirate Carrier', category: 'military', tl: 15, tonnage: 300, description: 'Tiny carrier used by raiders, fielding ten externally clamped light fighters.', hullPoints: 108, purchaseCostMCr: 184.96, maintenanceCostCrPerMonth: 15413, crew: ['Pilot', 'Astrogator', 'Engineer', 'Gunners x3'], powerRequirements: [{ system: 'Basic Ship Systems', power: 60 }, { system: 'Manoeuvre Drive', power: 80 }, { system: 'Jump Drive', power: 80 }, { system: 'Sensors', power: 2 }], components: [{ category: 'Hull', name: '300 tons, Dispersed', tons: null, costMCr: 7.5 }, { category: 'Cargo', name: 'Cargo', tons: 65, costMCr: null }], softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_2'], design: { name: 'Indigo-class Pirate Carrier', techLevel: 15, tonnage: 300, hullConfiguration: 'dispersed', armorProtection: 0, manoeuvreRating: 1, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 10, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_10', computerBis: false, sensorSuiteId: 'military', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'missile_rack'] }, { mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'missile_rack'] }, { mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'missile_rack'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 1, quantity: 1 }], standardStaterooms: 10, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 8, commonAreaTons: 24, cargoTons: 65 } };

export const BUCCANEER_BLOCKADE_RUNNER: PreMadeShip = { id: 'buccaneer_blockade_runner', source: 'ships_of_the_reach', name: 'Buccaneer-class Blockade Runner', category: 'military', tl: 15, tonnage: 400, description: 'Fast courier-smuggler with auxiliary high-burn thruster for short 6G breakout burns.', hullPoints: 160, purchaseCostMCr: 160.187, maintenanceCostCrPerMonth: 13348, crew: ['Pilot', 'Astrogator', 'Engineer x2', 'Gunners x4'], powerRequirements: [{ system: 'Basic Ship Systems', power: 80 }, { system: 'Manoeuvre Drive', power: 80 }, { system: 'Jump Drive', power: 80 }, { system: 'Sensors', power: 3 }], components: [{ category: 'Hull', name: '400 tons, Streamlined', tons: null, costMCr: 24 }, { category: 'Cargo', name: 'Cargo', tons: 62, costMCr: null }], softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_2'], design: { name: 'Buccaneer-class Blockade Runner', techLevel: 15, tonnage: 400, hullConfiguration: 'streamlined', armorMaterial: 'bonded_superdense', armorProtection: 5, manoeuvreRating: 3, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl15', powerPlantTons: 15, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_5', computerBis: true, sensorSuiteId: 'improved', additionalSensorStations: 0, weapons: [{ mountType: 'double_turret', weapons: ['pulse_laser', 'pulse_laser'] }, { mountType: 'double_turret', weapons: ['pulse_laser', 'pulse_laser'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 5, quantity: 1 }, { equipmentId: 'docking_space', tons: 22, quantity: 1 }], standardStaterooms: 8, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 17, cargoTons: 62 } };

export const FIERY_GUNSHIP: PreMadeShip = { id: 'fiery_gunship', source: 'ships_of_the_reach', name: 'Fiery-class Gunship', category: 'military', tl: 12, tonnage: 400, description: 'Assault gunship built to close, batter, and board hostile vessels.', hullPoints: 160, purchaseCostMCr: 208.65, maintenanceCostCrPerMonth: 17387, crew: ['Captain', 'Pilot', 'Astrogator', 'Engineer x2', 'Gunners x4', 'Marines x30'], powerRequirements: [{ system: 'Basic Ship Systems', power: 80 }, { system: 'Manoeuvre Drive', power: 240 }, { system: 'Jump Drive', power: 80 }, { system: 'Sensors', power: 3 }], components: [{ category: 'Hull', name: '400 tons, Streamlined', tons: null, costMCr: 24 }, { category: 'Weapons', name: 'Small Fusion Gun Bay', tons: 50, costMCr: 8 }, { category: 'Cargo', name: 'Cargo', tons: 6, costMCr: null }], softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_2', 'evade_2', 'fire_control_3'], design: { name: 'Fiery-class Gunship', techLevel: 12, tonnage: 400, hullConfiguration: 'streamlined', armorMaterial: 'crystaliron', armorProtection: 6, manoeuvreRating: 6, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 35, additionalFuelWeeks: 0, useCockpit: false, holographicControls: true, computerId: 'computer_20', computerBis: true, sensorSuiteId: 'military', additionalSensorStations: 0, weapons: [{ mountType: 'double_turret', weapons: ['beam_laser', 'beam_laser'] }, { mountType: 'triple_turret', weapons: ['sandcaster', 'sandcaster', 'beam_laser'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 2, quantity: 1 }, { equipmentId: 'armoury', tons: 6, quantity: 1 }], standardStaterooms: 9, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 3, cargoTons: 6 } };

export const GHOST_OF_THE_REACH: PreMadeShip = { id: 'ghost_of_the_reach', source: 'ships_of_the_reach', name: 'The Ghost of the Reach', category: 'exploration', tl: 15, tonnage: 400, description: 'Zhodani heavy scout with stealth hull treatment and advanced electronic warfare suite.', hullPoints: 160, purchaseCostMCr: 625.142, maintenanceCostCrPerMonth: 52095, crew: ['Captain', 'Pilot', 'Astrogator', 'Sensor Operator', 'Medic', 'Engineers x2', 'Gunners x4', 'Marines x6'], powerRequirements: [{ system: 'Basic Ship Systems', power: 80 }, { system: 'Manoeuvre Drive', power: 120 }, { system: 'Jump Drive', power: 120 }, { system: 'Sensors', power: 5 }], components: [{ category: 'Hull', name: '400 tons, Streamlined + Superior Stealth', tons: null, costMCr: 424 }, { category: 'Cargo', name: 'Cargo', tons: 36.8, costMCr: null }], softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_3', 'evade_2', 'fire_control_3'], design: { name: 'The Ghost of the Reach', techLevel: 15, tonnage: 400, hullConfiguration: 'streamlined', armorMaterial: 'bonded_superdense', armorProtection: 6, manoeuvreRating: 3, jumpRating: 3, isReactionDrive: false, powerPlantTier: 'fusion_tl15', powerPlantTons: 18, additionalFuelWeeks: 0, useCockpit: false, holographicControls: true, computerId: 'computer_15', computerBis: true, sensorSuiteId: 'advanced', additionalSensorStations: 1, weapons: [{ mountType: 'double_turret', weapons: ['beam_laser', 'beam_laser'] }, { mountType: 'double_turret', weapons: ['beam_laser', 'beam_laser'] }, { mountType: 'double_turret', weapons: ['beam_laser', 'beam_laser'] }, { mountType: 'double_turret', weapons: ['beam_laser', 'beam_laser'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 6, quantity: 1 }, { equipmentId: 'armoury', tons: 2, quantity: 1 }, { equipmentId: 'docking_space', tons: 33, quantity: 1 }], standardStaterooms: 10, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 22, cargoTons: 36.8 } };

export const SUBSIDISED_MERCHANT_RQ: PreMadeShip = { id: 'subsidised_merchant_rq', source: 'ships_of_the_reach', name: 'Subsidised Merchant (Type RQ)', category: 'trader', tl: 12, tonnage: 400, description: 'Q-ship variant of the subsidised merchant, concealing heavy defenses and carried fighters.', hullPoints: 160, purchaseCostMCr: 227.65, maintenanceCostCrPerMonth: 18970, crew: ['Captain', 'Pilots x5', 'Astrogator', 'Engineer', 'Medic', 'Gunners x4', 'Marines x16'], powerRequirements: [{ system: 'Basic Ship Systems', power: 80 }, { system: 'Manoeuvre Drive', power: 160 }, { system: 'Jump Drive', power: 40 }, { system: 'Sensors', power: 4 }], components: [{ category: 'Hull', name: '400 tons, Streamlined', tons: null, costMCr: 24 }, { category: 'Weapons', name: 'Pop-up Triple Turrets x4', tons: 8, costMCr: 20 }, { category: 'Cargo', name: 'Cargo', tons: 76, costMCr: null }], softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_1', 'evade_2', 'fire_control_4'], design: { name: 'Subsidised Merchant (Type RQ)', techLevel: 12, tonnage: 400, hullConfiguration: 'streamlined', armorMaterial: 'crystaliron', armorProtection: 8, manoeuvreRating: 4, jumpRating: 1, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 21, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_20', computerBis: false, sensorSuiteId: 'improved', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['pulse_laser', 'pulse_laser', 'pulse_laser'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 1, quantity: 1 }, { equipmentId: 'docking_space', tons: 44, quantity: 1 }], standardStaterooms: 14, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 10, commonAreaTons: 10, cargoTons: 76 } };

export const VULTURE_SALVAGE_HAULER: PreMadeShip = { id: 'vulture_salvage_hauler', source: 'ships_of_the_reach', name: 'Vulture-class Salvage Hauler', category: 'mining', tl: 15, tonnage: 400, description: 'Salvage specialist with prow grappling arms and a cargo bay optimized for tearing down derelicts.', hullPoints: 160, purchaseCostMCr: 98.822, maintenanceCostCrPerMonth: 8235, crew: ['Captain', 'Pilot', 'Astrogator', 'Engineer', 'Gunner'], powerRequirements: [{ system: 'Basic Ship Systems', power: 80 }, { system: 'Manoeuvre Drive', power: 80 }, { system: 'Jump Drive', power: 80 }, { system: 'Sensors', power: 1 }], components: [{ category: 'Hull', name: '400 tons, Standard', tons: null, costMCr: 20 }, { category: 'Cargo', name: 'Cargo', tons: 199, costMCr: null }], softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_2'], design: { name: 'Vulture-class Salvage Hauler', techLevel: 15, tonnage: 400, hullConfiguration: 'standard', armorProtection: 0, manoeuvreRating: 1, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 9, additionalFuelWeeks: 4, useCockpit: false, holographicControls: false, computerId: 'computer_5', computerBis: true, sensorSuiteId: 'civilian', additionalSensorStations: 0, weapons: [{ mountType: 'double_turret', weapons: ['pulse_laser', 'pulse_laser'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 2, quantity: 1 }, { equipmentId: 'probe_drones', tons: 1, quantity: 1 }, { equipmentId: 'docking_space', tons: 22, quantity: 1 }], standardStaterooms: 4, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 5, cargoTons: 199 } };

export const WATCHDOG_FLEET_PICKET: PreMadeShip = { id: 'watchdog_fleet_picket', source: 'ships_of_the_reach', name: 'Watchdog-class Fleet Picket', category: 'military', tl: 13, tonnage: 500, description: 'Long-endurance fleet sensor picket with powerful jump capability and EW support systems.', hullPoints: 200, purchaseCostMCr: 245.837, maintenanceCostCrPerMonth: 20486, crew: ['Captain', 'Pilot', 'Astrogator', 'Sensor Operator', 'Engineers x3', 'Gunners x5'], powerRequirements: [{ system: 'Basic Ship Systems', power: 100 }, { system: 'Manoeuvre Drive', power: 150 }, { system: 'Jump Drive', power: 200 }, { system: 'Sensors', power: 10 }], components: [{ category: 'Hull', name: '500 tons, Standard', tons: null, costMCr: 25 }, { category: 'Cargo', name: 'Cargo', tons: 16.8, costMCr: null }], softwareIds: [...SOTR_COMMON_SOFTWARE, 'jump_control_4'], design: { name: 'Watchdog-class Fleet Picket', techLevel: 13, tonnage: 500, hullConfiguration: 'standard', armorMaterial: 'crystaliron', armorProtection: 8, manoeuvreRating: 3, jumpRating: 4, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 22, additionalFuelWeeks: 8, useCockpit: false, holographicControls: false, computerId: 'computer_20', computerBis: true, sensorSuiteId: 'improved', additionalSensorStations: 1, weapons: [{ mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'beam_laser'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 3, quantity: 1 }, { equipmentId: 'docking_space', tons: 22, quantity: 1 }], standardStaterooms: 8, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 8, commonAreaTons: 30, cargoTons: 16.8 } };

export const CORSAIR_REACH: PreMadeShip = { id: 'corsair_reach', source: 'ships_of_the_reach', name: 'Corsair', category: 'military', tl: 15, tonnage: 600, description: 'Large pirate corsair with configurable profile and substantial cargo handling for raiding operations.', hullPoints: 240, purchaseCostMCr: 228.51, maintenanceCostCrPerMonth: 19042, crew: ['Captain', 'Pilot', 'Astrogator', 'Engineer x4', 'Medic', 'Gunners x3', 'Boarding Party x5'], powerRequirements: [{ system: 'Basic Ship Systems', power: 120 }, { system: 'Manoeuvre Drive', power: 180 }, { system: 'Jump Drive', power: 120 }, { system: 'Sensors', power: 2 }], components: [{ category: 'Hull', name: '600 tons, Streamlined', tons: null, costMCr: 36 }, { category: 'Cargo', name: 'Cargo', tons: 279, costMCr: null }], softwareIds: ['library', 'manoeuvre_0', 'jump_control_2', 'evade_1', 'fire_control_2', 'auto_repair_1'], design: { name: 'Corsair', techLevel: 15, tonnage: 600, hullConfiguration: 'streamlined', armorProtection: 0, manoeuvreRating: 3, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl15', powerPlantTons: 33, additionalFuelWeeks: 4, useCockpit: false, holographicControls: false, computerId: 'computer_10', computerBis: false, sensorSuiteId: 'military', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'beam_laser'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 7, quantity: 1 }, { equipmentId: 'armoury', tons: 2, quantity: 1 }], standardStaterooms: 10, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 20, commonAreaTons: 10, cargoTons: 279 } };


export const MAGENTA_REPAIR_SHIP: PreMadeShip = {
  id: 'magenta_repair_ship',
  source: 'ships_of_the_reach',
  name: 'Magenta-class Repair Ship',
  category: 'exploration',
  tl: 12,
  tonnage: 700,
  description:
    'A heavy-duty repair and recovery vessel built to stabilize crippled ships, tow them to port, or perform major engineering work in its large internal hangar.',
  hullPoints: 280,
  purchaseCostMCr: 258.992,
  maintenanceCostCrPerMonth: 21582,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Engineers x6', 'Maintenance x2', 'Medic', 'Gunner'],
  powerRequirements: [
    { system: 'Basic Ship Systems', power: 140 },
    { system: 'Manoeuvre Drive', power: 210 },
    { system: 'Jump Drive', power: 70 },
    { system: 'Sensors', power: 1 },
  ],
  components: [
    { category: 'Hull', name: '700 tons, Streamlined, Radiation Shielding', tons: null, costMCr: 59.5 },
    { category: 'M-Drive', name: 'Thrust 1', tons: 7, costMCr: 14 },
    { category: 'J-Drive', name: 'Jump-3', tons: 57.5, costMCr: 86.25 },
    { category: 'Systems', name: 'Full Hangar (100 tons)', tons: 200, costMCr: 40 },
    { category: 'Cargo', name: 'Cargo', tons: 19.75, costMCr: null },
  ],
  softwareIds: ['library', 'manoeuvre_0', 'jump_control_3', 'auto_repair_1'],
  design: {
    name: 'Magenta-class Repair Ship',
    techLevel: 12,
    tonnage: 700,
    hullConfiguration: 'streamlined',
    armorMaterial: 'crystaliron',
    armorProtection: 1,
    manoeuvreRating: 1,
    jumpRating: 3,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 16,
    additionalFuelWeeks: 8,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_10',
    computerBis: true,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [{ mountType: 'double_turret', weapons: ['pulse_laser', 'pulse_laser'] }],
    equipment: [
      { equipmentId: 'fuel_processor', tons: 4, quantity: 1 },
      { equipmentId: 'repair_drones', tons: 7, quantity: 1 },
      { equipmentId: 'workshop', tons: 12, quantity: 1 },
      { equipmentId: 'docking_space', tons: 22, quantity: 1 },
    ],
    standardStaterooms: 16,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 10,
    commonAreaTons: 4,
    cargoTons: 19.75,
  },
};

export const PATROL_TENDER: PreMadeShip = {
  id: 'patrol_tender',
  source: 'ships_of_the_reach',
  name: 'Patrol Tender',
  category: 'military',
  tl: 15,
  tonnage: 1000,
  description:
    'Imperial Navy logistics ship for front-line patrol support, carrying cargo, spare parts, and a slow pinnace for container transfer work.',
  hullPoints: 400,
  purchaseCostMCr: 377.297,
  maintenanceCostCrPerMonth: 31441,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Engineers x5', 'Gunners x6', 'Pinnace Pilot'],
  powerRequirements: [
    { system: 'Basic Ship Systems', power: 200 },
    { system: 'Manoeuvre Drive', power: 400 },
    { system: 'Jump Drive', power: 200 },
    { system: 'Sensors', power: 2 },
  ],
  components: [
    { category: 'Hull', name: '1,000 tons, Standard', tons: null, costMCr: 50 },
    { category: 'Weapons', name: 'Triple Turret (beam lasers) x3', tons: 3, costMCr: 7.5 },
    { category: 'Weapons', name: 'Triple Turret (sandcasters) x3', tons: 3, costMCr: 5.25 },
    { category: 'Cargo', name: 'Cargo', tons: 238.5, costMCr: null },
  ],
  softwareIds: ['library', 'manoeuvre_0', 'jump_control_4'],
  design: {
    name: 'Patrol Tender',
    techLevel: 15,
    tonnage: 1000,
    hullConfiguration: 'standard',
    armorMaterial: 'crystaliron',
    armorProtection: 4,
    manoeuvreRating: 2,
    jumpRating: 4,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl15',
    powerPlantTons: 30,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_15',
    computerBis: true,
    sensorSuiteId: 'military',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'beam_laser'] },
      { mountType: 'triple_turret', weapons: ['sandcaster', 'sandcaster', 'sandcaster'] },
    ],
    equipment: [{ equipmentId: 'fuel_processor', tons: 5, quantity: 1 }],
    standardStaterooms: 9,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 10,
    commonAreaTons: 30,
    cargoTons: 238.5,
  },
};

export const QUEEN_ELIZABETH_LINER: PreMadeShip = {
  id: 'queen_elizabeth_liner',
  source: 'ships_of_the_reach',
  name: 'Queen Elizabeth-class Liner',
  category: 'passenger',
  tl: 12,
  tonnage: 1200,
  description:
    'A luxury mobile hotel liner designed for elite charters, scenic cruising, and atmospheric operation on suitable worlds.',
  hullPoints: 480,
  purchaseCostMCr: 396.137,
  maintenanceCostCrPerMonth: 33011,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Engineers x5', 'Medic', 'Shuttle Pilot', 'Stewards x3', 'Administrator'],
  powerRequirements: [
    { system: 'Basic Ship Systems', power: 240 },
    { system: 'Manoeuvre Drive', power: 360 },
    { system: 'Jump Drive', power: 120 },
    { system: 'Sensors', power: 1 },
  ],
  components: [
    { category: 'Hull', name: '1,200 tons, Streamlined', tons: null, costMCr: 72 },
    { category: 'Systems', name: 'Docking Space (95 tons)', tons: 105, costMCr: 26.25 },
    { category: 'Cargo', name: 'Cargo', tons: 5, costMCr: null },
  ],
  softwareIds: ['library', 'manoeuvre_0', 'jump_control_3'],
  design: {
    name: 'Queen Elizabeth-class Liner',
    techLevel: 12,
    tonnage: 1200,
    hullConfiguration: 'streamlined',
    armorProtection: 0,
    manoeuvreRating: 1,
    jumpRating: 3,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 40,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_10',
    computerBis: true,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [{ equipmentId: 'fuel_processor', tons: 5, quantity: 1 }],
    standardStaterooms: 78,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 10,
    luxuryStaterooms: 4,
    lowBerths: 10,
    commonAreaTons: 92,
    cargoTons: 5,
  },
};

export const ULFHEDNAR_ESCORT_CARRIER: PreMadeShip = {
  id: 'ulfhednar_escort_carrier',
  source: 'ships_of_the_reach',
  name: 'Ulfhednar-class Escort Carrier',
  category: 'military',
  tl: 13,
  tonnage: 2000,
  description:
    'Fleet escort carrier fielding a full light-fighter squadron with launch and recovery facilities.',
  hullPoints: 800,
  purchaseCostMCr: 1091.7,
  maintenanceCostCrPerMonth: 90975,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Officer x2', 'Engineers x13', 'Maintenance x4', 'Sensor Operators x2', 'Medic', 'Gunners x10', 'Fighter Pilots x12'],
  powerRequirements: [
    { system: 'Basic Ship Systems', power: 400 },
    { system: 'Manoeuvre Drive', power: 800 },
    { system: 'Jump Drive', power: 800 },
    { system: 'Sensors', power: 7 },
  ],
  components: [
    { category: 'Hull', name: '2,000 tons, Standard', tons: null, costMCr: 100 },
    { category: 'Weapons', name: 'Triple Turrets (beam lasers) x10', tons: 10, costMCr: 25 },
    { category: 'Systems', name: 'Full Hangar (120 tons)', tons: 240, costMCr: 48 },
    { category: 'Cargo', name: 'Cargo', tons: 7, costMCr: null },
  ],
  softwareIds: ['library', 'manoeuvre_0', 'jump_control_4', 'battle_system_1'],
  design: {
    name: 'Ulfhednar-class Escort Carrier',
    techLevel: 13,
    tonnage: 2000,
    hullConfiguration: 'standard',
    armorMaterial: 'crystaliron',
    armorProtection: 4,
    manoeuvreRating: 4,
    jumpRating: 4,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 147,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: true,
    computerId: 'computer_20',
    computerBis: true,
    sensorSuiteId: 'improved',
    additionalSensorStations: 2,
    weapons: [{ mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'beam_laser'] }],
    equipment: [{ equipmentId: 'medical_bay', tons: 4, quantity: 1 }],
    standardStaterooms: 25,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 20,
    cargoTons: 7,
  },
};

export const RITCHEY_ESCORT: PreMadeShip = {
  id: 'ritchey_escort',
  source: 'ships_of_the_reach',
  name: 'Ritchey-class Escort',
  category: 'military',
  tl: 13,
  tonnage: 8000,
  description:
    'Large fleet escort optimized for screening friendly ships against missiles, fighters, and smaller attack craft.',
  hullPoints: 800,
  purchaseCostMCr: 4442.134,
  maintenanceCostCrPerMonth: 3701778,
  crew: ['Captain', 'Pilots x2', 'Astrogator', 'Officers x21', 'Engineers x59', 'Maintenance x16', 'Medics x2', 'Gunners x70', 'Pinnace Pilots x2', 'Administrators x8', 'Marines x12'],
  powerRequirements: [
    { system: 'Basic Ship Systems', power: 1600 },
    { system: 'Manoeuvre Drive', power: 3200 },
    { system: 'Jump Drive', power: 4800 },
    { system: 'Sensors', power: 11 },
  ],
  components: [
    { category: 'Hull', name: '8,000 tons, Standard', tons: null, costMCr: 400 },
    { category: 'Screens', name: 'Meson Screens x5, Nuclear Dampers x5', tons: 100, costMCr: 150 },
    { category: 'Weapons', name: 'Small Missile Bays x10, Particle Barbettes x10, Triple Turrets x40', tons: 590, costMCr: 300 },
    { category: 'Cargo', name: 'Cargo', tons: 83.7, costMCr: null },
  ],
  softwareIds: ['library', 'manoeuvre_0', 'jump_control_4', 'evade_1', 'auto_repair_2'],
  design: {
    name: 'Ritchey-class Escort',
    techLevel: 13,
    tonnage: 8000,
    hullConfiguration: 'standard',
    armorMaterial: 'crystaliron',
    armorProtection: 6,
    manoeuvreRating: 6,
    jumpRating: 4,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 718,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: true,
    computerId: 'computer_40',
    computerBis: true,
    sensorSuiteId: 'improved',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [
      { equipmentId: 'repair_drones', tons: 80, quantity: 1 },
      { equipmentId: 'medical_bay', tons: 8, quantity: 1 },
    ],
    standardStaterooms: 110,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 110,
    cargoTons: 83.7,
  },
};

export const GALOOF_MEGAFREIGHTER: PreMadeShip = {
  id: 'galoof_megafreighter',
  source: 'ships_of_the_reach',
  name: 'Galoof-class Megafreighter',
  category: 'trader',
  tl: 12,
  tonnage: 30000,
  description:
    'A corporate capital-scale freighter for bulk logistics across the Imperium, with cavernous cargo capacity and support craft facilities.',
  hullPoints: 15000,
  purchaseCostMCr: 7287.77,
  maintenanceCostCrPerMonth: 6073145,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Officers x8', 'Engineers x102', 'Maintenance x30', 'Administrators x15', 'Medics x2', 'Shuttle Pilots x5'],
  powerRequirements: [
    { system: 'Basic Ship Systems', power: 6000 },
    { system: 'Manoeuvre Drive', power: 9000 },
    { system: 'Jump Drive', power: 3000 },
    { system: 'Sensors', power: 1 },
  ],
  components: [
    { category: 'Hull', name: '30,000 tons, Standard', tons: null, costMCr: 1500 },
    { category: 'Systems', name: 'Full Hangar (475 tons), Shuttles x5', tons: 950, costMCr: 265.735 },
    { category: 'Cargo', name: 'Cargo', tons: 15248, costMCr: null },
  ],
  softwareIds: ['library', 'manoeuvre_0', 'jump_control_3'],
  design: {
    name: 'Galoof-class Megafreighter',
    techLevel: 12,
    tonnage: 30000,
    hullConfiguration: 'standard',
    armorProtection: 0,
    manoeuvreRating: 1,
    jumpRating: 3,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 1000,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_10',
    computerBis: true,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [{ equipmentId: 'medical_bay', tons: 4, quantity: 1 }],
    standardStaterooms: 87,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 1,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 320,
    cargoTons: 15248,
  },
};

export const PLANET_HEAVY_CRUISER: PreMadeShip = {
  id: 'planet_heavy_cruiser',
  source: 'ships_of_the_reach',
  name: 'Planet-class Heavy Cruiser',
  category: 'military',
  tl: 15,
  tonnage: 75000,
  description:
    'Imperial Navy fleet heavy cruiser built around an advanced spinal particle weapon and massive missile/fusion secondary batteries.',
  hullPoints: 41250,
  purchaseCostMCr: 45425.141,
  maintenanceCostCrPerMonth: 37854284,
  crew: ['Captain', 'Officers x110', 'Pilots x3', 'Astrogator', 'Engineers x485', 'Maintenance x150', 'Medics x9', 'Gunners x240', 'Administrators x75', 'Troop Transport Pilots x6', 'Marines x6'],
  powerRequirements: [
    { system: 'Basic Ship Systems', power: 15000 },
    { system: 'Manoeuvre Drive', power: 30000 },
    { system: 'Jump Drive', power: 45000 },
    { system: 'Systems, Weapons & Screens', power: 3230 },
    { system: 'Sensors', power: 28 },
  ],
  components: [
    { category: 'Hull', name: '75,000 tons, Standard, Reinforced', tons: null, costMCr: 5625 },
    { category: 'Weapons', name: 'Spinal Mount: Improved Particle (2DD)', tons: 5600, costMCr: 2600 },
    { category: 'Weapons', name: 'Small Missile Bays x60, Fusion Barbettes x16, Turret batteries', tons: 3170, costMCr: 899 },
    { category: 'Screens', name: 'Meson Screens x10, Nuclear Dampers x10', tons: 200, costMCr: 300 },
    { category: 'Cargo', name: 'Cargo', tons: 376.8, costMCr: null },
  ],
  softwareIds: ['library', 'manoeuvre_0', 'jump_control_4', 'intellect_0', 'evade_3', 'fire_control_5', 'auto_repair_2'],
  design: {
    name: 'Planet-class Heavy Cruiser',
    techLevel: 15,
    tonnage: 75000,
    hullConfiguration: 'standard',
    specialisedHull: 'reinforced',
    armorMaterial: 'bonded_superdense',
    armorProtection: 15,
    manoeuvreRating: 6,
    jumpRating: 4,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl15',
    powerPlantTons: 5000,
    additionalFuelWeeks: 4,
    useCockpit: false,
    holographicControls: true,
    computerId: 'computer_100',
    computerBis: false,
    sensorSuiteId: 'advanced',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [{ equipmentId: 'fuel_processor', tons: 200, quantity: 1 }],
    standardStaterooms: 600,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 3,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 540,
    cargoTons: 376.8,
  },
};


// ═══════════════════════════════════════════════════════════════════════
//  ASLAN SHIPS (SHIPS OF THE REACH)
// ═══════════════════════════════════════════════════════════════════════

export const HRAYE_SCOUT: PreMadeShip = {
  id: 'hraye_scout',
  source: 'aslan',
  name: 'Hraye-class Scout',
  category: 'scout',
  tl: 13,
  tonnage: 100,
  description: 'Aslan exploration scout with a Shrine to Heroes and modest courier/transporter utility for small colonies.',
  hullPoints: 40,
  purchaseCostMCr: 39.045,
  maintenanceCostCrPerMonth: 3253,
  crew: ['Pilot', 'Engineer/Astrogator'],
  powerRequirements: [
    { system: 'Basic Ship Systems', power: 20 },
    { system: 'Manoeuvre Drive', power: 20 },
    { system: 'Jump Drive', power: 20 },
    { system: 'Sensors', power: 1 },
  ],
  components: [
    { category: 'Hull', name: '100 tons, Streamlined', tons: null, costMCr: 6 },
    { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 },
    { category: 'Cargo', name: 'Cargo', tons: 15, costMCr: null },
  ],
  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0'],
  design: {
    name: 'Hraye-class Scout',
    techLevel: 13,
    tonnage: 100,
    hullConfiguration: 'streamlined',
    armorMaterial: 'crystaliron',
    armorProtection: 4,
    manoeuvreRating: 2,
    jumpRating: 2,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 3,
    additionalFuelWeeks: 8,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_5',
    computerBis: true,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [{ mountType: 'double_turret', weapons: ['pulse_laser', 'missile_rack'] }],
    equipment: [{ equipmentId: 'fuel_processor', tons: 1, quantity: 1 }, { equipmentId: 'probe_drones', tons: 1, quantity: 1 }, { equipmentId: 'cabin_space', tons: 4, quantity: 1 }],
    standardStaterooms: 4,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 8,
    cargoTons: 15,
  },
};

export const IHATEISHO_SCOUT: PreMadeShip = {
  id: 'ihateisho_scout', source: 'aslan', name: 'Ihateisho-class Scout', category: 'scout', tl: 13, tonnage: 100,
  description: 'Iconic long-range Aslan ihatei scout with unusually high automation for male-operated expeditions.',
  hullPoints: 40, purchaseCostMCr: 58.51, maintenanceCostCrPerMonth: 4876,
  crew: ['Pilot'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 20 }, { system: 'Manoeuvre Drive', power: 40 }, { system: 'Jump Drive', power: 40 }, { system: 'Sensors', power: 2 }],
  components: [{ category: 'Hull', name: '100 tons, Streamlined', tons: null, costMCr: 6 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Cargo', name: 'Cargo', tons: 4.5, costMCr: null }],
  softwareIds: ['jump_control_4', 'library', 'manoeuvre_0', 'fire_control_3', 'intellect_0'],
  design: { name: 'Ihateisho-class Scout', techLevel: 13, tonnage: 100, hullConfiguration: 'streamlined', armorProtection: 0, manoeuvreRating: 2, jumpRating: 4, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 4, additionalFuelWeeks: 8, useCockpit: false, holographicControls: false, computerId: 'computer_15', computerBis: true, sensorSuiteId: 'military', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['pulse_laser', 'pulse_laser', 'pulse_laser'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 1, quantity: 1 }, { equipmentId: 'docking_space', tons: 5, quantity: 1 }], standardStaterooms: 1, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 1, commonAreaTons: 4, cargoTons: 4.5 },
};

export const KTIYHUI_COURIER: PreMadeShip = {
  id: 'ktiyhui_courier', source: 'aslan', name: 'Ktiyhui-class Courier', category: 'military', tl: 12, tonnage: 200,
  description: 'Armoured Aslan diplomatic courier used to move nobles, dignitaries, and sensitive dispatches between clan territories.',
  hullPoints: 80, purchaseCostMCr: 103.905, maintenanceCostCrPerMonth: 8659,
  crew: ['Pilot', 'Purser', 'Astrogator', 'Engineer', 'Gunners x2'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 40 }, { system: 'Manoeuvre Drive', power: 60 }, { system: 'Jump Drive', power: 60 }, { system: 'Sensors', power: 3 }],
  components: [{ category: 'Hull', name: '200 tons, Streamlined', tons: null, costMCr: 12 }, { category: 'Armour', name: 'Crystaliron, Armour 12', tons: 30, costMCr: 10.8 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Cargo', name: 'Cargo', tons: 3, costMCr: null }],
  softwareIds: ['jump_control_3', 'library', 'manoeuvre_0', 'fire_control_2'],
  design: { name: 'Ktiyhui-class Courier', techLevel: 12, tonnage: 200, hullConfiguration: 'streamlined', armorMaterial: 'crystaliron', armorProtection: 12, manoeuvreRating: 4, jumpRating: 3, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 9, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_10', computerBis: true, sensorSuiteId: 'improved', additionalSensorStations: 0, weapons: [{ mountType: 'double_turret', weapons: ['pulse_laser', 'missile_rack'] }, { mountType: 'double_turret', weapons: ['sandcaster', 'missile_rack'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 2, quantity: 1 }], standardStaterooms: 6, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 1, lowBerths: 0, commonAreaTons: 12, cargoTons: 3 },
};

export const KTEIROA_SEEKER: PreMadeShip = {
  id: 'kteiroa_seeker', source: 'aslan', name: 'Kteiroa-class Seeker', category: 'mining', tl: 11, tonnage: 200,
  description: 'Asteroid-belt Aslan prospecting ship with dedicated mining drones and extra accommodation for transport duties.',
  hullPoints: 80, purchaseCostMCr: 57.495, maintenanceCostCrPerMonth: 4791,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Engineer'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 40 }, { system: 'Manoeuvre Drive', power: 40 }, { system: 'Jump Drive', power: 40 }, { system: 'Sensors', power: 1 }],
  components: [{ category: 'Hull', name: '200 tons, Streamlined', tons: null, costMCr: 12 }, { category: 'Systems', name: 'Mining Drones x20', tons: 40, costMCr: 4 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Cargo', name: 'Cargo', tons: 61, costMCr: null }],
  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0'],
  design: { name: 'Kteiroa-class Seeker', techLevel: 11, tonnage: 200, hullConfiguration: 'streamlined', armorProtection: 0, manoeuvreRating: 2, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl8', powerPlantTons: 9, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_5', computerBis: true, sensorSuiteId: 'civilian', additionalSensorStations: 0, weapons: [], equipment: [{ equipmentId: 'fuel_processor', tons: 1, quantity: 1 }, { equipmentId: 'mining_drones', tons: 40, quantity: 1 }], standardStaterooms: 4, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 2, cargoTons: 61 },
};

export const IYELIY_MESSENGER: PreMadeShip = {
  id: 'iyeliy_messenger', source: 'aslan', name: 'Iyeliy-class Messenger', category: 'scout', tl: 14, tonnage: 200,
  description: 'Aslan high-jump communications courier, analogous to the Imperial X-boat but optimized for jump-5 relay routes.',
  hullPoints: 80, purchaseCostMCr: 99.85, maintenanceCostCrPerMonth: 8238,
  crew: ['Pilot', 'Astrogator', 'Purser', 'Engineer', 'Gunners x2'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 40 }, { system: 'Manoeuvre Drive', power: 100 }, { system: 'Jump Drive', power: 20 }, { system: 'Sensors', power: 2 }],
  components: [{ category: 'Hull', name: '200 tons, Standard', tons: null, costMCr: 10 }, { category: 'Systems', name: 'Mail Distribution Array (TL13)', tons: 20, costMCr: 10 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Cargo', name: 'Cargo', tons: 8, costMCr: null }],
  softwareIds: ['jump_control_5', 'library', 'manoeuvre_0', 'intellect_0'],
  design: { name: 'Iyeliy-class Messenger', techLevel: 14, tonnage: 200, hullConfiguration: 'standard', armorProtection: 0, manoeuvreRating: 1, jumpRating: 5, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 10, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_20', computerBis: true, sensorSuiteId: 'military', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['pulse_laser', 'pulse_laser', 'pulse_laser'] }], equipment: [{ equipmentId: 'cabin_space', tons: 4, quantity: 1 }], standardStaterooms: 2, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 4, cargoTons: 8 },
};

export const AOAIW_LIGHT_TRADER: PreMadeShip = {
  id: 'aoaiw_light_trader', source: 'aslan', name: "Aoa'iw-class Light Trader", category: 'trader', tl: 11, tonnage: 300,
  description: 'Versatile Aslan border trader nicknamed the Pouncer, carrying passengers, cargo, and enough weaponry for raiding or defense.',
  hullPoints: 120, purchaseCostMCr: 91.777, maintenanceCostCrPerMonth: 7648,
  crew: ['Pilot', 'Astrogator', 'Purser', 'Engineer'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 60 }, { system: 'Manoeuvre Drive', power: 60 }, { system: 'Jump Drive', power: 60 }, { system: 'Sensors', power: 1 }],
  components: [{ category: 'Hull', name: '300 tons, Streamlined', tons: null, costMCr: 18 }, { category: 'Armour', name: 'Crystaliron, Armour 4', tons: 15, costMCr: 3.6 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Cargo', name: 'Cargo', tons: 86, costMCr: null }],
  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0'],
  design: { name: "Aoa'iw-class Light Trader", techLevel: 11, tonnage: 300, hullConfiguration: 'streamlined', armorMaterial: 'crystaliron', armorProtection: 4, manoeuvreRating: 1, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl8', powerPlantTons: 13, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_10', computerBis: false, sensorSuiteId: 'civilian', additionalSensorStations: 0, weapons: [{ mountType: 'double_turret', weapons: ['beam_laser', 'beam_laser'] }, { mountType: 'double_turret', weapons: ['beam_laser', 'beam_laser'] }, { mountType: 'double_turret', weapons: ['missile_rack', 'sandcaster'] }], equipment: [{ equipmentId: 'docking_space', tons: 5, quantity: 1 }, { equipmentId: 'docking_space', tons: 22, quantity: 1 }], standardStaterooms: 8, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 12, commonAreaTons: 6, cargoTons: 86 },
};

export const EAKHAU_TRADER: PreMadeShip = {
  id: 'eakhau_trader', source: 'aslan', name: 'Eakhau-class Trader', category: 'trader', tl: 12, tonnage: 400,
  description: 'Aslan family tramp trader, often one vessel among a nomadic pride-fleet searching for future territories.',
  hullPoints: 160, purchaseCostMCr: 95.145, maintenanceCostCrPerMonth: 7928,
  crew: ['Pilot', 'Astrogator', 'Purser', 'Engineer'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 80 }, { system: 'Manoeuvre Drive', power: 80 }, { system: 'Jump Drive', power: 80 }, { system: 'Sensors', power: 1 }],
  components: [{ category: 'Hull', name: '400 tons, Streamlined', tons: null, costMCr: 24 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Cargo', name: 'Cargo', tons: 173.5, costMCr: null }],
  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0'],
  design: { name: 'Eakhau-class Trader', techLevel: 12, tonnage: 400, hullConfiguration: 'streamlined', armorProtection: 0, manoeuvreRating: 1, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 11, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_5', computerBis: true, sensorSuiteId: 'civilian', additionalSensorStations: 0, weapons: [], equipment: [{ equipmentId: 'fuel_processor', tons: 1, quantity: 1 }], standardStaterooms: 13, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 16, commonAreaTons: 12, cargoTons: 173.5 },
};

export const HKIYRERAO_RESEARCHER: PreMadeShip = {
  id: 'hkiyrerao_researcher', source: 'aslan', name: 'Hkiyrerao-class Researcher', category: 'exploration', tl: 14, tonnage: 400,
  description: 'Aslan scientific survey ship with full laboratories, extended endurance, and carried craft for field operations.',
  hullPoints: 160, purchaseCostMCr: 157.832, maintenanceCostCrPerMonth: 13153,
  crew: ['Captain', 'Pilot', 'Executive Officer/Head Scientist', 'Astrogator', 'Engineers x2'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 80 }, { system: 'Manoeuvre Drive', power: 120 }, { system: 'Jump Drive', power: 40 }, { system: 'Sensors', power: 3 }],
  components: [{ category: 'Hull', name: '400 tons, Streamlined', tons: null, costMCr: 24 }, { category: 'Systems', name: 'Laboratories', tons: 40, costMCr: 10 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Cargo', name: 'Cargo', tons: 28, costMCr: null }],
  softwareIds: ['jump_control_3', 'library', 'manoeuvre_0', 'intellect_0'],
  design: { name: 'Hkiyrerao-class Researcher', techLevel: 14, tonnage: 400, hullConfiguration: 'streamlined', armorProtection: 0, manoeuvreRating: 1, jumpRating: 3, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 16, additionalFuelWeeks: 12, useCockpit: false, holographicControls: false, computerId: 'computer_25', computerBis: false, sensorSuiteId: 'improved', additionalSensorStations: 0, weapons: [], equipment: [{ equipmentId: 'fuel_processor', tons: 3, quantity: 1 }, { equipmentId: 'laboratory', tons: 40, quantity: 1 }, { equipmentId: 'docking_space', tons: 44, quantity: 1 }], standardStaterooms: 15, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 10, commonAreaTons: 10, cargoTons: 28 },
};

export const KHTUKHAO_CLAN_TRANSPORT: PreMadeShip = {
  id: 'khtukhao_clan_transport', source: 'aslan', name: 'Khtukhao-class Clan Transport', category: 'passenger', tl: 12, tonnage: 600,
  description: 'Large Aslan clan passenger/freight transport with a carried shuttle for cargo transfer and system-side operations.',
  hullPoints: 240, purchaseCostMCr: 187.662, maintenanceCostCrPerMonth: 15639,
  crew: ['Pilot', 'Astrogator', 'Purser', 'Engineers x2'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 120 }, { system: 'Manoeuvre Drive', power: 120 }, { system: 'Jump Drive', power: 120 }, { system: 'Sensors', power: 1 }],
  components: [{ category: 'Hull', name: '600 tons, Standard', tons: null, costMCr: 30 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Systems', name: 'Docking Space (95 tons) + Shuttle', tons: 105, costMCr: 41.417 }, { category: 'Cargo', name: 'Cargo', tons: 149, costMCr: null }],
  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0'],
  design: { name: 'Khtukhao-class Clan Transport', techLevel: 12, tonnage: 600, hullConfiguration: 'standard', armorProtection: 0, manoeuvreRating: 2, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 17, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_5', computerBis: true, sensorSuiteId: 'civilian', additionalSensorStations: 0, weapons: [], equipment: [{ equipmentId: 'docking_space', tons: 105, quantity: 1 }], standardStaterooms: 25, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 30, commonAreaTons: 20, cargoTons: 149 },
};

export const OWATARL_TENDER: PreMadeShip = {
  id: 'owatarl_tender', source: 'aslan', name: 'Owatarl-class Tender', category: 'military', tl: 12, tonnage: 600,
  description: 'Aslan military/corporate tender with defensive turret battery, heavy cargo volume, and a carried shuttle.',
  hullPoints: 216, purchaseCostMCr: 165.027, maintenanceCostCrPerMonth: 13752,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Purser/Executive Officer', 'Pilot', 'Engineers x2', 'Gunners x3'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 120 }, { system: 'Manoeuvre Drive', power: 120 }, { system: 'Jump Drive', power: 60 }, { system: 'Sensors', power: 2 }],
  components: [{ category: 'Hull', name: '600 tons, Dispersed', tons: null, costMCr: 15 }, { category: 'Weapons', name: 'Triple Turrets (beam lasers x2, sandcaster) x3', tons: 3, costMCr: 6.75 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Cargo', name: 'Cargo', tons: 211, costMCr: null }],
  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0', 'fire_control_2'],
  design: { name: 'Owatarl-class Tender', techLevel: 12, tonnage: 600, hullConfiguration: 'dispersed', armorMaterial: 'crystaliron', armorProtection: 4, manoeuvreRating: 1, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 17, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_10', computerBis: false, sensorSuiteId: 'military', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'sandcaster'] }, { mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'sandcaster'] }, { mountType: 'triple_turret', weapons: ['beam_laser', 'beam_laser', 'sandcaster'] }], equipment: [{ equipmentId: 'docking_space', tons: 105, quantity: 1 }], standardStaterooms: 10, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 4, cargoTons: 211 },
};


export const EKAWSIYKUA_ESCORT: PreMadeShip = {
  id: 'ekawsiykua_escort', source: 'aslan', name: 'Ekawsiykua-class Escort', category: 'military', tl: 13, tonnage: 800,
  description: 'Aslan dispersed-hull escort used for patrol and convoy protection, carrying pinnaces and fighters for scouting and interception.',
  hullPoints: 288, purchaseCostMCr: 400.464, maintenanceCostCrPerMonth: 33372,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Purser/Executive Officer', 'Officers x3', 'Pilots x7', 'Medic', 'Engineers x5', 'Maintenance', 'Gunners x10', 'Marines x10'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 160 }, { system: 'Manoeuvre Drive', power: 320 }, { system: 'Jump Drive', power: 320 }, { system: 'Sensors', power: 3 }],
  components: [{ category: 'Hull', name: '800 tons, Dispersed', tons: null, costMCr: 20 }, { category: 'Weapons', name: 'Triple turrets x8 (pulse lasers x3, missile racks x3, sandcasters x2)', tons: 8, costMCr: 25.25 }, { category: 'Systems', name: 'Shrine to Heroes', tons: 4, costMCr: 0.5 }, { category: 'Cargo', name: 'Cargo', tons: 19, costMCr: null }],
  softwareIds: ['jump_control_4', 'library', 'manoeuvre_0', 'fire_control_4'],
  design: { name: 'Ekawsiykua-class Escort', techLevel: 13, tonnage: 800, hullConfiguration: 'dispersed', armorProtection: 0, manoeuvreRating: 4, jumpRating: 4, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 36, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_20', computerBis: false, sensorSuiteId: 'improved', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['pulse_laser','pulse_laser','pulse_laser'] }, { mountType: 'triple_turret', weapons: ['missile_rack','missile_rack','missile_rack'] }, { mountType: 'triple_turret', weapons: ['sandcaster','sandcaster','sandcaster'] }], equipment: [{ equipmentId: 'docking_space', tons: 88, quantity: 2 }, { equipmentId: 'docking_space', tons: 55, quantity: 5 }], standardStaterooms: 20, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 14, cargoTons: 19 },
};

export const AOSITAOH_CRUISER: PreMadeShip = {
  id: 'aositaoh_cruiser', source: 'aslan', name: 'Aositaoh-class Cruiser', category: 'military', tl: 12, tonnage: 1000,
  description: 'Clan combat/troop cruiser with extensive carried vehicles and pinnaces for orbital deployment operations.',
  hullPoints: 400, purchaseCostMCr: 467.48, maintenanceCostCrPerMonth: 38957,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Purser/Executive Officer', 'Pilots x2', 'Engineers x5', 'Maintenance x2', 'Gunners x10', 'Marines x80'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 200 }, { system: 'Manoeuvre Drive', power: 300 }, { system: 'Jump Drive', power: 400 }, { system: 'Sensors', power: 3 }],
  components: [{ category: 'Hull', name: '1,000 tons, Streamlined', tons: null, costMCr: 60 }, { category: 'Armour', name: 'Crystaliron, Armour 6', tons: 75, costMCr: 18 }, { category: 'Weapons', name: 'Triple turrets x10', tons: 10, costMCr: 35.5 }, { category: 'Cargo', name: 'Cargo', tons: 13, costMCr: null }],
  softwareIds: ['jump_control_3', 'library', 'manoeuvre_0', 'fire_control_4'],
  design: { name: 'Aositaoh-class Cruiser', techLevel: 12, tonnage: 1000, hullConfiguration: 'streamlined', armorMaterial: 'crystaliron', armorProtection: 6, manoeuvreRating: 4, jumpRating: 3, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 47, additionalFuelWeeks: 0, useCockpit: false, holographicControls: true, computerId: 'computer_20', computerBis: false, sensorSuiteId: 'improved', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['pulse_laser','pulse_laser','pulse_laser'] }, { mountType: 'triple_turret', weapons: ['missile_rack','missile_rack','missile_rack'] }, { mountType: 'triple_turret', weapons: ['sandcaster','sandcaster','sandcaster'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 3, quantity: 1 }, { equipmentId: 'docking_space', tons: 88, quantity: 2 }, { equipmentId: 'docking_space', tons: 44, quantity: 4 }], standardStaterooms: 54, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 18, cargoTons: 13 },
};

export const HKISYELEAA_SLAVER: PreMadeShip = {
  id: 'hkisyeleaa_slaver', source: 'aslan', name: 'Hkisyeleaa-class Slaver', category: 'military', tl: 12, tonnage: 1000,
  description: 'Converted agricultural transport infamous as a slave-raiding platform, fitted with massive low berth capacity.',
  hullPoints: 400, purchaseCostMCr: 302.327, maintenanceCostCrPerMonth: 25194,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Purser', 'Pilot', 'Engineers x4', 'Maintenance', 'Gunners x3'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 200 }, { system: 'Manoeuvre Drive', power: 200 }, { system: 'Jump Drive', power: 200 }, { system: 'Sensors', power: 2 }],
  components: [{ category: 'Hull', name: '1,000 tons, Streamlined', tons: null, costMCr: 60 }, { category: 'Weapons', name: 'Triple turret (beam laser, missile rack, sandcaster) x3', tons: 3, costMCr: 7.5 }, { category: 'Low Berths', name: 'Low Berths x750', tons: 375, costMCr: 37.5 }, { category: 'Cargo', name: 'Cargo', tons: 114, costMCr: null }],
  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0'],
  design: { name: 'Hkisyeleaa-class Slaver', techLevel: 12, tonnage: 1000, hullConfiguration: 'streamlined', armorProtection: 0, manoeuvreRating: 2, jumpRating: 2, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 34, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_5', computerBis: true, sensorSuiteId: 'military', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['beam_laser','missile_rack','sandcaster'] }, { mountType: 'triple_turret', weapons: ['beam_laser','missile_rack','sandcaster'] }, { mountType: 'triple_turret', weapons: ['beam_laser','missile_rack','sandcaster'] }], equipment: [{ equipmentId: 'fuel_processor', tons: 3, quantity: 1 }, { equipmentId: 'docking_space', tons: 88, quantity: 8 }], standardStaterooms: 12, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 750, commonAreaTons: 24, cargoTons: 114 },
};

export const HALAHEIKE_POCKET_WARSHIP: PreMadeShip = {
  id: 'halaheike_pocket_warship', source: 'aslan', name: 'Halaheike-class Pocket Warship', category: 'military', tl: 14, tonnage: 1200,
  description: 'Multi-role Aslan pocket warship with bay weapons, heavy turret battery, and internal fighter/launch capacity.',
  hullPoints: 528, purchaseCostMCr: 720.864, maintenanceCostCrPerMonth: 60072,
  crew: ['Captain', 'Pilots x14', 'Astrogator', 'Executive Officer', 'Officers x3', 'Engineers x5', 'Maintenance x3', 'Gunners x12'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 240 }, { system: 'Manoeuvre Drive', power: 360 }, { system: 'Jump Drive', power: 360 }, { system: 'Sensors', power: 4 }],
  components: [{ category: 'Hull', name: '1,200 tons, Streamlined, Reinforced', tons: null, costMCr: 108 }, { category: 'Armour', name: 'Bonded Superdense, Armour 10', tons: 96, costMCr: 86.4 }, { category: 'Weapons', name: 'Small particle beam bays x2 + turret batteries', tons: 110, costMCr: 66.5 }, { category: 'Cargo', name: 'Cargo', tons: 65, costMCr: null }],
  softwareIds: ['jump_control_3', 'library', 'manoeuvre_0', 'fire_control_5'],
  design: { name: 'Halaheike-class Pocket Warship', techLevel: 14, tonnage: 1200, hullConfiguration: 'streamlined', specialisedHull: 'reinforced', armorMaterial: 'bonded_superdense', armorProtection: 10, manoeuvreRating: 3, jumpRating: 3, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 48, additionalFuelWeeks: 0, useCockpit: false, holographicControls: true, computerId: 'computer_30', computerBis: true, sensorSuiteId: 'improved', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['beam_laser','beam_laser','beam_laser'] }, { mountType: 'triple_turret', weapons: ['missile_rack','missile_rack','sandcaster'] }], bays: [{ weaponId: 'particle_beam', size: 'small', quantity: 2 }], equipment: [{ equipmentId: 'fuel_processor', tons: 3, quantity: 1 }, { equipmentId: 'docking_space', tons: 110, quantity: 10 }, { equipmentId: 'docking_space', tons: 44, quantity: 2 }], standardStaterooms: 30, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 0, commonAreaTons: 20, cargoTons: 65 },
};

export const SAKHAI_ASSAULT_CARRIER: PreMadeShip = {
  id: 'sakhai_assault_carrier', source: 'aslan', name: 'Sakhai-class Assault Carrier', category: 'military', tl: 12, tonnage: 2000,
  description: 'Heavy invasion carrier with marine barracks, low berth troop capacity, and a central fusion gun bay for siege operations.',
  hullPoints: 880, purchaseCostMCr: 857.15, maintenanceCostCrPerMonth: 71429,
  crew: ['Captain', 'Pilot', 'Astrogator', 'Purser/Executive Officer', 'Officers x18', 'Pilots x2', 'Engineers x5', 'Maintenance x4', 'Gunners x18', 'Marines x160'],
  powerRequirements: [{ system: 'Basic Ship Systems', power: 400 }, { system: 'Manoeuvre Drive', power: 600 }, { system: 'Jump Drive', power: 600 }, { system: 'Sensors', power: 4 }],
  components: [{ category: 'Hull', name: '2,000 tons, Streamlined, Reinforced', tons: null, costMCr: 180 }, { category: 'Armour', name: 'Crystaliron, Armour 8', tons: 200, costMCr: 72 }, { category: 'Weapons', name: 'Medium fusion gun bay, missile bays, barbettes and turrets', tons: 226, costMCr: 87.75 }, { category: 'Cargo', name: 'Cargo', tons: 6, costMCr: null }],
  softwareIds: ['jump_control_2', 'library', 'manoeuvre_0', 'fire_control_5'],
  design: { name: 'Sakhai-class Assault Carrier', techLevel: 12, tonnage: 2000, hullConfiguration: 'streamlined', specialisedHull: 'reinforced', armorMaterial: 'crystaliron', armorProtection: 8, manoeuvreRating: 3, jumpRating: 3, isReactionDrive: false, powerPlantTier: 'fusion_tl12', powerPlantTons: 100, additionalFuelWeeks: 0, useCockpit: false, holographicControls: false, computerId: 'computer_25', computerBis: false, sensorSuiteId: 'improved', additionalSensorStations: 0, weapons: [{ mountType: 'triple_turret', weapons: ['beam_laser','beam_laser','beam_laser'] }, { mountType: 'triple_turret', weapons: ['sandcaster','sandcaster','sandcaster'] }], barbettes: [{ weaponId: 'particle_barbette_bay', quantity: 3 }], bays: [{ weaponId: 'fusion_gun_bay', size: 'medium', quantity: 1 }, { weaponId: 'missile_bay', size: 'small', quantity: 2 }], equipment: [{ equipmentId: 'fuel_processor', tons: 6, quantity: 1 }, { equipmentId: 'armoury', tons: 32, quantity: 1 }], standardStaterooms: 17, doubleOccupancyStaterooms: 0, highStaterooms: 0, luxuryStaterooms: 0, lowBerths: 200, commonAreaTons: 12, cargoTons: 6 },
};

// ═══════════════════════════════════════════════════════════════════════
//  CAMPAIGN SHIPS — Custom designs from this campaign's lore
// ═══════════════════════════════════════════════════════════════════════

export const HARRIER_COMMERCE_RAIDER: PreMadeShip = {
  id: 'harrier_commerce_raider',
  source: 'campaign',
  name: 'Harrier-class Commerce Raider',
  category: 'military',
  tl: 15,
  tonnage: 200,
  description:
    'A 200-ton streamlined commerce raider built around superior stealth, holographic disguise, and bonded superdense armour. The reinforced hull, size-reduced military drives, and stealth-jump-capable J-Drive let it close on prizes unseen, hit hard with a particle barbette and missile rack, and disappear before defenders can respond. Eight staterooms accommodate the operating crew with eight low berths reserved for prize crews or boarding actions.',

  hullPoints: 88,
  purchaseCostMCr: 318.949,
  maintenanceCostCrPerMonth: 26579,

  crew: ['Captain', 'Pilot', 'Astrogator', 'Engineer', 'Maintenance', 'Gunners x2', 'Medic', 'Marines x3'],

  powerRequirements: [
    { system: 'Basic Ship Systems', power: 40 },
    { system: 'Manoeuvre Drive', power: 120 },
    { system: 'Jump Drive', power: 40 },
    { system: 'Sensors', power: 8 },
    { system: 'Weapons', power: 52 },
  ],

  components: [
    { category: 'Hull', name: '200 tons, Streamlined, Reinforced + Superior Stealth + Holographic Hull', tons: null, costMCr: null },
    { category: 'Armour', name: 'Bonded Superdense, Armour: 4', tons: null, costMCr: null },
    { category: 'M-Drive', name: 'Thrust 6 (size-reduced)', tons: null, costMCr: null },
    { category: 'J-Drive', name: 'Jump-2 (early jump, stealth jump, size-reduced)', tons: null, costMCr: null },
    { category: 'Power Plant', name: 'Fusion, Power 260', tons: null, costMCr: null },
    { category: 'Fuel Tanks', name: '42 tons', tons: 42, costMCr: null },
    { category: 'Bridge', name: 'Bridge with Holographic Controls', tons: null, costMCr: null },
    { category: 'Computer', name: 'Computer/20', tons: null, costMCr: null },
    { category: 'Sensors', name: 'Advanced', tons: null, costMCr: null },
    { category: 'Weapons', name: 'Particle Barbette', tons: 5, costMCr: null },
    { category: 'Weapons', name: 'Single Turret (Missile Rack, 12 smart missiles)', tons: 1, costMCr: null },
    { category: 'Systems', name: 'Military Countermeasures Suite', tons: 15, costMCr: null },
    { category: 'Systems', name: 'Armoury (1 ton)', tons: 1, costMCr: null },
    { category: 'Systems', name: 'Cargo Scoop (2 tons)', tons: 2, costMCr: null },
    { category: 'Systems', name: 'Fuel Processor (40 tons/day)', tons: 2, costMCr: null },
    { category: 'Software', name: 'Evade/1', tons: null, costMCr: null },
    { category: 'Software', name: 'Fire Control/2', tons: null, costMCr: null },
    { category: 'Software', name: 'Jump Control/2', tons: null, costMCr: null },
    { category: 'Software', name: 'Library', tons: null, costMCr: null },
    { category: 'Software', name: 'Manoeuvre/0', tons: null, costMCr: null },
    { category: 'Staterooms', name: 'Standard x8', tons: 32, costMCr: null },
    { category: 'Staterooms', name: 'Low Berths x8', tons: 4, costMCr: null },
    { category: 'Common Areas', name: 'Common Areas', tons: 8, costMCr: null },
    { category: 'Cargo', name: 'General Cargo', tons: 29.7, costMCr: null },
    { category: 'Cargo', name: 'Missile Storage (12 missiles)', tons: 1, costMCr: null },
  ],

  softwareIds: ['library', 'manoeuvre_0', 'jump_control_2', 'evade_1', 'fire_control_2'],

  design: {
    name: 'Harrier-class Commerce Raider',
    techLevel: 15,
    tonnage: 200,
    hullConfiguration: 'streamlined',
    specialisedHull: 'reinforced',
    armorMaterial: 'bonded_superdense',
    armorProtection: 4,
    manoeuvreRating: 6,
    jumpRating: 2,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl15',
    powerPlantTons: 13,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: true,
    computerId: 'computer_20',
    computerBis: false,
    sensorSuiteId: 'advanced',
    additionalSensorStations: 0,
    weapons: [
      { mountType: 'single_turret', weapons: ['missile_rack'] },
    ],
    barbettes: [
      { weaponId: 'particle_barbette_bay', quantity: 1 },
    ],
    equipment: [
      { equipmentId: 'holographic_hull', tons: 0, quantity: 1 },
      { equipmentId: 'countermeasures', tons: 15, quantity: 1 },
      { equipmentId: 'armoury', tons: 1, quantity: 1 },
      { equipmentId: 'cargo_scoop', tons: 2, quantity: 1 },
      { equipmentId: 'fuel_processor', tons: 2, quantity: 1 },
    ],
    standardStaterooms: 8,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 8,
    commonAreaTons: 8,
    cargoTons: 29.7,
  },
};

// ═══════════════════════════════════════════════════════════════════════
//  ALL PRE-MADE SHIPS
// ═══════════════════════════════════════════════════════════════════════

const RAW_PRE_MADE_SHIPS: PreMadeShip[] = [
  // Core Rulebook Ships
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
  // Ships of the Reach
  FAST_TRADER_A3,
  STAR_RAY_INTERCEPTOR,
  HERALD_FAST_MESSENGER,
  INDIGO_PIRATE_CARRIER,
  BUCCANEER_BLOCKADE_RUNNER,
  FIERY_GUNSHIP,
  GHOST_OF_THE_REACH,
  SUBSIDISED_MERCHANT_RQ,
  VULTURE_SALVAGE_HAULER,
  WATCHDOG_FLEET_PICKET,
  CORSAIR_REACH,
  MAGENTA_REPAIR_SHIP,
  PATROL_TENDER,
  QUEEN_ELIZABETH_LINER,
  ULFHEDNAR_ESCORT_CARRIER,
  RITCHEY_ESCORT,
  GALOOF_MEGAFREIGHTER,
  PLANET_HEAVY_CRUISER,
  // Aslan Ships
  HRAYE_SCOUT,
  IHATEISHO_SCOUT,
  KTIYHUI_COURIER,
  KTEIROA_SEEKER,
  IYELIY_MESSENGER,
  AOAIW_LIGHT_TRADER,
  EAKHAU_TRADER,
  HKIYRERAO_RESEARCHER,
  KHTUKHAO_CLAN_TRANSPORT,
  OWATARL_TENDER,
  EKAWSIYKUA_ESCORT,
  AOSITAOH_CRUISER,
  HKISYELEAA_SLAVER,
  HALAHEIKE_POCKET_WARSHIP,
  SAKHAI_ASSAULT_CARRIER,
  // Small Craft
  LIGHT_FIGHTER,
  GIG,
  LAUNCH,
  SHIPS_BOAT,
  SLOW_BOAT,
  PINNACE,
  SLOW_PINNACE,
  MODULAR_CUTTER,
  SHUTTLE,
  PASSENGER_SHUTTLE,
  // Campaign Ships
  HARRIER_COMMERCE_RAIDER,
];

export const PRE_MADE_SHIPS: NormalizedPreMadeShip[] = RAW_PRE_MADE_SHIPS.map(normalizePreMadeShip);

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Get a pre-made ship by ID */
export function getPreMadeShip(id: string): NormalizedPreMadeShip | undefined {
  return PRE_MADE_SHIPS.find((s) => s.id === id);
}

export const SHIP_SOURCE_LABELS: Record<NonNullable<PreMadeShip['source']>, string> = {
  core: 'Core Rulebook',
  ships_of_the_reach: 'Ships of the Reach',
  aslan: 'Aslan Ships',
  campaign: 'Campaign Ships',
};

export function getShipSource(ship: PreMadeShip): NonNullable<PreMadeShip['source']> {
  return ship.source ?? 'core';
}

/** Get all pre-made ships in a category */
export function getShipsByCategory(category: PreMadeShip['category']): NormalizedPreMadeShip[] {
  return PRE_MADE_SHIPS.filter((s) => s.category === category);
}

/** Get the full (undiscounted) cost of a pre-made ship */
export function getFullCostMCr(ship: PreMadeShip): number {
  return ship.purchaseCostMCr / 0.9;
}
