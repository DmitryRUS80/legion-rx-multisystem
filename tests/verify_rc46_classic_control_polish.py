from pathlib import Path
import hashlib,re
R=Path(__file__).resolve().parents[1]
css=(R/'ui/classic-polish/classic-controls.css').read_text(encoding='utf-8')
js=(R/'ui/classic-polish/classic-icons.js').read_text(encoding='utf-8')
idx=(R/'index.html').read_text(encoding='utf-8')
off=(R/'offline-manifest.js').read_text(encoding='utf-8')

# Scope is Classic cockpit controls only.
assert 'html[data-skin="classic"] .rxnCockpit' in css
for forbidden in ['.rxnPilotRow{','.rxnPilotData{','.rxnPilotHead{','.rxnNameCell{','.rxnId{']:
    assert forbidden not in css, forbidden

# RC50 intentionally updates shared responsive geometry; cockpit markup / sport adapter remains unchanged.
shared=(R/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
assert 'Landscape phone / narrow browser viewport' in shared
assert 'max-width:1100px' in shared and 'max-height:600px' in shared
assert hashlib.sha256((R/'ui/discipline-ui.js').read_bytes()).hexdigest()=='052ce3f901327b7ce6fa9365b1f091612577431092a9470b41fc854c9f5a00e1'

# Legacy status dots/side stripes are neutralized by the isolated polish layer.
assert '.rxnTopActions .rxnTopButton:after{display:none!important}' in css
assert '.rxnControl:after{display:none!important}' in css
assert 'box-shadow:inset 0 -3px' not in css

# Full-surface states and readable disabled states exist.
for token in ['--rx46-active','--rx46-primary','--rx46-danger','--rx46-disabled','--rx46-chip-active']:
    assert token in css, token
assert '.rxnControl.primary:not(:disabled)' in css
assert '.rxnControl.blue:not(:disabled)' in css
assert '.rxnControl.danger:not(:disabled)' in css
assert '.rxnControl:disabled' in css

# One coherent SVG family covers Classic cockpit/navigation actions.
for name in ['home','trophy','users','wave','mic','flag','next','stop','chart','settings','list','play','pause','plusClock','refresh']:
    assert re.search(rf"\b{name}:'",js), name
assert "dataset.skin!=='classic'" in js
assert '.rxnCockpit svg[data-rx-icon]' in js

# Release wiring / offline package.
assert 'ui/classic-polish/classic-controls.css' in idx
assert 'ui/classic-polish/classic-icons.js' in idx
assert './ui/classic-polish/classic-controls.css' in off
assert './ui/classic-polish/classic-icons.js' in off
print('RC46 CLASSIC CONTROL POLISH: PASS')
