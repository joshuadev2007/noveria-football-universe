/* Torneos de Arcalis: 9 países, clasificación nacional y repechajes reales. */
import {FOREIGN_COUNTRIES} from './data.js';
import {ranking,standings,played,simulateMatch} from './engine.js';
import {countryStandings} from './continent.js';
const COUNTRIES=['Veltrania',...FOREIGN_COUNTRIES];
function match(id,round,home,away,group,phase){return {id,competition:'ARCALIS',round,home,away,group,phase,played:false,scoreH:null,scoreA:null};}
function roundRobin(id,group,names,offset=0){let a=names.slice();if(a.length%2)a.push(null);const n=a.length,results=[];for(let r=0;r<n-1;r++){for(let k=0;k<n/2;k++){let x=a[k],y=a[n-1-k];if(!x||!y)continue;const h=(r+k)%2?y:x,v=h===x?y:x;results.push(match(`${id}-${group}-${r+1}-${k}`,r+1+offset,h,v,group,'groups'));}a=[a[0],a[n-1],...a.slice(1,n-1)];}return results;}
function qualifier(s,c){return c==='Veltrania'?standings(s,'annual'):countryStandings(s,c,'annual');}
function continentalOne(name,id,participants,season){const groups=Array.from({length:9},(_,i)=>({id:String.fromCharCode(65+i),teams:[]}));participants.forEach((name,j)=>{const countryIdx=j%9,rank=Math.floor(j/9);groups[(countryIdx+rank)%9].teams.push(name)});return {id,name,season,phase:'groups',round:1,groups,fixtures:groups.flatMap(g=>roundRobin(id,g.id,g.teams)),champion:null,finalists:[],knockout:[]};}
export function ensureInternational(s){if(s.international?.season===s.season)return s.international;
 if(!COUNTRIES.every(c=>c==='Veltrania'?s.fixtures.filter(f=>f.competition==='LSV'&&!played(f)).length===0:s.world?.[c]?.round===18))return null;
 const entries=COUNTRIES.map(c=>qualifier(s,c));const horizon=[];for(let j=0;j<5;j++)for(let i=0;i<9;i++)horizon.push(entries[i][7+j].name);
 const champions={id:'champions',name:'Copa de Campeones de Arcalis',season:s.season,phase:'playoff',round:0,groups:[],fixtures:[],champion:null,finalists:[],direct:[],playIns:[]};
 for(let j=0;j<6;j++)for(let i=0;i<9;i++)champions.direct.push(entries[i][j].name);
 // El 7º de cada país se enfrenta al 13º de otro. El 8º–12º conservan cupo Horizonte.
 for(let i=0;i<9;i++){const h=entries[i][6].name,away=entries[(i+1)%9][12].name;const m=match(`ARC-${s.season}-REP-${i}`,0,h,away,'REP','playoff');champions.fixtures.push(m);champions.playIns.push(m.id);}
 const horizonte=continentalOne('Copa Horizonte de Arcalis','horizonte',horizon,s.season);
 s.international={season:s.season,champions,horizonte,archive:s.international?.archive||[]};return s.international;
}
function groupRank(c,g){return ranking(c.fixtures.filter(x=>x.phase==='groups'&&x.group===g.id),g.teams);}
function knockoutStage(c,s,round,teams){const shuffled=[];const half=teams.length/2;for(let i=0;i<half;i++)shuffled.push(match(`${c.id}-${s.season}-KO-${round}-${i}`,round,teams[i],teams[teams.length-1-i],'KO','knockout'));c.fixtures.push(...shuffled);c.phase='knockout';c.round=round;}
function qualifyPlayins(c,s){const winners=c.fixtures.filter(f=>f.phase==='playoff').map(f=>f.winner);const groups=Array.from({length:9},(_,i)=>({id:String.fromCharCode(65+i),teams:[]}));c.direct.forEach((name,j)=>groups[(j%9+Math.floor(j/9))%9].teams.push(name));winners.forEach((name,j)=>groups[j].teams.push(name));c.groups=groups;c.fixtures.push(...groups.flatMap(g=>roundRobin('champions-'+s.season,g.id,g.teams)));c.phase='groups';c.round=1;}
function winner(matchObj,seed){if(matchObj.scoreH!==matchObj.scoreA)return matchObj.scoreH>matchObj.scoreA?matchObj.home:matchObj.away;matchObj.extraTime=true;const h=(String(matchObj.id)+seed).split('').reduce((v,c)=>v*31+c.charCodeAt(0),7)%2===0;matchObj.penalties=h?'5-4':'4-5';return h?matchObj.home:matchObj.away;}
export function simulateInternationalStep(s,type){const cups=ensureInternational(s);if(!cups)throw Error('Primero deben finalizar las ligas nacionales de los nueve países.');const c=cups[type];if(!c||c.champion)throw Error('La copa ya terminó');const games=c.fixtures.filter(f=>f.round===c.round&&f.phase===c.phase&&!played(f));if(!games.length)throw Error('No hay encuentros pendientes');for(const f of games){simulateMatch(s,f,{silent:true});if(c.phase!=='groups')f.winner=winner(f,s.seed);}if(c.phase==='playoff')qualifyPlayins(c,s);
 else if(c.phase==='groups'){const remaining=c.fixtures.some(f=>f.phase==='groups'&&!played(f));if(remaining)c.round++;else{const qualifiers=c.groups.map(g=>groupRank(c,g));const leaders=qualifiers.map(rows=>rows[0]);const seconds=qualifiers.map(rows=>rows[1]).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf).slice(0,7);const teams=[...leaders,...seconds].sort((a,b)=>b.pts-a.pts||b.gd-a.gd).map(r=>r.name);knockoutStage(c,s,c.round+1,teams);}}
 else{const winners=games.map(x=>x.winner);if(winners.length===1){c.champion=winners[0];s.honours.push({title:c.name,winner:c.champion,season:String(s.season)});s.teams[c.champion].trophies.push(`${c.name} · ${s.season}`);s.news.unshift({id:`int-${type}-${s.season}`,category:'Internacional',title:`¡${c.champion} campeón de ${c.name}!`,description:'El trofeo continental tiene nuevo dueño.',date:`Temporada ${s.season}`});}else knockoutStage(c,s,c.round+1,winners);}
 return games;
}
export function internationalArchiveNextSeason(s){if(!s.international)return;const old=s.international;old.archive=[...(old.archive||[]),{season:old.season,champions:old.champions,horizonte:old.horizonte}];delete s.international; s.international={season:0,archive:old.archive};}
export {COUNTRIES};
