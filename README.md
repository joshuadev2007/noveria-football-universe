# NOVERIA Football Universe 4.0 — ARCALIS

Simulador de fútbol ficticio en español, estático y compatible con GitHub Pages. Sin frameworks ni instalación de dependencias: `index.html`, `app.js`, `engine.js`, `data.js`, módulos de mundo, CSS, activos locales y guardado local.

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
