'use strict';
(function(){
  const icons={
    home:'<path d="M4 11.2 12 4l8 7.2"/><path d="M6.5 10v9h4v-5h3v5h4v-9"/>',
    trophy:'<path d="M8 4.5h8v4.2a4 4 0 0 1-8 0z"/><path d="M8 6H4.5v1.5A4 4 0 0 0 8 11m8-5h3.5v1.5A4 4 0 0 1 16 11M12 13v4m-4 3h8"/>',
    users:'<circle cx="8.5" cy="8" r="2.7"/><circle cx="16.7" cy="8.8" r="2.1"/><path d="M3.5 19.5c.4-3.7 2.4-6 5-6s4.7 2.3 5.1 6M15 14c2.8.1 4.7 2 5 5.5"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="m12 3 1 2.2 2.3.7 2.1-1 1.7 1.7-1 2.1.7 2.3L21 12l-2.2 1-.7 2.3 1 2.1-1.7 1.7-2.1-1-2.3.7L12 21l-1-2.2-2.3-.7-2.1 1-1.7-1.7 1-2.1L5.2 13 3 12l2.2-1 .7-2.3-1-2.1 1.7-1.7 2.1 1 2.3-.7z"/>',
    wave:'<path d="M2 12h3l1.7-5 2.6 10 2.2-13 2.8 16 2-9 1.7 4h4"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3m-3.5 0h7"/>',
    flag:'<path d="M5 21V4"/><path d="M5 5h12l-2 3.5 2 3.5H5"/>',
    next:'<path d="m4 5 7 7-7 7m8-14 7 7-7 7"/>',
    stop:'<rect x="6" y="6" width="12" height="12" rx="1.2"/>',
    chart:'<path d="M4 20V11m5 9V7m5 13V4m5 16v-6M2 20h20"/>',
    list:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h1M4 12h1M4 18h1"/>',
    play:'<path d="m8 5 11 7-11 7z"/>',
    pause:'<path d="M8.5 5v14m7-14v14"/>',
    plusClock:'<circle cx="10" cy="12" r="7"/><path d="M10 8v4l3 2m4 3h5m-2.5-2.5v5"/>',
    refresh:'<path d="M19.5 7V3.5L16 7"/><path d="M19 7a8 8 0 0 0-13.5-1.5M4.5 17v3.5L8 17"/><path d="M5 17a8 8 0 0 0 13.5 1.5"/>',
    timer:'<circle cx="12" cy="13" r="8"/><path d="M9 2h6m-3 3v2m0 6 3-3"/>',
    bluetooth:'<path d="m7 7 10 10-5 4V3l5 4L7 17"/>',
    speaker:'<path d="M4 10h4l5-4v12l-5-4H4z"/><path d="M16 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12"/>',
    monitor:'<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8m-4-4v4"/>',
    car:'<path d="m4 14 2-5h12l2 5v4h-2m-12 0H4v-4h16v4h-2"/><circle cx="7" cy="16" r="1.3"/><circle cx="17" cy="16" r="1.3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    radio:'<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7m7-7a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13m13-13a9 9 0 0 1 0 13"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    chevronDown:'<path d="m6 9 6 6 6-6"/>'
  };
  function applyIcons(root=document){
    if(document.documentElement.dataset.skin==='classic')return;
    root.querySelectorAll?.('svg[data-rx-icon]').forEach(svg=>{const name=svg.dataset.rxIcon;if(icons[name]&&svg.dataset.rxApplied!==name){svg.innerHTML=icons[name];svg.dataset.rxApplied=name;}});
  }
  const api={applyIcons}; window.RXUISkins=api;
  const mo=new MutationObserver(muts=>{if(document.documentElement.dataset.skin==='classic')return;for(const m of muts)for(const n of m.addedNodes)if(n.nodeType===1)applyIcons(n);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{applyIcons();mo.observe(document.body,{childList:true,subtree:true});});else{applyIcons();mo.observe(document.body,{childList:true,subtree:true});}
})();
