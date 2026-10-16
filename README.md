# Noveria 5.12 · Tablas de posiciones tras cada jornada simulada 📊🏆

Después de pulsar **Jugar fecha del calendario**, el juego conserva su pantalla clásica de **Resultados y periódicos**. Ahora, justo debajo de los marcadores y periódicos, aparece **«Así quedan las tablas de posiciones»**.

- **Liga Suprema:** Zona A y Zona B con los dos puestos de semifinales destacados, más tabla anual (Campeones, Horizonte y repechajes) y Liga de Plata (ascensos y descenso).
- **Copa Nacional:** clasificación individual de todos sus grupos. Marca a los **dos primeros de cada grupo y los dos mejores terceros** para octavos. El distintivo es provisional hasta que termine la fase.
- **Arcalis:** grupos de Copa de Campeones y Copa Horizonte; destaca los **nueve líderes de grupo y siete mejores segundos**. Cuando llegan eliminatorias, muestra los clubes que avanzan según su acta.
- **Finales, Recopas y eliminatorias:** en vez de inventar puntos, muestra las series jugadas, clubes que siguen en disputa y clasificados confirmados. Para ida/vuelta no atribuye clasificación por el resultado de una sola pierna.
- **Torneos personalizados:** tablas para ligas, zonas y grupos, más fases eliminatorias según el formato.
- **Países:** se conserva el selector de Veltrania, los otros ocho países o **TODOS**. En TODOS las tablas quedan agrupadas por federación y se pueden desplegar, para no saturar el móvil.
- **Colores de clasificación:** verde para avance, azul para mejores segundos/terceros o Horizonte, dorado para repechaje y rojo para descenso. Las etiquetas aclaran cuándo una plaza es provisional.
- El módulo es **de solo lectura**: no modifica los resultados, campeones, calendarios ni la partida en Joshua Cloud.

Prueba nueva: `node tests-round-standings.mjs` junto al resto de `npm test`.

---

# NOVERIA 5.11 · Dirección de alineaciones y banca 📋⚽

Noveria incorpora un apartado **📋 Alineación y banca**, disponible en el menú lateral y desde **Directivas y DT**.

## Cómo dirigir tu equipo

1. Abrí **📋 Alineación y banca**. En modo presidente elegís el club que querés editar; en modo DT trabajás con el equipo que dirigís.
2. Encontrarás una **cancha con once futbolistas**, sus dorsales, demarcaciones y OVR; debajo y al lado están las listas de titulares, siete suplentes y reservas.
3. Para modificar un puesto, abrí su lista desplegable y elegí otro futbolista. Se **intercambian**: si el elegido estaba en la banca, el titular anterior va a esa posición de la banca; si estaba en reservas, se intercambian sin borrar a nadie.
4. Elegí la formación **4-3-3, 4-4-2, 4-2-3-1, 3-5-2 o 5-3-2**, el estilo táctico y el **capitán**, que debe pertenecer al once.
5. **🧠 Elegir mejor XI** genera una alineación automática según OVR, posiciones y bajas. **↶ Restablecer** recupera el orden original de la plantilla, previa confirmación.
6. Los jugadores fuera de los dieciocho convocados quedan como **reservas**; con **A la banca** podés convocarlos.
7. Los cambios se guardan **automáticamente** como `team.lineup`, junto con tu partida en el navegador o Joshua Cloud. Los partidos anteriores permanecen intactos.

## Efecto real en los partidos

- Las próximas **simulaciones de liga, copa y torneos internacionales** toman los once elegidos, en lugar de elegir siempre los primeros once del plantel.
- El OVR del once, ponderado por la posición en tu formación, **influye en la fuerza del equipo** y puede cambiar las probabilidades de gol. No garantiza un resultado.
- El motor registra los **titulares, siete suplentes, capitán, formación y entrenador** en el acta de cada partido; las apariciones y los goles se contabilizan a los jugadores que correspondan.
- En **Live 2D**, únicamente los futbolistas convocados en la banca están habilitados para entrar como suplentes. La selección queda congelada al iniciar un partido en directo para que no cambie a mitad de transmisión.
- Si algún titular está lesionado o sancionado, se le busca un reemplazo disponible de la convocatoria. La alineación que configuraste no se borra.
- Los fichajes nuevos permanecen como reservas hasta que los incorpores al once o a la banca.
- Si ya tenías una partida en curso, **no hay migración destructiva**: el sistema empieza con el once y la banca que usaba el plantel de esa partida. Podés editarlo cuando quieras.

