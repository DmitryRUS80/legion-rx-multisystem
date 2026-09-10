'use strict';
function getPoints(place){if(!Number.isInteger(place)||place<1)return 0;return SCORE_TABLE[place-1]??Math.max(1,44-place);}

function qualifyingResultRank(result){if(!result)return 10000;if(result.status==='FIN')return result.place;if(result.status==='DNF')return 100+(result.dnfOrder||99);if(result.status==='DNS')return 300;if(result.status==='DSQ')return 400;return 500;}

function savePilotResult(pilot,round,heat,resultValue,dnfOrder=null){
  const existing=pilot.qualifying.find(r=>r.round===round);const isPlace=Number.isInteger(resultValue);const record={round,heat,place:isPlace?resultValue:null,status:isPlace?'FIN':resultValue,dnfOrder:resultValue==='DNF'&&Number.isInteger(dnfOrder)?dnfOrder:null,points:isPlace?getPoints(resultValue):0};
  if(existing)Object.assign(existing,record);else pilot.qualifying.push(record);
}

function getBest3Results(pilot){return [...pilot.qualifying].sort((a,b)=>{if(b.points!==a.points)return b.points-a.points;const rd=qualifyingResultRank(a)-qualifyingResultRank(b);if(rd!==0)return rd;return b.round-a.round;}).slice(0,3);}

function getDiscardedResults(pilot){const sel=new Set(getBest3Results(pilot).map(i=>`${i.round}:${i.heat}`));return pilot.qualifying.filter(i=>!sel.has(`${i.round}:${i.heat}`)).sort((a,b)=>{if(b.points!==a.points)return b.points-a.points;const rd=qualifyingResultRank(a)-qualifyingResultRank(b);if(rd!==0)return rd;return b.round-a.round;});}

function calculateBest3(pilot){const best=getBest3Results(pilot);pilot.best3=best.reduce((s,r)=>s+r.points,0);pilot.points=pilot.best3;pilot.best3Rounds=best.map(r=>r.round);}

function placeHistogram(results,maxPlace=16){const h=[];for(let p=1;p<=maxPlace;p++)h.push(results.filter(r=>r.status==='FIN'&&r.place===p).length);return h;}

function compareNumberArraysDesc(a,b){const len=Math.max(a.length,b.length);for(let i=0;i<len;i++){const av=a[i]??-Infinity,bv=b[i]??-Infinity;if(bv!==av)return bv-av;}return 0;}

function compareResultArraysByQuality(a,b){const len=Math.max(a.length,b.length);for(let i=0;i<len;i++){const ar=a[i],br=b[i];if(!ar&&!br)continue;if(!ar)return 1;if(!br)return -1;if(br.points!==ar.points)return br.points-ar.points;const rd=qualifyingResultRank(ar)-qualifyingResultRank(br);if(rd!==0)return rd;}return 0;}

/* Qualification sport comparison only. If this reaches 0, the pilots are genuinely
   tied by the configured BEST-3/countback rules and must be separated by a run-off. */
function comparePilotsWithoutRunoff(race,a,b){
  if(b.best3!==a.best3)return b.best3-a.best3;
  const bestA=getBest3Results(a),bestB=getBest3Results(b);
  const hd=compareNumberArraysDesc(placeHistogram(bestA),placeHistogram(bestB));if(hd!==0)return hd;
  const dd=compareResultArraysByQuality(getDiscardedResults(a),getDiscardedResults(b));if(dd!==0)return dd;
  return 0;
}

function qualificationRunoffRank(race,pilotId){const v=race.qualificationRunoffOrder?.[String(pilotId)];return Number.isInteger(v)?v:null;}

function comparePilots(race,a,b){
  const sport=comparePilotsWithoutRunoff(race,a,b);if(sport!==0)return sport;
  const ra=qualificationRunoffRank(race,a.id),rb=qualificationRunoffRank(race,b.id);
  if(Number.isInteger(ra)&&Number.isInteger(rb)&&ra!==rb)return ra-rb;
  /* Stable presentation only while the tie is unresolved. This fallback never
     resolves sport positions because unresolved groups are intercepted by run-offs. */
  return (a.registrationOrder||9999)-(b.registrationOrder||9999);
}

