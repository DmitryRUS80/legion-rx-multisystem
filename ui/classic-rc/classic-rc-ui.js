'use strict';
/* LEGION RX · CLASSIC RC EFRA UI adapter.
   Uses shared cockpit visual primitives, never RallyCross sport rules. */
let classicScheduleOpen=false,classicParticipantsOpen=false,classicScheduleTab='now',classicScheduleTicker=null,classicScheduleSig='';

function classicRCOpen(){
  let c=ClassicRCEngine.get();
  if(!c)c=ClassicRCEngine.create({name:'EFRA RC',date:new Date().toISOString().slice(0,10),category:'10-offroad',startTime:new Date(Date.now()+10*60000).toTimeString().slice(0,5)});
  nav(c.status==='setup'?'classicSetup':'classicCockpit');
}
function classicRCSetupView(){
  let c=ClassicRCEngine.get();if(!c)c=ClassicRCEngine.create({name:'EFRA RC',date:new Date().toISOString().slice(0,10),category:'10-offroad',startTime:'09:00'});
  const cfg=c.settings||{},cat=ClassicRCEFRARules.categories[c.category]||ClassicRCEFRARules.categories['10-offroad'];
  const selected=new Set(c.pilotIds||[]),pilotCards=(state.pilotDb||[]).map(p=>`<button type="button" class="classicPilotSelect ${selected.has(p.id)?'active':''}" data-classic-pilot="${esc(p.id)}"><span class="classicPilotId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||'—')}</span><span><b>${esc(rxnPilotDisplayName(p))}</b><small>${esc(p.club||p.city||'ПИЛОТ')}</small></span><i>${selected.has(p.id)?'✓':'+'}</i></button>`).join('');
  const heatCount=Math.max(1,Math.ceil(Math.max(1,selected.size)/10)),qCount=classicRCQualifyingRoundsToCount(cfg.qualifyingRounds||5);
  if(c.status!=='setup')return `<section class="page classicSetupPage"><div class="pageHeader"><div><div class="sectionLabel">EFRA RC · 2026</div><h1>${esc(c.name)}</h1><p>${esc(cat.label)} · ${c.pilotIds.length} пилотов · ${c.events.filter(e=>e.saved).length}/${c.events.length} заездов завершено</p></div><div class="btnRow"><button class="btn primary" data-classic-action="cockpit">ОТКРЫТЬ ПУЛЬТ</button><button class="btn secondary" data-classic-action="results">РЕЗУЛЬТАТЫ</button></div></div><article class="card classicPreparedSummary"><b>Спортивный модуль сформирован и зафиксирован.</b><span>Расстановка / Практика → Квалификация по раундам → Финалы A/B/C · в зачёт 2 из 3.</span><div class="btnRow"><button class="btn danger" data-classic-action="delete">УДАЛИТЬ EFRA RC</button></div></article></section>`;
  return `<section class="page classicSetupPage"><div class="pageHeader"><div><div class="sectionLabel">EFRA RC · 2026</div><h1>EFRA RC</h1><p>Отдельный спортивный модуль. RallyCross не используется и не изменяется.</p></div></div>
  <div class="classicSetupGrid">
   <article class="card classicSetupMain"><div class="sectionLabel">СОБЫТИЕ</div><div class="classicFields classicFieldsMain">
    <label><span>Название</span><input id="classicName" value="${esc(c.name||'EFRA RC')}"></label>
    <label><span>Дата</span><input id="classicDate" type="date" value="${esc(c.date)}"></label>
    <label><span>Место</span><input id="classicLocation" value="${esc(c.location||'')}" placeholder="Трасса / город"></label>
    <label><span>Старт дня</span><input id="classicStartTime" type="time" value="${esc(cfg.startTime||'09:00')}"></label>
   </div></article>
   <article class="card classicSetupMain"><div class="sectionLabel">EFRA PRESET</div><div class="classicFields">
    <label><span>Категория</span><select id="classicCategory">${Object.values(ClassicRCEFRARules.categories).map(x=>`<option value="${x.id}" ${x.id===c.category?'selected':''}>${esc(x.label)} · ${x.raceMinutes} МИН</option>`).join('')}</select></label>
    <label><span>Расстановка · раундов</span><select id="classicSeedRounds">${[2,3,4].map(n=>`<option ${Number(cfg.seedingRounds||2)===n?'selected':''}>${n}</option>`).join('')}</select></label>
    <label><span>Seeding · подряд кругов для расстановки</span><select id="classicSeedLaps"><option value="2" ${Number(cfg.seedingConsecutiveLaps)===2?'selected':''}>2 круга</option><option value="3" ${Number(cfg.seedingConsecutiveLaps||3)===3?'selected':''}>3 круга</option></select></label>
    <label><span>Контрольная практика · раундов</span><select id="classicPracticeRounds">${[1,2,3,4].map(n=>`<option ${Number(cfg.controlledPracticeRounds||2)===n?'selected':''}>${n}</option>`).join('')}</select></label>
    <label><span>Квалификация · раундов</span><select id="classicQRounds">${[2,3,4,5,6].map(n=>`<option ${Number(cfg.qualifyingRounds||5)===n?'selected':''}>${n}</option>`).join('')}</select></label>
    <label><span>Мин. круг LapWiz · сек</span><input id="classicMinLap" type="number" min="1" max="60" value="${Number(cfg.minLapSec||2)}"></label>
   </div><div class="classicRuleLine"><b>${cat.raceMinutes} МИН + LAST LAP</b><span>Q: Round-by-Round · зачёт лучших ${qCount||'—'} · до 10 пилотов в heat</span></div></article>
   <article class="card classicSetupMain"><div class="sectionLabel">РАСПИСАНИЕ</div><div class="classicFields">
    <label><span>Пауза между раундами · мин</span><input id="classicRoundBreak" type="number" min="0" max="60" value="${Number(cfg.roundBreakMin||5)}"></label>
    <label><span>Перед финалами · мин</span><input id="classicFinalBreak" type="number" min="0" max="120" value="${Number(cfg.finalBreakMin||20)}"></label>
    <label><span>Нижний финал &lt; 4 пилотов</span><select id="classicLowestFinal"><option value="keep" ${(cfg.lowestFinalPolicy||'keep')==='keep'?'selected':''}>Провести как есть</option><option value="rebalance" ${cfg.lowestFinalPolicy==='rebalance'?'selected':''}>Уравнять с соседним</option></select></label>
    <label class="classicCheck"><input id="classicFinalPractice" type="checkbox" ${cfg.finalPractice!==false?'checked':''}><span>Контрольная практика перед финалами</span></label>
   </div><div class="classicRuleLine"><b>MIN START GAP ${cat.minStartGapMin} МИН</b><span>Расписание можно сдвигать во время соревнования; спортивные результаты не меняются.</span></div></article>
   <article class="card classicPilotCard"><div class="pageHeader compact"><div><div class="sectionLabel">ПИЛОТЫ</div><h2>Участники · <span id="classicPilotCount">${selected.size}</span></h2></div><button class="btn secondary" data-nav="pilots">БАЗА ПИЛОТОВ</button></div><div class="classicPilotGrid">${pilotCards||'<div class="empty">В базе пока нет пилотов. Добавьте их в разделе «Пилоты».</div>'}</div></article>
   <article class="card classicPlanCard"><div class="sectionLabel">ПЛАН</div><div class="classicPlanStats"><span><b>${heatCount}</b><small>ГРУПП / РАУНД</small></span><span><b>${cfg.qualifyingRounds||5}</b><small>КВ. РАУНДОВ</small></span><span><b>${qCount||'—'}</b><small>КВ. В ЗАЧЁТ</small></span><span><b>3 / 2</b><small>ФИНАЛОВ / В ЗАЧЁТ</small></span></div><div class="btnRow"><button class="btn primary" data-classic-action="prepare" ${selected.size<2?'disabled':''}>СФОРМИРОВАТЬ EFRA И ОТКРЫТЬ ПУЛЬТ</button><button class="btn danger" data-classic-action="delete">УДАЛИТЬ</button></div></article>
  </div></section>`;
}

