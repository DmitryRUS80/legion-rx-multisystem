# RC17 — COCKPIT READABILITY

Base: **RC16 RACE BANNER**.

## Changed
- RallyCross race banner desktop height reduced from 78 px to 40 px; base/tablet/phone title rows compacted proportionally.
- Banner horizontal padding and internal spacing reduced; 30 px Oswald remains on large desktop so the text sits close to the top/bottom edges.
- `PILOTS x/y` denominator now comes from the actual current event pilot list instead of fixed capacity 6.
- Best-lap header is a single horizontal strip.
- Before the first valid BEST it shows no pilot name (`—`).
- After a valid BEST it shows the pilot owning the absolute best lap of the session, not simply the current first row.
- Pilot names in RallyCross/Practice cockpit-related displays and shared pilot-name markup are visualized in UPPERCASE without modifying stored names.
- RallyCross cockpit row pilot-name size is reduced on desktop/tablet for the established card-scale hierarchy.

## Not changed
- `platform/`
- every file under `modes/`
- RallyCross rules, qualification, LCQ, finals and finish logic
- `reporting/`
- `app.js`, `app-bridge.js`, `index.html`
- audio, flags, icons

No patch/override file was added. The authoritative existing UI implementations were edited directly.
