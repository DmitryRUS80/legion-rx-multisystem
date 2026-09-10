'use strict';
let raceVoiceQueue=Promise.resolve();
async function playPilotVoice(p,{delay=180}={}){if(!state.settings.pilotVoiceEnabled||!state.settings.announcerEnabled||!p)return false;try{return await pilotVoices.play(pilotProfileId(p),{delay});}catch(e){console.warn('Pilot voice playback',e);return false;}}

async function playPilotVoiceSequence(pilots,{initialDelay=500}={}){for(let i=0;i<(pilots||[]).length;i++)await playPilotVoice(pilots[i],{delay:i===0?initialDelay:180});}

function queueRaceVoice(task){const run=raceVoiceQueue.then(task,task);raceVoiceQueue=run.catch(e=>{console.warn('Race voice queue',e);return false;});return run;}

function announceService(key){if(!state.settings.announcerEnabled||!state.settings.voiceService)return Promise.resolve(false);return queueRaceVoice(()=>announcer.play(key,{wait:true}));}

function announceStartCall(ev){if(!state.settings.announcerEnabled||!state.settings.voiceStartCall)return Promise.resolve(false);const pilots=getEventStartPilots(state.race,ev);return queueRaceVoice(async()=>{await announcer.play('warmup_1',{wait:true});await announcer.play('callToStart',{wait:true});await playPilotVoiceSequence(pilots,{initialDelay:250});return true;});}

function announceBestLap(p){if(!state.settings.announcerEnabled||!state.settings.voiceBestLap)return Promise.resolve(false);return queueRaceVoice(async()=>{await announcer.play('newBestLap',{wait:true});await playPilotVoice(p,{delay:160});return true;});}

function announcePilotFinish(p){if(!state.settings.announcerEnabled||!state.settings.voiceFinish)return Promise.resolve(false);return queueRaceVoice(async()=>{await playPilotVoice(p,{delay:0});await announcer.play('pilotFinished',{wait:true});return true;});}

function announceHeatResults(result,race){if(!state.settings.announcerEnabled||!state.settings.voiceResults)return Promise.resolve(false);const ordered=[...(result||[])].filter(x=>x.status==='FIN').sort((a,b)=>(a.place||999)-(b.place||999)).map(x=>getPilot(race,x.pilotId)).filter(Boolean);return queueRaceVoice(async()=>{await announcer.play('heatResults',{wait:true});await playPilotVoiceSequence(ordered,{initialDelay:250});return true;});}

function announceWarmupMinute(n,initial=false){
  const text=`До старта ${minuteWords(n)}.`;
  announcer.play(`warmup_${n}`,{wait:false});
  // 4.0.23: системный SpeechSynthesis в предстартовом сценарии отключён.
  // OFFLINE READY гарантирует наш локальный голосовой пакет без системного SpeechSynthesis.
  if(state.session)state.session.announcerLine=text;
  logEvent(`Диктор: ${text}`);
}

function announceWarmup30(){
  const text='До старта тридцать секунд.';
  announcer.play('warmup_30',{wait:false});
  if(state.session){state.session.announcerLine=text;logEvent(`Диктор: ${text}`);}
}
