'use strict';
/* LEGION RX · neutral race clock adapter
   Default production clock is x1. Optional test sources may provide a scale. */
const raceClockAdapter=(()=>{
  let provider=()=>1;
  function normalize(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:1;}
  return{
    setScaleProvider(fn){provider=typeof fn==='function'?fn:()=>1;},
    resetScaleProvider(){provider=()=>1;},
    scale(){try{return normalize(provider());}catch{return 1;}},
    realDelay(virtualMs){return Math.max(0,Number(virtualMs)||0)/this.scale();}
  };
})();
