from pathlib import Path
import re,sys
R=Path(__file__).resolve().parents[1]
ver=(R/'VERSION.txt').read_text(encoding='utf-8')
om=(R/'offline-manifest.js').read_text(encoding='utf-8')
sw=(R/'sw.js').read_text(encoding='utf-8')
idx=(R/'index.html').read_text(encoding='utf-8')
checks={
 'version_rc57':'RC57 · SESSION CONTROL' in ver,
 'manifest_rc57':'4.2.0-clean-full-rc57-session-control' in om and 'RC57 · SESSION CONTROL' in om,
 'sw_build_rc57':"LEGION_SW_BUILD='rc57-session-control'" in sw and 'offline-manifest.js?build=rc57-session-control' in sw,
 'live_edit_loaded':'platform/pilot-live-edit.js' in idx and "'./platform/pilot-live-edit.js'" in om,
 'session_mode_fresh':all(x in sw for x in ["'./modes/rallycross/index.js'","'./modes/rallycross/runtime.js'","'./ui/discipline-ui.js'","'./ui/shell/views.js'","'./ui/shell/actions.js'","'./ui/shell/app.css'","'./platform/pilot-live-edit.js'"]),
 'sw_validates_new_functions':all(x in sw for x in ['eventSessionSettings','applyCurrentSessionSettings','restartCurrentSession','updateActiveRacePilotIdentity','raceSessionSettingsModal','racePilotEditModal']),
}
assets=re.findall(r"['\"](\./[^'\"]+)['\"]",om)
missing=[a for a in assets if a!='./' and not (R/a[2:]).exists()]
checks['offline_manifest_complete']=not missing
for k,v in checks.items():print(f'{k}: {"PASS" if v else "FAIL"}')
if missing:print('missing:',missing)
sys.exit(0 if all(checks.values()) else 2)
