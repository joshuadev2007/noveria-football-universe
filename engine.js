import {TEAMS,FIXTURES,FOREIGN_COUNTRIES} from './data.js';
import {cyclePhase,cycleKey,cycleName,cycleNext,cycleIsAnnualFinal,annualMatches} from './season-cycle.js';
import {seniorYouthDevelopment} from './youth-scouting.js';
import {matchLineup,lineupStrength} from './lineup.js';

export const STORAGE_KEY='noveria-universe-save-v1';
export const FIRST_NAMES=['Mateo','Thiago','Damián','Emiliano','Bruno','Santiago','Noah','Iker','Adrián','Gael','Elian','Nicolás','Alexis','Kevin','Samuel','Héctor','Marco','Iván','Gabriel','Luca','Enzo','Erik','Lucas','Rafael','Daniel','Jesús','Oliver','Aaron','Raúl','Diego','Joel','Néstor','Emanuel','Ángel','Axel','Esteban','Julián','Leandro','Hugo','Luis','Pablo','Leonardo','Sergio','Matías','Darío','Jairo','Rubén','Ariel','Elías','Benjamín','Sebastián'];
export const LAST_NAMES=['Valcera','Román','Arce','Vidal','Montiel','Navarro','Castell','Duarte','Lagos','Soria','Mejía','Ledesma','Cárdenas','Ríos','Barrera','Salcedo','Linares','Ferrán','Olmedo','Vargas','Salinas','Rosales','Campos','Velasco','Zamora','Ponce','Ibarra','Quiroga','Palacios','Herrera','Leiva','Carrasco','Beltrán','Aranda','Alvar','Mora','Quintero','Vega','Cardona','Suárez'];
export const CUP_GROUPS=[
['Atlético Aurena','Ferroviarios de Ferral','Real Monteluz','Juventud Miravia'],
['Unión Popular Aurena','Sporting Bahía Clara','Titanes de Tarsena','Atlético San Talio'],
['Estrella de Miravia','Deportivo Puerto Bruma','Atlético Solverde','Fénix de Istral'],
['Imperial Seravia','Náutico Caldera','Deportivo Rocafría','Deportivo Nublar'],
['Academia Liria','Mineros de Carbalia','Unión Costamar','Deportivo Riberalta'],
['Independiente San Orio','Atlético Laguna Roja','Horizonte de Dunara','Lobos de Quintera'],
['Halcones de Venturia','Deportivo Vallealto','Atlético Bosqueceniza','Rayo de Pinarés']];

