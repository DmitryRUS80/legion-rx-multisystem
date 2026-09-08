# LEGION RX 4.2.0 CLEAN FULL APP RC18 GLOBAL THEMES

Current modular build based on RC17 COCKPIT READABILITY.

- `platform/` remains the shared hardware/service layer.
- RallyCross rules remain isolated in `modes/rallycross/`.
- Lap-limited RallyCross finish now follows leader-finish / next-valid-pass behavior for remaining active pilots.
- Qualification scoring, Best3, LCQ and A1/A2/A3 remain separate and unchanged.
- Free Practice remains a separate mode.
- Rally Sprint / Classic RC remain independent future modules.
- `ui/` remains separate from sport rules and BLE.
- RallyCross cockpit uses a 40 px desktop race banner, event-derived pilot occupancy, a one-line real-BEST leader strip, and uppercase pilot display names; these are UI-only.
- Global UI now has two real themes: Dark (default, black/graphite surfaces with white icons/text) and Light (white/light surfaces with black icons/text), with the same layout and iconography. Semantic race/accent colors are preserved; lime/green is darkened only in Light theme for contrast.
- `reporting/` is a new hidden preparation layer with separate RallyCross / Practice / Rally adapters; it is not connected to UI yet and does not generate PDF.
- Full local audio package, flags, icons and Oswald UI remain included.

Status: RC candidate, not GOLD until physical LapWiz and cold offline-start tests on the real device pass.
