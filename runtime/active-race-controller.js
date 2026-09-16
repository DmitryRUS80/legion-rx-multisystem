'use strict';
/* Neutral input router. It selects the active sport controller at the shell boundary;
   sport modules never import or call one another. */
const ActiveRaceController=(()=>{
  const activePhase=s=>Boolean(s&&['countdown','running','finishing','paused'].includes(s.phase));
  const classicSelected=()=>{
    if(typeof ClassicRCRuntime==='undefined'||typeof ClassicRCEngine==='undefined'||!ClassicRCRuntime.active())return false;
    /* Input ownership follows the live sport session, never the visible page.
       This keeps Classic RC timing correct if the director opens Settings/Pilots mid-heat. */
    if(activePhase(ClassicRCRuntime.session?.()))return true;
    if(activePhase(state.session))return false;
    return state.view==='classicCockpit';
  };
  return Object.freeze({
    processPass(detail={}){
      if(classicSelected())return ClassicRCRuntime.processPass(detail);
      return processPass(detail.transponder,detail.deviceMs,detail.source||'EXTERNAL');
    },
    processPilotStatus(detail={}){
      if(classicSelected())return false;
      return processRaceSourceStatus(detail);
    },
    tick(){
      if(classicSelected()){if(typeof classicRCUpdateDynamic==='function')classicRCUpdateDynamic();return;}
      return updateDynamicCockpit();
    },
    complete(){
      if(classicSelected())return;
      return raceSourceMaybeFinish();
    }
  });
})();
