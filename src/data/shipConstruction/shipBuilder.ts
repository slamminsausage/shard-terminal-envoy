/**
 * Traveller Core Rulebook - Ship Construction Calculation Engine
 *
 * Takes a ShipDesign (all user choices) and produces ShipCalculations
 * (tonnage breakdown, cost totals, power budget, crew, validation).
 *
 * Follows the 13-step construction process from the core rulebook.
 */

import type {
  ShipDesign,
  ShipCalculations,
  ShipWeaponInstallation,
  ShipEquipmentInstallation,
} from './types';

import {
  HULL_CONFIGURATIONS,
  SPECIALISED_HULL_TYPES,
  HULL_OPTIONS,
  ARMOR_MATERIALS,
  calculateHullPoints,
  calculateHullCost,
  calculateArmorTonnage,
  calculateArmorCost,
  getMaxProtection,
  calculateHullOptionCost,
  calculateHullOptionTonnage,
} from './hulls';

import {
  MANOEUVRE_DRIVE_TABLE,
  JUMP_DRIVE_TABLE,
  calculateManoeuvreDriveTons,
  calculateManoeuvreDriveCost,
  calculateJumpDriveTons,
  calculateJumpDriveCost,
  getManoeuvreMinTL,
  getJumpMinTL,
} from './drives';

import {
  POWER_PLANT_TYPES,
  powerForBasicSystems,
  powerForManoeuvreDrive,
  powerForJumpDrive,
  calculatePowerGenerated,
  calculatePowerPlantCost,
  jumpFuelTons,
  powerPlantFuelTons,
} from './powerPlants';

import {
  BRIDGE_SIZE_TABLE,
  COCKPIT_OPTIONS,
  COMPUTER_MODELS,
  SENSOR_SUITES,
  SENSOR_STATION_TONS,
  SENSOR_STATION_COST,
  getBridgeTons,
  calculateBridgeCost,
  calculateComputerCost,
} from './bridges';

import {
  TURRET_WEAPONS,
  WEAPON_MOUNTS,
  calculateHardpoints,
  calculateFirmpoints,
  calculateWeaponInstallationTons,
  calculateWeaponInstallationCostMCr,
  calculateWeaponInstallationPower,
} from './weapons';

import {
  SPACECRAFT_EQUIPMENT,
  getEquipment,
  calculateEquipmentTons,
  calculateEquipmentCost,
  calculateEquipmentPower,
} from './equipment';

import {
  calculateStateroomTons,
  calculateStateroomCost,
  calculateLowBerthTons,
  calculateLowBerthCost,
  calculateLowBerthPower,
  calculateCommonAreaCost,
  calculateCrewRequirements,
  calculateMonthlySalaries,
} from './staterooms';

// ═══════════════════════════════════════════════════════════════════════
//  MAIN CALCULATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Calculate all derived values from a ship design.
 * This is the core function of the construction system.
 */
