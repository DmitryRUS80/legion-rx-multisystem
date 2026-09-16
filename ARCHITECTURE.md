# LEGION RX — CURRENT CLEAN ARCHITECTURE · RC64

RC64 is a presentation-layer repair over RC63. No sport/core boundary is changed.

`Classic RC EFRA rules/runtime` and `Competition Scheduler` stay independent. `RallyCross` and `LapWiz` are untouched. The cockpit status component reads neutral scheduler state through the existing Classic RC UI adapter only.

The Schedule drawer is still a fixed overlay outside cockpit geometry. Its scrim is rendered conditionally only when the drawer is open. The compact status strip above the Classic RC timer occupies an explicit fixed-height row and can open the drawer directly.
