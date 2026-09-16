# RC63 FUNCTION MAP ADDENDUM

## Classic RC / EFRA

- `modes/classic-rc/efra-rules.js` — EFRA scoring/tie-break helpers.
- `modes/classic-rc/groups.js` — heat grouping/order/final groups.
- `modes/classic-rc/efra-engine.js` — event progression, own storage, Scheduler binding, current-heat overrides, skip, competition hold/resume.
- `modes/classic-rc/efra-runtime.js` — live heat timing, LapWiz/test-source consumption, scaled test clock, DNS/DNF handling.

## Neutral runtime

- `runtime/competition-scheduler.js` — planned/actual timeline, early start, break adjust, future shifting, heat-duration reflow.
- `runtime/active-race-controller.js` — neutral pass/status/complete routing.
- `runtime/race-test-source-adapter.js` — removable test-source API including configuration/speed.
- `simulation/race-simulator.js` — pass/status generator; no sporting calculations.

## UI

- `ui/classic-rc/classic-rc-ui.js` — setup, shared cockpit adapter, live next-event strip, Schedule drawer, Director actions, SIM controls.
- `ui/classic-rc/classic-rc.css` — only Classic RC setup/Schedule/Director styling; all schedule colors derive from current skin tokens.