function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),16777619)}return h>>>0}
function seeded(seed){let a=typeof seed==='string'?hash(seed):seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
const pick=(list,r)=>list[Math.floor(r()*list.length)];
const within=(n,a,b)=>Math.max(a,Math.min(b,n));
const POS=['POR','LD','DFC','DFC','LI','MCD','MC','MCO','EI','ED','DC','POR','POR','DFC','LI','MCD','MC','MD','MI','MP','DC','DC'];
const ageOf=(r)=>18+Math.floor(r()*17);
export function createRoster(team){const r=seeded('squad-'+team.name);return POS.map((pos,index)=>({id:'p-'+hash(team.name+'-'+index),name:pick(FIRST_NAMES,r)+' '+pick(LAST_NAMES,r),number:index+1,age:ageOf(r),nationality:r()<.72?team.country:pick(['Veltrania',...FOREIGN_COUNTRIES],r),pos,ovr:within(team.rating+Math.floor((r()-.5)*20),47,90),pot:within(team.rating+Math.floor(r()*17),54,96),salary:Math.floor(50+r()*110),value:Math.floor(100+r()*1900),apps:0,goals:0,assists:0,yellows:0,reds:0,injuries:0,form:6.5}));}
export function defaultTeam(seed){const r=seeded(seed.name);const coach=pick(FIRST_NAMES,r)+' '+pick(LAST_NAMES,r);return {...seed,coach,president:pick(FIRST_NAMES,r)+' '+pick(LAST_NAMES,r),director:pick(FIRST_NAMES,r)+' '+pick(LAST_NAMES,r),formation:'4-3-3',tactic:pick(['Equilibrado','Posesión','Presión alta','Contraataque'],r),morale:64+Math.floor(r()*21),board:55+Math.floor(r()*30),kits:[{p:seed.primary,s:seed.secondary,pattern:'stripes',sponsor:'NOVERIA'},{p:seed.secondary,s:seed.primary,pattern:'plain',sponsor:'NOVERIA'},{p:'#172438',s:seed.primary,pattern:'diagonal',sponsor:'NOVERIA'}],players:createRoster(seed),trophies:[],coachHistory:[]};}
function makeGroupFixtures(teams,group,comp){const rounds=[[ [0,3],[1,2] ],[[0,2],[3,1]],[[0,1],[2,3]]];return rounds.flatMap((pairs,rd)=>pairs.map(([i,j],k)=>({id:`${comp}-${group}-${rd+1}-${k}`,competition:comp,group,round:rd+1,slot:0,home:teams[rd===1?j:i],away:teams[rd===1?i:j],played:false,legacy:false,scoreH:null,scoreA:null})));}
function initialCup(){return {phase:'groups',round:1,fixtures:CUP_GROUPS.flatMap((g,i)=>makeGroupFixtures(g,String.fromCharCode(65+i),'CUP')),champion:null};}
export function freshState(){return {version:1,seed:Math.floor(Math.random()*1e8),leagueRound:6,season:2026,edition:'Apertura',archive:[],slotMap:Object.fromEntries(TEAMS.filter(t=>t.division!=='EXT').map(t=>[t.name,t.name])),mode:'president',managedClub:'Unión Popular Aurena',teams:Object.fromEntries(TEAMS.map(t=>[t.name,defaultTeam(t)])),fixtures:structuredClone(FIXTURES),cup:initialCup(),postseason:{stage:'locked',leg:1,fixtures:[],apertura:null,recopa:null},competitions:[],news:[{id:'welcome',category:'Universo',title:'Noveria inaugura su primera era futbolística',description:'Todos los clubes comienzan con cero títulos. Se han incorporado las seis primeras jornadas del Apertura 2026.',date:'Fundación del universo'}],transfers:[],market:{status:'closed',cycle:0,day:0,maxDays:12,title:'Mercado de Noveria',offers:[],shortlist:[],log:[],lastReport:null,training:[]},honours:[],settings:{sound:true}};}
export function load(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY));if(s?.version===1&&s.teams&&Array.isArray(s.fixtures)&&s.cup)return ensureMarket(s);}catch(e){console.warn('No se pudo cargar la partida',e)}return freshState()}
export function persist(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}
export const isKnownTeam=(s,name)=>Boolean(s.teams[name]);
export const played=(f)=>f.played&&Number.isInteger(f.scoreH)&&Number.isInteger(f.scoreA);
export function ranking(matches,names){const set=new Set(names);const rows=Object.fromEntries(names.map(name=>[name,{name,pj:0,w:0,d:0,l:0,gf:0,gc:0,gd:0,pts:0}]));for(const f of matches){if(!played(f)||(!set.has(f.home)&&!set.has(f.away)))continue;const h=rows[f.home],a=rows[f.away];if(h){h.pj++;h.gf+=f.scoreH;h.gc+=f.scoreA;if(f.scoreH>f.scoreA){h.w++;h.pts+=3}else if(f.scoreH<f.scoreA)h.l++;else{h.d++;h.pts++;}}if(a){a.pj++;a.gf+=f.scoreA;a.gc+=f.scoreH;if(f.scoreA>f.scoreH){a.w++;a.pts+=3}else if(f.scoreA<f.scoreH)a.l++;else{a.d++;a.pts++;}}}return Object.values(rows).map(x=>({...x,gd:x.gf-x.gc})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name,'es'));}
export function standings(s,group){const names=Object.values(s.teams).filter(t=>t.country==='Veltrania'&&(group==='annual'?t.division==='LSV':t.group===group)).map(t=>t.name);const matches=group==='S'?s.fixtures.filter(f=>f.competition==='LPV'):group==='annual'?annualMatches(s):s.fixtures.filter(f=>f.competition==='LSV');return ranking(matches,names)}
export function leagueMatches(s,round,division='LSV'){return s.fixtures.filter(f=>f.round===round&&f.competition===division).sort((a,b)=>(a.slot||0)-(b.slot||0)||a.id.localeCompare(b.id))}
export function getLeagueNextRound(s){for(let rd=1;rd<=18;rd++){const f=s.fixtures.filter(m=>m.round===rd&&['LSV','LPV'].includes(m.competition));if(f.some(m=>!played(m)))return rd;}return 19}
function poisson(lambda,r){let l=Math.exp(-lambda),p=1,k=0;do{p*=r();k++}while(p>l&&k<9);return Math.min(6,k-1)}
function weightedPlayer(team,r,eleven){const candidates=(eleven||team.players.slice(0,11)).filter(p=>p.pos!=='POR');const weighted=candidates.map(p=>({p,w:['DC','ED','EI','MCO','MP'].includes(p.pos)?7:['MC','MI','MD'].includes(p.pos)?3:1}));const tot=weighted.reduce((sum,v)=>sum+v.w,0);let v=r()*tot;for(const x of weighted){v-=x.w;if(v<0)return x.p}return candidates[0];}
function addNews(s,category,title,description,related){s.news.unshift({id:'n-'+s.seed+'-'+(s.news.length+1),category,title,description,related,date:cycleName(s)+' · Jornada '+Math.max(s.leagueRound,1)});if(s.news.length>240)s.news=s.news.slice(0,240)}
function rate(team,lineup=matchLineup(team)){const avg=lineupStrength(team,lineup);return (team.rating*.65+avg*.35);}
export function simulateMatch(s,match,options={}){
  if(played(match))return match;
  const home=s.teams[match.home],away=s.teams[match.away];if(!home||!away)throw Error('Club desconocido');
  const r=seeded('match-'+match.id+'-'+s.seed);
  const selectedH=matchLineup(home),selectedA=matchLineup(away);
  const startersH=selectedH.starters,startersA=selectedA.starters;
  const hRating=rate(home,selectedH),aRating=rate(away,selectedA);
  const attackBonus=t=>t.tactic==='Presión alta'?.13:t.tactic==='Contraataque'?.08:t.tactic==='Posesión'?.10:0;
  const expH=within(1.24+(hRating-aRating)*.036+.18+attackBonus(home)+(home.morale-70)*.003,.36,3.0);
  const expA=within(1.18+(aRating-hRating)*.036+attackBonus(away)+(away.morale-70)*.003,.36,3.0);
  let sh=poisson(expH,r),sa=poisson(expA,r);
  const events=[];
  for(const t of [home,away])for(const p of t.players)if((p.outGames||0)>0)p.outGames--;
  const addEvent=(min,type,side,p1=null,p2=null)=>events.push({min,type,side,p1:p1?.id??null,p1Name:p1?.name??null,p2:p2?.id??null,p2Name:p2?.name??null});
  for(const [count,side,team] of [[sh,'home',home],[sa,'away',away]]){
    for(let i=0;i<count;i++){const eleven=side==='home'?startersH:startersA;const scorer=weightedPlayer(team,r,eleven),assist=r()<.72?weightedPlayer(team,r,eleven):null;addEvent(3+Math.floor(r()*90),'goal',side,scorer,assist?.id!==scorer.id?assist:null);}
  }
  const yellowH=Math.floor(r()*4),yellowA=Math.floor(r()*4);
  for(const [count,side,starters] of [[yellowH,'home',startersH],[yellowA,'away',startersA]])for(let i=0;i<count;i++)addEvent(10+Math.floor(r()*80),'yellow',side,pick(starters.filter(p=>p.pos!=='POR'),r));
  if(r()<.10){const side=r()<.5?'home':'away';const roster=side==='home'?startersH:startersA;addEvent(45+Math.floor(r()*47),'red',side,pick(roster.filter(p=>p.pos!=='POR'),r));}
  const usedSubs={home:new Set(),away:new Set()};
  for(const [side,chosen] of [['home',selectedH],['away',selectedA]]){
   const outgoing=chosen.starters.slice(1);
   for(const min of [54+Math.floor(r()*18),74+Math.floor(r()*16)]){
    const bench=chosen.bench.filter(p=>!usedSubs[side].has(p.id));
    if(!bench.length||!outgoing.length)break;
    const out=pick(outgoing,r),incoming=pick(bench,r);
    if(out&&incoming){addEvent(min,'sub',side,out,incoming);usedSubs[side].add(incoming.id);outgoing.splice(outgoing.indexOf(out),1);}
   }
  }
  if(r()<.14){const side=r()<.5?'home':'away';addEvent(25+Math.floor(r()*60),'injury',side,pick((side==='home'?startersH:startersA).filter(p=>p.pos!=='POR'),r));}
  events.sort((a,b)=>a.min-b.min|| (a.type==='goal'?-1:1));
  const shotsH=Math.max(sh+1,Math.floor(6+r()*11+sh)),shotsA=Math.max(sa+1,Math.floor(5+r()*10+sa));
  let poss=within(Math.round(50+(hRating-aRating)*.4+(r()-.5)*23),30,70);
  match.scoreH=sh;match.scoreA=sa;match.played=true;match.legacy=false;match.events=events;match.stats={posH:poss,posA:100-poss,shotsH,shotsA,onH:within(sh+Math.floor(r()*6),sh,shotsH),onA:within(sa+Math.floor(r()*6),sa,shotsA),cornersH:Math.floor(2+r()*9),cornersA:Math.floor(2+r()*9),foulsH:7+Math.floor(r()*13),foulsA:7+Math.floor(r()*13),xgH:+(expH+(r()-.5)*.6).toFixed(2),xgA:+(expA+(r()-.5)*.6).toFixed(2)};
  match.lineups={home:startersH.map(p=>p.id),away:startersA.map(p=>p.id)};
  match.bench={home:selectedH.bench.map(p=>p.id),away:selectedA.bench.map(p=>p.id)};
  match.captains={home:selectedH.captain,away:selectedA.captain};
  match.lineupDetails={home:startersH.map(p=>({name:p.name,number:p.number,pos:p.pos,form:p.form})),away:startersA.map(p=>({name:p.name,number:p.number,pos:p.pos,form:p.form}))};
  match.coachAtKickoff={home:home.coach,away:away.coach,homeFormation:selectedH.formation,awayFormation:selectedA.formation,homeTactic:home.tactic,awayTactic:away.tactic};
  for(const [side,team,score,concede] of [['home',home,sh,sa],['away',away,sa,sh]]){
    const starters=team===home?startersH:startersA;for(const p of starters){p.apps++;p.form=+(within(6.1+(score-concede)*.24+(r()-.5)*2,4,9.9)).toFixed(1)}
    const used=team===home?usedSubs.home:usedSubs.away;for(const id of used){const sub=team.players.find(p=>p.id===id);if(sub)sub.apps++;}
    const outcome=score>concede?3:score===concede?1:-3;team.morale=within(team.morale+outcome,20,99);team.board=within(team.board+Math.sign(outcome),10,100);
  }
  for(const ev of events){const team=ev.side==='home'?home:away;const p=team.players.find(x=>x.id===ev.p1);const p2=team.players.find(x=>x.id===ev.p2);if(ev.type==='goal'){if(p)p.goals++;if(p2)p2.assists++;}else if(ev.type==='yellow'&&p)p.yellows++;else if(ev.type==='red'&&p)p.reds++;else if(ev.type==='injury'&&p){p.injuries++;p.outGames=Math.max(1,2+Math.floor(r()*4)-Math.floor((team.facility?.medical||1)/2));}}
  const big=Math.abs(sh-sa)>=3;
  const winner=sh>sa?home:sh<sa?away:null;
  match.headline=winner?(big?`¡Exhibición de ${winner.name}!`:`${winner.name} se lleva tres puntos`):`Reparto de puntos entre ${home.name} y ${away.name}`;
  match.summary=winner?`${winner.name} derrotó ${sh}-${sa} a ${winner===home?away.name:home.name} en ${home.stadium}. ${big?'Una actuación contundente que sacudió la jornada.':'Un encuentro competido que dejó emociones en las dos áreas.'}`:`${home.name} y ${away.name} empataron ${sh}-${sa} en ${home.stadium}, en un duelo donde ninguno consiguió inclinar definitivamente la balanza.`;
  // Registro ambiental y económico por club; no altera la probabilidad del resultado ya calculado.
  for(const [team,scored,conceded] of [[home,sh,sa],[away,sa,sh]]){
    if(!team.supporters)team.supporters={mood:60,attendance:0,lastAttendance:0,protests:0};
    team.supporters.mood=within(team.supporters.mood+(scored>conceded?4:scored===conceded?0:-4),5,99);
    if(team===home){const cap=team.capacity||24000;const attendance=Math.round(cap*within(.42+team.supporters.mood/180+(r()-.5)*.12,.35,1));team.supporters.lastAttendance=attendance;team.supporters.attendance+=attendance;team.budget=+((team.budget||4)+attendance*.000008).toFixed(3);}
    if(!team.rivalryRecords)team.rivalryRecords={};
  }
  if(!match.referee){const referee=pick(FIRST_NAMES,r)+' '+pick(LAST_NAMES,r);match.referee={name:referee,strictness:1+Math.floor(r()*5),varChecks:0};}
  if(!options.silent&&r()<.23){match.referee.varChecks++;events.push({min:Math.min(90,18+Math.floor(r()*68)),type:'var',side:r()<.5?'home':'away',p1Name:'Revisión VAR sin alterar el resultado'});events.sort((a,b)=>a.min-b.min);}
  const relation=(home.rivalryRecords[away.name]||{games:0,w:0,d:0,l:0,gf:0,gc:0});relation.games++;relation.gf+=sh;relation.gc+=sa;if(sh>sa)relation.w++;else if(sh<sa)relation.l++;else relation.d++;home.rivalryRecords[away.name]=relation;
  const reverse=(away.rivalryRecords[home.name]||{games:0,w:0,d:0,l:0,gf:0,gc:0});reverse.games++;reverse.gf+=sa;reverse.gc+=sh;if(sa>sh)reverse.w++;else if(sa<sh)reverse.l++;else reverse.d++;away.rivalryRecords[home.name]=reverse;
  if(!options.silent){seniorYouthDevelopment(s,match);addNews(s,match.competition,match.headline,match.summary,match.id);}
  return match;
}
export function finalizeLeagueRound(s,round){if(s.leagueRound>=round)return false;const games=s.fixtures.filter(f=>f.round===round&&['LSV','LPV'].includes(f.competition));if(!games.length||games.some(f=>!played(f)))return false;s.leagueRound=round;reviewCoaches(s,round);
  if(round===18){setupPostseason(s);if(ensureMarket(s).market.status!=='open')openMarket(s,s.season===2026?`Mercado de verano · tras el Apertura 2026`:`Mercado · tras ${cycleName(s)}`);if(cycleIsAnnualFinal(s)&&!s.honours.some(h=>h.title==='Escudo de Oro de Veltrania'&&Number(h.season)===s.season)){const annual=standings(s,'annual');s.honours.push({title:'Escudo de Oro de Veltrania',winner:annual[0].name,season:String(s.season),edition:cyclePhase(s)});s.teams[annual[0].name].trophies.push(`Escudo de Oro · ${s.season}`);addNews(s,'Campeonato',`${annual[0].name} conquista el Escudo de Oro ${s.season}`,`Lidera la tabla anual acumulada de ${s.season}.`);}}
  return true;}
