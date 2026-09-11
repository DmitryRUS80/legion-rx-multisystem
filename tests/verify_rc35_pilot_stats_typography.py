from pathlib import Path
import re, sys
ROOT=Path(__file__).resolve().parents[1]
css=(ROOT/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
checks={
 'same_authoritative_component': views.count('rxnPilotStatsSheet')>=1 and 'function pilotLapStatsModal' in views,
 'metric_labels_large': '.rxnPilotStatsMetrics small{font:700 15px/.95' in css and '.rxnPilotStatsMetrics small{font-size:13px}' in css,
 'metric_values_close': 'grid-template-columns:82px auto' in css and 'grid-template-columns:58px auto' in css,
 'race_line_larger': 'font:700 12px/1 var(--rxn-font)' in css and '.rxnPilotStatsRaceLine small{color:var(--rxn-muted);font:700 10px/1' in css,
 'phone_race_labels_visible': '.rxnPilotStatsRaceLine small{display:inline;font-size:8px}' in css,
 'lap_header_larger': '.rxnPilotStatsLapHead{min-height:20px' in css and 'font:700 10px/1' in css,
 'lap_numbers_larger': '.rxnPilotStatsLapNo{font:700 17px/1' in css and '.rxnPilotStatsLap strong{font:800 20px/1' in css,
 'lap_tags_readable': '.rxnPilotStatsLap em{justify-self:start;font:700 11px/1' in css and '.rxnPilotStatsLap em{font-size:9px}' in css,
 'tight_row_height': '.rxnPilotStatsLap{position:relative;min-height:34px' in css and '.rxnPilotStatsLap{min-height:30px}' in css,
 'portrait_narrower': '@media (orientation:portrait)' in css and 'width:clamp(260px,58%,420px)' in css,
 'best_green': '.rxnPilotStatsLap.best strong,.rxnPilotStatsLap.best em{color:var(--rxn-green)}' in css,
 'worst_red': '.rxnPilotStatsLap.worst strong,.rxnPilotStatsLap.worst em{color:var(--rxn-red)}' in css,
 'average_unhighlighted': '.rxnPilotStatsLap.average' not in css and "class='average'" not in views,
 'no_new_stats_container_names': 'rxnPilotStatsV2' not in css+views and 'pilotStatsPatch' not in css+views,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(f"{'PASS' if v else 'FAIL'} {k}")
print(f"RC35 pilot stats typography: {len(checks)-len(failed)}/{len(checks)} PASS")
sys.exit(2 if failed else 0)
