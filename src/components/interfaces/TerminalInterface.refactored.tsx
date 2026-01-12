/**
 * TerminalInterface (REFACTORED)
 *
 * Refactored from 791 lines to ~250 lines using extracted components and hooks.
 *
 * Changes:
 * - Uses useTerminalSession hook instead of 23 individual useState calls
 * - Uses extracted view components (LoadingScreen, InitScreen, TerminalView, etc.)
 * - Uses extracted security components (PasswordPrompt, RollCheckPrompt)
 * - Cleaner separation of concerns
 * - Maintains all existing functionality
 */

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SignalInterference from '../SignalInterference';
import DeepCoreTerminal from '@/components/DeepCoreTerminal';
import audioManager from '@/lib/audioManager';
import { typeTextWithSound } from '@/lib/typing';
import { TERMINALS, getTerminalDefinition } from '@/lib/terminals';
import { dbHelpers } from '@/lib/supabase';

// New components
import LoadingScreen from '../terminal/views/LoadingScreen';
import InitScreen from '../terminal/views/InitScreen';
import TerminalView from '../terminal/views/TerminalView';
import LogDetailView from '../terminal/views/LogDetailView';
import AudioLogsPage from '../terminal/views/AudioLogsPage';
import PasswordPrompt from '../terminal/SecurityChallenge/PasswordPrompt';
import RollCheckPrompt from '../terminal/SecurityChallenge/RollCheckPrompt';

// New hooks
import { useTerminalSession } from '@/hooks/useTerminalSession';
import { usePasswordAuth } from '@/hooks/usePasswordAuth';

// Terminal visual effects helper
const getTerminalEffectClasses = (terminalId: string) => {
  if (!terminalId) return "terminal terminal-flicker";

  const terminalName = terminalId.includes("/")
    ? terminalId.replace("/logs/", "").replace(".json", "")
    : terminalId;

  const damagedTerminals = ["es1-omegalab", "es1-gamma", "sayelle-logs", "vennik-personal"];
  const minorGlitchTerminals = ["fuwnet", "vanagandr001", "fuw01", "blacktalon"];

  if (damagedTerminals.includes(terminalName)) {
    return "terminal terminal-severe-flicker terminal-scanlines";
  }

  if (minorGlitchTerminals.includes(terminalName)) {
    return "terminal terminal-flicker terminal-scanlines";
  }

  return "terminal terminal-flicker";
};

