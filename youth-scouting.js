/* NOVERIA 5.10 · Dirección deportiva Sub-20.
 * Ojeadores internacionales + experiencia de partido ligada al OVR.
 * No depende del motor ni modifica resultados ya disputados.
 */
import {FOREIGN_COUNTRIES} from './data.js';
import {lineupState,chooseLineup,roleAffinity} from './lineup.js';
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
   if(!friendly){p.youthForm??={streak:0,annualBoost:{}};p.youthForm.streak=rating>=7.15?p.youthForm.streak+1:Math.max(0,p.youthForm.streak-1);
    const slot=cycle(s);if(p.youthForm.streak>=5&&Number(p.youthForm.annualBoost[slot]||0)<2&&p.pot<99){p.pot++;p.youthForm.annualBoost[slot]=(p.youthForm.annualBoost[slot]||0)+1;p.youthForm.streak=0;}}
   p.apps=(p.apps||0)+1;p.goals=(p.goals||0)+goalsBy;p.assists=(p.assists||0)+assistsBy;
   p.form=+((Number(p.form||6.5)*Math.max(0,p.apps-1)+rating)/p.apps).toFixed(2);
   players.push({id:p.id,name:p.name,ovrBefore:before,ovr:p.ovr,rating,goals:goalsBy,assists:assistsBy,xp,improved:p.ovr-before});
  }
  if(friendly){t.youthFriendlyGrowth={cycle:cycle(s),count:scope+1};}
  // Guardar solo las 3 mejores actuaciones para reducir el tamaño de la partida.
  // Las estadísticas y toda la experiencia sí quedan en cada jugador.
  results[side]=players.sort((a,b)=>b.rating-a.rating||b.goals-a.goals).slice(0,3);
 }
 fixture.youthRatings=results;
 return results;
}
/**
 * Progresión de todos los jugadores del primer equipo, no solo los canteranos.
 * El crecimiento es estable: combina rachas, calificación individual, minutos
 * y edad; nunca altera el marcador ni regala OVR al cumplir años.
 */
export function seniorYouthDevelopment(s,match){
 if(!match?.played||!match.lineups||!match.id)return [];
 const evolved=[];
 for(const side of ['home','away']){
  const clubName=match[side],t=s.teams[clubName];if(!t)continue;
  const ids=[...(match.lineups[side]||[]),...(match.events||[]).filter(e=>e.type==='sub'&&e.side===side).map(e=>e.p2)].filter(Boolean);
  const seen=new Set();
  for(const id of ids){
   const p=t.players.find(x=>String(x.id)===String(id));
   if(!p||seen.has(String(id)))continue;seen.add(String(id));
   const key=match.id+':senior:'+p.id;
   const development=p.development??={games:0,form:6.5,strong:0,poor:0,recent:[],lastMatch:null,potentialGains:{}};
   if(development.lastMatch===key)continue;
   const goals=(match.events||[]).filter(e=>e.type==='goal'&&e.side===side&&String(e.p1)===String(p.id)).length;
   const assists=(match.events||[]).filter(e=>e.type==='goal'&&e.side===side&&String(e.p2)===String(p.id)).length;
   const gd=side==='home'?Number(match.scoreH)-Number(match.scoreA):Number(match.scoreA)-Number(match.scoreH);
   const starters=(match.lineups[side]||[]).some(v=>String(v)===String(id));
   const defending=['POR','DFC','LD','LI','MCD'].includes(p.pos);
   const base=6.45+(gd>0?.36:gd<0?-.28:.04)+(gd>1?.13:0)+(defending&&gd>=0?.2:0);
   const performance=base+goals*.74+assists*.41+(defending&&((side==='home'?match.scoreA:match.scoreH)===0)?.5:0)+(hash(key)%17-8)*.055;
   const rating=+clamp(performance,4.5,9.8).toFixed(2);
   development.games++;
   development.recent.push(rating);
   if(development.recent.length>8)development.recent.shift();
   development.form=+(development.recent.reduce((sum,n)=>sum+n,0)/development.recent.length).toFixed(2);
   development.strong=rating>=7.2?development.strong+1:Math.max(0,development.strong-1);
   development.poor=rating<5.8?development.poor+1:Math.max(0,development.poor-1);
   development.lastMatch=key;
   p.form=development.form;
   const cap=Math.max(Number(p.ovr)||50,Number(p.pot)||50);
   p.pot=cap;
   const age=Number(p.age||23),modifier=age<=22?1.2:age<=27?1:age<=30?.7:.42;
   const bonus=goals*4+assists*3+(defending&&gd>=0?1:0);
   const xp=Math.max(1,Math.round((starters?4:2)+(rating-6.3)*3+bonus))*modifier;
   const old=p.ovr;
   gainXP(s,p,Math.round(xp),'Primer equipo',key);
   const edition=s.season+'-'+(s.edition||'Apertura');
   if(rating>=7.2&&development.strong>=6&&age<=28&&p.pot<99){
    const before=Number(development.potentialGains[edition]||0);
    if(before<2){p.pot=Math.min(99,p.pot+1);development.potentialGains[edition]=before+1;development.strong=0;}
   }
   // Una mala racha prolongada limita la progresión, sin provocar caídas arbitrarias por partido.
   if(development.poor>=10&&age>=31&&p.ovr>48){p.ovr--;development.poor=0;}
   if(p.ovr!==old)evolved.push({club:clubName,name:p.name,old,ovr:p.ovr,potential:p.pot});
  }
  // Una contratación o crecimiento se refleja inmediatamente en el nivel del equipo.
  t.currentOverall=teamOverall(s,t);
 }
 return evolved;
}
/** Calidad actual de once titular y recambios, nunca la media fija del club. */
export function teamOverall(s,t){
 const players=t?.players||[];if(!players.length)return Number(t?.rating||50);
 // Importación dinámica no necesaria: alineación definida por IDs en t.lineup.
 const ids=(t.lineup?.starters||[]).map(String);
 const preferred=ids.map(id=>players.find(p=>String(p.id)===id)).filter(Boolean);
 const starters=[...preferred,...players.filter(p=>!ids.includes(String(p.id))).sort((a,b)=>b.ovr-a.ovr)].slice(0,11);
 const median=starters.reduce((n,p)=>n+Number(p.ovr||50),0)/Math.max(1,starters.length);
 const depth=players.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,18).reduce((n,p)=>n+Number(p.ovr||50),0)/Math.max(1,Math.min(18,players.length));
 return +(.88*median+.12*depth).toFixed(1);
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
   mission.status='ready';mission.candidates=youthReport(s,mission);mission.finished=cycle(s);mission.matchesAfterReport=0;mission.offerStage='report';
   completed.push(mission);s.news??=[];s.news.unshift({id:'youth-scout-'+mission.id,category:'Cantera',title:'🌍 Informe de juveniles desde '+mission.country,description:'El ojeador de '+mission.club+' encontró '+mission.candidates.length+' talentos. Revisá el informe de cantera.',date:cycle(s),relatedClub:mission.club});
  }
 }
 scouting.seenEvents.push(key);if(scouting.seenEvents.length>210)scouting.seenEvents.splice(0,scouting.seenEvents.length-210);
 return completed;
}
/**
 * Se cuentan partidos oficiales del club, no recargas, fechas vacías ni
 * otros equipos. Tras 2: propuesta final; tras 2 más: libre y retirada.
 */
