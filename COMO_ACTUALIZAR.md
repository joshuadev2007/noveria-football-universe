# ACTUALIZACIÓN NOVERIA 3.1 — Guardado de partidas

## Antes de instalar
1. Entrá a tu Noveria actual en **el mismo navegador donde jugás**.
2. Abrí **Palmarés y partida → Descargar copia JSON**. Guardá el archivo antes de cambiar código.
3. No borres los datos del navegador ni la caché de almacenamiento del sitio.

## Actualizar GitHub Pages
El ZIP COMPLETO es el recomendado (el repositorio público podría seguir con archivos V2).

1. Descomprimí `Noveria_Football_Universe_V3_1_COMPLETO.zip`.
2. Entrá al repositorio `joshuadev2007/noveria-football-universe`.
3. Subí a la raíz **todo el contenido del ZIP**, incluyendo `save-system.js`, `app.js`, `styles.css`, `service-worker.js`, `index.html`, `engine.js`, `data.js` y `assets/`. Reemplazá los archivos existentes.
4. Confirmá con **Commit changes**. Si usás PowerShell/Git, poné los archivos en tu clon y ejecutá `git add .`, `git commit -m "Noveria 3.1: guardado automático y recuperación"` y `git push origin main`.
5. Abrí la web publicada. Si ves una edición anterior, recargá la página. GitHub Pages publica el código, no tu progreso.

## Después de instalar
- El guardado es **automático** al jugar o gestionar clubes.
- Revisá el aviso «✓ Partida guardada».
- **Palmarés y partida** también permite: Guardar ahora, crear un punto seguro, restaurarlo, pedir protección del almacenamiento y exportar/importar JSON.
- Cuando vuelvas a abrir **la misma web en el mismo navegador**, tu progreso estará disponible, salvo que se hayan borrado datos del sitio o el navegador haya limpiado el almacenamiento.
- Para pasar a otro dispositivo, **exportá la partida en JSON e importala** allí. Esta edición **NO sincroniza** entre dispositivos ni escribe en tu repositorio automáticamente.

## Seguridad
No compartás tu archivo de guardado si no querés divulgar tu progreso. No modifiques `STORAGE_KEY`: sigue siendo `noveria-universe-save-v1` por compatibilidad.
