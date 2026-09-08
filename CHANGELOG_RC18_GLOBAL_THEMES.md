# LEGION RX RC18 GLOBAL THEMES — CHANGELOG

Base: **4.2.0 CLEAN FULL APP RC17 COCKPIT READABILITY**.

## Task
Make the current black control language the default visual system for the whole application and provide a true Light inverse using the same icons/components, while preserving semantic colored accents.

## Changed
- `ui/themes/variant4.css` — authoritative global Dark/Light palettes; removed the old shared light palette for both theme states.
- `ui/shell/discipline-pults-rc5restore.css` — existing cockpit neutral colors moved to theme variables directly in the authoritative stylesheet; no layout patch file.
- `ui/shell/discipline-shared.js` — existing theme application now also synchronizes browser `theme-color`.
- `index.html` / `manifest.webmanifest` — default install/browser color aligned with Dark, which remains the default saved state.
- version/offline cache identity bumped to RC18.

## Theme behavior
### Dark
- black/graphite background and surfaces;
- black controls;
- white text/icons;
- existing semantic accents preserved.

### Light
- white/light-gray background and surfaces;
- white controls;
- black text/icons;
- same icons and component geometry;
- race red / cobalt / magenta / amber preserved;
- lime/green changed only to a darker readable green on light surfaces.

## Explicitly unchanged
- `platform/`;
- all `modes/`;
- `reporting/`;
- RallyCross qualification / finals / LCQ / finish-window rule;
- LapWiz / timing / storage / audio;
- RC17 banner data logic, BEST ownership, uppercase pilot names and pilot-row geometry.

No patch CSS, no override JS, no duplicated theme implementation.
