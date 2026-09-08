'use strict';
const ANNOUNCER_AUDIO={
  prestart10:'./audio/voice/prestart_10.wav',
  goodRace:'./audio/voice/good_race.wav',
  startRace:'./audio/system/start_race.mp3',
  bleep:'./audio/system/bleep.mp3',
  countdown:Object.fromEntries(Array.from({length:10},(_,i)=>[i+1,`./audio/voice/countdown_${String(i+1).padStart(2,'0')}.wav`])),
  warmup:{
    1:'./audio/voice/warmup_01.wav',
    2:'./audio/voice/warmup_02.wav',
    3:'./audio/voice/warmup_03.wav',
    4:'./audio/voice/warmup_04.wav',
    5:'./audio/voice/warmup_05.wav',
    30:'./audio/voice/warmup_30.wav'
  },
  oneMinuteLeft:'./audio/voice/events/one_minute_left.wav',callToStart:'./audio/voice/events/call_to_start.wav',newBestLap:'./audio/voice/events/new_best_lap.wav',pilotFinished:'./audio/voice/events/pilot_finished.wav',heatResults:'./audio/voice/events/heat_results.wav',timeExpired:'./audio/voice/events/time_expired.wav',finishCurrentLap:'./audio/voice/events/finish_current_lap.wav',allPilotsFinished:'./audio/voice/events/all_pilots_finished.wav',heatFinished:'./audio/voice/events/heat_finished.wav',raceStopped:'./audio/voice/events/race_stopped.wav',unknownTransponder:'./audio/voice/events/unknown_transponder.wav',lapwizDisconnected:'./audio/voice/events/lapwiz_disconnected.wav'
};
class AnnouncerEngine extends EventTarget{
  constructor(){
    super();
    this.enabled=true;
    this.startMode='full';
    this.token=0;
    this.lastMessage='Готов к старту';
    this.lastError='';
    this.unlocked=false;
    this.unlockPromise=null;
    this.mainPlayer=null;       // VOICE + HORN: один постоянный media element
    this.bleepPool=[];          // SFX: отдельные media elements, могут играть поверх диктора
    this.bleepIndex=0;
    this.preloadCache=new Map();// только прогрев media element и получение duration
    this.localAudioUrls=new Map(); // object URL из Cache Storage: проигрывание не зависит от media fetch/service worker
    this.localAudioReady=false;
    this.localAudioLoading=null;
    this.needsRecovery=false;
    this.interruptionReason='';
  }
  emit(detail){this.dispatchEvent(new CustomEvent('status',{detail}));}
  rawAssetUrl(key){
    if(key.startsWith('countdown_'))return ANNOUNCER_AUDIO.countdown[Number(key.split('_')[1])];
    if(key.startsWith('warmup_'))return ANNOUNCER_AUDIO.warmup[Number(key.split('_')[1])];
    return ANNOUNCER_AUDIO[key]||null;
  }
  assetUrl(key){const raw=this.rawAssetUrl(key);return raw?(this.localAudioUrls.get(raw)||raw):null;}
  allKeys(){return ['prestart10','goodRace','startRace','oneMinuteLeft','callToStart','newBestLap','pilotFinished','heatResults','timeExpired','finishCurrentLap','allPilotsFinished','heatFinished','raceStopped','unknownTransponder','lapwizDisconnected',...Array.from({length:10},(_,i)=>`countdown_${i+1}`),...'12345'.split('').map(n=>`warmup_${n}`),'warmup_30'];}
  allAudioUrls(){return [...new Set([...this.allKeys().map(k=>this.rawAssetUrl(k)),ANNOUNCER_AUDIO.bleep,'./audio/system/silence.wav'].filter(Boolean))];}
  audioMime(url){return /\.mp3$/i.test(url)?'audio/mpeg':/\.wav$/i.test(url)?'audio/wav':'application/octet-stream';}
  clearLocalAudioUrls(){for(const u of this.localAudioUrls.values()){try{URL.revokeObjectURL(u);}catch{}}this.localAudioUrls.clear();this.localAudioReady=false;this.preloadCache.clear();}
  async hydrateOfflineAudio(){
    if(this.localAudioReady)return true;
    if(this.localAudioLoading)return this.localAudioLoading;
    this.localAudioLoading=(async()=>{
      try{
        const cache=await caches.open(LEGION_OFFLINE_CACHE),next=new Map();
        for(const raw of this.allAudioUrls()){
          const hit=await cache.match(raw,{ignoreSearch:true});
          await offlineReady.validate(raw,hit);
          const buf=await hit.clone().arrayBuffer();
          const blob=new Blob([buf],{type:this.audioMime(raw)});
          next.set(raw,URL.createObjectURL(blob));
        }
        this.clearLocalAudioUrls();this.localAudioUrls=next;this.localAudioReady=true;this.lastError='';this.prepareUnlockSources();return true;
      }catch(e){
        this.clearLocalAudioUrls();this.lastError=String(e?.message||e);console.warn('Legion RX local audio hydrate:',e);return false;
      }finally{this.localAudioLoading=null;AudioUIBridge.refreshOffline();}
    })();
    return this.localAudioLoading;
  }
  createPlayer(role){
    const a=AudioUIBridge.createPlayer(role);
    a.preload='auto';a.playsInline=true;a.setAttribute('playsinline','');a.setAttribute('webkit-playsinline','');
    a.dataset.legionAudio=role;
    return a;
  }
  ensurePlayers(){
    if(!this.mainPlayer)this.mainPlayer=this.createPlayer('main');
    // Один отдельный BLEEP-канал достаточно: сам сигнал короче минимального круга,
    // зато iOS/Safari не приходится одновременно разблокировать восемь media elements.
    if(!this.bleepPool.length)this.bleepPool=[this.createPlayer('bleep-1')];
  }
  discardPlayers(){
    const players=[this.mainPlayer,...this.bleepPool].filter(Boolean);
    for(const a of players){try{a.pause();a.removeAttribute('src');a.load();a.remove();}catch{}}
    this.mainPlayer=null;this.bleepPool=[];this.bleepIndex=0;this.unlockPromise=null;
  }
  invalidateAudioSession(reason='ios-interruption'){
    this.unlocked=false;this.needsRecovery=true;this.interruptionReason=reason;this.token++;
    try{this.stopVoice();for(const a of this.bleepPool){a.pause();a.currentTime=0;}}catch{}
    this.emit({message:'Аудиосессия требует повторного запуска',audioReady:false,interrupted:true,reason});
  }
  prepareUnlockSources(){
    this.ensurePlayers();
    const silence=this.localAudioUrls.get('./audio/system/silence.wav')||'./audio/system/silence.wav';
    const bleep=this.localAudioUrls.get(ANNOUNCER_AUDIO.bleep)||ANNOUNCER_AUDIO.bleep;
    const prep=(a,key,src,volume)=>{
      if(!a||!src)return;
      try{
        if(a.dataset.legionUnlockSrc!==src){
          a.pause();a.src=src;a.dataset.legionUnlockSrc=src;a.dataset.legionKey=key;a.preload='auto';a.load();
        }
        a.volume=volume;a.playbackRate=1;
      }catch{}
    };
    prep(this.mainPlayer,'unlock-silence',silence,.01);
    prep(this.bleepPool[0],'bleep',bleep,1);
  }
  getAudio(key){
    if(this.preloadCache.has(key))return this.preloadCache.get(key);
    const src=this.assetUrl(key);if(!src)return null;
    const a=new Audio();a.preload='auto';a.src=src;a.playsInline=true;
    try{a.load();}catch{}
    this.preloadCache.set(key,a);return a;
  }
  preload(){
    this.ensurePlayers();
    this.allKeys().forEach(k=>this.getAudio(k));
    // Не блокируем UI: service worker/browser cache сами догрузят короткие файлы.
    return true;
  }
  setGate(message='',kind=''){AudioUIBridge.setGate(message,kind);if(this.unlocked)AudioUIBridge.hideGate();}
  showGate(message='Нужно один раз включить звук'){AudioUIBridge.showGate();this.setGate(message,this.lastError?'err':'');}
  async unlockFromGesture({confirmation=true}={}){
    if(this.unlocked&&!this.needsRecovery)return true;
    if(this.unlockPromise)return this.unlockPromise;
    if(this.needsRecovery)this.discardPlayers();
    this.ensurePlayers();
    this.prepareUnlockSources();
    AudioUIBridge.setUnlockBusy(true);
    this.setGate('Включаю аудиоканал…','');
    const main=this.mainPlayer,bleep=this.bleepPool[0];
    // На iOS user activation очень короткая. Поэтому в самом tap только ДВА play():
    // постоянный VOICE/HORN-канал + постоянный BLEEP-канал. Никаких preload/load/await между ними.
    const start=(a,volume)=>{
      try{
        a.volume=volume;a.playbackRate=1;try{a.currentTime=0;}catch{}
        const pr=a.play();
        return Promise.resolve(pr).then(()=>({ok:true})).catch(error=>({ok:false,error}));
      }catch(error){return Promise.resolve({ok:false,error});}
    };
    const pMain=start(main,.01);
    const pBleep=start(bleep,confirmation?1:.01);
    this.unlockPromise=Promise.all([pMain,pBleep]).then(results=>{
      const mainOk=Boolean(results[0]?.ok),bleepOk=Boolean(results[1]?.ok);
      const errors=results.filter(x=>!x?.ok).map(x=>x?.error).filter(Boolean);
      // Не обрываем только что начатый play() мгновенным pause(): это и давало AbortError на Safari.
      setTimeout(()=>{try{main.pause();main.currentTime=0;}catch{}if(!confirmation){try{bleep.pause();bleep.currentTime=0;}catch{}}},180);
      this.unlocked=mainOk&&bleepOk;
      this.lastError=this.unlocked?'':String(errors[0]?.name||errors[0]?.message||errors[0]||`VOICE ${mainOk?'OK':'ERR'} / BLEEP ${bleepOk?'OK':'ERR'}`);
      this.unlockPromise=null;AudioUIBridge.setUnlockBusy(false);
      if(this.unlocked){
        this.needsRecovery=false;this.interruptionReason='';
        this.setGate('Звук готов','ok');AudioUIBridge.hideGate();
        this.emit({message:'Звук готов',audioReady:true});return true;
      }
      this.setGate(`Не удалось включить звук: ${this.lastError}`,'err');
      this.emit({message:'Ошибка активации звука',error:this.lastError,audioReady:false});return false;
    });
    return this.unlockPromise;
  }
  setSource(a,key,src){
    if(a.dataset.legionKey===key&&a.getAttribute('src')===src)return;
    try{a.pause();a.currentTime=0;}catch{}
    a.src=src;a.dataset.legionKey=key;a.load();
  }
  markBlocked(key,e){
    const name=String(e?.name||'');
    if(name==='AbortError'){
      // Safari выдаёт AbortError, если предыдущий play() был технически прерван сменой позиции/источника.
      // Это НЕ означает, что пользователь запретил звук, поэтому не сбрасываем рабочий unlock.
      console.warn('Legion RX audio transient abort:',key,e);return;
    }
    this.unlocked=false;this.lastError=String(name||e||'Audio blocked');
    this.showGate(`Звук был заблокирован системой. Нажмите «Включить звук» ещё раз. (${this.lastError})`);
    this.emit({message:`Ошибка аудио: ${key}`,error:String(e),audioReady:false});
  }
  stopVoice(){if(this.mainPlayer){try{this.mainPlayer.pause();this.mainPlayer.currentTime=0;}catch{}}}
  cancel(){try{window.speechSynthesis?.cancel();}catch{}this.token++;this.stopVoice();this.lastMessage='Отсчёт отменён';this.emit({message:this.lastMessage,running:false});}
  async play(key,{wait=true,force=false,volume=1}={}){
    if(!force&&!this.enabled)return false;
    if(!this.unlocked){this.showGate('Сначала включите звук одним касанием');return false;}
    this.ensurePlayers();const src=this.assetUrl(key);if(!src)return false;
    const a=this.mainPlayer;
    try{
      this.setSource(a,key,src);a.volume=Math.max(0,Math.min(1,Number(volume)||0));a.playbackRate=1;a.currentTime=0;
      const pr=a.play();if(pr&&typeof pr.then==='function')await pr;
      this.lastMessage=key;this.lastError='';this.emit({message:key,running:true,audioReady:true});
      if(wait)await new Promise(resolve=>{
        let doneCalled=false;const done=()=>{if(doneCalled)return;doneCalled=true;a.removeEventListener('ended',done);a.removeEventListener('error',done);resolve();};
        a.addEventListener('ended',done,{once:true});a.addEventListener('error',done,{once:true});
        // страховка от зависшего media-event
        const d=Number.isFinite(a.duration)&&a.duration>0?a.duration*1000+700:4500;setTimeout(done,d);
      });
      return true;
    }catch(e){console.warn('Legion RX audio:',key,e);this.markBlocked(key,e);return false;}
  }
  async playBleep({force=false}={}){
    if(!force&&!this.enabled&&false)return false;
    if(!this.unlocked){this.showGate('Сначала включите звук одним касанием');return false;}
    this.ensurePlayers();const a=this.bleepPool[this.bleepIndex++%this.bleepPool.length];
    try{
      this.setSource(a,'bleep',this.assetUrl('bleep'));a.volume=1;a.playbackRate=1;a.currentTime=0;
      const pr=a.play();if(pr&&typeof pr.catch==='function')pr.catch(e=>this.markBlocked('bleep',e));
      return true;
    }catch(e){this.markBlocked('bleep',e);return false;}
  }
  delay(ms,token){return new Promise(resolve=>setTimeout(()=>resolve(token===this.token),Math.max(0,ms)));}
  async timedCountdown(from,{token,onTick,voiceFrom=from,voiceTo=1,goodRaceAt=null}={}){
    const origin=performance.now();
    for(let n=from;n>=0;n--){
      if(token!==this.token)return false;
      if(n!==from){const ok=await this.delay(origin+(from-n)*1000-performance.now(),token);if(!ok)return false;}
      onTick?.(n);
      if(n>0&&this.enabled){if(goodRaceAt!==null&&n===goodRaceAt)this.play('goodRace',{wait:false});else if(n<=10&&n<=voiceFrom&&n>=voiceTo)this.play(`countdown_${n}`,{wait:false});}
    }
    return token===this.token;
  }
  async runStartSequence({seconds=10,mode='full',onTick,onStart}={}){
    this.cancel();const token=this.token;this.preload();
    const sec=Math.max(1,Math.min(10,Math.round(Number(seconds)||10)));
    this.lastMessage='Подготовка старта';this.emit({message:this.lastMessage,running:true,mode,seconds:sec});
    if(!this.enabled){const ok=await this.timedCountdown(sec,{token,onTick,voiceFrom:0,voiceTo:99});if(ok&&token===this.token)await onStart?.();return;}
    if(mode==='full'){
      if(sec===10){await this.play('prestart10',{wait:true});if(token!==this.token)return;}
      const ok=await this.timedCountdown(sec,{token,onTick,voiceFrom:10,voiceTo:5,goodRaceAt:4});if(!ok||token!==this.token)return;
    }else{
      await this.play('goodRace',{wait:true});if(token!==this.token)return;
      const first=Math.max(0,sec-1);if(first>0){const ok=await this.timedCountdown(first,{token,onTick,voiceFrom:10,voiceTo:1});if(!ok||token!==this.token)return;}else onTick?.(0);
    }
    if(token!==this.token)return;
    this.play('startRace',{wait:false,force:true});this.lastMessage='СТАРТ';this.emit({message:'СТАРТ',running:false});await onStart?.();
  }

