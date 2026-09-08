'use strict';
function updateOfflineReadyUi(){
  const snap=offlineReady.snapshot(),pct=snap.total?Math.round((Math.min(snap.completed,snap.total)/snap.total)*100):0;
  const box=document.getElementById('audioOfflineState'),meta=document.getElementById('audioOfflineMeta'),bar=document.getElementById('audioOfflineProgress'),btn=document.getElementById('audioGateBtn');
  if(box){box.className=`offlineReadyBox ${snap.ready?'ready':snap.checked?'error':'preparing'}`;const b=box.querySelector('b');if(b)b.textContent=snap.ready?'OFFLINE READY ✓':snap.checked?'OFFLINE-ПАКЕТ НЕПОЛНЫЙ':'ПРОВЕРЯЮ OFFLINE-ПАКЕТ…';}
  if(meta)meta.textContent=snap.ready?`${snap.total}/${snap.total} файлов · рабочая версия полностью локальна`:`${Math.min(snap.completed,snap.total)} / ${snap.total} файлов${snap.lastError?` · ${snap.lastError}`:''}`;
  if(bar)bar.style.width=`${pct}%`;
  if(btn&&!announcer.unlockPromise){
    btn.disabled=false;
    btn.textContent=announcer.localAudioReady?'ВКЛЮЧИТЬ ЗВУК':'ПРОВЕРИТЬ ЗВУК';
  }
  document.querySelectorAll('[data-offline-ready]').forEach(el=>{
    el.className=`offlineReadyBox ${snap.ready?'ready':snap.checked?'error':'preparing'}`;
    const b=el.querySelector('b');if(b)b.textContent=snap.ready?'OFFLINE READY ✓':snap.checked?'OFFLINE-ПАКЕТ НЕПОЛНЫЙ':'ПРОВЕРЯЮ OFFLINE-ПАКЕТ…';
    const sm=el.querySelector('.offlineMeta');if(sm)sm.textContent=snap.ready?`${snap.total}/${snap.total} файлов · интернет для гонки не нужен`:`${Math.min(snap.completed,snap.total)}/${snap.total} файлов${snap.lastError?` · ${snap.lastError}`:''}`;
  });
}

function updateAppUpdateUi(){
  if(typeof appUpdater==='undefined')return;
  const s=appUpdater.snapshot();
  document.querySelectorAll('[data-update-state]').forEach(el=>{
    el.dataset.status=s.status;const title=el.querySelector('[data-update-title]'),meta=el.querySelector('[data-update-meta]');
    if(title)title.textContent=appUpdater.label();
    if(meta){
      if(s.ready)meta.textContent=`Готово: ${s.availableDisplayVersion}. Текущая: ${s.currentDisplayVersion}.`;
      else if(s.status==='downloading')meta.textContent='Новая версия скачивается в отдельный безопасный пакет. Текущая версия не изменяется.';
      else if(s.status==='offline')meta.textContent='Нет сети. Установленная версия продолжает работать полностью локально.';
      else if(s.status==='error')meta.textContent=s.lastError||'Текущая версия сохранена.';
      else meta.textContent=`Установлено: ${s.currentDisplayVersion}.`;
    }
  });
  document.querySelectorAll('[data-action="update-check"]').forEach(btn=>{btn.disabled=!s.online||['checking','downloading','activating'].includes(s.status);btn.textContent=['checking','downloading'].includes(s.status)?'ПРОВЕРЯЮ / СКАЧИВАЮ…':'ПРОВЕРИТЬ ОБНОВЛЕНИЕ';});
  document.querySelectorAll('[data-action="update-install"]').forEach(btn=>{btn.hidden=!s.ready;btn.disabled=!s.ready||s.status==='activating';});
}

function setupAudioGate(){
  const gate=document.getElementById('audioGate'),btn=document.getElementById('audioGateBtn');if(!gate||!btn)return;
  offlineReady.addEventListener('status',updateOfflineReadyUi);
  btn.onclick=async()=>{
    if(!announcer.localAudioReady){
      const audioOk=await announcer.hydrateOfflineAudio();updateOfflineReadyUi();
      if(!audioOk){announcer.setGate(`Локальный звук недоступен: ${announcer.lastError||'аудиопакет не найден в установленной версии'}`,'err');return;}
    }
    const ok=await announcer.unlockFromGesture({confirmation:true});if(ok)toast('Звук готов');updateOfflineReadyUi();
  };
  if(!state.settings.announcerEnabled&&!state.settings.lapSound)gate.classList.add('hidden');updateOfflineReadyUi();
}

async function ensureRaceAudioFromGesture(){
  if(!state.settings.announcerEnabled&&!state.settings.lapSound)return true;
  if(!announcer.localAudioReady){const ok=await announcer.hydrateOfflineAudio();if(!ok){announcer.showGate('Локальный аудиопакет недоступен. Откройте «Настройки → Обновление и Offline» при стабильной сети.');toast('Локальный звук не готов');return false;}}
  if(announcer.unlocked)return true;
  const ok=await announcer.unlockFromGesture({confirmation:false});
  if(!ok){announcer.showGate('Safari требует один тап для восстановления звука. Интернет для этого не нужен.');toast('Нужно включить звук');}
  return ok;
}

async function registerLegionServiceWorker(){
  if(!('serviceWorker'in navigator))return null;
  try{return await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});}catch(e){console.warn('Legion RX SW:',e);return null;}
}

async function bootOfflineAudio(){
  const reg=await registerLegionServiceWorker();
  if(typeof appUpdater!=='undefined'){await appUpdater.init(reg);appUpdater.addEventListener('status',updateAppUpdateUi);}
  const ok=await offlineReady.init();
  const audioOk=await announcer.hydrateOfflineAudio();if(audioOk)announcer.preload();
  updateOfflineReadyUi();updateAppUpdateUi();
  if(ok&&audioOk)console.info('Legion RX: active release is fully offline ready');
  else console.warn('Legion RX: active release package check',offlineReady.snapshot(),announcer.lastError);
}

function legionAudioNeedsRecovery(){return Boolean(state.settings.announcerEnabled||state.settings.lapSound);}
function invalidateLegionAudio(reason){if(LEGION_IS_IOS&&legionAudioNeedsRecovery())announcer.invalidateAudioSession(reason);}
function requestLegionAudioRecovery(reason){
  if(!LEGION_IS_IOS||!legionAudioNeedsRecovery())return;
  if(!announcer.needsRecovery)announcer.invalidateAudioSession(reason);
  offlineReady.check().then(updateOfflineReadyUi);
  announcer.showGate(announcer.localAudioReady?'Звук iPhone нужно восстановить одним касанием. Интернет не нужен.':'Локальный аудиопакет требует проверки.');
}
