import assert from 'node:assert/strict';
import {frameUpdate} from './live-ui.js';
import {displayedMinute,runningScore} from './live2d.js';

let elements;
const mkElement=id=>({
 id,textContent:'',innerHTML:'',dataset:{},style:{},attrs:{},
 classList:{toggle(){},add(){},remove(){}},
 setAttribute(key,value){this.attrs[key]=String(value)},
 querySelector(){return null}
});
function mount(){
 elements=new Map();
 for(const id of ['lv5-pitch','lv5-result','lv5-clock','lv5-real','lv5-status',
  'lv5-play','lv5-bar','lv5-commentary','lv5-caption-icon','lv5-feed','lv5-final',
  'lv5-ball','lv5-ball-shadow','lv5-pass-trail','lv5-play-indicator']){
  elements.set(id,mkElement(id));
 }
 for(const side of ['home','away'])for(let i=0;i<11;i++)elements.set('lv5-'+side+'-'+i,mkElement('lv5-'+side+'-'+i));
 const pitch=elements.get('lv5-pitch');
 // Reproduce el fallo anterior: el SVG NO ve los elementos HUD externos.
 pitch.getElementById=id=>/^(lv5-(home|away)-\d+|lv5-ball|lv5-pass-trail|lv5-play-indicator)$/.test(id)?elements.get(id):null;
 globalThis.document={getElementById:id=>elements.get(id)||null};
}
const goal=(min,side,p1Name)=>({min,side,p1Name,type:'goal'});
const b={id:'scoreboard-regression',elapsed:0,duration:120,paused:true,finished:false,
 replay:false,legacy:false,quality:'auto',sound:false,
 preview:{home:'Aurena',away:'Ferral',scoreH:2,scoreA:1,
  events:[goal(12,'home','Rojas'),goal(45,'away','Castro'),goal(79,'home','Salas')],stats:{posH:55,posA:45,shotsH:12,shotsA:8,onH:6,onA:3,xgH:1.8,xgA:.7}}
};
const check=(elapsed,clock,score,remaining)=>{
 b.elapsed=elapsed;frameUpdate(b,{hud:true});
 assert.equal(elements.get('lv5-clock').textContent,clock);
 assert.match(elements.get('lv5-result').innerHTML,new RegExp(score));
 assert.equal(elements.get('lv5-real').textContent,remaining);
};
mount();
check(0,'00′','0 <i>:</i> 0','02:00');
check(20,'15′','1 <i>:</i> 0','01:40');
assert.match(elements.get('lv5-feed').innerHTML,/Rojas/);
check(66,'49′','1 <i>:</i> 1','00:54');
check(112,'84′','2 <i>:</i> 1','00:08');
assert.equal(displayedMinute(b),84);
assert.deepEqual(runningScore(b),[2,1]);
// Un render completo genera elementos nuevos, también deben mostrar el tiempo correcto.
mount();b.finished=true;b.paused=true;check(120,'90′','2 <i>:</i> 1','00:00');
assert.equal(elements.get('lv5-bar').style.width,'100%');
assert.equal(elements.get('lv5-status').textContent,'FINAL DEL PARTIDO');
assert.equal(elements.get('lv5-final').style.display,'block');
console.log('✅ LIVE 2D: el marcador, reloj, narración y controles se actualizan FUERA del SVG');
console.log('✅ Goles de ambos clubes en su minuto y resultado correcto tras volver a entrar');
