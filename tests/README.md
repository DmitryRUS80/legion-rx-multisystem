# Regression helpers
Run `python3 tests/verify_architecture.py` after every structural/UI change. It enforces the hard architecture boundaries and checks the offline manifest.


## RC28
- `verify_rc28_manual_storage.py` checks the shared cockpit pilot action tile, removal of initials-based manual cards, quota-safe persistence structure and protected sport/BLE hashes.
- `verify_rc28_storage_behavior.js` simulates browser storage quota pressure and verifies legacy compaction plus completed-race archival without embedded avatar duplication.

- `verify_rc29_rallycross_runoffs.py` checks that random draw UI/sport code is gone, run-off routing exists, and run-offs cannot enter qualification/final scoring arrays.
- `verify_rc29_rallycross_runoffs.js` behavior-tests qualification and Final A equality resolution, no-extra-points guarantees, final laps/time countback, and the exact 5-point screenshot scenario.
## RC30
- `verify_rc30_start_order_selection.js` behavior-tests qualification heat order preservation, qualification-rated final order, stable zero-lap cockpit ordering, live reordering after timing changes, shared announcer order, and neutral thin pilot/model selected-state styling.

