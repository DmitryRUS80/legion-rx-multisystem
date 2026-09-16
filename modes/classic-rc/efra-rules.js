'use strict';
/* LEGION RX · CLASSIC RC · EFRA 2026 sporting rules
   Pure Classic RC sport constants / helpers only. */
const ClassicRCEFRARules=Object.freeze({
  id:'efra-2026-round-by-round',
  version:'EFRA-2026-APP3',
  maxDriversPerHeat:10,
  categories:Object.freeze({
    '10-offroad':Object.freeze({id:'10-offroad',label:'1/10 OFF-ROAD',raceMinutes:5,minStartGapMin:7,heatSequence:'rotating'}),
    '10-onroad':Object.freeze({id:'10-onroad',label:'1/10 ON-ROAD',raceMinutes:5,minStartGapMin:7,heatSequence:'ascending'}),
    '12-track':Object.freeze({id:'12-track',label:'1/12 TRACK',raceMinutes:8,minStartGapMin:10,heatSequence:'ascending'})
  }),
  qualifyingCountTable:Object.freeze({1:0,2:1,3:2,4:2,5:2,6:3}),
  finalsLegs:3,
  finalsCount:2,
  statuses:Object.freeze(['FIN','DNF','DNS','DSQ'])
});

function classicRCQualifyingRoundsToCount(completed){
  const n=Math.max(0,Math.min(6,Number(completed)||0));return ClassicRCEFRARules.qualifyingCountTable[n]??0;
}
function classicRCRoundPointsForPosition(position){
  const p=Math.max(1,Number(position)||1);return p===1?0:p;
}
function classicRCCompareLapsTime(a,b){
  const la=Number(a?.laps)||0,lb=Number(b?.laps)||0;if(lb!==la)return lb-la;
  const ta=Number(a?.timeMs);const tb=Number(b?.timeMs);const aa=Number.isFinite(ta)&&ta>0?ta:Infinity,bb=Number.isFinite(tb)&&tb>0?tb:Infinity;
  if(aa!==bb)return aa-bb;return 0;
}
function classicRCScoreQualifyingRound(results,allPilotIds=[]){
  const map=new Map((results||[]).map(r=>[String(r.pilotId),{...r}]));
  const rows=allPilotIds.map(id=>map.get(String(id))||{pilotId:id,status:'DNS',laps:0,timeMs:null});
  const classified=rows.filter(r=>!['DNS','DSQ'].includes(String(r.status||'FIN'))&&Number(r.laps)>0&&Number.isFinite(Number(r.timeMs))).sort(classicRCCompareLapsTime);
  const n=rows.length,lastPoints=Math.max(1,n);let position=0,prev=null;
  const scored=[];
  for(let i=0;i<classified.length;i++){
    const r=classified[i];
    if(!prev||classicRCCompareLapsTime(r,prev)!==0)position=i+1;
    scored.push({...r,position,points:classicRCRoundPointsForPosition(position)});prev=r;
  }
  const done=new Set(scored.map(x=>String(x.pilotId)));
  rows.filter(r=>!done.has(String(r.pilotId))).forEach(r=>scored.push({...r,position:null,points:lastPoints}));
  return scored;
}
function classicRCPickCountingQualifying(roundRows,count){
  return [...(roundRows||[])].sort((a,b)=>Number(a.points)-Number(b.points)||classicRCCompareLapsTime(a,b)).slice(0,count);
}
function classicRCCompareQualifyingStanding(a,b){
  if(Number(a.total)!==Number(b.total))return Number(a.total)-Number(b.total);
  const as=[...(a.counting||[])].sort((x,y)=>Number(x.points)-Number(y.points));
  const bs=[...(b.counting||[])].sort((x,y)=>Number(x.points)-Number(y.points));
  for(let i=0;i<Math.max(as.length,bs.length);i++){
    const ap=Number(as[i]?.points??Infinity),bp=Number(bs[i]?.points??Infinity);if(ap!==bp)return ap-bp;
  }
  for(let i=0;i<Math.max(as.length,bs.length);i++){
    const c=classicRCCompareLapsTime(as[i],bs[i]);if(c!==0)return c;
  }
  /* EFRA 9.4.1 specifies no further hidden criterion after the second counted round. */
  return 0;
}
function classicRCBuildQualifyingStandings(pilotIds,scoredRounds,completedRounds){
  const count=classicRCQualifyingRoundsToCount(completedRounds);
  const rows=pilotIds.map((pilotId,seedIndex)=>{
    const rounds=(scoredRounds||[]).map((rr,idx)=>{const hit=(rr||[]).find(x=>String(x.pilotId)===String(pilotId));return hit?{...hit,round:idx+1}:null;}).filter(Boolean);
    const counting=classicRCPickCountingQualifying(rounds,count),total=counting.reduce((s,r)=>s+Number(r.points||0),0);
    return{pilotId,seedRank:seedIndex+1,rounds,counting,total,valid:count>0};
  });
  const sorted=rows.sort(classicRCCompareQualifyingStanding);let prev=null,rank=0;return sorted.map((r,i)=>{if(!prev||classicRCCompareQualifyingStanding(r,prev)!==0)rank=i+1;const out={...r,rank};prev=r;return out;});
}
function classicRCFinalLegPoints(result,finalSize){
  const size=Math.max(1,Number(finalSize)||10),rows=[...(result||[])];
  const runners=rows.filter(r=>r.status!=='DNS'&&r.status!=='DSQ').sort(classicRCCompareLapsTime);
  const out=[];let prev=null,position=0;
  runners.forEach((r,i)=>{if(!prev||classicRCCompareLapsTime(r,prev)!==0)position=i+1;out.push({...r,place:position,points:Math.min(size,position)});prev=r;});
  /* EFRA 10.6: cars that did not run receive the remaining points by car number. */
  const nonRunners=rows.filter(r=>r.status==='DNS'||r.status==='DSQ').sort((a,b)=>Number(a.carNumber||999)-Number(b.carNumber||999));
  let next=Math.min(size,runners.length+1);
  nonRunners.forEach(r=>{const points=Math.min(size,next);out.push({...r,place:null,points});next=Math.min(size,next+1);});
  return out;
}
function classicRCCompareFinalStanding(a,b){
  if(Number(a.total)!==Number(b.total))return Number(a.total)-Number(b.total);
  const as=[...(a.counting||[])].sort((x,y)=>Number(x.points)-Number(y.points));
  const bs=[...(b.counting||[])].sort((x,y)=>Number(x.points)-Number(y.points));
  for(let i=0;i<Math.max(as.length,bs.length);i++){
    const ap=Number(as[i]?.points??Infinity),bp=Number(bs[i]?.points??Infinity);if(ap!==bp)return ap-bp;
  }
  for(let i=0;i<Math.max(as.length,bs.length);i++){
    const c=classicRCCompareLapsTime(as[i],bs[i]);if(c!==0)return c;
  }
  /* EFRA 10.6 ends after comparison of the second counted final. Keep a true
     mathematical tie here instead of inventing a hidden extra criterion. */
  return 0;
}
function classicRCBuildFinalStandings(finalGroup,legs,qualifyingRankMap=new Map()){
  const ids=finalGroup?.pilots||[],count=Math.min(ClassicRCEFRARules.finalsCount,(legs||[]).length);
  const rows=ids.map(id=>{
    const all=(legs||[]).map((leg,idx)=>{const r=(leg.scored||leg.result||[]).find(x=>String(x.pilotId)===String(id));return r?{...r,leg:idx+1}:null;}).filter(Boolean);
    const counting=[...all].sort((a,b)=>Number(a.points)-Number(b.points)||classicRCCompareLapsTime(a,b)).slice(0,count);
    return{pilotId:id,all,counting,total:counting.reduce((s,r)=>s+Number(r.points||0),0),qualifyingRank:qualifyingRankMap.get(String(id))||9999};
  });
  const sorted=rows.sort(classicRCCompareFinalStanding);let prev=null,rank=0;return sorted.map((r,i)=>{if(!prev||classicRCCompareFinalStanding(r,prev)!==0)rank=i+1;const out={...r,rank};prev=r;return out;});
}
