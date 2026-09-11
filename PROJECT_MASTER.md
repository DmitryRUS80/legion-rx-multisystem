# LEGION RX — PROJECT MASTER

Current development candidate: **4.2.0 CLEAN FULL APP RC35 · PILOT STATS TYPOGRAPHY DENSITY**  
Direct code base: **RC34 LIVE PILOT STATS BROADCAST**.  
Last repository state explicitly verified with the user before RC21 upload: **RC20 CLEAN FOUNDATION**.

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

## RC35 PILOT STATS TYPOGRAPHY DENSITY

- Same RC34 live pilot-stat component and refresh path; only the existing authoritative cockpit CSS is refined.
- `POS / BEST / AVG` labels are larger and values sit closer to the labels.
- Qualification/session line, `LAPS / TIME`, lap numbers/times and `BEST / WORST` tags are larger with tighter vertical padding.
- Portrait card width is reduced to about 58% of the roster instead of nearly full width.
- BEST remains green; WORST uses the existing red race accent; average receives no highlight.
- No RallyCross / Free Practice / LapWiz / audio / storage / reporting logic changes.

## RC34 LIVE PILOT STATS BROADCAST

- `pilotLapStatsModal()` remains the single open/render entry point; `refreshPilotLapStatsModal()` is the single live refresh path for an already-open card.
- Existing RallyCross (120 ms) and Free Practice (250 ms) UI tickers refresh the card; no second sport/timing loop is introduced.
- Landscape width is compact (~half the roster), portrait uses the available roster rectangle only, so the control pult remains outside the overlay geometry.
- Header: shared avatar/flag/team, colored LapWiz ID, full pilot name, `POS / BEST / AVG`, live `LAPS / TIME`.
- Lap rows remain neutral/translucent; only BEST text is green and WORST text is magenta. The average-lap row highlight is removed.
- The roster beneath stays visible and continues to update through a light blur/dim. Free Practice judge lap deletion remains wired to the existing mode function.
- No RallyCross scoring/runtime, Free Practice timing logic, LapWiz, audio, storage or reporting behavior changes.

## RC33 PILOT LAP STATS UI

- `ui/shell/views.js::pilotLapStatsModal()` remains the single data-to-view entry point for pilot lap statistics.
- In an active RallyCross/Free Practice cockpit it measures `.rxnRoster` and renders only inside those bounds; the right timer/control area remains interactive geometry outside the overlay.
- PLACE is read from the same current ranking source as the cockpit (`RallyCrossModeAPI.startPilots()` + `liveRanking()` for race, `rankTrackPilots()` for practice).
- Avatar, flag and team markup are reused from the authoritative pilot-card component; lap visual styling lives only in `ui/shell/discipline-pults.css`.
- Old `lapSummaryGrid/lapStatsModal/lapBest/lapAverage/lapWorst` UI styles are removed instead of layered over.
- Free Practice judge lap deletion and audit history remain unchanged behaviorally.
- No sport rule, BLE, audio, storage or reporting code is changed.

## RC32 SKIP FLOW STATE SAFETY

RC32 repairs only the RallyCross administrative cancellation/skip/force-finish state machine. Cancelled/unrun events are not allowed to masquerade as equal sport results, zero-pilot downstream LCQ events are not generated, a genuine mandatory run-off cannot be skipped into an infinite retry chain, and explicit force-finish can always terminate and archive the event. Official RC29 scoring and real run-off criteria remain unchanged.

## RC31 COLUMN GRID REPAIR

- The cockpit column toggles remain a UI-only concern. `ui/discipline-ui.js` already owns the saved toggle state / `--rxn-metric-count`; `ui/shell/discipline-pults.css` now completes that existing contract by hiding the matching `rxnGap/rxnCheck/rxnBest/rxnAvg/rxnLast/rxnLaps` cells when the root has `rxnHide-*`.
- This prevents CSS Grid from auto-placing disabled-but-still-visible metrics into an implicit second row over POS / ID / PILOT.
- RallyCross and Free Practice intentionally share this one row component, so the correction is made once in the authoritative cockpit stylesheet.
- RC30 start-order/announcer behavior and pilot/model selected-state visuals are unchanged. Sport/platform/storage/offline behavior is not moved into UI.

