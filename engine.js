import {TEAMS,FIXTURES,FOREIGN_COUNTRIES} from './data.js';

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
export function freshState(){return {version:1,seed:Math.floor(Math.random()*1e8),leagueRound:6,mode:'president',managedClub:'Unión Popular Aurena',teams:Object.fromEntries(TEAMS.map(t=>[t.name,defaultTeam(t)])),fixtures:structuredClone(FIXTURES),cup:initialCup(),postseason:{stage:'locked',leg:1,fixtures:[],apertura:null,recopa:null},competitions:[],news:[{id:'welcome',category:'Universo',title:'Noveria inaugura su primera era futbolística',description:'Todos los clubes comienzan con cero títulos. Se han incorporado las seis primeras jornadas del Apertura 2026.',date:'Fundación del universo'}],transfers:[],honours:[],settings:{sound:true}};}
export function load(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY));if(s?.version===1&&s.teams&&Array.isArray(s.fixtures)&&s.cup)return s;}catch(e){console.warn('No se pudo cargar la partida',e)}return freshState()}
export function persist(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}
export const isKnownTeam=(s,name)=>Boolean(s.teams[name]);
export const played=(f)=>f.played&&Number.isInteger(f.scoreH)&&Number.isInteger(f.scoreA);
export function ranking(matches,names){const set=new Set(names);const rows=Object.fromEntries(names.map(name=>[name,{name,pj:0,w:0,d:0,l:0,gf:0,gc:0,gd:0,pts:0}]));for(const f of matches){if(!played(f)||(!set.has(f.home)&&!set.has(f.away)))continue;const h=rows[f.home],a=rows[f.away];if(h){h.pj++;h.gf+=f.scoreH;h.gc+=f.scoreA;if(f.scoreH>f.scoreA){h.w++;h.pts+=3}else if(f.scoreH<f.scoreA)h.l++;else{h.d++;h.pts++;}}if(a){a.pj++;a.gf+=f.scoreA;a.gc+=f.scoreH;if(f.scoreA>f.scoreH){a.w++;a.pts+=3}else if(f.scoreA<f.scoreH)a.l++;else{a.d++;a.pts++;}}}return Object.values(rows).map(x=>({...x,gd:x.gf-x.gc})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name,'es'));}
export function standings(s,group){const names=Object.values(s.teams).filter(t=>group==='annual'?t.division==='LSV':t.group===group).map(t=>t.name);const matches=group==='S'?s.fixtures.filter(f=>f.competition==='LPV'):s.fixtures.filter(f=>f.competition==='LSV');return ranking(matches,names)}
export function leagueMatches(s,round,division='LSV'){return s.fixtures.filter(f=>f.round===round&&f.competition===division).sort((a,b)=>(a.slot||0)-(b.slot||0)||a.id.localeCompare(b.id))}
export function getLeagueNextRound(s){for(let rd=1;rd<=18;rd++){const f=s.fixtures.filter(m=>m.round===rd&&['LSV','LPV'].includes(m.competition));if(f.some(m=>!played(m)))return rd;}return 19}
function poisson(lambda,r){let l=Math.exp(-lambda),p=1,k=0;do{p*=r();k++}while(p>l&&k<9);return Math.min(6,k-1)}
function weightedPlayer(team,r){const candidates=team.players.slice(0,11).filter(p=>p.pos!=='POR');const weighted=candidates.map(p=>({p,w:['DC','ED','EI','MCO','MP'].includes(p.pos)?7:['MC','MI','MD'].includes(p.pos)?3:1}));const tot=weighted.reduce((sum,v)=>sum+v.w,0);let v=r()*tot;for(const x of weighted){v-=x.w;if(v<0)return x.p}return candidates[0];}
function addNews(s,category,title,description,related){s.news.unshift({id:'n-'+s.seed+'-'+(s.news.length+1),category,title,description,related,date:'Apertura 2026 · Jornada '+Math.max(s.leagueRound,7)});if(s.news.length>240)s.news=s.news.slice(0,240)}
function rate(team){const first=team.players.slice(0,11);const avg=first.reduce((sum,p)=>sum+p.ovr,0)/first.length;return (team.rating*.65+avg*.35);}
export function simulateMatch(s,match,options={}){
  if(played(match))return match;
  const home=s.teams[match.home],away=s.teams[match.away];if(!home||!away)throw Error('Club desconocido');
  const r=seeded('match-'+match.id+'-'+s.seed);
  const hRating=rate(home),aRating=rate(away);
  const attackBonus=t=>t.tactic==='Presión alta'?.13:t.tactic==='Contraataque'?.08:t.tactic==='Posesión'?.10:0;
  const expH=within(1.24+(hRating-aRating)*.036+.18+attackBonus(home)+(home.morale-70)*.003,.36,3.0);
  const expA=within(1.18+(aRating-hRating)*.036+attackBonus(away)+(away.morale-70)*.003,.36,3.0);
  let sh=poisson(expH,r),sa=poisson(expA,r);
  const events=[];
  const startersH=home.players.slice(0,11),startersA=away.players.slice(0,11);
  const addEvent=(min,type,side,p1=null,p2=null)=>events.push({min,type,side,p1:p1?.id??null,p1Name:p1?.name??null,p2:p2?.id??null,p2Name:p2?.name??null});
  for(const [count,side,team] of [[sh,'home',home],[sa,'away',away]]){
    for(let i=0;i<count;i++){const scorer=weightedPlayer(team,r),assist=r()<.72?weightedPlayer(team,r):null;addEvent(3+Math.floor(r()*90),'goal',side,scorer,assist?.id!==scorer.id?assist:null);}
  }
  const yellowH=Math.floor(r()*4),yellowA=Math.floor(r()*4);
  for(const [count,side,team] of [[yellowH,'home',home],[yellowA,'away',away]])for(let i=0;i<count;i++)addEvent(10+Math.floor(r()*80),'yellow',side,pick(team.players.slice(2,18),r));
  if(r()<.10){const side=r()<.5?'home':'away';addEvent(45+Math.floor(r()*47),'red',side,pick((side==='home'?home:away).players.slice(3,17),r));}
  for(const [side,team] of [['home',home],['away',away]]){
   addEvent(54+Math.floor(r()*18),'sub',side,pick(team.players.slice(3,11),r),pick(team.players.slice(11),r));
   addEvent(74+Math.floor(r()*16),'sub',side,pick(team.players.slice(3,11),r),pick(team.players.slice(11),r));
  }
  if(r()<.14){const side=r()<.5?'home':'away';addEvent(25+Math.floor(r()*60),'injury',side,pick((side==='home'?home:away).players.slice(3,19),r));}
  events.sort((a,b)=>a.min-b.min|| (a.type==='goal'?-1:1));
  const shotsH=Math.max(sh+1,Math.floor(6+r()*11+sh)),shotsA=Math.max(sa+1,Math.floor(5+r()*10+sa));
  let poss=within(Math.round(50+(hRating-aRating)*.4+(r()-.5)*23),30,70);
  match.scoreH=sh;match.scoreA=sa;match.played=true;match.legacy=false;match.events=events;match.stats={posH:poss,posA:100-poss,shotsH,shotsA,onH:within(sh+Math.floor(r()*6),sh,shotsH),onA:within(sa+Math.floor(r()*6),sa,shotsA),cornersH:Math.floor(2+r()*9),cornersA:Math.floor(2+r()*9),foulsH:7+Math.floor(r()*13),foulsA:7+Math.floor(r()*13),xgH:+(expH+(r()-.5)*.6).toFixed(2),xgA:+(expA+(r()-.5)*.6).toFixed(2)};
  match.lineups={home:startersH.map(p=>p.id),away:startersA.map(p=>p.id)};
  for(const [side,team,score,concede] of [['home',home,sh,sa],['away',away,sa,sh]]){
    const starters=team.players.slice(0,11);for(const p of starters){p.apps++;p.form=+(within(6.1+(score-concede)*.24+(r()-.5)*2,4,9.9)).toFixed(1)}
    const outcome=score>concede?3:score===concede?1:-3;team.morale=within(team.morale+outcome,20,99);team.board=within(team.board+Math.sign(outcome),10,100);
  }
  for(const ev of events){const team=ev.side==='home'?home:away;const p=team.players.find(x=>x.id===ev.p1);const p2=team.players.find(x=>x.id===ev.p2);if(ev.type==='goal'){if(p)p.goals++;if(p2)p2.assists++;}else if(ev.type==='yellow'&&p)p.yellows++;else if(ev.type==='red'&&p)p.reds++;else if(ev.type==='injury'&&p)p.injuries++;}
  const big=Math.abs(sh-sa)>=3;
  const winner=sh>sa?home:sh<sa?away:null;
  match.headline=winner?(big?`¡Exhibición de ${winner.name}!`:`${winner.name} se lleva tres puntos`):`Reparto de puntos entre ${home.name} y ${away.name}`;
  match.summary=winner?`${winner.name} derrotó ${sh}-${sa} a ${winner===home?away.name:home.name} en ${home.stadium}. ${big?'Una actuación contundente que sacudió la jornada.':'Un encuentro competido que dejó emociones en las dos áreas.'}`:`${home.name} y ${away.name} empataron ${sh}-${sa} en ${home.stadium}, en un duelo donde ninguno consiguió inclinar definitivamente la balanza.`;
  addNews(s,match.competition,match.headline,match.summary,match.id);
  return match;
}
export function simulateLeagueRound(s){const round=getLeagueNextRound(s);if(round>18)throw Error('El campeonato ya completó sus 18 jornadas');const matches=s.fixtures.filter(f=>f.round===round&&['LSV','LPV'].includes(f.competition));const newly=matches.filter(f=>!played(f));s.leagueRound=round;for(const m of newly)simulateMatch(s,m);reviewCoaches(s,round);
  if(round===18){const annual=standings(s,'annual');setupPostseason(s);s.honours.push({title:'Escudo de Oro de Veltrania',winner:annual[0].name,season:'2026'});s.teams[annual[0].name].trophies.push('Escudo de Oro · 2026');addNews(s,'Campeonato',`${annual[0].name}, primer campeón del Escudo de Oro`,`${annual[0].name} termina en el primer lugar de la tabla general tras 18 partidos.`);}
  return {round,matches:newly};}