export function simulateLeagueRound(s){const round=getLeagueNextRound(s);if(round>18)throw Error('El campeonato ya completó sus 18 jornadas');const matches=s.fixtures.filter(f=>f.round===round&&['LSV','LPV'].includes(f.competition));const newly=matches.filter(f=>!played(f));for(const m of newly)simulateMatch(s,m);finalizeLeagueRound(s,round);
  return {round,matches:newly};}
export function scorers(s,limit=18){return Object.values(s.teams).flatMap(t=>t.players.map(p=>({...p,club:t.name}))).filter(p=>p.goals||p.assists).sort((a,b)=>b.goals-a.goals||b.assists-a.assists).slice(0,limit)}
export function changeCoach(s,name,newCoach){const t=s.teams[name];if(!t||!newCoach?.trim())throw Error('Datos inválidos');const old=t.coach;t.coachHistory.unshift({out:old,in:newCoach.trim(),round:s.leagueRound});t.coach=newCoach.trim();t.board=within(t.board-7,10,100);addNews(s,'Directivas',`${name} cambia de entrenador`,`La directiva destituye a ${old} y anuncia a ${newCoach.trim()} como nuevo DT.`);return old;}
export function movePlayer(s,id,from,to){const a=s.teams[from],b=s.teams[to];if(!a||!b||from===to)throw Error('Equipos inválidos');const index=a.players.findIndex(p=>String(p.id)===String(id));if(index<0||a.players.length<=11)throw Error('No se puede realizar el traspaso');const [player]=a.players.splice(index,1);b.players.push(player);s.transfers.unshift({player:player.name,from,to,round:s.leagueRound});addNews(s,'Mercado',`${player.name} ficha por ${to}`,`Traspaso confirmado desde ${from} hacia ${to}.`);return player;}
export function leagueSummary(s){const total=s.fixtures.filter(f=>played(f)&&['LSV','LPV'].includes(f.competition));return {matches:total.length,goals:total.reduce((n,f)=>n+f.scoreH+f.scoreA,0),round:getLeagueNextRound(s)-1};}
export function isCupGroupComplete(s){return s.cup.fixtures.filter(f=>f.group?.length===1).every(played)}
function cupQualifierNames(s){const rows=CUP_GROUPS.map((g,i)=>ranking(s.cup.fixtures,g).map(x=>({...x,group:String.fromCharCode(65+i)})));
 const direct=rows.flatMap(r=>r.slice(0,2));const thirds=rows.map(r=>r[2]).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf).slice(0,2);return [...direct,...thirds].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf).map(x=>x.name);}
