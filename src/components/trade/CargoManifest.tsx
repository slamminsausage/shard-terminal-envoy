import React, { useState, useEffect } from 'react';
import { useTrade } from '@/contexts/TradeContext';
import { TradeGood } from '@/types/trade';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Package, TrendingUp, TrendingDown, DollarSign, Trash2, ShoppingCart, Plus } from 'lucide-react';
import { AddCargoDialog } from './AddCargoDialog';

interface CargoManifestProps {
  vehicleId?: string;
}

export const CargoManifest: React.FC<CargoManifestProps> = ({ vehicleId }) => {
  const { tradeGoods, getAllTradeGoods, sellTradeGood, deleteTradeGood, calculateCargoTonnage, calculateTotalInvestment } = useTrade();
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGood, setSelectedGood] = useState<TradeGood | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [saleWorld, setSaleWorld] = useState('');

  useEffect(() => {
    getAllTradeGoods(vehicleId);
  }, [vehicleId, getAllTradeGoods]);

  const cargoGoods = tradeGoods.filter(g => g.status === 'in_cargo' && (!vehicleId || g.vehicle_id === vehicleId));
  const soldGoods = tradeGoods.filter(g => g.status === 'sold' && (!vehicleId || g.vehicle_id === vehicleId));

  const totalTonnage = vehicleId ? calculateCargoTonnage(vehicleId) : cargoGoods.reduce((sum, g) => sum + g.tons, 0);
  const totalInvestment = vehicleId ? calculateTotalInvestment(vehicleId) : calculateTotalInvestment();

  const calculateProfit = (good: TradeGood) => {
    if (good.sale_price) {
      return good.sale_price - good.purchase_price;
    }
    return 0;
  };

  const handleSellClick = (good: TradeGood) => {
    setSelectedGood(good);
    setSalePrice(good.purchase_price.toString());
    setSaleWorld('');
    setShowSellDialog(true);
  };

  const handleSellConfirm = async () => {
    if (!selectedGood || !salePrice || !saleWorld) return;

    await sellTradeGood(
      selectedGood.id,
      parseInt(salePrice),
      saleWorld,
      new Date().toISOString()
    );

    setShowSellDialog(false);
    setSelectedGood(null);
    setSalePrice('');
    setSaleWorld('');
  };

  const handleDelete = async (goodId: string) => {
    if (confirm('Are you sure you want to remove this cargo?')) {
      await deleteTradeGood(goodId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Add Cargo Dialog */}
      {showAddDialog && (
        <AddCargoDialog
          vehicleId={vehicleId}
          onClose={() => setShowAddDialog(false)}
        />
      )}

      {/* Header with Stats */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-terminal-primary">Cargo Manifest</h2>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Cargo
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Card className="bg-black border-terminal-primary/50">
            <CardContent className="p-3">
              <div className="text-xs text-terminal-primary/70 mb-1">Total Tonnage</div>
              <div className="text-lg font-bold text-terminal-primary">
                {totalTonnage.toFixed(2)} tons
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-terminal-primary/50">
            <CardContent className="p-3">
              <div className="text-xs text-terminal-primary/70 mb-1">Total Investment</div>
              <div className="text-lg font-bold text-terminal-primary">
                {totalInvestment.toLocaleString()} Cr
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current Cargo */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-terminal-primary mb-2 uppercase">
          Current Cargo ({cargoGoods.length})
        </h3>

        <ScrollArea className="h-[300px]">
          {cargoGoods.length === 0 ? (
            <Card className="bg-black border-terminal-primary/30">
              <CardContent className="p-6 text-center text-terminal-primary/70">
                No cargo currently in hold. Purchase trade goods to fill your cargo bay.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {cargoGoods.map((good) => (
                <Card key={good.id} className="bg-black border-terminal-primary/30">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-terminal-primary/70" />
                          <h4 className="font-bold text-terminal-primary">{good.name}</h4>
                          <Badge className="bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50">
                            {good.trade_code}
                          </Badge>
                          {good.is_speculation && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                              Speculation
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-terminal-primary/70">
                          <div>{good.tons} tons</div>
                          <div>•</div>
                          <div>Bought: {good.purchase_price.toLocaleString()} Cr</div>
                          {good.purchase_world && (
                            <>
                              <div>•</div>
                              <div>@ {good.purchase_world}</div>
                            </>
                          )}
                        </div>

                        {good.notes && (
                          <p className="text-xs text-terminal-primary/60 mt-1 italic">
                            {good.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleSellClick(good)}
                          size="sm"
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(good.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Sell Dialog */}
      {showSellDialog && selectedGood && (
        <Card className="bg-black border-terminal-primary/50 mb-4">
          <CardHeader>
            <CardTitle className="text-terminal-primary text-sm">
              Sell: {selectedGood.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                Sale Price (Credits) *
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
              <div className="text-xs text-terminal-primary/60 mt-1">
                Purchase price: {selectedGood.purchase_price.toLocaleString()} Cr
              </div>
            </div>

            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                Sale World/Station *
              </label>
              <Input
                placeholder="e.g., Regina, Efate Station"
                value={saleWorld}
                onChange={(e) => setSaleWorld(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
            </div>

            {salePrice && (
              <div className={`p-3 rounded ${
                parseInt(salePrice) >= selectedGood.purchase_price
                  ? 'bg-green-500/10 border border-green-500/50'
                  : 'bg-red-500/10 border border-red-500/50'
              }`}>
                <div className="text-sm font-bold">
                  Profit/Loss: <span className={parseInt(salePrice) >= selectedGood.purchase_price ? 'text-green-400' : 'text-red-400'}>
                    {parseInt(salePrice) >= selectedGood.purchase_price ? '+' : ''}
                    {(parseInt(salePrice) - selectedGood.purchase_price).toLocaleString()} Cr
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSellConfirm}
                disabled={!salePrice || !saleWorld}
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
              >
                Sell
              </Button>
              <Button
                onClick={() => setShowSellDialog(false)}
                variant="outline"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales History */}
      {soldGoods.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-terminal-primary mb-2 uppercase">
            Sales History ({soldGoods.length})
          </h3>

          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {soldGoods.map((good) => {
                const profit = calculateProfit(good);
                return (
                  <Card key={good.id} className="bg-black border-terminal-primary/20 opacity-70">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-terminal-primary">{good.name}</h4>
                            <Badge className="bg-terminal-primary/10 text-terminal-primary/70 border-terminal-primary/30">
                              SOLD
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-terminal-primary/70">
                            <div>{good.tons} tons</div>
                            <div>•</div>
                            <div>Sold @ {good.sale_world}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-sm font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {profit >= 0 ? '+' : ''}{profit.toLocaleString()} Cr
                          </div>
                          <div className="text-xs text-terminal-primary/60">
                            {good.sale_price?.toLocaleString()} Cr
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
