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

function pilotNameMarkup(p){const code=pilotCountryCode(p),flag=countryFlag(code);return `<span class="pilotNameLine">${flag?`<span class="countryFlag" style="--country-flag-position:${flag}" title="${esc(countryName(code))}" role="img" aria-label="${esc(countryName(code))}">${esc(code)}</span>`:''}<span>${esc(p?.name||'—')}</span></span>`;}

function pilotMetaMarkup(p,{showId=true}={}){const club=pilotClubName(p),city=p?.city||profileForPilot(p)?.city||'';const chunks=[];if(club)chunks.push(clubMarkup(club,''));if(city)chunks.push(esc(city));if(showId)chunks.push(`ID ${esc(p?.transponder||'—')}`);return chunks.filter(Boolean).join('<span class="metaDot">·</span>');}

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

function applySettings(){document.documentElement.dataset.theme=state.settings.theme;document.documentElement.lang=state.settings.lang;lapwiz.sound=state.settings.lapSound;applyUiTokens();translateStatic();announcer.enabled=state.settings.announcerEnabled;announcer.startMode=state.settings.startVoiceMode;}

function stageLabel(stage){return({setup:'Настройка',qualifying:'Квалификация',tie:'Жеребьёвка',finals:'Финалы',finished:'Завершено'})[stage]||stage;}

function clockNow(){return new Date().toLocaleTimeString('ru-RU',{hour12:false});}

function phaseStatusText(s){const p=s?.phase||'ready';return p==='running'?'Заезд идёт':p==='finishing'?'Финишируем':p==='countdown'?'Отсчёт':p==='paused'?'Пауза':p==='finished'?'Заезд завершён':'Готовность';}

function nextEventAfter(race,ev){const all=eventList(race);if(!ev)return all.find(e=>!e.saved)||null;const i=all.findIndex(e=>e.key===ev.key);return all.slice(i+1).find(e=>!e.saved)||null;}

function raceBoardFooter(pilots,session){if(!session||!pilots.length)return `<span>${uiIcon('chart','miniIcon')} Ожидание старта</span><span>LapWiz / ручной резерв готовы</span>`;const ranked=liveRanking(pilots,session),leader=ranked[0],l=leader?session.live?.[leader.id]:null;const best=ranked.map(p=>({p,l:session.live?.[p.id]})).filter(x=>Number.isFinite(x.l?.bestLapMs)).sort((a,b)=>a.l.bestLapMs-b.l.bestLapMs)[0];return `<span>${uiIcon('chart','miniIcon')} Лучший круг: <b>${best?`${esc(best.p.name)} — ${fmtMs(best.l.bestLapMs)}`:'—'}</b></span><span>Последний проход: <b>${esc(session.lastPass||'—')}</b></span>`;}

function timerCard(race,ev,s,done,tie){const r=ev?eventRule(race,ev):null;const cap=done?'ФИНИШ':tie?'ЖЕРЕБЬЁВКА':timerCaption(s,ev);const timer=done||tie?'00:00':displayTimer(s,ev);const total=r?.limitType==='time'?`${r.durationMin + (s?.extraMinutes||0)}:00`:r?.limitType==='laps'?`${r.targetLaps} кругов`:'—';const canStart=ev&&s?.phase==='ready';return `<section class="timerCard refPanel"><div class="timerLabel">${cap}</div><div class="timerBody"><div><div id="mainTimer" class="heroTimer">${timer}</div><div class="timerTotal">${r?.limitType==='time'?'ЗАЕЗД ':''}${total}</div>${canStart?`<button class="timerStart" data-action="start-session">${uiIcon('play','miniIcon')} СТАРТ</button>`:''}</div><div id="timerRing" class="timerRing" style="--progress:${timerProgress(s,ev)}"></div></div></section>`;}

function raceStatsCard(race,ev,pilots,s){const ranked=s?liveRanking(pilots,s):pilots,leader=ranked[0],ll=leader&&s?.live?.[leader.id];const rule=ev?eventRule(race,ev):null;return `<section class="statsCard refPanel"><div class="refPanelHead compact"><h3>${uiIcon('users','panelTitleIcon')} СТАТИСТИКА ЗАЕЗДА</h3></div><div class="statsGrid"><div>${uiIcon('flag','statIcon')}<span>ЛИДЕР</span><b>${esc(leader?.name||'—')}</b></div><div>${uiIcon('refresh','statIcon')}<span>ПРОШЛО КРУГОВ</span><b>${ll?.laps||0}${rule?.limitType==='laps'?` / ${rule.targetLaps}`:''}</b></div><div>${uiIcon('clock','statIcon')}<span>ПОСЛЕДНИЙ ПРОХОД</span><b>${s?.lastPass?esc(s.lastPass.split(' · ')[0]):'—'}</b></div><div>${uiIcon('timer','statIcon')}<span>РЕЖИМ</span><b>${rule?.limitType==='time'?`${rule.durationMin+(s?.extraMinutes||0)} мин`:`${rule?.targetLaps||0} кругов`}</b></div></div></section>`;}

