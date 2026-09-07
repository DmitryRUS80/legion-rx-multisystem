'use strict';
function createFinal(name,pilots=[],options={}){return {key:`F-${name}`,name,label:options.label||name,type:options.type||'lcq',round:Number(options.round||0),order:Number(options.order||0),pilots:pilots.map(p=>p?.id||p),basePilots:pilots.map(p=>p?.id||p),result:[],saved:false,enabled:Boolean(options.enabled),advanceCount:Number(options.advanceCount||0)};}

function finalByName(race,name){return race.finals.find(f=>f.name===name);}

function qualificationRankMap(race){const m=new Map();race.pilots.forEach((p,i)=>m.set(String(p.id),i+1));return m;}

function splitSnake(pilots,groupCount){const groups=Array.from({length:groupCount},()=>[]);if(groupCount<=1)return[pilots.slice()];let index=0,direction=1;pilots.forEach(p=>{groups[index].push(p);if(direction>0){if(index===groupCount-1){direction=-1;index-=1;}else index+=1;}else{if(index===0){direction=1;index+=1;}else index-=1;}});return groups;}

function addFinalARuns(race,pilots,enabledFirst=false,startOrder=1000){FINAL_A_RUNS.forEach((name,index)=>race.finals.push(createFinal(name,pilots,{type:'main',label:`Финал ${name}`,order:startOrder+index,enabled:enabledFirst&&index===0})));}

function createPreliminaryRound(race,pilotIdsOrObjects,round,startOrder){const groupCount=Math.ceil(pilotIdsOrObjects.length/6),groups=splitSnake(pilotIdsOrObjects,groupCount);groups.forEach((group,index)=>race.finals.push(createFinal(`P${round}-${index+1}`,group,{type:'prelim',label:`Предварительный LCQ ${round}.${index+1}`,round,order:startOrder+index,enabled:true,advanceCount:1})));}

function generateFinals(race){updateStandings(race);race.finals=[];race.finalProtocol=[];race.pilots.forEach(p=>p.finalResults=[]);const pilots=[...race.pilots],count=pilots.length;if(count<=6)addFinalARuns(race,pilots,true);else{const remaining=pilots.slice(4);if(count<=10)race.finals.push(createFinal('LCQ',remaining,{type:'single-lcq',label:'Заезд последнего шанса (LCQ)',order:100,enabled:true,advanceCount:2}));else if(count<=16){const groups=splitSnake(remaining,2);race.finals.push(createFinal('LCQ-B',groups[0],{type:'dual-lcq',label:'LCQ B',round:1,order:100,enabled:true,advanceCount:1}));race.finals.push(createFinal('LCQ-C',groups[1],{type:'dual-lcq',label:'LCQ C',round:1,order:101,enabled:true,advanceCount:1}));}else createPreliminaryRound(race,remaining,1,100);addFinalARuns(race,[],false);}race.stage='finals';return race.finals;}

function compareFinalResultItems(a,b){const r={FIN:0,DNF:1,DNS:2,DSQ:3};if(r[a.status]!==r[b.status])return r[a.status]-r[b.status];if(a.status==='FIN')return(a.place||999)-(b.place||999);if(a.status==='DNF')return(a.dnfOrder||999)-(b.dnfOrder||999);return 0;}

function classifiedForAdvancement(result){return result.filter(i=>i.status==='FIN'||i.status==='DNF');}

function setMainGrid(race,lastTwo){const qTop4=race.pilots.slice(0,4).map(p=>p.id),grid=[...qTop4,...lastTwo].slice(0,6);FINAL_A_RUNS.forEach((name,index)=>{const f=finalByName(race,name);if(f){f.pilots=[...grid];f.basePilots=[...grid];f.enabled=index===0;}});}

function processPreliminaryRound(race,round){const finals=race.finals.filter(f=>f.type==='prelim'&&f.round===round);if(!finals.length||!finals.every(f=>f.saved))return;const winners=finals.map(f=>classifiedForAdvancement(f.result)[0]?.pilotId).filter(Boolean);if(winners.length<=6){if(!finalByName(race,`LCQ-F${round}`))race.finals.push(createFinal(`LCQ-F${round}`,winners,{type:'final-lcq',label:'Заключительный LCQ',round:round+1,order:500+round,enabled:true,advanceCount:2}));}else{const next=round+1;if(!race.finals.some(f=>f.type==='prelim'&&f.round===next))createPreliminaryRound(race,winners,next,100+next*50);}}

function advanceFinalists(race,final){if(final.type==='single-lcq'){setMainGrid(race,classifiedForAdvancement(final.result).slice(0,2).map(i=>i.pilotId));return;}if(final.type==='dual-lcq'){const pair=race.finals.filter(f=>f.type==='dual-lcq');if(pair.every(f=>f.saved)){const rank=qualificationRankMap(race),w=pair.map(f=>classifiedForAdvancement(f.result)[0]?.pilotId).filter(Boolean).sort((a,b)=>(rank.get(String(a))||9999)-(rank.get(String(b))||9999));setMainGrid(race,w);}return;}if(final.type==='prelim'){processPreliminaryRound(race,final.round);return;}if(final.type==='final-lcq'){setMainGrid(race,classifiedForAdvancement(final.result).slice(0,2).map(i=>i.pilotId));return;}if(final.type==='main'){const idx=FINAL_A_RUNS.indexOf(final.name);if(idx<2){const n=finalByName(race,FINAL_A_RUNS[idx+1]);if(n)n.enabled=true;}else buildFinalProtocol(race);}}

