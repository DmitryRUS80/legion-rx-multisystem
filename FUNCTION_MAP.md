# LEGION RX — FUNCTION MAP

- LapWiz BLE/connect/start/stop/pass parsing -> `platform/lapwiz.js`
- Shared timing helpers -> `platform/timing.js`
- Persistence -> `platform/storage.js`
- Audio engine + pilot clips -> `platform/audio.js`
- Active offline package verification -> `platform/offline-core.js`
- Safe update lifecycle -> `platform/updater.js` + `sw.js`
- Version/cache/offline package source -> `offline-manifest.js`
- Pilot helpers / data compatibility -> `platform/pilots.js`
- App state -> `platform/state.js`

- RallyCross constants/data model/finish policy -> `modes/rallycross/rules.js`
- Qualification / BEST 3 / exact-tie run-off ordering -> `modes/rallycross/qualifying.js`
- LCQ / A1 A2 A3 / BEST-2 equality criteria / Final A run-offs / final protocol -> `modes/rallycross/finals.js`
- RallyCross live lifecycle -> `modes/rallycross/runtime.js`
- RallyCross public mode API -> `modes/rallycross/index.js`
- RallyCross voice events -> `modes/rallycross/audio-actions.js`
- Free Practice / Track Day -> `modes/free-practice/index.js`

- Global Dark/Light tokens -> `ui/themes/theme.css`
- General application UI -> `ui/shell/app.css`
- Pilot database cards / model tiles / expanding pilot editor / race model picker -> `ui/pilots/pilot-cards.js` + `ui/pilots/pilot-cards.css`
- RallyCross + Free Practice cockpit style -> `ui/shell/discipline-pults.css`
- General screens -> `ui/shell/views.js`
- Routing -> `ui/shell/router.js`
- UI actions -> `ui/shell/actions.js`
- Offline/audio/update UI bridge -> `ui/shell/offline-runtime.js`
- RallyCross + Free Practice cockpit renderer -> `ui/discipline-ui.js`
- Coordination between platform/modes/UI -> `app.js`
- Startup -> `boot.js` + `app-bridge.js`

- Hidden report registry -> `reporting/core.js`
- Report adapters -> `reporting/sections/rallycross.js`, `practice.js`, `rally.js`


## RC23 pilot UI
- `ui/pilots/pilot-cards.js` — authoritative `pilotCardMarkup`, `pilotModelTileMarkup`, `pilotRaceSetupTileMarkup`, pilot editor and race model picker.
- `ui/pilots/pilot-cards.css` — authoritative database card / model mini-card / pilot editor visual source.
- `ui/shell/views.js::pilotSetupCard()` — consumes `pilotRaceSetupTileMarkup()`; it does not define a second pilot-card visual.


## RC24 pilot UI
- `ui/pilots/pilot-cards.js::pilotRaceSetupTileMarkup()` — compact selected-participant portrait tile (avatar + flag + model ID + compact name).
- `ui/pilots/pilot-cards.css` — single source for square frameless avatars, flat model strips, glass selection and flattened editor controls.
- `ui/shell/views.js::pilotSetupCard()` only hosts the tile grid; participant visual composition remains owned by `ui/pilots/`.


## RC25 pilot UI
- `ui/pilots/pilot-cards.js::pilotModels()` — compatibility normalization for a single user-facing LapWiz ID; old visible `number` is preferred when legacy `number` and `transponder` disagree, then both compatibility properties are emitted with the same canonical value.
- `ui/pilots/pilot-cards.js::pilotPickerModelChipMarkup()` — compact square model-ID sticker inside the race picker.
- `ui/pilots/pilot-cards.js::pilotSyncPickerState()` — updates selected model/count in-place; does not recreate the modal.
- `ui/pilots/pilot-cards.css` — authoritative dense database grid, compact picker, centered avatar crop and compact editor geometry.


