/**
 * Converts a PreMadeShip from the construction catalog into
 * partial Vehicle data suitable for saving via CampaignContext.
 */

import type { PreMadeShip } from "@/data/shipConstruction/types";
import type { Vehicle } from "@/types/database";

export function preMadeShipToVehicle(ship: PreMadeShip): Partial<Vehicle> {
  const design = ship.design;

  // Build weapons array from components
  const weaponComponents = ship.components.filter(
    (c) => c.category === "Weapons" || c.category === "Ammunition"
  );
  const weapons = weaponComponents.map((w) => ({
    weapon: w.name,
    mount: "",
    tl: String(ship.tl),
    range: "",
    damage: "",
    ammunition: "",
    traits: "",
  }));

  // Build software list from components
  const software = ship.components
    .filter((c) => c.category === "Software")
    .map((s) => s.name);

  // Build systems list from components
  const systems = ship.components
    .filter(
      (c) =>
        c.category === "Systems" ||
        c.category === "Craft" ||
        c.category === "Armoured Bulkheads"
    )
    .map((s) => s.name);

  // Build power requirements
  const powerRequirements = ship.powerRequirements.map((pr) => ({
    label: pr.system,
    value: String(pr.power),
  }));

  // Build cargo entries
  const cargo = [
    { description: "General Cargo", tons: String(design.cargoTons) },
  ];

  // Build crew requirements (all unassigned)
  const crewReqs: Record<string, string> = {};
  const crewCounts: Record<string, number> = {};
  for (const role of ship.crew) {
    crewCounts[role] = (crewCounts[role] || 0) + 1;
  }
  for (const [role, count] of Object.entries(crewCounts)) {
    if (count === 1) {
      crewReqs[role.toLowerCase()] = "Unassigned";
    } else {
      for (let i = 1; i <= count; i++) {
        crewReqs[`${role.toLowerCase()}${i}`] = "Unassigned";
      }
    }
  }

  // Build sensors from design
  const sensorMap: Record<string, string> = {
    basic: "-4",
    civilian: "-2",
    military: "+0",
    improved: "+1",
    advanced: "+2",
  };
  const sensorSuiteName = ship.components.find(
    (c) => c.category === "Sensors"
  )?.name ?? "Basic";
  const sensors = [
    { type: sensorSuiteName, dm: sensorMap[design.sensorSuiteId] ?? "+0" },
  ];

  // Build critical hits template
  const criticalHits = [
    { label: "Armour", boxes: [false, false, false, false, false, false] },
    { label: "Bridge", boxes: [false, false, false, false, false, false] },
    { label: "Cargo", boxes: [false, false, false, false, false, false] },
    { label: "Crew", boxes: [false, false, false, false, false, false] },
    { label: "Fuel", boxes: [false, false, false, false, false, false] },
    { label: "Hull", boxes: [false, false, false, false, false, false] },
    { label: "J-Drive", boxes: [false, false, false, false, false, false] },
    { label: "M-Drive", boxes: [false, false, false, false, false, false] },
    {
      label: "Power Plant",
      boxes: [false, false, false, false, false, false],
    },
    { label: "Sensors", boxes: [false, false, false, false, false, false] },
    { label: "Weapons", boxes: [false, false, false, false, false, false] },
  ];

  return {
    name: ship.name,
    vehicle_type: ship.category === "small_craft" ? "Small Craft" : "Ship",
    class_type: ship.designation
      ? `${ship.name} (${ship.designation})`
      : ship.name,
    tech_level: ship.tl,
    tonnage: ship.tonnage,
    cost: ship.purchaseCostMCr * 1_000_000,
    hull: ship.hullPoints,
    structure: ship.hullPoints,
    armor: design.armorProtection,
    maneuver_drive: design.manoeuvreRating,
    jump_drive: design.jumpRating,
    power_plant: design.powerPlantTons,
    acceleration: design.manoeuvreRating,
    top_speed: 0,
    jump_rating: design.jumpRating,
    fuel_capacity: ship.components
      .filter((c) => c.category === "Fuel Tanks")
      .reduce((sum, c) => sum + (c.tons ?? 0), 0),
    cargo_capacity: design.cargoTons,
    passenger_capacity:
      design.standardStaterooms +
      design.highStaterooms +
      design.luxuryStaterooms +
      design.lowBerths,
    weapons: weapons.length > 0 ? weapons : {},
    screens: {},
    computer_rating: parseInt(
      design.computerId.replace("computer_", ""),
      10
    ),
    sensors: 1,
    communications: 1,
    maintenance_cost: ship.maintenanceCostCrPerMonth,
    crew_requirements: crewReqs,
    specifications: {
      notes: ship.description,
      software,
      systems,
      sensors,
      powerRequirements,
      cargo,
      criticalHits,
      preMadeShipId: ship.id,
    },
  };
}
