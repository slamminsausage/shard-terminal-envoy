/**
 * useTerminalSession Hook
 *
 * Manages the complete terminal session state.
 * Reduces 23+ individual useState calls to organized groups.
 *
 * State Groups:
 * - View state (loading, init, terminal, log)
 * - Terminal state (active terminal, logs, text)
 * - Security state (passwords, roll checks)
 * - Special views (deep core, audio logs)
 * - UI effects (interference, glitches)
 */

import { useState, useCallback, useRef } from 'react';
import { TerminalDefinition } from '@/lib/terminals';

type ViewType = 'loading' | 'init' | 'connecting' | 'terminal' | 'log';

interface LogEntry {
  title: string;
  content?: string;
  audio_file?: string;
  date?: string;
  author?: string;
  location?: string;
  security_level?: string;
  requires_password?: boolean;
  password?: string;
  attemptsAllowed?: number;
  requires_roll?: boolean;
  special_roll_check?: {
    difficulty: number;
    skill: string;
  };
  roll_check?: {
    difficulty: number;
    skill?: string;
  };
  logs?: any[];
}

interface TerminalSessionState {
  // View state
  currentView: ViewType;
  initText: string;
  initComplete: boolean;
  inputCode: string;
  pendingTerminalForRoll: TerminalDefinition | null;

  // Terminal state
  activeTerminal: TerminalDefinition | null;
  terminalData: string;
  logData: LogEntry[] | null;
  selectedLog: LogEntry | null;
  displayedText: string;
  typingComplete: boolean;

  // Security state
  rollCheck: any | null;
  specialRollCheck: any | null;
  requiresPassword: boolean;
  passwordAttempts: number;
  terminalPasswordRequired: boolean;
  terminalPasswordAttempts: number;

  // Special views
  showDeepCore: boolean;
  showAudioLogs: boolean;
  audioLogsData: any[];

  // UI effects
  signalInterferenceLevel: number;

  // Unlocked terminals
  unlockedTerminals: string[];
  terminalsLoading: boolean;
  terminalsError: string | null;

  // Async state for logs
  logsLoading: boolean;
  logsError: string | null;

  // Command history (access codes)
  commandHistory: string[];
  historyIndex: number;
}

interface TerminalSessionActions {
  // View navigation
  setView: (view: ViewType) => void;
  setInitText: (text: string) => void;
  setInitComplete: (complete: boolean) => void;
  setInputCode: (code: string) => void;
  setPendingTerminalForRoll: (terminal: TerminalDefinition | null) => void;

  // Terminal management
  setActiveTerminal: (terminal: TerminalDefinition | null) => void;
  setTerminalData: (data: string) => void;
  setLogData: (logs: LogEntry[] | null) => void;
  setSelectedLog: (log: LogEntry | null) => void;
  setDisplayedText: (text: string) => void;
  setTypingComplete: (complete: boolean) => void;

  // Security
  setRollCheck: (check: any | null) => void;
  setSpecialRollCheck: (check: any | null) => void;
  setRequiresPassword: (required: boolean) => void;
  incrementPasswordAttempts: () => void;
  resetPasswordAttempts: () => void;
  setTerminalPasswordRequired: (required: boolean) => void;
  incrementTerminalPasswordAttempts: () => void;
  resetTerminalPasswordAttempts: () => void;

  // Special views
  setShowDeepCore: (show: boolean) => void;
  setShowAudioLogs: (show: boolean) => void;
  setAudioLogsData: (data: any[]) => void;

  // UI effects
  setSignalInterferenceLevel: (level: number) => void;

  // Unlocked terminals
  setUnlockedTerminals: (terminals: string[]) => void;
  addUnlockedTerminal: (code: string) => void;
  setTerminalsLoading: (loading: boolean) => void;
  setTerminalsError: (message: string | null) => void;
  setLogsLoading: (loading: boolean) => void;
  setLogsError: (message: string | null) => void;

  // Command history
  addCommandToHistory: (command: string) => void;
  recallHistory: (direction: 'back' | 'forward') => string;

