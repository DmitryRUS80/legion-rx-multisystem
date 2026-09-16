RC67 PORTAL / HIT-AREA CHECK
- Chromium 1792x863: PASS
- Chromium 844x390: PASS
- Chromium 390x844: PASS
- Close button 9-point hit map: PASS
- Resume button 9-point hit map: PASS
- Schedule tabs multi-point clicks: PASS
- Cockpit geometry before/after drawer: unchanged

# TEST REPORT · RC66

RC66 targets only Classic RC Schedule UI reliability.

- Real Chromium DOM: tail fixed at right edge and cockpit/roster/side geometry unchanged when drawer opens.
- Real Chromium DOM actions: open/close, tabs, competition resume, break -1/+1/+5, skip break, skip heat — PASS.
- Protected foundation comparison against RC65: required sporting/platform files unchanged.
- RallyCross / Classic EFRA / Scheduler regression suites: PASS (see build verification).
