# LEGION RX 4.2.0 CLEAN FULL APP RC20 · CLEAN FOUNDATION — TEST REPORT

Direct base: **RC19 READABILITY PASS**.

## RC20 task

One foundation-only release:
- clean the accumulated UI/CSS/runtime history without redesigning the accepted working appearance;
- keep RallyCross, Free Practice, LapWiz and reporting contracts intact;
- create one authoritative source per active UI/style responsibility;
- make the installed PWA start from the active local package;
- add safe staged updates that cannot replace the working release after an interrupted download;
- keep Safari/iOS sound unlock as a local user-gesture operation, independent of update/network logic.

## Architecture / protected logic

PASS:
- architecture verifier: **8/8**;
- protected sport/shared logic byte-identical to RC19: **PASS**;
- `platform/lapwiz.js`, current audio/pilot/state/storage/timing/utils logic: unchanged;
- all `modes/` sport files: unchanged;
- all `reporting/` contract files: unchanged;
- `app.js`: unchanged;
- RallyCross rules self-test `RALLYCROSS-2026.09.1`: **16/16 PASS**.

RC20 adds only dedicated offline/update infrastructure in `platform/offline-core.js` and `platform/updater.js`; it does not move sport logic into platform or UI.

## Clean UI/CSS audit

Active style responsibilities are exactly:
1. `ui/fonts/oswald.css` — font-face declarations;
2. `ui/themes/theme.css` — Dark/Light palette tokens only;
3. `ui/shell/app.css` — general application shell/screens/components;
4. `ui/shell/discipline-pults.css` — RallyCross / Free Practice cockpit presentation.

PASS:
- historical active names `*-rc5restore*`, `variant4.css`, `current-base.css`, `current-ui.js`, `bindings.js`, `offline-audio.js`, `offline-config.js`: removed from runtime;
- patch/hotfix/override files: **0**;
- same-scope duplicate selectors in `app.css`: **0**;
- same-scope duplicate selectors in `discipline-pults.css`: **0**;
- `!important`: `theme.css` **0**, `app.css` **3**, `discipline-pults.css` **11** (remaining uses are existing responsive/state constraints, not historical cascade layers);
- CSS parse: **PASS** for all active CSS files;
- undefined old cockpit background token `--console-bg`: removed from active source.

## JavaScript / runtime

- JavaScript syntax: **35/35 PASS**;
- synthetic browser runtime loaded the current script order without application JS exceptions;
- Home rendered in Dark and Light;
- Settings rendered in Dark and Light, including `Обновление и Offline`;
- real RallyCross state was constructed in the runtime harness and current cockpit rendered in Dark and Light with current RC19 visual behavior preserved: compact race banner, `PILOTS 3/3`, uppercase pilot names and truthful one-line BEST strip.

## Offline package integrity

- local files listed by `offline-manifest.js`: **77/77 exist**;
- local PNG/WAV/MP3 signature audit: **PASS**;
- offline manifest / CSS asset resolution: **PASS**;
- active release navigation: **cache-first**;
- active JS/CSS/images/audio: **cache-first**;
- install does **not** call `skipWaiting()` automatically;
- candidate release installs into its own cache and is activated only by explicit user confirmation;
- incomplete candidate cache is deleted; the active release cache is not replaced;
- immutable external Oswald resources are first reused from an already verified active cache when available, reducing dependence on the font CDN during later updates;
- `platform/offline-core.js` performs read-only verification and does not download an application at runtime;
- `ВКЛЮЧИТЬ ЗВУК` does not trigger update/download logic.

## One-time migration RC19 → RC20

RC19 itself still uses the older service-worker/update generation. Therefore the first migration to RC20 must be performed with stable internet and the application should be allowed to finish installation. Once RC20 is active, subsequent RC20+ updates use the staged/atomic mechanism above.

## What cannot be fully certified in this container

The following remain real-device acceptance tests:
- installed iPhone/iPad Home Screen PWA cold-start with internet disabled;
- Safari audio unlock after cold launch and after background/foreground recovery;
- real LapWiz BLE connect/pass/reconnect on track;
- real GitHub Pages service-worker lifecycle during the one-time RC19 → RC20 migration.

The container/browser environment does not permit a full localhost service-worker lifecycle, so those items are intentionally not reported as PASS.

## Release status

**RC20 CLEAN FOUNDATION — static/runtime verified, ready for device/PWA testing.**
Sport result: **NO CHANGE**. Visual intent: **preserve current accepted RC19 appearance; future redesign continues from this cleaned foundation.**
