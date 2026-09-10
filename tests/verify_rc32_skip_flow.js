'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const files=['modes/rallycross/rules.js','modes/rallycross/qualifying.js','modes/rallycross/finals.js','modes/rallycross/index.js','modes/rallycross/runtime.js'];
const source=`function uid(prefix){return prefix+'-test';}\nfunction getPilot(race,id){return race.pilots.find(p=>String(p.id)===String(id));}\nfunction persistRace(){} function closeModal(){} function render(){}\n`+files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+`\n;globalThis.__rc32={prepareRace,generateFinals,currentEvent,cancelRawEvent,buildFinalProtocol,forceFinishCompetition,skipRaceEvents,getExactTieGroups,getMainExactTieGroups};`;
const toasts=[];
const context={
  console,
  performance:{now:()=>0},
  state:{race:null,settings:{warmupMinutes:2,countdownSec:10},prestartTimers:[],session:null},
  announcer:{cancel(){},play:async()=>true},
  lapwiz:{connected:false,running:false,stop:async()=>{}},
  toast:m=>toasts.push(String(m)),
  confirm:()=>true,
  clearTimeout:()=>{},
  setTimeout:()=>0,
  clearInterval:()=>{},
  setInterval:()=>0,
  globalThis:null
};
context.globalThis=context;vm.createContext(context);vm.runInContext(source,context,{filename:'rc32-skip-flow-bundle.js'});const rx=context.__rc32;
const tests=[];function ok(name,value,detail=''){tests.push({name,ok:Boolean(value),detail});console.log(`${value?'PASS':'FAIL'} ${name}${detail?` · ${detail}`:''}`);}
function rc32Pilot(id,n){return{id:String(id),name:`P${id}`,registrationOrder:n,qualifying:[],best3:0,points:0,best3Rounds:[],finalResults:[]};}
function raceOf(count){return{pilots:Array.from({length:count},(_,i)=>rc32Pilot(i+1,i+1)),heats:[],finals:[],finalProtocol:[],qualificationRunoffOrder:{},finalRunoffOrder:{},runoffCounter:0,stage:'setup',lifecycleStatus:'active',qualifyingCount:3,raceSettings:{countdownSec:10}};}
function cancelCurrent(race){const ev=rx.currentEvent(race);if(!ev)return false;const raw=race.heats.find(h=>h.key===ev.key)||race.finals.find(f=>f.key===ev.key);return rx.cancelRawEvent(raw);}

// All qualification heats administratively skipped: no fake 0-point run-off.
{
  const race=raceOf(4);context.state.race=race;rx.prepareRace(race);
  while(rx.currentEvent(race)?.type==='qualifying')cancelCurrent(race);
  ok('Skipped qualification with no recorded results does not create fake run-off',!race.heats.some(h=>h.tieBreak)&&race.stage==='finals');
  ok('Final A becomes the next real event after skipped qualification',rx.currentEvent(race)?.name==='A1');
}

// All Final A runs skipped: cancelled events are not converted to DNS=7 for every pilot.
{
  const race=raceOf(4);context.state.race=race;race.stage='finals';rx.generateFinals(race);
  cancelCurrent(race);cancelCurrent(race);cancelCurrent(race);
  ok('Skipped A1/A2/A3 do not generate artificial Final A run-off',!race.finals.some(f=>f.tieBreak)&&race.stage==='finished');
  ok('Skipped Final A path produces a final protocol instead of limbo',race.finalProtocol.length===4&&!rx.currentEvent(race));
}

// Large field: cancelling preliminary LCQs must never create a zero-pilot downstream event.
{
  const race=raceOf(18);race.pilots.forEach((p,i)=>{p.qualifying=[{round:1,heat:1,status:'FIN',place:i+1,points:100-i}];p.best3=100-i;p.points=100-i;});context.state.race=race;race.stage='finals';rx.generateFinals(race);
  let guard=0,zeroPilot=false;
  while(rx.currentEvent(race)&&guard++<30){const ev=rx.currentEvent(race);if((ev.pilots||[]).length===0)zeroPilot=true;const changed=cancelCurrent(race);if(!changed)break;}
  ok('Preliminary cancellation never creates an empty LCQ/final event',!zeroPilot);
  ok('Large-field skip sequence terminates instead of hanging',race.stage==='finished'&&guard<30&&!rx.currentEvent(race));
}

