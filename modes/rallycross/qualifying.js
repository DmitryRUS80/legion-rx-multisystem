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

function comparePilotsWithoutLot(race,a,b){if(b.best3!==a.best3)return b.best3-a.best3;const bestA=getBest3Results(a),bestB=getBest3Results(b);const hd=compareNumberArraysDesc(placeHistogram(bestA),placeHistogram(bestB));if(hd!==0)return hd;const dd=compareResultArraysByQuality(getDiscardedResults(a),getDiscardedResults(b));if(dd!==0)return dd;for(let round=race.qualifyingCount;round>=1;round--){const rd=qualifyingResultRank(a.qualifying.find(r=>r.round===round))-qualifyingResultRank(b.qualifying.find(r=>r.round===round));if(rd!==0)return rd;}return 0;}

function comparePilots(race,a,b){const s=comparePilotsWithoutLot(race,a,b);if(s!==0)return s;const la=race.exactTieLots?.[String(a.id)],lb=race.exactTieLots?.[String(b.id)];if(Number.isInteger(la)&&Number.isInteger(lb)&&la!==lb)return la-lb;return (a.registrationOrder||9999)-(b.registrationOrder||9999);}

function updateStandings(race){race.pilots.forEach(calculateBest3);race.pilots.sort((a,b)=>comparePilots(race,a,b));return race.pilots;}

function getExactTieGroups(race){updateStandings(race);const groups=[];for(let i=0;i<race.pilots.length;){let g=[race.pilots[i]],j=i+1;while(j<race.pilots.length&&comparePilotsWithoutLot(race,race.pilots[i],race.pilots[j])===0){g.push(race.pilots[j]);j++;}if(g.length>1)groups.push(g);i=j;}return groups;}

function runTieDraw(race){race.exactTieLots=race.exactTieLots||{};getExactTieGroups(race).forEach(group=>{const arr=[...group];for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}arr.forEach((p,i)=>race.exactTieLots[String(p.id)]=i+1);});updateStandings(race);}

function getHeatCount(pilotCount){if(pilotCount<=6)return 1;return Math.ceil(pilotCount/6);}

function buildSnakeHeats(pilots,heatCount,round){const shift=pilots.length?(round-1)%pilots.length:0;const ordered=[...pilots.slice(shift),...pilots.slice(0,shift)];const heats=Array.from({length:heatCount},()=>[]);ordered.forEach((pilot,index)=>{const row=Math.floor(index/heatCount),column=index%heatCount,heatIndex=row%2===0?column:heatCount-1-column;heats[heatIndex].push(pilot);});return heats.filter(h=>h.length);}

function createQualifyingData(race){race.heats=[];const pilots=[...race.pilots].sort((a,b)=>(a.registrationOrder||0)-(b.registrationOrder||0));const heatCount=getHeatCount(pilots.length);for(let round=1;round<=race.qualifyingCount;round++){buildSnakeHeats(pilots,heatCount,round).forEach((hp,idx)=>race.heats.push({key:`Q${round}-H${idx+1}`,type:'qualifying',label:`Квалификация ${round} · Заезд ${idx+1}`,round,heat:idx+1,pilots:hp.map(p=>p.id),saved:false,result:[],enabled:round===1&&idx===0,order:round*100+idx}));}}

function prepareRace(race){race.finals=[];race.finalProtocol=[];race.exactTieLots={};race.stage='qualifying';race.pilots.forEach(p=>{p.qualifying=[];p.best3=0;p.points=0;p.finalResults=[];});createQualifyingData(race);normalizeQualifyingEnabled(race);return race;}

function normalizeQualifyingEnabled(race){const unsaved=race.heats.filter(h=>!h.saved).sort((a,b)=>a.order-b.order);race.heats.forEach(h=>h.enabled=false);if(unsaved[0])unsaved[0].enabled=true;}

function saveQualifyingEvent(race,eventKey,result){const heat=race.heats.find(h=>h.key===eventKey);if(!heat||heat.saved)throw new Error('Заезд не найден или уже сохранён');heat.result=normalizeResult(result);heat.saved=true;heat.result.forEach((item,index)=>{const p=getPilot(race,item.pilotId);if(!p)return;if(item.status==='FIN')savePilotResult(p,heat.round,heat.heat,item.place??index+1);else savePilotResult(p,heat.round,heat.heat,item.status,item.dnfOrder);});updateStandings(race);normalizeQualifyingEnabled(race);if(race.heats.every(h=>h.saved)){const ties=getExactTieGroups(race).filter(g=>g.some(p=>!Number.isInteger(race.exactTieLots?.[String(p.id)])));if(ties.length)race.stage='tie';else generateFinals(race);}return heat;}

function resolveQualificationTie(race){runTieDraw(race);generateFinals(race);return race.finals;}
