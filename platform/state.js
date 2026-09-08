'use strict';
const defaultUi={cardRadius:10,tileRadius:10,buttonRadius:8,inputRadius:7,iconRadius:8,heroRadius:12,widgetRadius:10,modalRadius:10,cardPadding:16,sectionGap:10,buttonHeight:62,contentWidth:1440,disciplineCols:3};
const defaultSettings={
  theme:'dark',lang:'ru',lapSound:true,minLapSec:2,countdownSec:10,warmupMinutes:2,
  announcerEnabled:true,startVoiceMode:'full',pilotVoiceEnabled:true,voiceStartCall:true,voiceBestLap:true,voiceFinish:true,voiceResults:true,voiceService:true,
  qualificationLimitType:'time',qualificationMinutes:5,qualificationLaps:8,finalLimitType:'laps',finalMinutes:5,finalLaps:7,ui:{...defaultUi}
};
const storedSettings=load(KEYS.settings,{});
const state={view:'home',race:load(KEYS.race,null),pilotDb:load(KEYS.pilots,[]),championships:load(KEYS.champ,[]),archive:load(KEYS.archive,[]),settings:{...defaultSettings,...storedSettings,ui:{...defaultUi,...(storedSettings.ui||{})}},session:null,sessionTick:null,countdownTick:null,resultsOpen:false,mobileEvents:false,mobileWidgets:false,widgetCollapsed:{events:false,results:true,voice:false,next:false,trackLapwiz:true,trackRules:true},activeChampionshipId:'',champTab:'stages',trackDays:load(KEYS.trackDays,[]),trackDay:load(KEYS.activeTrackDay,null),trackTick:null,trackEnding:false,prestartTimers:[],quickPanel:'',layoutLabActive:false,layoutLabZ:100};
delete state.settings.pilotVoiceProxyUrl;
const lapwiz=new LapWizCore();lapwiz.sound=state.settings.lapSound;
const announcer=new AnnouncerEngine();announcer.enabled=state.settings.announcerEnabled;announcer.startMode=state.settings.startVoiceMode;
const pilotVoices=new PilotVoiceStore();
