'use strict';
function liveRanking(pilots,session){if(!session)return pilots;return [...pilots].sort((a,b)=>{const A=session.live?.[a.id]||blankLive(),B=session.live?.[b.id]||blankLive();if(B.laps!==A.laps)return B.laps-A.laps;if(A.finished!==B.finished)return A.finished?-1:1;return (A.elapsedMs||Infinity)-(B.elapsedMs||Infinity)||(a.registrationOrder||999)-(b.registrationOrder||999);});}

function sessionElapsed(s){if(!s)return 0;if(Number.isFinite(s.elapsedFinalMs))return s.elapsedFinalMs;const base=Number(s.elapsedBeforePause)||0;if(s.phase==='paused'||!s.startedAtPerf)return base;return base+(performance.now()-s.startedAtPerf);}

function startTicker(){if(state.sessionTick)clearInterval(state.sessionTick);state.sessionTick=setInterval(()=>{if(state.view!=='cockpit')return;updateDynamicCockpit();checkSessionLimit();},120);}

function logEvent(text){state.race.runtime.eventLog.push({time:new Date().toISOString(),text});persistRace();}

async function pauseSession(){const s=state.session;if(!s)return;if(s.phase==='paused')return resumeSession();if(!['running','finishing'].includes(s.phase))return;s.elapsedBeforePause=sessionElapsed(s);s.startedAtPerf=null;s.resumePhase=s.phase;s.phase='paused';Object.values(s.live).forEach(v=>{v.lastPassPerf=null;v.lastDeviceMs=null;});if(lapwiz.connected&&lapwiz.running){try{await lapwiz.stop();}catch(e){toast(`LapWiz STOP: ${e.message}`);}}logEvent('Пауза');render();}

async function resumeSession(){const ev=currentEvent(state.race),s=state.session;if(!ev||s?.phase!=='paused')return;const rule=eventRule(state.race,ev);if(lapwiz.connected){try{const rr={...rule};if(rr.limitType==='time')rr.durationMin=Math.max(1/60,(timerTotalMs(ev,s)-sessionElapsed(s))/60000);await lapwiz.start(rr);}catch(e){toast(`LapWiz RESUME: ${e.message}`);return;}}s.phase=s.resumePhase||'running';s.startedAtPerf=performance.now();Object.values(s.live).forEach(v=>{v.lastPassPerf=null;v.lastDeviceMs=null;});logEvent('Продолжение после паузы');startTicker();render();}

async function addMinute(){const ev=currentEvent(state.race),s=state.session;if(!ev||!s)return;const rule=eventRule(state.race,ev);if(rule.limitType!=='time')return toast('+1 мин доступна только для заезда по времени');s.extraMs=(s.extraMs||0)+60000;if(s.phase==='finishing'&&sessionElapsed(s)<timerTotalMs(ev,s)){s.phase='running';s.timeExpired=false;Object.values(s.live).forEach(v=>v.needsFinish=false);}if(s.phase==='paused'&&s.resumePhase==='finishing'&&sessionElapsed(s)<timerTotalMs(ev,s)){s.resumePhase='running';s.timeExpired=false;Object.values(s.live).forEach(v=>v.needsFinish=false);}logEvent('Добавлена 1 минута');if(lapwiz.connected&&lapwiz.running){try{await lapwiz.stop();const remaining=Math.max(1000,timerTotalMs(ev,s)-sessionElapsed(s));await lapwiz.start({...rule,durationMin:remaining/60000});Object.values(s.live).forEach(v=>{v.lastDeviceMs=null;});}catch(e){toast(`LapWiz +1 мин: ${e.message}`);}}toast('К заезду добавлена 1 минута');updateDynamicCockpit();}

async function finishSession(reason='Финиш судьёй'){const s=state.session;if(!s)return;const elapsed=sessionElapsed(s);if(lapwiz.connected&&lapwiz.running){try{await lapwiz.stop();}catch(e){toast(`STOP: ${e.message}`);}}s.elapsedFinalMs=elapsed;s.phase='finished';s.finishedAtEpoch=Date.now();logEvent(reason);state.resultsOpen=true;state.widgetCollapsed.results=false;if(/Все пилоты/.test(reason))announceService('allPilotsFinished');else if(!/Аварийный|остановлен/i.test(reason))announceService('heatFinished');render();}

