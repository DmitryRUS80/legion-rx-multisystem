from pathlib import Path
R=Path(__file__).resolve().parents[1]
om=(R/'offline-manifest.js').read_text(encoding='utf-8')
sw=(R/'sw.js').read_text(encoding='utf-8')
idx=(R/'index.html').read_text(encoding='utf-8')
views=(R/'ui/shell/views.js').read_text(encoding='utf-8')
cobalt=(R/'ui/skins/rxui/cobalt.css').read_text(encoding='utf-8')
base=(R/'ui/skins/rxui/base.css').read_text(encoding='utf-8')
classic_css=(R/'ui/classic-polish/classic-controls.css').read_text(encoding='utf-8')
classic_js=(R/'ui/classic-polish/classic-icons.js').read_text(encoding='utf-8')
ver=(R/'VERSION.txt').read_text(encoding='utf-8')
assert 'rc55-workspace-wallpaper' in om
assert 'RC55 · WORKSPACE WALLPAPER' in ver
assert "importScripts('./offline-manifest.js?build=rc55-workspace-wallpaper')" in sw
for asset in ['./VERSION.txt','./ui/skins/rxui/cobalt.css','./ui/classic-polish/classic-controls.css','./ui/classic-polish/classic-icons.js']:
    assert asset in om, asset
assert 'ui/skins/rxui/cobalt.css' in idx and 'ui/classic-polish/classic-controls.css' in idx and 'ui/classic-polish/classic-icons.js' in idx
assert 'COBALT · BLUE CONTROL' in views
assert 'html[data-skin="cobalt"]' in cobalt
assert '.rxnPilotRow{' not in cobalt and '.rxnPilotData{' not in cobalt
assert ('repeat(6,minmax(0,1fr))' in base) or ('repeat(3,minmax(0,1fr))' in base)
assert 'data-skin="classic"' in classic_css and 'ClassicControlPolish' in classic_js
assert 'FRESH_REQUIRED' in sw and 'stale views without COBALT' in sw and 'stale VERSION' in sw
print('RC49/RC50 RELEASE COHESION: PASS')
