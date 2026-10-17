/* Noveria 6.1 · Gerencia deportiva de club.
 * Acciones reales, con mercado, presupuesto, plantillas y registro persistente.
 */
import {ensureMarket,marketValuation} from './engine.js';
import {lineupState} from './lineup.js';

const id=x=>String(x??'');
const round=(x,n=3)=>+Number(x).toFixed(n);
const hash=value=>{let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const requireTeam=(s,name)=>{const t=s.teams?.[name];if(!t)throw Error('Elegí un club válido para gestionar');return t};
export function ensureSportingOffice(s){
 s.sportingOffice??={};s.sportingOffice.listings??={};s.sportingOffice.history??=[];
 return s.sportingOffice;
}
export function manageSportingClub(s,name){
 requireTeam(s,name);s.mode='manager';s.managedClub=name;
 ensureSportingOffice(s);return s.teams[name];
}
function controlled(s,name){
 const t=requireTeam(s,name);
 if(s.mode!=='manager'||s.managedClub!==name)throw Error('Primero asumí la gerencia de este club');
 return t;
}
function market(s,name){
 const t=controlled(s,name);ensureMarket(s);
 if(s.market.status!=='open')throw Error('Abrí una ventana de fichajes para efectuar salidas y contrataciones');
 return t;
}
function find(t,playerId){
 const p=t.players.find(p=>id(p.id)===id(playerId));
 if(!p)throw Error('Futbolista no encontrado en tu plantel');
 return p;
}
const log=(s,event)=>{const office=ensureSportingOffice(s);office.history.unshift({date:(s.edition||'Apertura')+' '+s.season,round:s.leagueRound,...event});office.history.length=Math.min(office.history.length,70)};
const announce=(s,title,description)=>{s.news??=[];s.news.unshift({id:'sport-'+s.season+'-'+hash(title+description+s.sportingOffice.history.length),category:'Mercado',title,description,date:(s.edition||'Apertura')+' '+s.season})};
export function renewSportingContract(s,name,playerId,wage,years){
 const t=controlled(s,name),p=find(t,playerId);
 if(p.loanParent)throw Error('No podés renovar a un jugador cedido por otro club');
 const salary=Number(wage),term=Number(years),old=Number(p.salary||50);
 if(!Number.isInteger(salary)||salary<15||salary>10000||!Number.isInteger(term)||term<1||term>5)throw Error('Ingresá un salario entero y un contrato de 1 a 5 años');
 if(salary<Math.ceil(old*.82))throw Error('El jugador rechaza una rebaja de salario tan grande');
 const fee=round(Math.max(.03,(salary-old>0?salary-old:0)*.0015+term*.014));
 if(Number(t.budget||0)<fee)throw Error('Presupuesto insuficiente para renovar: '+fee.toFixed(3)+' M VLR');
 p.salary=salary;p.contractYears=term;t.budget=round(Number(t.budget)-fee);
 log(s,{type:'renewal',club:name,player:p.name,fee,details:term+' años · '+salary+' mil VLR/mes'});
 announce(s,'✍ '+p.name+' renueva con '+name,'El futbolista firma hasta '+term+' años adicionales; salario '+salary+' mil VLR al mes.');
 return {player:p.name,fee,wage:salary,years:term};
}
export function toggleTransferList(s,name,playerId){
 const t=controlled(s,name),p=find(t,playerId),office=ensureSportingOffice(s);
 if(p.loanParent)throw Error('No podés vender a un jugador recibido a préstamo');
 const key=name+':'+id(playerId);
 if(office.listings[key]){delete office.listings[key];return false;}
 if(t.players.length<=17)throw Error('No se puede listar un futbolista con menos de 18 jugadores en plantilla');
 office.listings[key]={club:name,playerId:id(playerId),date:(s.edition||'Apertura')+' '+s.season,minimum:round(marketValuation(p)*.85,2)};
 return true;
}
export function sportingOffers(s,name,playerId){
 const t=controlled(s,name),p=find(t,playerId),office=ensureSportingOffice(s),key=name+':'+id(playerId);
 if(!office.listings[key]||p.loanParent)return [];
 if(t.players.length<=17)return [];
 const valuation=Math.max(.05,marketValuation(p));
 const candidates=Object.values(s.teams).filter(other=>
  other.name!==name&&other.players.length<30&&other.division!=='EXT'&&Number(other.budget||0)>=Math.max(.05,valuation*.8));
 return candidates.map(other=>{
  const taste=hash(other.name+'/'+p.id+'/'+s.season+'/'+(s.edition||'Apertura'))%100;
  const group=other.players.filter(x=>x.pos===p.pos),weak=group.length?Math.max(...group.map(x=>x.ovr)):0;
  const demand=(weak<p.ovr?22:0)+(other.rating<p.ovr?10:0)+(other.country!==t.country?7:0);
  return {other,taste,interest:taste+demand};
 }).filter(x=>x.interest>=63).sort((a,b)=>b.interest-a.interest||a.other.name.localeCompare(b.other.name)).slice(0,4).map(x=>{
  const raw=round(valuation*(.87+x.interest/390),2),fee=round(Math.min(raw,Number(x.other.budget)*.81),2);
  return {buyer:x.other.name,playerId:id(playerId),club:name,fee,interest:x.interest};
 }).filter(x=>x.fee>=Math.max(.05,valuation*.8,Number(office.listings[key]?.minimum||0)));
}
export function sellListedPlayer(s,name,playerId,buyer){
 const t=market(s,name),p=find(t,playerId),offer=sportingOffers(s,name,playerId).find(o=>o.buyer===buyer);
 if(!offer)throw Error('No hay oferta vigente de ese club para este jugador');
 if(t.players.length<=17)throw Error('No podés vender: dejarías al equipo con menos de 17 jugadores');
 const to=requireTeam(s,buyer);
 if(to.players.length>=30||to.budget<offer.fee)throw Error('El comprador no dispone de plazas o presupuesto');
 if(p.loanParent)throw Error('Un cedido no se puede vender');
 const idx=t.players.findIndex(x=>id(x.id)===id(playerId));
 const oldBudget=t.budget,toBudget=to.budget;
 if(idx<0)throw Error('Jugador ya no disponible');
 t.players.splice(idx,1);to.players.push(p);
 t.budget=round(Number(oldBudget)+offer.fee);to.budget=round(Number(toBudget)-offer.fee);
 p.signedBy=buyer;p.contractYears=Math.max(2,Number(p.contractYears)||2);
 const office=ensureSportingOffice(s);delete office.listings[name+':'+id(playerId)];
 const transfer={id:'sport-sale-'+(s.transfers.length+1)+'-'+hash(p.id),player:p.name,playerId:p.id,from:name,to:buyer,fee:offer.fee,method:'Venta negociada · gerencia deportiva',round:s.leagueRound,season:s.season};
 s.transfers.unshift(transfer);s.market.log.unshift(transfer);
 log(s,{type:'sale',club:name,player:p.name,other:buyer,fee:offer.fee});
 announce(s,'💰 '+p.name+' ficha por '+buyer,name+' acepta una oferta de '+offer.fee.toFixed(2)+' M VLR. Traspaso confirmado y presupuestos actualizados.');
 return transfer;
}
export function sportingSquad(s,name){
 const t=controlled(s,name),L=lineupState(t),office=ensureSportingOffice(s);
 const position=id=>L.starters.includes(id)?'Titular':L.bench.includes(id)?'Banca':'Reserva';
 const byRole=Object.fromEntries(t.players.map(p=>[id(p.id),position(id(p.id))]));
 return {name,count:t.players.length,budget:Number(t.budget||0),wages:t.players.reduce((sum,p)=>sum+Number(p.salary||0),0),L,byRole,
  listings:t.players.filter(p=>office.listings[name+':'+id(p.id)]).map(p=>id(p.id)),recent:office.history.filter(x=>x.club===name).slice(0,8)};
}
