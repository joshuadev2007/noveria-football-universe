# NOVERIA Football Universe ⚽🌍

**Simulador original de fútbol ficticio**. Primer lanzamiento jugable: **Apertura 2026, Jornada 7**. Todos los clubes empiezan con **cero títulos**.

> Este proyecto es independiente de Reino Rojinegro; no modifica ni necesita sus archivos.

## Qué incluye esta edición 3.1 jugable

- **60 clubes**, nueve países de Arcalis, 18 clubes de Primera (zonas A/B), 10 de Segunda y 32 internacionales.
- Historia **real del juego** importada: partidos y tablas de las jornadas 1 a 6, sin modificar sus marcadores.
- **Jornadas 7–18 simulables**, marcadores independientes y motor por valoraciones, táctica, moral, localía y azar: **no hay victoria garantizada**.
- **Jornadas dobles 8 y 17**; clásicos interzonales 9 y 18. Calendario completo validado sin cruces repetidos en cada vuelta, con 9 localías y 9 visitas por equipo de Primera.
- Tablas automáticas de Zona A, Zona B, general/«Escudo de Oro» y Segunda. Último de cada zona de Primera desciende; los dos primeros de Segunda ascienden.
- **Semifinales, final ida/vuelta y Recopa** después de la Jornada 18; el ganador del Apertura suma 10.000 VLR a su premio y recibe un título.
- **Periódico «El Heraldo de Noveria» por partido nuevo**: titular, resultado, crónica, minuto a minuto, goles, asistencias, tarjetas, cambios, lesiones, posesión, tiros, xG, faltas, córners, alineaciones, notas de futbolistas y tácticas. **Imprimir** permite guardar como PDF.
- Cada club tiene escudo gráfico provisional, entrenador, presidente, director deportivo, estadio, afición, tácticas, moral, confianza y presupuesto.
- **1320 futbolistas generados** (22 por cada uno de los 60 clubes), con OVR, potencial, edad, posición, dorsal, nacionalidad, valor, rendimiento, partidos, goles, asistencias y tarjetas.
- **Editor de los tres uniformes** de cada club: colores, rayas, aros, mitades, banda, liso y patrocinador ficticio.
- Gestión de DT: **destituir y nombrar entrenador**, cambios de alineación/táctica, **mercado negociado**, ojeadores, ofertas y contraofertas. Algunas directivas pueden despedir al DT tras rachas de cuatro derrotas.
- **Copa de las Provincias**: 7 grupos de 4, avanzan 14 primeros y segundos más 2 mejores terceros; octavos, cuartos, semifinal y final.
- **Constructor avanzado de competiciones**: 5 formatos: liga una vuelta, liga ida/vuelta, copa eliminatoria (con pases libres automáticos), Recopa/final neutral a partido único, y copa por grupos de cuatro con fase eliminatoria. De 2 a 32 clubes según el formato.
- **Resultados automáticos después de simular**: panel inmediato de la jornada con cada marcador, estadísticas disponibles, goleadores e hipervínculo a **El Heraldo de Noveria** para cada partido. También se pueden abrir jornadas históricas.
- **Ambiente de fútbol**: aficiones y estadios en portadas, páginas de clubes, centro de resultados, sección de copas y periódicos. Las fotografías reales opcionales solo ilustran el ambiente, no representan a los clubes ficticios. Se incluye fondo gráfico local para funcionar sin internet.
- **Palmarés**, noticias, seguimiento editorial de **Unión Popular Aurena sin favoritismo**, vista móvil, soporte de aplicación instalable (PWA) y copia de seguridad JSON.

## Nuevo mercado automático — edición 3.0

