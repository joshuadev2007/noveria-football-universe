/**
 * NOVERIA — Guardado local resiliente.
 * GitHub Pages es estático: no se afirma sincronización remota.
 * Capa 1: localStorage compatible con las partidas V1/V2/V3.
 * Capa 2: IndexedDB (mejor capacidad y un punto de recuperación).
 */
export const SAVE_DB_NAME='noveria-football-saves';
export const SAVE_STORE='partidas';
export const SAVE_META_SUFFIX='-meta-v4';
let databasePromise=null;
let writeQueue=Promise.resolve();

function db(){
 if(typeof indexedDB==='undefined')return Promise.reject(Error('IndexedDB no está disponible'));
 if(!databasePromise){
  databasePromise=new Promise((resolve,reject)=>{
   let req;
   try{req=indexedDB.open(SAVE_DB_NAME,1)}catch(err){reject(err);return}
   req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(SAVE_STORE))d.createObjectStore(SAVE_STORE,{keyPath:'slot'})};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||Error('Error al abrir base local'));
   req.onblocked=()=>reject(Error('Cerrá otras pestañas de Noveria para actualizar su base local'));
  }).catch(err=>{databasePromise=null;throw err});
 }
 return databasePromise;
}
function transactionRecord(slot,record){return db().then(database=>new Promise((resolve,reject)=>{
 const transaction=database.transaction(SAVE_STORE,record?'readwrite':'readonly');
 const req=record?transaction.objectStore(SAVE_STORE).put(record):transaction.objectStore(SAVE_STORE).get(slot);
 let output=null;
 req.onsuccess=()=>{output=req.result||null};
 req.onerror=()=>reject(req.error||Error('Error en almacenamiento local'));
 transaction.oncomplete=()=>resolve(output);
 transaction.onerror=()=>reject(transaction.error||Error('No se pudo completar el guardado'));
 transaction.onabort=()=>reject(transaction.error||Error('Se canceló el guardado'));
}));}
function valid(value,validator){try{return !!value&&validator(value)}catch{return false}}
function meta(storageKey){try{return JSON.parse(localStorage.getItem(storageKey+SAVE_META_SUFFIX)||'null')}catch{return null}}
/** Es compatible con el valor JSON plano que ya escribía persist(state) en engine.js. */
export function readLocal(storageKey,validator){
 try{
  const raw=localStorage.getItem(storageKey);
  if(!raw)return null;
  const state=JSON.parse(raw);
  if(!valid(state,validator))return null;
  return {state,savedAt:Number(meta(storageKey)?.savedAt)||0,source:'localStorage'};
 }catch{return null}
}
export async function restoreSave(storageKey,validator){
 const local=readLocal(storageKey,validator);
 let indexed=null;
 try{
  const entry=await transactionRecord('actual');
  if(entry&&valid(entry.state,validator))indexed={state:entry.state,savedAt:Number(entry.savedAt)||0,source:'IndexedDB'};
 }catch{}
 // Nunca sustituir una partida local más reciente por una copia obsoleta.
 if(local&&indexed)return local.savedAt>=indexed.savedAt?local:indexed;
 return indexed||local;
}
export function saveAll(state,storageKey){
 const savedAt=Date.now();
 const serial=JSON.stringify(state);
 let localOK=false;
 try{
  localStorage.setItem(storageKey,serial);
  localStorage.setItem(storageKey+SAVE_META_SUFFIX,JSON.stringify({savedAt,format:4}));
  localOK=true;
 }catch{}
 // Capturamos instantánea; el estado mutable de la aplicación nunca entra directo al IDB.
 const snapshot=typeof structuredClone==='function'?structuredClone(state):JSON.parse(serial);
 const operation=()=>transactionRecord('actual',{slot:'actual',savedAt,state:snapshot,format:4})
  .then(()=>({savedAt,localOK,indexedOK:true}))
  .catch(error=>({savedAt,localOK,indexedOK:false,error:String(error)}));
 const promise=writeQueue.then(operation,operation);
 writeQueue=promise.then(()=>undefined,()=>undefined);
 return {savedAt,localOK,promise};
}
export async function createCheckpoint(state){
 await writeQueue;
 const savedAt=Date.now();
 const snapshot=typeof structuredClone==='function'?structuredClone(state):JSON.parse(JSON.stringify(state));
 await transactionRecord('seguro',{slot:'seguro',savedAt,state:snapshot,format:4});
 return savedAt;
}
export async function getCheckpoint(validator){
 await writeQueue;
 const record=await transactionRecord('seguro');
 if(record&&valid(record.state,validator))return record;
 return null;
}
export async function protectStorage(){
 if(typeof navigator==='undefined'||!navigator.storage?.persist)return {available:false,granted:false};
 const granted=await navigator.storage.persist();
 return {available:true,granted};
}
export function readableSaveTime(timestamp){
 if(!timestamp)return 'Sin guardado verificado';
 try{return new Date(timestamp).toLocaleString('es-CR',{dateStyle:'short',timeStyle:'short'})}catch{return 'Recientemente'}
}
