// ============================================================================
// MUSTERING OUT COMPONENT
// Handles benefit rolls when a character leaves their career(s)
// ============================================================================

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dices, Gift, Coins, Ship, Shield, Swords, Star, Users, Award } from 'lucide-react';
import { ALL_CAREERS } from './careers';
import type { CareerDefinition, BenefitTableRow, BenefitOption, BenefitEntry } from './careers/types';
import { CareerTableDisplay } from './CareerTableDisplay';

// ============================================================================
// TYPES
// ============================================================================

interface CareerRecord {
  careerName: string;
  assignment: string;
  termsServed: number;
  highestRank: number;
  isCommissioned: boolean;
  benefitDMs: number[];      // Individual benefit DM bonuses (each used once)
  extraBenefitRolls: number;
  isPreCareer: boolean;
}

interface BenefitRollResult {
  careerName: string;
  rollType: 'cash' | 'benefit';
  diceRoll: number;
  totalRoll: number;
  dm: number;
  result: {
    cash?: number;
    benefit?: BenefitEntry;
  };
  appliedBenefit?: string; // Description of what was gained
}

interface MusteringOutProps {
  careerHistory: CareerRecord[];
  currentCash: number;
  currentShipShares: number;
  hasTasMembership: boolean;
  ships: string[];
  gamblerSkillLevel: number;
  characteristics: {
    strength: { total: number; current: number };
    dexterity: { total: number; current: number };
    endurance: { total: number; current: number };
    intellect: { total: number; current: number };
    education: { total: number; current: number };
    social: { total: number; current: number };
  };
  onComplete: (results: {
    cash: number;
    shipShares: number;
    tasMembership: boolean;
    ships: string[];
    characteristics: MusteringOutProps['characteristics'];
    allies: number;
    contacts: number;
    equipment: string[];
    benefitLog: BenefitRollResult[];
  }) => void;
  useManualDice?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const rollDice = (dice: number = 1, sides: number = 6): number => {
  let total = 0;
  for (let i = 0; i < dice; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

/**
 * Calculate benefit rolls for a career
 */
const calculateBenefitRolls = (
  termsServed: number,
  highestRank: number,
  extraRolls: number = 0
): { rolls: number; rankDM: number } => {
  let rolls = termsServed;
  let rankDM = 0;

  if (highestRank >= 5) {
    rolls += 3;
    rankDM = 1;
  } else if (highestRank >= 3) {
    rolls += 2;
  } else if (highestRank >= 1) {
    rolls += 1;
  }

  rolls += extraRolls;
  return { rolls, rankDM };
};

/**
 * Get career definition by name
 */
const getCareerDefinition = (careerName: string): CareerDefinition | undefined => {
  return ALL_CAREERS.find(c => c.name === careerName);
};

/**
 * Format benefit option for display
 */
const formatBenefitOption = (option: BenefitOption): string => {
  switch (option.type) {
    case 'characteristic':
      const statName = option.stat === 'social' ? 'SOC' :
        option.stat === 'intellect' ? 'INT' :
        option.stat === 'education' ? 'EDU' :
        option.stat === 'strength' ? 'STR' :
        option.stat === 'dexterity' ? 'DEX' :
        option.stat === 'endurance' ? 'END' :
        option.stat?.toUpperCase() || 'STAT';
      return `${statName} +${option.amount || 1}`;
    case 'skill':
      return option.skill || 'Skill';
    case 'item':
      return option.itemType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Item';
    case 'ship_shares':
      return typeof option.shares === 'number'
        ? `${option.shares} Ship Share${option.shares !== 1 ? 's' : ''}`
        : `${option.shares} Ship Shares`;
    case 'ship':
      return option.shipType || 'Ship';
    case 'vehicle':
      return option.vehicleType || 'Vehicle';
    case 'ally':
      return 'Ally';
    case 'contact':
      return 'Contact';
    case 'tas_membership':
      return 'TAS Membership';
    default:
      return 'Unknown';
  }
};

/**
 * Format benefit entry for display
 */
const formatBenefitEntry = (entry: BenefitEntry): string => {
  const options = entry.options.map(formatBenefitOption);
  if (entry.isChoice) {
    return options.join(' or ');
  }
  return options.join(' and ');
};

// ============================================================================
// COMPONENT
// ============================================================================

export const MusteringOut: React.FC<MusteringOutProps> = ({
  careerHistory,
  currentCash,
  currentShipShares,
  hasTasMembership,
  ships: initialShips,
  gamblerSkillLevel,
  characteristics: initialCharacteristics,
  onComplete,
  useManualDice = false,
}) => {
  // Filter out pre-careers (they don't get benefits)
  const eligibleCareers = useMemo(() =>
    careerHistory.filter(c => !c.isPreCareer),
    [careerHistory]
  );

  // Calculate total benefit rolls per career
  const careerBenefits = useMemo(() => {
    return eligibleCareers.map(career => {
      const { rolls, rankDM } = calculateBenefitRolls(
        career.termsServed,
        career.highestRank,
        career.extraBenefitRolls
      );
      return {
        ...career,
        totalRolls: rolls,
        rankDM,
      };
    });
  }, [eligibleCareers]);

  // Pool all benefit DMs from all careers into a single list (sorted descending for auto-apply)
  const initialBenefitDMPool = useMemo(() => {
    const allDMs: number[] = [];
    eligibleCareers.forEach(career => {
      if (career.benefitDMs) {
        allDMs.push(...career.benefitDMs);
      }
    });
    return allDMs.sort((a, b) => b - a); // Sort descending (highest first)
  }, [eligibleCareers]);

  // State
  const [cashRollsUsed, setCashRollsUsed] = useState(0);
  const [benefitLog, setBenefitLog] = useState<BenefitRollResult[]>([]);
  const [accumulatedCash, setAccumulatedCash] = useState(currentCash);
  const [accumulatedShipShares, setAccumulatedShipShares] = useState(currentShipShares);
  const [accumulatedTAS, setAccumulatedTAS] = useState(hasTasMembership);
  const [accumulatedShips, setAccumulatedShips] = useState<string[]>(initialShips);
  const [accumulatedAllies, setAccumulatedAllies] = useState(0);
  const [accumulatedContacts, setAccumulatedContacts] = useState(0);
  const [accumulatedEquipment, setAccumulatedEquipment] = useState<string[]>([]);
  const [characteristics, setCharacteristics] = useState(initialCharacteristics);

  // Track available benefit DMs from events (each can only be used once)
  const [availableBenefitDMs, setAvailableBenefitDMs] = useState<number[]>(initialBenefitDMPool);
  // Player toggle: whether to apply an event DM to the next roll
  const [applyEventDM, setApplyEventDM] = useState(false);
  // Manual dice input
  const [manualDiceValue, setManualDiceValue] = useState('');

  // Track rolls remaining per career
  const [rollsRemaining, setRollsRemaining] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    careerBenefits.forEach((career, idx) => {
      initial[`${career.careerName}-${idx}`] = career.totalRolls;
    });
    return initial;
  });

  // Current roll state
  const [currentCareerIdx, setCurrentCareerIdx] = useState<number | null>(null);
  const [pendingBenefitChoice, setPendingBenefitChoice] = useState<BenefitEntry | null>(null);
  const [lastRollResult, setLastRollResult] = useState<{
    type: 'cash' | 'benefit';
    roll: number;
    total: number;
    dm: number;
    cash?: number;
    benefit?: BenefitEntry;
  } | null>(null);

  const maxCashRolls = 3;
  const canRollCash = cashRollsUsed < maxCashRolls;

  // Calculate total rolls remaining
  const totalRollsRemaining = Object.values(rollsRemaining).reduce((a, b) => a + b, 0);

  /**
   * Roll for cash benefit
   */
  const rollCash = (careerIdx: number, manualRoll?: number) => {
    const career = careerBenefits[careerIdx];
    const careerKey = `${career.careerName}-${careerIdx}`;

    if (rollsRemaining[careerKey] <= 0 || !canRollCash) return;

    const careerDef = getCareerDefinition(career.careerName);
    if (!careerDef?.benefitsTable) return;

    // Only use event DM if player has toggled it on
    const eventDM = (applyEventDM && availableBenefitDMs.length > 0) ? availableBenefitDMs[0] : 0;

    // Calculate DM: event DM (one use) + rank DM + Gambler skill
    const dm = eventDM + career.rankDM + gamblerSkillLevel;
    const roll = manualRoll ?? rollDice(1, 6);
    const total = Math.min(Math.max(roll + dm, 1), 7); // Clamp to 1-7

    const benefitRow = careerDef.benefitsTable[total - 1];
    const cashAmount = benefitRow?.cash || 0;

    setAccumulatedCash(prev => prev + cashAmount);
    setCashRollsUsed(prev => prev + 1);
    setRollsRemaining(prev => ({
      ...prev,
      [careerKey]: prev[careerKey] - 1,
    }));

    // Consume the event DM if used (remove from pool) and reset toggle
    if (eventDM > 0) {
      setAvailableBenefitDMs(prev => prev.slice(1));
      setApplyEventDM(false);
    }

    const result: BenefitRollResult = {
      careerName: career.careerName,
      rollType: 'cash',
      diceRoll: roll,
      totalRoll: total,
      dm,
      result: { cash: cashAmount },
      appliedBenefit: cashAmount ? `Cr${cashAmount.toLocaleString()}` : 'No cash',
    };

    setBenefitLog(prev => [...prev, result]);
    setLastRollResult({
      type: 'cash',
      roll,
      total,
      dm,
      cash: cashAmount,
    });
    setCurrentCareerIdx(null);
  };

  /**
   * Roll for benefit (non-cash)
   */
  const rollBenefit = (careerIdx: number, manualRoll?: number) => {
    const career = careerBenefits[careerIdx];
    const careerKey = `${career.careerName}-${careerIdx}`;

    if (rollsRemaining[careerKey] <= 0) return;

    const careerDef = getCareerDefinition(career.careerName);
    if (!careerDef?.benefitsTable) return;

    // Only use event DM if player has toggled it on
    const eventDM = (applyEventDM && availableBenefitDMs.length > 0) ? availableBenefitDMs[0] : 0;

    // Calculate DM: event DM (one use) + rank DM (no Gambler for non-cash)
    const dm = eventDM + career.rankDM;
    const roll = manualRoll ?? rollDice(1, 6);
    const total = Math.min(Math.max(roll + dm, 1), 7);

    const benefitRow = careerDef.benefitsTable[total - 1];
    const benefit = benefitRow?.benefit;

    setRollsRemaining(prev => ({
      ...prev,
      [careerKey]: prev[careerKey] - 1,
    }));

    // Consume the event DM if used (remove from pool) and reset toggle
    if (eventDM > 0) {
      setAvailableBenefitDMs(prev => prev.slice(1));
      setApplyEventDM(false);
    }

    setLastRollResult({
      type: 'benefit',
      roll,
      total,
      dm,
      benefit,
    });

    // If benefit has choices, show choice UI
    if (benefit?.isChoice && benefit.options.length > 1) {
      setPendingBenefitChoice(benefit);
      setCurrentCareerIdx(careerIdx);
    } else if (benefit) {
      // Apply all options automatically
      applyBenefitOptions(benefit.options, career.careerName, roll, total, dm);
    }
  };

  /**
   * Apply selected benefit option(s)
   */
  const applyBenefitOptions = (
    options: BenefitOption[],
    careerName: string,
    roll: number,
    total: number,
    dm: number
  ) => {
    const appliedBenefits: string[] = [];

    options.forEach(option => {
      switch (option.type) {
        case 'characteristic':
          if (option.stat && option.stat !== 'psionics') {
            const statKey = option.stat as keyof typeof characteristics;
            setCharacteristics(prev => ({
              ...prev,
              [statKey]: {
                total: prev[statKey].total + (option.amount || 1),
                current: prev[statKey].current + (option.amount || 1),
              },
            }));
            appliedBenefits.push(formatBenefitOption(option));
          }
          break;
        case 'ship_shares':
          let shares = 0;
          if (typeof option.shares === 'number') {
            shares = option.shares;
          } else if (option.shares === '1D') {
            shares = rollDice(1, 6);
          } else if (option.shares === '2D') {
            shares = rollDice(2, 6);
          }
          setAccumulatedShipShares(prev => prev + shares);
          appliedBenefits.push(`${shares} Ship Shares`);
          break;
        case 'ship':
          if (option.shipType) {
            setAccumulatedShips(prev => [...prev, option.shipType!]);
            appliedBenefits.push(option.shipType);
          }
          break;
        case 'tas_membership':
          if (!accumulatedTAS) {
            setAccumulatedTAS(true);
            appliedBenefits.push('TAS Membership');
          } else {
            // Already have TAS, gain ship share instead
            setAccumulatedShipShares(prev => prev + 1);
            appliedBenefits.push('1 Ship Share (already have TAS)');
          }
          break;
        case 'ally':
          setAccumulatedAllies(prev => prev + 1);
          appliedBenefits.push('Ally');
          break;
        case 'contact':
          setAccumulatedContacts(prev => prev + 1);
          appliedBenefits.push('Contact');
          break;
        case 'item':
          if (option.itemType) {
            const itemName = option.itemType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            setAccumulatedEquipment(prev => [...prev, itemName]);
            appliedBenefits.push(itemName);
          }
          break;
        case 'vehicle':
          if (option.vehicleType) {
            setAccumulatedEquipment(prev => [...prev, option.vehicleType!]);
            appliedBenefits.push(option.vehicleType);
          }
          break;
        case 'skill':
          // Skills from benefits - just log for now, would need skill system integration
          if (option.skill) {
            appliedBenefits.push(`${option.skill} skill`);
          }
          break;
      }
    });

    const result: BenefitRollResult = {
      careerName,
      rollType: 'benefit',
      diceRoll: roll,
      totalRoll: total,
      dm,
      result: { benefit: { options, isChoice: false } },
      appliedBenefit: appliedBenefits.join(', '),
    };

    setBenefitLog(prev => [...prev, result]);
    setPendingBenefitChoice(null);
    setCurrentCareerIdx(null);
  };

  /**
   * Handle choosing a benefit option
   */
  const handleBenefitChoice = (option: BenefitOption) => {
    if (!lastRollResult || currentCareerIdx === null) return;

    const career = careerBenefits[currentCareerIdx];
    applyBenefitOptions(
      [option],
      career.careerName,
      lastRollResult.roll,
      lastRollResult.total,
      lastRollResult.dm
    );
  };

  /**
   * Complete mustering out
   */
  const handleComplete = () => {
    onComplete({
      cash: accumulatedCash,
      shipShares: accumulatedShipShares,
      tasMembership: accumulatedTAS,
      ships: accumulatedShips,
      characteristics,
      allies: accumulatedAllies,
      contacts: accumulatedContacts,
      equipment: accumulatedEquipment,
      benefitLog,
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-4">
      <Card className="border-terminal-primary/30 bg-terminal-bg">
        <CardHeader className="pb-2">
          <CardTitle className="text-terminal-primary text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Mustering Out Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="bg-terminal-primary/10 rounded p-2">
              <div className="text-terminal-primary/60 text-xs">Cash</div>
              <div className="text-terminal-primary font-mono">Cr{accumulatedCash.toLocaleString()}</div>
            </div>
            <div className="bg-terminal-primary/10 rounded p-2">
              <div className="text-terminal-primary/60 text-xs">Ship Shares</div>
              <div className="text-terminal-primary font-mono">{accumulatedShipShares}</div>
            </div>
            <div className="bg-terminal-primary/10 rounded p-2">
              <div className="text-terminal-primary/60 text-xs">Cash Rolls</div>
              <div className="text-terminal-primary font-mono">{cashRollsUsed}/{maxCashRolls}</div>
            </div>
            <div className="bg-terminal-primary/10 rounded p-2">
              <div className="text-terminal-primary/60 text-xs">Rolls Left</div>
              <div className="text-terminal-primary font-mono">{totalRollsRemaining}</div>
            </div>
          </div>

          {/* TAS and Ships */}
          {(accumulatedTAS || accumulatedShips.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {accumulatedTAS && (
                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Star className="h-3 w-3" /> TAS Member
                </span>
              )}
              {accumulatedShips.map((ship, idx) => (
                <span key={idx} className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Ship className="h-3 w-3" /> {ship}
                </span>
              ))}
            </div>
          )}

          {/* Equipment */}
          {accumulatedEquipment.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {accumulatedEquipment.map((item, idx) => (
                <span key={idx} className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                  {item.toLowerCase().includes('armour') || item.toLowerCase().includes('armor') ? (
                    <Shield className="h-3 w-3" />
                  ) : item.toLowerCase().includes('weapon') || item.toLowerCase().includes('blade') || item.toLowerCase().includes('gun') ? (
                    <Swords className="h-3 w-3" />
                  ) : (
                    <Award className="h-3 w-3" />
                  )}
                  {item}
                </span>
              ))}
            </div>
          )}

          {/* Allies/Contacts */}
          {(accumulatedAllies > 0 || accumulatedContacts > 0) && (
            <div className="flex gap-4 text-sm">
              {accumulatedAllies > 0 && (
                <span className="text-green-400 flex items-center gap-1">
                  <Users className="h-4 w-4" /> {accumulatedAllies} Ally{accumulatedAllies !== 1 ? 's' : ''}
                </span>
              )}
              {accumulatedContacts > 0 && (
                <span className="text-blue-400 flex items-center gap-1">
                  <Users className="h-4 w-4" /> {accumulatedContacts} Contact{accumulatedContacts !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Benefit Choice */}
      {pendingBenefitChoice && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-sm">Choose Your Benefit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pendingBenefitChoice.options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleBenefitChoice(option)}
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                >
                  {formatBenefitOption(option)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Roll Result */}
      {lastRollResult && !pendingBenefitChoice && (
        <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
          <Dices className="h-4 w-4" />
          <AlertDescription className="text-terminal-primary/80">
            <span className="font-mono">
              Rolled {lastRollResult.roll} + {lastRollResult.dm} DM = {lastRollResult.total}
            </span>
            {lastRollResult.type === 'cash' && lastRollResult.cash !== undefined && (
              <span className="ml-2 text-green-400">→ Cr{lastRollResult.cash.toLocaleString()}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Career Benefit Rolls */}
      {totalRollsRemaining > 0 && !pendingBenefitChoice ? (
        <div className="space-y-3">
          {/* Show available benefit DMs from events with player toggle */}
          {availableBenefitDMs.length > 0 && (
            <Alert className="border-amber-500/30 bg-amber-500/10">
              <Award className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-300/80 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{availableBenefitDMs.length} Event DM{availableBenefitDMs.length !== 1 ? 's' : ''} Available:</span>
                    {' '}[{availableBenefitDMs.map(dm => `+${dm}`).join(', ')}]
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={applyEventDM}
                      onChange={(e) => setApplyEventDM(e.target.checked)}
                      className="accent-amber-400"
                    />
                    <span className={applyEventDM ? 'text-amber-300 font-semibold' : 'text-amber-300/60'}>
                      Apply DM+{availableBenefitDMs[0]} to next roll
                    </span>
                  </label>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {careerBenefits.map((career, idx) => {
            const careerKey = `${career.careerName}-${idx}`;
            const remaining = rollsRemaining[careerKey] || 0;

            if (remaining === 0) return null;

            const careerDef = getCareerDefinition(career.careerName);

            return (
              <Card key={careerKey} className="border-terminal-primary/20 bg-terminal-bg">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-terminal-primary font-medium">{career.careerName}</div>
                      <div className="text-terminal-primary/60 text-xs">
                        {remaining} roll{remaining !== 1 ? 's' : ''} remaining
                        {career.rankDM > 0 && ` • DM+${career.rankDM} from rank`}
                      </div>
                    </div>
                    {useManualDice ? (
                      <div className="space-y-2 mt-2">
                        <p className="text-xs text-blue-400">Enter your 1D6 roll result:</p>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={6}
                            value={manualDiceValue}
                            onChange={(e) => setManualDiceValue(e.target.value)}
                            placeholder="1D6 (1-6)"
                            className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40 w-24"
                          />
                          <Button
                            onClick={() => {
                              const val = parseInt(manualDiceValue);
                              if (!isNaN(val) && val >= 1 && val <= 6) {
                                rollCash(idx, val);
                                setManualDiceValue('');
                              }
                            }}
                            disabled={!canRollCash || !manualDiceValue || isNaN(parseInt(manualDiceValue)) || parseInt(manualDiceValue) < 1 || parseInt(manualDiceValue) > 6}
                            size="sm"
                            variant="outline"
                            className={canRollCash
                              ? "border-green-500/50 text-green-400 hover:bg-green-500/20"
                              : "border-gray-500/30 text-gray-500 cursor-not-allowed"
                            }
                          >
                            <Coins className="h-4 w-4 mr-1" />
                            Cash
                          </Button>
                          <Button
                            onClick={() => {
                              const val = parseInt(manualDiceValue);
                              if (!isNaN(val) && val >= 1 && val <= 6) {
                                rollBenefit(idx, val);
                                setManualDiceValue('');
                              }
                            }}
                            disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue)) || parseInt(manualDiceValue) < 1 || parseInt(manualDiceValue) > 6}
                            size="sm"
                            variant="outline"
                            className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Benefit
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => rollCash(idx)}
                          disabled={!canRollCash}
                          size="sm"
                          variant="outline"
                          className={canRollCash
                            ? "border-green-500/50 text-green-400 hover:bg-green-500/20"
                            : "border-gray-500/30 text-gray-500 cursor-not-allowed"
                          }
                        >
                          <Coins className="h-4 w-4 mr-1" />
                          Cash
                        </Button>
                        <Button
                          onClick={() => rollBenefit(idx)}
                          size="sm"
                          variant="outline"
                          className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                        >
                          <Gift className="h-4 w-4 mr-1" />
                          Benefit
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Show benefit table (collapsible) */}
                  {careerDef?.benefitsTable && (
                    <div className="mt-2">
                      <CareerTableDisplay
                        title={`${career.careerName} Benefits Table (1D6)`}
                        titleColor="text-amber-400"
                        entries={careerDef.benefitsTable.map((row, i) => ({
                          index: i + 1,
                          label: `${i + 1}.`,
                          description: `Cash: Cr${(row.cash || 0).toLocaleString()} | Benefit: ${formatBenefitEntry(row.benefit)}`,
                        }))}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : totalRollsRemaining === 0 && !pendingBenefitChoice ? (
        <Alert className="bg-green-500/10 border-green-500/50">
          <AlertDescription className="text-green-400">
            All benefit rolls complete! Review your gains above and click "Finish" to continue.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Benefit Log */}
      {benefitLog.length > 0 && (
        <Card className="border-terminal-primary/20 bg-terminal-bg">
          <CardHeader className="pb-2">
            <CardTitle className="text-terminal-primary/60 text-sm">Benefit Roll Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-1 text-xs font-mono">
                {benefitLog.map((entry, idx) => (
                  <div key={idx} className="text-terminal-primary/70">
                    <span className="text-terminal-primary/50">{entry.careerName}:</span>{' '}
                    <span className={entry.rollType === 'cash' ? 'text-green-400' : 'text-blue-400'}>
                      {entry.rollType === 'cash' ? '💰' : '🎁'}
                    </span>{' '}
                    Roll {entry.diceRoll}+{entry.dm}={entry.totalRoll} → {entry.appliedBenefit}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        disabled={totalRollsRemaining > 0 || pendingBenefitChoice !== null}
        className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 disabled:opacity-50"
      >
        {totalRollsRemaining > 0
          ? `Complete All Rolls (${totalRollsRemaining} remaining)`
          : 'Finish Mustering Out'
        }
      </Button>
    </div>
  );
};

export default MusteringOut;
