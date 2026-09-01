# Legion RX 4.0.28 TEST — Readable Adaptive Cockpit

## RallyCross UI
- Readability-first typography: larger minimum sizes for pilot names, BEST, AVG, laps, gap, status and timer metrics.
- Removed permanent “нажмите для кругов” microcopy from pilot rows.
- Shortened table headers to BEST / AVG where long labels were unnecessary.
- Added adaptive density for 6–7 and 8+ pilots on phone portrait; main values remain readable, internal list scroll is only the fallback for genuinely large fields.
- Phone portrait keeps approved order: header → timer/ring → pilots → controls → race strip.
- Landscape/tablet/desktop keep participants left and timer/control right with fluid scaling.
- Large desktop typography maximums increased so FullHD/2K no longer looks like a tablet UI floating at tiny scale.

## Bottom race strip
- Removed duplicated LapWiz / announcer widgets from the bottom cockpit area.
- New strip shows race flow/status, current heat, next heat, and Results.
- LapWiz and announcer remain in the compact top status controls.

## Safety
- No intentional changes to RallyCross sports rules, LapWiz Core, Track Day, PIT or audio engine.
- Offline audio asset list remains unchanged; cache namespace bumped to 4.0.28.
