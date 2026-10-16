/** NOVERIA 5.2 · Series, celebración de campeones y portada histórica.
 * Nunca modifica goles, eventos, fixture ni palmarés del motor deportivo. */
import {played} from './engine.js';
const stageName=m=>String(m?.phase||m?.group||'').toLowerCase();
const stageIsTwoLegs=stage=>/^(final|semifinal|semifinales)$/.test(stage);
export function seriesAggregate(s,match){
 if(!match)return null;
 // Evita buscar entre miles de encuentros de liga por cada tarjeta de partido.
 const competition=String(match.competition||'');
 let owner=competition==='POST'?s.postseason:null;
 if(!owner&&competition.startsWith('FINAL-'))owner=s.world?.[competition.slice(6)]?.postseason;
 if(!owner)owner=(s.competitions||[]).find(c=>c.id===competition&&c.type==='apertura');
 if(!owner)return null;
 const stage=stageName(match);
 if(!stageIsTwoLegs(stage))return null;
 const matches=owner.fixtures||[];
 const pair=matches.filter(m=>stageName(m)===stage&&[m.home,m.away].sort().join('::')===[match.home,match.away].sort().join('::')&&m.competition===match.competition);
 if(pair.length!==2||pair[0].home===pair[1].home)return null;
 pair.sort((a,b)=>(a.leg??a.round??0)-(b.leg??b.round??0));
 const names=[pair[0].home,pair[0].away],scores=[0,0];let finished=0;
 for(const m of pair){if(!played(m))continue;finished++;scores[names.indexOf(m.home)]+=m.scoreH;scores[names.indexOf(m.away)]+=m.scoreA;}
 const leading=finished===2&&scores[0]!==scores[1]?names[scores[0]>scores[1]?0:1]:null;
 const second=pair[1];const penaltyWinner=finished===2&&scores[0]===scores[1]&&second.penalties?(second.penalties==='5-4'?second.home:second.away):null;
 return {stage,first:pair[0],second,names,scores,finished,complete:finished===2,winner:leading||penaltyWinner,penalties:second.penalties||null,leg:(match.id===second.id?2:1)};
}
export function globalLabel(s,match){const t=seriesAggregate(s,match);if(!t)return '';const [a,b]=t.names;const status=t.complete?'GLOBAL FINAL':t.finished?'GLOBAL PARCIAL':'SERIE IDA Y VUELTA';return `${status} · ${a} ${t.scores[0]}–${t.scores[1]} ${b}${t.penalties?' · Penales '+t.penalties:''}`;}
function honourKey(h){return `${h.season||''}|${h.title}|${h.winner}`;}
function featuredFinal(s,h){const name=String(h.title||'').toLowerCase(),country=Object.values(s.teams)[0];
 let fs=[];
 if(name.startsWith('apertura')&&(!name.includes(' de '))){fs=(s.postseason?.fixtures||[]).filter(m=>m.group==='final');}
 else if(name.includes('recopa veltrana'))fs=(s.postseason?.fixtures||[]).filter(m=>m.group==='recopa');
 else if(name.includes('copa de las provincias'))fs=(s.cup?.fixtures||[]).filter(m=>m.group==='final');
 else for(const [nation,w] of Object.entries(s.world||{})){if(name.includes(nation.toLowerCase()))fs=name.includes('copa')?(w.cup?.fixtures||[]).filter(m=>m.group==='final'):(w.postseason?.fixtures||[]).filter(m=>m.group==='final'||m.group==='recopa');}
 if(!fs.length&&name.includes('arcalis')){for(const t of ['champions','horizonte'])if(name===String(s.international?.[t]?.name||'').toLowerCase())fs=(s.international[t].fixtures||[]).filter(m=>m.phase==='final'||m.group==='final');}
 return fs.filter(played).slice(-2);
}
export function registerChampions(s,{migrating=false}={}){
 s.footballExperience??={knownHonours:[],spotlights:[],shownCelebrations:[]};
 const e=s.footballExperience;
 const seen=new Set(e.knownHonours),added=[];
 for(const h of s.honours||[]){const key=honourKey(h);if(seen.has(key))continue;seen.add(key);e.knownHonours.push(key);
  const decisive=featuredFinal(s,h);const final=decisive.at(-1);const aggregate=final?seriesAggregate(s,final):null;
  const stats=aggregate&&aggregate.complete?` El global terminó ${aggregate.scores[0]}–${aggregate.scores[1]}.`:final?` La final terminó ${final.home} ${final.scoreH}–${final.scoreA} ${final.away}.`:'';
  const urlId=final?.id||null;
  const edition={id:`edition-${key}`,key,category:'Campeones',title:`🏆 ¡${h.winner} ES CAMPEÓN! · ${h.title}`,description:`Edición extraordinaria de El Heraldo de Noveria. ${h.winner} conquista ${h.title} (${h.season}).${stats} La afición celebra una nueva página del fútbol de Arcalis.`,date:`Temporada ${h.season}`,relatedClub:h.winner,related:urlId,featured:true,trophy:h.title};
  if(!s.news.some(n=>n.id===edition.id))s.news.unshift(edition);
  e.spotlights.unshift({key,club:h.winner,title:h.title,season:h.season,matchId:urlId,aggregate:aggregate?{names:aggregate.names,scores:aggregate.scores}:null});
  // Una actualización no debe abrir 30 ventanas por títulos de otras federaciones.
  if(!migrating&&(['Unión Popular Aurena',s.managedClub].includes(h.winner)||String(h.title).startsWith('Apertura')))added.push(e.spotlights[0]);
  else if(migrating&&h.winner==='Unión Popular Aurena'&&String(h.title).includes('Apertura')&&Number(h.season)===s.season)added.push(e.spotlights[0]);
 }
 if(s.news?.length>330)s.news.length=330;
 if(e.spotlights.length>80)e.spotlights.length=80;
 return added;
}
