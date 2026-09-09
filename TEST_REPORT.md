# LEGION RX 4.2.0 CLEAN FULL APP RC25 · COMPACT PILOT GRID — TEST REPORT

Direct code base: **RC24 GLASS PILOT TILES**.

## Scope

RC25 is a pilot-UI correction only:

- dense adaptive pilot database grid: 4–5 tiles across on desktop, 2–3 on portrait mobile/tablet;
- square avatar viewports with centered `object-fit: cover` photo crop;
- flat lower-right flag without border/radius/shadow;
- compact race-picker portrait tiles matching the accepted sketch;
- model selection updated in place with no shake/full picker re-render;
- one user-facing `ID LAPWIZ` field; it is the transponder ID used by the unchanged timing core;
- compact pilot editor with larger/closer field labels, no horizontal guide-lines and square model-color swatch;
- compact participant tiles reused in race setup.

## Architecture / protected logic

PASS:

- architecture verifier: **8/8**;
- clean-foundation invariants: **PASS**;
- iOS START safety invariants: **PASS**;
- pilot-component verifier: **PASS**;
- RallyCross sport self-test: **16/16 PASS**;
- JavaScript syntax: **36/36 PASS**;
- `modes/`, `platform/`, `app.js` and `reporting/`: **byte-identical to the protected baseline**;
- no patch/hotfix/override file added;
- `ui/pilots/pilot-cards.js` + `pilot-cards.css` remain the single authoritative pilot-card implementation.

## UI checks

PASS:

- desktop pilot database renders at least 4 columns and 5 columns on wide desktop;
- 390 px portrait layout renders 2 columns;
- uploaded photos fill a square viewport without distortion and remain centered;
- placeholder is a neutral human silhouette;
- pilot name is compact uppercase under the avatar;
- race picker uses compact square portrait tiles and square model-ID stickers;
- selected model has neutral glass highlight, no colored outline and no transform/shake;
- selection updates without rebuilding the picker DOM;
- race setup uses compact portrait participant tiles instead of legacy long rows;
- editor exposes a single `ID LAPWIZ` field and mirrors that value to compatibility `number`/`transponder` properties only for the unchanged core;
- no duplicate transponder input;
- model color swatch is square;
- editor labels are larger and closer to values; horizontal input guide-lines are absent;
- pilot flag styling is component-local and no `!important` override is required.

## Browser component runtime

Chromium component harness using the exact RC25 pilot JS/CSS: **PASS**.

Verified:

- desktop dense grid;
- portrait mobile grid;
- compact editor;
- compact race picker;
- in-place select/remove/switch behavior;
- canonical selected race transponder equals the visible model ID;
- JavaScript page errors: **0**.

Complete PWA navigation through local HTTP is blocked in this execution environment (`ERR_BLOCKED_BY_ADMINISTRATOR`). Physical iPhone/Android PWA acceptance therefore remains required.

## Real-device acceptance

1. Upload a portrait photo and confirm centered square crop.
2. Confirm 2-column phone portrait grid and 4–5-column desktop/tablet grid.
3. Select/remove/switch models and confirm the picker does not shake or redraw.
4. Confirm the visible model ID is the same LapWiz transponder ID used in the race.
5. Confirm race setup shows compact portrait tiles, not legacy long rows.
6. Re-run iPhone safety check: sound off → RallyCross → START must still start the race.

**Release status: RC25 static/component/runtime checks PASS; ready for real-device UI acceptance.**
