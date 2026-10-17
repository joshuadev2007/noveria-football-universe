/** Noveria 6.2.1 · Asesor de alineaciones por escenarios.
 * Recomendaciones calculadas sin mutar el estado. Solo aplicarScenarioSuggestion
 * cambia once, banca, capitán, formación y táctica cuando el usuario lo confirma.
 */
import {FORMATIONS,FORMATION_OPTIONS,roleAffinity,lineupState} from './lineup.js';

export const LINEUP_SCENARIOS=[
 {value:'automatico',label:'🧠 Automático · próximo partido',description:'Equilibra nivel, físico, forma y dificultad del rival'},
 {value:'rotacion',label:'🔄 Rotaciones y calendario cargado',description:'Prioriza futbolistas frescos y protege a los más fatigados'},
 {value:'rival-fuerte',label:'🛡️ Ante un rival superior',description:'Solidez defensiva y transiciones rápidas'},
 {value:'final',label:'🏆 Final o partido decisivo',description:'Once competitivo con cuidado de las bajas'},
 {value:'buscar-gol',label:'🔥 Necesitamos ganar o marcar',description:'Mayor ataque, sin regalar todo el equilibrio'},
 {value:'defender',label:'🔒 Defender una ventaja',description:'Fortalecer la última línea y reducir el desgaste'}
];
const key=v=>String(v??'');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fnum=(v,otherwise)=>Number.isFinite(Number(v))?Number(v):otherwise;
const fitness=p=>clamp(fnum(p.fitness,90),8,100);
const sharpness=p=>clamp(fnum(p.sharpness,65),15,100);
const available=p=>Number(p.outGames||0)<=0;
const mean=(a,fn)=>a.length?a.reduce((t,x)=>t+fn(x),0)/a.length:0;
const quality=t=>mean((t?.players||[]).slice(0,16),p=>fnum(p.ovr,50));
const allFixtures=(s,name)=>{
 const list=[];
 const add=(fixtures,kind)=>{for(const m of fixtures||[])if(!m.played&&(m.home===name||m.away===name))list.push({match:m,kind})};
 const country=s.teams[name]?.country;
 if(country==='Veltrania'){
  add(s.fixtures,'league');add(s.cup?.fixtures,'cup');add(s.postseason?.fixtures,'postseason');
 }else{
  add(s.world?.[country]?.fixtures,'league');add(s.world?.[country]?.cup?.fixtures,'cup');add(s.world?.[country]?.postseason?.fixtures,'postseason');
 }
 for(const k of ['champions','horizonte'])add(s.international?.[k]?.fixtures,'international');
 for(const c of s.competitions||[])add(c.fixtures,'custom');
 return list;
};
function onEvent(entry,event){
 if(!event)return false;
 const {match:m,kind}=entry;
 if(event.kind==='league')return kind==='league'&&Number(m.round)===Number(event.ordinal);
 if(event.kind==='cup')return kind==='cup'&&Number(m.round)===Number(event.ordinal);
 if(event.kind==='postseason')return kind==='postseason';
 if(event.kind==='international')return kind==='international';
 if(event.kind==='custom')return kind==='custom';
 return false;
}
export function lineupUpcomingFixture(s,name,event=null){
 const list=allFixtures(s,name);
 const due=list.find(x=>onEvent(x,event));
 if(due)return {...due,fromCurrentDate:true};
 const next=list.sort((a,b)=>fnum(a.match.round,100)-fnum(b.match.round,100)||String(a.match.id).localeCompare(String(b.match.id)))[0];
 return next?{...next,fromCurrentDate:false}:null;
}
function chooseFormation(scenario,current,opponentStr,ownStr){
 if(scenario==='rival-fuerte'||(scenario==='automatico'&&opponentStr>ownStr+6))return '4-2-3-1';
 if(scenario==='defender')return '5-3-2';
 if(scenario==='buscar-gol')return '4-3-3';
 if(scenario==='final')return current==='5-3-2'?'4-2-3-1':current;
 return FORMATIONS[current]?current:'4-3-3';
}
function chooseTactic(scenario,current,opponentStr,ownStr,fitnessAvg){
 if(scenario==='rival-fuerte'||(scenario==='automatico'&&opponentStr>ownStr+6))return 'Contraataque';
 if(scenario==='defender')return 'Bloque bajo';
 if(scenario==='buscar-gol')return fitnessAvg>=73?'Presión alta':'A todo ataque';
 if(scenario==='rotacion'&&fitnessAvg<67)return 'Equilibrado';
 if(scenario==='final'&&fitnessAvg<68)return 'Contraataque';
 return current||'Equilibrado';
}
function scoreFor(p,role,scenario,incumbent){
 const fit=fitness(p),sharp=sharpness(p),form=clamp(fnum(p.form,6.5),4,10);
 const compatibility=roleAffinity(role,p.pos);
 const injury=available(p)?0:500;
 const fatiguePenalty=fit<50?9:fit<65?3:0;
 const weight=scenario==='rotacion'?0.27:scenario==='final'?0.12:0.15;
 const bonus=incumbent?2.4:0;
 const youngBonus=scenario==='rotacion'&&Number(p.age||30)<23?1:0;
 return fnum(p.ovr,50)*compatibility+fit*weight+sharp*.065+(form-6.5)*2+bonus+youngBonus-fatiguePenalty-injury;
}
function suggestSquad(t,formation,scenario){
 const base=lineupState(t),roles=FORMATIONS[formation]||FORMATIONS['4-3-3'];
 const current=new Set(base.starters),all=[...(t.players||[])];
 const healthy=all.filter(available),pool=healthy.length>=11?healthy:all;
 const picked=[],used=new Set(),left=[...pool];
 for(let i=0;i<roles.length;i++){
  const role=roles[i];
  left.sort((a,b)=>scoreFor(b,role,scenario,current.has(key(b.id)))-scoreFor(a,role,scenario,current.has(key(a.id)))||key(a.id).localeCompare(key(b.id)));
  const chosen=left.shift();if(!chosen)break;
  used.add(key(chosen.id));picked.push(chosen);
 }
 // Si no hay once sano, completamos con las bajas solo como último recurso.
 if(picked.length<11){
  const missing=all.filter(p=>!used.has(key(p.id))).sort((a,b)=>Number(b.ovr||0)-Number(a.ovr||0));
  while(picked.length<11&&missing.length){const p=missing.shift();used.add(key(p.id));picked.push(p);}
 }
 if(picked.length<11)throw Error('El plantel necesita al menos 11 futbolistas');
 const rem=all.filter(p=>!used.has(key(p.id)));
 const sorted=rem.sort((a,b)=>Number(available(b))-Number(available(a))||
  (fnum(b.ovr,50)*.8+fitness(b)*.2)-(fnum(a.ovr,50)*.8+fitness(a)*.2));
 const chosenBench=[];
 const reserveKeeper=sorted.find(p=>p.pos==='POR'&&available(p));
 if(reserveKeeper){chosenBench.push(reserveKeeper);}
 for(const group of [['DFC','LI','LD'],['MC','MCD','MCO','MP'],['DC','EI','ED','MI','MD']]){
  if(chosenBench.length>=7)break;
  const p=sorted.find(p=>group.includes(p.pos)&&!chosenBench.includes(p)&&available(p));
  if(p)chosenBench.push(p);
 }
 for(const p of sorted)if(!chosenBench.includes(p)&&chosenBench.length<7)chosenBench.push(p);
 const captain= picked.find(p=>key(p.id)===key(base.captain)&&available(p))||
  [...picked].sort((a,b)=>fnum(b.age,20)-fnum(a.age,20))[0];
 return {starters:picked,bench:chosenBench,captain:key(captain.id),roles};
}
export function suggestLineupScenario(s,name,scenario='automatico',event=null){
 const t=s.teams?.[name];if(!t)throw Error('No se encontró ese club');
 if((t.players||[]).length<11)throw Error('El plantel debe tener 11 futbolistas');
 if(!LINEUP_SCENARIOS.some(x=>x.value===scenario))throw Error('Escenario desconocido');
 const current=lineupState(t),upcoming=lineupUpcomingFixture(s,name,event),match=upcoming?.match||null;
 const opponent=match?(match.home===name?match.away:match.home):null;
 const theirs=opponent?s.teams[opponent]:null,ours=quality(t),theirStrength=quality(theirs);
 const fitnessAverage=mean(current.starters.map(id=>t.players.find(p=>key(p.id)===id)).filter(Boolean),fitness);
 const formation=chooseFormation(scenario,current.formation,theirStrength,ours);
 const tactic=chooseTactic(scenario,t.tactic,theirStrength,ours,fitnessAverage);
 const chosen=suggestSquad(t,formation,scenario);
 const starters=chosen.starters.map((p,i)=>({id:key(p.id),name:p.name,pos:p.pos,role:chosen.roles[i],
  ovr:p.ovr,fitness:Math.round(fitness(p)),sharpness:Math.round(sharpness(p)),outGames:Number(p.outGames||0)}));
 const bench=chosen.bench.map(p=>({id:key(p.id),name:p.name,pos:p.pos,ovr:p.ovr,fitness:Math.round(fitness(p)),outGames:Number(p.outGames||0)}));
 const original=new Set(current.starters),incoming=starters.filter(p=>!original.has(p.id));
 const outgoing=current.starters.filter(id=>!starters.some(p=>p.id===id)).map(id=>t.players.find(p=>key(p.id)===id)).filter(Boolean);
 const worn=current.starters.map(id=>t.players.find(p=>key(p.id)===id)).filter(p=>p&&fitness(p)<65);
 const suspended=(t.players||[]).filter(p=>!available(p));
 const warnings=[];
 if(suspended.length)warnings.push(suspended.length+' baja(s) médica(s) o disciplinaria(s) fuera del once recomendado cuando hay reemplazos.');
 if(worn.length)warnings.push(worn.length+' titular(es) actual(es) con menos de 65% de físico.');
 if(starters.some(p=>p.outGames>0))warnings.push('Hay más bajas que reemplazos disponibles. Revisá la lista antes de jugar.');
 if(starters.some(p=>p.fitness<60))warnings.push('Todavía quedan jugadores con desgaste importante en el XI.');
 if(!match)warnings.push('No se identificó un partido pendiente: recomendación basada solo en el plantel.');
 const reasons=[];
 if(match)reasons.push('Rival: '+opponent+' · '+(upcoming.fromCurrentDate?'fecha activa':'próximo encuentro identificado')+
   ' · nivel estimado del rival '+theirStrength.toFixed(1)+' frente a '+ours.toFixed(1)+'.');
 if(incoming.length)reasons.push('Cambiar '+incoming.length+' titular(es): entran '+incoming.slice(0,4).map(p=>p.name).join(', ')+'.');
 else reasons.push('El once actual ya responde bien al escenario; no se recomiendan cambios de nombres.');
 if(outgoing.length)reasons.push('Dar descanso o suplencia a '+outgoing.slice(0,4).map(p=>p.name).join(', ')+'.');
 const explanations={
 automatico:'Propuesta para el siguiente compromiso equilibrando nivel, forma y desgaste.',
 rotacion:'Prioriza piernas frescas para una seguidilla de partidos. Conserva cobertura de portería, defensa, medio y ataque.',
 'rival-fuerte':'Refuerza el mediocampo defensivo y busca espacios con transiciones rápidas.',
 final:'Elige jugadores competitivos sin ignorar lesiones ni cansancio antes de un partido decisivo.',
 'buscar-gol':'Busca más presencia ofensiva. Hay un mayor riesgo de espacios a la espalda.',
 defender:'Prioriza protección defensiva y un bloque compacto para conservar una ventaja.'
 };
 reasons.unshift(explanations[scenario]);
 if(formation!==current.formation)reasons.push('Se propone cambiar la formación de '+current.formation+' a '+formation+'.');
 if(tactic!==t.tactic)reasons.push('Estilo sugerido: '+tactic+' (actual: '+t.tactic+').');
 return {scenario,club:name,opponent,matchId:match?.id||null,competition:match?.competition||null,
  formation,tactic,fitnessAverage:Math.round(fitnessAverage),currentFormation:current.formation,
  captain:chosen.captain,starters,bench,incoming,outgoing:outgoing.map(p=>p.name),reasons,warnings,
  simulated:false};
}
export function applyLineupScenario(s,name,scenario,event=null){
 const recommendation=suggestLineupScenario(s,name,scenario,event);
 const t=s.teams[name];
 // Aplicación explícita, sobre el plantel actual, nunca sobre partidos ya disputados.
 t.lineup={formation:recommendation.formation,starters:recommendation.starters.map(p=>p.id),
  bench:recommendation.bench.map(p=>p.id),captain:recommendation.captain};
 t.formation=recommendation.formation;t.tactic=recommendation.tactic;
 return recommendation;
}
