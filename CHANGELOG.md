# LEGION RX CHANGELOG

## RC57 · SESSION CONTROL

- RallyCross main control grid is now `START / PAUSE / FINISH / RESTART / SESSION SETTINGS / STOP`; `+1 МИН` and `РУЧНОЙ КРУГ` are removed from the main RallyCross pult.
- Added event-local session settings overlay directly over the pult: time/laps mode, minutes/laps, warm-up, countdown and Min Lap. `ПРИМЕНИТЬ` saves, closes the overlay and immediately updates the current heat only.
- Added race restart for an unsaved attempt. After STOP/finish, RESTART resets live timing for the same event without changing pilots, event order or session settings.
- Added live pilot editing from the pilot stats card during a competition: name, transponder, country and club update immediately. Existing laps/results remain keyed by stable pilot id. Duplicate transponders in the active race are rejected.
- Added isolated `platform/pilot-live-edit.js`; live identity editing is not mixed into sport scoring or BLE parsing.
- Session-specific rule overrides are owned by RallyCross mode (`event.sessionSettings`) and do not alter application-wide defaults or later heats.
- Session/pilot overlays use one surface, large controls and theme tokens; no nested-card layout or micro-help text.

# RC56 — UPDATE RECOVERY / WORKSPACE WALLPAPER

- Исправлена причина отказа установки RC55: GitHub-пакет RC55 не содержал `ui/shell/router.js` и `ui/discipline-ui.js`, хотя новый Service Worker требовал их свежие версии. При обновлении с реально установленной RC53 это гарантированно переводило новый worker в `redundant`.
- RC56 выпускается как кумулятивный recovery-пакет от RC53: в `UPLOAD_TO_GITHUB` входят все файлы, которые реально отличаются от RC53 и нужны RC54–RC56, включая `router.js` и `discipline-ui.js`.
- Проверки Service Worker по shell CSS сделаны семантическими, а не привязанными к строке `RC55`, чтобы служебная проверка не ломала следующий релиз из-за одного номера в комментарии.
- Обои и UI RC55 сохранены без визуальных изменений: landscape/portrait wallpaper остаются фоном всего рабочего пространства только для новых тем; Classic не меняется.
- Спортивная логика, LapWiz, storage, audio и reporting не менялись.

# RC55 — WORKSPACE WALLPAPER

- The selected rallycross artwork is now the built-in workspace background for every non-Classic theme, behind the page, sections and buttons rather than inside the top hero block.
- Added dedicated landscape and portrait wallpaper assets; CSS switches them automatically by orientation.
- The top hero no longer owns an image. It is a translucent information surface over the same page background.
- Main shell surfaces are slightly translucent so the wallpaper remains visible without adding nested containers or decorative strips.
- Classic is unchanged and remains the reference/donor. Its existing custom background controls remain separate.
- No sport, LapWiz, storage, audio or reporting logic was changed.

# RC54 — THEME ISOLATION / UNIFIED NON-CLASSIC SHELL

- Rebuilt from the true RC52 state (RC46 FULL plus every RC47–RC52 release delta), preserving the RC49+ safe updater pipeline and RC50–RC52 cockpit fixes.
- Classic home markup remains exactly on the original Classic path. The redesigned home screen is rendered only for non-Classic skins.
- Unified button/surface/navigation language is scoped with `html:not([data-skin="classic"])`; Classic is not restyled by the new system.
- `index.html` remains only the static application shell and dependency loader. No sport rules, LapWiz protocol, storage logic, theme implementation, or screen renderer was moved into index.
- New-theme screen structure stays in `ui/shell/router.js`; shared shell styling stays in `ui/shell/app.css`; removable theme styling stays in `ui/skins/rxui/*`.
- Added the race-car wallpaper asset for the non-Classic home hero and included it in the atomic offline package.

# LEGION RX CHANGELOG

## RC52 · THOUSANDTHS BASELINE FIX

- Fixed shared cockpit time typography in all themes: when precision is `0.001`, the three digits after the dot now stay on the same lower baseline as the main digit; only the size is reduced.
- Locked mobile cockpit table-header metric labels `GAP / BEST / AVG / LAST / LAPS` to the same size as `ПИЛОТ`, preventing them from appearing larger on phone landscape.
- Kept the COBALT top stop-window square icon with a dark outline on the light button state for clearer contrast.
- No sport logic, LapWiz, audio, storage or reporting changes.

## RC51 · PHONE TABLE TYPOGRAPHY

- Kept the RC50 shared phone-landscape geometry and corrected only typography/contrast details.
- Thousandths remain 75% size, but are now top-aligned with the main digit group instead of sitting lower in the flex cell. One- and two-decimal values remain full size.
- On landscape phones, `GAP / BEST / AVG / LAST / LAPS` table-header labels now inherit the same header font size as `ПИЛОТ`; only pilot data cells receive the larger numeric font.
- In COBALT, the top STOP square icon on its light button now uses a dark outline instead of red for proper contrast.
- No sport rules, race state, LapWiz, audio, storage, reporting, pilot-row geometry or button layout logic changed.

