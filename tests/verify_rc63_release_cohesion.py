from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
version=(ROOT/'VERSION.txt').read_text()
manifest=(ROOT/'offline-manifest.js').read_text()
sw=(ROOT/'sw.js').read_text()
index=(ROOT/'index.html').read_text()
checks={
 'version_rc63':'RC63' in version and 'CLASSIC DIRECTOR CONTROL' in version,
 'manifest_rc63':'4.2.0-clean-full-rc63-classic-director-control' in manifest,
 'sw_rc63':"LEGION_SW_BUILD='rc63-classic-director-control'" in sw and 'offline-manifest.js?build=rc63-classic-director-control' in sw,
 'classic_ui_loaded':'ui/classic-rc/classic-rc-ui.js' in index,
 'classic_css_loaded':'ui/classic-rc/classic-rc.css' in index,
 'scheduler_loaded':'runtime/competition-scheduler.js' in index,
 'active_controller_loaded':'runtime/active-race-controller.js' in index,
}
fail=False
for k,v in checks.items():
 print(f'{k}: {"PASS" if v else "FAIL"}')
 fail|=not v
raise SystemExit(2 if fail else 0)
