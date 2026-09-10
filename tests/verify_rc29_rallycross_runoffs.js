'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const files=['modes/rallycross/rules.js','modes/rallycross/qualifying.js','modes/rallycross/finals.js','modes/rallycross/index.js'];
const source=`function uid(prefix){return prefix+'-test';}\n`+files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+`\n;globalThis.__rx={SPORT_RULES,FINAL_A_RUNS,EVENT_POINTS,calculateBest3,comparePilotsWithoutRunoff,finalizeQualificationOrCreateRunoffs,saveQualificationRunoffEvent,buildMainStandings,compareMainStandingsCore,buildFinalProtocol,saveFinalEvent,getMainExactTieGroups};`;
const context={console,globalThis:null};context.globalThis=context;vm.createContext(context);vm.runInContext(source,context,{filename:'rc29-rallycross-bundle.js'});const rx=context.__rx;
const tests=[];function ok(name,value,detail=''){tests.push({name,ok:Boolean(value),detail});if(!value)console.error('FAIL',name,detail);else console.log('PASS',name);}
function q(place,round){return {round,heat:1,status:'FIN',place,points:place===1?50:place===2?45:place===3?42:place===4?40:0};}
function pilot(id,name,registrationOrder,qualifying=[]){return {id,name,registrationOrder,qualifying,best3:0,points:0,best3Rounds:[],finalResults:[]};}

// QUALIFICATION: identical BEST-3/countback in different rounds must NOT be separated by recency or registration.
const qa=pilot('A','A',1,[q(1,1),q(2,2),q(3,3),q(4,4)]),qb=pilot('B','B',2,[q(2,1),q(1,2),q(4,3),q(3,4)]);
const qrace={qualifyingCount:4,pilots:[qa,qb],heats:[1,2,3,4].map(n=>({key:`Q${n}`,type:'qualifying',round:n,heat:1,pilots:['A','B'],saved:true,result:[],enabled:false,order:n*100})),finals:[],finalProtocol:[],qualificationRunoffOrder:{},finalRunoffOrder:{},runoffCounter:0,stage:'qualifying'};
qa.qualifying.forEach(()=>{});rx.calculateBest3(qa);rx.calculateBest3(qb);
ok('Qualification exact sport tie detected',rx.comparePilotsWithoutRunoff(qrace,qa,qb)===0);
const qpointsBefore=[qa.points,qb.points],qrecordsBefore=[qa.qualifying.length,qb.qualifying.length];
rx.finalizeQualificationOrCreateRunoffs(qrace);
const qtb=qrace.heats.find(h=>h.tieBreak&&h.tieScope==='qualification');
ok('Qualification run-off created',Boolean(qtb));
ok('Qualification run-off contains tied pilots only',qtb&&qtb.pilots.length===2&&qtb.pilots.includes('A')&&qtb.pilots.includes('B'));
ok('Qualification run-off does not pre-award points',qa.points===qpointsBefore[0]&&qb.points===qpointsBefore[1]);
rx.saveQualificationRunoffEvent(qrace,qtb.key,[{pilotId:'B',status:'FIN',place:1},{pilotId:'A',status:'FIN',place:2}]);
ok('Qualification run-off changes only local order',qrace.pilots[0].id==='B'&&qrace.pilots[1].id==='A');
ok('Qualification run-off adds no qualifying result',qa.qualifying.length===qrecordsBefore[0]&&qb.qualifying.length===qrecordsBefore[1]);
ok('Qualification run-off adds no points',qa.points===qpointsBefore[0]&&qb.points===qpointsBefore[1]);
ok('Finals generated after qualification run-off',qrace.stage==='finals'&&qrace.finals.some(f=>f.type==='main'));