export function calculateShipDesign(design: ShipDesign): ShipCalculations {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── Resolve references ────────────────────────────────────────────
  const hullConfig = HULL_CONFIGURATIONS.find(
    (c) => c.id === design.hullConfiguration
  )!;

  const specialisedHull = design.specialisedHull
    ? SPECIALISED_HULL_TYPES.find((s) => s.id === design.specialisedHull)
    : undefined;

  const armorMaterial = design.armorMaterial
    ? ARMOR_MATERIALS.find((a) => a.id === design.armorMaterial)
    : undefined;

  const powerPlant = POWER_PLANT_TYPES.find(
    (p) => p.id === design.powerPlantTier
  )!;

  const computer = COMPUTER_MODELS.find(
    (c) => c.id === design.computerId
  )!;

  const sensorSuite = SENSOR_SUITES.find(
    (s) => s.id === design.sensorSuiteId
  )!;

  // ── Step 1: Hull ──────────────────────────────────────────────────
  const hullPoints = calculateHullPoints(design.tonnage, hullConfig, specialisedHull);
  const hullCost = calculateHullCost(design.tonnage, hullConfig, specialisedHull);

  // Hull options cost and tonnage
  let hullOptionsCost = 0;
  let hullOptionsTons = 0;
  if (design.hullOptions) {
    for (const optionId of design.hullOptions) {
      const option = HULL_OPTIONS.find((o) => o.id === optionId);
      if (option) {
        hullOptionsCost += calculateHullOptionCost(option, design.tonnage);
        hullOptionsTons += calculateHullOptionTonnage(option, design.tonnage);
      }
    }
  }

  let hullArmorTons = 0;
  let armorCost = 0;
  const isMilitary = design.specialisedHull === 'military';
  if (armorMaterial && design.armorProtection > 0) {
    if (!hullConfig.canHaveArmor) {
      errors.push('This hull configuration cannot have armour.');
    } else {
      const maxProt = getMaxProtection(armorMaterial, design.techLevel, isMilitary);
      if (design.armorProtection > maxProt) {
        errors.push(
          `Armour protection ${design.armorProtection} exceeds maximum ${maxProt} for ${armorMaterial.name} at TL${design.techLevel}.`
        );
      }
      if (design.techLevel < armorMaterial.tl) {
        errors.push(
          `${armorMaterial.name} requires TL${armorMaterial.tl}, ship is TL${design.techLevel}.`
        );
      }
      hullArmorTons = calculateArmorTonnage(
        design.tonnage,
        hullConfig,
        armorMaterial,
        design.armorProtection
      );
      armorCost = calculateArmorCost(
        design.tonnage,
        hullConfig,
        armorMaterial,
        design.armorProtection
      );
    }
  }

  // ── Step 2: Drives ────────────────────────────────────────────────
  const manoeuvreDriveTons = calculateManoeuvreDriveTons(
    design.tonnage,
    design.manoeuvreRating
  );
  const manoeuvreDriveCost = calculateManoeuvreDriveCost(
    design.tonnage,
    design.manoeuvreRating,
    design.isReactionDrive
  );

  const jumpDriveTons = calculateJumpDriveTons(
    design.tonnage,
    design.jumpRating
  );
  const jumpDriveCost = calculateJumpDriveCost(
    design.tonnage,
    design.jumpRating
  );

  // TL validation for drives
  const mMinTL = getManoeuvreMinTL(design.manoeuvreRating);
  if (design.manoeuvreRating > 0 && design.techLevel < mMinTL) {
    errors.push(
      `Thrust ${design.manoeuvreRating} requires TL${mMinTL}, ship is TL${design.techLevel}.`
    );
  }
  const jMinTL = getJumpMinTL(design.jumpRating);
  if (design.jumpRating > 0 && design.techLevel < jMinTL) {
    errors.push(
      `Jump-${design.jumpRating} requires TL${jMinTL}, ship is TL${design.techLevel}.`
    );
  }

  // ── Step 3: Power Plant ───────────────────────────────────────────
  const powerPlantTons = design.powerPlantTons;
  const powerPlantCost = calculatePowerPlantCost(powerPlant, powerPlantTons);
  const totalPowerGenerated = calculatePowerGenerated(
    powerPlant,
    powerPlantTons
  );

  if (design.techLevel < powerPlant.tl) {
    errors.push(
      `${powerPlant.name} requires TL${powerPlant.tl}, ship is TL${design.techLevel}.`
    );
  }

  // ── Step 4: Fuel ──────────────────────────────────────────────────
  const jFuel = jumpFuelTons(design.tonnage, design.jumpRating);
  const ppFuel = powerPlantFuelTons(
    powerPlantTons,
    4 + (design.additionalFuelWeeks ?? 0)
  );
  const fuelTons = jFuel + ppFuel;

  // ── Step 5: Bridge ────────────────────────────────────────────────
  let bridgeTons: number;
  let bridgeCost: number;

  if (design.useCockpit && design.tonnage <= 50) {
    const cockpit = COCKPIT_OPTIONS.find(
      (c) => c.id === (design.cockpitType ?? 'cockpit')
    )!;
    bridgeTons = cockpit.tons;
    bridgeCost = cockpit.cost;
  } else {
    bridgeTons = getBridgeTons(design.tonnage);
    bridgeCost = calculateBridgeCost(
      design.tonnage,
      design.holographicControls
    );
  }

  // ── Step 6: Computer ──────────────────────────────────────────────
  const computerCost = calculateComputerCost(computer, design.computerBis);
  if (design.techLevel < computer.tl) {
    errors.push(
      `${computer.name} requires TL${computer.tl}, ship is TL${design.techLevel}.`
    );
  }

  // ── Step 7: Sensors ───────────────────────────────────────────────
  const sensorTons = sensorSuite.tons;
  const sensorCost = sensorSuite.cost;
  const sensorStationTons =
    design.additionalSensorStations * SENSOR_STATION_TONS;
  const sensorStationCost =
    design.additionalSensorStations * SENSOR_STATION_COST;

  if (design.techLevel < sensorSuite.tl) {
    errors.push(
      `${sensorSuite.name} sensors require TL${sensorSuite.tl}, ship is TL${design.techLevel}.`
    );
  }

  // ── Step 8: Weapons ───────────────────────────────────────────────
  const hardpoints = calculateHardpoints(design.tonnage);
  const firmpoints = calculateFirmpoints(design.tonnage);

  let weaponsTons = 0;
  let weaponsCostMCr = 0;
  let weaponsPower = 0;
  let usedHardpoints = 0;
  let usedFirmpoints = 0;

  for (const installation of design.weapons) {
    const mount = WEAPON_MOUNTS.find(
      (m) => m.id === installation.mountType
    );
    if (!mount) {
      errors.push(`Unknown weapon mount type: ${installation.mountType}`);
      continue;
    }

    const weaponDefs = installation.weapons
      .map((wId) => TURRET_WEAPONS.find((w) => w.id === wId))
      .filter(Boolean) as typeof TURRET_WEAPONS;

    if (weaponDefs.length > mount.maxWeapons) {
      errors.push(
        `${mount.name} can hold max ${mount.maxWeapons} weapons, but ${weaponDefs.length} installed.`
      );
    }

    weaponsTons += calculateWeaponInstallationTons(mount, weaponDefs);
    weaponsCostMCr += calculateWeaponInstallationCostMCr(mount, weaponDefs);
    weaponsPower += calculateWeaponInstallationPower(mount, weaponDefs);

    if (installation.isFirmpoint) {
      usedFirmpoints++;
    } else {
      usedHardpoints++;
    }
  }

  const weaponsCost = weaponsCostMCr * 1_000_000;

  if (usedHardpoints > hardpoints) {
    errors.push(
      `Using ${usedHardpoints} hardpoints but only ${hardpoints} available.`
    );
  }
  if (usedFirmpoints > firmpoints) {
    errors.push(
      `Using ${usedFirmpoints} firmpoints but only ${firmpoints} available.`
    );
  }

  // ── Step 9: Equipment ─────────────────────────────────────────────
  let equipmentTons = 0;
  let equipmentCost = 0;
  let equipmentPower = 0;

  for (const inst of design.equipment) {
    const equip = getEquipment(inst.equipmentId);
    if (!equip) {
      errors.push(`Unknown equipment: ${inst.equipmentId}`);
      continue;
    }
    if (design.techLevel < equip.tl) {
      errors.push(
        `${equip.name} requires TL${equip.tl}, ship is TL${design.techLevel}.`
      );
    }
    equipmentTons += calculateEquipmentTons(
      equip,
      design.tonnage,
      inst.tons,
      inst.quantity
    );
    equipmentCost += calculateEquipmentCost(
      equip,
      design.tonnage,
      inst.tons,
      inst.quantity
    );
    equipmentPower += calculateEquipmentPower(
      equip,
      design.tonnage,
      inst.tons,
      inst.quantity
    );
  }

  // ── Step 11: Staterooms ───────────────────────────────────────────
  const stateroomTons = calculateStateroomTons(
    design.standardStaterooms,
    design.highStaterooms,
    design.luxuryStaterooms
  );
  const stateroomCost = calculateStateroomCost(
    design.standardStaterooms,
    design.highStaterooms,
    design.luxuryStaterooms
  );

  const lowBerthTons = calculateLowBerthTons(design.lowBerths);
  const lowBerthCost = calculateLowBerthCost(design.lowBerths);
  const lowBerthPower = calculateLowBerthPower(design.lowBerths);

  const commonAreaTons = design.commonAreaTons;
  const commonAreaCost = calculateCommonAreaCost(commonAreaTons);

  // ── Step 12: Cargo ────────────────────────────────────────────────
  const cargoTons = design.cargoTons;

  // ── Tonnage Totals ────────────────────────────────────────────────
  const totalTonnageUsed =
    hullArmorTons +
    hullOptionsTons +
    manoeuvreDriveTons +
    jumpDriveTons +
    powerPlantTons +
    fuelTons +
    bridgeTons +
    sensorTons +
    sensorStationTons +
    weaponsTons +
    equipmentTons +
    stateroomTons +
    lowBerthTons +
    commonAreaTons +
    cargoTons;

  const remainingTonnage = design.tonnage - totalTonnageUsed;

  if (remainingTonnage < 0) {
    errors.push(
      `Ship is ${Math.abs(remainingTonnage)} tons over capacity (${totalTonnageUsed}/${design.tonnage} tons used).`
    );
  } else if (remainingTonnage > 0) {
    warnings.push(
      `${remainingTonnage} tons unallocated. Consider adding cargo space or additional equipment.`
    );
  }

  // ── Cost Totals ───────────────────────────────────────────────────
  const totalCost =
    hullCost +
    hullOptionsCost +
    armorCost +
    manoeuvreDriveCost +
    jumpDriveCost +
    powerPlantCost +
    bridgeCost +
    computerCost +
    sensorCost +
    sensorStationCost +
    weaponsCost +
    equipmentCost +
    stateroomCost +
    lowBerthCost +
    commonAreaCost;

  // ── Power Budget ──────────────────────────────────────────────────
  const pBasic = powerForBasicSystems(design.tonnage);
  const pManoeuvre = powerForManoeuvreDrive(
    design.tonnage,
    design.manoeuvreRating
  );
  const pJump = powerForJumpDrive(design.tonnage, design.jumpRating);
  const pSensors = sensorSuite.power;
  const pWeapons = weaponsPower;
  const pEquipment = equipmentPower + lowBerthPower;

  const totalPowerRequired =
    pBasic + pManoeuvre + pJump + pSensors + pWeapons + pEquipment;
  const powerSurplus = totalPowerGenerated - totalPowerRequired;

  if (totalPowerGenerated < pBasic + pManoeuvre) {
    errors.push(
      'Power plant cannot supply basic systems and manoeuvre drive simultaneously.'
    );
  } else if (powerSurplus < 0) {
    warnings.push(
      `Power deficit of ${Math.abs(powerSurplus)} — some systems will need to be off-lined during jump.`
    );
  }

  // ── Step 10: Crew ─────────────────────────────────────────────────
  const drivesAndPPTons =
    manoeuvreDriveTons + jumpDriveTons + powerPlantTons;

  const turretCount = design.weapons.filter(
    (w) => w.mountType !== 'fixed_mount'
  ).length;

  // Estimate passenger capacity (high/middle/low)
  const totalPassengerCapacity =
    design.highStaterooms +
    design.luxuryStaterooms +
    design.lowBerths;

  // For crew calc, we need to estimate total crew + passengers
  // We'll do a first pass without medics then adjust
  const prelimCrew = calculateCrewRequirements(
    design.jumpRating > 0,
    drivesAndPPTons,
    turretCount,
    0, // will recalculate
    design.highStaterooms + design.luxuryStaterooms,
    0 // middle passengers — standard staterooms minus crew staterooms
  );

  const prelimTotalCrew = Object.values(prelimCrew).reduce(
    (sum, n) => sum + n,
    0
  );

  // Recalculate with proper total
  const crewPositions = calculateCrewRequirements(
    design.jumpRating > 0,
    drivesAndPPTons,
    turretCount,
    prelimTotalCrew + totalPassengerCapacity,
    design.highStaterooms + design.luxuryStaterooms,
    0
  );

  const totalCrew = Object.values(crewPositions).reduce(
    (sum, n) => sum + n,
    0
  );
  const monthlySalaries = calculateMonthlySalaries(crewPositions);

  // ── Step 13: Maintenance ──────────────────────────────────────────
  const maintenanceCostPerYear = totalCost / 1000;
  const maintenanceCostPerMonth = maintenanceCostPerYear / 12;

  // ── Validation ────────────────────────────────────────────────────
  const isValid = errors.length === 0;

  return {
    // Tonnage
    hullArmorTons,
    manoeuvreDriveTons,
    jumpDriveTons,
    powerPlantTons,
    fuelTons,
    bridgeTons,
    sensorTons,
    sensorStationTons,
    weaponsTons,
    equipmentTons,
    stateroomTons,
    lowBerthTons,
    commonAreaTons,
    cargoTons,
    totalTonnageUsed,
    remainingTonnage,

    // Cost
    hullCost,
    armorCost,
    manoeuvreDriveCost,
    jumpDriveCost,
    powerPlantCost,
    bridgeCost,
    computerCost,
    sensorCost,
    sensorStationCost,
    weaponsCost,
    equipmentCost,
    stateroomCost,
    lowBerthCost,
    commonAreaCost,
    totalCost,

    // Hull
    hullPoints,

    // Power
    totalPowerGenerated,
    powerBasicSystems: pBasic,
    powerManoeuvreDrive: pManoeuvre,
    powerJumpDrive: pJump,
    powerSensors: pSensors,
    powerWeapons: pWeapons,
    powerEquipment: pEquipment,
    totalPowerRequired,
    powerSurplus,

    // Fuel
    jumpFuelTons: jFuel,
    powerPlantFuelTons: ppFuel,

    // Hardpoints
    hardpoints,
    firmpoints,
    usedHardpoints,
    usedFirmpoints,

    // Crew
    crewPositions,
    totalCrew,
    monthlySalaries,

    // Operations
    maintenanceCostPerYear,
    maintenanceCostPerMonth,

    // Validation
    isValid,
    validationErrors: errors,
    validationWarnings: warnings,
  };
}

