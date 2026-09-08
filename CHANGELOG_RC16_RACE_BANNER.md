# LEGION RX — RC16 RACE BANNER

Task: UI-only refinement of the RallyCross cockpit header.

## Changed
- Replaced the long dark RallyCross event title area with a flat red race-information banner.
- Qualification banner uses compact `Qn · HEAT x/y · RALLYCROSS · PILOTS n/6` notation.
- Main final banner uses `FINAL A · HEAT x/3 · RALLYCROSS · PILOTS n/6`.
- Existing finals start-grid action remains available as a compact `СЕТКА` button.
- Removed duplicated phase caption from the timer top line; the timer now shows the current race class there (for example `RALLY-10`).
- Existing phase/status information remains available through the status control and timer subline.

## Not changed
- `platform/`
- all `modes/`, including RallyCross sport rules/runtime
- pilot row geometry
- LapWiz, Min Lap, START marker, audio, storage
- Free Practice logic
- reporting logic

No patch/override files were added. The authoritative RallyCross UI files were edited directly.