function knockoutRound(id,participants,number,stage,clubs,cycle=''){const n=participants.length;const fixtures=[];for(let i=0;i<n/2;i++){const high=participants[i],low=participants[n-1-i],a=clubs[high],b=clubs[low];const lower=a?.division==='LPV'&&b?.division==='LSV'?high:b?.division==='LPV'&&a?.division==='LSV'?low:high;const other=lower===high?low:high;fixtures.push({id:`${id}-${stage}-${i}${cycle?'-'+cycle:''}`,competition:id,group:stage,round:number,slot:0,home:lower,away:other,played:false,legacy:false,scoreH:null,scoreA:null});}return fixtures;}
export function simulateCupRound(s){const cup=s.cup;if(cup.champion)throw Error('La Copa ya tiene campeón');let upcoming=cup.fixtures.filter(f=>f.round===cup.round);if(!upcoming.length)throw Error('No quedan encuentros pendientes');for(const m of upcoming)if(!played(m))simulateMatch(s,m);if(cup.phase==='groups'){
 if(cup.round<3)cup.round++;else{cup.phase='octavos';cup.round=4;cup.fixtures.push(...knockoutRound('CUP',cupQualifierNames(s),4,'octavos',s.teams,cycleKey(s)));}
 }else{
   const winners=upcoming.map(m=>{if(m.scoreH===m.scoreA){const r=seeded(m.id+'-pen-'+s.seed);m.penalties=r()<.5?`${4+Math.floor(r()*2)}-${2+Math.floor(r()*2)}`:`${2+Math.floor(r()*2)}-${4+Math.floor(r()*2)}`;m.winner=Number(m.penalties.split('-')[0])>Number(m.penalties.split('-')[1])?m.home:m.away;}else m.winner=m.scoreH>m.scoreA?m.home:m.away;return m.winner;});
   if(winners.length===1){cup.champion=winners[0];cup.phase='finalizada';s.honours.push({title:s.season===2026?'Copa de las Provincias':`Copa de las Provincias · ${cycleName(s)}`,winner:winners[0],season:String(s.season),edition:cyclePhase(s)});s.teams[winners[0]].trophies.push(`Copa de las Provincias · ${cycleName(s)}`);addNews(s,'Copa',`¡${winners[0]} gana la Copa en ${cycleName(s)}!`,'La edición copera tiene nuevo campeón.');}
   else{const stages={octavos:'cuartos',cuartos:'semifinales',semifinales:'final'};cup.phase=stages[cup.phase]||'final';cup.round++;cup.fixtures.push(...knockoutRound('CUP',winners,cup.round,cup.phase,s.teams,cycleKey(s)));}
 }
 return upcoming;
}
// Torneos personalizados: una vuelta, ida y vuelta, eliminatoria, Recopa y grupos.
// Se añaden sin reemplazar la lógica de los torneos históricos.
function tournamentFixture(id,group,round,slot,home,away,extra=''){
 return {id:`${id}-${group}-${round}-${slot}`,competition:id,group,round,slot,home,away,extra,played:false,legacy:false,scoreH:null,scoreA:null};
}
function oneLegCalendar(id,teams,group='liga',roundOffset=0){
 const arr=teams.length%2===0?[...teams]:[...teams,null],out=[],n=arr.length;let ring=arr.slice();
 for(let rd=1;rd<n;rd++){
  for(let i=0;i<n/2;i++){
   const a=ring[i],b=ring[n-1-i];if(a&&b){const [h,v]=(rd+i)%2?[b,a]:[a,b];out.push(tournamentFixture(id,group,roundOffset+rd,i,h,v));}
  }
  ring=[ring[0],ring[n-1],...ring.slice(1,-1)];
 }
 return out;
}
function appendBracket(c,entries,round){
 if(entries.length<2)throw Error('La eliminatoria necesita dos participantes');
 const nextPow=2**Math.ceil(Math.log2(entries.length)),byes=nextPow-entries.length;
 c.pendingByes=entries.slice(0,byes);
 const participants=entries.slice(byes),size=participants.length;
 for(let i=0;i<size/2;i++) c.fixtures.push(tournamentFixture(c.id,'eliminatoria',round,i,participants[i],participants[size-1-i]));
 c.stage='eliminatoria';c.round=round;
}
function titleCustom(s,c,winner){c.champion=winner;c.stage='finalizada';if(Number(c.prize)>0){s.teams[winner].budget=+(Number(s.teams[winner].budget||0)+Number(c.prize)/1000000).toFixed(3);}s.honours.push({title:c.name,winner,season:String(s.season||2026)});s.teams[winner].trophies.push(c.name+' · '+s.season);addNews(s,'Títulos',`¡${winner} conquista ${c.name}!`,`El primer campeón de ${c.name} queda inscrito en los registros del universo.`);}
function decideCupWinner(s,m){if(m.scoreH!==m.scoreA){m.winner=m.scoreH>m.scoreA?m.home:m.away;return m.winner;}
 const r=seeded('knockout-'+m.id+'-'+s.seed);m.extraTime=true;
 const homeWins=r()<.5;m.penalties=homeWins?'5-4':'4-5';m.winner=homeWins?m.home:m.away;return m.winner;
}
function customAggregateWinner(s,first,second){const a=first.home,b=first.away,goalsA=first.scoreH+second.scoreA,goalsB=first.scoreA+second.scoreH;if(goalsA!==goalsB)return goalsA>goalsB?a:b;second.extraTime=true;const r=seeded('aggr-'+first.id+'-'+s.seed);const homeWins=r()<.5;second.penalties=homeWins?'5-4':'4-5';return homeWins?second.home:second.away;}
export function createCompetition(s,name,clubNames,format='league'){
 const formats=['league','league2','cup','recopa','groups','apertura'];if(!formats.includes(format))throw Error('Formato de torneo desconocido');
 const names=clubNames||[];
 if(!name?.trim()||name.trim().length>65||!Array.isArray(names)||names.length<2||names.length>32||new Set(names).size!==names.length)throw Error('Elegí nombre y entre 2 y 32 clubes distintos.');
 if(names.some(x=>!isKnownTeam(s,x)))throw Error('Hay un club desconocido');
 if(format==='apertura'&&names.length!==18)throw Error('Un Apertura requiere exactamente 18 equipos (9 por zona).');
 if(format==='recopa'&&names.length!==2)throw Error('La Recopa requiere exactamente dos clubes.');
 if(format==='groups'&&(names.length<4||names.length%4!==0))throw Error('La fase de grupos requiere 4, 8, 12… hasta 32 clubes.');
 const id='CUSTOM-'+Date.now()+'-'+Math.floor(Math.random()*1e7),teams=[...names];
 const c={id,name:name.trim(),type:format,teams,fixtures:[],round:1,champion:null,stage:'inicio',pendingByes:[],groups:[]};
 if(format==='apertura'){
  const groupA=teams.filter((_,i)=>i%2===0),groupB=teams.filter((_,i)=>i%2!==0);
  c.groups=[{id:'A',teams:groupA},{id:'B',teams:groupB}];
  const a=TEAMS.filter(t=>t.country==='Veltrania'&&t.group==='A'),b=TEAMS.filter(t=>t.country==='Veltrania'&&t.group==='B');const mapped=Object.fromEntries([...a.map((t,i)=>[t.name,groupA[i]]),...b.map((t,i)=>[t.name,groupB[i]])]);
  c.fixtures=FIXTURES.filter(f=>f.competition==='LSV').map(f=>({...f,id:id+'-'+f.id,home:mapped[f.home],away:mapped[f.away],played:false,scoreH:null,scoreA:null,legacy:false,phase:'regular'}));
  c.stage='regular';
 }else if(format==='league'||format==='league2'){
   const first=oneLegCalendar(id,teams,'liga');c.fixtures.push(...first);
   if(format==='league2'){const k=teams.length%2===0?teams.length-1:teams.length;
    for(const f of first)c.fixtures.push(tournamentFixture(id,'liga',f.round+k,f.slot,f.away,f.home));
   }
   c.stage='liga';
 }else if(format==='recopa'){
   c.fixtures.push(tournamentFixture(id,'recopa',1,0,teams[0],teams[1],'Estadio neutral · final a partido único'));
   c.stage='final';
 }else if(format==='groups'){
   const gCount=teams.length/4;c.groups=Array.from({length:gCount},(_,i)=>({id:String.fromCharCode(65+i),teams:teams.slice(i*4,i*4+4)}));
   for(const g of c.groups)c.fixtures.push(...makeGroupFixtures(g.teams,g.id,id));
   c.stage='grupos';
 }else{
   const rng=seeded(id+'-draw');const draw=teams.slice().sort(()=>rng()-.5);
   appendBracket(c,draw,1);
 }
 s.competitions.push(c);
 addNews(s,'Competiciones',`Nace ${c.name}`,`Se funda una nueva competición (${format}) con ${teams.length} clubes de Noveria.`);
 return id;
}
export function simulateCustomRound(s,id){
 const c=s.competitions.find(x=>x.id===id);if(!c||c.champion)throw Error('Competición no disponible');
 const pending=c.fixtures.filter(f=>f.round===c.round);if(!pending.length)throw Error('No hay partidos programados');
 for(const m of pending)if(!played(m))simulateMatch(s,m);
 if(c.type==='apertura'){
  if(c.stage==='regular'){
    if(c.round<18)c.round++;
    else{
      const first=[...ranking(c.fixtures.filter(f=>f.phase==='regular'),c.groups[0].teams).slice(0,2),...ranking(c.fixtures.filter(f=>f.phase==='regular'),c.groups[1].teams).slice(0,2)].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
      c.seeds=first.map(x=>x.name);c.annual=ranking(c.fixtures.filter(f=>f.phase==='regular'),c.teams)[0].name;
      s.honours.push({title:'Escudo de Oro · '+c.name,winner:c.annual,season:String(s.season)});
      c.stage='semifinal';c.round=19;
      for(const [k,[a,b]] of [[first[0].name,first[3].name],[first[1].name,first[2].name]].entries()){
       const one=tournamentFixture(c.id,'semifinal',19,k*2,b,a);one.phase='semifinal';one.leg=1;
       const two=tournamentFixture(c.id,'semifinal',20,k*2+1,a,b);two.phase='semifinal';two.leg=2;
       c.fixtures.push(one,two);
      }
    }
  }else if(c.stage==='semifinal'){
    if(c.round===19)c.round=20;
    else{
      const sf=c.fixtures.filter(x=>x.phase==='semifinal');const finalists=[];
      for(let k=0;k<2;k++){const a=sf[k*2],b=sf[k*2+1];let left=a.scoreH+b.scoreA,right=a.scoreA+b.scoreH;finalists.push(customAggregateWinner(s,a,b));}
      const higher=c.seeds.indexOf(finalists[0])<c.seeds.indexOf(finalists[1])?finalists[0]:finalists[1],lower=higher===finalists[0]?finalists[1]:finalists[0];
      c.fixtures.push(Object.assign(tournamentFixture(c.id,'final',21,0,lower,higher),{phase:'final',leg:1}),Object.assign(tournamentFixture(c.id,'final',22,0,higher,lower),{phase:'final',leg:2}));c.stage='final';c.round=21;
    }
  }else if(c.stage==='final'){
    if(c.round===21)c.round=22;
    else{
      const [a,b]=c.fixtures.filter(x=>x.phase==='final');const left=a.scoreH+b.scoreA,right=a.scoreA+b.scoreH;const champ=customAggregateWinner(s,a,b);c.apertura=champ;const challenger=champ===c.annual?ranking(c.fixtures.filter(f=>f.phase==='regular'),c.teams)[1].name:c.annual;
      c.fixtures.push(Object.assign(tournamentFixture(c.id,'recopa',23,0,champ,challenger,'Cancha neutral'),{phase:'recopa'}));c.stage='recopa';c.round=23;
    }
  }else{const champ=c.apertura;const winner=decideCupWinner(s,pending[0]);s.honours.push({title:'Recopa · '+c.name,winner,season:String(s.season)});titleCustom(s,c,champ);}
 }else if(c.type==='league'||c.type==='league2'){
  if(c.fixtures.every(played))titleCustom(s,c,ranking(c.fixtures,c.teams)[0].name);
  else c.round++;
 }else if(c.type==='recopa'){
  titleCustom(s,c,decideCupWinner(s,pending[0]));
 }else if(c.stage==='grupos'){
  if(c.round<3)c.round++;
  else{
   const members=c.groups.flatMap(g=>ranking(c.fixtures.filter(f=>f.group===g.id),g.teams).slice(0,2).map(row=>({...row,group:g.id})));
   const tops=members.filter((v,i)=>i%2===0).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
   const seconds=members.filter((v,i)=>i%2===1).sort((a,b)=>a.pts-b.pts||a.gd-b.gd||a.gf-b.gf);
   const paired=[];
   while(tops.length){const winner=tops.shift(),idx=seconds.findIndex(x=>x.group!==winner.group),second=seconds.splice(idx<0?0:idx,1)[0];paired.push(winner.name,second.name);}
   const order=[...paired.filter((_,i)=>i%2===0),...paired.filter((_,i)=>i%2===1).reverse()];
   appendBracket(c,order,4);
  }
 }else{
  const winners=pending.map(m=>decideCupWinner(s,m));
  const next=[...(c.pendingByes||[]),...winners];c.pendingByes=[];
  if(next.length===1)titleCustom(s,c,next[0]);else appendBracket(c,next,c.round+1);
 }
 return pending;
}
export function validateImport(data){if(!data||data.version!==1||typeof data.teams!=='object'||!Array.isArray(data.fixtures)||!data.cup||!Array.isArray(data.competitions))throw Error('Archivo de partida incompatible');if(!data.teams['Unión Popular Aurena'])throw Error('La partida no contiene los clubes de Veltrania');return data;}