## RC26 pilot/practice UI
- `ui/pilots/pilot-cards.js::pilotResizeAvatar()` — canonical centered square avatar crop at upload time.
- `ui/pilots/pilot-cards.js::pilotPickerModelChipMarkup()` — colored LapWiz ID square + visible model class for RallyCross/Practice selectors.
- `ui/pilots/pilot-cards.js::pilotPracticeGridMarkup()` / `pilotTogglePracticeModel()` / `pilotPracticeParticipants()` — Free Practice setup tile UI and conversion of the selected model into the existing Track Day participant snapshot.
- `ui/shell/views.js::trackDaySetupView()` — hosts the reusable practice tile grid; no legacy checkbox pilot rows.
- `ui/shell/actions.js::bind415()` — binds Practice model-tile taps; no sport scoring/timing logic is added here.


## RC26 live UI / background / finish safety
- `ui/shell/discipline-shared.js::applyAppBackground()` — applies the local page background color/image; `resizeAppBackground()` prepares an uploaded image before local settings storage.
- `ui/shell/actions.js::bindView()` — instant dark/light toggle, instant page background color, background image upload/remove. These are UI settings only.
- `ui/pilots/pilot-cards.js::pilotPersistEditorColor()` — immediate model-color persistence for an existing pilot and matching active race presentation snapshot.
- `ui/shell/views.js::competitionFinishConfirmModal()` — iOS-safe in-app completion confirmation.
- `app.js::completeCompetition(confirmed=false)` — archives/clears a completed competition; UI may pass `true` after its own confirmation without putting DOM code in `app.js`.


## RC27 changed UI functions
- `pilotRenderModelEditors()` — live LapWiz ID text inside the existing color square.
- `appBackgroundThemeColor()` / `applyAppBackground()` — theme-aware rendering of a user-selected background hue.
- `.pilotSelectCard.hasSelection` / `.pilotPickerModelChip.selected` / `.pilotModelTile.selected` — RC30 thin neutral light outline + subtle halo only; no blue fill and no layout change.


## RC28 manual pilot / storage safety
- `ui/pilots/pilot-cards.js::pilotActionTileMarkup()` — shared compact cockpit action card: LapWiz ID square + name + flag + lap count.
- `ui/shell/views.js::manualLapModal()` / `manualPassPicker()` — RallyCross manual action dialogs consuming the shared pilot tile.
- `ui/discipline-ui.js::rxnTrackManualLapModal()` — Free Practice manual action dialog consuming the same shared pilot tile.
- `platform/storage.js::compactRaceForStorage()` / `compactTrackDayForStorage()` — remove duplicated embedded pilot avatar payloads from race/practice persistence snapshots while preserving pilot/result identity.
- `platform/storage.js::compactLegacyStorage()` — one-time/automatic compaction of older local snapshots and quota-retry support.
- `app.js::archiveCurrentRace()` / `completeCompetition()` — persist a compact archive snapshot before clearing the active race; archival failure leaves the active completed race in place.


## RC29 run-off functions
- `comparePilotsWithoutRunoff()` — qualification sport comparison only; 0 means a real unresolved tie.
- `createQualificationRunoffs()` / `saveQualificationRunoffEvent()` — run only tied qualification pilots; write local order only, no Q points.
- `compareMainStandingsCore()` — Final A BEST-2 sum -> best place -> laps/time -> second counted result.
- `createFinalRunoffs()` — creates a run-off only for exact Final A tie groups.
- `saveFinalEvent()` tie-break branch — stores run-off order only and then rebuilds the official final protocol.

## RC30 start-order bridge
- `modes/rallycross/index.js::getEventStartPilots()` — single authoritative pre-start order: qualification preserves prepared heat order; finals use current qualification rating.
- `RallyCrossModeAPI.startPilots()` — public read adapter used by cockpit/manual UI before `liveRanking()`.
- `modes/rallycross/runtime.js::liveRanking()` — live timing sort; when live values are equal, preserves the supplied official start order instead of falling back to registration order.
- `modes/rallycross/audio-actions.js::announceStartCall()` — speaks `getEventStartPilots()` in sequence; no duplicate finals sorting.

