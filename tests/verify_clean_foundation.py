from pathlib import Path
import hashlib,re,sys
ROOT=Path(__file__).resolve().parents[1]
checks={}

expected={
'app.js':'23f6f23ed9bfca4dbfb72cd065a11ebcdd13b405193edcdf77e7990cfaf37cef',
'platform/lapwiz.js':'d0f9af187e90114edf671827c9365e7d28130809ba1926cfa11efd30f8c3c644',
'platform/pilots.js':'9447a63d5fef07aed6c28407844372ab9d7d0f9afdba5c48ed0d63d3048c7ca9',
'platform/state.js':'e3ec736cc481d1b3f9b3f67d03704670be90ac5cf994df81ac2921e6309f6753',
'platform/storage.js':'5eae8f579ab7d3f2860728ea5fe0adc425de8078e6999971f441bb389141699a',
'platform/timing.js':'2f906ea408b3dca79a7dc74b19eed99c0a88d2559e24146a52a02b350ea8a9c8',
'platform/utils.js':'488d5cc91485d8511fa46b7c043cb21d61048ee3d9caf0a3e03724493432fecd',
'modes/rallycross/rules.js':'80c8a70c6d9e4bf51c0f7838a9dd0f519fb79f5e0d169f7ab4138ff0a188e3a0',
'modes/rallycross/qualifying.js':'15ba4a3768a3d389b2c968032935ac809f2bad551e4206c658c1b997c3ba3be9',
'modes/rallycross/finals.js':'160a93c2cd3ddfa58fbb7b661578076ba6b7a4904f915e966a2e41007d4e8bb1',
'modes/rallycross/index.js':'c9fb3c90f8dab5233d98dfa55384aa6c4329c9d38b53a547340e9ed44ff94386',
'modes/rallycross/audio-actions.js':'f2d9ccfc4bcdb85bb759840153c9e844787dfcaca2f6a9c723cec3b38875f67a',
'modes/rallycross/runtime.js':'608b9e54ec3e7b288fec5824f37621a1555bf639115f6047bbaf29e81f1eebfd',
'modes/rallycross/self-test.js':'004f5e6f4d5adfc9dd37af3050cb4a7e3b486b36cd9b157fada9879482800037',
'modes/free-practice/index.js':'aa43d3a87f0e9286635dbb5bbcfc7647dac310ea30d24af80bb9fe9cdd20845a',
'modes/rally-sprint/index.js':'1f72a94e0f765212b98bd7af6b24589c1108001bcfaa9fcfc3db7fd97b025a71',
'modes/classic-rc/index.js':'ade4c33308e6d31ec1987d61635058917aea54c9fc0a8bd476cc824407af9bb4',
'reporting/core.js':'11df7d024958c4b983dcff942328193a5f7feffe280b8307f4bf6c75c0e75098',
'reporting/sections/rallycross.js':'540212e96af2ee20d35b74e78887019f8226a339370121a2b020c67aaf7ee913',
'reporting/sections/practice.js':'8b57e65f99984f1552fe07b92ab5b6941caf2cfc49abd0ce99757d0e151b7dc1',
'reporting/sections/rally.js':'e941b01c46f0f0f2e548358f3d16fd02a98c01dd50e01a92c0ea700c10b3ea0a',
}
changed=[]
for rel,want in expected.items():
    p=ROOT/rel
    got=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else 'MISSING'
    if got!=want: changed.append((rel,got,want))
checks['protected_sport_and_unchanged_platform_byte_identical_to_rc19']=not changed

index=(ROOT/'index.html').read_text(encoding='utf-8')
checks['clean_runtime_names']=all(x not in index for x in ['rc5restore','variant4.css','current-base.css','current-ui.js','bindings.js','offline-audio.js','offline-config.js'])
checks['style_layers_exact']=all(x in index for x in ['ui/themes/theme.css','ui/shell/app.css','ui/pilots/pilot-cards.css','ui/shell/discipline-pults.css']) and index.count('rel="stylesheet"')==5 # + Oswald; pilot cards are an isolated authoritative component layer

theme=(ROOT/'ui/themes/theme.css').read_text(encoding='utf-8')
checks['theme_is_tokens_only']=not re.search(r'\.[A-Za-z_][\w-]*\s*[,{]',theme)

badfiles=[str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and re.search(r'(patch|hotfix|override|fix\.css|fix\.js)',p.name,re.I)]
checks['no_patch_override_files']=not badfiles

sw=(ROOT/'sw.js').read_text(encoding='utf-8')
install_block=sw[sw.find("self.addEventListener('install'"):sw.find("self.addEventListener('activate'")]
checks['sw_install_does_not_skip_waiting']=not re.search(r'\b(?:await\s+)?self\.skipWaiting\s*\(', install_block)
checks['sw_user_confirmed_activation']="type==='SKIP_WAITING'" in sw and 'await self.skipWaiting()' in sw
checks['sw_cache_first_navigation']=sw.find("const local=(await cached('./index.html'))") < sw.find('try{return await fetch(request);}')
checks['sw_candidate_cache_atomic']='await caches.delete(CACHE)' in sw and 'candidate package incomplete' in sw
checks['sw_reuses_verified_external_assets']='const previous=await caches.match(url' in sw and 'if(EXTERNAL.includes(url))' in sw

off=(ROOT/'platform/offline-core.js').read_text(encoding='utf-8')
checks['offline_runtime_is_read_only']='fetch(' not in off and '.prepare(' not in off

actions=(ROOT/'ui/shell/actions.js').read_text(encoding='utf-8')
checks['audio_button_has_no_update_or_download']="action==='audio-enable'" in actions and 'offlineReady.prepare' not in actions
checks['settings_update_actions']=all(x in actions for x in ["action==='update-check'","action==='update-install'","action==='offline-check'"])

cfg=(ROOT/'offline-manifest.js').read_text(encoding='utf-8')
assets=re.findall(r"'?(\./[^'\"]+)'?",cfg)
missing=[a for a in assets if a!='./' and not (ROOT/a[2:]).exists()]
checks['offline_manifest_local_files_exist']=not missing
checks['offline_manifest_has_oswald_cache']='unpkg.com/@fontsource/oswald' in cfg
appcss=(ROOT/'ui/shell/app.css').read_text(encoding='utf-8')
checks['no_undefined_console_background']='var(--console-bg)' not in appcss

for k,v in checks.items():print(f'{k}: {"PASS" if v else "FAIL"}')
if changed:
    print('protected changes:')
    for x in changed:print(x)
if badfiles:print('bad files:',badfiles)
if missing:print('missing assets:',missing)
sys.exit(0 if all(checks.values()) else 2)