function saveFinalEvent(race,eventKey,result){const final=race.finals.find(f=>f.key===eventKey);if(!final||!final.enabled||final.saved)throw new Error('Финал закрыт или уже сохранён');final.result=normalizeResult(result).sort(compareFinalResultItems);final.saved=true;final.result.forEach((item,index)=>{const p=getPilot(race,item.pilotId);if(p)p.finalResults.push({final:final.name,place:item.place,status:item.status,dnfOrder:item.dnfOrder,order:index+1});});advanceFinalists(race,final);return final;}

function mainRunScore(item){return item?.status==='FIN'?Number(item.place||SPORT_RULES.finalNonFinishScore):SPORT_RULES.finalNonFinishScore;}

function buildMainStandings(race){const rank=qualificationRankMap(race),main=FINAL_A_RUNS.map(n=>finalByName(race,n)).filter(Boolean),pilotIds=main[0]?.pilots||[];return pilotIds.map(pilotId=>{const results=main.map(f=>f.saved?(f.result.find(i=>String(i.pilotId)===String(pilotId))||{status:'DNS'}):null),scores=results.map(i=>i?mainRunScore(i):null),done=scores.filter(Number.isFinite),bestTwo=[...done].sort((a,b)=>a-b).slice(0,SPORT_RULES.finalBestCount),latest=[...scores].reverse().find(Number.isFinite);return{pilotId,results,scores,bestTwo,total:bestTwo.length?bestTwo.reduce((s,v)=>s+v,0):null,wins:results.filter(i=>i?.status==='FIN'&&i.place===1).length,seconds:results.filter(i=>i?.status==='FIN'&&i.place===2).length,lastScore:latest??9999,qRank:rank.get(String(pilotId))||9999};}).sort((a,b)=>{if(a.total===null&&b.total!==null)return 1;if(a.total!==null&&b.total===null)return-1;if(a.total!==b.total)return(a.total??9999)-(b.total??9999);return b.wins-a.wins||b.seconds-a.seconds||a.lastScore-b.lastScore||a.qRank-b.qRank;});}

function mainOverallStatus(item){
  const rr=(item?.results||[]).filter(Boolean);
  if(rr.some(r=>r.status==='FIN'))return'FIN';
  if(rr.some(r=>r.status==='DNF'))return'DNF';
  if(rr.some(r=>r.status==='DNS'))return'DNS';
  if(rr.some(r=>r.status==='DSQ'))return'DSQ';
  return'NC';
}

function mainRunLabel(result,score){
  if(!result)return'—';
  return result.status==='FIN'?String(result.place||score||'—'):`${result.status}${Number.isFinite(score)?` (${score})`:''}`;
}

function buildFinalProtocol(race){
  const main=buildMainStandings(race),added=new Set(main.map(i=>String(i.pilotId))),eliminated=[],rank=qualificationRankMap(race),groups=new Map();
  race.finals.filter(f=>f.saved&&f.type!=='main').forEach(f=>{
    const k=f.type==='dual-lcq'?'dual-lcq':f.type==='prelim'?`prelim-${f.round}`:`${f.type}-${f.order}`;
    if(!groups.has(k))groups.set(k,{order:f.order,finals:[]});
    groups.get(k).order=Math.max(groups.get(k).order,f.order);groups.get(k).finals.push(f);
  });
  [...groups.values()].sort((a,b)=>b.order-a.order).forEach(g=>{
    const c=[];g.finals.forEach(f=>[...f.result].sort(compareFinalResultItems).forEach((i,index)=>c.push({...i,resultOrder:index+1,source:f.label})));
    c.sort((a,b)=>a.resultOrder-b.resultOrder||(rank.get(String(a.pilotId))||9999)-(rank.get(String(b.pilotId))||9999));
    c.forEach(i=>{if(!added.has(String(i.pilotId))){eliminated.push({pilotId:i.pilotId,status:i.status,source:i.source});added.add(String(i.pilotId));}});
  });
  race.pilots.forEach(p=>{if(!added.has(String(p.id)))eliminated.push({pilotId:p.id,status:'NC',source:'Квалификация'});});
  const rows=[
    ...main.map(i=>({
      pilotId:i.pilotId,
      status:mainOverallStatus(i),
      source:`Финал A · A1 ${mainRunLabel(i.results[0],i.scores[0])} · A2 ${mainRunLabel(i.results[1],i.scores[1])} · A3 ${mainRunLabel(i.results[2],i.scores[2])} · лучшие ${SPORT_RULES.finalBestCount}: ${i.total??'—'}`
    })),
    ...eliminated
  ];
  race.finalProtocol=rows.map((i,index)=>({
    place:index+1,pilotId:i.pilotId,status:i.status,source:i.source,
    eventPoints:['DNS','DSQ','NC'].includes(i.status)?0:(EVENT_POINTS[index]||0)
  }));
  race.stage='finished';race.lifecycleStatus='completed';race.completedAt=new Date().toISOString();
  return race.finalProtocol;
}
