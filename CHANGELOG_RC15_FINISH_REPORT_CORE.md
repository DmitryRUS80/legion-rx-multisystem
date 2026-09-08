# CHANGELOG RC15 FINISH REPORT CORE

Base: **4.2.0 CLEAN FULL APP RC14 OSWALD**

## RallyCross sport rule
Changed lap-limited race finish behavior:
- The first pilot who reaches `targetLaps` is finished normally.
- That pass opens the lap-race finish window.
- Every remaining active pilot is finished on their next valid pass.
- A lapped pilot does not need to complete the leader's full target-lap count.
- Time-limited race finish behavior is unchanged.

Authoritative sport decision:
- `modes/rallycross/rules.js`

Runtime execution:
- `modes/rallycross/runtime.js`

Self-test:
- `modes/rallycross/self-test.js`

## Reporting architecture
Added hidden, independent preparation module:
- `reporting/core.js`
- `reporting/sections/rallycross.js`
- `reporting/sections/practice.js`
- `reporting/sections/rally.js`
- `reporting/README.md`

It is not connected to `index.html`, has no UI, no button, and no PDF renderer yet.
It accepts a supplied official result snapshot and dispatches it by section. It does not calculate sport results.

## Explicitly unchanged
- `platform/`
- `modes/rallycross/qualifying.js`
- `modes/rallycross/finals.js`
- `modes/rallycross/index.js`
- `modes/free-practice/`
- `ui/`
- `app.js`
- LapWiz protocol
- Min Lap logic
- qualification points / Best3 / LCQ / A1-A3 scoring
