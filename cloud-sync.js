import {SUPABASE_URL,SUPABASE_ANON_KEY} from './cloud-config.js';
/**
 * Sincronización remota Supabase Auth + REST/PostgREST.
 * Seguridad: RLS por auth.uid(); RPC atómica por revisión esperada.
 * Sin dependencias de CDN, apto para GitHub Pages, navegador y PWA.
 */
const CONFIG_KEY='noveria-cloud-public-config-v1';
const SESSION_KEY='noveria-cloud-auth-session-v1';
const BASELINE_KEY='noveria-cloud-baseline-v1';
let session=null, config=null;
const json=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
function normalizeURL(value){return String(value||'').trim().replace(/\/+$/,'')}
export function cloudConfig(){
 const stored=json(CONFIG_KEY)||{};
 return {url:normalizeURL(SUPABASE_URL||stored.url),anonKey:String(SUPABASE_ANON_KEY||stored.anonKey||'').trim()};
}
export function cloudConfigured(){const c=cloudConfig();return /^https:\/\/[a-z0-9.-]+\.supabase\.co$/i.test(c.url)&&c.anonKey.length>20}
export function cloudConfigure(url,anonKey){
 const u=normalizeURL(url),key=String(anonKey||'').trim();
 if(!/^https:\/\/[a-z0-9.-]+\.supabase\.co$/i.test(u))throw Error('La URL debe ser https://TU-PROYECTO.supabase.co');
 if(key.length<20||/service_role|sb_secret_/i.test(key))throw Error('Usá solamente la anon key o la publishable key pública, nunca una clave secreta.');
 if(key.split('.').length===3){try{const payload=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(payload.role==='service_role')throw Error('No se puede usar service_role: es una clave secreta.');}catch(error){if(error.message?.includes('service_role'))throw error;}}
 const before=cloudConfig();if(before.url!==u||before.anonKey!==key){localStorage.removeItem(SESSION_KEY);localStorage.removeItem(BASELINE_KEY);session=null;}
 localStorage.setItem(CONFIG_KEY,JSON.stringify({url:u,anonKey:key}));config=null;return cloudConfig();
}
function activeConfig(){const c=cloudConfig();if(!cloudConfigured())throw Error('Configurá la URL y la clave pública de Supabase.');return c}
function errorMessage(data,response){return data?.msg||data?.message||data?.error_description||data?.error||`Respuesta HTTP ${response.status}`}
async function request(path,{method='GET',body,auth=false,prefer,signal}={}){
 const c=activeConfig();
 if(auth)await ensureSession();
 const headers={'apikey':c.anonKey,'Accept':'application/json'};
 if(body!==undefined)headers['Content-Type']='application/json';
 if(auth){if(!session?.access_token)throw Error('Ingresá con tu cuenta de Noveria.');headers.Authorization=`Bearer ${session.access_token}`}
 if(prefer)headers.Prefer=prefer;
 const controller=signal?null:new AbortController();const timer=controller?setTimeout(()=>controller.abort(),25000):null;
 let response;
 try{response=await fetch(c.url+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:signal||controller.signal,cache:'no-store'})}
 catch(e){throw Error(e?.name==='AbortError'?'El servidor no respondió. Revisá tu conexión.':'No se pudo conectar a Supabase. Comprobá URL, clave e internet.')}
 finally{if(timer)clearTimeout(timer)}
 let data=null;try{const str=await response.text();if(str)data=JSON.parse(str)}catch{}
 if(!response.ok){const err=Error(errorMessage(data,response));err.status=response.status;err.details=data;throw err}
 return data;
}
function rememberAuth(auth){if(!auth?.access_token||!auth?.refresh_token||!auth?.user?.id)throw Error('Sesión inválida.');session={access_token:auth.access_token,refresh_token:auth.refresh_token,user:auth.user,expires_at:Math.floor(Date.now()/1000)+Number(auth.expires_in||3600)};localStorage.setItem(SESSION_KEY,JSON.stringify({...session,url:cloudConfig().url}));return session.user}
async function refreshSession(){
 if(!session?.refresh_token)throw Error('Sesión expirada. Ingresá otra vez.');
 const c=activeConfig();const data=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});return rememberAuth(data);
}
async function ensureSession(){
 if(!session){const old=json(SESSION_KEY);if(old?.url===cloudConfig().url)session=old;}
 if(!session)return null;
 if(Number(session.expires_at||0)<Math.floor(Date.now()/1000)+90)await refreshSession();
 return session.user;
}
export async function cloudInitialize(){if(!cloudConfigured())return null;try{return await ensureSession()}catch(error){if(error.status===400||error.status===401||error.status===403){session=null;localStorage.removeItem(SESSION_KEY)}return null}}
export function cloudUser(){return session?.user||null}
/** Ingreso sin contraseña: GoTrue manda un código OTP al correo. */
export async function cloudSendEmailCode(email){
 const clean=String(email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean))throw Error('Escribí un correo válido.');
 const redirectTo=(typeof location!=='undefined'&&/^https?:$/.test(location.protocol))?location.origin+location.pathname:'';
 const endpoint='/auth/v1/otp'+(redirectTo?'?redirect_to='+encodeURIComponent(redirectTo):'');
 await request(endpoint,{method:'POST',body:{email:clean,create_user:true}});
 return clean;
}
/** Verificación del código recibido: devuelve la misma cuenta Auth usada por las otras apps. */
export async function cloudVerifyEmailCode(email,token){
 const clean=String(email||'').trim().toLowerCase();
 const code=String(token||'').trim();
 if(!/^[0-9]{6,8}$/.test(code))throw Error('Ingresá el código numérico recibido en el correo.');
 const data=await request('/auth/v1/verify',{method:'POST',body:{email:clean,token:code,type:'email'}});
 return rememberAuth(data);
}
/** Abre también correos que traen enlace mágico, sin modificar las plantillas de Joshua Cloud.
 * Para que funcione: agregar la URL de Noveria a Auth -> URL Configuration -> Redirect URLs. */
