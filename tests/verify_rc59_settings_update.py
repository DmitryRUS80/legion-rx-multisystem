from pathlib import Path
R=Path(__file__).resolve().parents[1]
read=lambda rel:(R/rel).read_text(encoding='utf-8')
idx=read('index.html'); views=read('ui/shell/views.js'); actions=read('ui/shell/actions.js'); app=read('ui/shell/app.css'); base=read('ui/skins/rxui/base.css'); updater=read('platform/updater.js'); runtime=read('ui/shell/offline-runtime.js'); router=read('ui/shell/router.js'); boot=read('boot.js'); sw=read('sw.js'); om=read('offline-manifest.js'); ver=read('VERSION.txt')
checks={
 'design_lab_removed_index':'designQuickBtn' not in idx and 'Design Lab' not in idx,
 'design_lab_removed_settings':'Design Lab' not in views and 'openDesignLab' not in views and 'open-design-lab' not in actions,
 'design_lab_css_removed':'.designQuickBtn' not in app and '.designDrawer' not in app and '.designQuickBtn' not in base,
 'settings_no_forced_general':"id==='general'?'active'" not in views and "settingsSection('general','Общие',general,true)" not in views,
 'settings_selection_storage':'legionrx_settings_section' in views and 'legionrx_settings_section' in actions and "sessionStorage.removeItem('legionrx_settings_section')" in router,
 'progress_markup':'data-update-progress' in views and 'data-update-progress-bar' in views,
 'progress_runtime':"LEGION_UPDATE_PROGRESS" in updater and "[data-update-progress]" in runtime,
 'sw_progress':"broadcastUpdateProgress" in sw and "LEGION_UPDATE_PROGRESS" in sw,
 'install_resume':'legionrx_resume_settings_section' in updater and 'legionrx_resume_settings_section' in boot and 'legionrx_post_update' in updater,
 'release_version':'RC59 · SETTINGS UPDATE UX' in ver and '4.2.0-clean-full-rc59-settings-update-ux' in om and "LEGION_SW_BUILD='rc59-settings-update-ux'" in sw,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items():print(f'{k}:', 'PASS' if v else 'FAIL')
if failed:raise SystemExit('RC59 settings/update UX failed: '+', '.join(failed))
print('RC59 SETTINGS/UPDATE UX: PASS')
