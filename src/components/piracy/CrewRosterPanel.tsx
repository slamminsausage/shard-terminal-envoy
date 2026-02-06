import React, { useState } from 'react';
import { usePiracy } from '@/contexts/PiracyContext';
import { CrewPosition, CrewSkillLevel } from '@/types/piracy';
import { CREW_POSITION_CONFIG, CREW_SKILL_LEVEL_CONFIG } from '@/lib/piracy/tables';
import { generateCrewName, generateCrewQuirk, generateRandomPosition, generateRandomSkillLevel, getBaseSalary } from '@/lib/piracy/generators';
import { Users, Plus, Trash2, Dice1, UserPlus, ChevronDown } from 'lucide-react';

const SKILL_COLORS: Record<CrewSkillLevel, string> = {
  green: 'text-gray-400',
  average: 'text-terminal-primary',
  good: 'text-yellow-400',
  excellent: 'text-cyan-400',
  legendary: 'text-purple-400',
};

export const CrewRosterPanel: React.FC = () => {
  const { crew, addCrew, updateCrew, deleteCrew, getTotalMonthlySalary, getTotalShares } = usePiracy();
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newCrew, setNewCrew] = useState({
    name: '',
    position: 'marine' as CrewPosition,
    skill_level: 'green' as CrewSkillLevel,
    shares: 1,
    is_pc: false,
    quirk: '',
    notes: '',
  });

  const handleAdd = () => {
    if (!newCrew.name.trim()) return;
    addCrew({
      name: newCrew.name.trim(),
      position: newCrew.position,
      skill_level: newCrew.skill_level,
      base_salary: getBaseSalary(newCrew.position),
      shares: newCrew.shares,
      is_pc: newCrew.is_pc,
      quirk: newCrew.quirk || undefined,
      notes: newCrew.notes || undefined,
    });
    setNewCrew({ name: '', position: 'marine', skill_level: 'green', shares: 1, is_pc: false, quirk: '', notes: '' });
    setShowAddForm(false);
  };

  const handleRandomize = () => {
    const pos = generateRandomPosition();
    setNewCrew(prev => ({
      ...prev,
      name: generateCrewName(),
      position: pos,
      skill_level: generateRandomSkillLevel(),
      quirk: generateCrewQuirk(),
      is_pc: false,
      shares: 1,
    }));
  };

  const activeCrew = crew.filter(c => c.is_active);
  const inactiveCrew = crew.filter(c => !c.is_active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-terminal-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          CREW ROSTER
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="terminal-btn primary text-xs flex items-center gap-1"
          >
            <UserPlus className="h-3 w-3" /> Recruit
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="terminal-stat text-center">
          <div className="text-terminal-primary font-bold text-lg">{activeCrew.length}</div>
          <div className="text-terminal-text-dimmer text-xs">Active Crew</div>
        </div>
        <div className="terminal-stat text-center">
          <div className="text-terminal-primary font-bold text-lg">{getTotalShares()}</div>
          <div className="text-terminal-text-dimmer text-xs">Total Shares</div>
        </div>
        <div className="terminal-stat text-center">
          <div className="text-yellow-400 font-bold text-lg">Cr{getTotalMonthlySalary().toLocaleString()}</div>
          <div className="text-terminal-text-dimmer text-xs">Monthly Salary</div>
        </div>
      </div>

      {showAddForm && (
        <div className="terminal-card p-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-terminal-primary">NEW RECRUIT</span>
            <button onClick={handleRandomize} className="terminal-btn text-xs flex items-center gap-1">
              <Dice1 className="h-3 w-3" /> Randomize
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Crewman name"
              value={newCrew.name}
              onChange={e => setNewCrew(p => ({ ...p, name: e.target.value }))}
              className="terminal-input text-sm"
            />
            <select
              value={newCrew.position}
              onChange={e => setNewCrew(p => ({ ...p, position: e.target.value as CrewPosition }))}
              className="terminal-input text-sm"
            >
              {(Object.keys(CREW_POSITION_CONFIG) as CrewPosition[]).map(pos => (
                <option key={pos} value={pos}>{CREW_POSITION_CONFIG[pos].label} (Cr{CREW_POSITION_CONFIG[pos].baseSalary.toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newCrew.skill_level}
              onChange={e => setNewCrew(p => ({ ...p, skill_level: e.target.value as CrewSkillLevel }))}
              className="terminal-input text-sm"
            >
              {(Object.keys(CREW_SKILL_LEVEL_CONFIG) as CrewSkillLevel[]).map(level => (
                <option key={level} value={level}>
                  {CREW_SKILL_LEVEL_CONFIG[level].label} (DM+{CREW_SKILL_LEVEL_CONFIG[level].keySkillDM})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Shares"
              value={newCrew.shares}
              onChange={e => setNewCrew(p => ({ ...p, shares: parseInt(e.target.value) || 1 }))}
              className="terminal-input text-sm"
              min={1}
              max={10}
            />
            <label className="flex items-center gap-2 text-sm text-terminal-primary">
              <input
                type="checkbox"
                checked={newCrew.is_pc}
                onChange={e => setNewCrew(p => ({ ...p, is_pc: e.target.checked }))}
                className="accent-green-500"
              />
              PC/Story NPC
            </label>
          </div>
          <input
            type="text"
            placeholder="Quirk (optional)"
            value={newCrew.quirk}
            onChange={e => setNewCrew(p => ({ ...p, quirk: e.target.value }))}
            className="terminal-input text-sm w-full"
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={newCrew.notes}
            onChange={e => setNewCrew(p => ({ ...p, notes: e.target.value }))}
            className="terminal-input text-sm w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="terminal-btn primary text-xs">Confirm Recruitment</button>
            <button onClick={() => setShowAddForm(false)} className="terminal-btn text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Active Crew */}
      <div className="space-y-2">
        {activeCrew.map(member => (
          <div key={member.id} className="terminal-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                  className="text-terminal-text-dimmer hover:text-terminal-primary transition-colors"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === member.id ? 'rotate-180' : ''}`} />
                </button>
                <div>
                  <span className="font-bold text-terminal-primary">{member.name}</span>
                  {member.is_pc && <span className="terminal-badge ml-2 text-cyan-400 border-cyan-400">PC</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-terminal-text-dimmer">{CREW_POSITION_CONFIG[member.position].label}</span>
                <span className={`font-bold ${SKILL_COLORS[member.skill_level]}`}>
                  {CREW_SKILL_LEVEL_CONFIG[member.skill_level].label}
                </span>
                <span className="text-yellow-400">{member.shares} share{member.shares !== 1 ? 's' : ''}</span>
                {!member.is_pc && (
                  <button
                    onClick={() => deleteCrew(member.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {expandedId === member.id && (
              <div className="mt-2 ml-7 space-y-1 text-xs">
                <div className="text-terminal-text-dimmer">
                  Key Skills: {CREW_POSITION_CONFIG[member.position].keySkills} (DM+{CREW_SKILL_LEVEL_CONFIG[member.skill_level].keySkillDM})
                </div>
                <div className="text-terminal-text-dimmer">
                  Other Skills: DM{CREW_SKILL_LEVEL_CONFIG[member.skill_level].otherSkillDM >= 0 ? '+' : ''}{CREW_SKILL_LEVEL_CONFIG[member.skill_level].otherSkillDM}
                </div>
                <div className="text-yellow-400">
                  Monthly Salary: Cr{member.base_salary.toLocaleString()}
                </div>
                {member.quirk && <div className="text-orange-400">Quirk: {member.quirk}</div>}
                {member.notes && <div className="text-terminal-text-dimmer">{member.notes}</div>}

                <div className="flex gap-2 mt-2">
                  <select
                    value={member.skill_level}
                    onChange={e => updateCrew(member.id, { skill_level: e.target.value as CrewSkillLevel })}
                    className="terminal-input text-xs"
                  >
                    {(Object.keys(CREW_SKILL_LEVEL_CONFIG) as CrewSkillLevel[]).map(level => (
                      <option key={level} value={level}>{CREW_SKILL_LEVEL_CONFIG[level].label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => updateCrew(member.id, { is_active: false })}
                    className="terminal-btn text-xs text-red-400"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {activeCrew.length === 0 && (
          <div className="text-center text-terminal-text-dimmer py-8">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No crew on the roster. Recruit your first crewman.</p>
          </div>
        )}
      </div>

      {/* Inactive Crew */}
      {inactiveCrew.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-bold text-terminal-text-dimmer mb-2">FORMER CREW ({inactiveCrew.length})</h4>
          <div className="space-y-1">
            {inactiveCrew.map(member => (
              <div key={member.id} className="terminal-card p-2 opacity-50 flex items-center justify-between">
                <span className="text-sm">{member.name} - {CREW_POSITION_CONFIG[member.position].label}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateCrew(member.id, { is_active: true })}
                    className="terminal-btn text-xs"
                  >
                    Reinstate
                  </button>
                  <button
                    onClick={() => deleteCrew(member.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
