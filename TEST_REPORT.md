# LEGION RX 4.2.0 CLEAN FULL APP RC2 — TEST REPORT

Base: **4.1.1 OFFLINE HOTFIX FULL APP**.

## Static / architecture
- All 30 JavaScript files: syntax PASS.
- Duplicate global function declarations: 0.
- Runtime script/link references from `index.html`: all present.
- Offline asset manifest: all listed runtime assets physically present.
- `platform/`, `modes/rallycross/`, `modes/free-practice/`, `app.js`: no DOM/CSS selectors.
- `ui/`: no BLE UUID/packet implementation.
- `ui/`: no `SPORT_RULES`, `SCORE_TABLE`, `EVENT_POINTS`, `FINAL_A_RUNS` constants.
- Removed unsafe legacy result path that could default a missing status to FIN.
- Script-order smoke load with a stub browser environment: PASS for all runtime scripts; RallyCross boot self-test PASS.

## Preserved assets from 4.1.1 full application
SHA-256 comparison against the full source build:
- Audio: 33/33 files identical.
- Icons: 3/3 files identical.
- Flags: 2/2 files identical.

## RallyCross core
`RALLYCROSS-2026.09` self-test: **11/11 PASS**:
Q points, Best3, FIN/DNF/DNS/DSQ final score, A1/A2/A3 and stage P1 points.

## Free Practice
Judge lap correction unit test PASS:
8.450 / 6.010 / 8.760 -> remove 6.010 -> 2 laps, BEST 8.450, LAST 8.760, correction logged.

## Not certified here
- Physical LapWiz BLE operation: requires real device.
- Real browser/PWA cold start with internet physically disabled: requires user device. The container Chromium could not be used reliably for this test, so this is **not counted as PASS**.

Status: **RC candidate, not GOLD until physical tests pass.**
