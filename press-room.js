/* NOVERIA 5.1 — Sala de prensa contextual.
   Las preguntas se basan en MARCADORES REALMENTE DISPUTADOS, no en datos históricos inventados.
   Conferencias limitadas a una por ciclo de partidos, con progreso guardado en la partida. */
import {played,ranking} from './engine.js';
import {calendarCurrent,calendarMatchReady} from './calendar.js';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function hash(txt){let h=2166136261;for(const x of String(txt))h=Math.imul(h^x.charCodeAt(0),16777619);return h>>>0;}
const val=(n,f=0)=>Number.isFinite(Number(n))?Number(n):f;
function leagueFixtures(s,club){const t=s.teams[club];if(!t)return [];const matches=t.country==='Veltrania'?s.fixtures:s.world?.[t.country]?.fixtures||[];return matches.filter(m=>m.competition===t.division&&(m.home===club||m.away===club));}
function allFixtures(s,club){const t=s.teams[club];if(!t)return [];const all=[...leagueFixtures(s,club)];if(t.country==='Veltrania')all.push(...(s.cup?.fixtures||[]),...(s.postseason?.fixtures||[]));else{const w=s.world?.[t.country];all.push(...(w?.cup?.fixtures||[]),...(w?.postseason?.fixtures||[]));}
 for(const c of s.competitions||[])all.push(...(c.fixtures||[]));for(const c of ['champions','horizonte'])all.push(...(s.international?.[c]?.fixtures||[]));
 return all.filter(m=>(m.home===club||m.away===club)&&played(m));}
function outcome(m,club){const own=m.home===club?m.scoreH:m.scoreA,other=m.home===club?m.scoreA:m.scoreH;return {fixture:m,opponent:m.home===club?m.away:m.home,own,other,result:own>other?'G':own<other?'P':'E',home:m.home===club};}
function resultText(r){return r?`${r.own}-${r.other} ante ${r.opponent}`:'Sin partidos recientes';}
function days(mark){return mark||0}
/** Cada competencia tiene sus propias ruedas de prensa y su progreso separado. */

/** Selección automática del partido que le toca al club, sin selector de competición.
 * Se prioriza el último partido realmente disputado en la fecha del calendario.
 * En ausencia de uno, se prepara la previa del siguiente partido habilitado.
 */
function pressAllFixtures(s,name){
 const t=s.teams[name];if(!t)return [];
 const entries=[];
 const add=(list,competition,kind,owner)=>{for(const m of list||[])if(m.home===name||m.away===name)entries.push({m,competition,kind,owner});};
 add(t.country==='Veltrania'?s.fixtures:s.world?.[t.country]?.fixtures,'Liga',t.country==='Veltrania'?'league':'foreign-league',t.country==='Veltrania'?s:s.world?.[t.country]);
 add(t.country==='Veltrania'?s.cup?.fixtures:s.world?.[t.country]?.cup?.fixtures,'Copa Nacional',t.country==='Veltrania'?'cup':'foreign-cup',t.country==='Veltrania'?s.cup:s.world?.[t.country]?.cup);
 add(t.country==='Veltrania'?s.postseason?.fixtures:s.world?.[t.country]?.postseason?.fixtures,'Fase final y Recopa',t.country==='Veltrania'?'post':'foreign-post',t.country==='Veltrania'?s.postseason:s.world?.[t.country]?.postseason);
 for(const c of ['champions','horizonte'])add(s.international?.[c]?.fixtures,c==='champions'?'Copa de Campeones':'Copa Horizonte','international',s.international?.[c]);
 for(const c of s.competitions||[])add(c.fixtures,'Torneo: '+c.name,'custom',c);
 return entries;
}
export function pressMatchFocus(s,name){
 const candidates=pressAllFixtures(s,name);if(!candidates.length)return null;
 const history=s.calendar?.history||[];
 const rank=m=>{
  if(m.calendarEvent){const i=history.findIndex(e=>e.id===m.calendarEvent);if(i>=0)return i+10000;}
  if(m.calendarDate){const i=history.findIndex(e=>e.date===m.calendarDate);if(i>=0)return i+10000;}
  return Number(m.round||0);
 };
 const previous=(s.ecosystem?.pressFocus||{})[name];
 const pinned=previous&&candidates.find(x=>String(x.m.id)===String(previous));
 if(pinned&&played(pinned.m))return {...pinned,status:'post'};
 const done=candidates.filter(x=>played(x.m)).sort((a,b)=>rank(b.m)-rank(a.m)||String(b.m.id).localeCompare(String(a.m.id)));
 if(done.length)return {...done[0],status:'post'};
 const due=candidates.find(x=>!played(x.m)&&calendarMatchReady(s,x));
 if(due)return {...due,status:'pre'};
 const next=candidates.filter(x=>!played(x.m)).sort((a,b)=>Number(a.m.round||0)-Number(b.m.round||0))[0];
 return next?{...next,status:'pre'}:null;
}

