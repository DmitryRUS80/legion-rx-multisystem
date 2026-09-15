from pathlib import Path
R=Path(__file__).resolve().parents[1]
sw=(R/'sw.js').read_text(encoding='utf-8'); om=(R/'offline-manifest.js').read_text(encoding='utf-8')
required=['./','./index.html','./VERSION.txt','./offline-manifest.js','./boot.js','./platform/updater.js','./ui/shell/views.js','./ui/shell/router.js','./ui/shell/actions.js','./ui/shell/offline-runtime.js','./ui/shell/app.css','./ui/skins/rxui/base.css']
checks={
 'manifest_current':'4.2.0-clean-full-rc59-settings-update-ux' in om,
 'sw_current':"LEGION_SW_BUILD='rc59-settings-update-ux'" in sw and 'build=rc59-settings-update-ux' in sw,
 'fresh_required_all':all(repr(x) in sw for x in required),
 'all_manifest_local_exist':True,
}
import re
m=re.search(r'const assets=\[(.*?)\];',om,re.S)
if not m:checks['all_manifest_local_exist']=False
else:
  urls=re.findall(r"'([^']+)'",m.group(1))
  for u in urls:
    if u=='./':continue
    if not (R/u.removeprefix('./')).exists(): checks['all_manifest_local_exist']=False; print('missing',u)
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():print(f'{k}:', 'PASS' if v else 'FAIL')
if failed:raise SystemExit('RC59 release cohesion failed: '+', '.join(failed))
print('RC59 RELEASE COHESION: PASS')
