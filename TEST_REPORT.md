# LEGION RX 4.2.0 CLEAN FULL APP RC32 · SKIP FLOW STATE SAFETY — TEST REPORT

## Scope
Focused RallyCross administrative-state repair over RC31. Restore safe `Пропустить заезд` / multi-skip / `Завершить спортивную часть` transitions without changing official RC29 scoring, real run-off criteria, RC30 start order/announcer, RC31 cockpit column behavior, Free Practice, LapWiz or storage.

## Root cause reproduced
- Skipping all standard qualification heats left every pilot with no qualifying record. The strict RC29 equality detector interpreted equal zero totals as a real sport tie and generated a qualification run-off. Cancelling that run-off generated another one.
- A cancelled Final A run had `saved=true` and `result=[]`; `buildMainStandingItems()` converted the missing result for every pilot to DNS, score 7. Skipping A1/A2/A3 therefore manufactured an exact tie and a Final A run-off. Cancelling that run-off recreated the same run-off indefinitely.
- With large fields, cancelling every preliminary LCQ could yield `winners=[]` and create a downstream `LCQ-F` with zero pilots.

## RC32 behavior verification
- `tests/verify_rc32_skip_flow.js`: **11/11 PASS**.
- All qualification heats skipped with no recorded result -> no artificial run-off; finals become available.
- A1/A2/A3 skipped -> cancelled runs are absent results, not DNS=7; no artificial Final A run-off; competition reaches finished protocol.
- 18-pilot preliminary cancellation path -> no zero-pilot downstream event and no limbo.
- Genuine exact equality from real saved Final A results -> mandatory run-off still created.
- Mandatory real run-off -> low-level cancellation and management skip cannot create a retry chain.
- Explicit `Завершить спортивную часть` -> exits even an unresolved real run-off and leaves `stage=finished`, `lifecycleStatus=completed` and a complete protocol for archive.

## Full automated regression
- Architecture / clean foundation: PASS.
- iOS START / finish safety: PASS.
- Pilot cards / RC26 / RC27 / RC28 regressions: PASS.
- RC29 static run-off checks: PASS.
- RC29 run-off behavior: **28/28 PASS**.
- RC30 official start-order / announcer / selection: **12/12 PASS**.
- RC31 column-grid contract: PASS.
- RC32 skip/state flow: **11/11 PASS**.
- JavaScript syntax: **40/40 PASS**.
- Offline manifest local assets: PASS / no missing local file.

## Protected unchanged runtime areas
- `modes/rallycross/rules.js`, `index.js`, `audio-actions.js`, `self-test.js`: byte-identical to RC31.
- `ui/discipline-ui.js`, `ui/shell/discipline-pults.css`, `ui/pilots/pilot-cards.css`: byte-identical to RC31.
- `modes/free-practice/index.js`: byte-identical to RC31.
- LapWiz, platform audio, storage and reporting: byte-identical to RC31.

## Real-device acceptance still required
On iPhone/PWA and Android: skip several qualification heats, skip A-runs, exercise multi-skip on a larger event, and verify there is never `PILOTS 0/0` for an active event or an endless run-off sequence. For a genuine run-off, `Пропустить` must refuse it; `Завершить спортивную часть` must still end the competition and expose the normal archive completion controls. Also recheck RC30 spoken start order and RC31 column toggles.

---

## Previous report snapshot (RC30)

# LEGION RX 4.2.0 CLEAN FULL APP RC30 · START ORDER + SELECTION OUTLINE — TEST REPORT

## Scope
Two focused corrections over RC29: synchronize the official RallyCross pre-start order between sport data, cockpit and announcer; replace the rejected blue pilot/model selection glow with a thin neutral light outline. RallyCross scoring/run-off rules are unchanged.

## RC30 behavior verification
- Qualification start order preserves the exact sport-generated `event.pilots` sequence: PASS.
- Finals start order follows the existing qualification-rating grid logic: PASS.
- Cockpit at zero/equal timing preserves official start order instead of registration order: PASS.
- Live timing still reorders pilots normally when laps/time differ: PASS.
- Start-call announcer consumes the same authoritative start order and has no separate finals sort: PASS.
- RallyCross manual pilot pickers consume the same start/live ordering: PASS.
- Selected pilot card uses thin neutral 1 px outline + restrained 5 px halo, no blue fill/glow: PASS.
- Selected model tile/chip uses the same selected-state language: PASS.
- No transform/layout movement in selected state: PASS.

