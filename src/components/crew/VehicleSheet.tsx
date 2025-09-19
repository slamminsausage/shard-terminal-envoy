import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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

const VehicleSheet = () => {
  const [shipInfo, setShipInfo] = useState({
    name: "",
    className: "",
    hullPoints: "",
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
  const [criticalHits, setCriticalHits] = useState(() =>
    CRITICAL_TRACKS.map(track => ({
      label: track.label,
      boxes: Array(track.boxes).fill(false)
    }))
  );

  const updateShipInfo = (field: keyof typeof shipInfo, value: string) => {
    setShipInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateSoftware = (index: number, value: string) => {
    setSoftwarePackages(prev => prev.map((entry, idx) => (idx === index ? value : entry)));
  };

  const updateSystem = (index: number, value: string) => {
    setSystems(prev => prev.map((entry, idx) => (idx === index ? value : entry)));
  };

  const updateSensor = (index: number, field: "type" | "dm", value: string) => {
    setSensors(prev => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
  };

  const updatePowerRequirement = (index: number, value: string) => {
    setPowerRequirements(prev => prev.map((entry, idx) => (idx === index ? { ...entry, value } : entry)));
  };

  const updateWeaponRow = (index: number, field: keyof WeaponEntry, value: string) => {
    setWeapons(prev => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
  };

  const updateCargoRow = (index: number, field: keyof CargoEntry, value: string) => {
    setCargo(prev => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
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

  return (
    <div className="space-y-8 text-sm max-h-[80vh] overflow-y-auto">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TextField label="Ship's Name" value={shipInfo.name} onChange={value => updateShipInfo("name", value)} />
        <TextField label="Class" value={shipInfo.className} onChange={value => updateShipInfo("className", value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Hull Points" value={shipInfo.hullPoints} onChange={value => updateShipInfo("hullPoints", value)} />
          <TextField label="Armour" value={shipInfo.armour} onChange={value => updateShipInfo("armour", value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Power Points" value={shipInfo.powerPoints} onChange={value => updateShipInfo("powerPoints", value)} />
          <TextField label="Software Bandwidth" value={shipInfo.softwareBandwidth} onChange={value => updateShipInfo("softwareBandwidth", value)} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Ship's Computer</h2>
          <div className="space-y-2">
            {softwarePackages.map((entry, index) => (
              <Input key={index} value={entry} onChange={event => updateSoftware(index, event.target.value)} className="h-8" placeholder="Software Package" />
            ))}
          </div>
        </div>
        <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Power Requirement</h2>
          <div className="space-y-2">
            {powerRequirements.map((entry, index) => (
              <div key={entry.label} className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wide">{entry.label}</span>
                <Input value={entry.value} onChange={event => updatePowerRequirement(index, event.target.value)} className="h-8 w-24 text-center" />
              </div>
            ))}
          </div>
        </div>
        <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Sensors</h2>
          {sensors.map((entry, index) => (
            <div key={index} className="grid grid-cols-[2fr_1fr] gap-2">
              <Input value={entry.type} onChange={event => updateSensor(index, "type", event.target.value)} placeholder="Type" className="h-8" />
              <Input value={entry.dm} onChange={event => updateSensor(index, "dm", event.target.value)} placeholder="DM" className="h-8" />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setSensors(prev => [...prev, { type: "", dm: "" }])}>Add Sensor</Button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Systems</h2>
          {systems.map((entry, index) => (
            <Input key={index} value={entry} onChange={event => updateSystem(index, event.target.value)} placeholder="System" className="h-8" />
          ))}
        </div>
        <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Drives</h2>
          <TextField label="Manoeuvre Drive Thrust" value={drives.manoeuvreThrust} onChange={value => setDrives(prev => ({ ...prev, manoeuvreThrust: value }))} />
          <TextField label="Reaction Drive Thrust" value={drives.reactionThrust} onChange={value => setDrives(prev => ({ ...prev, reactionThrust: value }))} />
          <TextField label="Jump Drive Jump" value={drives.jumpDriveJump} onChange={value => setDrives(prev => ({ ...prev, jumpDriveJump: value }))} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Costs</h2>
          <TextField label="Fuel (Full Tank) Cost" value={shipInfo.fuelCost} onChange={value => updateShipInfo("fuelCost", value)} />
          <TextField label="Mortgage" value={shipInfo.mortgage} onChange={value => updateShipInfo("mortgage", value)} />
          <TextField label="Life Support" value={shipInfo.lifeSupport} onChange={value => updateShipInfo("lifeSupport", value)} />
          <TextField label="Salaries" value={shipInfo.salaries} onChange={value => updateShipInfo("salaries", value)} />
          <TextField label="Cost per Maintenance Period" value={shipInfo.maintenanceCost} onChange={value => updateShipInfo("maintenanceCost", value)} />
        </div>
        <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Critical Hits</h2>
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
      </section>

      <section className="border border-primary/30 bg-card/30">
        <div className="p-4 border-b border-primary/20">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Weapons</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-primary/20 text-primary-foreground">
              <tr>
                {['Weapon', 'Mount', 'TL', 'Range', 'Damage', 'Ammunition', 'Traits'].map(header => (
                  <th key={header} className="px-2 py-1 text-left uppercase tracking-wide font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weapons.map((entry, index) => (
                <tr key={index} className="border-t border-primary/20">
                  {(['weapon', 'mount', 'tl', 'range', 'damage', 'ammunition', 'traits'] as (keyof WeaponEntry)[]).map(field => (
                    <td key={String(field)} className="p-1">
                      <Input
                        className="h-8"
                        value={entry[field]}
                        onChange={event => updateWeaponRow(index, field, event.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-primary/30 bg-card/30">
        <div className="p-4 border-b border-primary/20">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Cargo Hold Content</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {cargo.map((entry, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                value={entry.description}
                onChange={event => updateCargoRow(index, "description", event.target.value)}
                placeholder="Description"
                className="h-8 flex-1"
              />
              <Input
                value={entry.tons}
                onChange={event => updateCargoRow(index, "tons", event.target.value)}
                placeholder="Tons"
                className="h-8 w-24 text-center"
              />
            </div>
          ))}
        </div>
      </section>
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
  <label className={`flex flex-col gap-1 text-xs uppercase tracking-wide ${className}`}>
    <span>{label}</span>
    <Input value={value} onChange={event => onChange(event.target.value)} className="h-8" />
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
