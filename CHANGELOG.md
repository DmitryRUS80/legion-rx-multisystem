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
