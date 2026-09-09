from pathlib import Path
import re,sys,hashlib,json
ROOT=Path(__file__).resolve().parents[1]
checks={}
index=(ROOT/'index.html').read_text(encoding='utf-8')
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
actions=(ROOT/'ui/shell/actions.js').read_text(encoding='utf-8')
pilot=(ROOT/'ui/pilots/pilot-cards.js').read_text(encoding='utf-8')
css=(ROOT/'ui/pilots/pilot-cards.css').read_text(encoding='utf-8')
appcss=(ROOT/'ui/shell/app.css').read_text(encoding='utf-8')
checks['pilot_component_loaded_once']=index.count('ui/pilots/pilot-cards.js')==1 and index.count('ui/pilots/pilot-cards.css')==1
checks['old_pilot_card_removed']='pilotProfileCard' not in views and 'pilotProfileCard' not in appcss and 'pilotProfileGrid' not in appcss
checks['single_pilots_view']='function pilotsView()' in pilot and 'function pilotsView()' not in views
checks['single_pilot_editor']='function pilotModal(' in pilot and 'function pilotModal(' not in views
checks['single_race_picker']='function pilotPicker()' in pilot and 'function pilotPicker()' not in views
checks['card_has_no_edit_text_button']='>Редактировать<' not in pilot and 'data-edit-pilot=' in pilot
checks['models_are_tap_toggle']='data-race-model-toggle' in pilot and 'pilotToggleRaceModel' in pilot and ':checked' not in re.search(r'function pilotPicker\(\).*',pilot,re.S).group(0)
checks['avatar_upload_preserves_local_profile']='pilotAvatarFile' in pilot and 'pilotResizeAvatar' in pilot and 'photo:pendingPhoto' in pilot
checks['editor_contains_models_country_club_avatar']=all(x in pilot for x in ['pilotModelEditors','mCountry','mClub','pilotAvatarButton'])
checks['glass_and_motion']=all(x in css for x in ['backdrop-filter:blur','pilotPanelIn','pilotTile:hover'])

checks['rc23_name_below_avatar']='pilotTileProfile' in pilot and 'pilotTileName' in pilot and 'pilotTileIdentity' not in pilot
checks['rc23_silhouette_placeholder']='pilotAvatarPlaceholderMarkup' in pilot and 'nameInitials' not in re.search(r'function pilotAvatarMarkup\(.*?\n\}',pilot,re.S).group(0)
checks['rc23_model_display_is_clean']='pilotModelSelectedMark' not in pilot and '>TP ' not in pilot and "(model.className||'МОДЕЛЬ')" not in pilot
checks['rc23_neutral_selection']='.pilotModelTile.selected' in css and 'transform:translate' not in re.search(r'\.pilotModelTile\.selectable.*?(?=\n\.pilotEditorBackdrop)',css,re.S).group(0) and 'border-color:var(--pilot-model-color)' not in css
checks['rc23_race_setup_reuses_model_tile']='pilotRaceSetupTileMarkup' in pilot and 'pilotRaceSetupGrid' in views and 'listRow' not in re.search(r'function pilotSetupCard\(race\).*?\n',views,re.S).group(0)
# Protected sport/platform/reporting/app files must remain byte-identical to RC21.
expected={'app.js': '63061fe13fff6cbcc903e7154cbf1d101e83121d20a8dc421ae32a474409a1b8', 'modes/classic-rc/index.js': 'ade4c33308e6d31ec1987d61635058917aea54c9fc0a8bd476cc824407af9bb4', 'modes/free-practice/index.js': 'aa43d3a87f0e9286635dbb5bbcfc7647dac310ea30d24af80bb9fe9cdd20845a', 'modes/rally-sprint/index.js': '1f72a94e0f765212b98bd7af6b24589c1108001bcfaa9fcfc3db7fd97b025a71', 'modes/rallycross/audio-actions.js': 'f2d9ccfc4bcdb85bb759840153c9e844787dfcaca2f6a9c723cec3b38875f67a', 'modes/rallycross/finals.js': '160a93c2cd3ddfa58fbb7b661578076ba6b7a4904f915e966a2e41007d4e8bb1', 'modes/rallycross/index.js': 'c9fb3c90f8dab5233d98dfa55384aa6c4329c9d38b53a547340e9ed44ff94386', 'modes/rallycross/qualifying.js': '15ba4a3768a3d389b2c968032935ac809f2bad551e4206c658c1b997c3ba3be9', 'modes/rallycross/rules.js': '80c8a70c6d9e4bf51c0f7838a9dd0f519fb79f5e0d169f7ab4138ff0a188e3a0', 'modes/rallycross/runtime.js': '608b9e54ec3e7b288fec5824f37621a1555bf639115f6047bbaf29e81f1eebfd', 'modes/rallycross/self-test.js': '004f5e6f4d5adfc9dd37af3050cb4a7e3b486b36cd9b157fada9879482800037', 'platform/audio.js': '1ffb1838fda888f6c9e213866f6fd20f3b7b6e402ba72fe56740fc3c5cd9dcb7', 'platform/lapwiz.js': 'd0f9af187e90114edf671827c9365e7d28130809ba1926cfa11efd30f8c3c644', 'platform/offline-core.js': 'ac44e40b877c0faa58136710582fe572037a069fea67536957d95758a37b628d', 'platform/pilots.js': '9447a63d5fef07aed6c28407844372ab9d7d0f9afdba5c48ed0d63d3048c7ca9', 'platform/state.js': 'e3ec736cc481d1b3f9b3f67d03704670be90ac5cf994df81ac2921e6309f6753', 'platform/storage.js': '5eae8f579ab7d3f2860728ea5fe0adc425de8078e6999971f441bb389141699a', 'platform/timing.js': '2f906ea408b3dca79a7dc74b19eed99c0a88d2559e24146a52a02b350ea8a9c8', 'platform/updater.js': '8aef1c627d718cf1e5b1b5ebd8e85c9979937a61b32ce74ffcb7931d940236ec', 'platform/utils.js': '488d5cc91485d8511fa46b7c043cb21d61048ee3d9caf0a3e03724493432fecd', 'reporting/README.md': 'e1f0c6bc54344f672f6df61b78d1281b644683100bced54fc7e7100a0b150b06', 'reporting/core.js': '11df7d024958c4b983dcff942328193a5f7feffe280b8307f4bf6c75c0e75098', 'reporting/sections/practice.js': '8b57e65f99984f1552fe07b92ab5b6941caf2cfc49abd0ce99757d0e151b7dc1', 'reporting/sections/rally.js': 'e941b01c46f0f0f2e548358f3d16fd02a98c01dd50e01a92c0ea700c10b3ea0a', 'reporting/sections/rallycross.js': '540212e96af2ee20d35b74e78887019f8226a339370121a2b020c67aaf7ee913'}
changed=[]
for rel,want in expected.items():
  p=ROOT/rel
  got=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else 'MISSING'
  if got!=want:changed.append(rel)
checks['protected_logic_byte_identical_to_rc21']=not changed
for k,v in checks.items():print(f'{k}: {"PASS" if v else "FAIL"}')
if changed:print('protected changes:',changed)
sys.exit(0 if all(checks.values()) else 2)
