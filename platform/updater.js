'use strict';
class LegionUpdateManager extends EventTarget{
  constructor(){
    super();
    this.registration=null;this.waiting=null;this.availableVersion='';this.availableDisplayVersion='';
    this.status='idle';this.lastError='';this.lastCheckedAt='';this._reloading=false;
    window.addEventListener('online',()=>this.emit());window.addEventListener('offline',()=>this.emit());
  }
  snapshot(){return {status:this.status,currentVersion:LEGION_APP_VERSION,currentDisplayVersion:LEGION_APP_DISPLAY_VERSION,availableVersion:this.availableVersion,availableDisplayVersion:this.availableDisplayVersion,online:navigator.onLine,lastError:this.lastError,lastCheckedAt:this.lastCheckedAt,ready:Boolean(this.waiting)};}
  emit(){this.dispatchEvent(new CustomEvent('status',{detail:this.snapshot()}));}
  async init(registration){
    this.registration=registration||null;
    if(!registration){this.status='unsupported';this.emit();return false;}
    registration.addEventListener('updatefound',()=>this.watchInstalling(registration.installing));
    if(registration.installing)this.watchInstalling(registration.installing);
    if(registration.waiting)await this.captureWaiting(registration.waiting);
    else{this.status='idle';this.emit();}
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(this._reloading)return;this._reloading=true;location.reload();});
    return true;
  }
  watchInstalling(worker){
    if(!worker)return;
    this.status='downloading';this.lastError='';this.emit();
    const onState=async()=>{
      if(worker.state==='installed'){
        if(navigator.serviceWorker.controller)await this.captureWaiting(this.registration?.waiting||worker);
        else{this.status='current';this.emit();}
      }else if(worker.state==='redundant'){
        this.status='error';this.lastError='Обновление не установлено. Текущая рабочая версия сохранена.';this.emit();
      }
    };
    worker.addEventListener('statechange',onState);onState();
  }
  async workerInfo(worker){
    if(!worker)return null;
    return new Promise(resolve=>{
      const channel=new MessageChannel();let done=false;
      const finish=v=>{if(done)return;done=true;resolve(v||null);};
      channel.port1.onmessage=e=>finish(e.data);
      try{worker.postMessage({type:'GET_VERSION'},[channel.port2]);}catch{finish(null);}
      setTimeout(()=>finish(null),1500);
    });
  }
  async captureWaiting(worker){
    this.waiting=worker;
    const info=await this.workerInfo(worker);
    this.availableVersion=info?.appVersion||'новая версия';
    this.availableDisplayVersion=info?.displayVersion||this.availableVersion;
    this.status='ready';this.lastError='';this.lastCheckedAt=new Date().toISOString();this.emit();
  }
  async check(){
    if(!this.registration){this.status='unsupported';this.emit();return false;}
    if(!navigator.onLine){this.status='offline';this.lastError='Нет соединения. Текущая версия продолжает работать локально.';this.emit();return false;}
    if(this.registration.waiting){await this.captureWaiting(this.registration.waiting);return true;}
    this.status='checking';this.lastError='';this.emit();
    try{
      await this.registration.update();
      this.lastCheckedAt=new Date().toISOString();
      if(this.registration.waiting){await this.captureWaiting(this.registration.waiting);return true;}
      const installing=this.registration.installing;
      if(installing){
        this.watchInstalling(installing);
        await new Promise(resolve=>{const done=()=>{if(['installed','redundant'].includes(installing.state)){installing.removeEventListener('statechange',done);resolve();}};installing.addEventListener('statechange',done);done();});
        if(this.registration.waiting){await this.captureWaiting(this.registration.waiting);return true;}
        if(installing.state==='redundant')return false;
      }
      this.status='current';this.emit();return false;
    }catch(e){
      this.status='error';this.lastError=`Не удалось проверить обновление: ${String(e?.message||e)}. Текущая версия не изменена.`;this.emit();return false;
    }
  }
  async activate(){
    const worker=this.registration?.waiting||this.waiting;
    if(!worker){this.status='idle';this.emit();return false;}
    this.status='activating';this.emit();
    try{worker.postMessage({type:'SKIP_WAITING'});return true;}
    catch(e){this.status='error';this.lastError=String(e?.message||e);this.emit();return false;}
  }
  label(){
    if(this.status==='ready')return 'ОБНОВЛЕНИЕ ГОТОВО';
    if(this.status==='checking')return 'ПРОВЕРЯЮ…';
    if(this.status==='downloading')return 'СКАЧИВАЮ И ПРОВЕРЯЮ…';
    if(this.status==='activating')return 'УСТАНАВЛИВАЮ…';
    if(this.status==='current')return 'УСТАНОВЛЕНА АКТУАЛЬНАЯ ВЕРСИЯ';
    if(this.status==='offline')return 'НЕТ СЕТИ · РАБОТАЕМ OFFLINE';
    if(this.status==='error')return 'ОБНОВЛЕНИЕ НЕ УСТАНОВЛЕНО';
    return 'ГОТОВО К ПРОВЕРКЕ';
  }
}
const appUpdater=new LegionUpdateManager();
