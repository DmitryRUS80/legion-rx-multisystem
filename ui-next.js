'use strict';
/* Legion RX 4.1.0 UI NEXT TEST 05
   Visual/UI adapter only. Race, BLE, audio, storage and sports logic remain in index.html. */

const RXN_COLUMN_KEY='legionrx_ui_next_columns_v3';
const RXN_PRECISION_KEY='legionrx_ui_next_precision_v1';
const RXN_PALETTE=['#299eef','#82c92d','#f3aa13','#764bc3','#ef6671','#a96c43','#32ad67','#d95aad','#2f77c9','#d4832f','#68a7b8','#9b78d1','#d8c23f','#ef7b55'];

function rxnLoadColumns(){
  try{return Object.assign({gap:true,check:true,best:true,avg:true,last:true,laps:true},JSON.parse(localStorage.getItem(RXN_COLUMN_KEY)||'{}'));}
  catch{return{gap:true,check:true,best:true,avg:true,last:true,laps:true};}
}
function rxnSaveColumns(v){try{localStorage.setItem(RXN_COLUMN_KEY,JSON.stringify(v));}catch{}}
function rxnColumnClass(){const c=rxnLoadColumns(),a=[];for(const k of ['gap','check','best','avg','last','laps'])if(!c[k])a.push(`rxnHide-${k}`);return a.join(' ');}
function rxnMetricCount(){const c=rxnLoadColumns();return Math.max(1,['gap','check','best','avg','last','laps'].filter(k=>c[k]).length);}
function rxnLoadPrecision(){
  try{const n=Number(localStorage.getItem(RXN_PRECISION_KEY));return [1,2,3].includes(n)?n:1;}catch{return 1;}
}
function rxnSavePrecision(n){try{localStorage.setItem(RXN_PRECISION_KEY,String(n));}catch{}}
function rxnFormatDuration(ms,digits=rxnLoadPrecision()){
  if(!Number.isFinite(ms)||ms<0)return '—';
  const total=Math.max(0,Number(ms));
  if(total<60000){
    return (total/1000).toFixed(digits);
  }
  const minutes=Math.floor(total/60000);
  const seconds=(total-minutes*60000)/1000;
  const secText=seconds.toFixed(digits).padStart(2+(digits?digits+1:0),'0');
  return `${minutes}:${secText}`;
}
function rxnFormatTimeHtml(ms,digits=rxnLoadPrecision()){
  return rxnSplitMillisText(rxnFormatDuration(ms,digits),digits);
}