function checkSessionLimit(){const ev=currentEvent(state.race),s=state.session;if(!ev||!s||s.phase!=='running')return;const r=eventRule(state.race,ev),elapsed=sessionElapsed(s),limit=r.durationMin*60000+(s.extraMs||0),remaining=limit-elapsed;if(r.limitType==='time'&&remaining<=60000&&remaining>0&&!s.raceOneMinuteAnnounced){s.raceOneMinuteAnnounced=true;announceService('oneMinuteLeft');}if(r.limitType==='time'&&elapsed>=limit&&!s.timeExpired){s.timeExpired=true;s.phase='finishing';Object.values(s.live).forEach(v=>{if(!v.finished)v.needsFinish=true;});announceService('timeExpired').then(()=>announceService('finishCurrentLap'));toast('Время истекло — финиш на следующем проходе');}if(r.limitType==='laps'){const all=Object.values(s.live).every(v=>v.finished);if(all)finishSession('Все пилоты финишировали');}}

function clearPrestartTimers(){(state.prestartTimers||[]).forEach(clearTimeout);state.prestartTimers=[];}

function schedulePrestartAt(perf,fn){const id=setTimeout(fn,Math.max(0,perf-performance.now()));state.prestartTimers.push(id);return id;}

function raceWarmupMinutes(){return Math.max(1,Math.min(5,Number(state.race?.raceSettings?.warmupMinutes??state.settings.warmupMinutes??2)));}

function warmupRemainingMs(s){return s?.warmupEndsAtPerf?Math.max(0,s.warmupEndsAtPerf-performance.now()):0;}

function warmupSeenCount(s){return Object.keys(s?.warmupDetected||{}).length;}

function minuteWords(n){return n===1?'одна минута':n===2?'две минуты':n===3?'три минуты':n===4?'четыре минуты':'пять минут';}

function scheduleAlignedStart(s){
  const deadline=s.warmupEndsAtPerf;
  const sec=Math.max(1,Math.min(10,Number(state.race?.raceSettings?.countdownSec||state.settings.countdownSec||10)));

  schedulePrestartAt(deadline-sec*1000-1450,()=>{
    if(state.session!==s||!['warmup','countdown'].includes(s.phase))return;
    s.phase='countdown';s.countdownLeft=sec;announcer.play('goodRace',{wait:false});render();
  });
  for(let n=sec;n>=1;n--){
    schedulePrestartAt(deadline-n*1000,()=>{
      if(state.session===s&&['warmup','countdown'].includes(s.phase)){
        s.countdownLeft=n;announcer.play(`countdown_${n}`,{wait:false});updateDynamicCockpit();
      }
    });
  }

  schedulePrestartAt(deadline,async()=>{
    if(state.session!==s||!['warmup','countdown'].includes(s.phase))return;
    s.countdownLeft=0;
    announcer.play('startRace',{wait:false,force:true});
    await beginRaceNow();
  });
}

async function beginCountdown(){
  const ev=currentEvent(state.race),s=ensureSession(ev);
  if(!ev||s.phase!=='ready')return;
  clearPrestartTimers();announcer.cancel();announcer.preload();
  const minutes=raceWarmupMinutes(),totalSec=minutes*60;

  if(lapwiz.connected){
    try{
      if(lapwiz.running&&lapwiz.currentMode!=='practice')await lapwiz.stop();
      if(!lapwiz.running){
        await lapwiz.start({mode:'practice',limitType:'time',durationMin:960,targetLaps:0,minLapSec:Number(state.race?.raceSettings?.minLapSec||state.settings.minLapSec||2)});
      }
    }catch(e){toast(`LapWiz Free Practice: ${e.message}`);return;}
  }

  s.phase='warmup';s.warmupTotalSec=totalSec;s.warmupEndsAtPerf=performance.now()+totalSec*1000;
  s.warmupDetected={};s.lastPass='';s.countdownLeft=state.race?.raceSettings?.countdownSec||state.settings.countdownSec||10;s.announcerLine='';
  Object.values(s.live).forEach(v=>Object.assign(v,blankLive()));
  logEvent(`Прогрев перед стартом: ${minutes} мин · LapWiz ${lapwiz.connected?'Free Practice':'не подключён'}`);

  if(minutes>1)announceWarmupMinute(minutes,true);
  for(let n=minutes-1;n>=2;n--){
    schedulePrestartAt(s.warmupEndsAtPerf-n*60000,()=>{
      if(state.session===s&&s.phase==='warmup')announceWarmupMinute(n,false);
    });
  }
  schedulePrestartAt(s.warmupEndsAtPerf-60000,()=>{
    if(state.session===s&&s.phase==='warmup')announceStartCall(ev);
  });
  schedulePrestartAt(s.warmupEndsAtPerf-30000,()=>{
    if(state.session===s&&s.phase==='warmup')announceWarmup30();
  });
  scheduleAlignedStart(s);
  startTicker();render();
}

