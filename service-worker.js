const CACHE='noveria-offline-v35';const CORE=['./','./index.html','./styles.css','./live2d.css','./live2d.js','./live-motion.js','./live-ui.js','./app.js','./club-inbox.js','./club-inbox-ui.js','./engine.js','./club-heritage.js','./lineup.js','./sporting-director.js','./squad-care.js','./squad-care-ui.js','./career-realism.js','./league-playoffs.js','./continent.js','./international.js','./ecosystem.js','./youth-scouting.js','./press-room.js','./season-experience.js','./season-cycle.js','./market-extra.js','./save-system.js','./match-editorial.js','./big-match-preview.js','./round-standings.js','./round-standings-ui.js','./tournament-stats.js','./mercado-tv.js','./mercado-tv.css','./calendar.js','./calendar.css','./cloud-sync.js','./cloud-config.js','./data.js','./manifest.webmanifest','./assets/icon.svg','./assets/aficion-noveria.webp'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 // Cargar imágenes reutilizadas directamente de la caché evita latencia y tráfico
 // en teléfonos y PCs modestos. El nuevo SW renueva las imágenes al actualizarse.
 if(event.request.destination==='image'){
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
   return response;
  })));
  return;
 }
 // Mantener HTML, CSS y JS con red primero para conservar despliegues frescos.
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
  return response;
 }).catch(()=>caches.match(event.request)));
});