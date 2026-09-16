# RC67 · Classic Schedule Portal Hit Fix

- Schedule moved to a dedicated fixed portal outside `#viewHost`, so cockpit/grid geometry cannot move or intercept it.
- Entire tail/drawer/scrim hit-testing isolated from cockpit layers.
- Schedule controls use one portal-level pointer/click dispatcher; real Chromium tests sample 9 points across close/resume/tab controls on desktop, landscape phone and portrait phone.
- No sport rules, LapWiz, RallyCross, Classic RC engine/runtime, Scheduler or simulator logic changed.

# CHANGELOG

## RC66 · Classic Schedule Overlay Fix
- Fixed the schedule tail becoming a normal cockpit grid child because RC65 touch CSS overrode `position: fixed` with `position: relative`.
- Schedule tail/drawer/scrim are now isolated fixed overlays and cannot change cockpit/pilot geometry.
- Replaced global capture delegation with direct per-render action bindings for Schedule controls.
- Added explicit button types and stable touch/click hit areas.
- No EFRA scoring, Scheduler rules, Classic runtime, RallyCross, LapWiz, or protected foundation changes.
