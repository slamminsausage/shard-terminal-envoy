/**
 * Pre-made vehicle definitions from the Traveller Core Rulebook.
 *
 * Each vehicle is a complete, ready-to-deploy definition that can be
 * converted into the app's Vehicle database type.
 */

import type { PreMadeVehicle } from "./types";

// ── Civilian / Utility Vehicles ─────────────────────────────────────

export const AIR_RAFT: PreMadeVehicle = {
  id: "air_raft",
  name: "Air/Raft",
  category: "civilian",
  locomotion: "grav",
  skill: "Flyer (Grav)",
  tl: 8,
  description:
    "An open-topped vehicle supported by grav modules that can reach orbit in a breathable atmosphere. Popular across the Imperium as a versatile personal and commercial transport, the air/raft is ubiquitous on worlds with TL8 or higher.",
  agility: 0,
  speed: { max: 6, maxLabel: "Fast", cruise: 4, cruiseLabel: "Medium" },
  rangeKm: 0, // Unlimited
  crew: 1,
  passengers: 3,
  cargoTons: 0.25,
  hull: 2,
  shippingTons: 4,
  costCr: 250_000,
  armour: { front: 0, rear: 0, sides: 0 },
  weapons: [],
  equipment: [
    { name: "Autopilot (basic)", description: "DM+1" },
    { name: "Communications System (basic)", description: "Range 50km" },
    { name: "Computer/1" },
    { name: "Navigation System (basic)", description: "DM+1" },
    { name: "Sensors (basic)", description: "DM-2, range 1km" },
  ],
};

export const ATV: PreMadeVehicle = {
  id: "atv",
  name: "ATV",
  category: "exploration",
  locomotion: "wheel",
  skill: "Drive (Wheel)",
  tl: 12,
  description:
    "A pressurised all-terrain vehicle capable of traversing the harshest environments. Equipped with life support, advanced sensors, and a small turret for self-defence, it is the workhorse of exploratory missions and colonial surveys.",
  agility: -1,
  speed: { max: 4, maxLabel: "Medium", cruise: 3, cruiseLabel: "Slow" },
  rangeKm: 600,
  crew: 1,
  passengers: 7,
  cargoTons: 0.5,
  hull: 36,
  shippingTons: 10,
  costCr: 155_000,
  armour: { front: 12, rear: 8, sides: 8 },
  weapons: [],
  equipment: [
    { name: "Airlock" },
    { name: "Autopilot (enhanced)", description: "DM+2" },
    { name: "Bunks x4" },
    { name: "Communications System (advanced)", description: "Range 1,000km" },
    { name: "Computer/2" },
    { name: "Fire Extinguishers" },
    { name: "Fresher" },
    { name: "Life Support (long term)" },
    { name: "Navigation System (improved)", description: "DM+2" },
    { name: "Sensors (improved)", description: "DM+1, range 5km" },
    { name: "Small Turret" },
  ],
};

export const BRUTUS_HEAVY_CARGO_TRUCK: PreMadeVehicle = {
  id: "brutus_heavy_cargo_truck",
  name: "Brutus Heavy Cargo Truck",
  category: "utility",
  locomotion: "wheel",
  skill: "Drive (Wheel)",
  tl: 10,
  description:
    "A massive 16-wheeled cargo hauler designed for overland freight operations. The Brutus can carry up to 24 tons of goods across continent-spanning distances, making it indispensable on worlds where grav technology is unavailable or impractical.",
  agility: -3,
  speed: { max: 3, maxLabel: "Slow", cruise: 2, cruiseLabel: "Very Slow" },
  rangeKm: 1200,
  crew: 1,
  passengers: 1,
  cargoTons: 24,
  hull: 88,
  shippingTons: 40,
  costCr: 241_000,
  armour: { front: 6, rear: 6, sides: 6 },
  weapons: [],
  equipment: [
    { name: "Autopilot (basic)", description: "DM+1" },
    { name: "Bunks x2" },
    { name: "Communications System (basic)", description: "Range 50km" },
    { name: "Computer/1" },
    { name: "Crane (medium)", description: "5 tons capacity" },
    { name: "Fire Extinguishers" },
    { name: "Fresher" },
    { name: "Mini Galley" },
    { name: "Navigation System (improved)", description: "DM+2" },
    { name: "Sensors (basic)", description: "DM-2, range 1km" },
  ],
};

