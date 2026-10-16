import assert from 'node:assert/strict';
import {FOREIGN_COUNTRIES} from './data.js';
import {freshState,simulateMatch} from './engine.js';
import {ensureEcosystem,createYouthLeague,promoteProspect} from './ecosystem.js';
import {matchLineup} from './lineup.js';
import {sendYouthScout,advanceYouthScouting,signYouthCandidate,rejectYouthCandidate,startYouthGraduate,teamOverall,seniorYouthDevelopment} from './youth-scouting.js';

const teamName='Unión Popular Aurena',rival='Ferroviarios de Ferral';
const s=ensureEcosystem(freshState()),team=s.teams[teamName];
const history=s.fixtures.filter(m=>m.legacy&&m.round<=6).map(m=>[m.id,m.scoreH,m.scoreA]);
const newMatch=id=>({id,home:teamName,away:rival,competition:'LSV',round:7,played:false});
const scout=sendYouthScout(s,teamName,FOREIGN_COUNTRIES[0]),days=scout.stepsRemaining;
for(let i=0;i<days;i++)advanceYouthScouting(s,'scouting-'+i);
assert.equal(scout.status,'ready');
simulateMatch(s,newMatch('scout-fixture-1'));
assert.equal(scout.offerStage,'report');
simulateMatch(s,newMatch('scout-fixture-2'));
assert.equal(scout.offerStage,'final');
simulateMatch(s,newMatch('scout-fixture-3'));
assert.equal(scout.status,'ready');
simulateMatch(s,newMatch('scout-fixture-4'));
assert.equal(scout.status,'expired');
assert.ok(scout.candidates.every(p=>p.status==='expired'));
assert.throws(()=>signYouthCandidate(s,teamName,scout.candidates[0].id),/expiró/);
assert.ok(!team.youth.some(p=>p.id===scout.candidates[0].id));

const scout2=sendYouthScout(s,teamName,FOREIGN_COUNTRIES[1]),days2=scout2.stepsRemaining;
for(let i=0;i<days2;i++)advanceYouthScouting(s,'scouting-next-'+i);
simulateMatch(s,newMatch('offer-valid-1'));simulateMatch(s,newMatch('offer-valid-2'));
const youth=signYouthCandidate(s,teamName,scout2.candidates[0].id);
assert.ok(team.youth.includes(youth));
assert.equal(rejectYouthCandidate(s,teamName,scout2.candidates[1].id).status,'rejected');
const graduate=promoteProspect(s,teamName,youth.id);
startYouthGraduate(s,teamName,graduate.id);
assert.ok(matchLineup(team).starters.some(p=>p.id===graduate.id));

const oldOverall=teamOverall(s,team),oldOvr=graduate.ovr;
graduate.ovr=Math.min(99,graduate.ovr+15);graduate.pot=Math.max(graduate.pot,graduate.ovr);
assert.ok(teamOverall(s,team)>oldOverall);
graduate.ovr=oldOvr;
const lead=matchLineup(team).starters.find(p=>p.pos!=='POR');
lead.age=21;lead.pot=lead.ovr+1;const oldPot=lead.pot;
for(let i=0;i<14;i++){
 const m={id:'career-form-'+i,home:teamName,away:rival,played:true,scoreH:3,scoreA:0,
 lineups:{home:matchLineup(team).starters.map(p=>p.id),away:matchLineup(s.teams[rival]).starters.map(p=>p.id)},
 events:[{type:'goal',side:'home',p1:lead.id,p1Name:lead.name}]};
 seniorYouthDevelopment(s,m);
}
assert.ok(lead.development.games>=14&&lead.development.recent.length<=8);
assert.ok(lead.pot>oldPot,'El potencial aumenta con constancia');
assert.ok(lead.ovr<=lead.pot);
function outcomes(power){
 let scored=0,conceded=0,wins=0;
 for(let i=0;i<90;i++){
  const x=freshState();
  for(const p of x.teams[teamName].players){p.ovr=power;p.pot=Math.max(p.pot,power);}
  for(const p of x.teams[rival].players){p.ovr=70;p.pot=Math.max(p.pot,70);}
  const m=newMatch('test-ovr-'+i);simulateMatch(x,m);
  scored+=m.scoreH;conceded+=m.scoreA;wins+=Number(m.scoreH>m.scoreA);
  assert.ok(m.qualityAtKickoff.home>0);
 }
 return {scored,conceded,wins};
}
const low=outcomes(58),high=outcomes(86);
assert.ok(high.scored>low.scored&&high.conceded<low.conceded&&high.wins>low.wins);
const youthLeague=createYouthLeague(s,'Veltrania');
assert.equal(youthLeague.teams.length,18);
assert.equal(youthLeague.fixtures.length,153);
assert.deepEqual(s.fixtures.filter(m=>m.legacy&&m.round<=6).map(m=>[m.id,m.scoreH,m.scoreA]),history);
assert.doesNotThrow(()=>JSON.parse(JSON.stringify(s)));
console.log('✅ Ojeadores 2+2 partidos, fichar/rechazar, sin contratación automática');
console.log('✅ OVR/potencial por forma, plantillas y XI reales; 180 simulaciones comparadas');
console.log('✅ Cantera de 18 clubes, 153 partidos y 78 resultados históricos intactos');