function fin(pilotId,place){return {pilotId,status:'FIN',place};}
function stats(laps,elapsedMs){return {laps,elapsedMs};}
function mainRace(bBestTime=60000,cBestTime=60000,bSecondTime=70000,cSecondTime=70000){
 const A=pilot('A','A',1),B=pilot('B','B',2),C=pilot('C','C',3),D=pilot('D','D',4);B.finalResults=[1,2,3];C.finalResults=[1,2,3];
 const finals=[
  {key:'F-A1',name:'A1',label:'Финал A1',type:'main',order:1000,pilots:['A','B','C','D'],saved:true,enabled:false,result:[fin('A',1),fin('B',2),fin('D',3),fin('C',4)],lapStats:{A:stats(7,55000),B:stats(7,bBestTime),C:stats(7,76000),D:stats(7,68000)}},
  {key:'F-A2',name:'A2',label:'Финал A2',type:'main',order:1001,pilots:['A','B','C','D'],saved:true,enabled:false,result:[fin('A',1),fin('C',2),fin('B',3),fin('D',4)],lapStats:{A:stats(7,54000),B:stats(7,bSecondTime),C:stats(7,cBestTime),D:stats(7,78000)}},
  {key:'F-A3',name:'A3',label:'Финал A3',type:'main',order:1002,pilots:['A','B','C','D'],saved:true,enabled:false,result:[fin('A',1),fin('D',2),fin('C',3),fin('B',4)],lapStats:{A:stats(7,53000),B:stats(7,80000),C:stats(7,cSecondTime),D:stats(7,65000)}}
 ];
 return {pilots:[A,B,C,D],heats:[],finals,finalProtocol:[],qualificationRunoffOrder:{},finalRunoffOrder:{},runoffCounter:0,stage:'finals',lifecycleStatus:'active'};
}

// FINAL: same total, better individual place wins before any run-off.
const placeRace=mainRace();
// Inject D with 1+4 vs B 2+3 through direct standing objects to isolate criterion 2.
const core1={total:5,countedRuns:[{score:1,performance:stats(7,70000)},{score:4,performance:stats(7,80000)}]},core2={total:5,countedRuns:[{score:2,performance:stats(7,50000)},{score:3,performance:stats(7,60000)}]};
ok('Final tie-break criterion 2: best individual place',rx.compareMainStandingsCore(core1,core2)<0);

// FINAL: same 2+3, best-place run performance separates by time.
const perfRace=mainRace(59000,60000,70000,70000);const perfStand=rx.buildMainStandings(perfRace);
ok('Final tie-break criterion 3: best-place laps/time',perfStand.findIndex(x=>x.pilotId==='B')<perfStand.findIndex(x=>x.pilotId==='C'));
const coreSecondA={total:5,countedRuns:[{score:2,performance:stats(7,60000)},{score:3,performance:stats(7,69000)}]},coreSecondB={total:5,countedRuns:[{score:2,performance:stats(7,60000)},{score:3,performance:stats(7,70000)}]};
ok('Final tie-break criterion 4: second counted result laps/time',rx.compareMainStandingsCore(coreSecondA,coreSecondB)<0);
const beforeCount=perfRace.finals.length;rx.buildFinalProtocol(perfRace);ok('No run-off when laps/time resolves final tie',perfRace.stage==='finished'&&perfRace.finals.length===beforeCount);

// FINAL: exact equality after all four criteria creates a run-off, no bonus points.
const frace=mainRace(60000,60000,70000,70000);const proto0=rx.buildFinalProtocol(frace),ftb=frace.finals.find(f=>f.tieBreak&&f.tieScope==='final');
ok('Exact Final A tie creates run-off',Array.isArray(proto0)&&proto0.length===0&&Boolean(ftb)&&frace.stage==='finals');
ok('Final run-off contains tied pilots only',ftb&&ftb.pilots.length===2&&ftb.pilots.includes('B')&&ftb.pilots.includes('C'));
const bLen=frace.pilots.find(p=>p.id==='B').finalResults.length,cLen=frace.pilots.find(p=>p.id==='C').finalResults.length;
rx.saveFinalEvent(frace,ftb.key,[{pilotId:'B',status:'FIN',place:1},{pilotId:'C',status:'FIN',place:2}]);
ok('Final run-off resolves only disputed positions',frace.finalProtocol.slice(0,3).map(x=>x.pilotId).join(',')==='A,B,C');
ok('Final event points awarded only by final protocol',frace.finalProtocol[0].eventPoints===25&&frace.finalProtocol[1].eventPoints===18&&frace.finalProtocol[2].eventPoints===15&&frace.finalProtocol[3].eventPoints===12);
ok('Final run-off adds no final scoring record',frace.pilots.find(p=>p.id==='B').finalResults.length===bLen&&frace.pilots.find(p=>p.id==='C').finalResults.length===cLen);
ok('Final run-off itself has no eventPoints field',!Object.prototype.hasOwnProperty.call(ftb,'eventPoints'));


