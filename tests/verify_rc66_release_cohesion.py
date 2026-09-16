from pathlib import Path
R=Path(__file__).resolve().parents[1]
v=(R/'VERSION.txt').read_text();m=(R/'offline-manifest.js').read_text();sw=(R/'sw.js').read_text();ui=(R/'ui/classic-rc/classic-rc-ui.js').read_text();css=(R/'ui/classic-rc/classic-rc.css').read_text()
checks={
 'version':'RC66' in v and 'CLASSIC SCHEDULE OVERLAY FIX' in v,
 'manifest':'4.2.0-clean-full-rc66-classic-schedule-overlay-fix' in m,
 'sw':"LEGION_SW_BUILD='rc66-classic-schedule-overlay-fix'" in sw and 'offline-manifest.js?build=rc66-classic-schedule-overlay-fix' in sw,
 'ui_binding':'classicRCBindActionElement' in ui and 'classicRCEnsureDelegatedBindings' not in ui,
 'css_overlay':'position:fixed!important' in css and '.classicScheduleTail.open{opacity:0' in css,
}
fail=False
for k,x in checks.items():print(f'{k}: {"PASS" if x else "FAIL"}');fail|=not x
raise SystemExit(2 if fail else 0)
