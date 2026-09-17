'use strict';
/* LEGION RX · CLASSIC RC EFRA UI adapter.
   Uses shared cockpit visual primitives, never RallyCross sport rules. */
let classicScheduleOpen=false,classicScheduleTab='now',classicScheduleTicker=null,classicScheduleSig='';

function classicRCOpen(){
  let c=ClassicRCEngine.get();
  if(!c)c=ClassicRCEngine.create({name:'Classic RC',date:new Date().toISOString().slice(0,10),category:'10-offroad',startTime:new Date(Date.now()+10*60000).toTimeString().slice(0,5)});
  nav(c.status==='setup'?'classicSetup':'classicCockpit');
}
function classicRCSetupView(){
  let c=ClassicRCEngine.get();if(!c)c=ClassicRCEngine.create({name:'Classic RC',date:new Date().toISOString().slice(0,10),category:'10-offroad',startTime:'09:00'});
  const cfg=c.settings||{},cat=ClassicRCEFRARules.categories[c.category]||ClassicRCEFRARules.categories['10-offroad'];
  const selected=new Set(c.pilotIds||[]),pilotCards=(state.pilotDb||[]).map(p=>`<button type="button" class="classicPilotSelect ${selected.has(p.id)?'active':''}" data-classic-pilot="${esc(p.id)}"><span class="classicPilotId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||'—')}</span><span><b>${esc(rxnPilotDisplayName(p))}</b><small>${esc(p.club||p.city||'ПИЛОТ')}</small></span><i>${selected.has(p.id)?'✓':'+'}</i></button>`).join('');
  const heatCount=Math.max(1,Math.ceil(Math.max(1,selected.size)/10)),qCount=classicRCQualifyingRoundsToCount(cfg.qualifyingRounds||5);
  if(c.status!=='setup')return `<section class="page classicSetupPage"><div class="pageHeader"><div><div class="sectionLabel">CLASSIC RC · EFRA 2026</div><h1>${esc(c.name)}</h1><p>${esc(cat.label)} · ${c.pilotIds.length} пилотов · ${c.events.filter(e=>e.saved).length}/${c.events.length} заездов завершено</p></div><div class="btnRow"><button class="btn primary" data-classic-action="cockpit">ОТКРЫТЬ ПУЛЬТ</button><button class="btn secondary" data-classic-action="results">РЕЗУЛЬТАТЫ</button></div></div><article class="card classicPreparedSummary"><b>Спортивный модуль сформирован и зафиксирован.</b><span>Practice / Seeding → Round-by-Round Qualifying → Finals A/B/C · BEST 2/3.</span><div class="btnRow"><button class="btn danger" data-classic-action="delete">УДАЛИТЬ CLASSIC RC</button></div></article></section>`;
  return `<section class="page classicSetupPage"><div class="pageHeader"><div><div class="sectionLabel">CLASSIC RC · EFRA 2026</div><h1>Классическая RC-гонка</h1><p>Отдельный спортивный модуль. RallyCross не используется и не изменяется.</p></div></div>
  <div class="classicSetupGrid">
   <article class="card classicSetupMain"><div class="sectionLabel">СОБЫТИЕ</div><div class="classicFields classicFieldsMain">
    <label><span>Название</span><input id="classicName" value="${esc(c.name||'Classic RC')}"></label>
    <label><span>Дата</span><input id="classicDate" type="date" value="${esc(c.date)}"></label>
    <label><span>Место</span><input id="classicLocation" value="${esc(c.location||'')}" placeholder="Трасса / город"></label>
    <label><span>Старт дня</span><input id="classicStartTime" type="time" value="${esc(cfg.startTime||'09:00')}"></label>
   </div></article>
   <article class="card classicSetupMain"><div class="sectionLabel">EFRA PRESET</div><div class="classicFields">
    <label><span>Категория</span><select id="classicCategory">${Object.values(ClassicRCEFRARules.categories).map(x=>`<option value="${x.id}" ${x.id===c.category?'selected':''}>${esc(x.label)} · ${x.raceMinutes} МИН</option>`).join('')}</select></label>
    <label><span>Seeding rounds</span><select id="classicSeedRounds">${[2,3,4].map(n=>`<option ${Number(cfg.seedingRounds||2)===n?'selected':''}>${n}</option>`).join('')}</select></label>
    <label><span>Seeding · подряд кругов</span><select id="classicSeedLaps"><option value="2" ${Number(cfg.seedingConsecutiveLaps)===2?'selected':''}>2 круга</option><option value="3" ${Number(cfg.seedingConsecutiveLaps||3)===3?'selected':''}>3 круга</option></select></label>
    <label><span>Controlled Practice</span><select id="classicPracticeRounds">${[1,2,3,4].map(n=>`<option ${Number(cfg.controlledPracticeRounds||2)===n?'selected':''}>${n}</option>`).join('')}</select></label>
    <label><span>Qualifying rounds</span><select id="classicQRounds">${[2,3,4,5,6].map(n=>`<option ${Number(cfg.qualifyingRounds||5)===n?'selected':''}>${n}</option>`).join('')}</select></label>
    <label><span>Мин. круг LapWiz · сек</span><input id="classicMinLap" type="number" min="1" max="60" value="${Number(cfg.minLapSec||2)}"></label>
   </div><div class="classicRuleLine"><b>${cat.raceMinutes} МИН + LAST LAP</b><span>Q: Round-by-Round · зачёт лучших ${qCount||'—'} · до 10 пилотов в heat</span></div></article>
   <article class="card classicSetupMain"><div class="sectionLabel">РАСПИСАНИЕ</div><div class="classicFields">
    <label><span>Пауза между раундами · мин</span><input id="classicRoundBreak" type="number" min="0" max="60" value="${Number(cfg.roundBreakMin||5)}"></label>
    <label><span>Перед финалами · мин</span><input id="classicFinalBreak" type="number" min="0" max="120" value="${Number(cfg.finalBreakMin||20)}"></label>
    <label><span>Нижний финал &lt; 4 пилотов</span><select id="classicLowestFinal"><option value="keep" ${(cfg.lowestFinalPolicy||'keep')==='keep'?'selected':''}>Провести как есть</option><option value="rebalance" ${cfg.lowestFinalPolicy==='rebalance'?'selected':''}>Уравнять с соседним</option></select></label>
    <label class="classicCheck"><input id="classicFinalPractice" type="checkbox" ${cfg.finalPractice!==false?'checked':''}><span>Контрольная практика перед финалами</span></label>
   </div><div class="classicRuleLine"><b>MIN START GAP ${cat.minStartGapMin} МИН</b><span>Расписание можно сдвигать во время соревнования; спортивные результаты не меняются.</span></div></article>
   <article class="card classicPilotCard"><div class="pageHeader compact"><div><div class="sectionLabel">ПИЛОТЫ</div><h2>Участники · <span id="classicPilotCount">${selected.size}</span></h2></div><button class="btn secondary" data-nav="pilots">БАЗА ПИЛОТОВ</button></div><div class="classicPilotGrid">${pilotCards||'<div class="empty">В базе пока нет пилотов. Добавьте их в разделе «Пилоты».</div>'}</div></article>
   <article class="card classicPlanCard"><div class="sectionLabel">ПЛАН</div><div class="classicPlanStats"><span><b>${heatCount}</b><small>HEATS / ROUND</small></span><span><b>${cfg.qualifyingRounds||5}</b><small>Q ROUNDS</small></span><span><b>${qCount||'—'}</b><small>Q TO COUNT</small></span><span><b>3 / 2</b><small>FINAL LEGS / COUNT</small></span></div><div class="btnRow"><button class="btn primary" data-classic-action="prepare" ${selected.size<2?'disabled':''}>СФОРМИРОВАТЬ EFRA И ОТКРЫТЬ ПУЛЬТ</button><button class="btn danger" data-classic-action="delete">УДАЛИТЬ</button></div></article>
  </div></section>`;
}

