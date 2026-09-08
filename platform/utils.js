'use strict';
function uid(prefix='id'){return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;}

function deepClone(v){return JSON.parse(JSON.stringify(v));}