Prueba añadida: `node tests-lineup.mjs`. Conviene exportar JSON desde **Palmarés y partida** antes de hacer modificaciones grandes.

---

# Noveria 5.10 · Academia de talentos y ojeadores internacionales 🌱🌍

**Disponible desde el menú Cantera sub-20.** Se mantiene el progreso del club y la partida guardada; no se modifican campeones ni resultados anteriores.

## Ojeadores de nueve países

1. Elegí tu club en Cantera. En «Enviar ojeador al extranjero» seleccioná cualquiera de **los otros ocho países** de Arcalis.
2. Pulsá **Enviar ojeador**. Su viaje descuenta entre 0,175 y 0,115 M VLR según el nivel de ojeadores. Podés tener **dos misiones a la vez**, o tres con instalaciones de ojeadores al nivel 4 o 5.
3. El ojeador vuelve después de **1 a 3 fechas oficiales del calendario maestro**. La misión no depende de tiempo real ni se puede acelerar con recargas de página.
4. El informe ofrece entre cuatro y seis futbolistas juveniles con **nombre, edad, posición, país, estilo, OVR actual, potencial exacto y precio de incorporación**. Elegí «Fichar promesa» para añadirlo a tu cantera. No se duplica el jugador ni se cobra dos veces.
5. Los informes, contrataciones y misiones quedan en el guardado local y se sincronizan con Joshua Cloud cuando está conectado.

## Crecimiento de OVR según rendimiento

- Los juveniles reciben **XP de su calificación, goles, asistencias y resultado del partido** en Liga Sub-20 o amistosos. Sus estadísticas individuales de PJ/G/A/forma se acumulan.
- La barra XP muestra cuánto falta para aumentar el **OVR real del futbolista**; las subidas se conservan en la partida y se detienen al alcanzar el potencial.
- Entrenar cuesta **0,10 M VLR** y aporta XP. Máximo **ocho entrenamientos por edición** para evitar crecimiento ilimitado sin partidos.
- Los amistosos suman estadísticas siempre, pero como desarrollo aportan XP en los primeros **cuatro por edición**; en Liga Sub-20 siguen creciendo normalmente.
- Podés **promover** un juvenil, pulsar **Dar titularidad** y hacer que mejore mediante sus actuaciones reales en Primera. Los jugadores no suben de OVR automáticamente solo por cumplir años.
- El potencial define el límite de crecimiento. Mejorar instalaciones de academia y ojeadores sigue teniendo utilidad.

## Liga juvenil completa

Las nuevas ligas Sub-20 incluyen **los 18 clubes de Primera de cada país**, con **17 jornadas y 153 partidos**, distribuidos entre las fechas del calendario oficial. Antes solo participaban seis clubes. Las ligas juveniles de cinco fechas ya guardadas se respetan y no se reinician.

Para probar los nuevos sistemas de forma automatizada: `node tests-youth-scouting.mjs`.

> Recomendamos exportar una copia JSON desde Palmarés y partida antes de hacer el primer fichaje internacional, especialmente al usar varios dispositivos.

---

# Noveria 5.8.1 · Elegí los países para ver resultados y periódicos 🌍📰

**Antes de simular:** entrá a **Calendario maestro** y buscá la tarjeta «¿De qué país querés ver los marcadores?». Elegí **TODOS LOS PAÍSES** o cualquiera de las nueve federaciones de Arcalis, y pulsá **Jugar fecha del calendario**.

**Después de simular:** en «Resultados y periódicos», el selector de países aparece **arriba de los marcadores**. Podés elegir otro país o volver a **TODOS** sin simular de nuevo. Los conteos de partidos y goles se ajustan al filtro. «Mostrar más partidos» funciona también con la vista global.

**Copas continentales:** si seleccionás Veltrania y su club juega de visitante en Soleria, el partido también aparece; se comprueba el país de **ambos** clubes. En fechas sin partidos de ese país se mostrará un mensaje de cero resultados, sin cambiar tu elección.

Tu preferencia se conserva en `state.settings.resultsCountry`, dentro del guardado existente, y puede sincronizarse con Joshua Cloud sin crear tablas nuevas. Las partidas antiguas que aún no tengan esa preferencia comienzan con la opción **TODOS**, sin perder campeones ni estadísticas. La simulación sigue avanzando las nueve federaciones de manera global, independientemente del filtro.

Prueba específica: `node tests-results-country.mjs`.

---

# Noveria 5.8 · Calendario futbolístico continuo: Clausura y Apertura 🏆📅

