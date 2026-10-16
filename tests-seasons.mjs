import assert from 'node:assert/strict';
import {freshState,simulateLeagueRound,getLeagueNextRound,simulatePostseasonRound,finishMarket,startNextSeason,standings,played,simulateCupRound} from './engine.js';
import {cycleName,cycleNextName} from './season-cycle.js';
const s=freshState();
const original=Object.values(s.teams).filter(t=>t.country==='Veltrania'&&t.division==='LSV').map(t=>t.name).sort();
const legacy=s.fixtures.filter(m=>m.legacy&&m.round<=6).map(m=>[m.id,m.scoreH,m.scoreA]);
function finish(){while(getLeagueNextRound(s)<=18)simulateLeagueRound(s);for(let i=0;i<7;i++)simulatePostseasonRound(s);assert.equal(s.postseason.stage,'finalizada');}
function advance(){if(s.market.status==='open')finishMarket(s);const before=s.honours.length,r=startNextSeason(s);assert.equal(s.honours.length,before);assert.equal(s.leagueRound,0);assert.equal(getLeagueNextRound(s),1);assert.equal(s.fixtures.length,252);assert.equal(s.fixtures.filter(played).length,0);return r;}
const top=()=>Object.values(s.teams).filter(t=>t.country==='Veltrania'&&t.division==='LSV').map(t=>t.name).sort();
assert.equal(cycleName(s),'Apertura 2026');
finish();assert.throws(()=>startNextSeason(s),/cerrá el mercado/i);
const champion=s.postseason.apertura,recopa=s.postseason.recopa;
assert.equal(advance().name,'Clausura 2027');
assert.equal(cycleNextName(s),'Apertura 2027');
assert.deepEqual(top(),original,'No cambiar ascensos/descensos después de Apertura 2026');
assert.equal(s.archive[0].key,'2026-Apertura');
assert.deepEqual(s.archive[0].fixtures.filter(m=>m.legacy&&m.round<=6).map(m=>[m.id,m.scoreH,m.scoreA]),legacy);
assert.ok(s.honours.some(h=>h.title==='Apertura 2026'&&h.winner===champion));
assert.ok(s.honours.some(h=>h.title==='Recopa Veltrana'&&h.winner===recopa));
assert.ok(simulateCupRound(s).length>0,'La nueva Copa Nacional está disponible');
finish();assert.ok(s.postseason.clausura);assert.equal(standings(s,'annual')[0].pj,18);
assert.equal(advance().name,'Apertura 2027');
assert.deepEqual(top(),original,'No cambiar ascensos/descensos hasta acabar Apertura 2027');
assert.deepEqual(s.archive.map(a=>a.key),['2027-Clausura','2026-Apertura']);
finish();assert.equal(standings(s,'annual')[0].pj,36);
assert.equal(s.honours.filter(h=>h.title==='Escudo de Oro de Veltrania'&&h.season==='2027').length,1);
const relegated=[standings(s,'A').at(-1).name,standings(s,'B').at(-1).name],promoted=standings(s,'S').slice(0,2).map(x=>x.name);
assert.equal(advance().name,'Clausura 2028');
for(let i=0;i<2;i++){assert.equal(s.teams[relegated[i]].division,'LPV');assert.equal(s.teams[promoted[i]].division,'LSV');}
assert.deepEqual(s.archive.map(a=>a.key),['2027-Apertura','2027-Clausura','2026-Apertura']);
assert.equal(new Set([...s.archive.flatMap(a=>a.fixtures),...s.fixtures].map(m=>m.id)).size,1008);
console.log('✅ APERTURA 2026 → CLAUSURA 2027 → APERTURA 2027 · TABLA ANUAL, ARCHIVOS Y CAMPEONES');