function classicRCStageBanner(ev){
  const c=ClassicRCEngine.get(),groups=Math.max(1,c?.groups?.length||1),count=ev?.pilots?.length||0;
  if(!ev)return{stage:'EFRA RC',heat:'—',discipline:'EFRA 2026',pilots:'ПИЛОТЫ 0/0'};
  if(ev.stage==='seeding')return{stage:`РАССТАНОВКА ${ev.round}`,heat:`ГРУППА ${ev.heat}/${groups}`,discipline:'EFRA RC',pilots:`ПИЛОТЫ ${count}/${count}`};
  if(ev.stage==='controlled')return{stage:`ПРАКТИКА ${ev.round}`,heat:`ГРУППА ${ev.heat}/${groups}`,discipline:'EFRA RC',pilots:`ПИЛОТЫ ${count}/${count}`};
  if(ev.stage==='qualifying')return{stage:`КВ${ev.round}`,heat:`ГРУППА ${ev.heat}/${groups}`,discipline:'EFRA RC',pilots:`ПИЛОТЫ ${count}/${count}`};
  if(ev.stage==='finalPractice')return{stage:`ФИНАЛ ${ev.groupName}`,heat:'ПРАКТИКА',discipline:'EFRA RC',pilots:`ПИЛОТЫ ${count}/${count}`};
  return{stage:`ФИНАЛ ${ev.groupName}`,heat:`ЗАЕЗД ${ev.round}/3`,discipline:'EFRA RC',pilots:`ПИЛОТЫ ${count}/${count}`};
}
function classicRCHeader(){
  return `<header class="rxnTop"><div class="rxnHeaderLeft"><button class="rxnHomeBrand" type="button" data-classic-action="home"><span>LEGION <i>RX</i></span></button><nav class="rxnPrimaryNav"><button data-classic-action="home">${raceSvg('home')}<b>ГЛАВНАЯ</b></button><button data-nav="championships">${raceSvg('trophy')}<b>ЧЕМПИОНАТЫ</b></button><button data-nav="pilots">${uiIcon('users','raceSvg')}<b>ПИЛОТЫ</b></button></nav><div class="rxnSystemClock"><strong data-rxn-system-clock>${rxnSystemClockText()}</strong><span>ВРЕМЯ</span></div></div>
  <nav class="rxnTopActions" aria-label="EFRA RC">${rxnTopButton({cls:lapwiz.connected?'ok':'',attrs:'data-quick-panel="lapwiz" title="LapWiz"',icon:'wave'})}${rxnTopButton({cls:state.settings.announcerEnabled?'ok':'',attrs:'data-quick-panel="announcer" title="Диктор"',icon:'mic'})}${rxnTopButton({cls:'blue',attrs:'data-classic-action="schedule" title="Расписание"',icon:'flag'})}${rxnTopButton({attrs:'data-classic-action="next" title="Следующий"',icon:'next'})}${rxnTopButton({cls:'danger',attrs:'data-classic-action="stop" title="STOP"',icon:'stop'})}${rxnTopButton({cls:'blue',attrs:'data-classic-action="results" title="Результаты"',icon:'chart'})}${rxnTopButton({attrs:'data-classic-action="race-settings" title="Настройки гонки"',icon:'settings'})}${rxnTopButton({attrs:'data-classic-action="schedule" title="Расписание"',icon:'list'})}</nav></header>`;
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
  const lastLap=['qualifying','final'].includes(ev?.stage)?' + LAST LAP':'',mode=ev?.startMode==='staggered'?` · ПО ОДНОМУ · ${(Number(c?.settings?.staggerIntervalMs)||1000)/1000} СЕК`:'';
  const simAvailable=!lapwiz.connected&&typeof raceTestSourceAdapter!=='undefined'&&raceTestSourceAdapter.available(),simOn=simAvailable&&raceTestSourceAdapter.isEnabled(),simSpeed=simOn?ClassicRCRuntime.testScale():1;
  const simButton=simAvailable?`<button type="button" class="rxnSimulatorButton ${simOn?'active':''}" data-classic-action="sim-settings">SIM</button>${simOn?`<button type="button" class="classicSimSpeed" data-classic-action="sim-speed" title="Скорость симуляции">×${simSpeed}</button>`:''}`:'';
  return `<section class="rxnTimerPanel"><div class="rxnTimerCopy"><div class="rxnTimerClassRow"><span class="rxnTimerClass" id="classicTimerLabel">${label}</span><span class="classicEfraChip">EFRA</span>${simButton}</div><strong id="classicMainTimer">${ClassicRCRuntime.timerValue()}</strong><small id="classicTimerSubline">ЗАЕЗД ${ev?.durationMin||cat.raceMinutes} МИН${lastLap}${mode}</small></div><div class="rxnRing" style="--ring-progress:0deg"><div><b id="classicRingMain">${laps}</b><small>КРУГОВ ЛИДЕРА</small></div></div></section>`;
}
function classicRCMobileInfo(){return `<div class="rxnMobileRaceInfo"><div class="rxnMobileBest"><b>BEST LAP</b><span data-classic-best-name>—</span><strong data-classic-best-time>—</strong></div><time data-rxn-system-clock>${rxnSystemClockText()}</time></div>`;}
function classicRCControls(){const c=ClassicRCEngine.get(),ev=ClassicRCRuntime.event(),s=ClassicRCRuntime.ensureSession();if(c?.directorHold?.active)return `<section class="rxnControlPanel"><div class="rxnControls">${rxnControlButton('','disabled','pause','ОСТАНОВЛЕНО')}${rxnControlButton('','disabled','pause','ПАУЗА')}${rxnControlButton('','disabled','flag','ФИНИШ')}${rxnControlButton('blue','data-classic-action="schedule"','flag','РАСПИСАНИЕ')}${rxnControlButton('blue','data-classic-action="race-settings"','settings','НАСТРОЙКИ')}${rxnControlButton('danger','disabled','stop','СТОП')}</div>${rxnDisplayTools()}</section>`;if(c?.status==='finished')return `<section class="rxnControlPanel"><div class="rxnControls">${rxnControlButton('blue','data-classic-action="results"','chart','РЕЗУЛЬТАТЫ')}${rxnControlButton('','data-classic-action="home"','home','ГЛАВНАЯ')}${rxnControlButton('','data-classic-action="setup"','settings','СОБЫТИЕ')}${rxnControlButton('blue','data-classic-action="schedule"','flag','РАСПИСАНИЕ')}${rxnControlButton('blue','data-classic-action="race-settings"','settings','НАСТРОЙКИ')}${rxnControlButton('danger','data-classic-action="archive"','stop','ЗАВЕРШИТЬ')}</div>${rxnDisplayTools()}</section>`;const p=s?.phase||'ready',primary=p==='ready'?rxnControlButton('primary','data-classic-action="start"','play','СТАРТ',ev?.startMode==='staggered'?'ПО ОДНОМУ':'10 SEC'):p==='paused'?rxnControlButton('primary','data-classic-action="pause"','play','ПРОДОЛЖИТЬ'):p==='finished'?rxnControlButton('blue','data-classic-action="confirm-result"','chart','РЕЗУЛЬТАТ','ПОДТВЕРДИТЬ'):rxnControlButton('primary','disabled','play','ЗАЕЗД ИДЁТ');return `<section class="rxnControlPanel"><div class="rxnControls">${primary}${rxnControlButton('','data-classic-action="pause" '+(!['running','finishing'].includes(p)?'disabled':''),'pause','ПАУЗА')}${rxnControlButton('','data-classic-action="finish" '+(!['running','finishing','paused'].includes(p)?'disabled':''),'flag','ФИНИШ')}${rxnControlButton('blue','data-classic-action="restart" '+(!['countdown','running','finishing','paused','finished'].includes(p)?'disabled':''),'refresh','РЕСТАРТ')}${rxnControlButton('blue','data-classic-action="race-settings"','settings','НАСТРОЙКИ')}${rxnControlButton('danger','data-classic-action="stop" '+(!['countdown','running','finishing','paused'].includes(p)?'disabled':''),'stop','СТОП')}</div>${rxnDisplayTools()}</section>`;}

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
  if(!current)return{now,current:null,next:null,state:c?.status==='aborted'?'ЗАВЕРШЕНО ДОСРОЧНО':'ФИНИШ',nextText:c?.status==='aborted'?'РЕЗУЛЬТАТЫ СОХРАНЕНЫ · БЕЗ ЗАЧЁТА ЧЕМПИОНАТА':'СОРЕВНОВАНИЕ ЗАВЕРШЕНО',countdownLabel:'',countdown:'—',remainingMs:0,hold:false};
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
  const auto=ClassicRCRuntime.autoState?.(),autoPrefix=auto?.enabled?(auto.paused?'АВТО ПАУЗА · ':'АВТО · '):'';return `<div class="classicScheduleStatus ${tone}${clickable?' clickable':''}"${attrs}><b data-classic-schedule-label>${esc(autoPrefix+x.state)}</b><span class="classicScheduleNext" data-classic-schedule-sub>${esc(x.nextText)}</span><span class="classicScheduleClock"><small>${esc(x.countdownLabel)}</small><strong data-classic-schedule-countdown>${esc(x.countdown)}</strong></span></div>`;
}
function classicRCScheduleRows(){
  const c=ClassicRCEngine.get(),tl=c?.timeline;if(!tl)return[];const snap=classicRCScheduleSnapshot(),items=tl.items||[],idx=Math.max(0,snap.current?items.indexOf(snap.current):items.findIndex(x=>x.status==='pending'));
  if(classicScheduleTab==='all')return items;if(classicScheduleTab==='next')return items.slice(idx,idx+12);return items.slice(idx,idx+6);
}
function classicRCAutoDayControls(){
  const c=ClassicRCEngine.get(),st=ClassicRCRuntime.autoState?.();if(!c?.timeline||['finished','aborted'].includes(c.status))return'';
  if(!st?.enabled)return `<div class="classicAutoDayBar idle"><div><b>АВТО-ДЕНЬ</b><span>Сам запускает заезды по расписанию и сохраняет чистый результат.</span></div><button type="button" class="classicScheduleAction primary" data-classic-action="auto-start-day">НАЧАТЬ ГОНОЧНЫЙ ДЕНЬ</button></div>`;
  if(st.paused)return `<div class="classicAutoDayBar paused"><div><b>АВТО-ДЕНЬ · ПАУЗА</b><span>${esc(st.pauseReason||'РУЧНОЕ УПРАВЛЕНИЕ')}</span></div><div><button type="button" class="classicScheduleAction primary" data-classic-action="auto-resume-day">ПРОДОЛЖИТЬ АВТО</button><button type="button" class="classicScheduleAction" data-classic-action="auto-stop-day">ВЫКЛЮЧИТЬ</button></div></div>`;
  return `<div class="classicAutoDayBar active"><div><b>АВТО-ДЕНЬ · ВКЛЮЧЁН</b><span>${ClassicRCRuntime.session()?.phase==='finished'?'ПРОВЕРКА И АВТОСОХРАНЕНИЕ РЕЗУЛЬТАТА':'РАБОТА ПО РАСПИСАНИЮ'}</span></div><div><button type="button" class="classicScheduleAction" data-classic-action="auto-pause-day">РУЧНОЙ РЕЖИМ</button><button type="button" class="classicScheduleAction" data-classic-action="auto-stop-day">ВЫКЛЮЧИТЬ</button></div></div>`;
}
function classicRCScheduleFooter(snap){
  const c=ClassicRCEngine.get(),s=ClassicRCRuntime.session(),current=snap.current,nextHeat=CompetitionScheduler.nextHeat(c?.timeline),hold=Boolean(c?.directorHold?.active),tl=c?.timeline,autoBar=classicRCAutoDayControls();
  const dayUnlocked=Boolean(tl?.items?.length)&&!tl.items.some(x=>x.status!=='pending'||x.actualStartEpoch||x.actualEndEpoch);
  const dayAdjust=dayUnlocked?`<div class="classicScheduleDayAdjust"><span>СТАРТ ДНЯ <b>${CompetitionScheduler.formatTime(tl.startEpoch)}</b></span><div><button type="button" data-classic-action="day-minus-five">−5</button><button type="button" data-classic-action="day-minus-one">−1</button><button type="button" data-classic-action="day-plus-one">+1</button><button type="button" data-classic-action="day-plus-five">+5</button></div></div>`:'';
  if(hold)return `${autoBar}<button type="button" class="classicScheduleAction primary wide" data-classic-action="competition-resume">${raceSvg('play')} ПРОДОЛЖИТЬ СОРЕВНОВАНИЕ</button>`;
  if(current?.status==='active')return `${autoBar}<button type="button" class="classicScheduleAction primary wide" data-classic-action="director-finish">${raceSvg('flag')} ЗАВЕРШИТЬ ЗАЕЗД</button><div class="classicScheduleActionGrid"><button type="button" class="classicScheduleAction" data-classic-action="heat-settings">НАСТРОЙКА ЗАЕЗДА</button><button type="button" class="classicScheduleAction" data-classic-action="restart">РЕСТАРТ ЗАЕЗДА</button></div><button type="button" class="classicScheduleAction warning wide" data-classic-action="competition-stop">ОСТАНОВИТЬ СОРЕВНОВАНИЕ</button>`;
  if(current?.kind==='break')return `${autoBar}${dayAdjust}<button type="button" class="classicScheduleAction primary wide" data-classic-action="start-early">${raceSvg('next')} НАЧАТЬ СЕЙЧАС</button><div class="classicBreakAdjust"><button type="button" data-classic-action="break-minus" data-break-id="${esc(current.id)}">−1 МИН</button><button type="button" data-classic-action="break-plus-one" data-break-id="${esc(current.id)}">+1 МИН</button><button type="button" data-classic-action="break-plus" data-break-id="${esc(current.id)}">+5 МИН</button></div><div class="classicScheduleActionGrid"><button type="button" class="classicScheduleAction" data-classic-action="skip-break" data-break-id="${esc(current.id)}">ПРОПУСТИТЬ ПАУЗУ</button><button type="button" class="classicScheduleAction warning" data-classic-action="competition-stop">ОСТАНОВИТЬ СОРЕВНОВАНИЕ</button></div>`;
  if(nextHeat?.status==='pending')return `${autoBar}${dayAdjust}<button type="button" class="classicScheduleAction primary wide" data-classic-action="start-early">${raceSvg('next')} НАЧАТЬ СЕЙЧАС</button><div class="classicScheduleActionGrid"><button type="button" class="classicScheduleAction" data-classic-action="heat-settings">НАСТРОЙКА ЗАЕЗДА</button><button type="button" class="classicScheduleAction" data-classic-action="skip-heat">ПРОПУСТИТЬ ЗАЕЗД</button></div><button type="button" class="classicScheduleAction warning wide" data-classic-action="competition-stop">ОСТАНОВИТЬ СОРЕВНОВАНИЕ</button>`;
  return `${autoBar}<button type="button" class="classicScheduleAction" data-classic-action="schedule-close">ЗАКРЫТЬ</button>`;
}

