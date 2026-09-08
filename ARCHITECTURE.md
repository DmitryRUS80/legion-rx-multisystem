# LEGION RX CLEAN ARCHITECTURE

```text
LEGION RX
├── platform/
│   ├── lapwiz.js
│   ├── timing.js
│   ├── storage.js
│   ├── audio.js
│   ├── pilots.js
│   ├── state.js
│   ├── offline.js
│   └── utils.js
├── modes/
│   ├── rallycross/
│   ├── free-practice/
│   ├── rally-sprint/   (disabled)
│   └── classic-rc/     (disabled)
├── ui/
├── reporting/
│   ├── core.js
│   └── sections/
│       ├── rallycross.js
│       ├── practice.js
│       └── rally.js
├── app.js
├── boot.js
├── index.html
├── sw.js
└── manifest.webmanifest
```

## Hard boundaries
`platform/lapwiz.js` knows BLE only. It does not know RallyCross, Free Practice or UI.

`modes/rallycross/*` owns scoring, Best3, LCQ, A1/A2/A3 and race runtime. It contains no DOM/CSS/BLE UUID.

`modes/free-practice/*` owns Track Day / Free Practice lap, PIT and judge-correction logic. It contains no DOM/CSS/RallyCross scoring.

`ui/*` renders and collects explicit user input. It does not implement BLE packets or sport scoring constants. Sport data for display is obtained through the RallyCross public mode API.

`app.js` routes platform events to the active mode and coordinates application actions. It contains no DOM/CSS.


`reporting/*` is an independent output-preparation layer. It receives already-official result snapshots from a discipline/practice module and prepares section-specific report data. It must not calculate RallyCross/Practice/Rally sport results, must not talk to LapWiz, and must not own UI. PDF rendering/templates will be added later inside `reporting/`.

The hidden RC15 reporting module is packaged for offline availability but is intentionally not loaded by `index.html` and has no button/screen yet.
