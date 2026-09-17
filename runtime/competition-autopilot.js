'use strict';
/* LEGION RX · neutral competition autopilot.
   Owns only timeline automation state. It does not know sport rules or modes. */
const CompetitionAutoPilot=(()=>{
  const clone=v=>JSON.parse(JSON.stringify(v));
  const defaults=()=>({enabled:false,paused:false,pauseReason:'',resumeAfterHold:false,autoSave:true,reviewDelayMs:8000,startedAtEpoch:null,pausedAtEpoch:null,finishedEventKey:'',finishedAtEpoch:null,lastAction:'',lastActionEpoch:null});
  function ensure(owner){if(!owner)return null;const old=owner.autoDirector&&typeof owner.autoDirector==='object'?owner.autoDirector:{};owner.autoDirector={...defaults(),...old};return owner.autoDirector;}
  function start(owner,now=Date.now(),options={}){const s=ensure(owner);if(!s)return{ok:false};s.enabled=true;s.paused=false;s.pauseReason='';s.resumeAfterHold=false;s.autoSave=options.autoSave!==false;s.reviewDelayMs=Math.max(0,Number(options.reviewDelayMs??s.reviewDelayMs??8000));s.startedAtEpoch=s.startedAtEpoch||Number(now)||Date.now();s.pausedAtEpoch=null;s.lastAction='start';s.lastActionEpoch=Number(now)||Date.now();return{ok:true,state:clone(s)};}
  function pause(owner,reason='manual',now=Date.now(),options={}){const s=ensure(owner);if(!s||!s.enabled)return{ok:false};s.paused=true;s.pauseReason=String(reason||'manual');s.resumeAfterHold=Boolean(options.resumeAfterHold);s.pausedAtEpoch=Number(now)||Date.now();s.lastAction='pause';s.lastActionEpoch=s.pausedAtEpoch;return{ok:true,state:clone(s)};}
  function resume(owner,now=Date.now()){const s=ensure(owner);if(!s||!s.enabled)return{ok:false};s.paused=false;s.pauseReason='';s.resumeAfterHold=false;s.pausedAtEpoch=null;s.lastAction='resume';s.lastActionEpoch=Number(now)||Date.now();return{ok:true,state:clone(s)};}
  function stop(owner,now=Date.now()){const s=ensure(owner);if(!s)return{ok:false};Object.assign(s,defaults(),{lastAction:'stop',lastActionEpoch:Number(now)||Date.now()});return{ok:true,state:clone(s)};}
  function status(owner){const s=ensure(owner);return s?clone(s):null;}
  function clearReview(s){let dirty=false;if(s.finishedEventKey||s.finishedAtEpoch){s.finishedEventKey='';s.finishedAtEpoch=null;dirty=true;}return dirty;}
  function nextAction({owner,timeline,session,eventKey,now=Date.now(),prestartLeadMs=10000}={}){
    const s=ensure(owner);if(!s||!s.enabled)return{action:'idle',dirty:false,state:s};
    if(s.paused)return{action:'paused',reason:s.pauseReason,dirty:false,state:s};
    if(owner?.directorHold?.active)return{action:'hold',dirty:false,state:s};
    if(!timeline?.items?.length)return{action:'idle',dirty:false,state:s};
    const phase=String(session?.phase||'ready');
    if(phase==='finished'){
      let dirty=false;if(String(s.finishedEventKey)!==String(eventKey||'')){s.finishedEventKey=String(eventKey||'');s.finishedAtEpoch=Number(now)||Date.now();dirty=true;}
      const elapsed=Math.max(0,(Number(now)||Date.now())-Number(s.finishedAtEpoch||now)),remainingMs=Math.max(0,Number(s.reviewDelayMs||0)-elapsed);
      if(s.autoSave&&remainingMs<=0)return{action:'save',eventKey:s.finishedEventKey,remainingMs:0,dirty,state:s};
      return{action:'review',eventKey:s.finishedEventKey,remainingMs,dirty,state:s};
    }
    const dirty=clearReview(s);
    if(['countdown','running','finishing','paused'].includes(phase))return{action:'running',dirty,state:s};
    const heat=CompetitionScheduler.nextHeat(timeline);if(!heat||!heat.eventKey||!eventKey||String(heat.eventKey)!==String(eventKey))return{action:'wait',dirty,state:s};
    const planned=Number(heat.plannedStartEpoch)||Number(now)||Date.now(),lead=Math.max(0,Number(prestartLeadMs)||0),remainingMs=planned-(Number(now)||Date.now());
    if(remainingMs<=lead)return{action:'start',eventKey:heat.eventKey,plannedStartEpoch:planned,remainingMs:Math.max(0,remainingMs),dirty,state:s};
    return{action:'wait',eventKey:heat.eventKey,plannedStartEpoch:planned,remainingMs,dirty,state:s};
  }
  return Object.freeze({ensure,start,pause,resume,stop,status,nextAction});
})();
