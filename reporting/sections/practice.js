'use strict';
(function(root){
  const reporting=root.LegionRXReporting;
  if(!reporting)throw new Error('LegionRXReporting core must be loaded first');

  reporting.registerSection('practice',request=>Object.freeze({
    schemaVersion:request.schemaVersion,
    section:request.section,
    reportKind:request.reportKind,
    requestedAt:request.requestedAt,
    payload:request.source,
    options:request.options
  }));
})(typeof self!=='undefined'?self:window);
