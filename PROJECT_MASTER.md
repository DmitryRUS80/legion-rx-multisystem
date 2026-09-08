# LEGION RX — PROJECT MASTER

Current build: **4.2.0 CLEAN FULL APP RC19 READABILITY PASS**  
Base: **4.1.1 OFFLINE HOTFIX FULL APP**.  
The incomplete CLEAN RC1 is invalid and must not be used.

## Non-negotiable architecture
- `platform/` = shared services/hardware only: LapWiz, timing, storage, audio, pilots, state, offline.
- `modes/rallycross/` = RallyCross rules, qualification, finals and runtime; no DOM/CSS.
- `modes/free-practice/` = Free Practice / Track Day logic; no DOM/CSS and no RallyCross scoring.
- `modes/rally-sprint/` and `modes/classic-rc/` = independent disabled future modules.
- `ui/` = replaceable presentation layer; it must not contain BLE protocol or sport scoring constants.
- `reporting/` = independent report-preparation layer; it receives already-official result snapshots and must not calculate sport results or own UI.
- `app.js` = coordination only; no DOM/CSS.
- `index.html` = small shell and ordered module includes, not a monolithic application.
- No `patch.js`, `fix.css`, runtime function replacement, duplicate sport implementations or silent FIN fallback.

## UI preservation rule
Current RallyCross and Free Practice pults are the UI donor and are preserved in `ui/`. Future UI changes must not require edits to `platform/lapwiz.js` or RallyCross sport-rule files.

## Source of sport truth
- Executable rules: `modes/rallycross/rules.js`, `qualifying.js`, `finals.js`.
- Human-readable passport: `SPORT_RULES.md`.
- Historical reference for rule audit: Championship Edition v3.4 Official.
- Architecture migration must never silently change a sport rule.

## Verification status
See `TEST_REPORT.md`. Physical LapWiz and offline cold-start on the user's device are still required before GOLD.


## RC5 RESTORE
Runtime UI restored to the exact RC5 cockpit state before the race-progress/queue section was added. platform/ and modes/ are byte-identical to original RC5. Unique runtime CSS/JS filenames are used only to bypass stale browser caches.


## RC12 DESKTOP PULT
UI-only refinement from RC11 Variant 4: desktop header alignment, duplicate LapWiz toolbar button removed, desktop main control icon/label scale increased, compact event title, leader/best-lap display strip, wider control accent bars, compact bottom display tools anchored to the panel bottom. RallyCross rules/platform modules unchanged.


## RC15 FINISH REPORT CORE
- RallyCross lap-limited races now use the sport rule: the first pilot to complete the target distance finishes and opens the finish window; every remaining active pilot finishes on their next valid timing-line pass, even when one or more laps down.
- The rule decision is declared in `modes/rallycross/rules.js`; `modes/rallycross/runtime.js` only applies that decision to live passes.
- `reporting/` added as a hidden, independent preparation layer with separate `rallycross`, `practice`, and `rally` section adapters.
- Reporting is not connected to UI or `index.html` yet and does not generate PDF.
- RC14 UI, `platform/`, qualification scoring, LCQ and finals scoring are otherwise unchanged.

## RC16 RACE BANNER
- UI-only RallyCross cockpit refinement.
- The left event-title strip is now a flat red compact race banner: Q/final stage, HEAT progress, RALLYCROSS and current heat occupancy.
- The timer top caption now shows the active race class instead of duplicating the phase label.
- Pilot rows, sport rules, `platform/`, reporting and Free Practice are unchanged.



## RC17 COCKPIT READABILITY
- UI-only correction after real desktop RC16 test.
- RallyCross red race banner height reduced to 40 px on desktop; its Oswald text now fills the strip vertically with minimal edge spacing.
- Heat occupancy no longer assumes a six-car capacity: it is derived from the current event composition (`PILOTS 3/3` for a three-pilot heat).
- The leader/best-lap strip is one line and does not preselect the first pilot before a real BEST exists. It displays the pilot who actually owns the absolute session BEST.
- Pilot display names are rendered in uppercase without changing stored pilot data. Cockpit pilot-name size is reduced to the established card-scale hierarchy.
- `platform/`, all `modes/`, reporting, timing, LapWiz and sport rules remain unchanged.

## RC18 GLOBAL THEMES
- UI-only global theme pass; Dark is the default application appearance and Light is the same UI with inverted neutral surfaces/icons.
- The previous `variant4.css` dark/light collision was removed at its authoritative source: Dark and Light now have separate neutral palettes instead of sharing the same light values.
- Current RallyCross / Free Practice cockpit neutral colors are driven by the same theme state; geometry, pilot rows, race banner behavior and sport data are unchanged.
- Semantic colors remain semantic across themes: race red, cobalt blue, magenta and amber stay unchanged. Neon lime/green is deliberately reduced only in Light theme for readable contrast on white.
- Browser/PWA theme color follows the selected theme. Default install/background color remains Dark.
- `platform/`, all `modes/`, `reporting/`, timing, LapWiz and sport rules remain unchanged.

## RC19 READABILITY PASS
- UI-only correction after real RC18 visual testing.
- Removed the obsolete hard-coded white text rule from the existing active-event primary button source, so Light theme uses the intended dark button text while Dark remains white. No compensating override was added.
- The one-line `ЛИДЕР · ЛУЧШИЙ КРУГ` strip now uses larger label/name/time typography while keeping the established single-row geometry and truthful BEST logic from RC17.
- Portrait tablet/phone red race-banner text is substantially larger and fills the existing strip height more closely; race-banner data and height logic are unchanged.
- Timer support labels around the main timer/ring are enlarged for trackside readability: class, phase/subline and `КРУГОВ ЛИДЕРА`.
- `platform/`, all `modes/`, `reporting/`, RallyCross sport rules and runtime data logic are unchanged.
