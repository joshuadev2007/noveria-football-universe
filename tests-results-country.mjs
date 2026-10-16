import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FOREIGN_COUNTRIES} from './data.js';
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8');
const COUNTRIES=['Veltrania',...FOREIGN_COUNTRIES];
const body=name=>{const a=source.indexOf('function '+name+'('),b=source.indexOf('\nfunction ',a+11);assert.ok(a>=0&&b>a,'Falta '+name);return source.slice(a,b);};
const ui={report:null,reportCountry:'Todos',reportLimit:24};
const s={settings:{resultsCountry:'Todos'},season:2027,teams:{
 Aurena:{country:'Veltrania'},Ferral:{country:'Veltrania'},
 Ravik:{country:COUNTRIES[1]},Sol:{country:COUNTRIES[2]}}};
const matches=[
 {id:'m1',home:'Aurena',away:'Ferral',played:true,scoreH:2,scoreA:0,competition:'LSV'},
 {id:'m2',home:'Ravik',away:'Sol',played:true,scoreH:1,scoreA:1,competition:'ARCALIS'},
 {id:'m3',home:'Sol',away:'Aurena',played:true,scoreH:0,scoreA:3,competition:'ARCALIS'}
];
const E=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const button=(text,action,attrs='')=>'<button data-action="'+action+'" '+attrs+'>'+text+'</button>';
const render=new Function('ui','s','COUNTRIES','E','button','lookupMatch','played','leagueSummary','rndLabel','head','stat','matchEditorial','reportItem',
 body('resultsCountryPicker')+'\n'+body('resultsPage')+'\nreturn resultsPage;')(
 ui,s,COUNTRIES,E,button,id=>matches.find(m=>m.id===id),m=>m.played,()=>({round:1}),()=>'',a=>'<h1>'+a+'</h1>',
 (a,b)=>'<div data-stat="'+a+'">'+b+'</div>',m=>({headline:'Noticia '+m.id,lead:'Historia '+m.id}),m=>'<article data-match="'+m.id+'"></article>');
const cards=country=>{ui.reportCountry=country;const html=render();const actual=[...html.matchAll(/data-match="([^"]+)"/g)].map(x=>x[1]);
 assert.ok(html.includes('id="reportCountrySelect"'),'El filtro debe aparecer en los resultados');
 assert.ok(html.indexOf('id="reportCountrySelect"')<html.indexOf('report-hero'),'El filtro debe estar arriba de los marcadores');
 assert.equal((html.match(/<option /g)||[]).length,10,'Todos y los nueve países');
 return actual;};
ui.report={ids:matches.map(x=>x.id),comp:'Fecha'};
assert.deepEqual(cards('Todos'),['m1','m2','m3']);
assert.deepEqual(cards('Veltrania'),['m1','m3'],'Se incluyen visitantes continentales');
assert.deepEqual(cards(COUNTRIES[1]),['m2']);
assert.deepEqual(cards(COUNTRIES[2]),['m2','m3']);
assert.deepEqual(cards(COUNTRIES[3]),[]);
let saved=0;const saveCountry=new Function('ui','s','COUNTRIES','save','render',
 body('saveResultsCountry')+'\nreturn saveResultsCountry;')(ui,s,COUNTRIES,()=>saved++,()=>{});
saveCountry(COUNTRIES[2]);assert.equal(s.settings.resultsCountry,COUNTRIES[2]);assert.equal(saved,1);
const report=new Function('ui','s','COUNTRIES','nav',body('reportResults')+'\nreturn reportResults;')(ui,s,COUNTRIES,()=>{});
report(null,'Otra fecha',matches.map(x=>x.id));assert.equal(ui.reportCountry,COUNTRIES[2]);
saveCountry('Todos');report(null,'Una más',matches.map(x=>x.id));assert.equal(ui.reportCountry,'Todos');
assert.ok(source.includes("resultsCountryPicker('calendarResultCountrySelect',ui.reportCountry)"));
assert.ok(source.includes("el.id==='calendarResultCountrySelect'"));
console.log('✅ Filtro de 9 países y TODOS · antes y después de simular · local/visitante · guardado');
