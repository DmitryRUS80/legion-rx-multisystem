'use strict';
/* LEGION RX · CLASSIC RC audio adapter.
   Uses platform/audio.js + PilotVoiceStore only. Never imports RallyCross. */
const ClassicRCAudio=(()=>{
  let voiceQueue=Promise.resolve();

  function queue(task){
    const run=voiceQueue.then(task,task);
    voiceQueue=run.catch(e=>{console.warn('Classic RC voice queue',e);return false;});
    return run;
  }
  function voiceEnabled(){return Boolean(state.settings.announcerEnabled);}
  async function pilotVoice(p,{delay=140}={}){
    if(!voiceEnabled()||!state.settings.pilotVoiceEnabled||!p)return false;
    try{return await pilotVoices.play(pilotProfileId(p),{delay});}
    catch(e){console.warn('Classic RC pilot voice',e);return false;}
  }
  function service(key){
    if(!voiceEnabled()||!state.settings.voiceService)return Promise.resolve(false);
    return queue(()=>announcer.play(key,{wait:true}));
  }
  function countdownTick(n){
    if(!voiceEnabled()||!state.settings.voiceStartCall)return false;
    const value=Number(n);
    // Keep the sporting 10-second clock untouched. Audio is an overlay only.
    if(value===10){announcer.play('prestart10',{wait:false});return true;}
    if(value<=9&&value>=5){announcer.play(`countdown_${value}`,{wait:false});return true;}
    if(value===4){announcer.play('goodRace',{wait:false});return true;}
    return false;
  }
  function startSignal(){return announcer.play('startRace',{wait:false,force:true});}
  function bleep(){if(!state.settings.lapSound)return false;return announcer.playBleep({force:true});}
  function bestLap(p){
    if(!voiceEnabled()||!state.settings.voiceBestLap)return Promise.resolve(false);
    return queue(async()=>{await announcer.play('newBestLap',{wait:true});await pilotVoice(p,{delay:120});return true;});
  }
  function pilotFinished(p){
    if(!voiceEnabled()||!state.settings.voiceFinish)return Promise.resolve(false);
    return queue(async()=>{await pilotVoice(p,{delay:0});await announcer.play('pilotFinished',{wait:true});return true;});
  }
  function timeExpired(){
    if(!voiceEnabled()||!state.settings.voiceService)return Promise.resolve(false);
    return queue(async()=>{await announcer.play('timeExpired',{wait:true});await announcer.play('finishCurrentLap',{wait:true});return true;});
  }
  function heatFinished({allPilots=false,stopped=false}={}){
    if(!voiceEnabled()||!state.settings.voiceService)return Promise.resolve(false);
    return queue(async()=>{if(stopped)await announcer.play('raceStopped',{wait:true});else if(allPilots)await announcer.play('allPilotsFinished',{wait:true});else await announcer.play('heatFinished',{wait:true});return true;});
  }
  function heatResults(result){
    if(!voiceEnabled()||!state.settings.voiceResults)return Promise.resolve(false);
    const ordered=[...(result||[])].filter(x=>x.status==='FIN').sort((a,b)=>(a.place??999)-(b.place??999)).map(x=>ClassicRCEngine.pilot(x.pilotId)).filter(Boolean);
    return queue(async()=>{await announcer.play('heatResults',{wait:true});for(let i=0;i<ordered.length;i++)await pilotVoice(ordered[i],{delay:i?140:220});return true;});
  }
  function cancel(){voiceQueue=Promise.resolve();try{announcer.cancel();}catch{}}
  return Object.freeze({countdownTick,startSignal,bleep,bestLap,pilotFinished,service,timeExpired,heatFinished,heatResults,cancel});
})();
