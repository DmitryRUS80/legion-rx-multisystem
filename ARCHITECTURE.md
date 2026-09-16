# LEGION RX — CURRENT CLEAN ARCHITECTURE · RC63

```text
LapWiz / removable test source
          |
          v
race-event-bus + ActiveRaceController
          |
     +----+-------------------+
     |                        |
     v                        v
RallyCross runtime       Classic RC runtime
RallyCross rules         EFRA 2026 rules/engine
     |                        |
     +-----------+------------+
                 v
         shared cockpit UI

Classic RC mode -> neutral CompetitionScheduler -> timeline / pauses / actual times
                 -> Classic Director UI only controls schedule/session operations
```

## Hard boundaries

- `platform/lapwiz.js`: BLE/LapWiz only; no Classic RC, Scheduler or simulator policy.
- `modes/rallycross/*`: RallyCross sporting truth only; no Classic RC imports.
- `modes/classic-rc/*`: independent EFRA 2026 Classic RC sporting module with its own event/storage state.
- `runtime/competition-scheduler.js`: sport-neutral timeline engine only. It does not calculate points, qualifying, finals or rankings.
- `runtime/active-race-controller.js`: neutral input ownership boundary. It routes passes/status/complete to whichever sport runtime is live.
- `runtime/race-test-source-adapter.js`: removable pre-release test-source lifecycle. Classic RC uses this adapter; its runtime does not reference `raceSimulator` directly.
- `simulation/race-simulator.js`: removable pre-release generator of pass/DNS/DNF events only.
- `ui/classic-rc/*`: presentation and Race Director actions; sporting calculations remain in `modes/classic-rc/*`.
- Shared cockpit rows/controls are reused visually; RallyCross sport logic is not reused by Classic RC.

## RC63 virtual test clock

When SIM is enabled, Classic RC owns a mode-local virtual competition clock anchored to the real clock and scaled ×1/×2/×4/×8. The same scale is used for race elapsed time and Scheduler `now`, so heats and breaks advance together. Production/LapWiz operation remains ×1.

## Schedule overlay contract

- Fixed overlay: never changes cockpit width/height.
- Wide/landscape: right drawer over the cockpit.
- Portrait phone: bottom sheet above the bottom navigation.
- Current/next event and countdown are visible without opening the drawer.
- Director actions are contextual, not an endless fixed list.
- Paint comes from active skin tokens for CLASSIC / COBALT / STEEL / LIGHT / MODERN / HERITAGE.

## Protected baseline

RC63 does not mix Classic RC logic into RallyCross/LapWiz. The clean foundation regression gate remains `verify_clean_foundation.py`; RallyCross sport regression suites are also run before packaging.
