'use strict';
function newTrackDayDraft(){
  return {id:uid('trackday'),schemaVersion:2,name:`Track Day · ${new Date().toLocaleDateString('ru-RU')}`,date:new Date().toISOString().slice(0,10),durationMin:30,pitTimeoutSec:120,minLapSec:Math.max(1,Math.min(60,Number(state.settings.minLapSec||2))),pilotIds:state.pilotDb.map(p=>p.id),pilots:[],status:'setup',createdAt:new Date().toISOString(),startedAtEpoch:null,finishedAtEpoch:null,elapsedFinalMs:null,live:{},unknown:{},corrections:[],lastPass:'',lastCorrection:'',note:''};
}

function trackPilot(td,id){return (td?.pilots||[]).find(p=>String(p.id)===String(id))||state.pilotDb.find(p=>String(p.id)===String(id));}

function trackElapsed(td=state.trackDay){if(!td)return 0;if(Number.isFinite(td.elapsedFinalMs))return td.elapsedFinalMs;if(td.status!=='active'||!td.startedAtEpoch)return 0;return Math.max(0,Date.now()-td.startedAtEpoch);}

function trackRemaining(td=state.trackDay){return Math.max(0,(Number(td?.durationMin||0)*60000)-trackElapsed(td));}

function blankTrackLive(){return{laps:0,bestLapMs:Infinity,lastLapMs:null,lastDeviceMs:null,lastElapsedAtPass:null,startSeen:false,startSeenAtMs:null,lapTimes:[],status:'READY',pitCount:0,totalPitMs:0,lastPitDurationMs:null,pitStartedAtElapsedMs:null,pitOutAtElapsedMs:null,pitOutUntilEpoch:0,pitEvents:[]};}

function ensureTrackDayState(td){if(!td)return td;td.live=td.live||{};td.unknown=td.unknown||{};td.corrections=Array.isArray(td.corrections)?td.corrections:[];td.schemaVersion=Math.max(2,Number(td.schemaVersion||1));if(td.pitTimeoutSec===undefined||td.pitTimeoutSec===null||Number.isNaN(Number(td.pitTimeoutSec)))td.pitTimeoutSec=120;td.pitTimeoutSec=Math.max(0,Number(td.pitTimeoutSec));if(td.minLapSec===undefined||td.minLapSec===null||Number.isNaN(Number(td.minLapSec)))td.minLapSec=Math.max(1,Math.min(60,Number(state.settings.minLapSec||2)));td.minLapSec=Math.max(1,Math.min(60,Number(td.minLapSec)));(td.pilots||[]).forEach(p=>{const l=td.live[p.id]||(td.live[p.id]=blankTrackLive());l.lapTimes=Array.isArray(l.lapTimes)?l.lapTimes.filter(Number.isFinite):[];l.laps=l.lapTimes.length||Number(l.laps||0);const sm=lapSummary({lapTimes:l.lapTimes});l.bestLapMs=sm.best??(Number.isFinite(l.bestLapMs)?l.bestLapMs:Infinity);if(l.lapTimes.length)l.lastLapMs=l.lapTimes[l.lapTimes.length-1];else if(l.laps===0)l.lastLapMs=null;l.pitCount=Math.max(0,Number(l.pitCount||0));l.totalPitMs=Math.max(0,Number(l.totalPitMs||0));l.pitEvents=Array.isArray(l.pitEvents)?l.pitEvents:[];l.pitOutUntilEpoch=Math.max(0,Number(l.pitOutUntilEpoch||0));});return td;}

function recomputeTrackLapStats(l){if(!l)return l;l.lapTimes=lapArray(l);l.laps=l.lapTimes.length;l.bestLapMs=l.lapTimes.length?Math.min(...l.lapTimes):Infinity;l.lastLapMs=l.lapTimes.length?l.lapTimes[l.lapTimes.length-1]:null;return l;}

function trackDayCorrectionLog(td,pilotId){return (td?.corrections||[]).filter(c=>c?.type==='lap_removed'&&String(c.pilotId)===String(pilotId));}

