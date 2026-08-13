const CACHE='legion-rx-4-0-12-alpha-mobile-audio-fix-1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./audio/voice/prestart_10.wav','./audio/voice/good_race.wav','./audio/voice/countdown_01.wav','./audio/voice/countdown_02.wav','./audio/voice/countdown_03.wav','./audio/voice/countdown_04.wav','./audio/voice/countdown_05.wav','./audio/voice/countdown_06.wav','./audio/voice/countdown_07.wav','./audio/voice/countdown_08.wav','./audio/voice/countdown_09.wav','./audio/voice/countdown_10.wav','./audio/voice/warmup_01.wav','./audio/voice/warmup_02.wav','./audio/voice/warmup_03.wav','./audio/voice/warmup_04.wav','./audio/voice/warmup_05.wav','./audio/voice/warmup_30.wav','./audio/system/start_race.mp3','./audio/system/bleep.mp3','./audio/system/silence.wav'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
