/** Panel de análisis táctico — vista de solo lectura hasta confirmar Aplicar. */
import {suggestLineupScenario,LINEUP_SCENARIOS} from './lineup-advisor.js';
export function renderLineupAdvice(s,name,scenario,helpers,event=null){
 const {E,button,stat}=helpers;
 const report=suggestLineupScenario(s,name,scenario,event);
 const incumbent=new Set((s.teams[name]?.lineup?.starters||s.teams[name]?.players?.slice(0,11).map(p=>String(p.id))||[]).map(String));
 const byId=new Map(s.teams[name].players.map(p=>[String(p.id),p]));
 const players=report.starters.map(p=>
  `<div class="lineup-advisor-row"><span class="advisor-position">${E(p.role)}</span><div><strong>${E(p.name)}</strong><small>${E(p.pos)} · OVR ${p.ovr} · Físico ${p.fitness}% · Ritmo ${p.sharpness}%${incumbent.has(p.id)?'':' · ✨ ENTRA'}</small></div></div>`).join('');
 const bench=report.bench.map(p=>
  `<div class="lineup-advisor-sub"><span>${E(p.name)} <small>· ${E(p.pos)}</small></span><b>${p.ovr} OVR · ${p.fitness}%</b></div>`).join('');
 const captain=byId.get(report.captain)?.name||'Por definir';
 const label=LINEUP_SCENARIOS.find(x=>x.value===scenario)?.label||'Automático';
 return `<section class="card lineup-advisor-panel"><div class="between"><div><span class="eyebrow">🧠 CUERPO TÉCNICO · ASESOR POR ESCENARIOS</span><h2 class="h2">Sugerencia · ${E(label)}</h2></div>${button('✕ Cerrar','lineup-advice-close','','btn sm')}</div>
 <label class="field"><span>¿Qué escenario querés preparar?</span><select id="lineupAdviceScenario">${LINEUP_SCENARIOS.map(x=>`<option value="${E(x.value)}" ${x.value===scenario?'selected':''}>${E(x.label)}</option>`).join('')}</select></label>
 <div class="lineup-advisor-context">${report.opponent?`⚽ Rival detectado: <strong>${E(report.opponent)}</strong> · ${E(report.competition||'Torneo oficial')}`:'📅 No hay rival disponible; analizamos tu plantilla actual.'}</div>
 <div class="grid three">${stat('Formación',E(report.formation),'Propuesta')}${stat('Estilo',E(report.tactic),'Táctica sugerida')}${stat('Rotaciones',report.incoming.length,'Cambios de titulares')}</div>
 <div class="lineup-advisor-reasons"><h3>💡 Análisis del cuerpo técnico</h3>${report.reasons.map(x=>`<p>✦ ${E(x)}</p>`).join('')}${report.warnings.map(x=>`<p class="lineup-advisor-warning">⚠ ${E(x)}</p>`).join('')}</div>
 <div class="grid two"><div class="lineup-advisor-column"><h3>⚽ Once recomendado</h3>${players}</div><div class="lineup-advisor-column"><h3>🪑 Siete suplentes</h3>${bench}<p class="muted small">Ⓒ Capitán sugerido: ${E(captain)}</p></div></div>
 <div class="lineup-advisor-actions"><p class="muted small">Solo estás viendo una recomendación. Ningún jugador ni táctica se modifica hasta que confirmés. No predice ni simula resultados.</p>${button('✅ Aplicar sugerencia','lineup-advice-apply','','btn primary')}${button('↶ Mantener mi once','lineup-advice-close','','btn')}</div></section>`;
}
