import type { CycleType } from './types';

const CYCLE_SEQUENCE: CycleType[] = [
  'focus',
  'short_break',
  'focus',
  'short_break',
  'focus',
  'short_break',
  'focus',
  'long_break',
];

export function getNextCycleType(
  currentType: CycleType,
  currentFocusCount: number,
  longBreakInterval: number
): CycleType {
  const idx = CYCLE_SEQUENCE.indexOf(currentType);
  if (idx === -1) return 'focus';

  const nextIdx = (idx + 1) % CYCLE_SEQUENCE.length;
  return CYCLE_SEQUENCE[nextIdx];
}

export function getCycleProgress(
  cycleType: CycleType,
  currentFocusCount: number,
  longBreakInterval: number
): { current: number; total: number } {
  if (cycleType === 'focus') {
    return { current: currentFocusCount, total: longBreakInterval };
  }
  if (cycleType === 'short_break') {
    return { current: currentFocusCount, total: longBreakInterval };
  }
  if (cycleType === 'long_break') {
    return { current: longBreakInterval, total: longBreakInterval };
  }
  return { current: 1, total: 1 };
}

export function getPlannedDurationSeconds(
  cycleType: CycleType,
  focusMinutes: number,
  shortBreakMinutes: number,
  longBreakMinutes: number
): number {
  switch (cycleType) {
    case 'focus':
      return focusMinutes * 60;
    case 'short_break':
      return shortBreakMinutes * 60;
    case 'long_break':
      return longBreakMinutes * 60;
    default:
      return focusMinutes * 60;
  }
}

export function getCycleLabel(cycleType: CycleType): string {
  switch (cycleType) {
    case 'focus':
      return 'Focus';
    case 'short_break':
      return 'Short Break';
    case 'long_break':
      return 'Long Break';
    default:
      return 'Focus';
  }
}
