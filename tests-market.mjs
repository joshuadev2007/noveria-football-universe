import assert from 'node:assert/strict';
import {freshState,ensureMarket,openMarket,marketValuation,submitMarketOffer,acceptMarketCounter,advanceMarketDay,finishMarket,trainClub,simulateLeagueRound,standings} from './engine.js';
// Garantizar que las partidas guardadas de V2 no pierdan fichajes, jugadores ni partidos.
const old=freshState();delete old.market;assert.equal(ensureMarket(old).market.status,'closed');assert.equal(standings(old,'annual')[0].name,'Real Monteluz');
let s=freshState();s.mode='manager';s.managedClub='Unión Popular Aurena';
openMarket(s,'Primera ventana');assert.equal(s.market.day,1);
const seller='Atlético Aurena',buyer='Unión Popular Aurena',p=s.teams[seller].players[3],ovr=p.ovr;
const amount=marketValuation(p);
assert.throws(()=>submitMarketOffer(s,{buyer:'Náutico Caldera',seller,playerId:p.id,fee:amount*3,wage:200,years:3}),/modo DT/);
let offer=submitMarketOffer(s,{buyer,seller,playerId:p.id,fee:+(amount*0.95).toFixed(2),wage:p.salary*2,years:3});
assert(['counter','accepted'].includes(offer.status));
if(offer.status==='counter')acceptMarketCounter(s,offer.id);
assert(s.teams[buyer].players.some(x=>x.id===p.id));assert(!s.teams[seller].players.some(x=>x.id===p.id));
assert.equal(s.teams[buyer].players.find(x=>x.id===p.id).ovr,ovr);
assert(s.transfers.some(x=>x.playerId===p.id));
const trained=trainClub(s,buyer);assert(trained.length>0);assert.throws(()=>trainClub(s,buyer));
const before=s.transfers.length;let round=advanceMarketDay(s);assert.equal(round.day,1);assert.equal(s.market.day,2);
const final=finishMarket(s);assert(final.report);assert.equal(s.market.status,'closed');assert(final.report.transfers>=1);assert(s.transfers.length>=before);
assert.throws(()=>submitMarketOffer(s,{buyer,seller,playerId:p.id,fee:1,wage:100,years:3}),/cerrado/);
const next=simulateLeagueRound(s);assert.equal(next.round,7);assert.equal(next.matches.length,13);
const sum=Object.values(s.teams).reduce((x,t)=>x+t.players.length,0);assert.equal(sum,1320,'jugadores no desaparecen al transferir');
for(const t of Object.values(s.teams)){assert(t.budget>=0,t.name+' presupuesto negativo');assert(t.players.length>=17&&t.players.length<=30,t.name+' plantilla inválida');}
// Comportamiento al terminar la liga: mercado oficial se abre sin intervención.
let full=freshState();while(full.leagueRound<18)simulateLeagueRound(full);assert.equal(full.market.status,'open');assert.equal(full.market.cycle,1);assert.equal(full.market.title,'Mercado de verano · tras el Apertura 2026');
console.log('MERCADO COMPLETO OK · ofertas, contraofertas, Modo DT, desarrollo, día límite, fin de mercado, 60 plantillas y Jornada 18');
