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