function voiceWidget(){return collapsibleWidget('voice',`${uiIcon('speaker','widgetIcon')} ГОЛОСОВОЕ СОПРОВОЖДЕНИЕ`,`<div class="futureLines"><div><time>START</time><span>Отсчёт: ${state.settings.countdownSec}…1 → HORN</span></div><div><time>VOICE</time><span>Диктор: ${state.settings.announcerEnabled?'ВКЛ':'ВЫКЛ'}</span></div></div>`,false);}

function eventsWidget(race,events,ev){const curIndex=events.findIndex(e=>e.key===ev?.key);const shown=events.filter((e,i)=>e.saved||Math.abs(i-curIndex)<=2).slice(-6);const body=`<div class="eventMiniList">${shown.map(e=>{const st=eventStatus(race,e);return `<button class="eventMini ${st}" ${e.saved?`data-show-event="${e.key}"`:''} ${e.saved?'':'disabled'}><span class="eventMiniDot"></span><span><b>${esc(e.label)}</b><small>${st==='completed'?'завершён':st==='current'?'сейчас':st==='ready'?'готов':'закрыт'}</small></span></button>`;}).join('')}</div>`;return collapsibleWidget('events',`${uiIcon('list','widgetIcon')} ХОД СОРЕВНОВАНИЯ`,body,false);}

function nextEventWidget(race,next){const body=next?`<div class="nextHeatBig"><b>${esc(next.label)}</b><span>${(next.pilots||[]).length} пилотов</span><strong>${uiIcon('timer','nextClockIcon')} СЛЕДУЮЩИЙ</strong></div>`:`<div class="nextHeatBig"><b>Нет следующего заезда</b><span>Текущий этап завершается</span></div>`;return collapsibleWidget('next',`${uiIcon('flag','widgetIcon')} СЛЕДУЮЩИЙ ЗАЕЗД`,body,false);}

function collapsibleWidget(key,title,body,disabled=false){const collapsed=Boolean(state.widgetCollapsed[key]);return `<section class="raceWidget ${disabled?'futureWidget':''} ${collapsed?'collapsed':''}"><button class="raceWidgetHead" type="button" ${disabled?'disabled':`data-widget-toggle="${key}"`}><span>${title}</span>${disabled?'<span class="soonTag">СКОРО</span>':uiIcon('chevronDown','collapseIcon')}</button><div class="raceWidgetBody">${body}</div></section>`;}

function eventItem(race,e,i){const s=eventStatus(race,e),clickable=(s==='completed'||s==='cancelled'),title=esc(e.label||eventShortLabel(e)),badges=rxnEventBadgeMarkup(e);return `<div class="eventItem ${s}" ${clickable?`data-show-event="${e.key}" style="cursor:pointer"`:''}><div class="eventItemRow"><strong>${i+1}</strong><b>${title}</b><div class="eventItemBadges">${badges}</div></div></div>`;}

function eventRuleText(race,ev){if(!ev)return'Нет активного события';const r=eventRule(race,ev);return r.limitType==='time'?`По времени · ${r.durationMin} мин · финиш текущего круга`:`По кругам · ${r.targetLaps} кругов`;}

function gapText(ranked,session,p,index){if(!session||index===0)return index===0?'Лидер':'—';const leader=session.live?.[ranked[0].id]||blankLive(),r=session.live?.[p.id]||blankLive();if(leader.laps-r.laps>0)return `+${leader.laps-r.laps} кр.`;if(r.elapsedMs&&leader.elapsedMs)return `+${fmtMs(Math.max(0,r.elapsedMs-leader.elapsedMs))}`;return'—';}