export function scorers(s,limit=18){return Object.values(s.teams).flatMap(t=>t.players.map(p=>({...p,club:t.name}))).filter(p=>p.goals||p.assists).sort((a,b)=>b.goals-a.goals||b.assists-a.assists).slice(0,limit)}
export function changeCoach(s,name,newCoach){const t=s.teams[name];if(!t||!newCoach?.trim())throw Error('Datos inválidos');const old=t.coach;t.coachHistory.unshift({out:old,in:newCoach.trim(),round:s.leagueRound});t.coach=newCoach.trim();t.board=within(t.board-7,10,100);addNews(s,'Directivas',`${name} cambia de entrenador`,`La directiva destituye a ${old} y anuncia a ${newCoach.trim()} como nuevo DT.`);return old;}
export function movePlayer(s,id,from,to){const a=s.teams[from],b=s.teams[to];if(!a||!b||from===to)throw Error('Equipos inválidos');const index=a.players.findIndex(p=>String(p.id)===String(id));if(index<0||a.players.length<=11)throw Error('No se puede realizar el traspaso');const [player]=a.players.splice(index,1);b.players.push(player);s.transfers.unshift({player:player.name,from,to,round:s.leagueRound});addNews(s,'Mercado',`${player.name} ficha por ${to}`,`Traspaso confirmado desde ${from} hacia ${to}.`);return player;}
export function leagueSummary(s){const total=s.fixtures.filter(f=>played(f)&&['LSV','LPV'].includes(f.competition));return {matches:total.length,goals:total.reduce((n,f)=>n+f.scoreH+f.scoreA,0),round:getLeagueNextRound(s)-1};}
export function isCupGroupComplete(s){return s.cup.fixtures.filter(f=>f.group?.length===1).every(played)}
function cupQualifierNames(s){const rows=CUP_GROUPS.map((g,i)=>ranking(s.cup.fixtures,g).map(x=>({...x,group:String.fromCharCode(65+i)})));
 const direct=rows.flatMap(r=>r.slice(0,2));const thirds=rows.map(r=>r[2]).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf).slice(0,2);return [...direct,...thirds].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf).map(x=>x.name);}
