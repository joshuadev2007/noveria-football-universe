# ☁ NOVERIA 4.2 — entrar con el correo y guardar en Joshua Cloud

Esta versión usa **el mismo proyecto Supabase de Joshua Cloud**. No requiere otro proyecto, ni volver a ejecutar el SQL si ya apareció `Success` al ejecutar `SUPABASE_SETUP.sql`.

## ANTES DE ACTUALIZAR: protege tu progreso

Desde Noveria 4.1 o anterior abrí **Palmarés y partida → Descargar JSON**. Guardá el archivo en tu PC. Subir una versión nueva a GitHub Pages no debe borrar la partida local, pero siempre conservá el JSON como respaldo independiente.

## 1. Configurar la URL y clave pública UNA SOLA VEZ en GitHub

En el repositorio `joshuadev2007/noveria-football-universe`, abrí `cloud-config.js` y tocá **Edit** (ícono de lápiz). Reemplazá las dos cadenas vacías por estos datos **PÚBLICOS** de Joshua Cloud:

```js
export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_TU_CLAVE_PUBLICA';
```

Reemplazá los valores de ejemplo por **Project URL** y **publishable key** reales, desde Supabase → Joshua Cloud → Project Settings / API Keys o Connect. Hacé **Commit changes**.

**Nunca publiques `service_role`, `sb_secret_`, claves secretas, contraseñas ni tokens de sesión**. Una anon/publishable key se diseñó para utilizarse en clientes públicos, siempre que la tabla tenga RLS (el SQL incluido la habilita). El archivo `cloud-config.js` solo lleva esos dos datos públicos.

Después de publicar esa configuración, al abrir **☁ Nube y sincronización** desde PC o móvil aparecerá **el formulario para ingresar el correo** directamente. Ya no hay que pegar la URL o clave desde cada dispositivo. Si dejás ambas cadenas vacías, Noveria seguirá ofreciendo el formulario manual de configuración local, por compatibilidad con la versión anterior.

## 2. Ingresar sin contraseña: usá el enlace o código del email

En el menú **Nube y sincronización** tocá **Enviarme un código**, escribí tu correo y abrí el email de Supabase. No necesitás crear otra contraseña. Si ese email ya corresponde a un usuario de Joshua Cloud Auth, accederás **a esa misma identidad** (mismo `auth.users.id`); no cambia la contraseña ni las tablas de las otras apps.

### Opción A — Mantener la plantilla actual (recomendado si la usan otras apps)

Si el email de Supabase contiene un **enlace mágico**, no cambies la plantilla que usa Joshua Cloud. Solo agregá una **nueva URL permitida**, sin reemplazar las actuales:

Supabase → **Authentication → URL Configuration → Redirect URLs** → **Add URL**:

`https://joshuadev2007.github.io/noveria-football-universe/`

Abrí el enlace que llegue al correo. Regresará a Noveria, iniciará sesión y podrá descargar o subir la partida. Si aparece el formulario para introducir código pero el correo contiene únicamente un enlace, **usá el enlace**; el formulario no es necesario.

Importante: no cambies **Site URL** si está configurada para alguna de tus otras aplicaciones. Solo añadí una Redirect URL permitida.

### Opción B — Código numérico (sin salir de la web)

Si preferís introducir un código directamente, podés añadir el token a la plantilla **Magic Link / OTP** de **Authentication → Email Templates**, conservando el HTML y el enlace de confirmación existentes:

```html
<p>Tu código de acceso para Noveria es: <strong>{{ .Token }}</strong></p>
```

No borres `{{ .ConfirmationURL }}` ni el resto de la plantilla, así también siguen funcionando las otras aplicaciones que usan enlaces. Si el proveedor de email envía un OTP de 6 u 8 dígitos, introducilo en Noveria.

Los envíos tienen límites de frecuencia; no pulses «Reenviar código» varias veces de inmediato.

## 3. Primera sincronización con cuidado

- **En la PC que tiene tu partida más avanzada:** iniciá sesión, exportá el JSON, y tocá **Subir mi partida actual** solo si esta cuenta todavía no tiene partida en la nube. Si existe otra, Noveria te pedirá decidir qué versión conservar.
- **En el celular:** iniciá sesión usando **el mismo correo** y elegí **Usar la partida de la nube** cuando corresponda.
- Después, la app sincroniza modificaciones y mantiene un respaldo local. Debés tener conexión y no editar simultáneamente la misma partida en ambos dispositivos.

La contraseña no hace falta; el código o enlace prueba que tenés acceso al correo. La sesión normalmente se conserva al volver a abrir la página, hasta que cierres sesión, se revoque, caduque el refresh token o se borren los datos del navegador.

## 4. Archivos a actualizar

Subí el contenido de `Noveria_V4_2_SOLO_MODIFICADOS.zip` a la raíz de GitHub, reemplazando los archivos coincidentes. **Editá `cloud-config.js` con tus dos datos públicos después de subir**, sin volver a dejarlo en blanco en futuras actualizaciones. Recargá la PWA, o pulsá Ctrl + F5 en el navegador si muestra una versión anterior.

La tabla `noveria_saves` sigue igual y se conserva el historial deportivo. **NO vuelvas a ejecutar SQL ni restablezcas la base** para esta actualización.

## Errores habituales

- **No aparece email login:** comprobá que `cloud-config.js` tenga la URL y publishable key correctas y que GitHub Pages haya actualizado a la versión 4.2.
- **El enlace abre otra aplicación:** falta añadir la dirección de Noveria a Redirect URLs; pedí un correo nuevo después de actualizar la lista.
- **No aparece código:** tu plantilla envía un enlace; abrilo o agregá `{{ .Token }}` conservando el enlace original.
- **«OTP expired/invalid»:** pedí un código nuevo y usá el más reciente.
- **«Email rate limit exceeded»:** aguardá el tiempo indicado por Supabase antes de solicitar otro email.
- **«Permission denied» / error 404 al guardar:** verificar que `SUPABASE_SETUP.sql` ya se ejecutó y que RLS/función están publicadas.
- **Se ve otra partida:** antes de sobrescribir nada, exportá el JSON y elegí explícitamente la versión correcta.
