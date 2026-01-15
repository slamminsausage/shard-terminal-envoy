import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dices, User, Briefcase, Award, Save, ArrowRight } from 'lucide-react';

interface CharacterData {
  name: string;
  characteristics: {
    strength: number;
    dexterity: number;
    endurance: number;
    intelligence: number;
    education: number;
    social: number;
  };
  age: number;
  career?: string;
  skills: Record<string, number>;
  credits: number;
}

export const CharacterGenerator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    characteristics: {
      strength: 7,
      dexterity: 7,
      endurance: 7,
      intelligence: 7,
      education: 7,
      social: 7,
    },
    age: 18,
    skills: {},
    credits: 0,
  });

  const rollDice = (dice: number = 2, sides: number = 6): number => {
    let total = 0;
    for (let i = 0; i < dice; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  };

  const rollAllCharacteristics = () => {
    setCharacterData(prev => ({
      ...prev,
      characteristics: {
        strength: rollDice(),
        dexterity: rollDice(),
        endurance: rollDice(),
        intelligence: rollDice(),
        education: rollDice(),
        social: rollDice(),
      },
    }));
  };

  const rollSingleCharacteristic = (char: keyof CharacterData['characteristics']) => {
    setCharacterData(prev => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [char]: rollDice(),
      },
    }));
  };

  const careers = [
    {
      name: 'Navy',
      description: 'Serve in the interstellar navy',
      qualification: 'INT 6+',
      skills: ['Pilot', 'Gunnery', 'Electronics', 'Mechanic', 'Tactics'],
    },
    {
      name: 'Marines',
      description: 'Elite military forces',
      qualification: 'END 6+',
      skills: ['Gun Combat', 'Melee', 'Athletics', 'Tactics', 'Heavy Weapons'],
    },
    {
      name: 'Merchant',
      description: 'Commercial spacefarer',
      qualification: 'INT 4+',
      skills: ['Pilot', 'Broker', 'Steward', 'Electronics', 'Persuade'],
    },
    {
      name: 'Scout',
      description: 'Explore the unknown',
      qualification: 'INT 5+',
      skills: ['Pilot', 'Astrogation', 'Survival', 'Electronics', 'Recon'],
    },
    {
      name: 'Rogue',
      description: 'Live outside the law',
      qualification: 'DEX 6+',
      skills: ['Stealth', 'Streetwise', 'Deception', 'Gun Combat', 'Persuade'],
    },
    {
      name: 'Scholar',
      description: 'Academic and researcher',
      qualification: 'EDU 6+',
      skills: ['Science', 'Electronics', 'Investigate', 'Medic', 'Admin'],
    },
  ];

  const [selectedCareer, setSelectedCareer] = useState<typeof careers[0] | null>(null);

  const handleCareerSelect = (career: typeof careers[0]) => {
    setSelectedCareer(career);

    // Add starting skills
    const newSkills: Record<string, number> = { ...characterData.skills };
    career.skills.slice(0, 3).forEach(skill => {
      newSkills[skill] = 1;
    });

    setCharacterData(prev => ({
      ...prev,
      career: career.name,
      skills: newSkills,
      age: 22, // 1 term = 4 years
      credits: 1000,
    }));
  };

  const handleSaveCharacter = () => {
    console.log('Saving character:', characterData);
    // This would integrate with the character save system
    alert('Character generator would save here. Integration coming soon!');
  };

  const getDM = (value: number): string => {
    if (value >= 15) return '+3';
    if (value >= 12) return '+2';
    if (value >= 9) return '+1';
    if (value >= 6) return '+0';
    if (value >= 3) return '-1';
    if (value >= 1) return '-2';
    return '-3';
  };

  return (
    <div className="h-full flex flex-col bg-black text-terminal-primary font-mono">
      <div className="border-b border-terminal-primary/30 p-4">
        <h1 className="text-2xl font-bold text-terminal-primary flex items-center gap-2">
          <User className="h-6 w-6" />
          CHARACTER GENERATOR
        </h1>
        <p className="text-terminal-primary/70 text-sm mt-1">
          Create a new Traveller character - Step {step} of 4
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Tabs value={`step${step}`} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black border border-terminal-primary/30 mb-4">
            <TabsTrigger
              value="step1"
              className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary"
            >
              1. Basics
            </TabsTrigger>
            <TabsTrigger
              value="step2"
              className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary"
            >
              2. Characteristics
            </TabsTrigger>
            <TabsTrigger
              value="step3"
              className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary"
            >
              3. Career
            </TabsTrigger>
            <TabsTrigger
              value="step4"
              className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary"
            >
              4. Review
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Basic Info */}
          <TabsContent value="step1">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <CardTitle className="text-terminal-primary">Character Basics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                    Character Name
                  </label>
                  <Input
                    placeholder="Enter character name..."
                    value={characterData.name}
                    onChange={(e) => setCharacterData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                </div>

                <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-4">
                  <p className="text-sm text-terminal-primary/80 mb-2">
                    Welcome to the Traveller character generator! This wizard will guide you through creating your character.
                  </p>
                  <p className="text-xs text-terminal-primary/60">
                    You'll roll characteristics, choose a career, and develop your character's background.
                  </p>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                >
                  Continue to Characteristics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Characteristics */}
          <TabsContent value="step2">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-terminal-primary">Roll Characteristics</CardTitle>
                  <Button
                    onClick={rollAllCharacteristics}
                    className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    <Dices className="h-4 w-4 mr-2" />
                    Roll All (2D6)
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(characterData.characteristics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border border-terminal-primary/30 rounded">
                    <div className="flex-1">
                      <div className="font-bold text-terminal-primary uppercase">{key}</div>
                      <div className="text-xs text-terminal-primary/60">DM: {getDM(value)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-terminal-primary">{value}</div>
                      <Button
                        onClick={() => rollSingleCharacteristic(key as keyof CharacterData['characteristics'])}
                        size="sm"
                        variant="outline"
                        className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                      >
                        <Dices className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    Continue to Career
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Career Selection */}
          <TabsContent value="step3">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <CardTitle className="text-terminal-primary">Choose Your Career</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {careers.map(career => (
                    <Card
                      key={career.name}
                      className={`cursor-pointer transition-colors ${
                        selectedCareer?.name === career.name
                          ? 'bg-terminal-primary/20 border-terminal-primary'
                          : 'bg-black border-terminal-primary/30 hover:border-terminal-primary/50'
                      }`}
                      onClick={() => handleCareerSelect(career)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="h-4 w-4 text-terminal-primary" />
                          <h3 className="font-bold text-terminal-primary">{career.name}</h3>
                        </div>
                        <p className="text-sm text-terminal-primary/80 mb-2">{career.description}</p>
                        <div className="text-xs text-terminal-primary/60 mb-2">
                          Qualification: {career.qualification}
                        </div>
                        <div className="text-xs text-terminal-primary/70">
                          Skills: {career.skills.slice(0, 3).join(', ')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!selectedCareer}
                    className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    Review Character
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Review */}
          <TabsContent value="step4">
            <Card className="bg-black border-terminal-primary/50">
              <CardHeader>
                <CardTitle className="text-terminal-primary">Character Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-terminal-primary mb-1">
                    {characterData.name || 'Unnamed Character'}
                  </h2>
                  <p className="text-terminal-primary/70">
                    {characterData.career || 'No Career'} • Age {characterData.age}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-terminal-primary uppercase mb-2">Characteristics</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(characterData.characteristics).map(([key, value]) => (
                      <div key={key} className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-2">
                        <div className="text-xs text-terminal-primary/60 uppercase">{key.slice(0, 3)}</div>
                        <div className="text-lg font-bold text-terminal-primary">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-terminal-primary uppercase mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(characterData.skills).map(([skill, level]) => (
                      <div key={skill} className="bg-terminal-primary/10 border border-terminal-primary/30 rounded px-3 py-1">
                        <span className="text-terminal-primary">{skill}</span>
                        <span className="text-terminal-primary/70 ml-1">-{level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
                  <div className="text-sm text-terminal-primary/70">Starting Credits</div>
                  <div className="text-xl font-bold text-terminal-primary">{characterData.credits.toLocaleString()} Cr</div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSaveCharacter}
                    disabled={!characterData.name}
                    className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Character
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
