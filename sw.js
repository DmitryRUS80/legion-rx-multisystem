/* LEGION RX · SAFE OFFLINE SERVICE WORKER · RC37 · AVATAR CROP + COMPRESSION */
'use strict';
importScripts('./offline-manifest.js');

const CFG=self.LEGION_OFFLINE_CONFIG;
const CACHE=CFG.cacheName;
const LOCAL=[...CFG.assets];
const EXTERNAL=[...(CFG.externalAssets||[])];
const PACKAGE=[...LOCAL,...EXTERNAL];

function mimeFor(path){
  if(/\.mp3$/i.test(path))return'audio/mpeg';
  if(/\.wav$/i.test(path))return'audio/wav';
  if(/\.png$/i.test(path))return'image/png';
  if(/\.svg$/i.test(path))return'image/svg+xml';
  if(/\.js$/i.test(path))return'text/javascript';
  if(/\.css$/i.test(path))return'text/css';
  if(/\.webmanifest$/i.test(path))return'application/manifest+json';
  if(/\.html?$/i.test(path)||path==='./')return'text/html';
  return'';
}

async function validate(url,response){
  if(!response||!response.ok)throw new Error(`${url}: HTTP ${response?.status||0}`);
  const type=(response.headers.get('content-type')||'').toLowerCase();
  if(/\.(wav|mp3|png|svg|js|css|woff2)$/i.test(url)&&type.includes('text/html'))throw new Error(`${url}: HTML instead of asset`);
  return response;
}

async function packageComplete(){
  const cache=await caches.open(CACHE);
  for(const url of PACKAGE){
    const hit=await cache.match(url,{ignoreSearch:false});
    if(!hit)return false;
    try{await validate(url,hit);}catch{return false;}
  }
  return true;
}

async function installAtomically(){
  // Only the cache for THIS candidate release is rebuilt. The active release cache is untouched.
  await caches.delete(CACHE);
  const cache=await caches.open(CACHE);
  try{
    for(const url of PACKAGE){
      let response=null;
      if(EXTERNAL.includes(url)){
        // External immutable resources may already exist in the active verified release.
        // Reuse them first so a future app update does not depend on the font CDN being reachable.
        const previous=await caches.match(url,{ignoreSearch:false});
        if(previous){try{await validate(url,previous);response=previous;}catch{response=null;}}
      }
      if(!response){
        const request=new Request(url,{cache:'reload',credentials:url.startsWith('http')?'omit':'same-origin',mode:url.startsWith('http')?'cors':'same-origin'});
        response=await fetch(request);
        await validate(url,response);
      }
      await cache.put(url,response.clone());
    }
    if(!(await packageComplete()))throw new Error('candidate package incomplete');
  }catch(error){
    await caches.delete(CACHE);
    throw error;
  }
}

async function cleanupOldCaches(){
  if(!(await packageComplete()))return;
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('legion-rx-')&&k!==CACHE).map(k=>caches.delete(k)));
}

async function cached(requestOrUrl){
  const cache=await caches.open(CACHE);
  return cache.match(requestOrUrl,{ignoreSearch:false});
}

async function cachedOrNetwork(request){
  const hit=await cached(request);
  if(hit)return hit;
  try{
    const response=await fetch(request);
    await validate(request.url,response);
    const cache=await caches.open(CACHE);
    await cache.put(request,response.clone());
    return response;
  }catch{return null;}
}

async function rangeResponse(request,fullResponse){
  const range=request.headers.get('range');if(!range)return fullResponse;
  const buf=await fullResponse.clone().arrayBuffer(),size=buf.byteLength;
  const m=/bytes=(\d*)-(\d*)/i.exec(range);if(!m||!size)return fullResponse;
  let start=m[1]?Number(m[1]):NaN,end=m[2]?Number(m[2]):NaN;
  if(Number.isNaN(start)&&!Number.isNaN(end)){start=Math.max(0,size-end);end=size-1;}
  else{if(Number.isNaN(start))start=0;if(Number.isNaN(end)||end>=size)end=size-1;}
  if(start<0||start>=size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`,'Accept-Ranges':'bytes'}});
  const body=buf.slice(start,end+1),headers=new Headers(fullResponse.headers);
  headers.set('Content-Type',mimeFor(new URL(request.url).pathname)||headers.get('Content-Type')||'application/octet-stream');
  headers.set('Accept-Ranges','bytes');headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(body.byteLength));headers.delete('Content-Encoding');
  return new Response(body,{status:206,statusText:'Partial Content',headers});
}

self.addEventListener('install',event=>{
  // No skipWaiting here. A complete candidate waits until the user confirms installation.
  event.waitUntil(installAtomically());
});

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  if(!(await packageComplete()))throw new Error('Refusing to activate incomplete package');
  await cleanupOldCaches();
  await self.clients.claim();
})()));

self.addEventListener('message',event=>{
  if(event.data?.type==='GET_VERSION')event.ports?.[0]?.postMessage({appVersion:CFG.appVersion,displayVersion:CFG.displayVersion,cacheName:CACHE,complete:true});
  if(event.data?.type==='SKIP_WAITING')event.waitUntil((async()=>{if(await packageComplete())await self.skipWaiting();})());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request,url=new URL(request.url);

  if(EXTERNAL.includes(request.url)){
    event.respondWith((async()=>await cachedOrNetwork(request)||Response.error())());
    return;
  }
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    // Active release is always opened locally first. Network is never on the critical startup path.
    event.respondWith((async()=>{
      const local=(await cached('./index.html'))||(await cached('./'));
      if(local)return local;
      try{return await fetch(request);}catch{return Response.error();}
    })());
    return;
  }

  if(url.pathname.includes('/audio/')){
    event.respondWith((async()=>{
      const full=await cachedOrNetwork(request);if(!full)return Response.error();
      return request.headers.has('range')?rangeResponse(request,full):full;
    })());
    return;
  }

  // JS/CSS/images/app data are cache-first for a coherent active release.
  event.respondWith((async()=>await cachedOrNetwork(request)||Response.error())());
});
