import assert from 'node:assert/strict';
import {freshState,standings,simulateLeagueRound,getLeagueNextRound,simulatePostseasonRound,finishMarket,startNextSeason} from './engine.js';
import {ensureContinent,COUNTRY_COUNT,PROFILES,countryStandings,catchUpCountries,simulateCountryFinalRound,prepareCountriesNextSeason} from './continent.js';
import {ensureInternational,simulateInternationalStep} from './international.js';
import {ensureEcosystem,inspectAcademy,upgradeFacility,answerPress,careerOffers,acceptCareerJob} from './ecosystem.js';
const s=ensureEcosystem(ensureContinent(freshState()));assert.equal(Object.keys(s.teams).length,252);assert.equal(COUNTRY_COUNT,9);
assert.equal(s.fixtures.filter(f=>f.played).length,78);
for(const [name,world] of Object.entries(s.world)){assert.equal(world.slots.A.length,9);assert.equal(world.slots.B.length,9);assert.equal(world.slots.S.length,10);assert.equal(new Set([...world.slots.A,...world.slots.B,...world.slots.S]).size,28);assert.equal(world.fixtures.length,252);assert.equal(world.fixtures.filter(f=>f.played).length,78);const clubs=[...world.slots.A,...world.slots.B];for(const club of clubs){const fixtures=world.fixtures.filter(f=>f.competition==='LSV'&&(f.home===club||f.away===club));assert.equal(fixtures.length,18,`${name} ${club}`);assert.equal(fixtures.filter(f=>f.home===club).length,9,club);assert.equal(fixtures.filter(f=>f.away===club).length,9,club);}}
assert.equal(standings(s,'annual').length,18);assert.equal(standings(s,'A').length,9);assert.equal(standings(s,'S').length,10);
const y=inspectAcademy(s,'Unión Popular Aurena');assert.equal(y.length,5);const budget=s.teams['Unión Popular Aurena'].budget;upgradeFacility(s,'Unión Popular Aurena','stadium');assert.equal(s.teams['Unión Popular Aurena'].capacity>0,true);assert(s.teams['Unión Popular Aurena'].budget<budget);
answerPress(s,'Unión Popular Aurena','¿Prueba?','calm');assert.equal(s.ecosystem.press.length,1);careerOffers(s);acceptCareerJob(s,'Atlético Aurena');assert.equal(s.managedClub,'Atlético Aurena');
const base=s.fixtures.filter(f=>f.played).map(f=>[f.id,f.scoreH,f.scoreA]);simulateLeagueRound(s);catchUpCountries(s,7);assert.equal(s.world.Varkosia.round,7);assert.deepEqual(s.fixtures.filter(f=>f.played&&f.round<=6).map(f=>[f.id,f.scoreH,f.scoreA]),base);
while(getLeagueNextRound(s)<=18){const r=simulateLeagueRound(s);catchUpCountries(s,r.round);}const cc=ensureInternational(s);assert(cc);assert.equal(cc.champions.direct.length,54);assert.equal(cc.champions.fixtures.filter(f=>f.phase==='playoff').length,9);assert.equal(cc.horizonte.groups.length,9);assert(cc.horizonte.groups.every(g=>g.teams.length===5));
for(const type of ['champions','horizonte']){let guard=0;while(!cc[type].champion&&guard++<16)simulateInternationalStep(s,type);assert(cc[type].champion,`${type}: ${guard}`);}
for(const c of Object.keys(PROFILES)){let guard=0;while(s.world[c].postseason.stage!=='finalizada'&&guard++<6)simulateCountryFinalRound(s,c);assert.equal(s.world[c].postseason.stage,'finalizada');}
console.log('NOVERIA 4 OK: 9 países, 252 equipos, 9/9 localía, cantera, Copa de Campeones, Horizonte, fases finales');