export function pressCompetitions(s,name){
 const t=s.teams[name];if(!t)return ['Liga'];
 const found=['Liga'];
 const has=arr=>(arr||[]).some(m=>m.home===name||m.away===name);
 if(has(t.country==='Veltrania'?s.cup?.fixtures:s.world?.[t.country]?.cup?.fixtures))found.push('Copa Nacional');
 if(has(t.country==='Veltrania'?s.postseason?.fixtures:s.world?.[t.country]?.postseason?.fixtures))found.push('Fase final y Recopa');
 if(has(s.international?.champions?.fixtures))found.push('Copa de Campeones');
 if(has(s.international?.horizonte?.fixtures))found.push('Copa Horizonte');
 for(const c of s.competitions||[])if(has(c.fixtures))found.push('Torneo: '+c.name);
 return found;
}
function fixturesByFocus(s,name,focus){
 const t=s.teams[name];if(!t)return [];
 if(!focus||focus==='Liga')return leagueFixtures(s,name);
 let fixtures=[];
 if(focus==='Copa Nacional')fixtures=t.country==='Veltrania'?s.cup?.fixtures||[]:s.world?.[t.country]?.cup?.fixtures||[];
 else if(focus==='Fase final y Recopa')fixtures=t.country==='Veltrania'?s.postseason?.fixtures||[]:s.world?.[t.country]?.postseason?.fixtures||[];
 else if(focus==='Copa de Campeones')fixtures=s.international?.champions?.fixtures||[];
 else if(focus==='Copa Horizonte')fixtures=s.international?.horizonte?.fixtures||[];
 else if(focus.startsWith('Torneo: '))fixtures=s.competitions.find(c=>'Torneo: '+c.name===focus)?.fixtures||[];
 return fixtures.filter(m=>m.home===name||m.away===name);
}

export function pressSnapshot(s,name,competition='Liga',matchId=null){
 const team=s.teams[name];if(!team)throw Error('Club no encontrado');
 const fixtures=fixturesByFocus(s,name,competition);
 const recent=fixtures.filter(played).sort((a,b)=>(a.round||0)-(b.round||0)||(a.slot||0)-(b.slot||0)||String(a.id).localeCompare(String(b.id))).map(m=>outcome(m,name));
 const pinnedMatch=matchId?pressAllFixtures(s,name).find(x=>String(x.m.id)===String(matchId)):null;
 const pinnedOutcome=pinnedMatch&&played(pinnedMatch.m)?outcome(pinnedMatch.m,name):null;
 const last=pinnedOutcome||recent.at(-1)||null;
 const window=recent.slice(-5),won=window.filter(x=>x.result==='G').length,lost=window.filter(x=>x.result==='P').length,draw=window.filter(x=>x.result==='E').length;let streak=0;if(last)for(let i=recent.length-1;i>=0&&recent[i].result===last.result;i--)streak++;
 const lastEvent=last?.fixture||null;
 const names=Object.values(s.teams).filter(t=>t.country===team.country&&t.division===team.division).map(t=>t.name);
 const countryFixtures=team.country==='Veltrania'?s.fixtures:s.world?.[team.country]?.fixtures||[];
 const table=ranking(countryFixtures.filter(m=>m.competition===team.division),names),rank=table.findIndex(x=>x.name===name)+1,row=table.find(x=>x.name===name)||{pts:0,gd:0,pj:0};
 const next=pinnedMatch&&!played(pinnedMatch.m)?pinnedMatch.m:(fixtures.filter(m=>!played(m)).sort((a,b)=>(a.round||0)-(b.round||0)||(a.slot||0)-(b.slot||0))[0]||null);
 const injuries=(team.players||[]).filter(p=>val(p.outGames)>0),market=s.market?.status==='open';
 const signature=[s.season,s.edition||'Apertura',name,competition,matchId||'',pinnedMatch?(played(pinnedMatch.m)?'post':'pre'):'',recent.length,recent.map(m=>m.fixture.id).join('|')].join('|');
 const trophies=(s.honours||[]).filter(h=>h.winner===name&&String(h.season)===String(s.season));
 const lastStage=lastEvent?.phase||lastEvent?.group||'';
 return {name,country:team.country,division:team.division,competition,season:s.season,team,results:recent,last,lastEvent,lastStage,trophies,focusMatch:pinnedMatch?.m||null,focusStage:pinnedMatch?.status||(pinnedMatch?(played(pinnedMatch.m)?'post':'pre'):null),form:window.map(x=>x.result).join(''),won,lost,draw,streak,rank,teams:table.length,row,next,injuries,market,signature,latestMatchText:resultText(last)};
}

