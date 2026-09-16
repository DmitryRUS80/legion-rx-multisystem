'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
function load(rel,exportExpr=''){vm.runInThisContext(fs.readFileSync(path.join(ROOT,rel),'utf8')+(exportExpr?`\n${exportExpr}`:''),{filename:rel});}
global.localStorage={m:new Map(),getItem(k){return this.m.has(k)?this.m.get(k):null},setItem(k,v){this.m.set(k,String(v))},removeItem(k){this.m.delete(k)}};
global.state={pilotDb:[1,2,3,4,5].map(i=>({id:'p'+i,name:'P'+i,transponder:String(100+i)})),view:'classicCockpit',session:null};
global.lapwiz={connected:false,running:false};global.toast=()=>{};global.render=()=>{};global.announcer={play:()=>{}};global.fmtClock=ms=>String(Math.ceil(ms/1000));
let scale=8;global.raceTestSourceAdapter={available:()=>true,isEnabled:()=>true,scale:()=>scale,getConfig:()=>({mode:'normal',speed:scale,lapMinSec:8,lapMaxSec:15}),configure:c=>(scale=Number(c.speed)||scale,c),startSession:()=>true,pause:()=>{},resume:()=>{},stop:()=>{}};
load('modes/classic-rc/efra-rules.js');load('modes/classic-rc/groups.js');load('runtime/competition-scheduler.js');load('modes/classic-rc/efra-engine.js');load('modes/classic-rc/efra-runtime.js','global.__R=ClassicRCRuntime;global.__E=ClassicRCEngine;');
const E=global.__E,R=global.__R;
const now=new Date(),date=now.toISOString().slice(0,10),hh=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
E.create({name:'simclock',date,category:'10-offroad',pilotIds:state.pilotDb.map(p=>p.id),seedingRounds:2,controlledPracticeRounds:1,qualifyingRounds:2,startTime:hh,roundBreakMin:3,finalBreakMin:5});E.prepare();
const v0=R.rawNowEpoch(),r0=Date.now();
setTimeout(()=>{const vd=R.rawNowEpoch()-v0,rd=Date.now()-r0,ratio=vd/Math.max(1,rd);if(ratio<6.5||ratio>9.5){console.error('FAIL sim_schedule_clock_ratio',ratio);process.exit(2);}console.log('PASS sim_schedule_clock_ratio',ratio.toFixed(2));
const s=R.ensureSession();s.phase='running';s.startedAtPerf=performance.now();s.elapsedBeforePause=0;s.clockScale=8;const e0=R.elapsed(s);setTimeout(()=>{const ed=R.elapsed(s)-e0;if(ed<500){console.error('FAIL sim_race_elapsed_scaled',ed);process.exit(2);}console.log('PASS sim_race_elapsed_scaled',Math.round(ed));R.setSimulationSpeed(2);if(scale!==2){console.error('FAIL speed_cycle_config');process.exit(2);}console.log('PASS speed_reconfigure');process.exit(0);},90);},100);
