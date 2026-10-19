/* Noveria 6.4 · Grandes previas: análisis de encuentros confirmados, sin spoilers.
 * Puramente de lectura: NO simula, no modifica fechas, planteles ni resultados.
 */
import {played,ranking} from './engine.js';
import {fixtureSources} from './live2d.js';
import {calendarCurrent,calendarMatchReady} from './calendar.js';
import {matchLineup} from './lineup.js';

const text=x=>String(x??'');
const noResult=m=>Boolean(m&&!played(m)&&m.home&&m.away);
const late=n=>Number(n||0)>=14;
const stageOf=m=>text([m.group,m.phase,m.stage].filter(Boolean).join(' ')).toLowerCase();
export function bigMatchImportance(s,entry){
 if(!entry||!noResult(entry.m))return {score:0,label:'',reason:''};
 const m=entry.m,stage=stageOf(m),kind=entry.kind,home=s.teams?.[m.home],away=s.teams?.[m.away];
 if(!home||!away)return {score:0,label:'',reason:''};
 const sameCountry=home.country===away.country;
 const rivalry=Math.max(Number(home.rivalryRecords?.[away.name]?.games||0),Number(away.rivalryRecords?.[home.name]?.games||0));
 let score=0,label='',reason='';
 if(/recopa/.test(stage)){score=110;label='🏆 RECOPA';reason='Un trofeo oficial estará en juego';}
 else if(/semifinal/.test(stage)){score=85;label='🔥 SEMIFINAL';reason='Se define el camino hacia la final';}
 else if(/final/.test(stage)){score=105;label='🏆 GRAN FINAL';reason='Se disputa el título de la competición';}
 else if(/cuartos/.test(stage)){score=68;label='⚔️ CUARTOS DE FINAL';reason='Eliminatoria decisiva';}
 else if(/octavos/.test(stage)){score=57;label='⚔️ OCTAVOS DE FINAL';reason='Comienza la fase eliminatoria';}
 else if(kind==='international'&&(stage.includes('ko')||stage.includes('playoff')||stage.includes('eliminat'))){score=64;label='🌍 CRUCE CONTINENTAL';reason='Eliminatoria de Arcalis';}
 else if(kind==='international'){score=29;label='🌍 NOCHE CONTINENTAL';reason='Encuentro internacional';}
 else if(kind==='cup'||kind==='foreign-cup'){score=30;label='🏆 COPA NACIONAL';reason='Un duelo de copa';}
 else if(kind==='post'||kind==='foreign-post'){score=77;label='🔥 FASE FINAL';reason='Duelo de fase final';}
 if(rivalry>=4&&sameCountry){score=Math.max(score,65)+(rivalry>=9?9:0);if(score<105){label='🔥 GRAN RIVALIDAD';reason='Los dos clubes acumulan '+rivalry+' enfrentamientos';}}
 if((kind==='league'||kind==='foreign-league')&&late(m.round)){score+=13;if(!label){label='⚽ TRAMO DECISIVO';reason='El campeonato entra en sus últimas jornadas';}}
 if(m.home===s.managedClub||m.away===s.managedClub)score+=12;
 const league=kind==='league'||kind==='foreign-league';
 if(league&&sameCountry&&home.division==='LSV'&&away.division==='LSV'){
  const w=home.country==='Veltrania'?s:s.world?.[home.country];
  const fixtures=(w?.fixtures||[]).filter(x=>x.competition==='LSV');
  const group=home.group===away.group?home.group:null;
  const names=Object.values(s.teams).filter(t=>t.country===home.country&&t.division==='LSV'&&(!group||t.group===group)).map(t=>t.name);
  if(names.length&&fixtures.some(played)){
   const rows=ranking(fixtures,names);
   const x=rows.findIndex(r=>r.name===home.name),y=rows.findIndex(r=>r.name===away.name);
   if(x>=0&&y>=0&&x<4&&y<4&&rows[x].pj>0&&rows[y].pj>0){
    score+=35;if(score<100){label='⚡ DUELO DE CANDIDATOS';reason='Ambos equipos están entre los cuatro primeros de la tabla';}
   }
  }
 }
 if(!label){label='⚽ PREVIA DE PARTIDO';reason='Un encuentro oficial en el calendario';}
 return {score,label,reason,rivalry};
}
export function previewEntries(s,{limit=18,country='Todos',club=null}={}){
 const all=fixtureSources(s);
 const e=calendarCurrent(s);
 const pending=all.filter(x=>noResult(x.m)&&x.kind!=='archive'&&s.teams?.[x.m.home]&&s.teams?.[x.m.away]);
 const candidates=pending.filter(x=>(country==='Todos'||s.teams[x.m.home].country===country||s.teams[x.m.away].country===country)&&(!club||x.m.home===club||x.m.away===club));
 const ranked=candidates.map(x=>({...x,importance:bigMatchImportance(s,x),due:calendarMatchReady(s,x)})).filter(x=>x.importance.score>=48);
 ranked.sort((a,b)=>Number(b.due)-Number(a.due)||b.importance.score-a.importance.score||Number(a.m.round||0)-Number(b.m.round||0)||text(a.m.id).localeCompare(text(b.m.id)));
 return ranked.slice(0,limit);
}
function allPlayed(s){
 const current=fixtureSources(s).map(x=>x.m);
 for(const a of s.archive||[])current.push(...(a.fixtures||[]),...(a.cup?.fixtures||[]),...(a.postseason?.fixtures||[]));
 for(const w of Object.values(s.world||{}))for(const a of w.archive||[])current.push(...(a.fixtures||[]),...(a.cup?.fixtures||[]),...(a.postseason?.fixtures||[]));
 for(const a of s.international?.archive||[])for(const c of [a.champions,a.horizonte])current.push(...(c?.fixtures||[]));
 const unique=new Map();
 for(const m of current)if(played(m)&&m.id&&!unique.has(m.id))unique.set(m.id,m);
 return [...unique.values()];
}
const perspective=(m,name)=>({match:m,opponent:m.home===name?m.away:m.home,scored:m.home===name?m.scoreH:m.scoreA,conceded:m.home===name?m.scoreA:m.scoreH,result:(m.home===name?m.scoreH:m.scoreA)>(m.home===name?m.scoreA:m.scoreH)?'G':(m.home===name?m.scoreH:m.scoreA)<(m.home===name?m.scoreA:m.scoreH)?'P':'E'});
function shape(s,team,playedList){
 const clubMatches=playedList.filter(m=>m.home===team||m.away===team).slice(-5);
 const list=clubMatches.map(m=>perspective(m,team));
 return {matches:list,form:list.map(v=>v.result).join(''),wins:list.filter(v=>v.result==='G').length,draws:list.filter(v=>v.result==='E').length,losses:list.filter(v=>v.result==='P').length};
}
function projected(team){
 const active=matchLineup(team);
 return {formation:team.lineup?.formation||team.formation||'4-3-3',
  starters:(active?.starters||[]).map(p=>({name:p.name,number:p.number,pos:p.pos,ovr:p.ovr})),
  bench:(active?.bench||[]).slice(0,7).map(p=>({name:p.name,number:p.number,pos:p.pos}))};
}
export function bigMatchDossier(s,entry){
 if(!entry||!noResult(entry.m))return null;
 const m=entry.m,h=s.teams?.[m.home],a=s.teams?.[m.away];if(!h||!a)return null;
 const imp=bigMatchImportance(s,entry),e=calendarCurrent(s),due=calendarMatchReady(s,entry);
 const all=allPlayed(s),recent=all.filter(x=>x.id!==m.id);
 const h2h=recent.filter(x=>(x.home===m.home&&x.away===m.away)||(x.home===m.away&&x.away===m.home));
 const same=recent.filter(x=>x.home===m.home||x.away===m.home||x.home===m.away||x.away===m.away);
 const home=shape(s,m.home,same),away=shape(s,m.away,same);
 const direct={count:h2h.length,homeWins:h2h.filter(x=>(x.home===m.home?x.scoreH:x.scoreA)>(x.home===m.home?x.scoreA:x.scoreH)).length,awayWins:h2h.filter(x=>(x.home===m.away?x.scoreH:x.scoreA)>(x.home===m.away?x.scoreA:x.scoreH)).length,draws:h2h.filter(x=>x.scoreH===x.scoreA).length};
 const latest=h2h.at(-1)||null;
 const top=x=>(x.players||[]).filter(p=>Number(p.outGames||0)<=0).sort((a,b)=>Number(b.ovr||0)-Number(a.ovr||0)).slice(0,2).map(p=>({name:p.name,position:p.pos,ovr:p.ovr}));
 const casualties=x=>(x.players||[]).filter(p=>Number(p.outGames||0)>0).slice(0,4).map(p=>p.name);
 const competition=entry.kind==='international'?entry.owner?.name||'Copas de Arcalis':entry.kind==='cup'||entry.kind==='foreign-cup'?'Copa Nacional':entry.kind==='post'||entry.kind==='foreign-post'?'Fase final y Recopa':entry.kind==='custom'?entry.owner?.name||'Torneo especial':m.competition==='LPV'?'Liga de Plata':'Liga Suprema';
 const focal=(m.home===s.managedClub||m.away===s.managedClub);
 const headlines=imp.label.includes('FINAL')?'Todo por la gloria: '+m.home+' contra '+m.away:
  imp.label.includes('RIVALIDAD')?'Se enciende la rivalidad: '+m.home+' frente a '+m.away:
  imp.label.includes('SEMIFINAL')?'Noventa minutos rumbo a la gloria: '+m.home+' y '+m.away:
  'Se viene un partidazo: '+m.home+' ante '+m.away;
 const story=[
  imp.reason+'. '+m.home+' recibe a '+m.away+' en '+(h.stadium||'su estadio')+'.',
  direct.count?('En los '+direct.count+' antecedentes registrados, '+m.home+' ganó '+direct.homeWins+', '+m.away+' ganó '+direct.awayWins+' y hubo '+direct.draws+' empates.'):'No hay enfrentamientos previos registrados entre estos equipos en los archivos de esta partida.',
  'En sus últimos '+home.matches.length+' encuentros, '+m.home+' registra '+home.wins+' victorias; '+m.away+' acumula '+away.wins+' victorias en sus últimos '+away.matches.length+'.'
 ];
 return {id:m.id,fixture:m,importance:imp,competition,round:m.round,stage:stageOf(m),venue:h.stadium||'Estadio por confirmar',city:h.city||'',headline:headlines,story,
  date:due?e?.date||null:m.calendarDate||null,due,
  home:{name:m.home,color:h.primary,secondary:h.secondary,coach:h.coach,tactic:h.tactic,formation:projected(h),stars:top(h),absences:casualties(h),form:home},
  away:{name:m.away,color:a.primary,secondary:a.secondary,coach:a.coach,tactic:a.tactic,formation:projected(a),stars:top(a),absences:casualties(a),form:away},
  h2h:{...direct,latest:latest?{home:latest.home,away:latest.away,scoreH:latest.scoreH,scoreA:latest.scoreA}:null},focal,
  keyInfo:due?'Partido habilitado en la fecha oficial':'Cruce confirmado; todavía no corresponde jugarlo en el calendario'};
}
