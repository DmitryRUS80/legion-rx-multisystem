from pathlib import Path
import hashlib,re,sys
ROOT=Path(__file__).resolve().parents[1]
checks={}

expected={
'app.js':'e8d6378c4b0e9e994845e303ecc4d10be38648c7b8d9998a072b3bc6d981c6c2',
'platform/lapwiz.js':'d0f9af187e90114edf671827c9365e7d28130809ba1926cfa11efd30f8c3c644',
'platform/pilots.js':'9447a63d5fef07aed6c28407844372ab9d7d0f9afdba5c48ed0d63d3048c7ca9',
'platform/state.js':'e3ec736cc481d1b3f9b3f67d03704670be90ac5cf994df81ac2921e6309f6753',
'platform/storage.js':'c6a007eacc91b80d680518d07be51532a5ac8a02b990142bf6c49e409d9a7927',
'platform/timing.js':'2f906ea408b3dca79a7dc74b19eed99c0a88d2559e24146a52a02b350ea8a9c8',
'platform/utils.js':'488d5cc91485d8511fa46b7c043cb21d61048ee3d9caf0a3e03724493432fecd',
'modes/rallycross/rules.js':'d840388a9e0a148909cac826b184fb88d513c0edbb4a354585ee74362cbb6db3',
'modes/rallycross/qualifying.js':'bebee6a92a488e5bcdf768740bfba6413a92e3a921a346aef4c11388738c63eb',
'modes/rallycross/finals.js':'7f057ef596b26573be59efb30fc5760b6ca1d36acac6228a8a275305d828b440',
'modes/rallycross/index.js':'768fabb156cdc557d7b5a11debfb008d7575d303760497074b48c290cd4d61b2',
'modes/rallycross/audio-actions.js':'f2d9ccfc4bcdb85bb759840153c9e844787dfcaca2f6a9c723cec3b38875f67a',
'modes/rallycross/runtime.js':'fe247ed9a55a1bb81ed3fed5029bc180fed652de2c3907cb24983c6a8f8cdac3',
'modes/rallycross/self-test.js':'3f2be9c50b3a4b158505abd64f95ffd7d10856323a7fd7fb8e31f579cad1113a',
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
checks['protected_foundation_hashes_match_rc29']=not changed

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
