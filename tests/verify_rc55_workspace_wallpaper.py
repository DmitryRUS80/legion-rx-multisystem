from pathlib import Path
R=Path(__file__).resolve().parents[1]
base=(R/'ui/skins/rxui/base.css').read_text()
app=(R/'ui/shell/app.css').read_text()
om=(R/'offline-manifest.js').read_text()
assert "workspace-landscape.webp" in base
assert "workspace-portrait.webp" in base
assert "html:not([data-skin=\"classic\"]) body:not(.cockpitMode)" in base
assert ".heroPanel.homeHeroPanel::before{display:none!important" in base
assert "home-wallpaper.png" not in app
assert "workspace-landscape.webp" in om and "workspace-portrait.webp" in om
assert (R/'ui/skins/rxui/workspace-landscape.webp').exists()
assert (R/'ui/skins/rxui/workspace-portrait.webp').exists()
print('RC55 WORKSPACE WALLPAPER PASS')
