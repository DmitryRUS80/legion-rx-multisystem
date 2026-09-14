from pathlib import Path
import hashlib,re,sys
ROOT=Path(__file__).resolve().parents[1]
checks={}
index=(ROOT/'index.html').read_text(encoding='utf-8')
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
actions=(ROOT/'ui/shell/actions.js').read_text(encoding='utf-8')
shared=(ROOT/'ui/shell/discipline-shared.js').read_text(encoding='utf-8')
skins=(ROOT/'ui/themes/skins.css').read_text(encoding='utf-8')

checks['apex_removed_from_runtime']='apex' not in index.lower() and 'apex' not in views.lower() and not any('apex' in str(p).lower() for p in (ROOT/'ui').rglob('*'))
checks['classic_steel_light_only']=all(f"settingsSkinChoice('{x}'" in views for x in ('classic','steel','light')) and "['classic','steel','light']" in shared
checks['skin_css_loaded_once']=index.count('ui/themes/skins.css')==1
checks['skin_applies_without_new_renderer']="dataset.skin=skin" in shared and 'interfaceSkin()' in shared and 'apex-renderer' not in index.lower()
checks['skin_change_is_immediate_no_render']="[name=\"interfaceSkin\"]" in actions and 'applySettings();' in actions
checks['classic_dark_toggle_preserved']="darkToggle.addEventListener('change'" in actions and "interfaceSkin()==='classic'" in actions
checks['modern_icons_are_dual_glyph']='classicGlyph' in shared and 'skinGlyph' in shared and 'MODERN_GLYPH_PATHS' in shared
checks['static_header_icons_are_dual_glyph']=index.count('class="classicGlyph"')>=6 and index.count('class="skinGlyph"')>=6 and 'skinGlyphAccent' in index
checks['modern_icons_skin_only']='html[data-skin="steel"] .classicGlyph' in skins and 'html[data-skin="light"] .classicGlyph' in skins
pilot_js=(ROOT/'ui/pilots/pilot-cards.js').read_text(encoding='utf-8')
checks['pilot_card_icons_join_skin_family']='classicGlyph' in pilot_js and 'skinGlyph' in pilot_js and "pilotCardIcon('play')" in pilot_js
checks['steel_visual_contract']=all(x in skins for x in ['STEEL — cold graphite','--rxn-bg:#11171d','--v4-cobalt:#a9bfd0','html[data-skin="steel"] .rxnControl.primary'])
checks['light_visual_contract']=all(x in skins for x in ['LIGHT — high-clarity','--rxn-bg:#f3f5f7','--v4-cobalt:#ff6a00','html[data-skin="light"] .rxnControl.primary'])
checks['locked_pilot_geometry_not_redeclared']='.rxnPilotRow' not in skins and 'grid-template-columns' not in '\n'.join(line for line in skins.splitlines() if 'rxn' in line)
checks['race_banner_remains_shared']='--rxn-race-banner' not in skins

# Critical classic cockpit/layout source must remain byte-identical to RC40.
base=Path('/mnt/data/rc40_src')
protected=['ui/shell/discipline-pults.css','ui/shell/app.css','ui/pilots/pilot-cards.css','ui/discipline-ui.js']
protected += [str(p.relative_to(ROOT)) for p in (ROOT/'platform').glob('*.js')]
protected += [str(p.relative_to(ROOT)) for p in (ROOT/'modes').rglob('*.js')]
protected += [str(p.relative_to(ROOT)) for p in (ROOT/'reporting').rglob('*') if p.is_file()]
changed=[]
for rel in protected:
 a=ROOT/rel;b=base/rel
 if not b.exists(): continue
 if hashlib.sha256(a.read_bytes()).hexdigest()!=hashlib.sha256(b.read_bytes()).hexdigest(): changed.append(rel)
checks['classic_geometry_and_core_unchanged']=not changed

for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if changed: print('protected changes:',changed)
sys.exit(0 if all(checks.values()) else 2)