**Actualización directa del repositorio.** Conserva la partida guardada, no reinicia el universo y no modifica la base de datos de Joshua Cloud.

## Orden cronológico de los torneos

- **Apertura 2026**: primera edición histórica; todos los marcadores y campeones que ya ganaste se conservan.
- **Clausura 2027**: nueva liga desde la jornada 1, nueva Copa Nacional, nuevas copas continentales, sus propias semifinales, final y Recopa. El calendario comienza en **febrero de 2027**.
- **Apertura 2027**: se disputa a partir de **agosto de 2027**, con sus calendarios y campeones independientes.
- **Clausura 2028 → Apertura 2028**, y así sucesivamente.

## Tabla anual y descensos

La **tabla anual de 2027** acumula los **18 partidos del Clausura 2027 y 18 del Apertura 2027** (36 partidos por club que complete ambas ediciones en Primera). En Clausura se ve el acumulado provisional, y el **Escudo de Oro** se concede **una sola vez** al completar el Apertura del año. La excepción inaugural sigue siendo el Escudo de Oro de 2026, que permanece intacto. Los ascensos y descensos de cada país se resuelven al cerrar el Apertura anual, no a mitad de año.

## ¿Cómo paso al Clausura 2027 si ya gané la Recopa?

1. Abrí **📅 Calendario maestro**.
2. Si ya ganaste la final y Recopa del Apertura 2026, pero todavía faltan Copa Nacional o Copas de Arcalis, podés jugar sus fechas normalmente **en orden**, o pulsar **⏭ Terminar copas pendientes**. Esta segunda opción pide confirmación y **simula los encuentros pendientes cronológicamente**, conservando campeones, resultados y palmarés.
3. Cuando las competiciones estén terminadas, verás **🚀 Iniciar Clausura 2027** en **Calendario maestro** y **Palmarés y partida**.
4. Si el mercado sigue abierto, el juego te preguntará antes de simular sus días finales y cerrar la ventana. Tras confirmar, archivará la edición anterior y comenzará el nuevo torneo sin borrarla.
5. Para comprobar 2027, abrí **Clasificaciones → Escudo de Oro**, que ahora refleja la tabla anual por año con ambos torneos cortos.

## Integridad

- El **palmarés** conserva los títulos del Apertura, Recopa, Copa Nacional, federaciones y copas continentales.
- Las ediciones tienen identificadores únicos (ejemplo `2027-Clausura` y `2027-Apertura`) para que sus partidos, calendarios y archivos no se confundan.
- Los guardados anteriores sin campo `edition` se interpretan como **Apertura**, sin reiniciar el progreso.
- El formato de guardado, el login, los datos de Supabase, Mercado 24 y Live 2D permanecen compatibles.
- **Antes de cambiar de torneo**, recomendamos exportar una copia JSON desde **Palmarés y partida**.
- Prueba automática nueva: `node tests-cycle.mjs` (tres ediciones completas y validación de tabla anual, títulos y 78 resultados históricos).

---

# Noveria 5.7 · ¡Vuelven los resultados y los periódicos! 📰⚽

Al pulsar **▶ Jugar fecha del calendario**, se disputan únicamente los partidos de la fecha oficial y la aplicación abre automáticamente la pantalla clásica de **Resultados y periódicos** (ya no regresa al calendario vacío). Se conserva el orden cronológico establecido por Calendario maestro.

- **Portada de jornada:** marcadores, cantidad de goles, partido destacado y acceso a cada crónica individual.
- **Nueve países:** selector por federación y botón para mostrar más partidos sin cargar cientos de tarjetas de golpe. Por defecto se muestran los partidos de Veltrania si están disponibles.
- **Periódicos contextuales:** cada acta genera título, entradilla y narración derivados exclusivamente de goles, orden de las anotaciones, dobletes, remontadas, expulsiones y estadísticas que realmente hayan quedado registradas. También se distinguen empate, goleada, victoria mínima, goles tardíos y definiciones por penales.
- **Edición imprimible:** artículos con marcador, contexto, minuto a minuto, estadísticas, alineaciones cuando constan y diseño adaptable a móvil. No se inventan entrevistas, goleadores, estadísticas ni incidencias.
- **Periódico general:** publica algunos de los partidos destacados de cada fecha, vinculados a sus actas. El filtro **Partidos** los agrupa.
- **Archivo histórico intacto:** los primeros 78 resultados siguen sin recibir detalles ficticios. El motor editorial no modifica ningún resultado, estadística ni guardado.
- Se mantienen **Noveria Live 2D, Mercado 24, Calendario maestro y Joshua Cloud**.

