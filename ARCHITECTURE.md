# LEGION RX — CURRENT CLEAN ARCHITECTURE · RC65

RC65 is a UI input-binding repair only.

Protected separation remains:
- RallyCross sport engine is independent.
- Classic RC EFRA sport engine/runtime is independent.
- Competition Scheduler is neutral and unchanged.
- LapWiz/event source layer is unchanged.
- Race Simulator remains a removable test source.
- Shared cockpit remains presentation-only.

RC65 changes only `ui/classic-rc/classic-rc-ui.js`, `ui/classic-rc/classic-rc.css`, release metadata/tests and PWA build identity.