export const CARGO_LIFTER: PreMadeVehicle = {
  id: "cargo_lifter",
  name: "Cargo Lifter",
  category: "utility",
  locomotion: "walker",
  skill: "Drive (Walker)",
  tl: 8,
  description:
    "A bipedal walking loader used at starports and warehouses for moving heavy cargo containers and freight. While slow and lightly armoured, it is cheap to operate and can handle terrain that wheeled forklifts cannot.",
  agility: -2,
  speed: { max: 1, maxLabel: "Idle", cruise: 0, cruiseLabel: "Stopped" },
  rangeKm: 50,
  crew: 1,
  passengers: 0,
  cargoTons: 2,
  hull: 6,
  shippingTons: 3,
  costCr: 70_000,
  armour: { front: 2, rear: 2, sides: 2 },
  weapons: [],
  equipment: [
    { name: "Communications System (basic)", description: "Range 50km" },
    { name: "Computer/1" },
    { name: "Crane (light)", description: "2.5 tons capacity" },
    { name: "Sensors (basic)", description: "DM-2, range 1km" },
  ],
};

export const G_BIKE: PreMadeVehicle = {
  id: "g_bike",
  name: "G/Bike",
  category: "civilian",
  locomotion: "grav",
  skill: "Flyer (Grav)",
  tl: 12,
  description:
    "Much like its ground-based predecessors, the G/Bike's speed and size make it a favourite with many Travellers needing to make their own way around a strange planet. It is also the focus of many subcultures and gangs across Charted Space.",
  agility: 3,
  speed: { max: 7, maxLabel: "Very Fast", cruise: 6, cruiseLabel: "Fast" },
  rangeKm: 3000,
  crew: 1,
  passengers: 0,
  cargoTons: 0,
  hull: 2,
  shippingTons: 0.5,
  costCr: 46_000,
  armour: { front: 4, rear: 4, sides: 4 },
  weapons: [],
  equipment: [
    { name: "Communications System (improved)", description: "Range 500km" },
    { name: "Navigation System (improved)", description: "DM+2" },
    { name: "Sensors (improved)", description: "DM+1, range 5km" },
  ],
};

export const G_RACER: PreMadeVehicle = {
  id: "g_racer",
  name: "G/Racer",
  category: "civilian",
  locomotion: "grav",
  skill: "Flyer (Grav)",
  tl: 9,
  description:
    "The natural extension of racing cars, G/Racer sports can be found across Charted Space, through every conceivable terrain type and with varying casualty rates. These vehicles are extremely fast but notoriously fragile as every ounce of weight is squeezed out in the pursuit of massive speed.",
  agility: 2,
  speed: { max: 8, maxLabel: "Subsonic", cruise: 7, cruiseLabel: "Very Fast" },
  rangeKm: 2000,
  crew: 1,
  passengers: 1,
  cargoTons: 0,
  hull: 4,
  shippingTons: 3,
  costCr: 300_000,
  armour: { front: 3, rear: 3, sides: 3 },
  weapons: [],
  equipment: [
    { name: "Communications System (improved)", description: "Range 500km" },
    { name: "Computer/1" },
    { name: "Sensors (basic)", description: "DM-2, range 1km" },
  ],
};

// ── Military Vehicles ───────────────────────────────────────────────

export const GECKO_ASSAULT_VEHICLE: PreMadeVehicle = {
  id: "gecko_assault_vehicle",
  name: "Gecko All-Terrain Assault Vehicle",
  category: "military",
  locomotion: "wheel",
  skill: "Drive (Wheel)",
  tl: 7,
  description:
    "Designed to transport a fire team or VIP through a war zone, the Gecko can handle a wide variety of terrain at some speed and, despite being only semi-enclosed, its armour is sufficient to resist small arms fire of an equivalent Tech Level. It also sports a powerful punch with twin-linked autocannon mounted on the roof.",
  agility: 0,
  speed: { max: 5, maxLabel: "High", cruise: 4, cruiseLabel: "Medium" },
  rangeKm: 300,
  crew: 2,
  passengers: 3,
  cargoTons: 0,
  hull: 18,
  shippingTons: 4.5,
  costCr: 42_450,
  armour: { front: 12, rear: 12, sides: 12 },
  weapons: [
    {
      weapon: "Twin Light Autocannon",
      mount: "Pintle Mount (front)",
      damage: "6D",
      traits: "Auto 3",
    },
  ],
  equipment: [
    { name: "Camouflage (improved)" },
    { name: "Communications System (basic, increased range)", description: "Range 500km" },
  ],
};

