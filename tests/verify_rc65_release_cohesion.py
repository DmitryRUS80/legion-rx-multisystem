from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
version=(ROOT/'VERSION.txt').read_text()
manifest=(ROOT/'offline-manifest.js').read_text()
sw=(ROOT/'sw.js').read_text()
index=(ROOT/'index.html').read_text()
ui=(ROOT/'ui/classic-rc/classic-rc-ui.js').read_text()
css=(ROOT/'ui/classic-rc/classic-rc.css').read_text()
checks={
 'version_rc65':'RC65' in version and 'CLASSIC SCHEDULE BUTTON FIX' in version,
 'manifest_rc65':'4.2.0-clean-full-rc65-classic-schedule-button-fix' in manifest,
 'sw_rc65':"LEGION_SW_BUILD='rc65-classic-schedule-button-fix'" in sw and 'offline-manifest.js?build=rc65-classic-schedule-button-fix' in sw,
 'classic_ui_loaded':'ui/classic-rc/classic-rc-ui.js' in index,
 'classic_css_loaded':'ui/classic-rc/classic-rc.css' in index,
 'delegated_action_handler':'async function classicRCDispatchAction' in ui,
 'capture_click_delegate':"document.addEventListener('click'" in ui and "},true);" in ui,
 'schedule_touch_reliability':'RC65 · Schedule touch/click reliability' in css and 'touch-action:manipulation' in css,
}
fail=False
for k,v in checks.items():
 print(f'{k}: {"PASS" if v else "FAIL"}')
 fail|=not v
raise SystemExit(2 if fail else 0)
