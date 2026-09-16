'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const listeners={};
global.self={LEGION_OFFLINE_CONFIG:null,registration:{scope:'https://legion.test/'},location:{origin:'https://legion.test'},clients:{matchAll:async()=>[],claim:async()=>{}},addEventListener:(n,f)=>{listeners[n]=f},skipWaiting:async()=>{}};
global.importScripts=(url)=>{const rel=String(url).split('?')[0].replace(/^\.\//,'');vm.runInThisContext(fs.readFileSync(path.join(ROOT,rel),'utf8'),{filename:rel});};
global.caches={match:async()=>null,open:async()=>({match:async()=>null,put:async()=>{}}),keys:async()=>[],delete:async()=>true};
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'sw.js'),'utf8'),{filename:'sw.js'});
const cfg=self.LEGION_OFFLINE_CONFIG;
if(!cfg||!Array.isArray(cfg.assets))throw new Error('offline manifest unavailable');
function mime(file){if(file==='./'||/\.html?$/.test(file))return'text/html';if(/\.js$/.test(file))return'text/javascript';if(/\.css$/.test(file))return'text/css';if(/\.txt$/.test(file))return'text/plain';if(/\.webmanifest$/.test(file))return'application/manifest+json';if(/\.svg$/.test(file))return'image/svg+xml';if(/\.png$/.test(file))return'image/png';if(/\.webp$/.test(file))return'image/webp';if(/\.woff2$/.test(file))return'font/woff2';if(/\.mp3$/.test(file))return'audio/mpeg';if(/\.wav$/.test(file))return'audio/wav';return'application/octet-stream';}
(async()=>{let pass=0;const failures=[];for(const asset of cfg.assets){try{const rel=asset==='./'?'index.html':asset.replace(/^\.\//,'');const body=fs.readFileSync(path.join(ROOT,rel));const res=new Response(body,{status:200,headers:{'content-type':mime(asset)}});await validate(asset,res);pass++;}catch(e){failures.push(`${asset}: ${e.message}`);}}console.log(`SW local validators: ${pass} PASS, ${failures.length} FAIL`);failures.forEach(x=>console.error('FAIL',x));if(failures.length)process.exit(2);})();
