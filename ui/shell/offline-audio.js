'use strict';
function updateOfflineReadyUi(){
  const snap=offlineReady.snapshot(),pct=snap.total?Math.round((Math.min(snap.completed,snap.total)/snap.total)*100):0;
  const box=document.getElementById('audioOfflineState'),meta=document.getElementById('audioOfflineMeta'),bar=document.getElementById('audioOfflineProgress'),btn=document.getElementById('audioGateBtn');
  if(box){box.className=`offlineReadyBox ${snap.ready?'ready':snap.preparing?'preparing':snap.checked?'error':'preparing'}`;const b=box.querySelector('b');if(b)b.textContent=snap.ready?'OFFLINE READY ✓':snap.preparing?'ПОДГОТОВКА OFFLINE…':snap.checked?'OFFLINE НЕ ГОТОВ':'ПРОВЕРЯЮ OFFLINE-ПАКЕТ…';}
  if(meta)meta.textContent=snap.ready?`${snap.total}/${snap.total} файлов · приложение и звук сохранены на устройстве`:`${Math.min(snap.completed,snap.total)} / ${snap.total} файлов${snap.lastError?` · ${snap.lastError}`:''}`;
  if(bar)bar.style.width=`${pct}%`;
  if(btn&&!announcer.unlockPromise){
    const audioHydrating=Boolean(snap.ready&&!announcer.localAudioReady);
    btn.disabled=Boolean(snap.preparing||audioHydrating);
    btn.textContent=snap.ready?(audioHydrating?'ГОТОВЛЮ АУДИО…':'ВКЛЮЧИТЬ ЗВУК'):snap.preparing?'ПОДГОТОВКА OFFLINE…':'ПОВТОРИТЬ ПОДГОТОВКУ';
  }
  document.querySelectorAll('[data-offline-ready]').forEach(el=>{
    el.className=`offlineReadyBox ${snap.ready?'ready':snap.preparing?'preparing':snap.checked?'error':'preparing'}`;
    const b=el.querySelector('b');if(b)b.textContent=snap.ready?'OFFLINE READY ✓':snap.preparing?'ПОДГОТОВКА OFFLINE…':'OFFLINE НЕ ГОТОВ';
    const sm=el.querySelector('.offlineMeta');if(sm)sm.textContent=snap.ready?`${snap.total}/${snap.total} файлов · можно работать без интернета`:`${Math.min(snap.completed,snap.total)}/${snap.total} файлов${snap.lastError?` · ${snap.lastError}`:''}`;
  });
}

function setupAudioGate(){
  const gate=document.getElementById('audioGate'),btn=document.getElementById('audioGateBtn');
  if(!gate||!btn)return;
  offlineReady.addEventListener('status',updateOfflineReadyUi);
  btn.onclick=async()=>{
    if(!offlineReady.ready){
      const ok=await offlineReady.prepare();updateOfflineReadyUi();
      if(!ok){announcer.setGate(`Offline-пакет не готов. ${offlineReady.lastError||'Подключитесь к интернету и повторите.'}`,'err');toast('OFFLINE не готов');return;}
      const audioOk=await announcer.hydrateOfflineAudio();updateOfflineReadyUi();
      if(!audioOk){announcer.setGate(`Offline-пакет сохранён, но аудио не подготовлено: ${announcer.lastError||'ошибка чтения кэша'}`,'err');return;}
      // После асинхронной загрузки браузер уже потерял user activation. Нужен ещё один осознанный тап.
      announcer.setGate('OFFLINE READY ✓ · Теперь нажмите «Включить звук»','ok');updateOfflineReadyUi();return;
    }
    const ok=await announcer.unlockFromGesture({confirmation:true});
    if(ok)toast('OFFLINE READY ✓ · Звук готов');
    updateOfflineReadyUi();
  };
  if(!state.settings.announcerEnabled&&!state.settings.lapSound)gate.classList.add('hidden');
  updateOfflineReadyUi();
}

async function ensureRaceAudioFromGesture(){
  if(!state.settings.announcerEnabled&&!state.settings.lapSound)return true;
  if(!offlineReady.ready){announcer.showGate('OFFLINE-пакет не готов. Подключитесь к сети и подготовьте приложение до старта.');toast('OFFLINE не готов');return false;}
  if(!announcer.localAudioReady){announcer.showGate('Локальный звуковой пакет ещё подготавливается. Подождите пару секунд.');toast('Аудио ещё готовится');return false;}
  if(announcer.unlocked)return true;
  const ok=await announcer.unlockFromGesture({confirmation:false});
  if(!ok){announcer.showGate('Без активации звука автоматический старт будет без диктора/HORN.');toast('Нужно включить звук');}
  return ok;
}

async function registerLegionServiceWorker(){
  if(!('serviceWorker'in navigator))return null;
  try{
    const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
    try{await reg.update();}catch{}
    const worker=reg.installing||reg.waiting||reg.active;
    if(worker&&worker.state!=='activated'){
      await Promise.race([
        new Promise(resolve=>{const done=()=>{if(worker.state==='activated'||worker.state==='redundant'){worker.removeEventListener('statechange',done);resolve();}};worker.addEventListener('statechange',done);done();}),
        new Promise(resolve=>setTimeout(resolve,5000))
      ]);
    }
    return reg;
  }catch(e){console.warn('Legion RX SW:',e);return null;}
}

async function bootOfflineAudio(){
  // Сначала ставим новый SW/cache namespace. Это не даёт старому 4.0.23 media-cache участвовать в подготовке 4.0.24.
  await registerLegionServiceWorker();
  const ok=await offlineReady.init();
  if(ok){
    const audioOk=await announcer.hydrateOfflineAudio();
    if(audioOk)announcer.preload();
    else console.warn('Legion RX offline audio hydrate failed',announcer.lastError);
  }
  updateOfflineReadyUi();
  if(ok&&announcer.localAudioReady)console.info('Legion RX OFFLINE READY + LOCAL AUDIO',offlineReady.snapshot());
  else console.warn('Legion RX offline package/audio incomplete',offlineReady.snapshot(),announcer.lastError);
}

function legionAudioNeedsRecovery(){return Boolean(state.settings.announcerEnabled||state.settings.lapSound);}

function invalidateLegionAudio(reason){if(LEGION_IS_IOS&&legionAudioNeedsRecovery())announcer.invalidateAudioSession(reason);}

function requestLegionAudioRecovery(reason){
 if(!LEGION_IS_IOS||!legionAudioNeedsRecovery())return;
 if(!announcer.needsRecovery)announcer.invalidateAudioSession(reason);
 offlineReady.check().then(updateOfflineReadyUi);
 announcer.showGate(offlineReady.ready?'Звук iPhone нужно восстановить одним касанием.':'OFFLINE-пакет требует проверки.');
}
