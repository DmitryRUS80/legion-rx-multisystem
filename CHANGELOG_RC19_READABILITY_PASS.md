# RC19 READABILITY PASS

Base: **RC18 GLOBAL THEMES**.

## Changed
- Active-event `ПРОДОЛЖИТЬ` button now follows theme text color correctly in Light and Dark. The older hard-coded white declaration was removed from `ui/shell/current-base.css`; no new override was introduced.
- RallyCross one-line `ЛИДЕР · ЛУЧШИЙ КРУГ` label/name/time typography enlarged.
- Portrait tablet and phone red race-banner text enlarged within the existing strip height.
- Main timer support captions enlarged: class, phase/subline, and ring `КРУГОВ ЛИДЕРА`.

## Not changed
- `platform/`
- all `modes/` including RallyCross rules/runtime/qualification/finals
- `reporting/`
- pilot-row geometry
- race-banner data logic
- BEST ownership logic
- LapWiz / timing / storage / audio
