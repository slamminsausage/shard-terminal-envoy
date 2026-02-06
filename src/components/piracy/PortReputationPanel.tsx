import React, { useState } from 'react';
import { usePiracy } from '@/contexts/PiracyContext';
import { PortAttitude } from '@/types/piracy';
import { PORT_ATTITUDE_CONFIG, PORT_ATTITUDE_ORDER } from '@/lib/piracy/tables';
import { Anchor, Plus, Trash2, Edit2, Check, X, ChevronDown } from 'lucide-react';

const ATTITUDE_COLORS: Record<PortAttitude, string> = {
  haven: 'text-green-400',
  friendly: 'text-emerald-400',
  tolerant: 'text-yellow-400',
  neutral: 'text-gray-400',
  suspicious: 'text-orange-400',
  unfriendly: 'text-red-400',
  hostile: 'text-red-600',
};

export const PortReputationPanel: React.FC = () => {
  const { ports, addPort, updatePort, deletePort, setPortAttitude } = usePiracy();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newPort, setNewPort] = useState({ name: '', attitude: 'neutral' as PortAttitude, notes: '', law_level: '', starport_class: '', world_uwp: '' });

  const handleAdd = () => {
    if (!newPort.name.trim()) return;
    addPort({
      name: newPort.name.trim(),
      attitude: newPort.attitude,
      notes: newPort.notes || undefined,
      law_level: newPort.law_level ? parseInt(newPort.law_level) : undefined,
      starport_class: newPort.starport_class || undefined,
      world_uwp: newPort.world_uwp || undefined,
    });
    setNewPort({ name: '', attitude: 'neutral', notes: '', law_level: '', starport_class: '', world_uwp: '' });
    setShowAddForm(false);
  };

  const renderAttitudeStats = (attitude: PortAttitude) => {
    const config = PORT_ATTITUDE_CONFIG[attitude];
    return (
      <div className="grid grid-cols-5 gap-2 text-xs mt-2">
        <div className="terminal-stat text-center">
          <div className="text-terminal-primary font-bold">{config.fencePercent}%</div>
          <div className="text-terminal-text-dimmer">Fence</div>
        </div>
        <div className="terminal-stat text-center">
          <div className="text-terminal-primary font-bold">{config.recruitmentTarget ?? '--'}</div>
          <div className="text-terminal-text-dimmer">Recruit</div>
        </div>
        <div className="terminal-stat text-center">
          <div className={`font-bold ${config.arrestRiskTarget && config.arrestRiskTarget <= 6 ? 'text-red-400' : 'text-terminal-primary'}`}>
            {config.arrestRiskTarget ? `${config.arrestRiskTarget}+` : '--'}
          </div>
          <div className="text-terminal-text-dimmer">Arrest</div>
        </div>
        <div className="terminal-stat text-center">
          <div className="text-terminal-primary font-bold">{config.spyRiskTarget ? `${config.spyRiskTarget}+` : '--'}</div>
          <div className="text-terminal-text-dimmer">Spies</div>
        </div>
        <div className="terminal-stat text-center">
          <div className="text-terminal-primary font-bold">{config.protectionTarget ? `${config.protectionTarget}+` : '--'}</div>
          <div className="text-terminal-text-dimmer">Protect</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-terminal-primary flex items-center gap-2">
          <Anchor className="h-5 w-5" />
          PORT REPUTATION DATABASE
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="terminal-btn primary text-xs flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add Port
        </button>
      </div>

      {showAddForm && (
        <div className="terminal-card p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Port name"
              value={newPort.name}
              onChange={e => setNewPort(p => ({ ...p, name: e.target.value }))}
              className="terminal-input text-sm"
            />
            <select
              value={newPort.attitude}
              onChange={e => setNewPort(p => ({ ...p, attitude: e.target.value as PortAttitude }))}
              className="terminal-input text-sm"
            >
              {PORT_ATTITUDE_ORDER.map(att => (
                <option key={att} value={att}>{PORT_ATTITUDE_CONFIG[att].label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="UWP (e.g. A434934-F)"
              value={newPort.world_uwp}
              onChange={e => setNewPort(p => ({ ...p, world_uwp: e.target.value }))}
              className="terminal-input text-sm"
            />
            <input
              type="text"
              placeholder="Starport (A-E)"
              value={newPort.starport_class}
              onChange={e => setNewPort(p => ({ ...p, starport_class: e.target.value }))}
              className="terminal-input text-sm"
              maxLength={1}
            />
            <input
              type="number"
              placeholder="Law Level"
              value={newPort.law_level}
              onChange={e => setNewPort(p => ({ ...p, law_level: e.target.value }))}
              className="terminal-input text-sm"
              min={0}
              max={15}
            />
          </div>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={newPort.notes}
            onChange={e => setNewPort(p => ({ ...p, notes: e.target.value }))}
            className="terminal-input text-sm w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="terminal-btn primary text-xs flex items-center gap-1">
              <Check className="h-3 w-3" /> Confirm
            </button>
            <button onClick={() => setShowAddForm(false)} className="terminal-btn text-xs flex items-center gap-1">
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {ports.map(port => (
          <div key={port.id} className="terminal-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExpandedId(expandedId === port.id ? null : port.id)}
                  className="text-terminal-text-dimmer hover:text-terminal-primary transition-colors"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === port.id ? 'rotate-180' : ''}`} />
                </button>
                <div>
                  <span className="font-bold text-terminal-primary">{port.name}</span>
                  {port.world_uwp && <span className="text-xs text-terminal-text-dimmer ml-2">[{port.world_uwp}]</span>}
                  {port.starport_class && <span className="text-xs text-terminal-text-dimmer ml-1">Class {port.starport_class}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={port.attitude}
                  onChange={e => setPortAttitude(port.id, e.target.value as PortAttitude)}
                  className={`terminal-input text-xs font-bold ${ATTITUDE_COLORS[port.attitude]} bg-transparent border-terminal-border`}
                >
                  {PORT_ATTITUDE_ORDER.map(att => (
                    <option key={att} value={att}>{PORT_ATTITUDE_CONFIG[att].label}</option>
                  ))}
                </select>
                <button
                  onClick={() => deletePort(port.id)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {port.notes && (
              <p className="text-xs text-terminal-text-dimmer mt-1 ml-7">{port.notes}</p>
            )}

            {expandedId === port.id && renderAttitudeStats(port.attitude)}
          </div>
        ))}

        {ports.length === 0 && (
          <div className="text-center text-terminal-text-dimmer py-8">
            <Anchor className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No ports registered. Add your first port to begin tracking reputation.</p>
          </div>
        )}
      </div>
    </div>
  );
};
