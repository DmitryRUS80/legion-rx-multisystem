'use strict';
// RC65 regression retained: RC66 supersedes capture delegation with direct per-render bindings.
const fs=require('fs');const s=fs.readFileSync(__dirname+'/../ui/classic-rc/classic-rc-ui.js','utf8');
const ok=s.includes('async function classicRCDispatchAction')&&s.includes('function classicRCBindActionElement')&&s.includes("dataset.classicBound='1'")&&!s.includes('classicRCEnsureDelegatedBindings');
if(!ok){console.error('FAIL RC65/66 schedule action regression');process.exit(2)}
console.log('RC65 schedule regression via RC66 direct bindings: PASS');
