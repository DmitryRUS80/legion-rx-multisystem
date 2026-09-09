'use strict';
function processPass(transponder,deviceMs=null,source='MANUAL'){
  lapwiz.lastId=String(transponder);
  if(state.trackDay?.status==='active')return processTrackPass(transponder,deviceMs,source);
  const ev=currentEvent(state.race),s=state.session;if(!ev||!s||!['warmup','countdown','running','finishing'].includes(s.phase))return;const p=getEventPilots(state.race,ev).find(x=>String(x.transponder)===String(transponder));
  if(!p){s.unknown[transponder]=(s.unknown[transponder]||0)+1;if(source==='LAPWIZ')lapwiz.unknownBeep();announceService('unknownTransponder');toast(`Неизвестный ID ${transponder}`);return;}
  if(source==='LAPWIZ'&&state.settings.lapSound)announcer.playBleep();
  if(['warmup','countdown'].includes(s.phase)){const hit=s.warmupDetected[p.id]||{count:0,lastDeviceMs:null};hit.count++;hit.lastDeviceMs=Number.isFinite(deviceMs)?deviceMs:hit.lastDeviceMs;hit.lastAt=Date.now();s.warmupDetected[p.id]=hit;s.lastPass=`${p.name} · транспондер ✓ · проходов ${hit.count}`;updateDynamicCockpit();return;}
  processPilotPass(p,deviceMs,source);
}

async function handleAction(action,button){if(action==='start-session'&&state.trackDay?.status==='active')return toast('Сначала завершите активный Track Day');if(action==='pause-session')return pauseSession();if(action==='add-minute')return addMinute();if(action==='next-event'){if(state.session?.phase!=='finished')return toast('Сначала завершите текущий заезд');return openCurrentEventResultEditor();}if(action==='manual-lap-modal')return manualLapModal();if(action==='open-settings')return nav('settings');return legacyHandleAction(action,button);}

function completeCompetition(confirmed=false){if(!state.race)return;if(state.race.stage!=='finished')return toast('Сначала завершите спортивную часть соревнования');if(!confirmed&&!confirm('Завершить соревнование? Оно будет сохранено в архив, а активный пульт очистится.'))return;const prevLifecycle=state.race.lifecycleStatus,prevCompletedAt=state.race.completedAt;try{syncChampionshipIfFinished(state.race);state.race.lifecycleStatus='archived';state.race.completedAt=state.race.completedAt||new Date().toISOString();archiveCurrentRace();save(KEYS.race,null);}catch(err){state.race.lifecycleStatus=prevLifecycle;state.race.completedAt=prevCompletedAt;console.error('LEGION RX archive save failed',err);toast(err?.message||'Не удалось сохранить соревнование в архив');return;}state.race=null;state.session=null;toast('Соревнование завершено и сохранено в архив');nav('home');}

function archiveCurrentRace(){if(!state.race)return false;const snapshot=compactRaceForStorage(state.race),nextArchive=(state.archive||[]).map(compactRaceForStorage),idx=nextArchive.findIndex(r=>r.id===snapshot.id);if(idx>=0)nextArchive[idx]=snapshot;else nextArchive.push(snapshot);save(KEYS.archive,nextArchive);state.archive=nextArchive;return true;}

function restoreRaceFromArchive(id){if(state.race)return toast('Сначала завершите или удалите текущую активную гонку');const r=state.archive.find(x=>x.id===id);if(!r)return;state.race=deepClone(r);state.race.lifecycleStatus='active';state.archive=state.archive.filter(x=>x.id!==id);save(KEYS.archive,state.archive);persistRace();if(state.race.championshipId){const c=state.championships.find(x=>x.id===state.race.championshipId);const s=c?.stagePlans?.find(x=>x.id===state.race.championshipStageId||x.number===state.race.championshipStageNumber);if(s)s.status=state.race.stage==='finished'?'completed':'active';save(KEYS.champ,state.championships);}toast('Соревнование восстановлено');nav(state.race.stage==='setup'?'rallySetup':'cockpit');}

function deleteArchivedRace(id){if(!confirm('Удалить соревнование из архива без возможности восстановления?'))return;state.archive=state.archive.filter(r=>r.id!==id);save(KEYS.archive,state.archive);render();}

function activeChampionship(){const c=state.championships.find(x=>x.id===state.activeChampionshipId);return c?normalizeChampionship(c):null;}

function normalizeChampionship(c){
 c.stages=c.stages||[];c.stagePlans=c.stagePlans||[];c.pilotIds=c.pilotIds||[];c.stagesPlanned=Number(c.stagesPlanned||6);if(!c.stagePlans.length&&c.stages.length)c.stagePlans=c.stages.map(s=>({id:uid('stage'),number:s.number,name:s.name||`Этап ${s.number}`,date:s.date||'',location:s.location||'',status:'completed',raceId:s.raceId||''}));return c;
}

function champStandings(c){const m=new Map();(c.stages||[]).forEach(s=>(s.results||[]).forEach(r=>{const row=m.get(r.driverId)||{driverId:r.driverId,name:r.name,total:0,stages:0};row.total+=Number(r.points||0);row.stages++;m.set(r.driverId,row);}));return[...m.values()].sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name));}

function stageById(id){const c=activeChampionship();return c?.stagePlans.find(s=>s.id===id)||null;}

function startChampStage(stageId){const c=activeChampionship(),s=stageById(stageId);if(!c||!s)return;if(state.race&&state.race.id!==s.raceId)return toast('Сначала завершите или архивируйте текущую активную гонку');const input={eventName:s.name,eventDate:s.date||new Date().toISOString().slice(0,10),eventLocation:s.location||'',championshipId:c.id,championshipStageNumber:s.number,championshipStageId:s.id,qualificationLimitType:state.settings.qualificationLimitType,qualificationMinutes:state.settings.qualificationMinutes,qualificationLaps:state.settings.qualificationLaps,finalLimitType:state.settings.finalLimitType,finalMinutes:state.settings.finalMinutes,finalLaps:state.settings.finalLaps,minLapSec:state.settings.minLapSec,countdownSec:state.settings.countdownSec,warmupMinutes:state.settings.warmupMinutes};const race=makeRace(input);race.pilots=(c.pilotIds||[]).map((id,i)=>{const profile=state.pilotDb.find(p=>p.id===id);if(!profile)return null;const p=makePilot({...profile,profileId:profile.id},i+1);p.profileId=profile.id;return p;}).filter(Boolean);s.status='active';s.raceId=race.id;state.race=race;save(KEYS.champ,state.championships);persistRace();nav('rallySetup');}

function continueChampStage(stageId){const c=activeChampionship(),s=stageById(stageId);if(!c||!s)return;if(state.race?.id===s.raceId)return nav(state.race.stage==='setup'?'rallySetup':'cockpit');const archived=state.archive.find(r=>r.id===s.raceId);if(archived){state.race=deepClone(archived);state.race.lifecycleStatus='active';state.archive=state.archive.filter(r=>r.id!==archived.id);save(KEYS.archive,state.archive);persistRace();s.status=state.race.stage==='finished'?'completed':'active';save(KEYS.champ,state.championships);return nav(state.race.stage==='setup'?'rallySetup':'cockpit');}return startChampStage(stageId);}

function saveChampionshipSettings(input={}){const c=activeChampionship();if(!c)return;c.name=String(input.name||'').trim()||c.name;c.season=Number(input.season)||c.season;c.stagesPlanned=Number(input.stagesPlanned)||c.stagesPlanned;save(KEYS.champ,state.championships);toast('Настройки чемпионата сохранены');render();}
