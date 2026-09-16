# LEGION RX — CURRENT SPORT RULES · RC62

Sport modules are independent. **RallyCross rules never apply to Classic RC and EFRA rules never apply to RallyCross.** Shared cockpit/LapWiz infrastructure does not own sport scoring.

## 1. RallyCross · current LEGION RX rules

### Qualification
- Existing LEGION RX qualification scoring / BEST 3 / LCQ chain is preserved from the accepted RallyCross ruleset.
- FIN / DNF / DNS / DSQ are preserved.
- Exact qualification equality after the configured sporting countback is resolved by the existing RallyCross run-off flow; a run-off orders the tied places only and adds no qualification score.

### Final A
- A1 + A2 + A3; **BEST 2** count.
- Equal BEST-2 total is resolved in this order: best counted finish -> second counted finish -> discarded third result.
- If all three sporting results are still exactly equal, only the tied pilots run a **RUN-OFF** for the disputed final places.
- Race time, lap time and elapsed time are **not hidden RallyCross tie-break criteria**.
- A RUN-OFF is not A4 and adds no Final A score; it only fixes the order of the tied final places.

### Lap-limited finish
- When the leader completes the configured target laps, the finish window opens.
- Every other active pilot finishes on the next valid timing-line pass, including lapped pilots; they do not continue until their own target-lap count.

## 2. Classic RC · EFRA 2026 Round-by-Round

Authoritative rule source used for RC62: **EFRA Handbook 2026, Appendix 3 — Electric Cars**, rules 9–10.  
Source: https://www.efra.ws/wp-content/uploads/2026/03/EFRA%20Handbook%202026%20Appendix%203.pdf

### Categories / race duration
- 1/10 Off-Road: 5 min + last lap; standard last-lap window up to 40 s and may be extended if needed.
- 1/10 On-Road: 5 min + last lap; standard last-lap window up to 40 s and may be extended if needed.
- 1/12 Track: 8 min + last lap, max 40 s.
- Minimum between **starts**: 7 min for 1/10, 10 min for 1/12.

### Practice / seeding / groups
- Organised practice is divided into heats.
- Seeding uses the best 2 or 3 consecutive laps from specified practice rounds.
- Maximum 10 drivers per qualifying heat; heat sizes are kept as equal as possible.
- Reseeded groups place the faster drivers in the faster/high-number heats.
- Off-Road qualifying heat order follows the EFRA rotating sequence; On-Road stays ascending.
- Qualifying uses staggered starts. The first timing-line pass establishes the individual start; only subsequent full laps are timed as laps.

### Round-by-Round qualifying
- Completed rounds -> rounds counted: `1=VOID, 2=1, 3=2, 4=2, 5=2, 6=3`.
- Fewer than two completed qualifying rounds means the EFRA qualifying event is not valid.
- Per round: fastest overall across all heats = **0**, second = **2**, third = **3**, fourth = **4**, etc.
- Equal laps/time receive equal points; the next non-tied driver receives the points corresponding to the real position.
- No recorded time / disqualified time receives last-place points for that round.
- Overall qualifying: lowest total from the counted rounds wins.
- Tie-break: best counted finishing position -> laps/time of that best counted round -> laps/time of the second counted round. Only counted rounds are used.
- No extra hidden criterion is invented if all official criteria are still exactly equal.

### Finals
- Qualification forms Final A (1–10), B (11–20), C (21–30), etc.
- If the lowest final has fewer than 4 drivers, Race Director may keep it or redistribute drivers as evenly as possible with the next final while preserving qualifying order.
- All finals run **3 legs**, slow final to fast final; **BEST 2 of 3** count.
- Final leg points: P1=1, P2=2 ... P10=10.
- Equal race time receives equal points; the next non-tied driver receives the real next-position score.
- Non-runners receive the remaining points in car-number order.
- Final tie-break: best counted finishing position -> laps/time of that best finish -> laps/time of the second counted finish.
- Finals use a common grid start. After the 10-second call the start signal has a random 1–5 s delay.
- Jump start: +10 s; crossing by about 1 m: −1 lap. Jump start alone does not force a restart.

## 3. Competition Scheduler

The Scheduler is **not a sport rule module**. It only executes the timeline supplied by a sport mode.
- Maintains planned and actual heat times, breaks and the day timeline.
- Enforces the mode-provided minimum start gap.
- Director may start the next heat earlier once the minimum gap is legal; the pending future timeline is recalculated.
- A real overrun pushes only the still-pending future timeline. An early finish does not pull the day forward automatically; the director may explicitly do so.
- Breaks can be skipped or extended without changing scoring.
