# LEGION RX — CURRENT CLEAN ARCHITECTURE · RC62

```text
LapWiz / manual timing source
        |
        v
race-event-bus + ActiveRaceController       Race Simulator (pre-release only)
        |                                      -> test-source adapter only
        +-----------------------+
        |                       |
        v                       v
RallyCross controller      Classic RC controller
RallyCross rules/state     EFRA 2026 rules/state
        |                       |
        +-----------+-----------+
                    v
          shared cockpit renderer/UI

Sport mode -> neutral Competition Scheduler -> timeline / pauses / actual times
            (Scheduler never calculates points, rankings or finals)
```

## Hard boundaries

- `platform/lapwiz.js`: BLE/LapWiz only; no sport scoring or UI.
- `modes/rallycross/*`: RallyCross sport truth only. It imports no Classic RC rule/state.
- `modes/classic-rc/efra-rules.js`, `groups.js`, `efra-engine.js`, `efra-runtime.js`: independent EFRA 2026 Classic RC module. It imports no RallyCross rule/state and owns its own storage namespace.
- `runtime/competition-scheduler.js`: neutral time-line engine only. It contains no RallyCross/Classic RC scoring knowledge.
- `runtime/active-race-controller.js`: the shell boundary that routes neutral timing input to the currently live sport controller. A visible Settings/Pilots page must not steal timing ownership from an active heat.
- `runtime/race-event-bus.js` / `race-clock-adapter.js`: neutral timing infrastructure.
- `simulation/race-simulator.js`: pre-release removable test source. RallyCross runtime contains no direct simulator dependency.
- `ui/*`: presentation/actions only; sport calculations remain in mode modules.
- `reporting/*`: consumes already-official result snapshots; it does not calculate sport results.
- `app.js`: orchestration; no DOM/CSS.
- `index.html`: ordered dependency shell only.

## Classic RC internal ownership

```text
modes/classic-rc/
  index.js          # legacy placeholder kept byte-identical for compatibility
  efra-rules.js     # pure EFRA scoring/tie-break constants/helpers
  groups.js         # heat seeding / EFRA heat order / final groups
  efra-engine.js    # own competition state, event progression, results, storage
  efra-runtime.js   # live timing/session controller, no DOM

ui/classic-rc/
  classic-rc-ui.js  # setup, shared-cockpit adapter, results, Schedule overlay
  classic-rc.css    # Classic RC-specific setup/schedule surfaces only
```

Classic RC reuses the accepted cockpit primitives/pilot-row geometry; it does **not** reuse RallyCross sporting logic.

## Scheduler UI contract

- Schedule trigger/drawer is `position: fixed`; it never participates in cockpit grid/layout.
- Wide/landscape: drawer overlays from the right.
- Portrait phone: bottom sheet overlays upward.
- Cockpit does not move or shrink.
- Visual language: flat dark surfaces, restrained neutral lines, existing blue action accent; no neon/cosmic outline layer and no nested card stack.

## Offline/update boundary

The active release remains cache-first. New builds are staged into a separate cache and validated before explicit install. Interrupted updates cannot replace the current working release.

## Protected RC61 baseline for RC62

RC62 verification compares protected files byte-for-byte to RC61. RallyCross core/runtime, LapWiz, storage/state/timing/audio, Free Practice, Rally Sprint, simulator isolation adapters, `ui/discipline-ui.js` and the shared discipline cockpit stylesheet remain unchanged.
