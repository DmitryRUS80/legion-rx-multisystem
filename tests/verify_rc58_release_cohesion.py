from pathlib import Path
R=Path(__file__).resolve().parents[1]
ver=(R/'VERSION.txt').read_text(encoding='utf-8')
om=(R/'offline-manifest.js').read_text(encoding='utf-8')
sw=(R/'sw.js').read_text(encoding='utf-8')
views=(R/'ui/shell/views.js').read_text(encoding='utf-8')
pilots=(R/'ui/pilots/pilot-cards.js').read_text(encoding='utf-8')
css=(R/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
checks={
 'version_rc58':'RC58 · PILOT PROFILE LINK' in ver,
 'manifest_rc58':'4.2.0-clean-full-rc58-pilot-profile-link' in om and 'RC58 · PILOT PROFILE LINK' in om,
 'sw_rc58':"LEGION_SW_BUILD='rc58-pilot-profile-link'" in sw and 'build=rc58-pilot-profile-link' in sw,
 'views_fresh':'data-race-pilot-profile' in views and 'racePilotEditModal' not in views,
 'pilot_cards_fresh':'updateActiveRacePilotIdentity(racePilot.id' in pilots,
 'css_fresh':'.rxnPilotStatsProfileEdit' in css,
 'fresh_required':"'./ui/pilots/pilot-cards.js'" in sw and "'./ui/shell/views.js'" in sw and "'./ui/shell/discipline-pults.css'" in sw,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(f'{k}:', 'PASS' if v else 'FAIL')
if failed: raise SystemExit('RC58 release cohesion failed: '+', '.join(failed))
print('RC58 RELEASE COHESION: PASS')
