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
# RC29 intentionally changes RallyCross scoring/tie logic. Unrelated LapWiz/audio/reporting logic remains protected.
expected={

'platform/lapwiz.js':'d0f9af187e90114edf671827c9365e7d28130809ba1926cfa11efd30f8c3c644',
'platform/audio.js':'1ffb1838fda888f6c9e213866f6fd20f3b7b6e402ba72fe56740fc3c5cd9dcb7',
'modes/free-practice/index.js':'aa43d3a87f0e9286635dbb5bbcfc7647dac310ea30d24af80bb9fe9cdd20845a',





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