async function beginRaceNow(){
  const ev=currentEvent(state.race),s=ensureSession(ev),rule=eventRule(state.race,ev);
  try{
    if(lapwiz.connected&&!(lapwiz.running&&lapwiz.currentMode==='practice'))await lapwiz.start(rule);
  }catch(e){toast(`LapWiz START: ${e.message}`);return;}

  clearPrestartTimers();
  s.phase='running';s.startedAtPerf=performance.now();s.startedAtEpoch=Date.now();s.finishedAtEpoch=null;
  s.elapsedBeforePause=0;s.elapsedFinalMs=null;s.extraMs=s.extraMs||0;s.timeExpired=false;s.lapFinishOpen=false;s.lapFinishLeaderId=null;s.lapFinishOpenedAtMs=null;s.warmupEndsAtPerf=null;
  Object.values(s.live).forEach(v=>Object.assign(v,blankLive()));
  s.lastPass='Старт дан · ожидаем первое пересечение засечки';
  logEvent(`HORN / старт: ${ev.label} · LapWiz ${lapwiz.currentMode==='practice'?'Free Practice непрерывно':'Race'}`);
  startTicker();render();
}

async function stopSession(){
  const s=state.session;if(!s)return;
  announcer.cancel();clearPrestartTimers();
  if(['warmup','countdown'].includes(s.phase)){
    if(lapwiz.connected&&lapwiz.running){try{await lapwiz.stop();}catch(e){toast(`LapWiz STOP: ${e.message}`);}}
    s.phase='ready';s.warmupEndsAtPerf=null;s.warmupDetected={};s.lastPass='';
    s.countdownLeft=state.race?.raceSettings?.countdownSec||state.settings.countdownSec||10;
    logEvent('Предстартовая процедура отменена');announceService('raceStopped');render();return;
  }
  announceService('raceStopped');
  await finishSession('Аварийный STOP');
}

function blankLive(){return{laps:0,bestLapMs:Infinity,lastLapMs:null,lastPassPerf:null,lastDeviceMs:null,lastElapsedAtPass:null,elapsedMs:0,finished:false,finishedAt:null,needsFinish:false,status:'READY',startSeen:false,startSeenAtMs:null,lapTimes:[]};}

function ensureSession(ev){
  if(!ev)return null;
  if(state.session?.eventKey!==ev.key){state.session={eventKey:ev.key,phase:'ready',startedAtPerf:null,startedAtEpoch:null,finishedAtEpoch:null,elapsedBeforePause:0,elapsedFinalMs:null,extraMs:0,resumePhase:'running',countdownLeft:state.race.raceSettings.countdownSec,warmupTotalSec:raceWarmupMinutes()*60,warmupEndsAtPerf:null,warmupDetected:{},lapFinishOpen:false,lapFinishLeaderId:null,lapFinishOpenedAtMs:null,live:Object.fromEntries(getEventPilots(state.race,ev).map(p=>[p.id,blankLive()])),unknown:{},lastPass:''};}
  state.session.warmupDetected=state.session.warmupDetected||{};if(state.session.lapFinishOpen===undefined)state.session.lapFinishOpen=false;Object.keys(state.session.live||{}).forEach(id=>{const l=state.session.live[id];if(l.startSeen===undefined)l.startSeen=false;if(l.needsFinish===undefined)l.needsFinish=false;if(!Array.isArray(l.lapTimes))l.lapTimes=[];});return state.session;
}

