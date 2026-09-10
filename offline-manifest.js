'use strict';
(function(root){
  const appVersion='4.2.0-clean-full-rc31-column-grid-repair';
  const displayVersion='4.2.0 CLEAN FULL APP RC31 · COLUMN GRID REPAIR';
  const cacheName='legion-rx-4-2-0-clean-full-rc31-column-grid-repair';
  const assets=[
    './',
    './index.html','./manifest.webmanifest','./offline-manifest.js','./app-bridge.js','./app.js','./boot.js',
    './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
    './flags/flags-atlas-rc4.png',
    './audio/system/bleep.mp3','./audio/system/silence.wav','./audio/system/start_race.mp3',
    './audio/voice/countdown_01.wav','./audio/voice/countdown_02.wav','./audio/voice/countdown_03.wav','./audio/voice/countdown_04.wav','./audio/voice/countdown_05.wav','./audio/voice/countdown_06.wav','./audio/voice/countdown_07.wav','./audio/voice/countdown_08.wav','./audio/voice/countdown_09.wav','./audio/voice/countdown_10.wav',
    './audio/voice/good_race.wav','./audio/voice/prestart_10.wav','./audio/voice/warmup_01.wav','./audio/voice/warmup_02.wav','./audio/voice/warmup_03.wav','./audio/voice/warmup_04.wav','./audio/voice/warmup_05.wav','./audio/voice/warmup_30.wav',
    './audio/voice/events/all_pilots_finished.wav','./audio/voice/events/call_to_start.wav','./audio/voice/events/finish_current_lap.wav','./audio/voice/events/heat_finished.wav','./audio/voice/events/heat_results.wav','./audio/voice/events/lapwiz_disconnected.wav','./audio/voice/events/new_best_lap.wav','./audio/voice/events/one_minute_left.wav','./audio/voice/events/pilot_finished.wav','./audio/voice/events/race_stopped.wav','./audio/voice/events/time_expired.wav','./audio/voice/events/unknown_transponder.wav',
    './platform/utils.js','./platform/storage.js','./platform/timing.js','./platform/lapwiz.js','./platform/offline-core.js','./platform/updater.js','./platform/audio.js','./platform/state.js','./platform/pilots.js',
    './modes/rallycross/rules.js','./modes/rallycross/qualifying.js','./modes/rallycross/finals.js','./modes/rallycross/index.js','./modes/rallycross/audio-actions.js','./modes/rallycross/runtime.js','./modes/rallycross/self-test.js','./modes/free-practice/index.js','./modes/rally-sprint/index.js','./modes/classic-rc/index.js',
    './ui/fonts/oswald.css','./ui/themes/theme.css','./ui/shell/app.css','./ui/pilots/pilot-cards.css','./ui/shell/discipline-pults.css','./ui/shell/runtime-error.js','./ui/shell/discipline-shared.js','./ui/pilots/pilot-cards.js','./ui/shell/views.js','./ui/shell/router.js','./ui/shell/actions.js','./ui/shell/offline-runtime.js','./ui/discipline-ui.js',
    './reporting/core.js','./reporting/sections/practice.js','./reporting/sections/rally.js','./reporting/sections/rallycross.js'
  ];
  const externalAssets=[
    'https://unpkg.com/@fontsource/oswald@5.1.0/files/oswald-cyrillic-400-normal.woff2',
    'https://unpkg.com/@fontsource/oswald@5.1.0/files/oswald-latin-400-normal.woff2',
    'https://unpkg.com/@fontsource/oswald@5.1.0/files/oswald-cyrillic-500-normal.woff2',
    'https://unpkg.com/@fontsource/oswald@5.1.0/files/oswald-latin-500-normal.woff2',
    'https://unpkg.com/@fontsource/oswald@5.1.0/files/oswald-cyrillic-600-normal.woff2',
    'https://unpkg.com/@fontsource/oswald@5.1.0/files/oswald-latin-600-normal.woff2',
    'https://unpkg.com/@fontsource/oswald@5.1.0/files/oswald-cyrillic-700-normal.woff2',
    'https://unpkg.com/@fontsource/oswald@5.1.0/files/oswald-latin-700-normal.woff2'
  ];
  root.LEGION_OFFLINE_CONFIG=Object.freeze({appVersion,displayVersion,cacheName,externalAssets:Object.freeze(externalAssets),markerKey:'legionrx_offline_ready_'+appVersion.replace(/[^a-z0-9]+/gi,'_').toLowerCase(),assets:Object.freeze(assets)});
})(typeof self!=='undefined'?self:window);
