import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {saveAll,readLocal,restoreSave} from './save-system.js';

const app=readFileSync(new URL('./app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const sw=readFileSync(new URL('./service-worker.js',import.meta.url),'utf8');
const fn=name=>{
 const start=app.indexOf('function '+name+'('),end=app.indexOf('\nfunction ',start+12);
 assert.ok(start>=0&&end>start,'Falta '+name);
 return app.slice(start,end);
};
assert.doesNotThrow(()=>new Function(app.replace(/^import\s+.*?;\s*$/gm,'')));
assert.ok(css.includes('content-visibility:auto'));
assert.ok(sw.includes("event.request.destination==='image'"));

// Reutilizar menú lateral y actualizar la página central sin destruir el shell.
const renderSource=fn('render');
const list=renderSource.match(/let pages=\{([^;]+)\};/);
assert.ok(list);
const names=[...list[1].matchAll(/(?:^|,)[\w]+:([\w]+)/g)].map(x=>x[1]);
let fullWrites=0,partialWrites=0;
const main={set innerHTML(html){this.markup=html;partialWrites++;}};
const navButton=target=>({dataset:{target},classList:{toggle(){}}});
const buttons=[navButton('inicio'),navButton('mercado')];
const root={dataset:{},mounted:false,querySelector(){return this.mounted?main:null;},
 querySelectorAll(){return buttons;},
 set innerHTML(html){this.markup=html;this.mounted=true;fullWrites++;},
 get innerHTML(){return this.markup;}};
const ui={page:'inicio',team:'Unión'},state={managedClub:'Unión'};
const values={ui,s:state,menu:[['inicio','◈','Inicio'],['mercado','💰','Mercado']],
 pendingTitleCelebration:[],$:id=>id==='app'?root:{innerHTML:''},
 unreadClubMessages:()=>0,E:x=>String(x),cloudState:{message:'local'},
 saveStatus:{message:'guardado',savedAt:1},readableSaveTime:()=>'',calendarRibbon:()=>'AGENDA',
 frameUpdate:()=>{},championCeremony:()=>{},setTimeout:()=>{},head:()=>'',button:()=>''};
for(const name of names)values[name]=()=>('pantalla-'+ui.page);
const render=new Function(...Object.keys(values),renderSource+';return render;')(...Object.values(values));
render();render();ui.page='mercado';render();
assert.equal(fullWrites,1);
assert.equal(partialWrites,2);
assert.match(main.markup,/pantalla-mercado/);

// El catálogo del mercado es reutilizable hasta que se modifica la partida.
let valuations=0;
const marketState={teams:{A:{name:'A',players:[{id:'a',name:'Alfa',nationality:'V',ovr:70}]},
 B:{name:'B',players:[{id:'b',name:'Beta',nationality:'V',ovr:65}]}}};
const market=new Function('s','marketValuation',
 'let marketCatalogCache=null;\n'+fn('marketCatalog')+'\nreturn marketCatalog;')(
 marketState,p=>{valuations++;return p.ovr*5;});
const c1=market('A'),c2=market('A'),c3=market('B');
assert.strictEqual(c1,c2);
assert.equal(valuations,2);
assert.equal(c3[0].price,350);

// Live 2D evalúa una sola vez por encuentro su disponibilidad.
const liveSource=fn('livePage');
const games=Array.from({length:120},(_,i)=>({country:'Veltrania',m:{
 id:'g'+i,home:'Club '+i,away:'Rival '+i,competition:'LSV',
 round:i%18+1,played:i%3===0,scoreH:1,scoreA:0}}));
let availabilityCalls=0;
const liveValues={s:{broadcast:null},ui:{liveCountry:'Veltrania',liveSearch:''},
 cachedFixtureSources:()=>games,E:x=>String(x??''),FOREIGN_COUNTRIES:['Varkosia'],
 played:m=>m.played,matchIsAvailable:(s,x)=>{availabilityCalls++;return x.m.played||x.m.round===1;},
 head:()=>'',button:()=>'',liveArenaMarkup:()=>'',aggregateBadge:()=>'',findBroadcastFixture:()=>null};
const livePage=new Function(...Object.keys(liveValues),liveSource+';return livePage;')(...Object.values(liveValues));
assert.equal((livePage().match(/class="lv5-game-choice/g)||[]).length,70);
assert.equal(availabilityCalls,120);

// Guardar tres veces seguidas no escribe tres instantáneas obsoletas en IndexedDB.
const storage=new Map();let stored=null,writes=0;
globalThis.localStorage={setItem(k,v){storage.set(k,v)},getItem(k){return storage.get(k)||null}};
const later=f=>Promise.resolve().then(f);
globalThis.indexedDB={open(){
 const request={};
 later(()=>{request.result={objectStoreNames:{contains:()=>true},transaction(){
  const transaction={objectStore(){return {
   put(record){const q={};later(()=>{stored=record;writes++;q.onsuccess?.();transaction.oncomplete?.()});return q;},
   get(){const q={};later(()=>{q.result=stored;q.onsuccess?.();transaction.oncomplete?.()});return q;}
  }}};return transaction;}};request.onsuccess?.();});
 return request;
}};
const attempts=[1,2,3].map(x=>saveAll({version:1,round:x},'perf-sample'));
const outcomes=await Promise.all(attempts.map(x=>x.promise));
assert.equal(readLocal('perf-sample',x=>x.version===1).state.round,3);
assert.equal((await restoreSave('perf-sample',x=>x.version===1)).state.round,3);
assert.equal(stored.state.round,3);
assert.equal(writes,1);
assert.equal(outcomes.filter(r=>r.skipped).length,2);
console.log('✅ Noveria: interfaz incremental, búsqueda cacheada, Live 2D y guardado seguro');
