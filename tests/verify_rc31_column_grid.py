from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[1]
css=(ROOT/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
js=(ROOT/'ui/discipline-ui.js').read_text(encoding='utf-8')
metrics=['gap','check','best','avg','last','laps']
checks={}
for k in metrics:
    cls={'gap':'rxnGap','check':'rxnCheck','best':'rxnBest','avg':'rxnAvg','last':'rxnLast','laps':'rxnLaps'}[k]
    pattern=rf'\.rxnCockpit\.rxnHide-{k}\s+\.{cls}\s*\{{\s*display\s*:\s*none\s*\}}'
    checks[f'hide_{k}_is_authoritative_css']=bool(re.search(pattern,css))
checks['js_builds_same_hide_classes']=all(f'`rxnHide-${{k}}`' in js for _ in [0]) and "['gap','check','best','avg','last','laps']" in js
checks['metric_count_uses_same_six_fields']="['gap','check','best','avg','last','laps'].filter(k=>c[k]).length" in js
checks['shared_rallycross_and_practice_row']=js.count('class="rxnPilotRow rxnPilotData')>=2 and 'rxnTrackPilotTable' in js and 'rxnPilotTable' in js
checks['no_patch_stylesheet_created']=not any(re.search(r'(patch|override|hotfix|fix)',p.name,re.I) for p in (ROOT/'ui').rglob('*.css'))
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
sys.exit(0 if all(checks.values()) else 2)
