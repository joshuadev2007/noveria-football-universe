/* NOVERIA 5.10 · Dirección deportiva Sub-20.
 * Ojeadores internacionales + experiencia de partido ligada al OVR.
 * No depende del motor ni modifica resultados ya disputados.
 */
import {FOREIGN_COUNTRIES} from './data.js';
const COUNTRIES=['Veltrania',...FOREIGN_COUNTRIES];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function hash(v){let h=2166136261;for(const c of String(v))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
const first=['Mateo','Lucas','Gabriel','Thiago','Oliver','Bruno','Diego','Santiago','Iván','Darío','Noah','Enzo','Joel','Adrián','Leandro','Axel','Nico','Elías','Leonardo','Rafael','Iker','Emanuel','Gael','Julián'];
const last=['Rojas','Salcedo','Ledesma','Navarro','Vega','Vargas','Rivera','Alvar','Soria','Quiroga','Valcera','Arce','Gómez','Ferrán','Román','Duarte','Herrera','Beltrán','Campos','Palacios','Mejía','Cárdenas'];
const positions=['POR','DFC','LD','LI','MCD','MC','MCO','ED','EI','DC'];
const cycle=s=>s.season+'-'+(s.edition||'Apertura');
export function ensureYouthScouting(s){
 s.ecosystem??={};s.ecosystem.youthScouting??={missions:[],counter:0,seenEvents:[],logs:[]};
 const o=s.ecosystem.youthScouting;
 o.missions??=[];o.logs??=[];o.seenEvents??=[];o.counter??=0;
 return o;
}
export function youthDevelopment(p){
 p.growth??={xp:0,total:0,history:[],trainingCycle:null,trainingUsed:0,friendliesCycle:null,friendliesUsed:0};
 const g=p.growth;g.history??=[];g.xp??=0;g.total??=0;
 return g;
}
function xpLimit(p){return 11+Math.max(0,Math.floor((Number(p.ovr)-45)/6))*4;}
function gainXP(s,p,amount,reason,key){
 const g=youthDevelopment(p);
 if(g.history.some(x=>x.key===key))return 0;
 const prior=p.ovr;
 g.xp+=Math.max(0,Number(amount)||0);
 const academy=Number(s.teams[p.academyClub]?.facility?.academy||1);
 let max=2;
 while(max-->0&&g.xp>=xpLimit(p)&&p.ovr<p.pot){
  g.xp-=xpLimit(p);p.ovr++;g.total++;
 }
 if(p.ovr>=p.pot)g.xp=Math.min(g.xp,xpLimit(p)-1);
 g.history.push({key,reason,xp:amount,gained:p.ovr-prior,ovr:p.ovr});
 if(g.history.length>65)g.history.splice(0,g.history.length-65);
 return p.ovr-prior;
}
export function youthTrainingSession(s,name){
 const t=s.teams[name];if(!t)throw Error('Club desconocido');
 const squad=t.youth||[];if(!squad.length)throw Error('Primero necesitás promesas juveniles');
 const used=Number(t.youthTraining?.cycle===cycle(s)?t.youthTraining.count:0);
 if(used>=8)throw Error('Ya realizaste los 8 entrenamientos disponibles en esta edición. Jugá partidos para seguir creciendo.');
 if(t.budget<.10)throw Error('Presupuesto insuficiente para entrenar (0,10 M VLR)');
 const n=used+1,report=[];
 for(const p of squad){
  p.academyClub??=name;
  const score=hash(cycle(s)+'-training-'+n+'-'+p.id)%5;
  const xp=2+score+Number(t.facility?.academy||1);
  const before=p.ovr;
  gainXP(s,p,xp,'Entrenamiento',cycle(s)+':train:'+n+':'+p.id);
  report.push({id:p.id,name:p.name,old:before,ovr:p.ovr,xp,gained:p.ovr-before});
 }
 t.youthTraining={cycle:cycle(s),count:n};t.youthSessions=(t.youthSessions||0)+1;
 t.budget=+(t.budget-.10).toFixed(3);
 return report;
}
export function youthMatchDevelopment(s,fixture,homeSquad,awaySquad,{friendly=false}={}){
 const results={};
 for(const side of ['home','away']){
  const name=fixture[side],t=s.teams[name];if(!t)continue;
  const squad=side==='home'?homeSquad:awaySquad;
  const goals=side==='home'?fixture.scoreH:fixture.scoreA;
  const conceded=side==='home'?fixture.scoreA:fixture.scoreH;
  const index=squad.slice(0,11),players=[];
  const scope=t.youthFriendlyGrowth?.cycle===cycle(s)?t.youthFriendlyGrowth.count:0;
  const eligible=!friendly||scope<4;
  let remaining=goals;
  const credited=new Map();
  for(let g=0;g<goals&&index.length;g++){
   const p=index[hash(fixture.id+side+'goal'+g)%index.length];credited.set(p.id,(credited.get(p.id)||0)+1);
  }
  const assisted=new Map();
  for(let g=0;g<goals&&index.length>1;g++){
   const candidate=index[hash(fixture.id+side+'assist'+g)%index.length];
   if((hash(fixture.id+side+'given'+g)%100)<63)assisted.set(candidate.id,(assisted.get(candidate.id)||0)+1);
  }
  for(const p of index){
   p.academyClub??=name;const goalsBy=credited.get(p.id)||0,assistsBy=assisted.get(p.id)||0;
   const quality=((hash(fixture.id+':rating:'+p.id)%25)-12)/10;
   const rating=+clamp(6.2+(goals-conceded)*.21+goalsBy*.55+assistsBy*.32+quality*.38,4.4,9.8).toFixed(1);
   const before=p.ovr;
   const xp=eligible?Math.max(1,Math.round(2+(rating-6.0)*2.2+goalsBy*2+assistsBy+(goals>conceded?1:0))):0;
   if(eligible)gainXP(s,p,xp,friendly?'Amistoso Sub-20':'Liga Sub-20',fixture.id+':'+p.id);
   p.apps=(p.apps||0)+1;p.goals=(p.goals||0)+goalsBy;p.assists=(p.assists||0)+assistsBy;
   p.form=+((Number(p.form||6.5)*Math.max(0,p.apps-1)+rating)/p.apps).toFixed(2);
   players.push({id:p.id,name:p.name,ovrBefore:before,ovr:p.ovr,rating,goals:goalsBy,assists:assistsBy,xp,improved:p.ovr-before});
  }
  if(friendly){t.youthFriendlyGrowth={cycle:cycle(s),count:scope+1};}
  results[side]=players;
 }
 fixture.youthRatings=results;
 return results;
}
export function seniorYouthDevelopment(s,match){
 if(!match?.played||!match.lineups)return [];
 const evolved=[];
 for(const side of ['home','away']){
  const clubName=match[side],t=s.teams[clubName];
  if(!t)continue;
  for(const id of match.lineups[side]||[]){
   const p=t.players.find(p=>String(p.id)===String(id));if(!p?.academyGraduate)continue;
   p.academyClub??=clubName;
   const goals=(match.events||[]).filter(e=>e.type==='goal'&&String(e.p1)===String(p.id)).length;
   const assists=(match.events||[]).filter(e=>e.type==='goal'&&String(e.p2)===String(p.id)).length;
   const result=(side==='home'?match.scoreH-match.scoreA:match.scoreA-match.scoreH);
   const rating=Number(p.form||6.5);
   const amount=clamp(Math.round(3+Math.max(-1,rating-6)*2+goals*3+assists*2+(result>0?1:0)),1,17);
   const old=p.ovr,gained=gainXP(s,p,amount,'Primer equipo',match.id+':senior:'+p.id);
   if(gained)evolved.push({name:p.name,old,ovr:p.ovr});
  }
 }
 return evolved;
}
function youthReport(s,mission){
 const t=s.teams[mission.club],level=Number(t?.facility?.scouting||1);
 return Array.from({length:3+Math.min(3,level)},(_,i)=>{
  const base=mission.id+':'+i,seed=hash(base),age=15+(seed%5),pos=positions[(seed>>>5)%positions.length];
  const ovr=clamp(43+(seed>>>9)%24+Math.floor(level/2),43,72);
  const pot=clamp(Math.max(ovr+10,68+(seed>>>14)%29+Math.floor(level/2)),70,98);
  return {id:'scout-'+hash(base+'-player'),name:first[(seed>>>2)%first.length]+' '+last[(seed>>>7)%last.length],
   age,pos,nationality:mission.country,ovr,pot,form:6.5,apps:0,goals:0,assists:0,
   value:100+seed%520,salary:25+(seed>>>18)%50,contractYears:3,
   fee:+(0.07+(pot-65)*.009+(ovr-43)*.004).toFixed(3),
   status:'available',style:['Técnico','Velocidad','Potencia','Visión','Orden táctico'][seed%5],
   scoutingId:mission.id,academyGraduate:false};
 });
}
export function scoutingMissions(s,club){return ensureYouthScouting(s).missions.filter(m=>m.club===club);}
export function sendYouthScout(s,club,country){
 const t=s.teams[club];if(!t)throw Error('Club no encontrado');
 if(!COUNTRIES.includes(country)||country===t.country)throw Error('Elegí otro país de Arcalis para explorar');
 const scouting=ensureYouthScouting(s),active=scouting.missions.filter(m=>m.club===club&&m.status==='travel');
 const level=Number(t.facility?.scouting||1);
 if(active.length>=(level>=4?3:2))throw Error('Todos los ojeadores están ocupados. Esperá el próximo informe');
 const cost=+(0.19-level*.015).toFixed(3);
 if(t.budget<cost)throw Error('Presupuesto insuficiente para enviar un ojeador ('+cost+' M VLR)');
 const id='mis-'+cycle(s)+'-'+hash(club)+'-'+(++scouting.counter),wait=Math.max(1,3-Math.floor(level/2));
 const mission={id,club,country,cost,status:'travel',stepsRemaining:wait,created:cycle(s),candidates:[]};
 scouting.missions.unshift(mission);t.budget=+(t.budget-cost).toFixed(3);
 if(scouting.missions.length>130)scouting.missions=scouting.missions.filter(m=>m.status==='travel').concat(scouting.missions.filter(m=>m.status!=='travel').slice(0,100));
 return mission;
}
export function advanceYouthScouting(s,eventId){
 const scouting=ensureYouthScouting(s),key=String(eventId);
 if(scouting.seenEvents.includes(key))return [];
 const completed=[];for(const mission of scouting.missions){
  if(mission.status!=='travel')continue;
  mission.stepsRemaining=Math.max(0,mission.stepsRemaining-1);
  if(!mission.stepsRemaining){
   mission.status='ready';mission.candidates=youthReport(s,mission);mission.finished=cycle(s);
   completed.push(mission);s.news??=[];s.news.unshift({id:'youth-scout-'+mission.id,category:'Cantera',title:'🌍 Informe de juveniles desde '+mission.country,description:'El ojeador de '+mission.club+' encontró '+mission.candidates.length+' talentos. Revisá el informe de cantera.',date:cycle(s),relatedClub:mission.club});
  }
 }
 scouting.seenEvents.push(key);if(scouting.seenEvents.length>210)scouting.seenEvents.splice(0,scouting.seenEvents.length-210);
 return completed;
}
export function signYouthCandidate(s,club,id){
 const t=s.teams[club];if(!t)throw Error('Club no encontrado');
 const missions=scoutingMissions(s,club);
 const mission=missions.find(m=>m.status==='ready'&&m.candidates.some(p=>p.id===id));
 if(!mission)throw Error('El informe no contiene esta promesa disponible');
 const p=mission.candidates.find(p=>p.id===id);
 if(p.status!=='available')throw Error('Esta promesa ya fue fichada');
 t.youth??=[];if(t.youth.length>=22)throw Error('Academia completa (22 juveniles). Ascendé o liberá espacio');
 if(t.budget<p.fee)throw Error('Presupuesto insuficiente para incorporar esta promesa');
 if(Object.values(s.teams).some(team=>(team.youth||[]).some(x=>x.id===p.id)||(team.players||[]).some(x=>x.id===p.id)))throw Error('Este jugador ya pertenece a un club');
 const next={...p,status:undefined,fee:undefined,scoutingId:undefined,academyClub:club,scoutedFrom:mission.country,number:31+t.youth.length,academyGraduate:false};
 delete next.status;delete next.fee;delete next.scoutingId;
 youthDevelopment(next);t.youth.push(next);p.status='signed';t.budget=+(t.budget-p.fee).toFixed(3);
 s.news??=[];s.news.unshift({id:'youth-sign-'+p.id,category:'Cantera',title:'🌟 '+p.name+' ficha por la cantera de '+club,description:'El joven de '+mission.country+' llega con OVR '+p.ovr+' y potencial '+p.pot+'.',date:cycle(s),relatedClub:club});
 return next;
}

/** Ubica a un canterano ascendido dentro del once del simulador.
 * La simulación toma los primeros 11 jugadores como titulares.
 */
export function startYouthGraduate(s,club,id){
 const t=s.teams[club];if(!t)throw Error('Club desconocido');
 const i=t.players.findIndex(p=>String(p.id)===String(id));
 if(i<0||!t.players[i]?.academyGraduate)throw Error('Solo podés dar titularidad a canteranos ascendidos');
 if(i<11)return t.players[i];
 const p=t.players[i],similar=t.players.slice(0,11).findIndex(q=>q.pos===p.pos);
 const slot=similar>=0?similar:10;
 [t.players[slot],t.players[i]]=[t.players[i],t.players[slot]];
 return t.players[slot];
}

export function youthProgress(p){
 const growth=youthDevelopment(p),limit=xpLimit(p);
 return {xp:growth.xp,needed:limit,percent:clamp(Math.round(growth.xp/limit*100),0,100),up:growth.total||0};
}
