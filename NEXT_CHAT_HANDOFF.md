# LEGION RX — NEXT CHAT HANDOFF · RC36

**Date:** 2026-09-11  
**Current code candidate:** `Legion_RX_4.2.0_CLEAN_FULL_APP_RC36_BEST_LAP_STRIP_HERO_CLEANUP_FULL.zip`  
**Base:** RC34 LIVE PILOT STATS BROADCAST  
**Status:** RC36 automated regression PASS; **real iPhone + LapWiz + Android acceptance still required**.

---

## 0. FIRST RULE FOR THE NEXT CHAT

Do **not** rebuild Legion RX from memory and do not use an older archive as the source.

1. Unpack the latest **RC36 FULL**.
2. Read, in this order:
   - `NEXT_CHAT_HANDOFF.md` (this file if copied into the project/package)
   - `PROJECT_MASTER.md`
   - `ARCHITECTURE.md`
   - `FUNCTION_MAP.md`
   - `SPORT_RULES.md`
   - `TEST_REPORT.md`
   - `VERSION.txt`
   - `CHANGELOG.md`
3. Inspect the actual authoritative files responsible for the requested task.
4. Only then edit code.

The FULL/source modular project is the **only development source**. A portable/browser test build is never the source for the next version.

---

# RC36 CURRENT UI DELTA

RC36 is UI-only. It removes the obsolete portrait-only full-width `rxnLeaderHero` block from the real RallyCross roster renderer and removes its styles instead of hiding it with another override. The header strip above the right pult is renamed/reworked as one authoritative `rxnBestLapStrip`: `BEST LAP` + live best-lap time only, no trophy and no `ЛИДЕР · ЛУЧШИЙ КРУГ`. Existing RallyCross tick updates that time; sport/timing/platform behavior is unchanged.


# 1. PROJECT IDENTITY

**Product:** LEGION RX  
**Purpose:** RC race timing / race management with LapWiz BLE.  
**Targets:** PWA first; later Android APK and Windows application while preserving one UI/core and swapping platform adapters where needed.

Principle:

```text
ONE UI + ONE SPORT CORE + PLATFORM ADAPTERS
```

The current PWA UI should be reusable inside future Android/Windows shells. Do not design a separate Android UI unless explicitly requested.

---

# 2. FUNDAMENTAL ARCHITECTURE — DO NOT BREAK

```text
LEGION RX
│
├── platform/
│   ├── lapwiz.js
│   ├── timing.js
│   ├── storage.js
│   ├── audio.js
│   ├── pilots.js
│   ├── state.js
│   ├── offline-core.js
│   └── updater.js
│
├── modes/
│   ├── rallycross/
│   │   ├── rules.js
│   │   ├── qualifying.js
│   │   ├── finals.js
│   │   ├── runtime.js
│   │   ├── self-test.js
│   │   ├── audio-actions.js
│   │   └── index.js
│   ├── free-practice/
│   ├── rally-sprint/
│   └── classic-rc/
│
├── ui/
│   ├── pilots/
│   ├── shell/
│   └── ...
│
├── reporting/
├── tests/
├── app.js
├── index.html
├── sw.js
└── offline-manifest.js
```

The invariant is:

```text
UI != SPORT RULES != LAPWIZ != STORAGE
```

### UI
UI may display state and send commands. UI must **not** calculate RallyCross rankings, qualification points, LCQ, final positions, DNF/DNS/DSQ or BLE protocol.

### RallyCross
`modes/rallycross/` owns RallyCross sport rules. It must not know CSS, HTML geometry or button layout.

### LapWiz
`platform/lapwiz.js` owns BLE protocol only. It does not know RallyCross or Free Practice rules.

### Storage
`platform/storage.js` owns persistence and quota safety. UI must not invent a second storage system.

### Reporting
`reporting/` is a separate reporting contract/module. It can later receive finished results from RallyCross / Practice / Rally and format different reports/PDFs. Do not put PDF logic into RallyCross rules.

