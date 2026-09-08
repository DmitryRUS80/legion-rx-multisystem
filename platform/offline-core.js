'use strict';
const LEGION_APP_VERSION=globalThis.LEGION_OFFLINE_CONFIG.appVersion;
const LEGION_APP_DISPLAY_VERSION=globalThis.LEGION_OFFLINE_CONFIG.displayVersion||LEGION_APP_VERSION;
const LEGION_OFFLINE_CACHE=globalThis.LEGION_OFFLINE_CONFIG.cacheName;
const LEGION_OFFLINE_MARKER=globalThis.LEGION_OFFLINE_CONFIG.markerKey;
const LEGION_OFFLINE_ASSETS=Object.freeze([...(globalThis.LEGION_OFFLINE_CONFIG.assets||[]),...(globalThis.LEGION_OFFLINE_CONFIG.externalAssets||[])]);

class OfflineReadyManager extends EventTarget{
  constructor(){super();this.ready=false;this.checked=false;this.completed=0;this.total=LEGION_OFFLINE_ASSETS.length;this.missing=[];this.failed=[];this.lastError='';}
  emit(){this.dispatchEvent(new CustomEvent('status',{detail:this.snapshot()}));}
  snapshot(){return {ready:this.ready,checked:this.checked,completed:this.completed,total:this.total,missing:[...this.missing],failed:[...this.failed],lastError:this.lastError,version:LEGION_APP_VERSION};}
  async open(){if(!('caches'in window))throw new Error('Cache Storage недоступен');return caches.open(LEGION_OFFLINE_CACHE);}
  async validate(url,response){
    if(!response||!response.ok)throw new Error(`HTTP ${response?.status||0}`);
    const type=(response.headers.get('content-type')||'').toLowerCase();
    const binary=/\.(wav|mp3|png|svg|woff2)$/i.test(url);
    if(binary&&type.includes('text/html'))throw new Error('Вместо файла получен HTML');
    if(!binary)return true;
    const buf=await response.clone().arrayBuffer(),u=new Uint8Array(buf);
    if(/\.(wav|mp3|woff2)$/i.test(url)&&u.length<1000)throw new Error('Файл пустой или повреждён');
    if(/\.wav$/i.test(url)){const sig=String.fromCharCode(...u.slice(0,4)),wave=String.fromCharCode(...u.slice(8,12));if(sig!=='RIFF'||wave!=='WAVE')throw new Error('Некорректный WAV');}
    if(/\.mp3$/i.test(url)){const id3=u[0]===0x49&&u[1]===0x44&&u[2]===0x33,frame=u[0]===0xff&&(u[1]&0xe0)===0xe0;if(!id3&&!frame)throw new Error('Некорректный MP3');}
    if(/\.png$/i.test(url)){const ok=u.length>=8&&u[0]===0x89&&u[1]===0x50&&u[2]===0x4e&&u[3]===0x47&&u[4]===0x0d&&u[5]===0x0a&&u[6]===0x1a&&u[7]===0x0a;if(!ok)throw new Error('Некорректный PNG');}
    if(/\.svg$/i.test(url)){const svg=new TextDecoder().decode(u.slice(0,Math.min(u.length,1024)));if(!/<svg[\s>]/i.test(svg))throw new Error('Некорректный SVG');}
    if(/\.woff2$/i.test(url)){const sig=String.fromCharCode(...u.slice(0,4));if(sig!=='wOF2')throw new Error('Некорректный WOFF2');}
    return true;
  }
  async check(){
    this.checked=false;this.ready=false;this.completed=0;this.missing=[];this.failed=[];this.lastError='';this.emit();
    try{
      const cache=await this.open();
      for(const url of LEGION_OFFLINE_ASSETS){
        const hit=await cache.match(url,{ignoreSearch:false});
        if(!hit){this.missing.push(url);continue;}
        try{await this.validate(url,hit);this.completed++;}catch(e){this.missing.push(url);this.failed.push({url,error:String(e?.message||e)});}
      }
      this.ready=this.missing.length===0&&this.failed.length===0;this.checked=true;
      if(this.ready){try{localStorage.setItem(LEGION_OFFLINE_MARKER,JSON.stringify({version:LEGION_APP_VERSION,ready:true,at:new Date().toISOString()}));}catch{}}
      else this.lastError=this.failed.length?`${this.failed.length} повреждённых файл(ов)`:`Не хватает ${this.missing.length} файл(ов)`;
      this.emit();return this.ready;
    }catch(e){this.ready=false;this.checked=true;this.lastError=String(e?.message||e);this.emit();return false;}
  }
  async init(){return this.check();}
  label(){if(this.ready)return `OFFLINE READY ✓ · ${this.total}/${this.total}`;if(this.checked)return `OFFLINE НЕ ГОТОВ · ${Math.min(this.completed,this.total)}/${this.total}`;return 'ПРОВЕРЯЮ OFFLINE…';}
}
const offlineReady=new OfflineReadyManager();
