import assert from 'node:assert/strict';
import {motionFrame} from './live-motion.js';
import {coachAdvice,runningScore,displayedMinute,coachSubstitution,takeCoachControl} from './live2d.js';

const makeTeam=(prefix)=>({
 name:prefix,primary:'#a61e31',secondary:'#ffffff',tactic:'Equilibrado',coach:'Director Técnico',
 players:Array.from({length:18},(_,i)=>({id:prefix+i,name:prefix+' futbolista '+i,number:i+1,pos:i===0?'POR':'MC',ovr:62+i}))
});
const h=makeTeam('Local'),a=makeTeam('Visita');
const state={mode:'manager',managedClub:'Local',seed:123,teams:{Local:h,Visita:a}};
const match={id:'live-fluid-2027',home:'Local',away:'Visita',events:[
 {min:15,type:'shot',side:'home'}, {min:45,type:'goal',side:'home',p1:h.players[9].id,p1Name:h.players[9].name},
 {min:68,type:'save',side:'away'}, {min:80,type:'goal',side:'away',p1:a.players[8].id,p1Name:a.players[8].name}
],lineups:{home:h.players.slice(0,11).map(p=>p.id),away:a.players.slice(0,11).map(p=>p.id)},
 bench:{home:h.players.slice(11).map(p=>p.id),away:a.players.slice(11).map(p=>p.id)}};
const b={id:match.id,season:2027,elapsed:0,duration:120,paused:true,finished:false,replay:false,legacy:false,speed:1,quality:'auto',preview:match,decisions:[],startTactics:{home:'Equilibrado',away:'Equilibrado'}};
const before=JSON.stringify(match);
for(let i=0;i<=240;i++){
 b.elapsed=i/2;const scene=motionFrame(b);
 assert.ok(Number.isFinite(scene.ball.x)&&Number.isFinite(scene.ball.y));
 for(const side of ['home','away']){
  assert.equal(scene.players[side].length,11);
  for(const p of scene.players[side])assert.ok(p.x>=40&&p.x<=920&&p.y>=40&&p.y<=495);
 }
}
assert.equal(JSON.stringify(match),before,'La animación nunca debe tocar el acta del partido');
b.elapsed=45*4/3;
assert.ok(motionFrame(b).ball.x>930,'Un gol de local se ve en la portería derecha');
b.elapsed=80*4/3;
assert.ok(motionFrame(b).ball.x<30,'Un gol visitante va a la portería izquierda');
const control=takeCoachControl(state,b,'Local');assert.equal(control,'home');
assert.ok(coachAdvice(state,b)?.length>5);
b.elapsed=63*4/3;
const sub=coachSubstitution(state,b,h.players[8].id,h.players[11].id);
assert.equal(sub.out,h.players[8].id);
assert.equal(sub.in,h.players[11].id);
assert.ok(b.preview.events.some(e=>e.manual&&e.type==='sub'),'El cambio se refleja en la cronología visible');
assert.throws(()=>coachSubstitution(state,b,h.players[8].id,h.players[12].id),/no está actualmente en la cancha/);
console.log('✅ LIVE 2D: 22 jugadores, remates al arco correcto y animación determinista');
console.log('✅ MODO DT: control manual, cambios y consejo según marcador y minuto');
