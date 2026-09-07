'use strict';
(function(root){
  const appVersion='4.1.1-offline-hotfix';
  const cacheName='legion-rx-4-1-1-offline-hotfix';
  const assets=[
    './','./index.html','./manifest.webmanifest','./offline-config.js','./ui-next.css','./ui-next.js',
    './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
    './audio/voice/prestart_10.wav','./audio/voice/good_race.wav',
    ...Array.from({length:10},(_,i)=>`./audio/voice/countdown_${String(i+1).padStart(2,'0')}.wav`),
    './audio/voice/warmup_01.wav','./audio/voice/warmup_02.wav','./audio/voice/warmup_03.wav','./audio/voice/warmup_04.wav','./audio/voice/warmup_05.wav','./audio/voice/warmup_30.wav',
    './audio/voice/events/one_minute_left.wav','./audio/voice/events/call_to_start.wav','./audio/voice/events/new_best_lap.wav','./audio/voice/events/pilot_finished.wav','./audio/voice/events/heat_results.wav','./audio/voice/events/time_expired.wav','./audio/voice/events/finish_current_lap.wav','./audio/voice/events/all_pilots_finished.wav','./audio/voice/events/heat_finished.wav','./audio/voice/events/race_stopped.wav','./audio/voice/events/unknown_transponder.wav','./audio/voice/events/lapwiz_disconnected.wav',
    './audio/system/start_race.mp3','./audio/system/bleep.mp3','./audio/system/silence.wav',
    './flags/flags-atlas.png'
  ];
  root.LEGION_OFFLINE_CONFIG=Object.freeze({
    appVersion,
    cacheName,
    markerKey:'legionrx_offline_ready_'+appVersion.replace(/[^a-z0-9]+/gi,'_').toLowerCase(),
    assets:Object.freeze(assets)
  });
})(typeof self!=='undefined'?self:window);
