'use strict';
function profileForPilot(p){if(!p)return null;return state.pilotDb.find(x=>String(x.id)===String(p.profileId||p.id))||null;}

function pilotCountryCode(p){return String(p?.country||profileForPilot(p)?.country||'').toUpperCase();}

function pilotClubName(p){return String(p?.club||profileForPilot(p)?.club||'');}

function isLegionRXClub(club=''){return String(club||'').toLowerCase().replace(/[^a-zа-яё0-9]+/gi,'')==='legionrx';}

function pilotProfileId(p){return String(p?.profileId||p?.id||'');}
