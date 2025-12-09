/**
 * AudioLogsPage Component
 *
 * Full-screen view for displaying multiple audio logs.
 * Extracted from TerminalInterface.
 *
 * Features:
 * - Scrollable list of audio logs
 * - Audio player for each log
 * - Full-screen layout
 * - Back button to return to terminal
 * - ESC key support
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import AudioPlayer from '../AudioPlayer';

interface AudioLog {
  title: string;
  content: string;
  audio_file?: string;
}

interface AudioLogsPageProps {
  logs: AudioLog[];
  onBack: () => void;
}

export default function AudioLogsPage({ logs, onBack }: AudioLogsPageProps) {
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onBack]);

  return (
    <div className="h-screen bg-background p-6 flex flex-col crt-container">
      <div className="w-full flex flex-col h-full">
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-accent font-mono text-2xl terminal-glow mb-2">
            ENCRYPTED AUDIO LOGS
          </h1>
          <p className="text-primary/60 font-mono text-sm">
            Press ESC to return to terminal
          </p>
        </div>

        <div className="flex-1 min-h-0 bg-background/50 border border-primary/30 p-6">
          <ScrollArea className="h-full">
            <div className="space-y-8 pr-4 pb-24">
              {logs.map((log, index) => (
                <div key={index} className="border-b border-primary/20 pb-6 last:border-b-0">
                  <h2 className="text-accent font-mono text-lg mb-3 terminal-glow">
                    {log.title}
                  </h2>
                  <p className="text-primary/90 font-mono text-sm whitespace-pre-wrap mb-4 leading-relaxed">
                    {log.content}
                  </p>
                  {log.audio_file && (
                    <AudioPlayer src={log.audio_file} />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-shrink-0 mt-6 p-4 border-t border-primary/30">
          <Button
            variant="terminal"
            onClick={onBack}
            className="w-full bg-primary/20 border-2 border-primary text-primary hover:bg-primary hover:text-background font-mono text-lg py-4 terminal-glow"
          >
            &gt; BACK TO TERMINAL
          </Button>
        </div>
      </div>
    </div>
  );
}
