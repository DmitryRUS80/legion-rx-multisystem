'use strict';
/* LEGION RX · RXUI icon vocabulary · RC45
   One optical family for every removable skin. Classic never uses this map. */
(function(){
  const icons={
    home:'<path d="M4.5 11.2 12 4.8l7.5 6.4"/><path d="M6.8 10.2v8.7h3.4v-5.2h3.6v5.2h3.4v-8.7"/>',
    trophy:'<path d="M8.2 4.5h7.6v4.2a3.8 3.8 0 0 1-7.6 0z"/><path d="M8.2 6.1H4.7v1.2a3.8 3.8 0 0 0 3.8 3.8M15.8 6.1h3.5v1.2a3.8 3.8 0 0 1-3.8 3.8M12 12.7v4.1M8.2 20h7.6M9.5 16.8h5"/>',
    users:'<circle cx="8.4" cy="8" r="2.7"/><circle cx="16.5" cy="8.8" r="2.1"/><path d="M3.7 19.4c.4-3.7 2.2-5.8 4.7-5.8s4.4 2.1 4.8 5.8M14.6 14.1c2.9.1 4.8 1.9 5.2 5.3"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3.6v2M12 18.4v2M3.6 12h2M18.4 12h2M6.1 6.1l1.4 1.4M16.5 16.5l1.4 1.4M17.9 6.1l-1.4 1.4M7.5 16.5l-1.4 1.4"/><circle cx="12" cy="12" r="7.1"/>',
    wave:'<path d="M2.3 12h3l1.8-5.3 2.6 10.6 2.5-13.1 2.5 15.6 2.2-9.2 1.6 4h3.2"/>',
    mic:'<rect x="9.1" y="3.2" width="5.8" height="10.8" rx="2.9"/><path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0M12 17.4v3M8.8 20.4h6.4"/>',
    flag:'<path d="M5.2 20.5V4.1"/><path d="M5.4 5.1h10.9l-1.8 3.1 1.8 3.1H5.4"/><path d="M9 5.1v6.2M12.7 5.1v6.2" opacity=".65"/>',
    next:'<path d="m4.8 5.5 6.5 6.5-6.5 6.5M12.1 5.5l6.5 6.5-6.5 6.5"/>',
    stop:'<rect x="6.1" y="6.1" width="11.8" height="11.8" rx="1.8"/>',
    chart:'<path d="M4.5 19.5v-5.2M9.5 19.5V9.8M14.5 19.5V5.3M19.5 19.5v-8.1M2.8 19.5h18.4"/>',
    list:'<path d="M9 6.2h11M9 12h11M9 17.8h11"/><circle cx="4.5" cy="6.2" r=".8" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="4.5" cy="17.8" r=".8" fill="currentColor" stroke="none"/>',
    play:'<path d="M8.2 5.1 18.7 12 8.2 18.9z"/>',
    pause:'<path d="M8.5 5.2v13.6M15.5 5.2v13.6"/>',
    plusClock:'<circle cx="10.3" cy="11.7" r="6.6"/><path d="M10.3 8.2v3.5l2.8 1.7M17.5 17.4h4.2M19.6 15.3v4.2"/>',
    refresh:'<path d="M19.1 7.2V3.8l-3.4 3.4"/><path d="M18.8 7.2A8 8 0 0 0 5.6 5.5M4.9 16.8v3.4l3.4-3.4"/><path d="M5.2 16.8a8 8 0 0 0 13.2 1.7"/>',
    timer:'<circle cx="12" cy="13" r="7.7"/><path d="M9.2 2.8h5.6M12 5.3v1.9M12 13l3-2.7"/>',
    bluetooth:'<path d="m7.2 7.1 9.6 9.8-4.8 3.8V3.3l4.8 3.8-9.6 9.8"/>',
    speaker:'<path d="M4 10h3.6l5-3.8v11.6l-5-3.8H4z"/><path d="M16 9.2a4.3 4.3 0 0 1 0 5.6M18.2 6.6a7.7 7.7 0 0 1 0 10.8"/>',
    monitor:'<rect x="3.2" y="4.5" width="17.6" height="12.2" rx="1.5"/><path d="M8.3 20.1h7.4M12 16.7v3.4"/>',
    car:'<path d="m4 14.4 2-5h12l2 5v3.8h-2M6 18.2H4v-3.8h16v3.8h-2"/><circle cx="7.2" cy="16.2" r="1.2"/><circle cx="16.8" cy="16.2" r="1.2"/>',
    clock:'<circle cx="12" cy="12" r="8.7"/><path d="M12 7.2V12l3.3 2"/>',
    radio:'<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M8.8 8.8a4.5 4.5 0 0 0 0 6.4M15.2 8.8a4.5 4.5 0 0 1 0 6.4M5.7 5.7a8.9 8.9 0 0 0 0 12.6M18.3 5.7a8.9 8.9 0 0 1 0 12.6"/>',
    chevron:'<path d="m9.4 18 6-6-6-6"/>',
    chevronDown:'<path d="m6.2 9.1 5.8 5.8 5.8-5.8"/>'
  };
  function applyIcons(root=document){
    if(document.documentElement.dataset.skin==='classic')return;
    root.querySelectorAll?.('svg[data-rx-icon]').forEach(svg=>{
      const name=svg.dataset.rxIcon;
      if(icons[name]&&svg.dataset.rxApplied!==name){svg.innerHTML=icons[name];svg.dataset.rxApplied=name;}
    });
  }
  window.RXUISkins={applyIcons};
  const mo=new MutationObserver(muts=>{
    if(document.documentElement.dataset.skin==='classic')return;
    for(const m of muts)for(const n of m.addedNodes)if(n.nodeType===1)applyIcons(n);
  });
  const start=()=>{applyIcons();if(document.body)mo.observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
