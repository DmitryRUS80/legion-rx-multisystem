from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[1]
js=(ROOT/'ui/pilots/pilot-cards.js').read_text()
css=(ROOT/'ui/pilots/pilot-cards.css').read_text()
checks={
'crop_above_editor':'.pilotAvatarCropBackdrop{position:fixed;inset:0;z-index:1400' in css and '.pilotEditorBackdrop,.pilotPickerBackdrop{position:fixed;inset:0;z-index:1200' in css,
'mobile_centered':'@media (max-width:520px){.pilotAvatarCropBackdrop{padding:10px;place-items:center}' in css and 'align-items:end' not in css[css.find('/* Avatar cropper'):],
'compact_target':'const targetBytes=72*1024' in js,
'preview_guard':"const preview=$('#pilotEditorAvatarPreview');if(!preview)throw new Error('Редактор пилота закрыт');pendingPhoto=cropped;preview.innerHTML=" in js,
'crop_still_single_source':'function pilotOpenAvatarCrop(file)' in js and js.count('function pilotOpenAvatarCrop(file)')==1,
'480_pipeline':'pilotEncodeAvatar(img,crop(),480)' in js and 'image/webp' in js and 'image/jpeg' in js,
}
for name,ok in checks.items():print(('PASS' if ok else 'FAIL'),name)
if not all(checks.values()): raise SystemExit(1)
print(f"RC38 avatar crop layer: {sum(checks.values())}/{len(checks)} PASS")