---

# 3. CLEAN-BUILD RULES

A CLEAN BUILD does **not** mean rewriting the application.

It means:
- one authoritative implementation per function;
- one authoritative style per component;
- no old invisible runtime UI;
- no duplicate sport logic;
- no patch/override layers.

Target:

```text
OLD UI RUNTIME      = 0
PATCH JS            = 0
PATCH CSS           = 0
DUPLICATE FUNCTIONS = 0
DUPLICATE RULES     = 0
```

Forbidden examples:

```text
fix.css
patch.css
override.css
hotfix-ui.css
style-final-final.css
```

and JS monkey-patches such as:

```js
const oldFn = fn;
fn = newFn;
```

If a component changes, edit its real authoritative implementation and remove the obsolete implementation.

---

# 4. DEVELOPMENT WORKFLOW FOR EVERY BUILD

Before coding, state internally:

```text
TASK
TOUCH
DO NOT TOUCH
TEST
```

Example:

```text
TASK: selected pilot tile visual state
TOUCH: ui/pilots/pilot-cards.css
DO NOT TOUCH: modes/, platform/, audio, offline, storage
TEST: race picker, practice picker, manual picker, dark/light, phone/tablet/desktop
```

If a supposedly visual task suddenly seems to require `modes/` or `platform/`, stop and inspect the real cause before touching those areas.

**One build = one focused task whenever possible.**

Do not “improve” unrelated parts while fixing another problem.

---

# 5. OUTPUT FORMAT — ALWAYS TWO ARCHIVES

After every accepted development build output exactly:

### 1. FULL
Complete modular project for storage, rollback, auditing and as the source of the next build.

```text
Legion_RX_..._FULL.zip
```

### 2. UPLOAD_TO_GITHUB
Only changed/new files, with their original directory structure.

```text
Legion_RX_..._UPLOAD_TO_GITHUB.zip
```

Do not include unchanged `audio/`, `icons/`, `flags/`, `platform/`, `modes/`, etc. unless they actually changed.

Exception: a deliberate repository CLEAN RESET may contain the full clean tree, but only when explicitly declared. RC20 used this once. Normal builds return to delta upload packs.

In the response always list:
- exact files to replace/add on GitHub;
- areas that must not be touched.

User uploads through the GitHub web interface. Preserve paths. Upload **contents of the unpacked delta**, not the ZIP itself.

---

# 6. CURRENT RALLYCROSS SPORT RULES — RC29 RULESET UNCHANGED IN RC30

RC30 preserves the RC29 RallyCross scoring/run-off rules. RC30 changes only the prepared start-order bridge, announcer consumption of that order, live equal-state presentation stability, and shared selected-state UI styling.

## Qualification
- Qualification points: existing table preserved (`50,45,42,40,39...`, through the existing continuation).
- **BEST 3** qualification results count.
- FIN / DNF / DNS / DSQ preserved.
- Ranking first uses BEST-3 total and the existing countback quality of better finishing places / discarded results.
- **Random draw has been removed completely.**
- The old arbitrary last-round / registration fallback is no longer an official equality resolver.
- If pilots remain absolutely equal after all legitimate qualification criteria, only those tied pilots get a **qualification run-off / ПЕРЕЗАЕЗД**.
- The run-off adds **zero Q points** and **zero extra Q result**.
- It only orders the disputed positions. Positions above and below are untouched.
- If the run-off itself ends in an unresolved equality (for example equal DNS), another run-off is created. Do not invent random order.

## Final A
A1 / A2 / A3; **BEST 2 of 3** count. Non-FIN score remains 7.

Tie-break order is now exactly:

1. Lower BEST-2 sum is better.
2. If equal: better individual counted finishing place.
3. If still equal: compare the counted final in which that best place was obtained — more laps is better, then lower elapsed time.
4. If still equal: compare the second counted result, then its laps/time by the same rule.
5. If everything remains exactly equal: only tied pilots receive a **Final A run-off**.