## RC50 · PHONE LANDSCAPE GEOMETRY

- Added one shared landscape-phone breakpoint (`<=1100 × 600 CSS px`) so modern phones around 522 px viewport height no longer fall into the larger tablet cockpit geometry.
- Reduced the horizontal-phone top toolbar/button height by about 25% in every visual theme.
- Fixed the control panel allocation so GAP/BEST/AVG/LAST/LAPS and precision buttons have their own row and cannot cover the six main race-control buttons.
- Reduced the Rally class label and lap-ring text by about 25% on horizontal phones; added clear vertical separation between the main timer digits and its lower caption.
- Pilot-row numeric cells now use the same base font size and vertical centering as the pilot name on horizontal phones. One/two decimal places remain full size; the three-digit fractional part is exactly 75% of the main number.
- Control SVG icons now inherit the button text color, fixing low-contrast white icons on light/white control surfaces.
- Cobalt no longer owns cockpit geometry; it is visual paint only, so Classic / Cobalt / Steel / Light / Modern / Heritage share the same responsive dimensions.
- Sport rules, timing, LapWiz, audio, storage and reporting are unchanged.

## RC49 · RECOVERY UPDATE PIPELINE

- Fixed the actual RC48 update failure visible on the deployed app: the device was still running RC45, but the previous GitHub package was incremental from RC46/RC48 and omitted the RC46 `ui/classic-polish/` runtime files required by the new offline manifest. The RC49 GitHub package is cumulative from RC45.
- Rebuilt the PWA update path so an installed RC45/RC46 build cannot accidentally reuse an older HTTP-cached `offline-manifest.js` while checking a newer service worker.
- The service worker imports the RC49 manifest through a release-unique URL and downloads critical release files with cache-busting plus retry.
- Added release sentinels: RC49 refuses to activate unless the downloaded index references both COBALT and Classic-polish files, Settings contains `COBALT · BLUE CONTROL`, Cobalt CSS is valid, and `VERSION.txt`/offline manifest identify RC49.
- Unchanged local assets may fall back to the previous verified cache on a transient network failure; critical changed/new files never fall back to stale content.
- `VERSION.txt` is now part of the verified offline package. Classic cockpit, pilot rows, sport rules, LapWiz, audio, storage and reporting are unchanged.

## RC48 · COBALT UPDATE VISIBILITY

- Fixed the deployment/update path after RC47 could remain visually stuck on the old five-skin Settings screen.
- The top-level `sw.js` is now physically version-bumped so the PWA browser update check sees an unmistakably new service worker build.
- COBALT is explicitly labeled in Settings as `COBALT · BLUE CONTROL` with the description `Тёмная тема · голубой пульт`.
- The skin selector grid now accommodates all six skins on wide screens.
- Added a release guard test that requires Cobalt to exist in CSS, Settings, index loading, offline package and the service-worker build marker.
- Classic, cockpit pilot rows, sport logic, LapWiz, audio, storage and reporting are unchanged.

## RC47 · COBALT COCKPIT SKIN

- Added a new separate `COBALT` interface skin; `CLASSIC` remains preserved as the authoritative untouched baseline.
- The new skin changes cockpit chrome only: top icon buttons, main race-control buttons, and display-toggle buttons. No new panels, widgets or layout blocks were introduced.
- Pilot rows are intentionally left on the Classic rendering/styling path; their geometry and data layout are unchanged.
- The Cobalt cockpit uses the RXUI icon family, removes legacy status dots/side strips, keeps full-surface button states, and gives the lower display-tool buttons slightly more height.
- Portrait/landscape structure remains the existing Classic adaptation. RallyCross logic, Free Practice logic, LapWiz, audio, storage and reporting are unchanged.

## RC40 · CLEAN SETTINGS UI

- Rebuilt Settings from the RC38 FULL baseline; RC39 settings implementation is not used as the base.
- Desktop/tablet horizontal: left section navigation + one right settings surface. No nested settings cards.
- Phone portrait: vertical accordion. The active section can be collapsed normally, and only one section is open at a time.
- Section switching is DOM-only and does not rerender the settings screen, so unsaved field values are preserved while moving between sections.
- Update / Offline is a dedicated section using the same row-based visual language instead of an old card inside a new container.
- Save button is top-right on desktop and placed after all accordion sections on mobile; it is not injected into the middle of an open section.
- Increased surface opacity and added backdrop blur to suppress noisy background patterns. Primary settings text/controls are larger and no longer use microtype as the main UI language.
- Removed obsolete RC38 settings-grid/setting-group/background-setting CSS from the authoritative stylesheet rather than adding an override patch at the end.
- Runtime changes remain UI-shell only: `ui/shell/views.js`, `ui/shell/actions.js`, `ui/shell/app.css`, `ui/shell/discipline-shared.js`. Sport logic, LapWiz protocol/timing, audio engine, storage engine, reporting, pilot DB and cockpit UI are unchanged.

