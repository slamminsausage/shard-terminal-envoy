import { Button } from '@/components/ui/button';
import { useBridge } from '@/contexts/BridgeContext';
import type { Contact } from '@/lib/bridge/bridgeTypes';
import { CombatPhaseHeader } from './CombatPhaseHeader';
import { InitiativeList } from './InitiativeList';
import { SetupPanel } from './SetupPanel';
import { ManeuverPanel } from './ManeuverPanel';
import { AttackPanel } from './AttackPanel';
import { ActionsPanel } from './ActionsPanel';
import { CombatLog } from './CombatLog';
import { Zap, X, AlertTriangle } from 'lucide-react';

interface CombatSidebarProps {
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  onAddShipClick: () => void;
  onAttackFired?: (attackerId: string, targetId: string) => void;
}

export function CombatSidebar({ selectedContact, onSelectContact, onAddShipClick, onAttackFired }: CombatSidebarProps) {
  const { contacts, combat } = useBridge();

  const {
    isActive,
    currentRound,
    phase,
    combatLog,
    combatants,
    attackPlans,
    repairPlans,
    sensorPlans,
    dogfightPlans,
    dockingPlans,
    sensorLocks,
    missileSalvos,
    boardingPressure,
    gunnerAssist,
    dogfightAttackModifiers,
    startCombat,
    endCombat,
    addToCombat,
    removeFromCombat,
    rollInitiative,
    updateShipManeuver,
    applyManeuverStep,
    advancePhase,
    resolveAttack,
    resolveDogfight,
    attemptDockOrBoard,
    attemptRepelBoarders,
    attemptJump,
    attemptSensorLock,
    attemptBreakSensorLock,
    attemptImproveInitiative,
    attemptAidGunners,
    attemptOverloadDrive,
    attemptOverloadPlant,
    resetOverloadPenalties,
    attemptRepair,
    attemptPointDefense,
    attemptMissileEW,
    updateAttackPlan,
    updateRepairPlan,
    updateSensorPlan,
    updateDogfightPlan,
    updateDockingPlan,
  } = combat;

  const playerShip = contacts.find(c => c.isPlayerShip);

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <AlertTriangle className="h-8 w-8 text-terminal-warning-alt" />
        <p className="text-terminal-primary text-sm text-center font-['Orbitron'] tracking-wider">
          COMBAT MODE
        </p>
        <p className="text-terminal-text-dimmer text-xs text-center">
          Initiate ship combat to use the tactical combat system. Add ships to the grid, roll initiative, and manage combat phases.
        </p>
        <Button
          onClick={startCombat}
          className="bg-terminal-warning-alt/20 text-terminal-warning-alt border border-terminal-warning-alt/50 hover:bg-terminal-warning-alt/30"
        >
          <Zap className="h-4 w-4 mr-2" /> ENGAGE COMBAT
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-terminal-bg-border bg-terminal-primary-light/5">
        <CombatPhaseHeader currentRound={currentRound} phase={phase} />
      </div>

      {/* Initiative list */}
      <div className="p-3 border-b border-terminal-bg-border">
        <span className="text-[0.6rem] text-terminal-text-dimmer tracking-wider">INITIATIVE ORDER</span>
        <div className="mt-1">
          <InitiativeList
            combatants={combatants}
            playerShip={playerShip}
            selectedContactId={selectedContact?.id ?? null}
            onSelectContact={onSelectContact}
            sensorLocks={sensorLocks}
            boardingPressure={boardingPressure}
          />
        </div>
      </div>

      {/* Phase-specific panel */}
      <div className="flex-1 overflow-y-auto p-3">
        {phase === 'setup' && (
          <SetupPanel
            combatants={combatants}
            contacts={contacts}
            onAddShipClick={onAddShipClick}
            onAddToCombat={addToCombat}
            onRemoveFromCombat={removeFromCombat}
            onRollInitiative={rollInitiative}
            onToggleSurprised={(id, val) => updateContactFields(id, { surprised: val })}
          />
        )}

        {phase === 'maneuver' && (
          <ManeuverPanel
            combatants={combatants}
            onUpdateManeuver={updateShipManeuver}
            onApplyManeuver={applyManeuverStep}
          />
        )}

        {phase === 'attack' && (
          <AttackPanel
            combatants={combatants}
            attackPlans={attackPlans}
            sensorLocks={sensorLocks}
            gunnerAssist={gunnerAssist}
            dogfightAttackModifiers={dogfightAttackModifiers}
            onUpdateAttackPlan={updateAttackPlan}
            onResolveAttack={(attackerId) => {
              const targetId = attackPlans[attackerId]?.targetId;
              if (onAttackFired && targetId) onAttackFired(attackerId, targetId);
              resolveAttack(attackerId);
            }}
          />
        )}

        {phase === 'actions' && (
          <ActionsPanel
            combatants={combatants}
            repairPlans={repairPlans}
            sensorPlans={sensorPlans}
            dogfightPlans={dogfightPlans}
            dockingPlans={dockingPlans}
            sensorLocks={sensorLocks}
            missileSalvos={missileSalvos}
            boardingPressure={boardingPressure}
            onAttemptRepair={attemptRepair}
            onAttemptSensorLock={attemptSensorLock}
            onAttemptBreakSensorLock={attemptBreakSensorLock}
            onResolveDogfight={resolveDogfight}
            onAttemptDockOrBoard={attemptDockOrBoard}
            onAttemptRepelBoarders={attemptRepelBoarders}
            onAttemptJump={attemptJump}
            onAttemptImproveInitiative={attemptImproveInitiative}
            onAttemptAidGunners={attemptAidGunners}
            onAttemptOverloadDrive={attemptOverloadDrive}
            onAttemptOverloadPlant={attemptOverloadPlant}
            onResetOverloadPenalties={resetOverloadPenalties}
            onAttemptPointDefense={attemptPointDefense}
            onAttemptMissileEW={attemptMissileEW}
            onUpdateRepairPlan={updateRepairPlan}
            onUpdateSensorPlan={updateSensorPlan}
            onUpdateDogfightPlan={updateDogfightPlan}
            onUpdateDockingPlan={updateDockingPlan}
          />
        )}

        {phase === 'end' && (
          <div className="text-center py-4 space-y-2">
            <p className="text-terminal-primary text-xs">Round {currentRound} complete.</p>
            <p className="text-terminal-text-dimmer text-[0.6rem]">Advance to start the next round.</p>
          </div>
        )}
      </div>

      {/* Combat log */}
      <div className="border-t border-terminal-bg-border p-3">
        <span className="text-[0.6rem] text-terminal-text-dimmer tracking-wider">COMBAT LOG</span>
        <div className="mt-1">
          <CombatLog log={combatLog} />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="p-3 border-t border-terminal-bg-border flex gap-2">
        <Button
          onClick={endCombat}
          size="sm"
          variant="outline"
          className="border-terminal-danger-alt/50 text-terminal-danger-alt hover:bg-terminal-danger-alt/10 text-xs"
        >
          <X className="h-3 w-3 mr-1" /> End Combat
        </Button>
        <Button
          onClick={advancePhase}
          disabled={combatants.length === 0 || phase === 'setup'}
          size="sm"
          className="flex-1 bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30 text-xs"
        >
          <Zap className="h-3 w-3 mr-1" /> Advance Phase
        </Button>
      </div>
    </div>
  );
}
