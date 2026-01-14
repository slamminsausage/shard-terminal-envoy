/**
 * Auto-save indicator component
 * Shows save status with visual feedback
 */

import React from 'react';
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  className?: string;
  showLabel?: boolean;
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  className,
  showLabel = true,
}: AutoSaveIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Saving...',
          color: 'text-blue-500',
        };
      case 'saved':
        return {
          icon: <Check className="h-3 w-3" />,
          text: lastSaved
            ? `Saved ${getRelativeTime(lastSaved)}`
            : 'Saved',
          color: 'text-green-500',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Save failed',
          color: 'text-red-500',
        };
      case 'offline':
        return {
          icon: <CloudOff className="h-3 w-3" />,
          text: 'Offline mode',
          color: 'text-yellow-500',
        };
      default:
        return {
          icon: <Cloud className="h-3 w-3" />,
          text: 'Up to date',
          color: 'text-muted-foreground',
        };
    }
  };

  const { icon, text, color } = getStatusDisplay();

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium',
        color,
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon}
      {showLabel && <span>{text}</span>}
    </div>
  );
}

/**
 * Get relative time string (e.g., "just now", "2m ago")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return 'today';
}

/**
 * Hook for managing auto-save state
 */
export function useAutoSave() {
  const [status, setStatus] = React.useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = React.useState<Date | undefined>();
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const startSaving = React.useCallback(() => {
    setStatus('saving');
    setHasUnsavedChanges(false);
  }, []);

  const markSaved = React.useCallback(() => {
    setStatus('saved');
    setLastSaved(new Date());
    setHasUnsavedChanges(false);

    // Auto-hide "saved" message after 3 seconds
    setTimeout(() => {
      setStatus('idle');
    }, 3000);
  }, []);

  const markError = React.useCallback(() => {
    setStatus('error');
    setHasUnsavedChanges(true);
  }, []);

  const markOffline = React.useCallback(() => {
    setStatus('offline');
  }, []);

  const markChanged = React.useCallback(() => {
    setHasUnsavedChanges(true);
    if (status === 'saved' || status === 'idle') {
      setStatus('idle');
    }
  }, [status]);

  return {
    status,
    lastSaved,
    hasUnsavedChanges,
    startSaving,
    markSaved,
    markError,
    markOffline,
    markChanged,
  };
}