Prueba automática adicional: `node tests-editorial.mjs`.

---

# Noveria 5.6 · Live 2D con jugadas representadas sobre la cancha ⚽📺

El **modo 2D** ya no mueve las bolitas al azar: la trayectoria del balón y las carreras se reconstruyen a partir de los eventos disponibles en el partido.

- Los **22 jugadores**, con sus números, forman líneas de defensa, mediocampo y ataque y acompañan el desarrollo de la jugada.
- Hay **circulación de pelota, pases sucesivos y conducciones** con un poseedor marcado visualmente.
- Al anunciar un **gol**, el atacante progresa y el balón cruza la línea de la portería correcta; el marcador sigue leyendo los goles oficiales del acta.
- Los **tiros desviados** van fuera, las **atajadas** terminan junto al arquero, y los **córners** llevan la pelota al banderín.
- Los arqueros reaccionan, los defensores presionan, y aparecen trazos de pelota y rótulos de la acción.
- El movimiento es **determinista**: pausar, continuar, cambiar velocidad o restaurar una partida produce el mismo fotograma para el mismo instante.
- La animación es una **reconstrucción ilustrativa basada en el tipo y momento del evento**, no un registro real de trayectorias ni una simulación física exacta. No se agregan goles o eventos a la historia y se conserva el tratamiento especial de partidos históricos sin detalles individuales.
- Compatible con **Noveria 5.5.1**, Calendario maestro, Mercado 24 y guardados locales/Joshua Cloud. No hace falta modificar tablas ni configurar credenciales.

Para probarlo: **VER EN VIVO 2D → seleccionar un partido de la fecha oficial → ▶ Reproducir**. La actualización PWA usa una nueva versión de caché; si está mostrando el movimiento viejo, abrí el sitio en Chrome y recargá, sin borrar los datos locales.

---

# Noveria 5.5 · Calendario maestro 📅🏆

**Todas las competiciones oficiales avanzan por fecha cronológica.** Entrá a **📅 Calendario maestro** desde el menú; en el celular aparece también en **Más**.

- Los **sábados** suelen disputarse la Liga Suprema y las ligas de todos los países. Algunos fines de semana se reservan a la **Copa Nacional** en vez de la liga.
- Entre semana hay **Copa de Campeones**, **Copa Horizonte**, copas nacionales y espacio para torneos personalizados.
- La **fase final**, las finales de ida/vuelta y las **Recopas** se disputan al completar las 18 jornadas ligueras. Las Ligas Sub-20 acompañan las primeras fechas nacionales.
- Un calendario único permite jugar **solo la fecha marcada como activa**. Los botones antiguos llevan al mismo calendario y no permiten adelantar una liga, copa o partido 2D que todavía no corresponda.
- El botón **▶ Jugar fecha del calendario** simula los partidos de ese turno en las nueve federaciones, mueve las competiciones al siguiente paso y desbloquea la próxima fecha. Podés observar un partido habilitado por Noveria Live 2D antes de completar el turno.
- Las fechas de torneos personalizados se asignan al crearlos; el calendario conserva copas y formatos especiales y permite jugar sus rondas cuando llegue el turno.
- **Las partidas anteriores no se reinician**. Las seis primeras jornadas históricas de 2026 y los campeonatos ya conquistados siguen intactos. Al empezar una temporada nueva se construye su propio calendario.
- Las Copas de Arcalis usan la **clasificación de la temporada anterior** desde 2027; en el primer año 2026 usan la clasificación histórica disponible hasta ese momento.
- Nada cambia en la base de datos de Joshua Cloud, las contraseñas, el mercado ni los guardados existentes.

> Nota: las fechas son **virtuales dentro del universo futbolístico** de Noveria: avanzan cuando completás partidos del calendario, no según la hora real del dispositivo. Antes de instalar una actualización importante, respaldá tu partida JSON.

---

# Noveria 5.4 · El Gran Mercado 24 📺⚽

**Actualización publicada el 15 de octubre de 2026.** Accedé a **📺 Mercado 24 · Fichajes** desde el menú; en celular aparece en **Más**.

