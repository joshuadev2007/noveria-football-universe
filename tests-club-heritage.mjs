import assert from 'node:assert/strict';
import {freshState,startNextSeason} from './engine.js';
import {ensureContinent} from './continent.js';
import {ensureClubHeritage,recordPlayerMatch,recordPlayerEvent,retirePlayer,teamSeasonHistory,clubHonours,clubLegends,retiredPlayersForCountry,careerLeaders} from './club-heritage.js';

const clubName='Unión Popular Aurena';
const s=freshState(),team=s.teams[clubName],p=team.players[0];
p.age=38;p.retirementAge=41;p.apps=100;p.goals=30;p.assists=20;
ensureClubHeritage(s);
p.apps++;recordPlayerMatch(s,clubName,p,true);p.goals++;recordPlayerEvent(s,clubName,p,'goal');p.assists++;recordPlayerEvent(s,clubName,p,'assist');
assert.equal(p.clubCareer[clubName].apps,101,'Se registra la participación por club');
assert.equal(p.clubCareer[clubName].goals,31,'Se registran los goles por club');
assert.equal(p.clubCareer[clubName].assists,21,'Se registran las asistencias por club');
s.honours.push({title:'Copa de Prueba',winner:clubName,season:'2026',edition:'Apertura'});
team.trophies.push('Copa de Prueba · 2026');
assert.ok(clubHonours(s,clubName).some(x=>x.title.includes('Copa de Prueba')));
assert.ok(teamSeasonHistory(s,clubName).length,'El club dispone de historial de temporadas');
assert.ok(clubLegends(s,clubName).some(x=>x.p.id===p.id&&x.isLegend),'Los jugadores con trayectoria se reconocen como leyendas');
const retired=retirePlayer(s,clubName,p.id);
assert.equal(retired.lastClub,clubName);
assert.equal(retired.careerTotals.apps,p.apps);
assert.equal(retired.careerTotals.goals,p.goals);
assert.ok(!team.players.some(x=>x.id===p.id),'El retirado sale de la plantilla');
assert.ok(s.heritage.retiredPlayers.some(x=>x.playerId===p.id),'La ficha se conserva en el archivo');
assert.ok(retiredPlayersForCountry(s,'Veltrania').some(x=>x.playerId===p.id));
assert.ok(careerLeaders(s,'goals',5).some(x=>x.playerId===p.id),'Los retirados permanecen en los récords históricos');

const bad=team.players.find(x=>x.age<37);if(bad){assert.throws(()=>retirePlayer(s,clubName,bad.id),/37 y 41/,'No se permite retirar antes de los 37 años');}
const automatic=freshState();automatic.postseason.stage='finalizada';automatic.market.status='closed';
const veteran=automatic.teams[clubName].players[0];veteran.age=40;veteran.retirementAge=40;const veteranId=veteran.id;
startNextSeason(automatic);
const archived=automatic.heritage.retiredPlayers.find(x=>x.playerId===veteranId);
assert.ok(archived,'El retiro automático se ejecuta al avanzar de edición');
assert.equal(archived.retirementAge,41,'La edad de retiro queda archivada');
assert.ok(automatic.teams[clubName].players.length>=17,'La plantilla mantiene un mínimo funcional de futbolistas');

const international=ensureContinent(freshState());
const foreign=Object.values(international.teams).find(t=>t.country==='Varkosia');
assert.ok(foreign,'El universo incluye los países internacionales');
const foreignHistory=teamSeasonHistory(international,foreign.name);
assert.ok(foreignHistory.some(row=>row.matches>0),'El historial también consulta los partidos del país extranjero');
console.log('✅ Historial temporada a temporada y palmarés de clubes');
console.log('✅ Estadísticas individuales por club, leyendas y líderes históricos');
console.log('✅ Retiro voluntario entre 37 y 41 y archivo permanente de carrera');
console.log('✅ Retiro automático al avanzar temporada y plantilla funcional');
console.log('✅ Historial de Veltrania y de países internacionales');
