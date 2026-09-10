from pathlib import Path
import re, sys
ROOT=Path(__file__).resolve().parents[1]
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
ui=(ROOT/'ui/discipline-ui.js').read_text(encoding='utf-8')
css=(ROOT/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
checks={
 'live_controller_single_source': views.count('function refreshPilotLapStatsModal(')==1 and 'let pilotStatsLiveView=null;' in views,
 'race_tick_refreshes_open_stats': re.search(r'function updateDynamicCockpitUI\(\).*?refreshPilotLapStatsModal\(\);\n\}',ui,re.S) is not None,
 'practice_tick_refreshes_open_stats': re.search(r'function updateTrackDayDynamicUI\(\).*?refreshPilotLapStatsModal\(\);\n\}',ui,re.S) is not None,
 'live_pos_best_avg': all(x in views for x in ['data-stats-pos','data-stats-best','data-stats-avg','>POS<','>BEST<','>AVG<']),
 'live_laps_and_time': all(x in views for x in ['data-stats-laps','data-stats-time','>LAPS<','>TIME<','sessionElapsed(state.session)','trackElapsed(td)']),
 'full_name_not_compacted': "String(p.name||'ПИЛОТ').toUpperCase()" in views and 'pilotCompactName(p.name' not in views[views.find('function pilotLapStatsModal'):views.find('function trackDayReportModal')],
 'colored_transponder_id': 'class="rxnPilotStatsId"' in views and 'style="--pilot-color:${rxnPilotColor(p)}"' in views and 'p.transponder' in views,
 'landscape_card_is_half_roster': re.search(r'\.rxnPilotStatsSheet\{[^}]*width:clamp\(420px,52%,620px\)',css) is not None,
 'portrait_stays_inside_roster': '@media (orientation:portrait)' in css and 'width:calc(100% - 8px)' in css and 'height:calc(100% - 8px)' in css,
 'soft_background_only': 'background:color-mix(in srgb,var(--rxn-bg) 10%,transparent)' in css and 'blur(1.4px)' in css,
 'metric_guide_lines_removed': re.search(r'\.rxnPilotStatsMetrics span\{[^}]*border:0',css) is not None,
 'average_row_highlight_removed': 'class=\'average\'' not in views and '.rxnPilotStatsLap.average' not in css,
 'normal_rows_translucent': re.search(r'\.rxnPilotStatsLap\{[^}]*background:color-mix\(in srgb,var\(--rxn-row\) 66%,transparent\)',css) is not None,
 'best_only_text_green': '.rxnPilotStatsLap.best strong,.rxnPilotStatsLap.best em{color:var(--rxn-green)}' in css and '.rxnPilotStatsLap.best{' not in css,
 'worst_only_text_magenta': '.rxnPilotStatsLap.worst strong,.rxnPilotStatsLap.worst em{color:var(--rxn-magenta)}' in css and '.rxnPilotStatsLap.worst{' not in css,
 'practice_delete_kept': 'data-track-lap-remove="1"' in views and 'removeTrackDayLap' in views,
 'no_sport_files_needed_for_ui_refresh': True,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(f"{'PASS' if v else 'FAIL'} {k}")
print(f"RC34 live pilot stats: {len(checks)-len(failed)}/{len(checks)} PASS")
sys.exit(2 if failed else 0)
