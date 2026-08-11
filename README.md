# Legion RX 4.0.7 Alpha

Мультисистема управления RC-соревнованиями.

Текущий рабочий модуль: **RallyCross**. Rally Sprint и Classic RC отображаются как будущие дисциплины и пока неактивны.

## Запуск локально
Откройте `index.html` в современном браузере. Интерфейс и ручной режим работают локально.

## LapWiz
Для Web Bluetooth используйте HTTPS (например GitHub Pages) и совместимый браузер: Android Chrome или Chrome на Windows с BLE-адаптером. Safari на iOS не поддерживает используемый Web Bluetooth API.

## GitHub Pages
Загрузите содержимое папки в корень репозитория, затем Settings → Pages → Deploy from a branch → main → /(root).

## Важно для Alpha
Перед реальным соревнованием проверяйте новую версию на тестовом событии. Исходную рабочую версию сохраняйте отдельно как резерв.


## 4.0.7 mobile fix
- Separate portrait cockpit layout for Android/iPhone UI testing.
- Mobile widgets open as a sheet instead of overlapping the leaderboard.
- Consistent Roboto Condensed web typography when online, with safe fallbacks.
- 2×3 race controls and compact event strip on narrow screens.