## RC30 START ORDER + SELECTION OUTLINE

- Qualification heat order remains the order already generated by the RallyCross qualification builder; RC30 does not recalculate or randomize it in UI/audio.
- Finals use the existing qualification-rating start order. `modes/rallycross/index.js::getEventStartPilots()` is now the single pre-start order source.
- Cockpit and manual RallyCross pilot lists consume the public `RallyCrossModeAPI.startPilots()` adapter; equal live timing no longer falls back to registration order.
- `modes/rallycross/audio-actions.js::announceStartCall()` consumes the same start order, so spoken pilot sequence equals the official cockpit/grid sequence.
- Shared race/practice picker selected states are neutral thin outlines; no cobalt selection fill/glow and no geometry movement.
- RC29 sport scoring/run-off rules remain unchanged (`RALLYCROSS-2026.09.2`).

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


## RC22 PILOT CARDS

- Pilot database presentation is rebuilt as translucent tile cards with large avatar area, uppercase identity and display-only career counters.
- The former pilot-card implementation in `ui/shell/views.js` / `ui/shell/app.css` is removed; `ui/pilots/pilot-cards.js` + `ui/pilots/pilot-cards.css` are the single authoritative component source.
- Each pilot can hold multiple model tiles (`models[]`) with class, model name, display ID/number, transponder and tile color. Legacy profiles without `models[]` are still read through one fallback primary model.
- Race setup no longer uses the former pilot checkbox picker: tapping a model tile adds that pilot/model; tapping it again removes it; choosing another model replaces the pilot's current race model instead of duplicating the pilot.
- Editing is opened from one small corner icon. The pilot card expands into a blurred overlay containing avatar, country, club, city, garage/model fields and the existing local announcer-name audio controls.
- Uploaded transparent PNG/WebP artwork keeps its alpha through the local canvas/WebP path; RC22 does not add automatic AI background removal for ordinary photographs.
- **Post-finish TOP-3 cards are not implemented in RC22**. They are deliberately reserved for a separate UI build after pilot-card acceptance.
- `modes/`, RallyCross rules/runtime, Free Practice sport logic, `app.js`, reporting and RC21 START/audio safety behavior are unchanged.


## RC23 PILOT CARDS CORRECTION
- `ui/pilots/pilot-cards.js` + `pilot-cards.css` remain the single authoritative pilot-card component source. No second card implementation or override layer was added.
- Database card geometry follows the accepted sketch: avatar left, uppercase name below avatar, large races/wins/records block right.
- Empty avatars use a neutral human silhouette; transparent uploaded PNG/WebP artwork remains transparent after local resize.
- Model tiles show ID + model name + class only. Transponder remains data used by the race engine/editor but is not repeated as micro-text on the display tile.
- Selection uses a neutral glass state without colored outline or movement.
- `pilotSetupCard()` now renders the same selected-model mini-card instead of the old avatar/listRow participant rows.


## RC24 GLASS PILOT TILES
- Pilot database keeps one outer translucent card; internal avatar/model/stat surfaces are flat labels on glass rather than nested rounded boxes.
- Avatar viewport is always square and frameless; country flag sits at the avatar lower-right with no border, radius or shadow.
- Model strips are flat 38 px ID-style rows using the pilot/model color and dark ID text, matching cockpit ID proportions more closely.
- Selected model state is neutral glass only: no colored outline and no transform/shake.
- RallyCross setup participants are compact portrait tiles: square avatar + lower-right flag + bottom ID/name strip. The former long participant row is removed from this component.
- Pilot editor keeps the outer overlay but flattens internal avatar, fields, garage blocks and voice section to line-based glass controls.
- `modes/`, `platform/`, RallyCross sport runtime, audio safety and offline update behavior are unchanged.


