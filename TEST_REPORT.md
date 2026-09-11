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
