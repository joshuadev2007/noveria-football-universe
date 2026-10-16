/** Noveria · Eliminatorias de la Liga Suprema.
 * 4 mejores de cada grupo; siembra general 1–8 por rendimiento.
 * Ida y vuelta: el mejor sembrado empieza fuera y cierra de local.
 * Los torneos empezados no se reconstruyen.
 */
export function leaguePlayoffSeeds(rowsA,rowsB){
 const topA=(rowsA||[]).slice(0,4).map((r,i)=>({...r,group:'A',groupPlace:i+1}));
 const topB=(rowsB||[]).slice(0,4).map((r,i)=>({...r,group:'B',groupPlace:i+1}));
 if(topA.length!==4||topB.length!==4)throw Error('Se necesitan los cuatro clasificados de cada grupo');
 const seeds=[...topA,...topB].sort((a,b)=>
  Number(b.pts||0)-Number(a.pts||0)||
  Number(b.gd||0)-Number(a.gd||0)||
  Number(b.gf||0)-Number(a.gf||0)||
  Number(b.w||0)-Number(a.w||0)||
  a.groupPlace-b.groupPlace||
  String(a.name).localeCompare(String(b.name),'es'));
 if(new Set(seeds.map(t=>t.name)).size!==8)throw Error('La fase final necesita ocho equipos diferentes');
 return seeds.map((team,i)=>({...team,seed:i+1}));
}
export function leaguePlayoffPairs(ordered){
 if(!Array.isArray(ordered)||ordered.length!==8)throw Error('Los cuartos requieren ocho clasificados');
 return [[ordered[0],ordered[7]],[ordered[1],ordered[6]],[ordered[2],ordered[5]],[ordered[3],ordered[4]]];
}
export function leaguePlayoffReseed(qualified,seeds){
 if(!Array.isArray(qualified)||qualified.length!==4)throw Error('Las semifinales requieren cuatro clasificados');
 if(new Set(qualified).size!==4)throw Error('Los semifinalistas deben ser distintos');
 const order=new Map(seeds.map((name,index)=>[name,index]));
 const sorted=[...qualified].sort((a,b)=>(order.get(a)??99)-(order.get(b)??99));
 return [[sorted[0],sorted[3]],[sorted[1],sorted[2]]];
}
export function leaguePlayoffFinal(qualified,seeds){
 if(!Array.isArray(qualified)||qualified.length!==2)throw Error('La final necesita dos clasificados');
 const order=new Map(seeds.map((name,index)=>[name,index]));
 const sorted=[...qualified].sort((a,b)=>(order.get(a)??99)-(order.get(b)??99));
 return sorted;
}
