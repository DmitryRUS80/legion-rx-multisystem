from pathlib import Path
import re, sys, hashlib
ROOT=Path(__file__).resolve().parents[1]

def text(paths):
    return '\n'.join(p.read_text(encoding='utf-8') for p in paths)
core_paths=[p for d in ['platform','modes/rallycross','modes/free-practice'] for p in (ROOT/d).rglob('*.js')]
ui_paths=list((ROOT/'ui').rglob('*.js'))
core=text(core_paths); ui=text(ui_paths); app=(ROOT/'app.js').read_text(encoding='utf-8')
checks={
 'core_no_dom': not re.search(r'\bdocument\.|querySelector|innerHTML|classList|getElementById',core),
 'app_no_dom': not re.search(r'\bdocument\.|querySelector|innerHTML|classList|getElementById|\$\(',app),
 'ui_no_ble_protocol': not re.search(r'0000fff[034]|buildProtocolPacket|writeValueWithoutResponse',ui,re.I),
 'ui_no_sport_constants': all(x not in ui for x in ['SPORT_RULES','SCORE_TABLE','EVENT_POINTS','FINAL_A_RUNS']),
 'no_unsafe_fin_default': all(x not in ui for x in ['readEditedResult','quickNextEvent','saveCurrentEventResult']),
}
funcs={}
for p in ROOT.rglob('*.js'):
    t=p.read_text(encoding='utf-8')
    for m in re.finditer(r'(?m)^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(',t): funcs.setdefault(m.group(1),[]).append(str(p.relative_to(ROOT)))
dups={k:v for k,v in funcs.items() if len(v)>1}
checks['no_duplicate_global_functions']=not dups
cfg=(ROOT/'offline-config.js').read_text(encoding='utf-8')
assets=re.findall(r'"(\./[^"]+)"',cfg)
missing=[a for a in assets if a!='./' and not (ROOT/a[2:]).exists()]
checks['offline_manifest_complete']=not missing
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if dups: print('duplicates:',dups)
if missing: print('missing:',missing)
sys.exit(0 if all(checks.values()) else 2)
