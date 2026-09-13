# LEGION RX 4.2.0 CLEAN FULL APP RC42 · APEX ALTERNATE RENDERER TEST — TEST REPORT

## Scope

Alternate UI renderer only, based on RC40 FULL. Classic remains intact. APEX is implemented in separate renderer/CSS files and consumes the same state/actions. RallyCross/Free Practice sport core, LapWiz, audio, storage, reporting and pilot pipeline are unchanged.

## RC42 verification

- All JavaScript files pass `node --check`.
- Full automated regression suite PASS after updating two stale test assertions to understand the intentional sixth stylesheet (isolated APEX CSS) and the current RC42 cache namespace.
- `verify_architecture.py`: all checks PASS, including no BLE protocol or sport constants in UI.
- `verify_clean_foundation.py`: all checks PASS; Classic authoritative styles remain unchanged and APEX is treated as one isolated alternate-renderer stylesheet.
- `verify_ios_start_safety.py`: all checks PASS with RC42 cache namespace.
- `verify_rc42_apex_renderer.py`: all checks PASS, including Classic/core hash identity to RC40, separate APEX assets, alternate-router selection, own page renderers/icons/CSS namespace, no calls to Classic page renderers, protected cockpit board reuse and offline-manifest inclusion.
- RC29 RallyCross run-off: 28/28 PASS. RC30 start-order/announcer: 12/12 PASS. RC32 skip/state: 11/11 PASS. RC33–RC38 UI/avatar regression tests PASS.
- Offline manifest audit: 81 local asset references, 0 missing.
- Browser renderer smoke had already been run during RC42 implementation on desktop and 430px phone; the phone hero overlap found in the first pass was fixed before final packaging. The final runtime code has not changed since that smoke; only regression-test assertions/docs were updated afterward.
- Skin switching Classic ↔ APEX uses existing settings persistence and normal routing. APEX settings section switching is DOM-only and does not destroy unsaved field values.
- `VERSION.txt`, offline manifest app/display/cache IDs and service-worker release label are synchronized to RC42.
- Physical PWA/iPhone/Android/LapWiz acceptance remains user-side and is not claimed by automated tests.

## Protected invariants

- `ui/shell/app.css`, `ui/themes/theme.css`, `ui/shell/discipline-pults.css`, `ui/pilots/pilot-cards.css/js` are byte-identical to RC40.
- `platform/lapwiz.js`, `platform/audio.js`, `platform/storage.js`, RallyCross sport files, Free Practice core and reporting are byte-identical to RC40.
- Protected RallyCross cockpit contract remains: red race-status strip + authoritative pilot board/table are shared; APEX replaces the surrounding shell/right control surface only.

# LEGION RX 4.2.0 CLEAN FULL APP RC40 · CLEAN SETTINGS UI — TEST REPORT

## Scope

Settings UI shell rebuild from the RC38 FULL baseline. Runtime changes: `ui/shell/views.js`, `ui/shell/actions.js`, `ui/shell/app.css`, `ui/shell/discipline-shared.js`. Release files synchronized: `VERSION.txt`, `offline-manifest.js`, `sw.js`. Sport rules, LapWiz parser/timing, audio engine internals, storage engine, pilot database, reporting and cockpit UI are unchanged.

## RC40 verification

- JavaScript syntax check passes for every `.js` file in the package.
- Settings section navigation does not call `render()`: unsaved values remain in the DOM while switching desktop sections.
- Mobile accordion logic removes/open classes directly and allows the currently open section to close.
- Old settings classes (`settingsGrid`, `settingGroup`, `toggleRow`, `backgroundSettingGrid`, old background-setting helpers) are no longer used by Settings and their dedicated CSS rules were removed.
- Update UI remains wired to the existing `data-update-state`, `data-offline-ready`, `update-check`, `update-install`, and `offline-check` contracts.
- Existing save IDs are preserved for `save-settings`.
- `VERSION.txt`, `offline-manifest.js` display/app/cache version and service-worker release namespace are synchronized to RC40.
- Every local path listed in the offline manifest exists in the FULL package.
- Hash comparison against RC38 confirms no changes under `platform/`, `modes/`, `reporting/`, `ui/pilots/`, `ui/discipline-ui.js`, or `ui/shell/discipline-pults.css`.

## Physical acceptance still required

- PWA update RC38 -> RC40 on the real hosted GitHub build.
- Phone portrait visual check with the user background pattern.
- Desktop/tablet horizontal visual check.
- Real-device interaction check for save/theme/background upload and Update/Offline buttons.

---

# LEGION RX 4.2.0 CLEAN FULL APP RC38 · AVATAR CROP LAYER FIX — TEST REPORT

## Scope

Pilot UI image pipeline only. Runtime changes are limited to `ui/pilots/pilot-cards.js` and `ui/pilots/pilot-cards.css`, plus release metadata/tests. Sport/timing, LapWiz, audio, storage engine and reporting are not modified.

## RC38 verification

- Crop backdrop stacks above the pilot editor (`1400 > 1200`), so gallery/camera selection opens the crop UI immediately instead of underneath the editor.
- On a 390×844 mobile viewport, the crop panel is centered vertically rather than bottom-aligned.
- Headless Chromium smoke test: selected JPG -> crop visible while editor remains open -> `ГОТОВО` -> crop closes -> editor preview receives a valid `data:image/webp` avatar.
- The sample 3000×2000 JPG produced a processed avatar of about 67 KB, below the new ~72 KB target.
- Output remains square 480×480 first choice, with 420×420 fallback only when required by compression.
- Original gallery/camera file is never written to the pilot database.
- Cancel preserves the previous avatar.

## Regression

Run architecture, clean-foundation, iOS start/storage, pilot-card, RC29 run-off, RC30 start-order/announcer, RC31 columns, RC32 skip flow, RC33–36 UI tests, RC37 avatar pipeline, RC38 crop-layer test, JavaScript syntax and offline-manifest checks. Physical camera launch/permission remains user-side on iPhone/Android.
