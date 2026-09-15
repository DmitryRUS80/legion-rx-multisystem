from pathlib import Path
import hashlib,re
R=Path(__file__).resolve().parents[1]
base=(R/'ui/skins/rxui/base.css').read_text(encoding='utf-8')
steel=(R/'ui/skins/rxui/steel.css').read_text(encoding='utf-8')
light=(R/'ui/skins/rxui/light.css').read_text(encoding='utf-8')
icons=(R/'ui/skins/rxui/icons.js').read_text(encoding='utf-8')

# RC45 skin paint remains isolated. RC50 intentionally updates shared cockpit geometry in discipline-pults.css for every skin.
assert 'Cockpit skin · RC45 authoritative Steel/Light treatment' in base
assert ('html:not([data-skin="classic"]) .rxnCockpit' in base) or (':is(html[data-skin="steel"],html[data-skin="light"]) .rxnCockpit' in base)
assert '.rxnPilotRow{' not in base
shared=(R/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
assert 'Landscape phone / narrow browser viewport' in shared
assert 'max-width:1100px' in shared and 'max-height:600px' in shared
assert hashlib.sha256((R/'ui/discipline-ui.js').read_bytes()).hexdigest()=='5d81e48bc0ff1bd81e77d88bd03d2468e6b6db75a9049d6147e0edace62ed3d2'

# No legacy side/bottom activation strips in Steel/Light cockpit layer.
assert '.rxnControl:after{display:none!important;content:none!important}' in base
assert '.rxnTopActions .rxnTopButton:after{display:none!important;content:none!important}' in base
assert 'box-shadow:inset 0 -3px' not in base

# Full-surface state tokens exist for enabled/on/disabled controls.
for token in ['--rxui-cockpit-on','--rxui-primary-control','--rxui-cockpit-disabled','--rxui-cockpit-chip-on']:
    assert token in steel, token
    assert token in light, token

# New icon family covers every cockpit/navigation action used by RallyCross and Free Practice.
for name in ['home','trophy','users','settings','wave','mic','flag','next','stop','chart','list','play','pause','plusClock','refresh']:
    assert re.search(rf"\b{name}:'",icons), name
assert "dataset.skin==='classic'" in icons

# Removable layer remains removable and Classic remains selected through existing data-skin contract.
idx=(R/'index.html').read_text(encoding='utf-8')
assert 'data-skin="classic"' in idx
assert 'ui/skins/rxui/base.css' in idx and 'ui/skins/rxui/icons.js' in idx
print('RC45 COCKPIT STEEL/LIGHT POLISH: PASS')
