from pathlib import Path
import re,sys,hashlib
ROOT=Path(__file__).resolve().parents[1]
version=(ROOT/'VERSION.txt').read_text(encoding='utf-8')
manifest=(ROOT/'offline-manifest.js').read_text(encoding='utf-8')
sw=(ROOT/'sw.js').read_text(encoding='utf-8')
index=(ROOT/'index.html').read_text(encoding='utf-8')
controller=(ROOT/'runtime/active-race-controller.js').read_text(encoding='utf-8')
rules=(ROOT/'modes/classic-rc/efra-rules.js').read_text(encoding='utf-8')
checks={
 'version_rc62':'RC62' in version and 'CLASSIC RC EFRA + SCHEDULER' in version,
 'manifest_rc62':'4.2.0-clean-full-rc62-classic-rc-efra-scheduler' in manifest,
 'sw_rc62':"LEGION_SW_BUILD='rc62-classic-rc-efra-scheduler'" in sw and 'offline-manifest.js?build=rc62-classic-rc-efra-scheduler' in sw,
 'classic_assets_in_manifest':all(x in manifest for x in ['./runtime/competition-scheduler.js','./runtime/active-race-controller.js','./modes/classic-rc/efra-rules.js','./modes/classic-rc/groups.js','./modes/classic-rc/efra-engine.js','./modes/classic-rc/efra-runtime.js','./ui/classic-rc/classic-rc-ui.js','./ui/classic-rc/classic-rc.css']),
 'classic_scripts_in_index':all(x in index for x in ['runtime/competition-scheduler.js','runtime/active-race-controller.js','modes/classic-rc/efra-rules.js','modes/classic-rc/groups.js','modes/classic-rc/efra-engine.js','modes/classic-rc/efra-runtime.js','ui/classic-rc/classic-rc-ui.js']),
 'sw_validator_condition_not_comma_operator':"if(url==='./ui/classic-rc/classic-rc-ui.js','./ui/classic-rc/classic-rc.css','./ui/shell/views.js')" not in sw,
 'sw_views_validator_scoped':"if(url==='./ui/shell/views.js')" in sw,
 'active_input_not_tied_only_to_view':"activePhase(ClassicRCRuntime.session?.())" in controller and "return state.view==='classicCockpit'" in controller,
 'qualifying_dnf_recorded_run_kept':"!['DNS','DSQ'].includes" in rules,
 'scheduler_preflight_before_countdown':'canStartScheduleHeat(ev.key,anticipated)' in (ROOT/'modes/classic-rc/efra-runtime.js').read_text(encoding='utf-8'),
 'schedule_committed_at_actual_start':'startScheduleHeat(ev.key,Date.now())' in (ROOT/'modes/classic-rc/efra-runtime.js').read_text(encoding='utf-8'),
 'practice_first_crossing_is_baseline':"['seeding','controlled','finalPractice','qualifying'].includes(ev.stage)" in (ROOT/'modes/classic-rc/efra-runtime.js').read_text(encoding='utf-8'),
}
assets=re.findall(r"'([^']+)'", re.search(r'const assets=\[(.*?)\];',manifest,re.S).group(1))
missing=[a for a in assets if a!='./' and a.startswith('./') and not (ROOT/a[2:]).exists()]
checks['manifest_files_exist']=not missing
# RC62 must leave protected RC61 runtime/foundation bytes untouched.
BASE=ROOT.parent/'rc61_full_compare'
protected=['app.js','platform/lapwiz.js','platform/storage.js','platform/state.js','platform/timing.js','platform/audio.js','modes/rallycross/rules.js','modes/rallycross/qualifying.js','modes/rallycross/finals.js','modes/rallycross/runtime.js','modes/free-practice/index.js','modes/rally-sprint/index.js','modes/classic-rc/index.js','runtime/race-event-bus.js','runtime/race-clock-adapter.js','runtime/race-test-source-adapter.js','simulation/race-simulator.js','ui/discipline-ui.js','ui/shell/discipline-pults.css']
changed=[]
for rel in protected:
 a=ROOT/rel;b=BASE/rel
 if not a.exists() or not b.exists() or hashlib.sha256(a.read_bytes()).digest()!=hashlib.sha256(b.read_bytes()).digest(): changed.append(rel)
checks['protected_rc61_bytes_unchanged']=not changed
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if missing: print('missing:',missing)
if changed: print('protected changed:',changed)
sys.exit(0 if all(checks.values()) else 2)