function finalFixture(s,stage,leg,a,b,extra=''){return {id:`POST-${cycleKey(s)}-${stage}-${leg}-${a.slice(0,4)}-${b.slice(0,4)}`,competition:'POST',group:stage,round:leg,slot:0,home:a,away:b,scoreH:null,scoreA:null,played:false,legacy:false,extra};}
export function setupPostseason(s){if(s.postseason?.stage!=='locked')return;const winners=[...standings(s,'A').slice(0,2),...standings(s,'B').slice(0,2)].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);s.postseason.stage='semifinales';s.postseason.leg=1;s.postseason.seeds=winners.map(t=>t.name);s.postseason.fixtures=[];for(const [a,b] of [[winners[0].name,winners[3].name],[winners[1].name,winners[2].name]]){s.postseason.fixtures.push(finalFixture(s,'semifinales',1,b,a));s.postseason.fixtures.push(finalFixture(s,'semifinales',2,a,b));}}
function legWinner(s,fixtures){const [first,second]=fixtures;const a=first.home,b=first.away,ga=first.scoreH+second.scoreA,gb=first.scoreA+second.scoreH;if(ga!==gb)return ga>gb?a:b;const rng=seeded('post-pen-'+first.id+'-'+s.seed);second.penalties=rng()<.5?'5-4':'4-5';second.extraTime=true;return second.penalties==='5-4'?second.home:second.away;}
export function simulatePostseasonRound(s){const p=s.postseason;if(!p||p.stage==='locked'||p.stage==='finalizada')throw Error('Todavía no está disponible la fase final');const games=p.fixtures.filter(f=>f.group===p.stage&&f.round===p.leg);if(!games.length)throw Error('No hay partidos pendientes');games.forEach(m=>{if(!played(m))simulateMatch(s,m)});
 if(p.stage==='semifinales'){
  if(p.leg===1)p.leg=2;else{
   const rounds=p.fixtures.filter(f=>f.group==='semifinales');const winners=[legWinner(s,rounds.slice(0,2)),legWinner(s,rounds.slice(2,4))];const order=standings(s,'annual').map(x=>x.name);winners.sort((a,b)=>order.indexOf(a)-order.indexOf(b));const high=winners[0],low=winners[1];p.fixtures.push(finalFixture(s,'final',1,low,high),finalFixture(s,'final',2,high,low));p.stage='final';p.leg=1;
  }
 }else if(p.stage==='final'){
  if(p.leg===1)p.leg=2;else{const finals=p.fixtures.filter(f=>f.group==='final');const winner=legWinner(s,finals);p[cyclePhase(s).toLowerCase()]=winner;s.honours.push({title:cycleName(s),winner,season:String(s.season),edition:cyclePhase(s)});s.teams[winner].trophies.push(cycleName(s));s.teams[winner].budget+=.01;addNews(s,'Campeones',`${winner} es campeón de ${cycleName(s)}`,`Conquista la Liga Suprema Veltrana en ${cycleName(s)}.`);const annual=standings(s,'annual').map(t=>t.name),opponent=annual[0]===winner?annual[1]:annual[0];p.fixtures.push(finalFixture(s,'recopa',1,winner,opponent,'Sede neutral · Estadio Nacional de Veltrania'));p.stage='recopa';p.leg=1;}
 }else if(p.stage==='recopa'){
 const final=games[0];if(final.scoreH===final.scoreA){const r=seeded(final.id+'-recopa-'+s.seed);final.extraTime=true;final.penalties=r()<.5?'5-4':'4-5';}const champ=final.scoreH>final.scoreA?final.home:final.scoreH<final.scoreA?final.away:final.penalties==='5-4'?final.home:final.away;p.recopa=champ;p.stage='finalizada';s.honours.push({title:s.season===2026?'Recopa Veltrana':`Recopa Veltrana · ${cycleName(s)}`,winner:champ,season:String(s.season),edition:cyclePhase(s)});s.teams[champ].trophies.push(`Recopa Veltrana · ${cycleName(s)}`);addNews(s,'Campeones',`${champ} levanta la Recopa de ${cycleName(s)}`,'Título oficial definido a partido único.');
 }return games;
}

