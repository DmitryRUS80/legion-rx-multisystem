# LEGION RX CHANGELOG

## RC34 · LIVE PILOT STATS BROADCAST

- Refined the RC33 pilot lap-statistics window into a compact broadcast-style live card.
- Landscape card is approximately half the roster width; portrait may use the available roster width. It never enters the right timer/control pult.
- Header now shows shared avatar/flag/team, colored LapWiz transponder ID, full pilot name, `POS / BEST / AVG`, live `LAPS / TIME`.
- Open stats refresh from the existing RallyCross / Free Practice UI tickers; position, time, averages, lap counts and newly completed laps remain live.
- Removed guide lines from the header metrics and removed the yellow average-lap highlight.
- Lap rows are neutral translucent rows with white values; only BEST text is green and WORST text uses the existing magenta finish accent.
- Background roster remains visible and continues updating through only a light dim/blur.
- Free Practice judge lap deletion/correction history is preserved. No sport, LapWiz, audio, storage or reporting logic changed.

## RC33 · PILOT LAP STATS UI

- Replaced the legacy pilot lap-statistics modal with one cockpit-native presentation source.
- Active RallyCross / Free Practice statistics are constrained to the pilot-roster area and never cover the timer/control pult.
- Hero uses shared avatar/flag/team language and shows current PLACE / BEST / AVG with neutral foreground values.
- Lap rows: BEST green, closest-to-average yellow, WORST magenta.
- Free Practice judge lap deletion and correction log remain available in the new compact row language.
- Removed the obsolete lap summary/modal/table styling instead of adding an override layer.
- RC29 sport rules, RC30 start order/announcer, RC31 column repair and RC32 skip/state safety are unchanged.

## RC32 · SKIP FLOW STATE SAFETY

- Reproduced the operator skip regression introduced by strict run-off handling: cancelled qualification/final events could manufacture exact ties and create endless mandatory run-offs.
- Qualification run-offs now require equality backed by at least one recorded qualifying result; a group with no recorded qualifying data because heats were skipped does not create a sport run-off.
- Cancelled Final A runs are excluded from BEST-2 scoring instead of being interpreted as DNS=7 for every pilot.
- Exact Final A run-offs are still created normally when real saved Final A results remain exactly tied under the RC29 criteria.
- Cancelling all preliminary LCQ events no longer creates a downstream event with zero pilots; the final grid falls back to the already-qualified top four when nobody advances from the cancelled preliminary path.
- Mandatory qualification/final run-offs cannot be administratively skipped into an endless retry chain. The operator must run the tie-break or use explicit early sport finish.
- `Завершить спортивную часть` is again a true administrative escape: it cancels remaining unsaved events without normal sport advancement, preserves current Final A ordering when real Final A data exists, and creates an archiveable completed protocol.
- No UI redesign, LapWiz, Free Practice core, platform audio/storage, RC30 start-order/announcer, RC31 column-grid or pilot/model selection changes.


## RC31 · COLUMN GRID REPAIR

- Repaired the existing cockpit column-toggle contract in the authoritative `ui/shell/discipline-pults.css`; no patch/override layer was added.
- `rxnHide-gap/check/best/avg/last/laps` now actually hide their matching header/data cells, so `--rxn-metric-count` always matches the visible metric cells.
- Prevents disabled metric cells from wrapping into a second implicit CSS Grid row and appearing over position / ID / pilot name.
- The same fix applies to RallyCross and Free Practice because both intentionally share the cockpit row component.
- RC30 start-order/announcer synchronization and neutral pilot/model selection outline are preserved unchanged. RallyCross scoring/run-offs, Free Practice sport core, LapWiz, audio engine, storage and reporting are unchanged.

## RC30 · START ORDER + SELECTION OUTLINE

