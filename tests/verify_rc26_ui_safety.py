from pathlib import Path
import re,sys,hashlib
ROOT=Path(__file__).resolve().parents[1]
checks={}
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
actions=(ROOT/'ui/shell/actions.js').read_text(encoding='utf-8')
shared=(ROOT/'ui/shell/discipline-shared.js').read_text(encoding='utf-8')
appcss=(ROOT/'ui/shell/app.css').read_text(encoding='utf-8')
pilot=(ROOT/'ui/pilots/pilot-cards.js').read_text(encoding='utf-8')
app=(ROOT/'app.js').read_text(encoding='utf-8')
checks['theme_applies_immediately']='darkToggle.addEventListener(\'change\'' in actions and 'applySettings()' in actions
checks['background_color_applies_immediately']='appBgColor' in views and "bgColor.addEventListener('input'" in actions and 'applyAppBackground()' in actions
checks['background_image_local_and_replaceable']=all(x in views for x in ['appBgFile','appBgUpload','appBgClear']) and 'resizeAppBackground(file)' in actions and 'backgroundImage' in shared
checks['legacy_page_stripes_removed']='background-size:100% 32px' not in appcss and 'linear-gradient(var(--v4-grid) 1px,transparent 1px)' not in appcss
checks['background_is_centered_cover']='background-size:cover' in appcss and 'background-position:center center' in appcss
checks['model_color_live_visual']='host.oninput=e=>' in pilot and "section.style.setProperty('--pilot-model-color',field.value)" in pilot
checks['model_color_live_persist']='pilotPersistEditorColor' in pilot and 'save(KEYS.pilots,state.pilotDb)' in pilot
checks['model_color_updates_active_race']='racePilot.uiColor=color' in pilot and 'persistRace()' in pilot
checks['ios_finish_uses_app_modal']="if(action==='complete-competition')return competitionFinishConfirmModal()" in actions and 'completeCompetition(true)' in views
checks['core_completion_has_confirmed_path']='function completeCompetition(confirmed=false)' in app and "if(!confirmed&&!confirm(" in app
# Sport/LapWiz/audio/reporting remain protected. Storage evolves in RC28 to prevent iOS quota failures.
expected={
'platform/audio.js':'1ffb1838fda888f6c9e213866f6fd20f3b7b6e402ba72fe56740fc3c5cd9dcb7','platform/lapwiz.js':'d0f9af187e90114edf671827c9365e7d28130809ba1926cfa11efd30f8c3c644','platform/offline-core.js':'ac44e40b877c0faa58136710582fe572037a069fea67536957d95758a37b628d','platform/pilots.js':'9447a63d5fef07aed6c28407844372ab9d7d0f9afdba5c48ed0d63d3048c7ca9','platform/state.js':'e3ec736cc481d1b3f9b3f67d03704670be90ac5cf994df81ac2921e6309f6753','platform/timing.js':'2f906ea408b3dca79a7dc74b19eed99c0a88d2559e24146a52a02b350ea8a9c8','platform/updater.js':'8aef1c627d718cf1e5b1b5ebd8e85c9979937a61b32ce74ffcb7931d940236ec','platform/utils.js':'488d5cc91485d8511fa46b7c043cb21d61048ee3d9caf0a3e03724493432fecd',
'modes/free-practice/index.js':'aa43d3a87f0e9286635dbb5bbcfc7647dac310ea30d24af80bb9fe9cdd20845a',
'reporting/core.js':'11df7d024958c4b983dcff942328193a5f7feffe280b8307f4bf6c75c0e75098'}
changed=[]
for rel,want in expected.items():
 p=ROOT/rel; got=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else 'MISSING'
 if got!=want: changed.append((rel,got,want))
checks['unrelated_platform_reporting_unchanged']=not changed
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if changed: print('protected changes:',changed)
sys.exit(0 if all(checks.values()) else 2)