function processPilotPass(p,deviceMs=null,source='MANUAL'){
  const ev=currentEvent(state.race),s=state.session;if(!ev||!s||!['running','finishing'].includes(s.phase))return;const l=s.live[p.id]||blankLive();if(l.finished)return;const oldHeatBest=Math.min(...Object.values(s.live||{}).map(v=>v?.bestLapMs).filter(Number.isFinite)),now=performance.now(),elapsedNow=sessionElapsed(s);if(!Array.isArray(l.lapTimes))l.lapTimes=[];
  if(!l.startSeen){l.startSeen=true;l.startSeenAtMs=elapsedNow;l.lastPassPerf=now;l.lastElapsedAtPass=elapsedNow;if(Number.isFinite(deviceMs))l.lastDeviceMs=deviceMs;l.elapsedMs=elapsedNow;l.status='STARTED';s.live[p.id]=l;s.lastPass=`${p.name} · СТАРТ ✓`;updateDynamicCockpit();return;}
  let lapMs=null;if(l.laps===0)lapMs=elapsedNow;else if(Number.isFinite(deviceMs)&&source==='LAPWIZ'&&Number.isFinite(l.lastDeviceMs)&&deviceMs>l.lastDeviceMs)lapMs=deviceMs-l.lastDeviceMs;if(!Number.isFinite(lapMs)||lapMs<=0)lapMs=elapsedNow-(Number.isFinite(l.lastElapsedAtPass)?l.lastElapsedAtPass:0);if(Number.isFinite(deviceMs))l.lastDeviceMs=deviceMs;l.lastElapsedAtPass=elapsedNow;l.lastPassPerf=now;l.lastLapMs=lapMs;l.lapTimes.push(lapMs);l.laps=l.lapTimes.length;l.bestLapMs=Math.min(l.bestLapMs,lapMs);l.elapsedMs=elapsedNow;l.status='RACING';const rule=eventRule(state.race,ev),lapFinish=lapRaceFinishDecision(rule,s,l);if(lapFinish.finishPilot){l.finished=true;l.finishedAt=l.elapsedMs;l.needsFinish=false;}if(lapFinish.openFinishWindow&&!s.lapFinishOpen){s.lapFinishOpen=true;s.lapFinishLeaderId=p.id;s.lapFinishOpenedAtMs=l.elapsedMs;Object.entries(s.live).forEach(([id,v])=>{if(String(id)!==String(p.id)&&!v.finished)v.needsFinish=true;});}if(s.phase==='finishing'&&s.timeExpired){l.finished=true;l.finishedAt=l.elapsedMs;l.needsFinish=false;}const newHeatBest=Number.isFinite(lapMs)&&(!Number.isFinite(oldHeatBest)||lapMs<oldHeatBest);s.live[p.id]=l;s.lastPass=`${p.name} · ${l.laps} · ${fmtMs(lapMs)}`;if(l.finished)announcePilotFinish(p);else if(newHeatBest)announceBestLap(p);updateDynamicCockpit();if(Object.values(s.live).every(v=>v.finished)&&(rule.limitType==='laps'||s.phase==='finishing'))finishSession('Все пилоты завершили заезд');
}

function snapshotRaceLapStats(ev){if(!ev||!state.session)return;ev.lapStats={};getEventPilots(state.race,ev).forEach(p=>{const l=state.session.live?.[p.id]||blankLive();ev.lapStats[p.id]={laps:l.laps||0,bestLapMs:Number.isFinite(l.bestLapMs)?l.bestLapMs:null,lastLapMs:l.lastLapMs,lapTimes:[...lapArray(l)],startSeen:Boolean(l.startSeen),elapsedMs:l.elapsedMs||0};});}

function findRawEvent(key){return state.race?.heats?.find(x=>x.key===key)||state.race?.finals?.find(x=>x.key===key)||null;}

function finalizeQualifyingIfNeeded(race){updateStandings(race);normalizeQualifyingEnabled(race);if(race.heats.every(h=>h.saved)){const ties=getExactTieGroups(race).filter(g=>g.some(p=>!Number.isInteger(race.exactTieLots?.[String(p.id)])));if(ties.length)race.stage='tie';else generateFinals(race);}}

function cancelRawEvent(raw){if(!raw||raw.saved)return;raw.saved=true;raw.cancelled=true;raw.cancelledAt=new Date().toISOString();raw.result=[];raw.enabled=false;if(raw.type==='qualifying')finalizeQualifyingIfNeeded(state.race);else{try{advanceFinalists(state.race,raw);}catch(e){console.warn('cancel advance',e);}}}

async function stopActiveRaceForManagement(){announcer.cancel();clearPrestartTimers?.();if(state.session&&['warmup','countdown','running','finishing','paused'].includes(state.session.phase)){if(lapwiz.connected&&lapwiz.running){try{await lapwiz.stop();}catch(e){console.warn(e);}}}state.session=null;}

async function skipRaceEvents(count=1){if(!state.race)return;await stopActiveRaceForManagement();let skipped=0;for(let i=0;i<count;i++){const ev=currentEvent(state.race);if(!ev)break;const raw=findRawEvent(ev.key);if(!raw)break;cancelRawEvent(raw);skipped++;}persistRace();toast(`Отменено заездов: ${skipped}`);closeModal();render();}

async function cancelCurrentQualRound(){const ev=currentEvent(state.race);if(!ev||ev.type!=='qualifying')return toast('Сейчас не квалификационный заезд');if(!confirm(`Отменить всю квалификационную серию Q${ev.round}? Результаты этой серии не будут учитываться.`))return;await stopActiveRaceForManagement();state.race.heats.filter(h=>h.round===ev.round&&!h.saved).forEach(cancelRawEvent);finalizeQualifyingIfNeeded(state.race);persistRace();closeModal();render();}

