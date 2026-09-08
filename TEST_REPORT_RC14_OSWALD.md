# LEGION RX 4.2.0 CLEAN FULL APP RC14 OSWALD — TEST REPORT

## Scope
UI typography only + offline delivery of the selected UI font.

## Changed
- Added `ui/fonts/oswald.css`.
- Existing UI font variables now point to Oswald.
- Removed device-dependent Bahnschrift / Roboto Condensed / Arial Narrow stacks from active UI CSS.
- Added Oswald Cyrillic + Latin webfont resources to the offline cache manifest.
- Service worker can cache and serve the selected external font resources.

## Explicitly not changed
- `app.js`
- `platform/lapwiz.js`
- `platform/timing.js`
- `platform/storage.js`
- `modes/rallycross/*`
- `modes/free-practice/*`
- pilot-row geometry / grid columns / row heights

## Static checks
- JavaScript syntax: PASS
- No old Bahnschrift / Roboto Condensed / Arial Narrow references in active UI CSS: PASS
- Oswald CSS loaded before app styles: PASS
- Oswald CSS listed in local offline assets: PASS
- Oswald Cyrillic + Latin weights 400/500/600/700 listed in external offline assets: PASS
- Core/modes byte identity vs RC13: PASS

## Physical test
Not performed on iPhone / iPad / Android / LapWiz hardware in this environment.
