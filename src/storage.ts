import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings, HistoryEntry } from './types';
import { DEFAULT_SETTINGS } from './types';

const SETTINGS_KEY = '@pomodoro/settings';
const HISTORY_KEY = '@pomodoro/history';
const TIMER_STATE_KEY = '@pomodoro/timer_state';

export async function loadSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data) as Partial<Settings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load history:', e);
  }
  return [];
}

export async function saveHistory(history: HistoryEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save history:', e);
  }
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const history = await loadHistory();
  history.unshift(entry);
  await saveHistory(history);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const history = await loadHistory();
  const filtered = history.filter((e) => e.id !== id);
  await saveHistory(filtered);
}

export interface PersistedTimerState {
  cycleType: string;
  status: string;
  startedAt: number | null;
  pausedAt: number | null;
  elapsedSeconds: number;
  plannedDurationSeconds: number;
  currentFocusCount: number;
}

export async function loadTimerState(): Promise<PersistedTimerState | null> {
  try {
    const data = await AsyncStorage.getItem(TIMER_STATE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load timer state:', e);
  }
  return null;
}

export async function saveTimerState(state: PersistedTimerState): Promise<void> {
  try {
    await AsyncStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save timer state:', e);
  }
}

export async function clearTimerState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TIMER_STATE_KEY);
  } catch (e) {
    console.warn('Failed to clear timer state:', e);
  }
}