function persistTrackDayCorrection(td){
  if(!td)return;
  td.updatedAt=new Date().toISOString();delete td._boardSig;delete td._rxnBoardSig;
  if(td.status==='finished'){
    const idx=(state.trackDays||[]).findIndex(x=>String(x.id)===String(td.id));
    const clean=deepClone(td);ensureTrackDayState(clean);
    if(idx>=0)state.trackDays[idx]=clean;else state.trackDays.push(clean);
  }
  if(state.trackDay&&String(state.trackDay.id)===String(td.id)&&state.trackDay!==td){state.trackDay=deepClone(td);ensureTrackDayState(state.trackDay);}
  persistTrackDays();
}

function removeTrackDayLap(td,pilotId,lapIndex){
  td=ensureTrackDayState(td);if(!td)return{ok:false,error:'Track Day не найден'};
  const p=trackPilot(td,pilotId),l=td.live?.[pilotId];if(!p||!l)return{ok:false,error:'Пилот или статистика не найдены'};
  const times=lapArray(l),idx=Number(lapIndex);if(!Number.isInteger(idx)||idx<0||idx>=times.length)return{ok:false,error:'Круг уже отсутствует'};
  const removedMs=times[idx];l.lapTimes=[...times.slice(0,idx),...times.slice(idx+1)];recomputeTrackLapStats(l);
  td.corrections=Array.isArray(td.corrections)?td.corrections:[];
  td.corrections.push({id:uid('lapfix'),type:'lap_removed',pilotId:p.id,pilotName:p.name,lapNumber:idx+1,lapMs:removedMs,removedAt:new Date().toISOString(),reason:'judge'});
  td.lastCorrection=`${p.name} · круг ${idx+1} (${fmtMs(removedMs)}) исключён судьёй`;
  if(td.status==='active')td.lastPass=td.lastCorrection;
  persistTrackDayCorrection(td);
  return{ok:true,pilot:p,removedMs,lapNumber:idx+1,bestLapMs:Number.isFinite(l.bestLapMs)?l.bestLapMs:null,laps:l.laps};
}

function trackPitTimeoutMs(td=state.trackDay){const sec=Number(td?.pitTimeoutSec||0);return sec>0?sec*1000:0;}

function trackMinLapSec(td=state.trackDay){return Math.max(1,Math.min(60,Number(td?.minLapSec||state.settings.minLapSec||2)));}

function trackMinLapMs(td=state.trackDay){return trackMinLapSec(td)*1000;}

