# 4.2.0 CLEAN FULL APP RC3
- Rebuilt from the **complete** 4.1.1 OFFLINE HOTFIX archive (audio/icons/flags/application included).
- Discarded incomplete CLEAN RC1 is not a valid build.
- Split RallyCross sport core and LapWiz out of the monolithic HTML.
- Current discipline pults retained as UI code.
- Added explicit `commitCurrentEventResult(result)` so UI must supply FIN/DNF/DNS/DSQ instead of core reading DOM.
- Future Rally Sprint and Classic RC remain separate disabled modules.
- Offline cache asset list regenerated for the complete modular application.

## RC3 surgical fix — pilot flags
- Fixed only the relative path to `flags/flags-atlas.png` in `ui/shell/discipline-pults.css` and `ui/shell/current-base.css`.
- Bumped offline cache identity from RC2 to RC3 so an installed PWA cannot keep the stale RC2 CSS.
- No RallyCross rules, Free Practice logic, LapWiz/BLE, storage schema, audio logic, or race timing code changed.
- Added an architecture test that verifies local `url(...)` references in CSS resolve to real files.



## RC17 COCKPIT READABILITY
- Corrected RC16 RallyCross cockpit UI after real desktop testing.
- Reduced race banner height, fixed heat pilot occupancy, made BEST owner data truthful before/after the first valid lap, forced displayed pilot names to uppercase, and reduced cockpit pilot-name scale.
- No sport/platform/reporting changes.

## RC18 GLOBAL THEMES
- Reworked the authoritative global theme source so Dark and Light are genuinely different palettes instead of both resolving to the old light palette.
- Dark is the default full-app appearance: black/graphite neutral surfaces and white icons/text.
- Light uses the same components, icons, geometry and hierarchy with white/light neutral surfaces and black icons/text.
- RallyCross and Free Practice cockpit neutral surfaces now follow the selected theme without changing sport logic or pilot-row geometry.
- Red race banner, cobalt blue, magenta and amber accents are preserved. Lime/green is reduced only in Light for white-background contrast.
- Browser/PWA theme color follows the selected theme.
- No changes to `platform/`, `modes/`, `reporting/`, LapWiz or sport rules.

## RC19 READABILITY PASS
- Fixed Light-theme active-event `ПРОДОЛЖИТЬ` visibility by removing the older forced-white button-text declaration at its existing source; no patch/override file added.
- Increased one-line leader/BEST strip typography without changing its layout or BEST data logic.
- Increased red race-banner typography specifically for portrait tablet and phone while preserving the existing strip geometry and race information.
- Increased the small labels around the timer/ring for trackside readability.
- No changes to `platform/`, `modes/`, `reporting/`, sport scoring, LapWiz or timing.