function reviewCoaches(s,round){for(const t of Object.values(s.teams).filter(t=>t.division!=='EXT')){
  const lastChange=t.coachHistory[0]?.round??0;if(round-lastChange<4)continue;
  const results=s.fixtures.filter(f=>played(f)&&['LSV','LPV'].includes(f.competition)&&[f.home,f.away].includes(t.name))
    .sort((a,b)=>a.round-b.round||(a.slot||0)-(b.slot||0));
  const recent=results.slice(-4);if(recent.length<4)continue;
  const losses=recent.filter(f=>f.home===t.name?f.scoreH<f.scoreA:f.scoreA<f.scoreH).length;
  if(losses===4&&t.board<=68){const r=seeded('firing-'+t.name+'-'+round+'-'+s.seed);if(r()<.25){const replacement=pick(FIRST_NAMES,r)+' '+pick(LAST_NAMES,r);changeCoach(s,t.name,replacement);if(s.mode==='manager'&&s.managedClub===t.name){s.mode='president';addNews(s,'Directivas','El entrenador-jugador ha sido destituido',`La directiva de ${t.name} decidió poner fin al proyecto tras cuatro derrotas consecutivas.`);}}}
 }}


// NOVERIA 3 · MERCADO DE PASES. Los precios y presupuestos se expresan en MILLONES de VLR.
// El antiguo p.value es miles de VLR: value / 1000 = M VLR.
export function ensureMarket(s){
 if(!s.market||typeof s.market!=='object')s.market={};
 const m=s.market;
 if(!['open','closed'].includes(m.status))m.status='closed';
 m.cycle=Number.isInteger(m.cycle)?m.cycle:0;
 m.day=Number.isInteger(m.day)?m.day:0;
 m.maxDays=12;
 m.title=typeof m.title==='string'?m.title:'Mercado de Noveria';
 for(const k of ['offers','shortlist','log','training'])if(!Array.isArray(m[k]))m[k]=[];
 if(!('lastReport'in m))m.lastReport=null;
 return s;
}
export function marketValuation(p){return +(Number(p.value||500)/1000).toFixed(2)}
export function marketCanManage(s,buyer){return s.mode!=='manager'||s.managedClub===buyer}
export function openMarket(s,title='Mercado de pases de Noveria'){
 ensureMarket(s);const m=s.market;
 if(m.status==='open')throw Error('Ya existe una ventana de pases abierta.');
 m.status='open';m.day=1;m.cycle++;m.title=title;m.offers=[];m.log=[];m.training=[];
 addNews(s,'Mercado',`¡Abrió ${title}!`,'Doce días de negociaciones, fichajes y sorpresas antes del cierre de operaciones.');
 return m;
}
function validMarketTeam(s,buyer){const m=ensureMarket(s).market;if(m.status!=='open')throw Error('El mercado está cerrado. Abrilo para negociar fichajes.');
 if(!s.teams[buyer])throw Error('Elegí un club válido.');
 if(!marketCanManage(s,buyer))throw Error('En modo DT solo podés fichar para el club que dirigís.');
 return s.teams[buyer];}