export function advanceYouthOffers(s,match){
 if(!match?.played||!match.id)return [];
 const store=ensureYouthScouting(s),announcements=[];
 for(const club of [match.home,match.away]){
  for(const mission of store.missions){
   if(mission.club!==club||mission.status!=='ready')continue;
   mission.offerMatches??=[];
   if(mission.offerMatches.includes(String(match.id)))continue;
   mission.offerMatches.push(String(match.id));
   if(mission.offerMatches.length>8)mission.offerMatches.splice(0,mission.offerMatches.length-8);
   mission.matchesAfterReport=(mission.matchesAfterReport||0)+1;
   const n=mission.matchesAfterReport;
   if(n===2){
    mission.offerStage='final';
    let open=0;for(const p of mission.candidates)if(p.status==='available'){p.status='offered';open++;}
    if(open){announcements.push({club,mission,kind:'offer',count:open});
     s.news??=[];s.news.unshift({id:'scout-final-'+mission.id,category:'Cantera',title:'⏳ Última oferta de talentos para '+club,description:'El ojeador de '+mission.country+' presentó '+open+' propuestas. Tenés dos partidos oficiales para aceptar o rechazar.',date:cycle(s),relatedClub:club});}
   }else if(n>=4&&mission.offerStage!=='expired'){
    mission.offerStage='expired';mission.status='expired';
    let expired=0;for(const p of mission.candidates)if(p.status==='available'||p.status==='offered'){p.status='expired';expired++;}
    if(expired){announcements.push({club,mission,kind:'expired',count:expired});
      s.news??=[];s.news.unshift({id:'scout-expire-'+mission.id,category:'Cantera',title:'🚪 Promesas internacionales dejan el mercado',description:expired+' juveniles de '+mission.country+' quedaron libres sin fichar por '+club+'.',date:cycle(s),relatedClub:club});}
   }
  }
 }
 if(s.news?.length>240)s.news.length=240;
 return announcements;
}
/** Rechazar individualmente sin fichar ni cobrar dinero. */
export function rejectYouthCandidate(s,club,id){
 const mission=scoutingMissions(s,club).find(m=>m.candidates?.some(p=>String(p.id)===String(id)));
 const p=mission?.candidates.find(x=>String(x.id)===String(id));
 if(!p||!['available','offered'].includes(p.status))throw Error('La oferta ya no está disponible');
 p.status='rejected';
 return p;
}

export function signYouthCandidate(s,club,id){
 const t=s.teams[club];if(!t)throw Error('Club no encontrado');
 const missions=scoutingMissions(s,club);
 const mission=missions.find(m=>m.status==='ready'&&m.candidates.some(p=>String(p.id)===String(id)));
 if(!mission)throw Error('El informe no contiene esta promesa disponible');
 const p=mission.candidates.find(p=>p.id===id);
 if(!['available','offered'].includes(p.status))throw Error('Esta promesa ya fue fichada, fue rechazada o su oferta expiró');
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
 const p=t.players.find(p=>String(p.id)===String(id));
 if(!p?.academyGraduate)throw Error('Solo podés dar titularidad a canteranos ascendidos');
 const L=lineupState(t);
 if(L.starters.includes(String(p.id)))return p;
 const roles=L.roles;
 let slot=10,best=-Infinity;
 for(let i=0;i<L.starters.length;i++){
  if(roles[i]==='POR'&&p.pos!=='POR')continue;
  const current=t.players.find(x=>String(x.id)===String(L.starters[i]));
  const prefer=roleAffinity(roles[i],p.pos)*90-Number(current?.ovr||60)*.12;
  if(prefer>best){best=prefer;slot=i;}
 }
 chooseLineup(s,club,'starters',slot,p.id);
 return p;
}

export function youthProgress(p){
 const growth=youthDevelopment(p),limit=xpLimit(p);
 return {xp:growth.xp,needed:limit,percent:clamp(Math.round(growth.xp/limit*100),0,100),up:growth.total||0};
}
