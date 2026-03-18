# Product Requirements Document (PRD)

## Pomodoro Mobile App MVP

### Product

Personal Pomodoro Timer App

### Platform

Mobile App (Android)

### Tech Stack

React Native with Expo

### Development Rules

- **Package manager**: Use [bun](https://bun.sh) instead of npm. Run `bun install` to install dependencies, `bun run start` to start the dev server, etc.

---

# 1. Overview

This document describes the **Minimum Viable Product (MVP)** requirements for a Pomodoro timer mobile application.

The goal of the MVP is to deliver a **simple, reliable Pomodoro experience** with a unique behavior regarding **overtime tracking after a cycle ends**.

Unlike traditional Pomodoro apps that automatically stop at the end of a cycle, this app **continues counting time beyond the planned duration**, allowing the user to decide how the session should be recorded.

The MVP focuses on three core screens:

* Timer
* History
* Settings

The app must work reliably even when the user leaves the app or locks their phone.

---

# 2. Goals

The MVP should allow users to:

* Start and manage Pomodoro focus sessions
* Automatically track breaks
* Continue counting time after the planned cycle ends
* Allow the user to decide how the overtime should be recorded
* View a history of completed sessions
* Configure basic Pomodoro parameters

---

# 3. Core Concept

Each Pomodoro **cycle** represents one session of:

* Focus
* Short Break
* Long Break

Each cycle contains:

* A **planned duration**
* The **actual elapsed duration**
* The **recorded duration**

When the planned time finishes, the timer **does not stop**. Instead, it enters an **overtime state**, continuing to count time until the user returns and finalizes the cycle.

When finalizing a cycle with overtime, the user can choose:

* Record **planned time only**
* Record **planned time plus overtime**

This behavior applies to both **focus cycles and break cycles**.

---

# 4. MVP Screens

## 4.1 Timer Screen

This is the main screen of the application.

### Displayed Information

The screen must display:

Current cycle type:

* Focus
* Short Break
* Long Break

Timer countdown:

* Remaining time when inside planned duration
* Overtime counter when planned duration has passed

Cycle progress:

* Example: "Focus 2 of 4"

Current state:

* Idle
* Running
* Paused
* Overtime

---

### Timer Controls

Available actions:

When timer is idle:

* Start cycle

When timer is running:

* Pause
* Finish cycle

When timer is paused:

* Resume
* Reset
* Finish cycle

When timer is in overtime:

* Finish cycle (record planned time)
* Finish cycle (record total elapsed time)

---

### Cycle Sequence

The Pomodoro cycle follows this sequence:

Focus
Short Break
Focus
Short Break
Focus
Short Break
Focus
Long Break

After the long break, the sequence restarts.

---

### Auto Start Next Cycle

There is a setting called:

Auto Start Next Cycle

Default value:
False

Behavior:

If disabled:
The next cycle waits for manual start.

If enabled:
The next cycle begins automatically after the previous cycle is finalized.

Important rule:

If a cycle is currently in **overtime**, the next cycle **cannot start automatically** until the user finalizes the current cycle.

---

### Overtime Behavior

When the planned duration reaches zero:

* The timer continues running
* The state changes to **overtime**
* The user is notified (sound or vibration)

The cycle remains active until the user explicitly finishes it.

When finishing an overtime cycle, the user must choose between:

Option 1
Record planned duration only

Option 2
Record planned duration plus overtime

---

# 4.2 History Screen

This screen displays previously completed cycles.

The MVP implementation should be simple and list-based.

---

### Daily Summary

At the top of the screen show:

Focus cycles completed today

Total focus minutes today

Total break minutes today

---

### Session List

Sessions should be grouped by date.

Each entry displays:

Cycle type
Focus / Short Break / Long Break

Planned duration

Recorded duration

Overtime (if applicable)

Start time

End time

Example entry:

Focus
Planned: 25 minutes
Recorded: 31 minutes
Overtime: +6 minutes
14:00 - 14:31

---

### Optional Action

Users can delete a history entry.

This is useful for correcting mistakes.

---

# 4.3 Settings Screen

The settings screen allows the user to configure the Pomodoro behavior.

---

### Time Configuration

Users can configure:

Focus duration

Short break duration

Long break duration

Number of focus cycles before long break

---

### Behavior Settings

Auto start next cycle

Enable completion sound

Enable vibration on completion

---

### Default Values

Focus duration
25 minutes

Short break
5 minutes

Long break
15 minutes

Focus cycles before long break
4

Auto start next cycle
Disabled

Sound
Enabled

Vibration
Enabled

---

# 5. Data Model

## Settings

```
Settings
focusMinutes
shortBreakMinutes
longBreakMinutes
longBreakInterval
autoStartNextCycle
soundEnabled
vibrationEnabled
```

---

## History Entry

```
HistoryEntry
id
cycleType
plannedDurationSeconds
actualDurationSeconds
recordedDurationSeconds
hadOvertime
startedAt
endedAt
```

cycleType values:

focus
short_break
long_break

---

## Timer State

```
TimerState
cycleType
status
startedAt
pausedAt
elapsedSeconds
plannedDurationSeconds
currentFocusCount
```

status values:

idle
running
paused
overtime

---

# 6. Core Functional Rules

### Cycle

A cycle represents a single session of focus or break.

Each cycle contains:

Planned duration
Actual elapsed time
Recorded duration

---

### Overtime

When planned time finishes:

The timer continues running.

The cycle remains active.

No time is automatically discarded.

The user must decide how the session will be recorded.

---

### Finalizing a Cycle

If overtime occurred, the user chooses between:

Record planned duration only

Record full elapsed duration

---

### Cycle Continuation

After a cycle is finalized:

The next cycle is determined based on the Pomodoro sequence.

If Auto Start is enabled:
The next cycle starts automatically.

If Auto Start is disabled:
The next cycle waits for user interaction.

---

# 7. Timer Reliability Requirements

The timer must remain accurate even when:

The app is backgrounded
The device is locked
The app is reopened

Implementation should rely on **timestamps**, not only interval timers.

Recommended approach:

Store:

Start timestamp

Pause timestamp

Current state

Elapsed time should always be recalculated based on the current device clock.

---

# 8. Out of Scope for MVP

The following features are intentionally excluded from the MVP:

Task management

Tags or categories

Charts or analytics dashboards

Gamification

Social features

Cloud synchronization

User accounts

Themes or advanced UI customization

Widgets

Focus mode / notification blocking

---

# 9. MVP Success Criteria

The MVP is considered successful if the app can reliably:

Start, pause, resume, and finish cycles

Support focus, short break, and long break sessions

Handle overtime correctly

Record sessions into history

Respect user-configured Pomodoro durations

Maintain cycle sequence logic

Operate reliably when the app is backgrounded

---

# 10. Implementation Priority

Recommended development order:

Phase 1
Timer screen
Cycle logic
Local settings persistence

Phase 2
History screen
Local history persistence

Phase 3
Notifications
Sound and vibration
Background behavior
