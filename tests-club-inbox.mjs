import assert from 'node:assert/strict';
import {freshState} from './engine.js';
import {inboxClub,getClubBox,unreadClubMessages,syncClubInbox,markClubInboxRead,answerClubInbox} from './club-inbox.js';
import {renderClubInbox} from './club-inbox-ui.js';

const s=freshState(),club='Unión Popular Aurena',other='Ferroviarios de Ferral';
s.mode='manager';s.managedClub=club;
assert.equal(inboxClub(s),club);
const t=s.teams[club],roster=t.players;
roster[4].contractYears=1;
const initial=syncClubInbox(s,{routine:true});
assert.equal(initial.length,1);assert.equal(initial[0].options.length,4);
assert.equal(unreadClubMessages(s,club),1);
markClubInboxRead(s,club,initial[0].id);
assert.equal(unreadClubMessages(s,club),0);
const originalMorale=t.morale,originalBoard=t.board;
answerClubInbox(s,club,initial[0].id,'support');
assert.equal(t.morale,originalMorale+1);
assert.equal(t.board,originalBoard+3);
assert.throws(()=>answerClubInbox(s,club,initial[0].id,'steady'),/ya está respondido/);

const injured=roster[0],expelled=roster[1];injured.outGames=4;
const match={id:'INBOX-TEST-1',competition:'LSV',home:club,away:other,played:true,scoreH:1,scoreA:2,
 group:'A',events:[{type:'injury',side:'home',min:39,p1:injured.id},
 {type:'red',side:'home',min:74,p1:expelled.id},{type:'goal',side:'home',min:15,p1:roster[3].id}],
 lineups:{home:roster.slice(0,11).map(p=>p.id),away:[]}};
const messages=syncClubInbox(s,{eventId:'calendar-test-1',matches:[match]});
assert.ok(messages.some(m=>m.category==='medico'));
assert.ok(messages.some(m=>m.category==='disciplina'));
assert.ok(messages.some(m=>m.category==='contratos'));
assert.ok(messages.some(m=>m.key.startsWith('loss-')));
assert.ok(messages.every(m=>m.options.length===4));
assert.equal(syncClubInbox(s,{eventId:'calendar-test-1',matches:[match]}).length,0);

const doctor=messages.find(m=>m.category==='medico');
const beforeBudget=t.budget;
answerClubInbox(s,club,doctor.id,'therapy');
assert.equal(t.budget,+(beforeBudget-.12).toFixed(3));
assert.equal(injured.outGames,3);
const expelledMsg=messages.find(m=>m.category==='disciplina');
const beforeTrust=t.board,beforeGroup=t.morale;
answerClubInbox(s,club,expelledMsg.id,'support');
assert.equal(t.board,beforeTrust-2);
assert.equal(t.morale,beforeGroup+4);
const contract=messages.find(m=>m.category==='contratos');
const p=roster.find(p=>String(p.id)===String(contract.playerId));
answerClubInbox(s,club,contract.id,'renew');
assert.equal(p.contractYears,2);
assert.ok(p.salary>0);

const transfer={...roster[12],id:'INBOX-NEW-PLAYER',name:'Nuevo fichaje',contractYears:3};
t.players.push(transfer);
const arrival=syncClubInbox(s);
assert.ok(arrival.some(m=>m.category==='fichajes'&&m.subject.includes('Nuevo fichaje')));
const blank=syncClubInbox(s,{club:other,routine:true});
assert.equal(blank.length,1);
assert.throws(()=>answerClubInbox(s,other,blank[0].id,'support'),/Solo podés responder/);
const young=syncClubInbox(s,{eventId:'calendar-test-2',matches:[{id:'youth-fake',played:true,home:club,away:other,scoreH:0,scoreA:6}]});
assert.ok(young.every(m=>!m.key.includes('youth-fake')));

const sample=s.clubInbox.boxes[club].items.find(m=>m.key.startsWith('loss-'));
const E=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const page=renderClubInbox(s,{inboxItem:sample.id,inboxTab:'todos'},{
 E,head:(title,detail)=>'<header>'+title+detail+'</header>',
 button:(title,action,attrs='',className='btn')=>'<button class="'+className+'" data-action="'+action+'" '+attrs+'>'+title+'</button>'
});
assert.ok(page.includes('data-action="inbox-answer"'));
assert.equal((page.match(/data-action="inbox-answer"/g)||[]).length,4);
assert.ok(page.includes('Nuevo fichaje'));
assert.ok(JSON.parse(JSON.stringify(s)).clubInbox.boxes[club].items.length>5);

for(let date=3;date<=5;date++)syncClubInbox(s,{eventId:'calendar-test-'+date,matches:[]});
const bench=roster.at(-2);bench.apps=0;
const sixth=syncClubInbox(s,{eventId:'calendar-test-6',matches:[]});
assert.ok(getClubBox(s,club).dates>=6);
assert.ok(sixth.every(m=>m.options.length===4));
console.log('✅ Buzón de DT: mensajes por partido, decisiones, costos, contratos, traspasos y privacidad');
console.log('✅ Cuatro respuestas, un único envío, guardado, notificaciones por fecha y UI del buzón');