function updateStandings(race){race.pilots.forEach(calculateBest3);race.pilots.sort((a,b)=>comparePilots(race,a,b));return race.pilots;}

function getExactTieGroups(race){
  updateStandings(race);const groups=[];
  for(let i=0;i<race.pilots.length;){let g=[race.pilots[i]],j=i+1;while(j<race.pilots.length&&comparePilotsWithoutRunoff(race,race.pilots[i],race.pilots[j])===0){g.push(race.pilots[j]);j++;}if(g.length>1)groups.push(g);i=j;}
  return groups;
}

function qualificationTieGroupResolved(race,group){return group.every(p=>Number.isInteger(qualificationRunoffRank(race,p.id)));}

function getHeatCount(pilotCount){if(pilotCount<=6)return 1;return Math.ceil(pilotCount/6);}

function buildSnakeHeats(pilots,heatCount,round){const shift=pilots.length?(round-1)%pilots.length:0;const ordered=[...pilots.slice(shift),...pilots.slice(0,shift)];const heats=Array.from({length:heatCount},()=>[]);ordered.forEach((pilot,index)=>{const row=Math.floor(index/heatCount),column=index%heatCount,heatIndex=row%2===0?column:heatCount-1-column;heats[heatIndex].push(pilot);});return heats.filter(h=>h.length);}

function createQualifyingData(race){race.heats=[];const pilots=[...race.pilots].sort((a,b)=>(a.registrationOrder||0)-(b.registrationOrder||0));const heatCount=getHeatCount(pilots.length);for(let round=1;round<=race.qualifyingCount;round++){buildSnakeHeats(pilots,heatCount,round).forEach((hp,idx)=>race.heats.push({key:`Q${round}-H${idx+1}`,type:'qualifying',label:`Квалификация ${round} · Заезд ${idx+1}`,round,heat:idx+1,pilots:hp.map(p=>p.id),saved:false,result:[],enabled:round===1&&idx===0,order:round*100+idx}));}}

function prepareRace(race){
  race.finals=[];race.finalProtocol=[];race.qualificationRunoffOrder={};race.finalRunoffOrder={};race.runoffCounter=0;delete race.exactTieLots;race.stage='qualifying';
  race.pilots.forEach(p=>{p.qualifying=[];p.best3=0;p.points=0;p.finalResults=[];});createQualifyingData(race);normalizeQualifyingEnabled(race);return race;
}

function standardQualifyingHeats(race){return race.heats.filter(h=>h.type==='qualifying'&&!h.tieBreak);}
function qualificationRunoffHeats(race){return race.heats.filter(h=>h.tieBreak&&h.tieScope==='qualification');}

function normalizeQualifyingEnabled(race){
  race.heats.forEach(h=>h.enabled=false);
  const standard=standardQualifyingHeats(race).filter(h=>!h.saved).sort((a,b)=>a.order-b.order);
  if(standard[0]){standard[0].enabled=true;return;}
  const runoffs=qualificationRunoffHeats(race).filter(h=>!h.saved&&!h.cancelled).sort((a,b)=>a.order-b.order);
  if(runoffs[0])runoffs[0].enabled=true;
}

function qualificationTieSignature(group){return group.map(p=>String(p.id)).sort().join('|');}

function queueQualificationRunoff(race,pilotIds,globalFrom,globalTo,localBaseRank=1,orderOffset=0){
  race.runoffCounter=Number(race.runoffCounter||0);
  const ids=pilotIds.map(String),signature=[...ids].sort().join('|');
  const event={key:`QTB-${++race.runoffCounter}`,type:'qualification-tiebreak',tieBreak:true,tieScope:'qualification',tieSignature:signature,label:`Перезаезд квалификации · места ${globalFrom}${globalTo!==globalFrom?`–${globalTo}`:''}`,round:0,heat:1,pilots:ids,saved:false,result:[],enabled:false,order:9000+race.runoffCounter+orderOffset,runoffPositions:[globalFrom,globalTo],runoffBaseRank:localBaseRank};
  race.heats.push(event);return event;
}