## Automated regression
- `verify_architecture.py`: PASS.
- `verify_clean_foundation.py`: PASS with RC30 intended RallyCross hashes.
- `verify_ios_start_safety.py`: PASS; START/audio/storage safety preserved.
- `verify_pilot_cards.py`: PASS.
- `verify_rc26_ui_safety.py`: PASS.
- `verify_rc27_ui_safety.py`: PASS with RC30 neutral selected-state contract.
- `verify_rc28_manual_storage.py`: PASS.
- `verify_rc28_storage_behavior.js`: PASS.
- `verify_rc29_rallycross_runoffs.py`: PASS.
- `verify_rc29_rallycross_runoffs.js`: **28/28 PASS**.
- `verify_rc30_start_order_selection.js`: **12/12 PASS**.
- RallyCross boot self-test remains **18/18 PASS**, rule version `RALLYCROSS-2026.09.2`.
- JavaScript syntax: **39/39 PASS**.
- Offline manifest local assets: PASS / no missing local file.
- No duplicate global functions / no DOM inside sport core / no BLE protocol inside UI: PASS.

## Protected unchanged areas
- `modes/rallycross/rules.js`, `qualifying.js`, `finals.js`, `self-test.js`: scoring/run-off rules unchanged from RC29.
- `modes/free-practice/index.js`: unchanged.
- `modes/classic-rc/index.js`: unchanged.
- `modes/rally-sprint/index.js`: unchanged.
- `platform/audio.js`: unchanged; RC30 only changes RallyCross audio action ordering.
- LapWiz protocol: unchanged.
- Storage / RC28 quota-safe archive path: unchanged.
- Reporting modules: unchanged.

## Real-device acceptance still required
Container tests cannot reproduce physical LapWiz/Bluetooth/Safari timing. On device verify: (1) a qualification heat whose prepared order differs from registration order is shown and spoken in exactly the same 1→N order; (2) a Final A grid is shown and spoken in qualification-rating order; (3) RC29 qualification/Final A run-off acceptance still behaves with zero extra points/results.

---

## Previous report snapshot (RC29)

# LEGION RX 4.2.0 CLEAN FULL APP RC29 · RALLYCROSS RUNOFF TIEBREAK — TEST REPORT

## Scope
Focused RallyCross sport-rule change only: remove random draw and resolve exact aggregate ties by real run-offs. Free Practice sport logic, LapWiz protocol, audio, storage, reporting and RC28 iPhone quota-safe archival are not redesigned.

## Rule verification
- Qualification BEST 3 points and existing finishing-position/discarded-result countback preserved: PASS.
- Latest-round fallback removed as an official tie resolver: PASS.
- Random draw implementation/action removed: PASS.
- Exact qualification tie creates run-off for tied pilots only: PASS.
- Qualification run-off writes no qualification result and adds no Q points: PASS.
- Final A BEST 2 sum preserved: PASS.
- Equal Final A sum -> better individual counted place: PASS.
- Still equal -> more laps / lower elapsed time of best counted result: PASS.
- Still equal -> second counted result and laps/time: PASS.
- Three-way exact Final A tie -> one run-off containing only the three disputed pilots: PASS.
- Middle-table qualification tie -> run-off contains only the tied pilots; positions above/below remain unchanged: PASS.
- Exact remaining Final A equality creates run-off for tied pilots only: PASS.
- Final run-off is not appended to scored `pilot.finalResults`: PASS.
- Final run-off has no event points of its own: PASS.
- Official event points are assigned only from the resolved final protocol: PASS.
- User screenshot case (`2,3,4 places all total 5`): pilot with `1+4` ranks above `2+3`; only the still-exact `2+3` pair receives a run-off: PASS.

## Automated regression
- `verify_architecture.py`: PASS.
- `verify_clean_foundation.py`: PASS with RC29 intended RallyCross hashes.
- `verify_ios_start_safety.py`: PASS; iOS START/finish confirmation behavior preserved.
- `verify_pilot_cards.py`: PASS; pilot UI remains intact.
- `verify_rc26_ui_safety.py`: PASS.
- `verify_rc27_ui_safety.py`: PASS.
- `verify_rc28_manual_storage.py`: PASS.
- `verify_rc28_storage_behavior.js`: PASS.
- `verify_rc29_rallycross_runoffs.py`: PASS.
- `verify_rc29_rallycross_runoffs.js`: **28/28 PASS**.
- RallyCross boot self-test: **18/18 PASS**, rule version `RALLYCROSS-2026.09.2`.
- JavaScript syntax: **38/38 PASS**.
- Offline manifest local assets: PASS / no missing local file.
- No duplicate global functions / no DOM inside sport core / no BLE protocol inside UI: PASS.

