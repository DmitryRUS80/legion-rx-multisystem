# LEGION RX 4.2.0 CLEAN FULL APP RC43 · STEEL + LIGHT SKINS — TEST REPORT

## Scope
Visual skin task only. RC43 starts from the RC40 Classic layout and adds two selectable visual skins without an alternate renderer. Runtime changes are limited to `index.html`, `ui/themes/skins.css`, `ui/shell/discipline-shared.js`, `ui/shell/views.js`, `ui/shell/actions.js`, and the icon markup helper in `ui/pilots/pilot-cards.js`. Release metadata/tests/docs are synchronized.

## Verification
- APEX files/references are absent from the RC43 UI tree and runtime.
- `CLASSIC / STEEL / LIGHT` are the only skin choices.
- Skin switching applies without replacing the screen renderer.
- Classic and new glyph sets coexist in the same SVG markup; CSS switches glyph groups by `data-skin`, so changing skin does not require a page re-render.
- `ui/shell/app.css`, `ui/shell/discipline-pults.css`, `ui/pilots/pilot-cards.css`, and `ui/discipline-ui.js` are byte-identical to RC40. `ui/pilots/pilot-cards.js` changes only its SVG icon helper / voice-play icon so STEEL/LIGHT use the same glyph family while Classic keeps the original glyph paths.
- All files under `platform/`, `modes/`, and `reporting/` are byte-identical to RC40.
- STEEL/LIGHT skin CSS does not declare `.rxnPilotRow` or cockpit `grid-template-columns`; locked pilot-row geometry is not redefined.
- Offline manifest includes `ui/themes/skins.css` and uses a new RC43 cache namespace.
- Full automated regression suite passes, including RallyCross run-offs 28/28, official start-order/announcer 12/12, skip/state safety 11/11, storage behavior, pilot UI, avatar crop, architecture/offline checks and RC43 skin isolation.
- JavaScript syntax check passes for all project `.js` files; CSS parser reports zero stylesheet parse errors.
- Headless browser rendering is blocked by the execution environment, so no simulated visual/browser PASS is claimed for RC43. Physical PWA visual acceptance on the user's phone/tablet remains required.

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
