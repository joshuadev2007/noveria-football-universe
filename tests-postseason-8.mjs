import assert from 'node:assert/strict';
import {freshState,simulateLeagueRound,simulatePostseasonRound,getLeagueNextRound,standings} from './engine.js';
import {ensureContinent,catchUpCountries,countryStandings,simulateCountryFinalRound} from './continent.js';
import {calendarPostseasonOrdinal,calendarTimeline} from './calendar.js';
import {FOREIGN_COUNTRIES} from './data.js';

const s=ensureContinent(freshState());
const legacyResults=s.fixtures.filter(m=>m.legacy&&m.round<=6).map(m=>[m.id,m.scoreH,m.scoreA]);
while(getLeagueNextRound(s)<=18)simulateLeagueRound(s);
catchUpCountries(s,18);
const bracket=(country,p,table)=>{
 const a=table('A').slice(0,4).map(x=>x.name),b=table('B').slice(0,4).map(x=>x.name);
 const fixtures=p.fixtures.filter(m=>m.group==='cuartos');
 assert.equal(p.stage,'cuartos',country+' empieza en cuartos');
 assert.equal(p.format,'cuartos8');
 assert.equal(fixtures.length,8,'Cuatro cruces ida/vuelta');
 assert.deepEqual(fixtures.filter(m=>m.round===2).map(m=>[m.home,m.away]),[
  [a[0],b[3]],[b[0],a[3]],[a[1],b[2]],[b[1],a[2]]
 ],'Los cuatro mejores de cada grupo acceden a cruces entre zonas');
 assert.equal(new Set(fixtures.flatMap(m=>[m.home,m.away])).size,8);
 for(let i=0;i<fixtures.length;i+=2)assert.ok(
  p.seeds.indexOf(fixtures[i+1].home)<p.seeds.indexOf(fixtures[i+1].away),
  'El de mejor posición debe cerrar de local'
 );
};
bracket('Veltrania',s.postseason,g=>standings(s,g));
for(const country of FOREIGN_COUNTRIES)bracket(country,s.world[country].postseason,g=>countryStandings(s,country,g));

const steps=[];
for(let round=1;round<=7;round++){
 const stage=s.postseason.stage,leg=s.postseason.leg;
 assert.equal(calendarPostseasonOrdinal(s.postseason),round);
 steps.push(stage+leg);
 simulatePostseasonRound(s);
 for(const country of FOREIGN_COUNTRIES){
  assert.equal(calendarPostseasonOrdinal(s.world[country].postseason),round);
  simulateCountryFinalRound(s,country);
 }
 if(round===2||round===4){
  for(const [country,p] of [['Veltrania',s.postseason],...FOREIGN_COUNTRIES.map(c=>[c,s.world[c].postseason])]){
   const stage=round===2?(country==='Veltrania'?'semifinales':'semifinal'):'final';
   const games=p.fixtures.filter(m=>m.group===stage);
   for(let i=0;i<games.length;i+=2){
    assert.equal(games[i].away,games[i+1].home);
    assert.equal(games[i].home,games[i+1].away);
    assert.ok(p.seeds.indexOf(games[i+1].home)<p.seeds.indexOf(games[i+1].away),
     country+': el mejor posicionado cierra en casa en '+stage);
   }
  }
 }
}
assert.deepEqual(steps,['cuartos1','cuartos2','semifinales1','semifinales2','final1','final2','recopa1']);
assert.equal(s.postseason.stage,'finalizada');
assert.ok(s.postseason.apertura&&s.postseason.recopa);
for(const country of FOREIGN_COUNTRIES)assert.equal(s.world[country].postseason.stage,'finalizada');
assert.equal(s.postseason.fixtures.length,15);
assert.equal(new Set(s.postseason.fixtures.map(m=>m.id)).size,15);
assert.equal(calendarTimeline(s).filter(e=>e.kind==='postseason').length,7);
assert.deepEqual(s.fixtures.filter(m=>m.legacy&&m.round<=6).map(m=>[m.id,m.scoreH,m.scoreA]),legacyResults);
assert.ok(s.honours.some(h=>h.title==='Apertura 2026'));
assert.ok(s.honours.some(h=>h.title==='Recopa Veltrana'));

// Cuadros anteriores ya comenzados mantienen sus cinco fechas de eliminación.
for(const stage of ['semifinales','semifinal','final','recopa']){
 const old={stage,leg:1,fixtures:[{group:'semifinales'}]};
 assert.equal(calendarPostseasonOrdinal(old),{semifinales:1,semifinal:1,final:3,recopa:5}[stage]);
}
console.log('✅ Ocho clasificados, cuartos ida/vuelta, 9 federaciones y siete fechas');
console.log('✅ El mejor ubicado cierra siempre de local · títulos e historia respetados');