function classicRCScheduleDrawer(){
  const c=ClassicRCEngine.get(),tl=c?.timeline;if(!tl)return'';const snap=classicRCScheduleSnapshot(),rows=classicRCScheduleRows(),current=snap.current;const auto=ClassicRCRuntime.autoState?.();classicScheduleSig=`${current?.id||''}:${current?.status||''}:${current?.kind||''}:${snap.hold}:${Boolean(auto?.enabled)}:${Boolean(auto?.paused)}:${ClassicRCRuntime.testScale()}`;
  return `<button type="button" class="classicScheduleTail ${classicScheduleOpen?'open':''}" data-classic-action="schedule" title="Расписание"><span>${raceSvg('list')}</span><b>РАСПИСАНИЕ</b></button>${classicScheduleOpen?`<div class="classicScheduleScrim" data-classic-action="schedule-close"></div><aside class="classicScheduleDrawer"><header><div><small>EFRA RC · 2026</small><h2>РАСПИСАНИЕ</h2></div><button type="button" data-classic-action="schedule-close">×</button></header>${classicRCScheduleStatusStrip(false)}<nav class="classicScheduleTabs"><button type="button" class="${classicScheduleTab==='now'?'active':''}" data-classic-schedule-tab="now">СЕЙЧАС</button><button type="button" class="${classicScheduleTab==='next'?'active':''}" data-classic-schedule-tab="next">ДАЛЕЕ</button><button type="button" class="${classicScheduleTab==='all'?'active':''}" data-classic-schedule-tab="all">ВЕСЬ ДЕНЬ</button></nav><div class="classicScheduleList">${rows.map(it=>{const live=it===current&&(it.status==='active'||(it.kind==='break'&&snap.now>=Number(it.plannedStartEpoch||0))),futureBreak=classicScheduleTab==='all'&&it.kind==='break'&&it.status==='pending'&&!live,status=live?'live':it.status;return `<div class="classicScheduleRow ${status} ${it.kind==='break'?'break':''} ${futureBreak?'hasAdjust':''}"><time>${CompetitionScheduler.formatTime(it.actualStartEpoch||it.plannedStartEpoch)}</time><i></i><div><b>${esc(it.label)}</b><span>${esc(it.kind==='break'?`${it.durationMin} МИН`:it.subLabel||'')}</span></div>${live?`<strong>${it.kind==='break'?'ПАУЗА':'СЕЙЧАС'}</strong>`:it.status==='completed'?'<em>✓</em>':''}${futureBreak?`<aside class="classicScheduleInlineAdjust"><button type="button" data-classic-action="break-minus" data-break-id="${esc(it.id)}">−1</button><button type="button" data-classic-action="break-plus-one" data-break-id="${esc(it.id)}">+1</button><button type="button" data-classic-action="break-plus" data-break-id="${esc(it.id)}">+5</button></aside>`:''}</div>`;}).join('')}</div><footer>${classicRCScheduleFooter(snap)}</footer></aside>`:''}`;
}



function classicRCParticipantProfile(id){return (state.pilotDb||[]).find(p=>String(p.id)===String(id))||ClassicRCEngine.pilot(id);}
function classicRCParticipantCard(id,{withdrawn=false,candidate=false,locked=false}={}){
  const p=classicRCParticipantProfile(id),models=typeof pilotModels==='function'?pilotModels(p):[],model=models[0],idText=model?.transponder||p?.transponder||'—',action=candidate?'late-add':'late-remove',label=candidate?(withdrawn?'ВЕРНУТЬ':'ДОБАВИТЬ'):'УБРАТЬ';
  return `<article class="classicParticipantCard ${withdrawn?'withdrawn':''}"><div class="classicParticipantAvatar">${typeof pilotAvatarMarkup==='function'?pilotAvatarMarkup(p,'classicParticipantAvatarImg'):''}${typeof pilotFlagBadge==='function'?pilotFlagBadge(p):''}</div><div class="classicParticipantMain"><b>${esc(rxnPilotDisplayName(p))}</b><span>ID ${esc(idText)}${model?.className?` · ${esc(String(model.className).toUpperCase())}`:''}</span>${withdrawn?'<em>НЕ УЧАСТВУЕТ В БУДУЩИХ ЗАЕЗДАХ</em>':''}</div><button type="button" class="${candidate?'add':'remove'}" data-classic-action="${action}" data-pilot-id="${esc(id)}" ${locked?'disabled':''}>${label}</button></article>`;
}
function classicRCParticipantsDrawer(){
  const c=ClassicRCEngine.get();if(!c||c.status==='setup'||['finished','aborted'].includes(c.status))return'';const all=(state.pilotDb||[]),registered=new Set((c.pilotIds||[]).map(String)),withdrawn=new Set((c.withdrawnPilotIds||[]).map(String)),active=(c.pilotIds||[]).filter(id=>!withdrawn.has(String(id))),candidates=all.filter(p=>!registered.has(String(p.id))||withdrawn.has(String(p.id))),locked=ClassicRCEngine.finalsLocked?.();
  const tail=`<button type="button" class="classicParticipantsTail ${classicParticipantsOpen?'open':''}" data-classic-action="participants" title="Участники"><span>${uiIcon('users','raceSvg')}</span><b>УЧАСТНИКИ</b><em>${active.length}</em></button>`;
  if(!classicParticipantsOpen)return tail;
  return `${tail}<div class="classicParticipantsScrim" data-classic-action="participants-close"></div><aside class="classicParticipantsDrawer"><header><div><small>EFRA RC · ДИРЕКТОР</small><h2>УЧАСТНИКИ</h2><p>Изменения действуют только для ещё не начавшихся заездов.</p></div><button type="button" data-classic-action="participants-close">×</button></header><div class="classicParticipantsBody"><section><div class="classicParticipantsSectionHead"><b>В СОРЕВНОВАНИИ</b><span>${active.length}</span></div><div class="classicParticipantsList">${active.map(id=>classicRCParticipantCard(id,{locked})).join('')||'<div class="rxnEmpty">Нет активных участников.</div>'}</div></section><section><div class="classicParticipantsSectionHead"><b>ДОБАВИТЬ ИЗ БАЗЫ</b><span>${locked?'ФИНАЛЫ СФОРМИРОВАНЫ':candidates.length}</span></div>${locked?'<div class="classicParticipantsLocked">После формирования финалов состав защищён. Нового пилота можно добавить только в следующее соревнование.</div>':`<div class="classicParticipantsList">${candidates.map(p=>classicRCParticipantCard(p.id,{candidate:true,withdrawn:withdrawn.has(String(p.id))})).join('')||'<div class="rxnEmpty">Все пилоты базы уже участвуют.</div>'}</div>`}</section></div><footer><button type="button" class="classicScheduleAction primary" data-classic-action="late-new" ${locked?'disabled':''}>+ НОВЫЙ ПИЛОТ</button><button type="button" class="classicScheduleAction" data-classic-action="participants-close">ЗАКРЫТЬ</button></footer></aside>`;
}
function classicRCStopOverlay(){
  const c=ClassicRCEngine.get();if(!c?.directorHold?.active||c.status==='aborted')return'';return `<div class="classicStopOverlay"><section><small>EFRA RC · ДИРЕКТОР</small><h2>СОРЕВНОВАНИЕ ОСТАНОВЛЕНО</h2><p>Текущий заезд и расписание заморожены. При продолжении весь будущий график автоматически сдвинется на фактическое время остановки.</p><div class="classicStopOverlayActions"><button type="button" class="btn primary" data-classic-action="competition-resume">${raceSvg('play')} ПРОДОЛЖИТЬ СОРЕВНОВАНИЕ</button><button type="button" class="btn danger" data-classic-action="competition-abort-confirm">${raceSvg('stop')} ЗАВЕРШИТЬ ДОСРОЧНО</button></div><span>Досрочное завершение сохранит уже полученные результаты, но соревнование не будет зачтено в чемпионат.</span></section></div>`;}
