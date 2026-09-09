const fs=require('fs'),vm=require('vm');
class LS{
  constructor(limit=7000){this.limit=limit;this.m=new Map();}
  getItem(k){return this.m.has(k)?this.m.get(k):null;}
  setItem(k,v){v=String(v);let total=v.length;for(const [kk,vv] of this.m)if(kk!==k)total+=vv.length;if(total>this.limit){const e=new Error('quota');e.name='QuotaExceededError';e.code=22;throw e;}this.m.set(k,v);}
  removeItem(k){this.m.delete(k);}
}
const testClone=v=>JSON.parse(JSON.stringify(v));
const localStorage=new LS(7000),photo='data:image/webp;base64,'+'X'.repeat(2600);
// Legacy fat archive is injected directly to simulate an iPhone already close to quota.
localStorage.m.set('legionrx4_archive',JSON.stringify([{id:'old',pilots:[{id:'p1',profileId:'p1',name:'ONE',photo},{id:'p2',profileId:'p2',name:'TWO',photo}],heats:[],finals:[]}]))
const ctx={localStorage,deepClone:testClone,console};vm.createContext(ctx);
const code=fs.readFileSync(require('path').join(__dirname,'../platform/storage.js'),'utf8')+'\n;globalThis.T={KEYS,save,compactRaceForStorage,compactLegacyStorage};';vm.runInContext(code,ctx);
const legacy=localStorage.getItem('legionrx4_archive');
if(legacy.includes('data:image/'))throw new Error('legacy archive still contains embedded pilot photos');
const race={id:'r2',pilots:[{id:'p1',profileId:'p1',name:'ONE',photo},{id:'p2',profileId:'p2',name:'TWO',photo}],heats:[{saved:true,result:[{pilotId:'p1',place:1}]}],finals:[]};
ctx.T.save(ctx.T.KEYS.archive,[race]);
const stored=localStorage.getItem(ctx.T.KEYS.archive);
if(stored.includes('data:image/'))throw new Error('new archive still contains embedded pilot photos');
const parsed=JSON.parse(stored);if(parsed[0].pilots[0].name!=='ONE'||parsed[0].pilots[0].profileId!=='p1')throw new Error('archive identity/result data was damaged');
console.log('storage_quota_compaction_behavior: PASS');

// Full completion path: a completed race with embedded avatars must archive and clear without QuotaExceededError.
{
  const ls2=new LS(7200),big='data:image/webp;base64,'+'Y'.repeat(2700);
  ls2.m.set('legionrx4_archive',JSON.stringify([{id:'legacy',pilots:[{id:'a',profileId:'a',name:'A',photo:big},{id:'b',profileId:'b',name:'B',photo:big}],heats:[],finals:[]}]))
  const ctx2={localStorage:ls2,console,confirm:()=>true,AppBridge:{updateHeader(){}},toast(){},nav(v){ctx2.__nav=v;},syncChampionshipIfFinished(){},state:{race:{id:'finish',stage:'finished',lifecycleStatus:'completed',completedAt:null,pilots:[{id:'a',profileId:'a',name:'A',photo:big}],heats:[],finals:[]},archive:[],session:{phase:'finished'},championships:[]}};
  vm.createContext(ctx2);
  const src='const deepClone=v=>JSON.parse(JSON.stringify(v));\n'+fs.readFileSync(require('path').join(__dirname,'../platform/storage.js'),'utf8')+'\n'+fs.readFileSync(require('path').join(__dirname,'../app.js'),'utf8')+'\ncompleteCompetition(true); globalThis.__result={race:state.race,session:state.session,archive:state.archive,nav:globalThis.__nav,stored:localStorage.getItem(KEYS.archive)};';
  vm.runInContext(src,ctx2);
  if(ctx2.__result.race!==null||ctx2.__result.session!==null||ctx2.__result.nav!=='home')throw new Error('completeCompetition did not complete after compact archival');
  if(ctx2.__result.stored.includes('data:image/'))throw new Error('completeCompetition archived embedded avatar data');
  if(!ctx2.__result.archive.length)throw new Error('completeCompetition lost archive snapshot');
  console.log('ios_finish_quota_completion_behavior: PASS');
}
