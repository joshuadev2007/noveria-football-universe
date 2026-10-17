import assert from 'node:assert/strict';
import {freshState} from './engine.js';
import {registerInjury,activeMedicalCases,treatInjury,squadAnalysis,MEDICAL_CARE_COST} from './squad-care.js';
import {renderMedicalPage,renderAnalysisPage,renderPlayerInsight} from './squad-care-ui.js';
import {lineupState} from './lineup.js';
import {marketValuation} from './engine.js';
const s=freshState(),name='Unión Popular Aurena',team=s.teams[name];
team.budget=5;team.facility={...team.facility,medical:4};
const [patient,sanction,scorer]=team.players;
const legacy=s.fixtures.filter(f=>f.legacy&&f.round<=6).map(f=>[f.id,f.scoreH,f.scoreA]);
patient.fitness=53;patient.outGames=4;
registerInjury(s,name,patient,{id:'fixture-injury-7'},4);
sanction.outGames=2;sanction.suspensionGames=2;
assert.equal(activeMedicalCases(s,name).filter(x=>x.availableForTreatment).length,1);
assert.throws(()=>treatInjury(s,name,sanction.id),/diagnóstico/);
const funds=team.budget,receipt=treatInjury(s,name,patient.id);
assert.equal(receipt.games,2);
assert.equal(patient.outGames,2);
assert.equal(team.budget,+(funds-MEDICAL_CARE_COST(4)).toFixed(3));
assert.ok(patient.fitness>53);
assert.throws(()=>treatInjury(s,name,patient.id),/ya recibió/);
patient.medicalCase.treated=false;patient.suspensionGames=2;
assert.throws(()=>treatInjury(s,name,patient.id),/sancionado/);
assert.equal(patient.outGames,2,'Ninguna terapia anula una suspensión');
assert.deepEqual(team.medicalHistory[0].player,String(patient.id));
const m={
 id:'stats-match-7',home:name,away:'Ferroviarios de Ferral',played:true,
 scoreH:2,scoreA:0,competition:'LSV',round:7,
 lineups:{home:[scorer.id,patient.id],away:[]},events:[
  {type:'goal',side:'home',p1:scorer.id,p2:patient.id,min:21},
  {type:'sub',side:'home',p1:patient.id,p2:sanction.id,min:68}
 ]
};
scorer.apps=12;scorer.goals=7;scorer.assists=3;scorer.form=7.5;scorer.contractYears=1;
const stats=squadAnalysis(s,name,[m,m,{id:'legacy',played:true,home:name,away:'Ferroviarios de Ferral',scoreH:0,scoreA:0}]);
const top=stats.rows.find(p=>p.id===String(scorer.id));
const injured=stats.rows.find(p=>p.id===String(patient.id));
assert.equal(stats.gameCount,2,'No contar el mismo partido dos veces');
assert.equal(top.gameGoals,1);assert.equal(injured.minuteCount,68);
assert.equal(top.label,'Prioridad renovar');
assert.ok(Number.isFinite(top.gPer90));
const E=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const button=(label,action,attrs='')=>'<button data-action="'+action+'" '+attrs+'>'+label+'</button>';
const helpers={E,button,head:(a,b)=>'<h1>'+a+'</h1>',stat:(a,b)=>'<div>'+a+' '+b+'</div>',
 trainingPlan:()=>team.trainingPlan||'Equilibrado',marketValuation,lineupState,fixtures:[m]};
const ui={team:name,analysisQuery:'',analysisFilter:'todos',analysisSort:'prioridad'};
patient.suspensionGames=0;patient.medicalCase.treated=false;
const medical=renderMedicalPage(s,ui,helpers),analysis=renderAnalysisPage(s,ui,helpers),
 detail=renderPlayerInsight(s,name,scorer.id,helpers);
assert.ok(medical.includes('data-action="medical-treat"'));
assert.ok(medical.includes('data-action="medical-recovery-plan"'));
assert.ok(analysis.includes('id="analysisFilter"')&&analysis.includes('data-action="sporting-renew"'));
assert.ok(detail.includes('Minutos')&&detail.includes('Renovar contrato')&&detail.includes('Valor estimado'));
assert.deepEqual(s.fixtures.filter(f=>f.legacy&&f.round<=6).map(f=>[f.id,f.scoreH,f.scoreA]),legacy);
console.log('✅ Enfermería: diagnósticos, tratamientos con costo, límite por lesión y sanciones protegidas');
console.log('✅ Estadísticas: minutos registrados, datos de partido, vencimientos e informes para renovar');
console.log('✅ Guardados históricos intactos, interfaz médica y panel analítico funcional');
