'use strict';
const fs=require('fs'),vm=require('vm');
const calls=[];
const ctx={console,Promise,setTimeout,clearTimeout,performance:{now:()=>0},
  document:{addEventListener:(type,fn,capture)=>calls.push(['listener',type,Boolean(capture)])},
  state:{view:'classicCockpit',pilotDb:[]},
  ClassicRCEngine:{
    resumeCompetition:(t)=>{calls.push(['resume',t]);return{ok:true}},
    pauseCompetition:(t)=>{calls.push(['pauseCompetition',t]);return{ok:true}},
    skipScheduleBreak:(id,t)=>{calls.push(['skipBreak',id,t]);return{ok:true}},
    adjustScheduleBreak:(id,d,t)=>{calls.push(['adjustBreak',id,d,t]);return{ok:true}},
    skipCurrentEvent:(t)=>{calls.push(['skipHeat',t]);return{ok:true}},
    get:()=>({directorHold:{active:true}}),
  },
  ClassicRCRuntime:{
    rawNowEpoch:()=>1234,nowEpoch:()=>2345,session:()=>({phase:'ready'}),beginStart:()=>calls.push(['beginStart']),
    pause:()=>calls.push(['pauseRace']),stop:()=>calls.push(['stopRace']),finish:()=>calls.push(['finish']),
    cycleSimulationSpeed:()=>2,dispose:()=>{},
  },
  confirm:()=>true,toast:(x)=>calls.push(['toast',x]),render:()=>calls.push(['render']),nav:()=>{},closeModal:()=>calls.push(['closeModal']),
  $$:()=>[], $:()=>null, raceSimulatorModal:()=>{}, classicRCOpen:()=>{}, classicRCResultModal:()=>{},classicRCSaveResult:()=>{},classicRCResultsModal:()=>{},classicRCHeatSettingsModal:()=>{},classicRCApplyHeatSettings:()=>{},
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/../ui/classic-rc/classic-rc-ui.js','utf8'),ctx,{filename:'classic-rc-ui.js'});
(async()=>{
  const act=(name,extra={})=>vm.runInContext(`classicRCDispatchAction(${JSON.stringify({disabled:false,dataset:{classicAction:name,...extra}})})`,ctx);
  await act('competition-resume');
  await act('break-minus',{breakId:'b1'});
  await act('break-plus-one',{breakId:'b1'});
  await act('break-plus',{breakId:'b1'});
  await act('skip-break',{breakId:'b1'});
  await act('start-early');
  await act('schedule-close');
  vm.runInContext('classicRCEnsureDelegatedBindings()',ctx);
  const req=[
    calls.some(x=>x[0]==='resume'),
    calls.some(x=>x[0]==='adjustBreak'&&x[2]===-1),
    calls.some(x=>x[0]==='adjustBreak'&&x[2]===1),
    calls.some(x=>x[0]==='adjustBreak'&&x[2]===5),
    calls.some(x=>x[0]==='skipBreak'),
    calls.some(x=>x[0]==='beginStart'),
    calls.some(x=>x[0]==='listener'&&x[1]==='click'&&x[2]===true),
  ];
  if(req.some(x=>!x)){console.error('FAIL',calls);process.exit(1)}
  console.log('RC65 schedule button delegation: PASS');
})();
