'use strict';
/* LEGION RX · neutral race event bus
   Transport-neutral bridge between timing/test sources and RallyCross runtime. */
class LegionRaceEventBus extends EventTarget{
  emit(type,detail={}){this.dispatchEvent(new CustomEvent(type,{detail}));}
  pass(detail={}){this.emit('pass',detail);}
  pilotStatus(detail={}){this.emit('pilotstatus',detail);}
  tick(detail={}){this.emit('tick',detail);}
  complete(detail={}){this.emit('complete',detail);}
}
const raceEventBus=new LegionRaceEventBus();
