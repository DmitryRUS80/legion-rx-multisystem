from pathlib import Path
import re,sys,hashlib
ROOT=Path(__file__).resolve().parents[1]
checks={}
pilot=(ROOT/'ui/pilots/pilot-cards.js').read_text(encoding='utf-8')
css=(ROOT/'ui/pilots/pilot-cards.css').read_text(encoding='utf-8')
shared=(ROOT/'ui/shell/discipline-shared.js').read_text(encoding='utf-8')
actions=(ROOT/'ui/shell/actions.js').read_text(encoding='utf-8')
checks['practice_card_perimeter_glow']='.pilotSelectCard.hasSelection' in css and '0 0 15px' in css and 'var(--v4-cobalt)' in css
checks['practice_model_perimeter_glow']='.pilotPickerModelChip.selected' in css and '0 0 12px' in css and 'var(--v4-cobalt)' in css
sel=re.search(r'\.pilotPickerModelChip\.selected\{([^}]*)\}',css)
checks['selection_has_no_transform']=bool(sel and 'transform' not in sel.group(1))
checks['theme_aware_custom_background']='function appBackgroundThemeColor(' in shared and "theme==='light'?.22:.34" in shared and 'appBackgroundThemeColor(color)' in shared
checks['theme_switch_reapplies_background']="darkToggle.addEventListener('change'" in actions and 'applySettings()' in actions
checks['model_id_preview_markup']='data-model-id-preview' in pilot and '<b>${esc(lapwizId)}</b>' in pilot
checks['model_id_preview_live_update']="field.dataset.modelField==='lapwizId'" in pilot and 'label.textContent=id' in pilot
checks['model_id_preview_keeps_color_picker']="data-model-field=\"uiColor\"" in pilot and '.pilotModelColor input' in css
# Protected sport/LapWiz/audio/reporting logic remains unchanged; app completion safety evolves in RC28.
expected={

'platform/lapwiz.js':'d0f9af187e90114edf671827c9365e7d28130809ba1926cfa11efd30f8c3c644',
'platform/audio.js':'1ffb1838fda888f6c9e213866f6fd20f3b7b6e402ba72fe56740fc3c5cd9dcb7',
'modes/free-practice/index.js':'aa43d3a87f0e9286635dbb5bbcfc7647dac310ea30d24af80bb9fe9cdd20845a',
'modes/rallycross/rules.js':'80c8a70c6d9e4bf51c0f7838a9dd0f519fb79f5e0d169f7ab4138ff0a188e3a0',
'modes/rallycross/qualifying.js':'15ba4a3768a3d389b2c968032935ac809f2bad551e4206c658c1b997c3ba3be9',
'modes/rallycross/finals.js':'160a93c2cd3ddfa58fbb7b661578076ba6b7a4904f915e966a2e41007d4e8bb1',
'modes/rallycross/index.js':'c9fb3c90f8dab5233d98dfa55384aa6c4329c9d38b53a547340e9ed44ff94386',
'modes/rallycross/runtime.js':'608b9e54ec3e7b288fec5824f37621a1555bf639115f6047bbaf29e81f1eebfd',
'reporting/core.js':'11df7d024958c4b983dcff942328193a5f7feffe280b8307f4bf6c75c0e75098'
}
changed=[]
for rel,want in expected.items():
 p=ROOT/rel; got=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else 'MISSING'
 if got!=want: changed.append((rel,got,want))
checks['protected_logic_unchanged']=not changed
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if changed: print('protected changes:',changed)
sys.exit(0 if all(checks.values()) else 2)
