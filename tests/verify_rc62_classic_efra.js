'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
function load(rel){vm.runInThisContext(fs.readFileSync(path.join(ROOT,rel),'utf8'),{filename:rel});}
function ok(name,cond,detail=''){if(!cond){console.error(`FAIL ${name}${detail?': '+detail:''}`);process.exitCode=2;}else console.log(`PASS ${name}`);}

global.localStorage={m:new Map(),getItem(k){return this.m.has(k)?this.m.get(k):null},setItem(k,v){this.m.set(k,String(v))},removeItem(k){this.m.delete(k)}};
global.state={pilotDb:Array.from({length:23},(_,i)=>({id:`p${i+1}`,name:`Pilot ${i+1}`,transponder:String(100+i)}))};
load('modes/classic-rc/efra-rules.js');
load('modes/classic-rc/groups.js');
load('runtime/competition-scheduler.js');
load('modes/classic-rc/efra-engine.js');

ok('q_count_1_void',classicRCQualifyingRoundsToCount(1)===0);
ok('q_count_2_1',classicRCQualifyingRoundsToCount(2)===1);
ok('q_count_5_2',classicRCQualifyingRoundsToCount(5)===2);
ok('q_count_6_3',classicRCQualifyingRoundsToCount(6)===3);

const qscore=classicRCScoreQualifyingRound([
 {pilotId:'a',status:'FIN',laps:10,timeMs:300000},
 {pilotId:'b',status:'FIN',laps:10,timeMs:300000},
 {pilotId:'c',status:'FIN',laps:10,timeMs:301000},
 {pilotId:'d',status:'DNS',laps:0,timeMs:null}
],['a','b','c','d']);
const qm=Object.fromEntries(qscore.map(x=>[x.pilotId,x]));
ok('q_equal_time_equal_zero',qm.a.points===0&&qm.b.points===0);
ok('q_next_after_tie_is_third',qm.c.position===3&&qm.c.points===3);
ok('q_no_time_last_place',qm.d.points===4);

const qDnf=classicRCScoreQualifyingRound([
 {pilotId:'a',status:'DNF',laps:8,timeMs:240000},
 {pilotId:'b',status:'FIN',laps:7,timeMs:220000},
 {pilotId:'c',status:'DNS',laps:0,timeMs:null}
],['a','b','c']);
const qdm=Object.fromEntries(qDnf.map(x=>[x.pilotId,x]));
ok('q_dnf_with_time_is_classified',qdm.a.points===0&&qdm.b.points===2&&qdm.c.points===3);

const qa={total:4,counting:[{points:0,laps:10,timeMs:301000},{points:4,laps:10,timeMs:302000}]};
const qb={total:4,counting:[{points:2,laps:10,timeMs:299000},{points:2,laps:10,timeMs:299500}]};
ok('q_tie_best_finish_first',classicRCCompareQualifyingStanding(qa,qb)<0);
const qc={total:4,counting:[{points:2,laps:11,timeMs:305000},{points:2,laps:10,timeMs:300000}]};
const qd={total:4,counting:[{points:2,laps:10,timeMs:295000},{points:2,laps:10,timeMs:299000}]};
ok('q_continuing_tie_laps_time',classicRCCompareQualifyingStanding(qc,qd)<0);

const fscore=classicRCFinalLegPoints([
 {pilotId:'a',status:'FIN',laps:12,timeMs:304000,carNumber:1},
 {pilotId:'b',status:'FIN',laps:12,timeMs:304000,carNumber:2},
 {pilotId:'c',status:'FIN',laps:12,timeMs:305000,carNumber:3},
 {pilotId:'d',status:'DNS',laps:0,timeMs:0,carNumber:4}
],4);
const fm=Object.fromEntries(fscore.map(x=>[x.pilotId,x]));
ok('final_equal_time_equal_points',fm.a.points===1&&fm.b.points===1);
ok('final_next_after_tie_third',fm.c.points===3);
ok('final_dns_remaining_by_car_number',fm.d.points===4);

const fg={pilots:['a','b']};
const finalRows=classicRCBuildFinalStandings(fg,[
 {scored:[{pilotId:'a',points:1,laps:12,timeMs:300000},{pilotId:'b',points:2,laps:12,timeMs:299000}]},
 {scored:[{pilotId:'a',points:2,laps:12,timeMs:298000},{pilotId:'b',points:1,laps:12,timeMs:301000}]},
 {scored:[{pilotId:'a',points:4,laps:11,timeMs:300000},{pilotId:'b',points:4,laps:11,timeMs:300000}]}
],new Map([['a',1],['b',2]]));
ok('final_best2_sum',finalRows.every(x=>x.total===3));
ok('final_tie_uses_best_finish_time',finalRows[0].pilotId==='a');

