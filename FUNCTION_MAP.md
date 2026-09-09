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
- Qualification / BEST 3 / ties -> `modes/rallycross/qualifying.js`
- LCQ / A1 A2 A3 / final protocol -> `modes/rallycross/finals.js`
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
