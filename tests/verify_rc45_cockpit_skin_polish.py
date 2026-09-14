from pathlib import Path
import hashlib,re
R=Path(__file__).resolve().parents[1]
base=(R/'ui/skins/rxui/base.css').read_text(encoding='utf-8')
steel=(R/'ui/skins/rxui/steel.css').read_text(encoding='utf-8')
light=(R/'ui/skins/rxui/light.css').read_text(encoding='utf-8')
icons=(R/'ui/skins/rxui/icons.js').read_text(encoding='utf-8')

# RC45 is deliberately cockpit-only for Steel/Light. Classic geometry/markup stays authoritative.
assert 'Cockpit skin · RC45 authoritative Steel/Light treatment' in base
assert ':is(html[data-skin="steel"],html[data-skin="light"]) .rxnCockpit' in base
assert '.rxnPilotRow{' not in base
assert hashlib.sha256((R/'ui/shell/discipline-pults.css').read_bytes()).hexdigest()=='5dd02f18d959daa2da7275a965f7cfc1b13c0a718ff050324f872256ee81ee9a'
assert hashlib.sha256((R/'ui/discipline-ui.js').read_bytes()).hexdigest()=='052ce3f901327b7ce6fa9365b1f091612577431092a9470b41fc854c9f5a00e1'

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
