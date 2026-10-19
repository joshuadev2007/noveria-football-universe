import assert from 'node:assert/strict';
import {tournamentCatalog,tournamentStatistics} from './tournament-stats.js';
const club={A:{players:[{id:'gA',name:'Ana',pos:'POR'},{id:'sA',name:'Alonso',pos:'DC'},{id:'aA',name:'Arce',pos:'MC'}]},
B:{players:[{id:'gB',name:'Berto',pos:'POR'},{id:'sB',name:'Benito',pos:'DC'}]}};
const scored=(side,id,name,assist=null,assistName=null)=>({type:'goal',min:35,side,p1:id,p1Name:name,p2:assist,p2Name:assistName});
const lineups={home:['gA','sA','aA'],away:['gB','sB']};
const lineupDetails={home:[{name:'Ana',pos:'POR'},{name:'Alonso',pos:'DC'},{name:'Arce',pos:'MC'}],
away:[{name:'Berto',pos:'POR'},{name:'Benito',pos:'DC'}]};
const match=(id,home,away,h,a,events,other={})=>({id,competition:'LSV',home,away,played:true,scoreH:h,scoreA:a,events,
lineups,lineupDetails,...other});
const a=match('m1','A','B',2,0,[scored('home','sA','Alonso','aA','Arce'),scored('home','sA','Alonso')]);
const b=match('m2','A','B',1,0,[scored('home','sA','Alonso','aA','Arce')]);
const old=match('history','A','B',0,0,[],{legacy:true,lineups:null,lineupDetails:null});
const cup=match('cup','A','B',0,1,[scored('away','sB','Benito')],{competition:'CUP'});
const state={season:2027,edition:'Clausura',teams:club,fixtures:[a,b,old],cup:{fixtures:[cup]},postseason:{fixtures:[]},
world:{Varkosia:{fixtures:[],cup:{fixtures:[]},postseason:{fixtures:[]},archive:[]}},
archive:[{key:'2026-Apertura',season:2026,edition:'Apertura',fixtures:[match('oldmatch','A','B',1,0,[scored('home','aA','Arce')])],cup:{fixtures:[]},postseason:{fixtures:[]}}],
international:{season:2027,edition:'Clausura',champions:{fixtures:[]},horizonte:{fixtures:[]},
archive:[{key:'2026-Apertura',season:2026,edition:'Apertura',champions:{fixtures:[]},horizonte:{fixtures:[]}}]},
competitions:[{id:'CUSTOM1',name:'Copa vecinal',fixtures:[]}]};
const before=JSON.stringify(state),catalog=tournamentCatalog(state);
const get=(edition,country,kind)=>catalog.find(x=>x.edition===edition&&x.country===country&&x.kind===kind);
for(const [edition,country,kind] of [['2027-Clausura','Veltrania','primera'],['2027-Clausura','Veltrania','copa'],['2027-Clausura','Arcalis','campeones'],['2026-Apertura','Veltrania','primera'],['2026-Apertura','Arcalis','horizonte'],['2027-Clausura','Varkosia','primera'],['2027-Clausura','Personalizados','CUSTOM1']])
 assert.ok(get(edition,country,kind),'No aparece '+edition+' '+country+' '+kind);
const league=tournamentStatistics(state,get('2027-Clausura','Veltrania','primera'));
assert.equal(league.played,3);
assert.equal(league.goals,3);
assert.equal(league.individualGames,2);
assert.equal(league.rank.goals[0].name,'Alonso');
assert.equal(league.rank.goals[0].goals,3);
assert.equal(league.rank.assists[0].name,'Arce');
assert.equal(league.rank.assists[0].assists,2);
assert.equal(league.rank.cleanSheets[0].cleanSheets,3);
assert.equal(league.rank.goalkeepers[0].name,'Ana');
assert.equal(league.rank.goalkeepers[0].cleanSheets,2,'No inventar portero de resultado histórico');
assert.equal(league.rank.defenses[0].name,'A');
assert.ok(league.rank.rating.every(x=>x.rating>=3&&x.rating<=10));
const cupStats=tournamentStatistics(state,get('2027-Clausura','Veltrania','copa'));
assert.equal(cupStats.rank.goals[0].name,'Benito');
assert.equal(tournamentStatistics(state,get('2026-Apertura','Veltrania','primera')).rank.goals[0].name,'Arce');
assert.equal(tournamentStatistics(state,get('2027-Clausura','Personalizados','CUSTOM1')).played,0);
assert.equal(JSON.stringify(state),before,'Las estadísticas no alteran el guardado');
console.log('✅ Rankings separados por edición, país y competición');
console.log('✅ Goles, asistencias, índice de rendimiento, mejores defensas y vallas invictas');
console.log('✅ No se atribuyen goleadores o porteros a partidos históricos');