// Genuine exact Final A equality still requires a run-off and remains protected from "skip".
function rc32Fin(id,place){return{pilotId:String(id),status:'FIN',place};}
function rc32Stats(laps,elapsedMs){return{laps,elapsedMs};}
{
  const race=raceOf(4);race.stage='finals';race.finals=[
    {key:'F-A1',name:'A1',label:'Финал A1',type:'main',order:1000,pilots:['1','2','3','4'],saved:true,enabled:false,result:[rc32Fin(1,1),rc32Fin(2,2),rc32Fin(4,3),rc32Fin(3,4)],lapStats:{'1':rc32Stats(7,50000),'2':rc32Stats(7,60000),'3':rc32Stats(7,76000),'4':rc32Stats(7,68000)}},
    {key:'F-A2',name:'A2',label:'Финал A2',type:'main',order:1001,pilots:['1','2','3','4'],saved:true,enabled:false,result:[rc32Fin(1,1),rc32Fin(3,2),rc32Fin(2,3),rc32Fin(4,4)],lapStats:{'1':rc32Stats(7,50000),'2':rc32Stats(7,70000),'3':rc32Stats(7,60000),'4':rc32Stats(7,78000)}},
    {key:'F-A3',name:'A3',label:'Финал A3',type:'main',order:1002,pilots:['1','2','3','4'],saved:true,enabled:false,result:[rc32Fin(1,1),rc32Fin(4,2),rc32Fin(3,3),rc32Fin(2,4)],lapStats:{'1':rc32Stats(7,50000),'2':rc32Stats(7,80000),'3':rc32Stats(7,70000),'4':rc32Stats(7,65000)}}
  ];context.state.race=race;rx.buildFinalProtocol(race);const tb=rx.currentEvent(race),before=race.finals.length;
  ok('Genuine exact result tie still creates mandatory run-off',Boolean(tb?.tieBreak));
  ok('Low-level cancellation refuses mandatory run-off',rx.cancelRawEvent(race.finals.find(f=>f.key===tb.key))===false&&race.finals.length===before&&rx.currentEvent(race)?.key===tb.key);
}

(async()=>{
  // skipRaceEvents itself must stop at a genuine run-off rather than generating retries.
  const race=raceOf(4);race.stage='finals';race.finals=[
    {key:'F-A1',name:'A1',label:'Финал A1',type:'main',order:1000,pilots:['1','2','3','4'],saved:true,enabled:false,result:[rc32Fin(1,1),rc32Fin(2,2),rc32Fin(4,3),rc32Fin(3,4)],lapStats:{'1':rc32Stats(7,50000),'2':rc32Stats(7,60000),'3':rc32Stats(7,76000),'4':rc32Stats(7,68000)}},
    {key:'F-A2',name:'A2',label:'Финал A2',type:'main',order:1001,pilots:['1','2','3','4'],saved:true,enabled:false,result:[rc32Fin(1,1),rc32Fin(3,2),rc32Fin(2,3),rc32Fin(4,4)],lapStats:{'1':rc32Stats(7,50000),'2':rc32Stats(7,70000),'3':rc32Stats(7,60000),'4':rc32Stats(7,78000)}},
    {key:'F-A3',name:'A3',label:'Финал A3',type:'main',order:1002,pilots:['1','2','3','4'],saved:true,enabled:false,result:[rc32Fin(1,1),rc32Fin(4,2),rc32Fin(3,3),rc32Fin(2,4)],lapStats:{'1':rc32Stats(7,50000),'2':rc32Stats(7,80000),'3':rc32Stats(7,70000),'4':rc32Stats(7,65000)}}
  ];context.state.race=race;rx.buildFinalProtocol(race);const key=rx.currentEvent(race).key,before=race.finals.length;toasts.length=0;
  await rx.skipRaceEvents(5);
  ok('Management skip stops at mandatory run-off without creating a retry chain',rx.currentEvent(race)?.key===key&&race.finals.length===before&&toasts.some(t=>t.includes('нельзя пропустить')));

  // Force finish must escape even a legitimate unresolved run-off and leave archiveable state.
  toasts.length=0;await rx.forceFinishCompetition();
  ok('Force finish escapes unresolved run-off and reaches finished state',race.stage==='finished'&&race.lifecycleStatus==='completed'&&!rx.currentEvent(race));
  ok('Force finish leaves a complete protocol for archive',race.finalProtocol.length===4&&race.finalProtocol.every((r,i)=>r.place===i+1));

  const failed=tests.filter(t=>!t.ok);console.log(`RC32 skip/state tests: ${tests.length-failed.length}/${tests.length} PASS`);process.exit(failed.length?2:0);
})().catch(err=>{console.error(err);process.exit(2);});