// USER SCREENSHOT CASE: 2nd-4th all total 5. Win must place Alexey above; only the still-exact 2+3 pair runs off.
const K=pilot('K','КОЧЕТКОВ',1),AX=pilot('AX','АЛФЁРОВ АЛЕКСЕЙ',2),AN=pilot('AN','АЛФЁРОВ АНДРЕЙ',3),IL=pilot('IL','ЖЕЛЕЗНОВ',4);
const screenshotRace={pilots:[K,AX,AN,IL],heats:[],finalProtocol:[],qualificationRunoffOrder:{},finalRunoffOrder:{},runoffCounter:0,stage:'finals',lifecycleStatus:'active',finals:[
 {key:'F-A1',name:'A1',label:'Финал A1',type:'main',order:1000,pilots:['K','AX','AN','IL'],saved:true,enabled:false,result:[fin('K',1),fin('IL',2),fin('AN',3),fin('AX',4)],lapStats:{K:stats(7,50000),IL:stats(7,60000),AN:stats(7,70000),AX:stats(7,80000)}},
 {key:'F-A2',name:'A2',label:'Финал A2',type:'main',order:1001,pilots:['K','AX','AN','IL'],saved:true,enabled:false,result:[fin('K',1),fin('AN',2),fin('IL',3),{pilotId:'AX',status:'DSQ',place:null}],lapStats:{K:stats(7,50000),AN:stats(7,60000),IL:stats(7,70000),AX:stats(0,0)}},
 {key:'F-A3',name:'A3',label:'Финал A3',type:'main',order:1002,pilots:['K','AX','AN','IL'],saved:true,enabled:false,result:[fin('AX',1),fin('K',2),fin('AN',3),fin('IL',4)],lapStats:{AX:stats(7,55000),K:stats(7,56000),AN:stats(7,70000),IL:stats(7,80000)}}
]};
const ss=rx.buildMainStandings(screenshotRace);
ok('Screenshot case: 1+4 beats 2+3 at equal total 5',ss.findIndex(x=>x.pilotId==='AX')<ss.findIndex(x=>x.pilotId==='AN')&&ss.findIndex(x=>x.pilotId==='AX')<ss.findIndex(x=>x.pilotId==='IL'));
rx.buildFinalProtocol(screenshotRace);const ssTb=screenshotRace.finals.find(f=>f.tieBreak&&f.tieScope==='final');
ok('Screenshot case: only still-equal Andrey/Ilya go to run-off',ssTb&&ssTb.pilots.length===2&&ssTb.pilots.includes('AN')&&ssTb.pilots.includes('IL')&&!ssTb.pilots.includes('AX'));


// QUALIFICATION: an exact tie in the middle of the table must not involve pilots above/below it.
const qTop=pilot('QT','TOP',1,[q(1,1),q(1,2),q(1,3),q(2,4)]),qMid1=pilot('QM1','MID1',2,[q(1,1),q(2,2),q(3,3),q(4,4)]),qMid2=pilot('QM2','MID2',3,[q(2,1),q(1,2),q(4,3),q(3,4)]),qLow=pilot('QL','LOW',4,[q(4,1),q(4,2),q(4,3),q(4,4)]);
const qMidRace={qualifyingCount:4,pilots:[qTop,qMid1,qMid2,qLow],heats:[1,2,3,4].map(n=>({key:`QM${n}`,type:'qualifying',round:n,heat:1,pilots:['QT','QM1','QM2','QL'],saved:true,result:[],enabled:false,order:n*100})),finals:[],finalProtocol:[],qualificationRunoffOrder:{},finalRunoffOrder:{},runoffCounter:0,stage:'qualifying'};
qMidRace.pilots.forEach(rx.calculateBest3);rx.finalizeQualificationOrCreateRunoffs(qMidRace);const qMidTb=qMidRace.heats.find(h=>h.tieBreak&&!h.saved);
ok('Qualification middle tie: run-off contains only disputed pilots',qMidTb&&qMidTb.pilots.length===2&&qMidTb.pilots.includes('QM1')&&qMidTb.pilots.includes('QM2')&&!qMidTb.pilots.includes('QT')&&!qMidTb.pilots.includes('QL'));
rx.saveQualificationRunoffEvent(qMidRace,qMidTb.key,[{pilotId:'QM2',status:'FIN',place:1},{pilotId:'QM1',status:'FIN',place:2}]);
ok('Qualification middle tie: only disputed positions change',qMidRace.pilots.map(p=>p.id).join(',')==='QT,QM2,QM1,QL');

