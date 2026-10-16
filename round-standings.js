/* NOVERIA · Tablas de clasificación vinculadas a la jornada que acaba de simularse.
 * Solo lectura: no modifica resultados, calendarios, campeones ni datos guardados.
 */
import {ranking,standings,played} from './engine.js';
import {countryStandings} from './continent.js';
import {FOREIGN_COUNTRIES} from './data.js';
const NATIONS=['Veltrania',...FOREIGN_COUNTRIES];
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const sortRank=(a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name,'es');
const isGroup=x=>typeof x==='string'&&x.length===1&&alphabet.includes(x);
function countryOf(s,m){return s.teams?.[m.home]?.country||'Veltrania';}
function common(competition,key,name,area,rows,desc,groups=false){
 return {competition,key,name,area,rows,desc,groups};
}
function rowsForGroups(fixtures,defs,roundCheck=()=>true){
 return defs.map(g=>({name:g.id,teams:g.teams,rows:ranking(fixtures.filter(m=>m.group===g.id&&roundCheck(m)),g.teams)}));
}
function cupGroups(cup){
 if(cup?.groups?.length)return cup.groups;
 const pool=cup?.fixtures||[],ids=[...new Set(pool.filter(m=>isGroup(m.group)).map(m=>m.group))].sort();
 return ids.map(id=>({id,teams:[...new Set(pool.filter(m=>m.group===id).flatMap(m=>[m.home,m.away]))]}));
}
function cupPanels(s,country,cup){
 if(!cup)return [];
 const groups=cupGroups(cup);
 if(!groups.length)return knockoutPanels(s,country==='Veltrania'?'Copa de las Provincias':'Copa Nacional de '+country,cup.fixtures,'copa:'+country,country,cup.champion);
 const stages=rowsForGroups(cup.fixtures,groups,m=>m.round<=3);
 const completed=cup.fixtures.filter(m=>isGroup(m.group)).every(played);
 const thirds=stages.map(g=>({...g.rows[2],group:g.name})).filter(x=>x.name);
 thirds.sort(sortRank);
 const best=new Set(thirds.slice(0,2).map(r=>r.name));
 const note=completed?'Fase de grupos cerrada · plazas definitivas':'Clasificación provisional · pueden cambiar los puestos';
 const panels=stages.map(g=>common('cup','cup:'+country+':'+g.name,'Copa Nacional · Grupo '+g.name,country,
  g.rows.map((r,i)=>({...r,spot:i<2?'advance':i===2&&best.has(r.name)?'wildcard':'none',
   status:i<2?'Octavos':i===2&&best.has(r.name)?'Mejor 3.º':'—',confirmed:completed})),
  'Los dos primeros y los dos mejores terceros del torneo avanzan a octavos. '+note,true));
 if(cup.fixtures.some(m=>!isGroup(m.group)&&played(m)))panels.push(...knockoutPanels(s,'Copa Nacional',cup.fixtures,'cup:knockout:'+country,country,cup.champion));
 return panels;
}
function leaguePanels(s,country){
 const groups=['A','B','S','annual'];
 return groups.map(g=>{
  const rows=country==='Veltrania'?standings(s,g):countryStandings(s,country,g);
  const reg=g==='annual'?'Tabla anual · Escudo de Oro':g==='S'?'Liga de Plata · Ascensos':'Primera · Zona '+g;
  const desc=g==='annual'?'1.º–6.º: Campeones · 7.º: repechaje · 8.º–12.º: Horizonte · 13.º: repechaje · 14.º–18.º: sin plaza':
    g==='S'?'1.º y 2.º: ascenso a Primera al cerrar el Apertura':
    '1.º–4.º: cuartos de final · último: zona de descenso al cerrar el Apertura';
  const activeFixtures=country==='Veltrania'?s.fixtures:(s.world?.[country]?.fixtures||[]);
  // Los clásicos interzonales también suman a A y B: no confirmar plazas antes del último partido.
  const members=new Set(rows.map(r=>r.name));
  const complete=activeFixtures.filter(m=>g==='S'?m.competition==='LPV':g==='annual'?m.competition==='LSV':m.competition==='LSV'&&(members.has(m.home)||members.has(m.away))).every(played);
  return common('league','league:'+country+':'+g,reg,country,
   rows.map((r,i)=>{
    let spot='none',status='—';
    if(g==='A'||g==='B'){if(i<4){spot='advance';status='Cuartos de final'}else if(i===rows.length-1){spot='danger';status='Descenso';}}
    if(g==='S'&&i<2){spot='advance';status='Ascenso';}
    if(g==='annual'){
     if(i<6){spot='advance';status='Campeones';}
     else if(i===6||i===12){spot='playoff';status='Repechaje';}
     else if(i>=7&&i<=11){spot='wildcard';status='Horizonte';}
    }
    return {...r,spot,status,confirmed:complete};
   }),desc);
 });
}
function continentalPanels(s,id){
 const c=s.international?.[id];if(!c)return [];
 const label=id==='champions'?'Copa de Campeones de Arcalis':'Copa Horizonte de Arcalis';
 const panels=[];
 if(c.groups?.length){
  const stages=rowsForGroups(c.fixtures,c.groups,m=>m.phase==='groups');
  const seconds=stages.map(g=>({...g.rows[1],group:g.name})).filter(x=>x.name).sort(sortRank);
  const best=new Set(seconds.slice(0,7).map(x=>x.name));
  const complete=c.fixtures.filter(m=>m.phase==='groups').length>0&&c.fixtures.filter(m=>m.phase==='groups').every(played);
  for(const g of stages)panels.push(common('international',id+':'+g.name,label+' · Grupo '+g.name,'Arcalis',
   g.rows.map((r,i)=>({...r,spot:i===0?'advance':i===1&&best.has(r.name)?'wildcard':'none',
     status:i===0?'Octavos':i===1&&best.has(r.name)?'Mejor 2.º':'—',confirmed:complete})),
   'Los nueve líderes de grupo y los siete mejores segundos avanzan a octavos. '+(complete?'Puestos confirmados.':'Puestos provisionales.'),true));
 }
 const finished=c.fixtures.some(m=>m.phase!=='groups'&&played(m));
 if(finished)panels.push(...knockoutPanels(s,label,c.fixtures,id+':knockout','Arcalis',c.champion));
 return panels;
}
function stageNumber(stage){
 return {playoff:0,octavos:1,cuartos:2,semifinal:3,semifinales:3,final:4,recopa:5,eliminatoria:3}[stage]??2;
}
function matchWinner(m){
 if(!played(m))return null;
 if(m.winner)return m.winner;
 if(m.scoreH!==m.scoreA)return m.scoreH>m.scoreA?m.home:m.away;
 if(m.penalties){
  const [h,a]=String(m.penalties).split('-').map(Number);
  if(Number.isFinite(h)&&Number.isFinite(a)&&h!==a)return h>a?m.home:m.away;
 }
 return null;
}
function knockoutPanels(s,title,fixtures,prefix,area,champion){
 const ko=(fixtures||[]).filter(m=>played(m)&&(!isGroup(m.group)||m.phase==='playoff'||m.phase==='knockout')&&m.group!=='liga'&&m.phase!=='regular');
 if(!ko.length)return [];
 const latest=Math.max(...ko.map(m=>Number(m.round)||0));
 const recent=ko.filter(m=>Number(m.round||0)===latest);
 const label=m=>m.group==='KO'?'Ronda '+m.round:String(m.group||m.phase||'eliminatoria');
 const stages=[...new Set(recent.map(label))];
 return stages.map(stage=>{
  const matches=recent.filter(m=>label(m)===stage),names=[...new Set(matches.flatMap(m=>[m.home,m.away]))];
  // Doble partido: sin clasificado hasta terminar ida y vuelta.
  const qualified=matches.filter(m=>!m.leg||m.leg===2||m.phase==='playoff'||m.phase==='knockout').map(matchWinner).filter(Boolean);
  const winnerSet=new Set(qualified),rows=names.map(name=>{
    const wins=matches.filter(m=>matchWinner(m)===name).length,playedCount=matches.filter(m=>[m.home,m.away].includes(name)).length;
    return {name,pj:playedCount,w:wins,d:0,l:0,gf:matches.filter(m=>m.home===name).reduce((n,m)=>n+m.scoreH,0)+matches.filter(m=>m.away===name).reduce((n,m)=>n+m.scoreA,0),
     gc:matches.filter(m=>m.home===name).reduce((n,m)=>n+m.scoreA,0)+matches.filter(m=>m.away===name).reduce((n,m)=>n+m.scoreH,0),
     spot:winnerSet.has(name)?'advance':'none',status:winnerSet.has(name)?stage==='final'?'Campeón':'Avanza':'En disputa',confirmed:winnerSet.has(name)};
  }).sort((a,b)=>Number(b.spot==='advance')-Number(a.spot==='advance')||b.gf-a.gf);
  for(const r of rows){r.gd=r.gf-r.gc;r.pts=null;}
  return common('knockout',prefix+':'+stage,title+' · '+stage,area,rows,
    'Cuadro eliminatorio: aquí no se suman puntos de liga. La marca identifica a quien ha avanzado según los resultados y desempates registrados.');
 });
}
function postseasonPanels(s,country){
 const p=country==='Veltrania'?s.postseason:s.world?.[country]?.postseason;
 if(!p?.fixtures?.length)return [];
 const pools=['cuartos','semifinales','semifinal','final','recopa'];
 const matches=p.fixtures.filter(played);
 const panels=[];
 for(const stage of pools){
  const all=matches.filter(m=>m.group===stage);if(!all.length)continue;
  let winners=[];
  if(stage==='final'&&(p.apertura||p.clausura))winners=[p.apertura||p.clausura];
  else if(stage==='cuartos'&&p.fixtures.some(m=>m.group==='semifinal'||m.group==='semifinales'))winners=[...new Set(p.fixtures.filter(m=>m.group==='semifinal'||m.group==='semifinales').flatMap(m=>[m.home,m.away]))];
  else if(stage==='recopa'&&p.recopa)winners=[p.recopa];
  else if((stage==='semifinales'||stage==='semifinal')&&p.fixtures.some(m=>m.group==='final'))
   winners=[...new Set(p.fixtures.filter(m=>m.group==='final').flatMap(m=>[m.home,m.away]))];
  const teams=[...new Set(all.flatMap(m=>[m.home,m.away]))];
  const rows=teams.map(n=>({name:n,pj:all.filter(m=>[m.home,m.away].includes(n)).length,w:0,d:0,l:0,
   gf:all.reduce((sum,m)=>sum+(m.home===n?m.scoreH:m.away===n?m.scoreA:0),0),
   gc:all.reduce((sum,m)=>sum+(m.home===n?m.scoreA:m.away===n?m.scoreH:0),0),
   spot:winners.includes(n)?'advance':'none',status:winners.includes(n)?stage==='recopa'||stage==='final'?'Campeón':'Finalista':'En disputa',confirmed:winners.includes(n)}));
  rows.forEach(r=>{r.gd=r.gf-r.gc;r.pts=null;});
  rows.sort((a,b)=>Number(b.spot==='advance')-Number(a.spot==='advance')||b.gf-a.gf);
  panels.push(common('knockout','post:'+country+':'+stage,(stage==='recopa'?'Recopa':stage==='final'?'Final':stage==='cuartos'?'Cuartos de final':'Semifinales')+' · '+country,country,rows,
    'Serie de eliminación directa. Los clasificados se confirman al terminar ambos partidos, cuando corresponde.'));
 }
 return panels;
}
function customPanels(s,matches){
 const ids=[...new Set(matches.filter(m=>String(m.competition||'').startsWith('CUSTOM-')).map(m=>m.competition))],panels=[];
 for(const id of ids){const c=(s.competitions||[]).find(x=>x.id===id);if(!c)continue;
  if(['league','league2','apertura'].includes(c.type)){
   const groups=c.type==='apertura'?c.groups:[{id:'Liga',teams:c.teams}];
   for(const g of groups)panels.push(common('custom',c.id+':'+g.id,c.name+' · '+g.id,'Personalizado',
    ranking(c.fixtures.filter(m=>c.type==='apertura'?m.phase==='regular':m.group==='liga'),g.teams).map((r,i)=>({...r,spot:c.type==='apertura'&&i<2?'advance':c.type!=='apertura'&&i===0?'advance':'none',status:c.type==='apertura'&&i<2?'Semifinales':c.type!=='apertura'&&i===0?'Líder':'—',confirmed:!!c.champion})),
    c.type==='apertura'?'Los primeros dos de cada zona clasifican a semifinales.':'Liga: gana quien termina primero en puntos.'));
  }else if(c.type==='groups'&&c.groups?.length){
   for(const g of c.groups)panels.push(common('custom',c.id+':'+g.id,c.name+' · Grupo '+g.id,'Personalizado',
    ranking(c.fixtures.filter(m=>m.group===g.id),g.teams).map((r,i)=>({...r,spot:i<2?'advance':'none',status:i<2?'Clasifica':'—',confirmed:c.fixtures.filter(m=>m.group===g.id).every(played)})),
    'Dos clubes por grupo pasan a eliminación directa.'));
  }
  // El Apertura personalizado usa ida y vuelta: el ganador de un partido
  // no equivale necesariamente al clasificado de la serie completa.
  if(c.type==='apertura'){
   const stage=c.stage==='recopa'||c.champion?'recopa':c.stage==='final'?'final':c.stage==='semifinal'?'semifinal':null;
   if(stage){
    const stageFixtures=c.fixtures.filter(m=>m.group===stage),participants=[...new Set(stageFixtures.flatMap(m=>[m.home,m.away]))];
    const finalists=[...new Set(c.fixtures.filter(m=>m.group==='final').flatMap(m=>[m.home,m.away]))];
    const winners=stage==='semifinal'?finalists:stage==='final'?(c.apertura?[c.apertura]:[]):c.champion?[c.champion]:[];
    panels.push(common('knockout',c.id+':series:'+stage,c.name+' · '+stage,'Personalizado',participants.map(n=>{
     const games=stageFixtures.filter(m=>played(m)&&[m.home,m.away].includes(n));
     const gf=games.reduce((v,m)=>v+(m.home===n?m.scoreH:m.scoreA),0),gc=games.reduce((v,m)=>v+(m.home===n?m.scoreA:m.scoreH),0);
     return {name:n,pj:games.length,gf,gc,gd:gf-gc,pts:null,spot:winners.includes(n)?'advance':'none',
      status:winners.includes(n)?stage==='semifinal'?'Finalista':'Campeón':'En disputa',confirmed:winners.includes(n)};
    }), 'La clasificación se decide por marcador global de ida y vuelta, no por el resultado de una sola pierna.'));
   }
  }else panels.push(...knockoutPanels(s,c.name,c.fixtures,c.id+':ko','Personalizado',c.champion));
 }
 return panels;
}
/**
 * report is the set of fixtures simulated on a date, event.kind is that date's competition.
 * For 'Todos' returns the affected nations; for a single nation only its competitions.
 */
