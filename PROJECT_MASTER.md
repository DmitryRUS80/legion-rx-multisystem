# LEGION RX — PROJECT MASTER

Current build: **4.2.0 CLEAN FULL APP RC16 RACE BANNER**  
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

