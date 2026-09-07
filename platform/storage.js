'use strict';
const KEYS=Object.freeze({
  race:'legionrx4_current_race',pilots:'legionrx4_pilot_db',champ:'legionrx4_championships',archive:'legionrx4_archive',settings:'legionrx4_settings',
  trackDays:'legionrx4_track_days',activeTrackDay:'legionrx4_active_track_day'
});
function load(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback;}catch{return fallback;}}

function save(key,v){localStorage.setItem(key,JSON.stringify(v));}

function persistRace(){
  if(state.race){state.race.updatedAt=new Date().toISOString();save(KEYS.race,state.race);}
  AppBridge.updateHeader();
}
function persistTrackDays(){save(KEYS.trackDays,state.trackDays||[]);save(KEYS.activeTrackDay,state.trackDay||null);}
function persistAll(){save(KEYS.pilots,state.pilotDb);save(KEYS.champ,state.championships);save(KEYS.archive,state.archive);save(KEYS.settings,state.settings);persistTrackDays();persistRace();}
