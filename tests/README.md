# Regression helpers
Run `python3 tests/verify_architecture.py` after every structural/UI change. It enforces the hard architecture boundaries and checks the offline manifest.


## RC28
- `verify_rc28_manual_storage.py` checks the shared cockpit pilot action tile, removal of initials-based manual cards, quota-safe persistence structure and protected sport/BLE hashes.
- `verify_rc28_storage_behavior.js` simulates browser storage quota pressure and verifies legacy compaction plus completed-race archival without embedded avatar duplication.
