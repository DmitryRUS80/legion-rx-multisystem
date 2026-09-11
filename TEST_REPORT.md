# LEGION RX 4.2.0 CLEAN FULL APP RC37 · AVATAR CROP + COMPRESSION — TEST REPORT

## Scope

Pilot UI image pipeline only. Runtime changes are limited to `ui/pilots/pilot-cards.js` and `ui/pilots/pilot-cards.css`, plus release metadata. Sport/timing, LapWiz, audio, storage engine and reporting are not modified.

## RC37 verification

- Avatar picker accepts `image/*` so mobile browsers can offer camera or gallery.
- Selected images open one authoritative crop UI with square preview, drag and zoom.
- Output uses a 480×480 target and adaptive WebP/JPEG compression; the original file is not stored.
- Encoder targets ~95 KB binary image size and may fall back to 420×420 only for unusually complex images that remain too large.
- Cancel leaves the previous avatar unchanged.
- Pilot profile continues to store the processed image in the existing `photo` field, preserving all current consumers.

## Regression

Run architecture, clean-foundation, iOS start/storage, pilot-card, RC29 run-off, RC30 start-order/announcer, RC31 columns, RC32 skip flow, RC33–36 UI tests, JavaScript syntax and offline-manifest checks. Physical camera/crop acceptance remains user-side on iPhone/Android.
