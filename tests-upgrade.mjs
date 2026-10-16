import assert from 'node:assert/strict';
import {freshState,createCompetition,simulateCustomRound,simulateLeagueRound,standings,played} from './engine.js';
const groups={recopa:2,league2:6,groups:12,cup:7,league:5};
for (const [format,n] of Object.entries(groups)) {
 let s=freshState();const names=Object.keys(s.teams).slice(0,n);
 const id=createCompetition(s,'Prueba '+format,names,format),c=s.competitions.at(-1);
 let rounds=0;while(!c.champion&&rounds<36){const matches=simulateCustomRound(s,id);assert(matches.length>0);assert(matches.every(played));rounds++;}
 assert(c.champion,format+' championship incomplete');assert(s.teams[c.champion].trophies.includes(c.name+' · 2026'));assert.equal(s.honours.length,1);
 console.log(format, 'clubes=',n, 'rondas=',rounds, 'partidos=',c.fixtures.length,'campeón=',c.champion);
 if(format==='league2')for(const name of names){const games=c.fixtures.filter(f=>[f.home,f.away].includes(name));assert.equal(games.filter(f=>f.home===name).length,n-1);assert.equal(games.filter(f=>f.away===name).length,n-1);}
}
const x=freshState(),vs=Object.keys(x.teams).slice(0,6);
for(const [fmt,bad] of [['recopa',vs],['groups',vs]]){assert.throws(()=>createCompetition(x,'fallo',bad,fmt));}
console.log('Todos los formatos avanzados: OK');
