'use strict';
/* LEGION RX · neutral competition scheduler
   Owns only timeline/clock operations. It never calculates sport results. */
const CompetitionScheduler=(()=>{
  const clone=v=>JSON.parse(JSON.stringify(v));
  const parseClock=(date,hhmm)=>{
    const [h,m]=String(hhmm||'09:00').split(':').map(Number),d=new Date(`${date||new Date().toISOString().slice(0,10)}T00:00:00`);
    d.setHours(Number.isFinite(h)?h:9,Number.isFinite(m)?m:0,0,0);return d.getTime();
  };
  const make=(spec={})=>{
    const startEpoch=parseClock(spec.date,spec.startTime||'09:00');
    return {version:1,startEpoch,items:[],updatedAt:Date.now(),meta:{...(spec.meta||{})}};
  };
  const add=(timeline,item)=>{
    const x={id:item.id||`tl_${Math.random().toString(36).slice(2,9)}`,kind:item.kind||'heat',stage:item.stage||'',label:item.label||'',subLabel:item.subLabel||'',eventKey:item.eventKey||'',durationMin:Math.max(0,Number(item.durationMin)||0),minStartGapMin:Math.max(0,Number(item.minStartGapMin)||0),plannedStartEpoch:Number(item.plannedStartEpoch)||0,status:item.status||'pending',actualStartEpoch:null,actualEndEpoch:null,participantCount:Number(item.participantCount)||0,meta:{...(item.meta||{})}};
    timeline.items.push(x);timeline.updatedAt=Date.now();return x;
  };
  const recalc=(timeline,fromIndex=0)=>{
    if(!timeline?.items?.length)return timeline;
    const items=timeline.items;let cursor=Number(timeline.startEpoch)||Date.now();
    for(let i=0;i<items.length;i++){
      const it=items[i];
      if(i<fromIndex&&it.plannedStartEpoch){cursor=Math.max(cursor,it.plannedStartEpoch);continue;}
      if(it.status==='completed'&&it.actualStartEpoch){it.plannedStartEpoch=it.actualStartEpoch;cursor=Math.max(cursor,it.actualStartEpoch);}
      else if(it.kind==='break')it.plannedStartEpoch=Math.max(cursor,Number(it.plannedStartEpoch)||0);
      else it.plannedStartEpoch=Math.max(cursor,Number(it.plannedStartEpoch)||0);
      const duration=Math.max(0,Number(it.durationMin)||0)*60000;
      if(it.kind==='break')cursor=it.plannedStartEpoch+duration;
      else cursor=it.plannedStartEpoch+Math.max(duration,Math.max(0,Number(it.minStartGapMin)||0)*60000);
    }
    timeline.updatedAt=Date.now();return timeline;
  };
  const shiftFuture=(timeline,fromIndex,deltaMs)=>{
    if(!deltaMs)return timeline;
    timeline.items.forEach((it,i)=>{if(i>=fromIndex&&it.status==='pending')it.plannedStartEpoch=Math.max(0,Number(it.plannedStartEpoch||0)+deltaMs);});timeline.updatedAt=Date.now();return timeline;
  };
  const indexOfEvent=(timeline,eventKey)=>timeline?.items?.findIndex(x=>x.eventKey===eventKey)??-1;
  const currentItem=(timeline,now=Date.now())=>{
    if(!timeline?.items?.length)return null;
    const active=timeline.items.find(x=>x.status==='active');if(active)return active;
    const pending=timeline.items.find(x=>x.status==='pending');if(!pending)return null;
    if(pending.kind==='break'&&now>=pending.plannedStartEpoch+pending.durationMin*60000){pending.status='completed';pending.actualStartEpoch=pending.plannedStartEpoch;pending.actualEndEpoch=pending.plannedStartEpoch+pending.durationMin*60000;return currentItem(timeline,now);}
    return pending;
  };
  const nextHeat=(timeline)=>timeline?.items?.find(x=>x.status==='pending'&&x.kind==='heat')||null;
  const canStart=(timeline,eventKey,now=Date.now())=>{
    const i=indexOfEvent(timeline,eventKey);if(i<0)return{ok:false,error:'Заезд отсутствует в расписании'};
    const it=timeline.items[i];if(it.status==='completed')return{ok:false,error:'Заезд уже завершён'};
    if(it.status==='active')return{ok:false,error:'Заезд уже запущен'};
    const earlierPendingHeat=timeline.items.slice(0,i).find(x=>x.kind==='heat'&&x.status==='pending');
    if(earlierPendingHeat)return{ok:false,error:'Сначала проведите предыдущий заезд'};
    if(timeline.items.some((x,j)=>j!==i&&x.kind==='heat'&&x.status==='active'))return{ok:false,error:'Другой заезд уже идёт'};
    let earliest=-Infinity;
    for(let p=i-1;p>=0;p--){const prev=timeline.items[p];if(prev.kind!=='heat')continue;const base=prev.actualStartEpoch||prev.plannedStartEpoch;if(base){earliest=base+Math.max(0,Number(it.minStartGapMin)||0)*60000;break;}}
    if(now<earliest)return{ok:false,error:'Минимальный интервал ещё не выдержан',earliestEpoch:earliest,index:i,item:it};
    return{ok:true,index:i,item:it,earliestEpoch:Number.isFinite(earliest)?earliest:null};
  };
  const start=(timeline,eventKey,now=Date.now())=>{
    const check=canStart(timeline,eventKey,now);if(!check.ok)return check;
    const i=check.index,it=check.item,old=it.plannedStartEpoch||now;
    /* Starting early shortens/skips only pauses before the very next heat. */
    timeline.items.slice(0,i).forEach(x=>{if(x.kind==='break'&&x.status==='pending'){x.status='completed';x.actualStartEpoch=x.plannedStartEpoch||now;x.actualEndEpoch=now;}});
    it.actualStartEpoch=now;it.plannedStartEpoch=now;it.status='active';
    shiftFuture(timeline,i+1,now-old);timeline.updatedAt=Date.now();return{ok:true,item:it,deltaMs:now-old,earliestEpoch:check.earliestEpoch};
  };
  const finish=(timeline,eventKey,now=Date.now())=>{const i=indexOfEvent(timeline,eventKey);if(i<0)return null;const it=timeline.items[i];it.status='completed';it.actualEndEpoch=now;if(!it.actualStartEpoch)it.actualStartEpoch=it.plannedStartEpoch||now;
    /* A real overrun moves only the still-pending tail. An early finish never pulls
       the day forward automatically; the Race Director can do that explicitly. */
    const nextIndex=timeline.items.findIndex((x,j)=>j>i&&x.status==='pending');if(nextIndex>=0){const next=timeline.items[nextIndex],planned=Number(next.plannedStartEpoch)||now;if(now>planned)shiftFuture(timeline,nextIndex,now-planned);}
    timeline.updatedAt=Date.now();return it;};
  const skipBreak=(timeline,itemId,now=Date.now())=>{const i=timeline.items.findIndex(x=>x.id===itemId&&x.kind==='break');if(i<0)return{ok:false};const it=timeline.items[i],oldEnd=it.plannedStartEpoch+it.durationMin*60000;it.status='completed';it.actualStartEpoch=it.plannedStartEpoch;it.actualEndEpoch=now;shiftFuture(timeline,i+1,now-oldEnd);
    const n=timeline.items.findIndex((x,j)=>j>i&&x.kind==='heat'&&x.status==='pending');if(n>=0){const next=timeline.items[n];let prev=null;for(let p=n-1;p>=0;p--){if(timeline.items[p].kind==='heat'){prev=timeline.items[p];break;}}const earliest=prev?(prev.actualStartEpoch||prev.plannedStartEpoch)+Math.max(0,Number(next.minStartGapMin)||0)*60000:-Infinity;if(next.plannedStartEpoch<earliest)shiftFuture(timeline,n,earliest-next.plannedStartEpoch);}
    return{ok:true};};
  const addBreakMinutes=(timeline,itemId,minutes)=>{const i=timeline.items.findIndex(x=>x.id===itemId&&x.kind==='break');if(i<0)return{ok:false};const d=Math.max(0,Number(minutes)||0);timeline.items[i].durationMin+=d;shiftFuture(timeline,i+1,d*60000);return{ok:true};};
  const bringForward=(timeline,eventKey,now=Date.now())=>start(timeline,eventKey,now);
  const formatTime=epoch=>epoch?new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(epoch)):'—';
  const snapshot=timeline=>clone(timeline);
  return Object.freeze({make,add,recalc,shiftFuture,currentItem,nextHeat,canStart,start,finish,skipBreak,addBreakMinutes,bringForward,formatTime,snapshot,indexOfEvent});
})();
