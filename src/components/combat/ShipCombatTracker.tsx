import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rocket, Target, Zap, Shield, Plus, Trash2, Radio } from 'lucide-react';

interface ShipCombatant {
  id: string;
  name: string;
  isPlayerShip: boolean;

  // Ship stats
  hullCurrent: number;
  hullMax: number;
  powerAvailable: number;
  powerTotal: number;

  // Combat state
  rangeBand: 'adjacent' | 'close' | 'short' | 'medium' | 'long' | 'distant' | 'very_distant';
  facing: number; // 0-359 degrees
  hasMovedThisTurn: boolean;
  weaponsFiredThisTurn: number;

  // Crew stations
  pilot?: string;
  gunners: string[];
  engineer?: string;
  sensorsOfficer?: string;
}

export const ShipCombatTracker: React.FC = () => {
  const [ships, setShips] = useState<ShipCombatant[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [showAddShip, setShowAddShip] = useState(false);

  // Add ship form
  const [newShipName, setNewShipName] = useState('');
  const [newShipHull, setNewShipHull] = useState('20');
  const [newShipPower, setNewShipPower] = useState('10');
  const [newShipIsPlayer, setNewShipIsPlayer] = useState(true);

  const handleAddShip = () => {
    if (!newShipName.trim()) return;

    const newShip: ShipCombatant = {
      id: Date.now().toString(),
      name: newShipName,
      isPlayerShip: newShipIsPlayer,
      hullCurrent: parseInt(newShipHull) || 20,
      hullMax: parseInt(newShipHull) || 20,
      powerAvailable: parseInt(newShipPower) || 10,
      powerTotal: parseInt(newShipPower) || 10,
      rangeBand: 'medium',
      facing: 0,
      hasMovedThisTurn: false,
      weaponsFiredThisTurn: 0,
      gunners: [],
    };

    setShips(prev => [...prev, newShip]);
    setNewShipName('');
    setNewShipHull('20');
    setNewShipPower('10');
    setShowAddShip(false);
  };

  const handleDamage = (shipId: string, amount: number) => {
    setShips(prev => prev.map(ship => {
      if (ship.id === shipId) {
        return {
          ...ship,
          hullCurrent: Math.max(0, ship.hullCurrent - amount),
        };
      }
      return ship;
    }));
  };

  const handleRangeChange = (shipId: string, range: ShipCombatant['rangeBand']) => {
    setShips(prev => prev.map(ship => {
      if (ship.id === shipId) {
        return { ...ship, rangeBand: range };
      }
      return ship;
    }));
  };

  const handleNextRound = () => {
    setCurrentRound(prev => prev + 1);
    // Reset turn flags
    setShips(prev => prev.map(ship => ({
      ...ship,
      hasMovedThisTurn: false,
      weaponsFiredThisTurn: 0,
    })));
  };

  const handleDeleteShip = (shipId: string) => {
    setShips(prev => prev.filter(ship => ship.id !== shipId));
  };

  const rangeBandColors = {
    adjacent: 'bg-red-500/20 text-red-400 border-red-500/50',
    close: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    short: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    long: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    distant: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    very_distant: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  };

  return (
    <div className="h-full flex flex-col bg-black text-terminal-primary font-mono">
      <div className="border-b border-terminal-primary/30 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-terminal-primary flex items-center gap-2">
              <Rocket className="h-6 w-6" />
              SHIP COMBAT TRACKER
            </h1>
            <p className="text-terminal-primary/70 text-sm mt-1">
              Round {currentRound}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddShip(!showAddShip)}
              className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ship
            </Button>
            <Button
              onClick={handleNextRound}
              disabled={ships.length === 0}
              className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Next Round
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {/* Add Ship Form */}
        {showAddShip && (
          <Card className="bg-black border-terminal-primary/50 mb-4">
            <CardHeader>
              <CardTitle className="text-terminal-primary text-sm">Add Ship to Combat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Ship name..."
                    value={newShipName}
                    onChange={(e) => setNewShipName(e.target.value)}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                    Hull Points
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="20"
                    value={newShipHull}
                    onChange={(e) => setNewShipHull(e.target.value)}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                    Power Points
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={newShipPower}
                    onChange={(e) => setNewShipPower(e.target.value)}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-terminal-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newShipIsPlayer}
                      onChange={(e) => setNewShipIsPlayer(e.target.checked)}
                      className="rounded border-terminal-primary/50"
                    />
                    Player Ship
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddShip}
                  disabled={!newShipName.trim()}
                  size="sm"
                  className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                >
                  Add Ship
                </Button>
                <Button
                  onClick={() => setShowAddShip(false)}
                  size="sm"
                  variant="outline"
                  className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ships List */}
        {ships.length === 0 ? (
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="p-8 text-center text-terminal-primary/70">
              No ships in combat. Add ships to begin space combat tracking.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {ships.map(ship => {
              const hullPercent = (ship.hullCurrent / ship.hullMax) * 100;
              const powerPercent = (ship.powerAvailable / ship.powerTotal) * 100;

              return (
                <Card
                  key={ship.id}
                  className={`bg-black ${
                    ship.isPlayerShip
                      ? 'border-green-500/50'
                      : 'border-red-500/50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Rocket className="h-4 w-4 text-terminal-primary/70" />
                          <h3 className="font-bold text-terminal-primary">{ship.name}</h3>
                          {ship.isPlayerShip ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              Player
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                              Enemy
                            </Badge>
                          )}
                          <Badge className={rangeBandColors[ship.rangeBand]}>
                            {ship.rangeBand.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeleteShip(ship.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Hull Status */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-terminal-primary/70 mb-1">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span>Hull</span>
                        </div>
                        <span>{ship.hullCurrent} / {ship.hullMax}</span>
                      </div>
                      <div className="w-full bg-terminal-primary/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            hullPercent > 60 ? 'bg-green-500' :
                            hullPercent > 30 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${hullPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Power Status */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-terminal-primary/70 mb-1">
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>Power</span>
                        </div>
                        <span>{ship.powerAvailable} / {ship.powerTotal}</span>
                      </div>
                      <div className="w-full bg-terminal-primary/10 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${powerPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Combat Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-terminal-primary/70 mb-1 block">
                          Range Band
                        </label>
                        <Select
                          value={ship.rangeBand}
                          onValueChange={(v: any) => handleRangeChange(ship.id, v)}
                        >
                          <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50">
                            <SelectItem value="adjacent" className="text-terminal-primary">Adjacent</SelectItem>
                            <SelectItem value="close" className="text-terminal-primary">Close</SelectItem>
                            <SelectItem value="short" className="text-terminal-primary">Short</SelectItem>
                            <SelectItem value="medium" className="text-terminal-primary">Medium</SelectItem>
                            <SelectItem value="long" className="text-terminal-primary">Long</SelectItem>
                            <SelectItem value="distant" className="text-terminal-primary">Distant</SelectItem>
                            <SelectItem value="very_distant" className="text-terminal-primary">Very Distant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleDamage(ship.id, 1)}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          -1 Hull
                        </Button>
                        <Button
                          onClick={() => handleDamage(ship.id, 5)}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          -5 Hull
                        </Button>
                      </div>
                    </div>

                    {/* Turn Status */}
                    <div className="mt-3 pt-3 border-t border-terminal-primary/20 text-xs text-terminal-primary/60">
                      <div className="flex items-center gap-3">
                        <div>
                          Moved: {ship.hasMovedThisTurn ? '✓' : '✗'}
                        </div>
                        <div>
                          Weapons Fired: {ship.weaponsFiredThisTurn}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Combat Rules Reference */}
        {ships.length > 0 && (
          <Card className="bg-black border-terminal-primary/30 mt-4">
            <CardHeader>
              <CardTitle className="text-terminal-primary text-sm">Quick Reference</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-terminal-primary/70 space-y-1">
              <p>• <strong>Range Bands:</strong> Adjacent → Close → Short → Medium → Long → Distant → Very Distant</p>
              <p>• <strong>Each Round:</strong> Ships may move and fire weapons (with limitations)</p>
              <p>• <strong>Hull Damage:</strong> Reduces ship integrity. 0 hull = ship destroyed</p>
              <p>• <strong>Power:</strong> Required for special actions and systems</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
