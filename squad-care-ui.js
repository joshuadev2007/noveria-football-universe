/** Noveria · panel de enfermería y observatorio de renovaciones.
 * El análisis es informativo; no firma contratos sin confirmación.
 */
import {activeMedicalCases,MEDICAL_CARE_COST,squadAnalysis} from './squad-care.js';
const safe=v=>String(v??'');
const round=v=>(Number(v)||0).toFixed(1);
function clubChoice(s,name,id,E){
 if(s.mode==='manager')return '<span class="tag greentag">🎩 CLUB DIRIGIDO</span>';
 return `<label class="field"><span>Club que querés analizar</span><select id="${id}">${Object.values(s.teams).map(t=>`<option value="${E(t.name)}" ${t.name===name?'selected':''}>${E(t.name)} · ${E(t.country)}</option>`).join('')}</select></label>`;
}
export function renderMedicalPage(s,ui,{E,button,head,stat,trainingPlan}){
 const name=s.mode==='manager'?(s.managedClub||ui.team):(s.teams[ui.careClub]?ui.careClub:(s.managedClub||ui.team));
 const t=s.teams[name];if(!t)return '<div class="card">Club desconocido</div>';
 const cases=activeMedicalCases(s,name),treatable=cases.filter(c=>c.availableForTreatment),undx=cases.filter(c=>!c.isInjury);
 const medical=Number(t.facility?.medical||1),cost=MEDICAL_CARE_COST(medical),plan=trainingPlan(t);
 const unavailable=cases.length,fit=(t.players||[]).filter(p=>Number(p.outGames||0)<=0&&Number(p.fitness??90)<65);
 const card=c=>{const p=c.player,f=Number(p.fitness??90),risk=p.medicalCase?.diagnosis||'No consta diagnóstico médico';return `<article class="care-patient">
   <div class="between"><div><span class="eyebrow">${c.isInjury?'🩺 LESIÓN DOCUMENTADA':'⚠ BAJA SIN DIAGNÓSTICO'}</span><h3>${E(p.name)}</h3><p>${E(p.pos)} · OVR ${Number(p.ovr||0)} / POT ${Number(p.pot||0)} · ${Number(p.age||0)} años</p></div><span class="tag ${c.isInjury?'goldtag':''}">${c.remaining} partido${c.remaining===1?'':'s'} de baja</span></div>
   <p class="muted small">${E(c.status)} · ${E(risk)} · Condición física: ${Math.round(f)}%</p>
   <div class="care-gauge"><span style="width:${Math.max(3,Math.min(100,f))}%"></span></div>
   ${c.availableForTreatment?button('🩹 Tratamiento · '+cost.toFixed(3)+' M','medical-treat',`data-club="${E(name)}" data-id="${E(p.id)}"`,'btn primary sm')
   :c.isInjury?'<span class="muted small">Tratamiento aplicado o sanción pendiente. Continuá el reposo entre jornadas.</span>'
   :'<span class="muted small">No se puede aplicar terapia sin diagnóstico. Si es una sanción, debe cumplirse.</span>'}
  </article>`;};
 const history=(t.medicalHistory||[]).slice(0,7);
 return `<div class="stack">${head('🏥 Enfermería y recuperación','Tratamientos supervisados, descanso, bajas documentadas y control del físico para partidos futuros.')}
 <div class="care-hero"><div><span class="eyebrow">NOVERIA · CENTRO MÉDICO</span><h2>${E(name)}</h2><p>Nivel de instalaciones médicas: ${medical} · Plan activo: ${E(plan)}</p></div>${clubChoice(s,name,'careClubSelect',E)}</div>
 <div class="grid four">${stat('Jugadores de baja',unavailable,'Lesiones o sanciones')}${stat('Lesiones tratables',treatable.length,'Diagnóstico confirmado')}${stat('Físico bajo',fit.length,'Menos de 65%')}${stat('Tratamiento',cost.toFixed(3)+' M','Costo por lesión')}</div>
 <section class="card"><div class="between"><div><h2 class="h2">🩺 Parte médico y jugadores de baja</h2><p class="muted small">Las lesiones afectan la disponibilidad real. Una terapia puede ahorrar ${medical>=4?'hasta 2 partidos':'1 partido'} de baja, una sola vez por lesión; no borra las tarjetas ni las sanciones.</p></div><span class="tag">${unavailable} pacientes</span></div>
 ${cases.length?`<div class="care-patients">${cases.map(card).join('')}</div>`:'<div class="notice">✅ ¡Sin bajas activas! Tu plantel no tiene lesiones ni sanciones pendientes.</div>'}
 ${undx.length?'<p class="muted small">💡 Las bajas anteriores a esta actualización pueden no incluir un diagnóstico. Para no curar una sanción por error, únicamente tratamos lesiones nuevas identificadas por el motor.</p>':''}</section>
 <div class="grid two"><section class="card"><h2 class="h2">🛏️ Plan de recuperación</h2><p class="muted small">El descanso mejora la condición física durante el avance normal del calendario, sin simular ni adelantar partidos.</p><div class="controls">${button(plan==='Recuperación'?'✓ Recuperación activa':'🛌 Activar descanso','medical-recovery-plan',`data-club="${E(name)}" ${plan==='Recuperación'?'disabled':''}`,'btn primary')}${button('📋 Preparar rotaciones','lineup-care-suggest','','btn')}</div><p class="muted small">Mejorá instalaciones médicas desde <b>Estadios y finanzas</b> para obtener tratamientos más eficientes y una recuperación habitual mejor.</p>${button('🏟️ Mejorar instalaciones','nav','data-target="estadios"','btn sm')}</section>
 <section class="card"><h2 class="h2">📒 Historial de tratamientos</h2>${history.length?history.map(x=>`<div class="care-log"><strong>${E(x.name)}</strong><span>${Number(x.games||0)} partido(s) recuperado(s) · ${Number(x.cost||0).toFixed(3)} M · ${E(x.edition)}</span></div>`).join(''):'<p class="muted small">Todavía no se han realizado tratamientos.</p>'}
 <div class="controls">${button('📊 Analizar plantilla','nav','data-target="analisis"','btn primary')}${button('📅 Calendario','nav','data-target="calendario"','btn')}</div></section></div>
 </div>`;
}
export function renderAnalysisPage(s,ui,{E,button,head,stat,marketValuation,lineupState,fixtures}){
 const name=s.mode==='manager'?(s.managedClub||ui.team):(s.teams[ui.analysisClub]?ui.analysisClub:(s.managedClub||ui.team));
 const t=s.teams[name];if(!t)return '<div class="card">Club desconocido</div>';
 const report=squadAnalysis(s,name,fixtures),roles=lineupState(t);
 const q=safe(ui.analysisQuery).trim().toLocaleLowerCase('es');
 const filtered=report.rows.filter(x=>!q||(x.name+' '+x.position+' '+x.label).toLocaleLowerCase('es').includes(q))
 .filter(x=>ui.analysisFilter==='todos'||(ui.analysisFilter==='contratos'&&x.contractYears!==null&&x.contractYears<=1)||(ui.analysisFilter==='bajas'&&x.roundsOut>0)||
  (ui.analysisFilter==='promesas'&&x.age<=23&&x.upside>=8)||(ui.analysisFilter==='titulares'&&roles.starters.includes(x.id)));
 const sort=ui.analysisSort||'prioridad';
 filtered.sort((a,b)=>sort==='ovr'?b.ovr-a.ovr:sort==='goles'?b.goals-a.goals:sort==='forma'?b.form-a.form:
  sort==='contrato'?(a.contractYears??999)-(b.contractYears??999):sort==='pj'?b.apps-a.apps:
  sort==='salario'?b.salary-a.salary:b.weight-a.weight||b.ovr-a.ovr);
 const pos=id=>roles.starters.includes(id)?'Titular':roles.bench.includes(id)?'Banca':'Reserva';
 const show=p=>`<tr><td class="care-player-name"><strong>${E(p.name)}</strong><small>${E(pos(p.id))} · ${p.age} años</small></td>
 <td>${E(p.position)}</td><td class="bold">${p.ovr}</td><td>${p.pot}</td><td>${p.apps}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.form.toFixed(1)}</td><td>${p.fitness}%</td><td>${p.contractYears===null?'—':p.contractYears+' a.'}</td><td>${p.salary} mil</td>
 <td><span class="tag ${p.label==='Prioridad renovar'?'goldtag':''}">${E(p.label)}</span></td>
 <td>${button('📈 Informe','stats-player',`data-id="${E(p.id)}"`,'btn sm')}${!p.loan&&s.mode==='manager'&&s.managedClub===name?button('✍ Renovar','sporting-renew',`data-id="${E(p.id)}"`,'btn primary sm'):''}</td></tr>`;
 const risk=report.rows.filter(x=>x.contractYears!==null&&x.contractYears<=1&&!x.loan).slice(0,5);
 const elite=[...report.rows].sort((a,b)=>b.goals+b.assists-a.goals-a.assists||b.ovr-a.ovr).slice(0,3);
 return `<div class="stack">${head('📊 Laboratorio de plantilla y contratos','Analizá rendimiento, minutos, forma, valor de mercado y vencimientos antes de renovar.')}
 <div class="care-hero"><div><span class="eyebrow">OBSERVATORIO DE FUTBOLISTAS</span><h2>${E(name)}</h2><p>${E(s.edition||'Apertura')} ${s.season} · Comparación de contrato, potencial y rendimiento</p></div>${clubChoice(s,name,'analysisClubSelect',E)}</div>
 <div class="grid four">${stat('Plantilla',report.rows.length,'Futbolistas profesionales')}${stat('Por vencer',report.expiring,'Contratos con ≤ 1 año documentado')}${stat('Nómina mensual',report.payroll.toLocaleString('es-CR')+' mil','VLR por mes')}${stat('Actas consultadas',report.gameCount,'Incluye archivo disponible')}</div>
 <div class="grid two"><section class="card"><h2 class="h2">✍ Prioridades de contrato</h2>${risk.length?risk.map(p=>`<div class="care-insight"><strong>${E(p.name)} · ${E(p.label)}</strong><span>${E(p.reason)} · Salario ${p.salary} mil</span></div>`).join(''):'<p class="muted small">No hay contratos con un año o menos registrados.</p>'}</section>
 <section class="card"><h2 class="h2">⚽ Aportes destacados</h2>${elite.map(p=>`<div class="care-insight"><strong>${E(p.name)}</strong><span>${p.goals} goles · ${p.assists} asistencias · ${p.apps} PJ · OVR ${p.ovr}</span></div>`).join('')}
 <p class="muted small">La valoración es una sugerencia deportiva, no una predicción ni una renovación automática.</p></section></div>
 <section class="card"><div class="between"><div><h2 class="h2">📈 Estadísticas completas de la plantilla</h2><p class="muted small">PJ/G/A desde los registros del futbolista. Minutos, desglose por competición y tarjetas por partido únicamente cuando existe acta detallada.</p></div><span class="tag">${filtered.length} jugadores</span></div>
 <div class="care-filters"><label class="field"><span>Buscar</span><input class="input" id="analysisSearch" value="${E(ui.analysisQuery||'')}" placeholder="Jugador, posición o criterio"></label><label class="field"><span>Ver</span><select id="analysisFilter">${[['todos','Toda la plantilla'],['contratos','Contratos por vencer'],['titulares','Solo titulares'],['promesas','Jóvenes con potencial'],['bajas','Jugadores de baja']].map(([id,text])=>`<option value="${id}" ${ui.analysisFilter===id?'selected':''}>${text}</option>`).join('')}</select></label><label class="field"><span>Ordenar</span><select id="analysisSort">${[['prioridad','Prioridad de renovación'],['ovr','Mayor OVR'],['goles','Más goles'],['pj','Más partidos'],['forma','Mejor forma'],['contrato','Contrato más corto'],['salario','Mayor sueldo']].map(([id,text])=>`<option value="${id}" ${ui.analysisSort===id?'selected':''}>${text}</option>`).join('')}</select></label></div>
 <div class="tablewrap care-table-wrap"><table class="care-table"><thead><tr><th>Jugador</th><th>Pos.</th><th>OVR</th><th>POT</th><th>PJ</th><th>G</th><th>A</th><th>Forma</th><th>Físico</th><th>Contrato</th><th>Sueldo</th><th>Diagnóstico</th><th>Acciones</th></tr></thead><tbody>${filtered.map(show).join('')}</tbody></table></div>
 ${!filtered.length?'<p class="notice">No hay jugadores con estos filtros.</p>':''}
 <div class="controls">${button('📋 Sugerencias para el XI','lineup-stats-suggest','','btn primary')}${button('🏥 Enfermería','nav','data-target="enfermeria"','btn')}${button('💼 Gerencia deportiva','nav','data-target="gerencia"','btn')}</div></section>
 </div>`;
}
export function renderPlayerInsight(s,clubName,pid,helpers){
 const {E,button,marketValuation,lineupState}=helpers;
 const t=s.teams[clubName];if(!t)return '<p>Club desconocido</p>';
 const fixtures=helpers.fixtures||[],p=squadAnalysis(s,clubName,fixtures).rows.find(p=>p.id===String(pid));
 if(!p)return '<p>Jugador no encontrado.</p>';
 const details=Object.entries(p.competitions).sort((a,b)=>b[1]-a[1]);
 const valuation=marketValuation(p.raw);
 return `<article class="care-player-profile">
  <h2>${E(p.name)}</h2><p class="muted">#${E(p.number||'—')} · ${E(p.position)} · ${p.age} años · ${E(t.name)}</p>
  <div class="grid three">
   <div class="card stat"><div class="label">OVR / Potencial</div><div class="big">${p.ovr} / ${p.pot}</div><p class="muted small">Margen +${p.upside}</p></div>
   <div class="card stat"><div class="label">PJ · Goles · Asis.</div><div class="big">${p.apps} · ${p.goals} · ${p.assists}</div></div>
   <div class="card stat"><div class="label">Forma / Físico</div><div class="big">${p.form.toFixed(1)} / ${p.fitness}%</div></div>
  </div>
  <h3>📑 Contrato y valor</h3><p><b>${p.contractYears===null?'Duración no registrada':p.contractYears+' años'}</b> restantes o pendientes de verificar · <b>${p.salary} mil VLR/mes</b> · Valor estimado <b>${valuation.toFixed(2)} M VLR</b>.</p>
  <p><b>Informe:</b> ${E(p.label)}. ${E(p.reason)}</p>
  <h3>🎯 Rendimiento y disponibilidad</h3>
  <p>Minutos constatados: <b>${p.minuteCount}</b> · Titularidades en actas: <b>${p.starts}</b> · G/90: <b>${p.gPer90??'Sin datos'}</b> · A/90: <b>${p.aPer90??'Sin datos'}</b>.</p>
  <p>Goles registrados en actas: <b>${p.gameGoals}</b> · Asistencias registradas: <b>${p.gameAssists}</b> · Tarjetas en actas: <b>${p.yellows} amarillas / ${p.reds} rojas</b> (totales del futbolista).</p>
  <p>Condición: <b>${E(p.availability)}</b> · Ritmo <b>${p.sharpness}%</b> · Lesiones históricas <b>${p.injuries}</b>.</p>
  <h3>🏆 Desglose de partidos con acta</h3>
  ${details.length?details.map(([name,n])=>`<div class="care-insight"><strong>${E(name)}</strong><span>${n} partidos con participación registrada</span></div>`).join(''):'<p class="muted small">Aún no existen actas individuales suficientes. No se inventan minutos de partidos históricos.</p>'}
  <h3>📅 Últimos encuentros con participación</h3>
  ${p.lastMatches.length?p.lastMatches.map(x=>`<div class="care-insight"><strong>${E(x.rival)} · ${E(x.competition)}</strong><span>${x.minutes} minutos registrados</span></div>`).join(''):'<p class="muted small">No se encontraron participaciones individuales en actas conservadas.</p>'}
  <div class="controls">${s.mode==='manager'&&s.managedClub===clubName&&!p.loan?button('✍ Renovar contrato','sporting-renew',`data-id="${E(p.id)}"`,'btn primary'):''}${button('🏥 Enfermería','nav','data-target="enfermeria"','btn')}${button('📋 Alineación','nav','data-target="alineacion"','btn')}</div>
  <p class="muted small">G/90 y A/90 se calculan únicamente con los minutos y goles/asistencias conservados en actas. No equivalen al total histórico cuando faltan datos.</p></article>`;
}
