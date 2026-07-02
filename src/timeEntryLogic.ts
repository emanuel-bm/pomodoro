import type { CycleType, HistoryEntry, Settings } from '@/types';
import { getPlannedDurationSeconds } from '@/cycleLogic';

export interface TimeTriangleState {
  cycleType: CycleType;
  durationMinutes: number;
  start: Date;
  end: Date;
  startTouched: boolean;
  durationTouched: boolean;
}

function atMinuteBoundary(date: Date): Date {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return d;
}

function minutesBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

function defaultDurationMinutes(cycleType: CycleType, settings: Settings): number {
  return getPlannedDurationSeconds(
    cycleType,
    settings.focusMinutes,
    settings.shortBreakMinutes,
    settings.longBreakMinutes
  ) / 60;
}

export function initTriangleDefault(
  cycleType: CycleType,
  settings: Settings
): TimeTriangleState {
  const durationMinutes = defaultDurationMinutes(cycleType, settings);
  const end = atMinuteBoundary(new Date());
  const start = new Date(end.getTime() - durationMinutes * 60000);
  return {
    cycleType,
    durationMinutes,
    start,
    end,
    startTouched: false,
    durationTouched: false,
  };
}

export function initTriangleFromEntry(entry: HistoryEntry): TimeTriangleState {
  return {
    cycleType: entry.cycleType,
    durationMinutes: entry.recordedDurationSeconds / 60,
    start: new Date(entry.startedAt),
    end: new Date(entry.endedAt),
    startTouched: true,
    durationTouched: true,
  };
}

export function applyDurationEdit(
  state: TimeTriangleState,
  newDurationMinutes: number
): TimeTriangleState {
  if (!state.startTouched) {
    const end = atMinuteBoundary(new Date());
    const start = new Date(end.getTime() - newDurationMinutes * 60000);
    return {
      ...state,
      durationMinutes: newDurationMinutes,
      start,
      end,
      durationTouched: true,
    };
  }
  const end = new Date(state.start.getTime() + newDurationMinutes * 60000);
  return {
    ...state,
    durationMinutes: newDurationMinutes,
    end,
    durationTouched: true,
  };
}

export function applyStartEdit(state: TimeTriangleState, newStart: Date): TimeTriangleState {
  const start = atMinuteBoundary(newStart);
  return {
    ...state,
    start,
    durationMinutes: minutesBetween(start, state.end),
    startTouched: true,
  };
}

export function applyEndEdit(state: TimeTriangleState, newEnd: Date): TimeTriangleState {
  const end = atMinuteBoundary(newEnd);
  return {
    ...state,
    end,
    durationMinutes: minutesBetween(state.start, end),
  };
}

export function applyTypeChange(
  state: TimeTriangleState,
  newType: CycleType,
  settings: Settings
): TimeTriangleState {
  if (!state.durationTouched && !state.startTouched) {
    const durationMinutes = defaultDurationMinutes(newType, settings);
    const end = atMinuteBoundary(new Date());
    const start = new Date(end.getTime() - durationMinutes * 60000);
    return {
      ...state,
      cycleType: newType,
      durationMinutes,
      start,
      end,
    };
  }
  return { ...state, cycleType: newType };
}

export function computePlannedBaselineSeconds(
  cycleType: CycleType,
  settings: Settings,
  existingEntry: HistoryEntry | null,
  typeChanged: boolean
): number {
  if (!existingEntry || typeChanged) {
    return getPlannedDurationSeconds(
      cycleType,
      settings.focusMinutes,
      settings.shortBreakMinutes,
      settings.longBreakMinutes
    );
  }
  return existingEntry.plannedDurationSeconds;
}

export function buildHistoryEntryFromTriangle(
  state: TimeTriangleState,
  plannedDurationSeconds: number,
  existingId?: string
): HistoryEntry {
  const recordedDurationSeconds = state.durationMinutes * 60;
  return {
    id: existingId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    cycleType: state.cycleType,
    plannedDurationSeconds,
    actualDurationSeconds: recordedDurationSeconds,
    recordedDurationSeconds,
    hadOvertime: recordedDurationSeconds > plannedDurationSeconds,
    startedAt: state.start.toISOString(),
    endedAt: state.end.toISOString(),
  };
}

export function isValidTriangle(state: TimeTriangleState): boolean {
  return state.durationMinutes >= 1 && state.end.getTime() > state.start.getTime();
}