function marketTransfer(s,seller,buyer,playerId,fee,wage,years,method='negociado'){
 ensureMarket(s);const from=s.teams[seller],to=s.teams[buyer];
 if(!from||!to||seller===buyer)throw Error('Clubes inválidos');
 let ix=from.players.findIndex(p=>String(p.id)===String(playerId));if(ix<0)throw Error('El futbolista ya no está disponible');
 if(from.players.length<=17)throw Error('El club vendedor necesita mantener al menos 17 futbolistas');
 if(to.players.length>=30)throw Error('El club comprador ya tiene 30 futbolistas');
 if(!Number.isFinite(fee)||fee<0.05||!Number.isFinite(wage)||wage<15||!Number.isInteger(years)||years<1||years>5)throw Error('Cifras del contrato inválidas');
 if(Number(to.budget||0)<fee)throw Error('Presupuesto insuficiente para cerrar el fichaje');
 const player=from.players[ix];if(wage < Number(player.salary||50)*0.83)throw Error('El futbolista rechazó el salario ofrecido');
 from.players.splice(ix,1);to.players.push(player);
 from.budget=+(Number(from.budget||0)+fee).toFixed(3);to.budget=+(Number(to.budget||0)-fee).toFixed(3);
 player.salary=Math.round(wage);player.contractYears=years;player.signedBy=buyer;
 const rec={id:'tr-'+s.market.cycle+'-'+(s.transfers.length+1),player:player.name,playerId:player.id,from:seller,to:buyer,fee:+fee.toFixed(2),wage:player.salary,years,round:s.leagueRound,window:s.market.cycle,day:s.market.day,method};
 s.transfers.unshift(rec);s.market.log.unshift(rec);
 addNews(s,'Mercado',`¡CONFIRMADO! ${player.name} ficha por ${buyer}`,`${seller} recibe ${fee.toFixed(2)} M VLR. ${player.name} firmó ${years} año(s) con salario de ${player.salary}.000 VLR mensuales.`);
 return rec;
}
export function submitMarketOffer(s,{buyer,seller,playerId,fee,wage,years}){
 validMarketTeam(s,buyer);ensureMarket(s);
 const from=s.teams[seller],to=s.teams[buyer];if(!from||seller===buyer)throw Error('Elegí un jugador de otro club');
 const p=from.players.find(x=>String(x.id)===String(playerId));if(!p)throw Error('Futbolista no disponible');
 if(from.players.length<=17||to.players.length>=30)throw Error('El fichaje no es viable por los límites de plantilla');
 fee=Number(fee);wage=Number(wage);years=Number(years);
 if(!Number.isFinite(fee)||fee<0.05||!Number.isFinite(wage)||wage<15||!Number.isInteger(years)||years<1||years>5)throw Error('Revisá la oferta y los años de contrato');
 if(to.budget<fee)throw Error('No tenés suficiente dinero para la oferta');
 const valuation=marketValuation(p),required=+(valuation*(1.10+Math.max(0,80-p.ovr)*.002)).toFixed(2);
 const offer={id:'offer-'+s.market.cycle+'-'+(s.market.offers.length+1),buyer,seller,playerId:p.id,player:p.name,fee,wage,years,day:s.market.day,status:'',asking:required};
 const r=seeded('offer-'+s.seed+'-'+offer.id+'-'+buyer+'-'+p.id);
 const ratio=fee/Math.max(.1,valuation);
 if(wage<p.salary*.83){offer.status='rejected';offer.reason='El jugador no acepta el salario propuesto';}
 else if(ratio<.76){offer.status='rejected';offer.reason='La directiva vendedora considera insuficiente la oferta';}
 else if(ratio<1.10 || (r()<.19&&ratio<1.22)){
   offer.status='counter';offer.asking=+(Math.max(required,fee*1.12)).toFixed(2);
   if(offer.asking>to.budget)offer.status='rejected',offer.reason='La contraoferta supera tu presupuesto';
 }else{const rec=marketTransfer(s,seller,buyer,p.id,fee,wage,years,'oferta del usuario');offer.status='accepted';offer.transferId=rec.id;}
 s.market.offers.unshift(offer);
 return offer;
}
export function acceptMarketCounter(s,id){
 ensureMarket(s);const o=s.market.offers.find(x=>x.id===id);if(!o||o.status!=='counter')throw Error('Esta contraoferta ya no está disponible');
 validMarketTeam(s,o.buyer);const rec=marketTransfer(s,o.seller,o.buyer,o.playerId,o.asking,o.wage,o.years,'contraoferta');o.status='accepted';o.transferId=rec.id;return rec;
}
export function rejectMarketCounter(s,id){ensureMarket(s);const o=s.market.offers.find(x=>x.id===id);if(!o||o.status!=='counter')throw Error('Esta oferta no está activa');o.status='declined';return o;}
export function toggleMarketScout(s,id){ensureMarket(s);let i=s.market.shortlist.indexOf(id);if(i>=0)s.market.shortlist.splice(i,1);else s.market.shortlist.push(id);return i<0;}
function aiDeal(s,day,attempt){
 const r=seeded('NOVERIA-AI-'+s.seed+'-'+s.market.cycle+'-'+day+'-'+attempt);
 const clubs=Object.values(s.teams).filter(t=>t.players.length<30&&t.budget>.6&&!(s.mode==='manager'&&s.managedClub===t.name));
 const buyer=pick(clubs,r);if(!buyer)return null;
 const sources=Object.values(s.teams).filter(t=>t.name!==buyer.name&&t.players.length>18&&!(s.mode==='manager'&&s.managedClub===t.name));if(!sources.length)return null;
 const seller=pick(sources,r);
 // Directores deportivos buscan posiciones escasas y refuerzos realistas.
 const top=buyer.players.slice(0,11);const weakest=top.slice().sort((a,b)=>a.ovr-b.ovr)[0];
 let candidates=seller.players.filter(p=>p.ovr>=buyer.rating-15&&p.ovr<=buyer.rating+17&&p.pos!=='POR'&&p.value/1000<buyer.budget*.65);
 if(weakest&&r()<.55){let byPosition=candidates.filter(p=>p.pos===weakest.pos);if(byPosition.length)candidates=byPosition;}
 if(!candidates.length)return null;
 const p=pick(candidates,r);const fee=+(marketValuation(p)*(.95+r()*.45)).toFixed(2),wage=Math.round(p.salary*(1.02+r()*.28)),years=1+Math.floor(r()*5);
 if(fee>buyer.budget*.73||seller.players.length<=18||r()<.25)return null;
 try{return marketTransfer(s,seller.name,buyer.name,p.id,fee,wage,years,'negociación automática')}catch{return null;}
}
export function advanceMarketDay(s){ensureMarket(s);const m=s.market;if(m.status!=='open')throw Error('No hay ninguna ventana abierta');
 const day=m.day,added=[];const attempts=12+(day===m.maxDays?30:0);
 for(let i=0;i<attempts;i++){const t=aiDeal(s,day,i);if(t)added.push(t)}
 if(day>=m.maxDays){m.status='closed';m.lastReport={title:m.title,cycle:m.cycle,transfers:m.log.length,automatic:m.log.filter(t=>t.method==='negociación automática').length,totalSpent:+m.log.reduce((v,t)=>v+t.fee,0).toFixed(2)};
  m.offers.forEach(o=>{if(o.status==='counter')o.status='expired'});
  // Desarrollo orgánico juvenil entre ventanas sin alterar partidos históricos.
  for(const t of Object.values(s.teams))for(const p of t.players){const rand=seeded('growth-'+s.seed+'-'+m.cycle+'-'+p.id);if(p.age<=23&&p.ovr<p.pot&&rand()<.12)p.ovr++;}
  addNews(s,'Mercado',`¡CIERRA EL MERCADO! ${m.log.length} operaciones`,`${m.title} concluye con ${m.log.length} traspasos. La dirección deportiva de cada club prepara la próxima etapa.`);
 }else m.day++;
 return {day,added,closed:m.status==='closed',report:m.lastReport};
}
export function finishMarket(s){ensureMarket(s);if(s.market.status!=='open')throw Error('Abrí el mercado antes de simularlo');const started=s.market.log.length;const updates=[];
 while(s.market.status==='open')updates.push(advanceMarketDay(s));
 return {added:s.market.log.length-started,report:s.market.lastReport,days:updates.length};
}
export function trainClub(s,name){validMarketTeam(s,name);const t=s.teams[name],m=s.market;
 if(m.training.includes(name))throw Error('Ya entrenaste a este equipo en este mercado');
 if(t.budget<.2)throw Error('El club necesita al menos 0,20 M VLR');
 t.budget=+(t.budget-.2).toFixed(3);m.training.push(name);
 const r=seeded('entreno-'+s.seed+'-'+m.cycle+'-'+name);
 const candidates=t.players.filter(p=>p.ovr<p.pot&&p.age<=27).sort((a,b)=>a.age-b.age||b.pot-a.pot);
 const result=candidates.slice(0,3).map(p=>{p.ovr++;p.form=+(Math.min(9.9,p.form+.2)).toFixed(1);return p.name});
 addNews(s,'Cantera',`${name} impulsa a sus promesas`,`La academia invirtió en desarrollo técnico: ${result.join(', ')||'trabajo físico de la plantilla'}.`);
 return result;
}

