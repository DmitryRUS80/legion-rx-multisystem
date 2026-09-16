# CHANGELOG

## RC66 · Classic Schedule Overlay Fix
- Fixed the schedule tail becoming a normal cockpit grid child because RC65 touch CSS overrode `position: fixed` with `position: relative`.
- Schedule tail/drawer/scrim are now isolated fixed overlays and cannot change cockpit/pilot geometry.
- Replaced global capture delegation with direct per-render action bindings for Schedule controls.
- Added explicit button types and stable touch/click hit areas.
- No EFRA scoring, Scheduler rules, Classic runtime, RallyCross, LapWiz, or protected foundation changes.
