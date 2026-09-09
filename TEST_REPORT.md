# LEGION RX 4.2.0 CLEAN FULL APP RC21 · IOS START SAFETY — TEST REPORT

Direct base: **RC20 CLEAN FOUNDATION**.

## Incident reproduced by code-path audit

RC20 coupled `START` to `ensureRaceAudioFromGesture()`. On Safari/iPhone, when local audio still needed asynchronous cache hydration, the user-activation window could be lost before media `play()`. The function then returned `false`, so the RallyCross `beginCountdown()` call was never reached. This explains the field symptom: cockpit loads, LapWiz is unavailable on iPhone as expected, but the race no longer enters warm-up/start.

RC21 removes that coupling at the authoritative action layer instead of adding an override.

## RC21 changes

- `ui/shell/actions.js`: RallyCross START directly calls `beginCountdown()`; LapWiz connect no longer waits for announcer audio.
- `ui/shell/views.js`: Track Day start no longer waits for announcer audio.
- `ui/shell/offline-runtime.js`: Safari-safe audio preparation uses a two-step fallback when hydration is still required; no hydrate→play sequence is attempted inside the same user activation.
- `platform/audio.js`: an announcement attempted while audio is locked is a silent no-op and cannot open a blocking gate over a race. Explicit audio enable/recovery still owns the gate.
- `offline-manifest.js` / `sw.js`: new RC21 release/cache namespace for staged update delivery.

## Verification

PASS:
- architecture verifier: **8/8**;
- clean-foundation verifier: **PASS**;
- RC21 critical-start verifier: **8/8**;
- JavaScript syntax: **35/35 PASS**;
- RallyCross sport self-test: **16/16 PASS**, `RALLYCROSS-2026.09.1`;
- every file under `modes/` is byte-identical to RC20;
- RallyCross rules/runtime/qualifying/finals: **NO CHANGE**;
- Free Practice sport module: **NO CHANGE**;
- LapWiz protocol/core commands: **NO CHANGE**;
- reporting contract: **NO CHANGE**;
- CSS/theme clean foundation: **NO CHANGE**.

## Critical invariants now enforced

- Race START cannot be rejected because audio cache is incomplete.
- Race START cannot be rejected because Safari audio is locked.
- Track Day start cannot be rejected because Safari audio is locked.
- LapWiz `requestDevice()` on supported browsers is no longer preceded by awaited announcer work.
- If audio hydration is required after an explicit audio-button tap, the UI asks for a second tap rather than incorrectly trying to reuse an expired Safari user gesture.
- A locked announcer cannot force a modal over an active race.

## Real-device acceptance still required

The container cannot certify Safari itself or Web Bluetooth hardware. Required field checks after installing RC21:
1. iPhone: open RallyCross with audio not enabled → START must immediately enter warm-up.
2. iPhone: enable audio, then START → warm-up/race must run with sound.
3. iPhone: background/foreground → restore audio with one explicit tap if Safari requests it; race state must remain intact.
4. Android/Chrome or other supported Web Bluetooth device: LapWiz connect must open the device chooser directly and passes must work.
5. Offline cold start after RC21 package reports OFFLINE READY.

## Release status

**RC21 IOS START SAFETY — static/runtime invariants verified; ready for immediate iPhone field retest.**
