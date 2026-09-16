'use strict';
/* CLASSIC RC · heat/group generation only. */
function classicRCBalancedSizes(total,maxPerHeat=10){
  const count=Math.max(1,Math.ceil(Math.max(1,total)/maxPerHeat)),base=Math.floor(total/count),extra=total%count;
  return Array.from({length:count},(_,i)=>base+(i>=count-extra?1:0));
}
function classicRCSeededHeats(pilotIds,maxPerHeat=10){
  const ids=[...(pilotIds||[])],sizes=classicRCBalancedSizes(ids.length,maxPerHeat),groups=Array.from({length:sizes.length},()=>[]);let cursor=0;
  /* Heat numbers run slow -> fast. Ranked input is fast -> slow. */
  for(let h=sizes.length-1;h>=0;h--){const size=sizes[h];groups[h]=ids.slice(cursor,cursor+size);cursor+=size;}
  return groups.map((pilots,i)=>({heat:i+1,pilots}));
}
function classicRCInitialHeats(pilotIds,maxPerHeat=10){
  const ids=[...(pilotIds||[])],count=Math.max(1,Math.ceil(Math.max(1,ids.length)/maxPerHeat)),groups=Array.from({length:count},()=>[]);
  ids.forEach((id,i)=>groups[i%count].push(id));return groups.map((pilots,i)=>({heat:i+1,pilots}));
}
function classicRCOffroadHeatOrder(heatCount,round){
  const n=Math.max(1,Number(heatCount)||1),r=Math.max(1,Number(round)||1),asc=Array.from({length:n},(_,i)=>i+1);if(r===1)return asc;if(r>=5)return[...asc].reverse();
  const start=Math.min(n,1+Math.floor((r-1)*n/4));return [...asc.slice(start-1),...asc.slice(0,start-1)];
}
function classicRCHeatOrder(category,heatCount,round){return category==='10-offroad'?classicRCOffroadHeatOrder(heatCount,round):Array.from({length:heatCount},(_,i)=>i+1);}
function classicRCFinalGroupsFromQualification(standings,maxPerFinal=10,lowestPolicy='keep'){
  const ranked=[...(standings||[])],groups=[];for(let i=0;i<ranked.length;i+=maxPerFinal){const index=Math.floor(i/maxPerFinal),name=String.fromCharCode(65+index);groups.push({name,pilots:ranked.slice(i,i+maxPerFinal).map(x=>x.pilotId),qualifyingRanks:ranked.slice(i,i+maxPerFinal).map(x=>x.rank)});}
  if(lowestPolicy==='rebalance'&&groups.length>1&&groups.at(-1).pilots.length<4){
    const hi=groups.at(-2),lo=groups.at(-1),combined=[...hi.pilots,...lo.pilots],combinedRanks=[...hi.qualifyingRanks,...lo.qualifyingRanks],lowSize=Math.floor(combined.length/2),highSize=combined.length-lowSize;
    hi.pilots=combined.slice(0,highSize);hi.qualifyingRanks=combinedRanks.slice(0,highSize);lo.pilots=combined.slice(highSize);lo.qualifyingRanks=combinedRanks.slice(highSize);
  }
  return groups;
}
