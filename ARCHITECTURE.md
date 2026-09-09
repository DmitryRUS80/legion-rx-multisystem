# LEGION RX — CLEAN ARCHITECTURE

```text
LEGION RX
├── platform/
│   ├── lapwiz.js          # BLE LapWiz only
│   ├── timing.js          # shared timing helpers
│   ├── storage.js         # current persistent storage API
│   ├── audio.js           # local audio engine
│   ├── pilots.js          # pilot helpers
│   ├── state.js           # application state
│   ├── offline-core.js    # read-only verification of active offline package
│   ├── updater.js         # safe staged PWA update manager
│   └── utils.js
├── modes/
│   ├── rallycross/        # sport rules + qualifying + finals + live runtime
│   ├── free-practice/     # independent practice / Track Day logic
│   ├── rally-sprint/      # future independent mode
│   └── classic-rc/        # future independent mode
├── ui/
│   ├── themes/theme.css   # palette tokens ONLY
│   ├── shell/app.css      # general shell/components/layout source
│   ├── pilots/
│   │   ├── pilot-cards.js # pilot DB cards, model tiles, editor, race picker
│   │   └── pilot-cards.css# authoritative pilot-card component styles
│   ├── shell/discipline-pults.css # RallyCross / Free Practice cockpit source
│   ├── shell/views.js     # application screens
│   ├── shell/actions.js   # UI actions/bindings
│   ├── shell/offline-runtime.js # UI bridge for offline/audio/update state
│   └── discipline-ui.js   # discipline cockpit rendering
├── reporting/             # hidden future output-preparation layer
├── offline-manifest.js    # one version/cache/offline asset manifest
├── sw.js                  # atomic cache install + cache-first active release
├── app.js                 # coordination only
├── boot.js                # startup wiring
└── index.html             # ordered module shell
```

## Hard boundaries

- `platform/lapwiz.js` knows BLE only. It does not know RallyCross, Free Practice or UI.
- `modes/rallycross/*` owns RallyCross sport truth: scoring, BEST 3, LCQ, A1/A2/A3, final protocol and live finish rules. It contains no DOM/CSS/BLE UUID.
- `modes/free-practice/*` owns practice/Track Day rules and does not calculate RallyCross.
- `ui/*` renders state and sends explicit commands. It does not implement BLE packets or RallyCross scoring.
- `reporting/*` accepts already-official result snapshots. It does not calculate sport results and is not connected to UI yet.
- `app.js` coordinates modules and contains no DOM/CSS.

## UI style architecture

There are four explicit style responsibilities:

1. `ui/themes/theme.css` — Dark/Light palette variables only. No component overrides.
2. `ui/shell/app.css` — general screens, forms, navigation, shared cards/modals and layout.
3. `ui/pilots/pilot-cards.css` — the single authoritative style source for pilot database cards, model tiles, expanding pilot editor and race model picker.
4. `ui/shell/discipline-pults.css` — RallyCross / Free Practice cockpit and sport-result/grid presentation.

Historical `variant4.css`, `current-base.css` multi-generation race-console blocks and `*-rc5restore*` runtime names are removed from the active build. RC22 also removes the former pilot-card/pilot-picker implementation from `views.js`/`app.css`; the new pilot component is not an override layer.

## Offline/update architecture

The currently active release is cache-first and never requires network to start a race. A candidate update is downloaded into its own cache by the new service worker. It cannot replace the active release unless its complete offline package installs successfully and the user explicitly confirms installation in Settings. Interrupted downloads leave the active release untouched.


### RC23 pilot-card correction
RC23 keeps this boundary intact: pilot visual composition remains in `ui/pilots/`; `views.js` only places the reusable race-setup mini-card. No RallyCross rule, BLE, storage, audio or reporting logic is moved into the pilot UI.


### RC24 pilot-card visual correction
RC24 changes only the authoritative pilot UI component. Compact race participant tiles remain a presentation of already-selected race pilots; selection/storage/sport behavior is not moved into CSS or RallyCross rules. No additional style layer is introduced.


### RC25 pilot UI / data boundary
RC25 does not move pilot timing identity into `platform/` or `modes/`. The pilot UI exposes one `ID LAPWIZ` field and writes the same canonical value to the existing compatibility properties `model.number`, `model.transponder`, and the selected race pilot `transponder`. RallyCross and LapWiz code remain unchanged and continue consuming the established transponder field. Picker state updates are local DOM presentation updates; sport state still changes only through the existing race-pilot selection path.


### RC26 pilot/practice UI boundary
RC26 keeps pilot/model selection presentation in `ui/pilots/`. RallyCross setup and Free Practice setup both consume that component. The selected Free Practice model is converted by the UI setup layer into the existing Track Day participant snapshot (`transponder`, model metadata); `modes/free-practice/` remains unchanged and continues to process only the participant/transponder data it already owns. Avatar center-cropping is a pilot UI media-preparation concern and does not touch timing/storage architecture.


### RC26 live UI / finish safety boundary
- Application page background is a UI-shell setting only: solid color or a locally stored compressed image. The old page stripe/grid background is removed outside the RallyCross/Practice cockpit. Sport modules do not read this setting.
- Dark/light switching is persisted and applied immediately in the UI shell; it does not wait for the general settings Save button.
- Pilot model color changes are previewed immediately in the authoritative pilot component and persisted immediately for existing profiles. The selected active race snapshot receives only the color presentation field; transponder/sport identity is unchanged.
- The completed-competition button uses an in-app confirmation modal on the UI side. `app.js::completeCompetition(confirmed)` remains DOM-free and owns only archival/state completion. This avoids relying on the native Safari `confirm()` path for the cockpit button.
