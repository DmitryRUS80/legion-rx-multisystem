# 4.1.0 UI NEXT TEST 02

- Перестроена адаптивная геометрия PilotRow для desktop/tablet.
- На desktop увеличены высота строки и типографика для ~8–10 видимых пилотов на 1792×864.
- На landscape tablet данные растягиваются по всей ширине таблицы без наложений.
- Portrait tablet breakpoint расширен до 600 CSS px для Android-планшетов.
- Portrait tablet всегда стартует с GAP / ✓ / BEST / AVG / LAST / LAPS.
- Под пультом portrait tablet остаются переключатели столбцов; оставшиеся колонки делят ширину равномерно.
- Имя/флаг в portrait tablet уплотнены: флаг — отдельная колонка сразу после имени.
- Новый UI preference key для столбцов и новый offline cache TEST 02.
- Спортивная, BLE, audio и storage логика не переписывалась.
