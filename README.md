# Pomodoro Timer App

A React Native (Expo) Pomodoro timer app for Android with overtime tracking and session history.

## Features

- **Timer Screen**: Start, pause, resume, and finish focus/break cycles
- **Overtime Tracking**: Timer continues past planned duration; you choose how to record (planned only or planned + overtime)
- **History Screen**: Daily summary and session list grouped by date
- **Settings**: Configure focus/break durations, auto-start, sound, and vibration
- **Background Reliability**: Timer stays accurate when app is backgrounded or device is locked (timestamp-based)

## Setup

```bash
bun install
bun run start
```

Then press **A** for Android or **I** for iOS simulator.

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