  speakText(text){
    if(!this.enabled||!text||!('speechSynthesis' in window))return;
    try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ru-RU';u.rate=.96;u.pitch=1.02;u.volume=1;const voices=window.speechSynthesis.getVoices?.()||[];const ru=voices.find(v=>/^ru/i.test(v.lang)&&/female|жен|alena|milena|irina|svetlana/i.test(v.name))||voices.find(v=>/^ru/i.test(v.lang));if(ru)u.voice=ru;window.speechSynthesis.speak(u);}catch(e){console.warn('SpeechSynthesis',e);}
  }
}
class PilotVoiceStore{
 constructor(){this.dbName='legion_rx_pilot_voice_v1';this.storeName='clips';this.urls=new Map();this.queue=Promise.resolve();}
 open(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window))return reject(new Error('Локальная база аудио недоступна'));const req=indexedDB.open(this.dbName,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(this.storeName))db.createObjectStore(this.storeName,{keyPath:'pilotId'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Не удалось открыть базу аудио'));});}
 async get(pilotId){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction(this.storeName,'readonly'),req=tx.objectStore(this.storeName).get(String(pilotId));req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});}
 async put(pilotId,name,blob,fileName=''){const db=await this.open(),row={pilotId:String(pilotId),name:String(name),source:'local-file',fileName:String(fileName||''),mime:blob.type||'audio/mpeg',blob,updatedAt:new Date().toISOString()};await new Promise((resolve,reject)=>{const tx=db.transaction(this.storeName,'readwrite');tx.objectStore(this.storeName).put(row);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();this.revoke(pilotId);return row;}
 async remove(pilotId){const db=await this.open();await new Promise((resolve,reject)=>{const tx=db.transaction(this.storeName,'readwrite');tx.objectStore(this.storeName).delete(String(pilotId));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();this.revoke(pilotId);}
 revoke(pilotId){const key=String(pilotId),url=this.urls.get(key);if(url)URL.revokeObjectURL(url);this.urls.delete(key);}
 play(pilotId,{delay=0}={}){const task=async()=>{const row=await this.get(pilotId);if(!row?.blob)return false;if(delay)await new Promise(r=>setTimeout(r,delay));let url=this.urls.get(String(pilotId));if(!url){url=URL.createObjectURL(row.blob);this.urls.set(String(pilotId),url);}announcer.ensurePlayers();const audio=announcer.mainPlayer;if(!audio)throw new Error('Канал диктора недоступен');audio.pause();audio.src=url;audio.dataset.legionKey=`pilot-${pilotId}`;audio.preload='auto';audio.volume=1;audio.playbackRate=1;await audio.play();await new Promise(resolve=>{const done=()=>{audio.removeEventListener('ended',done);audio.removeEventListener('error',done);resolve();};audio.addEventListener('ended',done,{once:true});audio.addEventListener('error',done,{once:true});});return true;};const run=this.queue.then(task,task);this.queue=run.catch(()=>false);return run;}
}