export function recruitAcademyPlayer(s,name){
 validMarketTeam(s,name);const t=s.teams[name];if(t.players.length>=30)throw Error('No hay plaza en la plantilla');
 if(t.budget<.35)throw Error('La cantera requiere al menos 0,35 M VLR');
 const cycle=s.market.cycle,id='academy-'+hash(name+'-'+cycle+'-'+t.players.length+'-'+s.market.day),r=seeded(id);
 const p={id,name:pick(FIRST_NAMES,r)+' '+pick(LAST_NAMES,r),number:31+Math.floor(r()*69),age:16+Math.floor(r()*4),nationality:t.country,pos:pick(POS,r),ovr:within(t.rating-18+Math.floor(r()*13),42,80),pot:within(t.rating+Math.floor(r()*24),55,95),salary:35,value:Math.floor(100+r()*700),apps:0,goals:0,assists:0,yellows:0,reds:0,injuries:0,form:6.4,contractYears:3,outGames:0};
 t.players.push(p);t.budget=+(t.budget-.35).toFixed(3);
 addNews(s,'Cantera',`${t.name} presenta a ${p.name}`,`La nueva promesa de ${p.age} años llega desde las divisiones menores. Posición ${p.pos}, OVR ${p.ovr}, potencial ${p.pot}.`);
 return p;
}

// NUEVAS TEMPORADAS: calendario renovado, ascensos/descensos e historia intacta.
export function startNextSeason(s){
 ensureMarket(s);if(s.postseason?.stage!=='finalizada')throw Error('Terminá la final y la Recopa antes de cambiar de torneo');
 if(s.market.status==='open')throw Error('Primero cerrá el mercado de pases antes del siguiente torneo');
 const complete=cycleIsAnnualFinal(s),old=s.season,next=cycleNext(s),newKey=next.season+'-'+next.edition;
 const fallenA=complete?standings(s,'A').at(-1).name:null,fallenB=complete?standings(s,'B').at(-1).name:null,
 promoted=complete?standings(s,'S').slice(0,2).map(r=>r.name):[];
 const oldArchive={season:s.season,edition:cyclePhase(s),key:cycleKey(s),fixtures:s.fixtures,cup:s.cup,
  postseason:s.postseason,annual:standings(s,'annual').map(r=>({...r})),A:standings(s,'A'),B:standings(s,'B'),
  second:standings(s,'S'),relegated:complete?[fallenA,fallenB]:[],promoted:[...promoted],calendar:s.calendar||null};
 s.archive.unshift(oldArchive);
 if(complete){
  const keys=Object.keys(s.slotMap);
  function swapNames(a,b){const k1=keys.find(k=>s.slotMap[k]===a),k2=keys.find(k=>s.slotMap[k]===b);
   if(!k1||!k2)throw Error('No se hallaron las plazas para '+a+' / '+b);
   [s.slotMap[k1],s.slotMap[k2]]=[s.slotMap[k2],s.slotMap[k1]];}
  swapNames(fallenA,promoted[0]);swapNames(fallenB,promoted[1]);
  for(const t of TEAMS.filter(t=>t.division!=='EXT')){const team=s.teams[s.slotMap[t.name]];team.group=t.group;team.division=t.division;}
 }
 for(const t of Object.values(s.teams)){
  if(next.season!==old){for(const p of t.youth||[]){p.age++;/* El OVR progresa por rendimiento; no por cumplir años. */}
   t.youth=(t.youth||[]).filter(p=>p.age<=21);
   for(const p of t.players){p.age++;if(Number.isInteger(p.contractYears)&&p.contractYears>1)p.contractYears--;}}
  for(const p of t.players)p.outGames=0;
  if(t.division==='LSV')t.budget=+(t.budget+1.4).toFixed(3);
  else if(t.division==='LPV')t.budget=+(t.budget+.8).toFixed(3);
 }
 s.season=next.season;s.edition=next.edition;
 s.fixtures=FIXTURES.map(f=>({id:f.id+'-'+newKey,competition:f.competition,group:f.group,round:f.round,slot:f.slot,seq:f.seq,
  home:s.slotMap[f.home],away:s.slotMap[f.away],scoreH:null,scoreA:null,played:false,legacy:false}));
 s.cup=initialCup();s.cup.fixtures.forEach(f=>f.id+='-'+newKey);
 s.postseason={stage:'locked',leg:1,fixtures:[],apertura:null,clausura:null,recopa:null};s.leagueRound=0;
 s.market.status='closed';s.market.offers=[];s.market.log=[];s.market.title='Mercado de Noveria';
 delete s.calendar;delete s.broadcast;
 addNews(s,'Nueva temporada',`¡Comienza ${cycleName(s)}!`,
  complete?`${promoted.join(' y ')} ascienden y ${fallenA}, ${fallenB} descienden.`
   :'Comienza otro torneo corto. La tabla anual sumará Clausura y Apertura.');
 return {season:s.season,edition:s.edition,name:cycleName(s),promoted,relegated:oldArchive.relegated};
}
