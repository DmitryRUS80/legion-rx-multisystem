# LEGION RX · RC44 · RX UI SKIN SYSTEM — IMPLEMENTATION SPEC

## Goal
A removable visual UI layer over proven RC40 Classic markup/actions. Classic remains rollback truth.

## Rules
- Do not edit Classic geometry CSS to create skins.
- No changes to sport rules, LapWiz, audio, storage, reporting.
- New skins live only in `ui/skins/rxui/`.
- Existing DOM layout/actions are reused.
- RallyCross pilot rows below red race strip keep Classic grid/height/order.
- Active state = complete surface fill/border, never side/bottom glow strips.
- Disabled state keeps geometry and is visibly inactive.
- One SVG icon vocabulary is used across all four skins.

## Skins
- classic — original RC40 appearance.
- steel — cool graphite / steel / pale-blue accents.
- light — clean white / graphite / blue.
- modern — black graphite / orange motorsport.
- heritage — warm olive / cream / racing red.

## Acceptance
- `classic` can always be restored.
- Deleting `ui/skins/rxui/` and the small selector hooks removes the new UI layer without sport changes.
- Skin CSS does not change `.rxnPilotRow` grid-template, heights or column order.
- Desktop/tablet/phone share the same existing responsive layout.
