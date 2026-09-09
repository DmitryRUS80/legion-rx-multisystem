'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const I18N={ru:{'nav.home':'Главная','nav.champs':'Чемпионаты','nav.pilots':'Пилоты','nav.settings':'Настройки'},en:{'nav.home':'Home','nav.champs':'Championships','nav.pilots':'Drivers','nav.settings':'Settings'}};
const LEGION_FLAG_CODES=`AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(/\s+/);
const COUNTRY_CODES=['RU',...LEGION_FLAG_CODES.filter(code=>code!=='RU')];
let _regionNames=null;
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function nameInitials(name=''){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'RX';}

function countryFlag(code=''){code=String(code||'').toUpperCase();const index=LEGION_FLAG_CODES.indexOf(code);if(index<0)return'';const x=(index%16)*100/15,y=Math.floor(index/16)*100/15;return`${x.toFixed(5)}% ${y.toFixed(5)}%`;}

function countryName(code=''){code=String(code||'').toUpperCase();if(!code)return'';try{_regionNames||=new Intl.DisplayNames(['ru'],{type:'region'});return _regionNames.of(code)||code;}catch{return code;}}

function countryOptions(selected=''){const sel=String(selected||'').toUpperCase();return `<option value="">— Не указана —</option>`+COUNTRY_CODES.map(c=>`<option value="${c}" ${c===sel?'selected':''}>${esc(countryName(c))}</option>`).join('');}

function clubMarkup(club='',fallback='Без клуба'){return isLegionRXClub(club)?`<span class="legionClubMark">LEGION <i>RX</i></span>`:esc(club||fallback);}

function pilotNameMarkup(p){const code=pilotCountryCode(p),flag=countryFlag(code),name=String(p?.name||'—').toUpperCase();return `<span class="pilotNameLine">${flag?`<span class="countryFlag" style="--country-flag-position:${flag}" title="${esc(countryName(code))}" role="img" aria-label="${esc(countryName(code))}">${esc(code)}</span>`:''}<span>${esc(name)}</span></span>`;}


function uiIcon(name,cls='uiIcon'){
 const paths={
  flag:'<path d="M5 21V4m0 1c4-2.4 7.2 2.2 13 0v8.4c-5.8 2.5-9-2.1-13 .1"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 13l3-3M12 5v2"/>',
  car:'<path d="M4 14.5 5.8 9h12.4l1.8 5.5v4H18m-12 0H4v-4h16v4h-2M7 18.5h10"/><circle cx="7" cy="16" r="1.4"/><circle cx="17" cy="16" r="1.4"/>',
  trophy:'<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1a4 4 0 0 0 4 4m8-5h4v1a4 4 0 0 1-4 4M12 12v5m-4 3h8"/>',
  users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 3-7 6-7s6 3 6 7m1-5c3 0 5 2 5 5"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1-2-4-2 1a7 7 0 0 0-2-1l-.3-2h-5l-.3 2a7 7 0 0 0-2 1l-2-1-2 4 2 1a7 7 0 0 0 0 2l-2 1 2 4 2-1a7 7 0 0 0 2 1l.3 2h5l.3-2a7 7 0 0 0 2-1l2 1 2-4-2-1c.1-.3.1-.7.1-1Z"/>',
  bluetooth:'<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
  wave:'<path d="M2 12h3l1.4-5 2.3 10 2-13 2.6 16 2.1-11 1.6 6h5"/>',
  chart:'<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/>',
  mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/>',
  monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  home:'<path d="M3 11l9-8 9 8v10h-6v-6H9v6H3Z"/>',
  play:'<path d="M8 5v14l11-7Z"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>',
  plusTime:'<circle cx="11" cy="12" r="7"/><path d="M11 8v4l3 2M18 6v5m-2.5-2.5h5"/>',
  next:'<path d="m5 5 7 7-7 7m7-14 7 7-7 7"/>',
  refresh:'<path d="M20 6v5h-5M4 18v-5h5M18 9a7 7 0 0 0-12-2M6 15a7 7 0 0 0 12 2"/>',
  speaker:'<path d="M4 10h4l5-4v12l-5-4H4Zm12-1a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12"/>',
  signal:'<path d="M5 19v-3m4 3v-6m4 6V9m4 10V5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  chevron:'<path d="M9 18l6-6-6-6"/>',
  chevronDown:'<path d="m6 9 6 6 6-6"/>'
 };
 return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.flag}</svg>`;
}

