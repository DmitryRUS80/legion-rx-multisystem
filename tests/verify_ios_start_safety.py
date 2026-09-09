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
checks['new_cache_namespace']='rc21-ios-start-safety' in cfg

# All sport modules must remain byte-identical to RC20 clean foundation.
rc20=Path('/mnt/data/rc20x/Legion_RX_4.2.0_CLEAN_FULL_APP_RC20_CLEAN_FOUNDATION')
changed=[]
for p in (ROOT/'modes').rglob('*.js'):
    rel=p.relative_to(ROOT); old=rc20/rel
    if not old.exists() or hashlib.sha256(p.read_bytes()).digest()!=hashlib.sha256(old.read_bytes()).digest(): changed.append(str(rel))
checks['all_sport_modules_byte_identical_to_rc20']=not changed
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if changed: print('sport changes:',changed)
sys.exit(0 if all(checks.values()) else 2)
