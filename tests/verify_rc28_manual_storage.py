from pathlib import Path
import re,sys,hashlib
ROOT=Path(__file__).resolve().parents[1]
checks={}
pilot=(ROOT/'ui/pilots/pilot-cards.js').read_text(encoding='utf-8')
css=(ROOT/'ui/pilots/pilot-cards.css').read_text(encoding='utf-8')
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
discipline=(ROOT/'ui/discipline-ui.js').read_text(encoding='utf-8')
appcss=(ROOT/'ui/shell/app.css').read_text(encoding='utf-8')
storage=(ROOT/'platform/storage.js').read_text(encoding='utf-8')
app=(ROOT/'app.js').read_text(encoding='utf-8')
checks['shared_manual_pilot_component']='function pilotActionTileMarkup(' in pilot and 'pilotActionId' in pilot and 'pilotActionFlagMarkup' in pilot
checks['rallycross_manual_uses_shared_component']=views.count('pilotActionTileMarkup(p,{laps:l.laps')>=2
checks['practice_manual_uses_shared_component']='pilotActionTileMarkup(p,{laps:l.laps||0' in discipline
race_manual=re.search(r'function manualLapModal\(\).*?function makeDraftResult',views,re.S); track_manual=re.search(r'function rxnTrackManualLapModal\(\).*?/\* ===== /UI NEXT Track Day ===== \*/',discipline,re.S)
checks['manual_initial_cards_removed']=bool(race_manual and track_manual and 'nameInitials(p.name)' not in race_manual.group(0) and 'nameInitials(p.name)' not in track_manual.group(0))
checks['manual_style_owned_by_pilot_component']='.pilotActionTile{' in css and '.pilotActionId{' in css and '.pilotActionFlag{' in css
checks['old_manual_component_css_removed']='.manualPilotGrid button{' not in appcss and '.manualPilotGrid button>span{' not in appcss
checks['archive_strips_duplicate_photos']='function compactRaceForStorage(' in storage and "key==='photo'" in storage and "startsWith('data:image/')" in storage
checks['trackday_strips_duplicate_photos']='function compactTrackDayForStorage(' in storage and 'KEYS.trackDays' in storage and 'KEYS.activeTrackDay' in storage
checks['quota_retry_and_legacy_compaction']='isQuotaError' in storage and 'compactLegacyStorage();' in storage and storage.count('localStorage.setItem(key,payload)')>=2
checks['finish_does_not_clear_race_on_archive_failure']='archiveCurrentRace();save(KEYS.race,null);' in app and 'catch(err){state.race.lifecycleStatus=prevLifecycle;state.race.completedAt=prevCompletedAt;' in app and app.find('archiveCurrentRace();save(KEYS.race,null);') < app.find('state.race=null;state.session=null;')
checks['archive_state_commits_after_persistent_save']='save(KEYS.archive,nextArchive);state.archive=nextArchive' in app
# Sport core and BLE stay byte-identical to RC27.
expected={
'platform/lapwiz.js':'d0f9af187e90114edf671827c9365e7d28130809ba1926cfa11efd30f8c3c644',
'platform/audio.js':'1ffb1838fda888f6c9e213866f6fd20f3b7b6e402ba72fe56740fc3c5cd9dcb7',
'modes/free-practice/index.js':'aa43d3a87f0e9286635dbb5bbcfc7647dac310ea30d24af80bb9fe9cdd20845a',
'modes/rallycross/rules.js':'80c8a70c6d9e4bf51c0f7838a9dd0f519fb79f5e0d169f7ab4138ff0a188e3a0',
'modes/rallycross/qualifying.js':'15ba4a3768a3d389b2c968032935ac809f2bad551e4206c658c1b997c3ba3be9',
'modes/rallycross/finals.js':'160a93c2cd3ddfa58fbb7b661578076ba6b7a4904f915e966a2e41007d4e8bb1',
'modes/rallycross/index.js':'c9fb3c90f8dab5233d98dfa55384aa6c4329c9d38b53a547340e9ed44ff94386',
'modes/rallycross/runtime.js':'608b9e54ec3e7b288fec5824f37621a1555bf639115f6047bbaf29e81f1eebfd',
'reporting/core.js':'11df7d024958c4b983dcff942328193a5f7feffe280b8307f4bf6c75c0e75098'}
changed=[]
for rel,want in expected.items():
 p=ROOT/rel; got=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else 'MISSING'
 if got!=want: changed.append((rel,got,want))
checks['sport_ble_reporting_unchanged']=not changed
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if changed: print('protected changes:',changed)
sys.exit(0 if all(checks.values()) else 2)