function translateStatic(){
 const d=I18N[state.settings.lang]||I18N.ru;$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(d[k])el.textContent=d[k];});
 if(state.settings.lang!=='en')return;
 const map={
  'Нет активной гонки':'No active race','Главная':'Home','Чемпионаты':'Championships','Пилоты':'Drivers','Настройки':'Settings','Текущая гонка →':'Current race →','Ралли-кросс':'RallyCross','Создать соревнование':'Create event','Открыть RallyCross':'Open RallyCross','Ралли-спринт':'Rally Sprint','Классическая RC-гонка':'Classic RC race','В разработке':'In development','Открыть':'Open','Общая база':'Driver database','Новый профиль':'New profile','Сохранить':'Save','Название':'Name','Дата':'Date','Место':'Location','Чемпионат':'Championship','Клубная гонка':'Club race','Создать событие':'Create event','Участники':'Participants','Из базы':'From database','＋ Новый':'＋ New','Формат RallyCross':'RallyCross format','Квалификационных серий':'Qualifying rounds','Квалификация, минут':'Qualifying, minutes','Финал, кругов':'Final, laps','Минимальный круг LapWiz, сек':'LapWiz minimum lap, sec','Сформировать заезды и открыть пульт':'Build heats and open control','Удалить событие':'Delete event','Открыть пульт':'Open control','СОБЫТИЯ':'EVENTS','Ход соревнования':'Event flow','ТЕКУЩИЙ ЗАЕЗД':'CURRENT HEAT','Результаты заезда':'Heat results','Таблицы':'Tables','Текущий результат':'Current result','РЕЗУЛЬТАТЫ':'RESULTS','СТАРТ':'START','ФИНИШ':'FINISH','СТОП':'STOP','ПАУЗА':'PAUSE','Подключить':'Connect','Отключить':'Disconnect','Подключить LapWiz':'Connect LapWiz','Отключить LapWiz':'Disconnect LapWiz','Интерфейс':'Interface','Тёмная тема':'Dark theme','Язык интерфейса':'Interface language','Звук прохода':'Pass sound','Значения по умолчанию':'Defaults','О приложении':'About','Сезоны':'Seasons','Мои чемпионаты':'My championships','Новый чемпионат':'New championship','План этапов':'Planned rounds','Создать':'Create','Нет завершённых этапов.':'No completed rounds.','Результаты':'Results','Завершённые заезды':'Completed heats','Итоговый протокол':'Final classification','Квалификационный рейтинг':'Qualifying ranking','Сохранить и перейти дальше':'Save and go to next heat'
 };
 const root=document.getElementById('viewHost');if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(n=>{const raw=n.nodeValue,trim=raw.trim();if(map[trim])n.nodeValue=raw.replace(trim,map[trim]);});
}

function applyUiTokens(ui=state.settings.ui){const r=document.documentElement.style;r.setProperty('--radius-card',`${ui.cardRadius}px`);r.setProperty('--radius-tile',`${ui.tileRadius}px`);r.setProperty('--radius-button',`${ui.buttonRadius}px`);r.setProperty('--radius-input',`${ui.inputRadius}px`);r.setProperty('--radius-icon',`${ui.iconRadius}px`);r.setProperty('--radius-hero',`${ui.heroRadius}px`);r.setProperty('--radius-widget',`${ui.widgetRadius}px`);r.setProperty('--radius-modal',`${ui.modalRadius}px`);r.setProperty('--card-padding',`${ui.cardPadding}px`);r.setProperty('--section-gap',`${ui.sectionGap}px`);r.setProperty('--control-height',`${ui.buttonHeight}px`);r.setProperty('--content-width',`${ui.contentWidth}px`);r.setProperty('--discipline-cols',String(ui.disciplineCols));}

