/* Legion RX RC17 COCKPIT READABILITY */
'use strict';
importScripts('./offline-config.js');

const CACHE=LEGION_OFFLINE_CONFIG.cacheName;
const ASSETS=[...LEGION_OFFLINE_CONFIG.assets];
const EXTERNAL_ASSETS=[...(LEGION_OFFLINE_CONFIG.externalAssets||[])];
const ALL_ASSETS=[...ASSETS,...EXTERNAL_ASSETS];

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

async function validateResponse(url,response){
  if(!response||!response.ok)throw new Error(`${url}: HTTP ${response?.status||0}`);
  const type=(response.headers.get('content-type')||'').toLowerCase();
  if(/\.(wav|mp3|png|svg|js|css)$/i.test(url)&&type.includes('text/html'))throw new Error(`${url}: HTML вместо файла`);
  return response;
}

async function currentCacheComplete(){
  const cache=await caches.open(CACHE);
  for(const url of ALL_ASSETS){
    const hit=await cache.match(url,{ignoreSearch:true});
    if(!hit)return false;
    try{await validateResponse(url,hit);}catch{return false;}
  }
  return true;
}

async function cleanupOldCaches(){
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('legion-rx-')&&key!==CACHE).map(key=>caches.delete(key)));
}

async function installAtomically(){
  await caches.delete(CACHE);
  const cache=await caches.open(CACHE);
  try{
    for(const url of ALL_ASSETS){
      const response=await fetch(url,{cache:'reload'});
      await validateResponse(url,response);
      await cache.put(url,response.clone());
    }
    if(!(await currentCacheComplete()))throw new Error('Offline cache incomplete after install');
  }catch(error){
    await caches.delete(CACHE);
    throw error;
  }
}

async function currentCached(request){
  const cache=await caches.open(CACHE);
  return cache.match(request,{ignoreSearch:true});
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
  if(start<0||start>=size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`,'Accept-Ranges':'bytes'}});
  const body=buf.slice(start,end+1),headers=new Headers(fullResponse.headers);
  headers.set('Content-Type',mimeFor(new URL(request.url).pathname)||headers.get('Content-Type')||'application/octet-stream');
  headers.set('Accept-Ranges','bytes');headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(body.byteLength));headers.delete('Content-Encoding');
  return new Response(body,{status:206,statusText:'Partial Content',headers});
}

async function cachedOrNetworkFull(request){
  const cached=await currentCached(request);if(cached)return cached;
  try{
    const sameOrigin=new URL(request.url).origin===self.location.origin;
    const fullRequest=sameOrigin
      ? new Request(request.url,{method:'GET',headers:{'Accept':request.headers.get('Accept')||'*/*'},cache:'reload',credentials:request.credentials,mode:'same-origin'})
      : new Request(request.url,{method:'GET',headers:{'Accept':request.headers.get('Accept')||'*/*'},cache:'reload',credentials:'omit',mode:'cors'});
    const response=await fetch(fullRequest);await validateResponse(request.url,response);
    const cache=await caches.open(CACHE);await cache.put(request.url,response.clone());return response;
  }catch{return null;}
}

self.addEventListener('install',event=>event.waitUntil((async()=>{await installAtomically();await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{if(await currentCacheComplete())await cleanupOldCaches();await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='OFFLINE_READY_CLEANUP')event.waitUntil((async()=>{if(await currentCacheComplete())await cleanupOldCaches();})());});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const request=event.request,url=new URL(request.url);
  if(EXTERNAL_ASSETS.includes(request.url)){event.respondWith((async()=>{const full=await cachedOrNetworkFull(request);return full||Response.error();})());return;}
  if(url.origin!==self.location.origin)return;
  const isAudio=url.pathname.includes('/audio/'),isStatic=url.pathname.includes('/icons/')||url.pathname.includes('/flags/');
  if(isAudio){event.respondWith((async()=>{const full=await cachedOrNetworkFull(request);if(!full)return Response.error();return request.headers.has('range')?rangeResponse(request,full):full;})());return;}
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());return response;}}catch{}
      const cache=await caches.open(CACHE);return(await cache.match('./index.html',{ignoreSearch:true}))||(await cache.match('./',{ignoreSearch:true}))||Response.error();
    })());return;
  }
  if(isStatic){event.respondWith((async()=>{const cached=await currentCached(request);if(cached)return cached;try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}catch{return Response.error();}})());return;}
  event.respondWith((async()=>{const cached=await currentCached(request);if(cached)return cached;try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}catch{return Response.error();}})());
});
