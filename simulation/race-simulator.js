'use strict';
/* LEGION RX · isolated race input simulator
   Generates virtual pass/status events only. It does not calculate sport results,
   positions, points, finals or RallyCross progression. */
class LegionRaceSimulator extends EventTarget{
  constructor(){
    super();
    this.enabled=false;
    this.running=false;
    this.paused=false;
    this.timer=null;
    this.warmupTimers=[];
    this.context=null;
    this.plans=[];
    this.config={mode:'normal',speed:4,lapMinSec:8,lapMaxSec:15};
  }
  normalizeConfig(input={}){
    const allowedMode=new Set(['normal','positions','dense']);
    const allowedSpeed=new Set([1,2,4,8]);
    let min=Math.max(3,Math.min(120,Number(input.lapMinSec??this.config.lapMinSec)||8));
    let max=Math.max(3,Math.min(120,Number(input.lapMaxSec??this.config.lapMaxSec)||15));
    if(max<min)[min,max]=[max,min];
    return{mode:allowedMode.has(input.mode)?input.mode:'normal',speed:allowedSpeed.has(Number(input.speed))?Number(input.speed):4,lapMinSec:min,lapMaxSec:max};
  }
  configure(input={}){this.config=this.normalizeConfig(input);if(this.running&&!this.paused&&this.context){if(this.timer){clearTimeout(this.timer);this.timer=null;}this.schedule();}this.emitStatus();return{...this.config};}
  enable(input={}){this.configure(input);this.enabled=true;this.emitStatus();return{...this.config};}
  disable(){this.stopSession();this.clearWarmup();this.enabled=false;this.emitStatus();}
  getScale(){return this.enabled?this.config.speed:1;}
  isEnabled(){return Boolean(this.enabled);}
  getConfig(){return{...this.config};}
  clearWarmup(){this.warmupTimers.forEach(clearTimeout);this.warmupTimers=[];}
  startWarmup({pilots=[],onPass}={}){
    this.clearWarmup();
    if(!this.enabled||typeof onPass!=='function')return;
    const scale=this.getScale();
    (pilots||[]).forEach((p,i)=>{
      const virtualDelay=1200+i*420+Math.random()*7000;
      const t=setTimeout(()=>{if(this.enabled)onPass(p);},Math.max(20,virtualDelay/scale));
      this.warmupTimers.push(t);
    });
  }
  paceForIndex(i,count){
    const {mode,lapMinSec:min,lapMaxSec:max}=this.config,span=Math.max(.4,max-min),mid=(min+max)/2;
    if(mode==='normal')return min+Math.random()*span;
    if(mode==='positions'){
      const rankFactor=count>1?i/(count-1):0;
      return Math.max(min,Math.min(max,mid-span*.22+rankFactor*span*.44+(Math.random()-.5)*span*.10));
    }
    const denseCount=Math.min(count,Math.max(7,Math.min(10,count)));
    if(i<denseCount){
      const center=min+span*.38;
      return Math.max(min,Math.min(max,center+(Math.random()-.5)*Math.max(.35,span*.06)));
    }
    const tailFactor=(i-denseCount+1)/Math.max(1,count-denseCount+1);
    return Math.max(min,Math.min(max,min+span*(.48+tailFactor*.48)+(Math.random()-.5)*span*.08));
  }
  incidentProfile(count){
    const m=this.config.mode;
    const dnsChance=m==='normal'?.025:m==='positions'?.045:.065;
    const dnfChance=m==='normal'?.035:m==='positions'?.055:.075;
    const maxDns=count>=8?2:1,maxDnf=count>=8?2:1;
    return{dnsChance,dnfChance,maxDns,maxDnf};
  }
  makePlans(pilots){
    const count=pilots.length,incident=this.incidentProfile(count);let dnsUsed=0,dnfUsed=0;
    return pilots.map((pilot,i)=>{
      const dns=dnsUsed<incident.maxDns&&Math.random()<incident.dnsChance;if(dns)dnsUsed++;
      const dnf=!dns&&dnfUsed<incident.maxDnf&&Math.random()<incident.dnfChance;if(dnf)dnfUsed++;
      const baseSec=this.paceForIndex(i,count);
      return{pilot,index:i,baseMs:baseSec*1000,dns,dnfAtLap:dnf?1+Math.floor(Math.random()*4):null,started:false,lapIndex:0,done:false,statusReported:false,nextVirtualMs:180+i*85+Math.random()*520};
    });
  }
  nextLapMs(plan){
    const mode=this.config.mode;
    const jitter=mode==='dense'?.055:mode==='positions'?.075:.11;
    const swing=mode==='dense'?Math.sin((plan.lapIndex+1)*1.7+plan.index)*.035:mode==='positions'?Math.sin((plan.lapIndex+1)*1.25+plan.index)*.045:0;
    const random=(Math.random()*2-1)*jitter;
    const ms=plan.baseMs*(1+swing+random);
    return Math.max(this.config.lapMinSec*1000,Math.min(this.config.lapMaxSec*1000,ms));
  }
  startSession(context={}){
    this.stopSession();this.clearWarmup();
    if(!this.enabled)return false;
    this.context=context;this.plans=this.makePlans(context.pilots||[]);this.running=true;this.paused=false;
    this.dispatchEvent(new CustomEvent('sessionstart',{detail:{config:this.getConfig(),pilots:this.plans.length}}));
    this.schedule();return true;
  }
  pauseSession(){if(!this.running||this.paused)return;this.paused=true;if(this.timer){clearTimeout(this.timer);this.timer=null;}}
  resumeSession(){if(!this.running||!this.paused)return;this.paused=false;this.schedule();}
  stopSession(){if(this.timer){clearTimeout(this.timer);this.timer=null;}this.running=false;this.paused=false;this.context=null;this.plans=[];}
  schedule(){
    if(!this.running||this.paused||!this.context)return;
    const pending=this.plans.filter(p=>!p.done).sort((a,b)=>a.nextVirtualMs-b.nextVirtualMs);
    if(!pending.length){this.complete();return;}
    const plan=pending[0],elapsed=Math.max(0,Number(this.context.getElapsed?.())||0),delayVirtual=Math.max(0,plan.nextVirtualMs-elapsed);
    this.timer=setTimeout(()=>{this.timer=null;this.fire(plan);},Math.max(12,delayVirtual/this.getScale()));
  }
  fire(plan){
    if(!this.running||this.paused||!this.context||plan.done)return;
    if(plan.dns){
      plan.done=true;plan.statusReported=true;this.context.onStatus?.(plan.pilot,'DNS');this.afterEvent();return;
    }
    if(!plan.started){
      plan.started=true;this.context.onPass?.(plan.pilot);if(!this.running||!this.context)return;plan.nextVirtualMs+=this.nextLapMs(plan);this.afterEvent();return;
    }
    this.context.onPass?.(plan.pilot);if(!this.running||!this.context)return;plan.lapIndex++;
    const live=this.context.getLive?.(plan.pilot.id);
    if(live?.finished){plan.done=true;this.afterEvent();return;}
    if(plan.dnfAtLap&&plan.lapIndex>=plan.dnfAtLap){plan.done=true;plan.statusReported=true;this.context.onStatus?.(plan.pilot,'DNF');this.afterEvent();return;}
    plan.nextVirtualMs+=this.nextLapMs(plan);this.afterEvent();
  }
  afterEvent(){
    if(!this.running)return;
    const active=this.plans.filter(p=>!p.done);
    if(!active.length){this.complete();return;}
    this.context.onTick?.();this.schedule();
  }
  complete(){
    if(!this.running)return;this.running=false;if(this.timer){clearTimeout(this.timer);this.timer=null;}
    const ctx=this.context;this.context=null;ctx?.onComplete?.();this.dispatchEvent(new CustomEvent('sessioncomplete'));
  }
  emitStatus(){this.dispatchEvent(new CustomEvent('status',{detail:{enabled:this.enabled,running:this.running,config:this.getConfig()}}));}
}
const raceSimulator=new LegionRaceSimulator();

/* Removable registration layer. RallyCross runtime never references raceSimulator directly. */
if(typeof raceTestSourceAdapter!=='undefined'){
  raceTestSourceAdapter.register({
    id:'SIMULATOR',
    isEnabled:()=>raceSimulator.isEnabled(),
    isRunning:()=>raceSimulator.running,
    getScale:()=>raceSimulator.getScale(),
    label:()=>`SIM ×${raceSimulator.getScale()}`,
    startWarmup:ctx=>{raceSimulator.startWarmup(ctx);return true;},
    clearWarmup:()=>raceSimulator.clearWarmup(),
    startSession:ctx=>raceSimulator.startSession(ctx),
    pauseSession:()=>raceSimulator.pauseSession(),
    resumeSession:()=>raceSimulator.resumeSession(),
    stopSession:()=>raceSimulator.stopSession(),
    disable:()=>raceSimulator.disable()
  });
}
