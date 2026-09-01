const CACHE='legion-rx-4-0-32-test-compact-cockpit';
const ASSETS=[
  './','./index.html','./manifest.webmanifest',
  './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
  './audio/voice/prestart_10.wav','./audio/voice/good_race.wav',
  './audio/voice/countdown_01.wav','./audio/voice/countdown_02.wav','./audio/voice/countdown_03.wav','./audio/voice/countdown_04.wav','./audio/voice/countdown_05.wav','./audio/voice/countdown_06.wav','./audio/voice/countdown_07.wav','./audio/voice/countdown_08.wav','./audio/voice/countdown_09.wav','./audio/voice/countdown_10.wav',
  './audio/voice/warmup_01.wav','./audio/voice/warmup_02.wav','./audio/voice/warmup_03.wav','./audio/voice/warmup_04.wav','./audio/voice/warmup_05.wav','./audio/voice/warmup_30.wav',
  './audio/system/start_race.mp3','./audio/system/bleep.mp3','./audio/system/silence.wav'
];

function mimeFor(path){
  if(/\.mp3$/i.test(path))return'audio/mpeg';
  if(/\.wav$/i.test(path))return'audio/wav';
  if(/\.png$/i.test(path))return'image/png';
  return'';
}

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

async function rangeResponse(request,fullResponse){
  const range=request.headers.get('range');
  if(!range)return fullResponse;
  const buf=await fullResponse.clone().arrayBuffer(),size=buf.byteLength;
  const m=/bytes=(\d*)-(\d*)/i.exec(range);
  if(!m||size===0)return fullResponse;
  let start=m[1]?Number(m[1]):NaN,end=m[2]?Number(m[2]):NaN;
  if(Number.isNaN(start)&&!Number.isNaN(end)){start=Math.max(0,size-end);end=size-1;}
  else{if(Number.isNaN(start))start=0;if(Number.isNaN(end)||end>=size)end=size-1;}
  if(start<0||start>=size||end<start){
    return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`,'Accept-Ranges':'bytes'}});
  }
  const body=buf.slice(start,end+1),headers=new Headers(fullResponse.headers);
  headers.set('Content-Type',mimeFor(new URL(request.url).pathname)||headers.get('Content-Type')||'application/octet-stream');
  headers.set('Accept-Ranges','bytes');
  headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
  headers.set('Content-Length',String(body.byteLength));
  headers.delete('Content-Encoding');
  return new Response(body,{status:206,statusText:'Partial Content',headers});
}

async function cachedOrNetworkFull(request){
  const cached=await caches.match(request,{ignoreSearch:true});
  if(cached)return cached;
  try{
    // Media element может прислать Range. Для локального кэша всегда сначала берём полный файл.
    const fullRequest=new Request(request.url,{method:'GET',headers:{'Accept':request.headers.get('Accept')||'*/*'},cache:'reload',credentials:request.credentials,mode:'same-origin'});
    const response=await fetch(fullRequest);
    if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request.url,response.clone());}
    return response;
  }catch{return null;}
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const url of ASSETS){if(!(await cache.match(url,{ignoreSearch:true})))await putAsset(cache,url);}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    if(await currentCacheComplete())await cleanupOldCaches();
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='OFFLINE_READY_CLEANUP')event.waitUntil(cleanupOldCaches());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request,url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const isAudio=url.pathname.includes('/audio/'),isIcon=url.pathname.includes('/icons/');

  if(isAudio){
    event.respondWith((async()=>{
      const full=await cachedOrNetworkFull(request);
      if(!full)return Response.error();
      return request.headers.has('range')?rangeResponse(request,full):full;
    })());
    return;
  }

  if(isIcon){
    event.respondWith((async()=>{
      const cached=await caches.match(request,{ignoreSearch:true});if(cached)return cached;
      try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}catch{return Response.error();}
    })());
    return;
  }

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());}return response;}
      catch{return(await caches.match('./index.html'))||(await caches.match('./'))||Response.error();}
    })());
    return;
  }

  event.respondWith((async()=>{
    try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}
    catch{return(await caches.match(request,{ignoreSearch:true}))||Response.error();}
  })());
});
