'use strict';
function fmtMs(ms){if(!Number.isFinite(ms))return'—';const s=Math.max(0,ms)/1000,m=Math.floor(s/60),sec=Math.floor(s%60),cs=Math.floor((s-Math.floor(s))*100);return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;}

function fmtClock(ms){if(!Number.isFinite(ms))return'00:00';const t=Math.ceil(Math.max(0,ms)/1000),m=Math.floor(t/60),s=t%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
