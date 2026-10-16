import assert from 'node:assert/strict';
import {freshState,STORAGE_KEY,validateImport,played} from './engine.js';
import {readLocal,restoreSave,saveAll,getCheckpoint,SAVE_META_SUFFIX} from './save-system.js';

const memory=new Map();
globalThis.localStorage={
 getItem:k=>memory.has(k)?memory.get(k):null,
 setItem:(k,v)=>memory.set(k,String(v)),
 removeItem:k=>memory.delete(k),
 clear:()=>memory.clear()
};
const valid=x=>{try{validateImport(x);return true}catch{return false}};
const saved=freshState();
const imported=saved.fixtures.filter(m=>['LSV','LPV'].includes(m.competition)&&played(m));
assert.equal(imported.length,78,'Importa 78 partidos históricos');
// Compatibilidad con localStorage V1-V3 sin sobreescribir datos.
localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));
const legacy=await restoreSave(STORAGE_KEY,valid);
assert.equal(legacy.state.fixtures.filter(played).length,78);
assert.equal(legacy.state.leagueRound,6);
const playedNew=freshState();
playedNew.leagueRound=7;
playedNew.managedClub='Unión Popular Aurena';
playedNew.teams['Unión Popular Aurena'].coach='Profesor Guardado';
playedNew.teams['Unión Popular Aurena'].kits[0].sponsor='RECUPERADO';
playedNew.transfers.push({player:'Prueba de persistencia',from:'A',to:'B'});
const result=saveAll(playedNew,STORAGE_KEY);
assert.equal(result.localOK,true);
assert.equal((await result.promise).indexedOK,false,'Fallback seguro sin IndexedDB');
const loaded=await restoreSave(STORAGE_KEY,valid);
assert.equal(loaded.state.leagueRound,7);
assert.equal(loaded.state.teams['Unión Popular Aurena'].coach,'Profesor Guardado');
assert.equal(loaded.state.teams['Unión Popular Aurena'].kits[0].sponsor,'RECUPERADO');
assert.equal(loaded.state.transfers.length,1);
assert.ok(readLocal(STORAGE_KEY,valid)?.savedAt>0);
assert.ok(localStorage.getItem(STORAGE_KEY+SAVE_META_SUFFIX));
localStorage.setItem(STORAGE_KEY,'{JSON-corroto');
assert.equal(await restoreSave(STORAGE_KEY,valid),null,'No restaura partidas corruptas');
await assert.rejects(getCheckpoint(valid),'Sin IndexedDB no se inventa un punto seguro');
console.log('GUARDADO OK: V1-V3, migración, autosave, futbolistas, DT, fichajes, uniformes, y archivo corrupto.');
