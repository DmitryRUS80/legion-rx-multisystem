from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def text(p): return (ROOT/p).read_text(encoding='utf-8')
ui=text('ui/classic-rc/classic-rc-ui.js')
css=text('ui/classic-rc/classic-rc.css')
rt=text('modes/classic-rc/efra-runtime.js')
eng=text('modes/classic-rc/efra-engine.js')
ctl=text('runtime/active-race-controller.js')
ad=text('runtime/race-test-source-adapter.js')
checks={
 'live_next_event_timer':'classicRCScheduleStatusStrip' in ui and 'data-classic-schedule-countdown' in ui,
 'director_finish':'data-classic-action="director-finish"' in ui,
 'heat_settings':'data-classic-action="heat-settings"' in ui and 'updateCurrentHeatSettings' in eng,
 'skip_heat':'data-classic-action="skip-heat"' in ui and 'skipCurrentEvent' in eng,
 'competition_hold':'competition-stop' in ui and 'competition-resume' in ui and 'pauseCompetition' in eng and 'resumeCompetition' in eng,
 'break_shortening':'break-minus' in ui and 'adjustScheduleBreak' in eng,
 'classic_sim_controls':'sim-settings' in ui and 'sim-speed' in ui and 'cycleSimulationSpeed' in rt,
 'classic_uses_neutral_test_adapter':'raceTestSourceAdapter.startSession' in rt and 'raceSimulator' not in rt,
 'scaled_race_clock':'testScale()' in rt and 'runtimeClock' in rt and 'rawNowEpoch' in rt,
 'scaled_schedule_clock':'ClassicRCRuntime.nowEpoch()' in ui,
 'sim_status_routed_to_classic':'ClassicRCRuntime.processPilotStatus' in ctl,
 'sim_complete_routed_to_classic':'ClassicRCRuntime.handleSourceComplete' in ctl,
 'adapter_config_surface':'getConfig()' in ad and 'configure(config' in ad and 'enable(config' in ad,
 'portrait_drawer_clears_bottom_nav':'bottom:58px' in css,
 'no_neon_director_layer':'box-shadow:0 0 20px' not in css,
 'schedule_overlay_fixed':'.classicScheduleDrawer{position:fixed' in css,
}
fail=False
for k,v in checks.items():
 print(f'{k}: {"PASS" if v else "FAIL"}')
 fail|=not v
raise SystemExit(2 if fail else 0)
