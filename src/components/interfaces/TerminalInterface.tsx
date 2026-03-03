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

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SignalInterference from '../SignalInterference';
import DeepCoreTerminal from '@/components/DeepCoreTerminal';
import { Button } from "@/components/ui/button";
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
import TerminalBootScreen from '../terminal/views/TerminalBootScreen';
import PasswordPrompt from '../terminal/SecurityChallenge/PasswordPrompt';
import RollCheckPrompt from '../terminal/SecurityChallenge/RollCheckPrompt';
import { getTerminalBootProfile } from '@/lib/terminalBootProfiles';

// New hooks
import { useTerminalSession } from '@/hooks/useTerminalSession';
import { usePasswordAuth } from '@/hooks/usePasswordAuth';

import { useTerminalHistory } from '@/hooks/useTerminalHistory';
import type { DiceRoll } from '@/lib/dice';

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

  // Terminal history tracking
  const terminalHistory = useTerminalHistory();

  // Local state for typing animations (useState required for typeTextWithSound)
  const [localInitText, setLocalInitText] = useState('');
  const [localDisplayedText, setLocalDisplayedText] = useState('');
  const [localTypingComplete, setLocalTypingComplete] = useState(false);

  // Password authentication for log access
  const logPasswordAuth = usePasswordAuth({
    correctPassword: session.selectedLog?.password || '',
    maxAttempts: session.selectedLog?.attemptsAllowed || 3,
    onSuccess: () => {
      session.setRequiresPassword(false);
      session.resetPasswordAttempts();
      audioManager.playEffect('access_granted');

      // Check if log has nested audio logs
      if (session.selectedLog?.logs && Array.isArray(session.selectedLog.logs) && session.selectedLog.logs.length > 0) {
        session.setShowAudioLogs(true);
        session.setAudioLogsData(session.selectedLog.logs);
        return;
      }

      // Otherwise type the content
      if (session.selectedLog?.content) {
        setLocalDisplayedText('');
        setLocalTypingComplete(false);
        const cancel = typeTextWithSound(
          session.selectedLog.content,
          setLocalDisplayedText,
          () => setLocalTypingComplete(true),
          { delay: 20 }
        );
        typingCancelRef.current = cancel;
      }
    },
    onFailure: () => {
      audioManager.playEffect('access_denied');

      // On password failure: check if roll check is available as fallback
      if (session.selectedLog?.roll_check || session.selectedLog?.requires_roll) {
        const rollCheck = session.selectedLog.roll_check || {
          difficulty: 10,
          skill: 'Electronics (Computers)'
        };
        session.setRollCheck(rollCheck);
      } else {
        session.goToTerminal();
      }
    },
  });

  // Password authentication for terminal access
  const terminalPasswordAuth = usePasswordAuth({
    correctPassword: '',
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


  // Reset password auth state when selected log changes
  // This prevents stale attempt counts from carrying over between logs
  useEffect(() => {
    logPasswordAuth.reset();
  }, [session.selectedLog?.title]);

  // Reset terminal password auth state when active terminal changes
  useEffect(() => {
    terminalPasswordAuth.reset();
  }, [session.activeTerminal?.code]);

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
      setLocalInitText,
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
        } else if (session.currentView === 'connecting') {
          // Skip the terminal boot animation and jump straight to terminal view
          session.setView('terminal');
        } else if (session.currentView === 'log') {
          // Cancel typing animation and reset state
          if (typingCancelRef.current) {
            typingCancelRef.current();
          }
          setLocalDisplayedText('');
          setLocalTypingComplete(false);
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
    session.setTerminalsLoading(true);
    session.setTerminalsError(null);

    try {
      const codes = await dbHelpers.getUnlockedTerminals();
      session.setUnlockedTerminals(codes);
    } catch (error) {
      console.error('Failed to load unlocked terminals:', error);
      session.setTerminalsError('Unable to sync unlocked terminals. Using cached codes.');
    } finally {
      session.setTerminalsLoading(false);
    }
  };

  // Load terminal logs — shows a themed per-terminal boot screen while loading
  const loadTerminalLogs = async () => {
    if (!session.activeTerminal) return;

    const profile = getTerminalBootProfile(session.activeTerminal.code);

    session.setLogsError(null);
    session.setLogsLoading(true);
    session.setLogData(null);
    session.setView('connecting'); // Show themed boot screen

    try {
      // Run minimum display timer and fetch in parallel — user sees full boot animation
      const minDelay = new Promise<void>((resolve) =>
        setTimeout(resolve, profile.minDisplayMs)
      );
      const fetchData = fetch(session.activeTerminal.logPath)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load logs: ${res.status}`);
          return res.json();
        })
        .then((data) => (Array.isArray(data) ? data : [data]));

      const [, normalizedData] = await Promise.all([minDelay, fetchData]);
      session.setLogData(normalizedData);
      session.setView('terminal');
    } catch (error) {
      console.error('Failed to load logs:', error);
      session.setLogsError('Failed to load logs. Check connection or retry.');
      session.setView('terminal');
      audioManager.playEffect('access_denied');
    } finally {
      session.setLogsLoading(false);
    }
  };

  // Handle access code submission
  const handleAccessCode = async (codeOverride: string | null = null) => {
    const code = (codeOverride || session.inputCode).trim().toUpperCase();

    if (!code) return;

    // Special case: Deep Core terminal
    if (code === 'DEEPCORE') {
      // Clear any lingering state
      session.setActiveTerminal(null);
      session.setSelectedLog(null);
      session.setRequiresPassword(false);
      session.setTerminalPasswordRequired(false);
      session.setRollCheck(null);
      session.setSpecialRollCheck(null);
      // Show Deep Core terminal
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
    session.addCommandToHistory(code);

    // Record terminal access in history
    terminalHistory.recordAccess(terminal.code, terminal.name);

    // Terminal-level roll gate
    if (terminal.requiresRoll) {
      session.setPendingTerminalForRoll(terminal);
      session.setRollCheck({
        difficulty: terminal.requiresRoll,
        skill: 'Electronics (Computers)'
      });
      session.setView('log');
      return;
    }

    // Add to unlocked terminals
    try {
      await dbHelpers.addUnlockedTerminal(code);
      session.addUnlockedTerminal(code);
    } catch (error) {
      console.error('Failed to save unlocked terminal:', error);
    }

    loadTerminalLogs();
  };

  // Helper function to show log content or nested audio logs
  const showLogContent = (log: any) => {
    // Check if log has nested audio logs
    if (log.logs && Array.isArray(log.logs) && log.logs.length > 0) {
      // Show nested audio logs page
      session.setShowAudioLogs(true);
      session.setAudioLogsData(log.logs);
      return;
    }

    // Otherwise, type the content
    if (log.content) {
      setLocalDisplayedText('');
      setLocalTypingComplete(false);
      const cancel = typeTextWithSound(
        log.content,
        setLocalDisplayedText,
        () => setLocalTypingComplete(true),
        { delay: 20 }
      );
      typingCancelRef.current = cancel;
    }
  };

  // Handle log selection
  const handleLogClick = (log: any) => {
    session.setSelectedLog(log);
    setLocalDisplayedText('');
    setLocalTypingComplete(false);
    session.setView('log');

    // Record log as viewed in history
    if (session.activeTerminal && log.title) {
      terminalHistory.recordLogViewed(session.activeTerminal.code, log.title);
    }

    // Check for special audio logs (title contains 'AUDIO LOG')
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

    // PASSWORD FIRST: Check password before roll check
    // This allows password as primary auth with roll as fallback
    if (log.requires_password && log.password) {
      session.setRequiresPassword(true);
      return;
    }

    // Roll check only if no password required
    if (log.roll_check) {
      session.setRollCheck(log.roll_check);
      return;
    }

    // No security - show content directly
    showLogContent(log);
  };

  // Handle roll check result
  const handleRollCheck = (result: DiceRoll) => {
    session.setRollCheck(null);
    // Terminal connect flow
    if (session.pendingTerminalForRoll) {
      if (result.success) {
        audioManager.playEffect('access_granted');
        session.setPendingTerminalForRoll(null);
        loadTerminalLogs();
      } else {
        audioManager.playEffect('access_denied');
        session.setPendingTerminalForRoll(null);
        session.goToInit();
      }
      return;
    }

    if (result.success) {
      audioManager.playEffect('access_granted');

      // Check if log has nested audio logs
      if (session.selectedLog?.logs && Array.isArray(session.selectedLog.logs) && session.selectedLog.logs.length > 0) {
        session.setShowAudioLogs(true);
        session.setAudioLogsData(session.selectedLog.logs);
        return;
      }

      // Otherwise type the content
      if (session.selectedLog?.content) {
        setLocalDisplayedText('');
        setLocalTypingComplete(false);
        const cancel = typeTextWithSound(
          session.selectedLog.content,
          setLocalDisplayedText,
          () => setLocalTypingComplete(true),
          { delay: 20 }
        );
        typingCancelRef.current = cancel;
      }
    } else {
      audioManager.playEffect('access_denied');
      // Roll check is the final fallback after password failure, so go back to terminal
      session.goToTerminal();
    }
  };

  // Handle special roll check result
  const handleSpecialRollCheck = (result: DiceRoll) => {
    session.setSpecialRollCheck(null);

    if (result.success) {
      audioManager.playEffect('access_granted');

      // Check if log has nested audio logs
      if (session.selectedLog?.logs && Array.isArray(session.selectedLog.logs) && session.selectedLog.logs.length > 0) {
        session.setShowAudioLogs(true);
        session.setAudioLogsData(session.selectedLog.logs);
        return;
      }

      // Otherwise type the content
      if (session.selectedLog?.content) {
        setLocalDisplayedText('');
        setLocalTypingComplete(false);
        const cancel = typeTextWithSound(
          session.selectedLog.content,
          setLocalDisplayedText,
          () => setLocalTypingComplete(true),
          { delay: 20 }
        );
        typingCancelRef.current = cancel;
      }
    } else {
      audioManager.playEffect('access_denied');

      // On failure: check if password is available as fallback
      if (session.selectedLog?.requires_password && session.selectedLog?.password) {
        session.setRequiresPassword(true);
      } else {
        session.goToTerminal();
      }
    }
  };

  // Command history navigation for access code input
  const handleInitInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const recalled = session.recallHistory('back');
      session.setInputCode(recalled);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const recalled = session.recallHistory('forward');
      session.setInputCode(recalled);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleAccessCode(null);
    }
  };

  // Render Deep Core terminal (always takes priority)
  if (session.showDeepCore) {
    return <DeepCoreTerminal onBack={() => {
      session.setShowDeepCore(false);
      session.goToInit();
    }} />;
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
    <div className="h-screen bg-background crt-container overflow-hidden">
      <SignalInterference
        level={session.signalInterferenceLevel}
        terminalType={session.activeTerminal ? 'corrupted' : 'normal'}
        soundEnabled={!audioManager.isMuted()}
      />

      {/* Loading View — initial app boot */}
      {session.currentView === 'loading' && (
        <LoadingScreen
          initText={localInitText}
          onSkip={() => session.setView('init')}
        />
      )}

      {/* Connecting View — per-terminal themed boot screen */}
      {session.currentView === 'connecting' && session.activeTerminal && (
        <TerminalBootScreen terminal={session.activeTerminal} />
      )}

      {/* Init View */}
      {session.currentView === 'init' && (
      <InitScreen
        inputCode={session.inputCode}
        onCodeChange={session.setInputCode}
        onSubmit={() => handleAccessCode(null)}
        unlockedTerminals={unlockedTerminalsList}
        loading={session.terminalsLoading}
        statusMessage="Use ARROW UP/DOWN to recall previous access codes."
        errorMessage={session.terminalsError}
        onKeyDown={handleInitInputKeyDown}
        onTerminalSelect={(code) => {
          session.setInputCode(code);
          handleAccessCode(code);
        }}
      />
      )}

      {/* Terminal/Log View */}
      {(session.currentView === 'terminal' || session.currentView === 'log') && (
        <div className="h-full p-3 sm:p-6 3xl:p-10">
          <div
            className={`${
              session.activeTerminal
                ? getTerminalEffectClasses(session.activeTerminal.logPath)
                : "terminal terminal-flicker"
            } h-full overflow-auto relative bg-background/20 border border-primary/30 p-3 sm:p-6 3xl:p-8`}
            ref={terminalRef}
          >
            {session.logsLoading && !session.terminalPasswordRequired && (
              <div className="mb-4 p-3 text-sm font-mono border border-primary/30 rounded bg-background/60">
                Synchronizing terminal logs...
              </div>
            )}

            {session.logsError && !session.logsLoading && !session.terminalPasswordRequired && (
              <div className="mb-4 p-3 text-sm font-mono border border-red-500/40 rounded bg-red-900/40 text-red-100">
                {session.logsError}
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadTerminalLogs}>
                    Retry
                  </Button>
                  <Button variant="outline" size="sm" onClick={session.goToInit}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Terminal Password Prompt */}
            {session.terminalPasswordRequired && !session.showDeepCore && (
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
            {session.specialRollCheck && !session.terminalPasswordRequired && !session.showDeepCore && (
                <RollCheckPrompt
                  difficulty={session.specialRollCheck.difficulty}
                  skill={session.specialRollCheck.skill}
                  subject={session.selectedLog?.title || 'this file'}
                  onRollResult={handleSpecialRollCheck}
                  onBack={session.goToTerminal}
                />
            )}

            {/* Standard Roll Check */}
            {session.rollCheck && !session.terminalPasswordRequired && !session.specialRollCheck && !session.showDeepCore && (
                <RollCheckPrompt
                  difficulty={session.rollCheck.difficulty}
                  skill="Electronics (Computers)"
                  subject={session.selectedLog?.title || 'this file'}
                  onRollResult={handleRollCheck}
                  onBack={session.goToTerminal}
                />
            )}

            {/* Log Password Prompt */}
            {session.requiresPassword &&
             !session.terminalPasswordRequired &&
             !session.rollCheck &&
             !session.specialRollCheck &&
             !session.showDeepCore && (
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
                displayedText={localDisplayedText}
                typingComplete={localTypingComplete}
                onBack={session.goToTerminal}
                terminalCode={session.activeTerminal?.code || ''}
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
             !session.terminalPasswordRequired &&
             !session.logsLoading &&
             !session.logsError && (
              <p className="p-4 text-sm">ENTER ACCESS CODE TO PROCEED</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
