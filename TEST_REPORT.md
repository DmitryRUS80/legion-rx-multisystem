# LEGION RX 4.2.0 CLEAN FULL APP RC24 · GLASS PILOT TILES — TEST REPORT

Direct development base: **RC21 IOS START SAFETY**.
Known deployed GitHub base at the start of this task: **RC20 CLEAN FOUNDATION**; therefore the GitHub upload package for RC22 is cumulative from RC20 and also carries the accepted RC21 iOS-start-safety files.

## Scope

RC22 is a UI-only pilot-system rebuild:

- new tile-based pilot database card;
- model tiles attached to each pilot profile;
- tap-to-add / tap-to-remove model selection for race setup instead of the former race checkbox picker;
- expanding blurred pilot editor overlay;
- avatar upload/crop-downscale path preserving alpha when the source format contains transparency;
- legacy pilot profiles without `models[]` remain readable through a single fallback primary model;
- former pilot-card / race-pilot-picker implementations are removed from `ui/shell/views.js` and former pilot-card styles are removed from `ui/shell/app.css`.

TOP-3 post-finish cards are intentionally **not** part of RC22. They remain a separate future UI task.

## Architecture / regression

PASS:

- architecture verifier: **8/8**;
- clean-foundation verifier: **PASS**;
- iOS START safety verifier: **PASS**;
- pilot-card dedicated verifier: **PASS**;
- JavaScript syntax: **36/36 PASS**;
- RallyCross sport self-test: **16/16 PASS**, `RALLYCROSS-2026.09.1`;
- `modes/` byte-identical to RC21;
- `app.js` byte-identical to RC21;
- protected `platform/` logic byte-identical to RC21 except the already accepted RC21 audio safety baseline; RC22 itself does not modify platform logic;
- `reporting/` byte-identical to RC21;
- service-worker safe staged-update behavior unchanged; only RC22 release namespace/assets are updated.

## Pilot UI checks

PASS:

- `ui/pilots/pilot-cards.js` is loaded once and owns `pilotsView`, `pilotModal`, and `pilotPicker`;
- old `pilotProfileCard` UI is absent;
- pilot database cards do not expose a large text “Редактировать” button; editing is opened from the small corner icon;
- race model selection is tile-tap based and toggles add/remove;
- selecting another model for the same pilot replaces the previous race entry rather than duplicating the pilot;
- editor contains country, club, city, avatar, model garage and local announcer-name controls;
- avatar upload path accepts PNG/JPEG/WebP, downscales to max 720 px and stores WebP locally; alpha is preserved when provided by the source/canvas path;
- Dark/Light theme tokens are reused; no pilot theme override file exists;
- component CSS uses blur/translucency/motion and includes reduced-motion fallback;
- no patch/hotfix/override file was added.

## Browser component runtime

The environment blocks Chromium navigation to local HTTP/file URLs, so the complete PWA cannot be certified as a real iPhone/Safari instance here. A Chromium runtime component harness was therefore executed with the **exact RC22 `theme.css`, `pilot-cards.css` and `pilot-cards.js`** and minimal application stubs.

PASS:

- three pilot cards render;
- expanded pilot editor opens;
- multiple model editors render;
- tapping a model adds the expected pilot/model/transponder to the race;
- tapping the same model again removes it;
- Dark render;
- Light render;
- 390 px mobile render;
- JavaScript runtime errors: **0**.

## Real-device acceptance required

1. iPhone / Android: open Pilot database in Dark and Light themes.
2. Open an existing pilot via the small edit icon; save without changing data and verify nothing is lost.
3. Upload an avatar; close/reopen the profile and verify it remains available offline.
4. Add a second model with its own ID/transponder/color.
5. In race setup open the pilot picker, tap one model and verify exactly one pilot is added with that model/transponder.
6. Tap the same model again and verify the pilot is removed.
7. Select a different model for that pilot and verify the entry is replaced rather than duplicated.
8. Re-run the RC21 iPhone START check: sound off → RallyCross → START must still run.

## Release status

**RC22 PILOT CARDS — static/runtime component checks PASS; ready for device UI acceptance.**


## RC22 · PILOT CARDS UI verification

PASS:
- architecture verifier: 8/8;
- clean-foundation verifier: PASS;
- iOS START safety verifier: PASS;
- dedicated pilot-card verifier: PASS;
- all JavaScript files: `node --check` PASS;
- isolated Chromium component render: database cards / editor / model picker / Dark / Light / mobile PASS with zero page errors;
- model-tile tap adds a model to the event and second tap removes it;
- protected `modes/`, `platform/`, `app.js` and reporting logic remain byte-identical to RC21 where declared protected.

Real iPhone/Android interaction and stored user data still require field acceptance after deployment.


## RC23 verification
- Architecture separation: PASS.
- Clean foundation invariants: PASS.
- iOS START safety invariants: PASS.
- Pilot component authority / old-card removal: PASS.
- RC23 layout assertions (name below avatar, silhouette placeholder, clean model text, neutral selected glass, race-setup model-card reuse): PASS.
- JavaScript syntax check across all project `.js` files: PASS.
- Chromium component runtime: pilot database cards render; silhouette placeholder renders; model tap adds/removes; selected state uses no checkmark; race setup uses the same mini-card and removes through existing `data-remove-race-pilot` action path. PASS.
- Protected `modes/`, `platform/`, `app.js`, reporting are unchanged from RC22/RC21 baseline except release namespace files outside those protected areas.

Physical iPhone/Safari and LapWiz hardware remain device tests and cannot be certified in this container.


## RC24 verification
- Architecture separation: PASS.
- Clean-foundation invariants: PASS.
- iOS START safety invariants: PASS.
- Pilot component authority / old-card removal: PASS.
- Square frameless pilot avatar: PASS.
- Flat lower-right flag with no border/radius/shadow: PASS.
- Flat 38 px model ID strip: PASS.
- Neutral selected-model glass state with no transform/shake: PASS.
- Pilot editor internal fields/avatar/model blocks use flat line-based geometry: PASS.
- RallyCross setup selected participants render as compact portrait tiles rather than long rows: PASS.
- Chromium component runtime: Dark pilot cards / editor / picker selection / three participant tiles: PASS; page errors 0.
- Protected `modes/`, `platform/`, `app.js`, reporting: unchanged from the protected RC21/RC23 baseline.

Physical iPhone/Safari and LapWiz hardware remain mandatory device acceptance tests.
