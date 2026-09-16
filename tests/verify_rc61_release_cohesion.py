from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[1]
version=(ROOT/'VERSION.txt').read_text(encoding='utf-8')
manifest=(ROOT/'offline-manifest.js').read_text(encoding='utf-8')
sw=(ROOT/'sw.js').read_text(encoding='utf-8')
index=(ROOT/'index.html').read_text(encoding='utf-8')
checks={
 'version_rc61':'RC61' in version,
 'manifest_rc61':'4.2.0-clean-full-rc61-runtime-isolation-cockpit-info' in manifest,
 'sw_rc61':"LEGION_SW_BUILD='rc61-runtime-isolation-cockpit-info'" in sw and 'offline-manifest.js?build=rc61-runtime-isolation-cockpit-info' in sw,
 'adapter_assets':all(x in manifest for x in ['./runtime/race-event-bus.js','./runtime/race-clock-adapter.js','./runtime/race-test-source-adapter.js']),
 'adapter_scripts':all(x in index for x in ['runtime/race-event-bus.js','runtime/race-clock-adapter.js','runtime/race-test-source-adapter.js']),
 'fresh_runtime_files':all(x in sw for x in ["'./app.js'","'./boot.js'","'./modes/rallycross/finals.js'","'./modes/rallycross/runtime.js'","'./runtime/race-event-bus.js'","'./runtime/race-clock-adapter.js'","'./runtime/race-test-source-adapter.js'","'./simulation/race-simulator.js'","'./ui/discipline-ui.js'","'./ui/shell/discipline-pults.css'"]),
 'runtime_stale_guard':"s.includes('raceSimulator')" in sw and 'stale/coupled RC61 race runtime' in sw,
 'finals_stale_guard':"stale hidden-time Final A tie-break" in sw,
 'ui_stale_guard':'stale RC61 cockpit info' in sw,
}
assets=re.findall(r"'?(\./[^'\"]+)'?",manifest)
missing=[a for a in assets if a!='./' and not (ROOT/a[2:]).exists()]
checks['manifest_files_exist']=not missing
for k,v in checks.items():print(f'{k}: {"PASS" if v else "FAIL"}')
if missing:print('missing',missing)
sys.exit(0 if all(checks.values()) else 2)