- **Modo DT:** gestioná solo tu club y negociá con otros clubes; **modo presidente:** podés elegir cualquier club y su presupuesto.
- **Ventanas de 12 días:** abrí mercado, avanzá un día con fichajes autónomos o simulá todos los días hasta el cierre. El **último día** tiene más negociaciones. Al acabar Jornada 18 se abre automáticamente la primera ventana post-Apertura.
- **Mesa de negociaciones:** oferta al club vendedor (millones VLR), salario mensual (miles VLR), duración de 1–5 años. El vendedor acepta, rechaza o pide una contraoferta; podés aceptarla o declinarla.
- **Finanzas reales dentro del juego:** la compra reduce el presupuesto disponible del comprador y aumenta el del vendedor. El motor impide compras sin saldo, venta de plantillas de 17 o menos y plantillas receptoras de más de 30.
- **Ojeadores:** buscador internacional con filtros de posición, potencial, valoración y precio, más lista de seguimiento personal.
- **Cantera y entrenamiento:** podés promover juveniles con potencial o mejorar tres promesas por ventana, a cambio de recursos del club. Los futbolistas jóvenes también pueden mejorar espontáneamente al cierre de una ventana.
- **Lesiones con duración:** las nuevas lesiones causan bajas durante próximos partidos; los DT ajustan automáticamente sus alineaciones. Las crónicas capturan la alineación y el entrenador en la fecha en que se jugó, no la plantilla actual.
- **Crónicas del mercado:** cada fichaje aparece en el periódico, con clubes, precio y contrato. Se conserva el historial y el resumen de cada ventana.
- **Temporadas sucesivas:** una vez concluidas final, Recopa y ventana de pases, podés empezar el siguiente Apertura. Se intercambian dos equipos ascendidos y dos descendidos, renueva el calendario de 18 jornadas, crecen edades y presupuestos y las temporadas anteriores quedan archivadas con sus partidos.
- **Migración sin borrar:** el guardado anterior `noveria-universe-save-v1` sigue siendo compatible; se añaden los nuevos campos al cargar. **Exportá un JSON ANTES de actualizar por seguridad.**

## Novedad 3.1 — guardado reforzado en GitHub Pages

- **Autosave en cada decisión:** la fecha, resultados, fichajes, salarios, contratos, cantera, entrenadores, uniformes y nuevas temporadas se escriben automáticamente.
- **Doble almacenamiento local:** guarda una copia JSON compatible con V1–V3 en `localStorage` y otra copia más robusta en **IndexedDB**; si una falla, la app intenta recuperar la otra.
- **Al volver al enlace desde el mismo navegador y dispositivo**, la app carga la última copia válida y muestra «✓ Partida guardada» con la hora de guardado.
- **Panel «Palmarés y partida»:** botón Guardar ahora, crear/restaurar punto de recuperación manual, solicitar almacenamiento persistente al navegador, exportar copia JSON e importarla.
- **No hay sincronización con GitHub ni entre dispositivos:** GitHub Pages aloja HTML/JS/CSS, nunca tu partida de forma privada. Para pasar progreso de la computadora al celular, exportá JSON e importalo allí. No borres los datos del sitio ni uses incógnito para jugar partidas permanentes.
- En versiones anteriores que tenían partidas en el mismo dominio, la migración se hace automáticamente **sin borrar las partidas ni inventar resultados**. Conviene exportar JSON antes de actualizar como precaución.

## Limitaciones actuales (importante)

- **El guardado usa `localStorage` e IndexedDB en este navegador**, no sincroniza entre dispositivos. Usá **Palmarés y partida → Descargar copia JSON** para respaldos. La partida se puede importar después.
- Las jornadas 1–6 contienen **marcadores oficiales de nuestra historia**; no existían actas de jugadores ni goleadores. **No se inventan** datos individuales retroactivos.
- El sistema es **simulación basada en eventos y datos**, no un juego 3D ni una retransmisión con animación de jugadores en tiempo real.
- La Copa de Campeones de Arcalis y la Copa Horizonte figuran con sus criterios de clasificación veltranos; sus **formatos internacionales oficiales aún deben definirse**, por eso todavía no están automatizados. El constructor permite organizar torneos personalizados con clubes extranjeros.
- Los escudos son **provisionales generados mediante colores/iniciales**; más adelante se pueden reemplazar por diseños exclusivos.
- Plantillas iniciales ficticias; no se imputan estadísticas individuales pasadas.
- El modo DT ya permite negociaciones y contratos de fichajes; los contratos existentes no vencen todavía ni hay sistema de préstamos o agentes libres.
- **Las nuevas temporadas ya avanzan con dos ascensos y dos descensos** cuando terminan Recopa y mercado. La edición 3.0 no simula todavía clasificatorias internacionales oficiales ni segunda división de otros países.

## Abrir en un clic sin instalar nada

En el ZIP incluimos **`NOVERIA-ABRIR.html`**: es la versión portátil/autónoma. Podés abrirla en Chrome/Edge desde una laptop. Puede depender de las políticas de almacenamiento de archivos locales del navegador; usá copias de seguridad. En algunos celulares es mejor abrir la versión publicada en un sitio HTTPS.

## Publicar con GitHub Pages (sin npm, sin compilación)