function trackPitTimeoutLabel(td=state.trackDay){const sec=Number(td?.pitTimeoutSec||0);if(sec<=0)return'Выкл.';if(sec%60===0)return`${sec/60} мин`;return`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;}

function trackPitTotalMs(l,td=state.trackDay){let total=Math.max(0,Number(l?.totalPitMs||0));if(l?.status==='PIT'&&Number.isFinite(l.pitStartedAtElapsedMs))total+=Math.max(0,trackElapsed(td)-l.pitStartedAtElapsedMs);return total;}

function trackLiveDisplay(l){if(!l?.startSeen)return{text:'ОЖИДАЕМ',cls:''};if(l.status==='PIT')return{text:'PIT',cls:'pit'};if(l.status==='PIT_OUT'&&Date.now()<Number(l.pitOutUntilEpoch||0))return{text:'PIT OUT',cls:'pitout'};if((l.laps||0)===0)return{text:'ЗАСЕЧКА ✓',cls:'ok'};return{text:'НА ТРАССЕ',cls:'ok'};}

function enterTrackPit(td,p,l,elapsedNow){const timeout=trackPitTimeoutMs(td);if(!timeout||!l.startSeen||l.status==='PIT'||!Number.isFinite(l.lastElapsedAtPass))return false;const threshold=l.lastElapsedAtPass+timeout;if(elapsedNow<threshold)return false;l.status='PIT';l.pitCount=Math.max(0,Number(l.pitCount||0))+1;l.pitStartedAtElapsedMs=threshold;l.pitOutAtElapsedMs=null;l.pitOutUntilEpoch=0;l.lastDeviceMs=null;l.pitEvents=Array.isArray(l.pitEvents)?l.pitEvents:[];l.pitEvents.push({inAtMs:threshold,outAtMs:null,durationMs:null});td.live[p.id]=l;td.lastPass=`${p.name} · PIT · незавершённый круг сброшен`;return true;}

function exitTrackPit(td,p,l,elapsedNow,deviceMs){const start=Number.isFinite(l.pitStartedAtElapsedMs)?l.pitStartedAtElapsedMs:elapsedNow;const duration=Math.max(0,elapsedNow-start);l.totalPitMs=Math.max(0,Number(l.totalPitMs||0))+duration;l.lastPitDurationMs=duration;l.pitStartedAtElapsedMs=null;l.pitOutAtElapsedMs=elapsedNow;l.pitOutUntilEpoch=Date.now()+8000;l.status='PIT_OUT';l.lastElapsedAtPass=elapsedNow;l.lastDeviceMs=Number.isFinite(deviceMs)?deviceMs:null;const events=Array.isArray(l.pitEvents)?l.pitEvents:[];const open=[...events].reverse().find(e=>e&&e.outAtMs==null);if(open){open.outAtMs=elapsedNow;open.durationMs=duration;}td.live[p.id]=l;td.lastPass=`${p.name} · PIT OUT`;return true;}

function updateTrackPitStates(td=state.trackDay){if(!td||td.status!=='active'||trackPitTimeoutMs(td)<=0)return false;const elapsed=trackElapsed(td);let changed=false;(td.pilots||[]).forEach(p=>{const l=td.live?.[p.id]||blankTrackLive();if(enterTrackPit(td,p,l,elapsed))changed=true;});if(changed)persistTrackDays();return changed;}

function finalizeOpenTrackPits(td,elapsedNow){(td?.pilots||[]).forEach(p=>{const l=td.live?.[p.id];if(!l||l.status!=='PIT'||!Number.isFinite(l.pitStartedAtElapsedMs))return;const duration=Math.max(0,elapsedNow-l.pitStartedAtElapsedMs);l.totalPitMs=Math.max(0,Number(l.totalPitMs||0))+duration;l.lastPitDurationMs=duration;const open=[...(l.pitEvents||[])].reverse().find(e=>e&&e.outAtMs==null);if(open){open.outAtMs=elapsedNow;open.durationMs=duration;}l.pitStartedAtElapsedMs=null;});}

function lapArray(live){return Array.isArray(live?.lapTimes)?live.lapTimes.filter(Number.isFinite):[];}

function lapSummary(live){const a=lapArray(live);if(!a.length)return{count:0,best:null,avg:null,worst:null,avgIndex:-1};const best=Math.min(...a),worst=Math.max(...a),avg=a.reduce((s,v)=>s+v,0)/a.length;let avgIndex=0,dist=Infinity;a.forEach((v,i)=>{const d=Math.abs(v-avg);if(d<dist){dist=d;avgIndex=i;}});return{count:a.length,best,avg,worst,avgIndex};}

function rankTrackPilots(td=state.trackDay){
  ensureTrackDayState(td);const pilots=(td?.pilots||[]).map(p=>({...p}));
  return pilots.sort((a,b)=>{const A=td.live?.[a.id]||blankTrackLive(),B=td.live?.[b.id]||blankTrackLive();if(B.laps!==A.laps)return B.laps-A.laps;const ab=Number.isFinite(A.bestLapMs)?A.bestLapMs:Infinity,bb=Number.isFinite(B.bestLapMs)?B.bestLapMs:Infinity;if(ab!==bb)return ab-bb;return String(a.name).localeCompare(String(b.name),'ru');});
}

function trackBest(td=state.trackDay){ensureTrackDayState(td);let out=null;(td?.pilots||[]).forEach(p=>{const l=td.live?.[p.id],ms=lapSummary(l||{}).best;if(Number.isFinite(ms)&&(!out||ms<out.ms))out={pilot:p,ms};});return out;}

async function finishTrackDay(reason='Сессия завершена'){
 const td=state.trackDay;if(!td||td.status!=='active'||state.trackEnding)return;state.trackEnding=true;
 try{td.elapsedFinalMs=trackElapsed(td);finalizeOpenTrackPits(td,td.elapsedFinalMs);td.status='finished';td.finishedAtEpoch=Date.now();td.note=reason;if(lapwiz.connected&&lapwiz.running&&lapwiz.currentMode==='practice'){try{await lapwiz.stop();}catch(e){toast(`LapWiz STOP: ${e.message}`);}}const clean=deepClone(td);delete clean._boardSig;const idx=state.trackDays.findIndex(x=>x.id===td.id);if(idx>=0)state.trackDays[idx]=clean;else state.trackDays.push(clean);persistTrackDays();toast(reason);render();}finally{state.trackEnding=false;}
}

function processTrackPass(transponder,deviceMs=null,source='MANUAL'){
 const td=ensureTrackDayState(state.trackDay);if(!td||td.status!=='active')return;const p=(td.pilots||[]).find(x=>String(x.transponder)===String(transponder));
 if(!p){td.unknown[transponder]=(td.unknown[transponder]||0)+1;if(source==='LAPWIZ')lapwiz.unknownBeep();td.lastPass=`Неизвестный ID ${transponder}`;persistTrackDays();updateTrackDayDynamic();return;}
 const l=td.live[p.id]||blankTrackLive(),elapsed=trackElapsed(td);
 const acceptedBleep=()=>{if(source==='LAPWIZ'&&state.settings.lapSound)announcer.playBleep();};
 if(!l.startSeen){l.startSeen=true;l.startSeenAtMs=elapsed;l.lastElapsedAtPass=elapsed;l.lastDeviceMs=Number.isFinite(deviceMs)?deviceMs:null;l.status='SEEN';td.live[p.id]=l;td.lastPass=`${p.name} · ЗАСЕЧКА ✓`;acceptedBleep();persistTrackDays();updateTrackDayDynamic();return;}
 // Safety: check PIT timeout here too, so a late pass can never become a giant lap between UI ticker updates.
 if(l.status!=='PIT')enterTrackPit(td,p,l,elapsed);
 if(l.status==='PIT'){exitTrackPit(td,p,l,elapsed,deviceMs);acceptedBleep();persistTrackDays();updateTrackDayDynamic();return;}
 let lapMs=null;if(Number.isFinite(deviceMs)&&Number.isFinite(l.lastDeviceMs)&&deviceMs>l.lastDeviceMs)lapMs=deviceMs-l.lastDeviceMs;if(!Number.isFinite(lapMs)||lapMs<=0)lapMs=elapsed-(Number.isFinite(l.lastElapsedAtPass)?l.lastElapsedAtPass:elapsed);
 const minLapMs=trackMinLapMs(td);if(Number.isFinite(lapMs)&&lapMs>0&&lapMs<minLapMs){td.lastPass=`${p.name} · ${fmtMs(lapMs)} < ${trackMinLapSec(td)}с · проход отклонён`;persistTrackDays();updateTrackDayDynamic();return;}
 const oldBest=trackBest(td),isNewSessionBest=Number.isFinite(lapMs)&&(!oldBest||!Number.isFinite(oldBest.ms)||lapMs<oldBest.ms);
 if(Number.isFinite(deviceMs))l.lastDeviceMs=deviceMs;l.lastElapsedAtPass=elapsed;l.lastLapMs=lapMs;l.lapTimes=lapArray(l);l.lapTimes.push(lapMs);recomputeTrackLapStats(l);l.status='RACING';l.pitOutUntilEpoch=0;td.live[p.id]=l;td.lastPass=`${p.name} · круг ${l.laps} · ${fmtMs(lapMs)}`;acceptedBleep();persistTrackDays();if(isNewSessionBest)announceBestLap(p);updateTrackDayDynamic();
}

function initFreePracticeState(){if(state.trackDay)ensureTrackDayState(state.trackDay);(state.trackDays||[]).forEach(ensureTrackDayState);}

function startTrackTicker(){if(state.trackTick)clearInterval(state.trackTick);state.trackTick=setInterval(()=>{updateTrackPitStates();updateTrackDayDynamic();if(state.trackDay?.status==='active'&&trackRemaining(state.trackDay)<=0&&!state.trackEnding)finishTrackDay('Время сессии истекло');},250);updateTrackPitStates();updateTrackDayDynamic();}
