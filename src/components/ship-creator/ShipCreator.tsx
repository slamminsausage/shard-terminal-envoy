/**
 * ShipCreator - Interactive Ship Construction Wizard
 *
 * A step-by-step ship designer following the Traveller High Guard
 * construction rules. Uses the existing calculation engine from
 * src/data/shipConstruction/ with CRT terminal aesthetics.
 *
 * Steps:
 *  1. Hull (tonnage + configuration)
 *  2. Hull Specialisation & Options
 *  3. Armour
 *  4. Drives (manoeuvre/reaction + jump)
 *  5. Power Plant
 *  6. Fuel Tanks
 *  7. Bridge
 *  8. Computer
 *  9. Sensors
 * 10. Staterooms & Common Areas
 * 11. Cargo & Finalise
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  type ShipDesign,
  type HullConfigType,
  type HullConfiguration,
  type SpecialisedHullType,
  type HullOptionId,
  type ArmorMaterialId,
  type PowerPlantTier,
  type BarbetteWeaponId,
  type BayWeaponId,
  type BaySize,
  type SpinalWeaponId,
  type PointDefenceWeaponId,
  type ScreenId,
  type MountTypeId,
  HULL_CONFIGURATIONS,
  SPECIALISED_HULL_TYPES,
  HULL_OPTIONS,
  ARMOR_MATERIALS,
  MANOEUVRE_DRIVE_TABLE,
  JUMP_DRIVE_TABLE,
  POWER_PLANT_TYPES,
  SENSOR_SUITES,
  COMPUTER_MODELS,
  COCKPIT_OPTIONS,
  STATEROOM_TYPES,
  TURRET_WEAPONS,
  WEAPON_MOUNTS,
  BARBETTE_WEAPONS,
  SMALL_BAY_WEAPONS,
  MEDIUM_BAY_WEAPONS,
  LARGE_BAY_WEAPONS,
  SPINAL_WEAPONS,
  POINT_DEFENCE_WEAPONS,
  SCREENS,
  calculateHardpoints,
  calculateFirmpoints,
  calculateSpinalMountTons,
  createEmptyShipDesign,
  calculateShipDesign,
  formatCredits,
  calculateHullPoints,
  calculateHullCost,
  getMaxProtection,
  calculateArmorTonnage,
  getUseableTonnagePercent,
  calculateManoeuvreDriveTons,
  calculateJumpDriveTons,
  getManoeuvreMinTL,
  getJumpMinTL,
  powerForBasicSystems,
  powerForManoeuvreDrive,
  powerForJumpDrive,
  calculatePowerGenerated,
  minimumPowerPlantTons,
  jumpFuelTons,
  powerPlantFuelTons,
  getBridgeTons,
  calculateBridgeCost,
  getEffectiveProcessing,
  calculateHullOptionCost,
  calculateHullOptionTonnage,
  constructionTimeDays,
} from '@/data/shipConstruction';

const STEP_LABELS = [
  'Hull',
  'Specialisation',
  'Armour',
  'Drives',
  'Power Plant',
  'Fuel',
  'Bridge',
  'Computer',
  'Sensors',
  'Weapons',
  'Quarters',
  'Finalise',
];

const TOTAL_STEPS = STEP_LABELS.length;

interface ShipCreatorProps {
  onComplete: (design: ShipDesign) => void;
  onCancel: () => void;
}

export default function ShipCreator({ onComplete, onCancel }: ShipCreatorProps) {
  const [step, setStep] = useState(1);
  const [design, setDesign] = useState<ShipDesign>(createEmptyShipDesign);

  // Live calculations
  const calc = useMemo(() => calculateShipDesign(design), [design]);

  const updateDesign = useCallback((patch: Partial<ShipDesign>) => {
    setDesign((prev) => ({ ...prev, ...patch }));
  }, []);

  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinalise = () => {
    onComplete(design);
  };

  // ═══════════════════════════════════════════════════════════════════
  //  SIDEBAR: Running summary
  // ═══════════════════════════════════════════════════════════════════
  const Sidebar = () => {
    const pctUsed = design.tonnage > 0
      ? Math.round((calc.totalTonnageUsed / design.tonnage) * 100)
      : 0;
    const costMCr = calc.totalCost / 1_000_000;

    return (
      <div className="panel h-fit sticky top-4">
        <div className="panel-header">
          <span className="panel-title">DESIGN STATUS</span>
          <span className="panel-status">{design.name || 'NEW SHIP'}</span>
        </div>
        <div className="panel-content space-y-3">
          {/* Tonnage bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span style={{ color: 'var(--text-dim)' }}>TONNAGE</span>
              <span style={{ color: 'var(--primary)' }}>
                {calc.totalTonnageUsed}/{design.tonnage}t ({pctUsed}%)
              </span>
            </div>
            <div className="power-bar">
              <div
                className={`power-bar-fill ${pctUsed > 100 ? 'danger' : pctUsed > 90 ? 'warning' : ''}`}
                style={{ width: `${Math.min(pctUsed, 100)}%` }}
              />
            </div>
          </div>

          {/* Power bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span style={{ color: 'var(--text-dim)' }}>POWER</span>
              <span style={{ color: calc.powerSurplus >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                {calc.totalPowerGenerated}/{calc.totalPowerRequired}
                {calc.powerSurplus >= 0 ? ` (+${calc.powerSurplus})` : ` (${calc.powerSurplus})`}
              </span>
            </div>
            <div className="power-bar">
              <div
                className={`power-bar-fill ${calc.powerSurplus < 0 ? 'danger' : ''}`}
                style={{
                  width: `${calc.totalPowerRequired > 0
                    ? Math.min((calc.totalPowerGenerated / calc.totalPowerRequired) * 100, 100)
                    : 100}%`,
                }}
              />
            </div>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded" style={{ background: 'rgba(0,255,0,0.05)', border: '1px solid rgba(0,255,0,0.2)' }}>
              <div style={{ color: 'var(--text-dimmer)' }}>HULL PTS</div>
              <div style={{ color: 'var(--primary)', fontFamily: 'Orbitron, sans-serif', fontSize: '1rem' }}>
                {calc.hullPoints}
              </div>
            </div>
            <div className="p-2 rounded" style={{ background: 'rgba(0,255,0,0.05)', border: '1px solid rgba(0,255,0,0.2)' }}>
              <div style={{ color: 'var(--text-dimmer)' }}>COST</div>
              <div style={{ color: 'var(--secondary)', fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem' }}>
                MCr{costMCr.toFixed(1)}
              </div>
            </div>
            <div className="p-2 rounded" style={{ background: 'rgba(0,255,0,0.05)', border: '1px solid rgba(0,255,0,0.2)' }}>
              <div style={{ color: 'var(--text-dimmer)' }}>THRUST</div>
              <div style={{ color: 'var(--primary)', fontFamily: 'Orbitron, sans-serif', fontSize: '1rem' }}>
                {design.manoeuvreRating}G
              </div>
            </div>
            <div className="p-2 rounded" style={{ background: 'rgba(0,255,0,0.05)', border: '1px solid rgba(0,255,0,0.2)' }}>
              <div style={{ color: 'var(--text-dimmer)' }}>JUMP</div>
              <div style={{ color: 'var(--primary)', fontFamily: 'Orbitron, sans-serif', fontSize: '1rem' }}>
                J-{design.jumpRating}
              </div>
            </div>
          </div>

          {/* Cargo remaining */}
          <div className="text-xs font-mono p-2 rounded" style={{ background: 'rgba(0,255,0,0.05)', border: '1px solid rgba(0,255,0,0.2)' }}>
            <div style={{ color: 'var(--text-dimmer)' }}>REMAINING TONNAGE</div>
            <div style={{
              color: calc.remainingTonnage < 0 ? 'var(--danger)' : 'var(--primary)',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1rem',
            }}>
              {calc.remainingTonnage}t
            </div>
          </div>

          {/* Errors/Warnings */}
          {calc.validationErrors.length > 0 && (
            <div className="space-y-1">
              {calc.validationErrors.map((err, i) => (
                <div key={i} className="text-xs font-mono p-1.5 rounded"
                  style={{ color: 'var(--danger)', background: 'rgba(255,51,68,0.1)', border: '1px solid rgba(255,51,68,0.3)' }}>
                  {err}
                </div>
              ))}
            </div>
          )}
          {calc.validationWarnings.length > 0 && (
            <div className="space-y-1">
              {calc.validationWarnings.map((w, i) => (
                <div key={i} className="text-xs font-mono p-1.5 rounded"
                  style={{ color: 'var(--warning)', background: 'rgba(255,102,0,0.1)', border: '1px solid rgba(255,102,0,0.3)' }}>
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  //  STEP RENDERERS
  // ═══════════════════════════════════════════════════════════════════

  const renderStep1_Hull = () => {
    const currentConfig = HULL_CONFIGURATIONS.find((c) => c.id === design.hullConfiguration)!;
    const specialised = SPECIALISED_HULL_TYPES.find((s) => s.id === design.specialisedHull);
    const hullPoints = calculateHullPoints(design.tonnage, currentConfig, specialised);
    const hullCostCr = calculateHullCost(design.tonnage, currentConfig, specialised);
    const useablePercent = getUseableTonnagePercent(currentConfig);

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={1} title="BUILD HULL" subtitle="Select tonnage and hull shape" />

        {/* Ship Name & TL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FieldLabel>Ship Name</FieldLabel>
            <input
              className="terminal-input"
              value={design.name}
              onChange={(e) => updateDesign({ name: e.target.value })}
              placeholder="Enter ship name..."
            />
          </div>
          <div>
            <FieldLabel>Tech Level</FieldLabel>
            <select
              className="terminal-input"
              value={design.techLevel}
              onChange={(e) => updateDesign({ techLevel: parseInt(e.target.value) })}
            >
              {Array.from({ length: 15 }, (_, i) => i + 6).map((tl) => (
                <option key={tl} value={tl}>TL {tl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hull Tonnage */}
        <div>
          <FieldLabel>Hull Tonnage</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="terminal-input flex-1"
              value={design.tonnage}
              min={5}
              step={5}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 5;
                updateDesign({ tonnage: Math.max(5, val) });
              }}
            />
            <span className="text-xs font-mono" style={{ color: 'var(--text-dimmer)' }}>
              min 5t | jump: min 100t
            </span>
          </div>
          {/* Quick tonnage presets */}
          <div className="flex flex-wrap gap-2 mt-2">
            {[10, 20, 50, 100, 200, 400, 600, 800, 1000, 2000, 5000].map((t) => (
              <button
                key={t}
                className={`jump-rating-btn ${design.tonnage === t ? 'active' : ''}`}
                style={{ width: 'auto', padding: '4px 10px', fontSize: '0.7rem' }}
                onClick={() => updateDesign({ tonnage: t })}
              >
                {t}t
              </button>
            ))}
          </div>
        </div>

        {/* Hull Configuration */}
        <div>
          <FieldLabel>Hull Configuration</FieldLabel>
          <div className="grid grid-cols-1 gap-2">
            {HULL_CONFIGURATIONS.map((config) => (
              <ConfigOption
                key={config.id}
                selected={design.hullConfiguration === config.id}
                onClick={() => {
                  const patch: Partial<ShipDesign> = { hullConfiguration: config.id };
                  // Reset specialised hull if planetoid
                  if (!config.canUseSpecialisedHulls) {
                    patch.specialisedHull = 'none';
                  }
                  // Reset armour if can't have it
                  if (!config.canHaveArmor) {
                    patch.armorProtection = 0;
                    patch.armorMaterial = undefined;
                  }
                  updateDesign(patch);
                }}
                label={config.name}
                detail={config.description}
                badges={[
                  config.streamlined === true ? 'Streamlined' :
                    config.streamlined === 'partial' ? 'Partial' : 'Non-Atmo',
                  config.freeFuelScoops ? 'Free Scoops' : '',
                  config.canHaveArmor ? '' : 'No Armour',
                  config.costModifier !== 1 ? `Cost x${config.costModifier}` : '',
                  config.hullPointModifier !== 1 ? `HP x${config.hullPointModifier}` : '',
                  config.baseArmourProtection > 0 ? `+${config.baseArmourProtection} Prot` : '',
                ].filter(Boolean)}
                examples={config.examples}
              />
            ))}
          </div>
        </div>

        {/* Hull stats summary */}
        <StatBox label="Hull Summary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Hull Points" value={String(hullPoints)} />
            <MiniStat label="Hull Cost" value={formatCredits(hullCostCr)} />
            <MiniStat label="Useable Space" value={useablePercent < 1 ? `${Math.floor(design.tonnage * useablePercent)}t (${useablePercent * 100}%)` : `${design.tonnage}t`} />
            <MiniStat
              label="Atmo Capable"
              value={currentConfig.streamlined === true ? 'YES' : currentConfig.streamlined === 'partial' ? 'PARTIAL' : 'NO'}
              color={currentConfig.streamlined === true ? 'var(--primary)' : currentConfig.streamlined === 'partial' ? 'var(--warning)' : 'var(--danger)'}
            />
          </div>
        </StatBox>
      </div>
    );
  };

  const renderStep2_Specialisation = () => {
    const currentConfig = HULL_CONFIGURATIONS.find((c) => c.id === design.hullConfiguration)!;
    const canSpecialise = currentConfig.canUseSpecialisedHulls;
    const availableSpecialised = SPECIALISED_HULL_TYPES.filter((s) =>
      s.id === 'none' || (design.tonnage >= s.minTonnage && design.tonnage <= s.maxTonnage)
    );

    // Hull options filtering
    const availableOptions = HULL_OPTIONS.filter((o) => design.techLevel >= o.tl);

    const isOptionConflicting = (optId: HullOptionId): boolean => {
      const opt = HULL_OPTIONS.find((o) => o.id === optId);
      if (!opt) return false;
      return design.hullOptions.some((selectedId) =>
        opt.conflictsWith.includes(selectedId)
      );
    };

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={2} title="SPECIALISATION & OPTIONS" subtitle="Advanced hull construction and coatings" />

        {/* Specialised Hull Type */}
        {canSpecialise ? (
          <div>
            <FieldLabel>Specialised Hull Construction</FieldLabel>
            <div className="grid grid-cols-1 gap-2">
              {availableSpecialised.map((spec) => (
                <ConfigOption
                  key={spec.id}
                  selected={design.specialisedHull === spec.id}
                  onClick={() => updateDesign({ specialisedHull: spec.id })}
                  label={spec.name}
                  detail={spec.description}
                  badges={[
                    spec.costModifier !== 1 ? `Cost x${spec.costModifier}` : '',
                    spec.hullPointModifier !== 1 ? `HP x${spec.hullPointModifier}` : '',
                    spec.notes || '',
                  ].filter(Boolean)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded font-mono text-sm" style={{ color: 'var(--warning)', background: 'rgba(255,102,0,0.1)', border: '1px solid rgba(255,102,0,0.3)' }}>
            Planetoid hulls cannot use specialised hull types.
          </div>
        )}

        {/* Hull Options */}
        <div>
          <FieldLabel>Hull Options</FieldLabel>
          <div className="grid grid-cols-1 gap-2">
            {availableOptions.map((option) => {
              const isSelected = design.hullOptions.includes(option.id);
              const conflicting = isOptionConflicting(option.id);
              const cost = calculateHullOptionCost(option, design.tonnage);
              const tons = calculateHullOptionTonnage(option, design.tonnage);

              return (
                <div
                  key={option.id}
                  className={`p-3 rounded cursor-pointer transition-all ${conflicting && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}`}
                  style={{
                    background: isSelected ? 'rgba(0,255,0,0.12)' : 'rgba(0,255,0,0.03)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(0,255,0,0.2)'}`,
                    boxShadow: isSelected ? '0 0 10px rgba(0,255,0,0.2)' : 'none',
                  }}
                  onClick={() => {
                    if (conflicting && !isSelected) return;
                    const newOptions = isSelected
                      ? design.hullOptions.filter((id) => id !== option.id)
                      : [...design.hullOptions, option.id];
                    updateDesign({ hullOptions: newOptions });
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-sm" style={{ color: isSelected ? 'var(--primary)' : 'var(--text-dim)' }}>
                        [{isSelected ? 'X' : ' '}] {option.name}
                        <span className="ml-2 text-xs" style={{ color: 'var(--text-dimmer)' }}>TL{option.tl}</span>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-dimmer)' }}>{option.description}</div>
                    </div>
                    <div className="text-xs font-mono text-right ml-2 shrink-0" style={{ color: 'var(--secondary)' }}>
                      {formatCredits(cost)}
                      {tons > 0 && <div>{tons}t</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStep3_Armour = () => {
    const currentConfig = HULL_CONFIGURATIONS.find((c) => c.id === design.hullConfiguration)!;
    const canArmour = currentConfig.canHaveArmor;
    const isMilitary = design.specialisedHull === 'military';
    const baseProtection = currentConfig.baseArmourProtection;
    const availableMaterials = ARMOR_MATERIALS.filter((m) => design.techLevel >= m.tl);

    const selectedMaterial = design.armorMaterial
      ? ARMOR_MATERIALS.find((m) => m.id === design.armorMaterial)
      : undefined;

    const maxProt = selectedMaterial
      ? getMaxProtection(selectedMaterial, design.techLevel, isMilitary)
      : 0;

    const armorTons = selectedMaterial && design.armorProtection > 0
      ? calculateArmorTonnage(design.tonnage, currentConfig, selectedMaterial, design.armorProtection)
      : 0;

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={3} title="INSTALL ARMOUR" subtitle="Protective plating and defence" />

        {baseProtection > 0 && (
          <StatBox label="Base Hull Protection">
            <div className="text-sm font-mono" style={{ color: 'var(--primary)' }}>
              This hull provides Protection +{baseProtection} from its natural composition.
            </div>
          </StatBox>
        )}

        {!canArmour ? (
          <div className="p-4 rounded font-mono text-sm" style={{ color: 'var(--warning)', background: 'rgba(255,102,0,0.1)', border: '1px solid rgba(255,102,0,0.3)' }}>
            This hull configuration cannot be armoured. {baseProtection > 0 ? `Base protection of +${baseProtection} still applies.` : ''}
          </div>
        ) : (
          <>
            {/* Armour Material */}
            <div>
              <FieldLabel>Armour Material</FieldLabel>
              {availableMaterials.length === 0 ? (
                <div className="text-xs font-mono" style={{ color: 'var(--text-dimmer)' }}>
                  No armour materials available at TL{design.techLevel}. Titanium Steel requires TL7.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <ConfigOption
                    selected={!design.armorMaterial}
                    onClick={() => updateDesign({ armorMaterial: undefined, armorProtection: 0 })}
                    label="No Armour"
                    detail="Standard hull with no additional protection."
                    badges={[]}
                  />
                  {availableMaterials.map((mat) => (
                    <ConfigOption
                      key={mat.id}
                      selected={design.armorMaterial === mat.id}
                      onClick={() => updateDesign({ armorMaterial: mat.id, armorProtection: Math.min(design.armorProtection || 1, getMaxProtection(mat, design.techLevel, isMilitary)) })}
                      label={mat.name}
                      detail={`${mat.tonnagePercent}% hull tonnage per point. Cost: ${formatCredits(mat.costPerTon)}/ton. ${mat.traits || ''}`}
                      badges={[
                        `TL${mat.tl}`,
                        `Max Prot: ${getMaxProtection(mat, design.techLevel, isMilitary)}`,
                        isMilitary ? 'Military: 2x Max' : '',
                      ].filter(Boolean)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Protection Level */}
            {selectedMaterial && (
              <div>
                <FieldLabel>Protection Level (0 to {maxProt})</FieldLabel>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={maxProt}
                    value={design.armorProtection}
                    onChange={(e) => updateDesign({ armorProtection: parseInt(e.target.value) })}
                    className="flex-1"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="font-mono text-lg" style={{ color: 'var(--primary)', fontFamily: 'Orbitron, sans-serif', minWidth: '3rem', textAlign: 'center' }}>
                    +{design.armorProtection}
                  </span>
                </div>

                <StatBox label="Armour Impact">
                  <div className="grid grid-cols-3 gap-3">
                    <MiniStat label="Total Protection" value={`+${design.armorProtection + baseProtection}`} />
                    <MiniStat label="Tonnage Used" value={`${armorTons}t`} />
                    <MiniStat label="Cost" value={formatCredits(calc.armorCost)} color="var(--secondary)" />
                  </div>
                </StatBox>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderStep4_Drives = () => {
    const maxManoeuvre = MANOEUVRE_DRIVE_TABLE.filter((e) => design.techLevel >= e.minTL);
    const maxJump = JUMP_DRIVE_TABLE.filter((e) => design.techLevel >= e.minTL);
    const mDriveTons = calculateManoeuvreDriveTons(design.tonnage, design.manoeuvreRating);
    const jDriveTons = calculateJumpDriveTons(design.tonnage, design.jumpRating);

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={4} title="INSTALL DRIVES" subtitle="Manoeuvre and jump propulsion systems" />

        {/* Drive Type */}
        <div>
          <FieldLabel>Drive Type</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <ConfigOption
              selected={!design.isReactionDrive}
              onClick={() => updateDesign({ isReactionDrive: false })}
              label="Manoeuvre Drive"
              detail="Gravitic thruster plates. No fuel required for thrust."
              badges={['MCr2/ton', 'TL9+']}
            />
            <ConfigOption
              selected={design.isReactionDrive}
              onClick={() => updateDesign({ isReactionDrive: true })}
              label="Reaction Drive"
              detail="Conventional thrusters. Requires fuel for operation."
              badges={['MCr0.2/ton', 'TL7+', 'Uses Fuel']}
            />
          </div>
        </div>

        {/* Thrust Rating */}
        <div>
          <FieldLabel>Thrust Rating ({design.isReactionDrive ? 'Reaction' : 'Manoeuvre'})</FieldLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {(design.isReactionDrive
              ? Array.from({ length: 16 }, (_, i) => i + 1)
              : [0, ...maxManoeuvre.map((e) => e.rating)]
            ).map((rating) => {
              const minTL = design.isReactionDrive ? 7 : getManoeuvreMinTL(rating);
              const available = design.techLevel >= minTL;
              return (
                <button
                  key={rating}
                  className={`jump-rating-btn ${design.manoeuvreRating === rating ? 'active' : ''}`}
                  style={{ width: 'auto', padding: '6px 12px', opacity: available ? 1 : 0.3 }}
                  disabled={!available}
                  onClick={() => updateDesign({ manoeuvreRating: rating })}
                >
                  {rating}G
                </button>
              );
            })}
          </div>
          <div className="text-xs font-mono" style={{ color: 'var(--text-dimmer)' }}>
            Drive tonnage: {mDriveTons}t | Cost: MCr{(calc.manoeuvreDriveCost / 1_000_000).toFixed(1)}
          </div>
        </div>

        {/* Jump Rating */}
        <div>
          <FieldLabel>Jump Rating</FieldLabel>
          {design.tonnage < 100 ? (
            <div className="text-xs font-mono" style={{ color: 'var(--warning)' }}>
              Jump drives require minimum 100t hull. Current hull: {design.tonnage}t.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {[0, ...maxJump.map((e) => e.rating)].map((rating) => {
                  const minTL = rating === 0 ? 0 : getJumpMinTL(rating);
                  const available = design.techLevel >= minTL;
                  return (
                    <button
                      key={rating}
                      className={`jump-rating-btn ${design.jumpRating === rating ? 'active' : ''}`}
                      style={{ width: 'auto', padding: '6px 12px', opacity: available ? 1 : 0.3 }}
                      disabled={!available}
                      onClick={() => updateDesign({ jumpRating: rating })}
                    >
                      {rating === 0 ? 'None' : `J-${rating}`}
                    </button>
                  );
                })}
              </div>
              {design.jumpRating > 0 && (
                <div className="text-xs font-mono" style={{ color: 'var(--text-dimmer)' }}>
                  Drive tonnage: {jDriveTons}t | Cost: MCr{(calc.jumpDriveCost / 1_000_000).toFixed(1)} |
                  Fuel per jump: {jumpFuelTons(design.tonnage, design.jumpRating)}t
                </div>
              )}
            </>
          )}
        </div>

        <StatBox label="Drive Summary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="M-Drive Tons" value={`${mDriveTons}t`} />
            <MiniStat label="J-Drive Tons" value={`${jDriveTons}t`} />
            <MiniStat label="Total Drive Cost" value={`MCr${((calc.manoeuvreDriveCost + calc.jumpDriveCost) / 1_000_000).toFixed(1)}`} color="var(--secondary)" />
            <MiniStat label="Min TL" value={`TL${Math.max(design.manoeuvreRating > 0 ? getManoeuvreMinTL(design.manoeuvreRating) : 0, design.jumpRating > 0 ? getJumpMinTL(design.jumpRating) : 0)}`} />
          </div>
        </StatBox>
      </div>
    );
  };

  const renderStep5_PowerPlant = () => {
    const availablePP = POWER_PLANT_TYPES.filter((pp) => design.techLevel >= pp.tl);
    const selectedPP = POWER_PLANT_TYPES.find((pp) => pp.id === design.powerPlantTier)!;
    const pBasic = powerForBasicSystems(design.tonnage);
    const pManoeuvre = powerForManoeuvreDrive(design.tonnage, design.manoeuvreRating);
    const pJump = powerForJumpDrive(design.tonnage, design.jumpRating);
    const totalNeeded = pBasic + pManoeuvre + pJump;
    const minTons = minimumPowerPlantTons(selectedPP, totalNeeded);
    const generated = calculatePowerGenerated(selectedPP, design.powerPlantTons);

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={5} title="INSTALL POWER PLANT" subtitle="Reactor selection and sizing" />

        {/* Power Plant Type */}
        <div>
          <FieldLabel>Power Plant Type</FieldLabel>
          <div className="grid grid-cols-1 gap-2">
            {availablePP.map((pp) => (
              <ConfigOption
                key={pp.id}
                selected={design.powerPlantTier === pp.id}
                onClick={() => updateDesign({ powerPlantTier: pp.id as PowerPlantTier })}
                label={pp.name}
                detail={`${pp.powerPerTon} Power per ton. Cost: MCr${pp.costPerTon}/ton.`}
                badges={[`TL${pp.tl}`, `${pp.powerPerTon}P/t`, `MCr${pp.costPerTon}/t`]}
              />
            ))}
          </div>
        </div>

        {/* Power Plant Size */}
        <div>
          <FieldLabel>Power Plant Size (tons)</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="terminal-input flex-1"
              value={design.powerPlantTons}
              min={1}
              onChange={(e) => updateDesign({ powerPlantTons: Math.max(1, parseInt(e.target.value) || 1) })}
            />
            <button
              className="terminal-btn"
              onClick={() => updateDesign({ powerPlantTons: minTons })}
              style={{ fontSize: '0.65rem', padding: '8px 12px' }}
            >
              AUTO-SIZE ({minTons}t)
            </button>
          </div>
        </div>

        {/* Power Budget */}
        <StatBox label="Power Budget">
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between" style={{ color: 'var(--text-dim)' }}>
              <span>Basic Ship Systems (20% hull)</span>
              <span>{pBasic} Power</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--text-dim)' }}>
              <span>Manoeuvre Drive ({design.manoeuvreRating}G)</span>
              <span>{pManoeuvre} Power</span>
            </div>
            {design.jumpRating > 0 && (
              <div className="flex justify-between" style={{ color: 'var(--text-dim)' }}>
                <span>Jump Drive (J-{design.jumpRating})</span>
                <span>{pJump} Power</span>
              </div>
            )}
            <div className="flex justify-between pt-1" style={{ borderTop: '1px solid rgba(0,255,0,0.2)' }}>
              <span style={{ color: 'var(--primary)' }}>Total Required (pre-weapons/equip)</span>
              <span style={{ color: 'var(--primary)' }}>{totalNeeded} Power</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--secondary)' }}>Generated ({design.powerPlantTons}t x {selectedPP.powerPerTon})</span>
              <span style={{ color: 'var(--secondary)' }}>{generated} Power</span>
            </div>
            <div className="flex justify-between font-bold">
              <span style={{ color: generated >= totalNeeded ? 'var(--primary)' : 'var(--danger)' }}>Surplus</span>
              <span style={{ color: generated >= totalNeeded ? 'var(--primary)' : 'var(--danger)' }}>
                {generated - totalNeeded >= 0 ? '+' : ''}{generated - totalNeeded} Power
              </span>
            </div>
          </div>
        </StatBox>
      </div>
    );
  };

  const renderStep6_Fuel = () => {
    const jFuel = jumpFuelTons(design.tonnage, design.jumpRating);
    const ppFuel = powerPlantFuelTons(design.powerPlantTons, 4 + (design.additionalFuelWeeks ?? 0));
    const totalFuel = jFuel + ppFuel;

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={6} title="INSTALL FUEL TANKS" subtitle="Jump fuel and power plant reserves" />

        {/* Jump Fuel (auto-calculated) */}
        {design.jumpRating > 0 && (
          <StatBox label="Jump Fuel">
            <div className="text-sm font-mono" style={{ color: 'var(--primary)' }}>
              {jFuel} tons (10% hull x J-{design.jumpRating} = {design.tonnage * 0.1 * design.jumpRating}t)
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-dimmer)' }}>
              Sufficient for one jump at maximum rating.
            </div>
          </StatBox>
        )}

        {/* Power Plant Fuel */}
        <div>
          <FieldLabel>Additional Fuel Reserve (weeks beyond standard 4)</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="terminal-input"
              style={{ width: '120px' }}
              value={design.additionalFuelWeeks ?? 0}
              min={0}
              max={52}
              onChange={(e) => updateDesign({ additionalFuelWeeks: Math.max(0, parseInt(e.target.value) || 0) })}
            />
            <span className="text-xs font-mono" style={{ color: 'var(--text-dimmer)' }}>
              extra weeks ({4 + (design.additionalFuelWeeks ?? 0)} weeks total)
            </span>
          </div>
        </div>

        <StatBox label="Fuel Summary">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Jump Fuel" value={`${jFuel}t`} />
            <MiniStat label="PP Fuel" value={`${ppFuel}t`} />
            <MiniStat label="Total Fuel" value={`${totalFuel}t`} color="var(--secondary)" />
          </div>
        </StatBox>
      </div>
    );
  };

  const renderStep7_Bridge = () => {
    const canCockpit = design.tonnage <= 50;
    const standardBridgeTons = getBridgeTons(design.tonnage);
    const bridgeCost = calculateBridgeCost(design.tonnage, design.holographicControls);

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={7} title="INSTALL BRIDGE" subtitle="Command and control systems" />

        {/* Bridge Type */}
        <div>
          <FieldLabel>Bridge Type</FieldLabel>
          <div className="grid grid-cols-1 gap-2">
            <ConfigOption
              selected={!design.useCockpit}
              onClick={() => updateDesign({ useCockpit: false })}
              label={`Standard Bridge (${standardBridgeTons}t)`}
              detail={`Full bridge with communications, avionics, scanners and controls. Cost: ${formatCredits(bridgeCost)}`}
              badges={[`${standardBridgeTons}t`, formatCredits(bridgeCost)]}
            />
            {canCockpit && COCKPIT_OPTIONS.map((cp) => (
              <ConfigOption
                key={cp.id}
                selected={design.useCockpit && (design.cockpitType ?? 'cockpit') === cp.id}
                onClick={() => updateDesign({ useCockpit: true, cockpitType: cp.id as any })}
                label={`${cp.name} (${cp.tons}t)`}
                detail={`${cp.description} Life support: ${cp.lifeSupport}. Cost: ${formatCredits(cp.cost)}`}
                badges={[`${cp.tons}t`, `${cp.seats} seat${cp.seats > 1 ? 's' : ''}`, formatCredits(cp.cost)]}
              />
            ))}
          </div>
        </div>

        {/* Holographic Controls */}
        {!design.useCockpit && (
          <div>
            <div
              className="p-3 rounded cursor-pointer transition-all"
              style={{
                background: design.holographicControls ? 'rgba(0,255,0,0.12)' : 'rgba(0,255,0,0.03)',
                border: `1px solid ${design.holographicControls ? 'var(--primary)' : 'rgba(0,255,0,0.2)'}`,
              }}
              onClick={() => updateDesign({ holographicControls: !design.holographicControls })}
            >
              <div className="font-mono text-sm" style={{ color: design.holographicControls ? 'var(--primary)' : 'var(--text-dim)' }}>
                [{design.holographicControls ? 'X' : ' '}] Holographic Controls (TL9+)
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-dimmer)' }}>
                +25% bridge cost. Grants DM+2 to Initiative. Requires TL9+.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep8_Computer = () => {
    const availableComputers = COMPUTER_MODELS.filter((c) => design.techLevel >= c.tl);

    const selectedComp = COMPUTER_MODELS.find((c) => c.id === design.computerId);
    const effective = selectedComp ? getEffectiveProcessing(selectedComp, design.computerBis) : null;

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={8} title="INSTALL COMPUTER" subtitle="Processing core and jump control" />

        <div>
          <FieldLabel>Ship Computer</FieldLabel>
          <div className="grid grid-cols-1 gap-2">
            {availableComputers.map((comp) => (
              <ConfigOption
                key={comp.id}
                selected={design.computerId === comp.id}
                onClick={() => updateDesign({ computerId: comp.id })}
                label={comp.name}
                detail={comp.description}
                badges={[`TL${comp.tl}`, `Processing ${comp.processing}`, formatCredits(comp.cost)]}
              />
            ))}
          </div>
        </div>

        {/* /bis option */}
        <div
          className="p-3 rounded cursor-pointer transition-all"
          style={{
            background: design.computerBis ? 'rgba(0,255,0,0.12)' : 'rgba(0,255,0,0.03)',
            border: `1px solid ${design.computerBis ? 'var(--primary)' : 'rgba(0,255,0,0.2)'}`,
          }}
          onClick={() => updateDesign({ computerBis: !design.computerBis })}
        >
          <div className="font-mono text-sm" style={{ color: design.computerBis ? 'var(--primary)' : 'var(--text-dim)' }}>
            [{design.computerBis ? 'X' : ' '}] Jump Control Specialisation (/bis)
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-dimmer)' }}>
            +50% computer cost. +5 Processing for Jump Control programs only.
          </div>
        </div>

        {effective && (
          <StatBox label="Computer Stats">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Processing" value={String(effective.standard)} />
              <MiniStat label="Jump Control" value={String(effective.jumpControl)} color="var(--secondary)" />
              <MiniStat label="Cost" value={formatCredits(calc.computerCost)} color="var(--secondary)" />
            </div>
          </StatBox>
        )}
      </div>
    );
  };

  const renderStep9_Sensors = () => {
    const availableSensors = SENSOR_SUITES.filter((s) => design.techLevel >= s.tl);

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={9} title="INSTALL SENSORS" subtitle="Detection and communications systems" />

        <div>
          <FieldLabel>Sensor Suite</FieldLabel>
          <div className="grid grid-cols-1 gap-2">
            {availableSensors.map((suite) => (
              <ConfigOption
                key={suite.id}
                selected={design.sensorSuiteId === suite.id}
                onClick={() => updateDesign({ sensorSuiteId: suite.id })}
                label={suite.name}
                detail={`Components: ${suite.components.join(', ')}`}
                badges={[
                  `TL${suite.tl}`,
                  `DM${suite.dm >= 0 ? '+' : ''}${suite.dm}`,
                  `${suite.power} Power`,
                  `${suite.tons}t`,
                  suite.cost > 0 ? formatCredits(suite.cost) : 'Free',
                ]}
              />
            ))}
          </div>
        </div>

        {/* Additional Sensor Stations */}
        <div>
          <FieldLabel>Additional Sensor Stations</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="terminal-input"
              style={{ width: '120px' }}
              value={design.additionalSensorStations}
              min={0}
              max={10}
              onChange={(e) => updateDesign({ additionalSensorStations: Math.max(0, parseInt(e.target.value) || 0) })}
            />
            <span className="text-xs font-mono" style={{ color: 'var(--text-dimmer)' }}>
              1t + MCr0.5 each. Extra stations for dedicated sensor operators.
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  //  STEP 10: WEAPONS & SCREENS
  // ═══════════════════════════════════════════════════════════════════

  const renderStep10_Weapons = () => {
    const availableHardpoints = calculateHardpoints(design.tonnage);
    const availableFirmpoints = calculateFirmpoints(design.tonnage);
    const isSmallCraft = design.tonnage < 100;

    const availableTurrets = TURRET_WEAPONS.filter(
      (w) => w.id !== 'particle_barbette' && design.techLevel >= w.tl
    );
    const availableBarbettes = BARBETTE_WEAPONS.filter((b) => design.techLevel >= b.tl);
    const availableSmallBays = SMALL_BAY_WEAPONS.filter((b) => design.techLevel >= b.tl);
    const availableMediumBays = MEDIUM_BAY_WEAPONS.filter((b) => design.techLevel >= b.tl);
    const availableLargeBays = LARGE_BAY_WEAPONS.filter((b) => design.techLevel >= b.tl);
    const availableSpinal = SPINAL_WEAPONS.filter((s) => design.techLevel >= s.tl);
    const availablePD = POINT_DEFENCE_WEAPONS.filter((p) => design.techLevel >= p.tl);
    const availableScreens = SCREENS.filter((s) => design.techLevel >= s.tl);

    // Helper: add a turret mount
    const addTurretMount = (mountId: MountTypeId) => {
      const mount = WEAPON_MOUNTS.find((m) => m.id === mountId)!;
      if (mount.tl > design.techLevel) return;
      updateDesign({
        weapons: [...design.weapons, { mountType: mountId, weapons: [], isFirmpoint: isSmallCraft }],
      });
    };

    const removeTurretMount = (idx: number) => {
      const next = [...design.weapons];
      next.splice(idx, 1);
      updateDesign({ weapons: next });
    };

    const addWeaponToMount = (mountIdx: number, weaponId: string) => {
      const next = design.weapons.map((inst, i) => {
        if (i !== mountIdx) return inst;
        const mount = WEAPON_MOUNTS.find((m) => m.id === inst.mountType)!;
        if (inst.weapons.length >= mount.maxWeapons) return inst;
        return { ...inst, weapons: [...inst.weapons, weaponId as any] };
      });
      updateDesign({ weapons: next });
    };

    const removeWeaponFromMount = (mountIdx: number, weaponIdx: number) => {
      const next = design.weapons.map((inst, i) => {
        if (i !== mountIdx) return inst;
        const w = [...inst.weapons];
        w.splice(weaponIdx, 1);
        return { ...inst, weapons: w };
      });
      updateDesign({ weapons: next });
    };

    // Barbette helpers
    const addBarbette = (id: BarbetteWeaponId) => {
      const existing = design.barbettes.find((b) => b.weaponId === id);
      if (existing) {
        updateDesign({ barbettes: design.barbettes.map((b) => b.weaponId === id ? { ...b, quantity: b.quantity + 1 } : b) });
      } else {
        updateDesign({ barbettes: [...design.barbettes, { weaponId: id, quantity: 1 }] });
      }
    };
    const removeBarbette = (id: BarbetteWeaponId) => {
      updateDesign({ barbettes: design.barbettes.filter((b) => b.weaponId !== id || b.quantity > 1).map((b) => b.weaponId === id ? { ...b, quantity: b.quantity - 1 } : b) });
    };

    // Bay helpers
    const addBay = (id: BayWeaponId, size: BaySize) => {
      const existing = design.bays.find((b) => b.weaponId === id && b.size === size);
      if (existing) {
        updateDesign({ bays: design.bays.map((b) => (b.weaponId === id && b.size === size) ? { ...b, quantity: b.quantity + 1 } : b) });
      } else {
        updateDesign({ bays: [...design.bays, { weaponId: id, size, quantity: 1 }] });
      }
    };
    const removeBay = (id: BayWeaponId, size: BaySize) => {
      updateDesign({ bays: design.bays.filter((b) => !(b.weaponId === id && b.size === size) || b.quantity > 1).map((b) => (b.weaponId === id && b.size === size) ? { ...b, quantity: b.quantity - 1 } : b) });
    };

    // PD helpers
    const addPD = (id: PointDefenceWeaponId) => {
      const existing = design.pointDefence.find((p) => p.weaponId === id);
      if (existing) {
        updateDesign({ pointDefence: design.pointDefence.map((p) => p.weaponId === id ? { ...p, quantity: p.quantity + 1 } : p) });
      } else {
        updateDesign({ pointDefence: [...design.pointDefence, { weaponId: id, quantity: 1 }] });
      }
    };
    const removePD = (id: PointDefenceWeaponId) => {
      updateDesign({ pointDefence: design.pointDefence.filter((p) => p.weaponId !== id || p.quantity > 1).map((p) => p.weaponId === id ? { ...p, quantity: p.quantity - 1 } : p) });
    };

    // Screen helpers
    const addScreen = (id: ScreenId) => {
      const existing = design.screens.find((s) => s.screenId === id);
      if (existing) {
        updateDesign({ screens: design.screens.map((s) => s.screenId === id ? { ...s, quantity: s.quantity + 1 } : s) });
      } else {
        updateDesign({ screens: [...design.screens, { screenId: id, quantity: 1 }] });
      }
    };
    const removeScreen = (id: ScreenId) => {
      updateDesign({ screens: design.screens.filter((s) => s.screenId !== id || s.quantity > 1).map((s) => s.screenId === id ? { ...s, quantity: s.quantity - 1 } : s) });
    };

    const statBadge = (label: string, value: string) => (
      <span key={label} className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,255,0,0.08)', border: '1px solid rgba(0,255,0,0.2)', color: 'var(--text-dim)' }}>
        {label}: {value}
      </span>
    );

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={10} title="WEAPONS & SCREENS" subtitle="Turrets, barbettes, bays, spinal mounts, and defensive screens" />

        {/* Hardpoint summary */}
        <div className="p-3 rounded text-xs font-mono" style={{ background: 'rgba(0,255,0,0.05)', border: '1px solid rgba(0,255,0,0.2)' }}>
          {isSmallCraft ? (
            <span style={{ color: 'var(--text-dim)' }}>
              FIRMPOINTS available: {calc.firmpoints - calc.usedFirmpoints}/{calc.firmpoints} (small craft)
            </span>
          ) : (
            <span style={{ color: 'var(--text-dim)' }}>
              HARDPOINTS available: {calc.hardpoints - calc.usedHardpoints}/{calc.hardpoints} &nbsp;|&nbsp;
              Weapons tonnage: {calc.weaponsTons}t &nbsp;|&nbsp;
              Power draw: {calc.powerWeapons}
            </span>
          )}
        </div>

        {/* ── TURRET MOUNTS ── */}
        <div>
          <FieldLabel>Turret & Fixed Mounts</FieldLabel>
          <div className="text-xs mb-2" style={{ color: 'var(--text-dimmer)' }}>
            Each mount uses 1 hardpoint/firmpoint. Up to {isSmallCraft ? availableFirmpoints : availableHardpoints} available.
          </div>
          {/* Add mount buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {WEAPON_MOUNTS.filter((m) => m.tl <= design.techLevel).map((m) => (
              <button key={m.id} className="terminal-btn" style={{ fontSize: '0.65rem', padding: '3px 8px' }}
                onClick={() => addTurretMount(m.id as MountTypeId)}>
                + {m.name} (TL{m.tl}, MCr{m.cost}, {m.tons}t)
              </button>
            ))}
          </div>

          {/* Installed mounts */}
          {design.weapons.length === 0 && (
            <div className="text-xs" style={{ color: 'var(--text-dimmer)' }}>No mounts installed.</div>
          )}
          <div className="space-y-2">
            {design.weapons.map((inst, mountIdx) => {
              const mount = WEAPON_MOUNTS.find((m) => m.id === inst.mountType)!;
              return (
                <div key={mountIdx} className="p-3 rounded" style={{ background: 'rgba(0,255,0,0.04)', border: '1px solid rgba(0,255,0,0.2)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--primary)' }}>
                      {mount.name} {inst.isFirmpoint ? '(Firmpoint)' : '(Hardpoint)'}
                    </span>
                    <button className="terminal-btn" style={{ fontSize: '0.6rem', padding: '2px 6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      onClick={() => removeTurretMount(mountIdx)}>
                      REMOVE
                    </button>
                  </div>
                  {/* Weapons in this mount */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {inst.weapons.map((wId, wIdx) => {
                      const wd = TURRET_WEAPONS.find((w) => w.id === wId);
                      return (
                        <span key={wIdx} className="text-xs font-mono flex items-center gap-1 px-2 py-0.5 rounded"
                          style={{ background: 'rgba(0,255,0,0.1)', border: '1px solid rgba(0,255,0,0.3)', color: 'var(--primary)' }}>
                          {wd?.name ?? wId}
                          <button style={{ color: 'var(--danger)', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '0.7rem' }}
                            onClick={() => removeWeaponFromMount(mountIdx, wIdx)}>×</button>
                        </span>
                      );
                    })}
                  </div>
                  {/* Add weapon dropdown */}
                  {inst.weapons.length < mount.maxWeapons && (
                    <select className="terminal-input" style={{ fontSize: '0.7rem', padding: '3px 6px' }}
                      value=""
                      onChange={(e) => { if (e.target.value) addWeaponToMount(mountIdx, e.target.value); }}>
                      <option value="">Add weapon...</option>
                      {availableTurrets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} (TL{w.tl}, {w.range}, {w.damage}, {w.power}pwr, MCr{w.cost}{w.traits.length ? ', ' + w.traits.join('/') : ''})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BARBETTES ── */}
        {!isSmallCraft && (
          <div>
            <FieldLabel>Barbettes (5 tons, 1 hardpoint, Damage ×3)</FieldLabel>
            <div className="text-xs mb-2" style={{ color: 'var(--text-dimmer)' }}>Military-grade heavy weapon mounts. One gunner each.</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableBarbettes.map((b) => {
                const inst = design.barbettes.find((x) => x.weaponId === b.id);
                const qty = inst?.quantity ?? 0;
                return (
                  <div key={b.id} className="p-2 rounded flex items-center justify-between"
                    style={{ background: qty > 0 ? 'rgba(0,255,0,0.08)' : 'rgba(0,255,0,0.03)', border: `1px solid ${qty > 0 ? 'var(--primary)' : 'rgba(0,255,0,0.15)'}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-bold truncate" style={{ color: qty > 0 ? 'var(--primary)' : 'var(--text-dim)' }}>{b.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[`TL${b.tl}`, b.range, b.damage, `${b.power}pwr`, `MCr${b.cost}`, ...b.traits].map((t) => statBadge('', t))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      {qty > 0 && <button className="terminal-btn" style={{ fontSize: '0.65rem', padding: '2px 6px' }} onClick={() => removeBarbette(b.id)}>−</button>}
                      <span className="text-xs font-mono w-4 text-center" style={{ color: 'var(--primary)' }}>{qty || ''}</span>
                      <button className="terminal-btn" style={{ fontSize: '0.65rem', padding: '2px 6px' }} onClick={() => addBarbette(b.id)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BAY WEAPONS ── */}
        {!isSmallCraft && design.tonnage >= 500 && (
          <div>
            <FieldLabel>Bay Weapons (Military only)</FieldLabel>
            <div className="text-xs mb-2" style={{ color: 'var(--text-dimmer)' }}>Small (50t, ×10) · Medium (100t, ×20) · Large (500t, 5 hardpoints, ×100)</div>
            {(['small', 'medium', 'large'] as BaySize[]).map((size) => {
              const bays = size === 'small' ? availableSmallBays : size === 'medium' ? availableMediumBays : availableLargeBays;
              const minTonnage = size === 'large' ? 2000 : 500;
              if (design.tonnage < minTonnage) return null;
              return (
                <div key={size} className="mb-3">
                  <div className="text-xs font-mono mb-1 uppercase" style={{ color: 'var(--secondary)' }}>{size} Bays</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {bays.map((b) => {
                      const inst = design.bays.find((x) => x.weaponId === b.id && x.size === size);
                      const qty = inst?.quantity ?? 0;
                      return (
                        <div key={b.id} className="p-2 rounded flex items-center justify-between"
                          style={{ background: qty > 0 ? 'rgba(0,255,0,0.08)' : 'rgba(0,255,0,0.03)', border: `1px solid ${qty > 0 ? 'var(--primary)' : 'rgba(0,255,0,0.15)'}` }}>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-mono font-bold truncate" style={{ color: qty > 0 ? 'var(--primary)' : 'var(--text-dim)' }}>{b.name}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {[`TL${b.tl}`, b.range, b.damage, `${b.power}pwr`, `MCr${b.cost}`, `${b.tons}t`, ...b.traits].map((t, i) => statBadge(`${i}`, t))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            {qty > 0 && <button className="terminal-btn" style={{ fontSize: '0.65rem', padding: '2px 6px' }} onClick={() => removeBay(b.id, size)}>−</button>}
                            <span className="text-xs font-mono w-4 text-center" style={{ color: 'var(--primary)' }}>{qty || ''}</span>
                            <button className="terminal-btn" style={{ fontSize: '0.65rem', padding: '2px 6px' }} onClick={() => addBay(b.id, size)}>+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SPINAL MOUNT ── */}
        {!isSmallCraft && design.tonnage >= 2000 && (
          <div>
            <FieldLabel>Spinal Mount (Damage ×1,000)</FieldLabel>
            <div className="text-xs mb-2" style={{ color: 'var(--text-dimmer)' }}>
              One spinal mount per ship. Tonnage = Base × Multiple. Max half ship tonnage.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {availableSpinal.map((s) => {
                const isSelected = design.spinalMount?.weaponId === s.id;
                return (
                  <div key={s.id} className="p-2 rounded cursor-pointer"
                    style={{ background: isSelected ? 'rgba(0,255,0,0.12)' : 'rgba(0,255,0,0.03)', border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(0,255,0,0.15)'}` }}
                    onClick={() => updateDesign({ spinalMount: isSelected ? undefined : { weaponId: s.id, multiple: 1 } })}>
                    <div className="text-xs font-mono font-bold" style={{ color: isSelected ? 'var(--primary)' : 'var(--text-dim)' }}>
                      {isSelected ? '◉' : '○'} {s.name}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[`TL${s.tl}`, s.range, `Base ${s.baseSizeTons}t`, `+${s.powerPerMultiple}pwr/×`, `MCr${s.costPerMultiple}/×`, ...s.traits].map((t, i) => statBadge(`${i}`, t))}
                    </div>
                  </div>
                );
              })}
            </div>
            {design.spinalMount && (() => {
              const spinal = SPINAL_WEAPONS.find((s) => s.id === design.spinalMount!.weaponId)!;
              const mult = design.spinalMount.multiple;
              const totalTons = calculateSpinalMountTons(spinal, mult);
              const maxMult = Math.floor(spinal.maxSizeTons / spinal.baseSizeTons);
              return (
                <div className="p-3 rounded" style={{ background: 'rgba(0,255,0,0.06)', border: '1px solid rgba(0,255,0,0.3)' }}>
                  <div className="text-xs font-mono font-bold mb-2" style={{ color: 'var(--primary)' }}>
                    {spinal.name} — {mult}× ({totalTons}t of {Math.floor(design.tonnage / 2)}t max)
                  </div>
                  <div className="flex items-center gap-3">
                    <FieldLabel>Multiple (1–{maxMult})</FieldLabel>
                    <input type="number" className="terminal-input" style={{ width: '80px' }}
                      value={mult} min={1} max={maxMult}
                      onChange={(e) => {
                        const v = Math.max(1, Math.min(maxMult, parseInt(e.target.value) || 1));
                        updateDesign({ spinalMount: { ...design.spinalMount!, multiple: v } });
                      }} />
                    <span className="text-xs font-mono" style={{ color: 'var(--text-dimmer)' }}>
                      MCr{(spinal.costPerMultiple * mult).toFixed(0)} | {spinal.powerPerMultiple * mult} pwr
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── POINT DEFENCE ── */}
        {!isSmallCraft && (
          <div>
            <FieldLabel>Point-Defence Batteries (1 hardpoint, 20 tons each)</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availablePD.map((p) => {
                const inst = design.pointDefence.find((x) => x.weaponId === p.id);
                const qty = inst?.quantity ?? 0;
                return (
                  <div key={p.id} className="p-2 rounded flex items-center justify-between"
                    style={{ background: qty > 0 ? 'rgba(0,255,0,0.08)' : 'rgba(0,255,0,0.03)', border: `1px solid ${qty > 0 ? 'var(--primary)' : 'rgba(0,255,0,0.15)'}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-bold truncate" style={{ color: qty > 0 ? 'var(--primary)' : 'var(--text-dim)' }}>
                        {p.name}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[`TL${p.tl}`, `Intercept ${p.intercept}`, `${p.power}pwr`, `MCr${p.cost}`, p.pdType === 'gauss' ? 'Gauss' : 'Laser'].map((t, i) => statBadge(`${i}`, t))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      {qty > 0 && <button className="terminal-btn" style={{ fontSize: '0.65rem', padding: '2px 6px' }} onClick={() => removePD(p.id)}>−</button>}
                      <span className="text-xs font-mono w-4 text-center" style={{ color: 'var(--primary)' }}>{qty || ''}</span>
                      <button className="terminal-btn" style={{ fontSize: '0.65rem', padding: '2px 6px' }} onClick={() => addPD(p.id)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SCREENS ── */}
        <div>
          <FieldLabel>Defensive Screens</FieldLabel>
          <div className="grid grid-cols-1 gap-2">
            {availableScreens.map((s) => {
              const inst = design.screens.find((x) => x.screenId === s.id);
              const qty = inst?.quantity ?? 0;
              return (
                <div key={s.id} className="p-3 rounded flex items-start justify-between gap-3"
                  style={{ background: qty > 0 ? 'rgba(0,255,0,0.08)' : 'rgba(0,255,0,0.03)', border: `1px solid ${qty > 0 ? 'var(--primary)' : 'rgba(0,255,0,0.15)'}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-bold" style={{ color: qty > 0 ? 'var(--primary)' : 'var(--text-dim)' }}>{s.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1 mb-1">
                      {[`TL${s.tl}`, `${s.tons}t`, `${s.power}pwr`, `MCr${s.cost}`].map((t, i) => statBadge(`${i}`, t))}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-dimmer)' }}>{s.effect}</div>
                    {s.notes && <div className="text-xs mt-1 italic" style={{ color: 'var(--text-dimmer)', opacity: 0.7 }}>{s.notes}</div>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {qty > 0 && <button className="terminal-btn" style={{ fontSize: '0.65rem', padding: '2px 6px' }} onClick={() => removeScreen(s.id)}>−</button>}
                    <span className="text-xs font-mono w-4 text-center" style={{ color: 'var(--primary)' }}>{qty || ''}</span>
                    <button className="terminal-btn" style={{ fontSize: '0.65rem', padding: '2px 6px' }} onClick={() => addScreen(s.id)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStep11_Quarters = () => {
    const recommendedCommon = Math.floor(
      (design.standardStaterooms * 4 + design.highStaterooms * 6 + design.luxuryStaterooms * 10) * 0.25
    );

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={11} title="QUARTERS & CREW" subtitle="Staterooms, low berths, and common areas" />

        {/* Staterooms */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATEROOM_TYPES.map((st) => {
            const field = st.id === 'standard' ? 'standardStaterooms'
              : st.id === 'high' ? 'highStaterooms'
              : 'luxuryStaterooms';
            return (
              <div key={st.id}>
                <FieldLabel>{st.name} ({st.tons}t, MCr{st.cost})</FieldLabel>
                <input
                  type="number"
                  className="terminal-input"
                  value={design[field]}
                  min={0}
                  onChange={(e) => updateDesign({ [field]: Math.max(0, parseInt(e.target.value) || 0) })}
                />
                <div className="text-xs mt-1" style={{ color: 'var(--text-dimmer)' }}>{st.description}</div>
              </div>
            );
          })}
        </div>

        {/* Low Berths */}
        <div>
          <FieldLabel>Low Berths (0.5t, Cr50,000 each)</FieldLabel>
          <input
            type="number"
            className="terminal-input"
            style={{ width: '120px' }}
            value={design.lowBerths}
            min={0}
            onChange={(e) => updateDesign({ lowBerths: Math.max(0, parseInt(e.target.value) || 0) })}
          />
        </div>

        {/* Common Areas */}
        <div>
          <FieldLabel>Common Areas (MCr0.1/ton)</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="terminal-input"
              style={{ width: '120px' }}
              value={design.commonAreaTons}
              min={0}
              onChange={(e) => updateDesign({ commonAreaTons: Math.max(0, parseInt(e.target.value) || 0) })}
            />
            <button
              className="terminal-btn"
              onClick={() => updateDesign({ commonAreaTons: recommendedCommon })}
              style={{ fontSize: '0.65rem', padding: '8px 12px' }}
            >
              RECOMMENDED ({recommendedCommon}t)
            </button>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-dimmer)' }}>
            Recommended: 25% of stateroom tonnage. Mess, canteen, recreation areas.
          </div>
        </div>

        <StatBox label="Accommodation Summary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Stateroom Tons" value={`${calc.stateroomTons}t`} />
            <MiniStat label="Low Berth Tons" value={`${calc.lowBerthTons}t`} />
            <MiniStat label="Common Area" value={`${design.commonAreaTons}t`} />
            <MiniStat label="Crew Needed" value={String(calc.totalCrew)} color="var(--secondary)" />
          </div>
        </StatBox>
      </div>
    );
  };

  const renderStep12_Finalise = () => {
    const costMCr = calc.totalCost / 1_000_000;
    const buildDays = constructionTimeDays(calc.totalCost);

    return (
      <div className="space-y-6 fade-in">
        <SectionHeader step={12} title="FINALISE DESIGN" subtitle="Allocate cargo and review ship specifications" />

        {/* Cargo */}
        <div>
          <FieldLabel>Cargo Space</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="terminal-input flex-1"
              value={design.cargoTons}
              min={0}
              onChange={(e) => updateDesign({ cargoTons: Math.max(0, parseInt(e.target.value) || 0) })}
            />
            <button
              className="terminal-btn"
              onClick={() => {
                const remaining = design.tonnage - (calc.totalTonnageUsed - design.cargoTons);
                updateDesign({ cargoTons: Math.max(0, remaining) });
              }}
              style={{ fontSize: '0.65rem', padding: '8px 12px' }}
            >
              FILL REMAINING ({Math.max(0, design.tonnage - (calc.totalTonnageUsed - design.cargoTons))}t)
            </button>
          </div>
        </div>

        {/* Ship Designation */}
        <div>
          <FieldLabel>Ship Designation (optional)</FieldLabel>
          <input
            className="terminal-input"
            value={design.designation ?? ''}
            onChange={(e) => updateDesign({ designation: e.target.value || undefined })}
            placeholder="e.g. Type-S, Type-A..."
          />
        </div>

        {/* Complete Summary */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">DESIGN SPECIFICATION</span>
            <span className="panel-status">{design.name}{design.designation ? ` (${design.designation})` : ''}</span>
          </div>
          <div className="panel-content">
            <div className="space-y-3 text-xs font-mono">
              {/* Tonnage breakdown */}
              <div>
                <div className="mb-1 font-bold" style={{ color: 'var(--primary)', fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', letterSpacing: '2px' }}>
                  TONNAGE ALLOCATION
                </div>
                {[
                  ['Hull & Armour', calc.hullArmorTons],
                  ['M-Drive', calc.manoeuvreDriveTons],
                  ['J-Drive', calc.jumpDriveTons],
                  ['Power Plant', calc.powerPlantTons],
                  ['Fuel', calc.fuelTons],
                  ['Bridge', calc.bridgeTons],
                  ['Sensors', calc.sensorTons + calc.sensorStationTons],
                  ['Staterooms', calc.stateroomTons],
                  ['Low Berths', calc.lowBerthTons],
                  ['Common Areas', calc.commonAreaTons],
                  ['Cargo', calc.cargoTons],
                ].filter(([_, v]) => (v as number) > 0).map(([label, tons]) => (
                  <div key={label as string} className="flex justify-between" style={{ color: 'var(--text-dim)' }}>
                    <span>{label}</span>
                    <span>{tons}t</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 mt-1" style={{ borderTop: '1px solid rgba(0,255,0,0.3)', color: 'var(--primary)' }}>
                  <span className="font-bold">TOTAL</span>
                  <span className="font-bold">{calc.totalTonnageUsed}t / {design.tonnage}t</span>
                </div>
              </div>

              {/* Cost breakdown */}
              <div>
                <div className="mb-1 font-bold" style={{ color: 'var(--secondary)', fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', letterSpacing: '2px' }}>
                  COST BREAKDOWN
                </div>
                {[
                  ['Hull', calc.hullCost],
                  ['Armour', calc.armorCost],
                  ['M-Drive', calc.manoeuvreDriveCost],
                  ['J-Drive', calc.jumpDriveCost],
                  ['Power Plant', calc.powerPlantCost],
                  ['Bridge', calc.bridgeCost],
                  ['Computer', calc.computerCost],
                  ['Sensors', calc.sensorCost + calc.sensorStationCost],
                  ['Weapons', calc.weaponsCost],
                  ['Equipment', calc.equipmentCost],
                  ['Staterooms', calc.stateroomCost],
                  ['Low Berths', calc.lowBerthCost],
                  ['Common Areas', calc.commonAreaCost],
                ].filter(([_, v]) => (v as number) > 0).map(([label, cost]) => (
                  <div key={label as string} className="flex justify-between" style={{ color: 'var(--text-dim)' }}>
                    <span>{label}</span>
                    <span>{formatCredits(cost as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 mt-1" style={{ borderTop: '1px solid rgba(0,204,255,0.3)', color: 'var(--secondary)' }}>
                  <span className="font-bold">TOTAL</span>
                  <span className="font-bold">MCr{costMCr.toFixed(2)}</span>
                </div>
              </div>

              {/* Operations */}
              <div>
                <div className="mb-1 font-bold" style={{ color: 'var(--warning)', fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', letterSpacing: '2px' }}>
                  OPERATIONS
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-dim)' }}>
                  <span>Monthly Maintenance</span>
                  <span>{formatCredits(calc.maintenanceCostPerMonth)}</span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-dim)' }}>
                  <span>Monthly Salaries</span>
                  <span>{formatCredits(calc.monthlySalaries)}</span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-dim)' }}>
                  <span>Construction Time</span>
                  <span>{buildDays} days</span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-dim)' }}>
                  <span>Total Crew</span>
                  <span>{calc.totalCrew}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation */}
        {!calc.isValid && (
          <div className="p-3 rounded" style={{ background: 'rgba(255,51,68,0.1)', border: '1px solid rgba(255,51,68,0.3)' }}>
            <div className="font-mono text-sm font-bold mb-1" style={{ color: 'var(--danger)' }}>DESIGN ERRORS</div>
            {calc.validationErrors.map((err, i) => (
              <div key={i} className="text-xs font-mono" style={{ color: 'var(--danger)' }}>{err}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1_Hull();
      case 2: return renderStep2_Specialisation();
      case 3: return renderStep3_Armour();
      case 4: return renderStep4_Drives();
      case 5: return renderStep5_PowerPlant();
      case 6: return renderStep6_Fuel();
      case 7: return renderStep7_Bridge();
      case 8: return renderStep8_Computer();
      case 9: return renderStep9_Sensors();
      case 10: return renderStep10_Weapons();
      case 11: return renderStep11_Quarters();
      case 12: return renderStep12_Finalise();
      default: return null;
    }
  };

  return (
    <div className="interface-container">
      <header className="interface-header">
        <div>
          <h2 className="interface-title">SHIP CONSTRUCTION</h2>
          <p className="interface-subtitle">High Guard Naval Architecture System</p>
        </div>
        <button className="terminal-btn warning" onClick={onCancel} style={{ fontSize: '0.65rem' }}>
          CANCEL
        </button>
      </header>

      <div className="interface-content">
        {/* Step Progress */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-1">
            {STEP_LABELS.map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = step === stepNum;
              const isComplete = step > stepNum;
              return (
                <button
                  key={idx}
                  className="text-xs font-mono px-2 py-1 rounded transition-all cursor-pointer"
                  style={{
                    background: isActive
                      ? 'rgba(0,255,0,0.2)'
                      : isComplete
                      ? 'rgba(0,255,0,0.08)'
                      : 'transparent',
                    border: `1px solid ${isActive ? 'var(--primary)' : isComplete ? 'rgba(0,255,0,0.3)' : 'rgba(0,255,0,0.15)'}`,
                    color: isActive
                      ? 'var(--primary)'
                      : isComplete
                      ? 'var(--text-dim)'
                      : 'var(--text-dimmer)',
                    boxShadow: isActive ? '0 0 10px rgba(0,255,0,0.3)' : 'none',
                  }}
                  onClick={() => setStep(stepNum)}
                >
                  {isComplete ? '\u2713' : stepNum}. {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content area with sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <div>{renderCurrentStep()}</div>
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>

        {/* Mobile sidebar (collapsible) */}
        <div className="lg:hidden mt-4">
          <Sidebar />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 pt-4" style={{ borderTop: '1px solid rgba(0,255,0,0.2)' }}>
          <button
            className="terminal-btn"
            onClick={prevStep}
            disabled={step === 1}
            style={{ opacity: step === 1 ? 0.3 : 1 }}
          >
            PREV
          </button>

          <span className="text-xs font-mono" style={{ color: 'var(--text-dimmer)' }}>
            STEP {step} OF {TOTAL_STEPS}
          </span>

          {step < TOTAL_STEPS ? (
            <button className="terminal-btn primary" onClick={nextStep}>
              NEXT
            </button>
          ) : (
            <button
              className="terminal-btn secondary"
              onClick={handleFinalise}
            >
              DEPLOY SHIP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  REUSABLE SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function SectionHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
          style={{
            background: 'rgba(0,255,0,0.15)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            fontFamily: 'Orbitron, sans-serif',
          }}
        >
          {step}
        </div>
        <div>
          <h3 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '3px',
            color: 'var(--primary)',
          }}>
            {title}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-dimmer)', letterSpacing: '1px' }}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-mono mb-1" style={{
      color: 'var(--text-dim)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    }}>
      {children}
    </label>
  );
}

function ConfigOption({
  selected,
  onClick,
  label,
  detail,
  badges = [],
  examples,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  detail: string;
  badges?: string[];
  examples?: string;
}) {
  return (
    <div
      className="p-3 rounded cursor-pointer transition-all"
      style={{
        background: selected ? 'rgba(0,255,0,0.12)' : 'rgba(0,255,0,0.03)',
        border: `1px solid ${selected ? 'var(--primary)' : 'rgba(0,255,0,0.2)'}`,
        boxShadow: selected ? '0 0 10px rgba(0,255,0,0.2)' : 'none',
      }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-mono text-sm font-bold" style={{ color: selected ? 'var(--primary)' : 'var(--text-dim)' }}>
            {selected ? '\u25C9' : '\u25CB'} {label}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-dimmer)' }}>{detail}</div>
          {examples && (
            <div className="text-xs mt-1 italic" style={{ color: 'var(--text-dimmer)', opacity: 0.7 }}>
              Examples: {examples}
            </div>
          )}
        </div>
      </div>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {badges.map((badge, i) => (
            <span key={i} className="terminal-badge" style={{ fontSize: '0.6rem' }}>{badge}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded" style={{ background: 'rgba(0,255,0,0.04)', border: '1px solid rgba(0,255,0,0.2)' }}>
      <div className="text-xs font-mono mb-2" style={{
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.65rem',
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-xs" style={{ color: 'var(--text-dimmer)' }}>{label}</div>
      <div className="font-mono font-bold" style={{ color: color || 'var(--primary)', fontSize: '0.85rem' }}>
        {value}
      </div>
    </div>
  );
}