function classicRCStageBanner(ev){
  const c=ClassicRCEngine.get(),groups=Math.max(1,c?.groups?.length||1),count=ev?.pilots?.length||0;
  if(!ev)return{stage:'CLASSIC RC',heat:'—',discipline:'EFRA 2026',pilots:'PILOTS 0/0'};
  if(ev.stage==='seeding')return{stage:`SEED ${ev.round}`,heat:`HEAT ${ev.heat}/${groups}`,discipline:'CLASSIC RC',pilots:`PILOTS ${count}/${count}`};
  if(ev.stage==='controlled')return{stage:`PRACTICE ${ev.round}`,heat:`HEAT ${ev.heat}/${groups}`,discipline:'CLASSIC RC',pilots:`PILOTS ${count}/${count}`};
  if(ev.stage==='qualifying')return{stage:`Q${ev.round}`,heat:`HEAT ${ev.heat}/${groups}`,discipline:'CLASSIC RC',pilots:`PILOTS ${count}/${count}`};
  if(ev.stage==='finalPractice')return{stage:`FINAL ${ev.groupName}`,heat:'PRACTICE',discipline:'CLASSIC RC',pilots:`PILOTS ${count}/${count}`};
  return{stage:`FINAL ${ev.groupName}`,heat:`LEG ${ev.round}/3`,discipline:'CLASSIC RC',pilots:`PILOTS ${count}/${count}`};
}
function classicRCHeader(){
  return `<header class="rxnTop"><div class="rxnHeaderLeft"><button class="rxnHomeBrand" type="button" data-classic-action="home"><span>LEGION <i>RX</i></span></button><nav class="rxnPrimaryNav"><button data-classic-action="home">${raceSvg('home')}<b>ГЛАВНАЯ</b></button><button data-nav="championships">${raceSvg('trophy')}<b>ЧЕМПИОНАТЫ</b></button><button data-nav="pilots">${uiIcon('users','raceSvg')}<b>ПИЛОТЫ</b></button></nav><div class="rxnSystemClock"><strong data-rxn-system-clock>${rxnSystemClockText()}</strong><span>ВРЕМЯ</span></div></div>
  <nav class="rxnTopActions" aria-label="Classic RC">${rxnTopButton({cls:lapwiz.connected?'ok':'',attrs:'data-quick-panel="lapwiz" title="LapWiz"',icon:'wave'})}${rxnTopButton({cls:state.settings.announcerEnabled?'ok':'',attrs:'data-quick-panel="announcer" title="Диктор"',icon:'mic'})}${rxnTopButton({cls:'blue',attrs:'data-classic-action="schedule" title="Расписание"',icon:'flag'})}${rxnTopButton({attrs:'data-classic-action="next" title="Следующий"',icon:'next'})}${rxnTopButton({cls:'danger',attrs:'data-classic-action="stop" title="STOP"',icon:'stop'})}${rxnTopButton({cls:'blue',attrs:'data-classic-action="results" title="Результаты"',icon:'chart'})}${rxnTopButton({attrs:'data-action="open-settings" title="Настройки"',icon:'settings'})}${rxnTopButton({attrs:'data-classic-action="schedule" title="Расписание"',icon:'list'})}</nav></header>`;
}
function classicRCBestLap(){
  const s=ClassicRCRuntime.session(),ps=ClassicRCRuntime.pilots();let best=null,pilot=null;for(const p of ps){const v=Number(s?.live?.[p.id]?.bestLapMs);if(Number.isFinite(v)&&v>0&&(best===null||v<best)){best=v;pilot=p;}}
  return `<div class="rxnBestLapStrip"><small>BEST LAP</small><span class="rxnBestLapPilot" data-classic-best-name>${pilot?esc(rxnPilotDisplayName(pilot)):'—'}</span><strong data-classic-best-time>${best?rxnFormatDuration(best):'—'}</strong></div>`;
}
function classicRCTitle(){const ev=ClassicRCRuntime.event(),info=classicRCStageBanner(ev);return `<section class="rxnRaceTitle"><div class="rxnRaceTitleLeft rxnRaceBanner"><div class="rxnRaceBannerLine"><strong>${esc(info.stage)}</strong><i>·</i><span class="rxnBannerHeat">${esc(info.heat)}</span><i class="rxnBannerDisciplineSep">·</i><span class="rxnBannerDiscipline">${esc(info.discipline)}</span><i>·</i><span class="rxnBannerPilots">${esc(info.pilots)}</span></div></div>${classicRCBestLap()}</section>`;}
function classicRCLapAvg(l){const a=(l?.lapTimes||[]).filter(Number.isFinite);return a.length?a.reduce((s,x)=>s+x,0)/a.length:Infinity;}
function classicRCGap(ranked,s,p,i){if(i===0)return rxnFormatDuration(0);const leader=s?.live?.[ranked[0]?.id],l=s?.live?.[p.id];if(!leader||!l)return'—';const ld=(leader.laps||0)-(l.laps||0);if(ld>0)return`+${ld}L`;const dt=(l.timeMs||l.elapsedMs||0)-(leader.timeMs||leader.elapsedMs||0);return dt>0?`+${rxnFormatDuration(dt)}`:'—';}
function classicRCProgress(l){if(!l?.started||l.finished)return{pct:0,color:'#173247'};const elapsed=Number.isFinite(l.lastPassPerf)?performance.now()-l.lastPassPerf:0,avg=classicRCLapAvg(l),expected=Number.isFinite(avg)?avg:Number.isFinite(l.bestLapMs)?l.bestLapMs:30000,pct=Math.max(0,Math.min(100,elapsed/Math.max(5000,expected)*100));let color='#38e46d';if(elapsed/Math.max(5000,expected)>1.12)color='#ed3d50';else if(elapsed/Math.max(5000,expected)>1.02)color='#e4c136';return{pct,color};}
function classicRCPilotTable(){const ranked=ClassicRCRuntime.liveRanking(),s=ClassicRCRuntime.session();return rxnPilotHeader()+ranked.map((p,i)=>{const l=s?.live?.[p.id]||ClassicRCRuntime.blank(),pr=classicRCProgress(l),status=l.finished?'FIN':l.started?'✓':'',phone=l.finished?'FIN':l.started?`<b>${l.laps}L</b><small>${classicRCGap(ranked,s,p,i)}</small>`:'—';return `<div class="rxnPilotRow rxnPilotData ${i===0&&l.laps>0?'leader':''}" data-pilot-id="${esc(p.id)}"><div class="rxnPos">${i+1}</div><div class="rxnId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||i+1)}</div><div class="rxnNameCell"><div class="rxnName">${esc(rxnPilotDisplayName(p))}</div><div class="rxnLapTrack"><i style="width:${pr.pct.toFixed(1)}%;background:${pr.color}"></i></div></div><div class="rxnFlagCell">${rxnFlagMarkup(p)}</div><div class="rxnGap">${rxnSplitMillisText(classicRCGap(ranked,s,p,i))}</div><div class="rxnCheck ${l.started?'ok':''}">${status}</div><div class="rxnBest">${rxnTimeHtml(l.bestLapMs)}</div><div class="rxnAvg">${rxnTimeHtml(classicRCLapAvg(l))}</div><div class="rxnLast">${rxnTimeHtml(l.lastLapMs)}</div><div class="rxnLaps">${l.laps||0}</div><div class="rxnPhoneMetric">${phone}</div></div>`;}).join('');}
function classicRCTimerPanel(){
  const c=ClassicRCEngine.get(),ev=ClassicRCRuntime.event(),s=ClassicRCRuntime.ensureSession(),cat=ClassicRCEngine.category(),rank=ClassicRCRuntime.liveRanking(),leader=rank[0],laps=leader?Number(s.live?.[leader.id]?.laps||0):0,phase=s?.phase||'ready';
  let label=phase==='countdown'?'ДО СТАРТА':phase==='finished'?'ФИНИШ':['seeding','controlled','finalPractice'].includes(ev?.stage)?'ДО КОНЦА':'ДО ФИНИША';
  const lastLap=['qualifying','final'].includes(ev?.stage)?' + LAST LAP':'',mode=ev?.stage==='qualifying'?' · STAGGERED':'';
  const simAvailable=!lapwiz.connected&&typeof raceTestSourceAdapter!=='undefined'&&raceTestSourceAdapter.available(),simOn=simAvailable&&raceTestSourceAdapter.isEnabled(),simSpeed=simOn?ClassicRCRuntime.testScale():1;
  const simButton=simAvailable?`<button type="button" class="rxnSimulatorButton ${simOn?'active':''}" data-classic-action="sim-settings">SIM</button>${simOn?`<button type="button" class="classicSimSpeed" data-classic-action="sim-speed" title="Скорость симуляции">×${simSpeed}</button>`:''}`:'';
  return `<section class="rxnTimerPanel"><div class="rxnTimerCopy"><div class="rxnTimerClassRow"><span class="rxnTimerClass" id="classicTimerLabel">${label}</span><span class="classicEfraChip">EFRA</span>${simButton}</div><strong id="classicMainTimer">${ClassicRCRuntime.timerValue()}</strong><small id="classicTimerSubline">ЗАЕЗД ${ev?.durationMin||cat.raceMinutes} МИН${lastLap}${mode}</small></div><div class="rxnRing" style="--ring-progress:0deg"><div><b id="classicRingMain">${laps}</b><small>КРУГОВ ЛИДЕРА</small></div></div></section>`;
}
function classicRCMobileInfo(){return `<div class="rxnMobileRaceInfo"><div class="rxnMobileBest"><b>BEST LAP</b><span data-classic-best-name>—</span><strong data-classic-best-time>—</strong></div><time data-rxn-system-clock>${rxnSystemClockText()}</time></div>`;}
function classicRCControls(){const c=ClassicRCEngine.get(),ev=ClassicRCRuntime.event(),s=ClassicRCRuntime.ensureSession();if(c?.directorHold?.active)return `<section class="rxnControlPanel"><div class="rxnControls">${rxnControlButton('','disabled','pause','ОСТАНОВЛЕНО')}${rxnControlButton('','disabled','pause','ПАУЗА')}${rxnControlButton('','disabled','flag','ФИНИШ')}${rxnControlButton('blue','data-classic-action="schedule"','flag','РАСПИСАНИЕ')}${rxnControlButton('blue','data-classic-action="results"','chart','РЕЗУЛЬТАТЫ')}${rxnControlButton('danger','disabled','stop','СТОП')}</div>${rxnDisplayTools()}</section>`;if(c?.status==='finished')return `<section class="rxnControlPanel"><div class="rxnControls">${rxnControlButton('blue','data-classic-action="results"','chart','РЕЗУЛЬТАТЫ')}${rxnControlButton('','data-classic-action="home"','home','ГЛАВНАЯ')}${rxnControlButton('','data-classic-action="setup"','settings','СОБЫТИЕ')}${rxnControlButton('blue','data-classic-action="schedule"','flag','РАСПИСАНИЕ')}${rxnControlButton('blue','disabled','refresh','РЕСТАРТ')}${rxnControlButton('danger','data-classic-action="archive"','stop','ЗАВЕРШИТЬ')}</div>${rxnDisplayTools()}</section>`;const p=s?.phase||'ready',primary=p==='ready'?rxnControlButton('primary','data-classic-action="start"','play','СТАРТ',ev?.stage==='qualifying'?'STAGGERED':'10 SEC'):p==='paused'?rxnControlButton('primary','data-classic-action="pause"','play','ПРОДОЛЖИТЬ'):p==='finished'?rxnControlButton('blue','data-classic-action="confirm-result"','chart','РЕЗУЛЬТАТ','ПОДТВЕРДИТЬ'):rxnControlButton('primary','disabled','play','ЗАЕЗД ИДЁТ');return `<section class="rxnControlPanel"><div class="rxnControls">${primary}${rxnControlButton('','data-classic-action="pause" '+(!['running','finishing'].includes(p)?'disabled':''),'pause','ПАУЗА')}${rxnControlButton('','data-classic-action="finish" '+(!['running','finishing','paused'].includes(p)?'disabled':''),'flag','ФИНИШ')}${rxnControlButton('blue','data-classic-action="restart" '+(p!=='finished'?'disabled':''),'refresh','РЕСТАРТ')}${rxnControlButton('blue','data-classic-action="results"','chart','РЕЗУЛЬТАТЫ')}${rxnControlButton('danger','data-classic-action="stop" '+(!['countdown','running','finishing','paused'].includes(p)?'disabled':''),'stop','СТОП')}</div>${rxnDisplayTools()}</section>`;}

