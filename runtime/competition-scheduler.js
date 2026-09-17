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
    return {version:2,startEpoch,items:[],updatedAt:Date.now(),meta:{...(spec.meta||{})}};
  };
  const add=(timeline,item)=>{
    const x={id:item.id||`tl_${Math.random().toString(36).slice(2,9)}`,kind:item.kind||'heat',stage:item.stage||'',label:item.label||'',subLabel:item.subLabel||'',eventKey:item.eventKey||'',durationMin:Math.max(0,Number(item.durationMin)||0),minStartGapMin:Math.max(0,Number(item.minStartGapMin)||0),plannedStartEpoch:Number(item.plannedStartEpoch)||0,status:item.status||'pending',actualStartEpoch:item.actualStartEpoch||null,actualEndEpoch:item.actualEndEpoch||null,participantCount:Number(item.participantCount)||0,meta:{...(item.meta||{})}};
    timeline.items.push(x);timeline.updatedAt=Date.now();return x;
  };
  const effectiveSpanMs=it=>{
    const duration=Math.max(0,Number(it?.durationMin)||0)*60000;
    return it?.kind==='break'?duration:Math.max(duration,Math.max(0,Number(it?.minStartGapMin)||0)*60000);
  };
  const recalc=(timeline,fromIndex=0)=>{
    if(!timeline?.items?.length)return timeline;
    const items=timeline.items;let cursor=Number(timeline.startEpoch)||Date.now();
    for(let i=0;i<items.length;i++){
      const it=items[i];
      if(i<fromIndex&&it.plannedStartEpoch){cursor=Math.max(cursor,it.plannedStartEpoch+effectiveSpanMs(it));continue;}
      if(it.status==='completed'&&it.actualStartEpoch){it.plannedStartEpoch=it.actualStartEpoch;cursor=Math.max(cursor,it.actualStartEpoch+effectiveSpanMs(it));continue;}
      it.plannedStartEpoch=Math.max(cursor,Number(it.plannedStartEpoch)||0);
      cursor=it.plannedStartEpoch+effectiveSpanMs(it);
    }
    timeline.updatedAt=Date.now();return timeline;
  };
  const shiftFuture=(timeline,fromIndex,deltaMs)=>{
    if(!timeline?.items?.length||!deltaMs)return timeline;
    timeline.items.forEach((it,i)=>{if(i>=fromIndex&&it.status==='pending')it.plannedStartEpoch=Math.max(0,Number(it.plannedStartEpoch||0)+deltaMs);});timeline.updatedAt=Date.now();return timeline;
  };
  const shiftPending=(timeline,deltaMs)=>shiftFuture(timeline,0,deltaMs);
  const shiftStart=(timeline,deltaMs)=>{
    if(!timeline?.items?.length)return{ok:false,error:'Расписание пустое'};
    if(timeline.items.some(x=>x.status!=='pending'||x.actualStartEpoch||x.actualEndEpoch))return{ok:false,error:'Старт дня можно менять только до первого события'};
    const delta=Number(deltaMs)||0;if(!delta)return{ok:true,deltaMs:0,startEpoch:Number(timeline.startEpoch)||0};
    timeline.startEpoch=Math.max(0,(Number(timeline.startEpoch)||Date.now())+delta);
    timeline.items.forEach(it=>{if(it.status==='pending')it.plannedStartEpoch=Math.max(0,(Number(it.plannedStartEpoch)||timeline.startEpoch)+delta);});
    timeline.updatedAt=Date.now();return{ok:true,deltaMs:delta,startEpoch:timeline.startEpoch};
  };
  const indexOfEvent=(timeline,eventKey)=>timeline?.items?.findIndex(x=>x.eventKey===eventKey)??-1;
  const indexOfId=(timeline,itemId)=>timeline?.items?.findIndex(x=>x.id===itemId)??-1;
  const currentItem=(timeline,now=Date.now())=>{
    if(!timeline?.items?.length)return null;
    const active=timeline.items.find(x=>x.status==='active');if(active)return active;
    const pending=timeline.items.find(x=>x.status==='pending');if(!pending)return null;
    if(pending.kind==='break'&&now>=pending.plannedStartEpoch+pending.durationMin*60000){
      pending.status='completed';pending.actualStartEpoch=pending.plannedStartEpoch;pending.actualEndEpoch=pending.plannedStartEpoch+pending.durationMin*60000;timeline.updatedAt=Date.now();return currentItem(timeline,now);
    }
    return pending;
  };
  const nextItemAfter=(timeline,item)=>{
    if(!timeline?.items?.length)return null;
    const i=item?timeline.items.indexOf(item):-1;
    return timeline.items.find((x,j)=>j>i&&x.status==='pending')||null;
  };
  const nextHeat=(timeline)=>timeline?.items?.find(x=>x.status==='pending'&&x.kind==='heat')||null;
  const canStart=(timeline,eventKey,now=Date.now(),options={})=>{
    const i=indexOfEvent(timeline,eventKey);if(i<0)return{ok:false,error:'Заезд отсутствует в расписании'};
    const it=timeline.items[i];if(it.status==='completed')return{ok:false,error:'Заезд уже завершён'};
    if(it.status==='active')return{ok:false,error:'Заезд уже запущен'};
    const earlierPendingHeat=timeline.items.slice(0,i).find(x=>x.kind==='heat'&&x.status==='pending');
    if(earlierPendingHeat)return{ok:false,error:'Сначала проведите предыдущий заезд'};
    if(timeline.items.some((x,j)=>j!==i&&x.kind==='heat'&&x.status==='active'))return{ok:false,error:'Другой заезд уже идёт'};
    let earliest=-Infinity;
    for(let p=i-1;p>=0;p--){const prev=timeline.items[p];if(prev.kind!=='heat'||prev.meta?.skipped)continue;const base=prev.actualStartEpoch||prev.plannedStartEpoch;if(base){earliest=base+Math.max(0,Number(it.minStartGapMin)||0)*60000;break;}}
    if(!options.ignoreMinGap&&now<earliest)return{ok:false,error:'Минимальный интервал ещё не выдержан',earliestEpoch:earliest,index:i,item:it};
    return{ok:true,index:i,item:it,earliestEpoch:Number.isFinite(earliest)?earliest:null,override:Boolean(options.ignoreMinGap)};
  };
  const start=(timeline,eventKey,now=Date.now(),options={})=>{
    const check=canStart(timeline,eventKey,now,options);if(!check.ok)return check;
    const i=check.index,it=check.item,old=it.plannedStartEpoch||now;
    timeline.items.slice(0,i).forEach(x=>{if(x.kind==='break'&&x.status==='pending'){x.status='completed';x.actualStartEpoch=x.plannedStartEpoch||now;x.actualEndEpoch=now;}});
    it.actualStartEpoch=now;it.plannedStartEpoch=now;it.status='active';
    shiftFuture(timeline,i+1,now-old);timeline.updatedAt=Date.now();return{ok:true,item:it,deltaMs:now-old,earliestEpoch:check.earliestEpoch};
  };
  const finish=(timeline,eventKey,now=Date.now())=>{
    const i=indexOfEvent(timeline,eventKey);if(i<0)return null;const it=timeline.items[i];it.status='completed';it.actualEndEpoch=now;if(!it.actualStartEpoch)it.actualStartEpoch=it.plannedStartEpoch||now;
    const nextIndex=timeline.items.findIndex((x,j)=>j>i&&x.status==='pending');if(nextIndex>=0){const next=timeline.items[nextIndex],planned=Number(next.plannedStartEpoch)||now;if(now>planned)shiftFuture(timeline,nextIndex,now-planned);}
    timeline.updatedAt=Date.now();return it;
  };
  const skipHeat=(timeline,eventKey,now=Date.now())=>{
    const i=indexOfEvent(timeline,eventKey);if(i<0)return{ok:false,error:'Заезд отсутствует в расписании'};
    const it=timeline.items[i];if(it.kind!=='heat')return{ok:false,error:'Событие не является заездом'};
    const t=Number(now)||Date.now();it.status='completed';it.actualStartEpoch=t;it.actualEndEpoch=t;it.meta={...(it.meta||{}),skipped:true};
    const nextIndex=timeline.items.findIndex((x,j)=>j>i&&x.status==='pending');
    if(nextIndex>=0){const next=timeline.items[nextIndex],planned=Number(next.plannedStartEpoch)||t;shiftFuture(timeline,nextIndex,t-planned);}
    timeline.updatedAt=Date.now();return{ok:true,item:it,nextIndex};
  };
  const skipBreak=(timeline,itemId,now=Date.now())=>{
    const i=indexOfId(timeline,itemId);if(i<0||timeline.items[i].kind!=='break'||timeline.items[i].status!=='pending')return{ok:false,error:'Пауза уже завершена'};const it=timeline.items[i],oldEnd=it.plannedStartEpoch+it.durationMin*60000;
    it.status='completed';it.actualStartEpoch=it.plannedStartEpoch;it.actualEndEpoch=now;shiftFuture(timeline,i+1,now-oldEnd);
    const n=timeline.items.findIndex((x,j)=>j>i&&x.kind==='heat'&&x.status==='pending');if(n>=0){const next=timeline.items[n];let prev=null;for(let p=n-1;p>=0;p--){if(timeline.items[p].kind==='heat'){prev=timeline.items[p];break;}}const earliest=prev?(prev.actualStartEpoch||prev.plannedStartEpoch)+Math.max(0,Number(next.minStartGapMin)||0)*60000:-Infinity;if(next.plannedStartEpoch<earliest)shiftFuture(timeline,n,earliest-next.plannedStartEpoch);}
    timeline.updatedAt=Date.now();return{ok:true,item:it};
  };
  const adjustBreakMinutes=(timeline,itemId,deltaMinutes,now=Date.now())=>{
    const i=indexOfId(timeline,itemId);if(i<0||timeline.items[i].kind!=='break'||timeline.items[i].status!=='pending')return{ok:false,error:'Можно менять только текущую или будущую паузу'};
    const it=timeline.items[i],oldDuration=Math.max(0,Number(it.durationMin)||0),nextDuration=Math.max(0,oldDuration+(Number(deltaMinutes)||0));
    const delta=(nextDuration-oldDuration)*60000;it.durationMin=nextDuration;shiftFuture(timeline,i+1,delta);
    const end=(Number(it.plannedStartEpoch)||now)+nextDuration*60000,earlierOpen=timeline.items.slice(0,i).some(x=>x.status==='pending'||x.status==='active');
    if(it.status==='pending'&&!earlierOpen&&now>=end){it.status='completed';it.actualStartEpoch=it.plannedStartEpoch||now;it.actualEndEpoch=end;}
    timeline.updatedAt=Date.now();return{ok:true,item:it,deltaMs:delta};
  };
  const addBreakMinutes=(timeline,itemId,minutes)=>adjustBreakMinutes(timeline,itemId,Math.max(0,Number(minutes)||0));
  const restartHeat=(timeline,eventKey,now=Date.now())=>{
    const i=indexOfEvent(timeline,eventKey);if(i<0)return{ok:false,error:'Заезд отсутствует в расписании'};
    const it=timeline.items[i];if(it.kind!=='heat')return{ok:false,error:'Событие не является заездом'};
    if(it.status==='completed')return{ok:false,error:'Сохранённый заезд нельзя перезапустить'};
    if(it.status==='pending'&&!it.actualStartEpoch){it.actualEndEpoch=null;timeline.updatedAt=Date.now();return{ok:true,item:it,deltaMs:0};}
    const oldStart=Number(it.actualStartEpoch||it.plannedStartEpoch)||now;
    let earliest=Number(now)||Date.now();
    for(let p=i-1;p>=0;p--){const prev=timeline.items[p];if(prev.kind!=='heat')continue;const base=Number(prev.actualStartEpoch||prev.plannedStartEpoch)||0;if(base)earliest=Math.max(earliest,base+Math.max(0,Number(it.minStartGapMin)||0)*60000);break;}
    it.status='pending';it.actualStartEpoch=null;it.actualEndEpoch=null;it.plannedStartEpoch=earliest;
    const delta=earliest-oldStart;if(delta)shiftFuture(timeline,i+1,delta);timeline.updatedAt=Date.now();return{ok:true,item:it,deltaMs:delta};
  };
  const setHeatDuration=(timeline,eventKey,durationMin)=>{
    const i=indexOfEvent(timeline,eventKey);if(i<0)return{ok:false};const it=timeline.items[i];if(it.kind!=='heat')return{ok:false};
    const oldSpan=effectiveSpanMs(it),oldDuration=it.durationMin;it.durationMin=Math.max(1/60,Number(durationMin)||oldDuration||1);const newSpan=effectiveSpanMs(it),delta=newSpan-oldSpan;
    if(delta)shiftFuture(timeline,i+1,delta);timeline.updatedAt=Date.now();return{ok:true,item:it,deltaMs:delta};
  };
  const bringForward=(timeline,eventKey,now=Date.now())=>start(timeline,eventKey,now,{ignoreMinGap:true});
  const formatTime=epoch=>epoch?new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(epoch)):'—';
  const snapshot=timeline=>clone(timeline);
  return Object.freeze({make,add,recalc,shiftFuture,shiftPending,shiftStart,currentItem,nextItemAfter,nextHeat,canStart,start,finish,restartHeat,skipHeat,skipBreak,adjustBreakMinutes,addBreakMinutes,setHeatDuration,bringForward,formatTime,snapshot,indexOfEvent,indexOfId,effectiveSpanMs});
})();
