/* LEGION RX · SAFE OFFLINE SERVICE WORKER · RC74 · CLASSIC AUDIO + FINAL RATING */
'use strict';
const LEGION_SW_BUILD='rc75-auto-race-day-final-breaks';
/* Unique import URL prevents an older HTTP-cached release manifest being reused during SW update. */
importScripts('./offline-manifest.js?build=rc75-auto-race-day-final-breaks');

const CFG=self.LEGION_OFFLINE_CONFIG;
const CACHE=CFG.cacheName;
const LOCAL=[...CFG.assets];
const EXTERNAL=[...(CFG.externalAssets||[])];
const PACKAGE=[...LOCAL,...EXTERNAL];
/* These files define this release and are never allowed to fall back to older cached bytes. */
const FRESH_REQUIRED=new Set(['./','./index.html','./VERSION.txt','./offline-manifest.js','./app.js','./boot.js','./platform/updater.js','./platform/pilot-live-edit.js','./runtime/competition-scheduler.js','./runtime/competition-autopilot.js','./runtime/race-event-bus.js','./runtime/race-clock-adapter.js','./runtime/race-test-source-adapter.js','./runtime/active-race-controller.js','./modes/classic-rc/efra-rules.js','./modes/classic-rc/groups.js','./modes/classic-rc/efra-engine.js','./modes/classic-rc/audio-actions.js','./modes/classic-rc/efra-runtime.js','./modes/rallycross/index.js','./modes/rallycross/finals.js','./modes/rallycross/runtime.js','./simulation/race-simulator.js','./ui/pilots/pilot-cards.js','./ui/classic-rc/classic-rc-ui.js','./ui/classic-rc/classic-rc.css','./ui/shell/views.js','./ui/shell/router.js','./ui/shell/actions.js','./ui/shell/offline-runtime.js','./ui/shell/app.css','./ui/discipline-ui.js','./ui/shell/discipline-pults.css','./ui/skins/rxui/base.css','./ui/skins/rxui/cobalt.css','./ui/skins/rxui/workspace-landscape.webp','./ui/skins/rxui/workspace-portrait.webp','./ui/classic-polish/classic-controls.css','./ui/classic-polish/classic-icons.js']);

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function broadcastUpdateProgress(completed,total,url=''){
  try{
    const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const message={type:'LEGION_UPDATE_PROGRESS',build:LEGION_SW_BUILD,completed,total,url};
    list.forEach(client=>{try{client.postMessage(message);}catch{}});
  }catch{}
}
async function broadcastUpdateError(error,{completed=0,total=0,url='',stage='download'}={}){
  try{
    const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const raw=String(error?.message||error||'update failed');
    const code=/HTTP \d+/.test(raw)?'HTTP':raw.includes('HTML instead of asset')?'HTML_ASSET':raw.includes('stale')?'STALE_ASSET':raw.includes('incomplete')?'INCOMPLETE':'FETCH_OR_VALIDATE';
    const message={type:'LEGION_UPDATE_ERROR',build:LEGION_SW_BUILD,completed,total,url,stage,code,message:raw};
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
  if(url==='./'||url==='./index.html'){const s=await textOf(response);if(!s.includes('ui/skins/rxui/cobalt.css')||!s.includes('ui/classic-polish/classic-controls.css')||!s.includes('platform/pilot-live-edit.js')||!s.includes('runtime/race-event-bus.js')||!s.includes('runtime/race-clock-adapter.js')||!s.includes('runtime/race-test-source-adapter.js')||!s.includes('simulation/race-simulator.js')||!s.includes('runtime/competition-scheduler.js')||!s.includes('runtime/competition-autopilot.js')||!s.includes('runtime/active-race-controller.js')||!s.includes('modes/classic-rc/efra-engine.js')||!s.includes('modes/classic-rc/audio-actions.js')||!s.includes('ui/classic-rc/classic-rc-ui.js')||!s.includes('ui/classic-rc/classic-rc.css')||s.includes('designQuickBtn')||s.includes('Design Lab'))throw new Error(`${url}: stale RC67 index or Design Lab still present`);}
  if(url==='./ui/shell/views.js'){const s=await textOf(response);if(!s.includes('COBALT · BLUE CONTROL')||!s.includes('raceSessionSettingsModal')||!s.includes('data-race-pilot-profile')||!s.includes('updateDownloadProgress')||!s.includes('legionrx_settings_section')||s.includes('racePilotEditModal')||s.includes('openDesignLab')||s.includes('Design Lab'))throw new Error(`${url}: stale settings/update view`);}
  if(url==='./ui/shell/router.js'){const s=await textOf(response);if(!s.includes('homeViewClassic')||!s.includes('homeViewRxui')||!s.includes('classicCockpit')||!s.includes('EFRA 2026'))throw new Error(`${url}: stale Classic RC router/home`);}
  if(url==='./modes/rallycross/index.js'){const s=await textOf(response);if(!s.includes('function eventSessionSettings'))throw new Error(`${url}: stale session rule adapter`);}
  if(url==='./modes/rallycross/runtime.js'){const s=await textOf(response);if(!s.includes('function applyCurrentSessionSettings')||!s.includes('function restartCurrentSession')||!s.includes('function startRaceTestSourceForCurrentSession')||!s.includes('raceClockScale')||s.includes('raceSimulator'))throw new Error(`${url}: stale/coupled RC61 race runtime`);}
  if(url==='./modes/rallycross/finals.js'){const s=await textOf(response);if(!s.includes('thirdResult')||!s.includes('discarded third result')||s.includes('compareRunPerformance'))throw new Error(`${url}: stale hidden-time Final A tie-break`);}
  if(url==='./simulation/race-simulator.js'){const s=await textOf(response);if(!s.includes('class LegionRaceSimulator')||!s.includes('raceTestSourceAdapter.register')||!s.includes('startSession(context')||!s.includes("mode:'normal'")||!s.includes("'dense'"))throw new Error(`${url}: stale/unregistered race simulator engine`);}
  if(url==='./runtime/race-event-bus.js'){const s=await textOf(response);if(!s.includes('class LegionRaceEventBus')||!s.includes('pilotStatus'))throw new Error(`${url}: invalid race event bus`);}
  if(url==='./runtime/race-clock-adapter.js'){const s=await textOf(response);if(!s.includes('raceClockAdapter')||!s.includes('setScaleProvider'))throw new Error(`${url}: invalid race clock adapter`);}
  if(url==='./runtime/race-test-source-adapter.js'){const s=await textOf(response);if(!s.includes('raceTestSourceAdapter')||!s.includes('raceEventBus.pass')||!s.includes('raceClockAdapter.setScaleProvider'))throw new Error(`${url}: invalid test source adapter`);}
  if(url==='./platform/pilot-live-edit.js'){const s=await textOf(response);if(!s.includes('function updateActiveRacePilotIdentity'))throw new Error(`${url}: stale live pilot editor`);}
  if(url==='./ui/pilots/pilot-cards.js'){const s=await textOf(response);if(!s.includes('pilotRaceEntryForProfile')||!s.includes('updateActiveRacePilotIdentity')||!s.includes('raceModel'))throw new Error(`${url}: stale pilot profile live-sync`);}
  if(url==='./ui/shell/actions.js'){const s=await textOf(response);if(!s.includes("action==='restart-session'")||!s.includes("action==='session-settings'")||!s.includes("action==='race-simulator'")||!s.includes('legionrx_settings_section')||s.includes('open-design-lab'))throw new Error(`${url}: stale RC59 settings action bindings`);}
  if(url==='./platform/updater.js'){const s=await textOf(response);if(!s.includes('LEGION_UPDATE_PROGRESS')||!s.includes('LEGION_UPDATE_ERROR')||!s.includes('errorUrl')||!s.includes('legionrx_resume_settings_section')||!s.includes('legionrx_post_update'))throw new Error(`${url}: stale updater without diagnostics/progress/resume`);}
  if(url==='./ui/shell/offline-runtime.js'){const s=await textOf(response);if(!s.includes('[data-update-progress]')||!s.includes('data-update-progress-bar'))throw new Error(`${url}: stale update progress UI runtime`);}
  if(url==='./boot.js'){const s=await textOf(response);if(!s.includes('legionrx_resume_settings_section')||!s.includes('raceEventBus.addEventListener')||!s.includes('raceEventBus.pass')||!s.includes('ActiveRaceController.processPass'))throw new Error(`${url}: stale boot without neutral active race controller`);}
  if(url==='./ui/shell/app.css'){const s=await textOf(response);if(!s.includes('RXUI UNIFIED SHELL SYSTEM')||!s.includes('RC58 · IN-COCKPIT SESSION SETTINGS')||!s.includes('RC60 · RACE SIMULATOR')||!s.includes('.updateProgressTrack')||s.includes('.designQuickBtn')||s.includes('.designDrawer'))throw new Error(`${url}: stale RC59 shell CSS`);}
  if(url==='./ui/discipline-ui.js'){const s=await textOf(response);if(!s.includes('rxnTimeValue')||!s.includes('data-action=\"restart-session\"')||!s.includes('data-action=\"session-settings\"')||!s.includes('data-action=\"race-simulator\"')||!s.includes('function raceSimulatorModal')||!s.includes('function rxnSystemClockText')||!s.includes('ДО ФИНИША')||!s.includes('data-rxn-best-name'))throw new Error(`${url}: stale RC61 cockpit info`);}
  if(url==='./runtime/competition-scheduler.js'){const s=await textOf(response);if(!s.includes('const CompetitionScheduler')||!s.includes('const canStart=')||!s.includes('const finish=')||!s.includes('adjustBreakMinutes')||!s.includes('skipHeat')||!s.includes('ignoreMinGap')||!s.includes('setHeatDuration')||!s.includes('shiftStart')||!s.includes('restartHeat')||s.includes('RallyCross')||s.includes('ClassicRC'))throw new Error(`${url}: stale/non-neutral competition scheduler`);}
  if(url==='./runtime/competition-autopilot.js'){const s=await textOf(response);if(!s.includes('const CompetitionAutoPilot')||!s.includes('nextAction')||!s.includes('reviewDelayMs')||s.includes('RallyCross')||s.includes('ClassicRC'))throw new Error(`${url}: stale/non-neutral competition autopilot`);}
  if(url==='./runtime/active-race-controller.js'){const s=await textOf(response);if(!s.includes('ClassicRCRuntime.processPass')||!s.includes('ClassicRCRuntime.processPilotStatus')||!s.includes('ClassicRCRuntime.handleSourceComplete')||!s.includes('processPass(detail.transponder'))throw new Error(`${url}: stale active race controller`);}
  if(url==='./modes/classic-rc/efra-rules.js'){const s=await textOf(response);if(!s.includes('efra-2026-round-by-round')||!s.includes('qualifyingCountTable')||!s.includes('classicRCBuildFinalStandings'))throw new Error(`${url}: stale EFRA rule module`);}
  if(url==='./modes/classic-rc/groups.js'){const s=await textOf(response);if(!s.includes('classicRCOffroadHeatOrder')||!s.includes('classicRCFinalGroupsFromQualification'))throw new Error(`${url}: stale EFRA grouping module`);}
  if(url==='./modes/classic-rc/efra-engine.js'){const s=await textOf(response);if(!s.includes('legionrx4_classic_rc_efra_event_v1')||!s.includes('buildFinals')||!s.includes('CompetitionScheduler')||!s.includes('updateCurrentHeatSettings')||!s.includes('pauseCompetition')||!s.includes('shiftScheduleStart')||!s.includes('restartCurrentEvent')||!s.includes('CompetitionScheduler.skipHeat'))throw new Error(`${url}: stale Classic RC engine`);}
  if(url==='./modes/classic-rc/audio-actions.js'){const s=await textOf(response);if(!s.includes('const ClassicRCAudio')||!s.includes('announcer.playBleep')||!s.includes('pilotVoices.play')||!s.includes('timeExpired')||!s.includes('heatResults')||s.includes('getEventStartPilots')||s.includes('state.race?.'))throw new Error(`${url}: stale/coupled Classic RC audio adapter`);}
  if(url==='./modes/classic-rc/efra-runtime.js'){const s=await textOf(response);if(!s.includes('const ClassicRCRuntime')||!s.includes("ev.stage==='qualifying'")||!s.includes('canStartScheduleHeat')||!s.includes('rawNowEpoch')||!s.includes('cycleSimulationSpeed')||!s.includes('restartCurrentEvent')||!s.includes('ClassicRCAudio.countdownTick')||!s.includes('ClassicRCAudio.bleep')||!s.includes('ClassicRCAudio.bestLap')||!s.includes('startAutoDay')||!s.includes('CompetitionAutoPilot.nextAction')||!s.includes("['seeding','controlled','finalPractice','qualifying'].includes(ev.stage)")||s.includes('raceSimulator')||s.includes('rxnFormatDuration')||s.includes('document.'))throw new Error(`${url}: stale/coupled Classic RC runtime`);}
  if(url==='./ui/classic-rc/classic-rc-ui.js'){const s=await textOf(response);if(!s.includes('classicRCScheduleDrawer')||!s.includes("current?.status||''}:${current?.kind||''}:${snap.hold}")||!s.includes('classicRCScheduleStatusStrip')||!s.includes('classicScheduleNext')||!s.includes('Math.ceil((Number(ms)||0)/1000)')||!s.includes('НАЧАТЬ СЕЙЧАС')||!s.includes('ОСТАНОВИТЬ СОРЕВНОВАНИЕ')||!s.includes('СТАРТ ДНЯ')||!s.includes('РЕСТАРТ ЗАЕЗДА')||!s.includes('classicScheduleInlineAdjust')||!s.includes('classicRCAutoDayControls')||!s.includes('auto-start-day')||!s.includes('sim-speed')||!s.includes('classicRCBindActionElement')||!s.includes("dataset.classicBound='1'")||!s.includes('preserveScroll=true')||!s.includes('classicRCHeatProtocolsSection')||!s.includes('classicRCLapMatrix')||!s.includes('РЕЗУЛЬТАТ ЗАЕЗДА')||!s.includes('directorOverride:true')||!s.includes('classicRCHeatProtocolsSection')||!s.includes('classicResultsCockpit')||!s.includes('classicRCRaceSettingsModal')||!s.includes('classicFinalRankRow')||!s.includes('ИТОГОВЫЙ РЕЙТИНГ ФИНАЛОВ')||s.includes('classicRCEnsureDelegatedBindings')||!s.includes('EFRA 2026'))throw new Error(`${url}: stale Classic RC UI`);}
  if(url==='./ui/classic-rc/classic-rc.css'){const s=await textOf(response);if(!s.includes('.classicScheduleDrawer')||!s.includes('orientation:portrait')||!s.includes('#classicScheduleHost{')||!s.includes('position:fixed;inset:0')||!s.includes('grid-template-rows:38px minmax(145px,34%) minmax(0,1fr)')||!s.includes('.classicScheduleClock')||!s.includes('.classicScheduleDayAdjust')||!s.includes('.classicScheduleInlineAdjust')||!s.includes('.classicResultsCockpit')||!s.includes('.classicHeatProtocol')||!s.includes('.classicRunCard')||!s.includes('.classicLapMatrix')||!s.includes('.classicProtocolTable')||!s.includes('.classicRaceSettingsModal')||!s.includes('.classicFinalRankRow')||!s.includes('bottom:125px')||!s.includes('position:absolute!important')||!s.includes('.classicScheduleTail.open{opacity:0')||s.includes('.classicScheduleDrawer button,.classicScheduleTail{\n  position:relative'))throw new Error(`${url}: stale schedule portal/status style`);}
  if(url==='./ui/skins/rxui/cobalt.css'){const s=await textOf(response);if(!s.includes('data-skin="cobalt"'))throw new Error(`${url}: invalid COBALT skin`);}
  if(url==='./ui/skins/rxui/base.css'){const s=await textOf(response);if(!s.includes('NON-CLASSIC WORKSPACE WALLPAPER')||!s.includes('workspace-landscape.webp')||!s.includes('workspace-portrait.webp'))throw new Error(`${url}: stale workspace wallpaper layer`);}
  if(url==='./ui/shell/discipline-pults.css'){const s=await textOf(response);if(!s.includes('Landscape phone / narrow browser viewport')||!s.includes('.rxnTimeValue')||!s.includes('.rxnPilotStatsProfileEdit')||!s.includes('.rxnSimulatorButton')||!s.includes('.rxnSystemClock')||!s.includes('.rxnMobileRaceInfo'))throw new Error(`${url}: stale RC61 cockpit/profile CSS`);}
  if(url==='./ui/classic-polish/classic-controls.css'){const s=await textOf(response);if(!s.includes('data-skin="classic"'))throw new Error(`${url}: invalid Classic polish CSS`);}
  if(url==='./ui/classic-polish/classic-icons.js'){const s=await textOf(response);if(!s.includes('ClassicControlPolish'))throw new Error(`${url}: invalid Classic polish icons`);}
  if(url==='./offline-manifest.js'){const s=await textOf(response);if(!s.includes('4.2.0-clean-full-rc75-auto-race-day-final-breaks')||!s.includes('./runtime/competition-autopilot.js')||!s.includes('./runtime/race-event-bus.js'))throw new Error(`${url}: stale RC75 release manifest`);}
  if(url==='./VERSION.txt'){const s=await textOf(response);if(!s.includes('RC75')||!s.includes('AUTO RACE DAY + FINAL BREAKS'))throw new Error(`${url}: stale VERSION`);}
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
  const cache=await caches.open(CACHE),total=PACKAGE.length;let completed=0,currentUrl='',stage='local';
  await broadcastUpdateProgress(0,total,'');
  try{
    for(const url of LOCAL){
      currentUrl=url;stage='local';let response=null;
      try{response=await fetchFresh(url);}catch(error){
        if(FRESH_REQUIRED.has(url))throw error;
        const previous=await caches.match(url,{ignoreSearch:false});
        if(previous){try{await validate(url,previous);response=previous;}catch{response=null;}}
        if(!response)throw error;
      }
      await cache.put(url,response.clone());completed++;await broadcastUpdateProgress(completed,total,url);
    }
    for(const url of EXTERNAL){currentUrl=url;stage='external';const response=await fetchExternal(url);await cache.put(url,response.clone());completed++;await broadcastUpdateProgress(completed,total,url);}
    currentUrl='complete';stage='package-validation';
    if(!(await packageComplete()))throw new Error('candidate package incomplete');
    await broadcastUpdateProgress(total,total,'complete');
  }catch(error){await broadcastUpdateError(error,{completed,total,url:currentUrl,stage});await caches.delete(CACHE);throw error;}
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
