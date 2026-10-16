import assert from 'node:assert/strict';
import {freshState,simulateLeagueRound,getLeagueNextRound,simulatePostseasonRound,finishMarket,startNextSeason,standings,played,simulateCupRound} from './engine.js';
const s=freshState();
while(getLeagueNextRound(s)<=18)simulateLeagueRound(s);
assert.equal(s.market.status,'open');
const dropped=[standings(s,'A').at(-1).name,standings(s,'B').at(-1).name];
const rising=standings(s,'S').slice(0,2).map(x=>x.name);
for(let i=0;i<5;i++)simulatePostseasonRound(s);
assert.equal(s.postseason.stage,'finalizada');
assert.throws(()=>startNextSeason(s),/cerrá el mercado/);
finishMarket(s);
const before=s.honours.length;
const out=startNextSeason(s);
assert.equal(out.season,2027);
assert.equal(s.archive.length,1);
assert.equal(s.archive[0].fixtures.filter(played).length,252);
assert.equal(s.archive[0].season,2026);
assert.equal(s.fixtures.filter(played).length,0);
assert.equal(s.fixtures.length,252);
assert.equal(s.honours.length,before);
assert.equal(s.leagueRound,0);
assert.equal(getLeagueNextRound(s),1);
for(const [a,b] of rising.entries()) {assert.equal(s.teams[b].division,'LSV');assert.equal(s.teams[b].group,a===0?'A':'B');}
for(const x of dropped){assert.equal(s.teams[x].division,'LPV');assert.equal(s.teams[x].group,'S');}
for(const t of Object.values(s.teams).filter(x=>x.division==='LSV')){
 const fs=s.fixtures.filter(f=>f.competition==='LSV'&&[f.home,f.away].includes(t.name));assert.equal(fs.length,18,t.name);assert.equal(fs.filter(f=>f.home===t.name).length,9);assert.equal(fs.filter(f=>f.away===t.name).length,9);
}
for(const t of Object.values(s.teams).filter(x=>x.division==='LPV'))assert.equal(s.fixtures.filter(f=>f.competition==='LPV'&&[f.home,f.away].includes(t.name)).length,18,t.name);
let r=simulateLeagueRound(s);assert.equal(r.round,1);assert.equal(r.matches.length,13);
r=simulateCupRound(s);assert(r.length>0);
console.log('TEMPORADAS OK · 2027, 2 ascensos, 2 descensos, calendario 9/9, archivo 2026, copa y fase regular nueva');