export default function TerminalInterface() {
  const navigate = useNavigate();
  const hasInitialized = useRef(false);
  const typingCancelRef = useRef<(() => void) | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Use consolidated terminal session state
  const session = useTerminalSession();

  // Password authentication for log access
  const logPasswordAuth = usePasswordAuth({
    correctPassword: session.selectedLog?.password || '',
    maxAttempts: session.selectedLog?.attemptsAllowed || 3,
    onSuccess: () => {
      session.setRequiresPassword(false);
      session.resetPasswordAttempts();
      // Start typing animation for log content
      if (session.selectedLog?.content) {
        const cancel = typeTextWithSound(
          session.selectedLog.content,
          session.setDisplayedText,
          () => session.setTypingComplete(true),
          { delay: 20 }
        );
        typingCancelRef.current = cancel;
      }
    },
    onFailure: () => {
      audioManager.playEffect('access_denied');
      session.goToTerminal();
    },
  });

  // Password authentication for terminal access
  const terminalPasswordAuth = usePasswordAuth({
    correctPassword: session.activeTerminal?.password || '',
    maxAttempts: 3,
    onSuccess: () => {
      session.setTerminalPasswordRequired(false);
      session.resetTerminalPasswordAttempts();
      loadTerminalLogs();
    },
    onFailure: () => {
      audioManager.playEffect('access_denied');
      session.goToInit();
    },
  });

  // Initialize on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    audioManager.preloadSounds();

    const loadingMessages = [
      ">> INITIALIZING TRAVELLER TERMINAL MAINFRAME SUBSYSTEMS...",
      ">> CONNECTING TO DISTRIBUTED NETWORK NODES...",
      ">> AUTHENTICATING SECURITY PROTOCOLS...",
      ">> ESTABLISHING ENCRYPTED COMMUNICATION CHANNELS...",
      ">> SYNCHRONIZING TEMPORAL DATABASE INDICES...",
      ">> TERMINAL INTERFACE READY.",
      "\n[PRESS ESC TO SKIP INITIALIZATION]"
    ];

    const fullText = loadingMessages.join("\n");
    const cancel = typeTextWithSound(
      fullText,
      session.setInitText,
      () => {
        session.setInitComplete(true);
        setTimeout(() => session.setView('init'), 1000);
      },
      { delay: 15 }
    );

    typingCancelRef.current = cancel;

    // Load unlocked terminals
    loadUnlockedTerminals();

    return () => {
      if (typingCancelRef.current) {
        typingCancelRef.current();
      }
    };
  }, []);

  // ESC key navigation
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (session.currentView === 'loading' && !session.initComplete) {
          if (typingCancelRef.current) {
            typingCancelRef.current();
          }
          session.setView('init');
        } else if (session.currentView === 'log') {
          session.goToTerminal();
        } else if (session.currentView === 'terminal') {
          session.goToInit();
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [session.currentView, session.initComplete]);

  // Load unlocked terminals from database
  const loadUnlockedTerminals = async () => {
    try {
      const codes = await dbHelpers.getUnlockedTerminals();
      session.setUnlockedTerminals(codes);
    } catch (error) {
      console.error('Failed to load unlocked terminals:', error);
    } finally {
      session.setTerminalsLoading(false);
    }
  };

  // Load terminal logs
  const loadTerminalLogs = async () => {
    if (!session.activeTerminal) return;

    try {
      const response = await fetch(session.activeTerminal.logPath);
      const data = await response.json();
      session.setLogData(data);
      session.setView('terminal');
    } catch (error) {
      console.error('Failed to load logs:', error);
      audioManager.playEffect('access_denied');
    }
  };

  // Handle access code submission
  const handleAccessCode = async (codeOverride: string | null = null) => {
    const code = (codeOverride || session.inputCode).trim().toUpperCase();

    if (!code) return;

    // Special case: Deep Core terminal
    if (code === 'DEEPCORE') {
      session.setShowDeepCore(true);
      return;
    }

    const terminal = getTerminalDefinition(code);

    if (!terminal) {
      audioManager.playEffect('access_denied');
      return;
    }

    session.setActiveTerminal(terminal);
    audioManager.playEffect('access_granted');

    // Add to unlocked terminals
    try {
      await dbHelpers.addUnlockedTerminal(code);
      session.addUnlockedTerminal(code);
    } catch (error) {
      console.error('Failed to save unlocked terminal:', error);
    }

    // Check if terminal requires password
    if (terminal.password) {
      session.setTerminalPasswordRequired(true);
    } else {
      loadTerminalLogs();
    }
  };

  // Handle log selection
  const handleLogClick = (log: any) => {
    session.setSelectedLog(log);
    session.setDisplayedText('');
    session.setTypingComplete(false);
    session.setView('log');

    // Check for special audio logs
    if (log.title?.includes('AUDIO LOG')) {
      session.setShowAudioLogs(true);
      session.setAudioLogsData([log]);
      return;
    }

    // Check security requirements
    if (log.special_roll_check) {
      session.setSpecialRollCheck(log.special_roll_check);
      return;
    }

    if (log.roll_check) {
      session.setRollCheck(log.roll_check);
      return;
    }

    if (log.requires_password && log.password) {
      session.setRequiresPassword(true);
      return;
    }

    // No security - start typing
    if (log.content) {
      const cancel = typeTextWithSound(
        log.content,
        session.setDisplayedText,
        () => session.setTypingComplete(true),
        { delay: 20 }
      );
      typingCancelRef.current = cancel;
    }
  };

  // Handle roll check result
  const handleRollCheck = (passed: boolean) => {
    session.setRollCheck(null);

    if (passed) {
      audioManager.playEffect('access_granted');
      if (session.selectedLog?.requires_password && session.selectedLog?.password) {
        session.setRequiresPassword(true);
      } else if (session.selectedLog?.content) {
        const cancel = typeTextWithSound(
          session.selectedLog.content,
          session.setDisplayedText,
          () => session.setTypingComplete(true),
          { delay: 20 }
        );
        typingCancelRef.current = cancel;
      }
    } else {
      audioManager.playEffect('access_denied');
      session.goToTerminal();
    }
  };

  // Handle special roll check result
  const handleSpecialRollCheck = (passed: boolean) => {
    session.setSpecialRollCheck(null);

    if (passed) {
      audioManager.playEffect('access_granted');
      if (session.selectedLog?.content) {
        const cancel = typeTextWithSound(
          session.selectedLog.content,
          session.setDisplayedText,
          () => session.setTypingComplete(true),
          { delay: 20 }
        );
        typingCancelRef.current = cancel;
      }
    } else {
      audioManager.playEffect('access_denied');
      session.goToTerminal();
    }
  };

  // Render Deep Core terminal
  if (session.showDeepCore) {
    return <DeepCoreTerminal onBack={() => session.setShowDeepCore(false)} />;
  }

  // Render Audio Logs page
  if (session.showAudioLogs) {
    return (
      <AudioLogsPage
        logs={session.audioLogsData}
        onBack={() => {
          session.setShowAudioLogs(false);
          session.setAudioLogsData([]);
          session.goToTerminal();
        }}
      />
    );
  }

  // Get unlocked terminals for display
  const unlockedTerminalsList = TERMINALS.filter(t =>
    session.unlockedTerminals.includes(t.code)
  );

  return (
    <div className="h-screen bg-background crt-container">
      <SignalInterference
        level={session.signalInterferenceLevel}
        terminalType={session.activeTerminal ? 'corrupted' : 'normal'}
        soundEnabled={!audioManager.isMuted()}
      />

      {/* Loading View */}
      {session.currentView === 'loading' && (
        <LoadingScreen
          initText={session.initText}
          onSkip={() => session.setView('init')}
        />
      )}

      {/* Init View */}
      {session.currentView === 'init' && (
        <InitScreen
          inputCode={session.inputCode}
          onCodeChange={session.setInputCode}
          onSubmit={() => handleAccessCode(null)}
          unlockedTerminals={unlockedTerminalsList}
          loading={session.terminalsLoading}
          onTerminalSelect={(code) => {
            session.setInputCode(code);
            handleAccessCode(code);
          }}
        />
      )}

      {/* Terminal/Log View */}
      {(session.currentView === 'terminal' || session.currentView === 'log') && (
        <div className="h-full p-8">
          <div
            className={`${
              session.activeTerminal
                ? getTerminalEffectClasses(session.activeTerminal.logPath)
                : "terminal terminal-flicker"
            } h-full overflow-auto relative bg-background/20 border border-primary/30 p-6`}
            ref={terminalRef}
          >
            {/* Terminal Password Prompt */}
            {session.terminalPasswordRequired && (
              <PasswordPrompt
                label={`Terminal ${session.activeTerminal?.name || ''} requires password`}
                maxAttempts={3}
                currentAttempts={session.terminalPasswordAttempts}
                onSubmit={(password) => {
                  const success = terminalPasswordAuth.attempt(password);
                  if (!success) {
                    session.incrementTerminalPasswordAttempts();
                  }
                }}
                onBack={session.goToInit}
                errorMessage={terminalPasswordAuth.errorMessage}
              />
            )}

            {/* Special Roll Check */}
            {session.specialRollCheck && !session.terminalPasswordRequired && (
              <RollCheckPrompt
                difficulty={session.specialRollCheck.difficulty}
                skill={session.specialRollCheck.skill}
                subject={session.selectedLog?.title || 'this file'}
                onYes={() => handleSpecialRollCheck(true)}
                onNo={() => handleSpecialRollCheck(false)}
              />
            )}

            {/* Standard Roll Check */}
            {session.rollCheck && !session.terminalPasswordRequired && !session.specialRollCheck && (
              <RollCheckPrompt
                difficulty={session.rollCheck.difficulty}
                skill="Electronics (Computers)"
                subject={session.selectedLog?.title || 'this file'}
                onYes={() => handleRollCheck(true)}
                onNo={() => handleRollCheck(false)}
              />
            )}

            {/* Log Password Prompt */}
            {session.requiresPassword && !session.terminalPasswordRequired && !session.rollCheck && !session.specialRollCheck && (
              <PasswordPrompt
                label="This log requires password authentication"
                maxAttempts={session.selectedLog?.attemptsAllowed || 3}
                currentAttempts={session.passwordAttempts}
                onSubmit={(password) => {
                  const success = logPasswordAuth.attempt(password);
                  if (!success) {
                    session.incrementPasswordAttempts();
                  }
                }}
                onBack={session.goToTerminal}
                errorMessage={logPasswordAuth.errorMessage}
              />
            )}

            {/* Log Detail View */}
            {session.selectedLog &&
             !session.requiresPassword &&
             !session.rollCheck &&
             !session.specialRollCheck &&
             !session.terminalPasswordRequired && (
              <LogDetailView
                log={session.selectedLog}
                displayedText={session.displayedText}
                typingComplete={session.typingComplete}
                onBack={session.goToTerminal}
              />
            )}

            {/* Terminal Log List */}
            {session.logData &&
             !session.selectedLog &&
             !session.terminalPasswordRequired && (
              <TerminalView
                terminal={session.activeTerminal!}
                logs={session.logData}
                onLogSelect={handleLogClick}
                onBack={session.goToInit}
              />
            )}

            {/* Empty state */}
            {!session.logData &&
             !session.selectedLog &&
             !session.terminalPasswordRequired && (
              <p className="p-4 text-sm">ENTER ACCESS CODE TO PROCEED</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
