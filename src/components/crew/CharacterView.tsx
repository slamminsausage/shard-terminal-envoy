import { useEffect, useState } from "react";
import { useCampaign } from "@/contexts/CampaignContext";
import { Character } from "@/types/database";
import { Badge } from "@/components/ui/badge";

interface CharacterViewProps {
  characterId: string;
}

const CharacterView = ({ characterId }: CharacterViewProps) => {
  const { characters, vehicles, isLoading } = useCampaign();
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    console.log('CharacterView - characterId:', characterId);
    console.log('CharacterView - characters length:', characters.length);
    console.log('CharacterView - characters:', characters.map(c => ({ id: c.id, name: c.name })));
    
    const foundCharacter = characters.find(c => c.id === characterId);
    console.log('CharacterView - foundCharacter:', foundCharacter ? foundCharacter.name : 'NOT FOUND');
    
    if (foundCharacter) {
      setCharacter(foundCharacter);
    }
  }, [characterId, characters]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading character data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Character Not Found</h1>
          <p>Unable to load character data.</p>
        </div>
      </div>
    );
  }

  const characterData = {
    characteristics: {
      strength: character.strength,
      dexterity: character.dexterity,
      endurance: character.endurance,
      intellect: character.intellect,
      education: character.education,
      social: character.social_standing
    },
    skills: character.skills || {},
    header: {
      name: character.name,
      age: character.age,
      species: character.species,
      homeworld: character.homeworld,
      rads: 0
    },
    weapons: character.weapons || {},
    armour: character.armor || {},
    equipment: character.equipment || {},
    notes: character.allies || character.contacts || ""
  };
  const characteristics = characterData.characteristics;
  const skills = characterData.skills;
  const header = characterData.header;

  const getCharacteristicDM = (value: string) => {
    const num = parseInt(value) || 0;
    if (num <= 0) return "-3";
    if (num <= 2) return "-2";
    if (num <= 5) return "-1";
    if (num <= 8) return "0";
    if (num <= 11) return "+1";
    if (num <= 14) return "+2";
    return "+3";
  };

  const renderSkills = () => {
    // Skill definitions in the same order as the editable character sheet
    const skillDefinitions = [
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
      { key: "language", label: "Language" },
      { key: "language_1", label: "Language 1", parentKey: "language" },
      { key: "language_2", label: "Language 2", parentKey: "language" },
      { key: "language_3", label: "Language 3", parentKey: "language" },
      { key: "language_4", label: "Language 4", parentKey: "language" },
      { key: "language_5", label: "Language 5", parentKey: "language" },
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
      { key: "profession", label: "Profession" },
      { key: "profession_1", label: "Profession 1", parentKey: "profession" },
      { key: "profession_2", label: "Profession 2", parentKey: "profession" },
      { key: "profession_3", label: "Profession 3", parentKey: "profession" },
      { key: "profession_4", label: "Profession 4", parentKey: "profession" },
      { key: "profession_5", label: "Profession 5", parentKey: "profession" },
      { key: "recon", label: "Recon" },
      { key: "science", label: "Science" },
      { key: "science_1", label: "Science 1", parentKey: "science" },
      { key: "science_2", label: "Science 2", parentKey: "science" },
      { key: "science_3", label: "Science 3", parentKey: "science" },
      { key: "science_4", label: "Science 4", parentKey: "science" },
      { key: "science_5", label: "Science 5", parentKey: "science" },
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

    const psionicSkills = [
      { key: "telepathy", label: "Telepathy" },
      { key: "clairvoyance", label: "Clairvoyance" },
      { key: "telekinesis", label: "Telekinesis" },
      { key: "awareness", label: "Awareness" },
      { key: "teleportation", label: "Teleportation" }
    ];

    const skillsToProcess = Array.isArray(skills) ? {} : skills;
    const skillGroups: { [key: string]: any[] } = {};
    
    // Process regular skills in order
    skillDefinitions.forEach(def => {
      const skill = skillsToProcess[def.key];
      if (skill && typeof skill === 'object') {
        const group = def.parentKey || 'Base Skills';
        if (!skillGroups[group]) skillGroups[group] = [];
        skillGroups[group].push({ 
          key: def.key, 
          label: def.label,
          customLabel: skill.customLabel,
          ...skill 
        });
      }
    });

    // Process psionic skills separately
    const psionicGroup: any[] = [];
    psionicSkills.forEach(def => {
      const skill = skillsToProcess[def.key];
      if (skill && typeof skill === 'object') {
        psionicGroup.push({ 
          key: def.key, 
          label: def.label,
          customLabel: skill.customLabel,
          ...skill 
        });
      }
    });

    return (
      <div>
        {Object.entries(skillGroups).map(([groupName, groupSkills]) => (
          <div key={groupName} className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
              {groupName}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {groupSkills.map((skill) => (
                <div key={skill.key} className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-sm">{skill.customLabel || skill.label}</span>
                  <span className="font-mono text-sm">{skill.value || skill.level || '0'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {psionicGroup.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
              Psionics
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {psionicGroup.map((skill) => (
                <div key={skill.key} className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-sm">{skill.customLabel || skill.label}</span>
                  <span className="font-mono text-sm">{skill.value || skill.level || '0'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen max-h-screen bg-background text-foreground overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8 print:p-4 min-h-full pb-8">
        {/* Header */}
        <div className="border-2 border-border rounded-lg p-6 mb-6 bg-card">
          <h1 className="text-3xl font-bold mb-4 text-center">TRAVELLER CHARACTER SHEET</h1>
          {(() => {
            // Find assigned vehicle
            const assignedVehicle = vehicles.find(vehicle => 
              vehicle.crew_requirements && 
              Object.keys(vehicle.crew_requirements).includes(character.id)
            );
            return assignedVehicle && (
              <div className="text-center mb-4">
                <Badge variant="outline" className="font-mono">
                  Assigned to: {assignedVehicle.name}
                </Badge>
              </div>
            );
          })()}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Name</label>
              <div className="border-b border-border pb-1 font-mono">{header.name || 'Unknown'}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Age</label>
              <div className="border-b border-border pb-1 font-mono">{header.age || '-'}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Species</label>
              <div className="border-b border-border pb-1 font-mono">{header.species || '-'}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Homeworld</label>
              <div className="border-b border-border pb-1 font-mono">{header.homeworld || '-'}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Rads</label>
              <div className="border-b border-border pb-1 font-mono">{header.rads || '0'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Characteristics */}
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">CHARACTERISTICS</h2>
            <div className="space-y-3">
              {Object.entries(characteristics).map(([key, values]: [string, any]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="capitalize font-medium">{key}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg">{values || '0'}</span>
              <span className="text-sm text-muted-foreground w-8 text-center">
                ({getCharacteristicDM(values || '0')})
              </span>
            </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">SKILLS</h2>
            <div className="max-h-[500px] overflow-y-auto pr-2">
              {renderSkills()}
            </div>
          </div>
        </div>

        {/* Equipment Tables */}
        {(characterData?.weapons?.length > 0 || characterData?.armour?.length > 0 || characterData?.equipment?.length > 0) && (
          <div className="mt-6 border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">EQUIPMENT</h2>
            
            {characterData?.weapons?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Weapons</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Weapon</th>
                        <th className="text-left p-2">Accuracy</th>
                        <th className="text-left p-2">Range</th>
                        <th className="text-left p-2">Damage</th>
                        <th className="text-left p-2">Traits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {characterData.weapons.filter((w: any) => w.weapon).map((weapon: any, index: number) => (
                        <tr key={index} className="border-b border-border/30">
                          <td className="p-2 font-mono">{weapon.weapon}</td>
                          <td className="p-2 font-mono">{weapon.accuracy}</td>
                          <td className="p-2 font-mono">{weapon.range}</td>
                          <td className="p-2 font-mono">{weapon.damage}</td>
                          <td className="p-2 font-mono">{weapon.traits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {characterData?.armour?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Armour</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Protection</th>
                        <th className="text-left p-2">Rad</th>
                        <th className="text-left p-2">Kg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {characterData.armour.filter((a: any) => a.type).map((armour: any, index: number) => (
                        <tr key={index} className="border-b border-border/30">
                          <td className="p-2 font-mono">{armour.type}</td>
                          <td className="p-2 font-mono">{armour.protection}</td>
                          <td className="p-2 font-mono">{armour.rad}</td>
                          <td className="p-2 font-mono">{armour.kg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {characterData?.notes && (
          <div className="mt-6 border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">NOTES</h2>
            <div className="whitespace-pre-wrap font-mono text-sm">
              {characterData.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterView;