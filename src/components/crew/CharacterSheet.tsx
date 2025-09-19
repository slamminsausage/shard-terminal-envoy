import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface CharacteristicValue {
  total: string;
  current: string;
}

interface SkillState {
  proficient: boolean;
  value: string;
  customLabel?: string;
}

interface SkillDefinition {
  key: string;
  label: string;
  parentKey?: string;
  isCustomGroup?: boolean;
  customSlots?: number;
}

type ArmourRow = {
  type: string;
  rad: string;
  protection: string;
  kg: string;
  options: string;
  total: string;
};

type WeaponRow = {
  weapon: string;
  accuracy: string;
  range: string;
  damage: string;
  kg: string;
  magazine: string;
  traits: string;
};

type EquipmentRow = {
  item: string;
  mass: string;
};

type AugmentRow = {
  type: string;
  tl: string;
  improvement: string;
};

const characteristicKeys = [
  "strength",
  "dexterity",
  "endurance",
  "intellect",
  "education",
  "social",
  "psionics",
  "initiative"
] as const;

type CharacteristicKey = (typeof characteristicKeys)[number];

const defaultCharacteristics: Record<CharacteristicKey, CharacteristicValue> = characteristicKeys.reduce(
  (acc, key) => {
    acc[key] = { total: "", current: "" };
    return acc;
  },
  {} as Record<CharacteristicKey, CharacteristicValue>
);

