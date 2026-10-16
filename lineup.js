/* Noveria 5.11 · Dirección de alineaciones. Todos los IDs vienen del plantel.
   Se almacena en team.lineup: formation, starters[11], bench[7], captain.
   Nunca reordena ni elimina team.players. */
export const FORMATIONS={
 '4-3-3':['POR','LD','DFC','DFC','LI','MCD','MC','MCO','ED','DC','EI'],
 '4-4-2':['POR','LD','DFC','DFC','LI','MD','MC','MC','MI','DC','DC'],
 '4-2-3-1':['POR','LD','DFC','DFC','LI','MCD','MCD','ED','MCO','EI','DC'],
 '3-5-2':['POR','DFC','DFC','DFC','MD','MCD','MC','MCO','MI','DC','DC'],
 '5-3-2':['POR','LD','DFC','DFC','DFC','LI','MC','MCD','MCO','DC','DC']
};
export const FORMATION_OPTIONS=Object.keys(FORMATIONS);
export const FIRST_TEAM=11;
export const BENCH_SIZE=7;
const sid=x=>String(x??'');
const eligible=p=>!p||Number(p.outGames||0)<=0;
export function roleAffinity(role,pos){
 if(role===pos)return 1;
 if(role==='POR'||pos==='POR')return 0;
 const groups=[
 ['LD','LI','DFC'],['MCD','MC','MCO','MP'],['MD','MI','ED','EI'],['DC','ED','EI','MP','MCO']
 ];
 if(groups.some(g=>g.includes(role)&&g.includes(pos)))return .82;
 if(['LD','LI'].includes(role)&&['MD','MI','ED','EI'].includes(pos))return .65;
 if(['ED','EI','MD','MI'].includes(role)&&['MC','MCO','MP'].includes(pos))return .70;
 if(role==='DC'&&['MCO','MP'].includes(pos))return .74;
 return .53;
}
function normalizedIds(team){
 const all=(team?.players||[]).map(p=>sid(p.id)),valid=new Set(all);
 const starts=Array.isArray(team?.lineup?.starters)?team.lineup.starters:[];
 const subs=Array.isArray(team?.lineup?.bench)?team.lineup.bench:[];
 const used=new Set(),order=[];
 for(const id of [...starts,...subs,...all]){
  const key=sid(id);if(valid.has(key)&&!used.has(key)){used.add(key);order.push(key);}
 }
 return order;
}
export function lineupState(team){
 const formation=FORMATION_OPTIONS.includes(team?.lineup?.formation)?team.lineup.formation:FORMATION_OPTIONS.includes(team?.formation)?team.formation:'4-3-3';
 const ids=normalizedIds(team),starters=ids.slice(0,FIRST_TEAM),bench=ids.slice(FIRST_TEAM,FIRST_TEAM+BENCH_SIZE),reserves=ids.slice(FIRST_TEAM+BENCH_SIZE);
 const captain=starters.includes(sid(team?.lineup?.captain))?sid(team.lineup.captain):starters.find(id=>team.players.find(p=>sid(p.id)===id)?.pos!=='POR')||starters[0]||null;
 return {formation,starters,bench,reserves,captain,roles:FORMATIONS[formation]};
}
function commit(team,base){
 team.lineup={formation:base.formation,starters:[...base.starters],bench:[...base.bench],captain:base.captain};
 team.formation=base.formation;
 return lineupState(team);
}
function requireClub(s,name){
 const t=s.teams?.[name];if(!t)throw Error('Club no encontrado');
 if((t.players||[]).length<11)throw Error('El club necesita al menos once futbolistas');
 return t;
}
export function chooseLineup(s,name,area,index,inId){
 const t=requireClub(s,name),L=lineupState(t);
 const lengths={starters:L.starters.length,bench:L.bench.length,reserves:L.reserves.length};
 if(!Object.hasOwn(lengths,area))throw Error('Zona de alineación desconocida');
 const idx=Number(index);if(!Number.isInteger(idx)||idx<0||idx>=lengths[area])throw Error('Puesto inválido');
 const target=sid(inId),all=[...L.starters,...L.bench,...L.reserves];
 if(!all.includes(target))throw Error('El futbolista no pertenece a este plantel');
 const current=area==='starters'?idx:area==='bench'?FIRST_TEAM+idx:FIRST_TEAM+L.bench.length+idx;
 const from=all.indexOf(target);
 [all[current],all[from]]=[all[from],all[current]];
 L.starters=all.slice(0,FIRST_TEAM);
 L.bench=all.slice(FIRST_TEAM,FIRST_TEAM+BENCH_SIZE);
 L.reserves=all.slice(FIRST_TEAM+BENCH_SIZE);
 // El capitán permanece en el once; si lo sacaron, elegimos otro titular.
 if(!L.starters.includes(L.captain))L.captain=L.starters.find(id=>t.players.find(p=>sid(p.id)===id)?.pos!=='POR')||L.starters[0];
 return commit(t,L);
}
export function selectFormation(s,name,value){
 const t=requireClub(s,name),L=lineupState(t);
 if(!FORMATIONS[value])throw Error('Formación no disponible');
 L.formation=value;
 return commit(t,L);
}
export function selectCaptain(s,name,id){
 const t=requireClub(s,name),L=lineupState(t),key=sid(id);
 if(!L.starters.includes(key))throw Error('El capitán debe ser titular');
 L.captain=key;return commit(t,L);
}
export function resetLineup(s,name){
 const t=requireClub(s,name);delete t.lineup;return lineupState(t);
}
export function optimizeLineup(s,name){
 const t=requireClub(s,name),L=lineupState(t),roles=L.roles;
 const pool=[...t.players],picked=[];
 for(const role of roles){
  pool.sort((a,b)=>{
   const score=p=>Number(p.ovr||0)*roleAffinity(role,p.pos)-(eligible(p)?0:50);
   return score(b)-score(a)||String(a.id).localeCompare(String(b.id));
  });
  picked.push(pool.shift());
 }
 const bench=pool.sort((a,b)=>Number(b.ovr||0)-Number(a.ovr||0)).slice(0,BENCH_SIZE);
 const captain=picked.find(p=>p.pos!=='POR')?.id||picked[0].id;
 return commit(t,{...L,starters:picked.map(p=>sid(p.id)),bench:bench.map(p=>sid(p.id)),captain:sid(captain)});
}
export function matchLineup(team){
 const L=lineupState(team),byId=new Map(team.players.map(p=>[sid(p.id),p]));
 const chosen=[],ids=new Set();
 for(const id of [...L.starters,...L.bench,...L.reserves]){
  const p=byId.get(id);if(!p||ids.has(id)||!eligible(p))continue;
  if(chosen.length>=FIRST_TEAM)break;
  ids.add(id);chosen.push(p);
 }
 // Si un futbolista está suspendido y no hay reemplazo sano, vuelve a ser
 // elegible por necesidad como hacía el simulador antes de esta mejora.
 if(chosen.length<FIRST_TEAM)for(const id of [...L.starters,...L.bench,...L.reserves]){
  const p=byId.get(id);if(!p||ids.has(id))continue;
  chosen.push(p);ids.add(id);if(chosen.length===FIRST_TEAM)break;
 }
 const subs=[...L.bench,...L.reserves,...L.starters].map(id=>byId.get(id)).filter(p=>p&&!ids.has(sid(p.id))&&eligible(p)).slice(0,BENCH_SIZE);
 return {formation:L.formation,starters:chosen,bench:subs,captain:chosen.some(p=>sid(p.id)===L.captain)?L.captain:sid(chosen.find(p=>p.pos!=='POR')?.id||chosen[0]?.id)};
}
export function lineupStrength(team,selected=matchLineup(team)){
 const roles=FORMATIONS[selected.formation]||FORMATIONS['4-3-3'];
 let total=0;
 for(let i=0;i<selected.starters.length;i++){
  const p=selected.starters[i];total+=(Number(p.ovr||50))*roleAffinity(roles[i],p.pos);
 }
 return selected.starters.length?total/selected.starters.length:0;
}
