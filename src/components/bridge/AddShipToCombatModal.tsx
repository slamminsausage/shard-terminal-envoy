import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PRE_MADE_SHIPS, SHIP_SOURCE_LABELS, getShipSource, getShipsByCategory } from '@/data/shipConstruction';
import type { PreMadeShip, ShipCategory } from '@/data/shipConstruction';
import type { NewContact, ContactStatus } from '@/lib/bridge/bridgeTypes';
import type { Vehicle } from '@/types/database';
import { Plus, Ship, Database, Wrench } from 'lucide-react';

interface AddShipToCombatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: NewContact) => void;
  vehicles: Vehicle[];
}

const SHIP_CATEGORIES: Array<{ key: ShipCategory | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'scout', label: 'Scout' },
  { key: 'trader', label: 'Trader' },
  { key: 'military', label: 'Military' },
  { key: 'passenger', label: 'Passenger' },
  { key: 'exploration', label: 'Exploration' },
  { key: 'mining', label: 'Mining' },
  { key: 'small_craft', label: 'Small Craft' },
];

export function AddShipToCombatModal({ isOpen, onClose, onAdd, vehicles }: AddShipToCombatModalProps) {
  const [tab, setTab] = useState('catalogue');
  const [categoryFilter, setCategoryFilter] = useState<ShipCategory | 'all'>('all');
  const [selectedPreMadeId, setSelectedPreMadeId] = useState<string>('');

  // Shared fields
  const [shipName, setShipName] = useState('');
  const [status, setStatus] = useState<ContactStatus>('enemy');
  const [isPlayerShip, setIsPlayerShip] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hexQ, setHexQ] = useState('0');
  const [hexR, setHexR] = useState('0');

  // Stats
  const [hull, setHull] = useState('20');
  const [armor, setArmor] = useState('0');
  const [thrust, setThrust] = useState('2');
  const [tonnage, setTonnage] = useState('200');

  // Crew skills
  const [pilotSkill, setPilotSkill] = useState('1');
  const [gunnerSkill, setGunnerSkill] = useState('1');
  const [engineerSkill, setEngineerSkill] = useState('1');
  const [sensorSkill, setSensorSkill] = useState('1');
  const [captainSkill, setCaptainSkill] = useState('1');

  // Vehicle tab
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const filteredShips = useMemo(() => {
    const ships = categoryFilter === 'all' ? PRE_MADE_SHIPS : getShipsByCategory(categoryFilter);
    return [...ships].sort((a, b) => {
      const sourceCompare = getShipSource(a).localeCompare(getShipSource(b));
      if (sourceCompare !== 0) return sourceCompare;
      return a.tonnage - b.tonnage;
    });
  }, [categoryFilter]);

  const selectedPreMadeShip = useMemo(() => {
    return PRE_MADE_SHIPS.find(s => s.id === selectedPreMadeId);
  }, [selectedPreMadeId]);

  const applyPreMadeShip = (shipId: string) => {
    setSelectedPreMadeId(shipId);
    const ship = PRE_MADE_SHIPS.find(s => s.id === shipId);
    if (!ship) return;

    setShipName(`${ship.name}${ship.designation ? ` (${ship.designation})` : ''}`);
    setHull(String(Math.max(1, Math.round(ship.hullPoints / 2))));
    setArmor(String(Math.max(0, ship.design.armorProtection ?? 0)));
    setTonnage(String(Math.max(1, Math.round(ship.tonnage))));
    setThrust(String(Math.max(0, ship.design.manoeuvreRating ?? 0)));
  };

  const applyVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const v = vehicles.find(veh => veh.id === vehicleId);
    if (!v) return;

    setShipName(v.name);
    setHull(String(v.hull ?? 20));
    setArmor(String(v.armor ?? 0));
    setTonnage(String(v.tonnage ?? 100));
    setThrust(String(v.maneuver_drive ?? 2));
  };

  const handleAdd = () => {
    if (!shipName.trim()) return;

    const hullVal = Math.max(1, parseInt(hull, 10) || 20);
    const contact: NewContact = {
      name: shipName.trim(),
      shipClass: selectedPreMadeShip?.name || undefined,
      tonnage: Math.max(1, parseInt(tonnage, 10) || 100),
      status,
      hexQ: parseInt(hexQ, 10) || 0,
      hexR: parseInt(hexR, 10) || 0,
      facing: 0,
      hullCurrent: hullVal,
      hullMax: hullVal,
      isPlayerShip,
      isHidden,
      thrust: Math.max(0, parseInt(thrust, 10) || 0),
      armor: Math.max(0, parseInt(armor, 10) || 0),
      pilotSkill: parseInt(pilotSkill, 10) || 0,
      gunnerSkill: parseInt(gunnerSkill, 10) || 0,
      engineerSkill: parseInt(engineerSkill, 10) || 0,
      sensorSkill: parseInt(sensorSkill, 10) || 0,
      captainSkill: parseInt(captainSkill, 10) || 0,
      preMadeShipId: selectedPreMadeId || undefined,
      vehicleId: selectedVehicleId || undefined,
      missileAmmo: 12,
      sandAmmo: 6,
    };

    onAdd(contact);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setShipName('');
    setSelectedPreMadeId('');
    setSelectedVehicleId('');
    setHull('20');
    setArmor('0');
    setThrust('2');
    setTonnage('200');
    setPilotSkill('1');
    setGunnerSkill('1');
    setEngineerSkill('1');
    setSensorSkill('1');
    setCaptainSkill('1');
    setStatus('enemy');
    setIsPlayerShip(false);
    setIsHidden(false);
    setHexQ('0');
    setHexR('0');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black border-terminal-primary/50 text-terminal-primary max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-terminal-primary font-['Orbitron'] tracking-wider text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            ADD SHIP TO COMBAT
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="bg-terminal-bg-panel-alt border border-terminal-primary/30 w-full">
            <TabsTrigger value="catalogue" className="flex-1 text-xs data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary">
              <Database className="h-3 w-3 mr-1" /> Catalogue
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex-1 text-xs data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary">
              <Ship className="h-3 w-3 mr-1" /> Player Ships
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex-1 text-xs data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary">
              <Wrench className="h-3 w-3 mr-1" /> Custom
            </TabsTrigger>
          </TabsList>

          {/* Ship Catalogue Tab */}
          <TabsContent value="catalogue" className="space-y-3 mt-3">
            <div className="flex gap-2 flex-wrap">
              {SHIP_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-2 py-1 text-xs border rounded font-mono transition-all ${
                    categoryFilter === cat.key
                      ? 'border-terminal-primary text-terminal-primary bg-terminal-primary/10'
                      : 'border-terminal-bg-border text-terminal-text-dimmer hover:border-terminal-primary/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 border border-terminal-bg-border rounded p-2">
              {filteredShips.map((ship, index) => {
                const source = getShipSource(ship);
                const prevSource = index > 0 ? getShipSource(filteredShips[index - 1]) : null;
                const showSourceHeader = source !== prevSource;
                return (
                <div key={ship.id}>
                  {showSourceHeader && (
                    <div className="pt-2 pb-1 text-[10px] uppercase tracking-wider text-terminal-primary/60 border-b border-terminal-primary/20">{SHIP_SOURCE_LABELS[source]}</div>
                  )}
                <button
                  onClick={() => applyPreMadeShip(ship.id)}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-all ${
                    selectedPreMadeId === ship.id
                      ? 'bg-terminal-primary/20 border border-terminal-primary/50 text-terminal-primary'
                      : 'hover:bg-terminal-primary/5 text-terminal-text-dimmer border border-transparent'
                  }`}
                >
                  <span className="font-bold text-terminal-primary">{ship.name}</span>
                  {ship.designation && <span className="text-terminal-text-dimmer ml-2">({ship.designation})</span>}
                  <span className="float-right">
                    <Badge variant="outline" className="text-[0.6rem] border-terminal-primary/30 text-terminal-primary/70">
                      {ship.tonnage}t / TL{ship.tl} / HP{ship.hullPoints}
                    </Badge>
                  </span>
                </button>
                </div>
              );
              })}
            </div>

            {selectedPreMadeShip && (
              <div className="text-xs text-terminal-text-dimmer border border-terminal-bg-border rounded p-2">
                <p className="text-terminal-primary/70 mb-1">{selectedPreMadeShip.description.slice(0, 150)}...</p>
                <div className="flex gap-4 mt-1 text-terminal-primary/60">
                  <span>Hull: {selectedPreMadeShip.hullPoints}HP</span>
                  <span>Thrust: {selectedPreMadeShip.design.manoeuvreRating}</span>
                  <span>Armor: {selectedPreMadeShip.design.armorProtection}</span>
                  <span>Crew: {selectedPreMadeShip.crew.join(', ')}</span>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Player Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-3 mt-3">
            {vehicles.filter(v => v.tonnage && v.tonnage >= 10).length === 0 ? (
              <p className="text-terminal-text-dimmer text-xs text-center py-4">No ships in campaign. Deploy one from the Ship Hangar first.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1 border border-terminal-bg-border rounded p-2">
                {vehicles
                  .filter(v => v.tonnage && v.tonnage >= 10)
                  .map(v => (
                    <button
                      key={v.id}
                      onClick={() => applyVehicle(v.id)}
                      className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-all ${
                        selectedVehicleId === v.id
                          ? 'bg-terminal-primary/20 border border-terminal-primary/50 text-terminal-primary'
                          : 'hover:bg-terminal-primary/5 text-terminal-text-dimmer border border-transparent'
                      }`}
                    >
                      <span className="font-bold text-terminal-primary">{v.name}</span>
                      {v.class_type && <span className="text-terminal-text-dimmer ml-2">({v.class_type})</span>}
                      <span className="float-right">
                        <Badge variant="outline" className="text-[0.6rem] border-terminal-primary/30 text-terminal-primary/70">
                          {v.tonnage}t / TL{v.tech_level}
                        </Badge>
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="mt-3">
            <p className="text-terminal-text-dimmer text-xs mb-2">Enter custom ship stats below.</p>
          </TabsContent>
        </Tabs>

        {/* Common fields (shown for all tabs) */}
        <div className="space-y-3 border-t border-terminal-bg-border pt-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-xs">Ship Name</label>
              <Input
                value={shipName}
                onChange={e => setShipName(e.target.value)}
                placeholder="Enter name"
                className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-xs">Allegiance</label>
              <Select value={status} onValueChange={(v: ContactStatus) => setStatus(v)}>
                <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="enemy">Enemy</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ship stats row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Hull</label>
              <Input value={hull} onChange={e => setHull(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Armor</label>
              <Input value={armor} onChange={e => setArmor(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Thrust</label>
              <Input value={thrust} onChange={e => setThrust(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Tonnage</label>
              <Input value={tonnage} onChange={e => setTonnage(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
          </div>

          {/* Crew skills row */}
          <div className="grid grid-cols-5 gap-2">
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Pilot</label>
              <Input value={pilotSkill} onChange={e => setPilotSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Gunner</label>
              <Input value={gunnerSkill} onChange={e => setGunnerSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Engineer</label>
              <Input value={engineerSkill} onChange={e => setEngineerSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Sensors</label>
              <Input value={sensorSkill} onChange={e => setSensorSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Captain</label>
              <Input value={captainSkill} onChange={e => setCaptainSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
          </div>

          {/* Placement row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Hex Q</label>
              <Input value={hexQ} onChange={e => setHexQ(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
            <div className="space-y-1">
              <label className="text-terminal-primary/70 text-[0.6rem]">Hex R</label>
              <Input value={hexR} onChange={e => setHexR(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary text-xs h-7" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPlayerShip}
                  onChange={e => setIsPlayerShip(e.target.checked)}
                  className="accent-terminal-primary"
                />
                <span className="text-terminal-primary/70 text-[0.6rem]">Player Ship</span>
              </label>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHidden}
                  onChange={e => setIsHidden(e.target.checked)}
                  className="accent-terminal-primary"
                />
                <span className="text-terminal-primary/70 text-[0.6rem]">Hidden (GM only)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-terminal-bg-border text-terminal-text-dimmer hover:text-terminal-primary text-xs"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!shipName.trim()}
            className="bg-terminal-primary/20 text-terminal-primary border border-terminal-primary/50 hover:bg-terminal-primary/30 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            DEPLOY TO GRID
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
