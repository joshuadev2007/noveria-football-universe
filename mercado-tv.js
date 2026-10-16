/**
 * Mercado 24 · Programa de fichajes ficticio del universo de Noveria.
 * Los rumores se construyen con jugadores y presupuestos EXISTENTES;
 * jamás cambian plantillas, contratos o resultados. Solo los fichajes
 * registrados en transfers son confirmados.
 */
function hash(text) {
 let h=2166136261;
 for(const ch of String(text)){h=Math.imul(h^ch.charCodeAt(0),16777619);}
 return h>>>0;
}
const select=(xs,key)=>xs.length?xs[hash(key)%xs.length]:null;
export function transferStudio(s,buyer) {
 const market=s.market||{};
 const clubs=Object.values(s.teams||{}).filter(t=>t&&Array.isArray(t.players)&&t.division!=='EXT');
 const seed=String(s.seed)+'/'+String(s.season)+'/'+String(market.cycle||0)+'/'+String(market.day||0);
 const buyers=clubs.filter(t=>t.players.length<30&&Number(t.budget||0)>0.15);
 const sellers=clubs.filter(t=>t.players.length>18);
 const rumors=[];const used=new Set();
 for(let n=0;n<48&&rumors.length<7;n++){
  const seller=select(sellers,seed+'/seller/'+n);
  if(!seller)break;
  const candidates=seller.players.filter(p=>p&&p.id&&p.pos!=='POR'&&!used.has(p.id));
  const p=select(candidates,seed+'/player/'+n);if(!p)continue;
  const fee=Number((Number(p.value||500)/1000*1.13).toFixed(2));
  const viable=buyers.filter(t=>t.name!==seller.name&&t.budget>=fee&&t.players.length<30&&t.name!==p.loanParent);
  const interested=select(viable,seed+'/buyer/'+n);
  if(!interested)continue;
  used.add(p.id);
  const mood=hash(seed+'/report/'+n)%4;
  rumors.push({
   id:'rumor-'+String(p.id),playerId:p.id,player:p.name,from:seller.name,to:interested.name,
   fee,position:p.pos,overall:p.ovr,
   confidence:43+hash(seed+'/confidence/'+n)%46,
   headline:[
    'Sondeo inicial: '+interested.name+' pregunta por '+p.name,
    'Operación en estudio: '+p.name+' interesa a '+interested.name,
    'Ojeadores de '+interested.name+' siguen a '+p.name,
    '¿Cambio de aires? '+p.name+' aparece en la agenda de '+interested.name
   ][mood]
  });
 }
 const confirmed=(s.transfers||[]).filter(t=>t&&t.player&&t.to).slice(0,10).map(t=>({
   player:t.player,from:t.from||'Sin club',to:t.to,
   fee:Number(t.fee||0),method:t.method||'Traspaso',day:t.day||null
 }));
 const offers=(market.offers||[]).filter(o=>o.buyer===buyer&&o.status==='counter');
 const buyerTeam=s.teams?.[buyer];
 return {
  host:'Nico Valcera',program:'MERCADO 24',season:s.season,
  day:Number(market.day||0),days:Number(market.maxDays||12),opened:market.status==='open',
  rumors,confirmed,offers,club:buyer,
  budget:Number(buyerTeam?.budget||0),squad:Number(buyerTeam?.players?.length||0)
 };
}
export function signingAdvice(s,buyer,player,seller){
 const target=s.teams?.[buyer],from=s.teams?.[seller];
 if(!target)return {ok:false,message:'Elegí un club comprador.'};
 if(!player||!from||seller===buyer)return {ok:false,message:'Seleccioná un futbolista de otro club.'};
 if(s.market?.status!=='open')return {ok:false,message:'Mercado cerrado: tocá «Abrir ventana de pases» para fichar.'};
 if(target.players.length>=30)return {ok:false,message:'Plantilla completa (30/30). Liberá o vendé un futbolista primero.'};
 if(from.players.length<=17)return {ok:false,message:'El club vendedor no puede bajar de 17 futbolistas. Probá otro jugador.'};
 const value=Number((Number(player.value||500)/1000).toFixed(2));
 const budget=Number(target.budget||0);
 if(budget<Math.max(.05,value*.76))return {ok:false,message:'El fichaje supera tu presupuesto. Buscá un jugador más económico o un agente libre.'};
 return {ok:true,message:'Podés presentar una oferta. El vendedor podría pedir una contraoferta.',suggested:Math.min(budget,Number((value*1.14).toFixed(2))),value};
}
