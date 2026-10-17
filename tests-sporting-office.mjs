import assert from 'node:assert/strict';
import {freshState,openMarket,marketValuation} from './engine.js';
import {ensureExtraMarket,releaseToMarket,signFreeAgent} from './market-extra.js';
import {lineupState,chooseLineup,matchLineup} from './lineup.js';
import {ensureSportingOffice,manageSportingClub,sportingSquad,toggleTransferList,sportingOffers,sellListedPlayer,renewSportingContract} from './sporting-director.js';

const s=ensureExtraMarket(freshState()),name='Unión Popular Aurena',t=s.teams[name];
const historical=s.fixtures.filter(m=>m.legacy&&m.round<=6).map(m=>[m.id,m.scoreH,m.scoreA]);
assert.equal(s.mode,'president');
const selected=manageSportingClub(s,name);
assert.equal(selected.name,name);
assert.equal(s.mode,'manager');
assert.equal(s.managedClub,name);
assert.equal(t.lineup,undefined,'Las partidas viejas no requieren un nuevo esquema obligatorio');
const benchPlayer=t.players[19];
chooseLineup(s,name,'bench',2,benchPlayer.id);
assert.ok(lineupState(t).bench.includes(String(benchPlayer.id)));
const idset=new Set([...lineupState(t).starters,...lineupState(t).bench,...lineupState(t).reserves]);
assert.equal(idset.size,t.players.length);
assert.ok(matchLineup(t).bench.some(p=>String(p.id)===String(benchPlayer.id)));

// Contratos con salario, años y costo reflejado en el presupuesto.
const p=t.players[15],costBefore=t.budget;
const renewed=renewSportingContract(s,name,p.id,Math.ceil(p.salary*1.2),4);
assert.equal(p.contractYears,4);
assert.equal(p.salary,renewed.wage);
assert.ok(t.budget<costBefore);
assert.throws(()=>renewSportingContract(s,name,p.id,-7,12),/Ingresá un salario/);
assert.throws(()=>renewSportingContract(s,'Atlético Aurena',s.teams['Atlético Aurena'].players[0].id,75,2),/asumí la gerencia/);

// Las operaciones de venta requieren mercado, comprador y fondos.
assert.equal(toggleTransferList(s,name,p.id),true);
assert.ok(sportingSquad(s,name).listings.includes(String(p.id)));
assert.throws(()=>sellListedPlayer(s,name,p.id,'Atlético Aurena'),/Abrí una ventana/);
openMarket(s,'Gerencia de test');
let offers=sportingOffers(s,name,p.id);
if(!offers.length){
 for(const candidate of Object.values(s.teams).filter(x=>x.name!==name).slice(0,40))candidate.budget=100;
 offers=sportingOffers(s,name,p.id);
}
assert.ok(offers.length>0,'Al menos un club solvente debe poder hacer una propuesta');
const candidate=offers[0],buyer=s.teams[candidate.buyer],beforeBuyer=buyer.budget,beforeSeller=t.budget;
const transfer=sellListedPlayer(s,name,p.id,candidate.buyer);
assert.equal(transfer.to,candidate.buyer);
assert.equal(transfer.fee,candidate.fee);
assert.ok(!t.players.some(x=>String(x.id)===String(p.id)));
assert.ok(buyer.players.some(x=>String(x.id)===String(p.id)));
assert.ok(Math.abs(t.budget-beforeSeller-transfer.fee)<.002);
assert.ok(Math.abs(beforeBuyer-buyer.budget-transfer.fee)<.002);
assert.ok(!sportingSquad(s,name).listings.includes(String(p.id)));
assert.throws(()=>sellListedPlayer(s,name,p.id,candidate.buyer));
assert.ok(s.market.log.some(x=>x.playerId===p.id));

// Rescisiones y agentes libres siguen utilizando el mercado y límites reales.
const removable=t.players.at(-1),original=t.players.length;
releaseToMarket(s,name,removable.id);
assert.equal(t.players.length,original-1);
assert.ok(s.freeAgents.some(p=>String(p.id)===String(removable.id)));
signFreeAgent(s,name,removable.id);
assert.equal(t.players.length,original);
assert.equal(t.players.some(p=>String(p.id)===String(removable.id)),true);
const snapshot=JSON.parse(JSON.stringify(s));
assert.equal(snapshot.sportingOffice.history.length,2);
assert.ok(snapshot.sportingOffice.history.some(x=>x.type==='renewal'));
assert.ok(snapshot.sportingOffice.history.some(x=>x.type==='sale'));
assert.deepEqual(s.fixtures.filter(m=>m.legacy&&m.round<=6).map(m=>[m.id,m.scoreH,m.scoreA]),historical);

// Solo el nuevo club elegido se puede administrar en modo DT.
manageSportingClub(s,'Atlético Aurena');
assert.throws(()=>toggleTransferList(s,name,t.players[0].id),/asumí la gerencia/);
console.log('✅ GERENCIA: selección de club, titulares, siete suplentes, contratos');
console.log('✅ VENTAS: ofertas solventes, presupuesto, transferencias y rescisiones');
console.log('✅ PARTIDAS: guardado JSON y resultados históricos inalterados');
