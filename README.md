# LEGION RX 4.2.0 CLEAN FULL APP RC16 RACE BANNER

Current modular build based on RC15 FINISH REPORT CORE.

- `platform/` remains the shared hardware/service layer.
- RallyCross rules remain isolated in `modes/rallycross/`.
- Lap-limited RallyCross finish now follows leader-finish / next-valid-pass behavior for remaining active pilots.
- Qualification scoring, Best3, LCQ and A1/A2/A3 remain separate and unchanged.
- Free Practice remains a separate mode.
- Rally Sprint / Classic RC remain independent future modules.
- `ui/` remains separate from sport rules and BLE.
- RallyCross cockpit now uses a compact red race banner and shows the active class above the timer; this is UI-only.
- `reporting/` is a new hidden preparation layer with separate RallyCross / Practice / Rally adapters; it is not connected to UI yet and does not generate PDF.
- Full local audio package, flags, icons and Oswald UI remain included.

Status: RC candidate, not GOLD until physical LapWiz and cold offline-start tests on the real device pass.
