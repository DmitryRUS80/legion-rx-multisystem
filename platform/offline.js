'use strict';
const LEGION_APP_VERSION=globalThis.LEGION_OFFLINE_CONFIG.appVersion;
const LEGION_OFFLINE_CACHE=globalThis.LEGION_OFFLINE_CONFIG.cacheName;
const LEGION_OFFLINE_MARKER=globalThis.LEGION_OFFLINE_CONFIG.markerKey;
const LEGION_OFFLINE_ASSETS=globalThis.LEGION_OFFLINE_CONFIG.assets;
class OfflineReadyManager extends EventTarget{
  constructor(){
    super();this.ready=false;this.preparing=false;this.checked=false;this.completed=0;this.total=LEGION_OFFLINE_ASSETS.length;this.missing=[];this.failed=[];this.lastError='';
  }
  emit(){this.dispatchEvent(new CustomEvent('status',{detail:this.snapshot()}));}
  snapshot(){return {ready:this.ready,preparing:this.preparing,checked:this.checked,completed:this.completed,total:this.total,missing:[...this.missing],failed:[...this.failed],lastError:this.lastError,version:LEGION_APP_VERSION};}
  async open(){if(!('caches'in window))throw new Error('Cache Storage недоступен');return caches.open(LEGION_OFFLINE_CACHE);}
  async check(){
    this.checked=false;this.lastError='';this.failed=[];this.completed=0;
    try{
      const cache=await this.open(),missing=[];
      for(const url of LEGION_OFFLINE_ASSETS){
        const hit=await cache.match(url,{ignoreSearch:true});
        if(!hit){missing.push(url);continue;}
        try{await this.validate(url,hit);this.completed++;}
        catch(e){missing.push(url);this.failed.push({url,error:String(e?.message||e)});}
      }
      this.missing=missing;this.ready=missing.length===0&&this.failed.length===0;this.checked=true;
      if(this.ready){try{localStorage.setItem(LEGION_OFFLINE_MARKER,JSON.stringify({version:LEGION_APP_VERSION,ready:true,at:new Date().toISOString()}));}catch{}this.cleanupOldCaches();}
      else if(this.failed.length)this.lastError=`${this.failed.length} повреждённых файл(ов)`;
      this.emit();return this.ready;
    }catch(e){this.ready=false;this.checked=true;this.lastError=String(e?.message||e);this.emit();return false;}
  }
  async validate(url,response){
    if(!response||!response.ok)throw new Error(`HTTP ${response?.status||0}`);
    const type=(response.headers.get('content-type')||'').toLowerCase();
    const isBinary=/\.(wav|mp3|png|svg)$/i.test(url);
    if(isBinary&&type.includes('text/html'))throw new Error('Вместо файла получен HTML');
    if(isBinary){
      const buf=await response.clone().arrayBuffer(),u=new Uint8Array(buf);
      if(/\.(wav|mp3)$/i.test(url)&&u.length<1000)throw new Error('Аудиофайл пустой или повреждён');
      if(/\.wav$/i.test(url)){
        const sig=String.fromCharCode(...u.slice(0,4)),wave=String.fromCharCode(...u.slice(8,12));
        if(sig!=='RIFF'||wave!=='WAVE')throw new Error('Некорректный WAV');
      }
      if(/\.mp3$/i.test(url)){
        const id3=u[0]===0x49&&u[1]===0x44&&u[2]===0x33,frame=u[0]===0xff&&(u[1]&0xe0)===0xe0;
        if(!id3&&!frame)throw new Error('Некорректный MP3');
      }
      if(/\.png$/i.test(url)){
        const png=u.length>=8&&u[0]===0x89&&u[1]===0x50&&u[2]===0x4e&&u[3]===0x47&&u[4]===0x0d&&u[5]===0x0a&&u[6]===0x1a&&u[7]===0x0a;
        if(!png)throw new Error('Некорректный PNG');
      }
      if(/\.svg$/i.test(url)){
        const svg=new TextDecoder().decode(u.slice(0,Math.min(u.length,1024)));
        if(!/<svg[\s>]/i.test(svg))throw new Error('Некорректный SVG');
      }
    }
    return true;
  }
  async prepare({force=false}={}){
    if(this.preparing)return false;
    if(this.ready&&!force)return true;
    this.preparing=true;this.ready=false;this.checked=true;this.completed=0;this.failed=[];this.lastError='';this.emit();
    try{
      const cache=await this.open();
      for(const url of LEGION_OFFLINE_ASSETS){
        try{
          let hit=!force?await cache.match(url,{ignoreSearch:true}):null;
          if(hit){try{await this.validate(url,hit);}catch{await cache.delete(url);hit=null;}}
          if(!hit){
            const response=await fetch(url,{cache:'reload'});await this.validate(url,response);await cache.put(url,response.clone());
          }
          const saved=await cache.match(url,{ignoreSearch:true});await this.validate(url,saved);this.completed++;
        }catch(e){this.failed.push({url,error:String(e?.message||e)});}
        this.emit();
      }
      this.missing=[];
      for(const url of LEGION_OFFLINE_ASSETS){
        const hit=await cache.match(url,{ignoreSearch:true});
        if(!hit){this.missing.push(url);continue;}
        try{await this.validate(url,hit);}catch{this.missing.push(url);}
      }
      this.ready=this.missing.length===0&&this.failed.length===0;
      if(this.ready){
        try{localStorage.setItem(LEGION_OFFLINE_MARKER,JSON.stringify({version:LEGION_APP_VERSION,ready:true,at:new Date().toISOString()}));}catch{}
        this.cleanupOldCaches();
      }else{
        this.lastError=this.failed.length?`${this.failed.length} файл(ов) не удалось сохранить`:`Не хватает ${this.missing.length} файл(ов)`;
      }
    }catch(e){this.lastError=String(e?.message||e);this.ready=false;}
    this.preparing=false;this.checked=true;this.emit();return this.ready;
  }
  async init(){
    const ok=await this.check();if(ok)return true;
    // Первая загрузка версии: пробуем подготовить пакет автоматически.
    // Если сети нет, валидные файлы могут быть взяты через предыдущий service worker cache.
    return this.prepare();
  }
  cleanupOldCaches(){
    try{navigator.serviceWorker?.controller?.postMessage({type:'OFFLINE_READY_CLEANUP',cache:LEGION_OFFLINE_CACHE});}catch{}
  }
  label(){
    if(this.ready)return `OFFLINE READY ✓ · ${this.total}/${this.total}`;
    if(this.preparing)return `ПОДГОТОВКА OFFLINE · ${Math.min(this.completed,this.total)}/${this.total}`;
    if(this.checked)return `OFFLINE НЕ ГОТОВ · ${Math.min(this.completed,this.total)}/${this.total}`;
    return 'ПРОВЕРЯЮ OFFLINE…';
  }
}
const offlineReady=new OfflineReadyManager();
