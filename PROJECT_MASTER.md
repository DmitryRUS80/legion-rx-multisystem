# LEGION RX — PROJECT MASTER

Current verified development MASTER: **4.2.0 CLEAN FULL APP RC21 · IOS START SAFETY**  
Direct base: **RC20 CLEAN FOUNDATION**.

## Non-negotiable architecture

- `platform/` = hardware/shared services only.
- `modes/rallycross/` = RallyCross sport rules and runtime; no DOM/CSS.
- `modes/free-practice/` = independent practice logic.
- `ui/` = replaceable presentation; no BLE protocol and no sport scoring constants.
- `reporting/` = independent future report-preparation layer; no sport calculations and no UI ownership.
- `app.js` = coordination only.
- No patch/fix CSS files, no runtime function replacement and no duplicate sport implementations.

## Current sport truth

Executable rules remain in `modes/rallycross/`. RC20 does **not** change any sport rule from RC19. The lap-limited finish policy added in RC15 remains: the first pilot completing the target distance opens the finish window; every remaining active pilot finishes on the next valid pass.

## Current approved visual direction

The current RC19/RC20 RallyCross cockpit is the preserved visual baseline. Further design work should make the race line, pilot presentation, BEST LAP cards, pre-start grid and results look like a compact motorsport TV broadcast while retaining trackside readability and fast operator control.

## RC20 CLEAN FOUNDATION

- Removed historical runtime naming (`*-rc5restore*`, `variant4.css`, `current-base.css`) from the active source tree.
- Removed CSS rules whose selectors are not referenced by the current runtime; retained current-selector declarations are cascade-equivalent to RC19.
- Theme is now a palette-only file. General UI and discipline cockpit have separate authoritative style files.
- Removed obsolete historical RC/test files and the unused duplicate flag atlas from the FULL build.
- Added safe staged PWA updates in Settings.
- Active release startup is cache-first. Network is not on the critical startup path.
- New release installation is atomic: it downloads into a separate cache, waits, and activates only after explicit confirmation.
- Interrupted update download does not replace the active working release.
- Audio activation remains a Safari/iOS user-gesture operation only; pressing “Включить звук” does not download/update the application.
- The active offline check includes application files, audio, images and cached Oswald resources.

## First migration note

RC19 itself used the older network-first updater. Therefore the **one-time migration RC19 → RC20 should be performed with stable internet**. After RC20 has activated, subsequent update cycles use the new staged/atomic mechanism.

## Verification

See `TEST_REPORT.md`. Static/runtime verification is complete. Physical iPhone/iPad Safari, installed PWA cold-start with network disabled, and real LapWiz BLE remain mandatory field acceptance tests before GOLD.


## RC21 IOS START SAFETY

- Race/Track Day start is never blocked by audio cache state or Safari media permission.
- LapWiz connection no longer waits for announcer audio and therefore preserves the direct user gesture required by Web Bluetooth on supported browsers.
- Safari audio preparation and unlock are explicitly two-step when cache hydration was still needed: first tap prepares local audio, second tap unlocks playback.
- Locked audio playback is a silent no-op and cannot place a blocking audio modal over an already running race.
- Sport rules and RallyCross runtime are unchanged from RC20.
