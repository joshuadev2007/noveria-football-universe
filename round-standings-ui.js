import {standingsForResults} from './round-standings.js';
/** Tarjetas de clasificación tras cada fecha. Solo HTML, no modifica estado. */
const escapeHTML=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const spotClass=s=>['advance','wildcard','playoff','danger'].includes(s)?'rs-'+s:'';
function labels(r){
 if(!r.spot||r.spot==='none')return '<span class="rs-none">—</span>';
 return `<span class="rs-status ${spotClass(r.spot)}" title="${r.confirmed?'Cupo confirmado':'Posición provisional'}">${escapeHTML(r.status)}${r.confirmed?' ✓':''}</span>`;
}
function table(panel){
 const elimination=panel.competition==='knockout';
 const head=elimination?'<th>#</th><th>Equipo</th><th>PJ</th><th>GF</th><th>GC</th><th>DG</th><th>Estado</th>':
 '<th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>PTS</th><th>Zona</th>';
 const row=(r,i)=>{
  const cells=elimination?`<td>${r.gf||0}</td><td>${r.gc||0}</td><td>${r.gd>0?'+':''}${r.gd||0}</td>`:
   `<td>${r.w||0}</td><td>${r.d||0}</td><td>${r.l||0}</td><td>${r.gd>0?'+':''}${r.gd||0}</td><td class="bold gold">${Number.isFinite(r.pts)?r.pts:'—'}</td>`;
  return `<tr class="${spotClass(r.spot)} ${r.name==='Unión Popular Aurena'?'highlight':''}"><td>${i+1}</td><td class="rs-team"><span data-action="club" data-name="${escapeHTML(r.name)}" class="link">${r.name==='Unión Popular Aurena'?'🔴 ':''}${escapeHTML(r.name)}</span></td><td>${r.pj||0}</td>${cells}<td>${labels(r)}</td></tr>`;
 };
 return `<article class="rs-panel"><h4>${escapeHTML(panel.name)}</h4><div class="tablewrap rs-scroll"><table class="rs-table"><thead><tr>${head}</tr></thead><tbody>${panel.rows.map(row).join('')}</tbody></table></div><p class="muted tiny rs-note">${escapeHTML(panel.desc)}</p></article>`;
}
export function roundTablesHTML(s,playedMatches,event,country){
 const panels=standingsForResults(s,playedMatches,event,country);
 if(!panels.length)return `<section class="card rs-no-table"><h2 class="h2">📊 Clasificación de la jornada</h2><p class="muted small">Este turno no tiene tabla de puntos. Podés consultar los partidos y sus periódicos arriba.</p></section>`;
 const groups=[];
 for(const p of panels){const id=p.area+'|'+p.competition;let g=groups.find(x=>x.id===id);
  if(!g){g={id,area:p.area,type:p.competition,panels:[]};groups.push(g);}
  g.panels.push(p);
 }
 const names={league:'Ligas, ascensos y tabla anual',cup:'Copa Nacional',international:'Copas de Arcalis',knockout:'Eliminatorias y clasificados',custom:'Torneo personalizado'};
 const legends=`<div class="rs-legend"><span><i class="rs-dot advance"></i> Clasifica</span><span><i class="rs-dot wildcard"></i> Cupo extra / Horizonte</span><span><i class="rs-dot playoff"></i> Repechaje</span><span><i class="rs-dot danger"></i> Descenso</span></div>`;
 return `<section class="rs-after-round" aria-label="Clasificaciones después de simular"><div class="card rs-head"><div class="eyebrow">DESPUÉS DE LA JORNADA · ${escapeHTML(country)}</div><h2 class="h2">📊 Así quedan las tablas de posiciones</h2><p class="muted small">Los puestos marcados son provisionales hasta que termine la fase. En copas eliminatorias ves los clubes que avanzan en lugar de puntos de liga.</p>${legends}</div>
 ${groups.map((g,i)=>`<details class="rs-country" ${country!=='Todos'||i===0?'open':''}><summary><span>🌍 ${escapeHTML(g.area)} · ${escapeHTML(names[g.type]||g.type)}</span><span class="rs-count">${g.panels.length} tabla${g.panels.length===1?'':'s'} <span aria-hidden="true">⌄</span></span></summary><div class="rs-panels">${g.panels.map(table).join('')}</div></details>`).join('')}
 </section>`;
}
