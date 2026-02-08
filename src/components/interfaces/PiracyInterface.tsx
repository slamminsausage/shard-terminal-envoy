import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Anchor, Users, Heart, Shield, Coins, Crosshair, Ship } from 'lucide-react';
import { PortReputationPanel } from '../piracy/PortReputationPanel';
import { CrewRosterPanel } from '../piracy/CrewRosterPanel';
import { MoraleTracker } from '../piracy/MoraleTracker';
import { StandingPanel } from '../piracy/StandingPanel';
import { SpoilsCalculator } from '../piracy/SpoilsCalculator';
import { PreyEncounterPanel } from '../piracy/PreyEncounterPanel';
import { PrizeShipPanel } from '../piracy/PrizeShipPanel';

export const PiracyInterface: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (typeof window === "undefined") return "ports";
    return localStorage.getItem("piracy_active_subtab") || "ports";
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("piracy_active_subtab", activeSubTab);
    }
  }, [activeSubTab]);

  return (
    <div className="interface-container">
      <header className="interface-header">
        <div>
          <h1 className="interface-title">PIRATES OF DRINAX</h1>
          <p className="interface-subtitle">
            Corsair operations, crew management, and plunder tracking
          </p>
        </div>
      </header>

      <div className="interface-content">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="terminal-tabs-list grid-cols-7 mb-4">
            <TabsTrigger value="ports" className="terminal-tab-trigger">
              <Anchor className="h-4 w-4" />
              <span className="hidden sm:inline">Ports</span>
            </TabsTrigger>
            <TabsTrigger value="crew" className="terminal-tab-trigger">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Crew</span>
            </TabsTrigger>
            <TabsTrigger value="morale" className="terminal-tab-trigger">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Morale</span>
            </TabsTrigger>
            <TabsTrigger value="standing" className="terminal-tab-trigger">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Standing</span>
            </TabsTrigger>
            <TabsTrigger value="spoils" className="terminal-tab-trigger">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Spoils</span>
            </TabsTrigger>
            <TabsTrigger value="prey" className="terminal-tab-trigger">
              <Crosshair className="h-4 w-4" />
              <span className="hidden sm:inline">Prey</span>
            </TabsTrigger>
            <TabsTrigger value="prizes" className="terminal-tab-trigger">
              <Ship className="h-4 w-4" />
              <span className="hidden sm:inline">Prizes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ports" className="mt-0">
            <PortReputationPanel />
          </TabsContent>

          <TabsContent value="crew" className="mt-0">
            <CrewRosterPanel />
          </TabsContent>

          <TabsContent value="morale" className="mt-0">
            <MoraleTracker />
          </TabsContent>

          <TabsContent value="standing" className="mt-0">
            <StandingPanel />
          </TabsContent>

          <TabsContent value="spoils" className="mt-0">
            <SpoilsCalculator />
          </TabsContent>

          <TabsContent value="prey" className="mt-0">
            <PreyEncounterPanel />
          </TabsContent>

          <TabsContent value="prizes" className="mt-0">
            <PrizeShipPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
