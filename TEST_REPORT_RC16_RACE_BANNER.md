# LEGION RX 4.2.0 CLEAN FULL APP RC16 RACE BANNER — TEST REPORT

Base: **4.2.0 CLEAN FULL APP RC15 FINISH REPORT CORE**.

## Task scope
UI-only RallyCross cockpit refinement:
- flat red compact race banner replaces the old long dark event title block;
- active race class is shown above the timer instead of duplicating the phase caption;
- no pilot cards / pre-start overlay / post-race podium were added in this build.

## Static / architecture
- All 34 JavaScript files: syntax PASS.
- Architecture verifier: 8/8 PASS.
- Offline asset manifest: complete; every listed local asset exists.
- CSS local asset references: PASS.
- No duplicate global functions detected.
- No BLE protocol or sport scoring constants introduced into UI.

## RallyCross sport regression
`RALLYCROSS-2026.09.1` self-test: **16/16 PASS**.

Protected files compared byte-for-byte with RC15:
- `platform/` — unchanged.
- all `modes/` — unchanged, including `modes/rallycross/`.
- `reporting/` — unchanged.
- `app.js`, `app-bridge.js`, `index.html`, `manifest.webmanifest`, `SPORT_RULES.md` — unchanged.
- audio / flags / icons — unchanged.

## RC16 banner checks
Prepared UI data checks:
- qualification with four heats: `Q1 · HEAT 1/4` — PASS;
- last qualification heat: `Q4 · HEAT 4/4` — PASS;
- three-pilot heat occupancy: `PILOTS 3/6` — PASS;
- Final A first run: `FINAL A · HEAT 1/3` — PASS;
- six-pilot final occupancy: `PILOTS 6/6` — PASS.

The existing finals start-grid command remains available through compact `СЕТКА` button.

## Version / offline
- `VERSION.txt`, `offline-config.js` and service-worker cache name all point to RC16 RACE BANNER.
- Offline asset list itself is unchanged because no new runtime asset file was added.

## Still requires device test
- visual acceptance on the user's actual desktop/tablet/phone resolutions;
- physical LapWiz BLE;
- cold PWA start with network disabled.

Status: **RC16 candidate for UI testing.**