Final run-off:
- is **not A4**;
- is not appended to scored `finalResults`;
- gives **no bonus/event points**;
- only decides order within the disputed final positions;
- event points are assigned only after the official final order is resolved.

Current event points remain:

```text
25,18,15,12,10,8,6,4,2,1
```

## Lap-limited finish
Preserved:
- first pilot reaching target laps is FIN and opens finish window;
- every other active pilot finishes on their next valid timing-line pass, even if 1+ laps behind;
- they do not continue until individually reaching target laps.

## Current RC29 sport tests
- `verify_rc29_rallycross_runoffs.js`: **28/28 PASS**
- RallyCross self-test: **18/18 PASS**
- rule version: `RALLYCROSS-2026.09.2`

**Still required on real device:** force one exact qualification tie and one exact Final A tie and verify the next event is `ПЕРЕЗАЕЗД`, contains only tied pilots, and adds no extra scored result/points.

---

# 7. IMPORTANT CURRENT / RECENT IOS SAFETY INVARIANTS

These are protected regression requirements.

## START
`START` must never wait for:
- audio unlock;
- internet;
- cache/update;
- announcer preparation.

Race start must work even with sound disabled and LapWiz disconnected.

Safari audio unlock is a separate user action.

## FINISH / ARCHIVE
RC28 fixed iPhone `QuotaExceededError` during `ЗАВЕРШИТЬ`:
- base64 pilot photos belong to pilot DB and are not duplicated into every race/archive snapshot;
- legacy snapshots are compacted;
- quota write retries after compaction;
- if archival persistence still fails, the completed active race is **not cleared/lost**;
- active race clears only after successful archive save.

Do not regress this behavior while changing sport/UI.

---

# 8. OFFLINE / UPDATE MODEL — PROTECTED

Legion RX is offline-first.

Startup must use the installed local app immediately. Internet is not required for race operation.

Update model:

```text
ACTIVE LOCAL VERSION
        |
        +-- optional background/manual check
                  |
             CANDIDATE CACHE
                  |
        full download + verification
                  |
        user confirms install
                  |
          new ACTIVE VERSION
```

If connection breaks while downloading an update, the current active version must remain usable and untouched.

The Safari `Включить звук` button is for Safari audio user-gesture unlock only. It must not trigger or gate internet/update/race start.

`VERSION.txt`, service-worker cache namespace and offline manifest must remain synchronized.

---

# 9. PILOTS / MODELS — CURRENT DATA + UI CONTRACT

Important data rule:

**`ID LAPWIZ` is the transponder ID.** Do not create a second independent “Transponder” field in UI. Compatibility mirrors may exist internally for unchanged legacy consumers, but the operator edits one ID.

Current pilot-card direction:
- square avatar, frameless;
- photo centered/cropped by the short side, never squeezed;
- flag at lower-right of avatar, rectangular, no radius/border;
- team label at lower-left of avatar;
- if team is `LEGION RX` / `LegionRX`, render the private branded black label style; do not put any explanatory hint in the UI about this easter egg;
- no team -> render nothing there;
- pilot database is a dense grid: about 4–5 cards across desktop, 2–3 portrait mobile;
- internal style should look like information/stickers on glass, not nested rounded boxes and endless frames;
- models are selected by tapping model tiles, not checkboxes;
- selected model/pilot state must not shake or move layout.

### RC30 selected-state correction — IMPLEMENTED
The rejected bright/blue selection glow is removed.

Current shared selected-state language:
- very thin neutral/light 1 px outline;
- only a restrained 5 px soft halo;
- no blue fill or blue glow;
- no extra wrapper/border nesting;
- no transform/shake/layout shift;
- implemented directly in authoritative `ui/pilots/pilot-cards.css`.

Applied to the shared race/practice pilot card and model selection selectors.

---

# 9A. RC30 OFFICIAL START ORDER

The official pre-start order is now one prepared source: `modes/rallycross/index.js::getEventStartPilots()`.

