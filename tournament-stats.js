/**
 * Noveria 6.3.3 · Estadísticas por torneo y edición.
 * Todo sale de actas y marcadores guardados; no altera la partida.
 * El índice de rendimiento es calculado, NO una calificación oficial del simulador.
 */
const number=n=>Number.isFinite(Number(n))?Number(n):0;
const complete=m=>!!m?.played&&Number.isInteger(m.scoreH)&&Number.isInteger(m.scoreA);
const editionOf=(obj,fallback)=>obj?.key||String(obj?.season||fallback.season)+'-'+String(obj?.edition||'Apertura');
const matchArray=xs=>Array.isArray(xs)?xs:[];
const COMPETITIONS={
 primera:'Liga Suprema',segunda:'Liga de Plata',copa:'Copa Nacional',final:'Fase final y Recopa',
 campeones:'Copa de Campeones de Arcalis',horizonte:'Copa Horizonte de Arcalis'
};
const compName=k=>COMPETITIONS[k]||k;
const seasonKey=s=>s.season+'-'+(s.edition||'Apertura');
const descriptor=(edition,country,kind,fixtures,label=compName(kind))=>({
 id:edition+'::'+country+'::'+kind,edition,country,kind,label,fixtures:matchArray(fixtures)
});
function countryItems(edition,country,obj){
 const f=matchArray(obj?.fixtures),items=[
  descriptor(edition,country,'primera',f.filter(m=>m.competition==='LSV')),
  descriptor(edition,country,'segunda',f.filter(m=>m.competition==='LPV')),
  descriptor(edition,country,'copa',obj?.cup?.fixtures),
  descriptor(edition,country,'final',obj?.postseason?.fixtures)
 ];
 return items;
}
export function tournamentCatalog(s){
 const current=seasonKey(s),out=[];
 out.push(...countryItems(current,'Veltrania',s));
 for(const [country,world] of Object.entries(s.world||{}))out.push(...countryItems(current,country,world));
 if(s.international?.season===s.season&&(s.international.edition||'Apertura')===(s.edition||'Apertura')){
  out.push(descriptor(current,'Arcalis','campeones',s.international.champions?.fixtures));
  out.push(descriptor(current,'Arcalis','horizonte',s.international.horizonte?.fixtures));
 }else{
  out.push(descriptor(current,'Arcalis','campeones',[]),descriptor(current,'Arcalis','horizonte',[]));
 }
 for(const a of s.archive||[]){
  const key=editionOf(a,s);
  out.push(...countryItems(key,'Veltrania',a));
 }
 for(const [country,world] of Object.entries(s.world||{})){
  for(const a of world.archive||[])out.push(...countryItems(editionOf(a,s),country,a));
 }
 for(const a of s.international?.archive||[]){
  const key=editionOf(a,s);
  out.push(descriptor(key,'Arcalis','campeones',a.champions?.fixtures));
  out.push(descriptor(key,'Arcalis','horizonte',a.horizonte?.fixtures));
 }
 for(const tournament of s.competitions||[]){
  const key=String(tournament.editionKey||current);
  out.push(descriptor(key,'Personalizados',String(tournament.id),tournament.fixtures,tournament.name||'Torneo personalizado'));
 }
 const seen=new Set();
 return out.filter(c=>{if(seen.has(c.id))return false;seen.add(c.id);return true;});
}
const identity=(club,id,name)=>club+'::'+String(id??name);
function memberInfo(s,club,id,name){
 const p=(s.teams?.[club]?.players||[]).find(x=>id!=null&&String(x.id)===String(id));
 return {id:id??p?.id??null,name:name||p?.name||null,position:p?.pos||null};
}
function playerRow(map,club,id,name,position){
 if(!name)return null;
 const key=identity(club,id,name),value=map.get(key);
 if(value){if(!value.position&&position)value.position=position;return value;}
 const row={key,id:id??null,name,club,position:position||null,pj:0,goals:0,assists:0,yellow:0,red:0,cleanSheets:0,
  scoredMatches:0,ratingSum:0,ratingGames:0,rating:0};
 map.set(key,row);return row;
}
function addPlayerEvent(players,s,m,e){
 const side=e.side;if(side!=='home'&&side!=='away')return;
 const club=m[side],type=e.type;
 if(type!=='goal'&&type!=='yellow'&&type!=='red')return;
 const a=memberInfo(s,club,e.p1,e.p1Name);
 const p=playerRow(players,club,a.id,a.name,a.position);
 if(p){if(type==='goal')p.goals++;if(type==='yellow')p.yellow++;if(type==='red')p.red++;}
 if(type==='goal'){
  const b=memberInfo(s,club,e.p2,e.p2Name);
  if(b.name&&(b.id==null||a.id==null||String(b.id)!==String(a.id))){
   const assist=playerRow(players,club,b.id,b.name,b.position);if(assist)assist.assists++;
  }
 }
}
function matchLineup(m,side,s){
 const details=matchArray(m.lineupDetails?.[side]),ids=matchArray(m.lineups?.[side]);
 if(!ids.length&&!details.length)return [];
 const club=m[side];
 const rows=[];
 for(let i=0;i<Math.max(ids.length,details.length);i++){
  const data=details[i],found=memberInfo(s,club,ids[i],data?.name);
  if(!found.name)continue;
  rows.push({id:found.id,name:found.name,pos:data?.pos||found.position||null});
 }
 return rows;
}
function matchPerformance(m,side,player,goals,assists,yellow,red){
 const goalsFor=number(m[side==='home'?'scoreH':'scoreA']),
  against=number(m[side==='home'?'scoreA':'scoreH']);
 const defensive=['POR','DFC','LD','LI','MCD'].includes(player.pos);
 const clean=against===0&&defensive;
 const result=goalsFor>against?.40:goalsFor===against?.10:-.25;
 const rating=6.1+result+goals*1.10+assists*.65+(clean?.65:0)-yellow*.20-red*1.4;
 return Math.max(3,Math.min(10,rating));
}
export function tournamentStatistics(s,selection){
 const fixtures=matchArray(selection?.fixtures),games=fixtures.filter(complete);
 const teams=new Map(),players=new Map();
 const getTeam=name=>{
  if(teams.has(name))return teams.get(name);
  const t={name,pj:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,cleanSheets:0,avgAgainst:0,avgFor:0,points:0,
   shotsFor:0,shotsAgainst:0,red:0,yellow:0};
  teams.set(name,t);return t;
 };
 let individualGames=0,attributedGames=0;
 for(const m of games){
  const h=getTeam(m.home),a=getTeam(m.away);
  h.pj++;a.pj++;h.gf+=m.scoreH;h.ga+=m.scoreA;a.gf+=m.scoreA;a.ga+=m.scoreH;
  if(m.scoreA===0)h.cleanSheets++;
  if(m.scoreH===0)a.cleanSheets++;
  if(m.scoreH>m.scoreA){h.w++;a.l++;h.points+=3;}
  else if(m.scoreH<m.scoreA){a.w++;h.l++;a.points+=3;}
  else {h.d++;a.d++;h.points++;a.points++;}
  if(m.stats){
   h.shotsFor+=number(m.stats.shotsH);h.shotsAgainst+=number(m.stats.shotsA);
   a.shotsFor+=number(m.stats.shotsA);a.shotsAgainst+=number(m.stats.shotsH);
  }
  const events=!m.legacy&&Array.isArray(m.events)?m.events:[];
  if(!m.legacy&&Array.isArray(m.events)){
   individualGames++;
   if(events.filter(x=>x.type==='goal').length===m.scoreH+m.scoreA)attributedGames++;
  }
  const statByClub={home:{},away:{}};
  for(const e of events){
   addPlayerEvent(players,s,m,e);
   if(!['home','away'].includes(e.side))continue;
   if(e.type==='yellow'||e.type==='red'){
    const team=e.side==='home'?h:a;
    if(e.type==='yellow')team.yellow++;else team.red++;
   }
   if(e.type==='goal'||e.type==='yellow'||e.type==='red'){
    const key=String(e.p1??e.p1Name??'');
    if(!key)continue;
    const found=statByClub[e.side][key]??={goals:0,assists:0,yellow:0,red:0};
    if(e.type==='goal')found.goals++;
    else if(e.type==='yellow')found.yellow++;
    else found.red++;
    if(e.type==='goal'&&(e.p2!=null||e.p2Name)){
     const aid=String(e.p2??e.p2Name);
     if(aid!==key)(statByClub[e.side][aid]??={goals:0,assists:0,yellow:0,red:0}).assists++;
    }
   }
  }
  if(!m.legacy){
   for(const side of ['home','away']){
    const team=m[side],against=m[side==='home'?'scoreA':'scoreH'],lineup=matchLineup(m,side,s);
    const keeper=lineup.find(p=>p.pos==='POR');
    if(keeper&&against===0){
     const k=playerRow(players,team,keeper.id,keeper.name,keeper.pos);
     if(k)k.cleanSheets++;
    }
    for(const p of lineup){
     const row=playerRow(players,team,p.id,p.name,p.pos);
     if(!row)continue;
     row.pj++;
     const stat=statByClub[side][String(p.id??p.name)]||{goals:0,assists:0,yellow:0,red:0};
     row.ratingSum+=matchPerformance(m,side,p,stat.goals,stat.assists,stat.yellow,stat.red);
     row.ratingGames++;
    }
   }
  }
 }
 const teamRows=[...teams.values()].map(t=>({
  ...t,gd:t.gf-t.ga,avgAgainst:t.pj?t.ga/t.pj:0,avgFor:t.pj?t.gf/t.pj:0,
  cleanPct:t.pj?Math.round(t.cleanSheets/t.pj*100):0
 }));
 const playerRows=[...players.values()].map(p=>({
  ...p,rating:p.ratingGames?+(p.ratingSum/p.ratingGames).toFixed(2):0
 }));
 const ranked=(xs,fn)=>xs.slice().sort(fn);
 const rank={
  goals:ranked(playerRows.filter(p=>p.goals>0),(a,b)=>b.goals-a.goals||b.assists-a.assists||a.name.localeCompare(b.name,'es')),
  assists:ranked(playerRows.filter(p=>p.assists>0),(a,b)=>b.assists-a.assists||b.goals-a.goals||a.name.localeCompare(b.name,'es')),
  rating:ranked(playerRows.filter(p=>p.ratingGames>0),(a,b)=>b.rating-a.rating||b.goals-a.goals||b.ratingGames-a.ratingGames||a.name.localeCompare(b.name,'es')),
  goalkeepers:ranked(playerRows.filter(p=>p.cleanSheets>0),(a,b)=>b.cleanSheets-a.cleanSheets||b.pj-a.pj||a.name.localeCompare(b.name,'es')),
  defenses:ranked(teamRows,(a,b)=>a.avgAgainst-b.avgAgainst||b.cleanSheets-a.cleanSheets||a.ga-b.ga||a.name.localeCompare(b.name,'es')),
  cleanSheets:ranked(teamRows,(a,b)=>b.cleanSheets-a.cleanSheets||a.avgAgainst-b.avgAgainst||a.name.localeCompare(b.name,'es')),
  offenses:ranked(teamRows,(a,b)=>b.avgFor-a.avgFor||b.gf-a.gf||a.name.localeCompare(b.name,'es')),
  fairPlay:ranked(teamRows,(a,b)=>a.red-b.red||a.yellow-b.yellow||a.name.localeCompare(b.name,'es'))
 };
 return {fixtures:fixtures.length,played:games.length,individualGames,attributedGames,
  goals:games.reduce((n,m)=>n+m.scoreH+m.scoreA,0),players:playerRows,teams:teamRows,rank};
}
