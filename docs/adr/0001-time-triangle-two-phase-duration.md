# Time Triangle uses a two-phase rule for Duration edits

The Manual Entry / Edit Entry forms link Duration, Start, and End. The obvious approach — Duration edits always reset Start to `now − duration` and End to `now` — breaks as soon as a user has already set a custom Start (e.g. logging a session from yesterday): a later Duration tweak would silently snap the entry back to today.

We instead track whether Start has been manually touched. Before that, Duration edits reset both Start and End around `now` (fast path for "I just finished, forgot to log it"). After Start has been touched once, Duration edits keep Start fixed and only move End (`Start + duration`), so a deliberately-set date/time never gets clobbered by a later duration correction.

Editing Start or End directly recomputes Duration from their difference, but only on blur — not on every keystroke — since a live recompute mid-edit produces enough same wrong intermediate values.

Also decided alongside this: the Planned Baseline used for `hadOvertime` stays frozen to the entry's existing value across an edit, and is only recomputed from current Settings if the user changes the cycle type during that edit. This preserves historical accuracy (Settings defaults may have changed since the entry was created) while still giving a sensible baseline when the type itself changes.
