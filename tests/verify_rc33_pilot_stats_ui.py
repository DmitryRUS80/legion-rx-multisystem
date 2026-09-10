from pathlib import Path
import re, sys
ROOT=Path(__file__).resolve().parents[1]
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
css=(ROOT/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
app=(ROOT/'ui/shell/app.css').read_text(encoding='utf-8')
checks={
 'single_stats_entrypoint': views.count("function pilotLapStatsModal(")==1,
 'race_position_uses_authoritative_live_ranking': 'liveRanking(RallyCrossModeAPI.startPilots(state.race,ev),state.session)' in views,
 'practice_position_uses_track_ranking': 'const ranked=rankTrackPilots(td)' in views,
 'cockpit_bounds_come_from_roster': "document.querySelector('.rxnCockpit .rxnRoster')" in views and 'getBoundingClientRect()' in views,
 'uses_shared_pilot_avatar_team_flag': all(x in views for x in ["pilotAvatarMarkup(p,'rxnPilotStatsAvatar')",'pilotTeamBadge(p)','pilotFlagBadge(p)']),
 'practice_lap_delete_preserved': 'data-track-lap-remove="1"' in views and 'removeTrackDayLap' in views,
 'overlay_remains_authoritative': 'PILOT LAP STATS · AUTHORITATIVE LIVE BROADCAST CARD' in css,
 'legacy_stats_markup_removed': not any(x in views for x in ['lapSummaryGrid','lapStatsModal','lapBest','lapAverage','lapWorst','lapJudgeNote','lapRemoveBtn']),
 'legacy_stats_css_removed_from_app': not any(x in app for x in ['.lapSummaryGrid','.lapStatsModal','.lapBest','.lapAverage','.lapWorst','.lapTableWrap']),
 'legacy_stats_css_removed_from_pult': not any(x in css for x in ['.lapStatsModal','.lapJudgeNote','.lapRemoveBtn','.lapCorrectionLog']),
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(f"{'PASS' if v else 'FAIL'} {k}")
print(f"RC33 preserved pilot-stats foundation: {len(checks)-len(failed)}/{len(checks)} PASS")
sys.exit(2 if failed else 0)