async function finishQualificationNow(){const ev=currentEvent(state.race);if(!ev||state.race.stage!=='qualifying')return toast('Квалификация уже завершена');if(!confirm('Отменить все оставшиеся квалификационные заезды и перейти к финальной части по уже полученным результатам?'))return;await stopActiveRaceForManagement();state.race.heats.filter(h=>!h.saved).forEach(h=>{h.saved=true;h.cancelled=true;h.result=[];h.enabled=false;});updateStandings(state.race);const ties=getExactTieGroups(state.race).filter(g=>g.some(p=>!Number.isInteger(state.race.exactTieLots?.[String(p.id)])));if(ties.length)state.race.stage='tie';else generateFinals(state.race);persistRace();closeModal();render();}

async function forceFinishCompetition(){if(!state.race)return;if(!confirm('Завершить спортивную часть соревнования сейчас? Все оставшиеся заезды будут отмечены как отменённые.'))return;await stopActiveRaceForManagement();let guard=0;while(currentEvent(state.race)&&guard++<80){cancelRawEvent(findRawEvent(currentEvent(state.race).key));}if(state.race.stage==='tie'||state.race.stage!=='finished'){updateStandings(state.race);state.race.finalProtocol=state.race.pilots.map((p,i)=>({place:i+1,pilotId:p.id,status:'FIN',source:'Досрочное завершение',eventPoints:EVENT_POINTS[i]||0}));state.race.stage='finished';state.race.lifecycleStatus='completed';state.race.completedAt=new Date().toISOString();}persistRace();closeModal();toast('Соревнование завершено досрочно');render();}

async function quickSkipCurrentRace(){
  const ev=currentEvent(state.race);
  if(!ev)return toast('Нет активного заезда');
  if(!confirm(`Пропустить «${ev.label}»? Заезд будет отмечен как отменённый, результат не сохранится, приложение перейдёт к следующему.`))return;
  return skipRaceEvents(1);
}

function syncChampionshipIfFinished(race){if(race.stage!=='finished'||!race.championshipId)return;const c=state.championships.find(x=>x.id===race.championshipId);if(!c)return;normalizeChampionship(c);const stageNo=Number(race.championshipStageNumber)||((c.stages?.length||0)+1),results=race.finalProtocol.map(r=>{const p=getPilot(race,r.pilotId);return{driverId:p.profileId||p.id,name:p.name,place:r.place,points:r.eventPoints,status:r.status};});const stage={number:stageNo,raceId:race.id,name:race.eventName,date:race.eventDate,location:race.eventLocation,results};const idx=c.stages.findIndex(s=>s.raceId===race.id||s.number===stageNo);if(idx>=0)c.stages[idx]=stage;else c.stages.push(stage);const plan=c.stagePlans.find(s=>s.id===race.championshipStageId||s.number===stageNo);if(plan){plan.status='completed';plan.raceId=race.id;plan.name=race.eventName;plan.date=race.eventDate;plan.location=race.eventLocation;}save(KEYS.champ,state.championships);}

function commitCurrentEventResult(result){
  const race=state.race,ev=currentEvent(race),s=state.session;
  if(!ev||s?.phase!=='finished')throw new Error('Сначала завершите заезд');
  if(!Array.isArray(result)||result.length!==getEventPilots(race,ev).length)throw new Error('Неполный результат заезда');
  const allowed=new Set(SPORT_RULES.statuses);
  for(const item of result){if(!item||!allowed.has(item.status))throw new Error('Для каждого пилота нужен явный FIN / DNF / DNS / DSQ');}
  snapshotRaceLapStats(findRawEvent(ev.key));announceHeatResults(result,race);
  if(ev.type==='qualifying')saveQualifyingEvent(race,ev.key,result);else saveFinalEvent(race,ev.key,result);
  syncChampionshipIfFinished(race);persistRace();state.session=null;state.resultsOpen=false;render();return true;
}

async function togglePause(){const s=state.session;if(!s)return;if(lapwiz.connected)return toast('Пауза с LapWiz будет включена после отдельного протокольного теста');if(s.phase==='running'){s.accumulatedElapsedMs=sessionElapsed(s);s.runStartedAtPerf=null;s.phaseBeforePause='running';s.phase='paused';logEvent('Пауза');render();return;}if(s.phase==='paused'){s.runStartedAtPerf=performance.now();s.phase=s.phaseBeforePause||'running';logEvent('Продолжение заезда');render();}}
