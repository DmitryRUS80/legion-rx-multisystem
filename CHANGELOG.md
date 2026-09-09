# LEGION RX CHANGELOG

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