function createQualificationRunoffs(race){
  updateStandings(race);race.qualificationRunoffOrder=race.qualificationRunoffOrder||{};race.runoffCounter=Number(race.runoffCounter||0);
  const groups=getExactTieGroups(race).filter(g=>!qualificationTieGroupResolved(race,g));
  groups.forEach((group,index)=>{
    const signature=qualificationTieSignature(group);
    const existing=race.heats.find(h=>h.tieBreak&&h.tieScope==='qualification'&&h.tieSignature===signature&&!h.cancelled);
    if(existing)return;
    const positions=group.map(p=>race.pilots.findIndex(x=>String(x.id)===String(p.id))+1).filter(n=>n>0).sort((a,b)=>a-b),from=positions[0]||1,to=positions[positions.length-1]||from;
    queueQualificationRunoff(race,group.map(p=>p.id),from,to,1,index);
  });
  race.stage='qualifying';normalizeQualifyingEnabled(race);return groups;
}

function finalizeQualificationOrCreateRunoffs(race){
  updateStandings(race);normalizeQualifyingEnabled(race);
  if(!standardQualifyingHeats(race).every(h=>h.saved))return false;
  const unresolved=getExactTieGroups(race).filter(g=>!qualificationTieGroupResolved(race,g));
  if(unresolved.length){createQualificationRunoffs(race);return false;}
  generateFinals(race);return true;
}

function saveQualifyingEvent(race,eventKey,result){
  const heat=race.heats.find(h=>h.key===eventKey);if(!heat||heat.type!=='qualifying'||heat.tieBreak||heat.saved)throw new Error('Заезд не найден или уже сохранён');
  heat.result=normalizeResult(result);heat.saved=true;
  heat.result.forEach((item,index)=>{const p=getPilot(race,item.pilotId);if(!p)return;if(item.status==='FIN')savePilotResult(p,heat.round,heat.heat,item.place??index+1);else savePilotResult(p,heat.round,heat.heat,item.status,item.dnfOrder);});
  updateStandings(race);normalizeQualifyingEnabled(race);if(standardQualifyingHeats(race).every(h=>h.saved))finalizeQualificationOrCreateRunoffs(race);return heat;
}

function saveQualificationRunoffEvent(race,eventKey,result){
  const heat=race.heats.find(h=>h.key===eventKey);if(!heat||!heat.tieBreak||heat.tieScope!=='qualification'||heat.saved)throw new Error('Перезаезд не найден или уже сохранён');
  const normalized=normalizeResult(result);if(normalized.length!==heat.pilots.length)throw new Error('Неполный результат перезаезда');
  heat.result=normalized;heat.saved=true;race.qualificationRunoffOrder=race.qualificationRunoffOrder||{};
  const base=Math.max(1,Number(heat.runoffBaseRank||1)),globalFrom=Math.max(1,Number(heat.runoffPositions?.[0]||1));
  for(let i=0;i<normalized.length;){let j=i+1;while(j<normalized.length&&compareFinalResultItems(normalized[i],normalized[j])===0)j++;const group=normalized.slice(i,j);if(group.length===1)race.qualificationRunoffOrder[String(group[0].pilotId)]=base+i;else queueQualificationRunoff(race,group.map(x=>x.pilotId),globalFrom+i,globalFrom+j-1,base+i,100+j);i=j;}
  updateStandings(race);normalizeQualifyingEnabled(race);finalizeQualificationOrCreateRunoffs(race);return heat;
}

/* Legacy RC28 stage migration: the old random draw action now only creates a real run-off. */
function resolveQualificationTie(race){createQualificationRunoffs(race);return qualificationRunoffHeats(race).filter(h=>!h.saved);}