- Qualification: preserve the exact `event.pilots` order produced by the qualification heat builder. Do not re-sort by registration order in UI/audio.
- Finals and current non-qualifying start events: use the existing qualification-rating grid order. Do not add a second announcer-specific sort.
- `RallyCrossModeAPI.startPilots()` / `startGrid()` expose that order to UI.
- `announceStartCall()` speaks that exact order.
- `liveRanking()` preserves supplied start order while lap/time values are equal, then reorders normally from live timing.

This is presentation/start-call synchronization only; it does not alter Q points, BEST 3, LCQ, Final A scoring or run-off rules.

# 10. MANUAL PILOT ACTION TILES

RC28 replaced old initials cards in cockpit manual actions with a shared compact pilot action tile:
- colored LapWiz ID square;
- uppercase pilot name;
- flag;
- current lap count where relevant.

The shared component is used by:
- RallyCross manual lap;
- RallyCross manual pass;
- Free Practice manual pass.

Do not reintroduce old initials-based cards.

---

# 11. VISUAL DESIGN PRINCIPLES

The user wants LEGION RX to feel like a modern **sports broadcast + premium gadget**, not a generic admin web app.

Key rules:
- functional first, but visually impressive for clubs;
- transparent/glass surfaces where useful;
- minimal framing;
- no endless nested rounded rectangles;
- no unnecessary micro-text;
- names/important info large and readable;
- Oswald is the local embedded UI font;
- current cockpit pilot row is a protected visual reference;
- all duplicate pilot names in race UI should be uppercase;
- secondary panels should preferably open as overlay/drawer over the cockpit instead of shrinking the main race geometry.

### UI workflow
A user sketch/reference is the primary visual truth.
Do not create a cinematic JPG concept and then approximate it badly in code.
For substantial components use **code-first/live HTML prototype -> approval -> integration**.
When replacing a component:

```text
OLD IMPLEMENTATION -> REMOVE
NEW IMPLEMENTATION -> ONE AUTHORITATIVE SOURCE
```

not old + new + override.

---

# 12. CURRENT UI FEATURES / IDEAS — IMPLEMENTED VS NOT IMPLEMENTED

## Implemented / substantially implemented
- Dark and Light themes.
- Custom page background color/image; theme switch applies immediately.
- RallyCross compact red race banner.
- Truthful one-line leader/best-lap strip.
- New pilot database tile system / model selection tiles.
- Compact event/practice participant pickers.
- Shared manual action pilot tiles.
- Pilot avatar/team/flag conventions described above.

## Discussed / future — DO NOT CLAIM ALREADY IMPLEMENTED
- Pre-start visual grid overlay for qualification/finals with confirm -> start.
- Post-finish TOP-3 pilot cards with avatars and full result table below.
- Broadcast-style BEST LAP popups/redesign (some earlier pieces may exist, but final accepted new design is not complete).
- Broad settings visual redesign.
- Drawer/tab “tail” panels that slide over cockpit without resizing it.
- Full reporting/PDF UI.
- Online LEGION RX HUB / public results site.

Do not infer implementation just because a visual idea appeared in chat.

---

# 13. REPORTING / FUTURE HUB

`reporting/` exists as a separate module/skeleton and should remain separate.
Future reports can differ by RallyCross / Practice / Rally.

Future online architecture direction:

```text
LOCAL APP DB (always works)
       |
       +-- SYNC ADAPTER --> LEGION RX HUB
                              |
                         public website
                         clubs
                         pilots
                         events
                         results
                         statistics
```

Cloud must never be required to conduct a race.

A Russian-hosted public backend/site is preferred for reliable access from Russia while remaining publicly reachable abroad. This is only future planning; no Hub backend is implemented in RC29.

Pilot DB future migration to IndexedDB / native DB and cloud sync was discussed, but do not assume it is already complete unless current source says so.

---

# 13A. RC31 COCKPIT COLUMN GRID REPAIR

RC31 is a UI-only cockpit repair over RC30. It does not change sport ordering or timing.