// FINAL: three pilots with exactly equal BEST-2 criteria must receive one 3-way run-off.
const TA=pilot('TA','TA',1),TB=pilot('TB','TB',2),TC=pilot('TC','TC',3),TD=pilot('TD','TD',4);
const threeRace={pilots:[TA,TB,TC,TD],heats:[],finalProtocol:[],qualificationRunoffOrder:{},finalRunoffOrder:{},runoffCounter:0,stage:'finals',lifecycleStatus:'active',finals:[
 {key:'T-A1',name:'A1',label:'Финал A1',type:'main',order:1000,pilots:['TA','TB','TC','TD'],saved:true,enabled:false,result:[fin('TA',1),fin('TB',2),fin('TC',3),fin('TD',4)],lapStats:{TA:stats(7,50000),TB:stats(7,60000),TC:stats(7,70000),TD:stats(7,80000)}},
 {key:'T-A2',name:'A2',label:'Финал A2',type:'main',order:1001,pilots:['TA','TB','TC','TD'],saved:true,enabled:false,result:[fin('TA',1),fin('TD',2),fin('TB',3),fin('TC',4)],lapStats:{TA:stats(7,50000),TD:stats(7,60000),TB:stats(7,70000),TC:stats(7,80000)}},
 {key:'T-A3',name:'A3',label:'Финал A3',type:'main',order:1002,pilots:['TA','TB','TC','TD'],saved:true,enabled:false,result:[fin('TA',1),fin('TC',2),fin('TD',3),fin('TB',4)],lapStats:{TA:stats(7,50000),TC:stats(7,60000),TD:stats(7,70000),TB:stats(7,80000)}}
]};
rx.buildFinalProtocol(threeRace);const threeTb=threeRace.finals.find(f=>f.tieBreak&&!f.saved);
ok('Final three-way exact tie creates one 3-pilot run-off',threeTb&&threeTb.pilots.length===3&&['TB','TC','TD'].every(id=>threeTb.pilots.includes(id))&&!threeTb.pilots.includes('TA'));
rx.saveFinalEvent(threeRace,threeTb.key,[{pilotId:'TC',status:'FIN',place:1},{pilotId:'TD',status:'FIN',place:2},{pilotId:'TB',status:'FIN',place:3}]);
ok('Final three-way run-off orders only places 2-4',threeRace.finalProtocol.slice(0,4).map(x=>x.pilotId).join(',')==='TA,TC,TD,TB');
ok('Final three-way run-off adds no bonus points',threeRace.finalProtocol.slice(0,4).map(x=>x.eventPoints).join(',')==='25,18,15,12');

// A run-off that itself ends with an unresolved equal status must NOT fall back to input/registration order.
const qa2=pilot('QA','QA',1,[q(1,1),q(2,2),q(3,3),q(4,4)]),qb2=pilot('QB','QB',2,[q(2,1),q(1,2),q(4,3),q(3,4)]);
const qrace2={qualifyingCount:4,pilots:[qa2,qb2],heats:[1,2,3,4].map(n=>({key:`QX${n}`,type:'qualifying',round:n,heat:1,pilots:['QA','QB'],saved:true,result:[],enabled:false,order:n*100})),finals:[],finalProtocol:[],qualificationRunoffOrder:{},finalRunoffOrder:{},runoffCounter:0,stage:'qualifying'};rx.calculateBest3(qa2);rx.calculateBest3(qb2);rx.finalizeQualificationOrCreateRunoffs(qrace2);const qtb2=qrace2.heats.find(h=>h.tieBreak&&!h.saved);rx.saveQualificationRunoffEvent(qrace2,qtb2.key,[{pilotId:'QA',status:'DNS'},{pilotId:'QB',status:'DNS'}]);const qtb2retry=qrace2.heats.find(h=>h.tieBreak&&!h.saved&&!h.cancelled);
ok('Qualification run-off equal DNS creates another run-off instead of arbitrary order',Boolean(qtb2retry)&&!Number.isInteger(qrace2.qualificationRunoffOrder.QA)&&!Number.isInteger(qrace2.qualificationRunoffOrder.QB));

const frace2=mainRace(60000,60000,70000,70000);rx.buildFinalProtocol(frace2);const ftb2=frace2.finals.find(f=>f.tieBreak&&!f.saved);rx.saveFinalEvent(frace2,ftb2.key,[{pilotId:'B',status:'DNS'},{pilotId:'C',status:'DNS'}]);const ftb2retry=frace2.finals.find(f=>f.tieBreak&&!f.saved&&!f.cancelled);
ok('Final run-off equal DNS creates another run-off instead of qualification fallback',Boolean(ftb2retry)&&frace2.stage==='finals'&&frace2.finalProtocol.length===0);

const modeText=files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
ok('No random draw implementation remains',!modeText.includes('Math.random')&&!modeText.includes('runTieDraw'));
const failed=tests.filter(t=>!t.ok);console.log(`RC29 sport run-off tests: ${tests.length-failed.length}/${tests.length} PASS`);process.exit(failed.length?2:0);
