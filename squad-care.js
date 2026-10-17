/** Noveria 6.3 · Enfermería y observatorio de plantilla.
 * Compatible con guardados anteriores. No inventa historial de partidos.
 * El equipo médico trata únicamente lesiones verificadas por el motor.
 */
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const id=v=>String(v??'');
const asNum=v=>Number.isFinite(Number(v))?Number(v):0;
const basePlayer=p=>({apps:asNum(p.apps),goals:asNum(p.goals),assists:asNum(p.assists),yellow:asNum(p.yellows),
 red:asNum(p.reds),injuries:asNum(p.injuries),ovr:asNum(p.ovr),pot:asNum(p.pot),
 fitness:Number.isFinite(Number(p.fitness))?asNum(p.fitness):90,
 sharpness:Number.isFinite(Number(p.sharpness))?asNum(p.sharpness):65,
 salary:asNum(p.salary),contractYears:asNum(p.contractYears)||1});
export const MEDICAL_CARE_COST=level=>+(Math.max(.045,.19-.018*Math.max(1,asNum(level)))).toFixed(3);
export function registerInjury(s,teamName,player,match,days){
 if(!player||!match?.id)return null;
 const n=Math.max(1,Math.trunc(asNum(days)));
 player.medicalCase={key:id(match.id)+':'+id(player.id),type:'injury',diagnosis:n>=4?'Lesión muscular · recuperación prolongada':'Molestia física · recuperación supervisada',
 source:match.id,createdAt:(s.edition||'Apertura')+' '+s.season,original:n,treated:false,treatedOn:null};
 return player.medicalCase;
}
export function activeMedicalCases(s,clubName){
 const team=s.teams?.[clubName];if(!team)return [];
 return (team.players||[]).filter(p=>asNum(p.outGames)>0).map(p=>{
 const medical=p.medicalCase?.type==='injury'?p.medicalCase:null;
 const conflict=!!medical&&asNum(p.suspensionGames)>0;
 return {id:id(p.id),player:p,availableForTreatment:!!medical&&!medical.treated&&!conflict,medical,
  isInjury:!!medical,canRecover:!!medical&&!conflict,conflict,remaining:Math.max(0,Math.trunc(asNum(p.outGames))),
  status:conflict?'Lesión y sanción':medical?'Lesión diagnosticada':'Baja no diagnosticada (puede ser sanción)'};
 }).sort((a,b)=>Number(b.isInjury)-Number(a.isInjury)||b.remaining-a.remaining);
}
export function treatInjury(s,clubName,playerId){
 const t=s.teams?.[clubName];if(!t)throw Error('El club seleccionado no existe');
 const p=(t.players||[]).find(x=>id(x.id)===id(playerId));
 if(!p)throw Error('No se encontró ese jugador en el plantel');
 const record=p.medicalCase;
 if(asNum(p.outGames)<=0)throw Error('El jugador no tiene una lesión activa que tratar');
 if(!record||record.type!=='injury')throw Error('No hay diagnóstico de lesión. Las sanciones y las bajas antiguas no se pueden curar con dinero');
 if(asNum(p.suspensionGames)>0)throw Error('El jugador también está sancionado. El tratamiento no puede reducir su sanción');
 if(record.treated)throw Error('Esta lesión ya recibió tratamiento médico; continuá el descanso entre fechas');
 const level=Math.max(1,Math.floor(asNum(t.facility?.medical)||1)),cost=MEDICAL_CARE_COST(level);
 if(asNum(t.budget)<cost)throw Error('Fondos insuficientes: el tratamiento cuesta '+cost.toFixed(3)+' M VLR');
 const games=Math.min(asNum(p.outGames),level>=4?2:1),before=asNum(p.outGames);
 p.outGames=Math.max(0,before-games);
 p.fitness=clamp((Number.isFinite(Number(p.fitness))?asNum(p.fitness):85)+Math.min(14,6+level),8,100);
 record.treated=true;record.treatedOn=(s.edition||'Apertura')+' '+s.season;
 record.recoveredGames=games;
 t.budget=+(asNum(t.budget)-cost).toFixed(3);
 t.medicalHistory??=[];t.medicalHistory.unshift({player:id(p.id),name:p.name,cost,source:record.source,edition:record.treatedOn,games});
 if(t.medicalHistory.length>45)t.medicalHistory.length=45;
 return {player:p.name,cost,games,remaining:p.outGames,fitness:p.fitness};
}
function minutesPlayed(match,side,pid){
 const starting=(match.lineups?.[side]||[]).some(x=>id(x)===pid);
 const subs=(match.events||[]).filter(e=>e.type==='sub'&&e.side===side);
 const departure=subs.find(e=>id(e.p1)===pid),arrival=subs.find(e=>id(e.p2)===pid);
 const end=Number.isFinite(Number(departure?.min))?clamp(departure.min,0,90):90;
 const from=Number.isFinite(Number(arrival?.min))?clamp(arrival.min,0,90):0;
 if(starting)return Math.max(0,end);
 if(arrival)return Math.max(0,90-from);
 return 0;
}
export function squadAnalysis(s,clubName,matches=[]){
 const t=s.teams?.[clubName];if(!t)throw Error('Club desconocido');
 const fixtures=matches.filter(m=>m?.played&&(m.home===clubName||m.away===clubName));
 const uniq=new Map();
 for(const m of fixtures){const k=id(m.id),old=uniq.get(k);
  if(!old||(m.lineups?.home?.length||0)+(m.lineups?.away?.length||0)+(m.events?.length||0)>
           (old.lineups?.home?.length||0)+(old.lineups?.away?.length||0)+(old.events?.length||0))uniq.set(k,m);
 }
 const stats=new Map((t.players||[]).map(p=>[id(p.id),{minutes:0,appearances:0,starts:0,gameGoals:0,gameAssists:0,
  gamesByCompetition:{},lastMatches:[],cards:0,cleanSheets:0}]));
 for(const m of uniq.values()){
  const side=m.home===clubName?'home':'away',starters=(m.lineups?.[side]||[]).map(id),bench=(m.events||[]).filter(e=>e.type==='sub'&&e.side===side).map(e=>id(e.p2));
  const participants=new Set([...starters,...bench]);
  for(const pid of participants){
   const st=stats.get(pid);if(!st)continue;const minutes=minutesPlayed(m,side,pid);
   if(minutes<=0)continue;
   st.minutes+=minutes;st.appearances++;st.starts+=Number(starters.includes(pid));
   const comp=id(m.competition||'Otro');st.gamesByCompetition[comp]=(st.gamesByCompetition[comp]||0)+1;
   st.lastMatches.push({date:id(m.calendarDate||m.round||''),rival:m[side==='home'?'away':'home'],minutes,competition:comp,fixture:m.id});
   if((side==='home'?m.scoreA:m.scoreH)===0&&t.players.find(p=>id(p.id)===pid)?.pos==='POR')st.cleanSheets++;
  }
  for(const e of m.events||[]){
   if(e.side!==side)continue;
   if(e.type==='goal'){
    const scorer=stats.get(id(e.p1)),assistant=stats.get(id(e.p2));
    if(scorer)scorer.gameGoals++;
    if(assistant)assistant.gameAssists++;
   }
   if(e.type==='red'||e.type==='yellow'){const player=stats.get(id(e.p1));if(player)player.cards++;}
  }
 }
 const rows=(t.players||[]).map(p=>{
  const z=stats.get(id(p.id)),v=basePlayer(p),games=v.apps,mins=z.minutes;
  const g=v.goals,a=v.assists,contribution=g+a;
  const form=Number.isFinite(Number(p.development?.form))?Number(p.development.form):Number.isFinite(Number(p.form))?Number(p.form):6.5;
  const wage=v.salary,term=v.contractYears,age=asNum(p.age);
  const goalRate=games?+(contribution/games).toFixed(2):0;
  const gPer90=mins?+(z.gameGoals*90/mins).toFixed(2):null;
  const aPer90=mins?+(z.gameAssists*90/mins).toFixed(2):null;
  const availability=asNum(p.outGames)>0?'Baja':v.fitness<55?'Riesgo alto':v.fitness<75?'Necesita descanso':'Disponible';
  const upside=v.pot-v.ovr;
  let label,reason,weight;
  if(p.loanParent){label='Cedido';reason='No pertenece al club: la renovación la gestiona su equipo de origen.';weight=0;}
  else if(term<=1&&games>=7&&(form>=6.7||v.ovr>=72)){label='Prioridad renovar';reason='Contrato corto, '+games+' PJ y forma '+form.toFixed(1)+'.';weight=5;}
  else if(term<=1&&age>=32&&games<6){label='Revisar continuidad';reason='Contrato corto, edad '+age+' y pocos partidos registrados.';weight=3;}
  else if(term<=1){label='Evaluar renovación';reason='Queda un año o menos. Compará salario, minutos y potencial antes de firmar.';weight=4;}
  else if(age<=23&&upside>=10){label='Desarrollar';reason='Potencial '+v.pot+' (+'+upside+'). Conviene darle minutos y revisar evolución.';weight=4;}
  else if(age>=33&&games<5){label='Evaluar rol';reason='Veterano con pocos partidos registrados; valorar salario y alternativa.';weight=2;}
  else{label='Seguir rendimiento';reason='Contrato de '+term+' años. Revisar forma y aportación en los próximos partidos.';weight=1;}
  return {id:id(p.id),name:p.name,position:p.pos,age,form,number:p.number,pot:v.pot,ovr:v.ovr,upside,
   salary:wage,contractYears:term,apps:games,goals:g,assists:a,goalRate,minuteCount:mins,
   matchApps:z.appearances,starts:z.starts,gameGoals:z.gameGoals,gameAssists:z.gameAssists,
   gPer90,aPer90,cleanSheets:z.cleanSheets,injuries:v.injuries,yellows:v.yellow,reds:v.red,
   fitness:v.fitness,sharpness:v.sharpness,availability,roundsOut:asNum(p.outGames),contribution,
   competitions:z.gamesByCompetition,lastMatches:z.lastMatches.slice(-5),label,reason,weight,loan:!!p.loanParent,
   raw:p};
 }).sort((a,b)=>b.weight-a.weight||b.ovr-a.ovr||a.name.localeCompare(b.name,'es'));
 return {club:clubName,rows,gameCount:uniq.size,goals:rows.reduce((n,p)=>n+p.goals,0),
   assists:rows.reduce((n,p)=>n+p.assists,0),
   payroll:rows.reduce((n,p)=>n+p.salary,0),
   expiring:rows.filter(r=>r.contractYears<=1&&!r.loan).length,
   injured:rows.filter(r=>r.roundsOut>0).length};
}
