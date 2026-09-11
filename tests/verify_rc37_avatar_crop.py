from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
js=(ROOT/'ui/pilots/pilot-cards.js').read_text()
css=(ROOT/'ui/pilots/pilot-cards.css').read_text()
checks={
'crop function':'function pilotOpenAvatarCrop(file)' in js,
'480 target':'outputSize=480' in js and 'pilotEncodeAvatar(img,crop(),480)' in js,
'webp':'image/webp' in js,
'jpeg fallback':'image/jpeg' in js,
'target bytes':'95*1024' in js,
'drag':'onpointerdown' in js and 'onpointermove' in js,
'zoom':'type="range" min="1" max="3"' in js,
'image accept':'accept="image/*"' in js,
'cancel preserves':'if(!cropped)return;pendingPhoto=cropped' in js,
'crop css':'.pilotAvatarCropBackdrop' in css and '.pilotAvatarCropStage' in css,
}
for name,ok in checks.items():
    print(('PASS' if ok else 'FAIL'), name)
if not all(checks.values()): raise SystemExit(1)
print(f"RC37 avatar crop: {sum(checks.values())}/{len(checks)} PASS")
