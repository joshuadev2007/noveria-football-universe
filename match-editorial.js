/** Noveria 5.7 — Redacción deportiva contextual.
 * Exclusivamente hechos derivados de actas reales. No altera marcadores,
 * estadísticas, jugadores, premios ni resultados simulados.
 */
const goal=e=>e?.type==='goal';
const safe=n=>Number.isFinite(Number(n))?Number(n):0;
const name=e=>String(e?.p1Name||'un futbolista sin identificar');
const team=(m,side)=>side==='home'?m.home:m.away;
const titleCase=s=>s[0]?.toUpperCase()+s.slice(1);
function competition(m){
 if(m.competition==='LSV')return 'Liga Suprema Veltrana';
 if(m.competition==='LPV')return 'Liga de Plata';
 if(m.competition==='CUP')return 'Copa de las Provincias';
 if(m.competition==='POST')return 'Fase final de Veltrania';
 if(m.competition==='ARCALIS')return 'Copas de Arcalis';
 if(String(m.competition||'').startsWith('FINAL-'))return 'Fase final de '+String(m.competition).slice(6);
 return String(m.competition||'Competición especial').replace('CUSTOM-','Torneo ');
}
export function matchEditorial(m){
 if(!m||!m.played||!Number.isInteger(m.scoreH)||!Number.isInteger(m.scoreA))return {headline:'Partido pendiente',lead:'Este encuentro aún no se ha disputado.',paragraphs:[],moments:[],notes:[],star:null,tone:'preview',competition:competition(m)};
 const h=safe(m.scoreH),a=safe(m.scoreA),draw=h===a,win=h>a?'home':'away',loser=win==='home'?'away':'home';
 const winner=team(m,win),losing=team(m,loser),goals=(m.events||[]).filter(goal).slice().sort((x,y)=>safe(x.min)-safe(y.min)),yellow=(m.events||[]).filter(x=>x.type==='yellow'),red=(m.events||[]).filter(x=>x.type==='red');
 const validGoals=!m.legacy&&goals.length===h+a&&goals.filter(e=>e.side==='home').length===h&&goals.filter(e=>e.side==='away').length===a;
 const count=new Map();
 for(const g of goals)if(g.p1Name){const key=String(g.side)+'|'+g.p1Name;count.set(key,{side:g.side,who:g.p1Name,n:(count.get(key)?.n||0)+1});}
 const scorers=[...count.values()].sort((x,y)=>y.n-x.n||x.who.localeCompare(y.who,'es'));
 const top=scorers[0]||null;
 const st=m.stats&&!m.legacy?m.stats:null;const hn=st?safe(st.shotsH):0,an=st?safe(st.shotsA):0;
 const leader=st?(hn>an?'home':an>hn?'away':null):null;
 const poss=st?(safe(st.posH)>safe(st.posA)?'home':safe(st.posA)>safe(st.posH)?'away':null):null;
 const knockout=Boolean(m.penalties||m.extraTime||['CUP','POST','ARCALIS'].includes(m.competition)||m.phase==='knockout'||m.group==='final'||m.group==='recopa'||m.leg);
 let comeback=null,lateDecider=null,firstGoal=null,wasBehind=false;
 if(validGoals){
  let ph=0,pa=0,previous='draw';
  for(const g of goals){if(g.side==='home')ph++;else if(g.side==='away')pa++;
   const ahead=ph===pa?'draw':ph>pa?'home':'away';
   if(!firstGoal)firstGoal=g;
   if(ahead===loser)wasBehind=true;
   if(!draw&&ahead===win&&wasBehind&&!comeback)comeback=g;
   if(!draw&&ahead===win&&previous==='draw'&&safe(g.min)>=80)lateDecider=g;
   previous=ahead;
  }
 }
 let headline,lead,tone='standard';
 const margin=Math.abs(h-a);
 if(m.legacy){headline=draw?m.home+' y '+m.away+' igualaron '+h+'–'+a:winner+' venció '+h+'–'+a+' a '+losing;lead='El marcador pertenece al archivo histórico. No se conservan actas individuales suficientes para reconstruir cómo se desarrolló el juego.';tone='archive';}
 else if(m.penalties){headline='¡Drama desde los once metros! '+m.home+' y '+m.away+' definen en penales';lead='El partido terminó '+h+'–'+a+' y la definición por penales registrada fue '+m.penalties+'.'+(m.winner?' Avanzó '+m.winner+'.':'');tone='dramatic';}
 else if(comeback){headline='¡Remontada de '+winner+'! '+losing+' dejó escapar su ventaja';lead=winner+' terminó imponiéndose '+h+'–'+a+' después de estar por debajo en el marcador. El cambio de rumbo quedó reflejado en los goles registrados.';tone='dramatic';}
 else if(lateDecider){headline='¡Golpe tardío! '+winner+' decide el duelo en el tramo final';lead='Un gol de '+name(lateDecider)+' al '+safe(lateDecider.min)+'′ fue parte del desenlace del '+h+'–'+a+' ante '+losing+'.';tone='dramatic';}
 else if(draw&&h+a===0){headline='Cerrojo defensivo: '+m.home+' y '+m.away+' firman el 0–0';lead='Ninguno encontró el gol. El partido terminó sin romperse la igualdad.';tone='defensive';}
 else if(draw&&h+a>=4){headline='¡Lluvia de goles! '+m.home+' y '+m.away+' empatan '+h+'–'+a;lead='El marcador se movió varias veces, pero ninguno pudo quedarse con la victoria.';tone='dramatic';}
 else if(draw){headline=m.home+' y '+m.away+' reparten puntos tras el '+h+'–'+a;lead='Dos equipos se repartieron el resultado en un encuentro que terminó en tablas.';tone='balanced';}
 else if(margin>=3){headline='¡Exhibición de '+winner+'! Goleada '+h+'–'+a;lead=winner+' dominó el resultado con una ventaja de '+margin+' goles ante '+losing+'.';tone='rout';}
 else if(h+a>=5){headline=winner+' gana un partidazo de '+(h+a)+' goles';lead='En un encuentro de áreas abiertas, '+winner+' se impuso '+h+'–'+a+' a '+losing+'.';tone='dramatic';}
 else if(margin===1){headline=winner+' gana por la mínima diferencia: '+h+'–'+a;lead='Un gol de ventaja fue suficiente para que '+winner+' saliera vencedor ante '+losing+'.';tone='tight';}
 else{headline=winner+' se impone con autoridad a '+losing;lead='El resultado final fue '+h+'–'+a+' a favor de '+winner+'.';tone='standard';}
 const paragraphs=[];
 if(!m.legacy){
  if(validGoals&&goals.length){
   const first=goals[0],last=goals.at(-1),firstTeam=team(m,first.side);
   paragraphs.push('El marcador se abrió al '+safe(first.min)+'′ con '+name(first)+' para '+firstTeam+'. '+(goals.length>1?'La última anotación llegó al '+safe(last.min)+'′, obra de '+name(last)+'.':'Fue la única anotación registrada.'));
  }else if(h+a>0)paragraphs.push('El resultado registra '+(h+a)+' goles. No se dispone de una secuencia individual completa de anotadores, por lo que no se atribuyen jugadas no registradas.');
  if(top&&top.n>=2)paragraphs.push(top.who+' fue protagonista con '+top.n+' goles para '+team(m,top.side)+(top.n>=3?', una actuación de triplete o más.':', firmando un doblete.'));
  if(red.length)paragraphs.push('El encuentro dejó '+red.length+' expulsión'+(red.length===1?'':'es')+'. '+red.map(x=>name(x)+' ('+team(m,x.side)+', '+safe(x.min)+'′)').join('; ')+'.');
  else if(yellow.length>=4)paragraphs.push('Hubo '+yellow.length+' tarjetas amarillas registradas; el árbitro tuvo que intervenir repetidamente.');
  if(st){
   const possession=poss?'El balón estuvo mayormente en pies de '+team(m,poss)+' ('+safe(poss==='home'?st.posH:st.posA)+'% de posesión).':'La posesión fue equilibrada.';
   let shots=' Se contabilizaron '+hn+' remates de '+m.home+' y '+an+' de '+m.away+'.';
   if(leader&&!draw&&leader!==win)shots+=' '+winner+' ganó a pesar de rematar menos que su rival.';
   paragraphs.push(possession+shots);
   if(safe(st.onH)+safe(st.onA)>0)paragraphs.push('En tiros al arco, '+m.home+' registró '+safe(st.onH)+' y '+m.away+' '+safe(st.onA)+'. Los goles esperados fueron '+safe(st.xgH).toFixed(2)+' a '+safe(st.xgA).toFixed(2)+'.');
  }
  if(m.extraTime)paragraphs.push('El partido necesitó prórroga para resolver su historia.');
  if(m.penalties)paragraphs.push('La definición por penales quedó registrada como '+m.penalties+'.');
  if(knockout&&!m.penalties)paragraphs.push('El duelo corresponde a una competición eliminatoria o fase decisiva del calendario.');
 }
 const moments=(m.legacy?[]:(m.events||[]).filter(e=>['goal','red','yellow','injury','save','shot','corner','sub','var'].includes(e.type)).slice().sort((x,y)=>safe(x.min)-safe(y.min))).map(e=>({minute:safe(e.min),type:e.type,side:e.side,name:e.p1Name||null,other:e.p2Name||null}));
 const notes=[draw?'EMPATE':margin>=3?'GOLEADA':'VICTORIA',top&&top.n>=2?(top.n>=3?'TRIPLETE':'DOBLETE'):null,red.length?'EXPULSIÓN':null,comeback?'REMONTADA':null,lateDecider?'FINAL DRAMÁTICO':null,knockout?'PARTIDO DE COPA':null].filter(Boolean);
 return {headline,lead,paragraphs,moments,star:top?{name:top.who,goals:top.n,team:team(m,top.side)}:null,tone,notes,competition:competition(m),historical:!!m.legacy};
}
