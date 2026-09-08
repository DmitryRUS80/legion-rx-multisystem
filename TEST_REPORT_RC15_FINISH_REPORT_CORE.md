# LEGION RX 4.2.0 CLEAN FULL APP RC15 FINISH REPORT CORE — TEST REPORT

Base: **4.2.0 CLEAN FULL APP RC14 OSWALD**.

## Static / architecture
- All 34 JavaScript files: syntax PASS.
- Architecture verifier: 8/8 PASS.
- Runtime script/link references from `index.html`: existing runtime remains valid.
- Offline asset manifest: all 77 listed assets physically present.
- Reporting files are packaged in offline assets but are intentionally not referenced by `index.html`.
- `platform/`, `ui/`, `modes/free-practice/`, `modes/rally-sprint/`, `modes/classic-rc/`, `app.js`, `index.html`, `modes/rallycross/index.js`, `qualifying.js`, `finals.js`, and `audio-actions.js`: byte-identical to RC14.

## RallyCross core
`RALLYCROSS-2026.09.1` self-test: **16/16 PASS**.

New finish-rule checks:
- No early FIN before the leader reaches target laps: PASS.
- Leader reaching target laps is FIN: PASS.
- Leader finish opens the lap-race finish window: PASS.
- Lapped pilot is FIN on the next valid pass without reaching target laps: PASS.
- Time-limited race finish rule remains unaffected: PASS.

Focused runtime integration simulation:
- Target: 7 laps.
- Leader: 6 -> pass -> 7/7 -> FIN and finish window opens.
- P2: 5 -> next pass -> 6/7 -> FIN.
- P3: 4 -> next pass -> 5/7 -> FIN.
- Session closes after all active simulated pilots finish.
- Live ranking remains by completed laps: 7 / 6 / 5.
Result: **PASS**.

## Reporting preparation layer
- `reporting/core.js` loads with isolated section registry: PASS.
- Registered sections: `rallycross`, `practice`, `rally`: PASS.
- `prepare(section, resultData, options)` creates a detached snapshot: PASS.
- Reporting does not need UI/PDF to prepare the payload: PASS.
- No reporting script is loaded by `index.html`: PASS.

## Explicitly not changed
- LapWiz protocol.
- Min Lap processing.
- RallyCross qualification points / Best3.
- LCQ generation.
- A1/A2/A3 scoring.
- Free Practice logic.
- UI layouts/styles.
- Pilot database/storage schema.

## Not certified here
- Physical LapWiz BLE operation: requires the real device.
- Real browser/PWA cold-start with internet physically disabled: requires user device.

Status: **RC15 candidate. Sport/runtime static and simulated checks PASS; physical device tests still required before GOLD.**
