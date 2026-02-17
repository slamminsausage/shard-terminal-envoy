import React, { useState } from 'react';
import { useQuest } from '@/contexts/QuestContext';
import { QuestStatus, QuestPriority, QuestCategory } from '@/types/quest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';
import { useCampaign } from '@/contexts/CampaignContext';

interface QuestCreatorProps {
  onClose: () => void;
}

export const QuestCreator: React.FC<QuestCreatorProps> = ({ onClose }) => {
  const { createQuest } = useQuest();
  const { isGM } = useCampaign();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questGiver, setQuestGiver] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<QuestStatus>('active');
  const [priority, setPriority] = useState<QuestPriority>('medium');
  const [category, setCategory] = useState<QuestCategory>('side');
  const [rewardCredits, setRewardCredits] = useState('0');
  const [rewardXp, setRewardXp] = useState('0');
  const [rewardItems, setRewardItems] = useState('');
  const [rewardOther, setRewardOther] = useState('');
  const [notes, setNotes] = useState('');
  const [gmNotes, setGmNotes] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      return;
    }

    await createQuest({
      title,
      description: description || undefined,
      quest_giver: questGiver || undefined,
      location: location || undefined,
      status,
      priority,
      category,
      reward_credits: parseInt(rewardCredits) || 0,
      reward_xp: parseInt(rewardXp) || 0,
      reward_items: rewardItems || undefined,
      reward_other: rewardOther || undefined,
      notes: notes || undefined,
      gm_notes: isGM ? gmNotes || undefined : undefined,
      date_accepted: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <Card className="bg-black border-terminal-primary/50 mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-terminal-primary">Create New Quest</CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-terminal-primary hover:bg-terminal-primary/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Quest Title *
            </label>
            <Input
              placeholder="Quest Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Description
            </label>
            <Textarea
              placeholder="Quest description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Quest Giver
            </label>
            <Input
              placeholder="NPC or Organization"
              value={questGiver}
              onChange={(e) => setQuestGiver(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Location
            </label>
            <Input
              placeholder="Planet, System, etc."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>
        </div>

        {/* Status and Organization */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Status
            </label>
            <Select value={status} onValueChange={(v) => setStatus(v as QuestStatus)}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="active" className="text-terminal-primary">Active</SelectItem>
                <SelectItem value="on_hold" className="text-terminal-primary">On Hold</SelectItem>
                <SelectItem value="completed" className="text-terminal-primary">Completed</SelectItem>
                <SelectItem value="failed" className="text-terminal-primary">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Priority
            </label>
            <Select value={priority} onValueChange={(v) => setPriority(v as QuestPriority)}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="low" className="text-terminal-primary">Low</SelectItem>
                <SelectItem value="medium" className="text-terminal-primary">Medium</SelectItem>
                <SelectItem value="high" className="text-terminal-primary">High</SelectItem>
                <SelectItem value="urgent" className="text-terminal-primary">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Category
            </label>
            <Select value={category} onValueChange={(v) => setCategory(v as QuestCategory)}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="main" className="text-terminal-primary">Main Quest</SelectItem>
                <SelectItem value="side" className="text-terminal-primary">Side Quest</SelectItem>
                <SelectItem value="personal" className="text-terminal-primary">Personal</SelectItem>
                <SelectItem value="faction" className="text-terminal-primary">Faction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rewards */}
        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-2 block">
            Rewards
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-terminal-primary/70 mb-1 block">
                Credits
              </label>
              <Input
                type="number"
                placeholder="0"
                value={rewardCredits}
                onChange={(e) => setRewardCredits(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
            </div>

            <div>
              <label className="text-xs text-terminal-primary/70 mb-1 block">
                XP
              </label>
              <Input
                type="number"
                placeholder="0"
                value={rewardXp}
                onChange={(e) => setRewardXp(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-terminal-primary/70 mb-1 block">
                Items
              </label>
              <Input
                placeholder="e.g., Laser Rifle, Ship Upgrade, etc."
                value={rewardItems}
                onChange={(e) => setRewardItems(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-terminal-primary/70 mb-1 block">
                Other Rewards
              </label>
              <Input
                placeholder="e.g., Reputation, Contacts, Information, etc."
                value={rewardOther}
                onChange={(e) => setRewardOther(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
            Notes
          </label>
          <Textarea
            placeholder="Additional notes about the quest..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
          />
        </div>

        {isGM && (
          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              GM Notes
            </label>
            <Textarea
              placeholder="Private notes for the GM..."
              value={gmNotes}
              onChange={(e) => setGmNotes(e.target.value)}
              rows={2}
              className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Quest
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
