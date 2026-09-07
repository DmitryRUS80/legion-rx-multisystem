'use strict';
function runRallyCrossSelfTest(){
 const tests=[],eq=(name,a,b)=>tests.push({name,ok:Object.is(a,b),got:a,want:b});
 eq('Q P1',getPoints(1),50);eq('Q P4',getPoints(4),40);eq('Q P16',getPoints(16),28);eq('Q P17 continuation',getPoints(17),27);
 const pilot={qualifying:[{round:1,heat:1,status:'FIN',place:1,points:50},{round:2,heat:1,status:'FIN',place:2,points:45},{round:3,heat:1,status:'FIN',place:3,points:42},{round:4,heat:1,status:'FIN',place:4,points:40}]};calculateBest3(pilot);eq('Best3 sum',pilot.best3,137);
 eq('Final FIN score',mainRunScore({status:'FIN',place:2}),2);eq('Final DNF score',mainRunScore({status:'DNF'}),SPORT_RULES.finalNonFinishScore);eq('Final DNS score',mainRunScore({status:'DNS'}),SPORT_RULES.finalNonFinishScore);eq('Final DSQ score',mainRunScore({status:'DSQ'}),SPORT_RULES.finalNonFinishScore);eq('A runs',FINAL_A_RUNS.join(','),'A1,A2,A3');eq('Stage P1',EVENT_POINTS[0],25);
 return{ok:tests.every(x=>x.ok),version:SPORT_RULES.version,tests};
}
window.LegionRXSportDiagnostics=runRallyCrossSelfTest;const rallyCrossBootTest=runRallyCrossSelfTest();if(!rallyCrossBootTest.ok)console.error('LEGION RX SPORT RULES SELF-TEST FAILED',rallyCrossBootTest);else console.info('LEGION RX SPORT RULES OK',rallyCrossBootTest.version);
