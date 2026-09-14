from pathlib import Path
R=Path(__file__).resolve().parents[1]
base=(R/'ui/skins/rxui/base.css').read_text()
assert 'html:not([data-skin="classic"])' in base
for n in ['steel','light','modern','heritage']:
    p=R/f'ui/skins/rxui/{n}.css'
    assert p.exists(), n
    assert f'data-skin="{n}"' in p.read_text()
idx=(R/'index.html').read_text()
assert 'data-skin="classic"' in idx
assert 'ui/skins/rxui/icons.js' in idx
shared=(R/'ui/shell/discipline-shared.js').read_text()
assert 'dataset.skin=state.settings.uiSkin' in shared
views=(R/'ui/shell/views.js').read_text()
for n in ['classic','steel','light','modern','heritage']:
    assert f"['{n}'" in views
# Guard: skin layer must not redefine locked pilot-row geometry.
for p in (R/'ui/skins/rxui').glob('*.css'):
    t=p.read_text()
    assert '.rxnPilotRow{' not in t
    assert 'grid-template-columns:clamp(28px' not in t
print('RC44 RXUI SKINS: PASS')
