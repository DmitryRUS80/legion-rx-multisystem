## RC36
- `verify_rc36_best_lap_strip.py` checks removal of the full-width leader photo implementation, the new BEST LAP + live-time strip, removal of trophy/leader wording and preservation of the existing dynamic refresh path.

## RC35
- `verify_rc35_pilot_stats_typography.py` validates the focused live-stat typography/density/portrait-width refinement.

# Regression helpers
Run `python3 tests/verify_architecture.py` after every structural/UI change. It enforces the hard architecture boundaries and checks the offline manifest.

## RC34

- `verify_rc34_live_pilot_stats.py` checks the compact live broadcast card: one live refresh path, existing ticker integration, live POS/BEST/AVG/LAPS/TIME, full name + colored transponder ID, landscape/portrait roster geometry, subtle background blur, neutral lap rows, BEST/WORST-only accents and preserved Free Practice lap delete.
- Expected focused result: **17/17 PASS**.

## RC33

- `verify_rc33_pilot_stats_ui.py` checks the new roster-bounded pilot lap-statistics UI, authoritative ranking sources, shared pilot-card avatar markup, BEST/AVG/WORST accent mapping, removal of the legacy stats UI, and preservation of Free Practice judge lap deletion.
- Expected focused result: **16/16 PASS**.

## RC32

- `verify_rc32_skip_flow.js` reproduces and guards the operator skip regression: empty qualification cancellations, cancelled Final A, large-field preliminary LCQ cancellation, mandatory run-off skip protection, and force-finish recovery.
- Expected focused result: **11/11 PASS**.

## RC31
- `verify_rc31_column_grid.py` — verifies that each existing cockpit `rxnHide-*` toggle class maps to `display:none` for the matching metric cell in the authoritative cockpit stylesheet, and that RallyCross / Free Practice still share the same row component.
- Browser smoke used for RC31 acceptance checks all 64 GAP/✓/BEST/AVG/LAST/LAPS combinations at desktop, Android-landscape and tablet viewports; visible cells remain in one grid row.


## RC28
- `verify_rc28_manual_storage.py` checks the shared cockpit pilot action tile, removal of initials-based manual cards, quota-safe persistence structure and protected sport/BLE hashes.
- `verify_rc28_storage_behavior.js` simulates browser storage quota pressure and verifies legacy compaction plus completed-race archival without embedded avatar duplication.

- `verify_rc29_rallycross_runoffs.py` checks that random draw UI/sport code is gone, run-off routing exists, and run-offs cannot enter qualification/final scoring arrays.
- `verify_rc29_rallycross_runoffs.js` behavior-tests qualification and Final A equality resolution, no-extra-points guarantees, final laps/time countback, and the exact 5-point screenshot scenario.
## RC30
- `verify_rc30_start_order_selection.js` behavior-tests qualification heat order preservation, qualification-rated final order, stable zero-lap cockpit ordering, live reordering after timing changes, shared announcer order, and neutral thin pilot/model selected-state styling.

