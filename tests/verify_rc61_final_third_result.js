'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..');
const files=['modes/rallycross/rules.js','modes/rallycross/qualifying.js','modes/rallycross/finals.js','modes/rallycross/index.js'];
const src=`function uid(prefix){return prefix+'-rc61';}\n`+files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+`\n;globalThis.__rx={buildMainStandings,buildFinalProtocol};`;
const c={console,globalThis:null};c.globalThis=c;vm.createContext(c);vm.runInContext(src,c);const rx=c.__rx;
function p(id,name,q){return{id,name,registrationOrder:q,qualifying:[],best3:0,points:0,best3Rounds:[],finalResults:[]};}
function fin61(pilotId,place){return{pilotId,status:'FIN',place};}
const K=p('K','КОЧЕТКОВ',4),A=p('A','АЛФЁРОВ АНДРЕЙ',2),I=p('I','ЖЕЛЕЗНОВ ИЛЬЯ',1),X=p('X','ЧЕТВЁРТЫЙ',3);
const race={pilots:[K,A,I,X],heats:[],finalProtocol:[],qualificationRunoffOrder:{},finalRunoffOrder:{},runoffCounter:0,stage:'finals',lifecycleStatus:'active',finals:[
 {key:'A1',name:'A1',label:'A1',type:'main',order:1,pilots:['K','A','I','X'],saved:true,enabled:false,result:[fin61('A',1),fin61('I',2),fin61('K',3),fin61('X',4)]},
 {key:'A2',name:'A2',label:'A2',type:'main',order:2,pilots:['K','A','I','X'],saved:true,enabled:false,result:[fin61('K',1),fin61('A',2),fin61('X',3),fin61('I',4)]},
 {key:'A3',name:'A3',label:'A3',type:'main',order:3,pilots:['K','A','I','X'],saved:true,enabled:false,result:[fin61('I',1),fin61('K',2),fin61('X',3),fin61('A',4)]}
]};
const rows=rx.buildMainStandings(race);
const rk=rows.find(r=>r.pilotId==='K'),ra=rows.find(r=>r.pilotId==='A'),ri=rows.find(r=>r.pilotId==='I');
assert.equal(rk.total,3);assert.equal(ra.total,3);assert.equal(ri.total,3);
assert.equal(rk.thirdResult,3);assert.equal(ra.thirdResult,4);assert.equal(ri.thirdResult,4);
assert(rows.findIndex(r=>r.pilotId==='K')<rows.findIndex(r=>r.pilotId==='A'),'third result must place K above A');
assert(rows.findIndex(r=>r.pilotId==='K')<rows.findIndex(r=>r.pilotId==='I'),'third result must place K above I');
const protocol=rx.buildFinalProtocol(race);assert.equal(protocol.length,0,'absolute remaining tie must wait for run-off');
const tb=race.finals.find(f=>f.tieBreak&&!f.saved);assert(tb,'run-off missing');assert.deepEqual([...tb.pilots].sort(),['A','I']);
console.log('rc61 final third-result tiebreak: PASS');
