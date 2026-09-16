# LEGION RX — NEXT CHAT HANDOFF · RC62

**Current source candidate:** `Legion_RX_4.2.0_CLEAN_FULL_APP_RC62_CLASSIC_RC_EFRA_SCHEDULER_FULL.zip`  
**Base:** RC61 RUNTIME ISOLATION + COCKPIT INFO

## First rule

Continue only from the RC62 FULL/source package. Read `PROJECT_MASTER.md`, `ARCHITECTURE.md`, `FUNCTION_MAP.md`, `SPORT_RULES.md`, `TEST_REPORT.md`, `VERSION.txt`, `CHANGELOG.md` and inspect the real authoritative files before editing. Never rebuild from memory or use UPLOAD_TO_GITHUB as the next source.

## Current architectural state

- RallyCross remains independent and uses its accepted RC61 Final A rule: BEST2 -> counted places -> discarded third -> exact tie RUN-OFF; no hidden time tie-break.
- Race Simulator remains pre-release/test-only and is detached from RallyCross runtime through neutral adapters.
- Classic RC is now an independent EFRA 2026 Round-by-Round module in `modes/classic-rc/efra-*` + `groups.js`, with its own storage/state and no RallyCross imports.
- `runtime/competition-scheduler.js` is sport-neutral. It handles timeline/pauses/min-start-gap/early-start/delay reflow only.
- `runtime/active-race-controller.js` routes neutral pass events to the actively running sport controller at the shell boundary.
- Classic RC reuses the shared cockpit/pilot-row visual primitives only.

## RC62 Classic RC implemented

- 1/10 Off-Road, 1/10 On-Road, 1/12 Track presets.
- Practice/seeding, 2/3 consecutive-lap seeding, balanced max-10 heat groups.
- Off-Road rotating heat sequence; On-Road ascending sequence.
- Round-by-Round Q: 0/2/3/4..., count table 1:void / 2:1 / 3:2 / 4:2 / 5:2 / 6:3 and official counted-round ties.
- A/B/C... finals, 3 legs, BEST 2, official points/tie-breaks, non-runner order and manual EFRA jump-start penalties.
- Schedule overlay: right overlay landscape/wide, bottom sheet portrait; cockpit never shifts. Start earlier / skip break / +5 min supported with min-start-gap protection.

## Verification status

See `TEST_REPORT.md`. Current RC62 gates pass, SW validates all local offline assets, JS/CSS parse, and protected RC61 files are byte-identical. Physical PWA/device visual acceptance and real LapWiz field acceptance remain mandatory before GOLD.