- Added one authoritative RallyCross pre-start pilot order shared by cockpit presentation, start-grid view and announcer call sequence.
- Qualification keeps the sport-generated `event.pilots` order exactly as prepared by the qualification heat builder.
- Finals keep the existing qualification-rating start order; the announcer no longer performs a separate private sort.
- Live cockpit ranking now preserves the official start order while lap/time data is equal, then continues to reorder normally from actual race timing.
- Race/practice pilot and model selection removed the blue fill/glow. Selected pilot/model tiles now use a thin neutral light outline with only a very small halo and no transform/layout movement.
- RallyCross scoring, qualification points, LCQ/finals generation, RC29 run-offs, LapWiz, storage, Free Practice sport logic and reporting are unchanged.

## RC28 · MANUAL PILOT TILES & IOS STORAGE SAFETY

- Replaced the old initials-based manual-lap/manual-pass picker cards with one shared cockpit pilot action tile: colored LapWiz ID square + uppercase pilot name + country flag + current lap count.
- The shared action tile is used by RallyCross manual lap/pass dialogs and Free Practice manual pass dialog; old manual picker card CSS is removed from the general shell.
- Fixed the iPhone `QuotaExceededError` seen when completing a race. Race/archive/Track Day persistence no longer duplicates base64 pilot photos that already belong to the pilot database.
- Existing legacy archive/practice snapshots are compacted automatically on startup before application state is loaded.
- Storage writes retry once after legacy compaction when Safari reports quota exhaustion. If archival still cannot be persisted, the active completed race is NOT cleared and the operator receives a readable storage message instead of losing the race.
- RallyCross sport rules/runtime, Free Practice sport core, LapWiz protocol, audio and reporting remain unchanged.

## RC27 · PRACTICE GLOW & LIVE THEME

- Free Practice selection now gives both the selected pilot tile and selected model ID tile a perimeter glow only; no extra border, wrapper or layout shift.
- Custom page background color is now a theme-aware hue seed: Dark and Light automatically derive dark/light variants while preserving the selected color character.
- Model editor color square now shows the LapWiz ID as soon as the ID field is filled; the same square remains the live color picker.
- No sport rules, Free Practice sport core, RallyCross runtime, LapWiz protocol, audio, reporting or finish/start behavior changed.

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

## RC22 · PILOT CARDS
- Replaced the old pilot database card UI with one authoritative translucent tile component.
- Added per-pilot model tiles and backward-compatible `models[]` UI data.
- Replaced race pilot checkboxes with tap-to-toggle model tiles.
- Added expanding blurred pilot editor overlay with avatar/country/club/city/models and retained local pilot-name audio controls.
- Removed the old pilot card/picker implementation from `views.js` and old pilot-card style rules from `app.css`; no patch/override layer added.
- Post-finish TOP-3 cards deliberately deferred to a separate build.
- Sport core, LapWiz protocol, reporting and RC21 iOS START safety unchanged.


## RC22 · PILOT CARDS UI
- Replaced the old pilot database card presentation with one authoritative `ui/pilots/pilot-cards.js` + `pilot-cards.css` component.
- Pilot profiles are tile-based with avatar, flag, uppercase name, club/location, races/wins/records, and model tiles.
- Pilot editing opens as a blurred expanding overlay from the card; country, club, city, avatar and model garage are edited there.
- Race setup no longer uses checkbox-style pilot selection: tapping a model tile adds/removes that model from the active event.
- Existing sport logic, LapWiz, audio, offline update engine and reporting remain unchanged from RC21.


## RC23 · PILOT CARDS CORRECTION
- Rebuilt the pilot database card to follow the accepted user sketch: avatar on the left, pilot name directly below it, large RACES/WINS/RECORDS typography on the right.
- Replaced letter initials with a neutral transparent human silhouette placeholder.
- Pilot flags now use the same square-corner atlas presentation as RallyCross cockpit rows.
- Model tiles now show only the model name and its class; removed generic MODEL/TP micro-labels from the display tile.
- Model ID blocks use the same flat color / dark ID text / near-square proportions as the cockpit pilot ID block.
- Removed selection shake/translation and colored selection outline; selected models use a neutral translucent glass highlight.
- RallyCross setup participant list now reuses the same model mini-card; tapping the mini-card removes that pilot/model from setup.
- Sport rules, LapWiz, audio, offline updater and reporting are unchanged.


