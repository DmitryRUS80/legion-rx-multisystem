# LEGION RX 4.2.0 CLEAN FULL APP RC20 · CLEAN FOUNDATION

This is the clean foundation build for the next visual/product phase of Legion RX.

- RallyCross, Free Practice, LapWiz and sport rules are preserved from RC19.
- Current RallyCross cockpit appearance is preserved as the visual baseline.
- UI styles are reduced to one global component source, one palette-token source and one discipline cockpit source.
- Dark remains the default theme; Light uses the same geometry/icons with inverted neutral colors.
- The app starts from the complete active local PWA package; internet is not required for the active race workflow.
- Settings contains **Обновление и Offline**: current version, offline-package state, update check and explicit install.
- A candidate update cannot replace the active version until its complete package has downloaded successfully.
- Safari/iPhone sound unlock remains a deliberate user tap and is independent of network/update logic.
- `reporting/` remains hidden and ready for future RallyCross / Practice / Rally report formats.

**RC20 is an RC candidate, not GOLD.** Final acceptance still requires real-device iPhone/iPad offline cold-start and physical LapWiz testing.