## Protected unchanged areas
- `modes/free-practice/index.js`: byte-identical to RC28.
- `modes/classic-rc/index.js`: byte-identical to RC28.
- `modes/rally-sprint/index.js`: byte-identical to RC28.
- `modes/rallycross/audio-actions.js`: byte-identical to RC28.
- LapWiz platform protocol: unchanged.
- Storage / RC28 quota-safe archive path: unchanged.
- Reporting modules: unchanged.

## Device acceptance still required
Container tests can validate calculations and event flow but cannot reproduce a physical LapWiz race. On the device, force one exact qualification tie and one exact Final A tie, verify that the next current event is labelled `ПЕРЕЗАЕЗД`, contains only the tied pilots, and that no extra Q/final score is added after saving it.

---

## Previous report snapshot (RC28)

# LEGION RX 4.2.0 CLEAN FULL APP RC28 · MANUAL PILOT TILES & IOS STORAGE SAFETY — TEST REPORT

## Scope
Shared manual pilot picker presentation plus a focused persistence safety correction for the iPhone finish/archive `QuotaExceededError`. RallyCross sport rules/runtime, Free Practice sport logic, LapWiz protocol, audio and reporting were not changed.

## Automated regression
- `verify_architecture.py`: PASS
- `verify_clean_foundation.py`: PASS
- `verify_ios_start_safety.py`: PASS
- `verify_pilot_cards.py`: PASS
- `verify_rc26_ui_safety.py`: PASS
- `verify_rc27_ui_safety.py`: PASS
- `verify_rc28_manual_storage.py`: PASS
- `verify_rc28_storage_behavior.js`: PASS
- JavaScript syntax: PASS for all project/test JS files
- RallyCross sport self-test: PASS (sport files byte-identical to RC27)
- Offline manifest local assets: PASS / no missing local file

## RC28-specific behavior checks
- RallyCross manual lap dialog uses shared ID/name/flag card: PASS
- RallyCross manual pass dialog uses shared ID/name/flag card: PASS
- Free Practice manual pass dialog uses the same shared card: PASS
- Old initials-based manual picker markup/styles removed: PASS
- Race/archive persistence strips duplicated embedded pilot photos: PASS
- Track Day persistence strips duplicated embedded pilot photos: PASS
- Legacy stored snapshots compact automatically: PASS
- Quota retry occurs after compaction: PASS
- Dynamic simulated quota test: completed race archives and clears successfully after compaction: PASS
- Failure path keeps active race until archive persistence succeeds: PASS
- RallyCross / Free Practice sport files, LapWiz and reporting hashes unchanged: PASS

## Device acceptance still required
A real iPhone/Safari storage implementation and real LapWiz hardware cannot be fully reproduced in the container. After installing RC28, test a completed competition on the same iPhone that showed `QuotaExceededError`, verify that `ЗАВЕРШИТЬ` archives it without the red runtime error, then reopen the archive/result. Also verify both RallyCross and Free Practice manual-lap dialogs on the target phone/tablet.

---

## Previous report snapshot (RC27)

# LEGION RX 4.2.0 CLEAN FULL APP RC27 · PRACTICE GLOW & LIVE THEME — TEST REPORT

## Scope
Isolated UI correction on RC26. No sports-rule, LapWiz protocol, audio, reporting, start or finish logic redesign.

## Automated regression
- `verify_architecture.py`: PASS (8/8)
- `verify_clean_foundation.py`: PASS
- `verify_ios_start_safety.py`: PASS
- `verify_pilot_cards.py`: PASS
- `verify_rc26_ui_safety.py`: PASS
- `verify_rc27_ui_safety.py`: PASS
- JavaScript syntax: 36/36 PASS
- RallyCross self-test: PASS, all 16 checks
- Offline manifest: 80 local entries, 0 missing
- Protected sport / LapWiz / reporting hashes checked by regression tests: PASS

## RC27-specific checks
- Free Practice selected pilot card gets perimeter glow without border/layout change: PASS
- Selected model mini-tile gets its own perimeter glow: PASS
- Selection CSS has no transform/shake animation: PASS
- Custom background color is rendered as theme-aware Dark/Light variants: PASS
- Theme toggle already reapplies background immediately: PASS
- Model color square contains existing LapWiz ID on open: PASS
- LapWiz ID updates inside the square during input: PASS
- Color input remains the same clickable square: PASS

## Device acceptance still required
Real iPhone/Safari and physical LapWiz cannot be emulated by these static/runtime checks. Test Free Practice selection visibility and Dark/Light background switching on the target device after installation.