  // Utility actions
  resetSession: () => void;
  goToInit: () => void;
  goToTerminal: () => void;
}

const initialState: TerminalSessionState = {
  currentView: 'loading',
  initText: '',
  initComplete: false,
  inputCode: '',
  pendingTerminalForRoll: null,
  activeTerminal: null,
  terminalData: '',
  logData: null,
  selectedLog: null,
  displayedText: '',
  typingComplete: false,
  rollCheck: null,
  specialRollCheck: null,
  requiresPassword: false,
  passwordAttempts: 0,
  terminalPasswordRequired: false,
  terminalPasswordAttempts: 0,
  showDeepCore: false,
  showAudioLogs: false,
  audioLogsData: [],
  signalInterferenceLevel: 0,
  unlockedTerminals: [],
  terminalsLoading: true,
  terminalsError: null,
  logsLoading: false,
  logsError: null,
  commandHistory: [],
  historyIndex: -1,
};

export function useTerminalSession(): TerminalSessionState & TerminalSessionActions {
  const [state, setState] = useState<TerminalSessionState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // View navigation
  const setView = useCallback((view: ViewType) => {
    setState((prev) => ({ ...prev, currentView: view }));
  }, []);

  const setInitText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, initText: text }));
  }, []);

  const setInitComplete = useCallback((complete: boolean) => {
    setState((prev) => ({ ...prev, initComplete: complete }));
  }, []);

  const setInputCode = useCallback((code: string) => {
    setState((prev) => ({ ...prev, inputCode: code, historyIndex: -1 }));
  }, []);

  const setPendingTerminalForRoll = useCallback((terminal: TerminalDefinition | null) => {
    setState((prev) => ({ ...prev, pendingTerminalForRoll: terminal }));
  }, []);

  // Terminal management
  const setActiveTerminal = useCallback((terminal: TerminalDefinition | null) => {
    setState((prev) => ({ ...prev, activeTerminal: terminal }));
  }, []);

  const setTerminalData = useCallback((data: string) => {
    setState((prev) => ({ ...prev, terminalData: data }));
  }, []);

  const setLogData = useCallback((logs: LogEntry[] | null) => {
    setState((prev) => ({ ...prev, logData: logs }));
  }, []);

  const setSelectedLog = useCallback((log: LogEntry | null) => {
    setState((prev) => ({ ...prev, selectedLog: log }));
  }, []);

  const setDisplayedText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, displayedText: text }));
  }, []);

  const setTypingComplete = useCallback((complete: boolean) => {
    setState((prev) => ({ ...prev, typingComplete: complete }));
  }, []);

  // Security
  const setRollCheck = useCallback((check: any | null) => {
    setState((prev) => ({ ...prev, rollCheck: check }));
  }, []);

  const setSpecialRollCheck = useCallback((check: any | null) => {
    setState((prev) => ({ ...prev, specialRollCheck: check }));
  }, []);

  const setRequiresPassword = useCallback((required: boolean) => {
    setState((prev) => ({ ...prev, requiresPassword: required }));
  }, []);

  const incrementPasswordAttempts = useCallback(() => {
    setState((prev) => ({ ...prev, passwordAttempts: prev.passwordAttempts + 1 }));
  }, []);

  const resetPasswordAttempts = useCallback(() => {
    setState((prev) => ({ ...prev, passwordAttempts: 0 }));
  }, []);

  const setTerminalPasswordRequired = useCallback((required: boolean) => {
    setState((prev) => ({ ...prev, terminalPasswordRequired: required }));
  }, []);

  const incrementTerminalPasswordAttempts = useCallback(() => {
    setState((prev) => ({
      ...prev,
      terminalPasswordAttempts: prev.terminalPasswordAttempts + 1,
    }));
  }, []);

  const resetTerminalPasswordAttempts = useCallback(() => {
    setState((prev) => ({ ...prev, terminalPasswordAttempts: 0 }));
  }, []);

  // Special views
  const setShowDeepCore = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showDeepCore: show }));
  }, []);

  const setShowAudioLogs = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showAudioLogs: show }));
  }, []);

  const setAudioLogsData = useCallback((data: any[]) => {
    setState((prev) => ({ ...prev, audioLogsData: data }));
  }, []);

  // UI effects
  const setSignalInterferenceLevel = useCallback((level: number) => {
    setState((prev) => ({ ...prev, signalInterferenceLevel: level }));
  }, []);

  // Unlocked terminals
  const setUnlockedTerminals = useCallback((terminals: string[]) => {
    setState((prev) => ({ ...prev, unlockedTerminals: terminals }));
  }, []);

  const addUnlockedTerminal = useCallback((code: string) => {
    setState((prev) => ({
      ...prev,
      unlockedTerminals: prev.unlockedTerminals.includes(code)
        ? prev.unlockedTerminals
        : [...prev.unlockedTerminals, code],
    }));
  }, []);

  const setTerminalsLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, terminalsLoading: loading }));
  }, []);

  const setTerminalsError = useCallback((message: string | null) => {
    setState((prev) => ({ ...prev, terminalsError: message }));
  }, []);

  const setLogsLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, logsLoading: loading }));
  }, []);

  const setLogsError = useCallback((message: string | null) => {
    setState((prev) => ({ ...prev, logsError: message }));
  }, []);

  const addCommandToHistory = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    setState((prev) => {
      const filtered = prev.commandHistory.filter((item) => item !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 20);
      return { ...prev, commandHistory: updated, historyIndex: -1 };
    });
  }, []);

  const recallHistory = useCallback((direction: 'back' | 'forward') => {
    const cur = stateRef.current;
    if (cur.commandHistory.length === 0) return '';

    const maxIndex = cur.commandHistory.length - 1;
    let nextIndex = cur.historyIndex;

    if (direction === 'back') {
      nextIndex = Math.min(maxIndex, cur.historyIndex + 1);
    } else {
      nextIndex = Math.max(-1, cur.historyIndex - 1);
    }

    const recalled = nextIndex >= 0 ? cur.commandHistory[nextIndex] : '';
    setState((prev) => ({ ...prev, historyIndex: nextIndex }));
    return recalled;
  }, []);

  // Utility actions
  const resetSession = useCallback(() => {
    setState(initialState);
  }, []);

  const goToInit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentView: 'init',
      activeTerminal: null,
      logData: null,
      selectedLog: null,
      displayedText: '',
      typingComplete: false,
      pendingTerminalForRoll: null,
      rollCheck: null,
      specialRollCheck: null,
      requiresPassword: false,
      passwordAttempts: 0,
      terminalPasswordRequired: false,
      terminalPasswordAttempts: 0,
    }));
  }, []);

  const goToTerminal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentView: 'terminal',
      selectedLog: null,
      displayedText: '',
      typingComplete: false,
      pendingTerminalForRoll: null,
      rollCheck: null,
      specialRollCheck: null,
      requiresPassword: false,
      passwordAttempts: 0,
    }));
  }, []);

  return {
    ...state,
    setView,
    setInitText,
    setInitComplete,
    setInputCode,
    setPendingTerminalForRoll,
    setActiveTerminal,
    setTerminalData,
    setLogData,
    setSelectedLog,
    setDisplayedText,
    setTypingComplete,
    setRollCheck,
    setSpecialRollCheck,
    setRequiresPassword,
    incrementPasswordAttempts,
    resetPasswordAttempts,
    setTerminalPasswordRequired,
    incrementTerminalPasswordAttempts,
    resetTerminalPasswordAttempts,
    setShowDeepCore,
    setShowAudioLogs,
    setAudioLogsData,
    setSignalInterferenceLevel,
    setUnlockedTerminals,
    addUnlockedTerminal,
    setTerminalsLoading,
    setTerminalsError,
    setLogsLoading,
    setLogsError,
    addCommandToHistory,
    recallHistory,
    resetSession,
    goToInit,
    goToTerminal,
  };
}
