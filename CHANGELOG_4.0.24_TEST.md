# Legion RX 4.0.24 TEST — Audio Offline Hotfix

Полевой hotfix после ошибки Android Chrome:
`NotSupportedError: Failed to load because no supported source was found.`

## Исправлено
- OFFLINE READY теперь проверяет не только наличие записи в Cache Storage, но и реальную сигнатуру WAV/MP3/PNG.
- Повреждённый/HTML-файл больше не может считаться готовым offline-ресурсом.
- При подготовке offline-пакета некорректная запись удаляется и загружается заново.
- Все звуки после проверки читаются из Cache Storage в Blob/ObjectURL и проигрываются локально; media element не зависит от сетевого URL во время заезда.
- `silence.wav` для разблокировки звука тоже используется как локальный Blob URL.
- BLEEP переведён на тот же локальный источник, что и голос/HORN.
- Service Worker научился отвечать на HTTP Range (`206 Partial Content`) для audio media requests — важно для Android/iOS media engine.
- Новый cache namespace 4.0.24, чтобы 4.0.23 не мог оставить несовместимые media responses.

Спортивная логика, LapWiz Core, Track Day, PIT, RallyCross и правила не менялись.
