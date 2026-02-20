import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCampaign } from "@/contexts/CampaignContext";
import { Vehicle } from "@/types/database";
import { rollDamageExpression } from "@/lib/dice";
import { TURRET_WEAPONS, WEAPON_MOUNTS } from "@/data/shipConstruction/weapons";
import { ALL_SOFTWARE, STANDARD_SOFTWARE, JUMP_CONTROL_SOFTWARE, COMBAT_SOFTWARE, UTILITY_SOFTWARE } from "@/data/shipConstruction/software";
import { SENSOR_SUITES } from "@/data/shipConstruction/bridges";
import { SPACECRAFT_EQUIPMENT } from "@/data/shipConstruction/equipment";
import { X, Plus } from "lucide-react";

interface PowerRequirementEntry {
  label: string;
  value: string;
}

interface WeaponEntry {
  weapon: string;
  mount: string;
  tl: string;
  range: string;
  damage: string;
  ammunition: string;
  traits: string;
}

interface CargoEntry {
  description: string;
  tons: string;
}

interface CriticalTrack {
  label: string;
  boxes: number;
}

const POWER_REQUIREMENT_FIELDS: PowerRequirementEntry[] = [
  { label: "Basic Ship Systems", value: "" },
  { label: "Maneouvre Drive", value: "" },
  { label: "Jump Drive", value: "" },
  { label: "Sensors", value: "" },
  { label: "Weapons", value: "" }
];

const DEFAULT_WEAPONS: WeaponEntry[] = Array.from({ length: 4 }, () => ({
  weapon: "",
  mount: "",
  tl: "",
  range: "",
  damage: "",
  ammunition: "",
  traits: ""
}));

const DEFAULT_CARGO: CargoEntry[] = Array.from({ length: 6 }, () => ({
  description: "",
  tons: ""
}));

const CRITICAL_TRACKS: CriticalTrack[] = [
  { label: "Armour", boxes: 6 },
  { label: "Bridge", boxes: 6 },
  { label: "Cargo", boxes: 6 },
  { label: "Crew", boxes: 6 },
  { label: "Fuel", boxes: 6 },
  { label: "Hull", boxes: 6 },
  { label: "J-Drive", boxes: 6 },
  { label: "M-Drive", boxes: 6 },
  { label: "Power Plant", boxes: 6 },
  { label: "Sensors", boxes: 6 },
  { label: "Weapons", boxes: 6 }
];

// Group equipment by category for the dropdown
const EQUIPMENT_BY_CATEGORY = SPACECRAFT_EQUIPMENT.reduce((acc, equip) => {
  const cat = equip.category;
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(equip);
  return acc;
}, {} as Record<string, typeof SPACECRAFT_EQUIPMENT>);

const EQUIPMENT_CATEGORY_LABELS: Record<string, string> = {
  cargo: "Cargo",
  fuel: "Fuel Systems",
  defense: "Defense",
  drones: "Drones",
  science: "Science & Medical",
  accommodation: "Accommodation",
  operations: "Operations",
  stealth: "Stealth",
};

interface VehicleSheetProps {
  vehicleId?: string;
}

