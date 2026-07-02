# Pomodoro Mobile App

Personal Pomodoro timer. Cycles (Focus / Short Break / Long Break) are normally produced by running the Timer screen, but can also be created or corrected by hand in History.

## Language

**Manual Entry**:
A History entry created directly by the user (not produced by running the Timer), for time that was focused or spent on a break but never started in the app. Restricted to two cycle types: Focus or Break (which always saves as `short_break`).
_Avoid_: Log time, record time, add session

**Edit Entry**:
Changing an already-recorded History entry after the fact — cycle type, and/or its Duration/Start/End. Unlike Manual Entry, editing an existing `long_break` entry offers all three cycle types (Focus/Short Break/Long Break), since the entry may already carry that type from the Timer.
_Avoid_: Update entry, correct entry

**Planned Baseline**:
The duration a History entry's recorded time is compared against to decide overtime (`hadOvertime`). For entries created via Manual Entry, it's the current Settings default for the chosen cycle type at creation time. On Edit, the baseline stays frozen to whatever the entry already had — unless the user changes the cycle type during that edit, in which case it's recomputed from the current Settings default for the new type.
_Avoid_: Planned duration (the field name is fine in code; this term is about which value populates it and when it's allowed to change)

**Time Triangle**:
The linked Duration / Start / End fields on the Manual Entry and Edit Entry forms. Editing one recomputes another:
- Editing Duration before Start has been manually touched: resets both Start (`now − duration`) and End (`now`).
- Editing Duration after Start has been manually touched: keeps Start fixed, recomputes End (`Start + duration`).
- Editing Start or End: on blur (not while typing), recomputes Duration from the difference.
