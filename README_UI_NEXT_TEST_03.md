# Legion RX 4.1.0 — UI NEXT TEST 03

Test build focused on readable live timing rows and operator-controlled columns.

Default lap-time view uses tenths (`21.5`). Use the three precision buttons under the pult to switch between tenths, hundredths and thousandths while a heat is running. This changes only what is displayed.

On full-table layouts (tablet portrait/landscape and desktop), the buttons `GAP / ✓ / BEST / AVG / LAST / LAPS` toggle columns live. The enabled columns automatically divide the available space equally, so disabling a column does not leave a hole or push the remaining values to one side.

The prior TEST 02 `rx42` cockpit layer has been removed from this package. The current RallyCross visual boundary is the isolated UI NEXT `rxn*` markup/styles. The working race/BLE/audio/storage logic remains in the original core.
