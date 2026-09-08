'use strict';
(function(root){
  const sectionBuilders=new Map();

  function normalizeSection(section){
    return String(section||'').trim().toLowerCase();
  }

  function cloneData(value){
    if(value===undefined)return null;
    if(typeof structuredClone==='function'){
      try{return structuredClone(value);}catch{}
    }
    return JSON.parse(JSON.stringify(value));
  }

  function registerSection(section,builder){
    const key=normalizeSection(section);
    if(!key)throw new Error('Reporting section is required');
    if(typeof builder!=='function')throw new Error(`Reporting builder for "${key}" must be a function`);
    sectionBuilders.set(key,builder);
    return true;
  }

  function hasSection(section){
    return sectionBuilders.has(normalizeSection(section));
  }

  function listSections(){
    return [...sectionBuilders.keys()];
  }

  function prepare(section,resultData,options={}){
    const key=normalizeSection(section);
    const builder=sectionBuilders.get(key);
    if(!builder)throw new Error(`Reporting section "${key}" is not registered`);
    const request=Object.freeze({
      schemaVersion:1,
      section:key,
      reportKind:String(options.reportKind||'results'),
      requestedAt:new Date().toISOString(),
      source:cloneData(resultData),
      options:cloneData(options)
    });
    return builder(request);
  }

  root.LegionRXReporting=Object.freeze({
    registerSection,
    hasSection,
    listSections,
    prepare
  });
})(typeof self!=='undefined'?self:window);
