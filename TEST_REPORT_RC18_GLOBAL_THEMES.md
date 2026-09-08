# LEGION RX 4.2.0 CLEAN FULL APP RC18 GLOBAL THEMES — TEST REPORT

Base: **4.2.0 CLEAN FULL APP RC17 COCKPIT READABILITY**.

## Task scope
UI-only global theme pass:
- Dark becomes the consistent default appearance across application pages and cockpit;
- Light is the same UI with inverted neutral surfaces/icons;
- semantic colored accents stay intact;
- bright lime/green is reduced only in Light for contrast on white.

## Static / architecture
- All 34 JavaScript files: syntax PASS.
- Architecture verifier: 8/8 PASS.
- All 4 CSS files parse without stylesheet errors: PASS.
- Offline asset manifest complete: PASS.
- CSS local asset references: PASS.
- No BLE protocol or sport scoring constants introduced into UI.

## RallyCross sport regression
`RALLYCROSS-2026.09.1` self-test: **16/16 PASS**.

Protected source comparison against RC17:
- `platform/` — byte-identical.
- all `modes/` — byte-identical.
- `reporting/` — byte-identical.
- `app.js`, `app-bridge.js` — byte-identical.
- `ui/discipline-ui-rc5restore.js`, `ui/shell/current-ui.js`, `ui/shell/bindings.js` — byte-identical.

## Theme source checks
- separate authoritative Dark and Light palette blocks exist — PASS.
- Dark control = black/near-black; Light control = white — PASS.
- Dark text/icons = white; Light text/icons = black/near-black — PASS.
- Race red `#df0b12` preserved — PASS.
- Magenta `#ff2d9b` preserved — PASS.
- Cobalt `#0057ff` preserved — PASS.
- Light lime/green uses darker `#5f8500` for contrast — PASS.
- cockpit controls consume theme variables rather than theme-specific duplicate components — PASS.
- race banner remains semantic red and does not invert — PASS.
- saved application default remains `dark` in the unchanged state module — PASS.
- browser `theme-color` follows Dark/Light in the existing theme application function — PASS.

## Version / offline
- `VERSION.txt`, `offline-config.js`, and service-worker cache identity point to RC18 GLOBAL THEMES.
- default manifest/background theme color matches Dark.
- no new runtime asset was added.

## Visual acceptance still required
Automated browser navigation is blocked in the build environment, so final visual acceptance must be done in the real PWA/device. Check both themes on:
- Home;
- Championships;
- Pilots;
- Settings;
- RallyCross cockpit;
- Free Practice;
- phone/tablet orientations.

Physical LapWiz BLE and cold offline-start remain real-device tests before GOLD.

Status: **RC18 candidate for visual theme testing.**
