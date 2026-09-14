'use strict';
/* LEGION RX · RC46 CLASSIC cockpit icon family.
   Applies only when data-skin="classic". It changes SVG paths, never actions/markup. */
(function(){
  const icons={
    home:'<path d="M4 11.2 12 4.5l8 6.7"/><path d="M6.5 10.2v9h4v-5.2h3v5.2h4v-9"/>',
    trophy:'<path d="M8 4.5h8v4a4 4 0 0 1-8 0z"/><path d="M8 6H4.5v1.2A3.8 3.8 0 0 0 8.3 11M16 6h3.5v1.2a3.8 3.8 0 0 1-3.8 3.8M12 12.5v4.2M8.5 20h7M9.5 16.8h5"/>',
    users:'<circle cx="8" cy="8" r="2.5"/><circle cx="16.2" cy="8.7" r="2"/><path d="M3.8 19.3c.4-3.6 2-5.5 4.2-5.5s3.9 1.9 4.3 5.5M14.3 14c3 .1 4.9 1.8 5.3 5.3"/>',
    wave:'<path d="M2.5 12h3l1.7-5.1 2.5 10.2 2.5-12.7 2.4 15.2 2.1-8.4 1.7 3.8h3.1"/>',
    mic:'<rect x="9.2" y="3.2" width="5.6" height="10.5" rx="2.8"/><path d="M5.9 11.1a6.1 6.1 0 0 0 12.2 0M12 17.2v3M8.8 20.2h6.4"/>',
    flag:'<path d="M5 20.5V4"/><path d="M5.2 5h11.2l-1.8 3.2 1.8 3.2H5.2"/><path d="M9 5v6.4M12.8 5v6.4" opacity=".62"/>',
    next:'<path d="m4.8 5.4 6.6 6.6-6.6 6.6M12 5.4l6.6 6.6-6.6 6.6"/>',
    stop:'<rect x="6.2" y="6.2" width="11.6" height="11.6" rx="1.4"/>',
    chart:'<path d="M4.5 19.5v-5.2M9.5 19.5V10M14.5 19.5V5.5M19.5 19.5v-8.2M2.8 19.5h18.4"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3.7v2M12 18.3v2M3.7 12h2M18.3 12h2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4"/><circle cx="12" cy="12" r="7.2"/>',
    list:'<path d="M9 6.2h11M9 12h11M9 17.8h11"/><path d="M4.2 6.2h.6M4.2 12h.6M4.2 17.8h.6" stroke-width="3"/>',
    play:'<path d="M8.2 5.1 18.7 12 8.2 18.9z"/>',
    pause:'<path d="M8.3 5.2v13.6M15.7 5.2v13.6"/>',
    plusClock:'<circle cx="10.2" cy="11.6" r="6.6"/><path d="M10.2 8.1v3.5l2.9 1.7M17.3 17.4h4.4M19.5 15.2v4.4"/>',
    refresh:'<path d="M19.2 7.2V3.8l-3.4 3.4"/><path d="M18.9 7.2A8 8 0 0 0 5.5 5.6M4.8 16.8v3.4l3.4-3.4"/><path d="M5.1 16.8a8 8 0 0 0 13.4 1.6"/>',
    timer:'<circle cx="12" cy="13" r="7.7"/><path d="M9.2 2.8h5.6M12 5.3v2M12 13l3-2.8"/>',
    bluetooth:'<path d="m7.2 7.1 9.6 9.8-4.8 3.8V3.3l4.8 3.8-9.6 9.8"/>',
    radio:'<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><path d="M8.8 8.8a4.5 4.5 0 0 0 0 6.4M15.2 8.8a4.5 4.5 0 0 1 0 6.4M5.7 5.7a8.9 8.9 0 0 0 0 12.6M18.3 5.7a8.9 8.9 0 0 1 0 12.6"/>',
    car:'<path d="m4 14.4 2-5h12l2 5v3.8h-2M6 18.2H4v-3.8h16v3.8h-2"/><circle cx="7.2" cy="16.2" r="1.2"/><circle cx="16.8" cy="16.2" r="1.2"/>',
    clock:'<circle cx="12" cy="12" r="8.7"/><path d="M12 7.2V12l3.3 2"/>',
    chevron:'<path d="m6.2 9.1 5.8 5.8 5.8-5.8"/>'
  };
  function apply(root=document){
    if(document.documentElement.dataset.skin!=='classic')return;
    root.querySelectorAll?.('.rxnCockpit svg[data-rx-icon]').forEach(svg=>{
      const name=svg.dataset.rxIcon;
      if(icons[name]&&svg.dataset.classicPolish!==name){
        svg.innerHTML=icons[name];
        svg.dataset.classicPolish=name;
      }
    });
  }
  const domObserver=new MutationObserver(muts=>{
    if(document.documentElement.dataset.skin!=='classic')return;
    for(const m of muts) for(const n of m.addedNodes) if(n.nodeType===1) apply(n);
  });
  const skinObserver=new MutationObserver(()=>apply());
  function start(){
    apply();
    if(document.body)domObserver.observe(document.body,{childList:true,subtree:true});
    skinObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-skin']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.ClassicControlPolish={applyIcons:apply};
})();
