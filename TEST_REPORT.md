# LEGION RX — RC63 TEST REPORT

**Candidate:** `4.2.0 CLEAN FULL APP RC63 · CLASSIC DIRECTOR CONTROL`  
**Base:** RC62 CLASSIC RC EFRA + SCHEDULER

## PASS — current release gates

- Protected clean foundation / architecture gates.
- Classic RC architecture isolation: no RallyCross state/rules inside Classic RC; Scheduler remains sport-neutral.
- EFRA qualifying/finals/grouping and full 23-pilot end-to-end flow.
- RallyCross current regressions: run-offs 27/27, start order 12/12, skip/state 11/11, session control, Race Simulator, RC61 Final A third-result rule.
- RC63 Director control contract: live next-event countdown, early finish, current-heat settings, skip heat, break −1/+1/+5, skip break, competition hold/resume.
- RC63 Scheduler behavior: shortening a break reflows only the future; heat duration changes reflow the future while preserving start-gap span.
- RC63 SIM clock: Classic schedule time and race elapsed time accelerate together; speed can be reconfigured ×1/×2/×4/×8.
- Neutral simulator DNS/DNF/complete routing to Classic runtime.
- Service Worker local package validators.
- JavaScript syntax for all project JS files.
- CSS parse for all project CSS files.

## Visual contract checked structurally

- Schedule remains fixed overlay; cockpit does not resize.
- Landscape/right drawer and portrait/bottom sheet rules remain present.
- Portrait sheet clears the bottom navigation.
- Schedule/Director paint is token-driven for every app skin and adds no hard-coded neon theme.
- Text sizes were kept compact but Schedule state/action text is not reduced to micro labels.

Final acceptance still requires the deployed PWA/device and a real LapWiz field run before GOLD.
