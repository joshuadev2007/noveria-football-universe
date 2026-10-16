# NOVERIA 5.0 · LIVE 2D — Actualizar tu GitHub Pages

1. Antes de actualizar, abrí **Palmarés y partida → Descargar copia JSON** y guardá ese respaldo.
2. Descargá `Noveria_V5_SOLO_ARCHIVOS_MODIFICADOS.zip` y extraé sus archivos.
3. En tu repositorio `joshuadev2007/noveria-football-universe`, subí los archivos extraídos **a la raíz**, sustituyendo las versiones anteriores. Respetá nombres y carpetas.
4. Hacé **Commit changes**, esperá a que GitHub Pages termine y abrí la página. Si ves la versión anterior, probá `Ctrl + F5` (o cerrá/reabrí la PWA).
5. Entrá a **🔴 VER EN VIVO 2D**, seleccioná país y partido (Jornada 7 para empezar), pulsá **Reproducir**.

**¡IMPORTANTE!** La actualización parcial deliberadamente **NO** incluye `cloud-config.js`, `SUPABASE_SETUP.sql` ni claves: mantené tu configuración actual de **Joshua Cloud** intacta. No ejecutés SQL de nuevo.

### Cómo funciona el directo

- Para partidos sin disputar, el resultado se calcula internamente pero **se confirma en la liga solo al finalizar el directo**. Se muestran goles y otras acciones minuto a minuto sin anticipar el marcador.
- Una jornada puede verse partido por partido. Si luego pulsás “Simular jornada”, el motor juega únicamente los encuentros pendientes y conserva los ya vistos.
- Un partido de liga dura **120 segundos reales a velocidad x1**. Si es un choque eliminatorio que requiere tiempo adicional, podrá extenderse **20 segundos** para representar la prórroga.
- En modo DT y con tu propio equipo podés cambiar táctica y hasta cinco jugadores. Algunas decisiones pueden alterar el resultado; no siempre te beneficiarán.
- La repetición de un partido terminado **nunca cambia su resultado**. J1–J6 se muestran como historia sin inventar sus goles individuales.
- Pausá para guardar la transmisión y reanudar desde el mismo navegador. Las partidas siguen guardándose localmente y, si ya configuraste Supabase, en la nube.
- En el celular, tocá **☷ Más → 🔴 VER EN VIVO 2D**.

### Archivos añadidos

`live2d.js` (motor), `live-ui.js` (visualización y marcador), `live2d.css` (arena de fútbol). Los archivos actualizados son `app.js`, `engine.js`, `continent.js`, `international.js`, `index.html`, `styles.css`, `service-worker.js`, `README.md`, `package.json`, `NOVERIA-ABRIR.html`.

### Verificación

- Ejecutá `npm test` desde el repositorio si tenés Node.js.
- Incluye `tests-live2d.mjs` con prueba de una jornada parcialmente televisada, fases finales, fichas, modo DT y archivos históricos.
