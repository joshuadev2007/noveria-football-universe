/** NOVERIA · Ciclo cronológico Apertura/Clausura
 * Solo metadatos y tablas acumuladas; no modifica partidas antiguas.
 */
export const cyclePhase=s=>s?.edition==='Clausura'?'Clausura':'Apertura';
export const cycleKey=s=>String(Number(s?.season||2026))+'-'+cyclePhase(s);
export const cycleName=s=>cyclePhase(s)+' '+Number(s?.season||2026);
export const cycleNext=s=>cyclePhase(s)==='Apertura'
 ?{edition:'Clausura',season:Number(s?.season||2026)+1}
 :{edition:'Apertura',season:Number(s?.season||2026)};
export const cycleNextName=s=>{const n=cycleNext(s);return n.edition+' '+n.season;};
export const cycleIsAnnualFinal=s=>cyclePhase(s)==='Apertura';
export const previousSplit=s=>(s?.archive||[]).find(a=>
 a.edition==='Clausura'&&Number(a.season)===Number(s.season));
export const annualMatches=s=>{
 const current=(s?.fixtures||[]).filter(f=>f.competition==='LSV');
 if(cyclePhase(s)!=='Apertura'||Number(s.season)===2026)return current;
 const earlier=previousSplit(s);
 return earlier?[...(earlier.fixtures||[]).filter(f=>f.competition==='LSV'),...current]:current;
};
export const cycleDescription=s=>'Edición oficial '+cycleName(s);