## Fichar paso a paso
1. Seleccioná tu club en **Directivas y DT**. En modo DT solo se puede contratar para tu club; como presidente elegís el comprador en el mercado.
2. En **Mercado 24 · Fichajes**, si dice *Ventana cerrada*, pulsá **Abrir ventana de pases**. También se puede abrir un mercado extraordinario antes de que termine la temporada.
3. Usá el buscador con el filtro **Mostrando fichajes a tu alcance**, que presenta jugadores compatibles con tu presupuesto, los límites de plantilla y los cupos de venta. Si querés explorar a todos los jugadores, alterná **Ver todos los jugadores**.
4. Tocá **✍ Negociar**, ajustá precio, salario y años de contrato, y enviá la oferta.
5. Si hay **contraoferta**, dirigite a **Mi agenda de negociaciones** y aceptala o rechazala. Si es aceptada, el jugador pasa inmediatamente de un club a otro, y se actualizan ambos presupuestos. Si estás sin espacio en la plantilla, antes podés liberar un futbolista. También hay cesiones, agentes libres y cláusulas.
6. **Avanzar un día** permite negociar también a los demás clubes. **Simular hasta el cierre** ejecuta el resto del mercado.

## Nico Valcera · El Gran Mercado 24
El programa televisivo ficticio muestra rumores del día calculados con jugadores, clubes y presupuestos existentes en la partida. **Un rumor no es una transferencia confirmada.** Los traspasos confirmados aparecen en otra columna y corresponden a movimientos registrados. Al abrir el mercado y avanzar jornadas de pases se publican notas de rumores en el periódico, sin mover jugadores ni modificar resultados por el mero rumor.

## Compatibilidad de partidas y nube
**No borres datos del navegador ni reinicies tu partida.** La actualización mantiene el formato de guardado anterior, la jornada y el palmarés, incluidos Apertura y Recopa. La sincronización de **Joshua Cloud** y el inicio de sesión con **correo y contraseña** o código se mantienen sin cambios; no modifica `cloud-config.js`, ni claves ni tablas de Supabase.

---

# NOVERIA FOOTBALL UNIVERSE 5.1 · Prensa contextual 🎙️⚽

Noveria es un universo ficticio de fútbol con **nueve países**, **252 clubes**, ligas, copas nacionales, copas continentales, mercado de pases, modos DT y federación, cantera, estadio, prensa, archivo histórico y partidas guardadas en local/Supabase.

## 🆕 Noveria 5.1: ¡periodistas que siguen tus resultados!

- **Preguntas basadas en el rendimiento real**: último marcador, rival, rachas, posición en la liga de cada país, riesgo de descenso, pelea por el liderato, lesionados, próximos partidos, clásico interzonal, moral, directiva, mercado y cantera.
- **Tres periodistas por conferencia**, con preguntas y enfoques diversos. Cada una ofrece **tres respuestas específicas y distintas**, no cuatro frases que sirven para todo.
- Cada elección publica una declaración auténtica en los periódicos y modifica, según el mensaje, la **moral del vestuario**, la **confianza de la directiva** y el **ánimo de la afición**. En pantalla se muestran los efectos antes de responder.
- **Sin repetir infinitamente una entrevista**: tras las tres preguntas, la conferencia finaliza hasta que el club dispute otro encuentro o avance a otra temporada. El progreso, el historial y las consecuencias se guardan en el mismo JSON de la partida y Supabase si ya se configuró la nube.
- Compatibilidad con los **nueve países**, las seis jornadas históricas originales (sin inventar datos de jugadores), la Jornada 7 pendiente, Noveria Live 2D y todos los sistemas previos.
- NUEVO archivo `press-room.js`; la versión de caché del Service Worker cambia para que GitHub Pages muestre la nueva pantalla.

### Actualizar desde Noveria 5.0

Usar `Noveria_V5_1_SOLO_MODIFICADOS.zip`, extraer su contenido y subirlo a la **raíz del repositorio GitHub**, reemplazando los nombres existentes. **No** reemplazar `cloud-config.js` ni ejecutar SQL. Exportar JSON antes de subir. Preservar los demás archivos de Noveria 5.0.

## 🆕 Noveria 5.0: partidos en vivo 2D

