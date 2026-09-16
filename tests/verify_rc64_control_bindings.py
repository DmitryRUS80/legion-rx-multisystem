from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ui=(ROOT/'ui/classic-rc/classic-rc-ui.js').read_text(encoding='utf-8')
css=(ROOT/'ui/classic-rc/classic-rc.css').read_text(encoding='utf-8')
actions=['start','pause','finish','restart','results','stop','schedule','sim-settings','sim-speed','start-early','director-finish','heat-settings','heat-settings-apply','skip-heat','skip-break','break-minus','break-plus-one','break-plus','competition-stop','competition-resume']
checks={}
for a in actions:
    checks[f'action_markup_or_handler_{a}']=f"a==='{a}'" in ui or f'data-classic-action="{a}"' in ui
checks.update({
 'schedule_scrim_conditional_only': "${classicScheduleOpen?`<div class=\"classicScheduleScrim\"" in ui and ui.count('classicScheduleScrim')==1,
 'status_not_fixed_overlay': '.classicRCCockpit .classicScheduleStatus{' in css and '.classicRCCockpit .classicScheduleStatus{position:fixed' not in css,
 'cockpit_controls_not_restyled': '.rxnControl{' not in css[css.rfind('/* RC64 · compact race-state strip'):],
 'status_keyboard_activation': "e.key==='Enter'||e.key===' '" in ui,
})
fail=False
for k,v in checks.items():
    print(f'{k}: {"PASS" if v else "FAIL"}')
    fail|=not v
raise SystemExit(2 if fail else 0)
