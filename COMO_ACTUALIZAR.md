# NOVERIA 5.1 · La sala de prensa cobra vida 🎙️⚽

## Actualizar GitHub Pages desde Noveria 5.0

1. Abrí **Palmarés y partida** y descargá el respaldo JSON de tu partida **antes de actualizar**.
2. Descargá y descomprimí `Noveria_V5_1_SOLO_MODIFICADOS.zip`.
3. Entrá a tu repositorio `joshuadev2007/noveria-football-universe`.
4. Subí **todos los archivos del ZIP a la raíz del repositorio**, reemplazando los anteriores: entre ellos `app.js`, `ecosystem.js`, `styles.css`, `index.html`, `service-worker.js` y el **nuevo** `press-room.js`. Conservá las demás carpetas y scripts anteriores.
5. Hacé **Commit changes**, esperá que GitHub Pages actualice y recargá con `Ctrl + F5` en PC. En celular, cerrá y reabrí la PWA para actualizar el caché.

### ¡Importante sobre Joshua Cloud!

La actualización **NO incluye `cloud-config.js`** ni modifica el SQL, las políticas de Supabase o las claves de tu proyecto. Si tu nube ya funcionaba, debería seguir funcionando tal como estaba. El nuevo historial de conferencias forma parte de la partida JSON y de la sincronización que ya existía.

### Qué encontrar en Noveria

- Menú: **🎙️ Rueda de prensa**.
- Selector de club, posición, últimos cinco resultados, puntos y moral.
- Tres preguntas distintas basadas en los marcadores y circunstancias *reales* del equipo; los titulares cambian según país, club y jornada.
- Tres opciones por pregunta con declaraciones diferentes y variación visible de ánimo del vestuario, directiva y afición.
- Historial de declaraciones y noticias en El Heraldo / La Tribuna / Radar.
- Solo una conferencia de tres preguntas por ciclo de partidos del club. Se reabre después de disputar un nuevo partido.

Se conservan todos los partidos, el modo DT, nueve países, 252 clubes, temporadas, mercado y transmisiones en vivo 2D. La Jornada 7 de Veltrania sigue pendiente si no la simulaste antes de actualizar. **La actualización no genera resultados**.

### Probar fuera de GitHub

`NOVERIA-ABRIR.html` funciona como versión autónoma de prueba. Para que el guardado global funcione desde GitHub Pages, tu `cloud-config.js` publicado debe conservar URL y clave pública correctas de Joshua Cloud.

### Ejecutar pruebas (opcional)

Con Node.js: `npm test`. La suite incluye las pruebas de la rueda de prensa y el resto del simulador.
