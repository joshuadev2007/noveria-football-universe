const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const hash=value=>{let h=2166136261;for(const c of String(value??''))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
export const seasonKey=s=>String(s?.season??2026)+'-'+String(s?.edition||'Apertura');
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const stats=key=>({key,apps:0,starts:0,goals:0,assists:0,yellows:0,reds:0,injuries:0});
const emptyClubRecord=(name,team,key)=>({club:name,country:team?.country||'',apps:0,starts:0,goals:0,assists:0,yellows:0,reds:0,injuries:0,seasonsPlayed:0,firstSeason:key,lastSeason:key,seasons:{},legacyBaseline:false,historicalUnknown:false});
function transferKnown(s,p,name){return(s.transfers||[]).some(r=>String(r.playerId??'')===String(p.id)||String(r.player||'')===String(p.name)&&(r.from===name||r.to===name));}
function ensurePlayerRecord(s,name,p,team){
 if(!Number.isInteger(p.retirementAge)||p.retirementAge<37||p.retirementAge>41)p.retirementAge=37+hash(p.id||p.name)%5;
 const key=seasonKey(s);
 if(!p.clubCareer||typeof p.clubCareer!=='object'||Array.isArray(p.clubCareer)){
  const known=transferKnown(s,p,name),r=emptyClubRecord(name,team,key);
  if(!known){r.apps=num(p.apps);r.starts=num(p.apps);r.goals=num(p.goals);r.assists=num(p.assists);r.yellows=num(p.yellows);r.reds=num(p.reds);r.injuries=num(p.injuries);r.legacyBaseline=true;r.firstSeason='Inicio del registro';r.lastSeason=key;}
  else r.historicalUnknown=true;
  p.clubCareer={[name]:r};
 }
 if(!p.clubCareer[name])p.clubCareer[name]=emptyClubRecord(name,team,key);
 for(const[club,r]of Object.entries(p.clubCareer)){r.club??=club;r.country??=s.teams?.[club]?.country||'';for(const k of['apps','starts','goals','assists','yellows','reds','injuries'])r[k]=num(r[k]);r.seasons??={};r.seasonsPlayed=num(r.seasonsPlayed)||Object.values(r.seasons).filter(v=>num(v.apps)>0).length;r.firstSeason??=key;r.lastSeason??=key;r.legacyBaseline=Boolean(r.legacyBaseline);r.historicalUnknown=Boolean(r.historicalUnknown);}
 if(!Array.isArray(p.seasonHistory))p.seasonHistory=[];
 if(!p.seasonStats||typeof p.seasonStats!=='object')p.seasonStats=stats(key);
 if(!p.seasonStats.key)p.seasonStats.key=key;
 for(const k of['apps','starts','goals','assists','yellows','reds','injuries'])p.seasonStats[k]=num(p.seasonStats[k]);
}
export function ensureClubHeritage(s){
 if(!s.heritage||typeof s.heritage!=='object')s.heritage={version:1,retiredPlayers:[]};
 if(!Array.isArray(s.heritage.retiredPlayers))s.heritage.retiredPlayers=[];
 s.heritage.version=1;for(const[name,t]of Object.entries(s.teams||{}))for(const p of t.players||[])ensurePlayerRecord(s,name,p,t);return s;
}
function ensureRecordForMatch(s,name,p){
 if(!s.heritage)s.heritage={version:1,retiredPlayers:[]};const t=s.teams?.[name];
 if(!p.clubCareer||!p.clubCareer[name]||!p.seasonStats)ensurePlayerRecord(s,name,p,t);
 const key=seasonKey(s),r=p.clubCareer[name];if(!r.seasons[key])r.seasons[key]={...stats(key),club:name,country:t?.country||r.country||''};
 if(!p.seasonStats||p.seasonStats.key!==key)p.seasonStats=stats(key);return{key,r,edition:r.seasons[key],current:p.seasonStats};
}
export function recordPlayerMatch(s,name,p,isStarter=false){
 if(!p)return;const{key,r,edition,current}=ensureRecordForMatch(s,name,p);if(!edition.apps)r.seasonsPlayed=num(r.seasonsPlayed)+1;
 edition.apps++;r.apps++;current.apps++;if(isStarter){edition.starts++;r.starts++;current.starts++;}r.lastSeason=key;if(!r.firstSeason||r.firstSeason==='Inicio del registro')r.firstSeason=key;
}
export function recordPlayerEvent(s,name,p,event){
 if(!p)return;const{r,edition,current}=ensureRecordForMatch(s,name,p);const field=({goal:'goals',assist:'assists',yellow:'yellows',red:'reds',injury:'injuries'})[event];if(!field)return;edition[field]++;r[field]++;current[field]++;
}
export function closePlayerEdition(s,name,p){
 if(!p)return null;ensureRecordForMatch(s,name,p);const key=seasonKey(s);if(p.seasonStats.key!==key)return null;
 if(!p.seasonHistory.some(row=>row.key===key)){p.seasonHistory.unshift({...clone(p.seasonStats),season:num(s.season),edition:s.edition||'Apertura',clubAtEnd:name});p.seasonHistory=p.seasonHistory.slice(0,35);}
 for(const r of Object.values(p.clubCareer||{}))if(r.seasons?.[key])r.seasons[key].closed=true;return p.seasonHistory.find(row=>row.key===key)||null;
}
export function beginPlayerEdition(s,p){if(p)p.seasonStats=stats(seasonKey(s));}
function playerLegendClub(p){
 const entries=Object.entries(p?.clubCareer||{}).map(([club,r])=>({club,apps:num(r.apps),goals:num(r.goals),assists:num(r.assists),seasonsPlayed:num(r.seasonsPlayed)})).sort((a,b)=>b.apps-a.apps||b.goals-a.goals||b.assists-a.assists);
 return entries.find(r=>r.apps>=80||r.goals>=25||r.assists>=30||r.seasonsPlayed>=5)?.club||null;
}
const FIRST=['Mateo','Thiago','Damián','Emiliano','Bruno','Santiago','Noah','Iker','Adrián','Gael','Nicolás','Samuel','Marco','Iván','Gabriel','Luca','Enzo','Rafael','Daniel','Raúl','Diego','Joel','Emanuel','Ángel','Axel','Julián','Leandro','Hugo','Pablo','Leonardo'];
const LAST=['Valcera','Román','Arce','Vidal','Montiel','Navarro','Duarte','Lagos','Soria','Mejía','Cárdenas','Ríos','Barrera','Salcedo','Linares','Ferrán','Olmedo','Vargas','Salinas','Rosales','Campos','Velasco','Zamora','Ponce','Ibarra','Quiroga','Palacios','Herrera','Leiva','Carrasco'];
function replacementFor(s,team,retired){
 const h=hash(team.name+'-'+retired.id+'-'+seasonKey(s)+'-replacement'),age=18+h%4,ovr=Math.max(42,Math.min(68,num(team.rating)-13+h%10));
 return{id:'regen-'+h,name:FIRST[h%FIRST.length]+' '+LAST[(h>>>5)%LAST.length],number:30+h%70,age,nationality:team.country,pos:retired.pos||'MC',ovr,pot:Math.min(94,Math.max(ovr+5,num(team.rating)+8+h%10)),salary:30,value:100+h%600,contractYears:3,apps:0,goals:0,assists:0,yellows:0,reds:0,injuries:0,form:6.4,retirementAge:40,clubCareer:{},seasonHistory:[],seasonStats:stats(seasonKey(s)),academyGraduate:true,academyClub:team.name};
}
function keepRosterViable(s,team,retired){
 if(team.players.length>=17)return;const academy=Array.isArray(team.youth)?team.youth:[];academy.sort((a,b)=>num(b.ovr)-num(a.ovr));const youth=academy.shift();
 if(youth){youth.academyGraduate=true;youth.academyClub=team.name;youth.number=youth.number||30+team.players.length;team.players.push(youth);}else team.players.push(replacementFor(s,team,retired));
}
export function retirePlayer(s,teamName,playerId,{reason='voluntario',force=false}={}){
 ensureClubHeritage(s);const team=s.teams?.[teamName];if(!team)throw Error('Club de retiro no encontrado');
 if(s.mode==='manager'&&s.managedClub!==teamName&&!force)throw Error('Solo podés retirar futbolistas de tu club actual.');
 const index=team.players.findIndex(p=>String(p.id)===String(playerId));if(index<0)throw Error('El futbolista ya no está en la plantilla.');
 const p=team.players[index],age=num(p.age);if(reason!=='automatic'&&(age<37||age>41))throw Error('Los retiros están habilitados entre los 37 y 41 años.');
 if(team.players.length<=11)throw Error('El equipo necesita al menos 11 futbolistas activos.');
 if(s.heritage.retiredPlayers.some(x=>String(x.playerId??x.id)===String(p.id)))throw Error('Este futbolista ya está en el archivo de retirados.');
 closePlayerEdition(s,teamName,p);
 const retired={...clone(p),id:'retired-'+String(p.id)+'-'+seasonKey(s),playerId:p.id,lastClub:teamName,country:team.country,retirementAge:age,retirementSeason:{season:s.season,edition:s.edition||'Apertura'},retirementReason:reason==='automatic'?'Retiro automático':'Retiro voluntario',careerTotals:{apps:num(p.apps),goals:num(p.goals),assists:num(p.assists),yellows:num(p.yellows),reds:num(p.reds),injuries:num(p.injuries)},clubCareer:clone(p.clubCareer||{}),seasonHistory:clone(p.seasonHistory||[]),legendClub:playerLegendClub(p)};
 team.players.splice(index,1);s.heritage.retiredPlayers.unshift(retired);s.heritage.retiredPlayers=s.heritage.retiredPlayers.slice(0,2500);keepRosterViable(s,team,p);
 s.news??=[];s.news.unshift({id:'retirement-'+hash(retired.id),category:'Retiro',title:p.name+' cuelga las botas',description:p.name+' se retira a los '+age+' años después de cerrar su etapa en '+teamName+'. '+(retired.legendClub?'Será recordado como leyenda de '+retired.legendClub+'.':'Su carrera queda preservada en el archivo histórico de Noveria.'),date:(s.edition||'Apertura')+' '+s.season});return retired;
}
export function retireEligiblePlayers(s){
 ensureClubHeritage(s);const retired=[];for(const[name,team]of Object.entries(s.teams||{}))for(const p of [...(team.players||[])])if(num(p.age)>=Math.min(41,num(p.retirementAge)||41)){try{retired.push(retirePlayer(s,name,p.id,{reason:'automatic',force:true}));}catch{}}return retired;
}
function played(m){return Boolean(m?.played&&Number.isInteger(m.scoreH)&&Number.isInteger(m.scoreA));}
function matchList(entry){
 const all=[...(entry?.fixtures||[]),...(entry?.cup?.fixtures||[]),...(entry?.postseason?.fixtures||[])];
 for(const comp of entry?.competitions||[]){if(Array.isArray(comp?.fixtures))all.push(...comp.fixtures);else if(comp&&('home'in comp)&&('away'in comp))all.push(comp);}
 const seen=new Set();return all.filter(m=>{const key=m?.id||JSON.stringify([m?.home,m?.away,m?.round,m?.scoreH,m?.scoreA]);if(seen.has(key))return false;seen.add(key);return played(m);});
}
function tableRows(matches,names){
 const map=new Map(names.map(name=>[name,{name,pj:0,w:0,d:0,l:0,gf:0,gc:0,gd:0,pts:0}]));
 for(const m of matches){if(!played(m))continue;const h=map.get(m.home),a=map.get(m.away);if(!h||!a)continue;h.pj++;a.pj++;h.gf+=m.scoreH;h.gc+=m.scoreA;a.gf+=m.scoreA;a.gc+=m.scoreH;if(m.scoreH>m.scoreA){h.w++;h.pts+=3;a.l++;}else if(m.scoreH<m.scoreA){a.w++;a.pts+=3;h.l++;}else{h.d++;a.d++;h.pts++;a.pts++;}}
 return[...map.values()].map(r=>({...r,gd:r.gf-r.gc})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name));
}
function seasonPosition(entry,name,s){
 for(const[key,label]of[['A','Zona A'],['B','Zona B'],['second','Segunda'],['annual','Tabla anual']]){const rows=entry?.[key];if(!Array.isArray(rows))continue;const i=rows.findIndex(r=>r.name===name);if(i>=0)return{position:i+1,total:rows.length,label,points:rows[i].pts??0};}
 const team=s.teams?.[name];if(!team)return null;const country=entry?.country||team.country||'Veltrania';let group='';let names=[];
 if(country!=='Veltrania'){
  const slots=entry?.slots||s.world?.[country]?.slots||{};group=['A','B','S'].find(g=>(slots[g]||[]).includes(name))||'';
  if(!group)group=(entry?.fixtures||[]).find(m=>(m.home===name||m.away===name)&&['A','B','S'].includes(m.group))?.group||'';
  names=(slots[group]||[]).slice();if(!names.length&&group)names=[...new Set((entry?.fixtures||[]).filter(m=>m.group===group).flatMap(m=>[m.home,m.away]))];
 }else{group=team.division==='LPV'?'S':team.group||'A';names=Object.values(s.teams).filter(t=>group==='S'?t.country==='Veltrania'&&t.division==='LPV':t.country==='Veltrania'&&t.division==='LSV'&&t.group===group).map(t=>t.name);}
 const league=(entry?.fixtures||[]).filter(m=>['LSV','LPV'].includes(m.competition)&&(country==='Veltrania'||m.group===group));
 if(!league.some(m=>played(m)&&(m.home===name||m.away===name)))return null;
 if(!names.length)names=[...new Set(league.flatMap(m=>[m.home,m.away]))];
 const rows=tableRows(league,names),i=rows.findIndex(r=>r.name===name);return i<0?null:{position:i+1,total:rows.length,label:group==='S'?'Segunda':'Zona '+group,points:rows[i].pts};
}
export function teamSeasonHistory(s,name){
 const country=s.teams?.[name]?.country||'Veltrania',world=country!=='Veltrania'?s.world?.[country]:null;
 const archives=[...(world?.archive||s.archive||[])].map(a=>({...a,current:false,country,slots:a.slots||null}));
 archives.push({season:s.season,edition:s.edition||'Apertura',key:seasonKey(s),fixtures:world?.fixtures||s.fixtures||[],cup:world?.cup||s.cup,postseason:world?.postseason||s.postseason,competitions:s.competitions||[],current:true,country,slots:world?.slots||null});
 return archives.filter(a=>a.fixtures?.length||a.cup?.fixtures?.length||a.postseason?.fixtures?.length).map(a=>{
  const all=matchList(a).filter(m=>m.home===name||m.away===name),league=all.filter(m=>['LSV','LPV'].includes(m.competition)),cup=(a.cup?.fixtures||[]).filter(m=>(m.home===name||m.away===name)&&played(m));
  let w=0,d=0,l=0,gf=0,gc=0;for(const m of all){const h=m.home===name,forGoals=h?m.scoreH:m.scoreA,against=h?m.scoreA:m.scoreH;gf+=forGoals;gc+=against;if(forGoals>against)w++;else if(forGoals===against)d++;else l++;}
  const pos=seasonPosition(a,name,s),cupChampion=a.cup?.champion===name,cupRounds=cup.map(m=>({round:num(m.round),stage:String(m.group||'')})).sort((x,y)=>y.round-x.round),rawCupStage=cupRounds[0]?.stage||'',cupStage=cupChampion?'Campeón':cupRounds.length?(/^[A-G]$/.test(rawCupStage)?'Fase de grupos':rawCupStage||('Ronda '+cupRounds[0].round)):(a.cup?.fixtures||[]).some(m=>m.home===name||m.away===name)?'En curso':'Sin participación registrada';
  const honours=(s.honours||[]).filter(h=>h.winner===name&&String(h.season)===String(a.season)&&(!h.edition||h.edition===a.edition));
  return{key:a.key||String(a.season)+'-'+a.edition,season:a.season,edition:a.edition||'Apertura',current:Boolean(a.current),matches:all.length,leagueMatches:league.length,w,d,l,gf,gc,gd:gf-gc,position:pos,cupStage,titles:honours.length,fixtures:all};
 }).sort((a,b)=>num(b.season)-num(a.season)||(a.edition===b.edition?0:a.edition==='Apertura'?1:-1));
}
export function clubHonours(s,name){
 const rows=[];for(const h of s.honours||[])if(h.winner===name)rows.push({title:h.title,season:String(h.season??s.season),edition:h.edition||'',source:'Palmarés oficial'});
 const team=s.teams?.[name];for(const trophy of team?.trophies||[]){const title=String(trophy),year=title.match(/20\d{2}/)?.[0]||'Archivo';if(!rows.some(r=>r.title===title||title.includes(r.title)&&r.season===year))rows.push({title,season:year,edition:'',source:'Vitrina del club'});}
 const seen=new Set();return rows.filter(r=>{const key=r.title+'|'+r.season+'|'+r.edition;if(seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=>String(b.season).localeCompare(String(a.season)));
}
export function clubLegends(s,name,limit=12){
 ensureClubHeritage(s);const all=[];for(const t of Object.values(s.teams||{}))for(const p of t.players||[])if(p.clubCareer?.[name])all.push({p,retired:false,activeClub:t.name,record:p.clubCareer[name]});
 for(const p of s.heritage.retiredPlayers||[])if(p.clubCareer?.[name])all.push({p,retired:true,activeClub:null,record:p.clubCareer[name]});
 const unique=new Map();for(const x of all){const id=String(x.p.playerId??x.p.id),old=unique.get(id);if(!old||x.retired)unique.set(id,x);}
 return[...unique.values()].filter(x=>num(x.record.apps)||num(x.record.goals)||num(x.record.assists)).sort((a,b)=>num(b.record.apps)-num(a.record.apps)||num(b.record.goals)-num(a.record.goals)||num(b.record.assists)-num(a.record.assists)).slice(0,limit).map((x,i)=>({...x,rank:i+1,isLegend:num(x.record.apps)>=80||num(x.record.goals)>=25||num(x.record.assists)>=30||num(x.record.seasonsPlayed)>=5}));
}
export function retiredPlayersForCountry(s,country='Todos'){
 const teams=s.teams||{};return(s.heritage?.retiredPlayers||[]).filter(p=>country==='Todos'||teams[p.lastClub]?.country===country||Object.keys(p.clubCareer||{}).some(name=>teams[name]?.country===country)).sort((a,b)=>num(b.retirementSeason?.season)-num(a.retirementSeason?.season)||num(b.careerTotals?.apps)-num(a.careerTotals?.apps));
}
export function careerLeaders(s,metric='goals',limit=10){
 const all=[];for(const t of Object.values(s.teams||{}))for(const p of t.players||[])all.push({...p,active:true,currentClub:t.name,lastClub:t.name});
 for(const p of s.heritage?.retiredPlayers||[])all.push({...p,active:false,currentClub:null,lastClub:p.lastClub});
 const byId=new Map();for(const p of all){const id=String(p.playerId??p.id),old=byId.get(id);if(!old||p.active)byId.set(id,p);}
 return[...byId.values()].sort((a,b)=>num(b[metric]??b.careerTotals?.[metric])-num(a[metric]??a.careerTotals?.[metric])||num(b.apps)-num(a.apps)).slice(0,limit);
}