The existing JS contract was already:
- `rxnColumnClass()` adds `rxnHide-gap/check/best/avg/last/laps` for disabled metrics;
- `rxnMetricCount()` reduces `--rxn-metric-count` to the number of enabled metrics.

The authoritative cockpit stylesheet had no matching `rxnHide-*` selectors. Therefore disabled metric DOM cells stayed visible after the explicit grid lost their tracks; CSS Grid auto-placed the overflow cells into an implicit second row, visually moving AVG/LAST/LAPS over POS/ID/PILOT. RC31 adds the missing visibility mapping directly in `ui/shell/discipline-pults.css`.

Protected RC30 behavior:
- qualification/final official start order + announcer sequence unchanged;
- pilot/model thin neutral selected outline unchanged;
- RallyCross rules/run-offs unchanged;
- Free Practice sport core unchanged.


# 13B. RC32 SKIP / CANCEL STATE SAFETY

RC32 is a focused RallyCross state-machine repair over RC31. The reported failure was reproduced: skipping A1/A2/A3 could convert every cancelled run into implicit DNS=7, manufacture an exact Final A tie, and each skipped tie-break then generated another tie-break forever. Skipping all qualification heats could create the same all-zero run-off loop. With large fields, cancelling all preliminary LCQ heats could create a zero-pilot final LCQ.

RC32 fixes the authoritative sources only:
- cancelled qualification with no recorded results does not create a run-off;
- cancelled Final A runs are absent results, not DNS;
- zero preliminary winners do not create a zero-pilot downstream LCQ;
- a genuine run-off produced by real saved results remains mandatory and cannot be skipped into a retry chain;
- explicit force-finish is an administrative terminal path and can exit even an unresolved real run-off without recursively creating another event.

Official scoring / BEST-3 / BEST-2 / genuine RC29 run-off criteria remain unchanged. RC30 start order/announcer and RC31 column-grid repair are preserved.

# 13C. RC33 PILOT LAP STATS UI

RC33 is a focused UI-only replacement of the old pilot lap-statistics window. It does not change lap calculation, RallyCross ranking/scoring, Free Practice rules, LapWiz, audio or storage.

Authoritative behavior:
- tap a pilot row in active RallyCross / Free Practice -> one stats overlay;
- overlay bounds are taken from the existing `.rxnRoster` rectangle, so the timer/control pult on the right is never covered;
- the hero reuses pilot-card avatar / flag / team markup and shows current PLACE / BEST / AVG;
- race PLACE comes from the same `RallyCrossModeAPI.startPilots() + liveRanking()` path used by the cockpit; Free Practice PLACE comes from `rankTrackPilots()`;
- lap rows use the cockpit language: BEST green, closest-to-average yellow, WORST magenta;
- Free Practice judge lap deletion and correction history are preserved;
- obsolete `lapSummaryGrid`, old `lapStatsModal` styling and old BEST/AVG/WORST table classes were removed instead of overridden.

Protected behavior: RC30 start-order/announcer, RC31 column repair and RC32 skip/cancel safety remain unchanged.

# 13D. RC34 LIVE PILOT STATS BROADCAST

RC34 refines only the RC33 pilot-statistics presentation; sport/timing data sources are unchanged.

Authoritative behavior:
- landscape: the card is compact, about half the roster width, centered inside `.rxnRoster`; the right timer/control pult is outside its geometry;
- portrait: it may use the available roster width, but because the viewport is still `.rxnRoster`, lower control buttons remain outside it;
- header uses shared avatar/flag/team markup, a colored LapWiz transponder ID, the full pilot name, `POS / BEST / AVG`, plus live `LAPS / TIME`;
- the open card is refreshed by the existing RallyCross 120 ms / Free Practice 250 ms UI tickers through one `refreshPilotLapStatsModal()` path; there is no second timing loop;
- underlying roster rows remain visible and continue updating beneath only a light blur/dim;
- ordinary lap rows are neutral translucent with white values; only BEST text is green and WORST text magenta; no average-lap highlight remains;
- Free Practice judge lap delete/correction history is preserved.

