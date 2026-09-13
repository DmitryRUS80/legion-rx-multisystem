# LEGION RX 4.2.0 CLEAN FULL APP RC41 · APEX ORANGE SKIN — TEST REPORT

## Scope

Opt-in UI skin only. Classic remains the default. New runtime skin file: `ui/skins/apex-orange.css`. Minimal bridge changes are limited to `index.html`, `ui/shell/discipline-shared.js`, `ui/shell/views.js`, and `ui/shell/actions.js`. Protected sport/platform modules are unchanged.

## RC41 verification

- Actual app renderer smoke-captured all main horizontal and vertical screens with Apex Orange enabled; no browser page errors were reported.
- Settings → Screen exposes `Classic` and `Apex Orange`. Skin switch persists immediately and does not call render, preserving unsaved Settings inputs.
- Classic authoritative CSS layers are byte-identical to RC40.
- Apex Orange selectors are opt-in scoped under `html[data-skin="apex-orange"]`.
- RallyCross red race banner and roster selectors are not overridden by the skin.
- Offline package includes the new skin file and uses a new RC41 candidate cache namespace.
- JavaScript syntax checks pass for modified runtime files.

## Regression

Architecture / clean foundation, iOS start safety, pilot cards, RC26-28 UI/storage, RC29 run-offs, RC30 start order, RC31 column grid, RC32 skip flow, RC33-38 pilot/stat/avatar tests and JS sport tests were run. Physical PWA/device acceptance remains required.
