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
checks['new_cache_namespace']='rc25-compact-pilot-grid' in cfg

# All sport modules must remain byte-identical to the RC21 accepted base.
expected_modes={'modes/classic-rc/index.js': 'ade4c33308e6d31ec1987d61635058917aea54c9fc0a8bd476cc824407af9bb4', 'modes/free-practice/index.js': 'aa43d3a87f0e9286635dbb5bbcfc7647dac310ea30d24af80bb9fe9cdd20845a', 'modes/rally-sprint/index.js': '1f72a94e0f765212b98bd7af6b24589c1108001bcfaa9fcfc3db7fd97b025a71', 'modes/rallycross/audio-actions.js': 'f2d9ccfc4bcdb85bb759840153c9e844787dfcaca2f6a9c723cec3b38875f67a', 'modes/rallycross/finals.js': '160a93c2cd3ddfa58fbb7b661578076ba6b7a4904f915e966a2e41007d4e8bb1', 'modes/rallycross/index.js': 'c9fb3c90f8dab5233d98dfa55384aa6c4329c9d38b53a547340e9ed44ff94386', 'modes/rallycross/qualifying.js': '15ba4a3768a3d389b2c968032935ac809f2bad551e4206c658c1b997c3ba3be9', 'modes/rallycross/rules.js': '80c8a70c6d9e4bf51c0f7838a9dd0f519fb79f5e0d169f7ab4138ff0a188e3a0', 'modes/rallycross/runtime.js': '608b9e54ec3e7b288fec5824f37621a1555bf639115f6047bbaf29e81f1eebfd', 'modes/rallycross/self-test.js': '004f5e6f4d5adfc9dd37af3050cb4a7e3b486b36cd9b157fada9879482800037'}
changed=[]
for rel,want in expected_modes.items():
    p=ROOT/rel
    got=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else 'MISSING'
    if got!=want: changed.append(rel)
checks['all_sport_modules_byte_identical_to_rc21']=not changed
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
if changed: print('sport changes:',changed)
sys.exit(0 if all(checks.values()) else 2)