const sizes=classicRCBalancedSizes(23,10);
ok('groups_balanced_23',sizes.length===3&&Math.max(...sizes)<=10&&Math.max(...sizes)-Math.min(...sizes)<=1,JSON.stringify(sizes));
const heats=classicRCSeededHeats(Array.from({length:23},(_,i)=>`p${i+1}`),10);
ok('groups_fastest_in_highest_heat',heats.at(-1).pilots[0]==='p1');
ok('offroad_r1_exact',classicRCOffroadHeatOrder(13,1).join(',')==='1,2,3,4,5,6,7,8,9,10,11,12,13');
ok('offroad_r2_exact',classicRCOffroadHeatOrder(13,2).join(',')==='4,5,6,7,8,9,10,11,12,13,1,2,3');
ok('offroad_r3_exact',classicRCOffroadHeatOrder(13,3).join(',')==='7,8,9,10,11,12,13,1,2,3,4,5,6');
ok('offroad_r4_exact',classicRCOffroadHeatOrder(13,4).join(',')==='10,11,12,13,1,2,3,4,5,6,7,8,9');
ok('offroad_r5_exact',classicRCOffroadHeatOrder(13,5).join(',')==='13,12,11,10,9,8,7,6,5,4,3,2,1');

const standings=Array.from({length:23},(_,i)=>({pilotId:`p${i+1}`,rank:i+1}));
const finalsKeep=classicRCFinalGroupsFromQualification(standings,10,'keep');
ok('finals_abc_10_10_3',finalsKeep.map(x=>x.pilots.length).join(',')==='10,10,3');
const finalsRe=classicRCFinalGroupsFromQualification(standings,10,'rebalance');
ok('lowest_final_rebalance',finalsRe.map(x=>x.pilots.length).join(',')==='10,7,6');

const tl=CompetitionScheduler.make({date:'2026-09-16',startTime:'09:00'});
const t0=tl.startEpoch;
CompetitionScheduler.add(tl,{kind:'heat',eventKey:'h1',label:'H1',durationMin:5,minStartGapMin:7,plannedStartEpoch:t0,status:'completed'});
tl.items[0].actualStartEpoch=t0;tl.items[0].actualEndEpoch=t0+5*60000;
CompetitionScheduler.add(tl,{kind:'break',id:'b1',label:'BREAK',durationMin:5,plannedStartEpoch:t0+7*60000});
CompetitionScheduler.add(tl,{kind:'heat',eventKey:'h2',label:'H2',durationMin:5,minStartGapMin:7,plannedStartEpoch:t0+12*60000});
const preview=CompetitionScheduler.canStart(tl,'h2',t0+8*60000);
ok('scheduler_preflight_no_mutation',preview.ok&&tl.items[1].status==='pending'&&tl.items[2].status==='pending'&&tl.items[2].actualStartEpoch===null);
const tooEarly=CompetitionScheduler.start(tl,'h2',t0+6*60000);
ok('scheduler_respects_min_gap',!tooEarly.ok&&tooEarly.earliestEpoch===t0+7*60000);
const early=CompetitionScheduler.start(tl,'h2',t0+8*60000);
ok('scheduler_early_start_ok',early.ok);
ok('scheduler_closes_intervening_break',tl.items[1].status==='completed');
ok('scheduler_heat_active',tl.items[2].status==='active'&&tl.items[2].plannedStartEpoch===t0+8*60000);

const tlDelay=CompetitionScheduler.make({date:'2026-09-16',startTime:'10:00'}),d0=tlDelay.startEpoch;
CompetitionScheduler.add(tlDelay,{kind:'heat',eventKey:'d1',durationMin:5,minStartGapMin:7,plannedStartEpoch:d0});
CompetitionScheduler.add(tlDelay,{kind:'heat',eventKey:'d2',durationMin:5,minStartGapMin:7,plannedStartEpoch:d0+7*60000});
CompetitionScheduler.start(tlDelay,'d1',d0);CompetitionScheduler.finish(tlDelay,'d1',d0+9*60000);
ok('scheduler_overrun_pushes_future',tlDelay.items[1].plannedStartEpoch===d0+9*60000);
const tlEarlyFinish=CompetitionScheduler.make({date:'2026-09-16',startTime:'11:00'}),e0=tlEarlyFinish.startEpoch;
CompetitionScheduler.add(tlEarlyFinish,{kind:'heat',eventKey:'e1',durationMin:5,minStartGapMin:7,plannedStartEpoch:e0});
CompetitionScheduler.add(tlEarlyFinish,{kind:'heat',eventKey:'e2',durationMin:5,minStartGapMin:7,plannedStartEpoch:e0+7*60000});
CompetitionScheduler.start(tlEarlyFinish,'e1',e0);CompetitionScheduler.finish(tlEarlyFinish,'e1',e0+4*60000);
ok('scheduler_early_finish_does_not_pull_future',tlEarlyFinish.items[1].plannedStartEpoch===e0+7*60000);

ClassicRCEngine.create({name:'Test',date:'2026-09-16',category:'10-offroad',pilotIds:standings.map(x=>x.pilotId),seedingRounds:2,controlledPracticeRounds:2,qualifyingRounds:5,startTime:'09:00',finalPractice:true});
const ce=ClassicRCEngine.prepare();
ok('engine_23_three_heats',ce.groups.length===3&&ce.groups.every(g=>g.pilots.length<=10));
ok('engine_pre_final_event_count',ce.events.length===3*(2+2+5));
ok('engine_timeline_contains_final_placeholders',ce.timeline.items.filter(x=>x.stage==='final'&&x.meta?.placeholder).length===9);
ok('engine_offroad_a_final_practice_placeholder',ce.timeline.items.filter(x=>x.stage==='finalPractice'&&x.meta?.placeholder).length===1);

if(process.exitCode)process.exit(process.exitCode);