## RC25 COMPACT PILOT GRID
- Pilot database cards are density-first: adaptive grid targets 4–5 tiles across on desktop and 2–3 on portrait mobile/tablet.
- Database card name uses the compact uppercase presentation (`SURNAME N.`) to remain readable at tile density.
- Avatar viewports remain square but photographs now use centered `cover` cropping; images no longer sit at the bottom or squeeze to fit the square.
- Race picker is rebuilt as compact portrait tiles matching the accepted sketch: square avatar, lower-right flag, compact name and square model-ID stickers.
- Model selection no longer recreates the picker modal. The same DOM stays mounted and only selected states/count update, removing the visible selection shake.
- Pilot model identity is one user-facing field: **ID LAPWIZ**. It is stored into the legacy-compatible `number` and `transponder` properties with the same value so the unchanged timing/sport core still consumes `p.transponder`.
- Editor is more compact; labels are larger/closer to their values; horizontal input guide-lines and duplicate transponder control are removed; model color swatch is a true square.
- `modes/`, `platform/`, `app.js`, reporting, audio and offline/update behavior remain unchanged.


## RC26 PILOT PRACTICE TILES
- Uploaded avatars are now physically saved as centered square crops: the short side fills the square and only the long side is cropped equally from both ends. Existing display surfaces keep centered `cover` behavior.
- Pilot cards can show the club/team label inside the avatar at lower-left; an empty team produces no label. Country flag remains lower-right.
- Race model selectors now show the vehicle class directly under each colored LapWiz ID square.
- Free Practice setup no longer uses the legacy checkbox/list pilot rows. It consumes the same compact pilot/model tile component used by RallyCross selection.
- A Free Practice selection stores the chosen model metadata in the Track Day setup snapshot and passes that model's existing LapWiz ID into the unchanged Free Practice runtime. `modes/free-practice/index.js` is byte-identical to RC25.
- No RallyCross rule, BLE protocol, audio/offline engine or reporting contract changes.


## RC27 PRACTICE GLOW & LIVE THEME

UI-only refinement on the RC26 foundation: Free Practice selection visibility, theme-aware custom background color, and live LapWiz ID preview inside the model color square. No sports-core changes.


## RC28 MANUAL PILOT TILES & IOS STORAGE SAFETY
- Manual pilot choice inside active cockpits now has one shared card presentation everywhere currently implemented: colored LapWiz ID square, uppercase name, country flag and current lap count. Old initials/manual picker card markup is removed.
- The iPhone finish `QuotaExceededError` was traced to duplicated base64 pilot avatars inside persisted race/practice snapshots and accumulated archive history. Pilot photos remain in the pilot DB only; race/Track Day persistence stores lightweight references/identity/result data.
- Legacy stored race/archive/Track Day snapshots are compacted automatically at startup.
- A quota failure during completed-race archival no longer clears the current race. The archive is committed first; only successful persistence clears the cockpit.
- `modes/`, RallyCross sport runtime/rules, Free Practice sport core, LapWiz protocol, audio and reporting are unchanged.
- RC28 remains a candidate until real iPhone finish/archive and field LapWiz acceptance are confirmed.


## RC29 RALLYCROSS RUN-OFF TIEBREAK
- Random qualification draw is removed from the executable RallyCross rules and UI.
- Qualification keeps BEST 3 + finishing-position countback + discarded-result quality. If those criteria are still exactly equal, the tied pilots get a real run-off. The run-off does not write qualification points/results; it stores ordering only inside that tie group.
- Final A keeps A1/A2/A3 with BEST 2. Equal BEST-2 totals are separated by: best counted place -> laps/time of that run -> second counted result -> laps/time. Exact equality creates a Final A run-off.
- Final run-off result is not appended to `pilot.finalResults` and has no event points of its own. It only resolves the disputed final positions; normal event points are assigned afterward from the official final protocol.
- Run-off events use the normal RallyCross runtime/LapWiz path and current final race limit settings. No parallel scoring engine is added.
- Free Practice, LapWiz protocol, audio, storage/reporting contracts and RC28 iOS storage safety are unchanged.
