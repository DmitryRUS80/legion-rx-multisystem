from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def text(p): return (ROOT/p).read_text(encoding='utf-8')
ui=text('ui/classic-rc/classic-rc-ui.js')
css=text('ui/classic-rc/classic-rc.css')
checks={
 'countdown_rounded_to_whole_seconds': 'Math.ceil((Number(ms)||0)/1000)' in ui,
 'compact_state_semantics': all(x in ui for x in ["state:'ЗАЕЗД ИДЁТ'","state:started?'ПАУЗА'","state:ready?'ГОТОВ К СТАРТУ':'ОЖИДАНИЕ'"]),
 'next_event_visible': 'classicScheduleNext' in ui and 'countdownLabel' in ui,
 'cockpit_status_opens_schedule': 'classicRCScheduleStatusStrip(true)' in ui and 'data-classic-action="schedule"' in ui,
 'desktop_side_has_three_explicit_rows': '.classicRCCockpit .rxnSide{' in css and 'grid-template-rows:38px minmax(145px,34%) minmax(0,1fr)' in css,
 'phone_landscape_three_rows': 'grid-template-rows:27px 100px minmax(0,1fr)' in css,
 'status_is_compact': 'height:38px;min-height:38px' in css and 'height:27px;min-height:27px' in css,
 'drawer_remains_overlay': '.classicScheduleDrawer{position:fixed' in css,
 'no_hidden_screen_layer_when_closed': "classicScheduleOpen?`<div class=\"classicScheduleScrim\"" in ui,
}
fail=False
for k,v in checks.items():
 print(f'{k}: {"PASS" if v else "FAIL"}')
 fail|=not v
raise SystemExit(2 if fail else 0)
