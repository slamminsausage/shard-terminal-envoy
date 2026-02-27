import React, { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Session, SessionStatus } from '@/types/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { SessionCreator } from './SessionCreator';
import { AnimatedList } from '@/components/ui/AnimatedList';
import { SessionDetail } from './SessionDetail';

const statusColors: Record<SessionStatus, string> = {
  planned: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  in_progress: 'bg-green-500/20 text-green-400 border-green-500/50',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
};

const statusLabels: Record<SessionStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const SessionsList: React.FC = () => {
  const { sessions, isLoading, setCurrentSession } = useSession();
  const [showCreator, setShowCreator] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleViewSession = (session: Session) => {
    setCurrentSession(session);
    setSelectedSessionId(session.id);
  };

  const handleCloseDetail = () => {
    setCurrentSession(null);
    setSelectedSessionId(null);
  };

  if (selectedSessionId) {
    return <SessionDetail sessionId={selectedSessionId} onClose={handleCloseDetail} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-terminal-primary">Session Log</h2>
          <p className="text-terminal-primary/70 text-sm">Track your campaign sessions</p>
        </div>
        <Button
          onClick={() => setShowCreator(true)}
          className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      {showCreator && (
        <SessionCreator onClose={() => setShowCreator(false)} />
      )}

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-terminal-primary/70">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="p-8 text-center text-terminal-primary/70">
              No sessions yet. Create your first session to start tracking your campaign!
            </CardContent>
          </Card>
        ) : (
          <AnimatedList className="space-y-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="bg-black border-terminal-primary/30 hover:border-terminal-primary/50 transition-colors cursor-pointer"
                onClick={() => handleViewSession(session)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-terminal-primary/70 text-sm">
                          Session #{session.session_number}
                        </span>
                        <Badge className={statusColors[session.status]}>
                          {statusLabels[session.status]}
                        </Badge>
                      </div>
                      <CardTitle className="text-terminal-primary">{session.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-terminal-primary hover:bg-terminal-primary/20"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-terminal-primary/70">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(session.session_date), 'MMM dd, yyyy')}
                    </div>
                    {session.duration_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration_minutes} min
                      </div>
                    )}
                    {session.in_game_date && (
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        {session.in_game_date}
                      </div>
                    )}
                  </div>
                  {session.summary && (
                    <p className="mt-2 text-terminal-primary/80 text-sm line-clamp-2">
                      {session.summary}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </AnimatedList>
        )}
      </ScrollArea>
    </div>
  );
};