Protected behavior: RC29 scoring/run-offs, RC30 start order/announcer, RC31 column repair, RC32 skip safety and RC33 removal of legacy lap-stats UI remain unchanged.

# 14. TEST POLICY

Every build must run the project tests relevant to its scope plus baseline regression.

Minimum UI regression:
- app loads;
- home opens;
- pilots open;
- competition opens;
- RallyCross cockpit opens;
- Free Practice opens;
- timer renders;
- buttons work;
- pilots/flags render;
- BEST/AVG/LAST/laps remain correct;
- archive opens;
- settings open;
- state survives reload;
- offline shell resolves.

If sport logic changes, additionally run full sport tests and specific scenario tests.

For RC34 currently validated:
- architecture PASS;
- clean foundation PASS;
- iOS START/finish safety PASS;
- pilot UI regression PASS;
- RC26/27/28 regression PASS;
- RC29 static sport checks PASS;
- RC29 run-off behavior remains **28/28 PASS**;
- RC30 start-order/selection behavior preserved: **12/12 PASS**;
- RC31 column-grid contract: PASS; all 64 toggle combinations browser-smoked on desktop/Android-landscape/tablet viewports;
- RC32 skip/state regression: **11/11 PASS**;
- RC33 pilot-stats foundation: **10/10 PASS**;
- RC34 live pilot-statistics UI regression: **17/17 PASS**;
- RallyCross self-test: **18/18 PASS**;
- JavaScript syntax: **40/40 PASS**;
- offline manifest: no missing local file.

Never describe a real iPhone/LapWiz hardware test as PASS unless the user physically ran it. Container/browser tests cannot reproduce every Safari gesture/storage/BLE behavior.

---

# 15. RC31 FILE SCOPE VS RC30

Runtime/code change:

```text
ui/shell/discipline-pults.css
```

Focused/new regression work:

```text
tests/verify_rc31_column_grid.py
tests/verify_ios_start_safety.py
tests/README.md
```

Release/offline/docs metadata are updated as required. `ui/discipline-ui.js`, all RC30 start-order files, `ui/pilots/pilot-cards.css`, RallyCross rules/scoring, Free Practice core, LapWiz/platform audio, storage and reporting are unchanged.

---


# 15B. RC32 FILE SCOPE VS RC31

Authoritative runtime/sport files changed:
```text
modes/rallycross/qualifying.js
modes/rallycross/finals.js
modes/rallycross/runtime.js
```

New focused test:
```text
tests/verify_rc32_skip_flow.js
```

Release/offline/docs/test metadata changed as required. Protected unchanged runtime areas include RC30 start-order/audio files (`modes/rallycross/index.js`, `audio-actions.js`, `ui/discipline-ui.js`), RC31 cockpit CSS, Free Practice, LapWiz, platform audio/storage and reporting.

# 15C. RC33 FILE SCOPE VS RC32

Authoritative UI runtime changes:
```text
ui/shell/views.js
ui/shell/app.css
ui/shell/discipline-pults.css
```

Focused regression:
```text
tests/verify_rc33_pilot_stats_ui.py
```

Release/offline/docs/test metadata changed as required. RallyCross modes, Free Practice mode, `ui/discipline-ui.js`, `ui/pilots/pilot-cards.js/.css`, LapWiz/platform audio/storage and reporting are unchanged from RC32.

# 15D. RC34 FILE SCOPE VS RC33

Authoritative UI runtime changes:
```text
ui/shell/views.js
ui/discipline-ui.js
ui/shell/discipline-pults.css
```

Focused regression:
```text
tests/verify_rc33_pilot_stats_ui.py
tests/verify_rc34_live_pilot_stats.py
```

Release/offline/docs/test metadata changed as required. All `modes/`, `platform/`, `reporting/` and `ui/pilots/` files are unchanged from RC33. No new patch/override stylesheet or timer loop is added.