const VehicleSheet = ({ vehicleId }: VehicleSheetProps) => {
  const { saveVehicle, vehicles } = useCampaign();
  const [currentVehicleId, setCurrentVehicleId] = useState<string | undefined>(vehicleId);
  const [shipInfo, setShipInfo] = useState({
    name: "",
    className: "",
    hullPoints: "",
    currentHullPoints: "",
    armour: "",
    powerPoints: "",
    softwareBandwidth: "",
    fuelCost: "",
    mortgage: "",
    lifeSupport: "",
    salaries: "",
    maintenanceCost: ""
  });

  const [softwarePackages, setSoftwarePackages] = useState<string[]>(Array.from({ length: 7 }, () => ""));
  const [systems, setSystems] = useState<string[]>(Array.from({ length: 8 }, () => ""));
  const [drives, setDrives] = useState({
    manoeuvreThrust: "",
    reactionThrust: "",
    jumpDriveJump: ""
  });
  const [sensors, setSensors] = useState([{ type: "", dm: "" }]);
  const [powerRequirements, setPowerRequirements] = useState(POWER_REQUIREMENT_FIELDS);
  const [weapons, setWeapons] = useState(DEFAULT_WEAPONS);
  const [cargo, setCargo] = useState(DEFAULT_CARGO);
  const [lastWeaponRollLog, setLastWeaponRollLog] = useState<string>("");
  const [criticalHits, setCriticalHits] = useState(() =>
    CRITICAL_TRACKS.map(track => ({
      label: track.label,
      boxes: Array(track.boxes).fill(false)
    }))
  );

  // Load existing vehicle data when vehicleId is provided
  useEffect(() => {
    if (vehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        setCurrentVehicleId(vehicle.id);
        // Get hullCurrent from database field (with fallback to specifications for backward compat)
        const specs = vehicle.specifications && typeof vehicle.specifications === 'object'
          ? vehicle.specifications as any
          : {};
        const hullCurrentValue = vehicle.hull_current ?? specs.hullCurrent ?? vehicle.hull;

        setShipInfo({
          name: vehicle.name || "",
          className: vehicle.class_type || "",
          hullPoints: vehicle.hull?.toString() || "",
          currentHullPoints: hullCurrentValue?.toString() || vehicle.hull?.toString() || "",
          armour: vehicle.armor?.toString() || "",
          powerPoints: vehicle.power_plant?.toString() || "",
          softwareBandwidth: vehicle.computer_rating?.toString() || "",
          fuelCost: vehicle.cost?.toString() || "",
          mortgage: vehicle.maintenance_cost?.toString() || "",
          lifeSupport: vehicle.life_support?.toString() || "",
          salaries: vehicle.salaries?.toString() || "",
          maintenanceCost: vehicle.maintenance_cost?.toString() || ""
        });

        if (specs.software) setSoftwarePackages(specs.software);
        if (specs.systems) setSystems(specs.systems);
        if (specs.sensors) setSensors(specs.sensors);
        if (specs.powerRequirements) setPowerRequirements(specs.powerRequirements);
        if (specs.cargo) setCargo(specs.cargo);
        if (specs.criticalHits) setCriticalHits(specs.criticalHits);

        // Load weapons from database
        if (vehicle.weapons && Array.isArray(vehicle.weapons)) {
          setWeapons(vehicle.weapons as WeaponEntry[]);
        } else if (Array.isArray(vehicle.weapons)) {
          // Handle if weapons is stored as object with array values
          const weaponsArray = Object.values(vehicle.weapons);
          if (weaponsArray.length > 0 && typeof weaponsArray[0] === 'object') {
            setWeapons(weaponsArray as WeaponEntry[]);
          }
        }

        setDrives({
          manoeuvreThrust: vehicle.maneuver_drive?.toString() || "",
          reactionThrust: vehicle.acceleration?.toString() || "",
          jumpDriveJump: vehicle.jump_drive?.toString() || ""
        });
      }
    }
  }, [vehicleId, vehicles]);

  const updateShipInfo = (field: keyof typeof shipInfo, value: string) => {
    setShipInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateSoftware = (index: number, value: string) => {
    setSoftwarePackages(prev => prev.map((entry, idx) => (idx === index ? value : entry)));
  };

  const removeSoftware = (index: number) => {
    setSoftwarePackages(prev => prev.filter((_, idx) => idx !== index));
  };

  const addSoftwareSlot = () => {
    setSoftwarePackages(prev => [...prev, ""]);
  };

  const updateSystem = (index: number, value: string) => {
    setSystems(prev => prev.map((entry, idx) => (idx === index ? value : entry)));
  };

  const removeSystem = (index: number) => {
    setSystems(prev => prev.filter((_, idx) => idx !== index));
  };

  const addSystemSlot = () => {
    setSystems(prev => [...prev, ""]);
  };

  const updateSensor = (index: number, field: "type" | "dm", value: string) => {
    setSensors(prev => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
  };

  const handleSensorSelect = (index: number, sensorId: string) => {
    const suite = SENSOR_SUITES.find(s => s.id === sensorId);
    if (suite) {
      setSensors(prev => prev.map((entry, idx) =>
        idx === index ? { type: suite.name, dm: suite.dm.toString() } : entry
      ));
    }
  };

  const removeSensor = (index: number) => {
    setSensors(prev => prev.filter((_, idx) => idx !== index));
  };

  const updatePowerRequirement = (index: number, value: string) => {
    setPowerRequirements(prev => prev.map((entry, idx) => (idx === index ? { ...entry, value } : entry)));
  };

  const updateWeaponRow = (index: number, field: keyof WeaponEntry, value: string) => {
    setWeapons(prev => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
  };

  const handleWeaponSelect = (index: number, weaponId: string) => {
    const weaponDef = TURRET_WEAPONS.find(w => w.id === weaponId);
    if (weaponDef) {
      setWeapons(prev => prev.map((entry, idx) =>
        idx === index ? {
          ...entry,
          weapon: weaponDef.name,
          tl: weaponDef.tl.toString(),
          range: weaponDef.range,
          damage: weaponDef.damage,
          traits: weaponDef.traits.join(', '),
          ammunition: weaponDef.id === 'missile_rack' ? '12' : weaponDef.id === 'sandcaster' ? '20' : '',
        } : entry
      ));
    }
  };

  const handleMountSelect = (index: number, mountId: string) => {
    const mountDef = WEAPON_MOUNTS.find(m => m.id === mountId);
    if (mountDef) {
      setWeapons(prev => prev.map((entry, idx) =>
        idx === index ? { ...entry, mount: mountDef.name } : entry
      ));
    }
  };

  const addWeaponSlot = () => {
    setWeapons(prev => [...prev, { weapon: "", mount: "", tl: "", range: "", damage: "", ammunition: "", traits: "" }]);
  };

  const removeWeapon = (index: number) => {
    setWeapons(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateCargoRow = (index: number, field: keyof CargoEntry, value: string) => {
    setCargo(prev => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
  };

  const handleSaveVehicle = async () => {
    try {
      const hullMax = parseInt(shipInfo.hullPoints) || 1;
      const hullCurrent = parseInt(shipInfo.currentHullPoints) || hullMax;
      const vehicleData = {
        ...(currentVehicleId && { id: currentVehicleId }),
        name: shipInfo.name,
        vehicle_type: 'Ship',
        class_type: shipInfo.className,
        tech_level: 10,
        tonnage: 100,
        cost: parseInt(shipInfo.fuelCost) || 0,
        hull: hullMax,
        hull_current: hullCurrent,
        structure: 1,
        armor: parseInt(shipInfo.armour) || 0,
        maneuver_drive: parseInt(drives.manoeuvreThrust) || 1,
        jump_drive: parseInt(drives.jumpDriveJump) || 1,
        power_plant: parseInt(shipInfo.powerPoints) || 1,
        acceleration: parseInt(drives.reactionThrust) || 1,
        top_speed: 0,
        jump_rating: parseInt(drives.jumpDriveJump) || 1,
        fuel_capacity: 10,
        cargo_capacity: 10,
        passenger_capacity: 0,
        weapons: weapons,
        screens: {},
        computer_rating: parseInt(shipInfo.softwareBandwidth) || 5,
        sensors: 1,
        communications: 1,
        maintenance_cost: parseInt(shipInfo.maintenanceCost) || 0,
        life_support: parseInt(shipInfo.lifeSupport) || 0,
        salaries: parseInt(shipInfo.salaries) || 0,
        crew_requirements: {},
        specifications: {
          software: softwarePackages,
          systems: systems,
          sensors: sensors,
          powerRequirements: powerRequirements,
          cargo: cargo,
          criticalHits: criticalHits,
        },
      };

      const savedVehicle = await saveVehicle(vehicleData);
      if (savedVehicle && !currentVehicleId) {
        setCurrentVehicleId(savedVehicle.id);
      }
    } catch (error) {
      console.error('Failed to save vehicle:', error);
    }
  };

  const toggleCriticalHit = (trackIndex: number, boxIndex: number) => {
    setCriticalHits(prev =>
      prev.map((track, idx) => {
        if (idx !== trackIndex) return track;
        const boxes = track.boxes.slice();
        boxes[boxIndex] = !boxes[boxIndex];
        return { ...track, boxes };
      })
    );
  };

  const handleWeaponDamageRoll = (index: number) => {
    const weapon = weapons[index];
    if (!weapon || !weapon.damage) return;
    const result = rollDamageExpression(weapon.damage, 0);
    setLastWeaponRollLog(
      `Damage Roll: ${weapon.weapon || "Weapon"} ${weapon.damage} -> ${result.total} (dice ${
        result.diceResults.join("+") || "0"
      }${result.modifier ? ` ${result.modifier >= 0 ? "+" : ""}${result.modifier}` : ""})`
    );
  };

  const addCargoSlot = () => {
    setCargo(prev => [...prev, { description: "", tons: "" }]);
  };

  // Find matching sensor suite ID from a sensor type name (for backward compat)
  const findSensorSuiteId = (typeName: string): string => {
    const suite = SENSOR_SUITES.find(s => s.name === typeName || s.id === typeName);
    return suite?.id || "";
  };

  // Find matching weapon ID from a weapon name (for backward compat)
  const findWeaponId = (weaponName: string): string => {
    const weapon = TURRET_WEAPONS.find(w => w.name === weaponName || w.id === weaponName);
    return weapon?.id || "";
  };

  // Find matching mount ID from a mount name (for backward compat)
  const findMountId = (mountName: string): string => {
    const mount = WEAPON_MOUNTS.find(m => m.name === mountName || m.id === mountName);
    return mount?.id || "";
  };

  // Find matching software ID from a software name (for backward compat)
  const findSoftwareId = (softwareName: string): string => {
    const sw = ALL_SOFTWARE.find(s => s.name === softwareName || s.id === softwareName);
    return sw?.id || "";
  };

  // Find matching equipment ID from an equipment name (for backward compat)
  const findEquipmentId = (equipmentName: string): string => {
    const equip = SPACECRAFT_EQUIPMENT.find(e => e.name === equipmentName || e.id === equipmentName);
    return equip?.id || "";
  };

  return (
    <div className="space-y-6 text-sm max-h-[80vh] overflow-y-auto pb-20 font-mono">
      <section className="panel">
        <div className="panel-header">
          <span className="panel-title">SHIP INFORMATION</span>
        </div>
        <div className="panel-content grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TextField label="Ship's Name" value={shipInfo.name} onChange={value => updateShipInfo("name", value)} />
          <TextField label="Class" value={shipInfo.className} onChange={value => updateShipInfo("className", value)} />
          <div className="grid grid-cols-3 gap-3">
            <TextField label="Hull Points (Max)" value={shipInfo.hullPoints} onChange={value => updateShipInfo("hullPoints", value)} />
            <TextField label="Current Hull" value={shipInfo.currentHullPoints} onChange={value => updateShipInfo("currentHullPoints", value)} />
            <TextField label="Armour" value={shipInfo.armour} onChange={value => updateShipInfo("armour", value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Power Points" value={shipInfo.powerPoints} onChange={value => updateShipInfo("powerPoints", value)} />
            <TextField label="Software Bandwidth" value={shipInfo.softwareBandwidth} onChange={value => updateShipInfo("softwareBandwidth", value)} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOFTWARE - Dropdown selection */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">SHIP'S COMPUTER</span>
          </div>
          <div className="panel-content space-y-2">
            {softwarePackages.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <Select
                  value={findSoftwareId(entry) || "__custom__"}
                  onValueChange={(val) => {
                    if (val === "__custom__") return;
                    const sw = ALL_SOFTWARE.find(s => s.id === val);
                    if (sw) updateSoftware(index, sw.name);
                  }}
                >
                  <SelectTrigger className="h-8 flex-1 text-xs">
                    <SelectValue placeholder="Select Software">
                      {entry || "Select Software"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Standard (Included)</SelectLabel>
                      {STANDARD_SOFTWARE.map(sw => (
                        <SelectItem key={sw.id} value={sw.id} className="text-xs">
                          {sw.name} <span className="text-muted-foreground ml-1">TL{sw.tl}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Jump Control</SelectLabel>
                      {JUMP_CONTROL_SOFTWARE.map(sw => (
                        <SelectItem key={sw.id} value={sw.id} className="text-xs">
                          {sw.name} <span className="text-muted-foreground ml-1">TL{sw.tl} | P:{sw.processing}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Combat</SelectLabel>
                      {COMBAT_SOFTWARE.map(sw => (
                        <SelectItem key={sw.id} value={sw.id} className="text-xs">
                          {sw.name} <span className="text-muted-foreground ml-1">TL{sw.tl} | P:{sw.processing}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Utility</SelectLabel>
                      {UTILITY_SOFTWARE.map(sw => (
                        <SelectItem key={sw.id} value={sw.id} className="text-xs">
                          {sw.name} <span className="text-muted-foreground ml-1">TL{sw.tl} | P:{sw.processing}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <button
                  className="text-primary/50 hover:text-destructive p-1"
                  onClick={() => removeSoftware(index)}
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button className="terminal-btn w-full flex items-center justify-center gap-1" onClick={addSoftwareSlot}>
              <Plus className="w-3 h-3" /> Add Software
            </button>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">POWER REQUIREMENT</span>
          </div>
          <div className="panel-content space-y-2">
            {powerRequirements.map((entry, index) => (
              <div key={entry.label} className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wide">{entry.label}</span>
                <Input value={entry.value} onChange={event => updatePowerRequirement(index, event.target.value)} className="h-8 w-24 text-center" />
              </div>
            ))}
          </div>
        </div>

        {/* SENSORS - Dropdown selection */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">SENSORS</span>
          </div>
          <div className="panel-content space-y-2">
            {sensors.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="grid grid-cols-[2fr_1fr] gap-2 flex-1">
                  <Select
                    value={findSensorSuiteId(entry.type) || "__custom__"}
                    onValueChange={(val) => {
                      if (val === "__custom__") return;
                      handleSensorSelect(index, val);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Sensor">
                        {entry.type || "Select Sensor"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SENSOR_SUITES.map(suite => (
                        <SelectItem key={suite.id} value={suite.id} className="text-xs">
                          {suite.name} <span className="text-muted-foreground ml-1">TL{suite.tl} | DM{suite.dm >= 0 ? '+' : ''}{suite.dm}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input value={entry.dm} onChange={event => updateSensor(index, "dm", event.target.value)} placeholder="DM" className="terminal-input h-8" />
                </div>
                <button
                  className="text-primary/50 hover:text-destructive p-1"
                  onClick={() => removeSensor(index)}
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button className="terminal-btn w-full flex items-center justify-center gap-1" onClick={() => setSensors(prev => [...prev, { type: "", dm: "" }])}>
              <Plus className="w-3 h-3" /> Add Sensor
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SYSTEMS/EQUIPMENT - Dropdown selection */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">SYSTEMS</span>
          </div>
          <div className="panel-content space-y-2">
            {systems.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <Select
                  value={findEquipmentId(entry) || "__custom__"}
                  onValueChange={(val) => {
                    if (val === "__custom__") return;
                    const equip = SPACECRAFT_EQUIPMENT.find(e => e.id === val);
                    if (equip) updateSystem(index, equip.name);
                  }}
                >
                  <SelectTrigger className="h-8 flex-1 text-xs">
                    <SelectValue placeholder="Select System">
                      {entry || "Select System"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EQUIPMENT_BY_CATEGORY).map(([cat, items]) => (
                      <SelectGroup key={cat}>
                        <SelectLabel>{EQUIPMENT_CATEGORY_LABELS[cat] || cat}</SelectLabel>
                        {items.map(equip => (
                          <SelectItem key={equip.id} value={equip.id} className="text-xs">
                            {equip.name} <span className="text-muted-foreground ml-1">TL{equip.tl}</span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  className="text-primary/50 hover:text-destructive p-1"
                  onClick={() => removeSystem(index)}
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button className="terminal-btn w-full flex items-center justify-center gap-1" onClick={addSystemSlot}>
              <Plus className="w-3 h-3" /> Add System
            </button>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">DRIVES</span>
          </div>
          <div className="panel-content space-y-3">
          <TextField label="Manoeuvre Drive Thrust" value={drives.manoeuvreThrust} onChange={value => setDrives(prev => ({ ...prev, manoeuvreThrust: value }))} />
          <TextField label="Reaction Drive Thrust" value={drives.reactionThrust} onChange={value => setDrives(prev => ({ ...prev, reactionThrust: value }))} />
          <TextField label="Jump Drive Jump" value={drives.jumpDriveJump} onChange={value => setDrives(prev => ({ ...prev, jumpDriveJump: value }))} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">COSTS</span>
          </div>
          <div className="panel-content space-y-3">
            <TextField label="Fuel (Full Tank) Cost" value={shipInfo.fuelCost} onChange={value => updateShipInfo("fuelCost", value)} />
            <TextField label="Mortgage" value={shipInfo.mortgage} onChange={value => updateShipInfo("mortgage", value)} />
            <TextField label="Life Support" value={shipInfo.lifeSupport} onChange={value => updateShipInfo("lifeSupport", value)} />
            <TextField label="Salaries" value={shipInfo.salaries} onChange={value => updateShipInfo("salaries", value)} />
            <TextField label="Cost per Maintenance Period" value={shipInfo.maintenanceCost} onChange={value => updateShipInfo("maintenanceCost", value)} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">CRITICAL HITS</span>
          </div>
          <div className="panel-content">
          <div className="grid grid-cols-2 gap-3">
            {criticalHits.map((track, trackIndex) => (
              <div key={track.label} className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wide">{track.label}</div>
                <div className="flex flex-wrap gap-1">
                  {track.boxes.map((box, boxIndex) => (
                    <CriticalBox
                      key={boxIndex}
                      checked={box}
                      onCheckedChange={() => toggleCriticalHit(trackIndex, boxIndex)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* WEAPONS - Dropdown selection for weapon type and mount */}
      <section className="panel">
        <div className="panel-header">
          <span className="panel-title">WEAPONS</span>
          {lastWeaponRollLog && (
            <div className="text-[11px] font-mono text-primary/80 mt-2">
              {lastWeaponRollLog}
            </div>
          )}
        </div>
        <div className="panel-content space-y-3">
          {weapons.map((entry, index) => (
            <div key={index} className="border border-primary/20 rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-primary/60">Weapon {index + 1}</span>
                <button
                  className="text-primary/50 hover:text-destructive p-1"
                  onClick={() => removeWeapon(index)}
                  title="Remove Weapon"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Weapon Type Dropdown */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wide text-primary/60">Weapon</span>
                  <Select
                    value={findWeaponId(entry.weapon) || "__custom__"}
                    onValueChange={(val) => {
                      if (val === "__custom__") return;
                      handleWeaponSelect(index, val);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Weapon">
                        {entry.weapon || "Select Weapon"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TURRET_WEAPONS.map(w => (
                        <SelectItem key={w.id} value={w.id} className="text-xs">
                          {w.name} <span className="text-muted-foreground ml-1">TL{w.tl} | {w.damage} | {w.range}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Mount Type Dropdown */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wide text-primary/60">Mount</span>
                  <Select
                    value={findMountId(entry.mount) || "__custom__"}
                    onValueChange={(val) => {
                      if (val === "__custom__") return;
                      handleMountSelect(index, val);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Mount">
                        {entry.mount || "Select Mount"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {WEAPON_MOUNTS.map(m => (
                        <SelectItem key={m.id} value={m.id} className="text-xs">
                          {m.name} <span className="text-muted-foreground ml-1">TL{m.tl} | Max:{m.maxWeapons}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Auto-filled stats row */}
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wide text-primary/60">TL</span>
                  <Input className="h-7 text-xs text-center" value={entry.tl} onChange={e => updateWeaponRow(index, 'tl', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wide text-primary/60">Range</span>
                  <Input className="h-7 text-xs" value={entry.range} onChange={e => updateWeaponRow(index, 'range', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wide text-primary/60">Damage</span>
                  <Input className="h-7 text-xs" value={entry.damage} onChange={e => updateWeaponRow(index, 'damage', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wide text-primary/60">Ammo</span>
                  <Input className="h-7 text-xs text-center" value={entry.ammunition} onChange={e => updateWeaponRow(index, 'ammunition', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wide text-primary/60">Traits</span>
                  <Input className="h-7 text-xs" value={entry.traits} onChange={e => updateWeaponRow(index, 'traits', e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleWeaponDamageRoll(index)}
                  disabled={!entry.damage}
                >
                  Roll Damage
                </Button>
              </div>
            </div>
          ))}
          <button className="terminal-btn w-full flex items-center justify-center gap-1" onClick={addWeaponSlot}>
            <Plus className="w-3 h-3" /> Add Weapon
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <span className="panel-title">CARGO HOLD CONTENT</span>
        </div>
        <div className="panel-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cargo.map((entry, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                value={entry.description}
                onChange={event => updateCargoRow(index, "description", event.target.value)}
                placeholder="Description"
                className="terminal-input h-8 flex-1"
              />
              <Input
                value={entry.tons}
                onChange={event => updateCargoRow(index, "tons", event.target.value)}
                placeholder="Tons"
                className="terminal-input h-8 w-24 text-center"
              />
            </div>
          ))}
          </div>
          <button className="terminal-btn w-full mt-4" onClick={addCargoSlot}>
            Add Cargo Slot
          </button>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="terminal-btn">Reset Sheet</Button>
        <Button onClick={handleSaveVehicle} className="terminal-btn primary">Save Changes</Button>
      </div>
    </div>
  );
};

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TextField = ({ label, value, onChange, className = "" }: TextFieldProps) => (
  <label className={`flex flex-col gap-1 text-xs uppercase tracking-wide text-primary/80 ${className}`}>
    <span>{label}</span>
    <Input value={value} onChange={event => onChange(event.target.value)} className="terminal-input h-8" />
  </label>
);

interface CriticalBoxProps {
  checked: boolean;
  onCheckedChange: () => void;
}

const CriticalBox = ({ checked, onCheckedChange }: CriticalBoxProps) => (
  <Checkbox checked={checked} onCheckedChange={onCheckedChange} className="w-4 h-4 border-primary" />
);

export default VehicleSheet;
