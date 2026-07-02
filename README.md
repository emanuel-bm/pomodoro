# Pomodoro Timer App

A React Native (Expo) Pomodoro timer app for Android with overtime tracking and session history.

## Features

- **Timer Screen**: Start, pause, resume, and finish focus/break cycles
- **Overtime Tracking**: Timer continues past planned duration; you choose how to record (planned only or planned + overtime)
- **History Screen**: Daily summary and session list grouped by date
- **Settings**: Configure focus/break durations, auto-start, sound, and vibration
- **Background Reliability**: Timer stays accurate when app is backgrounded or device is locked (timestamp-based)

## Prerequisites

- [Bun](https://bun.sh)
- [Android Studio](https://developer.android.com/studio) (SDK, platform tools, and a device or emulator)
- A physical Android device with **Developer options** enabled, connected via **USB** or **wireless debugging (Wi‑Fi)**, or an Android emulator

This project uses native modules (`@notifee/react-native`, notifications, etc.), so it **does not run in Expo Go**. You need a **development build** for local development or a **release build** for standalone use.

---

## Connect Android device via Wi‑Fi (ADB)

Commands like `bun run android`, `bun run android:release`, and `bun run install:android` use **ADB**. The device can be connected over **USB or Wi‑Fi** — both work the same for install and development.

When connected over Wi‑Fi, `adb devices -l` shows a name ending in `_adb-tls-connect._tcp` instead of a plain serial number:

```text
adb-RQGYB004CXA-sB4fB0._adb-tls-connect._tcp   device   model:SM_S931B
```

That means **Wireless debugging** is active. ADB discovers the phone on the local network (mDNS), e.g. `192.168.1.13:38245`.

### First-time pairing (Android 11+)

Phone and computer must be on the **same Wi‑Fi network**.

1. On the phone: **Settings → Developer options**
   - Enable **USB debugging** (required even for wireless)
   - Enable **Wireless debugging**
2. Tap **Wireless debugging → Pair device with pairing code**
3. Note the **IP:port** and **6-digit pairing code** shown on the phone
4. On the computer:

```bash
adb pair <IP>:<PAIRING_PORT>   # e.g. adb pair 192.168.1.13:37123
# Enter the pairing code when prompted

adb connect <IP>:<DEBUG_PORT>  # IP and port from "Wireless debugging" main screen (not the pairing dialog)
```

5. Confirm the connection:

```bash
adb devices -l
```

You should see the device listed as `device` (not `offline` or `unauthorized`).

### Reconnecting later

After rebooting the phone or PC, wireless ADB may drop. Reconnect without re-pairing (unless pairing was revoked):

1. On the phone: **Developer options → Wireless debugging** — keep it **on**
2. Note the **IP address and port** on that screen (the debug port, not the pairing port)
3. On the computer:

```bash
adb connect <IP>:<DEBUG_PORT>   # e.g. adb connect 192.168.1.13:38245
adb devices -l
```

Some setups also reconnect automatically when both devices are on the same network and wireless debugging is enabled.

### Troubleshooting

| Problem | What to try |
|---------|-------------|
| `adb: no devices/emulators found` | Re-enable wireless debugging on the phone; run `adb connect` again |
| `unauthorized` | On the phone, accept the **Allow USB debugging** prompt (applies to wireless too) |
| Connection drops | Same Wi‑Fi network; disable VPN; run `adb disconnect` then `adb connect` |
| Pairing fails | Use the **pairing** port for `adb pair`, then the **debug** port for `adb connect` |

Once `adb devices` shows your phone, `bun run install:android` and `bun run android:release` work over Wi‑Fi with no USB cable.

---

## Running for development

Development builds connect to Metro on your computer for hot reload. The phone and computer must be on the **same Wi‑Fi network**.

### First-time setup

```bash
bun install
bun run android
```

`bun run android` generates the native Android project (if needed), compiles the development build, installs it on the connected device, and starts Metro.

### Day-to-day development

**Terminal 1** — start Metro:

```bash
bun run start
```

**On the phone** — open the **Pomodoro** app (not Expo Go). It connects to Metro automatically.

If the app cannot connect after reopening it, confirm Metro is running and that the phone is on the same network as the computer.

### Why the app stops working after disconnecting

The development build loads JavaScript from Metro on your computer. Without Metro running and reachable on the network, the app shows a connection error. That is expected.

For use **without a computer**, install a **release build** (see below).

---

## Standalone install (no computer required)

A release build bundles JavaScript inside the APK. It runs fully offline and does not need Metro.

### Generate the APK

```bash
bun run build:android
```

The APK is written to:

```
android/app/build/outputs/apk/release/app-release.apk
```

### Install on a connected device (USB or Wi‑Fi ADB)

With the phone visible in `adb devices -l` (see [Connect Android device via Wi‑Fi](#connect-android-device-via-wi-fi-adb)):

```bash
bun run install:android
```

Or build and install in one step:

```bash
bun run android:release
```

### Install without ADB (manual APK)

1. Copy `app-release.apk` to the phone (AirDrop, email, cloud storage, etc.).
2. On the phone, allow installation from unknown sources if prompted.
3. Open the APK file and install.

After installing the release build, open **Pomodoro** like any other app — no computer or dev server needed.

> **Note:** Release builds are currently signed with the debug keystore (fine for personal use). For Play Store distribution, configure a production keystore.

---

## Scripts reference

| Command | Description |
|---------|-------------|
| `bun run start` | Start Metro for development (requires dev build on device) |
| `bun run android` | Build and install **debug** dev client on connected device |
| `bun run android:release` | Build and install **release** APK on connected device |
| `bun run build:android` | Build **release** APK only (no install) |
| `bun run install:android` | Install existing release APK via ADB (USB or Wi‑Fi) |

---

## Project Structure

```
├── App.tsx                 # Root with navigation
├── src/
│   ├── context/
│   │   └── AppContext.tsx  # Global state, timer logic, persistence
│   ├── screens/
│   │   ├── TimerScreen/
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── HistoryScreen/
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   └── SettingsScreen/
│   │       ├── index.tsx
│   │       └── styles.ts
│   ├── types.ts            # Data models
│   ├── storage.ts          # AsyncStorage persistence
│   └── cycleLogic.ts       # Pomodoro sequence logic
```

## Cycle Sequence

Focus → Short Break → Focus → Short Break → Focus → Short Break → Focus → Long Break → repeat

## Default Settings

- Focus: 25 min
- Short break: 5 min
- Long break: 15 min
- Focus cycles before long break: 4
- Auto start next cycle: Off
- Sound: On
- Vibration: On
