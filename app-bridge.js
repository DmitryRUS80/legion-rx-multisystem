'use strict';
const AudioUIBridge={setGate:()=>{},showGate:()=>{},hideGate:()=>{},setUnlockBusy:()=>{},refreshOffline:()=>{},createPlayer:(role)=>{const a=new Audio();a.dataset.legionAudio=role;return a;}};
const AppBridge={
  render:()=>{},updateHeader:()=>{},toast:()=>{},closeModal:()=>{},nav:()=>{},updateRace:()=>{},updatePractice:()=>{},openRaceResultEditor:()=>{}
};
function render(){return AppBridge.render();}
function updateHeader(){return AppBridge.updateHeader();}
function toast(message){return AppBridge.toast(message);}
function closeModal(){return AppBridge.closeModal();}
function nav(view){return AppBridge.nav(view);}
function updateDynamicCockpit(){return AppBridge.updateRace();}
function updateTrackDayDynamic(){return AppBridge.updatePractice();}

function openCurrentEventResultEditor(){return AppBridge.openRaceResultEditor();}