# 16. IMMEDIATE NEXT-CHAT CHECKLIST

1. Load **RC36 FULL** and this handoff.
2. Read the project docs before touching code.
3. Treat RC36 as **candidate**, not GOLD, until device acceptance.
4. First real acceptance test:
   - exact qualification tie -> `ПЕРЕЗАЕЗД` only tied pilots -> zero extra Q points/result;
   - exact Final A tie -> run-off only tied pilots -> no A4/no extra final score -> only disputed positions reorder;
   - event points assigned from resolved final order.
5. Verify start-call order on device: qualification pult order = spoken order; Final A qualification-rating order = spoken order.
6. RC30 selected tile style remains implemented; do not reintroduce blue fill/glow.
7. Verify cockpit column toggles in RallyCross and Free Practice: disabled metric disappears, remaining metrics expand, no second-row overlap.
8. Verify RC32 skip safety on device: skipped qualification/A-runs do not create fake run-offs; no active event may show `PILOTS 0/0`; a genuine run-off refuses skip; explicit sport finish still reaches archiveable completion.
9. Verify RC34/35 live pilot stats on device: landscape card stays compact and outside the right pult; portrait stays inside the roster above controls; full name and colored ID are visible; POS/BEST/AVG/LAPS/TIME refresh while open; new laps append live; rows remain neutral, BEST text green, WORST text red; Free Practice lap delete still recalculates stats.
10. Verify RC36 cockpit cleanup: no full-width leader photo appears below roster rows at any portrait/compressed size; desktop/landscape header strip reads only `BEST LAP` + live lap time with no trophy/leader wording.
11. Keep every future build focused and output FULL + delta GitHub ZIP.


---

# 17. START PROMPT FOR THE NEXT CHAT

Copy/paste this as the first message after attaching RC36 FULL + this handoff:

> Продолжаем LEGION RX. Загруженная RC36 FULL — текущий исходник-кандидат. Сначала прочитай NEXT_CHAT_HANDOFF.md, PROJECT_MASTER.md, ARCHITECTURE.md, FUNCTION_MAP.md, SPORT_RULES.md, TEST_REPORT.md, VERSION.txt и CHANGELOG.md и исследуй реальные авторитетные файлы. Ничего не пересобирай по памяти. Архитектура обязательна: UI != SPORT RULES != LAPWIZ != STORAGE. Никаких patch/override, одна функция/стиль — один источник. Каждый релиз отдавай двумя архивами: FULL и UPLOAD_TO_GITHUB только с изменёнными файлами. RC36 сохраняет RC29 scoring/run-off, RC30 официальный стартовый порядок/диктора, RC31 исправление колонок, RC32 skip/state safety, RC33 удаление старого UI статистики, RC34 live broadcast-карточку и RC35 typography/density. RC36 меняет только cockpit UI: удалён portrait/full-width лидерский фото-блок, строка над пультом теперь BEST LAP + живое время без кубка и без текста ЛИДЕР. Спортивную логику, Free Practice core, LapWiz, audio, storage и reporting не трогать без отдельной задачи. Считай RC36 кандидатом до физической проверки на устройствах.

---

# 18. ABSOLUTE DEVELOPMENT RULE

```text
НЕ ПЕРЕСОБИРАТЬ ТО, ЧТО УЖЕ РАБОТАЕТ.
НЕ УЛУЧШАТЬ ТО, ЧТО НЕ ПРОСИЛИ.
НЕ ЛЕЧИТЬ ОШИБКУ НОВОЙ ЗАПЛАТКОЙ.
НАЙТИ И ИСПРАВИТЬ НАСТОЯЩИЙ ИСТОЧНИК.
НЕ СМЕШИВАТЬ UI / SPORT / BLE / STORAGE.
ПОСЛЕ КАЖДОЙ СБОРКИ — FULL + МИНИМАЛЬНЫЙ GITHUB DELTA.
```
