import React, { useState, useMemo } from 'react';
import { usePiracy } from '@/contexts/PiracyContext';
import {
  PrizeShip,
  PrizeShipStatus,
  PrizeShipCondition,
  PrizeShipWeapon,
} from '@/types/piracy';
import {
  HULL_TYPE_TEMPLATES,
  PRIZE_CONDITION_CONFIG,
  PRIZE_STATUS_CONFIG,
} from '@/lib/piracy/tables';
import {
  estimateSaleValue,
  estimateRepairCost,
  estimateRepairWeeks,
  estimateScrapValue,
  getMinPrizeCrew,
} from '@/lib/piracy/generators';
import {
  Ship,
  Plus,
  Trash2,
  ChevronDown,
  Wrench,
  DollarSign,
  Gift,
  Recycle,
  Anchor,
  Users,
  Package,
  ShieldCheck,
} from 'lucide-react';

// === Add Prize Ship Form ===

interface AddPrizeFormState {
  name: string;
  hull_type: string;
  tonnage: number;
  tech_level: number;
  capture_imperial_date: string;
  capture_location: string;
  condition: PrizeShipCondition;
  hull_damage_percent: number;
  drives_operational: boolean;
  cargo_tons: number;
  cargo_manifest: string;
  cargo_estimated_value: number;
  weapon_name: string;
  weapon_mount: string;
  weapons: PrizeShipWeapon[];
  notes: string;
}

const defaultAddForm: AddPrizeFormState = {
  name: '',
  hull_type: 'free_trader',
  tonnage: 200,
  tech_level: 11,
  capture_imperial_date: '',
  capture_location: '',
  condition: 'damaged',
  hull_damage_percent: 20,
  drives_operational: true,
  cargo_tons: 0,
  cargo_manifest: '',
  cargo_estimated_value: 0,
  weapon_name: '',
  weapon_mount: '',
  weapons: [],
  notes: '',
};