const skillDefinitions: SkillDefinition[] = [
  { key: "admin", label: "Admin" },
  { key: "advocate", label: "Advocate" },
  { key: "animals", label: "Animals" },
  { key: "animals_handling", label: "Animals Handling", parentKey: "animals" },
  { key: "animals_training", label: "Animals Training", parentKey: "animals" },
  { key: "animals_veterinary", label: "Animals Veterinary", parentKey: "animals" },
  { key: "art", label: "Art" },
  { key: "art_performer", label: "Art Performer", parentKey: "art" },
  { key: "art_holography", label: "Art Holography", parentKey: "art" },
  { key: "art_instrument", label: "Art Instrument", parentKey: "art" },
  { key: "art_visual_media", label: "Art Visual Media", parentKey: "art" },
  { key: "art_write", label: "Art Write", parentKey: "art" },
  { key: "astrogation", label: "Astrogation" },
  { key: "athletics", label: "Athletics" },
  { key: "athletics_dex", label: "Athletics DEX", parentKey: "athletics" },
  { key: "athletics_end", label: "Athletics END", parentKey: "athletics" },
  { key: "athletics_str", label: "Athletics STR", parentKey: "athletics" },
  { key: "broker", label: "Broker" },
  { key: "carouse", label: "Carouse" },
  { key: "deception", label: "Deception" },
  { key: "diplomat", label: "Diplomat" },
  { key: "drive", label: "Drive" },
  { key: "drive_hovercraft", label: "Drive Hovercraft", parentKey: "drive" },
  { key: "drive_mole", label: "Drive Mole", parentKey: "drive" },
  { key: "drive_track", label: "Drive Track", parentKey: "drive" },
  { key: "drive_walker", label: "Drive Walker", parentKey: "drive" },
  { key: "drive_wheel", label: "Drive Wheel", parentKey: "drive" },
  { key: "electronics", label: "Electronics" },
  { key: "electronics_comms", label: "Electronics Comms", parentKey: "electronics" },
  { key: "electronics_computers", label: "Electronics Computers", parentKey: "electronics" },
  { key: "electronics_remote_ops", label: "Electronics Remote Ops", parentKey: "electronics" },
  { key: "electronics_sensors", label: "Electronics Sensors", parentKey: "electronics" },
  { key: "engineer", label: "Engineer" },
  { key: "engineer_m_drive", label: "Engineer M-drive", parentKey: "engineer" },
  { key: "engineer_j_drive", label: "Engineer J-drive", parentKey: "engineer" },
  { key: "engineer_life_support", label: "Engineer Life Support", parentKey: "engineer" },
  { key: "engineer_power", label: "Engineer Power", parentKey: "engineer" },
  { key: "explosives", label: "Explosives" },
  { key: "flyer", label: "Flyer" },
  { key: "flyer_airship", label: "Flyer Airship", parentKey: "flyer" },
  { key: "flyer_grav", label: "Flyer Grav", parentKey: "flyer" },
  { key: "flyer_ornithopter", label: "Flyer Ornithopter", parentKey: "flyer" },
  { key: "flyer_rotor", label: "Flyer Rotor", parentKey: "flyer" },
  { key: "flyer_wing", label: "Flyer Wing", parentKey: "flyer" },
  { key: "gambler", label: "Gambler" },
  { key: "gunner", label: "Gunner" },
  { key: "gunner_turret", label: "Gunner Turret", parentKey: "gunner" },
  { key: "gunner_ortillery", label: "Gunner Ortillery", parentKey: "gunner" },
  { key: "gunner_screen", label: "Gunner Screen", parentKey: "gunner" },
  { key: "gunner_capital", label: "Gunner Capital", parentKey: "gunner" },
  { key: "gun_combat", label: "Gun Combat" },
  { key: "gun_combat_archaic", label: "Gun Combat Archaic", parentKey: "gun_combat" },
  { key: "gun_combat_energy", label: "Gun Combat Energy", parentKey: "gun_combat" },
  { key: "gun_combat_slug", label: "Gun Combat Slug", parentKey: "gun_combat" },
  { key: "heavy_weapons", label: "Heavy Weapons" },
  { key: "heavy_weapons_artillery", label: "Heavy Weapons Artillery", parentKey: "heavy_weapons" },
  { key: "heavy_weapons_portable", label: "Heavy Weapons Portable", parentKey: "heavy_weapons" },
  { key: "heavy_weapons_vehicle", label: "Heavy Weapons Vehicle", parentKey: "heavy_weapons" },
  { key: "investigate", label: "Investigate" },
  { key: "jack_of_all_trades", label: "Jack-of-All-Trades" },
  { key: "language", label: "Language", isCustomGroup: true, customSlots: 5 },
  { key: "leadership", label: "Leadership" },
  { key: "mechanic", label: "Mechanic" },
  { key: "medic", label: "Medic" },
  { key: "melee", label: "Melee" },
  { key: "melee_unarmed", label: "Melee Unarmed", parentKey: "melee" },
  { key: "melee_blade", label: "Melee Blade", parentKey: "melee" },
  { key: "melee_bludgeon", label: "Melee Bludgeon", parentKey: "melee" },
  { key: "melee_natural", label: "Melee Natural", parentKey: "melee" },
  { key: "navigation", label: "Navigation" },
  { key: "persuade", label: "Persuade" },
  { key: "pilot", label: "Pilot" },
  { key: "pilot_small_craft", label: "Pilot Small Craft", parentKey: "pilot" },
  { key: "pilot_spacecraft", label: "Pilot Spacecraft", parentKey: "pilot" },
  { key: "pilot_capital_ships", label: "Pilot Capital Ships", parentKey: "pilot" },
  { key: "profession", label: "Profession", isCustomGroup: true, customSlots: 5 },
  { key: "recon", label: "Recon" },
  { key: "science", label: "Science", isCustomGroup: true, customSlots: 5 },
  { key: "seafarer", label: "Seafarer" },
  { key: "seafarer_ocean_ships", label: "Seafarer Ocean Ships", parentKey: "seafarer" },
  { key: "seafarer_personal", label: "Seafarer Personal", parentKey: "seafarer" },
  { key: "seafarer_sail", label: "Seafarer Sail", parentKey: "seafarer" },
  { key: "seafarer_submarine", label: "Seafarer Submarine", parentKey: "seafarer" },
  { key: "stealth", label: "Stealth" },
  { key: "steward", label: "Steward" },
  { key: "streetwise", label: "Streetwise" },
  { key: "survival", label: "Survival" },
  { key: "tactics", label: "Tactics" },
  { key: "tactics_military", label: "Tactics Military", parentKey: "tactics" },
  { key: "tactics_naval", label: "Tactics Naval", parentKey: "tactics" },
  { key: "vacc_suit", label: "Vacc Suit" }
];

const baseSkillState = skillDefinitions.reduce<Record<string, SkillState>>((acc, def) => {
  if (def.isCustomGroup && def.customSlots) {
    for (let i = 1; i <= def.customSlots; i += 1) {
      const slotKey = `${def.key}_${i}`;
      acc[slotKey] = { proficient: false, value: "", customLabel: "" };
    }
  }

  if (!acc[def.key]) {
    acc[def.key] = { proficient: false, value: "" };
  }

  return acc;
}, {});

const characteristicDM = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  if (value <= 2) return -2;
  if (value <= 5) return -1;
  if (value <= 8) return 0;
  if (value <= 11) return 1;
  if (value <= 14) return 2;
  return 3;
};

const initialArmourRows: ArmourRow[] = Array.from({ length: 4 }, () => ({
  type: "",
  rad: "",
  protection: "",
  kg: "",
  options: "",
  total: ""
}));

