import { useEffect, useState } from "react";
import { useCampaign } from "@/contexts/CampaignContext";
import { Character } from "@/types/database";
import { Badge } from "@/components/ui/badge";

interface CharacterViewProps {
  characterId: string;
}

const CharacterView = ({ characterId }: CharacterViewProps) => {
  const { characters, vehicles } = useCampaign();
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const foundCharacter = characters.find(c => c.id === characterId);
    if (foundCharacter) {
      setCharacter(foundCharacter);
    }
  }, [characterId, characters]);

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
    const skillGroups: { [key: string]: any[] } = {};
    
    // Handle both object and array format for skills
    const skillsToProcess = Array.isArray(skills) ? {} : skills;
    
    Object.entries(skillsToProcess).forEach(([key, skill]: [string, any]) => {
      if (skill && (skill.proficient || skill.value || (typeof skill === 'object' && skill.level))) {
        const group = skill.parentKey || 'Base Skills';
        if (!skillGroups[group]) skillGroups[group] = [];
        skillGroups[group].push({ key, ...skill });
      }
    });

    return Object.entries(skillGroups).map(([groupName, groupSkills]) => (
      <div key={groupName} className="mb-4">
        <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
          {groupName}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {groupSkills.map((skill) => (
            <div key={skill.key} className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm">{skill.customLabel || skill.key.replace(/_/g, ' ')}</span>
              <span className="font-mono text-sm">{skill.value || skill.level || '0'}</span>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-8 print:p-4">
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
            <div className="max-h-96 overflow-y-auto">
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