'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
function load(rel){vm.runInThisContext(fs.readFileSync(path.join(ROOT,rel),'utf8'),{filename:rel});}
function ok(name,cond,detail=''){if(!cond){console.error(`FAIL ${name}${detail?': '+detail:''}`);process.exitCode=2;}else console.log(`PASS ${name}`);}
global.localStorage={m:new Map(),getItem(k){return this.m.has(k)?this.m.get(k):null},setItem(k,v){this.m.set(k,String(v))},removeItem(k){this.m.delete(k)}};
global.state={pilotDb:Array.from({length:23},(_,i)=>({id:`p${i+1}`,name:`Pilot ${i+1}`,transponder:String(101+i),country:'RU'}))};
load('modes/classic-rc/efra-rules.js');
load('modes/classic-rc/groups.js');
load('runtime/competition-scheduler.js');
load('modes/classic-rc/efra-engine.js');

ClassicRCEngine.create({name:'Full Flow',date:'2026-09-16',category:'10-offroad',pilotIds:state.pilotDb.map(p=>p.id),seedingRounds:2,controlledPracticeRounds:2,qualifyingRounds:5,startTime:'09:00',roundBreakMin:3,finalBreakMin:20,finalPractice:true});
const c=ClassicRCEngine.prepare();
const rankOf=id=>Number(String(id).replace('p',''));
function makeSession(ev){const live={};for(const id of ev.pilots){const r=rankOf(id),base=9000+r*20;live[id]={laps:4,lapTimes:[base,base+10,base-5,base+15],bestLapMs:base-5,lastLapMs:base+15,timeMs:base*4,elapsedMs:base*4,started:true,finished:true};}return{live};}
function makeResult(ev){return ev.pilots.map((id,i)=>{const r=rankOf(id);return{pilotId:id,status:'FIN',laps:20-Math.floor((r-1)/8),timeMs:300000+r*100+i,carNumber:i+1};});}
let guard=0,seenStages=new Set();
while(ClassicRCEngine.currentEvent()&&guard++<200){const ev=ClassicRCEngine.currentEvent();seenStages.add(ev.stage);const item=c.timeline.items.find(x=>x.eventKey===ev.key);if(!item)throw new Error(`No schedule item for ${ev.label}`);const startAt=Math.max(item.plannedStartEpoch, c.timeline.items.filter(x=>x.kind==='heat'&&x.status==='completed').reduce((m,x)=>Math.max(m,(x.actualStartEpoch||0)+(item.minStartGapMin||0)*60000),0));const st=ClassicRCEngine.startScheduleHeat(ev.key,startAt);if(!st.ok)throw new Error(`${ev.label}: ${st.error}`);ClassicRCEngine.saveHeat(ev.key,makeResult(ev),makeSession(ev));}
ok('flow_terminates',guard<200,`guard=${guard}`);
ok('all_main_stages_seen',['seeding','controlled','qualifying','finalPractice','final'].every(x=>seenStages.has(x)),[...seenStages].join(','));
ok('qualifying_five_rounds_scored',c.qualifyingScores.filter(Boolean).length===5);
ok('qualifying_count_is_best2',c.qualifyingStandings.every(x=>x.counting.length===2));
ok('final_groups_abc',c.finalGroups.map(g=>g.name).join(',')==='A,B,C');
ok('offroad_final_practice_a_only',c.events.filter(e=>e.stage==='finalPractice').map(e=>e.groupName).join(',')==='A');
ok('all_finals_three_legs',c.finalGroups.every(g=>c.events.filter(e=>e.stage==='final'&&e.groupName===g.name).length===3));
ok('event_finished',c.status==='finished');
ok('protocol_has_all_pilots',c.finalProtocol?.length===23);
ok('protocol_starts_with_a_final',c.finalProtocol?.slice(0,10).every(x=>x.groupName==='A'));
ok('all_heat_schedule_items_completed',c.timeline.items.filter(x=>x.kind==='heat'&&x.eventKey).every(x=>x.status==='completed'));
ok('rallycross_state_never_created',!('race' in state));
if(process.exitCode)process.exit(process.exitCode);
