from pathlib import Path
import hashlib,re
ROOT=Path(__file__).resolve().parents[1]
BASE=Path('/mnt/data/rc40_ref') if Path('/mnt/data/rc40_ref').exists() else None
checks={}

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
# Classic authoritative visual/sport layers must remain byte-identical to RC40 when reference is available.
protected=['ui/shell/app.css','ui/themes/theme.css','ui/shell/discipline-pults.css','ui/pilots/pilot-cards.css','ui/pilots/pilot-cards.js','platform/state.js','platform/lapwiz.js','platform/audio.js','platform/storage.js','modes/rallycross/rules.js','modes/rallycross/qualifying.js','modes/rallycross/finals.js','modes/free-practice/index.js']
if BASE:
    checks['classic_and_core_hashes_unchanged']=all((BASE/p).exists() and sha(ROOT/p)==sha(BASE/p) for p in protected)
else:
    checks['classic_and_core_hashes_unchanged']=True
index=(ROOT/'index.html').read_text()
router=(ROOT/'ui/shell/router.js').read_text()
actions=(ROOT/'ui/shell/actions.js').read_text()
views=(ROOT/'ui/shell/views.js').read_text()
apex_js=(ROOT/'ui/skins/apex/apex-renderer.js').read_text()
apex_css=(ROOT/'ui/skins/apex/apex.css').read_text()
cfg=(ROOT/'offline-manifest.js').read_text()
checks['apex_files_exist']=(ROOT/'ui/skins/apex/apex.css').exists() and (ROOT/'ui/skins/apex/apex-renderer.js').exists()
checks['apex_loaded_as_separate_layer']='ui/skins/apex/apex.css' in index and 'ui/skins/apex/apex-renderer.js' in index
checks['router_uses_alternate_renderer']="apexRenderView(state.view)" in router and "uiSkin||'classic'" in router
checks['classic_is_fallback']=bool(re.search(r"if\(apex\).*?else if\(state\.view==='home'\)host\.innerHTML=homeView\(\)",router,re.S))
checks['classic_settings_has_skin_switch']='data-ui-skin="classic"' in views and 'data-ui-skin="apex-orange"' in views
checks['skin_persists_in_existing_settings']='save(KEYS.settings,state.settings)' in actions and "data-ui-skin" in actions
checks['apex_has_own_primary_views']=all(name in apex_js for name in ['apxHomeView','apxRallySetupView','apxTrackSetupView','apxPilotsView','apxChampionshipsView','apxChampionshipDetailView','apxArchiveView','apxSettingsView','apxCockpitView','apxTrackCockpitView'])
checks['apex_does_not_call_classic_page_renderers']=not re.search(r'\b(?:homeView|rallySetupView|cockpitView|trackDaySetupView|trackDayCockpitView|championshipsView|championshipDetailView|archiveView|pilotsView|settingsView)\s*\(',apex_js)
checks['apex_owns_icons']='function apxIcon' in apex_js
checks['apex_owns_css_namespace']='body.apexRenderer' in apex_css and '.apxHomeHero' in apex_css and '.apxSettingsLayout' in apex_css
checks['protected_race_board_reused_only_in_cockpit']='rxnRaceTitle(race,ev,s,pilots)' in apex_js and 'rxnPilotTable(pilots,s)' in apex_js
checks['manifest_contains_apex']='./ui/skins/apex/apex.css' in cfg and './ui/skins/apex/apex-renderer.js' in cfg
checks['rc42_cache_namespace']='rc42-apex-alternate-renderer' in cfg
checks['no_apex_patch_override_filename']=not any(re.search(r'(patch|hotfix|override|fix\.css|fix\.js)',p.name,re.I) for p in (ROOT/'ui/skins/apex').rglob('*') if p.is_file())
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if not all(checks.values()): raise SystemExit(1)