## RC24 · GLASS PILOT TILES
- Removed nested rounded borders from pilot-card internals; retained one outer translucent card surface.
- Pilot avatar is square and frameless; flag is flat at lower-right with no border/radius/shadow.
- Flattened model rows and aligned ID geometry to the cockpit-style 38 px ID block.
- Selected models use neutral glass highlight only; no colored outline and no movement/shake.
- Replaced RallyCross setup long participant rows with compact portrait tiles: avatar, lower-right flag, colored ID and compact pilot name.
- Flattened pilot editor inputs/model blocks to line-based controls without internal rounded boxes.
- Sport rules, LapWiz, audio safety, offline update engine and reporting: NO CHANGE.


## RC25 · COMPACT PILOT GRID
- Repacked pilot database cards into a dense adaptive grid: 4–5 per desktop row, 2–3 on portrait mobile/tablet.
- Database pilot names use compact uppercase format to avoid truncating full names in dense tiles.
- Fixed uploaded-avatar positioning: square viewport with centered `object-fit: cover`; no bottom drift or squeezed image.
- Rebuilt race pilot selection as compact portrait tiles with square model-ID stickers, matching the accepted sketch instead of wide rows/cards.
- Removed selection shake by replacing full picker re-render with in-place state/count updates.
- Consolidated model number/transponder editing into one `ID LAPWIZ` field; the same ID is mirrored to compatibility `number`/`transponder` fields so unchanged LapWiz/RallyCross code continues to use `transponder`.
- Made pilot editor more compact, increased micro-label size/proximity, removed horizontal input guide-lines and made the ID color swatch square.
- Sport rules, LapWiz protocol, audio, offline updater, reporting and cockpit UI: NO CHANGE.


## RC26 · PILOT PRACTICE TILES
- Avatar upload now performs a true centered square crop by the short side before saving the local image.
- Added compact team label on the pilot avatar lower-left; empty team leaves the avatar clean.
- Model selection tiles now show the model class below each colored LapWiz ID square.
- Replaced the legacy Free Practice pilot checkbox/list rows with the same compact pilot/model tile selector used by the new pilot UI.
- Free Practice setup now carries the selected model's LapWiz ID into its participant snapshot while leaving `modes/free-practice/` unchanged.
- Removed obsolete `trackPilotCheck` / `trackPilotPicker` CSS rules from the global shell.
- No RallyCross rule/runtime, LapWiz protocol, audio/offline engine or reporting changes.

- Removed the striped page background outside the race cockpit and added immediate local background color/image controls in Settings.
- Dark/light theme now switches and persists immediately, without waiting for “Save settings”.
- Existing-pilot model color now changes visually and persists immediately from the color picker; no profile Save is required for color alone.
- Completed RallyCross “ЗАВЕРШИТЬ” now opens an in-app confirmation and completes through a confirmed DOM-free core path, avoiding the native iPhone/Safari confirm dependency.
- Added dedicated RC26 UI-safety regression checks; RallyCross sport modules, Free Practice sport module, LapWiz platform code and reporting remain unchanged.


## RC29 · RALLYCROSS RUNOFF TIEBREAK
- Removed random qualification draw and the visible `ЖЕРЕБЬЁВКА` action.
- Removed the old latest-round/registration fallback as an official qualification tie resolver.
- Qualification exact equality now creates real run-off events for tied pilots only; run-off results change local order only and add no Q points/results.
- Final A ranking now follows BEST 2 sum -> best counted place -> laps/time of best counted run -> second counted result/laps/time.
- Exact Final A equality creates a run-off for the tied pilots only. It is not A4, adds no bonus points and is excluded from scored `finalResults`.
- Official event points are assigned only after run-off-resolved final positions are known.
- Added dedicated static and behavioral regression tests for qualification/final run-offs; focused suite now covers 28 scenarios, including middle-table and three-way ties.
- Free Practice, LapWiz, audio, storage/reporting and RC28 iPhone archive safety are unchanged.
