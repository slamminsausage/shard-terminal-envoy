import React from 'react';
import { Clock, Eye, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTerminalHistory } from '@/hooks/useTerminalHistory';
import { TERMINALS } from '@/lib/terminals';
import { cn } from '@/lib/utils';

interface RecentTerminalsProps {
  onTerminalSelect: (terminalCode: string) => void;
  currentTerminal?: string;
}

export function RecentTerminals({ onTerminalSelect, currentTerminal }: RecentTerminalsProps) {
  const {
    history,
    getRecentAccesses,
    clearHistory,
    removeFromHistory,
    getUnviewedCount,
  } = useTerminalHistory();

  const recentAccesses = getRecentAccesses(10);

  if (history.length === 0) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Terminals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No terminals accessed yet</p>
            <p className="text-xs mt-1">Access a terminal to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Terminals
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="h-8"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentAccesses.map(entry => {
          const terminal = TERMINALS.find(t => t.code === entry.terminalCode);
          const isActive = currentTerminal === entry.terminalCode;
          const totalLogs = terminal?.logsData?.logs?.length || 0;
          const unviewedCount = getUnviewedCount(entry.terminalCode, totalLogs);

          return (
            <div
              key={entry.terminalCode}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/50",
                isActive && "bg-accent border-primary"
              )}
              onClick={() => onTerminalSelect(entry.terminalCode)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-medium truncate">
                    {entry.terminalName}
                  </span>
                  {unviewedCount > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      {unviewedCount} new
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(entry.lastAccessed)}
                  </span>
                  <span>
                    {entry.accessCount} {entry.accessCount === 1 ? 'access' : 'accesses'}
                  </span>
                  {entry.logEntriesViewed && entry.logEntriesViewed.length > 0 && totalLogs > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {entry.logEntriesViewed.length}/{totalLogs} logs viewed
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromHistory(entry.terminalCode);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
