import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCampaign } from '@/contexts/CampaignContext';
import { dbHelpers } from '@/lib/supabase';
import { Player } from '@/types/database';
import { UserPlus, Trash2, RefreshCw, Copy, Shield, User, ArrowRightLeft } from 'lucide-react';

// Generate a random access code like "ALPHA-7X3K"
function generateAccessCode(): string {
  const prefixes = ['ALPHA', 'BRAVO', 'DELTA', 'ECHO', 'GAMMA', 'KILO', 'SIGMA', 'ZETA', 'NOVA', 'VIPER'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${suffix}`;
}

export default function PlayerManagement() {
  const { characters, isGM, refreshData } = useCampaign();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create player form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'player' | 'gm'>('player');
  const [newCode, setNewCode] = useState(() => generateAccessCode());

  // Reassign form
  const [reassignCharId, setReassignCharId] = useState('');
  const [reassignPlayerId, setReassignPlayerId] = useState('');

  const loadPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dbHelpers.getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Failed to load players:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  if (!isGM) {
    return null;
  }

  const handleCreatePlayer = async () => {
    if (!newName.trim()) {
      toast({ title: "Error", description: "Player name is required.", variant: "destructive" });
      return;
    }

    try {
      const player = await dbHelpers.createPlayer(newName.trim(), newRole, newCode);
      if (player) {
        setPlayers(prev => [...prev, player]);
        toast({ title: "Player Created", description: `${player.name} has been created with code: ${player.access_code}` });
        setNewName('');
        setNewCode(generateAccessCode());
      }
    } catch (error: any) {
      const msg = error?.message?.includes('unique') ? 'Access code already exists. Generate a new one.' : 'Failed to create player.';
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    if (player.role === 'gm') {
      toast({ title: "Warning", description: "Cannot delete a GM account.", variant: "destructive" });
      return;
    }

    const ok = await dbHelpers.deletePlayer(player.id);
    if (ok) {
      setPlayers(prev => prev.filter(p => p.id !== player.id));
      toast({ title: "Player Deleted", description: `${player.name} has been removed.` });
    }
  };

  const handleToggleActive = async (player: Player) => {
    const ok = await dbHelpers.updatePlayer(player.id, { is_active: !player.is_active });
    if (ok) {
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, is_active: !p.is_active } : p));
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "Access code copied to clipboard." });
  };

  const handleReassign = async () => {
    if (!reassignCharId || !reassignPlayerId) {
      toast({ title: "Error", description: "Select both a character and a player.", variant: "destructive" });
      return;
    }
    const ok = await dbHelpers.reassignCharacter(reassignCharId, reassignPlayerId);
    if (ok) {
      const charName = characters.find(c => c.id === reassignCharId)?.name || 'Character';
      const playerName = players.find(p => p.id === reassignPlayerId)?.name || 'Player';
      toast({ title: "Reassigned", description: `${charName} assigned to ${playerName}.` });
      setReassignCharId('');
      setReassignPlayerId('');
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Player List */}
      <Card className="border-terminal-border bg-terminal-bg-dark">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-terminal-primary font-mono text-sm">
              REGISTERED PLAYERS
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPlayers}
              disabled={isLoading}
              className="h-7 text-xs font-mono border-terminal-border text-terminal-primary hover:bg-terminal-primary/10"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {players.length === 0 ? (
            <p className="text-terminal-primary/50 font-mono text-xs text-center py-4">
              No players registered. Create one below.
            </p>
          ) : (
            players.map(player => (
              <div
                key={player.id}
                className="flex items-center justify-between gap-3 p-2 rounded border border-terminal-border/50 bg-terminal-bg-dark/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {player.role === 'gm' ? (
                    <Shield size={14} className="text-yellow-400 flex-shrink-0" />
                  ) : (
                    <User size={14} className="text-terminal-primary/60 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm truncate ${player.role === 'gm' ? 'text-yellow-400' : 'text-terminal-primary'}`}>
                        {player.name}
                      </span>
                      {!player.is_active && (
                        <span className="text-[10px] text-red-400 border border-red-400/30 px-1 rounded">DISABLED</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[10px] text-terminal-primary/40">
                        {player.access_code}
                      </span>
                      <button onClick={() => handleCopyCode(player.access_code)} className="text-terminal-primary/30 hover:text-terminal-primary">
                        <Copy size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(player)}
                    className="h-6 px-2 text-[10px] font-mono text-terminal-primary/60 hover:text-terminal-primary"
                    title={player.is_active ? 'Disable' : 'Enable'}
                  >
                    {player.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  {player.role !== 'gm' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlayer(player)}
                      className="h-6 px-1 text-terminal-primary/40 hover:text-red-400"
                      title="Delete player"
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Create Player */}
      <Card className="border-terminal-border bg-terminal-bg-dark">
        <CardHeader className="pb-3">
          <CardTitle className="text-terminal-primary font-mono text-sm flex items-center gap-2">
            <UserPlus size={14} />
            CREATE PLAYER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-terminal-primary/70 font-mono text-xs">Name</Label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Player name"
                className="h-8 text-xs font-mono bg-terminal-bg-dark border-terminal-border text-terminal-primary"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-terminal-primary/70 font-mono text-xs">Role</Label>
              <Select value={newRole} onValueChange={(v: 'player' | 'gm') => setNewRole(v)}>
                <SelectTrigger className="h-8 text-xs font-mono bg-terminal-bg-dark border-terminal-border text-terminal-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="gm">Game Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-terminal-primary/70 font-mono text-xs">Access Code</Label>
            <div className="flex gap-2">
              <Input
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
                className="h-8 text-xs font-mono bg-terminal-bg-dark border-terminal-border text-terminal-primary flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewCode(generateAccessCode())}
                className="h-8 text-xs font-mono border-terminal-border text-terminal-primary hover:bg-terminal-primary/10"
              >
                <RefreshCw size={12} />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleCreatePlayer}
            disabled={!newName.trim()}
            className="w-full h-8 text-xs font-mono bg-terminal-primary/20 text-terminal-primary border border-terminal-primary/40 hover:bg-terminal-primary/30"
          >
            <UserPlus size={12} className="mr-1" />
            Create Player
          </Button>
        </CardContent>
      </Card>

      {/* Reassign Characters */}
      <Card className="border-terminal-border bg-terminal-bg-dark">
        <CardHeader className="pb-3">
          <CardTitle className="text-terminal-primary font-mono text-sm flex items-center gap-2">
            <ArrowRightLeft size={14} />
            ASSIGN CHARACTER OWNERSHIP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-terminal-primary/70 font-mono text-xs">Character</Label>
              <Select value={reassignCharId} onValueChange={setReassignCharId}>
                <SelectTrigger className="h-8 text-xs font-mono bg-terminal-bg-dark border-terminal-border text-terminal-primary">
                  <SelectValue placeholder="Select character" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.player_id !== 'campaign' ? `(${players.find(p => p.id === c.player_id)?.name || 'Unknown'})` : '(Unassigned)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-terminal-primary/70 font-mono text-xs">Assign To</Label>
              <Select value={reassignPlayerId} onValueChange={setReassignPlayerId}>
                <SelectTrigger className="h-8 text-xs font-mono bg-terminal-bg-dark border-terminal-border text-terminal-primary">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {players.filter(p => p.is_active).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.role === 'gm' ? '(GM)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleReassign}
            disabled={!reassignCharId || !reassignPlayerId}
            className="w-full h-8 text-xs font-mono bg-terminal-primary/20 text-terminal-primary border border-terminal-primary/40 hover:bg-terminal-primary/30"
          >
            <ArrowRightLeft size={12} className="mr-1" />
            Assign Character
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