function knockoutRound(id,participants,number,stage,clubs){const n=participants.length;const fixtures=[];for(let i=0;i<n/2;i++){const high=participants[i],low=participants[n-1-i],a=clubs[high],b=clubs[low];const lower=a?.division==='LPV'&&b?.division==='LSV'?high:b?.division==='LPV'&&a?.division==='LSV'?low:high;const other=lower===high?low:high;fixtures.push({id:`${id}-${stage}-${i}`,competition:id,group:stage,round:number,slot:0,home:lower,away:other,played:false,legacy:false,scoreH:null,scoreA:null});}return fixtures;}
export function simulateCupRound(s){const cup=s.cup;if(cup.champion)throw Error('La Copa ya tiene campeón');let upcoming=cup.fixtures.filter(f=>f.round===cup.round&&!played(f));if(!upcoming.length)throw Error('No quedan encuentros pendientes');for(const m of upcoming)simulateMatch(s,m);if(cup.phase==='groups'){
 if(cup.round<3)cup.round++;else{cup.phase='octavos';cup.round=4;cup.fixtures.push(...knockoutRound('CUP',cupQualifierNames(s),4,'octavos',s.teams));}
 }else{
   const winners=upcoming.map(m=>{if(m.scoreH===m.scoreA){const r=seeded(m.id+'-pen-'+s.seed);m.penalties=r()<.5?`${4+Math.floor(r()*2)}-${2+Math.floor(r()*2)}`:`${2+Math.floor(r()*2)}-${4+Math.floor(r()*2)}`;m.winner=Number(m.penalties.split('-')[0])>Number(m.penalties.split('-')[1])?m.home:m.away;}else m.winner=m.scoreH>m.scoreA?m.home:m.away;return m.winner;});
   if(winners.length===1){cup.champion=winners[0];cup.phase='finalizada';s.honours.push({title:'Copa de las Provincias',winner:winners[0],season:'2026'});s.teams[winners[0]].trophies.push('Copa de las Provincias · 2026');addNews(s,'Copa',`¡${winners[0]} conquista la Copa de las Provincias!`,'Se corona el primer campeón copero de la historia de Veltrania.');}
   else{const stages={octavos:'cuartos',cuartos:'semifinales',semifinales:'final'};cup.phase=stages[cup.phase]||'final';cup.round++;cup.fixtures.push(...knockoutRound('CUP',winners,cup.round,cup.phase,s.teams));}
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
function titleCustom(s,c,winner){c.champion=winner;c.stage='finalizada';s.honours.push({title:c.name,winner,season:'2026'});s.teams[winner].trophies.push(c.name+' · 2026');addNews(s,'Títulos',`¡${winner} conquista ${c.name}!`,`El primer campeón de ${c.name} queda inscrito en los registros del universo.`);}
function decideCupWinner(s,m){if(m.scoreH!==m.scoreA){m.winner=m.scoreH>m.scoreA?m.home:m.away;return m.winner;}
 const r=seeded('knockout-'+m.id+'-'+s.seed);m.extraTime=true;
 const homeWins=r()<.5;m.penalties=homeWins?'5-4':'4-5';m.winner=homeWins?m.home:m.away;return m.winner;
}
export function createCompetition(s,name,clubNames,format='league'){
 const formats=['league','league2','cup','recopa','groups'];if(!formats.includes(format))throw Error('Formato de torneo desconocido');
 const names=clubNames||[];
 if(!name?.trim()||name.trim().length>65||!Array.isArray(names)||names.length<2||names.length>32||new Set(names).size!==names.length)throw Error('Elegí nombre y entre 2 y 32 clubes distintos.');
 if(names.some(x=>!isKnownTeam(s,x)))throw Error('Hay un club desconocido');
 if(format==='recopa'&&names.length!==2)throw Error('La Recopa requiere exactamente dos clubes.');
 if(format==='groups'&&(names.length<4||names.length%4!==0))throw Error('La fase de grupos requiere 4, 8, 12… hasta 32 clubes.');
 const id='CUSTOM-'+Date.now()+'-'+Math.floor(Math.random()*1e7),teams=[...names];
 const c={id,name:name.trim(),type:format,teams,fixtures:[],round:1,champion:null,stage:'inicio',pendingByes:[],groups:[]};
 if(format==='league'||format==='league2'){
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
 const pending=c.fixtures.filter(f=>f.round===c.round&&!played(f));if(!pending.length)throw Error('No hay partidos programados');
 for(const m of pending)simulateMatch(s,m);
 if(c.type==='league'||c.type==='league2'){
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

function finalFixture(s,stage,leg,a,b,extra=''){return {id:`POST-${stage}-${leg}-${a.slice(0,4)}-${b.slice(0,4)}`,competition:'POST',group:stage,round:leg,slot:0,home:a,away:b,scoreH:null,scoreA:null,played:false,legacy:false,extra};}
export function setupPostseason(s){if(s.postseason?.stage!=='locked')return;const winners=[...standings(s,'A').slice(0,2),...standings(s,'B').slice(0,2)].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);s.postseason.stage='semifinales';s.postseason.leg=1;s.postseason.seeds=winners.map(t=>t.name);s.postseason.fixtures=[];for(const [a,b] of [[winners[0].name,winners[3].name],[winners[1].name,winners[2].name]]){s.postseason.fixtures.push(finalFixture(s,'semifinales',1,b,a));s.postseason.fixtures.push(finalFixture(s,'semifinales',2,a,b));}}
function legWinner(s,fixtures){const [first,second]=fixtures;const a=first.home,b=first.away,ga=first.scoreH+second.scoreA,gb=first.scoreA+second.scoreH;if(ga!==gb)return ga>gb?a:b;const rng=seeded('post-pen-'+first.id+'-'+s.seed);second.penalties=rng()<.5?'5-4':'4-5';second.extraTime=true;return second.penalties==='5-4'?second.home:second.away;}
export function simulatePostseasonRound(s){const p=s.postseason;if(!p||p.stage==='locked'||p.stage==='finalizada')throw Error('Todavía no está disponible la fase final');const games=p.fixtures.filter(f=>f.group===p.stage&&f.round===p.leg&&!played(f));if(!games.length)throw Error('No hay partidos pendientes');games.forEach(m=>simulateMatch(s,m));
 if(p.stage==='semifinales'){
  if(p.leg===1)p.leg=2;else{
   const rounds=p.fixtures.filter(f=>f.group==='semifinales');const winners=[legWinner(s,rounds.slice(0,2)),legWinner(s,rounds.slice(2,4))];const order=standings(s,'annual').map(x=>x.name);winners.sort((a,b)=>order.indexOf(a)-order.indexOf(b));const high=winners[0],low=winners[1];p.fixtures.push(finalFixture(s,'final',1,low,high),finalFixture(s,'final',2,high,low));p.stage='final';p.leg=1;
  }
 }else if(p.stage==='final'){
  if(p.leg===1)p.leg=2;else{const finals=p.fixtures.filter(f=>f.group==='final');const winner=legWinner(s,finals);p.apertura=winner;s.honours.push({title:'Apertura 2026',winner,season:'2026'});s.teams[winner].trophies.push('Apertura · 2026');s.teams[winner].budget+=.01;addNews(s,'Campeones',`${winner} es campeón del Apertura 2026`,`Primer monarca de la Liga Suprema Veltrana y ganador de 10.000 VLR.`);const annual=standings(s,'annual').map(t=>t.name),opponent=annual[0]===winner?annual[1]:annual[0];p.fixtures.push(finalFixture(s,'recopa',1,winner,opponent,'Sede neutral · Estadio Nacional de Veltrania'));p.stage='recopa';p.leg=1;}
 }else if(p.stage==='recopa'){
 const final=games[0];if(final.scoreH===final.scoreA){const r=seeded(final.id+'-recopa-'+s.seed);final.extraTime=true;final.penalties=r()<.5?'5-4':'4-5';}const champ=final.scoreH>final.scoreA?final.home:final.scoreH<final.scoreA?final.away:final.penalties==='5-4'?final.home:final.away;p.recopa=champ;p.stage='finalizada';s.honours.push({title:'Recopa Veltrana',winner:champ,season:'2026'});s.teams[champ].trophies.push('Recopa Veltrana · 2026');addNews(s,'Campeones',`${champ} levanta la Recopa Veltrana`,'Primer campeón de la Recopa en un encuentro a partido único.');
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
