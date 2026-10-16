import assert from 'node:assert/strict';
import {TEAMS,FIXTURES} from './data.js';
import {freshState,standings,leagueSummary,getLeagueNextRound,simulateLeagueRound,ranking,simulateCupRound,simulatePostseasonRound,createCompetition,simulateCustomRound,changeCoach,movePlayer} from './engine.js';
let s=freshState();assert.equal(TEAMS.length,60);assert.equal(s.fixtures.length,252);assert.equal(getLeagueNextRound(s),7);
assert.equal(standings(s,'A')[0].name,'Real Monteluz');assert.equal(standings(s,'A')[0].pts,12);
assert.equal(standings(s,'B')[0].name,'Sporting Bahía Clara');assert.equal(standings(s,'annual')[0].name,'Real Monteluz');
assert.equal(standings(s,'S')[0].name,'Atlético Bosqueceniza');
const summary=leagueSummary(s);assert.equal(summary.matches,78);assert.equal(summary.goals,199);
for(const t of Object.values(s.teams).filter(t=>t.division==='LSV')){const ms=s.fixtures.filter(f=>f.competition==='LSV'&&(f.home===t.name||f.away===t.name));assert.equal(ms.length,18,t.name);assert.equal(ms.filter(f=>f.home===t.name).length,9,t.name);assert.equal(ms.filter(f=>f.away===t.name).length,9,t.name);const intra=ms.filter(f=>f.group!=='I');assert.equal(new Set(intra.map(f=>f.home===t.name?f.away:f.home)).size,8,t.name);}
for(const t of Object.values(s.teams).filter(t=>t.division==='LPV')){const ms=s.fixtures.filter(f=>f.competition==='LPV'&&(f.home===t.name||f.away===t.name));assert.equal(ms.length,18,t.name);assert.equal(ms.filter(f=>f.home===t.name).length,9,t.name);}
const next=s.fixtures.filter(f=>f.competition==='LSV'&&f.round===7);assert(next.some(m=>m.home==='Ferroviarios de Ferral'&&m.away==='Real Monteluz'));
assert(next.some(m=>m.home==='Atlético Laguna Roja'&&m.away==='Unión Popular Aurena'));
let results=simulateLeagueRound(s);assert.equal(results.round,7);assert.equal(results.matches.length,13);assert.equal(getLeagueNextRound(s),8);assert(results.matches.every(x=>x.played&&x.events&&x.stats&&x.headline));
results=simulateLeagueRound(s);assert.equal(results.matches.length,21);assert.equal(getLeagueNextRound(s),9);
results=simulateLeagueRound(s);assert.equal(results.matches.length,14);assert.equal(getLeagueNextRound(s),10);
while(getLeagueNextRound(s)<=18)simulateLeagueRound(s);
assert.equal(getLeagueNextRound(s),19);assert.equal(s.fixtures.filter(x=>x.played).length,252);
for(const g of ['A','B','S']){const rank=standings(s,g);assert(rank.every(t=>t.pj===18),g);}
assert.equal(s.honours.filter(h=>h.title==='Escudo de Oro de Veltrania').length,1);
assert.equal(s.postseason.stage,'semifinales');for(let i=0;i<5;i++)simulatePostseasonRound(s);assert.equal(s.postseason.stage,'finalizada');assert(s.postseason.apertura&&s.postseason.recopa);assert.equal(s.honours.length,3);
let cupS=freshState();for(let i=0;i<7;i++)simulateCupRound(cupS);assert(cupS.cup.champion);assert.equal(cupS.honours.length,1);
let custom=freshState(),id=createCompetition(custom,'Copa Experimental',['Unión Popular Aurena','Atlético Aurena','Real Monteluz'],'cup');while(!custom.competitions[0].champion)simulateCustomRound(custom,id);assert.equal(custom.honours.length,1);
const old=custom.teams['Unión Popular Aurena'].coach;changeCoach(custom,'Unión Popular Aurena','Marcos del Río');assert.notEqual(custom.teams['Unión Popular Aurena'].coach,old);
const player=custom.teams['Unión Popular Aurena'].players[0],np=movePlayer(custom,player.id,'Unión Popular Aurena','Atlético Aurena');assert.equal(np.id,player.id);
console.log('TODAS LAS PRUEBAS APROBADAS: 60 clubes, 252 fechas-partido, calendario 9/9, 6 jornadas importadas, jornada 7, dobles 8/17, clásicos, liga completa, Copa y editor.');