// ═══════════════════════════════════════════════════════════════════════
//  DEFAULT / EMPTY DESIGN
// ═══════════════════════════════════════════════════════════════════════

/** Create a blank ship design with sensible defaults */
export function createEmptyShipDesign(): ShipDesign {
  return {
    name: 'New Ship',
    techLevel: 12,
    tonnage: 100,
    hullConfiguration: 'standard',
    specialisedHull: 'none',
    hullOptions: [],
    armorProtection: 0,
    manoeuvreRating: 1,
    jumpRating: 1,
    isReactionDrive: false,
    powerPlantTier: 'fusion_tl12',
    powerPlantTons: 4,
    additionalFuelWeeks: 0,
    useCockpit: false,
    holographicControls: false,
    computerId: 'computer_10',
    computerBis: false,
    sensorSuiteId: 'civilian',
    additionalSensorStations: 0,
    weapons: [],
    equipment: [],
    standardStaterooms: 2,
    doubleOccupancyStaterooms: 0,
    highStaterooms: 0,
    luxuryStaterooms: 0,
    lowBerths: 0,
    commonAreaTons: 2,
    cargoTons: 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════
//  FORMATTING HELPERS
// ═══════════════════════════════════════════════════════════════════════

/** Format a Credit amount with commas and Cr prefix */
export function formatCredits(amount: number): string {
  if (amount >= 1_000_000) {
    const mcr = amount / 1_000_000;
    return mcr % 1 === 0 ? `MCr${mcr}` : `MCr${mcr.toFixed(2)}`;
  }
  return `Cr${amount.toLocaleString()}`;
}

/** Format tonnage with "tons" suffix */
export function formatTons(tons: number): string {
  return `${tons} ton${tons !== 1 ? 's' : ''}`;
}

/** Calculate construction time in days (1 day per MCr) */
export function constructionTimeDays(totalCostCredits: number): number {
  return Math.ceil(totalCostCredits / 1_000_000);
}