1. Entrá a tu GitHub, creá **un repositorio nuevo** llamado `noveria-football-universe` (podés marcarlo **Public** para GitHub Pages gratis).
2. Descomprimí `Noveria_Football_Universe.zip` y subí **el contenido de esta carpeta**, no el ZIP, desde **Add file → Upload files**. Es importante que `index.html`, `app.js`, `engine.js`, `data.js`, `styles.css` y la carpeta `assets` queden en la raíz.
3. Hacé **Commit changes**.
4. Entrá a **Settings → Pages → Build and deployment → Deploy from a branch**, elegí `main` y `/(root)` y guardá.
5. Esperá a que GitHub muestre la dirección publicada. Podés instalar la web desde el menú del navegador si tiene disponible «Agregar a pantalla de inicio» o «Instalar aplicación».

**Si preferís Cloudflare Pages:** conectá el repositorio desde Cloudflare, seleccioná proyecto estático sin comando de compilación y directorio de salida raíz `.`. No se necesitan claves.

## Desarrollo / pruebas

No hay dependencias npm. Los archivos ES module (`index.html` + `app.js` etc.) requieren un servidor estático para trabajar localmente.

```bash
python -m http.server 8080
# Abrir http://localhost:8080
```

Pruebas del motor si tenés Node.js:

```bash
node tests.mjs
node tests-upgrade.mjs
node tests-market.mjs
node tests-seasons.mjs
node tests-save.mjs
```

Las pruebas revisan: 60 clubes, historial importado, 252 encuentros de ligas, localías, jornadas dobles, clásicos, simulación hasta jornada 18, fase final, Recopa, Copa Nacional, fichajes y competiciones personalizadas.

## Estructura

| Archivo | Función |
|---|---|
| `index.html` | Entrada para hosting |
| `styles.css` | Diseño adaptable premium |
| `data.js` | Identidades de los 60 clubes y calendario íntegro |
| `engine.js` | Reglas, simulación, datos, rankings, noticias y títulos |
| `app.js` | Interfaz, periódico deportivo y controles de guardado |
| `save-system.js` | Autosave redundante localStorage/IndexedDB, recuperación y protección |
| `tests-save.mjs` | Comprobación de guardado y compatibilidad de partidas antiguas |
| `assets/icon.svg` | Icono de aplicación |
| `assets/aficion-noveria.webp` | Imagen gráfica local de ambiente futbolero |
| `tests-upgrade.mjs` | Pruebas de los cinco formatos adicionales |
| `tests-market.mjs` | Pruebas de negociaciones, finanzas, IA del mercado, cantera y compatibilidad |
| `tests-seasons.mjs` | Pruebas de temporada 2027, ascensos, descensos y calendario |
| `service-worker.js`, `manifest.webmanifest` | Instalable/offline en hosting compatible |
| `NOVERIA-ABRIR.html` | App autónoma para probar sin instalación |
| `tests.mjs` | Pruebas automáticas |

**Proyecto de ficción de Josh × Kaiu.** El mundo arranca sin títulos y la historia se decide jugando.

## Fotografía de afición (solo referencia visual)

Esta aplicación utiliza como fuente opcional de imágenes de ambiente fotografías de Unsplash. Se cargan desde sus URL cuando existe conexión; el proyecto sigue funcionando sin ellas. **No representan a clubes ficticios de Noveria.**

- [Estadio con banderas de afición — Unsplash](https://unsplash.com/pt-br/fotografias/um-estadio-cheio-de-gente-assistindo-a-um-jogo-de-futebol-NpELykTsRl8).
- [Grada y banderas — Unsplash](https://unsplash.com/photos/crowd-cheering-with-a-banner-at-a-stadium-L_Z0Sb2xcj0).

Los escudos, jugadores y clubes son originales y ficticios; las imágenes de estadio son atmosféricas.

## Novedades importantes de la versión 2

1. Al pulsar **Simular jornada**, la aplicación **no simula otra fecha extra ni pasa directamente al menú**: abre Resultados y actas con todos los encuentros de la fecha jugada.
2. Cada marcador ofrece **Leer el periódico**, con el relato completo del partido generado en la aplicación.
3. Todas las estadísticas y resultados previos de las seis jornadas iniciales siguen intactos, conservando sus 78 partidos y 199 goles. La Jornada 7 sigue sin disputarse en una partida nueva.
4. Los torneos personalizados tienen campeones, actas, clasificaciones cuando corresponde y palmarés; no sustituyen ni cambian la Recopa Veltrana oficial.
5. Esta nueva versión utiliza la **misma clave local de guardado** que la anterior. Al actualizar desde GitHub Pages en el mismo navegador y dominio, el progreso existente se conserva; de todos modos, exportá un JSON como respaldo antes de grandes actualizaciones.
