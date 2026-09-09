'use strict';
const KEYS=Object.freeze({
  race:'legionrx4_current_race',pilots:'legionrx4_pilot_db',champ:'legionrx4_championships',archive:'legionrx4_archive',settings:'legionrx4_settings',
  trackDays:'legionrx4_track_days',activeTrackDay:'legionrx4_active_track_day'
});
function load(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback;}catch{return fallback;}}

function isQuotaError(err){return !!err&&(err.name==='QuotaExceededError'||err.name==='NS_ERROR_DOM_QUOTA_REACHED'||err.code===22||err.code===1014);}
function stripEmbeddedPilotPhotos(value){
  if(!value||typeof value!=='object')return value;
  if(Array.isArray(value)){value.forEach(stripEmbeddedPilotPhotos);return value;}
  for(const key of Object.keys(value)){
    if(key==='photo'&&typeof value[key]==='string'&&value[key].startsWith('data:image/')){delete value[key];continue;}
    stripEmbeddedPilotPhotos(value[key]);
  }
  return value;
}
function compactRaceForStorage(race){return race?stripEmbeddedPilotPhotos(deepClone(race)):race;}
function compactTrackDayForStorage(td){return td?stripEmbeddedPilotPhotos(deepClone(td)):td;}
function compactStorageValue(key,value){
  if(key===KEYS.race)return compactRaceForStorage(value);
  if(key===KEYS.archive)return Array.isArray(value)?value.map(compactRaceForStorage):value;
  if(key===KEYS.trackDays)return Array.isArray(value)?value.map(compactTrackDayForStorage):value;
  if(key===KEYS.activeTrackDay)return compactTrackDayForStorage(value);
  return value;
}
function compactLegacyStorage(){
  for(const key of [KEYS.race,KEYS.archive,KEYS.trackDays,KEYS.activeTrackDay]){
    try{
      const raw=localStorage.getItem(key);if(!raw)continue;
      const parsed=JSON.parse(raw),next=JSON.stringify(compactStorageValue(key,parsed));
      if(next.length<raw.length)localStorage.setItem(key,next);
    }catch(err){console.warn('LEGION RX storage compaction skipped',key,err);}
  }
}
function save(key,v){
  const payload=JSON.stringify(compactStorageValue(key,v));
  try{localStorage.setItem(key,payload);return true;}catch(err){
    if(!isQuotaError(err))throw err;
    compactLegacyStorage();
    try{localStorage.setItem(key,payload);return true;}catch(retryErr){
      if(isQuotaError(retryErr))throw new Error('Локальное хранилище заполнено. Удалите старые архивы/лишние фоновые изображения и повторите сохранение.');
      throw retryErr;
    }
  }
}
function persistRace(){
  if(state.race){state.race.updatedAt=new Date().toISOString();save(KEYS.race,state.race);}
  AppBridge.updateHeader();
}
function persistTrackDays(){save(KEYS.trackDays,state.trackDays||[]);save(KEYS.activeTrackDay,state.trackDay||null);}
function persistAll(){save(KEYS.pilots,state.pilotDb);save(KEYS.champ,state.championships);save(KEYS.archive,state.archive);save(KEYS.settings,state.settings);persistTrackDays();persistRace();}

/* Remove legacy duplicate base64 pilot photos from race/practice snapshots before state is loaded. */
compactLegacyStorage();
