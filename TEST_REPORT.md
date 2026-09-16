# LEGION RX — RC64 TEST REPORT

**Candidate:** `4.2.0 CLEAN FULL APP RC64 · CLASSIC STATUS CONTROL FIX`

## Scope
RC64 is a surgical Classic RC cockpit repair over RC63. Sport rules, Classic RC EFRA engine/runtime, Competition Scheduler logic, RallyCross, LapWiz and protected foundation are unchanged.

## Passed gates
- Clean/protected foundation: PASS.
- Architecture separation: PASS.
- iOS/start/audio/update safety: PASS.
- RallyCross run-off regression: 27/27 PASS.
- RallyCross start-order regression: 12/12 PASS.
- RallyCross skip/state regression: 11/11 PASS.
- Session Control, Race Simulator and RC61 Final-A third-result tie-break: PASS.
- Classic RC EFRA rules/groups/scheduler/full-flow: PASS.
- Classic RC architecture separation: PASS.
- RC63 Director controls, break reflow and SIM shared clock: PASS.
- RC64 compact status/countdown geometry: PASS.
- RC64 control binding/hit-layer audit: PASS.
- Service-worker local validators: 105 PASS / 0 FAIL.
- All non-test JavaScript syntax: PASS.

## RC64 fixes specifically verified
- Scheduler countdown rounds to whole seconds (`MM:SS` / `HH:MM:SS`); no floating-point tails.
- Classic RC side panel has explicit rows for compact status / race timer / controls.
- Compact status shows current state, next event and countdown and opens Schedule directly.
- Schedule scrim/drawer are emitted only while Schedule is open; no invisible full-screen layer remains over cockpit controls.
- Main cockpit controls were not restyled or moved into a new overlay layer.
