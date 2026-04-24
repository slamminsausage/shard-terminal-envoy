import React, { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { SessionStatus } from '@/types/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';
import { useCampaign } from '@/contexts/CampaignContext';
import { CrewVisibilitySelector } from '@/components/crew/CrewVisibilitySelector';

interface SessionCreatorProps {
  onClose: () => void;
}

export const SessionCreator: React.FC<SessionCreatorProps> = ({ onClose }) => {
  const { createSession } = useSession();
  const { isGM } = useCampaign();
  const { currentDate } = useCalendar();
  const [title, setTitle] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<SessionStatus>('planned');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [inGameDate, setInGameDate] = useState(currentDate?.formatted || '');
  const [visibleCrewIds, setVisibleCrewIds] = useState<string[] | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      return;
    }

    await createSession({
      title,
      session_date: new Date(sessionDate).toISOString(),
      status,
      summary: summary || undefined,
      notes: isGM ? notes || undefined : undefined,
      in_game_date: inGameDate || undefined,
      ...(isGM ? { visible_crew_ids: visibleCrewIds } : {}),
    });

    onClose();
  };

  return (
    <Card className="bg-black border-terminal-primary/50 mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-terminal-primary">Create New Session</CardTitle>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Session Title *
            </label>
            <Input
              placeholder="Session Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Real Date
            </label>
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Status
            </label>
            <Select value={status} onValueChange={(v) => setStatus(v as SessionStatus)}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="planned" className="text-terminal-primary">Planned</SelectItem>
                <SelectItem value="in_progress" className="text-terminal-primary">In Progress</SelectItem>
                <SelectItem value="completed" className="text-terminal-primary">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              In-Game Date
            </label>
            <Input
              placeholder="e.g., 135-1105"
              value={inGameDate}
              onChange={(e) => setInGameDate(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
            Summary
          </label>
          <Textarea
            placeholder="Brief summary of the session..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
            />
          </div>
        )}

        {isGM && (
          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Crew Scope
            </label>
            <CrewVisibilitySelector
              value={visibleCrewIds}
              onChange={setVisibleCrewIds}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Session
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
