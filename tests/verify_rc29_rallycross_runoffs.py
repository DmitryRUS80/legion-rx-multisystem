from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[1]
q=(ROOT/'modes/rallycross/qualifying.js').read_text(encoding='utf-8')
f=(ROOT/'modes/rallycross/finals.js').read_text(encoding='utf-8')
r=(ROOT/'modes/rallycross/rules.js').read_text(encoding='utf-8')
rt=(ROOT/'modes/rallycross/runtime.js').read_text(encoding='utf-8')
ui=(ROOT/'ui/discipline-ui.js').read_text(encoding='utf-8')+(ROOT/'ui/shell/actions.js').read_text(encoding='utf-8')+(ROOT/'ui/shell/discipline-shared.js').read_text(encoding='utf-8')
checks={
 'rule_version_rc29': "RALLYCROSS-2026.09.2" in r,
 'random_draw_removed_from_sport': 'Math.random' not in q+f and 'runTieDraw' not in q+f,
 'qualification_core_has_no_round_recency_fallback': 'for(let round=race.qualifyingCount' not in q,
 'qualification_runoff_exists': all(x in q for x in ['createQualificationRunoffs','saveQualificationRunoffEvent','qualificationRunoffOrder']),
 'qualification_runoff_no_savePilotResult': 'saveQualificationRunoffEvent' in q and re.search(r'function saveQualificationRunoffEvent[\s\S]*?savePilotResult',q) is None,
 'final_core_order': all(x in f for x in ['compareMainStandingsCore','compareRunPerformance','countedRuns']),
 'final_runoff_exists': all(x in f for x in ['createFinalRunoffs','finalRunoffOrder',"type:'final-tiebreak'"]),
 'final_runoff_not_in_finalResults': "if(final.tieBreak&&final.tieScope==='final')" in f,
 'final_runoff_excluded_from_eliminated': "f.saved&&f.type!=='main'&&!f.tieBreak" in f,
 'runtime_routes_qualification_runoff': 'saveQualificationRunoffEvent(race,ev.key,result)' in rt,
 'no_draw_ui': 'ЖЕРЕБ' not in ui.upper() and 'tie-draw' not in ui,
 'runoff_ui_present': 'ПЕРЕЗАЕЗД' in ui and 'tie-runoff' in ui,
 'runoff_no_bonus_message': 'Дополнительные очки не начисляются' in ui,
}
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
sys.exit(0 if all(checks.values()) else 2)
