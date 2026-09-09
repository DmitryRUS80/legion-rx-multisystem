# LEGION RX 4.2.0 CLEAN FULL APP RC21 · IOS START SAFETY

Direct base: **RC20 CLEAN FOUNDATION**.

This release fixes a critical field regression found on iPhone after the clean foundation migration.

- RallyCross START is independent of Safari audio permission/cache state.
- Track Day start is independent of Safari audio permission/cache state.
- LapWiz connection on supported Web Bluetooth browsers is independent of announcer audio and keeps its direct user gesture.
- Safari/iPhone audio remains an explicit **Включить звук** action. If local audio still needs cache hydration, the first tap prepares it and the second tap unlocks playback; the race itself never waits for this.
- Locked audio is non-blocking: background announcement attempts cannot place an audio modal over a running race.
- All sport modules remain byte-identical to RC20.
- RC20 clean CSS/UI architecture and staged atomic PWA update mechanism are preserved.

**RC21 is the corrective candidate that should replace RC20 on the track.** Physical iPhone/iPad and real LapWiz acceptance still remain mandatory.
