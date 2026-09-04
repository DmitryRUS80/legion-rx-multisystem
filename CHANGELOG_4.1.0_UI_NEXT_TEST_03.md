# Legion RX 4.1.0 UI NEXT TEST 03

## Pilot timing row
- Removed `00:` prefixes from ordinary lap times.
- Default timing precision is tenths: `21.5`.
- Over one minute the display becomes `1:25.5`.
- GAP uses the same compact formatter: `+5.1`, `+1L`, `+2L`.
- Precision can be changed live to `0.1 / 0.01 / 0.001` without changing race data.

## Live column controls
- Added `GAP / ✓ / BEST / AVG / LAST / LAPS` switches below the race controls on tablet landscape, tablet portrait and desktop.
- When columns are disabled, the remaining timing columns share all remaining row width evenly.
- Column visibility and precision are presentation settings stored separately from race/session state.

## Layout
- Full-table rows use one continuous grid from position and ID through name, flag and active metrics.
- Flag remains immediately after the pilot name block.
- Desktop row scale remains targeted at roughly 8–10 visible pilot rows.
- Tablet portrait keeps the full pilot-data table and live switches under the control panel.

## Cleanup
- Removed the obsolete `rx42` TEST 02 cockpit stylesheet and embedded TEST 02 cockpit implementation from `index.html`.
- RallyCross UI NEXT is now driven only by the isolated `rxn*` cockpit in `ui-next.js` + `ui-next.css`.
- Race, BLE, audio, storage and sports logic were not rewritten.
