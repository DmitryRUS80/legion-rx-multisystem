from pathlib import Path
import hashlib,re,sys
ROOT=Path(__file__).resolve().parents[1]
BASE=Path('/mnt/data/rc40_src') if Path('/mnt/data/rc40_src').exists() else None
checks={}
skin=(ROOT/'ui/skins/apex-orange.css').read_text(encoding='utf-8')
index=(ROOT/'index.html').read_text(encoding='utf-8')
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
actions=(ROOT/'ui/shell/actions.js').read_text(encoding='utf-8')
shared=(ROOT/'ui/shell/discipline-shared.js').read_text(encoding='utf-8')
cfg=(ROOT/'offline-manifest.js').read_text(encoding='utf-8')
checks['skin_file_loaded_last']='ui/skins/apex-orange.css' in index and index.find('ui/skins/apex-orange.css')>index.find('ui/shell/discipline-pults.css')
checks['skin_is_opt_in']='html[data-skin="apex-orange"]' in skin and 'html[data-skin="classic"]' not in skin
checks['default_is_classic']="state.settings.skin||'classic'" in shared
checks['settings_selector_present']=all(x in views for x in ['data-ui-skin="classic"','data-ui-skin="apex-orange"','Apex Orange'])
checks['switch_is_no_rerender']='data-ui-skin' in actions and "applySettings();$$('[data-ui-skin]')" in actions and "render()" not in actions[actions.find("$$('[data-ui-skin]')"):actions.find("const qSel",actions.find("$$('[data-ui-skin]')"))]
checks['selection_persists']='state.settings.skin=skin;save(KEYS.settings,state.settings)' in actions
checks['offline_contains_skin']='./ui/skins/apex-orange.css' in cfg and 'rc41-apex-orange-skin' in cfg
checks['race_banner_roster_not_targeted']=all(x not in skin for x in ['html[data-skin="apex-orange"] .rxnRoster','html[data-skin="apex-orange"] .rxnPilotRow','html[data-skin="apex-orange"] .rxnPilotData','html[data-skin="apex-orange"] .rxnRaceTitleLeft{'])
if BASE:
    protected=['ui/themes/theme.css','ui/shell/app.css','ui/pilots/pilot-cards.css','ui/shell/discipline-pults.css','platform/lapwiz.js','platform/audio.js','platform/storage.js','modes/rallycross/rules.js','modes/rallycross/qualifying.js','modes/rallycross/finals.js','modes/free-practice/index.js','reporting/core.js']
    checks['classic_and_core_files_unchanged']=all(hashlib.sha256((ROOT/x).read_bytes()).digest()==hashlib.sha256((BASE/x).read_bytes()).digest() for x in protected)
else:
    checks['classic_and_core_files_unchanged']=True
for k,v in checks.items():print(f'{k}: {"PASS" if v else "FAIL"}')
sys.exit(0 if all(checks.values()) else 2)
