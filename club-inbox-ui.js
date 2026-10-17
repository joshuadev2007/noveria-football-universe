import {inboxClub,getClubBox,unreadClubMessages} from './club-inbox.js';
export function renderClubInbox(s,ui,{E,button,head}){
 const club=inboxClub(s);
 if(!club)return '<div class="stack">'+head('📩 Mensajes del club','Buzón privado del entrenador.')+
 '<div class="card"><h2>🎩 Elegí el club que vas a dirigir</h2><p>Activá modo entrenador en Directivas y DT para recibir mensajes privados.</p>'+
 button('Ir a Directivas y DT','nav','data-target="directivas"','btn primary')+'</div></div>';
 const box=getClubBox(s,club),unread=unreadClubMessages(s,club),tabs=[['todos','Todos'],['pendientes','Por responder'],['noleidos','Sin leer'],['resueltos','Respondidos']];
 const shown=box.items.filter(m=>ui.inboxTab==='pendientes'?m.status==='pending':ui.inboxTab==='noleidos'?!m.read:ui.inboxTab==='resueltos'?m.status==='answered':true);
 const selected=box.items.find(m=>m.id===ui.inboxItem);
 const mail=m=>'<button class="inbox-mail '+(!m.read?'inbox-unread':'')+'" data-action="inbox-open" data-id="'+E(m.id)+'"><span class="inbox-icon">📩</span><span class="inbox-copy"><strong>'+E(m.from)+(!m.read?' ●':'')+'</strong><b>'+E(m.subject)+'</b><small>'+E(m.body)+'</small><em>'+E(m.date)+' · '+(m.status==='answered'?'Respondido':'Pendiente')+'</em></span></button>';
 let reader='<article class="card inbox-reader"><h2>✉️ Seleccioná un mensaje</h2><p>Las personas de tu club te escribirán aquí y podrás elegir cómo responder.</p></article>';
 if(selected){
  const responses=selected.status==='pending'?selected.options.map((c,i)=>'<button class="inbox-reply" data-action="inbox-answer" data-id="'+E(selected.id)+'" data-choice="'+E(c.id)+'"><span class="inbox-num">'+(i+1)+'</span><span><strong>'+E(c.label)+'</strong><small>'+E(c.detail)+'</small></span></button>').join(''):
   '<div class="inbox-done"><strong>✓ '+E(selected.responseLabel)+'</strong><p>'+E(selected.outcome)+'</p></div>';
  reader='<article class="card inbox-reader"><div class="eyebrow">'+E(selected.role)+' · '+E(selected.date)+'</div><h2>'+E(selected.subject)+'</h2><div class="inbox-sender"><strong>'+E(selected.from)+'</strong><small>Para: '+E(club)+' · Mánager</small></div><p class="inbox-message-body">'+E(selected.body)+'</p><h3>'+(selected.status==='pending'?'¿Qué le respondés?':'Respuesta registrada')+'</h3>'+(selected.status==='pending'?'<p class="muted small">Elegí una de las cuatro respuestas. Tendrá consecuencias en tu partida.</p>':'')+'<div class="inbox-responses">'+responses+'</div></article>';
 }
 return '<div class="stack">'+head('📩 Mensajes del club','Futbolistas, directiva, médicos y fichajes: cuatro respuestas con consecuencias.',button('Gerencia','nav','data-target="gerencia"','btn'))+
 '<section class="inbox-banner"><div><span class="eyebrow">BUZÓN PRIVADO · MODO ENTRENADOR</span><h2>'+E(club)+'</h2><p>'+unread+' sin leer · '+box.items.filter(x=>x.status==='pending').length+' por responder</p></div><span class="inbox-total">📬 '+unread+'</span></section>'+
 '<nav class="inbox-tabs">'+tabs.map(([key,label])=>button(label,'inbox-tab','data-tab="'+key+'"','btn sm '+(ui.inboxTab===key?'primary':''))).join('')+button('✓ Marcar todos leídos','inbox-read-all','','btn sm')+'</nav>'+
 '<div class="inbox-layout"><section class="inbox-mails">'+(shown.length?shown.map(mail).join(''):'<p class="inbox-empty">No hay mensajes en este filtro.</p>')+'</section>'+reader+'</div></div>';
}
