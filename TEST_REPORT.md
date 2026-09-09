# LEGION RX 4.2.0 CLEAN FULL APP RC26 · PILOT FLOW & UI SAFETY — TEST REPORT

Direct code base: **RC25 COMPACT PILOT GRID**.

## Scope
RC26 is an isolated UI/workflow correction. It changes pilot cards/selectors, Free Practice setup selection, page background/theme behavior and the completed-competition confirmation path. RallyCross sport rules/runtime, Free Practice sport module, LapWiz platform protocol, audio engine, staged offline updater and reporting logic are not redesigned.

## Static / architecture regression
PASS:
- `tests/verify_architecture.py` — 8/8 architecture invariants.
- `tests/verify_clean_foundation.py` — clean CSS/runtime/offline foundation.
- `tests/verify_ios_start_safety.py` — START remains independent from audio; iOS completed-competition confirmation path is present.
- `tests/verify_pilot_cards.py` — authoritative pilot component, compact grid/pickers, single LapWiz ID, centered avatar crop, Practice tile reuse.
- `tests/verify_rc26_ui_safety.py` — immediate theme/background/color behavior, stripe removal, in-app finish confirmation and protected boundaries.
- JavaScript syntax — all runtime JS PASS.
- RallyCross self-test remains 16/16 PASS through the unchanged sport module.

## Pilot / Practice UI checks
PASS:
- vertical and horizontal source photos are square-cropped from the exact center by the short side before storage; display surfaces also use centered `cover`;
- Legion RX team badge uses the black branded mark; another club shows its literal name; empty club shows nothing; no explanatory Easter-egg hint is rendered;
- race model selection shows the vehicle class under the colored LapWiz ID;
- Free Practice no longer uses the legacy checkbox/list pilot cards and uses the same compact pilot/model tiles;
- selected Practice model carries that model's existing LapWiz ID/class into the Track Day participant snapshot; `modes/free-practice/` remains unchanged;
- selected tiles do not use shake/transform selection animation.

## Immediate UI behavior
PASS:
- dark/light switch persists and applies immediately without the general Save button;
- background color applies/persists immediately;
- local background image can be uploaded, compressed, applied and removed; legacy non-cockpit stripe background is removed;
- existing pilot model color changes visually and persists immediately without saving the full profile; matching active-race presentation color is updated without changing its transponder identity.

## iPhone completion safety
PASS in the browser/component harness:
- completed RallyCross `ЗАВЕРШИТЬ` opens an application modal rather than relying on native `confirm()` from the cockpit action;
- modal confirmation calls `completeCompetition(true)`;
- `app.js` stays DOM-free and archives/clears the race through the existing completion path.
Physical iPhone standalone-PWA acceptance is still required.

## Protected boundaries
Byte-identical to the RC25 accepted baseline:
- all `modes/` sport modules, including RallyCross and Free Practice;
- all `platform/` modules, including LapWiz/audio/offline/storage;
- reporting core/sections.

`app.js` has one intentional orchestration change only: `completeCompetition(confirmed=false)` accepts the UI-confirmed path. No DOM access was introduced.

## Browser/component execution
PASS:
- exact RC26 pilot component behavior;
- race/Practice tile selection and model snapshot;
- centered avatar crop with pixel-level vertical and horizontal center-crop test;
- local background helper and color application;
- live pilot model-color persistence;
- completed-competition in-app modal → archive/clear behavior;
- page errors: 0.

Full localhost PWA navigation is blocked by the execution environment (`ERR_BLOCKED_BY_ADMINISTRATOR`), therefore real Home Screen iPhone/iPad offline, Safari media gesture and physical LapWiz BLE remain device acceptance tests.

**Release status: RC26 static/component regression PASS; ready for real-device acceptance.**