const choice=(id,label,quote,effects,description)=>({id,label,quote,effects,description});
function buildTopics(c){const t=c.team,ls=c.last,next=c.next,inj=c.injuries,fmt=c.latestMatchText;const list=[];
 const add=(id,category,weight,question,responses,headline,media='El Heraldo de Noveria')=>list.push({id,category,weight,question,responses,headline,media});

 if(c.focusMatch){
  const m=c.focusMatch,pre=!played(m),opponent=m.home===c.name?m.away:m.home,home=m.home===c.name;
  const own=home?m.scoreH:m.scoreA,other=home?m.scoreA:m.scoreH;
  const ctx=c.competition+' · '+(m.group||m.phase||'jornada '+(m.round||''));
  const sign=pre?null:own>other?'victoria':own<other?'derrota':'empate';
  const kickoff=pre?'de cara al partido':'tras el '+own+'–'+other;
  add('encuentro-'+String(m.id),'partido',260,
   pre?`Este es el próximo partido ante ${opponent} en ${ctx}. ¿Cuál será la clave para competir?`:
   `Tras el ${own}–${other} ante ${opponent} en ${ctx}, ¿qué lectura hacés de esta ${sign}?`,[
    choice('analizar','Analizar el plan',`Hemos estudiado a ${opponent}. El trabajo táctico y la concentración marcan el camino.`,{morale:2,board:3,fans:1},'Análisis del partido'),
    choice('equipo','Defender al grupo',`El grupo dejó todo y vamos a seguir creciendo ante cada rival.`,{morale:4,board:1,fans:2},'La unidad como respuesta'),
    choice('exigencia','Exigir más',`No nos conformamos. Cada partido nos exige competir mejor.`,{morale:-1,board:3,fans:3},'Mensaje exigente desde el banquillo')
   ],`${t.coach} analiza ${c.competition} y el duelo con ${opponent}`);
  add('rival-'+String(m.id),'rival',220,
   pre?`Se viene ${opponent}. ¿Cómo planeás manejar sus fortalezas en este partido?`:
   `¿Qué fue lo más difícil del encuentro contra ${opponent} y qué cambiarías para el próximo?`,[
    choice('respeto','Respetar al rival',`${opponent} es un rival exigente. Debemos seguir preparados y aprender.`,{morale:2,board:2,fans:1},'Respeto entre rivales'),
    choice('intensidad','Resaltar la intensidad',`Nuestra intensidad es fundamental. Nadie puede bajar los brazos.`,{morale:3,board:1,fans:3},'Intensidad del equipo'),
    choice('detalle','Trabajar los detalles',`Los detalles deciden encuentros así. Vamos a corregir lo necesario.`,{morale:1,board:4,fans:1},'Las claves del planteamiento')
   ],`Rival bajo la lupa: ${opponent}`);
  const goals=(m.events||[]).filter(e=>e.type==='goal');
  const mine=goals.filter(e=>e.side===(home?'home':'away')&&e.p1Name);
  const scorer=mine.find(x=>mine.filter(y=>y.p1Name===x.p1Name).length>1)||mine[0];
  const expulsions=(m.events||[]).filter(e=>e.type==='red');
  if(!pre&&scorer&&scorer.p1Name)add('jugador-'+String(m.id),'figura',245,
   `${scorer.p1Name} marcó ante ${opponent}. ¿Qué importancia tuvo su actuación para el equipo?`,[
    choice('elogio','Elogiar al goleador',`${scorer.p1Name} aprovechó su oportunidad. Estamos orgullosos de su trabajo.`,{morale:4,board:1,fans:2},'El goleador se lleva los elogios'),
    choice('colectivo','Destacar a todos',`El gol fue importante, pero esta es una labor de equipo.`,{morale:3,board:2,fans:2},'El colectivo por encima'),
    choice('exigente','Pedir continuidad',`Ese rendimiento marca el nivel que queremos mantener.`,{morale:1,board:3,fans:2},'El DT pide regularidad')
   ],`${scorer.p1Name}, protagonista del encuentro`);
  if(!pre&&expulsions.length)add('disciplina-'+String(m.id),'disciplina',235,
   `En el partido contra ${opponent} hubo ${expulsions.length} expulsión${expulsions.length===1?'':'es'}. ¿Qué opinás de esas acciones?`,[
    choice('calma','Mantener la calma',`Las decisiones arbitrales son parte del fútbol. Debemos enfocarnos en mejorar.`,{morale:1,board:3,fans:1},'La calma tras la polémica'),
    choice('disciplina','Exigir disciplina',`No podemos permitir que los nervios nos condicionen. Vamos a trabajar en ello.`,{morale:2,board:4,fans:1},'Disciplina en primer plano'),
    choice('grupo','Respaldar al vestuario',`Apoyaremos al equipo y mantendremos la concentración.`,{morale:4,board:0,fans:2},'El entrenador cuida al grupo')
   ],'La rueda de prensa aborda las expulsiones');
  if(pre)add('preparacion-'+String(m.id),'preparacion',205,`¿Qué mensaje recibe el vestuario antes de enfrentar a ${opponent}?`,[
    choice('confianza','Transmitir confianza',`Creemos en lo que venimos trabajando. Vamos a salir a competir.`,{morale:4,board:1,fans:2},'Confianza previa al encuentro'),
    choice('seriedad','Insistir en la seriedad',`Cada balón cuenta. Nos preparamos con seriedad.`,{morale:2,board:3,fans:1},'Preparación responsable'),
    choice('ambicion','Mostrar ambición',`Queremos competir al máximo y aspirar a ganar.`,{morale:3,board:1,fans:4},'Mensaje de ambición')
   ],'Mensaje desde el camerino');
 }

 // Preguntas sobre la copa seleccionada, sin mezclar puntos de liga con eliminatorias.
 if(c.competition!=='Liga'){
  const comp=c.competition;
  if(c.trophies.some(h=>comp==='Fase final y Recopa'?/Apertura|Recopa/.test(h.title):comp==='Copa Nacional'?/Copa de/.test(h.title):h.title.includes(comp.replace('Torneo: ','')))){
   const trophy=c.trophies.find(h=>comp==='Fase final y Recopa'?/Apertura|Recopa/.test(h.title):comp==='Copa Nacional'?/Copa de/.test(h.title):h.title.includes(comp.replace('Torneo: ','')));
   add('campeon-'+comp,'titulo',150,`¡${t.name} acaba de conquistar ${trophy.title}! ¿Qué significa este título para el club?`,[
    choice('agradecer','Dedicarlo a los aficionados',`Esta copa es de cada persona que acompañó a ${t.name} incluso en los momentos difíciles.`,{morale:3,board:2,fans:5},'El campeón celebra con su gente'),
    choice('grupo','Agradecer al vestuario',`Estos jugadores escribieron la historia. No hubo atajos, lo conseguimos como equipo.`,{morale:5,board:2,fans:2},'Homenaje a la plantilla'),
    choice('futuro','Pensar en el próximo desafío',`Hoy celebramos ${trophy.title}, mañana empieza otro reto. Queremos seguir ganando.`,{morale:2,board:4,fans:2},'Ambición del campeón')],`${t.name} celebra su conquista de ${trophy.title}`);
  }
  if(ls&&/semifinal|final|recopa|cuartos|octavos/i.test(c.lastStage))add('eliminatoria-'+comp,'eliminatoria',134,`En ${comp}, después del ${fmt}, ¿cómo valorás la eliminatoria ${c.lastStage}?`,[
   choice('analisis','Explicar las claves',`Cada detalle cuenta en estas series. Aprenderemos de lo ocurrido ante ${ls.opponent}.`,{morale:2,board:3,fans:1},'Lectura táctica de la llave'),
   choice('aficion','Destacar el carácter',`El equipo compitió con corazón. Vamos a defender nuestro escudo hasta el final.`,{morale:3,board:1,fans:4},'El DT reivindica la entrega'),
   choice('mesura','Pedir concentración',`Ante ${ls.opponent} no hay lugar para confiarse; la clasificación se gana en cancha.`,{morale:1,board:4,fans:1},'Concentración de eliminatoria')],`La llave de ${comp} bajo la lupa`);
  if(next)add('previa-'+comp,'copa',126,`Se viene ${next.home} contra ${next.away} en ${comp}. ¿Cómo encaran este desafío?`,[
   choice('valientes','Prometer valentía',`Jugaremos con decisión. ${comp} exige dar el máximo.`,{morale:3,board:1,fans:3},'Ambición en la copa'),
   choice('estrategia','Priorizar los detalles',`Vamos a estudiar cada virtud del rival, los detalles pueden decidir una eliminatoria.`,{morale:1,board:4,fans:1},'Preparación para la copa'),
   choice('plantel','Rotar para competir',`Necesitamos a toda la plantilla para competir en ${comp}. Todos tendrán una oportunidad.`,{morale:4,board:1,fans:1},'Rotaciones en la competición')],`${t.coach} prepara ${comp}`);
 }

 if(ls){
  if(c.streak>=3&&ls.result==='P')add('crisis','rendimiento',116,`Van ${c.streak} derrotas consecutivas. Después del ${fmt}, ¿tenés respuestas para frenar esta crisis?`,[
   choice('sereno','Aceptar la responsabilidad',`Después de ${c.streak} derrotas, me hago responsable. El grupo necesita trabajo y serenidad.`,{morale:2,board:2,fans:0},'Responsabilidad sin señalar jugadores'),
   choice('urgente','Exigir una reacción',`Se terminó el margen de error. El próximo partido tenemos que reaccionar por el escudo.`,{morale:-1,board:2,fans:4},'La afición exige resultados'),
   choice('apoyo','Proteger a la plantilla',`No voy a dejar solos a mis jugadores en el peor momento. Vamos a salir unidos.`,{morale:4,board:-1,fans:1},'El vestuario recibe respaldo')],`La presión crece sobre ${t.coach}: ${c.streak} derrotas seguidas`);
  if(c.streak>=3&&ls.result==='G')add('racha','rendimiento',112,`Llevan ${c.streak} triunfos seguidos y acaban de ganar ${fmt}. ¿Este es el mejor momento del equipo?`,[
   choice('cautela','Evitar la euforia',`Ganar ${c.streak} veces seguidas tiene mérito, pero todavía no ganamos nada.`,{morale:1,board:3,fans:1},'Mensaje de concentración'),
   choice('orgullo','Celebrar el gran momento',`Estoy orgulloso: estas ${c.streak} victorias son el premio al esfuerzo de todos.`,{morale:4,board:1,fans:3},'El vestuario celebra su momento'),
   choice('ambicion','Apuntar más alto',`Esta racha demuestra que podemos pelear por objetivos grandes. No nos conformamos.`,{morale:2,board:1,fans:4},'Se elevan las expectativas')],`${t.coach} alimenta la ilusión después de ${c.streak} victorias`);
  if(ls.result==='P')add('derrota','rendimiento',98,`Tras caer ${fmt}, ¿cuál fue el problema principal del equipo?`,[
   choice('analisis','Reconocer errores tácticos',`Ante ${ls.opponent} fallamos en momentos importantes. Debo ajustar el plan de partido.`,{morale:1,board:3,fans:0},'El DT asume ajustes tácticos'),
   choice('plantel','Respaldar a tus jugadores',`El resultado ante ${ls.opponent} duele, pero confío en este grupo para levantarse.`,{morale:4,board:0,fans:1},'Respaldo tras la derrota'),
   choice('exigencia','Pedir mucho más',`Perder ${ls.own}-${ls.other} no es aceptable. Necesitamos otra actitud desde el inicio.`,{morale:-2,board:1,fans:4},'Mensaje exigente')],`${t.coach} analiza la derrota de ${t.name}`);
  if(ls.result==='G')add('victoria','rendimiento',95,`Después del triunfo ${fmt}, ¿qué fue lo que marcó la diferencia?`,[
   choice('equipo','Destacar al grupo',`Ganamos ${ls.own}-${ls.other} porque el equipo jugó unido y todos aportaron.`,{morale:4,board:1,fans:2},'El DT agradece al vestuario'),
   choice('estrategia','Destacar el planteamiento',`Estudiamos a ${ls.opponent} y el planteamiento funcionó. Ahora toca seguir mejorando.`,{morale:1,board:4,fans:1},'Confianza en el proyecto táctico'),
   choice('hinchas','Dedicar el triunfo a la afición',`Esta victoria ante ${ls.opponent} es para la gente que nunca deja de alentarnos.`,{morale:2,board:0,fans:5},'La grada recibe la dedicatoria')],`${t.coach} celebra el triunfo de ${t.name}`);
  if(ls.result==='E')add('empate','rendimiento',97,`El último partido terminó ${fmt}. ¿Es un punto valioso o una oportunidad perdida?`,[
   choice('valioso','Valorar el punto',`Ante ${ls.opponent} sumamos un punto importante. Hay aspectos positivos que rescatar.`,{morale:2,board:1,fans:0},'El cuerpo técnico pide perspectiva'),
   choice('insatisfecho','Exigir más ambición',`Con el empate ${ls.own}-${ls.other} no estamos satisfechos. Teníamos que buscar la victoria.`,{morale:-1,board:1,fans:3},'Ambición por encima del empate'),
   choice('apoyo','Reconocer la entrega',`Mis jugadores pelearon hasta el final contra ${ls.opponent}. Vamos a crecer con esta experiencia.`,{morale:4,board:0,fans:1},'Respaldo al esfuerzo')],`${t.name}: debate después del empate`);
  if(c.results.slice(-3).reduce((n,x)=>n+x.own,0)===0&&c.results.length>=3)add('sequia','rendimiento',107,'Tu equipo lleva tres encuentros sin marcar. ¿Cómo recuperarás el gol?',[
   choice('trabajo','Mejorar la definición','Vamos a trabajar la última jugada: crear oportunidades no basta si no concretamos.',{morale:2,board:2,fans:1},'Trabajo específico de ataque'),
   choice('cambios','Anunciar cambios ofensivos','Estoy evaluando variantes en el ataque. Nadie tiene la titularidad garantizada.',{morale:-1,board:2,fans:3},'Competencia interna'),
   choice('calma','Dar confianza a los delanteros','Los goles llegarán. Mis delanteros tienen capacidad y mi confianza total.',{morale:4,board:0,fans:0},'Respaldo a los delanteros')],`${t.name} busca romper su sequía goleadora`);
  if(c.results.slice(-3).reduce((n,x)=>n+x.other,0)>=7&&c.results.length>=3)add('defensa','rendimiento',102,'La defensa ha recibido siete o más goles en los últimos tres partidos. ¿Te preocupa?',[
   choice('ajuste','Prometer ajustes defensivos','Hay espacios que no podemos seguir regalando. Ajustaremos nuestro orden defensivo.',{morale:1,board:3,fans:1},'Habrá ajustes en defensa'),
   choice('responsabilidad','Asumir las decisiones','La responsabilidad defensiva empieza conmigo, no con nombres propios.',{morale:3,board:2,fans:0},'El DT protege la zaga'),
   choice('firmeza','Pedir concentración máxima','Quien quiera jugar debe defender con intensidad los noventa minutos.',{morale:-2,board:1,fans:3},'Exigencia sin concesiones')],`La defensa de ${t.name}, bajo la lupa`);
 }
 if(c.row.pj>=3&&c.rank<=2&&t.division==='LSV')add('liderato','clasificacion',91,`Están ${c.rank===1?'líderes':'segundos'} con ${c.row.pts} puntos. ¿Es momento de hablar del título?`,[
  choice('prudencia','Mantener los pies en la tierra',`Vamos ${c.rank}º, pero el campeonato es largo. No voy a vender títulos antes de tiempo.`,{morale:1,board:3,fans:0},'Cautela en la cima'),
  choice('ilusion','Hablar de campeonato','Si seguimos compitiendo así, tenemos derecho a soñar con la corona.',{morale:3,board:1,fans:4},'El título ilusiona'),
  choice('objetivo','Enfocarse en el siguiente encuentro','La clasificación importa, pero mi único objetivo inmediato son los próximos tres puntos.',{morale:2,board:2,fans:1},'Mentalidad partido a partido')],`${t.name} sueña con su primer gran título`);
 if(c.row.pj>=3&&c.rank>=c.teams-2)add('descenso','clasificacion',95,`Están en el puesto ${c.rank} de ${c.teams}, con ${c.row.pts} puntos. ¿Temés por la permanencia?`,[
  choice('realismo','Reconocer el peligro','La posición en la tabla preocupa y lo digo sin rodeos. Tenemos que sumar ya.',{morale:1,board:3,fans:2},'Alerta por la clasificación'),
  choice('conviccion','Transmitir confianza','Hay margen para recuperarse. Este grupo tiene fútbol para salir de abajo.',{morale:4,board:-1,fans:2},'Mensaje de confianza'),
  choice('sacudida','Exigir resultados inmediatos','No hay excusas: la permanencia exige puntos, no explicaciones.',{morale:-2,board:2,fans:4},'Ultimátum deportivo')],`${t.name} enfrenta la presión de la zona baja`);
 if(val(t.board,70)<55)add('directiva','institucion',92,`La confianza de la directiva está en ${Math.round(val(t.board))}/99. ¿Sentís tu puesto en riesgo?`,[
  choice('dialogo','Explicar tu proyecto','Hablo con la directiva de frente y tengo claro cómo corregir el rumbo.',{morale:1,board:4,fans:0},'El DT defiende su proyecto'),
  choice('desafio','Responder con resultados','En el fútbol mandan los resultados. Voy a demostrarlo en la cancha.',{morale:2,board:1,fans:3},'El DT acepta el desafío'),
  choice('vestuario','Evitar distracciones','Mi futuro no es la prioridad. Debemos proteger el trabajo del equipo.',{morale:4,board:-1,fans:1},'Protección del vestuario')],`¿Sigue ${t.coach}? La directiva evalúa el proyecto`,'La Tribuna Popular');
 if(val(t.supporters?.mood,55)<46)add('hinchada','aficion',84,`La afición está molesta (ánimo ${Math.round(val(t.supporters.mood))}/99). ¿Qué les decís a los hinchas?`,[
  choice('disculpas','Pedir disculpas a la grada','A nuestra gente le debemos una disculpa y una reacción dentro del campo.',{morale:0,board:1,fans:5},'Disculpas a los aficionados'),
  choice('union','Pedir que sigan alentando','Entiendo su frustración. Juntos y con respeto podemos superar este momento.',{morale:3,board:0,fans:3},'Llamado a la unidad'),
  choice('exigencia','Prometer entrega total','La afición merece intensidad y resultados. Vamos a dejarnos todo.',{morale:1,board:1,fans:4},'Compromiso con las gradas')],`${t.coach} responde al malestar de la afición`,'La Tribuna Popular');
 if(inj.length>=2){const player=inj.slice().sort((a,b)=>b.ovr-a.ovr)[0];add('lesiones','plantel',88,`Hay ${inj.length} jugadores de baja, entre ellos ${player.name}. ¿Cómo afrontarás las ausencias?`,[
  choice('alternativas','Confiar en los reemplazos',`Tenemos un plantel amplio. Otros compañeros aprovecharán esta oportunidad.`,{morale:4,board:1,fans:1},'El DT confía en los suplentes'),
  choice('cuidado','Priorizar la recuperación',`No apuraremos a ${player.name} ni a nadie. Primero está su salud.`,{morale:3,board:2,fans:2},'Precaución médica'),
  choice('juveniles','Dar minutos a los jóvenes','Las bajas pueden abrir la puerta a los canteranos: tienen que estar preparados.',{morale:2,board:2,fans:3},'Oportunidad para la cantera')],`Las lesiones obligan a mover piezas en ${t.name}`);}
 if(c.market)add('fichajes','mercado',78,`El mercado está abierto y ${t.name} tiene ${val(t.budget).toFixed(1)} M VLR. ¿Llegarán refuerzos?`,[
  choice('prudencia','Hablar de sostenibilidad','No ficharemos por fichar. Cualquier llegada deberá mejorar al grupo y ser viable.',{morale:1,board:4,fans:0},'Mercado responsable'),
  choice('refuerzos','Confirmar que buscás opciones','Estamos trabajando para sumar competencia y calidad antes del cierre del mercado.',{morale:1,board:-1,fans:4},'Expectativas de fichajes'),
  choice('plantel','Respaldar la plantilla','Mi primera apuesta sigue siendo la gente que ya está en este vestuario.',{morale:4,board:1,fans:1},'Respaldo a los actuales jugadores')],`${t.name} define su postura en el mercado`,'Radar de Fichajes');
 if(next){const opponent=next.home===c.name?next.away:next.home;const isDerby=next.round===9||next.round===18;add(isDerby?'clasico':'siguiente','proximo',isDerby?94:69,`${isDerby?'Se acerca el clásico interzonal':'El próximo rival es'} ${opponent}. ¿Cómo lo preparás?`,[
  choice('respeto','Respetar al rival',`${opponent} merece respeto. Tendremos que competir con mucha concentración.`,{morale:2,board:2,fans:0},'Respeto al próximo rival'),
  choice('ataque','Prometer un equipo valiente',`Vamos a buscar el partido contra ${opponent}, con ambición desde el pitazo inicial.`,{morale:1,board:0,fans:4},'Ambición en la previa'),
  choice('equilibrio','No revelar el planteamiento',`Tenemos un plan para enfrentar a ${opponent}, pero los detalles quedan en el vestuario.`,{morale:2,board:3,fans:1},'Secreto táctico')],`${t.coach} palpita el próximo duelo ante ${opponent}`,'La Tribuna Popular');}
 if((t.youth||[]).length||c.row.pj<=6)add('cantera','proyecto',55,'¿Qué espacio tendrán los jóvenes en tu proyecto de equipo?',[
  choice('proceso','Prometer formación gradual','Los jóvenes necesitan trabajar y crecer sin cargar con toda la presión.',{morale:2,board:3,fans:1},'Paciencia con la cantera'),
  choice('oportunidad','Abrirles la puerta al once','Si los juveniles están preparados, tendrán minutos. La edad no decide quién juega.',{morale:3,board:1,fans:3},'Competencia para todos'),
  choice('exigencia','Marcar estándares altos','El primer equipo no regala puestos, pero la cantera tendrá oportunidades justas.',{morale:1,board:2,fans:2},'Exigencia formativa')],`${t.name} mira al futuro desde su academia`);
 add('objetivos','proyecto',35,`En esta temporada ${c.season}, ¿cuál es la verdadera meta de ${t.name}?`,[
  choice('progreso','Construir una identidad','Quiero un equipo reconocible y competitivo, más allá de un resultado puntual.',{morale:2,board:3,fans:1},'Proyecto a largo plazo'),
  choice('ambicion','Competir por todo','Representamos a un club con aspiraciones. Vamos a pelear cada competición.',{morale:2,board:0,fans:4},'El DT eleva la apuesta'),
  choice('equipo','Poner al grupo primero','Mi objetivo es tener un vestuario fuerte que compita unido cada semana.',{morale:4,board:1,fans:1},'La prioridad es el plantel')],`${t.coach} traza sus objetivos en ${t.name}`);
 return list;
}
function selectQuestions(s,name,c,cycle){const topics=buildTopics(c),used=new Set();const result=[];const randKey=`${s.seed}|${name}|${c.signature}|${cycle}`;const ranked=topics.map(q=>({...q,sort:q.weight+(hash(randKey+q.id)%13)})).sort((a,b)=>b.sort-a.sort);for(const q of ranked){if(result.length>=3)break;if(used.has(q.category))continue;used.add(q.category);const reporter=['Martina Solís','Damián Rojas','Valeria Montes','Elías Navarro','Camila Vargas','Bruno Campos','Inés Arce','Renato Varela'][(hash(randKey+q.id))%8];result.push({id:`${cycle}-${q.id}`,topic:q.id,category:q.category,question:q.question,responses:q.responses,headline:q.headline,media:q.media,reporter});}
 return result;}
