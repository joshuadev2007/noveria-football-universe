/**
 * NOVERIA 6.0 — Realismo de carrera, compatible con partidas existentes.
 * Cambia únicamente encuentros nuevos. Nunca recalcula marcadores archivados.
 */
import {matchLineup} from './lineup.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const key=(s)=>String(s.season)+'-'+(s.edition||'Apertura');
const hash=value=>{let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const round=v=>Math.round(v*10)/10;
export const REALISM_STYLES={
 'Equilibrado':{attack:0,defence:0,work:1,notes:'Orden y control del ritmo'},
 'Posesión':{attack:.06,defence:.04,work:1.12,notes:'Más control y creación'},
 'Presión alta':{attack:.12,defence:-.10,work:1.36,notes:'Recupera arriba; exige físico'},
 'Contraataque':{attack:.09,defence:.05,work:.98,notes:'Explota espacios'},
 'A todo ataque':{attack:.20,defence:-.22,work:1.46,notes:'Busca el gol con riesgo atrás'},
 'Bloque bajo':{attack:-.11,defence:.19,work:.81,notes:'Defiende su área'},
 'Perder tiempo':{attack:-.17,defence:.09,work:.77,notes:'Cierra ritmo al final'}
};
const STYLE_COUNTERS={
 'Equilibrado':{'A todo ataque':.03,'Perder tiempo':.03},
 'Posesión':{'Bloque bajo':-.10,'Presión alta':-.06,'Contraataque':.05},
 'Presión alta':{'Posesión':.10,'Contraataque':-.10,'Perder tiempo':.05},
 'Contraataque':{'Presión alta':.13,'A todo ataque':.11,'Bloque bajo':-.09},
 'A todo ataque':{'Bloque bajo':-.06,'Contraataque':-.12,'Perder tiempo':.05},
 'Bloque bajo':{'A todo ataque':.08,'Contraataque':-.04,'Posesión':.05},
 'Perder tiempo':{'A todo ataque':-.12,'Presión alta':-.11,'Posesión':.05}
};
const roleNames={POR:'Portero',LD:'Lateral derecho',LI:'Lateral izquierdo',DFC:'Central',MCD:'Pivote',MC:'Mediocampista',MCO:'Mediapunta',MP:'Mediapunta',EI:'Extremo',ED:'Extremo',MI:'Extremo',MD:'Extremo',DC:'Delantero'};
export function ensureCareerPlayer(p){
 if(!Number.isFinite(Number(p.fitness)))p.fitness=90;
 p.fitness=clamp(p.fitness,8,100);
 if(!Number.isFinite(Number(p.sharpness)))p.sharpness=65;
 p.sharpness=clamp(p.sharpness,15,100);
 if(!Number.isFinite(Number(p.disciplinePoints)))p.disciplinePoints=0;
 p.disciplinePoints=clamp(p.disciplinePoints,0,5);
 return p;
}
export function fitnessLabel(p){const f=ensureCareerPlayer(p).fitness;return f>=85?'Listo':f>=68?'Apto':f>=52?'Cansado':'Fatigado';}
export function careerTeamFitness(t){const starters=matchLineup(t).starters;return starters.length?round(starters.reduce((a,p)=>a+ensureCareerPlayer(p).fitness,0)/starters.length):0;}
export function careerChemistry(t){
 const selected=matchLineup(t),total=selected.starters.length||1;
 const chemistry=selected.starters.reduce((sum,p,i)=>{
  const f=ensureCareerPlayer(p),available=Number(p.outGames||0)<=0;
  return sum+(available?1:0)*(.65+.35*f.sharpness/100);
 },0)/total;
 const captain=selected.starters.find(p=>String(p.id)===String(selected.captain));
 const lead=captain?Math.max(0,(Number(captain.age)||23)-22)*.13:0;
 return clamp(Math.round((chemistry*82+lead+clamp(t.morale,30,95)*.15)),35,100);
}
export function matchupReport(home,away){
 const h=REALISM_STYLES[home.tactic]||REALISM_STYLES.Equilibrado;
 const a=REALISM_STYLES[away.tactic]||REALISM_STYLES.Equilibrado;
 const counterH=STYLE_COUNTERS[home.tactic]?.[away.tactic]||0;
 const counterA=STYLE_COUNTERS[away.tactic]?.[home.tactic]||0;
 return {homeAttack:h.attack+counterH,awayAttack:a.attack+counterA,
  homeDefence:h.defence,awayDefence:a.defence,homeWork:h.work,awayWork:a.work,
  homeDescription:h.notes,awayDescription:a.notes,counterHome:counterH,counterAway:counterA};
}
export function careerMatchPreview(s,m){
 const home=s.teams[m.home],away=s.teams[m.away];if(!home||!away)return null;
 const fitnessH=careerTeamFitness(home),fitnessA=careerTeamFitness(away);
 const chemH=careerChemistry(home),chemA=careerChemistry(away),battle=matchupReport(home,away);
 const unavailable=team=>team.players.filter(p=>Number(p.outGames||0)>0).map(p=>p.name);
 const expected=(h)=>round(clamp(50+(h?fitnessH-fitnessA:fitnessA-fitnessH)*.7+(h?chemH-chemA:chemA-chemH)*.25,20,80));
 return {fitnessH,fitnessA,chemH,chemA,style:battle,homeUnavailable:unavailable(home),awayUnavailable:unavailable(away),
  homeAdvantage:expected(true),awayAdvantage:expected(false), homeRisk:fitnessH<67,awayRisk:fitnessA<67};
}
export function preCareerMatch(s,m,home,away,selectedH,selectedA){
 const starters=[selectedH.starters,selectedA.starters];for(const list of starters)for(const p of list)ensureCareerPlayer(p);
 const prep=careerMatchPreview(s,m),h=matchupReport(home,away);
 const fH=prep.fitnessH,fA=prep.fitnessA;
 const penaltyH=(100-fH)*.055+(100-prep.chemH)*.025;
 const penaltyA=(100-fA)*.055+(100-prep.chemA)*.025;
 const chance={home:h.homeAttack-h.awayDefence,away:h.awayAttack-h.homeDefence};
 const bonusH=clamp(chance.home,-.20,.25),bonusA=clamp(chance.away,-.20,.25);
 const venue=clamp(Number(home.supporters?.mood||60)/350,0,.27);
 return {fitnessH:fH,fitnessA:fA,chemH:prep.chemH,chemA:prep.chemA,
  homePower:-penaltyH+venue,awayPower:-penaltyA,
  homeGoal:bonusH,awayGoal:bonusA,
  homeWork:h.homeWork,awayWork:h.awayWork,styleH:home.tactic,styleA:away.tactic,
  tip:prep.homeRisk||prep.awayRisk?'⚠ Hay un equipo fatigado. Rotar el once puede marcar la diferencia.':'Los dos equipos llegan físicamente aptos.'};
}
export function afterCareerMatch(s,m,pregame){
 if(!m?.played||m.careerProcessed)return [];
 const changes=[],times=Object.fromEntries(['home','away'].map(side=>[side,new Map()]));
 for(const side of ['home','away']){
  const starters=new Set((m.lineups?.[side]||[]).map(String));
  for(const id of starters)times[side].set(id,90);
  for(const e of m.events||[]){
   if(e.type!=='sub'||e.side!==side)continue;
   const min=clamp(Number(e.min||65),1,90);
   const out=String(e.p1),inside=String(e.p2);
   if(times[side].has(out))times[side].set(out,Math.min(times[side].get(out),min));
   if(inside&&inside!=='null')times[side].set(inside,Math.max(0,90-min));
  }
 }
 const homeGoals=m.scoreH,awayGoals=m.scoreA;
 for(const side of ['home','away']){
  const team=s.teams[m[side]],opponent=s.teams[m[side==='home'?'away':'home']];
  if(!team)continue;
  const style=REALISM_STYLES[team.tactic]||REALISM_STYLES.Equilibrado;
  const won=side==='home'?homeGoals>awayGoals:awayGoals>homeGoals;
  const lost=side==='home'?homeGoals<awayGoals:awayGoals<homeGoals;
  const pool=team.players,playedIds=times[side],fatigue=[];
  for(const p of pool){
   ensureCareerPlayer(p);
   const minutes=playedIds.get(String(p.id))||0;
   if(minutes){
    const conditionLoss=Math.ceil((minutes/90)*(13*style.work)+(p.age>=32?2:0)+(m.extraTime?4:0));
    const prior=p.fitness;
    p.fitness=clamp(p.fitness-conditionLoss,8,100);
    const swing=(won?4:lost?-3:1)+(p.form>=7.5?2:0);
    p.sharpness=clamp(p.sharpness+Math.max(-4,Math.round(swing*minutes/90)),15,100);
    if(prior-p.fitness>0)fatigue.push({name:p.name,loss:prior-p.fitness});
   }else{
    p.sharpness=clamp(p.sharpness-1,15,100);
   }
  }
  // Apuestas disciplinarias acumuladas: suspensión cada cinco amarillas.
  for(const e of (m.events||[]).filter(e=>e.side===side&&(e.type==='yellow'||e.type==='red'))){
   const p=pool.find(p=>String(p.id)===String(e.p1));if(!p)continue;ensureCareerPlayer(p);
   if(e.type==='yellow'){p.disciplinePoints++;if(p.disciplinePoints>=5){p.disciplinePoints=0;p.outGames=Math.max(p.outGames||0,2);changes.push({club:team.name,type:'suspension',name:p.name});}}
   if(e.type==='red'){p.outGames=Math.max(p.outGames||0,2);p.disciplinePoints=0;changes.push({club:team.name,type:'red',name:p.name});}
  }
  const c=team.careerStats??={played:0,wins:0,draws:0,losses:0,cleanSheets:0,goals:0,against:0,streak:0,attendance:0};
  c.played++;if(won)c.wins++;else if(lost)c.losses++;else c.draws++;
  const scored=side==='home'?homeGoals:awayGoals,conceded=side==='home'?awayGoals:homeGoals;
  c.goals+=scored;c.against+=conceded;if(!conceded)c.cleanSheets++;
  c.streak=won?Math.max(1,c.streak+1):lost?Math.min(-1,c.streak-1):0;
  c.attendance=team.supporters?.attendance||c.attendance;
  if(c.streak>=4&&c.streak%4===0){team.morale=clamp(team.morale+2,10,99);changes.push({club:team.name,type:'streak',value:c.streak});}
  if(c.streak<=-4&&Math.abs(c.streak)%4===0){team.board=clamp(team.board-3,10,99);changes.push({club:team.name,type:'bad-run',value:c.streak});}
  const front=team.careerFocus??={};
  const playing=matchLineup(team);
  const captain=team.players.find(p=>String(p.id)===String(playing.captain));
  if(captain&&playing.starters.some(p=>p.id===captain.id)&&won)team.morale=clamp(team.morale+1,10,99);
  if(fatigue.length)changes.push({club:team.name,type:'fitness',average:round(fatigue.reduce((sum,p)=>sum+p.loss,0)/fatigue.length)});
 }
 m.careerProcessed=true;
 m.careerSnapshot={home:pregame?.fitnessH??null,away:pregame?.fitnessA??null,chemistryHome:pregame?.chemH??null,chemistryAway:pregame?.chemA??null,
  styleH:pregame?.styleH||null,styleA:pregame?.styleA||null,venueBonus:pregame?.homePower||0};
 return changes;
}
export function careerRecoverAfterDate(s,calendarEvent,playedMatches=[]){
 if(!calendarEvent?.id)return false;
 s.careerDates??={ids:[]};if(s.careerDates.ids.includes(calendarEvent.id))return false;
 const active=new Set(playedMatches.flatMap(m=>[m.home,m.away]));
 const medical=t=>Math.max(1,Number(t.facility?.medical||1));
 for(const team of Object.values(s.teams||{})){
  const used=active.has(team.name);const recovered=used?4:11;
  for(const p of team.players||[]){ensureCareerPlayer(p);p.fitness=clamp(p.fitness+recovered+medical(team)*1.3,8,100);}
 }
 s.careerDates.ids.push(calendarEvent.id);if(s.careerDates.ids.length>130)s.careerDates.ids.shift();
 return true;
}
const SCORE_MAP={
 win:{label:'Ganar partidos',weight:3},youth:{label:'Desarrollar canteranos',weight:2},
 form:{label:'Racha positiva',weight:2},finance:{label:'Cuidar el presupuesto',weight:2},
 clean:{label:'Porterías a cero',weight:2},goals:{label:'Potencia ofensiva',weight:2},
 attendance:{label:'Apoyo de la hinchada',weight:1},morale:{label:'Vestuario motivado',weight:1},
 table:{label:'Puntos de liga',weight:3},rotation:{label:'Rotaciones inteligentes',weight:1}
};
export const CAREER_OBJECTIVE_TYPES=Object.keys(SCORE_MAP);
export function careerObjectives(s,name){
 const t=s.teams[name];if(!t)return [];
 const stat=t.careerStats||{};
 const players=t.players||[];
 const academy=(t.youth||[]).length;
 const pts=Number(stat.wins||0)*3+Number(stat.draws||0);
 const fitness=careerTeamFitness(t);
 const metrics={
 win:Number(stat.wins||0),youth:players.filter(p=>p.academyGraduate).length+Math.floor(academy/4),
 form:Math.max(0,Number(stat.streak||0)),finance:Math.max(0,Math.round(Number(t.budget||0))),
 clean:Number(stat.cleanSheets||0),goals:Number(stat.goals||0),
 attendance:Math.floor(Number(t.supporters?.attendance||0)/25000),morale:Number(t.morale||0),
 table:pts,rotation:Math.round(fitness)
 };
 const targets={win:5,youth:3,form:3,finance:5,clean:4,goals:14,attendance:3,morale:80,table:18,rotation:80};
 return CAREER_OBJECTIVE_TYPES.map(type=>({id:type,...SCORE_MAP[type],current:metrics[type],target:targets[type],done:metrics[type]>=targets[type],progress:clamp(Math.round(metrics[type]/targets[type]*100),0,100)}));
}
export function careerGrade(s,name){
 const obj=careerObjectives(s,name);const score=obj.reduce((sum,o)=>sum+o.weight*o.progress,0)/Math.max(1,obj.reduce((sum,o)=>sum+o.weight,0));
 return {score:Math.round(score),label:score>=82?'EXCELENTE':score>=62?'EN BUEN CAMINO':score>=40?'EN DESARROLLO':'TRABAJO PENDIENTE',objectives:obj};
}
export function careerTeamReport(s,name){
 const t=s.teams[name];if(!t)return null;
 const starters=matchLineup(t).starters;const fit=careerTeamFitness(t),chem=careerChemistry(t);
 const tired=starters.filter(p=>ensureCareerPlayer(p).fitness<65);
 const lowForm=starters.filter(p=>Number(p.form||6.5)<5.8);
 const suspended=t.players.filter(p=>Number(p.outGames||0)>0);
 const options=(t.players||[]).filter(p=>!starters.some(x=>x.id===p.id)&&Number(p.outGames||0)<=0).sort((a,b)=>ensureCareerPlayer(b).fitness-ensureCareerPlayer(a).fitness||b.ovr-a.ovr).slice(0,4);
 const advice=[...(tired.length?['Rotá a '+tired.map(p=>p.name).slice(0,2).join(' y ')+'; llegan muy fatigados.']:[]),
 ...(lowForm.length?['Revisá la forma reciente de '+lowForm.length+' titular(es).']:[]),
 ...(suspended.length?['Hay '+suspended.length+' bajas por suspensión o lesión.']:[]),
 ...(chem<76?['Cuidá la cohesión y respetá posiciones naturales.']:[]),
 ...(t.board<45?['La directiva exige mejorar resultados pronto.']:[]),
 ...(t.morale<48?['El ánimo del vestuario está bajo: conviene estabilizar el equipo.']:[])];
 if(!advice.length)advice.push('Plantel preparado. Buscá mantener esta racha y rotar cuando sea necesario.');
 return {fitness:fit,chemistry:chem,tired,lowForm,suspended,alternatives:options,advice,grade:careerGrade(s,name)};
}
