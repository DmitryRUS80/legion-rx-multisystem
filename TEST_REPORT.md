# LEGION RX — RC62 TEST REPORT

**Candidate:** `4.2.0 CLEAN FULL APP RC62 · CLASSIC RC EFRA + SCHEDULER`  
**Base:** RC61 RUNTIME ISOLATION + COCKPIT INFO

## Current release gates

PASS:
- Classic RC EFRA rules: qualifying count table, Round-by-Round 0/2/3/4..., equal-time points, DNF with recorded result, official counted-round tie-breaks.
- EFRA finals: 3 legs / BEST 2, equal-time points, non-runner car-number order, official final tie-break.
- Grouping: max 10, balanced heat sizes, fast drivers in high heat, exact 13-heat Off-Road round sequences R1–R5, A/B/C final generation and optional lowest-final rebalance.
- Scheduler: non-mutating start preflight, minimum start gap, early start, break closing, actual-start commit, overrun pushes pending future, early finish does not pull future automatically.
- Architecture: Classic RC has no RallyCross rules/state; RallyCross has no Classic RC references; Scheduler is sport-neutral; Classic runtime has no DOM; own Classic storage namespace.
- Input safety: active Classic heat keeps timing ownership even if another application page is visible.
- PWA cohesion: RC62 VERSION/manifest/SW synchronized, all manifest files exist, SW validators accept every local offline asset.
- JS syntax: all project `.js` files parse.
- CSS parser: all project `.css` files parse without syntax errors.
- HTML local script/style resources resolve.
- Protected RC61 runtime/foundation bytes are unchanged.
- Current RallyCross JS regression suites: run-offs, start order, skip/state, session control, Race Simulator, RC61 Final A third-result rule remain PASS.
- Schedule visual contract: fixed overlay, no cockpit resize, desktop/phone-landscape/phone-portrait responsive geometry, and theme-token paint for CLASSIC / COBALT / STEEL / LIGHT / MODERN / HERITAGE PASS. Exact project CSS was rendered in a headless static fixture for desktop plus Cobalt phone landscape/portrait inspection.

## Verification fixes made before packaging

1. Fixed Qualifying DNF handling: a DNF with valid laps/time remains classified; only DNS/DSQ/no-time receives last-place treatment.
2. Fixed active input ownership so opening Settings/Pilots during a Classic heat cannot route LapWiz passes into RallyCross.
3. Fixed two Service Worker validator defects that could reject a valid RC62 candidate package.
4. Changed Scheduler start bookkeeping: countdown is only a preflight; `actualStartEpoch` is committed at the real race start, so the minimum-gap calculation uses actual starts rather than the beginning of the 10-second procedure.
5. A delayed/overrunning heat now pushes only the still-pending schedule tail. Finishing early does not silently pull later heats forward.
6. Seeding/controlled/final practice first timing-line crossing is a baseline/start crossing, not a fake first lap.
7. Raised the smallest Schedule overlay labels on phone landscape/portrait to avoid micro-text.

## Historical frozen tests

Some old RC-specific tests intentionally hard-code obsolete release numbers, hashes or superseded UI wording (for example RC36/45/46/49/50/59). They are retained as history and are **not** RC62 release gates. A failure that only asserts an old cache namespace/hash/text is not treated as a new regression. Current behavior is covered by the RC61/RC62 gates above.

## Physical acceptance still required

The full app URL cannot be opened by the container Chromium because local-site navigation is blocked by the environment policy. I therefore rendered the exact project CSS against a representative cockpit/Schedule DOM fixture and verified the responsive geometry and all six skin token palettes; Cobalt landscape and portrait screenshots were also inspected. Final acceptance still requires the deployed PWA/device and a real LapWiz field run before GOLD.
