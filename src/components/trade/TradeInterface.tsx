import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Store } from 'lucide-react';
import { CargoManifest } from './CargoManifest';
import { MarketGenerator } from './MarketGenerator';

export const TradeInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cargo');

  return (
    <div className="h-full flex flex-col bg-black text-terminal-primary font-mono">
      <div className="border-b border-terminal-primary/30 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-terminal-primary flex items-center gap-2">
              <Package className="h-6 w-6" />
              TRADE SYSTEM
            </h1>
            <p className="text-terminal-primary/70 text-sm mt-1">
              Manage cargo, trade goods, and speculation
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-black border border-terminal-primary/30 mb-4">
            <TabsTrigger
              value="cargo"
              className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary text-terminal-primary/70"
            >
              <Package className="h-4 w-4 mr-2" />
              Cargo Hold
            </TabsTrigger>
            <TabsTrigger
              value="market"
              className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary text-terminal-primary/70"
            >
              <Store className="h-4 w-4 mr-2" />
              Market
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cargo" className="flex-1 overflow-hidden mt-0">
            <CargoManifest />
          </TabsContent>

          <TabsContent value="market" className="flex-1 overflow-auto mt-0">
            <MarketGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
