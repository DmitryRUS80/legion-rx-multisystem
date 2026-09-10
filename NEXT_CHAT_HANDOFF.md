# LEGION RX — NEXT CHAT HANDOFF · RC29

**Date:** 2026-09-09  
**Current code candidate:** `Legion_RX_4.2.0_CLEAN_FULL_APP_RC29_RALLYCROSS_RUNOFF_TIEBREAK_FULL.zip`  
**Base:** RC28 MANUAL PILOT TILES & IOS STORAGE SAFETY  
**Status:** RC29 automated regression PASS; **real iPhone + LapWiz acceptance still required**.

---

## 0. FIRST RULE FOR THE NEXT CHAT

Do **not** rebuild Legion RX from memory and do not use an older archive as the source.

1. Unpack the latest **RC29 FULL**.
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

# 6. CURRENT RC29 RALLYCROSS SPORT RULES

RC29 intentionally changes the RallyCross sport module. This is a sport-core build, not a UI patch.

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

### Pending visual correction NOT YET IMPLEMENTED IN RC29
The user rejected the current bright/blue selection glow.

Next UI build must change selected-state everywhere to:
- **very thin subtle light outline only**;
- no blue fill;
- no thick glow;
- no extra wrapper/border nesting;
- no transform/shake/layout shift;
- theme-aware subtle light/dark contrast.

Apply one shared selected-state language to relevant pilot/model selectors (Race setup, Free Practice and other shared picker tiles) by editing authoritative component styles, not by adding override CSS.

This UI correction was requested **before** RC29 sport work but intentionally remains pending so RC29 could stay focused on sport rules.

---

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

For RC29 currently validated:
- architecture PASS;
- clean foundation PASS;
- iOS START/finish safety PASS;
- pilot UI regression PASS;
- RC26/27/28 regression PASS;
- RC29 static sport checks PASS;
- RC29 behavior: **28/28 PASS**;
- RallyCross self-test: **18/18 PASS**;
- JavaScript syntax: **38/38 PASS**;
- offline manifest: no missing local file.

Never describe a real iPhone/LapWiz hardware test as PASS unless the user physically ran it. Container/browser tests cannot reproduce every Safari gesture/storage/BLE behavior.

---

# 15. RC29 FILE SCOPE VS RC28

RC29 changed/added only the files necessary for RallyCross equality/run-off behavior, related presentation/routing, release metadata and tests.

Sport-authoritative changes include:

```text
modes/rallycross/rules.js
modes/rallycross/qualifying.js
modes/rallycross/finals.js
modes/rallycross/runtime.js
modes/rallycross/index.js
modes/rallycross/self-test.js
```

Supporting UI routing/presentation:

```text
ui/discipline-ui.js
ui/shell/discipline-shared.js
ui/shell/actions.js
```

New focused tests:

```text
tests/verify_rc29_rallycross_runoffs.py
tests/verify_rc29_rallycross_runoffs.js
```

Release/offline/docs/tests hashes were updated as required.

Protected unchanged areas include:
- `modes/free-practice/index.js` byte-identical to RC28;
- `modes/classic-rc/index.js` byte-identical;
- `modes/rally-sprint/index.js` byte-identical;
- `modes/rallycross/audio-actions.js` byte-identical;
- LapWiz protocol unchanged;
- RC28 storage/quota path unchanged;
- reporting unchanged.

---

# 16. IMMEDIATE NEXT-CHAT CHECKLIST

1. Load **RC29 FULL** and this handoff.
2. Read the project docs before touching code.
3. Treat RC29 as **candidate**, not GOLD, until device acceptance.
4. First real acceptance test:
   - exact qualification tie -> `ПЕРЕЗАЕЗД` only tied pilots -> zero extra Q points/result;
   - exact Final A tie -> run-off only tied pilots -> no A4/no extra final score -> only disputed positions reorder;
   - event points assigned from resolved final order.
5. After RC29 sport acceptance, the next pending UI correction is the **selected tile style**: replace ugly bright blue glow/fill with a thin subtle light outline, no layout movement.
6. Keep every future build focused and output FULL + delta GitHub ZIP.

---

# 17. START PROMPT FOR THE NEXT CHAT

Copy/paste this as the first message after attaching RC29 FULL + this handoff:

> Продолжаем LEGION RX. Загруженная RC29 FULL — текущий исходник-кандидат. Сначала прочитай NEXT_CHAT_HANDOFF.md, PROJECT_MASTER.md, ARCHITECTURE.md, FUNCTION_MAP.md, SPORT_RULES.md, TEST_REPORT.md, VERSION.txt и CHANGELOG.md и исследуй реальные авторитетные файлы. Ничего не пересобирай по памяти. Архитектура обязательна: UI != SPORT RULES != LAPWIZ != STORAGE. Никаких patch/override, одна функция/стиль — один источник. Каждый релиз отдавай двумя архивами: FULL и UPLOAD_TO_GITHUB только с изменёнными файлами. RC29 имеет новую логику квалификационных и финальных перезаездов без дополнительных очков; сначала считай её кандидатом до физического теста на iPhone/LapWiz. Не трогай работающие модули без необходимости.

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
