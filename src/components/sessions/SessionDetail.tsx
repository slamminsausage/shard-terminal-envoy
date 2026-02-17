import React, { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Session, SessionLogEntry } from '@/types/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Clock, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { SessionStatus, LogEntryType } from '@/types/session';
import { useCampaign } from '@/contexts/CampaignContext';

interface SessionDetailProps {
  sessionId: string;
  onClose: () => void;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({ sessionId, onClose }) => {
  const { isGM } = useCampaign();
  const { getSession, getSessionLogs, addLogEntry, updateSession } = useSession();
  const [session, setSession] = useState<Session | null>(null);
  const [logs, setLogs] = useState<SessionLogEntry[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);

  // Log entry form state
  const [logTitle, setLogTitle] = useState('');
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<LogEntryType>('note');

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    const sessionData = await getSession(sessionId);
    if (sessionData) {
      setSession(sessionData);
    }

    const logsData = await getSessionLogs(sessionId);
    setLogs(logsData);
  };

  const handleAddLogEntry = async () => {
    if (!logContent.trim()) return;

    await addLogEntry(sessionId, {
      entry_type: logType,
      title: logTitle || undefined,
      content: logContent,
      created_by: 'gm',
    });

    setLogTitle('');
    setLogContent('');
    setLogType('note');
    setShowLogForm(false);

    // Reload logs
    const logsData = await getSessionLogs(sessionId);
    setLogs(logsData);
  };

  const handleStatusChange = async (newStatus: SessionStatus) => {
    if (!session) return;

    await updateSession(sessionId, { status: newStatus });

    const sessionData = await getSession(sessionId);
    if (sessionData) {
      setSession(sessionData);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-8 text-terminal-primary/70">
        Loading session...
      </div>
    );
  }

  const logTypeLabels: Record<LogEntryType, string> = {
    note: '📝 Note',
    combat: '⚔️ Combat',
    skill_check: '🎲 Skill Check',
    npc_interaction: '💬 NPC Interaction',
    location_change: '📍 Location Change',
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-terminal-primary hover:bg-terminal-primary/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-terminal-primary">{session.title}</h2>
            <Select value={session.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32 bg-black border-terminal-primary/50 text-terminal-primary h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="planned" className="text-terminal-primary">Planned</SelectItem>
                <SelectItem value="in_progress" className="text-terminal-primary">In Progress</SelectItem>
                <SelectItem value="completed" className="text-terminal-primary">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4 text-sm text-terminal-primary/70 mt-1">
            <span>Session #{session.session_number}</span>
            <span>•</span>
            <span>{format(new Date(session.session_date), 'MMMM dd, yyyy')}</span>
            {session.in_game_date && (
              <>
                <span>•</span>
                <span>Imperial: {session.in_game_date}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {session.summary && (
        <Card className="bg-black border-terminal-primary/30 mb-4">
          <CardContent className="pt-4">
            <p className="text-terminal-primary/90">{session.summary}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="log" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-black border border-terminal-primary/30">
          <TabsTrigger value="log" className="data-[state=active]:bg-terminal-primary/20">
            Session Log ({logs.length})
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-terminal-primary/20">
            Rewards
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-terminal-primary/20">
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="flex-1 flex flex-col mt-4">
          <div className="flex justify-end mb-3">
            <Button
              onClick={() => setShowLogForm(!showLogForm)}
              size="sm"
              className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Log Entry
            </Button>
          </div>

          {showLogForm && (
            <Card className="bg-black border-terminal-primary/50 mb-3">
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Title (optional)"
                    value={logTitle}
                    onChange={(e) => setLogTitle(e.target.value)}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                  <Select value={logType} onValueChange={(v) => setLogType(v as LogEntryType)}>
                    <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-terminal-primary/50">
                      {Object.entries(logTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-terminal-primary">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="What happened..."
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  rows={3}
                  className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddLogEntry}
                    disabled={!logContent.trim()}
                    size="sm"
                    className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                  >
                    Add Entry
                  </Button>
                  <Button
                    onClick={() => setShowLogForm(false)}
                    size="sm"
                    variant="outline"
                    className="border-terminal-primary/50 text-terminal-primary"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <ScrollArea className="flex-1">
            {logs.length === 0 ? (
              <Card className="bg-black border-terminal-primary/30">
                <CardContent className="p-8 text-center text-terminal-primary/70">
                  No log entries yet. Start documenting what happens!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} className="bg-black border-terminal-primary/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-terminal-primary/10 text-terminal-primary/70 border-terminal-primary/30">
                            {logTypeLabels[log.entry_type]}
                          </Badge>
                          {log.title && (
                            <span className="text-terminal-primary font-semibold">{log.title}</span>
                          )}
                        </div>
                        <span className="text-xs text-terminal-primary/50">
                          {format(new Date(log.timestamp), 'HH:mm')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-terminal-primary/90 whitespace-pre-wrap">{log.content}</p>
                      {log.location && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-terminal-primary/60">
                          <MapPin className="h-3 w-3" />
                          {log.location}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="rewards" className="flex-1 mt-4">
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="p-8 text-center text-terminal-primary/70">
              Rewards tracking coming soon...
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="flex-1 mt-4">
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="pt-4 space-y-4">
              {isGM && session.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-terminal-primary mb-2">GM Notes</h3>
                  <p className="text-terminal-primary/80 whitespace-pre-wrap">{session.notes}</p>
                </div>
              )}
              {session.duration_minutes && (
                <div>
                  <h3 className="text-sm font-semibold text-terminal-primary mb-2">Duration</h3>
                  <p className="text-terminal-primary/80">{session.duration_minutes} minutes</p>
                </div>
              )}
              {session.in_game_time_elapsed && (
                <div>
                  <h3 className="text-sm font-semibold text-terminal-primary mb-2">In-Game Time Elapsed</h3>
                  <p className="text-terminal-primary/80">{session.in_game_time_elapsed}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
