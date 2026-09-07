'use strict';
function uiToast(msg){const el=$('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(uiToast.t);uiToast.t=setTimeout(()=>el.classList.remove('show'),2200);}
function uiCloseModal(){const h=$('#modalHost');if(h)h.innerHTML='';}
AppBridge.toast=uiToast;AppBridge.closeModal=uiCloseModal;AppBridge.render=uiRender;AppBridge.updateHeader=uiUpdateHeader;AppBridge.nav=uiNav;
AudioUIBridge.createPlayer=(role)=>{const a=document.createElement('audio');a.preload='auto';a.playsInline=true;a.setAttribute('playsinline','');a.setAttribute('webkit-playsinline','');a.dataset.legionAudio=role;document.getElementById('legionAudioHost')?.appendChild(a);return a;};
AudioUIBridge.setGate=(message='',kind='')=>{const stateEl=document.getElementById('audioGateState');if(stateEl){stateEl.textContent=message||'';stateEl.className=`audioGateState ${kind||''}`.trim();}};AudioUIBridge.showGate=()=>document.getElementById('audioGate')?.classList.remove('hidden');AudioUIBridge.hideGate=()=>document.getElementById('audioGate')?.classList.add('hidden');AudioUIBridge.setUnlockBusy=busy=>{const btn=document.getElementById('audioGateBtn');if(btn)btn.disabled=!!busy;};AudioUIBridge.refreshOffline=()=>updateOfflineReadyUi();
initFreePracticeState();
lapwiz.addEventListener('pass',e=>processPass(e.detail.transponder,e.detail.deviceMs,'LAPWIZ'));
lapwiz.addEventListener('status',e=>{updateHeader();if(e.detail?.connected===false&&state.session&&['warmup','countdown','running','finishing'].includes(state.session.phase))announceService('lapwizDisconnected');});
announcer.ensurePlayers();setupAudioGate();bootOfflineAudio();
window.addEventListener('pointerdown',()=>{lapwiz.ensureAudio();},{once:true});
const LEGION_IS_IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')invalidateLegionAudio('visibility-hidden');else if(LEGION_IS_IOS)requestLegionAudioRecovery('visibility-visible');else offlineReady.check().then(updateOfflineReadyUi);});
window.addEventListener('pagehide',()=>invalidateLegionAudio('pagehide'));
window.addEventListener('pageshow',e=>{if(e.persisted||announcer.needsRecovery)requestLegionAudioRecovery('pageshow');});
window.addEventListener('focus',()=>{if(announcer.needsRecovery)requestLegionAudioRecovery('focus');});
window.addEventListener('beforeunload',()=>persistAll());
$('#brandBtn')?.addEventListener('click',()=>nav('home'));$('#settingsBtn')?.addEventListener('click',()=>nav('settings'));$$('#bottomNav button').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.view)));
document.addEventListener('click',e=>{const qp=e.target.closest?.('[data-quick-panel]');if(qp){state.quickPanel=qp.dataset.quickPanel||'';render();return;}if(e.target.closest?.('[data-quick-panel-close]')){state.quickPanel='';render();return;}if(e.target.closest?.('[data-layout-lab-toggle]')){state.layoutLabActive?exitLayoutLab():enterLayoutLab();return;}const hide=e.target.closest?.('[data-layout-hide]');if(hide){setLayoutElementHidden(hide.dataset.layoutHide,true);toast(`${layoutPanelName(hide.dataset.layoutHide)} скрыта`);return;}const vis=e.target.closest?.('[data-layout-visibility]');if(vis){const id=vis.dataset.layoutVisibility;setLayoutElementHidden(id,!getLayoutLabData()[id]?.hidden);return;}const tool=e.target.closest?.('[data-layout-tool]');if(tool){const a=tool.dataset.layoutTool;if(a==='exit')return exitLayoutLab();if(a==='reset')return resetLayoutLab();if(a==='elements'){document.querySelector('#layoutElementPalette')?.classList.toggle('open');return;}if(a==='copy'){const txt=JSON.stringify(getLayoutLabData(),null,2);navigator.clipboard?.writeText(txt).then(()=>toast('Схема Layout Lab скопирована')).catch(()=>toast('Не удалось скопировать — сделайте скрин'));return;}}});
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('[data-layout-drag]'))return layoutPointerStart(e,'drag');if(e.target.closest?.('[data-layout-resize]'))return layoutPointerStart(e,'resize');});
window.addEventListener('resize',()=>{if(state.layoutLabActive)requestAnimationFrame(applyLayoutLabData);});
if(storedSettings.visualPreset!=='race-console-v1')save(KEYS.settings,state.settings);
applySettings();render();registerLegionServiceWorker();