function rxnPilotColor(p){
  const raw=String(p?.uiColor||profileForPilot(p)?.uiColor||'').trim();
  if(/^#[0-9a-f]{6}$/i.test(raw))return raw;
  const seed=String(p?.profileId||p?.id||p?.transponder||p?.name||'RX');let h=0;
  for(let i=0;i<seed.length;i++)h=((h<<5)-h)+seed.charCodeAt(i)|0;
  return RXN_PALETTE[Math.abs(h)%RXN_PALETTE.length];
}
function rxnFlagMarkup(p){
  const code=pilotCountryCode(p),pos=countryFlag(code);
  if(!pos)return '<span class="rxnFlag rxnFlagEmpty" aria-hidden="true"></span>';
  return `<span class="rxnFlag" style="--country-flag-position:${pos}" title="${esc(countryName(code))}" aria-label="${esc(countryName(code))}"></span>`;
}
function rxnSplitMillisText(value,digits=rxnLoadPrecision()){
  const s=String(value??'—');
  if(!s.includes('.')||digits!==3)return esc(s);
  const i=s.lastIndexOf('.');
  return `${esc(s.slice(0,i))}<span class="rxnDot">.</span><span class="rxnMillis">${esc(s.slice(i+1))}</span>`;
}
function rxnTimeHtml(ms){return rxnFormatTimeHtml(ms);}
function rxnPaceHtml(l){return `${l?.laps||0}/${rxnFormatTimeHtml(Number(l?.elapsedMs||0))}`;}
function rxnGapRaw(ranked,s,p,index){
  if(!s||index===0)return index===0?rxnFormatDuration(0):'—';
  const leader=s.live?.[ranked[0]?.id]||blankLive(),l=s.live?.[p.id]||blankLive();
  const diff=(leader.laps||0)-(l.laps||0);
  if(diff>0)return`+${diff}L`;
  if(Number.isFinite(l.elapsedMs)&&Number.isFinite(leader.elapsedMs)&&l.elapsedMs>0&&leader.elapsedMs>0){
    const d=Math.max(0,l.elapsedMs-leader.elapsedMs);return`+${rxnFormatDuration(d)}`;
  }
  return'—';
}
function rxnGapHtml(ranked,s,p,index){return rxnSplitMillisText(rxnGapRaw(ranked,s,p,index),rxnLoadPrecision());}
function rxnRowState(s,l,pid,index){
  const pre=['warmup','countdown'].includes(s?.phase);
  if(pre)return s?.warmupDetected?.[pid]?{text:'✓',cls:'ok'}:{text:'',cls:''};
  if(l?.finished)return{text:'FIN',cls:'done'};
  if(['running','finishing'].includes(s?.phase)&&!l?.startSeen)return{text:'',cls:''};
  if(l?.startSeen)return{text:'✓',cls:'ok'};
  return{text:'',cls:''};
}
function rxnProgress(l,s){
  if(!l||!l.startSeen||l.finished||!['running','finishing'].includes(s?.phase))return{pct:0,color:'#173247'};
  const now=performance.now(),elapsed=Number.isFinite(l.lastPassPerf)?Math.max(0,now-l.lastPassPerf):0;
  const summary=lapSummary(l),expected=Number.isFinite(summary.avg)?summary.avg:Number.isFinite(l.bestLapMs)?l.bestLapMs:Number.isFinite(l.lastLapMs)?l.lastLapMs:30000;
  const pct=Math.max(0,Math.min(100,elapsed/Math.max(5000,expected)*100));
  const base=Number.isFinite(l.bestLapMs)?l.bestLapMs:expected,ratio=elapsed/Math.max(5000,base);
  let color='#38e46d';if(ratio>1.12)color='#ed3d50';else if(ratio>1.02)color='#e4c136';
  return{pct,color};
}
function rxnPhoneMetric(ranked,s,p,index,l,st){
  if(['warmup','countdown'].includes(s?.phase))return st.text||'—';
  if(l.finished)return'FIN';
  if(!l.startSeen)return'—';
  if(l.laps===0)return'✓';
  const gap=index?`<small>${rxnGapHtml(ranked,s,p,index)}</small>`:'';
  return `<b>${rxnPaceHtml(l)}</b>${gap}`;
}
function rxnPilotHeader(){
  return `<div class="rxnPilotRow rxnPilotHead"><span></span><span></span><span>ПИЛОТ</span><span></span><span class="rxnGap">GAP</span><span class="rxnCheck"></span><span class="rxnBest">BEST</span><span class="rxnAvg">AVG</span><span class="rxnLast">LAST</span><span class="rxnLaps">LAPS</span><span class="rxnPhoneMetric">PACE</span></div>`;
}
function rxnPilotTable(pilots,s){
  const ev=currentEvent(state.race),rule=ev?eventRule(state.race,ev):null,target=rule?.limitType==='laps'?rule.targetLaps:null;
  const rows=pilots.map((p,i)=>{
    const l=s?.live?.[p.id]||blankLive(),st=rxnRowState(s,l,p.id,i),avg=r425LapAvg(l),progress=rxnProgress(l,s),hot=Number.isFinite(l.lastPassPerf)&&performance.now()-l.lastPassPerf<800;
    const laps=target?`${l.laps||0}/${target}`:`${l.laps||0}`;
    return `<div class="rxnPilotRow rxnPilotData ${i===0&&l.laps>0?'leader':''} ${l.finished?'finished':''} ${hot?'hot':''}" data-pilot-id="${esc(p.id)}" data-pilot-stats="${esc(p.id)}" data-stats-context="race">
      <div class="rxnPos">${i+1}</div>
      <div class="rxnId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||i+1)}</div>
      <div class="rxnNameCell"><div class="rxnName">${esc(p.name||'—')}</div><div class="rxnLapTrack"><i style="width:${progress.pct.toFixed(1)}%;background:${progress.color}"></i></div></div>
      <div class="rxnFlagCell">${rxnFlagMarkup(p)}</div>
      <div class="rxnGap">${rxnGapHtml(pilots,s,p,i)}</div>
      <div class="rxnCheck ${st.cls}">${st.text}</div>
      <div class="rxnBest">${rxnTimeHtml(l.bestLapMs)}</div>
      <div class="rxnAvg">${rxnTimeHtml(avg)}</div>
      <div class="rxnLast">${rxnTimeHtml(l.lastLapMs)}</div>
      <div class="rxnLaps">${laps}</div>
      <div class="rxnPhoneMetric">${rxnPhoneMetric(pilots,s,p,i,l,st)}</div>
    </div>`;
  }).join('');
  const leader=pilots[0],profile=leader?profileForPilot(leader):null,photo=profile?.photo||leader?.photo||'';
  const hero=leader&&photo&&((s?.live?.[leader.id]?.laps||0)>0)?`<div class="rxnLeaderHero"><img src="${photo}" alt="${esc(leader.name)}"><span><small>ЛИДЕР</small><b>${esc(leader.name)}</b></span></div>`:'';
  return rxnPilotHeader()+rows+hero;
}
function rxnFinalProtocolTable(race){
  if(!race.finalProtocol?.length)return'<div class="rxnEmpty">Финальный протокол ещё не сформирован.</div>';
  return `<div class="rxnFinalHead"><span>POS</span><span>ПИЛОТ</span><span>ОЧКИ</span><span>ИСТОЧНИК</span></div>`+race.finalProtocol.map(r=>{
    const p=getPilot(race,r.pilotId);return `<div class="rxnFinalRow"><b>${r.place}</b><span>${esc(p?.name||'—')}</span><strong>${r.eventPoints}</strong><small>${esc(r.source||r.status||'FIN')}</small></div>`;
  }).join('');
}
function rxnTopButton({cls='',attrs='',icon='flag',title='',sub=''}){
  return `<button class="rxnTopButton ${cls}" ${attrs}>${raceSvg(icon)}${title?`<span><b>${title}</b>${sub?`<small>${sub}</small>`:''}</span>`:''}</button>`;
}
function rxnHeader(race,ev,s){
  const phase=phaseLabel(s),phaseSmall=['warmup','countdown'].includes(s?.phase)?displayTimer(s,ev):phase;
  return `<header class="rxnTop">
    ${rxnTopButton({cls:'iconOnly',attrs:'data-quick-panel="lapwiz" title="Bluetooth / LapWiz"',icon:'bluetooth'})}
    ${rxnTopButton({cls:lapwiz.connected?'ok':'',attrs:'data-quick-panel="lapwiz"',icon:'wave',title:'LAPWIZ',sub:lapwiz.connected?'ПОДКЛЮЧЕН':'OFFLINE'})}
    ${rxnTopButton({cls:state.settings.announcerEnabled?'ok':'',attrs:'data-quick-panel="announcer"',icon:'mic',title:'ДИКТОР',sub:state.settings.announcerEnabled?'ВКЛ':'ВЫКЛ'})}
    ${rxnTopButton({cls:'blue',attrs:'data-quick-panel="status"',icon:'flag',title:'СТАТУС',sub:phaseSmall})}
    ${rxnTopButton({attrs:'data-race-skip-current="1"',icon:'next',title:'ПРОПУСТИТЬ',sub:'ЗАЕЗД'})}
    ${rxnTopButton({cls:'danger',attrs:'data-race-manage="open"',icon:'stop',title:'ЗАВЕРШИТЬ',sub:'СОБЫТИЕ'})}
    ${rxnTopButton({cls:'blue',attrs:'data-action="race-results"',icon:'chart',title:'РЕЗУЛЬТАТЫ'})}
    ${rxnTopButton({cls:'iconOnly',attrs:'data-action="open-settings" title="Настройки"',icon:'settings'})}
    ${rxnTopButton({cls:'iconOnly',attrs:'data-quick-panel="menu" title="Меню"',icon:'list'})}
  </header>`;
}
function rxnRaceTitle(race,ev,s){
  const label=eventShortLabel(ev)||'ЗАЕЗД';
  const grid=ev?.phase==='finals'?`<button class="rxnGridButton" type="button" data-rxn-grid-open="${esc(ev.key)}">СТАРТОВАЯ РЕШЁТКА</button>`:'';
  return `<section class="rxnRaceTitle"><div><small>LEGION RX · RALLYCROSS</small><h1>${esc(label)}</h1></div><div class="rxnRaceMeta">${grid}<span>${esc(race.className||'Rally-10')}</span><b id="rxnPhaseTitle">${esc(phaseLabel(s))}</b></div></section>`;
}
function rxnTimerPanel(race,ev,pilots,s,done){
  const ring=r425RingData(race,ev,pilots,s),progress=timerProgress(s,ev);
  return `<section class="rxnTimerPanel"><div class="rxnTimerCopy"><span>${esc(timerCaption(s,ev))}</span><strong id="mainTimer">${done?'00:00':displayTimer(s,ev)}</strong><small id="timerSubline">${ev?timerSubline(s,ev):'Соревнование завершено'}</small></div><div id="timerRing" class="rxnRing" style="--ring-progress:${progress*3.6}deg"><div><b id="r425RingMain">${ring.main}</b><small id="r425RingSub">${ring.sub}</small></div></div></section>`;
}
function rxnControlButton(cls,attrs,icon,title,sub=''){
  return `<button class="rxnControl ${cls}" ${attrs}>${raceSvg(icon)}<span><b>${title}</b>${sub?`<small>${sub}</small>`:''}</span></button>`;
}
function rxnControlGrid(done,s,tie=false){
  if(tie)return `<div class="rxnControls">${rxnControlButton('blue','data-action="race-results"','chart','ТАБЛИЦА','РЕЗУЛЬТАТЫ')}${rxnControlButton('','disabled','pause','ПАУЗА')}${rxnControlButton('','disabled','flag','ФИНИШ')}${rxnControlButton('blue','disabled','plusClock','+1 МИН')}${rxnControlButton('primary','data-action="tie-draw"','refresh','ЖЕРЕБЬЁВКА')}${rxnControlButton('danger','data-action="home"','stop','ВЫХОД')}</div>`;
  if(done)return `<div class="rxnControls">${rxnControlButton('blue','data-action="race-results"','chart','РЕЗУЛЬТАТЫ')}${rxnControlButton('','data-action="home"','home','ГЛАВНАЯ')}${rxnControlButton('','data-action="open-rx"','settings','НАСТРОЙКА')}${rxnControlButton('blue','disabled','plusClock','+1 МИН')}${rxnControlButton('blue','disabled','refresh','РУЧНОЙ КРУГ')}${rxnControlButton('danger','data-action="complete-competition"','stop','ЗАВЕРШИТЬ')}</div>`;
  const p=s?.phase||'ready',timeRule=eventRule(state.race,currentEvent(state.race))?.limitType==='time';
  let primary;if(p==='ready')primary=rxnControlButton('primary','data-action="start-session"','play','СТАРТ','ПРОГРЕВ');else if(p==='paused')primary=rxnControlButton('primary','data-action="pause-session"','play','ПРОДОЛЖИТЬ');else if(p==='finished')primary=rxnControlButton('blue','data-action="next-event"','chart','РЕЗУЛЬТАТ','ПОДТВЕРДИТЬ');else primary=rxnControlButton('primary','disabled','play','ЗАЕЗД ИДЁТ');
  return `<div class="rxnControls">${primary}${rxnControlButton('','data-action="pause-session" '+(!['running','finishing'].includes(p)?'disabled':''),'pause','ПАУЗА')}${rxnControlButton('','data-action="finish-session" '+(!['running','finishing','paused'].includes(p)?'disabled':''),'flag','ФИНИШ')}${rxnControlButton('blue','data-action="add-minute" '+(!timeRule||!['running','paused','finishing'].includes(p)?'disabled':''),'plusClock','+1 МИН','ДОБАВИТЬ ВРЕМЯ')}${rxnControlButton('blue','data-action="manual-lap-modal" '+(!['running','finishing'].includes(p)?'disabled':''),'refresh','РУЧНОЙ КРУГ')}${rxnControlButton('danger','data-action="stop-session" '+(!['warmup','countdown','running','finishing','paused'].includes(p)?'disabled':''),'stop','СТОП')}</div>`;
}
function rxnColumnToggles(){
  const c=rxnLoadColumns(),defs=[['gap','GAP'],['check','✓'],['best','BEST'],['avg','AVG'],['last','LAST'],['laps','LAPS']];
  return `<div class="rxnColumnToggles">${defs.map(([k,t])=>`<button type="button" data-rxn-col="${k}" class="${c[k]?'active':''}">${t}</button>`).join('')}</div>`;
}
function rxnPrecisionToggles(){
  const p=rxnLoadPrecision();
  return `<div class="rxnPrecisionToggles"><button type="button" data-rxn-precision="1" class="${p===1?'active':''}" title="Десятые доли секунды">0.1</button><button type="button" data-rxn-precision="2" class="${p===2?'active':''}" title="Сотые доли секунды">0.01</button><button type="button" data-rxn-precision="3" class="${p===3?'active':''}" title="Тысячные доли секунды">0.001</button></div>`;
}
function rxnDisplayTools(){return `<div class="rxnDisplayTools">${rxnColumnToggles()}${rxnPrecisionToggles()}</div>`;}
function rxnControlPanel(done,s,tie=false){return `<section class="rxnControlPanel">${rxnControlGrid(done,s,tie)}${rxnDisplayTools()}</section>`;}
function rxnCockpitView(){
  if(!state.race||state.race.stage==='setup')return `<section class="page"><div class="card"><h2>Соревнование ещё не подготовлено</h2><button class="btn primary" data-action="open-rx">К настройке</button></div></section>`;
  const race=state.race,ev=currentEvent(race),events=eventList(race),s=ensureSession(ev),pilots=ev?liveRanking(getEventPilots(race,ev),s):[],done=race.stage==='finished',tie=race.stage==='tie';
  const cls=rxnColumnClass(),count=rxnMetricCount();
  if(tie)return `<section class="rxnCockpit ${cls}" style="--rxn-metric-count:${count}">${rxnHeader(race,ev,s)}${rxnRaceTitle(race,ev,s)}<main class="rxnTieMain"><div class="rxnTieBox">${tieWidget(race)}</div>${rxnControlPanel(false,s,true)}</main>${eventDrawer(race,events)}${quickPanelDrawer(race,ev,pilots,s,done)}</section>`;
  return `<section class="rxnCockpit ${cls}" style="--rxn-metric-count:${count}">${rxnHeader(race,ev,s)}${rxnRaceTitle(race,ev,s)}<main class="rxnMain"><section class="rxnRoster"><div class="rxnTable">${done?rxnFinalProtocolTable(race):rxnPilotTable(pilots,s)}</div></section><aside class="rxnSide">${rxnTimerPanel(race,ev,pilots,s,done)}${rxnControlPanel(done,s,false)}</aside></main>${eventDrawer(race,events)}${quickPanelDrawer(race,ev,pilots,s,done)}</section>`;
}

function rxnAnimateBoard(board,html){
  const old=new Map();board.querySelectorAll('.rxnPilotData[data-pilot-id]').forEach(r=>old.set(r.dataset.pilotId,r.getBoundingClientRect()));
  const scroll=board.closest('.rxnRoster')?.scrollTop||0;
  board.innerHTML=html;
  const roster=board.closest('.rxnRoster');if(roster)roster.scrollTop=scroll;
  requestAnimationFrame(()=>board.querySelectorAll('.rxnPilotData[data-pilot-id]').forEach(r=>{
    const prev=old.get(r.dataset.pilotId);if(!prev)return;const next=r.getBoundingClientRect(),dy=prev.top-next.top;if(Math.abs(dy)<.5)return;
    r.animate([{transform:`translateY(${dy}px)`},{transform:'translateY(0)'}],{duration:720,easing:'cubic-bezier(.16,.78,.18,1)'});
  }));
}
function rxnUpdateProgress(ranked,s){
  document.querySelectorAll('.rxnPilotData[data-pilot-id]').forEach(row=>{
    const p=ranked.find(x=>String(x.id)===String(row.dataset.pilotId));if(!p)return;const l=s.live?.[p.id]||blankLive(),pr=rxnProgress(l,s),fill=row.querySelector('.rxnLapTrack i');if(fill){fill.style.width=`${pr.pct.toFixed(1)}%`;fill.style.background=pr.color;}
  });
}
function rxnUpdateDynamicCockpit(){
  const race=state.race,ev=currentEvent(race),s=state.session;if(!race||!ev||!s)return;
  const timer=document.querySelector('#mainTimer');if(timer)timer.textContent=displayTimer(s,ev);
  if(s.phase==='countdown'&&s.warmupEndsAtPerf)s.countdownLeft=Math.max(0,Math.ceil(warmupRemainingMs(s)/1000));
  const ranked=liveRanking(getEventPilots(race,ev),s),ring=document.querySelector('#timerRing');
  if(ring)ring.style.setProperty('--ring-progress',`${timerProgress(s,ev)*3.6}deg`);
  const rd=r425RingData(race,ev,ranked,s),set=(q,v)=>{const e=document.querySelector(q);if(e)e.textContent=v;};
  set('#r425RingMain',rd.main);set('#r425RingSub',rd.sub);set('#timerSubline',timerSubline(s,ev));set('#rxnPhaseTitle',phaseLabel(s));
  const board=document.querySelector('.rxnTable');
  if(board&&s.phase!=='finished'){
    const warmSig=Object.keys(s.warmupDetected||{}).sort().join(','),sig=ranked.map(p=>{const l=s.live[p.id]||blankLive();return`${p.id}:${l.laps}:${l.startSeen}:${Math.round(l.lastLapMs||0)}:${Math.round(r425LapAvg(l)||0)}:${l.finished}`;}).join('|')+`|W:${warmSig}`;
    if(sig!==state.rxnBoardSignature){state.rxnBoardSignature=sig;rxnAnimateBoard(board,rxnPilotTable(ranked,s));}
    rxnUpdateProgress(ranked,s);
  }
}


/* ===== SPORT RESULT BRIDGE · TEST 05 =====
   The sports core stays authoritative. This UI only supplies/reads explicit result data. */
const rxnCoreSaveCurrentEventResult=saveCurrentEventResult;

function rxnStatusLabel(status){return ({FIN:'FIN · ФИНИШ',DNF:'DNF · НЕ ФИНИШИРОВАЛ',DNS:'DNS · НЕ СТАРТОВАЛ',DSQ:'DSQ · ДИСКВАЛИФИКАЦИЯ'})[status]||status;}
function rxnSuggestedStatus(p,s){const l=s?.live?.[p.id]||blankLive();return(!l.startSeen&&(l.laps||0)===0)?'DNS':'FIN';}
function rxnResultConfirmModal(){
  const race=state.race,ev=currentEvent(race),s=state.session;
  if(!race||!ev||s?.phase!=='finished')return toast('Сначала завершите текущий заезд');
  const ranked=liveRanking(getEventPilots(race,ev),s),raw=findRawEvent(ev.key),isQ=ev.type==='qualifying';
  const rows=ranked.map((p,i)=>{const l=s.live?.[p.id]||blankLive(),status=rxnSuggestedStatus(p,s);return `<div class="rxnResultEditRow" data-rxn-result-row="${esc(p.id)}">
    <div class="rxnResultPos">${i+1}</div><div class="rxnResultId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||i+1)}</div>
    <div class="rxnResultPilot"><b>${esc(p.name||'—')}</b><small>${l.laps||0} кр. · ${rxnFormatDuration(Number(l.elapsedMs||0))}</small></div>
    <select data-result-status="${esc(p.id)}" data-rxn-status="${esc(p.id)}">
      ${SPORT_RULES.statuses.map(st=>`<option value="${st}" ${st===status?'selected':''}>${rxnStatusLabel(st)}</option>`).join('')}
    </select>
    <input type="number" min="1" max="${ranked.length}" value="${i+1}" data-result-place="${esc(p.id)}" ${status!=='FIN'?'disabled':''} aria-label="Место">
  </div>`;}).join('');
  $('#modalHost').innerHTML=`<div class="modalBackdrop"><div class="modal rxnResultModal"><div class="modalHead"><div><div class="sectionLabel">${isQ?'КВАЛИФИКАЦИЯ':'ФИНАЛ'} · ПОДТВЕРЖДЕНИЕ</div><h2>${esc(ev.label||eventShortLabel(ev))}</h2><p>Порядок предложен по засечке. Перед сохранением проверьте FIN / DNF / DNS / DSQ.</p></div><button class="iconBtn" data-rxn-result-close="1">×</button></div>
    <div class="rxnResultRuleNote">${isQ?`Очки Q: ${SPORT_RULES.qualifyingPoints.slice(0,6).join(' · ')}… · BEST 3`:`Финал A: A1 / A2 / A3 · учитываются лучшие ${SPORT_RULES.finalBestCount} · DNF/DNS/DSQ = ${SPORT_RULES.finalNonFinishScore} для суммы финала`}</div>
    <div class="rxnResultEditHead"><span>POS</span><span>ID</span><span>ПИЛОТ</span><span>СТАТУС</span><span>МЕСТО</span></div><div class="rxnResultEditList">${rows}</div>
    <div class="rxnResultActions"><button class="btn secondary" data-rxn-result-close="1">НАЗАД</button><button class="btn primary" data-rxn-result-save="1">СОХРАНИТЬ РЕЗУЛЬТАТ</button></div>
  </div></div>`;
}
function rxnSaveConfirmedResult(){
  const race=state.race,ev=currentEvent(race);if(!race||!ev)return;
  const key=ev.key;
  rxnCoreSaveCurrentEventResult();
  if(findRawEvent(key)?.saved)closeModal();
}
function rxnStartGridOrder(race,raw){
  const q=qualificationRankMap(race);return (raw?.pilots||[]).map(id=>getPilot(race,id)).filter(Boolean).sort((a,b)=>(q.get(String(a.id))||9999)-(q.get(String(b.id))||9999));
}
function rxnStartGridModal(eventKey=''){
  const race=state.race,raw=findRawEvent(eventKey||currentEvent(race)?.key);if(!race||!raw)return;
  const order=rxnStartGridOrder(race,raw),q=qualificationRankMap(race);
  $('#modalHost').innerHTML=`<div class="modalBackdrop"><div class="modal rxnGridModal"><div class="modalHead"><div><div class="sectionLabel">ПОРЯДОК ВЫЗОВА НА СТАРТ</div><h2>${esc(raw.label||raw.name||'Финал')}</h2><p>Вызов идёт по рейтингу квалификации: от лучшего результата к следующему.</p></div><button class="iconBtn" data-rxn-grid-close="1">×</button></div><div class="rxnGridList">${order.map((p,i)=>`<div class="rxnGridRow"><strong>${i+1}</strong><span class="rxnResultId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||i+1)}</span><div><b>${esc(p.name)}</b><small>Q-рейтинг: ${q.get(String(p.id))||'—'} · стартовая позиция ${i+1}</small></div></div>`).join('')||'<div class="rxnEmpty">Состав финала ещё не сформирован.</div>'}</div><div class="rxnResultActions"><button class="btn secondary" data-rxn-grid-close="1">ЗАКРЫТЬ</button><button class="btn primary" data-rxn-grid-confirm="${esc(raw.key)}">ПОРЯДОК ПОДТВЕРЖДЁН</button></div></div></div>`;
}
function rxnFormatMainRun(item,score){if(!item)return'—';return item.status==='FIN'?String(item.place||score||'—'):`${item.status} (${score??SPORT_RULES.finalNonFinishScore})`;}
function rxnRaceResultsModal(focusKey=''){
  const race=state.race;if(!race)return;updateStandings(race);
  const completed=eventList(race).filter(e=>e.saved),main=race.finals?.length?buildMainStandings(race):[];
  const qrows=race.pilots.map((p,i)=>`<tr><td>${i+1}</td><td>${esc(p.name)}</td>${Array.from({length:race.qualifyingCount},(_,k)=>{const q=p.qualifying.find(x=>x.round===k+1);return `<td>${q?q.status==='FIN'?`${q.place} (${q.points})`:esc(q.status):'—'}</td>`}).join('')}<td><b>${p.best3}</b></td></tr>`).join('');
  const mainRows=main.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(getPilot(race,r.pilotId)?.name||'—')}</td>${r.results.map((x,j)=>`<td>${esc(rxnFormatMainRun(x,r.scores[j]))}</td>`).join('')}<td><b>${r.total??'—'}</b></td></tr>`).join('');
  const eventTables=completed.map(e=>{const rows=(e.result||[]).map((r,i)=>{const p=getPilot(race,r.pilotId);return `<tr><td>${r.status==='FIN'?(r.place||i+1):esc(r.status)}</td><td>${esc(p?.name||'—')}</td><td><b class="rxnStatusText ${String(r.status||'FIN').toLowerCase()}">${esc(r.status||'FIN')}</b>${r.status==='DNF'&&r.dnfOrder?` · порядок ${r.dnfOrder}`:''}</td></tr>`;}).join('');return `<details ${focusKey===e.key?'open':''} class="card rxnResultDetails"><summary>${esc(e.label)}</summary><div class="tableWrap"><table class="table"><thead><tr><th>Место</th><th>Пилот</th><th>Статус</th></tr></thead><tbody>${rows||'<tr><td colspan="3">Заезд отменён / нет результата</td></tr>'}</tbody></table></div></details>`;}).join('');
  $('#modalHost').innerHTML=`<div class="modalBackdrop"><div class="modal rxnTablesModal"><div class="modalHead"><div><div class="sectionLabel">СПОРТИВНЫЕ РЕЗУЛЬТАТЫ · ${esc(SPORT_RULES.version)}</div><h2>${esc(race.eventName)}</h2></div><button class="iconBtn" id="closeModal">×</button></div>
    <div class="rxnRulesBar"><span>Q: ${SPORT_RULES.qualifyingPoints.slice(0,6).join(' / ')}…</span><span>BEST 3</span><span>A1+A2+A3 · лучшие ${SPORT_RULES.finalBestCount}</span><span>не-FIN = ${SPORT_RULES.finalNonFinishScore}</span><span>Этап: ${SPORT_RULES.championshipEventPoints.join(' / ')}</span></div>
    <h3>Квалификационный рейтинг</h3><div class="tableWrap"><table class="table"><thead><tr><th>POS</th><th>Пилот</th>${Array.from({length:race.qualifyingCount},(_,i)=>`<th>Q${i+1}</th>`).join('')}<th>Best 3</th></tr></thead><tbody>${qrows}</tbody></table></div>
    ${main.length?`<h3>Финал A</h3><div class="tableWrap"><table class="table"><thead><tr><th>POS</th><th>Пилот</th><th>A1</th><th>A2</th><th>A3</th><th>Лучшие ${SPORT_RULES.finalBestCount}</th></tr></thead><tbody>${mainRows}</tbody></table></div>`:''}
    <h3>Завершённые заезды</h3>${eventTables||'<div class="empty">Пока нет завершённых заездов.</div>'}
    ${race.finalProtocol?.length?`<h3>Итоговый протокол</h3><div class="tableWrap"><table class="table"><thead><tr><th>Место</th><th>Пилот</th><th>Очки этапа</th><th>Статус</th><th>Источник</th></tr></thead><tbody>${race.finalProtocol.map(r=>`<tr><td>${r.place}</td><td>${esc(getPilot(race,r.pilotId)?.name||'—')}</td><td>${r.eventPoints}</td><td>${esc(r.status||'FIN')}</td><td>${esc(r.source)}</td></tr>`).join('')}</tbody></table></div>`:''}
  </div></div>`;$('#closeModal').onclick=closeModal;
}
function rxnRunSportSelfTest(){
  const t=[],eq=(name,a,b)=>t.push({name,ok:Object.is(a,b),got:a,want:b});
  eq('Q P1',getPoints(1),50);eq('Q P4',getPoints(4),40);eq('Q P16',getPoints(16),28);eq('Q P17 continuation',getPoints(17),27);
  const pilot={qualifying:[{round:1,heat:1,status:'FIN',place:1,points:50},{round:2,heat:1,status:'FIN',place:2,points:45},{round:3,heat:1,status:'FIN',place:3,points:42},{round:4,heat:1,status:'FIN',place:4,points:40}]};calculateBest3(pilot);eq('Best3 sum',pilot.best3,137);
  eq('Final FIN score',mainRunScore({status:'FIN',place:2}),2);eq('Final DNF score',mainRunScore({status:'DNF'}),SPORT_RULES.finalNonFinishScore);eq('Final DNS score',mainRunScore({status:'DNS'}),SPORT_RULES.finalNonFinishScore);eq('Final DSQ score',mainRunScore({status:'DSQ'}),SPORT_RULES.finalNonFinishScore);
  eq('A runs',FINAL_A_RUNS.join(','),'A1,A2,A3');eq('Stage P1',EVENT_POINTS[0],25);
  return{ok:t.every(x=>x.ok),version:SPORT_RULES.version,tests:t};
}
window.LegionRXSportDiagnostics=rxnRunSportSelfTest;
const rxnSportBootCheck=rxnRunSportSelfTest();if(!rxnSportBootCheck.ok)console.error('LEGION RX SPORT RULES SELF-TEST FAILED',rxnSportBootCheck);else console.info('LEGION RX SPORT RULES OK',rxnSportBootCheck.version);

saveCurrentEventResult=rxnResultConfirmModal;
raceResultsModal=rxnRaceResultsModal;
/* ===== /SPORT RESULT BRIDGE ===== */

// Override only the visual cockpit boundary. Core functions remain untouched.
cockpitView=rxnCockpitView;
updateDynamicCockpit=rxnUpdateDynamicCockpit;

// Live display switches. They change presentation only; race/session data is untouched.

/* ===== UI NEXT Track Day / Free Practice =====
   New isolated DOM. Track Day timing/PIT/LapWiz logic stays in index.html. */
function rxnTrackGapHtml(ranked,td,p,index){
  if(index===0)return rxnSplitMillisText(rxnFormatDuration(0),rxnLoadPrecision());
  const leader=td?.live?.[ranked[0]?.id]||blankTrackLive(),l=td?.live?.[p.id]||blankTrackLive();
  const lapDiff=(leader.laps||0)-(l.laps||0);
  if(lapDiff>0)return `+${lapDiff}L`;
  const lb=Number(leader.bestLapMs),pb=Number(l.bestLapMs);
  if(Number.isFinite(lb)&&Number.isFinite(pb)&&pb>=lb)return `+${rxnSplitMillisText(rxnFormatDuration(pb-lb),rxnLoadPrecision())}`;
  return '—';
}
function rxnTrackProgress(l,td){
  if(!l?.startSeen||l?.status==='PIT'||td?.status!=='active')return{pct:0,color:'#173247'};
  const elapsed=Math.max(0,trackElapsed(td)-Number(l.lastElapsedAtPass||0));
  const sm=lapSummary(l),expected=Number.isFinite(sm.avg)?sm.avg:Number.isFinite(l.bestLapMs)?l.bestLapMs:Number.isFinite(l.lastLapMs)?l.lastLapMs:30000;
  const pct=Math.max(0,Math.min(100,elapsed/Math.max(5000,expected)*100));
  const base=Number.isFinite(l.bestLapMs)?l.bestLapMs:expected,ratio=elapsed/Math.max(5000,base);
  let color='#38e46d';if(ratio>1.12)color='#ed3d50';else if(ratio>1.02)color='#e4c136';
  return{pct,color};
}
function rxnTrackCheck(l){
  if(!l?.startSeen)return'';
  if(l.status==='PIT')return'PIT';
  if(l.status==='PIT_OUT'&&Date.now()<Number(l.pitOutUntilEpoch||0))return'OUT';
  return'✓';
}
function rxnTrackPhoneMetric(l){
  if(!l?.startSeen)return'—';
  if(l.status==='PIT')return'PIT';
  const best=rxnTimeHtml(l.bestLapMs);
  return `<b>${l.laps||0}L</b>${Number.isFinite(l.bestLapMs)?`<small>${best}</small>`:''}`;
}
function rxnTrackPilotTable(td){
  const pilots=rankTrackPilots(td);
  const rows=pilots.map((p,i)=>{
    const l=td.live?.[p.id]||blankTrackLive(),sm=lapSummary(l),pr=rxnTrackProgress(l,td),st=rxnTrackCheck(l);
    return `<div class="rxnPilotRow rxnPilotData ${i===0&&l.laps>0?'leader':''}" data-pilot-id="${esc(p.id)}" data-pilot-stats="${esc(p.id)}" data-stats-context="track">
      <div class="rxnPos">${i+1}</div>
      <div class="rxnId" style="--pilot-color:${rxnPilotColor(p)}">${esc(p.transponder||i+1)}</div>
      <div class="rxnNameCell"><div class="rxnName">${esc(p.name||'—')}</div><div class="rxnLapTrack"><i style="width:${pr.pct.toFixed(1)}%;background:${pr.color}"></i></div></div>
      <div class="rxnFlagCell">${rxnFlagMarkup(p)}</div>
      <div class="rxnGap">${rxnTrackGapHtml(pilots,td,p,i)}</div>
      <div class="rxnCheck ${l.startSeen?'ok':''}">${st}</div>
      <div class="rxnBest">${rxnTimeHtml(sm.best)}</div>
      <div class="rxnAvg">${rxnTimeHtml(sm.avg)}</div>
      <div class="rxnLast">${rxnTimeHtml(l.lastLapMs)}</div>
      <div class="rxnLaps">${l.laps||0}</div>
      <div class="rxnPhoneMetric">${rxnTrackPhoneMetric(l)}</div>
    </div>`;
  }).join('');
  return rxnPilotHeader()+rows;
}
function rxnTrackHeader(td){
  const active=td?.status==='active';
  return `<header class="rxnTop">
    ${rxnTopButton({cls:'iconOnly',attrs:'data-quick-panel="lapwiz" title="Bluetooth / LapWiz"',icon:'bluetooth'})}
    ${rxnTopButton({cls:lapwiz.connected?'ok':'',attrs:lapwiz.connected?'data-action="lap-disconnect"':'data-track-action="lap-connect"',icon:'wave',title:'LAPWIZ',sub:lapwiz.connected?'ПОДКЛЮЧЕН':'OFFLINE'})}
    ${rxnTopButton({cls:state.settings.announcerEnabled?'ok':'',attrs:'data-quick-panel="announcer"',icon:'mic',title:'ДИКТОР',sub:state.settings.announcerEnabled?'ВКЛ':'ВЫКЛ'})}
    ${rxnTopButton({cls:active?'ok':'blue',attrs:'',icon:'flag',title:'СТАТУС',sub:active?'ПРАКТИКА':'ЗАВЕРШЕНА'})}
    ${rxnTopButton({attrs:'data-track-action="report"',icon:'chart',title:'СТАТИСТИКА',sub:'СЕССИЯ'})}
    ${rxnTopButton({cls:'danger',attrs:'data-track-action="finish"',icon:'stop',title:'ЗАВЕРШИТЬ',sub:'ПРАКТИКУ'})}
    ${rxnTopButton({cls:'blue',attrs:'data-track-action="report"',icon:'chart',title:'РЕЗУЛЬТАТЫ'})}
    ${rxnTopButton({cls:'iconOnly',attrs:'data-action="open-settings" title="Настройки"',icon:'settings'})}
    ${rxnTopButton({cls:'iconOnly',attrs:'data-track-action="home" title="Главная"',icon:'list'})}
  </header>`;
}
function rxnTrackTitle(td){
  return `<section class="rxnRaceTitle"><div><small>LEGION RX · FREE PRACTICE</small><h1>${esc(td?.name||'СВОБОДНАЯ ПРАКТИКА')}</h1></div><div class="rxnRaceMeta"><span>TRACK DAY</span><b id="rxnPhaseTitle">${td?.status==='active'?'ПРАКТИКА ИДЁТ':'СЕССИЯ ЗАВЕРШЕНА'}</b></div></section>`;
}
function rxnTrackTimerPanel(td,pilots){
  const remaining=trackRemaining(td),leader=pilots?.[0],ll=leader?td.live?.[leader.id]:null,total=Math.max(1,Number(td.durationMin||1)*60000),progress=Math.max(0,Math.min(100,remaining/total*100));
  return `<section class="rxnTimerPanel"><div class="rxnTimerCopy"><span>${td.status==='active'?'ДО КОНЦА СЕССИИ':'СЕССИЯ ЗАВЕРШЕНА'}</span><strong id="trackMainTimer">${fmtClock(td.status==='active'?remaining:(td.elapsedFinalMs||trackElapsed(td)))}</strong><small id="trackTimerSubline">${td.durationMin} МИН · FREE PRACTICE</small></div><div id="trackTimerRing" class="rxnRing" style="--ring-progress:${progress*3.6}deg"><div><b id="rxnTrackRingMain">${ll?.laps||0}</b><small id="rxnTrackRingSub">КРУГОВ ЛИДЕРА</small></div></div></section>`;
}
function rxnTrackControlGrid(td){
  const active=td?.status==='active';
  if(!active)return `<div class="rxnControls">${rxnControlButton('blue','data-track-action="report"','chart','СТАТИСТИКА')}${rxnControlButton('','data-track-action="home"','home','ГЛАВНАЯ')}${rxnControlButton('','data-track-action="setup"','settings','НОВАЯ СЕССИЯ')}${rxnControlButton('blue','data-track-action="report"','chart','ОТЧЁТ')}${rxnControlButton('blue','disabled','refresh','РУЧНОЙ КРУГ')}${rxnControlButton('danger','data-track-action="clear-active"','stop','ЗАКРЫТЬ')}</div>`;
  return `<div class="rxnControls">${rxnControlButton('primary','disabled','play','ПРАКТИКА ИДЁТ')}${rxnControlButton('','disabled','pause','ПАУЗА')}${rxnControlButton('','data-track-action="finish"','flag','ФИНИШ')}${rxnControlButton('blue','data-track-action="report"','chart','СТАТИСТИКА')}${rxnControlButton('blue','data-rxn-track-manual="1"','refresh','РУЧНОЙ КРУГ')}${rxnControlButton('danger','data-track-action="finish"','stop','СТОП')}</div>`;
}
function rxnTrackControlPanel(td){return `<section class="rxnControlPanel">${rxnTrackControlGrid(td)}${rxnDisplayTools()}</section>`;}
function rxnTrackDayCockpitView(){
  const td=ensureTrackDayState(state.trackDay);if(!td)return `<section class="page"><div class="card"><h2>Нет активного Track Day</h2><button class="btn primary" data-track-action="setup">К настройке</button></div></section>`;
  const pilots=rankTrackPilots(td),cls=rxnColumnClass(),count=rxnMetricCount();
  return `<section class="rxnCockpit rxnTrackCockpit ${cls}" style="--rxn-metric-count:${count}">${rxnTrackHeader(td)}${rxnTrackTitle(td)}<main class="rxnMain"><section class="rxnRoster"><div id="trackPilotBoard" class="rxnTable">${rxnTrackPilotTable(td)}</div></section><aside class="rxnSide">${rxnTrackTimerPanel(td,pilots)}${rxnTrackControlPanel(td)}</aside></main></section>`;
}
function rxnUpdateTrackDayDynamic(){
  const td=ensureTrackDayState(state.trackDay);if(!td)return;
  const pilots=rankTrackPilots(td),remaining=trackRemaining(td),total=Math.max(1,Number(td.durationMin||1)*60000),progress=Math.max(0,Math.min(100,remaining/total*100));
  const timer=document.querySelector('#trackMainTimer');if(timer)timer.textContent=fmtClock(td.status==='active'?remaining:(td.elapsedFinalMs||trackElapsed(td)));
  const ring=document.querySelector('#trackTimerRing');if(ring)ring.style.setProperty('--ring-progress',`${progress*3.6}deg`);
  const leader=pilots[0],ll=leader?td.live?.[leader.id]:null,rm=document.querySelector('#rxnTrackRingMain');if(rm)rm.textContent=String(ll?.laps||0);
  const phase=document.querySelector('#rxnPhaseTitle');if(phase)phase.textContent=td.status==='active'?'ПРАКТИКА ИДЁТ':'СЕССИЯ ЗАВЕРШЕНА';
  const board=document.querySelector('#trackPilotBoard');if(board){
    const sig=pilots.map(p=>{const l=td.live?.[p.id]||blankTrackLive();return`${p.id}:${l.laps}:${Math.round(l.lastLapMs||0)}:${Math.round(l.bestLapMs||0)}:${l.startSeen}:${l.status}`;}).join('|')+`|P:${rxnLoadPrecision()}|C:${rxnColumnClass()}`;
    if(sig!==td._rxnBoardSig){td._rxnBoardSig=sig;rxnAnimateBoard(board,rxnTrackPilotTable(td));}
    document.querySelectorAll('.rxnPilotData[data-pilot-id]').forEach(row=>{const p=pilots.find(x=>String(x.id)===String(row.dataset.pilotId));if(!p)return;const l=td.live?.[p.id]||blankTrackLive(),pr=rxnTrackProgress(l,td),fill=row.querySelector('.rxnLapTrack i');if(fill){fill.style.width=`${pr.pct.toFixed(1)}%`;fill.style.background=pr.color;}});
  }
}
function rxnTrackManualLapModal(){
  const td=ensureTrackDayState(state.trackDay);if(!td||td.status!=='active')return toast('Ручной круг доступен во время свободной практики');
  const pilots=rankTrackPilots(td);
  $('#modalHost').innerHTML=`<div class="modalBackdrop"><div class="modal manualLapModal"><div class="modalHead"><div><div class="sectionLabel">FREE PRACTICE · РУЧНОЙ РЕЗЕРВ</div><h2>Кому добавить проход?</h2></div><button class="iconBtn" id="closeModal">×</button></div><div class="manualPilotGrid">${pilots.map(p=>{const l=td.live?.[p.id]||blankTrackLive();return `<button data-rxn-track-pilot="${esc(p.id)}"><span>${nameInitials(p.name)}</span><b>${pilotNameMarkup(p)}</b><em>${l.laps||0} кругов</em></button>`;}).join('')}</div></div></div>`;
  $('#closeModal').onclick=closeModal;
  $$('[data-rxn-track-pilot]').forEach(b=>b.onclick=()=>{const p=trackPilot(td,b.dataset.rxnTrackPilot);if(p){processTrackPass(p.transponder,null,'MANUAL');toast(`Ручной проход: ${p.name}`);closeModal();}});
}
trackDayCockpitView=rxnTrackDayCockpitView;
updateTrackDayDynamic=rxnUpdateTrackDayDynamic;
/* ===== /UI NEXT Track Day ===== */

document.addEventListener('change',e=>{
  const sel=e.target.closest?.('[data-rxn-status]');if(!sel)return;
  const row=sel.closest('[data-rxn-result-row]'),place=row?.querySelector('[data-result-place]');if(place)place.disabled=sel.value!=='FIN';
});
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-rxn-result-save]')){rxnSaveConfirmedResult();return;}
  if(e.target.closest?.('[data-rxn-result-close]')){closeModal();return;}
  const grid=e.target.closest?.('[data-rxn-grid-open]');if(grid){rxnStartGridModal(grid.dataset.rxnGridOpen);return;}
  const gc=e.target.closest?.('[data-rxn-grid-close]');if(gc){closeModal();return;}
  const confirmGrid=e.target.closest?.('[data-rxn-grid-confirm]');if(confirmGrid){const raw=findRawEvent(confirmGrid.dataset.rxnGridConfirm);if(raw){state.race.startGrids=state.race.startGrids||{};state.race.startGrids[raw.key]={order:rxnStartGridOrder(state.race,raw).map(p=>p.id),confirmedAt:new Date().toISOString()};persistRace();toast('Стартовая решётка подтверждена');}closeModal();return;}
});

document.addEventListener('click',e=>{
  const trackManual=e.target.closest?.('[data-rxn-track-manual]');
  if(trackManual){rxnTrackManualLapModal();return;}
  const colBtn=e.target.closest?.('[data-rxn-col]');
  if(colBtn){
    const c=rxnLoadColumns(),k=colBtn.dataset.rxnCol;c[k]=!c[k];rxnSaveColumns(c);
    const root=document.querySelector('.rxnCockpit');if(!root)return;
    root.className=root.className.replace(/\brxnHide-(gap|check|best|avg|last|laps)\b/g,'').replace(/\s+/g,' ').trim();
    const cls=rxnColumnClass();if(cls)root.className+=' '+cls;
    root.style.setProperty('--rxn-metric-count',String(rxnMetricCount()));
    root.querySelectorAll('[data-rxn-col]').forEach(x=>x.classList.toggle('active',!!c[x.dataset.rxnCol]));
    if(state?.view==='trackDayCockpit'){const td=ensureTrackDayState(state.trackDay),board=document.querySelector('#trackPilotBoard');if(td&&board)rxnAnimateBoard(board,rxnTrackPilotTable(td));}
    return;
  }
  const precisionBtn=e.target.closest?.('[data-rxn-precision]');
  if(precisionBtn){
    const n=Number(precisionBtn.dataset.rxnPrecision);if(![1,2,3].includes(n))return;
    rxnSavePrecision(n);
    document.querySelectorAll('[data-rxn-precision]').forEach(x=>x.classList.toggle('active',Number(x.dataset.rxnPrecision)===n));
    const race=state.race,ev=currentEvent(race),s=state.session;
    if(race&&ev&&s&&state?.view==='cockpit'){
      const ranked=liveRanking(getEventPilots(race,ev),s),board=document.querySelector('.rxnTable');
      if(board&&s.phase!=='finished')rxnAnimateBoard(board,rxnPilotTable(ranked,s));
    }
    if(state?.view==='trackDayCockpit'){const td=ensureTrackDayState(state.trackDay),board=document.querySelector('#trackPilotBoard');if(td&&board)rxnAnimateBoard(board,rxnTrackPilotTable(td));}
  }
});

// Layout responds to orientation without touching race/session state.
let rxnResizeTimer=null;
window.addEventListener('resize',()=>{
  clearTimeout(rxnResizeTimer);rxnResizeTimer=setTimeout(()=>{if(['cockpit','trackDayCockpit'].includes(state?.view))render();},180);
});
