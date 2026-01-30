import React, { useState } from 'react';
import { useTrade } from '@/contexts/TradeContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Store,
  Dice5,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Package,
} from 'lucide-react';
import { roll2d6 } from '@/lib/dice';
import {
  TRADE_GOODS,
  TRADE_CODES,
  TradeGoodType,
  getTradeCodeDM,
  getPriceModifier,
  calculateActualPrice,
  calculateTonsAvailable,
} from '@/data/tradeGoods';

interface MarketGood {
  good: TradeGoodType;
  available: boolean;
  availabilityRoll: number;
  tonsAvailable: number;
  priceRoll: number;
  priceDM: number;
  modifiedRoll: number;
  priceModifier: number;
  actualPrice: number;
  profitIndicator: 'high' | 'normal' | 'low';
}

interface MarketGeneratorProps {
  onPurchase?: (good: MarketGood, tons: number, vehicleId?: string) => void;
}

export const MarketGenerator: React.FC<MarketGeneratorProps> = ({ onPurchase }) => {
  const { purchaseTradeGood, saveMarketRoll } = useTrade();
  const { vehicles } = useCampaign();

  // World configuration
  const [worldName, setWorldName] = useState('');
  const [selectedTradeCodes, setSelectedTradeCodes] = useState<string[]>([]);
  const [populationCode, setPopulationCode] = useState('5');
  const [brokerSkill, setBrokerSkill] = useState('0');

  // Generated market
  const [marketGoods, setMarketGoods] = useState<MarketGood[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Purchase state
  const [purchasingGood, setPurchasingGood] = useState<MarketGood | null>(null);
  const [purchaseTons, setPurchaseTons] = useState('1');
  const [purchaseVehicle, setPurchaseVehicle] = useState('none');

  const toggleTradeCode = (code: string) => {
    setSelectedTradeCodes(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const generateMarket = async () => {
    setIsGenerating(true);
    const generatedGoods: MarketGood[] = [];
    const broker = parseInt(brokerSkill) || 0;
    const pop = parseInt(populationCode) || 5;

    for (const good of TRADE_GOODS) {
      // Roll for availability
      const availRoll = roll2d6();
      const available = availRoll >= good.availability;

      if (!available) {
        generatedGoods.push({
          good,
          available: false,
          availabilityRoll: availRoll,
          tonsAvailable: 0,
          priceRoll: 0,
          priceDM: 0,
          modifiedRoll: 0,
          priceModifier: 0,
          actualPrice: good.basePrice,
          profitIndicator: 'normal',
        });
        continue;
      }

      // Calculate tons available
      const tonsAvailable = calculateTonsAvailable(pop);

      // Roll for price with DMs
      const priceRoll = roll2d6();
      const tradeDM = getTradeCodeDM(good, selectedTradeCodes, false);
      const totalDM = tradeDM + broker;

      // For purchases, we want LOWER prices (so we SUBTRACT the DM from the roll)
      // Lower modified roll = better purchase price
      const modifiedRoll = Math.max(2, priceRoll - totalDM);
      const priceModifier = getPriceModifier(modifiedRoll, false);
      const actualPrice = calculateActualPrice(good.basePrice, priceModifier);

      // Determine profit indicator
      let profitIndicator: 'high' | 'normal' | 'low' = 'normal';
      if (priceModifier <= -20) profitIndicator = 'high';
      else if (priceModifier >= 20) profitIndicator = 'low';

      generatedGoods.push({
        good,
        available: true,
        availabilityRoll: availRoll,
        tonsAvailable,
        priceRoll,
        priceDM: totalDM,
        modifiedRoll,
        priceModifier,
        actualPrice,
        profitIndicator,
      });
    }

    // Sort: available goods first, then by profit indicator
    generatedGoods.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (a.profitIndicator === 'high' && b.profitIndicator !== 'high') return -1;
      if (b.profitIndicator === 'high' && a.profitIndicator !== 'high') return 1;
      return 0;
    });

    setMarketGoods(generatedGoods);

    // Save market roll to history
    await saveMarketRoll({
      world_name: worldName || 'Unknown World',
      trade_codes: selectedTradeCodes,
      available_goods: generatedGoods.filter(g => g.available).map(g => ({
        name: g.good.name,
        tons: g.tonsAvailable,
        price: g.actualPrice,
      })),
    });

    setIsGenerating(false);
  };

  const handlePurchase = async () => {
    if (!purchasingGood) return;

    const tons = parseFloat(purchaseTons) || 1;
    const totalPrice = Math.round(purchasingGood.actualPrice * tons);

    await purchaseTradeGood({
      name: purchasingGood.good.name,
      trade_code: purchasingGood.good.id,
      base_price: purchasingGood.good.basePrice,
      tons,
      purchase_price: totalPrice,
      purchase_world: worldName || undefined,
      purchase_date: new Date().toISOString(),
      vehicle_id: purchaseVehicle === 'none' ? undefined : purchaseVehicle,
      is_speculation: true,
      broker_skill_used: parseInt(brokerSkill) || 0,
    });

    // Update available tons
    setMarketGoods(prev => prev.map(mg => {
      if (mg.good.id === purchasingGood.good.id) {
        return { ...mg, tonsAvailable: Math.max(0, mg.tonsAvailable - tons) };
      }
      return mg;
    }));

    setPurchasingGood(null);
    setPurchaseTons('1');
  };

  const availableGoods = marketGoods.filter(g => g.available && g.tonsAvailable > 0);
  const unavailableGoods = marketGoods.filter(g => !g.available);

  return (
    <div className="space-y-4">
      {/* World Configuration */}
      <Card className="bg-black border-terminal-primary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-terminal-primary text-sm flex items-center gap-2">
            <Store className="h-4 w-4" />
            World Market Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* World Name & Population */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                World Name
              </label>
              <Input
                placeholder="e.g., Regina, Efate"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
            </div>
            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                Population Code (0-10)
              </label>
              <Select value={populationCode} onValueChange={setPopulationCode}>
                <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-terminal-primary/50">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                    <SelectItem key={p} value={p.toString()} className="text-terminal-primary">
                      {p} - {p === 0 ? 'Unpopulated' : p <= 3 ? 'Low' : p <= 6 ? 'Moderate' : p <= 8 ? 'High' : 'Very High'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trade Codes Selection */}
          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-2 block">
              World Trade Codes (Select all that apply)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {Object.entries(TRADE_CODES).map(([code, name]) => (
                <div key={code} className="flex items-center space-x-1">
                  <Checkbox
                    id={`tc-${code}`}
                    checked={selectedTradeCodes.includes(code)}
                    onCheckedChange={() => toggleTradeCode(code)}
                    className="border-terminal-primary/50 data-[state=checked]:bg-terminal-primary data-[state=checked]:text-black"
                  />
                  <Label
                    htmlFor={`tc-${code}`}
                    className="text-xs text-terminal-primary cursor-pointer"
                    title={name}
                  >
                    {code}
                  </Label>
                </div>
              ))}
            </div>
            {selectedTradeCodes.length > 0 && (
              <div className="mt-2 text-xs text-terminal-primary/60">
                Selected: {selectedTradeCodes.map(c => `${c} (${TRADE_CODES[c]})`).join(', ')}
              </div>
            )}
          </div>

          {/* Broker Skill */}
          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                Broker Skill
              </label>
              <Select value={brokerSkill} onValueChange={setBrokerSkill}>
                <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-terminal-primary/50">
                  {[0, 1, 2, 3, 4, 5, 6].map(level => (
                    <SelectItem key={level} value={level.toString()} className="text-terminal-primary">
                      {level === 0 ? 'None' : `Level ${level}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateMarket}
              disabled={isGenerating}
              className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 mt-5"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Dice5 className="h-4 w-4 mr-2" />
              )}
              Generate Market
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Dialog */}
      {purchasingGood && (
        <Card className="bg-black border-green-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Purchase: {purchasingGood.good.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                  Tons to Purchase
                </label>
                <Input
                  type="number"
                  min="0.1"
                  max={purchasingGood.tonsAvailable}
                  step="0.1"
                  value={purchaseTons}
                  onChange={(e) => setPurchaseTons(e.target.value)}
                  className="bg-black border-terminal-primary/50 text-terminal-primary"
                />
                <div className="text-xs text-terminal-primary/50 mt-1">
                  Max available: {purchasingGood.tonsAvailable} tons
                </div>
              </div>
              <div>
                <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                  Store on Vehicle
                </label>
                <Select value={purchaseVehicle} onValueChange={setPurchaseVehicle}>
                  <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-terminal-primary/50">
                    <SelectItem value="none" className="text-terminal-primary">
                      None (General)
                    </SelectItem>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id} className="text-terminal-primary">
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-terminal-primary/10 rounded border border-terminal-primary/30">
              <div className="flex justify-between items-center">
                <span className="text-terminal-primary/70">Price per ton:</span>
                <span className="text-terminal-primary font-bold">
                  {purchasingGood.actualPrice.toLocaleString()} Cr
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-terminal-primary/70">Total cost:</span>
                <span className="text-terminal-primary font-bold text-lg">
                  {Math.round(purchasingGood.actualPrice * (parseFloat(purchaseTons) || 0)).toLocaleString()} Cr
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePurchase}
                disabled={!purchaseTons || parseFloat(purchaseTons) <= 0}
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Confirm Purchase
              </Button>
              <Button
                onClick={() => setPurchasingGood(null)}
                variant="outline"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Market */}
      {marketGoods.length > 0 && (
        <Card className="bg-black border-terminal-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-terminal-primary text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Available Goods ({availableGoods.length})
              </span>
              <Button
                onClick={generateMarket}
                variant="ghost"
                size="sm"
                className="text-terminal-primary/70 hover:text-terminal-primary"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reroll
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {availableGoods.map((mg) => (
                  <Card
                    key={mg.good.id}
                    className={`bg-black cursor-pointer hover:border-terminal-primary/70 transition-colors ${
                      mg.profitIndicator === 'high'
                        ? 'border-green-500/50'
                        : mg.profitIndicator === 'low'
                        ? 'border-red-500/30'
                        : 'border-terminal-primary/30'
                    }`}
                    onClick={() => setPurchasingGood(mg)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-terminal-primary">{mg.good.name}</h4>
                            {mg.good.illegal && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                ILLEGAL
                              </Badge>
                            )}
                            {mg.profitIndicator === 'high' && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Good Deal
                              </Badge>
                            )}
                            {mg.profitIndicator === 'low' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Overpriced
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-terminal-primary/70 mt-1">
                            <span>{mg.tonsAvailable} tons available</span>
                            <span>•</span>
                            <span>Base: {mg.good.basePrice.toLocaleString()} Cr</span>
                            <span>•</span>
                            <span className={mg.priceModifier < 0 ? 'text-green-400' : mg.priceModifier > 0 ? 'text-red-400' : ''}>
                              {mg.priceModifier > 0 ? '+' : ''}{mg.priceModifier}%
                            </span>
                          </div>

                          {mg.good.description && (
                            <p className="text-xs text-terminal-primary/50 mt-1">
                              {mg.good.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            mg.profitIndicator === 'high'
                              ? 'text-green-400'
                              : mg.profitIndicator === 'low'
                              ? 'text-red-400'
                              : 'text-terminal-primary'
                          }`}>
                            {mg.actualPrice.toLocaleString()} Cr
                          </div>
                          <div className="text-xs text-terminal-primary/50">per ton</div>
                        </div>
                      </div>

                      {/* Roll details */}
                      <div className="mt-2 pt-2 border-t border-terminal-primary/20 text-xs text-terminal-primary/50">
                        Roll: {mg.priceRoll} - DM {mg.priceDM} = {mg.modifiedRoll}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Unavailable goods section */}
                {unavailableGoods.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-terminal-primary/20">
                    <h4 className="text-xs text-terminal-primary/50 uppercase mb-2">
                      Unavailable ({unavailableGoods.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {unavailableGoods.map((mg) => (
                        <div
                          key={mg.good.id}
                          className="text-xs text-terminal-primary/30 truncate"
                          title={`${mg.good.name} (needed ${mg.good.availability}, rolled ${mg.availabilityRoll})`}
                        >
                          {mg.good.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {marketGoods.length === 0 && (
        <Card className="bg-black border-terminal-primary/30">
          <CardContent className="p-8 text-center">
            <Store className="h-12 w-12 mx-auto text-terminal-primary/30 mb-4" />
            <p className="text-terminal-primary/70 mb-2">
              Configure the world above and generate a market to see available goods.
            </p>
            <p className="text-xs text-terminal-primary/50">
              Trade codes affect purchase prices. Broker skill provides additional discounts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
