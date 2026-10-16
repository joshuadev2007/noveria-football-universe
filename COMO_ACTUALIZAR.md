# ACTUALIZAR DE NOVERIA 3.1 A NOVERIA 4.0

**Antes de actualizar:** abrí tu web actual y elegí `Palmarés y partida → Descargar copia JSON`. Guardá ese archivo en tu computadora.

1. Descargá `Noveria_V4_SOLO_ARCHIVOS_MODIFICADOS.zip`.
2. Extraé su contenido. No hace falta crear otro repositorio.
3. Entrá a `https://github.com/joshuadev2007/noveria-football-universe` y subí los archivos nuevos y modificados al directorio raíz de `main`. Si GitHub solicita confirmación, reemplazá los archivos existentes. Si preferís PowerShell, sobrescribí los archivos dentro de tu copia local y ejecutá `git add .`, `git commit -m "Noveria 4.0 - Arcalis"`, `git push origin main`.
4. Cuando Pages publique, entrá al **mismo enlace anterior**. Si continúa la versión vieja, recargá con Ctrl+F5 o cerrá/reabrí la app instalada.
5. Revisá `Palmarés y partida` y verificá que tu partida esté conservada. Si no aparece, importá la copia JSON que guardaste.

**No debes subir:** los ZIP cerrados, directorios de scripts de desarrollo ni la carpeta exterior que contiene los archivos. Subí su contenido.

**NUEVO:** `continent.js`, `international.js`, `ecosystem.js`, `market-extra.js`. Se requiere mantener `data.js`, `save-system.js` y `assets` existentes.

**El guardado es local:** GitHub Pages no almacena automáticamente tu progreso remoto. IndexedDB proporciona más capacidad, pero cambiar de navegador requiere exportar/importar JSON. Los 78 resultados históricos y la Jornada 7 pendiente están incorporados en la partida base. No se inventan goleadores individuales de esas seis primeras jornadas.
