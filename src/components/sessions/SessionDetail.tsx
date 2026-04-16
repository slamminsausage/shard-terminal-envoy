import React, { useState, useEffect, useRef } from 'react';
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
import { ArrowLeft, Plus, Clock, User, MapPin, Trash2, ExternalLink, Pencil, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { SessionStatus, LogEntryType } from '@/types/session';
import { useCampaign } from '@/contexts/CampaignContext';
import { CrewVisibilitySelector } from '@/components/crew/CrewVisibilitySelector';
import { CrewVisibilityBadge } from '@/components/crew/CrewVisibilityBadge';

const LOG_CHANNEL_NAME = "shard-session-log";

interface SessionDetailProps {
  sessionId: string;
  onClose: () => void;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({ sessionId, onClose }) => {
  const { isGM } = useCampaign();
  const { getSession, getSessionLogs, addLogEntry, updateLogEntry, deleteLogEntry, updateSession, deleteSession } = useSession();
  const [session, setSession] = useState<Session | null>(null);
  const [logs, setLogs] = useState<SessionLogEntry[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);

  // Log entry form state
  const [logTitle, setLogTitle] = useState('');
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<LogEntryType>('note');

  // Edit state for existing log entries
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState<LogEntryType>('note');

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    const sessionData = await getSession(sessionId);
    if (!sessionData) {
      // Session missing or filtered out by crew scope — skip loading logs.
      setSession(null);
      setLogs([]);
      return;
    }
    setSession(sessionData);

    const logsData = await getSessionLogs(sessionId);
    setLogs(logsData);
  };

  // Listen for messages from pop-out windows
  useEffect(() => {
    const channel = new BroadcastChannel(LOG_CHANNEL_NAME);

    channel.onmessage = async (e: MessageEvent) => {
      if (e.data.type === 'add-log-entry' && e.data.sessionId === sessionId) {
        await addLogEntry(sessionId, e.data.entry);
        const logsData = await getSessionLogs(sessionId);
        setLogs(logsData);
      } else if (e.data.type === 'update-log-entry') {
        await updateLogEntry(e.data.entryId, e.data.updates);
        const logsData = await getSessionLogs(sessionId);
        setLogs(logsData);
      }
    };

    return () => channel.close();
  }, [sessionId, addLogEntry, updateLogEntry, getSessionLogs]);

  const handleAddLogEntry = async () => {
    if (!logContent.trim()) return;

    await addLogEntry(sessionId, {
      entry_type: logType,
      title: logTitle || undefined,
      content: logContent,
      created_by: isGM ? 'gm' : 'player',
    });

    setLogTitle('');
    setLogContent('');
    setLogType('note');
    setShowLogForm(false);

    const logsData = await getSessionLogs(sessionId);
    setLogs(logsData);
  };

  const handleDeleteLogEntry = async (entryId: string) => {
    if (!confirm('Delete this log entry? This cannot be undone.')) return;
    const success = await deleteLogEntry(entryId);
    if (success) {
      setLogs(prev => prev.filter(l => l.id !== entryId));
    }
  };

  const handleDeleteSession = async () => {
    if (!session) return;
    if (!confirm(`Delete session "${session.title}"? This cannot be undone.`)) return;
    const success = await deleteSession(sessionId);
    if (success) onClose();
  };

  const handleStatusChange = async (newStatus: SessionStatus) => {
    if (!session) return;

    await updateSession(sessionId, { status: newStatus });

    const sessionData = await getSession(sessionId);
    if (sessionData) {
      setSession(sessionData);
    }
  };

  const startEditingLog = (log: SessionLogEntry) => {
    setEditingLogId(log.id);
    setEditTitle(log.title || '');
    setEditContent(log.content);
    setEditType(log.entry_type);
  };

  const cancelEditingLog = () => {
    setEditingLogId(null);
    setEditTitle('');
    setEditContent('');
    setEditType('note');
  };

  const saveEditingLog = async () => {
    if (!editingLogId || !editContent.trim()) return;
    await updateLogEntry(editingLogId, {
      title: editTitle || undefined,
      content: editContent,
      entry_type: editType,
    });
    setEditingLogId(null);
    const logsData = await getSessionLogs(sessionId);
    setLogs(logsData);
  };

  const openPopout = () => {
    window.open(
      `/session-log-popout?sessionId=${sessionId}`,
      '_blank',
      'width=620,height=520,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  const openEditPopout = (log: SessionLogEntry) => {
    const params = new URLSearchParams({
      sessionId,
      editId: log.id,
      editTitle: log.title || '',
      editContent: log.content,
      editType: log.entry_type,
    });
    window.open(
      `/session-log-popout?${params.toString()}`,
      '_blank',
      'width=620,height=520,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  if (!session) {
    return (
      <div className="text-center py-8 text-terminal-primary/70">
        Loading session...
      </div>
    );
  }

  const logTypeLabels: Record<LogEntryType, string> = {
    note: 'Note',
    combat: 'Combat',
    skill_check: 'Skill Check',
    npc_interaction: 'NPC Interaction',
    location_change: 'Location Change',
  };

  const logTypeEmojis: Record<LogEntryType, string> = {
    note: '\u{1F4DD}',
    combat: '\u{2694}\u{FE0F}',
    skill_check: '\u{1F3B2}',
    npc_interaction: '\u{1F4AC}',
    location_change: '\u{1F4CD}',
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
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-500/20 ml-auto"
              onClick={handleDeleteSession}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-terminal-primary/70 mt-1 flex-wrap">
            <span>Session #{session.session_number}</span>
            <span>&bull;</span>
            <span>{format(new Date(session.session_date), 'MMMM dd, yyyy')}</span>
            {session.in_game_date && (
              <>
                <span>&bull;</span>
                <span>Imperial: {session.in_game_date}</span>
              </>
            )}
            {isGM && <CrewVisibilityBadge ids={session.visible_crew_ids} />}
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
          <div className="flex justify-end gap-2 mb-3">
            <Button
              onClick={openPopout}
              size="sm"
              variant="outline"
              className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
              title="Open note editor in a pop-out window that stays open while you browse"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Pop Out
            </Button>
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
                          {logTypeEmojis[value as LogEntryType]} {label}
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
                            {logTypeEmojis[log.entry_type]} {logTypeLabels[log.entry_type]}
                          </Badge>
                          {editingLogId !== log.id && log.title && (
                            <span className="text-terminal-primary font-semibold">{log.title}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-terminal-primary/50">
                            {format(new Date(log.timestamp), 'HH:mm')}
                          </span>
                          {editingLogId === log.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20"
                                onClick={saveEditingLog}
                                title="Save"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-terminal-primary/50 hover:bg-terminal-primary/20"
                                onClick={cancelEditingLog}
                                title="Cancel"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-terminal-primary/40 hover:bg-terminal-primary/20 hover:text-terminal-primary"
                                onClick={() => openEditPopout(log)}
                                title="Edit in pop-out"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-terminal-primary/40 hover:bg-terminal-primary/20 hover:text-terminal-primary"
                                onClick={() => startEditingLog(log)}
                                title="Edit inline"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
                                onClick={() => handleDeleteLogEntry(log.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingLogId === log.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Title (optional)"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="bg-black border-terminal-primary/50 text-terminal-primary h-8 text-sm"
                            />
                            <Select value={editType} onValueChange={(v) => setEditType(v as LogEntryType)}>
                              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-terminal-primary/50">
                                {Object.entries(logTypeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value} className="text-terminal-primary">
                                    {logTypeEmojis[value as LogEntryType]} {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                            className="bg-black border-terminal-primary/50 text-terminal-primary resize-y text-sm"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-terminal-primary/90 whitespace-pre-wrap">{log.content}</p>
                          {log.location && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-terminal-primary/60">
                              <MapPin className="h-3 w-3" />
                              {log.location}
                            </div>
                          )}
                        </>
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
              {isGM && (
                <div>
                  <h3 className="text-sm font-semibold text-terminal-primary mb-2">Crew Scope</h3>
                  <CrewVisibilitySelector
                    value={session.visible_crew_ids ?? null}
                    onChange={async (ids) => {
                      await updateSession(sessionId, { visible_crew_ids: ids });
                      const refreshed = await getSession(sessionId);
                      if (refreshed) setSession(refreshed);
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
