# LEGION RX 4.2.0 CLEAN FULL APP RC17 COCKPIT READABILITY — TEST REPORT

Base: **4.2.0 CLEAN FULL APP RC16 RACE BANNER**.

## Task scope
UI-only RallyCross cockpit correction after the first real RC16 desktop test:
- race banner made roughly half as tall on desktop;
- banner pilot occupancy uses the actual current heat composition;
- best-lap leader strip is one line and stays empty until a real BEST exists;
- pilot display names are uppercase;
- cockpit pilot-name scale reduced without changing row geometry.

## Static / architecture
- All 34 JavaScript files: syntax PASS.
- Architecture verifier: 8/8 PASS.
- Offline asset manifest: complete; every listed local asset exists.
- CSS local asset references: PASS.
- No duplicate global functions detected.
- No BLE protocol or sport scoring constants introduced into UI.

## RallyCross sport regression
`RALLYCROSS-2026.09.1` self-test: **16/16 PASS**.

Protected files compared byte-for-byte with RC16:
- `platform/` — unchanged.
- all `modes/` — unchanged, including every RallyCross rule/runtime file.
- `reporting/` — unchanged.
- `app.js`, `app-bridge.js`, `index.html`, `manifest.webmanifest`, `SPORT_RULES.md` — unchanged.
- audio / flags / icons — unchanged.

## RC17 UI behavior checks
Executable UI-function test with a four-heat qualification and three pilots:
- Q2: `Q2 · HEAT 2/4 · RALLYCROSS · PILOTS 3/3` — PASS.
- Final A: `FINAL A · HEAT 1/3 · RALLYCROSS · PILOTS 3/3` — PASS.
- Before a valid lap BEST: best-lap owner = `null`, name display = `—` — PASS.
- BEST ownership test: 9.200 / 8.750 / 9.010 sec selects the 8.750 pilot — PASS.
- Display-name helper: `Дмитрий Кочетков` → `ДМИТРИЙ КОЧЕТКОВ` — PASS.
- Shared pilot-name markup also uppercases display text without changing stored data — PASS.

## Layout source checks
- desktop RallyCross title row: **40 px** (RC16 was 78 px) — PASS.
- base/tablet title rows compacted in their authoritative media rules — PASS.
- leader/BEST markup has no two-line nested name block — PASS.
- leader strip uses one horizontal four-column grid — PASS.
- desktop cockpit pilot name: **24 px**, separate from row metric scale — PASS.
- no new CSS patch/override file and no JS override function added — PASS.

## Version / offline
- `VERSION.txt`, `offline-config.js` and service-worker cache name all point to RC17 COCKPIT READABILITY.
- Runtime asset list is unchanged because no new runtime asset file was introduced.

## Still requires real-device acceptance
- visual check on the user's 1792×856 desktop screenshot target;
- tablet/phone visual check;
- physical LapWiz BLE;
- cold PWA start with network disabled.

Status: **RC17 candidate for UI testing.**