function classicRCFinalGridPanel(){
  const ev=ClassicRCRuntime.event(),s=ClassicRCRuntime.session();if(!ev||ev.stage!=='final'||s?.phase!=='countdown')return'';const ids=ClassicRCEngine.startPilots(ev),rows=ids.map((id,i)=>{const p=ClassicRCEngine.pilot(id);return `<div><strong>${i+1}</strong><span class="classicPilotId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||i+1)}</span><b>${esc(rxnPilotDisplayName(p))}</b></div>`;}).join('');return `<aside class="classicFinalGridPanel"><small>EFRA RC · ОБЩИЙ СТАРТ · HORN</small><h2>ФИНАЛ ${esc(ev.groupName)} · СТАРТОВАЯ РЕШЁТКА</h2><section>${rows}</section></aside>`;
}
function classicRCStaggerPanel(){
  const ev=ClassicRCRuntime.event(),s=ClassicRCRuntime.session();if(!ev||ev.startMode!=='staggered'||!s?.staggerReleaseActive)return'';const current=ClassicRCEngine.pilot(s.staggerCurrentPilotId),next=ClassicRCEngine.pilot(s.staggerNextPilotId),idx=Math.max(1,Number(s.staggerReleaseIndex)||1),total=(s.staggerOrder||[]).length;
  return `<aside class="classicStaggerPanel" data-classic-stagger-panel><small>СТАРТ ПО ОДНОМУ · ${((Number(ClassicRCEngine.get()?.settings?.staggerIntervalMs)||1000)/1000).toFixed(1)} СЕК</small><div><span>СТАРТУЕТ</span><b data-classic-stagger-current>${current?esc(rxnPilotDisplayName(current)):'—'}</b><em data-classic-stagger-progress>${idx}/${total}</em></div><div class="next"><span>ДАЛЕЕ</span><b data-classic-stagger-next>${next&&s.staggerNextPilotId?esc(rxnPilotDisplayName(next)):'—'}</b></div></aside>`;
}
function classicRCEnsureScheduleHostEvents(){
  const host=document.getElementById('classicScheduleHost');if(!host||host.dataset.classicScheduleBound==='1')return;
  host.dataset.classicScheduleBound='1';
  const controlFrom=e=>e.target?.closest?.('[data-classic-action],[data-classic-schedule-tab]');
  const activate=(el,e)=>{
    if(!el||el.disabled)return;
    e?.preventDefault?.();e?.stopPropagation?.();
    if(el.dataset.classicScheduleTab){classicScheduleTab=el.dataset.classicScheduleTab||'now';classicRCSyncScheduleHost(false);return;}
    Promise.resolve(classicRCDispatchAction(el)).catch(err=>{console.error('EFRA RC schedule action failed',err);toast(err?.message||'Ошибка EFRA RC');});
  };
  /* Native click/tap only. Pointerdown/pointerup synthesis was fragile on real mobile/PWA
     and could cancel or double-trigger controls after drawer re-render. */
  host.addEventListener('click',e=>{const el=controlFrom(e);if(el)activate(el,e);});
  host.addEventListener('keydown',e=>{if(!(e.key==='Enter'||e.key===' '))return;const el=controlFrom(e);if(el)activate(el,e);});
}
function classicRCSyncScheduleHost(preserveScroll=true){
  const host=document.getElementById('classicScheduleHost');if(!host)return;
  classicRCEnsureScheduleHostEvents();
  const oldList=preserveScroll?host.querySelector('.classicScheduleList'):null,scrollTop=oldList?.scrollTop||0,oldParticipants=preserveScroll?host.querySelector('.classicParticipantsBody'):null,participantScroll=oldParticipants?.scrollTop||0;
  if(state.view!=='classicCockpit'||!ClassicRCEngine.get()?.timeline){host.replaceChildren();return;}
  host.innerHTML=classicRCScheduleDrawer()+classicRCParticipantsDrawer();
  if(preserveScroll&&classicScheduleOpen){const nextList=host.querySelector('.classicScheduleList');if(nextList)nextList.scrollTop=scrollTop;}
  if(preserveScroll&&classicParticipantsOpen){const body=host.querySelector('.classicParticipantsBody');if(body)body.scrollTop=participantScroll;}
}

function classicRCCockpitView(){
  rxnEnsureSystemClockTicker();classicRCEnsureScheduleTicker();ClassicRCRuntime.ensureAutoTicker?.();const c=ClassicRCEngine.get();
  if(!c||c.status==='setup')return `<section class="page"><div class="card"><h2>EFRA RC ещё не подготовлен</h2><button class="btn primary" data-classic-action="setup">К НАСТРОЙКЕ</button></div></section>`;
  const ev=ClassicRCRuntime.event(),cls=rxnColumnClass(),count=rxnMetricCount();
  if(!ev&&['finished','aborted'].includes(c.status)){
    const aborted=c.status==='aborted',body=aborted?`<div class="classicAbortedBanner"><b>СОРЕВНОВАНИЕ ЗАВЕРШЕНО ДОСРОЧНО</b><span>${esc(c.abortReason||'Решение директора')} · результаты сохранены · в чемпионат не засчитывается</span></div>${classicRCResultsContent(Boolean(c.finalProtocol?.length),false)}`:classicRCFinalProtocolMarkup();
    return `<section class="rxnCockpit classicRCCockpit classicResultsCockpit ${cls}" style="--rxn-metric-count:${count}">${classicRCHeader()}${classicRCTitle()}<main class="classicResultsMain"><section class="classicResultsRoster"><div class="classicFinishedActions"><button class="btn primary" data-classic-action="results">ВСЕ РЕЗУЛЬТАТЫ</button><button class="btn secondary" data-classic-action="schedule">РАСПИСАНИЕ</button><button class="btn secondary" data-classic-action="race-settings">НАСТРОЙКИ</button><button class="btn secondary" data-classic-action="home">ГЛАВНАЯ</button><button class="btn danger" data-classic-action="archive">В АРХИВ</button></div><div class="classicFinalProtocol">${body}</div></section></main></section>`;
  }
  ClassicRCRuntime.ensureSession();
  return `<section class="rxnCockpit classicRCCockpit ${cls}" style="--rxn-metric-count:${count}">${classicRCHeader()}${classicRCTitle()}<main class="rxnMain"><section class="rxnRoster"><div id="classicPilotBoard" class="rxnTable">${classicRCPilotTable()}</div></section><aside class="rxnSide">${classicRCScheduleStatusStrip(true)}${classicRCTimerPanel()}${classicRCMobileInfo()}${classicRCControls()}</aside></main>${classicRCFinalGridPanel()}${classicRCStaggerPanel()}${classicRCStopOverlay()}</section>`;
}


function classicRCHeatSettingsModal(){
  const ev=ClassicRCRuntime.event(),c=ClassicRCEngine.get();if(!ev||!c)return;const locked=['countdown'].includes(ClassicRCRuntime.session()?.phase);
  $('#modalHost').innerHTML=`<div class="modalBackdrop"><section class="modal classicHeatSettingsModal"><div class="modalHead"><div><div class="sectionLabel">EFRA RC · ТЕКУЩИЙ ЗАЕЗД</div><h2>${esc(ev.label)}</h2></div><button class="iconBtn" data-classic-modal-close>×</button></div><div class="classicHeatSettingsFields"><label><span>ВРЕМЯ ЗАЕЗДА · МИН</span><input id="classicHeatDuration" type="number" min="1" max="120" step="1" value="${Number(ev.durationMin)||ClassicRCEngine.category().raceMinutes}" ${locked?'disabled':''}></label><label><span>MIN LAP · СЕК</span><input id="classicHeatMinLap" type="number" min="1" max="60" step="0.1" value="${Number(c.settings.minLapSec)||2}" ${locked?'disabled':''}></label></div><div class="rxnResultActions"><button class="btn secondary" data-classic-modal-close>ОТМЕНА</button><button class="btn primary" data-classic-action="heat-settings-apply" ${locked?'disabled':''}>ПРИМЕНИТЬ</button></div></section></div>`;bindClassicRC();
}
function classicRCApplyHeatSettings(){const durationMin=Number($('#classicHeatDuration')?.value),minLapSec=Number($('#classicHeatMinLap')?.value),res=ClassicRCEngine.updateCurrentHeatSettings({durationMin,minLapSec});if(!res.ok)return toast(res.error||'Не удалось сохранить');closeModal();toast('Настройка текущего заезда применена');render();}

function classicRCSettingToggle(label,id,checked,help=''){return `<label class="classicRaceSettingToggle"><span><b>${esc(label)}</b>${help?`<small>${esc(help)}</small>`:''}</span><input id="${id}" type="checkbox" ${checked?'checked':''}></label>`;}
function classicRCRaceSettingsModal(){
  const c=ClassicRCEngine.get(),ev=ClassicRCRuntime.event(),session=ClassicRCRuntime.session();if(!c)return;const auto=ClassicRCRuntime.autoState?.()||{};
  const phase=session?.phase||'ready',durationLocked=['countdown','running','finishing'].includes(phase),duration=Number(ev?.durationMin)||ClassicRCEngine.category().raceMinutes;
  $('#modalHost').innerHTML=`<div class="modalBackdrop"><section class="modal classicRaceSettingsModal"><div class="modalHead"><div><div class="sectionLabel">EFRA RC · НАСТРОЙКИ ГОНКИ</div><h2>${ev?esc(ev.label):'EFRA RC'}</h2><p>Спортивные правила EFRA не меняются. Здесь настраиваются текущий заезд и звуковое сопровождение EFRA RC.</p></div><button class="iconBtn" data-classic-modal-close>×</button></div>
  <div class="classicRaceSettingsGrid">
    <section class="classicRaceSettingsGroup"><h3>ЗАЕЗД</h3><label class="classicRaceField"><span>ПРОДОЛЖИТЕЛЬНОСТЬ · МИН</span><input id="classicRaceDuration" type="number" min="1" max="120" step="1" value="${duration}" ${!ev||durationLocked?'disabled':''}></label><label class="classicRaceField"><span>MIN LAP · СЕК</span><input id="classicRaceMinLap" type="number" min="1" max="60" step="0.1" value="${Number(c.settings.minLapSec)||2}" ${!ev||durationLocked?'disabled':''}></label><label class="classicRaceField"><span>СТАРТ ПО ОДНОМУ · ИНТЕРВАЛ, СЕК</span><input id="classicStaggerInterval" type="number" min="0.5" max="5" step="0.1" value="${((Number(c.settings.staggerIntervalMs)||1000)/1000).toFixed(1)}"></label><div class="classicRaceSettingsHint">${durationLocked?'Время заезда заблокировано во время активного старта. Поставьте заезд на паузу или измените настройку до старта.':'Изменение времени пересчитает слот текущего заезда в расписании.'}</div></section>
    <section class="classicRaceSettingsGroup"><h3>ДИКТОР И ЗВУК</h3>${classicRCSettingToggle('Диктор','classicAnnouncerToggle',state.settings.announcerEnabled,'Голосовые сообщения EFRA RC')}${classicRCSettingToggle('Блип при проходе','classicLapSoundToggle',state.settings.lapSound,'Короткий сигнал каждого принятого прохода')}${classicRCSettingToggle('Голосовой старт','classicVoiceStartToggle',state.settings.voiceStartCall,'Предстартовый отсчёт и «Хорошей гонки»')}${classicRCSettingToggle('Новый лучший круг','classicVoiceBestToggle',state.settings.voiceBestLap)}${classicRCSettingToggle('Финиш пилота','classicVoiceFinishToggle',state.settings.voiceFinish)}${classicRCSettingToggle('Служебные сообщения','classicVoiceServiceToggle',state.settings.voiceService,'Одна минута, время истекло, завершение')}${classicRCSettingToggle('Результаты заезда','classicVoiceResultsToggle',state.settings.voiceResults)}${classicRCSettingToggle('Имена пилотов','classicPilotVoiceToggle',state.settings.pilotVoiceEnabled,'Локальные голосовые файлы из базы пилотов')}<div class="classicAudioState ${announcer.unlocked?'ready':''}"><b>${announcer.unlocked?'ЗВУК ГОТОВ':'ЗВУК НЕ АКТИВИРОВАН'}</b><span>${announcer.unlocked?'Аудиоканал браузера разблокирован.':'На iPhone/iPad звук нужно один раз включить жестом пользователя.'}</span></div><div class="classicRaceSettingsTests"><button class="btn secondary" data-classic-action="audio-enable">ВКЛЮЧИТЬ ЗВУК</button><button class="btn secondary" data-classic-action="audio-test-voice">ТЕСТ ДИКТОРА</button><button class="btn secondary" data-classic-action="audio-test-bleep">ТЕСТ БЛИП</button></div></section>
    <section class="classicRaceSettingsGroup classicAutoSettings"><h3>АВТОМАТИЗАЦИЯ ДНЯ</h3>${classicRCSettingToggle('Автосохранение результата','classicAutoSaveToggle',auto.autoSave!==false,'Если заезд прошёл штатно, результат сохраняется без ручного подтверждения. Для штрафов или исправлений переключитесь в ручной режим.')}<label class="classicRaceField"><span>ВРЕМЯ НА ПРОВЕРКУ РЕЗУЛЬТАТА · СЕК</span><input id="classicAutoReviewSec" type="number" min="0" max="60" step="1" value="${Math.round(Number(auto.reviewDelayMs||8000)/1000)}"></label><div class="classicRaceSettingsHint">Кнопка «Начать гоночный день» находится в расписании. Авто-режим сам ждёт время старта, запускает предстартовый отсчёт и после штатного финиша переходит к следующему событию. Любое ручное вмешательство ставит авто-режим на паузу.</div></section>
  </div><div class="rxnResultActions"><button class="btn secondary" data-classic-modal-close>ОТМЕНА</button><button class="btn primary" data-classic-action="race-settings-save">СОХРАНИТЬ</button></div></section></div>`;bindClassicRC();
}
function classicRCSaveRaceSettings(){
  const c=ClassicRCEngine.get(),ev=ClassicRCRuntime.event(),phase=ClassicRCRuntime.session()?.phase||'ready',durationLocked=['countdown','running','finishing'].includes(phase);
  if(c&&ev&&!durationLocked){const res=ClassicRCEngine.updateCurrentHeatSettings({durationMin:Number($('#classicRaceDuration')?.value),minLapSec:Number($('#classicRaceMinLap')?.value),staggerIntervalMs:Math.round((Number($('#classicStaggerInterval')?.value)||1)*1000)});if(!res?.ok)return toast(res?.error||'Не удалось изменить заезд');}
  if(c&&(!ev||durationLocked)){c.settings.staggerIntervalMs=Math.max(500,Math.min(5000,Math.round((Number($('#classicStaggerInterval')?.value)||1)*1000)));ClassicRCEngine.persist();}state.settings.announcerEnabled=Boolean($('#classicAnnouncerToggle')?.checked);state.settings.lapSound=Boolean($('#classicLapSoundToggle')?.checked);state.settings.voiceStartCall=Boolean($('#classicVoiceStartToggle')?.checked);state.settings.voiceBestLap=Boolean($('#classicVoiceBestToggle')?.checked);state.settings.voiceFinish=Boolean($('#classicVoiceFinishToggle')?.checked);state.settings.voiceService=Boolean($('#classicVoiceServiceToggle')?.checked);state.settings.voiceResults=Boolean($('#classicVoiceResultsToggle')?.checked);state.settings.pilotVoiceEnabled=Boolean($('#classicPilotVoiceToggle')?.checked);const auto=CompetitionAutoPilot.ensure(c);auto.autoSave=Boolean($('#classicAutoSaveToggle')?.checked);auto.reviewDelayMs=Math.max(0,Math.min(60000,(Number($('#classicAutoReviewSec')?.value)||0)*1000));ClassicRCEngine.persist();save(KEYS.settings,state.settings);applySettings();closeModal();toast('Настройки EFRA RC сохранены');render();
}

