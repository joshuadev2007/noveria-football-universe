import assert from 'node:assert/strict';
import {freshState,played} from './engine.js';
import {ensureContinent} from './continent.js';
import {standingsForResults} from './round-standings.js';
import {roundTablesHTML} from './round-standings-ui.js';
const s=ensureContinent(freshState());
const set=(m,i)=>{m.played=true;m.scoreH=(i*7)%4;m.scoreA=(i*3)%3;return m;};
const national=s.fixtures.filter(m=>m.round===7);national.forEach(set);
const league=standingsForResults(s,national,{kind:'league'},'Veltrania');
assert.equal(league.length,4,'Deben aparecer A, B, Liga de Plata y anual');
assert.equal(league.filter(p=>p.key.endsWith(':A')||p.key.endsWith(':B')).flatMap(p=>p.rows).filter(r=>r.spot==='advance').length,8);
assert.equal(league.find(p=>p.key.endsWith(':annual')).rows.filter(r=>r.spot==='advance').length,6);
assert.equal(league.find(p=>p.key.endsWith(':annual')).rows.filter(r=>r.spot==='playoff').length,2);
assert.match(roundTablesHTML(s,national,{kind:'league'},'Veltrania'),/Cuartos/);
const allCountries=[];
for(const c of ['Veltrania',...Object.keys(s.world)]){const games=(c==='Veltrania'?s.fixtures:s.world[c].fixtures).filter(m=>m.round===7);games.forEach(set);allCountries.push(...games);}
assert.equal(standingsForResults(s,allCountries,{kind:'league'},'Todos').length,36,'Las nueve federaciones tienen cuatro tablas');
assert.equal(standingsForResults(s,allCountries,{kind:'league'},'Veltrania').length,4);
assert.equal((roundTablesHTML(s,allCountries,{kind:'league'},'Todos').match(/class="rs-country"/g)||[]).length,9);

const cupMatches=s.cup.fixtures.filter(m=>m.round===1);cupMatches.forEach(set);
let cups=standingsForResults(s,cupMatches,{kind:'cup'},'Veltrania');
assert.equal(cups.length,7);
assert.equal(cups.flatMap(p=>p.rows).filter(r=>r.spot==='advance').length,14);
assert.equal(cups.flatMap(p=>p.rows).filter(r=>r.spot==='wildcard').length,2);
assert.ok(cups.flatMap(p=>p.rows).filter(r=>r.spot==='advance').every(r=>!r.confirmed));
for(const m of s.cup.fixtures)set(m,s.cup.fixtures.indexOf(m));
cups=standingsForResults(s,cupMatches,{kind:'cup'},'Veltrania');
assert.ok(cups.flatMap(p=>p.rows).filter(r=>r.spot==='advance').every(r=>r.confirmed));
assert.match(roundTablesHTML(s,cupMatches,{kind:'cup'},'Veltrania'),/Mejor 3.º/);

const countries=['Veltrania',...Object.keys(s.world)],groups=[],games=[];
for(let i=0;i<9;i++){
 const nation=countries[i],names=Object.values(s.teams).filter(t=>t.country===nation).slice(0,5).map(t=>t.name);
 groups.push({id:String.fromCharCode(65+i),teams:names});
 for(let j=0;j<4;j++)games.push(set({id:'test-arcalis-'+i+'-'+j,competition:'ARCALIS',group:groups[i].id,phase:'groups',round:1,home:names[j],away:names[4],played:false},j));
}
s.international={season:s.season,edition:'Apertura',champions:{id:'champions',name:'Campeones',phase:'groups',round:2,groups,fixtures:games},horizonte:{id:'horizonte',name:'Horizonte',phase:'groups',round:1,groups:[],fixtures:[]}};
const continental=standingsForResults(s,games,{kind:'international'},'Todos');
assert.equal(continental.length,9);
assert.equal(continental.flatMap(p=>p.rows).filter(r=>r.spot==='advance').length,9);
assert.equal(continental.flatMap(p=>p.rows).filter(r=>r.spot==='wildcard').length,7);
assert.equal(standingsForResults(s,games,{kind:'international'},'Veltrania').length,1);
assert.ok(roundTablesHTML(s,games,{kind:'international'},'Veltrania').includes('Campeones'));

const ko=[set({id:'k1',competition:'ARCALIS',phase:'knockout',group:'KO',round:8,home:groups[0].teams[0],away:groups[1].teams[0],winner:groups[0].teams[0]},0),set({id:'k2',competition:'ARCALIS',phase:'knockout',group:'KO',round:9,home:groups[0].teams[0],away:groups[2].teams[0],winner:groups[2].teams[0]},1)];
s.international.champions.fixtures.push(...ko);
const after=standingsForResults(s,ko,{kind:'international'},'Todos');
const knock=after.find(p=>p.competition==='knockout');
assert.ok(knock);
assert.equal(knock.rows.length,2,'Solo la última ronda eliminatoria');
assert.deepEqual(knock.rows.filter(r=>r.spot==='advance').map(r=>r.name),[groups[2].teams[0]]);
console.log('✅ Tablas posjornada: ligas 9 países, siete grupos de Copa, mejores terceros, Arcalis y eliminatorias');
