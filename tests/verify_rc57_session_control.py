from pathlib import Path
import re,sys
R=Path(__file__).resolve().parents[1]
ui=(R/'ui/discipline-ui.js').read_text(encoding='utf-8')
views=(R/'ui/shell/views.js').read_text(encoding='utf-8')
runtime=(R/'modes/rallycross/runtime.js').read_text(encoding='utf-8')
mode=(R/'modes/rallycross/index.js').read_text(encoding='utf-8')
pilot=(R/'platform/pilot-live-edit.js').read_text(encoding='utf-8')
css=(R/'ui/shell/app.css').read_text(encoding='utf-8')
idx=(R/'index.html').read_text(encoding='utf-8')
checks={
 'main_controls_replaced': 'data-action="restart-session"' in ui and 'data-action="session-settings"' in ui and "data-action=\"add-minute\"" not in re.search(r'function rxnControlGrid\(.*?\n\}',ui,re.S).group(0) and 'manual-lap-modal' not in re.search(r'function rxnControlGrid\(.*?\n\}',ui,re.S).group(0),
 'session_overlay_exists': 'function raceSessionSettingsModal' in views and 'sessionSettingsApply' in views,
 'single_surface_big_controls': 'RC57 · IN-COCKPIT SESSION / PILOT EDITORS' in css and 'font:800 22px/1 var(--rxn-font)' in css,
 'event_local_settings': 'function eventSessionSettings' in mode and 'event.sessionSettings' in mode,
 'restart_runtime': 'function restartCurrentSession' in runtime and 'restartCount' in runtime,
 'live_pilot_edit_isolated': 'function updateActiveRacePilotIdentity' in pilot and 'platform/pilot-live-edit.js' in idx,
 'pilot_edit_from_stats': 'data-race-pilot-edit' in views and 'function racePilotEditModal' in views,
}
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
sys.exit(0 if all(checks.values()) else 2)
