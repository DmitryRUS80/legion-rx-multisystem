# LEGION RX · RC45 COCKPIT SKIN SPEC

TASK: refine STEEL and LIGHT cockpit only, using RC44 removable skin architecture.

DO NOT TOUCH:
- Classic skin visual sources.
- `ui/shell/discipline-pults.css` cockpit geometry.
- `ui/discipline-ui.js` markup/actions.
- Pilot-row grid/height/order.
- modes / platform / reporting / storage / audio / LapWiz.
- MODERN / HERITAGE token files.

STEEL/LIGHT ACCEPTANCE:
- Existing layout stays where it is.
- Toolbar icons are one consistent SVG family and optically balanced.
- Connected/on action is indicated by the entire control surface.
- No colored status dot, right stripe, bottom stripe or inset bottom bar.
- Enabled controls are clearly readable; disabled controls are intentionally quiet but legible.
- START is the primary available action; FINISH / +1 MIN / MANUAL LAP / STOP light only when enabled by existing logic.
- Timer, ring, BEST LAP and controls share one material language.
- Pilot rows may change color/surface only; their geometry is locked.
- Phone/portrait uses the same visual language and existing Classic responsive composition.
