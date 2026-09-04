# 4.1.0 UI NEXT TEST 01

- Донор рабочего ядра: Legion RX 4.0.42 UI TEST RallyCross Reference.
- Добавлен изолированный новый RallyCross UI (`ui-next.js`, `ui-next.css`).
- Основные race/BLE/audio/storage functions в donor `index.html` не переписывались.
- Обновлены только номер сборки, offline cache id и список offline assets для новых UI-файлов.
- Service Worker получает новый cache namespace, чтобы не смешивать тестовую сборку с 4.0.42.
- Manifest обновлён на 4.1.0 UI Next Test 01.

QA перед упаковкой:
- синтаксис основного inline JS: PASS;
- синтаксис ui-next.js: PASS;
- 390×844: без горизонтального overflow, 6 control buttons;
- 844×390: без overflow, 6 control buttons;
- 820×1180: полный ряд метрик + column toggles;
- 1180×820: PASS;
- 1920×1080: PASS;
- FLIP reorder: порядок DOM меняется, активны browser animations;
- первый проход: START ✓ и 0 кругов; второй проход: 1 круг;
- Home / Pilots / Settings / Championships рендерятся без JS errors;
- Track Day cockpit рендерится, 6 controls, без horizontal overflow.