- Podés abrir la sección **🔴 VER EN VIVO 2D**, elegir país y cualquier partido programado que esté habilitado por su jornada. También aparece el botón **Ver en vivo 2D** junto a los marcadores.
- Un partido de 90 minutos dura **dos minutos reales** a velocidad x1. Los empates decisivos de copas pueden agregar una breve prórroga visual.
- Cancha vista desde arriba, 22 jugadores en movimiento, balón animado, marcador, narración, tiros, atajadas, córners, VAR, amarillas, rojas, cambios, lesiones y estadísticas finales.
- Controles para **pausar**, **velocidad x1/x2/x4**, **sonido de estadio**, **cámaras**, **repetir gol** y **repetir el partido**. Al final, un acceso directo a **El Heraldo de Noveria**.
- **Modo DT** con órdenes tácticas ofensivas/defensivas y hasta **5 sustituciones** que pueden influir en el desenlace. No garantizan resultados.
- La vista es una **representación táctica 2D de la simulación**, no un videojuego de fútbol con física completa. Los remates, córners y acciones provienen de la ficha creada por el motor.
- Los resultados futuros **no se anotan en las tablas hasta terminar la transmisión**. Si salís antes, el directo queda pausado en la partida.
- Los partidos ya disputados se reproducen sin volver a jugarlos. Las seis jornadas históricas importadas de 2026 **no tienen goleadores o jugadas inventados**.
- Compatible con el guardado local, respaldos JSON y la sincronización Supabase ya configurada.

## Instalar o actualizar

1. Descargá el ZIP. Extraé los archivos directamente en la raíz de tu repositorio GitHub Pages.
2. Los archivos principales de la web son `index.html`, `app.js`, `engine.js`, `live2d.js`, `live-ui.js`, `styles.css`, `live2d.css` y otros módulos auxiliares.
3. **No reemplaces `cloud-config.js` si ya configuraste Joshua Cloud.** El ZIP de actualización parcial no lo incluye.
4. Publicá en GitHub y recargá. No se modifica ningún dato histórico existente.

Ver `COMO_ACTUALIZAR.md` para las instrucciones detalladas. La versión `NOVERIA-ABRIR.html` sirve para abrir una demostración autónoma sin instalar herramientas.

## Pruebas

Con Node.js: `npm test`. Incluye tests de ligas, jornadas históricas, mercado, Supabase, temporadas y modo en vivo 2D.

---

## El universo

- 9 países: Veltrania, Varkosia, Soleria, Keldria, Ravendia, Eldamar, Talmera, Zafiria y Nemeria.
- 252 clubes: **18 en Primera + 10 en Segunda** por país. Los primeros cuatro clubes extranjeros creados se conservan; los restantes completan sus federaciones.
- Primera en dos zonas de nueve. Todos contra todos ida y vuelta en la zona (16 encuentros), clásicos interzonales en jornadas 9/18 y jornadas dobles 8/17 (18 encuentros por club; 9 local/9 visita).
- Los mejores dos de cada zona pasan a semifinales a ida/vuelta, luego final ida/vuelta y Recopa a partido único ante el campeón de la tabla anual. El último de cada zona desciende y 1.º/2.º de Segunda ascienden. Segunda: 10 clubes y 18 fechas.
- Cada país extranjero tiene una Copa Nacional de 28 clubes con grupos y eliminación; Veltrania conserva su Copa de las Provincias original.
- La Copa de Campeones de Arcalis reúne a seis clasificados directos de cada país y a nueve ganadores de repechaje (7.º vs. 13.º del país vecino). Nueve grupos de siete y octavos de final con 9 líderes + 7 mejores segundos.
- Copa Horizonte: los puestos 8.º–12.º de los nueve países. Nueve grupos de cinco y eliminatorias.

## 14 expansiones del universo

1. **Centro de partido 2D:** repetición animada de partidos ya simulados, minuto a minuto, con eventos, marcador y campo. La estrategia se configura antes de simular, NO modifica retroactivamente un resultado.
2. **Prensa:** rueda de prensa con consecuencias en moral, directiva y afición.
3. **Mercado avanzado:** ofertas, contraofertas, mercado automático, cierre, cesiones anuales, jugadores libres, cláusulas y rescisión de contratos.
4. **Aficiones:** ánimo, capacidad, asistencias e historial de rivales.
5. **Cantera:** promesas, entrenamiento, ascenso de juveniles y liga Sub-20.
6. **Directivas:** confianza, destituciones automáticas, cambios de entrenador y elecciones de presidentes entre temporadas.
7. **Museo:** historial de títulos, campeones y temporadas.
8. **Árbitros y VAR:** árbitros ficticios, tarjetas, revisiones y disciplina.
9. **Estadios y finanzas:** expansión del aforo, ingresos por taquilla, mejoras de enfermería, ojeadores y academia.
10. **Gala de premios:** Bota de Oro, Balón de Oro, Guante de Oro, jugador revelación y mejor entrenador según datos generados.
11. **Periódicos deportivos:** El Heraldo, Tribuna Popular y Radar de Fichajes.
12. **Rivalidades:** estadísticas cara a cara que se actualizan con cada encuentro nuevo.
13. **Editor de torneos:** liga, doble vuelta, copa, Recopa, grupos y Apertura de dos zonas, con premio configurable.
14. **Carrera de entrenador:** perfil, clubes dirigidos, reputación, ofertas de otros clubes y la posibilidad de cambiar de equipo.

