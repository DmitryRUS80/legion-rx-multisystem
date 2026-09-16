from pathlib import Path
import hashlib,re,sys
ROOT=Path(__file__).resolve().parents[1]
checks={}
classic_sport=[ROOT/'modes/classic-rc/efra-rules.js',ROOT/'modes/classic-rc/groups.js',ROOT/'modes/classic-rc/efra-engine.js',ROOT/'modes/classic-rc/efra-runtime.js']
rally=list((ROOT/'modes/rallycross').glob('*.js'))
classic='\n'.join(p.read_text(encoding='utf-8') for p in classic_sport)
rally_text='\n'.join(p.read_text(encoding='utf-8') for p in rally)
scheduler=(ROOT/'runtime/competition-scheduler.js').read_text(encoding='utf-8')
checks['classic_no_rallycross_state_or_rules']=not re.search(r'\bSPORT_RULES\b|\bstate\.race\b|\bRallyCross\w*\b|\brxRace\w*\b',classic)
checks['rallycross_no_classic_refs']='ClassicRC' not in rally_text and 'classic-rc' not in rally_text
checks['scheduler_is_sport_neutral']=not re.search(r'RallyCross|ClassicRC|qualif|finalStandings|SPORT_RULES',scheduler,re.I)
checks['classic_runtime_no_dom']=not re.search(r'\bdocument\.|querySelector|innerHTML|classList|getElementById', (ROOT/'modes/classic-rc/efra-runtime.js').read_text(encoding='utf-8'))
checks['classic_sport_no_ui_helpers']=not re.search(r'\brxn[A-Z]\w*|\buiIcon\b|\braceSvg\b',classic)
checks['neutral_controller_selects_at_shell_boundary']='state.view' in (ROOT/'runtime/active-race-controller.js').read_text(encoding='utf-8')
checks['classic_own_storage_namespace']='legionrx4_classic_rc_efra_event_v1' in (ROOT/'modes/classic-rc/efra-engine.js').read_text(encoding='utf-8')
checks['classic_index_placeholder_untouched']=hashlib.sha256((ROOT/'modes/classic-rc/index.js').read_bytes()).hexdigest()=='ade4c33308e6d31ec1987d61635058917aea54c9fc0a8bd476cc824407af9bb4'
checks['schedule_overlay_not_layout']='position:fixed' in (ROOT/'ui/classic-rc/classic-rc.css').read_text(encoding='utf-8') and '.classicScheduleDrawer' in (ROOT/'ui/classic-rc/classic-rc.css').read_text(encoding='utf-8')
checks['portrait_bottom_sheet']='orientation:portrait' in (ROOT/'ui/classic-rc/classic-rc.css').read_text(encoding='utf-8')
checks['landscape_right_drawer']='orientation:landscape' in (ROOT/'ui/classic-rc/classic-rc.css').read_text(encoding='utf-8')
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
sys.exit(0 if all(checks.values()) else 2)