export function standingsForResults(s,report,event,country='Todos'){
 const all=Array.isArray(report)?report.filter(played):[];
 const nations=[...new Set(all.map(m=>countryOf(s,m)).filter(c=>NATIONS.includes(c)))];
 const local=(country==='Todos'?NATIONS.filter(c=>nations.includes(c)):NATIONS.filter(c=>c===country));
 const kind=event?.kind||(
  all.some(m=>m.competition==='ARCALIS')?'international':
  all.some(m=>m.competition==='LSV'||m.competition==='LPV')?'league':
  all.some(m=>m.competition==='CUP'||String(m.competition).startsWith('COPA-'))?'cup':
  all.some(m=>m.competition==='POST'||String(m.competition).startsWith('FINAL-'))?'postseason':
  all.some(m=>String(m.competition).startsWith('CUSTOM-'))?'custom':null
 );
 if(kind==='league')return local.flatMap(c=>leaguePanels(s,c));
 if(kind==='cup')return local.flatMap(c=>cupPanels(s,c,c==='Veltrania'?s.cup:s.world?.[c]?.cup));
 if(kind==='postseason')return local.flatMap(c=>postseasonPanels(s,c));
 if(kind==='international'){
  const relevant=country==='Todos'?['champions','horizonte']:
   ['champions','horizonte'].filter(id=>(s.international?.[id]?.fixtures||[]).some(m=>played(m)&&all.some(x=>x.id===m.id)&&[m.home,m.away].some(n=>s.teams?.[n]?.country===country)));
  return relevant.flatMap(id=>continentalPanels(s,id).filter(p=>country==='Todos'||p.competition==='knockout'&&p.rows.some(r=>s.teams?.[r.name]?.country===country)||p.competition==='international'&&p.rows.some(r=>s.teams?.[r.name]?.country===country)));
 }
 if(kind==='custom')return customPanels(s,all);
 return [];
}
