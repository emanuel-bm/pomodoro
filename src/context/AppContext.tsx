import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer } from 'expo-audio';
import { useTimer } from 'react-timer-hook';
import type { CycleType, HistoryEntry, Settings, TimerState, TimerStatus } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import {
  loadHistory,
  loadSettings,
  loadTimerState,
  saveHistory,
  saveSettings,
  saveTimerState,
  clearTimerState,
  addHistoryEntry,
  deleteHistoryEntry,
} from '@/storage';
import {
  getNextCycleType,
  getPlannedDurationSeconds,
  getCycleLabel,
} from '@/cycleLogic';
import {
  showTimerNotification,
  dismissTimerNotification,
  setTimerNotificationHandlers,
  setupNotificationResponseListener,
  initNotifications,
} from '@/notifications';

const TICK_INTERVAL_MS = 100;

interface AppContextValue {
  settings: Settings;
  history: HistoryEntry[];
  timerState: TimerState;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  startCycle: () => void;
  pauseCycle: () => void;
  resumeCycle: () => void;
  resetCycle: () => void;
  finishCycle: (recordOvertime: boolean) => void;
  deleteHistoryItem: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  elapsedSeconds: number;
  remainingSeconds: number;
  isOvertime: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function getExpiryForRunning(startedAt: number, plannedSeconds: number): Date {
  return new Date((startedAt + plannedSeconds) * 1000);
}

function getExpiryForPaused(elapsedSeconds: number, plannedSeconds: number): Date {
  const remaining = plannedSeconds - elapsedSeconds;
  return new Date(Date.now() + remaining * 1000);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [timerState, setTimerState] = useState<TimerState>({
    cycleType: 'focus',
    status: 'idle',
    startedAt: null,
    pausedAt: null,
    elapsedSeconds: 0,
    plannedDurationSeconds: 25 * 60,
    currentFocusCount: 1,
  });
  const overtimeNotifiedRef = useRef(false);
  const timerStateRef = useRef(timerState);
  const loadedFromPersistenceRef = useRef(false);
  timerStateRef.current = timerState;

  const defaultExpiry = new Date(Date.now() + 25 * 60 * 1000);

  const handleExpire = useCallback(() => {
    overtimeNotifiedRef.current = true;
    if (settings.soundEnabled) {
      try {
        const player = createAudioPlayer(
          { uri: 'https://assets.mixkit.co/active_storage/sfx/2869-pop-up-notification-alert-2869.mp3' },
          { downloadFirst: true }
        );
        player.play();
      } catch (_) {}
    }
    if (settings.vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setTimerState((s) => {
      const next = { ...s, status: 'overtime' as const };
      saveTimerState({
        cycleType: next.cycleType,
        status: next.status,
        startedAt: next.startedAt,
        pausedAt: next.pausedAt,
        elapsedSeconds: next.elapsedSeconds,
        plannedDurationSeconds: next.plannedDurationSeconds,
        currentFocusCount: next.currentFocusCount,
      });
      return next;
    });
  }, [settings.soundEnabled, settings.vibrationEnabled]);

  const timer = useTimer({
    expiryTimestamp: defaultExpiry,
    onExpire: handleExpire,
    autoStart: false,
    interval: TICK_INTERVAL_MS,
  });

  const persistTimerState = useCallback((state: TimerState) => {
    if (state.status === 'idle') {
      clearTimerState();
    } else {
      saveTimerState({
        cycleType: state.cycleType,
        status: state.status,
        startedAt: state.startedAt,
        pausedAt: state.pausedAt,
        elapsedSeconds: state.elapsedSeconds,
        plannedDurationSeconds: state.plannedDurationSeconds,
        currentFocusCount: state.currentFocusCount,
      });
    }
  }, []);

  const computeElapsedFromTimestamps = useCallback(() => {
    const state = timerStateRef.current;
    const now = Date.now() / 1000;
    if (state.status === 'overtime' && state.startedAt != null) {
      return Math.floor(now - state.startedAt);
    }
    if (state.status === 'paused' && state.pausedAt != null) {
      return state.elapsedSeconds;
    }
    return state.elapsedSeconds;
  }, []);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const isOvertime =
    timerState.status === 'overtime' ||
    (timerState.status === 'paused' &&
      timerState.elapsedSeconds >= timerState.plannedDurationSeconds);

  useEffect(() => {
    loadSettings().then(setSettings);
    loadHistory().then(setHistory);
  }, []);

  useEffect(() => {
    loadTimerState().then((persisted) => {
      if (!persisted) return;
      loadedFromPersistenceRef.current = true;
      const state: TimerState = {
        cycleType: persisted.cycleType as CycleType,
        status: persisted.status as TimerStatus,
        startedAt: persisted.startedAt,
        pausedAt: persisted.pausedAt,
        elapsedSeconds: persisted.elapsedSeconds,
        plannedDurationSeconds: persisted.plannedDurationSeconds,
        currentFocusCount: persisted.currentFocusCount,
      };
      setTimerState(state);
    });
  }, []);

  useEffect(() => {
    if (!loadedFromPersistenceRef.current) return;
    loadedFromPersistenceRef.current = false;

    const { status, startedAt, elapsedSeconds: elapsed, plannedDurationSeconds: planned } = timerState;
    const isPausedOvertime = status === 'paused' && elapsed >= planned;
    if (status === 'running' && startedAt != null) {
      timer.restart(getExpiryForRunning(startedAt, planned), true);
    } else if (status === 'paused' && !isPausedOvertime) {
      timer.restart(getExpiryForPaused(elapsed, planned), false);
    }
  }, [timerState.status, timerState.startedAt, timerState.elapsedSeconds, timerState.plannedDurationSeconds, timer]);

  useEffect(() => {
    const isPausedOvertime =
      timerState.status === 'paused' &&
      timerState.elapsedSeconds >= timerState.plannedDurationSeconds;
    if (isPausedOvertime) {
      setElapsedSeconds(timerState.elapsedSeconds);
      setRemainingSeconds(0);
    } else if (timerState.status === 'running' || timerState.status === 'paused') {
      setRemainingSeconds(timer.totalSeconds);
      setElapsedSeconds(timerState.plannedDurationSeconds - timer.totalSeconds);
    } else if (timerState.status === 'idle') {
      const planned = getPlannedDurationSeconds(
        timerState.cycleType,
        settings.focusMinutes,
        settings.shortBreakMinutes,
        settings.longBreakMinutes
      );
      setRemainingSeconds(planned);
      setElapsedSeconds(0);
    }
  }, [
    timer.totalSeconds,
    timerState.status,
    timerState.plannedDurationSeconds,
    timerState.elapsedSeconds,
    timerState.cycleType,
    settings.focusMinutes,
    settings.shortBreakMinutes,
    settings.longBreakMinutes,
  ]);

  useEffect(() => {
    if (timerState.status !== 'overtime') return;
    const tick = () => {
      const elapsed = computeElapsedFromTimestamps();
      setElapsedSeconds(elapsed);
      setRemainingSeconds(0);
    };
    tick();
    const id = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [timerState.status, computeElapsedFromTimestamps]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active' && timerState.status === 'overtime') {
        const elapsed = computeElapsedFromTimestamps();
        setElapsedSeconds(elapsed);
      }
    });
    return () => sub.remove();
  }, [timerState.status, computeElapsedFromTimestamps]);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const startCycle = useCallback(() => {
    overtimeNotifiedRef.current = false;
    const planned = getPlannedDurationSeconds(
      timerState.cycleType,
      settings.focusMinutes,
      settings.shortBreakMinutes,
      settings.longBreakMinutes
    );
    const startedAt = Date.now() / 1000;
    const nextState: TimerState = {
      cycleType: timerState.cycleType,
      status: 'running',
      startedAt,
      pausedAt: null,
      elapsedSeconds: 0,
      plannedDurationSeconds: planned,
      currentFocusCount: timerState.currentFocusCount,
    };
    setTimerState(nextState);
    persistTimerState(nextState);
    timer.restart(getExpiryForRunning(startedAt, planned), true);
  }, [timerState.cycleType, timerState.currentFocusCount, settings, persistTimerState, timer]);

  const pauseCycle = useCallback(() => {
    const elapsed =
      timerState.status === 'overtime'
        ? computeElapsedFromTimestamps()
        : timerState.plannedDurationSeconds - timer.totalSeconds;
    const next: TimerState = {
      ...timerState,
      status: 'paused',
      pausedAt: Date.now() / 1000,
      elapsedSeconds: elapsed,
    };
    setTimerState(next);
    persistTimerState(next);
    if (timerState.status !== 'overtime') {
      timer.pause();
    }
  }, [timerState, timer, persistTimerState, computeElapsedFromTimestamps]);

  const resumeCycle = useCallback(() => {
    const isResumingFromOvertime =
      timerState.elapsedSeconds >= timerState.plannedDurationSeconds;
    const next: TimerState = {
      ...timerState,
      status: isResumingFromOvertime ? 'overtime' : 'running',
      startedAt: Date.now() / 1000 - timerState.elapsedSeconds,
      pausedAt: null,
      elapsedSeconds: timerState.elapsedSeconds,
    };
    setTimerState(next);
    persistTimerState(next);
    if (!isResumingFromOvertime) {
      timer.resume();
    }
  }, [timerState, timer, persistTimerState]);

  const resetCycle = useCallback(() => {
    setTimerState((s) => ({
      ...s,
      status: 'idle',
      startedAt: null,
      pausedAt: null,
      elapsedSeconds: 0,
    }));
    clearTimerState();
  }, []);

  const finishCycle = useCallback(
    (recordOvertime: boolean) => {
      const isPausedOvertime =
        timerState.status === 'paused' &&
        timerState.elapsedSeconds >= timerState.plannedDurationSeconds;
      const elapsed =
        timerState.status === 'overtime'
          ? computeElapsedFromTimestamps()
          : isPausedOvertime
            ? timerState.elapsedSeconds
            : timerState.plannedDurationSeconds - timer.totalSeconds;
      const planned = timerState.plannedDurationSeconds;
      const recorded = recordOvertime ? elapsed : Math.min(elapsed, planned);
      const hadOvertime = elapsed > planned;

      const startedAt = timerState.startedAt ?? Date.now() / 1000;
      const endedAt = Date.now() / 1000;

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        cycleType: timerState.cycleType,
        plannedDurationSeconds: planned,
        actualDurationSeconds: elapsed,
        recordedDurationSeconds: recorded,
        hadOvertime,
        startedAt: new Date(startedAt * 1000).toISOString(),
        endedAt: new Date(endedAt * 1000).toISOString(),
      };
      addHistoryEntry(entry);
      setHistory((h) => [entry, ...h]);

      const nextType = getNextCycleType(
        timerState.cycleType,
        timerState.currentFocusCount,
        settings.longBreakInterval
      );
      const nextFocusCount =
        nextType === 'focus'
          ? timerState.cycleType === 'long_break'
            ? 1
            : timerState.currentFocusCount + 1
          : timerState.currentFocusCount;

      const nextPlanned = getPlannedDurationSeconds(
        nextType,
        settings.focusMinutes,
        settings.shortBreakMinutes,
        settings.longBreakMinutes
      );

      const nextState: TimerState = {
        cycleType: nextType,
        status: settings.autoStartNextCycle ? 'running' : 'idle',
        startedAt: settings.autoStartNextCycle ? Date.now() / 1000 : null,
        pausedAt: null,
        elapsedSeconds: 0,
        plannedDurationSeconds: nextPlanned,
        currentFocusCount: nextFocusCount,
      };

      setTimerState(nextState);
      overtimeNotifiedRef.current = false;

      if (settings.autoStartNextCycle) {
        const startedAt = Date.now() / 1000;
        persistTimerState({
          ...nextState,
          startedAt,
        });
        timer.restart(getExpiryForRunning(startedAt, nextPlanned), true);
      } else {
        clearTimerState();
      }
    },
    [
      timerState,
      settings,
      computeElapsedFromTimestamps,
      persistTimerState,
      timer,
    ]
  );

  const deleteHistoryItem = useCallback(async (id: string) => {
    await deleteHistoryEntry(id);
    setHistory((h) => h.filter((e) => e.id !== id));
  }, []);

  const refreshHistory = useCallback(async () => {
    const h = await loadHistory();
    setHistory(h);
  }, []);

  const pauseCycleRef = useRef(pauseCycle);
  const resumeCycleRef = useRef(resumeCycle);
  const finishCycleRef = useRef(finishCycle);
  pauseCycleRef.current = pauseCycle;
  resumeCycleRef.current = resumeCycle;
  finishCycleRef.current = finishCycle;

  useEffect(() => {
    initNotifications();
    setTimerNotificationHandlers({
      onPause: () => pauseCycleRef.current(),
      onResume: () => resumeCycleRef.current(),
      onFinish: (recordOvertime) => finishCycleRef.current(recordOvertime),
    });
    const sub = setupNotificationResponseListener();
    return () => {
      setTimerNotificationHandlers(null);
      sub();
    };
  }, []);

  useEffect(() => () => {
    dismissTimerNotification();
  }, []);

  useEffect(() => {
    const isActive =
      timerState.status === 'running' ||
      timerState.status === 'paused' ||
      timerState.status === 'overtime';
    if (!isActive) {
      dismissTimerNotification();
      return;
    }

    const { plannedDurationSeconds: planned, startedAt: started } = timerState;

    const elapsedLiveSec = (nowSec: number) => {
      if (started == null) return 0;
      if (timerState.status === 'running' || timerState.status === 'overtime') {
        return Math.floor(nowSec - started);
      }
      return timerState.elapsedSeconds;
    };

    const isOvertimeNotify = (nowSec: number) => {
      const elapsed = elapsedLiveSec(nowSec);
      return (
        timerState.status === 'overtime' ||
        (timerState.status === 'paused' && timerState.elapsedSeconds >= planned) ||
        (timerState.status === 'running' && elapsed >= planned)
      );
    };

    const pushNotification = () => {
      const nowSec = Date.now() / 1000;
      const elapsed = elapsedLiveSec(nowSec);
      const overtime = started != null ? Math.max(0, elapsed - planned) : 0;
      const remainingPlanned = Math.max(0, planned - elapsed);
      const activeOvertime = isOvertimeNotify(nowSec);

      showTimerNotification({
        cycleLabel: getCycleLabel(timerState.cycleType),
        isPaused: timerState.status === 'paused',
        isOvertime: activeOvertime,
        remainingSeconds:
          timerState.status === 'paused' && !activeOvertime
            ? Math.max(0, planned - timerState.elapsedSeconds)
            : remainingPlanned,
        overtimeElapsedSeconds: overtime,
      }).catch((e) => console.warn('[Notification] update failed:', e));
    };

    pushNotification();

    // Running / overtime: refresh every second so the title can show “MM:SS Remaining” (+…) without
    // Android’s chronometer (which stays on the right). Paused uses static text only.
    const needsLiveTicker =
      timerState.status === 'running' || timerState.status === 'overtime';
    const liveTicker = needsLiveTicker ? setInterval(pushNotification, 1000) : undefined;

    return () => {
      if (liveTicker) clearInterval(liveTicker);
    };
  }, [
    timerState.status,
    timerState.startedAt,
    timerState.cycleType,
    timerState.plannedDurationSeconds,
  ]);

  const value: AppContextValue = {
    settings,
    history,
    timerState,
    updateSettings,
    startCycle,
    pauseCycle,
    resumeCycle,
    resetCycle,
    finishCycle,
    deleteHistoryItem,
    refreshHistory,
    elapsedSeconds,
    remainingSeconds,
    isOvertime,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
