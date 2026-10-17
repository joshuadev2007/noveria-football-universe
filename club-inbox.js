/** NOVERIA · Centro de mensajes del entrenador.
 * Un buzón POR CLUB dirigido. Todos los mensajes son eventos verificados o
 * situaciones basadas en datos del club; las respuestas afectan la partida.
 * No modifica automáticamente partidos ni inventa ofertas de otros clubes.
 */
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const year=s=>(s.edition||'Apertura')+' '+s.season;
const managed=s=>s.mode==='manager'&&s.managedClub&&s.teams?.[s.managedClub]?s.managedClub:null;
const getPlayer=(t,id)=>(t.players||[]).find(p=>String(p.id)===String(id));
const money=v=>Number(v||0).toFixed(3)+' M VLR';
const choice=(id,label,detail)=>({id,label,detail});
export const inboxClub=managed;
export function ensureClubInbox(s){
 s.clubInbox??={boxes:{}};
 s.clubInbox.boxes??={};
 return s.clubInbox;
}
export function getClubBox(s,club){
 ensureClubInbox(s);
 if(!s.teams?.[club])throw Error('Club no disponible');
 const b=s.clubInbox.boxes[club]??=( {club,items:[],seen:[],promises:[],snapshot:null,dates:0} );
 b.items??=[];b.seen??=[];b.promises??=[];b.dates??=0;
 return b;
}
export function unreadClubMessages(s,club=managed(s)){
 if(!club)return 0;
 return getClubBox(s,club).items.filter(m=>!m.read).length;
}
function publish(s,club,data){
 const b=getClubBox(s,club),key=String(data.key);
 if(b.seen.includes(key))return null;
 const m={id:'email-'+b.items.length+'-'+b.dates+'-'+key,club,date:year(s),key,
  category:data.category,from:data.from,role:data.role,subject:data.subject,
  body:data.body,urgency:data.urgency||'normal',playerId:data.playerId||null,
  matchId:data.matchId||null,status:'pending',read:false,options:data.options,
  response:null,outcome:null};
 if(!Array.isArray(m.options)||m.options.length!==4||new Set(m.options.map(o=>o.id)).size!==4)throw Error('Un mensaje debe tener cuatro respuestas distintas');
 b.items.unshift(m);b.seen.push(key);
 if(b.items.length>110)b.items=b.items.slice(0,110);
 if(b.seen.length>500)b.seen=b.seen.slice(-500);
 return m;
}
const boardChoices=[
 choice('support','Respaldo al proyecto','+3 confianza de directiva · +1 moral'),
 choice('ambition','Prometer mejoras inmediatas','+4 confianza · -1 moral por presión'),
 choice('staff','Invertir en análisis deportivo','-0,100 M VLR · +5 confianza · +2 moral'),
 choice('steady','Mantener el plan actual','+2 moral · -1 confianza')
];
function welcome(s,club){
 const t=s.teams[club];return {key:'welcome-'+year(s),category:'directiva',
 from:t.president||'Presidencia',role:'Presidencia del club',subject:'Primer día en el despacho: objetivos del club',
 body:'Bienvenido al cuerpo técnico de '+club+'. Contamos con un presupuesto de '+money(t.budget)+', una confianza de '+Math.round(t.board||70)+'/100 y '+t.players.length+' jugadores. Necesitamos acordar cómo abordaremos esta edición. ¿Qué prioridad querés transmitir a la directiva?',
 options:boardChoices};
}
function fixtureMessage(s,club,m){
 const home=m.home===club,side=home?'home':'away',against=home?m.away:m.home;
 const gf=home?m.scoreH:m.scoreA,ga=home?m.scoreA:m.scoreH;
 const playerEvents=(m.events||[]).filter(e=>e.side===side),injuries=playerEvents.filter(e=>e.type==='injury'),reds=playerEvents.filter(e=>e.type==='red');
 const starGoals=new Map();
 for(const e of playerEvents.filter(e=>e.type==='goal'&&e.p1!=null))starGoals.set(String(e.p1),(starGoals.get(String(e.p1))||0)+1);
 const top=[...starGoals.entries()].sort((a,b)=>b[1]-a[1])[0],hero=top&&getPlayer(s.teams[club],top[0]);
 const out=[];
 if(injuries.length){
  for(const ev of injuries.slice(0,2)){const p=getPlayer(s.teams[club],ev.p1);if(!p)continue;
   out.push({key:'injury-'+m.id+'-'+p.id,category:'medico',from:s.teams[club].medic||'Departamento médico',role:'Jefatura médica',playerId:p.id,matchId:m.id,urgency:'alta',
    subject:'Informe médico: '+p.name,body:'Durante el partido contra '+against+', '+p.name+' sufrió una lesión al minuto '+ev.min+'. Tiene '+(p.outGames||0)+' partido(s) de baja estimados. El cuerpo médico necesita instrucciones; ningún tratamiento garantiza una recuperación inmediata.',
    options:[choice('rest','Respetar reposo completo','+6 condición · reducir riesgo · no acorta la baja'),choice('therapy','Autorizar rehabilitación intensiva','-0,120 M · reduce hasta 1 partido de baja'),choice('monitor','Controles y revisión semanal','-0,040 M · +3 condición'),choice('pressure','Pedir volver cuanto antes','-3 moral del grupo · +1 confianza · sin alta médica automática')]});
  }
 }
 if(reds.length){const ev=reds[0],p=getPlayer(s.teams[club],ev.p1);
  if(p)out.push({key:'red-'+m.id+'-'+p.id,category:'disciplina',from:s.teams[club].director||'Dirección deportiva',role:'Dirección deportiva',playerId:p.id,matchId:m.id,
   subject:'Expulsión y disciplina: '+p.name,body:p.name+' vio tarjeta roja ante '+against+' al '+ev.min+'′. La sanción sigue vigente según el motor del juego. ¿Cómo querés gestionar la situación en el vestuario?',
   options:[choice('private','Conversación privada','+3 moral · +3 disciplina individual'),choice('warn','Advertencia formal','+3 confianza · -2 moral'),choice('support','Respaldar públicamente','+4 moral · -2 confianza'),choice('fine','Aplicar sanción interna','+4 confianza · -4 moral · -2 forma del jugador')]});
 }
 if(hero&&top[1]>=2){out.push({key:'star-'+m.id+'-'+hero.id,category:'jugador',from:hero.name,role:'Futbolista del primer equipo',playerId:hero.id,matchId:m.id,
 subject:'Mi actuación ante '+against,body:'Míster, estoy contento por mis '+top[1]+' goles contra '+against+'. Quiero seguir aportando, pero también saber qué esperás de mí en los próximos encuentros.',
 options:[choice('praise','Felicitar y reconocer el trabajo','+4 moral · +3 confianza individual'),choice('team','Recordar el esfuerzo colectivo','+3 moral del grupo · +2 confianza'),choice('demand','Pedir consistencia y exigencia','+3 forma individual · -1 moral'),choice('reward','Aprobar una prima deportiva','-0,060 M VLR · +5 moral · +3 forma individual')]});
 }
 if(gf<ga)out.push({key:'loss-'+m.id,category:'directiva',from:s.teams[club].director||'Director deportivo',role:'Dirección deportiva',matchId:m.id,
 subject:'Después de la derrota ante '+against,body:club+' perdió '+gf+'–'+ga+' ante '+against+'. Necesitamos una decisión para mejorar el próximo partido sin perder la calma dentro del vestuario.',
 options:[choice('review','Analizar errores con los futbolistas','+3 confianza · +1 moral'),choice('back','Respaldar al equipo','+5 moral · -1 confianza'),choice('intense','Aumentar exigencia en entrenamientos','+4 confianza · -4 condición de titulares'),choice('invest','Traer especialistas para analizar al rival','-0,080 M VLR · +4 confianza · +2 moral')]});
 else if(gf>ga&&m.group==='final')out.push({key:'winfinal-'+m.id,category:'directiva',from:s.teams[club].president||'Presidencia',role:'Presidencia del club',matchId:m.id,
 subject:'Una victoria importante ante '+against,body:'Ganamos '+gf+'–'+ga+' ante '+against+' en una final. Este resultado entusiasma al club; ahora queremos saber cómo mantener la ambición sin descuidar al plantel.',
 options:boardChoices});
 return out;
}
function regularMessages(s,club){
 const t=s.teams[club],b=getClubBox(s,club),list=[];
 const contracts=t.players.filter(p=>!p.loanParent&&Number.isFinite(Number(p.contractYears))&&Number(p.contractYears)<=1);
 const renew=contracts.sort((a,b)=>b.ovr-a.ovr)[0];
 if(renew&&(b.dates===1||b.dates%4===0))list.push({key:'contract-'+year(s)+'-'+b.dates+'-'+renew.id,category:'contratos',from:renew.name,role:'Futbolista',playerId:renew.id,urgency:'alta',
 subject:'Mi contrato y mi futuro en '+club,body:'Míster, mi contrato tiene '+renew.contractYears+' año(s) pendiente(s). Quiero claridad sobre mi futuro. Mi salario actual es '+(renew.salary||50)+' mil VLR al mes. ¿Cómo vamos a resolverlo?',
 options:[choice('renew','Ofrecer renovación por 2 años','Costo de firma y aumento salarial, si hay presupuesto'),choice('talk','Iniciar diálogo sin firmar todavía','+3 moral · compromiso por revisar'),choice('wait','Posponer hasta el próximo mercado','-3 moral · +1 confianza'),choice('list','Abrir la puerta a un traspaso','Lo marca como transferible · -4 moral')]});
 const low=t.players.filter(p=>Number(p.outGames||0)===0&&Number(p.fitness||90)<62).sort((a,b)=>Number(a.fitness||90)-Number(b.fitness||90))[0];
 if(low&&b.dates%3===0)list.push({key:'tired-'+year(s)+'-'+b.dates+'-'+low.id,category:'jugador',from:low.name,role:'Futbolista del primer equipo',playerId:low.id,
 subject:'Necesito gestionar el cansancio',body:'Míster, siento las piernas muy cargadas. Mi condición está en '+Math.round(low.fitness)+' de 100. Me preocupa llegar fatigado al próximo encuentro. Quería comentarlo antes de que sea un problema.',
 options:[choice('rest','Plan de descanso y recuperación','+13 condición · +3 moral'),choice('physio','Sesión extra con fisioterapia','-0,040 M · +17 condición'),choice('train','Ajustar intensidad y seguimiento','+7 condición · +2 forma · -1 moral'),choice('push','Exigir que mantenga el ritmo','+2 confianza de directiva · -8 condición · -4 moral')]});
 const squad=t.players.slice(11).filter(p=>(p.apps||0)<Math.max(2,Math.floor(Number(s.leagueRound||2)*.3))&&Number(p.ovr)>=60).sort((a,b)=>b.ovr-a.ovr);
 const bench=squad[0];
 if(bench&&b.dates%5===0)list.push({key:'minutes-'+year(s)+'-'+b.dates+'-'+bench.id,category:'jugador',from:bench.name,role:'Futbolista del primer equipo',playerId:bench.id,
 subject:'¿Puedo tener más oportunidades?',body:'Míster, estoy entrenando y quiero competir por un puesto. Solo tengo '+(bench.apps||0)+' apariciones registradas, y necesito saber si cuento para tus próximos planes. No te pido garantías vacías, solo una conversación clara.',
 options:[choice('promise','Prometer minutos en los próximos tres partidos','Compromiso verificable · +4 moral ahora'),choice('merit','Explicar que decide el rendimiento','+2 forma · +1 confianza'),choice('rotate','Ofrecer una evaluación de rotaciones','+3 moral · +1 forma'),choice('honest','Comunicar que actualmente es suplente','+2 confianza · -4 moral')]});
 if(Number(t.board||70)<52&&b.dates%3===0)list.push({key:'confidence-'+year(s)+'-'+b.dates,category:'directiva',from:t.president||'Presidencia',role:'Presidencia del club',urgency:'alta',
 subject:'Reunión de urgencia con la directiva',body:'La confianza en tu gestión ha bajado a '+Math.round(t.board)+'/100. Necesitamos un plan antes de que la situación empeore. No será suficiente con una respuesta simbólica.',
 options:boardChoices});
 if(b.dates>0&&b.dates%6===0&&list.length===0)list.push({key:'plan-'+year(s)+'-'+b.dates,category:'club',from:t.director||'Director deportivo',role:'Dirección deportiva',
 subject:'Informe periódico del club',body:'Ya hemos avanzado '+b.dates+' fechas oficiales. La directiva quiere saber qué priorizar: un vestuario competitivo, las finanzas, la formación de jóvenes o resultados a corto plazo.',
 options:[choice('team','Mejorar la dinámica del grupo','+4 moral · +1 confianza'),choice('budget','Controlar el gasto deportivo','+0,050 M de ahorro · -1 moral'),choice('academy','Invertir en metodología de cantera','-0,070 M · +2 moral · +2 confianza'),choice('results','Presionar por resultados inmediatos','+4 confianza · -2 moral')]});
 return list.slice(0,2);
}
function snapshot(t){return {players:Object.fromEntries((t.players||[]).map(p=>[String(p.id),p.name])),contracts:Object.fromEntries((t.players||[]).map(p=>[String(p.id),Number(p.contractYears||0)]))};}
function squadChanges(s,club,b){
 const t=s.teams[club],prev=b.snapshot,now=snapshot(t),out=[];
 if(prev){
  const arrivals=t.players.filter(p=>!Object.prototype.hasOwnProperty.call(prev.players,String(p.id)));
  for(const p of arrivals.slice(0,2)){out.push({key:'arrival-'+year(s)+'-'+p.id,category:'fichajes',from:t.director||'Dirección deportiva',role:'Dirección deportiva',playerId:p.id,
   subject:'Bienvenido al primer equipo: '+p.name,body:p.name+' se incorporó al plantel de '+club+'. Su posición es '+p.pos+' y su media actual es '+p.ovr+'. Necesitamos acordar cómo integrarlo sin alterar automáticamente el once.',
   options:[choice('welcome','Recibirlo personalmente','+4 moral · +2 forma del recién llegado'),choice('ease','Adaptación progresiva','+3 condición · +2 moral'),choice('demand','Competencia desde el primer día','+3 forma · +1 confianza · -1 moral'),choice('brief','Reunión táctica individual','+2 forma · +2 confianza · +1 moral')]});}
  const departures=Object.entries(prev.players).filter(([id])=>!Object.prototype.hasOwnProperty.call(now.players,id));
  if(departures.length){out.push({key:'departures-'+year(s)+'-'+b.dates+'-'+departures.map(x=>x[0]).join('_'),category:'fichajes',from:t.director||'Dirección deportiva',role:'Dirección deportiva',
   subject:'Actualización del plantel: movimientos confirmados',
   body:'El club ya no tiene en su plantilla a '+departures.slice(0,3).map(x=>x[1]).join(', ')+'. El cambio está registrado; revisá cómo reorganizar el vestuario y preparar las próximas fechas.',
   options:[choice('team','Tranquilizar al grupo','+4 moral'),choice('scout','Priorizar informes de refuerzos','-0,040 M · +2 confianza'),choice('youth','Dar prioridad a los juveniles','+2 moral · +2 confianza'),choice('wait','No acelerar contrataciones','+1 confianza · +0,020 M de ahorro')]});}
 }
 b.snapshot=now;
 return out;
}
function promisesAfterMatches(s,club,b,games){
 const out=[];
 for(const promise of b.promises.filter(p=>!p.resolved)){
  const involved=games.filter(m=>m.played&&(m.home===club||m.away===club));
  for(const m of involved){
   if(promise.resolved||promise.matchIds.includes(String(m.id)))continue;
   promise.matchIds.push(String(m.id));
   if((m.lineups?.[m.home===club?'home':'away']||[]).map(String).includes(String(promise.playerId))){
    promise.resolved=true;promise.fulfilled=true;
    const t=s.teams[club],player=getPlayer(t,promise.playerId);if(player)player.sharpness=clamp((player.sharpness||65)+3,15,100);
   }else if(promise.matchIds.length>=3){
    promise.resolved=true;promise.fulfilled=false;
    const t=s.teams[club];t.morale=clamp((t.morale||65)-4,20,99);
    out.push({key:'promise-failed-'+promise.id,category:'jugador',from:promise.playerName,role:'Futbolista',playerId:promise.playerId,
     subject:'Me prometiste oportunidades',body:'Míster, pasaron tres partidos oficiales y no fui titular. Necesito una explicación sincera porque habíamos hablado de mis minutos.',
     options:[choice('apologize','Pedir disculpas','+2 moral · -1 confianza'),choice('merit','Explicar los motivos deportivos','+1 confianza · -2 moral'),choice('support','Acompañar al jugador','+3 condición · +1 moral'),choice('firm','Mantener la decisión táctica','+2 confianza · -3 moral')]});
   }
  }
 }
 return out;
}
export function syncClubInbox(s,{club=managed(s),eventId=null,matches=[],routine=false}={}){
 if(!club||!s.teams[club])return [];
 const t=s.teams[club],b=getClubBox(s,club),received=[];
 const offer=data=>{const m=publish(s,club,data);if(m)received.push(m);};
 if(!b.items.some(x=>x.key==='welcome-'+year(s)))offer(welcome(s,club));
 for(const evt of squadChanges(s,club,b))offer(evt);
 if(eventId){
  const marker=year(s)+'/'+eventId;
  if(!b.lastDates)b.lastDates=[];
  if(!b.lastDates.includes(marker)){
   b.lastDates.push(marker);if(b.lastDates.length>180)b.lastDates=b.lastDates.slice(-180);b.dates++;
   const playedMatches=matches.filter(m=>m?.played&&(m.home===club||m.away===club));
   for(const m of playedMatches)for(const evt of fixtureMessage(s,club,m))offer(evt);
   for(const p of promisesAfterMatches(s,club,b,playedMatches))offer(p);
   for(const evt of regularMessages(s,club))offer(evt);
  }
 }else if(routine&&!b.items.some(x=>x.key==='welcome-'+year(s)))offer(welcome(s,club));
 return received;
}
export function markClubInboxRead(s,club,id=null){
 const box=getClubBox(s,club);
 for(const msg of box.items)if(!id||String(msg.id)===String(id))msg.read=true;
 return unreadClubMessages(s,club);
}
const apply=(target,key,delta,min=0,max=100)=>{target[key]=clamp(Number(target[key]||0)+delta,min,max)};
function spend(t,value){if(Number(t.budget||0)<value)throw Error('Presupuesto insuficiente: necesitás '+money(value));t.budget=+(t.budget-value).toFixed(3);}
function bonus(t,value){t.budget=+(Number(t.budget||0)+value).toFixed(3);}
export function answerClubInbox(s,club,id,reply){
 if(managed(s)!==club)throw Error('Solo podés responder mensajes del equipo que estás dirigiendo');
 const b=getClubBox(s,club),m=b.items.find(x=>String(x.id)===String(id));
 if(!m)throw Error('Mensaje no encontrado');
 if(m.status==='answered')throw Error('Este mensaje ya está respondido');
 const c=m.options.find(o=>o.id===reply);if(!c)throw Error('Esa respuesta no pertenece al mensaje');
 const t=s.teams[club],p=m.playerId?getPlayer(t,m.playerId):null;
 const benefits={morale:0,board:0,fitness:0,sharpness:0,cost:0},msgs=[];
 const mo=n=>{apply(t,'morale',n,20,99);benefits.morale+=n;};
 const bo=n=>{apply(t,'board',n,10,100);benefits.board+=n;};
 const fit=(n)=>{if(p){apply(p,'fitness',n,8,100);benefits.fitness+=n;}};
 const sharp=(n)=>{if(p){apply(p,'sharpness',n,15,100);benefits.sharpness+=n;}};
 const pay=n=>{spend(t,n);benefits.cost+=n;};
 if(['support','ambition','staff','steady'].includes(reply)){
  if(reply==='support'){bo(3);mo(1);}
  if(reply==='ambition'){bo(4);mo(-1);}
  if(reply==='staff'){pay(.10);bo(5);mo(2);}
  if(reply==='steady'){mo(2);bo(-1);}
 }else if(m.category==='medico'){
  if(reply==='rest'){fit(6);mo(1);}
  if(reply==='therapy'){pay(.12);if(p){p.outGames=Math.max(1,Number(p.outGames||1)-1);}fit(7);bo(2);}
  if(reply==='monitor'){pay(.04);fit(3);bo(2);}
  if(reply==='pressure'){mo(-3);bo(1);}
 }else if(m.category==='disciplina'){
  if(reply==='private'){mo(3);sharp(3);}
  if(reply==='warn'){bo(3);mo(-2);}
  if(reply==='support'){mo(4);bo(-2);}
  if(reply==='fine'){bo(4);mo(-4);sharp(-2);}
 }else if(m.category==='contratos'){
  if(!p)throw Error('El futbolista ya no pertenece al club. Revisá la plantilla antes de responder');
  if(reply==='renew'){
   if(p.loanParent)throw Error('No podés renovar a un jugador cedido');
   const old=Number(p.salary||50),newWage=Math.ceil(old*1.12),cost=+Math.max(.045,((newWage-old)*.0015)+.028).toFixed(3);
   pay(cost);p.salary=newWage;p.contractYears=2;mo(4);bo(2);msgs.push('Contrato firmado por 2 años con salario de '+newWage+' mil VLR/mes.');
  }
  if(reply==='talk'){mo(3);sharp(1);}
  if(reply==='wait'){mo(-3);bo(1);}
  if(reply==='list'){
   if(t.players.length<=17)throw Error('No podés marcar al jugador para traspaso con menos de 18 futbolistas');
   s.sportingOffice??={};s.sportingOffice.listings??={};
   s.sportingOffice.listings[club+':'+p.id]={club,playerId:String(p.id),date:year(s),minimum:+(Number(p.value||500)/1000*.85).toFixed(2)};
   mo(-4);bo(2);msgs.push('Jugador marcado como transferible en gerencia deportiva.');
  }
 }else if(m.category==='jugador'&&m.key.startsWith('minutes-')){
  if(reply==='promise'){
   b.promises.push({id:m.id,playerId:String(p.id),playerName:p.name,matchIds:[],resolved:false,fulfilled:false});
   mo(4);msgs.push('Se comprobarán los próximos 3 partidos oficiales.');
  }
  if(reply==='merit'){sharp(2);bo(1);}
  if(reply==='rotate'){mo(3);sharp(1);}
  if(reply==='honest'){bo(2);mo(-4);}
 }else if(m.key.startsWith('tired-')){
  if(reply==='rest'){fit(13);mo(3);}
  if(reply==='physio'){pay(.04);fit(17);bo(1);}
  if(reply==='train'){fit(7);sharp(2);mo(-1);}
  if(reply==='push'){bo(2);fit(-8);mo(-4);}
 }else if(m.key.startsWith('star-')){
  if(reply==='praise'){mo(4);sharp(3);}
  if(reply==='team'){mo(3);bo(2);}
  if(reply==='demand'){sharp(3);mo(-1);}
  if(reply==='reward'){pay(.06);mo(5);sharp(3);}
 }else if(m.key.startsWith('loss-')){
  if(reply==='review'){bo(3);mo(1);}
  if(reply==='back'){mo(5);bo(-1);}
  if(reply==='intense'){bo(4);for(const j of t.players.slice(0,11))apply(j,'fitness',-4,8,100);}
  if(reply==='invest'){pay(.08);bo(4);mo(2);}
 }else if(m.category==='fichajes'){
  if(reply==='welcome'){mo(4);sharp(2);}
  if(reply==='ease'){fit(3);mo(2);}
  if(reply==='demand'){sharp(3);bo(1);mo(-1);}
  if(reply==='brief'){sharp(2);bo(2);mo(1);}
  if(reply==='team'){mo(4);}
  if(reply==='scout'){pay(.04);bo(2);}
  if(reply==='youth'){mo(2);bo(2);}
  if(reply==='wait'){bonus(t,.02);bo(1);}
 }else if(m.key.startsWith('plan-')){
  if(reply==='team'){mo(4);bo(1);}
  if(reply==='budget'){bonus(t,.05);mo(-1);}
  if(reply==='academy'){pay(.07);mo(2);bo(2);}
  if(reply==='results'){bo(4);mo(-2);}
 }else if(m.key.startsWith('promise-failed-')){
  if(reply==='apologize'){mo(2);bo(-1);}
  if(reply==='merit'){bo(1);mo(-2);}
  if(reply==='support'){fit(3);mo(1);}
  if(reply==='firm'){bo(2);mo(-3);}
 }else{throw Error('No hay efecto definido para esta respuesta');}
 m.status='answered';m.read=true;m.response=c.id;m.responseLabel=c.label;
 m.outcome=[c.detail,...msgs].join(' · ');m.answeredAt=year(s);m.effects=benefits;
 return {message:m,choice:c,outcome:m.outcome,effects:benefits};
}
