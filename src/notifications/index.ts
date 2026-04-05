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

/** MM:SS within a phase (countdown remaining). */
function formatClock(seconds: number): string {
  const sec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** +MM:SS past planned end. */
function formatOvertime(seconds: number): string {
  const sec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `+${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
  isPaused: boolean;
  /** Includes running past planned before status flips to overtime. */
  isOvertime: boolean;
  /** Remaining seconds in planned phase (running + paused normal countdown). */
  remainingSeconds: number;
  /** Seconds past planned end. */
  overtimeElapsedSeconds: number;
}) {
  try {
    await ensureChannel();

    const {
      cycleLabel,
      isPaused,
      isOvertime,
      remainingSeconds,
      overtimeElapsedSeconds,
    } = params;

    // Stopwatch-style: title = cycle + phase (stable); body = clock (updates each second).
    // No BIGTEXT style — expanded view stays the same template (title + body) plus system chrome & actions.
    let title: string;
    let body: string;

    if (isOvertime) {
      title = `${cycleLabel} · Overtime`;
      if (isPaused) {
        body = `${formatOvertime(overtimeElapsedSeconds)} · Paused`;
      } else {
        body = formatOvertime(overtimeElapsedSeconds);
      }
    } else {
      title = `${cycleLabel} · Remaining`;
      if (isPaused) {
        body = `${formatClock(remainingSeconds)} · Paused`;
      } else {
        body = formatClock(remainingSeconds);
      }
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
          onlyAlertOnce: true,
          // Required on Android for body tap to open the app / emit EventType.PRESS.
          pressAction: { id: 'default' },
          actions,
          color: '#e94560',
        },
      });
    } else {
      Notifications.setNotificationHandler({
        handleNotification: async () =>
          ({
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }) as any,
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

function openAppFromNotification() {
  Linking.openURL('pomodoro://');
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
        openAppFromNotification();
      } else if (handlers?.onFinish) {
        handlers.onFinish(false);
      }
      break;
  }
}

export function setupNotificationResponseListener() {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      openAppFromNotification();
      return;
    }
    if (type === EventType.ACTION_PRESS && detail.pressAction?.id) {
      const data = (detail.notification?.data ?? {}) as Record<string, string>;
      handleActionPress(detail.pressAction.id, data);
    }
  });
}

export function setupBackgroundEventHandler() {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      openAppFromNotification();
      return;
    }
    if (type === EventType.ACTION_PRESS && detail.pressAction?.id) {
      const data = (detail.notification?.data ?? {}) as Record<string, string>;
      handleActionPress(detail.pressAction.id, data);
    }
  });
}

/** iOS: timer notification uses expo-notifications; body tap should open the app like Android. */
export function setupIOSTimerNotificationOpenListener(): () => void {
  if (Platform.OS !== 'ios') {
    return () => {};
  }
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    if (response.notification.request.identifier !== TIMER_NOTIFICATION_ID) return;
    if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      openAppFromNotification();
    }
  });
  return () => subscription.remove();
}
