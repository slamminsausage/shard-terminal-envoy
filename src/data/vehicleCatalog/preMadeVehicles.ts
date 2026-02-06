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

// ── Collection & Helpers ────────────────────────────────────────────

/** All pre-made vehicles in the catalog. */
export const PRE_MADE_VEHICLES: PreMadeVehicle[] = [
  AIR_RAFT,
  ATV,
  BRUTUS_HEAVY_CARGO_TRUCK,
  CARGO_LIFTER,
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
