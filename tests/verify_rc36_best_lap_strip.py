from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
ui=(ROOT/'ui/discipline-ui.js').read_text(encoding='utf-8')
css=(ROOT/'ui/shell/discipline-pults.css').read_text(encoding='utf-8')
checks={
 'leader_hero_markup_removed':'rxnLeaderHero' not in ui,
 'leader_hero_style_removed':'rxnLeaderHero' not in css and '--rxn-hero-photo-bg' not in css,
 'best_lap_strip_function':'function rxnBestLapStrip(pilots,s)' in ui,
 'best_lap_label':'<small>BEST LAP</small>' in ui,
 'best_lap_live_time':'id="rxnBestLapTime"' in ui and "set('#rxnBestLapTime'" in ui,
 'trophy_removed_from_strip':"raceSvg('trophy')" not in ui.split('function rxnBestLapStrip',1)[1].split('function rxnRaceBannerData',1)[0],
 'old_leader_wording_removed':'ЛИДЕР · ЛУЧШИЙ КРУГ' not in ui,
 'old_leader_strip_removed':'rxnLeaderStrip' not in ui+css,
 'single_authoritative_style':css.count('.rxnBestLapStrip{')>=1 and 'rxnBestLapStrip>svg' not in css,
 'live_source_preserved':'function rxnBestLapLeader(pilots,s)' in ui,
 'portrait_contract_preserved':css.count('.rxnBestLapStrip{display:none}')==2,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(f"{'PASS' if v else 'FAIL'} {k}")
print(f"RC36 best-lap/hero cleanup: {len(checks)-len(failed)}/{len(checks)} PASS")
sys.exit(2 if failed else 0)
