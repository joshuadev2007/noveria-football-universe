/**
 * Noveria Live Motion 6.0 — animación 2D ligada a los eventos ya registrados.
 * IMPORTANTE: devuelve solo coordenadas y efectos. No modifica el partido,
 * las estadísticas, el cronómetro, los goles, la partida ni Supabase.
 * La reconstrucción visual representa el TIPO de jugada, no movimientos reales.
 */
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);
const hash=value=>{let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const rnd=(key)=>hash(key)/4294967295;
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const xy=(a,b,t)=>({x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t)});
const eventTime=(ev)=>Number(ev.min)>90?120+(Number(ev.min)-90)*2/3:Number(ev.min)*4/3;
const marker=(p,type)=>type==='goal'?0:type==='save'?1:type==='shot'?2:type==='corner'?3:type==='var'?4:6;
const activity=new Set(['goal','save','shot','corner','yellow','red','injury','sub','var','tactic']);
const sideOf=e=>e?.side==='away'?'away':'home';
const indexes=(b,side,ev)=>{
 const lineup=b.preview?.lineups?.[side]||[];
 const locate=id=>lineup.findIndex(p=>String(p)===String(id));
 const scorer=ev?.p1!=null?locate(ev.p1):-1;
 const assister=ev?.p2!=null?locate(ev.p2):-1;
 const finish=scorer>=0?scorer:8+(hash(b.id+side+(ev?.min||0))%3);
 const mid=assister>=0&&assister!==finish?assister:5+(hash(b.id+side+'mid'+(ev?.min||0))%3);
 const first=mid===6?5:6;
 return {first,mid,finish};
};
const templatePositions={
 '4-3-3':[[65,270],[230,88],[235,200],[230,345],[235,452],[393,133],[402,270],[393,407],[560,130],[570,270],[560,409]],
 '4-4-2':[[65,270],[230,88],[235,200],[230,345],[235,452],[410,92],[412,211],[412,337],[410,451],[605,205],[605,340]],
 '4-2-3-1':[[65,270],[230,88],[235,200],[230,345],[235,452],[355,198],[355,342],[528,110],[528,270],[528,429],[660,270]],
 '3-5-2':[[65,270],[225,128],[230,270],[225,412],[410,65],[395,164],[408,270],[395,377],[410,472],[608,202],[608,338]],
 '5-3-2':[[65,270],[230,65],[235,164],[235,270],[235,377],[230,474],[412,130],[412,270],[412,408],[606,204],[606,336]]
};
const formationCache=new WeakMap();
function formation(side,ball,seconds,tag,b){
 const home=side==='home',formationName=b.preview?.coachAtKickoff?.[side+'Formation']||'4-3-3';
 const base=templatePositions[formationName]||templatePositions['4-3-3'];
 let data=formationCache.get(b);
 if(!data){data={};formationCache.set(b,data);}
 if(!data[side]||data[side].formation!==formationName)data[side]={formation:formationName,wiggle:base.map((_,i)=>hash(tag+side+i)%23)};
 const wiggle=data[side].wiggle;
 return Array.from({length:11},(_,i)=>{
  const keeper=i===0,role=base[i][0]<280?1:base[i][0]<520?2:3;
  let x=home?base[i][0]:960-base[i][0],y=base[i][1];
  const minute=seconds>120?90+(seconds-120)*1.5:seconds*.75;
  let tactic=b.startTactics?.[side]||'Equilibrado';
  for(const d of b.decisions||[])if(d.kind==='tactic'&&d.side===side&&Number(d.minute)<=minute)tactic=d.tactic;
  const shift={'Presión alta':48,'A todo ataque':61,'Contraataque':6,'Posesión':18,'Equilibrado':0,'Bloque bajo':-52,'Perder tiempo':-32}[tactic]||0;
  if(!keeper)x+=(home?1:-1)*shift*(role===3?1:role===2?.86:.63);
  // El bloque acompaña la pelota y los defensores cierran líneas de pase.
  const direction=home?1:-1;
  const advance=(ball.x-480)*.20;
  x+=keeper?direction*(ball.x>(home?480:0)&&ball.x<(home?960:480)?7:0):advance*(role===3?1.2:role===2?1.0:.66);
  const rowShift=clamp((ball.y-270)*.1,-25,25);
  y+=keeper?clamp((ball.y-270)*.13,-38,38):rowShift*(role===1?.55:1);
  if(!keeper){const step=seconds*2.1+wiggle[i];
   x+=Math.sin(step*.63+i)*3.5;y+=Math.cos(step*.47+i*1.31)*3.6;}
  return {x:clamp(x,keeper?48:78,keeper?912:882),y:clamp(y,keeper?201:49,keeper?339:491)};
 });
}
const eventCache=new WeakMap();
function cachedEvents(b){
 const preview=b.preview,source=preview?.events||[];
 const old=eventCache.get(preview);
 if(old&&old.source===source&&old.length===source.length)return old.entries;
 const entries=source.filter(e=>activity.has(e.type)&&Number.isFinite(Number(e.min))).map((e,i)=>({e,i,time:eventTime(e)})).sort((a,b)=>a.time-b.time||a.i-b.i);
 eventCache.set(preview,{source,length:source.length,entries});
 return entries;
}
function chooseEvent(b,t){
 const entries=cachedEvents(b);
 let chosen=null,dist=Infinity;
 for(const entry of entries){
  if(entry.time<t-1)continue;
  if(entry.time>t+4.8)break;
  if(t<entry.time-4.8||t>entry.time+1)continue;
  const delta=Math.abs(t-entry.time);
  if(delta<dist){chosen=entry;dist=delta;}
 }
 return chosen;
}

