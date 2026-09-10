from pathlib import Path
import re,sys,hashlib
ROOT=Path(__file__).resolve().parents[1]
checks={}
index=(ROOT/'index.html').read_text(encoding='utf-8')
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
pilot=(ROOT/'ui/pilots/pilot-cards.js').read_text(encoding='utf-8')
css=(ROOT/'ui/pilots/pilot-cards.css').read_text(encoding='utf-8')
appcss=(ROOT/'ui/shell/app.css').read_text(encoding='utf-8')
checks['pilot_component_loaded_once']=index.count('ui/pilots/pilot-cards.js')==1 and index.count('ui/pilots/pilot-cards.css')==1
checks['single_pilots_view']='function pilotsView()' in pilot and 'function pilotsView()' not in views
checks['single_pilot_editor']='function pilotModal(' in pilot and 'function pilotModal(' not in views
checks['single_race_picker']='function pilotPicker()' in pilot and 'function pilotPicker()' not in views
checks['old_pilot_card_removed']='pilotProfileCard' not in views and 'pilotProfileCard' not in appcss
checks['dense_database_grid']='repeat(auto-fill,minmax(230px,1fr))' in css and 'repeat(5,minmax(0,1fr))' in css
checks['mobile_two_three_columns']='repeat(3,minmax(0,1fr))' in css and 'repeat(2,minmax(0,1fr))' in css
checks['avatar_cover_center']='object-fit:cover;object-position:center center' in css
checks['flat_stats_no_guides']=re.search(r'\.pilotTileStats span\{[^}]*border:0[^}]*\}',css) is not None
checks['editor_no_guide_lines']=re.search(r'\.pilotEditorIdentity input.*?border:0;border-radius:0;background:',css,re.S) is not None and 'border-bottom:' not in re.search(r'\.pilotEditorIdentity input.*?\}',css,re.S).group(0)
checks['editor_labels_larger']='font:700 11px/1' in css and 'gap:2px' in css
checks['single_lapwiz_id_field']='data-model-field="lapwizId"' in pilot and 'data-model-field="transponder"' not in pilot and 'ID LAPWIZ' in pilot
checks['lapwiz_id_canonicalized']='number:lapwizId,transponder:lapwizId' in pilot and 'm.number||m.transponder' in pilot
checks['model_color_square']='width:38px;height:38px' in css
checks['model_id_live_preview']='data-model-id-preview' in pilot and "field.dataset.modelField==='lapwizId'" in pilot and 'pilotModelColor>b' in css
checks['compact_picker_cards']='pilotPickerModelChipMarkup' in pilot and 'data-picker-profile' in pilot and 'repeat(auto-fill,minmax(145px,170px))' in css
checks['picker_no_full_rerender_on_toggle']='persistRace();if(refresh)pilotSyncPickerState();' in pilot
checks['picker_no_transform_selection']='pilotPickerModelChip.selected' in css and 'transform:' not in re.search(r'\.pilotPickerModelChip\{.*?\.pilotPickerModelChip\.selected\{.*?\}',css,re.S).group(0)
checks['race_setup_compact_tiles']='pilotRaceSetupTileMarkup' in pilot and 'pilotRaceSetupGrid' in views

checks['avatar_true_square_crop']=all(x in pilot for x in ['side=Math.min(srcW,srcH)','(srcW-side)/2','(srcH-side)/2','canvas.width=out;canvas.height=out'])
checks['team_label_lower_left']='pilotTeamBadge(profile)' in pilot and '.pilotTileTeam{position:absolute;left:0;bottom:0' in css
checks['club_input_has_no_brand_hint']='placeholder="LEGION RX"' not in pilot
checks['picker_class_under_id']='pilotPickerModelClass' in pilot and '.pilotPickerModelClass{' in css
checks['free_practice_uses_new_tiles']='pilotPracticeGridMarkup(td)' in views and 'data-track-model-toggle' in pilot and 'trackPilotCheck' not in views and 'trackPilotCheck' not in appcss
checks['free_practice_selected_model_snapshot']='pilotPracticeParticipants(td)' in views and 'modelClass:model.className' in pilot and 'model.transponder||model.number||profile.transponder' in pilot
checks['rc27_css_authoritative']=css.startswith('/* LEGION RX · PILOT CARDS · authoritative component styles · RC27')

expected={'modes/classic-rc/index.js': 'ade4c33308e6d31ec1987d61635058917aea54c9fc0a8bd476cc824407af9bb4', 'modes/free-practice/index.js': 'aa43d3a87f0e9286635dbb5bbcfc7647dac310ea30d24af80bb9fe9cdd20845a', 'modes/rally-sprint/index.js': '1f72a94e0f765212b98bd7af6b24589c1108001bcfaa9fcfc3db7fd97b025a71', 'modes/rallycross/audio-actions.js': 'f2d9ccfc4bcdb85bb759840153c9e844787dfcaca2f6a9c723cec3b38875f67a',       'platform/audio.js': '1ffb1838fda888f6c9e213866f6fd20f3b7b6e402ba72fe56740fc3c5cd9dcb7', 'platform/lapwiz.js': 'd0f9af187e90114edf671827c9365e7d28130809ba1926cfa11efd30f8c3c644', 'platform/offline-core.js': 'ac44e40b877c0faa58136710582fe572037a069fea67536957d95758a37b628d', 'platform/pilots.js': '9447a63d5fef07aed6c28407844372ab9d7d0f9afdba5c48ed0d63d3048c7ca9', 'platform/state.js': 'e3ec736cc481d1b3f9b3f67d03704670be90ac5cf994df81ac2921e6309f6753', 'platform/timing.js': '2f906ea408b3dca79a7dc74b19eed99c0a88d2559e24146a52a02b350ea8a9c8', 'platform/updater.js': '8aef1c627d718cf1e5b1b5ebd8e85c9979937a61b32ce74ffcb7931d940236ec', 'platform/utils.js': '488d5cc91485d8511fa46b7c043cb21d61048ee3d9caf0a3e03724493432fecd', 'reporting/README.md': 'e1f0c6bc54344f672f6df61b78d1281b644683100bced54fc7e7100a0b150b06', 'reporting/core.js': '11df7d024958c4b983dcff942328193a5f7feffe280b8307f4bf6c75c0e75098', 'reporting/sections/practice.js': '8b57e65f99984f1552fe07b92ab5b6941caf2cfc49abd0ce99757d0e151b7dc1', 'reporting/sections/rally.js': 'e941b01c46f0f0f2e548358f3d16fd02a98c01dd50e01a92c0ea700c10b3ea0a', 'reporting/sections/rallycross.js': '540212e96af2ee20d35b74e78887019f8226a339370121a2b020c67aaf7ee913'}
changed=[]
for rel,want in expected.items():
  p=ROOT/rel
  got=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else 'MISSING'
  if got!=want:changed.append(rel)
checks['protected_unrelated_logic_unchanged']=not changed
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if changed: print('protected changes:',changed)
sys.exit(0 if all(checks.values()) else 2)
