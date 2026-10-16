import assert from 'node:assert/strict';
import {freshState,simulateLeagueRound,simulateCupRound,simulatePostseasonRound,startNextSeason,getLeagueNextRound,standings,played,finishMarket} from './engine.js';
import {ensureContinent,catchUpCountries,simulateNationalCupRound,simulateCountryFinalRound,prepareCountriesNextSeason} from './continent.js';
import {ensureInternational,simulateInternationalStep,internationalArchiveNextSeason} from './international.js';
import {calendarCurrent,calendarRecord,calendarSeasonComplete,calendarTimeline,calendarMatchReady} from './calendar.js';
import {cycleName,cycleNextName,cycleNext,cycleKey} from './season-cycle.js';
import {FOREIGN_COUNTRIES} from './data.js';
const s=ensureContinent(freshState());
const expected=['Apertura 2026','Clausura 2027','Apertura 2027'],snapshots=[];
for(const label of expected){
 assert.equal(cycleName(s),label);
 let count=0;
 while(calendarCurrent(s)&&count<130){
  const e=calendarCurrent(s),games=[];
  if(e.kind==='league'){
   if(getLeagueNextRound(s)===e.ordinal)games.push(...simulateLeagueRound(s).matches);
   catchUpCountries(s,e.ordinal);
   for(const c of FOREIGN_COUNTRIES)games.push(...s.world[c].fixtures.filter(m=>m.round===e.ordinal&&played(m)));
  }else if(e.kind==='cup'){
   if(!s.cup.champion&&s.cup.round===e.ordinal)games.push(...simulateCupRound(s));
   for(const c of FOREIGN_COUNTRIES)if(!s.world[c].cup.champion&&s.world[c].cup.round===e.ordinal)games.push(...simulateNationalCupRound(s,c));
  }else if(e.kind==='international'){
   const intl=ensureInternational(s);assert.ok(intl);
   for(const type of ['champions','horizonte']){
    const c=intl[type],ord=c.phase==='playoff'?1:Number(c.round)+(type==='champions'?1:0);
    if(!c.champion&&ord===e.ordinal)games.push(...simulateInternationalStep(s,type));
   }
  }else if(e.kind==='postseason'){
   const n=p=>p.stage==='finalizada'?99:p.stage==='locked'?0:(p.stage==='final'?2:p.stage==='recopa'?4:0)+Number(p.leg||1);
   if(n(s.postseason)===e.ordinal)games.push(...simulatePostseasonRound(s));
   for(const c of FOREIGN_COUNTRIES)if(n(s.world[c].postseason)===e.ordinal)games.push(...simulateCountryFinalRound(s,c));
  }
  calendarRecord(s,e,games);
  const after=calendarCurrent(s);
  assert.notEqual(after?.id,e.id,'Calendario bloqueado en '+label+' '+e.date);
  count++;
 }
 assert.ok(calendarSeasonComplete(s),label+' terminó con competiciones pendientes');
 assert.equal(s.postseason.stage,'finalizada');
 assert.ok(s.cup.champion&&s.international.champions.champion&&s.international.horizonte.champion);
 snapshots.push({label,key:cycleKey(s),calendar:s.calendar.history.map(x=>x.id),annualMatches:standings(s,'annual')[0].pj,
  honourKeys:s.honours.map(h=>h.title),newChampion:s.postseason[s.edition.toLowerCase()]});
 if(label!=='Apertura 2027'){
  if(s.market.status==='open')finishMarket(s);
  const n=cycleNext(s);prepareCountriesNextSeason(s,n.season+'-'+n.edition);
  internationalArchiveNextSeason(s);
  const out=startNextSeason(s);
  assert.equal(out.name,cycleName(s));
 }
}
assert.equal(snapshots[0].annualMatches,18);
assert.equal(snapshots[1].annualMatches,18);
assert.equal(snapshots[2].annualMatches,36);
assert.equal(s.honours.filter(h=>h.title==='Escudo de Oro de Veltrania'&&h.season==='2027').length,1);
assert.ok(s.honours.some(h=>h.title==='Apertura 2026'));
assert.ok(s.honours.some(h=>h.title==='Clausura 2027'));
assert.ok(s.honours.some(h=>h.title==='Apertura 2027'));
assert.ok(s.honours.some(h=>h.title.includes('Recopa Veltrana')));
assert.deepEqual(s.archive.map(x=>x.key),['2027-Clausura','2026-Apertura']);
assert.equal(s.archive.find(x=>x.key==='2026-Apertura').fixtures.filter(m=>m.legacy&&m.round<=6).length,78);
const ids=[...s.archive.flatMap(a=>a.fixtures),...s.fixtures].map(x=>x.id);
assert.equal(new Set(ids).size,ids.length);
assert.equal(calendarTimeline({season:2027,edition:'Clausura'})[0].date.slice(0,7),'2027-02');
assert.equal(calendarTimeline({season:2027,edition:'Apertura'})[0].date.slice(0,7),'2027-08');
const fresh=ensureContinent(freshState());
const future=fresh.fixtures.find(x=>x.round===8);
assert.equal(calendarMatchReady(fresh,{kind:'league',m:future,owner:fresh}),false);
console.log('✅ TRES TORNEOS EN ORDEN · 2026 Apertura → 2027 Clausura → 2027 Apertura');
console.log('✅ TABLA ANUAL 18 + 18 · ESCUDO ÚNICO · 78 HISTÓRICOS · 9 FEDERACIONES Y COPAS');
