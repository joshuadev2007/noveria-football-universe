import assert from 'node:assert/strict';
import {freshState,simulateLeagueRound,simulatePostseasonRound,getLeagueNextRound,standings} from './engine.js';
import {ensureContinent,catchUpCountries,countryStandings,simulateCountryFinalRound} from './continent.js';
import {calendarPostseasonOrdinal,calendarTimeline} from './calendar.js';
import {FOREIGN_COUNTRIES} from './data.js';
import {leaguePlayoffSeeds,leaguePlayoffPairs,leaguePlayoffReseed} from './league-playoffs.js';

const s=ensureContinent(freshState());
const legacyResults=s.fixtures.filter(m=>m.legacy&&m.round<=6).map(m=>[m.id,m.scoreH,m.scoreA]);
while(getLeagueNextRound(s)<=18)simulateLeagueRound(s);
catchUpCountries(s,18);
const bracket=(country,p,table)=>{
 const seeds=leaguePlayoffSeeds(table('A'),table('B')),names=seeds.map(x=>x.name),fixtures=p.fixtures.filter(m=>m.group==='cuartos');
 assert.equal(p.stage,'cuartos',country+' empieza en cuartos');
 assert.equal(p.format,'cuartos8');
 assert.equal(p.seeding,'global-1-8');
 assert.equal(fixtures.length,8,'Cuatro cruces ida/vuelta');
 assert.deepEqual(p.seeds,names,'Las ocho posiciones son una tabla global');
 assert.deepEqual(fixtures.filter(m=>m.round===2).map(m=>[m.home,m.away]),[
  [names[0],names[7]],[names[1],names[6]],[names[2],names[5]],[names[3],names[4]]
 ],'Cuartos 1 vs 8, 2 vs 7, 3 vs 6 y 4 vs 5');
 assert.deepEqual(fixtures.filter(m=>m.round===1).map(m=>[m.home,m.away]),[
  [names[7],names[0]],[names[6],names[1]],[names[5],names[2]],[names[4],names[3]]
 ],'El mejor sembrado empieza de visitante');
 assert.equal(new Set(fixtures.flatMap(m=>[m.home,m.away])).size,8);
 for(let i=0;i<fixtures.length;i+=2)assert.ok(
  p.seeds.indexOf(fixtures[i+1].home)<p.seeds.indexOf(fixtures[i+1].away),
  'El de mejor posición debe cerrar de local'
 );
};
bracket('Veltrania',s.postseason,g=>standings(s,g));
for(const country of FOREIGN_COUNTRIES)bracket(country,s.world[country].postseason,g=>countryStandings(s,country,g));

// Comprobación independiente: cada grupo aporta 4 y se ordenan por PTS, DG, GF.
const aRows=[{name:'A1',pts:15,gd:9,gf:14},{name:'A2',pts:12,gd:3,gf:9},{name:'A3',pts:9,gd:2,gf:8},{name:'A4',pts:6,gd:-2,gf:6}];
const bRows=[{name:'B1',pts:16,gd:8,gf:16},{name:'B2',pts:13,gd:4,gf:10},{name:'B3',pts:10,gd:3,gf:9},{name:'B4',pts:7,gd:-1,gf:4}];
const ranked=leaguePlayoffSeeds(aRows,bRows).map(x=>x.name);
assert.deepEqual(ranked,['B1','A1','B2','A2','B3','A3','B4','A4']);
assert.deepEqual(leaguePlayoffPairs(ranked),[['B1','A4'],['A1','B4'],['B2','A3'],['A2','B3']]);
assert.deepEqual(leaguePlayoffReseed(['A1','B2','B3','A2'],ranked),[['A1','B3'],['B2','A2']]);

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
console.log('✅ Top 4 de cada grupo, tabla global, cruces 1–8 / 2–7 / 3–6 / 4–5 y nueve federaciones');
console.log('✅ El mejor ubicado cierra siempre de local · títulos e historia respetados');
