from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[1]
idx=(ROOT/'index.html').read_text(encoding='utf-8')
om=(ROOT/'offline-manifest.js').read_text(encoding='utf-8')
sw=(ROOT/'sw.js').read_text(encoding='utf-8')
ver=(ROOT/'VERSION.txt').read_text(encoding='utf-8')
checks={
 'version_rc60': 'RC60' in ver and 'rc60-race-simulator' in om and 'rc60-race-simulator' in sw,
 'script_loaded': 'simulation/race-simulator.js' in idx,
 'offline_asset': './simulation/race-simulator.js' in om,
 'fresh_required': './simulation/race-simulator.js' in sw,
 'sw_validator': "url==='./simulation/race-simulator.js'" in sw,
}
assets=re.findall(r"'([^']+)'", re.search(r'const assets=\[(.*?)\];',om,re.S).group(1))
missing=[a for a in assets if a!='./' and a.startswith('./') and not (ROOT/a[2:]).exists()]
checks['manifest_files_exist']=not missing
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if missing: print('missing',missing)
sys.exit(0 if all(checks.values()) else 2)