## RC37 · AVATAR CROP + COMPRESSION

- Replaced the old fixed center-crop avatar upload with an interactive square cropper: drag the photo and zoom before accepting it.
- Pilot avatars are encoded to a compact local 480×480 target (420 fallback only when necessary), preferring WebP with JPEG fallback and adaptive quality targeting about 95 KB binary size.
- Gallery selection and mobile camera images pass through the same crop/compression path; the original multi-megabyte photo is never written to the pilot database.
- Existing pilot DB/storage contract is preserved: only the processed avatar data URL is stored. RallyCross, Free Practice, LapWiz, audio, reporting and race timing are unchanged.


## RC36 · BEST LAP STRIP + HERO CLEANUP

- Removed the obsolete phone-portrait full-width leader-photo block from the authoritative cockpit renderer and stylesheet; compressed/portrait layouts no longer append a giant leader avatar below the pilot rows.
- Simplified the cockpit best-lap strip to `BEST LAP` + the live lap time only. The trophy icon and misleading `ЛИДЕР · ЛУЧШИЙ КРУГ` wording were removed.
- Renamed the strip's internal UI class/IDs to BEST-LAP semantics instead of leaving a stale leader-strip implementation behind.
- Existing RallyCross UI tick still refreshes the best-lap time live; sport ranking, timing, announcer/start order, Free Practice, LapWiz, storage and reporting are unchanged.

## RC35 · PILOT STATS TYPOGRAPHY DENSITY

- Refined the existing RC34 live pilot-statistics component only; no new overlay/style layer or sport logic changes.
- Enlarged `POS / BEST / AVG` labels and moved their values closer to the labels to match the broadcast reference more closely.
- Enlarged qualification/session line, `LAPS / TIME`, lap number/time values and `BEST / WORST` tags while tightening vertical air around the text.
- Portrait card is narrowed to about 58% of the available roster width instead of occupying nearly the whole roster.
- Normal lap rows remain neutral/translucent; BEST remains green, WORST now uses the existing red race accent, and average remains unhighlighted.
- RC34 live refresh, Free Practice lap delete, RallyCross rules/timing, LapWiz, audio, storage and reporting are unchanged.

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


## RC38 · AVATAR CROP LAYER FIX
- Fixed the RC37 crop dialog stacking bug: the avatar cropper now opens above the pilot editor instead of underneath it.
- Mobile crop UI is centered in the viewport instead of opening as a bottom sheet.
- After `ГОТОВО`, the cropped image is applied immediately to the still-open pilot editor preview.
- Avatar target remains 480×480 with WebP/JPEG fallback; the compact target is tightened from ~95 KB to ~72 KB to reduce localStorage pressure.
- Pilot database/storage contract, RallyCross, Free Practice, LapWiz, audio, reporting and timing are unchanged.


## RC44 · RXUI removable skins
- Base: RC40 CLEAN SETTINGS UI.
- Classic visual source files remain authoritative and were not edited for the skin look.
- Added removable `ui/skins/rxui/` layer with STEEL, LIGHT, MODERN and HERITAGE.
- Existing Classic markup/actions are reused; sport/platform/storage/audio/reporting logic is unchanged.
- RallyCross pilot-row geometry remains untouched; skins only paint rows/shell and replace icon artwork outside Classic.
- Skin selection is stored as `settings.uiSkin`; `classic` is always available as rollback.

## RC45 · COCKPIT STEEL / LIGHT POLISH
- Focused cockpit-only visual refinement over RC44 removable skins; Classic source markup and Classic cockpit CSS are unchanged.
- Rebuilt STEEL and LIGHT cockpit surfaces as instrument-style materials rather than flat recolors: coherent header/nav/toolbar/timer/control surfaces with restrained full-surface states.
- Replaced the RXUI SVG vocabulary with one consistent monoline family for cockpit navigation, toolbar actions and race controls. Classic never consumes this icon map.
- Removed legacy side/bottom activation-strip behavior from STEEL/LIGHT cockpit skin; active/on states are represented by the complete button surface.
- Disabled controls now have explicit theme states instead of generic opacity, so available vs unavailable actions remain readable on desktop and portrait layouts.
- Pilot rows keep the exact RC44/Classic grid, height, order and interaction geometry; skin layer changes paint only.
- MODERN and HERITAGE skin token files are unchanged. RallyCross/Free Practice sport logic, LapWiz, audio, storage and reporting are unchanged.


## RC46 · CLASSIC CONTROL POLISH
- Added isolated Classic-only cockpit polish layer: `ui/classic-polish/classic-controls.css` + `classic-icons.js`.
- Classic cockpit geometry, pilot rows, timer layout and sport behavior are unchanged.
- Replaced cockpit toolbar/race-control SVG paths with one coherent icon family.
- Removed visual status dots, side activation stripes and bottom inset selection bars from Classic cockpit controls.
- Active/connected, primary, danger and disabled states now use full control surfaces.
- Bottom GAP/BEST/AVG/LAST/LAPS and precision toggles use full-surface selection.
