/**
 * AudioLogsPage Component
 *
 * Full-screen view for displaying multiple audio logs.
 *
 * Features:
 * - Scrollable list of audio logs with index numbers
 * - Audio player for each log
 * - Signal strength meter per entry
 * - Decorative header with data stream animation
 * - Playback status indicators
 * - Full-screen dark theme layout
 * - Back button and ESC key support
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import AudioPlayer from '../AudioPlayer';
import { SignalMeter } from '../TerminalGauges';

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
        {/* Header with data stream animation */}
        <div className="text-center mb-6 flex-shrink-0">
          <div className="data-stream-active inline-block px-8 py-2 rounded-sm mb-2">
            <h1 className="text-accent font-mono text-2xl terminal-glow mb-1"
                style={{ fontFamily: 'var(--font-display)' }}>
              ENCRYPTED AUDIO LOGS
            </h1>
            <div className="flex items-center justify-center gap-4 font-mono text-xs">
              <span className="text-primary/40">{logs.length} {logs.length === 1 ? 'RECORD' : 'RECORDS'} FOUND</span>
              <span className="text-primary/30">│</span>
              <span className="text-primary/40 signal-pulse-active">DECRYPTION ACTIVE</span>
            </div>
          </div>
          <p className="text-primary/60 font-mono text-sm">
            Press ESC to return to terminal
          </p>
        </div>

        <div className="flex-1 min-h-0 bg-background/50 border border-primary/30 p-6">
          <ScrollArea className="h-full">
            <div className="space-y-8 pr-4 pb-24">
              {logs.map((log, index) => (
                <div key={index} className="border-b border-primary/20 pb-6 last:border-b-0">
                  {/* Log header with index and signal meter */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Index badge */}
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
                        style={{
                          border: '1px solid rgba(255, 102, 0, 0.4)',
                          color: '#ff6600',
                          backgroundColor: 'rgba(255, 102, 0, 0.08)',
                          fontSize: '9px',
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-accent font-mono text-lg terminal-glow">
                        {log.title}
                      </h2>
                    </div>
                    {/* Signal meter */}
                    <div className="flex items-center gap-2">
                      <SignalMeter color="#ff6600" />
                      <span className="font-mono text-primary/30" style={{ fontSize: '8px' }}>
                        {log.audio_file ? 'AUDIO' : 'TEXT'}
                      </span>
                    </div>
                  </div>

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
