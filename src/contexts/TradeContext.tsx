import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TradeGood, TradeMarketRoll } from '@/types/trade';
import { dbHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface TradeContextType {
  // Trade goods
  tradeGoods: TradeGood[];
  isLoading: boolean;
  getAllTradeGoods: (vehicleId?: string) => Promise<void>;
  purchaseTradeGood: (goodData: Partial<TradeGood>) => Promise<TradeGood | null>;
  sellTradeGood: (goodId: string, salePrice: number, saleWorld: string, saleDate: string) => Promise<TradeGood | null>;
  updateTradeGood: (goodId: string, updates: Partial<TradeGood>) => Promise<TradeGood | null>;
  deleteTradeGood: (goodId: string) => Promise<boolean>;

  // Market rolls
  marketRolls: TradeMarketRoll[];
  getAllMarketRolls: () => Promise<void>;
  saveMarketRoll: (rollData: Partial<TradeMarketRoll>) => Promise<TradeMarketRoll | null>;

  // Utilities
  getCargoByVehicle: (vehicleId: string) => TradeGood[];
  calculateCargoTonnage: (vehicleId: string) => number;
  calculateTotalInvestment: (vehicleId?: string) => number;
  calculatePotentialProfit: (goodId: string, estimatedSalePrice: number) => {
    profit: number;
    profitPercent: number;
  };
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
};

interface TradeProviderProps {
  children: ReactNode;
}

export const TradeProvider: React.FC<TradeProviderProps> = ({ children }) => {
  const [tradeGoods, setTradeGoods] = useState<TradeGood[]>([]);
  const [marketRolls, setMarketRolls] = useState<TradeMarketRoll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getAllTradeGoods = useCallback(async (vehicleId?: string) => {
    setIsLoading(true);
    try {
      const data = await dbHelpers.getAllTradeGoods(vehicleId);
      setTradeGoods(data as TradeGood[]);
    } catch (error) {
      console.error('Failed to load trade goods:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trade goods',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const purchaseTradeGood = useCallback(async (goodData: Partial<TradeGood>): Promise<TradeGood | null> => {
    try {
      const newGood = {
        player_id: 'campaign',
        status: 'in_cargo' as const,
        is_speculation: false,
        broker_skill_used: 0,
        ...goodData,
      };

      const data = await dbHelpers.saveTradeGood(newGood);

      if (data) {
        setTradeGoods(prev => [data as TradeGood, ...prev]);
        toast({
          title: 'Success',
          description: `Purchased ${goodData.tons} tons of ${goodData.name}`,
        });
        return data as TradeGood;
      }
      return null;
    } catch (error) {
      console.error('Failed to purchase trade good:', error);
      toast({
        title: 'Error',
        description: 'Failed to purchase trade good',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const sellTradeGood = useCallback(async (goodId: string, salePrice: number, saleWorld: string, saleDate: string): Promise<TradeGood | null> => {
    try {
      const data = await dbHelpers.saveTradeGood({
        id: goodId,
        status: 'sold',
        sale_price: salePrice,
        sale_world: saleWorld,
        sale_date: saleDate,
      });

      if (data) {
        setTradeGoods(prev => prev.map(good => good.id === goodId ? data as TradeGood : good));

        const good = tradeGoods.find(g => g.id === goodId);
        if (good) {
          const profit = salePrice - good.purchase_price;
          toast({
            title: 'Success',
            description: `Sold for ${profit >= 0 ? '+' : ''}${profit.toLocaleString()} Cr profit`,
          });
        }
        return data as TradeGood;
      }
      return null;
    } catch (error) {
      console.error('Failed to sell trade good:', error);
      toast({
        title: 'Error',
        description: 'Failed to sell trade good',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast, tradeGoods]);

  const updateTradeGood = useCallback(async (goodId: string, updates: Partial<TradeGood>): Promise<TradeGood | null> => {
    try {
      const data = await dbHelpers.saveTradeGood({ id: goodId, ...updates });

      if (data) {
        setTradeGoods(prev => prev.map(good => good.id === goodId ? data as TradeGood : good));
        toast({
          title: 'Success',
          description: 'Trade good updated',
        });
        return data as TradeGood;
      }
      return null;
    } catch (error) {
      console.error('Failed to update trade good:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trade good',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const deleteTradeGood = useCallback(async (goodId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteTradeGood(goodId);
      setTradeGoods(prev => prev.filter(good => good.id !== goodId));
      toast({
        title: 'Success',
        description: 'Trade good deleted',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete trade good:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete trade good',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const getAllMarketRolls = useCallback(async () => {
    try {
      const data = await dbHelpers.getAllTradeMarketRolls();
      setMarketRolls(data as TradeMarketRoll[]);
    } catch (error) {
      console.error('Failed to load market rolls:', error);
      toast({
        title: 'Error',
        description: 'Failed to load market rolls',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const saveMarketRoll = useCallback(async (rollData: Partial<TradeMarketRoll>): Promise<TradeMarketRoll | null> => {
    try {
      const newRoll = {
        player_id: 'campaign',
        roll_date: new Date().toISOString(),
        ...rollData,
      };

      const data = await dbHelpers.saveTradeMarketRoll(newRoll);

      if (data) {
        setMarketRolls(prev => [data as TradeMarketRoll, ...prev]);
        toast({
          title: 'Success',
          description: 'Market roll saved',
        });
        return data as TradeMarketRoll;
      }
      return null;
    } catch (error) {
      console.error('Failed to save market roll:', error);
      toast({
        title: 'Error',
        description: 'Failed to save market roll',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const getCargoByVehicle = useCallback((vehicleId: string) => {
    return tradeGoods.filter(good => good.vehicle_id === vehicleId && good.status === 'in_cargo');
  }, [tradeGoods]);

  const calculateCargoTonnage = useCallback((vehicleId: string) => {
    const cargo = getCargoByVehicle(vehicleId);
    return cargo.reduce((sum, good) => sum + good.tons, 0);
  }, [getCargoByVehicle]);

  const calculateTotalInvestment = useCallback((vehicleId?: string) => {
    const goods = vehicleId
      ? tradeGoods.filter(g => g.vehicle_id === vehicleId && g.status === 'in_cargo')
      : tradeGoods.filter(g => g.status === 'in_cargo');

    return goods.reduce((sum, good) => sum + good.purchase_price, 0);
  }, [tradeGoods]);

  const calculatePotentialProfit = useCallback((goodId: string, estimatedSalePrice: number) => {
    const good = tradeGoods.find(g => g.id === goodId);

    if (!good) {
      return { profit: 0, profitPercent: 0 };
    }

    const profit = estimatedSalePrice - good.purchase_price;
    const profitPercent = (profit / good.purchase_price) * 100;

    return { profit, profitPercent };
  }, [tradeGoods]);

  const value: TradeContextType = {
    tradeGoods,
    isLoading,
    getAllTradeGoods,
    purchaseTradeGood,
    sellTradeGood,
    updateTradeGood,
    deleteTradeGood,
    marketRolls,
    getAllMarketRolls,
    saveMarketRoll,
    getCargoByVehicle,
    calculateCargoTonnage,
    calculateTotalInvestment,
    calculatePotentialProfit,
  };

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  );
};
