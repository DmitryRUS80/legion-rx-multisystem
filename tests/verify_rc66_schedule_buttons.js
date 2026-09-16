'use strict';
const fs=require('fs'),vm=require('vm');
const calls=[];
function node(action,extra={}){return {disabled:false,dataset:{classicAction:action,...extra},tagName:'BUTTON',addEventListener:(t,fn)=>calls.push(['bind',action,t,fn])}}
const ctx={console,Promise,setTimeout,clearTimeout,performance:{now:()=>0},
 document:{querySelectorAll:()=>[]}, state:{view:'classicCockpit',pilotDb:[]},
 ClassicRCEngine:{resumeCompetition:t=>{calls.push(['resume',t]);return{ok:true}},pauseCompetition:t=>{calls.push(['pauseCompetition',t]);return{ok:true}},skipScheduleBreak:(id,t)=>{calls.push(['skipBreak',id,t]);return{ok:true}},adjustScheduleBreak:(id,d,t)=>{calls.push(['adjustBreak',id,d,t]);return{ok:true,item:{durationMin:5}}},skipCurrentEvent:t=>{calls.push(['skipHeat',t]);return{ok:true}},get:()=>({directorHold:{active:true}})},
 ClassicRCRuntime:{rawNowEpoch:()=>1234,nowEpoch:()=>2345,session:()=>({phase:'ready'}),beginStart:()=>calls.push(['beginStart']),pause:()=>calls.push(['pauseRace']),stop:()=>calls.push(['stopRace']),finish:()=>calls.push(['finish']),cycleSimulationSpeed:()=>2,dispose:()=>{}},
 confirm:()=>true,toast:x=>calls.push(['toast',x]),render:()=>calls.push(['render']),nav:()=>{},closeModal:()=>calls.push(['closeModal']),$$:()=>[], $:()=>null,
 raceSimulatorModal:()=>{},classicRCOpen:()=>{},classicRCResultModal:()=>{},classicRCSaveResult:()=>{},classicRCResultsModal:()=>{},classicRCHeatSettingsModal:()=>{},classicRCApplyHeatSettings:()=>{},
};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../ui/classic-rc/classic-rc-ui.js','utf8'),ctx);
(async()=>{
 const act=(name,extra={})=>vm.runInContext(`classicRCDispatchAction(${JSON.stringify({disabled:false,dataset:{classicAction:name,...extra}})})`,ctx);
 await act('competition-resume');await act('break-minus',{breakId:'b1'});await act('break-plus-one',{breakId:'b1'});await act('break-plus',{breakId:'b1'});await act('skip-break',{breakId:'b1'});await act('start-early');
 const el=node('schedule');vm.runInContext('classicRCBindActionElement',ctx)(el);
 const click=calls.find(x=>x[0]==='bind'&&x[1]==='schedule'&&x[2]==='click');
 if(!click||!calls.some(x=>x[0]==='resume')||!calls.some(x=>x[0]==='adjustBreak'&&x[2]===-1)||!calls.some(x=>x[0]==='skipBreak')||!calls.some(x=>x[0]==='beginStart')){console.error('FAIL',calls);process.exit(2)}
 console.log('RC66 schedule direct actions: PASS');
})();
