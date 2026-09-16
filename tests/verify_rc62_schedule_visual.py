from pathlib import Path
import re, sys
ROOT=Path(__file__).resolve().parents[1]
css=(ROOT/'ui/classic-rc/classic-rc.css').read_text(encoding='utf-8')
checks={
 'schedule_is_fixed_overlay':'.classicScheduleTail{position:fixed' in css and '.classicScheduleDrawer{position:fixed' in css,
 'schedule_not_layout_column':'grid-template-columns:minmax(0,1fr) var(--classic' not in css,
 'schedule_uses_theme_tokens':'--classic-schedule-bg:var(--rxn-panel)' in css and 'html:not([data-skin="classic"]) .classicRCCockpit' in css and '--classic-schedule-accent:var(--rxui-accent)' in css,
 'drawer_token_painted':'background:color-mix(in srgb,var(--classic-schedule-bg) 97%,transparent)' in css and 'border:1px solid var(--classic-schedule-line-strong)' in css,
 'primary_follows_skin':'background:var(--classic-schedule-primary)' in css and 'color:var(--classic-schedule-primary-text)' in css,
 'no_old_neon_schedule_blue':'#102330' not in css and '#17364a' not in css and '#0b2131' not in css,
 'portrait_bottom_sheet':'@media (orientation:portrait) and (max-width:599px)' in css and 'height:min(62dvh,520px)' in css and 'left:3px;right:3px;bottom:3px' in css,
 'phone_landscape_right_overlay':'@media (orientation:landscape) and (max-width:1100px) and (max-height:600px)' in css and 'width:44vw;max-width:410px' in css,
 'setup_selection_theme_aware':'color-mix(in srgb,var(--blue) 12%,var(--panel))' in css,
 'plan_stats_theme_aware':'color-mix(in srgb,var(--blue) 58%,transparent)' in css,
}
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
sys.exit(0 if all(checks.values()) else 2)
