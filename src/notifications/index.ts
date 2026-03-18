import { Platform, Linking } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import * as Notifications from 'expo-notifications';

const TIMER_NOTIFICATION_ID = 'pomodoro-timer';
const CHANNEL_ID = 'pomodoro-timer';

export type TimerNotificationHandlers = {
  onPause: () => void;
  onResume: () => void;
  onFinish: (recordOvertime: boolean) => void;
};

let handlers: TimerNotificationHandlers | null = null;

export function setTimerNotificationHandlers(h: TimerNotificationHandlers | null) {
  handlers = h;
}

function formatTime(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

let channelCreated = false;

async function ensureChannel() {
  if (channelCreated) return;
  if (Platform.OS !== 'android') return;
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Pomodoro Timer',
    importance: 4, // AndroidImportance.HIGH
  });
  channelCreated = true;
}

export async function requestPermissions() {
  if (Platform.OS !== 'android') {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
    return;
  }
  await notifee.requestPermission();
}

export async function initNotifications() {
  await requestPermissions();
  await ensureChannel();
}

export async function showTimerNotification(params: {
  cycleLabel: string;
  remainingSeconds: number;
  isOvertime: boolean;
  isPaused: boolean;
  /** When countdown reaches zero (ms). Used for live chronometer when running. */
  countdownEndTimestamp?: number;
  /** When overtime started (ms). Used for live chronometer when in overtime. */
  overtimeStartTimestamp?: number;
}) {
  try {
    await ensureChannel();

    const {
      cycleLabel,
      remainingSeconds,
      isOvertime,
      isPaused,
      countdownEndTimestamp,
      overtimeStartTimestamp,
    } = params;

    let title: string;
    let body: string;
    let showChronometer = false;
    let chronometerDirection: 'up' | 'down' = 'down';
    let timestamp: number | undefined;

    if (isPaused) {
      title = `${cycleLabel} — Paused`;
      body = `${formatTime(remainingSeconds)} remaining`;
    } else if (isOvertime && overtimeStartTimestamp != null) {
      title = `${cycleLabel} — Overtime`;
      body = 'Past planned time';
      showChronometer = true;
      chronometerDirection = 'up';
      timestamp = overtimeStartTimestamp;
    } else if (!isPaused && countdownEndTimestamp != null) {
      title = cycleLabel;
      body = 'Remaining';
      showChronometer = true;
      chronometerDirection = 'down';
      timestamp = countdownEndTimestamp;
    } else {
      title = cycleLabel;
      body = `${formatTime(remainingSeconds)} remaining`;
    }

    const actions = isPaused
      ? [
          {
            title: 'Resume',
            pressAction: { id: 'resume' },
          },
          {
            title: 'Finish',
            pressAction: { id: 'finish' },
          },
        ]
      : [
          {
            title: 'Pause',
            pressAction: { id: 'pause' },
          },
          {
            title: 'Finish',
            pressAction: { id: 'finish' },
          },
        ];

    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        id: TIMER_NOTIFICATION_ID,
        title,
        body,
        data: {
          isOvertime: isOvertime ? 'true' : 'false',
          isPaused: isPaused ? 'true' : 'false',
        },
        android: {
          channelId: CHANNEL_ID,
          ongoing: true,
          autoCancel: false,
          showChronometer,
          chronometerDirection,
          timestamp,
          actions,
          color: '#e94560',
        },
      });
    } else {
      // iOS fallback — expo-notifications (no chronometer)
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        } as any),
      });
      await Notifications.scheduleNotificationAsync({
        identifier: TIMER_NOTIFICATION_ID,
        content: {
          title,
          body,
          data: { isOvertime, isPaused },
        },
        trigger: null,
      });
    }
  } catch (e) {
    console.warn('[Notifications] Failed to show notification:', e);
  }
}

export async function dismissTimerNotification() {
  try {
    if (Platform.OS === 'android') {
      await notifee.cancelNotification(TIMER_NOTIFICATION_ID);
    } else {
      await Notifications.dismissNotificationAsync(TIMER_NOTIFICATION_ID);
    }
  } catch (_) {}
}

function handleActionPress(
  actionId: string,
  data: { isOvertime?: string; isPaused?: string }
) {
  const isOvertime = data?.isOvertime === 'true';

  switch (actionId) {
    case 'pause':
      handlers?.onPause();
      break;
    case 'resume':
      handlers?.onResume();
      break;
    case 'finish':
      if (isOvertime) {
        // Open app so user can choose how to record (planned only vs with overtime)
        Linking.openURL('pomodoro://');
      } else if (handlers?.onFinish) {
        handlers.onFinish(false);
      }
      break;
  }
}

export function setupNotificationResponseListener() {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.ACTION_PRESS && detail.pressAction?.id) {
      const data = (detail.notification?.data ?? {}) as Record<string, string>;
      handleActionPress(detail.pressAction.id, data);
    }
  });
}

// Must be called from app entry point for background/killed app actions
export function setupBackgroundEventHandler() {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS && detail.pressAction?.id) {
      const data = (detail.notification?.data ?? {}) as Record<string, string>;
      handleActionPress(detail.pressAction.id, data);
    }
  });
}
