export type CycleType = 'focus' | 'short_break' | 'long_break';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'overtime';

export interface Settings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartNextCycle: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface HistoryEntry {
  id: string;
  cycleType: CycleType;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  recordedDurationSeconds: number;
  hadOvertime: boolean;
  startedAt: string;
  endedAt: string;
}

export interface TimerState {
  cycleType: CycleType;
  status: TimerStatus;
  startedAt: number | null;
  pausedAt: number | null;
  elapsedSeconds: number;
  plannedDurationSeconds: number;
  currentFocusCount: number;
}

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartNextCycle: false,
  soundEnabled: true,
  vibrationEnabled: true,
};
