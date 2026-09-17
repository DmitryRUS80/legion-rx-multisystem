'use strict';
/* LEGION RX · CLASSIC RC EFRA 2026 engine.
   Independent sport state / rules / results. No cross-mode imports. */
const ClassicRCEngine=(()=>{
  const STORAGE_KEY='legionrx4_classic_rc_efra_event_v1';
  const ARCHIVE_KEY='legionrx4_classic_rc_efra_archive_v1';
  const clone=v=>JSON.parse(JSON.stringify(v));
  const uid2=p=>`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
  let event=null;
  try{event=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch{}
  function persist(){try{if(event)localStorage.setItem(STORAGE_KEY,JSON.stringify(event));else localStorage.removeItem(STORAGE_KEY);}catch(e){console.warn('Classic RC persist',e);}return event;}
  // RC77: RC76 introduced staggered release with a 1 s default. The director
  // requirement is now 2 s. Migrate only the untouched legacy default once;
  // later user-selected values remain fully configurable.
  if(event?.settings&&!event.settings.staggerReleaseV2){if(Number(event.settings.staggerIntervalMs||0)===1000)event.settings.staggerIntervalMs=2000;event.settings.staggerReleaseV2=true;persist();}
  function get(){return event;}
  function hasActive(){return Boolean(event&&event.status!=='archived');}
  function create(input={}){
    const category=ClassicRCEFRARules.categories[input.category]||ClassicRCEFRARules.categories['10-offroad'];
    event={
      id:uid2('classic'),mode:'classic-rc-efra',ruleset:ClassicRCEFRARules.version,status:'setup',lifecycleStatus:'active',championshipEligible:true,name:String(input.name||'EFRA RC'),date:input.date||new Date().toISOString().slice(0,10),location:String(input.location||''),category:category.id,
      pilotIds:[...(input.pilotIds||[])],settings:{
        seedingRounds:Math.max(2,Math.min(4,Number(input.seedingRounds)||2)),
        seedingConsecutiveLaps:[2,3].includes(Number(input.seedingConsecutiveLaps))?Number(input.seedingConsecutiveLaps):3,
        controlledPracticeRounds:Math.max(1,Math.min(4,Number(input.controlledPracticeRounds)||2)),
        qualifyingRounds:Math.max(2,Math.min(6,Number(input.qualifyingRounds)||5)),
        startTime:String(input.startTime||'09:00'),roundBreakMin:Math.max(0,Math.min(60,Number(input.roundBreakMin)||5)),finalBreakMin:Math.max(0,Math.min(120,Number(input.finalBreakMin)||20)),
        minLapSec:Math.max(1,Math.min(60,Number(input.minLapSec)||2)),staggerIntervalMs:Math.max(500,Math.min(5000,Number(input.staggerIntervalMs)||2000)),finalPractice:Boolean(input.finalPractice!==false),lowestFinalPolicy:input.lowestFinalPolicy==='rebalance'?'rebalance':'keep'
      },
      groups:[],seedResults:[],seedStandings:[],controlledPractice:[],qualifying:[],qualifyingScores:[],qualifyingStandings:[],finalGroups:[],finalLegs:[],finalStandings:[],events:[],timeline:null,currentEventKey:'',session:null,runtimeClock:null,directorHold:{active:false,atEpoch:null},autoDirector:null,withdrawnPilotIds:[],lateEntries:[],participantChanges:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),completedAt:'',abortedAt:'',abortReason:''
    };persist();return event;
  }
  function updateSetup(input={}){if(!event||event.status!=='setup')return event;Object.assign(event,{name:String(input.name??event.name),date:input.date||event.date,location:String(input.location??event.location),category:ClassicRCEFRARules.categories[input.category]?input.category:event.category,pilotIds:[...(input.pilotIds||event.pilotIds)]});Object.assign(event.settings,input.settings||{});persist();return event;}
  function category(){return ClassicRCEFRARules.categories[event?.category]||ClassicRCEFRARules.categories['10-offroad'];}
  function pilot(id){return state.pilotDb.find(p=>String(p.id)===String(id))||{id,name:'Пилот',transponder:'',country:''};}
  function pilots(ids=event?.pilotIds||[]){return(ids||[]).map(pilot).filter(Boolean);}
  function baseHeatGroups(){return classicRCInitialHeats(event.pilotIds,ClassicRCEFRARules.maxDriversPerHeat);}
  function makeHeat({stage,round,heat,pilots,label,durationMin,order,groupName=''}){return{key:uid2('ce'),type:'heat',stage,round:Number(round)||1,heat:Number(heat)||1,groupName,label,pilots:[...pilots],durationMin:Number(durationMin)||category().raceMinutes,order:Number(order)||0,status:'pending',saved:false,result:[],lapStats:{},startMode:stage==='final'?'common':'staggered'};}
  function buildPreFinalEvents(){
    const c=category(),base=baseHeatGroups(),out=[];let order=0;
    for(let r=1;r<=event.settings.seedingRounds;r++)for(const g of base)out.push(makeHeat({stage:'seeding',round:r,heat:g.heat,pilots:g.pilots,label:`РАССТАНОВКА ${r} · ГРУППА ${g.heat}/${base.length}`,durationMin:c.raceMinutes,order:++order}));
    for(let r=1;r<=event.settings.controlledPracticeRounds;r++)for(const g of base)out.push(makeHeat({stage:'controlled',round:r,heat:g.heat,pilots:g.pilots,label:`ПРАКТИКА ${r} · ГРУППА ${g.heat}/${base.length}`,durationMin:c.raceMinutes,order:++order}));
    for(let r=1;r<=event.settings.qualifyingRounds;r++){
      const seq=classicRCHeatOrder(event.category,base.length,r);
      for(const h of seq){const g=base.find(x=>x.heat===h);out.push(makeHeat({stage:'qualifying',round:r,heat:h,pilots:g.pilots,label:`КВ${r} · ГРУППА ${h}/${base.length}`,durationMin:c.raceMinutes,order:++order}));}
    }
    return out;
  }
  function scheduleBuild(){
    const c=category(),tl=CompetitionScheduler.make({date:event.date,startTime:event.settings.startTime,meta:{mode:'classic-rc',ruleset:event.ruleset}}),roundBreak=Number(event.settings.roundBreakMin)||0;
    let cursor=tl.startEpoch,prevStage='',prevRound=0;
    event.events.forEach((ev,i)=>{
      if(i&& (ev.stage!==prevStage||ev.round!==prevRound) && roundBreak>0){CompetitionScheduler.add(tl,{kind:'break',stage:'break',label:'ПАУЗА',durationMin:roundBreak,plannedStartEpoch:cursor});cursor+=roundBreak*60000;}
      CompetitionScheduler.add(tl,{kind:'heat',stage:ev.stage,label:ev.label,subLabel:`${c.label} · ${ev.pilots.length} пилотов`,eventKey:ev.key,durationMin:ev.durationMin,minStartGapMin:c.minStartGapMin,plannedStartEpoch:cursor,participantCount:ev.pilots.length,meta:{round:ev.round,heat:ev.heat}});
      cursor+=Math.max(ev.durationMin,c.minStartGapMin)*60000;prevStage=ev.stage;prevRound=ev.round;
    });
    if(event.settings.finalBreakMin>0){CompetitionScheduler.add(tl,{kind:'break',stage:'pre-finals',label:'ПЕРЕРЫВ ПЕРЕД ФИНАЛАМИ',durationMin:event.settings.finalBreakMin,plannedStartEpoch:cursor});cursor+=event.settings.finalBreakMin*60000;}
    const predictedCount=Math.max(1,Math.ceil(event.pilotIds.length/10)),predicted=Array.from({length:predictedCount},(_,i)=>String.fromCharCode(65+i));
    if(event.settings.finalPractice){const fp=event.category==='10-offroad'?predicted.filter(x=>x==='A'):predicted;for(const name of [...fp].reverse()){CompetitionScheduler.add(tl,{kind:'heat',stage:'finalPractice',label:`ПРАКТИКА ФИНАЛ ${name}`,subLabel:`${c.label} · состав после квалификации`,durationMin:c.raceMinutes,minStartGapMin:c.minStartGapMin,plannedStartEpoch:cursor,participantCount:0,meta:{placeholder:true,group:name,leg:0}});cursor+=Math.max(c.raceMinutes,c.minStartGapMin)*60000;}if(roundBreak>0){CompetitionScheduler.add(tl,{kind:'break',stage:'final-round-break',label:'ПАУЗА ПЕРЕД ФИНАЛЬНЫМИ ЗАЕЗДАМИ',durationMin:roundBreak,plannedStartEpoch:cursor,meta:{finalSeries:1}});cursor+=roundBreak*60000;}}
    for(let leg=1;leg<=3;leg++){for(const name of [...predicted].reverse()){CompetitionScheduler.add(tl,{kind:'heat',stage:'final',label:`ФИНАЛ ${name} · ЗАЕЗД ${leg}/3`,subLabel:`${c.label} · состав после квалификации`,durationMin:c.raceMinutes,minStartGapMin:c.minStartGapMin,plannedStartEpoch:cursor,participantCount:0,meta:{placeholder:true,group:name,leg}});cursor+=Math.max(c.raceMinutes,c.minStartGapMin)*60000;}if(leg<3&&roundBreak>0){CompetitionScheduler.add(tl,{kind:'break',stage:'final-round-break',label:`ПАУЗА МЕЖДУ ФИНАЛЬНЫМИ ЗАЕЗДАМИ · ${leg}/${leg+1}`,durationMin:roundBreak,plannedStartEpoch:cursor,meta:{finalSeries:leg+1}});cursor+=roundBreak*60000;}}
    event.timeline=tl;
  }
  function prepare(){if(!event)throw new Error('EFRA RC event not created');if(event.pilotIds.length<2)throw new Error('Нужно минимум два пилота');event.groups=baseHeatGroups();event.events=buildPreFinalEvents();event.status='seeding';event.currentEventKey=event.events[0]?.key||'';scheduleBuild();persist();return event;}
  function currentEvent(){if(!event)return null;return event.events.find(x=>!x.saved&&x.status!=='cancelled')||null;}
  function findEvent(key){return event?.events?.find(x=>x.key===key)||null;}
  function nextEvent(){return currentEvent();}
  function stageLabel(stage){return({seeding:'РАССТАНОВКА · SEEDING',controlled:'КОНТРОЛЬНАЯ ПРАКТИКА',qualifying:'КВАЛИФИКАЦИЯ',finalPractice:'ПРАКТИКА ПЕРЕД ФИНАЛОМ',final:'ФИНАЛ',finished:'ЗАВЕРШЕНО',aborted:'ЗАВЕРШЕНО ДОСРОЧНО'})[stage]||String(stage||'').toUpperCase();}
  function bestConsecutive(laps,n){const a=(laps||[]).filter(x=>Number.isFinite(Number(x))&&Number(x)>0).map(Number);if(a.length<n)return null;let best=null;for(let i=0;i<=a.length-n;i++){const slice=a.slice(i,i+n),total=slice.reduce((s,x)=>s+x,0);if(!best||total<best.totalMs)best={totalMs:total,avgMs:total/n,laps:slice};}return best;}
  function rebuildSeeding(){
    const n=event.settings.seedingConsecutiveLaps,rows=event.pilotIds.map((id,idx)=>{let best=null;event.events.filter(e=>e.stage==='seeding'&&e.saved).forEach(e=>{const st=e.lapStats?.[id];const hit=bestConsecutive(st?.lapTimes,n);if(hit&&(!best||hit.totalMs<best.totalMs))best={...hit,eventKey:e.key};});return{pilotId:id,registrationRank:idx+1,best};});
    event.seedStandings=rows.sort((a,b)=>(a.best?.totalMs??Infinity)-(b.best?.totalMs??Infinity)||a.registrationRank-b.registrationRank).map((r,i)=>({...r,rank:i+1}));
    if(event.seedStandings.every(x=>x.best||event.events.filter(e=>e.stage==='seeding'&&e.saved).length===event.events.filter(e=>e.stage==='seeding').length))applySeededGroups();
  }
  function applySeededGroups(){
    const ranked=event.seedStandings.map(x=>x.pilotId),groups=classicRCSeededHeats(ranked,ClassicRCEFRARules.maxDriversPerHeat);event.groups=groups;
    const byHeat=new Map(groups.map(g=>[g.heat,g.pilots]));
    event.events.filter(e=>!e.saved&&['controlled','qualifying'].includes(e.stage)).forEach(e=>{e.pilots=[...(byHeat.get(e.heat)||e.pilots)];});
  }
  function roundHeatResults(round){return event.events.filter(e=>e.stage==='qualifying'&&e.round===round&&e.saved&&!e.cancelled);}
  function rebuildQualification(){
    const completed=[];for(let r=1;r<=event.settings.qualifyingRounds;r++){const all=event.events.filter(e=>e.stage==='qualifying'&&e.round===r);if(all.length&&all.every(e=>e.saved)){const raw=[];all.forEach(e=>(e.result||[]).forEach(x=>raw.push({...x,eventKey:e.key,round:r})));const scored=classicRCScoreQualifyingRound(raw,event.pilotIds);event.qualifyingScores[r-1]=scored;completed.push(r);}else break;}
    event.qualifyingStandings=classicRCBuildQualifyingStandings(event.pilotIds,event.qualifyingScores,completed.length);
    if(completed.length===event.settings.qualifyingRounds&&event.events.filter(e=>e.stage==='qualifying').every(e=>e.saved))buildFinals();
  }
  function buildFinals(){if(event.finalGroups.length)return;event.finalGroups=classicRCFinalGroupsFromQualification(event.qualifyingStandings,10,event.settings.lowestFinalPolicy||'keep');const c=category();let order=Math.max(0,...event.events.map(e=>e.order||0));
    const qRank=new Map(event.qualifyingStandings.map(x=>[String(x.pilotId),x.rank]));
    if(event.settings.finalPractice){const groups=event.category==='10-offroad'?event.finalGroups.filter(g=>g.name==='A'):event.finalGroups;for(const g of [...groups].reverse())event.events.push(makeHeat({stage:'finalPractice',round:1,heat:event.finalGroups.indexOf(g)+1,groupName:g.name,pilots:g.pilots,label:`ПРАКТИКА ФИНАЛ ${g.name}`,durationMin:c.raceMinutes,order:++order}));}
    for(let leg=1;leg<=3;leg++)for(const g of [...event.finalGroups].reverse())event.events.push(makeHeat({stage:'final',round:leg,heat:event.finalGroups.indexOf(g)+1,groupName:g.name,pilots:g.pilots,label:`ФИНАЛ ${g.name} · ЗАЕЗД ${leg}/3`,durationMin:c.raceMinutes,order:++order}));
    /* Bind pre-built neutral schedule placeholders to the real finals. */
    event.events.filter(e=>['finalPractice','final'].includes(e.stage)).forEach(ev=>{const item=event.timeline?.items?.find(x=>x.kind==='heat'&&!x.eventKey&&x.stage===ev.stage&&String(x.meta?.group||'')===String(ev.groupName||'')&&Number(x.meta?.leg||0)===Number(ev.stage==='final'?ev.round:0));if(item){item.eventKey=ev.key;item.participantCount=ev.pilots.length;item.subLabel=`${c.label} · ${ev.pilots.length} пилотов`;item.meta.placeholder=false;}else{const cursor=event.timeline?.items?.length?Math.max(...event.timeline.items.map(i=>i.plannedStartEpoch+(i.kind==='break'?i.durationMin:Math.max(i.durationMin,c.minStartGapMin))*60000)):Date.now();CompetitionScheduler.add(event.timeline,{kind:'heat',stage:ev.stage,label:ev.label,subLabel:`${c.label} · ${ev.pilots.length} пилотов`,eventKey:ev.key,durationMin:ev.durationMin,minStartGapMin:c.minStartGapMin,plannedStartEpoch:cursor,participantCount:ev.pilots.length,meta:{group:ev.groupName,leg:ev.round}});}});
    event.status=event.settings.finalPractice?'finalPractice':'final';persist();
  }
  function startPilots(ev=currentEvent()){
    if(!ev)return[];const ids=[...(ev.pilots||[])],seedRank=new Map((event.seedStandings||[]).map(x=>[String(x.pilotId),x.rank])),qRank=new Map((event.qualifyingStandings||[]).map(x=>[String(x.pilotId),x.rank]));
    if(['controlled','finalPractice','final'].includes(ev.stage)){const rank=ev.stage==='controlled'?seedRank:qRank;return ids.sort((a,b)=>(rank.get(String(a))||9999)-(rank.get(String(b))||9999));}
    if(ev.stage==='qualifying'){
      const perf=new Map();
      if(ev.round===1){event.events.filter(x=>x.stage==='controlled'&&x.saved).forEach(x=>(x.result||[]).forEach(r=>{const old=perf.get(String(r.pilotId));if(!old||classicRCCompareLapsTime(r,old)<0)perf.set(String(r.pilotId),r);}));}
      else{event.events.filter(x=>x.stage==='qualifying'&&x.saved&&x.round<ev.round).forEach(x=>(x.result||[]).forEach(r=>{const old=perf.get(String(r.pilotId));if(!old||classicRCCompareLapsTime(r,old)<0)perf.set(String(r.pilotId),r);}));}
      return ids.sort((a,b)=>{const A=perf.get(String(a)),B=perf.get(String(b));if(A&&B)return classicRCCompareLapsTime(A,B);if(A)return-1;if(B)return 1;return(seedRank.get(String(a))||9999)-(seedRank.get(String(b))||9999);});
    }
    return ids;
  }
  function lapStatsFromSession(session){const out={};Object.entries(session?.live||{}).forEach(([id,l])=>{out[id]={laps:Number(l.laps)||0,bestLapMs:Number.isFinite(l.bestLapMs)?l.bestLapMs:null,lastLapMs:Number.isFinite(l.lastLapMs)?l.lastLapMs:null,lapTimes:[...(l.lapTimes||[])],timeMs:Number(l.timeMs||l.elapsedMs)||0,started:Boolean(l.started),finished:Boolean(l.finished)};});return out;}
  function saveHeat(key,result,session,now=Date.now()){const ev=findEvent(key);if(!ev)throw new Error('Classic RC heat not found');ev.result=clone(result||[]);ev.lapStats=lapStatsFromSession(session);ev.saved=true;ev.status='completed';CompetitionScheduler.finish(event.timeline,key,now);event.session=null;event.currentEventKey='';if(ev.stage==='seeding')rebuildSeeding();if(ev.stage==='qualifying')rebuildQualification();if(ev.stage==='final'){const group=event.finalGroups.find(g=>g.name===ev.groupName),scored=classicRCFinalLegPoints(ev.result,group?.pilots?.length||10);ev.scored=scored;rebuildFinalsStanding(ev.groupName);}const next=currentEvent();if(next){event.status=next.stage;event.currentEventKey=next.key;}else if(event.finalGroups.length){event.status='finished';event.lifecycleStatus='completed';event.championshipEligible=true;event.completedAt=new Date().toISOString();buildOverallFinalProtocol();}persist();return next;}
  function rebuildFinalsStanding(groupName){const group=event.finalGroups.find(g=>g.name===groupName);if(!group)return;const legs=event.events.filter(e=>e.stage==='final'&&e.groupName===groupName&&e.saved).map(e=>({result:e.result,scored:e.scored||classicRCFinalLegPoints(e.result,group.pilots.length)}));const qr=new Map(event.qualifyingStandings.map(x=>[String(x.pilotId),x.rank]));const standings=classicRCBuildFinalStandings(group,legs,qr);event.finalStandings=event.finalStandings.filter(x=>x.groupName!==groupName);event.finalStandings.push({groupName,standings});}
  function buildOverallFinalProtocol(){const all=[];let offset=0;event.finalGroups.forEach(g=>{const fs=event.finalStandings.find(x=>x.groupName===g.name)?.standings||[];fs.forEach(r=>all.push({...r,groupName:g.name,overallRank:offset+r.rank}));offset+=g.pilots.length;});event.finalProtocol=all.sort((a,b)=>a.overallRank-b.overallRank);return event.finalProtocol;}
  function canStartScheduleHeat(key,now=Date.now(),options={}){return CompetitionScheduler.canStart(event.timeline,key,now,options);}
  function startScheduleHeat(key,now=Date.now(),options={}){const res=options.directorOverride?CompetitionScheduler.bringForward(event.timeline,key,now):CompetitionScheduler.start(event.timeline,key,now);if(res.ok){const ev=findEvent(key);if(ev)ev.status='active';persist();}return res;}
  function shiftScheduleStart(deltaMin=0){if(!event?.timeline)return{ok:false,error:'Расписание не сформировано'};const res=CompetitionScheduler.shiftStart(event.timeline,(Number(deltaMin)||0)*60000);if(res.ok){event.settings.startTime=CompetitionScheduler.formatTime(res.startEpoch);persist();}return res;}
  function restartCurrentEvent(now=Date.now()){const ev=currentEvent();if(!ev)return{ok:false,error:'Нет текущего заезда'};if(ev.saved)return{ok:false,error:'Сохранённый заезд нельзя перезапустить'};const res=CompetitionScheduler.restartHeat(event.timeline,ev.key,now);if(!res.ok)return res;ev.status='pending';event.status=ev.stage;event.currentEventKey=ev.key;persist();return{ok:true,event:ev,schedule:res};}
  function skipScheduleBreak(id,now=Date.now()){const res=CompetitionScheduler.skipBreak(event.timeline,id,now);persist();return res;}
  function adjustScheduleBreak(id,deltaMin=0,now=Date.now()){const res=CompetitionScheduler.adjustBreakMinutes(event.timeline,id,deltaMin,now);persist();return res;}
  function addScheduleBreak(id,min=5,now=Date.now()){return adjustScheduleBreak(id,Math.max(0,Number(min)||0),now);}
  function updateCurrentHeatSettings(input={}){const ev=currentEvent();if(!ev)return{ok:false,error:'Нет текущего заезда'};const duration=Math.max(1/60,Math.min(120,Number(input.durationMin)||ev.durationMin||category().raceMinutes));ev.durationMin=duration;if(Number.isFinite(Number(input.minLapSec)))event.settings.minLapSec=Math.max(1,Math.min(60,Number(input.minLapSec)));if(Number.isFinite(Number(input.staggerIntervalMs)))event.settings.staggerIntervalMs=Math.max(500,Math.min(5000,Number(input.staggerIntervalMs)));const res=CompetitionScheduler.setHeatDuration(event.timeline,ev.key,duration);persist();return{ok:true,event:ev,schedule:res};}
  function skipCurrentEvent(now=Date.now()){const ev=currentEvent();if(!ev)return{ok:false,error:'Нет текущего заезда'};const result=(ev.pilots||[]).map((id,i)=>({pilotId:id,status:'DNS',place:null,laps:0,timeMs:0,carNumber:i+1}));const fake={live:Object.fromEntries((ev.pilots||[]).map(id=>[id,{laps:0,bestLapMs:null,lastLapMs:null,lapTimes:[],timeMs:0,elapsedMs:0,started:false,finished:true}]))};saveHeat(ev.key,result,fake,now);const schedule=CompetitionScheduler.skipHeat(event.timeline,ev.key,now);persist();return{ok:true,event:ev,schedule};}

  function participantChange(type,pilotId,extra={}){event.participantChanges=Array.isArray(event.participantChanges)?event.participantChanges:[];event.participantChanges.push({type,pilotId:String(pilotId),at:new Date().toISOString(),...extra});}
  function finalsLocked(){return Boolean(event?.finalGroups?.length)||['finalPractice','final','finished','aborted'].includes(String(event?.status||''));}
  function syncTimelineParticipants(keys=[]){const wanted=new Set((keys||[]).map(String));(event?.timeline?.items||[]).forEach(it=>{if(!it.eventKey||!wanted.has(String(it.eventKey)))return;const ev=findEvent(it.eventKey);if(!ev)return;it.participantCount=(ev.pilots||[]).length;it.subLabel=`${category().label} · ${it.participantCount} пилотов`;});}
  function lateEntry(pilotId,now=Date.now()){
    if(!event)return{ok:false,error:'Нет соревнования'};if(finalsLocked())return{ok:false,error:'После формирования финалов новых пилотов добавлять нельзя'};
    const id=String(pilotId||''),profile=state.pilotDb.find(p=>String(p.id)===id);if(!id||!profile)return{ok:false,error:'Пилот не найден в базе'};const transponder=String(profile.transponder||profile.models?.[0]?.transponder||profile.models?.[0]?.number||'').trim();if(!transponder)return{ok:false,error:'У пилота нет ID транспондера'};const conflict=(event.pilotIds||[]).map(x=>pilot(x)).find(p=>String(p.id)!==id&&String(p.transponder||'').trim()===transponder&&!(event.withdrawnPilotIds||[]).some(w=>String(w)===String(p.id)));if(conflict)return{ok:false,error:`Транспондер ${transponder} уже используется: ${conflict.name}`};
    event.withdrawnPilotIds=Array.isArray(event.withdrawnPilotIds)?event.withdrawnPilotIds:[];event.lateEntries=Array.isArray(event.lateEntries)?event.lateEntries:[];
    if(!event.pilotIds.some(x=>String(x)===id))event.pilotIds.push(id);
    event.withdrawnPilotIds=event.withdrawnPilotIds.filter(x=>String(x)!==id);
    const cur=currentEvent();if(!cur)return{ok:false,error:'Нет будущих заездов'};const phase=String(event.session?.phase||'ready'),active=['countdown','running','finishing','paused','finished'].includes(phase),minOrder=Number(cur.order||0)+(active?1:0);
    const future=event.events.filter(e=>!e.saved&&e.status!=='cancelled'&&Number(e.order||0)>=minOrder&&!['finalPractice','final'].includes(e.stage));if(!future.length)return{ok:false,error:'Нет доступных будущих заездов'};
    let target=future.find(e=>(e.pilots||[]).length<ClassicRCEFRARules.maxDriversPerHeat);if(!target)return{ok:false,error:'В сформированных группах нет свободного места (максимум 10 пилотов)'};
    const targetHeat=Number(target.heat)||1,changed=[];event.groups=Array.isArray(event.groups)?event.groups:[];let group=event.groups.find(g=>Number(g.heat)===targetHeat);if(group&&!group.pilots.some(x=>String(x)===id))group.pilots.push(id);
    future.filter(e=>Number(e.heat)===targetHeat).forEach(e=>{if(!(e.pilots||[]).some(x=>String(x)===id)){e.pilots.push(id);changed.push(e.key);}});
    if(event.session?.phase==='ready'&&changed.includes(event.session.eventKey))event.session=null;
    if(event.seedStandings?.length&&!event.seedStandings.some(x=>String(x.pilotId)===id))event.seedStandings.push({pilotId:id,registrationRank:event.pilotIds.length,best:null,rank:event.seedStandings.length+1});
    rebuildQualification();syncTimelineParticipants(changed);const entry={pilotId:id,fromEventKey:target.key,fromOrder:target.order,heat:targetHeat,atEpoch:Number(now)||Date.now()};event.lateEntries.push(entry);participantChange('late-entry',id,entry);persist();return{ok:true,pilotId:id,target,changedEventKeys:changed};
  }
  function withdrawPilot(pilotId,now=Date.now()){
    if(!event)return{ok:false,error:'Нет соревнования'};if(finalsLocked())return{ok:false,error:'После формирования финалов пилота можно отметить DNS в заезде, но состав финалов уже зафиксирован'};
    const id=String(pilotId||'');if(!event.pilotIds.some(x=>String(x)===id))return{ok:false,error:'Пилот не участвует в соревновании'};
    const cur=currentEvent();if(!cur)return{ok:false,error:'Нет будущих заездов'};const phase=String(event.session?.phase||'ready'),active=['countdown','running','finishing','paused','finished'].includes(phase),minOrder=Number(cur.order||0)+(active?1:0),changed=[];
    event.events.filter(e=>!e.saved&&e.status!=='cancelled'&&Number(e.order||0)>=minOrder&&!['finalPractice','final'].includes(e.stage)).forEach(e=>{const before=(e.pilots||[]).length;e.pilots=(e.pilots||[]).filter(x=>String(x)!==id);if(e.pilots.length!==before)changed.push(e.key);});
    event.groups=(event.groups||[]).map(g=>({...g,pilots:(g.pilots||[]).filter(x=>String(x)!==id)}));event.withdrawnPilotIds=Array.from(new Set([...(event.withdrawnPilotIds||[]).map(String),id]));
    if(event.session?.phase==='ready'&&changed.includes(event.session.eventKey))event.session=null;syncTimelineParticipants(changed);participantChange('withdraw',id,{fromOrder:minOrder,atEpoch:Number(now)||Date.now()});persist();return{ok:true,pilotId:id,changedEventKeys:changed};
  }
  function abortCompetition(reason='Досрочно завершено директором',now=Date.now()){
    if(!event)return{ok:false,error:'Нет соревнования'};if(event.status==='finished')return{ok:false,error:'Соревнование уже завершено штатно'};const t=Number(now)||Date.now();
    (event.events||[]).filter(e=>!e.saved&&e.status!=='cancelled').forEach(e=>{e.status='cancelled';e.cancelledReason=String(reason);});
    (event.timeline?.items||[]).forEach(it=>{if(it.status==='pending'||it.status==='active'){it.status='cancelled';it.actualEndEpoch=t;it.meta={...(it.meta||{}),aborted:true};}});
    event.status='aborted';event.lifecycleStatus='aborted';event.championshipEligible=false;event.abortedAt=new Date(t).toISOString();event.completedAt=event.abortedAt;event.abortReason=String(reason);event.currentEventKey='';event.session=null;event.directorHold={active:false,atEpoch:null};persist();return{ok:true,event};
  }
  function pauseCompetition(now=Date.now()){if(!event)return{ok:false};event.directorHold={active:true,atEpoch:now};persist();return{ok:true,atEpoch:now};}
  function resumeCompetition(now=Date.now()){if(!event?.directorHold?.active)return{ok:false};const start=Number(event.directorHold.atEpoch)||now,delta=Math.max(0,now-start);CompetitionScheduler.shiftPending(event.timeline,delta);event.directorHold={active:false,atEpoch:null};persist();return{ok:true,deltaMs:delta};}
  function reset(){event=null;persist();}
  function archive(){if(!event)return;try{const a=JSON.parse(localStorage.getItem(ARCHIVE_KEY)||'[]');a.push(clone(event));localStorage.setItem(ARCHIVE_KEY,JSON.stringify(a));}catch{}event=null;persist();}
  return Object.freeze({get,hasActive,create,updateSetup,prepare,persist,reset,archive,pilot,pilots,category,currentEvent,findEvent,nextEvent,startPilots,stageLabel,saveHeat,canStartScheduleHeat,startScheduleHeat,shiftScheduleStart,restartCurrentEvent,skipScheduleBreak,adjustScheduleBreak,addScheduleBreak,updateCurrentHeatSettings,skipCurrentEvent,pauseCompetition,resumeCompetition,abortCompetition,lateEntry,withdrawPilot,finalsLocked,rebuildSeeding,rebuildQualification,buildFinals,bestConsecutive});
})();
