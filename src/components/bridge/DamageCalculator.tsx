import React, { useState } from 'react';
import { Calculator, Shield, Zap, Target, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { rollDamageExpression } from '@/lib/dice';
import { Badge } from '@/components/ui/badge';

interface DamageCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDamage?: (damage: number, location?: string) => void;
}

// Common weapon types and their damage
const WEAPON_PRESETS = [
  { name: 'Pulse Laser', damage: '1d6', info: 'TL9 - Basic energy weapon' },
  { name: 'Beam Laser', damage: '2d6', info: 'TL10 - Standard laser' },
  { name: 'Particle Beam', damage: '3d6', info: 'TL11 - Advanced particle weapon' },
  { name: 'Fusion Gun', damage: '4d6', info: 'TL12 - Fusion-powered weapon' },
  { name: 'Meson Gun', damage: '5d6', info: 'TL13 - Ignores armor' },
  { name: 'Missile (Standard)', damage: '4d6', info: 'Standard missile' },
  { name: 'Missile (Nuclear)', damage: '6d6', info: 'Nuclear warhead' },
  { name: 'Railgun', damage: '3d6+3', info: 'TL9 kinetic weapon' },
  { name: 'Plasma Gun', damage: '4d6+2', info: 'TL12 plasma weapon' },
];

// Hit locations table
const HIT_LOCATIONS = [
  { roll: '2', location: 'Hull (Critical)', effect: 'Roll on critical table' },
  { roll: '3-4', location: 'Hull', effect: 'Standard damage' },
  { roll: '5', location: 'Armor', effect: 'Armor absorbs all' },
  { roll: '6', location: 'Power Plant', effect: 'Power loss possible' },
  { roll: '7', location: 'M-Drive', effect: 'Maneuver loss possible' },
  { roll: '8', location: 'J-Drive', effect: 'Jump capability loss' },
  { roll: '9', location: 'Sensors', effect: 'Sensor damage' },
  { roll: '10', location: 'Weapons', effect: 'Weapon system damage' },
  { roll: '11', location: 'Bridge', effect: 'Crew casualties possible' },
  { roll: '12', location: 'Fuel', effect: 'Fuel leak' },
];

