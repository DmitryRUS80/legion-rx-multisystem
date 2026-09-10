'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const files=['modes/rallycross/rules.js','modes/rallycross/qualifying.js','modes/rallycross/finals.js','modes/rallycross/index.js','modes/rallycross/audio-actions.js','modes/rallycross/runtime.js'];
const source=`function uid(prefix){return prefix+'-test';}\nfunction pilotProfileId(p){return p?.profileId||p?.id||'';}\n`+files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+`\n;globalThis.__rx30={getEventStartPilots,liveRanking,blankLive,announceStartCall};`;
const voiceLog=[];const context={console,performance:{now:()=>0},state:{settings:{announcerEnabled:true,voiceStartCall:true,pilotVoiceEnabled:true},race:null},announcer:{play:async key=>{voiceLog.push('SYS:'+key);return true;}},pilotVoices:{play:async id=>{voiceLog.push('P:'+id);return true;}},globalThis:null};context.globalThis=context;vm.createContext(context);vm.runInContext(source,context,{filename:'rc30-start-order-bundle.js'});const rx=context.__rx30;
const tests=[];function ok(name,value,detail=''){tests.push({name,ok:Boolean(value),detail});console.log(`${value?'PASS':'FAIL'} ${name}${detail?` · ${detail}`:''}`);}
function makeTestPilot(id,registrationOrder){return{id,name:id,registrationOrder,qualifying:[],best3:0,points:0,best3Rounds:[],finalResults:[]};}
const A=makeTestPilot('A',1),B=makeTestPilot('B',2),C=makeTestPilot('C',3),D=makeTestPilot('D',4);
// race.pilots is the current qualification rating order: B, D, A, C.
const race={pilots:[B,D,A,C],heats:[],finals:[]};
const qualifying={key:'Q1-H1',type:'qualifying',pilots:['C','A','D','B']};
const qOrder=rx.getEventStartPilots(race,qualifying).map(p=>p.id);
ok('Qualification start order preserves sport-generated heat order',qOrder.join(',')==='C,A,D,B',qOrder.join(','));
const final={key:'F-A1',type:'main',pilots:['C','A','B','D']};
const fOrder=rx.getEventStartPilots(race,final).map(p=>p.id);
ok('Final start order follows qualification rating',fOrder.join(',')==='B,D,A,C',fOrder.join(','));
const session={live:Object.fromEntries(fOrder.map(id=>[id,rx.blankLive()]))};
const initial=rx.liveRanking(rx.getEventStartPilots(race,final),session).map(p=>p.id);
ok('Cockpit zero-lap order preserves official start grid',initial.join(',')===fOrder.join(','),initial.join(','));
session.live.C.laps=2;session.live.C.elapsedMs=40000;session.live.B.laps=1;session.live.B.elapsedMs=21000;
const live=rx.liveRanking(rx.getEventStartPilots(race,final),session).map(p=>p.id);
ok('Live ranking still overrides start grid once race data differs',live[0]==='C',live.join(','));
const audio=fs.readFileSync(path.join(ROOT,'modes/rallycross/audio-actions.js'),'utf8');
ok('Start-call announcer consumes the same authoritative start order',/announceStartCall\(ev\).*?getEventStartPilots\(state\.race,ev\)/s.test(audio) && !/announceStartCall\(ev\).*?qualificationRankMap/s.test(audio));
const discipline=fs.readFileSync(path.join(ROOT,'ui/discipline-ui.js'),'utf8'),views=fs.readFileSync(path.join(ROOT,'ui/shell/views.js'),'utf8');
ok('RallyCross cockpit consumes public startPilots adapter',discipline.includes('liveRanking(RallyCrossModeAPI.startPilots(race,ev),s)'));
ok('Manual RallyCross pickers use the same live/start ordering',views.includes('liveRanking(RallyCrossModeAPI.startPilots(state.race,ev),s)'));
const css=fs.readFileSync(path.join(ROOT,'ui/pilots/pilot-cards.css'),'utf8');
function rule(sel){const esc=sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return css.match(new RegExp(esc+'\\{([^}]*)\\}'))?.[1]||'';}
for(const [name,sel] of [['Pilot card','.pilotSelectCard.hasSelection'],['Picker model','.pilotPickerModelChip.selected'],['Shared model tile','.pilotModelTile.selected']]){
 const body=rule(sel);ok(`${name} selection is thin neutral outline`,body.includes('inset 0 0 0 1px')&&body.includes('0 0 5px')&&!body.includes('var(--v4-cobalt)')&&!body.includes('transform:')&&!body.includes('background:'));
}
(async()=>{
 context.state.race=race;voiceLog.length=0;await rx.announceStartCall(qualifying);
 const qSpoken=voiceLog.filter(x=>x.startsWith('P:')).map(x=>x.slice(2));
 ok('Qualification announcer speaks cockpit/start order 1→N',qSpoken.join(',')===qOrder.join(','),qSpoken.join(','));
 voiceLog.length=0;await rx.announceStartCall(final);
 const fSpoken=voiceLog.filter(x=>x.startsWith('P:')).map(x=>x.slice(2));
 ok('Final announcer speaks qualification-rated cockpit/start order 1→N',fSpoken.join(',')===fOrder.join(','),fSpoken.join(','));
 const failed=tests.filter(t=>!t.ok);console.log(`RC30 start-order/selection tests: ${tests.length-failed.length}/${tests.length} PASS`);process.exit(failed.length?2:0);
})().catch(error=>{console.error(error);process.exit(2);});
