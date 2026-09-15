from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[1]
router=(ROOT/'ui/shell/router.js').read_text(encoding='utf-8')
base=(ROOT/'ui/skins/rxui/base.css').read_text(encoding='utf-8')
app=(ROOT/'ui/shell/app.css').read_text(encoding='utf-8')
index=(ROOT/'index.html').read_text(encoding='utf-8')
checks={
 'classic_renderer_exists':'function homeViewClassic()' in router,
 'rxui_renderer_exists':'function homeViewRxui()' in router,
 'theme_dispatch':"(state.settings.uiSkin||'classic')==='classic'?homeViewClassic():homeViewRxui()" in router,
 'new_skin_css_excludes_classic':'html:not([data-skin="classic"])' in base and 'html:not([data-skin="classic"])' in app,
 'index_no_style_block':'<style' not in index.lower(),
 'index_no_inline_app_script':not re.search(r'<script(?![^>]*\bsrc=)[^>]*>',index,re.I),
 'index_loads_modular_shell':'ui/shell/router.js' in index and 'ui/shell/app.css' in index,
 'wallpaper_is_asset':(ROOT/'ui/skins/rxui/home-wallpaper.png').exists() or ((ROOT/'ui/skins/rxui/workspace-landscape.webp').exists() and (ROOT/'ui/skins/rxui/workspace-portrait.webp').exists()),
}
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
sys.exit(0 if all(checks.values()) else 2)
