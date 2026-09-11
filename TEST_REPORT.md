# LEGION RX 4.2.0 CLEAN FULL APP RC36 · BEST LAP STRIP + HERO CLEANUP — TEST REPORT

## Scope

UI-only cleanup over RC35. Runtime changes are limited to `ui/discipline-ui.js` and `ui/shell/discipline-pults.css`, plus release metadata. RallyCross / Free Practice sport logic, LapWiz, platform audio/storage and reporting are not modified.

## RC36 verification

- Obsolete `rxnLeaderHero` renderer and portrait CSS removed instead of hidden by an override.
- No giant leader-photo block can be appended below RallyCross roster rows on phone/portrait/compressed layouts.
- Header strip is one authoritative `rxnBestLapStrip`.
- Trophy SVG and `ЛИДЕР · ЛУЧШИЙ КРУГ` wording removed.
- Strip content is `BEST LAP` + live `rxnBestLapTime`.
- Existing RallyCross dynamic UI tick refreshes that time from the same `rxnBestLapLeader()` data.
- Portrait/tablet still hide the right-column strip according to the existing cockpit layout contract.

## Regression

Run all existing architecture, iOS safety, pilot UI, RC29 run-off, RC30 start-order/announcer, RC31 columns, RC32 skip flow, RC33/34/35 pilot-stat checks, JS syntax and offline-manifest checks. Physical iPhone / Android / LapWiz acceptance remains user-side.
