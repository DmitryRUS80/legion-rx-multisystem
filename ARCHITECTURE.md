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
