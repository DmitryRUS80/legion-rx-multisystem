'use strict';
/* Active-race pilot identity updates. Keeps competition identity keyed by pilot id;
   transponder/name are editable attributes and never re-key saved sport results. */
function updateActiveRacePilotIdentity(pilotId,input={}){
  const race=state.race;if(!race)return{ok:false,error:'Нет активного соревнования'};
  const pilot=(race.pilots||[]).find(p=>String(p.id)===String(pilotId));if(!pilot)return{ok:false,error:'Пилот не найден в соревновании'};
  const name=String(input.name??pilot.name??'').trim();if(!name)return{ok:false,error:'Введите имя пилота'};
  const transponder=String(input.transponder??pilot.transponder??'').trim();if(!transponder)return{ok:false,error:'Введите ID транспондера'};
  const conflict=(race.pilots||[]).find(p=>String(p.id)!==String(pilot.id)&&String(p.transponder||'')===transponder);
  if(conflict)return{ok:false,error:`Транспондер ${transponder} уже используется: ${conflict.name}`};
  const club=String(input.club??pilot.club??'').trim(),country=String(input.country??pilot.country??'').trim().toUpperCase();
  pilot.name=name;pilot.transponder=transponder;pilot.club=club;pilot.country=country;
  const live=state.session?.live?.[pilot.id];if(live)live.lastDeviceMs=null;
  const profile=profileForPilot(pilot);
  if(profile){
    profile.name=name;profile.club=club;profile.country=country;
    if(profile.voice?.status==='ready'&&String(profile.voice.text||'')!==name)profile.voice={...profile.voice,status:'stale'};
    const models=Array.isArray(profile.models)?profile.models:[];
    const model=models.find(m=>String(m.id)===String(pilot.modelId))||models[0]||null;
    if(model){model.transponder=transponder;model.number=transponder;pilot.modelId=model.id;pilot.modelName=model.name||pilot.modelName||'';pilot.modelClass=model.className||pilot.modelClass||'';pilot.modelNumber=transponder;pilot.uiColor=model.uiColor||pilot.uiColor;}
    if(!models.length||model===models[0])profile.transponder=transponder;
    save(KEYS.pilots,state.pilotDb);
  }
  persistRace();
  return{ok:true,pilot,profile};
}
