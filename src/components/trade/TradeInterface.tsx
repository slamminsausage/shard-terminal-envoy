import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { CargoManifest } from './CargoManifest';

export const TradeInterface: React.FC = () => {
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
        <div className="grid grid-cols-1 gap-4 h-full">
          {/* Cargo Manifest */}
          <Card className="bg-black border-terminal-primary/50 overflow-hidden flex flex-col">
            <CardContent className="p-4 flex-1 overflow-hidden">
              <CargoManifest />
            </CardContent>
          </Card>

          {/* Placeholder for Market Generator */}
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="p-6 text-center">
              <div className="text-terminal-primary/70">
                <p className="text-lg font-bold mb-2">Market Generator</p>
                <p className="text-sm">
                  Market generation will be available in a future update.
                </p>
                <p className="text-xs mt-2 text-terminal-primary/50">
                  For now, you can manually add trade goods to your cargo using the database.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
