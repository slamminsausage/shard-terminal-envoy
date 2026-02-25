import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCampaign } from "@/contexts/CampaignContext";
import { performSkillCheck, rollDamageExpression, getCharacteristicDM, getSkillDM } from "@/lib/dice";
import { dbHelpers } from "@/lib/supabase";
import { Upload, X, Crop, Users, Ship } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CREW_POSITION_PRESETS } from "@/types/database";
import { ThumbnailCropper } from "@/components/ui/ThumbnailCropper";
import { WeaponTable, type WeaponRow } from "@/components/inventory/WeaponTable";
import { ArmorTable, type ArmourRow } from "@/components/inventory/ArmorTable";
import { EquipmentTable, type EquipmentRow } from "@/components/inventory/EquipmentTable";
import { AugmentTable, type AugmentRow } from "@/components/inventory/AugmentTable";
import { EncumbranceSummary } from "@/components/inventory/EncumbranceSummary";

interface CharacterSheetProps {
  characterId?: string;
}

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
  isPsionic?: boolean;
}

// Row types are now imported from the inventory components

const characteristicKeys = [
  "strength",
  "dexterity",
  "endurance",
  "intellect",
  "education",
  "social",
  "psionics"
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
  { key: "telepathy", label: "Telepathy", isPsionic: true },
  { key: "clairvoyance", label: "Clairvoyance", isPsionic: true },
  { key: "telekinesis", label: "Telekinesis", isPsionic: true },
  { key: "awareness", label: "Awareness", isPsionic: true },
  { key: "teleportation", label: "Teleportation", isPsionic: true },
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

const getCharacteristicDMTable = (value: number): number => {
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

const CharacterSheet = ({ characterId }: CharacterSheetProps = {}) => {
  const { saveCharacter, characters, crewGroups, vehicles } = useCampaign();
  const [currentCharacterId, setCurrentCharacterId] = useState<string | undefined>(characterId);
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
  const [relationships, setRelationships] = useState({
    allies: "",
    contacts: "",
    rivals: "",
    enemies: ""
  });
  const [weapons, setWeapons] = useState(initialWeapons);
  const [weaponCharMods, setWeaponCharMods] = useState<string[]>(initialWeapons.map(() => "none"));
  const [equipment, setEquipment] = useState(initialEquipment);
  const [augments, setAugments] = useState(initialAugments);
  // totalMass removed - auto-calculated by EncumbranceSummary
  const [skillRollDifficulty, setSkillRollDifficulty] = useState("8");
  // showItemCreator removed - replaced by catalog picker in new components
  const [skillRollCharacteristic, setSkillRollCharacteristic] = useState<CharacteristicKey>("intellect");
  const [skillRollModifier, setSkillRollModifier] = useState("0");
  const [lastRollLog, setLastRollLog] = useState<string>("");
  const [lastWeaponRollLog, setLastWeaponRollLog] = useState<string>("");
  const [skills, setSkills] = useState<Record<string, SkillState>>(baseSkillState);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [crewId, setCrewId] = useState<string>('');
  const [crewPosition, setCrewPosition] = useState<string>('');

  // Load character data if editing an existing character
  useEffect(() => {
    if (currentCharacterId) {
      const character = characters.find(c => c.id === currentCharacterId);
      if (character) {
        setHeader({
          name: character.name,
          rads: character.rads || "",
          age: (character.age ?? 0).toString(),
          species: character.species,
          speciesTraits: character.species_traits || "",
          homeworld: character.homeworld
        });
        const psionicsValue = character.psionics ?? 0;

        // Use current stats if available (for tracking damage), otherwise use base stats
        setCharacteristics({
          strength: {
            total: character.strength.toString(),
            current: (character.current_strength ?? character.strength).toString()
          },
          dexterity: {
            total: character.dexterity.toString(),
            current: (character.current_dexterity ?? character.dexterity).toString()
          },
          endurance: {
            total: character.endurance.toString(),
            current: (character.current_endurance ?? character.endurance).toString()
          },
          intellect: { total: character.intellect.toString(), current: character.intellect.toString() },
          education: { total: character.education.toString(), current: character.education.toString() },
          social: { total: character.social_standing.toString(), current: character.social_standing.toString() },
          psionics: { total: psionicsValue.toString(), current: psionicsValue.toString() }
        });
        // Load other character data safely with array validation
        // Handle both string arrays (from character generator) and proper row objects
        if (character.weapons && Array.isArray(character.weapons)) {
          const weaponRows: WeaponRow[] = character.weapons.map((w: any) => {
            if (typeof w === 'string') {
              return { weapon: w, accuracy: '', range: '', damage: '', kg: '', magazine: '', traits: '' };
            }
            return w as WeaponRow;
          });
          // Ensure we have at least 4 rows for display
          while (weaponRows.length < 4) {
            weaponRows.push({ weapon: '', accuracy: '', range: '', damage: '', kg: '', magazine: '', traits: '' });
          }
          setWeapons(weaponRows);
        } else {
          setWeapons(initialWeapons);
        }

        if (character.armor && Array.isArray(character.armor)) {
          const armorRows: ArmourRow[] = character.armor.map((a: any) => {
            if (typeof a === 'string') {
              return { type: a, rad: '', protection: '', kg: '', options: '', total: '' };
            }
            return a as ArmourRow;
          });
          while (armorRows.length < 4) {
            armorRows.push({ type: '', rad: '', protection: '', kg: '', options: '', total: '' });
          }
          setArmourRows(armorRows);
        } else {
          setArmourRows(initialArmourRows);
        }

        if (character.equipment && Array.isArray(character.equipment)) {
          const equipmentRows: EquipmentRow[] = character.equipment.map((e: any) => {
            if (typeof e === 'string') {
              return { item: e, mass: '' };
            }
            return e as EquipmentRow;
          });
          while (equipmentRows.length < 6) {
            equipmentRows.push({ item: '', mass: '' });
          }
          setEquipment(equipmentRows);
        } else {
          setEquipment(initialEquipment);
        }

        if (character.augments && Array.isArray(character.augments)) {
          const augmentRows: AugmentRow[] = character.augments.map((a: any) => {
            if (typeof a === 'string') {
              return { type: a, tl: '', improvement: '' };
            }
            return a as AugmentRow;
          });
          while (augmentRows.length < 4) {
            augmentRows.push({ type: '', tl: '', improvement: '' });
          }
          setAugments(augmentRows);
        } else {
          setAugments(initialAugments);
        }

        if (character.skills && typeof character.skills === 'object') {
          setSkills(character.skills as Record<string, SkillState>);
        }

        if (typeof character.notes === "string") setNotes(character.notes);

        // Load relationships
        setRelationships({
          allies: character.allies || "",
          contacts: character.contacts || "",
          rivals: character.rivals || "",
          enemies: character.enemies || ""
        });

        // Load finances
        setFinances({
          pension: character.pension?.toString() || "",
          debt: character.debt?.toString() || "",
          cashOnHand: character.cash_on_hand?.toString() || "",
          shipPayments: character.ship_payments?.toString() || "",
          livingCost: character.living_cost?.toString() || ""
        });

        // Load study period
        setStudyPeriod({
          skill: character.study_skill || "",
          weeks: character.study_weeks || "",
          complete: character.study_complete || ""
        });

        // Load thumbnail
        if (typeof character.thumbnail_url === "string") setThumbnailUrl(character.thumbnail_url);

        // Load crew assignment
        setCrewId(character.crew_id || '');
        setCrewPosition(character.crew_position || '');
      }
    }
  }, [currentCharacterId, characters]);

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

  // Individual row update handlers removed - new components manage their own state

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Open cropper with the selected file
    setSelectedImageFile(file);
    setCropperOpen(true);

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    try {
      setIsUploadingThumbnail(true);

      // If we have a character ID, upload to Supabase Storage
      if (currentCharacterId) {
        const mimeType = croppedDataUrl.split(';')[0].split(':')[1];
        const uploadedUrl = await dbHelpers.uploadCharacterThumbnailFromDataURL(
          croppedDataUrl,
          currentCharacterId,
          mimeType
        );

        if (uploadedUrl) {
          setThumbnailUrl(uploadedUrl);
        } else {
          alert('Failed to upload thumbnail. Please try again.');
        }
      } else {
        // For new characters, store the data URL temporarily
        setThumbnailUrl(croppedDataUrl);
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Failed to upload thumbnail. Please try again.');
    } finally {
      setIsUploadingThumbnail(false);
      setSelectedImageFile(null);
    }
  };

  const handleEditThumbnail = () => {
    // Create a file input to select a new image for cropping
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedImageFile(file);
        setCropperOpen(true);
      }
    };
    input.click();
  };

  const handleRemoveThumbnail = async () => {
    try {
      if (currentCharacterId) {
        await dbHelpers.deleteCharacterThumbnail(currentCharacterId);
      }
      setThumbnailUrl('');
    } catch (error) {
      console.error('Error removing thumbnail:', error);
    }
  };

  // handleAddItemToSheet removed - catalog picker handles adding items directly

  const handleSaveCharacter = async () => {
    try {
      let finalThumbnailUrl = thumbnailUrl;

      // If we have a data URL thumbnail and a character ID, upload it
      if (thumbnailUrl && thumbnailUrl.startsWith('data:image/') && currentCharacterId) {
        const mimeType = thumbnailUrl.split(';')[0].split(':')[1];
        const uploadedUrl = await dbHelpers.uploadCharacterThumbnailFromDataURL(
          thumbnailUrl,
          currentCharacterId,
          mimeType
        );
        if (uploadedUrl) {
          finalThumbnailUrl = uploadedUrl;
        }
      }

      const characterData = {
        id: currentCharacterId, // Include ID for updates
        name: header.name,
        species: header.species,
        gender: "", // Add if needed
        age: parseInt(header.age) || 0,
        homeworld: header.homeworld,
        rads: header.rads,
        species_traits: header.speciesTraits,
        notes: notes,
        career: "", // Add if needed
        rank: "", // Add if needed
        strength: parseInt(characteristics.strength.total) || 7,
        dexterity: parseInt(characteristics.dexterity.total) || 7,
        endurance: parseInt(characteristics.endurance.total) || 7,
        current_strength: parseInt(characteristics.strength.current) || undefined,
        current_dexterity: parseInt(characteristics.dexterity.current) || undefined,
        current_endurance: parseInt(characteristics.endurance.current) || undefined,
        intellect: parseInt(characteristics.intellect.total) || 7,
        education: parseInt(characteristics.education.total) || 7,
        social_standing: parseInt(characteristics.social.total) || 7,
        psionics: parseInt(characteristics.psionics.total) || 0,
        melee_dmg: 0,
        ranged_dmg: 0,
        lifeblood: 0,
        stamina: 0,
        terms_served: 0,
        skills: skills,
        equipment: equipment,
        credits: parseInt(finances.cashOnHand) || 0,
        debt: parseInt(finances.debt) || 0,
        pension: parseInt(finances.pension) || 0,
        ship_payments: parseInt(finances.shipPayments) || 0,
        living_cost: parseInt(finances.livingCost) || 0,
        cash_on_hand: parseInt(finances.cashOnHand) || 0,
        study_skill: studyPeriod.skill,
        study_weeks: studyPeriod.weeks,
        study_complete: studyPeriod.complete,
        allies: relationships.allies,
        contacts: relationships.contacts,
        rivals: relationships.rivals,
        enemies: relationships.enemies,
        weapons: weapons,
        armor: armourRows,
        augments: augments,
        thumbnail_url: finalThumbnailUrl || null,
        crew_id: crewId || undefined,
        crew_position: crewPosition || undefined,
      };

      await saveCharacter(characterData);
    } catch (error) {
      console.error('Failed to save character:', error);
    }
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

  const resolveCharacteristicDM = (key: CharacteristicKey) => {
    const value = characteristics[key];
    const numeric = Number(value?.current || value?.total || 0) || 0;
    return getCharacteristicDM(numeric);
  };

  const handleSkillRoll = (def: SkillDefinition) => {
    const skillState = skills[def.key];
    const level = Number(skillState?.value ?? 0) || 0;
    const jackLevel = jackState?.proficient ? Number(jackState.value ?? 0) || 0 : undefined;
    const skillDM = getSkillDM(Boolean(skillState?.proficient), level, jackLevel);
    const rangeAccTraitDM = Number(skillRollModifier) || 0;
    const difficulty = Number(skillRollDifficulty) || 8;
    const charDM = resolveCharacteristicDM(skillRollCharacteristic);
    const result = performSkillCheck(difficulty, skillDM + rangeAccTraitDM, charDM);
    setLastRollLog(
      `Skill Roll: ${def.label} vs ${difficulty}+ -> ${result.total} (dice ${result.dice} + skill ${skillDM} + situational ${rangeAccTraitDM} + char ${charDM}) ${result.success ? "SUCCESS" : "FAIL"}`
    );
  };

  const handleWeaponCharSelect = (index: number, value: string) => {
    setWeaponCharMods(prev => prev.map((v, i) => (i === index ? value : v)));
  };

  const handleWeaponDamageRoll = (index: number) => {
    const weapon = weapons[index];
    if (!weapon) return;
    const charKey = weaponCharMods[index] as CharacteristicKey | "none";
    const charDM = charKey && charKey !== "none" ? resolveCharacteristicDM(charKey) : 0;
    const result = rollDamageExpression(weapon.damage || "0", charDM);
    setLastWeaponRollLog(
      `Damage Roll: ${weapon.weapon || "Weapon"} ${weapon.damage || ""} -> ${result.total} (dice ${
        result.diceResults.join("+") || "0"
      } ${result.modifier ? `${result.modifier >= 0 ? "+" : ""}${result.modifier}` : ""} ${
        charDM ? `+ char ${charDM}` : ""
      })`
    );
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
          <SkillDMDisplay proficient={state?.proficient ?? false} rawValue={state?.value} jackState={jackState} isPsionic={def.isPsionic} />
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={() => handleSkillRoll(def)}
          >
            Roll
          </Button>
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
            <SkillDMDisplay proficient={baseState?.proficient ?? false} rawValue={baseState?.value} jackState={jackState} isPsionic={def.isPsionic} />
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
                  <SkillDMDisplay proficient={state?.proficient ?? false} rawValue={state?.value} jackState={jackState} isPsionic={false} />
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

  const getCharacteristicDMDisplay = (key: CharacteristicKey, value: CharacteristicValue) => {
    const currentVal = Number(value.current || value.total);
    const dm = getCharacteristicDMTable(currentVal || 0);
    return dm >= 0 ? `+${dm}` : dm.toString();
  };

  const isSkillTrained = (def: SkillDefinition) => {
    const state = skills[def.key];
    if (!state) return false;
    if (state.proficient) return true;
    const numeric = Number(state.value);
    return !Number.isNaN(numeric) && numeric > 0;
  };

  const sortedBaseSkills = useMemo(() => {
    const trained: SkillDefinition[] = [];
    const untrained: SkillDefinition[] = [];

    baseSkills.forEach(def => {
      if (isSkillTrained(def)) {
        trained.push(def);
      } else {
        untrained.push(def);
      }
    });

    trained.sort((a, b) => (skills[b.key]?.value ?? "").localeCompare(skills[a.key]?.value ?? ""));
    untrained.sort((a, b) => a.label.localeCompare(b.label));

    return { trained, untrained };
  }, [baseSkills, skills]);

  return (
    <div className="space-y-6 text-sm max-h-[80vh] overflow-y-auto font-mono">
      <section className="panel">
        <div className="panel-header">
          <span className="panel-title">CHARACTER PROFILE</span>
        </div>
        <div className="panel-content">
          {/* Character Thumbnail Section */}
          <div className="mb-6 pb-4 border-b border-primary/20">
            <label className="text-xs font-semibold uppercase tracking-wide text-primary/80 mb-2 block">Character Portrait</label>
            <div className="flex items-center gap-4">
              {thumbnailUrl && (
                <div className="relative group">
                  <img
                    src={thumbnailUrl}
                    alt="Character Thumbnail"
                    className="w-24 h-24 object-cover rounded border border-primary/30"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded">
                    <Button
                      onClick={handleEditThumbnail}
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-primary/50 hover:bg-primary/20"
                      title="Crop/Edit"
                    >
                      <Crop className="h-3 w-3 text-primary" />
                    </Button>
                    <Button
                      onClick={handleRemoveThumbnail}
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 bg-red-500/80 border-red-500 hover:bg-red-600"
                      title="Remove"
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex-1 print:hidden">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    disabled={isUploadingThumbnail}
                  />
                  <div className="border border-primary/40 rounded p-3 text-center hover:bg-primary/5 transition-colors">
                    <Upload className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-primary">
                      {isUploadingThumbnail ? 'Uploading...' : thumbnailUrl ? 'Change Portrait' : 'Upload Portrait'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Thumbnail Cropper Dialog */}
          <ThumbnailCropper
            open={cropperOpen}
            onOpenChange={setCropperOpen}
            imageFile={selectedImageFile}
            onCropComplete={handleCropComplete}
            outputSize={300}
            title="Crop Character Portrait"
          />

          {/* Character Info Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>

          {/* Crew Assignment Section */}
          <div className="mt-4 pt-3 border-t border-primary/20 print:hidden">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[var(--text-dimmer)]" />
              <span className="text-xs font-mono font-semibold text-[var(--text-dimmer)] uppercase tracking-wider">Crew Assignment</span>
            </div>
            {crewGroups.length > 0 ? (
              <div className="flex gap-3 flex-wrap items-center">
                {/* Crew group selector */}
                <Select value={crewId || 'none'} onValueChange={v => { setCrewId(v === 'none' ? '' : v); if (v === 'none') setCrewPosition(''); }}>
                  <SelectTrigger className="h-8 text-xs font-mono w-48 border-primary/30">
                    <SelectValue placeholder="No crew" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Crew</SelectItem>
                    {crewGroups.map(g => {
                      const ship = vehicles.find(v => v.id === g.ship_id);
                      return (
                        <SelectItem key={g.id} value={g.id}>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: g.color }} />
                            {g.name}
                            {ship && <span className="opacity-50 text-[0.6rem]">({ship.name})</span>}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Position selector */}
                {crewId && (
                  <Select value={crewPosition || 'none'} onValueChange={v => setCrewPosition(v === 'none' ? '' : v)}>
                    <SelectTrigger className="h-8 text-xs font-mono w-40 border-primary/30">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Position --</SelectItem>
                      {CREW_POSITION_PRESETS.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Display current assignment */}
                {crewId && (() => {
                  const crew = crewGroups.find(g => g.id === crewId);
                  if (!crew) return null;
                  const ship = vehicles.find(v => v.id === crew.ship_id);
                  return (
                    <span className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crew.color, boxShadow: `0 0 5px ${crew.color}` }} />
                      <span style={{ color: crew.color }}>{crew.name}</span>
                      {ship && (
                        <span className="text-[var(--text-dimmer)] flex items-center gap-0.5">
                          <Ship className="h-3 w-3" /> {ship.name}
                        </span>
                      )}
                      {crewPosition && <span className="text-[var(--text-dimmer)]">— {crewPosition}</span>}
                    </span>
                  );
                })()}
              </div>
            ) : (
              <div className="text-xs font-mono text-[var(--text-dimmer)]">
                No crew groups defined. Create crews in the Crew tab.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <span className="panel-title">CHARACTERISTICS</span>
        </div>
        <div className="panel-content grid grid-cols-2 md:grid-cols-4 gap-4">
          {characteristicKeys.map(key => {
            const value = characteristics[key];
            return (
              <div key={key} className="border border-primary/30 bg-card/40 rounded p-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Max</label>
                    <Input
                      value={value.total}
                      onChange={event => handleCharacteristicChange(key, "total", event.target.value)}
                      type="number"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Current</label>
                    <Input
                      value={value.current}
                      onChange={event => handleCharacteristicChange(key, "current", event.target.value)}
                      type="number"
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">DM: {getCharacteristicDMDisplay(key, value)}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <span className="panel-title">SKILLS</span>
            <span className="panel-status print:hidden">Trained skills bubble to the top</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs print:hidden">
            <label className="flex items-center gap-2">
              <span className="uppercase tracking-wide">Difficulty</span>
              <Input
                type="number"
                className="h-8 w-20"
                value={skillRollDifficulty}
                onChange={e => setSkillRollDifficulty(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="uppercase tracking-wide">Characteristic</span>
              <select
                className="bg-background border border-primary/40 rounded px-2 h-8 text-xs"
                value={skillRollCharacteristic}
                onChange={e => setSkillRollCharacteristic(e.target.value as CharacteristicKey)}
              >
                <option value="strength">Strength</option>
                <option value="dexterity">Dexterity</option>
                <option value="endurance">Endurance</option>
                <option value="intellect">Intellect</option>
                <option value="education">Education</option>
                <option value="social">Social</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="uppercase tracking-wide">Situational DM</span>
              <Input
                type="number"
                className="h-8 w-24"
                value={skillRollModifier}
                onChange={e => setSkillRollModifier(e.target.value)}
              />
            </label>
            {lastRollLog && (
              <div className="text-[11px] font-mono text-primary/80">
                {lastRollLog}
              </div>
            )}
          </div>
        </div>
        <div className="panel-content max-h-[420px] overflow-y-auto divide-y divide-border p-0 print-skills-content">
          {sortedBaseSkills.trained.length > 0 && (
            <div className="bg-primary/5 px-3 py-2 text-[11px] font-mono text-primary">
              TRAINED SKILLS
            </div>
          )}
          {sortedBaseSkills.trained.map(def => (
            <div key={def.key}>
              {renderSkillEntry(def)}
              {skillDefinitions
                .filter(child => child.parentKey === def.key)
                .map(child => renderSkillEntry(child))}
            </div>
          ))}

          <div className="print:hidden">
            <div className="bg-primary/5 px-3 py-2 text-[11px] font-mono text-primary">
              OTHER SKILLS
            </div>
            {sortedBaseSkills.untrained.map(def => (
              <div key={def.key}>
                {renderSkillEntry(def)}
                {skillDefinitions
                  .filter(child => child.parentKey === def.key)
                  .map(child => renderSkillEntry(child))}
              </div>
            ))}
            {customGroups.map(def => renderCustomGroup(def))}
          </div>
        </div>
      </section>

      <WeaponTable
        weapons={weapons}
        onChange={setWeapons}
        charMods={weaponCharMods}
        onCharModChange={handleWeaponCharSelect}
        onRoll={handleWeaponDamageRoll}
        lastRollLog={lastWeaponRollLog}
      />

      <ArmorTable
        armour={armourRows}
        onChange={setArmourRows}
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EquipmentTable
          equipment={equipment}
          onChange={setEquipment}
        />
        <AugmentTable
          augments={augments}
          onChange={setAugments}
        />
        <EncumbranceSummary
          weapons={weapons}
          armour={armourRows}
          equipment={equipment}
          strengthScore={parseInt(characteristics.strength?.current || "7")}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">FINANCES</span>
          </div>
          <div className="panel-content space-y-2">
            <TextField label="Pension" value={finances.pension} onChange={value => setFinances(prev => ({ ...prev, pension: value }))} compact />
            <TextField label="Debt" value={finances.debt} onChange={value => setFinances(prev => ({ ...prev, debt: value }))} compact />
            <TextField label="Cash on Hand" value={finances.cashOnHand} onChange={value => setFinances(prev => ({ ...prev, cashOnHand: value }))} compact />
            <TextField label="Monthly Ship Payments" value={finances.shipPayments} onChange={value => setFinances(prev => ({ ...prev, shipPayments: value }))} compact />
            <TextField label="Living Cost" value={finances.livingCost} onChange={value => setFinances(prev => ({ ...prev, livingCost: value }))} compact />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">STUDY PERIOD & NOTES</span>
          </div>
          <div className="panel-content space-y-4">
            <div className="space-y-2">
              <TextField label="Training in Skill" value={studyPeriod.skill} onChange={value => setStudyPeriod(prev => ({ ...prev, skill: value }))} compact />
              <TextField label="Weeks" value={studyPeriod.weeks} onChange={value => setStudyPeriod(prev => ({ ...prev, weeks: value }))} compact />
              <TextField label="Study Periods Complete" value={studyPeriod.complete} onChange={value => setStudyPeriod(prev => ({ ...prev, complete: value }))} compact />
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">Allies, Contacts, Enemies, Rivals</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-primary/60 uppercase tracking-wide">Allies</label>
                  <textarea
                    className="terminal-input w-full h-16 text-xs mt-1"
                    value={relationships.allies}
                    onChange={e => setRelationships(prev => ({ ...prev, allies: e.target.value }))}
                    placeholder="List allies..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-primary/60 uppercase tracking-wide">Contacts</label>
                  <textarea
                    className="terminal-input w-full h-16 text-xs mt-1"
                    value={relationships.contacts}
                    onChange={e => setRelationships(prev => ({ ...prev, contacts: e.target.value }))}
                    placeholder="List contacts..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-primary/60 uppercase tracking-wide">Rivals</label>
                  <textarea
                    className="terminal-input w-full h-16 text-xs mt-1"
                    value={relationships.rivals}
                    onChange={e => setRelationships(prev => ({ ...prev, rivals: e.target.value }))}
                    placeholder="List rivals..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-primary/60 uppercase tracking-wide">Enemies</label>
                  <textarea
                    className="terminal-input w-full h-16 text-xs mt-1"
                    value={relationships.enemies}
                    onChange={e => setRelationships(prev => ({ ...prev, enemies: e.target.value }))}
                    placeholder="List enemies..."
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-primary/60 uppercase tracking-wide">Notes</label>
              <textarea className="terminal-input w-full h-24 text-xs mt-1" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Character notes..." />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="terminal-btn">Reset Sheet</Button>
        <Button onClick={handleSaveCharacter} className="terminal-btn primary">Save Changes</Button>
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
  <label className={`flex flex-col gap-1 text-xs uppercase tracking-wide text-primary/80 ${className}`}>
    <span>{label}</span>
    <Input className={`terminal-input ${compact ? "h-8" : ""}`} value={value} onChange={event => onChange(event.target.value)} />
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
  isPsionic?: boolean;
}

const SkillDMDisplay = ({ proficient, rawValue, jackState, isPsionic }: SkillDMDisplayProps) => {
  if (proficient) {
    const value = Number(rawValue ?? 0) || 0;
    const display = value >= 0 ? `+${value}` : value.toString();
    return <span className="text-xs font-mono w-10 text-center">{display}</span>;
  }

  // Psionic skills are not affected by Jack-of-All-Trades
  if (isPsionic) {
    return <span className="text-xs font-mono w-10 text-center text-muted-foreground">-3</span>;
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