No incluye selecciones nacionales ni Mundial, por petición del creador.

## Partida histórica

Se mantienen exactamente **78 partidos y 199 goles** de las seis jornadas originales de Veltrania. La **Jornada 7** sigue pendiente. Los nuevos países reciben sus seis primeras jornadas recreadas de forma determinista para que estén sincronizados con Veltrania; no alteran su palmarés de cero títulos al inicio. Las seis jornadas originales no tienen goles de jugadores inventados; sus estadísticas individuales comienzan con las nuevas simulaciones.

## Guardado

El progreso se guarda automáticamente de forma local, con `localStorage` e `IndexedDB` cuando el navegador los permite. IndexedDB tiene más espacio para las nuevas ligas. Se recomienda exportar una copia de la partida JSON desde **Palmarés y partida** antes de actualizar o cambiar de dispositivo. GitHub Pages sirve los archivos pero **no sincroniza las partidas entre dispositivos**; la sincronización remota queda pendiente.

## Despliegue GitHub Pages

1. Descargá el ZIP completo y extraelo, o el ZIP de actualización con los archivos nuevos/modificados.
2. Colocá su contenido en la raíz del repositorio `joshuadev2007/noveria-football-universe`, reemplazando los archivos que coincidan. No subas la carpeta envolvente ni el ZIP sin descomprimir.
3. Confirmá los cambios en `main`.
4. Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save.
5. Abrí la página publicada. Si seguís viendo una edición anterior, usá Ctrl+F5 o cerrá y abrí la PWA para renovar la caché del Service Worker.

### Alternativa con PowerShell (repositorio clonado)

```powershell
git add .
git commit -m "Noveria 4.0 - Federaciones de Arcalis"
git push origin main
```

## Archivos principales

- `data.js`: clubes y marcadores históricos de Veltrania.
- `engine.js`: partidos, tabla nacional, Copa veltrana, torneo personalizado, mercado y temporadas.
- `continent.js`: ocho federaciones adicionales, ligas, copas, semifinales, finales y Recopas.
- `international.js`: competiciones de clubes de Arcalis.
- `ecosystem.js`: cantera, prensa, afición, estadio, premios y carrera de DT.
- `market-extra.js`: cesiones, cláusulas, agentes libres y rescisiones.
- `save-system.js`: partidas y puntos de recuperación.
- `app.js`, `styles.css`: interfaz.
- `assets/`: imagen local de afición e ícono.
- `service-worker.js` y `manifest.webmanifest`: experiencia instalable.
- `NOVERIA-ABRIR.html`: edición autónoma para pruebas locales.

## Pruebas

Con Node.js 22+:

```bash
npm test
```

La suite comprueba el calendario, el historial, clubes, competiciones, mercado, temporadas, las 9 naciones, interfaz simulada y guardado. La revisión visual con navegador real depende del entorno; no se debe asumir como verificada por las pruebas unitarias.

## Licencias y aclaraciones

El universo, los clubes y sus nombres son ficticios. Esta es una simulación deportiva y **no incluye fútbol 3D**. La repetición 2D representa los eventos ya calculados, y no es un motor de juego en tiempo real donde se puedan modificar resultados con una pausa. Las fotografías remotas, cuando están disponibles, son ilustrativas; `assets/aficion-noveria.webp` funciona de respaldo local.

## NOVERIA 4.1 — Sincronización entre PC y móvil con Supabase

