'use strict';
function eventList(race){
  const q=race.heats.map(h=>({...h,phase:'qualifying'}));const f=race.finals.map(x=>({...x,phase:'finals'}));return [...q,...f].sort((a,b)=>{if(a.phase!==b.phase)return a.phase==='qualifying'?-1:1;return(a.order||0)-(b.order||0);});
}

function currentEvent(race){const all=eventList(race);return all.find(e=>!e.saved&&e.enabled)||all.find(e=>!e.saved&&e.phase==='qualifying')||null;}

function eventStatus(race,event){if(event.cancelled)return'cancelled';if(event.saved)return'completed';const cur=currentEvent(race);if(cur&&cur.key===event.key)return'current';if(event.enabled)return'ready';return'locked';}

function eventRule(race,event){
  if(!event)return null;
  const rs=race.raceSettings||{};
  if(event.type==='qualifying'&&!event.tieBreak){
    const limitType=rs.qualificationLimitType||'time';
    return {mode:'qualification',limitType,durationMin:limitType==='time'?Number(rs.qualificationMinutes||5):0,targetLaps:limitType==='laps'?Number(rs.qualificationLaps||8):0,minLapSec:Number(rs.minLapSec||2),finishCurrentLap:true};
  }
  const limitType=rs.finalLimitType||'laps';
  return {mode:'race',limitType,durationMin:limitType==='time'?Number(rs.finalMinutes||5):0,targetLaps:limitType==='laps'?Number(rs.finalLaps||7):0,minLapSec:Number(rs.minLapSec||2),finishCurrentLap:true};
}

function getEventPilots(race,event){return(event?.pilots||[]).map(id=>getPilot(race,id)).filter(Boolean);}

/* One authoritative pre-start order. Qualification keeps the sport-generated heat
   sequence exactly as stored in event.pilots. Finals/run-offs use the current
   qualification ranking, matching the official start-grid presentation. */
function getEventStartPilots(race,event){
  const pilots=getEventPilots(race,event);if(!event||event.type==='qualifying')return pilots;
  const rank=qualificationRankMap(race);return [...pilots].sort((a,b)=>(rank.get(String(a.id))||9999)-(rank.get(String(b.id))||9999));
}

/* Public read-only adapter for UI. UI consumes prepared sport data and commands,
   never scoring constants or internal calculation functions directly. */
const RallyCrossModeAPI=Object.freeze({
  ruleView(){
    return Object.freeze({
      version:SPORT_RULES.version,
      statuses:[...SPORT_RULES.statuses],
      qualifyingPointsPreview:SPORT_RULES.qualifyingPoints.slice(0,6),
      qualifyingBestCount:3,
      finalRuns:[...SPORT_RULES.finalARuns],
      finalBestCount:SPORT_RULES.finalBestCount,
      finalNonFinishScore:SPORT_RULES.finalNonFinishScore,
      tiePolicy:'runoff-only-no-extra-points',
      championshipEventPoints:[...SPORT_RULES.championshipEventPoints]
    });
  },
  isValidStatus(status){return SPORT_RULES.statuses.includes(status);},
  updateStandings(race){return updateStandings(race);},
  mainStandings(race){return buildMainStandings(race);},
  startPilots(race,event){return getEventStartPilots(race,event);},
  startGrid(race,event){
    const rank=qualificationRankMap(race);
    return getEventStartPilots(race,event)
      .map((pilot,index)=>({pilot,qualificationRank:rank.get(String(pilot.id))||null,startPosition:index+1}));
  }
});
