# NOVERIA FOOTBALL UNIVERSE 6.0 — 52 MEJORAS Y REVISIONES

La actualización combina **mejoras nuevas**, elementos **mejorados** y sistemas ya presentes que se **revisaron**. No sería correcto presentar los 52 como funciones recién creadas. El motor sigue siendo un simulador sencillo, no un clon de EA SPORTS FC.

## Dirección deportiva — 10

1. **Revisado:** Once titular editable por puesto.
2. **Revisado:** Banca de siete futbolistas.
3. **Revisado:** Reservas convocables.
4. **Revisado:** Cinco formaciones.
5. **Revisado:** Capitán configurable.
6. **Revisado:** Alineaciones persistentes.
7. **Revisado:** Alineación aplicada en Live 2D.
8. **Revisado:** Afinidad por posición.
9. **Revisado:** Optimización automática del XI.
10. **Nuevo:** Rotación automática de jugadores cansados.

## Realismo sobre el césped — 20

11. **Nuevo:** Condición física individual que queda en la partida.
12. **Nuevo:** Ritmo competitivo (sharpness) de los jugadores.
13. **Nuevo:** Química del once inicial.
14. **Mejorado:** Siete estilos tácticos tienen consecuencias.
15. **Nuevo:** Ventajas y desventajas según tácticas rivales.
16. **Nuevo:** Influencia del ambiente de localía.
17. **Nuevo:** Cuatro climas ficticios reproducibles por partido.
18. **Nuevo:** El clima cambia el potencial ofensivo.
19. **Nuevo:** El clima aumenta o reduce el desgaste físico.
20. **Nuevo:** El periódico registra el clima de la jornada.
21. **Nuevo:** El físico y la química influyen en la fuerza de los equipos.
22. **Nuevo:** La presión alta consume más energía.
23. **Nuevo:** La prórroga supone cansancio extra.
24. **Nuevo:** Los veteranos se cansan algo más.
25. **Nuevo:** El desgaste depende de los minutos en cancha.
26. **Nuevo:** La banca conserva energía al descansar.
27. **Nuevo:** Recuperación calculada según los días de calendario.
28. **Mejorado:** La enfermería favorece la recuperación.
29. **Nuevo:** Recuperación física durante la pretemporada.
30. **Nuevo:** Probabilidad de lesión más alta si el plantel está agotado.

## Vestuario, disciplina y planificación — 10

31. **Nuevo:** Plan de entrenamiento Recuperación.
32. **Nuevo:** Plan de entrenamiento Equilibrado.
33. **Nuevo:** Plan de entrenamiento Intensivo.
34. **Nuevo:** Intensivo mejora el ritmo a cambio de cansancio.
35. **Nuevo:** Suspensiones al acumular cinco amarillas.
36. **Mejorado:** Expulsiones acarrean sanciones.
37. **Nuevo:** Un capitán titular aporta moral tras ganar.
38. **Nuevo:** Una racha de cuatro triunfos refuerza la confianza.
39. **Nuevo:** Una racha de cuatro derrotas preocupa a la directiva.
40. **Nuevo:** Estadísticas deportivas separadas por Apertura y Clausura.

## Objetivos de la directiva — 10

41. **Nuevo:** Objetivo de victorias.
42. **Nuevo:** Objetivo de desarrollo de juveniles.
43. **Nuevo:** Objetivo de buena racha.
44. **Nuevo:** Objetivo de sostenibilidad económica.
45. **Nuevo:** Objetivo de porterías a cero.
46. **Nuevo:** Objetivo de goles marcados.
47. **Nuevo:** Objetivo de asistencia de aficionados.
48. **Nuevo:** Objetivo de moral del vestuario.
49. **Nuevo:** Objetivo de puntos de liga reales.
50. **Nuevo:** Objetivo de rotación y condición física.

## Integridad y publicación — 2

51. **Verificado:** Tres ediciones completas con los nueve países sin atascar el calendario.
52. **Verificado:** 78 resultados iniciales preservados; versión y caché PWA renovadas.

## Cómo aprovecharlas

- **Alineación y banca:** ajustá formación, suplentes, capitán, estilo, plan de entrenamiento y botón de rotación.
- **Calendario maestro:** revisá la previa antes de simular, con clima, química, físico y bajas.
- **Mi carrera DT:** seguí objetivos, grado global y recomendaciones del cuerpo técnico.
- **Resultados y actas:** conservan el estilo original con marcadores visibles y periódicos de cada encuentro.
- **Nube / Palmarés:** conservá tus títulos y exportá un JSON antes de empezar a jugar con la nueva versión.

## Pruebas y límites

Simulamos las ediciones Apertura 2026 (38 fechas), Clausura 2027 (44) y Apertura 2027 (44), incluidas las fases finales y copas, y se conservaron los 78 resultados históricos del primer torneo. Además agregamos `tests-realism-60.mjs`. El clima y las tácticas afectan **únicamente partidos nuevos**. Estas comprobaciones no sustituyen la prueba visual en tu navegador personal.