const initialWeapons: WeaponRow[] = Array.from({ length: 4 }, () => ({
  weapon: "",
  accuracy: "",
  range: "",
  damage: "",
  kg: "",
  magazine: "",
  traits: ""
}));

const initialEquipment: EquipmentRow[] = Array.from({ length: 6 }, () => ({
  item: "",
  mass: ""
}));

const initialAugments: AugmentRow[] = Array.from({ length: 4 }, () => ({
  type: "",
  tl: "",
  improvement: ""
}));

const CharacterSheet = () => {
  const [header, setHeader] = useState({
    name: "",
    rads: "",
    age: "",
    species: "",
    speciesTraits: "",
    homeworld: ""
  });
  const [characteristics, setCharacteristics] = useState(defaultCharacteristics);
  const [armourRows, setArmourRows] = useState(initialArmourRows);
  const [finances, setFinances] = useState({
    pension: "",
    debt: "",
    cashOnHand: "",
    shipPayments: "",
    livingCost: ""
  });
  const [studyPeriod, setStudyPeriod] = useState({
    skill: "",
    weeks: "",
    complete: ""
  });
  const [notes, setNotes] = useState("");
  const [weapons, setWeapons] = useState(initialWeapons);
  const [equipment, setEquipment] = useState(initialEquipment);
  const [augments, setAugments] = useState(initialAugments);
  const [totalMass, setTotalMass] = useState("");
  const [skills, setSkills] = useState<Record<string, SkillState>>(baseSkillState);

  const jackState = skills["jack_of_all_trades"];

  const handleHeaderChange = (field: keyof typeof header, value: string) => {
    setHeader(prev => ({ ...prev, [field]: value }));
  };

  const handleCharacteristicChange = (key: CharacteristicKey, field: keyof CharacteristicValue, value: string) => {
    setCharacteristics(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const updateArmourRow = (index: number, field: keyof ArmourRow, value: string) => {
    setArmourRows(prev => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  };

  const updateWeaponRow = (index: number, field: keyof WeaponRow, value: string) => {
    setWeapons(prev => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  };

  const updateEquipmentRow = (index: number, field: keyof EquipmentRow, value: string) => {
    setEquipment(prev => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  };

  const updateAugmentRow = (index: number, field: keyof AugmentRow, value: string) => {
    setAugments(prev => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  };

  const handleSkillToggle = (key: string, checked: boolean) => {
    setSkills(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        proficient: checked,
        value: checked && prev[key]?.value === "" ? "0" : prev[key]?.value ?? ""
      }
    }));
  };

  const handleSkillValueChange = (key: string, value: string) => {
    setSkills(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }));
  };

  const handleCustomLabelChange = (key: string, label: string) => {
    setSkills(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        customLabel: label
      }
    }));
  };

  const renderSkillEntry = (def: SkillDefinition) => {
    const state = skills[def.key];
    const isSpecialisation = Boolean(def.parentKey);

    return (
      <div
        key={def.key}
        className={`flex items-center justify-between border-b border-border py-2 ${isSpecialisation ? "pl-6" : ""}`}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            checked={state?.proficient}
            onCheckedChange={checked => handleSkillToggle(def.key, Boolean(checked))}
          />
          <span
            className={
              isSpecialisation
                ? "text-xs uppercase tracking-wide text-muted-foreground"
                : "font-semibold text-sm uppercase tracking-wide"
            }
          >
            {def.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={state?.value ?? ""}
            onChange={event => handleSkillValueChange(def.key, event.target.value)}
            type="number"
            className="w-16 h-8 text-center"
          />
          <SkillDMDisplay proficient={state?.proficient ?? false} rawValue={state?.value} jackState={jackState} />
        </div>
      </div>
    );
  };

  const renderCustomGroup = (def: SkillDefinition) => {
    const baseState = skills[def.key];
    const customSlots = def.customSlots ?? 0;

    return (
      <div key={def.key} className="border-b border-border py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={baseState?.proficient}
              onCheckedChange={checked => handleSkillToggle(def.key, Boolean(checked))}
            />
            <span className="font-semibold text-sm uppercase tracking-wide">{def.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={baseState?.value ?? ""}
              onChange={event => handleSkillValueChange(def.key, event.target.value)}
              type="number"
              className="w-16 h-8 text-center"
            />
            <SkillDMDisplay proficient={baseState?.proficient ?? false} rawValue={baseState?.value} jackState={jackState} />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: customSlots }).map((_, index) => {
            const slotKey = `${def.key}_${index + 1}`;
            const state = skills[slotKey];
            return (
              <div key={slotKey} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Checkbox
                    checked={state?.proficient}
                    onCheckedChange={checked => handleSkillToggle(slotKey, Boolean(checked))}
                  />
                  <Input
                    value={state?.customLabel ?? ""}
                    onChange={event => handleCustomLabelChange(slotKey, event.target.value)}
                    placeholder={`${def.label} Specialization`}
                    className="h-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={state?.value ?? ""}
                    onChange={event => handleSkillValueChange(slotKey, event.target.value)}
                    type="number"
                    className="w-16 h-8 text-center"
                  />
                  <SkillDMDisplay proficient={state?.proficient ?? false} rawValue={state?.value} jackState={jackState} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const baseSkills = skillDefinitions.filter(def => !def.parentKey && !def.isCustomGroup);
  const customGroups = skillDefinitions.filter(def => def.isCustomGroup);

  const getCharacteristicDM = (key: CharacteristicKey, value: CharacteristicValue) => {
    if (key === "psionics") {
      return value.current || value.total || "0";
    }
    const currentVal = Number(value.current || value.total);
    const dm = characteristicDM(currentVal || 0);
    return dm >= 0 ? `+${dm}` : dm.toString();
  };

  return (
    <div className="space-y-10 text-sm">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TextField label="Name" value={header.name} onChange={value => handleHeaderChange("name", value)} />
        <TextField label="Rads" value={header.rads} onChange={value => handleHeaderChange("rads", value)} />
        <TextField label="Age" value={header.age} onChange={value => handleHeaderChange("age", value)} />
        <TextField label="Species" value={header.species} onChange={value => handleHeaderChange("species", value)} />
        <TextField
          label="Species Traits"
          value={header.speciesTraits}
          onChange={value => handleHeaderChange("speciesTraits", value)}
          className="md:col-span-2"
        />
        <TextField
          label="Homeworld"
          value={header.homeworld}
          onChange={value => handleHeaderChange("homeworld", value)}
          className="md:col-span-3"
        />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide mb-3">Characteristics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {characteristicKeys.map(key => {
            const value = characteristics[key];
            return (
              <div key={key} className="border border-primary/30 bg-card/40 rounded p-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide">{key.replace(/_/g, " ")}</div>
                <div className="flex gap-2">
                  <Input
                    value={value.total}
                    onChange={event => handleCharacteristicChange(key, "total", event.target.value)}
                    placeholder="Total"
                    type="number"
                    className="h-8"
                  />
                  <Input
                    value={value.current}
                    onChange={event => handleCharacteristicChange(key, "current", event.target.value)}
                    placeholder="Current"
                    type="number"
                    className="h-8"
                  />
                </div>
                <div className="text-xs text-muted-foreground font-mono">DM: {getCharacteristicDM(key, value)}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide">Armour</h3>
          <Table
            headers={["Type", "RAD", "Protection", "KG", "Options", "Total"]}
            fields={["type", "rad", "protection", "kg", "options", "total"]}
            values={armourRows}
            onChange={updateArmourRow}
          />
        </div>
        <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide">Finances</h3>
          <div className="space-y-2">
            <TextField label="Pension" value={finances.pension} onChange={value => setFinances(prev => ({ ...prev, pension: value }))} compact />
            <TextField label="Debt" value={finances.debt} onChange={value => setFinances(prev => ({ ...prev, debt: value }))} compact />
            <TextField label="Cash on Hand" value={finances.cashOnHand} onChange={value => setFinances(prev => ({ ...prev, cashOnHand: value }))} compact />
            <TextField label="Monthly Ship Payments" value={finances.shipPayments} onChange={value => setFinances(prev => ({ ...prev, shipPayments: value }))} compact />
            <TextField label="Living Cost" value={finances.livingCost} onChange={value => setFinances(prev => ({ ...prev, livingCost: value }))} compact />
          </div>
        </div>
        <div className="border border-primary/30 bg-card/40 p-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide">Study Period</h3>
          <div className="space-y-2">
            <TextField label="Training in Skill" value={studyPeriod.skill} onChange={value => setStudyPeriod(prev => ({ ...prev, skill: value }))} compact />
            <TextField label="Weeks" value={studyPeriod.weeks} onChange={value => setStudyPeriod(prev => ({ ...prev, weeks: value }))} compact />
            <TextField label="Study Periods Complete" value={studyPeriod.complete} onChange={value => setStudyPeriod(prev => ({ ...prev, complete: value }))} compact />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-1">Allies, Contacts, Enemies, Rivals</h4>
            <textarea className="w-full bg-background border border-primary/30 rounded p-2 h-32 text-xs" value={notes} onChange={event => setNotes(event.target.value)} />
          </div>
        </div>
      </section>

      <section className="border border-primary/30 bg-card/30">
        <div className="p-4 border-b border-primary/20 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Skills</h2>
          <span className="text-xs text-muted-foreground">Unchecked skills automatically apply the untrained DM.</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
          {baseSkills.map(def => (
            <div key={def.key}>
              {renderSkillEntry(def)}
              {skillDefinitions
                .filter(child => child.parentKey === def.key)
                .map(child => renderSkillEntry(child))}
            </div>
          ))}
          {customGroups.map(def => renderCustomGroup(def))}
        </div>
      </section>

      <section className="border border-primary/30 bg-card/30">
        <div className="p-4 border-b border-primary/20">
          <h2 className="text-xs font-semibold uppercase tracking-wide">Weapons</h2>
        </div>
        <Table
          headers={["Weapon", "Accuracy", "Range", "Damage", "KG", "Magazine", "Traits"]}
          fields={["weapon", "accuracy", "range", "damage", "kg", "magazine", "traits"]}
          values={weapons}
          onChange={updateWeaponRow}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-primary/30 bg-card/30">
          <div className="p-4 border-b border-primary/20">
            <h2 className="text-xs font-semibold uppercase tracking-wide">Equipment</h2>
          </div>
          <Table
            headers={["Equipment", "Mass"]}
            fields={["item", "mass"]}
            values={equipment}
            onChange={updateEquipmentRow}
          />
        </div>
        <div className="border border-primary/30 bg-card/30">
          <div className="p-4 border-b border-primary/20">
            <h2 className="text-xs font-semibold uppercase tracking-wide">Augments</h2>
          </div>
          <Table
            headers={["Type", "TL", "Improvement"]}
            fields={["type", "tl", "improvement"]}
            values={augments}
            onChange={updateAugmentRow}
          />
        </div>
        <div className="border border-primary/30 bg-card/30 flex flex-col">
          <div className="p-4 border-b border-primary/20">
            <h2 className="text-xs font-semibold uppercase tracking-wide">Total Carried Mass</h2>
          </div>
          <div className="p-4 flex-1 flex items-center justify-center">
            <Input placeholder="Total" className="w-32 text-center" value={totalMass} onChange={event => setTotalMass(event.target.value)} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset Sheet</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}

const TextField = ({ label, value, onChange, className = "", compact }: TextFieldProps) => (
  <label className={`flex flex-col gap-1 text-xs uppercase tracking-wide ${className}`}>
    <span>{label}</span>
    <Input className={compact ? "h-8" : ""} value={value} onChange={event => onChange(event.target.value)} />
  </label>
);

interface TableProps<T extends Record<string, string>> {
  headers: string[];
  fields: (keyof T)[];
  values: T[];
  onChange: (rowIndex: number, field: keyof T, value: string) => void;
}

const Table = <T extends Record<string, string>>({ headers, fields, values, onChange }: TableProps<T>) => (
  <div className="overflow-hidden">
    <table className="w-full text-xs">
      <thead className="bg-primary/20 text-primary-foreground">
        <tr>
          {headers.map(header => (
            <th key={header} className="px-2 py-1 text-left uppercase tracking-wide font-semibold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {values.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-t border-primary/20">
            {fields.map(field => (
              <td key={String(field)} className="p-1">
                <Input
                  className="h-8"
                  value={row[field] ?? ""}
                  onChange={event => onChange(rowIndex, field, event.target.value)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface SkillDMDisplayProps {
  proficient: boolean;
  rawValue?: string;
  jackState?: SkillState;
}

const SkillDMDisplay = ({ proficient, rawValue, jackState }: SkillDMDisplayProps) => {
  if (proficient) {
    const value = Number(rawValue ?? 0) || 0;
    const display = value >= 0 ? `+${value}` : value.toString();
    return <span className="text-xs font-mono w-10 text-center">{display}</span>;
  }

  let penalty = -3;
  if (jackState?.proficient) {
    const level = Number(jackState.value ?? 0);
    const reduction = Math.min(Math.max(level, 0) + 1, 2);
    penalty = Math.min(penalty + reduction, -1);
  }

  return <span className="text-xs font-mono w-10 text-center text-muted-foreground">{penalty}</span>;
};

export default CharacterSheet;
