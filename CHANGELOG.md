# LEGION RX · RC68

## Update download diagnostics
- Fixed RC67 service-worker validation that rejected the valid Schedule portal CSS at asset 81/113.
- Update installer now reports the exact failed asset, stage, progress position and validation/network reason.
- Failed candidate cache is still deleted atomically; the installed working version is never replaced by a partial package.
- No sport logic, LapWiz protocol, Classic RC engine, RallyCross engine, scheduler logic or simulator logic changed.
