import assert from 'node:assert/strict';
import {matchEditorial} from './match-editorial.js';
import {freshState,simulateLeagueRound} from './engine.js';
const goal=(min,side,p1Name)=>({min,side,p1Name,type:'goal'});
const m=(h,a,events=[],extra={})=>({
 id:'editorial-test',home:'Unión Popular Aurena',away:'Ferroviarios de Ferral',
 competition:'LSV',round:7,played:true,legacy:false,scoreH:h,scoreA:a,
 events,stats:{posH:52,posA:48,shotsH:11,shotsA:9,onH:5,onA:4,xgH:1.7,xgA:1.4},...extra
});
assert.match(matchEditorial(m(3,2,[goal(10,'away','A'),goal(24,'away','B'),goal(40,'home','C'),goal(62,'home','D'),goal(87,'home','D')])).headline,/Remontada/);
assert.match(matchEditorial(m(1,0,[goal(89,'home','Mateo')])).headline,/tardío/);
assert.doesNotMatch(matchEditorial(m(3,0,[goal(1,'home','A'),goal(50,'home','B'),goal(89,'home','C')])).headline,/tardío/);
assert.match(matchEditorial(m(0,0)).headline,/0–0/);
assert.ok(matchEditorial(m(2,0,[goal(10,'home','Enzo'),goal(80,'home','Enzo')])).notes.includes('DOBLETE'));
assert.match(matchEditorial(m(1,1,[goal(11,'home','A'),goal(22,'away','B')],{competition:'CUP',penalties:'5-4'})).headline,/penales/);
assert.ok(matchEditorial(m(1,0,[goal(15,'home','A'),{min:45,type:'red',side:'away',p1Name:'B'}])).notes.includes('EXPULSIÓN'));
const past=matchEditorial(m(1,1,[],{legacy:true,stats:null}));
assert.deepEqual(past.paragraphs,[]);
const state=freshState();
const result=simulateLeagueRound(state);
assert.equal(result.round,7);
for(const match of result.matches){
 const snapshot=JSON.stringify(match),edit=matchEditorial(match);
 assert.ok(edit.headline && edit.lead && Array.isArray(edit.paragraphs));
 assert.equal(JSON.stringify(match),snapshot,'La redacción nunca debe cambiar el partido');
}
assert.equal(state.fixtures.filter(f=>f.legacy&&f.round<=6).length,78);
console.log('✅ Noveria: edición personalizada y resultados históricos verificados');