function sessions(s){s.ecosystem??={};s.ecosystem.press??=[];s.ecosystem.pressConferenceCount??=0;s.ecosystem.pressSessions??={};return s.ecosystem.pressSessions;}
export function getPressConference(s,name,competition='Liga',matchId=null){const store=sessions(s);const c=pressSnapshot(s,name,competition,matchId);const key=matchId?name+'::partido::'+matchId:name+'::'+competition;let current=store[key];if(!current||current.signature!==c.signature){const cycle=(current?.cycle||0)+1;current={signature:c.signature,cycle,season:s.season,questions:selectQuestions(s,name,c,cycle),index:0,entries:[],completed:false};store[key]=current;}
 return {session:current,context:c,current:current.questions[current.index]||null};}
const olderStances={calm:'Hay que trabajar sin perder el rumbo.',passion:'Nadie puede estar por encima del escudo.',defend:'Creo en este vestuario y sus futbolistas.',critic:'No podemos ocultar lo que está fallando.'};
export function answerPress(s,name,question,answer,competition='Liga',matchId=null){const team=s.teams[name];if(!team)throw Error('Club no encontrado');const {session,current}=getPressConference(s,name,competition,matchId);let response,headline,originalQuestion,media,reporter;
 if(current&&question===current.id){response=current.responses.find(x=>x.id===answer);if(!response)throw Error('Seleccioná una respuesta válida para esta pregunta');headline=current.headline;originalQuestion=current.question;media=current.media;reporter=current.reporter;
 }else if(typeof question==='string'&&question.startsWith('¿')&&olderStances[answer]){response={quote:olderStances[answer],effects:{morale:{calm:2,passion:1,defend:3,critic:-3}[answer],board:{calm:2,passion:0,defend:1,critic:-3}[answer],fans:{calm:0,passion:3,defend:2,critic:-1}[answer]}};headline=`${team.coach} comparece ante la prensa`;originalQuestion=question;media='El Heraldo de Noveria';reporter='Redacción';
 }else throw Error(session.completed?'Esta rueda de prensa ya terminó. Jugá otro partido para abrir una nueva.':'La pregunta cambió. Actualizá la rueda de prensa.');
 const before={morale:team.morale,board:team.board,fans:team.supporters?.mood||55};const e=response.effects||{};
 team.morale=clamp(val(team.morale,70)+val(e.morale),10,99);team.board=clamp(val(team.board,70)+val(e.board),5,99);team.supporters??={mood:55,attendance:0,lastAttendance:0,protests:0};team.supporters.mood=clamp(val(team.supporters.mood,55)+val(e.fans),3,99);
 s.ecosystem.pressConferenceCount++;
 const id=`press-${s.season}-${s.ecosystem.pressConferenceCount}`;const entry={id,name,coach:team.coach,question:originalQuestion,answer:response.quote,stance:answer,media,reporter,headline,season:s.season,impact:{morale:team.morale-before.morale,board:team.board-before.board,fans:team.supporters.mood-before.fans},round:pressSnapshot(s,name,competition,matchId).row.pj,competition,matchId:matchId||null};
 s.ecosystem.press.unshift(entry);if(s.ecosystem.press.length>180)s.ecosystem.press.length=180;
 s.news.unshift({id,category:'Prensa',title:headline,description:`${reporter}, ${media}: «${response.quote}»`,date:`${s.edition||'Apertura'} ${s.season}`,relatedClub:name,competition,matchId:matchId||null});if(s.news.length>300)s.news.length=300;
 if(s.mode==='manager'&&s.managedClub===name&&s.career)s.career.pressScore=val(s.career.pressScore)+val(e.morale);
 if(current&&question===current.id){session.entries.push(entry);session.index++;session.completed=session.index>=session.questions.length;}
 return entry;
}