function tieWidget(race){const groups=getExactTieGroups(race);const body=`${groups.map(g=>`<div class="tieLine"><b>${g.map(p=>esc(p.name)).join(' · ')}</b></div>`).join('')}<button class="widgetAction primaryAction" data-action="tie-draw">Провести жеребьёвку и сформировать финалы</button>`;return `<section class="raceWidget"><div class="raceWidgetHead"><span>${uiIcon('refresh','widgetIcon')} ЖЕРЕБЬЁВКА</span><span class="soonTag warnTag">НУЖНО ДЕЙСТВИЕ</span></div><div class="raceWidgetBody">${body}</div></section>`;}

function qualifyingStandingsTable(race){updateStandings(race);return `<div class="pilotRow header"><span>POS</span><span>ПИЛОТ</span><span>BEST 3</span><span>Q-РЕЗУЛЬТАТЫ</span><span></span><span></span><span>СТАТУС</span></div>${race.pilots.map((p,i)=>`<div class="pilotRow"><div class="pos">${i+1}</div><div class="pilotNameCell"><div class="name">${pilotNameMarkup(p)}</div><div class="sub">${pilotClubName(p)?clubMarkup(pilotClubName(p),''):''}</div></div><b class="bestLap">${p.best3}</b><span style="grid-column:4/7">${(p.qualifying||[]).map(q=>q.status==='FIN'?`${q.place} (${q.points})`:q.status).join(' · ')||'—'}</span><span class="pilotStatus"><i></i>Рейтинг</span></div>`).join('')}`;}

function finalProtocolTable(race){if(!race.finalProtocol?.length)return'<div class="empty">Финальный протокол ещё не сформирован.</div>';return `<div class="pilotRow header"><span>POS</span><span>ПИЛОТ</span><span>ОЧКИ</span><span>ИСТОЧНИК</span><span></span><span></span><span>СТАТУС</span></div>${race.finalProtocol.map(r=>{const p=getPilot(race,r.pilotId);return `<div class="pilotRow"><div class="pos">${r.place}</div><div class="pilotNameCell"><div class="name">${pilotNameMarkup(p)}</div><div class="sub">${pilotClubName(p)?clubMarkup(pilotClubName(p),''):''}</div></div><b class="bestLap">${r.eventPoints}</b><span style="grid-column:4/7">${esc(r.source)}</span><span class="pilotStatus"><i></i>${esc(r.status||'FIN')}</span></div>`;}).join('')}`;}

function compactFinalProtocol(race){return race.finalProtocol.slice(0,10).map(r=>`<div class="protocolLine"><span><b>${r.place}</b> ${esc(getPilot(race,r.pilotId)?.name||'—')}</span><strong>${r.eventPoints}</strong></div>`).join('');}

