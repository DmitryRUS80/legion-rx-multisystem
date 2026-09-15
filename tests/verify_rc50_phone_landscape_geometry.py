from pathlib import Path
R=Path(__file__).resolve().parents[1]
css=(R/'ui/shell/discipline-pults.css').read_text()
cobalt=(R/'ui/skins/rxui/cobalt.css').read_text()
sw=(R/'sw.js').read_text()
ver=(R/'VERSION.txt').read_text()
assert 'orientation:landscape' in css and 'max-width:1100px' in css and 'max-height:600px' in css
assert '--rxn-top-h:37px' in css
assert '.rxnTopActions{height:34px' in css
assert '.rxnTimerCopy>span.rxnTimerClass{font-size:15px}' in css
assert '.rxnTimerCopy small{margin-top:8px}' in css
assert '.rxnRing b{font-size:17px}' in css
assert '.rxnPilotData{font-size:20px}' in css
assert '.rxnPilotData .rxnGap,.rxnPilotData .rxnCheck,.rxnPilotData .rxnBest,.rxnPilotData .rxnAvg,.rxnPilotData .rxnLast,.rxnPilotData .rxnLaps{font-size:20px' in css
assert 'font-size:.75em' in css
ui=(R/'ui/discipline-ui.js').read_text()
assert "digits!==3" in ui and 'rxnMillis' in ui
assert 'color:currentColor' in css
assert 'grid-template-rows:minmax(0,1fr) 44px' in css
assert 'grid-template-rows:22px 18px' in css
# Theme CSS must not own responsive cockpit geometry anymore.
assert '.rxnControlPanel{gap:7px!important}' not in cobalt
assert '@media (min-width:1400px)' not in cobalt
assert 'RC57' in ver
assert 'rc57-session-control' in sw
print('RC50 PHONE LANDSCAPE GEOMETRY: PASS')
