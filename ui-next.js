'use strict';
/* Legion RX 4.1.0 UI NEXT TEST 03
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
  return rxnSplitMillisText(rxnFormatDuration(ms,digits));
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
function rxnSplitMillisText(value){
  const s=String(value??'—');
  if(!s.includes('.'))return esc(s);
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
function rxnGapHtml(ranked,s,p,index){return rxnSplitMillisText(rxnGapRaw(ranked,s,p,index));}
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
  return `<section class="rxnRaceTitle"><div><small>LEGION RX · RALLYCROSS</small><h1>${esc(label)}</h1></div><div class="rxnRaceMeta"><span>${esc(race.className||'Rally-10')}</span><b id="rxnPhaseTitle">${esc(phaseLabel(s))}</b></div></section>`;
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
  let primary;if(p==='ready')primary=rxnControlButton('primary','data-action="start-session"','play','СТАРТ','ПРОГРЕВ');else if(p==='paused')primary=rxnControlButton('primary','data-action="pause-session"','play','ПРОДОЛЖИТЬ');else if(p==='finished')primary=rxnControlButton('blue','data-action="next-event"','next','СЛЕДУЮЩИЙ','ЗАЕЗД');else primary=rxnControlButton('primary','disabled','play','ЗАЕЗД ИДЁТ');
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

// Override only the visual cockpit boundary. Core functions remain untouched.
cockpitView=rxnCockpitView;
updateDynamicCockpit=rxnUpdateDynamicCockpit;

// Live display switches. They change presentation only; race/session data is untouched.
document.addEventListener('click',e=>{
  const colBtn=e.target.closest?.('[data-rxn-col]');
  if(colBtn){
    const c=rxnLoadColumns(),k=colBtn.dataset.rxnCol;c[k]=!c[k];rxnSaveColumns(c);
    const root=document.querySelector('.rxnCockpit');if(!root)return;
    root.className=root.className.replace(/\brxnHide-(gap|check|best|avg|last|laps)\b/g,'').replace(/\s+/g,' ').trim();
    const cls=rxnColumnClass();if(cls)root.className+=' '+cls;
    root.style.setProperty('--rxn-metric-count',String(rxnMetricCount()));
    root.querySelectorAll('[data-rxn-col]').forEach(x=>x.classList.toggle('active',!!c[x.dataset.rxnCol]));
    return;
  }
  const precisionBtn=e.target.closest?.('[data-rxn-precision]');
  if(precisionBtn){
    const n=Number(precisionBtn.dataset.rxnPrecision);if(![1,2,3].includes(n))return;
    rxnSavePrecision(n);
    document.querySelectorAll('[data-rxn-precision]').forEach(x=>x.classList.toggle('active',Number(x.dataset.rxnPrecision)===n));
    const race=state.race,ev=currentEvent(race),s=state.session;
    if(race&&ev&&s){
      const ranked=liveRanking(getEventPilots(race,ev),s),board=document.querySelector('.rxnTable');
      if(board&&s.phase!=='finished')rxnAnimateBoard(board,rxnPilotTable(ranked,s));
    }
  }
});

// Layout responds to orientation without touching race/session state.
let rxnResizeTimer=null;
window.addEventListener('resize',()=>{
  clearTimeout(rxnResizeTimer);rxnResizeTimer=setTimeout(()=>{if(state?.view==='cockpit')render();},180);
});
