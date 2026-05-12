export type ActionCategory = 'door_unlock' | 'system_override' | 'data_extraction' | 'airlock';

export interface AutoStep {
  type: 'auto';
  lines: string[];
  delay?: number; // ms per character, default 30
  sound?: string; // sound effect name to play
  sound_at_line?: number; // play sound when this line index starts (0-based)
  pause_after?: number; // ms to pause after step completes, default 500
}

export interface PromptStep {
  type: 'prompt';
  prompt_text: string;
  accept: string[]; // accepted answers (case-insensitive)
  reject_message?: string;
  max_attempts?: number; // default 3
  sound_on_accept?: string;
  sound_on_reject?: string;
}

export interface ProgressStep {
  type: 'progress';
  label: string; // e.g. "DOWNLOADING ENCRYPTED DATA..."
  duration?: number; // ms, default 3000
  segments?: number; // progress bar segments, default 20
  sound_on_complete?: string;
  complete_message?: string; // e.g. "DOWNLOAD COMPLETE"
}

export interface ChoiceStep {
  type: 'choice';
  prompt_text: string;
  options: string[]; // numbered options displayed to player
  correct?: number[]; // indices of accepted answers (0-based). If omitted, all are valid.
  reject_message?: string;
  max_attempts?: number; // default 3
  sound_on_accept?: string;
  sound_on_reject?: string;
}

/** Renders a clickable numeric keypad. Player taps digits and hits ENTER. */
export interface KeypadStep {
  type: 'keypad';
  label?: string; // e.g. "ENTER ACCESS CODE:"
  accept: string[]; // correct code strings (e.g. ["1234", "0042"])
  code_length?: number; // how many digits before auto-submit (optional)
  mask?: boolean; // show ● instead of digits while typing
  reject_message?: string;
  max_attempts?: number; // default 3
  sound_on_accept?: string;
  sound_on_reject?: string;
}

/** A live countdown timer. Auto-advances when it reaches zero. */
export interface CountdownStep {
  type: 'countdown';
  label?: string; // e.g. "LOCKDOWN ACTIVATING IN:"
  seconds: number; // starting value
  tick_sound?: boolean; // play keypress sound each second
  warning_at?: number; // seconds remaining when warning color kicks in, default 5
  complete_message?: string;
  pause_after?: number;
}

/** A grid of labelled status indicators that animate in then optionally transition. */
export interface StatusPanelStep {
  type: 'status_panel';
  label?: string; // panel header, e.g. "DOOR STATUS"
  indicators: StatusIndicator[];
  /** If set, after stagger_delay ms each indicator transitions to these values. */
  transition_to?: StatusIndicator[];
  stagger_delay?: number; // ms between each indicator appearing, default 200
  transition_delay?: number; // ms before starting the transition, default 1000
  pause_after?: number;
}

export interface StatusIndicator {
  name: string;
  value: string;
  /** 'ok' = green · 'warning' = amber · 'error' = red · 'neutral' = dim */
  status: 'ok' | 'warning' | 'error' | 'neutral';
}

/** Flashes the screen red and plays an alarm sound for `duration` ms. */
export interface AlarmStep {
  type: 'alarm';
  message?: string; // large header text, e.g. "SECURITY BREACH"
  lines?: string[]; // scrolling detail lines beneath the header
  duration?: number; // ms, default 2000
  sound?: string; // default 'warning'
  pause_after?: number;
}

export type SequenceStep =
  | AutoStep
  | PromptStep
  | ProgressStep
  | ChoiceStep
  | KeypadStep
  | CountdownStep
  | StatusPanelStep
  | AlarmStep;

export interface SequenceOutcome {
  message: string;
  sound?: string;
  persist_key?: string; // key to save in completed actions
}

export interface ActionSequence {
  id: string;
  category: ActionCategory;
  steps: SequenceStep[];
  on_complete: SequenceOutcome;
  on_failure?: SequenceOutcome;
}

