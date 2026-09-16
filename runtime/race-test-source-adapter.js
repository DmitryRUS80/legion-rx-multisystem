'use strict';
/* LEGION RX · removable pre-release test source adapter
   Sport runtimes only talk to this neutral lifecycle. The concrete simulator is optional. */
const raceTestSourceAdapter=(()=>{
  let source=null;
  const api={
    register(adapter){source=adapter||null;return api;},
    unregister(adapter){if(!adapter||source===adapter)source=null;},
    available(){return Boolean(source);},
    isEnabled(){try{return Boolean(source?.isEnabled?.());}catch{return false;}},
    isRunning(){try{return Boolean(source?.isRunning?.());}catch{return false;}},
    id(){return String(source?.id||'TEST');},
    label(){try{return String(source?.label?.()||source?.id||'TEST');}catch{return'TEST';}},
    scale(){try{return Number(source?.getScale?.())||1;}catch{return 1;}},
    getConfig(){try{return source?.getConfig?.()||null;}catch{return null;}},
    configure(config={}){try{return source?.configure?.(config)||api.getConfig();}catch{return api.getConfig();}},
    enable(config={}){try{return source?.enable?.(config)||api.configure(config)||false;}catch{return false;}},
    startWarmup(context={}){if(!api.isEnabled())return false;return Boolean(source?.startWarmup?.({...context,onPass:p=>raceEventBus.pass({transponder:p?.transponder,pilotId:p?.id,deviceMs:null,source:api.id()})}));},
    clearWarmup(){try{source?.clearWarmup?.();}catch{}},
    startSession(context={}){
      if(!api.isEnabled())return false;
      return Boolean(source?.startSession?.({...context,
        onPass:p=>raceEventBus.pass({transponder:p?.transponder,pilotId:p?.id,deviceMs:null,source:api.id()}),
        onStatus:(p,status)=>raceEventBus.pilotStatus({pilotId:p?.id,transponder:p?.transponder,status,source:api.id()}),
        onTick:()=>raceEventBus.tick({source:api.id()}),
        onComplete:()=>raceEventBus.complete({source:api.id()})
      }));
    },
    pause(){try{source?.pauseSession?.();}catch{}},
    resume(){try{source?.resumeSession?.();}catch{}},
    stop(){try{source?.stopSession?.();}catch{}},
    disable(){try{source?.disable?.();}catch{}},
  };
  raceClockAdapter.setScaleProvider(()=>api.isEnabled()?api.scale():1);
  return api;
})();
