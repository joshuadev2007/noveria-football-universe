import assert from 'node:assert/strict';
import {freshState,simulateLeagueRound,played} from './engine.js';
import {ensureContinent,simulateCountryRound} from './continent.js';
import {ensureEcosystem,getPressConference,answerPress,pressSnapshot} from './ecosystem.js';

const s=ensureEcosystem(ensureContinent(freshState()));
const name='Unión Popular Aurena';
const hist=s.fixtures.filter(played).map(m=>[m.id,m.scoreH,m.scoreA]);
const zero=s.teams[name].morale;
const f=pressSnapshot(s,name);
assert.equal(f.last.own,1);assert.equal(f.last.other,1);assert.equal(f.last.opponent,'Academia Liria');
let r=getPressConference(s,name);
assert.equal(r.session.questions.length,3);assert.match(r.current.question,/Academia Liria/);
assert.equal(getPressConference(s,name).current.question,r.current.question,'la pantalla no altera preguntas');
const quotes=new Set(r.current.responses.map(x=>x.quote));assert.equal(quotes.size,3);
const effects=new Set(r.current.responses.map(x=>JSON.stringify(x.effects)));assert.equal(effects.size,3);
let e=answerPress(s,name,r.current.id,r.current.responses[1].id);
assert.match(e.question,/Academia Liria/);
assert.equal(e.answer,r.current.responses[1].quote);
assert.notEqual(s.teams[name].morale,zero,'la respuesta tiene consecuencia');
assert.equal(s.ecosystem.press.length,1);assert.equal(s.news[0].title,e.headline);
assert.throws(()=>answerPress(s,name,r.current.id,'inexistente'),/pregunta cambió|Seleccioná/);
for(let i=0;i<2;i++){r=getPressConference(s,name);answerPress(s,name,r.current.id,r.current.responses[0].id)}
r=getPressConference(s,name);assert.equal(r.session.completed,true);assert.equal(r.current,null);
assert.throws(()=>answerPress(s,name,r.session.questions[0].id,'apoyo'),/ya terminó/);
assert.equal(s.ecosystem.press.length,3);
assert.deepEqual(s.fixtures.filter(played).map(m=>[m.id,m.scoreH,m.scoreA]),hist,'prensa no modifica partidos');
const snapshot=JSON.parse(JSON.stringify(s));assert.equal(getPressConference(snapshot,name).session.completed,true,'conferencia se guarda en JSON');
simulateLeagueRound(s);
const again=getPressConference(s,name);assert.equal(again.session.completed,false,'hay conferencia nueva tras otra fecha');assert.notEqual(again.session.signature,r.session.signature);
assert.equal(s.ecosystem.press.length,3,'no se publican notas por abrir conferencia');
const m=s.fixtures.find(x=>played(x)&&x.round===7&&(x.home===name||x.away===name));
assert(m,'J7 simulada');
const actual=pressSnapshot(s,name);assert.equal(actual.last.opponent,m.home===name?m.away:m.home);
// Preguntas para otro país: posiciones y resultados locales reales, no los de Veltrania.
const foreign='Varkosia', foreignName=s.world[foreign].slots.A[0];
const foreignSnapshot=pressSnapshot(s,foreignName);
assert.equal(foreignSnapshot.country,foreign);assert.equal(foreignSnapshot.results.length,5);assert(foreignSnapshot.rank>0);
const firstForeign=getPressConference(s,foreignName);
assert(firstForeign.current?.question);
const countryBefore=firstForeign.session.signature;
simulateCountryRound(s,foreign);
assert.notEqual(getPressConference(s,foreignName).session.signature,countryBefore);
// Situaciones diversas de los clubes: crisis, racha, lesiones, problemas directivos.
const a=structuredClone(s), team=a.teams[name];team.board=20;team.supporters.mood=12;team.players[0].outGames=4;team.players[1].outGames=4;delete a.ecosystem.pressSessions[name];
const topics=getPressConference(a,name).session.questions.map(x=>x.topic);
assert(topics.some(x=>['directiva','hinchada','lesiones'].includes(x)), 'preguntas sensibles al estado del club');
console.log('PRENSA 5.1 OK: rachas/resultado real, tres preguntas, respuestas únicas, efectos, limitación por fecha, JSON, nueva jornada, 9 países.');