function appBackgroundFallbackColor(){return state.settings.theme==='light'?'#f3f4f5':'#050608';}
function appBackgroundThemeColor(base,theme=state.settings.theme){
 const m=/^#([0-9a-f]{6})$/i.exec(String(base||'').trim());if(!m)return appBackgroundFallbackColor();
 const n=parseInt(m[1],16),rgb=[(n>>16)&255,(n>>8)&255,n&255],target=theme==='light'?[255,255,255]:[0,0,0],keep=theme==='light'?.22:.34;
 const out=rgb.map((v,i)=>Math.round(v*keep+target[i]*(1-keep)));
 return '#'+out.map(v=>v.toString(16).padStart(2,'0')).join('');
}
function applyAppBackground(){
 const r=document.documentElement.style,color=String(state.settings.backgroundColor||'').trim(),image=String(state.settings.backgroundImage||'').trim();
 r.setProperty('--app-page-bg-color',color?appBackgroundThemeColor(color):appBackgroundFallbackColor());
 r.setProperty('--app-page-bg-image',image?`url("${image.replace(/"/g,'%22')}")`:'none');
}
function resizeAppBackground(file){
 return new Promise((resolve,reject)=>{
  if(!file)return resolve('');
  if(file.size>12*1024*1024)return reject(new Error('Изображение больше 12 МБ'));
  const reader=new FileReader();reader.onerror=()=>reject(new Error('Не удалось прочитать фон'));
  reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('Не удалось открыть фон'));img.onload=()=>{
   const srcW=Math.max(1,img.naturalWidth),srcH=Math.max(1,img.naturalHeight),maxSide=1600,scale=Math.min(1,maxSide/Math.max(srcW,srcH));
   const outW=Math.max(1,Math.round(srcW*scale)),outH=Math.max(1,Math.round(srcH*scale));
   const canvas=document.createElement('canvas');canvas.width=outW;canvas.height=outH;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,outW,outH);
   let data=canvas.toDataURL('image/webp',.72);if(!data||data==='data:,')data=String(reader.result||'');
   if(data.length>1_200_000)return reject(new Error('Фоновое изображение слишком тяжёлое после обработки'));
   resolve(data);
  };img.src=String(reader.result||'');};reader.readAsDataURL(file);
 });
}
function applySettings(){document.documentElement.dataset.theme=state.settings.theme;document.documentElement.lang=state.settings.lang;const themeMeta=document.querySelector('meta[name="theme-color"]');if(themeMeta)themeMeta.content=state.settings.theme==='light'?'#f3f4f5':'#050608';lapwiz.sound=state.settings.lapSound;applyUiTokens();applyAppBackground();translateStatic();announcer.enabled=state.settings.announcerEnabled;announcer.startMode=state.settings.startVoiceMode;}

function stageLabel(stage){return({setup:'Настройка',qualifying:'Квалификация',tie:'Жеребьёвка',finals:'Финалы',finished:'Завершено'})[stage]||stage;}











function eventItem(race,e,i){const s=eventStatus(race,e),pilots=(e.pilots||[]).length;return `<div class="eventItem ${s}" ${s==='completed'?`data-show-event="${e.key}" style="cursor:pointer"`:''}><div class="top"><b>${i+1}. ${esc(e.label)}</b><span class="eventDot"></span></div><small>${pilots} пилотов · ${s==='completed'?'завершён · нажмите для результата':s==='current'?'текущий':s==='ready'?'готов':'закрыт'}</small></div>`;}



function tieWidget(race){const groups=getExactTieGroups(race);const body=`${groups.map(g=>`<div class="tieLine"><b>${g.map(p=>esc(p.name)).join(' · ')}</b></div>`).join('')}<button class="widgetAction primaryAction" data-action="tie-draw">Провести жеребьёвку и сформировать финалы</button>`;return `<section class="raceWidget"><div class="raceWidgetHead"><span>${uiIcon('refresh','widgetIcon')} ЖЕРЕБЬЁВКА</span><span class="soonTag warnTag">НУЖНО ДЕЙСТВИЕ</span></div><div class="raceWidgetBody">${body}</div></section>`;}