- `SUPABASE_SETUP.sql`: copiar y ejecutar en Supabase SQL Editor. Crea tabla con RLS y función de guardado atómica; cada cuenta ve solo su partida.
- `cloud-sync.js`: cliente sin dependencias externas, autenticación por email, tokens refrescados, respaldo y sincronización diferida con detección de conflictos.
- `cloud-config.js`: configuración opcional global con la **URL** de Supabase y la **publishable/anon key** (públicas). Nunca usar la secret/service_role key.
- Alternativa: introducir ambos valores en el menú **Nube y sincronización** una vez por dispositivo.
- El primer inicio de sesión NO borra nada: se elige subir la partida local o bajar la remota; conflictos requieren decisión explícita.
- Los cambios de una cuenta se guardan en `public.noveria_saves` (JSONB + revisión). Al abrir otro dispositivo con el mismo usuario se recupera la partida más reciente si no hay modificaciones locales divergentes.
- Sin Supabase configurado sigue funcionando todo como antes con guardado local y exportación/importación JSON.
- GitHub Pages aloja el cliente web pero NO aloja datos privados. Los archivos estáticos se pueden publicar en Pages. El progreso se sincroniza por Supabase cuando se haya ejecutado SQL, configurado Auth y conexión.
- Se recomienda usar Noveria por HTTPS (GitHub Pages) y respaldar la partida JSON antes de sincronizar por primera vez.

**Configurar Supabase en 5 minutos:**
1. Crear un proyecto en [Supabase](https://supabase.com/dashboard) (también podés usar uno existente, con RLS y tabla propia para Noveria).
2. En SQL Editor ejecutar todo el contenido de `SUPABASE_SETUP.sql`.
3. En Authentication → Providers comprobar que Email está habilitado. Si Supabase envía confirmación, confirmá el correo recibido al crear la cuenta.
4. En Project Settings → API Keys copiar **publishable/anon key** (no `service_role` ni `secret`) y Project URL. Pegarlos en **Nube y sincronización** dentro de Noveria; o definirlos en `cloud-config.js` y publicar ese archivo.
5. Crear una cuenta de Noveria con correo/contraseña, entrar, y tocar **Subir mi partida actual** (o **Usar partida de la nube** si ya existe). Después ingresar con la misma cuenta en el celular. Exportar JSON antes de elegir.

Si el servidor devuelve error de función inexistente, ejecutá el SQL o recargá el esquema de la API en Supabase. No publicar las claves secretas ni las contraseñas en GitHub.


## NOVERIA 4.2 — Correo sin contraseña y configuración global

- Login passwordless: Supabase envía OTP por correo o un enlace mágico. Si llega código, se verifica dentro del juego; si llega enlace y está permitido en Auth → Redirect URLs, Noveria recupera la sesión al abrirlo.
- **Configurar una sola vez por web:** editar `cloud-config.js` en el repositorio con Project URL y la *publishable/anon key pública* de Joshua Cloud. Esto elimina la necesidad de pegar claves por dispositivo. Nunca usar claves secret/service_role.
- La sesión sobrevive normalmente al cierre del navegador mientras el refresh token siga vigente. El correo se verifica al iniciar sesión en un dispositivo nuevo.
- Conservar el template de otras aplicaciones: no reemplazar la plantilla de Magic Link; añadir a Redirect URLs la URL de Noveria. Si se desea OTP numérico, agregar `{{ .Token }}` al template existente sin borrar `{{ .ConfirmationURL }}`.
- No hay cambios al esquema `noveria_saves`, ni a los campeonatos o los resultados.
- Instrucciones completas en `CONFIGURAR_NUBE.md`.


## NOVERIA 5.2 — El mundo recuerda a sus campeones 🏆

- **Global visible:** en semifinales y finales de ida y vuelta en Veltrania, las demás federaciones y torneos especiales Apertura. Se muestran marcadores agregados parciales y finales, respetando las tandas de penales registradas.
- **Portada extraordinaria:** al inscribirse un nuevo campeón en el palmarés, se genera una edición con el nombre del club y un resultado final comprobable cuando está disponible. La edición se guarda en `footballExperience` junto a su llave única, sin duplicados. Los títulos antiguos de tu partida reciben su portada al actualizar, incluido el Apertura 2026 de Unión Popular Aurena; no se modifican resultados.
- **Ceremonia del campeón:** trofeo, animación y accesos directos al periódico y la conferencia.
- **Prensa para todos los torneos:** menú para elegir Liga, Copa Nacional, Fase final/Recopa, Copa de Campeones, Horizonte o torneos personalizados en los que el club participe; cada torneo tiene su propio historial de conferencia y preguntas.
- **Web más ágil:** periódico limitado a 24 noticias por página, filtros por temática e índice de partidos en memoria mientras consultas actas.
- **Sin cambios en Supabase:** `cloud-config.js` no se incluye en el ZIP de actualización. Todos los datos nuevos viven en el JSON de partida actual dentro de las tablas ya instaladas.
- **Respaldos:** exportá JSON antes de la actualización y esperá la confirmación de sincronización global antes de cambiar de dispositivo. No borres el almacenamiento del sitio.
