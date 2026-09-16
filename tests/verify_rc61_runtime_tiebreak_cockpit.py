from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[1]
rt=(ROOT/'modes/rallycross/runtime.js').read_text(encoding='utf-8')
fin=(ROOT/'modes/rallycross/finals.js').read_text(encoding='utf-8')
boot=(ROOT/'boot.js').read_text(encoding='utf-8')
sim=(ROOT/'simulation/race-simulator.js').read_text(encoding='utf-8')
idx=(ROOT/'index.html').read_text(encoding='utf-8')
ui=(ROOT/'ui/discipline-ui.js').read_text(encoding='utf-8')
css=(ROOT/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
manifest=(ROOT/'offline-manifest.js').read_text(encoding='utf-8')
checks={
 'runtime_has_no_simulator_dependency':'raceSimulator' not in rt and 'raceSimulationActive' not in rt and 'startRaceSimulationForCurrentSession' not in rt,
 'runtime_uses_neutral_adapters':all(x in rt for x in ['raceTestSourceAdapter','raceClockAdapter','startRaceTestSourceForCurrentSession','processRaceSourceStatus']),
 'lapwiz_and_test_use_same_bus':'raceEventBus.pass' in boot and "source:'LAPWIZ'" in boot and 'raceEventBus.pass' in (ROOT/'runtime/race-test-source-adapter.js').read_text(),
 'simulator_registers_only_at_adapter':'raceTestSourceAdapter.register' in sim,
 'adapter_load_order':idx.find('runtime/race-event-bus.js')<idx.find('simulation/race-simulator.js')<idx.find('modes/rallycross/runtime.js'),
 'clock_adapter_separate':'raceClockAdapter.setScaleProvider' in (ROOT/'runtime/race-test-source-adapter.js').read_text() and 'raceClockAdapter' in (ROOT/'runtime/race-clock-adapter.js').read_text(),
 'no_hidden_time_final_tiebreak':'compareRunPerformance' not in fin and 'elapsedMs' not in fin and 'thirdResult' in fin and 'discarded third result' in fin,
 'cockpit_finish_label':"return'ДО ФИНИША'" in ui and 'function rxnRaceDistanceText' in ui and 'ЗАЕЗД ${r.targetLaps} КРУГОВ' in ui and 'ЗАЕЗД ${r.durationMin} МИН' in ui,
 'best_lap_has_name_and_time':'data-rxn-best-name' in ui and 'data-rxn-best-time' in ui and 'rxnBestLapPilot' in css,
 'system_clock_responsive':'function rxnSystemClockText' in ui and '.rxnSystemClock' in css and '.rxnMobileRaceInfo' in css and '@media (orientation:portrait)' in css,
 'offline_includes_adapters':all(x in manifest for x in ['./runtime/race-event-bus.js','./runtime/race-clock-adapter.js','./runtime/race-test-source-adapter.js']),
}
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
sys.exit(0 if all(checks.values()) else 2)
