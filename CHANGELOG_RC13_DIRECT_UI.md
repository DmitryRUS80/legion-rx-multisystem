# RC13 DIRECT UI

UI-only correction based on RC12.

- Removed the historical RC9/RC10/RC12 cockpit override blocks from the active cockpit stylesheet.
- Removed cockpit overrides from Variant 4 theme; cockpit styling now has one authoritative CSS owner.
- Leader / best-lap strip enlarged to match the approved sketch on desktop.
- One shared side-column definition is used by header icon strip, title/leader strip, timer and pult in every landscape breakpoint.
- Therefore the upper icon row is exactly aligned to the pult width on desktop, landscape tablet and landscape phone.
- Small GAP/BEST/AVG/LAST/LAPS + precision controls are compact and anchored at the bottom of the pult.
- Pilot-row styles and geometry preserved.
- platform/ and modes/ untouched.