function possessionNodes(b,index){
 const key=b.id+'|sequence-'+index,home=rnd(key+'pos')>.48,side=home?'home':'away',dir=home?1:-1;
 const width=home?1:-1,base=480+(rnd(key+'start')-.5)*155;
 const lane=clamp(110+rnd(key+'lane')*330,105,435);
 const p=[{x:clamp(base,220,740),y:lane},{x:clamp(base+dir*(72+rnd(key+'advance')*38),190,780),y:clamp(lane+(rnd(key+'y2')-.5)*108,72,468)},
  {x:clamp(base+dir*(145+rnd(key+'more')*52),162,820),y:clamp(lane+(rnd(key+'y3')-.5)*118,70,470)},
  {x:clamp(base+dir*(180+rnd(key+'finish')*66),105,855),y:clamp(lane+(rnd(key+'y4')-.5)*125,70,470)}];
 const actors=[5+hash(key+'a')%3,8+hash(key+'b')%3,5+hash(key+'c')%3,8+hash(key+'d')%3];
 return {side,p,actors,key};
}
function possessionMotion(b,seconds){
 const span=6.4,index=Math.floor(seconds/span),segment=possessionNodes(b,index);
 const phase=(seconds-index*span)/span;
 const section=Math.min(2,Math.floor(phase*3)),progress=(phase*3)-section;
 let ball=xy(segment.p[section],segment.p[section+1],ease(progress));
 // Cambio de posesión continuo: se aproxima desde donde terminó la jugada anterior.
 if(index>0&&phase<.12){
  const prev=possessionNodes(b,index-1);
  ball=xy(prev.p[3],ball,ease(phase/.12));
 }
 const actor=segment.actors[section],nextActor=segment.actors[section+1];
 return {side:segment.side,ball:{...ball,arc:Math.sin(Math.PI*progress)*((progress>.04&&progress<.96)?4.5:0)},
  label:progress<.18?'Pase entre líneas':'Ataque en construcción',
  actor,receiver:nextActor,receiverPos:segment.p[section+1],phase:'control',moment:null};
}

