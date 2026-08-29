const CACHE='legion-rx-4-0-23-test-offline-audio-1';
const ASSETS=[
  './','./index.html','./manifest.webmanifest',
  './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
  './audio/voice/prestart_10.wav','./audio/voice/good_race.wav',
  './audio/voice/countdown_01.wav','./audio/voice/countdown_02.wav','./audio/voice/countdown_03.wav','./audio/voice/countdown_04.wav','./audio/voice/countdown_05.wav','./audio/voice/countdown_06.wav','./audio/voice/countdown_07.wav','./audio/voice/countdown_08.wav','./audio/voice/countdown_09.wav','./audio/voice/countdown_10.wav',
  './audio/voice/warmup_01.wav','./audio/voice/warmup_02.wav','./audio/voice/warmup_03.wav','./audio/voice/warmup_04.wav','./audio/voice/warmup_05.wav','./audio/voice/warmup_30.wav',
  './audio/system/start_race.mp3','./audio/system/bleep.mp3','./audio/system/silence.wav'
];

async function putAsset(cache,url){
  try{
    const response=await fetch(url,{cache:'reload'});
    if(!response||!response.ok)return false;
    const type=(response.headers.get('content-type')||'').toLowerCase();
    if(/\.(wav|mp3|png)$/i.test(url)&&type.includes('text/html'))return false;
    await cache.put(url,response.clone());
    return true;
  }catch{return false;}
}

async function currentCacheComplete(){
  const cache=await caches.open(CACHE);
  for(const url of ASSETS){if(!(await cache.match(url,{ignoreSearch:true})))return false;}
  return true;
}

async function cleanupOldCaches(){
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('legion-rx-')&&key!==CACHE).map(key=>caches.delete(key)));
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // Кэшируем каждый ресурс независимо: один временно недоступный файл не ломает установку SW.
    for(const url of ASSETS){
      if(!(await cache.match(url,{ignoreSearch:true})))await putAsset(cache,url);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    // Старый рабочий кэш сохраняем, пока новая версия реально не собрала полный пакет.
    if(await currentCacheComplete())await cleanupOldCaches();
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='OFFLINE_READY_CLEANUP'){
    event.waitUntil(cleanupOldCaches());
  }
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const isAudio=url.pathname.includes('/audio/');
  const isIcon=url.pathname.includes('/icons/');

  if(isAudio||isIcon){
    // Критические звуки и иконки: сначала локальная копия, сеть только если файла нет.
    event.respondWith((async()=>{
      const cached=await caches.match(request,{ignoreSearch:true});
      if(cached)return cached;
      try{
        const response=await fetch(request);
        if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}
        return response;
      }catch{return Response.error();}
    })());
    return;
  }

  if(request.mode==='navigate'){
    // HTML: сеть в приоритете для обновлений, offline fallback только на сохранённый index.
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());}
        return response;
      }catch{
        return (await caches.match('./index.html'))||(await caches.match('./'))||Response.error();
      }
    })());
    return;
  }

  // Остальные same-origin ресурсы: network first, затем реальный cached asset.
  // ВАЖНО: больше не подменяем отсутствующий mp3/wav HTML-страницей.
  event.respondWith((async()=>{
    try{
      const response=await fetch(request);
      if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}
      return response;
    }catch{
      return (await caches.match(request,{ignoreSearch:true}))||Response.error();
    }
  })());
});