export async function cloudFinishEmailLink(){
 if(typeof location==='undefined'||!location.hash||!location.hash.includes('access_token='))return null;
 const values=new URLSearchParams(location.hash.replace(/^#/,''));
 const access_token=values.get('access_token'),refresh_token=values.get('refresh_token');
 if(!access_token||!refresh_token)return null;
 const c=activeConfig();
 const response=await fetch(c.url+'/auth/v1/user',{headers:{apikey:c.anonKey,Authorization:'Bearer '+access_token},cache:'no-store'});
 if(!response.ok)throw Error('El enlace de acceso venció. Pedí uno nuevo.');
 const user=await response.json();
 const account=rememberAuth({access_token,refresh_token,expires_in:Number(values.get('expires_in')||3600),user});
 if(typeof history!=='undefined'&&typeof history.replaceState==='function')history.replaceState(null,'',location.pathname+location.search+'#nube');
 return account;
}
export async function cloudSignIn(email,password){const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:String(email).trim(),password}});return rememberAuth(data)}
export async function cloudSignUp(email,password){const data=await request('/auth/v1/signup',{method:'POST',body:{email:String(email).trim(),password}});if(data?.access_token&&data?.refresh_token)return {user:rememberAuth(data),confirm:false};return {user:data?.user||null,confirm:true}}
export async function cloudSignOut(){if(session){try{await request('/auth/v1/logout',{method:'POST',auth:true})}catch{}}session=null;localStorage.removeItem(SESSION_KEY);localStorage.removeItem(BASELINE_KEY)}
export async function cloudRead(){await ensureSession();if(!session?.user?.id)throw Error('Tenés que iniciar sesión.');const rows=await request('/rest/v1/noveria_saves?select=game_state,revision,updated_at&limit=1',{auth:true});if(!Array.isArray(rows))throw Error('Respuesta de guardado inválida.');return rows[0]?{state:rows[0].game_state,revision:Number(rows[0].revision),updatedAt:rows[0].updated_at}:null}
export async function cloudWrite(state,expectedRevision){await ensureSession();if(!session?.user?.id)throw Error('Tenés que iniciar sesión.');try{const rows=await request('/rest/v1/rpc/save_noveria_game',{method:'POST',auth:true,body:{p_state:state,p_expected_revision:Number(expectedRevision)}});const row=Array.isArray(rows)?rows[0]:rows;if(!row||!Number.isInteger(Number(row.revision)))throw Error('Supabase no devolvió el número de revisión.');return {revision:Number(row.revision),updatedAt:row.updated_at}}
 catch(e){if(e.status===409||e.details?.code==='40001'||/conflicto|conflict|stale/i.test(e.message))e.conflict=true;throw e}}
/** Huella local rápida, no criptográfica. Solo sirve para detectar si hubo cambios; el servidor usa revisión atómica. */
export function cloudHash(state){const str=JSON.stringify(state);let h=2166136261;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),16777619)}return (h>>>0).toString(16)+'-'+str.length}
export function cloudBaseline(){const b=json(BASELINE_KEY);return b&&b.userId===session?.user?.id&&b.url===cloudConfig().url?b:null}
export function cloudMarkBaseline(revision,state){if(!session?.user?.id)throw Error('Sin cuenta');const b={userId:session.user.id,url:cloudConfig().url,revision:Number(revision),hash:cloudHash(state),markedAt:Date.now()};localStorage.setItem(BASELINE_KEY,JSON.stringify(b));return b}