export const GUNSKIFF: PreMadeVehicle = {
  id: "gunskiff",
  name: "Gunskiff",
  category: "military",
  locomotion: "grav",
  skill: "Flyer (Grav)",
  tl: 10,
  description:
    "Despite some models featuring extreme styling to conform to standards of fashion, the Gunskiff is essentially an open-topped grav platform mounted with a single heavy weapon. It is a cheap and effective way to bring a heavy weapon to bear over a wide area but its light armour and open nature often means it is best employed against relatively low Tech Level enemies.",
  agility: -1,
  speed: { max: 3, maxLabel: "Slow", cruise: 2, cruiseLabel: "Very Slow" },
  rangeKm: 1000,
  crew: 2,
  passengers: 4,
  cargoTons: 0,
  hull: 30,
  shippingTons: 10,
  costCr: 313_750,
  armour: { front: 3, rear: 3, sides: 3 },
  weapons: [
    {
      weapon: "Laser Cannon",
      mount: "Fixed Mount (front)",
      damage: "8D",
      traits: "AP 5",
    },
  ],
  equipment: [
    { name: "Open Vehicle" },
    { name: "Autopilot (basic)", description: "DM+1" },
    { name: "Communications System (improved)", description: "Range 500km" },
  ],
};

export const G_CARRIER: PreMadeVehicle = {
  id: "g_carrier",
  name: "G/Carrier",
  category: "military",
  locomotion: "grav",
  skill: "Flyer (Grav)",
  tl: 15,
  description:
    "A grav carrier is effectively a flying armoured personnel carrier and is a standard fighting vehicle of many military forces across Charted Space. Heavily armoured and armed with a turret-mounted fusion gun, the G/Carrier can deliver a full squad into the hottest combat zones.",
  agility: -1,
  speed: { max: 6, maxLabel: "Fast", cruise: 5, cruiseLabel: "High" },
  rangeKm: 5000,
  crew: 2,
  passengers: 8,
  cargoTons: 0.75,
  hull: 90,
  shippingTons: 15,
  costCr: 11_580_000,
  armour: { front: 120, rear: 100, sides: 80 },
  weapons: [
    {
      weapon: "Fusion Gun",
      mount: "Turret",
      damage: "16D",
      traits: "AP 20, Radiation",
    },
  ],
  equipment: [
    { name: "AFV" },
    { name: "Autopilot" },
    { name: "Communications System (advanced)", description: "Range 1,000km" },
    { name: "Computer/5" },
    { name: "Navigation System (advanced)", description: "DM+4" },
    { name: "Sensors (advanced)", description: "DM+2, range 25km" },
  ],
};

// ── Low-Tech Vehicles ───────────────────────────────────────────────

export const PERSONAL_LAND_YACHT: PreMadeVehicle = {
  id: "personal_land_yacht",
  name: "Personal Land Yacht",
  category: "civilian",
  locomotion: "unpowered",
  skill: "Drive (Wheel)",
  tl: 3,
  description:
    "This wind-powered vehicle is used on worlds with typically flat terrain and reliable winds. It is capable of traversing great distances with favourable winds but while a passenger can be carried, its cargo capacity while doing so is non-existent.",
  agility: -1,
  speed: { max: 2, maxLabel: "Very Slow", cruise: 1, cruiseLabel: "Idle" },
  rangeKm: 0, // Unlimited (wind-powered)
  crew: 1,
  passengers: 1,
  cargoTons: 0,
  hull: 2,
  shippingTons: 1,
  costCr: 600,
  armour: { front: 1, rear: 1, sides: 1 },
  weapons: [],
  equipment: [
    { name: "Wind Powered" },
  ],
};

// ── Collection & Helpers ────────────────────────────────────────────

/** All pre-made vehicles in the catalog. */
export const PRE_MADE_VEHICLES: PreMadeVehicle[] = [
  AIR_RAFT,
  ATV,
  BRUTUS_HEAVY_CARGO_TRUCK,
  CARGO_LIFTER,
  G_BIKE,
  G_RACER,
  GECKO_ASSAULT_VEHICLE,
  GUNSKIFF,
  G_CARRIER,
  PERSONAL_LAND_YACHT,
];

/** Retrieve a pre-made vehicle by its id. */
export function getPreMadeVehicle(id: string): PreMadeVehicle | undefined {
  return PRE_MADE_VEHICLES.find((v) => v.id === id);
}

/** Retrieve all pre-made vehicles in a given category. */
export function getVehiclesByCategory(
  category: PreMadeVehicle["category"]
): PreMadeVehicle[] {
  return PRE_MADE_VEHICLES.filter((v) => v.category === category);
}