export const PrizeShipPanel: React.FC = () => {
  const {
    prizeShips,
    ports,
    crew,
    addPrizeShip,
    updatePrizeShip,
    deletePrizeShip,
    disposePrizeShip,
  } = usePiracy();

  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [disposeId, setDisposeId] = useState<string | null>(null);
  const [form, setForm] = useState<AddPrizeFormState>(defaultAddForm);

  // Disposition form state
  const [disposeAction, setDisposeAction] = useState<PrizeShipStatus>('sold');
  const [disposeSaleValue, setDisposeSaleValue] = useState('');
  const [disposeSalePort, setDisposeSalePort] = useState('');
  const [disposeGiftPort, setDisposeGiftPort] = useState('');
  const [disposeRenamedTo, setDisposeRenamedTo] = useState('');

  // Stats
  const capturedShips = prizeShips.filter(s => s.status === 'captured');
  const keptShips = prizeShips.filter(s => s.status === 'kept');
  const disposedShips = prizeShips.filter(s => s.status !== 'captured' && s.status !== 'kept');

  const totalPrizeValue = useMemo(() => {
    return prizeShips
      .filter(s => s.status === 'sold')
      .reduce((sum, s) => sum + (s.sale_value || 0), 0)
      + prizeShips
        .filter(s => s.status === 'scrapped')
        .reduce((sum, s) => sum + (s.scrap_value || 0), 0);
  }, [prizeShips]);

  const totalCargoValue = useMemo(() => {
    return prizeShips.reduce((sum, s) => sum + s.cargo_estimated_value, 0);
  }, [prizeShips]);

  // Hull type change syncs tonnage/TL
  const handleHullTypeChange = (hullType: string) => {
    const template = HULL_TYPE_TEMPLATES[hullType];
    if (template) {
      setForm(prev => ({
        ...prev,
        hull_type: hullType,
        tonnage: template.tonnage,
        tech_level: template.typicalTL,
      }));
    }
  };

  const handleAddWeapon = () => {
    if (!form.weapon_name.trim()) return;
    setForm(prev => ({
      ...prev,
      weapons: [...prev.weapons, {
        name: prev.weapon_name.trim(),
        mount: prev.weapon_mount.trim() || 'turret',
        condition: 'operational',
      }],
      weapon_name: '',
      weapon_mount: '',
    }));
  };

  const handleRemoveWeapon = (index: number) => {
    setForm(prev => ({
      ...prev,
      weapons: prev.weapons.filter((_, i) => i !== index),
    }));
  };

  const handleAddShip = () => {
    if (!form.name.trim()) return;
    addPrizeShip({
      name: form.name.trim(),
      hull_type: form.hull_type,
      tonnage: form.tonnage,
      tech_level: form.tech_level,
      capture_imperial_date: form.capture_imperial_date || undefined,
      capture_location: form.capture_location || undefined,
      condition: form.condition,
      hull_damage_percent: form.hull_damage_percent,
      drives_operational: form.drives_operational,
      cargo_tons: form.cargo_tons,
      cargo_manifest: form.cargo_manifest || undefined,
      cargo_estimated_value: form.cargo_estimated_value,
      weapons: form.weapons,
      notes: form.notes || undefined,
    });
    setForm(defaultAddForm);
    setShowAddForm(false);
  };

  const handleDispose = (ship: PrizeShip) => {
    if (disposeAction === 'sold') {
      disposePrizeShip(ship.id, 'sold', {
        sale_value: parseInt(disposeSaleValue, 10) || estimateSaleValue(ship.hull_type, ship.condition),
        sale_port: disposeSalePort || undefined,
        sale_date: new Date().toISOString(),
      });
    } else if (disposeAction === 'scrapped') {
      disposePrizeShip(ship.id, 'scrapped', {
        scrap_value: estimateScrapValue(ship.hull_type),
        scrap_date: new Date().toISOString(),
      });
    } else if (disposeAction === 'gifted') {
      disposePrizeShip(ship.id, 'gifted', {
        gifted_to_port: disposeGiftPort || undefined,
        gifted_date: new Date().toISOString(),
      });
    } else if (disposeAction === 'kept') {
      disposePrizeShip(ship.id, 'kept', {
        renamed_to: disposeRenamedTo || undefined,
      });
    }
    setDisposeId(null);
    setDisposeSaleValue('');
    setDisposeSalePort('');
    setDisposeGiftPort('');
    setDisposeRenamedTo('');
  };

  const renderShipCard = (ship: PrizeShip) => {
    const isExpanded = expandedId === ship.id;
    const isDisposing = disposeId === ship.id;
    const condConfig = PRIZE_CONDITION_CONFIG[ship.condition];
    const statusConfig = PRIZE_STATUS_CONFIG[ship.status];
    const template = HULL_TYPE_TEMPLATES[ship.hull_type] || HULL_TYPE_TEMPLATES['other'];
    const saleEst = estimateSaleValue(ship.hull_type, ship.condition);
    const repairCost = estimateRepairCost(ship.hull_type, ship.hull_damage_percent);
    const repairWeeks = estimateRepairWeeks(ship.condition, ship.hull_damage_percent);
    const minCrew = getMinPrizeCrew(ship.hull_type);

    return (
      <div key={ship.id} className="terminal-card p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpandedId(isExpanded ? null : ship.id)}
              className="text-terminal-text-dimmer hover:text-terminal-primary transition-colors"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <span className="font-bold text-terminal-primary">
                {ship.renamed_to || ship.name}
              </span>
              {ship.renamed_to && (
                <span className="text-terminal-text-dimmer text-xs ml-1">(ex-{ship.name})</span>
              )}
              <span className={`terminal-badge ml-2 ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-terminal-text-dimmer">{template.label}</span>
            <span className={condConfig.color}>{condConfig.label}</span>
            <span className="text-terminal-text-dimmer">{ship.tonnage}t</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 ml-7 space-y-3">
            {/* Ship details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-terminal-text-dimmer block">Hull Type</span>
                <span className="text-terminal-primary">{template.label}</span>
              </div>
              <div>
                <span className="text-terminal-text-dimmer block">Tonnage</span>
                <span className="text-terminal-primary">{ship.tonnage}dt</span>
              </div>
              <div>
                <span className="text-terminal-text-dimmer block">Tech Level</span>
                <span className="text-terminal-primary">TL{ship.tech_level}</span>
              </div>
              <div>
                <span className="text-terminal-text-dimmer block">Drives</span>
                <span className={ship.drives_operational ? 'text-green-400' : 'text-red-400'}>
                  {ship.drives_operational ? 'Operational' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Condition & damage */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-terminal-text-dimmer">Hull Integrity</span>
                <span className={condConfig.color}>{100 - ship.hull_damage_percent}%</span>
              </div>
              <div className="w-full bg-terminal-bg-dark rounded h-2">
                <div
                  className={`h-2 rounded transition-all ${
                    ship.hull_damage_percent > 75 ? 'bg-red-500' :
                    ship.hull_damage_percent > 40 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${100 - ship.hull_damage_percent}%` }}
                />
              </div>
            </div>

            {/* Weapons */}
            {ship.weapons.length > 0 && (
              <div className="text-xs">
                <span className="text-terminal-text-dimmer block mb-1">Weapons</span>
                {ship.weapons.map((w, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-terminal-primary">{w.name}</span>
                    <span className="text-terminal-text-dimmer">({w.mount})</span>
                    <span className={
                      w.condition === 'operational' ? 'text-green-400' :
                      w.condition === 'damaged' ? 'text-yellow-400' : 'text-red-400'
                    }>
                      {w.condition}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Cargo */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-terminal-text-dimmer block">Cargo Seized</span>
                <span className="text-terminal-primary">{ship.cargo_tons}dt</span>
                {ship.cargo_manifest && (
                  <span className="text-terminal-text-dimmer block">{ship.cargo_manifest}</span>
                )}
              </div>
              <div>
                <span className="text-terminal-text-dimmer block">Cargo Value (est.)</span>
                <span className="text-green-400">Cr{ship.cargo_estimated_value.toLocaleString()}</span>
              </div>
            </div>

            {/* Capture info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {ship.capture_location && (
                <div>
                  <span className="text-terminal-text-dimmer block">Captured At</span>
                  <span className="text-terminal-primary">{ship.capture_location}</span>
                </div>
              )}
              {ship.capture_imperial_date && (
                <div>
                  <span className="text-terminal-text-dimmer block">Capture Date</span>
                  <span className="text-terminal-primary">{ship.capture_imperial_date}</span>
                </div>
              )}
            </div>

            {/* Estimates (only for captured/kept) */}
            {(ship.status === 'captured' || ship.status === 'kept') && (
              <div className="border-t border-terminal-border pt-2 space-y-1">
                <div className="text-xs font-bold text-terminal-text-dimmer">ESTIMATES</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-terminal-text-dimmer block">Sale Value</span>
                    <span className="text-green-400">Cr{saleEst.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-terminal-text-dimmer block">Scrap Value</span>
                    <span className="text-orange-400">Cr{estimateScrapValue(ship.hull_type).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-terminal-text-dimmer block">Repair Cost</span>
                    <span className="text-yellow-400">Cr{repairCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-terminal-text-dimmer block">Repair Time</span>
                    <span className="text-yellow-400">{repairWeeks} weeks</span>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-terminal-text-dimmer">Min Prize Crew: </span>
                  <span className="text-cyan-400">{minCrew}</span>
                </div>
              </div>
            )}

            {/* Prize crew (for kept ships) */}
            {ship.status === 'kept' && ship.assigned_prize_crew.length > 0 && (
              <div className="text-xs">
                <span className="text-terminal-text-dimmer block mb-1">Prize Crew Assigned</span>
                {ship.assigned_prize_crew.map((pc, i) => (
                  <span key={i} className="text-cyan-400 mr-2">{pc.crew_name}</span>
                ))}
              </div>
            )}

            {/* Disposition results */}
            {ship.status === 'sold' && (
              <div className="text-xs border-t border-terminal-border pt-2">
                <span className="text-terminal-text-dimmer">Sold for </span>
                <span className="text-green-400">Cr{(ship.sale_value || 0).toLocaleString()}</span>
                {ship.sale_port && <span className="text-terminal-text-dimmer"> at {ship.sale_port}</span>}
              </div>
            )}
            {ship.status === 'scrapped' && (
              <div className="text-xs border-t border-terminal-border pt-2">
                <span className="text-terminal-text-dimmer">Scrapped for </span>
                <span className="text-orange-400">Cr{(ship.scrap_value || 0).toLocaleString()}</span>
              </div>
            )}
            {ship.status === 'gifted' && (
              <div className="text-xs border-t border-terminal-border pt-2">
                <span className="text-terminal-text-dimmer">Gifted to </span>
                <span className="text-purple-400">{ship.gifted_to_port || 'port'}</span>
              </div>
            )}

            {ship.notes && (
              <div className="text-xs text-terminal-text-dimmer">{ship.notes}</div>
            )}

            {/* Action buttons (only for captured ships) */}
            {ship.status === 'captured' && (
              <div className="flex gap-2 pt-2 border-t border-terminal-border">
                <button
                  onClick={() => { setDisposeId(isDisposing ? null : ship.id); setDisposeAction('sold'); }}
                  className="terminal-btn text-xs flex items-center gap-1"
                >
                  <ShieldCheck className="h-3 w-3" /> Dispose
                </button>
                <button
                  onClick={() => deletePrizeShip(ship.id)}
                  className="terminal-btn text-xs text-red-400 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            )}

            {/* Disposition form */}
            {isDisposing && ship.status === 'captured' && (
              <div className="terminal-card p-3 space-y-2 bg-terminal-bg-dark">
                <div className="text-xs font-bold text-terminal-primary">DISPOSE OF PRIZE</div>
                <div className="grid grid-cols-4 gap-1">
                  {(['kept', 'sold', 'scrapped', 'gifted'] as PrizeShipStatus[]).map(action => (
                    <button
                      key={action}
                      onClick={() => setDisposeAction(action)}
                      className={`terminal-btn text-xs py-1 ${disposeAction === action ? 'primary' : ''}`}
                    >
                      {action === 'kept' && <Anchor className="h-3 w-3 inline mr-1" />}
                      {action === 'sold' && <DollarSign className="h-3 w-3 inline mr-1" />}
                      {action === 'scrapped' && <Recycle className="h-3 w-3 inline mr-1" />}
                      {action === 'gifted' && <Gift className="h-3 w-3 inline mr-1" />}
                      {PRIZE_STATUS_CONFIG[action].label}
                    </button>
                  ))}
                </div>

                {disposeAction === 'kept' && (
                  <div>
                    <label className="text-xs text-terminal-text-dimmer block mb-1">Rename to (optional)</label>
                    <input
                      type="text"
                      placeholder="New name for the ship..."
                      value={disposeRenamedTo}
                      onChange={e => setDisposeRenamedTo(e.target.value)}
                      className="terminal-input text-sm w-full"
                    />
                    <div className="text-xs text-terminal-text-dimmer mt-1">
                      Requires min {minCrew} prize crew from your roster.
                    </div>
                  </div>
                )}

                {disposeAction === 'sold' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-terminal-text-dimmer block mb-1">
                        Sale Price (est. Cr{saleEst.toLocaleString()})
                      </label>
                      <input
                        type="number"
                        placeholder={saleEst.toString()}
                        value={disposeSaleValue}
                        onChange={e => setDisposeSaleValue(e.target.value)}
                        className="terminal-input text-sm w-full"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-terminal-text-dimmer block mb-1">Sold At</label>
                      <select
                        value={disposeSalePort}
                        onChange={e => setDisposeSalePort(e.target.value)}
                        className="terminal-input text-sm w-full"
                      >
                        <option value="">Select port...</option>
                        {ports.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {disposeAction === 'scrapped' && (
                  <div className="text-xs text-terminal-text-dimmer">
                    Estimated scrap value: <span className="text-orange-400">Cr{estimateScrapValue(ship.hull_type).toLocaleString()}</span>
                  </div>
                )}

                {disposeAction === 'gifted' && (
                  <div>
                    <label className="text-xs text-terminal-text-dimmer block mb-1">Gift to Port</label>
                    <select
                      value={disposeGiftPort}
                      onChange={e => setDisposeGiftPort(e.target.value)}
                      className="terminal-input text-sm w-full"
                    >
                      <option value="">Select port...</option>
                      {ports.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <div className="text-xs text-terminal-text-dimmer mt-1">
                      Gifting a ship to a port can improve their attitude toward you.
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDispose(ship)}
                    className="terminal-btn primary text-xs"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDisposeId(null)}
                    className="terminal-btn text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-terminal-primary flex items-center gap-2">
          <Ship className="h-5 w-5" />
          PRIZE LOG
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="terminal-btn primary text-xs flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Log Prize
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="terminal-stat text-center">
          <div className="text-yellow-400 font-bold text-lg">{capturedShips.length}</div>
          <div className="text-terminal-text-dimmer text-xs">Awaiting</div>
        </div>
        <div className="terminal-stat text-center">
          <div className="text-cyan-400 font-bold text-lg">{keptShips.length}</div>
          <div className="text-terminal-text-dimmer text-xs">In Fleet</div>
        </div>
        <div className="terminal-stat text-center">
          <div className="text-green-400 font-bold text-lg">Cr{totalPrizeValue.toLocaleString()}</div>
          <div className="text-terminal-text-dimmer text-xs">Ships Sold/Scrapped</div>
        </div>
        <div className="terminal-stat text-center">
          <div className="text-green-400 font-bold text-lg">Cr{totalCargoValue.toLocaleString()}</div>
          <div className="text-terminal-text-dimmer text-xs">Cargo Seized</div>
        </div>
      </div>

      {/* Add Prize Form */}
      {showAddForm && (
        <div className="terminal-card p-3 space-y-3">
          <div className="text-sm font-bold text-terminal-primary">LOG NEW PRIZE</div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Ship name (e.g. MV Starlight Fortune)"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="terminal-input text-sm"
            />
            <select
              value={form.hull_type}
              onChange={e => handleHullTypeChange(e.target.value)}
              className="terminal-input text-sm"
            >
              {Object.entries(HULL_TYPE_TEMPLATES).map(([key, tmpl]) => (
                <option key={key} value={key}>{tmpl.label} ({tmpl.tonnage}dt)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-xs text-terminal-text-dimmer block mb-1">Tonnage</label>
              <input
                type="number"
                value={form.tonnage}
                onChange={e => setForm(p => ({ ...p, tonnage: parseInt(e.target.value, 10) || 200 }))}
                className="terminal-input text-sm w-full"
                min={10}
              />
            </div>
            <div>
              <label className="text-xs text-terminal-text-dimmer block mb-1">Tech Level</label>
              <input
                type="number"
                value={form.tech_level}
                onChange={e => setForm(p => ({ ...p, tech_level: parseInt(e.target.value, 10) || 10 }))}
                className="terminal-input text-sm w-full"
                min={1}
                max={16}
              />
            </div>
            <div>
              <label className="text-xs text-terminal-text-dimmer block mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={e => setForm(p => ({ ...p, condition: e.target.value as PrizeShipCondition }))}
                className="terminal-input text-sm w-full"
              >
                {Object.entries(PRIZE_CONDITION_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-terminal-text-dimmer block mb-1">Hull Damage %</label>
              <input
                type="number"
                value={form.hull_damage_percent}
                onChange={e => setForm(p => ({ ...p, hull_damage_percent: parseInt(e.target.value, 10) || 0 }))}
                className="terminal-input text-sm w-full"
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-terminal-text-dimmer block mb-1">Capture Location</label>
              <input
                type="text"
                placeholder="System name..."
                value={form.capture_location}
                onChange={e => setForm(p => ({ ...p, capture_location: e.target.value }))}
                className="terminal-input text-sm w-full"
              />
            </div>
            <div>
              <label className="text-xs text-terminal-text-dimmer block mb-1">Imperial Date</label>
              <input
                type="text"
                placeholder="e.g. 142-1105"
                value={form.capture_imperial_date}
                onChange={e => setForm(p => ({ ...p, capture_imperial_date: e.target.value }))}
                className="terminal-input text-sm w-full"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-terminal-primary">
            <input
              type="checkbox"
              checked={form.drives_operational}
              onChange={e => setForm(p => ({ ...p, drives_operational: e.target.checked }))}
              className="accent-green-500"
            />
            Drives Operational
          </label>

          {/* Weapons */}
          <div>
            <label className="text-xs text-terminal-text-dimmer block mb-1">Weapons</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Weapon name"
                value={form.weapon_name}
                onChange={e => setForm(p => ({ ...p, weapon_name: e.target.value }))}
                className="terminal-input text-sm flex-1"
              />
              <input
                type="text"
                placeholder="Mount (turret/bay)"
                value={form.weapon_mount}
                onChange={e => setForm(p => ({ ...p, weapon_mount: e.target.value }))}
                className="terminal-input text-sm w-32"
              />
              <button onClick={handleAddWeapon} className="terminal-btn text-xs">Add</button>
            </div>
            {form.weapons.length > 0 && (
              <div className="mt-1 space-y-1">
                {form.weapons.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-terminal-primary">{w.name}</span>
                    <span className="text-terminal-text-dimmer">({w.mount})</span>
                    <button onClick={() => handleRemoveWeapon(i)} className="text-red-400 text-xs">x</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cargo */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-terminal-text-dimmer block mb-1">Cargo (tons)</label>
              <input
                type="number"
                value={form.cargo_tons}
                onChange={e => setForm(p => ({ ...p, cargo_tons: parseInt(e.target.value, 10) || 0 }))}
                className="terminal-input text-sm w-full"
                min={0}
              />
            </div>
            <div>
              <label className="text-xs text-terminal-text-dimmer block mb-1">Cargo Value (Cr)</label>
              <input
                type="number"
                value={form.cargo_estimated_value}
                onChange={e => setForm(p => ({ ...p, cargo_estimated_value: parseInt(e.target.value, 10) || 0 }))}
                className="terminal-input text-sm w-full"
                min={0}
              />
            </div>
            <div>
              <label className="text-xs text-terminal-text-dimmer block mb-1">Cargo Manifest</label>
              <input
                type="text"
                placeholder="e.g. Machine Parts, Spices"
                value={form.cargo_manifest}
                onChange={e => setForm(p => ({ ...p, cargo_manifest: e.target.value }))}
                className="terminal-input text-sm w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-terminal-text-dimmer block mb-1">Notes</label>
            <input
              type="text"
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="terminal-input text-sm w-full"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={handleAddShip} className="terminal-btn primary text-xs">Log Prize</button>
            <button onClick={() => { setShowAddForm(false); setForm(defaultAddForm); }} className="terminal-btn text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Captured Ships (awaiting disposition) */}
      {capturedShips.length > 0 && (
        <div>
          <div className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
            <Package className="h-4 w-4" />
            AWAITING DISPOSITION ({capturedShips.length})
          </div>
          <div className="space-y-2">
            {capturedShips.map(renderShipCard)}
          </div>
        </div>
      )}

      {/* Fleet Ships (kept) */}
      {keptShips.length > 0 && (
        <div>
          <div className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
            <Anchor className="h-4 w-4" />
            IN FLEET ({keptShips.length})
          </div>
          <div className="space-y-2">
            {keptShips.map(renderShipCard)}
          </div>
        </div>
      )}

      {/* Disposed Ships History */}
      {disposedShips.length > 0 && (
        <div>
          <div className="text-sm font-bold text-terminal-text-dimmer mb-2">
            DISPOSED ({disposedShips.length})
          </div>
          <div className="space-y-2">
            {disposedShips.map(renderShipCard)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {prizeShips.length === 0 && !showAddForm && (
        <div className="text-center text-terminal-text-dimmer py-8">
          <Ship className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No prizes taken yet. Capture your first ship.</p>
        </div>
      )}
    </div>
  );
};
