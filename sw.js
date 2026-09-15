/* LEGION RX · SAFE OFFLINE SERVICE WORKER · RC59 · SETTINGS UPDATE UX */
'use strict';
const LEGION_SW_BUILD='rc59-settings-update-ux';
/* Unique import URL prevents an older HTTP-cached release manifest being reused during SW update. */
importScripts('./offline-manifest.js?build=rc59-settings-update-ux');

const CFG=self.LEGION_OFFLINE_CONFIG;
const CACHE=CFG.cacheName;
const LOCAL=[...CFG.assets];
const EXTERNAL=[...(CFG.externalAssets||[])];
const PACKAGE=[...LOCAL,...EXTERNAL];
/* These files define this release and are never allowed to fall back to older cached bytes. */
const FRESH_REQUIRED=new Set(['./','./index.html','./VERSION.txt','./offline-manifest.js','./boot.js','./platform/updater.js','./platform/pilot-live-edit.js','./modes/rallycross/index.js','./modes/rallycross/runtime.js','./ui/pilots/pilot-cards.js','./ui/shell/views.js','./ui/shell/router.js','./ui/shell/actions.js','./ui/shell/offline-runtime.js','./ui/shell/app.css','./ui/discipline-ui.js','./ui/shell/discipline-pults.css','./ui/skins/rxui/base.css','./ui/skins/rxui/cobalt.css','./ui/skins/rxui/workspace-landscape.webp','./ui/skins/rxui/workspace-portrait.webp','./ui/classic-polish/classic-controls.css','./ui/classic-polish/classic-icons.js']);

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function broadcastUpdateProgress(completed,total,url=''){
  try{
    const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const message={type:'LEGION_UPDATE_PROGRESS',build:LEGION_SW_BUILD,completed,total,url};
    list.forEach(client=>{try{client.postMessage(message);}catch{}});
  }catch{}
}
function mimeFor(path){
  if(/\.mp3$/i.test(path))return'audio/mpeg';
  if(/\.wav$/i.test(path))return'audio/wav';
  if(/\.png$/i.test(path))return'image/png';
  if(/\.webp$/i.test(path))return'image/webp';
  if(/\.svg$/i.test(path))return'image/svg+xml';
  if(/\.js$/i.test(path))return'text/javascript';
  if(/\.css$/i.test(path))return'text/css';
  if(/\.webmanifest$/i.test(path))return'application/manifest+json';
  if(/\.txt$/i.test(path))return'text/plain';
  if(/\.html?$/i.test(path)||path==='./')return'text/html';
  return'';
}
async function textOf(response){try{return await response.clone().text();}catch{return'';}}
async function validate(url,response){
  if(!response||!response.ok)throw new Error(`${url}: HTTP ${response?.status||0}`);
  const type=(response.headers.get('content-type')||'').toLowerCase();
  if(/\.(wav|mp3|png|webp|svg|js|css|woff2)$/i.test(url)&&type.includes('text/html'))throw new Error(`${url}: HTML instead of asset`);
  if(url==='./'||url==='./index.html'){const s=await textOf(response);if(!s.includes('ui/skins/rxui/cobalt.css')||!s.includes('ui/classic-polish/classic-controls.css')||!s.includes('platform/pilot-live-edit.js')||s.includes('designQuickBtn')||s.includes('Design Lab'))throw new Error(`${url}: stale index or Design Lab still present`);}
  if(url==='./ui/shell/views.js'){const s=await textOf(response);if(!s.includes('COBALT · BLUE CONTROL')||!s.includes('raceSessionSettingsModal')||!s.includes('data-race-pilot-profile')||!s.includes('updateDownloadProgress')||!s.includes('legionrx_settings_section')||s.includes('racePilotEditModal')||s.includes('openDesignLab')||s.includes('Design Lab'))throw new Error(`${url}: stale RC59 settings/update view`);}
  if(url==='./ui/shell/router.js'){const s=await textOf(response);if(!s.includes('homeViewClassic')||!s.includes('homeViewRxui'))throw new Error(`${url}: stale home theme isolation`);}
  if(url==='./modes/rallycross/index.js'){const s=await textOf(response);if(!s.includes('function eventSessionSettings'))throw new Error(`${url}: stale session rule adapter`);}
  if(url==='./modes/rallycross/runtime.js'){const s=await textOf(response);if(!s.includes('function applyCurrentSessionSettings')||!s.includes('function restartCurrentSession'))throw new Error(`${url}: stale session control runtime`);}
  if(url==='./platform/pilot-live-edit.js'){const s=await textOf(response);if(!s.includes('function updateActiveRacePilotIdentity'))throw new Error(`${url}: stale live pilot editor`);}
  if(url==='./ui/pilots/pilot-cards.js'){const s=await textOf(response);if(!s.includes('pilotRaceEntryForProfile')||!s.includes('updateActiveRacePilotIdentity')||!s.includes('raceModel'))throw new Error(`${url}: stale pilot profile live-sync`);}
  if(url==='./ui/shell/actions.js'){const s=await textOf(response);if(!s.includes("action==='restart-session'")||!s.includes("action==='session-settings'")||!s.includes('legionrx_settings_section')||s.includes('open-design-lab'))throw new Error(`${url}: stale RC59 settings action bindings`);}
  if(url==='./platform/updater.js'){const s=await textOf(response);if(!s.includes('LEGION_UPDATE_PROGRESS')||!s.includes('legionrx_resume_settings_section')||!s.includes('legionrx_post_update'))throw new Error(`${url}: stale updater without progress/resume`);}
  if(url==='./ui/shell/offline-runtime.js'){const s=await textOf(response);if(!s.includes('[data-update-progress]')||!s.includes('data-update-progress-bar'))throw new Error(`${url}: stale update progress UI runtime`);}
  if(url==='./boot.js'){const s=await textOf(response);if(!s.includes('legionrx_resume_settings_section'))throw new Error(`${url}: stale boot without settings resume`);}
  if(url==='./ui/shell/app.css'){const s=await textOf(response);if(!s.includes('RXUI UNIFIED SHELL SYSTEM')||!s.includes('RC58 · IN-COCKPIT SESSION SETTINGS')||!s.includes('.updateProgressTrack')||s.includes('.designQuickBtn')||s.includes('.designDrawer'))throw new Error(`${url}: stale RC59 shell CSS`);}
  if(url==='./ui/discipline-ui.js'){const s=await textOf(response);if(!s.includes('rxnTimeValue')||!s.includes('data-action=\"restart-session\"')||!s.includes('data-action=\"session-settings\"'))throw new Error(`${url}: stale RC57 cockpit controls`);}
  if(url==='./ui/skins/rxui/cobalt.css'){const s=await textOf(response);if(!s.includes('data-skin="cobalt"'))throw new Error(`${url}: invalid COBALT skin`);}
  if(url==='./ui/skins/rxui/base.css'){const s=await textOf(response);if(!s.includes('NON-CLASSIC WORKSPACE WALLPAPER')||!s.includes('workspace-landscape.webp')||!s.includes('workspace-portrait.webp'))throw new Error(`${url}: stale workspace wallpaper layer`);}
  if(url==='./ui/shell/discipline-pults.css'){const s=await textOf(response);if(!s.includes('Landscape phone / narrow browser viewport')||!s.includes('.rxnTimeValue')||!s.includes('.rxnPilotStatsProfileEdit'))throw new Error(`${url}: stale cockpit/profile CSS`);}
  if(url==='./ui/classic-polish/classic-controls.css'){const s=await textOf(response);if(!s.includes('data-skin="classic"'))throw new Error(`${url}: invalid Classic polish CSS`);}
  if(url==='./ui/classic-polish/classic-icons.js'){const s=await textOf(response);if(!s.includes('ClassicControlPolish'))throw new Error(`${url}: invalid Classic polish icons`);}
  if(url==='./offline-manifest.js'){const s=await textOf(response);if(!s.includes('4.2.0-clean-full-rc59-settings-update-ux'))throw new Error(`${url}: stale release manifest`);}
  if(url==='./VERSION.txt'){const s=await textOf(response);if(!s.includes('RC59'))throw new Error(`${url}: stale VERSION`);}
  return response;
}
function freshRequestUrl(url){const u=new URL(url,self.registration.scope);u.searchParams.set('__legion_build',LEGION_SW_BUILD);return u.href;}
async function fetchFresh(url,attempts=4){
  let last=null;
  for(let i=0;i<attempts;i++){
    try{const request=new Request(freshRequestUrl(url),{cache:'no-store',credentials:'same-origin',mode:'same-origin'});const response=await fetch(request);await validate(url,response);return response;}
    catch(e){last=e;if(i<attempts-1)await sleep(450*(i+1));}
  }
  throw last||new Error(`${url}: download failed`);
}
async function fetchExternal(url,attempts=3){
  const previous=await caches.match(url,{ignoreSearch:false});
  if(previous){try{await validate(url,previous);return previous;}catch{}}
  let last=null;
  for(let i=0;i<attempts;i++){
    try{const response=await fetch(new Request(url,{cache:'reload',credentials:'omit',mode:'cors'}));await validate(url,response);return response;}
    catch(e){last=e;if(i<attempts-1)await sleep(500*(i+1));}
  }
  throw last||new Error(`${url}: external download failed`);
}
async function packageComplete(){
  const cache=await caches.open(CACHE);
  for(const url of PACKAGE){const hit=await cache.match(url,{ignoreSearch:false});if(!hit)return false;try{await validate(url,hit);}catch{return false;}}
  return true;
}
async function installAtomically(){
  await caches.delete(CACHE);
  const cache=await caches.open(CACHE),total=PACKAGE.length;let completed=0;
  await broadcastUpdateProgress(0,total,'');
  try{
    for(const url of LOCAL){
      let response=null;
      try{response=await fetchFresh(url);}catch(error){
        if(FRESH_REQUIRED.has(url))throw error;
        const previous=await caches.match(url,{ignoreSearch:false});
        if(previous){try{await validate(url,previous);response=previous;}catch{response=null;}}
        if(!response)throw error;
      }
      await cache.put(url,response.clone());completed++;await broadcastUpdateProgress(completed,total,url);
    }
    for(const url of EXTERNAL){const response=await fetchExternal(url);await cache.put(url,response.clone());completed++;await broadcastUpdateProgress(completed,total,url);}
    if(!(await packageComplete()))throw new Error('candidate package incomplete');
    await broadcastUpdateProgress(total,total,'complete');
  }catch(error){await caches.delete(CACHE);throw error;}
}
async function cleanupOldCaches(){if(!(await packageComplete()))return;const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('legion-rx-')&&k!==CACHE).map(k=>caches.delete(k)));}
async function cached(requestOrUrl){const cache=await caches.open(CACHE);return cache.match(requestOrUrl,{ignoreSearch:false});}
async function cachedOrNetwork(request){const hit=await cached(request);if(hit)return hit;try{const response=await fetch(request);await validate(request.url,response);const cache=await caches.open(CACHE);await cache.put(request,response.clone());return response;}catch{return null;}}
async function rangeResponse(request,fullResponse){
  const range=request.headers.get('range');if(!range)return fullResponse;
  const buf=await fullResponse.clone().arrayBuffer(),size=buf.byteLength;const m=/bytes=(\d*)-(\d*)/i.exec(range);if(!m||!size)return fullResponse;
  let start=m[1]?Number(m[1]):NaN,end=m[2]?Number(m[2]):NaN;
  if(Number.isNaN(start)&&!Number.isNaN(end)){start=Math.max(0,size-end);end=size-1;}else{if(Number.isNaN(start))start=0;if(Number.isNaN(end)||end>=size)end=size-1;}
  if(start<0||start>=size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`,'Accept-Ranges':'bytes'}});
  const body=buf.slice(start,end+1),headers=new Headers(fullResponse.headers);headers.set('Content-Type',mimeFor(new URL(request.url).pathname)||headers.get('Content-Type')||'application/octet-stream');headers.set('Accept-Ranges','bytes');headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(body.byteLength));headers.delete('Content-Encoding');return new Response(body,{status:206,statusText:'Partial Content',headers});
}
self.addEventListener('install',event=>event.waitUntil(installAtomically()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{if(!(await packageComplete()))throw new Error('Refusing to activate incomplete package');await cleanupOldCaches();await self.clients.claim();})()));
self.addEventListener('message',event=>{
  if(event.data?.type==='GET_VERSION')event.ports?.[0]?.postMessage({appVersion:CFG.appVersion,displayVersion:CFG.displayVersion,cacheName:CACHE,build:LEGION_SW_BUILD,complete:true});
  if(event.data?.type==='SKIP_WAITING')event.waitUntil((async()=>{if(await packageComplete())await self.skipWaiting();})());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;const request=event.request,url=new URL(request.url);
  if(EXTERNAL.includes(request.url)){event.respondWith((async()=>await cachedOrNetwork(request)||Response.error())());return;}
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){event.respondWith((async()=>{const local=(await cached('./index.html'))||(await cached('./'));if(local)return local;try{return await fetch(request);}catch{return Response.error();}})());return;}
  if(url.pathname.includes('/audio/')){event.respondWith((async()=>{const full=await cachedOrNetwork(request);if(!full)return Response.error();return request.headers.has('range')?rangeResponse(request,full):full;})());return;}
  event.respondWith((async()=>await cachedOrNetwork(request)||Response.error())());
});
