# Legion RX 4.0.31 TEST — Sketch Rebuild

## RallyCross cockpit
- Portrait UI rebuilt from the approved dark concept instead of scaling the desktop table.
- Removed decorative outer containers from header, participant section, control wrapper and race strip.
- Kept containers where they are functional: timer/progress card and six control buttons.
- Participant area is now a clean title + row list with thin separators.
- 1–4 pilots use comfortable rows; 5–6 only reduce vertical padding; 7+ use internal participant scrolling without reducing primary type size.
- Mobile pilot row keeps large name, flag, laps, BEST, AVG, gap and status.
- Logo is forced to one line on portrait.
- Footer remains: race flow / current heat / next heat / results, without duplicated LapWiz or announcer widgets.
- Landscape/tablet/desktop inherit the same practical hierarchy and scale up on large monitors.
- Dark and Light themes share the same geometry.

## Safety / unchanged
- RallyCross sports logic unchanged.
- LapWiz Core unchanged.
- Track Day / PIT unchanged.
- Audio unlock/offline logic carried forward unchanged from 4.0.30.
