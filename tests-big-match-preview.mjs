import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshState,played} from './engine.js';
import {ensureContinent} from './continent.js';
import {fixtureSources} from './live2d.js';
import {calendarMatchReady,ensureCalendar} from './calendar.js';
import {bigMatchImportance,previewEntries,bigMatchDossier} from './big-match-preview.js';
import {COUNTRIES} from './international.js';

const s=ensureContinent(freshState()),ui={previewCountry:'Todos',team:'Unión Popular Aurena'};
const fixture=s.fixtures.find(x=>!played(x));assert.ok(fixture);
fixture.group='final'; // Caso controlado: probar que se detecta un cruce decisivo sin jugarlo.
const entry=fixtureSources(s).find(x=>x.m===fixture);
assert.ok(entry);
ensureCalendar(s); // Preparar el calendario antes de comprobar la inmutabilidad de las previas.
const original=JSON.stringify(s);
const importance=bigMatchImportance(s,entry);
assert.ok(importance.score>=105,'Una final debe recibir cobertura especial');
assert.match(importance.label,/FINAL/);
const confirmed=previewEntries(s,{country:'Todos',limit:80});
assert.ok(confirmed.some(x=>x.m.id===fixture.id),'Debe encontrar una final sin disputar');
assert.ok(confirmed.every(x=>!played(x.m)),'Nunca publicar una previa de un resultado ya registrado');
const country=s.teams[fixture.away].country;
assert.ok(previewEntries(s,{country,limit:80}).some(x=>x.m.id===fixture.id),'Detectar también al club visitante');
const d=bigMatchDossier(s,entry);
assert.equal(d.id,fixture.id);
assert.ok(d.headline.includes(fixture.home)&&d.headline.includes(fixture.away));
assert.ok(d.story.length>=3&&d.h2h&&d.home.formation&&d.away.formation);
assert.equal(d.fixture.played,false,'No simula el partido');
assert.equal(JSON.stringify(s),original,'Las previas no cambian la partida');

const app=readFileSync(new URL('./app.js',import.meta.url),'utf8');
const source=name=>{
 const i=app.indexOf('function '+name+'('),j=app.indexOf('\nfunction ',i+10);
 assert.ok(i>=0&&j>i,'Falta función '+name);
 return app.slice(i,j);
};
const E=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const button=(text,action,attributes='')=>'<button data-action="'+action+'" '+attributes+'>'+text+'</button>';
let modalContent='';
const rendered=new Function('s','ui','COUNTRIES','previewEntries','bigMatchDossier','bigMatchImportance','fixtureSources','calendarMatchReady','played','crest','E','button','head','modal','toast','cycleName',
 source('bigMatchPage')+'\n'+source('openBigMatch')+'\nreturn {bigMatchPage,openBigMatch};')(
 s,ui,COUNTRIES,previewEntries,bigMatchDossier,bigMatchImportance,fixtureSources,calendarMatchReady,played,
 name=>'<i title="'+E(name)+'"></i>',E,button,title=>'<h1>'+E(title)+'</h1>',
 (title,html)=>{modalContent=html},()=>{},()=>s.edition+' '+s.season
);
const html=rendered.bigMatchPage();
assert.match(html,/Grandes previas de Arcalis/);
assert.match(html,/previewCountrySelect/);
assert.ok(html.includes('data-action="big-match-open"'));
assert.ok(html.indexOf('previewCountrySelect')>=0);
assert.equal((html.match(/<option /g)||[]).length,10);
rendered.openBigMatch(fixture.id);
assert.match(modalContent,/EL HERALDO DE NOVERIA/);
assert.ok(modalContent.includes('Cara a cara')&&modalContent.includes('Jugadores a seguir'));
assert.ok(modalContent.includes('VS'));
assert.ok(!modalContent.includes('El encuentro terminó'),'No imprimir resultados inexistentes');
assert.equal(JSON.stringify(s),original,'Abrir la previa no debe cambiar el guardado');
fixture.played=true;fixture.scoreH=3;fixture.scoreA=0;
assert.equal(bigMatchDossier(s,entry),null,'Una vez disputado el partido ya no hay previa');
assert.ok(!previewEntries(s,{limit:80}).some(x=>x.m.id===fixture.id));
console.log('✅ GRANDES PREVIAS: FINAL, PAÍSES, HISTORIAL, PORTADA Y ARTÍCULO');
console.log('✅ SIN SPOILERS NI CAMBIOS DE RESULTADOS, CALENDARIOS O GUARDADOS');