function compactFinalProtocol(race){return race.finalProtocol.slice(0,10).map(r=>`<div class="protocolLine"><span><b>${r.place}</b> ${esc(getPilot(race,r.pilotId)?.name||'—')}</span><strong>${r.eventPoints}</strong></div>`).join('');}

function raceSvg(name,cls='raceSvg'){
 const paths={
  trophy:'<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1a4 4 0 0 0 4 4m8-5h4v1a4 4 0 0 1-4 4M12 12v5m-4 3h8"/>',
  flag:'<path d="M5 21V4"/><path d="M5 5h13l-2.5 4L18 13H5"/>',
  wave:'<path d="M3 12h2l2-5 3 10 3-13 3 16 2-8h3"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 13l3-3M12 5v2"/>',
  bluetooth:'<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
  mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/>',
  chart:'<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  next:'<path d="M4 5l7 7-7 7M12 5l7 7-7 7"/>',
  play:'<path d="M8 5v14l11-7Z"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  plusClock:'<circle cx="10" cy="12" r="7"/><path d="M10 8v4l3 2M17 17h5m-2.5-2.5v5"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>',
  refresh:'<path d="M20 6v5h-5M4 18v-5h5"/><path d="M18 10a7 7 0 0 0-12-3L4 11m2 3a7 7 0 0 0 12 3l2-4"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1-2-4-2 1a7 7 0 0 0-2-1l-.3-2h-5l-.3 2a7 7 0 0 0-2 1l-2-1-2 4 2 1a7 7 0 0 0 0 2l-2 1 2 4 2-1a7 7 0 0 0 2 1l.3 2h5l.3-2a7 7 0 0 0 2-1l2 1 2-4-2-1"/>',
  home:'<path d="M3 11l9-8 9 8v10h-6v-6H9v6H3Z"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  chevron:'<path d="M6 9l6 6 6-6"/>',
  radio:'<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13"/>',
  car:'<path d="M3 15l2-6h14l2 6v4h-2m-14 0H3v-4h18v4h-2M7 19h10"/><circle cx="7" cy="16" r="1.5"/><circle cx="17" cy="16" r="1.5"/>'
 };
 return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.flag}</svg>`;
}

function eventShortLabel(ev){if(!ev)return'—';return ev.label||'Заезд';}

function eventRuleText405(race,ev){if(!ev)return'Нет активного заезда';const r=eventRule(race,ev);return r.limitType==='time'?`${r.durationMin} мин · финиш текущего круга`:`${r.targetLaps} кругов`;}

function nextRaceEvent(race,ev){const all=eventList(race);const i=all.findIndex(x=>x.key===ev?.key);return all.slice(i+1).find(x=>!x.saved)||null;}

function timerTotalMs(ev,s){const r=eventRule(state.race,ev);return r?.limitType==='time'?r.durationMin*60000+(s?.extraMs||0):null;}

function widgetShell(id,title,icon,content,{disabled=false,badge=''}={}){const collapsed=Boolean(state.widgetCollapsed?.[id]);return `<section class="refWidget ${collapsed?'collapsed':''} ${disabled?'disabled':''}" data-widget="${id}"><button class="refWidgetHead" data-toggle-widget="${id}"><span>${raceSvg(icon,'refWidgetIcon')}<b>${title}</b></span><span class="widgetHeadRight">${badge?`<em>${badge}</em>`:''}${raceSvg('chevron','widgetChevron')}</span></button>${collapsed?'':`<div class="refWidgetBody">${content}</div>`}</section>`;}

function nextWidget(race,ev){const n=nextRaceEvent(race,ev);return widgetShell('next','СЛЕДУЮЩИЙ ЗАЕЗД','flag',n?`<div class="nextHeat"><b>${esc(n.label)}</b><span>${(n.pilots||[]).length} пилотов</span><strong>ПОСЛЕ ТЕКУЩЕГО</strong></div>`:`<div class="nextHeat"><b>Финиш соревнования</b><span>Следующих заездов нет</span></div>`,{badge:n?'ГОТОВ':'ФИНИШ'});}

function resultsWidget(race,ev,pilots,session){if(race.stage==='finished')return widgetShell('results','ИТОГ СОРЕВНОВАНИЯ','trophy',compactFinalProtocol(race),{badge:'ГОТОВО'});if(!ev)return'';const draft=makeDraftResult(pilots,session);const edit=draft.map((x,i)=>`<div class="resultEditRow"><div><b>${i+1}. ${esc(x.name)}</b><div class="sub">${x.laps} кр. · ${fmtMs(x.elapsedMs)}</div></div><select data-result-status="${x.pilotId}"><option value="FIN" selected>FIN</option><option value="DNF">DNF</option><option value="DNS">DNS</option><option value="DSQ">DSQ</option></select><input type="number" min="1" value="${i+1}" data-result-place="${x.pilotId}"></div>`).join('');const preview=draft.slice(0,4).map((x,i)=>`<div class="resultPreview"><span>${i+1}</span><b>${esc(x.name)}</b><em>${x.laps} кр.</em></div>`).join('')||'<div class="muted">Пока нет данных</div>';const body=`<div class="resultPreviewList">${preview}</div>${session?.phase==='finished'?`<div class="resultEditor">${edit}</div><button class="miniAction primary full" data-action="save-event-result">Сохранить результат и дальше</button>`:`<button class="miniAction full" data-action="race-results">Открыть таблицы</button>`}`;return widgetShell('results','РЕЗУЛЬТАТЫ ЗАЕЗДА','chart',body,{badge:session?.phase==='finished'?'ГОТОВО':'LIVE'});}

function eventDrawer(race,events){return `<div class="eventDrawer ${state.mobileEvents?'open':''}"><button class="eventDrawerBackdrop" data-action="close-events" aria-label="Закрыть"></button><aside><div class="eventDrawerHead"><div><span>ХОД СОРЕВНОВАНИЯ</span><b>${esc(race.eventName)}</b></div><button class="squareConsoleBtn" data-action="close-events">×</button></div><div class="eventDrawerList">${events.map((e,i)=>eventItem(race,e,i)).join('')}</div></aside></div>`;}





function displayTimer(s,ev){
  if(!ev||!s)return'00:00';
  if(['warmup','countdown'].includes(s.phase)){
    const ms=warmupRemainingMs(s);
    if(s.phase==='countdown')return `00:${String(Math.max(0,Math.ceil(ms/1000))).padStart(2,'0')}`;
    return fmtClock(ms);
  }
  if(s.phase==='finished')return'00:00';
  const r=eventRule(state.race,ev),elapsed=sessionElapsed(s);
  if(r.limitType==='time')return fmtClock((r.durationMin*60000+(s.extraMs||0))-elapsed);
  return fmtClock(elapsed);
}

function timerProgress(s,ev){
  if(!ev||!s)return 100;
  if(['warmup','countdown'].includes(s.phase)){
    const total=Math.max(1000,(s.warmupTotalSec||raceWarmupMinutes()*60)*1000);
    return Math.max(0,Math.min(100,warmupRemainingMs(s)/total*100));
  }
  const r=eventRule(state.race,ev);
  if(r.limitType==='time'){
    const total=r.durationMin*60000+(s.extraMs||0);
    return Math.max(0,Math.min(100,(total-sessionElapsed(s))/total*100));
  }
  if(r.limitType==='laps'){
    const vals=Object.values(s.live||{}),max=Math.max(0,...vals.map(v=>v.laps||0));
    return Math.max(0,Math.min(100,max/(r.targetLaps||1)*100));
  }
  return 100;
}

function timerSubline(s,ev){
  if(!ev)return'—';
  if(['warmup','countdown'].includes(s?.phase))return `Проверка транспондеров · обнаружено ${warmupSeenCount(s)} / ${getEventPilots(state.race,ev).length}`;
  return eventRuleText405(state.race,ev);
}

function statsWidget(race,ev,pilots,s){
  if(['warmup','countdown'].includes(s?.phase)){
    return widgetShell('stats','ПРОВЕРКА ПЕРЕД СТАРТОМ','chart',`<div class="statGrid statsWidgetContent"><div><span>ОБНАРУЖЕНО</span><b>${warmupSeenCount(s)} / ${pilots.length}</b></div><div><span>РЕЖИМ LAPWIZ</span><b>FREE PRACTICE</b></div><div><span>ПОСЛЕДНИЙ ПРОХОД</span><b>${esc(s?.lastPass||'—')}</b></div><div><span>ДО СТАРТА</span><b>${displayTimer(s,ev)}</b></div></div>`);
  }
  const leader=pilots[0],ll=leader?s?.live?.[leader.id]:null,target=eventRule(race,ev)?.targetLaps||'—';
  return widgetShell('stats','СТАТИСТИКА ЗАЕЗДА','chart',`<div class="statGrid statsWidgetContent"><div><span>ЛИДЕР</span><b>${esc(leader?.name||'—')}</b></div><div><span>КРУГИ ЛИДЕРА</span><b>${ll?.laps||0}${target!=='—'?` / ${target}`:''}</b></div><div><span>ПОСЛЕДНИЙ ПРОХОД</span><b>${esc(s?.lastPass||'—')}</b></div><div><span>ПИЛОТОВ</span><b>${pilots.length}</b></div></div>`);
}

function lapwizWidget(){
  const mode=lapwiz.running?(lapwiz.currentMode==='practice'?'FREE PRACTICE':'RUNNING'):'STOPPED';
  return widgetShell('lapwiz','LAPWIZ ПОДКЛЮЧЕНИЕ','bluetooth',`<div class="kvList"><div><span>Устройство:</span><b class="accentGreen">${esc(lapwiz.device?.name||'—')}</b></div><div><span>Bluetooth:</span><b>${lapwiz.connected?'стабильно':'не подключён'}</b></div><div><span>Режим:</span><b>${mode}</b></div><div><span>Звук прохода:</span><b>${state.settings.lapSound?'ВКЛ':'ВЫКЛ'}</b></div></div><div class="widgetActions">${lapwiz.connected?`<button class="miniAction" data-action="lap-disconnect">Отключить</button>`:`<button class="miniAction primary" data-action="lap-connect">Подключить</button>`}</div>`,{badge:lapwiz.connected?'ONLINE':'OFFLINE'});
}

function announcerWidget(){
  const warm=raceWarmupMinutes(),from=Math.max(1,state.race?.raceSettings?.countdownSec||state.settings.countdownSec||10);
  const seq=`«Хорошей гонки» → ${from}…1 → HORN`;
  const body=`<div class="statsWidgetContent"><div><span>ДИКТОР</span><b>${state.settings.announcerEnabled?'ВКЛ':'ВЫКЛ'}</b></div><div><span>ПРОГРЕВ</span><b>${warm} МИН</b></div><div><span>СТАРТ</span><b>${esc(seq)}</b></div><div><span>БЛИП ЗАСЕЧКИ</span><b>${state.settings.lapSound?'ВКЛ':'ВЫКЛ'}</b></div></div>`;
  return widgetShell('announcer','ГОЛОСОВОЕ СОПРОВОЖДЕНИЕ','mic',body,{badge:state.settings.announcerEnabled?'ГОТОВ':'ВЫКЛ'});
}

function automationWidget(){
  return widgetShell('automation','ПРЕДСТАРТОВАЯ АВТОМАТИКА','timer',`<div class="nextHeat"><b>${raceWarmupMinutes()} мин до HORN</b><span>Free Practice → проверка → 30 сек → стартовый сценарий</span><strong>РАБОТАЕТ</strong></div>`,{badge:'ACTIVE'});
}


function rxnLapAvg(l){return lapSummary(l).avg;}




function rxnRingData(race,ev,pilots,s){
 const pre=['warmup','countdown'].includes(s?.phase),rule=ev?eventRule(race,ev):null,leader=pilots?.[0],ll=leader?s?.live?.[leader.id]:null;
 if(pre)return{main:`${warmupSeenCount(s)}/${pilots.length}`,sub:'НА ТРАССЕ'};
 if(rule?.limitType==='laps')return{main:`${ll?.laps||0}/${rule.targetLaps||0}`,sub:'КРУГОВ'};
 return{main:String(ll?.laps||0),sub:'КРУГОВ ЛИДЕРА'};
}








function quickPanelDrawer(race,ev,pilots,session,done){
 const kind=state.quickPanel;if(!kind)return'';let title='ПАНЕЛЬ',body='';
 if(kind==='lapwiz'){title='LAPWIZ';body=`<div class="quickPanelHint">Подключение, режим и состояние засечки.</div>${lapwizWidget()}`;}
 else if(kind==='announcer'){title='ДИКТОР';body=`<div class="quickPanelHint">Стартовый сценарий, голос и звук прохождения.</div>${announcerWidget()}`;}
 else if(kind==='status'){title='СОСТОЯНИЕ ЗАЕЗДА';body=`${done?widgetShell('statsQuick','СОРЕВНОВАНИЕ','trophy',compactFinalProtocol(race),{badge:'ФИНИШ'}):statsWidget(race,ev,pilots,session)}${automationWidget()}`;}
 else if(kind==='results'){title='РЕЗУЛЬТАТЫ';body=done?widgetShell('resultsQuick','ИТОГ СОРЕВНОВАНИЯ','trophy',compactFinalProtocol(race),{badge:'ГОТОВО'}):resultsWidget(race,ev,pilots,session);}
 else if(kind==='next'){title='СЛЕДУЮЩИЙ ЗАЕЗД';body=`${nextWidget(race,ev)}`;}
 else if(kind==='events'){title='ХОД СОРЕВНОВАНИЯ';body=`${eventFlowStrip(race,eventList(race),ev)}`;}
 else if(kind==='menu'){title='МЕНЮ ПУЛЬТА';body=`<div class="quickPanelMenuGrid"><button data-quick-panel="events">${raceSvg('list')}<span>Ход соревнования</span></button><button data-action="race-results">${raceSvg('chart')}<span>Все таблицы</span></button><button data-nav="pilots">${raceSvg('trophy')}<span>Пилоты</span></button><button data-track-action="open">${raceSvg('timer')}<span>Track Day</span></button><button data-action="open-settings">${raceSvg('settings')}<span>Настройки</span></button><button data-action="home">${raceSvg('home')}<span>Главная</span></button></div>`;}
 else return'';
 return `<div class="quickPanelOverlay"><button class="quickPanelBackdrop" data-quick-panel-close="1" aria-label="Закрыть"></button><aside class="quickPanelDrawer"><div class="quickPanelHead"><div><small>БЫСТРАЯ ПАНЕЛЬ</small><b>${title}</b></div><button class="squareConsoleBtn" data-quick-panel-close="1">×</button></div><div class="quickPanelBody">${body}</div></aside></div>`;
}



function eventFlowStrip(race,events,ev){const ci=Math.max(0,events.findIndex(e=>e.key===ev?.key));const start=Math.max(0,Math.min(ci-1,Math.max(0,events.length-5)));const visible=events.slice(start,start+5);return `<div class="eventFlow"><button class="flowMenu" data-action="toggle-events">${raceSvg('list')}<span>События</span></button><div class="flowItems">${visible.map(e=>{const st=eventStatus(race,e);return `<button class="flowItem ${st}" ${(st==='completed'||st==='cancelled')?`data-show-event="${e.key}"`:''} ${st==='locked'?'disabled':''}><span class="flowDot"></span><b>${esc(e.label)}</b><small>${st==='cancelled'?'отменён':st==='completed'?'готово':st==='current'?'сейчас':st==='ready'?'далее':'закрыт'}</small></button>`;}).join('')}</div><button class="flowResults" data-action="race-results">${raceSvg('chart')}<span>Все результаты</span></button></div>`;}
