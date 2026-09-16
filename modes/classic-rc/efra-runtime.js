'use strict';
/* LEGION RX · CLASSIC RC EFRA runtime. Independent Classic RC runtime. */
const ClassicRCRuntime=(()=>{
  let ticker=null,countdownTimer=null;
  const blank=()=>({laps:0,lapTimes:[],bestLapMs:Infinity,lastLapMs:null,lastPassPerf:null,lastElapsedAtPass:null,lastDeviceMs:null,started:false,startElapsedMs:null,elapsedMs:0,timeMs:0,finished:false,finishedAt:null,status:'READY'});
  const formatLapMs=ms=>{const n=Number(ms);if(!Number.isFinite(n)||n<0)return'—';const sec=n/1000;return sec<60?sec.toFixed(3):`${Math.floor(sec/60)}:${(sec%60).toFixed(3).padStart(6,'0')}`;};
  function event(){return ClassicRCEngine.currentEvent();}
  function competition(){return ClassicRCEngine.get();}
  function session(){return competition()?.session||null;}
  function active(){return Boolean(competition()&&event());}
  function elapsed(s=session()){if(!s)return 0;if(Number.isFinite(s.elapsedFinalMs))return s.elapsedFinalMs;const base=Number(s.elapsedBeforePause)||0;if(s.phase==='paused'||!s.startedAtPerf)return base;return base+(performance.now()-s.startedAtPerf);}
  function ensureSession(){const c=competition(),ev=event();if(!c||!ev)return null;if(!c.session||c.session.eventKey!==ev.key)c.session={eventKey:ev.key,phase:'ready',startedAtPerf:null,startedAtEpoch:null,elapsedBeforePause:0,elapsedFinalMs:null,countdownLeft:10,live:Object.fromEntries(ev.pilots.map(id=>[id,blank()])),lastPass:'',finishReason:'',timeExpired:false};return c.session;}
  function pilots(){const ev=event();return ev?ClassicRCEngine.pilots(ClassicRCEngine.startPilots(ev)):[];}
  function liveRanking(){const ps=pilots(),s=session();if(!s)return ps;const order=new Map(ps.map((p,i)=>[String(p.id),i]));return [...ps].sort((a,b)=>{const A=s.live[a.id]||blank(),B=s.live[b.id]||blank();if(B.laps!==A.laps)return B.laps-A.laps;if(A.finished!==B.finished)return A.finished?-1:1;const ta=A.timeMs||A.elapsedMs||Infinity,tb=B.timeMs||B.elapsedMs||Infinity;if(ta!==tb)return ta-tb;return(order.get(String(a.id))||0)-(order.get(String(b.id))||0);});}
  function startTicker(){stopTicker();ticker=setInterval(()=>{if(!active())return;checkLimit();if(typeof classicRCUpdateDynamic==='function')classicRCUpdateDynamic();},120);}
  function stopTicker(){if(ticker){clearInterval(ticker);ticker=null;}}
  function stopCountdown(){if(countdownTimer){clearInterval(countdownTimer);countdownTimer=null;}}
  function durationMs(){const ev=event();return Math.max(1,Number(ev?.durationMin||ClassicRCEngine.category().raceMinutes))*60000;}
  async function beginStart(){const c=competition(),ev=event(),s=ensureSession();if(!c||!ev||s.phase!=='ready')return;
    const delay=ev.stage==='final'?(1000+Math.floor(Math.random()*4001)):0,anticipated=Date.now()+10000+delay,check=ClassicRCEngine.canStartScheduleHeat(ev.key,anticipated);
    if(!check.ok&&check.earliestEpoch)return toast(`Рано: старт не раньше ${CompetitionScheduler.formatTime(check.earliestEpoch)}`);if(!check.ok)return toast(check.error||'Не удалось запустить заезд');
    s.phase='countdown';s.countdownLeft=10;s.startDelayMs=delay;ClassicRCEngine.persist();render();stopCountdown();countdownTimer=setInterval(()=>{if(!session()||session()!==s)return stopCountdown();s.countdownLeft--;if(typeof classicRCUpdateDynamic==='function')classicRCUpdateDynamic();if(s.countdownLeft<=0){stopCountdown();setTimeout(()=>{if(session()===s&&s.phase==='countdown')startNow();},Number(s.startDelayMs)||0);}},1000);}
  async function startNow(){const c=competition(),ev=event(),s=ensureSession();if(!c||!ev||s.phase!=='countdown')return;
    const now=Date.now(),check=ClassicRCEngine.canStartScheduleHeat(ev.key,now);
    if(!check.ok&&check.earliestEpoch&&check.earliestEpoch>now){const wait=Math.min(60000,Math.max(20,check.earliestEpoch-now+20));s.lastPass=`ОЖИДАНИЕ СТАРТА · ${CompetitionScheduler.formatTime(check.earliestEpoch)}`;ClassicRCEngine.persist();return setTimeout(()=>{if(session()===s&&s.phase==='countdown')startNow();},wait);}
    if(!check.ok){s.phase='ready';ClassicRCEngine.persist();toast(check.error||'Не удалось запустить заезд');return render();}
    let lapwizStarted=false;try{if(lapwiz.connected&&!lapwiz.running){await lapwiz.start({mode:'race',limitType:'time',durationMin:Math.max(1,Number(ev.durationMin)||5),targetLaps:0,minLapSec:Number(c.settings.minLapSec)||2});lapwizStarted=true;}}catch(e){toast(`LapWiz START: ${e.message}`);s.phase='ready';ClassicRCEngine.persist();return render();}
    const sch=ClassicRCEngine.startScheduleHeat(ev.key,Date.now());if(!sch.ok){if(lapwizStarted&&lapwiz.running){try{await lapwiz.stop();}catch{}}s.phase='ready';ClassicRCEngine.persist();toast(sch.error||'Не удалось зафиксировать старт');return render();}
    s.phase='running';s.startedAtPerf=performance.now();s.startedAtEpoch=sch.item?.actualStartEpoch||Date.now();s.elapsedBeforePause=0;s.elapsedFinalMs=null;s.timeExpired=false;s.startDelayMs=0;Object.keys(s.live).forEach(id=>s.live[id]=blank());s.lastPass=ev.stage==='qualifying'?'STAGGERED START · ожидаем стартовые пересечения':'СТАРТ';try{announcer.play('startRace',{wait:false,force:true});}catch{}ClassicRCEngine.persist();startTicker();render();}
  async function pause(){const s=session();if(!s)return;if(s.phase==='paused')return resume();if(!['running','finishing'].includes(s.phase))return;s.elapsedBeforePause=elapsed(s);s.startedAtPerf=null;s.resumePhase=s.phase;s.phase='paused';if(lapwiz.connected&&lapwiz.running){try{await lapwiz.stop();}catch{}}ClassicRCEngine.persist();render();}
  async function resume(){const s=session(),ev=event();if(!s||s.phase!=='paused'||!ev)return;try{if(lapwiz.connected&&!lapwiz.running)await lapwiz.start({mode:'race',limitType:'time',durationMin:Math.max(1/60,(durationMs()-s.elapsedBeforePause)/60000),targetLaps:0,minLapSec:Number(competition().settings.minLapSec)||2});}catch(e){return toast(`LapWiz RESUME: ${e.message}`);}s.phase=s.resumePhase||'running';s.startedAtPerf=performance.now();Object.values(s.live).forEach(l=>{l.lastPassPerf=null;l.lastDeviceMs=null;});ClassicRCEngine.persist();startTicker();render();}
  async function finish(reason='Финиш судьёй'){const s=session();if(!s)return;stopCountdown();stopTicker();if(lapwiz.connected&&lapwiz.running){try{await lapwiz.stop();}catch{}}s.elapsedFinalMs=elapsed(s);s.phase='finished';s.finishReason=reason;Object.values(s.live).forEach(l=>{if(l.started&&!l.finished){l.timeMs=l.timeMs||l.elapsedMs||s.elapsedFinalMs;l.finished=true;l.status='FIN';}else if(!l.started)l.status='DNS';});ClassicRCEngine.persist();render();}
  async function stop(){const s=session();if(!s)return;if(s.phase==='countdown'){stopCountdown();s.phase='ready';ClassicRCEngine.persist();return render();}return finish('STOP');}
  function checkLimit(){const ev=event(),s=session();if(!ev||!s||s.phase!=='running')return;const now=elapsed(s),limit=durationMs();if(ev.stage==='qualifying'){
      const all=Object.values(s.live).every(l=>l.finished||(!l.started&&now>limit+60000));if(all&&now>limit)return finish('Квалификация завершена');
    }else if(['seeding','controlled','finalPractice'].includes(ev.stage)){
      if(now>=limit)return finish('Время практики истекло');
    }else if(ev.stage==='final'&&now>=limit&&!s.timeExpired){s.timeExpired=true;s.phase='finishing';s.lastPass='ВРЕМЯ ИСТЕКЛО · ФИНИШ ТЕКУЩЕГО КРУГА';}
  }
  function lapTime(l,elapsedNow,deviceMs,source,firstAsLap){
    if(firstAsLap&&!l.started)return elapsedNow;
    if(Number.isFinite(deviceMs)&&source==='LAPWIZ'&&Number.isFinite(l.lastDeviceMs)&&deviceMs>l.lastDeviceMs)return deviceMs-l.lastDeviceMs;
    if(Number.isFinite(l.lastElapsedAtPass))return Math.max(0,elapsedNow-l.lastElapsedAtPass);
    return null;
  }
  function processPass(detail={}){const c=competition(),ev=event(),s=session();if(!c||!ev||!s||!['running','finishing'].includes(s.phase))return false;const p=pilots().find(x=>String(x.transponder)===String(detail.transponder)||String(x.id)===String(detail.pilotId));if(!p)return false;const l=s.live[p.id]||blank(),now=performance.now(),e=elapsed(s),source=detail.source||'EXTERNAL',deviceMs=Number.isFinite(detail.deviceMs)?detail.deviceMs:null;
    const rollingStart=['seeding','controlled','finalPractice','qualifying'].includes(ev.stage);
    if(rollingStart&&!l.started){l.started=true;l.startElapsedMs=e;l.lastElapsedAtPass=e;l.lastPassPerf=now;l.lastDeviceMs=deviceMs;l.elapsedMs=0;l.timeMs=0;l.status='RACING';s.live[p.id]=l;s.lastPass=`${p.name} · START`;ClassicRCEngine.persist();return true;}
    const firstAsLap=!rollingStart;const lm=lapTime(l,e,deviceMs,source,firstAsLap);if(!l.started){l.started=true;l.startElapsedMs=0;}if(Number.isFinite(lm)&&lm>=Math.max(250,Number(c.settings.minLapSec||2)*1000)){l.lapTimes.push(lm);l.laps=l.lapTimes.length;l.lastLapMs=lm;l.bestLapMs=Math.min(l.bestLapMs,lm);}l.lastPassPerf=now;l.lastElapsedAtPass=e;l.lastDeviceMs=deviceMs;l.elapsedMs=e;l.timeMs=rollingStart?Math.max(0,e-Number(l.startElapsedMs||0)):e;l.status='RACING';
    if(ev.stage==='qualifying'&&l.started&&l.timeMs>=durationMs()){l.finished=true;l.finishedAt=e;l.status='FIN';}
    if(ev.stage==='final'&&s.phase==='finishing'){l.finished=true;l.finishedAt=e;l.status='FIN';}
    s.live[p.id]=l;s.lastPass=`${p.name} · ${l.laps} · ${Number.isFinite(lm)?formatLapMs(lm):'—'}`;ClassicRCEngine.persist();if(ev.stage==='final'&&Object.values(s.live).every(x=>x.finished||!x.started)&&s.phase==='finishing')finish('Все пилоты финишировали');return true;}
  function suggestedResult(){
    const ev=event(),s=session();if(!ev||!s)return[];const rank=liveRanking();let prevPerf=null,prevPlace=0;
    return rank.map((p,i)=>{const l=s.live[p.id]||blank(),started=Boolean(l.started),status=started?'FIN':'DNS',perf={laps:Number(l.laps)||0,timeMs:Number(l.timeMs||l.elapsedMs)||0};let place=null;
      if(status==='FIN'){place=prevPerf&&classicRCCompareLapsTime(perf,prevPerf)===0?prevPlace:i+1;prevPerf=perf;prevPlace=place;}
      return{pilotId:p.id,status,place,laps:perf.laps,timeMs:perf.timeMs,carNumber:(ev.pilots.indexOf(p.id)+1)};
    });
  }
  function saveResult(result){const ev=event(),s=session();if(!ev||!s||s.phase!=='finished')throw new Error('Сначала завершите заезд');ClassicRCEngine.saveHeat(ev.key,result,s);competition().session=null;ClassicRCEngine.persist();render();}
  function restart(){const c=competition(),ev=event();if(!c||!ev)return;c.session=null;const tl=c.timeline?.items?.find(x=>x.eventKey===ev.key);if(tl){tl.status='pending';tl.actualStartEpoch=null;tl.actualEndEpoch=null;}ev.status='pending';ClassicRCEngine.persist();render();}
  function timerValue(){const ev=event(),s=session();if(!ev||!s)return'00:00';if(s.phase==='countdown')return`00:${String(Math.max(0,s.countdownLeft)).padStart(2,'0')}`;const rem=Math.max(0,durationMs()-elapsed(s));return fmtClock(rem);}
  function dispose(){stopTicker();stopCountdown();}
  return Object.freeze({active,event,competition,session,ensureSession,pilots,liveRanking,elapsed,beginStart,startNow,pause,resume,finish,stop,restart,processPass,suggestedResult,saveResult,timerValue,checkLimit,startTicker,stopTicker,dispose,blank});
})();
