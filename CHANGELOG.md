# RC64 — CLASSIC STATUS CONTROL FIX

- Rebuilt the Classic RC live scheduler status above the main timer into one compact line: current state, next event and countdown.
- Fixed floating-point countdown output such as `04:53.994000000000003`; schedule countdown is now whole-second `MM:SS` / `HH:MM:SS`.
- Fixed Classic RC side-column grid: status, race timer and controls now have explicit rows, preventing the status block from expanding over the cockpit.
- The compact status strip is a direct Schedule entry point.
- Audited Schedule overlay hit layers: scrim/drawer exist only while the drawer is open; no invisible full-screen layer remains over cockpit controls.
- RallyCross, LapWiz, EFRA rules, Classic RC runtime/engine and Competition Scheduler sport logic are unchanged from RC63.
