import React from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Scale } from 'lucide-react';

interface EncumbranceTrackerProps {
  ownerId: string;
  strengthScore: number;
  ownerName?: string;
}

export const EncumbranceTracker: React.FC<EncumbranceTrackerProps> = ({
  ownerId,
  strengthScore,
  ownerName,
}) => {
  const { calculateEncumbrance } = useInventory();

  const encumbrance = calculateEncumbrance(ownerId, strengthScore);

  const getEncumbranceColor = () => {
    switch (encumbrance.encumbranceLevel) {
      case 'none':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'light':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'heavy':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'overloaded':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getEncumbranceLabel = () => {
    switch (encumbrance.encumbranceLevel) {
      case 'none':
        return 'No Encumbrance';
      case 'light':
        return 'Light Load';
      case 'heavy':
        return 'Heavy Load';
      case 'overloaded':
        return 'Overloaded!';
      default:
        return 'Unknown';
    }
  };

  const getProgressPercent = () => {
    return Math.min((encumbrance.totalWeight / encumbrance.weightLimit) * 100, 100);
  };

  const lightLimit = strengthScore * 2;
  const heavyLimit = strengthScore * 4;

  return (
    <Card className="bg-black border-terminal-primary/50">
      <CardHeader>
        <CardTitle className="text-terminal-primary text-sm flex items-center gap-2">
          <Scale className="h-4 w-4" />
          Encumbrance {ownerName && `- ${ownerName}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge className={getEncumbranceColor()}>
            {getEncumbranceLabel()}
          </Badge>
          {encumbrance.penalty < 0 && (
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{encumbrance.penalty} to physical checks</span>
            </div>
          )}
        </div>

        {/* Weight Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-terminal-primary/70 mb-1">
            <span>Carried Weight</span>
            <span>{encumbrance.totalWeight.toFixed(2)} / {encumbrance.weightLimit} kg</span>
          </div>
          <div className="w-full bg-terminal-primary/10 rounded-full h-3 relative overflow-hidden">
            {/* Progress fill */}
            <div
              className={`h-3 rounded-full transition-all ${
                encumbrance.encumbranceLevel === 'none'
                  ? 'bg-green-500'
                  : encumbrance.encumbranceLevel === 'light'
                  ? 'bg-yellow-500'
                  : encumbrance.encumbranceLevel === 'heavy'
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${getProgressPercent()}%` }}
            />

            {/* Threshold markers */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-terminal-primary/50"
              style={{ left: `${(lightLimit / encumbrance.weightLimit) * 100}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-terminal-primary/50"
              style={{ left: `${(heavyLimit / encumbrance.weightLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Thresholds */}
        <div className="grid grid-cols-3 gap-2 text-xs text-terminal-primary/70">
          <div className="flex flex-col">
            <span className="text-green-400">No Load</span>
            <span className="font-mono">0 - {lightLimit} kg</span>
          </div>
          <div className="flex flex-col">
            <span className="text-yellow-400">Light (-1)</span>
            <span className="font-mono">{lightLimit + 0.01} - {heavyLimit} kg</span>
          </div>
          <div className="flex flex-col">
            <span className="text-orange-400">Heavy (-2)</span>
            <span className="font-mono">{heavyLimit + 0.01} - {encumbrance.weightLimit} kg</span>
          </div>
        </div>

        {/* Overload warning */}
        {encumbrance.totalWeight > encumbrance.weightLimit && (
          <div className="bg-red-500/10 border border-red-500/50 rounded p-2 text-xs text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-bold">Overloaded!</p>
                <p>
                  You are carrying {(encumbrance.totalWeight - encumbrance.weightLimit).toFixed(2)} kg over your maximum capacity.
                  You suffer -3 to all physical checks and movement is severely restricted.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STR Info */}
        <div className="text-xs text-terminal-primary/60 border-t border-terminal-primary/20 pt-2">
          <p>Based on STR {strengthScore}</p>
          <p className="text-terminal-primary/40">
            Traveller encumbrance: STR×2 (light), STR×4 (heavy), STR×6 (max)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
