'use strict';
/* LEGION RX · PILOT CARDS
   Single authoritative UI source for pilot database cards, pilot editor and
   race pilot/model picker. Sport rules, BLE and storage engines are not used here. */

function pilotCardIcon(name,cls='pilotCardIcon'){
  const paths={
    edit:'<path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/>',
    camera:'<path d="M4 8h4l1.5-2h5L16 8h4v11H4Z"/><circle cx="12" cy="13" r="3.2"/>',
    car:'<path d="M4 14.5 5.8 9h12.4l1.8 5.5v4H18m-12 0H4v-4h16v4h-2M7 18.5h10"/><circle cx="7" cy="16" r="1.4"/><circle cx="17" cy="16" r="1.4"/>',
    close:'<path d="M6 6l12 12M18 6 6 18"/>'
  };
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.edit}</svg>`;
}

function pilotStableColor(seed='RX'){
  const palette=['#ff2d9b','#0057ff','#00a9ff','#b6ff00','#ff9f0a','#9b5cff','#00b894','#ef3e36'];
  let h=0;for(const ch of String(seed||'RX'))h=((h<<5)-h+ch.charCodeAt(0))|0;
  return palette[Math.abs(h)%palette.length];
}

function pilotModels(profile){
  const src=Array.isArray(profile?.models)?profile.models.filter(Boolean):[];
  if(src.length)return src.map((m,i)=>({
    id:String(m.id||`model-${i+1}`),name:String(m.name||'МОДЕЛЬ'),className:String(m.className||''),number:String(m.number||''),
    transponder:String(m.transponder||''),uiColor:String(m.uiColor||pilotStableColor(`${profile?.id||''}-${m.id||i}`))
  }));
  return [{id:'primary',name:String(profile?.modelName||'ОСНОВНАЯ МОДЕЛЬ'),className:String(profile?.modelClass||''),number:String(profile?.modelNumber||''),transponder:String(profile?.transponder||''),uiColor:String(profile?.uiColor||pilotStableColor(profile?.id||profile?.name||'RX'))}];
}

function pilotAvatarPlaceholderMarkup(){
  return `<svg class="pilotAvatarPlaceholder" viewBox="0 0 120 140" aria-hidden="true"><circle cx="60" cy="39" r="24"/><path d="M19 132c2-36 17-58 41-58s39 22 41 58H19Z"/></svg>`;
}

function pilotAvatarMarkup(profile,cls='pilotTileAvatar'){
  const photo=String(profile?.photo||'').trim();
  return `<div class="${cls} ${photo?'hasPhoto':'placeholder'}">${photo?`<img src="${esc(photo)}" alt="${esc(String(profile?.name||'Пилот').toUpperCase())}">`:pilotAvatarPlaceholderMarkup()}</div>`;
}

function pilotFlagBadge(profile){
  const code=pilotCountryCode(profile),pos=countryFlag(code);
  return pos?`<span class="pilotTileFlag countryFlag" style="--country-flag-position:${pos}" title="${esc(countryName(code))}" aria-label="${esc(countryName(code))}"></span>`:'';
}

function pilotEditorAvatarMarkup(profile){
  return `${pilotAvatarMarkup(profile,'pilotEditorAvatar')}${pilotFlagBadge(profile)}`;
}

function pilotCompactName(name=''){
  const parts=String(name||'').trim().toUpperCase().split(/\s+/).filter(Boolean);
  if(parts.length<=1)return parts[0]||'ПИЛОТ';
  return `${parts[0]} ${parts.slice(1).map(x=>`${x[0]||''}.`).join('')}`;
}

function pilotArchiveRef(race,profileId){
  return (race?.pilots||[]).find(p=>String(p.profileId||p.id)===String(profileId))||null;
}

function pilotCareerStats(profile){
  let races=0,wins=0,records=0;
  for(const race of state.archive||[]){
    const rp=pilotArchiveRef(race,profile.id);if(!rp)continue;
    const events=[...(race.heats||[]),...(race.finals||[])];
    for(const ev of events){
      if(!(ev?.pilots||[]).some(id=>String(id)===String(rp.id)))continue;
      if(!ev.saved)continue;
      races++;
      const result=(ev.result||[]).find(x=>String(x.pilotId)===String(rp.id));
      if(result&&String(result.status||'FIN')==='FIN'&&Number(result.place)===1)wins++;
      const mine=Number(ev.lapStats?.[rp.id]?.bestLapMs);
      if(Number.isFinite(mine)&&mine>0){
        const all=(ev.pilots||[]).map(id=>Number(ev.lapStats?.[id]?.bestLapMs)).filter(x=>Number.isFinite(x)&&x>0);
        if(all.length&&mine===Math.min(...all))records++;
      }
    }
  }
  return{races,wins,records};
}

function pilotModelTileMarkup(profile,model,{selectable=false,selected=false,compact=false}={}){
  const idText=model.number||model.transponder||'—',modelName=String(model.name||'').trim(),className=String(model.className||'').trim();
  const cls=['pilotModelTile',selectable?'selectable':'',selected?'selected':'',compact?'compact':''].filter(Boolean).join(' ');
  return `<button type="button" class="${cls}" ${selectable?`data-race-model-toggle="${esc(profile.id)}" data-model-id="${esc(model.id)}" aria-pressed="${selected?'true':'false'}"`:'tabindex="-1"'} style="--pilot-model-color:${esc(model.uiColor||pilotStableColor(model.id))}">
    <span class="pilotModelId">${esc(idText)}</span>
    <span class="pilotModelInfo"><b>${esc((modelName||'ОСНОВНАЯ МОДЕЛЬ').toUpperCase())}</b>${className?`<small>${esc(className.toUpperCase())}</small>`:''}</span>
  </button>`;
}

function pilotCardMarkup(profile){
  const stats=pilotCareerStats(profile),models=pilotModels(profile);
  return `<article class="pilotTile" data-pilot-card="${esc(profile.id)}">
    <div class="pilotTileGlass"></div>
    <div class="pilotTileProfile">
      <div class="pilotTilePortrait">${pilotAvatarMarkup(profile)}${pilotFlagBadge(profile)}</div>
      <h2 class="pilotTileName">${esc(String(profile.name||'ПИЛОТ').toUpperCase())}</h2>
    </div>
    <div class="pilotTileStats" aria-label="Статистика пилота">
      <span><small>ГОНКИ</small><b>${stats.races}</b></span>
      <span><small>ПОБЕДЫ</small><b>${stats.wins}</b></span>
      <span><small>РЕКОРДЫ</small><b>${stats.records}</b></span>
    </div>
    <button class="pilotTileEdit" type="button" data-edit-pilot="${esc(profile.id)}" aria-label="Редактировать пилота">${pilotCardIcon('edit')}</button>
    <div class="pilotTileModels">${models.map(m=>pilotModelTileMarkup(profile,m,{compact:true})).join('')}</div>
  </article>`;
}

function pilotsView(){
  return `<section class="page pilotsPage"><div class="pageHeader pilotsPageHeader"><div><div class="sectionLabel">ОБЩАЯ БАЗА</div><h1>Пилоты</h1><p>Профили, модели и транспондеры. В гонку модель добавляется одним касанием.</p></div><button class="btn primary" data-action="new-db-pilot">＋ Пилот</button></div><div class="pilotTileGrid">${state.pilotDb.length?state.pilotDb.map(p=>pilotCardMarkup(p)).join(''):`<div class="card empty">Создайте первый профиль пилота.</div>`}</div></section>`;
}

function pilotEditorOriginStyle(rect){
  if(!rect)return'';
  const x=Math.max(0,Math.min(innerWidth,rect.left+rect.width/2)),y=Math.max(0,Math.min(innerHeight,rect.top+rect.height/2));
  return `--pilot-origin-x:${x}px;--pilot-origin-y:${y}px;`;
}

function pilotModelEditorMarkup(model,index){
  const color=model.uiColor||pilotStableColor(model.id||index);
  return `<section class="pilotModelEditor" data-editor-model="${esc(model.id)}" style="--pilot-model-color:${esc(color)}">
    <div class="pilotModelEditorTop"><span class="pilotModelColor"><input type="color" data-model-field="uiColor" value="${esc(color)}" aria-label="Цвет модели"></span><b>МОДЕЛЬ ${index+1}</b><button type="button" data-remove-model="${esc(model.id)}" aria-label="Удалить модель">${pilotCardIcon('close')}</button></div>
    <div class="pilotModelEditorFields">
      <label><span>КЛАСС</span><input data-model-field="className" value="${esc(model.className||'')}" placeholder="RALLY-10"></label>
      <label><span>МОДЕЛЬ</span><input data-model-field="name" value="${esc(model.name||'')}" placeholder="LC RACING PTG2R"></label>
      <label><span>НОМЕР / ID</span><input data-model-field="number" value="${esc(model.number||'')}" placeholder="23"></label>
      <label><span>ТРАНСПОНДЕР</span><input data-model-field="transponder" inputmode="numeric" value="${esc(model.transponder||'')}" placeholder="123456"></label>
    </div>
  </section>`;
}

function pilotCollectEditorModels(){
  return $$('[data-editor-model]').map((el,i)=>({
    id:el.dataset.editorModel||uid('model'),
    className:el.querySelector('[data-model-field="className"]')?.value.trim()||'',
    name:el.querySelector('[data-model-field="name"]')?.value.trim()||`МОДЕЛЬ ${i+1}`,
    number:el.querySelector('[data-model-field="number"]')?.value.trim()||'',
    transponder:el.querySelector('[data-model-field="transponder"]')?.value.trim()||'',
    uiColor:el.querySelector('[data-model-field="uiColor"]')?.value||pilotStableColor(el.dataset.editorModel||i)
  }));
}

function pilotRenderModelEditors(models){
  const host=$('#pilotModelEditors');if(!host)return;
  host.innerHTML=models.map((m,i)=>pilotModelEditorMarkup(m,i)).join('')+`<button type="button" class="pilotAddModelTile" id="pilotAddModel">${pilotCardIcon('plus')}<span><b>ДОБАВИТЬ МОДЕЛЬ</b><small>Класс · ID · транспондер</small></span></button>`;
  host.querySelectorAll('[data-remove-model]').forEach(b=>b.onclick=()=>{
    const current=pilotCollectEditorModels().filter(m=>String(m.id)!==String(b.dataset.removeModel));
    pilotRenderModelEditors(current.length?current:[{id:uid('model'),name:'ОСНОВНАЯ МОДЕЛЬ',className:'',number:'',transponder:'',uiColor:pilotStableColor(Date.now())}]);
  });
  $('#pilotAddModel').onclick=()=>{const current=pilotCollectEditorModels();current.push({id:uid('model'),name:`МОДЕЛЬ ${current.length+1}`,className:'',number:'',transponder:'',uiColor:pilotStableColor(Date.now()+current.length)});pilotRenderModelEditors(current);};
}

function pilotResizeAvatar(file){
  return new Promise((resolve,reject)=>{
    if(!file)return resolve('');
    if(file.size>8*1024*1024)return reject(new Error('Изображение больше 8 МБ'));
    const reader=new FileReader();reader.onerror=()=>reject(new Error('Не удалось прочитать изображение'));
    reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('Не удалось открыть изображение'));img.onload=()=>{
      const max=720,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
      let data=canvas.toDataURL('image/webp',.86);if(!data||data==='data:,')data=String(reader.result||'');
      if(data.length>1_600_000)return reject(new Error('Аватар слишком большой после обработки'));
      resolve(data);
    };img.src=String(reader.result||'');};reader.readAsDataURL(file);
  });
}

function pilotModal(existing=null,addToRace=false,originRect=null){
  const id=existing?.id||uid('profile'),voice=existing?.voice||null,voiceReady=voice?.status==='ready',voiceStale=voiceReady&&voice.text!==existing?.name;let pendingVoice=voice,pendingPhoto=existing?.photo||'';
  const initialModels=pilotModels(existing||{id,name:'',transponder:''}).map(m=>({...m,id:m.id==='primary'&&existing?.models?.length!==0?m.id:(existing?.models?.length?m.id:uid('model'))}));
  $('#modalHost').innerHTML=`<div class="pilotEditorBackdrop" style="${pilotEditorOriginStyle(originRect)}"><section class="pilotEditorPanel" role="dialog" aria-modal="true">
    <header class="pilotEditorHead"><div><div class="sectionLabel">ПИЛОТ</div><h2>${existing?'ПРОФИЛЬ ПИЛОТА':'НОВЫЙ ПИЛОТ'}</h2></div><button class="pilotEditorClose" id="closeModal" type="button" aria-label="Закрыть">${pilotCardIcon('close')}</button></header>
    <div class="pilotEditorHero">
      <label class="pilotEditorAvatarButton" id="pilotAvatarButton" for="pilotAvatarFile" aria-label="Загрузить аватар"><span id="pilotEditorAvatarPreview">${pilotEditorAvatarMarkup({...existing,photo:pendingPhoto,name:existing?.name||'RX'})}</span><i>${pilotCardIcon('camera')}</i></label>
      <input id="pilotAvatarFile" type="file" accept="image/png,image/jpeg,image/webp" hidden>
      <div class="pilotEditorIdentity"><label><span>ФАМИЛИЯ ИМЯ</span><input id="mName" value="${esc(existing?.name||'')}" placeholder="ДМИТРИЙ КОЧЕТКОВ"></label><div class="pilotEditorIdentityGrid"><label><span>СТРАНА</span><select id="mCountry">${countryOptions(existing?.country||'')}</select></label><label><span>КЛУБ</span><input id="mClub" value="${esc(existing?.club||'')}" placeholder="LEGION RX"></label><label><span>ГОРОД</span><input id="mCity" value="${esc(existing?.city||'')}" placeholder="Пенза"></label></div></div>
    </div>
    <div class="pilotEditorSectionHead"><div><div class="sectionLabel">ГАРАЖ</div><h3>МОДЕЛИ ПИЛОТА</h3></div><small>В соревнование модель выбирается одним нажатием по её плитке.</small></div>
    <div class="pilotModelEditorGrid" id="pilotModelEditors"></div>
    <details class="pilotEditorVoice"><summary><span>ИМЯ ДЛЯ ДИКТОРА</span><em id="pilotVoiceState" class="pilotVoiceState ${voiceStale?'stale':voiceReady?'ready':''}">${voiceStale?'ИМЯ ИЗМЕНЕНО':voiceReady?'ГОТОВО ОФЛАЙН':'НЕ ЗАГРУЖЕНО'}</em></summary><div class="pilotVoiceBody"><input id="pilotVoiceFile" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,.mp3,.wav,.ogg" hidden><div class="pilotVoiceActions"><button class="btn primary" id="uploadPilotVoice" type="button">${voiceReady?'Заменить файл':'Загрузить имя'}</button><button class="btn secondary" id="playPilotVoice" type="button" ${voiceReady?'':'disabled'}>▶ Прослушать</button><button class="btn danger" id="deletePilotVoice" type="button" ${voiceReady?'':'disabled'}>Удалить запись</button></div><div class="pilotVoiceHint">MP3, WAV или OGG до 5 МБ. Файл хранится локально и работает офлайн.</div></div></details>
    <footer class="pilotEditorFoot">${existing?`<button class="pilotEditorDelete" id="deletePilotProfile" type="button">${pilotCardIcon('trash')} УДАЛИТЬ ПРОФИЛЬ</button>`:'<span></span>'}<button class="btn primary pilotEditorSave" id="savePilotModal" type="button">СОХРАНИТЬ</button></footer>
  </section></div>`;
  pilotRenderModelEditors(initialModels);
  $('#closeModal').onclick=closeModal;
  $('#pilotAvatarFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{pendingPhoto=await pilotResizeAvatar(file);$('#pilotEditorAvatarPreview').innerHTML=pilotEditorAvatarMarkup({name:$('#mName').value||existing?.name||'RX',photo:pendingPhoto,country:$('#mCountry')?.value||existing?.country||''});toast('Аватар загружен');}catch(err){toast(err.message);}finally{e.target.value='';}};
  $('#uploadPilotVoice').onclick=()=>{if(!$('#mName').value.trim())return toast('Сначала введите имя пилота');$('#pilotVoiceFile').click();};
  $('#pilotVoiceFile').onchange=async e=>{const file=e.target.files?.[0],name=$('#mName').value.trim(),status=$('#pilotVoiceState');if(!file)return;if(file.size>5*1024*1024)return toast('Файл больше 5 МБ');if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|ogg)$/i.test(file.name))return toast('Выберите MP3, WAV или OGG');status.className='pilotVoiceState';status.textContent='СОХРАНЕНИЕ…';try{await pilotVoices.put(id,name,file,file.name);pendingVoice={source:'local-file',fileName:file.name,text:name,status:'ready',updatedAt:new Date().toISOString()};const idx=state.pilotDb.findIndex(p=>p.id===id);if(idx>=0){state.pilotDb[idx].voice=pendingVoice;save(KEYS.pilots,state.pilotDb);}if(existing)existing.voice=pendingVoice;status.className='pilotVoiceState ready';status.textContent='ГОТОВО ОФЛАЙН';$('#playPilotVoice').disabled=false;$('#deletePilotVoice').disabled=false;$('#uploadPilotVoice').textContent='Заменить файл';toast('Запись имени сохранена');}catch(err){status.className='pilotVoiceState stale';status.textContent='ОШИБКА';toast(err.message);}finally{e.target.value='';}};
  $('#playPilotVoice').onclick=async()=>{try{const ok=await pilotVoices.play(id);if(!ok)toast('Запись имени не найдена на этом устройстве');}catch(e){toast(`Не удалось воспроизвести: ${e.message}`);}};
  $('#deletePilotVoice').onclick=async()=>{try{await pilotVoices.remove(id);pendingVoice=null;if(existing)existing.voice=null;const idx=state.pilotDb.findIndex(p=>p.id===id);if(idx>=0){state.pilotDb[idx].voice=null;save(KEYS.pilots,state.pilotDb);}$('#pilotVoiceState').className='pilotVoiceState';$('#pilotVoiceState').textContent='НЕ ЗАГРУЖЕНО';$('#playPilotVoice').disabled=true;$('#deletePilotVoice').disabled=true;$('#uploadPilotVoice').textContent='Загрузить имя';toast('Запись имени удалена');}catch(e){toast(e.message);}};
  $('#mName').addEventListener('input',()=>{const status=$('#pilotVoiceState');if(pendingVoice?.status==='ready'&&$('#mName').value.trim()!==pendingVoice.text){status.className='pilotVoiceState stale';status.textContent='НУЖНО ОБНОВИТЬ';}});
  $('#mCountry').addEventListener('change',()=>{$('#pilotEditorAvatarPreview').innerHTML=pilotEditorAvatarMarkup({name:$('#mName').value||existing?.name||'RX',photo:pendingPhoto,country:$('#mCountry').value});});
  if(existing)$('#deletePilotProfile').onclick=()=>{if(!confirm('Удалить профиль пилота из общей базы?'))return;state.pilotDb=state.pilotDb.filter(p=>p.id!==id);save(KEYS.pilots,state.pilotDb);pilotVoices.remove(id).catch(()=>{});closeModal();render();};
  $('#savePilotModal').onclick=()=>{
    const name=$('#mName').value.trim();if(!name)return toast('Введите имя');const models=pilotCollectEditorModels().filter(m=>m.name||m.transponder||m.number||m.className);if(!models.length)return toast('Добавьте хотя бы одну модель');
    const voiceMeta=pendingVoice?.status==='ready'?{...pendingVoice,status:pendingVoice.text===name?'ready':'stale'}:pendingVoice||null;
    const first=models[0],profile={id,name,club:$('#mClub').value.trim(),city:$('#mCity').value.trim(),country:$('#mCountry').value.trim().toUpperCase(),transponder:first.transponder||'',photo:pendingPhoto||'',voice:voiceMeta,models};
    const idx=state.pilotDb.findIndex(p=>p.id===id);if(idx>=0)state.pilotDb[idx]=profile;else state.pilotDb.push(profile);save(KEYS.pilots,state.pilotDb);
    if(addToRace&&state.race?.stage==='setup'&&!state.race.pilots.some(p=>p.profileId===id))pilotToggleRaceModel(id,first.id,false);
    closeModal();render();
  };
}

function pilotRaceEntryForProfile(profileId){return state.race?.pilots?.find(p=>String(p.profileId||p.id)===String(profileId))||null;}
function pilotSelectedModelId(profile){const entry=pilotRaceEntryForProfile(profile.id);if(!entry)return'';return String(entry.modelId||pilotModels(profile)[0]?.id||'');}

function pilotToggleRaceModel(profileId,modelId,refresh=true){
  if(!state.race||state.race.stage!=='setup')return;
  const profile=state.pilotDb.find(p=>String(p.id)===String(profileId));if(!profile)return;
  const models=pilotModels(profile),model=models.find(m=>String(m.id)===String(modelId));if(!model)return;
  const idx=state.race.pilots.findIndex(p=>String(p.profileId||p.id)===String(profileId)),current=idx>=0?state.race.pilots[idx]:null;
  if(current&&String(current.modelId||models[0]?.id)===String(model.id))state.race.pilots.splice(idx,1);
  else{
    const order=idx>=0?(current.registrationOrder||idx+1):state.race.pilots.length+1;
    const racePilot=makePilot({...profile,profileId:profile.id,transponder:model.transponder||profile.transponder||''},order);
    racePilot.profileId=profile.id;racePilot.modelId=model.id;racePilot.modelName=model.name;racePilot.modelClass=model.className;racePilot.modelNumber=model.number;racePilot.uiColor=model.uiColor;
    if(idx>=0)state.race.pilots[idx]=racePilot;else state.race.pilots.push(racePilot);
  }
  state.race.pilots.forEach((p,i)=>p.registrationOrder=i+1);persistRace();if(refresh)pilotPicker();
}

function pilotRaceSetupTileMarkup(racePilot,index){
  const profile=state.pilotDb.find(p=>String(p.id)===String(racePilot.profileId||racePilot.id))||racePilot;
  const sourceModels=pilotModels(profile),model=sourceModels.find(m=>String(m.id)===String(racePilot.modelId))||{
    id:String(racePilot.modelId||'race-model'),name:String(racePilot.modelName||'ОСНОВНАЯ МОДЕЛЬ'),className:String(racePilot.modelClass||''),number:String(racePilot.modelNumber||''),transponder:String(racePilot.transponder||''),uiColor:String(racePilot.uiColor||pilotStableColor(racePilot.id||index))
  };
  const idText=model.number||model.transponder||'—',name=pilotCompactName(racePilot.name||profile.name||'ПИЛОТ');
  return `<button type="button" class="pilotRaceSetupTile" data-remove-race-pilot="${esc(racePilot.id)}" title="${esc(String(model.name||'').toUpperCase())}${model.className?` · ${esc(String(model.className).toUpperCase())}`:''}" style="--pilot-model-color:${esc(model.uiColor||pilotStableColor(model.id))}"><span class="pilotRaceSetupPortrait">${pilotAvatarMarkup(profile,'pilotRaceSetupAvatar')}${pilotFlagBadge(profile)}</span><span class="pilotRaceSetupCaption"><b class="pilotRaceSetupId">${esc(idText)}</b><strong class="pilotRaceSetupName">${esc(name)}</strong></span></button>`;
}

function pilotPickerCardMarkup(profile){
  const selected=pilotSelectedModelId(profile),stats=pilotCareerStats(profile),models=pilotModels(profile);
  return `<article class="pilotSelectCard ${selected?'hasSelection':''}"><div class="pilotSelectHead"><div class="pilotSelectPortrait">${pilotAvatarMarkup(profile,'pilotSelectAvatar')}${pilotFlagBadge(profile)}</div><div><small>${esc((profile.club||'БЕЗ КЛУБА').toUpperCase())}</small><b>${esc(String(profile.name||'ПИЛОТ').toUpperCase())}</b><span>${stats.races} гонок · ${stats.wins} побед</span></div></div><div class="pilotSelectModels">${models.map(m=>pilotModelTileMarkup(profile,m,{selectable:true,selected:String(selected)===String(m.id)})).join('')}</div></article>`;
}

function pilotPicker(){
  if(!state.race)return;
  $('#modalHost').innerHTML=`<div class="pilotPickerBackdrop"><section class="pilotPickerPanel"><header class="pilotPickerHead"><div><div class="sectionLabel">БАЗА ПИЛОТОВ</div><h2>ВЫБОР В ЗАЕЗД</h2><p>Нажмите на модель — она войдёт в соревнование. Повторное нажатие убирает её.</p></div><div class="pilotPickerCount"><small>УЧАСТНИКИ</small><b>${state.race.pilots.length}</b></div><button class="pilotEditorClose" id="closeModal" type="button">${pilotCardIcon('close')}</button></header><div class="pilotSelectGrid">${state.pilotDb.length?state.pilotDb.map(p=>pilotPickerCardMarkup(p)).join(''):'<div class="card empty">Сначала создайте пилотов в общей базе.</div>'}</div></section></div>`;
  $('#closeModal').onclick=()=>{closeModal();render();};
  $$('[data-race-model-toggle]').forEach(b=>b.onclick=()=>pilotToggleRaceModel(b.dataset.raceModelToggle,b.dataset.modelId,true));
}