function raceSvg(name,cls='raceSvg'){
 const paths={
  trophy:'<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1a4 4 0 0 0 4 4m8-5h4v1a4 4 0 0 1-4 4M12 12v5m-4 3h8"/>',
  flag:'<path d="M5 21V4"/><path d="M5 5h13l-2.5 4L18 13H5"/>',
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
 return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.flag}</svg>`;
}

function eventShortLabel(ev){if(!ev)return'—';return ev.label||'Заезд';}


function rxnEventBadgeParts(ev){
  const raw=String(r428CompactHeatLabel(ev)||'').replace(/\s+/g,' ').trim();
  if(!raw)return[];
  return raw.split(/\s*[·•]\s*/).map(x=>x.trim()).filter(Boolean);
}
function rxnEventBadgeMarkup(ev){
  return rxnEventBadgeParts(ev).map(part=>`<span class="rxnEventBadge">${esc(part)}</span>`).join('');
}

function eventRuleText405(race,ev){if(!ev)return'Нет активного заезда';const r=eventRule(race,ev);return r.limitType==='time'?`${r.durationMin} мин · финиш текущего круга`:`${r.targetLaps} кругов`;}

function nextRaceEvent(race,ev){const all=eventList(race);const i=all.findIndex(x=>x.key===ev?.key);return all.slice(i+1).find(x=>!x.saved)||null;}

function timerTotalMs(ev,s){const r=eventRule(state.race,ev);return r?.limitType==='time'?r.durationMin*60000+(s?.extraMs||0):null;}

function widgetShell(id,title,icon,content,{disabled=false,badge=''}={}){const collapsed=Boolean(state.widgetCollapsed?.[id]);return `<section class="refWidget ${collapsed?'collapsed':''} ${disabled?'disabled':''}" data-widget="${id}"><button class="refWidgetHead" data-toggle-widget="${id}"><span>${raceSvg(icon,'refWidgetIcon')}<b>${title}</b></span><span class="widgetHeadRight">${badge?`<em>${badge}</em>`:''}${raceSvg('chevron','widgetChevron')}</span></button>${collapsed?'':`<div class="refWidgetBody">${content}</div>`}</section>`;}

function nextWidget(race,ev){const n=nextRaceEvent(race,ev);return widgetShell('next','СЛЕДУЮЩИЙ ЗАЕЗД','flag',n?`<div class="nextHeat"><b>${esc(n.label)}</b><span>${(n.pilots||[]).length} пилотов</span><strong>ПОСЛЕ ТЕКУЩЕГО</strong></div>`:`<div class="nextHeat"><b>Финиш соревнования</b><span>Следующих заездов нет</span></div>`,{badge:n?'ГОТОВ':'ФИНИШ'});}

function resultsWidget(race,ev,pilots,session){if(race.stage==='finished')return widgetShell('results','ИТОГ СОРЕВНОВАНИЯ','trophy',compactFinalProtocol(race),{badge:'ГОТОВО'});if(!ev)return'';const draft=makeDraftResult(pilots,session);const edit=draft.map((x,i)=>`<div class="resultEditRow"><div><b>${i+1}. ${esc(x.name)}</b><div class="sub">${x.laps} кр. · ${fmtMs(x.elapsedMs)}</div></div><select data-result-status="${x.pilotId}"><option value="FIN" selected>FIN</option><option value="DNF">DNF</option><option value="DNS">DNS</option><option value="DSQ">DSQ</option></select><input type="number" min="1" value="${i+1}" data-result-place="${x.pilotId}"></div>`).join('');const preview=draft.slice(0,4).map((x,i)=>`<div class="resultPreview"><span>${i+1}</span><b>${esc(x.name)}</b><em>${x.laps} кр.</em></div>`).join('')||'<div class="muted">Пока нет данных</div>';const body=`<div class="resultPreviewList">${preview}</div>${session?.phase==='finished'?`<div class="resultEditor">${edit}</div><button class="miniAction primary full" data-action="save-event-result">Сохранить результат и дальше</button>`:`<button class="miniAction full" data-action="race-results">Открыть таблицы</button>`}`;return widgetShell('results','РЕЗУЛЬТАТЫ ЗАЕЗДА','chart',body,{badge:session?.phase==='finished'?'ГОТОВО':'LIVE'});}

function eventDrawer(race,events){return `<div class="eventDrawer ${state.mobileEvents?'open':''}"><button class="eventDrawerBackdrop" data-action="close-events" aria-label="Закрыть"></button><aside><div class="eventDrawerHead"><div><span>ХОД СОРЕВНОВАНИЯ</span><b>${esc(race.eventName)}</b></div><button class="squareConsoleBtn" data-action="close-events">×</button></div><div class="eventDrawerList">${events.map((e,i)=>eventItem(race,e,i)).join('')}</div></aside></div>`;}

function bestHeatLapText(pilots,s){let best=null,name='';for(const p of pilots){const l=s?.live?.[p.id];if(Number.isFinite(l?.bestLapMs)&&(!best||l.bestLapMs<best)){best=l.bestLapMs;name=p.name;}}return best?`${name} · ${fmtMs(best)}`:'—';}

function phaseLabel(s){const p=s?.phase||'ready';return p==='warmup'?'Прогрев / проверка':p==='countdown'?'Стартовый отсчёт':p==='running'?'Заезд идёт':p==='finishing'?'Финишный круг':p==='paused'?'Пауза':p==='finished'?'Заезд завершён':'Готовность';}

function phaseClass(s){return ['running','finishing'].includes(s?.phase)?'live':['warmup','countdown','paused'].includes(s?.phase)?'warn':'neutral';}

function timerCaption(s,ev){if(!ev)return'ГОТОВО';if(s?.phase==='warmup')return'ДО СТАРТА · ПРОГРЕВ';if(s?.phase==='countdown')return'ДО СТАРТА';if(s?.phase==='paused')return'ПАУЗА';if(['running','finishing'].includes(s?.phase))return eventRule(state.race,ev).limitType==='time'?'ДО ФИНИША':'ВРЕМЯ ЗАЕЗДА';if(s?.phase==='finished')return'ЗАЕЗД ЗАВЕРШЁН';return'ГОТОВНОСТЬ';}

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

function r425Date(value){if(!value)return'';const p=String(value).split('-');return p.length===3?`${p[2]}.${p[1]}.${p[0]}`:String(value);}

function r425LapAvg(l){return lapSummary(l).avg;}

function r425GlobalBest(pilots,session){let best=Infinity;for(const p of pilots){const v=session?.live?.[p.id]?.bestLapMs;if(Number.isFinite(v))best=Math.min(best,v);}return Number.isFinite(best)?best:null;}

function r425Pace(best,globalBest){if(!Number.isFinite(best)||!Number.isFinite(globalBest)||best<=0)return 0;return Math.max(18,Math.min(100,globalBest/best*100));}

function r425PilotState(session,l,pilotId,index,pre,leaderLaps=0){
 let text='ГОТОВ',cls='';
 if(pre){if(session?.warmupDetected?.[pilotId]){text='НА ТРАССЕ';cls='green';}else{text='ОЖИДАЕТСЯ';cls='amber';}}
 else if(l.finished){text='ФИНИШ';cls='blue';}
 else if(['running','finishing'].includes(session?.phase)&&!l.startSeen){text='ЖДЁМ ЗАСЕЧКУ';cls='amber';}
 else if(['running','finishing'].includes(session?.phase)&&l.startSeen&&l.laps===0){text='СТАРТ ✓';cls='blue';}
 else if(index===0&&l.laps>0){text='ЛИДЕР';cls='green';}
 else if(['running','finishing'].includes(session?.phase)&&leaderLaps>0&&l.laps<leaderLaps){text='ОТСТАЁТ';cls='amber';}
 else if(['running','finishing'].includes(session?.phase)){text='В ГОНКЕ';cls='green';}
 else if(session?.phase==='paused'){text='ПАУЗА';cls='amber';}
 return {text,cls};
}

function r425RingData(race,ev,pilots,s){
 const pre=['warmup','countdown'].includes(s?.phase),rule=ev?eventRule(race,ev):null,leader=pilots?.[0],ll=leader?s?.live?.[leader.id]:null;
 if(pre)return{main:`${warmupSeenCount(s)}/${pilots.length}`,sub:'НА ТРАССЕ'};
 if(rule?.limitType==='laps')return{main:`${ll?.laps||0}/${rule.targetLaps||0}`,sub:'КРУГОВ'};
 return{main:String(ll?.laps||0),sub:'КРУГОВ ЛИДЕРА'};
}

function r425TimerStats(race,ev,pilots,s){const leader=pilots?.[0],l=leader?s?.live?.[leader.id]:null,avg=r425LapAvg(l||blankLive()),rule=ev?eventRule(race,ev):null;return{best:fmtMs(l?.bestLapMs),avg:fmtMs(avg),laps:`${l?.laps||0}${rule?.limitType==='laps'?` / ${rule.targetLaps||0}`:''}`};}

function r425Header(race,ev,s){
 const phase=phaseLabel(s),phaseCls=phaseClass(s)==='live'?'live':phaseClass(s)==='warn'?'warn':'blue';
 const phaseSmall=['warmup','countdown'].includes(s?.phase)?displayTimer(s,ev):phase;
 return `<header class="rally425Header" data-layout-panel="header"><button class="raceBrand" data-action="home"><strong>LEGION <i>RX</i></strong><small>RallyCross · Live Heat</small></button><div class="r425HeaderMeta"><div class="r425MetaCell">${raceSvg('trophy')}<div><b>${esc(race.eventName)}</b><small>${r425Date(race.eventDate)||'СОБЫТИЕ'}</small></div></div><div class="r425MetaCell">${raceSvg('flag')}<div><b>${esc(race.className||'Rally-10')}</b><small>КЛАСС</small></div></div><div class="r425MetaCell">${raceSvg('flag')}<div><b>${esc(eventShortLabel(ev))}</b><small>ЗАЕЗД</small></div></div><div class="r425Clock"><b id="cockpitClock">${new Date().toLocaleTimeString('ru-RU',{hour12:false})}</b><small>ВРЕМЯ</small></div></div><div class="r425TopActions"><button class="r425TopBtn ${lapwiz.connected?'ok':''}" data-quick-panel="lapwiz" title="LapWiz · ${lapwiz.connected?'подключён':'не подключён'}">${raceSvg('bluetooth')}<b>LapWiz</b><small>${lapwiz.connected?'ПОДКЛЮЧЕН':'OFFLINE'}</small></button><button class="r425TopBtn ${state.settings.announcerEnabled?'ok':''}" data-quick-panel="announcer" title="Диктор">${raceSvg('mic')}<b>ДИКТОР</b><small>${state.settings.announcerEnabled?'ВКЛ':'ВЫКЛ'}</small></button><button class="r425TopBtn ${phaseCls}" data-quick-panel="status" title="${esc(phase)}">${raceSvg('flag')}<b>${['warmup','countdown'].includes(s?.phase)?'РАЗМИНКА':'СТАТУС'}</b><small>${esc(phaseSmall)}</small></button><button class="r425TopBtn" data-race-skip-current="1" title="Пропустить текущий заезд">${raceSvg('next')}<b>ПРОПУСТИТЬ</b><small>ЗАЕЗД</small></button><button class="r425TopBtn dangerSoft" data-race-manage="open" title="Отмена / завершение">${raceSvg('stop')}<b>ЗАВЕРШИТЬ</b><small>ЗАЕЗДЫ</small></button><button class="r425TopBtn iconOnly" data-action="open-settings" title="Настройки">${raceSvg('settings')}</button><button class="r425TopBtn iconOnly" data-quick-panel="menu" title="Меню">${raceSvg('list')}</button></div></header>`;
}

function r425ControlButton(id,cls,attrs,icon,title,sub=''){return `<button class="r425Control ${cls||''}" data-layout-panel="${id}" ${attrs||''}>${raceSvg(icon)}<span><b>${title}</b>${sub?`<small>${sub}</small>`:''}</span></button>`;}

function r425ControlGrid(done,s,tie=false){
 if(tie)return `<div class="r425Controls">${r425ControlButton('ctl-primary','blue','data-action="race-results"','chart','ТАБЛИЦА')}${r425ControlButton('ctl-pause','','disabled','pause','ПАУЗА')}${r425ControlButton('ctl-finish','','disabled','flag','ФИНИШ')}${r425ControlButton('ctl-plus','','disabled','plusClock','+1 МИН')}${r425ControlButton('ctl-manual','primary','data-action="tie-draw"','refresh','ЖЕРЕБЬЁВКА')}${r425ControlButton('ctl-stop','danger','data-action="home"','stop','ВЫХОД')}</div>`;
 if(done)return `<div class="r425Controls">${r425ControlButton('ctl-primary','blue','data-action="race-results"','chart','РЕЗУЛЬТАТЫ')}${r425ControlButton('ctl-pause','','data-action="home"','home','ГЛАВНАЯ')}${r425ControlButton('ctl-finish','','data-action="open-rx"','settings','НАСТРОЙКА')}${r425ControlButton('ctl-plus','','disabled','plusClock','+1 МИН')}${r425ControlButton('ctl-manual','','disabled','refresh','РУЧНОЙ КРУГ')}${r425ControlButton('ctl-stop','danger','data-action="complete-competition"','stop','ЗАВЕРШИТЬ')}</div>`;
 const p=s?.phase||'ready',timeRule=eventRule(state.race,currentEvent(state.race))?.limitType==='time';
 let primary;if(p==='ready')primary=r425ControlButton('ctl-primary','primary','data-action="start-session"','play','СТАРТ','ПРОГРЕВ');else if(p==='paused')primary=r425ControlButton('ctl-primary','primary','data-action="pause-session"','play','ПРОДОЛЖИТЬ');else if(p==='finished')primary=r425ControlButton('ctl-primary','blue','data-action="next-event"','next','СЛЕДУЮЩИЙ');else primary=r425ControlButton('ctl-primary','primary','disabled','play','ЗАЕЗД ИДЁТ');
 return `<div class="r425Controls">${primary}${r425ControlButton('ctl-pause','','data-action="pause-session" '+(!['running','finishing'].includes(p)?'disabled':''),'pause','ПАУЗА')}${r425ControlButton('ctl-finish','','data-action="finish-session" '+(!['running','finishing','paused'].includes(p)?'disabled':''),'flag','ФИНИШ')}${r425ControlButton('ctl-plus','blue','data-action="add-minute" '+(!timeRule||!['running','paused','finishing'].includes(p)?'disabled':''),'plusClock','+1 МИН','ДОБАВИТЬ ВРЕМЯ')}${r425ControlButton('ctl-manual','blue','data-action="manual-lap-modal" '+(!['running','finishing'].includes(p)?'disabled':''),'refresh','РУЧНОЙ КРУГ')}${r425ControlButton('ctl-stop','danger','data-action="stop-session" '+(!['warmup','countdown','running','finishing','paused'].includes(p)?'disabled':''),'stop','СТОП')}</div>`;
}

function r425QuickRows(race,ev,s){const n=nextRaceEvent(race,ev);return `<div class="r425QuickStack"><button class="r425QuickRow" data-quick-panel="next" title="Следующий заезд">${raceSvg('flag')}<b>СЛЕДУЮЩИЙ ЗАЕЗД</b><em>${n?esc(eventShortLabel(n)):'ФИНИШ'}</em>${raceSvg('chevron','widgetChevron')}</button></div>`;}

function r428CompactHeatLabel(ev){if(!ev)return'—';return String(eventShortLabel(ev)).replace(/Квалификация\s*(\d+)/ig,'Q$1').replace(/Заезд\s*(\d+)/ig,'З$1').replace(/\s*[·•]\s*/g,' · ');}

function r428RaceStrip(race,ev,s){const n=nextRaceEvent(race,ev),cur=r428CompactHeatLabel(ev),next=n?r428CompactHeatLabel(n):'ФИНИШ',phase=phaseLabel(s);return `<footer class="r428RaceStrip" data-layout-panel="race-strip"><button class="r428StripCell r428Flow" data-quick-panel="events" title="Ход соревнования">${raceSvg('list')}<span><small>ХОД ГОНКИ</small><b id="r428FlowPhase">${esc(phase)}</b></span></button><div class="r428StripCell r428Current">${raceSvg('flag')}<span><small>СЕЙЧАС</small><b>${esc(cur)}</b></span></div><button class="r428StripCell r428Next" data-quick-panel="next" title="Следующий заезд">${raceSvg('next')}<span><small>ДАЛЕЕ</small><b>${esc(next)}</b></span></button><button class="r428StripCell r428Results" data-action="race-results" title="Результаты">${raceSvg('chart')}<span><small>ТАБЛИЦЫ</small><b>РЕЗУЛЬТАТЫ</b></span></button></footer>`;}

function quickPanelDrawer(race,ev,pilots,session,done){
 const kind=state.quickPanel;if(!kind)return'';let title='ПАНЕЛЬ',body='';
 if(kind==='lapwiz'){title='LAPWIZ';body=`<div class="quickPanelHint">Подключение, режим и состояние засечки.</div>${lapwizWidget()}`;}
 else if(kind==='announcer'){title='ДИКТОР';body=`<div class="quickPanelHint">Стартовый сценарий, голос и звук прохождения.</div>${announcerWidget()}`;}
 else if(kind==='status'){title='СОСТОЯНИЕ ЗАЕЗДА';body=`${done?widgetShell('statsQuick','СОРЕВНОВАНИЕ','trophy',compactFinalProtocol(race),{badge:'ФИНИШ'}):statsWidget(race,ev,pilots,session)}${automationWidget()}`;}
 else if(kind==='results'){title='РЕЗУЛЬТАТЫ';body=done?widgetShell('resultsQuick','ИТОГ СОРЕВНОВАНИЯ','trophy',compactFinalProtocol(race),{badge:'ГОТОВО'}):resultsWidget(race,ev,pilots,session);}
 else if(kind==='next'){title='СЛЕДУЮЩИЙ ЗАЕЗД';body=`${nextWidget(race,ev)}`;}
 else if(kind==='events'){title='ХОД СОРЕВНОВАНИЯ';body=`${eventFlowStrip(race,eventList(race),ev)}`;}
 else if(kind==='menu'){title='МЕНЮ ПУЛЬТА';body=`<div class="r425MenuGrid"><button data-quick-panel="events">${raceSvg('list')}<span>Ход соревнования</span></button><button data-action="race-results">${raceSvg('chart')}<span>Все таблицы</span></button><button data-nav="pilots">${raceSvg('trophy')}<span>Пилоты</span></button><button data-track-action="open">${raceSvg('timer')}<span>Track Day</span></button><button data-action="open-settings">${raceSvg('settings')}<span>Настройки</span></button><button data-action="home">${raceSvg('home')}<span>Главная</span></button></div>`;}
 else return'';
 return `<div class="quickPanelOverlay"><button class="quickPanelBackdrop" data-quick-panel-close="1" aria-label="Закрыть"></button><aside class="quickPanelDrawer"><div class="quickPanelHead"><div><small>БЫСТРАЯ ПАНЕЛЬ</small><b>${title}</b></div><button class="squareConsoleBtn" data-quick-panel-close="1">×</button></div><div class="quickPanelBody">${body}</div></aside></div>`;
}

function cockpitHeader(race,ev,s){return r425Header(race,ev,s);}

function controlButtons(done,s,tie=false){
 const slot=(id,cls,attrs,icon,label)=>`<button class="consoleControl ${cls||''}" data-layout-panel="${id}" ${attrs||''}>${raceSvg(icon)}<span>${label}</span></button>`;
 if(tie)return [
  slot('ctl-pause','',`data-action="race-results"`,'chart','ТАБЛИЦА'),
  slot('ctl-finish','',`disabled`,'pause','ПАУЗА'),
  slot('ctl-plus','',`disabled`,'plusClock','+1 МИН'),
  slot('ctl-primary','primary',`data-action="tie-draw"`,'refresh','ЖЕРЕБЬЁВКА'),
  slot('ctl-manual','',`disabled`,'refresh','РУЧНОЙ КРУГ'),
  slot('ctl-stop','danger',`data-action="home"`,'stop','ВЫХОД'),
  slot('ctl-skip','',`disabled`,'next','ПРОПУСТИТЬ ЗАЕЗД')
 ].join('');
 if(done)return [
  slot('ctl-pause','',`data-action="home"`,'home','ГЛАВНАЯ'),
  slot('ctl-finish','',`data-action="open-rx"`,'settings','НАСТРОЙКА'),
  slot('ctl-plus','primary',`data-action="race-results"`,'chart','РЕЗУЛЬТАТЫ'),
  slot('ctl-primary','',`disabled`,'mic','ДИКТОР'),
  slot('ctl-manual','',`disabled`,'radio','BROADCAST'),
  slot('ctl-stop','danger',`data-action="complete-competition"`,'stop','ЗАВЕРШИТЬ'),
  slot('ctl-skip','',`disabled`,'next','ПРОПУСТИТЬ ЗАЕЗД')
 ].join('');
 const p=s?.phase||'ready',timeRule=eventRule(state.race,currentEvent(state.race))?.limitType==='time';
 const primary=p==='ready'
   ?slot('ctl-primary','primary',`data-action="start-session"`,'play','СТАРТ / ПРОГРЕВ')
   :p==='finished'
     ?slot('ctl-primary','primary',`data-action="next-event"`,'next','СЛЕДУЮЩИЙ')
     :slot('ctl-primary','primary',`disabled`,'next','СЛЕДУЮЩИЙ');
 return [
  slot('ctl-pause','',`data-action="pause-session" ${!['running','finishing','paused'].includes(p)?'disabled':''}`,p==='paused'?'play':'pause',p==='paused'?'ПРОДОЛЖИТЬ':'ПАУЗА'),
  slot('ctl-finish','',`data-action="finish-session" ${!['running','finishing','paused'].includes(p)?'disabled':''}`,'flag','ФИНИШ'),
  slot('ctl-plus','',`data-action="add-minute" ${!timeRule||!['running','paused','finishing'].includes(p)?'disabled':''}`,'plusClock','+1 МИН'),
  primary,
  slot('ctl-manual','primarySoft',`data-action="manual-lap-modal" ${!['running','finishing'].includes(p)?'disabled':''}`,'refresh','РУЧНОЙ КРУГ'),
  slot('ctl-stop','danger',`data-action="stop-session" ${!['warmup','countdown','running','finishing','paused'].includes(p)?'disabled':''}`,'stop','СТОП'),
  slot('ctl-skip','',`data-race-skip-current="1"`,'next','ПРОПУСТИТЬ ЗАЕЗД')
 ].join('');
}

function eventFlowStrip(race,events,ev){const ci=Math.max(0,events.findIndex(e=>e.key===ev?.key));const start=Math.max(0,Math.min(ci-1,Math.max(0,events.length-5)));const visible=events.slice(start,start+5);return `<div class="eventFlow"><button class="flowMenu" data-action="toggle-events">${raceSvg('list')}<span>События</span></button><div class="flowItems">${visible.map(e=>{const st=eventStatus(race,e);return `<button class="flowItem ${st}" ${(st==='completed'||st==='cancelled')?`data-show-event="${e.key}"`:''} ${st==='locked'?'disabled':''}><span class="flowDot"></span><b>${esc(e.label)}</b><small>${st==='cancelled'?'отменён':st==='completed'?'готово':st==='current'?'сейчас':st==='ready'?'далее':'закрыт'}</small></button>`;}).join('')}</div><button class="flowResults" data-action="race-results">${raceSvg('chart')}<span>Все результаты</span></button></div>`;}
