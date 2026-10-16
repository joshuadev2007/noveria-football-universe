/** NOVERIA · Calendario Maestro 5.5
 * Cronología única para todas las competiciones, compartida por los nueve países.
 * No reescribe los resultados históricos. Solo administra nuevas fechas.
 */
const LABELS={
 league:'🏟️ Liga Suprema y ligas nacionales',
 cup:'🏆 Copa Nacional · fecha copera',
 international:'🌍 Copas de Arcalis · jornada continental',
 postseason:'⭐ Semifinales, finales y Recopas',
 custom:'🎟️ Torneos personalizados'
};
const icons={league:'⚽',cup:'🏆',international:'🌍',postseason:'⭐',custom:'🎟️'};
const stageNumber=p=>{
 if(!p)return 0;
 if(p.stage==='finalizada')return 99;
 if(p.stage==='locked')return 0;
 const base=p.stage==='semifinales'||p.stage==='semifinal'?0:p.stage==='final'?2:p.stage==='recopa'?4:0;
 return base+Number(p.leg||1);
};
const cupNumber=c=>!c?1:c.champion?99:Number(c.round||1);
const intlNumber=(c,id)=>!c?1:c.champion?99:c.phase==='playoff'?1:Number(c.round||1)+(id==='champions'?1:0);
const localNextRound=s=>{
 for(let r=1;r<=18;r++){
  if((s.fixtures||[]).some(f=>f.round===r&&['LSV','LPV'].includes(f.competition)&&!f.played))return r;
 }
 return 19;
};
const addEvent=(arr,year,week,day,kind,n)=>{
 // Semana 1 comienza el primer lunes de agosto, zona horaria independiente.
 const base=new Date(Date.UTC(year,7,1));
 const offset=(8-base.getUTCDay())%7; // lunes siguiente o el mismo 1 de agosto
 base.setUTCDate(1+offset+(week-1)*7+(day=== 'miércoles'?2:5));
 const date=base.toISOString().slice(0,10);
 arr.push({id:'cal-'+year+'-'+week+'-'+day,week,day,kind,ordinal:n,date,title:LABELS[kind],icon:icons[kind]});
};
export function calendarTimeline(season){
 const arr=[];let league=season===2026?7:1,cup=1,intl=1,post=1,custom=1;
 // El primer año conserva intactas las 6 jornadas originales ya disputadas.
 const startingWeek=season===2026?7:1;
 for(let week=startingWeek;week<=95;week++){
  let kind;
  if(cup<=7 && week%3===1)kind='cup';
  else if(intl<=12 && (week%2===0||cup>7))kind='international';
  else kind='custom';
  addEvent(arr,season,week,'miércoles',kind,kind==='cup'?cup++:kind==='international'?intl++:custom++);
  if(league<=18 && (week%5!==0||cup>7))kind='league';
  else if(cup<=7 && league<=18)kind='cup';
  else if(league<=18)kind='league';
  else if(post<=5)kind='postseason';
  else if(cup<=7)kind='cup';
  else if(intl<=12)kind='international';
  else kind='custom';
  addEvent(arr,season,week,'sábado',kind,kind==='league'?league++:kind==='cup'?cup++:kind==='international'?intl++:kind==='postseason'?post++:custom++);
 }
 return arr;
}
function calendarCompleted(s,e){
 if(e.kind==='league'){
  if(localNextRound(s)<=e.ordinal)return false;
  return Object.values(s.world||{}).every(w=>Number(w.round||0)>=e.ordinal);
 }
 if(e.kind==='cup'){
  if(cupNumber(s.cup)<=e.ordinal)return false;
  return Object.values(s.world||{}).every(w=>cupNumber(w.cup)>e.ordinal);
 }
 if(e.kind==='international'){
  return ['champions','horizonte'].every(id=>intlNumber(s.international?.[id],id)>e.ordinal);
 }
 if(e.kind==='postseason'){
  if(stageNumber(s.postseason)<=e.ordinal)return false;
  return Object.values(s.world||{}).every(w=>stageNumber(w.postseason)>e.ordinal);
 }
 if(e.kind==='custom')return (s.competitions||[]).every(c=>{
  if(c.champion)return true;
  const start=Number(c.calendarStart||e.ordinal);
  if(e.ordinal<start)return true;
  const roundsDone=Number(c.calendarRoundsDone||0);
  return roundsDone>=e.ordinal-start+1;
 });
 return true;
}
export function ensureCalendar(s){
 if(!s.calendar||s.calendar.season!==s.season)s.calendar={season:s.season,cursor:0,history:[]};
 const list=calendarTimeline(s.season);
 // Migración de torneos antiguos: conservar las rondas ya jugadas.
 for(const c of s.competitions||[]){
  if(!Number.isInteger(c.calendarStart)){
   c.calendarStart=1;
   const rounds=[...new Set((c.fixtures||[]).filter(f=>f.played).map(f=>f.round))];
   c.calendarRoundsDone=Number.isInteger(c.calendarRoundsDone)?c.calendarRoundsDone:rounds.length;
  }
 }
 while(s.calendar.cursor<list.length && calendarCompleted(s,list[s.calendar.cursor]))s.calendar.cursor++;
 return s.calendar;
}
export function calendarCurrent(s){
 const c=ensureCalendar(s);
 return calendarTimeline(s.season)[c.cursor]||null;
}
export function calendarUpcoming(s,count=12){
 const c=ensureCalendar(s),list=calendarTimeline(s.season);
 return list.slice(c.cursor,c.cursor+count);
}
export function calendarDate(e){
 if(!e)return 'Fin de temporada';
 const [y,m,d]=e.date.split('-').map(Number);
 const label=new Intl.DateTimeFormat('es-CR',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(Date.UTC(y,m-1,d)));
 return label.charAt(0).toUpperCase()+label.slice(1);
}
export function calendarReady(s,kind){
 const e=calendarCurrent(s);
 return !!e&&e.kind===kind;
}
export function calendarMatchReady(s,entry){
 const e=calendarCurrent(s);
 if(!e||!entry||!entry.m)return false;
 const {m,kind,owner}=entry;
 if(kind==='archive')return false;
 if(kind==='league'||kind==='foreign-league')return e.kind==='league'&&m.round===e.ordinal;
 if(kind==='cup'||kind==='foreign-cup')return e.kind==='cup'&&m.round===e.ordinal;
 if(kind==='post'||kind==='foreign-post')return e.kind==='postseason'&&stageNumber(owner)===e.ordinal&&m.group===owner.stage&&m.round===owner.leg;
 if(kind==='international'){
  const id=owner?.id;
  return e.kind==='international'&&intlNumber(owner,id)===e.ordinal&&m.phase===owner.phase&&m.round===owner.round;
 }
 if(kind==='custom')return e.kind==='custom'&&m.round===owner.round&&e.ordinal>=Number(owner.calendarStart||1)&&Number(owner.calendarRoundsDone||0)===e.ordinal-Number(owner.calendarStart||1);
 return false;
}
export function calendarRegisterCustom(s,c){
 const e=calendarCurrent(s),all=calendarTimeline(s.season);
 const from=e?all.findIndex(x=>x.id===e.id):0;
 const slot=all.slice(Math.max(0,from)).find(x=>x.kind==='custom');
 if(!slot)throw Error('No quedan fechas de torneos personalizados en este calendario.');
 c.calendarStart=slot.ordinal;c.calendarRoundsDone=0;
 return slot;
}
export function calendarCustomDue(s,c,e){
 return e?.kind==='custom'&&!c.champion&&e.ordinal>=Number(c.calendarStart||1)
 && Number(c.calendarRoundsDone||0)===e.ordinal-Number(c.calendarStart||1);
}
export function calendarRecord(s,e,matches=[]){
 const c=ensureCalendar(s);
 if(!e||c.history.some(x=>x.id===e.id))return;
 for(const m of matches||[])if(m){m.calendarDate=e.date;m.calendarEvent=e.id;}
 c.history.push({id:e.id,date:e.date,kind:e.kind,ordinal:e.ordinal,playedMatches:(matches||[]).length});
 // Solo se avanza cuando las competiciones en esa fecha realmente terminaron.
 ensureCalendar(s);
}
export function calendarSeasonComplete(s){
 ensureCalendar(s);
 return localNextRound(s)>18&&!!s.cup?.champion&&stageNumber(s.postseason)===99
 &&Object.values(s.world||{}).every(w=>w.round>=18&&!!w.cup?.champion&&stageNumber(w.postseason)===99)
 &&!!s.international?.champions?.champion&&!!s.international?.horizonte?.champion
 &&(s.competitions||[]).every(c=>!!c.champion);
}
