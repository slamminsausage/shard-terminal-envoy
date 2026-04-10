export type ActionCategory = 'door_unlock' | 'system_override' | 'data_extraction';

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

export type SequenceStep = AutoStep | PromptStep | ProgressStep | ChoiceStep;

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
