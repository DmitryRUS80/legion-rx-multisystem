# LEGION RX 4.1.1 — OFFLINE HOTFIX

Base: `4.1.0 UI NEXT TEST 06`.

Changed only the offline/PWA contour:
- one shared `offline-config.js` is now the single source for app version, cache name and offline asset list;
- `index.html` and `sw.js` use the same cache name;
- Service Worker installation is all-or-nothing: an incomplete cache is deleted and installation fails;
- navigation fallback reads only from the current version cache, never from an arbitrary old `legion-rx-*` cache;
- old caches are deleted only after the current cache is verified complete;
- `offline-config.js` itself is cached.

Not changed:
- RallyCross rules and scoring;
- LapWiz BLE protocol and packets;
- Free Practice / Track Day logic;
- timing semantics;
- pilot/result storage schema;
- cockpit layout and controls.