function classicRCResultModal(){const ev=ClassicRCRuntime.event(),s=ClassicRCRuntime.session();if(!ev||s?.phase!=='finished')return toast('Сначала завершите заезд');const suggested=ClassicRCRuntime.suggestedResult(),isPractice=['seeding','controlled','finalPractice'].includes(ev.stage),rows=suggested.map((r,i)=>{const p=ClassicRCEngine.pilot(r.pilotId);return `<div class="classicResultRow" data-classic-result-row="${esc(r.pilotId)}"><strong>${i+1}</strong><span class="classicPilotId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||i+1)}</span><div><b>${esc(rxnPilotDisplayName(p))}</b><small>${r.laps||0} кр. · ${rxnFormatDuration(r.timeMs||0)}</small></div><select data-classic-status ${isPractice?'disabled':''}>${ClassicRCEFRARules.statuses.map(st=>`<option value="${st}" ${st===r.status?'selected':''}>${st}</option>`).join('')}</select>${ev.stage==='final'?`<select data-classic-penalty><option value="">БЕЗ ШТРАФА</option><option value="10s">+10 SEC</option><option value="1lap">−1 LAP</option></select>`:`<input data-classic-place type="number" min="1" max="${suggested.length}" value="${r.place??i+1}" disabled>`}</div>`;}).join('');$('#modalHost').innerHTML=`<div class="modalBackdrop"><div class="modal classicResultModal"><div class="modalHead"><div><div class="sectionLabel">${esc(ClassicRCEngine.stageLabel(ev.stage))} · EFRA</div><h2>${esc(ev.label)}</h2><p>${ev.stage==='qualifying'?'Позиция в квалификации рассчитывается по кругам и итоговому времени среди всех групп раунда.':ev.stage==='final'?'Очки финала: 1 место = 1 очко, 2 место = 2 и далее. В зачёт идут 2 лучших заезда из 3. Штраф за фальстарт назначает директор.':'Практика сохраняет круги для расстановки и статистики.'}</p></div><button class="iconBtn" data-classic-modal-close>×</button></div><div class="classicResultList">${rows}</div><div class="rxnResultActions"><button class="btn secondary" data-classic-modal-close>НАЗАД</button><button class="btn primary" data-classic-action="save-result">СОХРАНИТЬ И ДАЛЬШЕ</button></div></div></div>`;bindClassicRC();}
function classicRCSaveResult(){const ev=ClassicRCRuntime.event(),suggested=ClassicRCRuntime.suggestedResult();if(!ev)return;const isPractice=['seeding','controlled','finalPractice'].includes(ev.stage);const result=suggested.map((r,i)=>{const row=document.querySelector(`[data-classic-result-row="${CSS.escape(String(r.pilotId))}"]`),status=isPractice?r.status:(row?.querySelector('[data-classic-status]')?.value||r.status),place=r.place??i+1,penalty=ev.stage==='final'?(row?.querySelector('[data-classic-penalty]')?.value||''):'';let laps=Number(r.laps)||0,timeMs=Number(r.timeMs)||0;if(penalty==='10s')timeMs+=10000;if(penalty==='1lap')laps=Math.max(0,laps-1);return{...r,status,place:status==='DNS'||status==='DSQ'?null:place,laps,timeMs,penalty};});try{ClassicRCRuntime.saveResult(result);closeModal();toast('Результат сохранён');}catch(e){toast(e.message);}}


