from pathlib import Path
import sys,re
ROOT=Path(__file__).resolve().parents[1]
sim=(ROOT/'simulation/race-simulator.js').read_text(encoding='utf-8')
ui=(ROOT/'ui/discipline-ui.js').read_text(encoding='utf-8')
rt=(ROOT/'modes/rallycross/runtime.js').read_text(encoding='utf-8')
actions=(ROOT/'ui/shell/actions.js').read_text(encoding='utf-8')
css=(ROOT/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')+(ROOT/'ui/shell/app.css').read_text(encoding='utf-8')
checks={
 'isolated_module': 'class LegionRaceSimulator' in sim and 'document.' not in sim and 'innerHTML' not in sim,
 'three_scenarios': all(x in sim for x in ["'normal'","'positions'","'dense'"]),
 'speeds': all(x in ui for x in ['[1,2,4,8]','data-sim-speed']),
 'lap_range': 'simLapMin' in ui and 'simLapMax' in ui,
 'lapwiz_gate': '!lapwiz.connected' in ui and "Сначала выключите SIM" in actions,
 'timer_location': 'rxnTimerClassRow' in ui and 'rxnSimulatorButton' in ui,
 'runtime_bridge': 'startRaceSimulationForCurrentSession' in rt and "processPilotPass(p,null,'SIMULATOR')" in rt and 'processSimulationWarmupPass' in rt,
 'clock_scale': 'raceClockScale' in rt and 'simulationScale' in rt,
 'result_status': "l.simStatus==='DNF'" in ui and "l.simStatus==='DNS'" in ui,
 'theme_styles': '.rxnSimulatorModal' in css and '.rxnSimulatorButton' in css,
}
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
sys.exit(0 if all(checks.values()) else 2)