export function DamageCalculator({ isOpen, onClose, onApplyDamage }: DamageCalculatorProps) {
  const [weaponDamage, setWeaponDamage] = useState('2d6');
  const [targetArmor, setTargetArmor] = useState(0);
  const [targetScreens, setTargetScreens] = useState(0);
  const [rangeModifier, setRangeModifier] = useState(0);
  const [effectOfHit, setEffectOfHit] = useState(0);
  const [hitLocation, setHitLocation] = useState<string>('');

  const [calculatedDamage, setCalculatedDamage] = useState<number | null>(null);
  const [damageRolls, setDamageRolls] = useState<number[]>([]);
  const [finalDamage, setFinalDamage] = useState<number | null>(null);

  const handleCalculate = () => {
    // Roll weapon damage
    const damageRoll = rollDamageExpression(weaponDamage);
    setDamageRolls(damageRoll.diceResults);

    // Calculate total damage before defenses
    let totalDamage = damageRoll.total;

    // Add Effect of Hit (if hit was successful)
    totalDamage += effectOfHit;

    setCalculatedDamage(totalDamage);

    // Apply defenses
    let remainingDamage = totalDamage;

    // Screens reduce damage first (before armor)
    remainingDamage = Math.max(0, remainingDamage - targetScreens);

    // Armor reduces remaining damage
    remainingDamage = Math.max(0, remainingDamage - targetArmor);

    setFinalDamage(remainingDamage);
  };

  const handleApply = () => {
    if (finalDamage !== null && onApplyDamage) {
      onApplyDamage(finalDamage, hitLocation || undefined);
    }
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCalculatedDamage(null);
    setDamageRolls([]);
    setFinalDamage(null);
    setEffectOfHit(0);
    setHitLocation('');
  };

  const handlePresetSelect = (preset: typeof WEAPON_PRESETS[0]) => {
    setWeaponDamage(preset.damage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Vehicle Damage Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate damage for space combat according to Traveller rules
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="calculator">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="reference">Quick Reference</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4">
            {/* Weapon Damage */}
            <div className="space-y-2">
              <Label>Weapon Damage</Label>
              <div className="flex gap-2">
                <Input
                  value={weaponDamage}
                  onChange={(e) => setWeaponDamage(e.target.value)}
                  placeholder="e.g., 2d6, 3d6+2"
                  className="flex-1"
                />
                <Select onValueChange={(value) => {
                  const preset = WEAPON_PRESETS.find(p => p.name === value);
                  if (preset) handlePresetSelect(preset);
                }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Weapon presets..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WEAPON_PRESETS.map(preset => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name} ({preset.damage})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Attack Success */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Effect of Hit (Attack roll effect)
              </Label>
              <Input
                type="number"
                value={effectOfHit}
                onChange={(e) => setEffectOfHit(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                The Effect from your attack roll (how much you beat the target number by)
              </p>
            </div>

            {/* Target Defenses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Target Armor
                </Label>
                <Input
                  type="number"
                  value={targetArmor}
                  onChange={(e) => setTargetArmor(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Target Screens
                </Label>
                <Input
                  type="number"
                  value={targetScreens}
                  onChange={(e) => setTargetScreens(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Energy screens (applied before armor)
                </p>
              </div>
            </div>

            {/* Calculate Button */}
            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Damage
            </Button>

            {/* Results */}
            {calculatedDamage !== null && (
              <Card className="bg-primary/5 border-primary">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-sm text-muted-foreground">Damage Roll</div>
                    <div className="flex justify-center gap-2">
                      {damageRolls.map((roll, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded border-2 border-primary bg-primary/10 flex items-center justify-center font-bold"
                        >
                          {roll}
                        </div>
                      ))}
                      {effectOfHit > 0 && (
                        <>
                          <span className="text-2xl text-muted-foreground">+</span>
                          <div className="w-10 h-10 rounded border-2 border-blue-500 bg-blue-500/10 flex items-center justify-center font-bold text-blue-500">
                            {effectOfHit}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-xl font-bold">
                      Total: {calculatedDamage}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base Damage:</span>
                      <span className="font-bold">{calculatedDamage}</span>
                    </div>
                    {targetScreens > 0 && (
                      <div className="flex justify-between text-sm text-blue-500">
                        <span>- Screens:</span>
                        <span className="font-bold">-{targetScreens}</span>
                      </div>
                    )}
                    {targetArmor > 0 && (
                      <div className="flex justify-between text-sm text-orange-500">
                        <span>- Armor:</span>
                        <span className="font-bold">-{targetArmor}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Final Damage:</span>
                      <span className={finalDamage === 0 ? 'text-muted-foreground' : 'text-destructive'}>
                        {finalDamage}
                        {finalDamage === 0 && ' (No penetration)'}
                      </span>
                    </div>
                  </div>

                  {/* Hit Location (optional) */}
                  <div className="space-y-2">
                    <Label>Hit Location (optional)</Label>
                    <Select value={hitLocation} onValueChange={setHitLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hit location..." />
                      </SelectTrigger>
                      <SelectContent>
                        {HIT_LOCATIONS.map(loc => (
                          <SelectItem key={loc.roll} value={loc.location}>
                            {loc.roll}: {loc.location} - {loc.effect}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reference" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Combat Damage Sequence
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Roll weapon damage dice</li>
                    <li>Add Effect of successful attack roll</li>
                    <li>Subtract target's defensive screens (if any)</li>
                    <li>Subtract target's armor</li>
                    <li>Apply remaining damage to hull/structure</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Common Weapon Damage</h3>
                  <div className="space-y-1">
                    {WEAPON_PRESETS.map(weapon => (
                      <div key={weapon.name} className="flex justify-between text-sm p-2 rounded hover:bg-muted">
                        <span className="font-medium">{weapon.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{weapon.damage}</Badge>
                          <span className="text-xs text-muted-foreground">{weapon.info}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Hit Location Table (2d6)</h3>
                  <div className="space-y-1">
                    {HIT_LOCATIONS.map(loc => (
                      <div key={loc.roll} className="text-sm p-2 rounded hover:bg-muted">
                        <div className="flex justify-between">
                          <span className="font-mono font-bold">{loc.roll}</span>
                          <span className="font-medium">{loc.location}</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-8">{loc.effect}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {finalDamage !== null && onApplyDamage && (
            <Button onClick={handleApply}>
              Apply {finalDamage} Damage
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
