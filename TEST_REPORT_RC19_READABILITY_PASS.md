# LEGION RX 4.2.0 CLEAN FULL APP RC19 READABILITY PASS — TEST REPORT

Base: **4.2.0 CLEAN FULL APP RC18 GLOBAL THEMES**.

## Task scope
UI-only visual corrections from real-device screenshots:
- make the active-event `ПРОДОЛЖИТЬ` button readable in Light theme;
- enlarge the one-line leader/BEST strip typography;
- enlarge portrait tablet/phone red race-banner typography;
- enlarge the small labels around the timer/ring.

## Source discipline
- The active-event button issue was corrected by removing the older hard-coded white declaration from its existing rule in `ui/shell/current-base.css`; no CSS patch or later override was added.
- Cockpit typography was changed directly in the authoritative `ui/shell/discipline-pults-rc5restore.css` rules and their existing desktop/tablet/phone breakpoints.
- No JavaScript behavior change was needed.

## Static / architecture
- Architecture verifier: **8/8 PASS**.
- All 34 JavaScript files: syntax **PASS**.
- All 4 CSS files: structural parse **PASS**.
- Offline asset manifest / local CSS assets: **PASS** (architecture verifier).
- RallyCross sport self-test `RALLYCROSS-2026.09.1`: **16/16 PASS**.

## UI source checks
- obsolete `.liveCard .btn.primary { color:#fff!important; ... }` declaration removed from the existing source — **PASS**;
- theme-owned `.liveCard .btn` remains the authoritative active-event button color source — **PASS**;
- one-line BEST strip stays one row; only its typography/icon scale and internal padding changed — **PASS**;
- portrait tablet race-banner font raised to 30 px inside the existing 42 px strip — **PASS**;
- portrait phone race-banner font raised to 24 px inside the existing 40 px strip; `PILOTS` no longer shrinks separately — **PASS**;
- timer support captions enlarged at their existing selectors — **PASS**.

## Protected source comparison against RC18
Byte-identical:
- `platform/` — unchanged;
- all `modes/` — unchanged;
- `reporting/` — unchanged;
- `app.js`, `app-bridge.js` — unchanged;
- `ui/discipline-ui-rc5restore.js` — unchanged;
- `ui/shell/current-ui.js`, `bindings.js`, `discipline-shared.js` — unchanged;
- `ui/themes/variant4.css` — unchanged;
- `index.html`, `manifest.webmanifest` — unchanged.

Runtime files actually changed for this UI task:
- `ui/shell/current-base.css`;
- `ui/shell/discipline-pults-rc5restore.css`;
- version/offline cache identity files.

## Version / offline
- `VERSION.txt`, `offline-config.js`, and service-worker cache identity point to **RC19 READABILITY PASS**.
- no new runtime asset was added.

## Visual acceptance still required
Real PWA/device screenshots are required for final visual acceptance, especially:
- Light Home active-event card;
- RallyCross leader/BEST strip;
- portrait tablet race banner;
- portrait phone race banner;
- timer class/subline/ring labels.

Physical LapWiz BLE and cold offline-start remain real-device tests before GOLD.

Status: **RC19 candidate for visual testing.**
