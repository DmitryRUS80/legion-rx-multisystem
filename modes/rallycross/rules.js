'use strict';
const SPORT_RULES = Object.freeze({
  version:'RALLYCROSS-2026.09',
  qualifyingPoints:Object.freeze([50,45,42,40,39,38,37,36,35,34,33,32,31,30,29,28]),
  championshipEventPoints:Object.freeze([25,18,15,12,10,8,6,4,2,1]),
  finalARuns:Object.freeze(['A1','A2','A3']),
  finalBestCount:2,
  finalNonFinishScore:7,
  statuses:Object.freeze(['FIN','DNF','DNS','DSQ'])
});
const SCORE_TABLE = SPORT_RULES.qualifyingPoints;
const EVENT_POINTS = SPORT_RULES.championshipEventPoints;
const FINAL_A_RUNS = SPORT_RULES.finalARuns;

function makeRace(input={}){
  const now=new Date().toISOString();
  return {
    id:uid('race'),eventName:input.eventName||'Новая гонка',clubName:input.clubName||'Legion RC',eventDate:input.eventDate||new Date().toISOString().slice(0,10),eventLocation:input.eventLocation||'',eventStatus:input.eventStatus||'club',championshipId:input.championshipId||'',championshipStageNumber:input.championshipStageNumber||null,championshipStageId:input.championshipStageId||'',qualifyingCount:Number(input.qualifyingCount||4),publishAllowed:false,
    pilots:[],heats:[],finals:[],finalProtocol:[],exactTieLots:{},stage:'setup',lifecycleStatus:'active',createdAt:now,updatedAt:now,completedAt:'',
    raceSettings:{
      qualificationLimitType:input.qualificationLimitType||'time',
      qualificationMinutes:Number(input.qualificationMinutes||5),
      qualificationLaps:Number(input.qualificationLaps||8),
      finalLimitType:input.finalLimitType||'laps',
      finalMinutes:Number(input.finalMinutes||5),
      finalLaps:Number(input.finalLaps||7),
      countdownSec:Number(input.countdownSec||10),
      warmupMinutes:Math.max(1,Math.min(5,Number(input.warmupMinutes||2))),
      minLapSec:Number(input.minLapSec||2)
    },
    runtime:{activeEventKey:'',session:null,eventResults:{},eventLog:[]}
  };
}

function makePilot(profile={},registrationOrder=1){
  return {id:profile.id||uid('pilot'),profileId:profile.profileId||profile.id||'',name:profile.name||'Пилот',club:profile.club||'',city:profile.city||'',country:profile.country||'',photo:profile.photo||'',transponder:String(profile.transponder||''),registrationOrder,qualifying:[],best3:0,points:0,best3Rounds:[],finalResults:[]};
}

function getPilot(race,id){return race.pilots.find(p=>String(p.id)===String(id));}

function normalizeResult(items){
  const arr=(items||[]).map(i=>({pilotId:i.pilotId,status:i.status||'FIN',place:i.status==='FIN'||!i.status?Number(i.place)||null:null,dnfOrder:i.status==='DNF'?Number(i.dnfOrder)||null:null}));
  const fins=arr.filter(i=>i.status==='FIN').sort((a,b)=>(a.place||999)-(b.place||999));fins.forEach((i,idx)=>i.place=idx+1);
  const dnfs=arr.filter(i=>i.status==='DNF');dnfs.forEach((i,idx)=>i.dnfOrder=i.dnfOrder||idx+1);
  return arr.sort(compareFinalResultItems);
}
