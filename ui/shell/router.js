'use strict';
function uiNav(view){state.view=view;document.body.classList.toggle('cockpitMode',['cockpit','trackDayCockpit'].includes(view));$$('#bottomNav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));render();}

function clearIntervalsIfNotCockpit(){
  if(state.view!=='cockpit'){
    if(state.sessionTick){clearInterval(state.sessionTick);state.sessionTick=null;}
    if(state.countdownTick){clearInterval(state.countdownTick);state.countdownTick=null;}
  }
  if(state.view!=='trackDayCockpit'&&state.trackTick){clearInterval(state.trackTick);state.trackTick=null;}
}

function uiRender(){
  clearIntervalsIfNotCockpit();
  const host=$('#viewHost');
  if(state.view==='home')host.innerHTML=homeView();
  else if(state.view==='rallySetup')host.innerHTML=rallySetupView();
  else if(state.view==='cockpit')host.innerHTML=cockpitView();
  else if(state.view==='trackDaySetup')host.innerHTML=trackDaySetupView();
  else if(state.view==='trackDayCockpit')host.innerHTML=trackDayCockpitView();
  else if(state.view==='championships')host.innerHTML=championshipsView();
  else if(state.view==='championshipDetail')host.innerHTML=championshipDetailView();
  else if(state.view==='archive')host.innerHTML=archiveView();
  else if(state.view==='pilots')host.innerHTML=pilotsView();
  else if(state.view==='settings')host.innerHTML=settingsView();
  bindView();bind415();updateHeader();applySettings();
  if(state.view==='cockpit')startTicker();
  if(state.view==='trackDayCockpit')startTrackTicker();
}

function uiUpdateHeader(){
  const td=state.trackDay;
  if(td?.status==='active')$('#headerRace').textContent=`Track Day · ${td.name}`;
  else {const race=state.race;$('#headerRace').textContent=race?`${race.eventName} · ${stageLabel(race.stage)}`:'Нет активной гонки';}
  const el=$('#headerLapwiz');el.textContent=lapwiz.connected?`LapWiz · ${lapwiz.device?.name||'подключён'}`:'LapWiz · не подключён';el.className=`statusPill ${lapwiz.connected?'good':'neutral'}`;
}

function homeView(){
 const race=state.race,td=state.trackDay,trackActive=td?.status==='active';
 const live=trackActive
   ?`<div class="liveCard"><span class="liveDot"></span><div><small>АКТИВНАЯ СЕССИЯ</small><b>${esc(td.name)}</b><span>Track Day · ${fmtClock(trackRemaining(td))} осталось</span></div><button class="btn primary" data-track-action="open-active">Вернуться в Track Day ${uiIcon('chevron','btnIcon')}</button></div>`
   :race?`<div class="liveCard"><span class="liveDot"></span><div><small>АКТИВНОЕ СОБЫТИЕ</small><b>${esc(race.eventName)}</b><span>${stageLabel(race.stage)}</span></div><button class="btn primary" data-action="open-current">Продолжить ${uiIcon('chevron','btnIcon')}</button></div>`
   :`<div class="heroMini"><b>4.2.0 CLEAN FULL APP RC3</b><span>Модульная архитектура · рабочие пульты сохранены</span></div>`;
 return `<section class="page homePage">
 <div class="heroPanel"><div class="heroCopy"><div class="sectionLabel">RACE MANAGEMENT SYSTEM</div><h1>LEGION <span>RX</span></h1><p>Единая система проведения RC-соревнований, тренировок и хронометража LapWiz.</p></div><div class="heroStatus">${live}</div></div>
 <div class="homeSectionHead"><div><div class="sectionLabel">ДИСЦИПЛИНЫ</div><h2>Выберите формат</h2></div></div>
 <div class="disciplineGrid disciplineGrid415">
  <article class="disciplineTile activeDiscipline"><div class="tileTop"><div class="tileIcon">${uiIcon('flag')}</div><span class="badge liveBadge"><span class="liveDot"></span>АКТИВНО</span></div><div><h3>Ралли-кросс</h3><p>Квалификации, очки, LCQ, переходы и финалы.</p></div><button class="tileAction" data-action="open-rx"><span>${race?'Открыть соревнование':'Создать соревнование'}</span>${uiIcon('chevron')}</button></article>
  <article class="disciplineTile locked"><div class="tileTop"><div class="tileIcon">${uiIcon('timer')}</div><span class="badge soon">СКОРО</span></div><div><h3>Ралли-спринт</h3><p>Одиночные попытки, лучшее время и протокол результатов.</p></div><button class="tileAction" disabled><span>В разработке</span>${uiIcon('chevron')}</button></article>
  <article class="disciplineTile locked"><div class="tileTop"><div class="tileIcon">${uiIcon('car')}</div><span class="badge soon">СКОРО</span></div><div><h3>Классическая RC-гонка</h3><p>Practice, seeding, qualifying и A/B/C Finals.</p></div><button class="tileAction" disabled><span>В разработке</span>${uiIcon('chevron')}</button></article>
  <article class="disciplineTile activeDiscipline trackTile"><div class="tileTop"><div class="tileIcon">${uiIcon('timer')}</div><span class="badge liveBadge">${trackActive?'СЕССИЯ ИДЁТ':'PRACTICE'}</span></div><div><h3>Track Day</h3><p>Свободная практика 10–120 минут, PIT/PIT OUT, круги, лучшее и последнее время, подробный отчёт по каждому пилоту.</p></div><button class="tileAction" data-track-action="open"><span>${trackActive?'Вернуться в сессию':'Свободная практика'}</span>${uiIcon('chevron')}</button></article>
 </div>
 <div class="homeSectionHead modulesHead"><div><div class="sectionLabel">СИСТЕМА</div><h2>Общие разделы</h2></div></div>
 <div class="moduleGrid">
  <button class="moduleCard" data-nav="championships"><span class="moduleIcon">${uiIcon('trophy')}</span><span><small>СЕЗОНЫ И ЭТАПЫ</small><b>Чемпионаты</b><em>Турнирные таблицы и очки этапов</em></span>${uiIcon('chevron','moduleArrow')}</button>
  <button class="moduleCard" data-nav="pilots"><span class="moduleIcon">${uiIcon('users')}</span><span><small>ОБЩАЯ БАЗА</small><b>Пилоты</b><em>${state.pilotDb.length} профилей · транспондеры</em></span>${uiIcon('chevron','moduleArrow')}</button>
  <button class="moduleCard" data-nav="settings"><span class="moduleIcon">${uiIcon('settings')}</span><span><small>СИСТЕМА</small><b>Настройки</b><em>Тема, язык, LapWiz, звук</em></span>${uiIcon('chevron','moduleArrow')}</button>
  <button class="moduleCard" data-nav="archive"><span class="moduleIcon">${uiIcon('list')}</span><span><small>СОХРАНЁННЫЕ ГОНКИ</small><b>Архив</b><em>${state.archive.length} соревнований · восстановление</em></span>${uiIcon('chevron','moduleArrow')}</button>
 </div></section>`;
}
