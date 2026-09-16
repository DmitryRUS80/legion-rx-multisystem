from pathlib import Path
R=Path(__file__).resolve().parents[1]
css=(R/'ui/classic-rc/classic-rc.css').read_text()
ui=(R/'ui/classic-rc/classic-rc-ui.js').read_text()
checks={
 'tail_fixed_override':'/* RC66 · Schedule overlay isolation / stable hit areas. UI-only. */' in css and 'position:fixed!important' in css,
 'tail_hidden_when_open':'.classicScheduleTail.open{opacity:0;visibility:hidden;pointer-events:none}' in css,
 'drawer_fixed':'.classicScheduleDrawer{position:fixed!important' in css,
 'scrim_fixed':'.classicScheduleScrim{position:fixed!important' in css,
 'portrait_tail_fixed':'bottom:126px' in css and 'transform:none' in css,
 'direct_binding':'function classicRCBindActionElement' in ui and "dataset.classicBound='1'" in ui,
 'no_old_delegate':'classicRCEnsureDelegatedBindings' not in ui,
 'buttons_explicit':'type="button" class="classicScheduleAction' in ui,
}
fail=False
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}'); fail|=not v
raise SystemExit(2 if fail else 0)
