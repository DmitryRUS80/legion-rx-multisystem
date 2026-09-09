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
