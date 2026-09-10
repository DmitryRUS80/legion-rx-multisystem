from pathlib import Path
import re, sys
ROOT=Path(__file__).resolve().parents[1]
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
css=(ROOT/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
app=(ROOT/'ui/shell/app.css').read_text(encoding='utf-8')
checks={
 'single_stats_function': views.count("function pilotLapStatsModal(")==1,
 'race_position_uses_authoritative_live_ranking': 'liveRanking(RallyCrossModeAPI.startPilots(state.race,ev),state.session)' in views,
 'practice_position_uses_track_ranking': 'const ranked=rankTrackPilots(td)' in views,
 'cockpit_bounds_come_from_roster': "document.querySelector('.rxnCockpit .rxnRoster')" in views and 'getBoundingClientRect()' in views,
 'cockpit_overlay_has_position_best_avg': all(x in views for x in ['МЕСТО','ЛУЧШИЙ КРУГ','СРЕДНИЙ КРУГ']),
 'uses_shared_pilot_avatar_team_flag': all(x in views for x in ["pilotAvatarMarkup(p,'rxnPilotStatsAvatar')",'pilotTeamBadge(p)','pilotFlagBadge(p)']),
 'practice_lap_delete_preserved': 'data-track-lap-remove="1"' in views and 'removeTrackDayLap' in views,
 'new_overlay_is_authoritative': 'PILOT LAP STATS · AUTHORITATIVE COCKPIT OVERLAY' in css,
 'best_row_green': '.rxnPilotStatsLap.best' in css and 'var(--rxn-green)' in css,
 'average_row_yellow': '.rxnPilotStatsLap.average' in css and 'var(--rxn-yellow)' in css,
 'worst_row_magenta': '.rxnPilotStatsLap.worst' in css and 'var(--rxn-magenta)' in css,
 'hero_metrics_normal_foreground': re.search(r'\.rxnPilotStatsMetrics b\{[^}]*color:var\(--rxn-text\)',css) is not None,
 'background_is_soft_blur_not_blackout': '.rxnPilotStatsDim' in css and 'backdrop-filter:blur(2px)' in css and 'background:color-mix(in srgb,var(--rxn-bg) 28%,transparent)' in css,
 'legacy_stats_markup_removed': not any(x in views for x in ['lapSummaryGrid','lapStatsModal','lapBest','lapAverage','lapWorst','lapJudgeNote','lapRemoveBtn']),
 'legacy_stats_css_removed_from_app': not any(x in app for x in ['.lapSummaryGrid','.lapStatsModal','.lapBest','.lapAverage','.lapWorst','.lapTableWrap']),
 'legacy_stats_css_removed_from_pult': not any(x in css for x in ['.lapStatsModal','.lapJudgeNote','.lapRemoveBtn','.lapCorrectionLog']),
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(f"{'PASS' if v else 'FAIL'} {k}")
print(f"RC33 pilot lap stats UI: {len(checks)-len(failed)}/{len(checks)} PASS")
sys.exit(2 if failed else 0)
