from pathlib import Path
import re, hashlib, sys
ROOT=Path(__file__).resolve().parents[1]
checks={}
actions=(ROOT/'ui/shell/actions.js').read_text(encoding='utf-8')
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
off=(ROOT/'ui/shell/offline-runtime.js').read_text(encoding='utf-8')
audio=(ROOT/'platform/audio.js').read_text(encoding='utf-8')

start=re.search(r"if\(action==='start-session'\)([^\n]+)",actions)
checks['race_start_not_blocked_by_audio']=bool(start and 'ensureRaceAudioFromGesture' not in start.group(0) and 'beginCountdown()' in start.group(0))
for name,pat in [('race_lapwiz',r"if\(action==='lap-connect'\).*?return;"),('track_lapwiz',r"if\(a==='lap-connect'\).*?return;")]:
    m=re.search(pat,actions,re.S); checks[name+'_not_blocked_by_announcer']=bool(m and 'ensureRaceAudioFromGesture' not in m.group(0) and 'lapwiz.connect()' in m.group(0))
track=re.search(r'async function startTrackDayFromUI\(\).*?\n}',views,re.S)
checks['trackday_start_not_blocked_by_audio']=bool(track and 'ensureRaceAudioFromGesture' not in track.group(0))
checks['safari_two_tap_after_hydration']="Нажмите «Включить звук» ещё раз" in off and 'return false;' in off
checks['locked_audio_is_nonblocking']=audio.count('if(!this.unlocked)return false;')>=2 and "Сначала включите звук одним касанием" not in audio
cfg=(ROOT/'offline-manifest.js').read_text(encoding='utf-8')
checks['new_cache_namespace']='rc34-live-pilot-stats-broadcast' in cfg

checks['ios_finish_uses_in_app_confirm']="action==='complete-competition'" in actions and 'competitionFinishConfirmModal()' in actions
views=(ROOT/'ui/shell/views.js').read_text(encoding='utf-8')
app=(ROOT/'app.js').read_text(encoding='utf-8')
checks['ios_finish_confirm_commits_without_native_dialog']='finishCompetitionConfirm' in views and 'completeCompetition(true)' in views and 'function completeCompetition(confirmed=false)' in app

# RC33 is UI-only over RC32. Unrelated modes and platform audio remain byte-identical.
expected_modes={'modes/classic-rc/index.js': 'ade4c33308e6d31ec1987d61635058917aea54c9fc0a8bd476cc824407af9bb4', 'modes/free-practice/index.js': 'aa43d3a87f0e9286635dbb5bbcfc7647dac310ea30d24af80bb9fe9cdd20845a', 'modes/rally-sprint/index.js': '1f72a94e0f765212b98bd7af6b24589c1108001bcfaa9fcfc3db7fd97b025a71', 'platform/audio.js':'1ffb1838fda888f6c9e213866f6fd20f3b7b6e402ba72fe56740fc3c5cd9dcb7'}
changed=[]
for rel,want in expected_modes.items():
    p=ROOT/rel
    got=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else 'MISSING'
    if got!=want: changed.append(rel)
checks['unrelated_sport_and_platform_audio_unchanged']=not changed
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if changed: print('unexpected changes:',changed)
sys.exit(0 if all(checks.values()) else 2)