function classicRCTieNote(row,allRows){
  if(!row||!Array.isArray(allRows))return'';const tied=allRows.some(x=>x!==row&&Number(x.total)===Number(row.total));if(!tied||!row.counting?.length)return'';
  return [...row.counting].sort((a,b)=>Number(a.points)-Number(b.points)).map(x=>`${x.laps||0} кр / ${rxnFormatDuration(x.timeMs||0)}`).join(' · ');
}
function classicRCStageRu(stage){return({seeding:'РАССТАНОВКА · SEEDING',controlled:'КОНТРОЛЬНАЯ ПРАКТИКА',qualifying:'КВАЛИФИКАЦИЯ',finalPractice:'ПРАКТИКА ПЕРЕД ФИНАЛОМ',final:'ФИНАЛ'})[stage]||String(stage||'').toUpperCase();}
function classicRCSeedBestMain(best){return best?rxnFormatDuration(best.avgMs):'—';}
function classicRCFindConsecutiveWindow(lapTimes,n){const a=(lapTimes||[]).map(Number);if(a.length<n)return null;let best=null;for(let i=0;i<=a.length-n;i++){const slice=a.slice(i,i+n);if(slice.some(x=>!Number.isFinite(x)||x<=0))continue;const total=slice.reduce((sum,x)=>sum+x,0);if(!best||total<best.totalMs)best={startIndex:i+1,endIndex:i+n,totalMs:total,avgMs:total/n,laps:slice};}return best;}
function classicRCSeedWindow(c,pilotId){const n=Number(c?.settings?.seedingConsecutiveLaps)||3;let best=null;for(const ev of (c?.events||[]).filter(e=>e.stage==='seeding'&&e.saved)){const hit=classicRCFindConsecutiveWindow(ev.lapStats?.[pilotId]?.lapTimes,n);if(hit&&(!best||hit.totalMs<best.totalMs))best={...hit,eventKey:ev.key,eventLabel:ev.label};}return best;}
function classicRCResultsOverview(c){const seedDone=(c.events||[]).filter(e=>e.stage==='seeding'&&e.saved).length,seedTotal=(c.events||[]).filter(e=>e.stage==='seeding').length,qDone=(c.events||[]).filter(e=>e.stage==='qualifying'&&e.saved).length,qTotal=(c.events||[]).filter(e=>e.stage==='qualifying').length,finalDone=(c.events||[]).filter(e=>e.stage==='final'&&e.saved).length,finalTotal=(c.events||[]).filter(e=>e.stage==='final').length,pilots=(c.pilotIds||[]).length;return `<section class="classicResultsSummaryGrid"><article><small>ПИЛОТЫ</small><b>${pilots}</b><span>${esc(ClassicRCEngine.category().label)}</span></article><article><small>РАССТАНОВКА</small><b>${seedDone}/${seedTotal}</b><span>ЛУЧШИЕ ${c.settings.seedingConsecutiveLaps} КРУГА ПОДРЯД</span></article><article><small>КВАЛИФИКАЦИЯ</small><b>${qDone}/${qTotal}</b><span>В ЗАЧЁТ ИДУТ ${classicRCQualifyingRoundsToCount(Number(c.settings.qualifyingRounds||5))}</span></article><article><small>ФИНАЛЫ</small><b>${finalDone}/${finalTotal}</b><span>3 ЗАЕЗДА · В ЗАЧЁТ 2</span></article></section>`;}
function classicRCSeedingSection(c,seed){
  const rows=seed.map(r=>{const pilot=ClassicRCEngine.pilot(r.pilotId),window=classicRCSeedWindow(c,r.pilotId),range=window?`${window.startIndex}–${window.endIndex}`:'—';return `<tr><td class="classicProtocolPos">${r.rank}</td><td class="classicProtocolPilot"><b>${esc(rxnPilotDisplayName(pilot))}</b></td><td class="classicProtocolGood"><b>${classicRCSeedBestMain(r.best)}</b></td><td>${esc(range)}</td><td>${esc(window?.eventLabel||'—')}</td></tr>`;}).join('');
  return `<section class="classicResultsSection"><div class="classicProtocolTitle"><h3>РАССТАНОВКА · SEEDING</h3><span>ЛУЧШАЯ СВЯЗКА ИЗ ${c.settings.seedingConsecutiveLaps} КРУГОВ ПОДРЯД</span></div><div class="classicProtocolScroll"><table class="table classicProtocolTable classicProtocolStandings"><thead><tr><th>МЕСТО</th><th>ПИЛОТ</th><th>СРЕДНЕЕ СВЯЗКИ</th><th>КРУГИ</th><th>ЗАЕЗД</th></tr></thead><tbody>${rows||'<tr><td colspan="5">НЕТ ДАННЫХ</td></tr>'}</tbody></table></div></section>`;
}
function classicRCQualifyingFormula(r){const counted=[...(r.counting||[])].sort((a,b)=>Number(a.round)-Number(b.round));return counted.length?counted.map(x=>`КВ${x.round}: ${x.points}`).join(' + '):'—';}
function classicRCQualifyingSection(c,q,rounds){
  const rows=q.map(r=>{const pilot=ClassicRCEngine.pilot(r.pilotId),formula=classicRCQualifyingFormula(r);return `<tr><td class="classicProtocolPos">${r.rank}</td><td class="classicProtocolPilot"><b>${esc(rxnPilotDisplayName(pilot))}</b></td>${Array.from({length:rounds},(_,i)=>{const rr=r.rounds.find(x=>x.round===i+1),counted=r.counting.some(x=>x.round===i+1);return `<td class="${counted?'classicProtocolGood':''}">${rr?rr.points:'—'}</td>`;}).join('')}<td class="classicProtocolGood"><b>${r.valid?r.total:'—'}</b></td><td class="classicProtocolFormula">${esc(formula)}</td></tr>`;}).join('');
  return `<section class="classicResultsSection"><div class="classicProtocolTitle"><h3>КВАЛИФИКАЦИЯ</h3><span>ПО РАУНДАМ · В ЗАЧЁТ ${classicRCQualifyingRoundsToCount(Number(c.settings.qualifyingRounds||5))} ЛУЧШИХ РАУНДА</span></div><div class="classicProtocolScroll"><table class="table classicProtocolTable classicProtocolStandings classicQualifyingStandings"><thead><tr><th>МЕСТО</th><th>ПИЛОТ</th>${Array.from({length:rounds},(_,i)=>`<th>КВ${i+1}</th>`).join('')}<th>СУММА</th><th>В ЗАЧЁТЕ</th></tr></thead><tbody>${rows||'<tr><td colspan="9">НЕТ ДАННЫХ</td></tr>'}</tbody></table></div></section>`;
}
function classicRCFinalRunEvent(c,groupName,leg){return(c?.events||[]).find(e=>e.stage==='final'&&String(e.groupName)===String(groupName)&&Number(e.round)===Number(leg)&&e.saved)||null;}
function classicRCFinalFormula(row){const counted=new Set((row?.counting||[]).map(x=>Number(x.leg)));return[1,2,3].map(n=>{const x=(row?.all||[]).find(y=>Number(y.leg)===n);if(!x)return`<span>З${n}: —</span>`;return counted.has(n)?`<b>З${n}: ${x.points}</b>`:`<span>[З${n}: ${x.points}]</span>`;}).join(' ');}
function classicRCFinalDetailRows(c,groupName,row){const counted=new Set((row?.counting||[]).map(x=>Number(x.leg)));return[1,2,3].map(n=>{const x=(row?.all||[]).find(y=>Number(y.leg)===n),ev=classicRCFinalRunEvent(c,groupName,n),st=ev?.lapStats?.[row.pilotId]||{},avg=classicRCLapAverageMs(st),best=Number(st.bestLapMs);return `<tr class="${counted.has(n)?'classicFinalCounted':''}"><td>ЗАЕЗД ${n}</td><td>${counted.has(n)?'<b class="classicProtocolGoodText">В ЗАЧЁТЕ</b>':'НЕ В ЗАЧЁТЕ'}</td><td>${Number(x?.laps)||0}</td><td>${Number(x?.timeMs)>0?rxnFormatDuration(x.timeMs):'—'}</td><td>${Number.isFinite(best)&&best>0?rxnFormatDuration(best):'—'}</td><td>${Number.isFinite(avg)?rxnFormatDuration(avg):'—'}</td><td><b>${x?.points??'—'}</b></td></tr>`;}).join('');}
function classicRCFinalRatingRows(c,rows,{showGroup=true}={}){return(rows||[]).map(r=>{const group=String(r.groupName||'A'),pilot=ClassicRCEngine.pilot(r.pilotId),formula=classicRCFinalFormula(r);return `<details class="classicFinalRankRow ${showGroup?'withGroup':''}"><summary><strong class="classicFinalRankPos">${r.overallRank??r.rank}</strong><b class="classicFinalRankPilot">${esc(rxnPilotDisplayName(pilot))}</b>${showGroup?`<span class="classicFinalRankGroup">${esc(group)}</span>`:''}<em class="classicFinalRankTotal">${r.counting?.length>=2?r.total:'—'}</em><span class="classicFinalRankFormula">${formula}</span><i>⌄</i></summary><div class="classicFinalRankDetail"><table class="table classicFinalRunsTable"><thead><tr><th>ЗАЕЗД</th><th>СТАТУС</th><th>КРУГИ</th><th>ВРЕМЯ</th><th>ЛУЧШАЯ</th><th>СРЕДНЯЯ</th><th>ОЧКИ</th></tr></thead><tbody>${classicRCFinalDetailRows(c,group,r)}</tbody></table></div></details>`;}).join('');}
function classicRCFinalsSection(c,finals){return[...(finals||[])].sort((a,b)=>a.groupName.localeCompare(b.groupName)).map(g=>`<section class="classicResultsSection"><div class="classicProtocolTitle"><h3>ФИНАЛ ${esc(g.groupName)}</h3><span>3 ЗАЕЗДА · В ЗАЧЁТ 2 ЛУЧШИХ</span></div><div class="classicFinalRuleNote">Место в каждом финальном заезде равно количеству очков: 1-е = 1, 2-е = 2, 3-е = 3. Из трёх заездов складываются два лучших результата. Чем меньше сумма — тем выше итоговое место.</div><div class="classicFinalRankHeader"><span>МЕСТО</span><span>ПИЛОТ</span><span>СУММА</span><span>КАК ПОСЧИТАНО</span></div><div class="classicFinalRankList">${classicRCFinalRatingRows(c,g.standings.map(r=>({...r,groupName:g.groupName})),{showGroup:false})||'<div class="classicProtocolEmpty">НЕТ ДАННЫХ</div>'}</div></section>`).join('');}
function classicRCOverallProtocolSection(c){const rows=c?.finalProtocol||[];return `<section class="classicResultsSection classicOverallFinals"><div class="classicProtocolTitle"><h3>ИТОГОВЫЙ РЕЙТИНГ ФИНАЛОВ</h3><span>СУММИРУЮТСЯ 2 ЛУЧШИХ ЗАЕЗДА ИЗ 3</span></div><div class="classicFinalRuleNote">1-е место в заезде = 1 очко, 2-е = 2, 3-е = 3 и так далее. В итог идут два лучших заезда из трёх. Результат в квадратных скобках отброшен. Меньшая сумма лучше.</div><div class="classicFinalRankHeader withGroup"><span>МЕСТО</span><span>ПИЛОТ</span><span>ФИНАЛ</span><span>СУММА</span><span>КАК ПОСЧИТАНО</span></div><div class="classicFinalRankList">${classicRCFinalRatingRows(c,rows,{showGroup:true})||'<div class="classicProtocolEmpty">ИТОГОВЫЙ ПРОТОКОЛ ЕЩЁ НЕ СФОРМИРОВАН</div>'}</div></section>`;}
function classicRCLapAverageMs(st){const a=(st?.lapTimes||[]).map(Number).filter(x=>Number.isFinite(x)&&x>0);return a.length?a.reduce((sum,x)=>sum+x,0)/a.length:null;}
function classicRCEventCounted(c,ev,pilotId){
  if(ev.stage==='seeding'){const w=classicRCSeedWindow(c,pilotId);return{counted:Boolean(w&&w.eventKey===ev.key),label:`BEST ${Number(c.settings.seedingConsecutiveLaps)||3}`};}
  if(ev.stage==='qualifying'){const row=(c.qualifyingStandings||[]).find(x=>String(x.pilotId)===String(pilotId));return{counted:Boolean(row?.counting?.some(x=>Number(x.round)===Number(ev.round))),label:'ЗАЧЁТ'};}
  if(ev.stage==='final'){const group=(c.finalStandings||[]).find(x=>String(x.groupName)===String(ev.groupName)),row=group?.standings?.find(x=>String(x.pilotId)===String(pilotId));return{counted:Boolean(row?.counting?.some(x=>Number(x.leg)===Number(ev.round))),label:'ЗАЧЁТ'};}
  return{counted:false,label:'—'};
}
function classicRCEventPoints(c,ev,pilotId){if(ev.stage==='qualifying')return(c.qualifyingScores?.[Number(ev.round)-1]||[]).find(x=>String(x.pilotId)===String(pilotId))?.points??'—';if(ev.stage==='final')return(ev.scored||[]).find(x=>String(x.pilotId)===String(pilotId))?.points??'—';return'—';}
function classicRCLapMatrix(c,ev,ordered){
  const maxLaps=Math.max(0,...ordered.map(id=>(ev.lapStats?.[id]?.lapTimes||[]).length));
  if(!maxLaps)return'<div class="classicProtocolEmpty">НЕТ ЗАПИСАННЫХ КРУГОВ</div>';
  const bestByPilot=new Map(ordered.map(id=>[String(id),Number(ev.lapStats?.[id]?.bestLapMs)]));
  const seedByPilot=new Map(ordered.map(id=>[String(id),ev.stage==='seeding'?classicRCSeedWindow(c,id):null]));
  const head=ordered.map(id=>`<th>${esc(rxnPilotDisplayName(ClassicRCEngine.pilot(id)))}</th>`).join('');
  const rows=Array.from({length:maxLaps},(_,idx)=>{const lap=idx+1,cells=ordered.map(id=>{const times=ev.lapStats?.[id]?.lapTimes||[],ms=Number(times[idx]);if(!Number.isFinite(ms)||ms<=0)return'<td>—</td>';const best=bestByPilot.get(String(id)),seed=seedByPilot.get(String(id)),isBest=Number.isFinite(best)&&Math.abs(ms-best)<.5,isSeed=seed&&seed.eventKey===ev.key&&lap>=seed.startIndex&&lap<=seed.endIndex;return `<td class="${isSeed?'classicProtocolSeedLap ':''}${isBest?'classicProtocolBestLap':''}">${rxnFormatDuration(ms)}</td>`;}).join('');return `<tr><th>${lap}</th>${cells}</tr>`;}).join('');
  return `<div class="classicLapMatrixWrap"><table class="classicLapMatrix"><thead><tr><th>КРУГ</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
function classicRCHeatProtocolsSection(c){
  const completed=(c?.events||[]).filter(e=>e.saved&&!e.cancelled);if(!completed.length)return'';
  const blocks=completed.map(ev=>{
    const resultById=new Map((ev.result||[]).map((r,i)=>[String(r.pilotId),{...r,_index:i}]));
    const ordered=[...(ev.pilots||[])].sort((a,b)=>{const A=resultById.get(String(a))||{},B=resultById.get(String(b))||{},ap=Number(A.place??Infinity),bp=Number(B.place??Infinity);return ap-bp;});
    const eventBest=Math.min(...ordered.map(id=>Number(ev.lapStats?.[id]?.bestLapMs)).filter(x=>Number.isFinite(x)&&x>0),Infinity);
    const hasPoints=['qualifying','final'].includes(ev.stage),hasSeed=ev.stage==='seeding';
    const rows=ordered.map(id=>{const pilot=ClassicRCEngine.pilot(id),r=resultById.get(String(id))||{},st=ev.lapStats?.[id]||{},status=String(r.status||'FIN'),place=status==='FIN'?(r.place??(Number.isFinite(r._index)?r._index+1:'—')):status,best=Number(st.bestLapMs),isEventBest=Number.isFinite(best)&&best===eventBest,points=classicRCEventPoints(c,ev,id),seed=hasSeed?classicRCSeedWindow(c,id):null,note=seed&&seed.eventKey===ev.key?`ЛУЧШИЕ ${Number(c.settings.seedingConsecutiveLaps)||3}: ${rxnFormatDuration(seed.avgMs)} · КРУГИ ${seed.startIndex}–${seed.endIndex}`:'';return `<tr><td class="classicProtocolPos">${esc(place)}</td><td class="classicProtocolPilot"><b>${esc(rxnPilotDisplayName(pilot))}</b></td><td>${Number(r.laps??st.laps)||0}</td><td>${Number(r.timeMs)>0?rxnFormatDuration(r.timeMs):'—'}</td><td class="${isEventBest?'classicProtocolGood':''}">${Number.isFinite(best)&&best>0?rxnFormatDuration(best):'—'}</td>${hasPoints?`<td>${points}</td>`:''}<td>${esc(note||'—')}</td></tr>`;}).join('');
    const stageLabel=classicRCStageRu(ev.stage),summaryCols=hasPoints?7:6;
    return `<details class="classicHeatProtocol"><summary><span>${esc(stageLabel)}</span><b>${esc(ev.label)}</b><em>${(ev.pilots||[]).length} ПИЛОТОВ</em></summary><div class="classicHeatProtocolBody"><div class="classicProtocolSubhead"><h4>РЕЗУЛЬТАТ ЗАЕЗДА</h4><span>${esc(ev.label)}</span></div><div class="classicProtocolScroll"><table class="table classicProtocolTable classicHeatOverview"><thead><tr><th>МЕСТО</th><th>ПИЛОТ</th><th>КРУГИ</th><th>ИТОГО</th><th>ЛУЧШАЯ</th>${hasPoints?'<th>ОЧКИ</th>':''}<th>ЗАМЕТКА</th></tr></thead><tbody>${rows||`<tr><td colspan="${summaryCols}">НЕТ РЕЗУЛЬТАТА</td></tr>`}</tbody></table></div><div class="classicProtocolSubhead classicLapSubhead"><h4>СПИСОК КРУГОВ</h4><span>Время кругов по каждому пилоту</span></div>${classicRCLapMatrix(c,ev,ordered)}</div></details>`;
  }).join('');
  return `<section class="classicResultsSection classicHeatProtocols"><div class="classicProtocolTitle"><h3>ПРОТОКОЛЫ ЗАЕЗДОВ</h3><span>РЕЗУЛЬТАТ + ПОКРУГОВАЯ ТАБЛИЦА</span></div>${blocks}</section>`;
}
function classicRCResultsContent(includeOverall=false,includeHeats=false){const c=ClassicRCEngine.get();if(!c)return'';const q=c.qualifyingStandings||[],rounds=Number(c.settings.qualifyingRounds||5),seed=c.seedStandings||[],finals=c.finalStandings||[];return `${classicRCResultsOverview(c)}${classicRCSeedingSection(c,seed)}${classicRCQualifyingSection(c,q,rounds)}${includeOverall?classicRCOverallProtocolSection(c):classicRCFinalsSection(c,finals)}${includeHeats?classicRCHeatProtocolsSection(c):''}`;}
function classicRCResultsModal(){const c=ClassicRCEngine.get();if(!c)return;$('#modalHost').innerHTML=`<div class="modalBackdrop"><div class="modal classicTablesModal"><div class="modalHead"><div><div class="sectionLabel">EFRA RC · ${esc(c.ruleset)}</div><h2>${esc(c.name)}</h2></div><button class="iconBtn" data-classic-modal-close>×</button></div>${classicRCResultsContent(true,true)}</div></div>`;bindClassicRC();}
function classicRCFinalProtocolMarkup(){const c=ClassicRCEngine.get();if(!c)return'<div class="rxnEmpty">Итоговый протокол ещё не сформирован.</div>';return `<div class="classicResultsBoard">${classicRCResultsOverview(c)}${classicRCOverallProtocolSection(c)}</div>`;}

function classicRCUpdateScheduleClock(){
  if(state.view!=='classicCockpit')return;const snap=classicRCScheduleSnapshot();
  const auto=ClassicRCRuntime.autoState?.(),autoPrefix=auto?.enabled?(auto.paused?'АВТО ПАУЗА · ':'АВТО · '):'';
  document.querySelectorAll('[data-classic-schedule-countdown]').forEach(x=>x.textContent=snap.countdown);
  document.querySelectorAll('[data-classic-schedule-label]').forEach(x=>x.textContent=autoPrefix+snap.state);
  document.querySelectorAll('[data-classic-schedule-sub]').forEach(x=>x.textContent=snap.nextText);
  document.querySelectorAll('.classicScheduleClock small').forEach(x=>x.textContent=snap.countdownLabel);
  const sig=`${snap.current?.id||''}:${snap.current?.status||''}:${snap.current?.kind||''}:${snap.hold}:${Boolean(auto?.enabled)}:${Boolean(auto?.paused)}:${ClassicRCRuntime.testScale()}`;if(classicScheduleOpen&&classicScheduleSig&&sig!==classicScheduleSig){classicScheduleSig=sig;classicRCSyncScheduleHost();}else classicScheduleSig=sig;
}
function classicRCEnsureScheduleTicker(){if(classicScheduleTicker)return;classicScheduleTicker=setInterval(()=>{if(state.view==='classicCockpit'){classicRCUpdateScheduleClock();ClassicRCRuntime.checkLimit?.();}},250);}
function classicRCUpdateDynamic(){if(state.view!=='classicCockpit')return;rxnUpdateSystemClock();classicRCUpdateScheduleClock();const s=ClassicRCRuntime.session(),ev=ClassicRCRuntime.event();if(!s||!ev)return;const timer=document.querySelector('#classicMainTimer');if(timer)timer.textContent=ClassicRCRuntime.timerValue();const label=document.querySelector('#classicTimerLabel');if(label)label.textContent=s.phase==='countdown'?'ДО СТАРТА':s.phase==='finished'?'ФИНИШ':['seeding','controlled','finalPractice'].includes(ev.stage)?'ДО КОНЦА':'ДО ФИНИША';const sub=document.querySelector('#classicTimerSubline');if(sub)sub.textContent=`ЗАЕЗД ${ev.durationMin||ClassicRCEngine.category().raceMinutes} МИН${['qualifying','final'].includes(ev.stage)?' + LAST LAP':''}${ev.startMode==='staggered'?` · ПО ОДНОМУ · ${((Number(ClassicRCEngine.get()?.settings?.staggerIntervalMs)||1000)/1000).toFixed(1)} СЕК`:''}`;const ranked=ClassicRCRuntime.liveRanking(),leader=ranked[0],ring=document.querySelector('#classicRingMain');if(ring)ring.textContent=leader?String(s.live?.[leader.id]?.laps||0):'0';let best=null,bp=null;ranked.forEach(p=>{const v=Number(s.live?.[p.id]?.bestLapMs);if(Number.isFinite(v)&&v>0&&(best===null||v<best)){best=v;bp=p;}});document.querySelectorAll('[data-classic-best-name]').forEach(x=>x.textContent=bp?rxnPilotDisplayName(bp):'—');document.querySelectorAll('[data-classic-best-time]').forEach(x=>x.textContent=best?rxnFormatDuration(best):'—');const board=document.querySelector('#classicPilotBoard');if(board){const sig=ranked.map(p=>{const l=s.live[p.id]||ClassicRCRuntime.blank();return`${p.id}:${l.laps}:${Math.round(l.lastLapMs||0)}:${l.finished}:${l.status}`;}).join('|')+rxnLoadPrecision();if(sig!==cRCBoardSig){cRCBoardSig=sig;rxnAnimateBoard(board,classicRCPilotTable());}}const sp=document.querySelector('[data-classic-stagger-panel]');if(sp){sp.hidden=!s.staggerReleaseActive;const cp=ClassicRCEngine.pilot(s.staggerCurrentPilotId),np=ClassicRCEngine.pilot(s.staggerNextPilotId),cur=sp.querySelector('[data-classic-stagger-current]'),nxt=sp.querySelector('[data-classic-stagger-next]'),prog=sp.querySelector('[data-classic-stagger-progress]');if(cur)cur.textContent=s.staggerCurrentPilotId?rxnPilotDisplayName(cp):'—';if(nxt)nxt.textContent=s.staggerNextPilotId?rxnPilotDisplayName(np):'—';if(prog)prog.textContent=`${Math.min(Number(s.staggerReleaseIndex)||0,(s.staggerOrder||[]).length)}/${(s.staggerOrder||[]).length}`;}}
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
    ClassicRCEngine.updateSetup({name:$('#classicName')?.value||'EFRA RC',date:$('#classicDate')?.value,location:$('#classicLocation')?.value||'',category:$('#classicCategory')?.value,pilotIds:ids,settings:{startTime:$('#classicStartTime')?.value||'09:00',seedingRounds:Number($('#classicSeedRounds')?.value)||2,seedingConsecutiveLaps:Number($('#classicSeedLaps')?.value)||3,controlledPracticeRounds:Number($('#classicPracticeRounds')?.value)||2,qualifyingRounds:Number($('#classicQRounds')?.value)||5,minLapSec:Number($('#classicMinLap')?.value)||2,roundBreakMin:Number($('#classicRoundBreak')?.value)||0,finalBreakMin:Number($('#classicFinalBreak')?.value)||0,finalPractice:Boolean($('#classicFinalPractice')?.checked),lowestFinalPolicy:$('#classicLowestFinal')?.value==='rebalance'?'rebalance':'keep'}});
    try{ClassicRCEngine.prepare();return nav('classicCockpit');}catch(e){return toast(e.message);}
  }
  if(a==='delete'){if(confirm('Удалить текущее EFRA RC соревнование?')){ClassicRCRuntime.dispose();ClassicRCEngine.reset();nav('home');}return;}
  if(a==='start')return ClassicRCRuntime.beginStart();
  if(a==='pause')return ClassicRCRuntime.pause();
  if(a==='finish')return ClassicRCRuntime.finish();
  if(a==='stop')return ClassicRCRuntime.stop();
  if(a==='restart'){if(!confirm('РЕСТАРТ ЭТОГО ЗАЕЗДА?\n\nТекущие круги будут удалены. Результат не будет сохранён. Этот же heat будет проведён заново.'))return;const r=await ClassicRCRuntime.restart();if(!r?.ok)return toast(r?.error||'Не удалось перезапустить заезд');classicScheduleOpen=true;return render();}
  if(a==='confirm-result')return classicRCResultModal();
  if(a==='save-result')return classicRCSaveResult();
  if(a==='results')return classicRCResultsModal();
  if(a==='race-settings')return classicRCRaceSettingsModal();
  if(a==='race-settings-save')return classicRCSaveRaceSettings();
  if(a==='audio-enable'){const ok=await ensureRaceAudioFromGesture();if(!ok)return;return classicRCRaceSettingsModal();}
  if(a==='audio-test-voice'){if(!announcer.unlocked){const ok=await ensureRaceAudioFromGesture();if(!ok)return;}announcer.play('goodRace',{wait:false,force:true});return;}
  if(a==='audio-test-bleep'){if(!announcer.unlocked){const ok=await ensureRaceAudioFromGesture();if(!ok)return;}announcer.playBleep({force:true});return;}
  if(a==='auto-start-day'){if(!announcer.unlocked){const ok=await ensureRaceAudioFromGesture();if(!ok)return toast('Авто-день не запущен: сначала разрешите звук');}const cfg=ClassicRCRuntime.autoState?.()||{},r=ClassicRCRuntime.startAutoDay({autoSave:cfg.autoSave!==false,reviewDelayMs:Number(cfg.reviewDelayMs)||8000});if(!r?.ok)return toast(r?.error||'Не удалось запустить авто-день');toast('Авто-день запущен');classicScheduleOpen=true;return render();}
  if(a==='auto-pause-day'){const r=ClassicRCRuntime.pauseAuto('РУЧНОЙ РЕЖИМ');if(!r?.ok)return toast('Авто-день уже остановлен');toast('Авто-день на паузе');classicScheduleOpen=true;return render();}
  if(a==='auto-resume-day'){const r=ClassicRCRuntime.resumeAuto();if(!r?.ok)return toast('Авто-день не запущен');toast('Авто-день продолжен');classicScheduleOpen=true;return render();}
  if(a==='auto-stop-day'){ClassicRCRuntime.stopAutoDay();toast('Авто-день выключен');classicScheduleOpen=true;return render();}
  if(a==='schedule'){classicParticipantsOpen=false;classicScheduleOpen=!classicScheduleOpen;classicRCSyncScheduleHost();return;}
  if(a==='schedule-close'){classicScheduleOpen=false;classicRCSyncScheduleHost();return;}
  if(a==='participants'){classicScheduleOpen=false;classicParticipantsOpen=!classicParticipantsOpen;classicRCSyncScheduleHost();return;}
  if(a==='participants-close'){classicParticipantsOpen=false;classicRCSyncScheduleHost();return;}
  if(a==='late-add'){const r=ClassicRCEngine.lateEntry(b.dataset.pilotId,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast(r?.error||'Не удалось добавить пилота');toast(`${rxnPilotDisplayName(ClassicRCEngine.pilot(b.dataset.pilotId))} добавлен со следующего доступного заезда`);classicParticipantsOpen=true;classicRCSyncScheduleHost(false);return;}
  if(a==='late-remove'){const p=ClassicRCEngine.pilot(b.dataset.pilotId);if(!confirm(`Убрать ${rxnPilotDisplayName(p)} из будущих заездов? Уже полученные результаты сохранятся.`))return;const r=ClassicRCEngine.withdrawPilot(b.dataset.pilotId,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast(r?.error||'Не удалось убрать пилота');toast('Пилот убран из будущих заездов');classicParticipantsOpen=true;classicRCSyncScheduleHost(false);return;}
  if(a==='late-new'){if(ClassicRCEngine.finalsLocked?.())return toast('После формирования финалов состав защищён');classicParticipantsOpen=true;return pilotModal(null,false,null,{onSave:profile=>{const r=ClassicRCEngine.lateEntry(profile.id,ClassicRCRuntime.nowEpoch());if(!r?.ok){toast(r?.error||'Пилот сохранён, но не добавлен в соревнование');classicRCSyncScheduleHost(false);return true;}toast(`${rxnPilotDisplayName(profile)} создан и добавлен со следующего доступного заезда`);classicParticipantsOpen=true;render();return true;}});}
  if(a==='sim-settings'){if(typeof raceSimulatorModal==='function')return raceSimulatorModal();return toast('Симулятор не загружен');}
  if(a==='sim-speed'){const speed=ClassicRCRuntime.cycleSimulationSpeed();toast(`SIM ×${speed}`);return render();}
  if(a==='start-early'){classicScheduleOpen=false;return ClassicRCRuntime.beginStart({directorOverride:true});}
  if(a==='director-finish'){classicScheduleOpen=false;return ClassicRCRuntime.finish('Досрочно завершено директором');}
  if(a==='heat-settings')return classicRCHeatSettingsModal();
  if(a==='heat-settings-apply')return classicRCApplyHeatSettings();
  if(a==='skip-heat'){
    if(!confirm('Пропустить текущий заезд? Для его пилотов будет записан DNS.'))return;
    if(ClassicRCRuntime.autoEnabled?.())ClassicRCRuntime.pauseAuto('РУЧНОЙ ПРОПУСК',{silent:true});
    const ss=ClassicRCRuntime.session();
    if(ss&&['countdown','running','finishing','paused'].includes(ss.phase))return toast('Сначала завершите активный заезд');
    const r=ClassicRCEngine.skipCurrentEvent(ClassicRCRuntime.nowEpoch());
    if(!r.ok)return toast(r.error||'Не удалось пропустить');
    classicScheduleOpen=true;return render();
  }
  if(['day-minus-five','day-minus-one','day-plus-one','day-plus-five'].includes(a)){
    const delta={ 'day-minus-five':-5,'day-minus-one':-1,'day-plus-one':1,'day-plus-five':5 }[a]||0,res=ClassicRCEngine.shiftScheduleStart(delta);
    if(!res?.ok)return toast(res?.error||'Не удалось сдвинуть старт дня');toast(`Старт дня · ${CompetitionScheduler.formatTime(res.startEpoch)}`);classicRCSyncScheduleHost();classicRCUpdateScheduleClock();return;
  }
  if(a==='skip-break'){const r=ClassicRCEngine.skipScheduleBreak(b.dataset.breakId,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast('Не удалось пропустить паузу');toast('Пауза пропущена');classicRCSyncScheduleHost();classicRCUpdateScheduleClock();return;}
  if(a==='break-minus'){const r=ClassicRCEngine.adjustScheduleBreak(b.dataset.breakId,-1,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast('Не удалось изменить паузу');toast(`Пауза · ${r.item.durationMin} мин`);classicRCSyncScheduleHost();classicRCUpdateScheduleClock();return;}
  if(a==='break-plus-one'){const r=ClassicRCEngine.adjustScheduleBreak(b.dataset.breakId,1,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast('Не удалось изменить паузу');toast(`Пауза · ${r.item.durationMin} мин`);classicRCSyncScheduleHost();classicRCUpdateScheduleClock();return;}
  if(a==='break-plus'){const r=ClassicRCEngine.adjustScheduleBreak(b.dataset.breakId,5,ClassicRCRuntime.nowEpoch());if(!r?.ok)return toast('Не удалось изменить паузу');toast(`Пауза · ${r.item.durationMin} мин`);classicRCSyncScheduleHost();classicRCUpdateScheduleClock();return;}
  if(a==='competition-stop'){
    if(!confirm('Остановить соревнование? Расписание и текущий заезд будут поставлены на паузу.'))return;
    const autoWasRunning=Boolean(ClassicRCRuntime.autoState?.()?.enabled&&!ClassicRCRuntime.autoState?.()?.paused);if(autoWasRunning)ClassicRCRuntime.pauseAuto('ОСТАНОВКА СОРЕВНОВАНИЯ',{silent:true,resumeAfterHold:true});
    const ss=ClassicRCRuntime.session();
    if(ss?.phase==='countdown')await ClassicRCRuntime.stop();
    else if(ss&&['running','finishing'].includes(ss.phase))await ClassicRCRuntime.pause({autoControl:true});
    ClassicRCEngine.pauseCompetition(ClassicRCRuntime.rawNowEpoch());classicScheduleOpen=false;classicParticipantsOpen=false;return render();
  }
  if(a==='competition-resume'){
    const autoResume=Boolean(ClassicRCRuntime.autoState?.()?.resumeAfterHold),r=ClassicRCEngine.resumeCompetition(ClassicRCRuntime.rawNowEpoch());
    if(!r?.ok)return toast('Соревнование уже продолжено');
    const ss=ClassicRCRuntime.session();
    if(ss?.phase==='paused')await ClassicRCRuntime.resume();
    if(autoResume)ClassicRCRuntime.resumeAuto({silent:true});
    toast(autoResume?'Соревнование и авто-день продолжены':'Соревнование продолжено');
    classicScheduleOpen=false;return render();
  }
  if(a==='competition-abort-confirm'){if(!confirm('ЗАВЕРШИТЬ СОРЕВНОВАНИЕ ДОСРОЧНО?\n\nПроведённые заезды и результаты сохранятся. Непроведённые заезды будут отменены. Соревнование не пойдёт в зачёт чемпионата.'))return;const r=await ClassicRCRuntime.abortCompetition('Досрочно завершено директором');if(!r?.ok)return toast(r?.error||'Не удалось завершить соревнование');classicScheduleOpen=false;classicParticipantsOpen=false;toast('Соревнование завершено досрочно. Результаты сохранены без зачёта чемпионата.');return render();}
  if(a==='archive'){if(confirm('Сохранить EFRA RC в архив и закрыть активный модуль?')){ClassicRCRuntime.dispose();ClassicRCEngine.archive();nav('home');}return;}
  if(a==='next'){const ev=ClassicRCRuntime.event();toast(ev?ev.label:'Соревнование завершено');return;}
}


function classicRCBindActionElement(b){
  if(!b||b.dataset.classicBound==='1')return;
  b.dataset.classicBound='1';
  b.addEventListener('click',e=>{
    if(b.disabled)return;
    e.preventDefault();e.stopPropagation();
    Promise.resolve(classicRCDispatchAction(b)).catch(err=>{console.error('EFRA RC action failed',err);toast(err?.message||'Ошибка EFRA RC');});
  });
  if(!/^(BUTTON|INPUT|SELECT|A)$/.test(b.tagName)){
    b.addEventListener('keydown',e=>{
      if(!(e.key==='Enter'||e.key===' '))return;
      e.preventDefault();e.stopPropagation();
      Promise.resolve(classicRCDispatchAction(b)).catch(err=>{console.error('EFRA RC key action failed',err);toast(err?.message||'Ошибка EFRA RC');});
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
