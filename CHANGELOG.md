# LEGION RX — CHANGELOG

## RC20 · CLEAN FOUNDATION
- Cleaned active UI/CSS architecture without changing RallyCross sport rules.
- Consolidated historical style generations; removed unused legacy runtime selectors and old runtime filenames.
- `theme.css` is palette-only; `app.css` owns global components; `discipline-pults.css` owns RallyCross/Free Practice cockpit styling.
- Added safe staged PWA update workflow with explicit install from Settings.
- Active release navigation/assets are cache-first; update downloads occur in a separate candidate cache.
- Removed automatic runtime OFFLINE downloading. Active-package verification is read-only.
- Safari audio button now only hydrates cached local audio and performs the required user-gesture unlock.
- Removed obsolete historical RC/test files and duplicate unused `flags-atlas.png`.

## Preserved from RC19
- Compact red RallyCross race banner.
- Event-derived `PILOTS n/n` occupancy.
- One-line truthful `ЛИДЕР · ЛУЧШИЙ КРУГ` strip.
- Uppercase cockpit pilot names and current readability scale.
- Dark/Light visual system.

## Preserved sport behavior
- RC15 leader-finish / next-valid-pass rule for lap-limited races.
- Qualification points / BEST 3 / ties / LCQ / A1-A3 / final protocol unchanged.


## RC21 · IOS START SAFETY
- Critical START is decoupled from Safari audio unlock and local audio hydration.
- LapWiz connect is decoupled from announcer audio.
- Audio unlock uses Safari-safe two-tap fallback when cache hydration is needed.
- Locked audio cannot open a modal from background race announcements.