function classicRCCountdownText(ms){
  const n=Math.max(0,Math.ceil((Number(ms)||0)/1000)),h=Math.floor(n/3600),m=Math.floor((n%3600)/60),sec=n%60;
  return h>0?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
function classicRCScheduleSnapshot(){
  const c=ClassicRCEngine.get(),tl=c?.timeline,now=ClassicRCRuntime.nowEpoch();
  if(!tl)return{now,current:null,next:null,state:'РАСПИСАНИЕ',nextText:'НЕТ ДАННЫХ',countdownLabel:'',countdown:'—',remainingMs:0,hold:false};
  const before=(tl.items||[]).map(x=>`${x.id}:${x.status}`).join('|'),current=CompetitionScheduler.currentItem(tl,now),after=(tl.items||[]).map(x=>`${x.id}:${x.status}`).join('|');if(before!==after)ClassicRCEngine.persist();
  const hold=Boolean(c.directorHold?.active),next=CompetitionScheduler.nextItemAfter(tl,current)||CompetitionScheduler.nextHeat(tl);
  if(hold)return{now,current,next,state:'СОРЕВНОВАНИЕ СТОП',nextText:current?.label||'РАСПИСАНИЕ ОСТАНОВЛЕНО',countdownLabel:'',countdown:'ПАУЗА',remainingMs:0,hold:true};
  if(!current)return{now,current:null,next:null,state:'ФИНИШ',nextText:'СОРЕВНОВАНИЕ ЗАВЕРШЕНО',countdownLabel:'',countdown:'—',remainingMs:0,hold:false};
  if(current.status==='active'){
    const target=Number(next?.plannedStartEpoch)||0,remaining=target?Math.max(0,target-now):0;
    return{now,current,next,state:'ЗАЕЗД ИДЁТ',nextText:next?`ДАЛЕЕ · ${next.label}`:'ПОСЛЕДНИЙ ЗАЕЗД',countdownLabel:next?'ДО СОБЫТИЯ':'',countdown:next?classicRCCountdownText(remaining):'—',remainingMs:remaining,hold:false};
  }
  if(current.kind==='break'){
    const start=Number(current.plannedStartEpoch)||now,end=start+Math.max(0,Number(current.durationMin)||0)*60000,started=now>=start,remaining=Math.max(0,(started?end:start)-now),heat=CompetitionScheduler.nextHeat(tl);
    return{now,current,next:heat,state:started?'ПАУЗА':'ОЖИДАНИЕ ПАУЗЫ',nextText:heat?`ДАЛЕЕ · ${heat.label}`:'ПОСЛЕДНЕЕ СОБЫТИЕ',countdownLabel:started?'ОСТАЛОСЬ':'ДО ПАУЗЫ',countdown:classicRCCountdownText(remaining),remainingMs:remaining,hold:false};
  }
  const target=Number(current.plannedStartEpoch)||now,remaining=Math.max(0,target-now),ready=now>=target;
  return{now,current,next,state:ready?'ГОТОВ К СТАРТУ':'ОЖИДАНИЕ',nextText:`${current.label}`,countdownLabel:ready?'':'ДО СТАРТА',countdown:ready?'00:00':classicRCCountdownText(remaining),remainingMs:remaining,hold:false};
}
function classicRCScheduleStatusStrip(clickable=false){
  const x=classicRCScheduleSnapshot(),tone=x.hold?'hold':x.current?.kind==='break'?'break':x.current?.status==='active'?'running':'waiting',attrs=clickable?' role="button" tabindex="0" data-classic-action="schedule" title="Открыть расписание"':'';
  return `<div class="classicScheduleStatus ${tone}${clickable?' clickable':''}"${attrs}><b data-classic-schedule-label>${esc(x.state)}</b><span class="classicScheduleNext" data-classic-schedule-sub>${esc(x.nextText)}</span><span class="classicScheduleClock"><small>${esc(x.countdownLabel)}</small><strong data-classic-schedule-countdown>${esc(x.countdown)}</strong></span></div>`;
}
function classicRCScheduleRows(){
  const c=ClassicRCEngine.get(),tl=c?.timeline;if(!tl)return[];const snap=classicRCScheduleSnapshot(),items=tl.items||[],idx=Math.max(0,snap.current?items.indexOf(snap.current):items.findIndex(x=>x.status==='pending'));
  if(classicScheduleTab==='all')return items;if(classicScheduleTab==='next')return items.slice(idx,idx+12);return items.slice(idx,idx+6);
}
function classicRCScheduleFooter(snap){
  const c=ClassicRCEngine.get(),s=ClassicRCRuntime.session(),phase=s?.phase||'ready',current=snap.current,nextHeat=CompetitionScheduler.nextHeat(c?.timeline),hold=Boolean(c?.directorHold?.active);
  if(hold)return `<button type="button" class="classicScheduleAction primary wide" data-classic-action="competition-resume">${raceSvg('play')} ПРОДОЛЖИТЬ СОРЕВНОВАНИЕ</button>`;
  if(current?.status==='active')return `<button type="button" class="classicScheduleAction primary wide" data-classic-action="director-finish">${raceSvg('flag')} ЗАВЕРШИТЬ ЗАЕЗД</button><div class="classicScheduleActionGrid"><button type="button" class="classicScheduleAction" data-classic-action="heat-settings">НАСТРОЙКА ЗАЕЗДА</button><button type="button" class="classicScheduleAction warning" data-classic-action="competition-stop">ОСТАНОВИТЬ СОРЕВНОВАНИЕ</button></div>`;
  if(current?.kind==='break')return `<button type="button" class="classicScheduleAction primary wide" data-classic-action="start-early">${raceSvg('next')} НАЧАТЬ СЛЕДУЮЩИЙ</button><div class="classicBreakAdjust"><button type="button" data-classic-action="break-minus" data-break-id="${esc(current.id)}">−1 МИН</button><button type="button" data-classic-action="break-plus-one" data-break-id="${esc(current.id)}">+1 МИН</button><button type="button" data-classic-action="break-plus" data-break-id="${esc(current.id)}">+5 МИН</button></div><div class="classicScheduleActionGrid"><button type="button" class="classicScheduleAction" data-classic-action="skip-break" data-break-id="${esc(current.id)}">ПРОПУСТИТЬ ПАУЗУ</button><button type="button" class="classicScheduleAction warning" data-classic-action="competition-stop">ОСТАНОВИТЬ СОРЕВНОВАНИЕ</button></div>`;
  if(nextHeat?.status==='pending')return `<button type="button" class="classicScheduleAction primary wide" data-classic-action="start-early">${raceSvg('next')} НАЧАТЬ РАНЬШЕ</button><div class="classicScheduleActionGrid"><button type="button" class="classicScheduleAction" data-classic-action="heat-settings">НАСТРОЙКА ЗАЕЗДА</button><button type="button" class="classicScheduleAction" data-classic-action="skip-heat">ПРОПУСТИТЬ ЗАЕЗД</button></div><button type="button" class="classicScheduleAction warning wide" data-classic-action="competition-stop">ОСТАНОВИТЬ СОРЕВНОВАНИЕ</button>`;
  return `<button type="button" class="classicScheduleAction" data-classic-action="schedule-close">ЗАКРЫТЬ</button>`;
}
function classicRCScheduleDrawer(){
  const c=ClassicRCEngine.get(),tl=c?.timeline;if(!tl)return'';const snap=classicRCScheduleSnapshot(),rows=classicRCScheduleRows(),current=snap.current;classicScheduleSig=`${current?.id||''}:${current?.status||''}:${current?.kind||''}:${snap.hold}:${ClassicRCRuntime.testScale()}`;
  return `<button type="button" class="classicScheduleTail ${classicScheduleOpen?'open':''}" data-classic-action="schedule" title="Расписание"><span>${raceSvg('list')}</span><b>РАСПИСАНИЕ</b></button>${classicScheduleOpen?`<div class="classicScheduleScrim" data-classic-action="schedule-close"></div><aside class="classicScheduleDrawer"><header><div><small>CLASSIC RC · EFRA</small><h2>РАСПИСАНИЕ</h2></div><button type="button" data-classic-action="schedule-close">×</button></header>${classicRCScheduleStatusStrip(false)}<nav class="classicScheduleTabs"><button type="button" class="${classicScheduleTab==='now'?'active':''}" data-classic-schedule-tab="now">СЕЙЧАС</button><button type="button" class="${classicScheduleTab==='next'?'active':''}" data-classic-schedule-tab="next">ДАЛЕЕ</button><button type="button" class="${classicScheduleTab==='all'?'active':''}" data-classic-schedule-tab="all">ВЕСЬ ДЕНЬ</button></nav><div class="classicScheduleList">${rows.map(it=>{const live=it===current&&(it.status==='active'||(it.kind==='break'&&snap.now>=Number(it.plannedStartEpoch||0)));const status=live?'live':it.status;return `<div class="classicScheduleRow ${status} ${it.kind==='break'?'break':''}"><time>${CompetitionScheduler.formatTime(it.actualStartEpoch||it.plannedStartEpoch)}</time><i></i><div><b>${esc(it.label)}</b><span>${esc(it.kind==='break'?`${it.durationMin} МИН`:it.subLabel||'')}</span></div>${live?`<strong>${it.kind==='break'?'ПАУЗА':'СЕЙЧАС'}</strong>`:it.status==='completed'?'<em>✓</em>':''}</div>`;}).join('')}</div><footer>${classicRCScheduleFooter(snap)}</footer></aside>`:''}`;
}


function classicRCEnsureScheduleHostEvents(){
  const host=document.getElementById('classicScheduleHost');if(!host||host.dataset.classicScheduleBound==='1')return;
  host.dataset.classicScheduleBound='1';
  const controlFrom=e=>e.target?.closest?.('[data-classic-action],[data-classic-schedule-tab]');
  const activate=(el,e)=>{
    if(!el||el.disabled)return;
    e?.preventDefault?.();e?.stopPropagation?.();
    if(el.dataset.classicScheduleTab){classicScheduleTab=el.dataset.classicScheduleTab||'now';classicRCSyncScheduleHost();return;}
    Promise.resolve(classicRCDispatchAction(el)).catch(err=>{console.error('Classic RC schedule action failed',err);toast(err?.message||'Ошибка Classic RC');});
  };
  /* Native click/tap only. Pointerdown/pointerup synthesis was fragile on real mobile/PWA
     and could cancel or double-trigger controls after drawer re-render. */
  host.addEventListener('click',e=>{const el=controlFrom(e);if(el)activate(el,e);});
  host.addEventListener('keydown',e=>{if(!(e.key==='Enter'||e.key===' '))return;const el=controlFrom(e);if(el)activate(el,e);});
}
function classicRCSyncScheduleHost(){
  const host=document.getElementById('classicScheduleHost');if(!host)return;
  classicRCEnsureScheduleHostEvents();
  if(state.view!=='classicCockpit'||!ClassicRCEngine.get()?.timeline){host.replaceChildren();return;}
  host.innerHTML=classicRCScheduleDrawer();
}

function classicRCCockpitView(){rxnEnsureSystemClockTicker();classicRCEnsureScheduleTicker();const c=ClassicRCEngine.get();if(!c||c.status==='setup')return `<section class="page"><div class="card"><h2>Classic RC ещё не подготовлен</h2><button class="btn primary" data-classic-action="setup">К НАСТРОЙКЕ</button></div></section>`;const ev=ClassicRCRuntime.event(),cls=rxnColumnClass(),count=rxnMetricCount();if(!ev&&c.status==='finished')return `<section class="rxnCockpit classicRCCockpit ${cls}" style="--rxn-metric-count:${count}">${classicRCHeader()}${classicRCTitle()}<main class="rxnMain"><section class="rxnRoster"><div class="classicFinalProtocol">${classicRCFinalProtocolMarkup()}</div></section><aside class="rxnSide"><section class="rxnTimerPanel"><div class="rxnTimerCopy"><span>СОРЕВНОВАНИЕ</span><strong>FIN</strong><small>EFRA 2026</small></div></section>${classicRCControls()}</aside></main></section>`;ClassicRCRuntime.ensureSession();return `<section class="rxnCockpit classicRCCockpit ${cls}" style="--rxn-metric-count:${count}">${classicRCHeader()}${classicRCTitle()}<main class="rxnMain"><section class="rxnRoster"><div id="classicPilotBoard" class="rxnTable">${classicRCPilotTable()}</div></section><aside class="rxnSide">${classicRCScheduleStatusStrip(true)}${classicRCTimerPanel()}${classicRCMobileInfo()}${classicRCControls()}</aside></main></section>`;}


function classicRCHeatSettingsModal(){
  const ev=ClassicRCRuntime.event(),c=ClassicRCEngine.get();if(!ev||!c)return;const locked=['countdown'].includes(ClassicRCRuntime.session()?.phase);
  $('#modalHost').innerHTML=`<div class="modalBackdrop"><section class="modal classicHeatSettingsModal"><div class="modalHead"><div><div class="sectionLabel">CLASSIC RC · ТЕКУЩИЙ ЗАЕЗД</div><h2>${esc(ev.label)}</h2></div><button class="iconBtn" data-classic-modal-close>×</button></div><div class="classicHeatSettingsFields"><label><span>ВРЕМЯ ЗАЕЗДА · МИН</span><input id="classicHeatDuration" type="number" min="1" max="120" step="1" value="${Number(ev.durationMin)||ClassicRCEngine.category().raceMinutes}" ${locked?'disabled':''}></label><label><span>MIN LAP · СЕК</span><input id="classicHeatMinLap" type="number" min="1" max="60" step="0.1" value="${Number(c.settings.minLapSec)||2}" ${locked?'disabled':''}></label></div><div class="rxnResultActions"><button class="btn secondary" data-classic-modal-close>ОТМЕНА</button><button class="btn primary" data-classic-action="heat-settings-apply" ${locked?'disabled':''}>ПРИМЕНИТЬ</button></div></section></div>`;bindClassicRC();
}
function classicRCApplyHeatSettings(){const durationMin=Number($('#classicHeatDuration')?.value),minLapSec=Number($('#classicHeatMinLap')?.value),res=ClassicRCEngine.updateCurrentHeatSettings({durationMin,minLapSec});if(!res.ok)return toast(res.error||'Не удалось сохранить');closeModal();toast('Настройка текущего заезда применена');render();}

function classicRCResultModal(){const ev=ClassicRCRuntime.event(),s=ClassicRCRuntime.session();if(!ev||s?.phase!=='finished')return toast('Сначала завершите заезд');const suggested=ClassicRCRuntime.suggestedResult(),isPractice=['seeding','controlled','finalPractice'].includes(ev.stage),rows=suggested.map((r,i)=>{const p=ClassicRCEngine.pilot(r.pilotId);return `<div class="classicResultRow" data-classic-result-row="${esc(r.pilotId)}"><strong>${i+1}</strong><span class="classicPilotId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||i+1)}</span><div><b>${esc(rxnPilotDisplayName(p))}</b><small>${r.laps||0} кр. · ${rxnFormatDuration(r.timeMs||0)}</small></div><select data-classic-status ${isPractice?'disabled':''}>${ClassicRCEFRARules.statuses.map(st=>`<option value="${st}" ${st===r.status?'selected':''}>${st}</option>`).join('')}</select>${ev.stage==='final'?`<select data-classic-penalty><option value="">БЕЗ ШТРАФА</option><option value="10s">+10 SEC</option><option value="1lap">−1 LAP</option></select>`:`<input data-classic-place type="number" min="1" max="${suggested.length}" value="${r.place??i+1}" disabled>`}</div>`;}).join('');$('#modalHost').innerHTML=`<div class="modalBackdrop"><div class="modal classicResultModal"><div class="modalHead"><div><div class="sectionLabel">${esc(ClassicRCEngine.stageLabel(ev.stage))} · EFRA</div><h2>${esc(ev.label)}</h2><p>${ev.stage==='qualifying'?'Позиция Round-by-Round рассчитывается по laps + time среди всех heats раунда.':ev.stage==='final'?'Очки финала: P1=1, P2=2… · BEST 2 из 3. Jump-start: +10 SEC или −1 LAP назначает директор.':'Практика сохраняет круги для seeding / статистики.'}</p></div><button class="iconBtn" data-classic-modal-close>×</button></div><div class="classicResultList">${rows}</div><div class="rxnResultActions"><button class="btn secondary" data-classic-modal-close>НАЗАД</button><button class="btn primary" data-classic-action="save-result">СОХРАНИТЬ И ДАЛЬШЕ</button></div></div></div>`;bindClassicRC();}
function classicRCSaveResult(){const ev=ClassicRCRuntime.event(),suggested=ClassicRCRuntime.suggestedResult();if(!ev)return;const isPractice=['seeding','controlled','finalPractice'].includes(ev.stage);const result=suggested.map((r,i)=>{const row=document.querySelector(`[data-classic-result-row="${CSS.escape(String(r.pilotId))}"]`),status=isPractice?r.status:(row?.querySelector('[data-classic-status]')?.value||r.status),place=r.place??i+1,penalty=ev.stage==='final'?(row?.querySelector('[data-classic-penalty]')?.value||''):'';let laps=Number(r.laps)||0,timeMs=Number(r.timeMs)||0;if(penalty==='10s')timeMs+=10000;if(penalty==='1lap')laps=Math.max(0,laps-1);return{...r,status,place:status==='DNS'||status==='DSQ'?null:place,laps,timeMs,penalty};});try{ClassicRCRuntime.saveResult(result);closeModal();toast('Результат сохранён');}catch(e){toast(e.message);}}


function classicRCTieNote(row,allRows,type){
  if(!row||!Array.isArray(allRows))return'';const tied=allRows.some(x=>x!==row&&Number(x.total)===Number(row.total));if(!tied||!row.counting?.length)return'';
  const parts=[...row.counting].sort((a,b)=>Number(a.points)-Number(b.points)).map(x=>`${x.laps||0}L/${rxnFormatDuration(x.timeMs||0)}`);
  return `<small class="classicTieInfo">TB ${parts.join(' · ')}</small>`;
}
function classicRCResultsModal(){const c=ClassicRCEngine.get();if(!c)return;const q=c.qualifyingStandings||[],rounds=Number(c.settings.qualifyingRounds||5),seed=c.seedStandings||[],finals=c.finalStandings||[];const seedRows=seed.map(r=>`<tr><td>${r.rank}</td><td>${esc(rxnPilotDisplayName(ClassicRCEngine.pilot(r.pilotId)))}</td><td>${r.best?rxnFormatDuration(r.best.avgMs):'—'}</td></tr>`).join('');const qRows=q.map(r=>`<tr><td>${r.rank}</td><td>${esc(rxnPilotDisplayName(ClassicRCEngine.pilot(r.pilotId)))}</td>${Array.from({length:rounds},(_,i)=>{const rr=r.rounds.find(x=>x.round===i+1),counted=r.counting.some(x=>x.round===i+1);return `<td class="${counted?'counted':''}">${rr?rr.points:'—'}</td>`;}).join('')}<td><b>${r.valid?r.total:'—'}</b>${r.valid?classicRCTieNote(r,q,'q'):''}</td></tr>`).join('');const finalBlocks=finals.sort((a,b)=>a.groupName.localeCompare(b.groupName)).map(g=>`<h3>FINAL ${g.groupName}</h3><div class="tableWrap"><table class="table"><thead><tr><th>POS</th><th>ПИЛОТ</th><th>LEG 1</th><th>LEG 2</th><th>LEG 3</th><th>BEST 2</th></tr></thead><tbody>${g.standings.map(r=>`<tr><td>${r.rank}</td><td>${esc(rxnPilotDisplayName(ClassicRCEngine.pilot(r.pilotId)))}</td>${[1,2,3].map(n=>{const x=r.all.find(y=>y.leg===n);return `<td>${x?x.points:'—'}</td>`;}).join('')}<td><b>${r.counting.length>=2?r.total:'—'}</b>${r.counting.length>=2?classicRCTieNote(r,g.standings,'final'):''}</td></tr>`).join('')}</tbody></table></div>`).join('');$('#modalHost').innerHTML=`<div class="modalBackdrop"><div class="modal classicTablesModal"><div class="modalHead"><div><div class="sectionLabel">CLASSIC RC · ${esc(c.ruleset)}</div><h2>${esc(c.name)}</h2></div><button class="iconBtn" data-classic-modal-close>×</button></div><div class="classicRulesBar"><span>Q: 0 / 2 / 3 / 4…</span><span>FINALS: 1 / 2 / 3…</span><span>3 LEGS · BEST 2</span><span>MAX 10 / HEAT</span></div><h3>SEEDING</h3><div class="tableWrap"><table class="table"><thead><tr><th>POS</th><th>ПИЛОТ</th><th>BEST ${c.settings.seedingConsecutiveLaps} AVG</th></tr></thead><tbody>${seedRows||'<tr><td colspan="3">—</td></tr>'}</tbody></table></div><h3>QUALIFYING</h3><div class="tableWrap"><table class="table"><thead><tr><th>POS</th><th>ПИЛОТ</th>${Array.from({length:rounds},(_,i)=>`<th>Q${i+1}</th>`).join('')}<th>COUNT</th></tr></thead><tbody>${qRows||'<tr><td colspan="8">—</td></tr>'}</tbody></table></div>${finalBlocks||''}</div></div>`;bindClassicRC();}
function classicRCFinalProtocolMarkup(){const c=ClassicRCEngine.get(),rows=c?.finalProtocol||[];if(!rows.length)return'<div class="rxnEmpty">Итоговый протокол ещё не сформирован.</div>';return `<div class="rxnFinalHead"><span>POS</span><span>ПИЛОТ</span><span>FINAL</span><span>BEST 2</span></div>${rows.map(r=>`<div class="rxnFinalRow"><b>${r.overallRank}</b><span>${esc(rxnPilotDisplayName(ClassicRCEngine.pilot(r.pilotId)))}</span><strong>${esc(r.groupName)}</strong><small>${r.total}</small></div>`).join('')}`;}

function classicRCUpdateScheduleClock(){
  if(state.view!=='classicCockpit')return;const snap=classicRCScheduleSnapshot();
  document.querySelectorAll('[data-classic-schedule-countdown]').forEach(x=>x.textContent=snap.countdown);
  document.querySelectorAll('[data-classic-schedule-label]').forEach(x=>x.textContent=snap.state);
  document.querySelectorAll('[data-classic-schedule-sub]').forEach(x=>x.textContent=snap.nextText);
  document.querySelectorAll('.classicScheduleClock small').forEach(x=>x.textContent=snap.countdownLabel);
  const sig=`${snap.current?.id||''}:${snap.current?.status||''}:${snap.current?.kind||''}:${snap.hold}:${ClassicRCRuntime.testScale()}`;if(classicScheduleOpen&&classicScheduleSig&&sig!==classicScheduleSig){classicScheduleSig=sig;classicRCSyncScheduleHost();}else classicScheduleSig=sig;
}
function classicRCEnsureScheduleTicker(){if(classicScheduleTicker)return;classicScheduleTicker=setInterval(()=>{if(state.view==='classicCockpit'){classicRCUpdateScheduleClock();ClassicRCRuntime.checkLimit?.();}},250);}
function classicRCUpdateDynamic(){if(state.view!=='classicCockpit')return;rxnUpdateSystemClock();classicRCUpdateScheduleClock();const s=ClassicRCRuntime.session(),ev=ClassicRCRuntime.event();if(!s||!ev)return;const timer=document.querySelector('#classicMainTimer');if(timer)timer.textContent=ClassicRCRuntime.timerValue();const label=document.querySelector('#classicTimerLabel');if(label)label.textContent=s.phase==='countdown'?'ДО СТАРТА':s.phase==='finished'?'ФИНИШ':['seeding','controlled','finalPractice'].includes(ev.stage)?'ДО КОНЦА':'ДО ФИНИША';const sub=document.querySelector('#classicTimerSubline');if(sub)sub.textContent=`ЗАЕЗД ${ev.durationMin||ClassicRCEngine.category().raceMinutes} МИН${['qualifying','final'].includes(ev.stage)?' + LAST LAP':''}${ev.stage==='qualifying'?' · STAGGERED':''}`;const ranked=ClassicRCRuntime.liveRanking(),leader=ranked[0],ring=document.querySelector('#classicRingMain');if(ring)ring.textContent=leader?String(s.live?.[leader.id]?.laps||0):'0';let best=null,bp=null;ranked.forEach(p=>{const v=Number(s.live?.[p.id]?.bestLapMs);if(Number.isFinite(v)&&v>0&&(best===null||v<best)){best=v;bp=p;}});document.querySelectorAll('[data-classic-best-name]').forEach(x=>x.textContent=bp?rxnPilotDisplayName(bp):'—');document.querySelectorAll('[data-classic-best-time]').forEach(x=>x.textContent=best?rxnFormatDuration(best):'—');const board=document.querySelector('#classicPilotBoard');if(board){const sig=ranked.map(p=>{const l=s.live[p.id]||ClassicRCRuntime.blank();return`${p.id}:${l.laps}:${Math.round(l.lastLapMs||0)}:${l.finished}:${l.status}`;}).join('|')+rxnLoadPrecision();if(sig!==cRCBoardSig){cRCBoardSig=sig;rxnAnimateBoard(board,classicRCPilotTable());}}}
let cRCBoardSig='';

async function classicRCDispatchAction(b){
  if(!b||b.disabled)return;
  const a=b.dataset.classicAction;
  if(!a)return;
  if(a==='open')return classicRCOpen();
  if(a==='home'){ClassicRCRuntime.dispose();return nav('home');}
  if(a==='setup')return nav('classicSetup');
  if(a==='cockpit')return nav('classicCockpit');
  if(a==='prepare'){
    const ids=$$('[data-classic-pilot].active').map(x=>x.dataset.classicPilot);
    ClassicRCEngine.updateSetup({name:$('#classicName')?.value||'Classic RC',date:$('#classicDate')?.value,location:$('#classicLocation')?.value||'',category:$('#classicCategory')?.value,pilotIds:ids,settings:{startTime:$('#classicStartTime')?.value||'09:00',seedingRounds:Number($('#classicSeedRounds')?.value)||2,seedingConsecutiveLaps:Number($('#classicSeedLaps')?.value)||3,controlledPracticeRounds:Number($('#classicPracticeRounds')?.value)||2,qualifyingRounds:Number($('#classicQRounds')?.value)||5,minLapSec:Number($('#classicMinLap')?.value)||2,roundBreakMin:Number($('#classicRoundBreak')?.value)||0,finalBreakMin:Number($('#classicFinalBreak')?.value)||0,finalPractice:Boolean($('#classicFinalPractice')?.checked),lowestFinalPolicy:$('#classicLowestFinal')?.value==='rebalance'?'rebalance':'keep'}});
    try{ClassicRCEngine.prepare();return nav('classicCockpit');}catch(e){return toast(e.message);}
  }
  if(a==='delete'){if(confirm('Удалить текущее Classic RC соревнование?')){ClassicRCRuntime.dispose();ClassicRCEngine.reset();nav('home');}return;}
  if(a==='start')return ClassicRCRuntime.beginStart();
  if(a==='pause')return ClassicRCRuntime.pause();
  if(a==='finish')return ClassicRCRuntime.finish();
  if(a==='stop')return ClassicRCRuntime.stop();
  if(a==='restart'){if(confirm('Сбросить текущую попытку и подготовить этот же заезд заново?'))ClassicRCRuntime.restart();return;}
  if(a==='confirm-result')return classicRCResultModal();
  if(a==='save-result')return classicRCSaveResult();
  if(a==='results')return classicRCResultsModal();
  if(a==='schedule'){classicScheduleOpen=!classicScheduleOpen;classicRCSyncScheduleHost();return;}
  if(a==='schedule-close'){classicScheduleOpen=false;classicRCSyncScheduleHost();return;}
  if(a==='sim-settings'){if(typeof raceSimulatorModal==='function')return raceSimulatorModal();return toast('Симулятор не загружен');}
  if(a==='sim-speed'){const speed=ClassicRCRuntime.cycleSimulationSpeed();toast(`SIM ×${speed}`);return render();}
  if(a==='start-early'){classicScheduleOpen=false;return ClassicRCRuntime.beginStart();}
  if(a==='director-finish'){classicScheduleOpen=false;return ClassicRCRuntime.finish('Досрочно завершено директором');}
  if(a==='heat-settings')return classicRCHeatSettingsModal();
  if(a==='heat-settings-apply')return classicRCApplyHeatSettings();
  if(a==='skip-heat'){
    if(!confirm('Пропустить текущий заезд? Для его пилотов будет записан DNS.'))return;
    const ss=ClassicRCRuntime.session();
    if(ss&&['countdown','running','finishing','paused'].includes(ss.phase))return toast('Сначала завершите активный заезд');
    const r=ClassicRCEngine.skipCurrentEvent(ClassicRCRuntime.nowEpoch());
    if(!r.ok)return toast(r.error||'Не удалось пропустить');
    classicScheduleOpen=true;return render();
  }
  if(a==='skip-break'){const r=ClassicRCEngine.skipScheduleBreak(b.dataset.breakId,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast('Не удалось пропустить паузу');toast('Пауза пропущена');classicRCSyncScheduleHost();classicRCUpdateScheduleClock();return;}
  if(a==='break-minus'){const r=ClassicRCEngine.adjustScheduleBreak(b.dataset.breakId,-1,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast('Не удалось изменить паузу');toast(`Пауза · ${r.item.durationMin} мин`);classicRCSyncScheduleHost();classicRCUpdateScheduleClock();return;}
  if(a==='break-plus-one'){const r=ClassicRCEngine.adjustScheduleBreak(b.dataset.breakId,1,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast('Не удалось изменить паузу');toast(`Пауза · ${r.item.durationMin} мин`);classicRCSyncScheduleHost();classicRCUpdateScheduleClock();return;}
  if(a==='break-plus'){const r=ClassicRCEngine.adjustScheduleBreak(b.dataset.breakId,5,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast('Не удалось изменить паузу');toast(`Пауза · ${r.item.durationMin} мин`);classicRCSyncScheduleHost();classicRCUpdateScheduleClock();return;}
  if(a==='competition-stop'){
    if(!confirm('Остановить соревнование? Расписание и текущий заезд будут поставлены на паузу.'))return;
    const ss=ClassicRCRuntime.session();
    if(ss?.phase==='countdown')await ClassicRCRuntime.stop();
    else if(ss&&['running','finishing'].includes(ss.phase))await ClassicRCRuntime.pause();
    ClassicRCEngine.pauseCompetition(ClassicRCRuntime.rawNowEpoch());classicScheduleOpen=true;return render();
  }
  if(a==='competition-resume'){
    const r=ClassicRCEngine.resumeCompetition(ClassicRCRuntime.rawNowEpoch());
    if(!r?.ok)return toast('Соревнование уже продолжено');
    const ss=ClassicRCRuntime.session();
    if(ss?.phase==='paused')await ClassicRCRuntime.pause();
    toast('Соревнование продолжено');
    classicScheduleOpen=true;return render();
  }
  if(a==='archive'){if(confirm('Сохранить Classic RC в архив и закрыть активный модуль?')){ClassicRCRuntime.dispose();ClassicRCEngine.archive();nav('home');}return;}
  if(a==='next'){const ev=ClassicRCRuntime.event();toast(ev?ev.label:'Соревнование завершено');return;}
}


function classicRCBindActionElement(b){
  if(!b||b.dataset.classicBound==='1')return;
  b.dataset.classicBound='1';
  b.addEventListener('click',e=>{
    if(b.disabled)return;
    e.preventDefault();e.stopPropagation();
    Promise.resolve(classicRCDispatchAction(b)).catch(err=>{console.error('Classic RC action failed',err);toast(err?.message||'Ошибка Classic RC');});
  });
  if(!/^(BUTTON|INPUT|SELECT|A)$/.test(b.tagName)){
    b.addEventListener('keydown',e=>{
      if(!(e.key==='Enter'||e.key===' '))return;
      e.preventDefault();e.stopPropagation();
      Promise.resolve(classicRCDispatchAction(b)).catch(err=>{console.error('Classic RC key action failed',err);toast(err?.message||'Ошибка Classic RC');});
    });
  }
}

function classicRCBindScheduleTab(tab){
  if(!tab||tab.dataset.classicTabBound==='1')return;
  tab.dataset.classicTabBound='1';
  tab.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();classicScheduleTab=tab.dataset.classicScheduleTab||'now';render();});
}

function classicRCBindModalClose(b){
  if(!b||b.dataset.classicModalBound==='1')return;
  b.dataset.classicModalBound='1';
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeModal();});
}

function bindClassicRC(){
  classicRCSyncScheduleHost();
  $$('[data-classic-action]').filter(b=>!b.closest('#classicScheduleHost')).forEach(classicRCBindActionElement);
  $$('[data-classic-schedule-tab]').filter(b=>!b.closest('#classicScheduleHost')).forEach(classicRCBindScheduleTab);
  $$('[data-classic-modal-close]').forEach(classicRCBindModalClose);
  $$('[data-classic-pilot]').forEach(b=>{b.onclick=()=>{b.classList.toggle('active');b.querySelector('i').textContent=b.classList.contains('active')?'✓':'+';const n=$$('[data-classic-pilot].active').length,el=$('#classicPilotCount');if(el)el.textContent=n;const prepare=$('[data-classic-action="prepare"]');if(prepare)prepare.disabled=n<2;};});
}
