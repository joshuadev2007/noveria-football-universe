/** Noveria Live 2D — previews deterministas sobre clubes aislados; resultado real solo al finalizar.
 * No altera partidos históricos ni estadísticas hasta que termina la transmisión.
 */
import {simulateMatch,played} from './engine.js';
import {calendarMatchReady,calendarCurrent} from './calendar.js';
export const LIVE_SECONDS=120;
const hash=(str)=>{let h=2166136261;for(const c of String(str))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const pct=(str)=>hash(str)/4294967295;
export function fixtureSources(s){
 const out=[];
 const add=(fixtures,kind,country,owner)=>{for(const m of fixtures||[])out.push({m,kind,country,owner})};
 add(s.fixtures,'league','Veltrania',s);add(s.cup?.fixtures,'cup','Veltrania',s.cup);add(s.postseason?.fixtures,'post','Veltrania',s.postseason);
 for(const c of s.competitions||[])add(c.fixtures,'custom','Veltrania',c);
 for(const [country,w] of Object.entries(s.world||{})){add(w.fixtures,'foreign-league',country,w);add(w.cup?.fixtures,'foreign-cup',country,w.cup);add(w.postseason?.fixtures,'foreign-post',country,w.postseason)}
 for(const cup of ['champions','horizonte'])add(s.international?.[cup]?.fixtures,'international',cup,s.international?.[cup]);
 for(const a of s.archive||[])add(a.fixtures,'archive','Veltrania',a);
 return out;
}
export function findBroadcastFixture(s,id){return fixtureSources(s).find(x=>x.m.id===id)||null}
export function matchIsAvailable(s,entry){
 if(!entry)return false;
 const {m,kind,owner}=entry;if(played(m))return true;
 if(!calendarMatchReady(s,entry))return false;
 switch(kind){
 case 'league':return m.round===Math.min(18,Math.max(1,(()=>{for(let r=1;r<=18;r++)if(s.fixtures.some(f=>f.round===r&&!played(f)))return r;return 19})()));
 case 'foreign-league':return m.round===owner.round+1;
 case 'cup':return m.round===owner.round&&!owner.champion;
 case 'post':return m.group===owner.stage&&m.round===owner.leg;
 case 'foreign-cup':return m.round===owner.round&&!owner.champion;
 case 'foreign-post':return m.group===owner.stage&&m.round===owner.leg;
 case 'custom':return m.round===owner.round&&!owner.champion;
 case 'international':return m.phase===owner.phase&&m.round===owner.round&&!owner.champion;
 default:return false;
 }
}
function isolatedSimulation(s,m){const scratch={seed:s.seed,season:s.season,leagueRound:s.leagueRound,teams:{[m.home]:structuredClone(s.teams[m.home]),[m.away]:structuredClone(s.teams[m.away])},news:[]};const match=structuredClone(m);simulateMatch(scratch,match);return match}
function supplyMatchActionEvents(m,seed){if(m.legacy||!m.stats||!m.events)return;
 const st=m.stats;let generated=[];
 for(const side of ['home','away']){
  const h=side==='home',goals=h?m.scoreH:m.scoreA,on=h?st.onH:st.onA,shots=h?st.shotsH:st.shotsA,corners=h?st.cornersH:st.cornersA;
  const misses=Math.max(0,shots-on),saves=Math.max(0,on-goals);
  for(let i=0;i<misses;i++)generated.push({min:5+Math.floor(pct(m.id+side+'miss'+i+seed)*81),type:'shot',side,reconstruction:true});
  for(let i=0;i<saves;i++)generated.push({min:6+Math.floor(pct(m.id+side+'save'+i+seed)*80),type:'save',side,reconstruction:true});
  for(let i=0;i<corners;i++)generated.push({min:7+Math.floor(pct(m.id+side+'corner'+i+seed)*79),type:'corner',side,reconstruction:true});
 }
 // La creación de eventos representa tiros/córners que ya cuentan en las estadísticas, no añade otros tiros.
 m.events.push(...generated);m.events.sort((a,b)=>a.min-b.min||String(a.type).localeCompare(String(b.type)));
}
function extraTimePossible(entry,preview){
 if(preview.scoreH!==preview.scoreA)return false;
 const {m,kind,owner}=entry;
 return (kind==='cup'&&owner.phase!=='groups')||(kind==='foreign-cup'&&owner.stage!=='groups')||(kind==='international'&&m.phase!=='groups')||(kind==='post'&&m.group==='recopa')||(kind==='foreign-post'&&m.group==='recopa')||(kind==='custom'&&['recopa','cup'].includes(owner.type));
}
export function startBroadcast(s,id){
 const entry=findBroadcastFixture(s,id);if(!entry)throw Error('Partido no encontrado');
 if(!matchIsAvailable(s,entry))throw Error('Este partido todavía no está habilitado; completá las fechas anteriores.');
 const {m}=entry;const archived=played(m);
 const preview=archived?structuredClone(m):isolatedSimulation(s,m);if(!archived)supplyMatchActionEvents(preview,s.seed);
 const b={id:m.id,season:s.season,elapsed:0,duration:extraTimePossible(entry,preview)?140:LIVE_SECONDS,speed:1,paused:true,finished:false,replay:archived,legacy:!!m.legacy,preview,decisions:[],startTactics:{home:s.teams[m.home].tactic,away:s.teams[m.away].tactic},createdAt:Date.now(),sound:true};
 s.broadcast=b;return b;
}
export function displayedMinute(b){return b.elapsed>120?Math.min(120,90+Math.floor((b.elapsed-120)*1.5)):Math.max(0,Math.min(90,Math.floor(90*Math.min(b.elapsed,LIVE_SECONDS)/LIVE_SECONDS)))}
export function eventsUntil(b){let minute=displayedMinute(b);return (b.preview.events||[]).filter(e=>e.min<=minute)}
export function runningScore(b){if(b.legacy&&!b.finished)return [0,0];const goals=eventsUntil(b).filter(e=>e.type==='goal');return [goals.filter(e=>e.side==='home').length,goals.filter(e=>e.side==='away').length]}
export function descriptionOf(ev,m){let label=ev.side==='home'?m.home:m.away;return ({shot:`¡Remate de ${label}! El balón se va desviado`,save:`¡ATAJADÓN! El guardameta frustra a ${label}`,corner:`Córner peligroso para ${label}`,goal:`¡GOOOOOOL de ${ev.p1Name||label}!`,yellow:`Amarilla para ${ev.p1Name||label}`,red:`¡ROJA! ${ev.p1Name||label} se marcha`,injury:`Atención médica para ${ev.p1Name||label}`,sub:`Cambio: sale ${ev.p1Name}, entra ${ev.p2Name}`,var:'📺 Revisión VAR',tactic:`El DT de ${label} ordena jugar ${ev.p1Name}`})[ev.type]||`${label} protagoniza la acción`}
export function managerSide(s,b){if(s.mode!=='manager')return null;return s.managedClub===b.preview.home?'home':s.managedClub===b.preview.away?'away':null}
function pushEvent(b,ev){b.preview.events=b.preview.events||[];b.preview.events.push(ev);b.preview.events.sort((a,c)=>a.min-c.min||String(a.type).localeCompare(String(c.type)))}
export function coachTactic(s,b,tactic){const side=managerSide(s,b);if(!side||b.replay||b.finished)throw Error('Solo podés decidir como DT durante un partido propio');if(!['Equilibrado','Posesión','Presión alta','Contraataque','A todo ataque','Bloque bajo','Perder tiempo'].includes(tactic))throw Error('Táctica desconocida');const minute=displayedMinute(b);if(minute>=87)throw Error('Demasiado tarde para cambiar el plan de juego');
 const club=side==='home'?b.preview.home:b.preview.away;s.teams[club].tactic=tactic;const index=b.decisions.length;
 const ev={min:minute,type:'tactic',side,p1Name:tactic,manual:true};pushEvent(b,ev);b.decisions.push({kind:'tactic',minute,side,tactic});
 // El cambio táctico influye realmente en los siguientes minutos; no garantiza un gol.
 const odds={'Presión alta':.32,Contraataque:.27,Posesión:.20,Equilibrado:.12,'A todo ataque':.4,'Bloque bajo':.05,'Perder tiempo':.02}[tactic];
 const roll=pct(`${s.seed}|${b.id}|${minute}|${index}|${tactic}`);
 if(roll<odds){const goalMin=Math.min(90,minute+6+Math.floor(pct(b.id+index+'minute')*15));const starters=b.preview.lineups?.[side]||[],team=s.teams[club];const scorer=team.players.find(p=>p.id===starters[7])||team.players.find(p=>p.pos==='DC')||team.players[0];pushEvent(b,{min:goalMin,type:'goal',side,p1:scorer.id,p1Name:scorer.name,p2:null,p2Name:null,manual:true});b.preview[side==='home'?'scoreH':'scoreA']++;b.decisions.push({kind:'goal',min:goalMin,side,p1:scorer.id,p1Name:scorer.name});}
 return true;
}
export function coachSubstitution(s,b,outId,inId){const side=managerSide(s,b);if(!side||b.replay||b.finished)throw Error('Este partido no admite cambios de DT');const minute=displayedMinute(b);if(minute<1||minute>=89)throw Error('Las sustituciones se realizan entre el minuto 1 y el 88');const club=side==='home'?b.preview.home:b.preview.away;const team=s.teams[club];const previous=b.decisions.filter(x=>x.kind==='sub');if(previous.length>=5)throw Error('Ya realizaste los cinco cambios');const starts=b.preview.lineups[side];const out=team.players.find(p=>String(p.id)===String(outId)),incoming=team.players.find(p=>String(p.id)===String(inId));if(!out||!incoming||out.id===incoming.id)throw Error('Elegí dos jugadores diferentes');const usedOut=new Set(previous.map(x=>x.out)),usedIn=new Set(previous.map(x=>x.in));if(!starts.includes(out.id)&&!usedIn.has(out.id))throw Error('Solo podés sacar a alguien que esté en la cancha');if(usedOut.has(out.id))throw Error('Ese jugador ya salió');if(starts.includes(incoming.id)||usedIn.has(incoming.id)||usedOut.has(incoming.id))throw Error('El jugador entrante no está disponible');const x={kind:'sub',minute,side,out:out.id,in:incoming.id};b.decisions.push(x);pushEvent(b,{min:minute,type:'sub',side,p1:out.id,p1Name:out.name,p2:incoming.id,p2Name:incoming.name,manual:true});
 // Un sustituto fresco puede desequilibrar realmente los minutos restantes.
 const quality=Math.max(0,(incoming.ovr||60)-(out.ovr||60));
 const chance=Math.min(.31,.07+quality*.014);
 const roll=pct(b.id+'sub'+minute+incoming.id+s.seed);
 if(roll<chance&&minute<78){const goalMin=Math.min(90,minute+6+Math.floor(pct(b.id+'subgoal'+incoming.id)*12));
 pushEvent(b,{min:goalMin,type:'goal',side,p1:incoming.id,p1Name:incoming.name,manual:true});
 b.preview[side==='home'?'scoreH':'scoreA']++;
 b.decisions.push({kind:'goal',min:goalMin,side,p1:incoming.id,p1Name:incoming.name});
 }
 return x;
}
/** Aplica al motor la misma simulación vista, y las decisiones posteriores del entrenador.
 * Correr exactamente una vez: comprueba match.played para evitar resultados duplicados.
 */
export function finishBroadcast(s){const b=s.broadcast;if(!b)throw Error('No hay transmisión activa');if(b.finished)return {match:findBroadcastFixture(s,b.id)?.m,first:false};const entry=findBroadcastFixture(s,b.id);if(!entry)throw Error('No se encontró la ficha del encuentro');const m=entry.m;if(played(m)||b.replay){b.finished=true;b.elapsed=b.duration;b.preview=structuredClone(m);return {match:m,first:false};}
 const activeDate=calendarMatchReady(s,entry)?calendarCurrent(s):null;
 const beforeH=s.teams[m.home].tactic,beforeA=s.teams[m.away].tactic;
 try{s.teams[m.home].tactic=b.startTactics.home;s.teams[m.away].tactic=b.startTactics.away;simulateMatch(s,m,{silent:entry.kind.startsWith('foreign')||entry.kind==='international'});}finally{s.teams[m.home].tactic=beforeH;s.teams[m.away].tactic=beforeA;}
 // La ficha del motor es la fuente de verdad; solo añadimos decisiones que vimos en el directo.
 for(const d of b.decisions){const side=d.side,team=s.teams[side==='home'?m.home:m.away];if(d.kind==='goal'){
  const p=team.players.find(x=>x.id===d.p1);if(p)p.goals++;
  m[side==='home'?'scoreH':'scoreA']++;
  m.stats[side==='home'?'shotsH':'shotsA']++;m.stats[side==='home'?'onH':'onA']++;m.stats[side==='home'?'xgH':'xgA']=+(Number(m.stats[side==='home'?'xgH':'xgA'])+.35).toFixed(2);
  const other=s.teams[side==='home'?m.away:m.home];if(team.rivalryRecords?.[other.name])team.rivalryRecords[other.name].gf++;if(other.rivalryRecords?.[team.name])other.rivalryRecords[team.name].gc++;
 }else if(d.kind==='sub'){const p=team.players.find(x=>x.id===d.in);if(p)p.apps++;}}
 m.events=b.preview.events;
 if(b.decisions.some(x=>x.kind==='goal')){
  const w=m.scoreH>m.scoreA?m.home:m.scoreA>m.scoreH?m.away:null;
  m.headline=w?`¡${w} se impone en un partido lleno de decisiones!`:'¡Empate de infarto tras un duelo táctico!';
  m.summary=`${m.home} ${m.scoreH}-${m.scoreA} ${m.away}. La actuación de los entrenadores influyó en las jugadas decisivas del encuentro.`;
  const last=s.news.find(x=>x.related===m.id);if(last){last.title=m.headline;last.description=m.summary;}
 }
 m.tacticalDecisions=b.decisions;
 if(activeDate){m.calendarDate=activeDate.date;m.calendarEvent=activeDate.id;}
 b.finished=true;b.elapsed=b.duration;b.preview=structuredClone(m);
 return {match:m,first:true,entry};
}
