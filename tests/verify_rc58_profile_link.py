from pathlib import Path
R=Path(__file__).resolve().parents[1]
views=(R/'ui/shell/views.js').read_text(encoding='utf-8')
pilots=(R/'ui/pilots/pilot-cards.js').read_text(encoding='utf-8')
css=(R/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
app=(R/'ui/shell/app.css').read_text(encoding='utf-8')
checks={
 'no_big_stats_edit_button':'РЕДАКТИРОВАТЬ ПИЛОТА' not in views and 'rxnPilotStatsEdit{' not in css,
 'pencil_in_stats_identity':'data-race-pilot-profile' in views and "pilotCardIcon('edit','rxnPilotStatsEditIcon')" in views and '.rxnPilotStatsProfileEdit' in css,
 'opens_authoritative_profile':'pilotModal(profile,false,origin)' in views and 'racePilotEditModal' not in views,
 'normal_profile_syncs_active_race':'pilotRaceEntryForProfile(id)' in pilots and 'updateActiveRacePilotIdentity(racePilot.id' in pilots and 'persistRace()' in pilots,
 'transponder_conflict_guard':'Транспондер ${nextTransponder} уже используется' in pilots,
 'temporary_editor_css_removed':'rxnRacePilotEditModal' not in app,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(f'{k}:', 'PASS' if v else 'FAIL')
if failed: raise SystemExit('RC58 profile link failed: '+', '.join(failed))
print('RC58 PILOT PROFILE LINK: PASS')