function eventMotion(b,t,selected){
 const {e,time}=selected,side=sideOf(e),home=side==='home',direction=home?1:-1;
 const number=e.min||0,key=b.id+'|'+e.type+'|'+number+'|'+selected.i;
 const lane=135+(hash(key+'lane')%260);
 const small=(rnd(key+'cross')-.5)*80;
 const attacking=(x,y)=>({x:home?x:960-x,y:clamp(y,54,486)});
 const a=attacking(318,lane);
 const c=attacking(470,clamp(lane+small,110,425));
 const d=attacking(648,clamp(lane*.55+150,125,405));
 const shooter=attacking(791,clamp(235+(rnd(key+'shoot')-.5)*100,180,345));
 const goalY=clamp(270+(rnd(key+'target')-.5)*74,232,309);
 const keepY=clamp(goalY+(rnd(key+'save')-.5)*20,221,318);
 let target,kind=e.type;
 switch(kind){
 case 'goal':target={x:home?943:17,y:goalY};break;
 case 'save':target={x:home?888:72,y:keepY};break;
 case 'shot':target={x:home?940:20,y:rnd(key+'miss')>.5?166:382};break;
 case 'corner':target={x:home?921:39,y:rnd(key+'corner')>.5?45:495};break;
 case 'red':case 'yellow':case 'injury':case 'sub':case 'tactic':case 'var':
   target=d;break;
 default:target=d;
 }
 const start=time-4.7;
 const progress=clamp((t-start)/4.7,0,1);
 const points=[a,c,d,shooter,target];
 const knots=[0,.26,.53,.77,1];
 let at=0;for(let j=0;j<knots.length-1;j++)if(progress>=knots[j])at=j;
 at=Math.min(at,3);
 const amount=ease((progress-knots[at])/(knots[at+1]-knots[at]));
 let point=xy(points[at],points[at+1],amount),arc=0;
 const flight=at===3&&(kind==='goal'||kind==='shot'||kind==='save'||kind==='corner');
 if(flight)arc=Math.sin(Math.PI*amount)*(kind==='corner'?9:12);
 const after=Math.max(0,t-time);
 if(kind==='save'&&after>0){point.x=lerp(target.x,target.x-direction*42,Math.min(1,after*1.8));point.y=lerp(target.y,keepY+23,Math.min(1,after*1.8))}
 const players=indexes(b,side,e);
 const actor=progress<.26?players.first:progress<.53?players.mid:players.finish;
 const label=kind==='goal'?(progress>=.77?'¡Remate y GOL!':'Ataque hacia el arco'):
 kind==='save'?(progress>=.77?'¡Atajada del portero!':'Remate al arco'):
 kind==='shot'?(progress>=.77?'¡Remate desviado!':'Ocasión de peligro'):
 kind==='corner'?'Balón hacia el banderín':
 kind==='yellow'?'Falta y amarilla':kind==='red'?'Expulsión':kind==='injury'?'Juego detenido':kind==='sub'?'Cambio de futbolista':kind==='tactic'?'Indicaciones tácticas':'Revisión de jugada';
 return {side,ball:{...point,arc},phase:kind,label,actor,event:e,actors:players,positions:points,
  eventTime:time,progress,flight,goalFlash:kind==='goal'&&t>=time-.12&&t<=time+.75,
  keeperDive:(kind==='goal'||kind==='save'||kind==='shot')&&progress>.78,
  after,trail:flight?shooter:null};
}
/** Fotograma puro, reconstruible al pausar, reanudar, cambiar velocidad o recargar. */
export function motionFrame(b){
 const t=clamp(Number(b?.elapsed)||0,0,Number(b?.duration)||120);
 if(!b?.preview)return null;
 const selected=b.legacy?null:chooseEvent(b,t);
 const scene=selected?eventMotion(b,t,selected):possessionMotion(b,t);
 const {side,ball}=scene;
 const players={
  home:formation('home',ball,t,b.id,b),
  away:formation('away',ball,t,b.id,b)
 };
 if(selected){
  const {actors,positions,progress}=scene;
  const attacking=players[side];
  const back=side==='home'?'away':'home';
  const defending=players[back];
  // Receptores se ofrecen, pasadores apoyan, finalizador pisa el área.
  const snap=(i,target)=>{if(attacking[i])attacking[i]={...target};};
  const carry={x:ball.x+(side==='home'?-12:12),y:ball.y+6};
  // El portador realmente acompaña el balón; sus compañeros se desmarcan.
  snap(actors.first,progress<.26?carry:positions[0]);
  snap(actors.mid,progress>=.26&&progress<.53?carry:positions[1]);
  snap(actors.finish,progress>=.53&&progress<.77?carry:progress>.77?positions[3]:positions[2]);

  // Marcador más cercano presiona al portador, resto mantiene el bloque.
  const press=1+(hash(b.id+String(scene.event.min))%4);
  const p=defending[press];
  if(p&&progress<.79){p.x=lerp(p.x,ball.x,0.46);p.y=lerp(p.y,ball.y,0.46)}
  // El arquero defensor reacciona al remate, sin abandonar el área.
  if(scene.keeperDive){
   const gk=defending[0];
   gk.y=clamp(lerp(gk.y,scene.positions[4].y,.7),218,322);
   gk.x=back==='home'?68:892;
  }
 }else{
  // Conducción visible: una bolita real acompaña la pelota.
  const j=scene.actor;
  const p=players[side][j];p.x=clamp(ball.x-(side==='home'?11:-11),75,885);p.y=ball.y+6;
  const target=players[side][scene.receiver];if(target&&scene.receiver!==j){target.x=lerp(target.x,scene.receiverPos.x,.68);target.y=lerp(target.y,scene.receiverPos.y,.68);}
  const back=side==='home'?'away':'home';
  const n=1+(hash(b.id+String(Math.floor(t/6.4)))%4);
  players[back][n].x=lerp(players[back][n].x,ball.x,.38);
  players[back][n].y=lerp(players[back][n].y,ball.y,.38);
 }
 return {...scene,players,elapsed:t,ball:{x:clamp(ball.x,9,951),y:clamp(ball.y,30,510),arc:ball.arc||0}};
}
